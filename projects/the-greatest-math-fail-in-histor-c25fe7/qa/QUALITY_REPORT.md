# QUALITY REPORT

Video: `the-greatest-math-fail-in-history_master_v3.mp4` · 1440x2560 · 30.00 fps · 51.53 s · 63.25 MB

**Technical result: PASS** · Approved for delivery: **no — human review pending**

## Measured checks
| check | ok | blocking | detail |
|---|---|---|---|
| video stream | ✅ | yes | 1 video stream(s), codec h264 |
| 9:16 ratio | ✅ | yes | 1440x2560 |
| fps | ✅ | yes | 30.000 fps |
| duration | ✅ | yes | video 51.533 s, storyboard 51.533 s |
| single audio track | ✅ | yes | 1 audio stream(s) (a silent extra track means the mux mapped the wrong stream) |
| AAC 48 kHz | ✅ | yes | aac 48000 Hz 2 ch |
| A/V length match | ✅ | yes | audio 51.533 s vs video 51.533 s |
| no black spans | ✅ | yes | 0 span(s) [] |
| no white spans (>0.2 s) | ✅ | yes | 0 span(s) [] — 4-frame flashes are shorter and allowed |
| no frozen holds >= 1.5 s | ✅ | no | 0 freeze(s) >= 0.6 s: [] |
| loudness ~ -14 LUFS | ✅ | no | integrated -14.0 LUFS (target -14, platform normalisation) |
| true peak <= -1 dBTP | ✅ | yes | true peak -1.9 dBTP |
| no long silences | ✅ | no | 0 silence(s) >= 1.2 s: [] |
| render matches control stills | ✅ | yes | 42 frames compared; mismatches: [] |
| day exposure (heuristic) | ✅ | no | median luma of day scenes 0.580, reference ~0.57 (range 0.5-0.66) |
| no crushed blacks (heuristic) | ❌ | no | scenes with p5 luma < 0.04: ['b02', 'b05', 'b07', 'b10', 'b14'] |

## Per-scene picture stats (heuristic, vs reference: day median luma ~0.57, p5 ~0.23)
| scene | t | light | median Y | p5 | p95 | sat |
|---|---|---|---|---|---|---|
| b01 | 1.87 | golden | 0.583 | 0.045 | 0.772 | 0.684 |
| b02 | 5.07 | golden | 0.583 | 0.031 | 0.846 | 0.654 |
| b03 | 8.43 | day | 0.601 | 0.181 | 0.863 | 0.313 |
| b04 | 12.63 | day | 0.595 | 0.053 | 0.873 | 0.373 |
| b05 | 16.37 | day | 0.505 | 0.035 | 0.86 | 0.451 |
| b06 | 20.13 | day | 0.58 | 0.128 | 0.786 | 0.37 |
| b07 | 23.53 | day | 0.477 | 0.033 | 0.886 | 0.435 |
| b08 | 26.77 | day | 0.593 | 0.118 | 0.777 | 0.343 |
| b09 | 30.23 | day | 0.509 | 0.19 | 0.839 | 0.435 |
| b10 | 33.73 | day | 0.503 | 0.035 | 0.9 | 0.455 |
| b11 | 38.17 | golden | 0.423 | 0.058 | 0.815 | 0.7 |
| b12 | 42.43 | day | 0.783 | 0.072 | 0.902 | 0.344 |
| b13 | 45.93 | golden | 0.561 | 0.066 | 0.674 | 0.713 |
| b14 | 49.53 | golden | 0.58 | 0.031 | 0.852 | 0.672 |

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
- no crushed blacks (heuristic): scenes with p5 luma < 0.04: ['b02', 'b05', 'b07', 'b10', 'b14']
