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
};
export { mix };
