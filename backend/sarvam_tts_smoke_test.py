import base64
import os
from pathlib import Path

from dotenv import load_dotenv
from sarvamai import SarvamAI

PROJECT_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(PROJECT_ROOT / ".env")

api_key = os.getenv("SARVAM_API_KEY")
if not api_key:
    raise SystemExit("Set SARVAM_API_KEY in the project .env file before running this test.")

client = SarvamAI(api_subscription_key=api_key)
audio = client.text_to_speech.convert(
    text="Welcome to Sarvam AI!",
    language_code="en-IN",
    model="bulbul:v4-flash",
    speaker="shubh_enhi_ads",
)

output_path = PROJECT_ROOT / "sarvam_first_call.wav"
output_path.write_bytes(base64.b64decode("".join(audio.audios)))
print(f"Saved speech audio to {output_path.name}")
