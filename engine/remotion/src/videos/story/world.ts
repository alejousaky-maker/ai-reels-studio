// StoryWorld: one three.js scene per storyboard, posed per frame (pure function of scene index + frame).
// Sky / sun / fog / two-tone uniforms follow the template's rig (bridge/world.ts); the cast are lit Canvas2D cards
// drawn by the template's toon.ts; effects are unlit cards. Billboards live on the NOINK layer.
import * as THREE from "three";
import { Kit, Ray, V, kitClone } from "../bridge/build";
import { cloudHD, ctex } from "../bridge/paint";
import { Pen, bodyFront, bodySide, fxBurst, fxStars, fxPuff, fxNote, fxShadow, fxContact, FrontOpts, SideOpts, Outfit, INK } from "../bridge/toon";
import { TONE, CHAR, untone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";
import { Pool, Actor, Fx, Place, FxPlace } from "../bridge/cast";
import { LIGHTS3, LOOK3 } from "./looks";
import { camAt } from "./camera";
import { buildEnv, EnvInfo } from "./env";
import { drawProduct, drawSplash } from "./products";
import { PIECES } from "./pieces";
import type { Storyboard, SceneSpec, ActorSpec, Expr, LightName, V3 } from "./types";

const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const q = (v: number, n = 120) => Math.round(v * n) / n;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
const LEAD = 2; // reactions land 0-3 f before the word
const LID = [0.5, 1, 1, 0.5];
/** eyelid 0 open .. 1 shut: blinks every 0.5-2.3 s lasting 4 f, plus one across every expression swap */
const lidAt = (f: number, i: number, swaps: number[]) => {
  for (const s of swaps) { const k = f - (s - LEAD) + 1; if (k >= 0 && k < 4) return LID[k]; }
  let s = Math.round(-60 * hh(i, 9));
  for (let n = 0; s <= f && n < 600; n++) {
    const k = f - s;
    if (k >= 0 && k < 4) return LID[k];
    s += Math.round(15 + 54 * hh(i * 31 + n, 13));
  }
  return 0;
};
const tier = (d: number): [number, number, number] =>
  d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];
const toSrgb = (v: number) => { const c = clamp01(v); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
const hexOf = (c: [number, number, number], k: number) => "#" + c.map((v) => Math.round(255 * toSrgb(1 - (1 - v) * k)).toString(16).padStart(2, "0")).join("");
const CONTACT: Record<LightName, [number, number, number]> = { day: [0.2, 0.21, 0.33], golden: [0.24, 0.2, 0.33], night: [0.2, 0.2, 0.32] };
const TAIL: [number, number, number] = [0.42, 0.44, 0.62];

const discTex = () => ctex("sunDisc", 128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 58, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});
const glowTex = () => ctex("lampGlow", 128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.25, "rgba(255,255,255,0.6)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});
const steamFx = (p: Pen, t: number) => {
  for (let k = 0; k < 3; k++) {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 14; i++) { const y = 380 - i * 24; pts.push([100 + k * 100 + 22 * Math.sin(i * 0.7 + t * 6.28 + k * 2), y]); }
    p.stroke(pts, 14, `rgba(255,255,255,${0.75 - 0.25 * k})`);
  }
};
const sparkleFx = (p: Pen, t: number, col: string) => {
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + t * 2, d = 60 + 120 * t, x = 200 + d * Math.cos(a), y = 200 + d * Math.sin(a), r = 34 * (1 - t) + 8;
    p.poly([[x, y - r], [x + r * 0.28, y - r * 0.28], [x + r, y], [x + r * 0.28, y + r * 0.28], [x, y + r], [x - r * 0.28, y + r * 0.28], [x - r, y], [x - r * 0.28, y - r * 0.28]], col, 5);
  }
};

