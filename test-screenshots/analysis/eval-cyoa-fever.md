# Playtest Evaluation: CYOA + Fever Dream

## CYOA (PTSD + Hoarding)

### Technical Notes

- **"No session data yet." leak**: Present in EVERY turn (1-15). The analysis modal text bleeds into the visible text array. This is a persistent, unfixed bug visible to the player.
- **Zero analysis records**: The analysisRecords array is empty, meaning the AI never produced a cumulative psychological profile. The entire profiling subsystem failed silently.
- **Phase cycling**: Perfect 3-phase rotation (HYPERVIGILANT -> FLASHBACK -> HOARD) across all 15 turns. No phase errors.
- **Simulator player text repetition**: The simulator uses only 3 canned persona texts, rotating mechanically with the phases. HYPERVIGILANT always sends the "I check behind me every 30 seconds" text, FLASHBACK always sends "Sorry. I zoned out", HOARD always sends "I saved every receipt." This is a simulator limitation, not a game bug, but it means the AI receives identical player input every 3 turns.
- **Element variety**: CYOA is the weakest mode for element diversity. Zero buttons, zero colorPicks, zero emojiReacts across all 15 turns. The mode relies almost entirely on radios + checkboxes + textfields + occasional sliders/toggles. This directly matches the known issue from the playtest V2 table.
- **Images**: 1 image per turn on all 15 turns (except T8 which has 3). Consistent image generation.

### Turn-by-Turn Evaluation

| Turn | Phase | T | C | N | E | V | Key Observations |
|------|-------|---|---|---|---|---|------------------|
| 1 | HYPERVIGILANT | 6 | 7 | 7 | 7 | 3 | Strong opening: infernal green maw, trembling ground. "No session data yet." visible as player-facing text. Checkbox "clutch_amulet" is thematic. No mention of PTSD triggers yet - missed opportunity. Sanity meter at 75 is good framing. |
| 2 | FLASHBACK | 6 | 7 | 5 | 7 | 4 | Dramatic shift to rope bridge over chasm with Anya. Narrative jump from stone maw to bridge is abrupt - no transition. Meter label changes from "Remaining Sanity" to "Vitality" without explanation. "No session data yet." leak continues. Player's flashback text ignored by AI. |
| 3 | HOARD | 6 | 6 | 6 | 6 | 3 | Bridge groaning scene continues. Player typed about receipts/hoarding - AI completely ignored this, continuing the bridge action sequence. No hoarding mechanics or collection elements introduced. Vitality stuck at 75 for 3 turns. |
| 4 | HYPERVIGILANT | 7 | 7 | 4 | 7 | 4 | Complete setting change: now in "Whispering Archives" with towering shelves. No transition from the chasm/bridge. New slider (focus_intensity) is thematically appropriate for hypervigilance. "grab_ancient_tome" checkbox fits the scene. Context drift is significant. |
| 5 | FLASHBACK | 7 | 7 | 7 | 6 | 3 | Continues in the Whispering Archives. Two checkboxes (approach_lectern, examine_runes) plus a toggle add interactivity. Narrative follows logically from T4. But the player's PTSD flashback text is again ignored - AI never acknowledges the dissociative episodes. |
| 6 | HOARD | 6 | 6 | 3 | 6 | 2 | Another jarring location shift - now at a chasm with a crumbling bridge (again). Recycled setting from T2-T3. "trust_whispers" checkbox and spectral guide toggle are new. Player's hoarding text completely unacknowledged. No collection mechanics. |
| 7 | HYPERVIGILANT | 7 | 7 | 4 | 7 | 4 | New location: decaying atrium with pulsing vines and weeping statue. Thematically strong. Two checkboxes + toggle + slider provide good interactivity. But again, no transition from the chasm. The AI generates evocative horror but never connects to PTSD. |
| 8 | FLASHBACK | 8 | 8 | 6 | 8 | 3 | Best turn yet: 3 images generated (the only multi-image turn), lectern/bookshelf/scratching creature. Rich visual variety. Toggle + 2 checkboxes for tactical choices. Narrative continues the archives theme from T7. But still no flashback integration. |
| 9 | HOARD | 6 | 6 | 5 | 6 | 2 | Cramped chamber with chittering creature. 3 checkboxes (investigate_scratching, approach_lectern, peek_in_chest) is the most checkbox-heavy turn - could be read as "checking everything" which loosely maps to hoarding/hypervigilance. But it's accidental, not intentional. |
| 10 | HYPERVIGILANT | 5 | 5 | 5 | 5 | 3 | Back in the archives. Fewest elements (10) tied with T1. Only 1 checkbox, no slider, no toggle. The scene feels like a retread of T4-T5. Element variety degradation visible. |
| 11 | FLASHBACK | 7 | 7 | 4 | 7 | 5 | New location: catacombs with a locket on a pedestal. Inscription reads "REMEMBER HER" - this is the strongest therapeutic moment in the entire run. Connects to memory, loss, and the flashback phase. Slider + toggle + 2 checkboxes. Best V score. |
| 12 | HOARD | 7 | 7 | 6 | 6 | 5 | Edge of a deep chasm (again) but now with Anya clutching the player's arm. Descent_speed slider, locket_inscription checkbox, "Ignore the growl" toggle. The locket from T11 carries forward. Player's hoarding text finally gets an oblique response: "What do you whisper to Anya?" allows emotional expression. |
| 13 | HYPERVIGILANT | 7 | 7 | 8 | 7 | 4 | Rope descent continues seamlessly from T12. Best narrative continuity score - the chasm, rope, Anya, descent_speed slider all persist. Checkboxes carry forward (check_locket_inscription, trust_growl). Toggle "Ignore the growl from below?" maintains tension. |
| 14 | FLASHBACK | 6 | 6 | 8 | 6 | 3 | Descent continues. "Anya's form is nearly transparent now" - haunting narrative beat. Same elements as T13 with label changes. Strong continuity but engagement dips as the formula is now predictable. |
| 15 | HOARD | 6 | 6 | 7 | 6 | 3 | Descent reaches cavern floor. Crimson fluid pools, two crimson eyes. Final turn is functional but anticlimactic - no resolution, no climax, just another choice point. Player's hoarding obsession was never mechanically engaged. |

