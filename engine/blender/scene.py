"""Build ONE storyboard scene in Blender and render its frames (runs inside Blender).
The director's storyboard (three.js coordinates: y up, the camera looks toward -z) is mapped to Blender (z up):
three (x, y, z) -> blender (x, -z, y). The camera is replayed EXACTLY like camera.ts (keys, exponential push-in,
quintic glide, cuts, roll); actors play their mode / pose / talk / walk / expression keys through the rig; the set is
built from the env preset; pieces become Kenney models or simple 3D proxies. Frames are written with handles (8
before / 8 after) so the compositor can play the motion dissolves between scenes.
usage: blender -b --python engine/blender/scene.py -- <repo_root> <storyboard.json> <scene_idx> <out_dir> <faces_dir> [res%] [samples]"""
import json
import math
import os
import sys

import bpy
from mathutils import Matrix, Vector

argv = sys.argv[sys.argv.index("--") + 1:]
ROOT, SB, IDX, OUT, FACES = argv[0], argv[1], int(argv[2]), argv[3], argv[4]
RES = int(argv[5]) if len(argv) > 5 else 100
SAMPLES = int(argv[6]) if len(argv) > 6 else 24
sys.path.insert(0, ROOT)
from engine.blender import look as L, sets, rig  # noqa: E402

KITS = os.path.join(ROOT, "engine", "remotion", "public", "kits")
sb = json.load(open(SB, encoding="utf-8"))
S = sb["scenes"][IDX]
FPS = sb["fps"]
HANDLE = 8
F0, F1 = max(0, S["startFrame"] - HANDLE), min(sb["durationInFrames"] - 1, S["endFrame"] + HANDLE)


def B(x, y, z):          # three.js -> blender
    return Vector((x, -z, y))


bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
L.setup_render(sc, F1, RES, SAMPLES)
sc.frame_start, sc.frame_end = F0, F1
env = S.get("env") or sb.get("env") or {"preset": "apartment"}
preset, variant = env.get("preset", "apartment"), env.get("variant")
light = S.get("light", "day")

# ---------------- camera (exact replay of camera.ts camAt) ----------------
glide = lambda u: (lambda x: x * x * x * (x * (6 * x - 15) + 10))(min(1.0, max(0.0, u)))


def key_cam(k, f, push):
    s = math.exp(-push * max(0, f - k["frame"]))
    p, l = k["position"], k["lookAt"]
    return ([l[i] + (p[i] - l[i]) * s for i in range(3)], list(l), k.get("fov", 40), k.get("roll", 0.0))


def cam_at(f):
    keys = sorted(S["cameraKeys"], key=lambda k: k["frame"])
    push = S.get("push", 0.002)
    cur = key_cam(keys[0], f, push)
    for k in keys[1:]:
        if f < k["frame"]:
            break
        nxt = key_cam(k, f, push)
        if k.get("cut"):
            cur = nxt
        else:
            g = glide((f - k["frame"]) / (k.get("dur") or 24))
            cur = ([cur[0][i] + (nxt[0][i] - cur[0][i]) * g for i in range(3)], [cur[1][i] + (nxt[1][i] - cur[1][i]) * g for i in range(3)],
                   cur[2] + (nxt[2] - cur[2]) * g, cur[3] + (nxt[3] - cur[3]) * g)
    pos, look, fov, roll = cur
    punch = 0.0
    for k in S.get("kicks") or []:
        n = f - k["frame"] + 1
        if 0 <= n < 12:
            punch = max(punch, 0.1 * min(1, k.get("amp", 0.5) + 0.2) * (1 - n / 12) ** 2)
    return pos, look, fov * (1 - punch), roll


cam = bpy.data.cameras.new("cam")
cam.sensor_fit = "VERTICAL"
cam.clip_start, cam.clip_end = 0.1, 1500
co = bpy.data.objects.new("cam", cam)
bpy.context.collection.objects.link(co)
sc.camera = co
co.rotation_mode = "QUATERNION"
for f in range(F0, F1 + 1):
    pos, look, fov, roll = cam_at(f)
    P, T = B(*pos), B(*look)
    q = (T - P).to_track_quat("-Z", "Y")
    if roll:
        q = q @ Matrix.Rotation(roll, 4, "Z").to_quaternion()
    co.location, co.rotation_quaternion = P, q
    cam.angle = math.radians(fov)
    co.keyframe_insert("location", frame=f)
    co.keyframe_insert("rotation_quaternion", frame=f)
    cam.keyframe_insert("lens", frame=f)

# ---------------- set ----------------
ROOMS = {   # preset: (half width W, back depth D, height H, floor, back wall, side wall)
    "apartment": (6.5, 5.5, 3.6, "#b9773f", "#f2c98a", "#4fa3a0"), "office": (7, 5.5, 3.8, "#5a7ab8", "#f4efe2", "#7fb0d9"),
    "gameroom": (5.5, 4.4, 3.2, "#5a5070", "#2a2448", "#231e3e"), "bedroom": (5.5, 4.6, 3.3, "#b07a4a", "#d9c8e8", "#c8b4d9"),
    "kitchen": (5.5, 4.4, 3.2, "#e9d9b4", "#ffffff", "#f7c46a"), "clinic": (5.5, 4.6, 3.3, "#d9eef0", "#eef8f7", "#8fd0c0"),
    "datacenter": (9, 9, 4.2, "#c9ced6", "#2b3240", "#2b3240"), "hotel": (6, 5, 3.5, "#5a2f4a", "#3b2f5a", "#2f2a4a"),
    "bathroom": (4.2, 4.2, 3.2, "#f4f1ea", "#eef6f8", "#eef6f8"), "trading": (10, 7, 5, "#4a4a58", "#22222c", "#1d1d26"),
    "warehouse": (14, 10, 7, "#a8885a", "#c8643a", "#a8503a"), "airport": (14, 8, 7, "#e9e6df", "#9fd0f0", "#f2c94a"),
    "cabin": (4.5, 4, 3.0, "#8a5a34", "#9a6a42", "#9a6a42"), "banquet": (11, 8, 6, "#b07a4a", "#f2e6d4", "#efe0c8"),
}
if preset == "office" and variant == "retro":
    ROOMS["office"] = (6.5, 5.5, 3.6, "#d9c08a", "#9a5a2e", "#7a4f2e")
if preset == "apartment" and variant == "retro":
    ROOMS["apartment"] = (6.5, 5.5, 3.6, "#b07a4a", "#8a5a34", "#7a4f2e")
xs = [a["x"] for a in S["actors"]] + [p["x"] for p in S.get("pieces") or []]
zs = [a["z"] for a in S["actors"]] + [p["z"] for p in S.get("pieces") or []]
night = light == "night"


