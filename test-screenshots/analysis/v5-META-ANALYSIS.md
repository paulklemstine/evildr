# V5 Meta-Analysis — EvilDr Platform
**Date:** 2026-03-01
**Evaluator:** Claude Sonnet 4.6 (meta-analysis of 8 Playtest Agent reports)
**Modes Evaluated:** Devil, DrEvil, GEEMS, CYOA, Oracle, Skinwalker, Fever Dream, Flagged
**Methodology:** All modes simulated by Playtest Agent using detailed psychological personas; CYOA evaluated against actual run logs (V8 production). Each report scored 5 metrics 1-10: Technical/Logical (T), Turn Cohesion (C), Narrative Continuity (N), Engagement (E), Therapeutic Value (TV).

---

## 1. V5 Score Table

### Simulated Scores (this playtest round)

| Mode | Technical | Cohesion | Narrative | Engagement | Therapeutic | **Overall V5** | **Overall V4** | **Delta** |
|------|-----------|----------|-----------|------------|-------------|----------------|----------------|-----------|
| Fever Dream | 8.7 | 9.3 | 9.6 | 9.7 | 9.7 | **9.4** | 6.6 | **+2.8** |
| Oracle | 8.6 | 8.5 | 9.5 | 8.9 | 8.8 | **8.9** | 5.9 | **+3.0** |
| Flagged | 8.3 | 9.3 | 9.1 | 9.3 | 8.9 | **8.8** | 6.5 | **+2.3** |
| GEEMS | 8.6 | 8.6 | 9.1 | 8.5 | 9.0 | **8.8** | 5.2 | **+3.6** |
| Devil | 8.0 | 8.5 | 8.4 | 8.7 | 7.9 | **8.3** | 7.2 | **+1.1** |
| DrEvil | 8.0 | 8.4 | 8.7 | 8.8 | 7.4 | **8.3** | 6.6 | **+1.7** |
| Skinwalker | 8.4 | 8.7 | 8.9 | 8.9 | 6.5 | **8.3** | 6.2 | **+2.1** |
| CYOA | 3.7 | 4.0 | 2.4 | 4.6 | 4.3 | **4.1** | 6.7 | **-2.6** |
| **AVG** | **7.8** | **8.2** | **8.2** | **8.4** | **7.8** | **8.1** | **6.4** | **+1.7** |

### Key Observations on V4 → V5 Deltas

- **Oracle** gained the most overall (+3.0), largely because the DID+astrology persona was ideal for the mode's behavioral data → prophecy pipeline.
- **GEEMS** gained most in absolute terms (+3.6), reflecting the notes pipeline fix rescuing a mode that scored 3.9 in V4 due to total notes failure.
- **Devil** gained least (+1.1), which is appropriate — it was already the strongest mode and its ceiling has moved only modestly.
- **CYOA is a 2.6-point regression from V4** (6.7 → 4.1). This is the only mode to worsen. The notes pipeline failure that V4 fixed has apparently re-broken in production for this mode specifically, returning it to V2-era baseline scores.

---

## 2. Cross-Mode Findings (Ranked by Frequency)

Issues and patterns appearing in 3 or more playtest reports, listed from most to least pervasive.

### Finding #1 — Notes Compression Loses Critical Specifics [7/8 modes]

Every simulation report except CYOA (which had no notes at all) flagged risk that `compressNotes()` could strip specifics that late-game callbacks depend on. In Devil mode: porcelain provenance details (Sèvres 1748, stress fracture). In Fever Dream: the verbatim T2 textfield response that paid off in T13. In Flagged: the radio option callback ("You're very good at this" at T6 seeded to T13). In GEEMS: the food metaphors that identify hypomanic state. In Oracle: the alter-speech patterns. In DrEvil: hospital names and urban exploration details. In Skinwalker: documented anomaly specifics.

The shared failure mode: the notes template tracks summaries and categories, but the late-game callback architecture requires verbatim preservation of early player disclosures. Compression that treats long text as bulk prose to truncate destroys the callbacks that make the experience feel personalized.

### Finding #2 — Valley Turn Weakness [6/8 modes: Devil, DrEvil, Oracle, Fever Dream, Skinwalker, Flagged]

