# PROGRESS — real, measured state (2026-11-09)

## v0.4 update — idea → coherent video
- Test with the user's own idea "La gran inundación de melaza de Boston en 1919", audience "jóvenes de 16 a 25", ES, 60 s:
  Wikipedia source found (es) → qwen3:8b writer + critic (relevance 8/10, coherence 9/10, hook 7/10, 9 sentences
  rewritten against the source) → 9 scenes, 78 % visually driven by their sentence → Master 2K 73.5 s, QA PASS.
  `projects/la-inundaci-n-de-melaza-de-bosto-7dd13c/output/latest_master.mp4`. Facts cross-checked with the source:
  56 km/h, 21 dead / 150 injured, Boston Elevated Railway, rivets — all match; two overstatements remain
  ("hasta dos metros" vs 2-4 m; "calor extremo" vs an unusually mild day) → human review still needed.
- Bugs found and fixed during the test: substring keyword matches ("cubriendo"→"riendo" = laughing in a tragedy),
  writer objects invented (music note), side trip indoors never returning, bird's-eye shots inside rooms.
- pytest 29/29.

## v0.3 update (same day, later session)
- **Master 2K default.** Master renders, all technical QA PASS incl. the new render-vs-control-stills check:
  - Lighthouse demo `projects/lighthouse-daymarks/output/latest_master.mp4` — 1440×2560, 57.8 s, harbour + interior + night, 6.9 fps (251 s).
  - Demo A `projects/demo-dancing-1518/output/latest_master.mp4` — 1440×2560, 63.6 s (338 s render).
  - Demo C `projects/demo-c-variant-of-demo-a-a31d2d/output/latest_master.mp4` — 1440×2560, 64.6 s (338 s render).
  - Demo B master from v0.2: `projects/caf-lumen-anuncio-71668f/output/latest_master.mp4` (rendered before the crossfade-world fix;
    its scenes share one location, so the bug could only change culling there — re-render to be certain).
- **Images from prompts**: 8 test images from 4 Spanish prompts, ~10 s per image incl. local AI; PNG 1440×2560 / 1440×1440 /
  1440×1800 / 2560×1440 in `images/`. Hybrid reader verified (girl→kid, no invented bread, dancing crowd, light bulb idea).
- **Script only**: Spanish prompt → 8-9 beat plan + FACTS in 20 s (qwen2.5:7b) / 120 s (qwen3:8b, pulled today). Both are
  draft quality (weak or playful-false hooks): human review / Claude-assisted mode recommended.
- Bug found by QA and fixed: after a crossfade, a long render kept the previous scene's world (wrong location in b05/b12).
- The user's own app runs ("THE GREAT MOLASSES FLOOD", "la segunda guerra mundial") showed empty scenes and monotone
  shots from qwen2.5 → plan normaliser added (those two projects were made before it; re-run "Producir todo" to apply).
- Tests: `test.ps1 -Render` all groups passed; pytest 25/25.

Machine: Windows 11 Pro 26200 · RTX 3060 **12 GB** (driver 595.97) · Ryzen 5 5500 (12 threads) · 31.9 GB RAM · C: 930 GB (≈390 GB free).

