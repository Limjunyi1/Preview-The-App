from __future__ import annotations

import json
import queue
import os
import re
import time
import threading
import tempfile
from pathlib import Path
from typing import Optional
from uuid import uuid4

import sounddevice as sd
import soundfile as sf
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel, Field

from .ai_bestie import AIBestie
from .oboarding_agent import OnboardingAgent
from .simulation.models import PersonaSummary, SimulationRequest, SimulationRun
from .simulation.simulation import run_simulation
from .simulation.storage import get_run, list_runs, save_run


# ------------------------------------------------------------------------------
# Config
# ------------------------------------------------------------------------------
REPO_ROOT = Path(__file__).resolve().parent.parent
PROFILE_DIR = Path(os.getenv("PROFILE_DIR", REPO_ROOT / "profiles"))
MODEL_NAME = os.getenv("MODEL_NAME", "gemini-2.5-flash")
ONBOARDING_PROMPT = str(REPO_ROOT / "Prompts" / "onboardingPrompt.yaml")
BESTIE_PROMPT = str(REPO_ROOT / "Prompts" / "aiBestiePrompt.yaml")
TRANSCRIBE_MODEL = os.getenv("TRANSCRIBE_MODEL", "gpt-4o-mini-transcribe")
TRANSCRIBE_SAMPLE_RATE = int(os.getenv("TRANSCRIBE_SAMPLE_RATE", "16000"))
TRANSCRIBE_CHANNELS = int(os.getenv("TRANSCRIBE_CHANNELS", "1"))

# ------------------------------------------------------------------------------
# Utilities
# ------------------------------------------------------------------------------


def _strip_fence(text: str) -> str:
    t = text.strip()
    fence_pattern = r"```(?:json)?\s*(.*?)\s*```"
    match = re.search(fence_pattern, t, flags=re.DOTALL | re.IGNORECASE)
    return match.group(1).strip() if match else t


def _parse_json_from_text(text: str) -> Optional[dict]:
    try:
        cleaned = _strip_fence(text)
        return json.loads(cleaned)
    except Exception:
        return None


def _profile_path(user_id: str) -> Path:
    PROFILE_DIR.mkdir(parents=True, exist_ok=True)
    return PROFILE_DIR / f"{user_id}.json"


def _read_profile(user_id: str) -> dict:
    path = _profile_path(user_id)
    if not path.exists():
        raise FileNotFoundError(f"profile not found for user_id={user_id}")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _write_profile(user_id: str, data: dict) -> Path:
    path = _profile_path(user_id)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return path


def _persona_from_profile(profile: dict) -> PersonaSummary:
    display_name = profile.get("profile", {}).get("display_name") or profile.get("display_name") or "Unknown"
    ai_summary = profile.get("AI_summary") or profile.get("ai_summary") or ""
    return PersonaSummary(display_name=display_name, ai_summary=ai_summary, persona_json=profile)


# ------------------------------------------------------------------------------
# Pydantic models for API
# ------------------------------------------------------------------------------


class ProfileResponse(BaseModel):
    profile: dict


class ProfileUpdateRequest(BaseModel):
    profile: dict


class OnboardingStartRequest(BaseModel):
    user_id: str = Field(..., description="Unique user id to save profile as")
    model: Optional[str] = Field(None, description="Override model name")


class OnboardingStartResponse(BaseModel):
    session_id: str
    opening_text: str


class OnboardingReplyRequest(BaseModel):
    session_id: str
    message: str


class OnboardingReplyResponse(BaseModel):
    reply: str
    done: bool = False
    persona_json: Optional[dict] = None


class OnboardingFinalizeRequest(BaseModel):
    session_id: str


class OnboardingFinalizeResponse(BaseModel):
    persona_json: dict


class BestieStartRequest(BaseModel):
    user_id: str
    model: Optional[str] = None


class BestieStartResponse(BaseModel):
    session_id: str
    opening_text: str


class BestieReplyRequest(BaseModel):
    session_id: str
    message: str


class BestieReplyResponse(BaseModel):
    reply: str


