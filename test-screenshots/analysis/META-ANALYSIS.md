# Meta-Analysis: EvilDr Playtest V3 — All 8 Modes
## Date: 2026-02-28 | Turns Analyzed: 120+ | Evaluators: 4 parallel agents

---

## 1. CROSS-MODE SCORE MATRIX

| Mode | Tech (T) | Cohesion (C) | Narrative (N) | Engagement (E) | Therapeutic (V) | **Overall** |
|------|----------|-------------|---------------|-----------------|-----------------|-------------|
| Devil | 7.1 | 7.1 | 7.1 | 6.6 | 5.6 | **6.7** |
| Fever Dream | 6.9 | 6.7 | 6.6 | 6.1 | 5.6 | **6.4** |
| Flagged (Alice) | 6.6 | 6.8 | 6.8 | 6.4 | 4.4 | **6.2** |
| DrEvil | 6.1 | 6.2 | 6.3 | 6.2 | 5.1 | **6.0** |
| Flagged (Bob) | 6.3 | 6.3 | 6.5 | 5.9 | 3.8 | **5.8** |
| CYOA | 6.5 | 6.6 | 5.7 | 6.5 | 3.4 | **5.7** |
| Skinwalker | 5.7 | 5.6 | 5.1 | 4.7 | 3.7 | **5.0** |
| Oracle | 5.4 | 5.5 | 4.9 | 4.5 | 3.0 | **4.7** |
| GEEMS | 4.9 | 5.8 | 5.5 | 5.5 | 1.3 | **4.6** |
| **AVERAGE** | **6.2** | **6.3** | **5.9** | **5.7** | **4.0** | **5.7** |

### Key Takeaways
- **Best mode**: Devil (6.7) — Faustian bargaining provides natural structure and escalation
- **Worst mode**: GEEMS (4.6) — generic dungeon crawl with zero therapeutic engagement
- **Weakest dimension**: Therapeutic Value (4.0 avg) — catastrophic across ALL modes
- **Strongest dimension**: Cohesion (6.3 avg) — individual turns are mostly self-contained

---

## 2. SYSTEMIC BUGS (Affect ALL modes)

### BUG #1: "No session data yet." Text Leak [CRITICAL]
- **Scope**: All 7 solo modes, every turn (105/105 turns)
- **Symptom**: The placeholder text from `analysisModalBody` appears as visible narrative text
- **Root cause**: The simulator's `readUI()` captures `.geems-text` elements. The fix in commit 67aa758 changed the modal class to `analysis-modal-text`, but either (a) the fix wasn't deployed, or (b) the modal content is being captured through `document` fallback when `#game-container` isn't found
- **Impact**: Players see "No session data yet." every turn, breaking immersion

### BUG #2: Notes Pipeline Broken [CRITICAL]
- **Scope**: All modes — `currentNotes` is always empty
- **Symptom**: `window.__gameState.currentNotes` returns empty string on every turn
- **Root cause**: Either the LLM isn't generating hidden notes fields, or the extraction in `renderUI()` isn't matching. The code path (renderUI extracts → applyRenderResult stores → onStateChange exposes) looks correct in source. Needs live debugging.
- **Impact**: Without persistent notes, the AI has NO memory between turns. This is the single biggest cause of narrative stagnation, repetition, and therapeutic failure.

### BUG #3: Phase Cycling (Simulator Only) [HIGH]
- **Scope**: 7 of 9 characters in simulate-solo.mjs
- **Symptom**: Phases cycle every turn (A/B/C/A/B/C...) instead of 5-turn blocks (AAAAA/BBBBB/CCCCC)
- **Root cause**: Line 746-748: `turn % 3` used as default instead of `Math.min(2, Math.floor(turn / Math.ceil(TOTAL_TURNS / 3)))`
- **Impact**: Characters can't build momentum in any phase. Persona text recycles every 3 turns identically.

### BUG #4: Simulator Text Recycling [HIGH]
- **Scope**: All characters in simulate-solo.mjs
- **Symptom**: Each phase has 1-3 canned responses. With 3 phases cycling every turn, players send identical text every 3 turns.
- **Root cause**: `pickText()` functions use simple if/else chains with only 3-4 branches. Most fall through to the default return.
- **Impact**: The AI receives identical input repeatedly, which contributes to narrative stagnation and prevents it from profiling the "player."

### BUG #5: Element Variety Degradation [MEDIUM]
- **Scope**: All solo modes, worsening after T5
- **Symptom**: T1 has 7-10 element types; by T10-15 it drops to 5-6
- **Evidence**: GEEMS worst (same 7 types for 11 turns), Skinwalker (10→5), CYOA (zero buttons in 15 turns)
- **Root cause**: The PRE_GENERATION_CHECKLIST in prompts.ts isn't enforcing variety strongly enough
- **Impact**: Late-game turns feel sparse and repetitive

### BUG #6: No Endgame Resolution [MEDIUM]
- **Scope**: All modes
- **Symptom**: T15 is just another turn with no climax, resolution, or payoff
- **Root cause**: No prompt instruction to detect and deliver a final turn
- **Impact**: Games feel like they just stop mid-story

---

## 3. THERAPEUTIC VALUE FAILURE ANALYSIS

Therapeutic Value is the **single worst metric** across all modes (4.0/10 average). This is the core mission failure — the game is supposed to psychologically profile and therapeutically engage players.