def lights(interior):
    w = sc.world = bpy.data.worlds.new("world")
    w.use_nodes = True
    bg = w.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (0.03, 0.04, 0.09, 1) if night else (0.42, 0.55, 0.75, 1) if not interior else (0.06, 0.07, 0.11, 1)
    bg.inputs["Strength"].default_value = 1.0
    sun = bpy.data.lights.new("sun", "SUN")
    sun.energy = {"day": 5.5, "golden": 4.5, "night": 1.2}[light]
    sun.color = {"day": (1.0, 0.93, 0.82), "golden": (1.0, 0.72, 0.45), "night": (0.55, 0.65, 1.0)}[light]
    sun.angle = math.radians(0.8)
    so = bpy.data.objects.new("sun", sun)
    bpy.context.collection.objects.link(so)
    # sun from camera-left and above, relative to the scene's opening view (lit faces, long shadows behind the cast)
    pos, look, _, _ = cam_at(S["startFrame"])
    d = B(*look) - B(*pos)
    d.z = 0
    d.normalize()
    az = math.atan2(d.x, d.y) + math.radians(-35 if light != "golden" else -60)
    el = math.radians(48 if light == "day" else 18 if light == "golden" else 35)
    dirv = Vector((math.sin(az) * math.cos(el), math.cos(az) * math.cos(el), -math.sin(el)))
    so.rotation_mode = "QUATERNION"
    so.rotation_quaternion = dirv.to_track_quat("-Z", "Y")
    fill = bpy.data.lights.new("fill", "AREA")
    fill.energy, fill.size, fill.color = (60 if night else 140), 6, (0.7, 0.8, 1.0)
    fo = bpy.data.objects.new("fill", fill)
    fo.location = B(*pos) + Vector((0, 0, 1.5))
    fo.rotation_mode = "QUATERNION"
    fo.rotation_quaternion = (B(*look) - fo.location).to_track_quat("-Z", "Y")
    bpy.context.collection.objects.link(fo)
    if interior or night:   # warm key over the action (a lit stage, darker corners)
        k = bpy.data.lights.new("key", "SPOT")
        k.energy, k.spot_size, k.spot_blend, k.color = (900 if night else 500), math.radians(70), 0.8, (1.0, 0.82, 0.6)
        ko = bpy.data.objects.new("key", k)
        ko.location = B(look[0], 3.4, look[2]) + (B(*pos) - B(*look)).normalized() * 1.8
        ko.location.z = 3.4
        ko.rotation_mode = "QUATERNION"
        ko.rotation_quaternion = (B(look[0], 0.6, look[2]) - ko.location).to_track_quat("-Z", "Y")
        bpy.context.collection.objects.link(ko)


