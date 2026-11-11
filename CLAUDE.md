# AI Reels Studio — guía para Claude

App local de Windows que convierte una idea/guion en un Short vertical: guion → verificación → storyboard → voz local (Kokoro)
→ escenas 2.5D (Remotion + three.js, personajes "bean-stickman" con tinta) → mezcla −14 LUFS → QA → MP4.
El usuario habla español: respóndele en español. La narración de los vídeos es en inglés.

## Reglas del usuario (obligatorias)
- **Solo genera/renderiza vídeos cuando el usuario lo pida y sobre lo que pida.** Guiones, planes y fotogramas de prueba sí.
- **Calidad siempre al alza**: mejorar fondos, más movimiento en personajes y objetos, fondos llamativos pintados por nosotros
  (sin logos ni fotos con copyright), que TODO lo que dice el guion se vea en pantalla.
- **Montaje "pro"** (referencias: youtube.com/shorts/e9NoHjAXYIY y youtube.com/shorts/uQ5XctzP-2M): un plano por frase
  o subfrase (cada 1,5–3 s, `shots` dentro de cada beat), la cámara siempre se mueve (`camMove`), ángulos que cuentan la
  emoción (extreme / worm / dutch), transiciones (dissolve / zoom / whip), subtítulos en el tercio inferior.
  Ver `docs/FORMULA.md`.
- **Personajes = stickmen 2D con cabeza BLANCA** (nunca tonos de piel), caras muy expresivas como RicksClips3000
  (shorts 5WMQhPObNqQ, Mz72MuPgnGY, VKsamN3Fk4U): párpados a media asta, ceja levantada, boca que habla (`talk`), parpadeo,
  cejas que se mueven, se sientan en sillas (`sitchair`), caminan bien. Voz estilo RicksClips: `am_eric*0.7+am_fenrir*0.3`.
- **Gente de fondo SOLO si el prompt de la historia lo pide** (multitudes, "la gente", una escena concurrida en el texto). Nunca
  la añadimos por nuestra cuenta, ni siquiera en calles o tiendas: `plan.crowd` es `false` por defecto; activarla con `crowd: true`
  (plan o plano) o `extras` solo cuando el texto lo pida.
- **Fondos pintados por IA en local** (ComfyUI + FLUX.1-schnell en `tools/ComfyUI`, `plan.backdrops = "ai"`): ver `engine/imagegen.py`.
- Mantener el estilo aprobado (Demo A / "The School That Couldn't Stop Laughing"): bean-stickmen con cabeza blanca, tinta negra.
- Comprobar los datos: lo exagerado o cómico va en `verifiedClaims` como `fiction`/`uncertain`; corregir cifras falsas y avisar.
- Voz: la que el usuario pida. Mezclas Kokoro permitidas, p. ej. `am_fenrir*0.8+am_eric*0.2` (narrador masculino enérgico).
- Seguridad: API solo en 127.0.0.1:8777. **El puerto 8765 es otra app del usuario (Shorts Factory): no tocarlo.** Nada de
  secretos en el repo, nada de shell=True con texto del usuario, no publicar ni subir vídeos a redes, no gastar dinero, no
  aceptar licencias ni activar servicios externos sin permiso. ElevenLabs es opcional y está apagado.
- No edites el motor (`engine/remotion/src`) mientras haya un render en marcha: el bundle cambiaría a mitad del trabajo.

## Render con Blender (desde 2026-11-11, decisión del usuario: Blender modela y renderiza todo)
- Blender 4.5 LTS portátil en `tools/blender` (no está en git; bajar `blender-4.5.16-windows-x64.zip` de blender.org y verificar su sha256).
- Plan con `renderer: "blender"`: `step_blender` (pipeline.py) renderiza cada escena del storyboard con `engine/blender/scene.py`
  (personajes `rig.py`, decorados `sets.py`, materiales toon + tinta `look.py`, caras `faces.py`) en
  `engine/remotion/public/blender/<pid>/<escena>/f_#####.jpg`; Remotion compone encima transiciones, subtítulos, HUD y audio.
- Personaje (referencia del usuario): cabeza grande blanca más ancha que el torso y asomando por encima, torso píldora estrecho,
  brazos/piernas muy finos negros, contorno de tinta en todo. La tinta no proyecta sombras (si no, todo queda en sombra).
- No usar volumen en el mundo (se traga el sol): la bruma va solo dentro de las habitaciones.
- Producir por CLI: `.venv\Scripts\python.exe -m engine.pipeline <pid> --quality master --only blender,render,mix,mux,qa`.

## Cómo se trabaja
- Instalar (primera vez, sin admin): `powershell -ExecutionPolicy Bypass -File install.ps1`. Arrancar: `start.bat`
  (backend FastAPI en 127.0.0.1:8777 + frontend compilado). Tests: `.venv\Scripts\python.exe -m pytest tests -q`.
- Typecheck del motor: `cd engine\remotion; ..\..\tools\node\node.exe node_modules\typescript\bin\tsc --noEmit -p .`
- Planes de los vídeos: `docs/scripts/build_plans_*.py` generan `plan_*.json` + `STORIES_*.md`. Para producir:
  `POST /api/projects` (autostart false) → `PUT /api/projects/{pid}/plan` → `POST /api/projects/{pid}/jobs`
  `{kind: "produce", params: {quality: "master", voice, speed}}`. El MP4 queda en `projects/<id>/output/latest_master.mp4`.
- Fotogramas de prueba: `tools\node\node.exe engine\remotion\scripts\engine.mjs stills <storyboard.json> <prefijo> <frames> <escala>`.
- Mapa del código: `engine/story/` (schema Pydantic, director → storyboard, presets de roles/escenarios), `engine/remotion/src/videos/story/`
  (world.ts escena 3D, env*.ts escenarios, pieces.ts objetos, products.ts iconos, StoryShort.tsx postproceso, transiciones,
  subtítulos y capas HUD, mapscenes.tsx mapas 2D animados), `engine/remotion/src/videos/bridge/toon.ts` (dibujo de personajes),
  `engine/audio/` (TTS, alineación, mezcla), `app/` (backend + frontend). Cambios por versión en `CHANGELOG.md`.

## Estado (2026-11-11)
- Hechos: shorts 01–18 (incluidos los de GTA 14–18).
- Pendiente: re-renderizar el 19 (GTA blackout, se cortó por un apagado) y producir los 4 megaproyectos 20–23
  (metro de la 2ª Avenida, comida de Manhattan, canal de Panamá, aeropuerto de Kansai) con la voz `am_fenrir*0.8+am_eric*0.2`
  a velocidad 1.15, después de revisar sus fotogramas.