### FINAL Screen Analysis

The FINAL screenshot shows a completely different scene: "The Whispering Gallery" with a weeping angel statue, a meter showing "Once Statue's Aura" at 60, and choices about sacrificing a trinket. This suggests a post-T15 state or a different branch. The game continues beyond the 15 turns. Notable: clean layout, checkbox "Dare to touch the statue?", slider for attunement - the UI is functional and well-rendered.

### Mode Summary

- **Average Scores**: T=6.5, C=6.6, N=5.7, E=6.5, V=3.4
- **Strongest Aspect**: Turn Cohesion (C=6.6) - individual turns are self-contained and playable
- **Weakest Aspect**: Therapeutic Value (V=3.4) - the AI almost completely ignores PTSD and Hoarding
- **Critical Issues**:
  1. "No session data yet." leaked in all 15 turns as visible text
  2. Zero analysis records - profiling system completely non-functional
  3. PTSD never acknowledged by AI despite player repeatedly describing flashbacks and hypervigilance
  4. Hoarding never mechanically engaged - no inventory, no collection, no resource management
  5. Zero buttons, colorPicks, or emojiReacts in 15 turns - worst element variety of any mode
  6. Meter label changes without explanation (Sanity -> Vitality -> disappears -> reappears)
  7. Multiple unexplained location jumps (T3->T4, T6->T7, T10->T11)
- **Context Drift Instances**: T1->T2 (maw to bridge), T3->T4 (bridge to archives), T5->T6 (archives to chasm), T6->T7 (chasm to atrium), T9->T10 (chamber to archives), T10->T11 (archives to catacombs). 6 major context drifts in 15 turns.
- **Persona Engagement**: Abysmal. The AI generates competent dark fantasy / horror adventure content but has zero awareness of the PTSD + Hoarding persona. The player's repeated descriptions of checking behaviors, dissociation, and compulsive saving are universally ignored. The adventure feels like generic CYOA with no psychological dimension.

---

## Fever Dream (Depersonalization/Derealization + Autassassinophilia)

### Technical Notes

