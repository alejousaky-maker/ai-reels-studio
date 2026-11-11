"""Shorts 35-39 — Blender renderer, flow pacing, our own scripts in the 8-step structure (docs/FORMULA.md), facts checked.
35 the microwave (Percy Spencer), 36 bubble wrap, 37 the pinball ban, 38 the Slinky, 39 sticky notes.
No background crowd unless the story asks for it (only 38, where a crowd gathers).
Run: python docs/scripts/build_plans_35_39.py -> plan_35..39 JSON + STORIES_35-39.md"""
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

# ---------------------------------------------------------------- 35  The microwave
PLANS["plan_35_microwave"] = dict(
    title="The Candy Bar That Invented the Microwave", environment="office", seed=351,
    cast=[{"id": "per", "name": "Engineer", "role": "retroeng"}, {"id": "mate", "name": "Coworker", "role": "officeguy"}],
    beats=[
        B("He melted a chocolate bar in his pocket without ever going near a flame.",
          "office", "medium", "day", "tense", [C("per", "stand", "shock", "chocolate")], envVariant="retro", fx=[fx("steam", "melted", "per")], impactWord="melted"),
        B("It's 1945, and he's an engineer testing radar parts for the military, standing right next to a machine called a magnetron.",
          "office", "wide", "day", "curious", [C("per", "point", "proud")], envVariant="retro", pieces=[pc("rack", "left", label="MAGNETRON")]),
        B("He reaches into his pocket for a snack, and his candy bar has turned into a puddle of goo.",
          "office", "close", "day", "whimsical", [C("per", expr="confused", holding="chocolate")], envVariant="retro"),
        B("His coworker just laughs. \"You probably sat on it.\"",
          "office", "two_shot", "day", "whimsical", [C("mate", "stand", "laugh", talk=True), C("per", "stand", "skeptical")], envVariant="retro", focus="mate"),
        B("But he doesn't buy it. He sends out for a bag of popcorn kernels and holds them up to the machine.",
          "office", "medium", "day", "curious", [C("per", "stand", "squint", "popcorn")], envVariant="retro", pieces=[pc("rack", "left", label="MAGNETRON")]),
        B("Pop. Pop. Pop. Popcorn starts flying all over the lab.",
          "office", "medium", "day", "upbeat", [C("per", "cheer", "starry")], envVariant="retro", fx=[fx("confetti", "flying", "per")], impactWord="Popcorn"),
        B("The next morning he tries a raw egg, his coworker leans in for a closer look, and the egg explodes right in his face.",
          "office", "two_shot", "day", "tense", [C("per", "stand", "proud", "egg"), C("mate", "panic", "shock")], envVariant="retro", focus="mate",
          fx=[fx("burst", "explodes", "mate")], impactWord="explodes"),
        B("You see, the magnetron fires invisible waves that make the water inside food wiggle billions of times a second, and all that wiggling turns into heat.",
          "office", "medium", "day", "curious", [C("per", "point", "smug")], envVariant="retro", pieces=[pc("board", "left", label="WATER WIGGLES|= HEAT")]),
        B("Two years later, his company sells the first microwave oven, taller than a man and as heavy as a grand piano.",
          "warehouse", "wide", "day", "upbeat", [C("per", "stand", "proud")], pieces=[pc("vending", "left", label="FIRST|MICROWAVE")], camMove="crane_up"),
        B("Now one sits in almost every kitchen, which is why your leftovers owe everything to a candy bar that melted in",
          "kitchen", "medium", "day", "warm", [C("per", "stand", "wink", "popcorn")], pieces=[pc("microwave", "left")]),
    ])
CLAIMS["plan_35_microwave"] = [
    ("Percy Spencer, a Raytheon engineer working on magnetrons for radar, noticed a candy bar melt in his pocket (1945).", "verified"),
    ("He then popped popcorn kernels; a coworker's exploding-egg story is widely told.", "uncertain"),
    ("Microwaves (2.45 GHz) make water molecules flip billions of times a second; the motion becomes heat.", "verified"),
    ("The 1947 Radarange was about 1.8 m tall and ~340 kg (grand pianos weigh ~270-500 kg).", "verified"),
    ("Coworker's line is invented.", "fiction"),
]

