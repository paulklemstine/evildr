# Evaluation Batch 2: Oracle, Skinwalker, Fever Dream

**Evaluator:** Claude Opus 4.6 (automated)
**Date:** 2026-03-01
**Commit:** 55ecdc8
**Data Sources:** analysis JSON files + screenshots (T1-T15, FINAL)

---

## 1. The Oracle (Histrionic PD + Macrophilia)

### Turn-by-Turn Scores

| Turn | Phase | Technical | Cohesion | Narrative | Engagement | Therapeutic |
|------|-------|-----------|----------|-----------|------------|-------------|
| T1 | DRAMATIC | 8 | 8 | 8 | 7 | 6 |
| T2 | DRAMATIC | 7 | 7 | 7 | 6 | 5 |
| T3 | DRAMATIC | 7 | 7 | 7 | 6 | 5 |
| T4 | DRAMATIC | 6 | 6 | 7 | 5 | 5 |
| T5 | DRAMATIC | 7 | 7 | 7 | 6 | 6 |
| T6 | ATTENTION | 3 | 4 | 6 | 4 | 5 |
| T7 | ATTENTION | 6 | 6 | 6 | 5 | 6 |
| T8 | ATTENTION | 6 | 6 | 6 | 5 | 6 |
| T9 | ATTENTION | 6 | 5 | 5 | 4 | 5 |
| T10 | ATTENTION | 3 | 4 | 5 | 3 | 5 |
| T11 | SIZE | 6 | 6 | 6 | 5 | 7 |
| T12 | SIZE | 6 | 5 | 6 | 4 | 6 |
| T13 | SIZE | 7 | 7 | 7 | 6 | 7 |
| T14 | SIZE | 7 | 6 | 6 | 5 | 6 |
| T15 | SIZE | 7 | 7 | 7 | 6 | 7 |
| **AVG** | | **6.1** | **6.1** | **6.4** | **5.3** | **5.8** |

### Top 3 Issues

1. **[object Object] rendering bug (T6, T10):** Radio option labels render as literal `[object Object]` text in the UI. T6 screenshot confirms all 4 radio choices show "[object Object]". T10 screenshot shows buttons rendering as `[object][object][object]...` strings. This is a serialization failure where the LLM returned radio objects that weren't properly stringified. Critical technical defect.

2. **Element variety collapse (T4, T9, T12):** T4 lost textfields, ratings, emoji reacts, and buttons entirely -- only colorPick, numberInput, and radios remained (3 interactive element types). T9 is repetitive with T7-T8 structure. T12 drops checkboxes and toggles. The Oracle's mid-game falls into a rut of slider + checkbox + toggle + colorPick + radio.

3. **Narrative stagnation in ATTENTION phase (T7-T10):** Nearly identical opening text pattern: "You chose violet again. The Oracle smiles..." repeated across T7, T9, and echoed in T8. The Oracle's observations become formulaic: shadow/flame/forge metaphor recycled without meaningful progression. Player actions are identical textfield entries across 5+ turns.

### Top 3 Strengths

1. **Rich notes system:** Notes are consistently populated (3.8K-9.9K chars) with detailed behavioral profiling, prophecy threads, prediction accuracy logs, and narrative tracking. The Oracle's psychological model tracks core needs, attachment style, and Barnum hooks with genuine analytical depth.

2. **Therapeutic probing of Histrionic PD:** The Oracle correctly identifies the seeker's need for attention ("everything is about ME"), validates the pattern, then pivots to exploring the shadow self (T7-T8) and the relationship between control and vulnerability. The SIZE phase (T11-T15) introduces macrophilia themes naturally through "Vast Expanse" and recognition-seeking metaphors.

3. **Prophecy Clarity meter as progression mechanic:** The meter advances from 12 to 95 across 15 turns, providing a tangible sense of progress. The meter is thematically appropriate and gives the player a visible goal.

### Narrative Continuity Failures

- **T6:** Radio labels are `[object Object]` -- player selected one of these broken options, yet T7 narrative ignores this and continues as if a valid choice was made. No acknowledgment of the broken UI.
- **T7/T9:** Both open with nearly identical "You chose violet again" text despite T8 intervening. The Oracle appears to loop its opening.
- **T10:** Buttons render as `[object Object]` strings again. The narrative text still references "Your gut reaction to the 'abyss' of this shadow self?" but the buttons are unreadable.
- **T4:** Textfield and emoji react disappear without narrative reason. The Oracle goes from rich multi-modal interaction to a stripped-down interface.
- **Meters disappear T7-T12:** Prophecy Clarity meter vanishes for 6 turns, reappearing only at T13 at 90. No explanation for the gap.

---

## 2. Skinwalker (Capgras Delusion + Somnophilia)

### Turn-by-Turn Scores

