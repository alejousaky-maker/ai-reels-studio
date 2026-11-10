// Megaproject locations in the same painted, ink-outlined look:
//   tunnel (subway tunnel under construction: concrete arch ribs, rails, work lamps, dust) / variant "station" (marble pillars,
//   white LED strips, tiled walls); warehouse (Hunts Point market: pallets, crates, neon, loading doors);
//   canal (concrete lock chamber with water, quays, jungle; "dig" = 1914 dirt trench, "dry" = cracked drought bed);
//   island (artificial island airport: runway, terminal with a glass roof, control tower, sea; "build" = rock fill + barges);
//   bridge (suspension bridge deck over a river toward a skyline). Ground level y = 0.
import * as THREE from "three";
import { Batch, prop, boxGeo, V, lam, Kit } from "../bridge/build";
import { rng, ctex, rep } from "../bridge/paint";
import { NOINK } from "../bridge/ink";
import type { EnvSpec } from "./types";
import { ground, EnvInfo } from "./env";
import { palm } from "./env3";

const M4 = (x: number, y: number, z: number, ry = 0) => new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), ry), V(1, 1, 1));
const MS = (x: number, y: number, z: number, sx: number, sy: number, sz: number) => new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion(), V(sx, sy, sz));
const cyl = (r0: number, r1: number, h: number, seg = 16) => new THREE.CylinderGeometry(r0, r1, h, seg).translate(0, h / 2, 0);
const glow = (c: [number, number, number]) => new THREE.MeshBasicMaterial({ color: new THREE.Color(...c) });
const C = (key: string, color: string) => lam(key, () => ({ color }));
const box = (b: Batch, m: THREE.Material, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) => b.add(boxGeo(V(x0, y0, z0), V(x1, y1, z1)), m);
const INKC = "rgba(36,23,38,0.95)";

