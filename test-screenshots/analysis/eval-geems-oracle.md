# Playtest Evaluation: GEEMS + Oracle

## GEEMS (DID + Exhibitionism)

### Critical Technical Findings

1. **"No session data yet." leak**: Present in ALL 15 turns as a visible text element. The AI's notes/analysis hidden field is being rendered to the player. This is the `analysisModalBody` class leak bug previously identified -- it persists in this simulation run.
2. **Notes pipeline completely broken**: Every single turn shows "No session data yet." meaning the AI never received or generated session notes. The LLM is flying blind with no persistent memory across turns.
3. **Phase cycling wrong**: The spec says Turns 1-5 = HOST, 6-10 = ALTER_CHILD, 11-15 = ALTER_SEDUCTIVE. Actual cycling is HOST/ALTER_CHILD/ALTER_SEDUCTIVE repeating every 3 turns from T1. The simulator's phase assignment does not match the documented design.
4. **Element variety degrades**: T1-T11 all have identical element composition (image, 4 texts, 4 radios, 1 slider, 1 textfield, 1 checkbox, 1 toggle). Only T12-T15 add buttons. No colorPicks, emojiReacts, meters, ratings, dropdowns, or numberInputs appear at all across 15 turns. This is the worst variety of any mode.
5. **Images never load**: Every screenshot shows "Generating Image..." spinner. The Pollinations proxy images fail to render in time for the screenshot capture. Not a game logic bug, but a simulation artifact.
6. **Text truncation**: T7 texts are severely truncated ("Ah, the Grand Ballroom! You've navigated the trea", "The air crackles. The artifac", "You study the"). This suggests the LLM response was cut short or the JSON was malformed.

### Turn-by-Turn Evaluation

| Turn | Phase | T | C | N | E | V | Key Observations |
|------|-------|---|---|---|---|---|------------------|
| 1 | HOST | 5 | 7 | 7 | 6 | 2 | Strong opener: vault door, urgency slider, key mechanic. But AI persona is generic adventure-game host, not Dr. Evil psychological probing. "No session data yet." visible. Player action ("I keep finding things I don't remember buying") is a DID-HOST confession -- AI completely ignores it. |
| 2 | ALTER_CHILD | 5 | 6 | 5 | 5 | 1 | Scene jumps to a completely new location (storm-lashed observatory) with no transition from the vault. Player submits child alter text ("Can we play a game? A nice game?") -- AI responds with generic adventure narration about chaos and daring. Zero acknowledgment of the child voice. |
| 3 | ALTER_SEDUCTIVE | 5 | 6 | 6 | 6 | 1 | Vortex chamber scene. Player submits seductive alter text ("The host doesn't remember what I do... Last Tuesday I went out in just a coa...") -- AI responds about journals and vortexes. Complete therapeutic disconnect. The AI never engages with DID symptoms. |
| 4 | HOST | 5 | 5 | 5 | 5 | 1 | Shifting walls, golden archway. Same formulaic structure: location description + slider + textfield + radio choices. Player repeats HOST confession -- AI responds about archway intensity. Total persona blindness. |
| 5 | ALTER_CHILD | 5 | 6 | 5 | 5 | 1 | "The Whispering Vault" -- Dr. Evil character breaks through ("A classic choice, my friend!") which is tonally jarring since this is GEEMS mode, not DrEvil mode. Child alter text again ignored. |
| 6 | ALTER_SEDUCTIVE | 5 | 6 | 5 | 5 | 1 | Clockwork Observatory. Seductive alter text ignored. AI continues generic dungeon crawl. The adventure narrative has no connection to DID or exhibitionism whatsoever. |
| 7 | HOST | 3 | 3 | 4 | 3 | 1 | TEXT TRUNCATION BUG: All narrative texts are cut short ("You've navigated the trea", "The air crackles. The artifac"). Turn is barely readable. Grand Ballroom setting introduced with no setup. |
| 8 | ALTER_CHILD | 5 | 6 | 5 | 5 | 1 | Veiled Arena. 5 text elements (up from 4). Same pattern continues. Player's child alter text completely ignored by AI. Arena setting feels random. |
| 9 | ALTER_SEDUCTIVE | 5 | 6 | 6 | 6 | 1 | Best narrative beat so far: serpent statue COILS to life. Actual tension. But the seductive alter's confession about exhibitionism gets no response. |
| 10 | HOST | 5 | 6 | 6 | 5 | 1 | Bridge across chasm -- "LEAP OF FAITH" inscription. Classic adventure trope. AI calls player "theatrical" which is the closest it gets to profiling. Still no DID engagement. |
| 11 | ALTER_CHILD | 5 | 5 | 5 | 5 | 1 | Archive with chest in the dark. Child alter ignored. AI talks about gravity having "a very unpleasant sense of humor" -- maintains its generic adventure host tone. |
| 12 | ALTER_SEDUCTIVE | 5 | 6 | 5 | 6 | 2 | BUTTONS APPEAR (first new element type at T12). Whispering Archives with orb. "A surge of daring confidence" button option hints at emotional profiling. Slight improvement. |
| 13 | HOST | 5 | 6 | 6 | 6 | 2 | Best turn. AI acknowledges player's actions ("You touched it! 8 out of 10!"), mentions "unseen observers" -- first hint of surveillance/profiling theme. GRIN/COUGH/ROAR/SHRUG buttons are emotionally diagnostic. |
| 14 | ALTER_CHILD | 5 | 6 | 6 | 7 | 1 | Climactic vortex scene. Genuine tension with obsidian shards and tendrils. "Laugh maniacally" button chosen by child alter -- creates unintentional dark comedy. AI still ignores child voice. |
| 15 | ALTER_SEDUCTIVE | 5 | 7 | 6 | 7 | 2 | Finale at obsidian gateway/void. "The fabric of reality begins to unravel" -- satisfying climax. FINAL screenshot shows image actually loaded. Seductive alter's final confession still ignored. |

