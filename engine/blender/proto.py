"""Blender prototype of the new render path: a bean-stickman (3D, toon two-tone, inverted-hull ink outline, 2D acting
face decal) in a room with a window, hard sun shadows, volumetric light shafts, warm practical lamp, CC0 Kenney
furniture, a travelling camera with depth of field, bloom + vignette in the compositor. EEVEE (Blender 4.5 LTS).
usage: blender -b --python engine/blender/proto.py -- <faces_dir> <out_dir> <kits_dir> [frames] [res%] [expr]"""
import math
import os
import sys

import bmesh
import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
FACES, OUT, KITS = argv[0], argv[1], argv[2]
FRAMES = int(argv[3]) if len(argv) > 3 else 60
RES = int(argv[4]) if len(argv) > 4 else 50
EXPR = argv[5] if len(argv) > 5 else "smug"
os.makedirs(OUT, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = "BLENDER_EEVEE_NEXT"
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = 1080, 1920, RES
sc.render.fps = 30
sc.frame_start, sc.frame_end = 1, FRAMES
ee = sc.eevee
ee.taa_render_samples = 48
ee.use_shadows = True
ee.use_volumetric_shadows = True
ee.volumetric_tile_size = "4"
ee.volumetric_end = 40
try:
    ee.use_raytracing = True
except AttributeError:
    pass
sc.view_settings.view_transform = "Standard"
sc.view_settings.look = "None"
sc.view_settings.exposure = 0.0


# ---------------- materials ----------------
def _new_mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    m.node_tree.nodes.clear()
    return m


def toon(name, color, shade=0.42, mid=0.78, image=None, alpha=False):
    """two/three-tone cel shading: diffuse light -> Shader to RGB -> constant ramp, multiplied by the albedo (or a texture)"""
    m = _new_mat(name)
    nt, N, L = m.node_tree, m.node_tree.nodes, m.node_tree.links
    out = N.new("ShaderNodeOutputMaterial")
    dif = N.new("ShaderNodeBsdfDiffuse")
    s2r = N.new("ShaderNodeShaderToRGB")
    L.new(dif.outputs[0], s2r.inputs[0])
    ramp = N.new("ShaderNodeValToRGB")
    cr = ramp.color_ramp
    cr.interpolation = "CONSTANT"
    cr.elements[0].position, cr.elements[0].color = 0.0, (shade * 0.92, shade * 0.95, shade * 1.12, 1)   # cool shade
    cr.elements[1].position, cr.elements[1].color = 0.12, (mid, mid * 0.98, mid * 1.02, 1)
    e = cr.elements.new(0.42); e.color = (1.0, 0.98, 0.94, 1)                                              # warm light
    e = cr.elements.new(0.95); e.color = (1.18, 1.14, 1.06, 1)                                             # hot spot
    L.new(s2r.outputs["Color"], ramp.inputs["Fac"])
    mix = N.new("ShaderNodeMixRGB"); mix.blend_type = "MULTIPLY"; mix.inputs["Fac"].default_value = 1.0
    if image:
        tex = N.new("ShaderNodeTexImage"); tex.image = bpy.data.images.load(image); tex.extension = "CLIP"
        L.new(tex.outputs["Color"], mix.inputs["Color1"])
    else:
        mix.inputs["Color1"].default_value = (*color, 1)
    L.new(ramp.outputs["Color"], mix.inputs["Color2"])
    em = N.new("ShaderNodeEmission")
    L.new(mix.outputs["Color"], em.inputs["Color"])
    if alpha and image:
        tr = N.new("ShaderNodeBsdfTransparent"); ms = N.new("ShaderNodeMixShader")
        L.new(tex.outputs["Alpha"], ms.inputs["Fac"]); L.new(tr.outputs[0], ms.inputs[1]); L.new(em.outputs[0], ms.inputs[2])
        L.new(ms.outputs[0], out.inputs["Surface"])
        m.surface_render_method = "DITHERED"
    else:
        L.new(em.outputs[0], out.inputs["Surface"])
    return m


def flat(name, color, strength=1.0):
    m = _new_mat(name)
    N, L = m.node_tree.nodes, m.node_tree.links
    em = N.new("ShaderNodeEmission"); em.inputs["Color"].default_value = (*color, 1); em.inputs["Strength"].default_value = strength
    L.new(em.outputs[0], N.new("ShaderNodeOutputMaterial").inputs["Surface"])
    return m


INK = flat("ink", (0.012, 0.009, 0.014))
INK.use_backface_culling = True
# the ink shell must never cast shadows (it wraps its own object and would put everything in shade):
# transparent to shadow rays, opaque black to the camera
_N, _L = INK.node_tree.nodes, INK.node_tree.links
_lp, _tr, _ms = _N.new("ShaderNodeLightPath"), _N.new("ShaderNodeBsdfTransparent"), _N.new("ShaderNodeMixShader")
_em, _out = next(n for n in _N if n.type == "EMISSION"), next(n for n in _N if n.type == "OUTPUT_MATERIAL")
_L.new(_lp.outputs["Is Shadow Ray"], _ms.inputs["Fac"]); _L.new(_em.outputs[0], _ms.inputs[1]); _L.new(_tr.outputs[0], _ms.inputs[2])
_L.new(_ms.outputs[0], _out.inputs["Surface"])
INK.surface_render_method = "DITHERED"
try:
    INK.use_transparent_shadow = True
except AttributeError:
    pass


def ink(obj, t=0.012):
    """inverted-hull outline: a flipped, slightly fattened shell drawn only from behind = a clean black contour"""
    if obj.type != "MESH":
        return
    obj.data.materials.append(INK)
    md = obj.modifiers.new("ink", "SOLIDIFY")
    md.thickness, md.offset, md.use_flip_normals = t, 1.0, True
    md.material_offset = len(obj.data.materials) - 1
    md.use_rim = False


def smooth(obj):
    for p in obj.data.polygons:
        p.use_smooth = True


def hexc(h):
    h = h.lstrip("#")
    return tuple((int(h[i:i + 2], 16) / 255) ** 2.2 for i in (0, 2, 4))


# ---------------- geometry helpers ----------------
def sphere(name, r, loc, mat, seg=48, ring=24, scale=(1, 1, 1), parent=None, outline=0.012):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=ring, radius=r, location=loc)
    o = bpy.context.object; o.name = name; o.scale = scale
    o.data.materials.append(mat); smooth(o)
    if outline:
        ink(o, outline)
    if parent:
        o.parent = parent
    return o