// ---------------- painted textures ----------------
const concreteTex = (key: string, base: string, stain: string) => ctex("conc_" + key, 512, 512, (g, r) => {
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${r() < 0.5 ? "255,255,255" : "30,25,30"},${0.03 + r() * 0.05})`; g.beginPath(); g.ellipse(r() * 512, r() * 512, 6 + r() * 30, 3 + r() * 14, r() * 3, 0, 7); g.fill(); }
  g.fillStyle = stain; for (let i = 0; i < 9; i++) g.fillRect(r() * 512, 0, 6 + r() * 10, 120 + r() * 300);
  g.strokeStyle = "rgba(40,30,40,0.35)"; g.lineWidth = 4; for (let y = 0; y <= 512; y += 128) { g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke(); }
});
const marbleTex = () => ctex("marble", 512, 512, (g, r) => {
  g.fillStyle = "#f4f1ea"; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "rgba(150,140,130,0.35)"; g.lineWidth = 3;
  for (let i = 0; i < 14; i++) { g.beginPath(); let x = r() * 512, y = 0; g.moveTo(x, y); while (y < 512) { x += (r() - 0.5) * 60; y += 40 + r() * 40; g.lineTo(x, y); } g.stroke(); }
  g.strokeStyle = "rgba(60,50,60,0.3)"; g.lineWidth = 4; for (let k = 0; k <= 512; k += 256) { g.strokeRect(k, 0, 256, 512); }
});
const crackedTex = () => ctex("cracked", 512, 512, (g, r) => {
  g.fillStyle = "#c9a26a"; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "#7a5a34"; g.lineWidth = 5;
  for (let i = 0; i < 40; i++) { let x = r() * 512, y = r() * 512; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (r() - 0.5) * 120; y += (r() - 0.5) * 120; g.lineTo(x, y); } g.stroke(); }
});
const dirtTex = () => ctex("dirtTrench", 512, 512, (g, r) => {
  g.fillStyle = "#8a6a44"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 300; i++) { g.fillStyle = r() < 0.5 ? "#7a5a36" : "#9c7c52"; g.beginPath(); g.arc(r() * 512, r() * 512, 3 + r() * 9, 0, 7); g.fill(); }
});
const asphaltTex = (key: string, lines: boolean) => ctex("asph_" + key, 512, 512, (g, r) => {
  g.fillStyle = "#4a4d55"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(255,255,255,${r() * 0.05})`; g.fillRect(r() * 512, r() * 512, 3, 3); }
  if (lines) { g.fillStyle = "#f7f3ea"; for (let y = 0; y < 512; y += 128) g.fillRect(248, y, 16, 70); }
});
const skyline = (key: string, night: boolean) => ctex("sky5_" + key, 1024, 512, (g, r) => {
  const sky = g.createLinearGradient(0, 0, 0, 512);
  if (night) { sky.addColorStop(0, "#0e1434"); sky.addColorStop(1, "#2a2f66"); } else { sky.addColorStop(0, "#6fb0ea"); sky.addColorStop(1, "#e3f1fb"); }
  g.fillStyle = sky; g.fillRect(0, 0, 1024, 512);
  for (let layer = 0; layer < 2; layer++) { let x = -10; while (x < 1030) {
    const w = 40 + r() * 70, h = (layer ? 180 : 110) + r() * (layer ? 260 : 150), y = 512 - h;
    g.fillStyle = night ? (layer ? "#1c2150" : "#272d63") : (layer ? "#8fa3c4" : "#b7c6dc"); g.fillRect(x, y, w, h);
    if (r() < 0.25 && layer) { g.fillRect(x + w / 2 - 3, y - 40, 6, 40); }
    g.fillStyle = night ? "rgba(255,214,120,0.85)" : "rgba(255,255,255,0.5)";
    for (let wy = y + 12; wy < 500; wy += 22) for (let wx = x + 8; wx < x + w - 10; wx += 16) if (r() < (night ? 0.4 : 0.75)) g.fillRect(wx, wy, 7, 10);
    g.strokeStyle = INKC; g.lineWidth = 3; g.strokeRect(x, y, w, h); x += w + 5; } }
});
const backdrop = (root: THREE.Object3D, tex: THREE.Texture, x: number, y: number, z: number, w: number, h: number, ry = 0) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, color: 0xeeeeee, fog: false }));
  m.position.set(x, y, z); m.rotation.y = ry; m.layers.set(NOINK); root.add(m);
};
const sea = (root: THREE.Object3D, y: number, col = "#2f8fd0", x0 = -1500, x1 = 1500, z0 = -1500, z1 = 1500) => {
  const tex = ctex("seaWaves_" + col, 512, 512, (g, r) => {
    g.fillStyle = col; g.fillRect(0, 0, 512, 512);
    g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 6; g.lineCap = "round";
    for (let i = 0; i < 26; i++) { const x = r() * 512, yy = r() * 512; g.beginPath(); g.moveTo(x, yy); g.quadraticCurveTo(x + 18, yy - 10, x + 36, yy); g.stroke(); }
  });
  const m = new THREE.Mesh(ground(x0, x1, z0, z1, (x1 - x0) / 24, (z1 - z0) / 24, y), new THREE.MeshLambertMaterial({ map: rep(tex, 1, 1) }));
  m.receiveShadow = true; root.add(m);
};
const lamp = (root: THREE.Object3D, info: EnvInfo, x: number, y: number, z: number, c: [number, number, number] = [3.2, 2.6, 1.6], r = 0.14) => {
  const l = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), glow(c)); l.position.set(x, y, z); root.add(l); info.lanterns.push(V(x, y, z));
};

