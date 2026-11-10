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
    # ---- history (part 3) ----
    if role in ("soldier", "major"):
        o = {**base, "jacket": palette or "#8a8a56", "pants": "#7a7a4a", "boots": "#4a3426", "hat": "slouch", "belt": "#5a4430"}
        return {**o, "moustache": "#4a3020", "build": "stout", "buttons": "#e8b83a", "sash": "#c8323a"} if role == "major" else o
    if role == "emu":
        return {**base, "jacket": palette or "#7a5a3a", "creature": "emu"}
    if role == "farmer":
        return {**base, "jacket": palette or "#b5653f", "pants": "#3b5b9a", "hat": "sunhat", "cap": "#e8c46a"}
    if role == "caesar":
        return {**base, "jacket": "#f7f5f0", "pants": "#f2efe8", "boots": "#8a5a34", "hat": "laurel", "toga": palette or "#9a2a3a", "skin": SKINS[1]}
    if role in ("pirate", "captain"):
        o = {**base, "jacket": palette or ["#c8323a", "#2f5f6a", "#3f6fb5"][i % 3], "stripes": "#f2efe8", "pants": "#3a2f2a", "hat": "bandana",
             "cap": ["#2b2b38", "#c8323a", "#e8b83a"][i % 3], "eyepatch": i % 2 == 0}
        return {**o, "beard": "#2a201a", "eyepatch": True, "cap": "#c8323a"} if role == "captain" else o
    if role == "raj_official":
        return {**base, "jacket": palette or "#c8323a", "pants": "#f2efe8", "boots": "#2b2b38", "hat": "pith", "buttons": "#e8b83a", "belt": "#ffffff", "moustache": "#8a5a34",
                "skin": SKINS[0]}
    if role == "local":
        return {**base, "jacket": palette or "#e8d9b0", "pants": "#f2efe8", "boots": "#8d5a3b", "hat": "hair", "hair": "#1d1b22", "skin": SKINS[3 + i % 2],
                **({"moustache": "#1d1b22"} if i % 2 else {})}
    # ---- modern (part 3) ----
    if role == "athlete":
        return {**base, "jacket": palette or "#39d98a", "pants": "#2b2b38", "boots": "#f2efe8", "hat": "headband", "cap": "#ff4fa0", "hair": "#3a2a1e"}
    if role == "hoodie":
        return {**base, "jacket": palette or "#9a7ac9", "pants": "#3b5b9a", "boots": "#f2efe8", "hat": "longhair", "hair": ["#5a3b2a", "#e8c46a", "#2a201a"][i % 3], "pockets": False}
    if role == "robe":
        return {**base, "jacket": palette or "#f2efe8", "dress": palette or "#f2efe8", "belt": "#c9b0d9", "hat": "longhair", "hair": "#5a3b2a"}
    if role == "groom":
        return {**base, "jacket": palette or "#1d1b22", "pants": "#1d1b22", "boots": "#1d1b22", "hat": "hair", "hair": "#3a2a1e", "bowtie": True}
    if role == "bride":
        return {**base, "jacket": "#ffffff", "dress": "#ffffff", "hat": "veil", "hair": palette or "#7a4a2a"}
    if role == "guest":
        return {**base, "jacket": palette or COATS[i % len(COATS)], "hat": "hair", "hair": "#3a2a1e", **({"dress": COATS[(i + 2) % len(COATS)], "hat": "longhair"} if i % 2 else {"tie": "#c8323a"})}
    if role == "pajamas":
        return {**base, "jacket": palette or "#7fa8d9", "pants": "#7fa8d9", "boots": "#ff9fc8", "stripes": "#f2efe8", "hat": "hair", "hair": "#3a2a1e"}
    if role == "gamer":
        return {**base, "jacket": palette or "#3a2a6a", "pants": "#2b2b38", "boots": "#ff9fc8", "hat": "hair", "hair": "#3a2a1e", "headset": "#1d1b22", "pockets": False}
    # ---- GTA-6 shorts wardrobe ----
    if role == "streamer":   # oversized black hoodie + glowing RGB headset
        return {**base, "jacket": palette or "#1d1b22", "pants": "#2b2b38", "boots": "#f2efe8", "hat": "hair", "hair": "#3a2a1e", "hoodie": True, "headset": "#7a3aff"}
    if role == "broker":
        return {**base, "jacket": palette or "#2a3350", "pants": "#232a42", "boots": "#1d1b22", "hat": "hair", "hair": ["#3a2a1e", "#8a6a3a", "#1d1b22"][i % 3], "tie": "#c8323a", "stripes": "#3a4566"}
    if role == "doctor":
        return {**base, "jacket": palette or "#8fc9e6", "pants": "#3b5b9a", "boots": "#1d1b22", "hat": "hair", "hair": "#5a3b2a", "coat": "#ffffff",
                "stethoscope": True, "headMirror": True, "headset": "#1d1b22"}
    if role == "technician":
        return {**base, "jacket": palette or "#f28c28", "pants": "#3b5b9a", "boots": "#5a3b2a", "hat": "pith", "cap": "#ffd23f", "pockets": True}
    if role == "esports":
        return {**base, "jacket": palette or "#1b3a8a", "pants": "#1d1b22", "boots": "#f2efe8", "hat": "headband", "cap": "#e2453c", "hair": "#3a2a1e", "jersey": "#ffd23f", "headset": "#e2453c"}
    if role == "oldgamer":   # the same man 60 years later: wizard beard, glasses, cardigan, vintage headphones
        return {**base, "jacket": palette or "#8a6a4a", "pants": "#5a4a3a", "boots": "#3a2a20", "hat": "hair", "hair": "#e6e2da", "beard": "#f2efe8", "beardLong": True,
                "glasses": True, "headset": "#5a4a3a", "build": "stout"}
    if role == "graduate":
        return {**base, "jacket": palette or "#1d1b22", "dress": palette or "#1d1b22", "hat": "gradcap", "hair": "#3a2a1e"}
    if role == "teen":       # backwards propeller cap + chunky headphones
        return {**base, "jacket": palette or "#e2453c", "pants": "#3b5b9a", "boots": "#f2efe8", "hat": "cap", "cap": "#3f6fb5", "capBack": True, "propeller": True, "headset": "#2b2b38"}
    if role == "officeguy":
        return {**base, "jacket": palette or "#3a4566", "pants": "#2b2b38", "boots": "#1d1b22", "hat": "hair", "hair": "#3a2a1e", "tie": "#3f6fb5"}
    if role == "bathrobe":   # silk robe, slippers, headphones round the neck (drawn on)
        return {**base, "jacket": palette or "#8c3b6a", "pants": "#8c3b6a", "boots": "#ff9fc8", "sash": "#e8b83a", "hat": "hair", "hair": "#3a2a1e", "headset": "#2b2b38"}
    if role == "brokeguy":   # patched tee + wired headphones
        return {**base, "jacket": palette or "#9a9a8a", "pants": "#3b5b9a", "boots": "#f2efe8", "hat": "cap", "cap": "#5d7a3a", "capBack": True, "patches": True, "headset": "#f2efe8"}
    if role == "capgamer":   # backwards cap + gaming headset, teal tee
        return {**base, "jacket": palette or "#2a9d8f", "pants": "#2b2b38", "boots": "#f2efe8", "hat": "cap", "cap": "#1d1b22", "capBack": True, "headset": "#e2453c", "pockets": False}
    # ---- megaproject documentaries ----
    if role == "engineer":   # hard hat + neon vest + engineer glasses
        return {**base, "jacket": palette or "#ff7a1a", "pants": "#3b5b9a", "boots": "#5a3b2a", "hat": "pith", "cap": "#ffd23f", "vest": "#d7ff3a", "glasses": True}
    if role == "accountant":
        return {**base, "jacket": palette or "#f2efe8", "pants": "#3a3d47", "boots": "#1d1b22", "hat": "hair", "hair": "#5a3b2a", "tie": "#3f6fb5", "glasses": True}
    if role == "driver":     # delivery cap + hi-vis vest
        return {**base, "jacket": palette or "#3f6fb5", "pants": "#2b2b38", "boots": "#1d1b22", "hat": "cap", "cap": "#e2453c", "vest": "#d7ff3a"}
    if role == "cop":
        return {**base, "jacket": palette or "#1f3a6a", "pants": "#1f3a6a", "boots": "#1d1b22", "hat": "police", "cap": "#1f3a6a", "pockets": True}
    if role == "chef":
        return {**base, "jacket": palette or "#ffffff", "pants": "#3a3d47", "boots": "#1d1b22", "hat": "chef", "apron": "#f2efe8"}
    if role == "stocker":    # beanie + work jacket
        return {**base, "jacket": palette or "#5d7a3a", "pants": "#3b5b9a", "boots": "#5a3b2a", "hat": "beanie", "cap": "#c8323a", "pockets": True}
    if role == "ballerina":
        return {**base, "jacket": palette or "#ff9fc8", "dress": palette or "#ff9fc8", "tutu": "#ffc6e0", "hat": "bun", "hair": "#5a3b2a", "boots": "#ff9fc8"}
    if role == "tollman":
        return {**base, "jacket": palette or "#e8b83a", "pants": "#3a3d47", "boots": "#1d1b22", "hat": "cap", "cap": "#3a3d47", "vest": "#ff7a1a"}
    if role == "pilot":
        return {**base, "jacket": palette or "#1d2a50", "pants": "#1d2a50", "boots": "#1d1b22", "hat": "pilot", "cap": "#1d2a50", "tie": "#1d1b22"}
    if role == "sleeper":    # pyjamas + floppy night cap
        return {**base, "jacket": palette or "#8fb8e6", "pants": "#8fb8e6", "boots": "#f2efe8", "stripes": "#f2efe8", "hat": "nightcap", "cap": "#3f6fb5"}
    if role == "commuter":   # 1929 suit + flat cap
        return {**base, "jacket": palette or COATS[i % len(COATS)], "pants": "#3a3440", "boots": "#1d1b22", "hat": "cap", "cap": "#5a4a3a", "tie": "#8a2a2a"}
    if role == "wife":
        return {**base, "jacket": palette or "#e06a9a", "dress": palette or "#e06a9a", "hat": "longhair", "hair": "#7a4a2a"}
    return {**base, "hat": "cap", "cap": COATS[(i + 4) % len(COATS)]}


