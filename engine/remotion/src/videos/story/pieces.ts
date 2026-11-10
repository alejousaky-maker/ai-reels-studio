// Big painted set pieces (our own drawings): lit Canvas2D cards in the world, like the cast, always turned to the
// camera and drawn in side view facing screen-right (mirror for leftward). Base of the card = ground (y 0).
// Each piece: design canvas dw x dh units, world size w x h metres.
import { Pen, INK, mix, shade } from "../bridge/toon";
import type { PieceKind } from "./types";

type P2 = [number, number];
const LIGHT = (-120 * Math.PI) / 180;
const ellP = (cx: number, cy: number, rx: number, ry: number, a0 = 0, a1 = 360, n = 40): P2[] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)] as P2; });
const rr = (x0: number, y0: number, x1: number, y1: number, r: number): P2[] => {
  const pts: P2[] = [];
  for (const [cx, cy, a] of [[x1 - r, y0 + r, -90], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, 90], [x0 + r, y0 + r, 180]] as const)
    for (let i = 0; i <= 6; i++) { const t = ((a + 15 * i) * Math.PI) / 180; pts.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]); }
  return pts;
};

const WOOD = "#c08a52", WOOD_D = "#8a5a34";

const wheel = (p: Pen, x: number, y: number, r: number) => {
  p.ell(x, y, r, r, "#7a4e2c", 9);
  p.ell(x, y, r * 0.3, r * 0.3, "#5a3b2a", 6);
  for (let k = 0; k < 6; k++) { const a = (k * Math.PI) / 3; p.stroke([[x + 0.3 * r * Math.cos(a), y + 0.3 * r * Math.sin(a)], [x + 0.9 * r * Math.cos(a), y + 0.9 * r * Math.sin(a)]], 7); }
};

/** the wooden horse on its wheeled platform (side view, facing right) */
const horse = (p: Pen) => {
  // platform + wheels
  p.poly(rr(120, 860, 880, 915, 10), WOOD_D, 10);
  for (const x of [210, 400, 600, 790]) wheel(p, x, 935, 52);
  // legs (back pair darker = far side)
  for (const [x, far] of [[300, true], [640, true], [360, false], [700, false]] as const) {
    const c = far ? shade(WOOD, 0.75) : WOOD;
    p.poly([[x - 30, 560], [x + 30, 560], [x + 24, 860], [x - 24, 860]], c, 9);
    p.poly(rr(x - 32, 820, x + 32, 862, 6), shade(c, 0.7), 7);
  }
  // tail
  for (let k = 0; k < 4; k++) p.stroke([[250, 430 + k * 8], [210 - k * 10, 520 + k * 10], [200 - k * 6, 640 + k * 12]], 12, "#6b4a2a");
  // body barrel with planks and a hatch
  const body = ellP(500, 470, 275, 130);
  p.gradFill(body, WOOD, shade(WOOD, 0.72), LIGHT);
  p.clip(body, () => {
    for (let y = 360; y < 600; y += 34) p.stroke([[220, y], [780, y + 6]], 4, "rgba(80,50,30,0.55)");
    for (let x = 280; x < 760; x += 70) for (let y = 375; y < 600; y += 68) p.dot(x + ((y / 34) % 2) * 30, y, 5, "#4a3020");
  });
  p.poly(body, null, 11);
  p.poly(rr(430, 425, 545, 505, 6), null, 6);
  p.dot(530, 465, 6);
  // neck + head
  const neck: P2[] = [[640, 470], [730, 420], [800, 200], [720, 175], [660, 300], [600, 400]];
  p.gradFill(neck, WOOD, shade(WOOD, 0.72), LIGHT); p.poly(neck, null, 11);
  for (let i = 0; i < 6; i++) p.poly([[705 - i * 14, 185 + i * 40], [672 - i * 14, 200 + i * 40], [690 - i * 14, 225 + i * 40]], "#6b4a2a", 6);   // mane
  const head: P2[] = [[715, 160], [800, 130], [930, 200], [945, 255], [900, 275], [800, 245], [735, 240]];
  p.gradFill(head, WOOD, shade(WOOD, 0.72), LIGHT); p.poly(head, null, 11);
  p.poly([[745, 145], [770, 80], [795, 140]], WOOD, 9);                                            // ear
  p.ell(805, 185, 16, 16, "#ffffff", 6); p.dot(810, 187, 8);                                         // eye
  p.dot(925, 238, 7);                                                                                 // nostril
  p.stroke([[880, 262], [920, 258]], 6);
};

/** caravel (Columbus-era): high stern castle, three masts, square sails with red crosses, a lateen at the back */
const ship = (p: Pen, galley = false) => {
  const hullTop = 900, wl = 1180;
  // sails behind the hull
  if (!galley) {
    for (const [x, top, w, h] of [[640, 300, 300, 330], [930, 420, 210, 230]] as const) {
      p.stroke([[x, hullTop], [x, top - 80]], 16, WOOD_D);
      const sl: P2[] = [[x - w / 2, top], [x + w / 2, top], [x + w / 2 + 18, top + h / 2], [x + w / 2, top + h], [x - w / 2, top + h], [x - w / 2 + 18, top + h / 2]];
      p.gradFill(sl, "#f6efdc", "#d9cfb6", LIGHT); p.poly(sl, null, 9);
      p.poly([[x - 22, top + 30], [x + 22, top + 30], [x + 22, top + h - 30], [x - 22, top + h - 30]], "#c8323a", 0);
      p.poly([[x - w / 2 + 34, top + h / 2 - 22], [x + w / 2 - 34, top + h / 2 - 22], [x + w / 2 - 34, top + h / 2 + 22], [x - w / 2 + 34, top + h / 2 + 22]], "#c8323a", 0);
      p.stroke([[x - w / 2 - 10, top], [x + w / 2 + 10, top]], 12, WOOD_D);
      p.poly([[x, top - 80], [x + 70, top - 62], [x, top - 44]], "#c8323a", 6);                       // pennant
    }
    p.stroke([[300, hullTop - 120], [300, 380]], 13, WOOD_D);                                         // mizzen + lateen
    p.poly([[300, 380], [430, 720], [190, 690]], "#f1e8d2", 9);
  } else {
    p.stroke([[600, hullTop], [600, 330]], 18, WOOD_D);
    const sl: P2[] = [[400, 360], [800, 360], [790, 720], [410, 720]];
    p.gradFill(sl, "#f6efdc", "#d9cfb6", LIGHT);
    p.clip(sl, () => { for (let k = 0; k < 4; k++) p.poly([[380, 400 + k * 85], [820, 400 + k * 85], [820, 432 + k * 85], [380, 432 + k * 85]], "#c8553d", 0); });
    p.poly(sl, null, 9);
    p.stroke([[380, 360], [820, 360]], 12, WOOD_D);
  }
  // hull
  const hull: P2[] = galley
    ? [[80, 820], [200, hullTop], [1000, hullTop], [1120, 760], [1150, 700], [1110, 820], [1040, 1010], [190, 1010]]
    : [[60, 680], [330, 690], [340, 860], [1000, 860], [1140, 800], [1080, 960], [980, 1040], [200, 1040], [90, 900]];
  p.gradFill(hull, "#8a5a34", "#5e3a20", LIGHT);
  p.clip(hull, () => {
    for (let y = 700; y < 1050; y += 38) p.stroke([[40, y], [1160, y]], 4, "rgba(40,25,15,0.5)");
    p.poly([[40, 925], [1160, 925], [1160, 955], [40, 955]], galley ? "#3f6fb5" : "#e8b83a", 0);
  });
  p.poly(hull, null, 12);
  if (galley) {
    for (let x = 260; x <= 940; x += 85) p.stroke([[x, 960], [x - 60, 1150]], 9, WOOD_D);             // oars
    p.ell(1060, 860, 22, 22, "#ffffff", 6); p.dot(1066, 860, 10);                                       // painted eye on the prow
  } else {
    for (let x = 420; x <= 900; x += 120) p.ell(x, 900, 18, 18, "#3a2f2a", 6);                          // ports
    p.poly([[1140, 800], [1240, 740], [1150, 790]], WOOD_D, 7);                                         // bowsprit
  }
  // waterline wash so the base can sink below the sea
  void wl;
};