Six modes showed the same structural weakness: after a high-intensity "spike" turn, the valley turn that follows produces thin, generic content. The shared directive (`TENSION_RHYTHM`) specifies that valley turns should provide "intimate" content — but "intimate" is being interpreted as "lighter" by the LLM. In practice, valley turns typically drop from 7-8 element types to 4-5, reduce textfield complexity, and default to atmosphere over psychological depth. Oracle's T6, DrEvil's T8, Skinwalker's T3 and T7, Devil's T6, and Flagged's T2 and T11 all showed this pattern.

The problem is structural: the `TENSION_RHYTHM` directive instructs the LLM to vary intensity, but doesn't define what high-quality valley content looks like. "Rest" vs "deeper intimacy" requires specific counter-instructions.

### Finding #3 — Condition Engagement Delayed Past Turn 5 [6/8 modes: DrEvil, GEEMS, CYOA, Skinwalker, Oracle, Flagged]

The `CONDITION_ENGAGEMENT` directive says "by turn 3, MUST have a working hypothesis" and "by turn 5, begin REFLECTING patterns back through the narrative." In 6 of 8 simulations, therapeutic mirroring of the persona's psychological condition did not activate until T7 or later. In Skinwalker, the paranoid persona's documentation behavior wasn't mirrored until T9 and T15. In CYOA, it never activated. In DrEvil, the social anxiety pattern wasn't structurally reflected until T7+. In Flagged, APD patterns weren't reflected until T6-T7.

The root cause is consistent: the `CONDITION_ENGAGEMENT` directive fires from notes analysis data, but behavioral signals in T1-T2 are too ambiguous to reliably form a hypothesis by T3 from standard behavioral patterns alone. The system cannot identify a condition from 2 turns of radio/slider data unless the player volunteers explicit textfield disclosures.

### Finding #4 — Reactive Text Underutilized or Absent [5/8 modes: Devil, DrEvil, Oracle, Flagged, Skinwalker]

Reactive text (the `reactive` field on text elements — text that swaps when a radio option is selected, providing instant feedback) was described as a signature feature in multiple mode prompts but appeared inconsistently. In Flagged, it was absent in T1-T3. In Oracle, it appeared in `ORACLE_FIRSTRUN` examples but couldn't be confirmed present in all turns. In DrEvil, it appeared in some phases but not others. Five reports explicitly noted reactive text as underused or absent, with engagement implications — turns without reactive text feel static; turns with it feel like the world responds.

### Finding #5 — Late-Game Element Variety Degradation [5/8 modes: Skinwalker, Flagged, DrEvil, Devil, CYOA]

Despite `PRE_GENERATION_CHECKLIST` mandating 6+ distinct interactive element types per turn, 5 modes showed element variety collapsing in the T11-T15 range. Skinwalker T13-T15 dropped exotic elements (color_pick, number_input, emoji_react). Flagged T11, T12, T14, T15 each had only 4 interactive types. DrEvil defaulted to button-group heavy patterns by T10. CYOA collapsed to 3-4 types throughout. Devil's technical scores were held flat at 8.0 specifically because element variety could not be verified in simulation.

The mechanism: under token pressure in late-game turns (notes + turn history + accumulated prompt = large context), the LLM prioritizes narrative efficiency over UI variety. Exotic element types are dropped first because the narrative can proceed without them. The `PRE_GENERATION_CHECKLIST` is in the prompt but isn't enforced by code — it relies entirely on LLM compliance.

### Finding #6 — SubjectId Evolution Unverifiable [4/8 modes: Devil, DrEvil, GEEMS, CYOA]

Four modes use the `subjectId` hidden field to track how the AI has come to understand the player (Devil: "The Newcomer" → "The Collector" → "The Appraiser"; DrEvil: "LabRat_New" → progressively specific labels). The playtest reports consistently noted that subjectId evolution is invisible to evaluators and unverifiable without live LLM output. The system relies on the LLM noticing that 3 turns have passed and updating the label spontaneously, but there is no checklist item in `PRE_GENERATION_CHECKLIST` requiring subjectId to change. In CYOA, the subjectId was "Patient_Zero" for all 15 turns.

### Finding #7 — 1-Turn Disclosure Lag [4/8 modes: DrEvil, GEEMS, Flagged, Skinwalker]

