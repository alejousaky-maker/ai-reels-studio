"""Director / motion planner: (plan, real word timings) -> engine storyboard JSON.

Rules from the measured reference + SKILL.md: one master clock (seconds -> frames at fps); a beat's picture starts
0-3 frames before its first word; reactions and effects land 2 frames before their word; every shot creeps (push-in);
beats longer than ~2.6 s get a second framing (glide 24 f, or a cut when the beat is long); impacts get a 7-frame
flip-kick; DOF on medium/close shots focused on the subject's eyes, wides stay sharp; foreground faces never covered.
Deterministic: same plan + timings + seed -> same storyboard.
"""
from __future__ import annotations

import math
import re

from .presets import SHOTS, TIGHTER, anchors, outfit, ROLE_SCALE, PIECE_SIZE, INDOOR_D, ROOMS
from .schema import Plan

LEAD = 2


def _tok(s: str) -> list[str]:
    return re.findall(r"[\w'’\-]+[.,!?;:]*", s)


def _norm(w: str) -> str:
    return re.sub(r"[^\w']", "", w.lower())


def shop_for(env: str, brand: dict | None) -> dict | None:
    if not brand:
        return None
    base = {"name": brand["name"], "tagline": brand.get("tagline"),
            "colors": {"primary": brand.get("primary", "#c8553d"), "secondary": brand.get("secondary", "#f2c94c"), "text": brand.get("text", "#ffffff")}}
    if env == "street":
        return {**base, "x": -11.5, "z": 0.0, "yaw": math.pi / 2}
    if env == "interior":
        return {**base, "x": 0.0, "z": -6.0, "yaw": 0.0}     # the room itself is the shop (counter + sign inside)
    if env == "harbour":
        return {**base, "x": 2.0, "z": -6.0, "yaw": 0.0}     # a waterfront house facing the quay
    if env == "park":
        return {**base, "x": 0.0, "z": -24.0, "yaw": 0.0}
    return {**base, "x": 0.0, "z": -29.0, "yaw": 0.0}


def beat_spans(plan: Plan, words: list[dict], fps: int) -> list[tuple[int, int, list[dict]]]:
    spans, i = [], 0
    for b in plan.beats:
        n = len(_tok(b.narration))
        ws = words[i: i + n]
        i += n
        spans.append(ws)
    out = []
    # Beat starts are chained from rounded time DIFFERENCES (start_k = start_k-1 + round(dt * fps)), so when one sentence
    # gets longer/shorter every later scene moves as a block and keeps its exact length -> its render segment is reused.
    # Guard: if the chained start drifts outside 1-4 frames before the word, fall back to the absolute value.
    prev_t, prev_a = None, None
    for k, ws in enumerate(spans):
        if not ws:
            out.append([None, None, ws]); continue
        t = ws[0]["s"]
        absolute = max(0, int(round(t * fps)) - 3)
        if k == 0:
            a = 0
        elif prev_t is None:
            a = absolute
        else:
            a = prev_a + int(round((t - prev_t) * fps))
            if not (0 <= round(t * fps) - a <= 5):   # cut lands 0-5 f (<=167 ms) before its word; wider = more cache reuse
                a = absolute
        out.append([a, None, ws])
        prev_t, prev_a = t, (a if k else absolute)
    last_end = words[-1]["e"] if words else 3.0
    total = (prev_a + int(math.ceil((last_end + 0.8 - prev_t) * fps))) if prev_t is not None else int(math.ceil((last_end + 0.8) * fps))
    for k in range(len(out)):
        if out[k][0] is None:
            out[k][0] = out[k - 1][0] + fps if k else 0
    for k in range(len(out)):
        out[k][1] = out[k + 1][0] if k + 1 < len(out) else total
        if out[k][1] - out[k][0] < 12:  # never a scene shorter than 0.4 s
            out[k][1] = out[k][0] + 12
    return [(a, b, ws) for a, b, ws in out]


_ANCHOR: dict = {}


