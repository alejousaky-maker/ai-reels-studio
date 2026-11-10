"""Typed contracts (Pydantic v2) for the editable script plan. The plan is what humans / Ollama / Claude-assisted mode
write; the director turns plan + real voice timings into the engine storyboard (frame-exact, validated)."""
from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator

Expr = Literal["neutral", "stern", "grin", "laugh", "whistle", "nervous", "shock", "relief", "relief_open", "dazed", "pained", "smile", "smile_closed", "lick", "starry", "crazy", "squint", "broken", "sweat", "sleepy",
              "smug", "skeptical", "angry", "sad", "cry", "wink", "bored", "scared", "love", "evil", "proud", "confused"]
Action = Literal["stand", "walk", "dance", "sit", "wave", "march", "stroll", "fall", "stretch", "cheer", "point",
                 "run", "jump", "panic", "shrug", "hips", "sitchair"]
Shot = Literal["wide", "medium", "close", "low", "high", "two_shot", "insert", "extreme", "worm", "dutch"]
Light = Literal["day", "golden", "night"]
Mood = Literal["whimsical", "curious", "tense", "warm", "upbeat"]
Product = Literal["coffee", "croissant", "bread", "cake", "lightbulb", "question", "exclaim", "heart", "clock", "book", "note", "scroll", "map", "globe", "wine", "spear", "stake", "phone", "tablet", "wifi", "key", "camera", "card", "fish", "receipt", "box",
                  "snake", "coins", "mic", "earbuds", "gpsmap", "suitcase", "folder", "ticket", "controller", "can", "pizza",
                  "thermometer", "moth", "cash", "noodles", "extinguisher", "potato", "battery", "diploma", "sicknote", "router",
                  "newspaper", "pickaxe", "shovel", "bagel", "lettuce", "pillow", "wrench", "check", "trident", "clipboard", "gavel", "envelope", "cutlass", "goldcoin", "plug", "fryingpan", "plate", "grass"]
Role = Literal["villager_woman", "villager_man", "kid", "official", "musician", "baker", "barista", "scholar", "customer", "elder", "worker",
              "explorer", "king", "queen", "sailor", "islander", "greek", "hero", "trojan", "prisoner", "giant",
              "businessman", "boss", "woman", "towelguy", "lawyer", "fisher", "tourist",
              "soldier", "major", "emu", "farmer", "caesar", "pirate", "captain", "raj_official", "local", "athlete",
              "hoodie", "robe", "groom", "bride", "guest", "pajamas", "gamer",
              "streamer", "broker", "doctor", "technician", "esports", "oldgamer", "graduate", "teen", "officeguy", "bathrobe", "brokeguy", "wife", "capgamer",
              "engineer", "accountant", "driver", "cop", "chef", "stocker", "ballerina", "tollman", "pilot", "sleeper", "commuter", "skipper", "piratecaptain", "guard"]
Env = Literal["village_square", "park", "street", "market", "interior", "harbour", "beach", "ocean", "troy", "cave", "throne",
              "apartment", "bathroom", "office", "hotel", "airport", "suburb", "lake", "resort",
              "outback", "cabin", "bedroom", "kitchen", "banquet", "gameroom", "shops", "trading", "clinic", "datacenter", "tunnel", "warehouse", "canal", "island", "bridge"]
PieceKind = Literal["horse", "ship", "galley", "chalkboard", "sheep", "tent", "scale", "boxes", "car", "van", "poster",
                    "lewis", "crates", "snakes", "board", "screen", "finish", "truck", "booth", "tumbleweed", "trafficlight", "snacks",
                    "cryo", "redarrow", "console", "sofa", "fridge", "bed", "doghouse", "tv", "calendar", "hospitalbed", "heartmonitor",
                    "pole", "monitor", "cardbox", "desk", "rack", "signs", "ticker",
                    "semi", "forklift", "fruitpile", "containership", "tugboat", "steamshovel", "mosquito", "mixer", "airplane", "excavator",
                    "rockpile", "tetrapods", "departures", "escalator", "pipes", "cashcounter", "blueprint", "subwaymap", "ribbon", "oldcar", "partybus"]


