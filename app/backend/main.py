"""AI Reels Studio API (FastAPI). Listens on 127.0.0.1 only. Serves the built UI from app/frontend/dist."""
from __future__ import annotations

import hashlib
import io
import json
import os
import re
import shutil
import subprocess
import sys
import uuid
import zipfile

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from fastapi import FastAPI, HTTPException, UploadFile, File, Form  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse  # noqa: E402
from fastapi.staticfiles import StaticFiles  # noqa: E402
from pydantic import BaseModel, Field  # noqa: E402

from app.backend import db, jobs  # noqa: E402
from engine import pipeline as P  # noqa: E402
from engine.story.schema import Plan  # noqa: E402

app = FastAPI(title="AI Reels Studio", version="0.1.0", docs_url="/api/docs", openapi_url="/api/openapi.json")
app.add_middleware(CORSMiddleware, allow_origins=["http://127.0.0.1:5173", "http://localhost:5173", "http://127.0.0.1:8777", "http://127.0.0.1:8778", "http://127.0.0.1:8779"],
                   allow_methods=["*"], allow_headers=["*"])
SETTINGS = os.path.join(ROOT, "data", "settings.json")
MAX_UPLOAD = 200 * 1024 * 1024
ALLOWED = {".png": "image", ".jpg": "image", ".jpeg": "image", ".svg": "image", ".wav": "audio", ".mp3": "audio", ".mp4": "video",
           ".glb": "model", ".gltf": "model", ".ttf": "font", ".otf": "font"}
MAGIC = {".png": [b"\x89PNG"], ".jpg": [b"\xff\xd8\xff"], ".jpeg": [b"\xff\xd8\xff"], ".wav": [b"RIFF"], ".mp3": [b"ID3", b"\xff\xfb", b"\xff\xf3", b"\xff\xf2"],
         ".mp4": [b"ftyp"], ".glb": [b"glTF"], ".ttf": [b"\x00\x01\x00\x00", b"true"], ".otf": [b"OTTO"]}


def settings() -> dict:
    d = {"ollamaModel": None, "voiceEn": "af_heart", "voiceEs": "ef_dora", "quality": "master", "provider": "auto", "musicDb": -10, "qaThreshold": 7}
    d.update(P.load_json(SETTINGS, {}) or {})
    return d


def safe_name(s: str) -> str:
    s = re.sub(r"[^\w.\- ]", "_", os.path.basename(s or "file"))[:80].strip(" .")
    return s or "file"


def new_pid(title: str) -> str:
    return (P.slug(title)[:32] or "video") + "-" + uuid.uuid4().hex[:6]


def project_or_404(pid: str) -> dict:
    r = db.q("SELECT * FROM projects WHERE id=?", (pid,), one=True)
    if not r:
        raise HTTPException(404, "project not found")
    return db.row(r)


def touch(pid: str, **kw):
    sets = ", ".join(f"{k}=?" for k in kw) + (", " if kw else "") + "updated=?"
    db.ex(f"UPDATE projects SET {sets} WHERE id=?", (*kw.values(), db.now(), pid))


# ------------------------------------------------------------------ system
@app.get("/api/health")
def health():
    return {"ok": True, "app": "ai-reels-studio", "version": app.version}


@app.get("/api/diagnostics")
def diagnostics():
    from app.backend.diag import run
    return run()


@app.get("/api/options")
def options():
    from engine.audio.tts import VOICES
    from engine.providers.planner import ollama_models
    return {"voices": VOICES, "qualities": P.QUALITY, "styles": ["storybook", "cinematic_explainer", "minimal_stickman", "product_ad", "custom_brand"],
            "environments": ["village_square", "market", "street", "park", "interior", "harbour"], "durations": [15, 30, 45, 60, 90],
            "roles": ["villager_woman", "villager_man", "kid", "official", "musician", "baker", "barista", "scholar", "customer", "elder", "worker"],
            "shots": ["wide", "medium", "close", "low", "high", "two_shot", "insert"], "lights": ["day", "golden", "night"],
            "moods": ["whimsical", "curious", "tense", "warm", "upbeat"],
            "expressions": ["neutral", "stern", "grin", "laugh", "whistle", "nervous", "shock", "relief", "relief_open", "dazed", "pained", "smile", "smile_closed", "lick"],
            "products": ["coffee", "croissant", "bread", "cake", "lightbulb", "question", "exclaim", "heart", "clock", "book", "note", "scroll"],
            "actions": ["stand", "walk", "dance", "sit", "wave", "march", "stroll"], "ollamaModels": ollama_models(), "settings": settings()}


class SettingsIn(BaseModel):
    ollamaModel: str | None = None
    voiceEn: str | None = None
    voiceEs: str | None = None
    quality: str | None = None
    provider: str | None = None
    musicDb: float | None = None
    qaThreshold: float | None = None


@app.put("/api/settings")
def put_settings(s: SettingsIn):
    d = settings()
    d.update({k: v for k, v in s.model_dump().items() if v is not None})
    P.save_json(SETTINGS, d)
    return d


# ------------------------------------------------------------------ projects
class ProjectIn(BaseModel):
    title: str = Field(min_length=2, max_length=120)
    idea: str = Field("", max_length=4000)
    script: str = Field("", max_length=12000)
    kind: str = Field("story", pattern="^(story|ad|explainer)$")
    lang: str = Field("en", pattern="^(en|es)$")
    seconds: int = Field(60, ge=10, le=120)
    quality: str = Field("master", pattern="^(draft|standard|master)$")
    style: str = "storybook"
    environment: str = Field("village_square", pattern="^(village_square|market|street|park|interior|harbour|beach|ocean|troy|cave|throne|apartment|bathroom|office|hotel|airport|suburb|lake|resort|outback|cabin|bedroom|kitchen|banquet|gameroom|shops|trading|clinic|datacenter|tunnel|warehouse|canal|island|bridge)$")
    voice: str | None = None
    speed: float = Field(1.0, ge=0.7, le=1.4)
    clientId: str | None = None
    cta: str | None = Field(None, max_length=80)
    audience: str | None = Field(None, max_length=200)
    research: bool = True
    captions: bool = True
    graphics: str = Field("full", pattern="^(simple|full)$")
    music: bool = True
    variants: int = Field(1, ge=1, le=4)
    provider: str = Field("auto", pattern="^(auto|ollama|template|claude)$")
    review: str = Field("auto_qa", pattern="^(auto_qa|approve_script|script_only)$")
    seed: int = 7
    autostart: bool = True