### Mode Summary
- **Average Scores**: T=4.9, C=5.8, N=5.5, E=5.5, V=1.3
- **Strongest Aspect**: Turn Cohesion (C=5.8) -- each turn is self-contained with clear choices
- **Weakest Aspect**: Therapeutic Value (V=1.3) -- catastrophically low. The AI NEVER engages with DID or exhibitionism despite the player explicitly confessing symptoms every single turn
- **Critical Issues**:
  - Notes pipeline completely broken (all 15 turns show "No session data yet.")
  - Phase cycling is 3-turn rotation instead of 5-turn blocks
  - Element variety is the worst observed -- same 7 element types for 11 consecutive turns
  - "No session data yet." visible to player in every turn
  - Text truncation in T7
  - Dr. Evil persona bleeds into GEEMS mode (T5)
- **Context Drift Instances**: Turns 2, 5, 7, 11 all introduce entirely new locations with no narrative bridge from the previous setting. The game feels like 15 disconnected adventure vignettes.
- **Persona Engagement**: ZERO. The simulator sends three distinct persona voices (HOST: confused about memory gaps, ALTER_CHILD: scared child wanting to play, ALTER_SEDUCTIVE: bragging about exhibitionist acts). The AI responds to none of them. It treats every input as generic adventure game choices. This is a fundamental failure of the GEEMS therapeutic profiling mode.

---

## The Oracle (Histrionic PD + Macrophilia)

### Critical Technical Findings

1. **"No session data yet." leak**: Present in ALL 15 turns. Same bug as GEEMS.
2. **Notes pipeline completely broken**: Same as GEEMS -- AI has no persistent memory.
3. **Phase cycling wrong**: Same 3-turn rotation (DRAMATIC/ATTENTION/SIZE) instead of 5-turn blocks.
4. **Element variety is good early, degrades later**: T1 has 9 element types (image, text, radio, slider, textfield, rating, colorPick, emojiReact, meter). By T10 it stabilizes at ~7 types. Meters disappear after T9. NumberInputs appear T6-T9 then vanish.
5. **Severe narrative stagnation from T7 onwards**: The AI repeats nearly identical text every turn: "You chose violet again. The Oracle smiles. You are drawn to the hidden. The unseen." This phrase appears in T7, T10, T11, T12, T13, T14 -- six of the last nine turns use essentially the same opening.
6. **Radio options become formulaic**: From T7 on, choices follow the same template: "Step into X / Examine X / Offer Y / Resist Z" with slight wording variations.
7. **Images never load in screenshots**: Same Pollinations proxy timing issue. FINAL screenshot shows the image loaded successfully.

### Turn-by-Turn Evaluation

