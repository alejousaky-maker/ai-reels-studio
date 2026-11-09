# AI Reels Studio — Primeros pasos (sin programar)

## 1. Instalar (una sola vez, necesita internet)
1. Abre la carpeta `C:\Users\felip\AI-Reels-Studio`.
2. Clic derecho en **`install.ps1`** → «Ejecutar con PowerShell». Tarda unos minutos la primera vez.
   - Instala dentro de la carpeta: Node portable, Python 3.12, el motor de render, los modelos 3D CC0 y la voz Kokoro.
   - No necesita permisos de administrador. Si falta FFmpeg lo instala para tu usuario y te pide cerrar y repetir.
3. Al final verás «Install complete». Puedes repetirlo cuando quieras: lo que ya está, lo salta.

**Necesita internet solo la primera vez** (descargas). Después todo funciona **sin conexión**: guion sin IA o con IA
local (Ollama), voz, render, música, mezcla y QA corren en tu PC.

## 2. Abrir la app
- Doble clic en **`start.bat`**. Se abre el navegador en `http://127.0.0.1:8777`.
- Deja abierta la ventana negra; ciérrala (o Ctrl+C) para apagar la app. Nada queda funcionando en segundo plano.

## 3. Tu primer Reel con una frase
1. Menú **Crear vídeo** → escribe la idea (p. ej. «Por qué en 1518 Estrasburgo no podía dejar de bailar»).
2. Elige tipo, estilo e idioma → **Crear vídeo**.
3. Se abre el proyecto: verás los pasos (guion → voz → storyboard → fotogramas → render → mezcla → QA) con su barra.
4. Al terminar, pestaña **Vídeo y exportar** → reproducir o descargar.

> Si no tienes IA local (Ollama), abre «Opciones avanzadas» y pega tu propio guion (una o dos frases por escena),
> o elige «Claude asistido»: la app te prepara un texto para pegar en Claude y luego pegas el JSON que te devuelva.

## 4. Aprobar el guion, previsualizar, corregir una escena, exportar
- Para revisar antes de producir: en Crear vídeo → Opciones avanzadas → «Aprobar guion antes de producir».
  Revisa en la pestaña **Guion** y pulsa **Producir todo**.
- **Storyboard / timeline**: clic en una escena → cambia plano, luz, música, personajes, expresiones, texto →
  **Guardar y regenerar esta escena**. Solo se vuelven a renderizar las escenas que cambiaron (Deshacer/Rehacer disponibles).
- **Preview rápido**: Producción → «Ejecutar un paso concreto» → Preview Draft (540×960).
- **Exportar**: Vídeo y exportar → ZIP (MP4, voz limpia WAV, mezcla, SRT, guion, FACTS, storyboard, informe, póster).

## 5. Cambiar idioma, narrador, música y calidad
- Idioma y calidad: en Crear vídeo. Narrador y velocidad: pestaña **Voz y audio** → «Generar voz + tiempos».
- Música: Voz y audio → nivel bajo la voz (dB) o desactivarla → «Remezclar y volver a exportar».
- Calidad: Draft (rápido), Standard 1080×1920, Master 2K 1440×2560 (Producción → pasos concretos).
- Tu propia voz: Voz y audio → importar WAV/MP3 (solo voces tuyas o con permiso).

## 6. Añadir un cliente y su logo
- **Clientes / marcas** → nombre, colores, lema, CTA y **afirmaciones aprobadas** (los anuncios solo dirán eso).
- Logo y fotos: **Biblioteca** → Importar, eligiendo el cliente y escribiendo la licencia/derechos.
- En Crear vídeo, tipo «Anuncio» → elige el cliente: el cartel de la tienda usa su nombre, colores y lema.

## 7. ¿Se está usando la RTX?
- **Ajustes y diagnóstico** muestra tu GPU, VRAM y uso. Durante un render, el uso y la VRAM suben
  (medido aquí: de ~1,2 GB a ~4,3 GB de VRAM). También: Administrador de tareas → Rendimiento → GPU.

## 8. Dónde están los vídeos y cómo limpiar espacio
- Vídeos: `projects\<proyecto>\output\` (el más reciente también como `latest_standard.mp4`).
- Ajustes → Almacenamiento → **Limpiar caché segura**: borra solo temporales de esta app (nunca tus proyectos
  ni carpetas de otros programas).

## 9. Errores habituales
| Mensaje | Qué hacer |
|---|---|
| «Falta el modelo de voz Kokoro» | Ejecuta `install.ps1` otra vez, o importa tu voz. |
| «No hay IA local» | Escribe el guion tú, usa Claude asistido, o instala Ollama y `ollama pull qwen3:4b`. |
| «Disco lleno» | Ajustes → Limpiar caché; o mueve el proyecto a otro disco. |
| «Falló el motor de render» | Pulsa Reintentar (las escenas ya hechas se reutilizan). Si se repite, mira Ajustes → Registros. |
| «interrupted» | Cerraste la app con un trabajo en marcha: pulsa Reintentar. |
| QA «true peak» o «audio tracks» | Pulsa «Remezclar audio»; la app vuelve a medir y corrige el pico. |
| La app no abre | Ejecuta `diagnose.ps1` y lee `logs\diagnostics.json` y `logs\backend.log.err`. |