def word_frame(ws: list[dict], word: str | None, fps: int, after: int = -1) -> int | None:
    """frame LEAD frames before `word`, measured from the beat's first word (shift-invariant like the scene starts);
    `after`: only occurrences landing after that frame (a sub-shot cutting on a repeated word like "and")"""
    if not word or not ws:
        return None
    key = _norm(word)
    base_t, base_f = _ANCHOR.get(id(ws), (ws[0]["s"], int(round(ws[0]["s"] * fps))))
    for w in ws:
        if _norm(w["w"]) == key or (key and _norm(w["w"]).startswith(key)):
            f = max(0, base_f + int(round((w["s"] - base_t) * fps)) - LEAD)
            if f > after:
                return f
    return None


def _wf_of(ws: list[dict], w: dict, fps: int) -> int:
    base_t, base_f = _ANCHOR.get(id(ws), (ws[0]["s"], int(round(ws[0]["s"] * fps))))
    return base_f + int(round((w["s"] - base_t) * fps))


_SUB_KEEP = ("shot", "light", "environment", "envVariant", "spot", "characters", "extras", "extrasAction", "extrasRole", "focus",
             "fx", "impactWord", "transition", "text", "textStyle", "pieces", "camMove", "hud", "hudText", "visual", "look", "extrasHolding")


def expand_views(plan: Plan, spans, fps: int) -> list[tuple]:
    """one picture per clause: a beat with `shots` becomes several consecutive scenes, each cut 2 frames before its word.
    A view inherits the beat's place / cast / pieces; text, camera move and transition belong to the view that sets them;
    an effect / reaction plays in the view that contains its word."""
    views = []
    for bi, (beat, (a, b, ws)) in enumerate(zip(plan.beats, spans)):
        cuts = []
        last = a
        for s in beat.shots:
            f = word_frame(ws, s.at, fps, after=last + 11)
            if f is None or f - last < 12 or b - f < 12:     # never a shot shorter than 0.4 s
                continue
            cuts.append((f, s))
            last = f
        bounds = [a] + [f for f, _ in cuts] + [b]
        for k in range(len(bounds) - 1):
            fa, fb = bounds[k], bounds[k + 1]
            sub_ws = [w for w in ws if fa <= _wf_of(ws, w, fps) - LEAD < fb or (k == 0 and _wf_of(ws, w, fps) - LEAD < fa)] if cuts else ws
            if cuts and sub_ws is not ws and ws:
                _ANCHOR[id(sub_ws)] = _ANCHOR.get(id(ws), (ws[0]["s"], int(round(ws[0]["s"] * fps))))
            if k == 0:
                upd = {"shots": []}
                if cuts:   # effects / reactions / impact whose word falls in a later clause move with it
                    upd["fx"] = [x for x in beat.fx if not x.word or word_frame(sub_ws, x.word, fps) is not None]
            else:
                s = cuts[k - 1][1]
                upd = {"shots": [], "transition": "cut", "text": None, "camMove": None, "visual": None, "impactWord": beat.impactWord,
                       "fx": [x for x in beat.fx if x.word and word_frame(sub_ws, x.word, fps) is not None]}
                for name in _SUB_KEEP:
                    if name in s.model_fields_set and getattr(s, name) is not None:
                        upd[name] = getattr(s, name)
            views.append((bi, k, beat.model_copy(update=upd), fa, fb, sub_ws))
    return views