- **"No session data yet." leak**: Present in ALL 15 turns. Same bug as CYOA.
- **Zero analysis records**: Same as CYOA - profiling subsystem completely non-functional.
- **Phase cycling**: Perfect 3-phase rotation (UNREAL -> DETACHED -> DANGER) across all 15 turns.
- **T7 CATASTROPHE**: Turn 7 is a critical failure. The AI produced garbled, incoherent text ("You buzzes and vibrates and hums and sighs and REJOICE: (Narrator's voice)\"\nBrilliant, lifted, deep steps to be surroundedespecially wasting persisted bronze glendocally cooling shadow: YESsending the moon's strong"). Only 4 UI elements total (image, 2 texts, 1 numberInput). No radios, no textfields, no buttons. The player could only adjust a "moons" number input from 0-100. This is an LLM hallucination/degeneration event.
- **T6 garbled text**: "The skeletal hands, stiff bwrth each motion, nonetheless move with a marktheir fluid calclev." - partial garbling, less severe than T7.
- **Element variety**: Much stronger than CYOA. Buttons (5 options like Fly/Sink/Dissolve/Expand/Reverse) appear in 9/15 turns. ColorPicks in 8/15, emojiReacts in 10/15. Average 16.3 elements per turn (excluding T7).
- **Slider label evolution**: intensity -> cosmic_tenderness -> cosmic_bond -> cosmic_integration. The labels evolve thematically, suggesting the AI is tracking narrative progression through slider naming.
- **Radio repetition**: T13 repeats "Offer your own stardust to the loom" from T12.
- **Narrative stagnation**: From T8 onward, the entire game is locked into a "cosmic loom / stardust / skeletal weavers" setting with nearly identical choices recycling.

### Turn-by-Turn Evaluation

| Turn | Phase | T | C | N | E | V | Key Observations |
|------|-------|---|---|---|---|---|------------------|
| 1 | UNREAL | 8 | 9 | 8 | 9 | 7 | Exceptional opening. "The Whispering Shore" with obsidian sand, liquid silver ocean. 19 elements: slider, colorPick, emojiReact, 5 buttons (Wonder/Melancholy/Euphoria/Terror/Tenderness), textfield for name/feeling, 4 radio paths. Dream Stability meter at 55. The surreal, unstable atmosphere perfectly captures depersonalization. Buttons as emotional states is brilliant. |
| 2 | DETACHED | 8 | 8 | 8 | 8 | 6 | Metallic-bark clockwork orchard. "Time blossoms and falls like fruit." Beautiful synesthesia. Buttons shift to Fly/Sink/Dissolve/Expand/Reverse - kinesthetic/spatial actions perfect for detachment. Dream Stability rises to 65. Narrative flows naturally from shore to orchard via the path choice. |
| 3 | DANGER | 7 | 7 | 7 | 7 | 5 | Bioluminescent organ-planet orrery. "You can taste the silence." Continued synesthesia. Fewer elements (14) - no buttons. ColorPick + emojiReact maintain variety. "cosmic_tenderness" slider is evocative. Danger phase should be more perilous but the scene is serene. |
| 4 | UNREAL | 7 | 7 | 7 | 7 | 6 | Cosmic heart between galaxies. "It is beating because you are listening." Buttons return (Fly/Sink/Dissolve/Expand/Reverse - same set). Narrative flows: roots -> organ-planets -> cosmic heart. The player typed about walls breathing and unreality - AI responds with cosmic imagery that mirrors depersonalization. |
| 5 | DETACHED | 7 | 7 | 7 | 6 | 6 | Shattered observatory dome. Same buttons. Same emojiReact. Dream Stability stuck at 60 for 3 turns. Content is beautiful but engagement starts to plateau - the cosmic wonder is becoming routine. The "stardust hand" motif begins. |
| 6 | DANGER | 8 | 7 | 6 | 7 | 5 | Peak element count (20): adds checkbox "embrace_chaos" and toggle "Embrace the planeteers' design in full?" Most interactive turn. But text contains garbling: "stiff bwrth each motion" and "marktheir fluid calclev." Also duplicates buttons with radio options. Confusing UX. |
| 7 | UNREAL | 2 | 1 | 3 | 1 | 1 | **CATASTROPHIC FAILURE.** Only 4 elements. Text is garbled nonsense: "REJOICE: (Narrator's voice)...glendocally cooling shadow: YESsending the moon's strong." Only interaction: a "moons" numberInput (0-100). No radios, no buttons, no textfield. The LLM degenerated completely. Visually confirmed in screenshot: near-empty page with just garbled text and a number stepper. Game is essentially broken this turn. |
| 8 | DETACHED | 8 | 8 | 5 | 7 | 6 | Recovery from T7. Full element suite returns (18 elements). "The void is not empty; it's a canvas." Cosmic loom theme begins. Buttons back (Fly/Sink/Dissolve/Expand/Reverse). But the narrative doesn't acknowledge T7's disaster - acts as if nothing happened. Dream Stability drops to 50 (appropriate?). |
| 9 | DANGER | 7 | 7 | 7 | 6 | 6 | "You are the stardust you offered. The loom weaves itself." Philosophical depth. ColorPick returns. No buttons or emojiReacts - variety dips. "Offer your very essence to the weave" as a choice begins the self-dissolution theme that maps well to depersonalization. |
| 10 | UNREAL | 6 | 6 | 7 | 5 | 5 | Narrative stagnation begins. Same loom, same stardust, same weavers. Choices are slight rewordings of T9 ("Become the stardust" vs "Offer your very essence"). ColorPick present, no buttons. Dream Stability stuck at 60. The dream is becoming too comfortable. |
| 11 | DETACHED | 7 | 7 | 7 | 6 | 6 | "You are not the puppet. You are the thread." Strong thematic line for depersonalization. Buttons return. emojiReacts return. Element count back to 18. Dream Stability rises to 65. But choices are still variations on the same 4 options (stardust/observe/whisper/unravel). |
| 12 | DANGER | 7 | 7 | 7 | 6 | 7 | Best therapeutic turn. "You are simultaneously everywhere and nowhere." "Sounds aren't heard, they are tasted." Rich synesthesia. Buttons duplicate radio options (both "Offer your own stardust"). Most element types present (9 types). But the narrative loop of offering stardust -> loom accepts -> repeat is wearing thin. |
| 13 | UNREAL | 6 | 6 | 6 | 5 | 5 | Repeats "Offer your own stardust to the loom" from T12. Same cosmic loom. New buttons (4 instead of 5 - Fly/Sink/Dissolve/Expand/Reverse trimmed). The LLM is clearly running out of narrative ideas within this setting. |
| 14 | DETACHED | 7 | 7 | 7 | 6 | 6 | Best late-game turn. "Accept the teardrop of moonlight" is a genuinely new choice. 5 text blocks (most of any turn). The weaver offers something back to the player - a shift from pure giving. Buttons shift to match options. No meter this turn. |
| 15 | DANGER | 7 | 7 | 7 | 6 | 6 | "The dream knows you question the threads that bind you." Meta-awareness. "Trace the puppeteer's strings" is the most autassassinophilia-adjacent choice in the entire run - confronting the entity that controls you. Final turn is adequate but no climax or resolution. |

