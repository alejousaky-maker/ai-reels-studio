# QUALITY REPORT

Video: `the-day-the-earth-stood-still_master_v1.mp4` · 1440x2560 · 30.00 fps · 48.50 s · 45.62 MB

**Technical result: PASS** · Approved for delivery: **no — human review pending**

## Measured checks
| check | ok | blocking | detail |
|---|---|---|---|
| video stream | ✅ | yes | 1 video stream(s), codec h264 |
| 9:16 ratio | ✅ | yes | 1440x2560 |
| fps | ✅ | yes | 30.000 fps |
| duration | ✅ | yes | video 48.500 s, storyboard 48.500 s |
| single audio track | ✅ | yes | 1 audio stream(s) (a silent extra track means the mux mapped the wrong stream) |
| AAC 48 kHz | ✅ | yes | aac 48000 Hz 2 ch |
| A/V length match | ✅ | yes | audio 48.500 s vs video 48.500 s |
| no black spans | ✅ | yes | 0 span(s) [] |
| no white spans (>0.2 s) | ✅ | yes | 0 span(s) [] — 4-frame flashes are shorter and allowed |
| no frozen holds >= 1.5 s | ✅ | no | 0 freeze(s) >= 0.6 s: [] |
| loudness ~ -14 LUFS | ✅ | no | integrated -14.1 LUFS (target -14, platform normalisation) |
| true peak <= -1 dBTP | ✅ | yes | true peak -1.7 dBTP |
| no long silences | ✅ | no | 0 silence(s) >= 1.2 s: [] |
| render matches control stills | ✅ | yes | 45 frames compared; mismatches: [] |
| day exposure (heuristic) | ✅ | no | median luma of day scenes 0.539, reference ~0.57 (range 0.5-0.66) |
| no crushed blacks (heuristic) | ❌ | no | scenes with p5 luma < 0.04: ['b02', 'b06', 'b07', 'b08', 'b12', 'b13'] |

## Per-scene picture stats (heuristic, vs reference: day median luma ~0.57, p5 ~0.23)
| scene | t | light | median Y | p5 | p95 | sat |
|---|---|---|---|---|---|---|
| b01 | 3.5 | day | 0.565 | 0.127 | 0.848 | 0.426 |
| b02 | 9.27 | day | 0.545 | 0.037 | 0.904 | 0.414 |
| b03 | 13.27 | day | 0.472 | 0.192 | 0.882 | 0.347 |
| b04 | 16.77 | day | 0.772 | 0.255 | 0.916 | 0.307 |
| b05 | 21.17 | day | 0.312 | 0.07 | 0.867 | 0.334 |
| b06 | 24.87 | day | 0.127 | 0.038 | 0.904 | 0.4 |
| b07 | 27.47 | day | 0.545 | 0.034 | 0.904 | 0.371 |
| b08 | 30.0 | day | 0.539 | 0.036 | 0.903 | 0.382 |
| b09 | 32.53 | night | 0.267 | 0.054 | 0.518 | 0.567 |
| b10 | 35.23 | night | 0.086 | 0.021 | 0.284 | 0.854 |
| b11 | 38.33 | night | 0.074 | 0.02 | 0.514 | 0.837 |
| b12 | 40.7 | day | 0.233 | 0.029 | 0.744 | 0.669 |
| b13 | 41.63 | golden | 0.187 | 0.033 | 0.839 | 0.732 |
| b14 | 42.6 | night | 0.082 | 0.013 | 0.755 | 0.822 |
| b15 | 45.8 | night | 0.084 | 0.016 | 0.783 | 0.827 |

## Rubric (0-10)
| area | score | basis |
|---|---|---|
| Comprensión narrativa y gancho inicial | — | pending human review (see checklist) |
| Coherencia de personajes y escenarios | — | pending human review (see checklist) |
| Cámara y pacing | — | pending human review (see checklist) |
| Contornos / ilustración / materiales | — | pending human review (see checklist) |
| Iluminación, color y profundidad | — | pending human review (see checklist) |
| Claridad y naturalidad de la voz | — | pending human review (see checklist) |
| SFX, música y sincronía | — | computed loudness -14.1 LUFS / TP -1.7 dBTP; sync and taste need a listen |
| Composición vertical y safe areas | — | pending human review (see checklist) |
| Alineación visual-texto | — | pending human review (see checklist) |
| Calidad técnica del archivo y licencias | 10 | computed (checks above) |

## Human review checklist
- [ ] ¿El gancho se entiende en los primeros 2 s?
- [ ] ¿Cada frase importante tiene apoyo visual?
- [ ] ¿Los personajes mantienen aspecto entre planos?
- [ ] ¿Se ven los pies apoyados y las sombras de contacto?
- [ ] ¿Ningún objeto tapa caras ni corta la cámara?
- [ ] ¿El DOF no destruye siluetas?
- [ ] ¿Los contornos de tinta siguen visibles tras el desenfoque?
- [ ] ¿La voz se entiende sobre la música?
- [ ] ¿Los efectos suenan cuando ocurren?
- [ ] ¿Textos/CTA dentro de las safe areas y legibles?

## Warnings
- no crushed blacks (heuristic): scenes with p5 luma < 0.04: ['b02', 'b06', 'b07', 'b08', 'b12', 'b13']
