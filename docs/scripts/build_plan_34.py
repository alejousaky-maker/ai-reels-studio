"""Short 34 — first plan in FLOW pacing (RicksClips-style structure, our own story): why airplane windows are round
(de Havilland Comet, 1954). Long travelling shots (~4 s), motion dissolves, no outro card, last sentence cut for the loop.
Run: python docs/scripts/build_plan_34.py -> plan_34_round_windows.json"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", ".."))
sys.path.insert(0, HERE)
from engine.story.schema import Plan  # noqa: E402
from build_plans_14_19 import C, S, B, fx, pc  # noqa: E402

plan = dict(
    title="Why Airplane Windows Are Round", environment="warehouse", pacing="flow", backdrops="3d", seed=341,
    version=1, lang="en", style="storybook", graphics="full", captions=True,
    cast=[{"id": "eng", "name": "Engineer", "role": "retroeng"}, {"id": "boss", "name": "Boss", "role": "boss"},
          {"id": "pilot", "name": "Pilot", "role": "pilot"}],
    beats=[
        # 1 cold open: the strangest act, past tense
        B("He drowned a brand-new jet airliner in a giant tank of water, on purpose.",
          "warehouse", "medium", "day", "tense", [C("eng", "stand", "smug")], pieces=[pc("airplane", "behind", scale=0.6)],
          fx=[fx("splash", "drowned", None)], camMove="push", impactWord="drowned"),
        # 2 present tense, stakes
        B("It's 1954, and the world's first passenger jet is the pride of Britain, flying higher and faster than anything else in the sky.",
          "airport", "wide", "golden", "upbeat", [C("pilot", "wave", "proud")], pieces=[pc("airplane", "far")], camMove="truck_right"),
        B("Then, two of them break apart in midair in just three months.",
          "ocean", "wide", "night", "tense", [], pieces=[pc("airplane", "behind", scale=0.8, shake=1.2)], fx=[fx("dust", "break", None)],
          impactWord="break", transition="flash", camMove="push"),
        # 3 skeptic with a quoted line
        B("His bosses want a quick answer, a bomb, a fire, anything, but instead he builds a swimming pool around a whole plane.",
          "office", "two_shot", "day", "tense", [C("boss", "point", "angry"), C("eng", "stand", "bored")], envVariant="retro", focus="boss",
          shots=[S("instead", environment="warehouse", shot="wide", characters=[C("eng", "point", "proud")], pieces=[pc("airplane", "behind", scale=0.6)])]),
        B("\"We're losing money every day, and you're giving it a bath?\"",
          "office", "close", "day", "whimsical", [C("boss", "hips", "angry", talk=True)], envVariant="retro"),
        # 4 escalation with exact numbers / time marks
        B("But he just pumps the water in and out, again and again, squeezing the cabin like a real flight, day and night.",
          "warehouse", "medium", "night", "curious", [C("eng", "sitchair", "squint")], pieces=[pc("cashcounter", "right", label="")],
          fx=[fx("steam", "squeezing", None)]),
        B("Two hundred flights. A thousand. Three thousand.",
          "warehouse", "close", "night", "tense", [C("eng", expr="sleepy")], hud="bar", hudText="PRESSURE TESTS|200|3000"),
        # 5 twist
        B("Then, one morning there's a bang, and the crack starts at the corner of one little square window.",
          "warehouse", "medium", "day", "tense", [C("eng", "panic", "shock")], fx=[fx("burst", "bang", "eng"), fx("splash", "crack", None)],
          impactWord="bang", transition="flash"),
        # 6 "You see," + everyday analogy
        B("You see, try tearing a sheet of paper. It rips easily from a sharp cut, but a round hole spreads the force all the way around, so a crack has nowhere to start.",
          "office", "medium", "day", "curious", [C("eng", "point", "smug", "note")], envVariant="retro",
          pieces=[pc("board", "left", label="SQUARE = RIP|ROUND = SAFE")]),
        # 7 payoff + loop cut
        B("So he rounds every window, and every plane after that gets them too, which is why the window next to your seat",
          "airport", "medium", "day", "warm", [C("eng", "stand", "proud"), C("pilot", "cheer", "laugh")], focus="eng",
          pieces=[pc("airplane", "far")]),
    ],
    verifiedClaims=[
        {"text": "The de Havilland Comet (1952) was the first jet airliner; two broke up in flight in Jan and Apr 1954 (BOAC 781, SA 201).", "status": "verified"},
        {"text": "RAE Farnborough tested a Comet fuselage in a water tank, cycling cabin pressure; it failed after ~3,000 cycles from a corner of a cut-out.", "status": "verified"},
        {"text": "Later airliners use rounded windows to avoid stress concentrations at corners.", "status": "verified"},
        {"text": "The Comet's windows were rectangular with tight corners ('square' is a simplification).", "status": "uncertain"},
        {"text": "The engineer and the boss are generic stickmen; the quoted line is invented.", "status": "fiction"},
    ])

P = Plan.model_validate(plan)
with open(os.path.join(HERE, "plan_34_round_windows.json"), "w", encoding="utf-8") as f:
    json.dump(json.loads(P.model_dump_json(exclude_defaults=True)), f, indent=1, ensure_ascii=False)
print("ok", sum(len(b.narration.split()) for b in P.beats), "words")
