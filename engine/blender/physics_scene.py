"""Build + simulate + render one physics clip from a JSON spec (runs INSIDE Blender; driven by engine/physics.py).
Models keep their Poly Haven geometry, proportions and PBR materials (glTF importer); light = Poly Haven HDRI + a sun for
contact shadows; colliders are simplified per object (BOX / SPHERE / CONVEX_HULL, MESH only for passive surfaces);
events are presets from physics_rb; the camera follows the action and can end on an orbit; frames + report.json out.
usage: blender -b --python engine/blender/physics_scene.py -- <repo_root> <spec.json>"""
import json
import math
import os
import sys

import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
ROOT, SPEC = argv[0], argv[1]
sys.path.insert(0, ROOT)
from engine.blender import physics_rb as P  # noqa: E402

spec = json.load(open(SPEC, encoding="utf-8"))
FPS = int(spec.get("fps", 30))
N = int(round(spec.get("seconds", 10) * FPS))
OUT = spec["out"]
os.makedirs(OUT, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
vertical = spec.get("format", "vertical") == "vertical"
sc.render.resolution_x, sc.render.resolution_y = (1080, 1920) if vertical else (1920, 1080)
sc.render.resolution_percentage = int(spec.get("res_percent", 100))
sc.render.fps = FPS
sc.frame_start, sc.frame_end = 1, N
sc.render.engine = "BLENDER_EEVEE_NEXT"
ee = sc.eevee
ee.taa_render_samples = int(spec.get("samples", 32))
ee.use_shadows = True
try:
    ee.use_raytracing = True     # screen-space AO / contact detail
except AttributeError:
    pass
sc.view_settings.view_transform = "AgX"
sc.view_settings.look = "AgX - Medium High Contrast"

# ---------------- light: HDRI environment + key sun (contact shadows) ----------------
w = sc.world = bpy.data.worlds.new("world")
w.use_nodes = True
nt = w.node_tree
if spec.get("hdri_path") and os.path.exists(spec["hdri_path"]):
    env = nt.nodes.new("ShaderNodeTexEnvironment")
    env.image = bpy.data.images.load(spec["hdri_path"])
    nt.links.new(env.outputs["Color"], nt.nodes["Background"].inputs["Color"])
    nt.nodes["Background"].inputs["Strength"].default_value = float(spec.get("hdri_strength", 1.0))
    if spec.get("backdrop", "studio") == "studio":   # the HDRI lights the scene; the camera sees a seamless studio wall
        lp = nt.nodes.new("ShaderNodeLightPath")
        wall = nt.nodes.new("ShaderNodeBackground")
        wall.inputs["Color"].default_value = (*spec.get("backdrop_color", (0.72, 0.74, 0.78)), 1)
        mix = nt.nodes.new("ShaderNodeMixShader")
        nt.links.new(lp.outputs["Is Camera Ray"], mix.inputs["Fac"])
        nt.links.new(nt.nodes["Background"].outputs["Background"], mix.inputs[1])
        nt.links.new(wall.outputs["Background"], mix.inputs[2])
        nt.links.new(mix.outputs["Shader"], nt.nodes["World Output"].inputs["Surface"])
else:
    nt.nodes["Background"].inputs["Color"].default_value = (0.5, 0.55, 0.62, 1)
sun = bpy.data.lights.new("sun", "SUN")
sun.energy, sun.angle = float(spec.get("sun", 3.0)), math.radians(2.0)
so = bpy.data.objects.new("sun", sun)
bpy.context.collection.objects.link(so)
so.rotation_euler = (math.radians(50), 0, math.radians(30))

# ---------------- ground ----------------
g = spec.get("ground", {})
size = float(g.get("size", 14))
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, -0.1))
ground = bpy.context.object
ground.name, ground.scale = "ground", (size, size, 0.2)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)   # keep the origin at the box centre: Bullet
# centres BOX colliders on the origin, so applying location would lift the collision floor 10 cm above the visible one
gm = bpy.data.materials.new("groundM")
gm.use_nodes = True
bsdf = gm.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = {"wood": (0.42, 0.27, 0.15, 1), "concrete": (0.45, 0.45, 0.45, 1)}.get(g.get("kind", "wood"), (0.42, 0.27, 0.15, 1))
bsdf.inputs["Roughness"].default_value = 0.6
if g.get("kind", "wood") == "wood":   # plank pattern (procedural, no download needed)
    N_ = gm.node_tree.nodes
    wave, ramp = N_.new("ShaderNodeTexWave"), N_.new("ShaderNodeValToRGB")
    wave.inputs["Scale"].default_value, wave.inputs["Distortion"].default_value = 1.2, 6.0
    ramp.color_ramp.elements[0].color, ramp.color_ramp.elements[1].color = (0.32, 0.19, 0.1, 1), (0.55, 0.36, 0.2, 1)
    gm.node_tree.links.new(wave.outputs["Fac"], ramp.inputs["Fac"])
    gm.node_tree.links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
