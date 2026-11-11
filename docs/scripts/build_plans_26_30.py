"""GTA 6 shorts 26-30 (Loophole Lou style, pro cut, 3D built sets + CC0 Kenney models, RicksClips-style acting).
Parody: the studio, the FBI and the developers are generic stickmen (no real people, no logos).
Run: python docs/scripts/build_plans_26_30.py -> plan_26..30 JSON + STORIES_26-30.md"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", ".."))
sys.path.insert(0, HERE)
from engine.story.schema import Plan  # noqa: E402
from build_plans_14_19 import C, S, B, fx, pc  # noqa: E402

FICTION = [("Comedy parody about GTA 6 fandom; every event is invented. The studio, agents and developers are generic stickmen.", "fiction")]
OUTRO = lambda line: B(line, "gameroom", "wide", "night", "warm", [], hud="outro", transition="dissolve")
PLANS = {}

# ---------------------------------------------------------------- 26  The Global Internet Blackout (v2)
PLANS["plan_26_blackout2"] = dict(
    title="The Day GTA 6 Melted the Internet", environment="gameroom",
    cast=[{"id": "me", "name": "Esports gamer", "role": "esports"}, {"id": "tech", "name": "Technician", "role": "technician"}],
    beats=[
        B("The second GTA 6 unlocks at midnight, a hundred million downloads will literally melt the global internet.",
          "gameroom", "close", "night", "tense", [C("me", "point", "sweat")], hud="panel", hudText="12:00 AM|[ DOWNLOAD ]", camMove="whip", impactWord="melt",
          backdrop="a dark gamer bedroom at midnight, glowing RGB strips, a huge monitor showing a download button",
          shots=[S("hundred", shot="extreme", hud=None, characters=[C("me", expr="starry")], fx=[fx("burst", "downloads", "me")], camMove="push"),
                 S("melt", environment="datacenter", envVariant="red", shot="wide", characters=[], hud=None, fx=[fx("sparks", "melt", None)], camMove="truck_right")]),
        B("Every gamer on Earth clicks download at the exact same microsecond, sending a digital tsunami through undersea cables.",
          "gameroom", "wide", "night", "tense", [], hud="world", hudText="EVERYONE AT ONCE|100,000,000 DOWNLOADS", transition="zoom"),
        B("Inside global data centers, server racks start glowing like nuclear reactors.",
          "datacenter", "wide", "night", "tense", [C("tech", "run", "dazed", "extinguisher")], envVariant="red", extras=3, extrasRole="technician", extrasAction="march",
          pieces=[pc("rack", "left", label="red", shake=1.0), pc("rack", "right", label="red", shake=1.0)], fx=[fx("sparks", "glowing", "tech")], camMove="follow",
          shots=[S("nuclear", shot="close", characters=[C("tech", "panic", "scared", "extinguisher")], extras=0, fx=[fx("burst", "reactors", "tech")], camMove="push")]),
        B("Right as the progress bar hits ninety-nine percent, the global network flatlines.",
          "gameroom", "medium", "night", "tense", [C("me", "sitchair", "starry")], hud="bar", hudText="DOWNLOADING GTA 6|97|99.9", camMove="push",
          shots=[S("flatlines", shot="extreme", hud=None, characters=[C("me", expr="broken", holding="router")], fx=[fx("puff", "flatlines", "me")], impactWord="flatlines", camMove="whip")]),
        B("Within minutes, society returns to the Stone Age, and desperate gamers try running their routers off raw potatoes.",
          "gameroom", "medium", "night", "warm", [C("me", "stand", "sweat", "potato")], look="warm", camMove="crane_up", envVariant="candles",
          backdrop="a dark bedroom lit only by candles, a desk with tangled ethernet cables",
          shots=[S("desperate", environment="shops", envVariant="open", light="night", shot="wide", characters=[C("me", "run", "crazy", "potato")], extras=5, extrasRole="streamer", extrasAction="march", camMove="truck_left"),
                 S("potatoes", environment="gameroom", envVariant="candles", shot="close", characters=[C("me", expr="starry", holding="potato")], extras=0, fx=[fx("sparks", "potatoes", "me")], camMove="push")]),
        B("The potato gives zero megabytes, just the smell of french fries.",
          "gameroom", "close", "night", "warm", [C("me", expr="cry", holding="potato")], fx=[fx("steam", "smell", "me")], camMove="pull"),
        OUTRO("Send this to the friend whose Wi-Fi dies every night."),
    ])

# ---------------------------------------------------------------- 27  The Trailer Analyzed by the FBI
PLANS["plan_27_fbi_trailer"] = dict(
    title="Gamers vs the FBI", environment="gameroom",
    cast=[{"id": "det", "name": "Detective gamer", "role": "detective"}, {"id": "fbi", "name": "Agent", "role": "agent"},
          {"id": "dev", "name": "Developer", "role": "streamer", "palette": "#3f6fb5"}],
    beats=[
        B("GTA 6 fans are so desperate for news that they analyzed pixel reflections better than the FBI.",
          "gameroom", "extreme", "night", "tense", [C("det", "point", "smug")], pieces=[pc("monitor", "left", label="ENHANCE x9000")], camMove="push", impactWord="FBI",
          shots=[S("analyzed", shot="medium", characters=[C("det", "point", "skeptical", "magnifier")], camMove="truck_right"),
                 S("FBI", shot="close", characters=[C("fbi", expr="shock")], environment="office", fx=[fx("burst", "FBI", "fbi")], camMove="whip")]),
        B("While normal people watched a ninety-second trailer, gamers turned their bedrooms into forensic crime labs.",
          "gameroom", "wide", "night", "curious", [C("det", "stand", "crazy", "magnifier")], pieces=[pc("corkboard", "behind", label="IT'S ALL CONNECTED")],
          camMove="pull", backdrop="a dark bedroom covered wall to wall with red yarn, sticky notes and crushed energy cans",
          shots=[S("forensic", shot="close", characters=[C("det", expr="crazy", holding="magnifier")], fx=[fx("sparkle", "crime", "det")], camMove="push")]),
        B("One guy counted the exact freckles on a character's neck and cross-referenced the trailer's moon phase with NASA's calendar.",
          "gameroom", "medium", "night", "curious", [C("det", "point", "sweat", "magnifier")], pieces=[pc("board", "right", label="14 MOLES|= NOVEMBER")], camMove="orbit",
          shots=[S("moon", shot="wide", characters=[C("det", "point", "starry")], pieces=[pc("calendar", "right", label="NOV")],
                   backdrop="a bedroom window at night with a big full moon and a telescope", camMove="crane_up")]),
        B("Even actual intelligence agents watching through his webcam started taking notes.",
          "office", "medium", "night", "whimsical", [C("fbi", "stand", "shock", "clipboard")], camMove="push",
          backdrop="a dark surveillance office with many monitors",
          shots=[S("notes", shot="close", characters=[C("fbi", expr="love", holding="clipboard")], hud="panel", hudText="NOTE TO SELF|HIRE THIS GUY", camMove="push")]),
        B("The funniest part? The crazy moon theory actually nailed the release window better than the studio's own marketing team.",
          "office", "medium", "day", "tense", [C("dev", "panic", "sweat")], extras=2, extrasRole="streamer", camMove="whip",
          backdrop="a game studio meeting room with a whiteboard and a big calendar",
          shots=[S("nailed", shot="close", characters=[C("dev", expr="broken")], extras=0, fx=[fx("burst", "nailed", "dev")], camMove="push"),
                 S("marketing", shot="wide", characters=[C("dev", "shrug", "nervous")], pieces=[pc("calendar", "left", label="RELEASE?")], camMove="truck_left")]),
        B("Never underestimate a gamer with zero news and too much free time.",
          "gameroom", "medium", "night", "warm", [C("det", "fall", "dazed")], pieces=[pc("snacks", "right", scale=1.3)], camMove="crane_up",
          shots=[S("too", shot="extreme", characters=[C("det", expr="dazed")], fx=[fx("stars", "time", "det")])]),
        OUTRO("Tag your most delusional friend."),
    ])

# ---------------------------------------------------------------- 28  The Infiltrator
PLANS["plan_28_infiltrator"] = dict(
    title="Harder Than Area 51", environment="office",
    cast=[{"id": "spy", "name": "Spy gamer", "role": "spy"}, {"id": "grd", "name": "Guard", "role": "guard"}],
    beats=[
        B("Getting an early copy of GTA 6 is officially harder than breaking into Area 51.",
          "shops", "dutch", "night", "tense", [C("spy", "stand", "smug")], camMove="crane_up", impactWord="Area", envVariant="hq", crowd=False,
          backdrop="a high-security game studio fortress at night with searchlights, barbed wire and a sign GAME STUDIO HQ",
          shots=[S("breaking", shot="extreme", characters=[C("spy", expr="evil")], camMove="push")]),
        B("After past leaks, security got so tight that one desperate fan tried sneaking in disguised as an office plant.",
          "office", "medium", "day", "whimsical", [C("grd", "stand", "skeptical")], camMove="push",
          backdrop="a bright modern office hallway with glass doors and potted plants",
          shots=[S("disguised", shot="wide", characters=[C("spy", "walk", "sweat"), C("grd", "stand", "bored")], focus="spy",
                   pieces=[pc("plantpot", "on", dz=-0.1)], camMove="truck_right"),
                 S("plant", shot="close", characters=[C("spy", expr="smug")], pieces=[pc("plantpot", "on")], camMove="push")]),
        B("He dodged motion cameras, bribed the janitor with Shark Cards, and backflipped through a hallway of red laser beams.",
          "office", "medium", "night", "tense", [C("spy", "jump", "sweat")], camMove="whip", envVariant="lasers", fx=[fx("sparks", "dodged", "spy")],
          backdrop="a dark corridor crisscrossed with glowing red laser beams",
          shots=[S("bribed", shot="close", characters=[C("spy", "point", "wink", "card")], camMove="push"),
                 S("backflipped", shot="worm", characters=[C("spy", "jump", "scared")], fx=[fx("sparks", "laser", "spy")], camMove="orbit")]),
        B("Finally, he reached the development room, only to find the game locked inside a ten-ton nuclear vault.",
          "office", "wide", "night", "tense", [C("spy", "stand", "dazed")], camMove="pull", impactWord="vault", envVariant="vault",
          backdrop="a massive circular steel bank vault door with padlocks, biometric scanners and two laser turrets, glowing pedestal",
          shots=[S("ten-ton", shot="extreme", characters=[C("spy", expr="dazed")], fx=[fx("stars", "vault", "spy")], camMove="push")]),
        B("He cracked the code, grabbed the golden USB drive, and plugged it in, just to find a Rickroll video from the developers.",
          "office", "close", "night", "upbeat", [C("spy", "stand", "starry", "usb")], fx=[fx("sparkle", "golden", "spy")], camMove="push", envVariant="vault",
          backdrop="a vault room with a glowing pedestal",
          shots=[S("just", shot="medium", characters=[C("spy", "panic", "broken")], hud="police", fx=[fx("burst", "Rickroll", "spy")], impactWord="Rickroll", camMove="whip")]),
        B("Looks like we're waiting like everyone else.",
          "shops", "medium", "night", "warm", [C("spy", "fall", "sad", "controller"), C("grd", "walk", "stern")], focus="spy", camMove="truck_left", envVariant="hq", crowd=False,
          backdrop="the front door of a fortress-like game studio at night, searchlights"),
        OUTRO("Send this to a friend who'd risk prison for early access."),
    ])

# ---------------------------------------------------------------- 29  The Relationship Loyalty Test
PLANS["plan_29_loyalty_test"] = dict(
    title="It's Either That Game or Me", environment="apartment",
    cast=[{"id": "me", "name": "Gamer", "role": "streamer"}, {"id": "gf", "name": "Girlfriend", "role": "girlfriend"}],
    beats=[
        B("GTA 6 is about to cause more breakups in one weekend than every dating app in history combined.",
          "apartment", "two_shot", "day", "upbeat", [C("me", "stand", "love", "box"), C("gf", "hips", "angry")], focus="me", camMove="whip", impactWord="breakups",
          fx=[fx("burst", "breakups", "gf")], shots=[S("dating", shot="close", characters=[C("gf", expr="angry")], camMove="push")]),
        B("The moment the game boots up, millions of girlfriends will drop the ultimate trap: \"It's either that game, or me.\"",
          "apartment", "medium", "day", "tense", [C("gf", "point", "angry", talk=True)], pieces=[pc("tv", "left", label="~game")], camMove="push",
          shots=[S("either", shot="extreme", characters=[C("gf", expr="angry", talk=True)], impactWord="me", camMove="push")]),
        B("Our hero looks at his three-year relationship, then looks at twelve years of waiting for Vice City.",
          "apartment", "extreme", "day", "curious", [C("me", expr="skeptical")], camMove="push",
          shots=[S("twelve", characters=[C("me", expr="starry")], hud="panel", hudText="3 YEARS  vs  12 YEARS|DECISION: OBVIOUS", camMove="orbit")]),
        B("Instead of arguing, he becomes the most helpful gentleman on Earth, packing her bags in four seconds flat.",
          "apartment", "medium", "day", "upbeat", [C("me", "run", "proud", "suitcase")], camMove="follow", text="4 SECONDS", textStyle="title",
          shots=[S("packing", shot="close", characters=[C("me", "stand", "smug", "suitcase")], fx=[fx("puff", "flat", "me")], camMove="whip")]),
        B("He politely loads her luggage into a taxi, hands the driver a twenty, and waves goodbye so he doesn't miss the opening cutscene.",
          "suburb", "wide", "day", "whimsical", [C("me", "wave", "laugh"), C("gf", expr="shock")], focus="me", pieces=[pc("car", "left", label="taxi", move="left")], camMove="truck_right",
          crowd=False, shots=[S("waves", shot="close", characters=[C("me", "wave", "laugh")], camMove="push")]),
        B("True love is temporary, Vice City is forever.",
          "apartment", "medium", "night", "warm", [C("me", "sitchair", "starry", "controller")], pieces=[pc("tv", "left", label="~game")], camMove="orbit",
          fx=[fx("sparkle", "forever", "me")]),
        OUTRO("Send this to your bro before he gets trapped."),
    ])

# ---------------------------------------------------------------- 30  Graphics So Realistic They Melt Your TV
PLANS["plan_30_melting_tv"] = dict(
    title="Graphics So Real They Melt Your TV", environment="gameroom",
    cast=[{"id": "me", "name": "Gamer", "role": "capgamer"}, {"id": "mes", "name": "Gamer (sunglasses)", "role": "capgamer", "shades": True}],
    beats=[
        B("GTA 6 graphics are so realistic that my TV started sweating just rendering the main menu.",
          "gameroom", "medium", "night", "whimsical", [C("me", "stand", "shock", "controller")], pieces=[pc("tv", "left", label="~game|MAIN MENU", shake=0.4)],
          fx=[fx("steam", "sweating", "me")], camMove="push",
          shots=[S("sweating", shot="insert", pieces=[pc("tv", "on", label="~game|MAIN MENU", shake=0.6)], fx=[fx("splash", "sweating", None)], camMove="push")]),
        B("The second the Vice City sun loaded on screen, the ray-tracing was so bright it gave me a real-life sunburn.",
          "gameroom", "close", "golden", "upbeat", [C("mes", "stand", "squint")], look="warm", camMove="push", impactWord="sunburn",
          shots=[S("bright", shot="extreme", characters=[C("me", expr="pained")], fx=[fx("sparkle", "sunburn", "me")], camMove="push")]),
        B("Then I walked my character onto the beach, and real ocean water and sand started pouring out of the HDMI port.",
          "gameroom", "wide", "day", "upbeat", [C("me", "panic", "scared", "controller")], camMove="crane_up", envVariant="flood",
          backdrop="a gamer bedroom flooded with ocean water and sand pouring out of a TV, floating pizza boxes",
          fx=[fx("splash", "water", "me"), fx("product", "sand", "me", "flamingo")],
          shots=[S("pouring", shot="close", characters=[C("me", "panic", "crazy", "controller")], fx=[fx("splash", "HDMI", "me")], camMove="whip")]),
        B("My base console couldn't take the physics anymore. It popped open the disc drive and waved a tiny white flag.",
          "gameroom", "insert", "night", "whimsical", [C("me", expr="sad")], pieces=[pc("console", "on", label="hot", shake=1.0)], camMove="push",
          shots=[S("waved", shot="medium", pieces=[pc("console", "left", scale=1.4, label="flag")], characters=[C("me", "shrug", "sad")], camMove="orbit")]),
        B("When I got a five-star wanted level in the game, real helicopters started circling my actual apartment.",
          "gameroom", "medium", "night", "tense", [C("me", "sit", "crazy", "poolring")], hud="police", camMove="orbit", envVariant="flood",
          backdrop="a flooded gamer bedroom at night with red and blue police lights flashing through the window",
          shots=[S("helicopters", shot="worm", characters=[C("me", "sit", "scared", "controller")], camMove="crane_up")]),
        B("My house is ruined, my TV is melted. Ten out of ten, game of the century.",
          "gameroom", "close", "night", "warm", [C("me", "cheer", "starry", "controller")], fx=[fx("confetti", "Ten", "me")], camMove="pull",
          shots=[S("Ten", shot="extreme", characters=[C("me", expr="wink")], hud="panel", hudText="REVIEW|10/10", camMove="push")]),
        OUTRO("Tag a friend whose console is going to explode."),
    ])


def main():
    md = ["# GTA 6 shorts 26–30 (Loophole Lou style, pro cut, 3D built sets + CC0 Kenney models)", "",
          "Voice `am_eric*0.7+am_fenrir*0.3` @1.15. Parody; generic studio / agents / developers. `→` = cut inside the sentence.", ""]
    for i, (name, p) in enumerate(PLANS.items()):
        plan = {"version": 1, "lang": "en", "style": "storybook", "graphics": "full", "captions": True, "backdrops": "3d", "seed": 111 + 7 * i, **p,
                "verifiedClaims": [{"text": t, "status": s} for t, s in FICTION]}
        P = Plan.model_validate(plan)
        with open(os.path.join(HERE, name + ".json"), "w", encoding="utf-8") as f:
            json.dump(json.loads(P.model_dump_json(exclude_defaults=True)), f, indent=1, ensure_ascii=False)
        words = sum(len(b.narration.split()) for b in P.beats)
        md += [f"## {P.title}  (`{name}.json`, {len(P.beats)} scenes, {words} words)", ""]
        for j, b in enumerate(P.beats, 1):
            cut = "".join(f" → **{s.at}**: {s.shot or b.shot}" for s in b.shots)
            who = ", ".join(f"{c.id} ({c.action}, {c.expr}{', ' + c.holding if c.holding else ''})" for c in b.characters) or "no cast"
            md.append(f"{j}. *{b.environment} · {b.shot} · {b.light}{' · ' + b.camMove if b.camMove else ''}{' · HUD ' + b.hud if b.hud else ''}* — “{b.narration}” — {who}{cut}")
        md.append("")
    with open(os.path.join(HERE, "STORIES_26-30.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(md))
    print("ok")


if __name__ == "__main__":
    main()
