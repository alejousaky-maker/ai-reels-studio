# RUN LOG (condensed, no secrets)

- System scan: RTX 3060 12288 MiB / driver 595.97; Ryzen 5 5500; 31.9 GB; C: 408 GB free; git/node missing; Python 3.14 only;
  ffmpeg 9.0.2 (winget); Ollama with qwen2.5:7b; uv 0.12.21.
- Portable Node v24.22.2 (SHASUMS256 verified) + MinGit 2.56.0.4 → tools/.
- `git clone --depth 1` official repo + fork into `_upstream/`; diffed (`git diff --no-index`): only Bridge.tsx differs (React types fix).
- `npm ci` (fork lockfile, 284 packages); `get-models.mjs` → 26 Kenney GLB + colormap; `tsc --noEmit` OK.
- Template stills via ANGLE: 3 stills, ~5 s each (bridge scene renders correctly).
- Built StoryShort engine; first demo stills → defects (watchers out of frame, '?' clipped) → fixed → 13 s MP4 in 40.5 s.
- `uv venv --python 3.12` + kokoro-onnx, faster-whisper, fastapi…; Kokoro model files (325 MB + 28 MB).
- faster-whisper on CUDA **hung** (>10 min, no cuBLAS DLLs) → killed; CPU int8 default → 2.7 s per 2 sentences.
- Demo A: script/voice/align/storyboard 37 s; 45 stills 143 s; contact sheet review → fixed staging inside 9:16, icon
  placement, darker night; render+mix+mux+QA 313 s → QA **FAIL true peak +1.0 dBTP** (AAC overshoot) → voice compressor,
  −2 dBTP ceiling, post-mux TP check → PASS.
- UI: port 8765 belonged to another local app ("Shorts Factory") → moved to 8777 with ownership check in start.ps1.
- User clicked "Producir todo" on Demo A in the UI → completed, 0 rendered / 15 reused.
- pytest found: duplicate cast in a beat (planner) and off-frame second actor → fixed (dedupe + frustum clamp).
- Demo B (ES ad, fictional Café Lumen): contact sheet → product insert inside the barista, cropped sign → fixed; master 2K
  failed (height 2559.936, scale 1.3333) → exact 4/3 → 1440×2560 OK in 92.8 s.
- GPU sampling during Demo B render: VRAM 1.2→4.3 GB, util 15-40 %.
- Demo C: first edit test re-rendered 15/15 (global camera hash) → per-scene worlds + time-shift-invariant timing →
  second edit test 5/15 rendered, 10 reused (101 s).
- Encoding slip: two PowerShell Get-Content/Set-Content edits double-encoded '·'/'—' in pipeline.py/StoryShort.tsx → repaired.
- `test.ps1 -Render` → all groups passed. Ollama plan test: qwen2.5:7b 44.5 s, valid; added keep_alive 0.
