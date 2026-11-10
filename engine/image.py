"""Image from a prompt, in the same 2.5D style as the videos (local, no external image generator).

prompt (ES/EN) -> ImageSpec (place, light, shot, characters with role/action/expression/held object, effects, mood)
via Ollama (JSON-schema constrained) or a keyword reader when no local AI is available -> one-scene plan -> director
-> engine still (PNG, Master scale) -> images/<id>/img_<k>.png. Variants change the camera angle/anchor/shot.
"""
from __future__ import annotations

import json
import os
import re
import time
import unicodedata
import uuid
from typing import Callable, Literal, Optional

from pydantic import BaseModel, Field

from engine.pipeline import ROOT, ENGINE, NODE, node_env, run_proc, Cancelled  # noqa: F401
from engine.story import director
from engine.story.schema import Plan, Role, Expr, Action, Shot, Light, Mood, Product

IMAGES = os.environ.get("AIRS_IMAGES", os.path.join(ROOT, "images"))
ASPECTS = {"9:16": (1080, 1920), "1:1": (1440, 1440), "16:9": (1920, 1080), "4:5": (1440, 1800)}


class ImgChar(BaseModel):
    role: Role = "villager_man"
    action: Action = "stand"
    expr: Expr = "smile"
    holding: Optional[Product] = None


class ImgFx(BaseModel):
    kind: Literal["burst", "stars", "notes", "puff", "product", "steam", "sparkle"]
    product: Optional[Product] = None


class ImageSpec(BaseModel):
    title: str = Field("Image", max_length=80)
    environment: Literal["village_square", "park", "street", "market", "interior", "harbour"] = "village_square"
    light: Light = "day"
    shot: Shot = "medium"
    mood: Mood = "whimsical"
    characters: list[ImgChar] = Field(default_factory=list, max_length=6)
    extras: int = Field(0, ge=0, le=8)
    fx: list[ImgFx] = Field(default_factory=list, max_length=3)
    text: Optional[str] = Field(None, max_length=60)


