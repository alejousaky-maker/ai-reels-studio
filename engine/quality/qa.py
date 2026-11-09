"""Automated technical QA of a finished MP4 + review material for humans.

Computed for real (ffprobe / ffmpeg filters / PIL): container + streams, resolution and 9:16 ratio, fps and frame
count, A/V duration match, single AAC 48 kHz track, black / white / frozen spans, integrated loudness and true peak,
long silences, per-scene luma / contrast / saturation stats against the measured reference targets.
NOT computed: narrative quality, character appeal, composition taste. Those rubric areas are marked
"pending human review" with a guided checklist; QA is only "approved" after a person signs off in the app.
"""
from __future__ import annotations

import json
import os
import re
import subprocess

import numpy as np

TARGETS = {"day_median_luma": (0.50, 0.66), "p5_luma_min": 0.12, "sat_mean": (0.30, 0.70)}
RUBRIC = [
    ("narrative", "Comprensión narrativa y gancho inicial", "human"),
    ("continuity", "Coherencia de personajes y escenarios", "human"),
    ("camera", "Cámara y pacing", "auto+human"),
    ("ink", "Contornos / ilustración / materiales", "human"),
    ("light", "Iluminación, color y profundidad", "auto+human"),
    ("voice", "Claridad y naturalidad de la voz", "human"),
    ("sound", "SFX, música y sincronía", "auto+human"),
    ("composition", "Composición vertical y safe areas", "human"),
    ("alignment", "Alineación visual-texto", "human"),
    ("technical", "Calidad técnica del archivo y licencias", "auto"),
]


def _run(args: list[str], timeout=600) -> str:
    r = subprocess.run(args, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=timeout)
    return r.stdout + r.stderr


def probe(video: str) -> dict:
    out = _run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", video])
    return json.loads(out[out.find("{"):])


def spans(text: str, start_key: str, end_key: str) -> list[tuple[float, float]]:
    s = [float(x) for x in re.findall(start_key + r"[:=]\s*([\d.]+)", text)]
    e = [float(x) for x in re.findall(end_key + r"[:=]\s*([\d.]+)", text)]
    return list(zip(s, e + [None] * (len(s) - len(e))))  # type: ignore[list-item]


