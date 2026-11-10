"""Local AI backdrops: a tiny client for the ComfyUI server in tools/ComfyUI (FLUX.1-schnell fp8, Apache-2.0).
Runs only on 127.0.0.1:8188; nothing leaves the machine. Images are cached by a hash of (prompt, seed, size)."""
from __future__ import annotations

import hashlib
import json
import os
import shutil
import subprocess
import time
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COMFY = os.path.join(ROOT, "tools", "ComfyUI")
HOST = "http://127.0.0.1:8188"
CKPT = "flux1-schnell-fp8.safetensors"
UPSCALER = "RealESRGAN_x4plus.pth"
CACHE = os.path.join(ROOT, "work", "backdrops")
PUBLIC = os.path.join(ROOT, "engine", "remotion", "public", "backdrops")


def available() -> bool:
    return os.path.exists(os.path.join(COMFY, "models", "checkpoints", CKPT)) and os.path.exists(os.path.join(COMFY, ".venv", "Scripts", "python.exe"))


def _get(path: str, timeout=10):
    with urllib.request.urlopen(HOST + path, timeout=timeout) as r:
        return r.read()


def _up() -> bool:
    try:
        _get("/system_stats", 3)
        return True
    except Exception:
        return False


def ensure_server(wait: int = 240) -> None:
    if _up():
        return
    log = open(os.path.join(ROOT, "logs", "comfyui.log"), "ab")
    subprocess.Popen([os.path.join(COMFY, ".venv", "Scripts", "python.exe"), "main.py", "--listen", "127.0.0.1", "--port", "8188",
                      "--disable-auto-launch"], cwd=COMFY, stdout=log, stderr=log,
                     creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
    t0 = time.time()
    while time.time() - t0 < wait:
        if _up():
            return
        time.sleep(2)
    raise RuntimeError("ComfyUI did not start (see logs/comfyui.log)")


def _workflow(prompt: str, seed: int, w: int, h: int) -> dict:
    return {
        "4": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": CKPT}},
        "6": {"class_type": "CLIPTextEncode", "inputs": {"text": prompt, "clip": ["4", 1]}},
        "7": {"class_type": "CLIPTextEncode", "inputs": {"text": "", "clip": ["4", 1]}},
        "5": {"class_type": "EmptySD3LatentImage", "inputs": {"width": w, "height": h, "batch_size": 1}},
        "3": {"class_type": "KSampler", "inputs": {"seed": seed, "steps": 4, "cfg": 1.0, "sampler_name": "euler", "scheduler": "simple",
                                                 "denoise": 1.0, "model": ["4", 0], "positive": ["6", 0], "negative": ["7", 0], "latent_image": ["5", 0]}},
        "8": {"class_type": "VAEDecode", "inputs": {"samples": ["3", 0], "vae": ["4", 2]}},
        # Real-ESRGAN x4plus (BSD-3) then down to the Master 2K canvas: crisp painted detail instead of a soft 832 px image
        "10": {"class_type": "UpscaleModelLoader", "inputs": {"model_name": UPSCALER}},
        "11": {"class_type": "ImageUpscaleWithModel", "inputs": {"upscale_model": ["10", 0], "image": ["8", 0]}},
        "12": {"class_type": "ImageScale", "inputs": {"upscale_method": "lanczos", "width": 1440, "height": 2560, "crop": "center", "image": ["11", 0]}},
        "9": {"class_type": "SaveImage", "inputs": {"filename_prefix": "airs", "images": ["12", 0]}},
    }


def key_of(prompt: str, seed: int, w: int, h: int) -> str:
    return hashlib.sha1(f"{CKPT}|{UPSCALER}|{prompt}|{seed}|{w}x{h}".encode()).hexdigest()[:16]


def generate(prompt: str, seed: int = 7, w: int = 832, h: int = 1472, timeout: int = 300) -> str:
    """returns the cached PNG path for this prompt (generates it when missing)"""
    os.makedirs(CACHE, exist_ok=True)
    out = os.path.join(CACHE, key_of(prompt, seed, w, h) + ".png")
    if os.path.exists(out):
        return out
    ensure_server()
    body = json.dumps({"prompt": _workflow(prompt, seed, w, h), "client_id": "ai-reels-studio"}).encode()
    req = urllib.request.Request(HOST + "/prompt", data=body, headers={"Content-Type": "application/json"})
    pid = json.loads(urllib.request.urlopen(req, timeout=30).read())["prompt_id"]
    t0 = time.time()
    while time.time() - t0 < timeout:
        hist = json.loads(_get(f"/history/{pid}"))
        if pid in hist and hist[pid].get("outputs"):
            img = next(iter(hist[pid]["outputs"].values()))["images"][0]
            q = urllib.parse.urlencode({"filename": img["filename"], "subfolder": img.get("subfolder", ""), "type": img.get("type", "output")})
            data = _get(f"/view?{q}", 60)
            with open(out + ".part", "wb") as f:
                f.write(data)
            os.replace(out + ".part", out)
            return out
        time.sleep(1.0)
    raise TimeoutError("ComfyUI generation timed out")


def publish(png: str) -> str:
    """copy a cached backdrop into the Remotion public folder; returns the staticFile path"""
    os.makedirs(PUBLIC, exist_ok=True)
    name = os.path.basename(png)
    dst = os.path.join(PUBLIC, name)
    if not os.path.exists(dst):
        shutil.copyfile(png, dst)
    return f"backdrops/{name}"


# ---------------- prompts ----------------
STYLE = ("cel-shaded 2.5D cartoon background art for an animated story short, thick clean black ink outlines, soft cinematic lighting, "
         "rich detailed environment with lots of small props, vibrant saturated colors, gentle depth of field, eye-level camera, "
         "empty scene with no people and no characters, no animals, no text, no letters, no logos, no watermark, "
         "vertical 9:16 composition, open floor space in the lower third")
LIGHT = {"day": "bright daylight, clear blue sky with soft clouds", "golden": "warm golden-hour sunset light, long soft shadows, orange sky",
         "night": "night time, deep blue moonlight with warm glowing lamps and neon reflections"}
LOOK = {"sepia": "vintage 1920s period details, old sepia photograph mood", "bw": "old black and white archive photo mood",
        "cool": "cool blue tint", "warm": "warm cozy tint"}
ENV = {
    "village_square": "a cobblestone medieval village square with a stone fountain, half-timbered houses, flower boxes, market stalls",
    "park": "a sunny city park with lawns, trees, benches, a pond and lamp posts",
    "street": "a narrow old European street with tall painted townhouses, shuttered windows, laundry lines, cobblestones",
    "market": "a busy outdoor food market with striped awnings, crates of fruit and vegetables, hanging lanterns",
    "interior": "a cozy wooden shop interior with shelves, a counter, jars, warm lamps",
    "harbour": "a small harbour quay with fishing boats, ropes, barrels, a lighthouse and colorful houses",
    "beach": "a tropical beach with palm trees, turquoise sea, white sand and rocks",
    "ocean": "the wooden deck of an old sailing ship at sea with masts, ropes, barrels and sails",
    "troy": "an ancient walled city gate of Troy with huge stone walls, banners and a dusty plain",
    "cave": "a dark rocky cave interior with a campfire, stalactites and a bright cave mouth",
    "throne": "a royal throne room with red carpet, golden throne, columns and tall windows",
    "apartment": "a modern city apartment living room with a sofa, coffee table, plants, big windows onto a skyline",
    "bathroom": "a tiled bathroom with a shower, sink, mirror, towels",
    "office": "a corner office with a big desk, laptop, shelves and floor-to-ceiling windows onto skyscrapers",
    "hotel": "a hotel bedroom at night with a big bed, neon sign and city view",
    "airport": "a bright modern airport terminal with glass walls, rows of seats, a departures board and parked planes outside",
    "suburb": "an American suburban street with lawns, picket fences, two-storey houses, mailboxes and parked cars",
    "lake": "a calm lake shore with a wooden dock, a log cabin and pine trees",
    "resort": "a tropical resort pool deck with loungers, umbrellas, palm trees and the sea",
    "outback": "the Australian outback with red earth, a wheat field, a wooden fence and a windmill",
    "cabin": "the cramped wooden cabin of an old ship with a lantern, a cot and a sea chest",
    "bedroom": "a messy teenager bedroom with posters, a bed, a desk, shelves with figures and curtains",
    "kitchen": "a bright home kitchen with cabinets, a fridge, a table and a window",
    "banquet": "an elegant wedding banquet hall with round tables, white cloths, chandeliers and flowers",
    "gameroom": "a dark gamer bedroom with RGB LED strips, a big TV, a gaming desk, energy drink cans and pizza boxes",
    "shops": "a New York street with brick shopfronts, awnings, lit shop windows, street lamps and fire escapes",
    "trading": "a stock exchange trading floor with rows of desks, glowing monitors and big red ticker screens",
    "clinic": "a doctor's examination room with an exam table, cabinets, an eye chart and a red cross sign",
    "datacenter": "a huge data center with long aisles of server racks and blinking lights",
    "tunnel": "a subway tunnel under construction with concrete arches, rails, work lamps, pipes and dust",
    "warehouse": "a huge produce market warehouse with pallets, crates of fruit, forklifts and loading docks",
    "canal": "the Panama Canal with giant concrete lock walls, water, container ships and green jungle hills",
    "island": "an artificial island airport in the sea with a runway, a terminal with a curved glass roof and a control tower",
    "bridge": "a big suspension bridge deck with traffic lanes, red cables and a city skyline across the river",
}
VARIANT = {"station": "a gleaming new subway station with marble pillars, white LED light strips and tiled walls",
           "dig": "a 1914 excavation site with dirt trenches, steam shovels, wooden scaffolds and rail tracks",
           "dry": "a drought-stricken canal with cracked dry mud and a very low water level",
           "build": "a land reclamation site at sea with rock fill, barges and cranes",
           "aquarium": "an airport hall whose ground-floor windows look into the sea with fish swimming outside",
           "empty": "a completely empty apartment with bare brick walls and one hanging light bulb",
           "ward": "a hospital room with a bed, a heart monitor and a window",
           "red": "a data center in meltdown with red warning lights and smoke",
           "tvglow": "with blue TV glow in every window", "day": "", "open": "", "night": "", "breach": "with a huge breach torn in the wall",
           "jam": ""}


def scene_prompt(env: str, variant: str | None, light: str, look: str | None, extra: str | None) -> str:
    place = VARIANT.get(variant or "", "") if variant in ("station", "dig", "dry", "build", "aquarium", "empty", "ward", "red") else ENV.get(env, env)
    if variant and variant not in ("station", "dig", "dry", "build", "aquarium", "empty", "ward", "red") and VARIANT.get(variant):
        place += ", " + VARIANT[variant]
    parts = [place]
    if extra:
        parts.append(extra)
    parts += [LIGHT.get(light, ""), LOOK.get(look or "", ""), STYLE]
    return ", ".join(p for p in parts if p)
