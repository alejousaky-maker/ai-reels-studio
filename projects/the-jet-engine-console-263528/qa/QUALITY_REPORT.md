# QUALITY REPORT

Video: `the-jet-engine-console_master_v1.mp4` · 1440x2560 · 30.00 fps · 49.50 s · 52.32 MB

**Technical result: PASS** · Approved for delivery: **no — human review pending**

## Measured checks
| check | ok | blocking | detail |
|---|---|---|---|
| video stream | ✅ | yes | 1 video stream(s), codec h264 |
| 9:16 ratio | ✅ | yes | 1440x2560 |
| fps | ✅ | yes | 30.000 fps |
| duration | ✅ | yes | video 49.500 s, storyboard 49.500 s |
| single audio track | ✅ | yes | 1 audio stream(s) (a silent extra track means the mux mapped the wrong stream) |
| AAC 48 kHz | ✅ | yes | aac 48000 Hz 2 ch |
| A/V length match | ✅ | yes | audio 49.500 s vs video 49.500 s |
| no black spans | ✅ | yes | 0 span(s) [] |
| no white spans (>0.2 s) | ✅ | yes | 0 span(s) [] — 4-frame flashes are shorter and allowed |
| no frozen holds >= 1.5 s | ✅ | no | 0 freeze(s) >= 0.6 s: [] |
| loudness ~ -14 LUFS | ✅ | no | integrated -14.0 LUFS (target -14, platform normalisation) |
| true peak <= -1 dBTP | ✅ | yes | true peak -2.0 dBTP |
| no long silences | ✅ | no | 0 silence(s) >= 1.2 s: [] |
| render matches control stills | ✅ | yes | 63 frames compared; mismatches: [] |
| no crushed blacks (heuristic) | ✅ | no | scenes with p5 luma < 0.04: [] |

## Per-scene picture stats (heuristic, vs reference: day median luma ~0.57, p5 ~0.23)
| scene | t | light | median Y | p5 | p95 | sat |
|---|---|---|---|---|---|---|
| b01 | 1.7 | night | 0.088 | 0.015 | 0.766 | 0.813 |
| b01a | 4.5 | night | 0.101 | 0.018 | 0.753 | 0.825 |
| b01b | 6.03 | night | 0.072 | 0.017 | 0.549 | 0.841 |
| b02 | 8.3 | night | 0.112 | 0.012 | 0.782 | 0.771 |
| b03 | 11.57 | night | 0.13 | 0.011 | 0.845 | 0.659 |
| b04 | 14.0 | night | 0.078 | 0.011 | 0.726 | 0.831 |
| b04a | 16.13 | night | 0.104 | 0.017 | 0.768 | 0.782 |
| b05 | 17.93 | night | 0.095 | 0.009 | 0.731 | 0.824 |
| b05a | 19.3 | night | 0.086 | 0.023 | 0.726 | 0.823 |
| b06 | 20.83 | night | 0.11 | 0.021 | 0.687 | 0.81 |
| b07 | 22.87 | night | 0.094 | 0.013 | 0.786 | 0.743 |
| b07a | 25.23 | night | 0.084 | 0.011 | 0.861 | 0.664 |
| b08 | 27.4 | night | 0.076 | 0.011 | 0.624 | 0.88 |
| b08a | 29.07 | night | 0.074 | 0.028 | 0.537 | 0.84 |
| b09 | 32.17 | night | 0.088 | 0.021 | 0.677 | 0.805 |
| b10 | 35.33 | night | 0.107 | 0.011 | 0.785 | 0.656 |
| b11 | 36.73 | night | 0.078 | 0.017 | 0.608 | 0.829 |
| b12 | 39.17 | night | 0.316 | 0.049 | 0.507 | 0.514 |
| b13 | 43.1 | night | 0.24 | 0.042 | 0.812 | 0.626 |
| b14 | 45.7 | night | 0.209 | 0.019 | 0.798 | 0.691 |
| b14a | 47.9 | night | 0.21 | 0.011 | 0.84 | 0.641 |

## Rubric (0-10)
| area | score | basis |
|---|---|---|
| Comprensión narrativa y gancho inicial | — | pending human review (see checklist) |
| Coherencia de personajes y escenarios | — | pending human review (see checklist) |
| Cámara y pacing | — | pending human review (see checklist) |
| Contornos / ilustración / materiales | — | pending human review (see checklist) |
| Iluminación, color y profundidad | — | pending human review (see checklist) |
| Claridad y naturalidad de la voz | — | pending human review (see checklist) |
| SFX, música y sincronía | — | computed loudness -14.0 LUFS / TP -2.0 dBTP; sync and taste need a listen |
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
