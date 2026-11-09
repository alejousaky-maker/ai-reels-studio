# Engineering decisions

## Source strategy: official + audited fork scaffold (option B, partial)
- **Official** `mromidev/claude-animated-shorts` (MIT) gives the look technique: ink pass, lens blur, grade, toon cards,
  painted textures, lights, DSP/instruments/SFX, measured reports. It ships source files only (no runnable project).
- **Fork** `EssouliAnas/claude-animated-shorts` was audited file by file: it adds a pinned `package.json` +
  lockfile (Remotion 4.0.530, three 0.176, R3F 9.1.2, postprocessing 6.37.3, React 19), `get-models.mjs` (downloads the
  two Kenney CC0 kits from kenney.nl), and one React-types fix in `Bridge.tsx`. The template's bridge sources are otherwise
  byte-identical to the official ones (verified with `git diff --no-index`).
- We use the fork's **pinned scaffold + model downloader** and the official technique. We did **not** run the fork's
  `setup.ps1` (it sets a user-wide env var and makes a junction in `~/.claude/skills`); our `install.ps1` replaces it.
- Reference frames/contact sheets from the official repo are **not** copied into the app (study-only material).
- The bridge story itself is kept only as a regression composition (`BridgeShort`); our engine (`StoryShort`) is generic
  and storyboard-driven, with our own characters, wardrobe, environments, icons, music and stories.

## Stack (installed and pinned)
- Node **v24.22.2 LTS portable** inside `tools/node` (no admin, SHA-256 checked). MinGit 2.56 portable in `tools/git`.
- Python **3.12.14** venv via `uv` (managed CPython inside `tools/python`); deps frozen in `requirements.lock.txt`.
- Engine: Remotion 4.0.530 + @remotion/three, three 0.176, R3F 9.1.2, @react-three/postprocessing 3.0.4 (fork lockfile).
- UI: React 19 + Vite 6.3.5 + TS 5.8 (lockfile). Plain CSS variables instead of Tailwind (one less toolchain).
- Backend: FastAPI 0.162 + Pydantic 2.14 + SQLite + one worker thread (sequential GPU queue).
- TTS: **kokoro-onnx 0.6.1** (Kokoro-82M ONNX, CPU/onnxruntime). Chosen over the PyTorch `kokoro` package: no 2.5 GB
  torch/CUDA download, works on Windows out of the box, ~8 s for 2 sentences, ~20 s for a 63 s script.
- Alignment: faster-whisper 1.2.1 `base`, **CPU int8 by default**: the CUDA path needs cuBLAS/cuDNN DLLs not present with
  a plain driver and it *hung* (instead of failing) on this PC. Opt-in with `AIRS_WHISPER_DEVICE=cuda`.
- Local LLM: Ollama with whatever model is installed (found `qwen2.5:7b`; `qwen3:4b`/`qwen3:8b` preferred if pulled).
  Structured output with the Plan JSON schema + Pydantic validation + 2 repair rounds; rule-based fallback always works.

## Engine design
- Determinism: every visual state is a function of (storyboard, frame). Life animation (blinks, dance cycles, effect
  loops) runs on **scene-relative** time so a time-shifted but otherwise identical scene renders identical pixels.
- Scene-segment cache: each scene renders to its own MP4 (frameRange), keyed by a content hash invariant to time shifts
  (plus engine source, env, cast, brand, all camera paths because sight-line culling of the shared world depends on all
  cameras, and neighbours when a crossfade overlaps). Segments are concatenated with `-c copy`.
- Post chain (unchanged from the template, it fixes the "blur erases ink" bug): ink pass → lens pre → lens main →
  bloom (emissive only) → NEUTRAL tone map → grade; pixel radii scale with output height.
- Director: shot grammar (wide/medium/close/low/high/two_shot/insert), push-in on every hold, 24 f glides or cuts on long
  beats, 7-frame flip kicks on impact words, DOF on medium/close focused on the subject's eyes, staging inside the 9:16
  frustum (actors pulled into 80 % of the visible half-width), reactions/effects 2 frames before their word.
- Night light preset is ours (moonlit blue hour); day/golden are the template's tuned values.

## Audio
- Voice: gain + gentle compressor only. Music: original procedural score per scene mood (template's synths).
- Mix to −14 LUFS with a −2 dBTP ceiling on the WAV because **AAC overshoots true peak by ~2 dB** (measured +2.2 dB on
  Demo A). `step_mux` re-measures the MP4 and re-encodes with an exact trim if it is still above −1 dBTP.

## Ports / co-existence
- Port **8777** (8765 is used by another local app on this PC). `start.ps1` only reuses a port if `/api/health` says
  `ai-reels-studio`; otherwise it tries 8778/8779.

## Not done on purpose
- No ElevenLabs / cloud generators wired in (opt-in only per the brief; not needed for the core).
- No automatic publishing anywhere. No voice cloning.
- No "AI score" for subjective quality: technical metrics are measured; subjective areas need human review in the app.
