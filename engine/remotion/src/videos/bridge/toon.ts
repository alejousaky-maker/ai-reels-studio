// Our own flat 2D cartoon cast (riflemen, officer, townsfolk, kid, parent) + 2D effects, drawn on a canvas.
// Construction v2 (characters.md, our own cast): superellipse heads (pointed crown 1.75 / full jaw 2.3, chin taper,
// seeded side bulge + tilt), bean torsos, single-stroke limbs with ink-dot hands, a thick-thin plum outline weighted
// away from the light, soft painted crescents, deadpan lidded eyes, no blush, no catchlights.
// Design space 600 x 1000 units (soles at y = 975); the canvas transform scales it.
export const INK = "#241726";
export const SKIN = "#ffe2c2";
const WHITE = "#ffffff";
const MOUTH = "#5a1e28";
const TONGUE = "#e86e78";
type C3 = [number, number, number];
const SH_SKIN: C3 = [0.96, 0.86, 0.84]; // measured shadow/lit ratio on skin heads
/** white stickman heads shade to a soft neutral grey (no pink); tinted skins keep the measured warm ratio */
const skinShade = (skin: string) => (/^#f[a-f0-9]f[a-f0-9]f/i.test(skin) ? mul(skin, [0.8, 0.82, 0.88]) : mul(skin, SH_SKIN));
const SH_CLOTH: C3 = [0.64, 0.66, 0.74]; // torsos: lit side -> far side ~0.65
const SH_FELT: C3 = [0.62, 0.62, 0.7];

export type Build = "adult" | "stout" | "kid";
export type Outfit = {
  jacket: string; pants: string; boots: string; hat?: string | null; belt?: string | null; buttons?: string; rifle?: boolean;
  sash?: string; sword?: boolean; moustache?: string; skin?: string; head?: number; cap?: string; hair?: string; dress?: string;
  build?: Build;
  /** story-engine extras: beard colour, one big eye (cyclops), rope bands (tied up), helmet crest colour */
  beard?: string; cyclops?: boolean; rope?: string; crest?: string;
  /** modern wardrobe: necktie colour, dark sunglasses, vest pockets */
  tie?: string; shades?: boolean; pockets?: boolean;
  /** how far the hair cap comes down the head (0.42 = the classic fringe; long hair uses a higher hairline) */
  hairCut?: number;
  /** a non-human cast member drawn by its own routine ("emu") */
  creature?: string;
  /** striped shirt (pirates), an eye patch, a toga drape over one shoulder, a bow tie, a veil */
  stripes?: string; eyepatch?: boolean; toga?: string; bowtie?: boolean;
  /** gaming headset colour */
  headset?: string;
  /** lab coat colour, hoodie (hood rim + strings), esports jersey panel colour, patched tee, stethoscope, glasses,
   * doctor's head mirror, cap peak worn backwards, a propeller on the cap, a long wizard beard */
  coat?: string; hoodie?: boolean; jersey?: string; patches?: boolean; stethoscope?: boolean; glasses?: boolean; headMirror?: boolean;
  capBack?: boolean; propeller?: boolean; beardLong?: boolean;
  /** hi-vis vest colour, apron colour, a ballet tutu colour */
  vest?: string; apron?: string; tutu?: string;
};
type P2 = [number, number];

const rad = (d: number) => (d * Math.PI) / 180;
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
export const mul = (c: string, m: C3) => {
  const n = parseInt(c.slice(1), 16);
  const ch = (v: number, k: number) => Math.min(255, Math.round(v * k)).toString(16).padStart(2, "0");
  return `#${ch((n >> 16) & 255, m[0])}${ch((n >> 8) & 255, m[1])}${ch(n & 255, m[2])}`;
};
export const shade = (c: string, k: number) => mul(c, [k, k, k]);
export const mix = (a: string, b: string, t: number) => {
  const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((A >> s) & 255) * (1 - t) + ((B >> s) & 255) * t).toString(16).padStart(2, "0");
  return `#${ch(16)}${ch(8)}${ch(0)}`;
};
/** deterministic per-character random in [0, 1) */
const rnd = (seed: number, k: number) => { const x = Math.sin(seed * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const rotPts = (pts: P2[], a: number, cx: number, cy: number): P2[] =>
  pts.map(([x, y]) => [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)]);
const rotAbout = (q: P2, a: number, c: P2): P2 => rotPts([q], a, c[0], c[1])[0];
const lerp2 = (a: P2, b: P2, t: number): P2 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
/** smooth curve from a through (near) k to b, as a polyline */
const curve = (a: P2, k: P2, b: P2, n = 10): P2[] => {
  const c: P2 = [2 * k[0] - (a[0] + b[0]) / 2, 2 * k[1] - (a[1] + b[1]) / 2], out: P2[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, s = 1 - t;
    out.push([s * s * a[0] + 2 * s * t * c[0] + t * t * b[0], s * s * a[1] + 2 * s * t * c[1] + t * t * b[1]]);
  }
  return out;
};

export const RIFLEMAN: Outfit = { jacket: "#357650", pants: "#3d4440", boots: INK, hat: "shako", belt: "#f1efe6", buttons: "#d9dde0", rifle: true };
export const OFFICER: Outfit = { ...RIFLEMAN, hat: "shako_tall", buttons: "#e8c45a", sash: "#c0353a", sword: true, moustache: "#4a3020", rifle: false, belt: null, build: "stout" };
export const KID: Outfit = { jacket: "#f08a2c", pants: "#3b5b9a", boots: "#f4f1ea", hat: "cap", cap: "#e2453c", build: "kid" };
export const PARENT: Outfit = { jacket: "#7b5ac9", pants: "#3b3f52", boots: "#5a3b2a", hat: "hair", hair: "#5a3b2a" };
export const SKINS = [SKIN, "#f5c9a0", "#ecd0b6", "#c99067"];

export const soldier = (v = 0, extra: Partial<Outfit> = {}): Outfit => {
  const o: Outfit = { ...RIFLEMAN, skin: SKINS[v % 4] };
  if (v % 4 === 1) o.moustache = "#4a3426";
  if (v % 4 === 3) o.moustache = "#2a201a";
  return { ...o, ...extra };
};

export const townsfolk = (v = 0): Outfit => {
  const coats = ["#3f6fb5", "#8c3b4a", "#5d7a3a", "#b5653f", "#2f5f6a", "#7b5ac9"];
  const o: Outfit = { jacket: coats[v % 6], pants: "#3b3f52", boots: "#4a3426", skin: SKINS[v % 4] };
  return v % 2 ? { ...o, hat: "bonnet", dress: ["#d9a441", "#c25a7a", "#5a8fc2"][v % 3] } : { ...o, hat: "tophat" };
};

export class Pen {
  g: CanvasRenderingContext2D;
  ol = 12;
  /** [angle, cx, cy] rotation about (cx, cy), optional post-translation [.., dx, dy] */
  rot: number[] | null = null;
  constructor(g: CanvasRenderingContext2D) { this.g = g; }
  P(x: number, y: number): P2 {
    if (!this.rot) return [x, y];
    const r = this.rot, a = r[0], cx = r[1], cy = r[2], dx = r.length > 3 ? r[3] : 0, dy = r.length > 4 ? r[4] : 0, c = Math.cos(a), s = Math.sin(a);
    return [cx + (x - cx) * c - (y - cy) * s + dx, cy + (x - cx) * s + (y - cy) * c + dy];
  }
  path(pts: P2[], close: boolean) {
    const g = this.g;
    g.beginPath();
    pts.forEach((p, i) => { const [x, y] = this.P(p[0], p[1]); if (i) g.lineTo(x, y); else g.moveTo(x, y); });
    if (close) g.closePath();
  }
  /** filled shape with an ink outline; fill=null draws the outline only */
  poly(pts: P2[], fill: string | null, ol?: number) {
    const g = this.g, w = ol ?? this.ol;
    this.path(pts, true);
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (w) { g.lineWidth = w; g.strokeStyle = INK; g.lineJoin = "round"; g.stroke(); }
  }
  ell(cx: number, cy: number, rx: number, ry: number, fill: string | null, ol?: number, a0 = 0, a1 = 360, rot = 0) {
    this.poly(ellPts(cx, cy, rx, ry, a0, a1, rot), fill, ol);
  }
  /** thick round-capped limb with an ink rim (effects, rope) */
  line(pts: P2[], fill: string, w: number, ink = true) {
    const g = this.g;
    g.lineCap = "round"; g.lineJoin = "round";
    if (ink) { this.path(pts, false); g.strokeStyle = INK; g.lineWidth = w + 2 * this.ol * 0.9; g.stroke(); }
    this.path(pts, false); g.strokeStyle = fill; g.lineWidth = w; g.stroke();
  }
  stroke(pts: P2[], w: number, fill = INK) {
    const g = this.g;
    g.lineCap = "round"; g.lineJoin = "round";
    this.path(pts, false); g.strokeStyle = fill; g.lineWidth = w; g.stroke();
  }
  arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, w: number, fill = INK) {
    const pts: P2[] = [];
    for (let i = 0; i <= 24; i++) pts.push([cx + rx * Math.cos(rad(a0 + ((a1 - a0) * i) / 24)), cy + ry * Math.sin(rad(a0 + ((a1 - a0) * i) / 24))]);
    this.stroke(pts, w, fill);
  }
  dot(cx: number, cy: number, r: number, fill = INK) {
    const [x, y] = this.P(cx, cy);
    this.g.beginPath(); this.g.arc(x, y, r, 0, Math.PI * 2); this.g.fillStyle = fill; this.g.fill();
  }
  /** draw with a closed shape as clip */
  clip(pts: P2[], fn: () => void) { const g = this.g; g.save(); this.path(pts, true); g.clip(); fn(); g.restore(); }
  /** flat fill + soft crescent on the side away from the light (light = canvas angle the light comes FROM).
   *  Radial ramp centred `shift` R toward the light: flat out to ~0.6 R on the far side, full shadow by ~0.8 R. */
  shadedFill(pts: P2[], base: string, shadow: string, light: number, R: number, shift = 0.45, r0 = 1.05, r1 = 1.25) {
    const g = this.g, n = pts.length;
    let cx = 0, cy = 0;
    for (const [x, y] of pts) { cx += x / n; cy += y / n; }
    const [gx, gy] = this.P(cx + Math.cos(light) * shift * R, cy + Math.sin(light) * shift * R);
    const gr = g.createRadialGradient(gx, gy, 0, gx, gy, r1 * R);
    gr.addColorStop(0, base); gr.addColorStop(r0 / r1, base); gr.addColorStop(1, shadow);
    this.path(pts, true); g.fillStyle = gr; g.fill();
  }
  /** broad gradient across a shape along the light: lit edge = base, far edge = shadow (torsos, coats) */
  gradFill(pts: P2[], base: string, shadow: string, light: number, flat = 0.22) {
    const g = this.g, dx = Math.cos(light), dy = Math.sin(light), n = pts.length;
    let cx = 0, cy = 0, lo = Infinity, hi = -Infinity;
    for (const [x, y] of pts) { cx += x / n; cy += y / n; const d = x * dx + y * dy; lo = Math.min(lo, d); hi = Math.max(hi, d); }
    const dc = cx * dx + cy * dy;
    const [ax, ay] = this.P(cx + dx * (hi - dc), cy + dy * (hi - dc)), [bx, by] = this.P(cx + dx * (lo - dc), cy + dy * (lo - dc));
    const gr = g.createLinearGradient(ax, ay, bx, by);
    gr.addColorStop(0, base); gr.addColorStop(flat, base); gr.addColorStop(1, shadow);
    this.path(pts, true); g.fillStyle = gr; g.fill();
  }
  /** thick-thin ink ring: w(θ) = w0 (1 + k cos(θ − thick)), θ from the contour centroid (canvas angles) */
  inkRing(pts: P2[], w0: number, thick: number, k = 0.45, col = INK) {
    const n = pts.length;
    let cx = 0, cy = 0;
    for (const [x, y] of pts) { cx += x / n; cy += y / n; }
    const out: P2[] = [], inn: P2[] = [];
    pts.forEach((q, i) => {
      const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
      let nx = b[1] - a[1], ny = a[0] - b[0]; // outward normal for clockwise-on-screen contours
      const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
      const h = 0.5 * w0 * (1 + k * Math.cos(Math.atan2(q[1] - cy, q[0] - cx) - thick));
      out.push([q[0] + nx * h, q[1] + ny * h]); inn.push([q[0] - nx * h, q[1] - ny * h]);
    });
    const g = this.g;
    const trace = (r: P2[]) => { r.forEach(([x0, y0], i) => { const [x, y] = this.P(x0, y0); if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.closePath(); };
    g.beginPath(); trace(out); trace(inn.reverse());
    g.fillStyle = col; g.fill("evenodd");
  }
  /** flat strap with a thin ink rim (cross belts, sash, rifle, handles) */
  band(pts: P2[], fill: string, w: number, rim: number, cap: CanvasLineCap = "butt") {
    const g = this.g; g.lineCap = cap; g.lineJoin = "round";
    this.path(pts, false); g.strokeStyle = INK; g.lineWidth = w + 2 * rim; g.stroke();
    this.path(pts, false); g.strokeStyle = fill; g.lineWidth = w; g.stroke();
    g.lineCap = "round";
  }
}

const ellPts = (cx: number, cy: number, rx: number, ry: number, a0 = 0, a1 = 360, rot = 0, n = 48): P2[] => {
  const r = rad(rot), pts: P2[] = [];
  for (let i = 0; i <= n; i++) {
    const a = rad(a0 + ((a1 - a0) * i) / n), x = rx * Math.cos(a), y = ry * Math.sin(a);
    pts.push([cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)]);
  }
  return pts;
};

const rrect = (x0: number, y0: number, x1: number, y1: number, r: number, n = 8): P2[] => {
  const pts: P2[] = [];
  for (const [cx, cy, a] of [[x1 - r, y0 + r, -90], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, 90], [x0 + r, y0 + r, 180]])
    for (let i = 0; i <= n; i++) pts.push([cx + r * Math.cos(rad(a + (90 * i) / n)), cy + r * Math.sin(rad(a + (90 * i) / n))]);
  return pts;
};

/** tapered stroke, thick end at a: brows, moustache halves */
const taper = (p: Pen, a: P2, b: P2, wa: number, wb: number, col = INK) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  p.poly([[a[0] + nx * wa / 2, a[1] + ny * wa / 2], [b[0] + nx * wb / 2, b[1] + ny * wb / 2],
    [b[0] - nx * wb / 2, b[1] - ny * wb / 2], [a[0] - nx * wa / 2, a[1] - ny * wa / 2]], col, 0);
  p.dot(a[0], a[1], wa / 2, col); p.dot(b[0], b[1], wb / 2, col);
};

// ---------------- contours ----------------
export type Blob = { a: number; b: number; nTop: number; nBot: number; egg: number; asym: number; rot: number; noise: number; seed: number };

/** superellipse "bean": separate crown / jaw exponents, egg taper (neg = narrower chin), one-side bulge, soft noise.
 *  Points run right -> down -> left -> up (clockwise on screen). */
export const blobPts = (cx: number, cy: number, B: Blob, n = 72): P2[] => {
  const ph = [rnd(B.seed, 11), rnd(B.seed, 12), rnd(B.seed, 13)].map((v) => v * Math.PI * 2);
  const pts: P2[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t), e = 2 / (s < 0 ? B.nTop : B.nBot);
    let X = Math.sign(c) * Math.abs(c) ** e;
    const Y = Math.sign(s) * Math.abs(s) ** e;
    X *= (1 + B.egg * Y) * (1 + B.asym * Math.sign(X));
    const r = 1 + B.noise * (Math.cos(2 * t + ph[0]) + 0.7 * Math.cos(3 * t + ph[1]) + 0.5 * Math.cos(4 * t + ph[2]));
    const x = B.a * X * r, y = B.b * Y * r;
    pts.push([cx + x * Math.cos(B.rot) - y * Math.sin(B.rot), cy + x * Math.sin(B.rot) + y * Math.cos(B.rot)]);
  }
  return pts;
};

