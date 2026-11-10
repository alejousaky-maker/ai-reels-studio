// Camera grammar from the measured reference (motion.md / SKILL.md), driven by storyboard keys:
// - cut keys switch framing on their frame; other keys glide with a symmetric smootherstep over `dur` (18-40 f)
// - every key creeps (dolly toward its look point by exp(-push * frames since the key)): no frozen holds
// - impact kicks flip sign every frame and decay over 7 f; no random hand-held float
import type { CameraKey, SceneSpec, V3 } from "./types";

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };

const mixCam = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3,
  look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});

/** framing of key k at frame f: its pose, pushed in since the key started */
const keyCam = (k: CameraKey, f: number, push: number): Cam => {
  const s = Math.exp(-push * Math.max(0, f - k.frame));
  const p = k.position, l = k.lookAt;
  return {
    pos: [l[0] + (p[0] - l[0]) * s, l[1] + (p[1] - l[1]) * s, l[2] + (p[2] - l[2]) * s],
    look: [...l] as V3, fov: k.fov ?? 40, roll: k.roll ?? 0,
  };
};

export const kickAt = (sc: SceneSpec, f: number) => {
  let a = 0;
  for (const k of sc.kicks ?? []) {
    const n = f - k.frame;
    if (n >= 0 && n < 7) a += k.amp * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5;
  }
  return a;
};

export const camAt = (sc: SceneSpec, f: number): Cam => {
  const keys = [...sc.cameraKeys].sort((a, b) => a.frame - b.frame);
  const push = sc.push ?? 0.002;
  let cur = keyCam(keys[0], f, push);
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.frame) break;
    const next = keyCam(k, f, push);
    cur = k.cut ? next : mixCam(cur, next, glide((f - k.frame) / (k.dur ?? 24)));
  }
  // impact punch-in: the lens snaps ~10 % tighter on the impact word and eases back over 12 frames
  let punch = 0;
  for (const k of sc.kicks ?? []) {
    const n = f - k.frame + 1;
    if (n >= 0 && n < 12) punch = Math.max(punch, 0.1 * Math.min(1, k.amp + 0.2) * (1 - n / 12) ** 2);
  }
  for (const pf of sc.punches ?? []) {   // softer lean-in on named objects: 5 % tighter, eases back over 16 f
    const n = f - pf + 1;
    if (n >= 0 && n < 16) punch = Math.max(punch, 0.05 * Math.sin((Math.PI * Math.min(n, 6)) / 12) * (n < 6 ? 1 : (1 - (n - 6) / 10)));
  }
  if (punch) cur = { ...cur, fov: cur.fov * (1 - punch) };
  const a = kickAt(sc, f);
  if (!a) return cur;
  const d: V3 = [cur.look[0] - cur.pos[0], cur.look[1] - cur.pos[1], cur.look[2] - cur.pos[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((cur.fov * Math.PI) / 360) * L * a;
  return { ...cur, look: [cur.look[0] - (d[2] / h) * m, cur.look[1] + 0.6 * m, cur.look[2] + (d[0] / h) * m], roll: cur.roll + a * 0.004 };
};
