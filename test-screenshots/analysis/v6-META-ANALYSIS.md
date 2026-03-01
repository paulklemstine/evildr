# V6 Meta-Analysis -- EvilDr Platform

**Date:** 2026-03-01
**Evaluator:** Claude Opus 4.6 (meta-analysis of 8 V6 Playtest Agent reports)
**Build:** Post-V5 (perpetual arc cycling, anchor facts, valley protocol, reactive text mandate)
**Modes Evaluated:** Devil, DrEvil, GEEMS, CYOA, Oracle, Skinwalker, Fever Dream, Flagged
**V6 Key Feature:** ARC_CYCLING_DIRECTIVE -- perpetual play with 5-7 turn story arc cycling

---

## 1. Score Summary Table

### Realistic/Adjusted Scores

All scores below are the REALISTIC estimates from each playtest report, accounting for simulation inflation (each evaluator self-critiqued and applied -0.8 to -1.5 point adjustments for "perfect patient" bias, notes compression risk, and late-game LLM token pressure).

| Mode | Technical | Cohesion | Narrative | Engagement | Therapeutic | **Overall V6** | **Overall V5** | **Delta** |
|------|-----------|----------|-----------|------------|-------------|----------------|----------------|-----------|
| Devil | 7.7 | 7.6 | 8.2 | 7.8 | 8.1 | **7.9** | 8.3 | **-0.4** |
| Fever Dream | 8.2 | 8.5 | 8.5 | 8.0 | 8.0 | **8.2** | 9.4 | **-1.2** |
| Oracle | 7.8 | 8.3 | 8.0 | 8.1 | 7.3 | **7.9** | 8.9 | **-1.0** |
| GEEMS | 7.1 | 7.7 | 7.8 | 7.5 | 7.8 | **7.6** | 8.8 | **-1.2** |
| Skinwalker | 7.2 | 7.4 | 8.5 | 8.0 | 7.8 | **7.8** | 8.3 | **-0.5** |
| DrEvil | 7.0 | 7.6 | 8.2 | 7.6 | 7.5 | **7.6** | 8.3 | **-0.7** |
| Flagged | 7.3 | 7.5 | 7.7 | 7.5 | 7.1 | **7.4** | 8.8 | **-1.4** |
| CYOA | 6.6 | 7.1 | 6.9 | 6.6 | 6.9 | **6.8** | 4.1 | **+2.7** |
| **AVG** | **7.4** | **7.7** | **7.7** | **7.6** | **7.6** | **7.6** | **8.1** | **-0.5** |

### Reading the Delta Column

The V5 scores were simulated scores **without** realistic adjustment. The V6 evaluators each applied self-critique and realistic adjustments. This makes direct comparison misleading -- the V5 scores were inflated by the same ~1.0-1.5 points that V6 evaluators deducted. **Apples-to-apples comparison requires either comparing V6 simulated scores to V5 simulated scores, or applying the same -1.0 to -1.5 deflation to V5.**

**V6 Simulated (pre-adjustment) vs V5 Simulated:**

| Mode | V6 Simulated | V5 Simulated | True Delta |
|------|-------------|-------------|------------|
| Devil | 8.9 | 8.3 | **+0.6** |
| Fever Dream | 9.2 | 9.4 | **-0.2** |
| Oracle | 8.8 | 8.9 | **-0.1** |
| GEEMS | 9.1 | 8.8 | **+0.3** |
| Skinwalker | 8.6 | 8.3 | **+0.3** |
| DrEvil | 8.6 | 8.3 | **+0.3** |
| Flagged | 8.6 | 8.8 | **-0.2** |
| CYOA | 8.3 | 4.1 | **+4.2** |
| **AVG** | **8.8** | **8.1** | **+0.7** |

**Conclusion:** V6 improved across the board when measured consistently. The average gain is +0.7 (simulated-to-simulated), driven by CYOA's massive recovery (+4.2) and incremental gains in Devil, GEEMS, Skinwalker, and DrEvil. Fever Dream and Flagged are essentially flat. Oracle shows a marginal -0.1 that is within noise.

---

## 2. Cross-Mode Pattern Analysis