/** measured head: H/W 0.94, slightly pointed crown (1.75), fuller jaw (2.3), chin taper -0.12, 8 % bulge to the facing side */
export const headBlob = (seed: number, a = 118, facing = 0): Blob => ({
  a, b: a * (0.94 + 0.08 * (rnd(seed, 1) - 0.5)),
  nTop: 1.75 + 0.3 * (rnd(seed, 2) - 0.5), nBot: 2.3 + 0.3 * (rnd(seed, 3) - 0.5),
  egg: -0.12 + 0.06 * (rnd(seed, 4) - 0.5),
  asym: (0.06 + 0.04 * rnd(seed, 5)) * (facing || (rnd(seed, 6) < 0.5 ? -1 : 1)),
  rot: rad(8 * (rnd(seed, 7) - 0.5)), noise: 0.008, seed,
});

/** thickest outline direction: away from the light, pulled toward the ground (64 deg measured for upper-left light) */
export const thickAngle = (light: number) => Math.atan2(-Math.sin(light) + 0.8, -Math.cos(light));
const DEF_LIGHT = rad(-120);

// ---------------- faces ----------------
export type Expr = "neutral" | "stern" | "grin" | "laugh" | "whistle" | "nervous" | "shock" | "relief" | "relief_open" | "dazed"
  | "pained" | "smile" | "smile_closed" | "lick" | "starry" | "crazy" | "squint" | "broken" | "sweat" | "sleepy"
  | "smug" | "skeptical" | "angry" | "sad" | "cry" | "wink" | "bored" | "scared" | "love" | "evil" | "proud" | "confused";
type EyeK = "dot" | "small" | "lid" | "slit" | "happy" | "dash" | "squeeze" | "shock" | "shockHalf" | "spiral" | "star" | "bloodshot" | "cracked" | "heart";
type MouthK = "dash" | "frown" | "smirk" | "smile" | "smileWide" | "grin" | "laugh" | "o" | "O" | "wave" | "teeth" | "lick";
/** eyes [back, front], brows [inner, outer] offsets in u (+ = down), mouth kind */
const FACE: Record<Expr, { eye: [EyeK, EyeK]; brow: [number, number]; mouth: MouthK; browR?: [number, number] }> = {
  // RicksClips-style stickman acting: half-lidded smugness, one raised brow, heavy angled brows
  smug: { eye: ["lid", "lid"], brow: [4, -4], mouth: "smirk" },
  skeptical: { eye: ["lid", "dot"], brow: [3, 0], browR: [-6, -8], mouth: "dash" },
  angry: { eye: ["dot", "dot"], brow: [8, -4], mouth: "teeth" },
  sad: { eye: ["small", "small"], brow: [-6, 4], mouth: "frown" },
  cry: { eye: ["squeeze", "squeeze"], brow: [-6, 4], mouth: "O" },
  wink: { eye: ["dot", "happy"], brow: [-2, -3], browR: [1, 0], mouth: "smileWide" },
  bored: { eye: ["slit", "slit"], brow: [1, 1], mouth: "dash" },
  scared: { eye: ["shock", "shock"], brow: [-7, 3], mouth: "wave" },
  love: { eye: ["heart", "heart"], brow: [-4, -4], mouth: "smileWide" },
  evil: { eye: ["lid", "lid"], brow: [7, -6], mouth: "grin" },
  proud: { eye: ["happy", "happy"], brow: [-2, -4], mouth: "smile" },
  confused: { eye: ["dot", "small"], brow: [-4, 2], browR: [2, -1], mouth: "wave" },
  neutral: { eye: ["lid", "lid"], brow: [0, -1], mouth: "dash" },
  stern: { eye: ["lid", "lid"], brow: [3, -2], mouth: "frown" },
  grin: { eye: ["happy", "happy"], brow: [-3, -3], mouth: "grin" },
  laugh: { eye: ["squeeze", "squeeze"], brow: [-4, -4], mouth: "laugh" },
  whistle: { eye: ["dash", "dash"], brow: [-2, -4], mouth: "o" },
  nervous: { eye: ["small", "small"], brow: [-3, 2], mouth: "wave" },
  shock: { eye: ["shock", "shock"], brow: [-7, -6], mouth: "O" },
  relief: { eye: ["happy", "happy"], brow: [-2, 1], mouth: "smileWide" },
  relief_open: { eye: ["happy", "happy"], brow: [-2, 1], mouth: "grin" },
  dazed: { eye: ["spiral", "spiral"], brow: [-3, 2], mouth: "wave" },
  pained: { eye: ["squeeze", "lid"], brow: [-3, 2], mouth: "teeth" },
  smile: { eye: ["dot", "dot"], brow: [0, -1], mouth: "smirk" },
  smile_closed: { eye: ["happy", "happy"], brow: [0, -1], mouth: "smile" },
  lick: { eye: ["dot", "dot"], brow: [0, -1], mouth: "lick" },
  starry: { eye: ["star", "star"], brow: [-5, -5], mouth: "laugh" },
  crazy: { eye: ["bloodshot", "bloodshot"], brow: [-6, 3], mouth: "grin" },
  squint: { eye: ["squeeze", "squeeze"], brow: [4, 2], mouth: "wave" },       // "> <" blinded by the sun
  broken: { eye: ["cracked", "cracked"], brow: [-7, -6], mouth: "O" },        // eyes shattering like glass
  sweat: { eye: ["shock", "shock"], brow: [-4, 3], mouth: "wave" },           // + a giant sweat drop
  sleepy: { eye: ["slit", "slit"], brow: [1, 1], mouth: "dash" },
};
const halfLid = (k: EyeK): EyeK => (k === "dot" || k === "small" ? "lid" : k === "lid" ? "slit" : k === "shock" ? "shockHalf" : k);
const eyeKind = (k: EyeK, lid: number): EyeK =>
  k === "star" || k === "bloodshot" || k === "cracked" || k === "heart" ? k : lid >= 1 && k !== "happy" && k !== "squeeze" && k !== "spiral" ? "dash" : lid > 0 ? halfLid(k) : k;
const lidOf = (b: boolean | number | undefined) => (b === true ? 1 : Number(b) || 0);

const eye = (p: Pen, kind: EyeK, x: number, ey: number, u: number, side: number, look: number, skin: string) => {
  const lx = x + look * 3 * u, lw = 3.8 * u;
  switch (kind) {
    case "dot": p.ell(lx, ey, 3.8 * u, 5.5 * u, INK, 0); break;
    case "small": p.ell(lx, ey, 3 * u, 4.4 * u, INK, 0); break;
    case "lid": p.ell(lx, ey - u, 7 * u, 6 * u, INK, 0, 0, 180); p.stroke([[x - 9 * u, ey - u], [x + 9 * u, ey - u]], lw); break;
    case "slit": p.ell(lx, ey, 7 * u, 2.6 * u, INK, 0, 0, 180); p.stroke([[x - 9 * u, ey], [x + 9 * u, ey]], lw); break;
    case "happy": p.arc(x, ey + 3 * u, 8 * u, 6 * u, 200, 340, lw); break;
    case "dash": p.stroke([[x - 8.5 * u, ey], [x + 8.5 * u, ey]], lw); break;
    case "squeeze": p.stroke([[x + 6 * u * side, ey - 5 * u], [x - 6 * u * side, ey], [x + 6 * u * side, ey + 5 * u]], lw); break;
    case "shock": case "shockHalf":
      p.ell(x, ey, 11 * u, 11 * u, WHITE, 2.6 * u); p.dot(lx - side * 1.5 * u, ey + 1.5 * u, 3 * u);
      if (kind === "shockHalf") { p.ell(x, ey, 11 * u, 11 * u, skin, 0, 180, 360); p.stroke([[x - 11 * u, ey], [x + 11 * u, ey]], 2.6 * u); }
      break;
    case "star": {   // glowing yellow star eyes
      const st: P2[] = [];
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r2 = (i % 2 ? 5 : 12) * u; st.push([x + Math.cos(a) * r2, ey + Math.sin(a) * r2]); }
      p.poly(st, "#ffd23f", 2.2 * u);
      break;
    }
    case "bloodshot": {   // wide white eye, red veins, tiny spiral pupil (the unblinking gamer)
      p.ell(x, ey, 11 * u, 11 * u, WHITE, 2.6 * u);
      for (let k = 0; k < 4; k++) { const a = k * 1.6 + 0.4; p.stroke([[x + Math.cos(a) * 10 * u, ey + Math.sin(a) * 10 * u], [x + Math.cos(a + 0.3) * 5 * u, ey + Math.sin(a + 0.3) * 5 * u]], 1.1 * u, "#e2453c"); }
      const sp: P2[] = [];
      for (let t = 1; t < 12; t++) sp.push([x + Math.cos(t * 0.95) * t * 0.5 * u, ey + Math.sin(t * 0.95) * t * 0.5 * u]);
      p.stroke(sp, 1.8 * u);
      break;
    }
    case "heart": {   // love-struck red heart eyes
      const hp2: P2[] = [];
      for (let i = 0; i <= 24; i++) { const t = (i / 24) * Math.PI * 2; hp2.push([x + 0.75 * u * 16 * Math.sin(t) ** 3 / 1.6, ey - 0.75 * u * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 1.6]); }
      p.poly(hp2, "#e2453c", 2 * u);
      break;
    }
    case "cracked": {   // shattered glass eye: white ball, zig-zag cracks, a shard missing
      p.ell(x, ey, 11 * u, 11 * u, WHITE, 2.6 * u);
      p.dot(lx - side * 1.5 * u, ey + 1.5 * u, 2.6 * u);
      for (const a0 of [0.3, 2.2, 4.1]) p.stroke([[x, ey], [x + Math.cos(a0) * 5 * u, ey + Math.sin(a0) * 5 * u], [x + Math.cos(a0 + 0.5) * 8 * u, ey + Math.sin(a0 + 0.5) * 8 * u], [x + Math.cos(a0 + 0.2) * 11 * u, ey + Math.sin(a0 + 0.2) * 11 * u]], 1.3 * u);
      p.poly([[x + 4 * u, ey - 10 * u], [x + 9 * u, ey - 6 * u], [x + 6 * u, ey - 3 * u]], "#9fb8c9", 1 * u);
      break;
    }
    default: {
      const s: P2[] = [];
      for (let t = 1; t < 15; t++) s.push([x + Math.cos(t * 0.9) * t * 0.55 * u, ey + Math.sin(t * 0.9) * t * 0.55 * u]);
      p.stroke(s, 2.4 * u);
    }
  }
};

/** open "D" mouth with a white teeth band (+ tongue) */
const dmouth = (p: Pen, mx: number, y: number, rx: number, ry: number, u: number, tongue = false) => {
  p.ell(mx, y, rx, ry, MOUTH, 0, 0, 180);
  p.clip([[mx - rx, y], [mx + rx, y], [mx + rx, y + 3 * u], [mx - rx, y + 3 * u]], () => p.ell(mx, y, rx, ry, WHITE, 0, 0, 180));
  if (tongue) p.ell(mx + 2 * u, y + 0.62 * ry, 0.4 * rx, 0.28 * ry, TONGUE, 0);
  p.ell(mx, y, rx, ry, null, 3 * u, 0, 180);
};

const mouth = (p: Pen, kind: MouthK, mx: number, my: number, u: number, k = 1) => {
  const mw = 4 * u;
  switch (kind) {
    case "dash": p.stroke([[mx - 5.5 * u * k, my], [mx + 5.5 * u * k, my - 0.8 * u]], mw); break;
    case "frown": p.arc(mx, my + 3 * u, 6.5 * u * k, 3.5 * u, 200, 340, mw); break;
    case "smirk": p.arc(mx + u, my - 3 * u, 7 * u * k, 4 * u, 10, 150, mw); break;
    case "smile": p.arc(mx, my - 3 * u, 8 * u * k, 4.5 * u, 20, 160, mw); break;
    case "smileWide": p.arc(mx, my - 4 * u, 11 * u * k, 6 * u, 15, 165, mw); break;
    case "grin": dmouth(p, mx, my - u, 12 * u * k, 8 * u, u); break;
    case "laugh": dmouth(p, mx, my, 16 * u * k, 11 * u, u, true); break;
    case "o": p.ell(mx + 4 * u, my, 3.5 * u, 4 * u, MOUTH, 2.8 * u); break;
    case "O": p.ell(mx, my + 2 * u, 9 * u * k, 11 * u, MOUTH, 3.2 * u); break;
    case "wave": { const s: P2[] = []; for (let i = 0; i <= 12; i++) s.push([mx - 9 * u * k + i * 1.5 * u * k, my + 1.5 * u * Math.sin(i * 1.3)]); p.stroke(s, 3 * u); break; }
    case "teeth":
      p.poly([[mx - 12 * u * k, my - 4 * u], [mx + 12 * u * k, my - 4 * u], [mx + 11 * u * k, my + 4 * u], [mx - 11 * u * k, my + 4 * u]], WHITE, 3 * u);
      for (const j of [-1, 0, 1]) p.stroke([[mx + j * 6 * u * k, my - 4 * u], [mx + j * 6 * u * k, my + 4 * u]], 1.5 * u);
      break;
    case "lick": p.arc(mx, my - 3 * u, 8 * u * k, 4.5 * u, 20, 160, mw); p.ell(mx + 6 * u * k, my + 3 * u, 3.6 * u, 4.6 * u, TONGUE, 2.4 * u); break;
  }
};

/** face v2 (front / 3-4). u = 1 % of the head path width W. Eyes 26u apart on the centre line, brows 20u up, mouth 20u
 *  down, everything slid toward the facing side. No blush, no catchlights. */
