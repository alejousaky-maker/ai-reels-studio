"""Depth maps for AI backdrops (Depth Anything V2 Small, Apache-2.0), run inside the ComfyUI venv (torch + transformers).
Usage (called by engine.imagegen): <comfy venv python> engine/depthgen.py <in.png> <out_depth.png>
Writes an 8-bit greyscale map, near = white, far = black, same size as the input."""
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("HF_HOME", os.path.join(ROOT, "tools", "hf_cache"))
MODEL = "depth-anything/Depth-Anything-V2-Small-hf"


def main(src: str, dst: str) -> None:
    import numpy as np
    import torch
    from PIL import Image
    from transformers import pipeline
    img = Image.open(src).convert("RGB")
    small = img.resize((img.width // 2, img.height // 2))
    try:   # the GPU may be busy with FLUX: fall back to the CPU (slower, same result)
        pipe = pipeline("depth-estimation", model=MODEL, device=0 if torch.cuda.is_available() else -1)
        res = pipe(small)
    except RuntimeError:
        pipe = pipeline("depth-estimation", model=MODEL, device=-1)
        res = pipe(small)
    d = np.asarray(res["predicted_depth"].squeeze().float().cpu().numpy(), dtype=np.float32)
    d = (d - d.min()) / max(1e-6, d.max() - d.min())          # relative inverse depth: near = 1
    out = Image.fromarray((d * 255).astype("uint8")).resize(img.size, Image.BICUBIC)
    out.save(dst + ".part.png")
    os.replace(dst + ".part.png", dst)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