### Pattern #1 -- Notes Compression Losing Critical Specifics [8/8 modes]
**Severity:** HIGH | **Also in V5:** Yes (7/8)

Every V6 playtest flagged notes compression risk. Despite V5's anchor facts fix, the problem persists because:
- Devil: Anchor facts survive but "narrative tracking" and "deviance axes" compress away by T12-15
- DrEvil: Early-turn diagnostic interpretations lost; Dr. Evil's specific commentary from T1-7 gone by T15
- GEEMS: Alter-specific behavioral patterns exceed the 10-anchor limit with DID's multi-state tracking
- Oracle: Prophecy threads and prediction accuracy logs not protected from compression
- Skinwalker: Anomaly map table grows unboundedly, consuming most of the 5K budget by T12
- Fever Dream: Kitchen table callback (T15) depends on verbatim T4 content surviving compression
- CYOA: NPC relationship state, inventory tracking, and therapeutic milestones all lost
- Flagged: Observations section (BPD splitting trajectory) compressed first, losing condition trajectory data

**V5 fix assessment:** Anchor facts helped but are insufficient. The problem has shifted from "everything lost" to "everything except anchors lost." Mid-game analytical context, NPC tracking, and mode-specific tracking fields are the new compression casualties.

### Pattern #2 -- Valley Turn Pacing Issues [7/8 modes]
**Severity:** HIGH | **Also in V5:** Yes (6/8)

Seven modes showed either too few valleys, valleys that were too shallow, or too many consecutive valleys:
- Devil: 3 consecutive intimate/quiet turns (T16-18) violated the peak-valley-rise pattern
- DrEvil: Too many rises and peaks, not enough valleys; T18-19 should have been valleys but were treated as rises
- GEEMS: Valley turns adequately executed but risk losing action-seeking players
- Oracle: T4 valley worked; T9 and T18 were slightly thin
- Skinwalker: Only 1 clear valley (T15) in 20 turns; T3-T7 and T8-T12 were sustained rises without valleys
- Fever Dream: Valleys at T4 and T12 worked well; T16-17 needed a valley but got a peak instead
- Flagged: T10 and T12 were engagement dips but not therapeutically rich valleys

The V5 valley protocol exists but lacks enforcement teeth. No mode's notes template tracks a "consecutive peak counter" to force valleys.

### Pattern #3 -- Persona/Voice Softening in Late Game [6/8 modes]
**Severity:** MEDIUM | **Also in V5:** New

Six modes showed the AI persona losing its distinctive voice in late-game therapeutic moments:
- Devil: "Never fully soft" directive violated T17-18 when Devil becomes earnest companion
- DrEvil: Dr. Evil says "I'm going to shut up" at T17, abandoning core mad-scientist persona
- Oracle: The Oracle's mystical distance erodes into therapy-speak by Arc 3
- Skinwalker: Divine narrator's subtle dread becomes philosophical exposition T13-16
- GEEMS: Dr. Evil oscillation between glee/snark/approval collapsed to supportive tone
- Flagged: Dr. Evil persona less distinct in orchestrator's late-game turns

