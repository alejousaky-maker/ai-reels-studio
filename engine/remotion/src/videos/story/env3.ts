// Five more original environments for history / myth shorts, built procedurally in the same painted, ink-outlined
// look (Lambert two-tone materials from the kit, Canvas2D textures, no third-party art beyond Kenney CC0 props):
// - beach:  sand, turquoise sea with painted wave crests, foam line, low-poly palms, rocks, jungle hills behind
// - ocean:  the deck of a sailing ship far out at sea (planks, rails, masts, square sails with a red cross, stern castle)
// - troy:   a sandy plain before a colossal city wall with towers and a timber gate; variant "breach" = a torn gap
//           with rubble; houses and a temple inside the walls
// - cave:   an open-topped rock chamber (ring of boulders with an overhang), fire pit, straw, a huge boulder sealing
//           the mouth (variant "open" = rolled aside); a grassy rocky hillside outside
// - throne: a stone throne room: red carpet, dais and golden throne, columns, red/green banners, open front
// Ground level y = 0.
import * as THREE from "three";
import { Batch, house, prop, boxGeo, V, lam, Kit } from "../bridge/build";
import { stoneHD, planksHD, beamHD, rng, ctex, rep } from "../bridge/paint";
import type { EnvSpec } from "./types";
import { ground, EnvInfo } from "./env";

const M4 = (x: number, y: number, z: number, ry = 0, s = 1) =>
  new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), ry), V(s, s, s));
const MS = (x: number, y: number, z: number, sx: number, sy: number, sz: number, ry = 0, rx = 0, rz = 0) =>
  new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, "YXZ")), V(sx, sy, sz));
const cyl = (r0: number, r1: number, h: number, seg = 16) => new THREE.CylinderGeometry(r0, r1, h, seg).translate(0, h / 2, 0);
const lampMat = () => new THREE.MeshBasicMaterial({ color: new THREE.Color(3.4, 2.2, 0.9) }); // > 1 = blooms

// ---------------- painted textures ----------------
const sandTex = () => ctex("sandHD", 1024, 1024, (g, r) => {
  g.fillStyle = "#ecd39a"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 2600; i++) { g.fillStyle = r() < 0.5 ? "rgba(255,248,220,0.35)" : "rgba(170,130,80,0.18)"; g.fillRect(r() * 1024, r() * 1024, 2 + r() * 5, 2 + r() * 3); }
  g.strokeStyle = "rgba(190,150,95,0.25)"; g.lineWidth = 4;
  for (let i = 0; i < 26; i++) { const y = r() * 1024, x = r() * 1024; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 60, y - 14, x + 130, y); g.stroke(); }
});
const seaTex = (key: string, deep: string, light: string) => ctex("sea_" + key, 1024, 1024, (g, r) => {
  g.fillStyle = deep; g.fillRect(0, 0, 1024, 1024);
  g.lineCap = "round";
  for (let i = 0; i < 140; i++) {
    const x = r() * 1024, y = r() * 1024, w = 30 + r() * 70;
    g.strokeStyle = light; g.lineWidth = 5 + r() * 4;
    g.beginPath(); g.moveTo(x - w / 2, y); g.quadraticCurveTo(x, y - w * 0.28, x + w / 2, y); g.stroke();
    g.strokeStyle = "rgba(20,40,80,0.18)"; g.lineWidth = 4;
    g.beginPath(); g.moveTo(x - w / 2, y + 8); g.quadraticCurveTo(x, y + 8 - w * 0.2, x + w / 2, y + 8); g.stroke();
  }
});
const leafTex = () => ctex("palmLeaf", 512, 128, (g) => {
  g.clearRect(0, 0, 512, 128);
  g.fillStyle = "#4f9a3e";
  g.beginPath(); g.moveTo(0, 64);
  for (let i = 0; i <= 16; i++) { const x = i * 32, w = 56 * Math.sin((Math.PI * i) / 16) + 4; g.lineTo(x, 64 - w + (i % 2) * 14); }
  for (let i = 16; i >= 0; i--) { const x = i * 32, w = 56 * Math.sin((Math.PI * i) / 16) + 4; g.lineTo(x, 64 + w - (i % 2) * 14); }
  g.closePath(); g.fill();
  g.strokeStyle = "#2f6a2a"; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 64); g.lineTo(512, 64); g.stroke();
  g.strokeStyle = "rgba(36,23,38,0.9)"; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 64);
  for (let i = 0; i <= 16; i++) { const x = i * 32, w = 56 * Math.sin((Math.PI * i) / 16) + 4; g.lineTo(x, 64 - w + (i % 2) * 14); }
  for (let i = 16; i >= 0; i--) { const x = i * 32, w = 56 * Math.sin((Math.PI * i) / 16) + 4; g.lineTo(x, 64 + w - (i % 2) * 14); }
  g.closePath(); g.stroke();
});
const sailTex = (cross: boolean) => ctex("sail_" + (cross ? "x" : "s"), 512, 512, (g) => {
  g.fillStyle = "#f6efdc"; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "rgba(150,130,100,0.35)"; g.lineWidth = 4;
  for (let x = 64; x < 512; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke(); }
  if (cross) { g.fillStyle = "#c8323a"; g.fillRect(216, 60, 80, 392); g.fillRect(80, 196, 352, 80); }
  else for (let i = 0; i < 4; i++) { g.fillStyle = "#c8553d"; g.fillRect(0, 90 + i * 100, 512, 34); }
  g.strokeStyle = "rgba(36,23,38,0.9)"; g.lineWidth = 12; g.strokeRect(6, 6, 500, 500);
});
const carpetTex = () => ctex("redCarpet", 256, 1024, (g) => {
  g.fillStyle = "#b8283a"; g.fillRect(0, 0, 256, 1024);
  g.fillStyle = "#e8b83a"; g.fillRect(14, 0, 16, 1024); g.fillRect(226, 0, 16, 1024);
  for (let y = 60; y < 1024; y += 160) { g.beginPath(); g.moveTo(128, y); g.lineTo(158, y + 40); g.lineTo(128, y + 80); g.lineTo(98, y + 40); g.closePath(); g.fill(); }
});
const gateTex = () => ctex("gateTex", 512, 512, (g) => {
  g.fillStyle = "#8a5a34"; g.fillRect(0, 0, 512, 512);
  for (let x = 0; x < 512; x += 64) { g.fillStyle = x % 128 ? "#7a4e2c" : "#94633b"; g.fillRect(x, 0, 60, 512); g.fillStyle = "rgba(36,23,38,0.8)"; g.fillRect(x + 60, 0, 4, 512); }
  g.fillStyle = "#3a3d47"; for (const y of [90, 400]) g.fillRect(0, y, 512, 28);
  for (const y of [104, 414]) for (let x = 32; x < 512; x += 64) { g.beginPath(); g.arc(x, y, 8, 0, 7); g.fillStyle = "#c9ccd2"; g.fill(); }
  g.fillStyle = "rgba(36,23,38,0.9)"; g.fillRect(253, 0, 6, 512);
});

