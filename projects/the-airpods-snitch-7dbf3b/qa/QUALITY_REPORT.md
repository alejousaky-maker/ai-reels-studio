# QUALITY REPORT

Video: `the-airpods-snitch_master_v1.mp4` · 1440x2560 · 30.00 fps · 39.93 s · 30.57 MB

**Technical result: PASS** · Approved for delivery: **no — human review pending**

## Measured checks
| check | ok | blocking | detail |
|---|---|---|---|
| video stream | ✅ | yes | 1 video stream(s), codec h264 |
| 9:16 ratio | ✅ | yes | 1440x2560 |
| fps | ✅ | yes | 30.000 fps |
| duration | ✅ | yes | video 39.933 s, storyboard 39.933 s |
| single audio track | ✅ | yes | 1 audio stream(s) (a silent extra track means the mux mapped the wrong stream) |
| AAC 48 kHz | ✅ | yes | aac 48000 Hz 2 ch |
| A/V length match | ✅ | yes | audio 39.933 s vs video 39.933 s |
| no black spans | ✅ | yes | 0 span(s) [] |
| no white spans (>0.2 s) | ✅ | yes | 0 span(s) [] — 4-frame flashes are shorter and allowed |
| no frozen holds >= 1.5 s | ✅ | no | 0 freeze(s) >= 0.6 s: [] |
| loudness ~ -14 LUFS | ✅ | no | integrated -14.0 LUFS (target -14, platform normalisation) |
| true peak <= -1 dBTP | ✅ | yes | true peak -1.8 dBTP |
| no long silences | ✅ | no | 0 silence(s) >= 1.2 s: [] |
| render matches control stills | ✅ | yes | 39 frames compared; mismatches: [] |
| day exposure (heuristic) | ✅ | no | median luma of day scenes 0.653, reference ~0.57 (range 0.5-0.66) |
| no crushed blacks (heuristic) | ❌ | no | scenes with p5 luma < 0.04: ['b03', 'b13'] |

## Per-scene picture stats (heuristic, vs reference: day median luma ~0.57, p5 ~0.23)
| scene | t | light | median Y | p5 | p95 | sat |
|---|---|---|---|---|---|---|
| b01 | 1.93 | golden | 0.503 | 0.068 | 0.741 | 0.706 |
| b02 | 5.07 | golden | 0.549 | 0.169 | 0.749 | 0.705 |
| b03 | 8.13 | golden | 0.552 | 0.03 | 0.791 | 0.701 |
| b04 | 11.37 | golden | 0.523 | 0.114 | 0.744 | 0.72 |
| b05 | 14.73 | night | 0.181 | 0.031 | 0.694 | 0.708 |
| b06 | 17.83 | night | 0.193 | 0.027 | 0.726 | 0.681 |
| b07 | 20.2 | night | 0.215 | 0.024 | 0.73 | 0.637 |
| b08 | 22.9 | night | 0.259 | 0.084 | 0.447 | 0.568 |
| b09 | 25.9 | night | 0.223 | 0.024 | 0.751 | 0.617 |
| b10 | 28.9 | night | 0.185 | 0.034 | 0.689 | 0.704 |
| b11 | 32.4 | day | 0.69 | 0.241 | 0.872 | 0.322 |
| b12 | 35.17 | day | 0.617 | 0.225 | 0.872 | 0.237 |
| b13 | 37.9 | golden | 0.583 | 0.03 | 0.795 | 0.7 |

## Rubric (0-10)
| area | score | basis |
|---|---|---|
| Comprensión narrativa y gancho inicial | — | pending human review (see checklist) |
| Coherencia de personajes y escenarios | — | pending human review (see checklist) |
| Cámara y pacing | — | pending human review (see checklist) |
| Contornos / ilustración / materiales | — | pending human review (see checklist) |
| Iluminación, color y profundidad | — | pending human review (see checklist) |
| Claridad y naturalidad de la voz | — | pending human review (see checklist) |
| SFX, música y sincronía | — | computed loudness -14.0 LUFS / TP -1.8 dBTP; sync and taste need a listen |
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
- no crushed blacks (heuristic): scenes with p5 luma < 0.04: ['b03', 'b13']
