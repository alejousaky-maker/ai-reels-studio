"""The six GTA 6 Loophole-Lou shorts (14-19), written with the pro cut: one picture per clause.
Run: python docs/scripts/build_plans_14_19.py  -> plan_14..19 JSON + STORIES_14-19.md (scene blueprints)."""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", ".."))
from engine.story.schema import Plan  # noqa: E402


def C(id, action="stand", expr="neutral", holding=None, react=None, y=None):
    d = {"id": id, "action": action, "expr": expr}
    if holding:
        d["holding"] = holding
    if react:
        d["react"] = {"word": react[0], "expr": react[1]}
    if y:
        d["y"] = y
    return d


def S(at, **kw):
    return {"at": at, **kw}


def B(narration, env, shot="medium", light="day", mood="upbeat", chars=(), **kw):
    return {"narration": narration, "environment": env, "shot": shot, "light": light, "mood": mood, "characters": list(chars), **kw}


def fx(kind, word, on=None, product=None):
    d = {"kind": kind, "word": word}
    if on:
        d["on"] = on
    if product:
        d["product"] = product
    return d


def pc(kind, where="behind", **kw):
    return {"kind": kind, "where": where, **kw}


PLANS = {}

# ---------------------------------------------------------------- 14  The Apocalyptic Delay
PLANS["plan_14_gta6_delay"] = dict(
    title="The Apocalyptic Delay", environment="gameroom", seed=41,
    cast=[{"id": "me", "name": "Streamer", "role": "streamer"}, {"id": "brk", "name": "Broker", "role": "broker"},
          {"id": "me2", "name": "Streamer (sign)", "role": "streamer"}],
    beats=[
        B("If GTA 6 gets delayed one more time, society won't just complain. It will literally collapse in twenty-four hours.",
          "gameroom", "close", "night", "tense", [C("me", expr="grin", holding="controller")], camMove="whip",
          pieces=[pc("monitor", "left", label="GTA 6|RELEASE SOON")], impactWord="collapse",
          shots=[S("delayed", shot="extreme", characters=[C("me", expr="broken")], hud="news", hudText="GTA 6 DELAYED AGAIN"),
                 S("society", environment="suburb", spot=0, shot="wide", light="golden", characters=[], extras=5, extrasRole="streamer", extrasAction="walk", camMove="truck_right"),
                 S("collapse", shot="dutch", environment="gameroom", light="night", characters=[C("me", "panic", "shock")], fx=[fx("burst", "collapse", "me")], camMove="push")]),
        B("It starts with one breaking news banner.", "gameroom", "medium", "night", "tense",
          [C("me", "sit", "neutral", "can")], hud="news", hudText="GTA 6 DELAYED TO 2028", camMove="push",
          pieces=[pc("monitor", "left", label="BREAKING|NEWS")]),
        B("His eyes shatter like glass. His jaw hits the floor.", "gameroom", "extreme", "night", "tense",
          [C("me", expr="broken")], impactWord="floor",
          shots=[S("His", shot="worm", characters=[C("me", "fall", "shock")], camMove="crane_up", fx=[fx("stars", "floor", "me")])]),
        B("Hour two. Millions of gamers stumble outside for the first time in years.", "suburb", "wide", "day", "curious",
          [], extras=7, extrasRole="streamer", extrasAction="walk", text="HOUR 2", textStyle="title", camMove="pull",
          shots=[S("outside", shot="low", extras=5, extrasRole="streamer", camMove="truck_left")]),
        B("The sun burns. They touch grass, and nobody knows what it is.", "suburb", "extreme", "day", "whimsical",
          [C("me", expr="squint")], camMove="push",
          shots=[S("They", shot="low", characters=[C("me", "point", "squint")], extras=3, extrasRole="streamer", camMove="orbit"),
                 S("nobody", shot="close", characters=[C("me", "shrug", "nervous")], fx=[fx("product", "nobody", "me", "question")])]),
        B("Hour six. Wall Street notices nobody is buying anything.", "trading", "wide", "night", "tense",
          [C("brk", expr="nervous")], extras=4, extrasRole="broker", text="HOUR 6", textStyle="title", camMove="truck_right",
          pieces=[pc("ticker", "behind", label="GAMING INDEX ▼ 87%")]),
        B("Brokers loosen their ties. Their eyes start spinning.", "trading", "medium", "night", "tense",
          [C("brk", "panic", "nervous")], extras=2, extrasRole="broker",
          shots=[S("Their", shot="extreme", characters=[C("brk", expr="dazed")], camMove="orbit")]),
        B("Then a giant red arrow smashes straight through the floor.", "trading", "wide", "night", "tense",
          [C("brk", "fall", "shock")], extras=3, extrasRole="broker", impactWord="smashes", camMove="whip",
          pieces=[pc("redarrow", "left", scale=1.2)], fx=[fx("burst", "smashes", "brk")]),
        B("Hour twelve. Traffic stops. Cars are abandoned in the middle of the road.", "street", "wide", "golden", "tense",
          [], text="HOUR 12", textStyle="title", camMove="crane_up",
          pieces=[pc("car", "left"), pc("van", "right", mirror=True)],
          shots=[S("Cars", shot="low", pieces=[pc("car", "front"), pc("car", "behind", mirror=True)], camMove="truck_left")]),
        B("Everyone marches to the game studio with cardboard signs.", "street", "wide", "golden", "upbeat",
          [C("me2", "march", "stern")], extras=6, extrasRole="streamer", extrasAction="march", camMove="follow",
          pieces=[pc("signs", "behind", label="JUST DROP IT|TAKE MY KIDNEY|2028?? NO")]),
        B("Take my kidney, just drop it!", "street", "close", "golden", "upbeat",
          [C("me2", "cheer", "crazy")], impactWord="drop", camMove="push",
          pieces=[pc("signs", "behind", label="TAKE MY KIDNEY|JUST DROP IT|PLEASE")], fx=[fx("burst", "drop", "me2")]),
        B("Hour twenty-four. One man has had enough.", "gameroom", "medium", "night", "warm",
          [C("me", "hips", "stern")], text="HOUR 24", textStyle="title", camMove="push"),
        B("He climbs into a cryo tube that says: wake me in twenty twenty-eight.", "gameroom", "medium", "night", "warm",
          [C("me", expr="smile_closed")], pieces=[pc("cryo", "on", label="WAKE ME IN 2028")], camMove="orbit",
          shots=[S("wake", shot="close", text="WAKE ME IN 2028", textStyle="label", camMove="push")]),
        B("See you in four years, Vice City.", "gameroom", "close", "night", "warm",
          [C("me", expr="sleepy")], pieces=[pc("cryo", "on", label="WAKE ME IN 2028")], camMove="pull",
          fx=[fx("sparkle", "Vice", "me")]),
    ])

