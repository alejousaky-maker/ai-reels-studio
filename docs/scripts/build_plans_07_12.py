"""Builds plan_07..plan_12 (the house formula) from the scripts in STORIES_07-12.md. Run: python docs/scripts/build_plans_07_12.py"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))


def ch(id, expr="neutral", **k):
    d = {"id": id, "expr": expr}
    if "hold" in k:
        d["holding"] = k.pop("hold")
    if "react" in k:
        w, e = k.pop("react")
        d["react"] = {"word": w, "expr": e}
    d.update(k)
    return d


def fx(kind, word, on, product=None):
    d = {"kind": kind, "word": word, "on": on}
    if product:
        d["product"] = product
    return d


def beat(text, env, shot, chars, light="day", mood="whimsical", spot=None, fxs=(), pieces=(), label=None, impact=None, trans=None, **k):
    b = {"narration": text, "environment": env, "shot": shot, "light": light, "mood": mood, "characters": chars}
    if spot is not None:
        b["spot"] = spot
    if fxs:
        b["fx"] = list(fxs)
    if pieces:
        b["pieces"] = list(pieces)
    if label:
        b["text"], b["textStyle"] = label, "label"
    if impact:
        b["impactWord"] = impact
    if trans:
        b["transition"] = trans
    if chars:
        b["focus"] = chars[0]["id"]
    b.update(k)
    return b


def P(kind, where="behind", **k):
    return {"kind": kind, "where": where, **k}


SRC = {
    "emu": "https://en.wikipedia.org/wiki/Emu_War",
    "caesar": "Plutarch, Life of Caesar 1-2; https://en.wikipedia.org/wiki/Julius_Caesar",
    "cobra": "https://en.wikipedia.org/wiki/Perverse_incentive (anecdote; historicity uncertain)",
}
FICTION = [{"text": "Fictional comedy story (not a real event).", "status": "fiction"}]
plans = {}

plans["plan_07_emu_war"] = dict(title="The Great Emu War", env="outback", seed=21, cast=[
    {"id": "sold", "name": "Soldier", "role": "soldier"}, {"id": "sold2", "name": "Soldier", "role": "soldier", "palette": "#7a7a4a"},
    {"id": "major", "name": "Major Meredith", "role": "major"}, {"id": "emu", "name": "Emu", "role": "emu"},
    {"id": "farmer", "name": "Farmer", "role": "farmer"}, {"id": "pol", "name": "Politician", "role": "businessman", "palette": "#2b2b38"},
    {"id": "pol2", "name": "Politician", "role": "guest"}], claims=[
    {"text": "In Nov-Dec 1932 the Australian army (Maj. G.P.W. Meredith, two soldiers, two Lewis guns, 10,000 rounds) was sent against emus in Western Australia.", "status": "verified", "source": SRC["emu"]},
    {"text": "About 20,000 emus were damaging wheat crops.", "status": "verified", "source": SRC["emu"]},
    {"text": "At a dam ambush a gun jammed after about a dozen birds were killed; Meredith compared the emus' resilience to tanks.", "status": "verified", "source": SRC["emu"]},
    {"text": "The operation was withdrawn, resumed, and averaged about 10 rounds per confirmed kill.", "status": "verified", "source": SRC["emu"]},
    {"text": "'Lost a war to birds' is the popular comic framing.", "status": "fiction"}], beats=[
    beat("In 1932, Australia sent soldiers with machine guns to fight birds. The birds won.", "outback", "wide",
         [ch("sold", "nervous", react=("won", "shock")), ch("emu", "neutral")], spot=0, mood="upbeat", impact="won", pieces=[P("lewis", "left")],
         fxs=[fx("product", "won", "sold", "exclaim")]),
    beat("About twenty thousand emus were eating the farmers' wheat.", "outback", "medium", [ch("farmer", "stern")], spot=0,
         extras=4, extrasRole="emu", label="≈ 20,000 EMUS"),
    beat("So the army sent Major Meredith, two soldiers, two machine guns, and ten thousand bullets.", "outback", "medium",
         [ch("major", "smile"), ch("sold", "neutral"), ch("sold2", "neutral")], spot=3, mood="upbeat", pieces=[P("truck", "far", dx=4)], label="10,000 BULLETS"),
    beat("Plan: wait at a dam, let a thousand emus walk in, and open fire.", "outback", "wide", [ch("sold", "grin"), ch("sold2", "grin")],
         spot=1, light="golden", mood="tense", extras=4, extrasRole="emu", extrasAction="walk", pieces=[P("lewis", "left")], trans="xfade"),
    beat("The gun jammed after a dozen shots.", "outback", "medium", [ch("sold", "neutral", react=("jammed", "dazed"))], spot=1, light="golden",
         mood="tense", impact="jammed", pieces=[P("lewis", "left")], fxs=[fx("puff", "jammed", "sold")]),
    beat("And the emus scattered in every direction, at fifty kilometers an hour.", "outback", "wide", [ch("emu", "shock", action="walk")],
         spot=2, mood="upbeat", extras=6, extrasRole="emu", extrasAction="walk", label="50 KM/H"),
    beat("Meredith said they could face machine guns like tanks.", "outback", "close", [ch("major", "shock")], spot=0, mood="curious",
         fxs=[fx("product", "tanks", "major", "exclaim")]),
    beat("Newspapers laughed. Parliament asked questions.", "office", "two_shot", [ch("pol", "laugh", hold="book"), ch("pol2", "laugh")],
         spot=0, trans="xfade", fxs=[fx("product", "questions", "pol2", "question")]),
    beat("The soldiers were pulled out within a week.", "office", "close", [ch("major", "dazed", hold="folder")], spot=0, mood="tense",
         impact="pulled", fxs=[fx("burst", "pulled", "major")]),
    beat("They came back for round two, and used nearly ten bullets per bird.", "outback", "wide", [ch("sold", "nervous"), ch("emu", "smile")],
         spot=0, light="golden", pieces=[P("lewis", "left")], label="≈ 10 BULLETS PER BIRD", trans="xfade"),
    beat("The emus? Still there. Still eating wheat.", "outback", "medium", [ch("emu", "laugh")], spot=0, light="golden", extras=2, extrasRole="emu"),
    beat("In the end, farmers got fences and ammo for themselves.", "outback", "medium", [ch("farmer", "smile")], spot=4, light="golden", mood="warm"),
    beat("A modern army. Machine guns. And the only war Australia ever lost to a bird.", "outback", "close", [ch("emu", "smile", react=("bird", "laugh"))],
         spot=0, light="golden", mood="warm", fxs=[fx("sparkle", "bird", "emu")]),
])

plans["plan_08_caesar_pirates"] = dict(title="Caesar vs the Pirates", env="ocean", seed=23, cast=[
    {"id": "caesar", "name": "Julius Caesar", "role": "caesar"}, {"id": "cap", "name": "Pirate captain", "role": "captain"},
    {"id": "pir", "name": "Pirate", "role": "pirate"}, {"id": "pir2", "name": "Pirate", "role": "pirate", "palette": "#2f5f6a"},
    {"id": "legion", "name": "Soldier", "role": "greek", "palette": "#9a2a3a"}], claims=[
    {"text": "Around 75 BC Cilician pirates captured young Caesar and asked 20 talents; he said he was worth at least 50.", "status": "verified", "source": SRC["caesar"]},
    {"text": "He was held about 38 days, wrote poems and speeches, read them to the pirates, called them illiterate barbarians, and told them to be quiet when he slept.", "status": "verified", "source": SRC["caesar"]},
    {"text": "He jokingly threatened to punish them; after the ransom he raised a fleet without public office, captured them and had them executed.", "status": "verified", "source": SRC["caesar"]}], beats=[
    beat("Pirates kidnapped Julius Caesar and asked for twenty talents. He was offended. He told them to ask for fifty.", "ocean", "two_shot",
         [ch("caesar", "stern", hold="scroll"), ch("cap", "grin", react=("fifty", "shock"))], spot=0, mood="upbeat", impact="fifty", label="50 TALENTS"),
    beat("Around seventy-five B.C., young Caesar was sailing across the Aegean.", "ocean", "wide", [ch("caesar", "smile_closed")], spot=1, light="golden"),
    beat("Cilician pirates grabbed him, and set his price.", "ocean", "medium", [ch("cap", "grin"), ch("pir", "grin"), ch("caesar", "neutral")],
         spot=2, mood="tense", fxs=[fx("product", "price", "cap", "coins")]),
    beat("Twenty talents? For me? Do you know who I am?", "ocean", "close", [ch("caesar", "stern")], spot=0,
         fxs=[fx("product", "who", "caesar", "question")]),
    beat("He sent his friends to raise the money, and stayed with the pirates for thirty-eight days.", "ocean", "medium",
         [ch("caesar", "smile"), ch("pir2", "nervous")], spot=3, light="golden", label="38 DAYS", fxs=[fx("product", "days", "caesar", "clock")]),
    beat("When he wanted to sleep, he told them to be quiet.", "cabin", "two_shot", [ch("caesar", "stern"), ch("pir", "nervous", react=("quiet", "shock"))],
         spot=0, light="night", trans="xfade", fxs=[fx("product", "quiet", "caesar", "exclaim")]),
    beat("He wrote poems, read them out loud, and called them illiterate barbarians if they didn't clap.", "cabin", "medium",
         [ch("caesar", "smile_closed", hold="scroll"), ch("pir", "nervous"), ch("pir2", "nervous")], spot=0, light="night",
         fxs=[fx("notes", "poems", "caesar")]),
    beat("He joked he'd come back and punish them all. They laughed.", "cabin", "two_shot", [ch("caesar", "smile"), ch("cap", "neutral", react=("laughed", "laugh"))],
         spot=1, light="night", mood="tense"),
    beat("The ransom arrived. Fifty talents. They let him go.", "harbour", "medium", [ch("caesar", "smile_closed")], spot=0, trans="xfade",
         fxs=[fx("product", "Fifty", "caesar", "coins")]),
    beat("Caesar raised a fleet, without any official command.", "harbour", "wide", [ch("caesar", "grin", action="wave"), ch("legion", "stern")],
         spot=4, mood="upbeat", pieces=[P("galley", "far", dx=-4), P("galley", "far", dx=10)]),
    beat("He found the pirates on the same island, took back the silver, and captured them all.", "beach", "wide",
         [ch("cap", "neutral", react=("captured", "shock")), ch("pir", "shock"), ch("pir2", "shock")], spot=0, mood="tense", impact="captured",
         pieces=[P("galley", "right", dz=6)], fxs=[fx("burst", "captured", "cap")]),
    beat("And that joke about punishing them? It wasn't a joke.", "beach", "close", [ch("cap", "dazed")], spot=0, light="golden", mood="tense"),
    beat("Never let your hostage negotiate his own price.", "harbour", "close", [ch("caesar", "smile", react=("price", "smile_closed"))],
         spot=0, light="golden", mood="warm", fxs=[fx("sparkle", "price", "caesar")]),
])

plans["plan_09_cobra_effect"] = dict(title="The Cobra Effect", env="market", seed=25, cast=[
    {"id": "raj", "name": "Official", "role": "raj_official"}, {"id": "loc", "name": "Snake catcher", "role": "local"},
    {"id": "ent", "name": "Entrepreneur", "role": "local", "palette": "#c9a66b"}, {"id": "prof", "name": "Economist", "role": "scholar"}], claims=[
    {"text": "The 'cobra effect' (term coined by economist Horst Siebert) describes a bounty on cobras in colonial Delhi that led to cobra breeding; when the bounty ended, bred snakes were released.", "status": "uncertain", "source": SRC["cobra"]},
    {"text": "The story is an anecdote whose historicity is not established; it is narrated as 'the story goes'.", "status": "fiction"}], beats=[
    beat("A government paid cash for dead cobras, and somehow ended up with more cobras.", "market", "medium",
         [ch("raj", "smile"), ch("loc", "grin", hold="snake")], spot=0, mood="upbeat", pieces=[P("booth", "behind", label="REWARD")],
         fxs=[fx("product", "cash", "raj", "coins")]),
    beat("The story goes: colonial Delhi had a cobra problem.", "street", "wide", [ch("loc", "shock")], spot=0, mood="curious",
         extras=3, extrasRole="local", pieces=[P("snakes", "front")]),
    beat("So the officials offered a reward for every dead cobra.", "market", "medium", [ch("raj", "smile_closed")], spot=0,
         pieces=[P("booth", "behind", label="REWARD")], fxs=[fx("product", "reward", "raj", "scroll")]),
    beat("At first, it worked. Dead snakes came in by the basket.", "market", "wide", [ch("raj", "grin"), ch("loc", "smile", hold="snake")],
         spot=0, extras=3, extrasRole="local", pieces=[P("booth", "behind", label="REWARD")]),
    beat("Then somebody did the math.", "village_square", "close", [ch("ent", "neutral", react=("math", "grin"))], spot=1,
         fxs=[fx("product", "math", "ent", "lightbulb")]),
    beat("Why hunt cobras, when you can farm them?", "village_square", "medium", [ch("ent", "laugh", hold="snake")], spot=1,
         pieces=[P("crates", "right", label="COBRA FARM")]),
    beat("More snakes, more cash. Business was booming.", "market", "two_shot", [ch("raj", "grin"), ch("ent", "smile_closed")], spot=0,
         mood="upbeat", fxs=[fx("product", "cash", "ent", "coins")]),
    beat("The officials noticed the numbers made no sense.", "interior", "medium", [ch("raj", "nervous", hold="book")], trans="xfade",
         fxs=[fx("product", "sense", "raj", "question")]),
    beat("So they cancelled the reward.", "market", "medium", [ch("raj", "stern")], spot=0, impact="cancelled",
         pieces=[P("board", "right", label="~REWARD|CANCELLED")]),
    beat("Now the breeders had crates of worthless snakes. So they let them go.", "street", "wide", [ch("ent", "grin")], spot=0,
         light="golden", mood="tense", pieces=[P("crates", "left", label="COBRA FARM"), P("snakes", "front")], trans="xfade"),
    beat("The city ended up with more cobras than before.", "street", "wide", [ch("raj", "dazed")], spot=2, light="golden", mood="tense",
         extras=3, extrasRole="local", extrasAction="walk", pieces=[P("snakes", "front"), P("snakes", "left")]),
    beat("Economists still call it the Cobra Effect.", "interior", "medium", [ch("prof", "smile")], pieces=[P("board", "right", label="COBRA|EFFECT")],
         trans="xfade"),
    beat("Pay people to solve a problem, and they'll make sure it never ends.", "village_square", "close",
         [ch("ent", "smile", hold="snake", react=("ends", "smile_closed"))], spot=1, light="golden", mood="warm", fxs=[fx("sparkle", "ends", "ent")]),
])

plans["plan_10_airpods"] = dict(title="The AirPods Snitch", env="suburb", seed=27, cast=[
    {"id": "gf", "name": "Her", "role": "hoodie", "palette": "#9a7ac9"}, {"id": "bf", "name": "Boyfriend", "role": "athlete", "palette": "#f2efe8"},
    {"id": "girl", "name": "The other girl", "role": "woman", "palette": "#c8323a"}], claims=FICTION, beats=[
    beat("She caught her boyfriend cheating before she even turned off her car.", "suburb", "medium", [ch("gf", "stern", hold="phone")],
         spot=0, light="golden", mood="upbeat", pieces=[P("car", "left")], label="CONNECTED: BEDROOM AIRPODS", impact="car"),
    beat("She came home early to surprise him.", "suburb", "wide", [ch("gf", "smile")], spot=0, light="golden", pieces=[P("car", "left")]),
    beat("Then her car connected to his AirPods. The ones upstairs.", "suburb", "close", [ch("gf", "neutral", react=("upstairs", "shock"))],
         spot=0, light="golden", mood="curious", fxs=[fx("product", "AirPods", "gf", "earbuds")]),
    beat("And her car speakers started playing his bedroom.", "suburb", "medium", [ch("gf", "shock", hold="phone")], spot=0, light="golden",
         mood="tense", pieces=[P("car", "left")], fxs=[fx("notes", "playing", "gf")]),
    beat("Upstairs, he and another girl were sharing his AirPods, laughing.", "bedroom", "two_shot",
         [ch("bf", "laugh", hold="earbuds"), ch("girl", "laugh")], spot=0, light="night", trans="xfade"),
    beat("They had no idea the mic was live.", "bedroom", "close", [ch("bf", "laugh")], spot=0, light="night", mood="tense",
         fxs=[fx("product", "mic", "bf", "mic")]),
    beat("She didn't scream. She just listened.", "suburb", "close", [ch("gf", "stern")], spot=0, light="night", mood="tense", trans="xfade"),
    beat("Then she picked up her phone, and spoke into the mic.", "suburb", "medium", [ch("gf", "neutral", hold="phone")], spot=0, light="night",
         fxs=[fx("product", "mic", "gf", "mic")]),
    beat("Hi babe. Enjoy your last night in my house.", "suburb", "close", [ch("gf", "smile")], spot=0, light="night", mood="tense"),
    beat("Through the upstairs window, two silhouettes froze.", "bedroom", "two_shot",
         [ch("bf", "laugh", react=("froze", "shock")), ch("girl", "laugh", react=("froze", "shock"))], spot=0, light="night", mood="tense",
         impact="froze", fxs=[fx("product", "froze", "bf", "exclaim")]),
    beat("By morning, the locks were changed and his stuff was on the lawn.", "suburb", "wide", [ch("bf", "dazed")], spot=0,
         pieces=[P("boxes", "left"), P("van", "behind", dx=2)], trans="xfade"),
    beat("He kept the AirPods.", "suburb", "medium", [ch("bf", "pained", hold="earbuds")], spot=1),
    beat("Bluetooth: connecting people. Especially the wrong ones.", "suburb", "close", [ch("gf", "smile", hold="key", react=("wrong", "smile_closed"))],
         spot=0, light="golden", mood="warm", fxs=[fx("sparkle", "wrong", "gf")]),
])

plans["plan_11_running_map"] = dict(title="The Running Map Fail", env="kitchen", seed=29, cast=[
    {"id": "hub", "name": "Husband", "role": "athlete"}, {"id": "wife", "name": "Wife", "role": "robe"},
    {"id": "ex", "name": "His ex", "role": "woman", "palette": "#ff8fc0"}], claims=FICTION, beats=[
    beat("He bragged about running five miles every morning, until his GPS map drew a line straight to his ex's house.", "kitchen", "two_shot",
         [ch("hub", "grin"), ch("wife", "stern", hold="tablet")], spot=0, mood="upbeat", fxs=[fx("product", "map", "wife", "gpsmap")]),
    beat("Every day at six, he laced up and left.", "suburb", "wide", [ch("hub", "smile", action="walk")], spot=0, light="golden", trans="xfade"),
    beat("His running app shared every route. Publicly.", "kitchen", "close", [ch("wife", "neutral", hold="tablet")], spot=1, mood="curious",
         fxs=[fx("product", "Publicly", "wife", "phone")]),
    beat("His wife opened the map.", "kitchen", "close", [ch("wife", "stern")], spot=1, mood="tense", fxs=[fx("product", "map", "wife", "gpsmap")]),
    beat("Five miles? The red line went three blocks, and stopped at one pink house.", "kitchen", "medium",
         [ch("wife", "neutral", hold="tablet", react=("pink", "shock"))], spot=0, mood="tense", label="5 MILES? 3 BLOCKS.",
         fxs=[fx("product", "pink", "wife", "gpsmap")]),
    beat("For forty-five minutes.", "kitchen", "close", [ch("wife", "stern")], spot=0, label="45 MIN", fxs=[fx("product", "minutes", "wife", "clock")]),
    beat("Heart rate: one sixty-five. While standing still.", "kitchen", "close", [ch("wife", "shock")], spot=0, mood="tense", label="165 BPM",
         impact="still", fxs=[fx("product", "Heart", "wife", "heart")]),
    beat("The pink house belonged to his ex.", "suburb", "medium", [ch("ex", "smile", action="wave")], spot=1, trans="xfade"),
    beat("His wife didn't say a word. She planned a finish line.", "kitchen", "close", [ch("wife", "stern", react=("finish", "smile"))], spot=0,
         fxs=[fx("product", "finish", "wife", "lightbulb")]),
    beat("Next morning, he jogged home smiling.", "suburb", "wide", [ch("hub", "grin", action="walk")], spot=0, mood="upbeat", trans="xfade"),
    beat("A red finish tape was stretched across the lawn, tied to two packed suitcases.", "suburb", "wide",
         [ch("hub", "grin", react=("suitcases", "shock"))], spot=0, mood="tense", pieces=[P("finish", "behind")], impact="suitcases"),
    beat("And divorce papers, with his route printed on the back.", "suburb", "two_shot", [ch("wife", "stern", hold="scroll"), ch("hub", "nervous")],
         spot=0, mood="tense", fxs=[fx("product", "route", "wife", "gpsmap")]),
    beat("He finally finished a run. Just not the one he planned.", "suburb", "close", [ch("wife", "smile", react=("planned", "smile_closed"))],
         spot=0, light="golden", mood="warm", fxs=[fx("sparkle", "planned", "wife")]),
])

plans["plan_12_wedding_slideshow"] = dict(title="The Wedding Slideshow", env="banquet", seed=31, cast=[
    {"id": "groom", "name": "Groom", "role": "groom"}, {"id": "bride", "name": "Bride", "role": "bride"},
    {"id": "best", "name": "Best man", "role": "businessman", "palette": "#2f3f6a"}, {"id": "g1", "name": "Guest", "role": "guest"},
    {"id": "g2", "name": "Guest", "role": "guest", "palette": "#5d7a3a"}], claims=FICTION, beats=[
    beat("He found out his bride cheated with the best man. He didn't cancel the wedding. He edited the slideshow.", "banquet", "wide",
         [ch("groom", "smile", hold="mic"), ch("bride", "smile"), ch("best", "smile")], spot=1, mood="upbeat",
         pieces=[P("screen", "behind", label="photos")], impact="slideshow"),
    beat("Forty thousand dollars. Two hundred guests. One projector.", "banquet", "medium", [ch("g1", "smile"), ch("g2", "smile")], spot=3,
         label="$40,000"),
    beat("The night before, a hotel hallway camera told him everything.", "hotel", "close", [ch("groom", "neutral", hold="phone", react=("everything", "stern"))],
         spot=0, light="night", mood="tense", trans="xfade", fxs=[fx("product", "camera", "groom", "camera")]),
    beat("He smiled through the whole ceremony.", "banquet", "close", [ch("groom", "smile")], spot=0, trans="xfade"),
    beat("Then, at the reception, he took the mic for a special slideshow.", "banquet", "medium", [ch("groom", "smile_closed", hold="mic")], spot=1,
         mood="upbeat"),
    beat("Baby photos. The first date. The proposal.", "banquet", "wide", [ch("g1", "smile"), ch("g2", "smile")], spot=1,
         pieces=[P("screen", "behind", label="photos")], fxs=[fx("product", "proposal", "g1", "heart")]),
    beat("And then, a hallway photo. The bride and the best man, walking into the same hotel room.", "banquet", "wide",
         [ch("g1", "smile", react=("hallway", "shock")), ch("g2", "smile", react=("best", "shock"))], spot=1, mood="tense", impact="hallway",
         pieces=[P("screen", "behind", label="hallway")], fxs=[fx("product", "hallway", "g2", "exclaim")]),
    beat("Timestamp: last night.", "banquet", "medium", [ch("groom", "neutral")], spot=1, mood="tense", pieces=[P("screen", "behind", label="hallway")],
         label="23:47 — LAST NIGHT", fxs=[fx("product", "last", "groom", "clock")]),
    beat("The bride and the best man went pale.", "banquet", "two_shot", [ch("bride", "dazed"), ch("best", "dazed")], spot=0, mood="tense"),
    beat("He raised his glass. To the happy couple.", "banquet", "close", [ch("groom", "smile")], spot=0),
    beat("Then he dropped the mic.", "banquet", "medium", [ch("groom", "stern", hold="mic")], spot=0, impact="dropped", fxs=[fx("burst", "dropped", "groom")]),
    beat("He grabbed his suitcase, and the honeymoon tickets.", "banquet", "wide", [ch("groom", "smile", action="walk", hold="suitcase")], spot=2,
         mood="upbeat"),
    beat("Best wedding ever. For one guest.", "airport", "close", [ch("groom", "grin", hold="ticket")], spot=0, light="golden", mood="warm",
         trans="xfade", fxs=[fx("sparkle", "guest", "groom")]),
])

for name, d in plans.items():
    plan = {"version": 1, "title": d["title"], "lang": "en", "style": "storybook", "environment": d["env"], "seed": d["seed"], "graphics": "full",
            "cast": d["cast"], "beats": d["beats"], "verifiedClaims": d["claims"], "creativeHooks": [d["beats"][0]["narration"], d["beats"][-1]["narration"]]}
    json.dump(plan, open(os.path.join(HERE, name + ".json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(name, sum(len(b["narration"].split()) for b in d["beats"]), "words")
