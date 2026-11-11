"""Event SFX from the storyboard + final mix.

SFX (all synthesized, template sfx_gen.py MIT + ours): whooshes on cuts/flashes/camera glides, pops on bursts,
dings on product/icon pop-ins, thumps on impact kicks, day birds / golden breeze / night crickets beds, crowd babble
when 4+ characters share a scene. Mix: voice (gain only) + music (ducked under speech, attack 70 ms / release 450 ms)
+ SFX (-6 dB rule), master gain to the target integrated loudness, 4x-oversampled look-ahead limiter to the ceiling.
Outputs mix.wav + stems (48 kHz / 24-bit / exact picture length) and a JSON report measured with our own BS.1770
meter plus an ffmpeg ebur128 cross-check.
"""
from __future__ import annotations

import json
import os
import subprocess

import numpy as np

from . import dsp_bridge as D
from . import score

S, SR = D.S, D.SR
LIB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "library")
LIB_MUSIC = os.path.join(LIB, "music")
LIB_CREDITS = {
    "sneaky-snitch.mp3": "\"Sneaky Snitch\" Kevin MacLeod (incompetech.com) · Licensed under Creative Commons: By Attribution 4.0 License · http://creativecommons.org/licenses/by/4.0/",
    "mischief-maker.mp3": "\"Mischief Maker\" Kevin MacLeod (incompetech.com) · Licensed under Creative Commons: By Attribution 4.0 License · http://creativecommons.org/licenses/by/4.0/",
    "marty-gots-a-plan.mp3": "\"Marty Gots a Plan\" Kevin MacLeod (incompetech.com) · Licensed under Creative Commons: By Attribution 4.0 License · http://creativecommons.org/licenses/by/4.0/",
}
_SAMPLES: dict = {}


def sample(name: str):
    """a recorded SFX from library/sfx (CC0) as a mono 48 kHz array, or None"""
    if name not in _SAMPLES:
        f = os.path.join(LIB, "sfx", name)
        _SAMPLES[name] = None
        if os.path.exists(f):
            pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-f", "f32le", "-ac", "1", "-ar", str(SR), "pipe:1"], check=True, capture_output=True).stdout
            _SAMPLES[name] = np.frombuffer(pcm, dtype=np.float32).astype(np.float64)
    return _SAMPLES[name]


def _ev(buf, x, t, db, p=0.0):
    x = np.asarray(x, float)
    x = D.pan(x, p) if x.ndim == 1 else x
    L = D.momentary_max(x)
    g = D.dbg(db - L) if np.isfinite(L) else 0.0
    D.place(buf, x, t, g)