def _plain(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", s.lower()) if unicodedata.category(c) != "Mn")


# keyword reader (ES + EN). Order matters: first match wins for single-valued fields.
ENV_KW = [("harbour", r"puerto|faro|muelle|barco|mar\b|playa|harbou?r|lighthouse|port\b|boat|sea\b|pier|dock"),
          ("interior", r"casa\b|habitacion|cocina|salon|cafeteria|cafe\b|bar\b|tienda|panaderia|biblioteca|oficina|dentro|interior|room|kitchen|bakery|shop\b|library|indoor"),
          ("park", r"parque|jardin|bosque|arbol|park|garden|forest|tree"),
          ("market", r"mercado|feria|puesto|market|fair|stall"),
          ("street", r"calle|avenida|ciudad|street|avenue|city|town road")]
LIGHT_KW = [("night", r"noche|nocturn|luna|estrella|oscur|night|moon|star|dark"),
            ("golden", r"atardecer|anochecer|amanecer|ocaso|dorad|sunset|sunrise|dusk|golden|evening")]
ROLE_KW = [("kid", r"nin[oa]s?|chic[oa]s? pequen|hij[oa]|kid|child|boy|girl"), ("official", r"alcalde|policia|soldad|general|rey|mayor|officer|king|soldier"),
           ("musician", r"music|violin|guitarr|cantante|musician|singer|band"), ("barista", r"barista|camarer|waiter"),
           ("baker", r"panader|cocinero|chef|baker|cook"), ("scholar", r"cientific|profesor|sabio|historiador|inventor|scientist|professor|teacher|historian"),
           ("elder", r"abuel|ancian|viej|grandma|grandpa|old (man|woman)|elder"), ("worker", r"marinero|pescador|obrero|trabajador|sailor|fisher|worker|builder"),
           ("villager_woman", r"mujer|senora|chica|madre|amiga|woman|lady|mother|girl"), ("villager_man", r"hombre|senor|chico|padre|amigo|man\b|gentleman|father|guy")]
EXPR_KW = [("laugh", r"riendo|carcajad|laugh"), ("grin", r"feliz|content|alegr|sonrie|happy|joy|smil"), ("shock", r"sorprend|asombr|impresion|shock|surpris|amaz"),
           ("nervous", r"nervios|asustad|miedo|preocupad|nervous|scared|afraid|worr"), ("pained", r"triste|llor|dolor|sad|cry|hurt"),
           ("stern", r"enfadad|serio|enojad|furios|angry|serious|stern|mad\b"), ("dazed", r"cansad|mareado|dormid|tired|dizzy|sleepy"), ("whistle", r"silb|whistl")]
ACT_KW = [("dance", r"bail|danz|danc"), ("walk", r"camin|pase|anda|walk|stroll"), ("wave", r"salud|wav|hola|hello"), ("sit", r"sentad|sit"), ("march", r"march")]
PROD_KW = [("coffee", r"cafe\b|taza|coffee|cup"), ("croissant", r"croissant|cruasan"), ("bread", r"\bpan\b|barra|bread|loaf"), ("cake", r"pastel|tarta|cake"),
           ("book", r"libro|book"), ("clock", r"reloj|hora|clock|time"), ("lightbulb", r"idea|bombilla|invent|bulb"), ("heart", r"amor|corazon|love|heart"),
           ("note", r"musica|nota|music|song"), ("scroll", r"carta|pergamino|mensaje|letter|scroll|message"), ("question", r"pregunta|duda|\?|question"), ("exclaim", r"!|alerta|alert")]
NUM = {"dos": 2, "two": 2, "tres": 3, "three": 3, "cuatro": 4, "four": 4, "pareja": 2, "couple": 2}


def rules_spec(prompt: str) -> ImageSpec:
    t = " " + _plain(prompt) + " "
    pick = lambda table, default: next((k for k, rx in table if re.search(rx, t)), default)  # noqa: E731
    env = pick(ENV_KW, "village_square")
    light = pick(LIGHT_KW, "day")
    expr = pick(EXPR_KW, "smile")
    act = pick(ACT_KW, "stand")
    roles = [k for k, rx in ROLE_KW if re.search(rx, t)]
    n = next((v for k, v in NUM.items() if re.search(rf"\b{k}\b", t)), 1)
    if not roles:
        roles = ["villager_woman"]
    chars = []
    for i in range(max(n, len(roles[:3]))):
        r = roles[i % len(roles)]
        chars.append(ImgChar(role=r, action=act if act != "walk" or i == 0 else "stand", expr=expr if i == 0 else ("smile" if expr not in ("shock", "nervous") else expr)))
    prods = [k for k, rx in PROD_KW if re.search(rx, t)]
    held = [p for p in prods if p in ("coffee", "croissant", "bread", "cake", "book", "scroll")]
    if held:
        chars[0].holding = held[0]  # type: ignore[assignment]
    fx = [ImgFx(kind="product", product=p) for p in prods if p in ("lightbulb", "heart", "question", "exclaim", "clock")][:1]
    if "note" in prods or act == "dance":
        fx.append(ImgFx(kind="notes"))
    crowd = 6 if re.search(r"multitud|gente|muchos|fiesta|crowd|people|party|festival", t) else 0
    shot = "wide" if crowd or re.search(r"paisaje|vista|panoram|landscape|view|wide", t) else ("close" if re.search(r"primer plano|retrato|cara|close|portrait|face", t) else
                                                                                               "two_shot" if len(chars) == 2 else "medium")
    mood = "tense" if light == "night" else "warm" if light == "golden" else "whimsical"
    return ImageSpec(title=prompt.strip()[:80] or "Image", environment=env, light=light, shot=shot, mood=mood, characters=chars, extras=crowd, fx=fx)


def detected(prompt: str) -> dict:
    """which fields the prompt states explicitly (keyword reader hits)"""
    t = " " + _plain(prompt) + " "
    hit = lambda table: any(re.search(rx, t) for _k, rx in table)  # noqa: E731
    return {"environment": hit(ENV_KW), "light": hit(LIGHT_KW), "role": hit(ROLE_KW), "expr": hit(EXPR_KW), "action": hit(ACT_KW),
            "products": {k for k, rx in PROD_KW if re.search(rx, t)}, "shot": bool(re.search(r"paisaje|vista|panoram|landscape|view|wide|primer plano|retrato|cara|close|portrait|face|multitud|crowd", t))}


def merge(prompt: str, llm: ImageSpec) -> ImageSpec:
    """explicit words in the prompt win over the model; the model only fills what the prompt leaves open, and it may
    not invent objects (no bread unless the prompt mentions bread)"""
    rs, d = rules_spec(prompt), detected(prompt)
    out = llm.model_copy(deep=True)
    for k in ("environment", "light", "shot"):
        if d[k]:
            setattr(out, k, getattr(rs, k))
    if d["role"]:
        out.characters = rs.characters
    else:
        for c in out.characters:
            if d["expr"]:
                c.expr = rs.characters[0].expr
            if c.action in ("stroll", "march") or d["action"]:
                c.action = rs.characters[0].action if d["action"] else "stand"
    allowed = d["products"]
    for c in out.characters:
        if c.holding and c.holding not in allowed:
            c.holding = None
    fx = [f for f in out.fx if (f.product in allowed if f.product else f.kind in ("notes", "sparkle", "stars", "puff")) and f.kind != "burst"]
    for f in rs.fx:
        if not any(g.kind == f.kind and g.product == f.product for g in fx):
            fx.append(f)
    if "coffee" in allowed and any(c.holding == "coffee" for c in out.characters) and not any(f.kind == "steam" for f in fx):
        fx.append(ImgFx(kind="steam"))
    for f in fx:
        if f.kind == "steam":
            f.product = None
    out.fx = fx[:3]
    out.extras = max(out.extras, rs.extras)
    return out


IMG_SYSTEM ="""You turn a picture request into a JSON scene for a 2.5D cartoon renderer (flat outlined characters in a painted
3D world). Return ONLY JSON for the schema. Choose the environment, light (day/golden/night), shot, 1-4 characters (role, action,
expression, optional held object) and up to 2 effects that best illustrate the request. Use only enum values. Keep the title short."""


def ollama_spec(prompt: str, model: str, timeout: int = 180) -> ImageSpec:
    import urllib.request
    body = json.dumps({"model": model, "messages": [{"role": "system", "content": IMG_SYSTEM}, {"role": "user", "content": prompt}], "stream": False,
                       "format": ImageSpec.model_json_schema(), "options": {"temperature": 0.4}, "think": False, "keep_alive": 0}).encode()
    req = urllib.request.Request("http://127.0.0.1:11434/api/chat", data=body, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return ImageSpec.model_validate(json.loads(json.load(r)["message"]["content"]))


def spec_to_plan(spec: ImageSpec, seed: int, shot: str | None = None) -> tuple[Plan, list[dict]]:
    cast, chars = [], []
    for i, c in enumerate(spec.characters or [ImgChar()]):
        cid = f"c{i}"
        cast.append({"id": cid, "name": c.role, "role": c.role})
        chars.append({"id": cid, "action": c.action, "expr": c.expr, "holding": c.holding})
    fx = [{"kind": f.kind, "product": f.product, "on": "c0"} for f in spec.fx]
    narration = "Picture of the scene for a still image."
    plan = Plan.model_validate({"title": spec.title or "Image", "lang": "en", "environment": spec.environment, "seed": seed, "cast": cast,
                                "beats": [{"narration": narration, "shot": shot or spec.shot, "light": spec.light, "mood": spec.mood, "characters": chars,
                                           "extras": spec.extras, "extrasAction": "dance" if any(c.action == "dance" for c in spec.characters) else "stand",
                                           "focus": "c0", "fx": fx, "text": spec.text, "textStyle": "title"}]})
    toks = director._tok(narration)
    words = [{"w": w, "s": round(0.1 + 0.3 * i, 3), "e": round(0.35 + 0.3 * i, 3)} for i, w in enumerate(toks)]
    return plan, words


VARIANT_SHOTS = {"wide": ["wide", "high", "low"], "medium": ["medium", "two_shot", "low"], "close": ["close", "medium", "low"],
                 "two_shot": ["two_shot", "medium", "wide"], "low": ["low", "medium", "wide"], "high": ["high", "wide", "medium"], "insert": ["insert", "close", "medium"]}


def generate(prompt: str, aspect: str = "9:16", variants: int = 2, provider: str = "auto", model: str | None = None,
             spec: dict | None = None, progress: Callable = lambda *a: None, cancel=None, register=None) -> dict:
    iid = time.strftime("%Y%m%d-%H%M%S") + "-" + uuid.uuid4().hex[:4]
    out = os.path.join(IMAGES, iid)
    os.makedirs(out, exist_ok=True)
    used = "given"
    if spec:
        sp = ImageSpec.model_validate(spec)
    else:
        sp = None
        if provider in ("auto", "ollama") and model:
            try:
                progress("image", -1, f"reading the prompt with {model}")
                sp, used = merge(prompt, ollama_spec(prompt, model)), f"ollama:{model}+keywords"
            except Exception as e:  # noqa
                progress("image", -1, f"local AI failed ({str(e)[:120]}), using the keyword reader")
        if sp is None:
            sp, used = rules_spec(prompt), "keywords"
    w, h = ASPECTS.get(aspect, ASPECTS["9:16"])
    files = []
    shots = VARIANT_SHOTS.get(sp.shot, [sp.shot])
    for k in range(max(1, min(4, variants))):
        if cancel and cancel():
            raise Cancelled()
        plan, words = spec_to_plan(sp, seed=7 + 13 * k, shot=shots[k % len(shots)])
        sb = director.build_storyboard(plan, words, width=w, height=h)
        sbp = os.path.join(out, f"storyboard_{k + 1}.json")
        with open(sbp, "w", encoding="utf-8") as f:
            json.dump(sb, f)
        frame = min(sb["durationInFrames"] - 1, sb["scenes"][0]["startFrame"] + 24)   # after the effects pop in, before any second framing
        scale = 1440 / w if w <= 1440 else 1.0                                        # ~2K on the long side
        if aspect == "16:9":
            scale = 4 / 3
        progress("image", (k + 0.1) / variants, f"rendering variant {k + 1}/{variants} ({shots[k % len(shots)]})")
        ev = []

        def on_line(l: str):
            if l.startswith("{"):
                try:
                    ev.append(json.loads(l))
                except Exception:  # noqa
                    pass
        rc = run_proc([NODE, os.path.join(ENGINE, "scripts", "engine.mjs"), "stills", sbp, os.path.join(out, f"img_{k + 1}_"), str(frame), repr(scale), "png"],
                      on_line, cancel, cwd=ENGINE, env=node_env(), register=register)
        err = [e for e in ev if e.get("event") == "error"]
        if rc != 0 or err:
            raise RuntimeError("render failed: " + (err[0]["message"][:400] if err else f"exit {rc}"))
        src = next(e["file"] for e in ev if e.get("event") == "still")
        dst = os.path.join(out, f"img_{k + 1}.png")
        os.replace(src, dst)
        files.append(os.path.basename(dst))
        progress("image", (k + 1) / variants, f"variant {k + 1} done")
    meta = {"id": iid, "prompt": prompt, "aspect": aspect, "size": [round(w * (1440 / w if w <= 1440 else 1.0)), round(h * (1440 / w if w <= 1440 else 1.0))] if aspect != "16:9" else [2560, 1440],
            "provider": used, "spec": sp.model_dump(), "files": files, "created": time.strftime("%Y-%m-%dT%H:%M:%S"),
            "license": "Original render by AI Reels Studio (own engine, CC0 Kenney props)."}
    with open(os.path.join(out, "image.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=1, ensure_ascii=False)
    return meta


if __name__ == "__main__":
    import sys
    m = generate(" ".join(sys.argv[1:]) or "una niña sorprendida con un café en el puerto al atardecer", variants=2, progress=lambda s, p, m: print(s, p, m))
    print(json.dumps(m, indent=1, ensure_ascii=False))
