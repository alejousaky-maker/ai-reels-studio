# NEXT STEPS (resume here — read PROGRESS.md and DECISIONS.md first)

## Known limits / defects (honest list)
1. **Subjective quality is not auto-judged.** QA measures technical things; story, appeal, composition need the human
   rubric in the app. No Demo has been human-approved yet (Calidad tab → score + approve).
2. **Script quality from the local model is draft-level** (qwen2.5:7b wrote a weak hook in the test). Use "Aprobar guion
   antes de producir", edit the plan, or Claude-assisted mode. Try `ollama pull qwen3:8b` and compare.
3. **Environments**: 4 outdoor presets only (village square, market, street, park). No interiors, labs, ships, etc.
   Stories set elsewhere still render in a town square.
4. **Characters** are front-view cards (the template's side-view walk cycle `bodySide` is not wired into the director);
   walking characters slide with a stroll cycle. Hands can hold a product card but not interact with props.
5. **Night** preset reads as blue hour, not deep night; lanterns glow only as sprites.
6. **Durations follow the script**: the rule-based writer does not pad a short script to the requested length
   (Demo B asked 30 s, script gives 20.7 s). Ollama is told the target word count.
7. Demo C invalidation: last real measurement was 5/15 scenes re-rendered for a 2-scene edit; the boundary-rounding fix
   after it is unit-tested only (re-measure: duplicate Demo C, edit a beat, "Re-render solo lo cambiado").
   Any engine source change (even a comment) invalidates every cached scene by design.
8. Brand colour or environment changes invalidate all scenes (they change the shared world).
9. Captions are word-by-word only; no styled caption presets.
10. `on_event` FastAPI deprecation warning (harmless); move to lifespan handlers.
11. Ollama is called with keep_alive 0 (unloads right away) — not yet re-measured after that change.

## Next features by priority
1. Human review pass on Demo A/B/C in the app; fix whatever the reviewer flags (camera, staging, readability).
2. Side-view walking (`bodySide`) + prop interaction; per-character height variety; more outfits/roles.
3. Interior environment preset (room/shop interior/workshop) + a "lab" and a "harbour" preset.
4. Side-by-side sheet vs `references/` measured targets in the QA tab; per-scene stills on demand from the inspector.
5. Scene library (save a scene's staging/camera as a reusable preset) and ad template gallery.
6. Backup/restore of a project as ZIP (inputs + plan + storyboard + voice), cleanup of old render segments per project.
7. Optional cloud providers behind explicit opt-in + cost confirmation (ElevenLabs) — not implemented.

## How to resume
```
cd C:\Users\felip\AI-Reels-Studio
powershell -ExecutionPolicy Bypass -File test.ps1          # sanity
start.bat                                                  # app on http://127.0.0.1:8777
.venv\Scripts\python.exe -m engine.pipeline <project> --only storyboard,stills   # CLI per step
```
