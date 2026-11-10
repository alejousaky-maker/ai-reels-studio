# QUALITY REPORT

Video: `world-war-1-radomn-fact_standard_v1.mp4` · 1080x1920 · 30.00 fps · 53.07 s · 44.79 MB

**Technical result: PASS** · Approved for delivery: **no — human review pending**

## Measured checks
| check | ok | blocking | detail |
|---|---|---|---|
| video stream | ✅ | yes | 1 video stream(s), codec h264 |
| 9:16 ratio | ✅ | yes | 1080x1920 |
| fps | ✅ | yes | 30.000 fps |
| duration | ✅ | yes | video 53.067 s, storyboard 53.067 s |
| single audio track | ✅ | yes | 1 audio stream(s) (a silent extra track means the mux mapped the wrong stream) |
| AAC 48 kHz | ✅ | yes | aac 48000 Hz 2 ch |
| A/V length match | ✅ | yes | audio 53.067 s vs video 53.067 s |
| no black spans | ✅ | yes | 0 span(s) [] |
| no white spans (>0.2 s) | ✅ | yes | 0 span(s) [] — 4-frame flashes are shorter and allowed |
| no frozen holds >= 1.5 s | ✅ | no | 0 freeze(s) >= 0.6 s: [] |
| loudness ~ -14 LUFS | ✅ | no | integrated -14.0 LUFS (target -14, platform normalisation) |
| true peak <= -1 dBTP | ✅ | yes | true peak -2.0 dBTP |
| no long silences | ✅ | no | 0 silence(s) >= 1.2 s: [] |
| render matches control stills | ✅ | yes | 30 frames compared; mismatches: [] |
| day exposure (heuristic) | ✅ | no | median luma of day scenes 0.656, reference ~0.57 (range 0.5-0.66) |
| no crushed blacks (heuristic) | ❌ | no | scenes with p5 luma < 0.04: ['b02', 'b04', 'b07', 'b10'] |

## Per-scene picture stats (heuristic, vs reference: day median luma ~0.57, p5 ~0.23)
| scene | t | light | median Y | p5 | p95 | sat |
|---|---|---|---|---|---|---|
| b01 | 2.47 | day | 0.696 | 0.32 | 0.871 | 0.336 |
| b02 | 7.43 | day | 0.557 | 0.024 | 0.853 | 0.498 |
| b03 | 11.9 | day | 0.724 | 0.067 | 0.911 | 0.338 |
| b04 | 16.93 | day | 0.617 | 0.035 | 0.888 | 0.389 |
| b05 | 22.97 | night | 0.149 | 0.059 | 0.342 | 0.605 |
| b06 | 28.23 | golden | 0.299 | 0.041 | 0.626 | 0.568 |
| b07 | 32.83 | golden | 0.269 | 0.022 | 0.829 | 0.625 |
| b08 | 37.53 | night | 0.152 | 0.116 | 0.189 | 0.694 |
| b09 | 42.87 | night | 0.148 | 0.022 | 0.466 | 0.622 |
| b10 | 49.43 | golden | 0.304 | 0.034 | 0.663 | 0.541 |

## Idea -> script -> picture coherence
- Critic (local LLM, indicative): relevance to the idea 8/10, coherence 9/10, hook 6/10
- Scenes whose picture is driven by the words of their sentence (place/people/emotion/object): 70% of 10 (measured)
- Places used: market, street, village_square

## Rubric (0-10)
| area | score | basis |
|---|---|---|
| Comprensión narrativa y gancho inicial | — | pending human review (see checklist) |
| Coherencia de personajes y escenarios | — | pending human review (see checklist) |
| Cámara y pacing | — | pending human review (see checklist) |
| Contornos / ilustración / materiales | — | pending human review (see checklist) |
| Iluminación, color y profundidad | — | pending human review (see checklist) |
| Claridad y naturalidad de la voz | — | pending human review (see checklist) |
| SFX, música y sincronía | — | computed loudness -14.0 LUFS / TP -2.0 dBTP; sync and taste need a listen |
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
- no crushed blacks (heuristic): scenes with p5 luma < 0.04: ['b02', 'b04', 'b07', 'b10']
