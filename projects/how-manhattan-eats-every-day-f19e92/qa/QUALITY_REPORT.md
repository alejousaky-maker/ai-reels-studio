# QUALITY REPORT

Video: `how-manhattan-eats-every-day_master_v1.mp4` · 1440x2560 · 30.00 fps · 83.77 s · 105.47 MB

**Technical result: PASS** · Approved for delivery: **no — human review pending**

## Measured checks
| check | ok | blocking | detail |
|---|---|---|---|
| video stream | ✅ | yes | 1 video stream(s), codec h264 |
| 9:16 ratio | ✅ | yes | 1440x2560 |
| fps | ✅ | yes | 30.000 fps |
| duration | ✅ | yes | video 83.767 s, storyboard 83.767 s |
| single audio track | ✅ | yes | 1 audio stream(s) (a silent extra track means the mux mapped the wrong stream) |
| AAC 48 kHz | ✅ | yes | aac 48000 Hz 2 ch |
| A/V length match | ✅ | yes | audio 83.767 s vs video 83.767 s |
| no black spans | ✅ | yes | 0 span(s) [] |
| no white spans (>0.2 s) | ✅ | yes | 0 span(s) [] — 4-frame flashes are shorter and allowed |
| no frozen holds >= 1.5 s | ✅ | no | 1 freeze(s) >= 0.6 s: [(81.533333, None)] |
| loudness ~ -14 LUFS | ✅ | no | integrated -14.0 LUFS (target -14, platform normalisation) |
| true peak <= -1 dBTP | ✅ | yes | true peak -1.8 dBTP |
| no long silences | ✅ | no | 0 silence(s) >= 1.2 s: [] |
| render matches control stills | ✅ | yes | 87 frames compared; mismatches: [] |
| day exposure (heuristic) | ✅ | no | median luma of day scenes 0.566, reference ~0.57 (range 0.5-0.66) |
| no crushed blacks (heuristic) | ❌ | no | scenes with p5 luma < 0.04: ['b03b', 'b04a', 'b04b', 'b05a', 'b05b', 'b07b', 'b08', 'b08a', 'b12'] |

## Per-scene picture stats (heuristic, vs reference: day median luma ~0.57, p5 ~0.23)
| scene | t | light | median Y | p5 | p95 | sat |
|---|---|---|---|---|---|---|
| b01 | 2.47 | day | 0.508 | 0.38 | 0.825 | 0.529 |
| b01a | 5.33 | day | 0.509 | 0.369 | 0.825 | 0.534 |
| b01b | 6.47 | day | 0.509 | 0.377 | 0.825 | 0.535 |
| b02 | 8.9 | night | 0.121 | 0.038 | 0.782 | 0.648 |
| b02a | 12.6 | night | 0.366 | 0.04 | 0.831 | 0.504 |
| b03 | 16.53 | day | 0.631 | 0.205 | 0.962 | 0.313 |
| b03a | 19.27 | night | 0.197 | 0.037 | 0.668 | 0.607 |
| b03b | 20.93 | day | 0.383 | 0.029 | 0.975 | 0.496 |
| b04 | 23.7 | day | 0.57 | 0.05 | 0.96 | 0.297 |
| b04a | 27.13 | day | 0.471 | 0.035 | 0.963 | 0.294 |
| b04b | 28.9 | day | 0.693 | 0.029 | 0.959 | 0.331 |
| b05 | 30.83 | day | 0.711 | 0.293 | 0.914 | 0.346 |
| b05a | 33.43 | day | 0.673 | 0.038 | 0.907 | 0.435 |
| b05b | 34.93 | day | 0.653 | 0.027 | 0.876 | 0.523 |
| b06 | 37.57 | day | 0.561 | 0.09 | 0.75 | 0.498 |
| b06a | 40.67 | day | 0.598 | 0.074 | 0.788 | 0.336 |
| b07 | 42.67 | day | 0.421 | 0.126 | 0.867 | 0.392 |
| b07a | 44.97 | day | 0.324 | 0.057 | 0.916 | 0.305 |
| b07b | 47.13 | day | 0.697 | 0.029 | 0.841 | 0.543 |
| b08 | 49.53 | day | 0.538 | 0.034 | 0.963 | 0.447 |
| b08a | 52.7 | day | 0.364 | 0.029 | 0.975 | 0.534 |
| b09 | 56.93 | night | 0.197 | 0.029 | 0.738 | 0.581 |
| b10 | 62.43 | golden | 0.229 | 0.122 | 0.774 | 0.715 |
| b11 | 67.4 | golden | 0.507 | 0.082 | 0.723 | 0.609 |
| b11a | 70.23 | golden | 0.532 | 0.134 | 0.695 | 0.471 |
| b12 | 72.53 | day | 0.778 | 0.031 | 0.888 | 0.554 |
| b12a | 75.4 | day | 0.633 | 0.104 | 0.903 | 0.404 |
| b13 | 78.77 | night | 0.068 | 0.065 | 0.491 | 0.688 |
| b14 | 82.27 | night | 0.026 | 0.026 | 0.093 | 0.445 |

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
- no crushed blacks (heuristic): scenes with p5 luma < 0.04: ['b03b', 'b04a', 'b04b', 'b05a', 'b05b', 'b07b', 'b08', 'b08a', 'b12']
