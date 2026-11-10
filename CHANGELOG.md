# Changelog

## 0.11.0 — 2026-11-11 (megaproject docs: transitions, film looks, animated maps, new worlds)
- Scene transitions: `dissolve` (soft blurred crossfade), `zoom` (punch through the frame with zoom blur), `whip`
  (horizontal swipe with motion blur); whooshes follow them in the mix.
- Film looks per shot (`look`): sepia with vignette for the past, black-and-white archive, cool / warm grades.
- Motion: people and set pieces land with a squash-and-settle bounce when a new scene starts (not on clause cuts).
- Particles: money raining, confetti, spark bursts, drifting dust motes.
- Full-screen animated 2D scenes (`hud`): Manhattan map (toll jam / glowing night grid), Osaka Bay marker drop, the
  Americas with the Panama shortcut, spinning globe with converging shipping lanes, subway map, seabed cross-section with
  a sinking island, and the outro loop arrow.
- Captions moved to the lower third, smaller (80 px at 1080p), hidden on the outro, lower still over map scenes.
- New locations: subway tunnel under construction + marble station, produce warehouse, Panama-style canal (+1914 dig,
  drought), artificial island airport (+reclamation), suspension bridge with skyline; airport "aquarium" windows.
- New pieces: 18-wheeler, forklift, fruit pyramid, container ship, tugboat, steam shovel, mosquito, cement mixer, airliner,
  excavator, rock pile, tetrapods, departures board, escalator, pipe maze, money counter (on fire), blueprint (CANCELLED),
  subway map, ribbon, 1920s car. Wardrobe: hi-vis vest, apron, tutu, chef toque, police / pilot caps, beanie, night cap,
  ballet bun. Roles: engineer, accountant, driver, cop, chef, stocker, ballerina, tollman, pilot, sleeper, commuter.
  Extras can hold props (`extrasHolding`). Icons: newspaper, pickaxe, shovel, bagel, lettuce, pillow, wrench, cheque,
  trident, clipboard.
- Voice for these shorts: `am_fenrir*0.8+am_eric*0.2` (closest measured match to the new reference narrator).
- Shorts 20–23 (`docs/scripts/build_plans_20_23.py`, `STORIES_20-23.md`).

## 0.10.0 — 2026-11-11 (six GTA 6 shorts; new sets, wardrobe, screens and voice)
- Voice: Kokoro voice blends (`"am_eric*0.6+am_fenrir*0.4"`) chosen by measurement to sit close to the reference Short's
  narrator (energetic young male, ~3 words/s at speed 1.12). Listed first in the voice picker.
- New locations: stock-exchange trading floor (red ticker walls, screen desks), clinic exam room + hospital ward variant,
  data centre (rack rows, cold LEDs; "red" meltdown variant), stripped apartment ("empty": bare brick, one bulb).
- New set pieces: cryo tube, crash arrow, console (hot / flames, shakes, blasts off with `lift`), sofa / fridge / bed /
  dog house with SOLD stickers, big TV (painted game / text / no-internet), calendar, hospital bed, heart monitor,
  telephone pole, curved monitor, cardboard box, office desk with ringing phone, server rack, protest signs, ticker.
  Pieces can sit `on` the lead character, shake, and rise.
- Wardrobe: hoodie with drawstrings, lab coat + stethoscope + head mirror, esports jersey, patched tee, reading glasses,
  long wizard beard, backwards cap, propeller cap, mortarboard. Roles: streamer, broker, doctor, technician, esports,
  oldgamer, graduate, teen, officeguy, bathrobe, brokeguy, wife, capgamer. Faces: shattered-glass eyes, "> <" squint,
  giant sweat drop, sleepy. Characters can stand high (`y`), and the camera rises with them.
- Screens (`hud`): floating UI panel, progress bar that fills across the shot, police lights.
- Icons: thermometer, moth, cash stack, noodles, extinguisher, potato, car battery, diploma, sick note, router.
- Shorts 14–19 (`docs/scripts/build_plans_14_19.py`, `STORIES_14-19.md`).

## 0.9.0 — 2026-11-11 ("pro" cut: the picture follows every clause)
- Clause cuts: a beat can carry `shots` (each cuts 2 frames before its word `at` and overrides shot / place / cast / action /
  pieces / effects / HUD). The voice stays one natural sentence; the picture changes every 1.5–2.5 s like pro Shorts.
  Effects, reactions and the impact land in the clause that says their word; the ambience bed runs through clause cuts.
- Camera moves across a shot (`camMove`): push, pull (reveal), truck left/right, orbit, crane up, follow (tracks a walker),
  whip pan in. New angles: `extreme` (face-filling), `worm` (ground-level up-angle), `dutch` (tilted). Impact words punch
  the lens ~10 % tighter. Consecutive shots alternate camera sides.
- New actions: run, jump, panic (arms up + tremble), shrug, hands on hips.
- Screen layers (`hud`): camcorder REC frame with timecode, phone notification banner, breaking-news lower third, map chip.
- Captions are ON by default: big 1–2-word white captions with a thick outline, popping on each word, impact / effect words
  in yellow (can be switched off in the form or plan).
- `docs/scripts/plan_13b_gta6_pro.json`: the GTA short re-cut with the new grammar (25 shots instead of 15).

