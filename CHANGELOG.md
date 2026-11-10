# Changelog

## 0.3.0 — 2026-11-09 (images and scripts from your prompts)
- **Imágenes desde un prompt** (new screen): ES/EN prompt → scene (place, light, shot, characters with role/action/
  expression/held object, effects) → 2K PNG rendered by the same engine; formats 9:16, 1:1, 4:5, 16:9; 1-4 variants
  (different camera angles); editable scene before rendering; gallery with download/edit. Hybrid reader: words stated
  in the prompt override the local model, which may not invent objects (fixes real qwen2.5 misreadings).
- **Solo guion** mode: prompt → editable script + FACTS.md without rendering (then "Producir todo").
- Plan normaliser for local-model scripts: no scene without characters, label prefixes removed, varied shots,
  light arc, moods from content, no 3 identical shots in a row; script-length repair round with the model.
- Language auto-detection in the Create form (Spanish idea → Spanish voice/script unless chosen by hand).
- Styles: Minimal Stickman = no depth of field; Cinematic Explainer = stronger depth of field.
- Director/QA: aspect-aware staging; steam rises from the held cup.

## 0.2.0 — 2026-11-09 (master generator)
- **Master 2K (1440×2560) is the default output** (form, API, settings).
- **New locations**: `interior` (open-topped room: plaster walls with wainscot, painted window, shelves, tables,
  warm hanging lamps with bloom, rug; with a brand it becomes the café: counter in the brand colour + brand sign) and
  `harbour` (quay, sea, pier, moored sailing boats, crates/barrels/bollards, red-white striped lighthouse with a
  glowing beacon, houses facing the water).
- **Per-scene locations**: a beat may move the story to another place (`environment` per beat, editable in the
  storyboard inspector "Lugar"); each scene builds its own world.
- **Side-view walking** (template `bodySide`, planted feet) for characters crossing the frame, stride matched to speed.
- Deeper **night** (darker sky/fog/grade) + warm light pools on the ground under lamps.
- Camera aims at the subject's own eye line (kids), interior lens distance capped, interior high sun, furniture
  kept out of the staging areas.
- Duration fit: narration more than 15 % short of the requested length is re-voiced slightly slower (≥0.88×).
- QA: new **render-vs-control-stills** check (blocking). It caught a real bug: after a crossfade, a long render kept
  the previous scene's world (R3F does not swap a `<primitive>` when only `object` changes) → fixed by keying it.
- Ollama: `keep_alive: 0` (frees VRAM immediately); prompt knows about per-beat locations.

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