@app.get("/api/projects")
def list_projects(archived: int = 0):
    rows = [db.row(r) for r in db.q("SELECT * FROM projects WHERE archived=? ORDER BY updated DESC", (archived,))]
    for r in rows:
        m = P.manifest(r["id"])
        r["steps"] = m.get("steps", {})
        out = P.pdir(r["id"], "output")
        r["videos"] = sorted([f for f in os.listdir(out) if f.endswith(".mp4") and "_v" in f]) if os.path.isdir(out) else []
        thumb = P.pdir(r["id"], "qa", "frames")
        r["thumb"] = None
        for cand in (P.pdir(r["id"], "preview", "poster.jpg"),):
            if os.path.exists(cand):
                r["thumb"] = "preview/poster.jpg"
        if not r["thumb"] and os.path.isdir(P.pdir(r["id"], "preview")):
            fs = sorted(f for f in os.listdir(P.pdir(r["id"], "preview")) if f.startswith("f_"))
            r["thumb"] = f"preview/{fs[len(fs) // 3]}" if fs else None
        r["jobs"] = [db.row(j) for j in db.q("SELECT id, kind, status, progress, step, message FROM jobs WHERE project_id=? ORDER BY created DESC LIMIT 3", (r["id"],))]
        _ = thumb
    return rows


def client_brand(cid: str | None) -> dict | None:
    if not cid:
        return None
    c = db.row(db.q("SELECT * FROM clients WHERE id=?", (cid,), one=True))
    if not c:
        return None
    return {"name": c["name"], "primary": c["primary_color"], "secondary": c["secondary_color"], "text": c["text_color"], "tagline": c["tagline"] or None}


@app.post("/api/projects")
def create_project(p: ProjectIn):
    pid = new_pid(p.title)
    P.ensure_dirs(pid)
    params = p.model_dump()
    db.ex("INSERT INTO projects (id, title, kind, lang, style, client_id, status, quality, duration, created, updated, params) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
          (pid, p.title, p.kind, p.lang, p.style, p.clientId, "draft", p.quality, None, db.now(), db.now(), json.dumps(params)))
    P.save_json(P.pdir(pid, "input", "request.json"), params)
    P.update_manifest(pid, title=p.title, created=db.now(), request=params)
    out = {"id": pid}
    if p.autostart:
        kind = "script" if p.review == "script_only" else "plan" if p.review == "approve_script" else "create"
        out["job"] = jobs.submit(pid, kind, {})
        if p.variants > 1:
            out["variants"] = []
            for k in range(1, p.variants):
                vp = p.model_copy(update={"title": f"{p.title} (variant {k + 1})", "seed": p.seed + 101 * k, "variants": 1})
                out["variants"].append(create_project(vp))
    return out


@app.get("/api/projects/{pid}")
def get_project(pid: str):
    r = project_or_404(pid)
    r["manifest"] = P.manifest(pid)
    r["plan"] = P.load_json(P.pdir(pid, "plan.json"))
    r["storyboard"] = P.load_json(P.pdir(pid, "storyboard", "storyboard.json"))
    r["words"] = (P.load_json(P.pdir(pid, "audio", "words.json")) or {}).get("words")
    r["mix"] = P.load_json(P.pdir(pid, "audio", "mix_report.json"))
    r["qa"] = P.load_json(P.pdir(pid, "qa", "qa_report.json"))
    prev = P.pdir(pid, "preview")
    r["stills"] = sorted(f for f in os.listdir(prev) if f.startswith("f_")) if os.path.isdir(prev) else []
    out = P.pdir(pid, "output")
    r["videos"] = sorted([f for f in os.listdir(out) if f.endswith(".mp4") and "_v" in f], key=lambda f: os.path.getmtime(os.path.join(out, f))) if os.path.isdir(out) else []
    r["jobs"] = [db.row(j) for j in db.q("SELECT * FROM jobs WHERE project_id=? ORDER BY created DESC LIMIT 20", (pid,))]
    r["reviews"] = [db.row(x) for x in db.q("SELECT * FROM reviews WHERE project_id=? ORDER BY id DESC", (pid,))]
    r["versions"] = sorted(os.listdir(P.pdir(pid, "versions")), reverse=True) if os.path.isdir(P.pdir(pid, "versions")) else []
    return r


class PatchProject(BaseModel):
    title: str | None = None
    archived: int | None = None
    clientId: str | None = None


@app.patch("/api/projects/{pid}")
def patch_project(pid: str, body: PatchProject):
    project_or_404(pid)
    if body.title:
        touch(pid, title=body.title)
    if body.archived is not None:
        touch(pid, archived=body.archived)
    if body.clientId is not None:
        touch(pid, client_id=body.clientId or None)
    return project_or_404(pid)


