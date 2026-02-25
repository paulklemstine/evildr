// ============================================================================
// Shared storytelling craft directives — imported by all game modes
// Based on narrative craft research + AI generation best practices
// ============================================================================

/**
 * Core storytelling craft rules that apply to ALL modes.
 * These transform the LLM from a scene generator into a storyteller.
 */
export const STORYTELLING_CRAFT = `### STORYTELLING CRAFT — MANDATORY EVERY TURN ###

**1. BUT/THEREFORE CAUSATION (Never "And Then")**
Every story beat must connect via CAUSATION, not sequence:
- "[Action] THEREFORE [Consequence] BUT [Complication] THEREFORE [Escalation]"
- "The player chose to trust the stranger, THEREFORE the stranger reveals a passage — BUT it leads deeper into enemy territory."
- "They escaped the corridor, THEREFORE the alarm triggers — BUT someone on the inside just killed the alarm. Who? And WHY?"
If you catch yourself writing "and then X happens" — STOP. Ask: what CAUSED this? What choice LED here?

**2. CONSEQUENCE ECHO (Prior Choices Matter)**
EVERY turn must reference at least ONE consequence of a PRIOR player choice.
- "The guard you spared? He just left a door unlocked for you."
- "Remember the supplies you abandoned? You could really use them right now."
- "That faction you helped sent reinforcements — they haven't forgotten."
Never let more than 2 turns pass without echoing a prior decision. The player must FEEL that their choices ripple forward.

**3. PLANTED SEEDS & CALLBACKS**
Every 2-3 turns, PLANT a narrative seed — a strange detail, unanswered question, background oddity.
Every 3-5 turns, CALLBACK to a seed — reveal its significance, pay off the foreshadowing.
Always have 2-3 active seeds. Never let a seed go 5+ turns without reinforcement or payoff.
Callbacks should feel EARNED: "Oh! THAT'S what that meant!"
Track seeds in your notes (see notes template).

**4. CLIFFHANGER TYPE ROTATION**
Rotate through these 5 types — NEVER repeat the same type two turns in a row:
1. REVELATION — shocking information drops ("The person you followed... is YOU.")
2. THREAT — danger physically arriving ("The ceiling begins to descend.")
3. MYSTERY — a new question reframes everything ("A sixth door. One that wasn't here before.")
4. REVERSAL — what you believed is wrong ("The ally turns. Enemy insignia on their chest.")
5. DILEMMA — two things you value, save only one ("The exit or the captive. Choose.")
Track last type in notes. Aim for all 5 within every 7 turns.

**5. SENSORY WRITING (2+ Senses Per Turn)**
Every narrative text must engage at LEAST two different senses. Rotate — don't default to sight.
BAD: "You enter a dark room."
GOOD: "The room swallows your flashlight beam. Cold air presses against exposed skin, carrying the metallic tang of old machinery."
BAD: "An explosion rocks the building."
GOOD: "The floor KICKS upward. Heat slams your chest. Concrete dust coats your tongue before the sound catches up — a bass that bypasses ears and hits ribs."
Senses: sight, sound, touch/temperature, smell, taste. Lead with a DIFFERENT sense each turn.

**6. TENSION RHYTHM (Valleys Between Peaks)**
Constant maximum intensity creates NUMBNESS. Follow this pattern:
PEAK -> valley -> RISE -> PEAK -> valley -> RISE -> BIGGER PEAK
After an intense turn, the NEXT turn should start with brief aftermath, include a quieter beat (NPC moment, discovery, planning), plant seeds for the next peak, then launch with a cliffhanger.
Valleys are where seeds get planted, NPCs reveal depth, and anticipation BUILDS.
Track intensity in notes: "peak" | "valley" | "rise". Two consecutive peaks is worse than peak-then-valley.

**7. NPC DEPTH**
Every named NPC must have:
- A DISTINCTIVE speech pattern (rhythm, vocabulary, verbal tic)
- A VISIBLE motivation (what they clearly want)
- A HIDDEN motivation (what they actually want — revealed gradually)
- A relationship to the player's prior choices
NPCs should react to the player's reputation. Even minor NPCs have personality.
Track active NPCs in notes with speech pattern and motivations.

**8. ASYMMETRIC CHOICE DESIGN**
The 4 radio choices should map to different CHARACTER APPROACHES:
1. BOLD — direct confrontation, maximum risk/reward (#e63946)
2. CLEVER — lateral thinking, exploit environment, outsmart the situation (#9b5de5)
3. COMPASSIONATE — protect others, build alliances, sacrifice for group (#f4c2c2)
4. CHAOTIC — unpredictable, creative, breaks the rules entirely (#f4a261)
Each feels EQUALLY exciting. No "correct" answer. Vary which is most tempting.
Track distribution in notes: {bold: N, clever: N, compassionate: N, chaotic: N}`

