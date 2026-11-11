// Full-screen animated 2D "explainer" scenes in the same ink-outlined cartoon look: maps, a globe, a seabed cross-section
// and the outro loop arrow. Everything is SVG driven by n = frames since the scene started (deterministic per frame).
import React from "react";
import { AbsoluteFill } from "remotion";

const INK = "#1b1320";
const SW = 9;
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => { const u = clamp(x); return u * u * (3 - 2 * u); };
const pop = (n: number, a: number) => { const u = clamp((n - a) / 8); return u <= 0 ? 0 : u < 1 ? 1.15 * Math.sin((u * Math.PI) / 2) + (u > 0.7 ? -0.15 * (u - 0.7) / 0.3 : 0) : 1; };
const label = (x: number, y: number, s: string, size = 56, fill = "#ffffff", rot = 0) => (
  <text x={x} y={y} fontSize={size} fontFamily="Arial Black, Arial" fontWeight={900} textAnchor="middle" fill={fill} stroke={INK} strokeWidth={size / 5}
    paintOrder="stroke" transform={rot ? `rotate(${rot} ${x} ${y})` : undefined}>{s}</text>);
const waves = (n: number, col: string, W = 1080, H = 1920, step = 120) => {
  const out: React.ReactNode[] = [];
  for (let y = 60; y < H; y += step) for (let x = ((y / step) % 2) * 90 - 40; x < W; x += 180) {
    const dx = 14 * Math.sin((n + x + y) / 22);
    out.push(<path key={`${x}_${y}`} d={`M${x + dx} ${y} q 22 -16 44 0 q 22 16 44 0`} stroke={col} strokeWidth={6} fill="none" strokeLinecap="round" />);
  }
  return out;
};
const truck = (x: number, y: number, rot: number, col = "#e2453c", s = 1) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-34} y={-15} width={50} height={30} rx={5} fill="#f2efe8" stroke={INK} strokeWidth={5} />
    <rect x={16} y={-13} width={20} height={26} rx={5} fill={col} stroke={INK} strokeWidth={5} />
  </g>);
const ship = (x: number, y: number, rot: number, s = 1) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M-60 -16 L44 -16 L64 0 L44 16 L-60 16 Z" fill="#c8323a" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {[-46, -24, -2, 20].map((cx, i) => <rect key={i} x={cx} y={-11} width={18} height={22} fill={["#3f6fb5", "#ffd23f", "#39d98a", "#ff7a1a"][i]} stroke={INK} strokeWidth={3} />)}
  </g>);