/** a smooth lumpy rock (low sphere + seeded bumps; shared vertices so the shading stays soft, cartoon-like) */
/** craggy rock face: warm grey-brown blotches, darker crevices, a few light ledges (not masonry) */
const rockTex = () => ctex("rockFace", 1024, 512, (g, r) => {
  g.fillStyle = "#857a6c"; g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 140; i++) { g.fillStyle = ["#7a6f62", "#91867a", "#6e6458", "#9a8f80"][i % 4]; g.beginPath(); g.ellipse(r() * 1024, r() * 512, 30 + r() * 90, 14 + r() * 40, r() * 3, 0, 7); g.fill(); }
  g.strokeStyle = "rgba(40,30,30,0.55)"; g.lineCap = "round";
  for (let i = 0; i < 46; i++) {
    let x = r() * 1024, y = r() * 512; g.lineWidth = 2 + r() * 4; g.beginPath(); g.moveTo(x, y);
    for (let k = 0; k < 5; k++) { x += (r() - 0.5) * 70; y += 15 + r() * 30; g.lineTo(x, y); }
    g.stroke();
  }
  g.strokeStyle = "rgba(255,240,220,0.25)"; g.lineWidth = 5;
  for (let i = 0; i < 24; i++) { const x = r() * 1024, y = r() * 512; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 40 + r() * 80, y + (r() - 0.5) * 10); g.stroke(); }
});
const rockGeo = (seed: number) => {
  const g = new THREE.SphereGeometry(1, 12, 9), pos = g.attributes.position, a = rng(seed)(), b2 = rng(seed + 7)() * 6;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const k = 1 + 0.12 * Math.sin(x * 3.1 + b2) * Math.cos(z * 2.7 + a * 6) + 0.08 * Math.sin(y * 4 + a * 9);
    pos.setXYZ(i, x * k, y * k * 0.85, z * k);
  }
  g.computeVertexNormals();
  return g;
};
const rockM = (key: string, col: string) => lam("rock_" + key, () => ({ color: col }));

