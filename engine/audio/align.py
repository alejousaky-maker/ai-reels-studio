"""Word timings for the master clock.

1) Sentence spans come from TTS (exact). 2) Inside each sentence, faster-whisper word timestamps refine the words
when the recognised word count matches the script; otherwise words are spread by character length (robust fallback).
faster-whisper runs on CUDA when available, else CPU int8 (never blocks production). words.json can be hand-edited.
"""
from __future__ import annotations

import json
import os
import re

import numpy as np

from . import dsp_bridge as D
from .paths import MODELS

SR = 48000
_model = None
_model_info = ""


def _whisper():
    global _model, _model_info
    if _model is None:
        from faster_whisper import WhisperModel
        root = os.path.join(MODELS, "whisper")
        # CPU int8 by default: the CUDA path needs cuBLAS/cuDNN DLLs that a plain driver install lacks, and on this
        # Windows box it hung instead of raising. Opt in with AIRS_WHISPER_DEVICE=cuda once those are installed.
        devs = (("cuda", "float16"), ("cpu", "int8")) if os.environ.get("AIRS_WHISPER_DEVICE") == "cuda" else (("cpu", "int8"),)
        for dev, ct in devs:
            try:
                _model = WhisperModel("base", device=dev, compute_type=ct, download_root=root)
                _model_info = f"faster-whisper base ({dev}/{ct})"
                break
            except Exception:  # noqa
                continue
    return _model


def _tokens(s: str) -> list[str]:
    return [w for w in re.findall(r"[\w'’\-]+[.,!?;:]*", s)]


def spread(words: list[str], s: float, e: float) -> list[dict]:
    w8 = np.array([max(2, len(re.sub(r"\W", "", w))) for w in words], float)
    edges = s + (e - s) * np.concatenate([[0], np.cumsum(w8) / w8.sum()])
    return [{"w": w, "s": round(float(edges[i]), 3), "e": round(float(edges[i + 1]) - 0.01, 3)} for i, w in enumerate(words)]


def align(voice_wav: str, sentences: list[dict], lang: str, use_whisper: bool = True) -> dict:
    x, sr = D.read_wav(voice_wav)
    mono = x.mean(0)
    out, method = [], []
    model = _whisper() if use_whisper else None
    for sen in sentences:
        toks = _tokens(sen["text"])
        s0, e0 = float(sen["start"]), float(sen["end"])
        got = None
        if model is not None and toks:
            seg = mono[int(s0 * sr): int(e0 * sr)].astype(np.float32)
            if sr != 16000:
                from scipy import signal
                seg = signal.resample_poly(seg, 1, sr // 16000).astype(np.float32)
            try:
                segs, _ = model.transcribe(seg, language=lang, word_timestamps=True, beam_size=1, vad_filter=False,
                                           condition_on_previous_text=False)
                ws = [w for sg in segs for w in (sg.words or [])]
                if len(ws) == len(toks):
                    got = [{"w": t, "s": round(s0 + float(w.start), 3), "e": round(s0 + float(w.end), 3)} for t, w in zip(toks, ws)]
            except Exception:  # noqa
                got = None
        if got:
            method.append("whisper")
        else:
            got = spread(toks, s0 + 0.02, e0 - 0.03)
            method.append("spread")
        out.extend(got)
    info = {"words": out, "method": {"whisper": method.count("whisper"), "spread": method.count("spread")}, "model": _model_info or "none"}
    return info


def save(info: dict, path: str):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(info, f, indent=1, ensure_ascii=False)
