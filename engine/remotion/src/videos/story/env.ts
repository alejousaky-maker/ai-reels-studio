// Procedural, seeded environments for the story engine, built from the template's painted pieces (houses with
// facades, cobbles, grass, cartoon vegetation, Kenney CC0 props). Houses/props that would block any camera of the
// storyboard are left out (sight-line culling from build.ts). Ground level is y = 0.
import * as THREE from "three";
import { Batch, house, prop, boxGeo, V, lam, Kit, Ray, setSight } from "../bridge/build";
import { grassHD, cobbleHD, stoneHD, rng, ctex } from "../bridge/paint";
import { NOINK } from "../bridge/ink";
import type { EnvSpec, Shop } from "./types";
import { drawSign, drawAwning } from "./products";
import { buildInterior, buildHarbour } from "./env2";
import { buildBeach, buildOcean, buildTroy, buildCave, buildThrone } from "./env3";
import { buildModernRoom, buildSuburb, buildLake, buildResort, buildOutback, buildShops } from "./env4";

/** horizontal quad facing up covering x0..x1, z0..z1 at height y with uv tiles u, v */
export const ground = (x0: number, x1: number, z0: number, z1: number, u: number, v: number, y = 0) => {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([x0, y, z1, x1, y, z1, x1, y, z0, x0, y, z1, x1, y, z0, x0, y, z0], 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(Array(6).fill([0, 1, 0]).flat(), 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, u, 0, u, v, 0, 0, u, v, 0, v], 2));
  return g;
};
const disc = (r: number, y: number, seg = 48) => { const g = new THREE.CircleGeometry(r, seg); g.rotateX(-Math.PI / 2); g.translate(0, y, 0); return g; };
const faceCenter = (x: number, z: number) => Math.atan2(-x, -z);

export type EnvInfo = { lanterns: THREE.Vector3[]; shopSign?: THREE.Object3D };

const TREES = ["tree_oak", "tree_default", "tree_detailed", "tree_fat", "tree-high-round", "tree"];

const hills = (b: Batch) => {
  const hill = new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2);
  const hm = [lam("hillA", () => ({ color: "#78b257" })), lam("hillB", () => ({ color: "#6aa24e" })), lam("hillC", () => ({ color: "#8bbf63" }))];
  ([[-300, 230, 170, 46, 120], [120, 330, 220, 58, 140], [380, 120, 160, 44, 130], [-380, -120, 180, 40, 150], [-60, -360, 230, 52, 140],
    [300, -300, 200, 50, 130], [460, -40, 150, 36, 120], [-480, 60, 190, 42, 140]] as const).forEach(([x, z, sx, sy, sz], i) =>
    b.add(hill, hm[i % 3], new THREE.Matrix4().compose(V(x, -2, z), new THREE.Quaternion(), V(sx, sy, sz))));
};

/** a ring of distant trees so every horizon has depth */
const forest = (b: Batch, kit: Kit, r: () => number, inner: number, n = 90) => {
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length) % a.length];
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2, d = inner + r() * 160;
    prop(b, kit, pick(["tree_cone", "tree_default", "tree_oak", "tree_fat"]), Math.cos(a) * d, 0, Math.sin(a) * d, 9 + r() * 6, r() * 6);
  }
};