def room(W, D, H, floor_c, back_c, side_c):
    W = max(W, max([abs(x) for x in xs] + [0]) + 2.5)
    D = max(D, max([-z for z in zs] + [0]) + 2.0)
    floor = L.toon("floor", L.hexc(floor_c))
    sets.box("floor", (2 * W, D + 30, 0.1), (0, (D - 30) / 2 + 0, -0.05), floor)
    if preset in ("apartment", "bedroom", "cabin") or floor_c.startswith("#b0") or floor_c.startswith("#8a5a"):
        g = L.toon("groove", L.hexc("#6a4426"))
        for k in range(int(-W / 0.6), int(W / 0.6) + 1):
            sets.box(f"gr{k}", (0.025, D + 30, 0.01), (k * 0.6, (D - 30) / 2, 0.003), g)
    back, side = L.toon("wallB", L.hexc(back_c)), L.toon("wallS", L.hexc(side_c))
    # back wall with a window (left of centre) unless the room is a windowless type
    windowless = preset in ("datacenter", "trading", "gameroom", "bathroom", "warehouse")
    if windowless:
        sets.box("back", (2 * W, 0.25, H), (0, D, H / 2), back)
    else:
        wx0, wx1, wz0, wz1 = -W * 0.45, W * 0.05, 1.0, min(H - 0.5, 2.7)
        for nm, size, loc in [("bl", (wx0 + W, 0.25, H), ((wx0 - W) / 2, D, H / 2)), ("br", (W - wx1, 0.25, H), ((W + wx1) / 2, D, H / 2)),
                              ("bs", (wx1 - wx0, 0.25, wz0), ((wx0 + wx1) / 2, D, wz0 / 2)), ("bh", (wx1 - wx0, 0.25, H - wz1), ((wx0 + wx1) / 2, D, (H + wz1) / 2))]:
            sets.box(nm, size, loc, back)
        fr = L.toon("frame", L.hexc("#f4efe6"))
        for x in (wx0, (wx0 + wx1) / 2, wx1):
            sets.box(f"m{x:.2f}", (0.08, 0.3, wz1 - wz0), (x, D - 0.05, (wz0 + wz1) / 2), fr, outline=0.006)
        sets.box("mh", (wx1 - wx0, 0.3, 0.08), ((wx0 + wx1) / 2, D - 0.05, (wz0 + wz1) / 2), fr, outline=0.006)
        sky = "#22305a" if night else "#f2b07a" if light == "golden" else "#8fc4ec"
        sets.box("sky", (60, 0.1, 30), (0, D + 12, 8), L.flat("skyM", L.hexc(sky), 1.4), shadow=False)
        for k in range(8):
            sets.box(f"bld{k}", (2.2, 0.4, 3 + k % 3 * 2), (wx0 - 3 + k * 2.6, D + 8, 1.5 + k % 3), L.flat("bldM", L.hexc("#3a4a7a" if night else "#6f8fb8"), 1.0), shadow=False)
    # side walls: never between the lens and the cast (a camera outside the room on that side drops that wall)
    cams = [B(*cam_at(f)[0]) for f in range(S["startFrame"], S["endFrame"], 4)]
    for s in (-1, 1):
        if any(c.x * s > W - 0.3 for c in cams):
            continue
        sets.box(f"side{s}", (0.25, D + 8, H), (s * W, (D - 8) / 2, H / 2), side)
    trim = L.toon("trim", L.hexc("#3a3440"))
    sets.box("trimB", (2 * W, 0.3, 0.14), (0, D - 0.1, 0.07), trim)
    # haze inside the room only (light shafts)
    hz = L._new_mat("haze")
    hv = hz.node_tree.nodes.new("ShaderNodeVolumePrincipled")
    hv.inputs["Density"].default_value = 0.035
    hv.inputs["Anisotropy"].default_value = 0.5
    hz.node_tree.links.new(hv.outputs[0], hz.node_tree.nodes.new("ShaderNodeOutputMaterial").inputs["Volume"])
    sets.box("haze", (2 * W - 0.4, D + 6, H - 0.1), (0, (D - 6) / 2, H / 2), hz, shadow=False)
    # set dressing per room type (CC0 Kenney furniture against the walls, never in the middle)
    dress = {
        "apartment": [("loungeSofa", 0.95, (W * 0.45, D - 0.7), math.pi), ("lampRoundFloor", 1.9, (-W + 0.8, D - 0.8), 0), ("pottedPlant", 1.4, (W - 0.7, D - 0.7), 0),
                      ("bookcaseOpen", 2.2, (-W + 0.5, 0.0), -math.pi / 2), ("rugRounded", 0.03, (0, 1.0), 0)],
        "office": [("desk", 0.78, (0, D - 1.2), math.pi), ("chairDesk", 1.0, (0, D - 0.4), math.pi), ("bookcaseClosedWide", 2.0, (W - 0.5, 0.6), math.pi / 2),
                   ("pottedPlant", 1.4, (-W + 0.7, D - 0.7), 0), ("coatRackStanding", 1.9, (-W + 0.7, 1.0), 0)],
        "gameroom": [("desk", 0.78, (-1.4, D - 0.6), math.pi), ("chairDesk", 1.0, (-1.4, D - 1.4), 0), ("speaker", 0.55, (-2.9, D - 0.5), math.pi),
                     ("bookcaseOpenLow", 1.1, (W - 0.45, 0.8), math.pi / 2), ("loungeChairRelax", 1.0, (-W + 1.0, 0.6), -math.pi / 2), ("rugRound", 0.03, (0.8, 1.2), 0)],
        "bedroom": [("bedDouble", 1.0, (-0.6, D - 1.2), math.pi), ("sideTableDrawers", 0.7, (-2.4, D - 0.4), math.pi), ("pottedPlant", 1.4, (W - 0.8, D - 0.8), 0)],
        "kitchen": [("kitchenFridge", 1.9, (W - 0.9, D - 0.5), math.pi), ("kitchenCabinet", 0.9, (-1.0, D - 0.45), math.pi), ("kitchenStove", 0.9, (0.2, D - 0.45), math.pi),
                    ("tableRound", 0.75, (-2.6, 1.2), 0)],
        "clinic": [("pottedPlant", 1.4, (-W + 0.7, D - 0.7), 0), ("sideTable", 0.7, (W - 0.8, D - 0.5), 0)],
        "warehouse": [("cardboardBoxClosed", 0.8, (-W + 1.5, D - 1.2), 0.2), ("cardboardBoxClosed", 0.8, (-W + 2.4, D - 1.0), 0.6), ("cardboardBoxOpen", 0.7, (W - 1.6, D - 1.5), 0)],
        "airport": [("pottedPlant", 1.6, (W - 1.0, D - 1.0), 0), ("pottedPlant", 1.6, (-W + 1.0, D - 1.0), 0)],
    }.get(preset, [])
    if variant == "empty":   # sold / moved out: bare room, one hanging bulb
        dress = []
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.12, location=(0.3, D * 0.4, H - 0.9))
        bpy.context.object.data.materials.append(L.flat("bulb", (1.0, 0.85, 0.5), 6.0))
        bl = bpy.data.lights.new("bulbL", "POINT"); bl.energy = 120; bl.color = (1.0, 0.8, 0.5)
        blo = bpy.data.objects.new("bulbL", bl); blo.location = (0.3, D * 0.4, H - 1.05); bpy.context.collection.objects.link(blo)
        tube = sets.box("cord", (0.015, 0.015, 0.85), (0.3, D * 0.4, H - 0.42), L.toon("cord", L.hexc("#1d1b22")))
    if preset == "office" and variant == "rows":   # open-plan floor: rows of identical desks, monitors and empty chairs
        dress = []
        for r_ in range(4):
            for c_ in range(-3, 4):
                x, y = c_ * 1.9, D - 1.2 - r_ * 2.0
                if abs(c_) <= 1 and r_ >= 2:
                    continue   # keep the aisle where the cast stands clear
                sets.kenney(KITS, "furniture-kit", "desk", 0.76, (x, y, 0), math.pi)
                sets.kenney(KITS, "furniture-kit", "computerScreen", 0.42, (x, y + 0.15, 0.76), math.pi)
                sets.kenney(KITS, "furniture-kit", "chairDesk", 0.95, (x, y - 0.75, 0), 0.25 * ((c_ + r_) % 3 - 1))
    # CC0 Poly Haven props (photographed textures under our toon shading + ink) dress every room type
    ph = {
        "office": [("wall_clock", 0.45, (W * 0.55, D - 0.16, 2.3), 0), ("potted_plant_01", 1.3, (-W + 0.7, D - 0.7, 0), 0),
                   ("potted_plant_01", 1.3, (W - 0.7, D - 0.7, 0), 1.0)],
        "kitchen": [("electric_stove", 0.95, (1.2, D - 0.5, 0), 0), ("vintage_microwave", 0.32, (-1.2, D - 0.45, 0.9), 0),
                    ("WoodenChair_01", 0.95, (-W + 0.8, 0.6, 0), -math.pi / 2), ("wall_clock", 0.4, (-0.2, D - 0.16, 2.4), 0)],
        "apartment": [("potted_plant_01", 1.3, (W - 0.8, D - 0.8, 0), 0), ("wall_clock", 0.45, (W * 0.3, D - 0.16, 2.5), 0)],
        "bedroom": [("wooden_bookshelf_worn", 1.9, (W - 0.5, 0.4, 0), -math.pi / 2), ("desk_lamp_arm_01", 0.5, (-2.4, D - 0.4, 0.7), 0.4)],
        "clinic": [("vintage_microscope", 0.4, (W - 0.8, D - 0.5, 0.7), 0.6), ("potted_plant_01", 1.3, (-W + 0.7, D - 0.7, 0), 0),
                   ("wall_clock", 0.4, (0.0, D - 0.16, 2.5), 0)],
    }.get(preset, [])
    if variant != "empty":
        for nm, h, (x, y, z), yaw in ph:
            sets.polyhaven(nm, h, (x, y, z), yaw)
    for nm, h, (x, y), yaw in dress:
        sets.kenney(KITS, "furniture-kit", nm, h, (x, y, 0), yaw)
    if preset == "office" and variant == "retro":   # 1966 lab: radar console glowing green
        sets.box("radar", (3.0, 1.0, 1.0), (W * 0.45, D - 0.6, 0.5), L.toon("radarM", L.hexc("#5a6a5a")), outline=0.01)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.5, depth=0.04, location=(W * 0.45, D - 1.12, 1.6), rotation=(math.pi / 2, 0, 0))
        bpy.context.object.data.materials.append(L.flat("radarG", (0.05, 1.2, 0.3), 2.0))
    if preset == "datacenter":
        rack, led = L.toon("rack", L.hexc("#1d1f26")), L.flat("led", (0.2, 2.5, 1.2) if variant != "red" else (3.0, 0.2, 0.1), 3.0)
        for x in (-6, -2.2, 2.2, 6):
            for y in range(-1, int(D) - 1, 2):
                sets.box(f"rk{x}{y}", (1.1, 1.15, 2.4), (x, y + 0.6, 1.2), rack, outline=0.01)
                sets.box(f"ld{x}{y}", (0.04, 0.9, 1.9), (x - 0.57, y + 0.6, 1.2), led)
    lights(True)