// ---------------- tunnel / station ----------------
export const buildTunnel = (root: THREE.Object3D, kit: Kit, env: EnvSpec, info: EnvInfo, b: Batch) => {
  if (env.variant === "station") {   // a gleaming new station: marble floor + pillars, white LED strips, tiled walls, platform edge
    const W = 9, D = 12, H = 5;
    b.add(ground(-W, W, -D, D + 6, 6, 8, 0.01), lam("stationFloor", () => ({ map: marbleTex() })));
    const tile = lam("stationWall", () => ({ map: ctex("stTile", 512, 512, (g) => { g.fillStyle = "#e9eef2"; g.fillRect(0, 0, 512, 512); g.strokeStyle = "#c2cad2"; g.lineWidth = 4; for (let k = 0; k <= 512; k += 32) { g.beginPath(); g.moveTo(0, k); g.lineTo(512, k); g.stroke(); g.beginPath(); g.moveTo(k, 0); g.lineTo(k, 512); g.stroke(); } g.fillStyle = "#00933c"; g.fillRect(0, 300, 512, 40); }) }));
    b.add(new THREE.PlaneGeometry(2 * W, H).translate(0, H / 2, -D), tile);
    for (const s of [-1, 1]) b.add(new THREE.PlaneGeometry(2 * D + 6, H).rotateY(-s * Math.PI / 2).translate(s * W, H / 2, 3 - 0), tile);
    // the ceiling is added straight to the scene (batched geometry crossing a lens' sight lines gets culled)
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(2 * W, 2 * D + 6).rotateX(Math.PI / 2).translate(0, H, 3), new THREE.MeshLambertMaterial({ color: "#d9dde3", side: THREE.DoubleSide }));
    root.add(ceil);
    for (const z of [-8, -3, 2, 7]) for (const x of [-4.5, 4.5]) { b.add(cyl(0.45, 0.45, H, 20), lam("pillar", () => ({ map: marbleTex() })), M4(x, 0, z)); b.add(cyl(0.6, 0.6, 0.3, 20), C("pillarCap", "#c9a227"), M4(x, H - 0.3, z)); }
    for (const x of [-6.5, -2, 2, 6.5]) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.06, 2 * D + 4), glow([3.4, 3.4, 3.6])); s.position.set(x, H - 0.05, 2); root.add(s); }
    box(b, C("platformEdge", "#ffd23f"), -W, 0.0, -D, -6.6, 0.03, D + 6);
    box(b, C("trackBed", "#3a3d47"), -W - 3, -1.2, -D, -W, 0, D + 6);
    const sign = ctex("stSign", 512, 128, (g) => { g.fillStyle = "#1d1b22"; g.fillRect(0, 0, 512, 128); g.fillStyle = "#ffffff"; g.font = "bold 64px Arial"; g.fillText("72 St", 40, 90); g.fillStyle = "#00933c"; g.beginPath(); g.arc(420, 64, 44, 0, 7); g.fill(); g.fillStyle = "#fff"; g.font = "bold 60px Arial"; g.fillText("Q", 398, 86); });
    const sm = new THREE.Mesh(new THREE.PlaneGeometry(4, 1), new THREE.MeshBasicMaterial({ map: sign })); sm.position.set(0, 3.3, -D + 0.05); sm.layers.set(NOINK); root.add(sm);
    for (const z of [-6, 0, 6]) lamp(root, info, 0, H - 0.4, z, [3.0, 3.0, 3.2], 0.2);
    void kit; return;
  }
  // tunnel under construction: concrete ribs every 2 m, curved walls, rails on sleepers, work lamps on cables, puddles
  const W = 4.2, D = 30, H = 5.4;
  b.add(ground(-W, W, -D, 12, 4, 20, 0.0), lam("tunnelFloor", () => ({ map: rep(concreteTex("floor", "#6e6a64", "rgba(40,30,20,0.12)"), 1, 1) })));
  const wall = lam("tunnelWall", () => ({ map: concreteTex("wall", "#8a857c", "rgba(60,40,20,0.18)") }));
  const arch = new THREE.CylinderGeometry(W, W, D + 12, 28, 1, true, -Math.PI / 2, Math.PI).rotateX(Math.PI / 2).rotateZ(0).translate(0, 1.2, -D / 2 + 6 - 6);
  arch.scale(1, 1.0, 1);
  const am = new THREE.Mesh(arch, new THREE.MeshLambertMaterial({ map: rep(concreteTex("arch", "#8a857c", "rgba(60,40,20,0.18)"), 6, 3), side: THREE.BackSide }));
  am.rotation.z = 0; am.position.set(0, 0, 0); am.receiveShadow = true; root.add(am);
  for (const s of [-1, 1]) b.add(new THREE.PlaneGeometry(D + 12, 1.3).rotateY(-s * Math.PI / 2).translate(s * W, 0.65, -D / 2), wall);
  for (let z = -D; z < 10; z += 2.2) {
    const rib = new THREE.TorusGeometry(W - 0.05, 0.16, 6, 24, Math.PI).rotateZ(0).translate(0, 1.2, z);
    b.add(rib, C("rib", "#5e5a54"));
  }
  for (const x of [-0.75, 0.75]) box(b, C("rail", "#9aa4ad"), x - 0.06, 0.02, -D, x + 0.06, 0.16, 10);
  for (let z = -D; z < 10; z += 0.9) box(b, C("sleeper", "#5a3b2a"), -1.2, 0.0, z, 1.2, 0.07, z + 0.3);
  for (let z = -D + 2; z < 10; z += 6) { lamp(root, info, (z % 12 ? -1 : 1) * (W - 0.9), 4.2, z, [3.6, 2.6, 1.2], 0.18); b.add(cyl(0.015, 0.015, 1.0, 4), C("cable", "#1d1b22"), M4((z % 12 ? -1 : 1) * (W - 0.9), 4.3, z)); }
  for (const [x, z] of [[-2.4, -4], [2.2, -12], [-1.8, -20]]) box(b, C("puddle", "#3f5a6e"), x - 0.8, 0.005, z - 0.5, x + 0.8, 0.012, z + 0.5);
  // work site props: barriers, rock rubble, a stack of drums, a TBM ring in the distance
  for (const [x, z] of [[2.8, 1], [-3.0, -6]]) { box(b, C("barrierW", "#ffffff"), x - 0.6, 0.3, z, x + 0.6, 0.6, z + 0.1); box(b, C("barrierR", "#e2453c"), x - 0.6, 0.6, z, x + 0.6, 0.9, z + 0.1); }
  for (let k = 0; k < 8; k++) b.add(new THREE.DodecahedronGeometry(0.25 + (k % 3) * 0.12, 0), C("rubble", "#7a756c"), M4(-3.2 + (k % 3) * 0.4, 0.15, -9 + k * 0.5));
  for (let k = 0; k < 3; k++) b.add(cyl(0.3, 0.3, 0.9, 12), C("drum" + k, ["#3f6fb5", "#ffd23f", "#e2453c"][k]), M4(3.2, 0, -16 + k * 0.7));
  const tbm = new THREE.Mesh(new THREE.CircleGeometry(W - 0.2, 28), new THREE.MeshLambertMaterial({ color: "#c9a227" })); tbm.position.set(0, 1.2, -D + 0.2); root.add(tbm);
  for (let k = 0; k < 8; k++) b.add(new THREE.BoxGeometry(0.2, W * 1.6, 0.1).rotateZ((k * Math.PI) / 8).translate(0, 1.2, -D + 0.3), C("tbmSpoke", "#7a6a2a"));
};

