# QUALITY REPORT

Video: `how-nobody-beat-a-giant_master_v2.mp4` · 1440x2560 · 30.00 fps · 52.43 s · 61.53 MB

**Technical result: PASS** · Approved for delivery: **no — human review pending**

## Measured checks
| check | ok | blocking | detail |
|---|---|---|---|
| video stream | ✅ | yes | 1 video stream(s), codec h264 |
| 9:16 ratio | ✅ | yes | 1440x2560 |
| fps | ✅ | yes | 30.000 fps |
| duration | ✅ | yes | video 52.433 s, storyboard 52.433 s |
| single audio track | ✅ | yes | 1 audio stream(s) (a silent extra track means the mux mapped the wrong stream) |
| AAC 48 kHz | ✅ | yes | aac 48000 Hz 2 ch |
| A/V length match | ✅ | yes | audio 52.433 s vs video 52.433 s |
| no black spans | ✅ | yes | 0 span(s) [] |
| no white spans (>0.2 s) | ✅ | yes | 0 span(s) [] — 4-frame flashes are shorter and allowed |
| no frozen holds >= 1.5 s | ✅ | no | 0 freeze(s) >= 0.6 s: [] |
| loudness ~ -14 LUFS | ✅ | no | integrated -14.0 LUFS (target -14, platform normalisation) |
| true peak <= -1 dBTP | ✅ | yes | true peak -1.4 dBTP |
| no long silences | ✅ | no | 0 silence(s) >= 1.2 s: [] |
| render matches control stills | ✅ | yes | 42 frames compared; mismatches: [] |
| no crushed blacks (heuristic) | ❌ | no | scenes with p5 luma < 0.04: ['b01', 'b03', 'b06', 'b07', 'b08', 'b11', 'b14'] |

## Per-scene picture stats (heuristic, vs reference: day median luma ~0.57, p5 ~0.23)
| scene | t | light | median Y | p5 | p95 | sat |
|---|---|---|---|---|---|---|
| b01 | 2.33 | golden | 0.311 | 0.031 | 0.803 | 0.869 |
| b02 | 6.9 | golden | 0.296 | 0.175 | 0.421 | 0.845 |
| b03 | 10.73 | golden | 0.322 | 0.031 | 0.81 | 0.862 |
| b04 | 13.63 | golden | 0.321 | 0.071 | 0.619 | 0.883 |
| b05 | 17.53 | golden | 0.325 | 0.14 | 0.448 | 0.906 |
| b06 | 22.13 | golden | 0.309 | 0.039 | 0.573 | 0.893 |
| b07 | 26.1 | golden | 0.318 | 0.032 | 0.752 | 0.909 |
| b08 | 28.9 | golden | 0.317 | 0.037 | 0.792 | 0.867 |
| b09 | 32.17 | golden | 0.292 | 0.13 | 0.437 | 0.854 |
| b10 | 36.27 | night | 0.137 | 0.027 | 0.718 | 0.648 |
| b11 | 38.73 | golden | 0.322 | 0.03 | 0.81 | 0.862 |
| b12 | 41.07 | night | 0.135 | 0.024 | 0.758 | 0.617 |
| b13 | 45.7 | golden | 0.383 | 0.153 | 0.626 | 0.871 |
| b14 | 50.6 | golden | 0.308 | 0.031 | 0.623 | 0.849 |

## Rubric (0-10)
| area | score | basis |
|---|---|---|
| Comprensión narrativa y gancho inicial | — | pending human review (see checklist) |
| Coherencia de personajes y escenarios | — | pending human review (see checklist) |
| Cámara y pacing | — | pending human review (see checklist) |
| Contornos / ilustración / materiales | — | pending human review (see checklist) |
| Iluminación, color y profundidad | — | pending human review (see checklist) |
| Claridad y naturalidad de la voz | — | pending human review (see checklist) |
| SFX, música y sincronía | — | computed loudness -14.0 LUFS / TP -1.4 dBTP; sync and taste need a listen |
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
- no crushed blacks (heuristic): scenes with p5 luma < 0.04: ['b01', 'b03', 'b06', 'b07', 'b08', 'b11', 'b14']
