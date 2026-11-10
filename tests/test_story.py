import pytest
from pydantic import ValidationError

from engine.story.schema import Plan
from engine.story import director
from engine.providers.planner import template_plan


def _words(plan: Plan, rate=3.5):
    out, t = [], 0.06
    for b in plan.beats:
        for w in director._tok(b.narration):
            d = max(0.12, len(w) / 14)
            out.append({"w": w, "s": round(t, 3), "e": round(t + d, 3)})
            t += d + 0.04
        t += 0.14
    return out


def plan_fixture():
    return template_plan("Test", "A woman started dancing in 1518. Nobody could stop her. Then her neighbour joined in, and then another one. "
                         "Why did it happen? You see, fear spreads like a yawn across a room. The town never forgot it.", lang="en")


def test_storyboard_contract():
    plan = plan_fixture()
    words = _words(plan)
    sb = director.build_storyboard(plan, words)
    assert sb["scenes"][0]["startFrame"] == 0
    prev = 0
    for s in sb["scenes"]:
        assert s["startFrame"] == prev and s["endFrame"] > s["startFrame"]
        assert s["cameraKeys"] and s["cameraKeys"][0]["frame"] == s["startFrame"]
        for a in s["actors"]:
            for k in a.get("exprKeys", []):
                assert s["startFrame"] - 3 <= k["frame"] <= s["endFrame"]
        prev = s["endFrame"]
    assert prev == sb["durationInFrames"]
    # the picture of beat k starts 0-3 frames before its first word
    i = 0
    for b, s in zip(plan.beats, sb["scenes"]):
        n = len(director._tok(b.narration))
        if s["startFrame"]:
            assert 0 <= round(words[i]["s"] * 30) - s["startFrame"] <= 5
        i += n
    # ends ~0.8 s after the last word
    assert abs(sb["durationInFrames"] / 30 - (words[-1]["e"] + 0.8)) < 0.05


def test_time_shift_keeps_later_scenes_identical():
    """a longer hook shifts every later word; later scenes must keep identical relative content (render cache reuse)"""
    from engine.pipeline import _strip_frames
    plan = plan_fixture()
    w0 = _words(plan)
    n0 = len(director._tok(plan.beats[0].narration))
    for delta in (0.37, 0.511, -0.123, 1.0):
        w1 = [dict(w) for w in w0]
        for w in w1[n0:]:
            w["s"] = round(w["s"] + delta, 3); w["e"] = round(w["e"] + delta, 3)
        a = director.build_storyboard(plan, w0)["scenes"]
        b = director.build_storyboard(plan, w1)["scenes"]
        same = sum(_strip_frames(x, x["startFrame"]) == _strip_frames(y, y["startFrame"]) for x, y in zip(a[1:], b[1:]))
        assert same == len(a) - 1, (delta, same, len(a) - 1)   # every later scene identical


def test_per_beat_location_interior_sun_and_kid_eyeline():
    d = plan_fixture().model_dump()
    d["environment"] = "harbour"
    d["beats"][1]["environment"] = "interior"
    d["beats"][1]["shot"] = "close"
    d["beats"][1]["characters"] = [{"id": "kid", "expr": "grin"}]
    d["beats"][1]["focus"] = "kid"
    plan = Plan.model_validate(d)
    sb = director.build_storyboard(plan, _words(plan))
    assert sb["env"]["preset"] == "harbour" and "env" not in sb["scenes"][0]
    s = sb["scenes"][1]
    assert s["env"]["preset"] == "interior" and s["sunEl"] >= 60
    assert s["cameraKeys"][0]["lookAt"][1] < 1.2          # aimed at the kid's eyes, not an adult's (1.5)
    k0 = s["cameraKeys"][0]["position"]
    assert abs(k0[2] - s["actors"][0]["z"]) <= 7.01       # interior lens stays within 7 m of the subject


def test_normalizer_repairs_lazy_llm_plans():
    from engine.story.normalize import normalize_plan
    beats = [{"narration": f"Setting: thing number {i} happens in town today.", "shot": "medium", "light": "day", "mood": "whimsical",
              "characters": [{"id": "ghost"}] if i % 2 else [], "visual": "wide" if i == 0 else None} for i in range(10)]
    p = Plan.model_validate({"title": "t", "cast": [{"id": "ana", "role": "villager_woman"}, {"id": "bo", "role": "kid"}], "beats": beats})
    n, notes = normalize_plan(p)
    assert all(b.characters and b.focus for b in n.beats)                      # no empty scenes
    assert not any(b.narration.lower().startswith("setting") for b in n.beats)
    assert len({b.shot for b in n.beats}) >= 4 and n.beats[0].shot == "wide"
    assert {"day", "golden", "night"} <= {b.light for b in n.beats}
    for i in range(2, 10):
        assert not (n.beats[i].shot == n.beats[i - 1].shot == n.beats[i - 2].shot)
    assert notes