ground.data.materials.append(gm)
P.world(sc, 1, N, time_scale=float(spec.get("time_scale", 1.0)), gravity=(0, 0, -abs(float(spec.get("gravity", 9.81)))))
P.add_body(ground, "PASSIVE", "BOX", friction=0.8, restitution=0.4)


# ---------------- objects ----------------
def import_model(path, name):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    new = [o for o in bpy.data.objects if o not in before]
    meshes = [o for o in new if o.type == "MESH"]
    others = [o.name for o in new if o.type != "MESH"]
    for x in bpy.context.selected_objects:
        x.select_set(False)
    for o in meshes:
        o.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    for o in meshes:   # bake parent transforms in, then one rigid object per model
        mw = o.matrix_world.copy()
        o.parent = None
        o.matrix_world = mw
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if len(meshes) > 1:
        bpy.ops.object.join()
    o = bpy.context.view_layer.objects.active
    for nm in others:   # empties left by the importer (the joined meshes are gone: never touch them again)
        if nm in bpy.data.objects:
            bpy.data.objects.remove(bpy.data.objects[nm])
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
    o.name = name
    return o


def procedural(kind, name, size, color):
    if kind == "sphere":
        bpy.ops.mesh.primitive_uv_sphere_add(radius=size / 2, segments=48, ring_count=24)
    elif kind == "plank":
        bpy.ops.mesh.primitive_cube_add(size=1); bpy.context.object.scale = (size * 0.12, size * 0.5, size)
    else:
        bpy.ops.mesh.primitive_cube_add(size=size)
    o = bpy.context.object
    bpy.ops.object.transform_apply(scale=True)
    o.name = name
    m = bpy.data.materials.new(name + "M"); m.use_nodes = True
    h = color.lstrip("#")
    m.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (*[(int(h[i:i + 2], 16) / 255) ** 2.2 for i in (0, 2, 4)], 1)
    m.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.45
    o.data.materials.append(m)
    if kind == "sphere":
        for p in o.data.polygons:
            p.use_smooth = True
    return o


objs = {}
for d in spec["objects"]:
    if d.get("asset_path"):
        o = import_model(d["asset_path"], d["id"])
    else:
        o = procedural(d.get("procedural", "box"), d["id"], float(d.get("size", 0.3)), d.get("color", "#c8553d"))
    if d.get("scale"):
        o.scale = (d["scale"],) * 3
        bpy.ops.object.transform_apply(scale=True)
    o.rotation_euler.z = math.radians(d.get("rotation_z", 0))
    x, y, z = d.get("position", (0, 0, 0))
    o.location = (x, y, z + o.dimensions.z / 2)          # position = where its base sits
    bpy.context.view_layer.update()
    objs[d["id"]] = o
    body = d.get("body", "active")
    if body == "passive":
        P.add_body(o, "PASSIVE", d.get("shape", "MESH"), friction=d.get("friction", 0.7), restitution=d.get("restitution", 0.3))
    elif body == "active":
        P.add_body(o, "ACTIVE", d.get("shape", "CONVEX_HULL"), mass=d.get("mass", 1.0), friction=d.get("friction", 0.5),
                   restitution=d.get("restitution", 0.3), lin_damp=d.get("lin_damp", 0.04), ang_damp=d.get("ang_damp", 0.1))

# ---------------- events (presets) ----------------
post = []
for ev in spec.get("events", []):
    name, prm = ev["preset"], dict(ev.get("params", {}))
    prm.setdefault("fps", FPS)
    if name in ("RETURN_TO_ORIGIN", "LOOPING_PHYSICS", "FALL_AND_RESET", "CAMERA_ORBIT"):
        post.append(ev)
        continue
    if name == "SLOW_MOTION_IMPACT":
        P.SLOW_MOTION_IMPACT(sc, **prm)
    elif name in ("EXPLOSION_IMPULSE", "STACK_COLLAPSE", "DOMINO_CHAIN"):
        P.PRESETS[name]([objs[k] for k in ev["objects"]], **prm)
    elif name == "OBJECT_IMPACT":
        P.OBJECT_IMPACT(objs[ev["object"]], objs[ev["target"]], **prm)
    elif name == "HOLD":
        P.hold(objs[ev["object"]], prm["until"])
    elif name in ("IMPULSE", "THROW", "PUSH"):   # a launch / push at a given frame (velocity m/s, spin rad/s)
        P.impulse(objs[ev["object"]], int(prm.get("release", 10)), prm.get("velocity", (1, 0, 0)), prm.get("spin", (0, 0, 0)), fps=FPS)
    else:
        o = objs[ev["object"]]
        if name in ("FALL_AND_BOUNCE", "SPIN_AND_DROP", "FLOAT_AND_LAND"):
            if o.rigid_body:   # the preset sets its own body parameters
                P._select_only(o); bpy.ops.rigidbody.object_remove()
        P.PRESETS[name](o, **prm)

