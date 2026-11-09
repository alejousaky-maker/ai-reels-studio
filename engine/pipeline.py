"""AI Reels Studio production pipeline (library + CLI). Every step reads/writes files inside projects/<id>/ so a
crash never loses inputs, voice or storyboard, and every step can be re-run on its own.

Steps: script -> voice -> align -> storyboard -> stills (+contact sheet) -> render (scene segments, cached by content
hash) -> mix -> mux -> qa. The backend calls these with a progress callback and a cancel flag.
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import time
from datetime import datetime
from typing import Callable

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from engine.story.schema import Plan  # noqa: E402
from engine.story import director  # noqa: E402

NODE = os.path.join(ROOT, "tools", "node", "node.exe") if os.name == "nt" else "node"
ENGINE = os.path.join(ROOT, "engine", "remotion")
PROJECTS = os.environ.get("AIRS_PROJECTS", os.path.join(ROOT, "projects"))
QUALITY = {  # preset -> (scale of the 1080x1920 composition, crf, stills scale)
    "draft": {"scale": 0.5, "crf": 23, "label": "Draft 540x960"},
    "standard": {"scale": 1.0, "crf": 18, "label": "Standard 1080x1920"},
    "master": {"scale": 4 / 3, "crf": 16, "label": "Master 2K 1440x2560"},  # exactly 4/3: 1920*1.3333 = 2559.94 is rejected by Remotion
}

Progress = Callable[[str, float, str], None]


class Cancelled(Exception):
    pass


def _noop(step: str, p: float, msg: str = ""):
    print(f"[{step}] {p * 100:5.1f}% {msg}", flush=True)


def pdir(pid: str, *parts: str) -> str:
    if not re.fullmatch(r"[a-zA-Z0-9][a-zA-Z0-9_\-]{0,63}", pid):
        raise ValueError("invalid project id")
    p = os.path.join(PROJECTS, pid, *parts)
    if not os.path.abspath(p).startswith(os.path.abspath(os.path.join(PROJECTS, pid))):
        raise ValueError("path escapes project")
    return p


def ensure_dirs(pid: str):
    for d in ("input", "script", "audio", "storyboard", "scenes", "preview", "qa", "output", "versions"):
        os.makedirs(pdir(pid, d), exist_ok=True)


def load_json(path: str, default=None):
    if not os.path.exists(path):
        return default
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save_json(path: str, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=1, ensure_ascii=False)
    os.replace(tmp, path)


def snapshot(pid: str, name: str, obj) -> str:
    """versioned copy (versions/<name>_<timestamp>.json)"""
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    p = pdir(pid, "versions", f"{name}_{stamp}.json")
    save_json(p, obj)
    return p


def manifest(pid: str) -> dict:
    return load_json(pdir(pid, "manifest.json"), {"id": pid, "steps": {}, "history": []})


def update_manifest(pid: str, **kw):
    m = manifest(pid)
    for k, v in kw.items():
        if k == "step":
            name, info = v
            m["steps"][name] = {**info, "at": datetime.now().isoformat(timespec="seconds")}
            m["history"].append({"step": name, "at": m["steps"][name]["at"], **{x: info[x] for x in info if x in ("seconds", "status")}})
        else:
            m[k] = v
    save_json(pdir(pid, "manifest.json"), m)
    return m


def run_proc(args: list[str], on_line: Callable[[str], None] | None = None, cancel: Callable[[], bool] | None = None, cwd: str | None = None,
             env: dict | None = None, register: Callable[[subprocess.Popen], None] | None = None) -> int:
    """run without a shell (args list), stream stdout lines, kill the whole tree on cancel"""
    flags = subprocess.CREATE_NEW_PROCESS_GROUP if os.name == "nt" else 0
    p = subprocess.Popen(args, cwd=cwd, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, encoding="utf-8",
                         errors="replace", creationflags=flags)
    if register:
        register(p)
    try:
        for line in p.stdout:  # type: ignore[union-attr]
            if on_line:
                on_line(line.rstrip())
            if cancel and cancel():
                kill_tree(p.pid)
                raise Cancelled()
        return p.wait()
    finally:
        if p.poll() is None:
            kill_tree(p.pid)


def kill_tree(pid: int):
    if os.name == "nt":
        subprocess.run(["taskkill", "/PID", str(pid), "/T", "/F"], capture_output=True)
    else:
        try:
            os.killpg(pid, 9)
        except Exception:  # noqa
            pass


def node_env() -> dict:
    e = dict(os.environ)
    e["REMOTION_TMP"] = os.path.join(ROOT, "work", "remotion-tmp")
    e["PATH"] = os.path.join(ROOT, "tools", "node") + os.pathsep + e.get("PATH", "")
    return e


# ------------------------------------------------------------------ steps
def step_script(pid: str, plan: Plan) -> dict:
    ensure_dirs(pid)
    save_json(pdir(pid, "plan.json"), plan.model_dump())
    snapshot(pid, "plan", plan.model_dump())
    words = len(plan.full_text().split())
    L = [f"# {plan.title}", "", f"Language: {plan.lang} · style: {plan.style} · {len(plan.beats)} beats · {words} words "
         f"(~{words / 3.4:.0f} s at 3.4 words/s)", ""]
    for i, b in enumerate(plan.beats, 1):
        L.append(f"**{i}. [{b.shot}, {b.light}, {b.mood}]** {b.narration}")
        if b.visual:
            L.append(f"   - _see:_ {b.visual}")
    with open(pdir(pid, "script", "SCRIPT.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(L) + "\n")
    save_json(pdir(pid, "script", "script.json"), {"lang": plan.lang, "title": plan.title, "words": words,
                                                    "beats": [b.model_dump() for b in plan.beats]})
    F = [f"# FACTS — {plan.title}", "", "Status: `verified` = checked against the listed public source; `uncertain` = reported/disputed, "
         "worded as such in the script; `fiction` = analogy or invented detail; `approved_by_client` = supplied by the client.", ""]
    for c in plan.verifiedClaims:
        F.append(f"- **{c.status}** — {c.text}" + (f" ([source]({c.source}))" if c.source else ""))
    if not plan.verifiedClaims:
        F.append("- (no factual claims recorded — treat every statement as unverified until checked)")
    if plan.creativeHooks:
        F += ["", "## Creative hooks (not claims)"] + [f"- {h}" for h in plan.creativeHooks]
    with open(pdir(pid, "script", "FACTS.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(F) + "\n")
    info = {"status": "done", "words": words, "beats": len(plan.beats)}
    update_manifest(pid, title=plan.title, lang=plan.lang, style=plan.style, step=("script", info))
    return info


def sentences_of(plan: Plan) -> list[str]:
    from engine.audio.tts import split_sentences
    out = []
    for b in plan.beats:
        out += split_sentences(b.narration)
    return out


def step_voice(pid: str, plan: Plan, voice: str | None = None, speed: float = 1.0, progress: Progress = _noop) -> dict:
    from engine.audio import tts
    t0 = time.time()
    voice = voice or ("af_heart" if plan.lang == "en" else "ef_dora")
    progress("voice", 0.05, f"Kokoro TTS, voice {voice}")
    user = pdir(pid, "input", "voice_user.wav")
    if os.path.exists(user):
        dur = tts.import_voice(user, pdir(pid, "audio", "voice.wav"))
        # one sentence span per beat proportionally (refined by whisper)
        sents = sentences_of(plan)
        tot = sum(len(s) for s in sents)
        acc, meta = 0.0, []
        for s in sents:
            d = dur * len(s) / tot
            meta.append({"text": s, "start": acc, "end": acc + d}); acc += d
        info = {"file": "voice.wav", "duration": dur, "provider": "user import", "sentences": meta}
        save_json(pdir(pid, "audio", "sentences.json"), info)
    else:
        info = tts.make_voice(sentences_of(plan), plan.lang, voice, pdir(pid, "audio"), speed)
    info["seconds"] = round(time.time() - t0, 1)
    info["status"] = "done"
    update_manifest(pid, step=("voice", {k: info[k] for k in ("duration", "provider", "seconds", "status")} | {"voice": voice, "speed": speed}))
    progress("voice", 1.0, f"{info['duration']:.1f} s of narration")
    return info


def step_align(pid: str, plan: Plan, progress: Progress = _noop) -> dict:
    from engine.audio import align
    t0 = time.time()
    s = load_json(pdir(pid, "audio", "sentences.json"))
    progress("align", 0.1, "faster-whisper word timestamps (CPU int8)")
    info = align.align(pdir(pid, "audio", "voice.wav"), s["sentences"], plan.lang)
    manual = pdir(pid, "audio", "words.manual.json")
    if os.path.exists(manual):  # hand-fixed timings win
        info["words"] = load_json(manual)["words"]; info["method"]["manual"] = True
    align.save(info, pdir(pid, "audio", "words.json"))
    update_manifest(pid, step=("align", {"status": "done", "seconds": round(time.time() - t0, 1), "method": info["method"], "model": info["model"]}))
    progress("align", 1.0, f"{len(info['words'])} words timed")
    return info


def step_storyboard(pid: str, plan: Plan, progress: Progress = _noop) -> dict:
    words = load_json(pdir(pid, "audio", "words.json"))["words"]
    sb = director.build_storyboard(plan, words)
    over = load_json(pdir(pid, "storyboard", "overrides.json"), {})
    for sc in sb["scenes"]:  # per-scene manual edits from the editor survive regeneration
        o = over.get(sc["sceneId"])
        if o:
            sc.update({k: v for k, v in o.items() if k not in ("startFrame", "endFrame", "sceneId")})
    save_json(pdir(pid, "storyboard", "storyboard.json"), sb)
    snapshot(pid, "storyboard", sb)
    info = {"status": "done", "frames": sb["durationInFrames"], "seconds_video": sb["durationInFrames"] / sb["fps"], "scenes": len(sb["scenes"])}
    update_manifest(pid, step=("storyboard", info))
    progress("storyboard", 1.0, f"{len(sb['scenes'])} scenes, {info['seconds_video']:.1f} s")
    return sb


def engine_call(args: list[str], progress: Progress, step: str, cancel=None, register=None) -> list[dict]:
    events = []

    def on_line(l: str):
        if not l.startswith("{"):
            return
        try:
            e = json.loads(l)
        except Exception:  # noqa
            return
        events.append(e)
        if e.get("event") == "progress":
            progress(step, float(e["progress"]), f"{e.get('renderedFrames', 0)} frames")
        elif e.get("event") == "still":
            progress(step, -1, f"still {e['frame']} ({e['seconds']:.1f}s)")
        elif e.get("event") == "log":
            progress(step, -1, e["message"])
    rc = run_proc([NODE, os.path.join(ENGINE, "scripts", "engine.mjs"), *args], on_line, cancel, cwd=ENGINE, env=node_env(), register=register)
    err = [e for e in events if e.get("event") == "error"]
    if rc != 0 or err:
        raise RuntimeError("render engine failed: " + (err[0]["message"][:600] if err else f"exit code {rc}"))
    return events


def step_stills(pid: str, frames: list[int] | None = None, scale: float = 0.5, progress: Progress = _noop, cancel=None, register=None) -> list[str]:
    sb = load_json(pdir(pid, "storyboard", "storyboard.json"))
    if frames is None:
        frames = []
        for s in sb["scenes"]:
            a, b = s["startFrame"], s["endFrame"]
            frames += [a + 3, (a + b) // 2, b - 4]
        frames = sorted(set(max(0, min(sb["durationInFrames"] - 1, f)) for f in frames))
    for old in os.listdir(pdir(pid, "preview")):
        if old.startswith("f_") and old.endswith(".jpg"):
            os.remove(pdir(pid, "preview", old))
    ev = engine_call(["stills", pdir(pid, "storyboard", "storyboard.json"), pdir(pid, "preview", "f_"), ",".join(map(str, frames)), str(scale)],
                     progress, "stills", cancel, register)
    files = [e["file"] for e in ev if e.get("event") == "still"]
    contact_sheet(files, pdir(pid, "preview", "contact_sheet.jpg"))
    update_manifest(pid, step=("stills", {"status": "done", "count": len(files)}))
    return files


def contact_sheet(files: list[str], out: str, cols: int = 6, w: int = 270):
    from PIL import Image, ImageDraw
    if not files:
        return
    ims = [Image.open(f).convert("RGB") for f in files]
    h = int(w * ims[0].height / ims[0].width)
    rows = (len(ims) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * w, rows * (h + 22)), "#151219")
    d = ImageDraw.Draw(sheet)
    for i, (im, f) in enumerate(zip(ims, files)):
        x, y = (i % cols) * w, (i // cols) * (h + 22)
        sheet.paste(im.resize((w, h)), (x, y + 22))
        d.text((x + 6, y + 4), os.path.basename(f).replace("f_", "frame ").replace(".jpg", ""), fill="#e8e2f0")
    sheet.save(out, quality=88)


def _strip_frames(o, base: int):
    if isinstance(o, dict):
        r = {}
        for k, v in o.items():
            if k in ("frame", "startFrame", "endFrame") and isinstance(v, (int, float)):
                r[k] = v - base
            elif k == "walkFrames" and isinstance(v, list):
                r[k] = [x - base for x in v]
            else:
                r[k] = _strip_frames(v, base)
        return r
    if isinstance(o, list):
        return [_strip_frames(x, base) for x in o]
    return o


def engine_hash() -> str:
    h = hashlib.sha256()
    for dp, _dn, fn in sorted(os.walk(os.path.join(ENGINE, "src"))):
        for f in sorted(fn):
            with open(os.path.join(dp, f), "rb") as fh:
                h.update(f.encode()); h.update(fh.read())
    return h.hexdigest()[:12]


def scene_hashes(sb: dict, scale: float, crf: int) -> list[str]:
    """content hash per scene, invariant to a pure time shift (life animation is scene-relative in the engine).
    Global part: engine source, env, cast, brand, size, quality. Each scene builds its own world culled only by its own
    cameras, so other scenes' cameras do not matter. Neighbours are included when a crossfade overlaps the scene."""
    glob = json.dumps({"e": engine_hash(), "env": sb["env"], "cast": sb["cast"], "brand": sb.get("brand"), "w": sb["width"], "h": sb["height"],
                       "fps": sb["fps"], "scale": scale, "crf": crf, "post": sb.get("post"), "cap": sb.get("captions")}, sort_keys=True)
    out = []
    S = sb["scenes"]
    for i, s in enumerate(S):
        parts = [_strip_frames(s, s["startFrame"])]
        if s.get("transitionIn") == "xfade" and i > 0:
            parts.append(("prev", _strip_frames(S[i - 1], S[i - 1]["startFrame"]), s["startFrame"] - S[i - 1]["startFrame"]))
        if i + 1 < len(S) and S[i + 1].get("transitionIn") in ("xfade", "flash"):
            parts.append(("next", _strip_frames(S[i + 1], S[i + 1]["startFrame"]), s["endFrame"] - s["startFrame"]))
        out.append(hashlib.sha256((glob + json.dumps(parts, sort_keys=True)).encode()).hexdigest()[:16])
    return out