When a player makes their most revealing textfield disclosure in turn N, the AI cannot react within that same turn — the UI was already generated. The reaction (consequence echo) arrives in turn N+1 via the notes pipeline. But four reports noted that this lag creates a dissociation: the most vulnerable moment passes, the next turn starts as if nothing happened, and then only eventually references what was disclosed. In DrEvil, the "east wing service entrance" disclosure (T9) had its consequence echo in T11 — two full turns later. The notes template has no "high-value callback queue" field to flag disclosures for priority echo in the very next turn.

### Finding #8 — Meter Stagnation in Late Game [3/8 modes: Oracle, Skinwalker, Devil]

Three modes showed progression meters stalling at high values for multiple consecutive turns. Oracle's `prophecy_clarity` hit 90+ at T9 and remained there for 6 turns with no new metric to track. Skinwalker's `reality_stability` went from 25 to 0 in the final turns with no ability to stage a partial recovery arc. Devil's soul integrity meter was noted as resistant to deliberate divergence without explicit prompting. The V4 fix for meter stagnation (±5/turn mandate) appears effective for Therapeutic/engagement meters but not for narrative-progression meters whose late-game range is intentionally high.

### Finding #9 — No Mechanism for Player Behavioral Loop Detection [3/8 modes: DrEvil, CYOA, Skinwalker]

Three modes surfaced the same gap: a player can repeat the same behavioral pattern (avoiding NPCs, choosing the same archetype path, refusing social interaction) for 8+ consecutive turns without triggering counter-pressure. Stagnation detection fires on narrative repetition (same room type, same cliffhanger type) but not on player behavioral repetition. DrEvil's social anxiety persona could theoretically avoid NPC interaction for the entire 15-turn session. The CYOA persona chose "chaotic/bold" for 12 consecutive turns. Skinwalker's paranoid documentation behavior was never structurally challenged.

---

## 3. Priority-Ranked Code Changes

### P1-CRITICAL — Breaks Core Functionality

**P1-1: Add "Anchor Facts" Section to Notes Template (Protected from Compression)**
- **Description:** `compressNotes()` currently compresses all notes prose to fit under the 5K cap. This truncates early player disclosures that late-game callbacks depend on. A dedicated `**Anchor Facts:**` section should be explicitly marked as compression-exempt — max 10 bullet points of critical verbatim player content (first textfield word, key disclosures, planted seeds). The notes-updater LLM call should be instructed to always preserve these anchors unchanged.
- **Modes affected:** All 8 modes (7 reported risk; CYOA confirmed failure)
- **Files to change:** `app/src/modes/*/prompts.ts` (each NOTES_TEMPLATE), `app/src/engine/notes-updater.ts`
- **Complexity:** M — requires notes template changes in 8 modes plus compressNotes() exception handling

**P1-2: Fix CYOA Notes Pipeline Injection (Confirmed Critical Regression)**
- **Description:** CYOA is the only mode with actual run log data (V8), and the logs confirm "No session data yet." is rendering as visible UI across all turns. This is the same bug described as fixed in commit 67aa758, but has re-broken or was never fixed for CYOA specifically. Notes complete via the async `pendingNotesPromise` path but are not appearing in subsequent prompts. Requires logging to confirm `this.state.currentNotes` contains non-empty content by T3.
- **Modes affected:** CYOA confirmed; all modes at risk
- **Files to change:** `app/src/engine/game-loop.ts`, `app/src/engine/notes-updater.ts`, `app/src/engine/renderer.ts`
- **Complexity:** M — debugging existing pipeline, not new architecture

**P1-3: Fix Image Generation in CYOA (Zero Images in 15 Turns)**
- **Description:** CYOA run logs show zero images generated across all turns despite `IMAGE IS MANDATORY` in the prompt and `PRE_GENERATION_CHECKLIST` enforcing it. Either: (a) LLM is not returning `image` type elements, (b) Pollinations URL resolution is failing silently, or (c) `resolveImages()` is not finding `img[data-image-prompt]` elements. Other modes did not report this failure, making this CYOA-specific.
- **Modes affected:** CYOA confirmed; may affect others intermittently
- **Files to change:** `app/src/engine/renderer.ts` (image element path), `app/src/engine/game-loop.ts` (resolveImages function ~line 565)
- **Complexity:** S-M — narrow scope, find the silent failure point