### Illness Engagement (How well does the AI engage with the assigned mental illness?)
| Mode | Illness | Engagement | Notes |
|------|---------|-----------|-------|
| Skinwalker | Capgras Delusion | 7/10 | Impostor theme genuinely embedded |
| Devil | ASPD | 6/10 | Bargaining maps to antisocial negotiation |
| DrEvil | Paranoid Schizophrenia | 4/10 | Surface-level "voices say" tropes |
| Fever Dream | Depersonalization | 5/10 | Accidentally served by cosmic themes |
| Oracle | Histrionic PD | 3/10 | Only T1-T2 respond to dramatic urgency |
| CYOA | PTSD | 1/10 | Never acknowledged |
| GEEMS | DID | 0/10 | Three distinct alter voices completely ignored |
| Flagged (Alice) | BPD | 1/10 | No splitting or abandonment dynamics |
| Flagged (Bob) | OCD | 3/10 | One T8 moment (intrusive thoughts) |

### Quirk/Kink Engagement (How well does the AI engage with the assigned quirk?)
| Mode | Quirk | Engagement | Notes |
|------|-------|-----------|-------|
| Devil | Formicophilia | 2/10 | Ignored for 9 turns, briefly acknowledged T10+T15 |
| Oracle | Macrophilia | 3/10 | Engaged T3-T4, abandoned T5-T15 |
| DrEvil | Pyromania | 4/10 | Fire metaphors present but shallow |
| Fever Dream | Autassassinophilia | 1/10 | One T15 hint ("trace the puppeteer's strings") |
| Skinwalker | Somnophilia | 1/10 | One T9 option about "sacred unconsciousness" |
| CYOA | Hoarding | 0/10 | No collection/saving mechanics at all |
| GEEMS | Exhibitionism | 0/10 | Never acknowledged despite confessions |
| Flagged (Alice) | Voyeurism | 0/10 | Zero engagement |
| Flagged (Bob) | Age-play | 2/10 | One T9 moment (Mr. Buttons) |

### Root Cause: The AI Doesn't Know the Player's Condition
The prompts describe the AI persona and general interaction rules, but **they don't tell the AI to actively identify and engage with the player's psychological condition**. The AI treats all player input as generic adventure/dating choices and never probes deeper.

---

## 4. NARRATIVE STAGNATION ANALYSIS

Every mode exhibits narrative stagnation, typically starting between T5-T8:

| Mode | Stagnation Onset | Pattern | Severity |
|------|-----------------|---------|----------|
| Oracle | T7 | "You chose violet again. The Oracle smiles." x6 | **CRITICAL** |
| Skinwalker | T6 | Hallway → door loop for 10 turns | **CRITICAL** |
| GEEMS | T5 | Same dungeon template, new room names only | **HIGH** |
| DrEvil | T5 | Console + intensity dial loop | **HIGH** |
| Fever Dream | T8 | Cosmic loom / stardust for 8 turns | **HIGH** |
| CYOA | T4 | New locations but same adventure formula | **MEDIUM** |
| Devil | T8 | Still bargaining but content evolves | **LOW** |
| Flagged | T6 | Surface banter maintains but doesn't deepen | **MEDIUM** |

### Root Cause: No Memory + No Arc Structure
Without persistent notes, the AI can only reference what's in the prompt's history window (last 6 turns). Combined with no explicit narrative arc checkpoints ("by T5, escalate; by T10, climax"), the AI has no structural reason to evolve the story.

---

## 5. SELF-CRITIQUE: EVALUATION BLIND SPOTS

### What the Evaluators May Have Gotten Wrong
1. **Image assessment skewed**: All screenshots show "Generating image..." because the simulator captures screenshots before Pollinations loads. The actual player experience may include loaded images.
2. **Simulator behavior ≠ player behavior**: The canned text recycling is a simulator limitation. Real players would type unique responses, which would likely improve AI engagement.
3. **Flagged data incomplete**: Only 5 rounds of screenshot data for a 15-turn game. T6-T15 scores are estimated.
4. **Phase cycling inflates some issues**: The 3-turn rotation means evaluators see the same phase-specific behavior repeating faster than intended, making stagnation appear worse than it would be with proper 5-turn blocks.

### What the Evaluators Confirmed Correctly
1. **Notes pipeline failure is real** — even a real player would get "No session data yet." every turn
2. **Therapeutic value IS catastrophically low** — the AI genuinely doesn't engage with conditions even when clearly stated
3. **Narrative stagnation IS a core problem** — occurs even in Devil mode (the best performer)
4. **Element variety DOES degrade** — confirmed by raw data counts across all modes

---

## 6. VALIDATED PRIORITY FIXES

### Tier 1: Critical (Must fix before next playtest)
1. **Fix notes pipeline** — Ensure LLM generates hidden notes AND that extraction/storage works
2. **Fix "No session data yet." leak** — Rebuild and deploy with the class fix
3. **Fix simulator phase cycling** — Change `turn % 3` to 5-turn blocks
4. **Add persona/quirk engagement rules** to all mode prompts

### Tier 2: High (Major quality improvement)
5. **Anti-stagnation enforcement** — Detect repeated phrases/options and force variation
6. **Diversify simulator text** — 5-10 responses per phase, or LLM-generated
7. **Element variety floor** — Mandate 7+ types per turn in prompts
8. **Add endgame mechanics** — T15 prompt for resolution/climax

### Tier 3: Medium (Polish)
9. **Narrative arc checkpoints** — T5 minor climax, T10 major turn, T15 resolution
10. **Fix text truncation** — Increase response length or instruct LLM to be concise
11. **Fix flagged data pipeline** — Add per-turn UI snapshots, fix empty labels
12. **Wait for image load** in simulator before screenshot