# ---------------------------------------------------------------- 15  The Jet Engine PS5
PLANS["plan_15_gta6_jetengine"] = dict(
    title="The Jet Engine Console", environment="gameroom", seed=43,
    cast=[{"id": "me", "name": "Gamer", "role": "capgamer"}, {"id": "wife", "name": "Wife", "role": "wife"},
          {"id": "meg", "name": "Gamer (goggles)", "role": "capgamer", "shades": True}],
    beats=[
        B("Installing GTA 6 on a base PS5 won't just fill your storage. It will turn your console into a jet engine.",
          "gameroom", "medium", "night", "upbeat", [C("me", "sit", "grin", "controller")], camMove="whip",
          pieces=[pc("console", "left", scale=1.4)], impactWord="jet",
          shots=[S("storage", shot="close", characters=[C("me", expr="sweat")], hud="panel", hudText="STORAGE|FULL!"),
                 S("jet", shot="worm", characters=[C("me", "panic", "shock")], pieces=[pc("console", "left", scale=1.4, label="flames", shake=1.5)],
                   fx=[fx("burst", "jet", "me")], camMove="push")]),
        B("First, the warning pops up. Required space: five hundred gigs.", "gameroom", "close", "night", "tense",
          [C("me", expr="nervous", react=("five", "shock"))], hud="panel", hudText="WARNING|REQUIRED SPACE: 500 GB|AVAILABLE: 12 GB!", camMove="push"),
        B("A sweat drop the size of a grape rolls down his head.", "gameroom", "extreme", "night", "whimsical",
          [C("me", expr="sweat")], camMove="push"),
        B("So he starts deleting. Call of Duty, gone. Eight years of saves, gone.", "gameroom", "medium", "night", "tense",
          [C("me", "point", "stern", "controller")], hud="panel", hudText="DELETE?|Call of Duty  ✕", camMove="truck_right",
          fx=[fx("product", "Duty", "me", "folder")],
          shots=[S("gone", shot="close", characters=[C("me", expr="grin")], fx=[fx("puff", "gone", "me")])]),
        B("System files, gone. Wedding photos, gone.", "gameroom", "close", "night", "tense",
          [C("me", "point", "crazy")], hud="panel", hudText="DELETE?|System Files  ✕",
          shots=[S("Wedding", shot="medium", hud="panel", hudText="DELETE?|Wedding Photos  ✕", fx=[fx("product", "Wedding", "me", "camera")])]),
        B("His wife gasps from the doorway.", "gameroom", "extreme", "night", "tense",
          [C("wife", expr="shock")], spot=3, camMove="whip", impactWord="gasps"),
        B("Then the install finally begins, and the console starts to shake like a washing machine.", "gameroom", "close", "night", "tense",
          [C("me", "sit", "nervous")], hud="bar", hudText="INSTALLING GTA 6|1|45",
          pieces=[pc("console", "left", scale=1.4, shake=0.8)],
          shots=[S("console", shot="insert", pieces=[pc("console", "on", scale=1.0, shake=1.2)], camMove="push")]),
        B("The side plates glow orange. The fans spin like turbines.", "gameroom", "insert", "night", "tense",
          [C("me", expr="shock")], pieces=[pc("console", "on", label="hot", shake=1.6)], camMove="orbit",
          fx=[fx("steam", "glow", "me")],
          shots=[S("fans", shot="worm", pieces=[pc("console", "left", scale=1.4, label="hot", shake=2.0)], fx=[fx("burst", "turbines", "me")])]),
        B("Pizza boxes fly across the room. The curtains are flapping. The cat is gone.", "gameroom", "wide", "night", "whimsical",
          [C("me", "panic", "shock")], pieces=[pc("snacks", "left", move="right"), pc("console", "right", label="hot", shake=2.0)], camMove="truck_left",
          fx=[fx("puff", "fly", "me")]),
        B("Ninety-nine percent installed.", "gameroom", "extreme", "night", "tense",
          [C("me", expr="starry")], hud="bar", hudText="INSTALLING GTA 6|96|99", camMove="push"),
        B("And then, liftoff!", "gameroom", "worm", "night", "upbeat",
          [C("me", "panic", "shock")], pieces=[pc("console", "left", scale=1.4, label="flames", lift=4.0, shake=1.0)],
          impactWord="liftoff", camMove="crane_up", fx=[fx("burst", "liftoff", "me")]),
        B("The console blasts straight through the ceiling and rockets into the night sky.", "suburb", "wide", "night", "upbeat",
          [], envVariant="tvglow", spot=0, pieces=[pc("console", "behind", scale=2.0, label="flames", y=1, lift=8)], camMove="crane_up"),
        B("And he is still hanging from the HDMI cable, wearing aviator goggles.", "suburb", "medium", "night", "upbeat",
          [C("meg", "cheer", "laugh", y=2.2)], envVariant="tvglow", spot=0,
          pieces=[pc("console", "on", scale=1.6, label="flames", y=4.4)], camMove="crane_up"),
        B("Totally worth it. Now, the day one patch: one hundred and fifty gigs.", "suburb", "close", "night", "warm",
          [C("meg", "cheer", "starry", y=2.2)], envVariant="tvglow", spot=0, camMove="orbit", fx=[fx("sparkle", "worth", "meg")],
          shots=[S("Now", environment="gameroom", envVariant=None, shot="extreme", spot=0, characters=[C("me", expr="sweat")], hud="panel", hudText="DAY 1 PATCH|150 GB", camMove="push")]),
    ])

