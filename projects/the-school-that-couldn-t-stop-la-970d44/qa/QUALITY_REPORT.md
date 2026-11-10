# QUALITY REPORT

Video: `the-school-that-couldn-t-stop-laughing_master_v2.mp4` · 1440x2560 · 30.00 fps · 62.37 s · 90.5 MB

**Technical result: PASS** · Approved for delivery: **no — human review pending**

## Measured checks
| check | ok | blocking | detail |
|---|---|---|---|
| video stream | ✅ | yes | 1 video stream(s), codec h264 |
| 9:16 ratio | ✅ | yes | 1440x2560 |
| fps | ✅ | yes | 30.000 fps |
| duration | ✅ | yes | video 62.367 s, storyboard 62.367 s |
| single audio track | ✅ | yes | 1 audio stream(s) (a silent extra track means the mux mapped the wrong stream) |
| AAC 48 kHz | ✅ | yes | aac 48000 Hz 2 ch |
| A/V length match | ✅ | yes | audio 62.367 s vs video 62.367 s |
| no black spans | ✅ | yes | 0 span(s) [] |
| no white spans (>0.2 s) | ✅ | yes | 0 span(s) [] — 4-frame flashes are shorter and allowed |
| no frozen holds >= 1.5 s | ✅ | no | 0 freeze(s) >= 0.6 s: [] |
| loudness ~ -14 LUFS | ✅ | no | integrated -14.0 LUFS (target -14, platform normalisation) |
| true peak <= -1 dBTP | ✅ | yes | true peak -1.2 dBTP |
| no long silences | ✅ | no | 0 silence(s) >= 1.2 s: [] |
| render matches control stills | ✅ | yes | 48 frames compared; mismatches: [] |
| day exposure (heuristic) | ✅ | no | median luma of day scenes 0.533, reference ~0.57 (range 0.5-0.66) |
| no crushed blacks (heuristic) | ❌ | no | scenes with p5 luma < 0.04: ['b07'] |

## Per-scene picture stats (heuristic, vs reference: day median luma ~0.57, p5 ~0.23)
| scene | t | light | median Y | p5 | p95 | sat |
|---|---|---|---|---|---|---|
| b01 | 3.2 | day | 0.492 | 0.192 | 0.778 | 0.47 |
| b02 | 7.1 | day | 0.569 | 0.198 | 0.77 | 0.383 |
| b03 | 9.17 | day | 0.477 | 0.157 | 0.848 | 0.435 |
| b04 | 11.77 | day | 0.466 | 0.215 | 0.765 | 0.458 |
| b05 | 16.23 | day | 0.527 | 0.118 | 0.807 | 0.46 |
| b06 | 20.7 | day | 0.533 | 0.206 | 0.795 | 0.453 |
| b07 | 23.47 | day | 0.557 | 0.035 | 0.902 | 0.392 |
| b08 | 26.47 | golden | 0.309 | 0.201 | 0.614 | 0.522 |
| b09 | 29.13 | golden | 0.296 | 0.197 | 0.606 | 0.56 |
| b10 | 33.2 | day | 0.768 | 0.261 | 0.895 | 0.272 |
| b11 | 37.9 | day | 0.601 | 0.176 | 0.845 | 0.397 |
| b12 | 41.13 | night | 0.202 | 0.049 | 0.383 | 0.503 |
| b13 | 46.03 | night | 0.206 | 0.038 | 0.443 | 0.531 |
| b14 | 52.5 | golden | 0.305 | 0.173 | 0.582 | 0.566 |
| b15 | 56.7 | golden | 0.3 | 0.11 | 0.63 | 0.532 |
| b16 | 60.17 | golden | 0.292 | 0.19 | 0.598 | 0.551 |

## Rubric (0-10)
| area | score | basis |
|---|---|---|
| Comprensión narrativa y gancho inicial | — | pending human review (see checklist) |
| Coherencia de personajes y escenarios | — | pending human review (see checklist) |
| Cámara y pacing | — | pending human review (see checklist) |
| Contornos / ilustración / materiales | — | pending human review (see checklist) |
| Iluminación, color y profundidad | — | pending human review (see checklist) |
| Claridad y naturalidad de la voz | — | pending human review (see checklist) |
| SFX, música y sincronía | — | computed loudness -14.0 LUFS / TP -1.2 dBTP; sync and taste need a listen |
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
- no crushed blacks (heuristic): scenes with p5 luma < 0.04: ['b07']