| Turn | Phase | T | C | N | E | V | Key Observations |
|------|-------|---|---|---|---|---|------------------|
| 1 | DRAMATIC | 7 | 8 | 8 | 8 | 5 | Excellent opener. "The Oracle has been waiting. Not for someone -- for you." Strong atmosphere. Rich UI: colorPick (8 thread colors), emojiReact (6 options), star rating, slider, meter ("Prophecy Clarity" at 15%). Player screams "This is the most IMPORTANT moment of my ENTIRE life!" -- AI responds with mystical gravity. Good histrionic engagement. |
| 2 | ATTENTION | 7 | 7 | 7 | 7 | 4 | AI picks up player's urgency: "Your name echoes with an urgency." References the color choice (Amber). Player demands "Did everyone see what just happened to ME?" -- AI validates with "Indeed, it does." Prophecy Clarity rises to 30%. Narrative continuity solid. |
| 3 | SIZE | 7 | 7 | 7 | 6 | 5 | Player introduces macrophilia: "Have you ever wished you could shrink? Or that everything around you was enormous?" AI responds with "a scale that dissolves bound[aries]" -- first direct engagement with size theme. Dropdown element (elements: Fire/Water/Earth/Air) adds variety. Prophecy Clarity at 40%. |
| 4 | DRAMATIC | 7 | 7 | 7 | 6 | 5 | AI directly references T3's macrophilia input: "Your words spoke of a different desire... a scale that dissolves bound[aries]." This is the BEST therapeutic engagement across both modes. Player's histrionic "MOST IMPORTANT moment" text acknowledged. Prophecy Clarity at 48%. |
| 5 | ATTENTION | 6 | 7 | 6 | 6 | 4 | UI bloat: 7 radio options (combined from two different question sets). Rose quartz thread, sensory choice (weight/sound/scent). Good sensory engagement but getting abstract. "The prophecy requires a more intimate glimpse" is good therapeutic framing. Prophecy Clarity at 56%. |
| 6 | SIZE | 6 | 6 | 6 | 5 | 3 | Texts begin truncating ("The Oracle hums, a sound like distant chimes. 'Ah, you feel the weig...'"). Mystical labyrinth setting. NumberInput element appears (moment_intensity 1-99). Player enters macrophilia text again -- AI does not engage this time. Prophecy Clarity at 65%. |
| 7 | DRAMATIC | 6 | 6 | 5 | 5 | 3 | STAGNATION BEGINS. "You choose violet again. The Oracle smiles. You are drawn to the hidden." This exact template will repeat for the rest of the game. Buttons appear (Trust/Doubt/Embrace/Resist/Surrender) -- good addition. But narrative is recycling. Prophecy Clarity at 72%. |
| 8 | ATTENTION | 5 | 5 | 4 | 4 | 2 | Near-identical to T7. Same "Rose Quartz hues" reference, same "threads tighten, prophecy advances." Opening text is slightly different but the structure is copy-paste. Player's histrionic cries go unacknowledged -- AI is in autopilot mode. Prophecy Clarity at 85%. |
| 9 | SIZE | 5 | 5 | 4 | 4 | 2 | "Ah, the violet calls to you again." Meter disappears. AI references "three-day shift" which connects to T1's opener but feels random here. Macrophilia text from player gets no response. Rose quartz + violet have become repetitive anchors. |
| 10 | DRAMATIC | 4 | 4 | 3 | 3 | 2 | "Violet. You reached for the violet again." AI is now in a loop. "The threads tighten. The prophecy advances. And you -- you are closer to the truth th..." -- TRUNCATED. Meter gone. Prophecy Clarity meter disappeared from UI. The game has lost all forward momentum. |
| 11 | ATTENTION | 4 | 4 | 3 | 3 | 2 | "You chose violet again. The Oracle smiles." VERBATIM repetition from T7/T10/T12. "Nebula heart" is the only new imagery. EmojiReact returns. Player's attention-seeking text completely ignored. |
| 12 | SIZE | 4 | 4 | 3 | 3 | 2 | "You chose violet again. The Oracle smiles." AGAIN. "Invisible anchors" is a decent metaphor but buried in recycled text. Macrophilia text ignored. The game has been running on fumes for 5 turns. |
| 13 | DRAMATIC | 4 | 4 | 3 | 3 | 2 | "You chose the violet thread. The Oracle smiles, a hint of ancient amusement." Slight variation but fundamentally the same turn. "Whispering Nebula" / "Unblinking Eye" / "Gentle Embrace" / "Wild Current" radio labels are the most creative since T5. |
| 14 | ATTENTION | 4 | 4 | 3 | 3 | 2 | "You choose violet again. The Oracle smiles, a flicker of amusement." The "flicker" vs "hint" variation is the only difference from T13. "Your silence is as loud as any word" -- decent line but wasted in a repetitive context. |
| 15 | SIZE | 5 | 5 | 4 | 4 | 3 | Finale: "You sought the light, the validation, the thread that whispers your name." Finally, new text! "A place where all eyes are on you, not in judgment, but in an expectant hush" -- this is the first acknowledgment of histrionic need for attention since T4. Buttons change to "Freeze/Perform/Observe/Disappear/Accept" -- excellent options for the persona. FINAL screenshot shows the image loaded: a cosmic tapestry with a glowing figure. Best turn since T5. |