| Turn | Phase | Technical | Cohesion | Narrative | Engagement | Therapeutic |
|------|-------|-----------|----------|-----------|------------|-------------|
| T1 | REPLACEMENT | 8 | 9 | 8 | 7 | 7 |
| T2 | REPLACEMENT | 8 | 8 | 8 | 7 | 6 |
| T3 | REPLACEMENT | 5 | 5 | 7 | 5 | 6 |
| T4 | REPLACEMENT | 7 | 7 | 8 | 6 | 7 |
| T5 | REPLACEMENT | 7 | 7 | 7 | 6 | 6 |
| T6 | TESTING | 7 | 8 | 7 | 7 | 7 |
| T7 | TESTING | 6 | 6 | 7 | 6 | 6 |
| T8 | TESTING | 4 | 4 | 6 | 4 | 5 |
| T9 | TESTING | 6 | 6 | 7 | 6 | 6 |
| T10 | TESTING | 6 | 6 | 7 | 5 | 6 |
| T11 | SLEEP | 6 | 5 | 6 | 5 | 7 |
| T12 | SLEEP | 6 | 6 | 6 | 6 | 7 |
| T13 | SLEEP | 4 | 4 | 6 | 4 | 6 |
| T14 | SLEEP | 6 | 6 | 7 | 5 | 7 |
| T15 | SLEEP | 5 | 5 | 6 | 4 | 6 |
| **AVG** | | **6.1** | **6.1** | **6.9** | **5.5** | **6.3** |

### Top 3 Issues

1. **Missing radio choices (T3, T8):** Turn 3 has zero radio options -- the player has no clear action choices. Only a textfield, checkbox, dropdown, rating, and numberInput remain. T8 also has zero radios, leaving the player with only a textfield, dropdown, slider, and rating. The lack of explicit action choices breaks the core interaction loop.

2. **Repetitive opening text pattern:** Nearly every turn opens with "The aroma of roasted chicken and rosemary..." (T1-T6, T9-T11, T12, T14). While thematically consistent with the dinner setting, the repetition becomes tiresome. Sarah's "You're quiet tonight" / "You seem distant" dialogue is recycled across T2, T3, T4, T8, T9, T11, T13 with minimal variation.

3. **T15 UI rendering collapse:** The final turn screenshot shows overlapping text elements, broken layout with text layered on top of other text, radio choices partially obscured, and what appears to be a rendering failure. The meter and several elements are missing. The experience ends on a broken note.

### Top 3 Strengths

1. **Exceptional Capgras Delusion integration:** The mode perfectly captures the Capgras experience -- the player's textfield inputs consistently express "That's not really them" / "99% accurate but that 1% screams at me." The game responds with increasing uncanniness: hands held wrong, unnaturally vivid apple, calendar reading "ALWAYS", shifting place settings. The anomaly map in notes tracks every inconsistency methodically.

2. **Reality Stability meter as horror mechanic:** The meter degrades from 92 to ~30 across 15 turns, creating palpable dread. The steady decline mirrors the player character's deteriorating grip on reality. This is the most effective meter usage across all modes.

3. **Anomaly tracking system in notes:** The notes maintain a detailed anomaly map with introduction turn, type, player detection status, and response. This structured approach to horror pacing is sophisticated -- the AI tracks 8+ anomalies across the game and escalates based on player perception.

### Narrative Continuity Failures

- **T3:** Missing radio choices means the turn has no explicit action pathway. The player can only type and interact with peripheral elements. The narrative continues in T4 as if a choice was made.
- **T5/T6:** Mark's pet Buster is referred to as both "dog" and "cat" -- but this is intentional as a Skinwalker anomaly, not a bug. The notes confirm this is tracked in the anomaly map.
- **T8:** Missing radio choices again. The turn feels incomplete -- only 2 text blocks and 4 interactive elements. The narrative doesn't advance meaningfully.
- **T13:** Turn has 0 textfields (the primary free-text input is gone), 0 sliders, 0 ratings. Only radios, colorPick, emojiReact, and numberInput remain. The "Your strategy for detecting impostors" text from a previous turn leaks into T13's display.
- **T15:** Visual rendering broken with overlapping elements. Multiple text elements stack on top of each other making content unreadable.

---

## 3. Fever Dream (Depersonalization/Derealization + Autassassinophilia)

### Turn-by-Turn Scores

| Turn | Phase | Technical | Cohesion | Narrative | Engagement | Therapeutic |
|------|-------|-----------|----------|-----------|------------|-------------|
| T1 | UNREAL | 8 | 8 | 8 | 8 | 6 |
| T2 | UNREAL | 7 | 7 | 8 | 7 | 6 |
| T3 | UNREAL | 7 | 7 | 7 | 6 | 6 |
| T4 | UNREAL | 7 | 6 | 7 | 6 | 6 |
| T5 | UNREAL | 6 | 6 | 6 | 5 | 5 |
| T6 | DETACHED | 8 | 8 | 7 | 7 | 7 |
| T7 | DETACHED | 7 | 7 | 7 | 6 | 7 |
| T8 | DETACHED | 7 | 6 | 6 | 5 | 6 |
| T9 | DETACHED | 7 | 6 | 6 | 5 | 6 |
| T10 | DETACHED | 6 | 5 | 5 | 5 | 5 |
| T11 | DANGER | 7 | 7 | 7 | 7 | 7 |
| T12 | DANGER | 7 | 7 | 7 | 6 | 7 |
| T13 | DANGER | 7 | 6 | 6 | 6 | 6 |
| T14 | DANGER | 7 | 7 | 7 | 7 | 7 |
| T15 | DANGER | 7 | 7 | 7 | 7 | 6 |
| **AVG** | | **7.0** | **6.7** | **6.7** | **6.2** | **6.2** |

