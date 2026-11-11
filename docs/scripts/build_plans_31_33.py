"""Shorts 31-33 (Loophole Lou style, ~60 s, pro cut, 3D sets + CC0 Kenney models + painted pieces, RicksClips-style acting):
31 The Bitcoin pizza, 32 the first video game console (Ralph Baer's Brown Box), 33 how LASIK works.
Facts checked (see verifiedClaims); comic beats are marked fiction.
Run: python docs/scripts/build_plans_31_33.py -> plan_31..33 JSON + STORIES_31-33.md"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", ".."))
sys.path.insert(0, HERE)
from engine.story.schema import Plan  # noqa: E402
from build_plans_14_19 import C, S, B, fx, pc  # noqa: E402

PLANS, CLAIMS = {}, {}

# ---------------------------------------------------------------- 31  The Bitcoin pizza
PLANS["plan_31_bitcoin_pizza"] = dict(
    title="The Most Expensive Pizza in History", environment="bedroom",
    cast=[{"id": "laz", "name": "Programmer", "role": "streamer", "palette": "#3a4566"},
          {"id": "del", "name": "Delivery guy", "role": "driver"}],
    beats=[
        B("In 2010, a programmer paid ten thousand Bitcoins for two large pizzas. Today, those coins would be worth hundreds of millions of dollars.",
          "bedroom", "two_shot", "night", "upbeat", [C("laz", "stand", "grin", "bitcoin"), C("del", "stand", "shock", "pizza")], focus="laz",
          camMove="whip", impactWord="pizzas", fx=[fx("money", "paid", "laz")],
          shots=[S("pizzas", shot="close", characters=[C("del", expr="starry", holding="pizza")], camMove="push"),
                 S("hundreds", shot="extreme", characters=[C("laz", expr="shock")], hud="panel", hudText="10,000 BTC|= 2 PIZZAS", camMove="push")]),
        B("Back then, one Bitcoin was worth less than a penny. You couldn't even buy a pack of gum with it.",
          "shops", "medium", "night", "whimsical", [C("laz", "stand", "confused", "bitcoin")], envVariant="open", crowd=False,
          pieces=[pc("vending", "right")], camMove="truck_right",
          shots=[S("gum", shot="close", characters=[C("laz", expr="pained")], pieces=[pc("vending", "right", label="reject", shake=0.6)],
                   fx=[fx("stars", "gum", "laz")], camMove="whip")]),
        B("So he posted on a forum: \"I'll pay ten thousand Bitcoins for a couple of pizzas.\" Someone actually delivered, and he enjoyed his basically free dinner.",
          "bedroom", "medium", "night", "curious", [C("laz", "sitchair", "smug")], pieces=[pc("monitor", "left", label="10,000 BTC|FOR 2 PIZZAS?")], camMove="push",
          shots=[S("delivered", shot="two_shot", characters=[C("laz", "stand", "love"), C("del", "walk", "neutral", "pizza")], focus="del", camMove="truck_left"),
                 S("free", shot="close", characters=[C("laz", "sitchair", "laugh", "pizza")], fx=[fx("sparkle", "free", "laz")], camMove="push")]),
        B("Then the price exploded. Ten dollars. A thousand. Eighty thousand.",
          "bedroom", "wide", "night", "tense", [C("laz", "stand", "shock")], pieces=[pc("greenarrow", "behind", label="$$$")], camMove="crane_up",
          impactWord="exploded", fx=[fx("dust", "exploded", None)], hud="panel", hudText="BITCOIN|$10 → $1,000 → $80,000"),
        B("Every slice he ate ended up being worth tens of millions of dollars.",
          "bedroom", "close", "night", "tense", [C("laz", "stand", "crazy", "pizza")], camMove="whip", impactWord="millions",
          shots=[S("tens", shot="medium", characters=[C("laz", "panic", "crazy")], pieces=[pc("cashcounter", "right", label="fire", shake=1.0)],
                   fx=[fx("sparks", "millions", "laz")], camMove="orbit")]),
        B("If he'd just paid cash for a salad, he could own a private island today.",
          "bedroom", "medium", "night", "warm", [C("laz", "fall", "cry")], pieces=[pc("glasscase", "right", label="$ PRICELESS $")], look="sepia", camMove="pull",
          shots=[S("island", shot="close", characters=[C("laz", expr="cry")], camMove="push")]),
        B("Now every May 22nd, crypto fans celebrate Bitcoin Pizza Day in his honor.",
          "bedroom", "medium", "night", "upbeat", [C("del", "cheer", "laugh", "pizza")], extras=3, extrasRole="streamer", extrasAction="dance",
          fx=[fx("confetti", "celebrate", "del")], hud="panel", hudText="MAY 22|BITCOIN PIZZA DAY", camMove="orbit"),
        B("And you complain when delivery fees cost five bucks.",
          "bedroom", "close", "night", "whimsical", [C("laz", expr="sad")], pieces=[pc("wallet", "on")], fx=[fx("product", "five", "laz", "moth")], camMove="push"),
        B("Send this to your friend who always sells too early.",
          "gameroom", "wide", "night", "warm", [], hud="outro", transition="dissolve"),
    ])
CLAIMS["plan_31_bitcoin_pizza"] = [
    ("On 22 May 2010 programmer Laszlo Hanyecz paid 10,000 BTC for two pizzas (forum post on bitcointalk, 18 May 2010).", "verified"),
    ("1 BTC was worth well under one US cent at the time (the deal valued the 10,000 BTC at about $41).", "verified"),
    ("Price milestones: ~$10 (2011), ~$1,000 (2013), ~$80,000 (late 2024).", "verified"),
    ("'Hundreds of millions today' depends on the current price (at $60k-100k per BTC, 10,000 BTC = $600M-$1B).", "uncertain"),
    ("Bitcoin Pizza Day is celebrated on 22 May.", "verified"),
    ("Crying at a museum crust / private island: comedy; Hanyecz has said he does not regret it.", "fiction"),
]

# ---------------------------------------------------------------- 32  The first video game console
PLANS["plan_32_first_console"] = dict(
    title="A Bored Engineer Invented Gaming", environment="office",
    cast=[{"id": "ralph", "name": "Engineer", "role": "retroeng"}, {"id": "boss", "name": "Boss", "role": "boss"},
          {"id": "dad", "name": "Dad", "role": "officeguy"}, {"id": "mom", "name": "Mom", "role": "wife"}, {"id": "kid", "name": "Kid", "role": "kid"}],
    beats=[
        B("The first home video game console wasn't invented by a toy company. It was dreamed up by an engineer at a military defense contractor.",
          "office", "medium", "day", "tense", [C("ralph", "stand", "sweat")], envVariant="retro", pieces=[pc("tubetv", "left", label="dots")], camMove="whip",
          impactWord="military",
          shots=[S("dreamed", shot="two_shot", characters=[C("ralph", "stand", "nervous"), C("boss", "walk", "skeptical")], focus="boss",
                   pieces=[pc("blueprint", "left", label="RADAR")], camMove="truck_right"),
                 S("military", shot="close", characters=[C("ralph", expr="smug")], camMove="push")]),
        B("In 1966, tens of millions of American homes had a TV, but all you could do was sit and stare at a handful of channels.",
          "apartment", "wide", "night", "whimsical", [C("dad", "sitchair", "bored"), C("mom", "sitchair", "bored"), C("kid", "sit", "sleepy")], envVariant="retro",
          pieces=[pc("tubetv", "right", label="static")], look="bw", camMove="push",
          shots=[S("stare", shot="close", characters=[C("dad", expr="bored")], camMove="push")]),
        B("Engineer Ralph Baer realized you could wire a box to the TV and actually control glowing white dots on the screen.",
          "office", "medium", "day", "curious", [C("ralph", "point", "starry")], envVariant="retro", pieces=[pc("brownbox", "on", label="open")],
          fx=[fx("product", "realized", "ralph", "lightbulb")], camMove="push",
          shots=[S("control", shot="medium", characters=[C("ralph", "sitchair", "laugh")], pieces=[pc("tubetv", "left", label="dots")],
                   fx=[fx("sparkle", "glowing", "ralph")], camMove="orbit")]),
        B("His prototype was covered in wood-grain sticker, so it became known as the Brown Box.",
          "office", "insert", "day", "upbeat", [], envVariant="retro", pieces=[pc("brownbox", "on")], camMove="push", impactWord="Brown",
          text="THE BROWN BOX", textStyle="title"),
        B("It was so simple it couldn't draw backgrounds, so players stuck plastic sheets onto the TV glass to fake a hockey rink or a football field.",
          "apartment", "medium", "day", "whimsical", [C("ralph", "stand", "proud")], envVariant="retro", pieces=[pc("tubetv", "left", label="field")],
          camMove="whip",
          shots=[S("stuck", shot="insert", pieces=[pc("tubetv", "on", label="field", shake=0.3)], camMove="push"),
                 S("football", shot="close", characters=[C("ralph", expr="wink")], camMove="push")]),
        B("Some bosses thought it was a waste of money.",
          "office", "two_shot", "day", "tense", [C("boss", "hips", "angry"), C("ralph", "shrug", "nervous")], envVariant="retro", focus="boss", camMove="push"),
        B("But in 1972 it became the Magnavox Odyssey, and kick-started an industry now worth nearly two hundred billion dollars a year.",
          "gameroom", "medium", "night", "upbeat", [C("ralph", "cheer", "starry")], pieces=[pc("console", "left")], fx=[fx("money", "billion", "ralph")],
          camMove="crane_up", impactWord="billion",
          shots=[S("industry", shot="wide", characters=[C("ralph", "dance", "laugh")], hud="panel", hudText="GAMING TODAY|~$190 BILLION / YEAR", camMove="orbit")]),
        B("Every time you play GTA or Fortnite, thank a guy who daydreamed at work in 1966.",
          "gameroom", "close", "night", "warm", [C("ralph", "stand", "wink", "controller")], camMove="push", fx=[fx("sparkle", "thank", "ralph")]),
        B("Tag your squad.", "gameroom", "wide", "night", "warm", [], hud="outro", transition="dissolve"),
    ])
CLAIMS["plan_32_first_console"] = [
    ("Ralph Baer, an engineer at defense contractor Sanders Associates, conceived a TV game device in 1966.", "verified"),
    ("The 'Brown Box' prototype (1967-69) was wrapped in wood-grain adhesive; licensed to Magnavox as the Odyssey (1972).", "verified"),
    ("Odyssey games used translucent plastic overlays stuck to the TV screen (they clung by static).", "verified"),
    ("US TV households in 1966: ~50+ million ('tens of millions' is safe); three national networks dominated.", "verified"),
    ("Global games market ~ $180-190 billion per year (2024 estimates).", "verified"),
    ("Some Sanders managers were sceptical but funded it modestly; 'hiding it from the boss' is comedy.", "uncertain"),
]

# ---------------------------------------------------------------- 33  How LASIK works
PLANS["plan_33_lasik"] = dict(
    title="They Open Your Eye Like a Car Hood", environment="clinic",
    cast=[{"id": "doc", "name": "Surgeon", "role": "surgeon"}, {"id": "pat", "name": "Patient", "role": "patient"}],
    beats=[
        B("To fix your blurry vision in about ten minutes, doctors open a tiny flap on your eye like the hood of a car, while you're wide awake.",
          "clinic", "insert", "day", "tense", [], envVariant="surgery", pieces=[pc("eye", "on", y=0.55, label="flap")], camMove="whip", impactWord="hood",
          shots=[S("doctors", shot="medium", characters=[C("doc", "point", "smug")], pieces=[pc("eye", "left", label="flap")], camMove="truck_right"),
                 S("awake", shot="extreme", characters=[C("pat", expr="scared")], camMove="push")]),
        B("Most blurry vision happens because your cornea is curved the wrong amount, so light lands in the wrong spot.",
          "clinic", "medium", "day", "curious", [C("pat", "stand", "squint", "glasses")], camMove="push",
          shots=[S("light", shot="insert", pieces=[pc("eye", "on", y=0.55, label="blur")], camMove="push")]),
        B("With astigmatism, it's shaped more like a football than a basketball.",
          "clinic", "close", "day", "whimsical", [C("pat", expr="confused")], hud="panel", hudText="CORNEA|FOOTBALL, NOT BASKETBALL", camMove="orbit"),
        B("First come numbing drops, so you feel no pain. Then a laser cuts a microscopic flap with a little hinge, like a trapdoor.",
          "clinic", "medium", "day", "warm", [C("pat", "sit", "relief")], envVariant="surgery", pieces=[pc("hospitalbed", "behind")], camMove="push",
          fx=[fx("splash", "drops", "pat")],
          shots=[S("laser", shot="wide", characters=[C("doc", "stand", "proud")], pieces=[pc("laserarm", "left", label="red")], camMove="truck_left"),
                 S("trapdoor", shot="insert", pieces=[pc("eye", "on", y=0.55, label="dots")], camMove="push")]),
        B("Next, an ultraviolet laser fires rapid pulses for a few seconds, vaporizing microscopic layers to reshape the cornea, like carving a contact lens right into your eye.",
          "clinic", "insert", "day", "tense", [], envVariant="surgery", pieces=[pc("eye", "on", y=0.55, label="laser")], hud="panel", hudText="UV LASER|PULSING...",
          fx=[fx("sparks", "vaporizing", None)], camMove="push",
          shots=[S("reshape", shot="medium", characters=[C("doc", "stand", "squint")], pieces=[pc("laserarm", "left")], camMove="orbit"),
                 S("contact", shot="close", characters=[C("pat", expr="starry")], camMove="push")]),
        B("The craziest part? No stitches. They fold the flap back down, and it seals itself by natural suction within minutes.",
          "clinic", "medium", "day", "upbeat", [C("doc", "shrug", "smug")], envVariant="surgery", camMove="whip", impactWord="stitches",
          shots=[S("fold", shot="insert", pieces=[pc("eye", "on", y=0.55, label="check")], fx=[fx("puff", "suction", None)], camMove="push")]),
        B("Many patients see sharply within hours, before their ride home even arrives.",
          "park", "wide", "day", "upbeat", [C("pat", "stand", "starry", "leaf")], camMove="crane_up",
          shots=[S("sharply", shot="close", characters=[C("pat", expr="starry", holding="leaf")], fx=[fx("sparkle", "sharply", "pat")], camMove="push")]),
        B("Send this to your blindest friend with glasses.",
          "clinic", "medium", "day", "warm", [C("pat", "cheer", "laugh", "glasses")], fx=[fx("product", "glasses", "pat", "glasses")], camMove="pull"),
        B("Follow for more.", "gameroom", "wide", "night", "warm", [], hud="outro", transition="dissolve"),
    ])
CLAIMS["plan_33_lasik"] = [
    ("LASIK takes roughly 10-15 minutes for both eyes; patients are awake with numbing drops.", "verified"),
    ("A hinged corneal flap is cut with a femtosecond laser or microkeratome, then an excimer (193 nm UV) laser reshapes the stroma.", "verified"),
    ("Refractive errors come from corneal curvature / eye length; astigmatism = cornea curved more one way (football vs basketball).", "verified"),
    ("No stitches: the flap adheres by the cornea's natural pump/suction within minutes.", "verified"),
    ("Vision often improves within hours; full stabilisation takes days to weeks; not everyone is a candidate.", "uncertain"),
    ("'Like a car hood' is an analogy; the flap is ~0.1 mm thin.", "fiction"),
]


def main():
    md = ["# Shorts 31–33 (Loophole Lou style, ~60 s, 3D sets + CC0 Kenney models)", "",
          "Voice `am_eric*0.7+am_fenrir*0.3` @1.15. `→` = cut inside the sentence.", ""]
    for i, (name, p) in enumerate(PLANS.items()):
        plan = {"version": 1, "lang": "en", "style": "storybook", "graphics": "full", "captions": True, "backdrops": "3d", "seed": 211 + 7 * i, **p,
                "verifiedClaims": [{"text": t, "status": s} for t, s in CLAIMS[name]]}
        P = Plan.model_validate(plan)
        with open(os.path.join(HERE, name + ".json"), "w", encoding="utf-8") as f:
            json.dump(json.loads(P.model_dump_json(exclude_defaults=True)), f, indent=1, ensure_ascii=False)
        words = sum(len(b.narration.split()) for b in P.beats)
        md += [f"## {P.title}  (`{name}.json`, {len(P.beats)} scenes, {words} words ≈ {words / 2.75:.0f} s)", ""]
        for j, b in enumerate(P.beats, 1):
            cut = "".join(f" → **{s.at}**: {s.shot or b.shot}" for s in b.shots)
            who = ", ".join(f"{c.id} ({c.action}, {c.expr}{', ' + c.holding if c.holding else ''})" for c in b.characters) or "no cast"
            md.append(f"{j}. *{b.environment}{'/' + b.envVariant if b.envVariant else ''} · {b.shot} · {b.light}{' · ' + b.camMove if b.camMove else ''}"
                      f"{' · HUD ' + b.hud if b.hud else ''}* — “{b.narration}” — {who}{cut}")
        md += ["", "**Datos comprobados:**"] + [f"- [{s}] {t}" for t, s in CLAIMS[name]] + [""]
    with open(os.path.join(HERE, "STORIES_31-33.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(md))
    print("ok")


if __name__ == "__main__":
    main()
