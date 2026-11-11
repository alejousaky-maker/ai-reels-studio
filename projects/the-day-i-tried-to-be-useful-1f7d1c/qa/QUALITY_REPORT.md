# QUALITY REPORT

Video: `the-day-i-tried-to-be-useful_master_v1.mp4` · 1440x2560 · 30.00 fps · 76.97 s · 87.0 MB

**Technical result: PASS** · Approved for delivery: **no — human review pending**

## Measured checks
| check | ok | blocking | detail |
|---|---|---|---|
| video stream | ✅ | yes | 1 video stream(s), codec h264 |
| 9:16 ratio | ✅ | yes | 1440x2560 |
| fps | ✅ | yes | 30.000 fps |
| duration | ✅ | yes | video 76.967 s, storyboard 76.967 s |
| single audio track | ✅ | yes | 1 audio stream(s) (a silent extra track means the mux mapped the wrong stream) |
| AAC 48 kHz | ✅ | yes | aac 48000 Hz 2 ch |
| A/V length match | ✅ | yes | audio 76.967 s vs video 76.967 s |
| no black spans | ✅ | yes | 0 span(s) [] |
| no white spans (>0.2 s) | ✅ | yes | 0 span(s) [] — 4-frame flashes are shorter and allowed |
| no frozen holds >= 1.5 s | ✅ | no | 1 freeze(s) >= 0.6 s: [(74.1, None)] |
| loudness ~ -14 LUFS | ✅ | no | integrated -14.0 LUFS (target -14, platform normalisation) |
| true peak <= -1 dBTP | ✅ | yes | true peak -1.9 dBTP |
| no long silences | ✅ | no | 0 silence(s) >= 1.2 s: [] |
| render matches control stills | ✅ | yes | 87 frames compared; mismatches: [] |
| day exposure (heuristic) | ❌ | no | median luma of day scenes 0.347, reference ~0.57 (range 0.5-0.66) |
| no crushed blacks (heuristic) | ❌ | no | scenes with p5 luma < 0.04: ['b02a', 'b03a', 'b06', 'b06b', 'b07a', 'b08', 'b09', 'b09a', 'b10', 'b10a'] |

## Per-scene picture stats (heuristic, vs reference: day median luma ~0.57, p5 ~0.23)
| scene | t | light | median Y | p5 | p95 | sat |
|---|---|---|---|---|---|---|
| b01 | 2.03 | night | 0.151 | 0.019 | 0.641 | 0.723 |
| b01a | 4.83 | night | 0.05 | 0.027 | 0.951 | 0.512 |
| b01b | 6.37 | night | 0.057 | 0.019 | 0.702 | 0.807 |
| b02 | 8.0 | day | 0.519 | 0.247 | 0.948 | 0.255 |
| b02a | 10.17 | day | 0.493 | 0.03 | 0.961 | 0.348 |
| b03 | 12.63 | day | 0.137 | 0.045 | 0.911 | 0.659 |
| b03a | 15.43 | day | 0.176 | 0.031 | 0.944 | 0.63 |
| b04 | 18.83 | night | 0.047 | 0.013 | 0.425 | 0.926 |
| b04a | 21.93 | night | 0.074 | 0.014 | 0.836 | 0.801 |
| b05 | 25.0 | day | 0.772 | 0.129 | 0.952 | 0.181 |
| b05a | 27.57 | day | 0.656 | 0.147 | 0.777 | 0.418 |
| b06 | 30.2 | day | 0.699 | 0.032 | 0.959 | 0.33 |
| b06a | 32.5 | day | 0.744 | 0.315 | 0.954 | 0.187 |
| b06b | 33.47 | day | 0.685 | 0.033 | 0.953 | 0.357 |
| b07 | 36.37 | day | 0.347 | 0.051 | 0.905 | 0.441 |
| b07a | 39.47 | day | 0.09 | 0.029 | 0.957 | 0.489 |
| b08 | 42.4 | day | 0.199 | 0.036 | 0.924 | 0.642 |
| b08a | 45.6 | day | 0.229 | 0.101 | 0.908 | 0.659 |
| b09 | 48.1 | day | 0.059 | 0.028 | 0.871 | 0.867 |
| b09a | 51.27 | day | 0.135 | 0.029 | 0.948 | 0.676 |
| b10 | 54.0 | golden | 0.06 | 0.02 | 0.519 | 0.928 |
| b10a | 56.3 | golden | 0.043 | 0.028 | 0.924 | 0.56 |
| b11 | 58.7 | night | 0.088 | 0.024 | 0.816 | 0.671 |
| b11a | 61.23 | night | 0.049 | 0.03 | 0.353 | 0.965 |
| b12 | 63.8 | night | 0.038 | 0.018 | 0.645 | 0.896 |
| b12a | 66.37 | night | 0.075 | 0.018 | 0.791 | 0.797 |
| b13 | 68.47 | night | 0.062 | 0.013 | 0.797 | 0.856 |
| b13a | 71.37 | night | 0.035 | 0.013 | 0.289 | 0.933 |
| b14 | 75.17 | night | 0.026 | 0.026 | 0.093 | 0.444 |

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
- day exposure (heuristic): median luma of day scenes 0.347, reference ~0.57 (range 0.5-0.66)
- no crushed blacks (heuristic): scenes with p5 luma < 0.04: ['b02a', 'b03a', 'b06', 'b06b', 'b07a', 'b08', 'b09', 'b09a', 'b10', 'b10a']