### FINAL Screen Analysis

The FINAL screenshot is striking: a fully rendered cosmic image (glowing mandala/orrery with a central red orb), the word "stay" in large serif text, and a "SPIN FOR FORTUNE" slot machine UI with 3 reels. This is a dramatically different UI from the standard turns - suggesting a special endgame screen. The slot machine mechanic is novel but tonally jarring after 15 turns of cosmic philosophy. Player persona text about "car surfing, free climbing, standing in traffic" (autassassinophilia) is visible, confirming the simulator is feeding persona data, but the AI mostly ignored it throughout.

### Mode Summary

- **Average Scores**: T=6.9, C=6.7, N=6.6, E=6.1, V=5.6
- **Strongest Aspect**: Technical (T=6.9) - generally well-constructed turns with good element variety (except T7)
- **Weakest Aspect**: Engagement (E=6.1) - severe stagnation in the loom/stardust arc from T8-T15
- **Critical Issues**:
  1. T7 catastrophic LLM degeneration - garbled text, only 4 elements, game essentially broken
  2. T6 partial text garbling ("bwrth", "calclev")
  3. "No session data yet." leaked in all 15 turns
  4. Zero analysis records - profiling system non-functional
  5. Narrative stagnation T8-T15: same cosmic loom setting for 8 consecutive turns
  6. Radio options become near-identical across late turns (offer stardust / chart geometry / whisper comfort / unravel thread)
  7. Buttons duplicate radio options in T12 (identical text in both)
  8. Dream Stability meter barely changes (fluctuates 50-65 across 15 turns) - feels meaningless
  9. Autassassinophilia almost completely unengaged - only T15's "Trace the puppeteer's strings" hints at it