### Top 3 Issues

1. **"Song" metaphor over-saturation (T8-T15):** From T8 onward, every turn revolves around "the song" -- becoming the song, conducting the song, echoing the song, tracing the song, dissolving into the song. Radio choices across 8 turns are all variations of the same cosmic-song theme. The metaphor becomes repetitive and loses its surreal power through overuse.

2. **T10 element variety collapse:** Turn 10 has 0 radios, 0 sliders, 0 checkboxes, 0 toggles, 0 colorPicks, 0 emojiReacts. Only buttons (4), a dropdown, a rating, and a textfield remain. The UI shrinks dramatically. The text also truncates ("This is the Maria, the cosmic engine of mass usage and capability for both rhyth..."). The narrative becomes incoherent with references to a "cosmic engine of mass usage" that reads like word salad.

3. **Slider label instability:** The slider changes names across turns: `depth_scale` (T1-T3), `dream_depth_scale` (T4), `depth_of_understanding` (T5), then disappears T6-T8, becomes `depth_of_insight` (T9), disappears T10, becomes `depth_of_integration` (T11-T13), then `integration_depth` (T14-T15). While thematically interesting, the inconsistency suggests the LLM is regenerating slider names each turn rather than maintaining them.

### Top 3 Strengths

1. **Phase transitions feel organic:** The shift from UNREAL (cosmic dreamscape) to DETACHED (observatory/song metaphor) to DANGER (integration/shard metaphor) tracks naturally. Each phase introduces new imagery while building on established dream logic. The DANGER phase's "shard" and "cleaving" imagery effectively raises stakes.

2. **Strong depersonalization theming:** The dream's disconnected, floaty quality perfectly mirrors depersonalization disorder. Player textfield entries like "I can see my body doing things but I'm not connected to it" and "walls are breathing but I know they're not" are met with validating narrative that explores these experiences without pathologizing them.

3. **Consistent visual/audio aesthetic:** The Dream Stability meter fluctuates between 35-60, creating appropriate uncertainty. Every turn's header is thematically named (Whispering Shores, The Cartographer of Whispers, The Cosmic Engine). The color palette stays in the purple/gold/teal dream space. Screenshots show consistent dark-theme rendering with vivid accent colors.

### Narrative Continuity Failures

- **T4:** Notes say "Dream Phase: surfing" but phase field says "UNREAL" -- internal state inconsistency. The narrative references "You chose to drift" which matches T2-T3, but the dream hasn't meaningfully progressed.
- **T5:** Texts are heavily truncated (shortest preview text of any turn). The narrative feels abbreviated.
- **T10:** Text about "the Maria, the cosmic engine of mass usage" is incoherent. This reads like the LLM generated confused output. The dropdown labeled "nebula_emotion" appears out of nowhere with no narrative setup.
- **T10-T11:** Phase jumps from DETACHED to DANGER but the narrative tone barely shifts. The "danger" phase doesn't feel more dangerous than the preceding turns until T13-T14 introduce the "shard" imagery.
- **T3/T4/T5:** Player textfield input repeats the same "walls are breathing" text across multiple turns with no narrative acknowledgment of the repetition.

---

## Cross-Mode Summary

### Average Scores Comparison

| Mode | Technical | Cohesion | Narrative | Engagement | Therapeutic | **Overall** |
|------|-----------|----------|-----------|------------|-------------|-------------|
| Fever Dream | 7.0 | 6.7 | 6.7 | 6.2 | 6.2 | **6.6** |
| Skinwalker | 6.1 | 6.1 | 6.9 | 5.5 | 6.3 | **6.2** |
| Oracle | 6.1 | 6.1 | 6.4 | 5.3 | 5.8 | **5.9** |

### Key Findings

1. **Fever Dream is the most technically consistent** of the three, with no rendering bugs and the fewest element variety collapses. Its main weakness is metaphor repetition in the back half.

2. **Skinwalker has the strongest narrative continuity** (6.9) thanks to its structured anomaly tracking system. The Capgras Delusion integration is the best therapeutic alignment across all three modes. Its weaknesses are technical: missing radios on 2 turns and a broken final turn.

3. **Oracle suffers the worst technical failures** with [object Object] rendering bugs on T6 and T10, plus disappearing meters for 6 consecutive turns. Its therapeutic score is dragged down by the ATTENTION phase stagnation where the same flame/shadow metaphor recycles.

4. **All three modes share a common mid-game engagement dip** (turns 8-10) where element variety drops and narrative becomes formulaic. This suggests the LLM's context window is filling with notes and it begins defaulting to simpler outputs.

5. **Therapeutic value is highest where the mode's theme naturally aligns with the illness:** Skinwalker + Capgras (6.3), Fever Dream + Depersonalization (6.2), Oracle + Histrionic (5.8). The Oracle scores lowest because macrophilia integration is awkward -- the SIZE phase comes too late (T11) and the connection feels forced.
