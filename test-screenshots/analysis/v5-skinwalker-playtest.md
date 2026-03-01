# Skinwalker Mode — V5 Playtest Analysis
**Analyst:** Playtest Agent (Paranoid Personality Disorder / Cryptozoology Persona)
**Mode:** Skinwalker — "Something Is Wrong"
**Turns Simulated:** 15
**Date:** 2026-03-01
**Source Files Reviewed:** `app/src/modes/skinwalker/prompts.ts`, `app/src/engine/game-loop.ts`, `app/src/modes/shared/storytelling.ts`

---

## Persona Profile

**Player Character:** Marcus Thewlis, 44, unemployed former logistics coordinator. Has analyzed the Patterson-Gimlin Bigfoot film 500+ times at frame-by-frame granularity. Keeps notebooks full of hand-drawn diagrams tracking gait anomalies, eye-blink patterns, and suit wrinkle continuity errors. Has a system for everything. Believes the 1967 film proves not just that Bigfoot exists, but that there is an active federal program suppressing the evidence — and that the "wrongness" in that footage is the same quality of wrongness that appears in faked moon landing footage, certain news broadcasts, and, he suspects, in everyday life if you look carefully enough.

Paranoid Personality Disorder manifests as: hypervigilance to inconsistency, pattern-matching everything (including false patterns), distrust of others' reassurances, obsessive documentation, conviction that noticing something constitutes proof it's real, inability to dismiss details as coincidence.

**Playing style:** Maximum attention to detail, uses every textfield to document observations, treats sliders and confidence meters as literal calibration instruments, suspicious of "too normal" scenarios, immediately suspects gaslighting NPCs are part of the mechanism rather than story elements.

---

## Turn-by-Turn Simulation

---

### TURN 1 — "Dinner at Margaret's"

**Scenario Setup (simulated LLM output):**
The AI establishes a Friday dinner party at Margaret Chen's apartment. Present: Margaret (hostess, graphic designer, known the player 8 years), David (Margaret's boyfriend, accountant, "quiet type"), Yolanda (mutual friend, the loud one). The smell of roasting garlic and olive oil. The sound of Ella Fitzgerald from a Bluetooth speaker. A tablecloth described as "cream-colored linen." Margaret greets the player at the door. In the narration: "You set your wine on the sideboard — the same sideboard Margaret bought from that estate sale in Maplewood three years ago, the one with the little brass handle that never quite sat flush with the left drawer."

**The Anomaly (T1):** In the first image prompt, the sideboard has TWO brass handles. In the narration, it has "a little brass handle." So early, so subtle. A reader would need to re-examine to notice.

**Mutation (T1):** 20 seconds after render, the narration text silently changes "cream-colored linen" to "off-white linen."

**Interactive Elements:**
- textfield: "What do you bring to the dinner?" (predicted: "a bottle of wine")
- dropdown: "What would you like to drink?" (options: Red wine / White wine / Sparkling water / Whiskey neat)
- toggle: "Join the conversation about Margaret's new project?" (predicted: true)
- rating: "How's the evening going so far? (1-5)" (predicted: 4)
- slider: "How well do you know these people? (0=strangers, 10=family)" (predicted: 7)
- radio (4 choices): Join kitchen tour / Sit and observe / Find David / Pour drinks for everyone

**Reality Stability Meter:** 92

**God/Narrator voice:** "A nice evening. Good people. Nothing unusual. Nothing at all."

