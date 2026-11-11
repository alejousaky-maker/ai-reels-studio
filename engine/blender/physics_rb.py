"""Rigid-body physics on Blender's Bullet solver (runs INSIDE Blender) + a library of reusable animation presets.

Bodies   add_body(): ACTIVE / PASSIVE, collision shape (BOX, SPHERE, CAPSULE, CYLINDER, CONVEX_HULL; MESH only for
         passive surfaces), mass, friction, restitution (bounciness), linear / angular damping (rolling resistance).
Impulses Bullet takes no initial velocity, so an impulse is a short KINEMATIC (animated) push that hands its velocity
         to the solver when the body is released: impulse(), used by throws, explosions, dominoes, rolls.
Bake     simulate() steps the world frame by frame, records every dynamic body's transform, then removes the rigid
         bodies and writes plain keyframes: the motion is final, deterministic and can be edited / extended.
Post     return_to_origin() / loop() are ANIMATED recoveries appended after the simulated part (a real simulation is
         never "played backwards"); verify() checks penetration of the floor, NaNs and frame-to-frame jumps.
Presets  FALL_AND_BOUNCE, FALL_AND_RESET, STACK_COLLAPSE, DOMINO_CHAIN, ROLL_AND_STOP, SPIN_AND_DROP, OBJECT_IMPACT,
         EXPLOSION_IMPULSE, FLOAT_AND_LAND, RETURN_TO_ORIGIN, LOOPING_PHYSICS, SLOW_MOTION_IMPACT (+ CAMERA_ORBIT in
         physics_scene.py). Every preset takes keyword parameters and a seed (deterministic)."""
from __future__ import annotations

import math
import random

import bpy
from mathutils import Matrix, Vector


# ---------------- world + bodies ----------------
def world(scene, frame_start: int, frame_end: int, substeps: int = 20, iterations: int = 30, time_scale: float = 1.0, gravity=(0, 0, -9.81)):
    if scene.rigidbody_world is None:
        bpy.ops.rigidbody.world_add()
    w = scene.rigidbody_world
    w.substeps_per_frame, w.solver_iterations, w.time_scale = substeps, iterations, time_scale
    w.point_cache.frame_start, w.point_cache.frame_end = frame_start, frame_end
    scene.gravity = gravity
    w.enabled = True
    return w


def _select_only(o):
    for x in bpy.context.selected_objects:
        x.select_set(False)
    o.select_set(True)
    bpy.context.view_layer.objects.active = o


def add_body(o, kind="ACTIVE", shape="CONVEX_HULL", mass=1.0, friction=0.5, restitution=0.2, lin_damp=0.04, ang_damp=0.1, margin=0.002, kinematic=False):
    _select_only(o)
    if o.rigid_body is None:
        bpy.ops.rigidbody.object_add()
    rb = o.rigid_body
    rb.type, rb.collision_shape = kind, shape
    rb.mass, rb.friction, rb.restitution = mass, friction, restitution
    rb.linear_damping, rb.angular_damping = lin_damp, ang_damp
    rb.use_margin, rb.collision_margin = True, margin
    rb.kinematic = kinematic
    o["_origin"] = [list(r) for r in o.matrix_world]
    return rb


def impulse(o, f_release: int, velocity, spin=(0, 0, 0), frames: int = 3, fps: int = 30):
    """a short animated push before f_release that hands `velocity` (m/s) and `spin` (rad/s) to the solver"""
    rb = o.rigid_body
    p1 = o.location.copy()
    r1 = o.rotation_euler.copy()
    dt = frames / fps
    p0 = p1 - Vector(velocity) * dt
    r0 = (Vector(r1) - Vector(spin) * dt)
    rb.kinematic = True
    o.location, o.rotation_euler = p0, r0
    o.keyframe_insert("location", frame=f_release - frames)
    o.keyframe_insert("rotation_euler", frame=f_release - frames)
    rb.keyframe_insert("kinematic", frame=f_release - frames)
    o.location, o.rotation_euler = p1, r1
    o.keyframe_insert("location", frame=f_release)
    o.keyframe_insert("rotation_euler", frame=f_release)
    rb.keyframe_insert("kinematic", frame=f_release - 1)
    rb.kinematic = False
    rb.keyframe_insert("kinematic", frame=f_release)
    for fc in (o.animation_data.action.fcurves if o.animation_data and o.animation_data.action else []):
        for kp in fc.keyframe_points:
            kp.interpolation = "LINEAR"


