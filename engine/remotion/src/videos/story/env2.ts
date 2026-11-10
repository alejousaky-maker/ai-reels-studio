// Two more original environments built from the same painted kit:
// - interior: an open-topped room (sun pours over the walls and draws light pools), plaster walls with a wainscot,
//   painted windows and frames, plank floor, tables/chairs/shelves, warm hanging lamps; with a shop it becomes the
//   brand's café (counter in the brand colour, brand sign on the back wall, cups on the shelves).
// - harbour: cobbled quay, sea, moored boats, crates/barrels/bollards, a red-and-white striped lighthouse, houses
//   facing the water.
// Ground level y = 0. Everything is procedural (no third-party art beyond the Kenney CC0 props).
import * as THREE from "three";
import { Batch, house, prop, boxGeo, V, lam, Kit } from "../bridge/build";
import { cobbleHD, stoneHD, planksHD, beamHD, rng, ctex, rep } from "../bridge/paint";
import { NOINK } from "../bridge/ink";
import type { EnvSpec } from "./types";
import { drawSign } from "./products";
import { ground, EnvInfo } from "./env";

const M4 = (x: number, y: number, z: number, ry = 0) => new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), ry), V(1, 1, 1));
const cyl = (r0: number, r1: number, h: number, seg = 16) => new THREE.CylinderGeometry(r0, r1, h, seg).translate(0, h / 2, 0);

