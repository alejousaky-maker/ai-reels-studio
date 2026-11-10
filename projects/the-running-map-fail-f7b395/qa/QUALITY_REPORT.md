# QUALITY REPORT

Video: `the-running-map-fail_master_v1.mp4` · 1440x2560 · 30.00 fps · 44.13 s · 37.04 MB

**Technical result: PASS** · Approved for delivery: **no — human review pending**

## Measured checks
| check | ok | blocking | detail |
|---|---|---|---|
| video stream | ✅ | yes | 1 video stream(s), codec h264 |
| 9:16 ratio | ✅ | yes | 1440x2560 |
| fps | ✅ | yes | 30.000 fps |
| duration | ✅ | yes | video 44.133 s, storyboard 44.133 s |
| single audio track | ✅ | yes | 1 audio stream(s) (a silent extra track means the mux mapped the wrong stream) |
| AAC 48 kHz | ✅ | yes | aac 48000 Hz 2 ch |
| A/V length match | ✅ | yes | audio 44.133 s vs video 44.133 s |
| no black spans | ✅ | yes | 0 span(s) [] |
| no white spans (>0.2 s) | ✅ | yes | 0 span(s) [] — 4-frame flashes are shorter and allowed |
| no frozen holds >= 1.5 s | ✅ | no | 0 freeze(s) >= 0.6 s: [] |
| loudness ~ -14 LUFS | ✅ | no | integrated -14.0 LUFS (target -14, platform normalisation) |
| true peak <= -1 dBTP | ✅ | yes | true peak -1.9 dBTP |
| no long silences | ✅ | no | 0 silence(s) >= 1.2 s: [] |
| render matches control stills | ✅ | yes | 39 frames compared; mismatches: [] |
| day exposure (heuristic) | ✅ | no | median luma of day scenes 0.610, reference ~0.57 (range 0.5-0.66) |
| no crushed blacks (heuristic) | ❌ | no | scenes with p5 luma < 0.04: ['b03', 'b04', 'b06', 'b07', 'b09', 'b13'] |

## Per-scene picture stats (heuristic, vs reference: day median luma ~0.57, p5 ~0.23)
| scene | t | light | median Y | p5 | p95 | sat |
|---|---|---|---|---|---|---|
| b01 | 3.73 | day | 0.63 | 0.057 | 0.893 | 0.386 |
| b02 | 8.8 | golden | 0.543 | 0.189 | 0.749 | 0.713 |
| b03 | 11.6 | day | 0.39 | 0.035 | 0.913 | 0.446 |
| b04 | 13.87 | day | 0.589 | 0.037 | 0.906 | 0.402 |
| b05 | 17.03 | day | 0.635 | 0.195 | 0.919 | 0.335 |
| b06 | 20.23 | day | 0.605 | 0.035 | 0.873 | 0.398 |
| b07 | 22.67 | day | 0.59 | 0.034 | 0.887 | 0.417 |
| b08 | 25.33 | day | 0.616 | 0.22 | 0.872 | 0.255 |
| b09 | 28.0 | day | 0.604 | 0.034 | 0.87 | 0.419 |
| b10 | 31.0 | day | 0.646 | 0.278 | 0.886 | 0.259 |
| b11 | 34.73 | day | 0.647 | 0.248 | 0.87 | 0.324 |
| b12 | 38.8 | day | 0.61 | 0.059 | 0.894 | 0.266 |
| b13 | 42.3 | golden | 0.616 | 0.03 | 0.841 | 0.675 |

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
- no crushed blacks (heuristic): scenes with p5 luma < 0.04: ['b03', 'b04', 'b06', 'b07', 'b09', 'b13']