// ---------------- Manhattan: island with bridges; "jam" = a truck stops at the toll and the queue grows; "night" = motherboard grid
const Manhattan: React.FC<{ n: number; mode: string }> = ({ n, mode }) => {
  const night = mode === "night";
  const island = "M520 160 L640 220 L700 520 L690 900 L640 1300 L560 1650 L470 1760 L420 1600 L440 1200 L470 800 L470 420 Z";
  const bridges: [number, number, number, number][] = [[470, 520, 120, 470], [690, 640, 980, 600], [680, 980, 1000, 1010], [450, 1300, 90, 1380], [640, 1300, 980, 1420]];
  const zoom = 1 + 0.12 * ease(n / 90);
  return (
    <AbsoluteFill style={{ background: night ? "#0b1030" : "#3f8fc0" }}>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ transform: `scale(${zoom})` }}>
        {waves(n, night ? "rgba(80,120,255,0.25)" : "rgba(255,255,255,0.35)")}
        <path d="M0 0 L300 0 L260 300 L120 700 L60 1200 L0 1500 Z" fill={night ? "#141a3a" : "#7cbf5a"} stroke={INK} strokeWidth={SW} />
        <path d="M1080 0 L820 0 L860 400 L1000 900 L940 1400 L1080 1700 Z" fill={night ? "#141a3a" : "#7cbf5a"} stroke={INK} strokeWidth={SW} />
        {bridges.map(([x0, y0, x1, y1], i) => <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={night ? "#6b7ad9" : "#c9ccd2"} strokeWidth={26} strokeLinecap="round" />)}
        {bridges.map(([x0, y0, x1, y1], i) => <line key={"o" + i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={INK} strokeWidth={4} strokeDasharray="18 14" />)}
        <path d={island} fill={night ? "#1d1640" : "#d9d2c3"} stroke={INK} strokeWidth={SW} />
        <clipPath id="isl"><path d={island} /></clipPath>
        <g clipPath="url(#isl)">
          {Array.from({ length: 34 }, (_, k) => <line key={"h" + k} x1={380} y1={200 + k * 48} x2={760} y2={140 + k * 48} stroke={night ? "#39d9ff" : "#b8ae9c"} strokeWidth={night ? 4 : 5} opacity={night ? 0.55 + 0.45 * Math.sin((n + k * 7) / 9) : 1} />)}
          {Array.from({ length: 8 }, (_, k) => <line key={"v" + k} x1={480 + k * 30} y1={150} x2={420 + k * 30} y2={1800} stroke={night ? "#ffd23f" : "#b8ae9c"} strokeWidth={night ? 4 : 5} opacity={night ? 0.8 : 1} />)}
          <rect x={530} y={760} width={60} height={200} fill={night ? "#163a2a" : "#7cbf5a"} stroke={INK} strokeWidth={5} />
          {night && Array.from({ length: 26 }, (_, k) => { const t = ((n * 4 + k * 61) % 1600) / 1600; return <circle key={"p" + k} cx={450 + (k % 8) * 30 - t * 60} cy={160 + t * 1600} r={7} fill={k % 3 ? "#39d9ff" : "#ffd23f"} />; })}
        </g>
        {!night && bridges.map(([x0, y0, x1, y1], i) => {
          // trucks crawl in along every bridge; on bridge 0 one stops at the toll and the queue grows behind it
          if (i === 0 && mode === "jam") {
            const stopped = n > 18, q = Math.min(7, Math.floor(Math.max(0, n - 18) / 6));
            const items = [<rect key="toll" x={x0 - 70} y={y0 - 70} width={34} height={60} fill="#ffd23f" stroke={INK} strokeWidth={5} />];
            for (let k = 0; k <= q; k++) {
              const t = stopped ? 0.18 + k * 0.1 : 0.9 - (n / 18) * 0.72;
              items.push(<g key={"q" + k}>{truck(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, (Math.atan2(y0 - y1, x0 - x1) * 180) / Math.PI, k ? "#ff9a2e" : "#e2453c")}</g>);
            }
            if (stopped) items.push(<g key="bang">{label(x0 - 160, y0 - 90, "STOP!", 64, "#ff3b3b", -8)}</g>);
            return <g key={"t" + i}>{items}</g>;
          }
          const t = ((n * 0.012 + i * 0.27) % 1);
          return <g key={"t" + i}>{truck(x1 + (x0 - x1) * t, y1 + (y0 - y1) * t, (Math.atan2(y0 - y1, x0 - x1) * 180) / Math.PI)}</g>;
        })}
        {label(560, 120, night ? "THE CITY NEVER SLEEPS" : "MANHATTAN", 64)}
        {!night && label(560, 1870, "0 FARMS", 70, "#ffe14d")}
      </svg>
    </AbsoluteFill>);
};

