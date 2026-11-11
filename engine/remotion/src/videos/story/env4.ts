// Modern locations for contemporary stories, in the same painted, ink-outlined look (procedural geometry + Canvas2D
// textures, Kenney CC0 vegetation). Rooms are open-topped like `interior` (the sun pours in; cameras stay inside):
//   apartment (living room, city window), bathroom (tiles, shower, vanity), office (corner office, skyline),
//   hotel (bed, neon sign, night city), airport (glass wall with a plane, departure board, seats)
// Outdoors: suburb (houses with driveways, lawns, road), lake (water, dock, log cabin, pines),
//   resort (pool, loungers, umbrellas, thatched pool bar, pink neon palm sign, palms, sea)
// Ground level y = 0.
import * as THREE from "three";
import { Batch, prop, boxGeo, V, lam, Kit, quad } from "../bridge/build";
import { planksHD, rng, ctex, rep } from "../bridge/paint";
import { NOINK } from "../bridge/ink";
import type { EnvSpec } from "./types";
import { ground, EnvInfo } from "./env";
import { palm } from "./env3";

const M4 = (x: number, y: number, z: number, ry = 0) => new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), ry), V(1, 1, 1));
const MS = (x: number, y: number, z: number, sx: number, sy: number, sz: number, ry = 0) =>
  new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), ry), V(sx, sy, sz));
const cyl = (r0: number, r1: number, h: number, seg = 16) => new THREE.CylinderGeometry(r0, r1, h, seg).translate(0, h / 2, 0);
const glow = (c: [number, number, number]) => new THREE.MeshBasicMaterial({ color: new THREE.Color(...c) });   // > 1 blooms
const C = (key: string, color: string) => lam(key, () => ({ color }));
const box = (b: Batch, m: THREE.Material, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) => b.add(boxGeo(V(x0, y0, z0), V(x1, y1, z1)), m);

