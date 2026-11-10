# QUALITY REPORT

Video: `latest_master.mp4` · 1440x2560 · 30.00 fps · 57.83 s · 80.83 MB

**Technical result: PASS** · Approved for delivery: **no — human review pending**

## Measured checks
| check | ok | blocking | detail |
|---|---|---|---|
| video stream | ✅ | yes | 1 video stream(s), codec h264 |
| 9:16 ratio | ✅ | yes | 1440x2560 |
| fps | ✅ | yes | 30.000 fps |
| duration | ✅ | yes | video 57.833 s, storyboard 57.833 s |
| single audio track | ✅ | yes | 1 audio stream(s) (a silent extra track means the mux mapped the wrong stream) |
| AAC 48 kHz | ✅ | yes | aac 48000 Hz 2 ch |
| A/V length match | ✅ | yes | audio 57.833 s vs video 57.833 s |
| no black spans | ✅ | yes | 0 span(s) [] |
| no white spans (>0.2 s) | ✅ | yes | 0 span(s) [] — 4-frame flashes are shorter and allowed |
| no frozen holds >= 1.5 s | ✅ | no | 0 freeze(s) >= 0.6 s: [] |
| loudness ~ -14 LUFS | ✅ | no | integrated -14.1 LUFS (target -14, platform normalisation) |
| true peak <= -1 dBTP | ✅ | yes | true peak -1.7 dBTP |
| no long silences | ✅ | no | 0 silence(s) >= 1.2 s: [] |
| render matches control stills | ✅ | yes | 39 frames compared; mismatches: [] |
| day exposure (heuristic) | ✅ | no | median luma of day scenes 0.642, reference ~0.57 (range 0.5-0.66) |
| no crushed blacks (heuristic) | ❌ | no | scenes with p5 luma < 0.04: ['b02', 'b13'] |

## Per-scene picture stats (heuristic, vs reference: day median luma ~0.57, p5 ~0.23)
| scene | t | light | median Y | p5 | p95 | sat |
|---|---|---|---|---|---|---|
| b01 | 3.4 | day | 0.722 | 0.255 | 0.91 | 0.344 |
| b02 | 7.57 | day | 0.369 | 0.035 | 0.818 | 0.51 |
| b03 | 10.5 | day | 0.568 | 0.187 | 0.839 | 0.326 |
| b04 | 14.7 | day | 0.717 | 0.201 | 0.893 | 0.433 |
| b05 | 18.17 | golden | 0.385 | 0.095 | 0.535 | 0.617 |
| b06 | 22.07 | golden | 0.345 | 0.092 | 0.61 | 0.64 |
| b07 | 25.63 | golden | 0.541 | 0.198 | 0.688 | 0.505 |
| b08 | 30.7 | golden | 0.292 | 0.114 | 0.417 | 0.532 |
| b09 | 37.1 | night | 0.275 | 0.1 | 0.393 | 0.418 |
| b10 | 41.53 | night | 0.149 | 0.076 | 0.324 | 0.665 |
| b11 | 46.27 | night | 0.206 | 0.07 | 0.529 | 0.631 |
| b12 | 51.73 | golden | 0.309 | 0.192 | 0.432 | 0.498 |
| b13 | 56.13 | golden | 0.384 | 0.031 | 0.79 | 0.616 |

## Rubric (0-10)
| area | score | basis |
|---|---|---|
| Comprensión narrativa y gancho inicial | — | pending human review (see checklist) |
| Coherencia de personajes y escenarios | — | pending human review (see checklist) |
| Cámara y pacing | — | pending human review (see checklist) |
| Contornos / ilustración / materiales | — | pending human review (see checklist) |
| Iluminación, color y profundidad | — | pending human review (see checklist) |
| Claridad y naturalidad de la voz | — | pending human review (see checklist) |
| SFX, música y sincronía | — | computed loudness -14.1 LUFS / TP -1.7 dBTP; sync and taste need a listen |
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
- no crushed blacks (heuristic): scenes with p5 luma < 0.04: ['b02', 'b13']
