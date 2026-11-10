# QUALITY REPORT

Video: `the-vice-city-flu_master_v1.mp4` · 1440x2560 · 30.00 fps · 48.73 s · 48.36 MB

**Technical result: PASS** · Approved for delivery: **no — human review pending**

## Measured checks
| check | ok | blocking | detail |
|---|---|---|---|
| video stream | ✅ | yes | 1 video stream(s), codec h264 |
| 9:16 ratio | ✅ | yes | 1440x2560 |
| fps | ✅ | yes | 30.000 fps |
| duration | ✅ | yes | video 48.733 s, storyboard 48.733 s |
| single audio track | ✅ | yes | 1 audio stream(s) (a silent extra track means the mux mapped the wrong stream) |
| AAC 48 kHz | ✅ | yes | aac 48000 Hz 2 ch |
| A/V length match | ✅ | yes | audio 48.733 s vs video 48.733 s |
| no black spans | ✅ | yes | 0 span(s) [] |
| no white spans (>0.2 s) | ✅ | yes | 0 span(s) [] — 4-frame flashes are shorter and allowed |
| no frozen holds >= 1.5 s | ✅ | no | 0 freeze(s) >= 0.6 s: [] |
| loudness ~ -14 LUFS | ✅ | no | integrated -14.0 LUFS (target -14, platform normalisation) |
| true peak <= -1 dBTP | ✅ | yes | true peak -1.8 dBTP |
| no long silences | ✅ | no | 0 silence(s) >= 1.2 s: [] |
| render matches control stills | ✅ | yes | 63 frames compared; mismatches: [] |
| day exposure (heuristic) | ✅ | no | median luma of day scenes 0.595, reference ~0.57 (range 0.5-0.66) |
| no crushed blacks (heuristic) | ❌ | no | scenes with p5 luma < 0.04: ['b01', 'b01a', 'b01b', 'b01c', 'b02', 'b03', 'b04', 'b06', 'b07', 'b10', 'b12a', 'b13', 'b14'] |

## Per-scene picture stats (heuristic, vs reference: day median luma ~0.57, p5 ~0.23)
| scene | t | light | median Y | p5 | p95 | sat |
|---|---|---|---|---|---|---|
| b01 | 1.0 | day | 0.569 | 0.025 | 0.856 | 0.564 |
| b01a | 3.47 | day | 0.657 | 0.032 | 0.928 | 0.54 |
| b01b | 5.37 | day | 0.511 | 0.024 | 0.819 | 0.565 |
| b01c | 6.37 | day | 0.199 | 0.028 | 0.845 | 0.602 |
| b02 | 9.37 | day | 0.299 | 0.03 | 0.821 | 0.577 |
| b03 | 12.97 | day | 0.545 | 0.032 | 0.847 | 0.456 |
| b04 | 14.87 | day | 0.486 | 0.03 | 0.939 | 0.535 |
| b05 | 17.2 | day | 0.648 | 0.089 | 0.77 | 0.325 |
| b06 | 19.5 | day | 0.637 | 0.036 | 0.783 | 0.367 |
| b06a | 21.17 | day | 0.62 | 0.087 | 0.844 | 0.411 |
| b07 | 22.7 | day | 0.474 | 0.012 | 0.724 | 0.532 |
| b08 | 24.03 | night | 0.086 | 0.009 | 0.393 | 0.852 |
| b08a | 25.83 | night | 0.094 | 0.02 | 0.764 | 0.821 |
| b09 | 28.47 | night | 0.106 | 0.028 | 0.315 | 0.732 |
| b10 | 31.1 | day | 0.512 | 0.027 | 0.727 | 0.514 |
| b11 | 34.3 | day | 0.644 | 0.142 | 0.962 | 0.252 |
| b12 | 37.07 | day | 0.653 | 0.199 | 0.963 | 0.22 |
| b12a | 39.13 | day | 0.636 | 0.035 | 0.882 | 0.325 |
| b13 | 42.0 | day | 0.647 | 0.034 | 0.96 | 0.284 |
| b14 | 44.67 | day | 0.467 | 0.031 | 0.653 | 0.5 |
| b14a | 47.23 | day | 0.655 | 0.13 | 0.976 | 0.212 |

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
- no crushed blacks (heuristic): scenes with p5 luma < 0.04: ['b01', 'b01a', 'b01b', 'b01c', 'b02', 'b03', 'b04', 'b06', 'b07', 'b10', 'b12a', 'b13', 'b14']