def tube(name, pts, r, mat, parent=None, outline=0.008):
    cu = bpy.data.curves.new(name, "CURVE"); cu.dimensions = "3D"; cu.bevel_depth = r; cu.bevel_resolution = 4; cu.use_fill_caps = True
    sp = cu.splines.new("BEZIER"); sp.bezier_points.add(len(pts) - 1)
    for bp, p in zip(sp.bezier_points, pts):
        bp.co = p; bp.handle_left_type = bp.handle_right_type = "AUTO"
    o = bpy.data.objects.new(name, cu); bpy.context.collection.objects.link(o)
    o.data.materials.append(mat)
    if parent:
        o.parent = parent
    return o


def box(name, size, loc, mat, outline=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object; o.name = name; o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    o.data.materials.append(mat)
    if outline:
        ink(o, outline)
    return o


# ---------------- the stickman ----------------
def face_decal(name, r, center, png, parent):
    """the front half of a sphere a hair bigger than the head, UV-projected from the front: the 2D face sits ON the 3D head"""
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=64, v_segments=32, radius=r * 1.012)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.y > -r * 0.05], context="VERTS")
    uv = bm.loops.layers.uv.new()
    for f in bm.faces:
        for lp in f.loops:
            co = lp.vert.co
            lp[uv].uv = (0.5 + co.x / (2 * r), 0.5 + co.z / (2 * r))
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(o)
    o.location = center; o.parent = parent
    o.data.materials.append(toon(name + "_m", (1, 1, 1), image=png, alpha=True)); smooth(o)
    return o


