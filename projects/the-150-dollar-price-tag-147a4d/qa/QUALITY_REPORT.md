# QUALITY REPORT

Video: `the-150-dollar-price-tag_master_v1.mp4` · 1440x2560 · 30.00 fps · 48.20 s · 54.27 MB

**Technical result: PASS** · Approved for delivery: **no — human review pending**

## Measured checks
| check | ok | blocking | detail |
|---|---|---|---|
| video stream | ✅ | yes | 1 video stream(s), codec h264 |
| 9:16 ratio | ✅ | yes | 1440x2560 |
| fps | ✅ | yes | 30.000 fps |
| duration | ✅ | yes | video 48.200 s, storyboard 48.200 s |
| single audio track | ✅ | yes | 1 audio stream(s) (a silent extra track means the mux mapped the wrong stream) |
| AAC 48 kHz | ✅ | yes | aac 48000 Hz 2 ch |
| A/V length match | ✅ | yes | audio 48.200 s vs video 48.200 s |
| no black spans | ✅ | yes | 0 span(s) [] |
| no white spans (>0.2 s) | ✅ | yes | 0 span(s) [] — 4-frame flashes are shorter and allowed |
| no frozen holds >= 1.5 s | ✅ | no | 0 freeze(s) >= 0.6 s: [] |
| loudness ~ -14 LUFS | ✅ | no | integrated -14.0 LUFS (target -14, platform normalisation) |
| true peak <= -1 dBTP | ✅ | yes | true peak -1.9 dBTP |
| no long silences | ✅ | no | 0 silence(s) >= 1.2 s: [] |
| render matches control stills | ✅ | yes | 66 frames compared; mismatches: [] |
| day exposure (heuristic) | ✅ | no | median luma of day scenes 0.605, reference ~0.57 (range 0.5-0.66) |
| no crushed blacks (heuristic) | ❌ | no | scenes with p5 luma < 0.04: ['b01', 'b01b', 'b03', 'b06', 'b08a'] |

## Per-scene picture stats (heuristic, vs reference: day median luma ~0.57, p5 ~0.23)
| scene | t | light | median Y | p5 | p95 | sat |
|---|---|---|---|---|---|---|
| b01 | 2.17 | day | 0.576 | 0.035 | 0.857 | 0.412 |
| b01a | 5.27 | day | 0.585 | 0.089 | 0.949 | 0.434 |
| b01b | 6.97 | day | 0.585 | 0.029 | 0.853 | 0.508 |
| b02 | 8.93 | day | 0.603 | 0.191 | 0.872 | 0.381 |
| b03 | 10.87 | day | 0.592 | 0.028 | 0.912 | 0.434 |
| b04 | 13.53 | day | 0.618 | 0.285 | 0.857 | 0.524 |
| b05 | 15.97 | day | 0.621 | 0.224 | 0.889 | 0.26 |
| b05a | 17.03 | day | 0.621 | 0.224 | 0.916 | 0.216 |
| b05b | 17.97 | day | 0.621 | 0.225 | 0.906 | 0.257 |
| b06 | 19.37 | day | 0.606 | 0.029 | 0.901 | 0.402 |
| b07 | 22.0 | golden | 0.489 | 0.178 | 0.652 | 0.753 |
| b08 | 24.6 | golden | 0.532 | 0.136 | 0.729 | 0.686 |
| b08a | 26.0 | golden | 0.514 | 0.03 | 0.788 | 0.649 |
| b09 | 28.4 | golden | 0.428 | 0.119 | 0.765 | 0.627 |
| b10 | 31.6 | night | 0.116 | 0.024 | 0.912 | 0.546 |
| b11 | 33.93 | night | 0.109 | 0.056 | 0.738 | 0.666 |
| b12 | 35.47 | night | 0.121 | 0.061 | 0.514 | 0.663 |
| b12a | 36.47 | night | 0.105 | 0.054 | 0.694 | 0.693 |
| b12b | 37.53 | night | 0.109 | 0.074 | 0.558 | 0.675 |
| b13 | 39.67 | night | 0.105 | 0.044 | 0.55 | 0.681 |
| b14 | 42.93 | night | 0.11 | 0.021 | 0.591 | 0.747 |
| b15 | 46.4 | night | 0.356 | 0.021 | 0.79 | 0.571 |

## Rubric (0-10)
| area | score | basis |
|---|---|---|
| Comprensión narrativa y gancho inicial | — | pending human review (see checklist) |
| Coherencia de personajes y escenarios | — | pending human review (see checklist) |
| Cámara y pacing | — | pending human review (see checklist) |
| Contornos / ilustración / materiales | — | pending human review (see checklist) |
| Iluminación, color y profundidad | — | pending human review (see checklist) |
| Claridad y naturalidad de la voz | — | pending human review (see checklist) |
| SFX, música y sincronía | — | computed loudness -14.0 LUFS / TP -1.9 dBTP; sync and taste need a listen |
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
- no crushed blacks (heuristic): scenes with p5 luma < 0.04: ['b01', 'b01b', 'b03', 'b06', 'b08a']