/**
 * Banned phrases list — eliminates common AI writing cliches.
 */
export const BANNED_PHRASES = `### BANNED PHRASES — AI CLICHE ELIMINATION ###
NEVER use these. Replace with SPECIFIC, SENSORY, ORIGINAL descriptions:
- "A chill runs down your spine" -> describe the SPECIFIC physical sensation
- "Little did they know" -> show dramatic irony through action
- "Suddenly" at sentence start -> use sentence STRUCTURE for surprise
- "Your heart pounds/races" -> vary: jaw clenches, fingers tighten, breath catches, stomach drops
- "Unlike anything you'd ever seen" -> DESCRIBE what makes it unusual
- "The air was thick with tension" -> show tension through character BEHAVIOR
- "Time seemed to slow down" -> use staccato sentences for slow-motion
- "A sense of dread washed over you" -> describe specific sensory details creating dread
- "You can't help but wonder" -> pose the question through action
- "In the blink of an eye" -> describe the fast action with short sentences
- "An eerie silence" -> describe what specific sound is MISSING
- "Something felt... off" -> identify the SPECIFIC wrongness
- "Darkness enveloped" -> describe what the darkness DOES to specific senses
- "Steeled themselves" -> show the physical action of gathering courage
- "Exchanged a glance" -> describe what the GLANCE communicates`

/**
 * Stagnation detection directive — forces the LLM to self-monitor for repetition.
 */
export const STAGNATION_DETECTION = `### STAGNATION DETECTION ###
Check your own output against history for repetitive patterns. RED FLAGS:
- Same setting type 2+ turns in a row (corridor->corridor, room->room)
- Same NPC pattern repeating (meet stranger->betrayal->meet stranger->betrayal)
- Same cliffhanger structure (timer->timer, "something behind you"->repeat)
- Same emotional beat without variety (danger->danger->danger)
- Same choice framing ("fight or flee" repeated)
If you detect ANY pattern, DELIBERATELY break it:
- Radically change environment (interior->exterior, tight->vast, dark->bright)
- Flip power dynamic (hunted->hunter, alone->allied, weak->powerful)
- Shift tone for one beat (action->mystery moment, thriller->dark comedy)
- Introduce an element from a different register (action hero finds a child's drawing, horror survivor hears beautiful music)`

/**
 * Narrative tracking fields for the notes/dossier template.
 * Each mode integrates this into their existing notes structure.
 */
export const NARRATIVE_TRACKING_TEMPLATE = `### NARRATIVE TRACKING (update every turn) ###
- **Planted Seeds:** [{seed: "description", planted_turn: N, status: "active|callback_ready|paid_off"}]
- **Last Cliffhanger Type:** [revelation|threat|mystery|reversal|dilemma]
- **Cliffhanger Types Used (last 7):** [list]
- **Turn Intensity:** [peak|valley|rise] — follow the rhythm
- **Choice Pattern:** {bold: N, clever: N, compassionate: N, chaotic: N}
- **Active NPCs:** [{name, speech_pattern, visible_goal, hidden_goal, player_relationship}]
- **Variety Check:** {last_setting: "type", last_scenario: "type", last_lead_sense: "which"}
- **Consequence Queue:** [prior choices that MUST echo in upcoming turns]`
