# The house formula (approved by the user)

The reference videos are:
- Demo A, "The Town That Couldn't Stop Dancing".
- "The School That Couldn't Stop Laughing".
- Shorts 01–03 (Columbus, Troy, Cyclops) follow the same formula.

## Story
- **0–3 s hook**: an ironic or absurd claim, plus a physical gag on screen (burst, stars, a crash). No slow intro.
- **Length and pace**: 130–160 words, 12–16 scenes, one sentence per scene, cuts every 3–5 s. Short, conversational English.
- **Twist**: explain it with a literal, funny visual metaphor (a chalkboard plan, a tiny globe, a shrinking Earth).
- **Ending**: a punchline that loops back to the hook ("Nobody saw that coming").
- **Facts**: check them against a source first. Comic framing goes into `verifiedClaims` as `fiction`.

## Picture
- **Cast**: one recurring cast of bean-stickmen. The hero appears in the hook, the middle and the end.
- **Places**: few, and each one means something (beach → court → ocean → beach). Use the per-beat `environment` and `envVariant`.
- **Light arc**: day, then golden, then night, then golden. Outdoor golden scenes in the new places are front-lit.
- **Every scene shows its sentence**:
  - icons pop on the word that names them (`fx.word`);
  - reactions switch on their word (`react`);
  - key numbers appear on screen (`text`).
- **Big objects are set pieces**: `horse`, `ship`, `galley`, `chalkboard`, `sheep`, `tent`. Place them with `where` (`behind`, `left`, `right`, `far`, `front`) and optional `move`.
- **Camera spot**: choose it per beat (`spot`), so the view direction matches the sentence.

| Location | Spots |
|---|---|
| beach | 0 = sea, 1 = inland |
| troy | 0 = gate, 1 = breach, 3 = toward the sea, 4 = inside the walls |
| cave | 0 = fire / back wall, 1 = mouth, 3 / 5 = outside |
| ocean | 0–2 = across the deck |
| throne | 0 = the throne |

## Roles

| Role | Look |
|---|---|
| explorer | wide-brim hat, red coat |
| king / queen | crown |
| sailor | red cap |
| islander | plain clothes |
| greek / hero | bronze helmet, red crest; hero has a beard |
| trojan | blue crest |
| prisoner | rope bands |
| giant | one-eyed cyclops, 2.6× scale |

The older roles (villagers, kid, official, scholar…) remain available.

## Modern stories (Shorts 04–06)

| Kind | Available |
|---|---|
| Rooms | apartment, bathroom, office, hotel, airport |
| Outdoors | suburb (houses, driveways, road), lake (dock, log cabin), resort (pool, pool bar, pink neon palm sign) |
| Set pieces | `scale`, `boxes`, `car`, `van`, `poster` |
| Icons | phone, tablet, wifi, key, camera, card, fish, receipt ("BUSTED"), box |

| Role | Look |
|---|---|
| businessman | suit and tie |
| boss | black suit, gold tie |
| woman | long hair |
| towelguy | towel |
| lawyer | grey suit |
| fisher | vest, bucket hat, sunglasses |
| tourist | sun hat, sunglasses |

- **Clock times**: write them in words in the narration ("two forty-five in the morning") and put "2:45 AM" in the on-screen text.
- **Fiction**: invented stories are labelled `fiction` and never presented as real events.
- **Private recordings**: no storyline spreads private or intimate recordings.

## Production
- **Settings**: voice af_heart, Master 2K, graphics `full`.
- **Plan**: Claude writes it from the megaprompt (Claude-assisted), saved in `docs/scripts/plan_*.json`.
- **Review**: check the contact sheet, re-shoot weak scenes (shot / spot / pieces) and re-render. Only the changed scenes render again.