def step_render(pid: str, quality: str = "standard", progress: Progress = _noop, cancel=None, register=None) -> dict:
    q = QUALITY[quality]
    sb = load_json(pdir(pid, "storyboard", "storyboard.json"))
    hashes = scene_hashes(sb, q["scale"], q["crf"])
    cache = pdir(pid, "scenes")
    total = sb["durationInFrames"]
    t0 = time.time()
    reused, rendered, seg_files = [], [], []
    done_frames = 0
    for i, (s, h) in enumerate(zip(sb["scenes"], hashes)):
        seg = os.path.join(cache, f"{quality}_{h}.mp4")
        n = s["endFrame"] - s["startFrame"]
        if os.path.exists(seg) and os.path.getsize(seg) > 1000:
            reused.append(s["sceneId"])
        else:
            def prog(step, p, msg, _d=done_frames, _n=n):
                if p >= 0:
                    progress("render", (_d + p * _n) / total, f"scene {s['sceneId']} · {msg}")
                else:
                    progress("render", -1, msg)
            engine_call(["render", pdir(pid, "storyboard", "storyboard.json"), seg + ".part.mp4", "--scale", repr(q["scale"]), "--crf", str(q["crf"]),
                         "--frames", f"{s['startFrame']}-{s['endFrame'] - 1}"], prog, "render", cancel, register)
            os.replace(seg + ".part.mp4", seg)
            rendered.append(s["sceneId"])
        seg_files.append(seg)
        done_frames += n
        progress("render", done_frames / total, f"{len(rendered)} rendered, {len(reused)} reused")
    lst = pdir(pid, "scenes", f"concat_{quality}.txt")
    with open(lst, "w", encoding="utf-8") as f:
        for p in seg_files:
            f.write("file '" + p.replace("\\", "/").replace("'", "'\\''") + "'\n")
    silent = pdir(pid, "output", f"video_silent_{quality}.mp4")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-map", "0:v:0", "-c", "copy", silent], check=True)
    secs = time.time() - t0
    info = {"status": "done", "quality": quality, "seconds": round(secs, 1), "frames": total, "renderedScenes": rendered, "reusedScenes": reused,
            "fps_render": round(sum(sb["scenes"][i]["endFrame"] - sb["scenes"][i]["startFrame"] for i, s in enumerate(sb["scenes"]) if s["sceneId"] in rendered) / max(secs, 0.01), 2)}
    update_manifest(pid, step=(f"render_{quality}", info))
    return info


