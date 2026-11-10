// AI Reels Studio — storyboard contract between the Python backend (Pydantic schema) and the Remotion engine.
// Everything here is plain serialisable JSON: the engine derives every frame from (storyboard, frame) only.
export type V3 = [number, number, number];
export type LightName = "day" | "golden" | "night";
export type EnvPreset = "village_square" | "park" | "street" | "market" | "interior" | "harbour" | "beach" | "ocean" | "troy" | "cave" | "throne"
  | "apartment" | "bathroom" | "office" | "hotel" | "airport" | "suburb" | "lake" | "resort"
  | "outback" | "cabin" | "bedroom" | "kitchen" | "banquet" | "gameroom" | "shops" | "trading" | "clinic" | "datacenter" | "tunnel" | "warehouse" | "canal" | "island" | "bridge";

export type Expr = "neutral" | "stern" | "grin" | "laugh" | "whistle" | "nervous" | "shock" | "relief" | "relief_open" | "dazed"
  | "pained" | "smile" | "smile_closed" | "lick" | "starry" | "crazy" | "squint" | "broken" | "sweat" | "sleepy"
  | "smug" | "skeptical" | "angry" | "sad" | "cry" | "wink" | "bored" | "scared" | "love" | "evil" | "proud" | "confused";

export type OutfitSpec = {
  jacket: string; pants: string; boots: string;
  hat?: "tophat" | "bonnet" | "cap" | "hair" | "helmet" | "crown" | "explorer" | "bucket" | "sunhat" | "longhair" | "slouch" | "pith" | "laurel" | "bandana" | "headband" | "veil" | "gradcap" | null; hair?: string; cap?: string;
  coat?: string; hoodie?: boolean; jersey?: string; patches?: boolean; stethoscope?: boolean; glasses?: boolean; headMirror?: boolean;
  capBack?: boolean; propeller?: boolean; beardLong?: boolean; vest?: string; apron?: string; tutu?: string;
  tie?: string; shades?: boolean; pockets?: boolean; creature?: string; stripes?: string; eyepatch?: boolean; toga?: string; bowtie?: boolean; headset?: string;
  skin?: string; dress?: string; moustache?: string; build?: "adult" | "stout" | "kid"; buttons?: string; sash?: string; belt?: string | null;
  beard?: string; cyclops?: boolean; rope?: string; crest?: string;
};
export type CastMember = { id: string; name?: string; outfit: OutfitSpec; scale?: number };

export type ExprKey = { frame: number; expr: Expr };
export type ActorSpec = {
  castId: string; x: number; z: number;
  /** "dance" = stroll cycle + hop + arm waves */
  mode?: "stand" | "stroll" | "sit" | "march" | "dance" | "fall" | "run" | "jump" | "chair";
  /** frame spans while this character speaks (lip flap + talking hands) */
  talk?: [number, number][];
  /** panic tremble amount (0-1) */
  shake?: number;
  /** standing height above the ground (climbing a pole, in a bed) */
  y?: number;
  expr?: Expr; exprKeys?: ExprKey[];
  /** walk from (x, z) to walkTo between walkFrames[0] and walkFrames[1] */
  walkTo?: [number, number]; walkFrames?: [number, number];
  wave?: boolean; look?: -1 | 0 | 1; facing?: -1 | 0 | 1; tilt?: number;
  /** arm pose: both arms up (stretch / cheer) or pointing */
  pose?: "up" | "point" | "shrug" | "hips";
  /** product / held item drawn as an effect card next to the hand */
  holding?: ProductKind | null;
};

