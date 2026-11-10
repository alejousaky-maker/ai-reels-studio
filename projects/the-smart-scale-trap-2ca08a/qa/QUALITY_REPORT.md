# QUALITY REPORT

Video: `the-smart-scale-trap_master_v2.mp4` · 1440x2560 · 30.00 fps · 46.53 s · 43.74 MB

**Technical result: PASS** · Approved for delivery: **no — human review pending**

## Measured checks
| check | ok | blocking | detail |
|---|---|---|---|
| video stream | ✅ | yes | 1 video stream(s), codec h264 |
| 9:16 ratio | ✅ | yes | 1440x2560 |
| fps | ✅ | yes | 30.000 fps |
| duration | ✅ | yes | video 46.533 s, storyboard 46.533 s |
| single audio track | ✅ | yes | 1 audio stream(s) (a silent extra track means the mux mapped the wrong stream) |
| AAC 48 kHz | ✅ | yes | aac 48000 Hz 2 ch |
| A/V length match | ✅ | yes | audio 46.533 s vs video 46.533 s |
| no black spans | ✅ | yes | 0 span(s) [] |
| no white spans (>0.2 s) | ✅ | yes | 0 span(s) [] — 4-frame flashes are shorter and allowed |
| no frozen holds >= 1.5 s | ✅ | no | 0 freeze(s) >= 0.6 s: [] |
| loudness ~ -14 LUFS | ✅ | no | integrated -14.0 LUFS (target -14, platform normalisation) |
| true peak <= -1 dBTP | ✅ | yes | true peak -1.9 dBTP |
| no long silences | ✅ | no | 0 silence(s) >= 1.2 s: [] |
| render matches control stills | ✅ | yes | 42 frames compared; mismatches: [] |
| day exposure (heuristic) | ✅ | no | median luma of day scenes 0.651, reference ~0.57 (range 0.5-0.66) |
| no crushed blacks (heuristic) | ❌ | no | scenes with p5 luma < 0.04: ['b14'] |

## Per-scene picture stats (heuristic, vs reference: day median luma ~0.57, p5 ~0.23)
| scene | t | light | median Y | p5 | p95 | sat |
|---|---|---|---|---|---|---|
| b01 | 2.87 | day | 0.657 | 0.129 | 0.95 | 0.237 |
| b02 | 6.67 | day | 0.816 | 0.224 | 0.971 | 0.19 |
| b03 | 9.8 | golden | 0.429 | 0.154 | 0.622 | 0.603 |
| b04 | 13.67 | day | 0.642 | 0.114 | 0.908 | 0.28 |
| b05 | 16.53 | night | 0.099 | 0.036 | 0.713 | 0.777 |
| b06 | 19.27 | night | 0.102 | 0.026 | 0.782 | 0.736 |
| b07 | 22.47 | night | 0.106 | 0.026 | 0.782 | 0.711 |
| b08 | 25.5 | golden | 0.45 | 0.159 | 0.674 | 0.594 |
| b09 | 29.37 | day | 0.645 | 0.134 | 0.953 | 0.239 |
| b10 | 33.0 | night | 0.102 | 0.026 | 0.782 | 0.741 |
| b11 | 35.87 | day | 0.531 | 0.045 | 0.806 | 0.424 |
| b12 | 38.87 | day | 0.679 | 0.236 | 0.898 | 0.278 |
| b13 | 41.07 | golden | 0.637 | 0.193 | 0.816 | 0.511 |
| b14 | 44.27 | golden | 0.471 | 0.031 | 0.839 | 0.502 |

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
- no crushed blacks (heuristic): scenes with p5 luma < 0.04: ['b14']