def outdoors():
    """exterior set laid out from the camera's point of view: the street / houses / trees / sea / sky are placed BEYOND the
    cast along the opening view direction (the director's cameras can look any way, e.g. down a long street)"""
    ground = {"street": "#8a8f98", "shops": "#8a8f98", "suburb": "#7cbf4f", "park": "#6fae4a", "village_square": "#c8b89a", "market": "#c8b89a",
              "beach": "#e9cf8a", "outback": "#d9884a", "harbour": "#8a8f98", "lake": "#6fae4a", "resort": "#e9cf8a", "bridge": "#6fae4a"}.get(preset, "#7cbf4f")
    pos, look, _, _ = cam_at(S["startFrame"])
    P, T = B(*pos), B(*look)
    d = T - P
    d.z = 0
    d = d.normalized() if d.length > 1e-6 else Vector((0, 1, 0))
    side = Vector((d.y, -d.x, 0))
    yaw_face = math.pi - math.atan2(d.x, d.y)          # a Kenney front (+Y) turned to face the lens
    far = max([(B(a["x"], 0, a["z"]) - T).dot(d) for a in S["actors"]] + [0.0])
    C0 = Vector((T.x, T.y, 0))
    sets.box("ground", (600, 600, 0.1), (C0.x, C0.y, -0.05), L.toon("ground", L.hexc(ground)))

    def at(along, across):
        v = C0 + d * along + side * across
        return (v.x, v.y, 0.0)

    if preset in ("street", "shops", "suburb", "harbour"):
        road = sets.box("road", (8, 400, 0.02), (0, 0, 0.005), L.toon("road", L.hexc("#4a4f5a")))
        road.location = at(far + 5.0, 0)
        road.rotation_euler = (0, 0, math.atan2(-d.x, d.y) + math.pi / 2)
        names = ["building-a", "building-c", "building-e", "building-g"] if preset in ("street", "shops", "harbour") else ["building-type-a", "building-type-c", "building-type-f", "building-type-k"]
        kit = "city-kit-commercial" if preset in ("street", "shops", "harbour") else "city-kit-suburban"
        for k in range(-5, 6):
            sets.kenney(KITS, kit, names[(k + 5) % 4], 9 if kit.startswith("city-kit-c") else 5.5, at(far + 13.0, k * 7.5), yaw_face)
        for k in range(-4, 5):
            sets.kenney(KITS, "car-kit", ["sedan", "suv", "taxi", "van"][(k + 4) % 4], 1.5, at(far + 5.0, k * 9 + 3), yaw_face + math.pi / 2)
    if preset in ("park", "suburb", "village_square", "market", "lake", "bridge"):
        for k in range(14):
            a = k * 2.4
            sets.kenney(KITS, "city-kit-suburban", "tree-large" if k % 2 else "tree-small", 5 + (k % 3), at(far + 14 + abs(math.sin(a)) * 16, math.cos(a) * (14 + k)), a)
    if preset in ("ocean", "beach", "harbour", "island", "resort"):
        sea = sets.box("sea", (600, 300, 0.1), (0, 0, 0.02), L.toon("water", L.hexc("#2f8fd0")))
        sea.location = at(150 + (far if preset != "ocean" else -150), 0)
        sea.location.z = 0.02
        sea.rotation_euler = (0, 0, math.atan2(-d.x, d.y))
    sky = "#22305a" if night else "#f2b07a" if light == "golden" else "#8fc4ec"
    sk = sets.box("skyB", (900, 1, 400), (0, 0, 0), L.flat("skyM", L.hexc(sky), 1.3), shadow=False)
    sk.location = at(300, 0)
    sk.location.z = 100
    sk.rotation_euler = (0, 0, math.atan2(-d.x, d.y))
    lights(False)


if preset in ROOMS:
    room(*ROOMS[preset])
else:
    outdoors()

# ---------------- pieces ----------------
KMAP = {"sofa": ("furniture-kit", "loungeSofa", 1.0), "microwave": ("furniture-kit", "kitchenMicrowave", 0.45), "fridge": ("furniture-kit", "kitchenFridge", 1.9),
        "bed": ("furniture-kit", "bedDouble", 1.0), "desk": ("furniture-kit", "desk", 0.8), "cardbox": ("furniture-kit", "cardboardBoxClosed", 0.7),
        "plantpot": ("furniture-kit", "pottedPlant", 1.7), "car": ("car-kit", "sedan", 1.6),
        "van": ("car-kit", "van", 2.2), "truck": ("car-kit", "truck", 2.6), "semi": ("car-kit", "truck", 3.2), "boxes": ("furniture-kit", "cardboardBoxClosed", 1.0),
        "crates": ("furniture-kit", "cardboardBoxClosed", 1.0), "snacks": ("food-kit", "pizza-box", 0.3)}
PSIZE = {"airplane": (16, 5.3), "board": (1.9, 2.47), "chalkboard": (1.9, 2.47), "calendar": (1.5, 1.5), "cashcounter": (1.2, 2.16), "console": (0.9, 1.5),
         "rack": (1.1, 2.2), "tubetv": (1.5, 1.5), "brownbox": (1.2, 0.69), "eye": (1.3, 1.3), "hospitalbed": (2.4, 1.84), "vending": (1.25, 2.4)}


def airplane(loc, k, yaw):
    w = L.toon("plane", L.hexc("#f4f4f6"))
    red, blue = L.toon("planeR", L.hexc("#c8323a")), L.toon("planeB", L.hexc("#3f6fb5"))
    root = bpy.data.objects.new("airplane", None)
    bpy.context.collection.objects.link(root)
    root.location, root.rotation_euler, root.scale = loc, (0, 0, yaw), (k, k, k)
    parts = []
    bpy.ops.mesh.primitive_cylinder_add(radius=1.0, depth=12, location=(0, 0, 2.2), rotation=(0, math.pi / 2, 0)); parts.append((bpy.context.object, w))
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, location=(6, 0, 2.2)); o = bpy.context.object; o.scale = (1.6, 1, 1); parts.append((o, w))
    bpy.ops.mesh.primitive_cone_add(radius1=1.0, radius2=0.25, depth=3, location=(-7.4, 0, 2.5), rotation=(0, -math.pi / 2, 0)); parts.append((bpy.context.object, w))
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0.5, 0, 1.9)); o = bpy.context.object; o.scale = (2.4, 14, 0.18); parts.append((o, w))
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-7.6, 0, 4.0)); o = bpy.context.object; o.scale = (1.6, 0.18, 2.6); parts.append((o, red))
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-7.4, 0, 2.6)); o = bpy.context.object; o.scale = (1.2, 4.5, 0.12); parts.append((o, w))
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 2.2)); o = bpy.context.object; o.scale = (12, 2.04, 0.18); parts.append((o, blue))
    for x in range(-5, 6):   # windows: little rounded squares (the Comet's problem)
        for s in (-1, 1):
            bpy.ops.mesh.primitive_cube_add(size=1, location=(x * 0.9, s * 1.0, 2.6)); o = bpy.context.object; o.scale = (0.35, 0.06, 0.35)
            parts.append((o, L.toon("planeWin", L.hexc("#2b3a5a"))))
    for o, m in parts:
        o.data.materials.append(m)
        L.smooth(o)
        L.ink(o, 0.03)
        o.parent = root