/** live face animation for the next faceFront call: talk = mouth opening 0..1 (lip flap), browUp = brows raised (u) */
let FACE_ANIM = { talk: 0, browUp: 0 };
export const setFaceAnim = (talk: number, browUp: number) => { FACE_ANIM = { talk, browUp }; };
const faceFront = (p: Pen, cx: number, cy: number, W: number, expr: Expr, facing: number, look: number, lid: number, brim: boolean,
  skin: string, moustache?: string, stout = false, one = false) => {
  const u = W / 100, F = FACE[expr], fx = cx + 7 * u * facing, anim = FACE_ANIM;
  const ex = (F.eye[0] === "shock" ? 12 : 13) * u, ey = cy;
  if (one) {
    // cyclops: one big eye in the middle of the face (drawn at 2x), one heavy brow
    const strong = (x: EyeK) => x === "squeeze" || x === "spiral" || x === "shock";
    const kind = eyeKind(strong(F.eye[0]) ? F.eye[0] : F.eye[1], lid), k = 2.2;
    if (kind === "dot" || kind === "small" || kind === "lid" || kind === "slit" || kind === "happy") {
      // one big open eye: white ball, dark iris, the upper lid follows the expression
      const R = 16 * u, ex2 = fx, ey2 = ey - 3 * u;
      p.ell(ex2, ey2, R, R * 0.92, WHITE, 3 * u);
      p.dot(ex2 + look * 4 * u, ey2 + 2 * u, kind === "small" ? 5 * u : 7 * u);
      if (kind === "lid" || kind === "slit") {
        const cover = kind === "slit" ? 0.62 : 0.38;
        p.clip(ellPts(ex2, ey2, R, R * 0.92), () => p.poly([[ex2 - R - 2 * u, ey2 - R], [ex2 + R + 2 * u, ey2 - R], [ex2 + R + 2 * u, ey2 - R + 2 * R * cover], [ex2 - R - 2 * u, ey2 - R + 2 * R * cover]], skin, 0));
        p.stroke([[ex2 - R, ey2 - R + 2 * R * cover], [ex2 + R, ey2 - R + 2 * R * cover]], 3.5 * u);
      }
      if (kind === "happy") {   // smiling eye: the lower lid pushes up in a curve
        p.clip(ellPts(ex2, ey2, R, R * 0.92), () => p.ell(ex2, ey2 + R * 1.15, R * 1.3, R * 0.75, skin, 0));
        p.arc(ex2, ey2 + R * 1.15, R * 1.05, R * 0.72, 200, 340, 3.5 * u);
      }
    } else eye(p, kind, fx, ey - 2 * u, u * k, 1, look, skin);
    const [dI, dO] = F.brow, by = ey - 2 * u - (brim ? 19 : 24) * u * (kind === "shock" || kind === "shockHalf" ? 1.2 : 1);
    if (kind === "shock" || kind === "shockHalf") p.arc(fx, by - 8 * u, 18 * u, 5 * u, 200, 340, 5 * u);
    else taper(p, [fx - 18 * u, by + dO * u], [fx + 18 * u, by + dI * u], 6 * u, 3 * u);
    mouth(p, F.mouth, cx + 8 * u * facing, cy + 25 * u, u, 1.3);
    if (expr === "nervous") p.ell(cx + 40 * u * (facing || 1), cy - 22 * u, 3 * u, 5 * u, "#9fd4ff", 2 * u);
    return;
  }
  for (const side of [-1, 1]) {
    const x = fx + side * ex;
    const kind = eyeKind(F.eye[(facing ? side === facing : side > 0) ? 1 : 0], lid);
    eye(p, kind, x, ey, u, side, look, skin);
    const [dI, dO] = side > 0 && F.browR ? F.browR : F.brow, by = ey - (brim ? 17 : 20) * u - anim.browUp * u;
    if (kind === "shock" || kind === "shockHalf") p.arc(x, by - 6 * u, 9 * u, 3 * u, 200, 340, 4 * u);
    else if (kind !== "heart") taper(p, [x - side * 8.5 * u, by + dI * u], [x + side * 8.5 * u, by + dO * u], 5 * u, 2.5 * u);
    if (expr === "cry") {   // tear streams running down from both eyes
      p.stroke([[x, ey + 5 * u], [x - side * 2 * u, ey + 18 * u], [x + side * u, ey + 30 * u]], 4.5 * u, "#7fc8ff");
      p.ell(x + side * u, ey + 32 * u, 3 * u, 4 * u, "#7fc8ff", 0);
    }
  }
  const mx = cx + 8 * u * facing, my = cy + 20 * u;
  if (anim.talk > 0.05) {   // lip flap while speaking: an open mouth whose height follows the syllables
    const t = anim.talk, wide = F.mouth === "grin" || F.mouth === "laugh" || F.mouth === "smileWide" || F.mouth === "smile";
    if (wide) dmouth(p, mx, my - u, (9 + 4 * t) * u, (4 + 7 * t) * u, u, t > 0.6);
    else p.ell(mx, my + u, (6 + 3 * t) * u, (2.5 + 7 * t) * u, MOUTH, 3 * u);
  } else mouth(p, F.mouth, mx, my, u);
  if (moustache) for (const s of [-1, 1])
    taper(p, [mx + s * 1.5 * u, cy + 12.5 * u], [mx + s * (stout ? 19 : 15) * u, cy + (stout ? 10.5 : 15) * u], stout ? 5.5 * u : 4.5 * u, 1.6 * u, moustache);
  if (expr === "nervous") p.ell(cx + 40 * u * (facing || 1), cy - 22 * u, 3 * u, 5 * u, "#9fd4ff", 2 * u);
  if (expr === "sweat") {   // one giant anime sweat drop sliding down the temple
    const sx = cx + 38 * u * (facing || 1), sy = cy - 30 * u;
    p.poly([[sx, sy - 16 * u], [sx + 9 * u, sy + 4 * u], [sx + 6 * u, sy + 11 * u], [sx, sy + 13 * u], [sx - 6 * u, sy + 11 * u], [sx - 9 * u, sy + 4 * u]], "#9fd4ff", 2.2 * u);
    p.stroke([[sx - 3 * u, sy + 2 * u], [sx - 4 * u, sy + 7 * u]], 1.6 * u, "#ffffff");
  }
};

/** profile face (facing screen-right): one eye, brow, nose tick, mouth near the front edge; no skin bump nose, no ear */
const faceSide = (p: Pen, hx: number, hy: number, W: number, expr: Expr, lid: number, brim: boolean, skin: string, moustache?: string, stout = false, one = false) => {
  const u = W / 100, F = FACE[expr], ex = hx + (one ? 22 : 27) * u, ey = hy;
  const kind = eyeKind(F.eye[1], lid);
  eye(p, kind, ex, ey, one ? u * 1.6 : u, 1, 0.6, skin);
  const by = ey - (brim ? 17 : 20) * u, [dI, dO] = F.brow;
  if (kind === "shock" || kind === "shockHalf") p.arc(ex, by - 6 * u, 9 * u, 3 * u, 200, 340, 4 * u);
  else taper(p, [ex + 8 * u, by + dI * u], [ex - 7 * u, by - u + dO * u], 5 * u, 2.5 * u);
  p.stroke([[hx + 44 * u, hy + 4 * u], [hx + 47.5 * u, hy + 9 * u], [hx + 43 * u, hy + 10 * u]], 3 * u);
  mouth(p, F.mouth, hx + 33 * u, hy + 21 * u, u, 0.62);
  if (moustache) taper(p, [hx + 41 * u, hy + 13.5 * u], [hx + 25 * u, hy + (stout ? 11.5 : 16) * u], stout ? 5.5 * u : 4.5 * u, 1.6 * u, moustache);
  if (expr === "nervous") p.ell(hx - 30 * u, hy - 24 * u, 3 * u, 5 * u, "#9fd4ff", 2 * u);
};

// ---------------- hats ----------------
const BONNET = "#e9cf8f", BONNET_BRIM = "#d6b46a";
/** parts of a hat that sit behind the head (bonnet) */
const hatBehind = (p: Pen, o: Outfit, H: Blob, cx: number, hc: number, light: number, thick: number, ow: number, side: boolean) => {
  if (o.hat === "veil") {   // sheer white veil behind the head down past the shoulders
    const pts: P2[] = [];
    // only a thin rim shows above the head; the veil flares out below the jaw, behind the shoulders (no wimple around the face)
    for (let i = 0; i <= 16; i++) { const a2 = Math.PI + (Math.PI * i) / 16; pts.push([cx + Math.cos(a2) * H.a * 1.02, hc - H.b * 0.12 + Math.sin(a2) * H.b * 1.0]); }
    pts.push([cx + H.a * 0.98, hc + H.b * 0.7], [cx + H.a * 1.45, hc + H.b * 2.6], [cx - H.a * 1.45, hc + H.b * 2.6], [cx - H.a * 0.98, hc + H.b * 0.7]);
    p.poly(pts, "rgba(250,250,255,0.82)", ow * 0.6);
    return;
  }
  if (o.hat === "longhair" || ((o.hat === "sunhat" || o.hat === "bucket") && o.hair)) {
    // long hair falling behind the head to the shoulders
    const col = o.hair ?? "#5a3b2a", u = H.a / 50;
    const pts: P2[] = [];
    // a bob: hugs the head and ends just below the jaw with small outward flips (no hood-like frame)
    const ox = cx - (side ? 10 * u : 0);
    for (let i = 0; i <= 20; i++) { const a2 = Math.PI + (Math.PI * i) / 20; pts.push([ox + Math.cos(a2) * H.a * 1.06, hc + Math.sin(a2) * H.b * 1.06]); }
    pts.push([ox + H.a * 1.08, hc + H.b * 0.55], [ox + H.a * 1.16, hc + H.b * 0.92], [ox + H.a * 0.9, hc + H.b * 0.86],
      [ox - H.a * 0.9, hc + H.b * 0.86], [ox - H.a * 1.16, hc + H.b * 0.92], [ox - H.a * 1.08, hc + H.b * 0.55]);
    p.shadedFill(pts, col, mul(col, SH_FELT), light, H.a * 1.1);
    p.inkRing(pts, ow * 0.85, thick);
    return;
  }
  if (o.hat !== "bonnet") return;
  const bb = blobPts(cx - (side ? 12 : 0) * (H.a / 50), hc - 0.07 * 2 * H.b, { ...H, a: H.a * 1.17, b: H.b * 1.13, asym: 0, egg: 0.04, seed: H.seed + 3 });
  p.shadedFill(bb, BONNET, mul(BONNET, SH_CLOTH), light, H.a * 1.17);
  p.inkRing(bb, ow * 0.85, thick);
};