# ---------------------------------------------------------------- 16  The Vice City Flu
PLANS["plan_16_gta6_flu"] = dict(
    title="The Vice City Flu", environment="bedroom", seed=47,
    cast=[{"id": "me", "name": "Employee", "role": "bathrobe"}, {"id": "boss", "name": "Boss", "role": "boss"},
          {"id": "doc", "name": "Doctor", "role": "doctor"}],
    beats=[
        B("The day GTA 6 drops, forty million men will mysteriously catch the exact same fake illness at eight AM.",
          "bedroom", "medium", "day", "whimsical", [C("me", expr="smile", holding="thermometer")], envVariant="day", camMove="whip",
          pieces=[pc("tv", "right", label="~game|LOADING...")],
          shots=[S("forty", environment="suburb", shot="wide", characters=[], extras=7, extrasRole="bathrobe", text="40,000,000", textStyle="title", camMove="pull"),
                 S("fake", environment="bedroom", envVariant="day", shot="close", characters=[C("me", expr="pained", holding="thermometer")]),
                 S("eight", shot="extreme", characters=[C("me", expr="smile_closed")], hud="panel", hudText="8:00 AM|CALL IN SICK", camMove="push")]),
        B("He holds the thermometer over a steaming cup of coffee. One hundred and three degrees.", "bedroom", "insert", "day", "whimsical",
          [C("me", expr="smile", holding="thermometer")], envVariant="day", fx=[fx("steam", "coffee", "me")], camMove="push"),
        B("Then the weakest cough in human history.", "bedroom", "close", "day", "whimsical",
          [C("me", expr="pained", holding="phone")], envVariant="day", fx=[fx("puff", "cough", "me")], impactWord="cough"),
        B("Boss, I think I'm dying.", "bedroom", "extreme", "day", "whimsical",
          [C("me", expr="nervous", holding="phone")], envVariant="day", hud="phone", hudText="Calling BOSS...", camMove="push"),
        B("Meanwhile, at nine o'clock, the office is a ghost town.", "office", "wide", "day", "curious",
          [C("boss", expr="stern")], text="9:00 AM", textStyle="title", camMove="truck_right", spot=3,
          pieces=[pc("desk", "left"), pc("desk", "right", mirror=True)], extras=0),
        B("Fifty empty desks. Twenty phones ringing at once.", "office", "medium", "day", "tense",
          [C("boss", "panic", "shock")], pieces=[pc("desk", "left", label="ring"), pc("desk", "right", label="ring", mirror=True)],
          fx=[fx("product", "phones", "boss", "phone")], camMove="orbit",
          shots=[S("Twenty", shot="low", pieces=[pc("desk", "front", label="ring"), pc("desk", "left", label="ring")], camMove="truck_left")]),
        B("The boss picks up.", "office", "close", "day", "tense", [C("boss", expr="stern", holding="phone")], camMove="push"),
        B("I'm in bed with a fever, says the employee, controller in hand.", "gameroom", "medium", "night", "whimsical",
          [C("me", "sit", "smile_closed", "controller")], camMove="pull",
          shots=[S("says", shot="close", characters=[C("me", expr="grin", holding="controller")])]),
        B("But behind him, police lights flash across the walls,", "gameroom", "medium", "night", "tense",
          [C("me", expr="crazy", holding="controller")], hud="police", camMove="orbit"),
        B("and a helicopter roars through his headset.", "office", "extreme", "day", "tense",
          [C("boss", expr="broken", holding="phone")], impactWord="helicopter", fx=[fx("burst", "helicopter", "boss")], camMove="whip"),
        B("So the boss storms across town into the clinic for a real doctor's note.", "clinic", "medium", "day", "tense",
          [C("boss", "run", "stern")], camMove="follow"),
        B("The doctor has his feet up, playing GTA 6 on a portable screen.", "clinic", "medium", "day", "whimsical",
          [C("doc", "sit", "grin", "tablet")], camMove="push",
          shots=[S("playing", shot="close", characters=[C("doc", "sit", "starry", "tablet")])]),
        B("Without looking up, he hands over a pre-signed sick note.", "clinic", "two_shot", "day", "whimsical",
          [C("doc", "sit", "smile_closed", "sicknote"), C("boss", expr="broken")], focus="doc",
          fx=[fx("product", "note", "doc", "sicknote")], impactWord="pre-signed"),
        B("Get well soon. Next! The waiting room is full of men in bathrobes.", "clinic", "extreme", "day", "warm", [C("boss", expr="dazed")], camMove="pull",
          fx=[fx("stars", "well", "boss")],
          shots=[S("waiting", shot="wide", characters=[C("doc", "sit", "grin", "tablet")], extras=6, extrasRole="bathrobe", camMove="truck_right")]),
    ])

