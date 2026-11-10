# QUALITY REPORT

Video: `the-fake-fishing-trip_master_v2.mp4` · 1440x2560 · 30.00 fps · 44.13 s · 37.93 MB

**Technical result: PASS** · Approved for delivery: **no — human review pending**

## Measured checks
| check | ok | blocking | detail |
|---|---|---|---|
| video stream | ✅ | yes | 1 video stream(s), codec h264 |
| 9:16 ratio | ✅ | yes | 1440x2560 |
| fps | ✅ | yes | 30.000 fps |
| duration | ✅ | yes | video 44.133 s, storyboard 44.133 s |
| single audio track | ✅ | yes | 1 audio stream(s) (a silent extra track means the mux mapped the wrong stream) |
| AAC 48 kHz | ✅ | yes | aac 48000 Hz 2 ch |
| A/V length match | ✅ | yes | audio 44.133 s vs video 44.133 s |
| no black spans | ✅ | yes | 0 span(s) [] |
| no white spans (>0.2 s) | ✅ | yes | 0 span(s) [] — 4-frame flashes are shorter and allowed |
| no frozen holds >= 1.5 s | ✅ | no | 0 freeze(s) >= 0.6 s: [] |
| loudness ~ -14 LUFS | ✅ | no | integrated -14.0 LUFS (target -14, platform normalisation) |
| true peak <= -1 dBTP | ✅ | yes | true peak -2.0 dBTP |
| no long silences | ✅ | no | 0 silence(s) >= 1.2 s: [] |
| render matches control stills | ✅ | yes | 42 frames compared; mismatches: [] |
| day exposure (heuristic) | ✅ | no | median luma of day scenes 0.621, reference ~0.57 (range 0.5-0.66) |
| no crushed blacks (heuristic) | ❌ | no | scenes with p5 luma < 0.04: ['b05', 'b08', 'b09'] |

## Per-scene picture stats (heuristic, vs reference: day median luma ~0.57, p5 ~0.23)
| scene | t | light | median Y | p5 | p95 | sat |
|---|---|---|---|---|---|---|
| b01 | 2.43 | day | 0.705 | 0.249 | 0.941 | 0.516 |
| b02 | 7.17 | day | 0.628 | 0.201 | 0.87 | 0.29 |
| b03 | 10.83 | day | 0.592 | 0.129 | 0.787 | 0.439 |
| b04 | 13.87 | day | 0.689 | 0.23 | 0.815 | 0.576 |
| b05 | 16.27 | day | 0.517 | 0.034 | 0.708 | 0.497 |
| b06 | 18.77 | day | 0.715 | 0.308 | 0.877 | 0.479 |
| b07 | 21.63 | day | 0.621 | 0.046 | 0.897 | 0.516 |
| b08 | 24.03 | day | 0.603 | 0.037 | 0.937 | 0.336 |
| b09 | 27.43 | day | 0.604 | 0.034 | 0.932 | 0.364 |
| b10 | 30.07 | day | 0.649 | 0.245 | 0.953 | 0.254 |
| b11 | 32.0 | day | 0.601 | 0.045 | 0.931 | 0.351 |
| b12 | 35.0 | night | 0.29 | 0.055 | 0.449 | 0.547 |
| b13 | 38.57 | night | 0.224 | 0.036 | 0.33 | 0.616 |
| b14 | 42.33 | night | 0.223 | 0.024 | 0.425 | 0.637 |

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

## Warnings
- no crushed blacks (heuristic): scenes with p5 luma < 0.04: ['b05', 'b08', 'b09']