def build_sfx(sb: dict, duration: float, voice_lufs: float, seed: int = 11) -> tuple[np.ndarray, list[dict]]:
    fps = sb["fps"]
    n = D.ns(duration)
    out = np.zeros((2, n))
    r = D.rng(seed)
    cues = []
    ev = voice_lufs - 6.0          # standard rule: SFX events ~6 dB under the voice
    bed = voice_lufs - 22.0
    scenes = sb["scenes"]
    for i, s in enumerate(scenes):
        a, b = s["startFrame"] / fps, s["endFrame"] / fps
        light = s.get("light", "day")
        # clause cuts inside one sentence keep one continuous bed (no restart on every cut)
        j = i
        while j + 1 < len(scenes) and scenes[j + 1].get("sub") and scenes[j + 1].get("light", "day") == light:
            j += 1
        b_bed = scenes[j]["endFrame"] / fps
        dur = max(0.2, b_bed - a)
        # ambience bed per scene, short crossfades
        seg = np.zeros((2, D.ns(dur)))
        if s.get("sub") and i > 0 and scenes[i - 1].get("light", "day") == light:
            seg = None
        if seg is not None:
            if light == "night":
                x = S.crickets(dur, r, 3)
            elif light == "golden":
                x = S.breeze(dur, r, 0.8) + 0.5 * S.bird_chirps(dur, r, 0.2)
            else:
                x = S.bird_chirps(dur, r, 0.45) + 0.4 * S.breeze(dur, r, 0.5)
            x = D.st(np.asarray(x, float))[:, : seg.shape[1]]
            seg[:, : x.shape[1]] += x
            if len(s.get("actors", [])) >= 4:
                seg += D.st(S.babble(dur, r, 150, 1.0, active=0.6))[:, : seg.shape[1]] * 0.6
            L = D.integrated(seg)
            if np.isfinite(L):
                D.place(out, D.fades(seg * D.dbg(bed - L), 0.25, 0.25), a)
            cues.append({"t": round(a, 3), "kind": "bed", "what": f"{light} ambience" + (" + crowd" if len(s.get('actors', [])) >= 4 else "")})
        tr = s.get("transitionIn", "cut")
        if i > 0 and tr in ("flash", "xfade", "dissolve", "zoom", "whip", "flow"):
            t0 = a - (0.22 if tr in ("flash", "zoom", "whip") else 0.12)
            rec = sample("whoosh.wav" if tr in ("zoom", "whip", "flash") else "whoosh2.wav")   # real CC0 whooshes on scene transitions
            # flow (every ~4 s): only a soft air swish under the voice, never a punctuation hit
            _ev(out, rec if rec is not None else S.whoosh(0.55, r, peak=0.35), max(0, t0), ev - (2 if tr in ("flash", "zoom", "whip") else 13 if tr == "flow" else 5), 0.0)
            cues.append({"t": round(t0, 3), "kind": "whoosh", "what": f"{tr} into {s['sceneId']}"})
        for k in s.get("cameraKeys", [])[1:]:
            if k.get("cut") or k.get("dur", 24) > 40:   # slow camera moves across a whole shot are silent
                continue
            t0 = k["frame"] / fps + (k.get("dur", 24) / fps) * 0.35
            _ev(out, S.whoosh(0.5, r, peak=0.4, f_lo=250, f_hi=1500), t0 - 0.2, ev - 12, 0.2 * np.sin(k["frame"]))
            cues.append({"t": round(t0, 3), "kind": "glide", "what": "soft camera whoosh"})
        for kk in s.get("kicks", []):
            t0 = kk["frame"] / fps
            _ev(out, S.push_thump(r), t0, ev - 1 + 2 * min(1.0, kk.get("amp", 1)))
            cues.append({"t": round(t0, 3), "kind": "impact", "what": "impact thump"})
        for e in s.get("fx", []):
            t0 = e["frame"] / fps
            kind = e["kind"]
            if kind == "burst":
                _ev(out, S.clink(r, 2600, 0.15) + 0.0, t0, ev - 2, 0.1); _ev(out, S.push_thump(r), t0, ev - 4)
            elif kind == "product":
                _ev(out, D.I.glock(D.I.m2f(84), 0.7, r, 1.0) + D.I.glock(D.I.m2f(91), 0.4, r, 1.0), t0, ev - 3, 0.15)
            elif kind == "sparkle":
                _ev(out, D.I.triangle(0.5, r, 1.2), t0, ev - 5, -0.2)
            elif kind == "puff":
                _ev(out, S.whoosh(0.35, r, peak=0.15, f_lo=500, f_hi=3000), t0, ev - 8)
            elif kind == "stars":
                _ev(out, D.I.musicbox(D.I.m2f(88), 0.5, r, 1.0), t0, ev - 6)
            else:
                continue
            cues.append({"t": round(t0, 3), "kind": kind, "what": f"{kind} {e.get('product', '')}".strip()})
    return out, cues


def duck_curve(words: list[dict], n: int, depth_db: float, pre=0.08, post=0.12, att=0.07, rel=0.45) -> np.ndarray:
    ctrl = 1000
    nc = int(n / SR * ctrl) + 2
    va = np.zeros(nc)
    spans = []
    for w in words:
        s, e = float(w["s"]), float(w["e"])
        if spans and s - spans[-1][1] < 0.3:
            spans[-1][1] = e
        else:
            spans.append([s, e])
    for s, e in spans:
        va[max(0, int((s - pre) * ctrl)): int((e + post) * ctrl)] = 1.0
    ka, kr = 1 - np.exp(-1 / (att * ctrl)), 1 - np.exp(-1 / (rel * ctrl))
    env = np.zeros(nc)
    e = 0.0
    for i in range(nc):
        e += (va[i] - e) * (ka if va[i] > e else kr)
        env[i] = e
    return np.interp(np.arange(n) / SR, np.arange(nc) / ctrl, depth_db * env)