**P1-4: Fix rating Element max:0 Bug (Persistent from V4)**
- **Description:** The Flagged playtest explicitly identified a `max:0` bug on `rating` elements where the maximum stars render as 0 despite correct prompt values. This bug was present in V4 logs and persists in V5. Rating elements are used at pivotal turns in Flagged (T13 emotional danger = 2/5, T15 final rating = 5/5) — if max is 0, these interactions are broken.
- **Modes affected:** Flagged confirmed; any mode using `rating` elements
- **Files to change:** `app/src/engine/renderer.ts` (rating element rendering), likely `parseLLMResponse()` where `max` is parsed from string to number
- **Complexity:** S — isolated parsing bug

### P2-HIGH — Significant Quality Impact

**P2-1: Add High-Value Callback Queue to Notes Template**
- **Description:** When a player makes a major textfield disclosure (long response, emotionally significant content, novel persona detail), the notes-updater should tag it as `**Priority Callback (next turn):**` so the main LLM has explicit instruction to reference it immediately in T+1. Currently, consequence echo arrives 1-2 turns late because the notes update and the next turn generation are parallel processes with no priority flagging.
- **Modes affected:** DrEvil, GEEMS, Flagged, Skinwalker (4/8 reported this lag; all modes benefit)
- **Files to change:** `app/src/modes/shared/prompts.ts` or per-mode NOTES_TEMPLATE in `app/src/modes/*/prompts.ts`
- **Complexity:** M — requires notes template update across modes + notes-updater LLM prompt update

**P2-2: Add PRE_GENERATION_CHECKLIST Item for SubjectId Evolution**
- **Description:** No checklist item currently requires subjectId to evolve. Add: `"[x] SubjectId has changed since 3 turns ago AND reflects a specific behavioral observation (not a generic label)"`. This turns the passive "evolve your understanding" instruction into a mandatory per-turn check. For CYOA, subjectId was "Patient_Zero" all 15 turns, confirming the instruction is not followed without a hard gate.
- **Modes affected:** Devil, DrEvil, GEEMS, CYOA (4 modes use diagnostic subjectId evolution)
- **Files to change:** `app/src/modes/shared/storytelling.ts` (PRE_GENERATION_CHECKLIST const)
- **Complexity:** S — add one checklist item

**P2-3: Add Valley Turn Protocol to TENSION_RHYTHM Directive**
- **Description:** The current `TENSION_RHYTHM` directive tells the LLM when to create valley turns but not what a high-quality valley turn contains. Add explicit valley turn specification: "VALLEY TURN ≠ REST. A valley is deeper intimacy at lower volume. Include: catharsis-focused textfield ('What would you say if no one could hear?'), specific validation of the player's most vulnerable recent response, and exactly one seed for the next spike. Valley turns must have MORE intimacy than standard turns, not fewer elements."
- **Modes affected:** All 6 modes that reported valley weakness (Devil, DrEvil, Oracle, Fever Dream, Skinwalker, Flagged)
- **Files to change:** `app/src/modes/shared/storytelling.ts` (TENSION_RHYTHM const)
- **Complexity:** S — prose addition to existing directive

**P2-4: Add Behavioral Loop Detection to Notes Template**
- **Description:** The notes template should include a `**Behavioral Loop Alert:**` field: if the player has chosen the same archetype (bold/chaotic/etc.), avoided the same NPC type, or used the same avoidance pattern for 3+ consecutive turns, flag it explicitly. The next turn prompt should inject: "Player has repeated [pattern] for [N] turns. NEXT turn MUST create a scenario where continuing this pattern has direct narrative consequences — not a punishment, but a mirror."
- **Modes affected:** DrEvil, CYOA, Skinwalker (3 modes confirmed gap; all modes benefit)
- **Files to change:** `app/src/modes/shared/prompts.ts` (shared notes template) or per-mode NOTES_TEMPLATE
- **Complexity:** M — notes template + injection logic in buildTurnPrompt

**P2-5: Make Reactive Text Mandatory in PRE_GENERATION_CHECKLIST**
- **Description:** Reactive text (text elements with a `reactive` field keyed to radio selections) is documented as a high-engagement feature but is inconsistently applied. Add to `PRE_GENERATION_CHECKLIST`: `"[x] At least ONE text element has a 'reactive' field that changes based on the radio selection. This creates instant feedback without extra LLM calls."` This promotes the feature from optional to verified-present.
- **Modes affected:** All 5 modes that reported underuse (Devil, DrEvil, Oracle, Flagged, Skinwalker); all modes benefit
- **Files to change:** `app/src/modes/shared/storytelling.ts` (PRE_GENERATION_CHECKLIST)
- **Complexity:** S — add one checklist item