# ---------------------------------------------------------------- 17  The $150 Price Tag
PLANS["plan_17_gta6_price"] = dict(
    title="The 150 Dollar Price Tag", environment="apartment", seed=53,
    cast=[{"id": "me", "name": "Broke gamer", "role": "brokeguy"}],
    beats=[
        B("Rumors say GTA 6 might cost a hundred and fifty dollars, and gamers are already selling their furniture just to pre-order the base edition.",
          "apartment", "close", "day", "upbeat", [C("me", expr="shock")], hud="panel",
          hudText="GTA 6|STANDARD: $150|COLLECTOR'S: $500!", camMove="whip",
          shots=[S("selling", environment="suburb", shot="wide", characters=[C("me", "point", "grin")], hud=None,
                   pieces=[pc("sofa", "left", label="SOLD"), pc("fridge", "right", label="SOLD")], extras=3, extrasRole="villager_man", camMove="truck_right"),
                 S("pre-order", shot="extreme", characters=[C("me", expr="starry")], camMove="push")]),
        B("He checks his pockets. Both of them.", "apartment", "medium", "day", "whimsical", [C("me", "shrug", "nervous")], camMove="push"),
        B("Only a moth flies out.", "apartment", "extreme", "day", "whimsical",
          [C("me", expr="broken")], fx=[fx("product", "moth", "me", "moth")], impactWord="moth"),
        B("So he drags everything he owns onto the front lawn for a yard sale.", "suburb", "medium", "day", "upbeat",
          [C("me", "walk", "stern")], pieces=[pc("sofa", "left")], camMove="follow"),
        B("Sofa, sold. Fridge, sold. Bed, sold.", "suburb", "medium", "day", "upbeat",
          [C("me", "point", "grin")], pieces=[pc("sofa", "left", label="SOLD")], camMove="whip",
          shots=[S("Fridge", pieces=[pc("fridge", "left", label="SOLD")], characters=[C("me", "hips", "grin")], camMove="whip"),
                 S("Bed", pieces=[pc("bed", "left", label="SOLD")], characters=[C("me", "cheer", "laugh", "cash")], camMove="whip")]),
        B("Even the dog house. Sold.", "suburb", "close", "day", "whimsical",
          [C("me", "point", "crazy", "cash")], pieces=[pc("doghouse", "left", label="SOLD")], impactWord="Sold", camMove="push"),
        B("Neighbors walk away with his whole life, piece by piece, for cash.", "suburb", "wide", "golden", "warm",
          [C("me", expr="smile")], extras=5, extrasRole="villager_man", extrasAction="walk", camMove="pull",
          pieces=[pc("sofa", "far", move="right")]),
        B("Then he trades his car keys for a single gift card.", "suburb", "medium", "golden", "upbeat",
          [C("me", expr="grin", holding="key")], pieces=[pc("car", "left")], fx=[fx("product", "gift", "me", "card")], camMove="orbit",
          shots=[S("gift", shot="close", characters=[C("me", expr="starry", holding="card")])]),
        B("He walks back inside in his socks and headphones, smiling like a millionaire.", "suburb", "medium", "golden", "warm",
          [C("me", "walk", "smile_closed")], camMove="follow"),
        B("Rent is due tomorrow. He does not care.", "apartment", "close", "night", "whimsical",
          [C("me", expr="smile_closed")], envVariant="empty", hud="phone", hudText="RENT DUE TOMORROW", camMove="push"),
        B("The apartment is now completely empty.", "apartment", "wide", "night", "curious",
          [C("me", expr="neutral")], envVariant="empty", camMove="pull"),
        B("Bare brick. One light bulb. No furniture.", "apartment", "high", "night", "curious",
          [C("me", expr="neutral")], envVariant="empty", camMove="orbit",
          shots=[S("One", shot="worm", camMove="crane_up"), S("No", shot="wide", camMove="truck_left")]),
        B("He sits on a cardboard box, eating cold instant noodles,", "apartment", "medium", "night", "warm",
          [C("me", "sit", "smile_closed", "noodles")], envVariant="empty", pieces=[pc("cardbox", "on")], camMove="push"),
        B("in front of an eighty-five inch TV running GTA 6.", "apartment", "wide", "night", "upbeat",
          [C("me", "sit", "starry", "noodles")], envVariant="empty", pieces=[pc("tv", "left", scale=1.6, label="~game")], camMove="truck_right"),
        B("Happiest man alive. No couch, no bed, no regrets.", "apartment", "extreme", "night", "warm",
          [C("me", expr="starry")], envVariant="empty", fx=[fx("sparkle", "Happiest", "me")], camMove="push"),
    ])

