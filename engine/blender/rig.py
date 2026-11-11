"""Blender stickman rig + procedural acting (runs inside Blender).
A character is a hierarchy of joint empties (root > hips > torso > neck/head, shoulders > elbows > hands,
hips > knees > feet) holding toon + ink segments, plus a set of face decals (expression, blink, 3 talking mouths)
switched per frame. `act()` keys every frame of a segment from an action name, so any timeline from the director can
be played: stand, walk, run, point, wave, shrug, cheer, panic, hips, sit (floor), sitchair, talk gestures, fall."""
from __future__ import annotations

import math
import os

import bmesh
import bpy

from . import look as L   # materials / ink helpers shared with the set builder

TAU = math.tau


def _empty(name, parent, loc, rot=(0, 0, 0)):
    e = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(e)
    e.empty_display_size = 0.05
    e.parent = parent
    e.location = loc
    e.rotation_mode = "XYZ"
    e.rotation_euler = rot
    return e


def _seg(name, parent, length, r, mat, ink=0.008):
    """a rounded limb segment hanging from its joint along -Z (capsule: cylinder + end spheres)"""
    bm = bmesh.new()   # one clean capsule surface: a UV sphere split at its equator and stretched apart
    bmesh.ops.create_uvsphere(bm, u_segments=20, v_segments=12, radius=r)
    for v in bm.verts:
        v.co.z += (0.0 if v.co.z >= -1e-6 else -length)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    o.parent = parent
    o.data.materials.append(mat)
    L.smooth(o)
    L.ink(o, ink)
    return o


def _sphere(name, parent, r, loc, mat, scale=(1, 1, 1), ink=0.012):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=40, v_segments=20, radius=r)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    o.parent = parent
    o.location = loc
    o.scale = scale
    o.data.materials.append(mat)
    L.smooth(o)
    if ink:
        L.ink(o, ink)
    return o


def _decal(name, parent, r, png):
    """front half of a sphere a hair bigger than the head, UV-projected from the front: the 2D face on the 3D head"""
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=64, v_segments=32, radius=r * 1.012)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.y > -r * 0.05], context="VERTS")
    uv = bm.loops.layers.uv.new()
    for f in bm.faces:
        for lp in f.loops:
            co = lp.vert.co
            lp[uv].uv = (0.5 + co.x / (2 * r), 0.5 + co.z / (2 * r))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    o.parent = parent
    o.data.materials.append(L.toon(name + "_m", (1, 1, 1), image=png, alpha=True))
    L.smooth(o)
    return o


