"""
Servicio FastAPI del motor Hexy (capa pesada). Expone la proyección RDF + inferencias
del modelo. Corre como proceso aparte; el backend Node (server/) hace de proxy.

Arranque (desde core/engine/):  uvicorn app:app --port 8000   ·   o:  python app.py
"""

from __future__ import annotations

import json

from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from projector import project
from runtime import run_process, DEFAULT_BUDGET
from context import DEFAULT_CONTEXT_TOKENS

app = FastAPI(title="Hexy Engine", version="0.1.0")

# El dashboard (3000) y el backend (4000) consumen el motor.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:4000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Artifact(BaseModel):
    id: str
    type: str = "artifact"
    name: str = ""
    description: str = ""


class Relationship(BaseModel):
    sourceId: str
    targetId: str
    type: str = "references"


class ProjectRequest(BaseModel):
    artifacts: list[Artifact] = Field(default_factory=list)
    relationships: list[Relationship] = Field(default_factory=list)


@app.get("/health")
def health():
    return {"status": "ok", "engine": "hexy", "version": "0.1.0"}


@app.post("/model/project")
def model_project(req: ProjectRequest):
    """Proyecta el modelo a RDF y devuelve entidades, inferencias, ciclos y estadísticas."""
    return project(req.model_dump())


class RunRequest(ProjectRequest):
    processId: str
    budget: int = DEFAULT_BUDGET
    contextTokens: int = DEFAULT_CONTEXT_TOKENS


@app.post("/run")
def run(req: RunRequest):
    """
    HarnessRuntime (F4): corre el Process y emite la traza por SSE
    (una línea `data: {json}` por entrada: event | observation | violation | done).
    """

    def stream():
        for item in run_process(req.model_dump(), req.processId, req.budget, req.contextTokens):
            yield f"data: {json.dumps(item, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.post("/run/sync")
def run_sync(req: RunRequest):
    """Variante no-streaming (tests / smoke): devuelve la traza completa."""
    return {"trace": list(run_process(req.model_dump(), req.processId, req.budget, req.contextTokens))}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
