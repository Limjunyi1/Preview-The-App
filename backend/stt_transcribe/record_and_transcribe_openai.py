"""
Record audio from the microphone, save to disk, then transcribe with OpenAI
`gpt-4o-transcribe`.

Usage:
- uv run python backend/stt_transcribe/record_and_transcribe_openai.py --output backend/stt_transcribe/recording.wav
"""

from __future__ import annotations

import argparse
import os
import queue
import sys
import threading
from pathlib import Path

from dotenv import load_dotenv
import sounddevice as sd
import soundfile as sf
from openai import OpenAI


BACKEND_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BACKEND_DIR / ".env")  # loads OPENAI_API_KEY if present

DEFAULT_SAMPLE_RATE = 16_000
DEFAULT_CHANNELS = 1
DEFAULT_MODEL = "gpt-4o-mini-transcribe"
DEFAULT_PROMPT = ""


def record_audio(output_path: Path, samplerate: int, channels: int) -> None:
    """
    Record audio until Enter is pressed. Streams directly to disk.
    """
    q: queue.Queue = queue.Queue()
    stop_event = threading.Event()

    def audio_callback(indata, frames, time, status):  # type: ignore[override]
        if status:
            print(f"Recording status: {status}", file=sys.stderr)
        q.put(indata.copy())

    def writer():
        with sf.SoundFile(
            output_path,
            mode="w",
            samplerate=samplerate,
            channels=channels,
            subtype="PCM_16",
        ) as audio_file:
            with sd.InputStream(
                samplerate=samplerate,
                channels=channels,
                callback=audio_callback,
            ):
                print("Recording... press Enter to stop.")
                while not stop_event.is_set():
                    try:
                        data = q.get(timeout=0.1)
                    except queue.Empty:
                        continue
                    audio_file.write(data)

                while not q.empty():
                    audio_file.write(q.get())

    writer_thread = threading.Thread(target=writer, daemon=True)
    writer_thread.start()

    try:
        input()
    except KeyboardInterrupt:
        print("\nStopping...")
    finally:
        stop_event.set()
        writer_thread.join()
        print(f"Saved recording to: {output_path}")


def transcribe_audio(file_path: Path, model: str, prompt: str) -> str:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("Set OPENAI_API_KEY before running transcription.")

    client = OpenAI(api_key=api_key)
    with open(file_path, "rb") as audio_file:
        resp = client.audio.transcriptions.create(
            model=model,
            file=audio_file,
            prompt=prompt or None,
        )
    return getattr(resp, "text", "") or ""


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Record from microphone, then transcribe with OpenAI gpt-4o-transcribe."
    )
    default_output = Path(__file__).resolve().parent / "recording.wav"
    parser.add_argument(
        "--output",
        type=Path,
        default=default_output,
        help=f"Output audio file path (default: {default_output})",
    )
    parser.add_argument(
        "--samplerate",
        type=int,
        default=DEFAULT_SAMPLE_RATE,
        help=f"Sample rate Hz (default: {DEFAULT_SAMPLE_RATE})",
    )
    parser.add_argument(
        "--channels",
        type=int,
        default=DEFAULT_CHANNELS,
        help=f"Number of channels (default: {DEFAULT_CHANNELS})",
    )
    parser.add_argument(
        "--model",
        type=str,
        default=DEFAULT_MODEL,
        help=f"OpenAI model name (default: {DEFAULT_MODEL})",
    )
    parser.add_argument(
        "--prompt",
        type=str,
        default=DEFAULT_PROMPT,
        help="Optional prompt for the transcription model.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    output_path: Path = args.output

    output_path.parent.mkdir(parents=True, exist_ok=True)
    record_audio(output_path=output_path, samplerate=args.samplerate, channels=args.channels)

    print("Uploading to OpenAI for transcription...")
    try:
        transcript = transcribe_audio(file_path=output_path, model=args.model, prompt=args.prompt)
    except Exception as exc:  # noqa: BLE001
        print(f"Transcription failed: {exc}", file=sys.stderr)
        sys.exit(1)

    print("\n--- Transcript ---")
    print(transcript)


if __name__ == "__main__":
    main()

