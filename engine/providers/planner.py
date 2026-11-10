"""Idea -> editable Plan. Providers:
- "ollama": local model via http://127.0.0.1:11434 with a JSON schema constraint, validated by Pydantic, 2 repair tries.
- "template": rule-based, no AI: turns a written script (or the idea's sentences) into beats with sensible shots,
  light progression, cast and effects. Always available.
- "claude": builds a prompt file for Claude (Claude Code / claude.ai, used explicitly by the user) and imports the JSON
  they paste back. No hidden credentials, no automated consumer-session use, no API billing.
"""
from __future__ import annotations

import json
import re
import urllib.request

from engine.story.schema import Plan

OLLAMA = "http://127.0.0.1:11434"
SHOT_CYCLE = ["wide", "close", "medium", "two_shot", "low", "medium", "close", "high", "medium", "two_shot"]
LIGHT_ARC = ["day"] * 6 + ["golden"] * 3 + ["night"] * 2 + ["golden"] * 2


def _sentences(text: str) -> list[str]:
    return [s.strip() for s in re.split(r"(?<=[.!?…])\s+", " ".join(text.split())) if s.strip()]


def ollama_models() -> list[str]:
    try:
        with urllib.request.urlopen(OLLAMA + "/api/tags", timeout=3) as r:
            return [m["name"] for m in json.load(r).get("models", [])]
    except Exception:  # noqa
        return []


def pick_model(pref: str | None = None) -> str | None:
    ms = ollama_models()
    for m in [pref, "qwen3:8b", "qwen3:4b", "qwen2.5:7b", "llama3.1:8b"]:
        if m and m in ms:
            return m
    return ms[0] if ms else None


def _cast_for(kind: str, lang: str) -> list[dict]:
    if kind == "ad":
        return [{"id": "barista", "name": "Barista" if lang == "en" else "Barista", "role": "barista"},
                {"id": "customer", "name": "Customer" if lang == "en" else "Cliente", "role": "customer"},
                {"id": "friend", "name": "Friend" if lang == "en" else "Amiga", "role": "villager_woman"}]
    return [{"id": "hero", "name": "Hero", "role": "villager_woman"}, {"id": "neighbour", "name": "Neighbour", "role": "villager_man"},
            {"id": "kid", "name": "Kid", "role": "kid"}, {"id": "expert", "name": "Expert", "role": "scholar"},
            {"id": "official", "name": "Official", "role": "official"}]


def template_plan(title: str, script: str, kind: str = "story", lang: str = "en", env: str = "village_square", brand: dict | None = None,
                  cta: str | None = None, seed: int = 7, style: str = "storybook", captions: bool = False) -> Plan:
    sents = _sentences(script)
    if not sents:
        raise ValueError("the script is empty")
    # merge very short sentences into the next beat so beats stay >= ~1.5 s
    beats_txt, buf = [], ""
    for s in sents:
        buf = (buf + " " + s).strip()
        if len(buf.split()) >= 5:
            beats_txt.append(buf); buf = ""
    if buf:
        if beats_txt:
            beats_txt[-1] += " " + buf
        else:
            beats_txt.append(buf)
    cast = _cast_for(kind, lang)
    ids = [c["id"] for c in cast]
    beats = []
    n = len(beats_txt)
    for i, t in enumerate(beats_txt):
        shot = SHOT_CYCLE[i % len(SHOT_CYCLE)] if i else "wide"
        light = LIGHT_ARC[min(len(LIGHT_ARC) - 1, int(i / max(1, n - 1) * (len(LIGHT_ARC) - 1)))] if kind != "ad" else "day"
        q = t.rstrip().endswith("?")
        if kind == "ad":
            atshop = i in (0, n - 1) or i % 3 == 0
            chars = [{"id": "barista", "expr": "smile"}, {"id": "customer", "expr": "grin" if i % 2 else "smile", "holding": "coffee" if i % 2 else None}]
            fx = [{"kind": "product", "product": "coffee" if i % 2 == 0 else "croissant"}] if i in (1, 2) else []
            beat = {"narration": t, "shot": "insert" if i == 2 else ("wide" if atshop and i == 0 else shot), "light": light, "mood": "upbeat",
                    "characters": chars, "focus": "customer" if i % 2 else "barista", "fx": fx, "atShop": atshop,
                    "transition": "flash" if i == 1 else "cut"}
            if i == n - 1 and cta:
                beat["text"] = cta; beat["textStyle"] = "cta"
        else:
            main = ids[i % 2]
            chars = [{"id": main, "action": "stand", "expr": ["neutral", "grin", "nervous", "smile"][i % 4]}]
            if shot in ("medium", "two_shot", "wide", "low"):
                other = next(x for x in (ids[(i + 1) % 3], ids[(i + 2) % 3], ids[2]) if x != main)
                chars.append({"id": other, "expr": "smile", "react": {"word": t.split()[-1], "expr": "shock" if i % 2 else "grin"}})
            if "you see" in t.lower() or i == int(n * 0.6):
                chars = [{"id": "expert", "expr": "neutral"}]
            fx = [{"kind": "product", "product": "question"}] if q else ([{"kind": "product", "product": "lightbulb"}] if "you see" in t.lower() else [])
            beat = {"narration": t, "shot": shot, "light": light, "mood": "curious" if q else ("tense" if light == "night" else "whimsical"),
                    "characters": chars, "focus": chars[0]["id"], "fx": fx, "transition": "flash" if i == 1 else ("xfade" if i and light != LIGHT_ARC[0] and i % 4 == 0 else "cut")}
        beats.append(beat)
    plan = {"title": title, "lang": lang, "style": style, "environment": env, "seed": seed, "cast": cast, "beats": beats,
            "brand": brand, "cta": cta, "captions": captions}
    return Plan.model_validate(plan)


