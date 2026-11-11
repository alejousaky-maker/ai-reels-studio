# Estudio de estilo: RicksClips3000 (20 últimos Shorts, analizados fotograma a fotograma)

Material de estudio, no para copiar: los 20 vídeos y sus subtítulos están en `work/reference/ricksclips/` (privado, no se
sube a git ni se reutiliza). Las cifras salen de decodificar **todos los fotogramas** (30 fps) con FFmpeg + numpy
(`work/reference/ricksclips_study/stats.json`, hojas de planos `*_grid.jpg`). Fecha del estudio: 2026-11-11.

Vídeos: e9NoHjAXYIY, QlDPMzGmYac, HxqtHI62otM, 7xS87iActkU, Mz72MuPgnGY, 5WMQhPObNqQ, ZDy3xXA2iHk, LC8hYwUZ-kU,
t3OXkhlI6NQ, DEe0iKH4KIw, GM9UKnZ6JFw, VKsamN3Fk4U, 0m6G8pDtzNs, nzbkkEZFM8g, VS1Z_Q-Klt8, lnYLIWP2l-I, jpFJ8Z_F-qU,
PLe2Gu3FDuA, _sUAXTvJquk, eQR3pgMiUF0.

## 1. Cifras medidas (media de los 20)

| Métrica | RicksClips | Nosotros (31–33) | Qué significa |
|---|---|---|---|
| Duración | 35–78 s, la mayoría 57–65 s | 49–52 s | Él llena el minuto |
| Palabras | ~220 (164–300) | 140–160 | Guion más denso |
| Velocidad de voz | **3,8 palabras/s** | ~2,8 | Narra rápido, sin pausas muertas |
| Palabras por frase | ~15 | ~12 | Frases largas encadenadas con "and", "but", "so" |
| Primera palabra | **0,0 s** | ~0,3 s | Empieza a hablar en el primer fotograma |
| Voz → final | 0,3–1,2 s | outro de 2–3 s con "FOLLOW" | **No hay outro ni CTA**: el vídeo termina con la frase |
| Cortes duros | **1,2 por minuto** | 10–15 por minuto | Casi nunca corta en seco |
| Cambios de plano | **12 por minuto (uno cada ~4 s)** | uno cada 2–3 s | Menos planos, cada uno más trabajado |
| Movimiento de cámara | siempre (diferencia media entre fotogramas ≈ 4/255) | a ratos | La cámara nunca está quieta |
| Brillo medio | 114/255 | parecido | Imagen media-clara |
| Contraste | 46 | menor | Sombras duras + zonas muy iluminadas |
| Zona en sombra profunda | ~11 % del cuadro | ~3 % | Hay negros de verdad |
| Centro / bordes | **centro 31 % más brillante** | ~10 % | Viñeta + sujeto iluminado |

## 2. Cómo cambia de plano (lo más importante)

- **Casi no hay cortes.** Cada escena es un **movimiento de cámara continuo** de 3–6 s por un decorado 3D grande:
  travelling hacia delante sin parar (del barco lejano hasta la bandera de la calavera), grúa, órbita lenta, seguir a un objeto.
- **Transición motivada**: la cámara **sigue algo** (el aceite que cae del cazo, un coche, un billete) y, mientras se mueve,
  la imagen **se funde** (0,3–0,5 s) con la escena siguiente que ya viene moviéndose en la misma dirección. Parece un único plano.
- Los pocos cortes duros caen en un golpe del guion (un choque, un frenazo, un "¡pum!").
- Ángulos: picados, contrapicados, holandeses (barco inclinado), plano cenital tipo mapa para "en todo el país" (granjas
  vistas desde el aire), plano detalle de objeto (bote de pintura, cronómetro) a pantalla completa.
- Una idea por plano: cada ~4 s (≈ una frase de 15 palabras) hay un encuadre nuevo que **muestra literalmente** lo que dice.

## 3. Luz, color y sombra

- **Un sol duro** con sombras proyectadas nítidas; en interiores, **haces de luz por la ventana** que dibujan un rectángulo
  en la pared / suelo (la cárcel), y lámparas que crean charcos de luz.
