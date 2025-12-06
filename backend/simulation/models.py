from __future__ import annotations

import datetime as dt
from typing import Any, List, Literal, Optional

from pydantic import BaseModel, Field, HttpUrl


class PersonaSummary(BaseModel):
    display_name: str = Field(..., description="Persona display name")
    ai_summary: str = Field(..., description="Persona AI_summary string")
    persona_json: dict[str, Any] = Field(default_factory=dict, description="Full persona JSON blob")


class Message(BaseModel):
    turn: int
    speaker: Literal["a", "b"]
    text: str


class Trailer(BaseModel):
    high_point: str
    friction_point: str
    vibe: str
    snippet: str
    icebreakers: List[str]


class SimulationRequest(BaseModel):
    persona_a: PersonaSummary
    persona_b: PersonaSummary
    turns: int = Field(20, ge=2, le=50)
    starter: Literal["a", "b"] = "a"


class SimulationRun(BaseModel):
    run_id: str
    created_at: dt.datetime
    persona_a: PersonaSummary
    persona_b: PersonaSummary
    turns: int
    starter: Literal["a", "b"]
    transcript: List[Message]
    trailer: Optional[Trailer] = None
    model: str = "gemini-2.5-flash"


class SimulationListResponse(BaseModel):
    runs: List[SimulationRun]
    next_cursor: Optional[str] = None


class HealthResponse(BaseModel):
    status: str = "ok"
    uptime_seconds: Optional[float] = None