@app.post("/api/projects/{pid}/duplicate")
def duplicate(pid: str, title: str | None = None):
    src = project_or_404(pid)
    nid = new_pid(title or src["title"] + " copy")
    P.ensure_dirs(nid)
    # copy inputs, plan, voice, timings, storyboard and the scene render cache (so unchanged scenes are reused)
    for sub in ("input", "script", "audio", "storyboard", "scenes", "preview"):
        s, d = P.pdir(pid, sub), P.pdir(nid, sub)
        if os.path.isdir(s):
            shutil.copytree(s, d, dirs_exist_ok=True)
    plan = P.load_json(P.pdir(pid, "plan.json"))
    if plan:   # the copy carries its own title (used for export file names and the manifest)
        plan["title"] = title or src["title"] + " (copy)"
        P.save_json(P.pdir(nid, "plan.json"), plan)
    params = src.get("params") or {}
    db.ex("INSERT INTO projects (id, title, kind, lang, style, client_id, status, quality, duration, created, updated, parent_id, params) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
          (nid, title or src["title"] + " (copy)", src["kind"], src["lang"], src["style"], src["client_id"], "draft", src["quality"], src["duration"], db.now(), db.now(), pid, json.dumps(params)))
    P.update_manifest(nid, title=title or src["title"] + " (copy)", parent=pid)
    return {"id": nid}


@app.get("/api/projects/{pid}/plan")
def get_plan(pid: str):
    project_or_404(pid)
    return P.load_json(P.pdir(pid, "plan.json")) or JSONResponse({"detail": "no plan yet"}, 404)


@app.put("/api/projects/{pid}/plan")
def put_plan(pid: str, plan: dict):
    project_or_404(pid)
    try:
        pl = Plan.model_validate(plan)
    except Exception as e:
        raise HTTPException(422, f"plan does not validate: {e}")
    P.step_script(pid, pl)
    touch(pid, title=pl.title, status="plan_edited")
    return pl.model_dump()


@app.get("/api/projects/{pid}/claude-prompt")
def claude_prompt(pid: str):
    from engine.providers.planner import claude_prompt as cp
    r = project_or_404(pid)
    p = r.get("params") or {}
    txt = cp(p.get("idea") or r["title"], p.get("kind", "story"), p.get("lang", "en"), p.get("seconds", 60), p.get("environment", "village_square"),
             client_brand(r.get("client_id")), p.get("cta"))
    path = P.pdir(pid, "script", "CLAUDE_PROMPT.md")
    with open(path, "w", encoding="utf-8") as f:
        f.write(txt)
    return {"prompt": txt, "file": os.path.relpath(path, ROOT)}


class SceneEdit(BaseModel):
    light: str | None = None
    shot: str | None = None
    narration: str | None = None
    mood: str | None = None
    transition: str | None = None
    focus: str | None = None
    characters: list[dict] | None = None
    fx: list[dict] | None = None
    text: str | None = None
    environment: str | None = None
    dofCInf: float | None = None
    push: float | None = None


@app.put("/api/projects/{pid}/beats/{idx}")
def edit_beat(pid: str, idx: int, e: SceneEdit):
    """edit one beat of the plan (the editor's inspector). Changing narration needs a new voice; other edits only
    invalidate that scene's render segment."""
    project_or_404(pid)
    plan = P.load_json(P.pdir(pid, "plan.json"))
    if not plan or idx < 0 or idx >= len(plan["beats"]):
        raise HTTPException(404, "beat not found")
    b = plan["beats"][idx]
    for k in ("light", "shot", "narration", "mood", "transition", "focus", "characters", "fx", "text", "environment"):
        v = getattr(e, k)
        if v is not None:
            b[k] = (v or None) if k == "environment" else v   # environment "" = back to the project location
    pl = Plan.model_validate(plan)
    P.step_script(pid, pl)
    over = P.load_json(P.pdir(pid, "storyboard", "overrides.json"), {})
    sid = f"b{idx + 1:02d}"
    if e.dofCInf is not None or e.push is not None:
        o = over.get(sid, {})
        if e.dofCInf is not None:
            o["dof"] = {"cInf": e.dofCInf, **({"focusActor": 0} if e.dofCInf > 0 else {})}
        if e.push is not None:
            o["push"] = e.push
        over[sid] = o
        P.save_json(P.pdir(pid, "storyboard", "overrides.json"), over)
    needs_voice = e.narration is not None
    touch(pid, status="edited")
    return {"beat": pl.beats[idx].model_dump(), "needsVoice": needs_voice}


# ------------------------------------------------------------------ jobs
class JobIn(BaseModel):
    kind: str = Field(pattern="^(create|plan|script|redirect|produce|voice|storyboard|stills|render|mix|qa|regen_scene|export)$")
    params: dict = Field(default_factory=dict)


@app.post("/api/projects/{pid}/jobs")
def new_job(pid: str, j: JobIn):
    project_or_404(pid)
    return jobs.submit(pid, j.kind, j.params)


@app.get("/api/jobs")
def list_jobs(limit: int = 50):
    return [db.row(j) for j in db.q("SELECT id, project_id, kind, status, progress, step, message, created, started, finished, error FROM jobs ORDER BY created DESC LIMIT ?", (limit,))]


@app.get("/api/jobs/{jid}")
def get_job(jid: str):
    j = jobs.get(jid)
    if not j:
        raise HTTPException(404, "job not found")
    return j


@app.post("/api/jobs/{jid}/cancel")
def cancel_job(jid: str):
    j = jobs.cancel(jid)
    if not j:
        raise HTTPException(404, "job not found")
    return j


@app.post("/api/jobs/{jid}/retry")
def retry_job(jid: str):
    j = jobs.get(jid)
    if not j:
        raise HTTPException(404, "job not found")
    return jobs.submit(j["project_id"], j["kind"], j["params"] or {})


# ------------------------------------------------------------------ files
@app.get("/api/projects/{pid}/files/{path:path}")
def project_file(pid: str, path: str):
    project_or_404(pid)
    base = os.path.realpath(P.pdir(pid))
    full = os.path.realpath(os.path.join(base, path))
    if not full.startswith(base + os.sep) or not os.path.isfile(full):
        raise HTTPException(404, "file not found")
    return FileResponse(full)


