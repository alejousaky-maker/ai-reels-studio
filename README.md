# AI Reels Studio

Local app (Windows) that turns an idea into a finished **vertical 2.5D animated Short/Reel**: original script with a
fact sheet, local voice, word-timed storyboard, 2D characters lit inside painted 3D worlds with ink outlines and depth of
field, original music and SFX, loudness-normalised mix, technical QA and an MP4 export. Everything runs on this PC.
No cloud generator is required; nothing is ever published automatically.

Quick start in Spanish: **[README_PRIMEROS_PASOS_ES.md](README_PRIMEROS_PASOS_ES.md)**.

```
install.ps1   one-time, idempotent install (no admin)        start.bat / start.ps1   open the app (http://127.0.0.1:8777)
Default output: Master 2K 1440x2560 (Draft / Standard also available).
diagnose.ps1  hardware/tools report -> logs/diagnostics.json  test.ps1 [-Render]      tests (+ real GPU render smoke test)
```

## What it does
| Step | How | Output (projects/<id>/) |
|---|---|---|
| Idea → plan | Ollama (local, JSON-schema constrained + Pydantic validated), rule-based writer, your own script, or Claude-assisted copy/paste | `plan.json`, `script/SCRIPT.md`, `script/script.json`, `script/FACTS.md` (verified / uncertain / fiction) |
| Voice | Kokoro-82M (ONNX, CPU), EN + ES voices, sentence-wise, 48 kHz; or import your WAV/MP3 | `audio/voice.wav`, `audio/sentences.json` |
| Timing | faster-whisper word timestamps (CPU int8) inside TTS sentence spans; fallback by characters; `words.manual.json` overrides | `audio/words.json` |
| Storyboard | Director: shots, camera keys, push-ins, kicks, DOF, staging inside the 9:16 frustum, reactions 2 f before the word, light arc | `storyboard/storyboard.json` (+ snapshots in `versions/`) |
| Locations | 6 procedural places (village square, market, street, park, **interior**, **harbour**), switchable per scene | `storyboard.json` `env` per scene |
| Picture | Remotion + three.js engine (`StoryShort`): template's ink → lens blur → bloom → tone map → grade chain, lit Canvas2D cast | per-scene segments `scenes/`, `preview/` stills + contact sheet |
| Sound | Original procedural score per scene mood, event SFX, ducking, voice compressor, −14 LUFS, true-peak checked after AAC | `audio/mix.wav` + stems + `mix_report.json` |
| Export / QA | ffmpeg mux `-map 0:v:0 -map 1:a:0`, ffprobe + filters QA, SRT, poster, ZIP | `output/*.mp4`, `qa/QUALITY_REPORT.md` |

Also from a prompt: **images** (2K PNG in the same style, 9:16 / 1:1 / 4:5 / 16:9, `images/<id>/`) and **script only**
(editable plan + SCRIPT.md + FACTS.md, no render).

App screens: Panel, Crear vídeo / guion, Imágenes, Proyectos (filters, duplicate, archive), Editor (production steps, storyboard
timeline + inspector with undo/redo and per-scene regeneration, script/plan JSON, video + export, voice & audio with
waveform and loudness, QA with human scoring/approval, versions), Cola de render (cancel/retry), Biblioteca (licensed
assets, validated imports), Clientes/marcas (brand kits, approved claims), Ajustes (diagnostics, defaults, safe cache cleaning, logs).

## Demos included (real renders, original content)
- **Master demo** `projects/lighthouse-daymarks` — "Why Lighthouses Get Dressed Up" (EN, 57.8 s, **2K 1440×2560**):
  harbour → keeper's room → night harbour → back, side-view walking, verified facts (Cape Lookout daymark + 15 s flash).
- **Demo A** `projects/demo-dancing-1518` — "The Town That Couldn't Stop Dancing" (EN, 63.7 s, 15 scenes; facts checked,
  uncertain points worded as uncertain).
- **Demo B** `projects/caf-lumen-anuncio-*` — ad for a FICTIONAL café "Café Lumen" (ES, 20.7 s): brand-coloured sign and
  awning, products, CTA, only client-approved claims, no reviews or numbers.
- **Demo C** `projects/demo-c-variant-of-demo-a-*` — duplicate of Demo A with edited hook / light; the render report lists
  which scenes were re-rendered vs reused.
- Smoke test teaser: `projects/demo-dancing-1518/output/teaser_video.mp4` (13 s, first render).

## Hardware notes (measured on this PC: RTX 3060 12 GB, Ryzen 5 5500, 32 GB)
- Render 1080×1920: **9.6 fps** for one 13 s composition; **~7 fps** for a 63.7 s short rendered as 15 scene segments
  (275 s incl. browser start per segment). GPU in use via ANGLE: VRAM 1.2 → 4.3 GB, 15-40 % utilisation (CPU-bound capture/encode).
- Stills at half scale: ~3 s each after a ~3 s cached bundle.
- TTS 63 s of narration: ~21 s (CPU). Word alignment: ~12 s (CPU). Mix: ~20 s.
- Stages run one at a time (single worker) so TTS / whisper / Chromium never compete for VRAM.

## Folder map
```
app/backend (FastAPI, SQLite, jobs)   app/frontend (React/Vite UI)   engine/remotion (render engine)
engine/audio (TTS, align, score, mix + upstream template)   engine/story (schema, director, presets)
engine/quality (QA)   engine/providers (Ollama / rules / Claude-assisted)   projects/<id>/ (everything per video)
references/ (measured style reports, MIT)   tests/ (pytest)   tools/ models/ work/ data/ logs/ (local, git-ignored)
```

## Licenses before commercial use
See **[LICENSES.md](LICENSES.md)** — notably the **Remotion license** (free only for individuals / ≤3-person companies),
model licenses (Kokoro Apache-2.0, Kenney CC0) and the facts/claims rules. Security model: [SECURITY.md](SECURITY.md).

## Moving to another Windows PC
Copy the folder without `tools/ models/ work/ .venv/ node_modules/` (or the whole folder), run `install.ps1`, then `start.bat`.
All paths are relative to the folder; `.env.example` lists optional overrides (e.g. put renders on another drive).
