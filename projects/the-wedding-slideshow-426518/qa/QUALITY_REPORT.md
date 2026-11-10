# QUALITY REPORT

Video: `the-wedding-slideshow_master_v1.mp4` · 1440x2560 · 30.00 fps · 43.07 s · 52.07 MB

**Technical result: PASS** · Approved for delivery: **no — human review pending**

## Measured checks
| check | ok | blocking | detail |
|---|---|---|---|
| video stream | ✅ | yes | 1 video stream(s), codec h264 |
| 9:16 ratio | ✅ | yes | 1440x2560 |
| fps | ✅ | yes | 30.000 fps |
| duration | ✅ | yes | video 43.067 s, storyboard 43.067 s |
| single audio track | ✅ | yes | 1 audio stream(s) (a silent extra track means the mux mapped the wrong stream) |
| AAC 48 kHz | ✅ | yes | aac 48000 Hz 2 ch |
| A/V length match | ✅ | yes | audio 43.067 s vs video 43.067 s |
| no black spans | ✅ | yes | 0 span(s) [] |
| no white spans (>0.2 s) | ✅ | yes | 0 span(s) [] — 4-frame flashes are shorter and allowed |
| no frozen holds >= 1.5 s | ✅ | no | 0 freeze(s) >= 0.6 s: [] |
| loudness ~ -14 LUFS | ✅ | no | integrated -14.1 LUFS (target -14, platform normalisation) |
| true peak <= -1 dBTP | ✅ | yes | true peak -1.8 dBTP |
| no long silences | ✅ | no | 0 silence(s) >= 1.2 s: [] |
| render matches control stills | ✅ | yes | 39 frames compared; mismatches: [] |
| day exposure (heuristic) | ✅ | no | median luma of day scenes 0.625, reference ~0.57 (range 0.5-0.66) |
| no crushed blacks (heuristic) | ❌ | no | scenes with p5 luma < 0.04: ['b04', 'b10', 'b13'] |

## Per-scene picture stats (heuristic, vs reference: day median luma ~0.57, p5 ~0.23)
| scene | t | light | median Y | p5 | p95 | sat |
|---|---|---|---|---|---|---|
| b01 | 2.93 | day | 0.685 | 0.131 | 0.899 | 0.378 |
| b02 | 8.0 | day | 0.625 | 0.127 | 0.793 | 0.34 |
| b03 | 12.03 | night | 0.102 | 0.008 | 0.787 | 0.714 |
| b04 | 14.97 | day | 0.613 | 0.013 | 0.841 | 0.298 |
| b05 | 18.0 | day | 0.632 | 0.048 | 0.792 | 0.304 |
| b06 | 21.77 | day | 0.679 | 0.199 | 0.929 | 0.369 |
| b07 | 26.43 | day | 0.601 | 0.078 | 0.857 | 0.397 |
| b08 | 30.17 | day | 0.624 | 0.074 | 0.827 | 0.372 |
| b09 | 32.07 | day | 0.626 | 0.083 | 0.905 | 0.231 |
| b10 | 34.53 | day | 0.613 | 0.013 | 0.837 | 0.309 |
| b11 | 36.6 | day | 0.632 | 0.124 | 0.755 | 0.236 |
| b12 | 38.8 | day | 0.599 | 0.284 | 0.791 | 0.266 |
| b13 | 41.67 | golden | 0.492 | 0.01 | 0.856 | 0.494 |

## Rubric (0-10)
| area | score | basis |
|---|---|---|
| Comprensión narrativa y gancho inicial | — | pending human review (see checklist) |
| Coherencia de personajes y escenarios | — | pending human review (see checklist) |
| Cámara y pacing | — | pending human review (see checklist) |
| Contornos / ilustración / materiales | — | pending human review (see checklist) |
| Iluminación, color y profundidad | — | pending human review (see checklist) |
| Claridad y naturalidad de la voz | — | pending human review (see checklist) |
| SFX, música y sincronía | — | computed loudness -14.1 LUFS / TP -1.8 dBTP; sync and taste need a listen |
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
- no crushed blacks (heuristic): scenes with p5 luma < 0.04: ['b04', 'b10', 'b13']
