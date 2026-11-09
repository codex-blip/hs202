import asyncio
import io
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

import pymupdf
from docx import Document
from fastapi.testclient import TestClient

from backend.main import app


class ApiTests(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_health_and_static_contracts(self) -> None:
        self.assertEqual(self.client.get("/api/health").json(), {"status": "ok"})
        preflight = self.client.options(
            "/api/documents/example",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "DELETE",
            },
        )
        self.assertEqual(preflight.status_code, 200)
        self.assertIn("DELETE", preflight.headers["access-control-allow-methods"])

        sources = self.client.get("/api/sources")
        self.assertEqual(sources.status_code, 200)
        self.assertIn("title", sources.json()[0])

        routes = self.client.get("/api/grievances")
        self.assertEqual(routes.status_code, 200)
        self.assertEqual(routes.json()[0]["id"], "pmfby-claim")
        self.assertIn("citations", routes.json()[0])

    def test_scheme_guidance_uses_frontend_response_shape(self) -> None:
        response = self.client.post(
            "/api/schemes/guidance",
            json={
                "state": "Punjab",
                "topic": "crop-insurance",
                "situation": "Crop loss",
                "language": "en",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            set(response.json()),
            {"heading", "requirements", "documents", "citations", "limitation", "nextStep"},
        )
        self.assertIn("Punjab", response.json()["heading"])

    def test_chat_validates_input_and_reports_missing_provider_key(self) -> None:
        invalid = self.client.post(
            "/api/chat", json={"message": "   ", "language": "en"}
        )
        self.assertEqual(invalid.status_code, 422)
        self.assertEqual(
            invalid.json()["error"],
            "The request contains invalid or missing fields.",
        )

        with patch.dict("os.environ", {}, clear=True):
            unavailable = self.client.post(
                "/api/chat", json={"message": "Hello", "language": "en"}
            )
        self.assertEqual(unavailable.status_code, 503)
        self.assertIn("SARVAM_API_KEY", unavailable.json()["error"])

    def test_chat_maps_provider_answer_to_frontend_contract(self) -> None:
        client = Mock()
        client.chat.completions_v2.return_value = Mock(
            choices=[
                Mock(
                    message=Mock(
                        content="First paragraph.\n\nSecond paragraph."
                    ),
                    finish_reason="stop",
                )
            ]
        )
        with (
            patch(
                "backend.main.get_sarvam_client", return_value=client
            ),
        ):
            response = self.client.post(
                "/api/chat",
                json={
                    "message": "What about that?",
                    "language": "hi",
                    "detectedLanguage": "Punjabi",
                    "conversationId": "demo",
                    "history": [
                        {"role": "user", "content": "Tell me about PACS."},
                        {"role": "assistant", "content": "PACS are cooperatives."},
                    ],
                },
            )

        client.chat.completions_v2.assert_called_once()
        payload = client.chat.completions_v2.call_args.kwargs
        self.assertEqual(payload["model"], "sarvam-105b")
        self.assertEqual(payload["reasoning_effort"], "none")
        self.assertEqual(payload["max_tokens"], 1400)
        self.assertEqual(
            payload["request_options"],
            {"timeout_in_seconds": 90, "max_retries": 2},
        )
        self.assertIn(
            "speech transcription service detected Punjabi",
            payload["messages"][0]["content"],
        )
        self.assertIn("explicitly asks for a different reply language", payload["messages"][0]["content"])
        self.assertIn("readable Markdown", payload["messages"][0]["content"])
        self.assertEqual(
            payload["messages"][1:],
            [
                {"role": "user", "content": "Tell me about PACS."},
                {"role": "assistant", "content": "PACS are cooperatives."},
                {"role": "user", "content": "What about that?"},
            ],
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["kind"], "answer")
        self.assertEqual(
            response.json()["answer"], ["First paragraph.", "Second paragraph."]
        )
        self.assertEqual(response.json()["citations"], [])
        self.assertIsNone(response.json()["limitation"])

    def test_chat_warns_when_answer_reaches_output_limit(self) -> None:
        client = Mock()
        client.chat.completions_v2.return_value = Mock(
            choices=[
                Mock(
                    message=Mock(content="A response that may be incomplete."),
                    finish_reason="length",
                )
            ]
        )
        with patch("backend.main.get_sarvam_client", return_value=client):
            response = self.client.post(
                "/api/chat",
                json={"message": "Explain cooperative membership rules."},
            )

        self.assertEqual(response.status_code, 200)
        self.assertIn("may be incomplete", response.json()["limitation"])

    def test_chat_detects_language_from_latest_prompt(self) -> None:
        client = Mock()
        client.chat.completions_v2.return_value = Mock(
            choices=[Mock(message=Mock(content="বাংলায় উত্তর"))]
        )
        with (
            patch(
                "backend.main.get_sarvam_client", return_value=client
            ),
        ):
            response = self.client.post(
                "/api/chat",
                json={"message": "PACS কী?"},
            )

        self.assertEqual(response.status_code, 200)
        self.assertIn(
            "Detect the language of the latest user message",
            client.chat.completions_v2.call_args.kwargs["messages"][0]["content"],
        )
        self.assertIn(
            "explicitly asks for a different reply language",
            client.chat.completions_v2.call_args.kwargs["messages"][0]["content"],
        )

    def test_pdf_upload_retrieves_scoped_chunks_for_chat_and_can_be_removed(self) -> None:
        conversation_id = "1b54bb65-22ec-4402-896a-2cbf07a819ed"
        pdf = pymupdf.open()
        page = pdf.new_page()
        page.insert_text(
            (72, 72),
            "Crop insurance claim deadline: report crop loss within 72 hours.",
        )
        pdf_bytes = pdf.tobytes()
        pdf.close()

        with tempfile.TemporaryDirectory() as temp_dir, patch(
            "backend.documents.DB_PATH", Path(temp_dir) / "documents.sqlite3"
        ):
            uploaded = self.client.post(
                "/api/documents",
                data={"conversationId": conversation_id},
                files={"file": ("policy.pdf", pdf_bytes, "application/pdf")},
            )
            self.assertEqual(uploaded.status_code, 200, uploaded.text)
            document = uploaded.json()
            self.assertEqual(document["filename"], "policy.pdf")
            self.assertEqual(document["pageCount"], 1)
            self.assertGreater(document["chunkCount"], 0)

            client = Mock()
            client.chat.completions_v2.return_value = Mock(
                choices=[Mock(message=Mock(content="Report it within 72 hours."))]
            )
            with (
                patch(
                    "backend.main.get_sarvam_client", return_value=client
                ),
            ):
                response = self.client.post(
                    "/api/chat",
                    json={
                        "message": "What is the crop loss reporting deadline?",
                        "conversationId": conversation_id,
                        "documentIds": [document["id"]],
                    },
                )

            self.assertEqual(response.status_code, 200, response.text)
            messages = client.chat.completions_v2.call_args.kwargs["messages"]
            context = next(message["content"] for message in messages if "policy.pdf" in message["content"])
            self.assertIn("within 72 hours", context)
            self.assertEqual(
                response.json()["citations"],
                [
                    {
                        "title": "policy.pdf",
                        "authority": "User-uploaded document",
                        "section": "Page 1",
                    }
                ],
            )

            with patch("backend.main.get_sarvam_client", return_value=client):
                other_conversation = self.client.post(
                    "/api/chat",
                    json={
                        "message": "What is the crop loss reporting deadline?",
                        "conversationId": "different-conversation",
                        "documentIds": [document["id"]],
                    },
                )
            self.assertEqual(other_conversation.status_code, 200)
            self.assertEqual(other_conversation.json()["citations"], [])

            removed = self.client.delete(
                f"/api/documents/{document['id']}",
                params={"conversation_id": conversation_id},
            )
            self.assertEqual(removed.status_code, 200)
            self.assertEqual(removed.json(), {"deleted": True})

            foreign_delete = self.client.delete(
                f"/api/documents/{document['id']}",
                params={"conversation_id": "different-conversation"},
            )
            self.assertEqual(foreign_delete.status_code, 404)

    def test_docx_upload_indexes_paragraphs_and_tables(self) -> None:
        conversation_id = "90ed7e39-d131-47cc-a492-7e685f1a4c88"
        document = Document()
        document.add_paragraph("Member eligibility requires an active PACS membership.")
        document.add_paragraph("বাংলা কৃষি সমবায়")
        table = document.add_table(rows=1, cols=2)
        table.cell(0, 0).text = "Required document"
        table.cell(0, 1).text = "Membership proof"
        buffer = io.BytesIO()
        document.save(buffer)

        with tempfile.TemporaryDirectory() as temp_dir, patch(
            "backend.documents.DB_PATH", Path(temp_dir) / "documents.sqlite3"
        ):
            uploaded = self.client.post(
                "/api/documents",
                data={"conversationId": conversation_id},
                files={
                    "file": (
                        "membership.docx",
                        buffer.getvalue(),
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    )
                },
            )
            self.assertEqual(uploaded.status_code, 200, uploaded.text)
            self.assertIsNone(uploaded.json()["pageCount"])

            from backend.documents import search_documents

            chunks = asyncio.run(
                search_documents(
                    conversation_id,
                    [uploaded.json()["id"]],
                    "What proof is needed for PACS membership?",
                )
            )
            combined = "\n".join(chunk.text for chunk in chunks)
            self.assertIn("active PACS membership", combined)
            self.assertIn("Membership proof", combined)
            bengali_chunks = asyncio.run(
                search_documents(
                    conversation_id,
                    [uploaded.json()["id"]],
                    "কৃষি",
                )
            )
            self.assertTrue(any("কৃষি" in chunk.text for chunk in bengali_chunks))

    def test_audio_transcription_returns_text_and_detected_language(self) -> None:
        client = Mock()
        client.speech_to_text.transcribe.return_value = Mock(
            transcript="ਸਹਿਕਾਰੀ ਸਭਾ ਬਾਰੇ ਦੱਸੋ",
            language_code="pa-IN",
        )
        with (
            patch(
                "backend.main.get_sarvam_client", return_value=client
            ),
        ):
            response = self.client.post(
                "/api/audio/transcriptions",
                files={"file": ("voice.webm", b"audio bytes", "audio/webm")},
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {"text": "ਸਹਿਕਾਰੀ ਸਭਾ ਬਾਰੇ ਦੱਸੋ", "language": "pa"},
        )
        client.speech_to_text.transcribe.assert_called_once()
        self.assertEqual(
            client.speech_to_text.transcribe.call_args.kwargs["model"], "saaras:v4"
        )
        self.assertEqual(
            client.speech_to_text.transcribe.call_args.kwargs["mode"], "transcribe"
        )
        self.assertEqual(
            client.speech_to_text.transcribe.call_args.kwargs["file"][0], "voice.webm"
        )

    def test_audio_transcription_requires_supported_audio_and_detected_language(self) -> None:
        unsupported = self.client.post(
            "/api/audio/transcriptions",
            files={"file": ("voice.txt", b"not audio", "text/plain")},
        )
        self.assertEqual(unsupported.status_code, 415)

        client = Mock()
        client.speech_to_text.transcribe.return_value = Mock(
            transcript="Hello", language_code=""
        )
        with (
            patch(
                "backend.main.get_sarvam_client", return_value=client
            ),
        ):
            missing_language = self.client.post(
                "/api/audio/transcriptions",
                files={"file": ("voice.webm", b"audio bytes", "audio/webm")},
            )
        self.assertEqual(missing_language.status_code, 502)
        self.assertIn("could not detect", missing_language.json()["error"])

    def test_speech_synthesis_returns_wav_audio(self) -> None:
        import base64

        audio_bytes = b"RIFF\x00\x00\x00\x00WAVE"
        client = Mock()
        client.text_to_speech.convert.return_value = Mock(
            audios=[base64.b64encode(audio_bytes).decode("ascii")]
        )
        with patch("backend.main.get_sarvam_client", return_value=client):
            response = self.client.post(
                "/api/audio/speech",
                json={"text": "Hello there", "language": "en"},
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["content-type"], "audio/wav")
        self.assertEqual(response.content, audio_bytes)
        client.text_to_speech.convert.assert_called_once()
        self.assertEqual(
            client.text_to_speech.convert.call_args.kwargs["model"],
            "bulbul:v4-flash",
        )
        self.assertEqual(
            client.text_to_speech.convert.call_args.kwargs["language_code"], "en-IN"
        )

    def test_speech_synthesis_rejects_unsupported_language(self) -> None:
        response = self.client.post(
            "/api/audio/speech",
            json={"text": "Hello there", "language": "as"},
        )
        self.assertEqual(response.status_code, 422)
        self.assertIn("supports English", response.json()["error"])


if __name__ == "__main__":
    unittest.main()
