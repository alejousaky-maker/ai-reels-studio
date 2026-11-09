"""System diagnosis: GPU/VRAM, CPU, RAM, disks, tools, models, local AI. Writes logs/diagnostics.json."""
from __future__ import annotations

import json
import os
import platform
import shutil
import subprocess

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))


def _cmd(args, timeout=15):
    try:
        r = subprocess.run(args, capture_output=True, text=True, timeout=timeout, encoding="utf-8", errors="replace")
        return (r.stdout or r.stderr).strip()
    except Exception as e:  # noqa
        return f"ERROR: {e}"


def run() -> dict:
    d: dict = {"os": platform.platform(), "python": platform.python_version(), "root": ROOT}
    smi = shutil.which("nvidia-smi")
    if smi:
        out = _cmd([smi, "--query-gpu=name,memory.total,memory.used,driver_version,utilization.gpu", "--format=csv,noheader,nounits"])
        try:
            n, mt, mu, drv, util = [x.strip() for x in out.splitlines()[0].split(",")]
            d["gpu"] = {"name": n, "vramMB": int(mt), "usedMB": int(mu), "driver": drv, "util": int(util)}
        except Exception:  # noqa
            d["gpu"] = {"raw": out}
    else:
        d["gpu"] = None
    try:
        import ctypes

        class MS(ctypes.Structure):
            _fields_ = [("l", ctypes.c_ulong), ("load", ctypes.c_ulong), ("total", ctypes.c_ulonglong), ("avail", ctypes.c_ulonglong),
                        ("tp", ctypes.c_ulonglong), ("ap", ctypes.c_ulonglong), ("tv", ctypes.c_ulonglong), ("av", ctypes.c_ulonglong), ("ax", ctypes.c_ulonglong)]
        m = MS(); m.l = ctypes.sizeof(MS)
        ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(m))  # type: ignore[attr-defined]
        d["ramGB"] = round(m.total / 2 ** 30, 1); d["ramFreeGB"] = round(m.avail / 2 ** 30, 1)
    except Exception:  # noqa
        pass
    d["cpu"] = {"name": platform.processor(), "threads": os.cpu_count()}
    du = shutil.disk_usage(ROOT)
    d["disk"] = {"projectDrive": os.path.splitdrive(ROOT)[0] or "/", "freeGB": round(du.free / 2 ** 30, 1), "totalGB": round(du.total / 2 ** 30, 1)}
    node = os.path.join(ROOT, "tools", "node", "node.exe")
    tools = {
        "node": _cmd([node, "--version"]) if os.path.exists(node) else (_cmd(["node", "--version"]) if shutil.which("node") else None),
        "ffmpeg": _cmd(["ffmpeg", "-version"]).splitlines()[0] if shutil.which("ffmpeg") else None,
        "ffprobe": bool(shutil.which("ffprobe")),
        "git": _cmd([os.path.join(ROOT, "tools", "git", "cmd", "git.exe"), "--version"]) if os.path.exists(os.path.join(ROOT, "tools", "git", "cmd", "git.exe")) else shutil.which("git"),
        "ollama": bool(shutil.which("ollama")) or os.path.exists(os.path.expandvars(r"%LOCALAPPDATA%\Programs\Ollama\ollama.exe")),
        "remotionInstalled": os.path.isdir(os.path.join(ROOT, "engine", "remotion", "node_modules", "remotion")),
        "chromeHeadlessShell": os.path.isdir(os.path.join(ROOT, "engine", "remotion", "node_modules", ".remotion")),
    }
    d["tools"] = tools
    d["models"] = {
        "kokoro": os.path.exists(os.path.join(ROOT, "models", "kokoro", "kokoro-v1.0.onnx")),
        "whisper": os.path.isdir(os.path.join(ROOT, "models", "whisper")),
        "kenneyModels": len([f for f in os.listdir(os.path.join(ROOT, "engine", "remotion", "public", "bridge", "kenney")) if f.endswith(".glb")])
        if os.path.isdir(os.path.join(ROOT, "engine", "remotion", "public", "bridge", "kenney")) else 0,
    }
    try:
        from engine.providers.planner import ollama_models
        d["ollamaModels"] = ollama_models()
    except Exception:  # noqa
        d["ollamaModels"] = []
    problems = []
    if not d["gpu"]:
        problems.append({"what": "No NVIDIA GPU detected", "fix": "Rendering still works through Chrome's software path (slower). Install the NVIDIA driver for GPU rendering."})
    elif d["gpu"].get("vramMB", 0) < 6000:
        problems.append({"what": f"Low VRAM ({d['gpu'].get('vramMB')} MB)", "fix": "Use Draft/Standard quality; avoid large local LLMs while rendering."})
    if d["disk"]["freeGB"] < 20:
        problems.append({"what": f"Only {d['disk']['freeGB']} GB free", "fix": "Free disk space or clean the cache in Settings (renders need ~2-10 GB)."})
    if not tools["node"]:
        problems.append({"what": "Node.js missing", "fix": "Run install.ps1 (it installs a portable Node LTS inside the app folder)."})
    if not tools["ffmpeg"]:
        problems.append({"what": "FFmpeg missing", "fix": "winget install Gyan.FFmpeg, then restart the app."})
    if not tools["remotionInstalled"]:
        problems.append({"what": "Render engine not installed", "fix": "Run install.ps1"})
    if not d["models"]["kokoro"]:
        problems.append({"what": "Kokoro voice model missing", "fix": "Run install.ps1, or upload your own voice WAV/MP3 per project."})
    if not d["ollamaModels"]:
        problems.append({"what": "No local AI model (Ollama)", "fix": "Optional. Install Ollama (ollama.com) and run: ollama pull qwen3:4b. Without it, write the script yourself or use Claude-assisted mode."})
    d["problems"] = problems
    d["ok"] = not any(p["what"].startswith(("Node", "FFmpeg", "Render")) for p in problems)
    os.makedirs(os.path.join(ROOT, "logs"), exist_ok=True)
    with open(os.path.join(ROOT, "logs", "diagnostics.json"), "w", encoding="utf-8") as f:
        json.dump(d, f, indent=1)
    return d


if __name__ == "__main__":
    print(json.dumps(run(), indent=1))