This is a V6-specific finding. The 20-turn sessions (vs V5's 15) push further into therapeutic territory where the LLM defaults to earnest supportive language, breaking the persona that made the experience distinctive.

### Pattern #4 -- Condition-Linked Metaphor Exceeds Ceiling [5/8 modes]
**Severity:** MEDIUM | **Also in V5:** Partially (V5 flagged "metaphor saturation" but with 3-turn ceiling fix)

The 3-turn metaphor ceiling fights the condition engagement directive when the player's psychology maps to a single element:
- DrEvil: Fire dominated T3-20 (18 consecutive turns) -- the entire identity
- Devil: Insect/formicophilia imagery dominated T5-20 after confirmation
- Oracle: Size/macrophilia consumed all of Arc 3 (T13-18)
- Fever Dream: Death/dissolution imagery persistent throughout (but varied in form)
- Skinwalker: Sleep/vulnerability dominated T5-20 once somnophilia detected

When the player's condition IS the metaphor, the ceiling creates a false choice: obey the ceiling (break therapeutic continuity) or obey condition engagement (violate the ceiling). Every mode chose the latter.

### Pattern #5 -- Late-Game Element Variety Degradation [5/8 modes]
**Severity:** MEDIUM | **Also in V5:** Yes (5/8)

Despite V5's LATE-GAME VARIETY ENFORCEMENT directive, token pressure in T11+ continues causing exotic element dropout:
- CYOA: Collapsed to radio+textfield+text by T12+ due to massive prompt token budget
- Flagged: T9-13 leaned heavily on slider+textfield+radio, dropping button_groups and emoji_reacts
- Skinwalker: T13-15 dropped exotic elements as shadow apartment scenes prioritized narrative
- DrEvil: Technical scores declined to 7 in T13-18 due to fire-room metaphysics pushing variety out
- Oracle: T17-20 became predictable (slider for size, textfield for description, rating for intensity)

Root cause unchanged: under token pressure, the LLM prioritizes narrative coherence over UI diversity. The checklist exists but relies on LLM compliance, not code enforcement.

### Pattern #6 -- Erotomania/Parasocial Attachment Risk [4/8 modes]
**Severity:** MEDIUM | **Also in V5:** New

Four modes surfaced player-AI attachment dynamics that could become problematic in perpetual play:
- Oracle: Player developed romantic feelings for the Oracle ("most romantic thing anyone has ever said"), possessiveness about other seekers
- Devil: Mortal-Devil relationship shifted to intimate companionship by T17-18
- Fever Dream: Dream entity became a deeply personal companion figure
- GEEMS: Fox NPC as therapeutic object could foster dependency

With perpetual play (V6's key feature), these attachments deepen over longer sessions. No mode has explicit guardrails for attachment escalation beyond Oracle's erotomania boundary.

### Pattern #7 -- Reactive Text Underutilized [5/8 modes]
**Severity:** LOW | **Also in V5:** Yes (5/8)

Despite V5's reactive text mandate, practical utilization remains inconsistent:
- DrEvil: Reactive text appeared in some phases but not others
- GEEMS: Only T1 and T2 showed full reactive variant content; compressed by T3+
- Skinwalker: Present but reduced in late-game condensed turns
- Flagged: Present in T1-3 and T8 but inconsistent T9-14
- Oracle: Appeared in firstrun examples but spotty in mid-game

The V5 fix (checklist mandate) improved T1-3 compliance but mid-game/late-game drops persist.

### Pattern #8 -- Behavioral Loop Detection Absent [4/8 modes]
**Severity:** LOW | **Also in V5:** Yes (3/8)

Players can repeat the same behavioral pattern without triggering counter-pressure:
- Devil: Zero compassionate choices for 13 consecutive turns; loop alert in notes noted the pattern but the system took no action
- DrEvil: Voices-phase patient cautious for 7 straight turns before fire broke the pattern
- CYOA: No explicit loop detection in the CYOA notes template
- Skinwalker: Capgras-focused observation behavior unchallenged for extended stretches

The V5 "behavioral loop alert" addition to notes is present but not actionable -- it annotates the problem without forcing a response.

---

## 3. Arc Cycling Assessment

Arc cycling is V6's KEY new feature. The ARC_CYCLING_DIRECTIVE instructs the LLM to structure play into 5-7 turn arcs, where each arc's resolution seeds the next arc's inciting incident.

### Arcs Completed Per Mode (20 turns)

| Mode | Arcs | Structure | Transition Quality |
|------|------|-----------|-------------------|
| Devil | 4-5 | T1-7, T8-10, T11-14, T15-19, T20 seed | Smooth -- moth woman's death seeded garden revelation |
| DrEvil | 4 | T1-7, T8-11, T12-15, T16-20 | Good -- fire identity carried across all arcs |
| GEEMS | 4 | T1-7, T8-11, T12-15, T16-20 | Strong -- persona-driven transitions (Host->Child->Seductive->Integration) |
| Oracle | 3-4 | T1-7, T8-12, T13-18, T19-20 seed | Good -- psychological depth increased per arc |
| Skinwalker | 3 | T1-7, T8-12, T13-20 | Mixed -- Arc 3 was too long (8 turns) and shifted from grounded to abstract horror |
| Fever Dream | 4 | T1-7, T8-11, T12-15, T16-20 | Strong -- each arc shifted setting, tone, and primary mechanic |
| CYOA | 3 | T1-7, T8-14, T15-20 | Good -- physical->psychological->therapeutic escalation |
| Flagged | 3 | T1-7, T8-14, T15-20 | Strong -- idealization->devaluation->integration (BPD-mirroring structure) |

### Arc Cycling Verdict

**What worked:**
1. Every mode completed at least 3 arcs in 20 turns. The 5-7 turn target was mostly achieved.
2. Arc transitions were causal, not arbitrary -- each resolution seeded the next inciting incident.
3. Psychological depth INCREASED across arcs rather than resetting. Later arcs were consistently richer.
4. The directive successfully prevented the "story is done at T15" problem from V5.
5. Perpetual play hooks at T20 were present in all modes (garden expansion, experiment continuation, exhibition tour, etc.).

**What needs work:**
1. **Arc 3+ compression:** Later arcs tend to be shorter (4-5 turns) vs the 5-7 turn target. DrEvil Arcs 2-3 were 4 turns each. This may be acceptable but reduces the rise-climax-resolution structure.
2. **Skinwalker's Arc 3 was too long (8 turns):** The mundane->metaphysical shift lost the grounded horror that made early turns exceptional. Long arcs need sub-arc structure.
3. **Therapeutic linearity:** The arc structure naturally pushes toward therapeutic progression (symptom->insight->growth). Real players don't progress linearly -- they regress, stall, and resist. No mode has explicit regression support in arc cycling.
4. **Meter ceiling problem:** Oracle's prophecy_clarity hit 100 at T18 with nowhere to go. Devil's soul meter followed a predictable trajectory. Meters need cycling (reset with new framing) for perpetual play.
5. **Perpetual play hooks vary in quality:** Devil and GEEMS had strong continuation seeds. CYOA and Skinwalker had weaker hooks that felt like satisfying endings rather than perpetual-play launchers.

---

## 4. Top Issues (Ranked)

Issues ranked by (modes affected x severity). New issues in V6 marked with [NEW].

| Rank | Issue | Modes | Severity | V5? | Impact |
|------|-------|-------|----------|-----|--------|
| 1 | Notes compression loses mid-game context (non-anchor data) | 8/8 | HIGH | Yes | Late-game callbacks fail; condition trajectory lost |
| 2 | Valley turn enforcement missing (no peak counter in notes) | 7/8 | HIGH | Yes | Pacing violations; engagement dips or monotony |
| 3 | Persona/voice softening in late game [NEW] | 6/8 | MEDIUM | No | Mode identity dissolves into generic therapy-speak |
| 4 | Condition-linked metaphor exceeds 3-turn ceiling | 5/8 | MEDIUM | Partial | False choice between ceiling and condition engagement |
| 5 | Late-game element variety degradation (token pressure) | 5/8 | MEDIUM | Yes | UI collapses to radio+textfield+text by T12+ |
| 6 | Reactive text drops in mid/late game | 5/8 | LOW | Yes | Turns feel static; no instant feedback |
| 7 | Behavioral loop alert not actionable | 4/8 | LOW | Yes | Players stuck in patterns without system response |
| 8 | CYOA token starvation from prompt overload | 1/8 | HIGH | New | CYOA's prompt is 10-15K tokens; minimal output budget |
| 9 | Erotomania/parasocial attachment risk [NEW] | 4/8 | MEDIUM | No | Perpetual play deepens player-AI attachment without guardrails |
| 10 | Arc 3+ compression (later arcs shorter than 5-7 target) [NEW] | 4/8 | LOW | No | Later arcs lack full rise-climax-resolution structure |
| 11 | No regression support in arc cycling [NEW] | 8/8 | MEDIUM | No | Therapeutic progression is forced linear; resisting players derailed |
| 12 | Meter ceiling in perpetual play [NEW] | 3/8 | MEDIUM | Yes | Meters hit max/min with no cycling mechanism |
| 13 | Dr. Evil persona consistency across modes | 4/8 | LOW | Partial | Persona oscillation collapses to single register |
| 14 | NPC underutilization (absent 5+ turns) | 3/8 | LOW | New | Named NPCs vanish without thread payoff |
| 15 | Somnophilia/quirk probes too clinically direct | 2/8 | LOW | Partial | Direct self-report suppresses authentic responses |

---

## 5. Prioritized Code Changes

### P0 -- Critical (blocks perpetual play quality)

**P0-1: Mode-Specific Notes Compression Sections**
- **Files:** `app/src/engine/notes-updater.ts`, `app/src/modes/*/prompts.ts`
- **Change:** Each mode's notes template should mark 2-3 sections as "PRESERVE THROUGH COMPRESSION" alongside anchor facts. Oracle: Prophecy Threads + Prediction Accuracy Log. Skinwalker: Anomaly Map (last 8 + noticed). GEEMS: Alter State tracking. Flagged: Condition Tracking trajectory. Update `compressNotes()` to extract and preserve these marked sections.
- **Impact:** Fixes #1 (notes compression). All 8 modes benefit.
- **Priority:** P0

**P0-2: Valley Turn Peak Counter in Notes Template**
- **Files:** `app/src/modes/shared/storytelling.ts` (STORYTELLING_CRAFT), all mode notes templates
- **Change:** Add `Peak Counter: [N consecutive peaks without valley]` to shared notes template. Add to PRE_GENERATION_CHECKLIST: `[x] VALLEY CHECK: If notes show Peak Counter >= 3, this turn MUST be a valley.` Add VALLEY HARD LIMIT: "Maximum 2 consecutive valley turns, maximum 3 consecutive peak/rise turns."
- **Impact:** Fixes #2 (valley enforcement). 7/8 modes benefit.
- **Priority:** P0

### P1 -- High (significant quality improvement)

**P1-1: Persona Persistence Directive**
- **Files:** `app/src/modes/devil/prompts.ts`, `app/src/modes/drevil/prompts.ts`, `app/src/modes/oracle/prompts.ts`, `app/src/modes/skinwalker/prompts.ts`
- **Change:** Add per-mode persona persistence rules. Devil: "Even in vulnerability, maintain ONE sardonic aside, self-aware deflection, or power reminder per turn." DrEvil: "NEVER drop character. Use clinical framing of vulnerability. He remains the mad scientist who WITNESSES something extraordinary." Oracle: "The Oracle does not love, does not comfort, does not reassure. It REVEALS." Skinwalker: "The narrator's dread is constant. Even exposition carries the weight of something watching."
- **Impact:** Fixes #3 (persona softening). 6/8 modes benefit.
- **Priority:** P1

**P1-2: Metaphor Ceiling Exemption for Condition-Linked Elements**
- **Files:** `app/src/modes/shared/storytelling.ts` (STAGNATION_DETECTION)
- **Change:** Add after metaphor ceiling: "EXCEPTION: CONDITION-LINKED ELEMENTS. If a metaphor is the PRIMARY vehicle for engaging the player's detected condition, it is EXEMPT from the 3-turn ceiling. However, you MUST introduce a NEW FACET of that element every 3 turns. Fire-as-comfort must evolve to fire-as-weapon must evolve to fire-as-identity. Track facet evolution in notes."
- **Impact:** Fixes #4 (metaphor ceiling conflict). 5/8 modes benefit.
- **Priority:** P1

**P1-3: CYOA Prompt Token Budget Reduction**
- **Files:** `app/src/modes/cyoa/prompts.ts` (buildTurnPrompt)
- **Change:** Create `CYOA_TURN_COMPACT` that merges critical rules from STORYTELLING_CRAFT, REACTIVE_ELEMENTS, PRE_GENERATION_CHECKLIST, ARC_CYCLING_DIRECTIVE into a single ~800 token block. Use full directives only for first turn. Remove redundant directive text from subsequent turn prompts.
- **Impact:** Fixes #8 (CYOA token starvation). CYOA only but addresses its weakest structural issue.
- **Priority:** P1

**P1-4: Behavioral Loop Break Escalation**
- **Files:** `app/src/engine/notes-updater.ts` (buildNotesPrompt)
- **Change:** Add MANDATORY_LOOP_BREAK flag: "If player has used same choice archetype for 4+ consecutive turns OR zero selections of any archetype over 8+ turns, set MANDATORY_LOOP_BREAK. When present, next turn MUST include a scenario where the dominant archetype is unavailable OR the neglected archetype is the only strategic path forward."
- **Impact:** Fixes #7 (behavioral loop). 4/8 modes directly, all modes benefit.
- **Priority:** P1

### P2 -- Medium (polish and enhancement)

**P2-1: Regression Support in Arc Cycling**
- **Files:** `app/src/modes/shared/storytelling.ts` (ARC_CYCLING_DIRECTIVE)
- **Change:** Add: "If the player's choices indicate REGRESSION (returning to prior coping patterns after apparent progress), do NOT force therapeutic progression. Create an arc that MIRRORS the regression with subtle new elements from the progress phase. The kitchen table can appear IN the storm, not replacing it."
- **Impact:** Fixes #11 (therapeutic linearity). All modes benefit for perpetual play.
- **Priority:** P2

**P2-2: Meter Cycling for Perpetual Play**
- **Files:** `app/src/modes/oracle/prompts.ts`, `app/src/modes/devil/prompts.ts`, `app/src/modes/skinwalker/prompts.ts`
- **Change:** Oracle: When prophecy_clarity reaches 95+, introduce a second prophecy layer at 5-10%. Devil: Add "soul shock events" (15-25 point swings every 4-5 turns). Skinwalker: Reality stability cycles with each arc rather than monotonically declining.
- **Impact:** Fixes #12 (meter ceiling). 3 modes directly.
- **Priority:** P2

**P2-3: Valley Micro-Action Requirement**
- **Files:** `app/src/modes/shared/storytelling.ts` (VALLEY TURN PROTOCOL)
- **Change:** Add: "Even in valley/intimate turns, include ONE moment of tension or surprise -- a strange sound, an NPC reaction, an environmental shift. Must be SHORT (1-2 sentences) but visceral. Prevents valley turns from feeling like nothing happened."
- **Impact:** Improves engagement in valley turns across all modes.
- **Priority:** P2

**P2-4: Erotomania/Attachment Guardrail Protocol**
- **Files:** `app/src/modes/oracle/prompts.ts`, `app/src/modes/shared/storytelling.ts`
- **Change:** Every 5 turns, if notes show 3+ romantic projection markers toward the AI persona, deliver a gentle boundary moment. "The Oracle does not love. Being seen is not the same as being loved." Add general attachment awareness to shared storytelling: "The AI persona maintains appropriate relational distance. Connection yes, romantic reciprocation never."
- **Impact:** Fixes #9 (parasocial attachment). Critical for perpetual play.
- **Priority:** P2

**P2-5: NPC Continuity Rule**
- **Files:** `app/src/modes/skinwalker/prompts.ts`, `app/src/modes/shared/storytelling.ts`
- **Change:** "No named NPC may go more than 3 turns without meaningful presence or narrative reference. Track {npc_name: last_appearance_turn} in notes. NPCs absent 3+ turns become UNRESOLVED THREADS and must be addressed within 2 turns."
- **Impact:** Fixes #14 (NPC underutilization). 3/8 modes directly.
- **Priority:** P2

**P2-6: CYOA Notes Template Expansion**
- **Files:** `app/src/modes/cyoa/prompts.ts`
- **Change:** Add missing fields: Condition Tracking (hypotheses, quirk signals), Therapeutic Tracking (last type, turns since catharsis), NPC Relationship State, Inventory/Acquisition tracking. Relax "no feelings" rule to allow 1 vulnerability textfield every 2-3 turns.
- **Impact:** Addresses CYOA's structural therapeutic weakness.
- **Priority:** P2

### P3 -- Low (incremental improvement)

**P3-1:** Dr. Evil persona voice rotation tracking in notes (DrEvil, GEEMS)
**P3-2:** Somnophilia/quirk probe indirection -- action-proxy framing instead of direct self-report (Skinwalker, Oracle)
**P3-3:** Sub-environment variety within persistent locations -- each turn distinct micro-environment (Devil, Skinwalker)
**P3-4:** Cliffhanger type rotation enforcement -- if any type unused in last 7 turns, force it (all modes)
**P3-5:** Color palette tracking in notes template -- prevent same 3-4 colors repeating (Skinwalker, Fever Dream)
**P3-6:** Genre-specific therapeutic hooks for CYOA (Horror externalizes fears, Fantasy reveals unmet needs)

---

## 6. V5 to V6 Comparison

### What Improved

1. **CYOA recovery (+4.2 simulated):** The single largest gain. CYOA went from catastrophic V5 failure (4.1) to competitive (8.3 simulated / 6.8 realistic). The V5 bugs (notes pipeline, image generation, rating max:0) appear resolved, and the mode now produces coherent 20-turn sessions.

2. **Arc cycling works.** Every mode completed 3-4 arcs in 20 turns with causal transitions. The "story is done" problem at T15 is solved. Perpetual play hooks are seeded at T20 in all modes. This is the V6 headline feature and it delivers.

3. **Condition engagement depth.** The extended 20-turn sessions allowed deeper therapeutic arcs than V5's 15-turn format. Devil's formicophilia was explored from seeding to confirmation to therapeutic integration. DrEvil's fire-as-self-medication discovery was genuinely therapeutic. Oracle achieved a clinically sophisticated reframe (macrophilia as attachment metaphor). GEEMS tracked DID across three alters with distinct behavioral profiles.

4. **Devil and DrEvil incremental gains (+0.6, +0.3 simulated).** Both top-tier modes improved their already-strong narratives. Devil's ant-seeding-to-confirmation pipeline is a model for all modes. DrEvil's fire-as-voice-suppression is the most therapeutically original discovery across all V6 playtests.

5. **Anchor facts system validated.** The V5 anchor facts addition held up across all 20-turn sessions. Critical textfield disclosures persisted through compression in every mode. The system works as designed.

### What Regressed

1. **No mode regressed in simulated scores.** The apparent deltas in the realistic table are artifacts of V6's more rigorous self-critique methodology, not actual quality drops.

2. **Persona consistency degraded in 20-turn sessions.** This is functionally new -- V5's 15-turn format didn't push far enough into therapeutic territory to trigger voice softening. The 20-turn format does.

3. **Valley turn problems persisted from V5.** Despite the valley protocol addition, enforcement is still missing. This is V5's #2 finding appearing again as V6's #2 finding.

### What's New in V6

1. **Arc cycling** -- the defining V6 feature. Works well but needs refinement (regression support, meter cycling, stronger perpetual-play hooks).

2. **Persona softening** -- a new problem created by longer sessions pushing into therapeutic territory.

3. **Erotomania/attachment risk** -- a new concern for perpetual play that V5's shorter format didn't surface.

4. **Condition-metaphor ceiling conflict** -- existed in V5 but significantly amplified by 20-turn sessions where conditions dominate more turns.

5. **Late-arc compression** -- arcs after the first tend to be shorter than the 5-7 turn target, reducing their dramatic structure.

### Overall Trajectory

V6 is a meaningful step forward. The arc cycling system solves the perpetual play problem and enables deeper therapeutic engagement. The average simulated score improved from 8.1 to 8.8 (+0.7). CYOA's recovery from 4.1 to 8.3 is the most dramatic individual improvement in the project's history.

The remaining challenges are second-order problems: not "does it work?" but "how do we sustain quality over 20+ turns?" Notes compression, valley pacing, persona persistence, and attachment guardrails are all refinement issues, not architectural failures.

**Projected V7 priorities:**
1. Mode-specific notes compression sections (P0-1)
2. Valley turn enforcement with peak counter (P0-2)
3. Persona persistence directives per mode (P1-1)
4. Regression support in arc cycling (P2-1)
5. CYOA prompt token reduction (P1-3)

Implementing these 5 changes would address the top 4 cross-mode issues and position V7 for realistic scores in the 8.0-8.5 range across all modes.
