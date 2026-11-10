from fastapi.testclient import TestClient

from app.backend.main import app
from engine.image import rules_spec, spec_to_plan
from engine.story import director


def test_keyword_reader_spanish_and_english():
    s = rules_spec("Una niña sorprendida con un café en el puerto al atardecer")
    assert s.environment == "harbour" and s.light == "golden"
    assert s.characters[0].role == "kid" and s.characters[0].expr == "shock" and s.characters[0].holding == "coffee"
    e = rules_spec("Two musicians dancing in a park at night with a crowd")
    assert e.environment == "park" and e.light == "night" and e.characters[0].role == "musician"
    assert e.characters[0].action == "dance" and e.extras > 0 and e.shot == "wide"
    i = rules_spec("un científico con una idea en su biblioteca")
    assert i.environment == "interior" and i.characters[0].role == "scholar" and any(f.product == "lightbulb" for f in i.fx)


def test_prompt_words_override_a_confused_model():
    from engine.image import ImageSpec, merge
    # what qwen2.5:7b actually returned for these prompts (real outputs from the first test run)
    bad = ImageSpec.model_validate({"environment": "harbour", "light": "golden", "shot": "medium", "characters": [{"role": "scholar", "action": "stroll", "expr": "shock", "holding": "coffee"}],
                                    "fx": [{"kind": "steam", "product": "coffee"}, {"kind": "steam", "product": "scroll"}]})
    m = merge("Una niña sorprendida con un café en el puerto al atardecer", bad)
    assert m.characters[0].role == "kid" and m.characters[0].holding == "coffee" and m.characters[0].action == "stand"
    assert sum(f.kind == "steam" for f in m.fx) <= 2 and all(f.product != "scroll" for f in m.fx)
    bad2 = ImageSpec.model_validate({"environment": "village_square", "light": "golden", "shot": "wide", "characters": [{"role": "musician", "action": "stroll", "expr": "smile", "holding": "bread"}] * 2,
                                     "fx": [{"kind": "burst", "product": "bread"}]})
    m2 = merge("Dos músicos tocando y la gente bailando en la plaza del pueblo", bad2)
    assert all(c.holding is None for c in m2.characters) and all(f.product != "bread" for f in m2.fx)
    assert m2.extras > 0 and any(c.action == "dance" for c in m2.characters)


def test_image_plan_builds_valid_storyboards_for_every_aspect():
    s = rules_spec("a baker holding bread in the market")
    for w, h in ((1080, 1920), (1440, 1440), (1920, 1080)):
        plan, words = spec_to_plan(s, seed=7, shot="medium")
        sb = director.build_storyboard(plan, words, width=w, height=h)
        assert sb["width"] == w and sb["height"] == h and sb["scenes"][0]["actors"]


def test_image_api_preview_and_path_safety():
    with TestClient(app) as c:
        r = c.post("/api/images/preview-spec", json={"prompt": "un hombre saludando en la calle de noche"})
        assert r.status_code == 200 and r.json()["environment"] == "street" and r.json()["light"] == "night"
        assert c.post("/api/images", json={"prompt": "x"}).status_code == 422
        assert c.post("/api/images", json={"prompt": "valid prompt", "aspect": "3:7"}).status_code == 422
        for evil in ("..%2F..%2Fdata/studio.db", "20260101-000000-abcd/..%2F..%2Fmain.py"):
            assert c.get(f"/api/images/{evil}").status_code == 404
        assert isinstance(c.get("/api/images").json(), list)
