"""Short 25 "The Day I Tried to Be Useful" (Loophole Lou style, first person, pro cut, AI backdrops, RicksClips-style acting).
Run: python docs/scripts/build_plan_25.py -> plan_25_useful_day.json + STORY_25_useful_day.md"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", ".."))
sys.path.insert(0, HERE)
from engine.story.schema import Plan  # noqa: E402
from build_plans_14_19 import C, S, B, fx, pc  # noqa: E402

PLAN = dict(
    title="The Day I Tried to Be Useful", environment="gameroom", seed=101, backdrops="ai", captions=True,
    cast=[{"id": "me", "name": "Gamer (stained hoodie)", "role": "streamer", "palette": "#6b6f78"},
          {"id": "nb", "name": "Neighbour", "role": "villager_man"}],
    claims=[("First-person comedy sketch; fiction.", "fiction")],
    beats=[
        B("What happens when a lifetime gamer finally decides to turn off his console and be useful for a single day? Pure psychological horror.",
          "gameroom", "medium", "night", "tense", [C("me", "stand", "scared", "plug")], camMove="whip", impactWord="horror", look="warm",
          pieces=[pc("monitor", "left", label="GAME OVER"), pc("snacks", "right", scale=1.2)],
          backdrop="a messy gamer bedroom piled with pizza boxes, crushed energy drink cans and tangled wires, dramatic red alarm light",
          shots=[S("useful", shot="extreme", characters=[C("me", expr="sweat", holding="plug")], camMove="push"),
                 S("Pure", shot="dutch", characters=[C("me", "panic", "scared", "plug")], fx=[fx("burst", "horror", "me")], camMove="orbit")]),
        B("Step one: touching grass. Outside air hits my lungs like chemical warfare.",
          "suburb", "medium", "day", "whimsical", [C("me", "walk", "squint", "grass")], transition="whip", camMove="follow", text="STEP 1", textStyle="title",
          backdrop="a bright sunny front yard with a green lawn and a front door",
          shots=[S("Outside", shot="close", characters=[C("me", "stand", "pained", "grass")], fx=[fx("puff", "warfare", "me")], camMove="push")]),
        B("I tried to clean my bedroom. Turns out, under three years of pizza boxes, there was actually a wooden floor.",
          "gameroom", "medium", "day", "whimsical", [C("me", "stand", "stern", "shovel")], pieces=[pc("snacks", "left", scale=1.6), pc("snacks", "right", scale=1.3)],
          camMove="truck_right", backdrop="a messy bedroom with mountains of pizza boxes and a black trash bag",
          shots=[S("under", shot="close", characters=[C("me", "shrug", "shock")], pieces=[pc("snacks", "left", scale=0.6)], camMove="push")]),
        B("Then I tried applying for a real job. The application asked for five years of experience for an entry-level position.",
          "gameroom", "medium", "night", "tense", [C("me", "sitchair", "nervous")], pieces=[pc("monitor", "left", label="JOB APPLICATION")], camMove="push",
          shots=[S("five", shot="close", characters=[C("me", "sitchair", "dazed")], hud="panel", hudText="ERROR|EXPERIENCE REQUIRED: 100 YEARS!", camMove="push")]),
        B("I attempted to cook real food instead of eating instant ramen. I managed to set water on fire.",
          "kitchen", "medium", "day", "tense", [C("me", "stand", "proud", "fryingpan")], camMove="push",
          shots=[S("managed", shot="wide", characters=[C("me", "run", "scared")], fx=[fx("burst", "fire", "me"), fx("sparks", "water", "me")], impactWord="fire", camMove="whip")]),
        B("The worst part about real life? There is no quick-save button. You drop a plate, and it's gone forever.",
          "kitchen", "close", "day", "curious", [C("me", "stand", "skeptical")], camMove="push",
          shots=[S("You", shot="medium", characters=[C("me", "stand", "shock", "plate")], fx=[fx("burst", "gone", "me")], impactWord="gone"),
                 S("forever", shot="close", characters=[C("me", "panic", "crazy", "controller")], hud="panel", hudText="F9 - QUICK LOAD|NOT AVAILABLE", camMove="push")]),
        B("I tried talking to a normal human being outside. We made awkward eye contact for four seconds and I aged ten years.",
          "suburb", "two_shot", "day", "whimsical", [C("me", expr="sweat"), C("nb", expr="sweat")], focus="me", camMove="orbit", crowd=False,
          backdrop="a quiet suburban sidewalk with lawns and houses",
          shots=[S("aged", shot="extreme", characters=[C("me", expr="sleepy")], camMove="push")]),
        B("Nobody warned me that adulting is basically paying a subscription fee just to exist in a server that lags constantly.",
          "gameroom", "medium", "day", "tense", [C("me", "stand", "shock", "envelope")], pieces=[pc("cashcounter", "left", label="fire", shake=1.2)],
          fx=[fx("money", "subscription", "me")], camMove="push",
          shots=[S("server", shot="dutch", characters=[C("me", "panic", "dazed", "envelope")], hud="police", camMove="orbit")]),
        B("After four hours of total productivity, my brain felt like a fried graphics card running Crysis on max settings.",
          "gameroom", "medium", "day", "warm", [C("me", "fall", "dazed")], fx=[fx("steam", "brain", "me"), fx("sparks", "fried", "me")], camMove="crane_up",
          shots=[S("fried", shot="close", characters=[C("me", "fall", "crazy")], fx=[fx("puff", "fried", "me")], camMove="push")]),
        B("I looked at my life, looked at my chores, and made the only logical executive decision.",
          "gameroom", "low", "golden", "warm", [C("me", "walk", "pained")], camMove="follow", pieces=[pc("console", "left", scale=1.2)],
          shots=[S("only", shot="extreme", characters=[C("me", expr="evil")], camMove="push")]),
        B("I pressed the power button. The console beeped. Balance was instantly restored to the universe.",
          "gameroom", "insert", "night", "upbeat", [C("me", "point", "starry")], pieces=[pc("console", "on", scale=1.0)], camMove="push", transition="flash",
          shots=[S("Balance", shot="wide", characters=[C("me", "cheer", "laugh")], pieces=[], fx=[fx("sparkle", "restored", "me")], camMove="crane_up")]),
        B("Sure, I'm unemployed, broke, and living in squalor. But at least my K-D ratio is positive.",
          "gameroom", "medium", "night", "upbeat", [C("me", "sitchair", "smug", "controller")], camMove="pull",
          shots=[S("But", shot="close", characters=[C("me", "sitchair", "starry", "controller")], hud="panel", hudText="VICTORY!|K/D RATIO: 1.01", fx=[fx("confetti", "positive", "me")], camMove="push")]),
        B("Being useful is overrated. Grinding in a fictional video game simulator is where true fulfillment lies.",
          "gameroom", "close", "night", "warm", [C("me", "sitchair", "wink", "controller")], camMove="orbit",
          shots=[S("Grinding", shot="medium", characters=[C("me", "dance", "laugh")], camMove="push")]),
        B("Send this to that friend who really needs to touch grass today.", "gameroom", "wide", "night", "warm", [], hud="outro", transition="dissolve"),
    ])


def main():
    p = dict(PLAN)
    claims = p.pop("claims")
    plan = {"version": 1, "lang": "en", "style": "storybook", "graphics": "full", **p, "verifiedClaims": [{"text": t, "status": s} for t, s in claims]}
    P = Plan.model_validate(plan)
    with open(os.path.join(HERE, "plan_25_useful_day.json"), "w", encoding="utf-8") as f:
        json.dump(json.loads(P.model_dump_json(exclude_defaults=True)), f, indent=1, ensure_ascii=False)
    words = sum(len(b.narration.split()) for b in P.beats)
    md = [f"# {P.title}  (`plan_25_useful_day.json`, {len(P.beats)} scenes, {words} words)", "",
          "First person. Voice `am_eric*0.7+am_fenrir*0.3` @1.15, AI backdrops, captions on. `→` = cut inside the sentence.", ""]
    for i, b in enumerate(P.beats, 1):
        cut = "".join(f" → **{s.at}**: {s.shot or b.shot}" for s in b.shots)
        who = ", ".join(f"{c.id} ({c.action}, {c.expr}{', ' + c.holding if c.holding else ''})" for c in b.characters) or "no cast"
        md.append(f"{i}. *{b.environment} · {b.shot} · {b.light}{' · ' + b.camMove if b.camMove else ''}{' · HUD ' + b.hud if b.hud else ''}* — “{b.narration}” — {who}{cut}")
    with open(os.path.join(HERE, "STORY_25_useful_day.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(md))
    print("ok", len(P.beats), "beats", words, "words")


if __name__ == "__main__":
    main()
