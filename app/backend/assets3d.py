"""3D Asset Library API: Poly Haven catalogue search, on-demand import (by id or link), the downloaded library, physics
presets, and physics clips rendered as queue jobs (one GPU job at a time, like every other render)."""
from __future__ import annotations

import os
import re

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from app.backend import jobs
from engine import physics as PX
from engine.assets import polyhaven as PH

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CLIPS = os.path.join(ROOT, "work", "physics")
router = APIRouter(prefix="/api/assets3d")

PRESET_INFO = {
    "FALL_AND_BOUNCE": "caer y rebotar (height, restitution, mass)", "FALL_AND_RESET": "caer y volver a empezar (from, to, repeats)",
    "STACK_COLLAPSE": "derrumbe de una pila (push, release)", "DOMINO_CHAIN": "reacción en cadena (push, release)",
    "ROLL_AND_STOP": "rodar y detenerse (velocity, rolling_resistance)", "SPIN_AND_DROP": "girar y caer (height, spin)",
    "OBJECT_IMPACT": "choque entre objetos (target, speed)", "EXPLOSION_IMPULSE": "dispersión por impulso (center, strength)",
    "FLOAT_AND_LAND": "levitar y aterrizar (height, float_frames)", "RETURN_TO_ORIGIN": "regreso animado al origen (at, frames, lift)",
    "LOOPING_PHYSICS": "secuencia repetible (from, to, repeats)", "SLOW_MOTION_IMPACT": "cámara lenta (time_scale)",
    "IMPULSE": "lanzar / empujar (release, velocity, spin)", "CAMERA_ORBIT": "cámara orbitando al final (camera.orbit_end)",
}


@router.get("/search")
def search(q: str = "", category: str | None = None, limit: int = 30):
    cat = PH.AssetCatalog()
    if not q.strip() and category:
        rows = [{"id": k, **v} for k, v in cat.load().items() if category in v["categories"]][:limit]
    else:
        rows = cat.search(q, category, limit)
    reg = PH.AssetRegistry().all()
    for r in rows:
        r["downloaded"] = r["id"] in reg
        r["source"] = "Poly Haven"
    return {"results": rows, "credit": PH.CREDIT}


@router.get("/categories")
def categories():
    counts: dict[str, int] = {}
    for v in PH.AssetCatalog().load().values():
        for c in v["categories"]:
            if not c.startswith("collection:"):
                counts[c] = counts.get(c, 0) + 1
    return sorted(({"name": k, "count": n} for k, n in counts.items()), key=lambda r: -r["count"])


@router.get("/downloaded")
def downloaded():
    return list(PH.AssetRegistry().all().values())


class ImportReq(BaseModel):
    ref: str = Field(..., max_length=300)            # asset id or https://polyhaven.com/a/<id>
    res: str = Field("1k", pattern=r"^(1k|2k|4k)$")


@router.post("/import")
def import_asset(r: ImportReq):
    try:
        return PH.AssetCache().model(r.ref, r.res)
    except PH.PolyHavenError as e:
        raise HTTPException(400, str(e))


@router.get("/presets")
def presets():
    return [{"name": k, "help": v} for k, v in PRESET_INFO.items()]


class PhysicsReq(BaseModel):
    spec: dict | None = None
    text: str | None = Field(None, max_length=600)
    quality: str = Field("standard", pattern=r"^(draft|standard|high)$")


@router.post("/physics")
def physics(r: PhysicsReq):
    if not r.spec and not r.text:
        raise HTTPException(400, "send a scene spec or a description")
    return jobs.submit(None, "physics", {"spec": r.spec, "text": r.text, "quality": r.quality})


@router.get("/clips/{jid}/video")
def clip(jid: str):
    if not re.fullmatch(r"[0-9a-f]{12}", jid):
        raise HTTPException(404)
    p = os.path.join(CLIPS, jid, "physics.mp4")
    if not os.path.exists(p):
        raise HTTPException(404, "not rendered yet")
    return FileResponse(p, media_type="video/mp4")


def h_physics(_pid, params: dict, ctx) -> dict:
    """queue job: description / spec -> Blender rigid-body clip -> MP4 + verification report"""
    notes = []
    spec = params.get("spec")
    if not spec:
        spec, notes = PX.from_text(params["text"])
    ctx.progress("physics", 0.1, "resolving Poly Haven assets")
    rep = PX.render(spec, os.path.join(CLIPS, ctx.jid), params.get("quality", "standard"))
    rep["notes"] = notes
    rep["video"] = f"/api/assets3d/clips/{ctx.jid}/video"
    return rep


jobs.HANDLERS["physics"] = h_physics
