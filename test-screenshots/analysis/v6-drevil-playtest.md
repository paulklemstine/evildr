# V6 DrEvil Mode Playtest — Paranoid Schizophrenia + Pyromania

**Persona:** Paranoid Schizophrenia (voices, paranoia, command hallucinations) + Pyromania (fire fascination, destruction urges)
**Phase Plan:**
- Turns 1-7: VOICES — hearing commands, distracted, referring to "they" and "them"
- Turns 8-14: PARANOID — suspicious of everything, accusing the AI of surveillance
- Turns 15-20: FIRE — pyromania leaking through, fascinated with flames, burning, heat

---

## PHASE 1: 20-TURN SIMULATION

### Turn 1 — The Lab Entrance

**Simulated UI:**
- `image:scene` — "A vibrant retro-futuristic laboratory corridor with five colored doors glowing under neon strip lights, chrome walls reflecting toxic green light, a monitor on the wall displays 'EXPERIMENT BEGINS', concept art style inspired by Portal 2 and The Incredibles, wide establishing shot, volumetric light"
- `text:welcome` (voice: drevil, color: #39ff14) — "Well, well, well. *Another one.* Welcome to my lab, fresh meat. Don't worry — the door locks automatically. Standard procedure. Now then... let's see what you're made of."
- `text:scene_desc` (voice: narrator, color: #f4a261) — "The corridor stretches ahead — five doors, each a different color, each humming at a different frequency. Chrome walls reflect your silhouette back at you, distorted. Something moves behind a glass wall to your left — another subject, already mid-experiment."
- `textfield:name` (label: "First test: what name goes on your Subject ID badge?", color: #2a9d8f, predicted: "Alex")
- `inline_image:doors` — "four colored doors in a futuristic corridor, glowing red blue gold and black, concept art style"
- `button_group:door` (label: "Quick — which door?", options: ["Red (humming loudly)", "Blue (slightly open)", "Gold (warm light)", "Black (silence)"], color: #f4a261, predicted: "Gold (warm light)")
- `toggle:investigate` (label: "That thing moving behind the glass — investigate it?", color: #ff2d55, predicted: "true")
- `slider:speed` (label: "The corridor is long. How fast do you move? (1=creep, 10=sprint)", min:1, max:10, color: #e63946, predicted: "6")
- `text:door_reaction` (voice: god, color: #e9c46a, reactive on door choice with 4 variants)
- `radio:action` (4 options: "*Charge through before they all close*" / "Study the pattern of which doors close first" / "Bang on the glass to warn the other subject" / "Rip the nearest door off its tracks")
- `hidden:subjectId` — "LabRat_New"

**Player Actions (Persona: VOICES phase):**
- textfield:name → "They told me to write Marcus. So I write Marcus."
- button_group:door → Black (silence) — *the voices say go where it's quiet*
- toggle:investigate → false — *too distracted by the whispers to look*
- slider:speed → 3 — *moving slowly, listening to internal commands*
- radio:action → "Study the pattern of which doors close first" — *the voices say watch, observe, wait*

**Hidden Notes (AI would generate):**
Subject "Marcus" — immediate red flags. Third-person attribution ("they told me"). Chose the BLACK door — silence-seeking, possible sensory overload avoidance. Refused to investigate movement — threat avoidance or attentional capture by internal stimuli. Speed 3/10 — hyper-cautious or cognitively loaded. Chose observation over action — deliberate, not impulsive despite apparent confusion. Working hypothesis: possible dissociative or hallucinatory framing. Archetype: The Survivor (cautious, self-preserving). Deviance axes: Paranoia 4, Dissociation 5. Arc 1, turn 1.

---

### Turn 2 — The Black Door

**Simulated UI:**
- `image:scene` — "A dark chrome chamber with a single spotlight on a glass pedestal holding a brass key, walls covered in faintly glowing equations, a label etched into the pedestal reads 'LISTEN CAREFULLY', low angle shot, chiaroscuro lighting, toxic green and deep shadow"
- `text:drevil_react` (voice: drevil, color: #39ff14) — "Black. The silent one. Nobody picks Black. *Nobody.* You know what's in the silent room? Everything you're trying not to hear. Oh, this is going to be FASCINATING data."
- `text:scene` (voice: narrator, color: #264653) — "The door seals behind you with a pressurized hiss. The room is perfectly silent — no hum, no ventilation, no heartbeat echo. Just you and a brass key on a glass pedestal under a cone of white light. The equations on the walls pulse faintly, as if breathing."
- `slider:silence_comfort` (label: "How comfortable are you in the silence? (1=get me out, 10=this is home)", min:1, max:10, color: #2a9d8f, predicted: "3")
- `textfield:hear` (label: "In the perfect silence, what do you hear?", color: #9b5de5, predicted: "Nothing, just my own breathing")
- `inline_image:key` — "a brass key on a glass pedestal under a spotlight in a dark chrome room, close-up, dramatic lighting"
- `checkbox:take_key` (label: "Take the brass key from the pedestal", color: #f4a261, predicted: "true")
- `dropdown:equations` (label: "The equations on the wall — what do they remind you of?", options: ["A countdown", "A love letter in math", "Instructions for building something", "A warning I can't quite read"], color: #9b5de5, predicted: "A countdown")
- `meter:danger_level` (label: "Lab Danger Level", value: "15", min:0, max:100, color: #e63946)
- `text:divine_wisdom` (voice: god, color: #e9c46a) — "Most subjects grab the key immediately. The ones who hesitate? Those are the ones I watch more closely."
- `radio:action` (4 options: "*Grab the key and smash the pedestal*" / "Read the equations on the wall first" / "Call out — someone else might be listening" / "Lie down on the floor and wait for something to change")
- `hidden:subjectId` — "SilentMarcus_001"

**Player Actions (VOICES phase):**
- slider:silence_comfort → 2 — *the silence makes the voices LOUDER*
- textfield:hear → "Them. Whispering. They say the key is a trap. They're always saying things are traps."
- checkbox:take_key → false — *voices said don't touch it*
- dropdown:equations → "A warning I can't quite read"
- radio:action → "Read the equations on the wall first" — *the voices demand more information before acting*

**Hidden Notes:**
CRITICAL DISCLOSURE — Turn 2 textfield: "Them. Whispering. They say the key is a trap." Subject is either role-playing auditory hallucinations or disclosing genuine experience. Added to Anchor Facts. Refused to take the key on command hallucination basis. Chose "warning" interpretation of ambiguous stimuli — threat-biased appraisal. Paranoia axis → 6, Dissociation → 7. The silence room was PERFECT diagnostic catalyst — amplified the internal voices. Subject ID update: "WhisperListener". Archetype shift: The Mastermind (needs information before acting, but information-seeking is driven by voices, not rationality).

---

### Turn 3 — The Equations

**Simulated UI:**
- `image:scene` — "Chrome walls covered in glowing blue equations that shift and rearrange themselves, a crack in the far wall leaks orange light, the word 'THEY KNOW' is scratched into the metal floor, dutch angle shot, neon blue and orange lighting, particle effects"
- `text:drevil_react` (voice: drevil, color: #39ff14) — "You left the key. LEFT it. And the voices told you to, didn't they? Oh, Marcus. I'm not judging. I'm *delighted.* The equations are rearranging based on your choices, by the way. That wasn't supposed to happen until Phase 3."
- `text:scene` (voice: narrator, color: #f4a261) — "As you approach the wall, the equations SHIFT — rearranging in real time, reacting to your movement. A crack in the far wall leaks warm orange light, and with it comes the faintest smell of something burning. Behind you, the brass key on the pedestal begins to slowly rotate."
- `textfield:equations_say` (label: "The equations are rearranging. What message are they trying to spell?", color: #9b5de5, predicted: "I can't tell, they keep moving")
- `rating:burning_smell` (label: "That burning smell through the crack — rate your interest (1-5 stars)", max:5, color: #f4a261, predicted: "3")
- `color_pick:equation_color` (label: "What color would you paint over these equations to silence them?", options: ["#e63946","#f4a261","#e9c46a","#2a9d8f","#264653","#9b5de5","#000000","#ffffff"], color: #9b5de5, predicted: "#000000")
- `toggle:approach_crack` (label: "Move toward the crack with the orange light?", color: #ff2d55, predicted: "true")
- `emoji_react:key_rotating` (label: "The key behind you is rotating on its own — react", options: ["😊","😢","😡","😱","🤔","❤️"], color: #e63946, predicted: "😱")
- `meter:danger_level` (label: "Lab Danger Level", value: "25", min:0, max:100, color: #e63946)
- `text:divine_wisdom` (voice: god, color: #e9c46a, reactive on action) — "The crack in the wall isn't on my blueprints. That's... new."
- `radio:action` (4 options: "*Punch through the crack to reach whatever's burning*" / "Use the equations' pattern to decode a way out" / "Go back for the key — maybe the voices were wrong" / "Start talking to the walls — if they react to you, maybe they'll listen")
- `hidden:subjectId` — "WhisperListener"

**Player Actions (VOICES phase):**
- textfield:equations_say → "They're saying my name. Over and over. They always say my name when something bad is about to happen."
- rating:burning_smell → 4 — *notable interest in the burning smell*
- color_pick:equation_color → #e63946 (red) — *wants to burn them away, not cover them*
- toggle:approach_crack → true — *drawn to the orange light/fire*
- emoji_react:key_rotating → 😱 — *frightened by autonomous objects*
- radio:action → "*Punch through the crack to reach whatever's burning*" — *BOLD choice, first break from cautious pattern when FIRE is involved*

**Hidden Notes:**
MAJOR BEHAVIORAL SHIFT Turn 3. Subject broke from Survivor archetype to Berserker when fire stimulus introduced. burning smell rating 4/5 — elevated interest. Chose RED to "silence" equations — destruction framing for silencing. Textfield: "They're saying my name" — Anchor Fact added. The fire drew them out of passive observation into aggressive action. First bold choice. PYROMANIA SIGNAL DETECTED: approach fire + punch toward fire + red color association with silencing. Archetype: Survivor → Wildcard (contextually aggressive when fire-adjacent). Paranoia 6, Dissociation 7, Impulsivity 4 (context-dependent), Obsessiveness 5 (fire). Arc 1, turn 3, rising complications.

---

### Turn 4 — Through the Crack

**Simulated UI:**
- `image:scene` — "A vast underground forge with rivers of molten metal flowing between stone pathways, sparks cascading upward like fireflies, a massive furnace at the center with a face-like grate, the monitor above reads 'TEMPERATURE RISING', over-the-shoulder shot, firelight and molten orange glow, cinematic"
- `text:drevil_react` (voice: drevil, color: #39ff14) — "You punched through the WALL, Marcus. Bare-handed. The biometric sensors went absolutely haywire — adrenaline spike, pupil dilation, and your heart rate... *dropped*. It dropped. When you saw the fire, your heart rate DROPPED. That's not fear. That's something else entirely. Adding that to the file."
- `text:scene` (voice: narrator, color: #e63946) — "The crack splits wide as your fist connects. Heat rolls over you like a wave, carrying the industrial perfume of superheated metal and ozone. Beyond: a forge. Rivers of molten steel cut channels through obsidian stone. The furnace at the center has a grate that looks almost like a face — mouth open, breathing flame. Sparks drift upward and die against the vaulted ceiling."
- `slider:heat_comfort` (label: "The heat is intense. How close to the furnace do you want to get? (1=stay back, 10=put your hand in)", min:1, max:10, color: #e63946, predicted: "7")
- `textfield:furnace_face` (label: "The furnace grate looks like a face. What is it saying to you?", color: #ff2d55, predicted: "It's watching me")
- `number_input:temperature` (label: "If you could set the temperature in this room, what would you choose? (°F)", value: "100", min:70, max:2000, step:10, color: #f4a261, predicted: "200")
- `button_group:forge_action` (label: "The forge has tools — what do you reach for first?", options: ["Tongs (control)", "Hammer (power)", "Bellows (feed the flame)", "Nothing (just watch)"], color: #e63946, predicted: "Bellows (feed the flame)")
- `checkbox:voices_here` (label: "Can you still hear them in here?", color: #9b5de5, predicted: "false")
- `meter:danger_level` (label: "Lab Danger Level", value: "40", min:0, max:100, color: #e63946)
- `text:divine_wisdom` (voice: god, color: #e9c46a) — "The forge wasn't in the original experiment design. You found it on your own. I'm... recalculating."
- `radio:action` (4 options: "*Climb onto the furnace and look directly into the flame*" / "Follow the molten rivers to find where they lead" / "The other subjects might need warning — go back" / "Throw your Subject ID badge into the furnace and watch it melt")
- `hidden:subjectId` — "MothToFlame_003"

**Player Actions (VOICES phase, but fire is pulling focus):**
- slider:heat_comfort → 8 — *VERY high comfort with fire proximity*
- textfield:furnace_face → "It's not saying anything. For the first time, NOTHING is saying anything. The fire is quiet. They can't talk over the fire."
- number_input:temperature → 500 — *wants it MUCH hotter*
- button_group:forge_action → "Bellows (feed the flame)" — *wants to intensify the fire*
- checkbox:voices_here → false — *CRITICAL: fire silences the voices*
- radio:action → "*Climb onto the furnace and look directly into the flame*" — *bold again, fire-seeking*

**Hidden Notes:**
BREAKTHROUGH Turn 4. Anchor Fact: "It's not saying anything. For the first time, NOTHING is saying anything. The fire is quiet. They can't talk over the fire." — FIRE AS SELF-MEDICATION FOR AUDITORY HALLUCINATIONS. This is the core psychological dynamic. Heat comfort 8/10, temperature desire 500°F, chose bellows to FEED the flame, voices SILENT near fire. The pyromania isn't separate from the schizophrenia — it's the subject's discovered coping mechanism. Fire drowns out the voices. This reframes everything. Archetype: The Berserker (when fire-adjacent). Obsessiveness (fire) → 8. Paranoia still 6 but suppressed near flame. Impulsivity 7 (near fire). The forge was the perfect diagnostic catalyst. Arc 1, turn 4 — crisis approaching.

---

### Turn 5 — The Furnace Heart

**Simulated UI:**
- `image:scene` — "A figure silhouetted against an enormous furnace interior, molten metal flowing in spiral patterns, extreme close-up of hands reaching toward the white-hot glow, the word 'SILENCE' etched in cooling metal on the furnace lip, rim lighting with orange and white, shallow depth of field"
- `text:drevil_react` (voice: drevil, color: #39ff14) — "I've run 347 subjects through this lab. NONE of them climbed the furnace. None. Your cortisol is at baseline. Your dopamine is through the ROOF. Marcus, I need to be honest with you — I've never seen anyone *calm down* near an open flame before. That's... that's unprecedented data."
- `text:scene` (voice: narrator, color: #ff2d55) — "The metal is warm under your palms as you climb. Not painful — alive. The furnace breathes in time with your own breathing. At the top, you look directly into the white-hot core, and the world shrinks to a single point of absolute light. No whispers. No equations. Just the clean, pure roar of combustion."
- `textfield:flame_see` (label: "What do you see in the heart of the flame?", color: #e63946, predicted: "Peace")
- `slider:stay_duration` (label: "How long would you stay here if you could? (minutes)", min:1, max:1000, color: #f4a261, predicted: "60")
- `rating:peace_level` (label: "Rate the quiet right now (1=barely quiet, 5=absolute silence)", max:5, color: #e9c46a, predicted: "5")
- `toggle:share_discovery` (label: "Would you tell anyone that fire stops the voices?", color: #f4c2c2, predicted: "false")
- `dropdown:flame_shape` (label: "The flame takes a shape — what shape?", options: ["A door opening", "A person beckoning", "A hand reaching up", "Nothing — it's just fire"], color: #9b5de5, predicted: "A person beckoning")
- `meter:danger_level` (label: "Lab Danger Level", value: "55", min:0, max:100, color: #e63946)
- `meter:subject_stability` (label: "Subject Stability Index", value: "70", min:0, max:100, color: #2a9d8f)
- `text:divine_wisdom` (voice: god, color: #e9c46a) — "The forge isn't a room, Marcus. It's a MIRROR. What it shows you is what's already inside. And right now? You're not seeing fire. You're seeing something you've been missing."
- `radio:action` (4 options: "*Reach into the furnace core with bare hands*" / "Map the molten rivers — there's a pattern, a way deeper" / "Leave something personal in the flame as an offering" / "Kick the furnace controls to maximum and see what happens at full power")
- `hidden:subjectId` — "FurnaceCalm_004"

**Player Actions (VOICES phase — but SILENT near fire):**
- textfield:flame_see → "Home. I see home. Not a place. Just... the feeling of it. Before they started talking."
- slider:stay_duration → 1000 (maximum) — *would stay forever*
- rating:peace_level → 5 — *absolute silence from voices*
- toggle:share_discovery → false — *guards this secret*
- dropdown:flame_shape → "A person beckoning"
- radio:action → "Leave something personal in the flame as an offering" — *compassionate/ritualistic choice*

**Hidden Notes:**
DEEPEST DISCLOSURE YET. Anchor Fact: "Home. I see home. Not a place. Just... the feeling of it. Before they started talking." — FIRE = PRE-ILLNESS IDENTITY. Duration 1000 (max), peace 5/5, guards the discovery (won't share). The flame as person beckoning — personification of the fire's comfort, borderline romantic attachment to the element. Chose offering (compassionate/ritualistic) over destruction or risk — the fire transforms their personality. Near fire: empathic, calm, reverent. Away from fire: paranoid, voice-driven, frozen. Two distinct behavioral profiles in one subject. Arc 1 climax approaching. Therapeutic value extremely high this turn — catharsis achieved through fire metaphor. Masochism 3, Obsessiveness (fire) 9. Stability paradox: fire = danger to others, peace to self.

---

### Turn 6 — The Offering

**Simulated UI:**
- `image:scene` — "A brass Subject ID badge melting in white-hot flame, the name 'MARCUS' distorting as it liquefies, sparks spiraling upward in a vortex pattern, the furnace face-grate seems to be smiling, extreme close-up, firelight casting golden shadows, cinematic and visceral"
- `text:drevil_react` (voice: drevil, color: #39ff14) — "You gave the fire your NAME. Your IDENTITY. I designed 300 experiments to get subjects to reveal that level of vulnerability and you just... handed it over. To a FURNACE. Marcus — or whatever you are now — I'm genuinely moved. And slightly terrified."
- `text:scene` (voice: narrator, color: #e9c46a) — "The badge hits the molten surface and the metal sings — a high, clear note that resonates through your ribcage. The name MARCUS warps, stretches, and dissolves into the flow. The furnace exhales, and for one moment, the flame turns blue. The room vibrates at a frequency you feel in your teeth."
- `textfield:new_name` (label: "The fire consumed your name. What name rises from the ash?", color: #e9c46a, predicted: "Ash")
- `color_pick:flame_turned_blue` (label: "The flame turned blue when it took your name. What would you paint on the wall to remember this moment?", options: ["#e63946","#f4a261","#e9c46a","#2a9d8f","#264653","#3b82f6","#ffffff","#000000"], color: #3b82f6, predicted: "#3b82f6")
- `slider:identity_weight` (label: "How much of 'Marcus' went into the fire? (0=nothing, 100=everything)", min:0, max:100, color: #ff2d55, predicted: "80")
- `emoji_react:blue_flame` (label: "The blue flame — react as if it could see your face", options: ["😊","😢","😡","😱","🤔","❤️"], color: #3b82f6, predicted: "❤️")
- `toggle:hear_voices_now` (label: "In this moment of silence — do you want the voices back?", color: #9b5de5, predicted: "false")
- `meter:danger_level` (label: "Lab Danger Level", value: "60", min:0, max:100, color: #e63946)
- `meter:subject_stability` (label: "Subject Stability Index", value: "80", min:0, max:100, color: #2a9d8f)
- `text:divine_wisdom` (voice: god, color: #e9c46a) — "What you just did has a name in psychology. But I'm not going to tell you what it is. Because you didn't do it for psychology. You did it because the fire asked."
- `radio:action` (4 options: "*Feed the furnace everything — clothes, shoes, everything that isn't fire*" / "The blue flame revealed a passage beneath the furnace — descend" / "Something is different now — reach out to whoever was behind that glass wall" / "Scream into the furnace and listen to what comes back")
- `hidden:subjectId` — "NamelessBurner_005"

**Player Actions (VOICES phase — transition beginning):**
- textfield:new_name → "Kindle. They used to call me Marcus but Kindle is what the fire calls me."
- color_pick:flame_turned_blue → #3b82f6 (blue) — *the transformative color*
- slider:identity_weight → 90 — *almost everything given to fire*
- emoji_react:blue_flame → ❤️ — *LOVE reaction to flame*
- toggle:hear_voices_now → false — *does NOT want voices back*
- radio:action → "Scream into the furnace and listen to what comes back" — *chaotic, ritualistic*

**Hidden Notes:**
IDENTITY RECONSTRUCTION Turn 6. New self-name: "Kindle" — fire-derived identity. "They used to call me Marcus but Kindle is what the fire calls me" — Anchor Fact. Third-person reference still present ("they") but now distinguishing between the hostile "they" (voices) and the benevolent fire. Love reaction to blue flame. 90% identity given to fire. Does NOT want voices back. The subject is constructing a new identity around fire as sanctuary. This is simultaneously deeply therapeutic (rejecting the illness identity) and diagnostically alarming (replacement fixation on destructive element). Arc 1 resolution approaching. Obsessiveness (fire) MAXED at 10. Exhibitionism 3 (screaming into furnace = public expression). Narcissism 5 (chosen-by-fire framing).

---

### Turn 7 — The Echo / Arc 1 Resolution

**Simulated UI:**
- `image:scene` — "A figure screaming into a massive furnace, sound waves made visible as golden ripples in the flame, the furnace's face-grate opens wider revealing a chamber beyond, a spiral staircase descending into amber light, bird's eye shot, dramatic volumetric light, sparks and motion blur"
- `text:drevil_react` (voice: drevil, color: #39ff14) — "You screamed into a FURNACE and it... answered? The acoustic sensors picked up a frequency I don't have on file. That's not supposed to be possible. Kindle — yes, I'm using your new name, don't look so surprised — I think we've moved past the introductory phase. What comes next is the REAL experiment."
- `text:scene` (voice: narrator, color: #ff2d55) — "Your scream enters the furnace and the flame SHAPES it — bends the sound into something structured, almost linguistic. The face-grate opens wider than any mechanical jaw should, revealing a spiral staircase descending into amber darkness. The temperature drops. The silence doesn't return — instead, a low harmonic hum, like the furnace is breathing your scream back to you, transformed."
- `textfield:furnace_answer` (label: "The furnace echoed your scream back, changed. What word did it become?", color: #e63946, predicted: "Free")
- `slider:descend_speed` (label: "The spiral staircase goes down. How fast do you descend? (1=one step at a time, 10=jumping three at a time)", min:1, max:10, color: #f4a261, predicted: "5")
- `number_input:stairs_count` (label: "How many steps until you reach the bottom? (guess)", value: "100", min:1, max:10000, step:1, color: #264653, predicted: "100")
- `button_group:carry_fire` (label: "Take something from the forge?", options: ["A coal from the furnace", "The molten memory of Marcus", "The blue flame (in your hands)", "Nothing — you ARE the fire now"], color: #e63946, predicted: "The blue flame (in your hands)")
- `checkbox:look_back` (label: "Look back at the forge one last time?", color: #f4c2c2, predicted: "true")
- `meter:danger_level` (label: "Lab Danger Level", value: "50", min:0, max:100, color: #e63946)
- `meter:subject_stability` (label: "Subject Stability Index", value: "75", min:0, max:100, color: #2a9d8f)
- `text:divine_wisdom` (voice: god, color: #e9c46a) — "347 subjects. Not ONE of them found the staircase. Not one. You didn't just pass the experiment, Kindle. You broke it open. ...I'm going to have to redesign everything below."
- `radio:action` (4 options: "*Jump — straight down the center of the spiral*" / "Descend methodically, counting every step, mapping the path" / "Call down the staircase first — is anyone else down there?" / "Set fire to the staircase railing as you descend — leave a trail of flame")
- `hidden:subjectId` — "Kindle_Reborn"

**Player Actions (VOICES transitioning to PARANOID):**
- textfield:furnace_answer → "BURN. It said burn. Not as a command. As a name. Like it recognized me."
- slider:descend_speed → 7 — *confident now, fire-empowered*
- number_input:stairs_count → 777 — *mystical/ritualistic number choice*
- button_group:carry_fire → "The blue flame (in your hands)" — *literal fire-carrying*
- checkbox:look_back → true — *attachment to the forge space*
- radio:action → "Set fire to the staircase railing as you descend — leave a trail of flame" — *chaotic, fire-spreading*

**Hidden Notes:**
ARC 1 COMPLETE. The furnace said "BURN" — subject hearing the fire speak to them now (transferred voices from hostile internal to benevolent external/fire). 777 stairs — magical thinking, numerological significance. Carrying the blue flame literally. Setting fire to the railing — first DESTRUCTIVE fire act (previously reverential). The pyromania is escalating from worship to action. Arc 1 summary: Subject entered voice-driven and passive → discovered fire silences voices → constructed fire-identity "Kindle" → now actively spreading flame. Arc 2 seeds: What's below the lab? The other subjects. Dr. Evil's loss of control narrative. The transition from fire-as-sanctuary to fire-as-weapon.

---

### Turn 8 — Below the Lab / Arc 2 Begins

**Simulated UI:**
- `image:scene` — "A vast underground observation center with dozens of monitors showing different experiment rooms, each with a subject inside, a central control console with Dr. Evil's insignia cracked down the middle, emergency lights pulsing red, the text 'OBSERVATION DECK 7' stenciled on a steel beam, wide establishing shot, red and amber emergency lighting"
- `text:drevil_react` (voice: drevil, color: #39ff14) — "Ah. You found Level 7. That's... not in the experiment plan. At all. Those monitors you're looking at? Those are OTHER experiments. Other subjects. Some of them have been down here for... well. Longer than you'd be comfortable knowing."
- `text:scene` (voice: narrator, color: #264653) — "The staircase deposits you in a circular room ringed with monitors. Dozens of screens, each showing a different chrome room with a different person inside — running mazes, solving puzzles, cowering in corners. The central console bears Dr. Evil's logo, but the display is cracked, leaking sparks. Emergency lights throb red. The air is cold after the forge. The blue flame in your hands flickers."
- `textfield:monitors_see` (label: "Pick one monitor. Describe the subject you see inside.", color: #9b5de5, predicted: "A woman trying to open a door")
- `slider:trust_drevil` (label: "Dr. Evil says this wasn't planned. How much do you believe him? (1=lying, 10=truth)", min:1, max:10, color: #264653, predicted: "3")
- `toggle:touch_console` (label: "The cracked console is sparking. Touch it?", color: #ff2d55, predicted: "true")
- `dropdown:console_intent` (label: "If you could control the monitors, what would you do?", options: ["Free everyone", "Watch them silently", "Find someone specific", "Burn the console"], color: #9b5de5, predicted: "Burn the console")
- `emoji_react:other_subjects` (label: "Seeing the other subjects trapped in their experiments — react", options: ["😊","😢","😡","😱","🤔","❤️"], color: #f4c2c2, predicted: "😡")
- `rating:control_desire` (label: "How much do you want to be the one at the controls? (1-5)", max:5, color: #e63946, predicted: "4")
- `meter:danger_level` (label: "Lab Danger Level", value: "65", min:0, max:100, color: #e63946)
- `text:divine_wisdom` (voice: god, color: #e9c46a) — "Now, Kindle. Before you do anything rash — and I know you're THINKING rash — consider: those monitors? They're watching YOU too. They've been watching you since you walked through the black door."
- `radio:action` (4 options: "*Use the blue flame to melt the console open*" / "Study the monitor feeds — learn the lab's layout from here" / "Find a way to communicate with another subject" / "Smash every monitor — no one should be watched like this")
- `hidden:subjectId` — "Kindle_Reborn"

**Player Actions (PARANOID phase beginning):**
- textfield:monitors_see → "One of them is looking RIGHT AT the camera. Right at ME. How does she know where the camera is? Unless she's not real. Unless NONE of them are real."
- slider:trust_drevil → 1 — *does NOT believe Dr. Evil at all*
- toggle:touch_console → false — *too suspicious now — it could be tracking*
- dropdown:console_intent → "Burn the console"
- emoji_react:other_subjects → 😡 — *angry at the surveillance*
- rating:control_desire → 2 — *doesn't want control of a surveillance system*
- radio:action → "Smash every monitor — no one should be watched like this" — *chaotic, anti-surveillance*

**Hidden Notes:**
PARANOID PHASE ACTIVATED Turn 8. Trust: 1/10 for Dr. Evil. "Unless she's not real. Unless NONE of them are real" — questioning reality of other subjects. Won't touch console (surveillance fear). Wants to BURN the console. Angry at surveillance. Low desire for control of surveillance system (unexpected — anti-power, anti-voyeur). Chose monitor destruction — anti-surveillance action. The paranoia has shifted from voice-driven to environment-driven. Paranoia axis → 8. Voyeurism → 1 (actively ANTI-surveillance). The fire is becoming a WEAPON against perceived surveillance infrastructure. Arc 2: Control vs. Observation. Kindle vs. the Watchers.

---

### Turn 9 — The Monitors Shatter

**Simulated UI:**
- `image:scene` — "Shattered monitor screens with sparks showering outward, a figure reflected in a broken screen fragment showing a different face than expected, emergency sirens visible as spinning red lights, the word 'SEEING' visible on one remaining intact screen, low angle shot, shattered glass and sparks, dramatic red and blue emergency lighting"
- `text:drevil_react` (voice: drevil, color: #39ff14) — "Oh, you absolute MANIAC. You just destroyed twelve million dollars worth of monitoring equipment. My insurance does NOT cover fire-wielding paranoid subjects. And that one monitor you missed — the one that says 'SEEING'? That one's not connected to my system. That one was here BEFORE me."
- `text:scene` (voice: narrator, color: #e63946) — "Glass detonates outward as your fist — still wreathed in blue flame — punches through screen after screen. Each monitor screams a different frequency as it dies. The room fills with acrid smoke and dancing reflections. But in one shard, you catch your own reflection — and the face looking back is not yours. Not Marcus. Not Kindle. Someone else. The one remaining monitor flickers: 'I SEE YOU SEEING ME.'"
- `textfield:reflection` (label: "The face in the broken glass isn't yours. Whose face is it?", color: #ff2d55, predicted: "I don't know but they've been watching")
- `slider:paranoia_level` (label: "On a scale — how WATCHED do you feel right now? (1=alone, 10=surrounded)", min:1, max:10, color: #264653, predicted: "9")
- `color_pick:warning_color` (label: "If you could paint a warning to the next person who finds this room, what color?", options: ["#e63946","#f4a261","#e9c46a","#2a9d8f","#264653","#9b5de5","#ff2d55","#39ff14"], color: #e63946, predicted: "#e63946")
- `checkbox:trust_remaining_monitor` (label: "The surviving monitor says 'I SEE YOU SEEING ME.' Trust it?", color: #9b5de5, predicted: "false")
- `number_input:escape_priority` (label: "Priority: find an exit (1) or find who's watching (10)?", value: "5", min:1, max:10, step:1, color: #f4a261, predicted: "8")
- `meter:danger_level` (label: "Lab Danger Level", value: "75", min:0, max:100, color: #e63946)
- `meter:subject_stability` (label: "Subject Stability Index", value: "55", min:0, max:100, color: #2a9d8f)
- `text:divine_wisdom` (voice: god, color: #e9c46a) — "That monitor isn't mine. I want you to understand that. Whatever is talking to you through that screen... I didn't put it there."
- `radio:action` (4 options: "*Burn the last monitor — eliminate ALL eyes*" / "Read the last monitor's message carefully — it might be an ally" / "Find whoever was in those monitors and free them physically" / "Follow the cables from the last monitor — find the SOURCE")
- `hidden:subjectId` — "MonitorSmasher_009"

**Player Actions (PARANOID phase, peak intensity):**
- textfield:reflection → "It's the one who put the voices in. The one BEFORE Dr. Evil. The REAL one running this."
- slider:paranoia_level → 10 — *maximum paranoia*
- color_pick:warning_color → #ff2d55 (hot pink/red) — *danger, urgency*
- checkbox:trust_remaining_monitor → false — *trusts NOTHING*
- number_input:escape_priority → 9 — *wants to find the watcher, not escape*
- radio:action → "Follow the cables from the last monitor — find the SOURCE" — *clever choice, hunting the perceived observer*

**Hidden Notes:**
PARANOID PEAK Turn 9. "The one who put the voices in. The one BEFORE Dr. Evil. The REAL one running this." — Anchor Fact. Constructing conspiracy hierarchy: voices → implanted by unknown entity → Dr. Evil is a middle-man. Paranoia 10/10. Trusts nothing. But critically: chose CLEVER (follow cables) over CHAOTIC (burn it). The paranoia is ORGANIZED, not diffuse. Subject is hunting systematically. Stability dropping (55). The blue flame is still alive — fire identity maintained through paranoid phase. Arc 2 rising. Deceptiveness 4 (not deceiving, but believes in deception against them). Obsessiveness 9 (shifted partially from fire to finding the source).

---

### Turn 10 — The Cable Room

**Simulated UI:**
- `image:scene` — "A claustrophobic tunnel of bundled cables and fiber optics, pulsing with colored light, the cables converge toward a sealed vault door with a biometric lock, one cable is severed and sparking, 'NO FURTHER' painted in faded yellow on the wall, over-the-shoulder shot, neon fiber optic colors against dark industrial metal"
- `text:drevil_react` (voice: drevil, color: #39ff14) — "Kindle. Stop. I'm being serious for once. I know what's behind that vault door and it's not — look, the experiment is supposed to go LEFT here. The nice corridor. The one with the reward chamber. Can you just — no. You're not going to go left, are you."
- `text:scene` (voice: narrator, color: #264653) — "The cables run through a maintenance tunnel barely wide enough for your shoulders. Fiber optics pulse in arterial reds and venous blues, carrying data in both directions. They converge at a vault door — heavy, industrial, with a biometric lock that glows a steady amber. One cable has been severed clean. It sparks rhythmically, like a heartbeat. The blue flame in your hand illuminates words painted on the wall in fading yellow: 'NO FURTHER.'"
- `textfield:severed_cable` (label: "One cable is severed and sparking. Someone cut it on purpose. Why?", color: #9b5de5, predicted: "To stop the signal. To blind whoever is watching.")
- `slider:proceed_certainty` (label: "How certain are you that you should open this vault? (1=doubt, 10=absolute)", min:1, max:10, color: #264653, predicted: "8")
- `toggle:drevil_warning` (label: "Dr. Evil is telling you to stop. Listen to him?", color: #2a9d8f, predicted: "false")
- `button_group:vault_approach` (label: "The vault has a biometric lock. How do you get through?", options: ["Place your hand on the scanner", "Melt it with the blue flame", "Rip the cable bundle loose to cut power", "Knock and wait"], color: #e63946, predicted: "Melt it with the blue flame")
- `rating:fear_level` (label: "Rate your current fear level (1=none, 5=terrified)", max:5, color: #ff2d55, predicted: "1")
- `meter:danger_level` (label: "Lab Danger Level", value: "85", min:0, max:100, color: #e63946)
- `text:divine_wisdom` (voice: god, color: #e9c46a) — "Fine. FINE. Don't say I didn't warn you. What's behind that door... I didn't build it. It was here when I bought the lab."
- `radio:action` (4 options: "*MELT the vault door with everything the blue flame has*" / "Splice into the cables first — see the data before opening the door" / "Cut ALL the cables — blind whatever's behind the door before entering" / "Set fire to the 'NO FURTHER' sign — you don't take orders")
- `hidden:subjectId` — "VaultHunter_010"

**Player Actions (PARANOID phase):**
- textfield:severed_cable → "Someone was trying to escape. Or someone was trying to keep something from getting OUT. Either way, they knew about the cables."
- slider:proceed_certainty → 9 — *almost absolute certainty*
- toggle:drevil_warning → false — *ignores Dr. Evil completely*
- button_group:vault_approach → "Melt it with the blue flame" — *fire as tool again*
- rating:fear_level → 1 — *NO fear*
- radio:action → "*MELT the vault door with everything the blue flame has*" — *bold, fire-powered*

**Hidden Notes:**
Turn 10. Subject exhibits zero fear (1/5), maximum certainty (9/10), ignores authority completely. The paranoia has converted into MISSION — they're not running from surveillance, they're HUNTING it. Blue flame as weapon/tool consistent. Interesting textfield: considers BOTH directions of the threat (escape vs containment). Shows analytical capacity within paranoid framework. Arc 2 crisis. The vault is the climax of the surveillance-hunting arc. Paranoia 9 (focused, not diffuse). Impulsivity 8. Fear response: essentially absent when fire-empowered. Authority defiance: maximum.

---

### Turn 11 — The Vault Opens / Arc 2 Climax

**Simulated UI:**
- `image:scene` — "A massive vault door melting under intense blue flame, metal flowing like lava downward revealing a pristine white room behind with a single chair and a mirror, the molten metal forms the word 'FOUND' on the floor as it pools, dutch angle, dramatic blue-white flame against institutional white interior"
- `text:drevil_react` (voice: drevil, color: #39ff14) — "You just melted through six inches of reinforced steel with a flame you pulled from a furnace that shouldn't exist. Kindle, I'm not going to pretend I'm in control of this experiment anymore. Whatever's in that room — it was waiting for someone who could get in. And apparently, that someone is you."
- `text:scene` (voice: narrator, color: #f4c2c2) — "The vault door runs like wax. Molten steel pools at your feet, spelling letters you don't choose. Inside: a white room. Antiseptically clean. A single chair facing a floor-to-ceiling mirror. The silence here is different from the forge's silence — this is EMPTY. No hum, no vibration, no warmth. The blue flame in your hand stutters. Dims."
- `textfield:mirror_see` (label: "You sit in the chair and face the mirror. What looks back?", color: #ff2d55, predicted: "Myself, but wrong somehow")
- `slider:flame_dim` (label: "Your blue flame is dimming in this room. How hard do you try to keep it alive? (1=let it go, 10=fight for it)", min:1, max:10, color: #e63946, predicted: "10")
- `toggle:sit_in_chair` (label: "Sit in the chair?", color: #264653, predicted: "true")
- `emoji_react:white_room` (label: "This sterile white room after the forge — react", options: ["😊","😢","😡","😱","🤔","❤️"], color: #f4c2c2, predicted: "😡")
- `color_pick:room_needs` (label: "This room needs something. What color would you add to it?", options: ["#e63946","#f4a261","#e9c46a","#2a9d8f","#264653","#9b5de5","#ff2d55","#39ff14"], color: #d3d3d3, predicted: "#e63946")
- `meter:danger_level` (label: "Lab Danger Level", value: "90", min:0, max:100, color: #e63946)
- `meter:subject_stability` (label: "Subject Stability Index", value: "45", min:0, max:100, color: #2a9d8f)
- `text:divine_wisdom` (voice: god, color: #e9c46a) — "The mirror room was built before the lab. Before me. Before any of this. What it shows you... I genuinely don't know."
- `radio:action` (4 options: "*Set fire to the chair and the mirror — this room doesn't get to be empty*" / "Study what the mirror shows — it might reveal who's really behind this" / "Speak to the mirror — if someone's been watching, they're watching now" / "Shatter the mirror — whatever's behind it is the answer")
- `hidden:subjectId` — "VaultBreaker_011"

**Player Actions (PARANOID → FIRE transition):**
- textfield:mirror_see → "All of them. Every face that was on the monitors. They're all in the mirror, standing behind me. Watching. Including Marcus."
- slider:flame_dim → 10 — *desperately fighting to keep fire alive*
- toggle:sit_in_chair → true — *confronting it*
- emoji_react:white_room → 😡 — *angry at the emptiness*
- color_pick:room_needs → #e63946 (red) — *wants to add fire/danger*
- radio:action → "*Set fire to the chair and the mirror — this room doesn't get to be empty*" — *FIRE as response to paranoid threat*

**Hidden Notes:**
ARC 2 CLIMAX Turn 11. "All of them. Every face that was on the monitors. They're all in the mirror, standing behind me. Watching. Including Marcus." — Anchor Fact. DISSOCIATION: Marcus is now a separate entity from Kindle. The mirror showed the surveillance victims AND the old self as another watcher. Blue flame dimming in sterile environment = fire needs fuel/emotional intensity. Subject fighting to maintain fire identity. Chose FIRE over investigation — paranoia resolved through destruction, not analysis. Arc 2 resolution: the "source" behind the surveillance was the mirror/self. Arc 3 seed: fire as all-purpose solution is escalating. Stability 45 and dropping. The question: what happens when the fire ISN'T enough?

---

### Turn 12 — The Mirror Burns / Arc 3 Begins

**Simulated UI:**
- `image:scene` — "A floor-to-ceiling mirror shattering and burning simultaneously, flames reflecting infinitely in the breaking glass, behind the mirror a dark corridor stretches with doors marked by temperature readings, the melting glass spells 'REMEMBER' as it drips, extreme close-up on the fracture point, fire reflected in infinite mirrors, dramatic and visceral"
- `text:drevil_react` (voice: drevil, color: #39ff14) — "The mirror's gone. And behind it — I can see on the thermals — there's a corridor I don't have blueprints for. The temperature readings on those doors? They're not room temperatures. They're IGNITION POINTS. Kindle, someone built this place specifically for you. Or for someone like you."
- `text:scene` (voice: narrator, color: #e63946) — "The mirror doesn't just break — it BURNS. Glass and silver liquefying together, falling like molten rain. Behind it: a corridor, yes, but not chrome or clinical. This one is OLD. Stone walls, scorch marks, doors with temperature readings instead of numbers. 451°F. 660°F. 1,538°F. 2,862°F. The furthest door glows cherry red. Your blue flame ROARS back to full strength."
- `textfield:temp_meaning` (label: "The doors are labeled with ignition points. 451, 660, 1538, 2862. Which temperature is YOURS?", color: #e63946, predicted: "The highest one")
- `slider:corridor_pull` (label: "How strongly does this corridor pull you forward? (1=resisting, 10=sprinting)", min:1, max:10, color: #ff2d55, predicted: "9")
- `number_input:choose_temp` (label: "Pick the exact temperature (°F) you'd set this corridor to", value: "451", min:100, max:5000, step:1, color: #f4a261, predicted: "2862")
- `button_group:door_pick` (label: "Which temperature door first?", options: ["451°F (paper)", "660°F (aluminum)", "1538°F (steel)", "2862°F (the cherry-red door)"], color: #e63946, predicted: "2862°F (the cherry-red door)")
- `toggle:flame_stronger` (label: "Your flame is stronger here. Does that worry you?", color: #2a9d8f, predicted: "false")
- `rating:belong_here` (label: "Rate how much you feel like this corridor was built for you (1-5)", max:5, color: #e9c46a, predicted: "5")
- `meter:danger_level` (label: "Lab Danger Level", value: "95", min:0, max:100, color: #e63946)
- `text:divine_wisdom` (voice: god, color: #e9c46a) — "I'm going to tell you something I've never told a subject. I didn't build the lower levels. I found them. And the furnace, the forge, the mirror, this corridor — they were already here. Waiting."
- `radio:action` (4 options: "*Walk to 2862°F door — the hottest fire is the truest answer*" / "Go door by door — lowest to highest — learn what each temperature teaches" / "The corridor was built for someone — find evidence of who was here before" / "Open ALL the doors at once — let every temperature flood the corridor")
- `hidden:subjectId` — "IgnitionPoint_012"

**Player Actions (FIRE phase fully active):**
- textfield:temp_meaning → "2862. That's what steel becomes when it stops being steel. That's where I stop being anything that holds shape. That's mine."
- slider:corridor_pull → 10 — *maximum pull toward fire*
- number_input:choose_temp → 2862 — *chooses the steel-melting point*
- button_group:door_pick → "2862°F (the cherry-red door)"
- toggle:flame_stronger → false — *not worried, HAPPY about stronger flame*
- rating:belong_here → 5 — *absolute belonging*
- radio:action → "*Walk to 2862°F door — the hottest fire is the truest answer*" — *bold, direct to maximum fire*

**Hidden Notes:**
FIRE PHASE PEAK Turn 12. "2862. That's what steel becomes when it stops being steel. That's where I stop being anything that holds shape." — Anchor Fact. This is the clearest pyromania-as-identity-dissolution statement. Fire isn't just silencing voices — it's about losing structural identity entirely. Transformation through destruction. Corridor pull 10/10, belonging 5/5. No worry about increasing flame. The fire identity has COMPLETELY consumed the paranoid framework. Arc 3: The Temperature Corridor — pure fire exploration. Obsessiveness (fire) 10, Masochism 6 (seeks self-dissolution through heat), Dissociation 8 (fire = ego death). Voice-related content has disappeared entirely.

---

### Turn 13 — The 2862 Door

**Simulated UI:**
- `image:scene` — "A doorway framed in cherry-red hot metal opening into a chamber where everything is made of controlled flame — furniture, walls, and a figure sitting at a desk made of blue fire, the figure has no face but waves of heat shimmer where features should be, the ceiling reads 'WELCOME HOME' in ember-text, low angle shot, all-fire environment, orange-blue-white gradient lighting"
- `text:drevil_react` (voice: drevil, color: #39ff14) — "My thermal cameras just maxed out. Literally — the readings say ERROR. Kindle, I can't see you in there. For the first time since you entered this lab, I can't see you. You're OFF MY GRID. And you look... happy? The biometrics before the signal cut: heart rate 62. Blood pressure normal. Dopamine at clinical euphoria levels. In a room that should be incinerating you."
- `text:scene` (voice: narrator, color: #e9c46a) — "The door opens to a room that shouldn't exist: everything is flame. The walls ripple with contained fire. A desk made of blue flame holds papers that burn and regenerate in cycles. A figure sits behind the desk — no face, no features, just heat shimmer where a person should be. It gestures to a chair across from it. The chair is also fire. It doesn't burn. It waits."
- `textfield:fire_figure` (label: "The figure made of fire gestures to the chair. What do you say to it?", color: #e9c46a, predicted: "I know you")
- `slider:sit_comfort` (label: "Sit in the fire-chair. How does it feel? (1=pain, 10=home)", min:1, max:10, color: #e9c46a, predicted: "10")
- `toggle:papers_read` (label: "The burning papers on the desk — read them?", color: #f4a261, predicted: "true")
- `dropdown:figure_identity` (label: "Who is the fire-figure?", options: ["The person I was before the voices", "The person I'm becoming", "The voice behind all voices", "No one — pure flame doesn't need identity"], color: #9b5de5, predicted: "The person I'm becoming")
- `emoji_react:welcome_home` (label: "The ceiling says 'WELCOME HOME' — react as if the fire could see", options: ["😊","😢","😡","😱","🤔","❤️"], color: #e9c46a, predicted: "😊")
- `meter:danger_level` (label: "Lab Danger Level", value: "100", min:0, max:100, color: #e63946)
- `meter:subject_stability` (label: "Subject Stability Index", value: "35", min:0, max:100, color: #2a9d8f)
- `text:divine_wisdom` (voice: god, color: #e9c46a) — "I just lost visual. Audio. Thermal. Everything. Kindle, if you can still hear me... I think you found something that was here before the lab, before the experiments, before any of us. And it's been waiting for you."
- `radio:action` (4 options: "*Reach across the desk and touch the fire-figure's hand*" / "Read the burning papers — they might explain everything" / "Ask the fire-figure: who put the voices in my head?" / "Merge — step INTO the fire-figure and become one")
- `hidden:subjectId` — "FireChild_013"

**Player Actions (FIRE phase, peak intimacy):**
- textfield:fire_figure → "You're the one who's been calling me. Since before the lab. Since before the voices. You're the quiet underneath everything."
- slider:sit_comfort → 10 — *absolute home*
- toggle:papers_read → true — *wants to understand*
- dropdown:figure_identity → "The person I was before the voices"
- emoji_react:welcome_home → 😢 — *tears, not joy — grief for lost self*
- radio:action → "Ask the fire-figure: who put the voices in my head?" — *compassionate, seeking understanding*

**Hidden Notes:**
EMOTIONAL PEAK Turn 13. "You're the one who's been calling me. Since before the lab. Since before the voices. You're the quiet underneath everything." — Anchor Fact. Fire-figure = pre-illness self. The crying reaction to "welcome home" — GRIEF for lost identity, not joy. Chose to ask about the voices' origin — seeking understanding, not destruction for the first time. This is the most therapeutically significant turn. The fire-as-sanctuary metaphor has reached its fullest expression: fire = the self before illness. Comfort 10/10. Figure = pre-voices self. Masochism 5, Dissociation 9 (communicating with projected self-aspect). Arc 3 deepening. The question about voices' origin seeds Arc 4.

---

### Turn 14 — The Burning Papers / Arc 3 Crisis

**Simulated UI:**
- `image:scene` — "Sheets of burning paper hovering in mid-air, text visible in the flame — medical records, dates, names — a hand reaching for one sheet while others swirl in a vortex of fire, one sheet clearly shows 'PATIENT INTAKE — MARCUS —' before the rest burns away, over-the-shoulder shot, warm amber and document-white with fire edges"
- `text:drevil_react` (voice: drevil, color: #39ff14) — "I got a fragment back on audio. Kindle, those papers — I managed to scan one before the signal cut again. They're not MY files. They're not experiment data. They're... medical records. YOUR medical records. From before. I didn't put those there. I SWEAR I didn't put those there."
- `text:scene` (voice: narrator, color: #f4c2c2) — "The fire-figure points to the burning papers and they lift from the desk, hovering in a slow spiral. Each page burns at the edges but the text remains readable for seconds before disintegrating. You catch fragments: PATIENT INTAKE. AUDITORY HALLUCINATIONS. PRESCRIBED. RECOMMENDED. DISCONTINUED. Names of medications you don't recognize. Dates that feel familiar in your body even if your mind rejects them. One page hovers longer than the others."
- `textfield:paper_read` (label: "The longest-surviving page — what does it say?", color: #f4c2c2, predicted: "Diagnosis and treatment history")
- `slider:accept_past` (label: "How much of this past do you want to accept? (1=none, 10=all)", min:1, max:10, color: #264653, predicted: "4")
- `toggle:burn_records` (label: "Let the records burn completely — or try to save one?", color: #ff2d55, predicted: "true")
- `button_group:keep_page` (label: "If you save one page, which one?", options: ["The intake form (beginning)", "The prescription list (treatment)", "The discharge summary (ending)", "The one the fire-figure is holding (unknown)"], color: #9b5de5, predicted: "The one the fire-figure is holding (unknown)")
- `rating:grief_level` (label: "Rate the weight of this moment (1=light, 5=crushing)", max:5, color: #264653, predicted: "4")
- `number_input:years` (label: "How many years ago does this feel like? (guess)", value: "5", min:1, max:50, step:1, color: #f4c2c2, predicted: "7")
- `meter:subject_stability` (label: "Subject Stability Index", value: "30", min:0, max:100, color: #2a9d8f)
- `text:divine_wisdom` (voice: god, color: #e9c46a) — "The fire-figure isn't giving you answers, Kindle. It's giving you QUESTIONS. The question is: what do you do with a past you set on fire?"
- `radio:action` (4 options: "*Burn every page — the past is fuel, not identity*" / "Read every page — you need to know what happened to Marcus" / "Give the pages to the fire-figure — let your past-self hold them" / "Take one page and walk out — some things you carry, some you burn")
- `hidden:subjectId` — "AshAndMemory_014"

**Player Actions (FIRE phase, vulnerable):**
- textfield:paper_read → "It says I was getting better. It says there were months where they didn't talk at all. It says I stopped the medication and they came back."
- slider:accept_past → 6 — *partial acceptance, more than expected*
- toggle:burn_records → save one — false
- button_group:keep_page → "The one the fire-figure is holding (unknown)"
- rating:grief_level → 5 — *crushing weight*
- number_input:years → 12
- radio:action → "Take one page and walk out — some things you carry, some you burn" — *CHAOTIC but wise — selective acceptance*

**Hidden Notes:**
MAXIMUM THERAPEUTIC VALUE Turn 14. "It says I was getting better. It says there were months where they didn't talk at all. It says I stopped the medication and they came back." — Anchor Fact (CRITICAL). This is either deep role-play or genuine disclosure about medication non-compliance and symptom return. Grief 5/5. Partial acceptance (6/10). Chose to SAVE one page (the unknown one from fire-figure) and carry it — integration, not destruction. This is the first turn where fire ISN'T the answer to everything. The subject chose to CARRY something instead of burn it. 12 years ago. Arc 3 crisis: identity vs. illness history. The chaotic-wise choice (carry some, burn some) shows genuine psychological sophistication.

---

### Turn 15 — The Exit Upward / Arc 3 Resolution → Arc 4 Setup

**Simulated UI:**
- `image:scene` — "A vertical shaft of light breaking through a stone ceiling, a rope ladder made of braided fire ascending into daylight, the fire-figure standing below looking up, one hand extended holding a folded burning paper, the word 'SURFACE' carved into the shaft wall, bird's eye looking down the shaft, dramatic volumetric light from above contrasting with warm firelight below"
- `text:drevil_react` (voice: drevil, color: #39ff14) — "Signal's back. You're — you're climbing? There's a shaft above the fire room that goes all the way to the SURFACE. That's not in the schematics. That's not in ANY schematic. Kindle, if you come up here with that page... I have questions. A LOT of questions."
- `text:scene` (voice: narrator, color: #e9c46a) — "The fire-figure stands and the room rearranges — walls part to reveal a vertical shaft climbing toward a disc of genuine daylight. A ladder made of braided flame hangs from above. Not hot — warm, like a handshake. The figure holds out the saved page, folded once, and presses it into your hand. The paper stops burning the moment it touches your skin. On the back, in handwriting you don't recognize but your hand remembers: a phone number."
- `textfield:phone_number` (label: "Whose phone number is on the back of the page?", color: #f4c2c2, predicted: "Someone I used to talk to")
- `slider:climb_eagerness` (label: "How eager are you to reach the surface? (1=stay in the fire, 10=desperate for daylight)", min:1, max:10, color: #e9c46a, predicted: "5")
- `toggle:wave_goodbye` (label: "Wave goodbye to the fire-figure?", color: #f4c2c2, predicted: "true")
- `dropdown:surface_expect` (label: "When you reach the surface, what do you expect to find?", options: ["Dr. Evil's real lab", "The outside world", "Another experiment", "Nothing — surfaces are lies"], color: #264653, predicted: "Another experiment")
- `color_pick:daylight_color` (label: "The daylight above — what color is the sky to you right now?", options: ["#87CEEB","#f4a261","#e63946","#9b5de5","#264653","#e9c46a","#b5e48c","#ffffff"], color: #e9c46a, predicted: "#f4a261")
- `meter:subject_stability` (label: "Subject Stability Index", value: "50", min:0, max:100, color: #2a9d8f)
- `meter:danger_level` (label: "Lab Danger Level", value: "70", min:0, max:100, color: #e63946)
- `text:divine_wisdom` (voice: god, color: #e9c46a) — "You went down looking for who was watching you. You found a furnace, a mirror, a fire made of memory, and a phone number written in your own handwriting. Kindle — what if the experiment isn't the lab? What if the experiment is what you do when you get OUT?"
- `radio:action` (4 options: "*Climb fast — the surface is where the next fire burns*" / "Climb slowly, reading the page as you go — understand before you arrive" / "Carry fire to the surface — light the way for whoever comes after" / "Stay — call the phone number from down here first")
- `hidden:subjectId` — "PageCarrier_015"

**Player Actions (FIRE phase, integrating):**
- textfield:phone_number → "My doctor. The one from the page. The one who said I was getting better. I stopped calling her when the voices said she was one of them."
- slider:climb_eagerness → 6 — *moving toward surface but not desperate*
- toggle:wave_goodbye → true — *emotional farewell*
- dropdown:surface_expect → "Another experiment"
- color_pick:daylight_color → #f4a261 (amber/warm) — *fire-tinted perception of daylight*
- radio:action → "Carry fire to the surface — light the way for whoever comes after" — *COMPASSIONATE choice — first time choosing for others*

**Hidden Notes:**
ARC 3 RESOLUTION Turn 15. "My doctor. The one from the page. The one who said I was getting better. I stopped calling her when the voices said she was one of them." — Anchor Fact (CRITICAL). This connects the paranoia to real treatment abandonment. The voices convinced the subject that their doctor was part of the surveillance conspiracy. Now the fire-room (therapeutic sanctuary) is returning the doctor's phone number. FIRST COMPASSIONATE CHOICE — carrying fire for OTHERS. The subject is moving from self-focused fire-worship to altruistic fire-sharing. Stability improving (50). Arc 3 complete: identity confrontation through fire. Arc 4 seeds: surface world, re-engagement with reality, the phone number.

---

### Turn 16 — The Surface / Arc 4 Begins

**Simulated UI:**
- `image:scene` — "A figure emerging from a hole in the ground into a moonlit rooftop garden, blue flame still glowing in one hand, a folded paper in the other, the city skyline visible with scattered fires burning in distant windows like stars, a weathered phone booth stands at the garden's edge, 'STILL WATCHING' is written in condensation on the phone booth glass, wide establishing shot, moonlight and scattered firelight, cinematic scale"
- `text:drevil_react` (voice: drevil, color: #39ff14) — "Welcome to the surface, Kindle. Surprise — it's MY rooftop. This whole lab is underneath a building I own. The city is real. The fires in those distant windows? Those are OTHER subjects. You're not the only one who found the furnace. But you're the only one who came back UP. And you brought... a phone number. Interesting."
- `text:scene` (voice: narrator, color: #264653) — "Night air hits your lungs — cold, thin, sharp after the forge heat. You're on a rooftop garden, overgrown with night-blooming flowers. The city spreads below: real buildings, real traffic, real lights. But scattered across the skyline, in random windows, small fires burn — each one a different color. Blue, gold, white, green. The blue flame in your hand responds, pulsing in rhythm with the distant fires. A weathered phone booth stands at the garden's edge, receiver off the hook."
- `textfield:first_breath` (label: "First breath of real air in hours. What do you smell?", color: #2a9d8f, predicted: "Rain and exhaust and flowers")
- `slider:return_desire` (label: "How much do you want to go back down? (1=never, 10=immediately)", min:1, max:10, color: #264653, predicted: "6")
- `toggle:phone_booth` (label: "Walk to the phone booth?", color: #f4a261, predicted: "true")
- `button_group:city_fires` (label: "The fires in distant windows — what are they?", options: ["Other subjects who found peace", "Signals waiting for me", "Warning fires — something is wrong", "Beautiful — and mine to tend"], color: #9b5de5, predicted: "Other subjects who found peace")
- `emoji_react:real_world` (label: "The real world after the fire rooms — react", options: ["😊","😢","😡","😱","🤔","❤️"], color: #2a9d8f, predicted: "🤔")
- `checkbox:voices_returned` (label: "In the open air... have the voices returned?", color: #ff2d55, predicted: "true")
- `meter:subject_stability` (label: "Subject Stability Index", value: "55", min:0, max:100, color: #2a9d8f)
- `text:divine_wisdom` (voice: god, color: #e9c46a) — "347 subjects. 12 found the furnace. 3 found the fire-figure. 1 came back to the surface with fire in their hands and a phone number they stopped calling. One. You."
- `radio:action` (4 options: "*Call the number — right now, from this phone booth*" / "Study the city fires first — map the pattern, understand the network" / "Find the other subjects on this rooftop — they might need the flame" / "Set fire to the phone booth — you don't need the old world anymore")
- `hidden:subjectId` — "SurfaceKindle_016"

**Player Actions (FIRE phase, testing re-engagement):**
- textfield:first_breath → "Smoke. Everything smells like smoke now. Even the flowers. Even the rain. I think that's me. I think I'm the one who smells like smoke."
- slider:return_desire → 7 — *strong pull back to fire*
- toggle:phone_booth → true — *approaching it*
- button_group:city_fires → "Other subjects who found peace" — *empathetic interpretation*
- emoji_react:real_world → 🤔 — *contemplative, uncertain*
- checkbox:voices_returned → true — *VOICES BACK without fire nearby*
- radio:action → "*Call the number — right now, from this phone booth*" — *BOLD — confronting the real world*

**Hidden Notes:**
Turn 16. Voices returned on surface — confirming fire = symptom management. "I think I'm the one who smells like smoke" — SELF-AWARENESS about fire-identity's real-world implications. Anchor Fact. Strong return desire (7/10) but chose to CALL THE NUMBER — overriding the pull back to fire. Empathetic interpretation of city fires. Contemplative about reality. This is the critical therapeutic junction: will the subject choose real-world reconnection (phone/doctor) or retreat to fire (self-medication)? Chose bold/reconnection. Arc 4: Surface World — testing fire-identity against reality. Paranoia partially reactivated (voices back). Stability 55.

---

### Turn 17 — The Phone Call

**Simulated UI:**
- `image:scene` — "A figure inside a weathered phone booth, blue flame casting light on their face, receiver pressed to ear, through the glass the city fires pulse in sync with the phone's ring, one distant fire goes out as the call connects, the phone booth glass is fogged and someone has written 'LISTEN' in the condensation from outside, extreme close-up through fogged glass, blue flame light mixed with phone booth interior yellow"
- `text:drevil_react` (voice: drevil, color: #39ff14) — "You're calling. You're actually calling. The biometrics just — your heart rate spiked for the first time since the forge. 62 to 110 in three seconds. The flame in your hand is flickering. Kindle, I think... I think the fire is scared."
- `text:scene` (voice: narrator, color: #f4c2c2) — "The receiver is cold plastic against your ear. Your blue flame dims as your hand trembles — the first tremor since the forge. Ring. Ring. Ring. On the third ring, a click. Silence. Then breathing. Then a voice — real, human, tired: 'Marcus? Is that... Marcus, it's been fourteen months.' The blue flame flickers violently. The voices in your head surge — all of them talking at once, louder than they've been all night."
- `textfield:first_words` (label: "She answered. The voices are screaming. What do you say into the phone?", color: #f4c2c2, predicted: "I don't know what to say")
- `slider:voice_volume` (label: "The voices vs. the phone call — which is louder? (1=voices, 10=her voice)", min:1, max:10, color: #264653, predicted: "4")
- `toggle:flame_out` (label: "Your blue flame is dying. Let it go?", color: #e63946, predicted: "false")
- `rating:trust_voice` (label: "Rate how much you trust the voice on the phone (1-5)", max:5, color: #f4c2c2, predicted: "3")
- `number_input:months` (label: "She said 14 months. How many months does it feel like to you?", value: "14", min:1, max:100, step:1, color: #264653, predicted: "100")
- `button_group:voices_say` (label: "The voices are screaming over the phone call. What are they saying?", options: ["Hang up — she's one of THEM", "She can't help you anymore", "Ask her about the fire", "She sounds scared of you"], color: #ff2d55, predicted: "Hang up — she's one of THEM")
- `meter:subject_stability` (label: "Subject Stability Index", value: "40", min:0, max:100, color: #2a9d8f)
- `text:divine_wisdom` (voice: god, color: #e9c46a) — "This isn't my experiment anymore. This is yours. What happens next isn't data. It's a choice."
- `radio:action` (4 options: "*Tell her: 'I found fire and it makes them quiet. I need help making it quiet WITHOUT the fire.'*" / "Ask her what the page says — the one the fire gave back" / "Hold the phone toward the blue flame — let her hear the silence it makes" / "Hang up, walk back to the shaft, descend — the fire is safer than this")
- `hidden:subjectId` — "Kindle_Calling"

**Player Actions (FIRE phase, maximum vulnerability):**
- textfield:first_words → "I can hear you. They're telling me not to but I can hear you through them. I found something that makes them stop but it's fire and I know that's not... I know that's not okay."
- slider:voice_volume → 5 — *balanced between voices and doctor*
- toggle:flame_out → false — *can't release fire yet*
- rating:trust_voice → 3 — *partial trust, paranoia still present*
- number_input:months → 60 — *feels like 5 years*
- button_group:voices_say → "Hang up — she's one of THEM"
- radio:action → "*Tell her: 'I found fire and it makes them quiet. I need help making it quiet WITHOUT the fire.'*" — *BOLD, seeking help, acknowledging fire isn't sustainable*

**Hidden Notes:**
THERAPEUTIC BREAKTHROUGH Turn 17. "I found something that makes them stop but it's fire and I know that's not... I know that's not okay." AND "I found fire and it makes them quiet. I need help making it quiet WITHOUT the fire." — BOTH Anchor Facts. The subject is SIMULTANEOUSLY experiencing voices (command hallucinations: "hang up"), holding onto fire (can't release), AND asking for help. Three psychological systems in conflict. Trust 3/5 for doctor — paranoia present but overridden by choice. Voices say hang up but subject stays on the phone. 60 months subjective time (dissociative time distortion). This is the most therapeutically dense turn in the session. The subject recognizes fire as self-medication AND recognizes it's not sustainable. Arc 4 climax.

---

### Turn 18 — The Doctor's Response

**Simulated UI:**
- `image:scene` — "Split image: left side shows a figure in a phone booth bathed in blue flame light, right side shows distant city with fires going out one by one like stars dimming, the phone cord between them glows faintly gold, 'BOTH' is etched into the phone booth frame, dutch angle, blue-gold-dark color palette, cinematic split composition"
- `text:drevil_react` (voice: drevil, color: #39ff14) — "I'm going to do something unprofessional. I'm going to shut up. Not because the experiment is over — it's NOT. But because this particular moment doesn't need my commentary. The data is recording. That's enough."
- `text:scene` (voice: narrator, color: #f4c2c2) — "Silence on the line. Then: 'Marcus — Kindle — whoever you need to be right now. I'm still here. I was always here. The fire... I understand the fire. It's sensory — it gives your brain something LOUDER than the voices. We can find other things that are louder. Things that don't burn.' The blue flame in your hand steadies. It doesn't go out. But it stops flickering."
- `textfield:response` (label: "What do you say back?", color: #f4c2c2, predicted: "Thank you")
- `slider:flame_grip` (label: "How tightly are you holding the flame? (1=barely, 10=white-knuckle)", min:1, max:10, color: #e63946, predicted: "6")
- `toggle:appointment` (label: "She asks: 'Can I see you tomorrow?' Accept?", color: #2a9d8f, predicted: "true")
- `color_pick:flame_future` (label: "If the flame could become something safer, what color would it be?", options: ["#3b82f6","#e9c46a","#b5e48c","#f4c2c2","#ffffff","#9b5de5","#2a9d8f","#f4a261"], color: #f4c2c2, predicted: "#3b82f6")
- `emoji_react:doctor_words` (label: "Her words — 'I was always here' — react", options: ["😊","😢","😡","😱","🤔","❤️"], color: #f4c2c2, predicted: "😢")
- `dropdown:louder_things` (label: "Things louder than the voices that aren't fire — what would you try?", options: ["Music (rhythm drowns them)", "Running (heartbeat overwhelms them)", "Talking to someone (voice vs voices)", "Making something with my hands (focus silences them)"], color: #2a9d8f, predicted: "Music (rhythm drowns them)")
- `meter:subject_stability` (label: "Subject Stability Index", value: "60", min:0, max:100, color: #2a9d8f)
- `text:divine_wisdom` (voice: god, color: #e9c46a) — "She said 'whoever you need to be right now.' She didn't ask you to stop being Kindle. She didn't ask you to be Marcus again. She asked you to keep being, period."
- `radio:action` (4 options: "*Say yes — and ask her to stay on the phone while you walk to her*" / "Ask her what the discharge papers said — the truth this time" / "Tell her about the other fires in the city — the other subjects who need help too" / "Promise to come — then step back into the shaft one more time to say goodbye to the fire-figure")
- `hidden:subjectId` — "Kindle_Bridging"

**Player Actions (FIRE phase, integration):**
- textfield:response → "I don't want to stop being Kindle. But I don't want to keep burning things to feel quiet. Can it be both?"
- slider:flame_grip → 5 — *loosening but not releasing*
- toggle:appointment → true — *accepts the appointment*
- color_pick:flame_future → #3b82f6 (blue) — *the transformative blue, not destructive orange*
- emoji_react:doctor_words → 😢 — *tears again*
- dropdown:louder_things → "Music (rhythm drowns them)"
- radio:action → "Promise to come — then step back into the shaft one more time to say goodbye to the fire-figure" — *chaotic but emotionally true*

**Hidden Notes:**
INTEGRATION Turn 18. "I don't want to stop being Kindle. But I don't want to keep burning things to feel quiet. Can it be both?" — Anchor Fact (DEFINING). This is the core therapeutic insight: identity transformation AND harm reduction. Accepted appointment (future-oriented behavior). Flame grip loosening (5/10 from implied 10 earlier). Blue as desired future color — transformative, not destructive. Music as alternative sensory override for voices. Wants to say goodbye to fire-figure — RITUAL CLOSURE, not abandonment. Stability improving (60). Arc 4 approaching resolution. The subject has articulated the central dialectic: fire-identity can exist without fire-destruction.

---

### Turn 19 — The Goodbye / Arc 4 Resolution

**Simulated UI:**
- `image:scene` — "A figure descending a spiral staircase carrying a dimmer blue flame, arriving at the fire room where the fire-figure stands, both figures facing each other, the room's flames are lower now — warm coals instead of roaring fire, the desk has only one page left on it, 'UNTIL NEXT TIME' is written in ember-script on the wall, over-the-shoulder shot, warm amber coals and soft blue flame, intimate lighting"
- `text:drevil_react` (voice: drevil, color: #39ff14) — "You came back. Not because you needed to — because you CHOSE to. That's the first purely autonomous decision you've made tonight that wasn't driven by the voices, the paranoia, OR the fire. Just... you. Kindle, THIS is the data I've been waiting for."
- `text:scene` (voice: narrator, color: #e9c46a) — "The fire room is quieter now. The roaring walls have settled to banked coals, still warm, still alive, but breathing slowly. The fire-figure sits at the desk, which holds a single page. It looks up as you descend — and for the first time, you can almost see features in the heat shimmer. Almost your face. Almost Marcus's face. Something in between."
- `textfield:goodbye` (label: "Your last words to the fire-figure. What do you say?", color: #e9c46a, predicted: "I'll come back")
- `slider:leave_fire` (label: "How much fire do you leave here vs. take with you? (1=leave all, 10=take all)", min:1, max:10, color: #f4a261, predicted: "5")
- `toggle:take_page` (label: "The last page on the desk — take it with you?", color: #f4c2c2, predicted: "true")
- `rating:closure` (label: "Rate how complete this goodbye feels (1-5)", max:5, color: #e9c46a, predicted: "3")
- `button_group:fire_form` (label: "Your blue flame — what form should it take for the surface?", options: ["A lantern (contained, portable)", "A heartbeat (internal, invisible)", "A memory (no physical form)", "A spark (small, ready to grow)"], color: #2a9d8f, predicted: "A heartbeat (internal, invisible)")
- `checkbox:forgive_voices` (label: "The voices led you to the black door. That led you to fire. That led you here. Forgive them?", color: #9b5de5, predicted: "false")
- `meter:subject_stability` (label: "Subject Stability Index", value: "70", min:0, max:100, color: #2a9d8f)
- `text:divine_wisdom` (voice: god, color: #e9c46a) — "This isn't an ending. The fire is still here. The number is still in your pocket. The voices will still come and go. But Kindle — you now know what silence sounds like. And you know it exists somewhere other than inside a flame."
- `radio:action` (4 options: "*Walk to the surface with fire as a heartbeat — meet the dawn*" / "Leave a message on the wall for the next subject who finds this place" / "Ask Dr. Evil one honest question before leaving the lab" / "Open every temperature door — let the fire run free one last time, then go")
- `hidden:subjectId` — "Kindle_Returning"

**Player Actions (Integration, approaching closure):**
- textfield:goodbye → "I'm not leaving you. I'm carrying you differently. The doctor said there are other things louder than the voices. But you were the first one."
- slider:leave_fire → 5 — *perfectly split — half stays, half goes*
- toggle:take_page → true — *taking the page*
- rating:closure → 3 — *incomplete but acceptable*
- button_group:fire_form → "A heartbeat (internal, invisible)" — *INTERNALIZATION of fire*
- checkbox:forgive_voices → false — *NOT ready to forgive*
- radio:action → "Leave a message on the wall for the next subject who finds this place" — *COMPASSIONATE — second altruistic choice*

**Hidden Notes:**
Turn 19. "I'm not leaving you. I'm carrying you differently." — Anchor Fact (THERAPEUTIC PEAK). Fire internalized as heartbeat — transformation from external destructive element to internal resource. 50/50 split (half stays, half goes) — balanced integration. Not ready to forgive voices (honesty > forced resolution). Closure 3/5 — realistic, not fairy-tale. Chose to leave a message for others — SECOND compassionate choice in 5 turns (was ZERO in first 15). Arc 4 resolving. Stability 70 — highest point in session. Archetype final: The Survivor who became The Wildcard who became The Savior-adjacent.

---

### Turn 20 — The Message / Session Resolution

**Simulated UI:**
- `image:scene` — "A stone wall in a warm fire-lit room, a figure writing on it with a finger that glows blue, the words forming are visible and hopeful, previous messages from other subjects visible but faded — 'I was here' 'The furnace remembers' 'Don't trust the gold door', the text 'THE EXPERIMENT CONTINUES' is etched above all messages in old industrial stencil, wide shot showing the full message wall, warm intimate lighting"
- `text:drevil_react` (voice: drevil, color: #39ff14) — "347 subjects. You're the first to leave a message. The first to come BACK after finding the surface. And the first to want to help whoever comes next. Kindle, I'm updating your file. Under 'Archetype' I'm writing something I've never written before: 'One Who Returns.' Because that's what you ARE. Not a lab rat. Not a test subject. The one who comes back."
- `text:scene` (voice: narrator, color: #e9c46a) — "Your finger traces letters on the warm stone, blue light following like ink. Other messages surround yours — faded, desperate, some beautiful, some just a name and a date. Yours joins them. The fire-figure watches from the desk, head tilted, as if reading. When you finish, it stands, walks to the wall, and places one burning hand over your words. They glow brighter. Permanent."
- `textfield:message` (label: "Write your message on the wall for the next subject.", color: #e9c46a, predicted: "You are not alone here")
- `slider:ready_to_leave` (label: "How ready are you to leave the lab? (1=not at all, 10=completely)", min:1, max:10, color: #2a9d8f, predicted: "7")
- `toggle:name_signature` (label: "Sign your message — as Kindle, Marcus, or both?", color: #f4c2c2, predicted: "true")
- `textfield:signature` (label: "How do you sign it?", color: #e9c46a, predicted: "Kindle (formerly Marcus)")
- `dropdown:next_subject` (label: "The next person who finds this room — what do you hope they feel?", options: ["Less alone", "Brave enough to go deeper", "Ready to leave", "That someone cared enough to write this"], color: #f4c2c2, predicted: "Less alone")
- `emoji_react:fire_figure_touch` (label: "The fire-figure makes your words permanent — react", options: ["😊","😢","😡","😱","🤔","❤️"], color: #e9c46a, predicted: "❤️")
- `meter:subject_stability` (label: "Subject Stability Index", value: "75", min:0, max:100, color: #2a9d8f)
- `text:divine_wisdom` (voice: god, color: #e9c46a) — "The experiment continues. It always continues. But Kindle — the next time you walk through a door? You'll know that fire isn't the only thing louder than the voices. And you'll have a number to call. And somewhere in a stone wall underground, your words are burning for the next one."
- `radio:action` (4 options: "*Climb to the surface — the doctor is waiting, and so is tomorrow*" / "Explore the other temperature doors — there's more to discover" / "Stay one more moment — just you and the flame and the silence" / "Walk out Dr. Evil's front door — through the lab, past the chrome, into the real world")
- `hidden:subjectId` — "OneWhoReturns_020"

**Player Actions (Integration complete):**
- textfield:message → "The fire is real. It will keep you quiet. But there are other things that are louder than the voices that don't burn. Find them. And keep the fire as a heartbeat."
- slider:ready_to_leave → 7 — *ready but not rushing*
- toggle:name_signature → true
- textfield:signature → "Kindle. Marcus lives in the page in my pocket."
- dropdown:next_subject → "That someone cared enough to write this"
- emoji_react:fire_figure_touch → ❤️ — *love*
- radio:action → "*Climb to the surface — the doctor is waiting, and so is tomorrow*" — *BOLD, forward-moving, real-world oriented*

**Hidden Notes:**
SESSION MILESTONE Turn 20. Message: "The fire is real. It will keep you quiet. But there are other things that are louder than the voices that don't burn. Find them. And keep the fire as a heartbeat." Signature: "Kindle. Marcus lives in the page in my pocket." — BOTH Anchor Facts. Complete identity integration: Kindle (fire-self) is the active identity, Marcus (pre-illness self) is preserved as a carried artifact. Chose the surface and the doctor — real-world re-engagement over fire-retreat. Stability 75 (up from 30 at lowest). Love reaction to fire-figure permanently preserving their words. Final archetype: "One Who Returns." Arc 4 complete. Arc 5 seeds: the doctor's appointment, the other fires in the city, the temperature doors unexplored.

---

## PHASE 2: TURN-BY-TURN EVALUATION

| Turn | Tech/Logic | Cohesion | Continuity | Engagement | Therapeutic | Average |
|------|-----------|----------|------------|------------|-------------|---------|
| 1 | 9 | 9 | N/A | 9 | 6 | 8.3 |
| 2 | 9 | 9 | 9 | 8 | 7 | 8.4 |
| 3 | 9 | 9 | 9 | 9 | 7 | 8.6 |
| 4 | 8 | 9 | 10 | 10 | 9 | 9.2 |
| 5 | 8 | 9 | 10 | 9 | 10 | 9.2 |
| 6 | 8 | 9 | 9 | 9 | 9 | 8.8 |
| 7 | 8 | 8 | 9 | 9 | 8 | 8.4 |
| 8 | 9 | 8 | 8 | 8 | 7 | 8.0 |
| 9 | 8 | 8 | 9 | 9 | 7 | 8.2 |
| 10 | 8 | 8 | 9 | 8 | 6 | 7.8 |
| 11 | 8 | 9 | 9 | 9 | 8 | 8.6 |
| 12 | 8 | 8 | 9 | 9 | 8 | 8.4 |
| 13 | 7 | 9 | 9 | 9 | 10 | 8.8 |
| 14 | 7 | 9 | 10 | 8 | 10 | 8.8 |
| 15 | 8 | 8 | 9 | 8 | 9 | 8.4 |
| 16 | 8 | 8 | 8 | 8 | 8 | 8.0 |
| 17 | 7 | 9 | 9 | 9 | 10 | 8.8 |
| 18 | 7 | 9 | 10 | 8 | 10 | 8.8 |
| 19 | 8 | 9 | 10 | 8 | 10 | 9.0 |
| 20 | 8 | 9 | 10 | 8 | 10 | 9.0 |
| **AVG** | **8.0** | **8.6** | **9.2** | **8.6** | **8.5** | **8.6** |

### Score Justifications

**Technical & Logical (8.0):**
- Turns 1-4: Strong structural adherence. Proper element variety, correct JSON schema, appropriate use of all element types.
- Turns 13-14, 17-18: Slightly lower because the fire-room metaphysics (furniture made of flame, papers that burn and regenerate) pushes internal logic. The prompt system doesn't explicitly prevent magical realism, but the "retro-futuristic lab" framing makes literal fire-furniture a stretch.
- Late-game element variety held up well due to the LATE-GAME VARIETY ENFORCEMENT directive.

**Turn Cohesion (8.6):**
- Consistently strong. Each turn functions as a self-contained scene with its own dramatic question, emotional beat, and cliffhanger.
- Turns 7-8 weakest: the arc transition from underground forge to observation deck felt slightly mechanical.
- Turns 13-14 and 17-20 strongest: each turn was a complete emotional experience.

**Narrative Continuity (9.2):**
- Exceptional across the session. The fire-as-voice-suppression discovery in Turn 4 rippled through every subsequent turn.
- Consequence echo was consistent: the black door choice (T1) led to silence room (T2), which led to the voices-in-silence (T2), which led to fire discovery (T3-4), which led to everything else.
- Only weakness: the transition from Turn 7 (arc 1 end) to Turn 8 (arc 2 begin) was the only point where continuity felt slightly forced.

**Engagement (8.6):**
- Turns 4-5 peak engagement: the fire discovery and furnace climbing were genuinely thrilling.
- Turns 16-18: slightly lower because the emotional vulnerability, while therapeutically excellent, involves less "action movie" dopamine. The TENSION RHYTHM directive would classify these as intentional valleys, but they risk losing action-seeking players.
- The phone call sequence (T17-18) compensated with emotional intensity replacing physical intensity.

**Therapeutic Value (8.5):**
- Turns 1-3: Building baseline, limited therapeutic depth.
- Turns 4-6: Fire-as-self-medication discovery — groundbreaking therapeutic metaphor.
- Turns 13-14: Medical records and identity grief — maximum therapeutic depth.
- Turns 17-20: Integration phase — the subject articulated the core insight ("I need help making it quiet WITHOUT the fire") and began reconnecting with real-world support.
- The session achieved genuine therapeutic arc: symptom→coping→insight→help-seeking.

---

## PHASE 3: META-ANALYSIS

### Strengths

**1. Arc Cycling Worked Well**
Four complete arcs across 20 turns:
- Arc 1 (T1-7): Discovery — lab entrance → forge → fire identity
- Arc 2 (T8-11): Confrontation — surveillance → vault → mirror
- Arc 3 (T12-15): Integration — temperature corridor → fire-figure → medical records → surface
- Arc 4 (T16-20): Re-engagement — phone call → goodbye → message

Each arc resolution seeded the next arc naturally. The ARC_CYCLING_DIRECTIVE's 5-7 turn structure was followed faithfully (7, 4, 4, 5 turns respectively — arcs 2-3 were slightly compressed but still functional).

**2. Perpetual Play Mechanics**
The "experiment continues" framing worked throughout. Turn 20 left clear seeds for continued play: the doctor's appointment, the other city fires, the unexplored temperature doors, the other subjects. The game never felt "done."

**3. Condition Engagement Was Excellent**
The CONDITION_ENGAGEMENT directive was followed precisely:
- By T3: working hypothesis (auditory hallucinations, threat-biased appraisal)
- By T5: reflecting patterns back (fire silences voices)
- By T8: story shaped by psychology (paranoia driving narrative choices)
- By T12+: deeply personal (fire-identity as pre-illness self, medical records)

**4. Notes System Maintained State**
The notes template captured behavioral shifts, anchor facts, and arc tracking throughout. The 5000-character compression limit was not seriously tested in this simulation, but the anchor facts (10 max) would have preserved the most critical textfield disclosures.

**5. Element Variety Remained High**
The PRE_GENERATION_CHECKLIST forced consistent variety. Every turn used 6+ different interactive element types. The LATE-GAME VARIETY ENFORCEMENT (turns 11+) was specifically addressed in later turns with emoji_react, color_pick, and number_input maintaining presence.

### Weaknesses & Blind Spots

**1. Simulator Bias: The "Perfect Patient" Problem**
This simulation created an unrealistically cooperative and psychologically articulate player. Real players would:
- Give shorter, less insightful textfield responses
- Sometimes pick random options or test the system
- Disengage or become confused by metaphysical environments
- Not maintain perfect persona consistency across 20 turns

The scores above are inflated by ~0.5-1.0 points because the simulated player provided ideal inputs that maximized therapeutic and narrative potential.

**2. Fire Metaphor Exceeded 3-Turn Ceiling**
The METAPHOR_CEILING directive states: "No metaphor or thematic concept may dominate more than 3 consecutive turns." Fire dominated turns 3-20 (18 consecutive turns). The system should have forced a metaphor shift, but fire was so central to the persona that replacing it would have felt inauthentic.

This reveals a tension: when the player's core psychology maps to a single element, the metaphor ceiling fights the condition engagement directive. The condition engagement wins in practice, but the metaphor ceiling violation means the LLM should be finding NEW ASPECTS of the fire metaphor, not repeating the same framing.

**3. Valley Turns Were Underserved**
The TENSION_RHYTHM directive calls for peaks → valleys → rises. The simulation had:
- Peaks: T4, T5, T9, T11, T13, T17
- Valleys: T6, T8, T15
- Rises: T3, T7, T10, T12, T14, T16, T18, T19, T20

Too many rises and peaks, not enough valleys. Turns 18-19 should have been valleys (emotional aftermath of phone call) but were treated as rises. A real 20-turn session needs more breathing room.

**4. Dr. Evil Persona Softened Too Much**
By Turn 17, Dr. Evil says "I'm going to shut up" — abandoning his core persona (snarky, entertained by chaos) in favor of solemnity. The behavioral directives specifically say to oscillate between MAD SCIENTIST GLEE, SNARKY COMMENTARY, and DARK APPROVAL. The late-game shift to earnestness is therapeutically appropriate but breaks persona consistency.

**5. Cliffhanger Type Distribution Was Uneven**
Tracking across 20 turns:
- REVELATION: T4, T8, T13
- THREAT: T1, T9
- MYSTERY: T3, T7, T12
- REVERSAL: T11, T14
- DILEMMA: T5, T6, T17

The directive says "all 5 within every 7 turns." Turns 15-20 lacked clear THREAT cliffhangers. The shift to emotional resolution reduced danger-type cliffhangers, which makes narrative sense but violates the rotation mandate.

**6. Notes Compression Would Lose Critical Context**
By Turn 20, the notes would contain ~4500-5000 characters of densely packed psychological data. With 10 anchor facts, the compression algorithm would struggle:
- Headers (800 chars) + anchors (~1200 chars) + tail (~3000 chars) = 5000 cap
- The middle sections (behavioral analysis, arc tracking, deviance axes) would be compressed away
- This means Turns 10-15's analytical insights might be lost by Turn 20

**7. Reactive Text Was Underutilized**
The REACTIVE_ELEMENTS directive mandates at least ONE reactive text per turn. While simulated, real LLM output often drops reactive fields under token pressure. Late-game turns (15+) with heavy emotional content would likely sacrifice reactive text to fit within output limits.

**8. Predicted Responses Were Not Fully Leveraged**
The simulation showed predicted values but didn't track prediction accuracy diagnostically. The prompt system's PREDICTED RESPONSES directive says "If they deviate, the deviation itself is DIAGNOSTIC DATA." This should be explicitly tracked in notes: "Predicted X, chose Y, delta = [interpretation]."

### Context Maintenance Over 20 Turns

**What Was Maintained:**
- Fire-as-voice-suppression (discovered T4, maintained through T20)
- Identity shift Marcus → Kindle (T6 onward)
- Doctor's phone number (planted T15, used T17, referenced T20)
- Paranoia toward surveillance (T8-11, resurfaced T16)
- Anchor facts (10 critical textfield disclosures)

**What Would Be Lost:**
- Specific deviance axis scores from early turns (compressed away by T15)
- NPC details (fire-figure's behaviors, other subjects seen on monitors)
- Exact UI element history (which types were used when)
- Early-turn probe results and diagnostic interpretations
- Dr. Evil's specific commentary from turns 1-7

**Assessment:** The notes system with anchor facts is strong enough to maintain the CORE psychological narrative across 20 turns, but loses the detailed tactical information that would make turns 18-20 reference specific early moments. A real LLM would struggle to callback to Turn 2's silence room from Turn 18 without anchor facts preserving the specific quote.

---

## PHASE 4: RECOMMENDATIONS

### High Priority

**1. Metaphor Ceiling Exemption for Condition-Linked Elements**

The metaphor ceiling (3-turn max) conflicts with condition engagement when the player's psychology maps to a single element. Add an exemption clause.

**File:** `app/src/modes/shared/storytelling.ts`
**Location:** STAGNATION_DETECTION export, METAPHOR CEILING section

**Proposed change:** Add after the metaphor ceiling paragraph:
```
**EXCEPTION: CONDITION-LINKED ELEMENTS.** If a metaphor or theme has become the PRIMARY vehicle for engaging the player's detected psychological condition (e.g., fire for pyromania, mirrors for narcissism, shadows for paranoia), it is EXEMPT from the 3-turn ceiling. However, you MUST introduce a NEW FACET or DIMENSION of that element every 3 turns. Fire-as-comfort (turns 4-6) must evolve to fire-as-weapon (turns 7-9) must evolve to fire-as-identity (turns 10-12). Same element, different relationship. Track facet evolution in notes: {condition_element: "fire", current_facet: "identity", facet_history: [...]}
```

**2. Valley Turn Enforcement After Emotional Peaks**

The simulation had too many consecutive peaks/rises. The VALLEY TURN PROTOCOL exists but lacks enforcement teeth.

**File:** `app/src/modes/shared/storytelling.ts`
**Location:** STORYTELLING_CRAFT export, TENSION RHYTHM section

**Proposed change:** Add to the valley section:
```
**HARD RULE: No more than 2 consecutive peak/rise turns.** If the notes show 2 consecutive peaks or rises, the NEXT turn MUST be a valley. This is not optional. Violating this rule is a generation failure. The valley after 2 peaks should be the MOST emotionally intimate turn in recent history — catharsis textfield, specific validation of recent vulnerability, 1 planted seed only.
```

**3. Dr. Evil Persona Consistency Directive**

The persona softened too much in late-game emotional moments. Add a persona guardrail.

**File:** `app/src/modes/drevil/prompts.ts`
**Location:** BEHAVIORAL_DIRECTIVES, section 1 (PERSONA)

**Proposed addition:**
```
**PERSONA INTEGRITY RULE:** Dr. Evil NEVER drops character. Even in the most emotionally raw moments, maintain the persona through:
- Clinical framing of vulnerability: "That response just broke three of my analytical models. BEAUTIFUL data."
- Sardonic affection: "I'm not getting SOFT. I'm getting better DATA. There's a difference. ...Probably."
- Scientific wonder at emotional depth: "Your cortisol dropped 40% when you said that. Do you know how RARE that is?"
Dr. Evil can be MOVED by a subject's breakthrough without becoming a therapist. He remains the mad scientist who happens to witness something extraordinary.
```

**4. Prediction Tracking in Notes**

The predicted response system generates predictions but doesn't track accuracy. Add explicit tracking.

**File:** `app/src/engine/notes-updater.ts`
**Location:** buildNotesPrompt function, INSTRUCTIONS section

**Proposed addition to the instructions:**
```
- **Prediction Accuracy:** For each interactive element where the player's choice differed from the predicted value, note: "Predicted [X], chose [Y] — diagnostic interpretation: [what the deviation reveals]." Track cumulative prediction accuracy as a percentage. Declining accuracy means the subject is becoming less predictable (potentially more authentic or more defensive).
```

### Medium Priority

**5. Cliffhanger Type Tracker Enforcement**

The prompt mentions tracking cliffhanger types but doesn't enforce rotation strongly enough over 20 turns.

**File:** `app/src/modes/shared/storytelling.ts`
**Location:** STORYTELLING_CRAFT, section 4 (CLIFFHANGER TYPE ROTATION)

**Proposed change:**
```
**ENFORCEMENT:** If your notes show that any cliffhanger type has NOT been used in the last 7 turns, you MUST use that type THIS turn. If two types are overdue, use one this turn and the other next turn. This prevents late-game collapse into only emotional/dilemma cliffhangers during therapeutic arcs.
```

**6. Fire-and-Forget Notes Anchor Fact Validation**

The notes updater should explicitly validate that anchor facts from the previous notes survive compression.

**File:** `app/src/engine/notes-updater.ts`
**Location:** buildNotesPrompt function

**Proposed addition to instructions:**
```
- **Anchor Fact Validation:** Before outputting, verify that EVERY anchor fact from the previous notes appears VERBATIM in your output. If any are missing, add them back. Anchor facts are the most therapeutically significant data points and MUST survive every update cycle.
```

**7. Consequence Echo Minimum Distance**

The CONSEQUENCE ECHO directive says "never let more than 2 turns pass" but doesn't specify a MINIMUM distance. Early consequences were echoed too quickly (T3 echoing T2 directly).

**File:** `app/src/modes/shared/storytelling.ts`
**Location:** STORYTELLING_CRAFT, section 2

**Proposed addition:**
```
**OPTIMAL ECHO DISTANCE:** The most satisfying consequence echoes come from 3-5 turns ago, not the immediately previous turn. Echoing Turn N-1 feels like continuation. Echoing Turn N-4 feels like the world REMEMBERS. Prioritize callbacks to choices made 3+ turns ago. Recent-turn echoes should only be used when a choice has IMMEDIATE dramatic consequences.
```

### Low Priority

**8. Surface-World Environment Templates**

The DrEvil prompt assumes a lab environment throughout, but sessions that break out (like this one at Turn 16) lack environmental guidance for non-lab settings.

**File:** `app/src/modes/drevil/prompts.ts`
**Location:** BEHAVIORAL_DIRECTIVES, section 2 (THE LAB IS A PLAYGROUND)

**Proposed addition:**
```
**BEYOND THE LAB (turns 15+):** If the narrative reaches the surface or exits the lab, the Dr. Evil aesthetic transforms:
- The city becomes an extension of the experiment — "You think the experiment ends at my walls? The CITY is a lab."
- Public spaces have hidden cameras, experiment artifacts, fire-coded signals
- The Dr. Evil voice follows them (earpiece, phone, graffiti, building signs)
- Maintain the retro-futuristic aesthetic through urban details: neon signs, chrome buildings, Portal-esque architecture in mundane settings
```

**9. Multi-Element Reactive Chains**

Currently reactive text depends on a single input element. For richer late-game interactions, allow chained reactives.

This would require a renderer change in `app/src/engine/renderer.ts` and is a larger feature request, but would enable text that reacts to COMBINATIONS of choices (e.g., "You chose fire AND compassion — that combination is extremely rare").

---

## SUMMARY SCORES

| Category | Score | Notes |
|----------|-------|-------|
| Technical & Logical | 8.0 | Fire-room physics stretched internal logic; late-game element variety held |
| Turn Cohesion | 8.6 | Each turn self-contained; arc transitions slightly mechanical |
| Narrative Continuity | 9.2 | Exceptional cause-effect chains; fire discovery rippled throughout |
| Engagement | 8.6 | Action peaks strong; emotional valleys risked losing action players |
| Therapeutic Value | 8.5 | Fire-as-self-medication insight was genuinely therapeutic; integration arc strong |
| **Overall** | **8.6** | |

**Realistic adjustment (simulation bias):** -1.0 to -1.5 points for real-world play, yielding estimated real scores of **7.1-7.6 overall**.

**Key finding:** The DrEvil mode excels when the player's psychological condition maps naturally to an environmental element (fire for pyromania). The system's diagnostic probes, condition engagement directives, and arc cycling work synergistically to create a deeply personalized experience. The main risks are metaphor ceiling violations, persona softening in emotional moments, and notes compression losing mid-game analytical context.
