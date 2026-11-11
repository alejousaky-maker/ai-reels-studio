// Our own flat cartoon icons/products (Canvas2D through the template's Pen: plum ink, flat fills, soft crescent).
// All drawn on a 400 x 400 canvas, centred, base at y ~360. Original drawings, no third-party art.
import { Pen, INK, mix, shade } from "../bridge/toon";
import type { ProductKind } from "./types";

type P2 = [number, number];
const rr = (x0: number, y0: number, x1: number, y1: number, r: number, n = 6): P2[] => {
  const pts: P2[] = [];
  for (const [cx, cy, a] of [[x1 - r, y0 + r, -90], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, 90], [x0 + r, y0 + r, 180]] as const)
    for (let i = 0; i <= n; i++) { const t = ((a + (90 * i) / n) * Math.PI) / 180; pts.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]); }
  return pts;
};
const ellP = (cx: number, cy: number, rx: number, ry: number, a0 = 0, a1 = 360, n = 40): P2[] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)] as P2; });

export const drawProduct = (p: Pen, kind: ProductKind, col = "#c8553d") => {
  const LIGHT = (-120 * Math.PI) / 180;
  switch (kind) {
    case "coffee": {
      p.ell(200, 352, 150, 28, "#f4efe6", 9);                                   // saucer
      const cup: P2[] = [[95, 170], [305, 170], [285, 330], [115, 330]];
      p.gradFill(cup, "#fbf7f0", "#d9d2c8", LIGHT); p.poly(cup, null, 10);
      p.poly([[103, 225], [297, 225], [291, 275], [109, 275]], col, 8);         // brand sleeve band
      p.arc(320, 245, 42, 46, -80, 80, 16);                                      // handle
      p.ell(200, 172, 105, 22, "#6b3e26", 9);                                   // coffee surface
      p.ell(185, 168, 40, 7, "#a8724a", 0);
      break;
    }
    case "croissant": {
      const segs = [[-2, 0.78], [-1, 0.92], [0, 1], [1, 0.92], [2, 0.78]];
      for (const [i, k] of segs) {
        const cx = 200 + i * 62, cy = 240 + Math.abs(i) * Math.abs(i) * 14;
        const pts = ellP(cx, cy, 48 * k, 70 * k);
        p.gradFill(pts, "#e9a64f", "#b86f2a", LIGHT); p.poly(pts, null, 9);
        p.arc(cx - 6, cy - 10, 22 * k, 30 * k, 200, 300, 5, mix("#e9a64f", INK, 0.35));
      }
      break;
    }
    case "bread": {
      const loaf = ellP(200, 250, 160, 95);
      p.gradFill(loaf, "#d9944a", "#9c5a26", LIGHT); p.poly(loaf, null, 10);
      for (const dx of [-80, -10, 60]) p.stroke([[200 + dx - 30, 205], [200 + dx + 30, 290]], 12, "#f2d29a");
      break;
    }
    case "cake": {
      const body: P2[] = [[80, 200], [320, 230], [320, 340], [80, 320]];
      p.gradFill(body, "#f6d7a8", "#d6ab72", LIGHT); p.poly(body, null, 9);
      p.poly([[80, 250], [320, 275], [320, 292], [80, 268]], col, 6);
      p.poly([[80, 200], [320, 230], [250, 150], [70, 170]], "#fdf3f6", 9);       // icing top
      p.ell(205, 150, 26, 24, "#d23b3b", 8);                                    // cherry
      break;
    }
    case "lightbulb": {
      const bulb = ellP(200, 170, 110, 115);
      p.shadedFill(bulb, "#fff3a6", "#f2c94c", LIGHT, 110); p.poly(bulb, null, 10);
      p.poly(rr(150, 270, 250, 340, 10), "#a9adb5", 9);
      for (const y of [292, 318]) p.stroke([[152, y], [248, y]], 6);
      p.stroke([[170, 230], [185, 170], [200, 220], [215, 170], [230, 230]], 7, "#c98a1c");
      for (const a of [-150, -120, -90, -60, -30]) { const t = (a * Math.PI) / 180; p.stroke([[200 + 140 * Math.cos(t), 170 + 140 * Math.sin(t)], [200 + 175 * Math.cos(t), 170 + 175 * Math.sin(t)]], 12, "#f2c94c"); }
      break;
    }
    case "question": case "exclaim": {
      const c = ellP(200, 200, 160, 160);
      p.poly(c, "#ffffff", 10);
      const g = p.g; g.fillStyle = kind === "question" ? "#3f6fb5" : "#d23b3b";
      g.font = "bold 250px Arial Black, Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText(kind === "question" ? "?" : "!", 200, 212);
      break;
    }
    case "heart": {
      const pts: P2[] = [];
      for (let i = 0; i <= 60; i++) { const t = (i / 60) * Math.PI * 2; pts.push([200 + 150 * Math.sin(t) ** 3, 190 - (120 * Math.cos(t) - 46 * Math.cos(2 * t) - 18 * Math.cos(3 * t) - 8 * Math.cos(4 * t))]); }
      p.shadedFill(pts, "#ef4f5f", "#b8283a", LIGHT, 150); p.poly(pts, null, 10);
      break;
    }
    case "clock": {
      const c = ellP(200, 200, 160, 160);
      p.poly(c, "#fbf7ee", 12);
      for (let i = 0; i < 12; i++) { const a = (i * Math.PI) / 6; p.stroke([[200 + 120 * Math.cos(a), 200 + 120 * Math.sin(a)], [200 + 140 * Math.cos(a), 200 + 140 * Math.sin(a)]], 10); }
      p.stroke([[200, 200], [200, 95]], 14); p.stroke([[200, 200], [272, 238]], 12); p.dot(200, 200, 14);
      break;
    }
    case "book": {
      p.poly([[60, 120], [200, 150], [200, 330], [60, 300]], "#f7f1e1", 9);
      p.poly([[340, 120], [200, 150], [200, 330], [340, 300]], "#efe6d2", 9);
      for (const k of [0, 1, 2, 3]) { p.stroke([[85, 170 + k * 32], [180, 190 + k * 32]], 5, "#9a8e7a"); p.stroke([[220, 190 + k * 32], [315, 170 + k * 32]], 5, "#9a8e7a"); }
      p.poly([[50, 300], [200, 340], [350, 300], [350, 316], [200, 356], [50, 316]], col, 8);
      break;
    }
    case "note": {
      p.ell(140, 300, 70, 50, "#1f2a44", 10, 0, 360, -20);
      p.stroke([[200, 285], [200, 60]], 18);
      p.poly([[200, 60], [300, 105], [300, 160], [200, 118]], "#1f2a44", 10);
      break;
    }
    case "scroll": {
      p.poly(rr(90, 90, 310, 320, 12), "#f3e3bd", 10);
      for (const y of [90, 320]) p.ell(200, y, 125, 22, shade("#f3e3bd", 0.85), 9);
      for (let k = 0; k < 5; k++) p.stroke([[125, 150 + k * 32], [275 - (k % 2) * 30, 150 + k * 32]], 7, "#8a7a5a");
      break;
    }
    case "map": {   // parchment map: coast blobs, dotted route, red X
      const sheet: P2[] = [[60, 110], [200, 90], [340, 110], [330, 320], [200, 300], [70, 320]];
      p.gradFill(sheet, "#f3e3bd", "#d8c08e", LIGHT); p.poly(sheet, null, 10);
      p.stroke([[200, 92], [200, 300]], 5, "#c9b07c");
      p.poly(ellP(130, 190, 45, 55, 0, 360, 18).map(([x, y], i) => [x + (i % 3) * 4, y] as P2), "#8cc06a", 6);
      p.poly(ellP(275, 230, 40, 35, 0, 360, 18).map(([x, y], i) => [x, y + (i % 4) * 3] as P2), "#8cc06a", 6);
      for (let i = 0; i < 7; i++) p.dot(160 + i * 15, 210 + 12 * Math.sin(i * 0.9), 5, "#8a3a2a");
      p.stroke([[262, 215], [288, 241]], 10, "#d23b3b"); p.stroke([[288, 215], [262, 241]], 10, "#d23b3b");
      break;
    }
    case "globe": {   // a small globe on a wooden stand
      p.poly([[150, 350], [250, 350], [230, 320], [170, 320]], "#8a5a3c", 9);
      p.stroke([[200, 320], [200, 290]], 14, "#8a5a3c");
      const g = ellP(200, 175, 120, 120);
      p.shadedFill(g, "#5fb2e0", "#2f7fb4", LIGHT, 120); p.poly(g, null, 10);
      p.poly(ellP(165, 140, 45, 38, 0, 360, 16), "#8cc06a", 6);
      p.poly(ellP(240, 205, 38, 48, 0, 360, 16), "#8cc06a", 6);
      p.arc(200, 175, 140, 140, 120, 300, 9, "#c9a227");
      break;
    }
    case "wine": {   // clay amphora / wine jug with a red splash at the lip
      const body: P2[] = [];
      for (let i = 0; i <= 30; i++) { const t = i / 30, y = 120 + 230 * t, w = 30 + 95 * Math.sin(Math.PI * Math.min(1, t * 1.05)) * (t < 0.15 ? t / 0.15 : 1); body.push([200 + w, y]); }
      for (let i = 30; i >= 0; i--) { const t = i / 30, y = 120 + 230 * t, w = 30 + 95 * Math.sin(Math.PI * Math.min(1, t * 1.05)) * (t < 0.15 ? t / 0.15 : 1); body.push([200 - w, y]); }
      p.gradFill(body, "#c8703e", "#8a4422", LIGHT); p.poly(body, null, 10);
      p.poly(rr(160, 80, 240, 125, 8), "#b8622f", 9);
      for (const s of [-1, 1]) p.arc(200 + s * 72, 150, 32, 40, s < 0 ? 100 : -100, s < 0 ? 260 : 80, 12);
      p.stroke([[110, 250], [290, 250]], 8, "#2b2b38");
      p.ell(200, 80, 34, 10, "#7a1f3a", 6);
      break;
    }
    case "spear": {   // bronze-tipped spear, diagonal
      p.stroke([[80, 340], [300, 90]], 16, "#8a5a34");
      p.stroke([[80, 340], [300, 90]], 6, "#a8784a");
      p.poly([[300, 90], [345, 40], [330, 110], [285, 120]].map(([x, y]) => [x, y] as P2), "#d9a441", 8);
      break;
    }
    case "phone": case "tablet": {   // glowing smartphone / tablet with a notification bubble
      const tab = kind === "tablet", w = tab ? 130 : 80, h = tab ? 160 : 150;
      p.poly(rr(200 - w, 200 - h, 200 + w, 200 + h, 26), "#1d1b22", 10);
      const scr = rr(200 - w + 14, 200 - h + 22, 200 + w - 14, 200 + h - 22, 10);
      p.gradFill(scr, "#8fd0ff", "#4f8fd1", LIGHT); p.poly(scr, null, 0);
      p.poly(rr(200 - w + 26, 200 - h + 50, 200 + w - 26, 200 - h + 120, 14), "#ffffff", 5);
      p.stroke([[200 - w + 44, 200 - h + 76], [200 + w - 60, 200 - h + 76]], 8, "#3f6fb5");
      p.stroke([[200 - w + 44, 200 - h + 98], [200 + w - 90, 200 - h + 98]], 8, "#9aa0a8");
      p.ell(200 + w - 8, 200 - h + 8, 30, 30, "#e2453c", 7);
      break;
    }
    case "wifi": {
      for (const [r2, k] of [[150, 0], [105, 1], [60, 2]] as const) p.arc(200, 300, r2, r2, 225, 315, 26, k === 0 ? "#3f6fb5" : k === 1 ? "#4f8fd1" : "#6fb0ea");
      p.ell(200, 300, 24, 24, "#3f6fb5", 8);
      break;
    }
    case "key": {   // big golden key
      p.ell(120, 200, 80, 80, "#e8b83a", 10); p.ell(120, 200, 34, 34, "#fff6dc", 8);
      p.poly([[190, 182], [360, 182], [360, 218], [190, 218]], "#e8b83a", 9);
      for (const x of [300, 340]) p.poly([[x - 14, 218], [x + 6, 218], [x + 6, 262], [x - 14, 262]], "#e8b83a", 8);
      break;
    }
    case "camera": {
      p.poly(rr(70, 130, 330, 310, 26), "#2b2b38", 10);
      p.poly(rr(120, 100, 200, 140, 8), "#2b2b38", 8);
      p.ell(200, 220, 70, 70, "#9aa0a8", 10); p.ell(200, 220, 42, 42, "#1d1b22", 8); p.ell(186, 206, 12, 12, "#ffffff", 0);
      p.ell(290, 160, 14, 14, "#e2453c", 5);
      break;
    }
    case "card": {   // credit card
      p.poly(rr(60, 110, 340, 290, 24), "#3f6fb5", 10);
      p.poly(rr(90, 160, 150, 205, 8), "#e8b83a", 6);
      p.stroke([[90, 245], [300, 245]], 12, "#cfe0ff");
      p.ell(280, 175, 26, 26, "#e2453c", 0); p.ell(305, 175, 26, 26, "rgba(242,201,76,0.9)", 0);
      break;
    }
    case "fish": {   // cardboard cut-out fish on a stick (a bit crude on purpose)
      p.stroke([[200, 390], [200, 250]], 12, "#8a5a34");
      const body: P2[] = [[60, 200], [140, 130], [260, 140], [320, 200], [260, 260], [140, 270]];
      p.poly(body, "#c9a66b", 10);
      p.poly([[60, 200], [10, 150], [10, 250]], "#c9a66b", 10);
      p.ell(280, 190, 14, 14, "#ffffff", 5); p.dot(283, 190, 6);
      for (const x of [150, 190, 230]) p.arc(x, 200, 22, 34, -60, 60, 5, "#8a6a42");
      break;
    }
    case "receipt": {   // long printed "BUSTED" receipt
      const pts: P2[] = [[110, 30], [290, 30], [290, 370]];
      for (let i = 0; i <= 8; i++) pts.push([290 - i * 22.5, 370 + (i % 2 ? -14 : 0)]);
      pts.push([110, 30]);
      p.poly(pts, "#fbf9f2", 9);
      for (let k = 0; k < 4; k++) p.stroke([[135, 70 + k * 26], [265 - (k % 2) * 40, 70 + k * 26]], 6, "#9aa0a8");
      const g = p.g; g.save(); g.translate(200, 250); g.rotate(-0.25); g.fillStyle = "#e2453c"; g.font = "bold 64px Arial Black, Arial"; g.textAlign = "center"; g.fillText("BUSTED", 0, 20); g.restore();
      break;
    }
    case "box": {   // cardboard moving box
      p.poly([[70, 160], [330, 160], [330, 350], [70, 350]], "#c9935a", 10);
      p.poly([[70, 160], [200, 110], [330, 160]], "#d9a86a", 9);
      p.poly([[180, 160], [220, 160], [220, 350], [180, 350]], "#e8c88a", 0);
      p.stroke([[100, 300], [160, 300]], 8, "#5a3b2a");
      break;
    }
    case "snake": {   // a cartoon cobra: S-curved tube body, hood, big eyes, tongue
      const pts: P2[] = [];
      for (let i = 0; i <= 30; i++) { const t = i / 30; pts.push([90 + 220 * t, 340 - 40 * Math.sin(t * Math.PI * 2.2) - 60 * t]); }
      p.stroke(pts, 40, INK); p.stroke(pts, 28, "#2b2b38");
      p.stroke([[300, 270], [300, 150]], 40, INK); p.stroke([[300, 270], [300, 150]], 28, "#2b2b38");
      p.ell(300, 130, 62, 54, "#2b2b38", 9);
      p.ell(300, 150, 30, 40, "#e8c46a", 0);
      for (const dx of [-22, 22]) { p.ell(300 + dx, 115, 15, 16, "#ffffff", 4); p.dot(300 + dx, 118, 7); }
      p.stroke([[300, 182], [300, 210], [288, 224]], 5, "#e2453c"); p.stroke([[300, 210], [312, 224]], 5, "#e2453c");
      break;
    }
    case "coins": {   // a chest spilling silver
      p.poly([[80, 220], [320, 220], [300, 350], [100, 350]], "#8a5a34", 10);
      p.poly([[80, 220], [320, 220], [300, 150], [100, 150]], "#a8784a", 9);
      for (const [x, y] of [[130, 205], [180, 190], [230, 200], [280, 210], [160, 225], [255, 230], [205, 175]]) p.ell(x, y, 28, 14, "#d9dde3", 6);
      p.poly([[190, 250], [210, 250], [210, 290], [190, 290]], "#e8b83a", 6);
      break;
    }
    case "mic": {
      p.poly(rr(160, 60, 240, 220, 40), "#9aa0a8", 10);
      for (let y = 90; y < 210; y += 26) p.stroke([[170, y], [230, y]], 5, "#5a5f6a");
      p.arc(200, 190, 70, 70, 0, 180, 12); p.stroke([[200, 260], [200, 330]], 14); p.stroke([[150, 335], [250, 335]], 14);
      break;
    }
    case "earbuds": {   // two white wireless earbuds
      for (const [x, s] of [[140, -1], [260, 1]] as const) {
        p.ell(x, 170, 50, 46, "#ffffff", 9);
        p.poly([[x - 14, 200], [x + 14, 200], [x + 12 + s * 6, 330], [x - 12 + s * 6, 330]], "#ffffff", 9);
        p.ell(x + s * 18, 160, 14, 14, "#2b2b38", 0);
      }
      break;
    }
    case "gpsmap": {   // dark-mode map: streets, a red route ending at a pink house, a pin
      p.poly(rr(40, 60, 360, 340, 22), "#1f2a3a", 10);
      for (const x of [100, 180, 260, 330]) p.stroke([[x, 70], [x, 330]], 9, "#3a4a60");
      for (const y of [120, 200, 280]) p.stroke([[50, y], [350, y]], 9, "#3a4a60");
      p.stroke([[100, 320], [100, 200], [260, 200], [260, 135]], 12, "#ff4a4a");
      p.poly([[235, 135], [285, 135], [285, 95], [260, 75], [235, 95]], "#ff8fc0", 6);
      p.ell(260, 160, 16, 16, "#ff4a4a", 5);
      break;
    }
    case "suitcase": {
      p.poly(rr(90, 130, 310, 340, 22), "#3f6fb5", 10);
      p.poly(rr(160, 90, 240, 135, 12), null, 10);
      for (const x of [140, 260]) p.stroke([[x, 140], [x, 330]], 8, "#2f5a96");
      p.ell(130, 350, 14, 14, "#2b2b38", 0); p.ell(270, 350, 14, 14, "#2b2b38", 0);
      break;
    }
    case "folder": {   // a manila folder stamped DEFEAT
      p.poly([[60, 110], [170, 110], [190, 140], [340, 140], [340, 330], [60, 330]], "#e8c88a", 10);
      const g = p.g; g.save(); g.translate(200, 245); g.rotate(-0.2); g.strokeStyle = "#d23b3b"; g.lineWidth = 8; g.strokeRect(-120, -45, 240, 90);
      g.fillStyle = "#d23b3b"; g.font = "bold 58px Arial Black, Arial"; g.textAlign = "center"; g.fillText("DEFEAT", 0, 20); g.restore();
      break;
    }
    case "ticket": {   // plane ticket
      p.poly(rr(50, 130, 350, 280, 16), "#ffffff", 9);
      p.poly([[50, 130], [140, 130], [140, 280], [50, 280]], "#3f6fb5", 0);
      p.poly(rr(50, 130, 350, 280, 16), null, 9);
      p.poly([[210, 205], [300, 180], [310, 192], [250, 212], [300, 240], [290, 250], [230, 222], [205, 228]], "#2b2b38", 0);
      break;
    }
    case "controller": {   // a generic game controller (no brand)
      const body: P2[] = [];
      for (let i = 0; i <= 40; i++) { const a = (i / 40) * Math.PI * 2, x = 200 + 160 * Math.cos(a), y = 210 + 80 * Math.sin(a) + (Math.sin(a) > 0 ? 60 * Math.abs(Math.cos(a)) ** 3 : 0); body.push([x, y]); }
      p.gradFill(body, "#f2f2f5", "#c9ccd2", LIGHT); p.poly(body, null, 10);
      p.poly([[100, 200], [150, 200], [150, 215], [100, 215]], "#2b2b38", 0); p.poly([[118, 182], [133, 182], [133, 232], [118, 232]], "#2b2b38", 0);
      for (const [x, y, c] of [[290, 180, "#39d98a"], [320, 210, "#e2453c"], [260, 210, "#3f6fb5"], [290, 240, "#ffd23f"]] as const) p.ell(x, y, 14, 14, c, 4);
      p.ell(170, 250, 22, 22, "#2b2b38", 4); p.ell(235, 250, 22, 22, "#2b2b38", 4);
      p.stroke([[170, 130], [230, 130]], 10, "#39d9ff");
      break;
    }
    case "can": {   // energy drink can
      p.poly(rr(140, 70, 260, 350, 22), "#39d98a", 10);
      p.poly([[140, 150], [260, 120], [260, 170], [140, 200]], "#1d1b22", 0);
      p.stroke([[170, 260], [230, 230]], 12, "#ffffff"); p.ell(200, 76, 56, 12, "#c9ccd2", 6);
      break;
    }
    case "pizza": {   // an open pizza box with a slice missing
      p.poly([[50, 220], [350, 220], [350, 330], [50, 330]], "#f2e6cf", 9);
      p.poly([[50, 220], [350, 220], [320, 90], [80, 90]], "#e6d6b8", 9);
      p.ell(200, 275, 130, 42, "#f2b84a", 8);
      for (const [x, y] of [[150, 270], [200, 285], [250, 265], [175, 255]]) p.ell(x, y, 14, 9, "#c8323a", 0);
      p.poly([[200, 275], [330, 270], [300, 300]], "#f2e6cf", 0);
      break;
    }
    case "stake": {   // sharpened olive-wood stake, tip glowing
      p.stroke([[60, 330], [320, 110]], 30, "#7a5a34");
      p.poly([[320, 110], [372, 66], [340, 132]], "#a8784a", 8);
      p.ell(352, 90, 34, 30, "rgba(255,150,40,0.85)", 0);
      p.ell(352, 90, 16, 14, "#fff1a0", 0);
      break;
    }
    case "thermometer": {   // glass thermometer, red line maxed out
      p.poly(rr(170, 40, 230, 320, 28), "#eef6fb", 9);
      p.ell(200, 330, 44, 44, "#e2453c", 9);
      p.poly([[192, 90], [208, 90], [208, 320], [192, 320]], "#e2453c", 0);
      for (let y = 100; y < 300; y += 30) p.stroke([[215, y], [228, y]], 4);
      break;
    }
    case "moth": {   // a dusty moth fluttering out of an empty pocket
      for (const s of [-1, 1]) { p.ell(200 + s * 80, 170, 80, 60, "#b8ab94", 8); p.ell(200 + s * 60, 250, 50, 40, "#a39780", 8); p.ell(200 + s * 85, 165, 18, 14, "#8a7f6a", 0); }
      p.ell(200, 210, 22, 70, "#6b604f", 8);
      for (const s of [-1, 1]) p.stroke([[195, 150], [195 + s * 50, 90]], 5);
      break;
    }
    case "cash": {   // a fat banded stack of bills
      for (let k = 0; k < 4; k++) p.poly([[70 + k * 6, 260 - k * 34], [330 + k * 6, 260 - k * 34], [330 + k * 6, 300 - k * 34], [70 + k * 6, 300 - k * 34]], k % 2 ? "#5fae5a" : "#79c472", 7);
      p.poly([[180, 150], [230, 150], [230, 300], [180, 300]], "#f2e6cf", 6);
      p.ell(130, 165, 22, 14, "#3f7a3a", 0); p.ell(290, 165, 22, 14, "#3f7a3a", 0);
      break;
    }
    case "noodles": {   // instant noodle cup with a fork
      p.poly([[90, 140], [310, 140], [280, 350], [120, 350]], "#f7f5f0", 9);
      p.poly([[98, 190], [302, 190], [295, 240], [105, 240]], "#e2453c", 0);
      for (let k = 0; k < 7; k++) p.arc(130 + k * 24, 130, 18, 22, 180, 360, 6, "#f2d29a");
      p.stroke([[250, 140], [300, 40]], 9, "#c9ccd2");
      break;
    }
    case "extinguisher": {
      p.poly(rr(140, 110, 260, 360, 40), "#e2453c", 10);
      p.poly([[175, 60], [225, 60], [225, 110], [175, 110]], "#2b2b38", 7);
      p.stroke([[225, 75], [300, 70], [320, 120]], 12, "#2b2b38");
      p.poly([[160, 200], [240, 200], [240, 250], [160, 250]], "#f2efe8", 5);
      break;
    }
    case "potato": {   // a raw potato with an ethernet cable plugged in
      p.ell(190, 230, 140, 100, "#c8a06a", 9);
      for (const [x, y] of [[120, 200], [210, 270], [260, 200]]) p.ell(x, y, 8, 6, "#8a6a3a", 0);
      p.poly([[300, 200], [345, 200], [345, 240], [300, 240]], "#3f6fb5", 6);
      p.stroke([[345, 220], [390, 160]], 9, "#3f6fb5");
      break;
    }
    case "battery": {   // car battery with clamps
      p.poly(rr(70, 150, 330, 340, 14), "#2b2b38", 10);
      p.poly([[95, 120], [145, 120], [145, 150], [95, 150]], "#e2453c", 6); p.poly([[255, 120], [305, 120], [305, 150], [255, 150]], "#c9ccd2", 6);
      p.stroke([[150, 250], [250, 250]], 12, "#ffd23f"); p.stroke([[200, 200], [200, 300]], 12, "#ffd23f");
      break;
    }
    case "diploma": {   // rolled diploma with a red ribbon
      p.poly([[70, 170], [330, 140], [340, 240], [80, 270]], "#f6efe0", 9);
      p.ell(75, 220, 22, 52, "#e9dfc6", 7); p.ell(335, 190, 22, 52, "#e9dfc6", 7);
      p.poly([[190, 155], [220, 152], [228, 255], [198, 258]], "#c8323a", 4);
      break;
    }
    case "sicknote": {   // pre-signed doctor's note with a red cross
      p.poly([[90, 60], [310, 60], [310, 360], [90, 360]], "#ffffff", 9);
      p.poly([[185, 90], [215, 90], [215, 120], [245, 120], [245, 150], [215, 150], [215, 180], [185, 180], [185, 150], [155, 150], [155, 120], [185, 120]], "#e2453c", 4);
      for (let y = 210; y < 300; y += 26) p.stroke([[120, y], [280, y]], 5, "#9aa4ad");
      p.stroke([[150, 330], [180, 310], [200, 335], [240, 305], [270, 330]], 6, "#2f4a9a");
      break;
    }
    case "router": {   // wifi router with antennas
      p.poly(rr(70, 230, 330, 320, 16), "#2b2b38", 10);
      for (const x of [110, 290]) p.stroke([[x, 235], [x + (x < 200 ? -20 : 20), 100]], 12, "#2b2b38");
      for (let k = 0; k < 5; k++) p.ell(130 + k * 35, 285, 7, 7, k < 3 ? "#39d98a" : "#ffd23f", 0);
      break;
    }
    case "newspaper": {   // folded broadsheet with a headline and columns
      p.poly([[60, 90], [340, 70], [350, 330], [70, 350]], "#f2efe8", 9);
      p.poly([[85, 110], [320, 95], [323, 150], [88, 165]], "#2b2b38", 0);
      for (let k = 0; k < 6; k++) { p.stroke([[95, 190 + k * 22], [200, 183 + k * 22]], 6, "#9aa4ad"); p.stroke([[220, 182 + k * 22], [325, 175 + k * 22]], 6, "#9aa4ad"); }
      break;
    }
    case "pickaxe": {
      p.stroke([[110, 360], [270, 110]], 22, "#8a5a34");
      p.poly([[120, 90], [200, 60], [330, 90], [400, 170], [300, 120], [210, 100], [130, 130]], "#9aa4ad", 9);
      break;
    }
    case "shovel": {   // a tiny plastic shovel
      p.stroke([[200, 40], [200, 250]], 18, "#ff7a1a");
      p.poly([[140, 250], [260, 250], [250, 330], [200, 370], [150, 330]], "#ffd23f", 9);
      p.poly([[160, 30], [240, 30], [240, 60], [160, 60]], "#ff7a1a", 7);
      break;
    }
    case "bagel": {
      p.ell(200, 220, 160, 120, "#d9944a", 10); p.ell(200, 220, 50, 34, "#ffffff", 8);
      for (let k = 0; k < 18; k++) { const a = k * 0.35; p.ell(200 + 120 * Math.cos(a), 220 + 80 * Math.sin(a), 6, 3, "#f7efe0", 0); }
      p.ell(250, 180, 30, 14, "rgba(255,255,255,0.35)", 0);
      break;
    }
    case "lettuce": {
      for (let k = 0; k < 7; k++) { const a = (k / 7) * Math.PI * 2; p.ell(200 + 70 * Math.cos(a), 220 + 50 * Math.sin(a), 90, 70, k % 2 ? "#7cc46a" : "#5fae5a", 7); }
      p.ell(200, 220, 70, 55, "#a8dd8e", 7);
      break;
    }
    case "pillow": {
      p.poly([[50, 140], [200, 110], [350, 140], [360, 290], [200, 320], [40, 290]], "#f2efe8", 10);
      p.stroke([[120, 200], [280, 200]], 5, "#c9ccd2");
      break;
    }
    case "wrench": {
      p.stroke([[110, 330], [280, 130]], 34, "#9aa4ad"); p.stroke([[110, 330], [280, 130]], 18, "#c9ccd2");
      p.poly([[250, 70], [330, 90], [350, 170], [300, 150], [280, 110]], "#9aa4ad", 9);
      break;
    }
    case "check": {   // a giant signed cheque
      p.poly([[30, 120], [370, 120], [370, 300], [30, 300]], "#e6f2dc", 9);
      p.stroke([[60, 170], [200, 170]], 8, "#3f7a3a"); p.stroke([[60, 260], [340, 260]], 5, "#3a3d47");
      const g = p.g; g.fillStyle = "#3f7a3a"; g.font = "bold 46px Arial Black, Arial"; g.textAlign = "right"; g.fillText("$1,000,000,000", 360, 230);
      p.stroke([[220, 290], [260, 270], [290, 292], [330, 265]], 5, "#2f4a9a");
      break;
    }
    case "trident": {   // Neptune's golden trident
      p.stroke([[200, 380], [200, 120]], 18, "#e8b83a");
      p.stroke([[120, 140], [120, 60]], 16, "#e8b83a"); p.stroke([[280, 140], [280, 60]], 16, "#e8b83a"); p.stroke([[200, 120], [200, 30]], 16, "#e8b83a");
      p.stroke([[110, 140], [290, 140]], 18, "#e8b83a");
      for (const x of [120, 200, 280]) p.poly([[x - 18, x === 200 ? 40 : 70], [x, x === 200 ? 0 : 30], [x + 18, x === 200 ? 40 : 70]], "#ffd23f", 6);
      break;
    }
    case "clipboard": {
      p.poly(rr(90, 60, 310, 370, 14), "#a8784a", 9);
      p.poly([[115, 100], [285, 100], [285, 350], [115, 350]], "#ffffff", 6);
      p.poly(rr(160, 40, 240, 90, 10), "#9aa4ad", 7);
      for (let k = 0; k < 6; k++) p.stroke([[135, 140 + k * 34], [265, 140 + k * 34]], 6, "#9aa4ad");
      break;
    }
    case "gavel": {   // judge's wooden gavel
      p.stroke([[120, 340], [250, 170]], 26, "#8a5a34");
      p.poly(rr(170, 60, 370, 170, 20), "#7a4f33", 10);
      p.poly([[210, 60], [235, 60], [235, 170], [210, 170]], "#e8b83a", 4); p.poly([[305, 60], [330, 60], [330, 170], [305, 170]], "#e8b83a", 4);
      break;
    }
    case "envelope": {   // a lawsuit envelope with a red stamp
      p.poly([[40, 110], [360, 110], [360, 320], [40, 320]], "#f2efe8", 9);
      p.stroke([[40, 110], [200, 230], [360, 110]], 8);
      p.poly([[90, 250], [310, 230], [314, 290], [94, 310]], "rgba(226,69,60,0.9)", 5);
      const g = p.g; g.save(); g.translate(200, 280); g.rotate(-0.08); g.fillStyle = "#ffffff"; g.font = "bold 30px Arial Black, Arial"; g.textAlign = "center"; g.fillText("LAWSUIT", 0, 10); g.restore();
      break;
    }
    case "cutlass": {   // pirate cutlass: curved blade, gold guard
      p.poly([[90, 330], [110, 300], [300, 80], [330, 60], [318, 100], [135, 320]], "#d9dde3", 8);
      p.stroke([[110, 300], [300, 85]], 3, "#ffffff");
      p.arc(110, 320, 50, 40, 180, 360, 10, "#e8b83a");
      p.stroke([[60, 380], [105, 325]], 22, "#5a3b2a");
      break;
    }
    case "plug": {   // a power strip plug held like a live grenade (cable + sparks)
      p.poly(rr(120, 140, 280, 300, 24), "#f2efe8", 9);
      for (const x of [170, 230]) p.poly([[x - 9, 60], [x + 9, 60], [x + 9, 140], [x - 9, 140]], "#c9a227", 6);
      p.stroke([[200, 300], [210, 360], [160, 390]], 16, "#2b2b38");
      for (const [x, y] of [[120, 60], [290, 70], [210, 30]] as const) p.poly([[x, y], [x + 18, y + 10], [x + 6, y + 14], [x + 22, y + 30], [x - 4, y + 16], [x + 4, y + 12]], "#ffe14d", 4);
      break;
    }
    case "fryingpan": {   // a frying pan in cartoon flames
      for (let k = 0; k < 5; k++) { const x = 90 + k * 50; p.poly([[x - 30, 200], [x, 40 + (k % 2) * 40], [x + 30, 200]], "#ff7a1a", 6); p.poly([[x - 14, 200], [x, 110 + (k % 2) * 30], [x + 14, 200]], "#ffe14d", 0); }
      p.ell(190, 230, 140, 45, "#2b2b38", 10); p.ell(190, 222, 118, 32, "#4a4f5a", 0);
      p.stroke([[320, 240], [395, 270]], 22, "#5a3b2a");
      break;
    }
    case "plate": {   // a white ceramic plate with a blue rim
      p.ell(200, 220, 165, 70, "#ffffff", 10); p.ell(200, 220, 120, 48, "#f2efe8", 4); p.ell(200, 220, 150, 62, null, 4, 0, 360);
      p.arc(200, 220, 158, 66, 0, 360, 6, "#3f6fb5");
      break;
    }
    case "grass": {   // one tiny blade of grass held like an alien artifact (with a sparkle)
      p.poly([[190, 380], [200, 120], [215, 60], [212, 140], [214, 380]], "#5fae5a", 8);
      p.poly([[200, 380], [150, 200], [205, 300]], "#79c472", 6);
      for (const [x, y] of [[260, 90], [140, 120]] as const) { p.stroke([[x - 16, y], [x + 16, y]], 5, "#ffe14d"); p.stroke([[x, y - 16], [x, y + 16]], 5, "#ffe14d"); }
      break;
    }
    case "magnifier": {   // detective magnifying glass
      p.stroke([[250, 250], [360, 370]], 30, "#5a3b2a");
      p.ell(180, 180, 120, 120, "rgba(190,230,255,0.45)", 14); p.arc(180, 180, 120, 120, 0, 360, 14, "#2b2b38");
      p.arc(150, 150, 70, 70, 200, 260, 10, "rgba(255,255,255,0.8)");
      break;
    }
    case "usb": {   // a glowing golden USB stick
      p.ell(200, 200, 150, 150, "rgba(255,210,63,0.25)", 0);
      p.poly(rr(110, 120, 260, 300, 24), "#e8b83a", 9); p.poly([[260, 160], [330, 160], [330, 260], [260, 260]], "#c9ccd2", 8);
      p.poly([[280, 185], [300, 185], [300, 205], [280, 205]], "#2b2b38", 0); p.poly([[280, 215], [300, 215], [300, 235], [280, 235]], "#2b2b38", 0);
      p.stroke([[140, 160], [230, 160]], 8, "#fff3c0");
      break;
    }
    case "poolring": {   // inflatable pool ring
      p.ell(200, 220, 170, 100, "#ff6fa8", 10); p.ell(200, 220, 80, 44, "#9fd4ff", 8);
      for (const a of [0.4, 1.9, 3.4, 4.9]) p.arc(200, 220, 125, 72, (a * 180) / Math.PI, (a * 180) / Math.PI + 30, 22, "#ffffff");
      break;
    }
    case "flamingo": {   // pink lawn flamingo
      p.stroke([[200, 380], [200, 250]], 8, "#2b2b38"); p.stroke([[220, 380], [210, 260]], 8, "#2b2b38");
      p.ell(210, 220, 90, 60, "#ff7aa8", 9);
      p.stroke([[270, 200], [300, 110], [270, 60]], 20, "#ff7aa8"); p.ell(270, 60, 26, 22, "#ff7aa8", 7);
      p.poly([[285, 60], [330, 70], [300, 90]], "#2b2b38", 4); p.dot(265, 55, 5);
      break;
    }
    case "badge": {   // a gold agent badge on a black wallet
      p.poly(rr(60, 90, 340, 320, 20), "#1d1b22", 9);
      const st: P2[] = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r2 = i % 2 ? 45 : 95; st.push([200 + Math.cos(a) * r2, 205 + Math.sin(a) * r2]); }
      p.poly(st, "#e8b83a", 7); p.ell(200, 205, 30, 30, "#c9a227", 4);
      break;
    }
    case "goldcoin": {   // a big glowing gold token with a skull
      p.ell(200, 200, 160, 160, "#ffd23f", 10); p.ell(200, 200, 125, 125, "#f2b84a", 6);
      p.ell(200, 185, 55, 50, "#fff3c0", 6); p.dot(180, 180, 12, "#5a3b2a"); p.dot(220, 180, 12, "#5a3b2a");
      p.stroke([[150, 270], [250, 240]], 12, "#fff3c0"); p.stroke([[150, 240], [250, 270]], 12, "#fff3c0");
      break;
    }
    default: break;
  }
};