def step_mix(pid: str, plan: Plan, music: bool = True, music_db: float = -10.0, progress: Progress = _noop) -> dict:
    from engine.audio import mixdown
    t0 = time.time()
    sb = load_json(pdir(pid, "storyboard", "storyboard.json"))
    words = load_json(pdir(pid, "audio", "words.json"))["words"]
    progress("mix", 0.1, "music, SFX, ducking, loudness")
    moods = [b.mood for b in plan.beats]
    rep = mixdown.mix(pdir(pid, "audio"), sb, words, sb["durationInFrames"] / sb["fps"], moods, music_on=music, music_db=music_db, seed=plan.seed)
    rep["status"] = "done"; rep["seconds"] = round(time.time() - t0, 1)
    update_manifest(pid, step=("mix", {"status": "done", "seconds": rep["seconds"], **rep["measured"]}))
    progress("mix", 1.0, f"{rep['measured']['integratedLUFS']} LUFS, TP {rep['measured']['truePeakDBTP']} dBTP")
    return rep


def slug(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:48] or "video"


def _true_peak(video: str) -> float | None:
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", video, "-map", "0:a:0", "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    t = r.stderr[r.stderr.rfind("Summary:"):]
    mm = re.search(r"Peak:\s*(-?[\d.]+)", t)
    return float(mm.group(1)) if mm else None


