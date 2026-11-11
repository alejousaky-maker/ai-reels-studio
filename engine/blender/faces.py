"""2D acting faces for the Blender stickmen, drawn as transparent PNG decals (front projection of the head: the image
square = the head's silhouette seen from the front). Same house style as the three.js engine: white eyeballs with
black pupils, heavy lids, thick ink brows, a talking mouth. One PNG per (expression, mouth) pair.
usage: python -m engine.blender.faces <out_dir>"""
from __future__ import annotations

import math
import os
import sys

from PIL import Image, ImageDraw

S = 1024                      # texture size; the head circle fills the square
INK = (24, 18, 26, 255)
W = 26                        # ink line width
SK = (255, 255, 255, 255)
MOUTH = (120, 24, 34, 255)
TONGUE = (238, 110, 120, 255)


def _eye(d: ImageDraw.ImageDraw, cx: float, cy: float, r: float, lid: float = 0.0, look=(0.0, 0.0), pupil=0.42, low_lid=0.0):
    """white eyeball, pupil, upper lid closing from the top (lid 0..1), lower lid from the bottom"""
    box = [cx - r, cy - r * 1.12, cx + r, cy + r * 1.12]
    d.ellipse(box, fill=SK, outline=INK, width=W)
    px, py = cx + look[0] * r * 0.45, cy + look[1] * r * 0.45
    pr = r * pupil
    d.ellipse([px - pr, py - pr, px + pr, py + pr], fill=INK)
    d.ellipse([px - pr * 0.35 + pr * 0.3, py - pr * 0.35 - pr * 0.35, px + pr * 0.35 + pr * 0.3, py + pr * 0.35 - pr * 0.35], fill=SK)
    for amount, upper in ((lid, True), (low_lid, False)):
        if amount <= 0:
            continue
        # the lid = the part of the eyeball above (below) the lid line, clipped to the eye shape, with an ink edge
        ry = r * 1.12
        edge = cy - ry + 2 * ry * amount if upper else cy + ry - 2 * ry * amount
        pts = []
        for k in range(73):
            a = math.pi * 2 * k / 72
            x, y = cx + r * math.cos(a), cy + ry * math.sin(a)
            if (y <= edge) if upper else (y >= edge):
                pts.append((x, y))
        hw = r * math.sqrt(max(0.0, 1 - ((edge - cy) / ry) ** 2))
        if len(pts) > 2:
            pts.sort(key=lambda p: math.atan2(p[1] - cy, p[0] - cx))
            d.polygon(pts + [(cx + hw, edge), (cx - hw, edge)] if upper else [(cx - hw, edge), (cx + hw, edge)] + pts, fill=SK)
        d.line([cx - hw, edge, cx + hw, edge], fill=INK, width=W)
        d.ellipse(box, outline=INK, width=W)


def _brow(d, cx, cy, ang, length=150):
    a = math.radians(ang)
    dx, dy = math.cos(a) * length / 2, math.sin(a) * length / 2
    d.line([cx - dx, cy - dy, cx + dx, cy + dy], fill=INK, width=W + 12)


def _closed(d, cx, cy, r, up=True):
    """^ ^ / > < laughing eyes"""
    if up:
        d.arc([cx - r, cy - r * 0.7, cx + r, cy + r * 0.9], 200, 340, fill=INK, width=W + 6)
    else:
        d.arc([cx - r, cy - r * 0.9, cx + r, cy + r * 0.7], 20, 160, fill=INK, width=W + 6)


def _chevron(d, cx, cy, r, left=True):
    s = 1 if left else -1
    d.line([cx - s * r, cy - r * 0.7, cx + s * r * 0.6, cy, cx - s * r, cy + r * 0.7], fill=INK, width=W + 8, joint="curve")


def _spiral(d, cx, cy, r):
    pts = [(cx + math.cos(t) * r * t / 12, cy + math.sin(t) * r * t / 12) for t in [k * 0.25 for k in range(48)]]
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=SK, outline=INK, width=W)
    d.line(pts, fill=INK, width=12)


def _star(d, cx, cy, r, col=(255, 210, 50, 255)):
    pts = []
    for k in range(10):
        a = -math.pi / 2 + k * math.pi / 5
        rr = r if k % 2 == 0 else r * 0.45
        pts.append((cx + math.cos(a) * rr, cy + math.sin(a) * rr))
    d.polygon(pts, fill=col, outline=INK, width=12)


def _mouth(d, kind: str, cx=512, cy=700, open_=0.0):
    if kind == "smile":
        d.arc([cx - 130, cy - 90, cx + 130, cy + 60], 20, 160, fill=INK, width=W + 4)
    elif kind == "smirk":
        d.line([cx - 90, cy + 10, cx + 40, cy + 10], fill=INK, width=W + 2)
        d.arc([cx + 10, cy - 50, cx + 120, cy + 20], 0, 120, fill=INK, width=W + 2)
    elif kind == "flat":
        d.line([cx - 80, cy, cx + 80, cy], fill=INK, width=W + 2)
    elif kind == "frown":
        d.arc([cx - 120, cy - 20, cx + 120, cy + 120], 200, 340, fill=INK, width=W + 4)
    elif kind == "wavy":
        pts = [(cx - 120 + k * 10, cy + 18 * math.sin(k * 0.8)) for k in range(25)]
        d.line(pts, fill=INK, width=W)
    elif kind == "grin":   # big open smile with teeth
        d.chord([cx - 170, cy - 110, cx + 170, cy + 130], 0, 180, fill=MOUTH, outline=INK, width=W)
        d.rectangle([cx - 150, cy + 8, cx + 150, cy + 40], fill=SK)
        d.ellipse([cx - 70, cy + 60, cx + 70, cy + 120], fill=TONGUE)
        d.chord([cx - 170, cy - 110, cx + 170, cy + 130], 0, 180, outline=INK, width=W)
    elif kind == "o":      # shocked / talking O
        h = 60 + 90 * max(open_, 0.6)
        d.ellipse([cx - 60, cy - h / 2, cx + 60, cy + h / 2], fill=MOUTH, outline=INK, width=W)
    elif kind == "talk":   # talking: an open lens mouth, height from open_
        h = 24 + 110 * open_
        d.ellipse([cx - 95, cy - h / 2, cx + 95, cy + h / 2], fill=MOUTH, outline=INK, width=W)
        if open_ > 0.4:
            d.ellipse([cx - 45, cy + h * 0.05, cx + 45, cy + h / 2 - 4], fill=TONGUE)


