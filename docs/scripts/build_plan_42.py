"""Short 42 — Why toast lands butter-side down (Robert Matthews, 1995; the 2001 UK schools toast drop). Hybrid renderer
(Blender world + Poly Haven props + frame-by-frame physics, three.js cast), flow pacing, RicksClips structure.
Run: python docs/scripts/build_plan_42.py -> plan_42_toast.json"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", ".."))
sys.path.insert(0, HERE)
from engine.story.schema import Plan  # noqa: E402
from build_plans_14_19 import C, S, B, fx, pc  # noqa: E402

TOAST = lambda word, n=1: pc("toast", "left", y=0.76, count=n, physics="fall", physicsAt=word)

plan = dict(
    version=1, lang="en", style="storybook", graphics="full", captions=True, renderer="hybrid", pacing="flow", backdrops="3d", crowd=False,
    title="Why Toast Always Lands Butter-Side Down", environment="kitchen", seed=421,
    cast=[{"id": "phys", "name": "Physicist", "role": "retroeng"}, {"id": "kid", "name": "Schoolkid", "role": "kid"},
          {"id": "mate", "name": "Skeptic", "role": "officeguy"}],
    beats=[
        B("He got a thousand schoolkids to knock nearly ten thousand slices of buttered toast off tables, on purpose.",
          "office", "medium", "day", "upbeat", [C("kid", "cheer", "laugh")], envVariant="rows", pieces=[TOAST("knock", 5)], impactWord="toast"),
        B("It's 1995, and a British physicist is tired of hearing that toast landing butter-side down is just bad luck.",
          "office", "medium", "day", "curious", [C("phys", "stand", "skeptical")], envVariant="retro", pieces=[pc("board", "left", label="MURPHY'S LAW?")]),
        B("\"It's fifty-fifty, mate. It's a coin flip.\"",
          "office", "close", "day", "whimsical", [C("mate", "stand", "smug", talk=True)], envVariant="retro"),
        B("So he watches it in slow motion. The slice slides off the edge of the table, starts tipping, and begins to spin.",
          "kitchen", "medium", "day", "curious", [C("phys", "point", "squint")], pieces=[TOAST("slides")]),
        B("From a normal table, it only falls for about a third of a second. That's just enough time for half a turn.",
          "kitchen", "medium", "day", "tense", [C("phys", "stand", "shock")], pieces=[TOAST("falls", 2)], hud="panel", hudText="FALL TIME|0.4 SECONDS"),
        B("Butter side down. Every. Single. Time.",
          "kitchen", "close", "day", "tense", [C("phys", expr="crazy")], pieces=[TOAST("Butter", 3)], impactWord="Time"),
        B("Years later, schoolkids across Britain drop nearly ten thousand slices to test it, and sixty-two percent land butter-side down.",
          "office", "wide", "day", "upbeat", [C("kid", "cheer", "starry")], envVariant="rows", pieces=[TOAST("drop", 6)], hud="bar", hudText="BUTTER-SIDE DOWN|0|62|%"),
        B("You see, tables are about as tall as they are because people are about as tall as they are. For a full turn, a table would need to be nearly three meters high.",
          "office", "medium", "day", "curious", [C("phys", "point", "smug")], envVariant="retro", pieces=[pc("board", "left", label="FULL TURN =|3 M TABLE")]),
        B("So the universe doesn't hate your breakfast. You're just exactly the wrong height to",
          "kitchen", "medium", "day", "warm", [C("phys", "stand", "wink")], pieces=[TOAST("breakfast", 2)]),
    ],
    verifiedClaims=[
        {"text": "Robert Matthews (Eur. J. Phys., 1995) showed toast falling from table height turns about half a turn: butter-side down; Ig Nobel 1996.", "status": "verified"},
        {"text": "A falling time of ~0.39 s from a 0.75 m table.", "status": "verified"},
        {"text": "The 2001 UK schools experiment: 9,821 drops, ~62 % butter-side down; about a thousand children took part.", "status": "uncertain"},
        {"text": "A full turn would need a table about 3 m high (Matthews).", "status": "verified"},
        {"text": "The skeptic's line is invented.", "status": "fiction"},
    ])

P = Plan.model_validate(plan)
with open(os.path.join(HERE, "plan_42_toast.json"), "w", encoding="utf-8") as f:
    json.dump(json.loads(P.model_dump_json(exclude_defaults=True)), f, indent=1, ensure_ascii=False)
print("ok", sum(len(b.narration.split()) for b in P.beats), "words")