// ---------------- Osaka Bay: the coast, a red square marker drops into the sea, ripples, distance label
const Osaka: React.FC<{ n: number }> = ({ n }) => {
  const drop = ease((n - 8) / 12), y = -200 + drop * 1150;
  return (
    <AbsoluteFill style={{ background: "#2f8fd0" }}>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        {waves(n, "rgba(255,255,255,0.3)")}
        <path d="M0 0 L1080 0 L1080 520 L900 600 L760 560 L600 720 L420 640 L260 820 L120 760 L0 900 Z" fill="#7cbf5a" stroke={INK} strokeWidth={SW} />
        {[[180, 300], [380, 420], [620, 260], [820, 380], [300, 600]].map(([x, yy], i) => <g key={i}><rect x={x} y={yy} width={70} height={90} fill="#e9e2d2" stroke={INK} strokeWidth={5} /><polygon points={`${x - 8},${yy} ${x + 35},${yy - 40} ${x + 78},${yy}`} fill="#c8553d" stroke={INK} strokeWidth={5} /></g>)}
        {label(520, 180, "OSAKA", 72)}
        <line x1={560} y1={760} x2={560} y2={y} stroke="#ffffff" strokeWidth={6} strokeDasharray="20 16" opacity={drop > 0.05 && drop < 1 ? 1 : 0} />
        {drop >= 1 && [0, 1, 2].map((k) => { const r = ((n - 20 + k * 10) % 30) * 8; return <circle key={k} cx={560} cy={1000} r={r} fill="none" stroke="#ffffff" strokeWidth={6} opacity={1 - r / 240} />; })}
        <rect x={470} y={y - 70} width={180} height={140} rx={10} fill="#e2453c" stroke={INK} strokeWidth={SW} />
        {n > 22 && label(560, 1260, "5 KM OUT AT SEA", 64, "#ffe14d")}
        {n > 30 && label(560, 1360, "NOBODY TO COMPLAIN", 48)}
      </svg>
    </AbsoluteFill>);
};

// ---------------- Americas: the long way round Cape Horn is crossed out, a ship zips through Panama
const Panama: React.FC<{ n: number }> = ({ n }) => {
  const around = "M880 420 C 980 900 900 1500 640 1820 C 520 1900 420 1800 360 1500 C 300 1200 240 1000 220 900";
  const t = ease((n - 14) / 14);
  const sx = 640 + (330 - 640) * t, sy = 860 + (900 - 860) * t;
  return (
    <AbsoluteFill style={{ background: "#2f8fd0" }}>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        {waves(n, "rgba(255,255,255,0.28)")}
        <path d="M80 80 L760 60 L820 300 L700 520 L620 760 L560 840 L470 800 L360 640 L200 520 L120 300 Z" fill="#7cbf5a" stroke={INK} strokeWidth={SW} />
        <path d="M560 840 L520 900 L470 880" fill="none" stroke={INK} strokeWidth={SW} />
        <path d="M470 880 L620 960 L820 1080 L860 1300 L760 1560 L620 1780 L560 1700 L520 1400 L440 1150 L400 980 Z" fill="#6aae4a" stroke={INK} strokeWidth={SW} />
        <path d={around} fill="none" stroke="#ffffff" strokeWidth={10} strokeDasharray="26 20" opacity={0.9} />
        {n > 10 && <path d={around} fill="none" stroke="#e2453c" strokeWidth={14} strokeDasharray={2600} strokeDashoffset={2600 * (1 - ease((n - 10) / 10))} opacity={0.85} />}
        {n > 14 && <path d="M640 860 L330 900" stroke="#ffe14d" strokeWidth={12} strokeDasharray="30 18" />}
        {t > 0 && t < 1 && [1, 2, 3].map((k) => <line key={k} x1={sx + 40 * k} y1={sy - 20 + k * 8} x2={sx + 40 * k + 70} y2={sy - 20 + k * 8} stroke="#ffffff" strokeWidth={6} strokeLinecap="round" />)}
        {ship(sx, sy, 186, 1.1)}
        <circle cx={505} cy={870} r={14 + 4 * Math.sin(n / 3)} fill="#ffe14d" stroke={INK} strokeWidth={5} />
        {label(505, 820, "PANAMA", 50)}
        {n > 24 && label(540, 1250, "-8,000 MILES", 92, "#ffe14d", -6)}
        {label(540, 1880, "ONE AFTERNOON", 60)}
      </svg>
    </AbsoluteFill>);
};

