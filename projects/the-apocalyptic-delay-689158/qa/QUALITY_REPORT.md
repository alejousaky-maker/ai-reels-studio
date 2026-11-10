# QUALITY REPORT

Video: `the-apocalyptic-delay_master_v1.mp4` · 1440x2560 · 30.00 fps · 48.87 s · 63.03 MB

**Technical result: PASS** · Approved for delivery: **no — human review pending**

## Measured checks
| check | ok | blocking | detail |
|---|---|---|---|
| video stream | ✅ | yes | 1 video stream(s), codec h264 |
| 9:16 ratio | ✅ | yes | 1440x2560 |
| fps | ✅ | yes | 30.000 fps |
| duration | ✅ | yes | video 48.867 s, storyboard 48.867 s |
| single audio track | ✅ | yes | 1 audio stream(s) (a silent extra track means the mux mapped the wrong stream) |
| AAC 48 kHz | ✅ | yes | aac 48000 Hz 2 ch |
| A/V length match | ✅ | yes | audio 48.867 s vs video 48.867 s |
| no black spans | ✅ | yes | 0 span(s) [] |
| no white spans (>0.2 s) | ✅ | yes | 0 span(s) [] — 4-frame flashes are shorter and allowed |
| no frozen holds >= 1.5 s | ✅ | no | 0 freeze(s) >= 0.6 s: [] |
| loudness ~ -14 LUFS | ✅ | no | integrated -14.0 LUFS (target -14, platform normalisation) |
| true peak <= -1 dBTP | ✅ | yes | true peak -1.9 dBTP |
| no long silences | ✅ | no | 0 silence(s) >= 1.2 s: [] |
| render matches control stills | ✅ | yes | 72 frames compared; mismatches: [] |
| day exposure (heuristic) | ✅ | no | median luma of day scenes 0.601, reference ~0.57 (range 0.5-0.66) |
| no crushed blacks (heuristic) | ❌ | no | scenes with p5 luma < 0.04: ['b05', 'b05b', 'b09a', 'b11'] |

## Per-scene picture stats (heuristic, vs reference: day median luma ~0.57, p5 ~0.23)
| scene | t | light | median Y | p5 | p95 | sat |
|---|---|---|---|---|---|---|
| b01 | 0.6 | night | 0.09 | 0.009 | 0.739 | 0.836 |
| b01a | 1.9 | night | 0.097 | 0.008 | 0.897 | 0.719 |
| b01b | 3.73 | golden | 0.552 | 0.094 | 0.734 | 0.718 |
| b01c | 5.83 | night | 0.088 | 0.012 | 0.503 | 0.828 |
| b02 | 7.93 | night | 0.09 | 0.015 | 0.913 | 0.8 |
| b03 | 9.9 | night | 0.094 | 0.016 | 0.774 | 0.745 |
| b03a | 11.57 | night | 0.076 | 0.019 | 0.583 | 0.834 |
| b04 | 13.4 | day | 0.739 | 0.142 | 0.926 | 0.488 |
| b04a | 15.6 | day | 0.601 | 0.152 | 0.886 | 0.526 |
| b05 | 17.33 | day | 0.573 | 0.027 | 0.843 | 0.511 |
| b05a | 18.43 | day | 0.617 | 0.131 | 0.872 | 0.33 |
| b05b | 19.67 | day | 0.596 | 0.014 | 0.856 | 0.371 |
| b06 | 22.27 | night | 0.06 | 0.006 | 0.661 | 0.836 |
| b07 | 24.53 | night | 0.072 | 0.006 | 0.622 | 0.873 |
| b07a | 26.17 | night | 0.086 | 0.006 | 0.357 | 0.862 |
| b08 | 28.93 | night | 0.062 | 0.009 | 0.464 | 0.869 |
| b09 | 31.43 | golden | 0.299 | 0.064 | 0.731 | 0.522 |
| b09a | 33.63 | golden | 0.299 | 0.031 | 0.717 | 0.567 |
| b10 | 36.43 | golden | 0.308 | 0.061 | 0.656 | 0.508 |
| b11 | 39.07 | golden | 0.277 | 0.01 | 0.806 | 0.619 |
| b12 | 41.37 | night | 0.085 | 0.018 | 0.521 | 0.83 |
| b13 | 43.73 | night | 0.094 | 0.013 | 0.702 | 0.772 |
| b13a | 45.6 | night | 0.088 | 0.008 | 0.777 | 0.793 |
| b14 | 47.67 | night | 0.092 | 0.008 | 0.765 | 0.796 |

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
- no crushed blacks (heuristic): scenes with p5 luma < 0.04: ['b05', 'b05b', 'b09a', 'b11']