def hold(o, f_until: int):
    """keep a body pinned where it is (kinematic) until f_until, then let physics take it"""
    rb = o.rigid_body
    rb.kinematic = True
    rb.keyframe_insert("kinematic", frame=0)
    rb.keyframe_insert("kinematic", frame=f_until - 1)
    rb.kinematic = False
    rb.keyframe_insert("kinematic", frame=f_until)
    o.keyframe_insert("location", frame=0)
    o.keyframe_insert("rotation_euler", frame=0)


# ---------------- simulate + bake ----------------
def simulate(scene, bodies: list, f0: int, f1: int) -> dict:
    """run the solver, record transforms, then replace the rigid bodies by keyframes (deterministic final motion)"""
    rec = {o.name: [] for o in bodies}
    scene.frame_set(f0)
    for f in range(f0, f1 + 1):
        scene.frame_set(f)
        for o in bodies:
            rec[o.name].append(o.matrix_world.copy())
    for o in bodies:
        _select_only(o)
        if o.animation_data:
            o.animation_data_clear()
        if o.rigid_body:
            bpy.ops.rigidbody.object_remove()
        o.rotation_mode = "QUATERNION"
        for k, m in enumerate(rec[o.name]):
            loc, rot, _ = m.decompose()
            o.location, o.rotation_quaternion = loc, rot
            o.keyframe_insert("location", frame=f0 + k)
            o.keyframe_insert("rotation_quaternion", frame=f0 + k)
    scene.rigidbody_world.enabled = False
    return rec


def return_to_origin(o, f_start: int, frames: int = 50, lift: float = 0.35):
    """animated recovery: from its resting pose back to where it started, along a soft arc (eased)"""
    start = Matrix(o["_origin"])
    l0, r0, _ = start.decompose()
    o.rotation_mode = "QUATERNION"
    bpy.context.scene.frame_set(f_start)
    l1, r1 = o.location.copy(), o.rotation_quaternion.copy()
    ad = o.animation_data
    if ad and ad.action:   # drop the baked simulation after the recovery starts, or it would snap back afterwards
        for fc in ad.action.fcurves:
            for i in range(len(fc.keyframe_points) - 1, -1, -1):   # back to front: removal shifts the indices
                if fc.keyframe_points[i].co.x >= f_start:
                    fc.keyframe_points.remove(fc.keyframe_points[i], fast=True)
            fc.update()
    for k in range(frames + 1):
        u = k / frames
        e = u * u * (3 - 2 * u)
        o.location = l1.lerp(l0, e) + Vector((0, 0, lift * math.sin(math.pi * e)))
        o.rotation_quaternion = r1.slerp(r0, e)
        o.keyframe_insert("location", frame=f_start + k)
        o.keyframe_insert("rotation_quaternion", frame=f_start + k)


def loop(o, f0: int, f1: int, repeats: int = 1, gap: int = 0):
    """repeat a baked segment [f0, f1] after itself (LOOPING_PHYSICS / FALL_AND_RESET cycles)"""
    ad = o.animation_data
    if not ad or not ad.action:
        return
    span = f1 - f0 + 1 + gap
    for fc in ad.action.fcurves:
        pts = [(kp.co.x, kp.co.y) for kp in fc.keyframe_points if f0 <= kp.co.x <= f1]
        for r in range(1, repeats + 1):
            for x, y in pts:
                fc.keyframe_points.insert(x + r * span, y, options={"FAST"})


