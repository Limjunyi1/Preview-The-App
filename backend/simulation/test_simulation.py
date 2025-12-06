from __future__ import annotations

from backend.simulation.models import PersonaSummary, SimulationRequest
from backend.simulation.simulation import run_simulation


class StubChat:
    def __init__(self, name: str):
        self.name = name
        self.count = 0

    def send(self, prompt: str) -> str:  # noqa: ARG002
        self.count += 1
        return f"{self.name} says line {self.count}"


def stub_factory(persona: PersonaSummary) -> StubChat:
    return StubChat(persona.display_name)


def test_fixed_20_turns_and_alternation():
    persona_a = PersonaSummary(display_name="Marvin", ai_summary="Sample A")
    persona_b = PersonaSummary(display_name="Sarah", ai_summary="Sample B")
    req = SimulationRequest(persona_a=persona_a, persona_b=persona_b, turns=20, starter="b")

    run = run_simulation(req, chat_factory=stub_factory, summarize=False)

    assert len(run.transcript) == 20
    assert run.transcript[0].speaker == "b"
    assert run.transcript[1].speaker == "a"
    assert run.transcript[-1].speaker == ("a" if req.turns % 2 == 0 else "b")
    # Ensure text came from stub and is non-empty
    assert all(msg.text for msg in run.transcript)


def _load_ai_summary(path: str) -> str:
    import json

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    # persona files store AI_summary at top level
    return data["AI_summary"]


def _load_persona(path: str) -> tuple[str, dict]:
    import json

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data["AI_summary"], data


def main():
    # Interactive smoke: run a real 20-turn chat with Marvin and Sarah using Gemini.
    marvin_summary, marvin_blob = _load_persona("profiles/marvin.json")
    sarah_summary, sarah_blob = _load_persona("profiles/sarah.json")

    persona_a = PersonaSummary(display_name="Marvin", ai_summary=marvin_summary, persona_json=marvin_blob)
    persona_b = PersonaSummary(display_name="Sarah", ai_summary=sarah_summary, persona_json=sarah_blob)
    req = SimulationRequest(persona_a=persona_a, persona_b=persona_b, turns=20, starter="a")

    run = run_simulation(req, summarize=False)
    for msg in run.transcript:
        speaker = persona_a.display_name if msg.speaker == "a" else persona_b.display_name
        print(f"[Turn {msg.turn}] {speaker}: {msg.text}")


if __name__ == "__main__":
    main()

