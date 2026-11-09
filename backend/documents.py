import hashlib
import io
import os
import re
import sqlite3
import uuid
import zipfile
import unicodedata
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

import pymupdf
from docx import Document
from docx.opc.exceptions import PackageNotFoundError
from fastapi import HTTPException, UploadFile
from lxml.etree import XMLSyntaxError
from starlette.concurrency import run_in_threadpool

MAX_DOCUMENT_BYTES = 20 * 1024 * 1024
MAX_DOCUMENT_PAGES = 500
MAX_DOCUMENT_TEXT_CHARS = 2_000_000
MAX_DOCUMENTS_PER_CONVERSATION = 5
CHUNK_SIZE = 1200
CHUNK_OVERLAP = 180
MAX_RETRIEVED_CHUNKS = 5
MAX_RETRIEVED_CONTEXT_CHARS = 9000
DB_PATH = Path(
    os.getenv(
        "DOCUMENT_DB_PATH",
        str(Path(__file__).resolve().parent / "storage" / "documents.sqlite3"),
    )
)


class DocumentProcessingError(ValueError):
    pass


@dataclass(frozen=True)
class ExtractedPage:
    number: int | None
    text: str


@dataclass(frozen=True)
class RetrievedChunk:
    filename: str
    page_number: int | None
    text: str


def _connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH, timeout=10)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    connection.execute("PRAGMA journal_mode = WAL")
    connection.executescript(
        """
        CREATE TABLE IF NOT EXISTS documents (
            document_id TEXT PRIMARY KEY,
            conversation_id TEXT NOT NULL,
            filename TEXT NOT NULL,
            content_hash TEXT NOT NULL,
            page_count INTEGER,
            chunk_count INTEGER NOT NULL,
            created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS documents_conversation_id
            ON documents (conversation_id);
        CREATE TABLE IF NOT EXISTS document_chunks (
            chunk_id INTEGER PRIMARY KEY,
            document_id TEXT NOT NULL REFERENCES documents(document_id) ON DELETE CASCADE,
            page_number INTEGER,
            content TEXT NOT NULL
        );
        CREATE VIRTUAL TABLE IF NOT EXISTS document_chunks_fts USING fts5(
            content,
            tokenize = 'unicode61'
        );
        """
    )
    return connection