export type CameraKey = { frame: number; position: V3; lookAt: V3; fov?: number; roll?: number; cut?: boolean; dur?: number };
export type ProductKind = "coffee" | "croissant" | "bread" | "cake" | "lightbulb" | "question" | "exclaim" | "heart" | "clock" | "book" | "note" | "scroll" | "coin_none"
  | "map" | "globe" | "wine" | "spear" | "stake"
  | "phone" | "tablet" | "wifi" | "key" | "camera" | "card" | "fish" | "receipt" | "box"
  | "snake" | "coins" | "mic" | "earbuds" | "gpsmap" | "suitcase" | "folder" | "ticket" | "controller" | "can" | "pizza"
  | "thermometer" | "moth" | "cash" | "noodles" | "extinguisher" | "potato" | "battery" | "diploma" | "sicknote" | "router"
  | "newspaper" | "pickaxe" | "shovel" | "bagel" | "lettuce" | "pillow" | "wrench" | "check" | "trident" | "clipboard";
/** big painted set pieces standing in the world as lit cards (always turned to the camera, side view) */
export type PieceKind = "horse" | "ship" | "galley" | "chalkboard" | "sheep" | "tent" | "scale" | "boxes" | "car" | "van" | "poster"
  | "lewis" | "crates" | "snakes" | "board" | "screen" | "finish" | "truck" | "booth" | "tumbleweed" | "trafficlight" | "snacks"
  | "cryo" | "redarrow" | "console" | "sofa" | "fridge" | "bed" | "doghouse" | "tv" | "calendar" | "hospitalbed" | "heartmonitor"
  | "pole" | "monitor" | "cardbox" | "desk" | "rack" | "signs" | "ticker"
  | "semi" | "forklift" | "fruitpile" | "containership" | "tugboat" | "steamshovel" | "mosquito" | "mixer" | "airplane" | "excavator"
  | "rockpile" | "tetrapods" | "departures" | "escalator" | "pipes" | "cashcounter" | "blueprint" | "subwaymap" | "ribbon" | "oldcar";
export type PieceSpec = { kind: PieceKind; x: number; z: number; y?: number; scale?: number; mirror?: boolean;
  /** rise to this height across moveFrames (a console blasting off) */
  liftTo?: number;
  /** violent vibration amount (0-1) */
  shake?: number;
  /** slide from (x, z) to moveTo between moveFrames (e.g. the horse being pushed, a ship sailing off) */
  moveTo?: [number, number]; moveFrames?: [number, number]; rock?: number;
  /** text on boards / signs / the projector screen picture ("photos" | "hallway") */
  label?: string;
  /** spin (rad/s) for rolling pieces (tumbleweed) */
  spin?: number };
export type FxKind = "burst" | "stars" | "notes" | "puff" | "product" | "steam" | "sparkle" | "splash" | "money" | "confetti" | "sparks" | "dust";
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
  /** gentle lens lean-ins on named objects */
  punches?: number[];
  fx?: FxSpec[];
  props?: PropSpec[];
  pieces?: PieceSpec[];
  textOverlays?: TextOverlay[];
  transitionIn?: "cut" | "xfade" | "flash" | "dissolve" | "zoom" | "whip";
  sunAz?: number; sunEl?: number;
  seed?: number;
  qualityNotes?: string;
  /** optional location for this scene (each scene builds its own world); defaults to the storyboard env */
  env?: EnvSpec;
  /** a clause cut inside a sentence */
  sub?: boolean;
  /** diegetic screen layer drawn over the picture */
  hud?: { kind: "rec" | "phone" | "news" | "map" | "panel" | "bar" | "police" | "manhattan" | "osaka" | "panama" | "world" | "subway" | "mud" | "outro" | "spot"; text?: string };
  /** film look (CSS grade over the 3D picture) */
  look?: "sepia" | "bw" | "cool" | "warm";
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
  captions?: { enabled: boolean; words?: { w: string; s: number; e: number; hot?: boolean }[] };
  post?: { ink?: boolean; lens?: boolean; bloom?: boolean; grade?: boolean };
  /** "simple" = light to render and easy to read: no lens blur / bloom, MSAA 2, 2K shadow map, 4 clouds, sparse set dressing */
  graphics?: "simple" | "full";
};
