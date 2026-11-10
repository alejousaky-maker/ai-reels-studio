# QUALITY REPORT

Video: `the-fortnite-pirate-token_master_v1.mp4` · 1440x2560 · 30.00 fps · 78.70 s · 95.56 MB

**Technical result: PASS** · Approved for delivery: **no — human review pending**

## Measured checks
| check | ok | blocking | detail |
|---|---|---|---|
| video stream | ✅ | yes | 1 video stream(s), codec h264 |
| 9:16 ratio | ✅ | yes | 1440x2560 |
| fps | ✅ | yes | 30.000 fps |
| duration | ✅ | yes | video 78.700 s, storyboard 78.700 s |
| single audio track | ✅ | yes | 1 audio stream(s) (a silent extra track means the mux mapped the wrong stream) |
| AAC 48 kHz | ✅ | yes | aac 48000 Hz 2 ch |
| A/V length match | ✅ | yes | audio 78.700 s vs video 78.700 s |
| no black spans | ✅ | yes | 0 span(s) [] |
| no white spans (>0.2 s) | ✅ | yes | 0 span(s) [] — 4-frame flashes are shorter and allowed |
| no frozen holds >= 1.5 s | ✅ | no | 1 freeze(s) >= 0.6 s: [(74.366667, None)] |
| loudness ~ -14 LUFS | ✅ | no | integrated -14.0 LUFS (target -14, platform normalisation) |
| true peak <= -1 dBTP | ✅ | yes | true peak -1.8 dBTP |
| no long silences | ✅ | no | 0 silence(s) >= 1.2 s: [] |
| render matches control stills | ✅ | yes | 81 frames compared; mismatches: [] |
| day exposure (heuristic) | ✅ | no | median luma of day scenes 0.541, reference ~0.57 (range 0.5-0.66) |
| no crushed blacks (heuristic) | ❌ | no | scenes with p5 luma < 0.04: ['b04a', 'b11'] |

## Per-scene picture stats (heuristic, vs reference: day median luma ~0.57, p5 ~0.23)
| scene | t | light | median Y | p5 | p95 | sat |
|---|---|---|---|---|---|---|
| b01 | 1.9 | night | 0.034 | 0.021 | 0.682 | 0.823 |
| b01a | 4.4 | night | 0.075 | 0.011 | 0.881 | 0.54 |
| b01b | 5.67 | night | 0.154 | 0.02 | 0.767 | 0.742 |
| b02 | 8.07 | night | 0.054 | 0.02 | 0.661 | 0.92 |
| b02a | 11.0 | night | 0.153 | 0.009 | 0.76 | 0.763 |
| b03 | 13.9 | night | 0.121 | 0.014 | 0.899 | 0.777 |
| b03a | 17.37 | night | 0.048 | 0.022 | 0.727 | 0.883 |
| b04 | 22.3 | day | 0.541 | 0.12 | 0.883 | 0.442 |
| b04a | 26.0 | day | 0.541 | 0.012 | 0.951 | 0.551 |
| b05 | 26.73 | night | 0.052 | 0.022 | 0.726 | 0.889 |
| b05a | 29.2 | night | 0.081 | 0.022 | 0.882 | 0.617 |
| b06 | 33.0 | day | 0.719 | 0.078 | 0.935 | 0.265 |
| b06a | 35.6 | day | 0.772 | 0.079 | 0.942 | 0.312 |
| b07 | 38.07 | night | 0.052 | 0.022 | 0.55 | 0.938 |
| b07a | 40.53 | night | 0.153 | 0.018 | 0.847 | 0.747 |
| b08 | 43.3 | night | 0.045 | 0.022 | 0.42 | 0.93 |
| b08a | 45.37 | night | 0.099 | 0.022 | 0.765 | 0.789 |
| b08b | 46.43 | night | 0.045 | 0.023 | 0.271 | 0.954 |
| b09 | 49.27 | night | 0.083 | 0.009 | 0.896 | 0.828 |
| b09a | 51.83 | night | 0.049 | 0.025 | 0.217 | 0.652 |
| b10 | 54.47 | day | 0.197 | 0.066 | 0.726 | 0.569 |
| b11 | 60.0 | day | 0.271 | 0.03 | 0.93 | 0.559 |
| b12 | 64.5 | golden | 0.212 | 0.108 | 0.302 | 0.842 |
| b12a | 66.93 | golden | 0.218 | 0.063 | 0.716 | 0.792 |
| b13 | 69.2 | night | 0.041 | 0.019 | 0.487 | 0.958 |
| b13a | 71.9 | night | 0.05 | 0.008 | 0.881 | 0.862 |
| b14 | 76.17 | night | 0.026 | 0.026 | 0.093 | 0.445 |

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
- no crushed blacks (heuristic): scenes with p5 luma < 0.04: ['b04a', 'b11']