const chalkboard = (p: Pen) => {
  for (const [a, b] of [[[130, 740], [210, 120]], [[470, 740], [390, 120]], [[300, 760], [300, 140]]] as [P2, P2][]) p.stroke([a, b], 18, WOOD_D);
  p.poly(rr(70, 120, 530, 520, 10), "#8a5a34", 10);
  p.poly(rr(95, 145, 505, 495, 6), "#2f5a46", 6);
  // badly drawn chalk horse + arrows
  const w = "#f4f1ea";
  p.stroke([[170, 360], [200, 300], [330, 300], [360, 360], [170, 360]], 7, w);                        // body
  p.stroke([[330, 300], [370, 220], [420, 230], [400, 260], [365, 255]], 7, w);                        // neck + head
  for (const x of [190, 230, 300, 340]) p.stroke([[x, 360], [x + 3, 430]], 6, w);                      // legs
  p.stroke([[160, 440], [370, 440]], 6, w);
  for (const x of [190, 340]) { p.ell(x, 455, 16, 16, null, 0); p.arc(x, 455, 16, 16, 0, 360, 5, w); }
  p.stroke([[150, 310], [130, 380]], 6, w);                                                             // tail
  p.arc(255, 330, 26, 18, 0, 360, 4, w);                                                                // hatch
  p.stroke([[430, 330], [470, 300], [470, 330]], 5, w);
  const g = p.g; g.fillStyle = w; g.font = "bold 46px Comic Sans MS, Arial"; g.textAlign = "left"; g.fillText("PLAN", 120, 200);
  g.font = "bold 34px Comic Sans MS, Arial"; g.fillText("100% safe", 330, 470);
};

const sheep = (p: Pen) => {
  for (const x of [150, 200, 300, 350]) p.stroke([[x, 260], [x, 360]], 16, INK);
  const wool: P2[] = [];
  for (let i = 0; i <= 36; i++) { const a = (i / 36) * Math.PI * 2, bump = 1 + 0.08 * Math.sin(a * 9); wool.push([250 + 170 * Math.cos(a) * bump, 200 + 95 * Math.sin(a) * bump]); }
  p.shadedFill(wool, "#fbf7ef", "#d9d2c6", LIGHT, 170); p.poly(wool, null, 9);
  for (const [x, y] of [[200, 170], [270, 150], [320, 210], [230, 230]]) p.arc(x, y, 22, 16, 200, 340, 4, "#cfc6b6");
  p.ell(420, 165, 52, 42, "#2b2b38", 8);
  p.ell(400, 130, 30, 14, "#2b2b38", 6, 0, 360, -30);
  p.ell(440, 155, 9, 9, "#ffffff", 0); p.dot(443, 156, 4);
};

const tent = (p: Pen) => {
  const body: P2[] = [[80, 620], [450, 90], [820, 620]];
  p.gradFill(body, "#efe3c6", "#cbbb98", LIGHT);
  p.clip(body, () => { for (let k = 0; k < 5; k++) p.poly([[100 + k * 160, 640], [450, 80], [180 + k * 160, 640]], k % 2 ? "#c8553d" : "#efe3c6", 0); });
  p.poly(body, null, 11);
  p.poly([[380, 620], [450, 330], [520, 620]], "#3a2f2a", 8);
  p.stroke([[450, 90], [450, 20]], 12, WOOD_D);
  p.poly([[450, 20], [530, 38], [450, 58]], "#3f6fb5", 6);
};

/** smart bathroom scale seen from the front-top, glowing display and a Wi-Fi mark */
const scale = (p: Pen) => {
  p.poly(rr(40, 160, 560, 330, 40), "#f4f6f8", 10);
  p.poly(rr(60, 140, 540, 190, 30), "#ffffff", 8);
  p.poly(rr(220, 210, 380, 280, 12), "#1d2a3a", 7);
  const g = p.g; g.fillStyle = "#7dff8a"; g.font = "bold 52px Courier New, monospace"; g.textAlign = "center"; g.fillText("195", 300, 262);
  for (const r2 of [26, 46]) p.arc(470, 250, r2, r2, 225, 315, 7, "#3f6fb5");
};
const boxes = (p: Pen) => {
  const one = (x: number, y: number, w: number, h: number) => {
    p.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], "#c9935a", 9);
    p.poly([[x + w / 2 - 14, y], [x + w / 2 + 14, y], [x + w / 2 + 14, y + h], [x + w / 2 - 14, y + h]], "#e8c88a", 0);
    p.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], null, 9);
  };
  one(40, 380, 300, 260); one(340, 420, 260, 220); one(120, 160, 260, 220); one(390, 230, 180, 190);
  const g = p.g; g.fillStyle = "#5a3b2a"; g.font = "bold 40px Arial"; g.fillText("HER STUFF", 70, 520);
};
const car = (p: Pen, van = false) => {
  const body: P2[] = van
    ? [[40, 330], [60, 120], [520, 110], [620, 200], [660, 330]]
    : [[30, 330], [50, 250], [180, 230], [260, 150], [500, 150], [580, 230], [670, 250], [680, 330]];
  p.gradFill(body, van ? "#f2efe8" : "#c8323a", van ? "#c9c4b8" : "#8a2028", LIGHT); p.poly(body, null, 11);
  if (van) {
    p.poly([[520, 125], [600, 205], [520, 205]], "#8fd0ff", 8);
    const g = p.g; g.fillStyle = "#3f6fb5"; g.font = "bold 58px Arial Black, Arial"; g.fillText("MOVERS", 120, 250);
  } else {
    p.poly([[280, 165], [380, 165], [380, 235], [215, 235]], "#8fd0ff", 8);
    p.poly([[395, 165], [490, 165], [555, 235], [395, 235]], "#8fd0ff", 8);
  }
  for (const x of van ? [170, 540] : [170, 540]) wheel(p, x, 335, 58);
};
const poster = (p: Pen) => {   // a lake-and-pines poster on an easel (the fake backdrop)
  for (const [a, b] of [[[120, 760], [190, 140]], [[480, 760], [410, 140]]] as [P2, P2][]) p.stroke([a, b], 16, WOOD_D);
  const bd = rr(60, 80, 540, 560, 8);
  p.poly(bd, "#ffffff", 10);
  p.clip(rr(80, 100, 520, 540, 4), () => {
    const g = p.g, sky = g.createLinearGradient(0, 100, 0, 380); sky.addColorStop(0, "#6fb0ea"); sky.addColorStop(1, "#d6ecfb"); g.fillStyle = sky; g.fillRect(80, 100, 440, 300);
    g.fillStyle = "#3f8fc0"; g.fillRect(80, 380, 440, 160);
    p.ell(430, 180, 40, 40, "#ffd23f", 0);
    for (let k = 0; k < 6; k++) p.poly([[90 + k * 75, 390], [125 + k * 75, 260 - (k % 2) * 30], [160 + k * 75, 390]], "#2f6a3a", 5);
  });
  p.poly(bd, null, 10);
};

