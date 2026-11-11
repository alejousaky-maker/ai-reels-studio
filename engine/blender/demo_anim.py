"""Phase-2 acting test (runs inside Blender): three stickmen in the living room — one talks with gestures, points and
shrugs; one walks in, waves and cheers; one dozes on a chair. Slow travelling camera with depth of field.
usage: blender -b --python engine/blender/demo_anim.py -- <repo_root> <faces_dir> <out_dir> [frames] [res%]"""
import math
import os
import sys

import bpy

argv = sys.argv[sys.argv.index("--") + 1:]
ROOT, FACES, OUT = argv[0], argv[1], argv[2]
FRAMES = int(argv[3]) if len(argv) > 3 else 150
RES = int(argv[4]) if len(argv) > 4 else 50
sys.path.insert(0, ROOT)
from engine.blender import look as L, sets, rig  # noqa: E402

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
L.setup_render(sc, FRAMES, RES, samples=32)
KITS = os.path.join(ROOT, "engine", "remotion", "public", "kits")
sets.living_room(KITS)
sets.kenney(KITS, "furniture-kit", "chairCushion", 0.95, (-2.6, 1.9, 0), 0.4)

a = rig.Stickman("ana", FACES, loc=(-0.7, 0.6, 0), yaw=0.35, jacket="#2a9d8f", exprs=("smug", "skeptical"))
b = rig.Stickman("bo", FACES, loc=(3.2, -0.8, 0), yaw=-1.2, jacket="#e8743b", hair="#1d1b22", exprs=("neutral", "laugh", "starry"))
c = rig.Stickman("cy", FACES, loc=(-2.6, 1.95, 0), yaw=0.4, jacket="#6a5acd", hair="#8a5a34", exprs=("sleepy",))

T = FRAMES
a.act(1, int(T * 0.45), "stand", "smug", talk=[(4, int(T * 0.42))], seed=0.3)
a.act(int(T * 0.45), int(T * 0.65), "point", "skeptical", seed=0.3, face=(0.8, 0.5))
a.act(int(T * 0.65), T + 1, "shrug", "smug", seed=0.3, face=(0.6, -4.5))
b.act(1, int(T * 0.4), "walk", "neutral", walk_to=(0.8, 0.5), seed=1.1)
b.act(int(T * 0.4), int(T * 0.7), "wave", "laugh", seed=1.1, face=(0.2, -4.5))
b.act(int(T * 0.7), T + 1, "cheer", "starry", seed=1.1)
c.act(1, T + 1, "sitchair", "sleepy", seed=2.2)

# camera: a slow orbit-and-push on the group, depth of field on the talker
aim = bpy.data.objects.new("aim", None); bpy.context.collection.objects.link(aim); aim.location = (0.0, 0.7, 1.25)
cam = bpy.data.cameras.new("cam"); cam.lens = 30; cam.dof.use_dof = True; cam.dof.focus_object = a.head; cam.dof.aperture_fstop = 2.8
co = bpy.data.objects.new("cam", cam); bpy.context.collection.objects.link(co); sc.camera = co
tc = co.constraints.new("TRACK_TO"); tc.target = aim; tc.track_axis = "TRACK_NEGATIVE_Z"; tc.up_axis = "UP_Y"
for f, p in [(1, (2.2, -5.4, 1.9)), (T, (-0.6, -4.2, 1.7))]:
    co.location = p; co.keyframe_insert("location", frame=f)
for fc in co.animation_data.action.fcurves:
    for kp in fc.keyframe_points:
        kp.interpolation = "BEZIER"; kp.easing = "EASE_IN_OUT"

L.compositor(sc)
sc.render.image_settings.file_format = "PNG"
os.makedirs(OUT, exist_ok=True)
sc.render.filepath = os.path.join(OUT, "f_")
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "demo.blend"))
bpy.ops.render.render(animation=True)
print("DONE")
