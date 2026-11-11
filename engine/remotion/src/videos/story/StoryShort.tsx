// AI Reels Studio - generic storyboard-driven short. Same post chain as the template (bridge/Bridge.tsx):
// ink (own pass) -> lens blur pre + main -> bloom (emissive only) -> NEUTRAL tone map -> grade, MSAA 4.
// Ink runs before the DOF so outlines blur with what they belong to (the documented "blur erases ink" bug).
// All pixel-sized parameters are specified at 1080x1920 and scale with the output height.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, CalculateMetadataFunction, interpolate, staticFile, Img } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { loadKit } from "../bridge/world";
import { InkPass, noInkFallback } from "../bridge/ink";
import { LensBlur } from "../bridge/lensblur";
import { GradeEffect } from "../bridge/grade";
import { Kit } from "../bridge/build";
import { StoryWorld } from "./world";
import { GRADES3 } from "./looks";
import type { Storyboard, LightName } from "./types";
import { DEMO_STORYBOARD } from "./demo";
import { MapScene, MAP_KINDS } from "./mapscenes";

export type StoryProps = { storyboard: Storyboard; dpr?: number };

const makeBloom = () => {
  const b = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.5, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6 });
  const mip = b.mipmapBlurPass, setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
  return b;
};
const fwd = new THREE.Vector3(), fpt = new THREE.Vector3();

/** Montserrat (SIL OFL 1.1, public/fonts) for captions: the classic Shorts caption face */
let fontReady: Promise<void> | null = null;
const useCaptionFont = () => {
  const [handle] = useState(() => delayRender("caption font"));
  useEffect(() => {
    fontReady ??= new FontFace("Montserrat", `url(${staticFile("fonts/Montserrat-Variable.ttf")})`, { weight: "100 900" }).load()
      .then((f) => { (document.fonts as unknown as { add: (x: FontFace) => void }).add(f); }).catch(() => undefined);
    fontReady.then(() => continueRender(handle));
  }, [handle]);
};

const useKit = () => {
  const [kit, setKit] = useState<Kit | null>(null);
  const [handle] = useState(() => delayRender("story kit"));
  useEffect(() => { loadKit().then((k) => { setKit(k); continueRender(handle); }); }, [handle]);
  return kit;
};

const Inner: React.FC<{ idx: number; world: StoryWorld; sb: Storyboard }> = ({ idx, world, sb }) => {
  const f = useCurrentFrame();
  const { camera, scene } = useThree();
  const lite = sb.graphics === "simple";   // simple graphics: no lens blur / bloom (the two costliest passes), MSAA 2
  const on = { ink: true, lens: !lite, bloom: !lite, grade: true, ...(sb.post ?? {}) };
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera),
    lens: new LensBlur({ maxCoC: 24, nearScale: 1.2 }),
    bloom: makeBloom(),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    grade: new GradeEffect(GRADES3.day, 1),
  }), [camera, scene]);
  useEffect(() => () => fx.ink.dispose(), [fx]);
  const post = useMemo(() => (
    <EffectComposer multisampling={lite ? 2 : 4}>
      {[
        on.ink && <primitive key="ink" object={fx.ink} dispose={null} />,
        on.lens && <primitive key="pre" object={fx.lens.pre} dispose={null} />,
        on.lens && <primitive key="lens" object={fx.lens.main} dispose={null} />,
        on.bloom && <primitive key="bloom" object={fx.bloom} dispose={null} />,
        <primitive key="tone" object={fx.tone} dispose={null} />,
        on.grade && <primitive key="grade" object={fx.grade} dispose={null} />,
      ].filter((e): e is React.JSX.Element => !!e)}
    </EffectComposer>
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [fx]);
  const cam = camera as THREE.PerspectiveCamera;
  const s = sb.scenes[idx];
  const target = world.update(idx, f, cam, scene);
  noInkFallback(world.root);
  const d = s.dof ?? { cInf: 0 };
  cam.getWorldDirection(fwd);
  const eyes = d.focusActor !== undefined ? world.eyesOf(idx, d.focusActor, f) : null;
  if (eyes) fpt.copy(eyes); else if (d.focus) fpt.set(...d.focus); else fpt.copy(target);
  fx.lens.focus = Math.max(0.3, fpt.sub(cam.position).dot(fwd));
  fx.lens.cInf = d.cInf;
  const tag = fx.grade as unknown as { _light?: LightName };
  if (tag._light !== s.light) { fx.grade.set(GRADES3[s.light]); tag._light = s.light; }
  // keyed by scene: R3F does not swap a <primitive> whose `object` prop changes, so after a crossfade the base canvas
  // kept rendering the PREVIOUS scene's world (found by QA on the lighthouse master: b05/b12 showed the wrong place)
  // hybrid: plain render (no composer) so the canvas stays transparent around the cast; Blender's frame shows through
  return (<><primitive key={`world-${idx}`} object={world.root} dispose={null} />{sb.hybrid ? null : post}</>);
};