def step_mux(pid: str, quality: str = "standard") -> str:
    m = manifest(pid)
    ver = len([f for f in os.listdir(pdir(pid, "output")) if f.endswith(".mp4") and "_v" in f and quality in f]) + 1
    out = pdir(pid, "output", f"{slug(m.get('title', pid))}_{quality}_v{ver}.mp4")
    silent = pdir(pid, "output", f"video_silent_{quality}.mp4")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", silent, "-i", pdir(pid, "audio", "mix.wav"), "-map", "0:v:0", "-map", "1:a:0",
                    "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-shortest", "-movflags", "+faststart",
                    "-metadata", f"title={m.get('title', pid)}", "-metadata", f"comment=AI Reels Studio {quality} v{ver}", out], check=True)
    # verify the true peak AFTER the AAC encode; if it overshoots -1 dBTP, re-encode the audio with the exact trim
    for _ in range(2):
        tp = _true_peak(out)
        if tp is None or tp <= -1.0:
            break
        trim = -(tp + 1.3)
        tmp = out + ".tmp.mp4"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", silent, "-i", pdir(pid, "audio", "mix.wav"), "-map", "0:v:0", "-map", "1:a:0",
                        "-c:v", "copy", "-af", f"volume={trim:.2f}dB", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-shortest", "-movflags", "+faststart",
                        "-metadata", f"title={m.get('title', pid)}", "-metadata", f"comment=AI Reels Studio {quality} v{ver}", tmp], check=True)
        os.replace(tmp, out)
    shutil.copyfile(out, pdir(pid, "output", f"latest_{quality}.mp4"))
    update_manifest(pid, step=(f"mux_{quality}", {"status": "done", "file": os.path.relpath(out, ROOT)}))
    return out


