# V4 Playtest Meta-Analysis

**Date:** 2026-03-01
**Commit:** 55ecdc8
**Modes Tested:** 8 (DrEvil, GEEMS, CYOA, Oracle, Skinwalker, Fever Dream, Devil, Flagged)
**Turns Per Mode:** 15
**Total Turns Analyzed:** 120 solo + 30 flagged (both players) = 150 turn-evaluations

---

## Aggregate Scores

| Mode | Technical | Cohesion | Narrative | Engagement | Therapeutic | **Overall** |
|------|-----------|----------|-----------|------------|-------------|-------------|
| Devil | 7.9 | 7.4 | 7.3 | 6.5 | 6.9 | **7.2** |
| CYOA | 7.3 | 6.9 | 6.3 | 7.0 | 6.0 | **6.7** |
| Fever Dream | 7.0 | 6.7 | 6.7 | 6.2 | 6.2 | **6.6** |
| DrEvil | 6.9 | 6.7 | 6.5 | 6.6 | 6.5 | **6.6** |
| Flagged | 7.3 | 6.7 | 6.7 | 5.9 | 5.7 | **6.5** |
| Skinwalker | 6.1 | 6.1 | 6.9 | 5.5 | 6.3 | **6.2** |
| Oracle | 6.1 | 6.1 | 6.4 | 5.3 | 5.8 | **5.9** |
| GEEMS | 5.5 | 5.4 | 5.3 | 5.5 | 4.4 | **5.2** |
| **AVG** | **6.8** | **6.5** | **6.5** | **6.1** | **6.0** | **6.4** |

## vs V3 Baseline (55ecdc8, 4-agent meta-analysis)

| Mode | V3 Overall | V4 Overall | Delta |
|------|------------|------------|-------|
| Devil | 6.7 | 7.2 | +0.5 |
| CYOA | 5.7 | 6.7 | +1.0 |
| Fever Dream | 6.4 | 6.6 | +0.2 |
| DrEvil | 6.0 | 6.6 | +0.6 |
| Flagged | 6.2 | 6.5 | +0.3 |
| Skinwalker | 5.0 | 6.2 | +1.2 |
| Oracle | 4.7 | 5.9 | +1.2 |
| GEEMS | 4.6 | 5.2 | +0.6 |
| **AVG** | **5.7** | **6.4** | **+0.7** |

**Every mode improved from V3.** Biggest gains: Oracle (+1.2), Skinwalker (+1.2), CYOA (+1.0).

---

## Cross-Mode Patterns (Validated)

### Pattern 1: UNIVERSAL Late-Game Degradation (T11-T15)
**Confidence: HIGH (observed in 8/8 modes)**

Every mode shows score drops in the final 5 turns. Average T1-T5 vs T11-T15:
- Technical: 7.5 → 6.3 (-1.2)
- Engagement: 6.8 → 5.6 (-1.2)
- Narrative: 7.2 → 5.8 (-1.4)

**Root Cause (validated):** Context window pressure. By turn 11, the accumulated notes (5-10K chars) + history (6 turns) + prompt template consume ~70% of the output budget. The LLM starts generating shorter text, fewer elements, and more repetitive content. The PRE_GENERATION_CHECKLIST is less effective when the LLM is token-constrained.

### Pattern 2: Phase Boundary Discontinuity
**Confidence: HIGH (observed in 7/8 modes, Flagged exempt)**

When the simulated persona's phase changes (every 5 turns), the narrative often hard-resets. Settings, NPCs, and in-progress storylines are abandoned. Examples:
- DrEvil T10→T11: Observer arc → Echo Chamber (no transition)
- CYOA T5→T6: Whispering Gallery → Obsidian Labyrinth (no bridge)
- GEEMS T10→T11: Temporal vortex → Abyssal Gulch (no connection)

**Root Cause (validated):** The phase change occurs in the SIMULATOR, not the game. The simulator sends different-phrased textfield inputs when the phase changes, but the game's prompt system doesn't know about phases. The abrupt input shift causes the LLM to interpret it as a new scenario.

### Pattern 3: Element Variety Collapse at T7-T10
**Confidence: MEDIUM (observed in 5/8 modes)**

Mid-game turns often lose interactive element diversity. Oracle T6 had [object Object] rendering bugs. GEEMS T11 had near-empty UI. Skinwalker T8 lost radios. Fever Dream T10 lost radios+sliders+checkboxes.

