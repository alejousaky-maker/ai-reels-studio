// AI Reels Studio — storyboard contract between the Python backend (Pydantic schema) and the Remotion engine.
// Everything here is plain serialisable JSON: the engine derives every frame from (storyboard, frame) only.
export type V3 = [number, number, number];
export type LightName = "day" | "golden" | "night";
export type EnvPreset = "village_square" | "park" | "street" | "market" | "interior" | "harbour" | "beach" | "ocean" | "troy" | "cave" | "throne"
  | "apartment" | "bathroom" | "office" | "hotel" | "airport" | "suburb" | "lake" | "resort"
  | "outback" | "cabin" | "bedroom" | "kitchen" | "banquet";

export type Expr = "neutral" | "stern" | "grin" | "laugh" | "whistle" | "nervous" | "shock" | "relief" | "relief_open" | "dazed"
  | "pained" | "smile" | "smile_closed" | "lick";

export type OutfitSpec = {
  jacket: string; pants: string; boots: string;
  hat?: "tophat" | "bonnet" | "cap" | "hair" | "helmet" | "crown" | "explorer" | "bucket" | "sunhat" | "longhair" | "slouch" | "pith" | "laurel" | "bandana" | "headband" | "veil" | null; hair?: string; cap?: string;
  tie?: string; shades?: boolean; pockets?: boolean; creature?: string; stripes?: string; eyepatch?: boolean; toga?: string; bowtie?: boolean;
  skin?: string; dress?: string; moustache?: string; build?: "adult" | "stout" | "kid"; buttons?: string; sash?: string; belt?: string | null;
  beard?: string; cyclops?: boolean; rope?: string; crest?: string;
};
export type CastMember = { id: string; name?: string; outfit: OutfitSpec; scale?: number };

export type ExprKey = { frame: number; expr: Expr };
export type ActorSpec = {
  castId: string; x: number; z: number;
  /** "dance" = stroll cycle + hop + arm waves */
  mode?: "stand" | "stroll" | "sit" | "march" | "dance" | "fall";
  expr?: Expr; exprKeys?: ExprKey[];
  /** walk from (x, z) to walkTo between walkFrames[0] and walkFrames[1] */
  walkTo?: [number, number]; walkFrames?: [number, number];
  wave?: boolean; look?: -1 | 0 | 1; facing?: -1 | 0 | 1; tilt?: number;
  /** product / held item drawn as an effect card next to the hand */
  holding?: ProductKind | null;
};

export type CameraKey = { frame: number; position: V3; lookAt: V3; fov?: number; roll?: number; cut?: boolean; dur?: number };
export type ProductKind = "coffee" | "croissant" | "bread" | "cake" | "lightbulb" | "question" | "exclaim" | "heart" | "clock" | "book" | "note" | "scroll" | "coin_none"
  | "map" | "globe" | "wine" | "spear" | "stake"
  | "phone" | "tablet" | "wifi" | "key" | "camera" | "card" | "fish" | "receipt" | "box"
  | "snake" | "coins" | "mic" | "earbuds" | "gpsmap" | "suitcase" | "folder" | "ticket";
/** big painted set pieces standing in the world as lit cards (always turned to the camera, side view) */
export type PieceKind = "horse" | "ship" | "galley" | "chalkboard" | "sheep" | "tent" | "scale" | "boxes" | "car" | "van" | "poster"
  | "lewis" | "crates" | "snakes" | "board" | "screen" | "finish" | "truck" | "booth";
export type PieceSpec = { kind: PieceKind; x: number; z: number; y?: number; scale?: number; mirror?: boolean;
  /** slide from (x, z) to moveTo between moveFrames (e.g. the horse being pushed, a ship sailing off) */
  moveTo?: [number, number]; moveFrames?: [number, number]; rock?: number;
  /** text on boards / signs / the projector screen picture ("photos" | "hallway") */
  label?: string };
export type FxKind = "burst" | "stars" | "notes" | "puff" | "product" | "steam" | "sparkle" | "splash";
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
  pieces?: PieceSpec[];
  textOverlays?: TextOverlay[];
  transitionIn?: "cut" | "xfade" | "flash";
  sunAz?: number; sunEl?: number;
  seed?: number;
  qualityNotes?: string;
  /** optional location for this scene (each scene builds its own world); defaults to the storyboard env */
  env?: EnvSpec;
};

export type Shop = { x: number; z: number; yaw: number; name: string; tagline?: string; colors: { primary: string; secondary: string; text: string } };
/** variant: troy "breach" (gap torn in the wall), cave "open" (boulder rolled aside) */
export type EnvSpec = { preset: EnvPreset; seed: number; shop?: Shop | null; lite?: boolean; variant?: string };

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
  /** "simple" = light to render and easy to read: no lens blur / bloom, MSAA 2, 2K shadow map, 4 clouds, sparse set dressing */
  graphics?: "simple" | "full";
};
