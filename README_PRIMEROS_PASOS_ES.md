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

## 3a. Cómo consigue que el vídeo tenga que ver con tu idea
1. **Investiga** tu tema en Wikipedia (en tu idioma; solo envía el tema) y escribe **solo con esos datos**.
2. **Escribe** la historia pensando en tu **público objetivo** (campo «¿Para quién es?»).
3. **Revisa** el guion con un crítico: puntúa relación con tu idea, coherencia y gancho, y reescribe las frases malas.
4. **Dirige** cada escena a partir de su frase: lugar, hora, quién aparece, emoción, objetos y efectos (una ola si la
   frase habla de una ola, un impacto si algo estalla). Nada que la frase no diga.
En la pestaña **Guion** ves las puntuaciones. Si cambias frases a mano, pulsa **🎬 Re-dirigir escenas** y las imágenes
se rehacen para seguir al texto (sin cambiar la voz).

## 3b. Imágenes y guiones desde tus prompts
- **Imágenes**: menú **Imágenes** → escribe lo que quieres ver («una niña sorprendida con un café en el puerto al
  atardecer») → formato (9:16, 1:1, 4:5, 16:9) y variantes → **Generar imagen**. Sale un PNG 2K en el mismo estilo de
  los vídeos, en segundos. «Ver cómo lo entiende» te deja cambiar lugar, luz, plano, personajes y objetos antes de generar.
  Las imágenes quedan en `images\<fecha>\img_1.png` y en la galería (Descargar / Editar).
- **Solo guion**: Crear vídeo / guion → «📝 Solo guion» → escribe la idea → **Escribir guion**. Obtienes el guion por
  escenas y FACTS.md para revisar y editar (pestaña Guion). Cuando te guste, pulsa **Producir todo** y se hace el vídeo.
- Si escribes la idea en español, el idioma cambia solo a español (puedes forzarlo en el selector).

## 4. Aprobar el guion, previsualizar, corregir una escena, exportar
- Para revisar antes de producir: en Crear vídeo → Opciones avanzadas → «Aprobar guion antes de producir».
  Revisa en la pestaña **Guion** y pulsa **Producir todo**.
- **Storyboard / timeline**: clic en una escena → cambia plano, luz, música, personajes, expresiones, texto →
  **Guardar y regenerar esta escena**. Solo se vuelven a renderizar las escenas que cambiaron (Deshacer/Rehacer disponibles).
- **Preview rápido**: Producción → «Ejecutar un paso concreto» → Preview Draft (540×960).
- **Exportar**: Vídeo y exportar → ZIP (MP4, voz limpia WAV, mezcla, SRT, guion, FACTS, storyboard, informe, póster).

## 4b. Cambiar el lugar de una escena
- Storyboard / timeline → escena → **Lugar de esta escena**: plaza, mercado, calle, parque, **interior** (habitación o, con
  marca, tu cafetería con mostrador y cartel) o **puerto con faro**. Guardar y regenerar: solo se re-renderiza esa escena.

## 5. Cambiar idioma, narrador, música y calidad
- Idioma y calidad: en Crear vídeo. Narrador y velocidad: pestaña **Voz y audio** → «Generar voz + tiempos».
- Música: Voz y audio → nivel bajo la voz (dB) o desactivarla → «Remezclar y volver a exportar».
- Calidad: por defecto **Master 2K 1440×2560**; Draft (rápido) y Standard 1080×1920 para pruebas (Producción → pasos concretos).
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