| Phase | Status | Evidence (command → result) |
|---|---|---|
| 0 Diagnosis + bootstrap | **DONE** | `diagnose.ps1` → logs/diagnostics.json (GPU/VRAM, RAM, disk, tools, models). `install.ps1` re-run is idempotent: 12 s, exit 0. Node 24.22.2 + MinGit portable, Python 3.12.14 venv (uv), pinned lockfiles. |
| 1 First real render | **DONE** | `projects/demo-dancing-1518/output/teaser_video.mp4`: H.264 1080×1920, 30 fps, 390 frames, 13.0 s; blackdetect/freezedetect clean. 40.5 s render (9.6 fps). |
| 2 Voice + sound | **DONE** | Kokoro EN/ES local; faster-whisper CPU alignment (15/15 sentences "whisper"); original score + SFX; mix −14.01 LUFS. Final MP4: AAC 48 kHz stereo, single audio track, TP ≤ −1 dBTP after the AAC fix. |
| 3 Visual app | **DONE** | FastAPI on 127.0.0.1:8777 + React UI (10 screens), jobs persisted in SQLite, progress polling, cancel kills process tree, retry, errors explained. UI exercised in the browser pane; the user ran "Producir todo" from the UI and it completed (15/15 scenes reused). |
| 4 Idea → video | **DONE** | Demo A 63.7 s (55-70 s target) end-to-end; Ollama plan generation tested (qwen2.5:7b, 44.5 s, valid schema); rule-based + Claude-assisted modes; script approval mode; per-beat editor; versions/snapshots. |
| 5 Advanced quality | **PARTIAL** | Done: measured QA (13 checks), control stills (start/mid/end per scene) + contact sheets, per-scene luma stats vs reference, human rubric + approval gate, selective regeneration (Demo C), Master 2K export. Not done: automatic visual judgement (no vision model), side-by-side vs reference frames in the UI, 5 file-owner reviewer agents as processes. |
| 6 Commercial | **PARTIAL** | Done: client brand kits with approved claims, isolated client asset folders, validated imports with license, ad template (shop sign/awning/products/CTA), variants (N projects with different seeds), duplicate, archive, ZIP export, cost shown as 0 € local. Not done: scene library browser with reusable saved scenes, ad template gallery, backup/restore UI. |

## Videos produced (all original)
| Demo | File | Spec | QA |
|---|---|---|---|
| A — The Town That Couldn't Stop Dancing (EN) | `projects/demo-dancing-1518/output/the-town-that-couldn-t-stop-dancing_standard_v3.mp4` (latest = `latest_standard.mp4`) | 1080×1920, 63.7 s, H.264 + AAC 48 kHz | technical PASS; −14.0 LUFS; human review pending |
| B — Café Lumen ad (ES, fictional business) | `projects/caf-lumen-anuncio-71668f/output/caf-lumen-anuncio_standard_v2.mp4` and `..._master_v1.mp4` | 1080×1920 and **1440×2560** (2K), 20.7 s | technical PASS (both) |
| C — variant of A (edited hook + scene light) | `projects/demo-c-variant-of-demo-a-a31d2d/output/latest_standard.mp4` | 1080×1920, 64.6 s | technical PASS |
| Teaser smoke test | `projects/demo-dancing-1518/output/teaser_video.mp4` | 1080×1920, 13 s, silent | — |

## Measured performance
- Standard 1080×1920: 9.6 fps (single 13 s composition); 6.2-7.2 fps for 64 s shorts rendered as per-scene segments
  (275-330 s total). Master 2K: 6.7 fps (620 frames in 92.8 s). Draft smoke test 540×960: 5.2 fps (R3F keeps a ≥1080 buffer).
- GPU used through ANGLE: VRAM 1.2 → 4.3 GB, utilisation 15-40 % during renders (CPU-side capture/encode is the limit).
- TTS 63 s narration ≈ 21 s; alignment ≈ 12 s (CPU int8); mix ≈ 20 s; 45 control stills ≈ 140 s.
- Cache: identical re-run of Demo A → 0 rendered / 15 reused. Demo C edit (hook text + one scene's light) →
  5 rendered / 10 reused, 101 s instead of ~300 s (before the last guard fix; unit test now shows all later scenes identical).

## Tests
- `test.ps1 -Render` → **all groups passed**: pytest 19/19 (storyboard frame contract, 9:16 staging, word-anchored
  reactions, time-shift invariance, schema rejection, TTS normalisation, limiter ceiling, ducking, score, QA detectors on
  good / 2-audio-track / black videos, API: persistence across restart, path traversal, upload validation, clients,
  failed-job recording, retry, cancel, approval gate), engine `tsc`, UI typecheck+build, real GPU render smoke test (ffprobe h264 540×960 390 frames).