def test_validate_catches_gap():
    plan = plan_fixture()
    sb = director.build_storyboard(plan, _words(plan))
    sb["scenes"][1]["startFrame"] += 5
    with pytest.raises(ValueError):
        director.validate(sb)


def test_characters_inside_frame():
    import math
    from engine.story.presets import SHOTS
    plan = plan_fixture()
    sb = director.build_storyboard(plan, _words(plan))
    for s, b in zip(sb["scenes"], plan.beats):
        k = s["cameraKeys"][0]
        cam, look = k["position"], k["lookAt"]
        fx, fz = look[0] - cam[0], look[2] - cam[2]
        n = math.hypot(fx, fz); fx, fz = fx / n, fz / n
        for a in s["actors"][:2]:
            dx, dz = a["x"] - cam[0], a["z"] - cam[2]
            depth = dx * fx + dz * fz
            lateral = abs(-dx * fz + dz * fx)
            half = depth * math.tan(math.radians(k["fov"] / 2)) * 9 / 16
            if b.shot not in ("close", "insert"):
                assert depth > 0 and lateral < half * 1.15, (s["sceneId"], a["castId"], lateral, half)


def test_plan_rejects_bad_input():
    with pytest.raises(ValidationError):
        Plan.model_validate({"title": "x", "cast": [{"id": "Bad Id!", "role": "kid"}], "beats": [{"narration": "Hello there."}]})
    with pytest.raises(ValidationError):
        Plan.model_validate({"title": "x", "cast": [], "beats": []})
    with pytest.raises(ValidationError):
        Plan.model_validate({"title": "x", "cast": [], "beats": [{"narration": "ok then", "shot": "dolly_zoom"}]})


def test_reaction_on_word():
    plan = plan_fixture()
    plan.beats[0].characters[0].react = {"word": "dancing", "expr": "shock"}  # type: ignore[assignment]
    plan = Plan.model_validate(plan.model_dump())
    words = _words(plan)
    sb = director.build_storyboard(plan, words)
    k = sb["scenes"][0]["actors"][0]["exprKeys"][0]
    w = next(x for x in words if x["w"].startswith("dancing"))
    assert round(w["s"] * 30) - k["frame"] == director.LEAD


def test_ad_plan_uses_shop_and_cta():
    brand = {"name": "Demo Café", "primary": "#2f6a5a", "secondary": "#f2c94c", "text": "#ffffff"}
    plan = template_plan("Ad", "Want a quiet coffee? We roast every week. Fresh croissants each morning. Come say hello.", kind="ad", lang="en",
                         env="street", brand=brand, cta="Come say hello")
    sb = director.build_storyboard(plan, _words(plan))
    assert sb["env"]["shop"]["name"] == "Demo Café"
    assert sb["scenes"][-1]["textOverlays"][0]["text"] == "Come say hello"


def test_graphics_full_is_default_and_simple_is_lighter():
    plan = plan_fixture()
    assert plan.graphics == "full"            # the Demo A look by default
    plan.beats[0].extras = 8
    full = director.build_storyboard(plan, _words(plan))
    assert full["graphics"] == "full"
    simple = director.build_storyboard(plan.model_copy(update={"graphics": "simple"}), _words(plan))
    assert simple["graphics"] == "simple"
    assert all(s["dof"] == {"cInf": 0} for s in simple["scenes"])
    n = lambda sb: sum(1 for a in sb["scenes"][0]["actors"] if a["castId"].startswith("extra"))  # noqa: E731
    assert n(full) == 8 and n(simple) == 2

def test_story_plans_build_and_new_locations():
    """the six house-formula plans validate and direct: per-beat locations, variants, set pieces, a giant scale"""
    import glob
    import json
    import os
    root = os.path.join(os.path.dirname(__file__), "..", "docs", "scripts")
    files = sorted(glob.glob(os.path.join(root, "plan_*.json")))
    assert len(files) >= 6
    for f in files:
        plan = Plan.model_validate(json.load(open(f, encoding="utf-8")))
        sb = director.build_storyboard(plan, _words(plan))
        assert len(sb["scenes"]) == len(plan.beats)
        for b, s in zip(plan.beats, sb["scenes"]):
            env = (s.get("env") or sb["env"])["preset"]
            assert env == (b.environment or plan.environment)
            if b.envVariant:
                assert s["env"]["variant"] == b.envVariant
            assert len(s.get("pieces", [])) == len(b.pieces)
    cyc = Plan.model_validate(json.load(open(os.path.join(root, "plan_03_cyclops.json"), encoding="utf-8")))
    sb = director.build_storyboard(cyc, _words(cyc))
    giant = next(c for c in sb["cast"] if c["id"] == "cyclops")
    assert giant["scale"] > 2 and giant["outfit"]["cyclops"] is True