def run(pid: str, video: str, qa_dir: str, storyboard: dict | None = None) -> dict:
    os.makedirs(qa_dir, exist_ok=True)
    root = os.path.abspath(os.path.join(qa_dir, "..", "..", ".."))
    if storyboard is None:
        p = os.path.join(qa_dir, "..", "storyboard", "storyboard.json")
        storyboard = json.load(open(p, encoding="utf-8")) if os.path.exists(p) else None
    pr = probe(video)
    vs = [s for s in pr["streams"] if s["codec_type"] == "video"]
    as_ = [s for s in pr["streams"] if s["codec_type"] == "audio"]
    checks, blocking, warnings = [], [], []

    def check(name, ok, detail, block=True):
        checks.append({"check": name, "ok": bool(ok), "detail": detail, "blocking": block})
        if not ok:
            (blocking if block else warnings).append(f"{name}: {detail}")

    v = vs[0] if vs else {}
    w, h = int(v.get("width", 0)), int(v.get("height", 0))
    num, den = (v.get("r_frame_rate", "0/1").split("/") + ["1"])[:2]
    fps = float(num) / float(den or 1)
    vdur = float(v.get("duration", pr["format"].get("duration", 0)))
    check("video stream", len(vs) == 1 and v.get("codec_name") == "h264", f"{len(vs)} video stream(s), codec {v.get('codec_name')}")
    check("9:16 ratio", h > 0 and abs(w / h - 9 / 16) < 0.01, f"{w}x{h}")
    check("fps", abs(fps - (storyboard or {}).get("fps", 30)) < 0.01, f"{fps:.3f} fps")
    if storyboard:
        exp = storyboard["durationInFrames"] / storyboard["fps"]
        check("duration", abs(vdur - exp) < 0.1, f"video {vdur:.3f} s, storyboard {exp:.3f} s")
    a = as_[0] if as_ else {}
    adur = float(a.get("duration", 0) or 0)
    check("single audio track", len(as_) == 1, f"{len(as_)} audio stream(s) (a silent extra track means the mux mapped the wrong stream)")
    check("AAC 48 kHz", a.get("codec_name") == "aac" and a.get("sample_rate") == "48000", f"{a.get('codec_name')} {a.get('sample_rate')} Hz {a.get('channels')} ch")
    check("A/V length match", abs(adur - vdur) < 0.1, f"audio {adur:.3f} s vs video {vdur:.3f} s")
    # picture: black / white / frozen
    txt = _run(["ffmpeg", "-hide_banner", "-i", video, "-vf", "blackdetect=d=0.15:pix_th=0.06,freezedetect=n=0.0015:d=0.6", "-an", "-f", "null", "-"])
    blacks = spans(txt, "black_start", "black_end")
    freezes = spans(txt, "freeze_start", "freeze_end")
    txtw = _run(["ffmpeg", "-hide_banner", "-i", video, "-vf", "negate,blackdetect=d=0.2:pix_th=0.04", "-an", "-f", "null", "-"])
    whites = spans(txtw, "black_start", "black_end")
    check("no black spans", not blacks, f"{len(blacks)} span(s) {blacks[:3]}")
    check("no white spans (>0.2 s)", not whites, f"{len(whites)} span(s) {whites[:3]} — 4-frame flashes are shorter and allowed")
    long_freeze = [f for f in freezes if f[1] is not None and f[1] - f[0] >= 1.5]
    check("no frozen holds >= 1.5 s", not long_freeze, f"{len(freezes)} freeze(s) >= 0.6 s: {freezes[:4]}", block=False)
    # audio loudness
    eb = _run(["ffmpeg", "-hide_banner", "-nostats", "-i", video, "-map", "0:a:0", "-af", "ebur128=peak=true", "-f", "null", "-"])
    tail = eb[eb.rfind("Summary:"):]
    I = float(re.search(r"I:\s*(-?[\d.]+)", tail).group(1)) if "I:" in tail else None
    TP = float(re.search(r"Peak:\s*(-?[\d.]+)", tail).group(1)) if "Peak:" in tail else None
    check("loudness ~ -14 LUFS", I is not None and -16.5 <= I <= -12.5, f"integrated {I} LUFS (target -14, platform normalisation)", block=False)
    check("true peak <= -1 dBTP", TP is not None and TP <= -0.9, f"true peak {TP} dBTP")
    sil = _run(["ffmpeg", "-hide_banner", "-i", video, "-map", "0:a:0", "-af", "silencedetect=n=-45dB:d=1.2", "-f", "null", "-"])
    sils = spans(sil, "silence_start", "silence_end")
    check("no long silences", not sils, f"{len(sils)} silence(s) >= 1.2 s: {sils[:3]}", block=False)
    # colour stats per scene (heuristic vs measured reference targets)
    from PIL import Image
    stats = []
    frames_dir = os.path.join(qa_dir, "frames")
    os.makedirs(frames_dir, exist_ok=True)
    picks = []
    if storyboard:
        for s in storyboard["scenes"]:
            picks.append((s["sceneId"], (s["startFrame"] + s["endFrame"]) // 2 / storyboard["fps"], s.get("light", "day")))
    else:
        picks = [(f"t{i}", vdur * (i + 0.5) / 12, "day") for i in range(12)]
    files = []
    for sid, t, light in picks:
        fp = os.path.join(frames_dir, f"{sid}.jpg")
        _run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", video, "-frames:v", "1", "-vf", "scale=540:-1", fp])
        if not os.path.exists(fp):
            continue
        files.append(fp)
        im = np.asarray(Image.open(fp).convert("RGB"), float) / 255
        Y = 0.2126 * im[..., 0] + 0.7152 * im[..., 1] + 0.0722 * im[..., 2]
        mx, mn = im.max(-1), im.min(-1)
        sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
        stats.append({"scene": sid, "t": round(t, 2), "light": light, "medianLuma": round(float(np.median(Y)), 3), "p5Luma": round(float(np.percentile(Y, 5)), 3),
                      "p95Luma": round(float(np.percentile(Y, 95)), 3), "satMean": round(float(sat.mean()), 3)})
    day = [s for s in stats if s["light"] == "day"]
    if day:
        med = float(np.median([s["medianLuma"] for s in day]))
        lo, hi = TARGETS["day_median_luma"]
        check("day exposure (heuristic)", lo <= med <= hi, f"median luma of day scenes {med:.3f}, reference ~0.57 (range {lo}-{hi})", block=False)
    crushed = [s["scene"] for s in stats if s["p5Luma"] < 0.04 and s["light"] != "night"]
    check("no crushed blacks (heuristic)", not crushed, f"scenes with p5 luma < 0.04: {crushed}", block=False)
    # contact sheet of the final file
    try:
        from engine.pipeline import contact_sheet
        contact_sheet(files, os.path.join(qa_dir, "final_contact_sheet.jpg"), cols=6, w=270)
    except Exception as e:  # noqa
        warnings.append(f"contact sheet: {e}")
    technical_pass = not blocking
    rubric = []
    for key, label, kind in RUBRIC:
        if key == "technical":
            rubric.append({"area": label, "score": 10 if technical_pass else 3, "basis": "computed (checks above)", "kind": "auto"})
        elif key == "sound" and I is not None:
            rubric.append({"area": label, "score": None, "basis": f"computed loudness {I} LUFS / TP {TP} dBTP; sync and taste need a listen", "kind": "auto+human"})
        else:
            rubric.append({"area": label, "score": None, "basis": "pending human review (see checklist)", "kind": kind})
    rep = {"video": video, "probe": {"width": w, "height": h, "fps": fps, "videoSeconds": vdur, "audioSeconds": adur, "sizeMB": round(os.path.getsize(video) / 1e6, 2)},
           "checks": checks, "blocking": blocking, "warnings": warnings, "technicalPass": technical_pass, "loudness": {"I": I, "TP": TP},
           "sceneStats": stats, "rubric": rubric, "approved": False,
           "note": "Technical checks are measured. Subjective rubric areas are NOT auto-scored; a person must review frames/video and approve in the app."}
    with open(os.path.join(qa_dir, "qa_report.json"), "w", encoding="utf-8") as f:
        json.dump(rep, f, indent=1)
    write_md(rep, os.path.join(qa_dir, "QUALITY_REPORT.md"))
    return rep


CHECKLIST = ["¿El gancho se entiende en los primeros 2 s?", "¿Cada frase importante tiene apoyo visual?", "¿Los personajes mantienen aspecto entre planos?",
             "¿Se ven los pies apoyados y las sombras de contacto?", "¿Ningún objeto tapa caras ni corta la cámara?", "¿El DOF no destruye siluetas?",
             "¿Los contornos de tinta siguen visibles tras el desenfoque?", "¿La voz se entiende sobre la música?", "¿Los efectos suenan cuando ocurren?",
             "¿Textos/CTA dentro de las safe areas y legibles?"]


def write_md(rep: dict, path: str):
    L = ["# QUALITY REPORT", "", f"Video: `{os.path.basename(rep['video'])}` · {rep['probe']['width']}x{rep['probe']['height']} · {rep['probe']['fps']:.2f} fps · "
         f"{rep['probe']['videoSeconds']:.2f} s · {rep['probe']['sizeMB']} MB", "",
         f"**Technical result: {'PASS' if rep['technicalPass'] else 'FAIL'}** · Approved for delivery: **{'yes' if rep['approved'] else 'no — human review pending'}**", "",
         "## Measured checks", "| check | ok | blocking | detail |", "|---|---|---|---|"]
    for c in rep["checks"]:
        L.append(f"| {c['check']} | {'✅' if c['ok'] else '❌'} | {'yes' if c['blocking'] else 'no'} | {c['detail']} |")
    L += ["", "## Per-scene picture stats (heuristic, vs reference: day median luma ~0.57, p5 ~0.23)", "| scene | t | light | median Y | p5 | p95 | sat |", "|---|---|---|---|---|---|---|"]
    for s in rep["sceneStats"]:
        L.append(f"| {s['scene']} | {s['t']} | {s['light']} | {s['medianLuma']} | {s['p5Luma']} | {s['p95Luma']} | {s['satMean']} |")
    L += ["", "## Rubric (0-10)", "| area | score | basis |", "|---|---|---|"]
    for r in rep["rubric"]:
        L.append(f"| {r['area']} | {r['score'] if r['score'] is not None else '—'} | {r['basis']} |")
    L += ["", "## Human review checklist"] + [f"- [ ] {c}" for c in CHECKLIST]
    if rep["warnings"]:
        L += ["", "## Warnings"] + [f"- {w}" for w in rep["warnings"]]
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(L) + "\n")