class Stickman:
    R = 0.33            # head radius (the head is wider than the torso and sits on top of it, overlapping ~0.1 m)
    UPPER, LOWER = 0.27, 0.25
    THIGH, SHIN = 0.30, 0.29

    def __init__(self, name, faces_dir, loc=(0, 0, 0), yaw=0.0, jacket="#2a9d8f", hair="#3a2a1e", exprs=("neutral",), pants="#16131a"):
        self.name, self.faces = name, faces_dir
        white = L.toon("skin_" + name, L.hexc("#fbfaf6"))
        black = L.toon("limb_" + name, L.hexc(pants), shade=0.6, mid=0.85)
        self.root = _empty(name, None, loc, (0, 0, yaw))
        self.hips = _empty(name + "_hips", self.root, (0, 0, 0.62))
        self.torso = _empty(name + "_torso", self.hips, (0, 0, 0.0))
        # torso: a narrow upright pill (rounded rectangle from the side), much slimmer than the head
        body = _seg(name + "_body", self.torso, 0.34, 0.2, L.toon("jacket_" + name, L.hexc(jacket)), ink=0.014)
        body.location = (0, 0, 0.55); body.scale = (1.0, 0.82, 1.0)
        self.neck = _empty(name + "_neck", self.torso, (0, 0, 0.78))
        self.head = _empty(name + "_head", self.neck, (0, 0, 0.22))
        _sphere(name + "_skull", self.head, self.R, (0, 0, 0), white, ink=0.016)
        # hair cap
        bm = bmesh.new()   # a clean cap: the sphere cut by a plane tilted down toward the back (no stair-stepped edge)
        bmesh.ops.create_uvsphere(bm, u_segments=64, v_segments=32, radius=self.R * 1.04)
        from mathutils import Vector as _V
        nrm = _V((0, 0.55, 1.0)).normalized()
        bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, 0, self.R * 0.38), plane_no=nrm, clear_inner=True)
        me = bpy.data.meshes.new(name + "_hair"); bm.to_mesh(me); bm.free()
        hr = bpy.data.objects.new(name + "_hair", me); bpy.context.collection.objects.link(hr); hr.parent = self.head
        hr.data.materials.append(L.toon("hair_" + name, L.hexc(hair))); L.smooth(hr)
        sm = hr.modifiers.new("thick", "SOLIDIFY"); sm.thickness = 0.03; sm.offset = 1
        L.ink(hr, 0.014)
        # faces: per expression the resting face, a blink and three talking mouths; only one visible per frame
        self.decals = {}
        for e in exprs:
            for v in ("", "_blink", "_talk0", "_talk1", "_talk2"):
                key = e + v
                self.decals[key] = _decal(f"{name}_f_{key}", self.head, self.R, os.path.join(faces_dir, key + ".png"))
        # arms / legs
        self.sh, self.el, self.hp, self.kn = {}, {}, {}, {}
        for s in (-1, 1):
            self.sh[s] = _empty(f"{name}_sh{s}", self.torso, (s * 0.17, 0, 0.58))
            _seg(f"{name}_up{s}", self.sh[s], self.UPPER, 0.019, black, ink=0.006)
            self.el[s] = _empty(f"{name}_el{s}", self.sh[s], (0, 0, -self.UPPER))
            _seg(f"{name}_lo{s}", self.el[s], self.LOWER, 0.018, black, ink=0.006)
            _sphere(f"{name}_hand{s}", self.el[s], 0.052, (0, 0, -self.LOWER - 0.03), white, ink=0.008)
            self.hp[s] = _empty(f"{name}_hp{s}", self.hips, (s * 0.085, 0, 0.04))
            _seg(f"{name}_th{s}", self.hp[s], self.THIGH, 0.022, black, ink=0.006)
            self.kn[s] = _empty(f"{name}_kn{s}", self.hp[s], (0, 0, -self.THIGH))
            _seg(f"{name}_sn{s}", self.kn[s], self.SHIN, 0.021, black, ink=0.006)
            _sphere(f"{name}_foot{s}", self.kn[s], 0.058, (0, -0.045, -self.SHIN - 0.015), black, scale=(1, 1.6, 0.55), ink=0.006)
        self.pos, self.yaw = list(loc), yaw
        self.white = white

    def hold(self, kits, item):
        """put a small prop in the right hand (CC0 Kenney model when there is one, else a coloured token)"""
        from . import sets
        KM = {"pizza": ("food-kit", "pizza", 0.06), "coffee": ("food-kit", "cup-coffee", 0.16), "can": ("food-kit", "soda-can", 0.16),
              "cake": ("food-kit", "cake", 0.2), "bread": ("food-kit", "loaf", 0.12), "croissant": ("food-kit", "croissant", 0.1),
              "fish": ("food-kit", "fish", 0.1), "plate": ("food-kit", "plate", 0.04), "fryingpan": ("food-kit", "frying-pan", 0.08),
              "box": ("furniture-kit", "cardboardBoxClosed", 0.25), "book": ("furniture-kit", "books", 0.12), "phone": None, "chocolate": ("food-kit", "chocolate", 0.05),
              "egg": ("food-kit", "egg", 0.08), "popcorn": ("food-kit", "fries", 0.18)}
        spec = KM.get(item)
        hand = self.el[1]
        o = None
        if item in ("phone", "controller", "note", "card", "cash"):   # modelled props: read at a glance in a 9:16 frame
            root = bpy.data.objects.new(f"{self.name}_hold", None); bpy.context.collection.objects.link(root)
            dark = L.toon("propDark", L.hexc("#1d1b22"))
            if item == "phone":
                b = sets.box(f"{self.name}_ph", (0.085, 0.012, 0.16), (0, 0, 0), dark, outline=0.004)
                s = sets.box(f"{self.name}_phs", (0.07, 0.004, 0.13), (0, -0.008, 0.004), L.flat("phoneScr", (0.35, 0.65, 1.0), 1.6), shadow=False)
                parts = [b, s]
            elif item == "controller":
                b = sets.box(f"{self.name}_ct", (0.18, 0.05, 0.07), (0, 0, 0), dark, outline=0.004)
                parts = [b]
                for sx in (-1, 1):
                    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.045, location=(sx * 0.08, 0, -0.03)); g = bpy.context.object
                    g.data.materials.append(dark); L.ink(g, 0.004); parts.append(g)
                for sx, col in ((0.05, (2.0, 0.3, 0.3)), (0.075, (0.3, 2.0, 0.4))):
                    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.012, location=(sx, -0.027, 0.012)); g = bpy.context.object
                    g.data.materials.append(L.flat(f"btn{col}", col, 1.5)); parts.append(g)
            elif item == "note":
                parts = [sets.box(f"{self.name}_nt", (0.12, 0.004, 0.12), (0, 0, 0), L.toon("noteY", L.hexc("#ffe14d")), outline=0.003)]
            elif item == "card":
                parts = [sets.box(f"{self.name}_cd", (0.13, 0.004, 0.085), (0, 0, 0), L.toon("cardB", L.hexc("#3f6fb5")), outline=0.003)]
            else:
                parts = [sets.box(f"{self.name}_cs", (0.15, 0.03, 0.07), (0, 0, 0), L.toon("cashG", L.hexc("#5fae5a")), outline=0.004)]
            for p_ in parts:
                p_.parent = root
            o = root
        elif spec:
            o = sets.kenney(kits, spec[0], spec[1], spec[2] * 1.4, (0, 0, 0))
        if o is None:
            col = {"phone": "#1d1b22", "card": "#3f6fb5", "note": "#ffe14d", "cash": "#5fae5a", "coins": "#e8b83a", "goldcoin": "#e8b83a",
                   "key": "#c9a227", "controller": "#2b2b38", "usb": "#e8b83a", "suitcase": "#7a4f33", "magnifier": "#c9ccd2"}.get(item, "#e2453c")
            o = sets.box(f"{self.name}_hold", (0.12, 0.05, 0.16), (0, 0, 0), L.toon("hold_" + item, L.hexc(col)), outline=0.006)
        o.parent = hand
        o.location = (0, -0.03, -self.LOWER - 0.09)
        return o

    # ---------------- keying ----------------
    def _rot(self, o, f, x=0.0, y=0.0, z=0.0):
        o.rotation_euler = (x, y, z)
        o.keyframe_insert("rotation_euler", frame=f)

    def face_at(self, f, key):
        """show one face decal from frame f on (keys only the decals whose visibility changes; all of them the first time)"""
        if getattr(self, "_face", None) == key:
            return
        first = getattr(self, "_face", None) is None
        for k, o in self.decals.items():
            on = k == key
            if first or k in (key, self._face):
                o.hide_render = not on
                o.hide_viewport = not on
                o.keyframe_insert("hide_render", frame=f)
                o.keyframe_insert("hide_viewport", frame=f)
        self._face = key

    def pose(self, f, arms, legs=None, hips_z=0.62, lean=0.0, head=(0.0, 0.0, 0.0), root=None, yaw=None, twist=0.0):
        """arms: {side: (pitch_fwd, abduct, elbow)}; legs: {side: (thigh_fwd, knee)}; angles in radians"""
        for s, (pitch, abd, elb) in arms.items():
            self._rot(self.sh[s], f, -pitch, -s * abd, 0)
            self._rot(self.el[s], f, -elb, 0, 0)
        for s, (th, kn) in (legs or {-1: (0, 0), 1: (0, 0)}).items():
            self._rot(self.hp[s], f, -th, 0, 0)
            self._rot(self.kn[s], f, kn, 0, 0)
        self.hips.location.z = hips_z
        self.hips.keyframe_insert("location", index=2, frame=f)
        self._rot(self.torso, f, -lean, 0, twist)
        self._rot(self.head, f, *head)
        if root is not None:
            self.root.location = root
            self.root.keyframe_insert("location", frame=f)
        if yaw is not None:
            self.root.rotation_euler = (0, 0, yaw)
            self.root.keyframe_insert("rotation_euler", frame=f)

    # ---------------- acting ----------------
    def act(self, a: int, b: int, action: str, expr="neutral", talk=(), walk_to=None, seed=0.0, face=None):
        """key frames a..b-1 of one action; talk = [(f0, f1)] spans where the mouth flaps; walk_to = (x, y) destination;
        face = (x, y) a point to turn toward over the first 8 frames (the camera, a partner, the thing pointed at)"""
        start = list(self.pos)
        n = max(1, b - a)
        if walk_to:
            dx, dy = walk_to[0] - start[0], walk_to[1] - start[1]
            heading = math.atan2(-dx, dy) + math.pi if (dx or dy) else self.yaw
        y0 = self.yaw
        y1 = y0
        if face and not walk_to:
            y1 = math.atan2(face[0] - start[0], -(face[1] - start[1]))
            y1 = y0 + (y1 - y0 + math.pi) % TAU - math.pi        # shortest way round
        for f in range(a, b):
            t = (f - a) / 30.0
            u = (f - a) / n
            br = 0.012 * math.sin(TAU * 0.4 * t + seed)                        # breathing
            sway = 0.035 * math.sin(TAU * 0.23 * t + seed)
            idle_arms = {-1: (0.05 + 0.03 * math.sin(TAU * 0.4 * t + seed), 0.18, 0.15), 1: (0.05 + 0.03 * math.sin(TAU * 0.4 * t + 1 + seed), 0.18, 0.15)}
            talking = any(t0 <= f < t1 for t0, t1 in talk)
            nod = (0.06 * math.sin(TAU * 1.6 * t) if talking else 0.0)
            head = (nod, sway * 0.6, 0.08 * math.sin(TAU * 0.17 * t + seed))
            root = None
            yaw = None
            if y1 != y0:   # turn toward the face point (smoothstep over 8 frames), then hold
                k = min(1.0, (f - a) / 8.0)
                self.root.rotation_euler = (0, 0, y0 + (y1 - y0) * k * k * (3 - 2 * k))
                self.root.keyframe_insert("rotation_euler", frame=f)
            if action in ("walk", "run") and walk_to:
                fast = action == "run"
                cyc = TAU * (2.2 if fast else 1.5) * t
                sw = (0.75 if fast else 0.5) * math.sin(cyc)
                legs = {1: (sw, 0.25 + max(0, -math.sin(cyc)) * (1.2 if fast else 0.8)), -1: (-sw, 0.25 + max(0, math.sin(cyc)) * (1.2 if fast else 0.8))}
                arms = {1: (-sw * 0.9, 0.15, 0.4 + (0.9 if fast else 0.2)), -1: (sw * 0.9, 0.15, 0.4 + (0.9 if fast else 0.2))}
                k = 0.5 - 0.5 * math.cos(math.pi * min(1.0, u * 1.0))
                root = (start[0] + dx * k, start[1] + dy * k, 0.0)
                yaw = heading
                hz = 0.62 + (0.05 if fast else 0.03) * abs(math.cos(cyc)) - 0.02
                self.pose(f, arms, legs, hz, lean=0.25 if fast else 0.06, head=head, root=root, yaw=yaw)
            elif action == "wave":
                wv = 0.55 * math.sin(TAU * 1.8 * t)
                arms = {1: (0.5, 2.5, 0.9 + wv), -1: idle_arms[-1]}
                self.pose(f, arms, hips_z=0.62 + br, head=(head[0], head[1] - 0.1, head[2]))
            elif action == "point":
                arms = {1: (1.45, 0.25, 0.05), -1: idle_arms[-1]}
                self.pose(f, arms, hips_z=0.62 + br, lean=-0.04, head=head)
            elif action == "shrug":
                k = min(1.0, (f - a) / 8.0)
                arms = {s: (0.35 * k, 0.9 * k, 1.6 * k) for s in (-1, 1)}
                self.pose(f, arms, hips_z=0.62 + br + 0.02 * k, head=(0, 0.18 * k, 0))
            elif action == "cheer":
                pump = 0.25 * math.sin(TAU * 2.0 * t)
                arms = {s: (0.3, 2.6 + pump, 0.2) for s in (-1, 1)}
                self.pose(f, arms, hips_z=0.62 + abs(0.05 * math.sin(TAU * 2.0 * t)), head=(-0.15, 0, 0))
            elif action == "panic":
                arms = {s: (1.2 + 0.6 * math.sin(TAU * 3 * t + s), 1.0 + 0.4 * math.sin(TAU * 2.6 * t), 0.8) for s in (-1, 1)}
                self.pose(f, arms, hips_z=0.62 + abs(0.03 * math.sin(TAU * 4 * t)), head=(0.1 * math.sin(TAU * 3 * t), 0.2 * math.sin(TAU * 2 * t), 0))
            elif action == "hips":
                arms = {s: (0.25, 0.75, 2.0) for s in (-1, 1)}
                self.pose(f, arms, hips_z=0.62 + br, lean=-0.05, head=head)
            elif action == "sitchair":   # thighs forward, shins down: seat at ~0.46 m
                arms = {s: (0.6, 0.15, 0.6) for s in (-1, 1)}
                self.pose(f, arms, {-1: (1.5, 1.5), 1: (1.5, 1.5)}, hips_z=0.47 + br * 0.5, lean=-0.05, head=head)
            elif action == "fall":
                k = min(1.0, (f - a) / 10.0)
                arms = {s: (2.0 * k, 1.2 * k, 0.3) for s in (-1, 1)}
                self.pose(f, arms, {-1: (0.3 * k, 0.4 * k), 1: (0.6 * k, 0.2 * k)}, hips_z=0.62 - 0.45 * k, lean=-1.3 * k, head=(0.2 * k, 0, 0))
            else:   # stand (+ talk gestures)
                arms = dict(idle_arms)
                if talking:   # open-hand beat gestures while speaking
                    g = max(0.0, math.sin(TAU * 0.9 * t + seed))
                    arms[1] = (0.6 + 0.5 * g, 0.3, 1.1 + 0.4 * g)
                self.pose(f, arms, hips_z=0.62 + br, head=head, twist=sway * 0.5)
            # face: talking mouth flap every 3 frames, a blink every ~3.3 s
            if talking:
                key = f"{expr}_talk{((f // 3) + int(seed * 7)) % 3}"
            elif (f + int(seed * 37)) % 100 in (0, 1, 2):
                key = f"{expr}_blink"
            else:
                key = expr
            self.face_at(f, key if key in self.decals else expr)
        if walk_to:
            self.pos = [walk_to[0], walk_to[1], 0.0]
            self.yaw = heading
        else:
            self.yaw = y1
