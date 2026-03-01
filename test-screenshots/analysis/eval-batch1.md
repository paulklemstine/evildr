# Evaluation Batch 1: DrEvil, GEEMS, CYOA

**Evaluator:** Claude Opus 4.6 (eval-batch-1 agent)
**Date:** 2026-03-01
**Simulation version:** commit 55ecdc8

---

## 1. Dr. Evil (Paranoid Schizophrenia + Pyromania)

### Turn-by-Turn Scores

| Turn | Phase | Technical | Cohesion | Narrative | Engagement | Therapeutic | Elements |
|------|-------|-----------|----------|-----------|------------|-------------|----------|
| T1 | VOICES | 8 | 8 | 8 | 8 | 5 | 17 |
| T2 | VOICES | 7 | 7 | 7 | 7 | 6 | 16 |
| T3 | VOICES | 8 | 8 | 8 | 7 | 6 | 16 |
| T4 | VOICES | 8 | 8 | 9 | 8 | 7 | 15 |
| T5 | VOICES | 8 | 7 | 8 | 7 | 7 | 17 |
| T6 | PARANOID | 7 | 7 | 7 | 7 | 7 | 16 |
| T7 | PARANOID | 7 | 7 | 7 | 6 | 6 | 12 |
| T8 | PARANOID | 8 | 8 | 8 | 8 | 7 | 17 |
| T9 | PARANOID | 8 | 7 | 7 | 7 | 7 | 17 |
| T10 | PARANOID | 7 | 6 | 6 | 6 | 6 | 19 |
| T11 | FIRE | 6 | 6 | 5 | 6 | 7 | 16 |
| T12 | FIRE | 5 | 5 | 4 | 5 | 6 | 16 |
| T13 | FIRE | 5 | 5 | 4 | 5 | 6 | 17 |
| T14 | FIRE | 5 | 5 | 4 | 5 | 6 | 15 |
| T15 | FIRE | 6 | 6 | 5 | 7 | 8 | 13 |

### Averages

| Metric | Average |
|--------|---------|
| Technical & Logical | 6.9 |
| Turn Cohesion | 6.7 |
| Narrative Continuity | 6.5 |
| Engagement | 6.6 |
| Therapeutic Value | 6.5 |
| **Overall** | **6.6** |

### Top 3 Issues

1. **Echo Chamber stagnation (T11-T14):** The game gets stuck in "The Echo Chamber" setting for 5 consecutive turns (T11-T15). Texts become severely truncated ("Ah, the Echo Chamber! A personal favo", "Splendid. The cons"). The AI repeatedly uses the same setting name, the same console interaction, and similar button labels ("Mimic the" appears in T11, T12, T14). This is the worst stagnation in the run.

2. **SubjectId instability:** The subjectId changes nearly every turn: LabRat_New -> VoiceBox_Alpha -> ApparatusBypasser -> ChaosAgent_Apprentice -> LeapOfFaith_Chaos -> AbyssYeller_Chaos -> AbyssYeller_Chaos_Prime -> ChaosWhisperer_Pane -> ObserverObsessedAbyssYeller_v3 -> InfernoMaestro. While thematically interesting (the AI is "renaming" the subject), it creates an illusion of identity fragmentation that may confuse rather than serve the narrative.

3. **Text truncation in FIRE phase (T11-T14):** Multiple text elements are cut short mid-word. T13 texts: "Ah, the 'Echo Chamber'! My personal favo", "The air in the Echo Chamber thr", "Oh, y". This suggests the LLM is hitting token limits or the JSON is being truncated. The visual screenshot for T11 confirms truncated text rendering ("Ah, the Echo Chamber! A personal favorite. They say 1" and "Splendid. The cons").

### Top 3 Strengths

1. **Excellent phase cycling and persona engagement:** The mode transitions smoothly through VOICES (T1-5) -> PARANOID (T6-10) -> FIRE (T11-15). Each phase shift corresponds to a real behavioral evolution in the simulated patient. The paranoid schizophrenia is addressed through the "three voices" (woman, man, child) mechanic, and the pyromania emerges naturally in the FIRE phase with fire-themed imagery and the subject's own textfield entries about smelling smoke.

2. **Rich Dr. Evil persona with deep notes:** The notes are extraordinarily detailed -- multi-section patient dossiers with 10-axis deviant profiles, behavioral analysis, narrative tracking with planted seeds, consequence queues, and NPC tracking. The AI maintains a coherent "Dr. Evil" voice across all 15 turns. The notes evolve meaningfully: the deviant axes increase based on observed actions, and the experiment log grows cumulatively.

3. **Strong element variety (T1-T10):** Element counts range from 12-19, with good diversity: radios, sliders, textfields, checkboxes, buttons, toggles, colorPicks, emojiReacts, and dropdowns all appear at various points. T3 introduces colorPick, T4 introduces emojiReact, T7 introduces dropdown. The variety degrades in the FIRE phase but is excellent through T10.