# world scale per role (kids 0.72 come from their build); a cyclops is ~2.6 x a person
ROLE_SCALE = {"giant": 2.6}
# set pieces: world width, height in metres (engine pieces.ts)
PIECE_SIZE = {"semi": (9.0, 3.2), "forklift": (2.6, 1.85), "fruitpile": (2.4, 1.8), "containership": (36.0, 14.6), "tugboat": (6.0, 3.2),
              "steamshovel": (6.0, 4.1), "mosquito": (1.6, 1.5), "mixer": (5.0, 2.45), "airplane": (16.0, 5.3), "excavator": (6.0, 3.35),
              "rockpile": (5.0, 3.5), "tetrapods": (6.0, 2.5), "departures": (3.6, 2.3), "escalator": (4.0, 3.36), "pipes": (5.0, 3.2),
              "cashcounter": (1.2, 2.16), "blueprint": (2.2, 2.0), "subwaymap": (3.0, 2.25), "ribbon": (4.0, 2.7), "oldcar": (4.2, 2.6),
              "cryo": (1.5, 2.5), "redarrow": (3.5, 5.0), "console": (0.9, 1.5), "sofa": (2.4, 1.8), "fridge": (1.0, 1.9), "bed": (2.4, 1.62),
              "doghouse": (1.5, 1.6), "tv": (3.4, 2.38), "calendar": (1.5, 1.5), "hospitalbed": (2.4, 1.84), "heartmonitor": (0.7, 1.75), "pole": (3.0, 7.0),
              "monitor": (2.2, 1.54), "cardbox": (0.9, 0.76), "desk": (1.9, 1.19), "rack": (1.1, 2.2), "signs": (3.2, 2.88), "ticker": (4.6, 2.6),
              "tumbleweed": (1.3, 1.3), "trafficlight": (1.2, 4.0), "snacks": (1.6, 1.7), "lewis": (1.7, 1.6), "crates": (2.0, 1.77), "snakes": (3.2, 1.1), "board": (1.9, 2.47), "screen": (6.0, 5.0), "finish": (4.4, 2.48),
              "truck": (5.6, 3.2), "booth": (3.2, 2.64), "scale": (0.75, 0.45), "boxes": (1.9, 1.96), "car": (4.5, 2.5), "van": (5.4, 3.0), "poster": (1.9, 2.47), "horse": (8.0, 8.0), "ship": (14.0, 13.4), "galley": (13.0, 12.5), "chalkboard": (1.9, 2.47), "sheep": (1.35, 1.03), "tent": (5.0, 3.67)}
