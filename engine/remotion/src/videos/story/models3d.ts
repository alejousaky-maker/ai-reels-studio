// Real 3D set pieces (replacing the flat painted cards where a model exists): rounded, shaded, shadow-casting
// geometry in the world's own two-tone Phong look (specular highlights on metal / glass / screens), plus CC0 Kenney
// models where they fit. Screens, labels and signs are canvas textures on planes. Every builder makes the object at
// natural size, front facing +z; fit() scales it to the piece's height with its base on y = 0.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { Kit, kitClone } from "../bridge/build";
import { ctex } from "../bridge/paint";
import { twoTone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";
import type { PieceKind } from "./types";

type G = THREE.Group;
const mats = new Map<string, THREE.Material>();
/** two-tone Phong (shininess 0 = matte paint, 30-80 = plastic, 120+ = polished metal / glass) */
const M = (col: string, shin = 8, opts: THREE.MeshPhongMaterialParameters = {}) => {
  const key = `${col}|${shin}|${JSON.stringify(opts)}`;
  let m = mats.get(key);
  if (!m) {
    m = twoTone(new THREE.MeshPhongMaterial({ color: col, shininess: shin, specular: new THREE.Color(shin > 60 ? 0x9a9a9a : shin > 20 ? 0x4a4a4a : 0x151515), ...opts }));
    mats.set(key, m);
  }
  return m;
};
const glowM = (r: number, g: number, b: number) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b) });
const texM = (t: THREE.Texture, k = 1.15) => new THREE.MeshBasicMaterial({ map: t, color: new THREE.Color(k, k, k) });
const glass = () => M("#cfeeff", 140, { transparent: true, opacity: 0.22, depthWrite: false });

const put = (g: G, geo: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, ink = true) => {
  const o = new THREE.Mesh(geo, m);
  o.position.set(x, y, z); o.rotation.set(rx, ry, rz);
  o.castShadow = true; o.receiveShadow = true;
  if (!ink) o.layers.set(NOINK);
  g.add(o); return o;
};
const RB = (w: number, h: number, d: number, r = 0.04) => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2.1, h / 2.1, d / 2.1));
const CY = (r0: number, r1: number, h: number, s = 20) => new THREE.CylinderGeometry(r0, r1, h, s);
const SP = (r: number, ws = 24, hs = 16) => new THREE.SphereGeometry(r, ws, hs);
/** a flat picture on the front of something (screens, labels): unlit-ish so it reads, no ink over the drawing */
const face = (g: G, t: THREE.Texture, w: number, h: number, x: number, y: number, z: number, k = 1.15) => put(g, new THREE.PlaneGeometry(w, h), texM(t, k), x, y, z, 0, 0, 0, false);
const tube = (g: G, pts: [number, number, number][], r: number, m: THREE.Material) =>
  put(g, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), 24, r, 8), m);