/** a curved low-poly palm: segmented trunk leaning `lean` toward `dir`, a crown of drooping leaves, coconuts */
export const palm = (b: Batch, x: number, z: number, h: number, dir: number, lean = 0.22) => {
  const bark = lam("palmBark", () => ({ color: "#a07246" })), ring = lam("palmRing", () => ({ color: "#7d5634" }));
  const leaf = lam("palmLeafM", () => ({ map: leafTex(), side: THREE.DoubleSide, alphaTest: 0.5 }));
  const n = 7, dx = Math.cos(dir), dz = Math.sin(dir);
  let px = x, py = 0, pz = z;
  for (let i = 0; i < n; i++) {
    const t = (i + 1) / n, seg = h / n, off = lean * h * t * t;
    const nx = x + dx * off, nz = z + dz * off, ny = py + seg;
    const len = Math.hypot(nx - px, seg, nz - pz), mid = V((px + nx) / 2, (py + ny) / 2, (pz + nz) / 2);
    const g = new THREE.CylinderGeometry(0.2 - 0.07 * t, 0.24 - 0.07 * t, len, 8);
    const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), V(nx - px, seg, nz - pz).normalize());
    b.add(g, i % 2 ? bark : ring, new THREE.Matrix4().compose(mid, q, V(1, 1, 1)));
    px = nx; py = ny; pz = nz;
  }
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + 0.3, L = 3.1 + (k % 3) * 0.35;
    const g = new THREE.PlaneGeometry(L, 0.8, 4, 1);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const u = (p.getX(i) + L / 2) / L; p.setX(i, u * L); p.setZ(i, -1.3 * u * u); }  // droop
    g.rotateX(-Math.PI / 2); g.computeVertexNormals();
    b.add(g, leaf, new THREE.Matrix4().compose(V(px, py, pz), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -a, -0.25)), V(1, 1, 1)));
  }
  const nut = lam("coconut", () => ({ color: "#6b4a2a" }));
  for (let k = 0; k < 3; k++) b.add(new THREE.SphereGeometry(0.17, 10, 8), nut, M4(px + 0.22 * Math.cos(k * 2.1), py - 0.25, pz + 0.22 * Math.sin(k * 2.1)));
};

const seaPlane = (root: THREE.Object3D, z0: number, y: number, key = "turq", deep = "#2fa4c8", light = "rgba(220,250,255,0.65)") => {
  const t = rep(seaTex(key, deep, light), 90, 70);
  const m = new THREE.Mesh(ground(-900, 900, z0, 1400, 1, 1, y), new THREE.MeshLambertMaterial({ map: t }));
  m.receiveShadow = true; root.add(m);
};

// ---------------- beach ----------------
export const buildBeach = (root: THREE.Object3D, kit: Kit, env: EnvSpec, info: EnvInfo, b: Batch) => {
  const r = rng(env.seed || 11);
  const sand = lam("sandM", () => ({ map: rep(sandTex(), 1, 1) }));
  b.add(ground(-400, 400, -400, 9, 160, 160, 0.0), sand);
  b.add(ground(-400, 400, 7.5, 9.6, 160, 1, -0.02), lam("wetSand", () => ({ color: "#d2b47a" })));
  seaPlane(root, 8.8, -0.12);
  // foam line
  const foam = lam("foam", () => ({ color: "#f7fbff" }));
  for (let x = -120; x < 120; x += 3.2) b.add(boxGeo(V(x, -0.1, 8.7 + 0.25 * Math.sin(x * 0.7)), V(x + 2.6, -0.04, 9.05 + 0.25 * Math.sin(x * 0.7))), foam);
  // palms: a few framing the beach + a jungle line behind
  const spots: [number, number, number, number][] = [[-9, -5, 7.5, 0.4], [-14, -1, 8.5, 0.2], [12, -7, 8, 2.8], [17, -2, 7, 3.1], [6.5, -13, 9, 1.2],
    [-6, -15, 8.2, 2], [5.6, 3.6, 7.2, 1.0], [-20, -9, 9, 0.6], [22, -12, 8.6, 2.6]];
  for (const [x, z, h, d] of spots) palm(b, x, z, h, d);
  for (let i = 0; i < 26; i++) { const x = -60 + i * 4.8 + r() * 2, z = -24 - r() * 10; palm(b, x, z, 8 + r() * 4, r() * 6.28, 0.12); }
  for (let i = 0; i < 30; i++) prop(b, kit, ["plant_bushLarge", "plant_bushDetailed", "tree_fat"][i % 3], -70 + i * 4.7, 0, -30 - r() * 14, 2.5 + r() * 3, r() * 6);
  const rock = rockM("beach", "#9d958a");
  for (let i = 0; i < 9; i++) { const x = (r() - 0.5) * 50, z = 2 + r() * 6; if (Math.abs(x) < 6) continue; b.add(rockGeo(i + 3), rock, MS(x, 0.2, z, 0.7 + r(), 0.5 + r() * 0.5, 0.7 + r(), r() * 6)); }
  // jungle hills and a far island across the water
  const hill = new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2);
  for (const [x, z, sx, sy, sz] of [[-160, -220, 200, 60, 90], [120, -260, 240, 80, 110], [-20, -320, 260, 90, 120]] as const)
    b.add(hill, lam("jungleHill", () => ({ color: "#4f9a3e" })), MS(x, -2, z, sx, sy, sz));
  b.add(hill, lam("islandHill", () => ({ color: "#6aa24e" })), MS(140, -1, 330, 90, 24, 40));
  b.add(hill, lam("islandSand", () => ({ color: "#e6cf98" })), MS(140, -1.6, 330, 104, 6, 50));
  void info;
};

