# QUALITY REPORT

Video: `la-segunda-guerra-mundial_standard_v1.mp4` · 1080x1920 · 30.00 fps · 26.93 s · 15.08 MB

**Technical result: PASS** · Approved for delivery: **no — human review pending**

## Measured checks
| check | ok | blocking | detail |
|---|---|---|---|
| video stream | ✅ | yes | 1 video stream(s), codec h264 |
| 9:16 ratio | ✅ | yes | 1080x1920 |
| fps | ✅ | yes | 30.000 fps |
| duration | ✅ | yes | video 26.933 s, storyboard 26.933 s |
| single audio track | ✅ | yes | 1 audio stream(s) (a silent extra track means the mux mapped the wrong stream) |
| AAC 48 kHz | ✅ | yes | aac 48000 Hz 2 ch |
| A/V length match | ✅ | yes | audio 26.933 s vs video 26.933 s |
| no black spans | ✅ | yes | 0 span(s) [] |
| no white spans (>0.2 s) | ✅ | yes | 0 span(s) [] — 4-frame flashes are shorter and allowed |
| no frozen holds >= 1.5 s | ✅ | no | 0 freeze(s) >= 0.6 s: [] |
| loudness ~ -14 LUFS | ✅ | no | integrated -14.0 LUFS (target -14, platform normalisation) |
| true peak <= -1 dBTP | ✅ | yes | true peak -1.9 dBTP |
| no long silences | ✅ | no | 0 silence(s) >= 1.2 s: [] |
| day exposure (heuristic) | ✅ | no | median luma of day scenes 0.603, reference ~0.57 (range 0.5-0.66) |
| no crushed blacks (heuristic) | ✅ | no | scenes with p5 luma < 0.04: [] |

## Per-scene picture stats (heuristic, vs reference: day median luma ~0.57, p5 ~0.23)
| scene | t | light | median Y | p5 | p95 | sat |
|---|---|---|---|---|---|---|
| b01 | 1.3 | day | 0.59 | 0.29 | 0.843 | 0.353 |
| b02 | 4.03 | day | 0.603 | 0.159 | 0.859 | 0.346 |
| b03 | 6.7 | day | 0.594 | 0.3 | 0.842 | 0.304 |
| b04 | 9.17 | day | 0.624 | 0.236 | 0.874 | 0.33 |
| b05 | 11.33 | day | 0.61 | 0.313 | 0.863 | 0.305 |
| b06 | 13.43 | day | 0.603 | 0.3 | 0.854 | 0.338 |
| b07 | 16.37 | day | 0.588 | 0.288 | 0.843 | 0.335 |
| b08 | 19.63 | day | 0.608 | 0.185 | 0.859 | 0.333 |
| b09 | 22.57 | day | 0.59 | 0.212 | 0.858 | 0.306 |
| b10 | 25.47 | day | 0.614 | 0.284 | 0.874 | 0.332 |

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
