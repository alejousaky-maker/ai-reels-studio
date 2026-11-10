"""Original character wardrobe presets and staging anchors per environment."""
from __future__ import annotations

import math

SKINS = ["#ffe2c2", "#f5c9a0", "#ecd0b6", "#c99067", "#8d5a3b"]
COATS = ["#3f6fb5", "#8c3b4a", "#5d7a3a", "#b5653f", "#2f5f6a", "#7b5ac9", "#c25a7a", "#d9a441"]


def outfit(role: str, i: int, palette: str | None = None) -> dict:
    sk = SKINS[(i * 3 + 1) % len(SKINS)]
    c = palette or COATS[i % len(COATS)]
    base = {"jacket": c, "pants": "#3b3f52", "boots": "#4a3426", "skin": sk}
    if role == "villager_woman":
        return {**base, "hat": "bonnet" if i % 2 else "hair", "hair": "#7a4a2a", "dress": COATS[(i + 3) % len(COATS)]}
    if role == "villager_man":
        return {**base, "hat": "cap" if i % 2 else "tophat", "cap": COATS[(i + 2) % len(COATS)], **({"moustache": "#4a3426"} if i % 3 == 0 else {})}
    if role == "kid":
        return {**base, "hat": "cap", "cap": "#e2453c", "boots": "#f4f1ea", "build": "kid", "pants": "#3b5b9a"}
    if role == "official":
        return {**base, "jacket": palette or "#2f3a5a", "pants": "#2b2b38", "boots": "#241726", "hat": "tophat", "moustache": "#4a3020", "build": "stout", "buttons": "#e8c45a", "sash": "#c0353a"}
    if role == "musician":
        return {**base, "jacket": palette or "#8c3b4a", "hat": "tophat"}
    if role in ("baker", "barista"):
        return {**base, "jacket": palette or "#f4efe6", "pants": "#3b3f52", "hat": "cap", "cap": "#f7f3ea", "buttons": "#c8553d"}
    if role == "scholar":
        return {**base, "jacket": palette or "#4a3b6a", "hat": "hair", "hair": "#d9d4cc", "moustache": "#d9d4cc"}
    if role == "elder":
        return {**base, "jacket": palette or "#6a5a4a", "hat": "hair", "hair": "#e6e2da", "build": "stout"}
    if role == "worker":
        return {**base, "jacket": palette or "#b5653f", "hat": "cap", "cap": "#3b5b9a"}
    return {**base, "hat": "cap", "cap": COATS[(i + 4) % len(COATS)]}


def _rot(x: float, z: float, a: float) -> tuple[float, float]:
    return x * math.cos(a) - z * math.sin(a), x * math.sin(a) + z * math.cos(a)


def anchors(env: str, shop: dict | None = None) -> list[dict]:
    """stage centres C and the inward viewing direction u (camera -> C), chosen so the background is rich
    (houses, fountain, trees) and cameras stay inside open ground"""
    out = []
    if env in ("village_square", "market"):
        for k, a in enumerate([0, math.pi / 2, math.pi, -math.pi / 2, math.pi / 4, -3 * math.pi / 4]):
            cx, cz = _rot(0, 9.5, a)
            ux, uz = _rot(0, -1, a)
            out.append({"C": (cx, cz), "u": (ux, uz)})
    elif env == "street":
        for z in (0, -24, 22, -46, 40, -12):
            out.append({"C": (0.0, z), "u": (0.0, -1.0) if z >= 0 else (0.0, 1.0)})
    elif env == "interior":
        # cameras look at the back wall (window, shelves, counter); the room is open at the front and the top
        for (cx, cz, ux, uz) in [(0, -2.2, 0, -1), (-2.4, -1.2, 0.2, -1), (2.4, -1.0, -0.2, -1), (-2.0, 1.2, 0.1, -1), (2.0, 1.4, -0.1, -1), (0, 1.8, 0, -1)]:
            n = math.hypot(ux, uz)
            out.append({"C": (cx, cz), "u": (ux / n, uz / n)})
    elif env == "harbour":
        # quay at z < 10, sea beyond: half the anchors look out to the boats and the lighthouse, half back at the houses
        for (cx, cz, ux, uz) in [(0, 5.5, 0.15, 1), (8, 3.5, 0, -1), (-12, 5, 0.25, 1), (-20, 4, 0, -1), (14, 17, 0.45, 0.9), (4, 6, 0.6, 0.8)]:
            n = math.hypot(ux, uz)
            out.append({"C": (cx, cz), "u": (ux / n, uz / n)})
    else:  # park
        for (cx, cz, ux, uz) in [(0, 7, 0, -1), (7, 0, -1, 0), (-1, -8, 0.3, 1), (-8, 1, 1, -0.1), (5, 5, -0.7, -0.7), (-6, -6, 0.7, 0.7)]:
            n = math.hypot(ux, uz)
            out.append({"C": (cx, cz), "u": (ux / n, uz / n)})
    if shop and env == "interior":
        out.insert(0, {"C": (0.0, -2.7), "u": (0.0, -1.0), "shop": True})   # in front of the counter, sign behind
    elif shop:
        fx, fz = math.sin(shop["yaw"]), math.cos(shop["yaw"])
        out.insert(0, {"C": (shop["x"] + fx * 6.2, shop["z"] + fz * 6.2), "u": (-fx, -fz), "shop": True})
    return out


SHOTS = {
    # d = camera distance from C along -u, side = lateral offset, h = lens height, lh = look height, fov, dof cInf, push
    "wide": dict(d=10.5, side=3.0, h=2.3, lh=1.2, fov=42, dof=0, push=0.0022),
    "medium": dict(d=5.6, side=1.6, h=1.68, lh=1.38, fov=38, dof=10, push=0.0025),
    "close": dict(d=2.9, side=0.55, h=1.62, lh=1.5, fov=34, dof=13, push=0.003),
    "low": dict(d=6.2, side=-2.4, h=0.85, lh=1.5, fov=44, dof=6, push=0.0022),
    "high": dict(d=9.0, side=2.2, h=7.6, lh=0.6, fov=42, dof=0, push=0.0018),
    "two_shot": dict(d=4.3, side=1.0, h=1.66, lh=1.42, fov=38, dof=9, push=0.0025),
    "insert": dict(d=1.6, side=0.25, h=1.55, lh=1.32, fov=34, dof=14, push=0.003),
}
TIGHTER = {"wide": "medium", "medium": "close", "close": "close", "low": "medium", "high": "wide", "two_shot": "close", "insert": "insert"}