// ---------------- painted textures ----------------
const INKC = "rgba(36,23,38,0.95)";
const skylineTex = (key: string, night: boolean) => ctex("skyline_" + key, 1024, 512, (g, r) => {
  const sky = g.createLinearGradient(0, 0, 0, 512);
  if (night) { sky.addColorStop(0, "#141c40"); sky.addColorStop(1, "#3a3f7a"); } else { sky.addColorStop(0, "#6fb0ea"); sky.addColorStop(1, "#d6ecfb"); }
  g.fillStyle = sky; g.fillRect(0, 0, 1024, 512);
  for (let layer = 0; layer < 2; layer++) {
    let x = -20;
    while (x < 1040) {
      const w = 60 + r() * 90, h = (layer ? 160 : 90) + r() * (layer ? 220 : 160), y = 512 - h;
      g.fillStyle = night ? (layer ? "#262b55" : "#323a6a") : (layer ? "#8fa3c4" : "#b7c6dc"); g.fillRect(x, y, w, h);
      g.fillStyle = night ? "rgba(255,214,120,0.9)" : "rgba(255,255,255,0.55)";
      for (let wy = y + 14; wy < 500; wy += 26) for (let wx = x + 10; wx < x + w - 14; wx += 20) if (r() < (night ? 0.45 : 0.8)) g.fillRect(wx, wy, 9, 13);
      g.strokeStyle = INKC; g.lineWidth = 4; g.strokeRect(x, y, w, h);
      x += w + 6;
    }
  }
});
const tileTex = (key: string, a: string, b2: string, n = 8, check = false) => ctex("tile_" + key, 512, 512, (g) => {
  const s = 512 / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = check && (i + j) % 2 ? b2 : a; g.fillRect(i * s, j * s, s, s); }
  g.strokeStyle = check ? "rgba(60,60,70,0.35)" : b2; g.lineWidth = 5;
  for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, 512); g.stroke(); g.beginPath(); g.moveTo(0, i * s); g.lineTo(512, i * s); g.stroke(); }
});
const plainWall = (key: string, col: string, trim: string) => ctex("pwall_" + key, 512, 256, (g, r) => {
  g.fillStyle = col; g.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(${r() < 0.5 ? "255,255,255" : "40,30,40"},0.03)`; g.fillRect(r() * 512, r() * 256, 3 + r() * 8, 2 + r() * 5); }
  g.fillStyle = trim; g.fillRect(0, 238, 512, 18);
  g.fillStyle = INKC; g.fillRect(0, 234, 512, 4);
});
const boardTex = () => ctex("departures", 1024, 512, (g) => {
  g.fillStyle = "#16181f"; g.fillRect(0, 0, 1024, 512);
  g.fillStyle = "#ffd23f"; g.font = "bold 54px Arial"; g.fillText("DEPARTURES", 40, 70);
  const rows = [["09:40", "NEW YORK", "ON TIME"], ["10:15", "CANCUN", "BOARDING"], ["11:05", "CHICAGO", "DELAYED"], ["12:30", "MIAMI", "ON TIME"], ["13:10", "DENVER", "ON TIME"]];
  g.font = "bold 44px Courier New, monospace";
  rows.forEach(([t, c, s], i) => { const y = 150 + i * 72; g.fillStyle = "#ffd23f"; g.fillText(t, 40, y); g.fillText(c, 250, y); g.fillStyle = s === "DELAYED" ? "#ff5a4a" : "#7dff8a"; g.fillText(s, 700, y); });
});
const neonTex = (key: string, kind: "palm" | "heart" | "hotel") => ctex("neon_" + key, 512, 512, (g) => {
  g.clearRect(0, 0, 512, 512);
  g.lineCap = "round"; g.lineJoin = "round";
  const stroke = (w: number, col: string) => { g.strokeStyle = col; g.lineWidth = w; g.stroke(); };
  g.beginPath();
  if (kind === "palm") {
    g.moveTo(256, 470); g.quadraticCurveTo(230, 330, 262, 200);
    for (const a of [-2.6, -2.0, -1.2, -0.6, 0.0]) { g.moveTo(262, 200); g.quadraticCurveTo(262 + 120 * Math.cos(a), 160 + 30 * Math.sin(a), 262 + 190 * Math.cos(a), 220 + 80 * Math.sin(a) + 40); }
  } else if (kind === "heart") {
    for (let i = 0; i <= 60; i++) { const t = (i / 60) * Math.PI * 2, x = 256 + 170 * Math.sin(t) ** 3, y = 240 - (130 * Math.cos(t) - 50 * Math.cos(2 * t) - 20 * Math.cos(3 * t) - 8 * Math.cos(4 * t)); if (i) g.lineTo(x, y); else g.moveTo(x, y); }
  } else { g.font = "bold 150px Arial"; }
  if (kind === "hotel") { g.font = "bold 140px Arial Black, Arial"; g.textAlign = "center"; g.lineWidth = 26; g.strokeStyle = "rgba(255,80,190,0.45)"; g.strokeText("HOTEL", 256, 300); g.lineWidth = 9; g.strokeStyle = "#ffe1f6"; g.strokeText("HOTEL", 256, 300); return; }
  stroke(34, "rgba(255,70,180,0.4)"); stroke(16, "#ff6ec7"); stroke(6, "#fff0fb");
});
const houseFront = (key: string, col: string, door: string) => ctex("hfront_" + key, 512, 512, (g) => {
  g.fillStyle = col; g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 22) { g.fillStyle = "rgba(0,0,0,0.06)"; g.fillRect(0, y, 512, 3); }   // siding
  const win = (x: number, y: number) => { g.fillStyle = "#cfe6fa"; g.fillRect(x, y, 90, 80); g.fillStyle = "#f7f3ea"; g.fillRect(x + 42, y, 6, 80); g.fillRect(x, y + 37, 90, 6); g.strokeStyle = INKC; g.lineWidth = 6; g.strokeRect(x, y, 90, 80); };
  win(40, 90); win(380, 90); win(40, 290);
  g.fillStyle = door; g.fillRect(380, 300, 80, 212); g.strokeStyle = INKC; g.lineWidth = 6; g.strokeRect(380, 300, 80, 212);
  g.fillStyle = "#e8b83a"; g.beginPath(); g.arc(445, 410, 6, 0, 7); g.fill();
  g.fillStyle = "#e9e4da"; g.fillRect(150, 260, 210, 252);                                          // garage door
  for (let y = 290; y < 512; y += 40) { g.fillStyle = "rgba(0,0,0,0.12)"; g.fillRect(150, y, 210, 4); }
  g.strokeStyle = INKC; g.lineWidth = 6; g.strokeRect(150, 260, 210, 252);
});

/** eye-catching wall posters, our own painted art (no logos): synthwave city, sports car, palm sunset, arcade, rocket */
export const posterTex = (kind: string) => ctex("poster_" + kind, 384, 512, (g, r) => {
  const sky = g.createLinearGradient(0, 0, 0, 512);
  const pal: Record<string, [string, string]> = { city: ["#2a0f4a", "#ff5fa2"], car: ["#ff9a3c", "#ffd86b"], palms: ["#ff5f6d", "#ffc371"], arcade: ["#101030", "#3a2a8a"], rocket: ["#0b1a3a", "#3f6fb5"] };
  const [c0, c1] = pal[kind] ?? pal.city;
  sky.addColorStop(0, c0); sky.addColorStop(1, c1); g.fillStyle = sky; g.fillRect(0, 0, 384, 512);
  g.lineWidth = 6; g.strokeStyle = INKC;
  if (kind === "city" || kind === "palms") {   // big sun with stripes + skyline / palms
    g.fillStyle = "#ffd23f"; g.beginPath(); g.arc(192, 300, 120, Math.PI, 0); g.fill();
    g.fillStyle = c0; for (let y = 230; y < 300; y += 16) g.fillRect(60, y, 264, 5);
    if (kind === "city") { g.fillStyle = "#14082a"; let x = 0; while (x < 384) { const w = 30 + r() * 40, h = 80 + r() * 160; g.fillRect(x, 420 - h, w, h + 100); g.fillStyle = "#ff5fa2"; for (let k = 0; k < 6; k++) g.fillRect(x + 6 + (k % 2) * 14, 430 - h + k * 22, 6, 8); g.fillStyle = "#14082a"; x += w + 4; } }
    else for (const [px, h] of [[70, 280], [300, 320]] as const) { g.strokeStyle = "#2a1020"; g.lineWidth = 14; g.beginPath(); g.moveTo(px, 512); g.quadraticCurveTo(px + 20, 512 - h / 2, px + 10, 512 - h); g.stroke(); g.fillStyle = "#2a1020"; for (let k = 0; k < 6; k++) { g.beginPath(); g.ellipse(px + 10 + Math.cos(k) * 40, 512 - h + Math.sin(k) * 10, 60, 14, k, 0, 7); g.fill(); } }
    g.strokeStyle = "#ff3fd0"; g.lineWidth = 3; for (let y = 430; y < 512; y += 18) { g.beginPath(); g.moveTo(0, y); g.lineTo(384, y); g.stroke(); }
  } else if (kind === "car") {   // a red sports car on a highway at sunset
    g.fillStyle = "#3a3d47"; g.beginPath(); g.moveTo(0, 512); g.lineTo(150, 300); g.lineTo(234, 300); g.lineTo(384, 512); g.fill();
    g.fillStyle = "#ffd23f"; for (let y = 320; y < 512; y += 40) g.fillRect(188, y, 8, 20);
    g.fillStyle = "#e2232a"; g.beginPath(); g.moveTo(60, 430); g.lineTo(110, 380); g.lineTo(270, 375); g.lineTo(330, 420); g.lineTo(330, 455); g.lineTo(60, 455); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#8fd0ff"; g.beginPath(); g.moveTo(130, 385); g.lineTo(250, 382); g.lineTo(285, 410); g.lineTo(115, 410); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#1d1b22"; for (const x of [110, 280]) { g.beginPath(); g.arc(x, 455, 26, 0, 7); g.fill(); }
  } else if (kind === "arcade") {   // retro joystick + pixel hearts
    g.fillStyle = "#ff3fd0"; for (let k = 0; k < 14; k++) g.fillRect(r() * 360, r() * 300, 10, 10);
    g.fillStyle = "#1d1b22"; g.fillRect(110, 330, 164, 90); g.strokeRect(110, 330, 164, 90);
    g.strokeStyle = "#c9ccd2"; g.lineWidth = 14; g.beginPath(); g.moveTo(192, 330); g.lineTo(170, 220); g.stroke();
    g.fillStyle = "#e2232a"; g.beginPath(); g.arc(168, 210, 34, 0, 7); g.fill();
    g.fillStyle = "#39d9ff"; for (const x of [140, 240]) { g.beginPath(); g.arc(x, 375, 16, 0, 7); g.fill(); }
  } else {   // rocket over a planet
    g.fillStyle = "#ffffff"; for (let k = 0; k < 40; k++) g.fillRect(r() * 384, r() * 512, 3, 3);
    g.fillStyle = "#e8b83a"; g.beginPath(); g.arc(300, 420, 120, 0, 7); g.fill();
    g.fillStyle = "#f2efe8"; g.beginPath(); g.ellipse(170, 230, 40, 110, 0.4, 0, 7); g.fill(); g.stroke();
    g.fillStyle = "#e2232a"; g.beginPath(); g.moveTo(120, 330); g.lineTo(90, 380); g.lineTo(150, 340); g.fill();
    g.fillStyle = "#ffb03f"; g.beginPath(); g.ellipse(120, 360, 16, 40, 0.4, 0, 7); g.fill();
  }
  g.strokeStyle = INKC; g.lineWidth = 14; g.strokeRect(0, 0, 384, 512);
});
/** a framed poster on a wall plane at (x, y, z) facing +z (or rotated by ry) */
const posterOn = (root: THREE.Object3D, b: Batch, kind: string, x: number, y: number, z: number, w: number, ry = 0) => {
  const h = w * 4 / 3;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: posterTex(kind) }));
  m.position.set(x, y, z); m.rotation.y = ry; root.add(m);
  const fr = new THREE.Mesh(new THREE.BoxGeometry(w + 0.12, h + 0.12, 0.04), new THREE.MeshLambertMaterial({ color: "#1d1b22" }));
  fr.position.set(x - Math.sin(ry) * 0.025, y, z - Math.cos(ry) * 0.025); fr.rotation.y = ry; root.add(fr);
  void b;
};
/** the console's game on a big TV: a neon city chase at dusk (our own painting) */
const gameScreenTex = () => ctex("gameScreen", 1024, 576, (g, r) => {
  const sky = g.createLinearGradient(0, 0, 0, 576); sky.addColorStop(0, "#3a1060"); sky.addColorStop(0.6, "#ff5fa2"); sky.addColorStop(1, "#ffb03f");
  g.fillStyle = sky; g.fillRect(0, 0, 1024, 576);
  g.fillStyle = "#ffd23f"; g.beginPath(); g.arc(512, 330, 120, Math.PI, 0); g.fill();
  let x = 0; while (x < 1024) { const w = 50 + r() * 70, h = 120 + r() * 200; g.fillStyle = "#1a0a30"; g.fillRect(x, 400 - h, w, h + 50); g.fillStyle = "#39d9ff"; for (let k = 0; k < 8; k++) if (r() < 0.6) g.fillRect(x + 8 + (k % 3) * 14, 410 - h + Math.floor(k / 3) * 30, 8, 12); x += w + 5; }
  for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? "#14141c" : "#1d1d28"; g.fillRect(0, 440 + i * 23, 1024, 23); }
  g.fillStyle = "#ffffff"; for (let k = 0; k < 10; k++) g.fillRect(k * 110, 505, 60, 8);
  g.fillStyle = "#e2232a"; g.fillRect(420, 470, 180, 40); g.fillStyle = "#8fd0ff"; g.fillRect(460, 455, 100, 22);
  g.fillStyle = "#ffffff"; g.font = "bold 34px Arial Black, Arial"; g.fillText("WANTED ★★★☆☆", 30, 50); g.fillText("$ 1,000,000", 760, 50);
});

const quadsRoom = (b: Batch, W: number, D: number, H: number, back: THREE.Material, side: THREE.Material, u = 2) => {
  b.add(quad(V(-W, 0, -D), V(W, 0, -D), V(W, H, -D), V(-W, H, -D), u, 1), back);
  b.add(quad(V(-W, 0, D + 2), V(-W, 0, -D), V(-W, H, -D), V(-W, H, D + 2), u, 1), side);
  b.add(quad(V(W, 0, -D), V(W, 0, D + 2), V(W, H, D + 2), V(W, H, -D), u, 1), side);
  const trim = C("mtrim", "#3a3440");
  box(b, trim, -W - 0.2, H, -D - 0.2, W + 0.2, H + 0.25, -D);
  for (const s of [-1, 1]) box(b, trim, s < 0 ? -W - 0.2 : W, H, -D, s < 0 ? -W : W + 0.2, H + 0.25, D + 2);
};
/** a window panel on the back wall (painted view), framed */
const windowOn = (root: THREE.Object3D, b: Batch, x: number, y: number, z: number, w: number, h: number, tex: THREE.Texture) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: true, color: 0xe8e8e8 }));
  m.position.set(x, y, z + 0.02); m.layers.set(NOINK); root.add(m);
  const f = C("winFrame", "#f2efe8");
  box(b, f, x - w / 2 - 0.12, y - h / 2 - 0.12, z, x + w / 2 + 0.12, y - h / 2, z + 0.12);
  box(b, f, x - w / 2 - 0.12, y + h / 2, z, x + w / 2 + 0.12, y + h / 2 + 0.12, z + 0.12);
  for (const s of [-1, 0, 1]) box(b, f, x + s * w / 2 - 0.06, y - h / 2, z, x + s * w / 2 + 0.06, y + h / 2, z + 0.12);
};
const sofa = (b: Batch, x: number, z: number, col: string, yaw = 0) => {
  const m = C("sofa" + col, col), d = C("sofaD" + col, col);
  const g = new THREE.Group();
  void g;
  const T = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, mm: THREE.Material) => {
    const geo = boxGeo(V(x0, y0, z0), V(x1, y1, z1));
    b.add(geo, mm, M4(x, 0, z, yaw));
  };
  T(-1.3, 0.1, -0.45, 1.3, 0.48, 0.45, m); T(-1.3, 0.48, -0.45, 1.3, 1.0, -0.2, d);
  T(-1.5, 0.1, -0.45, -1.3, 0.75, 0.45, d); T(1.3, 0.1, -0.45, 1.5, 0.75, 0.45, d);
  for (const s of [-0.65, 0.65]) T(s - 0.6, 0.48, -0.2, s + 0.6, 0.62, 0.4, C("cushion" + col, col));
};
const plant = (b: Batch, kit: Kit, x: number, z: number) => {
  if (kit["F.pottedPlant"]) { prop(b, kit, "F.pottedPlant", x, 0, z, 1.5, x * 3.1); return; }
  b.add(cyl(0.28, 0.2, 0.45, 14), C("pot", "#c8703e"), M4(x, 0, z)); prop(b, kit, "plant_bushDetailed", x, 0.42, z, 1.1);
};
/** a CC0 Kenney model when the kit has it, else the hand-built fallback */
const kp = (b: Batch, kit: Kit, name: string, x: number, y: number, z: number, h: number, yaw = 0, fallback?: () => void) => {
  if (kit[name]) prop(b, kit, name, x, y, z, h, yaw); else fallback?.();
};
const candle = (root: THREE.Object3D, b: Batch, info: EnvInfo, x: number, y: number, z: number, h = 0.22) => {
  b.add(cyl(0.05, 0.05, h, 10), C("candleWax", "#f4ead2"), M4(x, y, z));
  const fl = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6).scale(1, 1.7, 1), glow([4.0, 2.4, 0.8])); fl.position.set(x, y + h + 0.06, z); root.add(fl);
  if (y === 0 && x < 0) info.lanterns.push(V(x, y + h + 0.1, z));   // one warm pool, not a glow per flame
};
const laser = (root: THREE.Object3D, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) => {
  const a = V(x0, y0, z0), c = V(x1, y1, z1), len = a.distanceTo(c);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, len, 6), glow([5.0, 0.25, 0.2]));
  m.position.copy(a).add(c).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(V(0, 1, 0), c.clone().sub(a).normalize()); m.layers.set(NOINK); root.add(m);
};

// ---------------- rooms ----------------
export const buildModernRoom = (root: THREE.Object3D, kit: Kit, env: EnvSpec, info: EnvInfo, b: Batch) => {
  const kind = env.preset, r = rng(env.seed || 21);
  void r;
  if (kind === "apartment" && env.variant === "empty") {   // sold everything: bare brick, one hanging bulb, nothing else
    const W = 6.5, D = 5.5, H = 3.6;
    b.add(ground(-W, W, -D, D + 4, 3.5, 3.5, 0.01), lam("planksBare", () => ({ map: planksHD(), color: "#b8a890" })));
    const brick = lam("brickBare", () => ({ map: ctex("brickBare", 512, 512, (g) => {
      g.fillStyle = "#b5654a"; g.fillRect(0, 0, 512, 512);
      for (let y = 0; y < 512; y += 32) for (let x = (y / 32) % 2 ? -32 : 0; x < 512; x += 64) { g.fillStyle = ((x * 7 + y * 3) % 5) ? "#a95a40" : "#c0704f"; g.fillRect(x + 2, y + 2, 60, 28); }
    }) }));
    quadsRoom(b, W, D, H, brick, brick, 2);
    windowOn(root, b, 2.6, 2.0, -D, 2.0, 1.6, skylineTex("n", true));
    b.add(cyl(0.01, 0.01, 1.0, 4), C("bulbCord", "#1d1b22"), M4(-0.6, H - 1.0, -2.0));
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), glow([3.4, 2.6, 1.4])); bulb.position.set(-0.6, H - 1.05, -2.0); root.add(bulb);
    info.lanterns.push(V(-0.6, H - 1.05, -2.0));
    for (const [x, z] of [[-4.6, -4.0], [4.2, 1.5]]) box(b, C("dustBunny", "#9a9088"), x, 0.01, z, x + 0.3, 0.06, z + 0.2);
  } else if (kind === "trading") {   // stock-exchange floor: red ticker walls, rows of desks with glowing screens
    const W = 10, D = 7, H = 5;
    b.add(ground(-W, W, -D, D + 6, 5, 5, 0.01), lam("tradeFloor", () => ({ map: tileTex("tf", "#4a4a58", "#3e3e4a", 6) })));
    quadsRoom(b, W, D, H, lam("tradeBack", () => ({ map: plainWall("trB", "#22222c", "#14141a") })), lam("tradeSide", () => ({ map: plainWall("trS", "#1d1d26", "#14141a") })));
    const tick = ctex("tickerWall", 1024, 256, (g) => {
      g.fillStyle = "#0b0b14"; g.fillRect(0, 0, 1024, 256);
      g.font = "bold 46px Consolas, monospace";
      const items = ["GAMES ▼ 87.2%", "TECH ▼ 41.0%", "PIZZA ▲ 312%", "SNACKS ▲ 98%", "OFFICE ▼ 66%", "COUCH ▼ 23%"];
      items.forEach((s, i) => { g.fillStyle = s.includes("▲") ? "#39d98a" : "#ff3b3b"; g.fillText(s, 20 + (i % 3) * 340, 80 + Math.floor(i / 3) * 110); });
      g.strokeStyle = "#ff3b3b"; g.lineWidth = 8; g.beginPath(); g.moveTo(0, 200); for (let x = 0; x < 1024; x += 64) g.lineTo(x, 200 + (x / 1024) * 40 + ((x / 64) % 2) * 12 - 20); g.stroke();
    });
    for (const [x, y, w] of [[0, 3.4, 12], [-6.5, 1.9, 5], [6.5, 1.9, 5]] as const) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 4), new THREE.MeshBasicMaterial({ map: tick, color: new THREE.Color(1.5, 1.5, 1.5) }));
      m.position.set(x, y, -D + 0.05); m.layers.set(NOINK); root.add(m);
    }
    const strip = new THREE.Mesh(new THREE.BoxGeometry(2 * W, 0.08, 0.08), glow([3.4, 0.4, 0.4])); strip.position.set(0, H - 0.2, -D + 0.08); root.add(strip);
    for (const z of [-3.6, -0.6]) for (let x = -8; x <= 8; x += 4) {
      box(b, C("tDesk", "#2b2b38"), x - 1.6, 0.72, z - 0.45, x + 1.6, 0.8, z + 0.45);
      box(b, C("tDeskBase", "#1d1b22"), x - 1.5, 0, z - 0.35, x + 1.5, 0.72, z + 0.35);
      for (const dx of [-0.8, 0.8]) {
        box(b, C("tMon", "#0d0d12"), x + dx - 0.55, 0.85, z - 0.35, x + dx + 0.55, 1.55, z - 0.28);
        const s = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.6), glow([2.6, 0.35, 0.35])); s.position.set(x + dx, 1.2, z - 0.27); root.add(s);
      }
    }
    info.lanterns.push(V(0, 3.4, -D + 0.5));
  } else if (kind === "clinic") {   // doctor's exam room ("ward" = hospital room with a window and a curtain rail)
    const W = 5.5, D = 4.6, H = 3.3, ward = env.variant === "ward";
    b.add(ground(-W, W, -D, D + 4, 3, 3, 0.01), lam("clinicFloor", () => ({ map: tileTex("clf", "#e6eef0", "#c9d6da", 6, true) })));
    const wall = lam(ward ? "wardWall" : "clinicWall", () => ({ map: plainWall(ward ? "wardW" : "clinW", ward ? "#d9ecdf" : "#eef4f7", "#7fa8b8") }));
    quadsRoom(b, W, D, H, wall, wall, 2);
    if (ward) {
      windowOn(root, b, 2.4, 1.9, -D, 2.4, 1.6, skylineTex("d", false));
      b.add(cyl(0.03, 0.03, 4.0, 6).rotateZ(Math.PI / 2), C("rail", "#c9ccd2"), M4(-2.0, 2.9, -1.6));
      for (let x = -3.9; x < -2.6; x += 0.35) box(b, C("wardCurtain", "#8fc9b0"), x, 0.6, -1.65, x + 0.25, 2.85, -1.55);
    } else {
      // exam table with paper roll, cabinets + sink, eye chart, a red-cross sign
      box(b, C("examBase", "#c9d2da"), -1.2, 0, -3.6, 1.4, 0.75, -2.7); box(b, C("examPad", "#6fb0c9"), -1.25, 0.75, -3.65, 1.45, 0.9, -2.65);
      box(b, C("paperRoll", "#ffffff"), -0.6, 0.9, -3.55, 1.3, 0.92, -2.75);
      box(b, C("cabinet", "#f7f7fa"), 2.6, 0, -D, W, 0.9, -D + 0.7); box(b, C("cabTop", "#9aa4ad"), 2.6, 0.9, -D, W, 0.96, -D + 0.75);
      box(b, C("upperCab2", "#f7f7fa"), 2.6, 2.0, -D, W, 2.8, -D + 0.45);
      const chart = ctex("eyeChart", 256, 384, (g) => { g.fillStyle = "#ffffff"; g.fillRect(0, 0, 256, 384); g.fillStyle = "#1d1b22"; ["E", "F P", "T O Z", "L P E D", "P E C F D"].forEach((l, i) => { g.font = `bold ${90 - i * 16}px Arial`; g.textAlign = "center"; g.fillText(l, 128, 90 + i * 66); }); });
      const ch = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.35), new THREE.MeshLambertMaterial({ map: chart })); ch.position.set(-3.4, 1.9, -D + 0.03); root.add(ch);
      box(b, C("crossV", "#e2453c"), -0.25, 2.3, -D + 0.01, 0.25, 3.1, -D + 0.05); box(b, C("crossH", "#e2453c"), -0.65, 2.45, -D + 0.01, 0.65, 2.95, -D + 0.05);
    }
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 0.6), glow([2.6, 2.7, 2.8])); lamp.position.set(0, H - 0.05, -1.5); root.add(lamp);
    info.lanterns.push(V(0, H - 0.3, -1.5));
    plant(b, kit, -W + 0.6, -D + 0.6);
  } else if (kind === "datacenter") {   // rows of server racks under cold light ("red" = meltdown: red LEDs, alarm strip)
    const W = 9, D = 9, H = 4.2, red = env.variant === "red";
    b.add(ground(-W, W, -D, D + 6, 5, 5, 0.01), lam("dcFloor", () => ({ map: tileTex("dcf", "#c9ced6", "#aab1bc", 8, true) })));
    quadsRoom(b, W, D, H, lam("dcWall", () => ({ map: plainWall("dcW", "#2b3240", "#14181f") })), lam("dcWall", () => ({ map: plainWall("dcW", "#2b3240", "#14181f") })));
    const ledC: [number, number, number] = red ? [3.6, 0.3, 0.2] : [0.3, 2.6, 1.4];
    for (const x of [-6, -2.2, 2.2, 6]) for (let z = -8; z <= 1; z += 1.25) {
      box(b, C("rackBody", "#1d1f26"), x - 0.55, 0, z, x + 0.55, 2.4, z + 1.15);
      for (const s of [-1, 1]) {
        const led = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.9, 0.9), glow(ledC)); led.position.set(x + s * 0.57, 1.2, z + 0.57); root.add(led);
      }
    }
    const alarm = new THREE.Mesh(new THREE.BoxGeometry(2 * W, 0.12, 0.12), glow(red ? [4.0, 0.3, 0.2] : [0.6, 1.4, 3.0])); alarm.position.set(0, H - 0.2, -D + 0.1); root.add(alarm);
    for (let z = -7; z <= 1; z += 4) { const l = new THREE.Mesh(new THREE.BoxGeometry(14, 0.05, 0.3), glow(red ? [2.4, 1.0, 0.9] : [2.2, 2.5, 2.8])); l.position.set(0, H - 0.05, z); root.add(l); }
    info.lanterns.push(V(0, H - 0.3, -2));
  } else if (kind === "apartment") {
    const W = 6.5, D = 5.5, H = 3.6;
    b.add(ground(-W, W, -D, D + 4, 3.5, 3.5, 0.01), lam("planksHD", () => ({ map: planksHD() })));
    quadsRoom(b, W, D, H, lam("aptBack", () => ({ map: plainWall("aptB", "#e7dfd2", "#8a6a52") })), lam("aptSide", () => ({ map: plainWall("aptS", "#7fa8a2", "#5a4a42") })));
    windowOn(root, b, 1.6, 2.0, -D, 4.2, 2.3, skylineTex(env.variant === "night" ? "n" : "d", env.variant === "night"));
    // CC0 Kenney furniture (hand-built boxes when the kit is missing): sofa + cushions, rug, coffee table with a mug,
    // TV unit, floor lamp, bookcase, side table, plants, a coat rack by the door
    kp(b, kit, "F.loungeSofa", -2.6, 0, -3.9, 1.0, 0, () => sofa(b, -2.6, -3.7, "#c8553d"));
    kp(b, kit, "F.rugRounded", -2.6, 0.005, -1.6, 0.03, 0, () => box(b, C("rugApt", "#d9c49a"), -4.4, 0.012, -2.6, -0.8, 0.02, 0.4));
    kp(b, kit, "F.tableCoffee", -2.6, 0, -2.2, 0.45, 0, () => box(b, C("ctable", "#6b4a32"), -3.5, 0.0, -2.3, -1.7, 0.42, -1.5));
    kp(b, kit, "K.mug", -2.3, 0.45, -2.15, 0.16, 0.6);
    kp(b, kit, "F.books", -2.9, 0.45, -2.25, 0.12, 0.3);
    box(b, C("tvStand", "#3a3440"), 3.6, 0, 1.2, 5.6, 0.55, 1.8);
    box(b, C("tvBody", "#1d1b22"), 3.8, 0.55, 1.4, 5.4, 1.5, 1.5);
    const tv = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 0.82), glow([0.35, 0.6, 1.1])); tv.position.set(4.6, 1.02, 1.36); tv.rotation.y = Math.PI; root.add(tv);
    kp(b, kit, "F.speakerSmall", 3.75, 0.55, 1.5, 0.4, Math.PI); kp(b, kit, "F.speakerSmall", 5.45, 0.55, 1.5, 0.4, Math.PI);
    if (kit["F.lampRoundFloor"]) prop(b, kit, "F.lampRoundFloor", -5.6, 0, -4.5, 2.0);
    else b.add(cyl(0.03, 0.03, 1.7, 6), C("lampPole", "#2b2b38"), M4(-5.6, 0, -4.5));
    const lm = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 0.4, 16), glow([2.6, 2.0, 1.2])); lm.position.set(-5.6, 1.85, -4.5); root.add(lm);
    info.lanterns.push(V(-5.6, 1.85, -4.5));
    kp(b, kit, "F.bookcaseOpen", 4.9, 0, -D + 0.35, 2.4, 0);
    kp(b, kit, "F.sideTableDrawers", -0.6, 0, -D + 0.45, 0.7, 0); kp(b, kit, "F.lampRoundTable", -0.6, 0.7, -D + 0.45, 0.55, 0);
    kp(b, kit, "F.coatRackStanding", W - 0.5, 0, 2.6, 1.9, 0);
    kp(b, kit, "F.pillowBlue", -3.3, 0.48, -3.75, 0.3, 0.2); kp(b, kit, "F.pillow", -1.9, 0.48, -3.75, 0.3, -0.2);
    plant(b, kit, 5.6, -2.6); plant(b, kit, -5.8, 2.5); kp(b, kit, "F.plantSmall2", 4.9, 2.4, -D + 0.35, 0.4);
    for (const [x, c] of [[-1.4, "#3f6fb5"], [-0.4, "#e8b83a"]] as const) box(b, C("frame" + c, c), x, 1.6, -D + 0.01, x + 0.7, 2.4, -D + 0.06);
  } else if (kind === "bathroom") {
    const W = 4.2, D = 4.2, H = 3.2;
    b.add(ground(-W, W, -D, D + 4, 2, 2, 0.01), lam("bathFloor", () => ({ map: tileTex("bf", "#f4f1ea", "#9fb7c9", 8, true) })));
    const wall = lam("bathWall", () => ({ map: tileTex("bw", "#eef6f8", "#b9cfd8", 10) }));
    quadsRoom(b, W, D, H, wall, wall, 3);
    // shower (back right): tray, two glass panes, a curtain rail and curtain, shower head
    box(b, C("tray", "#f7f7f7"), 1.4, 0, -D, W, 0.12, -D + 2.2);
    const glass = new THREE.MeshLambertMaterial({ color: "#bfe6f2", transparent: true, opacity: 0.35 });
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.3), glass); pane.position.set(1.4, 1.27, -D + 1.1); pane.rotation.y = Math.PI / 2; root.add(pane);
    b.add(cyl(0.03, 0.03, 2.8, 6).rotateZ(Math.PI / 2), C("rail", "#c9ccd2"), M4(1.4 + 1.4, 2.4, -D + 2.2));
    const cur = new THREE.PlaneGeometry(1.6, 2.1, 10, 1), cp = cur.attributes.position;
    for (let i = 0; i < cp.count; i++) cp.setZ(i, 0.08 * Math.sin(cp.getX(i) * 9));
    cur.computeVertexNormals();
    b.add(cur, lam("curtain", () => ({ color: "#7fc4d9", side: THREE.DoubleSide })), M4(3.3, 1.35, -D + 2.2));
    b.add(cyl(0.18, 0.12, 0.08, 14), C("showerHead", "#c9ccd2"), M4(3.0, 2.2, -D + 0.25));
    // vanity + mirror (back left), toilet, towel
    box(b, C("vanity", "#6b4a32"), -3.8, 0, -D, -1.4, 0.85, -D + 0.6);
    box(b, C("vanityTop", "#f7f7f7"), -3.9, 0.85, -D, -1.3, 0.95, -D + 0.68);
    b.add(cyl(0.3, 0.25, 0.12, 18), C("basin", "#ffffff"), M4(-2.6, 0.95, -D + 0.32));
    const mir = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.2), new THREE.MeshBasicMaterial({ color: "#cfe6f2" })); mir.position.set(-2.6, 1.85, -D + 0.02); mir.layers.set(NOINK); root.add(mir);
    box(b, C("mirFrame", "#2b2b38"), -3.65, 1.22, -D, -1.55, 1.25, -D + 0.05); box(b, C("mirFrame", "#2b2b38"), -3.65, 2.45, -D, -1.55, 2.48, -D + 0.05);
    const vl = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.08), glow([2.6, 2.2, 1.6])); vl.position.set(-2.6, 2.6, -D + 0.1); root.add(vl);
    info.lanterns.push(V(-2.6, 2.6, -D + 0.3));
    b.add(cyl(0.22, 0.2, 0.42, 16), C("toilet", "#ffffff"), M4(-W + 0.5, 0, -0.8)); box(b, C("toilet", "#ffffff"), -W, 0.42, -1.15, -W + 0.3, 0.95, -0.45);
    box(b, C("towel", "#e8b83a"), W - 0.05, 0.9, 0.3, W, 1.7, 1.1);
    box(b, C("bathMat", "#7fc4d9"), -1.0, 0.012, -1.6, 0.6, 0.02, -0.6);
  } else if (kind === "office" && (env.variant === "lasers" || env.variant === "vault")) {
    // the secure wing: a steel corridor criss-crossed by red laser beams, or the vault room (round 10-ton door + glowing pedestal)
    const W = 6, D = 5.5, H = 3.8, vault = env.variant === "vault";
    b.add(ground(-W, W, -D, D + 4, 4, 4, 0.01), lam("secFloor", () => ({ map: tileTex("secf", "#3a3f4a", "#2b2f38", 6, true) })));
    const steel = lam("secWall", () => ({ map: ctex("secWallT", 512, 256, (g) => {
      g.fillStyle = "#4a515e"; g.fillRect(0, 0, 512, 256);
      for (let x = 0; x < 512; x += 128) { g.fillStyle = "#3a404b"; g.fillRect(x, 0, 6, 256); for (let y = 16; y < 256; y += 48) { g.fillStyle = "#6a7280"; g.beginPath(); g.arc(x + 14, y, 4, 0, 7); g.fill(); } }
      g.fillStyle = "#e8b83a"; for (let x = -40; x < 512; x += 40) { g.beginPath(); g.moveTo(x, 256); g.lineTo(x + 20, 256); g.lineTo(x + 40, 230); g.lineTo(x + 20, 230); g.fill(); }
    }) }));
    quadsRoom(b, W, D, H, steel, steel, 2);
    const strip = new THREE.Mesh(new THREE.BoxGeometry(2 * W, 0.06, 0.06), glow(vault ? [0.4, 1.4, 3.2] : [3.6, 0.3, 0.2])); strip.position.set(0, H - 0.2, -D + 0.08); root.add(strip);
    if (vault) {
      const door = new THREE.CylinderGeometry(2.0, 2.0, 0.5, 48).rotateX(Math.PI / 2);
      b.add(door, C("vaultDoor", "#9aa3b0"), M4(0, 2.0, -D + 0.25));
      b.add(new THREE.TorusGeometry(2.05, 0.16, 10, 48), C("vaultRim", "#5a616d"), M4(0, 2.0, -D + 0.5));
      b.add(new THREE.TorusGeometry(1.3, 0.06, 8, 40), C("vaultRing", "#c9ced6"), M4(0, 2.0, -D + 0.52));
      for (let k = 0; k < 3; k++) b.add(new THREE.BoxGeometry(1.7, 0.12, 0.12).rotateZ((k * Math.PI) / 3), C("vaultSpoke", "#c9a227"), M4(0, 2.0, -D + 0.6));
      b.add(cyl(0.18, 0.18, 0.25, 16).rotateX(Math.PI / 2), C("vaultHub", "#c9a227"), M4(0, 2.0, -D + 0.5));
      for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; b.add(new THREE.SphereGeometry(0.1, 10, 8), C("vaultBolt", "#e3e6ea"), M4(1.75 * Math.cos(a), 2.0 + 1.75 * Math.sin(a), -D + 0.5)); }
      for (const s of [-1, 1]) {   // biometric scanners + padlocks beside the door
        box(b, C("scanner", "#1d1b22"), s * 2.9 - 0.25, 1.3, -D, s * 2.9 + 0.25, 1.9, -D + 0.12);
        const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.3), glow([0.3, 2.8, 1.2])); sc.position.set(s * 2.9, 1.65, -D + 0.13); root.add(sc);
        b.add(new THREE.TorusGeometry(0.16, 0.04, 8, 16, Math.PI), C("lockShackle", "#c9ced6"), M4(s * 2.4, 0.85, -D + 0.2));
        box(b, C("padlock", "#c9a227"), s * 2.4 - 0.18, 0.5, -D + 0.12, s * 2.4 + 0.18, 0.85, -D + 0.3);
      }
      b.add(cyl(0.35, 0.45, 1.0, 20), C("pedestal", "#2b2f38"), M4(3.6, 0, -2.6));
      const halo = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.05, 20), glow([3.6, 2.8, 0.6])); halo.position.set(3.6, 1.02, -2.6); root.add(halo);
    } else {
      for (let k = 0; k < 7; k++) {   // beams anchored on the side walls and the back wall, all behind / beside the cast
        const z0 = -D + 0.6 + k * 0.75, y0 = 0.4 + ((k * 0.37) % 1) * 2.2, y1 = 2.6 - ((k * 0.53) % 1) * 2.0;
        laser(root, -W + 0.05, y0, z0, W - 0.05, y1, z0 - 0.9);
      }
      for (let k = 0; k < 4; k++) laser(root, -W + 0.6 + k * 3.4, 0.05, -D + 0.05, -W + 2.2 + k * 3.4, H - 0.3, -D + 0.05);
      for (const s of [-1, 1]) {   // ceiling motion cameras
        box(b, C("camBody", "#e9ecef"), s * 4.6 - 0.25, H - 0.6, -D + 0.3, s * 4.6 + 0.25, H - 0.35, -D + 0.75);
        const red = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), glow([5, 0.3, 0.2])); red.position.set(s * 4.6, H - 0.48, -D + 0.78); root.add(red);
      }
    }
  } else if (kind === "office") {
    const W = 7, D = 5.5, H = 3.8;
    b.add(ground(-W, W, -D, D + 4, 4, 4, 0.01), lam("officeCarpet", () => ({ map: tileTex("oc", "#7d8aa0", "#727e94", 6) })));
    quadsRoom(b, W, D, H, lam("offBack", () => ({ map: plainWall("offB", "#eef0f2", "#5a5f6a") })), lam("offSide", () => ({ map: plainWall("offS", "#d9dde3", "#5a5f6a") })));
    windowOn(root, b, 0, 2.05, -D, 9.5, 2.9, skylineTex("o", false));
    kp(b, kit, "F.computerScreen", 1.0, 0.84, -2.75, 0.55, 0); kp(b, kit, "F.computerKeyboard", 1.0, 0.84, -2.35, 0.04, 0);
    kp(b, kit, "K.cup-coffee", -1.4, 0.84, -2.4, 0.16); kp(b, kit, "F.trashcan", 2.6, 0, -2.6, 0.55);
    kp(b, kit, "F.coatRackStanding", -6.3, 0, -3.4, 1.9); kp(b, kit, "F.bookcaseClosedWide", 6.4, 0, 0.6, 2.0, -Math.PI / 2);
    kp(b, kit, "F.loungeChair", -5.4, 0, 0.2, 0.9, Math.PI / 2); kp(b, kit, "F.sideTable", -5.4, 0, 1.3, 0.5);
    // executive desk + chair, laptop, phone, framed photo
    box(b, C("desk", "#5a3b2a"), -1.9, 0, -2.9, 1.9, 0.78, -2.0); box(b, C("deskTop", "#3a2a20"), -2.0, 0.78, -3.0, 2.0, 0.84, -1.9);
    box(b, C("laptop", "#c9ccd2"), -0.5, 0.84, -2.6, 0.5, 0.86, -2.1);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.6), glow([0.5, 0.75, 1.2])); scr.position.set(0, 1.17, -2.62); scr.rotation.x = -0.15; root.add(scr);
    box(b, C("photoFrame", "#e8b83a"), 1.2, 0.84, -2.7, 1.6, 1.2, -2.62);
    b.add(cyl(0.35, 0.35, 0.1, 16), C("chairSeat", "#1d1b22"), M4(0, 0.5, -3.6)); box(b, C("chairSeat", "#1d1b22"), -0.35, 0.6, -4.0, 0.35, 1.45, -3.85);
    b.add(cyl(0.05, 0.05, 0.5, 6), C("chairPole", "#5a5f6a"), M4(0, 0, -3.6));
    for (const s of [-1, 1]) { box(b, C("shelf", "#6b4a32"), s * 5.4 - 1, 0, -D, s * 5.4 + 1, 2.4, -D + 0.5); for (let k = 0; k < 4; k++) box(b, C("books" + k, ["#c8553d", "#3f6fb5", "#e8b83a", "#5d7a3a"][k]), s * 5.4 - 0.9 + k * 0.45, 1.3, -D + 0.1, s * 5.4 - 0.55 + k * 0.45, 1.75, -D + 0.45); }
    plant(b, kit, -6.2, 1.5); plant(b, kit, 6.2, 1.5);
  } else if (kind === "hotel") {
    const W = 6, D = 5, H = 3.5;
    b.add(ground(-W, W, -D, D + 4, 3, 3, 0.01), lam("hotelCarpet", () => ({ map: tileTex("hc", "#5a2f4a", "#4e2840", 4) })));
    quadsRoom(b, W, D, H, lam("hotBack", () => ({ map: plainWall("hotB", "#3b2f5a", "#e8b83a") })), lam("hotSide", () => ({ map: plainWall("hotS", "#2f2a4a", "#e8b83a") })));
    windowOn(root, b, 3.4, 2.0, -D, 3.2, 2.0, skylineTex("n", true));
    // bed: base, mattress, duvet, pillows, headboard
    box(b, C("bedBase", "#3a2a20"), -3.6, 0, -D, -0.4, 0.4, -1.6);
    box(b, C("mattress", "#f6f1e6"), -3.55, 0.4, -D + 0.05, -0.45, 0.62, -1.65);
    box(b, C("duvet", "#c8553d"), -3.6, 0.5, -D + 1.4, -0.4, 0.68, -1.55);
    for (const x of [-2.9, -1.1]) box(b, C("pillow", "#ffffff"), x - 0.55, 0.62, -D + 0.15, x + 0.55, 0.85, -D + 0.75);
    box(b, C("headboard", "#e8b83a"), -3.8, 0, -D, -0.2, 1.6, -D + 0.12);
    for (const x of [-4.4, 0.4]) { box(b, C("nightstand", "#3a2a20"), x - 0.4, 0, -D, x + 0.4, 0.6, -D + 0.6); const lm = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), glow([2.8, 2.0, 1.1])); lm.position.set(x, 0.95, -D + 0.3); root.add(lm); info.lanterns.push(V(x, 0.95, -D + 0.3)); }
    const neon = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), new THREE.MeshBasicMaterial({ map: neonTex("hotel", "hotel"), transparent: true, color: new THREE.Color(2.2, 2.2, 2.2) }));
    neon.position.set(-2.0, 2.5, -D + 0.03); neon.layers.set(NOINK); root.add(neon);
    plant(b, kit, 5.2, -4.2);
  } else if (kind === "cabin") {   // a ship's cabin: wooden planks everywhere, a hanging lantern, a cot, a chest, porthole
    const W = 4.5, D = 4, H = 3.0;
    const wood = lam("planksHD", () => ({ map: planksHD() }));
    b.add(ground(-W, W, -D, D + 4, 2.5, 2.5, 0.01), wood);
    const plank = lam("cabinWall", () => ({ map: rep(planksHD(), 1.5, 1) }));
    quadsRoom(b, W, D, H, plank, plank, 2);
    for (let z = -D + 0.8; z < D + 2; z += 1.4) box(b, C("cabinBeam", "#5a3b2a"), -W, H - 0.25, z, W, H, z + 0.25);
    const port = new THREE.Mesh(new THREE.CircleGeometry(0.45, 24), new THREE.MeshBasicMaterial({ color: "#1d2a50" })); port.position.set(2.2, 1.8, -D + 0.03); root.add(port);
    b.add(new THREE.TorusGeometry(0.47, 0.07, 8, 24), C("brass", "#c9a227"), M4(2.2, 1.8, -D + 0.05));
    box(b, C("cot", "#6b4a32"), -4.2, 0, -D, -1.6, 0.5, -D + 1.2); box(b, C("blanket", "#8c3b4a"), -4.15, 0.5, -D + 0.05, -1.65, 0.62, -D + 1.15);
    box(b, C("chest", "#7a4f33"), 2.6, 0, 1.2, 3.9, 0.7, 2.0); box(b, C("chestBand", "#c9a227"), 2.6, 0.55, 1.2, 3.9, 0.62, 2.02);
    box(b, C("cabinTable", "#6b4a32"), -0.7, 0.7, -2.6, 0.7, 0.78, -1.8); b.add(cyl(0.06, 0.06, 0.7, 6), C("cabinTable", "#6b4a32"), M4(0, 0, -2.2));
    const lm = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), glow([3.2, 2.2, 1.0])); lm.position.set(0, 2.2, -1); root.add(lm);
    box(b, C("lanternCage", "#2b2b38"), -0.17, 2.0, -1.17, 0.17, 2.04, -0.83);
    info.lanterns.push(V(0, 2.2, -1));
  } else if (kind === "bedroom") {
    const W = 5.5, D = 4.6, H = 3.3;
    b.add(ground(-W, W, -D, D + 4, 3, 3, 0.01), lam("planksHD", () => ({ map: planksHD() })));
    quadsRoom(b, W, D, H, lam("bedBack", () => ({ map: plainWall("bedB", "#d9c8e8", "#6b4a5a") })), lam("bedSide", () => ({ map: plainWall("bedS", "#c8b4d9", "#6b4a5a") })));
    const day = env.variant === "day";
    windowOn(root, b, 3.2, 1.9, -D, 2.2, 1.6, skylineTex(day ? "d" : "n", !day));
    for (const s of [-1, 1]) box(b, C("curtain2", "#c8553d"), 3.2 + s * 1.35 - 0.2, 0.9, -D + 0.05, 3.2 + s * 1.35 + 0.2, 2.9, -D + 0.15);   // curtains
    posterOn(root, b, "car", -3.6, 2.1, -D + 0.03, 1.0); posterOn(root, b, "palms", -W + 0.03, 2.0, -1.5, 1.1, Math.PI / 2);
    posterOn(root, b, "rocket", W - 0.03, 2.0, -1.0, 1.0, -Math.PI / 2);
    box(b, C("shelf2", "#6b4a32"), 0.2, 2.35, -D, 2.0, 2.42, -D + 0.3);
    for (let k = 0; k < 4; k++) b.add(cyl(0.1, 0.1, 0.22 + 0.08 * (k % 2), 10), C("fig" + k, ["#e2453c", "#3f6fb5", "#ffd23f", "#5d7a3a"][k]), M4(0.45 + k * 0.42, 2.42, -D + 0.15));
    box(b, C("bedBase", "#3a2a20"), -2.4, 0, -D, 1.4, 0.4, -1.2);
    box(b, C("mattress", "#f6f1e6"), -2.35, 0.4, -D + 0.05, 1.35, 0.6, -1.25);
    box(b, C("duvet2", "#7fa8d9"), -2.4, 0.5, -D + 1.3, 1.4, 0.66, -1.2);
    for (const x of [-1.5, 0.5]) box(b, C("pillow", "#ffffff"), x - 0.6, 0.6, -D + 0.15, x + 0.6, 0.82, -D + 0.75);
    box(b, C("headboard2", "#6b4a32"), -2.6, 0, -D, 1.6, 1.5, -D + 0.12);
    for (const x of [-3.1, 2.1]) { box(b, C("nightstand", "#3a2a20"), x - 0.4, 0, -D, x + 0.4, 0.6, -D + 0.6); const l = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), glow([2.8, 2.0, 1.1])); l.position.set(x, 0.95, -D + 0.3); root.add(l); info.lanterns.push(V(x, 0.95, -D + 0.3)); }
    box(b, C("rugBed", "#e8c46a"), -2.6, 0.012, -1.0, 1.6, 0.02, 0.6);
    plant(b, kit, 4.6, -3.8);
  } else if (kind === "gameroom") {   // curtains shut, dark walls, RGB light strips, a big TV with the game, console, gaming desk, posters
    const W = 5.5, D = 4.4, H = 3.2;
    b.add(ground(-W, W, -D, D + 4, 3, 3, 0.01), lam("planksDark", () => ({ map: planksHD(), color: "#7a7090" })));
    quadsRoom(b, W, D, H, lam("gameBack", () => ({ map: plainWall("gameB", "#2a2448", "#14102a") })), lam("gameSide", () => ({ map: plainWall("gameS", "#231e3e", "#14102a") })));
    const dark = env.variant === "candles", flood = env.variant === "flood";   // candles: the grid is down; flood: the ocean came out of the TV
    for (const [y, c] of [[H - 0.15, [0.4, 3.0, 3.4]], [0.12, [3.2, 0.5, 2.6]]] as const) {   // RGB strips along the back wall (bloom)
      const strip = new THREE.Mesh(new THREE.BoxGeometry(2 * W, 0.05, 0.05), dark ? new THREE.MeshLambertMaterial({ color: "#2a2a34" }) : glow(c as [number, number, number])); strip.position.set(0, y, -D + 0.06); root.add(strip);
    }
    const sideStrip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, D * 2), dark ? new THREE.MeshLambertMaterial({ color: "#2a2a34" }) : glow([3.2, 0.5, 2.6])); sideStrip.position.set(-W + 0.06, H - 0.15, 0); root.add(sideStrip);
    // CC0 Kenney set dressing: desk speakers, keyboard, snacks and cans, a bookcase of games, a lounge chair, bin, lamp, rug
    kp(b, kit, "F.speaker", -3.15, 0.8, -D + 0.75, 0.55, 0); kp(b, kit, "F.speakerSmall", 0.25, 0.8, -D + 0.6, 0.35, 0);
    kp(b, kit, "F.computerKeyboard", -1.4, 0.8, -D + 1.0, 0.04, 0);
    kp(b, kit, "K.soda-can", -2.4, 0.8, -D + 1.05, 0.16, 0.3); kp(b, kit, "K.soda-can", -2.2, 0.8, -D + 0.95, 0.16, 1.2);
    kp(b, kit, "K.pizza-box", 3.6, 0, -1.2, 0.12, 0.4); kp(b, kit, "K.soda-can-crushed", 3.1, 0, -0.6, 0.1, 0.9);
    kp(b, kit, "F.bookcaseOpenLow", W - 0.45, 0, 0.8, 1.1, -Math.PI / 2); kp(b, kit, "F.loungeChairRelax", -4.3, 0, 0.6, 1.0, Math.PI / 2);
    kp(b, kit, "F.trashcan", 4.6, 0, -3.7, 0.55); kp(b, kit, "F.rugRound", 0.8, 0.005, -1.2, 0.03);
    if (!dark) kp(b, kit, "F.lampSquareFloor", -4.8, 0, -3.7, 1.9);
    if (dark) {   // power cut: candles on the desk and the floor, tangled ethernet cables
      for (const [x, y, z, h] of [[-3.0, 0.8, -D + 0.5, 0.25], [-0.8, 0.8, -D + 0.5, 0.18], [0.3, 0.8, -D + 1.1, 0.3], [-4.6, 0, -2.6, 0.35], [4.2, 0, -2.2, 0.28], [2.4, 0, -3.8, 0.22]] as const) candle(root, b, info, x, y, z, h);
      for (let k = 0; k < 5; k++) b.add(new THREE.TorusGeometry(0.16 + k * 0.03, 0.012, 6, 20).rotateX(Math.PI / 2 - 0.3 + k * 0.15), C("ethCable" + (k % 2), k % 2 ? "#3f6fb5" : "#e8b83a"), M4(-1.9 + k * 0.18, 0.82, -D + 0.75));
    }
    if (flood) {   // ankle-deep sea water over the floor, a sand heap under the TV, floating pizza boxes, police lights at the window
      const water = new THREE.Mesh(new THREE.PlaneGeometry(2 * W, 2 * D + 4).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: "#3fa8d8", transparent: true, opacity: 0.62 }));
      water.position.set(0, 0.28, 2); water.layers.set(NOINK); root.add(water);
      b.add(new THREE.SphereGeometry(1, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), C("sandHeap", "#e9cf8a"), MS(-1.4, 0, -D + 1.1, 1.5, 0.55, 0.8));
      for (const [x, z, ry] of [[1.8, -0.6, 0.5], [-3.0, 0.9, 1.4], [3.9, 1.6, 2.6]] as const) kp(b, kit, "K.pizza-box", x, 0.27, z, 0.12, ry);
      for (const [x, c] of [[2.2, [4.0, 0.3, 0.25]], [3.8, [0.3, 0.8, 4.0]]] as const) {
        const pl = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.2), glow(c as [number, number, number])); pl.position.set(x, 1.8, -D + 0.2); pl.layers.set(NOINK); root.add(pl);
      }
    }
    // curtains drawn over the window
    box(b, C("curtainShut", "#3a2a6a"), 1.4, 0.6, -D + 0.04, 4.6, 3.0, -D + 0.16);
    for (let x = 1.6; x < 4.6; x += 0.5) box(b, C("curtainFold", "#2a1e52"), x, 0.6, -D + 0.16, x + 0.1, 3.0, -D + 0.19);
    // gaming desk, big TV with the game, console glowing blue, chair
    box(b, C("gDesk", "#1d1b22"), -3.4, 0.72, -D + 0.3, 0.6, 0.8, -D + 1.3);
    for (const x of [-3.3, 0.5]) box(b, C("gDeskLeg", "#3a3d47"), x - 0.04, 0, -D + 0.4, x + 0.04, 0.72, -D + 1.2);
    box(b, C("tvFrame", "#0d0d12"), -2.75, 1.05, -D + 0.08, -0.05, 2.65, -D + 0.18);
    const tvs = new THREE.Mesh(new THREE.PlaneGeometry(2.55, 1.45), new THREE.MeshBasicMaterial({ map: gameScreenTex(), color: new THREE.Color(1.25, 1.25, 1.25) }));
    tvs.position.set(-1.4, 1.85, -D + 0.19); tvs.layers.set(NOINK); root.add(tvs);
    box(b, C("console", "#f2f2f5"), -0.4, 0.8, -D + 0.45, -0.15, 1.3, -D + 0.85); box(b, C("consoleBlack", "#1d1b22"), -0.34, 0.8, -D + 0.47, -0.21, 1.3, -D + 0.83);
    const led = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.4, 0.02), glow([0.3, 1.6, 3.6])); led.position.set(-0.275, 1.05, -D + 0.86); root.add(led);
    // gaming chair turned sideways to the right of the desk (never between the lens and the player)
    box(b, C("gChair", "#e2232a"), 1.2, 0.45, -3.4, 2.0, 0.6, -2.6); box(b, C("gChairBack", "#1d1b22"), 1.95, 0.6, -3.4, 2.1, 1.6, -2.6);
    b.add(cyl(0.05, 0.05, 0.45, 6), C("gChairPole", "#3a3d47"), M4(1.6, 0, -3.0));
    posterOn(root, b, "city", 2.0, 1.8, -D + 0.25, 0.9); posterOn(root, b, "arcade", -W + 0.03, 1.9, -1.2, 1.0, Math.PI / 2);
    posterOn(root, b, "car", W - 0.03, 1.9, -1.4, 1.0, -Math.PI / 2);
  } else if (kind === "kitchen") {
    const W = 5.5, D = 4.4, H = 3.2;
    b.add(ground(-W, W, -D, D + 4, 3, 3, 0.01), lam("kitFloor", () => ({ map: tileTex("kf", "#f2efe8", "#c9c4b8", 6, true) })));
    const wall = lam("kitWall", () => ({ map: tileTex("kw", "#ffffff", "#d9dde3", 12) }));
    quadsRoom(b, W, D, H, wall, lam("kitSide", () => ({ map: plainWall("kitS", "#f7e7c4", "#c8553d") })), 3);
    windowOn(root, b, 0, 2.0, -D, 2.2, 1.3, skylineTex("d", false));
    box(b, C("counter", "#3f6fb5"), -W, 0, -D, W, 0.9, -D + 0.7); box(b, C("countertop", "#f2efe8"), -W, 0.9, -D, W, 0.98, -D + 0.75);
    box(b, C("fridge", "#e9ecef"), 3.6, 0, -D, 5.0, 2.2, -D + 0.9); box(b, C("fridgeLine", "#9aa0a8"), 3.6, 1.35, -D + 0.9, 5.0, 1.38, -D + 0.92);
    box(b, C("upperCab", "#3f6fb5"), -W, 2.0, -D, -1.4, 2.8, -D + 0.45); box(b, C("upperCab", "#3f6fb5"), 1.4, 2.0, -D, 3.5, 2.8, -D + 0.45);
    b.add(cyl(0.7, 0.7, 0.06, 20), C("kTable", "#f2efe8"), M4(-2.6, 0.75, -1.2)); b.add(cyl(0.06, 0.06, 0.75, 6), C("kTableLeg", "#2b2b38"), M4(-2.6, 0, -1.2));
    b.add(cyl(0.09, 0.08, 0.16, 12), C("mug", "#c8553d"), M4(-2.4, 0.81, -1.1));
    plant(b, kit, -5.0, 1.0);
  } else if (kind === "banquet") {   // wedding reception hall
    const W = 11, D = 8, H = 6;
    b.add(ground(-W, W, -D, D + 6, 6, 6, 0.01), lam("banqFloor", () => ({ map: planksHD() })));
    quadsRoom(b, W, D, H, lam("banqBack", () => ({ map: plainWall("banqB", "#f2e6d4", "#c9a227") })), lam("banqSide", () => ({ map: plainWall("banqS", "#efe0c8", "#c9a227") })));
    const cloth = C("tablecloth", "#ffffff"), glass = new THREE.MeshLambertMaterial({ color: "#d8f0ff", transparent: true, opacity: 0.7 });
    // head table across the back (with a floral garland), round guest tables in rows
    box(b, cloth, -5, 0, -D + 1.2, 5, 0.8, -D + 2.2);
    for (let x = -4.6; x <= 4.6; x += 0.6) b.add(new THREE.SphereGeometry(0.16, 8, 6), C("flower" + (Math.round(x * 10) % 3), ["#ff8fc0", "#ffffff", "#ffd23f"][Math.abs(Math.round(x * 10)) % 3]), M4(x, 0.82, -D + 2.25));
    for (const [x, z] of [[-6.5, -1.5], [-2.5, 0.5], [2.5, 0.5], [6.5, -1.5], [-6.5, 3.5], [6.5, 3.5]]) {
      b.add(cyl(1.0, 1.0, 0.75, 20), cloth, M4(x, 0, z));
      for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; const g2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.03, 0.22, 8), glass); g2.position.set(x + 0.6 * Math.cos(a), 0.86, z + 0.6 * Math.sin(a)); root.add(g2); }
      b.add(cyl(0.12, 0.08, 0.3, 10), C("vase", "#c9a227"), M4(x, 0.75, z));
    }
    for (const [x, z] of [[-5, -3], [5, -3], [0, 1.5]]) {   // chandeliers
      const ring = new THREE.TorusGeometry(0.7, 0.05, 6, 24).rotateX(Math.PI / 2);
      b.add(ring, C("brass", "#c9a227"), M4(x, 4.6, z)); b.add(cyl(0.02, 0.02, 1.4, 4), C("brass", "#c9a227"), M4(x, 4.6, z));
      for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2, l = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), glow([3.0, 2.4, 1.4])); l.position.set(x + 0.7 * Math.cos(a), 4.72, z + 0.7 * Math.sin(a)); root.add(l); }
      info.lanterns.push(V(x, 4.6, z));
    }
    box(b, C("doors", "#8a5a34"), -W, 0, 2.6, -W + 0.15, 3.2, 5.0);   // double doors on the left wall
    box(b, C("doorFrame", "#c9a227"), -W, 3.2, 2.5, -W + 0.2, 3.35, 5.1);
    for (const x of [-9.5, 9.5]) plant(b, kit, x, -6.8);
  } else {   // airport
    const W = 14, D = 8, H = 7;
    b.add(ground(-W, W, -D, D + 6, 6, 6, 0.01), lam("airFloor", () => ({ map: tileTex("af", "#e9e6df", "#d6d2c8", 4, true) })));
    quadsRoom(b, W, D, H, lam("airBack", () => ({ map: plainWall("airB", "#dfe3e8", "#5a5f6a") })), lam("airSide", () => ({ map: plainWall("airS", "#cfd5dc", "#5a5f6a") })));
    // the back wall is a glass curtain wall onto the apron: sky, runway, a parked jet (painted)
    const apron = ctex("apron", 1024, 512, (g) => {
      const sky = g.createLinearGradient(0, 0, 0, 300); sky.addColorStop(0, "#6fb0ea"); sky.addColorStop(1, "#e3f1fb");
      g.fillStyle = sky; g.fillRect(0, 0, 1024, 512); g.fillStyle = "#8a8f98"; g.fillRect(0, 330, 1024, 182);
      g.fillStyle = "#f7f3ea"; for (let x = 0; x < 1024; x += 90) g.fillRect(x, 420, 50, 10);
      g.fillStyle = "#f7f7fa"; g.strokeStyle = INKC; g.lineWidth = 7;
      g.beginPath(); g.ellipse(560, 300, 330, 46, 0, 0, Math.PI * 2); g.fill(); g.stroke();                                   // fuselage
      g.beginPath(); g.moveTo(480, 310); g.lineTo(330, 400); g.lineTo(420, 400); g.lineTo(640, 315); g.closePath(); g.fill(); g.stroke();   // wing
      g.beginPath(); g.moveTo(820, 270); g.lineTo(880, 160); g.lineTo(920, 160); g.lineTo(890, 280); g.closePath(); g.fillStyle = "#c8323a"; g.fill(); g.stroke();
      g.fillStyle = "#3f6fb5"; g.fillRect(260, 292, 600, 10);
      g.fillStyle = "#2b2b38"; for (let x = 300; x < 820; x += 34) g.fillRect(x, 280, 14, 12);
    });
    // "aquarium": the island has sunk so far that the ground-floor glass looks into the sea (fish, bubbles, sea weed)
    const under = env.variant === "aquarium" ? ctex("underwater", 1024, 512, (g, r) => {
      const w = g.createLinearGradient(0, 0, 0, 512); w.addColorStop(0, "#5fc4e6"); w.addColorStop(1, "#14527a"); g.fillStyle = w; g.fillRect(0, 0, 1024, 512);
      g.fillStyle = "rgba(255,255,255,0.25)"; for (let k = 0; k < 40; k++) { g.beginPath(); g.arc(r() * 1024, r() * 512, 3 + r() * 8, 0, 7); g.fill(); }
      g.strokeStyle = "#2f8a4a"; g.lineWidth = 12; g.lineCap = "round"; for (let k = 0; k < 12; k++) { const x = r() * 1024; g.beginPath(); g.moveTo(x, 512); g.quadraticCurveTo(x + 30, 420, x - 10, 330 + r() * 60); g.stroke(); }
      for (let k = 0; k < 9; k++) { const x = 60 + r() * 900, y = 80 + r() * 300, c = ["#ff7a1a", "#ffd23f", "#ff4fa0", "#39d9ff"][k % 4];
        g.fillStyle = c; g.strokeStyle = INKC; g.lineWidth = 5; g.beginPath(); g.ellipse(x, y, 46, 26, 0, 0, 7); g.fill(); g.stroke();
        g.beginPath(); g.moveTo(x + 40, y); g.lineTo(x + 76, y - 22); g.lineTo(x + 76, y + 22); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = "#ffffff"; g.beginPath(); g.arc(x - 24, y - 6, 8, 0, 7); g.fill(); g.fillStyle = "#1d1b22"; g.beginPath(); g.arc(x - 22, y - 6, 4, 0, 7); g.fill(); }
    }) : null;
    for (let k = -2; k <= 2; k++) windowOn(root, b, k * 5.4, 3.0, -D, 5.2, 5.2, under ?? apron);
    const board = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2.3), new THREE.MeshBasicMaterial({ map: boardTex(), color: new THREE.Color(1.2, 1.2, 1.2) }));
    board.position.set(-9.5, 3.8, -2); board.rotation.y = Math.PI / 2; board.layers.set(NOINK); root.add(board);
    box(b, C("boardBack", "#2b2b38"), -W, 2.5, -3.3, -W + 0.3, 5.1, -0.7);
    // rows of blue seats
    const seat = C("seat", "#3f6fb5"), leg = C("seatLeg", "#5a5f6a");
    for (const z of [-4.5, -2.0]) for (let x = -6; x <= 6; x += 0.7) { if (Math.abs(x) < 1.5) continue; box(b, seat, x - 0.3, 0.42, z, x + 0.3, 0.5, z + 0.5); box(b, seat, x - 0.3, 0.5, z + 0.42, x + 0.3, 1.0, z + 0.5); box(b, leg, x - 0.04, 0, z + 0.2, x + 0.04, 0.42, z + 0.3); }
    for (const x of [-10, 10]) b.add(cyl(0.45, 0.45, H), C("pillar", "#f2efe8"), M4(x, 0, 2));
    plant(b, kit, 12.5, -6.5); plant(b, kit, -12.5, 4);
  }
};

/** a lit shop window: warm interior, shelves of goods, a counter, the shop's colour on the frame */
const shopWinTex = (name: string, col: string) => ctex("shopwin_" + name, 512, 300, (g, r) => {
  const w = g.createLinearGradient(0, 0, 0, 300); w.addColorStop(0, "#fff1c9"); w.addColorStop(1, "#f2c98a"); g.fillStyle = w; g.fillRect(0, 0, 512, 300);
  for (let y = 70; y < 260; y += 60) { g.fillStyle = "#8a5a34"; g.fillRect(20, y, 472, 8); for (let x = 30; x < 480; x += 26) { g.fillStyle = ["#e2453c", "#ffd23f", "#3f6fb5", "#39d98a", "#ff7a1a", "#9a7ac9"][Math.floor(r() * 6)]; g.fillRect(x, y - 30 - r() * 14, 18, 30 + r() * 14); } }
  g.fillStyle = "rgba(255,255,255,0.25)"; g.beginPath(); g.moveTo(40, 0); g.lineTo(140, 0); g.lineTo(60, 300); g.lineTo(-40, 300); g.fill();
  g.strokeStyle = col; g.lineWidth = 18; g.strokeRect(0, 0, 512, 300); g.strokeStyle = INKC; g.lineWidth = 6; g.strokeRect(9, 9, 494, 282);
});
const openTex = () => ctex("neonOpen", 256, 128, (g) => {
  g.clearRect(0, 0, 256, 128); g.font = "bold 76px Arial Black, Arial"; g.textAlign = "center";
  g.lineWidth = 16; g.strokeStyle = "rgba(57,217,138,0.5)"; g.strokeText("OPEN", 128, 92); g.lineWidth = 6; g.strokeStyle = "#d8ffe8"; g.strokeText("OPEN", 128, 92);
});
// ---------------- shops: a high street with every shutter down ----------------
const brickTex = (key: string, col: string) => ctex("brick_" + key, 512, 512, (g, r) => {
  g.fillStyle = "#d8cbb8"; g.fillRect(0, 0, 512, 512);
  for (let row = 0; row < 16; row++) for (let k = -1; k < 9; k++) {
    const x = k * 64 + (row % 2) * 32, y = row * 32;
    g.fillStyle = col; g.globalAlpha = 0.85 + r() * 0.15; g.fillRect(x + 3, y + 3, 58, 26); g.globalAlpha = 1;
  }
});
const shutterTex = () => ctex("shutter", 512, 512, (g) => {
  g.fillStyle = "#a8adb5"; g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 24) { g.fillStyle = "#8a9099"; g.fillRect(0, y, 512, 6); g.fillStyle = "#c9ced6"; g.fillRect(0, y + 8, 512, 3); }
  g.fillStyle = "rgba(60,60,70,0.4)"; g.fillRect(230, 470, 52, 20);
});
const signTex = (text: string, bg: string) => ctex("shopSign_" + text, 512, 128, (g) => {
  g.fillStyle = bg; g.fillRect(0, 0, 512, 128); g.strokeStyle = INKC; g.lineWidth = 10; g.strokeRect(5, 5, 502, 118);
  g.fillStyle = "#ffffff"; g.font = "bold 70px Arial Black, Arial"; g.textAlign = "center"; g.fillText(text, 256, 92);
});
const closedTex = () => ctex("closedNeon", 512, 256, (g) => {
  g.clearRect(0, 0, 512, 256); g.textAlign = "center"; g.lineJoin = "round";
  for (const [t, y, s] of [["CLOSED", 110, 96], ["UNTIL FURTHER NOTICE", 200, 44]] as const) {
    g.font = `bold ${s}px Arial Black, Arial`;
    g.lineWidth = 16; g.strokeStyle = "rgba(255,40,60,0.45)"; g.strokeText(t, 256, y);
    g.lineWidth = 5; g.strokeStyle = "#ffd0d6"; g.strokeText(t, 256, y);
  }
});
export const buildShops = (root: THREE.Object3D, kit: Kit, env: EnvSpec, info: EnvInfo, b: Batch) => {
  const r = rng(env.seed || 41);
  b.add(ground(-300, 300, -300, 300, 100, 100, -0.01), lam("cityGround", () => ({ color: "#8a8f98" })));
  box(b, C("asphalt", "#4a4f5a"), -150, -0.005, 6, 150, 0.01, 14);
  for (let x = -150; x < 150; x += 6) box(b, C("roadLine", "#f2efe8"), x, 0.012, 9.9, x + 3, 0.015, 10.1);
  box(b, lam("pavement", () => ({ map: rep(tileTex("pv", "#c9c4b8", "#b0aa9c", 4), 1, 1) })), -150, 0, 0, 150, 0.08, 6);
  const hq = env.variant === "hq";   // the game studio's fortress HQ: security signs, a fence, sweeping searchlights
  const shops: [string, string][] = hq ? [["KEEP OUT", "#8a1f1f"], ["SECURITY", "#2b2f38"], ["STUDIO HQ", "#1d1b22"], ["NO LEAKS", "#8a1f1f"]]
    : [["COFFEE", "#7a4f33"], ["BANK", "#2f3f6a"], ["GROCERY", "#3f7a3a"], ["PHARMACY", "#3f8fa0"], ["DINER", "#c8323a"], ["BOOKS", "#7a3a6a"], ["PIZZA", "#c8553d"]];
  // CC0 Kenney cars parked along the kerb (a police car outside the HQ)
  const cars = hq ? ["police", "suv", "van", "police", "sedan"] : ["taxi", "sedan", "suv", "hatchback-sports", "van", "sedan-sports"];
  [-27, -15, 11, 21, 33].forEach((x, i) => kp(b, kit, "C." + cars[i % cars.length], x, 0, 7.4, 1.5, i % 2 ? Math.PI / 2 : -Math.PI / 2));
  if (hq) {
    // steel security fence: posts, rails and a see-through chain-link mesh
    const link = ctex("chainLink", 256, 256, (g) => { g.clearRect(0, 0, 256, 256); g.strokeStyle = "#c9ced6"; g.lineWidth = 4; for (let k = -256; k < 512; k += 32) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + 256, 256); g.stroke(); g.beginPath(); g.moveTo(k + 256, 0); g.lineTo(k, 256); g.stroke(); } });
    link.wrapS = link.wrapT = THREE.RepeatWrapping; link.repeat.set(40, 1);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(52, 1.2), new THREE.MeshLambertMaterial({ map: link, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide }));
    mesh.position.set(0, 0.68, 0.9); root.add(mesh);
    for (let x = -26; x <= 26; x += 2.6) b.add(cyl(0.04, 0.04, 1.3, 6), C("fencePostS", "#8a9099"), M4(x, 0.08, 0.9));
    box(b, C("fenceRail", "#8a9099"), -26, 1.22, 0.87, 26, 1.26, 0.93);
    for (let x = -26; x <= 26; x += 0.5) box(b, C("barbed", "#9aa0a8"), x, 1.25 + (Math.round(x * 2) % 2) * 0.06, 0.88, x + 0.35, 1.3 + (Math.round(x * 2) % 2) * 0.06, 0.92);
    const beamM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.5, 1.1), transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide });
    for (const [x, tilt] of [[-12, 0.35], [9, -0.3], [24, 0.2]] as const) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(2.2, 22, 20, 1, true), beamM); cone.position.set(x + Math.sin(tilt) * 11, 9 + 11 * Math.cos(tilt), -8); cone.rotation.z = Math.PI + tilt; cone.layers.set(NOINK); root.add(cone);
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 8), glow([4, 3.6, 2.6])); lamp.position.set(x, 9, -8); root.add(lamp);
    }
  }
  for (let i = -3; i <= 3; i++) {
    const x = i * 8, [name, col] = shops[(i + 7) % shops.length], bcol = ["#b8643a", "#a85a40", "#c27a4a", "#9a5a3a"][(i + 4) % 4];
    const brick = lam("brickM" + bcol, () => ({ map: rep(brickTex(bcol, bcol), 2, 2) }));
    box(b, brick, x - 3.9, 0, -6, x + 3.9, 7 + (i % 2) * 1.2, 0);
    const open = env.variant === "open";   // a normal busy street: lit shop windows with goods, green OPEN signs
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 3.0), open ? new THREE.MeshBasicMaterial({ map: shopWinTex(name, col), color: 0xeeeeee }) : new THREE.MeshLambertMaterial({ map: shutterTex() }));
    sh.position.set(x - 0.6, 1.6, 0.03); if (open) sh.layers.set(NOINK); root.add(sh);
    box(b, C("shutterBox", "#6a6f78"), x - 3.25, 3.1, 0, x + 2.05, 3.4, 0.25);
    const door = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.4), new THREE.MeshLambertMaterial({ map: shutterTex(), color: "#9aa0a8" })); door.position.set(x + 2.7, 1.2, 0.03); root.add(door);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.15), new THREE.MeshBasicMaterial({ map: signTex(name, col), color: 0xeeeeee })); sign.position.set(x - 0.4, 4.2, 0.05); sign.layers.set(NOINK); root.add(sign);
    const neon = new THREE.Mesh(new THREE.PlaneGeometry(open ? 1.3 : 2.6, open ? 0.65 : 1.3), new THREE.MeshBasicMaterial({ map: open ? openTex() : closedTex(), transparent: true, color: new THREE.Color(2.6, 2.6, 2.6) }));
    neon.position.set(open ? x + 1.4 : x - 0.6, open ? 2.7 : 1.9, 0.06); neon.layers.set(NOINK); if (!hq) root.add(neon);
    for (const wx of [-2.2, 0, 2.2]) box(b, C("upWin", "#cfe6fa"), x + wx - 0.6, 5.0, 0.0, x + wx + 0.6, 6.2, 0.04);
    box(b, C("awningBar", "#2b2b38"), x - 3.9, 3.55, 0, x + 3.9, 3.7, 0.5);
  }
  for (let x = -24; x <= 24; x += 12) { b.add(cyl(0.07, 0.09, 4.2, 8), C("streetLamp", "#2b2b38"), M4(x, 0, 5.4)); const lm = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), glow([3, 2.3, 1.2])); lm.position.set(x, 4.2, 5.4); root.add(lm); info.lanterns.push(V(x, 4.2, 5.4)); }
  for (const x of [-14, 6, 18]) { b.add(cyl(0.32, 0.28, 0.9, 12), C("bin", "#3f6f5a"), M4(x, 0, 4.8)); }
  box(b, C("bench", "#7a4f33"), -4, 0.42, 4.6, -2.4, 0.5, 5.1); box(b, C("bench", "#7a4f33"), -4, 0.5, 5.0, -2.4, 0.95, 5.1);
  for (let i = -6; i <= 6; i++) { const x = i * 9; box(b, C("farBlock" + (i % 3), ["#c8b8a0", "#b8a890", "#d8c8b0"][(i + 9) % 3]), x - 4, 0, 18, x + 4, 8 + r() * 6, 26); }
  prop(b, kit, "tree_default", -10, 0, 4.6, 5); prop(b, kit, "tree_oak", 14, 0, 4.6, 5.4);
};

// ---------------- outback (Western Australia, 1932) ----------------
export const buildOutback = (root: THREE.Object3D, kit: Kit, env: EnvSpec, info: EnvInfo, b: Batch) => {
  const r = rng(env.seed || 37);
  const sand = ctex("redSand", 1024, 1024, (g, rr) => {
    g.fillStyle = "#d9884a"; g.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 2400; i++) { g.fillStyle = rr() < 0.5 ? "rgba(255,210,150,0.25)" : "rgba(120,50,20,0.16)"; g.fillRect(rr() * 1024, rr() * 1024, 2 + rr() * 6, 2 + rr() * 3); }
  });
  b.add(ground(-500, 500, -500, 500, 200, 200, 0.0), lam("outbackSand", () => ({ map: rep(sand, 1, 1) })));
  // a golden wheat field behind a post-and-wire fence (north), a small dam (east)
  const wheat = ctex("wheat", 512, 512, (g, rr) => { g.fillStyle = "#e8c45a"; g.fillRect(0, 0, 512, 512); g.strokeStyle = "rgba(160,110,30,0.45)"; g.lineWidth = 3; for (let i = 0; i < 400; i++) { const x = rr() * 512, y = rr() * 512; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 3, y - 18); g.stroke(); } });
  b.add(ground(-120, 120, -90, -14, 40, 25, 0.02), lam("wheatField", () => ({ map: rep(wheat, 1, 1) })));
  for (let x = -60; x <= 60; x += 4) { b.add(cyl(0.07, 0.08, 1.3, 6), C("fencePost", "#7a5a3a"), M4(x, 0, -13)); }
  for (const y of [0.5, 0.95]) box(b, C("fenceWire", "#5a5f6a"), -60, y, -13.02, 60, y + 0.03, -12.98);
  for (let i = 0; i < 160; i++) { const x = -110 + r() * 220, z = -88 + r() * 72; b.add(cyl(0.02, 0.02, 1.1, 3), C("stalk", "#d9b048"), M4(x, 0, z)); }
  const dam = new THREE.Mesh(new THREE.CircleGeometry(7, 32).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: "#4f9fc4" })); dam.position.set(22, 0.03, 6); root.add(dam);
  b.add(new THREE.TorusGeometry(7.1, 0.5, 6, 32).rotateX(Math.PI / 2).scale(1, 0.4, 1), C("damBank", "#b8743a"), M4(22, 0.05, 6));
  // dry bushes, spinifex, a lone gum tree, mesas on the horizon
  for (let i = 0; i < 70; i++) { const x = -90 + r() * 180, z = -10 + r() * 90; if (Math.abs(x) < 5 && z < 14) continue; b.add(new THREE.SphereGeometry(1, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), C("dryBush" + (i % 3), ["#8a8a4a", "#9a7a46", "#7a8a5a"][i % 3]), MS(x, 0, z, 0.6 + r() * 0.8, 0.4 + r() * 0.4, 0.6 + r() * 0.8)); }
  prop(b, kit, "tree_fat", -16, 0, -6, 7, 1.0);
  const hill = new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  for (const [x, z, sx, sy, sz] of [[-260, -320, 160, 50, 80], [200, -360, 220, 60, 90], [380, 120, 140, 40, 70], [-380, 200, 180, 45, 80]] as const) b.add(hill, C("mesa", "#b8643a"), MS(x, -1, z, sx, sy, sz));
  void info;
};

// ---------------- suburb ----------------
export const buildSuburb = (root: THREE.Object3D, kit: Kit, env: EnvSpec, info: EnvInfo, b: Batch) => {
  const r = rng(env.seed || 23);
  b.add(ground(-300, 300, -300, 300, 120, 120, -0.01), lam("lawn", () => ({ color: "#7cbf4f" })));
  box(b, C("asphalt", "#5a5f6a"), -120, -0.005, 9, 120, 0.01, 16);
  for (let x = -120; x < 120; x += 6) box(b, C("roadLine", "#f2efe8"), x, 0.012, 12.4, x + 3, 0.015, 12.6);
  box(b, C("sidewalk", "#d9d6cf"), -120, 0, 7.4, 120, 0.06, 9);
  const cols = ["#e9d9b6", "#cfe0e8", "#f2d4c4", "#dfe8cf", "#e8e1f2"];
  for (let i = -4; i <= 4; i++) {
    const x = i * 16, col = cols[(i + 8) % cols.length];
    const front = lam("hf" + col, () => ({ map: houseFront("h" + col, col, ["#c8323a", "#3f6fb5", "#2f6a5a"][(i + 9) % 3]) }));
    const sideM = C("hs" + col, col), roofM = C("roof" + ((i + 9) % 3), ["#6b4a42", "#4a4f5a", "#7a3a2a"][(i + 9) % 3]);
    b.add(quad(V(x - 5, 0, -6), V(x + 5, 0, -6), V(x + 5, 5, -6), V(x - 5, 5, -6), 1, 1), front);
    box(b, sideM, x - 5, 0, -16, x + 5, 5, -6.01);
    const roof = new THREE.CylinderGeometry(0.01, 6.6, 2.8, 4, 1).rotateY(Math.PI / 4).scale(1.05, 1, 1.5);
    b.add(roof, roofM, M4(x, 6.4, -11));
    box(b, C("driveway", "#b9b5ad"), x - 2.2, 0.0, -6, x + 1.6, 0.03, 7.4);                                     // driveway to the garage
    box(b, C("path", "#d9d6cf"), x + 2.4, 0.0, -6, x + 3.4, 0.03, 7.4);
    b.add(cyl(0.05, 0.05, 1.1, 6), C("mailPole", "#5a3b2a"), M4(x + 4, 0, 6.8)); box(b, C("mailbox", "#3f6fb5"), x + 3.8, 1.1, 6.6, x + 4.2, 1.4, 7.1);
    prop(b, kit, ["tree_oak", "tree_default", "tree_fat"][(i + 9) % 3], x - 6.5, 0, -1, 6 + r() * 2, r() * 6);
    for (let k = 0; k < 3; k++) prop(b, kit, "plant_bush", x - 4.5 + k * 1.1, 0, -5.4, 0.8);
    if ((i + 9) % 3 !== 1) kp(b, kit, "C." + ["suv", "sedan", "hatchback-sports", "van"][(i + 9) % 4], x - 0.3, 0, -2.2, 1.5, 0);   // CC0 Kenney car in the driveway
  }
  for (let i = -4; i <= 4; i++) { const x = i * 16 + 8; box(b, C("farHouse", "#d8cbb4"), x - 5, 0, 22, x + 5, 5, 30); b.add(new THREE.CylinderGeometry(0.01, 6.6, 2.8, 4, 1).rotateY(Math.PI / 4).scale(1.05, 1, 1.2), C("roof1", "#4a4f5a"), M4(x, 6.4, 26)); }
  if (env.variant === "tvglow") {   // every house: the same blue TV flicker in the windows (the whole street is playing)
    for (let i = -4; i <= 4; i++) for (const [wx, wy] of [[-3.2, 3.6], [3.2, 3.6], [-3.2, 1.6]]) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0), glow([0.5, 1.4, 3.2])); m.position.set(i * 16 + wx * 0.95, wy, -5.98); m.layers.set(NOINK); root.add(m);
    }
    for (let i = -4; i <= 4; i += 2) info.lanterns.push(V(i * 16, 3.6, -5));
  }
  for (let x = -90; x <= 90; x += 30) { const lm = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), glow([3, 2.3, 1.2])); lm.position.set(x, 4.2, 8.4); root.add(lm); b.add(cyl(0.07, 0.09, 4.2, 8), C("streetLamp", "#2b2b38"), M4(x, 0, 8.4)); info.lanterns.push(V(x, 4.2, 8.4)); }
};

// ---------------- lake ----------------
export const buildLake = (root: THREE.Object3D, kit: Kit, env: EnvSpec, info: EnvInfo, b: Batch) => {
  const r = rng(env.seed || 29);
  b.add(ground(-400, 400, -400, 6, 160, 120, -0.01), lam("lakeGrass", () => ({ color: "#6fae4a" })));
  box(b, C("shore", "#c9b07c"), -400, -0.02, 5, 400, 0.0, 7);
  const water = new THREE.Mesh(ground(-900, 900, 6.5, 900, 1, 1, -0.15), new THREE.MeshLambertMaterial({ color: "#3f8fc0" })); water.receiveShadow = true; root.add(water);
  const deck = lam("planksHD", () => ({ map: planksHD() })), post = C("dockPost", "#5a3b2a");
  box(b, deck, 3, 0.15, 5, 5.2, 0.3, 22);
  for (let z = 7; z < 22; z += 3) for (const x of [3.1, 5.1]) b.add(cyl(0.12, 0.12, 1.4, 8), post, M4(x, -1.1, z));
  prop(b, kit, "canoe", 6.6, -0.35, 14, 0.7, 1.4);
  // log cabin with a porch
  const logs = C("logs", "#9a6a42"), roofM = C("cabinRoof", "#5a3b2a");
  box(b, logs, -9, 0, -10, -1, 3.2, -4);
  for (let y = 0.3; y < 3.2; y += 0.4) box(b, C("logLine", "#7a4f33"), -9.05, y, -4.05, -0.95, y + 0.06, -3.98);
  b.add(new THREE.CylinderGeometry(0.01, 6.4, 2.6, 4, 1).rotateY(Math.PI / 4).scale(1.05, 1, 0.75), roofM, M4(-5, 4.5, -7));
  box(b, C("cabinDoor", "#5a3b2a"), -5.6, 0, -3.99, -4.4, 2.1, -3.9);
  for (const x of [-7.6, -2.4]) { box(b, C("cabinWin", "#cfe6fa"), x - 0.6, 1.2, -3.99, x + 0.6, 2.1, -3.9); }
  box(b, deck, -9, 0.0, -4, -1, 0.25, -2.2);
  b.add(cyl(0.6, 0.5, 0.5, 12), C("firepit", "#6e665e"), M4(-1, 0, 0.5));
  for (let i = 0; i < 70; i++) { const a = r() * 6.28, d = 14 + r() * 70, x = Math.cos(a) * d, z = -Math.abs(Math.sin(a) * d) - 4; prop(b, kit, i % 4 ? "tree_cone" : "tree_default", x, 0, z, 7 + r() * 5, r() * 6); }
  const hill = new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  for (const [x, z, sx, sy, sz] of [[-220, 380, 260, 90, 120], [180, 420, 300, 110, 130], [0, -300, 280, 100, 120]] as const) b.add(hill, C("mountainG", "#5f8a4a"), MS(x, -2, z, sx, sy, sz));
  void info;
};

// ---------------- resort ----------------
export const buildResort = (root: THREE.Object3D, kit: Kit, env: EnvSpec, info: EnvInfo, b: Batch) => {
  const r = rng(env.seed || 31);
  box(b, lam("poolDeck", () => ({ map: tileTex("pd", "#f2e6cf", "#e2d2b4", 6) })), -60, -0.02, -40, 60, 0.0, 14);
  const sea = new THREE.Mesh(ground(-900, 900, 14, 900, 1, 1, -0.4), new THREE.MeshLambertMaterial({ color: "#2fb4c8" })); root.add(sea);
  // pool: sunk turquoise rectangle with a white coping
  const water = new THREE.Mesh(ground(-6, 6, 1, 9, 1, 1, -0.3), new THREE.MeshLambertMaterial({ color: "#3fd0e0" })); root.add(water);
  for (const [x0, z0, x1, z1] of [[-6.3, 0.7, 6.3, 1], [-6.3, 9, 6.3, 9.3], [-6.3, 1, -6, 9], [6, 1, 6.3, 9]]) box(b, C("coping", "#ffffff"), x0, -0.02, z0, x1, 0.08, z1);
  // loungers + umbrellas
  for (let k = 0; k < 5; k++) {
    const x = -8 + k * 4, z = -2.2;
    box(b, C("lounger", "#ffffff"), x - 0.4, 0.3, z - 1, x + 0.4, 0.4, z + 0.9); box(b, C("loungerBack", "#ffffff"), x - 0.4, 0.4, z - 1.05, x + 0.4, 1.0, z - 0.8);
    b.add(cyl(0.04, 0.04, 2.4, 6), C("umbPole", "#ffffff"), M4(x + 1.1, 0, z));
    b.add(new THREE.ConeGeometry(1.5, 0.6, 10, 1, true).translate(0, 2.6, 0), lam("umb" + (k % 2), () => ({ color: k % 2 ? "#ff7a59" : "#ffd23f", side: THREE.DoubleSide })), M4(x + 1.1, 0, z));
  }
  // thatched pool bar (left) with stools, the pink neon palm sign above it
  box(b, C("barCounter", "#8a5a34"), -14, 0, -8, -8, 1.1, -6.8); box(b, C("barTop", "#3a2a20"), -14.2, 1.1, -8.1, -7.8, 1.2, -6.6);
  for (const x of [-13.6, -8.4]) b.add(cyl(0.12, 0.12, 3.2), C("barPost", "#7a4f33"), M4(x, 0, -9));
  b.add(new THREE.ConeGeometry(4.6, 1.8, 10).translate(0, 4.0, 0), C("thatch", "#d9b85a"), M4(-11, 0, -8.6));
  for (let k = 0; k < 4; k++) { b.add(cyl(0.2, 0.2, 0.06, 12), C("stool", "#c8553d"), M4(-13 + k * 1.4, 0.75, -6.1)); b.add(cyl(0.04, 0.04, 0.75, 6), C("stoolPole", "#2b2b38"), M4(-13 + k * 1.4, 0, -6.1)); }
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), new THREE.MeshBasicMaterial({ map: neonTex("palm", "palm"), transparent: true, color: new THREE.Color(2.4, 2.4, 2.4), side: THREE.DoubleSide }));
  sign.position.set(-11, 6.4, -8.4); sign.layers.set(NOINK); root.add(sign);
  info.lanterns.push(V(-11, 6.4, -8.4));
  for (const [x, z, h, d] of [[9, -6, 8, 2.6], [13, -1, 7.5, 3.0], [-17, -3, 8.5, 0.4], [16, 10, 7, 2.2], [-15, 11, 7.8, 1.0], [3, -12, 9, 1.4], [-4, -14, 8.6, 2.0]] as const) palm(b, x, z, h, d);
  // hotel block behind
  box(b, C("hotelBlock", "#f2e6cf"), -40, 0, -48, 40, 26, -38);
  for (let y = 2; y < 25; y += 3.2) for (let x = -38; x < 38; x += 3.4) box(b, C("balcony", "#7fc4d9"), x, y, -38.01, x + 2.2, y + 1.6, -37.9);
  for (let i = 0; i < 12; i++) prop(b, kit, "plant_bushLarge", -30 + i * 5.4, 0, -34 + r() * 2, 1.6);
};