# max lens distance in rooms / chambers (stay inside or just outside the walls)
INDOOR_D = {"interior": 7.0, "throne": 8.0, "cave": 7.2, "ocean": 4.6, "apartment": 6.5, "bathroom": 5.0, "office": 7.0, "hotel": 6.0, "airport": 10.0, "cabin": 5.0, "bedroom": 6.0, "kitchen": 6.0, "banquet": 10.0, "gameroom": 6.0,
            "trading": 9.0, "clinic": 6.0, "datacenter": 9.0, "tunnel": 7.0, "warehouse": 11.0}
ROOMS = ("interior", "throne", "apartment", "bathroom", "office", "hotel", "airport", "cabin", "bedroom", "kitchen", "banquet", "gameroom",
         "trading", "clinic", "datacenter", "tunnel", "warehouse")


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
    elif env in ("canal", "island", "bridge"):
        table = {
            # canal: water channel |x| < 7 along z, quays at |x| > 7.5 (jungle beyond); stand on the quay looking across / along
            "canal": [(-9.5, 0, 1, 0.05), (9.5, -4, -1, 0.1), (-9.5, -12, 0.6, -0.8), (-10, 10, 0.3, -1), (9.5, 8, -0.4, -1), (0, 30, 0, -1)],
            # island airport: runway along x at z 10..30, apron z -10..8, terminal (glass roof) at z -22; sea beyond the edge
            "island": [(0, 0, 0, -1), (-14, 4, 0.5, -1), (0, 6, 0, 1), (18, 2, -0.6, -1), (30, 6, 1, 0.2), (-30, 12, -1, 0.1)],
            # bridge deck along z, walkway at x 7, river below, city skyline at -z
            "bridge": [(6.5, 0, -0.2, -1), (6.5, -10, -1, 0.15), (-6.5, 4, 0.2, -1), (6.5, 10, -0.3, 1), (0, 0, 0, -1), (6.5, -20, -0.1, -1)],
        }[env]
        for (cx, cz, ux, uz) in table:
            n = math.hypot(ux, uz)
            out.append({"C": (cx, cz), "u": (ux / n, uz / n)})
    elif env in ("apartment", "bathroom", "office", "hotel", "airport", "cabin", "bedroom", "kitchen", "banquet", "gameroom", "trading", "clinic", "datacenter", "tunnel", "warehouse"):
        table = {
            # tunnel: arch along -z (rails in the middle, walkways at x +-2.6); station variant = a wide marble hall
            "tunnel": [(0, 2.0, 0, -1), (-2.2, 0, 0.25, -1), (2.2, 0, -0.25, -1), (0, 6, 0, -1), (-2.4, 4, 0.1, -1), (2.4, -4, -0.1, -1)],
            # warehouse: aisles of pallets, loading doors at the back
            "warehouse": [(0, 0, 0, -1), (-5, 2, 0.3, -1), (5, 2, -0.3, -1), (0, 5, 0, -1), (-7, -3, 1, -0.2), (7, 4, -0.4, -1)],
            # trading floor: desks rows at z -3.6 / -0.6, ticker walls at the back (z -7)
            "trading": [(0, 1.6, 0, -1), (-4, 1.8, 0.25, -1), (4, 1.8, -0.25, -1), (0, -2.1, 0, -1), (-6, -2.1, 0.3, -1), (6, -2.1, -0.3, -1)],
            # clinic: exam table at the back (z -3.1), eye chart left, cabinets right
            "clinic": [(0, -1.6, 0, -1), (-2.2, -1.0, 0.25, -1), (2.2, -1.0, -0.25, -1), (0, 0.8, 0, -1), (-2.6, 0.8, 0.3, -1), (2.6, 0.6, -0.3, -1)],
            # data centre: aisles between rack rows (x = -4.1, 0, 4.1) looking down the rows (-z)
            "datacenter": [(0, 3.5, 0, -1), (-4.1, 3.5, 0, -1), (4.1, 3.5, 0, -1), (0, 0.5, 0, -1), (-4.1, -1, 0.1, -1), (0, 6.0, 0, -1)],
            "gameroom": [(-1.4, -1.0, 0, -1), (-1.45, -0.2, 0.15, -1), (1.6, -0.6, -0.3, -1), (0, 1.0, 0, -1), (-2.6, 0.8, 0.3, -1), (2.4, 0.8, -0.35, -1)],
            "cabin": [(0, -0.8, 0, -1), (-1.6, -0.4, -0.3, -1), (1.6, -0.2, 0.3, -1), (0, 0.8, 0, -1), (-1.2, 0.8, -0.2, -1), (1.2, 0.8, 0.2, -1)],
            "bedroom": [(-0.5, -0.3, 0, -1), (2.4, 0.0, -0.3, -1), (0, 1.0, 0, -1), (-2.6, 0.6, 0.25, -1), (1.6, 1.2, -0.2, -1), (-1.5, 1.4, 0.1, -1)],
            "kitchen": [(0, -1.6, 0, -1), (-2.4, 0.2, 0.1, -1), (2.0, 0.0, -0.2, -1), (0, 1.0, 0, -1), (-1.2, 1.2, 0.2, -1), (2.6, 1.2, -0.3, -1)],
            "banquet": [(0, -4.6, 0, -1), (0, 2.0, 0, -1), (-8.5, 3.8, -1, 0.05), (4, 4, -0.3, -1), (-4, 4, 0.3, -1), (0, -2.0, 0, -1)],
            "apartment": [(0, -1.2, 0, -1), (-2.2, -0.8, 0.3, -1), (2.4, -0.6, -0.3, -1), (0, 1.0, 0, -1), (-2.6, 0.6, 0.2, -1), (2.8, 0.4, -0.4, -1)],
            "bathroom": [(0, -1.0, 0, -1), (1.4, -0.6, 0.35, -1), (-1.4, -0.8, -0.3, -1), (0, 0.4, 0, -1), (-1.2, 0.6, -0.2, -1), (1.2, 0.6, 0.25, -1)],
            "office": [(0, -1.0, 0, -1), (-2.6, -0.2, 0.3, -1), (2.6, -0.2, -0.3, -1), (0, 1.2, 0, -1), (-3, 1, 0.35, -1), (3, 1, -0.35, -1)],
            "hotel": [(-1.9, -0.6, 0.05, -1), (2.0, -0.4, -0.25, -1), (0, 1.0, 0, -1), (-2.2, 0.6, 0.2, -1), (2.4, 1.0, -0.3, -1), (0.5, -1.2, -0.1, -1)],
            "airport": [(0, -0.2, 0, -1), (-5.0, -1.0, -1, 0.05), (4, 0.5, 0.2, -1), (0, 2.5, 0, -1), (-3, 2, 0.3, -1), (6, 2, -0.3, -1)],
        }[env]
        for (cx, cz, ux, uz) in table:
            n = math.hypot(ux, uz)
            out.append({"C": (cx, cz), "u": (ux / n, uz / n)})
    elif env == "shops":
        # storefronts at z < 0 facing the street (+z); the pavement z 0-6, the road z 6-14
        for (cx, cz, ux, uz) in [(0, 3.0, 0, -1), (-8, 3.2, 0.05, -1), (8, 3.2, -0.05, -1), (-3, 3.5, 1, -0.25), (16, 3.2, 0, -1), (-16, 3.2, 0, -1)]:
            n = math.hypot(ux, uz)
            out.append({"C": (cx, cz), "u": (ux / n, uz / n)})
    elif env == "outback":
        # wheat field + fence to the north (z < -13), a dam to the east (22, 6), open desert south
        for (cx, cz, ux, uz) in [(0, 0, 0, -1), (14.5, 6, 1, 0), (0, 3, 0, 1), (-8, -5, 0.35, -1), (8, -6, -0.2, -1), (0, 12, 0, -1)]:
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
    # pro angles (reference short: face-filling reaction shots, up-angles for power / panic, tilted frames for chaos)
    "extreme": dict(d=1.75, side=0.18, h=1.6, lh=1.6, fov=30, dof=15, push=0.0035),
    "worm": dict(d=3.6, side=0.9, h=0.32, lh=1.55, fov=50, dof=7, push=0.0028),
    "dutch": dict(d=4.6, side=1.3, h=1.55, lh=1.4, fov=40, dof=9, push=0.003, roll=0.16),
}
TIGHTER = {"wide": "medium", "medium": "close", "close": "close", "low": "medium", "high": "wide", "two_shot": "close", "insert": "insert",
           "extreme": "extreme", "worm": "close", "dutch": "close"}
