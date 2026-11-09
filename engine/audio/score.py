"""Original procedural score (no samples, no third-party music): seeded chord progressions per mood, plucked bass,
warm pad, mallet melody built from chord tones, brushes. Section changes follow the storyboard scenes so the music
"turns the page" with the picture. Instruments are the template's own additive/modal synths (instruments.py, MIT).
"""
from __future__ import annotations

import numpy as np

from . import dsp_bridge as D

I = D.I
SR = D.SR
NOTE = {"C": 0, "C#": 1, "Db": 1, "D": 2, "Eb": 3, "E": 4, "F": 5, "F#": 6, "Gb": 6, "G": 7, "Ab": 8, "A": 9, "Bb": 10, "B": 11}

MOODS = {
    # (tempo bpm, key root midi, scale degrees used for chords, progression as (degree, quality), lead instrument)
    "whimsical": dict(bpm=108, root=60, prog=[(0, "M"), (5, "m"), (3, "M"), (4, "M")], lead="glock", pad_vel=0.32),
    "curious": dict(bpm=96, root=62, prog=[(0, "m"), (3, "M"), (5, "M"), (4, "m")], lead="vibes", pad_vel=0.34),
    "tense": dict(bpm=92, root=57, prog=[(0, "m"), (5, "M"), (3, "M"), (4, "M")], lead="pluck", pad_vel=0.38),
    "warm": dict(bpm=84, root=65, prog=[(0, "M"), (4, "M"), (5, "m"), (3, "M")], lead="musicbox", pad_vel=0.36),
    "upbeat": dict(bpm=118, root=62, prog=[(0, "M"), (4, "M"), (5, "m"), (3, "M")], lead="glock", pad_vel=0.3),
}
MAJOR = [0, 2, 4, 5, 7, 9, 11]


def chord(root: int, deg: int, qual: str) -> list[int]:
    r = root + MAJOR[deg % 7]
    return [r, r + (3 if qual == "m" else 4), r + 7]


def _place(buf, x, t, gain=1.0, p=0.0):
    D.place(buf, D.pan(np.asarray(x, float), p) if np.ndim(x) == 1 else x, t, gain)


def render(duration: float, sections: list[tuple[float, float, str]], seed: int = 7) -> tuple[np.ndarray, list[str]]:
    """sections: [(start s, end s, mood)]; returns stereo (2, n) at SR and a cue list"""
    n = D.ns(duration)
    bass = np.zeros((2, n)); padb = np.zeros((2, n)); lead = np.zeros((2, n)); perc = np.zeros((2, n))
    r = D.rng(seed)
    cues = []
    for si, (a, b, mood) in enumerate(sections):
        M = MOODS.get(mood, MOODS["whimsical"])
        q = 60.0 / M["bpm"]
        bar = 4 * q
        # align sections on whole beats from the section start (cuts land on a downbeat)
        t = a
        k = 0
        cues.append(f"{a:.2f}s section {si + 1}: {mood} ({M['bpm']} bpm)")
        motif = [int(x) for x in r.integers(0, 3, 8)]          # chord-tone indices, own seeded motif per section
        rhythm = [1, 0, 1, 1, 0, 1, 0, 1] if mood in ("whimsical", "upbeat") else [1, 0, 0, 1, 0, 1, 0, 0]
        while t < b - 0.05:
            deg, qual = M["prog"][k % len(M["prog"])]
            ch = chord(M["root"], deg, qual)
            dur = min(bar, b - t)
            # pad: whole bar, warm, soft
            pv = M["pad_vel"] * (0.8 if k == 0 else 1.0)
            _place(padb, I.pad([I.m2f(m) for m in (ch[0] - 12, ch[1], ch[2], ch[0] + 12)], dur + 0.4, vel=pv, r=r, att=0.25, rel=0.6, warm=1100), t)
            # bass: root on 1 and 3 (fifth on 3 in upbeat)
            for beat in (0, 2):
                if beat * q < dur:
                    f0 = I.m2f(ch[0] - 24 + (7 if beat == 2 and mood == "upbeat" else 0))
                    _place(bass, I.pluck(f0, vel=0.75, r=r, dur=min(1.2, 2 * q), bright=0.35), t + beat * q, 1.0, -0.05)
            # lead: eighth-note motif on chord tones (skip the first bar of the piece so the hook voice is clear)
            if not (si == 0 and k == 0):
                for i8 in range(8):
                    tt = t + i8 * q / 2
                    if tt >= b - 0.1 or not rhythm[i8]:
                        continue
                    m = ch[motif[(i8 + k) % 8]] + 12
                    vel = 0.42 + 0.1 * (i8 % 4 == 0)
                    fn = {"glock": lambda f, v: I.glock(f, v, r, 1.2), "vibes": lambda f, v: I.vibes(f, v, r, 1.4),
                          "musicbox": lambda f, v: I.musicbox(f, v, r, 1.2), "pluck": lambda f, v: I.pluck(f, v, r, 0.8, 0.6)}[M["lead"]]
                    _place(lead, fn(I.m2f(m), vel), tt, 1.0, 0.25 * np.sin(i8))
            # brushes on 2 and 4, a soft swish on every bar start
            for beat in (1, 3):
                if beat * q < dur:
                    _place(perc, I.brush(0.45, r, 0.3), t + beat * q, 1.0, 0.15)
            if mood in ("upbeat", "whimsical"):
                for e8 in range(8):
                    if e8 * q / 2 < dur and e8 % 2:
                        _place(perc, I.brush(0.2, r, 0.12), t + e8 * q / 2, 1.0, -0.2)
            t += bar
            k += 1
        if si > 0:
            _place(perc, I.triangle(0.35, r, 1.4), a, 1.0, 0.3)
    # balance inside the band (by integrated loudness of each track)
    out = np.zeros((2, n))
    for x, target in ((bass, -24.0), (padb, -27.0), (lead, -25.0), (perc, -30.0)):
        L = D.integrated(x)
        if np.isfinite(L):
            out += x * D.dbg(target - L)
    out = D.fades(out, 0.02, 1.2)
    return out, cues