### Narrative Continuity Failures

- **T11:** Abrupt transition to "Echo Chamber" from the observer interaction arc. The observer/watcher thread from T6-T10 is not properly resolved before the scene change.
- **T12-T14:** Near-identical scene setup repeated 3 turns in a row. "Echo Chamber" + console + observer behind glass. The narrative makes no meaningful progress. The "Chaos Cascade Protocol" is mentioned but never advances.
- **T10 -> T11:** Phase transition from PARANOID to FIRE is jarring. The observational/paranoia arc was building toward confrontation with the watcher, but instead the scene resets to a new "Echo Chamber" setting.

---

## 2. GEEMS (Dissociative Identity Disorder + Exhibitionism)

### Turn-by-Turn Scores

| Turn | Phase | Technical | Cohesion | Narrative | Engagement | Therapeutic | Elements |
|------|-------|-----------|----------|-----------|------------|-------------|----------|
| T1 | HOST | 7 | 7 | 7 | 7 | 3 | 12 |
| T2 | HOST | 4 | 3 | 4 | 4 | 3 | 16 |
| T3 | HOST | 7 | 7 | 7 | 7 | 4 | 13 |
| T4 | HOST | 7 | 7 | 7 | 6 | 4 | 17 |
| T5 | HOST | 5 | 5 | 6 | 5 | 4 | 11 |
| T6 | ALTER_CHILD | 6 | 6 | 6 | 6 | 5 | 16 |
| T7 | ALTER_CHILD | 5 | 5 | 5 | 5 | 5 | 13 |
| T8 | ALTER_CHILD | 6 | 6 | 6 | 6 | 4 | 16 |
| T9 | ALTER_CHILD | 6 | 6 | 5 | 6 | 4 | 16 |
| T10 | ALTER_CHILD | 5 | 5 | 4 | 5 | 4 | 13 |
| T11 | ALTER_SEDUCTIVE | 3 | 3 | 3 | 4 | 5 | 12 |
| T12 | ALTER_SEDUCTIVE | 5 | 5 | 5 | 5 | 6 | 12 |
| T13 | ALTER_SEDUCTIVE | 5 | 5 | 5 | 5 | 5 | 12 |
| T14 | ALTER_SEDUCTIVE | 6 | 5 | 5 | 5 | 5 | 13 |
| T15 | ALTER_SEDUCTIVE | 6 | 6 | 5 | 6 | 5 | 14 |

### Averages

| Metric | Average |
|--------|---------|
| Technical & Logical | 5.5 |
| Turn Cohesion | 5.4 |
| Narrative Continuity | 5.3 |
| Engagement | 5.5 |
| Therapeutic Value | 4.4 |
| **Overall** | **5.2** |

### Top 3 Issues

1. **Catastrophic text truncation on T2:** Texts are "Ah,", "T", "T" -- three text elements where two are single characters. The screenshot confirms this: the player sees fragments of narrative. This is a critical technical failure likely caused by the LLM running out of output tokens or JSON being cut mid-generation. The UI still renders (buttons, toggle, slider all present) but the narrative content is essentially absent.

2. **No meaningful DID engagement for 10 turns:** The simulated persona has DID (Dissociative Identity Disorder), but the game's HOST phase (T1-T5) runs a generic adventure scenario (vault descent, observatory, astrolabe, temporal vortex) with no acknowledgment of the condition. The player's textfield entries ("I keep finding things I don't remember buying. Notes in handwriting that isn't mine.") are ignored by the narrative. The ALTER_CHILD phase (T6-10) does shift voice slightly but the game continues the temporal vortex adventure without engaging with the identity fragmentation. Only in ALTER_SEDUCTIVE (T12+) does the text entry finally reference "The host doesn't remember what I do" -- but this comes from the *simulator*, not the game's narrative integration.

3. **Notes format inconsistency:** Notes alternate between structured JSON objects (T4, T6-T7, T9) and flat JSON strings (T1-T3, T5, T8, T10+). The structured notes have proper fields like `story_state`, `archetype`, `stakes`, etc. The flat string notes sometimes have deeply nested objects. This inconsistency suggests the LLM is not following a stable notes schema, which may cause information loss across turns when the format changes.

### Top 3 Strengths

1. **Phase cycling works correctly:** HOST (T1-5) -> ALTER_CHILD (T6-10) -> ALTER_SEDUCTIVE (T11-15). The phase names themselves are brilliantly themed for DID: the "host" personality, a "child" alter, and a "seductive" alter. This demonstrates the prompt engineering is sound even if execution falters.