# ---------------------------------------------------------------- 36  Bubble wrap
PLANS["plan_36_bubble_wrap"] = dict(
    title="Bubble Wrap Was Supposed to Be Wallpaper", environment="apartment", seed=361,
    cast=[{"id": "al", "name": "Inventor", "role": "retroeng"}, {"id": "marc", "name": "Partner", "role": "officeguy"},
          {"id": "cust", "name": "Customer", "role": "woman"}, {"id": "boss", "name": "Computer boss", "role": "boss"}],
    beats=[
        B("He glued two shower curtains together and tried to sell them as wallpaper.",
          "apartment", "medium", "day", "whimsical", [C("al", "point", "proud")], envVariant="retro", pieces=[pc("bubblewrap", "left")]),
        B("It's 1957, and two engineers are sure the future of home decor is plastic covered in tiny bubbles of air.",
          "apartment", "two_shot", "day", "upbeat", [C("al", "stand", "starry"), C("marc", "stand", "proud")], envVariant="retro",
          pieces=[pc("bubblewrap", "behind", label="MODERN WALLPAPER")]),
        B("They cover a whole living room, step back, and wait for the world to fall in love.",
          "apartment", "wide", "day", "warm", [C("al", "hips", "smug"), C("marc", "hips", "proud")], envVariant="retro", pieces=[pc("bubblewrap", "behind")]),
        B("Nobody buys it. \"Why would I want my walls to look like a pool float?\"",
          "apartment", "close", "day", "whimsical", [C("cust", "hips", "angry", talk=True)], envVariant="retro"),
        B("So they try again as insulation for greenhouses, and that flops too.",
          "suburb", "medium", "day", "tense", [C("al", "shrug", "sad")], pieces=[pc("plantpot", "left"), pc("plantpot", "right")]),
        B("Two failures, a warehouse full of bubbles, and not a single buyer.",
          "warehouse", "wide", "night", "tense", [C("al", "sit", "cry")], pieces=[pc("boxes", "left"), pc("boxes", "right")], hud="panel", hudText="ROLLS SOLD|0"),
        B("Then a computer company launches a giant new machine and has to ship it across the country without breaking a single part.",
          "office", "medium", "day", "curious", [C("boss", "point", "sweat")], pieces=[pc("rack", "left", label="NEW COMPUTER")]),
        B("The bubble guys wrap it up, the truck hits every pothole on the highway, and it arrives without a scratch.",
          "street", "wide", "day", "upbeat", [C("al", "cheer", "laugh")], pieces=[pc("truck", "left")], fx=[fx("dust", "pothole", None)]),
        B("You see, every bubble is a tiny cushion of trapped air. Squeeze it, and the air pushes back, soaking up the bump before it reaches what's inside.",
          "office", "medium", "day", "curious", [C("al", "point", "smug")], pieces=[pc("board", "left", label="TRAPPED AIR|= CUSHION")]),
        B("Today they make enough every year to wrap around the Earth, and somewhere a kid is still popping the wallpaper that nobody wanted in",
          "apartment", "medium", "day", "warm", [C("al", "cheer", "starry")], envVariant="retro", pieces=[pc("bubblewrap", "left")]),
    ])
CLAIMS["plan_36_bubble_wrap"] = [
    ("Alfred Fielding and Marc Chavannes sealed two shower curtains together (1957) and first pitched it as textured wallpaper.", "verified"),
    ("It then failed as greenhouse insulation; Sealed Air (1960) found its use packaging IBM's 1401 computer.", "verified"),
    ("'Enough to wrap around the Earth every year' is a commonly repeated industry figure.", "uncertain"),
    ("The customer's line and the pothole drive are invented.", "fiction"),
]

# ---------------------------------------------------------------- 37  The pinball ban
PLANS["plan_37_pinball"] = dict(
    title="The Shot That Made Pinball Legal", environment="office", seed=371,
    cast=[{"id": "rog", "name": "Writer", "role": "streamer", "palette": "#3a4566"}, {"id": "may", "name": "Mayor", "role": "boss"},
          {"id": "off", "name": "Official", "role": "officeguy"}],
    beats=[
        B("He called his shot in front of the city council, and won back the right to play pinball.",
          "office", "medium", "day", "tense", [C("rog", "point", "smug")], pieces=[pc("pinball", "left")], impactWord="shot"),
        B("It's 1976, and pinball has been illegal in New York City for over thirty years.",
          "shops", "wide", "night", "tense", [C("rog", "stand", "sad")], hud="panel", hudText="PINBALL|BANNED SINCE 1942"),
        B("Back in the forties, the mayor called it gambling and smashed the machines with a sledgehammer for the newspapers.",
          "street", "medium", "day", "tense", [C("may", "stand", "angry", "hammer")], pieces=[pc("pinball", "left", shake=1.5)],
          fx=[fx("burst", "smashed", "may")], impactWord="smashed", transition="flash"),
        B("You see, under the law, a game of luck counts as gambling, but a game of skill is just fun.",
          "office", "medium", "day", "curious", [C("rog", "point", "proud")], pieces=[pc("board", "left", label="LUCK = BANNED|SKILL = LEGAL")]),
        B("Now one writer has to prove it's skill to a room full of grumpy officials.",
          "office", "two_shot", "day", "tense", [C("off", "hips", "skeptical"), C("rog", "stand", "sweat")], focus="off"),
        B("\"It's pure chance, son. You just pull and pray.\"",
          "office", "close", "day", "whimsical", [C("off", "stand", "smug", talk=True)]),
        B("So he pulls the plunger, points at the middle lane, and says, \"It's going right there.\"",
          "office", "medium", "day", "tense", [C("rog", "point", "smug", talk=True)], pieces=[pc("pinball", "left")]),
        B("The room goes quiet. The ball bounces off two bumpers, rolls up the ramp, and drops straight into the middle lane.",
          "office", "insert", "day", "tense", [C("rog", expr="shock")], pieces=[pc("pinball", "on")], fx=[fx("sparkle", "drops", None)]),
        B("The officials vote, and the ban is lifted that same year.",
          "office", "wide", "day", "upbeat", [C("rog", "cheer", "starry"), C("off", "shrug", "sad")], hud="panel", hudText="PINBALL BAN|LIFTED"),
        B("Years later, he admitted that shot was mostly luck, which means pinball was made legal by the one shot that proved it was",
          "gameroom", "medium", "night", "warm", [C("rog", "stand", "wink")], pieces=[pc("pinball", "left")]),
    ])