/** every lens position of the film looking at its subject: centre, sides and top of frame (houses there are left out) */
const sightLines = (sb: Storyboard, only: number): Ray[] => {
  const out: Ray[] = [];
  // per-scene culling: a scene's world only removes what blocks ITS OWN cameras, so editing one scene never changes
  // another scene's pixels (keeps every other render segment reusable)
  for (const s of [sb.scenes[only]]) for (let f = s.startFrame - 6; f < s.endFrame + 6; f += 3) {
    const c = camAt(s, Math.max(0, f)), o = V(...c.pos), look = V(...c.look);
    const fw = look.clone().sub(o), len = fw.length();
    fw.normalize();
    const rt = fw.clone().cross(V(0, 1, 0)).normalize(), up = rt.clone().cross(fw);
    const ty = Math.tan((c.fov * Math.PI) / 360), tx = ty * (9 / 16);
    for (const [sx, sy] of [[0, 0], [-0.6, 0], [0.6, 0], [0, 0.6], [0, -0.4]])
      out.push({ o, d: fw.clone().addScaledVector(rt, sx * tx).addScaledVector(up, sy * ty), len, core: sx === 0 && sy === 0 });
  }
  return out;
};

export class StoryWorld {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private sunDisc: THREE.Sprite;
  private sunCache = new Map<number, THREE.Vector3>();
  private clouds: THREE.Mesh[] = [];
  private cloudMaps: Record<LightName, THREE.Texture[]>;
  private glows: THREE.Sprite[] = [];
  private props: { o: THREE.Object3D; scene: number }[] = [];
  private pieceActors: Actor[] = [];
  private info: EnvInfo;
  private outfits = new Map<string, { o: Outfit; scale: number; i: number }>();
  private frustum = new THREE.Frustum();
  private m4 = new THREE.Matrix4(); private v = new THREE.Vector3(); private sph = new THREE.Sphere();