const shopFront = (root: THREE.Object3D, b: Batch, s: Shop, info: EnvInfo) => {
  // the shop is the subject of its shots: never culled
  const saved: Ray[] = [];
  setSight(saved);
  house(b, s.x, s.z, s.yaw, 9, 8, 7, 0, 0);
  const m = new THREE.Matrix4().makeRotationY(s.yaw).setPosition(s.x, 0, s.z);
  // awning over the shop window (painted stripes in brand colours), slanted
  const aw = new THREE.Mesh(new THREE.PlaneGeometry(8.2, 1.7), lam(`awning_${s.colors.primary}_${s.colors.secondary}`, () => ({
    map: ctex(`awning_${s.colors.primary}_${s.colors.secondary}`, 512, 256, (g) => drawAwning(g, s.colors.primary, "#fbf6ea")), side: THREE.DoubleSide, alphaTest: 0.5 })));
  aw.position.set(0, 3.05, 4.0 + 0.75); aw.rotation.x = -Math.PI / 2 + 0.55;
  aw.castShadow = true; aw.receiveShadow = true;
  // sign board: unlit painted face (a side-lit sign goes grey-blue and unreadable, SKILL.md readability traps)
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 1.75), new THREE.MeshBasicMaterial({
    map: ctex(`sign_${s.name}_${s.colors.primary}`, 1024, 320, (g) => drawSign(g, s.name, s.colors.primary, s.colors.secondary, s.colors.text, s.tagline)),
    alphaTest: 0.5, toneMapped: true, color: 0xf0f0f0 }));
  sign.position.set(0, 4.65, 4.09); sign.layers.set(NOINK);
  const board = new THREE.Mesh(new THREE.BoxGeometry(5.8, 1.9, 0.12), lam("signBack", () => ({ color: "#5a3b2a" })));
  board.position.set(0, 4.65, 4.02); board.castShadow = true;
  const grp = new THREE.Group();
  grp.add(aw, sign, board);
  grp.applyMatrix4(m);
  root.add(grp);
  info.shopSign = grp;
  // tables + benches by the door (Kenney stall bench), a lantern
  const fw = (dx: number, dz: number) => new THREE.Vector3(dx, 0, dz).applyMatrix4(m);
  for (const [dx, dz] of [[-2.6, 6.2], [2.6, 6.2]]) { const p = fw(dx, dz); prop(b, {} as Kit, "plant_bush", p.x, 0, p.z, 0.9); }
};