def limiter(x, ceil_db=-1.2, look=0.003, rel=0.08):
    from scipy import ndimage, signal
    c = D.dbg(ceil_db)
    n = x.shape[1]
    up = np.abs(signal.resample_poly(x, 4, 1, axis=-1)).max(0)
    pk = np.pad(up, (0, max(0, 4 * n - len(up))))[: 4 * n].reshape(n, 4).max(1)
    gr = np.minimum(1.0, c / np.maximum(pk, 1e-12))
    La = max(1, D.ns(look))
    g1 = ndimage.minimum_filter1d(gr, 2 * La + 1, mode="nearest")
    # simple release: running max-recovery via exponential smoothing in reverse-safe vectorised form
    g2 = g1.copy()
    kr = 1 - np.exp(-1 / (rel * SR))
    idx = np.flatnonzero(g1 < 1.0)
    if len(idx):
        a0, b0 = idx[0], min(n, idx[-1] + D.ns(rel * 8))
        g = 1.0
        seg = g1[a0:b0]
        o = np.empty(len(seg))
        for k in range(len(seg)):
            g = min(seg[k], g + (1 - g) * kr)
            o[k] = g
        g2[a0:b0] = o
    g3 = np.minimum(ndimage.uniform_filter1d(g2, 2 * La + 1, mode="nearest"), 1.0)
    return x * g3[None, :], g3


def ebur(path: str) -> dict:
    try:
        r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"],
                           capture_output=True, text=True, timeout=300)
        txt = r.stderr[r.stderr.rfind("Summary:"):]
        get = lambda key: float(txt.split(key)[1].split()[0]) if key in txt else None  # noqa: E731
        return {"I": get("I:"), "LRA": get("LRA:"), "truePeak": get("Peak:")}
    except Exception as e:  # noqa
        return {"error": str(e)}


def voice_comp(v: np.ndarray, thr_db: float = -24.0, ratio: float = 2.5, att: float = 0.008, rel: float = 0.12) -> np.ndarray:
    """gentle feed-forward compressor on the voice (TTS peaks are ~7 dB above what a -14 LUFS master allows);
    5 ms RMS detector, smooth attack/release, no make-up gain (the master gain sets the level)"""
    from scipy import ndimage, signal
    x = v.mean(0)
    rms = np.sqrt(ndimage.uniform_filter1d(x * x, D.ns(0.005)) + 1e-12)
    lvl = 20 * np.log10(rms)
    over = np.maximum(0.0, lvl - thr_db)
    gr = -over * (1 - 1 / ratio)
    # attack/release smoothing of the gain (dB): fast down, slow up
    ka, kr = 1 - np.exp(-1 / (att * SR)), 1 - np.exp(-1 / (rel * SR))
    b = signal.lfilter([ka], [1, -(1 - ka)], gr)          # attack-smoothed
    g = np.minimum(b, signal.lfilter([kr], [1, -(1 - kr)], gr))
    return v * D.dbg(g)[None, :]