// ---------------- ocean (ship deck) ----------------
export const buildOcean = (root: THREE.Object3D, kit: Kit, env: EnvSpec, info: EnvInfo, b: Batch) => {
  const r = rng(env.seed || 13);
  seaPlane(root, -1400, -2.4, "deep", "#1f78b0", "rgba(210,240,255,0.6)");
  const deck = lam("planksHD", () => ({ map: planksHD() })), hullM = lam("hullWood", () => ({ map: rep(beamHD(), 3, 1) })), dark = lam("shipDark", () => ({ color: "#5a3b2a" }));
  const X = 3.4, Z0 = -13, Z1 = 12;
  b.add(ground(-X, X, Z0, Z1, 2, 8, 0.0), deck);
  for (const s of [-1, 1]) {
    b.add(boxGeo(V(s < 0 ? -X - 0.3 : X, -2.6, Z0), V(s < 0 ? -X : X + 0.3, 0.95, Z1)), hullM);       // bulwarks
    b.add(boxGeo(V(s < 0 ? -X - 0.4 : X - 0.05, 0.95, Z0), V(s < 0 ? -X + 0.05 : X + 0.4, 1.1, Z1)), dark);  // rail cap
  }
  b.add(boxGeo(V(-X, -2.6, Z0 - 0.3), V(X, 1.4, Z0)), hullM);                                           // bow wall
  // bow narrows: two angled planks + a bowsprit
  b.add(cyl(0.12, 0.12, 9), dark, MS(0, 1.2, Z0 - 0.2, 1, 1, 1, 0, -1.2));
  // stern castle (raised deck) with railing
  b.add(boxGeo(V(-X, 0, 9), V(X, 1.7, Z1)), hullM);
  b.add(ground(-X, X, 9, Z1, 2, 1, 1.71), deck);
  for (let x = -X; x <= X + 0.01; x += 0.8) b.add(cyl(0.05, 0.05, 0.8, 6), dark, M4(x, 1.7, 9.05));
  b.add(boxGeo(V(-X, 2.45, 8.95), V(X, 2.55, 9.15)), dark);
  // masts, yards and square sails (red cross)
  const sail = lam("sailCross", () => ({ map: sailTex(true), side: THREE.DoubleSide }));
  const mastM = lam("mast", () => ({ color: "#8a5a34" }));
  for (const [mz, h, sw, sh0, sh1] of [[-1.5, 17, 7.5, 4.0, 12.5], [-9, 12, 5, 3.2, 8.8], [7, 11, 3.6, 3.8, 8.4]] as const) {
    b.add(cyl(0.22, 0.28, h), mastM, M4(0, 0, mz));
    b.add(cyl(0.09, 0.09, sw + 0.8), mastM, MS(-(sw + 0.8) / 2, sh1 + 0.15, mz, 1, 1, 1, 0, 0, -Math.PI / 2));
    // billowing sail: a curved quad facing the bow
    const g = new THREE.PlaneGeometry(sw, sh1 - sh0, 8, 6), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const u = p.getX(i) / (sw / 2), v = p.getY(i) / ((sh1 - sh0) / 2); p.setZ(i, -0.9 * (1 - u * u) * (1 - 0.3 * v * v)); }
    g.computeVertexNormals();
    b.add(g, sail, M4(0, (sh0 + sh1) / 2, mz - 0.35));
    b.add(cyl(0.3, 0.25, 0.5, 10), dark, M4(0, h, mz));                                              // crow's nest
  }
  // rigging lines from the rails to the masts
  const rope = lam("rope", () => ({ color: "#3a2f2a" }));
  for (const s of [-1, 1]) for (const z of [-4, -2.5, 0.5]) {
    const a = V(s * X, 1.0, z), c = V(0, 14, -1.5), d = c.clone().sub(a), len = d.length();
    b.add(new THREE.CylinderGeometry(0.03, 0.03, len, 4), rope, new THREE.Matrix4().compose(a.clone().add(c).multiplyScalar(0.5), new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.normalize()), V(1, 1, 1)));
  }
  // deck clutter at the sides: barrels, crates, coiled rope
  const barrel = lam("barrel", () => ({ color: "#8a5a3c" })), crate = lam("crate", () => ({ map: rep(beamHD(), 1, 1) }));
  for (const [x, z] of [[-2.6, -6], [2.6, -5.2], [-2.7, 4.5], [2.5, 6.5], [-2.6, -11]]) b.add(cyl(0.34, 0.3, 0.95, 14), barrel, M4(x, 0, z));
  for (const [x, z] of [[2.5, -10], [-2.5, 7.2]]) b.add(boxGeo(V(x - 0.4, 0, z - 0.4), V(x + 0.4, 0.8, z + 0.4)), crate);
  b.add(new THREE.TorusGeometry(0.35, 0.1, 6, 16).rotateX(Math.PI / 2), rope, M4(2.4, 0.1, 2.2));
  for (const z of [-7.5, 3.5]) { prop(b, kit, "lantern", -2.9, 0, z, 2.4); info.lanterns.push(V(-2.9, 2.2, z)); }
  // a far island on the horizon
  const hill = new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  b.add(hill, lam("islandHill", () => ({ color: "#6aa24e" })), MS(-260, -2.4, -520, 120, 26, 50));
  void info; void r;
};

