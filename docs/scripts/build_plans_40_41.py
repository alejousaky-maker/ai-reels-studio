"""Shorts 40-41 — GTA 6 comedy, Blender renderer, flow pacing, RicksClips structure (cold open on the weirdest act, escalation
with exact times and numbers, a real fact behind it with "You see," and a last line cut mid-way so it loops).
40 "Vice City Fever" (the fake sick day pandemic), 41 the $150 rumour (he sells everything).
Parody: all bosses, doctors and gamers are generic stickmen. Run: python docs/scripts/build_plans_40_41.py"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", ".."))
sys.path.insert(0, HERE)
from engine.story.schema import Plan  # noqa: E402
from build_plans_14_19 import C, S, B, fx, pc  # noqa: E402

BASE = dict(version=1, lang="en", style="storybook", graphics="full", captions=True, renderer="blender", pacing="flow", backdrops="3d", crowd=False)
PLANS, CLAIMS = {}, {}

# ---------------------------------------------------------------- 40  Vice City Fever
PLANS["plan_40_vice_city_fever"] = dict(
    title="The Vice City Fever Pandemic", environment="office", seed=401, renderer="hybrid",
    cast=[{"id": "me", "name": "Gamer", "role": "streamer"}, {"id": "boss", "name": "Boss", "role": "boss"},
          {"id": "room", "name": "Roommate", "role": "capgamer"}, {"id": "doc", "name": "Doctor", "role": "doctor"}],
    beats=[
        B("The day GTA 6 drops, forty million gamers will mysteriously catch the exact same illness at exactly 8 AM.",
          "bedroom", "medium", "day", "tense", [C("me", "stand", "sweat", "phone")], hud="panel", hudText="8:00 AM|LAUNCH DAY", impactWord="illness"),
        B("It starts with one guy. He calls his boss, coughs twice into the phone, and whispers, \"I think it's contagious.\"",
          "bedroom", "close", "day", "whimsical", [C("me", "stand", "sad", "phone", talk=True)], fx=[fx("puff", "coughs", "me")]),
        B("Then his roommate calls in sick. Then his cousin. Then the entire night shift of a pizza place.",
          "kitchen", "medium", "day", "upbeat", [C("room", "stand", "sweat", "phone", talk=True)],
          pieces=[pc("snacks", "right", count=5, physics="topple", physicsAt="pizza")]),
        B("By nine, the office is a ghost town: a hundred empty desks, and one boss standing in the middle of it, holding a phone that will not stop ringing.",
          "office", "wide", "day", "tense", [C("boss", "stand", "shock", "phone")], envVariant="rows", camMove="crane_up"),
        B("Every excuse is worse than the last. One guy's grandma is sick again, for the fourth time this year.",
          "office", "close", "day", "whimsical", [C("boss", expr="skeptical", holding="phone")], envVariant="rows", hud="panel", hudText="GRANDMA SICK|4TH TIME THIS YEAR"),
        B("Another one swears he's calling from the hospital, but behind his voice the boss can hear police sirens, explosions, and a radio station from the eighties.",
          "bedroom", "medium", "night", "tense", [C("room", "sitchair", "crazy", "controller", talk=True)], pieces=[pc("tv", "left", label="~game|WANTED *****")],
          hud="police", impactWord="explosions"),
        B("So the boss does the smart thing. No doctor's note, no paycheck.",
          "office", "medium", "day", "tense", [C("boss", "point", "angry", "phone", talk=True)], envVariant="rows", impactWord="paycheck"),
        B("By noon, his inbox has a doctor's note from every single one of them, all signed by the same doctor, all with the same diagnosis.",
          "office", "medium", "day", "curious", [C("boss", "stand", "shock")], envVariant="rows",
          pieces=[pc("monitor", "left", label="DIAGNOSIS:|VICE CITY FEVER"), pc("papers", "on", count=16, physics="drop", physicsAt="note")]),
        B("You see, this already happens. After the Super Bowl, surveys estimate millions of workers plan to skip Monday, and the most popular excuse is a stomach bug.",
          "office", "medium", "day", "curious", [C("boss", "stand", "squint")], envVariant="rows", pieces=[pc("board", "right", label="SUPER BOWL MONDAY|MILLIONS 'SICK'")]),
        B("So the boss drives to the clinic to confront the doctor himself.",
          "street", "wide", "day", "tense", [C("boss", "walk", "angry")], pieces=[pc("car", "right")]),
        B("He kicks open the door and finds him in his lab coat, controller in hand, three hours into the very first mission of",
          "clinic", "medium", "night", "warm", [C("doc", "sitchair", "starry", "controller"), C("boss", "stand", "shock")], focus="doc",
          pieces=[pc("tv", "left", label="~game|MISSION 1")], impactWord="controller"),
    ])
CLAIMS["plan_40_vice_city_fever"] = [
    ("'Forty million gamers calling in sick' is a comedy exaggeration, not a statistic.", "fiction"),
    ("Workforce Institute surveys (2016-2020) estimated ~10-17 million US workers expected to miss work the Monday after the Super Bowl.", "verified"),
    ("The boss, the doctor and every excuse are invented; parody of GTA 6 hype (no real people).", "fiction"),
]

# ---------------------------------------------------------------- 41  The $150 rumour
PLANS["plan_41_150_dollars"] = dict(
    title="He Sold Everything for GTA 6", environment="apartment", seed=411, renderer="hybrid",
    cast=[{"id": "me", "name": "Gamer", "role": "streamer", "palette": "#3a4566"}, {"id": "gf", "name": "Girlfriend", "role": "girlfriend"},
          {"id": "buyer", "name": "Buyer", "role": "officeguy"}],
    beats=[
        B("Rumors say GTA 6 might cost a hundred and fifty dollars, and gamers are already selling their furniture to pre-order it.",
          "apartment", "medium", "day", "tense", [C("me", "stand", "shock", "phone")], pieces=[pc("board", "left", label="GTA 6|$150 ???")], impactWord="hundred"),
        B("Our hero checks his bank account: twelve dollars and a coupon for free fries.",
          "apartment", "close", "day", "whimsical", [C("me", expr="sad", holding="phone")], hud="panel", hudText="BALANCE|$12.00 + 1 COUPON"),
        B("So he looks around his apartment and starts doing math.",
          "apartment", "wide", "day", "curious", [C("me", "stand", "squint")], camMove="orbit"),
        B("The bed goes first. Eighty dollars, to a guy who doesn't even ask why it smells like cheese puffs.",
          "bedroom", "two_shot", "day", "whimsical", [C("buyer", "stand", "skeptical"), C("me", "point", "smug")], focus="me",
          pieces=[pc("bed", "behind")], hud="panel", hudText="GTA FUND|$80"),
        B("Then the fridge, with the food still inside. Another sixty.",
          "kitchen", "medium", "day", "upbeat", [C("me", "point", "proud")],
          pieces=[pc("fridge", "left"), pc("snacks", "right", count=6, physics="throw", physicsAt="food")], hud="panel", hudText="GTA FUND|$140"),
        B("His girlfriend asks where the couch went. He tells her it's \"on a journey.\"",
          "apartment", "two_shot", "day", "tense", [C("gf", "hips", "angry", talk=True), C("me", "stand", "sweat")], envVariant="empty", focus="gf"),
        B("Then he sells his car. Now he can't drive to the store, but who cares? It's a digital download.",
          "street", "medium", "day", "upbeat", [C("me", "cheer", "laugh")], pieces=[pc("car", "left", label="SOLD")], hud="panel", hudText="GTA FUND|$1,140"),
        B("You see, rumors like this spread because the last GTA launched at sixty dollars back in 2013, and big new games have already climbed to seventy, even eighty.",
          "apartment", "medium", "day", "curious", [C("me", "point", "smug")], envVariant="empty", pieces=[pc("board", "left", label="2013: $60|NOW: $70-80")]),
        B("Launch night: no bed, no fridge, no car. Just him, sitting on a cardboard box in an empty room, in front of the biggest TV money can buy.",
          "apartment", "wide", "night", "warm", [C("me", "sitchair", "starry", "controller")], envVariant="empty",
          pieces=[pc("cardbox", "on"), pc("tv", "left", scale=1.8, label="~game|DOWNLOADING 99%")], camMove="pull"),
        B("And when the price is finally announced, it's the normal price, which means he sold his bed for",
          "apartment", "close", "night", "tense", [C("me", expr="broken", holding="controller")], envVariant="empty", fx=[fx("stars", "normal", "me")]),
    ])
CLAIMS["plan_41_150_dollars"] = [
    ("A $150 GTA 6 price is an online rumour, not an announced price.", "uncertain"),
    ("GTA V launched at $59.99 in 2013; major new games now list at $70, some at $80.", "verified"),
    ("The sales, the couch 'on a journey' and the final price are invented for the joke.", "fiction"),
]


def main():
    md = ["# Shorts 40–41 (GTA 6 comedy, Blender, flow pacing)", "", "Voice `am_eric*0.7+am_fenrir*0.3` @1.35.", ""]
    for name, p in PLANS.items():
        P = Plan.model_validate({**BASE, **p, "verifiedClaims": [{"text": t, "status": s} for t, s in CLAIMS[name]]})
        with open(os.path.join(HERE, name + ".json"), "w", encoding="utf-8") as f:
            json.dump(json.loads(P.model_dump_json(exclude_defaults=True)), f, indent=1, ensure_ascii=False)
        words = sum(len(b.narration.split()) for b in P.beats)
        md += [f"## {P.title}  (`{name}.json`, {len(P.beats)} beats, {words} words)", ""]
        md += [f"{j}. *{b.environment}{'/' + b.envVariant if b.envVariant else ''}* — “{b.narration}”" for j, b in enumerate(P.beats, 1)]
        md += ["", "**Datos:**"] + [f"- [{s}] {t}" for t, s in CLAIMS[name]] + [""]
    with open(os.path.join(HERE, "STORIES_40-41.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(md))
    print("ok")


if __name__ == "__main__":
    main()
