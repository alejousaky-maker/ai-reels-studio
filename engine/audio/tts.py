"""Local TTS for AI Reels Studio.

Default provider: Kokoro-82M (Apache-2.0) through kokoro-onnx (MIT) on CPU/onnxruntime - no CUDA needed.
Text is normalised (years, numbers, symbols), split into sentences, synthesised one sentence at a time, resampled
24 kHz -> 48 kHz, joined with short gaps and click-free fades. Output: voice.wav (48 kHz mono, 24-bit) plus
sentences.json (start/end of every sentence in seconds). Alternative: import a user WAV/MP3 (import_voice()).
"""
from __future__ import annotations

import json
import os
import re
import subprocess
from dataclasses import dataclass

import numpy as np
from scipy import signal

from .paths import MODELS, AUDIO_TEMPLATE  # noqa: F401
from . import dsp_bridge as D

SR = 48000
VOICES = {
    "en": [("am_eric*0.7+am_fenrir*0.3", "Story narrator — bright expressive male, RicksClips-like (EN-US blend)"),
           ("am_eric*0.6+am_fenrir*0.4", "Shorts narrator — energetic young male (EN-US blend)"), ("am_eric", "Eric — bright male (EN-US)"),
           ("af_heart", "Heart — warm female (EN-US)"), ("af_bella", "Bella — bright female (EN-US)"), ("am_michael", "Michael — calm male (EN-US)"),
           ("am_fenrir", "Fenrir — deep male (EN-US)"), ("bm_george", "George — British male"), ("bf_emma", "Emma — British female")],
    "es": [("ef_dora", "Dora — voz femenina (ES)"), ("em_alex", "Alex — voz masculina (ES)"), ("em_santa", "Santa — voz masculina grave (ES)")],
}
LANG_CODE = {"en": "en-us", "es": "es"}

_ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
_TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()


def _en_2(n: int) -> str:
    if n < 20:
        return _ONES[n]
    t, o = divmod(n, 10)
    return _TENS[t] + ("-" + _ONES[o] if o else "")


def _en_year(y: int) -> str:
    hi, lo = divmod(y, 100)
    if lo == 0:
        return _en_2(hi) + " hundred"
    if lo < 10:
        return _en_2(hi) + " oh " + _ONES[lo]
    return _en_2(hi) + " " + _en_2(lo)


def normalize(text: str, lang: str) -> str:
    t = text.replace("&", " and " if lang == "en" else " y ").replace("%", " percent" if lang == "en" else " por ciento")
    t = re.sub(r"[“”«»]", '"', t).replace("’", "'")
    t = re.sub(r"\s+", " ", t).strip()
    if lang == "en":
        # years read as years ("1518" -> "fifteen eighteen"), espeak handles the other numbers
        t = re.sub(r"\b(1[1-9]\d\d)\b", lambda m: _en_year(int(m.group(1))), t)
    return t


def split_sentences(text: str) -> list[str]:
    parts = re.split(r"(?<=[.!?…])\s+", text.strip())
    return [p.strip() for p in parts if p.strip()]


@dataclass
class Sentence:
    text: str
    start: float
    end: float


_kokoro = None


def _get_kokoro():
    global _kokoro
    if _kokoro is None:
        from kokoro_onnx import Kokoro
        m, v = os.path.join(MODELS, "kokoro", "kokoro-v1.0.onnx"), os.path.join(MODELS, "kokoro", "voices-v1.0.bin")
        if not (os.path.exists(m) and os.path.exists(v)):
            raise FileNotFoundError("Kokoro model files are missing in models/kokoro (run install.ps1 or import your own voice WAV)")
        _kokoro = Kokoro(m, v)
    return _kokoro


def available() -> tuple[bool, str]:
    try:
        _get_kokoro()
        return True, "kokoro-onnx ready"
    except Exception as e:  # noqa
        return False, str(e)


def voice_style(k, voice: str):
    """a voice name, or a blend of Kokoro voices "am_eric*0.6+am_fenrir*0.4" (style vectors mixed by weight)"""
    if "+" not in voice and "*" not in voice:
        return voice
    parts = []
    for p in voice.split("+"):
        name, _, w = p.strip().partition("*")
        if not re.fullmatch(r"[a-z]{2}_[a-z]+", name):
            raise ValueError(f"bad voice name {name!r}")
        parts.append((name, float(w or 1.0)))
    tot = sum(w for _, w in parts) or 1.0
    return sum((w / tot) * k.get_voice_style(n) for n, w in parts)


def synth(sentences: list[str], lang: str, voice: str, speed: float = 1.0, gap: float = 0.14) -> tuple[np.ndarray, list[Sentence]]:
    k = _get_kokoro()
    out: list[np.ndarray] = []
    meta: list[Sentence] = []
    pos = 0
    lead = int(0.06 * SR)
    out.append(np.zeros(lead)); pos += lead
    vstyle = voice_style(k, voice)
    for s in sentences:
        audio, sr = k.create(normalize(s, lang), voice=vstyle, speed=speed, lang=LANG_CODE.get(lang, "en-us"))
        a = np.asarray(audio, dtype=np.float64)
        if sr != SR:
            g = np.gcd(SR, sr)
            a = signal.resample_poly(a, SR // g, sr // g)
        # trim leading/trailing silence (-45 dB), keep 25 ms of air
        env = np.abs(a)
        thr = env.max() * 10 ** (-45 / 20)
        idx = np.flatnonzero(env > thr)
        if len(idx):
            a = a[max(0, idx[0] - int(0.025 * SR)): idx[-1] + int(0.04 * SR)]
        a = D.fades(a, 0.004, 0.012)
        meta.append(Sentence(s, pos / SR, (pos + len(a)) / SR))
        out.append(a); pos += len(a)
        g = np.zeros(int(gap * SR)); out.append(g); pos += len(g)
    y = np.concatenate(out)
    pk = np.abs(y).max() or 1.0
    y = y / pk * 10 ** (-3 / 20)
    return y, meta


def import_voice(src: str, dst_wav: str) -> float:
    """convert any user audio (wav/mp3/m4a) to 48 kHz mono 24-bit with ffmpeg (no shell); returns duration"""
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-ac", "1", "-ar", str(SR), "-c:a", "pcm_s24le", dst_wav], check=True)
    x, _ = D.read_wav(dst_wav)
    return x.shape[1] / SR


def make_voice(script_sentences: list[str], lang: str, voice: str, out_dir: str, speed: float = 1.0) -> dict:
    os.makedirs(out_dir, exist_ok=True)
    y, meta = synth(script_sentences, lang, voice, speed)
    wav = os.path.join(out_dir, "voice.wav")
    D.write_wav(wav, y[None, :], 24)
    info = {"file": "voice.wav", "sampleRate": SR, "duration": len(y) / SR, "voice": voice, "lang": lang, "speed": speed,
            "provider": "kokoro-onnx (Kokoro-82M, Apache-2.0)", "sentences": [s.__dict__ for s in meta]}
    with open(os.path.join(out_dir, "sentences.json"), "w", encoding="utf-8") as f:
        json.dump(info, f, indent=1, ensure_ascii=False)
    return info