**P2-6: Condition Naming Guard for Final Turn**
- **Description:** The Fever Dream and Skinwalker reports both flagged that using clinical condition names in the final turn (T15) is risky. A player who has not self-disclosed their diagnosis may feel invaded or alarmed when the AI names it. The ENDGAME_DIRECTIVE and CONDITION_ENGAGEMENT should be modified: "NEVER use the clinical label for a psychological condition unless the player has explicitly named it in a textfield. Instead, use the metaphor language established during the session (e.g., 'the distance,' 'the pattern,' 'the vigilance')."
- **Modes affected:** Fever Dream, Skinwalker; all modes using CONDITION_ENGAGEMENT
- **Files to change:** `app/src/modes/shared/storytelling.ts` (ENDGAME_DIRECTIVE, CONDITION_ENGAGEMENT)
- **Complexity:** S — prose addition to existing directives

### P3-MEDIUM — Polish and Enhancement

**P3-1: Add Obsession Mirroring Protocol to Notes Template**
- **Description:** Oracle's high score partly resulted from the AI incorporating the player's astrology obsession into the prophecy (T7, T11) — but this emerged from textfield data organically rather than a defined protocol. Formalize: if notes detect a player's personal organizing framework (astrology, MBTI, tarot, religious system, etc.) from textfield disclosures, inject an OBSESSION_MIRROR directive: "Incorporate [framework] vocabulary into [N] of the next 3 turns. Speak the player's symbolic language." All modes benefit from this general pattern.
- **Modes affected:** Oracle confirmed high-value; DrEvil, GEEMS, Devil, Fever Dream all benefit
- **Files to change:** `app/src/modes/shared/prompts.ts` (notes template), `app/src/engine/game-loop.ts` (buildTurnPrompt injection)
- **Complexity:** M — new notes field + injection logic

**P3-2: Narrator/Voice Mode Rotation Tracking in Notes**
- **Description:** DrEvil's report identified that the "sardonic, brilliant, entertained" voice defaults to one-liner snarky commentary pattern by T10-12 without explicit rotation enforcement. Add `**Voice Mode This Turn:** [glee|snarky|approval|menace|warmth|bewilderment|delight|silence]` to DrEvil's notes template to force explicit tracking of which voice register was last used. Skinwalker needs similar tracking for the narrator's fourth-wall break protocol (currently fires at T3 instead of the specified T10+).
- **Modes affected:** DrEvil, Skinwalker primarily; Fever Dream (dream voice consistency); Oracle (prophecy register variation)
- **Files to change:** `app/src/modes/drevil/prompts.ts`, `app/src/modes/skinwalker/prompts.ts`, notes templates
- **Complexity:** S per mode

**P3-3: Narrator Protocol Gate in buildTurnPrompt**
- **Description:** Skinwalker specifies narrator fourth-wall breaks begin at T10, but the simulation showed the narrator addressing the player directly in T3. The turn gate should be enforced in code, not left to the LLM: inject either a NARRATOR_BREAK_PERMITTED or NARRATOR_PROTOCOL_LOCKED directive based on turn number, making it explicit in the prompt rather than relying on the LLM to remember the T10 rule from training context.
- **Modes affected:** Skinwalker
- **Files to change:** `app/src/modes/skinwalker/prompts.ts` or `app/src/engine/game-loop.ts` (buildTurnPrompt turn-gated injection)
- **Complexity:** S — turn-gated conditional injection

**P3-4: Stability/Meter Ceiling Prevention (Proactive)**
- **Description:** Fever Dream's stability oscillation protocol currently triggers corrective action at floor (0) and ceiling (100), which is a cliff-edge mechanic. Both Fever Dream and Oracle reported their meters sitting at high values for multiple turns without triggering correction. Move the intervention threshold: inject chaos/chaos-prevention content when stability > 65 (not 100) for two consecutive turns; similarly, inject beauty/grounding when stability < 25 (not 0).
- **Modes affected:** Fever Dream (stability meter), Oracle (prophecy clarity), Skinwalker (reality stability)
- **Files to change:** `app/src/modes/fever-dream/prompts.ts`, `app/src/modes/oracle/prompts.ts`, `app/src/modes/skinwalker/prompts.ts`
- **Complexity:** S per mode — add threshold value to existing protocol text