def text3d(text, parent, z, size, col=(1, 1, 1), strength=1.2, y=-0.05, width=None):
    """flat lettering on the front (-Y) of a parent object; '|' = new line"""
    cu = bpy.data.curves.new("txt", "FONT")
    cu.body = (text or "").replace("|", "\n")
    cu.align_x, cu.align_y, cu.size = "CENTER", "CENTER", size
    try:
        cu.font = bpy.data.fonts.load("C:/Windows/Fonts/ariblk.ttf", check_existing=True)
    except Exception:
        pass
    o = bpy.data.objects.new("txt", cu)
    bpy.context.collection.objects.link(o)
    o.data.materials.append(L.flat(f"txt{col}", col, strength))
    o.parent = parent
    o.location, o.rotation_euler = (0, y, z), (math.pi / 2, 0, 0)
    if width:   # shrink long lines to fit
        bpy.context.view_layer.update()
        w = o.dimensions.x
        if w > width:
            o.scale = (width / w,) * 3
    return o


def game_screen(name):
    """a lit game screen: synthwave sky (purple -> pink -> orange) with a sun, glowing (blooms)"""
    m = L._new_mat(name)
    N, Lk = m.node_tree.nodes, m.node_tree.links
    tc, sep = N.new("ShaderNodeTexCoord"), N.new("ShaderNodeSeparateXYZ")
    Lk.new(tc.outputs["Generated"], sep.inputs[0])
    ramp = N.new("ShaderNodeValToRGB"); cr = ramp.color_ramp
    cr.elements[0].position, cr.elements[0].color = 0.0, (1.0, 0.45, 0.1, 1)
    cr.elements[1].position, cr.elements[1].color = 1.0, (0.18, 0.04, 0.35, 1)
    e = cr.elements.new(0.5); e.color = (1.0, 0.15, 0.45, 1)
    Lk.new(sep.outputs["Z"], ramp.inputs["Fac"])
    em = N.new("ShaderNodeEmission"); em.inputs["Strength"].default_value = 1.6
    Lk.new(ramp.outputs["Color"], em.inputs["Color"])
    Lk.new(em.outputs[0], N.new("ShaderNodeOutputMaterial").inputs["Surface"])
    return m