// ---------------- troy ----------------
export const buildTroy = (root: THREE.Object3D, kit: Kit, env: EnvSpec, info: EnvInfo, b: Batch) => {
  const r = rng(env.seed || 17), breach = env.variant === "breach";
  const sand = lam("plainSand", () => ({ map: rep(sandTex(), 1, 1), color: "#f0ddb0" }));
  b.add(ground(-500, 500, -20, 500, 200, 200, 0.0), sand);
  b.add(ground(-500, 500, -500, -20, 200, 200, 0.0), lam("cityDirt", () => ({ map: rep(sandTex(), 1, 1), color: "#d9c69a" })));
  const wallM = lam("troyWall", () => ({ map: rep(stoneHD("troyWallHD", ["#e0c9a0", "#d6be92", "#e8d4ae", "#cdb489"], "#a8916a"), 1, 1) }));
  const capM = lam("troyCap", () => ({ color: "#c7ae82" }));
  const WZ0 = -24, WZ1 = -20, WH = 13, GAP: [number, number] = [9, 21];
  const inGap = (x0: number, x1: number) => breach && x1 > GAP[0] && x0 < GAP[1];
  const seg = (x0: number, x1: number, h: number) => {
    if (x1 <= x0) return;
    b.add(boxGeo(V(x0, 0, WZ0), V(x1, h, WZ1), 4), wallM);
    for (let x = x0 + 0.4; x + 1.2 <= x1; x += 2.4) b.add(boxGeo(V(x, h, WZ1 - 1.0), V(x + 1.2, h + 1.3, WZ1 + 0.05)), capM);   // merlons
    b.add(boxGeo(V(x0, h - 0.4, WZ1), V(x1, h, WZ1 + 0.3)), capM);
  };
  // wall runs with towers every 32 m, the gate between two towers at x = 0
  const cuts = [-140, -100, -68, -36, -7, 7, 36, 68, 100, 140];
  for (let i = 0; i + 1 < cuts.length; i++) {
    const x0 = cuts[i] + 3.5, x1 = cuts[i + 1] - 3.5;
    if (cuts[i] === -7) continue;                           // the gate span
    if (breach && x1 > GAP[0] && x0 < GAP[1]) { seg(x0, GAP[0], WH); seg(GAP[1], x1, WH); }
    else seg(x0, x1, WH);
  }
  for (const tx of cuts) {
    if (inGap(tx - 3.5, tx + 3.5)) continue;
    b.add(boxGeo(V(tx - 3.5, 0, WZ0 - 1), V(tx + 3.5, WH + 5, WZ1 + 1.5), 4), wallM);
    for (const [dx, dz] of [[-3, 0], [-1, 0], [1, 0], [3, 0]]) b.add(boxGeo(V(tx + dx - 0.6, WH + 5, WZ1 + 0.6 + dz), V(tx + dx + 0.6, WH + 6.3, WZ1 + 1.5 + dz)), capM);
    b.add(boxGeo(V(tx - 3.8, WH + 4.6, WZ0 - 1.2), V(tx + 3.8, WH + 5.0, WZ1 + 1.8)), capM);
  }
  // gate: lintel over a timber double door
  b.add(boxGeo(V(-3.5, 8.5, WZ0), V(3.5, WH, WZ1), 4), wallM);
  b.add(boxGeo(V(-3.5, 0, WZ0 + 1.6), V(3.5, 8.5, WZ0 + 2.0)), lam("gateWood", () => ({ map: gateTex() })));
  b.add(boxGeo(V(-3.9, 8.3, WZ1 - 0.2), V(3.9, 8.9, WZ1 + 0.4)), capM);
  if (breach) {   // rubble spilling out of the gap on both sides
    const rubble = rockM("rubble", "#d6be92");
    for (let i = 0; i < 26; i++) { const x = GAP[0] + r() * (GAP[1] - GAP[0]), z = WZ0 - 3 + r() * 9; if (Math.abs(x - 15) < 2.6 && z > WZ0 - 2) continue; b.add(rockGeo(40 + i), rubble, MS(x, 0.25, z, 0.5 + r() * 0.9, 0.35 + r() * 0.5, 0.5 + r() * 0.8, r() * 6)); }
  }
  // inside the walls: houses (tall enough to peek over the wall from the plain) and a temple
  for (let i = 0; i < 26; i++) { const x = -90 + i * 7.3 + r() * 2, z = -34 - r() * 26; if (breach && Math.abs(x - 15) < 7 && z > -42) continue; house(b, x, z, 0, 6.5, 7, 8.4 + r() * 6, Math.floor(r() * 8), 0); }
  const marble = lam("marble", () => ({ color: "#f2ece0" }));
  b.add(boxGeo(V(-12, 0, -78), V(12, 16, -62)), marble);
  for (let x = -11; x <= 11; x += 2.75) b.add(cyl(0.6, 0.7, 14), marble, M4(x, 16, -61));
  b.add(new THREE.CylinderGeometry(0, 15, 6, 4, 1).rotateY(Math.PI / 4).scale(1, 1, 0.6), lam("roofTerra", () => ({ color: "#c8553d" })), M4(0, 33, -68));
  for (const [x, z] of [[-6, -30], [6, -30], [22, -32], [-22, -32]]) { prop(b, kit, "lantern", x, 0, z, 2.8); info.lanterns.push(V(x, 2.55, z)); }
  // outside: dunes, scrub, the sea far behind the plain
  const hill = new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  for (let i = 0; i < 10; i++) b.add(hill, lam("dune", () => ({ color: "#e6cf98" })), MS(-160 + i * 36 + r() * 10, -1, 70 + r() * 40, 20 + r() * 12, 3 + r() * 3, 12));
  for (let i = 0; i < 24; i++) prop(b, kit, "plant_bush", -70 + r() * 140, 0, -10 + r() * 60, 0.8 + r() * 0.6, r() * 6);
  seaPlane(root, 140, -0.3, "aegean", "#2f8fc4", "rgba(220,245,255,0.6)");
  for (const [x, z, sx, sy, sz] of [[-300, -260, 220, 60, 100], [260, -300, 260, 70, 110]] as const) b.add(hill, lam("hillB", () => ({ color: "#9cae6a" })), MS(x, -2, z, sx, sy, sz));
};

