// Light / world-look / grade presets for the story engine. day + golden are the template's tuned values
// (bridge/lights.ts, bridge/grade.ts); night is our own moonlit blue-hour preset (tuned on our renders).
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { GRADES, GradeParams } from "../bridge/grade";
import type { LightName } from "./types";

const NIGHT: LightPreset = {
  az: 110, el: 30,
  lit: [0.4, 0.47, 0.82], shade: [0.1, 0.11, 0.24], lift: [0.03, 0.04, 0.1], lambert: 0.35, sideK: 0.84, term: 0.2,
  charTint: [0.55, 0.62, 0.92], charShade: 0.84, charGrad: 0.08, bodyGrad: 0.22, sideTint: [0.85, 0.85, 1.0],
  blob: [0.6, 0.6, 0.75], actorShadow: false,
  top: "#0f1d45", hor: "#3b4f86", skyCurve: [0.0, 0.5, 0.6], fog: "#33467a", fogNear: 20, fogFar: 240, sunDisc: "#000000",
  sunCol: "#c9d6ff", sunI: 1.6, sky: "#5a6ea8", ground: "#2a2440", hemiI: 0.4,
  bias: -0.00025, normalBias: 0.015,
};
const NIGHT_LOOK: WorldLook = {
  sky: { c: ["#3b4f86", "#2e4278", "#22356a", "#18295a", "#0f1d45"], e: [0, 4, 10, 20, 40] },
  water: { near: "#1a2e5e", mid: "#20386e", far: "#2c447a", crest: "#6f86c2", trough: "#0e1a3c", glint: "#e8eeff", shade: [0.5, 0.55, 0.8] },
  bounce: [0, 0, 0], sat: 1.0,
  cloud: { lit: "#8796c6", mid: "#5d6c9e", shade: "#3c4778" },
};
const NIGHT_GRADE: GradeParams = {
  ky: [0, 0.1, 0.27, 0.56, 0.8, 0.93, 1], sat: [1.0, 1.0, 1.05],
  tintS: [0.02, -0.004], tintM: [0.01, 0], tintH: [-0.006, 0.004], vig: [0.22, 0.4],
};

export const LIGHTS3: Record<LightName, LightPreset> = { ...LIGHTS, night: NIGHT };
export const LOOK3: Record<LightName, WorldLook> = { ...LOOK, night: NIGHT_LOOK };
export const GRADES3: Record<LightName, GradeParams> = { ...GRADES, night: NIGHT_GRADE };