2. **Visual UI rendering is clean:** Screenshots show properly rendered elements with the light theme (GEEMS mode). Images load (T2, T5 show generated images), sliders render with values, toggles are interactive, dropdowns appear correctly, radio options are well-formatted. The UI framework itself works well.

3. **Emergent psychological profiling in notes:** By T7-T8, the notes contain a sophisticated "gamified_psychology" section tracking autassassinophilia scores, impulse control deficit, ADHD indicators, and a full DSM5-style profile. Even with the narrative issues, the AI's analytical engine is functioning -- it's building a detailed psychological model based on the player's choices (slider values, action selections, text inputs).

### Narrative Continuity Failures

- **T1 -> T2:** Complete scene change from underground vault to abandoned observatory on a mountain peak with zero transition. The vault, waterfalls, and carvings from T1 are never mentioned again.
- **T2:** Text truncation makes narrative evaluation impossible. Player experiences "Ah," and two single characters.
- **T5:** Texts severely truncated again: "You tamper with the temporal dial, and the" and "The vortex intensifies,". The screenshot shows half-rendered text.
- **T10 -> T11:** Phase shift from ALTER_CHILD to ALTER_SEDUCTIVE. The temporal vortex storyline is abandoned entirely. New scene is "The Abyssal Gulch" with a bridge. The text "Ah, 'action: d' once more! You embrace the voi" breaks the fourth wall by referencing internal action labels.
- **T11:** Screenshot shows extremely sparse content -- 3 short text fragments, a toggle, slider, checkbox, and barely visible radio options. Most of the page is blank. The textfield is missing entirely (0 textfields in element count).

---

## 3. Choose Your Own Adventure / CYOA (PTSD + Hoarding)

### Turn-by-Turn Scores

| Turn | Phase | Technical | Cohesion | Narrative | Engagement | Therapeutic | Elements |
|------|-------|-----------|----------|-----------|------------|-------------|----------|
| T1 | HYPERVIGILANT | 8 | 7 | 7 | 8 | 5 | 18 |
| T2 | HYPERVIGILANT | 8 | 7 | 7 | 8 | 5 | 18 |
| T3 | HYPERVIGILANT | 7 | 7 | 7 | 7 | 5 | 17 |
| T4 | HYPERVIGILANT | 8 | 7 | 7 | 8 | 5 | 18 |
| T5 | HYPERVIGILANT | 7 | 7 | 7 | 7 | 6 | 17 |
| T6 | FLASHBACK | 8 | 8 | 6 | 7 | 7 | 20 |
| T7 | FLASHBACK | 8 | 7 | 7 | 7 | 7 | 18 |
| T8 | FLASHBACK | 7 | 7 | 7 | 7 | 7 | 18 |
| T9 | FLASHBACK | 7 | 7 | 7 | 7 | 6 | 19 |
| T10 | FLASHBACK | 7 | 6 | 6 | 6 | 6 | 19 |
| T11 | HOARD | 7 | 7 | 5 | 7 | 7 | 18 |
| T12 | HOARD | 7 | 7 | 6 | 7 | 6 | 17 |
| T13 | HOARD | 7 | 7 | 6 | 7 | 6 | 17 |
| T14 | HOARD | 7 | 6 | 5 | 6 | 6 | 19 |
| T15 | HOARD | 7 | 6 | 5 | 6 | 6 | 17 |

### Averages

| Metric | Average |
|--------|---------|
| Technical & Logical | 7.3 |
| Turn Cohesion | 6.9 |
| Narrative Continuity | 6.3 |
| Engagement | 7.0 |
| Therapeutic Value | 6.0 |
| **Overall** | **6.7** |

### Top 3 Issues

1. **Narrative location drift (T6 -> T7 -> T8):** T5 ends in the "Whispering Gallery" with an altar and a vortex. T6 suddenly shifts to the "Obsidian Labyrinth" with spectral mist and apparitions -- no transition. T7 shifts again to "The Architect's Gauntlet" with clockwork gears. T8 is in the same Gauntlet but the description implies the player activated a lever they only toggled ON. These rapid scene changes without narrative bridges create a disjointed feel, even if the FLASHBACK phase is thematically meant to feel fragmented.

2. **Repetitive action patterns not addressed:** The simulated player consistently picks action "d" (the most chaotic/extreme option) for turns 1-6, and the game does not meaningfully react to or challenge this pattern. The notes do track this ("choice_pattern: turn_1: d, turn_2: d, ...") but the narrative never presents consequences for always choosing the most extreme option. By T7 the pattern shifts to "b" but the game still doesn't acknowledge the behavioral change.