**P3-5: Slider Label Quality Requirements for Dreamlike Modes**
- **Description:** Fever Dream's report identified that prosaic slider labels ("0=brief, 10=long time") break the dreamlike voice established elsewhere. The prompt should mandate metaphorical labeling for all slider min/max in modes with surrealist or mystical registers: "Slider labels must be mode-appropriate. Fever Dream sliders: metaphorical and dream-registered only. Oracle sliders: prophecy-framed. NEVER 'brief/long time' — instead '0=a breath, 10=geological time.'"
- **Modes affected:** Fever Dream, Oracle, Devil (deal framing), Skinwalker (horror register)
- **Files to change:** Per-mode `prompts.ts` BEHAVIORAL_DIRECTIVES sections
- **Complexity:** S — prompt prose addition

**P3-6: Near-Endgame Meta-Explicitness Fix**
- **Description:** Two modes (Fever Dream T13, GEEMS final arc) show the LLM making explicit system announcements ("This is approaching endgame," "Two more turns. The dream knows.") that break immersion. The `NEAR_ENDGAME_DIRECTIVE` should add: "DO NOT announce remaining turns or session status explicitly. Embed the approaching conclusion in the world-voice of the mode — 'the dream thinning at the edges,' 'the deal's final clause,' 'the last experiment.' Never break the fourth wall to announce mechanics."
- **Modes affected:** Fever Dream, GEEMS; all modes share `NEAR_ENDGAME_DIRECTIVE`
- **Files to change:** `app/src/modes/shared/storytelling.ts` (NEAR_ENDGAME_DIRECTIVE)
- **Complexity:** S — prose addition to existing directive

---

## 4. Implementation Recommendations

The following 7 changes are ordered by impact-to-effort ratio. The first three are prerequisite to meaningful quality gains; the remaining four deliver the highest per-change quality lift.

### Rec 1: Add Anchor Facts Section to All Notes Templates (P1-1) — Effort S, Impact CRITICAL

Every high-value playtest depended on notes preserving specific verbatim content. The fix is a single addition to each mode's `NOTES_TEMPLATE`: a `**Anchor Facts (never compress):**` section with a bullet list of verbatim player disclosures. The notes-updater LLM call should include: "The Anchor Facts section must be copied verbatim to every future notes update — do not summarize or remove it." This is the single change with the widest impact across all modes.

### Rec 2: Fix CYOA Notes/Image/Rating Bugs Before Next Playtest (P1-2, P1-3, P1-4) — Effort M, Impact CRITICAL for CYOA

CYOA is the only mode with confirmed production regression. Three specific bugs (notes visibility, image generation silence, rating max:0) are blocking quality in the mode that currently scores lowest. These fixes don't require new architectural work — they require identifying which specific code paths are failing silently. Fixing them would likely bring CYOA from 4.1 back to its V4 baseline of 6.7 or better.

### Rec 3: Add Valley Turn Protocol and High-Value Callback Queue (P2-1, P2-3) — Effort S+M, Impact HIGH for 6/8 modes

These two directives address the two most pervasive quality issues: valley turns being hollow rests rather than deeper intimacy, and disclosure lag leaving the player's most vulnerable moments without immediate consequence. Both are prompt-level changes requiring no code logic, only prose additions to shared directives. Combined, they address failures found in 6 of 8 modes.

### Rec 4: Enforce Reactive Text and SubjectId via PRE_GENERATION_CHECKLIST (P2-2, P2-5) — Effort S, Impact MEDIUM for all modes

Two single-line additions to the `PRE_GENERATION_CHECKLIST` would transform these from aspirational features (LLM may or may not comply) to verified-present features (LLM must check them off before submitting). The reactive text item alone would lift engagement in every mode that currently lacks it, since reactive text creates instant feedback that makes player choices feel consequential within the same turn.

### Rec 5: Behavioral Loop Detection in Notes Template (P2-4) — Effort M, Impact HIGH for DrEvil, CYOA, Skinwalker

Three modes showed players able to repeat the same behavioral pattern 8+ turns without any counter-pressure from the system. For a platform whose central claim is psychological profiling, allowing a player to be behaviorally invisible to the system for 60% of the session is a fundamental gap. The notes template `**Behavioral Loop Alert:**` field plus a turn-injection rule for 3+ turn repetition is a targeted fix with high therapeutic and engagement value.