@app.post("/api/projects/{pid}/voice")
async def upload_voice(pid: str, file: UploadFile = File(...)):
    project_or_404(pid)
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in (".wav", ".mp3"):
        raise HTTPException(415, "voice must be WAV or MP3")
    data = await file.read(MAX_UPLOAD + 1)
    if len(data) > MAX_UPLOAD:
        raise HTTPException(413, "file too large (200 MB max)")
    if not any(data[:16].startswith(m) or m in data[:16] for m in MAGIC[ext]):
        raise HTTPException(415, "file content does not match its extension")
    raw = P.pdir(pid, "input", "voice_upload" + ext)
    with open(raw, "wb") as f:
        f.write(data)
    from engine.audio.tts import import_voice
    dur = import_voice(raw, P.pdir(pid, "input", "voice_user.wav"))
    return {"ok": True, "duration": dur, "note": "Only upload voices you own or have explicit permission to use."}


@app.delete("/api/projects/{pid}/voice")
def remove_voice(pid: str):
    project_or_404(pid)
    for f in ("voice_user.wav",):
        p = P.pdir(pid, "input", f)
        if os.path.exists(p):
            os.remove(p)
    return {"ok": True}


class ReviewIn(BaseModel):
    approved: bool
    scores: dict = Field(default_factory=dict)
    notes: str = Field("", max_length=4000)
    video: str | None = None


@app.post("/api/projects/{pid}/review")
def review(pid: str, r: ReviewIn):
    project_or_404(pid)
    rep = P.load_json(P.pdir(pid, "qa", "qa_report.json"))
    if r.approved and rep and not rep.get("technicalPass"):
        raise HTTPException(409, "cannot approve: the technical QA has blocking failures")
    thr = settings()["qaThreshold"]
    low = [k for k, v in r.scores.items() if isinstance(v, (int, float)) and v < thr]
    if r.approved and low:
        raise HTTPException(409, f"cannot approve: areas under the threshold {thr}: {', '.join(low)}")
    db.ex("INSERT INTO reviews (project_id, video, approved, scores, notes, created) VALUES (?,?,?,?,?,?)",
          (pid, r.video, int(r.approved), json.dumps(r.scores), r.notes, db.now()))
    if rep is not None:
        rep["approved"] = r.approved
        rep["humanScores"] = r.scores
        rep["humanNotes"] = r.notes
        P.save_json(P.pdir(pid, "qa", "qa_report.json"), rep)
        from engine.quality.qa import write_md
        write_md(rep, P.pdir(pid, "qa", "QUALITY_REPORT.md"))
    touch(pid, status="approved" if r.approved else "changes_requested")
    return {"ok": True}


@app.get("/api/projects/{pid}/export.zip")
def export_zip(pid: str, quality: str = "standard"):
    project_or_404(pid)
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        latest = P.pdir(pid, "output", f"latest_{quality}.mp4")
        vids = [f for f in os.listdir(P.pdir(pid, "output")) if f.endswith(".mp4") and f"_{quality}_v" in f]
        if vids:
            newest = max(vids, key=lambda f: os.path.getmtime(P.pdir(pid, "output", f)))
            z.write(P.pdir(pid, "output", newest), newest)
        elif os.path.exists(latest):
            z.write(latest, "video.mp4")
        for rel in ("audio/stem_voice.wav", "audio/mix.wav", "script/SCRIPT.md", "script/FACTS.md", "storyboard/storyboard.json", "plan.json",
                    "qa/QUALITY_REPORT.md", "manifest.json", "output/captions.srt", "preview/poster.jpg"):
            p = P.pdir(pid, *rel.split("/"))
            if os.path.exists(p):
                z.write(p, rel.replace("/", "_") if "/" in rel else rel)
    buf.seek(0)
    return StreamingResponse(buf, media_type="application/zip", headers={"Content-Disposition": f'attachment; filename="{pid}_{quality}.zip"'})


# ------------------------------------------------------------------ clients / brand kits / assets
class ClientIn(BaseModel):
    name: str = Field(min_length=1, max_length=60)
    primary: str = Field("#c8553d", pattern="^#[0-9a-fA-F]{6}$")
    secondary: str = Field("#f2c94c", pattern="^#[0-9a-fA-F]{6}$")
    text: str = Field("#ffffff", pattern="^#[0-9a-fA-F]{6}$")
    tagline: str | None = Field(None, max_length=60)
    font: str | None = Field(None, max_length=60)
    cta: str | None = Field(None, max_length=80)
    claims: list[str] = Field(default_factory=list)
    notes: str | None = Field(None, max_length=2000)


@app.get("/api/clients")
def clients():
    out = [db.row(c) for c in db.q("SELECT * FROM clients ORDER BY name")]
    for c in out:
        c["assets"] = db.q("SELECT id, kind, filename, license, size, created FROM assets WHERE client_id=?", (c["id"],))
    return out


@app.post("/api/clients")
def create_client(c: ClientIn):
    cid = P.slug(c.name)[:24] + "-" + uuid.uuid4().hex[:4]
    db.ex("INSERT INTO clients (id, name, primary_color, secondary_color, text_color, tagline, font, cta, claims, notes, created) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
          (cid, c.name, c.primary, c.secondary, c.text, c.tagline, c.font, c.cta, json.dumps(c.claims), c.notes, db.now()))
    os.makedirs(os.path.join(ROOT, "assets", "clients", cid), exist_ok=True)
    return db.row(db.q("SELECT * FROM clients WHERE id=?", (cid,), one=True))


@app.put("/api/clients/{cid}")
def update_client(cid: str, c: ClientIn):
    if not db.q("SELECT id FROM clients WHERE id=?", (cid,), one=True):
        raise HTTPException(404, "client not found")
    db.ex("UPDATE clients SET name=?, primary_color=?, secondary_color=?, text_color=?, tagline=?, font=?, cta=?, claims=?, notes=? WHERE id=?",
          (c.name, c.primary, c.secondary, c.text, c.tagline, c.font, c.cta, json.dumps(c.claims), c.notes, cid))
    return db.row(db.q("SELECT * FROM clients WHERE id=?", (cid,), one=True))