class BestieFinalizeRequest(BaseModel):
    session_id: str


class BestieFinalizeResponse(BaseModel):
    updated_profile: dict
    bestie_insights: Optional[dict] = None


class SimulateByUserRequest(BaseModel):
    user_a: str
    user_b: str
    turns: int = Field(20, ge=2, le=50)
    starter: str = Field("a", pattern="^(a|b)$")


class SimulationListOut(BaseModel):
    runs: list[SimulationRun]
    next_cursor: Optional[str] = None


class HealthOut(BaseModel):
    status: str
    uptime_seconds: float


class TranscribeStartRequest(BaseModel):
    samplerate: Optional[int] = Field(None, description="Sample rate Hz")
    channels: Optional[int] = Field(None, description="Number of channels (1=mono)")


class TranscribeStartResponse(BaseModel):
    session_id: str
    samplerate: int
    channels: int
    message: str = "recording started"


class TranscribeStopRequest(BaseModel):
    session_id: str
    model: Optional[str] = Field(None, description="Override OpenAI model for transcription")
    prompt: Optional[str] = Field(None, description="Optional transcription prompt")


class TranscribeStopResponse(BaseModel):
    transcript: str
    duration_seconds: Optional[float] = None
    message: str = "transcription complete"


# ------------------------------------------------------------------------------
# Session stores
# ------------------------------------------------------------------------------
onboarding_sessions: dict[str, dict] = {}
bestie_sessions: dict[str, dict] = {}
recording_session: dict[str, dict] = {}
recording_lock = threading.Lock()
APP_START = time.time()

# ------------------------------------------------------------------------------
# FastAPI app
# ------------------------------------------------------------------------------
app = FastAPI(title="DatesDraft API", version="0.2.0")

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:5173",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------------------------------
# Health
# ------------------------------------------------------------------------------
@app.get("/")
def root():
    return {"message": "DatesDraft API", "docs": "/docs", "openapi": "/openapi.json"}


@app.get("/health", response_model=HealthOut)
def health() -> HealthOut:
    return HealthOut(status="ok", uptime_seconds=time.time() - APP_START)