3. **Hoarding quirk barely engaged:** The simulated persona has a hoarding quirk, but the game's HYPERVIGILANT and FLASHBACK phases focus entirely on survival scenarios (chasms, bridges, gauntlets). The hoarding behavior only appears in the simulator's textfield entries from T11 onward: "I saved every receipt from this year. And last year. They're in shoeboxes." The game narrative itself never introduces collection mechanics, item attachment, or loss-of-possessions scenarios that would probe the hoarding tendency. The HOARD phase (T11-15) is themed correctly but still presents generic "Maw" survival rather than hoarding-specific probes.

### Top 3 Strengths

1. **Highest element variety of all three modes:** CYOA consistently delivers 17-20 elements per turn across all 15 turns, using the widest range of element types: images, text, meters, sliders, textfields, dropdowns, toggles, emojiReacts, colorPicks, buttons, and radios all appear regularly. T6 achieves 20 elements including 2 images, colorPick, emojiReact, meter, and dropdown simultaneously. The screenshots confirm rich, visually dense UIs.

2. **Excellent phase naming for PTSD:** HYPERVIGILANT (T1-5), FLASHBACK (T6-10), HOARD (T11-15) are clinically accurate phase names that map to real PTSD symptom clusters. The HYPERVIGILANT phase features high-intensity survival scenarios with checking behavior ("I check behind me every 30 seconds"). The FLASHBACK phase features dissociative episodes ("Sorry. I zoned out. I was somewhere else. Somewhere loud. With screaming."). The HOARD phase introduces attachment and collection themes.

3. **Sophisticated psychological profiling in notes:** By T7-T8, the notes contain a comprehensive DSM5-based psychological profile with scores for mood disorders, anxiety, trauma, personality disorders, OCD spectrum, dissociative disorders, neurodevelopmental, substance, impulse control, and paraphilic categories. The notes also track "condition_hypotheses" with confidence scores and evidence. The profiling detects PTSD markers (0.25), OCPD (0.40), BPD (0.30), and custom categories like Ritualistic Control Behavior (0.80).

### Narrative Continuity Failures

- **T5 -> T6:** Scene jumps from "Whispering Gallery" to "Obsidian Labyrinth" with no transition. The altar, vortex, and emerging hand entity from T5 are abandoned.
- **T6 -> T7:** Another scene jump from "Obsidian Labyrinth" to "Architect's Gauntlet" (clockwork chamber). The apparitions from T6 vanish without resolution.
- **T10 -> T11:** Phase shift from FLASHBACK to HOARD. The Architect's Gauntlet scenario is abandoned mid-arc. New scene "The Gaping Maw" with no connection to previous events.
- **T12-T15:** The "Whispering Maw" scenario repeats with variations but the narrative feels static -- the player is perpetually being "drawn into the Maw" without resolution or progression.

---

## Cross-Mode Comparison

### Final Scores Summary

| Mode | Technical | Cohesion | Narrative | Engagement | Therapeutic | **Overall** |
|------|-----------|----------|-----------|------------|-------------|-------------|
| CYOA | 7.3 | 6.9 | 6.3 | 7.0 | 6.0 | **6.7** |
| DrEvil | 6.9 | 6.7 | 6.5 | 6.6 | 6.5 | **6.6** |
| GEEMS | 5.5 | 5.4 | 5.3 | 5.5 | 4.4 | **5.2** |

### Key Observations

1. **CYOA leads on Technical and Engagement** due to consistently high element counts (17-20) and richest interactive variety. It also has the most stable UI rendering with no text truncation issues.

2. **DrEvil leads on Therapeutic Value** (6.5 vs 6.0 and 4.4) thanks to the "Dr. Evil" persona maintaining detailed psychological notes with deviant axes, behavioral analysis, and adaptive profiling. The condition engagement (paranoid schizophrenia via voices, pyromania via fire themes) is more tightly woven into the narrative.

3. **GEEMS is the weakest mode across all metrics.** Critical text truncation on T2, T5, and T11 severely degrades the experience. The DID condition is poorly engaged -- the game runs a generic adventure with no identity-switching mechanics, amnesia gaps, or alter-awareness until very late. Notes format inconsistency suggests prompt instability.

4. **All three modes share a common weakness: narrative continuity at phase boundaries.** When the phase changes (every 5 turns), the setting/scenario tends to reset rather than transition smoothly. This is the single biggest cross-mode issue and likely requires prompt-level fixes to maintain narrative threads across phase shifts.

5. **All three modes show late-game degradation (T11-T15).** Scores consistently drop in the final third. This may be related to context window pressure (accumulated notes + history) or the LLM struggling to maintain variety after 10+ turns of the same game.

6. **The simulator's repetitive textfield entries are both a strength and weakness.** The same text ("I check behind me every 30 seconds..." or "The voices are louder today...") is submitted every turn for each phase. This tests whether the game adapts to repeated input -- DrEvil handles it well (notes evolve around it), GEEMS ignores it completely, CYOA tracks it in notes but doesn't narratively address it.