// ---------------- spinning globe, glowing ship lanes converging on Panama
const World: React.FC<{ n: number; text?: string }> = ({ n, text }) => {
  const [top, bottom] = text ? [text.split("|")[0], text.split("|")[1] ?? ""] : ["ONE BOTTLENECK", "40% OF US CONTAINERS"];
  const off = ((n * 3) % 900);
  const blobs = [[100, 760, 260, 180], [420, 820, 200, 260], [700, 700, 260, 200], [600, 1100, 160, 220], [250, 1120, 150, 200]];
  const target: [number, number] = [520, 960];
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #1d2a6a, #070b22)" }}>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        {Array.from({ length: 70 }, (_, k) => <circle key={k} cx={(k * 137) % 1080} cy={(k * 251) % 1920} r={k % 5 ? 2 : 4} fill="#ffffff" opacity={0.6} />)}
        <clipPath id="globe"><circle cx={540} cy={960} r={420} /></clipPath>
        <circle cx={540} cy={960} r={420} fill="#2f8fd0" stroke={INK} strokeWidth={SW + 3} />
        <g clipPath="url(#globe)">
          {[0, 900].map((dx) => blobs.map(([x, y, w, h], i) => <ellipse key={`${dx}_${i}`} cx={((x + off + dx) % 1800) - 300} cy={y} rx={w / 2} ry={h / 2} fill="#7cbf5a" stroke={INK} strokeWidth={6} />))}
          {Array.from({ length: 12 }, (_, k) => {
            const a = (k / 12) * Math.PI * 2, x0 = 540 + 420 * Math.cos(a), y0 = 960 + 420 * Math.sin(a);
            const d = `M${x0} ${y0} Q ${540 + 200 * Math.cos(a + 0.6)} ${960 + 200 * Math.sin(a + 0.6)} ${target[0]} ${target[1]}`;
            return <path key={k} d={d} fill="none" stroke="#ffe14d" strokeWidth={6} strokeDasharray="14 14" strokeDashoffset={-n * 3} opacity={0.9} />;
          })}
        </g>
        <circle cx={540} cy={960} r={420} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={30} />
        <circle cx={target[0]} cy={target[1]} r={20 + 8 * Math.sin(n / 3)} fill="#ff3b3b" stroke={INK} strokeWidth={6} />
        <g transform={`translate(540 1560) scale(${pop(n, 6)})`}>{label(0, 0, bottom, 70, "#ffe14d")}</g>
        {label(540, 420, top, 70)}
      </svg>
    </AbsoluteFill>);
};

// ---------------- a subway line map: phase 1 drawn, phase 2 dashed and crossed out
const Subway: React.FC<{ n: number; text?: string }> = ({ n, text }) => (
  <AbsoluteFill style={{ background: "#f2efe8" }}>
    <svg viewBox="0 0 1080 1920" width="100%" height="100%">
      {Array.from({ length: 20 }, (_, k) => <line key={k} x1={0} y1={k * 100} x2={1080} y2={k * 100} stroke="#e0dacd" strokeWidth={3} />)}
      <path d="M540 1700 L540 1100" stroke="#00933c" strokeWidth={34} strokeLinecap="round" strokeDasharray={600} strokeDashoffset={600 * (1 - ease(n / 12))} />
      <path d="M540 1100 L540 300" stroke="#00933c" strokeWidth={20} strokeDasharray="30 26" opacity={0.6} />
      {[1700, 1500, 1300, 1100].map((y, i) => <circle key={i} cx={540} cy={y} r={28} fill="#ffffff" stroke={INK} strokeWidth={8} opacity={n > 4 + i * 3 ? 1 : 0} />)}
      {n > 18 && <path d="M380 560 L700 860 M700 560 L380 860" stroke="#e2453c" strokeWidth={26} strokeLinecap="round" />}
      {n > 22 && label(540, 1000, text || "COMING NEVER", 86, "#e2453c", -6)}
      {label(540, 200, "SECOND AVE LINE", 66, "#00933c")}
    </svg>
  </AbsoluteFill>);

