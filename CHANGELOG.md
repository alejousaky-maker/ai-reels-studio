# Changelog

## 0.1.0 — 2026-11-09 (first working build)
- Engine: generic storyboard-driven `StoryShort` composition on top of the MIT template's look modules; seeded
  procedural environments (village square / market / street / park) with Kenney CC0 props and sight-line culling;
  lit Canvas2D cast with wardrobe presets, dance/walk/sit/wave, blinks, word-timed reactions; product/icon cards; shop
  front with brand sign + awning; night light preset; text/CTA overlays; optional word captions.
- Scene-segment render cache (time-shift invariant), JSON-lines render CLI with progress, bundle cache by source hash,
  temp files kept inside `work/`.
- Audio: Kokoro TTS (EN/ES), faster-whisper alignment (CPU int8), procedural score, event SFX, ducking, voice compressor,
  −14 LUFS / true-peak control verified after AAC.
- Director + Pydantic plan schema; Ollama / rule-based / Claude-assisted planners.
- QA: ffprobe/ffmpeg checks (streams, ratio, fps, A/V length, black/white/freeze, loudness, true peak, silences,
  per-scene luma stats), contact sheets, human rubric + approval gate.
- FastAPI backend (SQLite, sequential job queue, cancel kills the process tree, retry, adoption of project folders),
  React UI (10 screens), install/start/diagnose/test scripts, 18 pytest tests.
- Fixes found by our own QA: neighbours outside the 9:16 frame, icons clipped in close-ups, AAC true-peak overshoot
  (+1.0 dBTP → corrected), duplicated cast in a beat, product insert inside the subject, cropped shop sign,
  non-integer 2K height (scale 1.3333 → exact 4/3), port 8765 clash with another local app (→ 8777).