# ------------------------------------------------------------------------------
# Profiles
# ------------------------------------------------------------------------------
@app.get("/profiles/{user_id}", response_model=ProfileResponse)
def get_profile(user_id: str) -> ProfileResponse:
    try:
        profile = _read_profile(user_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Profile not found")
    return ProfileResponse(profile=profile)


@app.put("/profiles/{user_id}", response_model=ProfileResponse)
def put_profile(user_id: str, body: ProfileUpdateRequest) -> ProfileResponse:
    path = _write_profile(user_id, body.profile)
    return ProfileResponse(profile=body.profile)


# ------------------------------------------------------------------------------
# Onboarding chat
# ------------------------------------------------------------------------------
@app.post("/onboarding/start", response_model=OnboardingStartResponse)
def onboarding_start(body: OnboardingStartRequest) -> OnboardingStartResponse:
    model = body.model or MODEL_NAME
    agent = OnboardingAgent(prompt_path=ONBOARDING_PROMPT, model_name=model)
    opening = agent.start()
    session_id = str(uuid4())
    onboarding_sessions[session_id] = {"agent": agent, "user_id": body.user_id}
    return OnboardingStartResponse(session_id=session_id, opening_text=opening)


def _finalize_onboarding(session_id: str, reply_text: Optional[str] = None) -> dict:
    sess = onboarding_sessions.get(session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
    agent: OnboardingAgent = sess["agent"]
    user_id: str = sess["user_id"]

    persona = _parse_json_from_text(reply_text or "")
    if persona is None:
        persona_text = agent.get_report()
        persona = _parse_json_from_text(persona_text)
    if persona is None:
        raise HTTPException(status_code=500, detail="Failed to parse persona JSON")
    _write_profile(user_id, persona)
    onboarding_sessions.pop(session_id, None)
    return persona


@app.post("/onboarding/reply", response_model=OnboardingReplyResponse)
def onboarding_reply(body: OnboardingReplyRequest) -> OnboardingReplyResponse:
    sess = onboarding_sessions.get(body.session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
    agent: OnboardingAgent = sess["agent"]
    reply = agent.send(body.message)
    done = False
    persona_json = None
    closing_phrase = "Thank you, your dates are on the way."
    has_json = "```json" in reply or reply.strip().startswith("{")

    if closing_phrase in reply or has_json:
        persona_json = _finalize_onboarding(body.session_id, reply)
        done = True

    return OnboardingReplyResponse(reply=reply, done=done, persona_json=persona_json)


@app.post("/onboarding/finalize", response_model=OnboardingFinalizeResponse)
def onboarding_finalize(body: OnboardingFinalizeRequest) -> OnboardingFinalizeResponse:
    persona = _finalize_onboarding(body.session_id)
    return OnboardingFinalizeResponse(persona_json=persona)


# ------------------------------------------------------------------------------
# AI Bestie chat
# ------------------------------------------------------------------------------
@app.post("/bestie/start", response_model=BestieStartResponse)
def bestie_start(body: BestieStartRequest) -> BestieStartResponse:
    model = body.model or MODEL_NAME
    try:
        _ = _read_profile(body.user_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Profile not found")

    bestie = AIBestie(
        profile_path=str(_profile_path(body.user_id)),
        prompt_path=BESTIE_PROMPT,
        model_name=model,
    )
    opening = bestie.start()
    session_id = str(uuid4())
    bestie_sessions[session_id] = {"agent": bestie, "user_id": body.user_id}
    return BestieStartResponse(session_id=session_id, opening_text=opening)


@app.post("/bestie/reply", response_model=BestieReplyResponse)
def bestie_reply(body: BestieReplyRequest) -> BestieReplyResponse:
    sess = bestie_sessions.get(body.session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
    bestie: AIBestie = sess["agent"]
    reply = bestie.send(body.message)
    return BestieReplyResponse(reply=reply)


@app.post("/bestie/finalize", response_model=BestieFinalizeResponse)
def bestie_finalize(body: BestieFinalizeRequest) -> BestieFinalizeResponse:
    sess = bestie_sessions.get(body.session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
    bestie: AIBestie = sess["agent"]
    user_id: str = sess["user_id"]
    raw, parsed = bestie.summarize_and_update()
    if not parsed:
        raise HTTPException(status_code=500, detail="Failed to parse bestie JSON")
    path = bestie.save_profile(parsed)
    bestie_sessions.pop(body.session_id, None)
    updated_profile = parsed.get("updated_profile") or parsed
    bestie_insights = parsed.get("bestie_insights")
    return BestieFinalizeResponse(updated_profile=updated_profile, bestie_insights=bestie_insights)


# ------------------------------------------------------------------------------
# Simulation
# ------------------------------------------------------------------------------
@app.post("/simulate", response_model=SimulationRun)
def simulate(req: SimulationRequest) -> SimulationRun:
    run = run_simulation(req, model_name=MODEL_NAME)
    save_run(run)
    return run


@app.get("/simulate", response_model=SimulationListOut)
def list_simulations(limit: int = 50) -> SimulationListOut:
    runs = list_runs(limit=limit)
    return SimulationListOut(runs=runs, next_cursor=None)


@app.get("/simulate/{run_id}", response_model=SimulationRun)
def fetch_simulation(run_id: str) -> SimulationRun:
    run = get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return run


@app.post("/simulate/by-user", response_model=SimulationRun)
def simulate_by_user(body: SimulateByUserRequest) -> SimulationRun:
    try:
        profile_a = _read_profile(body.user_a)
        profile_b = _read_profile(body.user_b)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="One or both profiles not found")

    persona_a = _persona_from_profile(profile_a)
    persona_b = _persona_from_profile(profile_b)
    req = SimulationRequest(
        persona_a=persona_a,
        persona_b=persona_b,
        turns=body.turns,
        starter="a" if body.starter == "a" else "b",
    )
    run = run_simulation(req, model_name=MODEL_NAME)
    save_run(run)
    return run


# ------------------------------------------------------------------------------
# Live mic transcription (OpenAI)
# ------------------------------------------------------------------------------


def _ensure_no_active_recording() -> None:
    with recording_lock:
        if recording_session:
            raise HTTPException(status_code=409, detail="A recording session is already active")


def _start_mic_recording(samplerate: int, channels: int) -> tuple[str, Path]:
    """
    Start non-blocking microphone recording on the server machine.
    """
    _ensure_no_active_recording()

    session_id = str(uuid4())
    output_path = Path(tempfile.gettempdir()) / f"dd_recording_{session_id}.wav"
    q: queue.Queue = queue.Queue()
    stop_event = threading.Event()

    def audio_callback(indata, frames, time_info, status):  # type: ignore[override]
        if status:
            # Log to stderr to avoid breaking the stream
            print(f"Recording status: {status}")
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
                dtype="int16",
                callback=audio_callback,
            ):
                while not stop_event.is_set():
                    try:
                        data = q.get(timeout=0.1)
                    except queue.Empty:
                        continue
                    audio_file.write(data)

                # Drain any remaining audio after stop
                while not q.empty():
                    audio_file.write(q.get())

    t = threading.Thread(target=writer, daemon=True)
    t.start()

    with recording_lock:
        recording_session.clear()
        recording_session.update(
            {
                "session_id": session_id,
                "stop_event": stop_event,
                "thread": t,
                "path": output_path,
                "samplerate": samplerate,
                "channels": channels,
            }
        )
    return session_id, output_path


def _stop_mic_recording(session_id: str) -> Path:
    with recording_lock:
        sess = recording_session.copy()
    if not sess or sess.get("session_id") != session_id:
        raise HTTPException(status_code=404, detail="Recording session not found")

    stop_event: threading.Event = sess["stop_event"]
    thread: threading.Thread = sess["thread"]
    stop_event.set()
    thread.join(timeout=5)

    with recording_lock:
        recording_session.clear()

    path: Path = sess["path"]
    if not path.exists():
        raise HTTPException(status_code=500, detail="Recorded file missing")
    return path


def _transcribe_file_openai(file_path: Path, model: str, prompt: str | None = None) -> str:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY is not set")
    client = OpenAI(api_key=api_key)
    with open(file_path, "rb") as audio_file:
        resp = client.audio.transcriptions.create(
            model=model,
            file=audio_file,
            prompt=prompt or None,
        )
    return getattr(resp, "text", "") or ""


def _estimate_duration_seconds(path: Path, samplerate: int) -> Optional[float]:
    try:
        with sf.SoundFile(path, "r") as f:
            frames = len(f)
            rate = f.samplerate or samplerate
            return frames / float(rate) if rate else None
    except Exception:
        return None


@app.post("/transcribe/start", response_model=TranscribeStartResponse)
def transcribe_start(body: TranscribeStartRequest | None = None) -> TranscribeStartResponse:
    samplerate = body.samplerate if body and body.samplerate else TRANSCRIBE_SAMPLE_RATE
    channels = body.channels if body and body.channels else TRANSCRIBE_CHANNELS
    if samplerate <= 0 or channels <= 0:
        raise HTTPException(status_code=400, detail="Invalid samplerate or channels")

    session_id, _ = _start_mic_recording(samplerate=samplerate, channels=channels)
    return TranscribeStartResponse(session_id=session_id, samplerate=samplerate, channels=channels)


@app.post("/transcribe/stop", response_model=TranscribeStopResponse)
def transcribe_stop(body: TranscribeStopRequest) -> TranscribeStopResponse:
    path = _stop_mic_recording(body.session_id)
    model = body.model or TRANSCRIBE_MODEL
    prompt = body.prompt or ""
    transcript = _transcribe_file_openai(path, model=model, prompt=prompt)
    duration = _estimate_duration_seconds(path, samplerate=TRANSCRIBE_SAMPLE_RATE)
    try:
        path.unlink(missing_ok=True)
    except Exception:
        pass
    return TranscribeStopResponse(transcript=transcript, duration_seconds=duration)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.api:app", host="0.0.0.0", port=8000, reload=True)

