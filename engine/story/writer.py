"""Idea -> coherent story -> directed plan, in three stages:

1. WRITER (local LLM): only the story, with simple fields a small model can fill reliably: title, hook, named cast with
   roles, and per beat: narration, who is on screen, emotion, place, time of day, one object. A worked example
   (few-shot) shows the structure. The target audience shapes vocabulary and references.
2. CRITIC (local LLM): scores relevance to the idea/audience and coherence, lists problems (off-topic, absurd or
   invented explanations, contradictions) and rewrites only the bad sentences. Up to 2 rounds.
3. DIRECTOR (deterministic, no LLM): script_to_plan() turns each sentence into a scene. Place, light, who, emotion
   and objects come from the writer's fields AND from the words of the sentence itself (keyword reader), so what you
   SEE matches what you HEAR. Shots follow a grammar; light follows the story arc.
Also used for user-written scripts (no LLM): their sentences get the same word-driven visuals.
"""
from __future__ import annotations

import json
import re
import urllib.request
from typing import Literal, Optional

from pydantic import BaseModel, Field

from .schema import Plan

OLLAMA = "http://127.0.0.1:11434"
Emotion = Literal["neutral", "happy", "laughing", "surprised", "scared", "sad", "angry", "tired", "proud", "curious"]
Place = Literal["same", "village_square", "market", "street", "park", "interior", "harbour"]
Time = Literal["same", "day", "sunset", "night"]
Obj = Literal["none", "coffee", "croissant", "bread", "cake", "book", "clock", "lightbulb", "heart", "note", "scroll", "question", "exclaim"]
RoleW = Literal["villager_woman", "villager_man", "kid", "official", "musician", "baker", "barista", "scholar", "customer", "elder", "worker"]


class WChar(BaseModel):
    name: str = Field(max_length=30)
    role: RoleW = "villager_man"


class WBeat(BaseModel):
    narration: str = Field(min_length=3, max_length=300)
    who: list[str] = Field(default_factory=list, max_length=3)
    emotion: Emotion = "neutral"
    place: Place = "same"
    time: Time = "same"
    object: Obj = "none"


class WClaim(BaseModel):
    text: str
    status: Literal["verified", "uncertain", "fiction"] = "uncertain"


class WScript(BaseModel):
    title: str = Field(max_length=90)
    characters: list[WChar] = Field(min_length=1, max_length=6)
    beats: list[WBeat] = Field(min_length=4, max_length=24)
    claims: list[WClaim] = Field(default_factory=list)


class Critique(BaseModel):
    relevance: int = Field(ge=0, le=10)
    coherence: int = Field(ge=0, le=10)
    hook: int = Field(ge=0, le=10)
    problems: list[str] = Field(default_factory=list, max_length=12)
    rewrite: list[dict] = Field(default_factory=list, max_length=24)   # [{"index": i, "narration": "..."}]


EXAMPLE = {
    "title": "The Town That Couldn't Stop Dancing",
    "characters": [{"name": "Anna", "role": "villager_woman"}, {"name": "Hans", "role": "villager_man"}, {"name": "Mayor", "role": "official"},
                   {"name": "Historian", "role": "scholar"}],
    "beats": [
        {"narration": "In July 1518, a woman in Strasbourg stepped into the street and started dancing.", "who": ["Anna"], "emotion": "happy", "place": "street", "time": "day", "object": "none"},
        {"narration": "There was no music. And she would not stop.", "who": ["Anna", "Hans"], "emotion": "surprised", "place": "same", "time": "same", "object": "question"},
        {"narration": "Within weeks, dozens of people were dancing with her, drenched in sweat.", "who": ["Anna", "Hans"], "emotion": "tired", "place": "village_square", "time": "same", "object": "none"},
        {"narration": "So the council tried a cure: more dancing. They even hired musicians.", "who": ["Mayor"], "emotion": "proud", "place": "same", "time": "same", "object": "note"},
        {"narration": "It only made things worse.", "who": ["Mayor"], "emotion": "scared", "place": "same", "time": "sunset", "object": "none"},
        {"narration": "Historians still argue why it happened. The leading idea: fear and hunger spread from person to person, like a yawn in a crowded room.", "who": ["Historian"], "emotion": "curious", "place": "interior", "time": "night", "object": "book"},
        {"narration": "By September the dancing faded, and the town that cured dancing with dancing never forgot it.", "who": ["Anna", "Mayor"], "emotion": "tired", "place": "village_square", "time": "sunset", "object": "none"}],
    "claims": [{"text": "A dancing epidemic happened in Strasbourg in 1518.", "status": "verified"},
               {"text": "The cause is debated; mass psychogenic illness is the leading theory.", "status": "verified"},
               {"text": "The yawn comparison is an analogy.", "status": "fiction"}],
}

