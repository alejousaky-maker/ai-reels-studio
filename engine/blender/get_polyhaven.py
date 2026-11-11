"""Download CC0 Poly Haven models (glTF, 1k textures) into models/polyhaven/<id>/ (gitignored, like the other models).
Assets are data only: nothing downloaded is executed. usage: python -m engine.blender.get_polyhaven <id> [<id> ...]"""
from __future__ import annotations

import json
import os
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "models", "polyhaven")
UA = {"User-Agent": "ai-reels-studio-asset-setup"}


def _get(url: str) -> bytes:
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r:
        return r.read()


def fetch(asset: str, res: str = "1k") -> str:
    dst = os.path.join(OUT, asset)
    gl = os.path.join(dst, f"{asset}_{res}.gltf")
    if os.path.exists(gl):
        return gl
    files = json.loads(_get(f"https://api.polyhaven.com/files/{asset}"))
    g = files["gltf"].get(res) or next(iter(files["gltf"].values()))
    g = g["gltf"]
    os.makedirs(dst, exist_ok=True)
    for rel, meta in (g.get("include") or {}).items():
        p = os.path.normpath(os.path.join(dst, rel))
        if not p.startswith(dst):          # never write outside the asset folder
            continue
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, "wb") as fh:
            fh.write(_get(meta["url"]))
    with open(gl, "wb") as fh:
        fh.write(_get(g["url"]))
    return gl


if __name__ == "__main__":
    for a in sys.argv[1:]:
        try:
            print(a, os.path.relpath(fetch(a), ROOT), flush=True)
        except Exception as e:   # one missing asset never stops the rest
            print(a, "FAILED", e, flush=True)
