// Built-in demo storyboard (Phase 1 smoke test): an ORIGINAL 13 s scene about the 1518 Strasbourg dancing
// epidemic. Our own characters and staging. Facts used on screen are in projects/demo-dancing-1518/FACTS.md.
import type { Storyboard } from "./types";

export const DEMO_STORYBOARD: Storyboard = {
  version: 1, title: "Demo — The Town That Couldn't Stop Dancing (teaser)",
  fps: 30, width: 1080, height: 1920, durationInFrames: 390,
  env: { preset: "village_square", seed: 15 },
  cast: [
    { id: "anna", outfit: { jacket: "#c25a7a", pants: "#3b3f52", boots: "#4a3426", hat: "bonnet", dress: "#d9a441", skin: "#ffe2c2" } },
    { id: "hans", outfit: { jacket: "#3f6fb5", pants: "#3b3f52", boots: "#4a3426", hat: "cap", cap: "#5d7a3a", skin: "#f5c9a0" } },
    { id: "greta", outfit: { jacket: "#5d7a3a", pants: "#3b3f52", boots: "#4a3426", hat: "hair", hair: "#7a4a2a", dress: "#5a8fc2", skin: "#ecd0b6" } },
    { id: "kid", outfit: { jacket: "#f08a2c", pants: "#3b5b9a", boots: "#f4f1ea", hat: "cap", cap: "#e2453c", build: "kid" } },
    { id: "fritz", outfit: { jacket: "#8c3b4a", pants: "#3b3f52", boots: "#4a3426", hat: "tophat", skin: "#c99067" } },
    { id: "lena", outfit: { jacket: "#2f5f6a", pants: "#3b3f52", boots: "#4a3426", hat: "bonnet", dress: "#c25a7a", skin: "#f5c9a0" } },
    { id: "mayor", outfit: { jacket: "#2f3a5a", pants: "#2b2b38", boots: "#241726", hat: "tophat", moustache: "#4a3020", build: "stout", buttons: "#e8c45a", sash: "#c0353a" } },
  ],
  scenes: [
    {
      sceneId: "s1_hook", startFrame: 0, endFrame: 120, light: "day", transitionIn: "cut",
      narration: "In 1518, a woman stepped into a town square and started dancing.",
      actors: [
        { castId: "anna", x: 0, z: 8, mode: "dance", expr: "grin" },
        { castId: "hans", x: -1.9, z: 9.4, expr: "neutral", exprKeys: [{ frame: 40, expr: "nervous" }], look: 1 },
        { castId: "greta", x: 2.0, z: 7.0, expr: "smile", exprKeys: [{ frame: 70, expr: "shock" }], look: -1 },
        { castId: "kid", x: -1.3, z: 5.6, expr: "smile" },
      ],
      cameraKeys: [
        { frame: 0, position: [3.2, 1.95, 16.2], lookAt: [0, 1.3, 7.6], fov: 40 },
        { frame: 52, dur: 30, position: [1.9, 1.62, 12.6], lookAt: [0, 1.4, 8], fov: 38, roll: -0.04 },
      ],
      push: 0.0025, dof: { cInf: 10, focusActor: 0 },
    },
    {
      sceneId: "s2_spread", startFrame: 120, endFrame: 270, light: "day", transitionIn: "flash",
      narration: "Within weeks, dozens of people had joined her.",
      actors: [
        { castId: "anna", x: 0.2, z: 6.5, mode: "dance", expr: "grin" },
        { castId: "hans", x: -2.2, z: 7.6, mode: "dance", expr: "laugh" },
        { castId: "greta", x: 2.4, z: 5.4, mode: "dance", expr: "nervous" },
        { castId: "lena", x: -1.0, z: 3.4, mode: "dance", expr: "dazed" },
        { castId: "fritz", x: 4.2, z: 8.8, mode: "stand", expr: "whistle", facing: -1 },
        { castId: "kid", x: -4.0, z: 9.6, expr: "shock" },
      ],
      fx: [{ kind: "notes", frame: 120, dur: 150, at: [4.2, 1.6, 8.8], size: 1.2 }],
      cameraKeys: [
        { frame: 120, position: [-4.2, 0.95, 15.5], lookAt: [0, 1.45, 5.5], fov: 44 },
        { frame: 196, dur: 30, position: [-1.6, 1.35, 11.4], lookAt: [0.2, 1.5, 6.2], fov: 38, roll: 0.04 },
      ],
      push: 0.002, dof: { cInf: 7, focusActor: 0 },
    },
    {
      sceneId: "s3_council", startFrame: 270, endFrame: 390, light: "golden", transitionIn: "xfade",
      narration: "So the town council came up with a cure: more dancing.",
      actors: [
        { castId: "mayor", x: 0.4, z: 11, expr: "stern", exprKeys: [{ frame: 332, expr: "shock" }] },
        { castId: "anna", x: -2.2, z: 4.0, mode: "dance", expr: "grin" },
        { castId: "hans", x: 2.4, z: 3.0, mode: "dance", expr: "laugh" },
        { castId: "lena", x: 0.8, z: 1.8, mode: "dance", expr: "dazed" },
      ],
      fx: [{ kind: "product", product: "question", frame: 290, dur: 40, at: [0.75, 2.3, 11], size: 0.42 },
        { kind: "product", product: "exclaim", frame: 332, dur: 50, at: [0.62, 2.3, 11.2], size: 0.4 }],
      kicks: [{ frame: 332, amp: 0.8 }],
      cameraKeys: [
        { frame: 270, position: [1.3, 1.72, 15.2], lookAt: [0.2, 1.5, 10.6], fov: 38 },
        { frame: 330, cut: true, position: [0.7, 1.68, 13.6], lookAt: [0.3, 1.58, 11], fov: 34, roll: -0.04 },
      ],
      push: 0.0025, dof: { cInf: 12, focusActor: 0 },
    },
  ],
};

