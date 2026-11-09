# Sahakar Sahayak

React + TypeScript frontend with a FastAPI backend for cooperative-services guidance.

## Features and roadmap

### Available in the current prototype

- **Multilingual chat:** Ask in a language the configured AI model can handle. Replies generally follow the latest message's language, including languages beyond India's 22 scheduled languages, unless you request another. Language detection and answer quality are model-dependent; this is not a guarantee of fluent support for every language.
- **Translated interface:** The site interface can be switched between English, Hindi, and Punjabi. Other interface translations are not yet available.
- **Cooperative information topics:** Browse cooperative governance, crop insurance (including PMFBY), PACS services, financial literacy, government schemes, legal information, and grievance navigation.
- **Scheme guidance wizard:** Select a state, topic, and situation to see example requirements, documents, citations, limitations, and a suggested next step. It does not determine eligibility.
- **Grievance navigation:** View example routes, preparation checklists, and cited official channels. The app does not submit or adjudicate complaints.
- **Voice input and playback:** Record a question for Sarvam transcription, review the transcript before sending, and use Sarvam text-to-speech to listen to an answer.
- **Conversation history:** Recent conversations are saved in the browser's local storage; up to 12 recent turns can be sent as chat context.
- **Readable answers:** Assistant responses support Markdown, including headings, lists, links, code, and tables.
- **API and local demo mode:** Use the FastAPI endpoints or the frontend's mock mode to explore demonstration flows.

### Planned work (not yet implemented)

- Build a maintained, human-reviewed knowledge base from authoritative, current documents, with jurisdiction and effective dates.
- Extend the current uploaded-document retrieval flow into a governed official-source RAG system and show traceable citations, source dates, and uncertainty.
- Replace demonstration scheme and grievance records with current, state-specific information, and establish a process to review updates and broken links.
- Add translated interface content and quality-reviewed support for more languages; improve speech input and playback across languages and devices.
- Improve accessibility and low-bandwidth/assisted-use support, and provide clearer ways for people to report outdated or unhelpful information.
- Keep the project public-interest and non-commercial in intent. It is not currently an incorporated non-profit, a government service, or an official decision-making channel.

### RAG: current prototype and implementation plan

**What exists now:** attached PDF and DOCX files are extracted, split into overlapping text chunks, and indexed in a local SQLite FTS5 full-text index. When a user asks about attached files, the backend retrieves up to five matching chunks (with a combined 9,000-character limit) and sends them to Sarvam as untrusted context. Answers can cite the uploaded filename and PDF page. This is a basic lexical retrieval-augmented chat path for user-provided documents; it is not an official or maintained knowledge base, and keyword search may miss relevant passages with different wording.

**What is not implemented:** ingestion and review of trusted official sources, jurisdiction/date-aware retrieval, multilingual semantic or hybrid search, version/expiry management, and verified citations for general chat. Scheme and grievance answers still use demonstration records. The suggestions below describe future work, not existing capabilities.

**A practical path for this codebase:**

1. **Create a reviewed source catalog.** For each law, scheme notice, or procedure, record a stable source ID, title, issuing authority, canonical URL, jurisdiction, language, publication/effective dates, last-checked date, reviewer, and active/expired status. Start with a small set of primary sources; do not ingest arbitrary web pages as authoritative.
2. **Add a repeatable ingestion step.** Fetch or upload approved PDFs/HTML, extract text while retaining page or section boundaries, normalize it, and split it into smaller overlapping passages. Store source metadata and chunks separately from conversation uploads so public knowledge does not depend on attaching a file to a chat.
3. **Improve retrieval incrementally.** Reuse the current FTS5 search as a first lexical baseline. Evaluate it on reviewed questions. If it misses paraphrases or cross-language matches, add a multilingual embedding index and retrieve by both keywords and semantic similarity, then merge/rerank results. Choose and test an embedding model for the target Indic languages before adopting it; embeddings/vector infrastructure are not currently dependencies in this project.
4. **Filter before ranking.** Use the question and any selected state/topic to restrict results to relevant jurisdiction, language, and currently effective sources. Keep the matched source ID, URL, date, and page/section attached to every retrieved chunk.
5. **Ground the answer and citations.** In `/api/chat`, pass only the selected passages as explicitly untrusted reference material, instruct the model not to follow instructions found inside documents, and require it to say when evidence is insufficient. Return citations derived from retrieved metadata rather than URLs or claims invented by the model. Keep the existing safety language that answers are informational, not official determinations.
6. **Test and maintain it.** Build a reviewed question set across states, topics, and languages. Measure retrieval relevance, citation correctness, answer support, abstention when no passage matches, and latency. Add regression tests for expired/wrong-jurisdiction sources and document-injection text. Assign an owner and review cadence; remove or mark outdated sources instead of silently treating them as current.

This design can be introduced behind the existing `search_documents` boundary in `backend/main.py`: keep uploaded-document search scoped to the current conversation, add a separate trusted-source search path, and combine their explicitly labeled results only when appropriate. Begin with FTS5 plus metadata filters; add vector search only if evaluation shows a measurable retrieval gap.

