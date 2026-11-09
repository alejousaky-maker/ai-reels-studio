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
    default: break;
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