@app.post("/api/assets")
async def upload_asset(file: UploadFile = File(...), clientId: str = Form(""), license: str = Form(...), source: str = Form("")):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED:
        raise HTTPException(415, f"type not allowed ({ext}); allowed: {', '.join(ALLOWED)}")
    if not license.strip():
        raise HTTPException(422, "license / rights are required for every asset")
    data = await file.read(MAX_UPLOAD + 1)
    if len(data) > MAX_UPLOAD:
        raise HTTPException(413, "file too large (200 MB max)")
    if ext in MAGIC and not any(m in data[:16] for m in MAGIC[ext]):
        raise HTTPException(415, "file content does not match its extension")
    if ext == ".svg" and (b"<script" in data.lower() or b"javascript:" in data.lower()):
        raise HTTPException(415, "SVG with scripts is not allowed")
    if ext == ".gltf":
        try:
            json.loads(data.decode("utf-8"))
        except Exception:
            raise HTTPException(415, "invalid glTF JSON")
    if clientId and not db.q("SELECT id FROM clients WHERE id=?", (clientId,), one=True):
        raise HTTPException(404, "client not found")
    aid = uuid.uuid4().hex[:12]
    folder = os.path.join(ROOT, "assets", "clients", clientId) if clientId else os.path.join(ROOT, "assets", "library")
    os.makedirs(folder, exist_ok=True)
    name = f"{aid}_{safe_name(file.filename)}"
    path = os.path.join(folder, name)
    with open(path, "wb") as f:
        f.write(data)
    sha = hashlib.sha256(data).hexdigest()
    db.ex("INSERT INTO assets (id, client_id, kind, filename, path, license, source, sha256, size, created) VALUES (?,?,?,?,?,?,?,?,?,?)",
          (aid, clientId or None, ALLOWED[ext], safe_name(file.filename), os.path.relpath(path, ROOT), license.strip()[:200], source[:300], sha, len(data), db.now()))
    return {"id": aid, "kind": ALLOWED[ext], "sha256": sha, "size": len(data)}


@app.get("/api/library")
def library():
    kenney = os.path.join(ROOT, "engine", "remotion", "public", "bridge", "kenney")
    models = sorted(f[:-4] for f in os.listdir(kenney) if f.endswith(".glb")) if os.path.isdir(kenney) else []
    from engine.audio.tts import VOICES
    from engine.audio.score import MOODS
    return {
        "models": [{"name": m, "license": "CC0 1.0", "source": "Kenney Nature Kit / Fantasy Town Kit (kenney.nl)"} for m in models],
        "characters": [{"role": r, "license": "original (this app)", "source": "Canvas2D toon.ts (MIT template, our wardrobe)"} for r in options()["roles"]],
        "products": [{"name": p, "license": "original (this app)"} for p in options()["products"]],
        "environments": [{"name": e, "license": "original procedural + CC0 props"} for e in options()["environments"]],
        "music": [{"mood": k, "bpm": v["bpm"], "license": "original, synthesized locally"} for k, v in MOODS.items()],
        "sfx": [{"name": n, "license": "original, synthesized locally"} for n in ["whoosh", "thump", "pop", "ding", "birds", "breeze", "crickets", "crowd babble"]],
        "voices": [{"id": v, "label": l, "lang": lang, "license": "Kokoro-82M Apache-2.0"} for lang, vs in VOICES.items() for v, l in vs],
        "uploaded": db.q("SELECT id, client_id, kind, filename, license, source, size, created FROM assets ORDER BY created DESC"),
    }


# ------------------------------------------------------------------ storage
def _size(p: str) -> int:
    t = 0
    for dp, _d, fs in os.walk(p):
        for f in fs:
            try:
                t += os.path.getsize(os.path.join(dp, f))
            except OSError:
                pass
    return t


@app.get("/api/storage")
def storage():
    du = shutil.disk_usage(ROOT)
    parts = {k: _size(os.path.join(ROOT, *k.split("/"))) for k in ("projects", "work/remotion-tmp", "work/bundles", "models", "engine/remotion/node_modules", "tools")}
    return {"root": ROOT, "freeGB": round(du.free / 2 ** 30, 1), "totalGB": round(du.total / 2 ** 30, 1), "partsMB": {k: round(v / 2 ** 20, 1) for k, v in parts.items()}}


@app.post("/api/cache/clean")
def clean_cache(keep_bundles: int = 1):
    """only folders owned by AI Reels Studio: work/remotion-tmp/* and old work/bundles/* (never TEMP, never other apps)"""
    if any(j["status"] == "running" for j in db.q("SELECT status FROM jobs WHERE status='running'")):
        raise HTTPException(409, "a job is running; clean the cache when the queue is idle")
    freed = 0
    tmp = os.path.join(ROOT, "work", "remotion-tmp")
    for e in os.listdir(tmp) if os.path.isdir(tmp) else []:
        p = os.path.join(tmp, e)
        freed += _size(p) if os.path.isdir(p) else os.path.getsize(p)
        shutil.rmtree(p, ignore_errors=True) if os.path.isdir(p) else os.remove(p)
    b = os.path.join(ROOT, "work", "bundles")
    if os.path.isdir(b):
        bs = sorted((os.path.join(b, x) for x in os.listdir(b)), key=os.path.getmtime, reverse=True)
        for p in bs[keep_bundles:]:
            freed += _size(p)
            shutil.rmtree(p, ignore_errors=True)
    return {"freedMB": round(freed / 2 ** 20, 1)}


@app.get("/api/logs")
def logs(lines: int = 200):
    p = os.path.join(ROOT, "logs", "backend.log")
    if not os.path.exists(p):
        return {"lines": []}
    with open(p, encoding="utf-8", errors="replace") as f:
        return {"lines": f.readlines()[-lines:]}


