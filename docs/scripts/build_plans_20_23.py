"""Megaproject documentaries 20-23 (Loophole Lou style, pro cut + film transitions + map scenes).
Voiceover follows the user's prompts; a few figures were corrected to the documented facts (see verifiedClaims).
Run: python docs/scripts/build_plans_20_23.py -> plan_20..23 JSON + STORIES_20-23.md"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", ".."))
sys.path.insert(0, HERE)
from engine.story.schema import Plan  # noqa: E402
from build_plans_14_19 import C, S, B, fx, pc  # noqa: E402

PLANS = {}
OUTRO = lambda line: B(line, "shops", "wide", "night", "warm", [], hud="outro", transition="dissolve")

# ---------------------------------------------------------------- 20  Second Avenue Subway
PLANS["plan_20_subway"] = dict(
    title="The Most Expensive Hole in History", environment="shops", seed=71,
    cast=[{"id": "eng", "name": "Engineer", "role": "engineer"}, {"id": "acc", "name": "Accountant", "role": "accountant"},
          {"id": "pax", "name": "Passenger", "role": "officeguy"}, {"id": "dig", "name": "Digger", "role": "technician"},
          {"id": "old", "name": "1929 commuter", "role": "commuter"}],
    claims=[("Second Avenue Subway first proposed 1929; delayed by the Depression and WWII.", "verified"),
            ("Phase 1 (opened 2017): about $4.45 billion for three new stations, roughly two miles of track.", "verified"),
            ("'A million dollars per step', 'a car for every daily rider' are rounded comic comparisons.", "fiction")],
    beats=[
        B("If you want to build a subway that costs four and a half billion dollars for just three stations, you don't build transit. You build a gold mine.",
          "shops", "medium", "day", "upbeat", [C("eng", expr="smile", holding="coffee")], camMove="push", envVariant="open",
          shots=[S("four", shot="close", characters=[C("eng", expr="shock", holding="coffee")], text="$4,500,000,000", textStyle="title"),
                 S("you", shot="worm", characters=[C("eng", "panic", "shock")], fx=[fx("product", "transit", "eng", "coins"), fx("burst", "transit", "eng")], camMove="crane_up"),
                 S("gold", shot="extreme", characters=[C("eng", expr="starry")], fx=[fx("money", "gold", "eng"), fx("sparkle", "mine", "eng")], camMove="push")]),
        B("It's nineteen twenty-nine, and New York promises commuters a brand new subway line under Second Avenue to fix endless overcrowding.",
          "street", "wide", "day", "whimsical", [C("old", expr="smile", holding="newspaper")], look="sepia", transition="dissolve",
          extras=5, extrasRole="commuter", extrasHolding="newspaper", text="1929", textStyle="title", camMove="truck_right",
          pieces=[pc("oldcar", "left"), pc("oldcar", "far", move="right")],
          shots=[S("Second", shot="close", characters=[C("old", "point", "grin", "newspaper")], camMove="orbit")]),
        B("Then the Great Depression hits, World War Two happens, and the project gets quietly buried for nearly a century.",
          "street", "close", "day", "tense", [C("old", expr="nervous")], look="sepia", pieces=[pc("blueprint", "left", label="SECOND AVE LINE")], camMove="push",
          shots=[S("World", shot="medium", hud="news", hudText="WAR!", characters=[C("old", "panic", "shock")]),
                 S("buried", shot="medium", look="bw", pieces=[pc("blueprint", "left", scale=1.2, label="~CANCELLED")], fx=[fx("dust", "buried", "old")], camMove="push")]),
        B("When they finally restart digging in the two thousands, every single inch of dirt costs more than solid platinum.",
          "tunnel", "wide", "night", "tense", [C("dig", expr="stern", holding="pickaxe")], transition="zoom", extras=4, extrasRole="technician",
          extrasHolding="pickaxe", text="2007", textStyle="title", camMove="truck_left", fx=[fx("dust", "digging", "dig")],
          shots=[S("every", shot="close", characters=[C("dig", "panic", "shock", "pickaxe")], fx=[fx("money", "inch", "dig")], camMove="push")]),
        B("Why? Because underneath the street lies a hundred-year-old maze of mystery pipes, electrical cables, and forgotten steam lines.",
          "tunnel", "medium", "night", "curious", [C("dig", "shrug", "nervous")], pieces=[pc("pipes", "behind", scale=1.2)], camMove="orbit",
          shots=[S("maze", shot="wide", characters=[C("dig", "point", "dazed")], pieces=[pc("pipes", "behind", scale=1.6)], camMove="crane_up"),
                 S("electrical", shot="close", characters=[C("dig", expr="shock", holding="wrench")], fx=[fx("sparks", "cables", "dig"), fx("puff", "forgotten", "dig")], impactWord="cables")]),
        B("Every time they move a single water pipe, it costs millions. They're literally tunneling through a maze of financial regret.",
          "office", "medium", "day", "tense", [C("acc", expr="sweat")], pieces=[pc("cashcounter", "left")], camMove="push",
          shots=[S("millions", shot="close", characters=[C("acc", "panic", "shock")], pieces=[pc("cashcounter", "left", label="fire", shake=1.2)], fx=[fx("money", "millions", "acc")]),
                 S("They're", shot="dutch", characters=[C("acc", expr="dazed")], pieces=[pc("cashcounter", "left", label="fire", shake=1.6)], camMove="orbit")]),
        B("Fast forward billions of dollars later: they finally open three shiny new stations, about two miles of track.",
          "tunnel", "wide", "day", "upbeat", [C("pax", expr="starry")], envVariant="station", transition="dissolve", camMove="crane_up",
          extras=3, extrasRole="officeguy", shots=[S("three", shot="low", camMove="truck_right", fx=[fx("sparkle", "shiny", "pax")])]),
        B("That means every single step you walk underground cost roughly a million dollars.",
          "tunnel", "medium", "day", "curious", [C("pax", "walk", "neutral", "ticket")], envVariant="station", pieces=[pc("escalator", "left")],
          hud="panel", hudText="$4,500,000,000 ÷ 2 MILES|≈ $1,000,000 PER STEP!", camMove="follow"),
        B("For that money, you could buy every daily rider a brand new car, and still have cash left for a private island.",
          "tunnel", "wide", "day", "whimsical", [C("pax", "point", "grin")], envVariant="station",
          pieces=[pc("car", "left"), pc("car", "right", mirror=True), pc("car", "far")], camMove="truck_left",
          shots=[S("private", shot="close", characters=[C("pax", expr="starry")], fx=[fx("money", "island", "pax")], camMove="push")]),
        B("So why did it cost so much? Consultants, special contracts, and hiring six guys to watch one guy hold a shovel.",
          "tunnel", "medium", "night", "whimsical", [C("acc", "shrug", "nervous")], camMove="push",
          shots=[S("Consultants", shot="close", characters=[C("acc", "point", "stern", "clipboard")], hud="panel", hudText="INVOICE|CONSULTANTS: $$$|CONTRACTS: $$$$"),
                 S("six", shot="wide", characters=[C("dig", "sit", "pained", "shovel")], extras=6, extrasRole="engineer", camMove="orbit", hud=None)]),
        B("And the best part? Phase two is still years from finished, which means the budget is about to enter orbit.",
          "office", "medium", "day", "upbeat", [C("eng", "point", "grin")], pieces=[pc("subwaymap", "left", label="PHASE 2|COMING NEVER")], transition="zoom", camMove="push",
          shots=[S("budget", shot="worm", characters=[C("eng", "cheer", "crazy")], pieces=[pc("cashcounter", "left", label="fire", lift=6)], camMove="crane_up")]),
        B("Congratulations, you've just built the most expensive hole in human history.",
          "tunnel", "medium", "day", "warm", [C("eng", "hips", "laugh")], pieces=[pc("ribbon", "behind", dz=-2.0)], fx=[fx("confetti", "Congratulations", "eng")],
          impactWord="hole", camMove="pull", shots=[S("most", shot="extreme", characters=[C("eng", expr="starry")], fx=[fx("confetti", "most", "eng")])]),
        B("Send this to that friend who complains about his local train ticket price.", "shops", "high", "golden", "warm", [], camMove="crane_up", transition="dissolve", envVariant="open"),
        OUTRO("Hit follow for more engineering disasters."),
    ])

# ---------------------------------------------------------------- 21  Feeding Manhattan
PLANS["plan_21_food"] = dict(
    title="How Manhattan Eats Every Day", environment="bridge", seed=73,
    cast=[{"id": "drv", "name": "Driver", "role": "driver"}, {"id": "chef", "name": "Chef", "role": "chef"}, {"id": "cop", "name": "Cop", "role": "cop"},
          {"id": "stk", "name": "Stocker", "role": "stocker"}, {"id": "bal", "name": "Ballerina", "role": "ballerina"}, {"id": "hat", "name": "Hard hat", "role": "engineer"}],
    claims=[("New York City has about 8.3 million people; Manhattan itself has no farms and relies on trucks over bridges and through tunnels.", "verified"),
            ("Manhattan's street grid comes from the Commissioners' Plan of 1811.", "verified"),
            ("Hunts Point Food Distribution Center in the Bronx is one of the largest food markets in the world.", "verified"),
            ("'Billions of calories a day' is a rounded estimate.", "uncertain")],
    beats=[
        B("How do you feed a city of eight million people when its heart is an island with zero farms? You don't. You pray the trucks don't stop.",
          "bridge", "wide", "day", "curious", [], hud="manhattan", hudText="jam", camMove="push",
          shots=[S("You", shot="medium", hud=None, characters=[C("drv", expr="sweat")], pieces=[pc("semi", "behind", scale=0.6)], camMove="push"),
                 S("pray", shot="extreme", hud=None, characters=[C("drv", "cheer", "nervous")], camMove="orbit")]),
        B("Every single morning, thousands of massive eighteen-wheelers converge on New York City before dawn, carrying millions of pounds of food.",
          "bridge", "wide", "night", "upbeat", [], text="4:00 AM", textStyle="title", transition="whip", camMove="truck_right",
          pieces=[pc("semi", "left", scale=0.6, move="toward"), pc("semi", "right", scale=0.6, mirror=True, move="toward")],
          shots=[S("converge", shot="low", pieces=[pc("semi", "left", scale=0.6, move="toward"), pc("semi", "far", scale=0.6)], camMove="truck_left")]),
        B("If you run a restaurant in Times Square, your entire menu depends on a single truck crawling across the George Washington Bridge.",
          "kitchen", "medium", "day", "tense", [C("chef", expr="sweat")], fx=[fx("product", "menu", "chef", "clock")], camMove="push", transition="dissolve",
          shots=[S("single", environment="bridge", shot="wide", light="night", characters=[], pieces=[pc("semi", "behind", scale=0.6), pc("car", "left"), pc("van", "right", mirror=True)], camMove="crane_up"),
                 S("George", environment="kitchen", shot="extreme", characters=[C("chef", expr="sweat")], camMove="push")]),
        B("Manhattan was laid out in eighteen eleven for horse-drawn carriages, not eighty-foot trucks trying to deliver fifty crates of avocados.",
          "street", "wide", "day", "whimsical", [], look="sepia", text="1811", textStyle="title", transition="dissolve", camMove="truck_right",
          pieces=[pc("oldcar", "left")],
          shots=[S("eighty", environment="shops", envVariant="open", look=None, shot="wide", text=None, pieces=[pc("semi", "behind", scale=0.8, shake=0.3)], characters=[C("drv", expr="shock")],
                   fx=[fx("notes", "eighty", "drv")], camMove="push"),
                 S("avocados", shot="close", characters=[C("drv", "shrug", "nervous", "box")], camMove="orbit")]),
        B("Delivery drivers have to invent new laws of physics just to double-park without getting towed in thirty seconds.",
          "shops", "medium", "day", "tense", [C("drv", "run", "sweat", "box")], pieces=[pc("boxes", "left")], camMove="follow", envVariant="open",
          shots=[S("double", shot="two_shot", characters=[C("cop", "point", "stern"), C("drv", "panic", "shock", "box")], focus="cop", fx=[fx("burst", "towed", "cop")], camMove="orbit"),
                 S("thirty", shot="extreme", characters=[C("drv", expr="sweat")], hud="panel", hudText="TOW TRUCK|ARRIVES IN 0:30!")]),
        B("By six in the morning, the Hunts Point Market in the Bronx turns into a synchronized war zone of forklifts and crates.",
          "warehouse", "wide", "day", "upbeat", [C("stk", "march", "stern")], text="6:00 AM", textStyle="title", transition="zoom", camMove="truck_left",
          pieces=[pc("forklift", "left", move="right"), pc("fruitpile", "right"), pc("forklift", "far", mirror=True, move="left")],
          extras=3, extrasRole="stocker", extrasAction="march",
          shots=[S("war", shot="low", pieces=[pc("forklift", "left", move="right"), pc("fruitpile", "behind", scale=1.4)], camMove="whip")]),
        B("If one bridge closes for maintenance, coffee shops downtown run out of milk before the morning rush even starts.",
          "bridge", "medium", "day", "tense", [C("cop", "point", "stern")], pieces=[pc("signs", "right", label="BRIDGE|CLOSED|SORRY")], camMove="push",
          shots=[S("coffee", environment="shops", shot="wide", characters=[C("hat", expr="dazed", holding="coffee")], pieces=[], extras=6, extrasRole="officeguy",
                   extrasHolding="coffee", camMove="truck_right"),
                 S("morning", shot="extreme", characters=[C("hat", expr="dazed", holding="coffee")], camMove="push")]),
        B("Fresh food has zero tolerance. Miss your delivery window, and thousands of meals turn into expensive dumpster juice.",
          "kitchen", "close", "day", "tense", [C("chef", expr="nervous", holding="lettuce")], hud="panel", hudText="DELIVERY WINDOW|00:01", camMove="push",
          shots=[S("thousands", shot="extreme", characters=[C("chef", expr="broken")], hud=None, fx=[fx("puff", "dumpster", "chef")], camMove="whip")]),
        B("An army of night-shift stockers unloads everything in total darkness before the city wakes up.",
          "shops", "medium", "night", "warm", [C("stk", "walk", "stern", "box")], pieces=[pc("crates", "left")], extras=3, extrasRole="stocker", extrasAction="march",
          transition="dissolve", camMove="follow"),
        B("We're talking about moving billions of calories across concrete bridges every single day, like clockwork.",
          "bridge", "wide", "golden", "upbeat", [C("hat", "cheer", "starry")], hud="panel", hudText="EVERY DAY|BILLIONS OF CALORIES!", fx=[fx("confetti", "billions", "hat")],
          camMove="crane_up"),
        B("It's the most fragile, high-stakes logistics ballet on Earth, and it happens every twenty-four hours.",
          "bridge", "wide", "golden", "whimsical", [C("bal", "cheer", "nervous", y=1.7)], pieces=[pc("crates", "on", scale=1.0, shake=0.5)], camMove="orbit",
          shots=[S("every", shot="worm", characters=[C("bal", "stretch", "sweat", y=1.7)], camMove="crane_up")]),
        B("Next time you bite into a bagel in Manhattan, remember it survived bridges, tunnels, and a parking ticket.",
          "shops", "close", "day", "warm", [C("hat", expr="starry", holding="bagel")], camMove="push", transition="zoom", envVariant="open",
          shots=[S("survived", shot="medium", characters=[C("hat", "point", "laugh", "bagel")], fx=[fx("product", "ticket", "hat", "ticket")], camMove="orbit")]),
        B("Send this to anyone who thinks food magically appears on grocery shelves.", "bridge", "wide", "night", "warm", [], hud="manhattan", hudText="night", transition="dissolve"),
        OUTRO("Hit follow for more hidden infrastructure secrets."),
    ])

# ---------------------------------------------------------------- 22  Panama Canal
PLANS["plan_22_panama"] = dict(
    title="The Canal That Cut a Continent", environment="canal", seed=79,
    cast=[{"id": "cap", "name": "Captain", "role": "skipper"}, {"id": "eng", "name": "Engineer", "role": "engineer"},
          {"id": "wk", "name": "1914 worker", "role": "worker"}, {"id": "toll", "name": "Toll man", "role": "tollman"}],
    claims=[("The Panama Canal expansion (opened 2016) cost about $5.25 billion; Neopanamax ships pass with only a few metres to spare.", "verified"),
            ("The canal opened in 1914; over 25,000 workers died across the French and American construction eras, mostly of disease.", "verified"),
            ("New locks use gravity-fed water (with water-saving basins), not pumps; tugboats guide ships in the new locks.", "verified"),
            ("About 40 percent of US container traffic passes through the canal; New York to San Francisco is ~8,000 miles shorter.", "verified"),
            ("Droughts in 2023 forced draft limits; some ships paid millions in auctions to jump the queue.", "verified")],
    beats=[
        B("They spent over five billion dollars widening the Panama Canal, and the giant new ships still scrape by with barely any room on either wall.",
          "canal", "wide", "day", "upbeat", [], pieces=[pc("containership", "behind", scale=0.55, move="away")], camMove="push",
          shots=[S("giant", shot="low", pieces=[pc("containership", "behind", scale=0.55, shake=0.4)], fx=[fx("sparks", "scrape", None)], camMove="truck_right"),
                 S("either", shot="close", characters=[C("cap", expr="sweat")], pieces=[], camMove="push")]),
        B("Back in nineteen fourteen, digging a ditch across the jungle connected two oceans and changed global trade forever.",
          "canal", "wide", "day", "whimsical", [C("wk", "stand", "stern", "shovel")], envVariant="dig", look="sepia", transition="dissolve",
          extras=4, extrasRole="worker", extrasHolding="shovel", text="1914", textStyle="title", pieces=[pc("steamshovel", "left")], fx=[fx("puff", "ditch", "wk")], camMove="truck_left",
          shots=[S("connected", shot="close", characters=[C("wk", "cheer", "grin", "shovel")], camMove="push")]),
        B("The original cost? Over twenty-five thousand worker lives lost to malaria and yellow fever in the brutal tropical mud.",
          "canal", "close", "golden", "tense", [C("wk", "sit", "sleepy")], envVariant="dig", look="sepia", pieces=[pc("mosquito", "right", y=1.4, shake=0.6)], camMove="push",
          shots=[S("malaria", shot="extreme", characters=[C("wk", "sit", "shock")], pieces=[pc("mosquito", "right", y=1.5, shake=0.8, scale=1.6)])]),
        B("Fast forward a century, and cargo ships got so big they couldn't even fit through the old locks anymore.",
          "canal", "worm", "day", "curious", [C("cap", expr="shock")], pieces=[pc("containership", "behind", scale=0.7)], transition="zoom", camMove="crane_up",
          shots=[S("couldn't", shot="extreme", characters=[C("cap", expr="broken")], camMove="push")]),
        B("So engineers launched a colossal project: brand new, gigantic concrete water elevators to lift floating cities.",
          "canal", "medium", "day", "upbeat", [C("eng", "point", "grin")], envVariant="dig", pieces=[pc("blueprint", "left", label="NEW LOCKS"), pc("mixer", "far", move="left")],
          camMove="orbit", shots=[S("gigantic", shot="wide", pieces=[pc("mixer", "left"), pc("mixer", "right", mirror=True)], characters=[C("eng", "cheer", "starry")], camMove="crane_up")]),
        B("Instead of pumps, gravity does all the work, draining lake water to float ships uphill.",
          "canal", "wide", "day", "whimsical", [], pieces=[pc("containership", "behind", scale=0.55, y=-2.5, lift=0.5)], fx=[fx("splash", "gravity", None)], camMove="crane_up",
          shots=[S("float", shot="low", fx=[fx("splash", "uphill", None)], camMove="truck_right")]),
        B("The new ships are so wide they leave just a few meters on each side. There is zero room for bad steering.",
          "canal", "close", "day", "tense", [C("cap", expr="sweat")], hud="panel", hudText="CLEARANCE|≈ 3 METERS EACH SIDE!", camMove="push",
          shots=[S("zero", shot="extreme", characters=[C("cap", expr="broken")], hud=None, camMove="whip")]),
        B("Powerful tugboats tie onto both ends to guide the giant beast through safely.",
          "canal", "wide", "day", "upbeat", [], pieces=[pc("containership", "behind", scale=0.55, move="away"), pc("tugboat", "behind", dx=-9, dz=-2, y=-1.4), pc("tugboat", "behind", dx=9, dz=-2, y=-1.4, mirror=True)], camMove="truck_right",
          shots=[S("guide", shot="low", characters=[C("cap", "point", "grin")], camMove="truck_left")]),
        B("The funny part? The canal runs on rainwater, so when a drought hits, ships pay millions just to skip the line.",
          "canal", "wide", "day", "curious", [C("cap", "shrug", "nervous")], envVariant="dry", camMove="pull",
          shots=[S("ships", shot="two_shot", characters=[C("cap", "stand", "grin", "cash"), C("toll", expr="starry")], focus="cap", fx=[fx("product", "skip", "toll", "ticket"), fx("money", "millions", "cap")], camMove="orbit")]),
        B("Around forty percent of all US container traffic squeezes through this exact tropical bottleneck.", "canal", "wide", "day", "upbeat", [], hud="world", transition="zoom"),
        B("Instead of sailing all the way around South America, you cut about eight thousand miles off the trip in one afternoon.", "canal", "wide", "day", "upbeat", [], hud="panama"),
        B("Humanity literally cut a continent in half so your TV could arrive faster.",
          "apartment", "medium", "day", "warm", [C("cap", "cheer", "starry")], pieces=[pc("tv", "left", label="~game"), pc("cardbox", "right")], transition="dissolve", camMove="push",
          shots=[S("TV", shot="extreme", characters=[C("cap", expr="starry")], fx=[fx("sparkle", "arrive", "cap")])]),
        B("Send this to anyone who loves engineering marvels.", "canal", "wide", "golden", "warm", [], pieces=[pc("containership", "far", scale=0.5)], camMove="crane_up", transition="dissolve"),
        OUTRO("Hit follow for more megaproject breakdowns."),
    ])

# ---------------------------------------------------------------- 23  Kansai sinking airport
PLANS["plan_23_kansai"] = dict(
    title="The Airport That Is Sinking", environment="island", seed=83,
    cast=[{"id": "eng", "name": "Engineer", "role": "engineer"}, {"id": "slp", "name": "Resident", "role": "sleeper"},
          {"id": "plt", "name": "Director", "role": "pilot"}, {"id": "pax", "name": "Passenger", "role": "tourist"}],
    claims=[("Kansai International Airport (opened 1994) sits on an artificial island about 5 km off the coast in Osaka Bay.", "verified"),
            ("Fill came from cut-down mountains; the seabed holds ~18-20 m of soft alluvial clay.", "verified"),
            ("The island has sunk about 11-12 m since construction, faster than predicted; terminal columns are adjustable with jacks.", "verified"),
            ("Seawalls protect the island (Typhoon Jebi flooded it in 2018); Kansai is repeatedly ranked among the most punctual airports.", "verified")],
    beats=[
        B("Japan needed a massive international airport, but there was no room on land, so they built an island in the ocean, which is slowly swallowing itself.",
          "island", "wide", "day", "upbeat", [], pieces=[pc("airplane", "behind", y=3, move="right", scale=0.6)], camMove="truck_right",
          shots=[S("island", shot="wide", pieces=[pc("airplane", "far", y=2, scale=0.6, move="left")], camMove="crane_up"),
                 S("swallowing", shot="low", characters=[C("eng", "panic", "shock")], fx=[fx("splash", "swallowing", "eng")], camMove="push")]),
        B("In the nineteen eighties, Osaka was running out of space, and residents hated noisy flights over the city.",
          "suburb", "medium", "night", "whimsical", [C("slp", "point", "stern", "pillow")], extras=3, extrasRole="sleeper", extrasHolding="pillow",
          pieces=[pc("airplane", "behind", y=7, scale=0.4, move="right")], text="1980s", textStyle="title", transition="dissolve", camMove="push",
          shots=[S("hated", shot="close", characters=[C("slp", "panic", "crazy", "pillow")], fx=[fx("notes", "noisy", "slp")], camMove="whip")]),
        B("The solution? Build a brand new artificial island five kilometers out in Osaka Bay, where nobody can complain.", "island", "wide", "day", "upbeat", [], hud="osaka", transition="zoom"),
        B("Engineers flattened entire mountains, loaded millions of tons of rock onto barges, and dumped it into the sea.",
          "island", "wide", "day", "upbeat", [C("eng", "point", "grin")], envVariant="build", pieces=[pc("excavator", "left"), pc("rockpile", "right")], camMove="truck_left",
          shots=[S("dumped", shot="low", characters=[], pieces=[pc("rockpile", "behind", y=1.5, lift=-1.5, scale=1.2)], fx=[fx("splash", "sea", None)], camMove="whip")]),
        B("The small oversight? The sea floor was made of about sixty feet of ultra-soft marine clay.", "island", "wide", "day", "curious", [], hud="mud", transition="dissolve"),
        B("Instead of settling slightly, the island kept sinking, year after year, way faster than predicted.",
          "island", "medium", "day", "tense", [C("eng", expr="sweat")], hud="bar", hudText="ISLAND SINKING|0|38|FT", camMove="push",
          shots=[S("year", shot="extreme", characters=[C("eng", expr="broken")], camMove="push"),
                 S("faster", shot="dutch", characters=[C("eng", "panic", "shock")], camMove="orbit")]),
        B("To keep the terminal from flooding, engineers put hydraulic jacks under the building to lift it up by hand.",
          "airport", "wide", "day", "upbeat", [C("eng", "stand", "stern", "wrench")], extras=5, extrasRole="engineer", extrasHolding="wrench", transition="zoom", camMove="truck_right",
          shots=[S("lift", shot="close", characters=[C("eng", "cheer", "laugh", "wrench")], camMove="crane_up")]),
        B("They surrounded the island with massive seawalls and armor blocks to stop typhoons from washing it away.",
          "island", "wide", "night", "tense", [], pieces=[pc("tetrapods", "front"), pc("tetrapods", "behind")], fx=[fx("splash", "typhoons", None)], camMove="whip",
          shots=[S("typhoons", shot="low", fx=[fx("splash", "washing", None)], camMove="push")]),
        B("Pumping billions of dollars into keeping an airport above water is the ultimate engineering flex.",
          "office", "medium", "day", "upbeat", [C("plt", "stand", "grin", "check")], fx=[fx("money", "billions", "plt")], camMove="push",
          shots=[S("ultimate", shot="extreme", characters=[C("plt", expr="starry")], fx=[fx("sparkle", "flex", "plt")])]),
        B("Despite sinking into the abyss, Kansai is still one of the most punctual airports on Earth.",
          "airport", "wide", "day", "warm", [C("pax", "walk", "smile", "suitcase")], pieces=[pc("departures", "behind")], extras=4, extrasRole="tourist",
          extrasHolding="suitcase", extrasAction="walk", transition="dissolve", camMove="follow"),
        B("With sea levels rising, engineers are now in a high-stakes race against Neptune himself.",
          "island", "wide", "day", "tense", [C("eng", "run", "shock")], pieces=[pc("airplane", "behind", scale=0.6, move="left")], fx=[fx("product", "Neptune", "eng", "trident"), fx("splash", "rising", "eng")],
          camMove="follow"),
        B("Next time your flight is delayed, remember the runway under you is slowly drowning.",
          "airport", "medium", "day", "warm", [C("pax", expr="neutral", holding="coffee")], envVariant="aquarium", camMove="push",
          shots=[S("runway", shot="close", characters=[C("pax", expr="shock", holding="coffee")], camMove="orbit")]),
        B("Send this to anyone who loves extreme civil engineering.", "island", "wide", "golden", "warm", [], camMove="crane_up", transition="dissolve"),
        OUTRO("Hit follow for more engineering wonders."),
    ])


def main():
    md = ["# Megaproject shorts 20–23 (Loophole Lou / megaproject docs, pro cut)", "",
          "Voice: Kokoro blend `am_fenrir*0.8+am_eric*0.2` (closest measured match to the reference narrator: male, median pitch ~148 Hz, wide range).",
          "Figures corrected to documented facts where the brief overstated them (see verifiedClaims in each plan).", ""]
    for name, p in PLANS.items():
        p = dict(p)
        claims = p.pop("claims")
        plan = {"version": 1, "lang": "en", "style": "storybook", "graphics": "full", "captions": True, **p,
                "verifiedClaims": [{"text": t, "status": s} for t, s in claims]}
        P = Plan.model_validate(plan)
        with open(os.path.join(HERE, name + ".json"), "w", encoding="utf-8") as f:
            json.dump(json.loads(P.model_dump_json(exclude_defaults=True)), f, indent=1, ensure_ascii=False)
        words = sum(len(b.narration.split()) for b in P.beats)
        md += [f"## {P.title}  (`{name}.json`, {len(P.beats)} scenes, {words} words)", ""]
        for i, b in enumerate(P.beats, 1):
            cut = "".join(f" → **{s.at}**: {s.shot or b.shot}" + (f" @ {s.environment}" if s.environment else "") for s in b.shots)
            who = ", ".join(f"{c.id} ({c.action}, {c.expr}{', ' + c.holding if c.holding else ''})" for c in b.characters) or "no cast"
            md.append(f"{i}. *{b.environment} · {b.shot} · {b.light}{' · ' + b.camMove if b.camMove else ''}{' · ' + b.transition if b.transition != 'cut' else ''}"
                      f"{' · HUD ' + b.hud if b.hud else ''}{' · ' + b.look if b.look else ''}* — “{b.narration}” — {who}{cut}")
        md.append("")
    with open(os.path.join(HERE, "STORIES_20-23.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(md))
    print("ok")


if __name__ == "__main__":
    main()