// ---------------- seabed cross-section: a rock island drops through the sea and sinks into soft clay
const Mud: React.FC<{ n: number }> = ({ n }) => {
  const fall = ease(n / 14), sink = Math.max(0, n - 14) * 3.2;
  const y = -400 + fall * 1080 + sink;
  return (
    <AbsoluteFill style={{ background: "#9fd4ff" }}>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        <rect x={0} y={420} width={1080} height={700} fill="#2f8fd0" stroke={INK} strokeWidth={SW} />
        {waves(n, "rgba(255,255,255,0.3)", 1080, 1120, 140).filter((_, i) => i > 5)}
        <rect x={0} y={1120} width={1080} height={520} fill="#8a5a34" stroke={INK} strokeWidth={SW} />
        {Array.from({ length: 30 }, (_, k) => <ellipse key={k} cx={(k * 173) % 1080} cy={1170 + ((k * 97) % 440)} rx={26} ry={9} fill="#6b4426" />)}
        <rect x={0} y={1640} width={1080} height={280} fill="#5e5a56" stroke={INK} strokeWidth={SW} />
        <g transform={`translate(540 ${y})`}>
          <path d="M-300 260 L-240 40 L-120 0 L120 0 L240 40 L300 260 Z" fill="#a8a29a" stroke={INK} strokeWidth={SW} />
          {[[-160, 120], [-40, 80], [90, 150], [180, 90], [-220, 200], [20, 200]].map(([x, yy], i) => <ellipse key={i} cx={x} cy={yy} rx={42} ry={30} fill="#8e877e" stroke={INK} strokeWidth={4} />)}
          <rect x={-200} y={-40} width={400} height={40} fill="#5e6470" stroke={INK} strokeWidth={6} />
          <rect x={-120} y={-110} width={240} height={70} rx={20} fill="#c9e6f2" stroke={INK} strokeWidth={6} />
          <path d="M-60 -170 L40 -150 L70 -160 L60 -140 L-50 -150 Z" fill="#ffffff" stroke={INK} strokeWidth={4} />
        </g>
        {label(540, 1420, "SOFT CLAY", 72, "#f2d29a")}
        {label(540, 1790, "BEDROCK", 54, "#d9d2c3")}
        <g>{[0, 1, 2, 3].map((k) => <g key={k}><line x1={80} y1={1120 + k * 130} x2={140} y2={1120 + k * 130} stroke={INK} strokeWidth={6} />{label(200, 1135 + k * 130, `${k * 20} FT`, 34)}</g>)}</g>
        {n > 16 && label(540, 300, "SINKING...", 90, "#ff3b3b", -4)}
      </svg>
    </AbsoluteFill>);
};

// ---------------- outro: black with a bold ink loop arrow drawing itself
const Outro: React.FC<{ n: number }> = ({ n }) => {
  const d = "M540 560 A 300 300 0 1 1 300 700";
  const L = 1700, u = ease(n / 18);
  return (
    <AbsoluteFill style={{ background: "#07060a", opacity: ease(n / 6) }}>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        <path d={d} fill="none" stroke="#ffffff" strokeWidth={44} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - u)} />
        <path d={d} fill="none" stroke={INK} strokeWidth={14} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - u)} />
        {u > 0.95 && <polygon points="250,640 380,700 280,800" fill="#ffffff" stroke={INK} strokeWidth={10} strokeLinejoin="round" />}
        <g transform={`translate(540 1420) scale(${pop(n, 14)})`}>{label(0, 0, "FOLLOW", 120, "#ffe14d")}</g>
      </svg>
    </AbsoluteFill>);
};

export const MAP_KINDS = ["manhattan", "osaka", "panama", "world", "subway", "mud", "outro"];
export const MapScene: React.FC<{ kind: string; n: number; text?: string }> = ({ kind, n, text }) => {
  switch (kind) {
    case "manhattan": return <Manhattan n={n} mode={text ?? "jam"} />;
    case "osaka": return <Osaka n={n} />;
    case "panama": return <Panama n={n} />;
    case "world": return <World n={n} text={text} />;
    case "subway": return <Subway n={n} text={text} />;
    case "mud": return <Mud n={n} />;
    case "outro": return <Outro n={n} />;
    default: return null;
  }
};
