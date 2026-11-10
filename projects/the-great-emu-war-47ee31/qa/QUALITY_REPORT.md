# QUALITY REPORT

Video: `the-great-emu-war_master_v1.mp4` · 1440x2560 · 30.00 fps · 53.03 s · 55.07 MB

**Technical result: PASS** · Approved for delivery: **no — human review pending**

## Measured checks
| check | ok | blocking | detail |
|---|---|---|---|
| video stream | ✅ | yes | 1 video stream(s), codec h264 |
| 9:16 ratio | ✅ | yes | 1440x2560 |
| fps | ✅ | yes | 30.000 fps |
| duration | ✅ | yes | video 53.033 s, storyboard 53.033 s |
| single audio track | ✅ | yes | 1 audio stream(s) (a silent extra track means the mux mapped the wrong stream) |
| AAC 48 kHz | ✅ | yes | aac 48000 Hz 2 ch |
| A/V length match | ✅ | yes | audio 53.033 s vs video 53.033 s |
| no black spans | ✅ | yes | 0 span(s) [] |
| no white spans (>0.2 s) | ✅ | yes | 0 span(s) [] — 4-frame flashes are shorter and allowed |
| no frozen holds >= 1.5 s | ✅ | no | 0 freeze(s) >= 0.6 s: [] |
| loudness ~ -14 LUFS | ✅ | no | integrated -14.1 LUFS (target -14, platform normalisation) |
| true peak <= -1 dBTP | ✅ | yes | true peak -1.9 dBTP |
| no long silences | ✅ | no | 0 silence(s) >= 1.2 s: [] |
| render matches control stills | ✅ | yes | 39 frames compared; mismatches: [] |
| day exposure (heuristic) | ✅ | no | median luma of day scenes 0.658, reference ~0.57 (range 0.5-0.66) |
| no crushed blacks (heuristic) | ❌ | no | scenes with p5 luma < 0.04: ['b07', 'b08', 'b09'] |

## Per-scene picture stats (heuristic, vs reference: day median luma ~0.57, p5 ~0.23)
| scene | t | light | median Y | p5 | p95 | sat |
|---|---|---|---|---|---|---|
| b01 | 3.23 | day | 0.684 | 0.554 | 0.862 | 0.612 |
| b02 | 8.23 | day | 0.666 | 0.227 | 0.877 | 0.593 |
| b03 | 13.1 | day | 0.658 | 0.143 | 0.877 | 0.603 |
| b04 | 18.6 | golden | 0.478 | 0.224 | 0.767 | 0.743 |
| b05 | 22.2 | golden | 0.484 | 0.2 | 0.807 | 0.673 |
| b06 | 25.6 | day | 0.684 | 0.344 | 0.858 | 0.61 |
| b07 | 29.33 | day | 0.646 | 0.032 | 0.858 | 0.588 |
| b08 | 32.47 | day | 0.594 | 0.033 | 0.843 | 0.445 |
| b09 | 35.23 | day | 0.609 | 0.033 | 0.863 | 0.456 |
| b10 | 38.37 | golden | 0.484 | 0.334 | 0.762 | 0.777 |
| b11 | 42.0 | golden | 0.553 | 0.218 | 0.777 | 0.748 |
| b12 | 45.43 | golden | 0.573 | 0.291 | 0.767 | 0.756 |
| b13 | 50.13 | golden | 0.564 | 0.086 | 0.804 | 0.726 |

## Rubric (0-10)
| area | score | basis |
|---|---|---|
| Comprensión narrativa y gancho inicial | — | pending human review (see checklist) |
| Coherencia de personajes y escenarios | — | pending human review (see checklist) |
| Cámara y pacing | — | pending human review (see checklist) |
| Contornos / ilustración / materiales | — | pending human review (see checklist) |
| Iluminación, color y profundidad | — | pending human review (see checklist) |
| Claridad y naturalidad de la voz | — | pending human review (see checklist) |
| SFX, música y sincronía | — | computed loudness -14.1 LUFS / TP -1.9 dBTP; sync and taste need a listen |
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
- no crushed blacks (heuristic): scenes with p5 luma < 0.04: ['b07', 'b08', 'b09']