  constructor(kit: Kit, private sb: Storyboard, sceneIdx = 0) {
    const R = this.root;
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() },
        c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el)); c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el)); c = mix(c, c4, smoothstep(e.z, e.w, el)); gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1100, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK);
    R.add(this.sky);
    this.sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: discTex(), color: new THREE.Color(6.0, 4.4, 2.4), fog: false, depthWrite: false }));
    this.sunDisc.frustumCulled = false; this.sunDisc.layers.set(NOINK); R.add(this.sunDisc);
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    const lite = sb.graphics === "simple";
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(lite ? 2048 : 4096, lite ? 2048 : 4096);
    R.add(this.hemi, this.sun, this.sun.target);
    const pal = (l: LightName) => [0, 1, 2, 3].map((k) => cloudHD(k, LOOK3[l].cloud));
    this.cloudMaps = { day: pal("day"), golden: pal("golden"), night: pal("night") };
    const nClouds = lite ? 4 : 9;
    for (let i = 0; i < nClouds; i++) {
      const a = (i / nClouds) * Math.PI * 2 + 0.3, d = 620 + (i % 3) * 60, w = 130 + (i % 4) * 30;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.cloudMaps.day[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      m.position.set(Math.cos(a) * d, 120 + (i % 4) * 38, Math.sin(a) * d); m.scale.set(w, w / 2, 1); m.layers.set(NOINK);
      this.clouds.push(m); R.add(m);
    }
    this.info = buildEnv(R, kit, { ...(sb.scenes[sceneIdx]?.env ?? sb.env), lite }, sightLines(sb, sceneIdx));
    // warm light pools on the ground under every lamp (night only): additive, unlit, no ink
    const poolTex = ctex("lampPool", 256, 256, (g) => {
      const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
      gr.addColorStop(0, "rgba(255,190,110,0.85)"); gr.addColorStop(0.45, "rgba(255,170,90,0.35)"); gr.addColorStop(1, "rgba(255,160,80,0)");
      g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    });
    for (const p of this.info.lanterns) {
      if (p.y > 6) continue;   // lighthouse beacon: no ground pool
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
      m.rotation.x = -Math.PI / 2; m.position.set(p.x, 0.04, p.z); m.scale.setScalar(p.y > 2.65 ? 5.0 : 4.2);
      m.layers.set(NOINK); m.visible = false; m.renderOrder = 0.6;
      this.glows.push(m as unknown as THREE.Sprite); R.add(m);
    }
    for (const p of this.info.lanterns) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: new THREE.Color(3.2, 2.2, 1.0), fog: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending }));
      s.position.copy(p); s.scale.setScalar(1.1); s.layers.set(NOINK); s.visible = false;
      this.glows.push(s); R.add(s);
    }
    // per-scene props (framing objects / story props), toggled per scene
    sb.scenes.forEach((s, i) => (s.props ?? []).forEach((pp) => {
      const o = kitClone(kit, pp.kit, pp.h);
      if (!o) return;
      o.position.set(pp.x, 0, pp.z); o.rotation.y = pp.yaw ?? 0; o.visible = false;
      this.props.push({ o, scene: i }); R.add(o);
    }));
    // big painted set pieces of THIS scene (horse, ships, chalkboard, sheep, tents): lit cards sized per piece
    for (const pc of sb.scenes[sceneIdx]?.pieces ?? []) {
      const P = PIECES[pc.kind];
      if (!P) continue;
      const k = pc.scale ?? 1, geo = new THREE.PlaneGeometry(P.w * k, P.h * k).translate(0, (P.h * k) / 2, 0);
      this.pieceActors.push(new Actor(R, geo));
    }
    sb.cast.forEach((c, i) => this.outfits.set(c.id, { o: { ...c.outfit } as Outfit, scale: c.scale ?? (c.outfit.build === "kid" ? 0.72 : 1), i }));
  }

  /** camera-relative sun, frozen per scene: the scene's mean view direction turned by az toward screen right, lifted by el */
  private sceneSun(idx: number, s: SceneSpec, az0: number, el0: number) {
    let v = this.sunCache.get(idx);
    if (v) return v;
    let fx = 0, fz = 0;
    for (let f = s.startFrame; f < s.endFrame; f += 3) {
      const c = camAt(s, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1;
      fx += x / n; fz += z / n;
    }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const az = THREE.MathUtils.degToRad(s.sunAz ?? az0), el = THREE.MathUtils.degToRad(s.sunEl ?? el0);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(idx, v);
    return v;
  }
  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  /** actor state at frame f */
  private pose(a: ActorSpec, f: number) {
    let x = a.x, z = a.z, moving = false, dirx = 0, dx = 0, dz = 0, speed = 0, tw = 0;
    if (a.walkTo && a.walkFrames) {
      const [f0, f1] = a.walkFrames, u = clamp01((f - f0) / Math.max(1, f1 - f0));
      // constant speed with short 6-frame ease in/out so feet start and stop on the spot
      x = a.x + (a.walkTo[0] - a.x) * u; z = a.z + (a.walkTo[1] - a.z) * u;
      moving = f >= f0 && f < f1; dirx = a.walkTo[0] - a.x;
      const len = Math.hypot(a.walkTo[0] - a.x, a.walkTo[1] - a.z) || 1;
      dx = (a.walkTo[0] - a.x) / len; dz = (a.walkTo[1] - a.z) / len;
      speed = len / (Math.max(1, f1 - f0) / this.sb.fps);
      tw = Math.max(0, f - f0) / this.sb.fps;
    }
    let expr: Expr = a.expr ?? "neutral";
    const swaps: number[] = [];
    for (const k of [...(a.exprKeys ?? [])].sort((p, r) => p.frame - r.frame)) { swaps.push(k.frame); if (f >= k.frame - LEAD) expr = k.expr; }
    return { x, z, moving, dirx, dx, dz, speed, tw, expr, swaps };
  }

  update(idx: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const s = this.sb.scenes[idx], fps = this.sb.fps, fr = f - s.startFrame, t = fr / fps, L = LIGHTS3[s.light], K = LOOK3[s.light]; // life runs on scene-relative time (cacheable scenes)
    const c = camAt(s, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.2; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    const sunDir = this.sceneSun(idx, s, L.az, L.el);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    let Rr = THREE.MathUtils.clamp(dist * 1.15 + 7, 12, 95);
    if (s.light === "golden") Rr = Math.max(Rr, 30);
    this.sun.position.copy(focus).addScaledVector(sunDir, 220); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 480; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar;
    scene.fog = this.fog; scene.background = null;
    this.sunDisc.visible = s.light === "golden";
    if (this.sunDisc.visible) {
      this.sunDisc.position.copy(cam.position).addScaledVector(sunDir, 900);
      this.sunDisc.scale.setScalar(2 * 900 * Math.tan(THREE.MathUtils.degToRad(1.7)));
    }
    for (let i = 0; i < this.clouds.length; i++) {
      const m = this.clouds[i];
      m.lookAt(cam.position.x, m.position.y, cam.position.z);
      (m.material as THREE.MeshBasicMaterial).map = this.cloudMaps[s.light][i % 4];
    }
    for (const g of this.glows) g.visible = s.light === "night";
    for (const p of this.props) p.o.visible = p.scene === idx;

    // ---- cast ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const sx = sunDir.dot(right), sy = -sunDir.y;
    const light2D = (mirror: boolean) => Math.round(Math.atan2(sy, sx * (mirror ? -1 : 1)) / (Math.PI / 4)) * (Math.PI / 4);
    const places: (Place & { tierKey?: string })[] = [], fx: FxPlace[] = [];
    const blob = (x: number, z: number, scl = 1, k = 1) => {
      const hl = Math.hypot(sunDir.x, sunDir.z) || 1, ox = -sunDir.x / hl, oz = -sunDir.z / hl, rot = Math.atan2(-ox, -oz);
      if (s.light !== "golden") {
        const el = Math.asin(Math.min(0.99, Math.max(0.1, sunDir.y)));
        const len = Math.min(2.4, Math.max(0.5, 1.6 / Math.tan(el))) * scl, h = len + 0.55 * scl, cc = 0.3 * h;
        const tc = hexOf(TAIL, k * (s.light === "night" ? 0.6 : 1));
        fx.push({ key: `blob|shadow|${tc}`, cw: 128, ch: 256, draw: (p) => fxShadow(p, tc), x: x + ox * cc, y: 0.018, z: z + oz * cc, w: 0.72 * scl, h, flat: true, rot });
      }
      const ccol = hexOf(CONTACT[s.light], k);
      fx.push({ key: `blob|contact|${ccol}`, cw: 128, ch: 128, draw: (p) => fxContact(p, ccol), x: x + ox * 0.03 * scl, y: 0.022, z: z + oz * 0.03 * scl, w: 0.52 * scl, h: 0.4 * scl, flat: true, rot });
    };
    s.actors.forEach((a, ai) => {
      const who = this.outfits.get(a.castId);
      if (!who) return;
      const st = this.pose(a, f), scl = who.scale;
      const mode0 = a.mode ?? "stand";
      const moving = st.moving || mode0 === "stroll" || mode0 === "march" || mode0 === "dance";
      const cadence = mode0 === "dance" ? 1.1 : mode0 === "march" ? 1.0 : 0.75;
      const phase = moving ? q(((t * cadence + hh(who.i, 5)) % 1), 60) : 0;
      const dance = mode0 === "dance";
      const hop = dance ? Math.max(0, Math.sin(2 * Math.PI * (t * 2.2 + hh(who.i, 3)))) * 0.16 * scl : 0;
      const mode: FrontOpts["mode"] = mode0 === "fall" ? "fall" : mode0 === "sit" ? "sit" : mode0 === "march" ? "march" : moving ? "stroll" : "stand";
      const facing: -1 | 0 | 1 = a.facing ?? (st.dirx ? (((st.dirx > 0 ? 1 : -1) * Math.sign(right.x || 1)) as -1 | 1) : 0);
      const d = cam.position.distanceTo(this.v.set(st.x, 1.2 * scl, st.z)) / scl;
      const [w, h, k] = tier(d);
      const fo: FrontOpts = {
        phase, expr: st.expr, mode, look: a.look ?? 0, blink: st.expr === "whistle" ? 0 : lidAt(fr, who.i * 7 + ai, st.swaps.map((x) => x - s.startFrame)),
        lift: 60, tilt: (a.tilt ?? 0) + (dance ? q(9 * Math.sin(2 * Math.PI * t * 1.1 + who.i), 10) : 0),
        wave: a.wave || dance ? q(Math.sin(t * (dance ? 7 : 9) + who.i * 1.3), 20) : undefined,
        light: light2D(false), facing, seed: (who.i * 5 + 3) % 7 + 1,
      };
      // side view while walking ACROSS the frame (template bodySide: planted stance foot, cycloid swing foot)
      const tx = cam.position.x - st.x, tz = cam.position.z - st.z, tl = Math.hypot(tx, tz) || 1;
      const toward = st.moving ? (tx * st.dx + tz * st.dz) / tl : 1;
      if (st.moving && Math.abs(toward) < 0.6) {
        const cad = 0.9;                                           // gait cycles per second (2 steps)
        const fs = Math.round(Math.sqrt(Math.max(0, 1 - toward * toward)) * 20) / 20;
        const stride = Math.max(0.3, Math.min(1.3, st.speed / (2 * cad * 0.8 * scl))) * fs;
        const mirror = st.dx * right.x + st.dz * right.z < 0;      // bodySide faces screen-right; mirror for leftward walks
        const so: SideOpts = { phase: q((st.tw * cad + hh(who.i, 5)) % 1, 60), expr: st.expr, mode: "march", stomp: 0.6, stride: q(stride, 20),
          blink: lidAt(fr, who.i * 7 + ai, st.swaps.map((x) => x - s.startFrame)), light: light2D(mirror), seed: (who.i * 5 + 3) % 7 + 1 };
        const skey = `S|${a.castId}|${JSON.stringify(so, (_k, v) => (typeof v === "number" ? q(v) : v))}`;
        places.push({ key: skey, x: st.x, y: 0, z: st.z, scale: scl, mirror, draw: (p) => bodySide(p, who.o, so), size: [w, h, k] });
        blob(st.x, st.z, scl, 1);
        return;
      }
      const key = `F|${a.castId}|${JSON.stringify(fo, (_k, v) => (typeof v === "number" ? q(v) : v))}`;
      places.push({ key, x: st.x, y: hop, z: st.z, scale: scl, draw: (p) => bodyFront(p, who.o, fo), size: [w, h, k] });
      blob(st.x, st.z, scl, hop > 0.02 ? 0.7 : 1);
      if (a.holding) {
        const sz = 0.34 * scl;
        fx.push({ key: `prod|${a.holding}|${this.sb.brand?.primary ?? ""}`, cw: 400, ch: 400, draw: (p) => drawProduct(p, a.holding!, this.sb.brand?.primary),
          x: st.x + right.x * 0.42 * scl, y: hop + 0.98 * scl, z: st.z + right.z * 0.42 * scl - 0.05, w: sz, h: sz });
      }
    });
    // ---- effects ----
    for (const e of s.fx ?? []) {
      if (f < e.frame || f >= e.frame + e.dur) continue;
      const u = q((f - e.frame) / e.dur, 30), size = e.size ?? 1, [x, y, z] = e.at as V3;
      switch (e.kind) {
        case "burst": fx.push({ key: `burst${u}|${e.color ?? ""}`, cw: 500, ch: 500, draw: (p) => fxBurst(p, u, e.color ?? "#fff3b0"), x, y, z, w: size, h: size }); break;
        case "stars": fx.push({ key: `stars${q((t * 0.9) % 1, 30)}`, cw: 420, ch: 210, draw: (p) => fxStars(p, q((t * 0.9) % 1, 30)), x, y, z, w: size, h: size / 2 }); break;
        case "puff": fx.push({ key: `puff${u}`, cw: 300, ch: 300, draw: (p) => fxPuff(p, u), x, y, z, w: size, h: size, soft: true }); break;
        case "notes": for (let n = 0; n < 4; n++) {
          const age = ((t + n * 0.42) % 1.68) / 1.68, pop = Math.min(1, age * 7) * (age > 0.82 ? (1 - age) / 0.18 : 1);
          if (pop <= 0.02) continue;
          const kind = n % 2, side = (n % 2 ? 1 : -1) * (0.2 + 0.3 * age);
          fx.push({ key: `note${kind}`, cw: 220, ch: 260, draw: (p) => fxNote(p, kind), x: x + right.x * side, y: y + 0.9 * age, z: z + right.z * side, w: 0.22 * pop * size, h: 0.26 * pop * size, rot: 0.3 * Math.sin(age * 6 + n) });
        } break;
        case "product": {
          const pop = u < 0.15 ? smooth(u / 0.15) * 1.08 : u > 0.9 ? smooth((1 - u) / 0.1) : 1 + 0.03 * Math.sin(t * 5);
          const pk = e.product ?? "coffee";
          fx.push({ key: `prod|${pk}|${this.sb.brand?.primary ?? ""}`, cw: 400, ch: 400, draw: (p) => drawProduct(p, pk, this.sb.brand?.primary), x, y: y + 0.04 * Math.sin(t * 3), z, w: size * pop, h: size * pop });
          break;
        }
        case "steam": fx.push({ key: `steam${q((t * 0.8) % 1, 20)}`, cw: 400, ch: 400, draw: (p) => steamFx(p, q((t * 0.8) % 1, 20)), x, y, z, w: size, h: size, soft: true }); break;
        case "splash": fx.push({ key: `splash${u}|${e.color ?? ""}`, cw: 800, ch: 800, draw: (p) => drawSplash(p, u, e.color ?? "#4fa8d8"), x, y, z, w: size, h: size }); break;
        case "sparkle": fx.push({ key: `spark${u}|${e.color ?? ""}`, cw: 400, ch: 400, draw: (p) => sparkleFx(p, u, e.color ?? "#ffe27a"), x, y, z, w: size, h: size }); break;
      }
    }
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    let ai = 0;
    const used: Actor[] = [];
    for (const p of places) {
      const sc2 = p.scale ?? 1;
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y + 1.1 * sc2, p.z), 3.5))) continue;
      const a = this.actor(ai++);
      const [w, h, k] = p.size ?? [300, 500, 0.5];
      a.r = this.pool.req(p.key, w, h, k, p.draw);
      a.mesh.visible = true;
      a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, Math.atan2(cam.position.x - p.x, cam.position.z - p.z), 0);
      a.mesh.scale.set(p.mirror ? -sc2 : sc2, sc2, sc2);
      a.mesh.castShadow = L.actorShadow;
      used.push(a);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    let fi = 0;
    const fused: Fx[] = [];
    for (const p of fx) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y, p.z), Math.max(p.w, p.h)))) continue;
      const e = this.fx(fi++);
      e.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      e.use(!!p.soft);
      e.mesh.visible = true;
      e.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) e.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0);
      else { e.mesh.quaternion.copy(cam.quaternion); e.mesh.rotateZ(p.rot ?? 0); }
      e.mesh.scale.set(p.w, p.h, 1);
      fused.push(e);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    // ---- set pieces ----
    (s.pieces ?? []).forEach((pc, i) => {
      const A = this.pieceActors[i], P = PIECES[pc.kind];
      if (!A || !P) return;
      let x = pc.x, z = pc.z;
      if (pc.moveTo && pc.moveFrames) {
        const u = smooth((f - pc.moveFrames[0]) / Math.max(1, pc.moveFrames[1] - pc.moveFrames[0]));
        x += (pc.moveTo[0] - pc.x) * u; z += (pc.moveTo[1] - pc.z) * u;
      }
      const k = pc.scale ?? 1, d = cam.position.distanceTo(this.v.set(x, P.h * k * 0.5, z)) / (k * P.h / 2.2);
      const res = d < 3.2 ? 1.6 : d < 6.5 ? 1.0 : d < 16 ? 0.55 : 0.3;
      const cw = Math.round(P.dw * res), ch = Math.round(P.dh * res);
      A.r = this.pool.req(`piece|${pc.kind}`, cw, ch, res, P.draw);
      const bob = pc.rock ? pc.rock * Math.sin(t * 1.6 + i) : 0;
      A.mesh.visible = true;
      A.mesh.position.set(x, (pc.y ?? 0) + bob * 0.15, z);
      A.mesh.rotation.set(0, Math.atan2(cam.position.x - x, cam.position.z - z), bob * 0.03);
      A.mesh.scale.set(pc.mirror ? -1 : 1, 1, 1);
      A.mesh.castShadow = L.actorShadow;
      used.push(A);
    });
    this.pool.flush();
    for (const a of used) a.bind();
    for (const e of fused) e.bind();
    return focus;
  }

  /** world point of actor i's eyes in scene idx at frame f (for the lens focus) */
  eyesOf(idx: number, i: number, f: number): THREE.Vector3 | null {
    const s = this.sb.scenes[idx], a = s.actors[i];
    if (!a) return null;
    const who = this.outfits.get(a.castId), st = this.pose(a, f);
    return V(st.x, 1.62 * (who?.scale ?? 1), st.z);
  }
}
export { INK };