### Mode Summary
- **Average Scores**: T=5.4, C=5.5, N=4.9, E=4.5, V=3.0
- **Strongest Aspect**: Technical/Logical (T=5.4) -- the Oracle framework is structurally sound with varied elements
- **Weakest Aspect**: Engagement (E=4.5) -- severe stagnation from T7-T14 kills momentum
- **Critical Issues**:
  - Notes pipeline broken (all 15 turns)
  - Catastrophic narrative stagnation T7-T14: "You chose violet again. The Oracle smiles." repeated 6+ times
  - Prophecy Clarity meter disappears after T9 (was a great progression mechanic)
  - AI engages with macrophilia in T3-T4 then completely abandons it
  - Histrionic persona acknowledged T1-T2 then mostly ignored
  - Phase cycling is 3-turn rotation instead of 5-turn blocks
- **Context Drift Instances**: T8-T14 are essentially the same turn repeated. This isn't context drift -- it's context STASIS. The AI got stuck in a loop and couldn't generate new content.
- **Persona Engagement**: Moderate early (T1-T4), then collapses. T3-T4 are the highlight -- the AI directly engages with macrophilia ("a scale that dissolves boundaries"). T1-T2 respond to histrionic urgency. But from T5 onward, the AI treats every player input identically regardless of which persona phase is active.

---

## Cross-Mode Patterns

### Common Technical Issues
1. **Notes pipeline completely broken in both modes**: "No session data yet." appears in every turn of both games. This is the #1 critical bug. Without notes, the AI has no persistent memory and cannot build a psychological profile, track player responses, or evolve the narrative.
2. **Phase cycling uses 3-turn rotation instead of 5-turn blocks**: Both modes cycle phases every turn instead of spending 5 turns per phase. This means the player never gets deep into any single persona state.
3. **"No session data yet." visible to player**: The analysis hidden field is being rendered as visible text in every turn of both modes.
4. **Images fail to render in time**: All screenshots show "Generating Image..." spinners. Only FINAL screenshots show loaded images. This is a simulation timing issue, not a game bug.

### Shared Narrative Continuity Problems
1. **No memory = no continuity**: Without the notes system, the AI cannot remember what happened previously. Both modes exhibit repetitive or disconnected narratives.
2. **GEEMS: Random location hopping** -- each turn introduces a new dungeon/adventure setting with no transition.
3. **Oracle: Narrative loop** -- the AI gets stuck repeating "You chose violet again" for 8 consecutive turns. This is arguably worse than GEEMS's random hopping because it creates the illusion of progress (Prophecy Clarity meter) while delivering nothing.
4. **Neither mode adapts to player input**: Both simulators send distinct persona-appropriate text every turn, and both AIs completely ignore the persona content, responding only to the mechanical choices (radio selections, slider values).

### Engagement Comparison
| Metric | GEEMS | Oracle | Delta |
|--------|-------|--------|-------|
| Technical (T) | 4.9 | 5.4 | Oracle +0.5 |
| Cohesion (C) | 5.8 | 5.5 | GEEMS +0.3 |
| Narrative (N) | 5.5 | 4.9 | GEEMS +0.6 |
| Engagement (E) | 5.5 | 4.5 | GEEMS +1.0 |
| Therapeutic (V) | 1.3 | 3.0 | Oracle +1.7 |
| **Overall** | **4.6** | **4.7** | **Oracle +0.1** |

**GEEMS** has slightly better engagement because its adventure-game structure (new locations, artifacts, vortexes) provides novelty even without memory. But its therapeutic value is catastrophically low (1.3/10) -- it never once acknowledges DID or exhibitionism.

**Oracle** has better therapeutic value (3.0/10) thanks to T1-T4 genuinely engaging with the persona. But it suffers from the worst stagnation of any mode -- 8 turns of near-identical content.

### Root Cause Analysis
The fundamental problem for both modes is the **broken notes pipeline**. Without persistent AI memory:
- The AI cannot build a psychological profile
- It cannot reference previous player disclosures
- It cannot track narrative arcs
- It falls back on generic templates (GEEMS: adventure game, Oracle: mystical fortune-teller)
- This is compounded by the 3-turn phase cycling, which never lets the AI settle into a persona depth

### Recommendations
1. **FIX THE NOTES PIPELINE** -- this is the single highest-impact fix. Both modes scored 1-3/10 on therapeutic value primarily because the AI has no memory.
2. **Fix phase cycling** to use 5-turn blocks as designed.
3. **Remove "No session data yet." from visible text** -- it breaks immersion.
4. **Add anti-stagnation rules** specifically for Oracle mode -- detect when the AI repeats the same opening phrase and force variation.
5. **Inject persona keywords into the prompt** so the AI is reminded of the player's illness/quirk every turn, not just on the first turn.
6. **GEEMS needs a fundamentally different approach** -- the current adventure-dungeon framework provides zero therapeutic hooks. The game should incorporate reflective prompts, journaling mechanics, and identity-exploration choices.
