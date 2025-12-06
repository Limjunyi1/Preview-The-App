from __future__ import annotations

import datetime as dt
import json
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Optional
from uuid import uuid4

import google.generativeai as genai
import yaml
from dotenv import load_dotenv

from .models import Message, PersonaSummary, SimulationRequest, SimulationRun, Trailer

DEFAULT_MODEL = "gemini-2.5-flash"
MAX_TURNS = 50
REPO_ROOT = Path(__file__).resolve().parent.parent
PROMPT_PATH = REPO_ROOT / "Prompts" / "simulationPrompt.yaml"


def _load_prompts() -> dict:
    with open(PROMPT_PATH, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


PROMPTS = _load_prompts()


def _strip_code_fence(text: str) -> str:
    """Remove ```json fences if present."""
    fence_pattern = r"```(?:json)?\s*(.*?)\s*```"
    match = re.search(fence_pattern, text, flags=re.DOTALL | re.IGNORECASE)
    return match.group(1) if match else text


def _build_system_instruction(persona: PersonaSummary) -> str:
    """Persona-specific system prompt with safety guidance."""
    persona_blob = json.dumps(persona.persona_json or {}, indent=2)
    template = PROMPTS.get("agent_system_prompt", "")
    return template.format(
        display_name=persona.display_name,
        ai_summary=persona.ai_summary,
        persona_json=persona_blob,
    )


@dataclass
class ChatSession:
    """Light wrapper over a Gemini chat session."""

    display_name: str
    chat: object

    def send(self, prompt: str) -> str:
        resp = self.chat.send_message(prompt)
        text = getattr(resp, "text", "") or ""
        return text.strip()


def _init_chat(persona: PersonaSummary, api_key: str, model_name: str = DEFAULT_MODEL) -> ChatSession:
    genai.configure(api_key=api_key)
    system_instruction = _build_system_instruction(persona)
    model = genai.GenerativeModel(model_name=model_name, system_instruction=system_instruction)
    chat = model.start_chat()
    return ChatSession(display_name=persona.display_name, chat=chat)


def _build_summary_prompt(transcript: list[Message], persona_a: PersonaSummary, persona_b: PersonaSummary) -> str:
    lines = []
    for msg in transcript:
        speaker = persona_a.display_name if msg.speaker == "a" else persona_b.display_name
        lines.append(f"{speaker}: {msg.text}")
    convo = "\n".join(lines)
    template = PROMPTS.get("summary_prompt", "")
    return template.format(conversation=convo)


def _summarize_transcript(
    transcript: list[Message],
    persona_a: PersonaSummary,
    persona_b: PersonaSummary,
    api_key: str,
    model_name: str = DEFAULT_MODEL,
) -> Optional[Trailer]:
    prompt = _build_summary_prompt(transcript, persona_a, persona_b)
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(model_name=model_name)
    resp = model.generate_content(prompt)
    raw = getattr(resp, "text", "") or ""
    cleaned = _strip_code_fence(raw)
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        return None
    try:
        return Trailer(
            high_point=data.get("high_point", ""),
            friction_point=data.get("friction_point", ""),
            vibe=data.get("vibe", ""),
            snippet=data.get("snippet", ""),
            icebreakers=data.get("icebreakers", []) or [],
        )
    except Exception:
        return None


def run_simulation(
    request: SimulationRequest,
    *,
    api_key: Optional[str] = None,
    model_name: str = DEFAULT_MODEL,
    chat_factory: Optional[Callable[[PersonaSummary], ChatSession]] = None,
    summarize: bool = True,
) -> SimulationRun:
    """Execute a fixed-turn, two-agent chat simulation."""
    if request.turns < 2 or request.turns > MAX_TURNS:
        raise ValueError(f"turns must be between 2 and {MAX_TURNS}")

    load_dotenv()
    api_key = api_key or os.getenv("GEMINI_API_KEY")
    needs_key = summarize or chat_factory is None
    if needs_key and not api_key:
        raise RuntimeError("GEMINI_API_KEY is required")

    factory = chat_factory or (lambda persona: _init_chat(persona, api_key=api_key, model_name=model_name))

    chat_a = factory(request.persona_a)
    chat_b = factory(request.persona_b)
    speakers = {"a": chat_a, "b": chat_b}
    names = {"a": request.persona_a.display_name, "b": request.persona_b.display_name}

    starter = request.starter
    other = "b" if starter == "a" else "a"
    order = [starter, other]

    transcript: list[Message] = []
    last_text = ""
    for idx in range(request.turns):
        speaker = order[idx % 2]
        chat = speakers[speaker]
        is_first = idx == 0
        if is_first:
            prompt = (
                "Open the conversation naturally with a warm, light greeting and a small talk question. "
                "Keep it playful and concise."
            )
        else:
            prompt = (
                f"Reply to the last message: '{last_text}'. "
                "Keep tone lighthearted and continue the flow; add a curious follow-up."
            )
        text = chat.send(prompt)
        transcript.append(Message(turn=idx + 1, speaker=speaker, text=text))
        last_text = text

    trailer = None
    if summarize:
        trailer = _summarize_transcript(transcript, request.persona_a, request.persona_b, api_key=api_key or "", model_name=model_name)

    return SimulationRun(
        run_id=str(uuid4()),
        created_at=dt.datetime.utcnow(),
        persona_a=request.persona_a,
        persona_b=request.persona_b,
        turns=request.turns,
        starter=request.starter,
        transcript=transcript,
        trailer=trailer,
        model=model_name,
    )