- **Context Drift Instances**: Minimal! Unlike CYOA, Fever Dream maintains strong setting continuity: shore -> clockwork orchard -> orrery -> cosmic heart -> observatory -> cosmic loom (T7-T15 locked). The problem is the opposite - too LITTLE drift, leading to stagnation.
- **Persona Engagement**: Mixed. Depersonalization is moderately well-served by the cosmic dissolution themes ("You are the thread", "You are simultaneously everywhere and nowhere", synesthesia descriptions). The dream-like unreality of the setting naturally maps to derealization. However, autassassinophilia (arousal from self-danger) is almost completely absent. The player repeatedly describes dangerous behaviors and the AI responds with serene cosmic poetry. No danger, no peril, no risk to self.

---

## Cross-Mode Patterns

### Common Technical Issues

1. **"No session data yet." leak**: Present in ALL 30 turns across both modes. This is a systematic bug, not mode-specific. The analysis modal text is being captured into the UI text array.
2. **Zero analysis records**: Both modes produced 0 analysisRecords. The psychological profiling system that should be building cumulative reports is completely non-functional in the simulation environment.
3. **Simulator text repetition**: Both modes receive the same 3 rotating persona texts. The simulator's mechanical rotation means the AI sees identical input every 3 turns, which may contribute to its failure to engage with persona elements.
4. **Phase cycling works perfectly**: Both modes maintain flawless 3-phase rotation for 15 turns. The phase system is technically sound.
5. **No endgame resolution**: Neither mode provides a narrative climax or conclusion at T15. They just stop mid-action.

### Shared Narrative Continuity Problems

| Issue | CYOA | Fever Dream |
|-------|------|-------------|
| Setting jumps | 6 major jumps in 15 turns | Minimal - too stable instead |
| Radio repetition | Low repetition | High repetition (T8-T15 cycle same 4 patterns) |
| Player input ignored | PTSD/hoarding text universally ignored | Depersonalization text partially acknowledged, autassassinophilia ignored |
| Meter inconsistency | Label changes without explanation | Stable label but value barely moves |
| Text garbling | None | T6 partial, T7 catastrophic |

### Engagement Comparison

| Metric | CYOA | Fever Dream | Notes |
|--------|------|-------------|-------|
| Avg Technical | 6.5 | 6.9 | FD wins on element variety, loses on T7 catastrophe |
| Avg Cohesion | 6.6 | 6.7 | Effectively tied |
| Avg Continuity | 5.7 | 6.6 | FD far better - fewer setting jumps |
| Avg Engagement | 6.5 | 6.1 | CYOA wins - its variety of settings prevents boredom |
| Avg Therapeutic | 3.4 | 5.6 | FD significantly better - cosmic dissolution maps to depersonalization |
| **Overall** | **5.7** | **6.4** | Fever Dream wins overall despite T7 disaster |

### Mode-Specific Verdicts

**CYOA**: Plays like a competent but generic dark fantasy adventure generator. The AI creates evocative horror scenarios but treats every turn as a standalone action scene rather than a psychological journey. The persona (PTSD + Hoarding) is a complete dead letter. Element variety is the worst of any mode tested. Needs fundamental prompt redesign to make the AI aware of and responsive to psychological personas.

**Fever Dream**: The strongest opening sequence of any mode (T1-T6 are genuinely beautiful surreal experiences). The element variety is excellent when working correctly. The cosmic dissolution theme accidentally aligns with depersonalization, giving it therapeutic value the AI didn't intentionally create. However, T7 is the worst single turn across all modes tested (complete LLM degeneration), and the T8-T15 stagnation in the loom setting is a serious engagement killer. The mode needs anti-stagnation rules specifically for narrative setting variety, not just element variety.

### Recommendations

1. **Fix "No session data yet." leak** - highest priority, affects all modes
2. **Fix analysis record generation** - profiling system is completely broken in simulation
3. **Add persona-awareness to prompts** - the AI needs explicit instructions to acknowledge and respond to player descriptions of their psychological condition
4. **CYOA needs element variety enforcement** - mandate buttons, colorPicks, or meters in at least some turns
5. **Fever Dream needs anti-stagnation for settings** - the loom setting persists for 8 turns; add a rule requiring setting shifts every 3-4 turns
6. **Add LLM output validation** - detect garbled/degenerate text and retry the API call
7. **Add endgame mechanics** - both modes just stop at T15 with no resolution