def stickman(name, loc, jacket="#2a9d8f", hair="#3a2a1e", expr="smug", yaw=0.0):
    root = bpy.data.objects.new(name, None); bpy.context.collection.objects.link(root)
    root.location = loc; root.rotation_euler = (0, 0, yaw)
    white, black = toon("skin_" + name, hexc("#fbfaf6")), toon("limb_" + name, hexc("#16131a"), shade=0.6, mid=0.85)
    R, HZ = 0.34, 1.6
    head = sphere(name + "_head", R, (0, 0, HZ), white, parent=root, outline=0.016)
    face_decal(name + "_face", R, (0, 0, 0), os.path.join(FACES, f"{expr}.png"), head)
    head.location = (0, 0, HZ)
    # hair: a cap over the top-back of the head
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=24, radius=R * 1.04)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < R * 0.42 - max(0, v.co.y) * 0.9], context="VERTS")
    me = bpy.data.meshes.new(name + "_hair"); bm.to_mesh(me); bm.free()
    hr = bpy.data.objects.new(name + "_hair", me); bpy.context.collection.objects.link(hr); hr.parent = head
    hr.data.materials.append(toon("hair_" + name, hexc(hair))); smooth(hr); ink(hr, 0.014)
    hm = hr.modifiers.new("thick", "SOLIDIFY"); hm.thickness = 0.03; hm.offset = 1
    hr.modifiers.move(len(hr.modifiers) - 1, 0)
    # bean torso
    body = sphere(name + "_body", 0.3, (0, 0, 0.98), toon("jacket_" + name, hexc(jacket)), scale=(1.0, 0.8, 1.45), parent=root, outline=0.014)
    for s in (-1, 1):
        tube(name + f"_leg{s}", [(s * 0.11, 0, 0.62), (s * 0.12, 0, 0.32), (s * 0.12, 0.0, 0.06)], 0.04, black, parent=root)
        sphere(name + f"_foot{s}", 0.075, (s * 0.13, -0.05, 0.04), black, scale=(1, 1.5, 0.6), parent=root, outline=0.008)
        tube(name + f"_arm{s}", [(s * 0.26, 0, 1.28), (s * 0.4, -0.06, 1.05), (s * 0.44, -0.12, 0.82)], 0.035, black, parent=root)
        sphere(name + f"_hand{s}", 0.075, (s * 0.45, -0.13, 0.78), white, parent=root, outline=0.01)
    return root, head


# ---------------- the set: a living room with a window ----------------
wood = toon("floor", hexc("#b07a4a"))
wall_b, wall_s = toon("wallB", hexc("#e4d6c0")), toon("wallS", hexc("#7fa3a0"))
floor = box("floor", (12, 12, 0.1), (0, 2, -0.05), wood)
for k in range(-6, 7):   # plank grooves
    box(f"groove{k}", (0.025, 12, 0.012), (k * 0.6, 2, 0.002), toon("groove", hexc("#7a4f2e")))
D = 4.0   # back wall at y = D, with a window opening x -2.2..0.2, z 1.0..2.7
for nm, size, loc in [("wl", (3.8, 0.25, 3.6), (-4.1, D, 1.8)), ("wr", (5.8, 0.25, 3.6), (3.1, D, 1.8)),
                      ("sill", (2.4, 0.25, 1.0), (-1.0, D, 0.5)), ("head", (2.4, 0.25, 0.9), (-1.0, D, 3.15))]:
    box(nm, size, loc, wall_b)
box("wallL", (0.25, 12, 3.6), (-6.0, 2, 1.8), wall_s)
for x in (-2.2, -1.0, 0.2):   # window frame + mullions
    box(f"mull{x}", (0.08, 0.3, 1.7), (x, D - 0.05, 1.85), toon("frame", hexc("#f4efe6")), outline=0.006)