# ------------------------------------------------------------------ job handlers
def _plan_for(pid: str, ctx) -> Plan:
    r = project_or_404(pid)
    p = r.get("params") or {}
    existing = P.load_json(P.pdir(pid, "plan.json"))
    if existing:
        return Plan.model_validate(existing)
    from engine.providers import planner
    brand = client_brand(r.get("client_id"))
    if brand and p.get("kind") == "ad":
        c = db.row(db.q("SELECT * FROM clients WHERE id=?", (r["client_id"],), one=True))
        claims = c.get("claims") or []
    else:
        claims = []
    env = p.get("environment", "village_square")
    prov = p.get("provider", "auto")
    seed = int(p.get("seed", 7))
    style = p.get("style", "storybook")
    from engine.story import writer as W
    story = p.get("kind", "story") != "ad"
    coherence: dict = {}
    if story and p.get("script", "").strip():
        # your own script: same sentence-driven visuals as the AI path (what you see follows what you hear)
        ctx.progress("script", 0.3, "turning your script into scenes (no AI): place, people, emotions and objects from each sentence")
        s = W.sentences_to_script(p["script"], r["title"])
        plan, coherence = W.script_to_plan(s, p.get("idea") or p["script"], p.get("lang", "en"), env, seed, style, None, None, p.get("captions", True))
        plan = plan.model_copy(update={"title": r["title"]})
        used = "your script"
    elif story and prov in ("auto", "ollama") and planner.pick_model(settings().get("ollamaModel")):
        model = planner.pick_model(settings().get("ollamaModel"))
        idea, aud = p.get("idea") or r["title"], p.get("audience") or ""
        log = lambda m: ctx.progress("script", -1, m)  # noqa: E731
        try:
            source = None
            if p.get("research", True):
                from engine.story.research import lookup
                ctx.progress("script", 0.08, "0/3 research: looking up the facts of your topic on Wikipedia (only the topic is sent)")
                source = lookup(idea, p.get("lang", "en"))
                if source:
                    with open(P.pdir(pid, "script", "SOURCE.md"), "w", encoding="utf-8") as fh:
                        fh.write(f"# Source: {source['title']}\n\n{source['url']}\n\n{source['text']}\n")
                    ctx.progress("script", -1, f"source found: {source['title']} ({source['url']})")
                else:
                    ctx.progress("script", -1, "no source found (offline or unknown topic): writing without one, facts marked uncertain")
            ctx.progress("script", 0.15, f"1/3 writer ({model}): story about your idea" + (f" for {aud}" if aud else ""))
            s = W.write_script(idea, aud, p.get("lang", "en"), int(p.get("seconds", 60)), model, seed, log=log, source=source)
            ctx.progress("script", 0.5, "2/3 critic: checking relevance and coherence against the source, rewriting weak sentences")
            s, crit = W.critique(s, idea, aud, p.get("lang", "en"), model, log=log, source=source)
            W.unload(model)
            ctx.progress("script", 0.8, "3/3 director: each sentence becomes a scene that shows what is said")
            plan, coherence = W.script_to_plan(s, idea, p.get("lang", "en"), env, seed, style, None, None, p.get("captions", True), crit)
            plan = plan.model_copy(update={"title": r["title"]})
            P.save_json(P.pdir(pid, "script", "critique.json"), crit)
            used = f"ollama:{model} (writer+critic+director)"
        except Exception as e:  # noqa
            W.unload(model)
            ctx.progress("script", -1, f"3-stage writer failed ({str(e)[:160]}); trying the single-pass planner")
            plan, used = planner.ollama_plan(idea, p.get("kind", "story"), p.get("lang", "en"), int(p.get("seconds", 60)), env, brand, p.get("cta"), model, seed)
            plan = plan.model_copy(update={"title": r["title"], "style": style, "captions": p.get("captions", True)})
            used = f"ollama:{used} (single pass)"
    elif p.get("script", "").strip() or prov == "template":
        ctx.progress("script", 0.3, "turning the script into beats (no AI)")
        plan = planner.template_plan(r["title"], p.get("script") or p.get("idea"), p.get("kind", "story"), p.get("lang", "en"), env, brand,
                                     p.get("cta"), seed, style, p.get("captions", True))
        used = "template"
    elif prov in ("auto", "ollama") and planner.pick_model(settings().get("ollamaModel")):
        model = planner.pick_model(settings().get("ollamaModel"))
        ctx.progress("script", 0.2, f"writing the script with {model} (local)")
        try:
            plan, used = planner.ollama_plan(p.get("idea") or r["title"], p.get("kind", "story"), p.get("lang", "en"), int(p.get("seconds", 60)), env, brand,
                                             p.get("cta"), model, seed)
            plan = plan.model_copy(update={"title": r["title"], "style": style, "captions": p.get("captions", True)})
            used = f"ollama:{used}"
        except Exception as e:  # noqa
            ctx.progress("script", -1, f"local model failed ({str(e)[:200]}); using the rule-based writer")
            plan = planner.template_plan(r["title"], p.get("idea") or r["title"], p.get("kind", "story"), p.get("lang", "en"), env, brand, p.get("cta"), seed, style)
            used = "template (fallback)"
    else:
        if not (p.get("idea") or "").strip():
            raise RuntimeError("No local AI available and no script given. Write the script in the form, or use 'Claude-assisted' and import the JSON.")
        plan = planner.template_plan(r["title"], p.get("idea"), p.get("kind", "story"), p.get("lang", "en"), env, brand, p.get("cta"), seed, style)
        used = "template"
    if claims and not plan.verifiedClaims:
        from engine.story.schema import Claim
        plan.verifiedClaims = [Claim(text=c, status="approved_by_client") for c in claims]
    from engine.story.normalize import normalize_plan
    plan, fixes = normalize_plan(plan)   # small local models ignore direction fields: repair before producing
    plan = plan.model_copy(update={"graphics": p.get("graphics", "full")})
    if fixes:
        ctx.progress("script", -1, "plan repaired: " + "; ".join(fixes))
    P.step_script(pid, plan)
    P.update_manifest(pid, scriptProvider=used, planRepairs=fixes, coherence=coherence)
    ctx.progress("script", 1.0, f"{len(plan.beats)} beats by {used}")
    return plan


