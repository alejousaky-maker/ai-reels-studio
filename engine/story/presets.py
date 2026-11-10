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
    # ---- history / myth roles ----
    if role == "explorer":
        return {**base, "jacket": palette or "#b8323a", "pants": "#3a2f2a", "boots": "#3a2f2a", "hat": "explorer", "cap": "#2e2a36", "buttons": "#e8b83a",
                "belt": "#5a3b2a", "skin": SKINS[0]}
    if role == "king":
        return {**base, "jacket": palette or "#8c2a3a", "pants": "#3a2f2a", "hat": "crown", "build": "stout", "beard": "#8a8278", "sash": "#e8b83a", "buttons": "#e8b83a"}
    if role == "queen":
        return {**base, "jacket": palette or "#5a3a8a", "hat": "crown", "dress": "#8c2a3a"}
    if role == "sailor":
        return {**base, "jacket": palette or "#e9e2d0", "pants": "#3b5b9a", "hat": "cap", "cap": "#c8323a", "belt": "#5a3b2a"}
    if role == "islander":
        return {**base, "jacket": palette or "#e8d9b0", "pants": "#c9a66b", "boots": "#8d5a3b", "hat": "hair", "hair": "#2a201a", "skin": SKINS[3 + i % 2]}
    if role in ("greek", "hero"):
        o = {**base, "jacket": palette or "#c9923e", "pants": "#7a2f2a", "boots": "#5a3b2a", "hat": "helmet", "crest": "#c8323a", "belt": "#5a3b2a", "buttons": "#8a5a34"}
        return {**o, "beard": "#4a3020"} if role == "hero" else o
    if role == "trojan":
        return {**base, "jacket": palette or "#b8a06a", "pants": "#2f4a7a", "boots": "#5a3b2a", "hat": "helmet", "crest": "#3f6fb5", "belt": "#3a2f2a", "buttons": "#8a5a34"}
    if role == "prisoner":
        return {**base, "jacket": palette or "#b9a27a", "pants": "#7a6a52", "boots": "#5a3b2a", "hat": "hair", "hair": "#4a3020", "rope": "#a0784c"}
    if role == "giant":
        return {**base, "jacket": palette or "#7a5a3a", "pants": "#5a4430", "boots": "#3a2f2a", "hat": None, "cyclops": True,
                "build": "stout", "beard": "#3a2a1e", "skin": "#e8c8a0", "belt": "#3a2a1e"}
    # ---- modern roles ----
    if role == "businessman":
        return {**base, "jacket": palette or "#2f3f6a", "pants": "#26304f", "boots": "#1d1b22", "hat": "hair", "hair": "#3a2a1e", "tie": "#c8323a"}
    if role == "boss":
        return {**base, "jacket": palette or "#1d1b22", "pants": "#1d1b22", "boots": "#1d1b22", "hat": "hair", "hair": "#8a8278", "tie": "#e8b83a", "build": "stout"}
    if role == "lawyer":
        return {**base, "jacket": palette or "#5a6170", "pants": "#4a4f5a", "boots": "#1d1b22", "hat": "longhair", "hair": "#2a201a", "tie": "#c8323a",
                "dress": "#5a6170"}
    if role == "woman":
        return {**base, "jacket": palette or "#e06a9a", "dress": palette or "#e06a9a", "hat": "longhair", "hair": ["#5a3b2a", "#e8c46a", "#2a201a", "#9a4a2a"][i % 4]}
    if role == "towelguy":
        return {**base, "jacket": "#f7f5f0", "pants": "#f7f5f0", "boots": "#e8d2b8", "hat": "hair", "hair": "#2a201a", "belt": "#7fc4d9"}
    if role == "fisher":
        return {**base, "jacket": palette or "#7a8a4a", "pants": "#5a5f6a", "boots": "#3a2f2a", "hat": "bucket", "cap": "#9aa06a", "shades": True, "pockets": True}
    if role == "tourist":
        return {**base, "jacket": palette or "#ff7a59", "dress": palette or "#ff7a59", "hat": "sunhat", "hair": "#2a201a", "shades": True}
    return {**base, "hat": "cap", "cap": COATS[(i + 4) % len(COATS)]}


