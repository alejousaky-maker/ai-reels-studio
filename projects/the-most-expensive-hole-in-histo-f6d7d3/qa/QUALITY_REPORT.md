# QUALITY REPORT

Video: `the-most-expensive-hole-in-history_master_v2.mp4` · 1440x2560 · 30.00 fps · 77.33 s · 124.06 MB

**Technical result: PASS** · Approved for delivery: **no — human review pending**

## Measured checks
| check | ok | blocking | detail |
|---|---|---|---|
| video stream | ✅ | yes | 1 video stream(s), codec h264 |
| 9:16 ratio | ✅ | yes | 1440x2560 |
| fps | ✅ | yes | 30.000 fps |
| duration | ✅ | yes | video 77.333 s, storyboard 77.333 s |
| single audio track | ✅ | yes | 1 audio stream(s) (a silent extra track means the mux mapped the wrong stream) |
| AAC 48 kHz | ✅ | yes | aac 48000 Hz 2 ch |
| A/V length match | ✅ | yes | audio 77.333 s vs video 77.333 s |
| no black spans | ✅ | yes | 0 span(s) [] |
| no white spans (>0.2 s) | ✅ | yes | 0 span(s) [] — 4-frame flashes are shorter and allowed |
| no frozen holds >= 1.5 s | ✅ | no | 1 freeze(s) >= 0.6 s: [(75.466667, None)] |
| loudness ~ -14 LUFS | ✅ | no | integrated -14.0 LUFS (target -14, platform normalisation) |
| true peak <= -1 dBTP | ✅ | yes | true peak -1.5 dBTP |
| no long silences | ✅ | no | 0 silence(s) >= 1.2 s: [] |
| render matches control stills | ✅ | yes | 93 frames compared; mismatches: [] |
| day exposure (heuristic) | ❌ | no | median luma of day scenes 0.670, reference ~0.57 (range 0.5-0.66) |
| no crushed blacks (heuristic) | ❌ | no | scenes with p5 luma < 0.04: ['b01a', 'b01c', 'b02a', 'b03', 'b03b', 'b06', 'b06a', 'b09a', 'b12', 'b12a', 'b13'] |

## Per-scene picture stats (heuristic, vs reference: day median luma ~0.57, p5 ~0.23)
| scene | t | light | median Y | p5 | p95 | sat |
|---|---|---|---|---|---|---|
| b01 | 0.93 | day | 0.698 | 0.046 | 0.92 | 0.504 |
| b01a | 3.27 | day | 0.59 | 0.031 | 0.945 | 0.54 |
| b01b | 5.47 | day | 0.68 | 0.044 | 0.914 | 0.522 |
| b01c | 6.8 | day | 0.089 | 0.029 | 0.835 | 0.492 |
| b02 | 9.67 | day | 0.701 | 0.081 | 0.964 | 0.328 |
| b02a | 13.27 | day | 0.412 | 0.029 | 0.963 | 0.355 |
| b03 | 15.07 | day | 0.395 | 0.021 | 0.963 | 0.354 |
| b03a | 17.07 | day | 0.482 | 0.05 | 0.959 | 0.371 |
| b03b | 19.37 | day | 0.396 | 0.004 | 0.902 | 0.001 |
| b04 | 21.63 | night | 0.141 | 0.029 | 0.651 | 0.826 |
| b04a | 24.57 | night | 0.247 | 0.024 | 0.887 | 0.737 |
| b05 | 27.87 | night | 0.147 | 0.043 | 0.745 | 0.733 |
| b05a | 30.2 | night | 0.238 | 0.047 | 0.586 | 0.784 |
| b05b | 32.0 | night | 0.365 | 0.027 | 0.868 | 0.672 |
| b06 | 34.33 | day | 0.655 | 0.039 | 0.922 | 0.477 |
| b06a | 35.87 | day | 0.719 | 0.035 | 0.928 | 0.43 |
| b06b | 37.77 | day | 0.624 | 0.045 | 0.913 | 0.529 |
| b07 | 40.77 | day | 0.679 | 0.171 | 0.922 | 0.229 |
| b07a | 43.73 | day | 0.807 | 0.282 | 0.959 | 0.253 |
| b08 | 47.2 | day | 0.771 | 0.104 | 0.941 | 0.357 |
| b09 | 51.57 | day | 0.688 | 0.066 | 0.903 | 0.519 |
| b09a | 54.3 | day | 0.67 | 0.033 | 0.927 | 0.578 |
| b10 | 55.63 | night | 0.178 | 0.041 | 0.803 | 0.771 |
| b10a | 57.57 | night | 0.179 | 0.024 | 0.856 | 0.688 |
| b10b | 59.93 | night | 0.185 | 0.048 | 0.581 | 0.841 |
| b11 | 63.2 | day | 0.852 | 0.103 | 0.941 | 0.236 |
| b11a | 66.07 | day | 0.821 | 0.065 | 0.94 | 0.337 |
| b12 | 67.87 | day | 0.307 | 0.018 | 0.89 | 0.611 |
| b12a | 69.87 | day | 0.089 | 0.029 | 0.866 | 0.497 |
| b13 | 72.83 | golden | 0.13 | 0.029 | 0.644 | 0.831 |
| b14 | 76.03 | night | 0.026 | 0.026 | 0.093 | 0.445 |

## Rubric (0-10)
| area | score | basis |
|---|---|---|
| Comprensión narrativa y gancho inicial | — | pending human review (see checklist) |
| Coherencia de personajes y escenarios | — | pending human review (see checklist) |
| Cámara y pacing | — | pending human review (see checklist) |
| Contornos / ilustración / materiales | — | pending human review (see checklist) |
| Iluminación, color y profundidad | — | pending human review (see checklist) |
| Claridad y naturalidad de la voz | — | pending human review (see checklist) |
| SFX, música y sincronía | — | computed loudness -14.0 LUFS / TP -1.5 dBTP; sync and taste need a listen |
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
- day exposure (heuristic): median luma of day scenes 0.670, reference ~0.57 (range 0.5-0.66)
- no crushed blacks (heuristic): scenes with p5 luma < 0.04: ['b01a', 'b01c', 'b02a', 'b03', 'b03b', 'b06', 'b06a', 'b09a', 'b12', 'b12a', 'b13']