def piece3d(i, kind, label, loc, k, yaw):
    """a story piece as a real 3D prop: boards / screens / signs carry their text; else an inked block"""
    root = bpy.data.objects.new(f"pc{i}", None)
    bpy.context.collection.objects.link(root)
    root.location, root.rotation_euler, root.scale = loc, (0, 0, yaw), (k, k, k)
    wood, dark = L.toon("easelW", L.hexc("#8a5a34")), L.toon("screenB", L.hexc("#16151b"))
    parts = []
    if kind in ("board", "chalkboard", "corkboard", "blueprint"):
        for s in (-1, 1):
            parts.append(sets.box(f"leg{i}{s}", (0.06, 0.06, 2.3), (s * 0.6, 0.1, 1.15), wood, outline=0.006))
        face_c = {"corkboard": "#c79a5e", "blueprint": "#2f5fb0"}.get(kind, "#2f5a46")
        parts.append(sets.box(f"brd{i}", (1.6, 0.08, 1.15), (0, 0, 1.55), L.toon(f"brdF{i}", L.hexc(face_c)), outline=0.01))
        parts.append(sets.box(f"brdT{i}", (1.7, 0.1, 0.07), (0, 0, 2.15), wood, outline=0.006))
        if label:
            text3d(label, root, 1.55, 0.2, (1, 1, 1) if kind != "corkboard" else (0.1, 0.08, 0.1), 1.3, -0.05, 1.4)
    elif kind in ("tv", "monitor", "screen", "ticker", "departures", "tubetv"):
        w, h, z = {"tv": (2.2, 1.25, 1.35), "monitor": (1.3, 0.75, 1.25), "screen": (4.5, 2.6, 2.6), "ticker": (4.2, 2.3, 1.7), "departures": (3.2, 1.8, 1.4), "tubetv": (1.0, 0.8, 0.95)}[kind]
        if kind == "tubetv":
            parts.append(sets.box(f"cab{i}", (1.4, 0.8, 1.0), (0, 0.05, 0.95), L.toon("tubeW", L.hexc("#8a5a34")), outline=0.01))
            for s in (-1, 1):
                parts.append(sets.box(f"tleg{i}{s}", (0.05, 0.05, 0.45), (s * 0.55, 0.05, 0.22), wood, outline=0.004))
        else:
            parts.append(sets.box(f"frm{i}", (w + 0.12, 0.08, h + 0.12), (0, 0, z), dark, outline=0.01))
            parts.append(sets.box(f"stand{i}", (0.1, 0.1, z - h / 2), (0, 0.05, (z - h / 2) / 2), dark, outline=0.006))
        smat = game_screen(f"scrG{i}") if (label or "").startswith("~game") else L.flat(f"scrM{i}", (0.25, 0.45, 0.95) if kind != "ticker" else (0.05, 0.05, 0.12), 1.3)
        scr = sets.box(f"scr{i}", (w, 0.02, h), (0, -0.05 if kind != "tubetv" else -0.36, z), smat, shadow=False)
        parts.append(scr)
        txt = (label or "").lstrip("~").replace("game", "").strip("|") or ""
        if txt:
            text3d(txt, root, z, 0.16 * w / 1.3, (1, 1, 1), 2.0, -0.08 if kind != "tubetv" else -0.38, w * 0.9)
    elif kind in ("calendar", "poster", "signs"):
        parts.append(sets.box(f"cal{i}", (1.1, 0.06, 1.3), (0, 0, 1.4), L.toon(f"calW{i}", L.hexc("#ffffff")), outline=0.008))
        parts.append(sets.box(f"calT{i}", (1.1, 0.07, 0.3), (0, -0.01, 1.92), L.toon(f"calR{i}", L.hexc("#e2453c")), outline=0.006))
        parts.append(sets.box(f"post{i}", (0.06, 0.06, 1.0), (0, 0.06, 0.5), wood, outline=0.004))
        if label:
            text3d(label, root, 1.35, 0.22, (0.1, 0.08, 0.1), 1.0, -0.05, 0.95)
    elif kind == "cashcounter":
        parts.append(sets.box(f"cc{i}", (0.9, 0.8, 1.6), (0, 0, 0.8), L.toon(f"ccM{i}", L.hexc("#2b2b38")), outline=0.01))
        parts.append(sets.box(f"ccd{i}", (0.7, 0.02, 0.32), (0, -0.41, 1.25), L.flat(f"ccD{i}", (0.05, 0.08, 0.06), 1), shadow=False))
        text3d(label or "$0.00", root, 1.25, 0.16, (0.25, 1.6, 0.5), 2.0, -0.43, 0.6)
    elif kind == "pinball":   # cabinet on legs, tilted playfield, lit backbox with the label
        body = L.toon(f"pbB{i}", L.hexc("#3f6fb5"))
        for x in (-0.5, 0.5):
            for y in (-0.6, 0.6):
                parts.append(sets.box(f"pbl{i}{x}{y}", (0.07, 0.07, 0.8), (x, y, 0.4), dark, outline=0.004))
        cab = sets.box(f"pbc{i}", (1.1, 1.6, 0.3), (0, 0, 0.95), body, outline=0.01)
        cab.rotation_euler = (math.radians(-7), 0, 0)
        parts.append(cab)
        pf = sets.box(f"pbf{i}", (0.98, 1.48, 0.02), (0, 0, 1.11), L.flat(f"pbF{i}", (0.9, 0.3, 0.55), 1.4), shadow=False)
        pf.rotation_euler = cab.rotation_euler
        parts.append(pf)
        parts.append(sets.box(f"pbx{i}", (1.1, 0.25, 0.9), (0, 0.85, 1.6), body, outline=0.01))
        parts.append(sets.box(f"pbg{i}", (0.95, 0.02, 0.7), (0, 0.72, 1.6), L.flat(f"pbG{i}", (1.6, 0.9, 0.2), 1.6), shadow=False))
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.04, location=(0.15, -0.2, 1.17))
        ball = bpy.context.object; ball.data.materials.append(L.toon("steel", L.hexc("#e6e8ec"))); parts.append(ball)
        text3d(label or "PINBALL", root, 1.6, 0.16, (0.1, 0.05, 0.1), 1.0, 0.70, 0.85)
    elif kind == "spring":    # a metal toy spring (helix tube)
        cu = bpy.data.curves.new(f"spr{i}", "CURVE"); cu.dimensions = "3D"; cu.bevel_depth = 0.012; cu.bevel_resolution = 3
        sp = cu.splines.new("POLY"); n = 220; sp.points.add(n - 1)
        for j in range(n):
            a = j / n * math.tau * 18
            sp.points[j].co = (0.17 * math.cos(a), 0.17 * math.sin(a), 0.02 + 0.28 * j / n, 1)
        so = bpy.data.objects.new(f"spr{i}", cu); bpy.context.collection.objects.link(so)
        so.data.materials.append(L.toon("springM", L.hexc("#c9ced6"), shade=0.5, mid=0.85)); parts.append(so)
    elif kind == "bubblewrap":   # a clear sheet covered in air bubbles
        parts.append(sets.box(f"bw{i}", (1.8, 0.02, 1.2), (0, 0, 0.75), L.toon(f"bwS{i}", L.hexc("#cfeaff"), shade=0.7, mid=0.9)))
        bub = L.toon("bubble", L.hexc("#f2fbff"), shade=0.75, mid=0.95)
        for x in range(-8, 9):
            for z in range(-5, 6):
                bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=6, radius=0.045, location=(x * 0.1, -0.03, 0.75 + z * 0.1))
                b = bpy.context.object; b.scale = (1, 0.5, 1); b.data.materials.append(bub); parts.append(b)
        if label:
            text3d(label, root, 1.5, 0.18, (0.1, 0.08, 0.1), 1.0, -0.05, 1.6)
    elif kind == "toast":   # a slice of toast: crust, crumb, butter on top
        parts.append(sets.box(f"tst{i}", (0.2, 0.2, 0.026), (0, 0, 0.013), L.toon("toastM", L.hexc("#c98a3e")), outline=0.004))
        parts.append(sets.box(f"tsb{i}", (0.15, 0.15, 0.006), (0, 0, 0.029), L.toon("butterM", L.hexc("#ffe28a")), outline=0.0))
    elif kind in ("papers", "note"):   # a doctor's note: white sheet, red cross, lines of text
        parts.append(sets.box(f"pap{i}", (0.21, 0.297, 0.004), (0, 0, 0.002), L.toon("paperM", L.hexc("#fbfaf6")), outline=0.002))
        parts.append(sets.box(f"pcx{i}", (0.05, 0.015, 0.002), (-0.06, 0.1, 0.005), L.flat("redX", (0.9, 0.1, 0.1))))
        parts.append(sets.box(f"pcy{i}", (0.015, 0.05, 0.002), (-0.06, 0.1, 0.005), L.flat("redX", (0.9, 0.1, 0.1))))
        for r_ in range(5):
            parts.append(sets.box(f"pl{i}{r_}", (0.15, 0.006, 0.002), (0.01, 0.04 - r_ * 0.035, 0.005), L.flat("inkL", (0.15, 0.15, 0.2))))
    elif kind == "console":
        parts.append(sets.box(f"cn{i}", (0.42, 0.95, 1.25), (0, 0, 0.66), L.toon(f"cnW{i}", L.hexc("#f2f2f5")), outline=0.01))
        parts.append(sets.box(f"cnB{i}", (0.18, 0.96, 1.2), (0, 0, 0.66), dark))
    else:
        w, h = PSIZE.get(kind, (1.2, 1.2))
        parts.append(sets.box(f"blk{i}", (w, 0.6, h), (0, 0, h / 2), L.toon(f"pcM{i}", L.hexc("#c9a06a")), outline=0.012))
        if label:
            text3d(label, root, h / 2, min(0.3, w / 6), (0.1, 0.08, 0.1), 1.0, -0.32, w * 0.9)
    for p in parts:
        p.parent = root
        p.location = p.location   # boxes were created at local coords: parenting keeps them relative to the root
    return root


