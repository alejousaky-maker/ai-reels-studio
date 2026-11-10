# QUALITY REPORT

Video: `the-generational-pre-order_master_v1.mp4` · 1440x2560 · 30.00 fps · 48.07 s · 53.29 MB

**Technical result: PASS** · Approved for delivery: **no — human review pending**

## Measured checks
| check | ok | blocking | detail |
|---|---|---|---|
| video stream | ✅ | yes | 1 video stream(s), codec h264 |
| 9:16 ratio | ✅ | yes | 1440x2560 |
| fps | ✅ | yes | 30.000 fps |
| duration | ✅ | yes | video 48.067 s, storyboard 48.067 s |
| single audio track | ✅ | yes | 1 audio stream(s) (a silent extra track means the mux mapped the wrong stream) |
| AAC 48 kHz | ✅ | yes | aac 48000 Hz 2 ch |
| A/V length match | ✅ | yes | audio 48.067 s vs video 48.067 s |
| no black spans | ✅ | yes | 0 span(s) [] |
| no white spans (>0.2 s) | ✅ | yes | 0 span(s) [] — 4-frame flashes are shorter and allowed |
| no frozen holds >= 1.5 s | ✅ | no | 0 freeze(s) >= 0.6 s: [] |
| loudness ~ -14 LUFS | ✅ | no | integrated -14.0 LUFS (target -14, platform normalisation) |
| true peak <= -1 dBTP | ✅ | yes | true peak -1.9 dBTP |
| no long silences | ✅ | no | 0 silence(s) >= 1.2 s: [] |
| render matches control stills | ✅ | yes | 60 frames compared; mismatches: [] |
| day exposure (heuristic) | ✅ | no | median luma of day scenes 0.589, reference ~0.57 (range 0.5-0.66) |
| no crushed blacks (heuristic) | ❌ | no | scenes with p5 luma < 0.04: ['b01a', 'b01b', 'b03', 'b06a', 'b07b', 'b14', 'b14a'] |

## Per-scene picture stats (heuristic, vs reference: day median luma ~0.57, p5 ~0.23)
| scene | t | light | median Y | p5 | p95 | sat |
|---|---|---|---|---|---|---|
| b01 | 1.2 | day | 0.574 | 0.076 | 0.858 | 0.508 |
| b01a | 3.4 | day | 0.558 | 0.028 | 0.932 | 0.395 |
| b01b | 5.37 | day | 0.569 | 0.016 | 0.852 | 0.52 |
| b02 | 8.2 | day | 0.603 | 0.085 | 0.917 | 0.449 |
| b03 | 11.1 | day | 0.427 | 0.029 | 0.801 | 0.538 |
| b04 | 13.87 | day | 0.569 | 0.128 | 0.941 | 0.446 |
| b05 | 17.3 | golden | 0.402 | 0.086 | 0.682 | 0.623 |
| b06 | 19.8 | golden | 0.402 | 0.048 | 0.673 | 0.684 |
| b06a | 21.37 | golden | 0.305 | 0.027 | 0.792 | 0.737 |
| b07 | 22.67 | golden | 0.407 | 0.044 | 0.678 | 0.64 |
| b07a | 23.67 | golden | 0.407 | 0.109 | 0.66 | 0.695 |
| b07b | 24.77 | golden | 0.399 | 0.026 | 0.896 | 0.493 |
| b08 | 26.6 | night | 0.189 | 0.023 | 0.88 | 0.589 |
| b09 | 28.8 | night | 0.184 | 0.047 | 0.417 | 0.643 |
| b10 | 31.33 | night | 0.171 | 0.009 | 0.782 | 0.707 |
| b11 | 34.33 | night | 0.193 | 0.021 | 0.875 | 0.485 |
| b12 | 37.77 | day | 0.625 | 0.124 | 0.957 | 0.23 |
| b13 | 41.43 | day | 0.625 | 0.133 | 0.953 | 0.28 |
| b14 | 44.07 | day | 0.61 | 0.037 | 0.968 | 0.314 |
| b14a | 46.53 | day | 0.618 | 0.029 | 0.932 | 0.306 |

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
- no crushed blacks (heuristic): scenes with p5 luma < 0.04: ['b01a', 'b01b', 'b03', 'b06a', 'b07b', 'b14', 'b14a']