# world scale per role (kids 0.72 come from their build); a cyclops is ~2.6 x a person
ROLE_SCALE = {"giant": 2.6}
# set pieces: world width, height in metres (engine pieces.ts)
PIECE_SIZE = {"scale": (0.75, 0.45), "boxes": (1.9, 1.96), "car": (4.5, 2.5), "van": (5.4, 3.0), "poster": (1.9, 2.47), "horse": (8.0, 8.0), "ship": (14.0, 13.4), "galley": (13.0, 12.5), "chalkboard": (1.9, 2.47), "sheep": (1.35, 1.03), "tent": (5.0, 3.67)}
# max lens distance in rooms / chambers (stay inside or just outside the walls)
INDOOR_D = {"interior": 7.0, "throne": 8.0, "cave": 7.2, "ocean": 4.6, "apartment": 6.5, "bathroom": 5.0, "office": 7.0, "hotel": 6.0, "airport": 10.0}
ROOMS = ("interior", "throne", "apartment", "bathroom", "office", "hotel", "airport")


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
    elif env == "beach":
        # sand at z < 8.8, sea beyond: look out to sea (ship / horizon) or inland (palms, jungle)
        for (cx, cz, ux, uz) in [(0, 2.5, 0.1, 1), (-3, -2, 0, -1), (4, 1, -0.3, 1), (2, -3, 0.2, -1), (-6, 2, 0.4, 0.9), (6, -1, -0.4, -1)]:
            n = math.hypot(ux, uz)
            out.append({"C": (cx, cz), "u": (ux / n, uz / n)})
    elif env == "ocean":
        # on the deck (x in +-3.4, z -13..9): look toward the bow (masts, sails) or aft (stern castle)
        # cameras stand off the side of the ship (over the water) looking across the deck: sailors, masts, sails, sea;
        # one looks along the deck toward the bow from the side of the mainmast
        for (cx, cz, ux, uz) in [(1.3, -4.5, 1, 0.12), (-1.3, 3.0, -1, -0.12), (1.3, 3.5, 1, -0.1), (1.8, -5.5, 0, -1), (-1.3, -4.0, -1, 0.1), (-1.6, 4.5, 0.15, -1)]:
            n = math.hypot(ux, uz)
            out.append({"C": (cx, cz), "u": (ux / n, uz / n)})
    elif env == "troy":
        # the plain before the wall (z > -20): look at the wall / gate, or back toward the sea; inside the walls (z < -24)
        for (cx, cz, ux, uz) in [(0, -6, 0, -1), (14, -7, 0.05, -1), (-14, -8, 0.15, -1), (0, -4, 0, 1), (15, -34, 0, 1), (-8, -6, 0.3, -1)]:
            n = math.hypot(ux, uz)
            out.append({"C": (cx, cz), "u": (ux / n, uz / n)})
    elif env == "cave":
        # inside the chamber (radius 9, mouth at +z): look at the back wall + fire, or at the boulder in the mouth;
        # outside on the hillside looking at the mouth
        for (cx, cz, ux, uz) in [(0, 0.5, 0, -1), (-1.5, 2.5, 0.25, 1), (1.0, -1.0, 0.2, -1), (0, 15, 0, -1), (-1.5, 3.0, 0.2, -1), (-6, 16, 0.35, -1)]:
            n = math.hypot(ux, uz)
            out.append({"C": (cx, cz), "u": (ux / n, uz / n)})
    elif env == "throne":
        for (cx, cz, ux, uz) in [(0, -2.4, 0, -1), (-1.8, -0.8, 0.3, -1), (1.8, -1.0, -0.3, -1), (0, 0.5, 0, -1), (-2.2, 1.6, 0.35, -1), (2.0, 1.8, -0.3, -1)]:
            n = math.hypot(ux, uz)
            out.append({"C": (cx, cz), "u": (ux / n, uz / n)})
    elif env in ("apartment", "bathroom", "office", "hotel", "airport"):
        table = {
            "apartment": [(0, -1.2, 0, -1), (-2.2, -0.8, 0.3, -1), (2.4, -0.6, -0.3, -1), (0, 1.0, 0, -1), (-2.6, 0.6, 0.2, -1), (2.8, 0.4, -0.4, -1)],
            "bathroom": [(0, -1.0, 0, -1), (1.4, -0.6, 0.35, -1), (-1.4, -0.8, -0.3, -1), (0, 0.4, 0, -1), (-1.2, 0.6, -0.2, -1), (1.2, 0.6, 0.25, -1)],
            "office": [(0, -1.0, 0, -1), (-2.6, -0.2, 0.3, -1), (2.6, -0.2, -0.3, -1), (0, 1.2, 0, -1), (-3, 1, 0.35, -1), (3, 1, -0.35, -1)],
            "hotel": [(-1.9, -0.6, 0.05, -1), (2.0, -0.4, -0.25, -1), (0, 1.0, 0, -1), (-2.2, 0.6, 0.2, -1), (2.4, 1.0, -0.3, -1), (0.5, -1.2, -0.1, -1)],
            "airport": [(0, -0.2, 0, -1), (-5.0, -1.0, -1, 0.05), (4, 0.5, 0.2, -1), (0, 2.5, 0, -1), (-3, 2, 0.3, -1), (6, 2, -0.3, -1)],
        }[env]
        for (cx, cz, ux, uz) in table:
            n = math.hypot(ux, uz)
            out.append({"C": (cx, cz), "u": (ux / n, uz / n)})
    elif env == "suburb":
        # houses at z < -6 facing the street (+z); driveways, lawns, road at z 9-16
        for (cx, cz, ux, uz) in [(0, 2.5, 0, -1), (16, 3, -0.1, -1), (-16, 3.5, 0.15, -1), (0, 11, 0, -1), (8, 4, 0.2, -1), (-6, 5, -0.25, -1)]:
            n = math.hypot(ux, uz)
            out.append({"C": (cx, cz), "u": (ux / n, uz / n)})
    elif env == "lake":
        # dock at x 3-5.2 (z 5-22) over the water; log cabin at (-5, -7)
        for (cx, cz, ux, uz) in [(4.1, 15, 0, 1), (-4.5, 0.5, 0, -1), (4.1, 9, -0.2, -1), (1, 3.5, 0.25, 1), (-1.5, 1.5, 0.3, -1), (4.1, 18, 0.2, 1)]:
            n = math.hypot(ux, uz)
            out.append({"C": (cx, cz), "u": (ux / n, uz / n)})
    elif env == "resort":
        # pool x +-6, z 1-9; thatched bar + neon palm at (-11, -8); hotel block behind; sea beyond z 14
        for (cx, cz, ux, uz) in [(2, 11.2, 0, -1), (-9, -4, -0.3, -1), (6, 11, -0.2, -1), (0, -0.6, 0, 1), (-3, 11.5, 0.15, -1), (-11, -4.5, 0, -1)]:
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