export const buildEnv = (root: THREE.Object3D, kit: Kit, env: EnvSpec, rays: Ray[]): EnvInfo => {
  const info: EnvInfo = { lanterns: [] };
  const b = new Batch(), r = rng(env.seed || 7);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length) % a.length];
  // simple graphics: sparse set dressing (fewer far trees / back houses, no flower carpets) -> calmer frames, lighter scenes
  const lite = !!env.lite, N = (n: number) => (lite ? Math.round(n * 0.4) : n), FN = lite ? 40 : 90;
  const grass = lam("grassHD", () => ({ map: grassHD() }));
  const cobble = lam("cobbleHD", () => ({ map: cobbleHD() }));
  const stone = lam("copeHD", () => ({ map: stoneHD("copeHD", ["#e6dccd", "#ddd3c3", "#ece4d6", "#d6cbba"], "#aea293") }));
  // grass everywhere on land (the harbour's sea starts at z = 9.4)
  const own = ["beach", "ocean", "troy", "cave", "suburb", "lake", "resort", "outback", "shops"].includes(env.preset);   // these lay their own ground / sea
  if (!own) b.add(env.preset === "harbour" ? ground(-900, 900, -900, 9.4, 450, 227, -0.01) : ground(-900, 900, -900, 900, 450, 450, -0.01), grass);
  if (!["ocean", "beach", "resort", "outback"].includes(env.preset)) hills(b);
  setSight(rays);
  const lantern = (x: number, z: number) => { prop(b, kit, "lantern", x, 0, z, 2.8); info.lanterns.push(new THREE.Vector3(x, 2.55, z)); };

  if (["apartment", "bathroom", "office", "hotel", "airport", "cabin", "bedroom", "kitchen", "banquet", "gameroom"].includes(env.preset)) {
    buildModernRoom(root, kit, env, info, b);
    forest(b, kit, r, 90, FN);
    b.build(root); setSight([]);
    return info;
  }
  if (env.preset === "suburb" || env.preset === "lake" || env.preset === "resort" || env.preset === "outback" || env.preset === "shops") {
    ({ suburb: buildSuburb, lake: buildLake, resort: buildResort, outback: buildOutback, shops: buildShops })[env.preset](root, kit, env, info, b);
    b.build(root); setSight([]);
    return info;
  }
  if (env.preset === "beach" || env.preset === "ocean" || env.preset === "troy" || env.preset === "cave" || env.preset === "throne") {
    ({ beach: buildBeach, ocean: buildOcean, troy: buildTroy, cave: buildCave, throne: buildThrone })[env.preset](root, kit, env, info, b);
    if (env.preset === "throne") forest(b, kit, r, 90, FN);
    b.build(root);
    setSight([]);
    return info;
  }
  if (env.preset === "interior") {
    buildInterior(root, kit, env, info, b);
    forest(b, kit, r, 90, FN);
  } else if (env.preset === "harbour") {
    buildHarbour(root, kit, env, info, b);
  } else if (env.preset === "village_square" || env.preset === "market") {
    b.add(ground(-26, 26, -26, 26, 13, 13, 0.0), cobble);
    // fountain in the middle
    b.add(new THREE.CylinderGeometry(2.6, 2.8, 0.7, 28), stone, new THREE.Matrix4().makeTranslation(0, 0.35, 0));
    b.add(disc(2.35, 0.62), lam("fountainWater", () => ({ color: "#4fa8d8" })));
    b.add(new THREE.CylinderGeometry(0.35, 0.45, 1.8, 16), stone, new THREE.Matrix4().makeTranslation(0, 1.2, 0));
    b.add(new THREE.CylinderGeometry(1.0, 0.6, 0.3, 20), stone, new THREE.Matrix4().makeTranslation(0, 2.15, 0));
    // houses on the four sides of the square, fronts facing the fountain, a street gap in the middle of each side
    for (let side = 0; side < 4; side++) {
      for (let k = -2; k <= 2; k++) {
        if (k === 0) continue;
        const along = k * 9.4 + (k > 0 ? -1.5 : 1.5), w = pick([7, 8, 9]), h = pick([7, 8.4, 9.8]);
        const [x, z] = side === 0 ? [along, -26 - 4] : side === 1 ? [26 + 4, along] : side === 2 ? [-along, 26 + 4] : [-26 - 4, -along];
        if (env.shop && Math.hypot(env.shop.x - x, env.shop.z - z) < 7) continue;
        house(b, x, z, faceCenter(x, z) + (side % 2 ? 0 : 0), w, 8, h, Math.floor(r() * 8), 0);
      }
    }
    // second row behind, for depth through the street gaps
    for (let i = 0, nb = N(28); i < nb; i++) {
      const a = (i / nb) * Math.PI * 2, d = 46 + r() * 8, x = Math.cos(a) * d, z = Math.sin(a) * d;
      house(b, x, z, faceCenter(x, z), pick([7, 9]), 8, pick([7, 8.4, 9.8]), Math.floor(r() * 8), 0);
    }
    for (const [x, z] of [[-14, -14], [14, -14], [14, 14], [-14, 14]]) lantern(x, z);
    for (const [x, z] of [[-20, 0], [20, 0], [0, 20], [0, -20]]) prop(b, kit, pick(TREES), x * 1.12, 0, z * 1.12, 6 + r() * 2, r() * 6);
    for (const [x, z, yaw] of [[-6, -9, 0], [7, 9, Math.PI], [-9, 7, Math.PI / 2]]) prop(b, kit, "stall-bench", x, 0, z, 1.0, yaw);
    if (env.preset === "market") {
      for (const [x, z, n, yaw] of [[-16, -6, "stall-red", Math.PI / 2], [-16, 4, "stall-green", Math.PI / 2], [16, -4, "stall-green", -Math.PI / 2], [16, 6, "stall-red", -Math.PI / 2]] as const)
        prop(b, kit, n, x, 0, z, 3.2, yaw);
      prop(b, kit, "cart", 10, 0, -15, 2.2, 0.8);
    }
    for (let i = 0; i < (lite ? 0 : 18); i++) { const a = r() * 6.28, d = 3.4 + r() * 0.6; prop(b, kit, pick(["flower_redA", "flower_yellowA", "flower_purpleA"]), Math.cos(a) * d, 0, Math.sin(a) * d, 0.5); }
    forest(b, kit, r, 80, FN);
  } else if (env.preset === "street") {
    b.add(ground(-5, 5, -120, 120, 3, 60, 0.0), cobble);
    b.add(ground(-7.5, -5, -120, 120, 1, 60, 0.12), stone); b.add(ground(5, 7.5, -120, 120, 1, 60, 0.12), stone);
    for (const sx of [-1, 1]) {
      let z = -110;
      while (z < 110) {
        const w = pick([7, 8, 9]), h = pick([7, 8.4, 9.8]), cz = z + w / 2, cx = sx * (7.5 + 4);
        const skip = env.shop && Math.abs(env.shop.x - cx) < 6 && Math.abs(env.shop.z - cz) < 6;
        if (!skip) house(b, cx, cz, sx < 0 ? Math.PI / 2 : -Math.PI / 2, w, 8, h, Math.floor(r() * 8), 0);
        z += w + (r() < 0.2 ? 2.5 : 0.25);
      }
    }
    for (let z = -100; z <= 100; z += 14) { lantern(-6.2, z); lantern(6.2, z + 7); }
    for (let i = 0; i < N(40); i++) { const x = (r() < 0.5 ? -1 : 1) * (22 + r() * 30), z = (r() - 0.5) * 220; prop(b, kit, pick(TREES), x, 0, z, 7 + r() * 3, r() * 6); }
    forest(b, kit, r, 130, FN);
  } else {
    // park: gravel loop, pond, trees, hedges, benches
    b.add(ground(-2, 2, -60, 60, 1, 30, 0.01), lam("gravel", () => ({ color: "#d8c49a" })));
    b.add(ground(-60, 60, -2, 2, 30, 1, 0.012), lam("gravel", () => ({ color: "#d8c49a" })));
    b.add(disc(7, 0.03), lam("pond", () => ({ color: "#4f9fd4" })), new THREE.Matrix4().makeTranslation(14, 0, -14));
    b.add(new THREE.TorusGeometry(7.1, 0.3, 8, 40).rotateX(Math.PI / 2), stone, new THREE.Matrix4().makeTranslation(14, 0.1, -14));
    for (let i = 0; i < N(36); i++) {
      const a = r() * 6.28, d = 12 + r() * 40, x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (Math.abs(x) < 4 || Math.abs(z) < 4 || Math.hypot(x - 14, z + 14) < 9) continue;
      prop(b, kit, pick(TREES), x, 0, z, 7 + r() * 3.5, r() * 6);
    }
    for (let i = 0; i < N(30); i++) { const x = (r() - 0.5) * 50, z = (r() - 0.5) * 50; if (Math.abs(x) > 3.5 && Math.abs(z) > 3.5 && Math.hypot(x - 14, z + 14) > 8.5) prop(b, kit, pick(["plant_bushLarge", "plant_bushDetailed", "plant_bush"]), x, 0, z, 1.2 + r() * 0.6); }
    for (let i = 0; i < (lite ? 0 : 40); i++) { const x = (r() - 0.5) * 40, z = (r() - 0.5) * 40; if (Math.abs(x) > 3 && Math.abs(z) > 3) prop(b, kit, pick(["flower_redA", "flower_yellowA", "flower_purpleA"]), x, 0, z, 0.5); }
    for (const [x, z, yaw] of [[3.2, 8, -Math.PI / 2], [-3.2, -9, Math.PI / 2], [9, 3.2, Math.PI]]) prop(b, kit, "stall-bench", x, 0, z, 1.0, yaw);
    for (const [x, z] of [[3, 3], [-3, -3], [3, -20], [-20, 3]]) lantern(x, z);
    for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.28 + 0.4, d = 70; house(b, Math.cos(a) * d, Math.sin(a) * d, faceCenter(Math.cos(a) * d, Math.sin(a) * d), 8, 8, 8.4, i, 0); }
    forest(b, kit, r, 85, FN);
  }
  if (env.shop && env.preset !== "interior") shopFront(root, b, env.shop, info);
  b.build(root);
  setSight([]);
  return info;
};