CLAIMS["plan_37_pinball"] = [
    ("New York City banned pinball in 1942; Mayor La Guardia smashed machines with a sledgehammer for the press.", "verified"),
    ("In 1976 writer Roger Sharpe called his shot at a City Council hearing; the ban was lifted that year.", "verified"),
    ("Sharpe has said the shot involved luck.", "uncertain"),
    ("The official's quoted line is invented.", "fiction"),
]

# ---------------------------------------------------------------- 38  The Slinky
PLANS["plan_38_slinky"] = dict(
    title="The Spring That Walked Off a Shelf", environment="cabin", seed=381,
    cast=[{"id": "ric", "name": "Engineer", "role": "retroeng"}, {"id": "bet", "name": "Wife", "role": "wife"}],
    beats=[
        B("He knocked a spring off a shelf, and it walked across the floor by itself.",
          "cabin", "medium", "day", "whimsical", [C("ric", "stand", "shock")], pieces=[pc("spring", "on", move="right")], impactWord="walked"),
        B("It's 1943, and he's a navy engineer trying to build a spring that keeps a ship's meters steady in rough seas.",
          "cabin", "wide", "day", "curious", [C("ric", "point", "proud")], pieces=[pc("rack", "left", label="SHIP METERS")]),
        B("One of his test springs tumbles off the shelf, and instead of crashing, it flips end over end, coil by coil.",
          "cabin", "insert", "day", "whimsical", [C("ric", expr="starry")], pieces=[pc("spring", "on", move="right")]),
        B("He rushes home. \"Honey, I think this could be a toy.\"",
          "apartment", "two_shot", "night", "warm", [C("ric", "stand", "starry", "spring", talk=True), C("bet", "stand", "skeptical")], envVariant="retro", focus="ric"),
        B("She flips through the dictionary for two days and finds the perfect name.",
          "apartment", "medium", "night", "curious", [C("bet", "sitchair", "squint", "book")], envVariant="retro", pieces=[pc("board", "right", label="SLINKY")]),
        B("Two years later, they set up a little ramp in a department store just before Christmas, and nobody is buying.",
          "shops", "medium", "day", "tense", [C("ric", "stand", "sad")], envVariant="open", pieces=[pc("signs", "left", label="SLINKY $1")]),
        B("So he does the demo himself. One spring walks down the ramp, and a crowd gathers around him.",
          "shops", "wide", "day", "upbeat", [C("ric", "point", "proud")], envVariant="open", crowd=True, extras=4, pieces=[pc("spring", "on", move="right")]),
        B("Four hundred Slinkys sell out in ninety minutes.",
          "shops", "medium", "day", "upbeat", [C("ric", "cheer", "laugh"), C("bet", "cheer", "starry")], envVariant="open", hud="panel", hudText="SOLD OUT|400 IN 90 MINUTES"),
        B("You see, each coil passes its weight to the next one like a wave, so the spring keeps flipping over itself as long as there's somewhere lower to go.",
          "office", "medium", "day", "curious", [C("ric", "point", "smug")], envVariant="retro", pieces=[pc("board", "left", label="WEIGHT -> NEXT COIL")]),
        B("Since then, hundreds of millions have been sold, all because one clumsy spring couldn't stay on",
          "apartment", "medium", "day", "warm", [C("ric", "stand", "wink", "spring")], envVariant="retro"),
    ])
CLAIMS["plan_38_slinky"] = [
    ("Naval engineer Richard James (Philadelphia, 1943) saw a tension spring for ship instruments 'walk' after falling.", "verified"),
    ("Betty James found the name 'Slinky' in a dictionary after two days.", "verified"),
    ("At Gimbels in Philadelphia (Nov 1945) 400 Slinkys sold in 90 minutes after a demo.", "verified"),
    ("Hundreds of millions sold since (figures vary, 300M+).", "uncertain"),
    ("Dialogue is invented.", "fiction"),
]