/** film looks per scene (the past in sepia, black-and-white archive, cool / warm grades) */
const LOOKS: Record<string, string> = {
  sepia: "sepia(0.82) contrast(1.06) brightness(0.97) saturate(1.1)", bw: "grayscale(1) contrast(1.15) brightness(1.02)",
  cool: "hue-rotate(-8deg) saturate(1.1) brightness(0.98)", warm: "sepia(0.18) saturate(1.2) brightness(1.03)",
};
/** Blender render path: the scene's 3D world comes from Blender's frames (public/<sb.blender>/<scene>/f_<frame>.jpg,
 *  rendered with transition handles); looks, transitions, captions, HUD and audio stay here */
const BlenderView: React.FC<{ idx: number; sb: Storyboard; alpha: number; transform?: string; filter?: string }> = ({ idx, sb, alpha, transform, filter }) => {
  const f = useCurrentFrame();
  const look = sb.scenes[idx]?.look;
  const fl = [look ? LOOKS[look] : "", filter ?? ""].join(" ").trim();
  const s = sb.scenes[idx];
  const fr = Math.max(s.startFrame - 8, Math.min(s.endFrame + 8, f));
  return (
    <AbsoluteFill style={{ opacity: alpha, ...(transform ? { transform } : {}), ...(fl ? { filter: fl } : {}) }}>
      <Img src={staticFile(`${sb.blender}/${idx}/f_${String(fr).padStart(5, "0")}.jpg`)} style={{ width: "100%", height: "100%" }} />
      {look === "sepia" || look === "bw" ? <AbsoluteFill style={{ boxShadow: `inset 0 0 ${sb.height * 0.12}px rgba(40,24,10,0.65)` }} /> : null}
    </AbsoluteFill>
  );
};
const SceneView: React.FC<{ idx: number; kit: Kit; sb: Storyboard; alpha: number; dpr?: number; transform?: string; filter?: string }> = ({ idx, kit, sb, alpha, dpr, transform, filter }) => {
  if (sb.blender && sb.hybrid) return (
    <AbsoluteFill style={{ opacity: alpha, ...(transform ? { transform } : {}), ...(filter ? { filter } : {}) }}>
      <BlenderView idx={idx} sb={sb} alpha={1} />
      <ThreeView idx={idx} kit={kit} sb={sb} alpha={1} dpr={dpr} />
    </AbsoluteFill>);
  if (sb.blender) return <BlenderView idx={idx} sb={sb} alpha={alpha} transform={transform} filter={filter} />;
  return <ThreeView idx={idx} kit={kit} sb={sb} alpha={alpha} dpr={dpr} transform={transform} filter={filter} />;
};
const ThreeView: React.FC<{ idx: number; kit: Kit; sb: Storyboard; alpha: number; dpr?: number; transform?: string; filter?: string }> = ({ idx, kit, sb, alpha, dpr, transform, filter }) => {
  const world = useMemo(() => new StoryWorld(kit, sb, idx), [kit, sb, idx]); // one world per scene (own sight-line culling)
  const look = sb.scenes[idx]?.look;
  const fl = [look ? LOOKS[look] : "", filter ?? ""].join(" ").trim();
  return (
    <AbsoluteFill style={{ opacity: alpha, ...(transform ? { transform } : {}), ...(fl ? { filter: fl } : {}) }}>
      <ThreeCanvas width={sb.width} height={sb.height} {...(dpr ? { dpr } : {})} shadows
        gl={{ antialias: !!sb.hybrid, alpha: !!sb.hybrid, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0,
          ...(sb.hybrid ? { toneMapping: THREE.NeutralToneMapping } : {}) }}
        camera={{ fov: 40, near: 0.2, far: 1500 }}>
        <Inner idx={idx} world={world} sb={sb} />
      </ThreeCanvas>
      {look === "sepia" || look === "bw" ? <AbsoluteFill style={{ boxShadow: `inset 0 0 ${sb.height * 0.12}px rgba(40,24,10,0.65)` }} /> : null}
    </AbsoluteFill>
  );
};