const text = (p: Pen, s: string, x: number, y: number, size: number, col: string, font = "Arial Black, Arial") => {
  const g = p.g; g.fillStyle = col; g.font = `bold ${size}px ${font}`; g.textAlign = "center"; g.fillText(s, x, y);
};
/** Lewis gun on a tripod (side view): barrel shroud, pan magazine, stock */
const lewis = (p: Pen) => {
  for (const [a, b] of [[[300, 420], [180, 640]], [[300, 420], [420, 640]], [[300, 420], [310, 650]]] as [P2, P2][]) p.stroke([a, b], 16, "#3a3d47");
  p.poly(rr(140, 340, 560, 400, 20), "#4a4f5a", 9);                            // cooling shroud
  for (let x = 170; x < 540; x += 30) p.stroke([[x, 345], [x, 395]], 4, "#2b2b38");
  p.poly([[560, 360], [640, 360], [640, 380], [560, 380]], "#2b2b38", 7);       // muzzle
  p.ell(330, 320, 90, 22, "#5a5f6a", 8);                                         // pan magazine
  p.poly([[60, 360], [150, 350], [150, 410], [70, 440]], "#7a4f33", 8);         // stock
};
const crates = (p: Pen, label: string) => {
  const one = (x: number, y: number, w: number, h: number, t: boolean) => {
    p.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], "#b8864e", 9);
    for (let k = 1; k < 4; k++) p.stroke([[x, y + (h * k) / 4], [x + w, y + (h * k) / 4]], 4, "#8a5a34");
    p.stroke([[x, y], [x + w, y + h]], 6, "#8a5a34");
    if (t) text(p, label || "COBRA FARM", x + w / 2, y + h / 2 + 14, 40, "#3a2a20");
  };
  one(40, 300, 340, 300, true); one(380, 360, 280, 240, false); one(150, 70, 300, 230, false);
  for (const [x, y] of [[230, 90], [300, 110]]) { p.ell(x, y, 22, 20, "#2b2b38", 5); p.ell(x - 7, y - 4, 6, 6, "#ffffff", 0); p.ell(x + 7, y - 4, 6, 6, "#ffffff", 0); }   // peeking snakes
};
const snakes = (p: Pen) => {
  for (let k = 0; k < 7; k++) {
    const x0 = 60 + k * 110, pts: P2[] = [];
    for (let i = 0; i <= 18; i++) { const t = i / 18; pts.push([x0 + 90 * t, 230 - 26 * Math.sin(t * Math.PI * 3 + k)]); }
    p.stroke(pts, 30, INK); p.stroke(pts, 20, k % 2 ? "#2b2b38" : "#5d7a3a");
    const [hx, hy] = pts[18]; p.ell(hx + 8, hy - 30, 26, 22, k % 2 ? "#2b2b38" : "#5d7a3a", 6);
    p.ell(hx + 2, hy - 34, 6, 7, "#ffffff", 0); p.ell(hx + 14, hy - 34, 6, 7, "#ffffff", 0);
  }
};
const board = (p: Pen, label: string) => {   // a chalkboard on an easel with a written word
  for (const [a, b] of [[[130, 740], [210, 120]], [[470, 740], [390, 120]]] as [P2, P2][]) p.stroke([a, b], 18, WOOD_D);
  p.poly(rr(70, 120, 530, 520, 10), "#8a5a34", 10);
  p.poly(rr(95, 145, 505, 495, 6), "#2f5a46", 6);
  const lines = (label || "").split("|");
  lines.forEach((l, i) => text(p, l, 300, 290 + i * 80 - (lines.length - 1) * 40, l.length > 10 ? 50 : 66, "#f4f1ea", "Comic Sans MS, Arial"));
  if (label?.startsWith("~")) p.stroke([[110, 330], [490, 300]], 14, "#e2453c");
};
const screen = (p: Pen, label: string) => {   // projector screen on legs, the picture glowing
  p.stroke([[120, 1000], [140, 120]], 16, "#2b2b38"); p.stroke([[1080, 1000], [1060, 120]], 16, "#2b2b38");
  p.poly(rr(80, 90, 1120, 720, 10), "#f7f7fa", 12);
  p.clip(rr(110, 120, 1090, 690, 6), () => {
    const g = p.g;
    if (label === "hallway") {   // grainy security-camera still: corridor, a door, two figures, a red REC dot and a timestamp
      g.fillStyle = "#3a4048"; g.fillRect(110, 120, 980, 570);
      g.fillStyle = "#555c66"; g.beginPath(); g.moveTo(110, 690); g.lineTo(480, 380); g.lineTo(720, 380); g.lineTo(1090, 690); g.fill();
      g.fillStyle = "#6b4a32"; g.fillRect(700, 260, 120, 230);
      p.ell(560, 360, 34, 34, "#f2efe8", 4); p.poly([[530, 400], [590, 400], [600, 520], [520, 520]], "#f2efe8", 4);     // white dress
      p.ell(640, 355, 32, 32, "#d9c4a8", 4); p.poly([[612, 392], [668, 392], [676, 515], [604, 515]], "#2b2b38", 4);     // suit
      g.fillStyle = "#ff3b3b"; g.beginPath(); g.arc(160, 170, 18, 0, 7); g.fill();
      g.fillStyle = "#ffffff"; g.font = "bold 40px Courier New, monospace"; g.textAlign = "left"; g.fillText("REC  23:47  HALL CAM 4", 190, 184);
      g.fillStyle = "rgba(255,255,255,0.06)"; for (let y = 120; y < 690; y += 6) g.fillRect(110, y, 980, 2);
    } else {   // happy photos collage
      g.fillStyle = "#fde7ef"; g.fillRect(110, 120, 980, 570);
      for (const [x, y, c] of [[160, 170, "#ffd23f"], [480, 150, "#8fd0ff"], [790, 190, "#c9f0b0"], [300, 420, "#ffb3c7"], [640, 430, "#e8d4ff"]] as const) {
        g.fillStyle = "#ffffff"; g.fillRect(x, y, 250, 200); g.fillStyle = c; g.fillRect(x + 14, y + 14, 222, 150);
        p.ell(x + 125, y + 80, 34, 34, "#ffe2c2", 4); p.arc(x + 125, y + 86, 16, 10, 20, 160, 4);
      }
      p.poly([[560, 360], [600, 330], [640, 360], [600, 410]], "#ef4f5f", 6);
    }
  });
};
const finish = (p: Pen) => {   // two stakes with a red FINISH tape, two packed suitcases in front
  for (const x of [80, 1020]) p.stroke([[x, 600], [x, 250]], 18, WOOD_D);
  p.poly([[80, 300], [1020, 300], [1020, 350], [80, 350]], "#e2453c", 8);
  text(p, "FINISH", 550, 343, 50, "#ffffff");
  for (const [x, c] of [[300, "#3f6fb5"], [620, "#c8553d"]] as const) {
    p.poly(rr(x, 420, x + 240, 600, 18), c, 9); p.poly(rr(x + 80, 390, x + 160, 425, 10), null, 8);
    for (const dx of [50, 190]) p.stroke([[x + dx, 430], [x + dx, 590]], 7, shade(c, 0.8));
  }
};
const truck = (p: Pen) => {   // 1930s army truck, khaki
  p.poly([[40, 330], [40, 150], [460, 150], [460, 330]], "#7a7a4a", 10);
  for (let x = 70; x < 460; x += 60) p.stroke([[x, 160], [x, 320]], 4, "#5e5e38");
  p.poly([[460, 330], [460, 200], [560, 200], [640, 260], [660, 330]], "#8a8a56", 10);
  p.poly([[480, 215], [550, 215], [610, 260], [480, 260]], "#8fd0ff", 7);
  for (const x of [140, 380, 560]) wheel(p, x, 340, 52);
};
const booth = (p: Pen, label: string) => {   // wooden counter booth with an awning and a sign
  p.poly([[60, 360], [740, 360], [740, 640], [60, 640]], "#a8784a", 10);
  for (let y = 400; y < 640; y += 40) p.stroke([[60, y], [740, y]], 4, "#7a4f33");
  p.poly([[40, 340], [760, 340], [760, 370], [40, 370]], "#6b4a32", 8);
  for (const x of [80, 720]) p.stroke([[x, 340], [x, 120]], 16, "#6b4a32");
  for (let i = 0; i < 8; i++) p.poly([[40 + i * 90, 120], [130 + i * 90, 120], [130 + i * 90, 180], [40 + i * 90, 180]], i % 2 ? "#ffffff" : "#c8323a", 6);
  p.poly(rr(230, 200, 570, 300, 10), "#f3e3bd", 8);
  text(p, label || "REWARD", 400, 270, 56, "#c8323a");
};

const tumbleweed = (p: Pen) => {   // a tangled ball of dry twigs (it spins as it rolls)
  p.ell(200, 200, 170, 160, "rgba(176,128,72,0.35)", 8);
  for (let k = 0; k < 26; k++) {
    const a0 = k * 0.77, r0 = 40 + (k * 37) % 120;
    p.arc(200 + Math.cos(a0) * 30, 200 + Math.sin(a0) * 30, r0, r0 * 0.8, (k * 47) % 360, ((k * 47) % 360) + 160, 7, k % 3 ? "#8a5a34" : "#b8864e");
  }
};
const trafficlight = (p: Pen) => {
  p.stroke([[150, 1000], [150, 300]], 26, INK); p.stroke([[150, 1000], [150, 300]], 16, "#3a3d47");
  p.poly(rr(90, 60, 210, 330, 20), "#2b2b38", 10);
  p.ell(150, 110, 34, 34, "#5a2020", 6); p.ell(150, 195, 34, 34, "#ffd23f", 6); p.ell(150, 280, 34, 34, "#1f4a2a", 6);
  p.ell(150, 195, 50, 50, "rgba(255,210,63,0.35)", 0);
};
const snacks = (p: Pen) => {   // a growing tower of pizza boxes + energy cans
  for (let k = 0; k < 7; k++) {
    const y = 600 - k * 70, dx = (k % 2 ? 14 : -10);
    p.poly([[110 + dx, y], [490 + dx, y], [490 + dx, y + 64], [110 + dx, y + 64]], "#f2e6cf", 8);
    p.poly([[280 + dx, y + 18], [330 + dx, y + 18], [330 + dx, y + 46], [280 + dx, y + 46]], "#e2453c", 0);
  }
  for (const [x, c] of [[40, "#39d98a"], [540, "#ff4fa0"], [585, "#39d9ff"], [80, "#ffd23f"]] as const) {
    p.poly(rr(x - 26, 560, x + 26, 664, 10), c, 8); p.stroke([[x - 20, 590], [x + 20, 590]], 6, "#ffffff");
  }
};