// ---------------- canvas textures ----------------
const lines = (g: CanvasRenderingContext2D, s: string, x: number, y: number, size: number, col: string, font = "Arial Black, Arial") => {
  const ls = s.split("|"); g.fillStyle = col; g.textAlign = "center"; g.textBaseline = "middle";
  ls.forEach((l, i) => { let sz = size; g.font = `bold ${sz}px ${font}`; while (g.measureText(l).width > 900 && sz > 20) { sz -= 4; g.font = `bold ${sz}px ${font}`; } g.fillText(l, x, y + (i - (ls.length - 1) / 2) * size * 1.15); });
};
const screenTex = (label: string) => ctex("scr3d_" + label, 1024, 576, (g, r) => {
  if (label.startsWith("~game")) {
    const sky = g.createLinearGradient(0, 0, 0, 576); sky.addColorStop(0, "#2a1450"); sky.addColorStop(0.55, "#ff4fa0"); sky.addColorStop(1, "#ffb347");
    g.fillStyle = sky; g.fillRect(0, 0, 1024, 576);
    g.fillStyle = "#ffd23f"; g.beginPath(); g.arc(512, 400, 130, Math.PI, 0); g.fill();
    let x = 0; while (x < 1024) { const w = 50 + r() * 70, h = 120 + r() * 220; g.fillStyle = "#1a0a30"; g.fillRect(x, 470 - h, w, h + 110); g.fillStyle = "#39d9ff"; for (let k = 0; k < 8; k++) if (r() < 0.6) g.fillRect(x + 8 + (k % 3) * 14, 480 - h + Math.floor(k / 3) * 30, 8, 12); x += w + 5; }
    g.fillStyle = "#ffffff"; g.font = "bold 34px Arial Black, Arial"; g.textAlign = "left"; g.fillText("WANTED ★★★☆☆", 30, 50);
    const rest = label.slice(5).replace(/^\|/, "");
    if (rest) { g.fillStyle = "rgba(0,0,0,0.55)"; g.fillRect(0, 430, 1024, 146); lines(g, rest, 512, 503, 64, "#ffffff"); }
  } else if (label === "~nointernet") {
    g.fillStyle = "#f2f2f5"; g.fillRect(0, 0, 1024, 576); lines(g, "NO INTERNET", 512, 300, 90, "#5a5f6a");
  } else {
    const bg = g.createLinearGradient(0, 0, 0, 576); bg.addColorStop(0, "#1b2a4a"); bg.addColorStop(1, "#0d1424"); g.fillStyle = bg; g.fillRect(0, 0, 1024, 576);
    g.strokeStyle = "rgba(90,160,255,0.18)"; g.lineWidth = 2; for (let y = 0; y < 576; y += 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(1024, y); g.stroke(); }
    lines(g, label || "", 512, 288, 84, "#ffffff");
  }
});
const boardTex = (label: string, bg: string, fg: string, font = "Comic Sans MS, Arial") => ctex(`board3d_${bg}_${label}`, 1024, 768, (g, r) => {
  g.fillStyle = bg; g.fillRect(0, 0, 1024, 768);
  for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(255,255,255,${0.02 + r() * 0.03})`; g.fillRect(r() * 1024, r() * 768, 20 + r() * 60, 3); }
  lines(g, label, 512, 384, 110, fg, font);
});
const woodTex = (key: string, base: string, dark: string) => ctex("wood3d_" + key, 512, 512, (g, r) => {
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  for (let k = 0; k < 60; k++) { g.strokeStyle = dark; g.globalAlpha = 0.18 + r() * 0.25; g.lineWidth = 1 + r() * 3; g.beginPath(); const y = r() * 512; g.moveTo(0, y); g.bezierCurveTo(170, y + (r() - 0.5) * 30, 340, y + (r() - 0.5) * 30, 512, y + (r() - 0.5) * 20); g.stroke(); }
  g.globalAlpha = 1;
});
const woodM = (key: string, base: string, dark: string) => {
  let m = mats.get("wood|" + key);
  if (!m) { m = twoTone(new THREE.MeshPhongMaterial({ map: woodTex(key, base, dark), shininess: 18, specular: new THREE.Color(0x2a2a2a) })); mats.set("wood|" + key, m); }
  return m;
};

// ---------------- builders ----------------
const tv = (g: G, label: string) => {
  put(g, RB(1.9, 0.42, 0.5, 0.05), woodM("tvst", "#3a3440", "#1d1b22"), 0, 0.21, 0);
  put(g, RB(0.5, 0.04, 0.3, 0.02), M("#2b2b38", 60), 0, 0.44, 0);
  put(g, CY(0.04, 0.04, 0.25), M("#2b2b38", 60), 0, 0.56, -0.05);
  put(g, RB(2.4, 1.42, 0.09, 0.03), M("#121216", 90), 0, 1.38, 0);
  face(g, screenTex(label || "~game"), 2.26, 1.28, 0, 1.38, 0.047);
  put(g, RB(0.18, 0.12, 0.12, 0.03), M("#f2f2f5", 40), 0.75, 0.48, 0.1);
};
const monitor = (g: G, label: string, kit: Kit) => {
  const desk = kitClone(kit, "F.desk", 0.76);
  if (desk) { desk.scale.multiplyScalar(1.4); g.add(desk); } else { put(g, RB(2.0, 0.06, 0.8), woodM("desk", "#c08a52", "#8a5a34"), 0, 0.74, 0); for (const x of [-0.9, 0.9]) put(g, RB(0.06, 0.74, 0.7), M("#2b2b38", 30), x, 0.37, 0); }
  put(g, CY(0.05, 0.08, 0.32), M("#2b2b38", 80), 0, 0.92, -0.15);
  put(g, RB(1.5, 0.82, 0.07, 0.03), M("#141218", 90), 0, 1.45, -0.15);
  face(g, screenTex(label), 1.4, 0.74, 0, 1.45, -0.11);
  put(g, RB(1.5, 0.03, 0.03, 0.01), glowM(3.2, 0.5, 2.4), 0, 1.04, -0.12, 0, 0, 0, false);
  put(g, RB(0.7, 0.03, 0.22, 0.01), M("#1d1b22", 40), -0.1, 0.78, 0.15);
  for (const [x, c] of [[0.6, "#39d98a"], [0.75, "#ff4fa0"]] as const) put(g, CY(0.045, 0.045, 0.16), M(c, 70), x, 0.84, 0.15);
};
const consoleBox = (g: G, label: string) => {
  put(g, RB(0.42, 1.25, 0.95, 0.08), M("#f2f2f5", 50), 0, 0.66, 0);
  put(g, RB(0.18, 1.2, 0.96, 0.03), M("#1d1b22", 70), 0, 0.66, 0);
  put(g, RB(0.03, 1.0, 0.04, 0.01), glowM(0.3, 1.6, 3.6), 0, 0.66, 0.49, 0, 0, 0, false);
  put(g, RB(0.32, 0.03, 0.04, 0.01), M("#0d0d12", 10), 0, 1.0, 0.485);
  put(g, RB(0.5, 0.06, 0.5, 0.02), M("#1d1b22", 40), 0, 0.03, 0);
  if (label === "hot") for (let k = 0; k < 3; k++) put(g, CY(0.0, 0.08 + k * 0.02, 0.35, 10), glowM(4, 1.4, 0.3), -0.1 + k * 0.1, 1.45 + k * 0.05, 0, 0, 0, 0, false);
  if (label === "flag") {   // a tiny white flag waved out of the disc slot
    tube(g, [[0, 1.0, 0.5], [0.15, 1.15, 0.65], [0.3, 1.45, 0.7]], 0.012, M("#c9ccd2", 80));
    put(g, new THREE.PlaneGeometry(0.32, 0.22, 6, 2), M("#ffffff", 4, { side: THREE.DoubleSide }), 0.47, 1.38, 0.7, 0, 0, -0.15);
  }
};
const fromKit = (name: string, h: number) => (g: G, _l: string, kit: Kit) => { const o = kitClone(kit, name, h); if (!o) return false; g.add(o); return true; };
const car = (g: G, label: string, kit: Kit, kind: "car" | "van" | "truck" | "semi") => {
  const name = kind === "van" ? "C.van" : kind === "truck" ? "C.truck" : kind === "semi" ? "C.truck" : label === "taxi" ? "C.taxi" : label === "police" ? "C.police" : "C.sedan";
  const o = kitClone(kit, name, 1.6);
  if (!o) return false;
  o.rotation.y = Math.PI / 2;   // drive across the frame (side view, nose to screen right), like the cards
  g.add(o); return true;
};
const hospitalbed = (g: G) => {
  const steel = M("#c9d2da", 110);
  put(g, RB(2.1, 0.12, 0.95, 0.04), steel, 0, 0.55, 0);
  put(g, RB(2.0, 0.2, 0.9, 0.08), M("#e6eef4", 6), 0, 0.71, 0);
  put(g, RB(0.6, 0.14, 0.7, 0.07), M("#ffffff", 4), -0.68, 0.87, 0, 0, 0, 0.12);
  put(g, RB(1.2, 0.06, 0.92, 0.05), M("#7fb8d9", 4), 0.35, 0.83, 0);
  for (const x of [-1.02, 1.02]) put(g, RB(0.06, x < 0 ? 0.75 : 0.5, 0.95, 0.03), steel, x, x < 0 ? 0.92 : 0.8, 0);
  for (const x of [-0.9, 0.9]) for (const z of [-0.38, 0.38]) { put(g, CY(0.025, 0.025, 0.45), steel, x, 0.27, z); put(g, CY(0.07, 0.07, 0.04, 14), M("#2b2b38", 30), x, 0.06, z, Math.PI / 2); }
  tube(g, [[-0.5, 0.86, 0.48], [0.4, 0.86, 0.48], [0.5, 0.86, 0.48]], 0.02, steel);
};
const ecgTex = () => ctex("ecg3d", 512, 320, (g) => {
  g.fillStyle = "#0b1a10"; g.fillRect(0, 0, 512, 320);
  g.strokeStyle = "#5fff8a"; g.lineWidth = 7; g.beginPath(); let x = 0; g.moveTo(0, 200);
  while (x < 512) { g.lineTo(x + 40, 200); g.lineTo(x + 55, 120); g.lineTo(x + 70, 270); g.lineTo(x + 85, 200); x += 128; }
  g.stroke(); g.fillStyle = "#5fff8a"; g.font = "bold 60px Arial"; g.fillText("72", 400, 70);
});
const heartmonitor = (g: G) => {
  const steel = M("#9aa4ad", 100);
  put(g, CY(0.03, 0.03, 1.2), steel, 0, 0.72, 0);
  for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2; put(g, CY(0.02, 0.02, 0.4), steel, Math.cos(a) * 0.17, 0.08, Math.sin(a) * 0.17, Math.sin(a) * 1.2, 0, -Math.cos(a) * 1.2); }
  put(g, RB(0.62, 0.48, 0.2, 0.05), M("#2b2b38", 60), 0, 1.45, 0);
  face(g, ecgTex(), 0.52, 0.36, 0, 1.47, 0.103, 1.3);
};
const rackTex = (red: boolean) => ctex("rack3d_" + red, 256, 512, (g, r) => {
  g.fillStyle = "#16181f"; g.fillRect(0, 0, 256, 512);
  for (let y = 10; y < 500; y += 40) { g.fillStyle = "#23262f"; g.fillRect(10, y, 236, 32); for (let k = 0; k < 6; k++) { g.fillStyle = red ? (r() < 0.7 ? "#ff3b3b" : "#ffb03f") : (r() < 0.7 ? "#39ff8a" : "#39b8ff"); g.fillRect(20 + k * 14, y + 12, 7, 7); } g.fillStyle = "#3a3d47"; g.fillRect(150, y + 8, 86, 16); }
});
const rack = (g: G, label: string) => {
  put(g, RB(0.85, 2.15, 1.0, 0.03), M("#1d1f26", 60), 0, 1.075, 0);
  face(g, rackTex(label === "red"), 0.75, 2.0, 0, 1.08, 0.505, 1.6);
};
const cashcounter = (g: G, label: string) => {
  const hot = label === "fire";
  put(g, RB(0.9, 1.6, 0.8, 0.06), M(hot ? "#5a1e1e" : "#2b2b38", 60), 0, 0.8, 0);
  face(g, ctex("cc3d_" + hot, 512, 256, (c) => { c.fillStyle = "#0b0b10"; c.fillRect(0, 0, 512, 256); c.fillStyle = hot ? "#ff3b3b" : "#39ff8a"; c.font = "bold 110px Consolas, monospace"; c.textAlign = "center"; c.fillText(hot ? "$9,999" : "$0.00", 256, 170); }), 0.7, 0.34, 0, 1.25, 0.405, 1.6);
  for (let k = 0; k < 12; k++) put(g, RB(0.13, 0.13, 0.1, 0.02), M("#c9ccd2", 60), -0.18 + (k % 3) * 0.18, 0.95 - Math.floor(k / 3) * 0.17, 0.41);
  if (hot) for (let k = 0; k < 5; k++) put(g, CY(0.0, 0.1, 0.45 + (k % 2) * 0.2, 10), glowM(4.2, 1.5 + (k % 2), 0.3), -0.34 + k * 0.17, 1.82 + (k % 2) * 0.1, 0, 0, 0, 0, false);
};
const calendar = (g: G, label: string) => {
  put(g, RB(1.1, 1.3, 0.06, 0.02), M("#ffffff", 6), 0, 0.65, 0);
  put(g, RB(1.1, 0.32, 0.08, 0.02), M("#e2453c", 20), 0, 1.18, 0.01);
  face(g, ctex("cal3d_" + label, 512, 512, (c) => { c.fillStyle = "#ffffff"; c.fillRect(0, 0, 512, 512); c.strokeStyle = "#c9ccd2"; c.lineWidth = 3; for (let i = 1; i < 7; i++) { c.beginPath(); c.moveTo(i * 73, 0); c.lineTo(i * 73, 512); c.stroke(); } for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(0, i * 102); c.lineTo(512, i * 102); c.stroke(); } lines(c, label || "", 256, 256, 150, "#1d1b22"); }), 1.0, 0.92, 0, 0.5, 0.033, 1.0);
  face(g, ctex("calTop3d", 512, 128, (c) => { c.fillStyle = "#e2453c"; c.fillRect(0, 0, 512, 128); lines(c, "CALENDAR", 256, 64, 60, "#ffffff"); }), 1.0, 0.25, 0, 1.18, 0.052, 1.0);
  for (const x of [-0.3, 0.3]) put(g, new THREE.TorusGeometry(0.05, 0.012, 8, 16), M("#c9ccd2", 120), x, 1.36, 0.03);
};
const easel = (g: G, t: THREE.Texture, frame: string) => {
  const w = woodM("easel", "#a0703e", "#6b4a2a");
  for (const s of [-1, 1]) put(g, RB(0.06, 2.3, 0.06, 0.02), w, s * 0.55, 1.15, 0.05, 0, 0, s * -0.08);
  put(g, RB(0.06, 2.0, 0.06, 0.02), w, 0, 1.0, -0.45, 0.25, 0, 0);
  put(g, RB(1.5, 1.12, 0.08, 0.03), M(frame, 20), 0, 1.55, 0.1);
  face(g, t, 1.38, 1.0, 0, 1.55, 0.142, 1.0);
  put(g, RB(1.4, 0.05, 0.12, 0.02), w, 0, 0.96, 0.15);
};
const corkboard = (g: G, label: string) => {
  put(g, RB(2.4, 1.6, 0.08, 0.03), M("#6b4a32", 20), 0, 0.8, 0);
  const t = ctex("cork3d_" + label, 1024, 680, (c, r) => {
    c.fillStyle = "#c79a5e"; c.fillRect(0, 0, 1024, 680);
    for (let i = 0; i < 1500; i++) { c.fillStyle = `rgba(90,60,30,${0.1 + r() * 0.2})`; c.fillRect(r() * 1024, r() * 680, 3, 3); }
    const pins: [number, number][] = [[150, 140], [480, 110], [840, 150], [260, 400], [620, 360], [880, 480], [140, 520]];
    for (const [a, b] of [[0, 1], [1, 2], [0, 3], [3, 4], [4, 2], [4, 5], [3, 6], [1, 4]] as const) { c.strokeStyle = "#e2453c"; c.lineWidth = 5; c.beginPath(); c.moveTo(...pins[a]); c.lineTo(...pins[b]); c.stroke(); }
    pins.forEach(([x, y], i) => { c.fillStyle = i % 2 ? "#ffe14d" : "#f7f5f0"; c.fillRect(x - 75, y - 55, 150, 110); c.fillStyle = "#e2453c"; c.beginPath(); c.arc(x, y - 45, 10, 0, 7); c.fill(); });
    if (label) { c.fillStyle = "#ffffff"; c.fillRect(250, 590, 524, 80); lines(c, label, 512, 630, 52, "#1d1b22", "Comic Sans MS, Arial"); }
  });
  face(g, t, 2.26, 1.48, 0, 0.8, 0.043, 1.0);
};
const signs = (g: G, label: string) => {
  (label || "DROP IT|NOW|PLEASE").split("|").slice(0, 3).forEach((l, i) => {
    const x = -1.0 + i * 1.0, y = 1.9 + (i % 2) * 0.2;
    put(g, RB(0.06, y, 0.06, 0.02), woodM("stick", "#a0703e", "#6b4a2a"), x, y / 2, 0);
    put(g, RB(0.9, 0.6, 0.04, 0.02), M("#f7f5f0", 4), x, y, 0.04, 0, 0, (i - 1) * 0.08);
    face(g, ctex("sign3d_" + l, 512, 340, (c) => { c.fillStyle = "#f7f5f0"; c.fillRect(0, 0, 512, 340); lines(c, l, 256, 170, 90, "#e2453c", "Comic Sans MS, Arial"); }), 0.84, 0.55, x, y, 0.065, 1.0).rotation.z = (i - 1) * 0.08;
  });
};
const plantpot = (g: G) => {
  const pot = new THREE.LatheGeometry([[0, 0], [0.3, 0], [0.36, 0.55], [0.42, 0.6], [0.42, 0.68], [0, 0.68]].map(([x, y]) => new THREE.Vector2(x, y)), 28);
  put(g, pot, M("#c8703e", 12));
  put(g, CY(0.38, 0.38, 0.02, 24), M("#4a3020", 2), 0, 0.66, 0);
  for (let k = 0; k < 11; k++) {
    const a = (k / 11) * Math.PI * 2, tilt = 0.35 + (k % 3) * 0.18, len = 0.9 + (k % 4) * 0.2;
    const leaf = new THREE.PlaneGeometry(0.22, len, 1, 4).translate(0, len / 2, 0);
    const pos = leaf.attributes.position; for (let i = 0; i < pos.count; i++) { const y = pos.getY(i); pos.setX(i, pos.getX(i) * (1 - Math.pow(y / len, 2) * 0.9)); pos.setZ(i, -0.25 * Math.pow(y / len, 2)); }
    leaf.computeVertexNormals();
    put(g, leaf, M(k % 2 ? "#3f8a3a" : "#5fae5a", 20, { side: THREE.DoubleSide }), Math.cos(a) * 0.08, 0.66, Math.sin(a) * 0.08, 0, -a + Math.PI / 2, tilt).rotation.order = "YXZ";
  }
};
const vending = (g: G, label: string) => {
  put(g, RB(1.15, 2.3, 0.85, 0.06), M("#c8323a", 50), 0, 1.15, 0);
  put(g, RB(0.72, 1.55, 0.05, 0.02), M("#1d1b22", 20), -0.16, 1.4, 0.4);
  const cols = ["#ffd23f", "#39d98a", "#ff7a1a", "#3f6fb5", "#ff4fa0"];
  for (let r = 0; r < 5; r++) { put(g, RB(0.66, 0.02, 0.3, 0.005), M("#c9ccd2", 100), -0.16, 0.82 + r * 0.3, 0.3); for (let c = 0; c < 3; c++) put(g, RB(0.16, 0.2, 0.14, 0.03), M(cols[(r + c) % 5], 60), -0.37 + c * 0.21, 0.94 + r * 0.3, 0.32); }
  put(g, new THREE.PlaneGeometry(0.72, 1.55), glass(), -0.16, 1.4, 0.43);
  put(g, RB(0.24, 0.5, 0.04, 0.02), M("#2b2b38", 40), 0.4, 1.6, 0.43);
  for (let k = 0; k < 9; k++) put(g, RB(0.05, 0.05, 0.02, 0.01), M("#c9ccd2", 90), 0.35 + (k % 3) * 0.06, 1.72 - Math.floor(k / 3) * 0.08, 0.455);
  put(g, RB(0.08, 0.14, 0.03, 0.01), M("#1d1b22", 10), 0.4, 1.25, 0.44);
  put(g, RB(0.72, 0.28, 0.05, 0.03), M("#1d1b22", 10), -0.16, 0.36, 0.42);
  face(g, ctex("vendTop3d", 512, 128, (c) => { c.fillStyle = "#c8323a"; c.fillRect(0, 0, 512, 128); lines(c, "SNACKS", 256, 64, 80, "#ffffff"); }), 1.0, 0.25, 0, 2.16, 0.43, 1.2);
  if (label === "reject") { const coin = put(g, CY(0.09, 0.09, 0.02, 24), M("#ffb020", 120), 0.62, 1.4, 0.65, Math.PI / 2, 0, 0.4); void coin; }
};
const arrow = (g: G, label: string, up: boolean) => {
  const s = new THREE.Shape();
  s.moveTo(-0.35, 0); s.lineTo(0.35, 0); s.lineTo(0.35, 2.6); s.lineTo(0.85, 2.6); s.lineTo(0, 3.8); s.lineTo(-0.85, 2.6); s.lineTo(-0.35, 2.6); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.35, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 3 }).translate(0, 0, -0.175);
  const a = put(g, geo, M(up ? "#39d98a" : "#e2453c", 70), 0, up ? 0.3 : 4.3, 0, 0, 0, up ? -0.35 : Math.PI + 0.35);
  void a;
  for (let k = 0; k < 7; k++) put(g, new THREE.DodecahedronGeometry(0.12 + (k % 3) * 0.05), M("#8a6a4a", 4), -0.9 + k * 0.3, up ? 4.1 + (k % 2) * 0.3 : 0.12, (k % 3) * 0.2 - 0.2);
  if (label) face(g, ctex("arrowLbl_" + label, 512, 256, (c) => { c.clearRect(0, 0, 512, 256); lines(c, label, 256, 128, 150, "#ffffff"); }), 1.0, 0.5, up ? -0.35 : 0.35, 1.6, 0.25);
};
const glasscase = (g: G, label: string) => {
  put(g, RB(1.0, 0.9, 0.7, 0.03), M("#e8b83a", 110), 0, 0.45, 0);
  put(g, RB(0.85, 0.08, 0.55, 0.03), M("#a8202a", 2), 0, 0.94, 0);
  tube(g, [[-0.28, 1.02, 0.05], [-0.1, 1.04, -0.06], [0.12, 1.03, -0.05], [0.3, 1.01, 0.06]], 0.05, M("#d9a35a", 6));
  for (const x of [-0.2, 0.0, 0.18]) put(g, SP(0.035, 10, 8), M("#7fae5a", 4), x, 1.06, -0.04);
  put(g, RB(0.92, 0.75, 0.62, 0.01), glass(), 0, 1.36, 0);
  put(g, RB(0.98, 0.05, 0.68, 0.02), M("#c9a227", 120), 0, 1.75, 0);
  face(g, ctex("plaque3d_" + label, 512, 160, (c) => { c.fillStyle = "#c9a227"; c.fillRect(0, 0, 512, 160); lines(c, label || "PRICELESS", 256, 80, 64, "#4a2e10"); }), 0.7, 0.22, 0, 0.5, 0.356, 1.0);
};
const irisTex = () => ctex("iris3d", 1024, 512, (c) => {   // equirectangular 2:1 so the iris stays round on the ball
  c.fillStyle = "#ffffff"; c.fillRect(0, 0, 1024, 512); c.translate(256, 0);
  const gr = c.createRadialGradient(256, 256, 30, 256, 256, 150); gr.addColorStop(0, "#1d5fa0"); gr.addColorStop(0.7, "#3f9fe0"); gr.addColorStop(1, "#1d4a80");
  c.fillStyle = gr; c.beginPath(); c.arc(256, 256, 150, 0, 7); c.fill();
  c.strokeStyle = "rgba(255,255,255,0.25)"; c.lineWidth = 3; for (let k = 0; k < 48; k++) { const a = (k / 48) * Math.PI * 2; c.beginPath(); c.moveTo(256 + 70 * Math.cos(a), 256 + 70 * Math.sin(a)); c.lineTo(256 + 145 * Math.cos(a), 256 + 145 * Math.sin(a)); c.stroke(); }
  c.fillStyle = "#0d0d12"; c.beginPath(); c.arc(256, 256, 68, 0, 7); c.fill();
  c.strokeStyle = "#1d1b22"; c.lineWidth = 8; c.beginPath(); c.arc(256, 256, 150, 0, 7); c.stroke();
  c.fillStyle = "#ffffff"; c.beginPath(); c.arc(290, 222, 26, 0, 7); c.fill();
  c.strokeStyle = "#e2453c"; c.lineWidth = 4; for (const [x0, y0, x1, y1] of [[20, 230, 100, 250], [30, 300, 110, 280], [490, 220, 410, 245], [480, 300, 405, 290]]) { c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo((x0 + x1) / 2, y0 - 15, x1, y1); c.stroke(); }
});
const eye = (g: G, label: string) => {
  const R = 0.6, cy = 0.7;
  const ball = new THREE.SphereGeometry(R, 48, 32);
  // map the iris onto the front (+z): spherical uv rotated so u = 0.25 faces the lens
  put(g, ball, M("#ffffff", 120, { map: irisTex() }), 0, cy, 0, 0, -Math.PI / 2, 0);
  put(g, CY(0.35, 0.45, 0.1, 28), M("#c9d2da", 80), 0, 0.05, 0);   // a little stand (it is a model eye)
  put(g, CY(0.06, 0.06, 0.12), M("#c9d2da", 80), 0, 0.14, 0);
  if (label === "flap") {   // the clear corneal flap hinged up like a car hood, on a tiny prop rod
    const cap = new THREE.SphereGeometry(R * 1.03, 32, 12, 0, Math.PI * 2, 0, 0.55).rotateX(Math.PI / 2);
    const hinge = new THREE.Group(); hinge.position.set(0, cy + R * 0.48, R * 0.55); hinge.rotation.x = -1.0; g.add(hinge);
    put(hinge as G, cap.translate(0, -R * 0.48, -R * 0.55), M("#cfeeff", 140, { transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
    tube(g, [[0.25, cy - 0.05, R * 0.95], [0.27, cy + 0.35, R * 1.05]], 0.012, M("#9aa4ad", 100));
  }
  if (label === "dots") for (let k = 0; k < 24; k++) { const a = (k / 24) * Math.PI * 2, rr = 0.3; put(g, SP(0.022, 8, 6), glowM(4, 0.3, 0.3), Math.cos(a) * rr, cy + Math.sin(a) * rr, Math.sqrt(R * R - rr * rr) + 0.01, 0, 0, 0, false); }
  if (label === "laser") { for (let k = 0; k < 5; k++) put(g, CY(0.012, 0.012, 1.4, 8), glowM(0.6, 2.6, 4.0), -0.2 + k * 0.1, cy + 0.95, 0.45, 0.35, 0, 0, false); put(g, SP(0.18, 16, 10).scale(1.4, 0.4, 0.6), glowM(1.2, 2.6, 3.6), 0, cy + 0.05, R - 0.02, 0, 0, 0, false); }
  if (label === "check") { put(g, CY(0.22, 0.22, 0.06, 28), M("#39d98a", 60), -0.62, cy + 0.55, 0.3, Math.PI / 2); face(g, ctex("check3d", 256, 256, (c) => { c.clearRect(0, 0, 256, 256); c.strokeStyle = "#ffffff"; c.lineWidth = 34; c.lineCap = "round"; c.beginPath(); c.moveTo(60, 130); c.lineTo(110, 185); c.lineTo(200, 75); c.stroke(); }), 0.36, 0.36, -0.62, cy + 0.55, 0.34, 1.2); }
  if (label === "blur") { put(g, CY(0.03, 0.03, 1.6, 10), glowM(4, 3.2, 0.6), 0.75, cy + 0.15, 0.6, 0, 0, 1.25, false); put(g, SP(0.08, 12, 8), glowM(4, 0.4, 0.3), -0.2, cy - 0.25, 0.6, 0, 0, 0, false); }
};
const laserarm = (g: G, label: string) => {
  const w = M("#e9ecef", 70), j = M("#9aa4ad", 100);
  put(g, CY(0.45, 0.5, 0.18, 28), w, 0, 0.09, 0);
  put(g, CY(0.09, 0.09, 1.3), w, 0, 0.8, 0); put(g, SP(0.13), j, 0, 1.45, 0);
  put(g, CY(0.07, 0.07, 0.9), w, 0.32, 1.75, 0.0, 0, 0, -0.8); put(g, SP(0.11), j, 0.62, 2.03, 0);
  put(g, RB(0.34, 0.3, 0.34, 0.07), w, 0.75, 1.88, 0);
  put(g, CY(0.07, 0.04, 0.12, 16), M("#2b2b38", 80), 0.75, 1.68, 0);
  const red = label === "red";
  put(g, CY(0.015, 0.015, 1.5, 8), red ? glowM(4.4, 0.3, 0.3) : glowM(0.6, 2.6, 4.2), 0.75, 0.9, 0, 0, 0, 0, false);
  put(g, RB(0.5, 0.2, 0.04, 0.02), M("#1d1b22", 30), 0, 0.3, 0.42);
  face(g, ctex("uv3d", 256, 96, (c) => { c.fillStyle = "#1d1b22"; c.fillRect(0, 0, 256, 96); lines(c, "UV 193", 128, 48, 50, "#5fd8ff"); }), 0.46, 0.17, 0, 0.3, 0.443, 1.3);
};
const tvPicTex = (m: string) => ctex("tube3d_" + m, 512, 400, (c, r) => {
  if (m === "static") { for (let i = 0; i < 9000; i++) { const v = Math.floor(r() * 255); c.fillStyle = `rgb(${v},${v},${v})`; c.fillRect(Math.floor(r() * 128) * 4, Math.floor(r() * 100) * 4, 4, 4); } return; }
  c.fillStyle = m === "field" ? "#2f7a3a" : "#121216"; c.fillRect(0, 0, 512, 400);
  if (m === "field") { c.strokeStyle = "#ffffff"; c.lineWidth = 6; for (let x = 40; x < 512; x += 72) { c.beginPath(); c.moveTo(x, 10); c.lineTo(x, 390); c.stroke(); } }
  c.fillStyle = "#ffffff"; c.fillRect(90, 150, 26, 26); c.fillRect(380, 230, 26, 26); c.fillRect(250, 10, 10, 380);
});
const tubetv = (g: G, label: string) => {
  const m = label || "static", wood = woodM("tube", "#8a5a34", "#5a3b1e");
  put(g, RB(1.3, 0.95, 0.75, 0.08), wood, 0, 0.95, 0);
  for (const [x, z] of [[-0.5, -0.25], [0.5, -0.25], [-0.5, 0.25], [0.5, 0.25]]) put(g, CY(0.03, 0.02, 0.5, 10), M("#3a2414", 20), x, 0.25, z);
  put(g, RB(0.82, 0.68, 0.06, 0.12), M("#1d1d22", 40), -0.16, 0.97, 0.37);
  const scr = new THREE.SphereGeometry(1.6, 24, 16, Math.PI / 2 - 0.24, 0.48, Math.PI / 2 - 0.2, 0.4);
  const o = put(g, scr, texM(tvPicTex(m), m === "static" ? 1.0 : 1.2), -0.16, 0.97, 0.39 - 1.6 + 0.02, 0, 0, 0, false); void o;
  for (const y of [1.15, 0.85]) { put(g, CY(0.08, 0.08, 0.06, 20), M("#c9a227", 110), 0.43, y, 0.39, Math.PI / 2); put(g, RB(0.02, 0.1, 0.02, 0.005), M("#3a2414", 10), 0.43, y + 0.02, 0.43); }
  put(g, RB(0.22, 0.2, 0.02, 0.01), M("#5a3b2a", 10), 0.43, 0.62, 0.38);
  if (m === "field") for (const [x, y] of [[-0.55, 1.28], [0.23, 1.28], [-0.55, 0.66], [0.23, 0.66]]) put(g, RB(0.16, 0.05, 0.005, 0.002), M("#fff1b0", 4, { transparent: true, opacity: 0.85 }), x, y, 0.405, 0, 0, 0.3);
  tube(g, [[0.2, 1.42, -0.1], [0.05, 1.75, -0.1]], 0.008, M("#c9ccd2", 100)); tube(g, [[0.25, 1.42, -0.1], [0.45, 1.72, -0.1]], 0.008, M("#c9ccd2", 100));
};
const brownbox = (g: G, label: string) => {
  const wood = woodM("brownbox", "#a0703e", "#6b4a2a"), open = label === "open";
  put(g, RB(1.0, 0.24, 0.55, 0.03), wood, 0, 0.12, 0);
  if (open) { put(g, RB(0.85, 0.02, 0.45, 0.01), M("#2f6a3a", 20), 0, 0.245, 0); for (let k = 0; k < 6; k++) tube(g, [[-0.35 + k * 0.13, 0.26, -0.1], [-0.3 + k * 0.12, 0.33, 0.0], [-0.33 + k * 0.13, 0.26, 0.12]], 0.01, M(["#e2453c", "#ffd23f", "#3f6fb5"][k % 3], 40)); const lid = put(g, RB(1.0, 0.03, 0.55, 0.01), wood, 0, 0.5, -0.3, -1.2); void lid; }
  else put(g, RB(1.0, 0.03, 0.55, 0.01), wood, 0, 0.255, 0);
  for (let k = 0; k < 5; k++) { put(g, CY(0.035, 0.035, 0.03, 16), M("#e9ecef", 60), -0.36 + k * 0.18, 0.15, 0.285, Math.PI / 2); put(g, RB(0.01, 0.04, 0.01, 0.002), M("#1d1b22", 10), -0.36 + k * 0.18, 0.16, 0.302); }
  for (const s of [-1, 1]) { put(g, RB(0.24, 0.1, 0.16, 0.03), wood, s * 0.75, 0.05, 0.45); put(g, CY(0.025, 0.025, 0.03, 12), M("#e9ecef", 60), s * 0.75, 0.115, 0.45); tube(g, [[s * 0.45, 0.06, 0.1], [s * 0.6, 0.02, 0.35], [s * 0.72, 0.05, 0.4]], 0.008, M("#1d1b22", 10)); }
};
const wallet = (g: G) => {
  const l = M("#6b4a32", 30);
  put(g, RB(0.45, 0.02, 0.36, 0.01), l, -0.22, 0.03, 0, 0, 0, 0.12);
  put(g, RB(0.45, 0.02, 0.36, 0.01), l, 0.22, 0.03, 0, 0, 0, -0.12);
  for (const x of [-0.22, 0.22]) put(g, RB(0.36, 0.015, 0.28, 0.008), M("#5a3b2a", 10), x, 0.06, 0, 0, 0, x < 0 ? 0.12 : -0.12);
};
const blueprint = (g: G, label: string) => {
  const w = woodM("draft", "#a0703e", "#6b4a2a");
  for (const s of [-1, 1]) for (const z of [-0.35, 0.35]) put(g, RB(0.05, 0.95, 0.05, 0.015), w, s * 0.75, 0.47, z);
  const top = put(g, RB(1.7, 0.04, 1.0, 0.02), w, 0, 1.0, 0, 0.5); void top;
  const p = face(g, ctex("bp3d_" + label, 768, 512, (c) => { c.fillStyle = "#2f5fb0"; c.fillRect(0, 0, 768, 512); c.strokeStyle = "rgba(255,255,255,0.35)"; c.lineWidth = 2; for (let x = 0; x < 768; x += 32) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 512); c.stroke(); } for (let y = 0; y < 512; y += 32) { c.beginPath(); c.moveTo(0, y); c.lineTo(768, y); c.stroke(); } c.strokeStyle = "#ffffff"; c.lineWidth = 6; c.beginPath(); c.arc(384, 280, 140, Math.PI, 0); c.stroke(); c.beginPath(); c.moveTo(384, 280); c.lineTo(480, 180); c.stroke(); lines(c, label.replace(/^~/, "") || "PLAN", 384, 450, 60, "#ffffff"); }), 1.55, 0.88, 0, 1.03, 0.02, 1.0);
  p.rotation.set(-Math.PI / 2 + 0.5, 0, 0); p.position.set(0, 1.0 + 0.03 * Math.cos(0.5), 0.03 * Math.sin(0.5));
};
const screen = (g: G, label: string) => {
  for (const s of [-1, 1]) put(g, CY(0.03, 0.03, 4.2), M("#2b2b38", 60), s * 2.6, 2.1, 0);
  put(g, RB(5.4, 0.12, 0.12, 0.05), M("#2b2b38", 60), 0, 4.15, 0);
  face(g, screenTex(label || ""), 5.0, 2.9, 0, 2.6, 0.02, 1.25);
};
const ticker = (g: G) => {
  put(g, RB(4.4, 2.4, 0.12, 0.04), M("#141218", 80), 0, 1.6, 0);
  face(g, ctex("tick3d", 1024, 560, (c) => { c.fillStyle = "#0d1020"; c.fillRect(0, 0, 1024, 560); c.strokeStyle = "rgba(255,255,255,0.08)"; for (let x = 0; x < 1024; x += 64) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 560); c.stroke(); } c.strokeStyle = "#ff3b3b"; c.lineWidth = 12; c.beginPath(); c.moveTo(0, 120); for (let x = 0; x <= 1024; x += 64) c.lineTo(x, 120 + (x / 1024) * 360 + ((x / 64) % 2) * 30); c.stroke(); }), 4.2, 2.25, 0, 1.6, 0.065, 1.3);
};
const trafficlight = (g: G) => {
  put(g, CY(0.07, 0.09, 3.0), M("#2b2b38", 70), 0, 1.5, 0);
  put(g, RB(0.45, 1.2, 0.35, 0.06), M("#e8b83a", 50), 0, 3.4, 0);
  for (const [y, c] of [[3.78, [4, 0.4, 0.3]], [3.4, [0.6, 0.5, 0.2]], [3.02, [0.2, 0.5, 0.3]]] as const) { put(g, SP(0.13, 16, 12), glowM(...(c as [number, number, number])), 0, y, 0.17, 0, 0, 0, false); put(g, CY(0.17, 0.17, 0.12, 16, ).translate(0, 0.06, 0), M("#1d1b22", 30), 0, y + 0.08, 0.2, -1.2); }
};
const snacks = (g: G, _l: string, kit: Kit) => {
  const items: [string, number, number, number, number][] = [["K.pizza-box", 0, 0, 0, 0.12], ["K.pizza-box", 0.05, 0.12, 0.02, 0.12], ["K.soda-can", 0.45, 0, 0.2, 0.2], ["K.soda-can", 0.6, 0, -0.1, 0.2],
    ["K.soda-can-crushed", -0.5, 0, 0.3, 0.12], ["K.bag", -0.45, 0, -0.15, 0.4], ["K.donut-sprinkles", 0.1, 0.24, 0.0, 0.1], ["K.fries", 0.35, 0, 0.45, 0.25], ["K.burger", -0.15, 0, 0.45, 0.2]];
  let n = 0;
  for (const [name, x, y, z, h] of items) { const o = kitClone(kit, name, h * 2.2); if (!o) continue; o.position.set(x * 1.6, y * 2.2, z * 1.6); o.rotation.y = x * 5; g.add(o); n++; }
  return n > 0;
};
const crates = (g: G, label: string) => {
  const w = woodM("crate", "#b88a52", "#7a5530");
  for (const [x, y, z, s] of [[-0.45, 0.35, 0, 0.7], [0.4, 0.3, 0.1, 0.6], [-0.05, 1.0, 0.0, 0.6]] as const) {
    put(g, RB(s, s, s, 0.03), w, x, y, z);
    for (const d of [-1, 1]) put(g, RB(s + 0.02, 0.06, 0.06, 0.01), M("#6b4a2a", 6), x, y + d * s * 0.42, z + s / 2);
  }
  if (label) face(g, ctex("crate3d_" + label, 512, 256, (c) => { c.clearRect(0, 0, 512, 256); lines(c, label, 256, 128, 90, "#3a2414"); }), 0.62, 0.3, -0.45, 0.35, 0.36, 1.0);
};
const departures = (g: G) => {
  put(g, RB(3.4, 2.0, 0.15, 0.04), M("#2b2b38", 60), 0, 1.25, 0);
  face(g, ctex("dep3d", 1024, 600, (c) => { c.fillStyle = "#16181f"; c.fillRect(0, 0, 1024, 600); c.fillStyle = "#ffd23f"; c.font = "bold 60px Arial"; c.fillText("DEPARTURES", 40, 80); const rows = [["09:40", "NEW YORK", "ON TIME"], ["10:15", "CANCUN", "BOARDING"], ["11:05", "CHICAGO", "DELAYED"], ["12:30", "MIAMI", "ON TIME"], ["13:10", "DENVER", "ON TIME"]]; c.font = "bold 46px Courier New, monospace"; rows.forEach(([t, ci, s], i) => { const y = 170 + i * 85; c.fillStyle = "#ffd23f"; c.fillText(t, 40, y); c.fillText(ci, 260, y); c.fillStyle = s === "DELAYED" ? "#ff5a4a" : "#7dff8a"; c.fillText(s, 700, y); }); }), 3.2, 1.85, 0, 1.25, 0.08, 1.25);
};

type Builder = (g: G, label: string, kit: Kit) => boolean | void;
const BUILD: Partial<Record<PieceKind, Builder>> = {
  tv, monitor, console: consoleBox, hospitalbed, heartmonitor, rack, cashcounter, calendar, corkboard, signs, plantpot, vending,
  greenarrow: (g, l) => arrow(g, l, true), redarrow: (g, l) => arrow(g, l, false), glasscase, eye, laserarm, tubetv, brownbox, wallet, blueprint, screen, ticker,
  trafficlight, snacks, crates, departures,
  board: (g, l) => easel(g, boardTex(l || "", "#2f5a46", "#f7f5f0"), "#8a5a34"),
  chalkboard: (g, l) => easel(g, boardTex(l || "", "#2f5a46", "#f7f5f0"), "#8a5a34"),
  car: (g, l, k) => car(g, l, k, "car"), van: (g, l, k) => car(g, l, k, "van"), truck: (g, l, k) => car(g, l, k, "truck"),
  sofa: fromKit("F.loungeSofa", 1.0), fridge: fromKit("F.kitchenFridge", 1.9), bed: fromKit("F.bedDouble", 1.0),
  cardbox: fromKit("F.cardboardBoxClosed", 0.6), desk: (g, l, k) => { const d = kitClone(k, "F.desk", 0.78); if (!d) return false; d.scale.multiplyScalar(1.3); g.add(d); const lamp = kitClone(k, "F.lampRoundTable", 0.5); if (lamp) { lamp.position.set(0.5, 0.78, -0.1); g.add(lamp); } put(g, RB(0.28, 0.08, 0.2, 0.03), M("#2b2b38", 50), -0.4, 0.82, 0); return true; },
};

/** the piece as a real 3D object, fitted to height h (base on y = 0, front +z), or null to keep the painted card */
export const model3d = (kind: PieceKind, label: string, kit: Kit, h: number, w = Infinity): THREE.Object3D | null => {
  const b = BUILD[kind];
  if (!b) return null;
  const inner = new THREE.Group();
  if (b(inner, label, kit) === false || !inner.children.length) return null;
  inner.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(inner), hh = Math.max(0.01, box.max.y - box.min.y), ww = Math.max(0.01, box.max.x - box.min.x, box.max.z - box.min.z), s = Math.min(h / hh, (w * 1.15) / ww);
  inner.scale.setScalar(s); inner.position.y = -box.min.y * s;
  const outer = new THREE.Group(); outer.add(inner);
  return outer;
};