type Layer = { idx: number; alpha: number; transform?: string; filter?: string };
const ease = (x: number) => { const u = Math.max(0, Math.min(1, x)); return u * u * (3 - 2 * u); };
/** layers at frame f: base scene plus the transition into the next one:
 *  xfade 8 f crossfade; dissolve 14 f soft crossfade with a little blur; zoom = punch through the outgoing frame (scale + blur)
 *  into the next; whip = a fast horizontal swipe with motion blur */
export const layersAt = (sb: Storyboard, f: number): Layer[] => {
  for (let i = 1; i < sb.scenes.length; i++) {
    const s = sb.scenes[i], t = s.transitionIn, a = s.startFrame;
    if (t === "xfade" && f >= a - 4 && f < a + 4) return [{ idx: i - 1, alpha: 1 }, { idx: i, alpha: (f - (a - 4) + 1) / 9 }];
    if (t === "dissolve" && f >= a - 7 && f < a + 7) {
      const u = ease((f - (a - 7) + 1) / 15);
      return [{ idx: i - 1, alpha: 1, filter: `blur(${(u * 6 * sb.height / 1920).toFixed(1)}px)` }, { idx: i, alpha: u, filter: `blur(${((1 - u) * 6 * sb.height / 1920).toFixed(1)}px)` }];
    }
    if (t === "flow" && f >= a - 6 && f < a + 7) {
      // motion dissolve (RicksClips): the outgoing shot keeps travelling one way, the next one arrives already moving the
      // same way, crossfading in 13 frames (~0.43 s) — it reads as one continuous camera move, never as a cut
      const u = ease((f - (a - 6) + 1) / 13), dir = [[0, -1], [-1, 0], [0, 1], [1, 0]][i % 4];
      const sh = (k: number) => `translate(${(dir[0] * k).toFixed(2)}%, ${(dir[1] * k).toFixed(2)}%)`;
      return [{ idx: i - 1, alpha: 1, transform: `${sh(9 * u)} scale(${1 + 0.07 * u})`, filter: `blur(${(u * 3 * sb.height / 1920).toFixed(1)}px)` },
        { idx: i, alpha: u, transform: `${sh(-9 * (1 - u))} scale(${1.07 - 0.07 * u})`, filter: `blur(${((1 - u) * 3 * sb.height / 1920).toFixed(1)}px)` }];
    }
    if (t === "zoom" && f >= a - 6 && f < a + 6) {
      if (f < a) { const u = ease((f - (a - 6) + 1) / 6); return [{ idx: i - 1, alpha: 1, transform: `scale(${1 + 0.45 * u})`, filter: `blur(${(u * 16 * sb.height / 1920).toFixed(1)}px) brightness(${1 + 0.3 * u})` }]; }
      const u = ease((f - a + 1) / 6); return [{ idx: i, alpha: 1, transform: `scale(${1.3 - 0.3 * u})`, filter: `blur(${((1 - u) * 14 * sb.height / 1920).toFixed(1)}px)` }];
    }
    if (t === "whip" && f >= a - 5 && f < a + 5) {
      if (f < a) { const u = ease((f - (a - 5) + 1) / 5); return [{ idx: i - 1, alpha: 1, transform: `translateX(${-70 * u}%) scaleX(${1 + 0.2 * u})`, filter: `blur(${(u * 22 * sb.height / 1920).toFixed(1)}px)` }]; }
      const u = ease((f - a + 1) / 5); return [{ idx: i, alpha: 1, transform: `translateX(${70 * (1 - u)}%) scaleX(${1.2 - 0.2 * u})`, filter: `blur(${((1 - u) * 22 * sb.height / 1920).toFixed(1)}px)` }];
    }
  }
  const i = sb.scenes.findIndex((s) => f >= s.startFrame && f < s.endFrame);
  return [{ idx: i < 0 ? sb.scenes.length - 1 : i, alpha: 1 }];
};