## 0.8.0 — 2026-11-11 (GTA 6 short; livelier cast, richer backdrops)
- Characters move more: standing/sitting people breathe and sway, heads bob, every reaction lands with a small hop; new arm
  poses `up` (stretch / cheer, wiggling) and `point` (actions stretch, cheer, point). New faces: starry eyes, bloodshot
  gamer stare. Gaming headset, striped pajamas with slippers.
- Backdrops: original painted wall posters (synthwave city, sports car, palm sunset, arcade, rocket); bedroom with posters,
  shelf and curtains (day window variant); a gamer room (RGB strips, big TV with a painted game, console with a blue LED);
  a high street of brick shops with shutters down and red "CLOSED UNTIL FURTHER NOTICE" neons; suburb "tvglow" variant.
- Pieces: rolling tumbleweed (spin), traffic light, pizza/energy-can tower (scaled per beat). Icons: controller, can, pizza.
- Short 13 "The Day the Earth Stood Still" (`docs/scripts/STORY_13_gta6.md`, `plan_13_gta6_release.json`).

## 0.7.0 — 2026-11-11 (shorts 07–12)
- Scripts + plans for 07–12 (Emu War, Caesar vs the pirates, Cobra Effect, AirPods, running map, wedding slideshow);
  plans generated by `docs/scripts/build_plans_07_12.py`.
- An emu cast member (own drawing, runs with the gait cycle), Australian slouch hats, pith helmet, laurel wreath + toga,
  pirates (stripes, bandana, eye patch), headband, bride's veil, bow tie; bob haircut for long hair (no hood look).
- Locations: outback (wheat field, fence, dam), ship cabin, bedroom, kitchen, banquet hall (chandeliers, round tables).
- Pieces with text labels: Lewis gun, truck, reward booth, "COBRA FARM" crates, snakes, chalkboard, projector screen
  ("photos" / "hallway" still), finish tape with suitcases. Icons: snake, coins, mic, earbuds, GPS map, suitcase,
  DEFEAT folder, plane ticket.
- Cast look overrides per plan (skin, hair, sunglasses) keep one person recognisable across outfits.

## 0.6.0 — 2026-11-10 (megaprompt shorts: history, myth and modern stories)
- Six new shorts in the house formula from the user's megaprompts (scripts in `docs/scripts/STORIES_*.md`, plans `plan_0*.json`).
- 13 new locations: beach, ocean (ship deck), troy (wall, gate, variant "breach"), cave (variant "open"), throne; apartment,
  bathroom, office, hotel, airport, suburb, lake, resort.
- Set pieces (painted lit cards): horse, ship, galley, chalkboard, sheep, tent, scale, boxes, car, van, poster; placed per beat
  (behind / left / right / far / front, optional move), the cast steps aside so side pieces stay in frame.
- Wardrobe: bronze crested helmets, crown, explorer hat, bucket hat, sun hat, long hair, beard, necktie, sunglasses, vest pockets,
  rope bands; a one-eyed giant at 2.6x scale (camera steps back and aims at his eye line).
- Icons: map, globe, wine, spear, stake, phone, tablet, wifi, key, camera, card, fish, receipt, box. New action `fall`.
- Per-beat camera `spot`; outdoor golden scenes in the new places are front-lit; rooms cap the lens distance.
- Graphics option full (default, the Demo A look) / simple.

## 0.5.0 — 2026-11-09 (the Demo A formula)
- New reference video in the Demo A formula: "The School That Couldn't Stop Laughing" (1962 Tanganyika laughter epidemic, EN,
  af_heart voice, Wikipedia-checked facts, one recurring cast, classroom -> village, day -> golden -> night -> golden arc).
- **Graphics** option: "full" (the Demo A look, default) or "simple" (no lens blur / bloom, MSAA 2, 2K shadow map,
  4 clouds, sparse set dressing, at most 2 background extras, everything sharp). Measured at Master 2K on 300 frames:
  9.9 fps full vs 10.3 fps simple (concurrency 5: 10.5 vs 10.1) - the GPU passes are not the bottleneck (CPU capture +
  encode is), so the Demo A look costs no extra render time and stays the default.

## 0.4.0 — 2026-11-09 (idea → coherent story → matching picture)
- **Research**: the topic is looked up on Wikipedia in the video's language (only the topic is sent; offline = skipped);
  the script must use only facts from that source; verified claims link to it (`script/SOURCE.md`).
- **3-stage script**: writer (simple story fields + worked example + target audience) → critic (relevance / coherence /
  hook scores, forced rewrites of the flagged sentences, checked against the source) → deterministic director.
- **Sentence-driven direction**: each scene's place, time, who, emotion, objects and events come from its own sentence
  (word-start keyword matching: "cubriendo" no longer reads as "riendo"); at most 3 places; side trips return to the main
  place; tragic topics never get grins; "ola/inundación/flood" → liquid wave (brown for molasses/mud/chocolate),
  "estalló/colapso/explosion" → impact; nothing the sentence doesn't name is invented.
- **Audience** field ("¿Para quién es?"); coherence scores shown in the Guion tab and in QUALITY_REPORT.md.
- **Re-dirigir escenas**: rebuild every scene's visuals from the current narration without touching text or voice
  (only changed scenes re-render).
- Duration fit both ways: short narration re-voiced slower (≥0.88×), long narration faster (≤1.1×), gap reported.

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