class Piece(BaseModel):
    """a big painted set piece in the shot, placed relative to the stage: behind / left / right / far / front"""
    kind: PieceKind
    where: Literal["behind", "left", "right", "far", "front", "on"] = "behind"
    dx: float = 0.0   # extra lateral offset (m, + = screen right)
    dz: float = 0.0   # extra depth offset (m, + = away from the camera)
    scale: Optional[float] = Field(None, ge=0.3, le=3.0)
    y: Optional[float] = None
    mirror: bool = False
    move: Optional[Literal["left", "right", "toward", "away"]] = None
    label: Optional[str] = Field(None, max_length=40)
    spin: Optional[float] = None   # rad/s, rolling pieces (tumbleweed)
    lift: Optional[float] = None   # rise to this height across the shot (blast-off)
    shake: Optional[float] = Field(None, ge=0, le=2)   # violent vibration   # text on a board / booth / crates; screen picture "photos" | "hallway"


class Reaction(BaseModel):
    word: str
    expr: Expr


class BeatCharacter(BaseModel):
    id: str
    action: Action = "stand"
    expr: Expr = "neutral"
    react: Optional[Reaction] = None
    holding: Optional[Product] = None
    y: Optional[float] = Field(None, ge=0, le=8)   # standing height (up a pole, on a bed)
    talk: Optional[bool] = None   # lip-flap to the narration while it is on screen (auto for the lead in quoted lines)


class BeatFx(BaseModel):
    kind: Literal["burst", "stars", "notes", "puff", "product", "steam", "sparkle", "splash", "money", "confetti", "sparks", "dust"]
    product: Optional[Product] = None
    color: Optional[str] = Field(None, pattern=r"^#[0-9a-fA-F]{6}$")
    word: Optional[str] = None
    on: Optional[str] = None  # character id it belongs to (above the head)


CamMove = Literal["push", "pull", "truck_left", "truck_right", "orbit", "crane_up", "follow", "whip"]
Hud = Literal["rec", "phone", "news", "map", "panel", "bar", "police",
            "manhattan", "osaka", "panama", "world", "subway", "mud", "outro", "spot"]   # full-screen animated 2D maps / cross-sections / outro   # panel: "TITLE|row|row"; bar: "LABEL|from|to"


class SubShot(BaseModel):
    """a new picture INSIDE a sentence: cuts on `at` (a word of the beat's narration) and overrides what the clause shows.
    The voice stays one natural sentence; the picture follows every clause (reference: a new shot every 1.5-2.5 s)."""
    at: str
    shot: Optional[Shot] = None
    light: Optional[Light] = None
    environment: Optional[Env] = None
    envVariant: Optional[Literal["breach", "open", "day", "tvglow", "empty", "ward", "red", "night", "station", "dig", "dry", "aquarium", "build", "jam", "open"]] = None
    spot: Optional[int] = Field(None, ge=0, le=9)
    characters: Optional[list[BeatCharacter]] = None
    extras: Optional[int] = Field(None, ge=0, le=10)
    extrasAction: Optional[Action] = None
    extrasRole: Optional[Role] = None
    focus: Optional[str] = None
    fx: Optional[list[BeatFx]] = None
    impactWord: Optional[str] = None
    transition: Optional[Literal["cut", "flash", "xfade", "dissolve", "zoom", "whip"]] = None
    text: Optional[str] = None
    textStyle: Optional[Literal["title", "cta", "label"]] = None
    pieces: Optional[list[Piece]] = None
    camMove: Optional[CamMove] = None
    hud: Optional[Hud] = None
    hudText: Optional[str] = Field(None, max_length=140)
    visual: Optional[str] = None
    look: Optional[Literal["sepia", "bw", "cool", "warm"]] = None
    extrasHolding: Optional[Product] = None
    backdrop: Optional[str] = Field(None, max_length=300)
    crowd: Optional[bool] = None


