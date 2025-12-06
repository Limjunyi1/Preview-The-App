from __future__ import annotations

import json
import os
from typing import List, Optional

from dotenv import load_dotenv

from .models import SimulationRun

DEFAULT_STORE = os.path.join(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")), "data", "simulations.jsonl")


def _store_path() -> str:
    load_dotenv()
    return os.getenv("SIM_DATA_PATH", DEFAULT_STORE)


def _ensure_dir(path: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)


def save_run(run: SimulationRun) -> None:
    path = _store_path()
    _ensure_dir(path)
    payload = run.model_dump()
    with open(path, "a", encoding="utf-8") as f:
        f.write(json.dumps(payload, default=str))
        f.write("\n")


def list_runs(limit: int = 50) -> List[SimulationRun]:
    path = _store_path()
    if not os.path.exists(path):
        return []
    runs: List[SimulationRun] = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                data = json.loads(line)
                runs.append(SimulationRun.model_validate(data))
            except Exception:
                continue
            if len(runs) >= limit:
                break
    return runs


def get_run(run_id: str) -> Optional[SimulationRun]:
    path = _store_path()
    if not os.path.exists(path):
        return None
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                data = json.loads(line)
                run = SimulationRun.model_validate(data)
            except Exception:
                continue
            if run.run_id == run_id:
                return run
    return None