EXPRS = ["neutral", "smug", "shock", "laugh", "sweat", "starry", "crazy", "sad", "angry", "wink", "sleepy", "skeptical", "scared", "proud", "cry"]


def face(expr: str, mouth_open: float | None = None) -> Image.Image:
    """mouth_open None = the expression's own mouth; 0..1 = a talking mouth at that opening"""
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    lx, rx, ey, er = 360, 664, 455, 92
    m = None
    if expr == "neutral":
        _eye(d, lx, ey, er, 0.25); _eye(d, rx, ey, er, 0.25); _brow(d, lx, 310, -4); _brow(d, rx, 310, 4); m = "flat"
    elif expr == "smug":
        _eye(d, lx, ey, er, 0.55, (0.5, 0)); _eye(d, rx, ey, er, 0.55, (0.5, 0)); _brow(d, lx, 325, 0); _brow(d, rx, 300, -12); m = "smirk"
    elif expr in ("shock", "scared"):
        _eye(d, lx, ey - 10, er * 1.15, 0, (0, 0), 0.25); _eye(d, rx, ey - 10, er * 1.15, 0, (0, 0), 0.25)
        _brow(d, lx, 270, -14 if expr == "shock" else 16); _brow(d, rx, 270, 14 if expr == "shock" else -16); m = "o" if expr == "shock" else "wavy"
    elif expr == "laugh":
        _chevron(d, lx, ey, 80, True); _chevron(d, rx, ey, 80, False); _brow(d, lx, 300, -10); _brow(d, rx, 300, 10); m = "grin"
    elif expr == "sweat":
        _eye(d, lx, ey, er, 0.2, (-0.3, 0.2), 0.3); _eye(d, rx, ey, er, 0.2, (-0.3, 0.2), 0.3); _brow(d, lx, 300, 16); _brow(d, rx, 300, -16); m = "wavy"
        d.polygon([(800, 250), (760, 360), (840, 360)], fill=(120, 200, 255, 255), outline=INK, width=10); d.ellipse([755, 320, 845, 410], fill=(120, 200, 255, 255), outline=INK, width=10)
    elif expr == "starry":
        _star(d, lx, ey, 120); _star(d, rx, ey, 120); _brow(d, lx, 290, -10); _brow(d, rx, 290, 10); m = "grin"
    elif expr == "crazy":
        _spiral(d, lx, ey, er); _spiral(d, rx, ey, er); _brow(d, lx, 300, 20); _brow(d, rx, 290, -5); m = "grin"
    elif expr in ("sad", "cry"):
        _eye(d, lx, ey, er, 0.35, (0, 0.4)); _eye(d, rx, ey, er, 0.35, (0, 0.4)); _brow(d, lx, 320, 18); _brow(d, rx, 320, -18); m = "frown"
        if expr == "cry":
            for x in (lx, rx):
                d.rectangle([x - 22, ey + 80, x + 22, 900], fill=(120, 200, 255, 230))
    elif expr == "angry":
        _eye(d, lx, ey, er, 0.4, (0.2, 0), 0.38); _eye(d, rx, ey, er, 0.4, (-0.2, 0), 0.38); _brow(d, lx, 345, 22); _brow(d, rx, 345, -22); m = "frown"
    elif expr == "wink":
        _closed(d, lx, ey, 85, True); _eye(d, rx, ey, er, 0.2); _brow(d, lx, 320, -6); _brow(d, rx, 290, 8); m = "smile"
    elif expr == "sleepy":
        _eye(d, lx, ey, er, 0.72, (0, 0.3)); _eye(d, rx, ey, er, 0.72, (0, 0.3)); _brow(d, lx, 330, -2); _brow(d, rx, 330, 2); m = "flat"
    elif expr == "skeptical":
        _eye(d, lx, ey, er, 0.5, (0.4, 0)); _eye(d, rx, ey, er, 0.15, (0.4, 0)); _brow(d, lx, 335, 2); _brow(d, rx, 270, -16); m = "flat"
    elif expr == "proud":
        _closed(d, lx, ey, 85, True); _closed(d, rx, ey, 85, True); _brow(d, lx, 300, -10); _brow(d, rx, 300, 10); m = "smile"
    else:
        return face("neutral", mouth_open)
    if mouth_open is not None:
        m = "talk"
    _mouth(d, m, open_=mouth_open or 0.0)
    return im


def main(out: str):
    os.makedirs(out, exist_ok=True)
    for e in EXPRS:
        face(e).save(os.path.join(out, f"{e}.png"))
        for k, o in enumerate((0.15, 0.55, 0.95)):   # three talking mouth shapes per expression (lip flap)
            face(e, o).save(os.path.join(out, f"{e}_talk{k}.png"))
    print("faces:", len(EXPRS) * 4)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "faces"))