// ---------------- warehouse (Hunts Point) ----------------
export const buildWarehouse = (root: THREE.Object3D, kit: Kit, env: EnvSpec, info: EnvInfo, b: Batch) => {
  const W = 13, D = 11, H = 7.5, r = rng(env.seed || 33);
  b.add(ground(-W, W, -D, D + 6, 8, 8, 0.01), lam("whFloor", () => ({ map: rep(concreteTex("whf", "#9a958c", "rgba(255,200,0,0.0)"), 1, 1) })));
  for (let x = -W + 2; x < W; x += 4) box(b, C("laneLine", "#ffd23f"), x, 0.012, -D, x + 0.15, 0.02, D + 4);
  const wall = lam("whWall", () => ({ map: ctex("whWallT", 512, 256, (g) => { g.fillStyle = "#c9ccd2"; g.fillRect(0, 0, 512, 256); g.strokeStyle = "#a8adb5"; g.lineWidth = 6; for (let x = 0; x < 512; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 256); g.stroke(); } g.fillStyle = "#3f6fb5"; g.fillRect(0, 210, 512, 46); }) }));
  b.add(new THREE.PlaneGeometry(2 * W, H).translate(0, H / 2, -D), wall);
  for (const s of [-1, 1]) b.add(new THREE.PlaneGeometry(2 * D + 6, H).rotateY(-s * Math.PI / 2).translate(s * W, H / 2, 3), wall);
  for (let x = -9; x <= 9; x += 6) { box(b, C("dockDoor", "#5e6470"), x - 2, 0, -D + 0.02, x + 2, 4, -D + 0.1); for (let y = 0.4; y < 4; y += 0.4) box(b, C("dockSlat", "#4a4f5a"), x - 2, y, -D + 0.1, x + 2, y + 0.05, -D + 0.12); }
  for (let z = -D + 2; z < D; z += 4) { box(b, C("beam", "#3a3d47"), -W, H - 0.4, z, W, H - 0.2, z + 0.25); const l = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.4), glow([2.8, 2.8, 2.6])); l.position.set(0, H - 0.5, z); root.add(l); }
  // pallet racks with crates + produce down both sides
  const crateCols = ["#b8864e", "#a8784a", "#c8a06a"];
  for (const s of [-1, 1]) for (let z = -D + 1.5; z < D - 1; z += 2.4) for (let lvl = 0; lvl < 3; lvl++) {
    const x = s * (W - 1.6), y = lvl * 1.6;
    box(b, C("rackBeam", "#ff7a1a"), x - 1.0, y + 1.45, z - 1.0, x + 1.0, y + 1.55, z + 1.0);
    if (r() < 0.85) box(b, C("crate" + ((lvl + Math.round(z)) % 3), crateCols[(lvl + Math.round(z)) % 3]), x - 0.8, y, z - 0.8, x + 0.8, y + 1.2 + (r() < 0.3 ? 0 : 0), z + 0.8);
    if (r() < 0.4) b.add(new THREE.SphereGeometry(0.35, 10, 8), C("melon", "#3f8a3a"), M4(x, y + 1.25, z));
  }
  for (const s of [-1, 1]) for (let z = -D + 0.4; z < D; z += 2.4) b.add(cyl(0.06, 0.06, 4.8, 6), C("rackPost", "#3f6fb5"), M4(s * (W - 2.7), 0, z));
  const neon = ctex("huntsNeon", 1024, 256, (g) => { g.fillStyle = "#16151b"; g.fillRect(0, 0, 1024, 256); g.font = "bold 120px Arial Black, Arial"; g.textAlign = "center"; g.lineWidth = 22; g.strokeStyle = "rgba(57,217,138,0.5)"; g.strokeText("PRODUCE MARKET", 512, 170); g.lineWidth = 8; g.strokeStyle = "#c6ffe2"; g.strokeText("PRODUCE MARKET", 512, 170); });
  const nm = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.5), new THREE.MeshBasicMaterial({ map: neon, color: new THREE.Color(1.8, 1.8, 1.8) })); nm.position.set(0, 5.6, -D + 0.05); nm.layers.set(NOINK); root.add(nm);
  void kit; void info;
};