def h_plan(pid, params, ctx):
    plan = _plan_for(pid, ctx)
    touch(pid, status="awaiting_review")
    return {"_status": "awaiting_review", "beats": len(plan.beats), "words": len(plan.full_text().split())}


def _settings_voice(pid: str, plan: Plan, params: dict) -> tuple[str, float]:
    r = project_or_404(pid)
    p = r.get("params") or {}
    s = settings()
    v = params.get("voice") or p.get("voice") or (s["voiceEn"] if plan.lang == "en" else s["voiceEs"])
    return v, float(params.get("speed") or p.get("speed") or 1.0)


def h_produce(pid, params, ctx):
    plan = _plan_for(pid, ctx)
    r = project_or_404(pid)
    p = r.get("params") or {}
    quality = params.get("quality") or p.get("quality") or "standard"
    voice, speed = _settings_voice(pid, plan, params)
    touch(pid, status="running")
    res = P.produce(pid, plan, quality, voice, speed, music=p.get("music", True), progress=ctx.progress, cancel=ctx.cancelled, register=ctx.register)
    _poster_srt(pid)
    sb = P.load_json(P.pdir(pid, "storyboard", "storyboard.json"))
    touch(pid, status="done" if res["qa"]["technicalPass"] else "qa_failed", duration=sb["durationInFrames"] / sb["fps"], quality=quality)
    return res