const hatOn = (p: Pen, o: Outfit, hp: P2[], H: Blob, cx: number, hc: number, light: number, seed: number, facing: number, side: boolean) => {
  const W = 2 * H.a, HH = 2 * H.b, u = W / 100, crown = hc - H.b, ow = 0.85 * 5 * u;
  const a = H.rot + rad(4 * (rnd(seed, 20) - 0.5)); // tilt with the head, +-2 deg extra
  const R = (pts: P2[]) => rotPts(pts, a, cx, hc);
  const sag = (yb: number, wb: number): P2[] => {
    const base: P2[] = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12; base.push([cx + wb * (2 * t - 1), yb + 3 * u * (1 - (2 * t - 1) ** 2)]); }
    return base;
  };
  if (o.hat === "shako" || o.hat === "shako_tall") {
    const tall = o.hat === "shako_tall", yb = crown + 0.25 * HH, ht = (tall ? 0.66 : 0.56) * HH, wb = 46 * u, wt = 52 * u;
    const body = R([...sag(yb, wb).reverse(), [cx - wt, yb - ht], [cx + wt, yb - ht]]);
    p.shadedFill(body, "#3a3d47", "#24262d", light, wt, 0.4);
    if (tall) p.clip(body, () => p.band(R([[cx - wt - 5 * u, yb - ht + 0.07 * HH], [cx + wt + 5 * u, yb - ht + 0.07 * HH]]), "#e8c45a", 0.06 * HH, 1.5 * u));
    p.poly(body, null, ow);
    const deg = (a * 180) / Math.PI;
    if (side) {
      p.poly(R([[cx + 36 * u, yb - 1 * u], [cx + 60 * u, yb + 8 * u], [cx + 34 * u, yb + 6 * u]]), "#16171b", 2.5 * u);
      const [tx, ty] = R([[cx + 24 * u, yb - ht - 6 * u]])[0];
      p.ell(tx, ty, 7 * u, 7 * u, "#2b7a4b", 2.5 * u);
    } else {
      const [px, py] = R([[cx + 3 * u * facing, yb + 3 * u]])[0];
      p.ell(px, py, 34 * u, 0.045 * HH, "#16171b", 2.5 * u, 0, 180, deg); // peak
      const [bx, by] = R([[cx, yb - 0.45 * ht]])[0];
      p.ell(bx, by, 7 * u, 6 * u, tall ? "#e8c45a" : "#c9ccd2", 2 * u, 0, 360, deg); // badge plate
      p.arc(bx, by, 3.5 * u, 2.8 * u, 200, 500, 1.6 * u);
      const [tx, ty] = R([[cx, yb - ht - 6 * u]])[0];
      p.ell(tx, ty, 7 * u, 7 * u, "#2b7a4b", 2.5 * u); // green tuft
    }
  } else if (o.hat === "cap" || o.hat === "hair") {
    const cut = crown + (o.hat === "cap" ? 0.3 : o.hairCut ?? 0.42) * HH;
    const keep = (x: number, y: number) => y < cut || (side && o.hat === "hair" && x < cx - 6 * u && y < hc + 0.42 * H.b);
    // start the arc at the first kept point after a dropped one, so the kept run is contiguous and the cut closes it
    const n = hp.length, startIdx = Math.max(0, hp.findIndex(([x, y], i) => keep(x, y) && !keep(hp[(i + n - 1) % n][0], hp[(i + n - 1) % n][1])));
    const arc = [...hp.slice(startIdx), ...hp.slice(0, startIdx)].filter(([x, y]) => keep(x, y))
      .map(([x, y]) => [cx + (x - cx) * 1.03, hc + (y - hc) * 1.03] as P2);
    if (arc.length < 3) return;
    if (o.hat === "hair") { // scalloped lower edge
      const [x0, y0] = arc[arc.length - 1], [x1, y1] = arc[0];
      for (let i = 1; i < 6; i++) arc.push([x0 + ((x1 - x0) * i) / 6, y0 + ((y1 - y0) * i) / 6 + (i % 2 ? 4 * u : 0)]);
    }
    const col = o.hat === "cap" ? o.cap! : o.hair!;
    p.shadedFill(arc, col, mul(col, SH_FELT), light, H.a, 0.35);
    p.poly(arc, null, ow);
    if (o.hat === "hair") {
      const s = side ? -1 : facing || 1;
      p.stroke([[cx + s * 10 * u, cut - 30 * u], [cx + s * 2 * u, cut - 12 * u]], 1.2 * u);
    }
    if (o.hat === "cap" && o.propeller) {   // beanie propeller: a post + two coloured blades on the crown
      const [px, py] = R([[cx, crown - 2 * u]])[0];
      p.stroke([[px, py], [px, py - 14 * u]], 3 * u);
      p.ell(px - 16 * u, py - 16 * u, 16 * u, 5 * u, "#e2453c", 2 * u); p.ell(px + 16 * u, py - 16 * u, 16 * u, 5 * u, "#3f6fb5", 2 * u);
      p.dot(px, py - 16 * u, 4 * u, "#ffd23f");
    }
    if (o.hat === "cap") {
      const deg = (a * 180) / Math.PI;
      if (o.capBack) {   // worn backwards: the peak sticks out behind, low at the back of the head
        const s = side ? -1 : (facing ? -facing : 1), [px, py] = R([[cx + s * 0.42 * W, cut - 4 * u]])[0];
        p.ell(px, py, 18 * u, 0.05 * HH, shade(col, 0.8), ow, 0, 360, deg + s * 18);
      } else if (side) p.poly(R([[cx + 40 * u, cut - 2 * u], [cx + 74 * u, cut + 4 * u], [cx + 40 * u, cut + 6 * u]]), shade(col, 0.8), ow);
      else {
        const s = facing || (rnd(seed, 21) < 0.5 ? -1 : 1), [px, py] = R([[cx + s * 4 * u, cut + 1.5 * u]])[0];
        p.ell(px, py, 32 * u, 0.06 * HH, shade(col, 0.8), ow, 0, 180, deg);
      }
    }
  } else if (o.hat === "tophat") {
    const yb = crown + 0.22 * HH, ht = 0.8 * HH, wb = 0.31 * W, wt = 0.33 * W, col = "#2e2a36";
    const body = R([...sag(yb, wb).reverse(), [cx - wt, yb - ht], [cx + wt, yb - ht]]);
    p.shadedFill(body, col, mul(col, SH_FELT), light, wt, 0.4);
    p.clip(body, () => p.band(R([[cx - wt - 4 * u, yb - 0.13 * HH], [cx + wt + 4 * u, yb - 0.13 * HH]]), shade(o.jacket, 0.9), 0.14 * HH, 0.8 * u));
    p.poly(body, null, ow);
    const [bx, by] = R([[cx, yb + 1 * u]])[0];
    p.ell(bx, by, 0.45 * W, 0.05 * HH, "#1d1b22", ow, 0, 360, (a * 180) / Math.PI);
  } else if (o.hat === "helmet") {
    // bronze crested helmet: dome over the top of the head down to the brows, cheek guards, a horsehair crest
    const cut = crown + 0.4 * HH, col = "#c9923e";
    const n = hp.length, keep = (_x: number, y: number) => y < cut;
    const startIdx = Math.max(0, hp.findIndex(([x, y], i) => keep(x, y) && !keep(hp[(i + n - 1) % n][0], hp[(i + n - 1) % n][1])));
    const arc = [...hp.slice(startIdx), ...hp.slice(0, startIdx)].filter(([x, y]) => keep(x, y)).map(([x, y]) => [cx + (x - cx) * 1.06, hc + (y - hc) * 1.06] as P2);
    if (arc.length < 3) return;
    const crest = o.crest ?? "#c8323a", s = side ? -6 * u : 0;
    // crest: a tall half-moon of bristles from front to back over the crown
    const top: P2[] = [];
    for (let i = 0; i <= 16; i++) { const t = i / 16; top.push([cx - 34 * u + s + 68 * u * t, crown + 0.02 * HH - Math.sin(Math.PI * t) * 0.4 * HH]); }
    p.poly(R([...top, [cx + 30 * u + s, crown + 0.1 * HH], [cx - 30 * u + s, crown + 0.1 * HH]]), crest, ow);
    for (let i = 1; i < 8; i++) {
      const t = i / 8;
      p.stroke(R([[cx - 34 * u + s + 68 * u * t, crown + 0.02 * HH - Math.sin(Math.PI * t) * 0.34 * HH], [cx - 30 * u + s + 60 * u * t, crown + 0.06 * HH]]), 1.4 * u, shade(crest, 0.7));
    }
    p.shadedFill(arc, col, mul(col, SH_FELT), light, H.a, 0.35);
    p.poly(arc, null, ow);
    const [x0, y0] = arc[arc.length - 1], [x1, y1] = arc[0];
    p.stroke([[x0, y0], [x1, y1]], 3 * u, shade(col, 0.6));
    // cheek guards
    if (!side) for (const sd of [-1, 1]) p.poly(R([[cx + sd * 36 * u, cut - 2 * u], [cx + sd * 47 * u, cut], [cx + sd * 44 * u, hc + 0.3 * HH], [cx + sd * 34 * u, hc + 0.26 * HH]]), col, ow * 0.8);
    else p.poly(R([[cx - 30 * u, cut - 2 * u], [cx - 4 * u, cut], [cx - 8 * u, hc + 0.3 * HH], [cx - 30 * u, hc + 0.28 * HH]]), col, ow * 0.8);
  } else if (o.hat === "bucket" || o.hat === "sunhat") {
    // bucket: soft dome + short sloping brim; sunhat: low crown + very wide straw brim with a ribbon
    const sun = o.hat === "sunhat", col = o.cap ?? (sun ? "#f2d68a" : "#7a8a4a");
    const yb = crown + (sun ? 0.2 : 0.24) * HH, ht = (sun ? 0.26 : 0.3) * HH, wt = (sun ? 0.28 : 0.33) * W;
    const dome: P2[] = [];
    for (let i = 0; i <= 14; i++) { const a2 = Math.PI + (Math.PI * i) / 14; dome.push([cx + Math.cos(a2) * wt, yb + Math.sin(a2) * ht]); }
    const D = R(dome);
    p.shadedFill(D, col, mul(col, SH_FELT), light, wt, 0.4);
    if (sun) p.clip(D, () => p.band(R([[cx - wt - 4 * u, yb - 0.06 * HH], [cx + wt + 4 * u, yb - 0.06 * HH]]), "#c8553d", 0.07 * HH, 0.8 * u));
    p.poly(D, null, ow);
    const [bx, by] = R([[cx + (side ? 6 * u : 0), yb + (sun ? 1 : 4) * u]])[0];
    if (sun) p.ell(bx, by, 0.72 * W, 0.08 * HH, shade(col, 0.92), ow, 0, 360, (a * 180) / Math.PI);
    else p.poly(R([[cx - wt, yb - 2 * u], [cx + wt, yb - 2 * u], [cx + wt + 10 * u, yb + 9 * u], [cx - wt - 10 * u, yb + 9 * u]]), shade(col, 0.88), ow);
  } else if (o.hat === "slouch" || o.hat === "pith") {
    // slouch: Australian army hat, one side of the brim pinned up; pith: white sun helmet
    const pith = o.hat === "pith", col = o.cap ?? (pith ? "#efe6cf" : "#8a7a52");
    const yb = crown + 0.22 * HH, ht = (pith ? 0.42 : 0.32) * HH, wt = (pith ? 0.36 : 0.32) * W;
    const dome: P2[] = [];
    for (let i = 0; i <= 14; i++) { const a2 = Math.PI + (Math.PI * i) / 14; dome.push([cx + Math.cos(a2) * wt, yb + Math.sin(a2) * ht]); }
    const D = R(dome);
    p.shadedFill(D, col, mul(col, SH_FELT), light, wt, 0.4);
    p.clip(D, () => p.band(R([[cx - wt - 4 * u, yb - 0.08 * HH], [cx + wt + 4 * u, yb - 0.08 * HH]]), pith ? "#c9b88f" : "#4a3a26", 0.07 * HH, 0.8 * u));
    p.poly(D, null, ow);
    const [bx, by] = R([[cx + (side ? 6 * u : 0), yb + 2 * u]])[0];
    p.ell(bx, by, (pith ? 0.6 : 0.66) * W, 0.07 * HH, shade(col, 0.88), ow, 0, 360, (a * 180) / Math.PI);
    if (!pith && !side) p.poly(R([[cx - 0.62 * W, yb], [cx - 0.36 * W, yb - 0.3 * HH], [cx - 0.3 * W, yb]]), shade(col, 0.82), ow * 0.8);   // pinned-up side
  } else if (o.hat === "laurel") {
    // gold laurel wreath around the crown: leaves along an arc
    for (const s of [-1, 1]) for (let i = 0; i < 7; i++) {
      const t = i / 6, a2 = Math.PI * (s < 0 ? 1.05 - 0.45 * t : -0.05 + 0.45 * t);
      const [lx, ly] = R([[cx + Math.cos(a2) * H.a * 0.98, hc - Math.abs(Math.sin(a2)) * H.b * 0.92]])[0];
      p.ell(lx, ly, 9 * u, 4.5 * u, "#d9a92a", 1.6 * u, 0, 360, (s * 40 + (s < 0 ? -t : t) * 60));
    }
  } else if (o.hat === "bandana" || o.hat === "headband") {
    const col = o.cap ?? (o.hat === "bandana" ? "#c8323a" : "#ff4fa0"), cut = crown + (o.hat === "bandana" ? 0.3 : 0.24) * HH;
    if (o.hat === "bandana") {
      const n = hp.length, keep = (_x: number, y: number) => y < cut;
      const startIdx = Math.max(0, hp.findIndex(([x, y], i) => keep(x, y) && !keep(hp[(i + n - 1) % n][0], hp[(i + n - 1) % n][1])));
      const arc = [...hp.slice(startIdx), ...hp.slice(0, startIdx)].filter(([x, y]) => keep(x, y)).map(([x, y]) => [cx + (x - cx) * 1.03, hc + (y - hc) * 1.03] as P2);
      if (arc.length > 2) { p.shadedFill(arc, col, mul(col, SH_FELT), light, H.a, 0.35); p.poly(arc, null, ow); for (const [dx, dy] of [[-20, -30], [10, -18], [25, -40]]) p.dot(cx + dx * u, cut + dy * u, 2.5 * u, "#ffffff"); }
      const [kx, ky] = R([[cx - (side ? 46 : 44) * u, cut - 6 * u]])[0];
      p.poly([[kx, ky], [kx - 20 * u, ky + 14 * u], [kx - 8 * u, ky + 22 * u]], col, ow * 0.8);
    } else {
      p.band(R([[cx - 0.5 * W, cut], [cx + 0.5 * W, cut]]), col, 0.09 * HH, ow * 0.6);
      if (o.hair) {
        const n = hp.length, keep = (_x: number, y: number) => y < cut - 0.04 * HH;
        const arc = hp.filter(([x, y]) => keep(x, y));
        void n; if (arc.length > 2) { p.shadedFill(arc, o.hair, mul(o.hair, SH_FELT), light, H.a, 0.35); }
        p.band(R([[cx - 0.5 * W, cut], [cx + 0.5 * W, cut]]), col, 0.09 * HH, ow * 0.6);
      }
    }
  } else if (o.hat === "veil") {
    // bride: a small tiara + sheer veil falling behind (drawn behind the head in hatBehind) and a hair cap
    const cut = crown + 0.3 * HH, n = hp.length, keep = (_x: number, y: number) => y < cut;
    const startIdx = Math.max(0, hp.findIndex(([x, y], i) => keep(x, y) && !keep(hp[(i + n - 1) % n][0], hp[(i + n - 1) % n][1])));
    const arc = [...hp.slice(startIdx), ...hp.slice(0, startIdx)].filter(([x, y]) => keep(x, y)).map(([x, y]) => [cx + (x - cx) * 1.03, hc + (y - hc) * 1.03] as P2);
    const hc2 = o.hair ?? "#5a3b2a";
    if (arc.length > 2) { p.shadedFill(arc, hc2, mul(hc2, SH_FELT), light, H.a, 0.35); p.poly(arc, null, ow); }
    for (let i = 0; i < 5; i++) { const [tx, ty] = R([[cx - 20 * u + i * 10 * u, crown + 0.04 * HH - (i % 2 ? 4 : 9) * u]])[0]; p.ell(tx, ty, 3.5 * u, 3.5 * u, "#f6efe0", 1.2 * u); }
  } else if (o.hat === "crown") {
    const yb = crown + 0.16 * HH, ht = 0.3 * HH, wb = 0.36 * W, col = "#e8b83a";
    const pts: P2[] = [[cx - wb, yb]];
    for (let i = 0; i <= 8; i++) pts.push([cx - wb + (2 * wb * i) / 8, yb - (i % 2 ? 0.55 : 1) * ht]);
    pts.push([cx + wb, yb]);
    const body = R(pts);
    p.shadedFill(body, col, mul(col, SH_FELT), light, wb, 0.4);
    p.poly(body, null, ow);
    for (let i = 0; i <= 8; i += 2) { const [gx, gy] = R([[cx - wb + (2 * wb * i) / 8, yb - ht - 3 * u]])[0]; p.ell(gx, gy, 3.5 * u, 3.5 * u, i === 4 ? "#c8323a" : "#f6efe0", 1.5 * u); }
    const [jx, jy] = R([[cx, yb - 0.3 * ht]])[0]; p.ell(jx, jy, 5 * u, 5 * u, "#3f6fb5", 1.8 * u);
  } else if (o.hat === "explorer") {
    // soft wide-brimmed hat with a low round crown and a red band
    const col = o.cap ?? "#3a2f2a", yb = crown + 0.2 * HH, ht = 0.34 * HH, wt = 0.3 * W;
    const dome: P2[] = [];
    for (let i = 0; i <= 14; i++) { const a2 = Math.PI + (Math.PI * i) / 14; dome.push([cx + Math.cos(a2) * wt, yb + Math.sin(a2) * ht]); }
    const D = R(dome);
    p.shadedFill(D, col, mul(col, SH_FELT), light, wt, 0.4);
    p.clip(D, () => p.band(R([[cx - wt - 4 * u, yb - 0.07 * HH], [cx + wt + 4 * u, yb - 0.07 * HH]]), "#c8323a", 0.08 * HH, 0.8 * u));
    p.poly(D, null, ow);
    const [bx, by] = R([[cx + (side ? 6 * u : 0), yb + 1 * u]])[0];
    p.ell(bx, by, (side ? 0.5 : 0.56) * W, 0.07 * HH, shade(col, 0.85), ow, 0, 360, (a * 180) / Math.PI);
  } else if (o.hat === "chef") {   // tall puffy white toque on a band
    const yb = crown + 0.2 * HH, col = "#ffffff";
    p.band(R([[cx - 0.34 * W, yb], [cx + 0.34 * W, yb]]), "#f2efe8", 0.1 * HH, ow * 0.7);
    for (const [dx, r] of [[-0.22, 0.2], [0, 0.24], [0.22, 0.2], [-0.1, 0.22], [0.12, 0.22]] as const) {
      const [px, py] = R([[cx + dx * W, yb - 0.32 * HH - (dx === 0 ? 0.08 * HH : 0)]])[0];
      p.ell(px, py, r * W, r * HH * 0.9, col, ow * 0.7);
    }
    p.poly(R([[cx - 0.32 * W, yb - 0.04 * HH], [cx + 0.32 * W, yb - 0.04 * HH], [cx + 0.3 * W, yb - 0.3 * HH], [cx - 0.3 * W, yb - 0.3 * HH]]), col, 0);
  } else if (o.hat === "police" || o.hat === "pilot") {   // peaked cap: crown + black visor + badge (pilot: gold wings)
    const col = o.cap ?? "#1f3a6a", yb = crown + 0.22 * HH, wt = 0.36 * W;
    const top = R([[cx - wt, yb - 0.02 * HH], [cx - wt - 6 * u, yb - 0.24 * HH], [cx + wt + 6 * u, yb - 0.24 * HH], [cx + wt, yb - 0.02 * HH]]);
    p.shadedFill(top, col, mul(col, SH_FELT), light, wt, 0.4); p.poly(top, null, ow);
    p.band(R([[cx - wt, yb - 0.05 * HH], [cx + wt, yb - 0.05 * HH]]), "#1d1b22", 0.06 * HH, ow * 0.5);
    const [vx, vy] = R([[cx + (side ? 20 * u : 0), yb + 2 * u]])[0];
    p.ell(vx, vy, (side ? 0.3 : 0.38) * W, 0.05 * HH, "#16151b", ow, 0, 180, (a * 180) / Math.PI);
    const [bx, by] = R([[cx, yb - 0.14 * HH]])[0];
    if (o.hat === "pilot") { p.ell(bx - 10 * u, by, 10 * u, 4 * u, "#e8b83a", 1.4 * u); p.ell(bx + 10 * u, by, 10 * u, 4 * u, "#e8b83a", 1.4 * u); }
    else p.poly([[bx, by - 8 * u], [bx + 7 * u, by], [bx, by + 8 * u], [bx - 7 * u, by]], "#e8b83a", 1.6 * u);
  } else if (o.hat === "beanie" || o.hat === "nightcap") {   // knitted beanie with a fold / floppy night cap with a pom-pom
    const col = o.cap ?? "#c8323a", cut = crown + 0.3 * HH;
    const n = hp.length, keep = (_x: number, y: number) => y < cut;
    const startIdx = Math.max(0, hp.findIndex(([x, y], i) => keep(x, y) && !keep(hp[(i + n - 1) % n][0], hp[(i + n - 1) % n][1])));
    const arc = [...hp.slice(startIdx), ...hp.slice(0, startIdx)].filter(([x, y]) => keep(x, y)).map(([x, y]) => [cx + (x - cx) * 1.05, hc + (y - hc) * 1.05] as P2);
    if (o.hat === "nightcap") { const tip = R([[cx + 0.62 * W, hc - 0.05 * HH]])[0]; arc.splice(Math.floor(arc.length / 2), 0, tip); }
    if (arc.length > 2) { p.shadedFill(arc, col, mul(col, SH_FELT), light, H.a, 0.35); p.poly(arc, null, ow); }
    if (o.hat === "beanie") {
      p.band(R([[cx - 0.5 * W, cut - 0.05 * HH], [cx + 0.5 * W, cut - 0.05 * HH]]), shade(col, 0.85), 0.11 * HH, ow * 0.6);
      for (let k = -3; k <= 3; k++) { const [x0, y0] = R([[cx + k * 0.12 * W, cut - 0.1 * HH]])[0]; p.stroke([[x0, y0], [x0, y0 + 0.09 * HH]], 1.2 * u, shade(col, 0.7)); }
    } else { const [tx, ty] = R([[cx + 0.66 * W, hc - 0.02 * HH]])[0]; p.ell(tx, ty, 9 * u, 9 * u, "#ffffff", ow * 0.6); }
  } else if (o.hat === "bun") {   // ballerina: smooth hair cap + a bun on top with a pink scrunchie
    const hcol = o.hair ?? "#5a3b2a", cut = crown + 0.32 * HH;
    const n = hp.length, keep = (_x: number, y: number) => y < cut;
    const startIdx = Math.max(0, hp.findIndex(([x, y], i) => keep(x, y) && !keep(hp[(i + n - 1) % n][0], hp[(i + n - 1) % n][1])));
    const arc = [...hp.slice(startIdx), ...hp.slice(0, startIdx)].filter(([x, y]) => keep(x, y)).map(([x, y]) => [cx + (x - cx) * 1.03, hc + (y - hc) * 1.03] as P2);
    if (arc.length > 2) { p.shadedFill(arc, hcol, mul(hcol, SH_FELT), light, H.a, 0.35); p.poly(arc, null, ow); }
    const [bx, by] = R([[cx, crown - 0.08 * HH]])[0];
    p.ell(bx, by, 0.2 * W, 0.12 * HH, hcol, ow); p.band([[bx - 0.16 * W, by + 0.08 * HH], [bx + 0.16 * W, by + 0.08 * HH]], "#ff9fc8", 0.04 * HH, ow * 0.5);
  } else if (o.hat === "tricorn") {   // pirate captain's three-cornered hat with a white skull badge
    const col = o.cap ?? "#1d1b22", yb = crown + 0.22 * HH;
    const body = R([[cx - 0.62 * W, yb + 2 * u], [cx - 0.3 * W, yb - 0.34 * HH], [cx, yb - 0.24 * HH], [cx + 0.3 * W, yb - 0.34 * HH], [cx + 0.62 * W, yb + 2 * u], [cx, yb + 0.08 * HH]]);
    p.shadedFill(body, col, mul(col, SH_FELT), light, 0.6 * W, 0.4); p.poly(body, null, ow);
    p.band(R([[cx - 0.6 * W, yb], [cx, yb + 0.07 * HH], [cx + 0.6 * W, yb]]), "#e8b83a", 0.03 * HH, ow * 0.4);
    const [sx, sy] = R([[cx, yb - 0.1 * HH]])[0];
    p.ell(sx, sy, 9 * u, 8 * u, "#f7f5f0", 1.6 * u); p.dot(sx - 3 * u, sy - u, 2 * u); p.dot(sx + 3 * u, sy - u, 2 * u);
    p.stroke([[sx - 9 * u, sy + 10 * u], [sx + 9 * u, sy + 4 * u]], 2.4 * u, "#f7f5f0"); p.stroke([[sx + 9 * u, sy + 10 * u], [sx - 9 * u, sy + 4 * u]], 2.4 * u, "#f7f5f0");
  } else if (o.hat === "gradcap") {   // mortarboard: skull cap + flat diamond board + tassel
    const col = o.cap ?? "#1d1b22", yb = crown + 0.2 * HH;
    const dome: P2[] = [];
    for (let i = 0; i <= 14; i++) { const a2 = Math.PI + (Math.PI * i) / 14; dome.push([cx + Math.cos(a2) * 0.34 * W, yb + Math.sin(a2) * 0.16 * HH]); }
    p.poly(R(dome), col, ow);
    const ty = yb - 0.16 * HH;
    p.poly(R([[cx - 0.6 * W, ty], [cx, ty - 0.1 * HH], [cx + 0.6 * W, ty], [cx, ty + 0.1 * HH]]), col, ow);
    const [kx, ky] = R([[cx, ty]])[0];
    p.dot(kx, ky, 4 * u, "#e8b83a");
    p.stroke([[kx, ky], [kx + 0.4 * W, ky + 4 * u], [kx + 0.42 * W, ky + 0.24 * HH]], 2.6 * u, "#e8b83a");
  } else if (o.hat === "bonnet") {
    const [bx, by] = R([[cx + (side ? 6 * u : 0), crown + 0.16 * HH]])[0];
    p.arc(bx, by, 0.5 * W, 0.2 * HH, 200, 340, 7 * u, BONNET_BRIM);
    p.arc(bx, by, 0.5 * W + 3.5 * u, 0.2 * HH + 3.5 * u, 200, 340, 1.2 * u);
    const cy = hc + H.b * 0.98;
    p.stroke([[cx - 14 * u, cy - 4 * u], [cx, cy + 2 * u], [cx + 14 * u, cy - 4 * u]], 2 * u, BONNET_BRIM);
  }
};