// ---------------- canal ----------------
export const buildCanal = (root: THREE.Object3D, kit: Kit, env: EnvSpec, info: EnvInfo, b: Batch) => {
  const r = rng(env.seed || 37), v = env.variant, dig = v === "dig", dry = v === "dry";
  const quay = lam("quay", () => ({ map: rep(concreteTex("quay", "#b8b2a6", "rgba(60,50,40,0.12)"), 1, 1) }));
  // quays on both sides of the channel, the jungle beyond
  b.add(ground(-400, -7.5, -400, 400, 160, 320, 0), dig ? lam("dirtQ", () => ({ map: dirtTex() })) : lam("jungleGround", () => ({ color: "#5f9a42" })));
  b.add(ground(7.5, 400, -400, 400, 160, 320, 0), dig ? lam("dirtQ", () => ({ map: dirtTex() })) : lam("jungleGround", () => ({ color: "#5f9a42" })));
  if (!dig) { b.add(ground(-14, -7.5, -400, 400, 3, 160, 0.01), quay); b.add(ground(7.5, 14, -400, 400, 3, 160, 0.01), quay); }
  // channel walls + floor
  const wallM = dig ? lam("dirtWall", () => ({ map: dirtTex() })) : lam("lockWall", () => ({ map: concreteTex("lock", "#a8a29a", "rgba(40,60,40,0.25)") }));
  for (const s of [-1, 1]) b.add(new THREE.PlaneGeometry(800, 8).rotateY(s * Math.PI / 2).translate(s * 7.5, -4, 0), wallM);
  b.add(ground(-7.5, 7.5, -400, 400, 4, 200, -8), dry ? lam("cracked", () => ({ map: crackedTex() })) : dig ? lam("dirtQ", () => ({ map: dirtTex() })) : C("canalBed", "#3a4a3a"));
  if (!dig && !dry) sea(root, -1.6, "#2f8fa8", -7.5, 7.5, -400, 400);
  if (dry) sea(root, -6.6, "#5a8a8a", -7.5, 7.5, -400, 400);
  if (!dig) {
    // lock gates across the channel, bollards, safety rails, the control house
    for (const z of [-60, 60]) { box(b, C("gate", "#5e6470"), -7.5, -8, z, 7.5, 0.6, z + 1.2); for (let x = -7; x < 7.5; x += 1) box(b, C("gateRib", "#4a4f5a"), x, -8, z + 1.2, x + 0.15, 0.6, z + 1.3); }
    for (const s of [-1, 1]) for (let z = -60; z < 60; z += 6) { b.add(cyl(0.18, 0.22, 0.6, 10), C("bollard", "#ffd23f"), M4(s * 8.1, 0, z)); box(b, C("railQ", "#ffffff"), s * 13.8 - 0.05, 0.9, z, s * 13.8 + 0.05, 1.0, z + 6); }
    box(b, C("ctrlHouse", "#f2efe8"), -24, 0, -30, -16, 6, -22); box(b, C("ctrlRoof", "#c8553d"), -24.5, 6, -30.5, -15.5, 6.6, -21.5);
    for (const x of [-22, -18]) box(b, C("ctrlWin", "#8fd0ff"), x, 3.5, -21.99, x + 1.6, 5, -21.9);
  } else {
    for (let k = 0; k < 10; k++) { const x = (k % 2 ? 1 : -1) * (9 + r() * 8), z = -20 + k * 5; b.add(cyl(0.05, 0.05, 2.2, 5), C("stake", "#7a5a34"), M4(x, 0, z)); }
    box(b, C("rails1914", "#5e5e5e"), -14, 0.02, -60, -13.8, 0.12, 60);
  }
  // jungle: palms + broadleaf trees + hills
  for (let i = 0; i < 160; i++) {
    const s = r() < 0.5 ? -1 : 1, x = s * (16 + r() * 120), z = -200 + r() * 400;
    if (r() < 0.45) palm(b, x, z, 6 + r() * 4, r() * 6); else prop(b, kit, r() < 0.5 ? "tree_fat" : "tree_oak", x, 0, z, 8 + r() * 6, r() * 6);
  }
  const hill = new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  for (const [x, z, sx, sy, sz] of [[-220, -260, 240, 70, 160], [240, -300, 260, 90, 160], [0, 320, 300, 60, 140]] as const) b.add(hill, C("jungleHill", "#3f7a36"), MS(x, -2, z, sx, sy, sz));
  void info;
};