def _split_chunks(text: str) -> list[str]:
    normalized = re.sub(r"\s+", " ", text).strip()
    if not normalized:
        return []

    chunks: list[str] = []
    start = 0
    while start < len(normalized):
        end = min(start + CHUNK_SIZE, len(normalized))
        if end < len(normalized):
            boundary = normalized.rfind(" ", start + CHUNK_SIZE // 2, end)
            if boundary > start:
                end = boundary
        chunk = normalized[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= len(normalized):
            break
        start = max(start + 1, end - CHUNK_OVERLAP)
    return chunks


def _query_tokens(query: str) -> list[str]:
    tokens: list[str] = []
    current: list[str] = []
    for character in query:
        if character.isalnum() or unicodedata.category(character).startswith("M"):
            current.append(character)
        elif current:
            tokens.append("".join(current))
            current = []
    if current:
        tokens.append("".join(current))
    return list(dict.fromkeys(token for token in tokens if len(token) >= 2))[:12]


def _check_docx_archive(data: bytes) -> None:
    try:
        with zipfile.ZipFile(io.BytesIO(data)) as archive:
            if "word/document.xml" not in archive.namelist():
                raise DocumentProcessingError("This is not a valid DOCX document.")
            if len(archive.infolist()) > 10_000 or sum(
                item.file_size for item in archive.infolist()
            ) > MAX_DOCUMENT_TEXT_CHARS * 4:
                raise DocumentProcessingError("The DOCX document expands beyond the supported size.")
    except zipfile.BadZipFile as exc:
        raise DocumentProcessingError("This is not a valid DOCX document.") from exc


def _extract_docx(data: bytes) -> list[ExtractedPage]:
    _check_docx_archive(data)
    try:
        document = Document(io.BytesIO(data))
        parts: list[str] = []
        parts.extend(paragraph.text for paragraph in document.paragraphs)
        for table in document.tables:
            for row in table.rows:
                parts.append(" | ".join(cell.text for cell in row.cells))
        for section in document.sections:
            parts.extend(paragraph.text for paragraph in section.header.paragraphs)
            parts.extend(paragraph.text for paragraph in section.footer.paragraphs)
    except (PackageNotFoundError, XMLSyntaxError, ValueError, KeyError, OSError) as exc:
        raise DocumentProcessingError("Could not read the DOCX document.") from exc

    text = "\n".join(part for part in parts if part.strip())
    if len(text) > MAX_DOCUMENT_TEXT_CHARS:
        raise DocumentProcessingError("Extracted document text exceeds the supported size.")
    return [ExtractedPage(number=None, text=text)]


def _ocr_page(page: pymupdf.Page) -> str:
    if (
        page.rect.width > 4000
        or page.rect.height > 4000
        or page.rect.width * page.rect.height > 4_000_000
    ):
        raise DocumentProcessingError(
            "This scanned PDF page is too large to OCR safely."
        )
    try:
        text_page = page.get_textpage_ocr(
            language=os.getenv("TESSERACT_LANGUAGES", "eng"),
            dpi=180,
            full=True,
        )
        text = page.get_text("text", textpage=text_page)
        if not isinstance(text, str):
            raise DocumentProcessingError("Could not extract text from scanned PDF page.")
        return text
    except RuntimeError as exc:
        raise DocumentProcessingError(
            "This scanned PDF needs Tesseract OCR. Install Tesseract and the required language data, then restart the backend."
        ) from exc


def _extract_pdf(data: bytes) -> tuple[list[ExtractedPage], int]:
    try:
        document = pymupdf.open(stream=data, filetype="pdf")
    except (pymupdf.FileDataError, RuntimeError, ValueError) as exc:
        raise DocumentProcessingError("Could not open this PDF document.") from exc

    with document:
        if document.page_count > MAX_DOCUMENT_PAGES:
            raise DocumentProcessingError(
                f"PDF documents are limited to {MAX_DOCUMENT_PAGES} pages."
            )
        pages: list[ExtractedPage] = []
        total_chars = 0
        for index in range(document.page_count):
            page = document.load_page(index)
            page_text = page.get_text("text")
            if not isinstance(page_text, str):
                raise DocumentProcessingError(
                    "Could not extract text from PDF page."
                )
            text = page_text.strip()
            if not text and page.get_images():
                text = _ocr_page(page).strip()
            total_chars += len(text)
            if total_chars > MAX_DOCUMENT_TEXT_CHARS:
                raise DocumentProcessingError(
                    "Extracted document text exceeds the supported size."
                )
            if text:
                pages.append(ExtractedPage(number=index + 1, text=text))
        return pages, document.page_count


def _extract_document(filename: str, data: bytes) -> tuple[list[ExtractedPage], int | None]:
    extension = Path(filename).suffix.lower()
    if extension == ".pdf":
        if not data.startswith(b"%PDF-"):
            raise DocumentProcessingError("The uploaded file is not a valid PDF.")
        return _extract_pdf(data)
    if extension == ".docx":
        if not zipfile.is_zipfile(io.BytesIO(data)):
            raise DocumentProcessingError("The uploaded file is not a valid DOCX.")
        return _extract_docx(data), None
    raise DocumentProcessingError("Upload a PDF or DOCX document.")


def _index_document(
    conversation_id: str, filename: str, data: bytes
) -> dict[str, object]:
    pages, page_count = _extract_document(filename, data)
    chunks: list[tuple[int | None, str]] = []
    for page in pages:
        chunks.extend((page.number, chunk) for chunk in _split_chunks(page.text))
    if not chunks:
        raise DocumentProcessingError(
            "No searchable text was found in the document. For scanned PDFs, install Tesseract OCR with the document's language data."
        )

    document_id = str(uuid.uuid4())
    content_hash = hashlib.sha256(data).hexdigest()
    created_at = datetime.now(timezone.utc).isoformat()
    connection = _connect()
    try:
        connection.execute("BEGIN IMMEDIATE")
        count = connection.execute(
            "SELECT COUNT(*) FROM documents WHERE conversation_id = ?",
            (conversation_id,),
        ).fetchone()[0]
        if count >= MAX_DOCUMENTS_PER_CONVERSATION:
            raise DocumentProcessingError(
                f"A conversation can have at most {MAX_DOCUMENTS_PER_CONVERSATION} documents."
            )
        with connection:
            connection.execute(
                """
                INSERT INTO documents
                    (document_id, conversation_id, filename, content_hash, page_count, chunk_count, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    document_id,
                    conversation_id,
                    filename,
                    content_hash,
                    page_count,
                    len(chunks),
                    created_at,
                ),
            )
            for page_number, content in chunks:
                cursor = connection.execute(
                    """
                    INSERT INTO document_chunks (document_id, page_number, content)
                    VALUES (?, ?, ?)
                    """,
                    (document_id, page_number, content),
                )
                connection.execute(
                    "INSERT INTO document_chunks_fts (rowid, content) VALUES (?, ?)",
                    (cursor.lastrowid, content),
                )
    finally:
        connection.close()

    return {
        "id": document_id,
        "filename": filename,
        "pageCount": page_count,
        "chunkCount": len(chunks),
    }


async def add_document(conversation_id: str, file: UploadFile) -> dict[str, object]:
    filename = (file.filename or "").replace("\\", "/").rsplit("/", 1)[-1]
    filename = "".join(
        character
        for character in filename
        if ord(character) >= 32 and ord(character) != 127
    ).strip()
    if not filename or len(filename) > 180:
        raise HTTPException(status_code=400, detail="The document filename is invalid.")
    if file.size is not None and file.size > MAX_DOCUMENT_BYTES:
        raise HTTPException(status_code=413, detail="Documents must be 20 MB or smaller.")
    data = await file.read(MAX_DOCUMENT_BYTES + 1)
    if not data:
        raise HTTPException(status_code=400, detail="The uploaded document is empty.")
    if len(data) > MAX_DOCUMENT_BYTES:
        raise HTTPException(status_code=413, detail="Documents must be 20 MB or smaller.")
    try:
        return await run_in_threadpool(_index_document, conversation_id, filename, data)
    except DocumentProcessingError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


def _search_documents(
    conversation_id: str, document_ids: list[str], query: str
) -> list[RetrievedChunk]:
    tokens = _query_tokens(query)
    if not tokens:
        return []
    match_query = " OR ".join(f'"{token.replace(chr(34), chr(34) * 2)}"' for token in tokens)
    placeholders = ",".join("?" for _ in document_ids)
    connection = _connect()
    try:
        rows = connection.execute(
            f"""
            SELECT d.filename, c.page_number, c.content
            FROM document_chunks_fts
            JOIN document_chunks c ON c.chunk_id = document_chunks_fts.rowid
            JOIN documents d ON d.document_id = c.document_id
            WHERE document_chunks_fts MATCH ?
              AND d.conversation_id = ?
              AND d.document_id IN ({placeholders})
            ORDER BY bm25(document_chunks_fts)
            LIMIT ?
            """,
            (match_query, conversation_id, *document_ids, MAX_RETRIEVED_CHUNKS),
        ).fetchall()
    except sqlite3.OperationalError as exc:
        raise DocumentProcessingError("Could not search the attached documents.") from exc
    finally:
        connection.close()

    chunks: list[RetrievedChunk] = []
    total_chars = 0
    for row in rows:
        remaining = MAX_RETRIEVED_CONTEXT_CHARS - total_chars
        if remaining <= 0:
            break
        content = row["content"][:remaining]
        chunks.append(
            RetrievedChunk(
                filename=row["filename"],
                page_number=row["page_number"],
                text=content,
            )
        )
        total_chars += len(content)
    return chunks


async def search_documents(
    conversation_id: str, document_ids: list[str], query: str
) -> list[RetrievedChunk]:
    if not document_ids:
        return []
    try:
        return await run_in_threadpool(
            _search_documents, conversation_id, document_ids, query
        )
    except DocumentProcessingError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


def _delete_document(conversation_id: str, document_id: str) -> bool:
    connection = _connect()
    try:
        row = connection.execute(
            "SELECT document_id FROM documents WHERE document_id = ? AND conversation_id = ?",
            (document_id, conversation_id),
        ).fetchone()
        if row is None:
            return False
        with connection:
            chunk_ids = connection.execute(
                "SELECT chunk_id FROM document_chunks WHERE document_id = ?",
                (document_id,),
            ).fetchall()
            connection.executemany(
                "DELETE FROM document_chunks_fts WHERE rowid = ?",
                [(chunk["chunk_id"],) for chunk in chunk_ids],
            )
            connection.execute(
                "DELETE FROM documents WHERE document_id = ?", (document_id,)
            )
        return True
    finally:
        connection.close()


async def remove_document(conversation_id: str, document_id: str) -> bool:
    return await run_in_threadpool(_delete_document, conversation_id, document_id)


def _delete_conversation_documents(conversation_id: str) -> int:
    connection = _connect()
    try:
        with connection:
            rows = connection.execute(
                "SELECT document_id FROM documents WHERE conversation_id = ?",
                (conversation_id,),
            ).fetchall()
            chunk_ids = connection.execute(
                "SELECT c.chunk_id FROM document_chunks c JOIN documents d ON d.document_id = c.document_id WHERE d.conversation_id = ?",
                (conversation_id,),
            ).fetchall()
            connection.executemany(
                "DELETE FROM document_chunks_fts WHERE rowid = ?",
                [(chunk["chunk_id"],) for chunk in chunk_ids],
            )
            connection.execute(
                "DELETE FROM documents WHERE conversation_id = ?",
                (conversation_id,),
            )
        return len(rows)
    finally:
        connection.close()


async def remove_conversation_documents(conversation_id: str) -> int:
    return await run_in_threadpool(_delete_conversation_documents, conversation_id)
