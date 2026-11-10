// AI Reels Studio - generic storyboard-driven short. Same post chain as the template (bridge/Bridge.tsx):
// ink (own pass) -> lens blur pre + main -> bloom (emissive only) -> NEUTRAL tone map -> grade, MSAA 4.
// Ink runs before the DOF so outlines blur with what they belong to (the documented "blur erases ink" bug).
// All pixel-sized parameters are specified at 1080x1920 and scale with the output height.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, CalculateMetadataFunction, interpolate } from "remotion";
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

export type StoryProps = { storyboard: Storyboard; dpr?: number };

const makeBloom = () => {
  const b = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.5, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6 });
  const mip = b.mipmapBlurPass, setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
  return b;
};
const fwd = new THREE.Vector3(), fpt = new THREE.Vector3();

const useKit = () => {
  const [kit, setKit] = useState<Kit | null>(null);
  const [handle] = useState(() => delayRender("story kit"));
  useEffect(() => { loadKit().then((k) => { setKit(k); continueRender(handle); }); }, [handle]);
  return kit;
};

const Inner: React.FC<{ idx: number; world: StoryWorld; sb: Storyboard }> = ({ idx, world, sb }) => {
  const f = useCurrentFrame();
  const { camera, scene } = useThree();
  const on = { ink: true, lens: true, bloom: true, grade: true, ...(sb.post ?? {}) };
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera),
    lens: new LensBlur({ maxCoC: 24, nearScale: 1.2 }),
    bloom: makeBloom(),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    grade: new GradeEffect(GRADES3.day, 1),
  }), [camera, scene]);
  useEffect(() => () => fx.ink.dispose(), [fx]);
  const post = useMemo(() => (
    <EffectComposer multisampling={4}>
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
  return (<><primitive key={`world-${idx}`} object={world.root} dispose={null} />{post}</>);
};

const SceneView: React.FC<{ idx: number; kit: Kit; sb: Storyboard; alpha: number; dpr?: number }> = ({ idx, kit, sb, alpha, dpr }) => {
  const world = useMemo(() => new StoryWorld(kit, sb, idx), [kit, sb, idx]); // one world per scene (own sight-line culling)
  return (
    <AbsoluteFill style={{ opacity: alpha }}>
      <ThreeCanvas width={sb.width} height={sb.height} {...(dpr ? { dpr } : {})} shadows
        gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }}
        camera={{ fov: 40, near: 0.2, far: 1500 }}>
        <Inner idx={idx} world={world} sb={sb} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

/** layers at frame f: base scene, plus the next scene fading in across an 8-frame crossfade */
export const layersAt = (sb: Storyboard, f: number): { idx: number; alpha: number }[] => {
  for (let i = 1; i < sb.scenes.length; i++) {
    const s = sb.scenes[i];
    if (s.transitionIn === "xfade" && f >= s.startFrame - 4 && f < s.startFrame + 4) return [{ idx: i - 1, alpha: 1 }, { idx: i, alpha: (f - (s.startFrame - 4) + 1) / 9 }];
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
    const y = o.position === "top" ? 0.12 : o.position === "center" ? 0.42 : 0.72;
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
  // optional word-by-word captions (off by default in the storybook style)
  if (sb.captions?.enabled && sb.captions.words?.length) {
    const t = f / sb.fps, w = sb.captions.words.find((x) => t >= x.s - 0.03 && t < x.e + 0.08);
    if (w) items.push(
      <div key="cap" style={{ position: "absolute", left: 0, right: 0, top: H * 0.66, textAlign: "center", fontFamily: '"Arial Black", Arial, sans-serif',
        fontSize: 96 * k, color: "#fff", WebkitTextStroke: `${5 * k}px #111`, paintOrder: "stroke" }}>{w.w}</div>);
  }
  return <AbsoluteFill>{items}</AbsoluteFill>;
};

export const StoryShort: React.FC<StoryProps> = ({ storyboard: sb, dpr }) => {
  const f = useCurrentFrame();
  const kit = useKit();
  if (!kit) return null;
  let flash = 0;
  for (const s of sb.scenes) if (s.transitionIn === "flash" && f >= s.startFrame && f < s.startFrame + 4) flash = [1, 0.75, 0.45, 0.2][f - s.startFrame];
  const sky = sb.scenes[0]?.light === "night" ? "#1a2550" : "#cfe3f2";
  return (
    <AbsoluteFill style={{ background: sky }}>
      {layersAt(sb, f).map((l, i) => <SceneView key={i ? "over" : "base"} idx={l.idx} kit={kit} sb={sb} alpha={l.alpha} dpr={dpr} />)}
      {flash > 0 && <AbsoluteFill style={{ background: "#ffffff", opacity: flash }} />}
      <Overlays sb={sb} />
    </AbsoluteFill>
  );
};

export const calcStoryMetadata: CalculateMetadataFunction<StoryProps> = ({ props }) => {
  const sb = props.storyboard ?? DEMO_STORYBOARD;
  return { durationInFrames: sb.durationInFrames, fps: sb.fps, width: sb.width, height: sb.height };
};

