from engine.story import writer as W, director


def _script():
    return W.WScript.model_validate({
        "title": "Molasses",
        "characters": [{"name": "Luis", "role": "villager_man"}, {"name": "Marta", "role": "villager_woman"}, {"name": "Jefe", "role": "official"}],
        "beats": [
            {"narration": "El 15 de enero de 1919, un tanque de melaza estalló en Boston.", "who": ["Luis"], "emotion": "surprised", "place": "street", "time": "day"},
            {"narration": "Marta vio una ola oscura bajando por la calle.", "who": [], "emotion": "scared"},
            {"narration": "¿Cómo puede un dulce ser tan peligroso?", "who": ["Marta"], "emotion": "curious"},
            {"narration": "El jefe de bomberos ordenó rescatar a los vecinos en el puerto.", "who": ["Jefe"], "place": "same"},
            {"narration": "Por la noche, los ingenieros estudiaron el tanque roto.", "who": [], "emotion": "neutral"},
            {"narration": "Resulta que los remaches no aguantaron la presión.", "who": ["Jefe"], "emotion": "curious", "place": "interior"},
            {"narration": "Hoy, algunos vecinos dicen que en verano todavía huele a caramelo.", "who": ["Luis", "Marta"], "emotion": "happy", "place": "park"},
        ],
        "claims": [{"text": "Ocurrió el 15 de enero de 1919.", "status": "verified"}]})


def test_sentences_drive_the_picture():
    plan, m = W.script_to_plan(_script(), "La inundación de melaza de Boston", "es", "village_square", 7, critique_report={"source": {"title": "x", "url": "https://es.wikipedia.org/wiki/X"}})
    b = plan.beats
    assert plan.environment == "street"                                     # "Boston" -> city street
    assert b[1].focus == "marta" and b[1].characters[0].expr == "nervous"   # named in the sentence, scared
    assert any(f.product == "question" for f in b[2].fx)                    # a question gets a "?" icon
    assert b[4].light == "night"                                            # "Por la noche" -> night
    assert any(f.product == "lightbulb" for f in b[5].fx)                   # "Resulta que" -> explanation icon
    places = {x.environment or plan.environment for x in b}
    assert len(places) <= 3                                                  # never more than 3 places
    assert plan.verifiedClaims[0].source.startswith("https://es.wikipedia.org")
    assert m["visualSupport"] >= 0.7
    words = []
    for x in plan.beats:
        for i, w in enumerate(director._tok(x.narration)):
            words.append({"w": w, "s": 0.1 + 0.3 * len(words), "e": 0.35 + 0.3 * len(words)})
    sb = director.build_storyboard(plan, words)
    assert len(sb["scenes"]) == len(plan.beats)


def test_tragic_tone_and_event_effects():
    s = W.WScript.model_validate({"title": "t", "characters": [{"name": "Luis", "role": "villager_man"}, {"name": "Ana", "role": "villager_woman"}],
                                  "beats": [{"narration": "Una ola de melaza inundó las calles de Boston.", "who": ["Luis", "Ana"], "emotion": "happy"},
                                            {"narration": "El tanque estalló sin aviso.", "who": ["Luis"], "emotion": "laughing"},
                                            {"narration": "Murieron 21 personas.", "who": ["Ana"], "emotion": "sad"},
                                            {"narration": "La ciudad nunca lo olvidó.", "who": ["Luis"], "emotion": "proud"}]})
    plan, _ = W.script_to_plan(s, "inundación de melaza de Boston", "es")
    exprs = [c.expr for b in plan.beats for c in b.characters]
    assert not {"grin", "laugh", "smile"} & set(exprs)                       # nobody grins in a tragedy
    sp = [f for f in plan.beats[0].fx if f.kind == "splash"]
    assert sp and sp[0].color == "#5a2e12"                                   # molasses-brown wave on "ola"
    assert any(f.kind == "burst" for f in plan.beats[1].fx)                  # "estalló" -> impact


def test_user_script_path_without_ai():
    s = W.sentences_to_script("Un panadero abrió su tienda a las cinco. Una niña entró sorprendida. Pidió un croissant y un café. "
                              "El panadero sonrió. Desde entonces vuelve cada mañana.", "Panadería")
    assert len(s.beats) >= 4 and any(c.role == "baker" for c in s.characters)
    plan, m = W.script_to_plan(s, "panadería del barrio", "es")
    assert plan.environment == "interior"
    assert any(c.holding in ("croissant", "coffee") for b in plan.beats for c in b.characters)


def test_research_offline_returns_none(monkeypatch):
    from engine.story import research

    def boom(*a, **k):
        raise OSError("offline")
    monkeypatch.setattr(research.urllib.request, "urlopen", boom)
    assert research.lookup("cualquier cosa", "es") is None
