# NEXT STEPS (resume here — read PROGRESS.md and DECISIONS.md first)

## Known limits / defects (honest list, v0.2)
1. **Subjective quality is not auto-judged.** QA measures technical things (now including render-vs-control-stills);
   story, appeal and composition need the human rubric in the app. No video has been human-approved yet.
2. **Script quality from the local model is draft-level** (qwen2.5:7b wrote a weak hook). Use "Aprobar guion antes de
   producir", edit the plan, or Claude-assisted mode. Try `ollama pull qwen3:8b` and compare.
3. **Locations**: 6 presets (village square, market, street, park, interior, harbour), per-beat switching. Still missing:
   lab/workshop, forest path, ship deck, castle, desert, snow. The lighthouse in `harbour` is red/white bands (it does not
   change to match a story's specific lighthouse).
4. **Characters**: front cards + side-view walk; no props in hands except product cards; no sitting on chairs (sit = on the floor pose).
5. Night interior windows stay daylight-blue painted (texture is static); lamps glow with bloom + ground pools.
6. **Duration**: rule-based writer still cannot add content; the pipeline re-voices up to 0.88× speed and reports
   the gap (`manifest.durationNote`). Ollama is told the target word count.
7. Engine source changes (even a comment) invalidate every cached scene by design; brand colour / location changes
   invalidate the scenes that show them.
8. Captions are word-by-word only; no styled caption presets.
9. FastAPI `on_event` deprecation warning (harmless).

## Next features by priority
1. Human review pass on the master demos; fix what the reviewer flags.
2. More locations (workshop/lab, forest path, ship deck) + per-location props (books, tools, maps) + hand-held props.
3. Seated pose on chairs/benches, pointing gesture, two characters facing each other (side views) for dialogue beats.
4. Night variants of textures (lit windows), rain/snow/fog weather FX.
5. Scene library (save a scene's staging/camera as a preset), ad template gallery, backup/restore ZIP of a project.
6. Optional cloud providers behind explicit opt-in + cost confirmation (ElevenLabs) — not implemented.

## How to resume
```
cd C:\Users\felip\AI-Reels-Studio
powershell -ExecutionPolicy Bypass -File test.ps1          # sanity
start.bat                                                  # app on http://127.0.0.1:8777
.venv\Scripts\python.exe -m engine.pipeline <project> --only storyboard,stills --quality master   # CLI per step
```
