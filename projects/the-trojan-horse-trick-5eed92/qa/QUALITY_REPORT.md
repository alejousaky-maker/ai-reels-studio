# QUALITY REPORT

Video: `the-trojan-horse-trick_master_v2.mp4` · 1440x2560 · 30.00 fps · 52.93 s · 66.12 MB

**Technical result: PASS** · Approved for delivery: **no — human review pending**

## Measured checks
| check | ok | blocking | detail |
|---|---|---|---|
| video stream | ✅ | yes | 1 video stream(s), codec h264 |
| 9:16 ratio | ✅ | yes | 1440x2560 |
| fps | ✅ | yes | 30.000 fps |
| duration | ✅ | yes | video 52.933 s, storyboard 52.933 s |
| single audio track | ✅ | yes | 1 audio stream(s) (a silent extra track means the mux mapped the wrong stream) |
| AAC 48 kHz | ✅ | yes | aac 48000 Hz 2 ch |
| A/V length match | ✅ | yes | audio 52.933 s vs video 52.933 s |
| no black spans | ✅ | yes | 0 span(s) [] |
| no white spans (>0.2 s) | ✅ | yes | 0 span(s) [] — 4-frame flashes are shorter and allowed |
| no frozen holds >= 1.5 s | ✅ | no | 0 freeze(s) >= 0.6 s: [] |
| loudness ~ -14 LUFS | ✅ | no | integrated -14.0 LUFS (target -14, platform normalisation) |
| true peak <= -1 dBTP | ✅ | yes | true peak -1.8 dBTP |
| no long silences | ✅ | no | 0 silence(s) >= 1.2 s: [] |
| render matches control stills | ✅ | yes | 42 frames compared; mismatches: [] |
| day exposure (heuristic) | ❌ | no | median luma of day scenes 0.680, reference ~0.57 (range 0.5-0.66) |
| no crushed blacks (heuristic) | ❌ | no | scenes with p5 luma < 0.04: ['b05', 'b08'] |

## Per-scene picture stats (heuristic, vs reference: day median luma ~0.57, p5 ~0.23)
| scene | t | light | median Y | p5 | p95 | sat |
|---|---|---|---|---|---|---|
| b01 | 2.2 | day | 0.535 | 0.217 | 0.832 | 0.396 |
| b02 | 6.27 | day | 0.657 | 0.208 | 0.832 | 0.424 |
| b03 | 10.17 | day | 0.794 | 0.194 | 0.902 | 0.38 |
| b04 | 14.2 | day | 0.821 | 0.339 | 0.902 | 0.433 |
| b05 | 17.87 | day | 0.638 | 0.034 | 0.868 | 0.604 |
| b06 | 22.07 | day | 0.703 | 0.055 | 0.902 | 0.504 |
| b07 | 26.03 | day | 0.776 | 0.081 | 0.902 | 0.365 |
| b08 | 29.17 | day | 0.736 | 0.033 | 0.901 | 0.357 |
| b09 | 32.67 | day | 0.619 | 0.046 | 0.902 | 0.542 |
| b10 | 35.97 | day | 0.758 | 0.063 | 0.902 | 0.393 |
| b11 | 39.07 | day | 0.552 | 0.197 | 0.832 | 0.453 |
| b12 | 42.63 | day | 0.648 | 0.178 | 0.832 | 0.481 |
| b13 | 46.17 | night | 0.147 | 0.029 | 0.453 | 0.663 |
| b14 | 50.3 | night | 0.145 | 0.021 | 0.59 | 0.682 |

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
- day exposure (heuristic): median luma of day scenes 0.680, reference ~0.57 (range 0.5-0.66)
- no crushed blacks (heuristic): scenes with p5 luma < 0.04: ['b05', 'b08']