# ---------------------------------------------------------------- 18  The Generational Pre-Order
PLANS["plan_18_gta6_generations"] = dict(
    title="The Generational Pre-Order", environment="bedroom", seed=59,
    cast=[{"id": "teen", "name": "Me at 16", "role": "teen"}, {"id": "uni", "name": "Me at 20", "role": "streamer", "palette": "#3f6fb5"},
          {"id": "job", "name": "Me at 30", "role": "officeguy", "hair": "#3a2a1e"}, {"id": "wife", "name": "Wife", "role": "wife"}, {"id": "old", "name": "Me at 70", "role": "oldgamer"},
          {"id": "son", "name": "Son", "role": "graduate"}, {"id": "kid", "name": "Grandson", "role": "kid"}],
    beats=[
        B("I pre-ordered GTA 6 as a teenager, and by the time it finally loaded, my son was graduating college.",
          "bedroom", "medium", "day", "upbeat", [C("teen", "jump", "starry")], envVariant="day", hud="panel",
          hudText="PRE-ORDER CONFIRMED|GTA 6", camMove="whip",
          shots=[S("by", shot="extreme", hud=None, characters=[C("old", expr="sleepy")], camMove="push"),
                 S("son", shot="medium", characters=[C("son", "cheer", "laugh", "diploma")], fx=[fx("sparkle", "graduating", "son")], camMove="orbit")]),
        B("Twenty thirteen. I clicked pre-order and bounced in my chair for an hour.", "bedroom", "medium", "day", "upbeat",
          [C("teen", "jump", "starry")], envVariant="day", text="2013", textStyle="title",
          pieces=[pc("calendar", "right", label="2013")], camMove="push"),
        B("Then the calendar pages started flying.", "bedroom", "close", "day", "curious",
          [C("teen", expr="shock")], envVariant="day", pieces=[pc("calendar", "right", label="2016")], camMove="whip"),
        B("College. Exams, parties, heartbreak. Still waiting.", "bedroom", "medium", "day", "curious",
          [C("uni", "sit", "sleepy")], envVariant="day", text="2018", textStyle="title", pieces=[pc("calendar", "right", label="2018")]),
        B("First job. A suit, a tie, a beard. Still waiting.", "bedroom", "medium", "golden", "curious",
          [C("job", "hips", "neutral")], text="2024", textStyle="title", pieces=[pc("calendar", "right", label="2024")], camMove="orbit"),
        B("And the TV never changed. Trailer two, coming soon.", "bedroom", "medium", "golden", "tense",
          [C("job", expr="sleepy")], pieces=[pc("tv", "left", label="TRAILER 2|COMING SOON")], camMove="truck_left",
          shots=[S("Trailer", shot="insert", pieces=[pc("tv", "behind", scale=1.4, label="TRAILER 2|COMING SOON")], camMove="push")]),
        B("I got married. We had a kid. My hair turned gray.", "bedroom", "two_shot", "golden", "warm",
          [C("job", expr="smile_closed"), C("wife", expr="smile")], focus="job", camMove="orbit",
          shots=[S("We", shot="medium", characters=[C("kid", "jump", "laugh")], camMove="push"),
                 S("My", shot="extreme", characters=[C("old", expr="sleepy")], camMove="push")]),
        B("Now I have a wizard beard and reading glasses.", "bedroom", "close", "night", "warm",
          [C("old", expr="neutral")], text="2061", textStyle="title", pieces=[pc("calendar", "right", label="2061")], camMove="push"),
        B("My son walks in with his diploma.", "bedroom", "medium", "night", "warm",
          [C("son", "walk", "smile_closed", "diploma")], camMove="follow"),
        B("Dad, is it out yet? Asking for my whole generation.", "bedroom", "close", "night", "warm", [C("son", expr="smile")], camMove="push"),
        B("Not yet, son. Not yet. Go get a job.", "bedroom", "extreme", "night", "warm", [C("old", expr="nervous")], camMove="pull"),
        B("Years later, lying in a hospital bed, the heart monitor beeping slowly,", "clinic", "medium", "day", "warm",
          [C("old", "sit", "sleepy")], envVariant="ward", pieces=[pc("hospitalbed", "on", scale=0.6), pc("heartmonitor", "right")], camMove="push"),
        B("I pass my dusty, cobweb-covered controller to my grandson.", "clinic", "two_shot", "day", "warm",
          [C("old", "sit", "smile_closed", "controller"), C("kid", expr="smile")], envVariant="ward", focus="old",
          pieces=[pc("hospitalbed", "on", scale=0.6)], fx=[fx("product", "controller", "old", "controller")], camMove="orbit"),
        B("And right then, the TV dings. GTA 6, ready to start. Finally.", "clinic", "medium", "day", "upbeat",
          [C("kid", "jump", "starry", "controller")], envVariant="ward", pieces=[pc("tv", "left", label="~game|READY TO START")],
          impactWord="dings", camMove="whip",
          shots=[S("GTA", shot="extreme", characters=[C("old", expr="relief")], fx=[fx("sparkle", "ready", "old")], camMove="push")]),
    ])