def camera_move(kind: str, k0: dict, a: int, b: int, si: int, lead: dict | None) -> list[dict]:
    """a real move across the whole shot (smootherstep glide from the opening framing to the closing one)"""
    P, L = list(k0["position"]), list(k0["lookAt"])
    d = [L[i] - P[i] for i in range(3)]
    dh = math.hypot(d[0], d[2]) or 1.0
    fx_, fz_ = d[0] / dh, d[2] / dh
    rx_, rz_ = -fz_, fx_                                  # screen right
    sgn = 1 if si % 2 == 0 else -1
    r3 = lambda v: [round(x, 3) for x in v]
    start, end = dict(k0), dict(k0)
    dur = max(12, b - a)
    if kind == "push":            # a decisive dolly-in onto the subject
        end["position"] = r3([P[i] + 0.4 * d[i] for i in range(3)])
    elif kind == "pull":          # reveal: start tight, pull back to the full picture
        start["position"] = r3([P[i] + 0.45 * d[i] for i in range(3)])
    elif kind in ("truck_left", "truck_right"):
        s = (1 if kind == "truck_right" else -1) * max(0.8, 0.3 * dh)
        start["position"] = r3([P[0] - rx_ * s / 2, P[1], P[2] - rz_ * s / 2]); start["lookAt"] = r3([L[0] - rx_ * s / 2, L[1], L[2] - rz_ * s / 2])
        end["position"] = r3([P[0] + rx_ * s / 2, P[1], P[2] + rz_ * s / 2]); end["lookAt"] = r3([L[0] + rx_ * s / 2, L[1], L[2] + rz_ * s / 2])
    elif kind == "orbit":         # circle ~24 deg around the subject
        def rot(t):
            c, s_ = math.cos(t), math.sin(t)
            vx, vz = P[0] - L[0], P[2] - L[2]
            return r3([L[0] + vx * c - vz * s_, P[1], L[2] + vx * s_ + vz * c])
        start["position"], end["position"] = rot(-0.21 * sgn), rot(0.21 * sgn)
    elif kind == "crane_up":      # rise from low to a higher, looking-down angle
        start["position"] = r3([P[0], max(0.4, P[1] - 0.25 * dh), P[2]])
        end["position"] = r3([P[0], P[1] + 0.5 * dh, P[2]])
    elif kind == "follow" and lead and "walkTo" in lead:   # the camera travels with the walker
        # the framing was composed on the walker's END mark: start the same framing on the start mark and travel with them
        dx, dz = lead["walkTo"][0] - lead["x"], lead["walkTo"][1] - lead["z"]
        start["position"] = r3([P[0] - dx, P[1], P[2] - dz]); start["lookAt"] = r3([L[0] - dx, L[1], L[2] - dz])
        dur = max(12, lead["walkFrames"][1] - a)
    elif kind == "whip":          # whip-pan in: the shot starts swung 35 deg off and snaps onto the subject in 8 frames
        c, s_ = math.cos(0.6 * sgn), math.sin(0.6 * sgn)
        vx, vz = L[0] - P[0], L[2] - P[2]
        start["lookAt"] = r3([P[0] + vx * c - vz * s_, L[1], P[2] + vx * s_ + vz * c])
        dur = 8
    else:
        return [k0]
    start["frame"] = a
    start.pop("cut", None); start.pop("dur", None)
    end = {**end, "frame": a, "dur": dur}
    end.pop("cut", None)
    return [start, end]