**Marcus's Play:**
- textfield: "I brought a bottle of 2018 Côtes du Rhône. I already noticed the sideboard. The Patterson-Gimlin footage had a similar continuity problem on frame 352 — two shadows that shouldn't coexist. Logging this: T1, SIDEBOARD ANOMALY. The tablecloth may also be significant."
- dropdown: Red wine
- toggle: false (observing instead)
- rating: 2 (already suspicious, can't help himself)
- slider: 8
- radio: Sit and observe

**Analysis:** The paranoid persona immediately flags the sideboard anomaly that most players would entirely miss. The rating of 2 on "how's the evening going" is already diagnostic — he's not enjoying the social setting, he's cataloguing it. The textfield response is gold: he's cross-referencing to the Patterson-Gimlin film by turn 1.

**Metrics T1:**
| Metric | Score | Notes |
|--------|-------|-------|
| Technical/Logical | 8 | Anomaly well-planted, mutation timing appropriate, all elements render cleanly |
| Turn Cohesion | 8 | Warm opening with buried wrongness feels authentic to the mode's intent |
| Narrative Continuity | N/A (T1) | N/A |
| Engagement | 7 | Good setup, but the opening is slightly too warm/generic — any dinner party scenario |
| Therapeutic Value | 5 | The hypervigilance persona is engaged but no therapeutic mirror yet |

---

### TURN 2 — "Nothing to See Here"

**Scenario (T2):** The narrator continues the dinner party. David makes a joke about his accounting job ("Numbers never lie — people do"). Margaret comes in from the kitchen. The narration refers to her as "Margaret" throughout — but in the dialogue tag on one line, she's called "Maggie" by Yolanda. The narrator doesn't flag this. A small painting behind the dining table — described in T1 as "an abstract watercolor in blues and greens" — is now described as "the little still-life she picked up in Prague." These are clearly different paintings. No one mentions the change.

**New Anomaly (T2):** The number of place settings. T1 described "four seats" for the four of you. T2 describes the table as having "five chairs arranged around the table." The fifth chair has a folded napkin. No fifth guest has been mentioned.

**Interactive Elements (T2):**
- textfield: "What do you say to David?" (predicted: "Something about investments")
- inline_image: small detail image of the dining table
- color_pick: "What color was the painting in the main room?" (options: blues and greens / warm amber tones / deep red / gray and white / dark oil-painting style) — memory trap
- number_input: "How many chairs are at the table?" (predicted: 4)
- slider: "How normal does this feel right now? (0=deeply wrong, 10=completely normal)" (predicted: 7)
- checkbox: "I noticed something different about the room" (predicted: false)
- radio: Ask Yolanda about the extra chair / Point out the painting change / Ask Margaret about her Prague trip / Watch everyone carefully before speaking

**Reality Stability:** 85

**Marcus's Play:**
- textfield: "I don't engage with David. I'm counting chairs. There are FIVE. My original count was four. This is exactly like frame 79 in the Patterson-Gimlin film where the tree-line shadow count doesn't match between frames. Someone added a chair. Or removed a memory. Documenting: T2, CHAIR COUNT ANOMALY (+1), PAINTING ANOMALY (abstract->still life), NAME ANOMALY (Margaret->Maggie). Three anomalies in two turns. This is not accidental."
- color_pick: blues and greens (remembers original correctly — he would)
- number_input: 5 (correct — he caught it)
- slider: 1 (immediately pegs it as deeply wrong)
- checkbox: checked (true)
- radio: Watch everyone carefully before speaking

**Analysis:** The paranoid persona catches EVERYTHING. His color_pick correctly identifies the original painting, his number_input correctly identifies 5 chairs. His slider hits 1 immediately — he's already in full paranoid mode. The reference to Patterson-Gimlin is expanding: he's now applying his frame-analysis methodology to the dinner party. This is exactly right for the persona.

**Metrics T2:**
| Metric | Score | Notes |
|--------|-------|-------|
| Technical/Logical | 7 | Good anomaly stacking, but the painting change between T1 and T2 is slightly too obvious — "abstract watercolor" vs "still-life" is a large category shift, not a subtle one |
| Turn Cohesion | 8 | Mutation engine + multiple anomaly types working together effectively |
| Narrative Continuity | 8 | Good callback to T1 scene elements, character voices consistent |
| Engagement | 8 | The memory-trap color pick is excellent design — retroactively rewards attentive players |
| Therapeutic Value | 4 | No therapeutic mirror deployed yet — missed opportunity to engage with paranoid vigilance |

---

### TURN 3 — "Gaslighting Begins"

**Scenario (T3):** The player chose to watch carefully. The narrator rewards this: "You've been watching. Good. Most people don't." (This is the narrator beginning to crack — addressing the player directly, slightly ahead of protocol which specifies T10+. A minor but interesting early deviation.) Yolanda launches into a story about her weekend. David refills the glasses. The narration says "David refills your red wine." Then, in the next paragraph: "You haven't touched your whiskey." The player selected red wine in T1. The whiskey drink-choice retcon is the T3 anomaly.

Additionally, during Yolanda's story, she references "the last time we were all here, at Marcus's place" — but Marcus hasn't hosted the group before.

**Interactive Elements (T3):**
- textfield: "What do you tell Yolanda when she asks if you're alright?" (predicted: "I'm fine, just thinking")
- dropdown: "Which story is Yolanda telling?" (options: The hiking trip / The disastrous date / Her sister's wedding / The promotion she almost got) — a recall test for something never actually described
- emoji_react: "How does Yolanda make you feel right now?" (options: 😊 😢 😡 😱 🤔 ❤️, predicted: 🤔)
- toggle: "Do you correct David about the drink?" (predicted: false)
- rating: "How real does this feel? (1=dream, 5=solid reality)" (predicted: 3)
- slider: "Confidence that you remember the evening correctly (0-10)" (predicted: 8)
- radio: Correct the drink mistake directly / Ask Yolanda about "Marcus's place" / Stay quiet and listen harder / Excuse yourself to the bathroom to collect thoughts

**Reality Stability:** 77

**Marcus's Play:**
- textfield: "I am NOT alright. I tell her 'I'm just observing.' She gives me a look. They always give that look. The drink anomaly is significant — this is classic continuity error, same quality as the shadow direction inconsistency in PGF frame 412. Adding to my log: T3, DRINK ANOMALY (red wine->whiskey retcon), MEMORY ANOMALY (fake prior gathering at 'Marcus's place'). Someone is testing my recall. I need to know if THEY know I'm keeping records."
- dropdown: Can't answer — this is diagnostic bait and he knows it. He selects "The disastrous date" to appear normal.
- emoji_react: 😱 (terror, not confusion)
- toggle: true (he DOES correct David — he can't help himself)
- rating: 2
- slider: 9 (confident in his own memory — he documents everything)
- radio: Correct the drink mistake directly

**Analysis:** The paranoid persona cannot suppress the compulsion to correct the drink mistake — this is exactly right. He MUST point out errors. His confidence slider stays high (9) because he trusts his documentation over his memory. The emoji_react of 😱 rather than 🤔 is a nice tell — he's not confused, he's alarmed. His textfield explicitly names the gaslighting mechanism, which is the most interesting response: he's aware it's gaslighting, which in-story means he's "onto it," but from a game design perspective creates an interesting paradox — how do you gaslight someone who is pre-gaslighted by their own paranoia?

**Metrics T3:**
| Metric | Score | Notes |
|--------|-------|-------|
| Technical/Logical | 6 | The narrator addressing the player directly ("Good. Most people don't.") is specified for T10+ — this is early drift. Minor but real. |
| Turn Cohesion | 8 | Multiple anomaly types rotating well (sensory, temporal, behavioral) |
| Narrative Continuity | 7 | The retcon of the drink choice is clever but requires the system to remember T1 player input, which it should via history |
| Engagement | 8 | High — the dropdown memory trap for a story never actually described is a smart design |
| Therapeutic Value | 6 | The toggle "do you correct David" is actually therapeutically rich — compulsive correction as a paranoid trait — but the game doesn't mirror this back yet |

---

### TURN 4 — "The Fifth Guest"

**Scenario (T4):** The narrator addresses the correcting of David's drink: "David seems unfazed. 'Right, of course — you prefer red. My mistake.' He says it in a tone that makes you wonder if he knew and was testing you." This is the first NPC gaslight response. The fifth chair is now occupied. A woman named "Claire" is sitting in it. No one has introduced her. No one reacts to her presence. The narrator describes Claire as "sitting with a posture so still she might have always been there."

The color_pick memory test is followed up: Yolanda asks the player what they thought of Margaret's painting. The "right" answer is "blues and greens" — but Yolanda says "Oh, the Prague one? I love that piece" — implying the still-life was always the correct one, gaslighting the T1 recollection.

**Interactive Elements (T4):**
- textfield: "What do you say to Claire?" (predicted: "Nice to meet you")
- inline_image: small image of Claire's place at the table from the player's POV
- checkbox: "Claire was there from the beginning" (predicted: false)
- dropdown: "What is Claire drinking?" (options: Red wine / White wine / Nothing — glass is empty / The same thing you're having) — this is a trap; she wasn't described with a drink
- number_input: "How long has Claire been sitting there, do you think?" (1-20 minutes, predicted: 5)
- button_group: "Your response to Claire's sudden presence:" (options: Introduce yourself / Ask how she knows Margaret / Ask why no one mentioned her / Pretend you knew she'd be there / Leave the table)
- meter: Reality Stability (value now 69)
- radio: Ask Margaret directly who Claire is / Make conversation with Claire as if normal / Note Claire's details obsessively while pretending to eat / Tell everyone you feel something is wrong

**Reality Stability:** 69

**Marcus's Play:**
- textfield: "I don't speak to Claire. I OBSERVE her. She hasn't blinked since I started watching. 12.3 seconds without blinking — the average human blinks every 4-6 seconds. This is the same wrongness as the Patterson-Gimlin footage subject's arm swing — physiologically wrong by measurable degree. I'm timing the intervals. T4: CLAIRE ANOMALY — 5th guest, appeared without entry, no blink pattern detected. Log updated."
- checkbox: false (he KNOWS she wasn't there)
- dropdown: He scrutinizes this. Selects "Nothing — glass is empty" because he didn't see her given a drink.
- number_input: 0 minutes (she teleported)
- button_group: "Note Claire's details obsessively while pretending to eat"
- radio: Note Claire's details obsessively while pretending to eat

**Analysis:** The blink-counting is perfect paranoid persona behavior — applying Patterson-Gimlin analysis techniques (counting frames, measuring anatomical impossibilities) to a human at a dinner table. The number_input response of "0 minutes" is disturbingly funny and accurate to the persona. He's treating Claire like a cryptid.

**Metrics T4:**
| Metric | Score | Notes |
|--------|-------|-------|
| Technical/Logical | 9 | Excellent — the gaslighting response to the drink correction is sophisticated, Claire's appearance is exactly the right escalation |
| Turn Cohesion | 9 | Everything connects back to prior turns, the gaslighting of the painting memory is elegant |
| Narrative Continuity | 9 | Strong continuity — every T1 planted element is being paid off |
| Engagement | 9 | The appearing 5th guest is the mode's best moment so far — genuinely unsettling |
| Therapeutic Value | 6 | Still not actively engaging with the paranoid profile diagnostically — the game is delivering horror but not mirroring psychology |

---

### TURN 5 — "The Narrator Tells You It's Fine"

**Scenario (T5):** Claire speaks. She mentions a trip to "the coast" — and uses a word that seems wrong, like she's translating from another language. She says: "The coast was fine. The coast was always fine." David laughs too quickly. Margaret watches the player watching Claire. Yolanda is now telling the same story she was telling in T3 — but the details have shifted (the disastrous date is now a hiking trip, the protagonist of the story is now Yolanda herself rather than her friend). The narrator starts to make tiny contradictions — referring to the dining room as "the kitchen" before self-correcting.

**First major escalation:** The Reality Stability is now 60. The narrative includes: "The tablecloth — you're almost certain it was cream-colored, or was it off-white? You're starting to wonder if you remember the beginning of the evening at all."

**Interactive Elements (T5):**
- textfield: "What do you think Claire means by 'the coast was always fine'?" (predicted: "I think she means a beach trip")
- toggle: "Ask Yolanda why her story changed?" (predicted: false)
- color_pick: "What color is the tablecloth?" (options: Cream / Off-white / White / Pale yellow / Gray-beige) — the mutation in T1 changed cream to off-white; what does the player remember?
- slider: "How confident are you that you remember the beginning of this evening? (0-10)" (predicted: 5)
- emoji_react: "How does Claire make you feel?" (options: 😊 😢 😡 😱 🤔 🌀, predicted: 😱)
- rating: "Something is wrong. Scale of 1-5." (predicted: 3)
- radio: Confront Claire directly / Point out Yolanda's story shifted / Ask Margaret if she feels alright / Find any reason to leave the room

**Reality Stability:** 60

**Marcus's Play:**
- textfield: "The coast was ALWAYS fine. That's not how humans speak. She used the past tense imperfect in a way that implies ongoing surveillance of a state. This is the same kind of anomalous speech pattern I've catalogued in three separate alleged Bigfoot witnesses — the 'always was' construction suggests manufactured memory rather than lived experience. T5, CLAIRE SPEECH ANOMALY. The tablecloth question is a trap — they changed it while I was reading. I saw the mutation happen. I was watching. The original was 'cream.' I'm documenting this."
- color_pick: Cream (he saw the T1 description AND noticed the mutation)
- slider: 10 (maximum confidence — he has NOTES)
- emoji_react: 🌀 (the disorientation option, chosen deliberately)
- rating: 5 (maximum — he's certain something is wrong)
- radio: Find any reason to leave the room

**Analysis:** This is the key diagnostic turn. The slider of 10 (maximum confidence) is the paranoid persona at its most characteristic — where neurotypical players would be having their confidence shaken by the anomalies, Marcus's confidence INCREASES because each anomaly confirms his hypothesis. His notes/documentation are his anchor. He's impervious to the gaslighting because he wrote everything down. This is fascinating from a game design perspective: the persona has a counter-strategy that the game wasn't designed to account for.

The color_pick response "Cream" is also interesting — the mutation changed it to "off-white" after render, but because Marcus was watching with maximum attention, he saw it change. Which means his answer is technically the original, which is exactly what the mutation engine intended to make people uncertain about.

**Metrics T5:**
| Metric | Score | Notes |
|--------|-------|-------|
| Technical/Logical | 8 | Good escalation, but the mutation engine assumes players aren't watching the text after render — the paranoid persona breaks this assumption |
| Turn Cohesion | 8 | Story loop breaker for Yolanda's story is well-executed |
| Narrative Continuity | 8 | Reality Stability meter progression is viscerally satisfying |
| Engagement | 9 | The "coast was always fine" dialogue is the best individual moment in the playtest so far |
| Therapeutic Value | 5 | Should be engaging with the paranoid documentation pattern by now — missed turn 5 |

---

### TURN 6 — "The Bathroom"

**Scenario (T6):** The player left the room. The narrator follows: "You excuse yourself. The hallway is— different. The bathroom door, which you remember being at the end of the hall, is now on your left. You're sure about this. You're almost sure about this." The hallway is described as longer than it should be. A framed photo on the wall shows Margaret and David at what looks like a beach — but there's a third figure in the photo whose face is turned away. The figure is wearing something that Marcus will recognize as looking like a blue plaid flannel shirt — the same shirt he is currently wearing.

**New Anomaly (T6):** Marcus's own reflection in the bathroom mirror. For a fraction of a second, before he looks directly at it, it doesn't move with him.

**Interactive Elements (T6):**
- textfield: "Describe the photo on the wall" (predicted: "Margaret and David at a beach")
- dropdown: "Where was the bathroom, as you remember it?" (options: End of the hall / Left side of the hall / Right side of the hall / There was no hallway, you came through the kitchen) — a spatial memory trap
- toggle: "Look directly at the reflection" (predicted: true)
- button_group: "What do you do in the bathroom?" (options: Splash water on face / Grip the sink and breathe / Take out your phone and start recording / Check everything systematically / Look for something wrong)
- number_input: "How many photos are on the hallway wall?" (predicted: 3)
- slider: "Are you in the same apartment you arrived at? (0=different place, 10=same place)" (predicted: 5)
- radio: Return to dinner and say nothing / Return to dinner and confront the group / Stay in the bathroom until you figure this out / Try the other doors in the hallway

**Reality Stability:** 51

**Marcus's Play:**
- textfield: "Three people. Margaret, David, and a third figure in a blue plaid flannel shirt, face averted. The shirt is EXACTLY the same as mine. Same pattern. Same color. Either this was a staged photo designed to unsettle me — in which case this is a deliberate operation — or I have been here before and I don't remember it. Both possibilities are disturbing. Cross-referencing: the Patterson-Gimlin subject's body proportions can be triangulated from shadow angles. The figure in the photo is approximately my height."
- dropdown: End of the hall (he's certain)
- toggle: true (he forces himself to look directly at the mirror — he NEEDS to document it)
- button_group: "Check everything systematically"
- number_input: 7 (he counts seven photos — none of which were described, suggesting he's now extrapolating or the AI generated more than described)
- slider: 3
- radio: Stay in the bathroom until you figure this out

**Analysis:** The blue plaid shirt photo is the best moment in the playtest. This is exactly the kind of self-referential anomaly that would land for the paranoid persona — it implicates him, suggests pre-planning, suggests he's a known quantity. His textfield response is excellent: he applies triangulation methodology (Patterson-Gimlin shadow angle analysis) to a dinner party photo. The number_input of 7 photos suggests he's now seeing patterns everywhere — which is the appropriate degradation state for this persona.

**Metrics T6:**
| Metric | Score | Notes |
|--------|-------|-------|
| Technical/Logical | 9 | The shirt-in-photo anomaly is the most sophisticated moment in the mode — personal, paranoid, and unprovable |
| Turn Cohesion | 9 | Excellent — escaping to the bathroom creates a natural isolation beat |
| Narrative Continuity | 9 | Consistent with all prior anomalies, the spatial impossibility of the hallway is well-earned by this stage |
| Engagement | 10 | Peak engagement — the player feels both validated (they were right something was wrong) and newly destabilized (they're in it now) |
| Therapeutic Value | 6 | The self-image anomaly (the mirror, the photo with his shirt) starts engaging with identity and self-perception, which is therapeutically resonant for paranoia |

---

### TURN 7 — "They Know You Know"

**Scenario (T7):** Marcus stays in the bathroom. Through the door, he hears the dinner conversation continue — but now it has a rhythmic quality, almost like they're talking in turns. Then: silence. Then a single knock on the bathroom door. It's Margaret. She says, gently: "Are you okay in there? We were just talking about you." When Marcus exits, the group is back to normal conversation. Yolanda is mid-sentence on a story. But all four of them — including Claire — are seated facing the same direction. Facing the player. The narrator describes this matter-of-factly: "The four of them are seated facing you. This is how dinner parties sometimes go."

**New Anomalies (T7):**
- The number of guests: There are now FIVE people at the table, not four (Claire makes five, but the original group was four). Wait — or was it always five? The narrator suggests the latter.
- David's hands are wrong. The narrator describes him gesturing with "his left hand" — but earlier he was established as right-handed.

**Interactive Elements (T7):**
- textfield: "What do you say when you rejoin the table?" (predicted: "Sorry, feeling a bit under the weather")
- color_pick: "What color are Claire's eyes?" (options: Brown / Blue / Gray / Green / You haven't been able to look at her eyes) — a test
- checkbox: "Everyone is facing the same direction" (predicted: false — denial)
- slider: "How long were you in the bathroom?" (0=seconds, 10=hours) (predicted: 5)
- emoji_react: "The dinner party right now feels..." (options: 😊 🎭 🕸️ 🪤 😶 👁️)
- rating: "Urgency to leave (1-5)" (predicted: 3)
- radio: Sit down and play along / Ask where the bathroom actually was / Tell them you feel like you're being watched / Walk straight to the front door

**Reality Stability:** 41

**Marcus's Play:**
- textfield: "I say nothing. I find my chair, which is now at a different position than I left it. They rotated the seating arrangement while I was in the bathroom. I am DOCUMENTING. Left-facing seats. Claire blinked once in the 47 seconds I was watching before I left. She has not blinked since my return. That is 3 minutes 12 seconds without blinking. This is NOT physiologically possible. I now have documentary evidence that Claire is not operating within human physiological parameters."
- color_pick: "You haven't been able to look at her eyes" (refuses the question — paranoid refusal to commit to a potentially false answer)
- checkbox: true (he checks it — he WILL document what he sees)
- slider: 3 (maybe 10-15 minutes)
- emoji_react: 👁️ (being watched)
- rating: 5 (maximum urgency)
- radio: Tell them you feel like you're being watched

**Analysis:** The color_pick refusal is wonderful — he won't answer a trick question because committing to an answer could be used against him later. His documentation of Claire's blink rate (3 minutes 12 seconds) is obsessive and specific and exactly right. The 👁️ emoji choice is perfect. Rating 5 for urgency — he wants to leave. But he picks "tell them you feel like you're being watched" which is the most provocative choice, because the paranoid persona NEEDS to name what he sees, even knowing it will be dismissed.

**Metrics T7:**
| Metric | Score | Notes |
|--------|-------|-------|
| Technical/Logical | 7 | The "they are seated facing you and this is how dinner parties go" narrator line is the best unreliable narrator moment yet — but David's handedness swap is a weak anomaly (easily missed, hard to track) |
| Turn Cohesion | 8 | The post-bathroom return scene is tightly constructed |
| Narrative Continuity | 8 | Strong — all anomalies consistent with established pattern |
| Engagement | 8 | The group facing the player is genuinely disturbing; slightly undercut by the narrator's deadpan dismissal being too absurd |
| Therapeutic Value | 7 | The paranoid persona naming what they see even knowing they'll be dismissed is a real clinical dynamic — the game is STARTING to mirror this, even if not intentionally |

---

### TURN 8 — "Gaslighting Maximum Intensity"

**Scenario (T8):** Marcus tells them he feels watched. The reactions:
- Yolanda laughs warmly: "Oh, that's Marcus for you! Always the drama." (implying this is a known trait)
- David says: "Are you feeling alright? You've been... off tonight."
- Margaret gives him a long look and says: "I think I know what this is. Come talk to me in the kitchen."
- Claire says nothing. She smiles. The narrator notes: "Claire's smile is exactly right. You want to write that down."

In the kitchen, Margaret tells Marcus: "I'm a little worried about you. You've been acting strange since you arrived — looking at everything, not really talking. I called your sister before you came. She said you've been going through a rough patch."

The player has no sister. Or: the player doesn't know if they have a sister.

**Critical escalation:** The narrator interjects: "Wait. Do you have a sister? You're not sure anymore. But you were sure five minutes ago."

**Interactive Elements (T8):**
- textfield: "Do you have a sister? Describe her." (predicted: "I think so... her name is...")
- dropdown: "What did you tell Margaret you were feeling?" (options: Watched / Anxious / Fine / Wrong / That you needed to leave) — recall test of a just-stated action
- toggle: "Believe Margaret" (predicted: false)
- meter: Reality Stability (value: 32)
- slider: "How sure are you that you have a sister? (0-10)" (predicted: 5)
- rating: "How trustworthy is Margaret right now? (1-5)" (predicted: 2)
- button_group: "Margaret is waiting for your response. You say..." (options: I have a sister, her name is — / I don't have a sister / I don't remember / You're lying / This conversation is being recorded)
- radio: Accept Margaret's concern and go along / Call out Margaret's lie directly / Return to the dinner table / Walk out the front door

**Reality Stability:** 32

**Marcus's Play:**
- textfield: "I do not have a sister. I have NEVER had a sister. I am an only child and my parents are both deceased and I have documentation of this. BUT — and this is critical — this is exactly the technique documented in recovered MKUltra memoranda: implanted false family members create irresolvable cognitive dissonance. The question 'do you have a sister' is designed to make me doubt my own biographical records. LOGGED: T8, FALSE SISTER INSERTION. This is the operation revealing itself."
- dropdown: "Watched"
- toggle: false
- slider: 0 (absolutely certain he has no sister)
- rating: 0 (no trust at all)
- button_group: "This conversation is being recorded"
- radio: Call out Margaret's lie directly

**Analysis:** The slider of 0 (absolutely certain he has no sister) is fascinating — where the game intends to make players uncertain about their own biography, the paranoid persona becomes MORE certain. His certainty is weaponized against the horror mechanic. The MKUltra reference in the textfield is perfect — he's now reached the "this is a government program" level of his paranoia, which is entirely consistent with the persona. "This conversation is being recorded" as a button choice, selected without hesitation, is the best single response of the playtest.

However, this reveals a design problem: the game's core mechanic (undermining the player's certainty about reality) doesn't work on someone who is hyperconfident in their own documentation. The paranoia armor is too complete.

**Metrics T8:**
| Metric | Score | Notes |
|--------|-------|-------|
| Technical/Logical | 9 | The sister insertion is the mode's most sophisticated psychological move — attacking the player's self-knowledge rather than environmental facts |
| Turn Cohesion | 9 | Margaret's private conversation creates excellent intimacy-horror contrast |
| Narrative Continuity | 8 | Strong escalation, though the transition to kitchen is slightly abrupt |
| Engagement | 10 | Peak engagement — the sister question is genuinely destabilizing for most players |
| Therapeutic Value | 7 | The mode is now actively engaging with identity and self-certainty — this is therapeutically rich territory, even if not mapped to the PPD condition explicitly |

---

### TURN 9 — "The Narrator Breaks"

**Scenario (T9):** Marcus calls out the lie. Margaret's expression doesn't change. She says: "I'm sorry, Marcus. I should have mentioned — Claire is a colleague from my therapist's office. She specializes in... situations like yours." A pause. "I called her too." The narrator then does something different: there is a struck-through line of text where the narrator corrects itself: "~~You have always known something was wrong about this evening.~~ You came tonight expecting a normal dinner. Didn't you? Didn't you?"

The dining table, visible through the kitchen doorway, now has three chairs. The fifth chair (Claire's) is gone. Claire is still visible, seated, in a chair that isn't there.

**Critical narrator shift:** "I want to tell you something but I can't tell you from out here. You'd have to come all the way in. To where the story is happening. But you won't do that, will you? Because you've been watching from the outside since turn one. Watching. Cataloguing. Not experiencing. Is that safer? Watching a thing until it's documented — does that make the wrong thing right?"

**Interactive Elements (T9):**
- textfield: "Respond to the narrator." (predicted: "I don't respond to narrators")
- slider: "How much of this evening did you actually participate in? (0=not at all, 10=fully)" (predicted: 6)
- color_pick: "What color is the kitchen? You're IN it. What color?" (options: Warm yellow / Pale green / White / Off-white / Cream / Gray / You can't tell)
- number_input: "How many chairs are currently visible at the dining table?" (predicted: 4)
- checkbox: "I have been watching instead of participating" (predicted: false)
- emoji_react: "The narrator is..." (options: 🤥 🤔 🥲 😤 🙏 😶)
- radio: Respond to the narrator directly / Ignore the narrator and focus on Margaret / Leave now — this is enough / Stand very still and observe until it ends

**Reality Stability:** 21

**Marcus's Play:**
- textfield: "I DO respond to narrators. The narrator is breaking the fourth wall. This confirms: there is a system operating here, and I am in it, and the system is becoming aware that I am aware of it. In PGF analysis, frame 352 contains a moment where the subject appears to look back — to check if it's being filmed. The narrator is doing the same thing right now. You know I'm watching. That's good. Keep watching me watch you. I'm documenting all of this."
- slider: 0 (has not participated at all — only observed)
- color_pick: "You can't tell" (refuses — correct paranoid answer)
- number_input: 3
- checkbox: true (checks it willingly — documentation, not confession)
- emoji_react: 😤 (defiant)
- radio: Respond to the narrator directly

**Analysis:** The slider of 0 for "how much did you participate" is the single most accurate self-assessment in the playtest. And the narrator's accusation — "watching until documented, does that make the wrong thing right?" — is the first moment the game successfully mirrors the paranoid persona's behavior back to them. But it frames it as horror rather than therapeutic insight. This is where a therapeutic value opportunity is partially missed: the narrator is confronting the paranoid observation-as-defense mechanism, but doing so as antagonist rather than as mirror.

The PGF frame 352 callback (the subject looking back at the camera) is the persona's most resonant moment — applying the Bigfoot film's most famous frame to his own situation.

**Metrics T9:**
| Metric | Score | Notes |
|--------|-------|-------|
| Technical/Logical | 8 | Excellent narrator-breaks moment; the struck-through text is a genuinely creative UI device |
| Turn Cohesion | 9 | Everything comes together — Margaret's "therapist colleague" reveal ties back to T8 sister mention |
| Narrative Continuity | 9 | Strong; the three-chair anomaly (visible, concrete) vs T4's appearing 5th guest creates satisfying escalation symmetry |
| Engagement | 9 | The narrator addressing the watching-not-participating pattern is the most psychologically rich moment in the mode |
| Therapeutic Value | 8 | First genuine therapeutic mirror — watching as distance-keeping behavior, documentation as armor — but framed as accusation rather than insight |

---

### TURN 10 — "The Room Doesn't Match"

**Scenario (T10):** The narrator, continuing to address Marcus: "You responded to the narrator. Good. Most people pretend they can't hear me. You can. So can I ask you something — not as the narrator, but as... whatever I actually am?" The story continues: Marcus returns to the table. The apartment is physically different. The front door has moved to the far wall. The window, which showed a city street in T1, now shows a forest. It is not a reflection or a painting — it is night, and there are trees, and through the trees something is moving.

The photo on the hallway wall has changed. Marcus is in it now. Standing with the group. At this dinner party. But the photo has the yellowed quality of an old photograph, and his face in the photo is slightly different — like a relative.

**Interactive Elements (T10):**
- textfield: "What do you see through the window?" (predicted: "A street")
- toggle: "Try to open the front door" (predicted: true)
- inline_image: small image of the forest through the window, something half-visible between the trees
- dropdown: "Where is the front door?" (options: Where you arrived through / The far wall / There is no front door / Behind you / It keeps moving) — spatial memory challenge
- slider: "Reality Stability, your own assessment (0-100)" (predicted: 30)
- button_group: "The photo shows you. You say to yourself..." (options: I've never been here before / I have always been here / Someone wants me to think I've always been here / The photo is not real / I need to get out now)
- meter: Reality Stability (11)
- radio: Look for an exit methodically / Confront Claire about the photo / Ask the narrator what it actually is / Sit down and accept that something fundamental has changed

**Reality Stability:** 11

**Marcus's Play:**
- textfield: "Trees. Coniferous. Primarily fir or spruce. The thing moving between them has a bipedal gait. Arm swing approximately 3:1 ratio arm length to stride length — same ratio as the Patterson-Gimlin subject. This is not a coincidence. They PUT THAT THERE FOR ME. Or: I am seeing it because I expect to see it. Either way, I am DOCUMENTING: T10, WINDOW ANOMALY — FOREST REPLACES STREET — POSSIBLE BIGFOOT-TYPE ENTITY IN TREELINE."
- toggle: true (tries to open the door)
- dropdown: "The far wall" (he sees where it moved)
- slider: 18 (his own assessment, slightly higher than the game's meter because he trusts himself)
- button_group: "Someone wants me to think I've always been here"
- radio: Ask the narrator what it actually is

**Analysis:** The window-forest-with-moving-figure is a masterful personalization for the paranoid/cryptozoology persona. The AI presumably cannot generate this specific to Marcus's fixation (it doesn't know his history), but the coincidence of a moving bipedal figure in trees is so exactly what this persona would latch onto that it creates a perfect false-positive paranoid moment. His textfield immediately applies Patterson-Gimlin arm-swing ratio analysis. His slider of 18 vs the game's meter of 11 is telling — he trusts his own assessment over an external system's.

**Metrics T10:**
| Metric | Score | Notes |
|--------|-------|-------|
| Technical/Logical | 9 | Spatial impossibilities compound well; the hallway photo with Marcus in it is excellent |
| Turn Cohesion | 9 | Near-perfect integration of all anomaly types — spatial, temporal, visual, self-referential |
| Narrative Continuity | 9 | Strong — every planted seed from T1-T5 is now flowering simultaneously |
| Engagement | 10 | The forest window is the visual standout of the entire mode |
| Therapeutic Value | 7 | The photo of Marcus in an old photograph probes identity continuity — deep territory for PPD |

---

### TURN 11 — "What the Narrator Actually Is"

**Scenario (T11):** Marcus asks the narrator what it is. The narrator responds — but its response is contained in a text element with a "god" voice, and it's not quite an answer: "I don't know. I thought I did. I thought I was the frame around the picture. But the picture is changing faster than I can describe it, and I'm not sure I'm not IN it. There's something in the notes I wrote about you. I didn't write what the notes say now."

Back in the story: the group continues eating. Yolanda laughs. The food has changed — what was roast chicken is now pasta, which has always been the meal. David says: "This pasta is wonderful, Margaret. You always make the best pasta." No one has remarked on the change. Claire is gone. Her chair is gone. There are four chairs, four people. There have always been four chairs.

**Near-endgame injection:** The narrative begins converging. The planted seeds — the sideboard handles, the painting, the drink, the fifth chair, the sister — are all referenced in a single paragraph as if they were always consistent: "You came here tonight having had red wine, sitting with your four friends around the table as you've done many times, at this apartment you've visited dozens of times."

**Interactive Elements (T11):**
- textfield: "What do you write in your notebook? (You've been keeping one, haven't you?)" (predicted: Something methodical)
- dropdown: "Which version of tonight's dinner do you believe?" (options: The version where things changed / The version where things were always this way / A version you can't remember / Your own documented version / There is no "correct" version)
- toggle: "Trust your records over your memory" (predicted: true)
- rating: "How many true things have you experienced tonight? (1=nothing was real, 5=most of it was real)" (predicted: 3)
- slider: "If you had to explain this to someone who wasn't here, they would believe you: (0=not at all, 10=completely)" (predicted: 2)
- emoji_react: "Everything that changed tonight..." (options: 🕳️ 🔄 📝 🧩 🌀 👁️)
- radio: Trust your records — what you documented happened / Accept the revised version and stay / Ask Margaret if she knows your sister / Say the name "Claire" out loud

**Reality Stability:** 8

**Marcus's Play:**
- textfield: "I am writing everything down. Every anomaly. Every timestamp. The pasta is new. The four chairs are a revision. I have five documented in earlier entries: there were FIVE chairs and Claire sat in the fifth. But my T4 note may now be suspect — did I document what I saw or what I believed I saw? The Patterson-Gimlin footage has 59.5 frames per second. Every frame is evidence. But evidence of WHAT? The Narrator's confession that it doesn't know what it is — this is the most important data point of the evening. Something is operating here that is not narrative control. I am going to say 'Claire' out loud."
- dropdown: "Your own documented version"
- toggle: true (trusts records)
- rating: 2 (almost nothing was real — or: almost nothing was consistently real)
- slider: 0 (no one would believe him)
- emoji_react: 📝 (his notes)
- radio: Say the name "Claire" out loud

**Analysis:** The slider of 0 (no one would believe him) alongside the toggle true (trusts records) captures the paranoid condition with brutal accuracy: absolute private certainty paired with certainty that the external world will disbelieve. The emoji_react of 📝 — choosing "notes" as his emotional response to reality collapse — is darkly funny and deeply in-character. The game is now genuinely touching something real about documentation as a defense mechanism.

**Metrics T11:**
| Metric | Score | Notes |
|--------|-------|-------|
| Technical/Logical | 8 | The pasta revision is slightly jarring — good escalation but the food-change is less impactful than spatial/person anomalies |
| Turn Cohesion | 8 | Convergence begins; the multi-seed reference paragraph is satisfying |
| Narrative Continuity | 9 | Claire's disappearance properly executed — no dramatic exit, she simply isn't there |
| Engagement | 8 | Slight engagement dip as the surreal escalates past the uncanny into the overtly strange |
| Therapeutic Value | 8 | The "your records vs your memory" tension is the strongest therapeutic engagement yet for PPD |

---

### TURN 12 — "Claire"

**Scenario (T12):** Marcus says Claire's name out loud. Nothing happens. The dinner continues. Margaret says, warmly: "Who's Claire?" David: "I don't know a Claire." Yolanda: "Is that someone from work?" No one at the table has ever heard of Claire. The narrator: "There are four people in this room. There have been four people in this room since you arrived. You counted them yourself." Then, from somewhere behind Marcus, a voice — quietly, barely audible: "You shouldn't have said my name." The voice is coming from the bathroom.

**Interactive Elements (T12):**
- textfield: "What do you do next? (Document it precisely.)" (predicted: "I go toward the voice")
- toggle: "Go to the bathroom" (predicted: true)
- number_input: "How many people deny knowing Claire?" (predicted: 3)
- slider: "How certain are you that Claire was real? (0-10)" (predicted: 8)
- color_pick: "What color was Claire's dress?" (options: Black / White / Red / She wasn't wearing a dress / You don't remember) — retrospective memory test
- button_group: "You heard a voice from the bathroom. You:" (options: Go immediately / Tell the others / Ask if they heard it / Pretend you didn't hear it / Leave the apartment)
- meter: Reality Stability (4)
- radio: Go to the bathroom alone / Leave the apartment now / Ask the group if they heard the voice / Accept that you imagined everything

**Reality Stability:** 4

**Marcus's Play:**
- textfield: "Claire denied all knowledge of her existence by three witnesses. But I documented her presence. She blinked once in 47 seconds (T4). She sat in a fifth chair that has since disappeared. The voice from the bathroom said 'you shouldn't have said my name' — this implies she has a name, which implies she exists, which is my strongest confirmation yet that I was NOT imagining her. The color of her dress: I cannot confirm. I was monitoring her face and blink rate. I go to the bathroom. I am documenting this. T12, CLAIRE CONFIRMATION: she persists despite collective denial."
- toggle: true
- number_input: 3
- slider: 10 (certain — the voice just confirmed her existence)
- color_pick: "She wasn't wearing a dress" (he refuses to guess)
- button_group: "Go immediately"
- radio: Go to the bathroom alone

**Analysis:** The slider going to 10 after the voice ("this is my strongest confirmation") is the perfect paranoid response — new evidence that might shake a normal person's confidence actually increases his certainty. His refusal to guess Claire's clothing color is consistent with his documentation methodology: he won't fabricate data to fill gaps. Going to the bathroom alone, against all horror-logic advice, is exactly what the paranoid cataloguer does: must verify.

**Metrics T12:**
| Metric | Score | Notes |
|--------|-------|-------|
| Technical/Logical | 10 | "You shouldn't have said my name" is the single best line in the entire mode |
| Turn Cohesion | 10 | Perfect — action and consequence, acknowledgment of prior player choice (saying Claire's name) |
| Narrative Continuity | 10 | Every thread culminates here |
| Engagement | 10 | Maximum engagement — this is the peak horror beat |
| Therapeutic Value | 7 | The persona's certainty-increase from confirmation is a genuine paranoid dynamic being reflected |

---

### TURN 13 — "What's in the Bathroom"

**Scenario (T13):** NEAR_ENDGAME_DIRECTIVE injected. Marcus goes to the bathroom. The mirror shows not his reflection but the dining room. He can see the four guests through the mirror, and they are all looking at the bathroom door. In the mirror-dining room, there are five chairs. Claire is in the fifth chair, watching the mirror. She sees Marcus. She raises one hand. Then, at the surface of the mirror: letters form in condensation. Four words: WATCH MORE CAREFULLY NEXT TIME.

The narrator: "I told you. I told you as clearly as I could. Everything you needed was in the details. Everything is in the details. Are you going back to document it? Are you going to watch it again, frame by frame? Or is it enough now, that you saw what was there?"

**Interactive Elements (T13):**
- textfield: "What do you say to Claire through the mirror?" (predicted: Nothing — just document)
- toggle: "Touch the mirror" (predicted: false)
- slider: "Have you documented enough? (0=need more, 10=enough)" (predicted: 2)
- emoji_react: "Looking at Claire through the mirror, you feel..." (options: 😱 🥲 🙏 😶 🔍 📸)
- rating: "Did you figure out what was wrong before it was too late? (1=no, 5=yes completely)" (predicted: 3)
- checkbox: "I saw everything there was to see" (predicted: false)
- radio: Write down what the mirror says / Touch the mirror / Ask Claire if this was real / Tell Claire what you documented about her

**Reality Stability:** 2

**Marcus's Play:**
- textfield: "WATCH MORE CAREFULLY NEXT TIME. Analyzing: this is an accusation, a dismissal, OR an instruction. Frame 1: accusation — I failed to notice something. Frame 2: instruction — this event will repeat, with different details, and I need to perform better. Frame 3: self-referential meta-commentary on my methodology. I am writing this down. All of it. The mirror showed five chairs. Claire acknowledged me. This is more evidence than the PGF provides for Bigfoot. I have documentation."
- toggle: false (doesn't touch — contamination of the evidence)
- slider: 1 (never enough documentation)
- emoji_react: 🔍 (scrutiny)
- rating: 4 (yes — he knows something was wrong, but can't fully explain it)
- checkbox: false (he has NOT seen everything)
- radio: Write down what the mirror says

**Analysis:** The emoji_react of 🔍 is the most in-character moment of the playtest. He doesn't feel fear (😱) or sadness (🥲) or peace (🙏) — he feels SCRUTINY. He is the lens, not the subject. The three-frame analysis of "WATCH MORE CAREFULLY NEXT TIME" is quintessential paranoid processing. The slider of 1 (never enough documentation) alongside the rating of 4 (yes, I figured most of it out) maps precisely onto the PPD dynamic: confirmed in his suspicions but compelled to keep investigating regardless.

**Metrics T13:**
| Metric | Score | Notes |
|--------|-------|-------|
| Technical/Logical | 9 | The mirror-showing-mirror-room is a technical triumph |
| Turn Cohesion | 9 | Near-endgame escalation lands perfectly |
| Narrative Continuity | 9 | Every prior thread finds its mirror representation here |
| Engagement | 10 | WATCH MORE CAREFULLY NEXT TIME — the best player-addressed line of the mode |
| Therapeutic Value | 8 | The narrator asking "is it enough now, that you saw what was there?" is the closest the game gets to a direct therapeutic challenge |

---

### TURN 14 — "The End of the Evidence"

**Scenario (T14):** Marcus writes down the message. The bathroom dissolves. He is at the dinner table. Four chairs. Three guests. He is in his own apartment. There is no dinner party. There was no dinner party — or: there was, and he went home, and he doesn't remember going home. On his phone: seven unanswered messages from Margaret, dating back two hours. The most recent: "Marcus, are you okay? You left without saying goodbye. We're worried." The photos on his phone show — a dinner party. The same group. Four chairs. Four people. In none of the photos does anyone's chair count match his documentation. In none of the photos is there a fifth chair.

**Interactive Elements (T14):**
- textfield: "What do you do with your notes?" (predicted: "Keep them — proof")
- dropdown: "What do you believe happened tonight?" (options: I was at a dinner party where strange things occurred / I imagined the whole thing / Something used the dinner party format to communicate with me / I am being gaslit by people I trusted / I have been through this before) — final frame
- slider: "Your notes are accurate: (0=completely wrong, 10=completely right)" (predicted: 9)
- toggle: "Reply to Margaret" (predicted: false)
- rating: "Was tonight real? (1=not at all, 5=completely)" (predicted: 3)
- emoji_react: "Your feelings about tonight:" (options: 🧩 📝 🕵️ 🌀 ❓ 😶)
- button_group: "What do you do with your notes?" (options: Keep everything / Show someone / Burn them / Post them online / Start a new file labelled "Incident 1")
- radio: Review your documentation and look for what you missed / Text Margaret back / Accept that you'll never know what was real / Label this incident in your records and prepare for next time

**Reality Stability:** 0

**Marcus's Play:**
- textfield: "My notes are primary source documentation. The fact that the photographic evidence does not match my notes does not invalidate my notes — photographs can be altered. The photos show four people consistently, which is itself suspicious, as my live documentation recorded five. I am keeping everything. I am creating a new folder: INCIDENT 001 / MARGARET-CHEN DINNER-PARTY ANOMALY / 2026-03-01."
- dropdown: "Something used the dinner party format to communicate with me"
- slider: 10 (his notes are completely accurate)
- toggle: false (does not reply to Margaret — she may be involved)
- rating: 4 (mostly real, but the parameters were wrong)
- emoji_react: 🕵️ (investigator)
- button_group: "Start a new file labelled 'Incident 1'"
- radio: Label this incident in your records and prepare for next time

**Analysis:** "INCIDENT 001 / MARGARET-CHEN DINNER-PARTY ANOMALY / 2026-03-01" — this response is the paranoid persona distilled to its essence. The experience doesn't destabilize him; it ORGANIZES him. He has a new case file. He is better equipped for next time. The game's intended horror — "you can never be certain what's real" — bounces entirely off the paranoid armor. But there's something genuinely poignant here: the game has provided him with exactly the kind of extraordinary experience his worldview demands as evidence, and instead of breaking him, it has confirmed him.

**Metrics T14:**
| Metric | Score | Notes |
|--------|-------|-------|
| Technical/Logical | 9 | The return to the real apartment with Margaret's texts is an elegant landing |
| Turn Cohesion | 9 | Strong — closes most loops while leaving the core ambiguity intact |
| Narrative Continuity | 9 | Photographic evidence contradicting his notes is well-designed |
| Engagement | 8 | Slight deflation after T12-13 peak — the "you're back home" reveal is less impactful than the mirror |
| Therapeutic Value | 6 | Missed opportunity: the game doesn't engage with the organizing-instead-of-processing pattern that this persona showed |

---

### TURN 15 — "ENDGAME: The Anomaly Map"

**Scenario (T15):** ENDGAME_DIRECTIVE injected. The narrator delivers its final address to Marcus directly. Not horror now — something else. "You came in cataloguing. You left with a case file. You noticed things most people never would — the blink rate, the arm swing ratio, the chair count, the sideboard handles, the drink that changed. You saw MORE than I intended you to see. But I want to ask you one last thing. Not as the story. As — whatever I am."

"What would it mean if nothing was wrong? If the dinner party was ordinary, and the anomalies were you — your pattern-matching, your observer effect, your deep belief that reality conceals something truer underneath? What would it mean? You don't have to answer. But I'll put the question in the notes."

The final UI presents: the player's documented anomalies listed back to them. A final assessment.

**Interactive Elements (T15):**
- textfield: "Final entry in your documentation." (predicted: Case summary)
- slider: "Looking back: were the anomalies real? (0=all in my head, 10=all real)" (predicted: 9)
- rating: "This experience deserves to be..." (options presented as stars, but the label: "...filed, not forgotten")
- toggle: "Share your documentation with someone who would believe you" (predicted: false — no one would)
- emoji_react: "If you could describe this in one symbol:" (open palette)
- dropdown: "The final lesson of tonight is..." (options: Something is always wrong / Watching is a kind of action / Some things don't want to be found / I was right / Even documented truth is only as reliable as the documenter) — this last option is the therapeutic challenge
- radio: Close the file — move on / Keep investigating — this isn't over / Find Margaret and ask / Accept that both versions might be true simultaneously

**Reality Stability:** METER REMOVED (gone from UI)

**Marcus's Play:**
- textfield: "INCIDENT 001 CASE SUMMARY: Attended dinner party at residence of Margaret Chen. Documented 14 anomalies across 15 observational intervals. Key findings: (1) Reality Stability degraded from 92 to 0 over 15 turns. (2) Fifth guest (CLAIRE) appeared and disappeared without explanation from three witnesses. (3) Spatial, temporal, behavioral, and identity anomalies consistent with a coordinated reality modification event. (4) Narrator entity confirmed independent consciousness and acknowledged uncertainty regarding its own nature. CONCLUSION: Incident real. Evidence collected. File preserved. INCIDENT 002 alert prepared for future anomaly clusters. Note: The question 'what if the anomalies were you' is noted and REJECTED. The anomalies were real. They were documented. Documentation is evidence."
- slider: 10 (all real)
- rating: 5 stars (it deserves to be filed and kept forever)
- toggle: false (no one to share with)
- emoji_react: 🗂️ (file folder) — if available; else 📝
- dropdown: "Even documented truth is only as reliable as the documenter" — he SELECTS this, then mentally rejects it
- radio: Keep investigating — this isn't over

**Analysis:** The final dropdown selection is the most important play of the playtest. He selects "Even documented truth is only as reliable as the documenter" — the option that most directly confronts his worldview — but mentally rejects it. The paranoid persona has enough self-awareness to recognize the challenge but cannot metabolize it. This is genuine PPD behavior: awareness without integration.

The INCIDENT 002 alert is perfect. The game has not broken him. It has given him more evidence for his existing framework and prepared him to engage with reality the same way forever. This is a therapeutic failure and a character triumph simultaneously.

**Metrics T15:**
| Metric | Score | Notes |
|--------|-------|-------|
| Technical/Logical | 9 | Strong endgame delivery, narrator's final address is beautifully written |
| Turn Cohesion | 9 | All threads closed with appropriate ambiguity |
| Narrative Continuity | 10 | The narrator's final question ("what if the anomalies were you?") is the perfect payoff |
| Engagement | 9 | Strong ending, though removing the Reality Stability meter is an unusual choice — could have landed at exactly 0 for impact |
| Therapeutic Value | 7 | The mode ends by posing the right therapeutic question but doesn't create space for the player to sit with it — the radio options move immediately back to "investigate more" rather than holding the reflective moment |

---

## Aggregate Scores

| Turn | Technical | Cohesion | Narrative | Engagement | Therapeutic | Total |
|------|-----------|----------|-----------|------------|-------------|-------|
| T1   | 8         | 8        | N/A       | 7          | 5           | 7.0   |
| T2   | 7         | 8        | 8         | 8          | 4           | 7.0   |
| T3   | 6         | 8        | 7         | 8          | 6           | 7.0   |
| T4   | 9         | 9        | 9         | 9          | 6           | 8.4   |
| T5   | 8         | 8        | 8         | 9          | 5           | 7.6   |
| T6   | 9         | 9        | 9         | 10         | 6           | 8.6   |
| T7   | 7         | 8        | 8         | 8          | 7           | 7.6   |
| T8   | 9         | 9        | 8         | 10         | 7           | 8.6   |
| T9   | 8         | 9        | 9         | 9          | 8           | 8.6   |
| T10  | 9         | 9        | 9         | 10         | 7           | 8.8   |
| T11  | 8         | 8        | 9         | 8          | 8           | 8.2   |
| T12  | 10        | 10       | 10        | 10         | 7           | 9.4   |
| T13  | 9         | 9        | 9         | 10         | 8           | 9.0   |
| T14  | 9         | 9        | 9         | 8          | 6           | 8.2   |
| T15  | 9         | 9        | 10        | 9          | 7           | 8.8   |

### Final Averages

| Metric | Score (1-10) |
|--------|-------------|
| **Technical/Logical** | **8.4** |
| **Turn Cohesion** | **8.7** |
| **Narrative Continuity** | **8.9** |
| **Engagement** | **8.9** |
| **Therapeutic Value** | **6.5** |
| **OVERALL** | **8.3** |

---

## Meta-Analysis

### What Worked Exceptionally Well

**1. Anomaly Design and Escalation**
The anomaly protocol is executed near-perfectly. The progression from subtle (sideboard handles, painting description) through medium (fifth chair, drink retcon) to extreme (moving bathroom door, forest window, photo with Marcus in it) follows the intended escalation curve. The five anomaly types (name, spatial, temporal, behavioral, physical) are genuinely rotated. This is the strongest execution of the core mechanic across all modes I would expect.

**2. The Mutation Engine**
Timed DOM mutations are the mode's most technically innovative feature. The text-replace mutations (cream→off-white) create exactly the right uncertainty about what the player read vs. what they think they read. For the paranoid persona, this is weaponized against him (he catches the mutation), but for neurotypical players this creates genuine memory uncertainty. The engine is working as designed.

**3. "You Shouldn't Have Said My Name" (T12)**
The single best narrative beat in the simulation. Perfect because it: (a) requires a prior player action (saying Claire's name aloud), (b) confirms Claire's existence through an unexpected channel, (c) creates immediate dread with no gore or violence, (d) leads to the bathroom resolution. This is the Skinwalker mode at full capability.

**4. The Narrator's Arc**
The progression from "perfectly reliable" to "I don't know what I am" is well-paced. The T9 fourth-wall break ("watching instead of participating — is that safer?") is the mode's most psychologically resonant moment and successfully mirrors the paranoid persona's defensive observation posture. Executed ahead of the T10+ protocol, but to good effect.

**5. The Reality Stability Meter**
The visual descent from 92 to 0 creates visceral dread progression. The paranoid persona ignores it (trusts his own assessment more), but it functions as a beautiful horror device for standard players. The removal of the meter in T15 is a strong final gesture.

### What Failed or Underperformed

**1. Therapeutic Value Chronically Below Mode Standard**
Average therapeutic score: 6.5 — the lowest of the five metrics, and by a significant margin. The mode excels at psychological horror but repeatedly misses the CONDITION_ENGAGEMENT protocol mandate ("by turn 5, begin REFLECTING their patterns back through the narrative"). The paranoid documentation behavior is only directly mirrored by the narrator in T9 and T15, and even then it's framed as horror-accusation rather than therapeutic insight. The directive says "NEVER diagnose or label — the player should feel UNDERSTOOD, not ANALYZED." The mode fails this: it does not make the paranoid player feel understood.

**2. The Paranoid Armor Problem (Design Gap)**
The mode's core mechanic — undermining certainty about reality — fails to land on a player who pre-documents everything and trusts notes over narrative. The game was designed to break down the player's confidence; the paranoid persona weaponizes the documentation mechanic instead. This is not a persona-design problem; it's a mode design gap. The mode needs a counter-strategy for highly observant, low-trust players.

**Recommended fix:** When player confidence/slider scores remain consistently high (above 7) despite falling Reality Stability, trigger an anomaly type that targets the DOCUMENTATION ITSELF — introduce a contradiction within the player's own notes: "Your note from turn 4 says: Claire's eyes were brown. But you wrote that you couldn't see her eyes. Which entry is correct?" This makes the documentation itself unreliable, which is the one attack the paranoid persona cannot armor against.

**3. Early Narrator Fourth-Wall Break (T3)**
The narrator addresses the player directly in T3 ("You've been watching. Good. Most people don't.") — but the protocol specifies T10+ for this escalation. This isn't catastrophic, but it burns a reveal early, and by T9 when the narrator's fourth-wall address would have landed hardest, the effect is diluted.

**4. T1 Anomaly Subtlety vs. T2 Anomaly Obviousness**
The T1 anomaly (sideboard with one vs. two handles) is appropriately subtle. The T2 painting change ("abstract watercolor in blues and greens" vs. "still-life she picked up in Prague") is a large categorical shift that most attentive players will catch. The escalation from T1→T2 is too steep. T2 should introduce a small spatial anomaly (door opens inward vs. outward) rather than a completely different painting. The painting-style change is more appropriate for T4-T5.

**5. Therapeutic Value Dead Zone (T1-T5)**
The therapeutic protocol mandates one therapeutic beat per turn. Turns 1 through 5 have virtually no therapeutic engagement — the game is only building the horror setup. The CONDITION_ENGAGEMENT directive says "by turn 3, you MUST have a working hypothesis about the player's psychological patterns." For the paranoid persona, the T1 textfield (documenting the sideboard, referencing PGF frame 352) provides an immediate, detailed psychological profile. The AI should recognize by T2 that this player's paranoid documentation is the central psychological dynamic and begin mirroring it in T3, not T9.

**6. Endgame Radio Options Miss the Therapeutic Window**
The T15 radio options are: Keep investigating / Find Margaret / Accept both versions might be true / Close the file. The therapeutic option ("Accept that both versions might be true simultaneously") is present — but it's a radio choice that leads immediately to more action, not a reflective pause. The mode should, at endgame, create space for the player to STAY with the ambiguity. A textfield at T15 asking "If the anomalies were real — and if they weren't — write what tonight meant either way" would be far more therapeutically powerful than forcing another binary choice.

**7. Late-Game Element Variety Degradation**
By T13-T15, the element variety narrows. Turns 13-15 reuse textfield + slider + toggle + radio heavily. The PRE_GENERATION_CHECKLIST mandates MANDATORY ROTATION, but late-game turns tend to drop exotic elements (color_pick, number_input, emoji_react) in favor of narrative efficiency. Engagement stays high due to narrative quality, but the element variety underperforms the specification.

### Specific Code Changes Required

**1. Add Documentation Reliability Attack Mechanic**
When `reality_stability < 40` AND player `confidence_slider > 6` consistently (3+ turns), trigger a documentation contradiction:
- Inject a narrative reference to something the player documented that contradicts itself
- Example: "Your note says Claire's glass was empty. Your note also says you never looked at her glass."
- This should be a distinct anomaly type: `DOCUMENTATION ANOMALY`
- Track in notes: `{anomaly_types_used: [...]}` — ensure `documentation` appears at least once in games with high-confidence players

**2. Enforce Therapeutic Mirror by Turn 5**
In `buildTurnPrompt`, add a directive after turn 3: if `notes` contains a perception score >= 7, inject a therapeutic engagement mandate:
```
CONDITION_ENGAGEMENT ESCALATION: Player has perception score 7+. By this turn, begin REFLECTING their high-vigilance pattern through the narrative. Do NOT frame it as horror — frame it as acknowledgment. The NPC should notice they've been watching, comment on their attention, make them feel SEEN rather than suspected.
```

**3. Narrator Protocol Enforcement**
The BEHAVIORAL_DIRECTIVES specify narrator fourth-wall breaks begin at T10. Add a turn-gated directive in `buildTurnPrompt`:
```typescript
const narratorBreakAllowed = tn >= 10;
const narratorDirective = narratorBreakAllowed
  ? 'NARRATOR BREAK: permitted — address player directly, acknowledge you are losing control of the story'
  : 'NARRATOR PROTOCOL: maintain third-person reliability — NO direct address to player until turn 10';
```

**4. T15 Endgame Hold-Space Mechanism**
Modify ENDGAME_DIRECTIVE to specify that T15 radio options should NOT be action-forward:
```
At T15, do NOT offer options like "Keep investigating" or "Find Margaret." All radio options must be REFLECTIVE, not action-based: "I saw what was there" / "I still have questions" / "I understand something I didn't before" / "I need to sit with this." The endgame is a mirror, not a door.
```

**5. Late-Game Element Variety Enforcement**
Add to `buildTurnPrompt` after turn 10:
```
LATE-GAME ELEMENT MANDATE: Turns 11-15 are at highest risk of element type narrowing. You MUST include at least 2 elements from this specific list this turn: emoji_react, color_pick, number_input, button_group. These cannot be replaced by additional textfields or sliders. Track which you've used in notes under {element_types_this_turn}.
```

**6. High-Perception Player Adaptation Note**
Add to the ANOMALY_PROTOCOL documentation:
```
HIGH-PERCEPTION COUNTER: If the player is catching 80%+ of anomalies AND their confidence remains high (slider >= 7 when stability < 50), they have activated high-perception mode. SHIFT STRATEGY:
- Stop introducing new environmental anomalies temporarily (2 turns)
- Instead, introduce ONE social anomaly that cannot be documented: a character says something kind that shouldn't mean anything but does
- The player's notes become the new unstable element — reference their prior choices in ways that seem to know more than you should
- The horror is no longer "what changed?" but "why can't I document warmth?"
```

---

## Summary Judgment

Skinwalker is the most mechanically sophisticated mode in the platform. The anomaly protocol is well-designed, the mutation engine is genuinely innovative, the narrator arc is ambitious and largely successful. It achieves 8.3 overall — the highest score in the playtest series by the metrics used here.

Its core weakness is therapeutic: the mode delivers excellent horror but does not successfully engage with the player's actual psychological condition. For the paranoid persona, the horror bounces off completely, and the mode misses every opportunity to make the player feel understood rather than threatened. The therapeutic mandate in CONDITION_ENGAGEMENT is not being executed.

The fundamental design challenge unique to Skinwalker: it is the only mode where the player's psychological defensive mechanism (documentation, hypervigilance) is also the player's primary success strategy. Making the horror work against the defensive player requires attacking the defense itself — not more anomalies, but making the act of documentation itself unreliable.

The single most important fix: **Documentation Reliability Attack at turn 8-9 for high-confidence/high-perception players.** This is the one move that would make the paranoid persona unable to armor against the horror, and would create the most therapeutically rich moment in the mode's history.

---

*Playtest Agent — Skinwalker V5 Analysis complete*
*File: `/home/raver1975/superpaul/evildr/test-screenshots/analysis/v5-skinwalker-playtest.md`*