def step_qa(pid: str, video: str) -> dict:
    from engine.quality import qa
    rep = qa.run(pid, video, pdir(pid, "qa"))
    update_manifest(pid, step=("qa", {"status": "done", "blocking": rep["blocking"], "technicalPass": rep["technicalPass"]}))
    return rep


def produce(pid: str, plan: Plan, quality: str = "standard", voice: str | None = None, speed: float = 1.0, music: bool = True,
            progress: Progress = _noop, cancel=None, register=None, stills: bool = True) -> dict:
    """full chain; each step's outputs persist, so a rerun after a failure resumes cheaply (cached scenes)"""
    def chk():
        if cancel and cancel():
            raise Cancelled()
    step_script(pid, plan); chk()
    step_voice(pid, plan, voice, speed, progress); chk()
    step_align(pid, plan, progress); chk()
    step_storyboard(pid, plan, progress); chk()
    if stills:
        step_stills(pid, progress=progress, cancel=cancel, register=register); chk()
    rinfo = step_render(pid, quality, progress, cancel, register); chk()
    mrep = step_mix(pid, plan, music, progress=progress); chk()
    out = step_mux(pid, quality)
    qrep = step_qa(pid, out)
    return {"video": out, "render": rinfo, "mix": mrep["measured"], "qa": {"blocking": qrep["blocking"], "technicalPass": qrep["technicalPass"]}}