def verify(rec: dict, floor_z: float = 0.0, objects: dict | None = None, tol: float = 0.01) -> dict:
    """per object, on the real mesh vertices (not the bounding box, which overstates a spinning ball): the lowest point
    reached (penetration of the floor), where it ends (bottom height: 0 = resting on the floor, no floating), how far
    it moved (a struck object that moved > 0 proves the collision), NaNs, and teleport-like jumps between frames"""
    report = {}
    for name, mats in rec.items():
        o = (objects or {}).get(name) or bpy.data.objects.get(name)
        if o is not None and o.type == "MESH" and len(o.data.vertices):
            vs = o.data.vertices
            step = max(1, len(vs) // 1500)
            pts = [vs[i].co.copy() for i in range(0, len(vs), step)]
        else:
            pts = [Vector(c) for c in o.bound_box] if o else [Vector((0, 0, 0))]
        min_z, worst_jump, bad = 1e9, 0.0, 0
        prev, first, last_bottom = None, None, None
        for m in mats:
            if any(math.isnan(v) for row in m for v in row):
                bad += 1
                continue
            last_bottom = min((m @ c).z for c in pts)
            min_z = min(min_z, last_bottom)
            t = m.translation
            first = first or t.copy()
            if prev is not None:
                worst_jump = max(worst_jump, (t - prev).length)
            prev = t.copy()
        report[name] = {"lowest_point": round(min_z, 4), "penetration": round(max(0.0, floor_z - tol - min_z), 4),
                        "final_bottom_z": round(last_bottom if last_bottom is not None else 0.0, 4),
                        "moved_m": round((prev - first).length, 3) if prev is not None and first is not None else 0.0,
                        "max_step_m": round(worst_jump, 4), "nan_frames": bad,
                        "ok": min_z >= floor_z - tol and bad == 0 and worst_jump < 1.0}
    return report


# ---------------- presets (parameterised, deterministic) ----------------
def FALL_AND_BOUNCE(o, height=2.0, restitution=0.55, mass=1.0, shape="CONVEX_HULL", **_):
    o.location.z += height
    add_body(o, "ACTIVE", shape, mass, 0.5, restitution)


def SPIN_AND_DROP(o, height=2.0, spin=(6, 2, 0), release=10, fps=30, **_):
    o.location.z += height
    add_body(o, "ACTIVE", "CONVEX_HULL", 1.0, 0.5, 0.35)
    impulse(o, release, (0, 0, 0), spin, fps=fps)


def ROLL_AND_STOP(o, velocity=(2.5, 0, 0), release=10, rolling_resistance=0.6, fps=30, **_):
    add_body(o, "ACTIVE", "SPHERE", 0.45, 0.8, 0.3, lin_damp=0.05, ang_damp=rolling_resistance)
    impulse(o, release, velocity, (0, -Vector(velocity).length / max(0.05, o.dimensions.z / 2), 0), fps=fps)


def OBJECT_IMPACT(o, target, speed=4.0, release=10, fps=30, **_):
    d = (target.location - o.location)
    d.z += 0.2
    add_body(o, "ACTIVE", "CONVEX_HULL", 2.0, 0.5, 0.3)
    impulse(o, release, d.normalized() * speed, fps=fps)


def EXPLOSION_IMPULSE(objs, center, strength=6.0, release=10, seed=1, fps=30, **_):
    rnd = random.Random(seed)
    for o in objs:
        if o.rigid_body is None:
            add_body(o, "ACTIVE", "CONVEX_HULL", 1.0, 0.5, 0.3)
        d = (o.location - Vector(center))
        d.z = abs(d.z) + 0.6
        v = d.normalized() * strength * rnd.uniform(0.7, 1.2)
        impulse(o, release, v, (rnd.uniform(-8, 8), rnd.uniform(-8, 8), rnd.uniform(-4, 4)), fps=fps)


def STACK_COLLAPSE(objs, push=(1.6, 0, 0), release=20, fps=30, **_):
    for k, o in enumerate(objs):
        add_body(o, "ACTIVE", "BOX", 1.0 + 0.2 * k, 0.6, 0.1)
    impulse(objs[0], release, push, fps=fps)


def DOMINO_CHAIN(objs, push=(1.2, 0, 0), release=15, fps=30, **_):
    for o in objs:
        add_body(o, "ACTIVE", "BOX", 0.4, 0.5, 0.05)
    impulse(objs[0], release, push, (0, 3.0, 0), fps=fps)


def FLOAT_AND_LAND(o, height=1.2, float_frames=45, start=5, **_):
    """levitate up (animated), hover, then drop under real gravity"""
    add_body(o, "ACTIVE", "CONVEX_HULL", 1.0, 0.5, 0.35, kinematic=True)
    base = o.location.copy()
    for k in range(float_frames + 1):
        u = k / float_frames
        o.location = base + Vector((0, 0, height * (u * u * (3 - 2 * u)) + 0.04 * math.sin(k * 0.3)))
        o.rotation_euler.z = 0.6 * u
        o.keyframe_insert("location", frame=start + k)
        o.keyframe_insert("rotation_euler", frame=start + k)
    o.rigid_body.keyframe_insert("kinematic", frame=start + float_frames)
    o.rigid_body.kinematic = False
    o.rigid_body.keyframe_insert("kinematic", frame=start + float_frames + 1)


def SLOW_MOTION_IMPACT(scene, time_scale=0.35, **_):
    scene.rigidbody_world.time_scale = time_scale


PRESETS = {k: v for k, v in globals().items() if k.isupper() and callable(v)}