# ---------------------------------------------------------------- 19  The Global Internet Blackout
PLANS["plan_19_gta6_blackout"] = dict(
    title="The Global Internet Blackout", environment="gameroom", seed=61,
    cast=[{"id": "me", "name": "Esports gamer", "role": "esports"}, {"id": "tech", "name": "Technician", "role": "technician"}],
    beats=[
        B("The second GTA 6 unlocks at midnight, a hundred million downloads will literally melt the global internet.",
          "gameroom", "close", "night", "tense", [C("me", expr="sweat")], hud="panel", hudText="11:59:59 PM", camMove="whip",
          shots=[S("hundred", environment="datacenter", envVariant="red", shot="wide", characters=[], hud=None, text="100,000,000", textStyle="title", camMove="truck_right"),
                 S("melt", environment="datacenter", envVariant="red", shot="low", characters=[C("tech", "panic", "shock", "extinguisher")], hud=None,
                   fx=[fx("burst", "melt", "tech")], camMove="push")]),
        B("Eleven fifty-nine and fifty-nine seconds. His heart is louder than his fans.", "gameroom", "extreme", "night", "tense",
          [C("me", expr="sweat")], hud="panel", hudText="11:59:59 PM", camMove="push"),
        B("His trembling finger hovers over the download button, sweat pouring down his face.", "gameroom", "medium", "night", "tense",
          [C("me", "point", "nervous")], pieces=[pc("monitor", "left", label="[ DOWNLOAD ]")], camMove="orbit"),
        B("Midnight. Click.", "gameroom", "extreme", "night", "upbeat",
          [C("me", expr="starry")], impactWord="Click", fx=[fx("burst", "Click", "me")], camMove="whip"),
        B("Across the world, data centers start glowing red like toasters.", "datacenter", "wide", "night", "tense",
          [], envVariant="red", camMove="truck_left", pieces=[pc("rack", "left", label="red"), pc("rack", "right", label="red")]),
        B("Lightning shoots out of the servers.", "datacenter", "worm", "night", "tense",
          [C("tech", expr="shock")], envVariant="red", pieces=[pc("rack", "left", label="red", shake=1.0), pc("rack", "right", label="red", shake=1.0)],
          fx=[fx("burst", "Lightning", "tech")], impactWord="Lightning", camMove="crane_up"),
        B("Technicians in hard hats run around with fire extinguishers.", "datacenter", "medium", "night", "tense",
          [C("tech", "run", "shock", "extinguisher")], envVariant="red", extras=3, extrasRole="technician", extrasAction="march", camMove="follow"),
        B("Gauges explode, one by one.", "datacenter", "close", "night", "tense",
          [C("tech", expr="broken")], envVariant="red", fx=[fx("burst", "explode", "tech"), fx("puff", "one", "tech")], impactWord="explode", camMove="whip"),
        B("Back in the bedroom, the download bar crawls to ninety-nine point nine percent.", "gameroom", "medium", "night", "upbeat",
          [C("me", "sit", "starry")], hud="bar", hudText="DOWNLOADING GTA 6|98|99.9", camMove="push"),
        B("One second remaining.", "gameroom", "extreme", "night", "tense",
          [C("me", expr="sweat")], hud="bar", hudText="1 SECOND REMAINING|99.9|99.9", camMove="push"),
        B("Then the router on the desk bursts into a cloud of black smoke.", "gameroom", "insert", "night", "tense",
          [C("me", expr="shock", holding="router")], fx=[fx("puff", "bursts", "me"), fx("burst", "smoke", "me")], impactWord="bursts"),
        B("No internet. Not on his street, not in his city, not anywhere.", "gameroom", "medium", "night", "tense",
          [C("me", expr="broken")], pieces=[pc("tv", "left", label="~nointernet")], camMove="push",
          shots=[S("Not", shot="extreme", camMove="push"), S("anywhere", environment="street", shot="high", characters=[], extras=4, extrasRole="streamer", camMove="crane_up")]),
        B("Total blackout. Millions of gamers flood the streets in their headsets.", "street", "wide", "night", "tense",
          [C("me", "run", "crazy")], extras=6, extrasRole="streamer", extrasAction="march", camMove="crane_up"),
        B("They climb telephone poles and plug ethernet cables into potatoes and car batteries.", "street", "medium", "night", "whimsical",
          [C("me", "point", "crazy", "potato", y=2.4)], pieces=[pc("pole", "on", scale=0.8, dz=0.7)], camMove="crane_up",
          fx=[fx("product", "potatoes", "me", "potato")],
          shots=[S("car", shot="close", characters=[C("me", "point", "grin", "battery", y=2.4)], pieces=[pc("pole", "on", scale=0.8, dz=0.7)], fx=[fx("product", "batteries", "me", "battery")])]),
        B("Just one more megabyte. Please.", "street", "extreme", "night", "warm",
          [C("me", expr="crazy", y=2.4)], pieces=[pc("pole", "on", scale=0.8, dz=0.7)], hud="bar", hudText="DOWNLOADING|99.9|99.9", camMove="pull"),
    ])