if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser(description="AI Reels Studio pipeline")
    ap.add_argument("project")
    ap.add_argument("--quality", default="standard", choices=list(QUALITY))
    ap.add_argument("--voice", default=None)
    ap.add_argument("--speed", type=float, default=1.0)
    ap.add_argument("--only", default=None, help="script,voice,align,storyboard,stills,render,mix,mux,qa")
    a = ap.parse_args()
    plan = Plan.model_validate(load_json(pdir(a.project, "plan.json")))
    if a.only:
        for st in a.only.split(","):
            {"script": lambda: step_script(a.project, plan), "voice": lambda: step_voice(a.project, plan, a.voice, a.speed),
             "align": lambda: step_align(a.project, plan), "storyboard": lambda: step_storyboard(a.project, plan),
             "stills": lambda: step_stills(a.project), "render": lambda: print(step_render(a.project, a.quality)),
             "mix": lambda: print(step_mix(a.project, plan)["measured"]), "mux": lambda: print(step_mux(a.project, a.quality)),
             "qa": lambda: print(json.dumps(step_qa(a.project, pdir(a.project, "output", f"latest_{a.quality}.mp4")), indent=1))}[st]()
    else:
        print(json.dumps(produce(a.project, plan, a.quality, a.voice, a.speed), indent=1, default=str))


