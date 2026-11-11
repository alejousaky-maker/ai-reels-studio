"""Physics clips: a scene spec (JSON / dict) or a plain-language description -> a real rigid-body simulation in Blender
with Poly Haven models -> MP4 (H.264, 9:16 1080x1920 or 16:9 1920x1080, 30/60 fps) + a verification report.

    python -m engine.physics demo [out_dir]                    the acceptance demo (crate on a table, a ball falls...)
    python -m engine.physics spec <spec.json>                   any spec
    python -m engine.physics text "<description>" [out_dir]     description -> spec (keyword parser) -> clip
    python -m engine.physics join <out.mp4> <clip1.mp4> ...     combine 10 s clips into a longer video

Spec: {"format": "vertical"|"horizontal", "fps": 30, "seconds": 10, "hdri": "<polyhaven id>",
       "objects": [{"id", "asset": "<polyhaven id or link>" | "procedural": "box|sphere|plank", "position": [x,y,base_z],
                    "body": "active|passive|none", "shape", "mass", "friction", "restitution", ...}],
       "events": [{"preset": "FALL_AND_BOUNCE"|..., "object"/"objects", "params": {...}}],
       "camera": {"follow": [ids], "distance", "height", "orbit_end", "lens", "dof"}}"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
from engine.assets import polyhaven as PH  # noqa: E402

BLENDER = os.path.join(ROOT, "tools", "blender", "blender.exe" if os.name == "nt" else "blender")


def resolve(spec: dict) -> dict:
    """download what the spec needs (models, HDRI) on first use; fails loudly if Poly Haven does not have an asset"""
    s = json.loads(json.dumps(spec))
    for o in s["objects"]:
        if o.get("asset"):
            o["asset_path"] = PH.ensure(o["asset"], o.get("res", "1k"))
    if s.get("hdri"):
        s["hdri_path"] = PH.AssetCache().hdri(s["hdri"])
    return s


def render(spec: dict, out_dir: str, quality: str = "high") -> dict:
    out_dir = os.path.abspath(out_dir)      # Blender resolves relative output paths against the drive root
    os.makedirs(out_dir, exist_ok=True)
    s = resolve(spec)
    s["out"] = os.path.join(out_dir, "frames")
    s.setdefault("samples", {"draft": 8, "standard": 16, "high": 32}[quality])
    s.setdefault("res_percent", {"draft": 50, "standard": 75, "high": 100}[quality])
    sp = os.path.join(out_dir, "spec.json")
    json.dump(s, open(sp, "w", encoding="utf-8"), indent=1)
    t0 = time.time()
    r = subprocess.run([BLENDER, "-b", "--python", os.path.join(ROOT, "engine", "blender", "physics_scene.py"), "--", ROOT, sp],
                       capture_output=True, text=True, cwd=ROOT)
    log = r.stdout + r.stderr
    open(os.path.join(out_dir, "blender.log"), "w", encoding="utf-8").write(log)
    if r.returncode != 0 or "PHYSICS_DONE" not in log:
        raise RuntimeError("Blender physics scene failed, see " + os.path.join(out_dir, "blender.log"))
    fps = int(s.get("fps", 30))
    mp4 = os.path.join(out_dir, "physics.mp4")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(fps), "-i", os.path.join(s["out"], "f_%04d.png"),
                    "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4], check=True)
    rep = json.load(open(os.path.join(s["out"], "report.json"), encoding="utf-8"))
    probe = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate,nb_frames,codec_name",
                            "-show_entries", "format=duration", "-of", "json", mp4], capture_output=True, text=True).stdout
    rep["video"] = json.loads(probe)
    rep["seconds_to_render"] = round(time.time() - t0, 1)
    rep["credits"] = PH.CREDIT if any(o.get("asset") for o in spec["objects"]) or spec.get("hdri") else ""
    if rep["credits"]:
        open(os.path.join(out_dir, "credits.txt"), "w", encoding="utf-8").write(rep["credits"] + "\n")
    json.dump(rep, open(os.path.join(out_dir, "report.json"), "w", encoding="utf-8"), indent=1)
    return rep


def join(out: str, clips: list[str]):
    """combine clips (e.g. four 10 s clips -> one 40 s video), same size / fps required"""
    lst = out + ".txt"
    with open(lst, "w", encoding="utf-8") as f:
        for c in clips:
            f.write("file '" + os.path.abspath(c).replace("\\", "/") + "'\n")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", out], check=True)
    os.remove(lst)


# ---------------- the acceptance demo ----------------
DEMO = {
    "format": "vertical", "fps": 30, "seconds": 10, "hdri": "studio_small_09", "hdri_strength": 1.0, "sun": 2.5,
    "ground": {"kind": "wood", "size": 14},
    "objects": [
        {"id": "table", "asset": "wooden_table_02", "position": [0, 0, 0], "body": "passive", "shape": "MESH", "friction": 0.7},
        {"id": "crate", "asset": "wooden_crate_01", "position": [-0.05, 0, 0.80], "rotation_z": 8, "body": "active", "shape": "BOX",
         "mass": 1.2, "friction": 0.5, "restitution": 0.15},
        {"id": "ball", "asset": "dirty_football", "position": [0.10, 0.02, 2.5], "body": "active", "shape": "SPHERE",
         "mass": 0.43, "friction": 0.6, "restitution": 0.62, "lin_damp": 0.2, "ang_damp": 0.6},
    ],
    "events": [   # the ball lands on the crate's near edge, knocks it, bounces off the table, rolls on the floor and stops
        {"preset": "IMPULSE", "object": "ball", "params": {"release": 24, "velocity": [0.38, 0.03, -0.4], "spin": [0, 2.0, 0]}},
        {"preset": "RETURN_TO_ORIGIN", "object": "ball", "params": {"at": 215, "frames": 60, "lift": 0.4}},
    ],
    "camera": {"follow": ["ball", "crate"], "distance": 4.2, "height": 1.3, "lens": 32, "azimuth": -28, "orbit_end": True,
               "orbit_seconds": 2.6, "orbit_deg": 75, "dof": True, "fstop": 5.6},
}

# ---------------- plain language -> spec (keyword parser: honest, limited) ----------------
NOUNS = {   # word (en / es) -> what to search for in the local Poly Haven catalogue, or a procedural fallback
    "table": "table", "mesa": "table", "chair": "chair", "silla": "chair", "ball": "football", "pelota": "football", "balon": "football",
    "box": "crate", "boxes": "crate", "caja": "crate", "cajas": "crate", "crate": "crate", "barrel": "barrel", "barril": "barrel",
    "vase": "vase", "jarron": "vase", "glass": None, "vaso": None, "bottle": "bottle", "botella": "bottle", "apple": "apple", "manzana": "apple",
    "book": "book", "libro": "book", "lamp": "lamp", "lampara": "lamp", "bucket": "bucket", "cubo": "bucket", "duck": "rubber duck", "pato": "rubber duck",
}
VERBS = [(r"\b(falls?|drops?|cae|caer|cayo|cayó)\b", "fall"), (r"\b(rolls?|rueda|rodar)\b", "roll"), (r"\b(hits?|golpea|choca)\b", "hit"),
         (r"\b(collapses?|derrumba\w*|topples?)\b", "collapse"), (r"\b(returns?|vuelve|regresa)\b", "return"),
         (r"\b(explodes?|explota|explosion|explosión)\b", "explode"), (r"\b(floats?|flota|levita)\b", "float"),
         (r"\b(domino\w*)\b", "domino"), (r"(slow motion|camara lenta|cámara lenta)", "slow")]


def from_text(text: str) -> tuple[dict, list[str]]:
    """build a spec from a sentence; returns (spec, notes) — notes say what was matched, substituted or missing"""
    t = text.lower()
    cat = PH.AssetCatalog()
    notes, objects, used = [], [], set()
    words = re.findall(r"[a-záéíóúñ]+", t)
    for w in words:
        if w not in NOUNS or NOUNS[w] in used and w not in ("boxes", "cajas"):
            continue
        q = NOUNS[w]
        if q is None:
            notes.append(f"'{w}': not in Poly Haven -> procedural stand-in")
            objects.append({"id": w, "procedural": "box", "size": 0.12, "color": "#bfe6f2"}); used.add(w)
            continue
        hits = cat.search(q, limit=1)
        if not hits:
            notes.append(f"'{w}': no Poly Haven model found -> procedural box")
            objects.append({"id": w, "procedural": "box", "size": 0.3}); used.add(q)
            continue
        notes.append(f"'{w}' -> Poly Haven '{hits[0]['id']}'")
        n = 3 if w in ("boxes", "cajas") else 1
        for k in range(n):
            objects.append({"id": f"{q.replace(' ', '_')}{k if n > 1 else ''}", "asset": hits[0]["id"]})
        used.add(q)
    acts = [a for rx, a in VERBS if re.search(rx, t)]
    surface = next((o for o in objects if "table" in o["id"]), None)
    top = 0.78 if surface else 0.0
    if surface:
        surface.update(position=[0, 0, 0], body="passive", shape="MESH")
    movers = [o for o in objects if o is not surface]
    x0 = -0.35
    for k, o in enumerate(movers):
        is_box = "crate" in o["id"]
        o.setdefault("position", [x0 + 0.42 * k if is_box else 0.25, 0, top + (0.45 * (k if is_box else 0))])
        o.setdefault("body", "active")
        o.setdefault("shape", "BOX" if is_box else "SPHERE" if "football" in o["id"] else "CONVEX_HULL")
    events, first = [], movers[0]["id"] if movers else None
    ball = next((o["id"] for o in movers if "football" in o["id"]), first)
    if "fall" in acts and ball:
        b = next(o for o in movers if o["id"] == ball)
        b["position"][2] = top + 1.8
        events.append({"preset": "IMPULSE", "object": ball, "params": {"release": 20, "velocity": [0.5, 0, -0.3]}})
    if "roll" in acts and ball and "fall" not in acts:
        events.append({"preset": "ROLL_AND_STOP", "object": ball, "params": {"velocity": [2.0, 0, 0], "release": 15}})
    if "explode" in acts:
        events.append({"preset": "EXPLOSION_IMPULSE", "objects": [o["id"] for o in movers], "params": {"center": [0, 0, top], "release": 30}})
    if "slow" in acts:
        events.append({"preset": "SLOW_MOTION_IMPACT", "params": {"time_scale": 0.4}})
    if "return" in acts and ball:
        events.append({"preset": "RETURN_TO_ORIGIN", "object": ball, "params": {"at": 230, "frames": 55}})
    unknown = [a for a in ("domino", "float", "collapse") if a in acts]
    if unknown:
        notes.append("handled by the solver itself (no extra preset): " + ", ".join(unknown))
    spec = {"format": "vertical", "fps": 30, "seconds": 10, "hdri": "studio_small_09", "objects": objects, "events": events,
            "camera": {"follow": [o["id"] for o in movers] or [o["id"] for o in objects], "distance": 3.6, "height": 1.2}}
    return spec, notes


def _main(argv):
    if not argv:
        print(__doc__); return
    cmd = argv[0]
    if cmd == "demo":
        out = argv[1] if len(argv) > 1 else os.path.join(ROOT, "work", "physics", "demo")
        print(json.dumps(render(DEMO, out), indent=1))
    elif cmd == "spec":
        spec = json.load(open(argv[1], encoding="utf-8"))
        print(json.dumps(render(spec, argv[2] if len(argv) > 2 else os.path.join(ROOT, "work", "physics", "spec")), indent=1))
    elif cmd == "text":
        spec, notes = from_text(argv[1])
        print("\n".join(notes))
        print(json.dumps(render(spec, argv[2] if len(argv) > 2 else os.path.join(ROOT, "work", "physics", "text")), indent=1))
    elif cmd == "join":
        join(argv[1], argv[2:])


if __name__ == "__main__":
    _main(sys.argv[1:])
