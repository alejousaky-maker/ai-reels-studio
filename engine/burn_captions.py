"""Burn word-by-word captions onto an existing MP4 (no re-render): the same look as the engine's captions
(Montserrat Black, white with a black outline, 1-2 words, lower third, impact / effect words in yellow, small pop-in).
Usage: python -m engine.burn_captions <project_id> [<in.mp4>] [<out.mp4>]"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(ROOT, "engine", "remotion", "public", "fonts")
SMALL = {"a", "an", "the", "i", "to", "of", "in", "on", "at", "my", "his", "her", "and", "but", "so", "it", "is", "he", "she", "we", "you", "for", "by", "or", "no"}


def groups(words: list[dict], hot: set[str]) -> list[dict]:
    out, i = [], 0
    while i < len(words):
        w, nx = words[i], words[i + 1] if i + 1 < len(words) else None
        bare = re.sub(r"[^a-z']", "", w["w"].lower())
        text, e, h = re.sub(r"[.,;:]+$", "", w["w"]), w["e"], bare in hot
        if nx and bare in SMALL and not re.search(r"[.!?,;:]$", w["w"]) and nx["s"] - w["e"] < 0.12 and len(text + nx["w"]) <= 12:
            text = f"{text} {re.sub(r'[.,;:]+$', '', nx['w'])}"; e = nx["e"]; h = h or re.sub(r"[^a-z']", "", nx["w"].lower()) in hot; i += 1
        out.append({"text": text, "s": w["s"], "e": e, "hot": h}); i += 1
    for k, g in enumerate(out):   # stays up until the next one starts, at most 0.5 s after it was spoken
        g["e"] = min(g["e"] + 0.5, out[k + 1]["s"] - 0.05) if k + 1 < len(out) else g["e"] + 0.5
    return out


def ts(t: float) -> str:
    t = max(0.0, t)
    return f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"


def make_ass(words: list[dict], hot: set[str], W: int, H: int) -> str:
    k = H / 1920
    fs, bord = round(82 * k * 1.33), round(5.5 * k * 1.33)
    y = round(H * 0.765 + fs * 0.5)
    lines = ["[Script Info]", "ScriptType: v4.00+", f"PlayResX: {W}", f"PlayResY: {H}", "WrapStyle: 2", "",
             "[V4+ Styles]",
             "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, "
             "ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
             f"Style: Cap,Montserrat Black,{fs},&H00FFFFFF,&H00FFFFFF,&H00100B0D,&H66000000,-1,0,0,0,100,100,0,0,1,{bord},{round(3 * k)},5,40,40,0,1",
             "", "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
    for g in groups(words, hot):
        col = r"\c&H004DE1FF&\frz2" if g["hot"] else ""
        txt = g["text"].replace("{", "(").replace("}", ")")
        lines.append(f"Dialogue: 0,{ts(g['s'] - 0.05)},{ts(g['e'])},Cap,,0,0,0,,{{\\pos({W // 2},{y})\\fscx120\\fscy120\\t(0,100,\\fscx100\\fscy100){col}}}{txt}")
    return "\n".join(lines) + "\n"


def main(pid: str, src: str | None = None, dst: str | None = None) -> str:
    pdir = os.path.join(ROOT, "projects", pid)
    words = json.load(open(os.path.join(pdir, "audio", "words.json"), encoding="utf-8"))["words"]
    plan = json.load(open(os.path.join(pdir, "plan.json"), encoding="utf-8"))
    hot = set()
    for b in plan.get("beats", []):
        for w in [b.get("impactWord")] + [f.get("word") for f in b.get("fx", [])]:
            if w:
                hot.add(re.sub(r"[^a-z']", "", w.lower()))
    src = src or os.path.join(pdir, "output", "latest_master.mp4")
    dst = dst or os.path.join(pdir, "output", os.path.splitext(os.path.basename(src))[0] + "_subtitulado.mp4")
    probe = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", src],
                           check=True, capture_output=True, text=True).stdout.strip().split(",")
    W, H = int(probe[0]), int(probe[1])
    ass = os.path.join(pdir, "output", "captions_burn.ass")
    with open(ass, "w", encoding="utf-8") as f:
        f.write(make_ass(words, hot, W, H))
    # ffmpeg filter paths: forward slashes, the drive colon escaped
    esc = lambda p: p.replace("\\", "/").replace(":", "\\:")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-vf", f"subtitles='{esc(ass)}':fontsdir='{esc(FONTS)}'",
                    "-c:v", "libx264", "-crf", "16", "-preset", "slow", "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart", dst], check=True)
    return dst


if __name__ == "__main__":
    print(main(*sys.argv[1:]))
