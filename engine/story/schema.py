"""Typed contracts (Pydantic v2) for the editable script plan. The plan is what humans / Ollama / Claude-assisted mode
write; the director turns plan + real voice timings into the engine storyboard (frame-exact, validated)."""
from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator

Expr = Literal["neutral", "stern", "grin", "laugh", "whistle", "nervous", "shock", "relief", "relief_open", "dazed", "pained", "smile", "smile_closed", "lick"]
Action = Literal["stand", "walk", "dance", "sit", "wave", "march", "stroll"]
Shot = Literal["wide", "medium", "close", "low", "high", "two_shot", "insert"]
Light = Literal["day", "golden", "night"]
Mood = Literal["whimsical", "curious", "tense", "warm", "upbeat"]
Product = Literal["coffee", "croissant", "bread", "cake", "lightbulb", "question", "exclaim", "heart", "clock", "book", "note", "scroll"]
Role = Literal["villager_woman", "villager_man", "kid", "official", "musician", "baker", "barista", "scholar", "customer", "elder", "worker"]


class Reaction(BaseModel):
    word: str
    expr: Expr


class BeatCharacter(BaseModel):
    id: str
    action: Action = "stand"
    expr: Expr = "neutral"
    react: Optional[Reaction] = None
    holding: Optional[Product] = None


class BeatFx(BaseModel):
    kind: Literal["burst", "stars", "notes", "puff", "product", "steam", "sparkle"]
    product: Optional[Product] = None
    word: Optional[str] = None
    on: Optional[str] = None  # character id it belongs to (above the head)


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
    transition: Literal["cut", "flash", "xfade"] = "cut"
    text: Optional[str] = None
    textStyle: Literal["title", "cta", "label"] = "label"
    atShop: bool = False
    environment: Optional[Literal["village_square", "park", "street", "market", "interior", "harbour"]] = None  # per-beat location
    visual: Optional[str] = None  # free description for humans / QA (what we should SEE)

    @field_validator("narration")
    @classmethod
    def _strip(cls, v: str) -> str:
        return " ".join(v.split())


class CastSpec(BaseModel):
    id: str = Field(pattern=r"^[a-z][a-z0-9_]{0,23}$")
    name: str = ""
    role: Role = "villager_man"
    palette: Optional[str] = None  # main colour override (#rrggbb)


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
    environment: Literal["village_square", "park", "street", "market", "interior", "harbour"] = "village_square"
    seed: int = 7
    cast: list[CastSpec]
    beats: list[Beat] = Field(min_length=1, max_length=40)
    verifiedClaims: list[Claim] = Field(default_factory=list)
    creativeHooks: list[str] = Field(default_factory=list)
    brand: Optional[BrandSpec] = None
    cta: Optional[str] = None
    captions: bool = False

    def full_text(self) -> str:
        return " ".join(b.narration for b in self.beats)