// ---------------- GTA-6 shorts set (our own generic designs: no brands, no logos) ----------------
const lines = (p: Pen, label: string, x: number, y: number, size: number, col: string, gap = 1.15, font = "Arial Black, Arial") => {
  const ls = (label || "").split("|");
  ls.forEach((l, i) => text(p, l, x, y + (i - (ls.length - 1) / 2) * size * gap, size, col, font));
};
const cryo = (p: Pen, label: string) => {   // a frosted cryo tube: metal base + cap, glass sides, frost, a label plate
  p.poly(rr(60, 860, 540, 1000, 20), "#8a949e", 10);
  p.poly(rr(80, 40, 520, 150, 40), "#8a949e", 10);
  for (const x of [90, 500]) p.poly([[x, 150], [x + 20, 150], [x + 20, 860], [x, 860]], "#c9d2da", 6);
  const g = p.g, gl = g.createLinearGradient(110, 0, 500, 0);
  gl.addColorStop(0, "rgba(160,220,255,0.38)"); gl.addColorStop(0.5, "rgba(220,245,255,0.12)"); gl.addColorStop(1, "rgba(160,220,255,0.38)");
  g.fillStyle = gl; g.fillRect(110, 150, 390, 710);
  for (const [x, y, r] of [[140, 820, 60], [460, 800, 70], [300, 840, 50], [130, 200, 40], [470, 190, 46]] as const) p.ell(x, y, r, r * 0.6, "rgba(255,255,255,0.55)", 0);
  p.stroke([[150, 200], [190, 700]], 8, "rgba(255,255,255,0.6)");
  p.poly(rr(170, 880, 430, 960, 10), "#1d1b22", 6);
  lines(p, label || "WAKE ME IN 2028", 300, 932, 30, "#39d9ff");
  for (const x of [120, 480]) p.ell(x, 95, 16, 16, "#39d98a", 4);
};
const redarrow = (p: Pen) => {   // the giant red stock-crash arrow smashing down (with rubble)
  p.poly([[120, 40], [320, 40], [520, 520], [640, 470], [600, 900], [260, 660], [380, 610], [190, 120]], "#e2453c", 14);
  p.poly([[150, 60], [300, 60], [300, 90], [170, 90]], "rgba(255,255,255,0.35)", 0);
  for (const [x, y, r] of [[560, 930, 40], [470, 950, 30], [660, 940, 34], [520, 975, 22]] as const) p.poly([[x - r, y], [x, y - r * 0.8], [x + r, y], [x, y + r * 0.5]], "#8a6a4a", 6);
};
const consoleBox = (p: Pen, label: string) => {   // a tall white console with black core; "hot" glows, "flames" blasts off
  const hot = label === "hot" || label === "flames";
  if (label === "flames") {
    for (const [x, w] of [[220, 70], [380, 70]] as const) {
      p.poly([[x - w, 700], [x + w, 700], [x + w * 0.4, 960], [x, 1000], [x - w * 0.4, 960]], "#ff9a2e", 8);
      p.poly([[x - w * 0.5, 700], [x + w * 0.5, 700], [x, 900]], "#fff1a0", 0);
    }
  }
  p.poly([[230, 40], [370, 40], [380, 700], [220, 700]], "#1d1b22", 10);
  p.poly([[150, 60], [240, 40], [230, 700], [130, 690]], hot ? "#ff8a3d" : "#f4f4f7", 10);
  p.poly([[360, 40], [450, 60], [470, 690], [370, 700]], hot ? "#ff7a2e" : "#e6e7ec", 10);
  if (hot) for (let k = 0; k < 5; k++) p.stroke([[160 + k * 70, 30 - (k % 2) * 10], [175 + k * 70, -10]], 6, "#ffd23f");
  p.ell(300, 380, 50, 50, "#2b2b38", 6);
  for (let k = 0; k < 6; k++) { const a = k * 1.05; p.stroke([[300, 380], [300 + 44 * Math.cos(a), 380 + 44 * Math.sin(a)]], 8, hot ? "#ffb347" : "#5a5f6a"); }
  p.ell(300, 600, 10, 10, "#39d9ff", 0);
};
const sofa = (p: Pen, label: string) => {
  p.poly(rr(60, 200, 740, 470, 40), "#6a8fc9", 10);
  p.poly(rr(40, 300, 140, 520, 30), "#5a7bb0", 10); p.poly(rr(660, 300, 760, 520, 30), "#5a7bb0", 10);
  p.poly(rr(120, 360, 680, 500, 20), "#7aa0d9", 10);
  for (const x of [90, 710]) p.stroke([[x, 520], [x, 580]], 18, WOOD_D);
  sold(p, label, 400, 150);
};
const sold = (p: Pen, label: string, x: number, y: number) => {
  if (!label) return;
  p.poly([[x - 120, y - 50], [x + 120, y - 60], [x + 126, y + 40], [x - 114, y + 50]], "#ffd23f", 7);
  text(p, label, x + 4, y + 18, 56, "#c8323a");
};
const fridge = (p: Pen, label: string) => {
  p.poly(rr(80, 60, 400, 900, 30), "#eef1f4", 10);
  p.stroke([[80, 380], [400, 380]], 8);
  for (const y of [200, 520]) p.stroke([[350, y], [350, y + 120]], 14, "#9aa4ad");
  p.poly([[140, 440], [210, 430], [215, 480], [145, 490]], "#ffd23f", 4); p.ell(280, 470, 26, 26, "#e2453c", 4);
  sold(p, label, 240, 250);
};
const bed = (p: Pen, label: string) => {
  p.poly(rr(40, 120, 120, 520, 14), WOOD, 9);
  p.poly(rr(100, 300, 760, 440, 16), "#f2efe8", 9);
  p.poly(rr(110, 250, 300, 320, 30), "#ffffff", 8);
  p.poly(rr(280, 280, 760, 450, 16), "#c96a8a", 9);
  for (const x of [80, 740]) p.stroke([[x, 440], [x, 520]], 16, WOOD_D);
  sold(p, label, 480, 180);
};
const doghouse = (p: Pen, label: string) => {
  p.poly([[100, 300], [500, 300], [500, 620], [100, 620]], "#c8553d", 10);
  p.poly([[60, 320], [300, 110], [540, 320]], "#6b4a32", 10);
  p.poly([[230, 620], [230, 450], [370, 450], [370, 620]], "#2b1d14", 8);
  p.ell(300, 450, 70, 50, "#2b1d14", 0, 180, 360);
  text(p, "REX", 300, 380, 50, "#f2e6cf");
  sold(p, label, 300, 200);
};
const tv = (p: Pen, label: string) => {   // a huge flat TV on a low stand; the label is the text on screen ("~game" = painted game)
  p.poly(rr(30, 40, 1170, 690, 16), "#16151b", 12);
  p.clip(rr(55, 65, 1145, 665, 6), () => {
    const g = p.g;
    if (label.startsWith("~game")) {
      const sky = g.createLinearGradient(0, 65, 0, 665); sky.addColorStop(0, "#2a1450"); sky.addColorStop(0.55, "#ff4fa0"); sky.addColorStop(1, "#ffb347");
      g.fillStyle = sky; g.fillRect(55, 65, 1090, 600);
      p.ell(600, 430, 140, 140, "#ffd23f", 0);
      for (let k = 0; k < 14; k++) { const h = 120 + ((k * 73) % 220); g.fillStyle = "#1d1036"; g.fillRect(55 + k * 80, 665 - h, 70, h); g.fillStyle = "#ffe14d"; for (let y = 665 - h + 20; y < 650; y += 34) g.fillRect(70 + k * 80, y, 10, 12); }
      const rest = label.slice(5).replace(/^\|/, "");
      if (rest) { g.fillStyle = "rgba(0,0,0,0.55)"; g.fillRect(55, 520, 1090, 145); lines(p, rest, 600, 610, 70, "#ffffff"); }
    } else if (label === "~nointernet") {
      g.fillStyle = "#f2f2f5"; g.fillRect(55, 65, 1090, 600);
      for (let k = 0; k < 3; k++) p.arc(600, 420, 90 + k * 70, 90 + k * 70, 225, 315, 26, "#9aa4ad");
      p.ell(600, 420, 26, 26, "#9aa4ad", 0);
      p.stroke([[440, 180], [760, 470]], 30, "#e2453c");
      text(p, "NO INTERNET", 600, 600, 80, "#2b2b38");
    } else {
      g.fillStyle = "#1b2a4a"; g.fillRect(55, 65, 1090, 600);
      lines(p, label || "LOADING...", 600, 380, 84, "#ffffff");
    }
  });
  p.poly(rr(450, 690, 750, 760, 10), "#2b2b38", 8);
  p.poly(rr(200, 760, 1000, 840, 10), "#3a2f2a", 8);
};
const calendar = (p: Pen, label: string) => {   // wall calendar; the label is the year, pages flying off
  p.poly(rr(80, 120, 520, 700, 18), "#ffffff", 10);
  p.poly(rr(80, 120, 520, 260, 18), "#e2453c", 10);
  for (const x of [170, 430]) p.ell(x, 120, 18, 30, "#c9ccd2", 6);
  text(p, label || "2013", 300, 220, 80, "#ffffff");
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) p.poly([[110 + c * 66, 300 + r * 90], [160 + c * 66, 300 + r * 90], [160 + c * 66, 360 + r * 90], [110 + c * 66, 360 + r * 90]], "#f2efe8", 3);
  for (const [x, y, a] of [[600, 120, 0.4], [680, 300, -0.3], [560, 420, 0.7]] as const) {
    const pts: P2[] = [[-70, -80], [70, -80], [70, 80], [-70, 80]].map(([dx, dy]) => [x + dx * Math.cos(a) - dy * Math.sin(a), y + dx * Math.sin(a) + dy * Math.cos(a)] as P2);
    p.poly(pts, "#ffffff", 7);
  }
};
const hospitalbed = (p: Pen) => {
  p.poly(rr(40, 260, 100, 640, 14), "#c9d2da", 9); p.poly(rr(780, 380, 830, 640, 14), "#c9d2da", 9);
  p.poly(rr(80, 420, 800, 520, 16), "#e6eef4", 9);
  p.poly(rr(110, 370, 300, 440, 30), "#ffffff", 8);
  p.poly(rr(280, 380, 800, 470, 22), "#8fc9e6", 9);
  for (const x of [130, 760]) { p.stroke([[x, 520], [x, 620]], 14, "#9aa4ad"); p.ell(x, 635, 20, 20, "#2b2b38", 5); }
};
const heartmonitor = (p: Pen) => {
  p.stroke([[200, 980], [200, 420]], 18, "#9aa4ad");
  for (const dx of [-120, 0, 120]) p.stroke([[200, 980], [200 + dx, 1000]], 12, "#9aa4ad");
  p.poly(rr(40, 120, 360, 420, 18), "#2b2b38", 10);
  p.poly(rr(65, 145, 335, 360, 8), "#0d1f17", 0);
  p.stroke([[70, 260], [130, 260], [150, 200], [170, 320], [190, 260], [330, 260]], 8, "#39d98a");
  text(p, "72", 290, 200, 40, "#39d98a");
};
const pole = (p: Pen) => {   // wooden telephone pole with a crossbar, insulators and sagging wires
  p.stroke([[300, 1000], [300, 60]], 46, INK); p.stroke([[300, 1000], [300, 60]], 34, "#8a5a34");
  p.poly([[100, 130], [500, 130], [500, 165], [100, 165]], "#7a4f33", 8);
  for (const x of [130, 220, 380, 470]) p.ell(x, 118, 14, 18, "#6fae9a", 4);
  for (const x of [130, 220, 380, 470]) p.stroke([[x, 110], [x - 160, 160], [x - 300, 120]], 4);
  for (let k = 0; k < 6; k++) p.stroke([[285, 400 + k * 90], [315, 400 + k * 90]], 8, "#5e5e5e");   // climbing spikes
};
const monitor = (p: Pen, label: string) => {   // curved gaming monitor on a desk (RGB rim)
  p.poly([[40, 420], [960, 420], [960, 470], [40, 470]], WOOD, 9);
  for (const x of [80, 920]) p.stroke([[x, 470], [x, 700]], 16, WOOD_D);
  p.stroke([[500, 420], [500, 330]], 24, "#2b2b38");
  const curve: P2[] = [];
  for (let i = 0; i <= 20; i++) { const t = i / 20; curve.push([120 + 760 * t, 40 + 26 * Math.sin(Math.PI * t)]); }
  for (let i = 20; i >= 0; i--) { const t = i / 20; curve.push([120 + 760 * t, 330 - 26 * Math.sin(Math.PI * t)]); }
  p.poly(curve, "#141218", 10);
  p.clip(curve, () => { const g = p.g; g.fillStyle = "#1b2a4a"; g.fillRect(130, 60, 740, 260); lines(p, label || "", 500, 200, 54, "#ffffff"); });
  p.stroke([[118, 335], [882, 335]], 6, "#ff4fa0");
  for (const [x, c] of [[200, "#39d98a"], [260, "#ff4fa0"], [780, "#ffd23f"]] as const) { p.poly(rr(x - 20, 350, x + 20, 420, 8), c, 6); }   // cans
};
const cardbox = (p: Pen, label: string) => {
  p.poly([[60, 160], [440, 160], [440, 420], [60, 420]], "#c8a06a", 10);
  p.poly([[60, 160], [440, 160], [400, 120], [100, 120]], "#b88f5a", 8);
  p.stroke([[250, 160], [250, 420]], 10, "#a07a46");
  if (label) text(p, label, 250, 320, 44, "#5a3b2a");
};
const desk = (p: Pen, label: string) => {   // office desk with a ringing landline phone and a lamp
  p.poly([[40, 260], [760, 260], [760, 300], [40, 300]], "#8a6a4a", 9);
  for (const x of [70, 730]) p.poly([[x - 16, 300], [x + 16, 300], [x + 16, 500], [x - 16, 500]], "#6b4a32", 8);
  p.poly(rr(470, 200, 640, 262, 12), "#2b2b38", 8);
  p.poly(rr(480, 160, 630, 200, 18), "#3a3d47", 8);
  if (label === "ring") for (let k = 0; k < 3; k++) p.arc(555, 170, 70 + k * 30, 50 + k * 22, 220, 320, 8, "#ffd23f");
  p.poly(rr(110, 120, 330, 262, 8), "#2b2b38", 8); p.poly(rr(125, 135, 315, 240, 4), "#8fd0ff", 0);
};
const rack = (p: Pen, label: string) => {   // server rack; "red" = overheating, sparks
  const hot = label === "red";
  p.poly(rr(60, 40, 440, 1000, 10), "#2b2b38", 10);
  for (let k = 0; k < 14; k++) {
    const y = 80 + k * 64;
    p.poly([[90, y], [410, y], [410, y + 48], [90, y + 48]], hot ? "#5a1e1e" : "#3a3d47", 4);
    for (let j = 0; j < 5; j++) p.ell(120 + j * 24, y + 24, 7, 7, hot ? (j % 2 ? "#ff3b3b" : "#ffb347") : (j % 3 ? "#39d98a" : "#39d9ff"), 0);
    p.stroke([[260, y + 24], [390, y + 24]], 5, "#16151b");
  }
  if (hot) for (const [x, y] of [[420, 200], [60, 520], [430, 760]] as const) p.poly([[x, y], [x + 50, y + 30], [x + 20, y + 40], [x + 70, y + 90], [x + 5, y + 50], [x + 30, y + 40]], "#ffe14d", 5);
};
const signs = (p: Pen, label: string) => {   // three protest placards on sticks (label lines = one per sign)
  const ls = (label || "DROP IT|NOW|PLEASE").split("|");
  ls.slice(0, 3).forEach((l, i) => {
    const x = 160 + i * 300, y = 120 + (i % 2) * 70, a = (i - 1) * 0.08;
    p.stroke([[x, y + 160], [x + a * 200, 900]], 16, WOOD_D);
    p.poly([[x - 140, y], [x + 140, y - 10], [x + 145, y + 170], [x - 135, y + 180]], "#f2e6cf", 9);
    const words = l.split(" "), half = Math.ceil(words.length / 2);
    lines(p, words.length > 2 ? words.slice(0, half).join(" ") + "|" + words.slice(half).join(" ") : l, x, y + 100, l.length > 12 ? 34 : 46, "#c8323a", 1.1, "Comic Sans MS, Arial");
  });
};
const ticker = (p: Pen, label: string) => {   // stock-ticker wall screen with a crashing red line
  p.poly(rr(30, 40, 1170, 640, 14), "#141218", 12);
  p.clip(rr(50, 60, 1150, 620, 6), () => {
    const g = p.g; g.fillStyle = "#0d1020"; g.fillRect(50, 60, 1100, 560);
    for (let y = 120; y < 600; y += 60) p.stroke([[50, y], [1150, y]], 2, "rgba(255,255,255,0.08)");
    p.stroke([[60, 180], [260, 160], [400, 200], [520, 170], [640, 260], [760, 380], [880, 470], [1000, 540], [1140, 600]], 12, "#ff3b3b");
    g.fillStyle = "#ff3b3b"; g.fillRect(50, 60, 1100, 54);
    lines(p, label || "GAMING INDEX ▼ 87%", 600, 100, 40, "#ffffff");
  });
};

