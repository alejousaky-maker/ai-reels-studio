// AI Reels Studio — storyboard contract between the Python backend (Pydantic schema) and the Remotion engine.
// Everything here is plain serialisable JSON: the engine derives every frame from (storyboard, frame) only.
export type V3 = [number, number, number];
export type LightName = "day" | "golden" | "night";
export type EnvPreset = "village_square" | "park" | "street" | "market";

export type Expr = "neutral" | "stern" | "grin" | "laugh" | "whistle" | "nervous" | "shock" | "relief" | "relief_open" | "dazed"
  | "pained" | "smile" | "smile_closed" | "lick";

export type OutfitSpec = {
  jacket: string; pants: string; boots: string;
  hat?: "tophat" | "bonnet" | "cap" | "hair" | null; hair?: string; cap?: string;
  skin?: string; dress?: string; moustache?: string; build?: "adult" | "stout" | "kid"; buttons?: string; sash?: string; belt?: string | null;
};
export type CastMember = { id: string; name?: string; outfit: OutfitSpec; scale?: number };

export type ExprKey = { frame: number; expr: Expr };
export type ActorSpec = {
  castId: string; x: number; z: number;
  /** "dance" = stroll cycle + hop + arm waves */
  mode?: "stand" | "stroll" | "sit" | "march" | "dance";
  expr?: Expr; exprKeys?: ExprKey[];
  /** walk from (x, z) to walkTo between walkFrames[0] and walkFrames[1] */
  walkTo?: [number, number]; walkFrames?: [number, number];
  wave?: boolean; look?: -1 | 0 | 1; facing?: -1 | 0 | 1; tilt?: number;
  /** product / held item drawn as an effect card next to the hand */
  holding?: ProductKind | null;
};

export type CameraKey = { frame: number; position: V3; lookAt: V3; fov?: number; roll?: number; cut?: boolean; dur?: number };
export type ProductKind = "coffee" | "croissant" | "bread" | "cake" | "lightbulb" | "question" | "exclaim" | "heart" | "clock" | "book" | "note" | "scroll" | "coin_none";
export type FxKind = "burst" | "stars" | "notes" | "puff" | "product" | "steam" | "sparkle";
export type FxSpec = { kind: FxKind; frame: number; dur: number; at: V3; size?: number; product?: ProductKind; color?: string };
export type PropSpec = { kit: string; x: number; z: number; h: number; yaw?: number };
export type TextOverlay = { text: string; frame: number; dur: number; position?: "top" | "center" | "bottom"; style?: "title" | "cta" | "label" };

export type SceneSpec = {
  sceneId: string; startFrame: number; endFrame: number;
  narration?: string;
  light: LightName;
  actors: ActorSpec[];
  cameraKeys: CameraKey[];
  /** creeping push-in per frame (0.0015-0.0035 typical); every hold creeps (no static hold >= 4 f) */
  push?: number;
  /** lens blur radius at infinity in px at 1080 wide (0 = sharp); focus on an actor's eyes or a world point */
  dof?: { cInf: number; focusActor?: number; focus?: V3 };
  kicks?: { frame: number; amp: number }[];
  fx?: FxSpec[];
  props?: PropSpec[];
  textOverlays?: TextOverlay[];
  transitionIn?: "cut" | "xfade" | "flash";
  sunAz?: number; sunEl?: number;
  seed?: number;
  qualityNotes?: string;
};

export type Shop = { x: number; z: number; yaw: number; name: string; tagline?: string; colors: { primary: string; secondary: string; text: string } };
export type EnvSpec = { preset: EnvPreset; seed: number; shop?: Shop | null };

export type Brand = { name: string; primary: string; secondary: string; text: string; font?: string; logoText?: string };
export type Storyboard = {
  version: 1;
  title: string;
  fps: number; width: number; height: number;
  durationInFrames: number;
  env: EnvSpec;
  cast: CastMember[];
  scenes: SceneSpec[];
  brand?: Brand | null;
  captions?: { enabled: boolean; words?: { w: string; s: number; e: number }[] };
  post?: { ink?: boolean; lens?: boolean; bloom?: boolean; grade?: boolean };
};