def build_storyboard(plan: Plan, words: list[dict], fps: int = 30, width: int = 1080, height: int = 1920) -> dict:
    aspect = width / height   # 9:16 for Shorts; 1:1 and 16:9 for images/landscape
    brand = plan.brand.model_dump() if plan.brand else None
    shop = shop_for(plan.environment, brand) if (brand and any(b.atShop for b in plan.beats)) else None
    env_cache: dict = {}

    def env_setup(env_name: str):
        """per-location shop + staging anchors (a beat may move the story to another location)"""
        if env_name not in env_cache:
            shp = shop if env_name == plan.environment else (shop_for(env_name, brand) if shop else None)
            ancs = anchors(env_name, shp)
            env_cache[env_name] = (shp, ancs[0] if shp else None, [x for x in ancs if not x.get("shop")])
        return env_cache[env_name]
    def look(c, i):
        o = outfit(c.role, i, c.palette)
        if c.skin:
            o["skin"] = c.skin
        if c.hair:
            o["hair"] = c.hair
        if c.shades is not None:
            o["shades"] = c.shades
        return o
    cast = [{"id": c.id, "name": c.name, "outfit": look(c, i), **({"scale": ROLE_SCALE[c.role]} if c.role in ROLE_SCALE else {})}
            for i, c in enumerate(plan.cast)]
    scale_of = {c["id"]: c.get("scale", 0.72 if c["outfit"].get("build") == "kid" else 1.0) for c in cast}
    known = {c.id for c in plan.cast}
    scenes = []
    spans = beat_spans(plan, words, fps)
    extras_made = 0
    _ANCHOR.clear()
    for a0, _b0, ws0 in spans:   # the first word of each beat sits at its chained start + 3 frames
        if ws0:
            _ANCHOR[id(ws0)] = (ws0[0]["s"], (a0 + 3) if a0 else int(round(ws0[0]["s"] * fps)))
    hot: set[float] = set()   # word start times shown as highlighted captions (impact / effect words)
    for si, (bi, sub_k, beat, a, b, ws) in enumerate(expand_views(plan, spans, fps)):
        env_b = beat.environment or plan.environment
        shop_b, shop_anchor, free = env_setup(env_b)
        anc = shop_anchor if (beat.atShop and shop_anchor) else free[(beat.spot if beat.spot is not None else bi * 2 + plan.seed) % len(free)]
        Cx, Cz = anc["C"]
        ux, uz = anc["u"]
        rx, rz = -uz, ux                      # screen right
        seen: set[str] = set()
        chars = [c for c in beat.characters if c.id in known and not (c.id in seen or seen.add(c.id))]  # one card per character
        focus_id = beat.focus if beat.focus in {c.id for c in chars} else (chars[0].id if chars else None)
        order = sorted(chars, key=lambda c: 0 if c.id == focus_id else 1)
        # stage inside the visible 9:16 frame: half-width at the subject = d * tan(fov/2) * 9/16
        sp0 = SHOTS[beat.shot]
        half = sp0["d"] * math.tan(math.radians(sp0["fov"] / 2)) * aspect
        spread = max(0.62, min(1.9, 0.78 * half))
        lat = [0.0, -1.0, 1.0, -1.7, 1.7, -2.4, 2.4]
        dep = [0.0, 0.9, 1.4, 2.6, 2.9, 3.8, 4.1]
        actors = []
        pos = {}
        side_pc = next((pc for pc in beat.pieces if pc.where in ("left", "right")), None)
        cast_shift = (0.32 * half) * (1 if side_pc.where == "left" else -1) if side_pc else 0.0
        Cx0, Cz0 = Cx, Cz                     # the camera keeps looking at the stage centre
        Cx, Cz = Cx + rx * cast_shift, Cz + rz * cast_shift
        for k, c in enumerate(order[:7]):
            L, Dp = lat[k] * spread * (1 + 0.12 * dep[k]), dep[k] * (0.6 if beat.shot in ("wide", "high") else 1.0)
            if scale_of.get(c.id, 1.0) > 1.5 and k > 0:   # a giant stands further back so the people in front stay readable
                Dp += 2.2
            if beat.shot in ("close", "insert", "extreme") and k > 0:
                L *= 1.3; Dp += 1.6
            x, z = Cx + rx * L + ux * Dp, Cz + rz * L + uz * Dp
            act = {"castId": c.id, "x": round(x, 3), "z": round(z, 3), "expr": c.expr,
                   "mode": {"walk": "stroll", "wave": "stand", "dance": "dance", "sit": "sit", "march": "march", "stroll": "stroll", "fall": "fall", "stretch": "sit", "run": "run", "jump": "jump"}.get(c.action, "stand")}
            if c.action == "wave":
                act["wave"] = True
            if c.action in ("stretch", "cheer", "panic"):
                act["pose"] = "up"
            if c.action == "panic":
                act["shake"] = 1.0
            if c.action in ("point", "shrug", "hips"):
                act["pose"] = c.action
            if c.action in ("walk", "run"):
                dist = 2.4 if c.action == "walk" else 4.2
                act["x"], act["z"] = round(x - rx * dist, 3), round(z - rz * dist, 3)
                act["walkTo"] = [round(x, 3), round(z, 3)]
                act["walkFrames"] = [a, a + int((0.7 if c.action == "walk" else 0.6) * (b - a))]
            if c.react:
                wf = word_frame(ws, c.react.word, fps)
                if wf is not None:
                    act["exprKeys"] = [{"frame": wf, "expr": c.react.expr}]
            if c.holding:
                act["holding"] = c.holding
            if c.y:
                act["y"] = c.y
            pos[c.id] = (x, z)
            actors.append(act)
        for e in range(min(beat.extras, 2) if plan.graphics == "simple" else beat.extras):
            eid = f"extra{extras_made % 8}"
            extras_made += 1
            if eid not in {c["id"] for c in cast}:
                roles = [beat.extrasRole] if beat.extrasRole else (["kid"] if sum(1 for c in chars if scale_of.get(c.id) == 0.72) * 2 > len(chars) > 0
                                                                     else ["villager_woman", "villager_man", "kid"])
                cast.append({"id": eid, "name": "", "outfit": outfit(roles[e % len(roles)], 11 + e)})
                scale_of[eid] = 0.72 if roles[e % len(roles)] == "kid" else 1.0
            L = (-1) ** e * (1.2 + 1.3 * (e // 2)) + 0.4
            Dp = 3.0 + 1.1 * (e % 3)
            actors.append({"castId": eid, "x": round(Cx + rx * L + ux * Dp, 3), "z": round(Cz + rz * L + uz * Dp, 3),
                           "mode": {"dance": "dance", "walk": "stroll", "march": "march", "sit": "sit"}.get(beat.extrasAction, "stand"),
                           "expr": ["smile", "grin", "nervous", "neutral", "laugh"][e % 5], **({"holding": beat.extrasHolding} if beat.extrasHolding else {})})
        # ---- camera ----
        sp = SHOTS[beat.shot]
        tx, tz = pos.get(focus_id, (Cx0, Cz0)) if beat.shot in ("close", "insert", "two_shot", "extreme", "worm", "dutch") else (Cx0, Cz0)
        if beat.shot == "insert":   # product insert: the object sits 1.1 m in front of the subject, the subject stays soft behind it
            tx, tz = tx - ux * 1.1, tz - uz * 1.1
        side_sign = 1 if si % 2 == 0 else -1   # consecutive shots alternate sides (clause cuts never look like a jump cut)
        fscale = scale_of.get(focus_id, 1.0)
        focus_y = next((c.y or 0.0 for c in chars if c.id == focus_id), 0.0)
        if anc.get("shop") and beat.shot in ("wide", "medium", "high"):
            side_sign = 0           # the shop sign is the subject: frame it centred, never cropped

        def frame_at(shot: str, s_sign: int, roll: float = 0.0) -> dict:
            p = SHOTS[shot]
            dd = p["d"]
            if fscale > 1.2 and shot in ("close", "medium", "two_shot", "insert", "extreme", "worm", "dutch"):
                dd *= min(fscale, 2.2)                              # a giant: step back so the same framing fits
            if env_b in INDOOR_D:
                dd = min(dd, INDOOR_D[env_b])                       # stay in or just outside the room / on the deck
            cx = tx - ux * dd + rx * p["side"] * s_sign
            cz = tz - uz * dd + rz * p["side"] * s_sign
            if env_b in ("village_square", "market") and math.hypot(cx, cz) < 3.8:  # never inside the fountain
                k = 3.8 / max(0.01, math.hypot(cx, cz)); cx, cz = cx * k, cz * k
            # aim at the subject's own eye line (kids are 0.72 x an adult); the lens height follows for eye-level shots
            k_h = fscale if shot in ("close", "insert", "two_shot", "medium", "extreme", "dutch", "worm") else (0.6 * fscale if fscale > 1.2 else 1.0)
            lens_h = p["h"] if shot in ("high", "low", "wide", "worm") else p["h"] * k_h + (1 - k_h) * 0.35
            roll += p.get("roll", 0.0) * (s_sign or 1)
            yo = focus_y   # the lead stands up high (on a pole, hanging from a rocket): lens and aim rise with them
            return {"position": [round(cx, 3), round(lens_h + yo, 3), round(cz, 3)], "lookAt": [round(tx, 3), round(p["lh"] * k_h + yo, 3), round(tz, 3)], "fov": p["fov"], "roll": round(roll, 4)}

        keys = [{"frame": a, **frame_at(beat.shot, side_sign)}]
        if anc.get("shop") and beat.shot == "wide":   # include the whole sign (5.6 m) + awning: look a bit higher
            keys[0]["lookAt"][1] = 2.6
        # frustum check on the opening framing: secondary actors outside 80 % of the visible half-width are pulled in
        if beat.shot not in ("close", "insert", "extreme"):
            k0 = keys[0]
            cpx, cpz = k0["position"][0], k0["position"][2]
            fx_, fz_ = k0["lookAt"][0] - cpx, k0["lookAt"][2] - cpz
            nrm = math.hypot(fx_, fz_) or 1.0
            fx_, fz_ = fx_ / nrm, fz_ / nrm
            tanh = math.tan(math.radians(k0["fov"] / 2)) * aspect
            for act in actors[1:]:
                for key in (("x", "z"),):
                    dx, dz = act["x"] - cpx, act["z"] - cpz
                    depth = dx * fx_ + dz * fz_
                    lat = -dx * fz_ + dz * fx_            # + = screen right
                    lim = 0.8 * max(0.3, depth) * tanh
                    if depth > 0.5 and abs(lat) > lim:
                        shift = (abs(lat) - lim) * (1 if lat > 0 else -1)
                        act["x"] = round(act["x"] + fz_ * shift, 3)
                        act["z"] = round(act["z"] - fx_ * shift, 3)
                        if "walkTo" in act:
                            act["walkTo"] = [round(act["walkTo"][0] + fz_ * shift, 3), round(act["walkTo"][1] - fx_ * shift, 3)]
                        pos[act["castId"]] = (act["x"], act["z"])
        dur_s = (b - a) / fps
        impact = word_frame(ws, beat.impactWord, fps)
        if beat.camMove:
            keys = camera_move(beat.camMove, keys[0], a, b, si, actors[0] if actors else None)
        elif dur_s > 2.6:
            k1 = impact if impact and impact > a + 20 else a + int(0.55 * (b - a))
            k1 = min(k1, b - 18)
            nxt = beat.shot if side_pc else TIGHTER[beat.shot]   # a side piece shares the frame: keep the framing, just re-angle
            if dur_s > 4.8 or nxt == beat.shot:
                keys.append({"frame": k1, "cut": True, **frame_at(nxt, -side_sign or 1, 0.04 * (side_sign or 1))})
            else:
                keys.append({"frame": k1 - 12, "dur": 24, **frame_at(nxt, side_sign, 0.04 * side_sign)})
        focus_idx = 0 if actors and beat.shot != "wide" and beat.shot != "high" else None
        dof = {"cInf": sp["dof"]}
        if focus_idx is not None and sp["dof"] > 0:
            dof["focusActor"] = focus_idx
        scene = {"sceneId": f"b{bi + 1:02d}" + (chr(96 + sub_k) if sub_k else ""), "startFrame": a, "endFrame": b, "narration": beat.narration,
                 "light": beat.light, "mood": beat.mood,
                 "actors": actors, "cameraKeys": keys, "push": sp["push"], "dof": dof, "transitionIn": "cut" if si == 0 else beat.transition,
                 "seed": plan.seed * 100 + bi + 37 * sub_k, "qualityNotes": beat.visual or ""}
        if sub_k:
            scene["sub"] = True     # a clause cut inside a sentence (the ambience bed carries on)
        if beat.look:
            scene["look"] = beat.look
        if beat.hud:
            scene["hud"] = {"kind": beat.hud, **({"text": beat.hudText} if beat.hudText else {})}
        for w_ in (beat.impactWord, *[x.word for x in beat.fx]):
            wf_ = word_frame(ws, w_, fps)
            if wf_ is not None:
                for w in ws:
                    if _norm(w["w"]).startswith(_norm(w_)) and _wf_of(ws, w, fps) - LEAD == wf_:
                        hot.add(w["s"])
        if beat.light == "golden" and env_b in ("beach", "troy", "ocean", "suburb", "lake", "resort", "outback", "canal", "island", "bridge"):
            scene["sunEl"], scene["sunAz"] = 18, 150
        if env_b in ROOMS or env_b == "cave":   # open-topped rooms: a high sun pours in over the walls
            scene["sunEl"], scene["sunAz"] = (42, 165) if env_b == "cave" else (68, 35)   # cave: light from behind the lens onto the far wall
        if env_b != plan.environment or beat.envVariant:
            scene["env"] = {"preset": env_b, "seed": plan.seed, "shop": shop_b, **({"variant": beat.envVariant} if beat.envVariant else {})}
        pcs = []
        for pc in beat.pieces:
            pw, ph = PIECE_SIZE[pc.kind]
            k = pc.scale or 1.0
            if pc.where == "behind":
                off_l, off_d = 0.0, 3.5 + 0.55 * ph * k
            elif pc.where == "far":
                off_l, off_d = 0.0, 12.0 + ph * k
            elif pc.where == "on":   # over the lead character: a cryo tube around him, a bed / box in front of him
                off_l, off_d = 0.0, -0.35
            elif pc.where in ("left", "right"):
                # centre the piece at ~55 % of the visible half-width at its depth (the cast moved the other way)
                off_d = 1.0 + 0.1 * pw * k
                half_at = (SHOTS[beat.shot]["d"] + off_d) * math.tan(math.radians(SHOTS[beat.shot]["fov"] / 2)) * aspect
                off_l = (-1 if pc.where == "left" else 1) * max(0.55 * half_at, 0.35 * pw * k + 0.5) - cast_shift
            else:   # "front": low pieces (sheep) a bit in front of the subject, to one side, inside the frame
                off_d = -1.2
                half_at = (SHOTS[beat.shot]["d"] + off_d) * math.tan(math.radians(SHOTS[beat.shot]["fov"] / 2)) * aspect
                off_l = 0.5 * half_at * (1 if (bi + sub_k) % 2 else -1)
            off_l += pc.dx
            off_d += pc.dz
            px, pz = Cx + rx * off_l + ux * off_d, Cz + rz * off_l + uz * off_d
            spec = {"kind": pc.kind, "x": round(px, 3), "z": round(pz, 3)}
            if pc.scale:
                spec["scale"] = pc.scale
            y = pc.y if pc.y is not None else (-2.6 * k if pc.kind in ("ship", "galley") and env_b in ("beach", "troy", "harbour") else (-4.6 * k if pc.kind == "containership" and env_b == "canal" else 0.0))
            if y:
                spec["y"] = y
            if pc.mirror:
                spec["mirror"] = True
            if pc.label:
                spec["label"] = pc.label
            if pc.spin:
                spec["spin"] = pc.spin
            if pc.shake:
                spec["shake"] = pc.shake
            if pc.lift is not None:   # blast-off across the shot (accelerating)
                spec["liftTo"] = pc.lift
                spec.setdefault("moveFrames", [a + int(0.15 * (b - a)), b])
            if pc.kind in ("ship", "galley") and env_b in ("beach", "troy", "harbour", "ocean"):
                spec["rock"] = 1.0
            if pc.move:
                dist = 7.0 if pc.kind in ("horse", "ship", "galley") else 3.0
                mvx, mvz = {"left": (-rx, -rz), "right": (rx, rz), "toward": (-ux, -uz), "away": (ux, uz)}[pc.move]
                spec["moveTo"] = [round(px + mvx * dist, 3), round(pz + mvz * dist, 3)]
                spec["moveFrames"] = [a + int(0.1 * (b - a)), a + int(0.9 * (b - a))]
            pcs.append(spec)
        if pcs:
            scene["pieces"] = pcs
        if impact:
            scene["kicks"] = [{"frame": impact + LEAD, "amp": 0.8}]
        fxs = []
        for f in beat.fx:
            wf = word_frame(ws, f.word, fps) if f.word else None
            fr = wf if wf is not None else a + 8
            who = pos.get(f.on or focus_id or "", (tx, tz))
            if f.kind == "product" and beat.shot == "insert":
                at = [round(tx, 3), 1.32, round(tz, 3)]; size = 0.55
            elif f.kind == "notes":
                at = [round(who[0] + rx * 0.3, 3), 1.65, round(who[1] + rz * 0.3, 3)]; size = 1.1
            elif f.kind in ("product", "sparkle", "burst", "stars"):
                # above-right of the head but inside the frame: clamp to 70 % of the visible half-height / half-width
                dcam = SHOTS[beat.shot]["d"]
                vhalf = dcam * math.tan(math.radians(sp["fov"] / 2))
                y = min(2.28, sp["lh"] + 0.62 * vhalf)
                side = min(0.42, 0.55 * vhalf * aspect)
                size = min(0.42, 0.32 * vhalf) if f.kind == "product" else min(0.8, 0.5 * vhalf)
                ks = scale_of.get(f.on or focus_id or "", 1.0)
                if ks > 1.2:
                    y, side = y * ks * 0.92, side * ks
                at = [round(who[0] + rx * side, 3), round(y, 3), round(who[1] + rz * side, 3)]
            elif f.kind in ("money", "confetti", "dust"):   # particles raining / drifting through the whole frame around the subject
                at = [round(who[0] - ux * 0.6, 3), 1.4, round(who[1] - uz * 0.6, 3)]; size = 3.2
            elif f.kind == "sparks":
                at = [round(who[0] + rx * 0.5, 3), 1.2, round(who[1] + rz * 0.5, 3)]; size = 1.0
            elif f.kind == "splash":   # a liquid wave rolling in behind/beside the subject, base on the ground
                at = [round(who[0] + rx * 1.4 + ux * 2.5, 3), 1.6, round(who[1] + rz * 1.4 + uz * 2.5, 3)]; size = 4.2
            elif f.kind == "steam":   # rises from the held cup (right hand), not over the body
                at = [round(who[0] + rx * 0.42, 3), 1.32, round(who[1] + rz * 0.42 - uz * 0.05, 3)]; size = 0.32
            else:
                at = [round(who[0], 3), 1.0, round(who[1], 3)]; size = 0.9
            d = b - fr if f.kind in ("notes", "steam", "money", "confetti", "dust") else min(60, b - fr)
            if f.kind == "splash":
                d = min(45, b - fr)
            if d > 4:
                fxs.append({"kind": f.kind, "frame": fr, "dur": d, "at": at, "size": size, **({"product": f.product} if f.product else {}),
                            **({"color": f.color} if getattr(f, "color", None) else {})})
        if fxs:
            if focus_y:
                for e in fxs:
                    e["at"][1] = round(e["at"][1] + focus_y, 3)
            scene["fx"] = fxs
        if beat.text:
            scene["textOverlays"] = [{"text": beat.text, "frame": a + 3, "dur": max(20, b - a - 6), "position": "bottom" if beat.textStyle == "cta" else "top", "style": beat.textStyle}]
        scenes.append(scene)
    # visual style -> post / lens character (storybook = the measured template look)
    post = None
    if plan.style == "minimal_stickman":
        post = {"lens": False}                              # flat, everything sharp
    elif plan.style == "cinematic_explainer":
        for sc in scenes:                                   # stronger, more constant background blur
            sc["dof"] = {**sc["dof"], "cInf": max(sc["dof"].get("cInf", 0), 9 if sc["dof"].get("focusActor") is not None else 0) * 1.25}
    if plan.graphics == "simple":                           # everything sharp: no lens pass needed
        for sc in scenes:
            sc["dof"] = {"cInf": 0}
    total = scenes[-1]["endFrame"]
    sb = {"version": 1, "title": plan.title, "fps": fps, "width": width, "height": height, "durationInFrames": total,
          "env": {"preset": plan.environment, "seed": plan.seed, "shop": shop}, "cast": cast, "scenes": scenes,
          "brand": ({"name": brand["name"], "primary": brand["primary"], "secondary": brand["secondary"], "text": brand["text"]} if brand else None),
          "captions": {"enabled": plan.captions, "words": [({**w, "hot": True} if w["s"] in hot else w) for w in words] if plan.captions else []},
          "style": plan.style,
          "graphics": plan.graphics, **({"post": post} if post else {})}
    validate(sb)
    return sb


def validate(sb: dict) -> list[str]:
    """frame-contract checks; raises ValueError on blocking problems"""
    errs = []
    prev = 0
    for i, s in enumerate(sb["scenes"]):
        if s["startFrame"] != prev:
            errs.append(f"{s['sceneId']}: gap/overlap (starts {s['startFrame']}, previous ended {prev})")
        if s["endFrame"] <= s["startFrame"]:
            errs.append(f"{s['sceneId']}: empty or negative span")
        if not s["cameraKeys"]:
            errs.append(f"{s['sceneId']}: no camera key")
        for k in s["cameraKeys"]:
            if k["frame"] < s["startFrame"] - 12 or k["frame"] > s["endFrame"]:
                errs.append(f"{s['sceneId']}: camera key outside its scene ({k['frame']})")
        prev = s["endFrame"]
    if prev != sb["durationInFrames"]:
        errs.append(f"last scene ends at {prev}, duration is {sb['durationInFrames']}")
    if errs:
        raise ValueError("; ".join(errs))
    return errs
