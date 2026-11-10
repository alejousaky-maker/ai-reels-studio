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
const plant = (b: Batch, kit: Kit, x: number, z: number) => { b.add(cyl(0.28, 0.2, 0.45, 14), C("pot", "#c8703e"), M4(x, 0, z)); prop(b, kit, "plant_bushDetailed", x, 0.42, z, 1.1); };

// ---------------- rooms ----------------
export const buildModernRoom = (root: THREE.Object3D, kit: Kit, env: EnvSpec, info: EnvInfo, b: Batch) => {
  const kind = env.preset, r = rng(env.seed || 21);
  void r;
  if (kind === "apartment") {
    const W = 6.5, D = 5.5, H = 3.6;
    b.add(ground(-W, W, -D, D + 4, 3.5, 3.5, 0.01), lam("planksHD", () => ({ map: planksHD() })));
    quadsRoom(b, W, D, H, lam("aptBack", () => ({ map: plainWall("aptB", "#e7dfd2", "#8a6a52") })), lam("aptSide", () => ({ map: plainWall("aptS", "#7fa8a2", "#5a4a42") })));
    windowOn(root, b, 1.6, 2.0, -D, 4.2, 2.3, skylineTex(env.variant === "night" ? "n" : "d", env.variant === "night"));
    sofa(b, -2.6, -3.7, "#c8553d");
    box(b, C("rugApt", "#d9c49a"), -4.4, 0.012, -2.6, -0.8, 0.02, 0.4);
    box(b, C("ctable", "#6b4a32"), -3.5, 0.0, -2.3, -1.7, 0.42, -1.5);
    box(b, C("tvStand", "#3a3440"), 3.6, 0, 1.2, 5.6, 0.55, 1.8);
    box(b, C("tvBody", "#1d1b22"), 3.8, 0.55, 1.4, 5.4, 1.5, 1.5);
    const tv = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 0.82), glow([0.35, 0.6, 1.1])); tv.position.set(4.6, 1.02, 1.36); tv.rotation.y = Math.PI; root.add(tv);
    b.add(cyl(0.03, 0.03, 1.7, 6), C("lampPole", "#2b2b38"), M4(-5.6, 0, -4.5));
    const lm = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 0.4, 16), glow([2.6, 2.0, 1.2])); lm.position.set(-5.6, 1.85, -4.5); root.add(lm);
    info.lanterns.push(V(-5.6, 1.85, -4.5));
    plant(b, kit, 5.6, -4.6); plant(b, kit, -5.8, 2.5);
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
  } else if (kind === "office") {
    const W = 7, D = 5.5, H = 3.8;
    b.add(ground(-W, W, -D, D + 4, 4, 4, 0.01), lam("officeCarpet", () => ({ map: tileTex("oc", "#7d8aa0", "#727e94", 6) })));
    quadsRoom(b, W, D, H, lam("offBack", () => ({ map: plainWall("offB", "#eef0f2", "#5a5f6a") })), lam("offSide", () => ({ map: plainWall("offS", "#d9dde3", "#5a5f6a") })));
    windowOn(root, b, 0, 2.05, -D, 9.5, 2.9, skylineTex("o", false));
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
    windowOn(root, b, 3.2, 1.9, -D, 2.2, 1.6, skylineTex("n", true));
    box(b, C("bedBase", "#3a2a20"), -2.4, 0, -D, 1.4, 0.4, -1.2);
    box(b, C("mattress", "#f6f1e6"), -2.35, 0.4, -D + 0.05, 1.35, 0.6, -1.25);
    box(b, C("duvet2", "#7fa8d9"), -2.4, 0.5, -D + 1.3, 1.4, 0.66, -1.2);
    for (const x of [-1.5, 0.5]) box(b, C("pillow", "#ffffff"), x - 0.6, 0.6, -D + 0.15, x + 0.6, 0.82, -D + 0.75);
    box(b, C("headboard2", "#6b4a32"), -2.6, 0, -D, 1.6, 1.5, -D + 0.12);
    for (const x of [-3.1, 2.1]) { box(b, C("nightstand", "#3a2a20"), x - 0.4, 0, -D, x + 0.4, 0.6, -D + 0.6); const l = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), glow([2.8, 2.0, 1.1])); l.position.set(x, 0.95, -D + 0.3); root.add(l); info.lanterns.push(V(x, 0.95, -D + 0.3)); }
    box(b, C("rugBed", "#e8c46a"), -2.6, 0.012, -1.0, 1.6, 0.02, 0.6);
    plant(b, kit, 4.6, -3.8);
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
    for (let k = -2; k <= 2; k++) windowOn(root, b, k * 5.4, 3.0, -D, 5.2, 5.2, apron);
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
  }
  for (let i = -4; i <= 4; i++) { const x = i * 16 + 8; box(b, C("farHouse", "#d8cbb4"), x - 5, 0, 22, x + 5, 5, 30); b.add(new THREE.CylinderGeometry(0.01, 6.6, 2.8, 4, 1).rotateY(Math.PI / 4).scale(1.05, 1, 1.2), C("roof1", "#4a4f5a"), M4(x, 6.4, 26)); }
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
