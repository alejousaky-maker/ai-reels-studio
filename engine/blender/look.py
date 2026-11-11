"""Shared look for the Blender path (runs inside Blender): toon materials (diffuse -> Shader to RGB -> constant ramp x
albedo, so sun shadows land as hard cel bands), an inverted-hull ink outline that never casts shadows, flat emissive
materials, render / compositor setup (EEVEE, bloom, vignette)."""
from __future__ import annotations

import bpy

_cache: dict = {}


def hexc(h: str):
    h = h.lstrip("#")
    return tuple((int(h[i:i + 2], 16) / 255) ** 2.2 for i in (0, 2, 4))


def _new_mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    m.node_tree.nodes.clear()
    return m


def toon(name, color, shade=0.42, mid=0.78, image=None, alpha=False):
    key = (name, tuple(color), shade, mid, image if not hasattr(image, "name") else "img:" + image.name, alpha)
    if key in _cache:
        return _cache[key]
    m = _new_mat(name)
    N, Lk = m.node_tree.nodes, m.node_tree.links
    out = N.new("ShaderNodeOutputMaterial")
    dif = N.new("ShaderNodeBsdfDiffuse")
    s2r = N.new("ShaderNodeShaderToRGB")
    Lk.new(dif.outputs[0], s2r.inputs[0])
    ramp = N.new("ShaderNodeValToRGB")
    cr = ramp.color_ramp
    cr.interpolation = "CONSTANT"
    cr.elements[0].position, cr.elements[0].color = 0.0, (shade * 0.92, shade * 0.95, shade * 1.12, 1)
    cr.elements[1].position, cr.elements[1].color = 0.12, (mid, mid * 0.98, mid * 1.02, 1)
    e = cr.elements.new(0.42); e.color = (1.0, 0.98, 0.94, 1)
    e = cr.elements.new(0.95); e.color = (1.18, 1.14, 1.06, 1)
    Lk.new(s2r.outputs["Color"], ramp.inputs["Fac"])
    mix = N.new("ShaderNodeMixRGB"); mix.blend_type = "MULTIPLY"; mix.inputs["Fac"].default_value = 1.0
    tex = None
    if image:
        tex = N.new("ShaderNodeTexImage")
        tex.image = image if isinstance(image, bpy.types.Image) else bpy.data.images.load(image, check_existing=True)
        tex.extension = "CLIP" if alpha else "REPEAT"
        Lk.new(tex.outputs["Color"], mix.inputs["Color1"])
    else:
        mix.inputs["Color1"].default_value = (*color, 1)
    Lk.new(ramp.outputs["Color"], mix.inputs["Color2"])
    em = N.new("ShaderNodeEmission")
    Lk.new(mix.outputs["Color"], em.inputs["Color"])
    if alpha and tex:
        tr = N.new("ShaderNodeBsdfTransparent"); ms = N.new("ShaderNodeMixShader")
        Lk.new(tex.outputs["Alpha"], ms.inputs["Fac"]); Lk.new(tr.outputs[0], ms.inputs[1]); Lk.new(em.outputs[0], ms.inputs[2])
        Lk.new(ms.outputs[0], out.inputs["Surface"])
        m.surface_render_method = "DITHERED"
        try:
            m.use_transparent_shadow = True
        except AttributeError:
            pass
    else:
        Lk.new(em.outputs[0], out.inputs["Surface"])
    _cache[key] = m
    return m


def flat(name, color, strength=1.0):
    m = _new_mat(name)
    N, Lk = m.node_tree.nodes, m.node_tree.links
    em = N.new("ShaderNodeEmission"); em.inputs["Color"].default_value = (*color, 1); em.inputs["Strength"].default_value = strength
    Lk.new(em.outputs[0], N.new("ShaderNodeOutputMaterial").inputs["Surface"])
    return m


_ink = None


def ink_mat():
    """black, back-faces only (inverted hull) and transparent to shadow rays (it wraps its own object)"""
    global _ink
    if _ink and _ink.name in bpy.data.materials:
        return _ink
    m = flat("ink", (0.012, 0.009, 0.014))
    m.use_backface_culling = True
    N, Lk = m.node_tree.nodes, m.node_tree.links
    lp, tr, ms = N.new("ShaderNodeLightPath"), N.new("ShaderNodeBsdfTransparent"), N.new("ShaderNodeMixShader")
    em, out = next(n for n in N if n.type == "EMISSION"), next(n for n in N if n.type == "OUTPUT_MATERIAL")
    Lk.new(lp.outputs["Is Shadow Ray"], ms.inputs["Fac"]); Lk.new(em.outputs[0], ms.inputs[1]); Lk.new(tr.outputs[0], ms.inputs[2])
    Lk.new(ms.outputs[0], out.inputs["Surface"])
    m.surface_render_method = "DITHERED"
    try:
        m.use_transparent_shadow = True
    except AttributeError:
        pass
    _ink = m
    return m


def ink(obj, t=0.012):
    if obj.type != "MESH":
        return
    obj.data.materials.append(ink_mat())
    md = obj.modifiers.new("ink", "SOLIDIFY")
    md.thickness, md.offset, md.use_flip_normals, md.use_rim = t, 1.0, True, False
    md.material_offset = len(obj.data.materials) - 1


def smooth(obj):
    for p in obj.data.polygons:
        p.use_smooth = True


def setup_render(scene, frames, res=100, samples=48):
    scene.render.engine = "BLENDER_EEVEE_NEXT"
    scene.render.resolution_x, scene.render.resolution_y, scene.render.resolution_percentage = 1080, 1920, res
    scene.render.fps = 30
    scene.frame_start, scene.frame_end = 1, frames
    ee = scene.eevee
    ee.taa_render_samples = samples
    ee.use_shadows = True
    ee.use_volumetric_shadows = True
    ee.volumetric_tile_size = "4"
    ee.volumetric_end = 40
    try:
        ee.use_raytracing = True
    except AttributeError:
        pass
    scene.view_settings.view_transform = "Standard"
    scene.view_settings.look = "None"


def compositor(scene, bloom=0.9, vignette=0.55):
    scene.use_nodes = True
    nt = scene.node_tree
    nt.nodes.clear()
    rl = nt.nodes.new("CompositorNodeRLayers")
    gl = nt.nodes.new("CompositorNodeGlare"); gl.glare_type = "FOG_GLOW"; gl.threshold = bloom; gl.size = 7
    el = nt.nodes.new("CompositorNodeEllipseMask"); el.width, el.height = 0.95, 0.75
    bl = nt.nodes.new("CompositorNodeBlur"); bl.size_x = bl.size_y = 240; bl.filter_type = "GAUSS"
    mx = nt.nodes.new("CompositorNodeMixRGB"); mx.blend_type = "MULTIPLY"
    mp = nt.nodes.new("CompositorNodeMapRange"); mp.inputs[3].default_value = vignette; mp.inputs[4].default_value = 1.0
    comp = nt.nodes.new("CompositorNodeComposite")
    nt.links.new(rl.outputs["Image"], gl.inputs["Image"])
    nt.links.new(el.outputs["Mask"], bl.inputs["Image"])
    nt.links.new(bl.outputs["Image"], mp.inputs[0])
    nt.links.new(gl.outputs["Image"], mx.inputs[1]); nt.links.new(mp.outputs[0], mx.inputs[2])
    nt.links.new(mx.outputs["Image"], comp.inputs["Image"])
