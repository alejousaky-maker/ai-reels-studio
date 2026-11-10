# QUALITY REPORT

Video: `the-most-expensive-hole-in-history_master_v1.mp4` · 1440x2560 · 30.00 fps · 80.63 s · 112.69 MB

**Technical result: PASS** · Approved for delivery: **no — human review pending**

## Measured checks
| check | ok | blocking | detail |
|---|---|---|---|
| video stream | ✅ | yes | 1 video stream(s), codec h264 |
| 9:16 ratio | ✅ | yes | 1440x2560 |
| fps | ✅ | yes | 30.000 fps |
| duration | ✅ | yes | video 80.633 s, storyboard 80.633 s |
| single audio track | ✅ | yes | 1 audio stream(s) (a silent extra track means the mux mapped the wrong stream) |
| AAC 48 kHz | ✅ | yes | aac 48000 Hz 2 ch |
| A/V length match | ✅ | yes | audio 80.633 s vs video 80.633 s |
| no black spans | ✅ | yes | 0 span(s) [] |
| no white spans (>0.2 s) | ✅ | yes | 0 span(s) [] — 4-frame flashes are shorter and allowed |
| no frozen holds >= 1.5 s | ✅ | no | 1 freeze(s) >= 0.6 s: [(78.6, None)] |
| loudness ~ -14 LUFS | ✅ | no | integrated -14.0 LUFS (target -14, platform normalisation) |
| true peak <= -1 dBTP | ✅ | yes | true peak -1.9 dBTP |
| no long silences | ✅ | no | 0 silence(s) >= 1.2 s: [] |
| render matches control stills | ✅ | yes | 93 frames compared; mismatches: [] |
| day exposure (heuristic) | ✅ | no | median luma of day scenes 0.627, reference ~0.57 (range 0.5-0.66) |
| no crushed blacks (heuristic) | ❌ | no | scenes with p5 luma < 0.04: ['b01a', 'b01c', 'b02a', 'b03', 'b03b', 'b06', 'b06a', 'b09a', 'b12a'] |

## Per-scene picture stats (heuristic, vs reference: day median luma ~0.57, p5 ~0.23)
| scene | t | light | median Y | p5 | p95 | sat |
|---|---|---|---|---|---|---|
| b01 | 1.0 | day | 0.576 | 0.061 | 0.897 | 0.411 |
| b01a | 3.4 | day | 0.708 | 0.031 | 0.895 | 0.536 |
| b01b | 5.67 | day | 0.55 | 0.042 | 0.903 | 0.448 |
| b01c | 6.97 | day | 0.742 | 0.027 | 0.867 | 0.601 |
| b02 | 9.9 | day | 0.65 | 0.045 | 0.961 | 0.307 |
| b02a | 13.67 | day | 0.508 | 0.026 | 0.911 | 0.324 |
| b03 | 15.63 | day | 0.654 | 0.025 | 0.95 | 0.306 |
| b03a | 17.77 | day | 0.538 | 0.235 | 0.958 | 0.281 |
| b03b | 20.2 | day | 0.631 | 0.039 | 0.933 | 0.001 |
| b04 | 22.63 | night | 0.109 | 0.009 | 0.276 | 0.763 |
| b04a | 25.7 | night | 0.114 | 0.022 | 0.848 | 0.692 |
| b05 | 29.13 | night | 0.111 | 0.033 | 0.526 | 0.766 |
| b05a | 31.57 | night | 0.189 | 0.016 | 0.58 | 0.673 |
| b05b | 33.5 | night | 0.239 | 0.023 | 0.857 | 0.699 |
| b06 | 36.0 | day | 0.623 | 0.026 | 0.823 | 0.44 |
| b06a | 37.6 | day | 0.627 | 0.035 | 0.832 | 0.433 |
| b06b | 39.57 | day | 0.626 | 0.041 | 0.879 | 0.419 |
| b07 | 42.67 | day | 0.709 | 0.341 | 0.975 | 0.141 |
| b07a | 45.8 | day | 0.636 | 0.142 | 0.967 | 0.276 |
| b08 | 49.57 | day | 0.663 | 0.115 | 0.975 | 0.216 |
| b09 | 54.2 | day | 0.684 | 0.138 | 0.975 | 0.258 |
| b09a | 57.13 | day | 0.263 | 0.031 | 0.936 | 0.506 |
| b10 | 58.4 | night | 0.103 | 0.019 | 0.454 | 0.734 |
| b10a | 60.3 | night | 0.106 | 0.01 | 0.778 | 0.696 |
| b10b | 62.73 | night | 0.111 | 0.018 | 0.363 | 0.746 |
| b11 | 66.07 | day | 0.642 | 0.103 | 0.944 | 0.361 |
| b11a | 68.93 | day | 0.595 | 0.052 | 0.815 | 0.502 |
| b12 | 70.77 | day | 0.372 | 0.058 | 0.839 | 0.489 |
| b12a | 72.83 | day | 0.549 | 0.028 | 0.849 | 0.57 |
| b13 | 75.93 | golden | 0.357 | 0.047 | 0.806 | 0.583 |
| b14 | 79.23 | night | 0.026 | 0.026 | 0.093 | 0.445 |

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
- no crushed blacks (heuristic): scenes with p5 luma < 0.04: ['b01a', 'b01c', 'b02a', 'b03', 'b03b', 'b06', 'b06a', 'b09a', 'b12a']