box("mullH", (2.4, 0.3, 0.08), (-1.0, D - 0.05, 1.85), toon("frame", hexc("#f4efe6")), outline=0.006)
sky = box("sky", (30, 0.1, 20), (0, D + 9, 5), flat("skyM", hexc("#8fc4ec"), 1.4)); sky.visible_shadow = False
for k in range(5):   # far skyline outside the window
    box(f"bld{k}", (1.6, 0.4, 3 + k % 3 * 1.5), (-4 + k * 2.1, D + 7, 1.5 + k % 3 * 0.75), flat("bldM", hexc("#6f8fb8"), 1.0)).visible_shadow = False
# a framed poster + shelf on the back wall
box("poster", (1.0, 0.03, 1.3), (2.4, D - 0.14, 2.0), toon("posterM", hexc("#e2453c")), outline=0.006)


# ---------------- CC0 Kenney furniture (glTF), recoloured to toon + inked ----------------
def kenney(name, h, loc, yaw=0.0):
    path = os.path.join(KITS, "furniture-kit", name + ".glb")
    if not os.path.exists(path):
        return None
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    new = [o for o in bpy.data.objects if o not in before]
    meshes = [o for o in new if o.type == "MESH"]
    if not meshes:
        return None
    mn = min((o.matrix_world @ Vector(c)).z for o in meshes for c in o.bound_box)
    mx = max((o.matrix_world @ Vector(c)).z for o in meshes for c in o.bound_box)
    s = h / max(0.01, mx - mn)
    root = bpy.data.objects.new("k_" + name, None); bpy.context.collection.objects.link(root)
    for o in new:
        if o.parent is None:
            o.parent = root
    for o in meshes:
        for i, ms in enumerate(o.data.materials):
            col = (0.8, 0.8, 0.8)
            if ms and ms.use_nodes:
                b = next((n for n in ms.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
                if b:
                    col = tuple(b.inputs["Base Color"].default_value[:3])
            o.data.materials[i] = toon(f"k_{name}_{i}", col)
        ink(o, 0.01 / s)
    root.scale = (s, s, s); root.location = (loc[0], loc[1], -mn * s); root.rotation_euler = (0, 0, yaw)
    return root


kenney("loungeSofa", 0.95, (2.6, 2.9, 0), math.pi)
kenney("tableCoffee", 0.42, (2.4, 1.6, 0), math.pi)
kenney("lampRoundFloor", 1.9, (-4.6, 3.2, 0))
kenney("pottedPlant", 1.4, (4.8, 3.3, 0))
kenney("rugRounded", 0.03, (0.4, 1.0, 0))
kenney("bookcaseOpen", 2.2, (-5.6, 0.8, 0), -math.pi / 2)

# ---------------- cast ----------------
hero, hero_head = stickman("hero", (0, 0.6, 0), jacket="#2a9d8f", expr=EXPR, yaw=0.15)
# a little life: breathing + a slow head tilt
for f, z, tilt in [(1, 0, 0.0), (FRAMES // 2, 0.015, 0.06), (FRAMES, 0, -0.02)]:
    hero.location.z = z; hero.keyframe_insert("location", index=2, frame=f)
    hero_head.rotation_euler = (0, tilt, 0); hero_head.keyframe_insert("rotation_euler", frame=f)

# ---------------- light ----------------
w = sc.world = bpy.data.worlds.new("world"); w.use_nodes = True
bg = w.node_tree.nodes["Background"]; bg.inputs["Color"].default_value = (0.05, 0.06, 0.1, 1); bg.inputs["Strength"].default_value = 1.0
# light shafts: thin haze ONLY inside the room (a world-wide volume would swallow the sun before it arrives)
hz = _new_mat("haze"); _hv = hz.node_tree.nodes.new("ShaderNodeVolumePrincipled"); _hv.inputs["Density"].default_value = 0.05
_hv.inputs["Anisotropy"].default_value = 0.55; hz.node_tree.links.new(_hv.outputs[0], hz.node_tree.nodes.new("ShaderNodeOutputMaterial").inputs["Volume"])
haze = box("haze", (11.8, 9.0, 3.6), (0, -0.4, 1.8), hz); haze.visible_shadow = False
sun = bpy.data.lights.new("sun", "SUN"); sun.energy = 6.0; sun.angle = math.radians(0.6); sun.color = (1.0, 0.9, 0.75)
so = bpy.data.objects.new("sun", sun); bpy.context.collection.objects.link(so)
so.rotation_euler = (math.radians(42), 0, math.radians(-42))   # high, from camera-left: lit face, long shadow behind   # from behind the window, high: shafts onto the floor and the hero
lamp = bpy.data.lights.new("lamp", "POINT"); lamp.energy = 160; lamp.color = (1.0, 0.72, 0.42); lamp.shadow_soft_size = 0.15
lo = bpy.data.objects.new("lamp", lamp); lo.location = (-4.6, 3.2, 1.75); bpy.context.collection.objects.link(lo)
fill = bpy.data.lights.new("fill", "AREA"); fill.energy = 120; fill.size = 4; fill.color = (0.75, 0.82, 1.0)
fo = bpy.data.objects.new("fill", fill); fo.location = (1.5, -4.5, 3.0); fo.rotation_euler = (math.radians(60), 0, math.radians(15)); bpy.context.collection.objects.link(fo)

# ---------------- camera: a slow travelling push-in with depth of field ----------------
target = bpy.data.objects.new("aim", None); bpy.context.collection.objects.link(target); target.location = (0, 0.6, 1.35)
cam = bpy.data.cameras.new("cam"); cam.lens = 32; cam.dof.use_dof = True; cam.dof.focus_object = hero_head; cam.dof.aperture_fstop = 2.2
co = bpy.data.objects.new("cam", cam); bpy.context.collection.objects.link(co); sc.camera = co
tc = co.constraints.new("TRACK_TO"); tc.target = target; tc.track_axis = "TRACK_NEGATIVE_Z"; tc.up_axis = "UP_Y"
for f, p in [(1, (1.4, -5.6, 1.9)), (FRAMES, (0.5, -3.3, 1.6))]:
    co.location = p; co.keyframe_insert("location", frame=f)
for fc in (co.animation_data.action.fcurves if co.animation_data and co.animation_data.action else []):
    for kp in fc.keyframe_points:
        kp.interpolation = "BEZIER"; kp.easing = "EASE_IN_OUT"

# ---------------- compositor: bloom + vignette ----------------
sc.use_nodes = True
nt = sc.node_tree; nt.nodes.clear()
rl = nt.nodes.new("CompositorNodeRLayers")
gl = nt.nodes.new("CompositorNodeGlare"); gl.glare_type = "FOG_GLOW"; gl.threshold = 0.9; gl.size = 7
try:
    gl.mix = -0.6
except AttributeError:
    pass
el = nt.nodes.new("CompositorNodeEllipseMask"); el.width, el.height = 0.95, 0.75
bl = nt.nodes.new("CompositorNodeBlur"); bl.size_x = bl.size_y = 240; bl.filter_type = "GAUSS"
mx = nt.nodes.new("CompositorNodeMixRGB"); mx.blend_type = "MULTIPLY"
mp = nt.nodes.new("CompositorNodeMapRange"); mp.inputs[3].default_value = 0.55; mp.inputs[4].default_value = 1.0
comp = nt.nodes.new("CompositorNodeComposite")
nt.links.new(rl.outputs["Image"], gl.inputs["Image"])
nt.links.new(el.outputs["Mask"], bl.inputs["Image"])
nt.links.new(bl.outputs["Image"], mp.inputs[0])
nt.links.new(gl.outputs["Image"], mx.inputs[1]); nt.links.new(mp.outputs[0], mx.inputs[2])
nt.links.new(mx.outputs["Image"], comp.inputs["Image"])

sc.render.image_settings.file_format = "PNG"
sc.render.filepath = os.path.join(OUT, "f_")
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "proto.blend"))
bpy.ops.render.render(animation=True)
print("DONE")
