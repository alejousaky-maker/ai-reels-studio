# QUALITY REPORT

Video: `the-town-that-couldn-t-stop-dancing_standard_v3.mp4` · 1080x1920 · 30.00 fps · 63.70 s · 51.92 MB

**Technical result: PASS** · Approved for delivery: **no — human review pending**

## Measured checks
| check | ok | blocking | detail |
|---|---|---|---|
| video stream | ✅ | yes | 1 video stream(s), codec h264 |
| 9:16 ratio | ✅ | yes | 1080x1920 |
| fps | ✅ | yes | 30.000 fps |
| duration | ✅ | yes | video 63.700 s, storyboard 63.700 s |
| single audio track | ✅ | yes | 1 audio stream(s) (a silent extra track means the mux mapped the wrong stream) |
| AAC 48 kHz | ✅ | yes | aac 48000 Hz 2 ch |
| A/V length match | ✅ | yes | audio 63.700 s vs video 63.700 s |
| no black spans | ✅ | yes | 0 span(s) [] |
| no white spans (>0.2 s) | ✅ | yes | 0 span(s) [] — 4-frame flashes are shorter and allowed |
| no frozen holds >= 1.5 s | ✅ | no | 0 freeze(s) >= 0.6 s: [] |
| loudness ~ -14 LUFS | ✅ | no | integrated -14.0 LUFS (target -14, platform normalisation) |
| true peak <= -1 dBTP | ✅ | yes | true peak -1.9 dBTP |
| no long silences | ✅ | no | 0 silence(s) >= 1.2 s: [] |
| day exposure (heuristic) | ✅ | no | median luma of day scenes 0.571, reference ~0.57 (range 0.5-0.66) |
| no crushed blacks (heuristic) | ❌ | no | scenes with p5 luma < 0.04: ['b02', 'b07', 'b10', 'b15'] |

## Per-scene picture stats (heuristic, vs reference: day median luma ~0.57, p5 ~0.23)
| scene | t | light | median Y | p5 | p95 | sat |
|---|---|---|---|---|---|---|
| b01 | 2.67 | day | 0.719 | 0.301 | 0.875 | 0.312 |
| b02 | 6.03 | day | 0.559 | 0.039 | 0.832 | 0.439 |
| b03 | 9.43 | day | 0.57 | 0.165 | 0.836 | 0.403 |
| b04 | 13.43 | day | 0.567 | 0.073 | 0.848 | 0.462 |
| b05 | 17.47 | day | 0.77 | 0.256 | 0.892 | 0.275 |
| b06 | 21.2 | day | 0.626 | 0.123 | 0.864 | 0.31 |
| b07 | 23.23 | day | 0.531 | 0.025 | 0.795 | 0.478 |
| b08 | 27.83 | day | 0.587 | 0.131 | 0.836 | 0.442 |
| b09 | 32.43 | day | 0.571 | 0.149 | 0.85 | 0.319 |
| b10 | 34.63 | golden | 0.307 | 0.032 | 0.713 | 0.605 |
| b11 | 38.1 | golden | 0.3 | 0.154 | 0.595 | 0.532 |
| b12 | 41.93 | night | 0.314 | 0.111 | 0.509 | 0.409 |
| b13 | 48.63 | night | 0.312 | 0.04 | 0.562 | 0.466 |
| b14 | 56.33 | golden | 0.309 | 0.196 | 0.592 | 0.512 |
| b15 | 61.27 | golden | 0.286 | 0.039 | 0.556 | 0.557 |

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
- no crushed blacks (heuristic): scenes with p5 luma < 0.04: ['b02', 'b07', 'b10', 'b15']
