# QUALITY REPORT

Video: `latest_master.mp4` · 1440x2560 · 30.00 fps · 64.57 s · 109.44 MB

**Technical result: PASS** · Approved for delivery: **no — human review pending**

## Measured checks
| check | ok | blocking | detail |
|---|---|---|---|
| video stream | ✅ | yes | 1 video stream(s), codec h264 |
| 9:16 ratio | ✅ | yes | 1440x2560 |
| fps | ✅ | yes | 30.000 fps |
| duration | ✅ | yes | video 64.567 s, storyboard 64.567 s |
| single audio track | ✅ | yes | 1 audio stream(s) (a silent extra track means the mux mapped the wrong stream) |
| AAC 48 kHz | ✅ | yes | aac 48000 Hz 2 ch |
| A/V length match | ✅ | yes | audio 64.567 s vs video 64.567 s |
| no black spans | ✅ | yes | 0 span(s) [] |
| no white spans (>0.2 s) | ✅ | yes | 0 span(s) [] — 4-frame flashes are shorter and allowed |
| no frozen holds >= 1.5 s | ✅ | no | 0 freeze(s) >= 0.6 s: [] |
| loudness ~ -14 LUFS | ✅ | no | integrated -14.0 LUFS (target -14, platform normalisation) |
| true peak <= -1 dBTP | ✅ | yes | true peak -1.5 dBTP |
| no long silences | ✅ | no | 0 silence(s) >= 1.2 s: [] |
| render matches control stills | ✅ | yes | 45 frames compared; mismatches: [] |
| day exposure (heuristic) | ✅ | no | median luma of day scenes 0.565, reference ~0.57 (range 0.5-0.66) |
| no crushed blacks (heuristic) | ❌ | no | scenes with p5 luma < 0.04: ['b02', 'b07'] |

## Per-scene picture stats (heuristic, vs reference: day median luma ~0.57, p5 ~0.23)
| scene | t | light | median Y | p5 | p95 | sat |
|---|---|---|---|---|---|---|
| b01 | 3.13 | day | 0.714 | 0.297 | 0.877 | 0.314 |
| b02 | 6.97 | day | 0.557 | 0.037 | 0.833 | 0.451 |
| b03 | 10.37 | day | 0.56 | 0.13 | 0.834 | 0.429 |
| b04 | 14.37 | day | 0.559 | 0.059 | 0.846 | 0.478 |
| b05 | 18.4 | day | 0.767 | 0.21 | 0.892 | 0.282 |
| b06 | 22.13 | golden | 0.304 | 0.087 | 0.596 | 0.531 |
| b07 | 24.17 | day | 0.531 | 0.025 | 0.795 | 0.478 |
| b08 | 28.77 | day | 0.587 | 0.101 | 0.836 | 0.462 |
| b09 | 33.37 | day | 0.57 | 0.149 | 0.85 | 0.319 |
| b10 | 35.57 | night | 0.214 | 0.028 | 0.68 | 0.606 |
| b11 | 39.03 | golden | 0.298 | 0.149 | 0.596 | 0.534 |
| b12 | 42.9 | night | 0.202 | 0.074 | 0.375 | 0.52 |
| b13 | 49.6 | night | 0.195 | 0.028 | 0.421 | 0.579 |
| b14 | 57.3 | golden | 0.309 | 0.196 | 0.592 | 0.514 |
| b15 | 62.2 | golden | 0.287 | 0.041 | 0.557 | 0.556 |

## Rubric (0-10)
| area | score | basis |
|---|---|---|
| Comprensión narrativa y gancho inicial | — | pending human review (see checklist) |
| Coherencia de personajes y escenarios | — | pending human review (see checklist) |
| Cámara y pacing | — | pending human review (see checklist) |
| Contornos / ilustración / materiales | — | pending human review (see checklist) |
| Iluminación, color y profundidad | — | pending human review (see checklist) |
| Claridad y naturalidad de la voz | — | pending human review (see checklist) |
| SFX, música y sincronía | — | computed loudness -14.0 LUFS / TP -1.5 dBTP; sync and taste need a listen |
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
- no crushed blacks (heuristic): scenes with p5 luma < 0.04: ['b02', 'b07']