dyn = [o for o in objs.values() if o.rigid_body and o.rigid_body.type == "ACTIVE"]
rec = P.simulate(sc, dyn, 1, N)
report = {"verify": P.verify(rec, 0.0, {o.name: o for o in dyn}),
          "track": {k: [[i + 1] + [round(v, 3) for v in m.translation] for i, m in enumerate(ms) if i % 10 == 0] for k, ms in rec.items()}}

for ev in post:
    o = objs.get(ev.get("object", ""))
    prm = ev.get("params", {})
    if ev["preset"] == "RETURN_TO_ORIGIN" and o:
        P.return_to_origin(o, int(prm.get("at", N - 70)), int(prm.get("frames", 50)), float(prm.get("lift", 0.35)))
    elif ev["preset"] in ("LOOPING_PHYSICS", "FALL_AND_RESET") and o:
        P.loop(o, int(prm.get("from", 1)), int(prm.get("to", N // 2)), int(prm.get("repeats", 1)))

# ---------------- camera: follow the action, optional cinematic orbit at the end ----------------
cam_spec = spec.get("camera", {})
cam = bpy.data.cameras.new("cam")
cam.lens = float(cam_spec.get("lens", 35))
co = bpy.data.objects.new("cam", cam)
bpy.context.collection.objects.link(co)
sc.camera = co
co.rotation_mode = "QUATERNION"
targets = [objs[t] for t in cam_spec.get("follow", list(objs)) if t in objs]
dist = float(cam_spec.get("distance", 3.2))
height = float(cam_spec.get("height", 1.4))
orbit_from = N - int(cam_spec.get("orbit_seconds", 2.5) * FPS) if cam_spec.get("orbit_end", True) else N + 1
az0 = math.radians(cam_spec.get("azimuth", -30))
aim = None
if cam_spec.get("dof", True):
    cam.dof.use_dof, cam.dof.aperture_fstop = True, float(cam_spec.get("fstop", 4.0))
    focus = bpy.data.objects.new("focus", None); bpy.context.collection.objects.link(focus); cam.dof.focus_object = focus
for f in range(1, N + 1):
    sc.frame_set(f)
    c = sum((o.matrix_world.translation for o in targets), Vector()) / max(1, len(targets))
    aim = c if aim is None else aim.lerp(c, 0.12)            # smooth follow (no jitter)
    az = az0 + (0.0 if f < orbit_from else (f - orbit_from) / max(1, N - orbit_from) * math.radians(cam_spec.get("orbit_deg", 70)))
    pos = aim + Vector((math.sin(az) * dist, -math.cos(az) * dist, height))
    co.location = pos
    co.rotation_quaternion = (aim + Vector((0, 0, 0.15)) - pos).to_track_quat("-Z", "Y")
    co.keyframe_insert("location", frame=f)
    co.keyframe_insert("rotation_quaternion", frame=f)
    if cam_spec.get("dof", True):
        focus.location = aim
        focus.keyframe_insert("location", frame=f)

# ---------------- material check + render ----------------
imgs = [i for i in bpy.data.images if i.source == "FILE"]
report["textures"] = {"loaded": sum(1 for i in imgs if i.has_data or (i.filepath and os.path.exists(bpy.path.abspath(i.filepath)))),
                      "total": len(imgs), "missing": [i.name for i in imgs if not (i.filepath and os.path.exists(bpy.path.abspath(i.filepath)))]}
report["objects"] = {k: {"dims_m": [round(v, 3) for v in o.dimensions]} for k, o in objs.items()}
json.dump(report, open(os.path.join(OUT, "report.json"), "w"), indent=1)
sc.render.image_settings.file_format = "PNG"
sc.render.filepath = os.path.join(OUT, "f_####")
if not spec.get("no_render"):
    bpy.ops.render.render(animation=True)
print("PHYSICS_DONE", json.dumps(report["verify"]))
