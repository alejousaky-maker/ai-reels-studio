"""Repair plans written by small local models (and humans) so they always direct well:
- narration label prefixes removed ("Setting:", "Hook:", "Beat 3 -", ...)
- shot names written into `visual` moved into `shot`; monotonous shots replaced by a varied grammar (first beat wide)
- monotonous light replaced by the day -> golden -> night (explanation) -> golden arc; moods follow content
- beats without (valid) characters get cast members, rotating, so no scene is an empty set
- focus always points to a character in the beat
Deterministic. Returns (plan, list of changes) so the UI/manifest can say what was repaired.
"""
from __future__ import annotations

import re

from .schema import Plan

SHOTS = ["wide", "medium", "close", "low", "high", "two_shot", "insert"]
CYCLE = ["wide", "close", "medium", "two_shot", "low", "medium", "close", "high", "two_shot", "medium"]
LABEL = re.compile(r"^\s*(?:(?:hook|setting|setup|context|escalation(?: \d+)?|beat \d+|scene \d+|mystery|pivot|explanation|analogy|payoff|"
                   r"ending|twist|conclusion|consequence|cta|gancho|contexto|escalada|giro|final|explicaci[oó]n)\s*[:\-–—]\s*)", re.I)


def _arc(i: int, n: int) -> str:
    u = i / max(1, n - 1)
    return "day" if u < 0.45 else "golden" if u < 0.62 else "night" if u < 0.85 else "golden"


def normalize_plan(plan: Plan) -> tuple[Plan, list[str]]:
    d = plan.model_dump()
    notes: list[str] = []
    beats = d["beats"]
    n = len(beats)
    cast_ids = [c["id"] for c in d["cast"]]
    for b in beats:
        new = LABEL.sub("", b["narration"]).strip()
        if new != b["narration"]:
            b["narration"] = new[:1].upper() + new[1:]
            notes.append("label prefix removed from narration")
        v = (b.get("visual") or "").strip().lower().replace(" ", "_").replace("-", "_")
        if v in SHOTS:
            b["shot"] = v
            b["visual"] = None
    shots = [b["shot"] for b in beats]
    if n >= 4 and max(shots.count(s) for s in set(shots)) > 0.6 * n:
        for i, b in enumerate(beats):
            b["shot"] = "wide" if i == 0 else CYCLE[i % len(CYCLE)]
        notes.append("monotonous shots replaced by a varied shot grammar")
    runs = 0
    for i in range(2, n):   # never 3 identical shots in a row
        if beats[i]["shot"] == beats[i - 1]["shot"] == beats[i - 2]["shot"]:
            alt = [s for s in ("medium", "close", "two_shot", "low", "wide") if s != beats[i]["shot"]]
            beats[i - 1]["shot"] = alt[i % len(alt)]
            runs += 1
    if runs:
        notes.append(f"{runs} run(s) of identical shots broken up")
    lights = [b["light"] for b in beats]
    if n >= 5 and len(set(lights)) == 1:
        for i, b in enumerate(beats):
            b["light"] = _arc(i, n)
            if b["light"] == "night" and b["transition"] == "cut":
                b["transition"] = "xfade"
        notes.append("light arc day -> golden -> night -> golden applied")
    moods = [b["mood"] for b in beats]
    if n >= 5 and len(set(moods)) == 1:
        for b in beats:
            t = b["narration"].lower()
            b["mood"] = "curious" if t.rstrip().endswith("?") or t.startswith(("you see", "why", "how")) else \
                "tense" if b["light"] == "night" or re.search(r"\b(sudden|burst|crash|danger|shot|fell|broke|disaster)", t) else \
                "warm" if b["light"] == "golden" else "whimsical"
        notes.append("moods derived from content")
    empty = 0
    main = cast_ids[:3] or cast_ids
    for i, b in enumerate(beats):
        seen, chars = set(), []
        for c in b["characters"]:
            if c["id"] in cast_ids and c["id"] not in seen:
                seen.add(c["id"]); chars.append(c)
        if not chars and cast_ids:
            empty += 1
            chars = [{"id": main[i % len(main)], "action": "stand", "expr": ["neutral", "grin", "nervous", "smile", "shock"][i % 5], "react": None, "holding": None}]
            if b["shot"] in ("wide", "medium", "two_shot", "low") and len(cast_ids) > 1:
                other = cast_ids[(cast_ids.index(chars[0]["id"]) + 1) % len(cast_ids)]
                words = re.findall(r"[\w']+", b["narration"])
                chars.append({"id": other, "action": "stand", "expr": "smile", "react": {"word": words[-1], "expr": "shock"} if words else None, "holding": None})
        b["characters"] = chars
        if b.get("focus") not in {c["id"] for c in chars}:
            b["focus"] = chars[0]["id"] if chars else None
    if empty:
        notes.append(f"{empty} beat(s) had no valid characters: cast assigned")
    return Plan.model_validate(d), sorted(set(notes))