// ---------------- megaproject set (generic designs, no logos) ----------------
const tyre = (p: Pen, x: number, y: number, r: number) => { p.ell(x, y, r, r, "#1d1b22", 8); p.ell(x, y, r * 0.45, r * 0.45, "#9aa4ad", 5); };
const semi = (p: Pen) => {   // 18-wheeler side view: long white trailer + red cab, headlight
  p.poly(rr(40, 60, 1120, 400, 10), "#f2efe8", 10);
  for (let x = 120; x < 1100; x += 120) p.stroke([[x, 70], [x, 390]], 4, "#d9d2c3");
  p.poly([[1130, 120], [1270, 120], [1340, 220], [1350, 400], [1130, 400]], "#c8323a", 10);
  p.poly([[1160, 145], [1255, 145], [1310, 225], [1160, 225]], "#8fd0ff", 7);
  p.ell(1345, 350, 18, 14, "#fff1a0", 5);
  for (const x of [140, 260, 880, 1000, 1200, 1300]) tyre(p, x, 430, 52);
};
const forklift = (p: Pen) => {
  p.poly(rr(160, 230, 520, 470, 20), "#ffb020", 10);
  p.poly([[230, 230], [230, 60], [470, 60], [500, 230]], null, 10);
  p.poly([[250, 80], [455, 80], [480, 225], [250, 225]], "rgba(160,220,255,0.35)", 0);
  p.stroke([[560, 470], [560, 40]], 20, "#3a3d47"); p.stroke([[600, 470], [600, 40]], 20, "#3a3d47");
  p.poly([[560, 430], [740, 430], [740, 455], [560, 455]], "#3a3d47", 7);
  p.poly(rr(600, 300, 740, 428, 8), "#b8864e", 8);
  for (const x of [240, 450]) tyre(p, x, 490, 46);
  p.ell(330, 120, 18, 10, "#39d9ff", 0);
};
const fruitpile = (p: Pen, label: string) => {   // pallet pyramid of watermelons + apples
  p.poly([[40, 560], [760, 560], [760, 600], [40, 600]], "#b8864e", 8);
  const melon = label === "apples";
  for (let row = 0; row < 5; row++) for (let k = 0; k < 6 - row; k++) {
    const x = 120 + k * 120 + row * 60, y = 500 - row * 95;
    if (melon) { p.ell(x, y, 50, 46, "#e2453c", 6); } else { p.ell(x, y, 60, 48, "#3f8a3a", 7); for (let s = -1; s <= 1; s++) p.arc(x + s * 20, y, 18, 44, 270, 450, 4, "#2a5e28"); }
  }
};
const containership = (p: Pen) => {   // huge container ship (side view): stacked coloured boxes, bridge tower
  p.poly([[20, 520], [1900, 520], [1840, 760], [120, 760]], "#c8323a", 12);
  p.poly([[30, 520], [1890, 520], [1880, 560], [40, 560]], "#1d1b22", 0);
  const cols = ["#3f6fb5", "#ffd23f", "#39d98a", "#ff7a1a", "#e2453c", "#9a7ac9", "#2a9d8f"];
  for (let c = 0; c < 26; c++) for (let r = 0; r < 5; r++) {
    if (c > 20 && c < 23) continue;
    const x = 140 + c * 66, y = 460 - r * 62;
    p.poly([[x, y], [x + 62, y], [x + 62, y + 58], [x, y + 58]], cols[(c * 3 + r * 5) % 7], 5);
  }
  p.poly([[1530, 520], [1530, 120], [1680, 120], [1680, 520]], "#f2efe8", 10);
  for (let k = 0; k < 4; k++) p.poly([[1550, 150 + k * 70], [1660, 150 + k * 70], [1660, 190 + k * 70], [1550, 190 + k * 70]], "#8fd0ff", 4);
  p.stroke([[1605, 120], [1605, 60]], 10, "#3a3d47");
};
const tugboat = (p: Pen) => {
  p.poly([[30, 260], [560, 260], [520, 360], [90, 360]], "#e2453c", 10);
  p.poly(rr(170, 120, 400, 260, 10), "#f2efe8", 9); p.poly([[200, 140], [370, 140], [370, 190], [200, 190]], "#8fd0ff", 5);
  p.poly(rr(250, 40, 320, 120, 6), "#ffd23f", 8);
  for (const x of [50, 540]) p.ell(x, 300, 26, 26, "#2b2b38", 6);
  p.stroke([[560, 270], [700, 200]], 8, "#5e5e5e");
};
const steamshovel = (p: Pen) => {   // 1914 steam shovel: boiler house on tracks, boom + bucket, smoke stack
  p.poly(rr(60, 520, 520, 600, 30), "#3a3d47", 10);
  for (let x = 100; x < 500; x += 60) p.ell(x, 560, 22, 22, "#5e5e5e", 5);
  p.poly([[100, 300], [480, 300], [480, 520], [100, 520]], "#6b4a32", 10);
  p.poly([[90, 280], [490, 280], [460, 230], [120, 230]], "#3a3d47", 8);
  p.stroke([[160, 230], [160, 80]], 34, "#1d1b22");
  p.stroke([[440, 320], [860, 120]], 26, "#3a3d47"); p.stroke([[700, 200], [760, 420]], 16, "#3a3d47");
  p.poly([[700, 400], [860, 400], [840, 500], [720, 500]], "#5e5e5e", 9);
  for (let k = 0; k < 4; k++) p.ell(150 + k * 30, 50 - k * 34, 50 + k * 14, 34 + k * 8, "rgba(40,36,40,0.7)", 0);
};
const mosquito = (p: Pen) => {   // giant cartoon mosquito with glowing red eyes
  p.ell(260, 200, 120, 46, "#5e5a56", 8); p.ell(110, 180, 56, 48, "#5e5a56", 8);
  p.ell(95, 165, 18, 18, "#ff3b3b", 4); p.ell(95, 165, 30, 30, "rgba(255,60,60,0.35)", 0);
  p.stroke([[60, 195], [-10, 230]], 6);
  for (const [x, y] of [[230, 120], [300, 115]]) p.ell(x, y - 50, 70, 30, "rgba(220,240,255,0.65)", 5);
  for (let k = 0; k < 3; k++) p.stroke([[200 + k * 50, 230], [170 + k * 60, 360]], 5);
};
const mixer = (p: Pen) => {   // cement mixer truck
  p.poly(rr(30, 200, 640, 320, 12), "#3a3d47", 10);
  p.poly([[640, 120], [780, 120], [800, 320], [640, 320]], "#ffd23f", 10); p.poly([[660, 140], [760, 140], [770, 210], [660, 210]], "#8fd0ff", 5);
  p.ell(330, 150, 250, 110, "#f2efe8", 10);
  for (let k = 0; k < 4; k++) p.arc(330 + (k - 1.5) * 90, 150, 30, 100, 260, 460, 7, "#ff7a1a");
  for (const x of [120, 300, 700]) tyre(p, x, 340, 46);
};
const airplane = (p: Pen) => {   // airliner side view (generic livery)
  p.ell(800, 300, 760, 110, "#f4f6f9", 12);
  p.poly([[1460, 260], [1590, 60], [1640, 60], [1580, 280]], "#3f6fb5", 10);
  p.poly([[700, 330], [950, 330], [620, 520], [520, 520]], "#c9d2da", 10);
  for (let x = 300; x < 1300; x += 60) p.ell(x, 270, 14, 16, "#5a7bb0", 0);
  p.poly([[60, 300], [140, 240], [180, 300]], "#8fd0ff", 6);
  p.stroke([[100, 340], [1500, 340]], 14, "#3f6fb5");
  p.ell(760, 470, 90, 40, "#9aa4ad", 8);
};
const excavator = (p: Pen) => {
  p.poly(rr(60, 380, 520, 460, 30), "#3a3d47", 10);
  p.poly(rr(120, 220, 460, 380, 14), "#ffb020", 10); p.poly([[330, 230], [440, 230], [440, 320], [330, 320]], "#8fd0ff", 6);
  p.stroke([[200, 250], [560, 80], [760, 260]], 34, "#ffb020"); p.stroke([[200, 250], [560, 80], [760, 260]], 6, "#1d1b22");
  p.poly([[700, 260], [830, 250], [800, 360], [720, 340]], "#5e5e5e", 9);
};
const rockpile = (p: Pen) => {
  const rocks: [number, number, number][] = [[120, 420, 90], [280, 440, 110], [460, 430, 100], [620, 440, 90], [200, 330, 80], [380, 320, 95], [540, 330, 80], [300, 220, 75], [460, 230, 70], [380, 140, 60]];
  for (const [x, y, r] of rocks) { p.ell(x, y, r, r * 0.8, ["#a8a29a", "#8e877e", "#b8b2aa"][Math.round(x) % 3], 8); p.arc(x - r * 0.2, y - r * 0.2, r * 0.4, r * 0.3, 200, 300, 5, "#d9d4cc"); }
};
const tetrapods = (p: Pen) => {   // interlocking concrete armour blocks
  for (let k = 0; k < 7; k++) {
    const x = 90 + k * 130, y = 330 - (k % 2) * 60;
    for (let a = 0; a < 4; a++) { const ang = (a * Math.PI) / 2 + k * 0.4; p.stroke([[x, y], [x + 80 * Math.cos(ang), y + 60 * Math.sin(ang)]], 46, "#b8b2aa"); }
    p.ell(x, y, 34, 30, "#c9c4bc", 6);
  }
};
const departures = (p: Pen, label: string) => {   // airport departures board
  p.poly(rr(20, 20, 980, 620, 14), "#16181f", 12);
  text(p, "DEPARTURES", 500, 100, 56, "#ffd23f");
  const rows = [["OSAKA", "ON TIME"], ["TOKYO", "ON TIME"], ["SEOUL", "ON TIME"], ["PARIS", "ON TIME"], ["SYDNEY", "ON TIME"]];
  rows.forEach(([c, s], i) => { const y = 190 + i * 86; const g = p.g; g.font = "bold 46px Courier New, monospace"; g.textAlign = "left"; g.fillStyle = "#ffd23f"; g.fillText(`${10 + i}:${i % 2 ? "30" : "05"}  ${c}`, 60, y); g.fillStyle = "#7dff8a"; g.fillText(label || s, 660, y); });
};
const escalator = (p: Pen) => {
  p.poly([[40, 760], [260, 760], [760, 260], [960, 260], [960, 320], [780, 320], [280, 820], [40, 820]], "#c9ced6", 10);
  for (let k = 0; k < 16; k++) { const x = 270 + k * 31, y = 750 - k * 31; p.stroke([[x, y], [x + 31, y]], 6, "#5e6470"); }
  p.stroke([[20, 700], [250, 700], [750, 200], [980, 200]], 18, "#1d1b22");
};
const pipes = (p: Pen) => {   // the century-old maze of pipes, cables and steam lines
  const cols = ["#e2453c", "#3f6fb5", "#ffd23f", "#39d98a", "#9a7ac9", "#ff7a1a", "#5e6470"];
  for (let k = 0; k < 12; k++) {
    const y0 = 60 + k * 50, c = cols[k % 7], w = k % 3 ? 26 : 40;
    const pts: P2[] = [[0, y0], [200 + (k * 37) % 200, y0], [260 + (k * 53) % 200, y0 + ((k % 2) ? 120 : -80)], [700 + (k * 29) % 200, y0 + ((k % 2) ? 120 : -80)], [1000, y0 + (k % 3) * 30]];
    p.stroke(pts, w + 10, INK); p.stroke(pts, w, c);
  }
  for (const [x, y] of [[300, 200], [620, 380], [820, 140]]) p.poly(rr(x - 26, y - 26, x + 26, y + 26, 6), "#c9ccd2", 6);
  text(p, "???", 500, 560, 70, "#ffffff");
};
const cashcounter = (p: Pen, label: string) => {   // digital money counter; "fire" = overheating, flames on top
  const hot = label === "fire";
  if (hot) for (let k = 0; k < 5; k++) { const x = 90 + k * 75; p.poly([[x - 40, 210], [x, 40 + (k % 2) * 40], [x + 40, 210]], "#ff7a1a", 6); p.poly([[x - 18, 210], [x, 120 + (k % 2) * 30], [x + 18, 210]], "#ffe14d", 0); }
  p.poly(rr(40, 200, 460, 880, 20), hot ? "#5a1e1e" : "#2b2b38", 10);
  p.poly(rr(70, 240, 430, 400, 10), "#0d1020", 6);
  text(p, "$ 9,999,999", 250, 340, 54, hot ? "#ff3b3b" : "#39d98a", "Courier New, monospace");
  for (let k = 0; k < 5; k++) p.poly([[110, 460 + k * 70], [390, 460 + k * 70], [390, 500 + k * 70], [110, 500 + k * 70]], "#7cc46a", 4);
  p.ell(250, 820, 24, 24, hot ? "#ff3b3b" : "#39d98a", 5);
};
const blueprint = (p: Pen, label: string) => {   // a blueprint on a drafting table; "~CANCELLED" = stamped + cobwebs
  const cancelled = label.startsWith("~");
  p.stroke([[120, 640], [160, 420]], 18, WOOD_D); p.stroke([[580, 640], [540, 420]], 18, WOOD_D);
  p.poly([[40, 120], [660, 100], [680, 430], [60, 450]], "#2f5fb0", 10);
  for (let k = 0; k < 6; k++) p.stroke([[80, 160 + k * 45], [630, 145 + k * 45]], 3, "rgba(255,255,255,0.4)");
  p.stroke([[120, 360], [260, 220], [420, 260], [580, 180]], 8, "#ffffff");
  text(p, cancelled ? "SECOND AVE" : label || "PLAN", 360, 420, 40, "#ffffff");
  if (cancelled) {
    p.poly([[130, 240], [590, 200], [600, 330], [140, 370]], null, 14);
    text(p, "CANCELLED", 365, 310, 88, "#e2453c");
    for (const [x, y] of [[60, 120], [660, 100]]) for (let k = 1; k < 5; k++) p.arc(x, y, 40 * k, 40 * k, x < 300 ? 0 : 90, x < 300 ? 90 : 180, 2, "rgba(255,255,255,0.7)");
  }
};
const subwaymap = (p: Pen, label: string) => {   // a framed subway map on a wall; phase 2 crossed out
  p.poly(rr(20, 20, 980, 730, 10), "#f2efe8", 12);
  p.stroke([[500, 680], [500, 400]], 26, "#00933c");
  p.stroke([[500, 400], [500, 80]], 16, "#00933c");
  for (const y of [660, 560, 460]) p.ell(500, y, 22, 22, "#ffffff", 7);
  p.stroke([[380, 140], [620, 340]], 22, "#e2453c"); p.stroke([[620, 140], [380, 340]], 22, "#e2453c");
  const ls = (label || "PHASE 2|COMING NEVER").split("|");
  text(p, ls[0], 760, 200, 50, "#2b2b38"); if (ls[1]) text(p, ls[1], 500, 420, 64, "#e2453c", "Comic Sans MS, Arial");
};
const ribbon = (p: Pen) => {   // two gold stands with a giant red ribbon + bow
  for (const x of [60, 940]) { p.stroke([[x, 640], [x, 220]], 24, "#e8b83a"); p.ell(x, 210, 30, 30, "#e8b83a", 8); p.ell(x, 650, 70, 18, "#e8b83a", 8); }
  p.band([[60, 260], [940, 260]], "#e2453c", 50, 8);
  p.ell(430, 260, 70, 50, "#e2453c", 8); p.ell(570, 260, 70, 50, "#e2453c", 8); p.ell(500, 262, 30, 30, "#c8323a", 7);
  p.poly([[480, 280], [430, 400], [470, 390]], "#e2453c", 6); p.poly([[520, 280], [570, 400], [530, 390]], "#e2453c", 6);
};
const oldcar = (p: Pen) => {   // a 1920s automobile: tall cabin, running board, spoked wheels
  p.poly([[60, 260], [640, 260], [700, 300], [700, 360], [40, 360]], "#2b2b38", 10);
  p.poly([[200, 260], [220, 100], [520, 100], [560, 260]], "#2b2b38", 10);
  p.poly([[240, 120], [370, 120], [370, 240], [240, 240]], "#d9e8f0", 6); p.poly([[400, 120], [510, 120], [530, 240], [400, 240]], "#d9e8f0", 6);
  p.stroke([[20, 370], [720, 370]], 10, "#5e5e5e");
  for (const x of [160, 560]) wheel(p, x, 380, 70);
  p.ell(690, 280, 18, 18, "#fff1a0", 5);
};