def _poster_srt(pid: str):
    sb = P.load_json(P.pdir(pid, "storyboard", "storyboard.json"))
    words = (P.load_json(P.pdir(pid, "audio", "words.json")) or {}).get("words", [])
    # SRT: one cue per scene narration timed on its words
    def ts(t):
        h, rem = divmod(max(0, t), 3600); m, s = divmod(rem, 60)
        return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s % 1) * 1000)):03d}"
    lines, i = [], 0
    from engine.story.director import _tok
    for k, sc in enumerate(sb["scenes"]):
        n = len(_tok(sc.get("narration", "")))
        ws = words[i:i + n]; i += n
        if ws:
            lines += [str(k + 1), f"{ts(ws[0]['s'])} --> {ts(ws[-1]['e'])}", sc["narration"], ""]
    with open(P.pdir(pid, "output", "captions.srt"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    latest = P.pdir(pid, "output", "latest_standard.mp4")
    for qn in ("master", "standard", "draft"):
        c = P.pdir(pid, "output", f"latest_{qn}.mp4")
        if os.path.exists(c):
            latest = c
            break
    if os.path.exists(latest):
        s0 = sb["scenes"][0]
        t = (s0["startFrame"] + s0["endFrame"]) / 2 / sb["fps"]
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", latest, "-frames:v", "1", P.pdir(pid, "preview", "poster.jpg")])


def h_voice(pid, params, ctx):
    plan = _plan_for(pid, ctx)
    v, s = _settings_voice(pid, plan, params)
    P.step_voice(pid, plan, v, s, ctx.progress)
    P.step_align(pid, plan, ctx.progress)
    P.step_storyboard(pid, plan, ctx.progress)
    return {"ok": True}


def h_storyboard(pid, params, ctx):
    plan = _plan_for(pid, ctx)
    if not os.path.exists(P.pdir(pid, "audio", "words.json")):
        return h_voice(pid, params, ctx)
    sb = P.step_storyboard(pid, plan, ctx.progress)
    return {"scenes": len(sb["scenes"])}


def h_stills(pid, params, ctx):
    files = P.step_stills(pid, params.get("frames"), float(params.get("scale", 0.5)), ctx.progress, ctx.cancelled, ctx.register)
    return {"stills": len(files)}


def h_render(pid, params, ctx):
    plan = _plan_for(pid, ctx)
    quality = params.get("quality", "standard")
    if not os.path.exists(P.pdir(pid, "storyboard", "storyboard.json")):
        h_voice(pid, params, ctx)
    else:
        P.step_storyboard(pid, plan, ctx.progress)
    info = P.step_render(pid, quality, ctx.progress, ctx.cancelled, ctx.register)
    P.step_mix(pid, plan, (project_or_404(pid).get("params") or {}).get("music", True), progress=ctx.progress)
    out = P.step_mux(pid, quality)
    q = P.step_qa(pid, out)
    _poster_srt(pid)
    touch(pid, status="done" if q["technicalPass"] else "qa_failed", quality=quality)
    return {"video": os.path.relpath(out, ROOT), "render": info, "qa": {"technicalPass": q["technicalPass"], "blocking": q["blocking"]}}


def h_regen_scene(pid, params, ctx):
    """re-render only what changed: storyboard is rebuilt, render() reuses every segment whose content hash is unchanged"""
    return h_render(pid, params, ctx)


def h_mix(pid, params, ctx):
    plan = _plan_for(pid, ctx)
    rep = P.step_mix(pid, plan, params.get("music", True), float(params.get("musicDb", settings()["musicDb"])), ctx.progress)
    quality = params.get("quality", "standard")
    if os.path.exists(P.pdir(pid, "output", f"video_silent_{quality}.mp4")):
        out = P.step_mux(pid, quality)
        P.step_qa(pid, out)
    return rep["measured"]


def h_qa(pid, params, ctx):
    quality = params.get("quality", "standard")
    return P.step_qa(pid, P.pdir(pid, "output", f"latest_{quality}.mp4"))


# ------------------------------------------------------------------ images from prompts
class ImageIn(BaseModel):
    prompt: str = Field(min_length=3, max_length=1000)
    aspect: str = Field("9:16", pattern="^(9:16|1:1|16:9|4:5)$")
    variants: int = Field(2, ge=1, le=4)
    provider: str = Field("auto", pattern="^(auto|ollama|rules)$")
    spec: dict | None = None   # an edited scene spec (re-render exactly that)


@app.post("/api/images")
def create_image(body: ImageIn):
    return jobs.submit(None, "image", body.model_dump())


@app.post("/api/images/preview-spec")
def image_spec_preview(body: ImageIn):
    """how the prompt will be read (keyword reader, instant) - lets the user check/edit before rendering"""
    from engine.image import rules_spec
    return rules_spec(body.prompt).model_dump()


@app.get("/api/images")
def list_images():
    from engine.image import IMAGES
    out = []
    if os.path.isdir(IMAGES):
        for iid in sorted(os.listdir(IMAGES), reverse=True):
            m = P.load_json(os.path.join(IMAGES, iid, "image.json"))
            if m:
                out.append(m)
    return out


@app.get("/api/images/{iid}/{name}")
def image_file(iid: str, name: str):
    from engine.image import IMAGES
    if not re.fullmatch(r"[\w\-]{6,40}", iid) or not re.fullmatch(r"[\w\-.]{1,60}", name):
        raise HTTPException(404)
    base = os.path.realpath(os.path.join(IMAGES, iid))
    full = os.path.realpath(os.path.join(base, name))
    if not full.startswith(base + os.sep) or not os.path.isfile(full):
        raise HTTPException(404)
    return FileResponse(full)


def h_image(pid, params, ctx):
    from engine import image
    model = None
    if params.get("provider", "auto") in ("auto", "ollama"):
        from engine.providers.planner import pick_model
        model = pick_model(settings().get("ollamaModel"))
    return image.generate(params["prompt"], params.get("aspect", "9:16"), int(params.get("variants", 2)), params.get("provider", "auto"), model,
                          params.get("spec"), ctx.progress, ctx.cancelled, ctx.register)


def h_script_only(pid, params, ctx):
    """script from the prompt: plan + SCRIPT.md + FACTS.md, nothing rendered (approve/edit, then 'Producir todo')"""
    plan = _plan_for(pid, ctx)
    touch(pid, status="awaiting_review")
    return {"_status": "awaiting_review", "beats": len(plan.beats), "words": len(plan.full_text().split())}


def h_redirect(pid, params, ctx):
    """re-direct every scene from its narration (place, people, emotion, objects, events) keeping text and voice;
    then storyboard + stills + render of the scenes that changed"""
    from engine.story import writer as W
    r = project_or_404(pid)
    p = r.get("params") or {}
    plan = Plan.model_validate(P.load_json(P.pdir(pid, "plan.json")))
    crit = P.load_json(P.pdir(pid, "script", "critique.json"))
    new, coh = W.script_to_plan(W.plan_to_script(plan), p.get("idea") or r["title"], plan.lang, plan.environment, plan.seed, plan.style,
                                plan.brand.model_dump() if plan.brand else None, plan.cta, plan.captions, crit)
    new = new.model_copy(update={"title": plan.title, "verifiedClaims": plan.verifiedClaims, "graphics": plan.graphics})
    P.step_script(pid, new)
    P.update_manifest(pid, coherence=coh)
    ctx.progress("script", 1.0, f"scenes re-directed from the narration ({round(100 * coh['visualSupport'])}% show what is said)")
    if params.get("render", True) and os.path.exists(P.pdir(pid, "audio", "words.json")):
        P.step_storyboard(pid, new, ctx.progress)
        P.step_stills(pid, progress=ctx.progress, cancel=ctx.cancelled, register=ctx.register)
        return h_render(pid, {"quality": params.get("quality") or r.get("quality") or "master"}, ctx)
    return {"coherence": coh}


jobs.HANDLERS.update({"image": h_image, "script": h_script_only, "redirect": h_redirect})
jobs.HANDLERS.update({"plan": h_plan, "create": h_produce, "produce": h_produce, "voice": h_voice, "storyboard": h_storyboard, "stills": h_stills,
                      "render": h_render, "regen_scene": h_regen_scene, "mix": h_mix, "qa": h_qa})


def adopt_project_folders():
    """projects/<id>/ folders made by the CLI (or restored from a backup) appear in the app automatically"""
    if not os.path.isdir(P.PROJECTS):
        return
    for pid in os.listdir(P.PROJECTS):
        try:
            if db.q("SELECT id FROM projects WHERE id=?", (pid,), one=True) or not os.path.exists(P.pdir(pid, "plan.json")):
                continue
            plan = P.load_json(P.pdir(pid, "plan.json"))
            sb = P.load_json(P.pdir(pid, "storyboard", "storyboard.json"))
            done = any(f.endswith(".mp4") and "_v" in f for f in os.listdir(P.pdir(pid, "output"))) if os.path.isdir(P.pdir(pid, "output")) else False
            kind = "ad" if plan.get("brand") else "story"
            db.ex("INSERT INTO projects (id, title, kind, lang, style, client_id, status, quality, duration, created, updated, params) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
                  (pid, plan.get("title", pid), kind, plan.get("lang", "en"), plan.get("style", "storybook"), None, "done" if done else "draft", "standard",
                   sb["durationInFrames"] / sb["fps"] if sb else None, db.now(), db.now(), json.dumps({"environment": plan.get("environment"), "lang": plan.get("lang"), "kind": kind})))
        except Exception:  # noqa
            continue


@app.on_event("startup")
def _startup():
    db.migrate()
    adopt_project_folders()
    jobs.start()


DIST = os.path.join(ROOT, "app", "frontend", "dist")
if os.path.isdir(DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST, "assets")), name="ui-assets")

    @app.get("/{full:path}")
    def spa(full: str):
        if full.startswith("api/"):
            raise HTTPException(404)
        f = os.path.join(DIST, full)
        if full and os.path.isfile(f) and os.path.realpath(f).startswith(os.path.realpath(DIST)):
            return FileResponse(f)
        return FileResponse(os.path.join(DIST, "index.html"))

