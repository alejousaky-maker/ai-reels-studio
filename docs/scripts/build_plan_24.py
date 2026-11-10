"""Short 24 "The Fortnite Pirate Token" (Loophole Lou style, pro cut, AI backdrops, RicksClips-style acting).
Parody: a hypothetical unofficial token; the real game studio appears only as generic lawyers (no real people, no logos).
Run: python docs/scripts/build_plan_24.py -> plan_24_pirate_token.json + STORY_24_pirate_token.md"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", ".."))
sys.path.insert(0, HERE)
from engine.story.schema import Plan  # noqa: E402
from build_plans_14_19 import C, S, B, fx, pc  # noqa: E402

PLAN = dict(
    title="The Fortnite Pirate Token", environment="trading", seed=97, backdrops="ai", captions=True,
    cast=[{"id": "cap", "name": "Pirate captain", "role": "piratecaptain"}, {"id": "gam", "name": "Gamer trader", "role": "streamer"},
          {"id": "law", "name": "Studio lawyer", "role": "lawyer"}],
    claims=[("Parody: 'Fortnite Gold' is a hypothetical unofficial token invented for this comedy short; no real token, developer or ban is depicted as fact.", "fiction"),
            ("The real game studio is represented only by generic stickman lawyers; no real executive is shown.", "fiction")],
    beats=[
        B("What would happen if internet pirates launched an unofficial crypto token called Fortnite Gold? Absolute chaos.",
          "trading", "wide", "night", "upbeat", [C("cap", "cheer", "starry", "goldcoin")], camMove="whip", impactWord="chaos",
          pieces=[pc("ship", "behind", scale=0.35, move="toward"), pc("ticker", "left", label="FORTNITE GOLD ▲ 4200%")],
          backdrop="a pirate ship bursting through the big glass window of a neon crypto stock exchange, shattered glass, green tickers",
          shots=[S("Fortnite", shot="extreme", characters=[C("cap", expr="starry", holding="goldcoin")], fx=[fx("sparkle", "Gold", "cap")], camMove="push"),
                 S("Absolute", shot="dutch", characters=[C("cap", "jump", "laugh", "goldcoin")], fx=[fx("burst", "chaos", "cap"), fx("money", "Absolute", "cap")], camMove="orbit")]),
        B("For years, gamers wanted a token to trade skins freely, without paying a thirty percent platform fee.",
          "gameroom", "medium", "night", "curious", [C("gam", "sitchair", "skeptical")], transition="whip", camMove="push",
          pieces=[pc("monitor", "left", label="PLATFORM FEE|30%")],
          shots=[S("without", shot="close", characters=[C("gam", "stand", "evil", "cutlass")], fx=[fx("burst", "fee", "gam")], impactWord="fee", camMove="whip")]),
        B("So some anonymous devs launched a pirate token overnight, promising it would become the official currency of Tilted Towers.",
          "trading", "close", "night", "upbeat", [C("cap", "point", "smug", "phone")], hud="panel", hudText="☠ FORTNITE GOLD|PRICE ▲ 4,200%|TO THE MOON!",
          camMove="push", shots=[S("promising", shot="medium", hud=None, characters=[C("cap", "hips", "proud")], pieces=[pc("ticker", "behind", label="FTG ▲ TO THE MOON")], camMove="crane_up")]),
        B("Within twenty-four hours, millions of players piled in, turning a meme coin into a multi-million-dollar digital treasure island.",
          "park", "wide", "day", "upbeat", [C("gam", "cheer", "starry")], extras=6, extrasRole="streamer", extrasAction="dance", text="24 HOURS", textStyle="title",
          pieces=[pc("partybus", "behind", y=5, move="right", scale=0.9)], fx=[fx("money", "millions", "gam")], camMove="crane_up",
          backdrop="a colorful video-game island with a treasure chest of glowing gold coins, palm trees and a festival crowd area",
          shots=[S("treasure", shot="close", characters=[C("gam", expr="love", holding="goldcoin")], extras=0, fx=[fx("sparkle", "treasure", "gam")], camMove="push")]),
        B("Suddenly, you weren't playing to win. You were playing to arbitrage liquidity pools on Discord.",
          "gameroom", "medium", "night", "tense", [C("gam", "sitchair", "sweat", "controller")], hud="panel", hudText="LIQUIDITY POOL|APY 9,000%!", camMove="push",
          shots=[S("You", shot="extreme", hud=None, characters=[C("gam", expr="crazy")], camMove="push")]),
        B("Then the game studio's lawyers finished their morning coffee and chose absolute legal violence.",
          "office", "medium", "day", "tense", [C("law", "stand", "bored", "coffee")], transition="zoom", camMove="push", impactWord="violence",
          shots=[S("chose", shot="worm", characters=[C("law", "stand", "angry", "gavel")], fx=[fx("burst", "violence", "law")], camMove="push")]),
        B("A ten-page cease-and-desist letter hit the developers faster than a pump shotgun headshot.",
          "gameroom", "medium", "night", "tense", [C("cap", "sitchair", "smug", "phone")], fx=[fx("product", "letter", "cap", "envelope")], camMove="truck_right",
          shots=[S("faster", shot="close", characters=[C("cap", "fall", "dazed")], fx=[fx("stars", "headshot", "cap")], impactWord="headshot", camMove="whip")]),
        B("And just like that, the anonymous creators deleted their accounts, cashed out, and vanished into thin air.",
          "trading", "medium", "night", "tense", [C("cap", expr="scared")], pieces=[pc("ticker", "behind", label="FORTNITE GOLD ▼ 99.9%")], camMove="crane_up",
          shots=[S("cashed", shot="close", characters=[C("cap", "panic", "dazed")], hud="panel", hudText="FORTNITE GOLD|▼ 99.9%!", fx=[fx("money", "cashed", "cap")]),
                 S("vanished", shot="wide", characters=[], hud=None, fx=[fx("puff", "vanished", None)], camMove="pull")]),
        B("Players who thought they were crypto tycoons were suddenly left holding literal digital garbage.",
          "gameroom", "close", "night", "warm", [C("gam", expr="sad", holding="phone")], camMove="push",
          shots=[S("garbage", shot="extreme", characters=[C("gam", expr="cry")], fx=[fx("product", "garbage", "gam", "moth")])]),
        B("Even worse, anyone caught wearing the pirate token skin got banned from the lobby.",
          "park", "medium", "day", "tense", [C("cap", "stand", "broken")], hud="panel", hudText="LOBBY|BANNED!", text="BANNED", textStyle="title",
          backdrop="a bright video-game lobby stage with neon lights", camMove="whip"),
        B("Turns out, fighting a multi-billion-dollar gaming giant with a pirate meme coin is a great way to lose your lunch money.",
          "shops", "medium", "day", "warm", [C("gam", "sit", "sad")], envVariant="open", camMove="pull", crowd=True,
          pieces=[pc("cardbox", "on"), pc("board", "right", label="WILL TRADE|PIXEL SWORDS|FOR SANDWICHES")],
          backdrop="outside a small convenience store with a glowing shop window"),
        B("The metaverse isn't the Wild West. It's a gated community owned by guys in suits.",
          "island", "wide", "golden", "tense", [], extras=5, extrasRole="guard", camMove="crane_up", transition="dissolve",
          backdrop="a tropical game island completely surrounded by giant grey concrete walls with barbed wire and watchtowers",
          shots=[S("gated", shot="medium", extras=4, extrasRole="guard", camMove="truck_left")]),
        B("So stick to regular V-Bucks. At least when you waste them on a bad emote, you actually get to dance.",
          "gameroom", "medium", "night", "upbeat", [C("gam", "dance", "starry")], camMove="orbit", fx=[fx("sparkle", "dance", "gam")],
          shots=[S("At", shot="close", characters=[C("gam", "dance", "laugh")], fx=[fx("confetti", "dance", "gam")], camMove="push")]),
        B("Send this to that friend who falls for every single crypto scam on the internet.", "trading", "wide", "night", "warm", [], hud="outro", transition="dissolve"),
    ])


def main():
    p = dict(PLAN)
    claims = p.pop("claims")
    plan = {"version": 1, "lang": "en", "style": "storybook", "graphics": "full", **p, "verifiedClaims": [{"text": t, "status": s} for t, s in claims]}
    P = Plan.model_validate(plan)
    with open(os.path.join(HERE, "plan_24_pirate_token.json"), "w", encoding="utf-8") as f:
        json.dump(json.loads(P.model_dump_json(exclude_defaults=True)), f, indent=1, ensure_ascii=False)
    words = sum(len(b.narration.split()) for b in P.beats)
    md = [f"# {P.title}  (`plan_24_pirate_token.json`, {len(P.beats)} scenes, {words} words)", "",
          "Parody. Voice `am_eric*0.7+am_fenrir*0.3` @1.15, AI backdrops, captions on. `→` = cut inside the sentence.", ""]
    for i, b in enumerate(P.beats, 1):
        cut = "".join(f" → **{s.at}**: {s.shot or b.shot}" for s in b.shots)
        who = ", ".join(f"{c.id} ({c.action}, {c.expr}{', ' + c.holding if c.holding else ''})" for c in b.characters) or "no cast"
        md.append(f"{i}. *{b.environment} · {b.shot} · {b.light}{' · ' + b.camMove if b.camMove else ''}{' · HUD ' + b.hud if b.hud else ''}* — “{b.narration}” — {who}{cut}")
    with open(os.path.join(HERE, "STORY_24_pirate_token.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(md))
    print("ok", len(P.beats), "beats", words, "words")


if __name__ == "__main__":
    main()
