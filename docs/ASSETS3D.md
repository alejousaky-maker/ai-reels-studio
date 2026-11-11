# 3D Asset Library (Poly Haven) + motor de físicas

## Qué hay
| Pieza | Archivo | Qué hace |
|---|---|---|
| Cliente Poly Haven | `engine/assets/polyhaven.py` | API oficial (`api.polyhaven.com`), User-Agent propio, reintentos. Catálogo local (`models/polyhaven/catalog.json`, se refresca cada 24 h), búsqueda sin red, descarga bajo demanda con todas las dependencias (texturas), comprobación de tamaño + MD5, caché y registro (`registry.json`: medidas reales en m, formato, resolución, licencia CC0, crédito, URL). HDRIs en `models/polyhaven/hdri/`. |
| Física | `engine/blender/physics_rb.py` | Cuerpos rígidos reales de Blender (Bullet): gravedad, colisiones, rebote, fricción, rotación, amortiguación, impulsos, colisionadores simplificados (BOX/SPHERE/CONVEX_HULL/MESH). Hornea la simulación a keyframes, vuelta al origen animada, bucles y verificación (penetración en el suelo, NaN, saltos bruscos). |
| Escena | `engine/blender/physics_scene.py` | Spec JSON → escena Blender: HDRI + sol, suelo, modelos importados a escala real, presets, cámara que sigue y orbita al final, profundidad de campo, render EEVEE. |
| Orquestador | `engine/physics.py` | Descarga lo que falte, lanza Blender, codifica MP4 H.264 (yuv420p, faststart), `report.json`, `credits.txt`, une clips, texto → spec. |
| API | `app/backend/assets3d.py` | `/api/assets3d/search`, `/categories`, `/downloaded`, `POST /import`, `/presets`, `POST /physics` (trabajo en la cola), `/clips/{job}/video`. |
| UI | `app/frontend/src/views/Assets3D.tsx` | Pestaña **3D Asset Library**: buscar, filtrar, miniaturas, importar por enlace, modelos descargados, constructor de escena (masa, rebote, fricción, altura, gravedad, preset, volver al origen), previsualizar y generar, o describir la escena en texto. |

## Presets
FALL_AND_BOUNCE, FALL_AND_RESET, STACK_COLLAPSE, DOMINO_CHAIN, ROLL_AND_STOP, SPIN_AND_DROP, OBJECT_IMPACT,
EXPLOSION_IMPULSE, FLOAT_AND_LAND, RETURN_TO_ORIGIN, LOOPING_PHYSICS, CAMERA_ORBIT (`camera.orbit_end`), SLOW_MOTION_IMPACT,
más IMPULSE / HOLD para lanzar, empujar o sujetar un objeto hasta un fotograma.

## Comandos
```
.venv\Scripts\python.exe -m engine.assets.polyhaven sync                 # índice de modelos
.venv\Scripts\python.exe -m engine.assets.polyhaven search "wooden chair"
.venv\Scripts\python.exe -m engine.assets.polyhaven get https://polyhaven.com/a/rubber_duck_toy
.venv\Scripts\python.exe -m engine.physics demo work\physics\demo        # demo de aceptación (10 s, 9:16, 30 fps)
.venv\Scripts\python.exe -m engine.physics spec mi_escena.json salida\
.venv\Scripts\python.exe -m engine.physics text "a ball falls from a table and hits some boxes" salida\
.venv\Scripts\python.exe -m engine.physics join largo.mp4 a.mp4 b.mp4 c.mp4 d.mp4    # 4 × 10 s = 40 s
.venv\Scripts\python.exe -m pytest tests\test_assets3d.py -q
```

## Spec
```json
{"format": "vertical", "fps": 30, "seconds": 10, "hdri": "studio_small_09", "gravity": 9.81,
 "objects": [{"id": "table", "asset": "wooden_table_02", "position": [0,0,0], "body": "passive", "shape": "MESH"},
             {"id": "ball", "asset": "https://polyhaven.com/a/dirty_football", "position": [0.2,0,2.5], "body": "active",
              "shape": "SPHERE", "mass": 0.43, "restitution": 0.62, "friction": 0.6}],
 "events": [{"preset": "IMPULSE", "object": "ball", "params": {"release": 24, "velocity": [0.55,0.05,-0.4]}},
            {"preset": "RETURN_TO_ORIGIN", "object": "ball", "params": {"at": 215, "frames": 60}}],
 "camera": {"follow": ["ball"], "orbit_end": true}}
```
`position` es la base del objeto (z = altura del suelo sobre la que se apoya). `format: "horizontal"` da 1920×1080; `fps: 60` también vale.

## Licencias
Todo lo de Poly Haven es CC0; aun así cada clip lleva `credits.txt` ("3D models and HDRIs: Poly Haven (polyhaven.com), CC0").
Los modelos no se guardan en git (`models/` está ignorado): se descargan la primera vez que se usan.

## Límites conocidos
- Solo se importa glTF (el formato que Poly Haven da para todos sus modelos); FBX/.blend no se han probado.
- El texto → escena es un analizador de palabras clave (en/es): entiende objetos y verbos comunes y dice en `notes` qué sustituyó.
- Sin cuerpos blandos, telas ni fluidos.
- Los Shorts con personajes (pipeline `scene.py`) siguen usando su integrador propio de caídas; el módulo Bullet se usa en los clips de física.
- La previsualización de la UI es un render "draft" (50 % de resolución), no un visor 3D en tiempo real.