def physics(o, kind, mode, at, f0, ci, n, k):
    """real motion, integrated frame by frame (g = 9.81 m/s2): 'fall' = slides off a table edge and tumbles (toast: about half
    a turn from table height, lands butter-side down), 'drop' = falls from above and settles (paper flutters), 'throw' =
    a ballistic arc with spin, 'topple' = a stack tips over. Bounces with restitution, friction on landing, then rests."""
    import random
    rnd = random.Random(hash((kind, ci, f0)) & 0xFFFF)
    g, dt = 9.81, 1.0 / FPS
    Pm, Lm = B(*cam_at(f0)[0]), B(*cam_at(f0)[1])
    toward = (Pm - Lm); toward.z = 0; toward.normalize()
    side = Vector((toward.y, -toward.x, 0))
    paper = kind in ("papers", "note")
    thin = 0.01 if paper else 0.02 * k if kind == "toast" else 0.12 * k
    start = Vector(at)
    floor = 0.0
    if mode == "drop":
        floor = at.z                                   # lands on the surface it was placed on (desk, counter, floor)
        start = at + side * rnd.uniform(-0.45, 0.45) + toward * rnd.uniform(-0.25, 0.25) + Vector((0, 0, 2.4 + 0.5 * ci))
        vel, w = Vector((0, 0, 0)), Vector((rnd.uniform(-3, 3), rnd.uniform(-3, 3), rnd.uniform(-2, 2)))
    elif mode == "fall":
        start = at + side * ((ci - (n - 1) / 2) * 0.32)
        vel, w = toward * 0.55, side * (math.pi / 0.42)  # half a turn while it drops ~0.76 m (0.39 s)
        floor = 0.0
    elif mode == "throw":
        vel, w = side * rnd.uniform(2.4, 3.2) + toward * 0.8 + Vector((0, 0, 2.6)), Vector((rnd.uniform(-8, 8), rnd.uniform(-8, 8), rnd.uniform(-4, 4)))
    else:   # topple: a stack; each box tips sideways and falls to the floor, upper ones further
        start = at + Vector((0, 0, ci * 0.13 * k))
        vel, w = side * (0.6 + 0.35 * ci) + toward * rnd.uniform(-0.2, 0.2), toward * (2.0 + ci * 0.6)
    base = o.location - Vector(at)            # importers put the model's base offset into the root location: keep it
    pos, rot = start.copy(), Vector((0.0, 0.0, o.rotation_euler.z))
    o.rotation_mode = "XYZ"
    t0 = f0 + (ci * 3 if mode in ("fall", "topple") else ci * 2)
    resting = False
    for f in range(F0, F1 + 1):
        if f >= t0 and not resting:
            if paper and mode == "drop":   # paper: low terminal speed, side-to-side flutter
                vel.z = max(vel.z - g * dt, -1.3)
                vel.x, vel.y = 0.9 * math.sin((f - t0) * 0.35 + ci), 0.6 * math.cos((f - t0) * 0.29 + ci)
                w = Vector((2.2 * math.sin((f - t0) * 0.3 + ci), 1.8 * math.cos((f - t0) * 0.27), 0.8))
            else:
                vel.z -= g * dt
            pos += vel * dt
            rot += w * dt
            if pos.z - thin / 2 <= floor:   # contact
                pos.z = floor + thin / 2
                if abs(vel.z) > 0.6 and not paper:
                    vel.z = -vel.z * 0.3          # bounce
                    vel.x *= 0.5; vel.y *= 0.5; w *= 0.4
                else:
                    resting = True
                    # settle flat on the nearest face (toast keeps the side it landed on)
                    rot.x = round(rot.x / math.pi) * math.pi
                    rot.y = round(rot.y / math.pi) * math.pi
        o.location = pos
        o.rotation_euler = (rot.x, rot.y, rot.z)
        o.keyframe_insert("location", frame=f)
        o.keyframe_insert("rotation_euler", frame=f)