// ---------------- island airport ----------------
export const buildIsland = (root: THREE.Object3D, kit: Kit, env: EnvSpec, info: EnvInfo, b: Batch) => {
  const build = env.variant === "build";
  sea(root, -0.6, "#2f8fd0");
  if (build) {   // reclamation site: a rough rock rim, barges, a crane
    b.add(new THREE.CylinderGeometry(30, 34, 1.2, 24).translate(0, -0.6, -10), C("fillRock", "#a8a29a"));
    for (let k = 0; k < 30; k++) { const a = (k / 30) * Math.PI * 2; b.add(new THREE.DodecahedronGeometry(1.2 + (k % 3) * 0.5, 0), C("rimRock", "#8e877e"), M4(31 * Math.cos(a), 0, -10 + 31 * Math.sin(a))); }
    for (const [x, z] of [[40, 10], [-45, 20], [10, 50]]) { box(b, C("barge", "#5e6470"), x - 6, -0.6, z - 2, x + 6, 0.6, z + 2); b.add(new THREE.ConeGeometry(2.2, 2, 6).translate(x, 1.4, z), C("bargeRocks", "#a8a29a")); }
    b.add(cyl(0.3, 0.3, 14, 8), C("crane", "#ffb020"), M4(-12, 0, -24)); box(b, C("craneArm", "#ffb020"), -12, 13.6, -24.3, 4, 14.2, -23.7);
    void kit; return;
  }
  // the island: rock rim, apron, runway with markings + edge lights, terminal with a long curved glass roof, tower
  b.add(new THREE.BoxGeometry(260, 2, 90).translate(0, -1, 5), lam("islandPave", () => ({ map: rep(asphaltTex("apron", false), 20, 8) })));
  for (let x = -128; x <= 128; x += 4) b.add(new THREE.DodecahedronGeometry(1.4, 0), C("seawallRock", "#9a958c"), M4(x, -0.6, 50.5));
  box(b, lam("runway", () => ({ map: rep(asphaltTex("rw", true), 1, 12) })), -125, 0.0, 14, 125, 0.03, 30);
  for (let x = -120; x < 120; x += 10) box(b, C("rwStripe", "#f7f3ea"), x, 0.035, 21.7, x + 5, 0.045, 22.3);
  for (let x = -120; x <= 120; x += 8) for (const z of [14.2, 29.8]) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), glow([3.2, 2.8, 1.4])); l.position.set(x, 0.12, z); root.add(l); }
  // terminal: a long low building whose roof is a curved glass wing
  box(b, C("termBase", "#e9ecef"), -60, 0, -34, 60, 6, -20);
  for (let x = -58; x < 60; x += 4) box(b, C("termGlass", "#8fd0ff"), x, 1, -20.01, x + 3.4, 5.4, -19.95);
  const roof = new THREE.CylinderGeometry(22, 22, 124, 32, 1, true, -0.9, 1.8).rotateZ(Math.PI / 2).translate(0, -12.5, -27);
  const rm = new THREE.Mesh(roof, new THREE.MeshLambertMaterial({ color: "#cfe6f2", side: THREE.DoubleSide, transparent: true, opacity: 0.88 })); rm.castShadow = true; root.add(rm);
  for (let x = -60; x <= 60; x += 6) b.add(new THREE.TorusGeometry(22, 0.12, 4, 24, 1.8).rotateY(Math.PI / 2).rotateX(0).translate(x, -12.5, -27), C("roofRib", "#5e6470"));
  b.add(cyl(1.2, 1.6, 22, 12), C("tower", "#f2efe8"), M4(70, 0, -26)); b.add(cyl(3.2, 2.6, 3, 12), C("towerCab", "#5a7bb0"), M4(70, 22, -26));
  for (const x of [-40, -20, 0, 20, 40]) { box(b, C("jetBridge", "#c9ccd2"), x - 1, 3, -20, x + 1, 5, -12); }
  for (const x of [-30, 10, 34]) { box(b, C("baggageCart", "#ffd23f"), x, 0, -6, x + 2.4, 1.1, -4.8); }
  for (const x of [-50, -10, 30]) lamp(root, info, x, 9, -10, [3.0, 2.6, 1.8], 0.25);
  // the mainland far away: hills + city
  const hill = new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  for (const [x, z, sx, sy, sz] of [[-260, -520, 260, 90, 120], [180, -560, 320, 120, 140], [500, -480, 200, 70, 100]] as const) b.add(hill, C("mainHill", "#5f8a4a"), MS(x, -2, z, sx, sy, sz));
  backdrop(root, skyline("osaka", false), 0, 30, -700, 1600, 160);
};