class Beat(BaseModel):
    narration: str = Field(min_length=2, max_length=400)
    shot: Shot = "medium"
    light: Light = "day"
    mood: Mood = "whimsical"
    characters: list[BeatCharacter] = Field(default_factory=list)
    extras: int = Field(0, ge=0, le=10)
    extrasAction: Action = "stand"
    focus: Optional[str] = None
    fx: list[BeatFx] = Field(default_factory=list)
    impactWord: Optional[str] = None
    transition: Literal["cut", "flash", "xfade", "dissolve", "zoom", "whip"] = "cut"
    text: Optional[str] = None
    textStyle: Literal["title", "cta", "label"] = "label"
    atShop: bool = False
    environment: Optional[Env] = None  # per-beat location
    envVariant: Optional[Literal["breach", "open", "day", "tvglow", "empty", "ward", "red", "night", "station", "dig", "dry", "aquarium", "build", "jam", "open"]] = None   # troy: torn wall; cave: boulder rolled aside
    pieces: list[Piece] = Field(default_factory=list)
    extrasRole: Optional[Role] = None
    spot: Optional[int] = Field(None, ge=0, le=9)   # which staging spot of the location (camera side / view direction)
    visual: Optional[str] = None  # free description for humans / QA (what we should SEE)
    camMove: Optional[CamMove] = None   # a real camera move across the shot (push / pull reveal / truck / orbit / crane / follow / whip)
    hud: Optional[Hud] = None           # diegetic screen layer: camcorder REC, phone notification, breaking news, map
    hudText: Optional[str] = Field(None, max_length=140)
    look: Optional[Literal["sepia", "bw", "cool", "warm"]] = None   # film look of the shot (sepia = the past)
    backdrop: Optional[str] = Field(None, max_length=300)   # extra words for the AI-painted backdrop of this shot
    crowd: Optional[bool] = None   # force background stickmen on / off for this shot (default: only busy public places)
    extrasHolding: Optional[Product] = None
    shots: list[SubShot] = Field(default_factory=list, max_length=6)   # extra cuts inside the sentence, one per clause

    @field_validator("narration")
    @classmethod
    def _strip(cls, v: str) -> str:
        return " ".join(v.split())


class CastSpec(BaseModel):
    id: str = Field(pattern=r"^[a-z][a-z0-9_]{0,23}$")
    name: str = ""
    role: Role = "villager_man"
    palette: Optional[str] = None  # main colour override (#rrggbb)
    # keep one person recognisable across outfits (e.g. the wife later in a fishing vest)
    skin: Optional[str] = Field(None, pattern=r"^#[0-9a-fA-F]{6}$")
    hair: Optional[str] = Field(None, pattern=r"^#[0-9a-fA-F]{6}$")
    shades: Optional[bool] = None


class Claim(BaseModel):
    text: str
    status: Literal["verified", "uncertain", "fiction", "approved_by_client"] = "uncertain"
    source: Optional[str] = None


class BrandSpec(BaseModel):
    name: str
    primary: str = "#c8553d"
    secondary: str = "#f2c94c"
    text: str = "#ffffff"
    tagline: Optional[str] = None


class Plan(BaseModel):
    version: int = 1
    title: str
    lang: Literal["en", "es"] = "en"
    style: Literal["storybook", "cinematic_explainer", "minimal_stickman", "product_ad", "custom_brand"] = "storybook"
    environment: Env = "village_square"
    seed: int = 7
    cast: list[CastSpec]
    beats: list[Beat] = Field(min_length=1, max_length=40)
    verifiedClaims: list[Claim] = Field(default_factory=list)
    creativeHooks: list[str] = Field(default_factory=list)
    brand: Optional[BrandSpec] = None
    cta: Optional[str] = None
    captions: bool = True   # big word-by-word captions (pro Shorts look); the plan / form can switch them off
    # "full" = the Demo A look (default); "simple" = lighter sets, no lens blur/bloom, at most 2 background extras
    graphics: Literal["simple", "full"] = "full"
    # "ai" = every shot gets a backdrop painted locally by ComfyUI / FLUX (cast, pieces and effects stay 3D on top); "3d" = built sets
    backdrops: Literal["3d", "ai"] = "3d"
    crowd: bool = True   # background stickmen strolling / chatting in busy places (shops, streets, stations, bridges...)

    def full_text(self) -> str:
        return " ".join(b.narration for b in self.beats)