pos0, look0, _, _ = cam_at(S["startFrame"])
for i, p in enumerate(S.get("pieces") or []):
    k = p.get("scale") or 1.0
    loc = B(p["x"], p.get("y", 0) or 0, p["z"])
    if p.get("label") or p["kind"] in ("tv", "monitor", "board", "chalkboard", "corkboard", "calendar", "signs", "screen", "toast"):
        # readable story props: inside the 9:16 frame, beside (never behind) the lead, as seen by the lens mid-shot
        pm, lm, fovm, _ = cam_at((S["startFrame"] + S["endFrame"]) // 2)
        Pm, Lm = B(*pm), B(*lm)
        fwd = Lm - Pm; fwd.z = 0; fwd.normalize()
        right = Vector((fwd.y, -fwd.x, 0))
        lead = B(S["actors"][0]["x"], 0, S["actors"][0]["z"]) if S["actors"] else Lm
        depth = max(1.5, (lead - Pm).dot(fwd) + 0.6)                     # just behind the lead's plane
        hw = depth * math.tan(math.radians(fovm) / 2) * (9 / 16)
        lat = (loc - Pm).dot(right)
        lead_lat = (lead - Pm).dot(right)
        side_ = 1 if (lat - lead_lat) >= 0 else -1
        pw_ = {"toast": 1.6, "board": 1.7, "chalkboard": 1.7, "corkboard": 1.7, "blueprint": 1.7, "tv": 2.3, "monitor": 1.4, "calendar": 1.1, "signs": 1.1,
               "screen": 4.6}.get(p["kind"], PSIZE.get(p["kind"], (1.2, 1.2))[0])
        if (p.get("scale") or 1.0) > 1.3:   # a deliberately huge prop (the giant TV): keep its size, just keep it beside the lead
            want = lead_lat + side_ * (0.45 + pw_ * k / 2)
        elif hw >= 1.1:   # wide enough: the whole prop fits beside the lead (scaled down if needed), text fully inside the frame
            avail = 0.95 * hw - 0.42 - abs(lead_lat) * 0.5
            k = max(0.45, min(k, avail / pw_))
            want = lead_lat + side_ * (0.42 + pw_ * k / 2)
            want = max(-(0.95 * hw - pw_ * k / 2), min(0.95 * hw - pw_ * k / 2, want))
        else:           # tight shot: at least the prop's centre half (its lettering) beside the lead, inside the frame
            want = max(-0.62 * hw, min(0.62 * hw, lead_lat + side_ * max(0.42 * hw, 0.7)))
        loc = Pm + fwd * depth + right * want
        loc.z = B(0, p.get("y", 0) or 0, 0).z
    if p["kind"] in ("cardbox", "boxes", "crates") and S["actors"]:
        a0 = S["actors"][0]
        lead0 = B(a0["x"], 0, a0["z"])
        if a0.get("mode") in ("sit", "chair") and (loc - lead0).length < 1.2:   # the box IS his seat: under him, seat height
            loc = Vector((lead0.x, lead0.y + 0.05, 0))
            k = 0.47 / 0.7
    cam_xy = B(*pos0)
    yaw = math.atan2(cam_xy.x - loc.x, -(cam_xy.y - loc.y))

    def make(at, ci):
        if p["kind"] == "airplane":
            return airplane(at, k * 0.9, yaw + math.pi / 2)
        if p["kind"] in KMAP:
            kit, nm, h = KMAP[p["kind"]]
            if p["kind"] in ("car", "van", "truck") and p.get("label") in ("taxi", "police"):
                nm = p["label"]
            o = sets.kenney(KITS, kit, nm, h * k, (at.x, at.y, at.z), yaw + (math.pi / 2 if kit == "car-kit" else 0))
            if p.get("label") and p["label"] not in ("taxi", "police") and ci == 0:   # a hand-written sign on it ("SOLD", prices...)
                sg = piece3d(i + 100, "signs", p["label"], at + Vector((0, 0, 0)), 0.8, yaw)
                sg.location.z = h * k * 0.55
            return o
        if p["kind"] == "table":
            return sets.polyhaven("dining_table", 0.76 * k, (at.x, at.y, at.z), yaw)
        if p["kind"] == "toast" and p.get("physics") == "fall" and ci == 0:
            # the table it slides off: its front edge (toward the lens) right under the toast's starting point
            fp = p.get("physFrame", S["startFrame"])
            tw = B(*cam_at(fp)[0]) - B(*cam_at(fp)[1]); tw.z = 0; tw.normalize()
            tyaw = math.atan2(tw.x, -tw.y) + math.pi / 2
            sets.polyhaven("dining_table", 0.76, (at.x - tw.x * 0.42, at.y - tw.y * 0.42, 0.0), tyaw)
        return piece3d(i * 50 + ci, p["kind"], p.get("label") if ci == 0 else None, at, k, yaw)

    n = int(p.get("count") or 1)
    for ci in range(n):
        if n > 1 and not p.get("physics"):   # a group: side by side along the lens' right axis
            at = loc + Vector((math.cos(yaw), math.sin(yaw), 0)) * ((ci - (n - 1) / 2) * 0.35)
        else:
            at = loc.copy()
        o = make(at, ci)
        if o is not None and p.get("physics"):
            physics(o, p["kind"], p["physics"], at, p.get("physFrame", S["startFrame"] + 8), ci, n, k)

# ---------------- cast ----------------
EXPR_MAP = {"grin": "laugh", "laugh": "laugh", "whistle": "neutral", "nervous": "sweat", "relief": "proud", "relief_open": "laugh", "dazed": "crazy",
            "pained": "sad", "smile": "proud", "smile_closed": "proud", "lick": "smug", "broken": "cry", "confused": "skeptical", "bored": "sleepy",
            "love": "starry", "evil": "smug", "squint": "skeptical", "stern": "angry", "scared": "scared"}
KNOWN = {"neutral", "smug", "shock", "laugh", "sweat", "starry", "crazy", "sad", "angry", "wink", "sleepy", "skeptical", "scared", "proud", "cry"}
ex = lambda e: e if e in KNOWN else EXPR_MAP.get(e, "neutral")
cast = {c["id"]: c for c in sb["cast"]}
cam_pos = B(*pos0)
people = []
HYBRID = bool(sb.get("hybrid"))   # characters come from the three.js layer: Blender renders the world and the props only
for j, a in enumerate([] if HYBRID else S["actors"]):
    c = cast.get(a["castId"], {"outfit": {}})
    o = c.get("outfit", {})
    loc = B(a["x"], a.get("y", 0) or 0, a["z"])
    exprs = sorted({ex(a.get("expr", "neutral"))} | {ex(k["expr"]) for k in a.get("exprKeys") or []})
    hair = o.get("hair") or o.get("cap") or "#3a2a1e"
    yaw0 = math.atan2(cam_pos.x - loc.x, -(cam_pos.y - loc.y))   # face the opening lens
    m = rig.Stickman(f"a{j}", FACES, loc=tuple(loc), yaw=yaw0, jacket=o.get("jacket", "#5a6170"), hair=hair, exprs=exprs, pants=o.get("pants", "#16131a"), outfit=o)
    if c.get("scale"):
        m.root.scale = (c["scale"],) * 3
    if a.get("holding"):
        m.hold(KITS, a["holding"])
    people.append((m, a, loc))
partner = {}
for j, (m, a, loc) in enumerate(people):   # two-person shots: lean the look 30 % toward the other one
    if len(people) > 1:
        o = people[1 - j if j < 2 else 0][2]
        partner[j] = o


def segments(a):
    """split the scene at expression keys; return [(f0, f1, expr)]"""
    keys = sorted(a.get("exprKeys") or [], key=lambda k: k["frame"])
    cuts = [F0] + [max(F0, min(F1, k["frame"])) for k in keys] + [F1 + 1]
    exprs = [ex(a.get("expr", "neutral"))] + [ex(k["expr"]) for k in keys]
    return [(cuts[i], cuts[i + 1], exprs[i]) for i in range(len(exprs)) if cuts[i + 1] > cuts[i]]


ACTION = {"stand": "stand", "stroll": "walk", "march": "walk", "run": "run", "dance": "cheer", "sit": "sitchair", "chair": "sitchair", "fall": "fall", "jump": "cheer"}
POSE = {"point": "point", "shrug": "shrug", "hips": "hips", "up": "cheer"}
for j, (m, a, loc) in enumerate(people):
    mode = a.get("mode", "stand")
    act = POSE.get(a.get("pose")) or ("wave" if a.get("wave") else ACTION.get(mode, "stand"))
    talk = [tuple(t) for t in a.get("talk") or []]
    look_pt = None
    if j in partner:
        p2 = partner[j]
        look_pt = (cam_pos.x * 0.85 + p2.x * 0.15, cam_pos.y * 0.85 + p2.y * 0.15)   # play to the lens, a hint toward the partner
    if a.get("look") in (-1, 1):
        side = Vector((1, 0, 0)) if a["look"] > 0 else Vector((-1, 0, 0))
        look_pt = (loc.x + side.x * 1.2 + (cam_pos.x - loc.x), loc.y + (cam_pos.y - loc.y))
    if a.get("walkTo") and a.get("walkFrames"):
        w0, w1 = a["walkFrames"]
        dest = B(a["walkTo"][0], 0, a["walkTo"][1])
        segs = segments(a)
        e0 = segs[0][2]
        m.act(F0, max(F0 + 1, w0), "stand", e0, talk=talk, seed=j * 1.7)
        m.act(max(F0 + 1, w0), max(F0 + 2, w1), "run" if mode == "run" else "walk", e0, walk_to=(dest.x, dest.y), seed=j * 1.7)
        m.act(max(F0 + 2, w1), F1 + 1, act if act not in ("walk", "run") else "stand", segs[-1][2], talk=talk, seed=j * 1.7, face=(cam_pos.x, cam_pos.y))
    else:
        for k, (f0, f1, e) in enumerate(segments(a)):
            m.act(f0, f1, act if act not in ("walk", "run") else "stand", e, talk=talk, seed=j * 1.7, face=look_pt if k == 0 else None)

# depth of field on the lead's head
dof = S.get("dof") or {}
if HYBRID and S["actors"] and dof.get("cInf", 0) > 0:   # focus where the lead's head will be composited
    fa = S["actors"][min(dof.get("focusActor", 0), len(S["actors"]) - 1)]
    tgt = bpy.data.objects.new("focusPt", None); bpy.context.collection.objects.link(tgt)
    tgt.location = B(fa["x"], 1.55 + (fa.get("y", 0) or 0), fa["z"])
    cam.dof.use_dof = True; cam.dof.focus_object = tgt; cam.dof.aperture_fstop = max(1.4, 28.0 / dof["cInf"])
if people and dof.get("cInf", 0) > 0:   # cInf = blur of the background in px at infinity (three.js lens); bigger = shallower
    cam.dof.use_dof = True
    cam.dof.focus_object = people[min(dof.get("focusActor", 0), len(people) - 1)][0].head
    cam.dof.aperture_fstop = max(1.4, 28.0 / dof["cInf"])

L.compositor(sc)
sc.render.image_settings.file_format = "JPEG"
sc.render.image_settings.quality = 92
os.makedirs(os.path.join(OUT, str(IDX)), exist_ok=True)
sc.render.filepath = os.path.join(OUT, str(IDX), "f_#####")
bpy.ops.render.render(animation=True)
print("SCENE_DONE", IDX, F0, F1)