SYSTEM = """You are a short-form video writer and director. You write ORIGINAL 2.5D animated vertical shorts.
Return ONLY JSON matching the schema. Rules:
- Hook in the first sentence (a surprising, true or clearly labelled fictional fact). No intros, no "in this video".
- Structure: hook, setting, 3-6 escalating beats, a mystery/question beat, a pivot ("You see,"), an explanation with an
  everyday analogy, an ironic payoff. Each beat = 1-2 short spoken sentences. Plain spoken language.
- Total words close to TARGET_WORDS. Never invent statistics, testimonials or results. Put every factual claim in
  verifiedClaims with status "uncertain" unless the user provided a source; mark analogies as "fiction".
- For ads: only use the brand facts the user gave; CTA only if given; no fake reviews or prices.
- Characters: 3-6 cast members with ids (lowercase) and roles from the enum. Each beat lists who is on screen
  (1-3, the focus first), their action, expression, optional reaction on a specific word of THAT beat.
- Shots vary: wide, medium, close, low, high, two_shot, insert. Light arc day -> golden -> night (explanation) -> golden.
- A beat may set "environment" (village_square, market, street, park, interior, harbour) to move the story to another
  place; keep 1-3 places per video and stay in one place for several beats.
"""


def ollama_plan(idea: str, kind: str, lang: str, seconds: int, env: str, brand: dict | None, cta: str | None, model: str | None = None,
                seed: int = 7, timeout: int = 240) -> tuple[Plan, str]:
    model = model or pick_model()
    if not model:
        raise RuntimeError("Ollama is not running or has no models (install Ollama and run: ollama pull qwen3:4b)")
    target = int(seconds * (3.4 if lang == "en" else 3.0))
    schema = Plan.model_json_schema()
    user = (f"TARGET_WORDS: {target}\nLanguage: {'English' if lang == 'en' else 'Spanish'}\nVideo type: {kind}\nEnvironment: {env}\n"
            f"Idea: {idea}\n" + (f"Brand (approved facts only): {json.dumps(brand, ensure_ascii=False)}\n" if brand else "") +
            (f"CTA: {cta}\n" if cta else "") + "Write the plan now.")
    msgs = [{"role": "system", "content": SYSTEM.replace("TARGET_WORDS", str(target))}, {"role": "user", "content": user}]
    last_err = ""
    for attempt in range(3):
        body = json.dumps({"model": model, "messages": msgs, "stream": False, "format": schema, "options": {"temperature": 0.7, "seed": seed, "num_ctx": 8192},
                           "think": False, "keep_alive": 0}).encode()   # unload right away: never hold VRAM during TTS/render
        req = urllib.request.Request(OLLAMA + "/api/chat", data=body, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            content = json.load(r)["message"]["content"]
        try:
            d = json.loads(content)
            d.setdefault("lang", lang); d["environment"] = env; d["seed"] = seed
            if brand:
                d["brand"] = brand
            if cta:
                d["cta"] = cta
            ids = {c["id"] for c in d.get("cast", [])}
            for b in d.get("beats", []):  # drop references to unknown cast instead of failing
                b["characters"] = [c for c in b.get("characters", []) if c.get("id") in ids][:4]
            plan = Plan.model_validate(d)
            words = len(plan.full_text().split())
            if words < 0.8 * target and attempt < 2:
                # too short for the requested duration: ask for more beats instead of padding with silence
                msgs += [{"role": "assistant", "content": content[:6000]},
                         {"role": "user", "content": f"The narration has only {words} words; it needs about {target} words for {seconds} seconds. "
                                                     f"Keep the same story and cast, add escalation and explanation beats, and return the full JSON."}]
                last_err = f"too short ({words}/{target} words)"
                continue
            return plan, model
        except Exception as e:  # noqa
            last_err = str(e)[:800]
            msgs += [{"role": "assistant", "content": content[:4000]}, {"role": "user", "content": f"That JSON failed validation: {last_err}. Return corrected JSON only."}]
    raise RuntimeError(f"model output did not validate after 3 tries: {last_err}")


def claude_prompt(idea: str, kind: str, lang: str, seconds: int, env: str, brand: dict | None, cta: str | None) -> str:
    target = int(seconds * (3.4 if lang == "en" else 3.0))
    return ("# AI Reels Studio — Claude-assisted script\n\nPaste this whole message into Claude (Claude Code or claude.ai). "
            "Copy the JSON it returns into the app (Editor → Plan → Import JSON).\n\n" + SYSTEM.replace("TARGET_WORDS", str(target)) +
            f"\n\nIdea: {idea}\nType: {kind}\nLanguage: {lang}\nEnvironment: {env}\nTarget words: {target}\n" +
            (f"Brand facts (approved): {json.dumps(brand, ensure_ascii=False)}\n" if brand else "") + (f"CTA: {cta}\n" if cta else "") +
            "\nJSON schema:\n```json\n" + json.dumps(Plan.model_json_schema(), indent=1) + "\n```\n")