/** plaster wall with a darker wainscot, a painted window (sky + mullions) and a framed picture; 1024 x 512 for 8 x 4 m */
const wallTex = (key: string, plaster: string, wains: string, win: boolean, pic: string) => ctex(`iwall_${key}`, 1024, 512, (g, r) => {
  g.fillStyle = plaster; g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${r() < 0.5 ? "255,255,255" : "60,40,30"},${0.03 + 0.03 * r()})`; g.fillRect(r() * 1024, r() * 512, 2 + r() * 10, 2 + r() * 6); }
  g.fillStyle = wains; g.fillRect(0, 380, 1024, 132);
  g.fillStyle = "rgba(40,25,30,0.85)"; g.fillRect(0, 374, 1024, 8);
  for (let x = 0; x < 1024; x += 64) { g.fillStyle = "rgba(30,20,20,0.35)"; g.fillRect(x, 382, 3, 130); }
  if (win) {
    const wx = 600, wy = 90, ww = 230, wh = 230;
    const sky = g.createLinearGradient(0, wy, 0, wy + wh); sky.addColorStop(0, "#6aa8e8"); sky.addColorStop(1, "#cfe6fa");
    g.fillStyle = sky; g.fillRect(wx, wy, ww, wh);
    g.fillStyle = "#86c06a"; g.beginPath(); g.ellipse(wx + 70, wy + wh, 90, 50, 0, Math.PI, 0); g.fill();
    g.strokeStyle = "#f4ead6"; g.lineWidth = 16; g.strokeRect(wx, wy, ww, wh);
    g.lineWidth = 9; g.beginPath(); g.moveTo(wx + ww / 2, wy); g.lineTo(wx + ww / 2, wy + wh); g.moveTo(wx, wy + wh / 2); g.lineTo(wx + ww, wy + wh / 2); g.stroke();
    g.strokeStyle = "rgba(36,23,38,0.9)"; g.lineWidth = 6; g.strokeRect(wx - 8, wy - 8, ww + 16, wh + 16);
  }
  // framed picture (simple landscape)
  const px = 150, py = 120, pw = 180, ph = 130;
  g.fillStyle = "#7a4f33"; g.fillRect(px - 14, py - 14, pw + 28, ph + 28);
  g.fillStyle = pic; g.fillRect(px, py, pw, ph);
  g.fillStyle = "#e8b04a"; g.beginPath(); g.arc(px + 130, py + 40, 18, 0, 7); g.fill();
  g.fillStyle = "#4f8a46"; g.beginPath(); g.moveTo(px, py + ph); g.lineTo(px + 70, py + 60); g.lineTo(px + 140, py + ph); g.fill();
  g.strokeStyle = "rgba(36,23,38,0.9)"; g.lineWidth = 6; g.strokeRect(px - 14, py - 14, pw + 28, ph + 28);
});

const lampMat = () => new THREE.MeshBasicMaterial({ color: new THREE.Color(3.4, 2.4, 1.2) }); // > 1 = blooms

export const buildInterior = (root: THREE.Object3D, kit: Kit, env: EnvSpec, info: EnvInfo, b: Batch) => {
  const r = rng(env.seed || 3);
  const W = 7, D = 6, H = 3.8;            // room x in [-W, W], z in [-D, D + 2]; open top and open front
  const floor = lam("planksHD", () => ({ map: planksHD() }));
  b.add(ground(-W, W, -D, D + 4, 3.5, 3.5, 0.01), floor);
  const shop = env.shop;
  const plaster = shop ? "#f1e3c8" : ["#eadcc0", "#e9d2b4", "#dfe3cf"][Math.floor(r() * 3)];
  const wains = shop ? shop.colors.primary : "#7d5a3c";
  const back = lam(`iback_${plaster}_${wains}`, () => ({ map: wallTex(`b${plaster}${wains}`, plaster, wains, true, "#9cc8e8") }));
  const side = lam(`iside_${plaster}_${wains}`, () => ({ map: wallTex(`s${plaster}${wains}`, plaster, wains, false, "#e0b08a") }));
  const quad = (a: THREE.Vector3, bb: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3, u = 1, v = 1) => {
    const g = new THREE.BufferGeometry(), n = new THREE.Vector3().subVectors(bb, a).cross(new THREE.Vector3().subVectors(d, a)).normalize();
    g.setAttribute("position", new THREE.Float32BufferAttribute([a, bb, c, a, c, d].flatMap((p) => [p.x, p.y, p.z]), 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(Array(6).fill([n.x, n.y, n.z]).flat(), 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, u, 0, u, v, 0, 0, u, v, 0, v], 2));
    return g;
  };
  b.add(quad(V(-W, 0, -D), V(W, 0, -D), V(W, H, -D), V(-W, H, -D), 1.75, 1), back);              // back wall facing +z
  b.add(quad(V(-W, 0, D + 2), V(-W, 0, -D), V(-W, H, -D), V(-W, H, D + 2), 2, 1), side);          // left wall facing +x
  b.add(quad(V(W, 0, -D), V(W, 0, D + 2), V(W, H, D + 2), V(W, H, -D), 2, 1), side);              // right wall facing -x
  const trim = lam("itrim", () => ({ map: rep(beamHD(), 4, 1) }));
  b.add(boxGeo(V(-W, H, -D - 0.25), V(W, H + 0.3, -D)), trim);                                       // wall caps (ink silhouettes)
  for (const s of [-1, 1]) b.add(boxGeo(V(s < 0 ? -W - 0.25 : W, H, -D), V(s < 0 ? -W : W + 0.25, H + 0.3, D + 2)), trim);
  // beams across the open top: read as a ceiling from eye level, still let the sun in
  for (let z = -D + 1; z < D + 2; z += 2.2) b.add(boxGeo(V(-W, H - 0.05, z), V(W, H + 0.25, z + 0.3)), trim);
  const wood = lam("iwood", () => ({ color: "#a8724a" })), dark = lam("iwoodDark", () => ({ color: "#6e4a30" }));
  const table = (x: number, z: number) => {
    b.add(cyl(0.62, 0.62, 0.07, 24), wood, M4(x, 0.74, z));
    b.add(cyl(0.06, 0.06, 0.74, 8), dark, M4(x, 0, z));
    b.add(cyl(0.32, 0.32, 0.04, 16), dark, M4(x, 0, z));
    for (const [dx, dz] of [[0.95, 0], [-0.95, 0]]) {                                               // two chairs
      b.add(boxGeo(V(x + dx - 0.22, 0.44, z + dz - 0.22), V(x + dx + 0.22, 0.5, z + dz + 0.22)), wood);
      b.add(boxGeo(V(x + dx + (dx > 0 ? 0.18 : -0.22), 0.5, z + dz - 0.22), V(x + dx + (dx > 0 ? 0.22 : -0.18), 1.0, z + dz + 0.22)), wood);
      for (const [lx, lz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) b.add(boxGeo(V(x + dx + lx - 0.025, 0, z + dz + lz - 0.025), V(x + dx + lx + 0.025, 0.44, z + dz + lz + 0.025)), dark);
    }
  };
  // shelves on the back wall with jars / cups
  const shelfM = lam("ishelf", () => ({ color: "#8a5a3c" }));
  const cols = ["#d9a441", "#c25a7a", "#5a8fc2", "#5d7a3a", "#f4efe6", "#b5653f"];
  for (const [sx, sy] of [[-4.6, 1.7], [-4.6, 2.4], [4.2, 1.7], [4.2, 2.4]]) {
    b.add(boxGeo(V(sx - 1.3, sy, -D), V(sx + 1.3, sy + 0.06, -D + 0.35)), shelfM);
    for (let i = 0; i < 6; i++) {
      const c = shop ? "#fbf7f0" : cols[(i + Math.floor(sx)) % cols.length];
      b.add(cyl(0.09, 0.08, 0.2 + 0.08 * (i % 2), 10), lam("jar" + c, () => ({ color: c })), M4(sx - 1.1 + i * 0.44, sy + 0.06, -D + 0.18));
    }
  }
  if (shop) {
    // counter in the brand colour across the back, brand sign above the window line
    const front = lam(`counter_${shop.colors.primary}`, () => ({ color: shop.colors.primary }));
    b.add(boxGeo(V(-2.6, 0, -D + 1.2), V(2.6, 1.05, -D + 2.0)), front);
    b.add(boxGeo(V(-2.75, 1.05, -D + 1.1), V(2.75, 1.13, -D + 2.1)), lam("counterTop", () => ({ map: stoneHD("copeHD") })));
    b.add(cyl(0.16, 0.14, 0.42, 14), lam("machine", () => ({ color: "#9aa0a8" })), M4(-1.6, 1.13, -D + 1.55));   // espresso machine-ish
    b.add(boxGeo(V(-1.95, 1.13, -D + 1.3), V(-1.25, 1.75, -D + 1.8)), lam("machineBody", () => ({ color: "#c9ccd2" })));
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 1.38), new THREE.MeshBasicMaterial({
      map: ctex(`sign_${shop.name}_${shop.colors.primary}`, 1024, 320, (g) => drawSign(g, shop.name, shop.colors.primary, shop.colors.secondary, shop.colors.text, shop.tagline)),
      alphaTest: 0.5, color: 0xf0f0f0 }));
    sign.position.set(-1.0, 3.0, -D + 0.04); sign.layers.set(NOINK);
    root.add(sign); info.shopSign = sign;
    table(-5.3, 3.4); table(5.3, 3.0);           // furniture hugs the side walls: the middle stays free for staging
  } else {
    table(-5.3, 3.4); table(5.3, 3.0);
    b.add(boxGeo(V(-1.6, 0, -D + 0.6), V(1.6, 0.9, -D + 1.4)), wood);                                // a desk / workbench
    b.add(boxGeo(V(-1.7, 0.9, -D + 0.5), V(1.7, 0.98, -D + 1.5)), dark);
  }
  // warm hanging lamps (emissive -> bloom), plant pots in the corners, a rug
  for (const [x, z] of [[-3.5, -1], [3.5, -1], [0, 2]]) {
    const lm = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 10), lampMat()); lm.position.set(x, 2.75, z); root.add(lm);
    b.add(cyl(0.012, 0.012, 1.0, 4), dark, M4(x, 2.85, z));
    b.add(new THREE.ConeGeometry(0.32, 0.26, 18, 1, true).translate(0, 0.13, 0), lam("shade", () => ({ color: "#3f6f5a", side: THREE.DoubleSide })), M4(x, 2.82, z));
    info.lanterns.push(V(x, 2.75, z));
  }
  for (const [x, z] of [[-W + 0.7, -D + 0.7], [W - 0.7, -D + 0.7]]) {
    b.add(cyl(0.3, 0.22, 0.45, 14), lam("pot", () => ({ color: "#b8684a" })), M4(x, 0, z));
    prop(b, kit, "plant_bushDetailed", x, 0.42, z, 1.1);
  }
  b.add(ground(-2.4, 2.4, -0.5, 2.6, 1, 1, 0.02), lam("rug", () => ({ map: ctex("rug", 256, 256, (g) => {
    g.fillStyle = "#b5523f"; g.fillRect(0, 0, 256, 256); g.strokeStyle = "#f2c94c"; g.lineWidth = 12; g.strokeRect(18, 18, 220, 220);
    g.strokeStyle = "#2f5f6a"; g.lineWidth = 8; g.strokeRect(46, 46, 164, 164); }) })));
  // the world outside the open front: a street with houses so wide shots never see a void
  b.add(ground(-60, 60, D + 4, 70, 30, 16, 0.0), lam("cobbleHD", () => ({ map: cobbleHD() })));
  for (let x = -40; x <= 40; x += 9) house(b, x, 32, Math.PI, 8, 8, 8.4, Math.floor(r() * 8), 0);
};

const stripeTex = () => ctex("lighthouseStripes", 256, 512, (g) => {
  for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? "#f6f1e6" : "#c8323a"; g.fillRect(0, i * 512 / 6, 256, 512 / 6 + 1); }
  g.fillStyle = "rgba(0,0,0,0.06)"; for (let y = 0; y < 512; y += 16) g.fillRect(0, y, 256, 2);
});

export const buildHarbour = (root: THREE.Object3D, kit: Kit, env: EnvSpec, info: EnvInfo, b: Batch) => {
  const r = rng(env.seed || 5);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length) % a.length];
  const cobble = lam("cobbleHD", () => ({ map: cobbleHD() }));
  const stone = lam("copeHD", () => ({ map: stoneHD("copeHD", ["#e6dccd", "#ddd3c3", "#ece4d6", "#d6cbba"], "#aea293") }));
  const quayEdge = 10;                                    // quay for z < 10, sea for z > 10 (and a long pier at x = 14)
  b.add(ground(-120, 120, -70, quayEdge, 60, 40, 0.0), cobble);
  b.add(boxGeo(V(-120, -2.2, quayEdge - 0.6), V(120, 0.02, quayEdge)), stone);                     // quay wall
  b.add(boxGeo(V(-120, 0.0, quayEdge - 0.7), V(120, 0.35, quayEdge - 0.1)), stone);                 // coping
  const sea = new THREE.Mesh(ground(-900, 900, quayEdge - 0.6, 900, 1, 1, -1.2), new THREE.MeshLambertMaterial({ color: "#2f8fc4" }));
  sea.receiveShadow = true; root.add(sea);
  const deck = lam("planksHD", () => ({ map: planksHD() })), post = lam("pierPost", () => ({ color: "#5a3b2a" }));
  b.add(boxGeo(V(12.5, -0.15, quayEdge - 0.6), V(15.5, 0.05, quayEdge + 26)), deck);              // wooden pier
  for (let z = quayEdge + 2; z < quayEdge + 26; z += 3) for (const x of [12.6, 15.4]) b.add(cyl(0.14, 0.14, 2.4, 8), post, M4(x, -2.3, z));
  // moored boats: hull + cabin + mast + sail, plus Kenney canoes
  const hullCols = ["#3f6fb5", "#c8553d", "#2f6a5a", "#f2c94c"];
  for (let i = 0; i < 5; i++) {
    const x = -26 + i * 9 + r() * 2, z = quayEdge + 3.2 + r() * 1.5, yaw = (r() - 0.5) * 0.3, c = hullCols[i % 4];
    const hull = new THREE.CylinderGeometry(1.1, 0.7, 6, 12, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).rotateY(Math.PI / 2).rotateX(Math.PI);
    b.add(hull, lam("hull" + c, () => ({ color: c, side: THREE.DoubleSide })), M4(x, -0.3, z, yaw));
    b.add(boxGeo(V(-0.6, 0, -1.0), V(0.6, 1.1, 0.6)), lam("cabin", () => ({ color: "#f4efe6" })), M4(x, -0.25, z, yaw));
    b.add(cyl(0.06, 0.06, 6, 6), post, M4(x, -0.2, z + 0.8, yaw));
    const sail = new THREE.BufferGeometry();
    sail.setAttribute("position", new THREE.Float32BufferAttribute([0, 0.8, 0, 0, 5.6, 0, 0, 0.8, 2.6], 3)); sail.computeVertexNormals();
    b.add(sail, lam("sail", () => ({ color: "#f7f1e1", side: THREE.DoubleSide })), M4(x, -0.2, z + 0.85, yaw));
  }
  for (let i = 0; i < 3; i++) prop(b, kit, "canoe", 20 + i * 4, -1.0, quayEdge + 6 + i * 2, 0.7, 1.2 + i * 0.3);
  // lighthouse on the breakwater
  const LX = 34, LZ = quayEdge + 30;
  b.add(cyl(6, 7, 1.4, 24), stone, M4(LX, -1.2, LZ));
  b.add(cyl(1.7, 2.3, 14, 24), lam("lhStripes", () => ({ map: stripeTex() })), M4(LX, 0.2, LZ));
  b.add(cyl(2.3, 2.3, 0.3, 24), lam("lhGallery", () => ({ color: "#3a3d47" })), M4(LX, 14.2, LZ));
  b.add(cyl(1.25, 1.25, 1.8, 16), lam("lhGlass", () => ({ color: "#cfe6fa" })), M4(LX, 14.5, LZ));
  b.add(new THREE.ConeGeometry(1.6, 1.4, 16).translate(0, 0.7, 0), lam("lhRoof", () => ({ color: "#c8323a" })), M4(LX, 16.3, LZ));
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.75, 16, 10), lampMat()); beacon.position.set(LX, 15.3, LZ); root.add(beacon);
  info.lanterns.push(V(LX, 15.3, LZ));
  b.add(boxGeo(V(LX - 30, -1.5, LZ - 2), V(LX - 6, 0.6, LZ + 2)), stone);                         // breakwater
  // houses facing the water, crates, barrels, bollards, lanterns, nets
  for (let x = -60; x <= 60; x += 9.5) { const w = pick([7, 8, 9]), h = pick([7, 8.4, 9.8]); if (env.shop && Math.abs(env.shop.x - x) < 8) continue; house(b, x, -6, 0, w, 8, h, Math.floor(r() * 8), 0); }
  for (let x = -54; x <= 54; x += 19) house(b, x + 4, -24, 0, 8, 8, 9.8, Math.floor(r() * 8), 0);
  const crate = lam("crate", () => ({ map: rep(beamHD(), 1, 1) })), barrel = lam("barrel", () => ({ color: "#8a5a3c" })), bol = lam("bollard", () => ({ color: "#2b2b38" }));
  for (let i = 0; i < 14; i++) {
    const x = -30 + r() * 60, z = 3 + r() * 5;
    if (Math.abs(x) < 4 && z < 7) continue;
    if (r() < 0.5) { const s = 0.6 + r() * 0.3; b.add(boxGeo(V(x - s / 2, 0, z - s / 2), V(x + s / 2, s, z + s / 2)), crate); }
    else b.add(cyl(0.32, 0.3, 0.9, 14), barrel, M4(x, 0, z));
  }
  for (let x = -40; x <= 40; x += 8) b.add(cyl(0.22, 0.28, 0.6, 12), bol, M4(x, 0, quayEdge - 0.9));
  for (let x = -36; x <= 36; x += 12) { prop(b, kit, "lantern", x, 0, quayEdge - 1.6, 2.8); info.lanterns.push(V(x, 2.55, quayEdge - 1.6)); }
  prop(b, kit, "cart", -8, 0, 4, 2.2, 0.6);
  prop(b, kit, "stall-red", 8, 0, 1.5, 3.2, 0.2);
  // far coast across the bay
  const hill = new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2);
  for (const [x, z, sx, sy, sz] of [[-200, 420, 260, 50, 90], [160, 460, 300, 70, 100], [420, 300, 160, 40, 80]] as const)
    b.add(hill, lam("hillB", () => ({ color: "#6aa24e" })), new THREE.Matrix4().compose(V(x, -2, z), new THREE.Quaternion(), V(sx, sy, sz)));
};