/** liquid splash crown on an 800 x 800 canvas (any colour: water, molasses, mud, chocolate); t in 0..1 */
export const drawSplash = (p: Pen, t: number, col: string) => {
  const c = 400, size = 800, rise = Math.sin(Math.min(1, t * 1.3) * Math.PI), light = mix(col, "#ffffff", 0.35), deep = shade(col, 0.75);
  if (rise > 0.02) {
    const pts: P2[] = [];
    for (let i = 0; i < 19; i++) { const h = (i % 2 ? 300 : 150) * rise * (0.7 + 0.3 * Math.sin(i * 1.7)); pts.push([c - 340 + (680 * i) / 18, size - 120 - h]); }
    p.poly([...pts, [c + 340, size - 90], [c - 340, size - 90]], light, 10);
    p.ell(c, size - 100, 370, 48, deep, 10);
  }
  for (let i = 0; i < 9; i++) {
    const a = ((200 + i * 17) * Math.PI) / 180, d = 120 + 380 * t, y = size - 160 + d * Math.sin(a) + 520 * t * t, r = 28 * (1 - t) + 6;
    if (t > 0.08 && y < size - 40) p.ell(c + d * Math.cos(a), y, r, r * 1.25, light, 7);
  }
};

/** shop sign on a 1024 x 320 canvas: rounded board in brand colours + the brand name (user-supplied text only) */
export const drawSign = (g: CanvasRenderingContext2D, name: string, primary: string, secondary: string, text: string, tagline?: string) => {
  const p = new Pen(g);
  p.poly(rr(16, 16, 1008, 304, 48), primary, 0);
  p.poly(rr(40, 40, 984, 280, 34), null, 10);
  g.save();
  g.fillStyle = text; g.textAlign = "center"; g.textBaseline = "middle";
  let size = 150;
  const font = (s: number) => `bold ${s}px "Trebuchet MS", "Segoe UI", Arial, sans-serif`;
  g.font = font(size);
  while (g.measureText(name).width > 860 && size > 40) { size -= 6; g.font = font(size); }
  g.fillText(name, 512, tagline ? 140 : 162);
  if (tagline) { g.font = `600 52px "Trebuchet MS", "Segoe UI", Arial, sans-serif`; g.fillStyle = secondary; g.fillText(tagline, 512, 238); }
  g.restore();
};

/** striped awning on a 512 x 256 canvas */
export const drawAwning = (g: CanvasRenderingContext2D, a: string, b: string) => {
  for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect(i * 64, 0, 64, 220); }
  const p = new Pen(g);
  for (let i = 0; i < 8; i++) p.ell(i * 64 + 32, 220, 32, 30, i % 2 ? b : a, 0, 0, 180);
  g.fillStyle = "rgba(0,0,0,0.12)"; g.fillRect(0, 0, 512, 24);
};