**Root Cause (partial):** The PRE_GENERATION_CHECKLIST may be less effective when the LLM has more context to process. Earlier turns benefit from shorter prompts where the checklist instructions have proportionally more weight.

### Pattern 4: Meter Stagnation
**Confidence: HIGH (observed in 4/8 modes)**

Devil's Soul Integrity stuck at 85 for 12 turns. Oracle's Prophecy Clarity disappeared for 6 turns. Meters that should be the primary progression mechanic become static or invisible.

**Root Cause:** The prompt tells the LLM to include meters but doesn't enforce that meter values must CHANGE based on player actions. There's no "meter must reflect consequences" directive.

### Pattern 5: Text Truncation
**Confidence: MEDIUM (observed in 3/8 modes: GEEMS, Oracle, DrEvil)**

GEEMS T2 had single-character text elements ("T", "T"). DrEvil T11-T14 had mid-word truncation. Oracle had [object Object] serialization failures.

**Root Cause:** LLM output token limits. When the prompt is very long (notes + history), the remaining output budget for the JSON response is insufficient for full text + all elements.

### Pattern 6: Radio Option Degradation
**Confidence: HIGH (observed in 5/8 modes)**

Radio options become generic/formulaic in late turns. Flagged T9-T15 had verbatim "Flirt/Deep Question/Vulnerable/Change Subject" repeated 7 turns. DrEvil T11-T14 had similar repetition.

**Root Cause:** The PRE_GENERATION_CHECKLIST requires radio options but doesn't require them to be UNIQUE or CONTEXTUALLY SPECIFIC each turn.

---

## Blind Spots in Evaluation

1. **Simulator Bias:** The simulator uses canned textfield responses that repeat every 5 turns. This artificially penalizes modes that rely heavily on textfield input (Flagged, GEEMS) because the AI receives the same text repeatedly and can't evolve the conversation. Modes that rely on radio/slider choices (CYOA, Devil) are less affected.

2. **Phase Cycling is Simulator, Not Game:** The score drops at phase boundaries are partly caused by the simulator changing its behavior, not the game failing. A real player wouldn't abruptly shift from "paranoid schizophrenia" to "pyromania" responses in a single turn.

3. **Screenshots vs JSON Gap:** Screenshot analysis catches rendering bugs (overlapping text, [object Object]) but the JSON data doesn't record these failures. Some technical scores may be too generous when based only on JSON data.

4. **Therapeutic Scoring Subjectivity:** Therapeutic value is the most subjective metric. The evaluator may over-credit "condition detection" in notes (which the player never sees) while under-crediting the actual player-facing narrative experience.

---

## Priority Fix List (Phase 4)

### P0 — Critical (affects all modes)

1. **Notes Compression at T10+:** When notes exceed 4K chars, compress/summarize before injection. This frees output tokens for richer UI content in late turns.

2. **Enforce Meter Progression:** Add explicit prompt directive: "Meter values MUST change by at least ±5 every turn based on player actions. Stagnant meters are FORBIDDEN."

3. **Enforce Radio Uniqueness:** Add to PRE_GENERATION_CHECKLIST: "Radio options MUST NOT repeat from the previous 3 turns. Each option must reference THIS turn's specific narrative events."

### P1 — High (affects 5+ modes)

4. **Phase Transition Narrative Bridge:** The prompt should include: "When the scene changes, the FIRST text element must briefly acknowledge what happened in the previous scene before transitioning."

5. **Late-Game Element Variety Floor:** Add: "Every turn MUST include AT LEAST 6 different interactive element types. Minimum: 1 image, 1 radio, 1 slider, 1 textfield, 1 checkbox/toggle, plus 1 exotic (colorPick/emojiReact/dropdown/meter/rating)."

6. **Anti-Repetition for Text Blocks:** Add: "No text block may begin with the same 10 words as any text block from the previous 3 turns."

### P2 — Medium (mode-specific)

7. **GEEMS: Fix text truncation.** May need to reduce notes injection size for this mode specifically, or split the JSON response into smaller chunks.

8. **Oracle: Fix [object Object] rendering.** The renderer needs to handle radio options that arrive as objects instead of strings.

9. **Flagged: Inject "date events" to break conversation stagnation.** The orchestrator prompt should periodically introduce interruptions: waiter arrives, music changes, another couple creates drama, venue change.

10. **Skinwalker: Ensure radios always present.** Add validation in renderer or prompt to guarantee at least one radio group per turn.