WRITER = """You write scripts for 45-90 second animated vertical videos (cartoon characters in a small 3D world).
The video must be ABOUT THE USER'S IDEA from the first to the last sentence. Rules:
1. Sentence 1 = the hook: the most surprising TRUE and specific fact of this topic (a name, a number, a date, a place).
2. Then: setting (who, where, when), 3-5 escalating beats with concrete details OF THIS TOPIC, a turning point, a clear
   explanation of why/how, and an ending that pays off the hook. Every sentence must move this story forward.
3. Never invent absurd or magical explanations. At most ONE everyday comparison, and it must be accurate.
4. No facts you are not sure about: if unsure, say it carefully ("historians believe", "some say"). List each factual
   claim in "claims" (verified / uncertain); comparisons are "fiction".
5. Short spoken sentences, simple words for the AUDIENCE. 1-2 sentences per beat. Total about TARGET_WORDS words.
6. Characters: 2-5 named people of the story, each with the closest role from the list. Each beat: who is on screen
   (names), their emotion, the place (or "same"), time (day/sunset/night or "same"), and one object if a sentence
   mentions one (else "none"). Places available: village_square, market, street, park, interior, harbour.
Return ONLY JSON. Example of a good script (different topic, same structure):
"""

CRITIC = """You are a strict script editor. Check this short-video script against the user's IDEA and AUDIENCE.
Score 0-10: relevance (every sentence about the idea), coherence (logical, no contradictions, nothing absurd or
invented), hook (first sentence surprising, true and specific). List concrete problems. For each bad sentence give a
rewrite (same index, same language, similar length) that is accurate, on-topic and engaging for the audience.
Do not rewrite good sentences. Return ONLY JSON."""