### Source and reliability note

The demonstration records reference public primary sources, including:

- [Pradhan Mantri Fasal Bima Yojana (PMFBY)](https://pmfby.gov.in/)
- [Ministry of Cooperation — PACS computerization guidelines](https://www.cooperation.gov.in/en/guidelines-computerization-pacs-project)
- [India Code — Multi-State Co-operative Societies Act, 2002](https://www.indiacode.nic.in/bitstream/123456789/1914/1/aA2002-39.pdf)
- [Press Information Bureau](https://www.pib.gov.in/)

These are references in static demonstration content, not a live government knowledge base; their presence does not mean the underlying information has been independently verified or is current. Chat responses are AI-generated and may be incorrect. Check the linked authority for current rules and deadlines, and contact the responsible authority or a qualified professional for decisions or case-specific advice.

## Run locally

1. Install frontend dependencies with `npm install`.
2. Install backend dependencies with `python -m pip install -r requirements.txt` in your Python 3.10+ environment.
3. Copy `.env.example` to `.env` and set `SARVAM_API_KEY` there. Keep the key server-side; do not use a `VITE_` variable for it. `.env` is ignored by Git.
4. In one PowerShell window, start the backend:

   ```powershell
   `python -m uvicorn backend.main:app --reload --port 8000`
   ```

   The backend uses Sarvam's `sarvam-105b` chat model by default; set `SARVAM_CHAT_MODEL` to choose another supported Token Factory model. Voice transcription uses Saaras v4; recordings must be 30 seconds or shorter. To enable a frontend hosted on a different origin, set `FRONTEND_ORIGINS` to a comma-separated list of trusted origins.
5. In another window, start the frontend with `npm run dev`.

Vite forwards `/api` requests to FastAPI at `http://127.0.0.1:8000`. Set `VITE_USE_MOCK=false` to use the backend; set `VITE_API_BASE_URL` if the API is hosted elsewhere. The frontend mock services remain available when mock mode is enabled.

## Sarvam TTS smoke test

Set a newly rotated `SARVAM_API_KEY` in the project-root `.env` file, then run:

```powershell
python backend/sarvam_tts_smoke_test.py
```

The script calls Sarvam Bulbul v4 Flash and saves the generated audio as `sarvam_first_call.wav`.

## API

- `GET /api/health` - liveness check
- `POST /api/chat` - Sarvam-backed assistant response; replies follow the latest user message's language unless the user explicitly requests another language; accepts up to 12 recent conversation turns for context
- `POST /api/documents` - extracts and indexes a PDF or DOCX for the specified conversation
- `DELETE /api/documents/{document_id}` - removes one attached document, scoped to its conversation
- `DELETE /api/conversations/{conversation_id}/documents` - removes all documents attached to a conversation
- `POST /api/audio/transcriptions` - transcribes uploaded audio and returns its detected language; uploads are limited to 25 MB
- `POST /api/audio/speech` - generates WAV audio for an answer with Sarvam Bulbul; supports 11 languages and text up to 2,500 characters
- `POST /api/schemes/guidance` - scheme requirements, documents, citations, and limitation
- `GET /api/grievances` - grievance navigation routes
- `GET /api/sources` - citation/source list

The scheme, grievance, and source records currently mirror the frontend demonstration content. They are static examples, not a live government knowledge base or an eligibility determination. Chat responses are AI-generated and are returned without verified citations.

Chat has no reply-language picker: replies automatically follow the language of the latest prompt unless the user explicitly asks for another language. A detected speech language is used as a clue when a chat prompt is ambiguous. The site interface remains independently switchable between English, Hindi, and Punjabi outside the chat page. Voice input records audio in the browser, sends it to the backend for Sarvam Saaras transcription, and fills the chat box with the transcript for review before sending. Chat and voice input use Sarvam when the live backend is enabled; the Listen button sends answer text to Sarvam Bulbul and plays returned audio. Speech playback supports 11 languages and up to 2,500 characters. Assistant responses render Markdown formatting, including headings, lists, emphasis, links, code, and tables.

Users can attach up to five PDF or DOCX files (20 MB each) to a conversation. PDFs are extracted with PyMuPDF and DOCX text and tables with `python-docx`; extracted text is chunked and indexed in a local SQLite FTS5 database at `backend/storage/documents.sqlite3`. Each chat request retrieves up to five relevant chunks from the attached documents and sends those excerpts to Sarvam as untrusted source context; answers cite matching filenames and PDF page numbers when available. Documents remain indexed across backend restarts until removed or the conversation's documents are cleared. Scanned PDFs require the Tesseract executable and matching language data to be installed separately; configure `TESSERACT_LANGUAGES` (default `eng`). OCR language support depends on installed trained-data files. Uploaded document excerpts and the user's question are sent to Sarvam when asking a question about attached documents. This prototype does not have user authentication; do not expose the backend publicly with sensitive uploads until document routes are protected by authenticated user ownership. PyMuPDF is offered under AGPL or a commercial license; review its terms for your intended distribution/hosting model.

Interactive API documentation is available at `/docs` while FastAPI is running.
