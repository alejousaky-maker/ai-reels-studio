# QUALITY REPORT

Video: `the-canal-that-cut-a-continent_master_v1.mp4` · 1440x2560 · 30.00 fps · 80.17 s · 81.92 MB

**Technical result: PASS** · Approved for delivery: **no — human review pending**

## Measured checks
| check | ok | blocking | detail |
|---|---|---|---|
| video stream | ✅ | yes | 1 video stream(s), codec h264 |
| 9:16 ratio | ✅ | yes | 1440x2560 |
| fps | ✅ | yes | 30.000 fps |
| duration | ✅ | yes | video 80.167 s, storyboard 80.167 s |
| single audio track | ✅ | yes | 1 audio stream(s) (a silent extra track means the mux mapped the wrong stream) |
| AAC 48 kHz | ✅ | yes | aac 48000 Hz 2 ch |
| A/V length match | ✅ | yes | audio 80.167 s vs video 80.167 s |
| no black spans | ✅ | yes | 0 span(s) [] |
| no white spans (>0.2 s) | ✅ | yes | 0 span(s) [] — 4-frame flashes are shorter and allowed |
| no frozen holds >= 1.5 s | ✅ | no | 1 freeze(s) >= 0.6 s: [(77.766667, None)] |
| loudness ~ -14 LUFS | ✅ | no | integrated -14.1 LUFS (target -14, platform normalisation) |
| true peak <= -1 dBTP | ✅ | yes | true peak -1.8 dBTP |
| no long silences | ✅ | no | 0 silence(s) >= 1.2 s: [] |
| render matches control stills | ✅ | yes | 75 frames compared; mismatches: [] |
| day exposure (heuristic) | ✅ | no | median luma of day scenes 0.606, reference ~0.57 (range 0.5-0.66) |
| no crushed blacks (heuristic) | ❌ | no | scenes with p5 luma < 0.04: ['b01', 'b01a', 'b01b', 'b02a', 'b03', 'b03a', 'b04', 'b04a', 'b06', 'b07', 'b07a', 'b08a', 'b12', 'b12a'] |

## Per-scene picture stats (heuristic, vs reference: day median luma ~0.57, p5 ~0.23)
| scene | t | light | median Y | p5 | p95 | sat |
|---|---|---|---|---|---|---|
| b01 | 2.07 | day | 0.638 | 0.027 | 0.862 | 0.521 |
| b01a | 5.7 | day | 0.606 | 0.034 | 0.847 | 0.507 |
| b01b | 7.7 | day | 0.648 | 0.03 | 0.92 | 0.5 |
| b02 | 9.87 | day | 0.614 | 0.341 | 0.962 | 0.337 |
| b02a | 13.2 | day | 0.561 | 0.026 | 0.961 | 0.332 |
| b03 | 16.8 | golden | 0.583 | 0.023 | 0.949 | 0.412 |
| b03a | 20.37 | golden | 0.665 | 0.024 | 0.946 | 0.393 |
| b04 | 23.53 | day | 0.566 | 0.029 | 0.839 | 0.638 |
| b04a | 26.5 | day | 0.466 | 0.022 | 0.955 | 0.66 |
| b05 | 29.63 | day | 0.602 | 0.332 | 0.877 | 0.487 |
| b05a | 33.33 | day | 0.543 | 0.08 | 0.862 | 0.56 |
| b06 | 37.1 | day | 0.454 | 0.033 | 0.824 | 0.761 |
| b06a | 39.57 | day | 0.54 | 0.042 | 0.901 | 0.7 |
| b07 | 42.27 | day | 0.644 | 0.026 | 0.936 | 0.519 |
| b07a | 45.17 | day | 0.612 | 0.022 | 0.928 | 0.585 |
| b08 | 47.2 | day | 0.811 | 0.072 | 0.871 | 0.349 |
| b08a | 49.4 | day | 0.761 | 0.027 | 0.895 | 0.369 |
| b09 | 52.37 | day | 0.778 | 0.398 | 0.877 | 0.336 |
| b09a | 55.53 | day | 0.658 | 0.052 | 0.881 | 0.393 |
| b10 | 59.83 | day | 0.111 | 0.063 | 0.665 | 0.695 |
| b11 | 66.27 | day | 0.5 | 0.416 | 0.662 | 0.676 |
| b12 | 70.97 | day | 0.61 | 0.033 | 0.818 | 0.487 |
| b12a | 73.13 | day | 0.553 | 0.023 | 0.858 | 0.557 |
| b13 | 75.5 | golden | 0.489 | 0.19 | 0.82 | 0.769 |
| b14 | 78.6 | night | 0.026 | 0.026 | 0.093 | 0.445 |

## Rubric (0-10)
| area | score | basis |
|---|---|---|
| Comprensión narrativa y gancho inicial | — | pending human review (see checklist) |
| Coherencia de personajes y escenarios | — | pending human review (see checklist) |
| Cámara y pacing | — | pending human review (see checklist) |
| Contornos / ilustración / materiales | — | pending human review (see checklist) |
| Iluminación, color y profundidad | — | pending human review (see checklist) |
| Claridad y naturalidad de la voz | — | pending human review (see checklist) |
| SFX, música y sincronía | — | computed loudness -14.1 LUFS / TP -1.8 dBTP; sync and taste need a listen |
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
- no crushed blacks (heuristic): scenes with p5 luma < 0.04: ['b01', 'b01a', 'b01b', 'b02a', 'b03', 'b03a', 'b04', 'b04a', 'b06', 'b07', 'b07a', 'b08a', 'b12', 'b12a']