def _chat(model: str, system: str, user: str, schema: dict, timeout: int, temperature: float = 0.6, seed: int = 7, extra: list | None = None) -> str:
    msgs = [{"role": "system", "content": system}, *(extra or []), {"role": "user", "content": user}]
    body = json.dumps({"model": model, "messages": msgs, "stream": False, "format": schema, "think": False, "keep_alive": "2m",
                       "options": {"temperature": temperature, "seed": seed, "num_ctx": 8192}}).encode()
    req = urllib.request.Request(OLLAMA + "/api/chat", data=body, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.load(r)["message"]["content"]


def unload(model: str):
    try:
        req = urllib.request.Request(OLLAMA + "/api/generate", data=json.dumps({"model": model, "keep_alive": 0}).encode(), headers={"Content-Type": "application/json"})
        urllib.request.urlopen(req, timeout=20).read()
    except Exception:  # noqa
        pass


def write_script(idea: str, audience: str, lang: str, seconds: int, model: str, seed: int = 7, timeout: int = 300, log=lambda m: None,
                 source: dict | None = None) -> WScript:
    target = int(seconds * (2.9 if lang == "es" else 3.2))
    sys_ = WRITER.replace("TARGET_WORDS", str(target)) + json.dumps(EXAMPLE, ensure_ascii=False)
    src = (f"\nSOURCE (Wikipedia, \"{source['title']}\"). Use ONLY facts found in this source; names, numbers and dates must match it; "
           f"if something is not in the source, do not state it as fact. Mark source facts as verified:\n{source['text']}\n") if source else ""
    user = (f"IDEA: {idea}\nAUDIENCE: {audience or 'general audience on TikTok/Reels/Shorts'}\nLANGUAGE: {'Spanish' if lang == 'es' else 'English'} "
            f"(write every narration in this language)\nLENGTH: about {target} words in {7 if seconds <= 45 else 10}-{10 if seconds <= 45 else 14} beats.{src}")
    last = ""
    extra: list = []
    for attempt in range(3):
        content = _chat(model, sys_, user, WScript.model_json_schema(), timeout, 0.6, seed + attempt, extra)
        try:
            s = WScript.model_validate_json(content)
            words = sum(len(b.narration.split()) for b in s.beats)
            if words < 0.75 * target and attempt < 2:
                extra = [{"role": "user", "content": user}, {"role": "assistant", "content": content[:6000]}]
                user = f"Too short: {words} words, need about {target}. Keep the story, add concrete beats about the idea. Return the full JSON."
                log(f"writer: too short ({words}/{target} words), expanding")
                continue
            return s
        except Exception as e:  # noqa
            last = str(e)[:400]
            log(f"writer: invalid JSON ({last[:80]}), retrying")
    raise RuntimeError(f"writer failed: {last}")


class Rewrites(BaseModel):
    rewrite: list[dict] = Field(default_factory=list, max_length=24)


REWRITER = """Rewrite ONLY the listed sentences of a short-video script so each one is accurate (matching the SOURCE when given),
on-topic for the IDEA, logical, and engaging for the AUDIENCE. Same language, similar length, keep names. Return JSON
{"rewrite": [{"index": n, "narration": "..."}]} with one entry per listed sentence."""


def critique(s: WScript, idea: str, audience: str, lang: str, model: str, timeout: int = 300, rounds: int = 2, log=lambda m: None,
             source: dict | None = None) -> tuple[WScript, dict]:
    report: dict = {"rounds": [], "source": {k: source[k] for k in ("title", "url")} if source else None}
    srcblock = f"\nSOURCE (Wikipedia \"{source['title']}\"):\n{source['text'][:2500]}" if source else ""
    for r in range(rounds):
        listing = "\n".join(f"{i}: {b.narration}" for i, b in enumerate(s.beats))
        user = f"IDEA: {idea}\nAUDIENCE: {audience or 'general'}\nLANGUAGE: {'Spanish' if lang == 'es' else 'English'}{srcblock}\nSCRIPT:\n{listing}"
        try:
            c = Critique.model_validate_json(_chat(model, CRITIC, user, Critique.model_json_schema(), timeout, 0.2))
        except Exception as e:  # noqa
            log(f"critic failed ({str(e)[:80]})"); break
        applied = 0
        for rw in c.rewrite:
            try:
                i, txt = int(rw.get("index", -1)), str(rw.get("narration", "")).strip()
            except Exception:  # noqa
                continue
            if 0 <= i < len(s.beats) and 3 <= len(txt) <= 300 and txt != s.beats[i].narration:
                s.beats[i].narration = txt
                applied += 1
        flagged = sorted({int(m.group(1)) for p_ in c.problems for m in [re.match(r"\s*(\d+)\s*[:.)-]", p_)] if m and int(m.group(1)) < len(s.beats)})
        if flagged and not applied:
            # the critic found problems but did not rewrite: ask for the rewrites explicitly
            ask = "\n".join(f"{i}: {s.beats[i].narration}  -- problem: {next((p_ for p_ in c.problems if re.match(rf'\s*{i}\s*[:.)-]', p_)), '')[:200]}" for i in flagged)
            try:
                rw = Rewrites.model_validate_json(_chat(model, REWRITER, f"IDEA: {idea}\nAUDIENCE: {audience or 'general'}{srcblock}\nSENTENCES TO FIX:\n{ask}",
                                                         Rewrites.model_json_schema(), timeout, 0.3))
                for x in rw.rewrite:
                    i, txt = int(x.get("index", -1)), str(x.get("narration", "")).strip()
                    if i in flagged and 3 <= len(txt) <= 300 and txt != s.beats[i].narration:
                        s.beats[i].narration = txt
                        applied += 1
            except Exception as e:  # noqa
                log(f"rewriter failed ({str(e)[:80]})")
        report["rounds"].append({"relevance": c.relevance, "coherence": c.coherence, "hook": c.hook, "problems": c.problems, "rewritten": applied})
        log(f"critic round {r + 1}: relevance {c.relevance}/10, coherence {c.coherence}/10, hook {c.hook}/10, {applied} sentence(s) rewritten")
        if c.relevance >= 8 and c.coherence >= 8 and c.hook >= 7 and not applied:
            break
    last = report["rounds"][-1] if report["rounds"] else {}
    report.update({k: last.get(k) for k in ("relevance", "coherence", "hook")})
    return s, report


# ------------------------------------------------------------------ deterministic director (sentence -> scene)
EMO = {"neutral": "neutral", "happy": "grin", "laughing": "laugh", "surprised": "shock", "scared": "nervous", "sad": "pained", "angry": "stern",
       "tired": "dazed", "proud": "smile_closed", "curious": "neutral"}
TIME = {"day": "day", "sunset": "golden", "night": "night"}
SHOT_GRAMMAR = ["wide", "close", "medium", "two_shot", "low", "medium", "close", "high", "two_shot", "medium", "close", "wide"]


def _env_from_text(t: str) -> str | None:
    from engine.image import ENV_KW, _plain
    p = " " + _plain(t) + " "
    if re.search(r"boston|nueva york|new york|londres|london|paris|madrid|ciudad|city|downtown|centro", p):
        return "street"
    return next((k for k, rx in ENV_KW if re.search(rx, p)), None)


def script_to_plan(s: WScript, idea: str, lang: str, default_env: str = "village_square", seed: int = 7, style: str = "storybook",
                   brand: dict | None = None, cta: str | None = None, captions: bool = False, critique_report: dict | None = None) -> tuple[Plan, dict]:
    from engine.image import EXPR_KW, ACT_KW, PROD_KW, LIGHT_KW, ROLE_KW, _plain
    base_env = _env_from_text(idea) or default_env
    cast, ids_by_name = [], {}
    for c in s.characters[:6]:
        cid = re.sub(r"[^a-z0-9_]", "", _plain(c.name).replace(" ", "_"))[:20] or f"c{len(cast)}"
        if not cid[0].isalpha():
            cid = "c" + cid
        while cid in {x["id"] for x in cast}:
            cid += "x"
        cast.append({"id": cid, "name": c.name, "role": c.role})
        ids_by_name[_plain(c.name)] = cid
    # tone of the whole story: in a tragedy nobody grins unless the sentence says so
    full = " " + _plain(idea + " " + " ".join(b.narration for b in s.beats)) + " "
    tragic = bool(re.search(r"muert|murier|fallec|victim|herid|desastre|catastrof|tragedi|guerra|bomba|ataque|died|dead|death|killed|injur|disaster|"
                            r"catastroph|tragedy|war\b|attack|bomb", full))
    liquid = "#5a2e12" if re.search(r"melaza|molasses|chocolate|barro|lodo|mud|cafe\b|coffee|petroleo|oil", full) else "#4fa8d8"
    SOFT = {"grin": "neutral", "laugh": "nervous", "smile": "neutral", "smile_closed": "neutral", "lick": "neutral", "whistle": "neutral"}
    beats, env, light, support = [], base_env, "day", 0
    used_places: list[str] = [base_env]
    env_set_at = 0
    n = len(s.beats)
    for i, b in enumerate(s.beats):
        t = " " + _plain(b.narration) + " "
        vis = 0
        # place: writer's choice, else words of the sentence, else stay
        e2 = b.place if b.place != "same" else _env_from_text(b.narration)
        if e2 and (e2 in used_places or len(used_places) < 3):   # at most 3 places per video: the story stays readable
            env = e2; vis += 1; env_set_at = i
            used_places.append(e2) if e2 not in used_places else None
        elif env != base_env and i - env_set_at >= 2:
            env = base_env                                     # a side trip (e.g. the explanation indoors) returns to the main place
        # time of day: writer's, else words, else the arc (day -> sunset -> night for the explanation -> sunset)
        lw = next((k for k, rx in LIGHT_KW if re.search(rx, t)), None)
        if b.time != "same":
            light = TIME[b.time]
        elif lw:
            light = lw; vis += 1
        elif i == int(n * 0.55):
            light = "golden"
        elif i == int(n * 0.7):
            light = "night"
        elif i == n - 2:
            light = "golden"
        # who: named characters mentioned by the writer or in the sentence; else roles mentioned; else protagonist
        who = [ids_by_name[_plain(w)] for w in b.who if _plain(w) in ids_by_name]
        for nm, cid in ids_by_name.items():
            if nm and re.search(rf"\b{re.escape(nm)}\b", t) and cid not in who:
                who.append(cid)
        if not who:
            roles = [k for k, rx in ROLE_KW if re.search(rx, t)]
            who = [c["id"] for c in cast if c["role"] in roles][:2]
        if who:
            vis += 1
        else:
            who = [cast[0]["id"]] + ([cast[1]["id"]] if len(cast) > 1 and i % 2 else [])
        # emotion from the writer, overridden by explicit words; action from words
        expr = EMO.get(b.emotion, "neutral")
        ew = next((k for k, rx in EXPR_KW if re.search(rx, t)), None)
        if ew:
            expr = ew; vis += 1
        act = next((k for k, rx in ACT_KW if re.search(rx, t)), "stand")
        if act != "stand":
            vis += 1
        # objects: writer's object + objects named in the sentence (nothing invented)
        objs = [k for k, rx in PROD_KW if re.search(rx, t)]
        if b.object == "question" and "question" not in objs:   # writer objects are unreliable: only keep what the sentence names
            objs.insert(0, b.object)
        if t.rstrip().endswith("? ") or "?" in b.narration:
            objs.append("question")
        if re.search(r"\b(you see|la clave|resulta que|the reason|por eso|because|porque)\b", t) and "lightbulb" not in objs:
            objs.append("lightbulb")
        held = next((o for o in objs if o in ("coffee", "croissant", "bread", "cake", "book", "scroll")), None)
        icon = next((o for o in objs if o in ("lightbulb", "heart", "question", "exclaim", "clock", "note")), None)
        if objs:
            vis += 1
        if tragic and not ew:
            expr = SOFT.get(expr, expr)
        chars = []
        words = re.findall(r"[\w']+", b.narration)
        for k, cid in enumerate(who[:3]):
            other = "shock" if expr in ("shock", "nervous") else ("neutral" if tragic else "smile")
            ch = {"id": cid, "action": act if k == 0 else "stand", "expr": expr if k == 0 else other}
            if k == 0 and held:
                ch["holding"] = held
            if k == 1 and words:
                ch["react"] = {"word": words[-1], "expr": "shock" if expr in ("shock", "nervous", "pained") or tragic else "grin"}
            chars.append(ch)
        fx = []
        # the event itself, when the sentence names it: a liquid wave, an explosion/collapse
        wave_w = next((w for w in words if re.match(r"(ola|olas|inund|wave|flood|tsunami|derram|riada|torrente)", _plain(w))), None)
        boom_w = next((w for w in words if re.match(r"(explot|estall|explos|colaps|derrumb|burst|explod|collaps|crash|rompi|broke)", _plain(w))), None)
        if wave_w:
            fx.append({"kind": "splash", "color": liquid, "word": wave_w, "on": who[0]}); vis += 1
        if boom_w:
            fx.append({"kind": "burst", "word": boom_w, "on": who[0]}); vis += 1
        if icon == "note":
            fx.append({"kind": "notes", "on": who[0]})
        elif icon:
            kw = next((w for w in words if re.match(r"(idea|why|por|how|c[oó]mo|qu[eé]|clave|reason|amor|love|hora|time)", _plain(w))), None)
            fx.append({"kind": "product", "product": icon, "on": who[0], **({"word": kw} if kw else {})})
        crowd = 5 if re.search(r"multitud|gente|todos|dozens|docenas|cientos|hundreds|crowd|people|ciudad entera|whole town", t) else 0
        shot = "wide" if i == 0 else ("insert" if held and i % 3 == 0 else SHOT_GRAMMAR[i % len(SHOT_GRAMMAR)])
        if crowd and shot in ("close", "insert"):
            shot = "wide"
        if env == "interior" and shot == "high":
            shot = "medium"                                    # a bird's-eye view into a room shows only the floor
        impact = next((w for w in words if re.match(r"(burst|exploded|explot|rompi|broke|crash|boom|ca[yi]|fell|stop|nunca|never)", _plain(w))), None)
        support += 1 if vis >= 2 else 0
        beats.append({"narration": b.narration, "shot": shot, "light": light, "mood": "curious" if "?" in b.narration else "tense" if light == "night" else
                      "warm" if light == "golden" else "whimsical", "characters": chars, "focus": who[0], "fx": fx, "extras": crowd,
                      "extrasAction": "dance" if act == "dance" else "stand", "environment": env if env != base_env else None,
                      "transition": "flash" if i == 1 else ("xfade" if i > 1 and (light != beats[-1]["light"] or (env if env != base_env else None) != beats[-1]["environment"]) else "cut"),
                      **({"impactWord": impact} if impact else {}), "visual": f"{env}, {light}, {', '.join(who)}" + (f", {held or icon}" if (held or icon) else "")})
    src = (critique_report or {}).get("source") or None
    claims = [{"text": c.text, "status": c.status, **({"source": src["url"]} if src and c.status == "verified" else {})} for c in s.claims]
    plan = Plan.model_validate({"title": s.title, "lang": lang, "style": style, "environment": base_env, "seed": seed, "cast": cast, "beats": beats,
                                "verifiedClaims": claims, "brand": brand, "cta": cta, "captions": captions})
    metrics = {"visualSupport": round(support / max(1, n), 2), "beats": n, "places": sorted({b["environment"] or base_env for b in beats}),
               **({k: critique_report.get(k) for k in ("relevance", "coherence", "hook")} if critique_report else {})}
    return plan, metrics


def plan_to_script(plan: Plan) -> WScript:
    """back from a plan to the writer's story (same narration, cast and on-screen people), to re-direct the visuals
    with the current director without touching text or voice"""
    names = {c.id: (c.name or c.id) for c in plan.cast}
    inv = {"grin": "happy", "laugh": "laughing", "shock": "surprised", "nervous": "scared", "pained": "sad", "stern": "angry", "dazed": "tired",
           "smile_closed": "proud", "smile": "happy"}
    beats, prev_env = [], plan.environment
    for b in plan.beats:
        cur = b.environment or plan.environment
        place = cur if cur != prev_env else "same"          # only real changes of place are explicit
        prev_env = cur
        who = [names[c.id] for c in b.characters if c.id in names][:3]
        emo = inv.get(b.characters[0].expr, "neutral") if b.characters else "neutral"
        beats.append({"narration": b.narration, "who": who, "emotion": emo,
                      "place": place, "time": {"day": "day", "golden": "sunset", "night": "night"}.get(b.light, "same")})
    while len(beats) < 4:
        beats.append(dict(beats[-1]))
    return WScript.model_validate({"title": plan.title, "characters": [{"name": names[c.id], "role": c.role} for c in plan.cast][:6],
                                   "beats": beats, "claims": [{"text": c.text, "status": c.status if c.status in ("verified", "uncertain", "fiction") else "uncertain"}
                                                              for c in plan.verifiedClaims]})


def sentences_to_script(text: str, title: str) -> WScript:
    """user-written script (no LLM): sentences -> beats (1-2 sentences each); cast from roles/names found in the text"""
    from engine.image import ROLE_KW, _plain
    sents = [x.strip() for x in re.split(r"(?<=[.!?…])\s+", " ".join(text.split())) if x.strip()]
    beats, buf = [], ""
    for x in sents:
        buf = (buf + " " + x).strip()
        if len(buf.split()) >= 6:
            beats.append(buf); buf = ""
    if buf:
        if beats:
            beats[-1] += " " + buf
        else:
            beats.append(buf)
    while len(beats) < 4:   # schema minimum: split the longest
        k = max(range(len(beats)), key=lambda j: len(beats[j]))
        parts = re.split(r",\s+", beats[k], maxsplit=1)
        if len(parts) < 2:
            break
        beats[k:k + 1] = [parts[0] + ".", parts[1]]
    t = " " + _plain(text) + " "
    roles = [k for k, rx in ROLE_KW if re.search(rx, t)] or ["villager_woman", "villager_man"]
    chars = [{"name": r.replace("_", " ").title(), "role": r} for r in roles[:4]]
    if len(chars) < 2:
        chars.append({"name": "Friend", "role": "villager_man" if chars[0]["role"] != "villager_man" else "villager_woman"})
    while len(beats) < 4:
        beats.append(beats[-1])
    return WScript.model_validate({"title": title, "characters": chars, "beats": [{"narration": b} for b in beats]})