// ---------------- cave ----------------
export const buildCave = (root: THREE.Object3D, kit: Kit, env: EnvSpec, info: EnvInfo, b: Batch) => {
  const r = rng(env.seed || 19), open = env.variant === "open";
  const R = 9, ENT = 2.6;                                    // chamber radius; entrance half-width at +z
  const floor = lam("caveFloor", () => ({ color: "#8a7258" }));
  b.add(ground(-R - 1, R + 1, -R - 1, R + 1, 4, 4, 0.01), floor);
  b.add(ground(-400, 400, -400, 400, 160, 160, -0.01), lam("hillGrass", () => ({ color: "#6f9a4a" })));
  const rockC = rockM("caveC", "#7d746a");
  const rocks = [rockM("caveA", "#857b70"), rockM("caveB", "#766d63"), rockC];
  const wallM = lam("caveWall", () => ({ map: rep(rockTex(), 4, 2) }));
  // chamber wall: one continuous craggy surface (an open cylinder that leans inward toward the top = overhang),
  // facing inward, with a gap for the mouth at +z; an outward-facing twin so the hill reads solid from outside
  const gap = Math.asin((ENT + 0.6) / R), H = 7.5;
  const shell = (rad: number, inward: boolean) => {
    const g = new THREE.CylinderGeometry(rad - 2.4, rad, H, 48, 6, true, gap, Math.PI * 2 - 2 * gap).translate(0, H / 2, 0);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), th = Math.atan2(x, z);
      const n = 0.4 * Math.sin(th * 6 + y * 0.6) + 0.18 * Math.sin(th * 11 - y * 0.9) + 0.15 * Math.sin(y * 1.4 + th * 3);
      const k = 1 + (inward ? 1 : -1) * 0 + n / rad;
      p.setX(i, x * k); p.setZ(i, z * k);
    }
    let ng = g.toNonIndexed();
    if (inward) {   // flip the triangles so the inside faces the chamber
      const P = ng.attributes.position, U = ng.attributes.uv;
      for (let i = 0; i < P.count; i += 3) for (const A of [P, U]) {
        const t = [A.getX(i + 1), A.getY(i + 1), A.itemSize > 2 ? A.getZ(i + 1) : 0];
        A.setXY(i + 1, A.getX(i + 2), A.getY(i + 2)); if (A.itemSize > 2) A.setZ(i + 1, A.getZ(i + 2));
        A.setXY(i + 2, t[0], t[1]); if (A.itemSize > 2) A.setZ(i + 2, t[2]);
      }
    }
    ng.deleteAttribute("normal"); ng.computeVertexNormals();
    b.add(ng, wallM);
    ng = null as unknown as THREE.BufferGeometry;
  };
  shell(R, true);
  shell(R + 0.9, false);
  // the mouth: two jamb rocks and a lintel slab
  for (const s of [-1, 1]) b.add(rockGeo(500 + s), rockC, MS(s * (ENT + 0.9), 2.2, R + 0.3, 1.1, 2.4, 1.2, s * 0.3));
  b.add(rockGeo(503), rockC, MS(0, 5.1, R + 0.1, ENT + 1.8, 0.9, 1.3));
  // a few boulders along the base inside
  for (let i = 0; i < 9; i++) { const a = gap + 0.3 + i * 0.62, d = R - 1.1; b.add(rockGeo(520 + i), rocks[i % 3], MS(Math.sin(a) * d, 0.35, Math.cos(a) * d, 0.8 + r() * 0.6, 0.6 + r() * 0.4, 0.8 + r() * 0.5, a)); }
  // outside: the chamber sits in a rocky hill
  const hill = new THREE.SphereGeometry(1, 30, 14, 0, Math.PI * 2, 0, Math.PI / 2);
  b.add(hill, lam("caveHill", () => ({ color: "#6a7a4a" })), MS(0, -1, -17, 20, 15, 8));   // the hill rises behind the chamber (never encloses the lens)
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, d = 13 + r() * 5, x = Math.sin(a) * d, z = Math.cos(a) * d - 3; if (z > 2 && Math.abs(x) < 12) continue; b.add(rockGeo(200 + i), rocks[i % 3], MS(x, 0.4, z, 1 + r() * 1.4, 0.8 + r(), 1 + r())); }
  for (let i = 0; i < 30; i++) { const a = r() * 6.28, d = 20 + r() * 50; prop(b, kit, ["plant_bush", "tree_cone", "plant_bushLarge"][i % 3], Math.sin(a) * d, 0, Math.cos(a) * d, i % 3 === 1 ? 6 + r() * 3 : 1.2 + r(), r() * 6); }
  for (const [x, z, sx, sy, sz] of [[-200, -260, 220, 90, 110], [220, -240, 200, 110, 100], [0, -380, 300, 130, 130]] as const) b.add(hill, lam("mountain", () => ({ color: "#7a8a5a" })), MS(x, -2, z, sx, sy, sz));
  // the boulder sealing the mouth (rolled aside when open)
  const bx = open ? ENT + 3.2 : 0, bz = open ? R + 2.2 : R + 0.2;
  b.add(rockGeo(777), lam("boulder", () => ({ color: "#8a8178", flatShading: true })), MS(bx, 2.1, bz, 2.6, 2.3, 2.0, 0.3));
  // fire pit: ring of stones, logs, emissive flames and a glow
  const fx = 2.6, fz = -3.2;
  for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; b.add(rockGeo(300 + i), rockC, MS(fx + Math.cos(a) * 0.9, 0.15, fz + Math.sin(a) * 0.9, 0.3, 0.22, 0.3)); }
  for (let i = 0; i < 3; i++) b.add(cyl(0.1, 0.1, 1.4, 6), lam("log", () => ({ color: "#5a3b2a" })), MS(fx, 0.25, fz, 1, 1, 1, i * 1.05, 0, Math.PI / 2 - 0.25));
  for (const [dx, dz, h] of [[0, 0, 1.1], [0.25, 0.15, 0.7], [-0.22, -0.1, 0.8]]) {
    const fl = new THREE.Mesh(new THREE.ConeGeometry(0.32, h, 8).translate(0, h / 2, 0), lampMat()); fl.position.set(fx + dx, 0.2, fz + dz); root.add(fl);
  }
  info.lanterns.push(V(fx, 1.3, fz));
  // straw, a wine jar, bones-free (cartoon): baskets and pens
  const straw = lam("straw", () => ({ color: "#d9b85a" }));
  for (const [x, z] of [[-5, -4], [-6, 1], [5.5, 2.5]]) b.add(new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), straw, MS(x, 0, z, 1.6, 0.5, 1.2));
  const jar = lam("jar", () => ({ color: "#c8703e" }));
  for (const [x, z] of [[-3.8, -6.2], [-3.1, -6.6]]) b.add(new THREE.SphereGeometry(0.45, 12, 8), jar, MS(x, 0.45, z, 1, 1.3, 1));
};