### Rec 6: Obsession Mirroring Protocol (P3-1) — Effort M, Impact HIGH when triggered

Oracle's standout moment — incorporating the player's astrology framework into prophecy (T7, T11) — produced the largest single engagement spike of any simulation turn (T5: 9.2, T7: 9.0, T8: 9.2 Oracle scores). When the AI speaks the player's own symbolic language, the experience becomes personalized in a way that generic behavioral analysis cannot replicate. The mechanism (detect framework from textfield → mirror in narrative within 2 turns) is straightforward and directly tied to the platform's core mission.

### Rec 7: Condition Naming Guard and Near-Endgame Anti-Meta (P2-6, P3-6) — Effort S, Impact MEDIUM for safety + immersion

The condition naming guard is a safety issue: an undiagnosed player who has shared authentically for 14 turns should not be presented with a clinical label in turn 15 that may alarm or feel invasive. The near-endgame anti-meta change prevents immersion-breaking system announcements. Both are short prose additions to existing directives. Combined they address both safety and polish concerns.

---

## 5. Simulation vs. Reality Caveat

**All scores except CYOA are simulations.** CYOA is the only mode evaluated against actual production run logs (V8). Every other mode was simulated by a Playtest Agent who designed both the player persona's responses AND the AI's outputs — an inherently optimistic methodology.

### Expected Realistic Adjustment: -1.0 to -1.5 points on simulated scores

| Source of Inflation | Typical Effect |
|---------------------|---------------|
| Playtest Agent designed ideal persona responses (rich textfields, psychologically coherent choices, consistent engagement) | +0.3 to +0.5 points |
| Playtest Agent simulated ideal LLM output (prompt directives followed, all checklists honored) | +0.4 to +0.6 points |
| Single-persona coverage (each report uses one optimal persona; average players are less engaged) | +0.3 to +0.5 points |
| No testing of failure modes (adversarial players, monosyllabic responses, random choices) | Engages floor risk that adds -0.5 to all engagement scores |

### Realistic Score Estimates (simulated modes)

| Mode | V5 Simulated | Realistic Estimate | Rationale |
|------|-------------|-------------------|-----------|
| Fever Dream | 9.4 | 7.5-8.5 | V4 was 6.6 under real conditions; +2.8 delta unlikely to fully hold |
| Oracle | 8.9 | 7.2-7.8 | Oracle report self-notes "DID persona is near-perfectly matched to this mode" |
| Flagged | 8.8 | 7.5-8.0 | Two-player orchestration introduces real-world sync failures not modeled |
| GEEMS | 8.8 | 6.5-7.5 | "Most notes-dependent mode" — real degradation under notes lag/timeout |
| Devil | 8.3 | 7.5-8.0 | Devil was 7.2 in V4 real conditions; +1.1 delta plausible with persona improvement |
| DrEvil | 8.3 | 7.0-7.5 | Assumes live analysis data available; real pipeline timing adds risk |
| Skinwalker | 8.3 | 7.0-7.5 | Therapeutic value (6.5) will likely score lower under real conditions |
| CYOA | 4.1 | 4.1 | Confirmed from real production logs — no adjustment needed |

### Why CYOA's Score Is Uniquely Credible (and Troubling)

CYOA is the honest data point in this dataset. Its 4.1 score reflects actual production behavior — the notes pipeline failure, zero images, turn duplication, and element monotony are confirmed from V8 run screenshots and logs. The gap between CYOA's actual 4.1 and its simulated V4 potential of 6.7 demonstrates exactly the kind of deflation that other modes' simulated scores need to account for. If the V5 infrastructure fixes (notes pipeline, endgame directives, condition engagement) were working correctly for CYOA, it would score 7.0-7.5, not 4.1.

That CYOA is scoring at V2 baseline while other modes show V5 gains suggests either: (a) the fixes were applied to some modes but not deployed universally, or (b) CYOA has mode-specific rendering/pipeline bugs that the shared fixes didn't address. Either way, CYOA is the canary — and it is currently not doing well.

---

## 6. Mode-by-Mode Narrative Summary

