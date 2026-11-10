# QUALITY REPORT

Video: `the-great-molasses-flood_standard_v2.mp4` · 1080x1920 · 30.00 fps · 56.77 s · 28.54 MB

**Technical result: PASS** · Approved for delivery: **no — human review pending**

## Measured checks
| check | ok | blocking | detail |
|---|---|---|---|
| video stream | ✅ | yes | 1 video stream(s), codec h264 |
| 9:16 ratio | ✅ | yes | 1080x1920 |
| fps | ✅ | yes | 30.000 fps |
| duration | ✅ | yes | video 56.767 s, storyboard 56.767 s |
| single audio track | ✅ | yes | 1 audio stream(s) (a silent extra track means the mux mapped the wrong stream) |
| AAC 48 kHz | ✅ | yes | aac 48000 Hz 2 ch |
| A/V length match | ✅ | yes | audio 56.767 s vs video 56.767 s |
| no black spans | ✅ | yes | 0 span(s) [] |
| no white spans (>0.2 s) | ✅ | yes | 0 span(s) [] — 4-frame flashes are shorter and allowed |
| no frozen holds >= 1.5 s | ✅ | no | 0 freeze(s) >= 0.6 s: [] |
| loudness ~ -14 LUFS | ✅ | no | integrated -14.0 LUFS (target -14, platform normalisation) |
| true peak <= -1 dBTP | ✅ | yes | true peak -2.0 dBTP |
| no long silences | ✅ | no | 0 silence(s) >= 1.2 s: [] |
| day exposure (heuristic) | ✅ | no | median luma of day scenes 0.622, reference ~0.57 (range 0.5-0.66) |
| no crushed blacks (heuristic) | ✅ | no | scenes with p5 luma < 0.04: [] |

## Per-scene picture stats (heuristic, vs reference: day median luma ~0.57, p5 ~0.23)
| scene | t | light | median Y | p5 | p95 | sat |
|---|---|---|---|---|---|---|
| b01 | 2.83 | day | 0.645 | 0.403 | 0.851 | 0.311 |
| b02 | 7.1 | day | 0.655 | 0.339 | 0.869 | 0.28 |
| b03 | 10.53 | day | 0.568 | 0.193 | 0.83 | 0.339 |
| b04 | 14.2 | day | 0.602 | 0.179 | 0.866 | 0.386 |
| b05 | 17.9 | day | 0.584 | 0.169 | 0.857 | 0.359 |
| b06 | 21.87 | day | 0.58 | 0.148 | 0.857 | 0.375 |
| b07 | 25.93 | day | 0.569 | 0.15 | 0.837 | 0.401 |
| b08 | 28.43 | day | 0.654 | 0.346 | 0.868 | 0.285 |
| b09 | 30.53 | day | 0.611 | 0.345 | 0.849 | 0.267 |
| b10 | 33.73 | day | 0.646 | 0.39 | 0.881 | 0.288 |
| b11 | 37.4 | day | 0.615 | 0.371 | 0.857 | 0.277 |
| b12 | 41.5 | day | 0.629 | 0.372 | 0.863 | 0.278 |
| b13 | 45.97 | day | 0.644 | 0.405 | 0.851 | 0.31 |
| b14 | 50.4 | day | 0.654 | 0.34 | 0.869 | 0.281 |
| b15 | 53.17 | day | 0.615 | 0.345 | 0.851 | 0.273 |
| b16 | 55.43 | day | 0.646 | 0.39 | 0.881 | 0.288 |

## Rubric (0-10)
| area | score | basis |
|---|---|---|
| Comprensión narrativa y gancho inicial | — | pending human review (see checklist) |
| Coherencia de personajes y escenarios | — | pending human review (see checklist) |
| Cámara y pacing | — | pending human review (see checklist) |
| Contornos / ilustración / materiales | — | pending human review (see checklist) |
| Iluminación, color y profundidad | — | pending human review (see checklist) |
| Claridad y naturalidad de la voz | — | pending human review (see checklist) |
| SFX, música y sincronía | — | computed loudness -14.0 LUFS / TP -2.0 dBTP; sync and taste need a listen |
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
