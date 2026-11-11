"""Blender sets (runs inside Blender): rooms built from boxes + CC0 Kenney models recoloured to toon and inked,
with their light rig (hard sun from camera-left, warm practicals, cool fill, haze inside the room only)."""
from __future__ import annotations

import math
import os

import bpy
from mathutils import Vector

from . import look as L


def box(name, size, loc, mat, outline=0.0, shadow=True):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object
    o.name = name
    o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    o.data.materials.append(mat)
    o.visible_shadow = shadow
    if outline:
        L.ink(o, outline)
    return o


def kenney(kits, kit, name, h, loc, yaw=0.0):
    """import a Kenney glTF, fit its height, recolour every material to toon (keeping its colour) and ink it"""
    path = os.path.join(kits, kit, name + ".glb")
    if not os.path.exists(path):
        return None
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    new = [o for o in bpy.data.objects if o not in before]
    meshes = [o for o in new if o.type == "MESH"]
    if not meshes:
        return None
    zs = [(o.matrix_world @ Vector(c)).z for o in meshes for c in o.bound_box]
    mn, mx = min(zs), max(zs)
    s = h / max(0.01, mx - mn)
    root = bpy.data.objects.new("k_" + name, None)
    bpy.context.collection.objects.link(root)
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
            o.data.materials[i] = L.toon(f"k_{name}_{i}", col)
        L.ink(o, 0.01 / s)
    root.scale = (s, s, s)
    root.location = (loc[0], loc[1], -mn * s)
    root.rotation_euler = (0, 0, yaw)
    return root


def living_room(kits, night=False):
    wood = L.toon("floor", L.hexc("#b07a4a"))
    wall_b, wall_s = L.toon("wallB", L.hexc("#e4d6c0")), L.toon("wallS", L.hexc("#7fa3a0"))
    box("floor", (12, 12, 0.1), (0, 2, -0.05), wood)
    groove = L.toon("groove", L.hexc("#7a4f2e"))
    for k in range(-6, 7):
        box(f"groove{k}", (0.025, 12, 0.012), (k * 0.6, 2, 0.002), groove)
    D = 4.0
    for nm, size, loc in [("wl", (3.8, 0.25, 3.6), (-4.1, D, 1.8)), ("wr", (5.8, 0.25, 3.6), (3.1, D, 1.8)),
                          ("sill", (2.4, 0.25, 1.0), (-1.0, D, 0.5)), ("head", (2.4, 0.25, 0.9), (-1.0, D, 3.15))]:
        box(nm, size, loc, wall_b)
    box("wallL", (0.25, 12, 3.6), (-6.0, 2, 1.8), wall_s)
    frame = L.toon("frame", L.hexc("#f4efe6"))
    for x in (-2.2, -1.0, 0.2):
        box(f"mull{x}", (0.08, 0.3, 1.7), (x, D - 0.05, 1.85), frame, outline=0.006)
    box("mullH", (2.4, 0.3, 0.08), (-1.0, D - 0.05, 1.85), frame, outline=0.006)
    box("sky", (30, 0.1, 20), (0, D + 9, 5), L.flat("skyM", L.hexc("#22305a" if night else "#8fc4ec"), 1.4), shadow=False)
    for k in range(5):
        box(f"bld{k}", (1.6, 0.4, 3 + k % 3 * 1.5), (-4 + k * 2.1, D + 7, 1.5 + k % 3 * 0.75), L.flat("bldM", L.hexc("#6f8fb8"), 1.0), shadow=False)
    box("poster", (1.0, 0.03, 1.3), (2.4, D - 0.14, 2.0), L.toon("posterM", L.hexc("#e2453c")), outline=0.006)
    kenney(kits, "furniture-kit", "loungeSofa", 0.95, (2.8, 3.0, 0), math.pi)
    kenney(kits, "furniture-kit", "tableCoffee", 0.42, (2.6, 1.8, 0), math.pi)
    kenney(kits, "furniture-kit", "lampRoundFloor", 1.9, (-4.6, 3.2, 0))
    kenney(kits, "furniture-kit", "pottedPlant", 1.4, (4.8, 3.3, 0))
    kenney(kits, "furniture-kit", "rugRounded", 0.03, (0.2, 1.0, 0))
    kenney(kits, "furniture-kit", "bookcaseOpen", 2.2, (-5.6, 0.8, 0), -math.pi / 2)
    # light
    w = bpy.context.scene.world = bpy.data.worlds.new("world")
    w.use_nodes = True
    bg = w.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (0.05, 0.06, 0.1, 1)
    hz = L._new_mat("haze")
    hv = hz.node_tree.nodes.new("ShaderNodeVolumePrincipled"); hv.inputs["Density"].default_value = 0.05; hv.inputs["Anisotropy"].default_value = 0.55
    hz.node_tree.links.new(hv.outputs[0], hz.node_tree.nodes.new("ShaderNodeOutputMaterial").inputs["Volume"])
    box("haze", (11.8, 9.0, 3.6), (0, -0.4, 1.8), hz, shadow=False)
    sun = bpy.data.lights.new("sun", "SUN"); sun.energy = 1.5 if night else 6.0; sun.angle = math.radians(0.6)
    sun.color = (0.6, 0.7, 1.0) if night else (1.0, 0.9, 0.75)
    so = bpy.data.objects.new("sun", sun); bpy.context.collection.objects.link(so)
    so.rotation_euler = (math.radians(42), 0, math.radians(-42))
    lamp = bpy.data.lights.new("lamp", "POINT"); lamp.energy = 400 if night else 160; lamp.color = (1.0, 0.72, 0.42); lamp.shadow_soft_size = 0.15
    lo = bpy.data.objects.new("lamp", lamp); lo.location = (-4.6, 3.2, 1.75); bpy.context.collection.objects.link(lo)
    fill = bpy.data.lights.new("fill", "AREA"); fill.energy = 120; fill.size = 4; fill.color = (0.75, 0.82, 1.0)
    fo = bpy.data.objects.new("fill", fill); fo.location = (1.5, -4.5, 3.0); fo.rotation_euler = (math.radians(60), 0, math.radians(15))
    bpy.context.collection.objects.link(fo)
