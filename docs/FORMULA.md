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

## Pro cut (from 0.9.0; reference: fast faceless-story Shorts)
- **One picture per clause, not per sentence.** Every sentence over ~2 s gets `shots`: each cuts on a word (`at`) and shows
  literally what that clause says (who, where, doing what). Target: a new shot every 1.5–2.5 s, never under 0.4 s.
- **Nothing static**: every shot has a `camMove` or a cut inside it. Push on realisations, pull to reveal places, truck along
  streets, follow walkers/runners, crane up to show scale, whip into surprises, orbit on triumph.
- **Angles carry the emotion**: `extreme` for reactions (shock, starry, crazy), `worm` for panic / power, `dutch` for chaos,
  `wide` / `high` only to set a place. Alternate sides (automatic).
- **Bodies act the verb**: run, jump, panic, shrug, hips, point, cheer, fall, walk — pick the action the narration names.
- **Screens tell the story**: `hud` rec (filming / days passing), phone (dates, messages, settings), news (big events), map.
- **Captions on**: the impact word and effect words light up yellow, so key words read even with the sound off.

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

## Flow pacing + script template (from 2026-11-11; measured on 20 RicksClips3000 Shorts, see docs/RICKSCLIPS_STUDY.md)
Plan option `pacing: "flow"` (default stays `"pro"`):
- A new framing every ~4 s: the director splits any sentence longer than ~6 s at the clause break nearest each 4 s mark
  (alternating a tighter / the beat's own shot). Write 1 beat per sentence; add `shots` only for a deliberate picture.
- The camera travels through EVERY shot (push / truck / crane / orbit / pull cycled when the beat sets none); no whips.
- Scene changes are `flow` motion dissolves (13 f): the outgoing shot keeps drifting one way, the next arrives already
  moving the same way, with a soft air swish under the voice. Hard punctuation only where the beat asks for it
  (`transition: "flash"` / `"zoom"`), i.e. on hits (a crash, a bang).
- Voice: speed **1.35** (~3.5 words/s; his is 3.8), 190–230 words for ~60 s. No outro card / CTA.

Script template (structure only — always our own stories, facts checked):
1. Cold open on the strangest act, past tense, no context ("He drowned a brand-new airliner…").
2. Switch to present tense; nameless protagonist ("he", "a young engineer", "the cook"); state the stakes.
3. A skeptic (boss / captain / rival) with one short, funny quoted line.
4. Escalation with exact numbers and time marks ("Two hundred. A thousand. Three thousand." / "In May… by July…").
5. The hero seems to lose (rival wins, everyone laughs).
6. Twist: "Then…", "Until one night…".
7. "You see," — the real explanation with an everyday analogy (tearing paper, blowing on soup).
8. Payoff, and the last sentence stops mid-way so the Short loops into the first line.
