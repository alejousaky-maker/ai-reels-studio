import os
import subprocess
import tempfile

import numpy as np

from engine.audio import dsp_bridge as D
from engine.audio import mixdown, score
from engine.audio.tts import normalize, split_sentences


def test_normalize_years_and_sentences():
    assert "fifteen eighteen" in normalize("In 1518 it began.", "en")
    assert "nineteen oh five" in normalize("in 1905", "en")
    assert split_sentences("One. Two? Three!") == ["One.", "Two?", "Three!"]


def test_limiter_ceiling():
    x = D.st(np.sin(np.linspace(0, 2000, 48000)) * 2.0)
    y, g = mixdown.limiter(x, -2.0)
    assert D.true_peak(y) <= -1.9


def test_duck_curve():
    n = 48000 * 3
    c = mixdown.duck_curve([{"s": 1.0, "e": 1.5}], n, -6.0)
    assert c[: int(0.5 * 48000)].max() > -0.01      # untouched before speech
    assert c[int(1.3 * 48000)] < -5.0               # ducked during speech
    assert c[-1] > -1.0                             # released after


def test_score_is_finite_and_sectioned():
    y, cues = score.render(4.0, [(0, 2, "whimsical"), (2, 4, "tense")], seed=3)
    assert y.shape == (2, D.ns(4.0)) and np.isfinite(y).all() and np.abs(y).max() > 0
    assert len(cues) == 2


def _mk(path, extra=()):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "testsrc2=s=540x960:r=30:d=3", "-f", "lavfi", "-i", "sine=f=440:d=3:sample_rate=48000",
                    *extra, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-ar", "48000", "-shortest", path], check=True)


def test_qa_detects_good_and_bad_files():
    from engine.quality import qa
    d = tempfile.mkdtemp()
    good = os.path.join(d, "good.mp4")
    _mk(good, ["-map", "0:v", "-map", "1:a", "-af", "volume=-12dB"])
    rep = qa.run("t", good, os.path.join(d, "qa"), storyboard={"fps": 30, "durationInFrames": 90, "scenes": []})
    names = {c["check"]: c["ok"] for c in rep["checks"]}
    assert names["9:16 ratio"] and names["single audio track"] and names["AAC 48 kHz"] and names["duration"]
    # two audio tracks (the classic Remotion silent-track mux bug) must be blocking
    bad = os.path.join(d, "bad.mp4")
    _mk(bad, ["-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-map", "0:v", "-map", "1:a", "-map", "2:a"])
    rep2 = qa.run("t", bad, os.path.join(d, "qa2"), storyboard={"fps": 30, "durationInFrames": 90, "scenes": []})
    assert not rep2["technicalPass"] and any("single audio track" in b for b in rep2["blocking"])
    # black video must be caught
    blk = os.path.join(d, "black.mp4")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "color=c=black:s=540x960:r=30:d=2", "-f", "lavfi", "-i", "sine=d=2:sample_rate=48000",
                    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-ar", "48000", "-shortest", blk], check=True)
    rep3 = qa.run("t", blk, os.path.join(d, "qa3"), storyboard={"fps": 30, "durationInFrames": 60, "scenes": []})
    assert any("black" in b for b in rep3["blocking"])