export const PIECES: Record<PieceKind, { dw: number; dh: number; w: number; h: number; draw: (p: Pen, label: string) => void }> = {
  horse: { dw: 1000, dh: 1000, w: 8.0, h: 8.0, draw: horse },
  ship: { dw: 1250, dh: 1200, w: 14.0, h: 13.4, draw: (p) => ship(p, false) },
  galley: { dw: 1250, dh: 1200, w: 13.0, h: 12.5, draw: (p) => ship(p, true) },
  chalkboard: { dw: 600, dh: 780, w: 1.9, h: 2.47, draw: chalkboard },
  sheep: { dw: 500, dh: 380, w: 1.35, h: 1.03, draw: sheep },
  tent: { dw: 900, dh: 660, w: 5.0, h: 3.67, draw: tent },
  scale: { dw: 600, dh: 360, w: 0.75, h: 0.45, draw: scale },
  boxes: { dw: 640, dh: 660, w: 1.9, h: 1.96, draw: boxes },
  car: { dw: 720, dh: 400, w: 4.5, h: 2.5, draw: (p) => car(p, false) },
  van: { dw: 720, dh: 400, w: 5.4, h: 3.0, draw: (p) => car(p, true) },
  poster: { dw: 600, dh: 780, w: 1.9, h: 2.47, draw: poster },
  lewis: { dw: 700, dh: 660, w: 1.7, h: 1.6, draw: lewis },
  crates: { dw: 700, dh: 620, w: 2.0, h: 1.77, draw: crates },
  snakes: { dw: 860, dh: 300, w: 3.2, h: 1.1, draw: snakes },
  board: { dw: 600, dh: 780, w: 1.9, h: 2.47, draw: board },
  screen: { dw: 1200, dh: 1000, w: 6.0, h: 5.0, draw: screen },
  finish: { dw: 1100, dh: 620, w: 4.4, h: 2.48, draw: finish },
  truck: { dw: 700, dh: 400, w: 5.6, h: 3.2, draw: truck },
  booth: { dw: 800, dh: 660, w: 3.2, h: 2.64, draw: booth },
  tumbleweed: { dw: 400, dh: 400, w: 1.3, h: 1.3, draw: tumbleweed },
  trafficlight: { dw: 300, dh: 1000, w: 1.2, h: 4.0, draw: trafficlight },
  snacks: { dw: 640, dh: 680, w: 1.6, h: 1.7, draw: snacks },
  cryo: { dw: 600, dh: 1000, w: 1.5, h: 2.5, draw: cryo },
  redarrow: { dw: 700, dh: 1000, w: 3.5, h: 5.0, draw: redarrow },
  console: { dw: 600, dh: 1000, w: 0.9, h: 1.5, draw: consoleBox },
  sofa: { dw: 800, dh: 600, w: 2.4, h: 1.8, draw: sofa },
  fridge: { dw: 480, dh: 900, w: 1.0, h: 1.9, draw: fridge },
  bed: { dw: 800, dh: 540, w: 2.4, h: 1.62, draw: bed },
  doghouse: { dw: 600, dh: 640, w: 1.5, h: 1.6, draw: doghouse },
  tv: { dw: 1200, dh: 840, w: 3.4, h: 2.38, draw: tv },
  calendar: { dw: 760, dh: 760, w: 1.5, h: 1.5, draw: calendar },
  hospitalbed: { dw: 860, dh: 660, w: 2.4, h: 1.84, draw: hospitalbed },
  heartmonitor: { dw: 400, dh: 1000, w: 0.7, h: 1.75, draw: heartmonitor },
  pole: { dw: 600, dh: 1000, w: 3.0, h: 7.0, draw: pole },
  monitor: { dw: 1000, dh: 700, w: 2.2, h: 1.54, draw: monitor },
  cardbox: { dw: 500, dh: 420, w: 0.9, h: 0.76, draw: cardbox },
  desk: { dw: 800, dh: 500, w: 1.9, h: 1.19, draw: desk },
  rack: { dw: 500, dh: 1000, w: 1.1, h: 2.2, draw: rack },
  signs: { dw: 1000, dh: 900, w: 3.2, h: 2.88, draw: signs },
  ticker: { dw: 1200, dh: 680, w: 4.6, h: 2.6, draw: ticker },
  semi: { dw: 1400, dh: 500, w: 9.0, h: 3.2, draw: semi },
  forklift: { dw: 760, dh: 540, w: 2.6, h: 1.85, draw: forklift },
  fruitpile: { dw: 800, dh: 600, w: 2.4, h: 1.8, draw: fruitpile },
  containership: { dw: 1920, dh: 780, w: 36.0, h: 14.6, draw: containership },
  tugboat: { dw: 720, dh: 380, w: 6.0, h: 3.2, draw: tugboat },
  steamshovel: { dw: 900, dh: 620, w: 6.0, h: 4.1, draw: steamshovel },
  mosquito: { dw: 400, dh: 380, w: 1.6, h: 1.5, draw: mosquito },
  mixer: { dw: 820, dh: 400, w: 5.0, h: 2.45, draw: mixer },
  airplane: { dw: 1680, dh: 560, w: 16.0, h: 5.3, draw: airplane },
  excavator: { dw: 860, dh: 480, w: 6.0, h: 3.35, draw: excavator },
  rockpile: { dw: 740, dh: 520, w: 5.0, h: 3.5, draw: rockpile },
  tetrapods: { dw: 1000, dh: 420, w: 6.0, h: 2.5, draw: tetrapods },
  departures: { dw: 1000, dh: 640, w: 3.6, h: 2.3, draw: departures },
  escalator: { dw: 1000, dh: 840, w: 4.0, h: 3.36, draw: escalator },
  pipes: { dw: 1000, dh: 640, w: 5.0, h: 3.2, draw: pipes },
  cashcounter: { dw: 500, dh: 900, w: 1.2, h: 2.16, draw: cashcounter },
  blueprint: { dw: 720, dh: 660, w: 2.2, h: 2.0, draw: blueprint },
  subwaymap: { dw: 1000, dh: 750, w: 3.0, h: 2.25, draw: subwaymap },
  ribbon: { dw: 1000, dh: 680, w: 4.0, h: 2.7, draw: ribbon },
  oldcar: { dw: 740, dh: 460, w: 4.2, h: 2.6, draw: oldcar },
};
export { mix };
