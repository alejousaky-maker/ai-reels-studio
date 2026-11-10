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