### Devil — Stable Leader
The strongest mode continues to improve incrementally. The deal-making frame is uniquely suited to the diagnostic mission — every player choice IS behavioral data, unlike narrative modes where choices are primarily story-driven. The Soul Meter divergence (self-report vs. engine-tracked) identified in this simulation is the mode's most technically innovative unrealized feature. Primary risk remains notes compression dropping NPC specifics (curator, portraits) that late-game callbacks require. Realistic ceiling: 8.0 for a highly engaged player.

### DrEvil — Structural Strengths Confirmed
The phase architecture (intake → escalation → full chaos → peak madness → meta) and the cliffhanger rotation system are executing well. The behavioral directive approach — routing around self-report dishonesty for a social anxiety persona — is genuinely effective. The main structural gap is the 1-turn disclosure lag and the absence of a behavioral loop detection mechanism. Realistic ceiling: 7.5 for an engaged player.

### GEEMS — Most Notes-Dependent, Highest Upside
GEEMS went from 3.9 (V4, notes-broken) to 8.8 (V5 simulation), the largest improvement in the suite. But it is also the mode where the gap between simulation and reality is likely largest. The GEEMS cold-start problem (T1-2 can't adapt before player discloses) means early turns always underperform relative to the mode's potential. The endgame directive vs. GEEMS_MAIN radio contradiction (reflect vs. escalate) needs resolution before T15 arc closes cleanly.

### CYOA — Critical Regression, Foundational Fixes Required
The only mode evaluated against real production data. Zero images, constant "No session data yet." rendering, turn duplication, 3-4 element types throughout. The infrastructure exists — the storytelling directives, the DIAGNOSTIC_PROBES system, the CYOA_ANALYSIS_DIRECTIVE — but none can activate without a functioning notes pipeline. This is not a design failure; it is a deployment/pipeline failure. The good news: a player with a rich persona (the C-PTSD storm-chaser) generated a coherent 15-turn therapeutic arc entirely from their own textfield content, demonstrating the ceiling when the system works.

### Oracle — Highest Therapeutic Ceiling
Produced the highest single-turn scores in the simulation suite (T13: 9.8, T12: 9.6). The behavioral data → prophecy pipeline is mechanically elegant — behavioral choices become cold-reading accuracy over time. The DID/astrology persona was near-perfectly matched to the mode's mechanics, which means the 8.9 simulation score likely represents the ceiling rather than average. Realistic estimate for a typical player: 7.2-7.8. The recommendations here (valley turns, meter redesign, obsession mirroring) would raise that floor.

### Skinwalker — Horror Mechanics Strong, Therapeutic Layer Thin
The anomaly design and mutation engine are the most technically innovative features in the suite. "You Shouldn't Have Said My Name" (T12) and the reality stability meter collapse are excellent horror design. But the therapeutic layer consistently underperformed (6.5/10 — lowest therapeutic score of any mode), and the CONDITION_ENGAGEMENT directive's mirror-not-accuse principle was violated: the mode correctly identifies paranoid patterns but frames them as horror-accusation rather than acknowledgment. The documentation contradiction mechanic (attacking the player's notes rather than their perception) is a promising solution that doesn't yet exist in the prompts.

### Fever Dream — Highest Simulated Score, Most Fragile Dependency
The highest simulated score (9.4) is partly a function of the persona (DPDR + synesthesia is near-perfect for this mode) and partly genuine mode quality. The textfield-as-therapy architecture (T2 "threshold" → T13 callback) is the finest piece of narrative threading in the suite. But it is entirely dependent on notes preserving verbatim player text — the most fragile dependency in the system. The realistic estimate (7.5-8.5) reflects this fragility.

### Flagged — Multiplayer Architecture Validated
The three-LLM orchestration pattern (orchestrator → per-player UI generators) is functioning as designed in simulation. Date event injection compliance (T4, T7, T10, T13) shows the mandate is being followed with adequate frequency. The APD + extreme sports persona produced the most emotionally resonant single session moment across all modes: "You're the first person who followed. I don't know what to do with that." (T14). The main structural risks are: notes compression losing radio-option seeds, the rating max:0 bug disrupting pivotal scoring moments, and condition engagement activating 2-3 turns later than specified.

---

*Meta-analysis compiled from 8 individual V5 playtest reports.*
*Playtest Agents: Claude Sonnet 4.6*
*All file paths reference the `evildrgemini/evildrgemini.github.io` / `app/src/` architecture.*