const Overlays: React.FC<{ sb: Storyboard }> = ({ sb }) => {
  const f = useCurrentFrame();
  const H = sb.height, k = H / 1920;
  const items: React.ReactNode[] = [];
  sb.scenes.forEach((s) => (s.textOverlays ?? []).forEach((o, i) => {
    if (f < o.frame || f >= o.frame + o.dur) return;
    const a = interpolate(f, [o.frame, o.frame + 6, o.frame + o.dur - 6, o.frame + o.dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // a phone banner / camcorder frame owns the top of the picture: the label drops below it
    const hk = s.hud?.kind;
    const y = o.position === "top" ? (hk === "phone" || hk === "rec" ? 0.2 : hk === "panel" || hk === "bar" || hk === "news" ? 0.53 : 0.12) : o.position === "center" ? 0.42 : 0.72;
    const cta = o.style === "cta";
    items.push(
      <div key={`${s.sceneId}-${i}`} style={{ position: "absolute", left: 0, right: 0, top: H * y, display: "flex", justifyContent: "center", opacity: a,
        transform: `scale(${0.92 + 0.08 * a})` }}>
        <div style={{ fontFamily: sb.brand?.font ?? '"Trebuchet MS", "Segoe UI", Arial, sans-serif', fontWeight: 800, fontSize: (cta ? 74 : 66) * k,
          color: cta ? sb.brand?.text ?? "#ffffff" : "#ffffff", background: cta ? sb.brand?.primary ?? "#c8553d" : "rgba(20,14,24,0.55)",
          padding: `${18 * k}px ${40 * k}px`, borderRadius: 28 * k, maxWidth: 0.86 * sb.width, textAlign: "center", lineHeight: 1.15,
          border: cta ? `${6 * k}px solid #241726` : "none", textShadow: cta ? "none" : `0 ${3 * k}px 0 #241726` }}>{o.text}</div>
      </div>);
  }));
  // diegetic screen layers (camcorder / phone / news / map) for the scene on screen
  const cur = sb.scenes.find((s) => f >= s.startFrame && f < s.endFrame);
  if (cur?.hud) items.push(<Hud key="hud" kind={cur.hud.kind} text={cur.hud.text} f={f} f0={cur.startFrame} sb={sb} />);
  // word-by-word captions (reference Shorts look): 1-2 words, big white with a black outline, popping in on the syllable;
  // impact / effect words in yellow. Tiny function words ride with the next word ("a buddy", "the car").
  if (sb.captions?.enabled && sb.captions.words?.length) {
    const groups = captionGroups(sb.captions.words);
    const t = f / sb.fps, g = groups.find((x) => t >= x.s - 0.05 && t < x.e);
    if (g) {
      const n = f - Math.round((g.s - 0.05) * sb.fps);
      const pop = n < 0 ? 1 : n < 3 ? [1.2, 1.1, 1.03][n] : 1;
      // low third of the frame (under the characters' feet / waist line), medium size: the action stays readable
      const capY = cur?.hud && ["manhattan", "osaka", "panama", "world", "subway", "mud"].includes(cur.hud.kind) ? 0.84 : 0.765;
      if (cur?.hud?.kind !== "outro") items.push(
        <div key="cap" style={{ position: "absolute", left: 0, right: 0, top: H * capY, display: "flex", justifyContent: "center" }}>
          <div style={{ fontFamily: '"Montserrat", "Arial Black", "Segoe UI Black", Arial, sans-serif', fontWeight: 900, fontSize: 82 * k, letterSpacing: -0.5 * k,
            color: g.hot ? "#ffe14d" : "#ffffff", WebkitTextStroke: `${11 * k}px #0d0b10`, paintOrder: "stroke fill",
            textShadow: `0 ${5 * k}px ${8 * k}px rgba(0,0,0,0.4)`, transform: `scale(${pop}) rotate(${g.hot ? -2 : 0}deg)`, maxWidth: 0.9 * sb.width,
            textAlign: "center", lineHeight: 1.05 }}>{g.text}</div>
        </div>);
    }
  }
  return <AbsoluteFill>{items}</AbsoluteFill>;
};

const SMALL = new Set(["a", "an", "the", "i", "to", "of", "in", "on", "at", "my", "his", "her", "and", "but", "so", "it", "is", "he", "she", "we", "you", "for", "by", "or", "no"]);
type CapWord = { w: string; s: number; e: number; hot?: boolean };
const captionGroups = (ws: CapWord[]) => {
  const out: { text: string; s: number; e: number; hot: boolean }[] = [];
  for (let i = 0; i < ws.length; i++) {
    const w = ws[i], nx = ws[i + 1];
    const bare = w.w.toLowerCase().replace(/[^a-z']/g, "");
    let text = w.w.replace(/[.,;:]+$/, ""), e = w.e, hot = !!w.hot;
    // join a short function word with the next one when they run together (no pause, no sentence end)
    if (nx && SMALL.has(bare) && !/[.!?,;:]$/.test(w.w) && nx.s - w.e < 0.12 && (text + nx.w).length <= 12) {
      text = `${text} ${nx.w.replace(/[.,;:]+$/, "")}`; e = nx.e; hot = hot || !!nx.hot; i++;
    }
    out.push({ text, s: w.s, e, hot });
  }
  // each group stays up until the next one starts (no flicker in the gaps), at most 0.5 s after it was spoken
  for (let i = 0; i < out.length; i++) out[i].e = Math.min(out[i].e + 0.5, out[i + 1] ? out[i + 1].s - 0.05 : out[i].e + 0.5);
  return out;
};

/** screen layers drawn over the 3D picture: they make a shot read as "seen through" a device */
const Hud: React.FC<{ kind: string; text?: string; f: number; f0: number; sb: Storyboard }> = ({ kind, text, f, f0, sb }) => {
  const k = sb.height / 1920, W = sb.width, H = sb.height, n = f - f0;
  const mono = '"Consolas", "Courier New", monospace';
  if (kind === "rec") {
    const secs = Math.floor((f / sb.fps) + 3 * 3600 + 17 * 60), hh = Math.floor(secs / 3600) % 24, mm = Math.floor(secs / 60) % 60, ss = secs % 60;
    const tc = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
    const br = (s: React.CSSProperties) => <div style={{ position: "absolute", width: 90 * k, height: 90 * k, borderColor: "rgba(255,255,255,0.9)", borderStyle: "solid", borderWidth: 0, ...s }} />;
    return (
      <AbsoluteFill style={{ fontFamily: mono, color: "#fff", textShadow: `0 ${2 * k}px ${4 * k}px rgba(0,0,0,0.7)`,
        boxShadow: `inset 0 0 ${220 * k}px rgba(0,0,0,0.45)` }}>
        {br({ left: 60 * k, top: 150 * k, borderLeftWidth: 6 * k, borderTopWidth: 6 * k })}
        {br({ right: 60 * k, top: 150 * k, borderRightWidth: 6 * k, borderTopWidth: 6 * k })}
        {br({ left: 60 * k, bottom: 170 * k, borderLeftWidth: 6 * k, borderBottomWidth: 6 * k })}
        {br({ right: 60 * k, bottom: 170 * k, borderRightWidth: 6 * k, borderBottomWidth: 6 * k })}
        <div style={{ position: "absolute", left: 90 * k, top: 180 * k, fontSize: 52 * k, fontWeight: 700, display: "flex", alignItems: "center", gap: 16 * k }}>
          <span style={{ width: 34 * k, height: 34 * k, borderRadius: "50%", background: "#ff2a2a", opacity: Math.floor(f / 15) % 2 ? 0.25 : 1 }} />REC
        </div>
        <div style={{ position: "absolute", right: 90 * k, top: 186 * k, fontSize: 44 * k }}>{tc}</div>
        {text && <div style={{ position: "absolute", left: 90 * k, bottom: 200 * k, fontSize: 40 * k, opacity: 0.95 }}>{text}</div>}
        <div style={{ position: "absolute", right: 90 * k, bottom: 200 * k, fontSize: 40 * k }}>4K · 60</div>
      </AbsoluteFill>);
  }
  if (kind === "phone") {   // a notification banner dropping in from the top
    const y = interpolate(n, [0, 7], [-260, 140], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (x) => 1 - (1 - x) ** 3 });
    return (
      <AbsoluteFill>
        <div style={{ position: "absolute", left: 0.06 * W, right: 0.06 * W, top: y * k, background: "rgba(245,245,250,0.94)", borderRadius: 44 * k,
          padding: `${28 * k}px ${34 * k}px`, display: "flex", gap: 26 * k, alignItems: "center", boxShadow: `0 ${12 * k}px ${40 * k}px rgba(0,0,0,0.35)`,
          fontFamily: '"Segoe UI", Arial, sans-serif' }}>
          <div style={{ width: 96 * k, height: 96 * k, borderRadius: 24 * k, background: "linear-gradient(135deg,#ff6b5a,#ffb347)", flex: "none" }} />
          <div style={{ color: "#16141a" }}>
            <div style={{ fontSize: 34 * k, opacity: 0.6, fontWeight: 600 }}>NOW</div>
            <div style={{ fontSize: 46 * k, fontWeight: 800, lineHeight: 1.15 }}>{text ?? "New message"}</div>
          </div>
        </div>
      </AbsoluteFill>);
  }
  if (kind === "news") {    // breaking-news lower third + ticker
    const slide = interpolate(n, [0, 8], [-W, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (x) => 1 - (1 - x) ** 3 });
    return (
      <AbsoluteFill style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}>
        <div style={{ position: "absolute", left: slide, top: 0.43 * H, width: W, transform: `translateX(${0}px)` }}>
          <div style={{ display: "inline-block", background: "#d81e1e", color: "#fff", fontSize: 50 * k, padding: `${10 * k}px ${30 * k}px`, marginLeft: 50 * k }}>BREAKING NEWS</div>
          <div style={{ background: "rgba(250,250,252,0.96)", color: "#111", fontSize: 54 * k, padding: `${16 * k}px ${50 * k}px`, lineHeight: 1.1 }}>{text ?? "Developing story"}</div>
        </div>
      </AbsoluteFill>);
  }
  if (kind === "panel") {   // a floating UI window (store page, storage warning, clock): first line = title, rest = rows
    const [title, ...rows] = (text ?? "").split("|");
    const pop = interpolate(n, [0, 6], [0.6, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (x) => 1 - (1 - x) ** 3 });
    return (
      <AbsoluteFill style={{ fontFamily: '"Segoe UI", Arial, sans-serif' }}>
        <div style={{ position: "absolute", left: 0.08 * W, right: 0.08 * W, top: 0.14 * H, transform: `scale(${pop})`, background: "rgba(14,16,30,0.92)",
          border: `${5 * k}px solid #39d9ff`, borderRadius: 30 * k, boxShadow: `0 0 ${50 * k}px rgba(57,217,255,0.55)`, overflow: "hidden" }}>
          <div style={{ background: "#39d9ff", color: "#0d0f1e", fontWeight: 900, fontSize: 50 * k, padding: `${14 * k}px ${32 * k}px` }}>{title}</div>
          {rows.map((r, i) => <div key={i} style={{ color: r.includes("!") || r.includes("$") ? "#ffe14d" : "#ffffff", fontWeight: 800, fontSize: 56 * k,
            padding: `${14 * k}px ${32 * k}px`, borderTop: i ? `${2 * k}px solid rgba(255,255,255,0.12)` : "none" }}>{r}</div>)}
        </div>
      </AbsoluteFill>);
  }
  if (kind === "bar") {     // download / install progress bar: "LABEL|from|to" (percent), fills across the shot
    const [label, a0, a1, unit] = (text ?? "INSTALLING|0|99").split("|");
    const span = Math.max(1, sb.scenes.find((s) => s.startFrame === f0)!.endFrame - f0 - 6);
    const val = Number(a0) + (Number(a1) - Number(a0)) * Math.min(1, Math.max(0, n / span)) ** 0.6;
    const pc = unit ? (100 * val) / Math.max(1e-6, Math.max(Number(a0), Number(a1))) : val;   // with a unit: a gauge counting up to the target
    return (
      <AbsoluteFill style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}>
        <div style={{ position: "absolute", left: 0.08 * W, right: 0.08 * W, top: 0.15 * H, background: "rgba(14,16,30,0.9)", borderRadius: 26 * k, padding: 26 * k,
          boxShadow: `0 ${10 * k}px ${40 * k}px rgba(0,0,0,0.45)` }}>
          <div style={{ color: "#fff", fontSize: 44 * k, marginBottom: 16 * k }}>{label}</div>
          <div style={{ height: 54 * k, background: "#2b2f45", borderRadius: 27 * k, overflow: "hidden" }}>
            <div style={{ width: `${pc}%`, height: "100%", background: "linear-gradient(90deg,#39d98a,#39d9ff)" }} />
          </div>
          <div style={{ color: "#ffe14d", fontSize: 58 * k, marginTop: 12 * k, textAlign: "right" }}>{unit ? `${Math.round(val)} ${unit}` : `${pc.toFixed(pc > 99 ? 1 : 0)}%`}</div>
        </div>
      </AbsoluteFill>);
  }
  if (kind === "spot") {    // iris spotlight on a close-up (RicksClips): dark ring closes in to a circle around the face
    const rr = interpolate(n, [0, 7], [1.2, 0.46], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (x) => 1 - (1 - x) ** 3 }) * W;
    return <AbsoluteFill style={{ background: `radial-gradient(circle ${rr}px at 50% 42%, rgba(0,0,0,0) 0, rgba(0,0,0,0) ${rr * 0.97}px, rgba(8,6,14,0.92) ${rr}px)` }} />;
  }
  if (MAP_KINDS.includes(kind)) return <AbsoluteFill style={{ opacity: Math.min(1, (n + 1) / 6) }}><MapScene kind={kind} n={n} text={text} /></AbsoluteFill>;
  if (kind === "police") {  // red / blue police lights sweeping the room
    const ph = Math.floor(f / 5) % 2;
    return <AbsoluteFill style={{ background: ph ? "radial-gradient(circle at 15% 40%, rgba(255,40,40,0.45), transparent 60%)" : "radial-gradient(circle at 85% 40%, rgba(40,90,255,0.5), transparent 60%)", mixBlendMode: "screen" }} />;
  }
  if (kind === "map") {     // GPS pin + route chip
    return (
      <AbsoluteFill style={{ fontFamily: '"Segoe UI", Arial, sans-serif' }}>
        <div style={{ position: "absolute", left: 0.08 * W, top: 150 * k, background: "#1b6ef3", color: "#fff", borderRadius: 30 * k, padding: `${20 * k}px ${34 * k}px`,
          fontSize: 46 * k, fontWeight: 800, boxShadow: `0 ${10 * k}px ${30 * k}px rgba(0,0,0,0.3)` }}>➜ {text ?? "Route"}</div>
      </AbsoluteFill>);
  }
  return null;
};