def main():
    md = ["# GTA 6 shorts 14–19 (Loophole Lou style, pro cut)", "",
          "Voice: Kokoro blend `am_eric*0.6+am_fenrir*0.4` at 1.12 (energetic young male, ~3 words/s). Captions on.",
          "Every shot below is one picture; `→` marks a cut inside the sentence on that word.", ""]
    for name, p in PLANS.items():
        plan = {"version": 1, "lang": "en", "style": "storybook", "graphics": "full", "captions": True, **p,
                "verifiedClaims": [{"text": "Comedy fiction about GTA 6 (hypothetical delay / size / price / release-day scenarios); the game, console and studio appear only as generic unbranded props.", "status": "fiction"}]}
        P = Plan.model_validate(plan)
        with open(os.path.join(HERE, name + ".json"), "w", encoding="utf-8") as f:
            json.dump(json.loads(P.model_dump_json(exclude_defaults=True)), f, indent=1, ensure_ascii=False)
        words = sum(len(b.narration.split()) for b in P.beats)
        md += [f"## {P.title}  (`{name}.json`, {len(P.beats)} scenes, {words} words)", ""]
        for i, b in enumerate(P.beats, 1):
            cut = "".join(f" → **{s.at}**: {s.shot or b.shot}" + (f" @ {s.environment}" if s.environment else "") for s in b.shots)
            who = ", ".join(f"{c.id} ({c.action}, {c.expr}{', ' + c.holding if c.holding else ''})" for c in b.characters) or "no cast"
            md.append(f"{i}. *{b.environment} · {b.shot} · {b.light}{' · ' + b.camMove if b.camMove else ''}{' · HUD ' + b.hud if b.hud else ''}* — "
                      f"“{b.narration}” — {who}{cut}")
        md.append("")
    with open(os.path.join(HERE, "STORIES_14-19.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(md))
    print("ok")


if __name__ == "__main__":
    main()