// ---------------- throne room ----------------
export const buildThrone = (root: THREE.Object3D, kit: Kit, env: EnvSpec, info: EnvInfo, b: Batch) => {
  const W = 8, D = 7, H = 6.5;
  const wall = lam("throneWall", () => ({ map: rep(stoneHD("throneWallHD", ["#e6d6bb", "#dccaa9", "#ecdfc7", "#d4c19f"], "#ab9877"), 1, 1) }));
  b.add(ground(-W, W, -D, D + 4, 4, 4, 0.01), lam("throneFloor", () => ({ map: rep(stoneHD("throneFloorHD", ["#cfc3b2", "#c4b6a2", "#d8cdbd", "#bcae99"], "#8f8270"), 1, 1) })));
  b.add(boxGeo(V(-W - 0.4, 0, -D - 0.4), V(W + 0.4, H, -D), 4), wall);
  for (const s of [-1, 1]) b.add(boxGeo(V(s < 0 ? -W - 0.4 : W, 0, -D), V(s < 0 ? -W : W + 0.4, H, D + 2), 4), wall);
  const trim = lam("throneTrim", () => ({ color: "#8a5a34" }));
  b.add(boxGeo(V(-W - 0.5, H, -D - 0.5), V(W + 0.5, H + 0.4, -D + 0.2)), trim);
  for (let z = -D + 1; z < D + 2; z += 2.4) b.add(boxGeo(V(-W, H - 0.1, z), V(W, H + 0.3, z + 0.35)), trim);
  // red carpet to the dais, dais steps, golden throne with a red back
  b.add(ground(-1.3, 1.3, -D + 2.6, D + 2, 1, 4, 0.03), lam("carpet", () => ({ map: carpetTex() })));
  const stepM = lam("dais", () => ({ color: "#d8cdbd" }));
  b.add(boxGeo(V(-3.2, 0, -D), V(3.2, 0.3, -D + 2.9)), stepM);
  b.add(boxGeo(V(-2.4, 0.3, -D), V(2.4, 0.6, -D + 2.2)), stepM);
  const gold = lam("gold", () => ({ color: "#e8b83a" })), red = lam("velvet", () => ({ color: "#b8283a" }));
  b.add(boxGeo(V(-0.9, 0.6, -D + 0.5), V(0.9, 1.25, -D + 1.6)), gold);
  b.add(boxGeo(V(-0.75, 1.25, -D + 0.6), V(0.75, 1.35, -D + 1.5)), red);
  b.add(boxGeo(V(-0.9, 1.25, -D + 0.35), V(0.9, 3.6, -D + 0.6)), gold);
  b.add(boxGeo(V(-0.7, 1.4, -D + 0.6), V(0.7, 3.3, -D + 0.66)), red);
  for (const s of [-1, 1]) { b.add(boxGeo(V(s * 0.9 - 0.12, 1.25, -D + 0.5), V(s * 0.9 + 0.12, 1.9, -D + 1.6)), gold); b.add(new THREE.SphereGeometry(0.16, 10, 8), gold, M4(s * 0.9, 3.75, -D + 0.48)); }
  // columns and banners
  const col = lam("column", () => ({ color: "#efe6d4" }));
  for (const s of [-1, 1]) for (const z of [-4.5, -0.5, 3.5]) { b.add(cyl(0.45, 0.5, H), col, M4(s * 5.6, 0, z)); b.add(boxGeo(V(s * 5.6 - 0.65, H - 0.4, z - 0.65), V(s * 5.6 + 0.65, H, z + 0.65)), col); }
  for (const [x, n] of [[-4.2, "banner-red"], [4.2, "banner-red"], [-6.8, "banner-green"], [6.8, "banner-green"]] as const) prop(b, kit, n, x, 1.2, -D + 0.25, 4.2, 0);
  // windows: tall painted arches on the back wall
  for (const x of [-6.4, 6.4]) {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.6), new THREE.MeshBasicMaterial({ map: ctex("archWin", 128, 256, (g) => {
      const sky = g.createLinearGradient(0, 0, 0, 256); sky.addColorStop(0, "#6aa8e8"); sky.addColorStop(1, "#d8ecfa");
      g.fillStyle = sky; g.beginPath(); g.moveTo(0, 256); g.lineTo(0, 64); g.arc(64, 64, 64, Math.PI, 0); g.lineTo(128, 256); g.closePath(); g.fill();
      g.strokeStyle = "#241726"; g.lineWidth = 8; g.stroke(); }), transparent: true }));
    win.position.set(x, 3.6, -D + 0.02); root.add(win);
  }
  for (const [x, z] of [[-3, -1], [3, -1], [0, 2.5]]) {
    const lm = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), lampMat()); lm.position.set(x, 4.6, z); root.add(lm);
    b.add(cyl(0.02, 0.02, 1.6, 4), trim, M4(x, 4.7, z));
    info.lanterns.push(V(x, 4.6, z));
  }
  // outside the open front: a courtyard with houses so wide shots never see a void
  b.add(ground(-60, 60, D + 4, 70, 30, 16, 0.0), lam("courtStone", () => ({ map: rep(stoneHD("throneFloorHD"), 6, 6) })));
  for (let x = -40; x <= 40; x += 9) house(b, x, 34, Math.PI, 8, 8, 9.8, Math.abs(x) % 8, 0);
};