/** full beard: a crescent hugging the jaw below the mouth line (drawn before the face so the mouth stays on top) */
const beardOn = (p: Pen, col: string, H: Blob, cx: number, hc: number, u: number, thick: number, ow: number, side = false) => {
  const pts: P2[] = [];
  const a0 = side ? 10 : 14, a1 = side ? 120 : 166;
  for (let d = a0; d <= a1; d += 6) { const a2 = rad(d); pts.push([cx + Math.cos(a2) * H.a * (side ? 0.8 : 0.96), hc + Math.sin(a2) * H.b * 1.08 + 4 * u]); }
  for (let d = a1; d >= a0; d -= 6) { const a2 = rad(d); pts.push([cx + Math.cos(a2) * H.a * (side ? 0.42 : 0.5), hc + 30 * u + Math.sin(a2) * 8 * u]); }
  p.poly(pts, col, ow * 0.8);
  for (let i = 0; i < 5; i++) {
    const a2 = rad(a0 + ((a1 - a0) * (i + 0.5)) / 5);
    p.stroke([[cx + Math.cos(a2) * H.a * 0.66, hc + 36 * u + Math.sin(a2) * 10 * u], [cx + Math.cos(a2) * H.a * 0.74, hc + 44 * u + Math.sin(a2) * 16 * u]], 1.3 * u, shade(col, 0.7));
  }
  void thick;
};

// ---------------- bodies ----------------
export type Arms = [P2[], P2[]];
/** held prop; for the hammer the number is the strike 0 (raised) .. 1 (struck) */
export type Prop = null | "icecream" | "shako" | ["hammer", number];

const BUILD: Record<Build, { a: number; torso: number; legs: number; tw: number }> = {
  adult: { a: 118, torso: 1.1, legs: 1.4, tw: 0.8 },
  stout: { a: 118, torso: 1.15, legs: 1.32, tw: 0.92 },
  kid: { a: 112, torso: 0.85, legs: 1.0, tw: 0.72 },
};

export type FrontOpts = {
  phase?: number; expr?: Expr; mode?: "march" | "stroll" | "stand" | "sit" | "fall" | "chair"; look?: number; blink?: boolean | number; lift?: number;
  prop?: Prop; tilt?: number; headTilt?: number; wave?: number;
  /** lip flap 0..1 while speaking, brows raised (u) on emphasis */
  talk?: number; browUp?: number;
  /** arm pose: "up" = both arms raised (stretch / cheer, wiggled by `wave`), "point" = right arm straight out to the side */
  pose?: "up" | "point" | "shrug" | "hips";
  /** canvas angle the key light comes FROM (painted crescent + thick outline side) */
  light?: number; facing?: -1 | 0 | 1; seed?: number;
};

const footStroke = (p: Pen, a: P2, b: P2, w: number, col: string) => {
  if (col !== INK) p.stroke([a, b], w + 3, INK);
  p.stroke([a, b], w, col);
};

/** an emu (our own drawing): feathered bean body, long tube neck, small head with huge crazy eyes, long legs; side view
 *  facing screen-right (the card mirrors it). Same 600 x 1000 design space as the cast, soles at 975. */
export const emuBody = (p: Pen, o: Outfit, expr: Expr, phase: number, moving: boolean, light: number) => {
  const two = Math.PI * 2, body = o.jacket || "#7a5a3a", dark = shade(body, 0.62);
  p.rot = null;
  const hip: P2 = [290, 640];
  for (const [ph, far] of [[0.5, true], [0, false]] as const) {
    const sw = moving ? Math.sin(two * (phase + ph)) : 0, up = moving ? Math.max(0, Math.sin(two * (phase + ph))) * 40 : 0;
    const foot: P2 = [hip[0] + sw * 70 + (far ? -18 : 12), 970 - up], knee: P2 = [hip[0] + 30 + sw * 20, 805 - up * 0.4];
    p.stroke([hip, knee, foot], 15, far ? "#3a3036" : "#5a4a50");
    p.stroke([[foot[0] - 10, foot[1]], [foot[0] + 36, foot[1] + 2]], 12, far ? "#3a3036" : "#5a4a50");
  }
  const bob = moving ? 10 * Math.cos(2 * two * phase) : 0;
  const B: P2[] = [];
  for (let i = 0; i <= 40; i++) { const a = (i / 40) * two, rough = 1 + 0.06 * Math.sin(a * 11); B.push([300 + 150 * Math.cos(a) * rough, 560 + bob + 95 * Math.sin(a) * rough * (Math.sin(a) > 0 ? 1.1 : 1)]); }
  p.gradFill(B, body, dark, light); p.poly(B, null, 11);
  for (let k = 0; k < 9; k++) { const x = 200 + k * 24, y = 545 + bob + (k % 2) * 30; p.arc(x, y, 26, 18, 20, 160, 5, dark); }
  // tail fluff
  p.poly([[160, 520 + bob], [118, 500 + bob], [128, 560 + bob], [170, 585 + bob]], body, 9);
  // neck + head
  const nk: P2[] = [[400, 505 + bob], [430, 420 + bob], [432, 320 + bob], [445, 240 + bob]];
  p.stroke(nk, 46, INK); p.stroke(nk, 30, "#5d6f8a");
  const H = ellPts(462, 220 + bob, 44, 36);
  p.gradFill(H, "#4f5f7a", "#33405a", light); p.poly(H, null, 9);
  p.poly([[498, 214 + bob], [552, 228 + bob], [500, 240 + bob]], "#3a3036", 7);   // beak
  const F = FACE[expr], ey = 205 + bob;
  for (const [ex, k] of [[452, 1], [480, 0.85]] as const) {
    if (F.eye[1] === "squeeze" || F.eye[0] === "squeeze") { p.stroke([[ex + 10, ey - 10], [ex - 6, ey], [ex + 10, ey + 10]], 5); continue; }
    if (F.eye[0] === "spiral") { const s: P2[] = []; for (let t = 1; t < 14; t++) s.push([ex + Math.cos(t * 0.9) * t * 1.2, ey + Math.sin(t * 0.9) * t * 1.2]); p.ell(ex, ey, 17 * k, 17 * k, WHITE, 3.5); p.stroke(s, 3); continue; }
    p.ell(ex, ey, 17 * k, 18 * k, WHITE, 3.5);
    p.dot(ex + (expr === "shock" ? 0 : 4), ey + (expr === "shock" ? 0 : 3), expr === "shock" ? 4 : 7);
  }
  if (o.hat === "slouch") {   // the soldier's slouch hat, perched on the emu
    p.poly(ellPts(462, 186 + bob, 40, 26, 180, 360), "#8a7a52", 7);
    p.ell(462, 188 + bob, 72, 12, "#7a6a46", 7, 0, 360, -6);
  }
};