export const StoryShort: React.FC<StoryProps> = ({ storyboard: sb, dpr }) => {
  const f = useCurrentFrame();
  const kit = useKit();
  useCaptionFont();
  if (!kit) return null;
  let flash = 0;
  for (const s of sb.scenes) if (s.transitionIn === "flash" && f >= s.startFrame && f < s.startFrame + 4) flash = [1, 0.75, 0.45, 0.2][f - s.startFrame];
  const sky = sb.scenes[0]?.light === "night" ? "#1a2550" : "#cfe3f2";
  return (
    <AbsoluteFill style={{ background: sky }}>
      {layersAt(sb, f).map((l, i) => <SceneView key={i ? "over" : "base"} idx={l.idx} kit={kit} sb={sb} alpha={l.alpha} dpr={dpr} transform={l.transform} filter={l.filter} />)}
      {flash > 0 && <AbsoluteFill style={{ background: "#ffffff", opacity: flash }} />}
      <Overlays sb={sb} />
    </AbsoluteFill>
  );
};

export const calcStoryMetadata: CalculateMetadataFunction<StoryProps> = ({ props }) => {
  const sb = props.storyboard ?? DEMO_STORYBOARD;
  return { durationInFrames: sb.durationInFrames, fps: sb.fps, width: sb.width, height: sb.height };
};