- **Color = historia**: cada escenario tiene una paleta dominante (cárcel gris-azulada que se vuelve rosa intenso; tormenta
  todo azul profundo con rayos de luz; cocina naranja cálida con farolillos; carretera de día muy saturada; noche azul con
  luces de guirnalda cálidas). El cambio de paleta marca el giro del guion.
- **Viñeta y sujeto iluminado**: el centro siempre más claro; esquinas oscuras.
- Profundidad de campo: fondo desenfocado en planos cortos; en los amplios todo nítido.
- Efectos atmosféricos: lluvia, carretera mojada con reflejos, olas gigantes, rayos de luz volumétricos, humo, montañas
  de billetes que estallan.

## 4. Personajes y objetos

- Muñecos **totalmente 3D** (cabeza esférica blanca, cuerpo de cápsula, brazos/piernas de tubo), sombreado en dos tonos
  con **contorno de tinta negro** en todo, también en los objetos (cazo, rueda del timón).
- Decorados y objetos 3D detallados (coches con faros, barcos con velas y cuerdas, carriles con traviesas y balasto,
  celdas con bancos y barrotes), con texturas limpias y colores saturados.
- Caras 2D muy expresivas (párpados a media asta, cejas, boca que habla) — esto ya lo tenemos.

## 5. Subtítulos

- 1–2 palabras a la vez, blanco con contorno oscuro, **pequeños** (≈ 6 % del ancho por letra), centrados a ~70 % de
  altura. Sin colores de resaltado salvo rara vez. No tapan la acción.

## 6. Cómo escribe los guiones (estructura, no texto copiado)

1. **Arranque en mitad de la acción, en pasado**: la primera frase es el acto más raro de la historia, contado sin
   contexto ("Él hizo X absurdo…"). El título del vídeo es la pregunta; la primera frase es la imagen imposible.
2. **Pasa a presente** y cuenta la historia en orden. Protagonista **sin nombre** ("he": el ingeniero más joven, un
   científico, el cocinero, un cajero).
3. **Escéptico / rival** con una línea de diálogo corta y graciosa entre comillas (el jefe, el capitán, el rival).
4. **Escalada con datos concretos y marcas de tiempo**: "en mayo… en julio…", "a los 15 minutos… a los 20…", cifras
   exactas (39 pies, 300 libras, una pinta en un galón).
5. **El protagonista parece perder** (el otro termina antes, todos se ríen).
6. **Giro**: "Then…", "Until one night…", "But then…".
7. **"You see,"** → la explicación real, con una **analogía cotidiana** (soplar una sopa, tomar una curva a 60).
8. **Remate**: el rival paga las consecuencias / se revela la verdad, y la **última frase se corta a medias** para que el
   vídeo **enlace en bucle** con la primera. Sin "sígueme", sin despedida.
9. Tono conversacional: frases encadenadas con "So,", "But,", "And sure enough,", "Wait, what?". Narrador 3ª persona.
10. ~220 palabras, 3,8 palabras/s; la música sube en los momentos clave.

## 7. Qué cambiar en nuestro motor (por prioridad)

1. **Planos-secuencia con transiciones motivadas**: 1 plano ≈ 1 frase (~4 s), cámara viajando todo el plano, transición =
   fundido corto en movimiento siguiendo un objeto; cortes duros solo en golpes. (`director.py` + `StoryShort.tsx`)
2. **Guion**: plantilla de 8 pasos de arriba; 200–230 palabras; voz más rápida (velocidad ~1.3); **sin outro "FOLLOW"**,
   última frase cortada para el bucle.
3. **Luz**: sol duro con sombras nítidas, haces de luz por ventanas, paleta dominante por escenario y cambio de paleta en
   el giro, viñeta más fuerte (centro +30 %), negros reales (~10 % del cuadro).
4. **Personajes 3D** (cabeza esfera + cápsula + tubos con contorno de tinta) en lugar de tarjetas 2D, manteniendo las
   caras 2D expresivas como textura de la cabeza.
5. **Subtítulos** más pequeños, 1–2 palabras, a ~70 % de altura, sin colores.
6. Más planos especiales: cenital tipo mapa, detalle a pantalla completa, holandés en momentos de caos.