// ---------------- suspension bridge ----------------
export const buildBridge = (root: THREE.Object3D, kit: Kit, env: EnvSpec, info: EnvInfo, b: Batch) => {
  const night = env.variant === "night";
  sea(root, -30, "#3a6f9a");
  // deck: 4 lanes + walkways; towers with cables; railings
  box(b, lam("bridgeDeck", () => ({ map: rep(asphaltTex("deck", true), 2, 40) })), -9, -1.0, -260, 9, 0.0, 260);
  box(b, C("walkway", "#c9c4bc"), 5.6, 0.0, -260, 9, 0.15, 260); box(b, C("walkway", "#c9c4bc"), -9, 0.0, -260, -5.6, 0.15, 260);
  for (let x = -5.4; x <= 5.4; x += 3.6) for (let z = -250; z < 250; z += 10) box(b, C("laneDash", "#f7f3ea"), x - 0.08, 0.005, z, x + 0.08, 0.02, z + 4);
  for (const s of [-1, 1]) { box(b, C("railB", "#5e6470"), s * 9 - 0.1, 0.15, -260, s * 9 + 0.1, 1.2, 260); for (let z = -250; z < 250; z += 2) box(b, C("railPost", "#5e6470"), s * 9 - 0.05, 0.15, z, s * 9 + 0.05, 1.2, z + 0.1); }
  box(b, C("girder", "#7a8090"), -9.5, -4, -260, 9.5, -1, 260);
  for (const z of [-120, 120]) for (const s of [-1, 1]) {
    box(b, C("towerB", "#9aa4ad"), s * 9.8 - 1, -30, z - 1.4, s * 9.8 + 1, 60, z + 1.4);
    for (const y of [20, 45, 58]) box(b, C("towerBeam", "#8a94a0"), -10.8, y, z - 0.8, 10.8, y + 1.6, z + 0.8);
  }
  for (const s of [-1, 1]) {   // main cables (catenary) + suspenders
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k <= 60; k++) { const z = -260 + (k / 60) * 520, t = ((z + 120) % 240 + 240) % 240 / 240; const y = Math.abs(z) > 120 ? 60 - (Math.abs(z) - 120) * 0.45 : 8 + 52 * (2 * t - 1) ** 2; pts.push(V(s * 9.8, y, z)); }
    const curve = new THREE.CatmullRomCurve3(pts);
    b.add(new THREE.TubeGeometry(curve, 120, 0.35, 6), C("mainCable", "#e2453c"));
    for (let z = -116; z < 116; z += 6) { const t = (z + 120) / 240, y = 8 + 52 * (2 * t - 1) ** 2; b.add(cyl(0.05, 0.05, y, 4), C("suspender", "#c8323a"), M4(s * 9.8, 0, z)); }
  }
  // street lamps
  for (let z = -240; z < 240; z += 24) for (const s of [-1, 1]) { b.add(cyl(0.08, 0.08, 6, 6), C("lampPost", "#3a3d47"), M4(s * 8.6, 0, z)); lamp(root, info, s * 7.9, 6, z, night ? [3.6, 2.8, 1.4] : [2.4, 2.2, 1.6], 0.22); }
  backdrop(root, skyline("nyc", night), 0, 40, -600, 1400, 220);
  backdrop(root, skyline("nyc2", night), 0, 40, 600, 1400, 220, Math.PI);
  void kit;
};