def mix(project_audio_dir: str, sb: dict, words: list[dict], duration: float, moods: list[str] | None = None,
        target_lufs: float = -14.0, ceiling: float = -2.0, music_db: float = -10.0, music_on: bool = True, seed: int = 7,
        music_kind: str = "library") -> dict:
    # ceiling -2 dBTP on the WAV: AAC encoding overshoots true peak by up to ~2 dB (measured +2.2 dB on Demo A)
    n = D.ns(duration)
    vx, sr = D.read_wav(os.path.join(project_audio_dir, "voice.wav"))
    assert sr == SR
    v = np.zeros(n)
    vm = vx.mean(0)
    v[: min(n, len(vm))] = vm[:n]
    v = voice_comp(D.st(v))
    vL = D.integrated(v)
    # music, sections follow the scenes
    fps = sb["fps"]
    secs = []
    for i, s in enumerate(sb["scenes"]):
        # the scene carries its own beat's mood (clause cuts make more scenes than beats, so never index moods by scene)
        mood = s.get("mood") or (moods[i] if moods and i < len(moods) and len(moods) == len(sb["scenes"]) else None) \
            or ("tense" if s.get("light") == "night" else "whimsical")
        a = s["startFrame"] / fps
        b = s["endFrame"] / fps if i < len(sb["scenes"]) - 1 else duration
        if secs and secs[-1][2] == mood:
            secs[-1] = (secs[-1][0], b, mood)
        else:
            secs.append((a, b, mood))
    lib_track = None
    if music_on and music_kind == "library" and os.path.isdir(LIB_MUSIC):
        tracks = sorted(f for f in os.listdir(LIB_MUSIC) if f.endswith(".mp3"))
        if tracks:
            lib_track = tracks[seed % len(tracks)]
    if lib_track:
        # a real comedy cue (CC BY 4.0, credited in output/credits.txt), looped to length, ducked under the voice like the score
        pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(LIB_MUSIC, lib_track), "-f", "f32le", "-ac", "2", "-ar", str(SR), "pipe:1"],
                             check=True, capture_output=True).stdout
        tr = np.frombuffer(pcm, dtype=np.float32).astype(np.float64).reshape(-1, 2).T
        reps = int(np.ceil(n / tr.shape[1])) + 1
        m = np.tile(tr, (1, reps))[:, :n]
        m = D.fades(m, 0.3, 1.5)
        mcues = [{"t": 0.0, "kind": "track", "what": lib_track}]
    if music_on and not lib_track:
        m, mcues = score.render(duration, secs, seed)
        m = m[:, :n] if m.shape[1] >= n else np.pad(m, ((0, 0), (0, n - m.shape[1])))
        mL = D.integrated(m)
        m = m * D.dbg(vL + music_db - mL) * D.dbg(duck_curve(words, n, -6.0))[None, :]
    elif not lib_track:
        m, mcues = np.zeros((2, n)), []
    if lib_track:
        mL = D.integrated(m)
        m = m * D.dbg(vL + music_db - mL) * D.dbg(duck_curve(words, n, -6.0))[None, :]
    s_st, scues = build_sfx(sb, duration, vL, seed + 4)
    mix0 = v + m + s_st
    G = target_lufs - D.integrated(mix0)
    y, g3 = mix0, np.ones(n)
    for _ in range(5):
        y, g3 = limiter(mix0 * D.dbg(G), ceiling)
        L = D.integrated(y)
        if abs(L - target_lufs) < 0.05:
            break
        G += target_lufs - L
    y = D.fades(y, 0.0, 0.05)
    D.write_wav(os.path.join(project_audio_dir, "mix.wav"), y)
    D.write_wav(os.path.join(project_audio_dir, "stem_voice.wav"), v * D.dbg(G))
    D.write_wav(os.path.join(project_audio_dir, "stem_music.wav"), m * D.dbg(G))
    D.write_wav(os.path.join(project_audio_dir, "stem_sfx.wav"), s_st * D.dbg(G))
    rep = {
        "duration": duration, "sampleRate": SR, "targetLUFS": target_lufs, "ceilingDBTP": ceiling,
        "measured": {"integratedLUFS": round(float(D.integrated(y)), 2), "truePeakDBTP": round(float(D.true_peak(y)), 2), "LRA": round(float(D.lra(y)), 2),
                     "maxGainReductionDB": round(float(-20 * np.log10(g3.min())), 2),
                     "voiceLUFS": round(float(D.integrated(v * D.dbg(G))), 2),
                     "musicLUFS": round(float(D.integrated(m * D.dbg(G))), 2) if music_on else None,
                     "sfxLUFS": round(float(D.integrated(s_st * D.dbg(G))), 2)},
        "ffmpegEbur128": ebur(os.path.join(project_audio_dir, "mix.wav")),
        "musicSections": [{"start": round(a, 2), "end": round(b, 2), "mood": md} for a, b, md in secs],
        "musicCues": mcues, "sfxCues": scues,
        "license": (f"Music: {LIB_CREDITS.get(lib_track, lib_track)}. Whooshes CC0 (freesound AudioPapkin 441345, D4XX 607250); other SFX synthesized."
                    if lib_track else "All music and SFX synthesized locally (numpy/scipy), original; voice from local TTS or user import."),
        "musicCredit": LIB_CREDITS.get(lib_track) if lib_track else None,
    }
    with open(os.path.join(project_audio_dir, "mix_report.json"), "w", encoding="utf-8") as f:
        json.dump(rep, f, indent=1)
    return rep