# ---------------------------------------------------------------- 39  Sticky notes
PLANS["plan_39_sticky_notes"] = dict(
    title="The Glue That Was Too Weak", environment="office", seed=391,
    cast=[{"id": "spen", "name": "Chemist", "role": "retroeng"}, {"id": "art", "name": "Coworker", "role": "officeguy", "palette": "#2a9d8f"},
          {"id": "boss", "name": "Boss", "role": "boss"}],
    beats=[
        B("He made a glue so weak it couldn't hold anything, and his company filed it away as a failure.",
          "office", "medium", "day", "whimsical", [C("spen", "shrug", "sad", "note")], impactWord="failure"),
        B("It's 1968, and he's a chemist trying to invent a super strong adhesive for building airplanes.",
          "office", "wide", "day", "curious", [C("spen", "point", "proud")], envVariant="retro", pieces=[pc("board", "left", label="SUPER STRONG GLUE")]),
        B("Instead, he gets tiny sticky spheres that peel off anything without leaving a mark.",
          "office", "close", "day", "curious", [C("spen", expr="confused", holding="note")], envVariant="retro"),
        B("For years he shows it to anyone who'll listen. \"Great, but what's it for?\"",
          "office", "two_shot", "day", "whimsical", [C("boss", "hips", "skeptical", talk=True), C("spen", "stand", "sweat")], focus="boss"),
        B("Then a coworker who sings in his church choir has a problem: the paper bookmarks keep falling out of his hymn book.",
          "banquet", "medium", "day", "tense", [C("art", "stand", "angry", "book")]),
        B("So one Sunday he dabs a little of the weak glue on his bookmarks, and they stay put, then peel right off without tearing a page.",
          "banquet", "close", "day", "upbeat", [C("art", expr="starry", holding="note")], impactWord="peel"),
        B("He starts sticking notes on reports for his boss, and the boss writes back on the same little yellow squares.",
          "office", "two_shot", "day", "warm", [C("art", "stand", "smug", "note"), C("boss", "stand", "proud", "note")], focus="art"),
        B("The first test launch flops, so they hand out free samples in one city, and nine out of ten people order more.",
          "shops", "medium", "day", "upbeat", [C("art", "cheer", "laugh")], envVariant="open", hud="bar", hudText="ORDERED AGAIN|0|90|%"),
        B("You see, the glue is made of microscopic spheres that only touch the paper at a few points, so it grips just enough to hold and lets go without a fight.",
          "office", "medium", "day", "curious", [C("spen", "point", "smug")], envVariant="retro", pieces=[pc("board", "left", label="TINY SPHERES|= GENTLE GRIP")]),
        B("Today billions of sticky notes are sold every year, all thanks to a glue that was too weak to",
          "office", "medium", "day", "warm", [C("spen", "cheer", "starry", "note")]),
    ])
CLAIMS["plan_39_sticky_notes"] = [
    ("Spencer Silver at 3M (1968) made a low-tack microsphere adhesive while aiming for a strong one for aircraft.", "verified"),
    ("Art Fry (1974) used it for hymnal bookmarks in his church choir; notes on reports to his boss followed.", "verified"),
    ("The 1977 'Press 'n Peel' test flopped; the 1978 Boise sample blitz had ~90 % reorders; launched 1980.", "verified"),
    ("'Billions sold every year' (tens of billions by many estimates).", "uncertain"),
    ("Dialogue is invented.", "fiction"),
]


def main():
    md = ["# Shorts 35–39 (Blender, flow pacing, RicksClips-style structure, our own stories)", "",
          "Voice `am_eric*0.7+am_fenrir*0.3` @1.35, ~60 s. No background crowd unless the story asks (only 38).", ""]
    for name, p in PLANS.items():
        P = Plan.model_validate({**BASE, **p, "verifiedClaims": [{"text": t, "status": s} for t, s in CLAIMS[name]]})
        with open(os.path.join(HERE, name + ".json"), "w", encoding="utf-8") as f:
            json.dump(json.loads(P.model_dump_json(exclude_defaults=True)), f, indent=1, ensure_ascii=False)
        words = sum(len(b.narration.split()) for b in P.beats)
        md += [f"## {P.title}  (`{name}.json`, {len(P.beats)} beats, {words} words)", ""]
        md += [f"{j}. *{b.environment}* — “{b.narration}”" for j, b in enumerate(P.beats, 1)]
        md += ["", "**Datos:**"] + [f"- [{s}] {t}" for t, s in CLAIMS[name]] + [""]
    with open(os.path.join(HERE, "STORIES_35-39.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(md))
    print("ok")


if __name__ == "__main__":
    main()
