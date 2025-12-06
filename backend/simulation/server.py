from __future__ import annotations

import time

from fastapi import FastAPI, HTTPException

from .models import HealthResponse, SimulationListResponse, SimulationRequest, SimulationRun
from .simulation import run_simulation
from .storage import get_run, list_runs, save_run

app = FastAPI(title="DatesDraft Simulation API", version="0.1.0")
_START_TIME = time.time()


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", uptime_seconds=time.time() - _START_TIME)


@app.post("/simulate", response_model=SimulationRun)
def simulate(req: SimulationRequest) -> SimulationRun:
    run = run_simulation(req)
    save_run(run)
    return run


@app.get("/simulate", response_model=SimulationListResponse)
def list_simulations(limit: int = 50) -> SimulationListResponse:
    runs = list_runs(limit=limit)
    return SimulationListResponse(runs=runs, next_cursor=None)


@app.get("/simulate/{run_id}", response_model=SimulationRun)
def fetch_simulation(run_id: str) -> SimulationRun:
    run = get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return run

