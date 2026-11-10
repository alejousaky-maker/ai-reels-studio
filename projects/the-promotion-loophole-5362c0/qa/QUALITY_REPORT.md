# QUALITY REPORT

Video: `the-promotion-loophole_master_v2.mp4` · 1440x2560 · 30.00 fps · 51.03 s · 45.63 MB

**Technical result: PASS** · Approved for delivery: **no — human review pending**

## Measured checks
| check | ok | blocking | detail |
|---|---|---|---|
| video stream | ✅ | yes | 1 video stream(s), codec h264 |
| 9:16 ratio | ✅ | yes | 1440x2560 |
| fps | ✅ | yes | 30.000 fps |
| duration | ✅ | yes | video 51.033 s, storyboard 51.033 s |
| single audio track | ✅ | yes | 1 audio stream(s) (a silent extra track means the mux mapped the wrong stream) |
| AAC 48 kHz | ✅ | yes | aac 48000 Hz 2 ch |
| A/V length match | ✅ | yes | audio 51.033 s vs video 51.033 s |
| no black spans | ✅ | yes | 0 span(s) [] |
| no white spans (>0.2 s) | ✅ | yes | 0 span(s) [] — 4-frame flashes are shorter and allowed |
| no frozen holds >= 1.5 s | ✅ | no | 0 freeze(s) >= 0.6 s: [] |
| loudness ~ -14 LUFS | ✅ | no | integrated -14.0 LUFS (target -14, platform normalisation) |
| true peak <= -1 dBTP | ✅ | yes | true peak -1.7 dBTP |
| no long silences | ✅ | no | 0 silence(s) >= 1.2 s: [] |
| render matches control stills | ✅ | yes | 42 frames compared; mismatches: [] |
| day exposure (heuristic) | ✅ | no | median luma of day scenes 0.623, reference ~0.57 (range 0.5-0.66) |
| no crushed blacks (heuristic) | ❌ | no | scenes with p5 luma < 0.04: ['b01', 'b03', 'b04', 'b05', 'b07', 'b08', 'b10', 'b12', 'b14'] |

## Per-scene picture stats (heuristic, vs reference: day median luma ~0.57, p5 ~0.23)
| scene | t | light | median Y | p5 | p95 | sat |
|---|---|---|---|---|---|---|
| b01 | 3.0 | day | 0.568 | 0.027 | 0.84 | 0.44 |
| b02 | 7.63 | golden | 0.465 | 0.124 | 0.669 | 0.586 |
| b03 | 11.0 | golden | 0.349 | 0.032 | 0.727 | 0.544 |
| b04 | 14.07 | golden | 0.372 | 0.032 | 0.733 | 0.552 |
| b05 | 17.37 | day | 0.563 | 0.029 | 0.841 | 0.392 |
| b06 | 20.33 | day | 0.652 | 0.131 | 0.735 | 0.321 |
| b07 | 24.33 | day | 0.621 | 0.026 | 0.758 | 0.414 |
| b08 | 29.5 | day | 0.581 | 0.012 | 0.764 | 0.479 |
| b09 | 32.6 | day | 0.625 | 0.054 | 0.818 | 0.377 |
| b10 | 34.53 | golden | 0.399 | 0.032 | 0.763 | 0.535 |
| b11 | 37.1 | golden | 0.436 | 0.117 | 0.647 | 0.612 |
| b12 | 40.93 | day | 0.633 | 0.031 | 0.8 | 0.408 |
| b13 | 45.07 | day | 0.645 | 0.187 | 0.718 | 0.319 |
| b14 | 49.0 | golden | 0.532 | 0.032 | 0.796 | 0.52 |

## Rubric (0-10)
| area | score | basis |
|---|---|---|
| Comprensión narrativa y gancho inicial | — | pending human review (see checklist) |
| Coherencia de personajes y escenarios | — | pending human review (see checklist) |
| Cámara y pacing | — | pending human review (see checklist) |
| Contornos / ilustración / materiales | — | pending human review (see checklist) |
| Iluminación, color y profundidad | — | pending human review (see checklist) |
| Claridad y naturalidad de la voz | — | pending human review (see checklist) |
| SFX, música y sincronía | — | computed loudness -14.0 LUFS / TP -1.7 dBTP; sync and taste need a listen |
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
- no crushed blacks (heuristic): scenes with p5 luma < 0.04: ['b01', 'b03', 'b04', 'b05', 'b07', 'b08', 'b10', 'b12', 'b14']