export const bodyFront = (p: Pen, o: Outfit, opts: FrontOpts) => {
  if (o.creature === "emu") { emuBody(p, o, opts.expr ?? "neutral", opts.phase ?? 0, opts.mode === "march" || opts.mode === "stroll", opts.light ?? DEF_LIGHT); return; }
  const { phase = 0, expr = "neutral", mode = "march", look = 0, blink = false, lift = 60, prop = null, tilt = 0, headTilt = 0, wave,
    light = DEF_LIGHT, facing = 0, seed = 1 } = opts;
  const Bd = BUILD[o.build ?? "adult"], skin = o.skin ?? SKIN, two = Math.PI * 2, lid = lidOf(blink);
  const H = headBlob(seed, Bd.a, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const tall = (1 + Bd.torso + Bd.legs) * HH, sole = 975;
  // body bob 5 % (march) / 3 % (stroll) of the height, lowest at contact (phase 0 and 0.5)
  const bob = mode === "march" ? 0.025 * tall * Math.cos(2 * two * phase) : mode === "stroll" ? 0.015 * tall * Math.cos(2 * two * phase) : 0;
  // chair: hips on a seat at ~55 % of the leg height, thighs toward the lens (short in front view), shins straight down
  const torsoBot = mode === "sit" ? sole - 0.2 * HH : mode === "chair" ? sole - 0.58 * Bd.legs * HH : sole - Bd.legs * HH + bob;
  const chin = torsoBot - Bd.torso * HH, hc = chin - H.b, crown = hc - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u;
  const legCol = mix(o.pants, INK, 0.55), armCol = mix(o.jacket, INK, 0.5), footCol = o.boots;
  const legW = 5.8 * u, footW = 7.5 * u;
  // ---- legs + feet (not rotated) ----
  p.rot = null;
  if (mode === "chair") {
    for (const side of [-1, 1]) {
      const h: P2 = [300 + side * 15 * u, hipY], k: P2 = [300 + side * 24 * u, hipY + 0.1 * HH], f: P2 = [300 + side * 25 * u, sole - 6 * u];
      p.stroke([h, k], legW * 1.15, legCol); p.stroke([k, f], legW, legCol);
      footStroke(p, [f[0] - side * 3 * u, f[1]], [f[0] + side * 12 * u, f[1] + 2 * u], footW, footCol);
    }
  } else if (mode === "sit") {
    for (const side of [-1, 1]) {
      const h: P2 = [300 + side * 15 * u, hipY], k: P2 = [300 + side * 36 * u, hipY + 0.2 * HH], f: P2 = [300 + side * 44 * u, sole - 8 * u];
      p.stroke(curve(h, k, f), legW, legCol);
      footStroke(p, [f[0] - side * 2 * u, f[1]], [f[0] + side * 12 * u, f[1] - 5 * u], footW, footCol);
    }
  } else if (mode === "fall") {
    const legs: [P2, P2, P2][] = [
      [[300 - 15 * u, hipY], [300 - 46 * u, hipY + 0.5 * HH], [300 - 70 * u, hipY + 0.72 * HH]],
      [[300 + 15 * u, hipY], [300 + 50 * u, hipY + 0.45 * HH], [300 + 76 * u, hipY + 0.22 * HH]],
    ];
    legs.forEach(([h, k, f], i) => {
      p.stroke(curve(h, k, f), legW, legCol);
      footStroke(p, f, [f[0] + (i ? 14 : -14) * u, f[1] + (i ? -6 : 4) * u], footW, footCol);
    });
  } else if (o.dress) {
    for (const side of [-1, 1]) {
      const fx = 300 + side * 12 * u, fy = sole - 4 * u;
      p.stroke([[fx, sole - 0.4 * HH], [fx + side * u, fy]], legW, legCol);
      footStroke(p, [fx - side * 3 * u, fy], [fx + side * 12 * u, fy + u], footW, footCol);
    }
  } else {
    const L = mode === "march" ? lift * 1.25 : mode === "stroll" ? lift * 0.55 : 0;
    for (const [side, ph] of [[-1, 0], [1, 0.5]] as const) {
      const up = Math.max(0, Math.sin(two * (phase + ph))) * L;
      const hx = 300 + side * 15 * u, fx = 300 + side * 22 * u, fy = sole - 4 * u - up;
      const k: P2 = [(hx + fx) / 2 + side * (1.5 * u + up * 0.16), (hipY + fy) / 2 - up * 0.08];
      p.stroke(curve([hx, hipY], k, [fx, fy]), legW, legCol);
      footStroke(p, [fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u], footW, footCol);
    }
  }
  // ---- upper body: rotates about the hips (tilt + a small weight-shift sway on every step) ----
  const sway = mode === "march" ? 1.6 * Math.sin(two * phase) : mode === "stroll" ? 1.0 * Math.sin(two * phase) : 0;
  const A = tilt + sway;
  p.rot = A ? [rad(A), 300, hipY] : null;
  const dress = !!o.dress && mode !== "sit" && mode !== "fall" && mode !== "chair";
  const T: Blob = { a: ((Bd.tw / 2) * W) / 1.06, b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.6, egg: o.build === "stout" ? 0.17 : 0.12,
    asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = 300 + 3 * u * facing, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const sh = (side: number): P2 => [tcx + side * 0.85 * T.a, chin + 0.12 * HH];
  const hang = (side: number, fwd: number): [P2, P2, P2] => {
    const S = sh(side), ex = tcx + side * (1.12 * T.a + 4 * u);
    const hx = ex + side * 3 * u - side * 6 * u * Math.max(0, fwd) + side * 4 * u * Math.max(0, -fwd);
    return [S, [ex, S[1] + 0.48 * HH], [hx, chin + 1.04 * HH - Math.abs(fwd) * 9 * u]];
  };
  const sw = mode === "march" || mode === "stroll" ? Math.sin(two * phase) : 0;
  // rifle at the order: butt by the right hip, held by the hanging right hand, muzzle past the crown
  const R0: P2 = [300 + 47 * u, torsoBot + 0.12 * HH], R1: P2 = [300 + 64 * u, crown - 0.32 * HH];
  const rifle = !!o.rifle && (mode === "march" || mode === "stand" || mode === "stroll");
  type Arm = { pts: [P2, P2, P2]; front: boolean };
  const arms: Arm[] = [];
  const pose = opts.pose;
  if (pose === "up" && mode !== "fall") for (const side of [-1, 1]) {
    const w = (wave ?? 0) * side, S = sh(side);
    // a wide V so the raised arms clear the head (they are drawn behind it)
    arms.push({ pts: [S, [tcx + side * (1.35 * T.a + 20 * u) + 4 * u * w, S[1] - 0.3 * HH], [tcx + side * (1.8 * T.a + 38 * u) + 10 * u * w, S[1] - 0.86 * HH]], front: false });
  }
  else if (mode === "sit" || (mode === "chair" && !pose && wave === undefined && !prop)) for (const side of [-1, 1]) arms.push({ pts: [sh(side), [tcx + side * (1.1 * T.a + 6 * u), sh(side)[1] + 0.4 * HH], [tcx + side * (1.2 * T.a + 10 * u), torsoBot + 0.04 * HH]], front: false });
  else if (mode === "fall") for (const side of [-1, 1]) arms.push({ pts: [sh(side), [tcx + side * (1.15 * T.a + 12 * u), sh(side)[1] - 0.25 * HH], [tcx + side * (1.3 * T.a + 24 * u), sh(side)[1] - 0.68 * HH]], front: false });
  else {
    arms.push({ pts: prop === "shako" ? hang(-1, 0) : hang(-1, -sw), front: false });
    if (rifle) {
      const G = lerp2(R0, R1, 0.1);
      arms.push({ pts: [sh(1), [tcx + 1.12 * T.a + 5 * u, sh(1)[1] + 0.45 * HH], G], front: false });
    } else if (pose === "shrug" || pose === "hips") {
      arms.pop();   // both arms posed: replace the hanging left one too
      for (const side of [-1, 1]) {
        const S = sh(side), w = (wave ?? 0) * 2 * u;
        arms.push(pose === "shrug"
          // elbows tucked by the waist, forearms out and up, open palms at shoulder height ("who knows?")
          ? { pts: [S, [tcx + side * (1.15 * T.a + 6 * u), S[1] + 0.42 * HH], [tcx + side * (1.55 * T.a + 30 * u), S[1] - 0.02 * HH + w]], front: false }
          // fists on the hips, elbows pointing out (confident / "seriously?")
          : { pts: [S, [tcx + side * (1.45 * T.a + 22 * u), S[1] + 0.3 * HH], [tcx + side * (0.98 * T.a + 2 * u), hipY - 0.06 * HH]], front: false });
      }
    } else if (pose === "point") {
      const S = sh(1), k = (wave ?? 0) * 3 * u;
      arms.push({ pts: [S, [tcx + 1.3 * T.a + 22 * u, S[1] - 0.06 * HH + k], [tcx + 1.55 * T.a + 50 * u, S[1] - 0.14 * HH + k]], front: false });
    } else if (wave !== undefined) {
      const S = sh(1);
      arms.push({ pts: [S, [tcx + 1.1 * T.a + 10 * u + 3 * u * wave, S[1] - 0.22 * HH], [tcx + 1.18 * T.a + 16 * u + 12 * u * wave, S[1] - 0.6 * HH]], front: false });
    } else if (prop === "icecream") {
      const S = sh(1);
      arms.push({ pts: [S, [tcx + 1.05 * T.a + 4 * u, S[1] + 0.45 * HH], [tcx + 0.5 * T.a, S[1] + 0.4 * HH]], front: true });
    } else if (Array.isArray(prop)) {
      const S = sh(1), k = clamp(prop[1], 0, 1);
      const E = lerp2([tcx + 1.1 * T.a + 10 * u, S[1] - 0.15 * HH], [tcx + 1.2 * T.a + 10 * u, S[1] + 0.3 * HH], k);
      const Hd = lerp2([tcx + 1.15 * T.a + 14 * u, S[1] - 0.55 * HH], [tcx + 1.45 * T.a + 22 * u, S[1] + 0.35 * HH], k);
      arms.push({ pts: [S, E, Hd], front: true });
    } else arms.push({ pts: hang(1, sw), front: false });
  }
  const drawArm = (a: Arm) => { p.stroke(curve(a.pts[0], a.pts[1], a.pts[2]), 5.2 * u, armCol); p.dot(a.pts[2][0], a.pts[2][1], 5.5 * u); };
  // behind the body: rifle, sword, arms
  if (rifle) {
    p.band([R0, R1], "#7a4b2a", 5 * u, 1.5 * u, "round");
    p.band([lerp2(R0, R1, 0.6), R1], "#8d949c", 2.4 * u, 1.2 * u, "round");
  }
  if (o.sword && mode !== "sit") {
    const s0: P2 = [tcx - 0.75 * T.a, torsoBot - 0.2 * HH];
    p.band([s0, [s0[0] - Math.sin(rad(25)) * 0.8 * HH, s0[1] + Math.cos(rad(25)) * 0.8 * HH]], "#c9ccd2", 3 * u, 1.2 * u, "round");
  }
  for (const a of arms) if (!a.front) drawArm(a);
  // torso / dress: shaded fill -> clothing clipped to it -> thick-thin ink ring
  if (dress) {
    const D: Blob = { a: 0.5 * W * 0.98, b: 0.5 * ((sole - 0.35 * HH) - (chin - 0.2 * HH)), nTop: 2.0, nBot: 3.0, egg: 0.35, asym: 0.03 * facing, rot: 0, noise: 0.006, seed: seed + 9 };
    const dp = blobPts(300, sole - 0.35 * HH - D.b, D);
    p.gradFill(dp, o.dress!, mul(o.dress!, SH_CLOTH), light);
    p.inkRing(dp, ow, thick);
    const Sw: Blob = { a: 0.37 * W, b: 0.3 * HH, nTop: 2.2, nBot: 2.4, egg: 0.1, asym: 0, rot: 0, noise: 0.006, seed: seed + 8 };
    const sp = blobPts(300, chin + 0.12 * HH, Sw);
    p.gradFill(sp, o.jacket, mul(o.jacket, SH_CLOTH), light);
    p.inkRing(sp, ow * 0.9, thick);
  } else {
    p.gradFill(tp, o.jacket, mul(o.jacket, SH_CLOTH), light);
    p.clip(tp, () => {
      if (o.belt) {
        for (const s of [-1, 1]) p.band([[tcx - s * 0.75 * T.a, chin - 0.05 * HH], [tcx + s * 0.8 * T.a, torsoBot - 0.1 * HH]], o.belt!, 5.5 * u, 1.8 * u);
        const xc = tcx + 0.025 * T.a, yc = chin - 0.05 * HH + (torsoBot - 0.1 * HH - (chin - 0.05 * HH)) * (0.75 / 1.55);
        p.poly([[xc - 3.5 * u, yc - 3.5 * u], [xc + 3.5 * u, yc - 3.5 * u], [xc + 3.5 * u, yc + 3.5 * u], [xc - 3.5 * u, yc + 3.5 * u]], "#d9dde0", 1.5 * u);
      }
      if (o.sash) p.band([[tcx - 1.3 * T.a, torsoBot - 0.32 * HH], [tcx + 1.3 * T.a, torsoBot - 0.32 * HH]], o.sash, 0.13 * HH, 1.8 * u);
      if (o.stripes) for (let y = chin; y < torsoBot + 10; y += 0.11 * HH) p.band([[tcx - 1.3 * T.a, y], [tcx + 1.3 * T.a, y]], o.stripes, 0.045 * HH, 0);
      if (o.toga) {   // drape from the left shoulder to the right hip, folds
        const s0: P2 = [tcx - 0.9 * T.a, chin], s1: P2 = [tcx + 1.1 * T.a, torsoBot - 0.1 * HH];
        p.band([s0, s1], o.toga, 0.22 * HH, 1.6 * u);
        for (const k of [0.3, 0.55, 0.8]) p.stroke([lerp2(s0, s1, k), [lerp2(s0, s1, k)[0] - 10 * u, lerp2(s0, s1, k)[1] + 14 * u]], 1.6 * u, shade(o.toga, 0.75));
      }
      if (o.tie) {   // shirt V + necktie down the front
        const tx0 = tcx + 2 * u * facing, ty0 = chin - 0.02 * HH;
        p.poly([[tx0 - 13 * u, ty0], [tx0 + 13 * u, ty0], [tx0, ty0 + 0.34 * HH]], "#f7f5f0", 1.4 * u);
        p.poly([[tx0 - 4 * u, ty0 + 2 * u], [tx0 + 4 * u, ty0 + 2 * u], [tx0 + 3 * u, ty0 + 7 * u], [tx0 - 3 * u, ty0 + 7 * u]], o.tie, 1.4 * u);
        p.poly([[tx0 - 3 * u, ty0 + 7 * u], [tx0 + 3 * u, ty0 + 7 * u], [tx0 + 6 * u, ty0 + 0.62 * HH], [tx0, ty0 + 0.7 * HH], [tx0 - 6 * u, ty0 + 0.62 * HH]], o.tie, 1.4 * u);
      }
      if (o.pockets) for (const s of [-1, 1]) for (const k of [0.3, 0.62]) {
        const px = tcx + s * 0.42 * T.a, py = chin + k * (torsoBot - chin);
        p.poly([[px - 9 * u, py], [px + 9 * u, py], [px + 9 * u, py + 12 * u], [px - 9 * u, py + 12 * u]], shade(o.jacket, 0.85), 1.4 * u);
      }
      if (o.rope) for (const k of [0.22, 0.5, 0.78]) { const y = chin + k * (torsoBot - chin); p.band([[tcx - 1.3 * T.a, y + 4 * u], [tcx + 1.3 * T.a, y - 4 * u]], o.rope, 0.06 * HH, 1.4 * u); }
      if (o.bowtie) {
        const bx = tcx + 2 * u * facing, by = chin + 4 * u;
        p.poly([[bx - 2 * u, by], [bx - 14 * u, by - 7 * u], [bx - 14 * u, by + 7 * u]], "#1d1b22", 1.2 * u);
        p.poly([[bx + 2 * u, by], [bx + 14 * u, by - 7 * u], [bx + 14 * u, by + 7 * u]], "#1d1b22", 1.2 * u);
        p.poly([[bx - 10 * u, by + 9 * u], [bx + 10 * u, by + 9 * u], [bx, by + 0.4 * HH]], "#f7f5f0", 1.2 * u);
      }
      if (o.vest) {   // hi-vis safety vest: neon panels + two silver reflective bands
        for (const s of [-1, 1]) p.poly([[tcx + s * 6 * u, chin - 2 * u], [tcx + s * 1.4 * T.a, chin - 2 * u], [tcx + s * 1.4 * T.a, torsoBot + 10], [tcx + s * 8 * u, torsoBot + 10]], o.vest, 1.6 * u);
        for (const k of [0.45, 0.72]) { const y = chin + k * (torsoBot - chin); p.band([[tcx - 1.4 * T.a, y], [tcx - 8 * u, y]], "#dfe3e8", 0.06 * HH, 1.2 * u); p.band([[tcx + 8 * u, y], [tcx + 1.4 * T.a, y]], "#dfe3e8", 0.06 * HH, 1.2 * u); }
      }
      if (o.apron) {   // chef's apron bib + neck strap + pocket
        p.poly([[tcx - 0.5 * T.a, chin + 0.12 * HH], [tcx + 0.5 * T.a, chin + 0.12 * HH], [tcx + 0.8 * T.a, torsoBot + 10], [tcx - 0.8 * T.a, torsoBot + 10]], o.apron, 1.6 * u);
        p.stroke([[tcx - 0.45 * T.a, chin + 0.12 * HH], [tcx, chin - 4 * u], [tcx + 0.45 * T.a, chin + 0.12 * HH]], 2 * u, shade(o.apron, 0.8));
        p.poly([[tcx - 12 * u, chin + 0.5 * HH], [tcx + 12 * u, chin + 0.5 * HH], [tcx + 12 * u, chin + 0.62 * HH], [tcx - 12 * u, chin + 0.62 * HH]], shade(o.apron, 0.9), 1.2 * u);
        for (const s of [-1, 1]) for (let k = 0; k < 2; k++) p.dot(tcx + s * 0.3 * T.a, chin + (0.05 + k * 0.1) * HH, 2.6 * u, "#3a3d47");
      }
      if (o.coat) {   // open white lab coat: lapels over a coloured shirt
        for (const s of [-1, 1]) p.poly([[tcx + s * 4 * u, chin], [tcx + s * 1.4 * T.a, chin], [tcx + s * 1.4 * T.a, torsoBot + 10], [tcx + s * 10 * u, torsoBot + 10], [tcx + s * 10 * u, chin + 0.3 * HH]], o.coat, 1.6 * u);
        for (const s of [-1, 1]) p.poly([[tcx + s * 0.62 * T.a, chin + 0.55 * HH], [tcx + s * 0.95 * T.a, chin + 0.55 * HH], [tcx + s * 0.95 * T.a, chin + 0.7 * HH], [tcx + s * 0.62 * T.a, chin + 0.7 * HH]], shade(o.coat, 0.9), 1.2 * u);
      }
      if (o.hoodie) {   // hood rim around the neck + two drawstrings with aglets + kangaroo pocket
        p.band([[tcx - 0.75 * T.a, chin + 4 * u], [tcx, chin + 14 * u], [tcx + 0.75 * T.a, chin + 4 * u]], shade(o.jacket, 0.78), 8 * u, 1.4 * u);
        for (const s of [-1, 1]) { p.stroke([[tcx + s * 8 * u, chin + 12 * u], [tcx + s * 10 * u, chin + 0.42 * HH]], 1.8 * u, "#f2efe8"); p.dot(tcx + s * 10 * u, chin + 0.44 * HH, 2.6 * u, "#f2efe8"); }
        p.poly([[tcx - 0.62 * T.a, torsoBot - 0.36 * HH], [tcx + 0.62 * T.a, torsoBot - 0.36 * HH], [tcx + 0.75 * T.a, torsoBot - 0.1 * HH], [tcx - 0.75 * T.a, torsoBot - 0.1 * HH]], shade(o.jacket, 0.88), 1.4 * u);
      }
      if (o.jersey) {   // esports jersey: shoulder panels, a big number
        for (const s of [-1, 1]) p.poly([[tcx + s * 0.4 * T.a, chin - 4 * u], [tcx + s * 1.4 * T.a, chin - 4 * u], [tcx + s * 1.4 * T.a, chin + 0.22 * HH], [tcx + s * 0.6 * T.a, chin + 0.12 * HH]], o.jersey, 0);
        const g = p.g; g.save(); g.fillStyle = "#ffffff"; g.strokeStyle = INK; g.lineWidth = 2 * u; g.font = `900 ${0.32 * HH}px Arial Black, Arial`; g.textAlign = "center";
        g.strokeText("06", tcx, chin + 0.62 * HH); g.fillText("06", tcx, chin + 0.62 * HH); g.restore();
      }
      if (o.patches) for (const [dx, dy, c] of [[-0.45, 0.35, "#e8c45a"], [0.35, 0.62, "#8fd0ff"]] as const) {   // patched-up tee
        const px = tcx + dx * T.a, py = chin + dy * HH;
        p.poly([[px - 9 * u, py - 8 * u], [px + 9 * u, py - 7 * u], [px + 8 * u, py + 8 * u], [px - 8 * u, py + 9 * u]], c, 1.2 * u);
        for (let k = -1; k <= 1; k++) p.stroke([[px - 11 * u, py + k * 5 * u], [px - 7 * u, py + k * 5 * u]], 1 * u);
      }
      if (o.stethoscope) {   // around the neck, chest piece hanging on the right
        p.stroke([[tcx - 0.55 * T.a, chin + 2 * u], [tcx - 0.5 * T.a, chin + 0.3 * HH], [tcx - 0.2 * T.a, chin + 0.42 * HH]], 2.4 * u, "#3a3d47");
        p.stroke([[tcx + 0.55 * T.a, chin + 2 * u], [tcx + 0.5 * T.a, chin + 0.36 * HH]], 2.4 * u, "#3a3d47");
        p.ell(tcx + 0.5 * T.a, chin + 0.4 * HH, 6 * u, 6 * u, "#c9ccd2", 1.6 * u);
      }
      if (!o.rope && !o.tie && !o.pockets && !o.stripes && !o.toga && !o.coat && !o.hoodie && !o.jersey && !o.vest && !o.apron) for (let i = 0; i < 4; i++) {
        const y = chin + 0.12 * HH + i * 0.2 * HH;
        if (o.sash && Math.abs(y - (torsoBot - 0.32 * HH)) < 0.08 * HH) continue;
        p.dot(tcx + 2 * u * facing, y, 2.2 * u + 0.8 * u, INK); p.dot(tcx + 2 * u * facing, y, 2.2 * u, o.buttons ?? shade(o.jacket, 0.7));
      }
    });
    if (o.sash) { const s = facing || 1; p.poly([[tcx + s * 0.55 * T.a, torsoBot - 0.3 * HH], [tcx + s * 0.75 * T.a, torsoBot + 0.05 * HH], [tcx + s * 0.45 * T.a, torsoBot + 0.02 * HH]], o.sash, 1.6 * u); }
    p.inkRing(tp, ow, thick);
  }
  if (o.tutu) {   // a frilly ballet tutu sticking out at the hips
    const ty = torsoBot - 0.18 * HH;
    for (let k = 0; k < 2; k++) {
      const pts: P2[] = [];
      for (let i = 0; i <= 24; i++) { const a2 = (i / 24) * Math.PI * 2; pts.push([tcx + Math.cos(a2) * (1.75 - 0.25 * k) * T.a * (1 + 0.06 * (i % 2)), ty + Math.sin(a2) * (0.13 - 0.03 * k) * HH]); }
      p.poly(pts, k ? "#ffffff" : o.tutu, ow * 0.7);
    }
  }
  // in front of the body: hands holding props
  for (const a of arms) if (a.front) {
    drawArm(a);
    const [hx, hy] = a.pts[2];
    if (prop === "icecream") {
      p.poly([[hx - 8 * u, hy - 12 * u], [hx + 8 * u, hy - 12 * u], [hx, hy + 7 * u]], "#e0a35a", 1.8 * u);
      p.ell(hx, hy - 19 * u, 11 * u, 10 * u, "#f7c6d9", 2.2 * u);
      p.dot(hx, hy, 5.5 * u);
    } else if (Array.isArray(prop)) {
      const ang = rad(-70 + 105 * clamp(prop[1], 0, 1));
      const Rh = (pts: P2[]) => rotPts(pts, ang, hx, hy);
      p.band(Rh([[hx, hy + 12 * u], [hx, hy - 44 * u]]), "#8a5a34", 5 * u, 1.5 * u, "round");
      p.poly(Rh([[hx - 12 * u, hy - 58 * u], [hx + 20 * u, hy - 58 * u], [hx + 20 * u, hy - 42 * u], [hx - 12 * u, hy - 42 * u]]), "#7d848c", 2.2 * u);
      p.dot(hx, hy, 5.5 * u);
    }
  }
  if (prop === "shako") { // carried by the left hand
    const [hx, hy] = arms[0].pts[2];
    p.poly([[hx - 14 * u, hy + 3 * u], [hx + 14 * u, hy + 3 * u], [hx + 16 * u, hy + 30 * u], [hx - 16 * u, hy + 30 * u]], "#3a3d47", 2.2 * u);
    p.ell(hx, hy + 31 * u, 3.5 * u, 3.5 * u, "#2b7a4b", 1.5 * u);
    p.dot(hx, hy, 5.5 * u);
  }
  // ---- head: rotates with the body, plus its own tilt about the chin ----
  const Ah = A + headTilt, [cpx, cpy] = rotAbout([300, chin], rad(A), [300, hipY]);
  p.rot = Ah ? [rad(Ah), 300, chin, cpx - 300, cpy - chin] : null;
  hatBehind(p, o, H, 300, hc, light, thick, ow, false);
  const hp = blobPts(300, hc, H);
  p.shadedFill(hp, skin, skinShade(skin), light, H.a);
  p.inkRing(hp, ow, thick);
  hatOn(p, o.hat === "longhair" ? { ...o, hat: "hair", hairCut: 0.27 } : o, hp, H, 300, hc, light, seed, facing, false);
  const brim = !!o.hat && o.hat !== "hair" && o.hat !== "longhair" && o.hat !== "bonnet" && o.hat !== "cap" && o.hat !== "laurel" && o.hat !== "headband" && o.hat !== "veil";
  if (o.beard && o.beardLong) {   // long wizard beard flowing down over the chest
    const bx = 300 + 7 * u * facing;
    p.poly([[bx - 0.42 * W, hc + 0.12 * HH], [bx + 0.42 * W, hc + 0.12 * HH], [bx + 0.3 * W, hc + 0.75 * HH], [bx + 0.06 * W, hc + 1.15 * HH], [bx - 0.06 * W, hc + 1.12 * HH], [bx - 0.3 * W, hc + 0.75 * HH]], o.beard, ow * 0.8);
    for (let i = 0; i < 5; i++) p.stroke([[bx - 0.2 * W + i * 0.1 * W, hc + 0.5 * HH], [bx - 0.14 * W + i * 0.07 * W, hc + 0.85 * HH]], 1.3 * u, shade(o.beard, 0.8));
  }
  if (o.beard) beardOn(p, o.beard, H, 300 + 7 * u * facing, hc, u, thick, ow);
  setFaceAnim(opts.talk ?? 0, opts.browUp ?? 0);
  faceFront(p, 300, hc, W, expr, facing, look, lid, brim, skin, o.moustache, o.build === "stout", !!o.cyclops);
  setFaceAnim(0, 0);
  if (o.headset) {   // gaming headset: band over the crown, big ear cups, a mic boom
    const col = o.headset;
    p.arc(300, hc - 2 * u, 0.53 * W, 0.56 * HH, 195, 345, 7 * u, INK);
    p.arc(300, hc - 2 * u, 0.53 * W, 0.56 * HH, 195, 345, 4.5 * u, col);
    for (const s of [-1, 1]) { p.ell(300 + s * 0.5 * W, hc + 4 * u, 11 * u, 17 * u, col, 2.6 * u); p.ell(300 + s * 0.5 * W, hc + 4 * u, 5 * u, 9 * u, "#39d9ff", 0); }
    p.stroke([[300 - 0.5 * W, hc + 14 * u], [300 - 0.3 * W, hc + 28 * u], [300 - 0.14 * W, hc + 26 * u]], 3 * u);
    p.dot(300 - 0.14 * W, hc + 26 * u, 4 * u);
  }
  if (o.eyepatch) {   // pirate patch over the left eye + strap
    const fx = 300 + 7 * u * facing;
    p.stroke([[300 - 48 * u, hc - 22 * u], [300 + 48 * u, hc - 2 * u]], 2.6 * u);
    p.poly(ellPts(fx - 13 * u, hc + 1 * u, 11 * u, 10 * u), "#1d1b22", 2 * u);
  }
  if (o.shades) {   // big black sunglasses over the eyes (brows and mouth still act)
    const fx = 300 + 7 * u * facing, ey = hc;
    for (const s of [-1, 1]) {
      const lens = ellPts(fx + s * 14 * u, ey + 1 * u, 12 * u, 9 * u);
      p.poly(lens, "#1d1b22", 2.6 * u);
      p.stroke([[fx + s * 14 * u - 6 * u, ey - 4 * u], [fx + s * 14 * u - 1 * u, ey - 6 * u]], 2.2 * u, "rgba(255,255,255,0.7)");
    }
    p.stroke([[fx - 3 * u, ey - 2 * u], [fx + 3 * u, ey - 2 * u]], 2.6 * u);
  }
  if (o.glasses) {   // round reading glasses (eyes stay visible through clear lenses)
    const fx = 300 + 7 * u * facing, ey = hc;
    for (const s of [-1, 1]) p.ell(fx + s * 14 * u, ey + 1 * u, 11 * u, 10 * u, "rgba(220,240,255,0.25)", 2.4 * u);
    p.stroke([[fx - 3 * u, ey - 1 * u], [fx + 3 * u, ey - 1 * u]], 2.2 * u);
  }
  if (o.headMirror) {   // doctor's head mirror on a band over the forehead
    p.stroke([[300 - 0.5 * W, hc - 30 * u], [300 + 0.5 * W, hc - 30 * u]], 3 * u, "#2b2b38");
    p.ell(300 - 14 * u, hc - 34 * u, 13 * u, 13 * u, "#dfe8ef", 2.4 * u); p.ell(300 - 14 * u, hc - 34 * u, 4 * u, 4 * u, "#9aa4ad", 0);
  }
  p.rot = null;
};

export type SideOpts = {
  phase?: number; expr?: Expr; mode?: "march" | "stand" | "swing" | "push"; blink?: boolean | number; stomp?: number; pose?: number;
  /** step length as a multiple of 0.8 m (370 units): matches 1.6 m/s at 2 steps/s; scale by the view's foreshortening */
  stride?: number; light?: number; seed?: number;
  /** push mode: where the hands land at pose 1, in final canvas units (e.g. the swing kid's back) */
  hand?: [number, number];
};

/** two-bone leg, knee bending forward (+x) */
const ik = (hip: P2, ank: P2, l1: number, l2: number): P2 => {
  const dx = ank[0] - hip[0], dy = ank[1] - hip[1], d = clamp(Math.hypot(dx, dy), 1, l1 + l2 - 0.01);
  const A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), k = Math.atan2(dy, dx) - A;
  return [hip[0] + l1 * Math.cos(k), hip[1] + l1 * Math.sin(k)];
};

/** hip height of the seated kid in `swing` mode (design units); swingKid seats the torso bottom on the plank */
const SWING_HIP = 733;

/** side view facing screen-right; march footfalls land at phase 0 (near foot) and 0.5 (far foot), like the front view.
 *  The stance foot is planted: it slides back at exactly the walking speed while the hip rises and falls over it. */
export const bodySide = (p: Pen, o: Outfit, opts: SideOpts) => {
  if (o.creature === "emu") { emuBody(p, o, opts.expr ?? "neutral", opts.phase ?? 0, opts.mode === "march", opts.light ?? DEF_LIGHT); return; }
  const { phase = 0, expr = "neutral", mode = "march", blink = false, stomp = 1, pose = 0, stride = 1, light = DEF_LIGHT, seed = 1 } = opts;
  const Bd = BUILD[o.build ?? "adult"], skin = o.skin ?? SKIN, two = Math.PI * 2, lid = lidOf(blink);
  const H: Blob = { ...headBlob(seed, Bd.a, 1), asym: 0.12, rot: rad(3 + 3 * (rnd(seed, 7) - 0.5)) };
  const W = 2 * H.a, HH = 2 * H.b, u = W / 100, sole = 975, ankY = sole - 4 * u;
  const thick = thickAngle(light), ow = 5 * u;
  const legLen = (Bd.legs + 0.12) * HH - 4 * u, l1 = legLen / 2, l2 = legLen / 2;
  const nearCol = mix(o.pants, INK, 0.55), farCol = mix(o.pants, INK, 0.75), footCol = o.boots;
  type LegS = { ank: P2; pitch: number; near: boolean };
  const legs: LegS[] = [];
  let hipY = ankY - legLen * 0.995, lean = 0, nearFwd = 0;
  if (mode === "march") {
    const S = 370 * stride, liftH = Math.max(22, 40 + 70 * (stomp - 1));
    const st = (ph: number) => {
      const c = (((phase + ph) % 1) + 1) % 1;
      if (c < 0.5) { const s = c / 0.5; return { x: S / 2 - S * s, h: 0, stance: true, s }; }
      const s = (c - 0.5) / 0.5; // swing: cycloid in world space, so the foot leaves and lands at zero ground speed
      return { x: -S / 2 + S * s - (S / Math.PI) * Math.sin(2 * Math.PI * s), h: liftH * Math.sin(Math.PI * s), stance: false, s };
    };
    const nL = st(0), fL = st(0.5), stance = nL.stance ? nL : fL;
    const Leff = legLen * (1 - 0.035 * Math.sin(Math.PI * stance.s));
    hipY = ankY - Math.sqrt(Math.max(1, Leff * Leff - stance.x * stance.x));
    for (const [L, near] of [[fL, false], [nL, true]] as const)
      legs.push({ ank: [300 + L.x, ankY - L.h], pitch: L.stance ? 0 : rad(35 * Math.sin(Math.PI * L.s) * (1 - 1.6 * L.s)), near });
    lean = 4 + 3 * Math.cos(2 * two * phase); // 7 deg at contact, 1 deg at passing
    nearFwd = nL.x / (S / 2);
  } else if (mode === "push") {
    hipY = ankY - 0.87 * legLen;
    legs.push({ ank: [300 - 0.5 * legLen, ankY], pitch: rad(-8), near: false }, { ank: [300 + 0.32 * legLen, ankY], pitch: 0, near: true });
    lean = 14 * pose;
  } else if (mode === "swing") {
    hipY = SWING_HIP;
    const a = rad(60 * pose);
    for (const [dx, near] of [[-6, false], [0, true]] as const) {
      const knee: P2 = [300 + l1 * 0.98 + dx * u, hipY + 6 * u];
      legs.push({ ank: [knee[0] + l2 * Math.sin(a), knee[1] + l2 * Math.cos(a)], pitch: -a * 0.5, near });
    }
  } else {
    legs.push({ ank: [300 - 4 * u, ankY], pitch: 0, near: false }, { ank: [300 + 4 * u, ankY], pitch: 0, near: true });
  }
  const torsoBot = hipY + 0.12 * HH, chin = torsoBot - Bd.torso * HH, hc = chin - H.b, crown = hc - H.b, hip: P2 = [300, hipY];
  p.rot = null;
  for (const L of legs) {
    const knee = mode === "swing" ? ([300 + l1 * 0.98 + (L.near ? 0 : -6 * u), hipY + 6 * u] as P2) : ik(hip, L.ank, l1, l2);
    const hp0: P2 = [300 + (L.near ? 0 : -5 * u), hipY];
    p.stroke([hp0, knee, L.ank], 5.8 * u, L.near ? nearCol : farCol);
    const c = Math.cos(L.pitch), s = Math.sin(L.pitch);
    footStroke(p, [L.ank[0] - 3 * u * c, L.ank[1] - 3 * u * s], [L.ank[0] + 13 * u * c, L.ank[1] + 13 * u * s + 0.5 * u],
      7.5 * u, L.near ? footCol : footCol === INK ? INK : shade(footCol, 0.82));
  }
  // ---- upper body leans about the hip ----
  p.rot = lean ? [rad(lean), 300, hipY] : null;
  const T: Blob = { a: (o.build === "stout" ? 0.36 : 0.31) * W, b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.5, egg: 0.1, asym: 0.06,
    rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = 300 + 2 * u, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const armCol = mix(o.jacket, INK, 0.5), farArm = mix(o.jacket, INK, 0.68);
  const S: P2 = [tcx + 0.05 * T.a, chin + 0.14 * HH], aLen = 0.95 * HH;
  const swingArm = (ang: number): [P2, P2, P2] => {
    const e: P2 = [S[0] + Math.sin(ang) * aLen * 0.5, S[1] + Math.cos(ang) * aLen * 0.5], a2 = ang + rad(16) * Math.sign(ang || 1);
    return [S, e, [e[0] + Math.sin(a2) * aLen * 0.5, e[1] + Math.cos(a2) * aLen * 0.5]];
  };
  const rifle = !!o.rifle && (mode === "march" || mode === "stand");
  const B0: P2 = [tcx + 0.72 * T.a, chin + 0.58 * HH], B1: P2 = [tcx - 0.95 * T.a - 22 * u, crown - 0.4 * HH];
  let near: [P2, P2, P2], far: [P2, P2, P2] | null;
  if (mode === "swing") { near = [S, [S[0] + 12 * u, S[1] - 0.16 * HH], [300 + 6 * u, chin - 0.3 * HH]]; far = [S, [S[0] + 8 * u, S[1] - 0.18 * HH], [300 + 2 * u, chin - 0.36 * HH]]; }
  else if (mode === "push") {
    const reach = 0.55 * HH + 0.45 * HH * pose;
    let hN: P2 = [S[0] + reach, S[1] + 0.06 * HH];
    if (opts.hand) {
      // target is in final canvas units; the arm is drawn inside the lean rotation, so undo it
      const th = -rad(lean), dx = opts.hand[0] - 300, dy = opts.hand[1] - hipY;
      const tg: P2 = [300 + dx * Math.cos(th) - dy * Math.sin(th), hipY + dx * Math.sin(th) + dy * Math.cos(th)];
      hN = [hN[0] + (tg[0] - hN[0]) * pose, hN[1] + (tg[1] - hN[1]) * pose];
    }
    near = [S, [(S[0] + hN[0]) / 2, (S[1] + hN[1]) / 2 + 0.06 * HH], hN];
    far = [S, [(S[0] + hN[0]) / 2 - 4 * u, (S[1] + hN[1]) / 2 - 0.02 * HH], [hN[0] - 6 * u, hN[1] - 0.08 * HH]];
  } else if (rifle) { near = [S, [S[0] - 4 * u, S[1] + 0.42 * HH], B0]; far = mode === "march" ? swingArm(rad(30) * nearFwd) : swingArm(0); }
  else { near = swingArm(rad(-30) * nearFwd); far = mode === "march" ? swingArm(rad(30) * nearFwd) : null; }
  if (far) { p.stroke(curve(far[0], far[1], far[2]), 5.2 * u, farArm); p.dot(far[2][0], far[2][1], 5.5 * u); }
  p.gradFill(tp, o.jacket, mul(o.jacket, SH_CLOTH), light);
  p.clip(tp, () => {
    if (o.belt) p.band([[tcx - 0.65 * T.a, chin - 0.05 * HH], [tcx + 0.75 * T.a, torsoBot - 0.1 * HH]], o.belt!, 5.5 * u, 1.8 * u);
    if (o.sash) p.band([[tcx - 1.3 * T.a, torsoBot - 0.32 * HH], [tcx + 1.3 * T.a, torsoBot - 0.32 * HH]], o.sash, 0.13 * HH, 1.8 * u);
    if (!o.dress) for (let i = 0; i < 3; i++) { const y = chin + 0.16 * HH + i * 0.24 * HH; p.dot(tcx + 0.8 * T.a, y, 3 * u, INK); p.dot(tcx + 0.8 * T.a, y, 2.2 * u, o.buttons ?? shade(o.jacket, 0.7)); }
  });
  p.inkRing(tp, ow, thick);
  if (rifle) {
    p.band([B0, B1], "#7a4b2a", 5 * u, 1.5 * u, "round");
    p.band([lerp2(B0, B1, 0.6), B1], "#8d949c", 2.4 * u, 1.2 * u, "round");
  }
  p.stroke(curve(near[0], near[1], near[2]), 5.2 * u, armCol); p.dot(near[2][0], near[2][1], 5.5 * u);
  // ---- head ----
  const hx = 300 + 4 * u;
  hatBehind(p, o, H, hx, hc, light, thick, ow, true);
  const hp = blobPts(hx, hc, H);
  p.shadedFill(hp, skin, skinShade(skin), light, H.a);
  p.inkRing(hp, ow, thick);
  hatOn(p, o.hat === "longhair" ? { ...o, hat: "hair", hairCut: 0.27 } : o, hp, H, hx, hc, light, seed, 1, true);
  const brim = !!o.hat && o.hat !== "hair" && o.hat !== "longhair" && o.hat !== "bonnet" && o.hat !== "cap" && o.hat !== "laurel" && o.hat !== "headband" && o.hat !== "veil";
  if (o.beard) beardOn(p, o.beard, H, hx + 16 * u, hc, u, thick, ow, true);
  faceSide(p, hx, hc, W, expr, lid, brim, skin, o.moustache, o.build === "stout", !!o.cyclops);
  p.rot = null;
};

/** rope + seat + seated kid on a 700 x 2300 canvas; the pivot is design (350, 20); kid drawn at 0.92 scale */
export const swingKid = (p: Pen, o: Outfit, kick: number, expr: Expr, light = DEF_LIGHT, blink: number = 0) => {
  const rope = 1830, k = 1.1, HH = 2 * headBlob(5, BUILD[o.build ?? "adult"].a, 1).b;
  // two ropes from the pivot to the ends of a wide plank, the kid framed between them: a single rope behind the kid
  // ended at the cap and read as a hanging. Far rope behind the kid, near rope drawn over (clear of the face).
  const seat = rope + 18, x0 = 150, x1 = 550;
  p.line([[350, 20], [x0 + 16, seat + 4]], "#a07a4c", 10);
  p.poly(rrect(x0, seat, x1, seat + 36, 10), "#b5653f", 9);
  const g = p.g;
  g.save();
  g.translate(350 - 300 * k, rope + 18 - (SWING_HIP + 0.12 * HH) * k);
  g.scale(k, k);
  bodySide(new Pen(g), o, { expr, mode: "swing", pose: kick, light, seed: 5, blink });
  g.restore();
  p.line([[350, 20], [x1 - 16, seat + 4]], "#a07a4c", 10);
};

// ---------------- effects ----------------
export const fxNote = (p: Pen, kind: number, col = "#1f2a44") => {
  p.ell(70, 200, 46, 34, col, 8, 0, 360, -20);
  p.stroke([[110, 190], [110, 40]], 14);
  if (kind === 0) p.poly([[110, 40], [170, 70], [170, 110], [110, 82]], col, 8);
  else {
    p.ell(150, 170, 40, 30, col, 8, 0, 360, -20);
    p.stroke([[186, 160], [186, 20]], 14);
    p.poly([[110, 40], [186, 20], [186, 50], [110, 70]], col, 8);
  }
};

/** spark / impact star on a 500 x 500 canvas; t in 0..1 */
export const fxBurst = (p: Pen, t: number, col = "#fff3b0", rays = 10, r0 = 40, r1 = 230) => {
  const c = 250, e = 1 - (1 - t) ** 3;
  for (let i = 0; i < rays; i++) {
    const a = rad((i * 360) / rays + 7 * (i % 2)), ra = r0 + (r1 - r0) * e * (0.75 + 0.25 * (i % 2));
    p.poly([[c + r0 * 0.5 * Math.cos(a + 0.18), c + r0 * 0.5 * Math.sin(a + 0.18)], [c + ra * Math.cos(a), c + ra * Math.sin(a)],
      [c + r0 * 0.5 * Math.cos(a - 0.18), c + r0 * 0.5 * Math.sin(a - 0.18)]], col, Math.max(3, 8 * (1 - t)));
  }
  if (t < 0.5) p.ell(c, c, r0 * (1.4 - t), r0 * (1.4 - t), WHITE, 8);
};

/** water splash crown on an 800 x 800 canvas; t in 0..1 */
export const fxSplash = (p: Pen, t: number) => {
  const c = 400, size = 800, rise = Math.sin(Math.min(1, t * 1.3) * Math.PI);
  const blue = "#bfe8ff", deep = "#6cc0f0";
  if (rise > 0.02) {
    const pts: P2[] = [];
    for (let i = 0; i < 19; i++) {
      const h = (i % 2 ? 260 : 130) * rise * (0.7 + 0.3 * Math.sin(i * 1.7));
      pts.push([c - 330 + (660 * i) / 18, size - 120 - h]);
    }
    p.poly([...pts, [c + 330, size - 90], [c - 330, size - 90]], blue, 10);
    p.ell(c, size - 100, 360, 46, deep, 10);
  }
  for (let i = 0; i < 8; i++) {
    const a = rad(200 + i * 18), d = 120 + 380 * t, y = size - 160 + d * Math.sin(a) + 520 * t * t, r = 26 * (1 - t) + 6;
    if (t > 0.08 && y < size - 40) p.ell(c + d * Math.cos(a), y, r, r * 1.25, blue, 7);
  }
};

/** dust puff on a 300 x 300 canvas; t in 0..1 */
export const fxPuff = (p: Pen, t: number) => {
  for (let i = 0; i < 5; i++) {
    const a = rad(160 + i * 55), d = 40 + 70 * t, r = (34 + 20 * (i % 2)) * (1 - 0.6 * t);
    p.ell(150 + d * Math.cos(a), 180 + d * 0.45 * Math.sin(a), r, r * 0.8, `rgba(238,225,205,${(1 - t).toFixed(3)})`, 0);
  }
};

/** circling stars on a 420 x 210 canvas */
export const fxStars = (p: Pen, t: number) => {
  for (let i = 0; i < 4; i++) {
    const a = t * Math.PI * 2 + (i * Math.PI) / 2, x = 210 + 150 * Math.cos(a), y = 110 + 40 * Math.sin(a), pts: P2[] = [];
    for (let k = 0; k < 10; k++) { const r = k % 2 ? 14 : 34, b = rad(k * 36 - 90); pts.push([x + r * Math.cos(b), y + r * Math.sin(b)]); }
    p.poly(pts, "#ffd84a", 6);
  }
};

/** three jittering strain ticks on a 300 x 300 canvas */
export const fxCreak = (p: Pen, t: number) => {
  const j = 6 * Math.sin(t * 40);
  for (const a of [-30, 0, 30]) {
    const b = rad(a - 90);
    p.stroke([[150 + 70 * Math.cos(b) + j, 230 + 70 * Math.sin(b)], [150 + 100 * Math.cos(b) + 10 + j, 230 + 100 * Math.sin(b)],
      [150 + 130 * Math.cos(b) + j, 230 + 130 * Math.sin(b)]], 10);
  }
};

/** flat water ring (drawn top-down) on a 600 x 600 canvas; t in 0..1 */
export const fxRing = (p: Pen, t: number) => {
  // thin light water rings (white crest, pale blue trailing rings), thinning as they spread
  const g = p.g;
  for (let k = 0; k < 3; k++) {
    const u = t - k * 0.22;
    if (u <= 0 || u >= 1) continue;
    g.beginPath(); g.ellipse(300, 300, 60 + 230 * u, 60 + 230 * u, 0, 0, Math.PI * 2);
    g.strokeStyle = k === 0 ? "#f6fcff" : "#cfe8fa"; g.lineWidth = 9 * (1 - u) + 3; g.stroke();
  }
};

/** text-free sign on a 700 x 520 canvas: "no marching in step on the bridge". A bridge (deck + arch + piers), four
 *  identical pairs of marching legs in the same stride (in step), a bold red X over all of it. */
export const fxSign = (p: Pen) => {
  const g = p.g, RED = "#d42f2f";
  p.poly(rrect(14, 14, 686, 506, 40), "#f6ecd2", 0);
  p.poly(rrect(14, 14, 686, 506, 40), null, 14);
  // bridge: deck, stone arch underneath, two piers
  p.poly(rrect(70, 352, 630, 384, 8), "#8a5a3a", 9);
  g.beginPath(); g.moveTo(112, 470); g.quadraticCurveTo(350, 300, 588, 470);
  g.strokeStyle = INK; g.lineWidth = 16; g.lineCap = "round"; g.stroke();
  for (const x of [88, 612]) p.poly(rrect(x - 16, 384, x + 16, 470, 4), "#8a5a3a", 9);
  // four identical soldiers' legs mid-stride: same leg forward on every one = in step
  for (const x of [150, 278, 406, 534]) {
    p.poly(rrect(x - 30, 150, x + 30, 214, 14), "#357650", 9);                  // coat hem
    p.stroke([[x - 8, 210], [x + 34, 262], [x + 46, 338]], 15, INK);           // front leg
    p.stroke([[x + 6, 210], [x - 12, 274], [x - 36, 336]], 15, INK);           // back leg
    p.poly(rrect(x + 30, 330, x + 74, 350, 9), INK, 0);                          // boots point forward
    p.poly(rrect(x - 52, 328, x - 8, 348, 9), INK, 0);
  }
  // big red X
  for (const [a, b] of [[[96, 70], [604, 452]], [[604, 70], [96, 452]]] as [[number, number], [number, number]][]) {
    p.stroke([a, b], 58, "#ffffff");
    p.stroke([a, b], 42, RED);
  }
};

/** soft cartoon cloud on a 600 x 300 canvas */
export const fxCloud = (p: Pen, seed: number) => {
  const blobs: [number, number, number][] = [[150, 190, 80], [250, 150, 105], [360, 160, 95], [450, 195, 70], [300, 210, 90]];
  for (const [x, y, r] of blobs) p.ell(x + ((seed * 37) % 20) - 10, y, r, r * 0.8, "#ffffff", 0);
  p.ell(300, 235, 230, 40, "#ffffff", 0);
};

/** cast shadow on a 128 x 256 canvas: dark soft contact pool at the feet (y 205) and a softer tail that runs up the
 *  canvas = away from the sun, fading with distance; multiply colour (sRGB-encoded linear ratio), white = no change */
export const fxShadow = (p: Pen, col: string) => {
  const g = p.g;
  g.fillStyle = WHITE; g.fillRect(0, 0, 128, 256);
  g.save(); g.filter = "blur(9px)";
  const lg = g.createLinearGradient(0, 205, 0, 22);
  lg.addColorStop(0, mix(col, WHITE, 0.08)); lg.addColorStop(0.55, mix(col, WHITE, 0.3)); lg.addColorStop(1, mix(col, WHITE, 0.85));
  g.fillStyle = lg;
  g.beginPath(); g.moveTo(40, 205); g.bezierCurveTo(36, 120, 46, 50, 64, 30); g.bezierCurveTo(82, 50, 92, 120, 88, 205); g.closePath(); g.fill();
  g.fillStyle = col; g.beginPath(); g.ellipse(64, 205, 30, 17, 0, 0, Math.PI * 2); g.fill();
  g.restore();
};

/** tight contact shadow right under the feet on a 128 x 128 canvas: dark core, short fall-off (multiply colour) */
export const fxContact = (p: Pen, col: string) => {
  const g = p.g;
  g.fillStyle = WHITE; g.fillRect(0, 0, 128, 128);
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  for (const [r, k] of [[0, 0], [0.32, 0.02], [0.5, 0.22], [0.66, 0.58], [0.82, 0.88], [1, 1]] as const) gr.addColorStop(r, mix(col, WHITE, k));
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
};

/** floating wooden plank, side-on, on a 320 x 110 canvas */
export const fxPlank = (p: Pen) => {
  p.poly(rrect(14, 30, 306, 78, 10), "#a8744a", 9);
  p.line([[40, 46], [150, 44], [270, 50]], "#7d5234", 4);
  p.line([[60, 62], [200, 64], [284, 60]], "#7d5234", 4);
  p.dot(36, 54, 5, INK); p.dot(284, 54, 5, INK);
};

/** floating marching drum (no text) on a 260 x 240 canvas: white shell, red hoops, ink zig-zag cord */
export const fxDrum = (p: Pen) => {
  p.poly(rrect(40, 70, 220, 190, 16), "#f1ece0", 9);
  p.poly(rrect(32, 58, 228, 86, 12), "#c9373a", 8);
  p.poly(rrect(32, 176, 228, 204, 12), "#c9373a", 8);
  p.line([[52, 88], [82, 172], [112, 88], [142, 172], [172, 88], [202, 172]], INK, 6);
  p.ell(130, 58, 98, 18, "#f7f3ea", 8);
};

/** soft ground contact blob on a 128 x 128 canvas, multiply colour (sRGB-encoded linear ratio) in the centre */
export const fxBlob = (p: Pen, col: string) => {
  const g = p.g;
  g.fillStyle = WHITE; g.fillRect(0, 0, 128, 128);
  // soft contact shadow: flat core, then a long smooth (roughly gaussian) fall-off to white = no change
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  for (const [r, k] of [[0, 0], [0.5, 0.04], [0.64, 0.18], [0.76, 0.42], [0.87, 0.72], [0.95, 0.92], [1, 1]] as const) gr.addColorStop(r, mix(col, WHITE, k));
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
};
