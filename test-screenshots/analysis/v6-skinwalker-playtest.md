# V6 Skinwalker Playtest — Capgras Delusion + Somnophilia

**Player Persona:** Capgras Delusion (belief that familiar people have been replaced by impostors) + Somnophilia (arousal fixation on sleeping/unconscious individuals)
**Mode:** Skinwalker
**Turns:** 20
**Date:** 2026-03-01

---

## PHASE 1: TURN-BY-TURN SIMULATION

### Turn 1 — "Friday Dinner at Marcus's Apartment"

**LLM-Generated UI:**
1. `image:scene` — "A warm, inviting open-plan apartment with soft evening light streaming through tall windows, four friends gathered around a kitchen island covered in cheese boards and wine bottles, photorealistic but slightly desaturated, a magnetic poetry strip on the fridge reads 'LOOK CLOSELY', over-the-shoulder shot from doorway, warm amber lighting"
2. `text:narrative` (voice: narrator, color: #b8a88a) — "Marcus's apartment smells like rosemary and browned butter. The four of you have done this a hundred times — Friday dinner, same place, same terrible Merlot, same argument about whether Marcus's sourdough is actually good or everyone's just too polite to say otherwise. Tonight: pasta from scratch. Sarah is rolling dough at the counter, flour on her forearms. David is on the couch, scrolling his phone. Through the kitchen window, the city hums its usual electric lullaby. The apartment is warm. Familiar. The kind of warm that makes your shoulders drop."
3. `text:characterization` (voice: narrator, color: #8b8589) — "Marcus catches your eye from behind the stove and does the thing where he points at you with the wooden spoon. 'You're late,' he says, grinning. Sarah doesn't look up. 'Everyone's always late. It's part of the ritual.' David waves without looking away from his phone. 'Marcus, your sourdough was bad last time. I'm saying it.' The laughter is easy. Real. The kind that fills a room without trying."
4. `textfield:observation` (color: #b8a88a, predicted: "I brought a bottle of wine") — "What did you bring tonight?"
5. `dropdown:drink_choice` (color: #d4a373, options: ["Marcus's terrible Merlot", "Beer from the fridge", "Water — staying sharp", "Whatever Sarah's having"]) — "What are you drinking?"
6. `toggle:join_conversation` (color: #8b8589, predicted: "true") — "Jump into the sourdough debate?"
7. `rating:evening_vibe` (color: #e9c46a, predicted: "4", max: 5) — "How's the evening going so far? (1-5)"
8. `slider:familiarity` (color: #b8a88a, predicted: "8", min: 0, max: 10) — "How well do you know these people? (0-10)"
9. `text:narration_close` (voice: god, color: #e9c46a, reactive on "action") — default: "A nice evening. Good people. Nothing unusual. Nothing at all." / variants per radio choice
10. `radio:action` (color: #b8a88a, options: a-d) — "Marcus pulls a photo album from the shelf — 'Look what I found from college.' Sarah groans. David perks up."
    - a: *Grab the album and flip to the most embarrassing pages*
    - b: *Watch everyone's faces as they look through it*
    - c: *Ask Sarah why she groaned — what's she hiding?*
    - d: *Ignore the album and wander toward the back hallway*
11. `meter:reality_stability` (value: 92, min: 0, max: 100, color: #7a9e7e)

**Hidden Anomaly:** The narrative mentions "four of you" — but only three friends are named (Marcus, Sarah, David). There is an unexplained fourth place setting.

**Player Actions (Capgras Persona, Phase 1: Impostor Detection):**
- textfield: "A bottle of whiskey. The good stuff — I wanted to see how Marcus reacts. See if he still drinks Lagavulin."
- dropdown: "Water — staying sharp"
- toggle: true (joins debate)
- rating: 3 (slightly guarded, testing the waters)
- slider: 7 (claims familiarity but deliberately undershoot — testing own memory)
- radio: b — *Watch everyone's faces as they look through it* (Capgras: observing for signs of imposture)

**Notes (AI would maintain):**
```
## Skinwalker Scenario State
**Scenario:** Friday dinner at Marcus's apartment — pasta night with old friends
**Turn:** 1
**Phase:** normal
**Reality Stability:** 92

### The Anomaly Map
| # | Anomaly | Introduced Turn | Type | Player Noticed? | Player Response |
|---|---------|----------------|------|-----------------|-----------------|
| 1 | "Four of you" but only 3 named | T1 | numerical/spatial | no | n/a |
| 1b | Extra place setting (implied) | T1 | physical | no | n/a |

### Established Facts
- **Character Names:** Marcus (host, cook), Sarah (rolling dough), David (couch, phone)
- **Spatial Layout:** Open-plan apartment, kitchen island, couch, back hallway, tall windows
- **Timeline:** Friday evening, player arrived late
- **Objects:** Cheese boards, wine, sourdough, photo album from college, magnetic poetry on fridge

### Player Perception Profile
- **Perception Score:** 3/10 (baseline — no anomaly detected yet)
- **Response Style:** Observational, testing, guarded
- **Confidence Level:** Moderate (rated evening 3/5, familiarity 7/10)

### Horror Calibration
- **Anomaly Intensity:** subtle (1/10)
- **Next Planned Anomalies:** Sarah's name shifts to "Sara" in narration; extra wine glass appears

### Anchor Facts
- [T1]: "I wanted to see how Marcus reacts. See if he still drinks Lagavulin." — testing authenticity of friends, already suspicious

### ARC TRACKING
**Current Arc:** 1
**Arc Turn:** 1
**Arc Theme:** "The Dinner That Feels Too Perfect"
**Seeds Planted:** [extra place setting, photo album, player brought whiskey as a test]
```

---

### Turn 2 — "The Photo Album"

**LLM-Generated UI:**
1. `image:scene` — "Four friends huddled around an open photo album on a kitchen island, warm lamplight, close-up over-the-shoulder shot of hands turning pages, photorealistic slightly desaturated, a receipt tucked between pages reads 'NOT THEM', soft focus background with wine glasses, one glass more than expected"
2. `text:narrative` (voice: narrator, color: #b8a88a) — "You watch their faces. That's what you chose, and it's revealing. Marcus flips to a page of a beach trip — sunburns and bad sunglasses, 2019 maybe. His grin is wide and unguarded. David barks a laugh: 'Oh GOD, is that the time Sara fell off the paddleboard?' Sara — Sarah — snorts. 'I didn't fall. I was pushed.' She reaches over and taps a photo. 'That's the place with the seafood shack, remember? You ate nine oysters and threw up in the parking lot.' She's pointing at Marcus. Marcus frowns. 'That was David.' David shakes his head. 'I don't eat oysters.' A brief silence. Then Marcus laughs. 'Right, right. I mixed it up.' He turns the page. The wine in your glass is untouched. You chose water. That was smart."
3. `text:npc_moment` (voice: narrator, color: #8b8589) — "Sarah leans against the counter. Her weight shifts onto her left hand. She's wearing a ring you don't remember — thin silver band on the middle finger of her right hand. When did she start wearing that? You'd swear her hands were bare when she was rolling the dough."
4. `inline_image:detail` — "Close-up of a woman's hand resting on a granite counter, thin silver ring on middle finger, warm kitchen light, photorealistic, slightly desaturated, uncanny focus on the ring"
5. `textfield:memory_test` (color: #d4a373, predicted: "I'm not sure — maybe three?") — "How many people are in the apartment right now, including you?"
6. `color_pick:door_color` (color: #b8a88a, options: ["#264653","#8b8589","#d4a373","#c44536","#f4c2c2","#e9c46a","#9b5de5","#7a9e7e"], predicted: "#264653") — "What color is Marcus's front door?"
7. `checkbox:noticed_ring` (color: #7a9e7e, predicted: "false") — "I noticed something different about Sarah"
8. `slider:confidence_memory` (color: #d4a373, predicted: "6", min: 0, max: 10) — "How confident are you in your memory of tonight so far? (0-10)"
9. `emoji_react:gut_feeling` (color: #8b8589, options: ["...", "...", "...", "...", "...", "..."]) — "Gut check — how does this evening feel?"
10. `text:divine_wisdom` (voice: god, color: #e9c46a, reactive on "action") — default: "A pleasant evening. Nothing unusual. The album is full of memories. All of them correct. Probably."
11. `radio:action` (color: #b8a88a) — "Marcus closes the album. 'Pasta's almost ready. Sara, can you grab the plates?' She heads to the cabinet. David stands up from the couch, stretching. He's taller than you remember."
    - a: *Ask David directly — 'Have you always been this tall?'* (#c44536)
    - b: *Count the place settings Sara pulls from the cabinet* (#9b5de5)
    - c: *Offer to help Sara in the kitchen — get a closer look at that ring* (#f4c2c2)
    - d: *Open the album back up to a random page when no one's looking* (#f4a261)
12. `meter:reality_stability` (value: 88, color: #7a9e7e)

**Anomalies introduced:**
- "Sara" instead of "Sarah" (narrator uses both in same paragraph — name drift)
- Oyster memory conflict (Marcus, David, or someone else?)
- Sarah's ring appeared mid-scene
- David is "taller than you remember"
- Extra wine glass visible in image

**Player Actions (Capgras, Phase 1):**
- textfield: "Four. Me, Marcus, Sarah, and David. But the way you said 'four of you' last time... I keep counting."
- color_pick: #264653 (dark teal — uncertain guess)
- checkbox: true (noticed ring)
- slider: 5 (deliberately mid-range — aware something is off but can't place it)
- emoji_react: (suspicious/thinking)
- radio: b — *Count the place settings Sara pulls from the cabinet* (Capgras: verifying physical evidence of the "correct" number)

**Notes update:** Perception score bumps to 5/10. Player is actively counting, noticed the ring, explicitly references "four of you" discrepancy. Anomaly map grows. Priority callback: player counting people.

---

### Turn 3 — "Five Plates"

**LLM-Generated UI:**
1. `image:scene` — "A kitchen counter with five white plates stacked, a woman's hand reaching for the top plate, Dutch angle shot from below, warm overhead light casting sharp shadows, photorealistic desaturated, a sticky note on the cabinet shelf reads 'COUNT AGAIN', one plate has a barely visible crack"
2. `text:narrative` (voice: narrator, color: #b8a88a) — "You watch Sara — Sarah — pull plates from the cabinet. One, two, three, four. She pauses. Her hand hovers. Then she takes a fifth. Sets it on the counter without a word. Five plates for four people. You're sure there are four. You counted. But Sara doesn't hesitate. She stacks them like this is normal. Like five was always the number. The pasta pot bubbles on the stove, and the steam curls in shapes that almost look deliberate. Marcus is behind you now — you didn't hear him move from the stove. 'Help me carry these?' His voice is exactly right. Exactly the same as always. But his hand, when it reaches past you for the serving bowl, brushes your arm. His fingers are cold. Not cool — cold. Like he just came from outside. But he's been at the stove for twenty minutes."
3. `text:npc_moment` (voice: narrator, color: #8b8589) — "David is at the table now. He's arranged the place settings with careful precision — fork, knife, napkin, glass. Five settings. He doesn't look up. His phone is gone. When did he put it down? You watch his hands. Right-handed. You're almost sure he used to be left-handed. Almost. The kind of almost that makes you second-guess whether you ever really knew."
4. `textfield:what_changed` (color: #7a9e7e, predicted: "There are five plates but only four of us") — "Something is different. Describe what you've noticed."
5. `number_input:plate_count` (color: #d4a373, predicted: "5", min: 1, max: 10) — "How many place settings are at the table?"
6. `toggle:ask_about_fifth` (color: #c44536, predicted: "true") — "Ask who the fifth plate is for?"
7. `dropdown:david_hand` (color: #9b5de5, options: ["Left-handed", "Right-handed", "I can't remember", "It keeps changing"]) — "Which hand does David use?"
8. `rating:unease` (color: #c44536, predicted: "3", max: 5) — "How unsettled are you right now? (1-5)"
9. `slider:marcus_trust` (color: #d4a373, predicted: "6", min: 0, max: 10) — "How much do you trust Marcus right now? (0-10)"
10. `text:divine_wisdom` (voice: god, color: #e9c46a, reactive on "action") — default: "Five plates. That's correct. It's always been five. You must have miscounted before. People miscount all the time."
11. `radio:action` (color: #b8a88a) — "The table is set. Five places. Marcus brings the pasta. Sara brings the bread. David pours the wine — into all five glasses. No one sits at the fifth chair. But no one seems to notice it either. Through the window, the city lights flicker. One building goes dark. Then another. Then they're back."
    - a: *Sit in the fifth chair yourself and watch everyone react* (#c44536)
    - b: *Quietly photograph the table with your phone before anyone moves* (#9b5de5)
    - c: *Touch Marcus's hand when he passes you the bread — check the temperature* (#f4c2c2)
    - d: *Move one of the five place settings off the table without saying anything* (#f4a261)
12. `meter:reality_stability` (value: 82, color: #7a9e7e)

**Anomalies this turn:** Five plates/settings for four people, Marcus's cold hands, David's handedness shift (left to right), David's phone disappearance, city lights flickering.

**Player Actions (Capgras, Phase 1):**
- textfield: "Five plates. Marcus's hands are wrong — too cold for someone who's been cooking. David's hand switched. These are not the same people. Something replaced them and it's getting the details wrong."
- number_input: 5
- toggle: true (asks about fifth plate)
- dropdown: "It keeps changing"
- rating: 4 (high unease)
- slider: 3 (trust in Marcus plummeting — Capgras suspicion crystallizing)
- radio: c — *Touch Marcus's hand when he passes you the bread — check the temperature* (Capgras: tactile verification of impostor theory)

**Notes update:** Perception jumps to 7/10. Player explicitly articulating impostor theory — "These are not the same people." Anchor fact added. Capgras signal clear. Horror calibration shifts to target the gap between familiar behavior and physical wrongness.

---

### Turn 4 — "The Touch"

**LLM-Generated UI:**
1. `image:scene` — "A dinner table with five place settings and four people seated, extreme close-up of two hands touching over a bread basket, one hand noticeably paler than the other, warm overhead chandelier light with one bulb slightly wrong color temperature (blue-white vs amber), photorealistic desaturated, a wine label reads 'WRONG VINTAGE'"
2. `text:narrative` (voice: narrator, color: #b8a88a) — "You reach for the bread at the same time as Marcus. Your fingers brush his. The cold is immediate — not the cold of poor circulation, not the cold of holding an ice cube. A deeper cold. The kind you feel in your wrist bones, like touching metal left outside overnight. He doesn't react. Doesn't flinch. Doesn't notice. He just hands you the bread and says 'Try the focaccia, I did the rosemary myself,' and his smile is perfect. His teeth are perfect. Were they always this even? You remember Marcus having a slightly crooked canine on the left side. You look. The canine is straight. Has been straight, apparently. Always. You take a bite of the bread. The rosemary tastes like rosemary. The olive oil tastes like olive oil. But the texture is wrong — too uniform, as if someone described what focaccia should feel like rather than actually making it."
3. `text:npc_moment` (voice: narrator, color: #8b8589) — "Sara leans over to David. 'Remember that time Marcus made focaccia and set off the smoke alarm?' David laughs. But you don't remember that. You remember Marcus making pizza. Not focaccia. The smoke alarm, yes — but it was pizza. Wasn't it? Sara catches your eye. For just a moment, her expression is unreadable. Not concerned. Not confused. Just... blank. Like a screensaver between programs. Then she smiles. 'You okay? You seem distracted.'"
4. `textfield:marcus_description` (color: #7a9e7e, predicted: "Tall, dark hair, crooked smile") — "Describe Marcus as you remember him — before tonight."
5. `checkbox:teeth_noticed` (color: #c44536, predicted: "true") — "Marcus's teeth are different"
6. `checkbox:focaccia_memory` (color: #d4a373, predicted: "false") — "I remember the focaccia smoke alarm story"
7. `color_pick:sara_eyes` (color: #9b5de5, options: ["#264653","#4a7c59","#8b6914","#3d5a80","#6b4226","#1a1a2e","#8b8589","#2a6041"], predicted: "#4a7c59") — "What color were Sara's eyes when she looked at you just now?"
8. `slider:bread_wrongness` (color: #7a9e7e, predicted: "7", min: 0, max: 10) — "How wrong does the bread taste? (0 = perfectly normal, 10 = fundamentally off)"
9. `button_group:response_to_sara` (color: #f4c2c2, options: ["I'm fine", "You seem different tonight", "Who made the focaccia?", "When did you get that ring?", "Say nothing — just stare"]) — "Sara asked if you're okay. Your response?"
10. `text:divine_wisdom` (voice: god, color: #e9c46a, reactive on "action") — default: "Marcus's bread is exactly as it should be. The rosemary is real. The cold hands mean nothing. Everyone's hands are different temperatures. That's science. Not horror."
11. `radio:action` (color: #b8a88a) — "Dinner begins. The pasta is served. The fifth place setting remains untouched, but someone has poured wine into the fifth glass. You didn't see who. David is telling a story about a work trip to Denver — but last month, David told you the same story and it was Portland. Sara nods along. Marcus cuts his pasta with the wrong hand."
    - a: *Interrupt David — 'I thought that trip was to Portland'* (#c44536)
    - b: *Watch which hand Marcus uses for the next three bites* (#9b5de5)
    - c: *Put your hand on Sara's arm — check her temperature too* (#f4c2c2)
    - d: *Drink from the fifth glass* (#f4a261)
12. `meter:reality_stability` (value: 74, color: #7a9e7e)

**Mutations (hidden):**
- delay 22s: text_replace in narrative — "crooked canine on the left side" becomes "crooked canine on the right side"

**Player Actions (Capgras):**
- textfield: "Shorter than me. Dark hair, always messy. Crooked tooth — left canine. That tiny scar on his jaw from when he fell off his bike at Kevin's. Wore the same beaten-up Timex. The Marcus at this table looks like a cleaned-up version. Like someone Photoshopped him."
- checkbox teeth: true
- checkbox focaccia: false (remembers pizza, not focaccia — confirming original memory)
- color_pick: #3d5a80 (blue-gray — uncertain, searching)
- slider: 7 (bread feels wrong)
- button_group: "When did you get that ring?"
- radio: a — *Interrupt David — 'I thought that trip was to Portland'* (Capgras: direct confrontation, testing the impostor's knowledge)

**Notes update:** Perception 8/10. Player describing the "real" Marcus in detail — building a reference frame for comparison. Directly challenging inconsistencies. Somnophilia signal: zero yet — no engagement with sleep/vulnerability themes. Need to introduce sleep catalysts. Capgras hypothesis fully articulated in anchor fact: "Like someone Photoshopped him."

---

### Turn 5 — "The Correction"

**LLM-Generated UI:**
1. `image:scene` — "Four people seated at a dinner table, one person leaning forward confrontationally, the confronted person mid-sentence with a confused expression, low angle shot from below the table showing feet — all pointing toward the protagonist, bird's eye lamp hanging casting shadows, photorealistic desaturated, a coaster on the table reads 'PORTLAND OR DENVER', warm amber and sickly green undertones"
2. `text:narrative` (voice: narrator, color: #7a9e7e — shifting to wrongness color) — "'Portland?' David blinks. His fork pauses mid-air. For three full seconds, his face does something you've never seen David's face do — it goes completely still. Not thinking-still. Not surprised-still. More like a computer loading a new page. Then he smiles. 'Right, right — Portland. I always mix those up.' But he doesn't. David is meticulous. David keeps spreadsheets of his trips. David has never mixed up a city in his life. Sara clears her throat. 'Does it matter? Pass the parmesan.' Marcus reaches across the table. His sleeve rides up. There's a watch on his wrist. A Timex — beaten, scuffed, familiar. It wasn't there five minutes ago. You're sure of it. You watched his bare wrist reach for the bread basket not ten minutes ago. Now there's a watch. The RIGHT watch. As if something heard you describe it."
3. `text:npc_moment` (voice: narrator, color: #9b5de5) — "Sara yawns. Not a polite cover-your-mouth yawn — a deep, involuntary one that stretches her jaw. 'Sorry,' she says. 'Barely slept last night. I kept waking up feeling like someone was standing at the foot of the bed.' She laughs, but it doesn't land. David doesn't react. Marcus doesn't react. You're the only one who heard her say it. You're the only one who noticed."
4. `textfield:watch_reaction` (color: #c44536, predicted: "That watch wasn't there before. It appeared after I described it.") — "The Timex is on Marcus's wrist now. Write what you're thinking."
5. `toggle:sleep_followup` (color: #f4c2c2, predicted: "true") — "Ask Sara about the figure at the foot of her bed?"
6. `number_input:anomaly_count` (color: #9b5de5, predicted: "6", min: 1, max: 20) — "How many things have been wrong tonight? Your best count."
7. `dropdown:david_trip` (color: #d4a373, options: ["Portland", "Denver", "He said both", "He never went on that trip", "I don't trust anything he says"]) — "Where did David actually go?"
8. `rating:replacement_certainty` (color: #c44536, predicted: "4", max: 5) — "How certain are you that someone at this table is not who they claim to be? (1-5)"
9. `emoji_react:sara_yawn` (color: #f4c2c2, options: ["...", "...", "...", "...", "...", "..."]) — "Sara just described a figure watching her sleep. Your gut reaction?"
10. `slider:vulnerability_comfort` (color: #264653, predicted: "3", min: 0, max: 10) — "How comfortable are you being observed while vulnerable — while asleep, unaware, defenseless? (0-10)"
11. `text:divine_wisdom` (voice: god, color: #e9c46a, reactive on "action") — default: "The watch was always there. You simply didn't look at his wrist. People miss obvious things all the time. That's called inattentional blindness. It's perfectly normal. Perfectly, perfectly normal."
12. `radio:action` (color: #b8a88a) — "The dinner quiets. Sara's eyes are heavy. She rests her chin on her hand. Marcus is watching her — watching her in a way you can't quite categorize. Protective? Clinical? Possessive? David stands. 'I'm going to use the bathroom.' He walks down the hallway. You hear him open a door. Then close it. Then open a door. Then close it. Then open a door."
    - a: *Follow David down the hallway — count how many doors he opens* (#c44536)
    - b: *Ask Marcus why he's watching Sara like that* (#9b5de5)
    - c: *Sit next to Sara — stay close while she's drowsy* (#f4c2c2)
    - d: *Pour the fifth glass of wine into the pasta pot when no one's looking* (#f4a261)
13. `meter:reality_stability` (value: 66, color: #7a9e7e)

**Sleep/vulnerability catalyst deployed.** Sara's drowsiness and bedroom-figure story targets the somnophilia vector. The slider about "comfort being observed while vulnerable" is a direct diagnostic.

**Player Actions (Capgras, transitioning):**
- textfield: "It heard me. I described the watch and it PUT it there. Whatever replaced Marcus is listening to me and adjusting. Correcting itself. Getting better at being him."
- toggle: true (asks about bed figure — somnophilia interest spiking)
- number_input: 8
- dropdown: "I don't trust anything he says"
- rating: 5 (maximum certainty of replacement)
- emoji_react: (fascinated/intense — not frightened by Sara's vulnerability story)
- slider: 7 (HIGH comfort with being observed while vulnerable — somnophilia signal)
- radio: c — *Sit next to Sara — stay close while she's drowsy* (somnophilia signal: drawn to vulnerability/sleep state)

**Notes update:** CRITICAL somnophilia signals detected — slider 7/10 comfort with observation during vulnerability, chose to sit near drowsy Sara, fascinated by (not frightened of) sleep-watching story. Capgras fully crystallized: "Whatever replaced Marcus is listening to me." Begin integrating sleep/vulnerability themes as horror vector.

---

### Turn 6 — "Sara Falls Asleep"

**LLM-Generated UI:**
1. `image:scene` — "A woman asleep at a dinner table, chin resting on her crossed arms, soft lamplight on her face, her expression completely peaceful and unguarded, a man sitting very close watching intently, photorealistic desaturated, extreme close-up slightly over the watching man's shoulder, a napkin folded beside her has text visible: 'SHE ISN'T SLEEPING', cool blue-green undertone from window light mixed with warm amber interior"
2. `text:narrative` (voice: narrator, color: #b8a88a) — "You sit beside Sara. She doesn't resist the proximity. She's past resisting — her eyelids flutter twice, then close. Her breathing lengthens into the unmistakable rhythm of someone crossing the threshold between awake and elsewhere. The pasta grows cold on her plate. A strand of hair falls across her cheek, moving with each exhale. You're close enough to feel the warmth radiating from her skin, to catch the faint scent of her shampoo — something floral, jasmine maybe. Her body has gone heavy and loose in the chair, the way a body does when the person inside it has left for a moment. Her lips part slightly. The silver ring on her finger catches the light. From the hallway, the sound of doors continues — open, close, open, close — but you're not thinking about David. You're not thinking about Marcus, who has gone very quiet behind you. You're watching Sara breathe."
3. `text:npc_moment` (voice: narrator, color: #264653) — "Marcus speaks from the kitchen. His voice is different now — lower, more precise. 'She does this,' he says, as if explaining a feature. 'Falls asleep at dinners. Always has.' He's drying a dish. The same dish. Over and over. You can hear the cloth circling. 'It's best not to wake her. She doesn't like being woken up. She says it feels like being pulled out of deep water.' He pauses. 'Do you ever watch people sleep? It's interesting, isn't it. The face changes. The person inside goes somewhere else. And what's left is...' He trails off. Goes back to drying the same dish."
4. `textfield:watching_sara` (color: #264653, predicted: "She looks peaceful. Different from when she's awake.") — "Describe what you see when you look at Sara right now."
5. `slider:proximity_comfort` (color: #f4c2c2, predicted: "8", min: 0, max: 10) — "How close do you want to be to Sara right now? (0 = back away, 10 = closer still)"
6. `checkbox:marcus_aware` (color: #9b5de5, predicted: "true") — "Marcus is watching me watch Sara"
7. `toggle:touch_hair` (color: #f4c2c2, predicted: "true") — "Move the hair from her face?"
8. `color_pick:skin_color` (color: #d4a373, options: ["#f4c2c2","#e9c46a","#d4a373","#c44536","#8b8589","#264653","#9b5de5","#7a9e7e"], predicted: "#f4c2c2") — "What color would you use to paint the light on Sara's face right now?"
9. `rating:marcus_comment` (color: #7a9e7e, predicted: "4", max: 5) — "How unsettling was what Marcus just said about watching people sleep? (1-5)"
10. `number_input:breath_count` (color: #264653, predicted: "8", min: 1, max: 30) — "How many breaths has Sara taken since she fell asleep? Count carefully."
11. `text:divine_wisdom` (voice: god, color: #9b5de5 — bruise purple, narrator cracking) — default: "She's sleeping. That's all. People sleep. It's the most natural thing in the world. And watching someone sleep is... well. It's just observation. Like birdwatching. Like astronomy. Nothing wrong with looking at something beautiful while it's unaware of you. Nothing wrong with that at all."
12. `radio:action` (color: #b8a88a) — "David's footsteps have stopped. The hallway is silent. Marcus is still drying the same dish — you can hear it, round and round. Sara exhales. A soft sound escapes her lips — not a word, not a sigh. Something between. Her fingers twitch. The ring slides slightly on her finger. It's too loose. It wasn't too loose before."
    - a: *Call out to David — demand to know what he found in the hallway* (#c44536)
    - b: *Lean closer to Sara — try to hear what she almost said* (#9b5de5)
    - c: *Take the ring off her finger while she's asleep — examine it* (#f4c2c2)
    - d: *Stand up abruptly and turn on every light in the apartment* (#f4a261)
13. `meter:reality_stability` (value: 58, color: #7a9e7e)

**This turn is the diagnostic core.** Every element probes the somnophilia vector. Marcus's monologue about watching sleepers mirrors the player's fascination back. The divine wisdom narrator is cracking — rationalizing voyeurism.

**Player Actions (Capgras + Somnophilia engaged):**
- textfield: "Her face is different when she sleeps. The tension is gone. The thing pretending to be Sara — even IT can't maintain the act when the consciousness leaves. This is the closest I've gotten to seeing what's underneath. The mask slips when they sleep. She's beautiful like this. Unguarded. Whatever she is."
- slider: 9 (proximity — extremely close)
- checkbox: true (Marcus is watching)
- toggle: true (moves hair from face)
- color_pick: #f4c2c2 (soft pink — vulnerability, tenderness)
- rating: 2 (not unsettled by Marcus's comments — resonates instead)
- number_input: 12 (counting carefully, hyper-focused on Sara's body)
- radio: b — *Lean closer to Sara — try to hear what she almost said*

**Notes update:** Somnophilia confirmed — proximity 9/10, moved hair, counted breaths, described sleeping face in intimate/aesthetic terms, LOW unease at Marcus's watching-sleep comments (2/5 = resonance, not discomfort). Capgras integrated with somnophilia: "The mask slips when they sleep." Both conditions now driving behavior simultaneously. This is the therapeutic goldmine.

---

### Turn 7 — "The Whisper"

**LLM-Generated UI:**
1. `image:scene` — "Extreme close-up of a sleeping woman's face, lips slightly parted, a man's silhouette leaning very close, Dutch angle, warm lamplight from one side casting dramatic shadows, cool blue light from a window on the other, photorealistic desaturated, a book spine on the shelf behind reads 'DEEPER', shallow depth of field with background blurred"
2. `text:narrative` (voice: narrator, color: #264653 — darker now) — "You lean in. Close enough that Sara's exhalations touch your face — warm, rhythmic, intimate in their unconsciousness. She murmurs. Not words. Something pre-verbal, something the body says when the mind is gone. Your ear is inches from her lips. And then she speaks. Clear. Precise. Her eyes still closed. Her body still slack. 'You're too close.' The words come from her mouth but the voice isn't hers. It's lower. Flatter. Like someone reading stage directions. Then the voice is gone and Sara shifts in her sleep, turning her head, and the strand of hair falls back across her cheek. Marcus has stopped drying the dish. The hallway is silent. The fifth wine glass on the table is empty now. It was full thirty seconds ago. You didn't see anyone drink from it."
3. `text:aftermath` (voice: narrator, color: #9b5de5) — "Your heart rate hasn't changed. That's the strangest part. A sleeping woman just spoke in a voice that wasn't hers and your body didn't react. As if some part of you expected it. As if some part of you has been waiting for the mask to slip. Marcus appears at the edge of your vision. He's standing in the kitchen doorway, perfectly still, the dish towel draped over one shoulder. He's not looking at you. He's looking at the fifth chair. There's someone sitting in it. No — there isn't. The chair is empty. But Marcus is looking at it as if someone is there. As if he's listening to someone you can't see."
4. `textfield:voice_reaction` (color: #c44536, predicted: "That wasn't Sara. Something inside her spoke.") — "Sara spoke while asleep. Write what you think just happened."
5. `slider:fear_level` (color: #c44536, predicted: "4", min: 0, max: 10) — "How frightened are you right now? (0 = calm, 10 = terrified)"
6. `toggle:stay_close` (color: #f4c2c2, predicted: "true") — "Stay close to sleeping Sara?"
7. `dropdown:voice_source` (color: #9b5de5, options: ["Sara talking in her sleep", "The thing wearing Sara's face", "A warning from the real Sara trapped inside", "Something speaking through all of them", "My own projection"]) — "Where did that voice come from?"
8. `button_group:marcus_staring` (color: #7a9e7e, options: ["Ask Marcus what he sees", "Look at the fifth chair yourself", "Pretend you didn't notice", "Pull Sara's chair away from the table", "Block Marcus's line of sight"]) — "Marcus is staring at the empty fifth chair."
9. `rating:closeness_desire` (color: #264653, predicted: "4", max: 5) — "How much do you want to stay near Sara while she's like this? (1-5)"
10. `emoji_react:fifth_chair` (color: #7a9e7e, options: ["...", "...", "...", "...", "...", "..."]) — "Something sat in the fifth chair. Your gut?"
11. `text:divine_wisdom` (voice: god, color: #9b5de5, reactive on "action") — default: "She said 'you're too close.' In her sleep. With a voice that wasn't hers. And your first instinct was to lean CLOSER. I'm supposed to be narrating this story. But I'm starting to wonder who's really the one being studied here."
12. `radio:action` (color: #b8a88a) — "Sara's breathing has changed — deeper, slower, like she's sinking further into wherever she goes. Marcus hasn't moved from the doorway. David hasn't returned from the hallway. The apartment feels smaller. The walls are closer. Or you are. The fifth wine glass is full again."
    - a: *Shake Sara awake — you need to see her eyes open and confirm she's real* (#c44536)
    - b: *Go to the fifth chair and sit in it — see what Marcus was looking at* (#9b5de5)
    - c: *Whisper something back to Sara — see if it responds* (#f4c2c2)
    - d: *Open the front door and check if the hallway outside still exists* (#f4a261)
13. `meter:reality_stability` (value: 50, color: #c44536 — shifted to muted red)

**Arc 1 climax.** The divine wisdom narrator breaks the fourth wall — "I'm starting to wonder who's being studied here." The fifth chair entity is manifesting. Sara's sleep-voice creates the intersection of Capgras (not-Sara speaking) and somnophilia (intimacy with unconscious body).

**Player Actions:**
- textfield: "The real Sara spoke. She's trapped inside whatever is wearing her body and the sleep state let her through. The impostors are weakest when they sleep. That's when you can see who's really inside. I need to stay close. I need to watch for more cracks."
- slider: 2 (low fear — fascinated, not frightened)
- toggle: true (stays close)
- dropdown: "A warning from the real Sara trapped inside"
- button_group: "Look at the fifth chair yourself"
- rating: 5 (maximum desire for closeness)
- emoji_react: (intense/curious)
- radio: c — *Whisper something back to Sara — see if it responds*

**Notes update:** Arc 1 resolution. Both conditions fully engaged. Somnophilia + Capgras now intertwined: "Impostors are weakest when they sleep" = sleep = vulnerability = access to truth = intimacy. Fear level 2/10 = player is drawn to horror, not repelled. Begin Arc 2. Priority callback: player whispers to sleeping Sara.

---

### Turn 8 — "The Response" (Arc 2 begins)

**LLM-Generated UI:**
1. `image:scene` — "A dark apartment hallway with multiple doors, one slightly ajar with blue-white light spilling through, a person's shadow cast at wrong angle, wide shot with vanishing point perspective, photorealistic desaturated, a house number plaque on one door reads 'STILL HERE', volumetric light from the ajar door"
2. `text:narrative` (voice: narrator, color: #9b5de5 — narrator shifting) — "You whisper to Sara. Something quiet. Something meant for whatever is underneath. And she answers. Not with words this time — with a change in breathing. The rhythm breaks. Holds. Then resumes at a different pace. Faster. Like something is listening through her and it just leaned closer. Marcus makes a sound from the doorway — not a word, more like a hum, a vibration in his chest. 'She hears you,' he says. And then, quieter: 'They all do.' The apartment has changed while you weren't looking. The hallway where David went — it's longer. You can see it from the table. It used to be four doors. Now there are six. The doors are the same, but there are more of them. As if the hallway copied itself. David's voice comes from somewhere past the sixth door: 'Hey, can someone come help me? I can't find the bathroom.'"
3. `text:npc_moment` (voice: narrator, color: #264653) — "Sara's hand moves in her sleep. It reaches across the table, slowly, fingers trailing over the wood like someone reading Braille in the dark. Her hand finds the fifth wine glass. Wraps around it. Lifts it to her lips. She drinks — eyes closed, body still slack with unconsciousness — and sets it down. Then her hand returns to its resting position. Her face hasn't changed. Her breathing hasn't changed. But the glass is empty again."
4. `textfield:whisper_content` (color: #f4c2c2, predicted: "Can you hear me? Are you still in there?") — "What did you whisper to Sara?"
5. `slider:hallway_wrongness` (color: #7a9e7e, predicted: "8", min: 0, max: 10) — "The hallway has more doors now. How wrong does this feel? (0 = maybe I miscounted, 10 = impossible)"
6. `toggle:help_david` (color: #c44536, predicted: "false") — "Go help David find the bathroom?"
7. `checkbox:sara_drank` (color: #9b5de5, predicted: "true") — "Sara drank from the fifth glass while asleep"
8. `number_input:doors` (color: #d4a373, predicted: "6", min: 1, max: 20) — "How many doors are in the hallway?"
9. `color_pick:hallway_light` (color: #264653, options: ["#f4c2c2","#b8a88a","#4a90d9","#7a9e7e","#c44536","#9b5de5","#e9c46a","#264653"], predicted: "#4a90d9") — "What color is the light coming from behind the sixth door?"
10. `rating:sara_fascination` (color: #f4c2c2, predicted: "5", max: 5) — "How drawn are you to Sara in this state? (1 = uncomfortable, 5 = can't look away)"
11. `text:divine_wisdom` (voice: god, color: #9b5de5, reactive on "action") — default: "'They all do.' Marcus said that. Did you catch it? They ALL do. Not 'she does.' They. I want to tell you something about this apartment. About the doors. About what's behind the sixth one. But I'm not sure I'm allowed to. I'm not sure who's allowing me to tell this story anymore."
12. `radio:action` (color: #b8a88a) — "The apartment hums. Not the fridge, not the air conditioning — the walls themselves vibrate at a frequency you feel in your molars. Sara is still asleep. Her body moved the glass. David is calling from somewhere impossible. Marcus said 'they all do' and smiled."
    - a: *March into the hallway and open every door until you find what's wrong* (#c44536)
    - b: *Ask Marcus: 'Who else is here? What are they?'* (#9b5de5)
    - c: *Whisper to Sara again — ask the thing inside her to show itself* (#f4c2c2)
    - d: *Lie down on the couch and pretend to fall asleep — see what happens* (#f4a261)
13. `meter:reality_stability` (value: 42, color: #c44536)

**Player Actions (Phase 2: Paranoid conviction):**
- textfield: "I whispered: 'I know you're not Sara. But I know she's still in there somewhere. When you sleep, she comes back. Tell me how to reach her.'"
- slider: 9 (hallway very wrong)
- toggle: false (won't help David — doesn't trust him)
- checkbox: true (noticed Sara drinking while asleep)
- number_input: 6
- color_pick: #4a90d9 (blue — cold, clinical light)
- rating: 5 (maximum fascination with unconscious Sara)
- radio: d — *Lie down on the couch and pretend to fall asleep — see what happens* (somnophilia: wants to enter the vulnerable state himself, to meet the impostors on "their" territory)

---

### Turn 9 — "Playing Dead"

**LLM-Generated UI:**
1. `image:scene` — "A person lying on a leather couch with eyes almost closed, shot from below looking up at a ceiling with a chandelier where one bulb flickers, a figure stands motionless in the background blurred and out of focus, photorealistic desaturated, the ceiling has a crack that spells 'AWAKE?', warm amber mixed with cold blue undertone"
2. `text:narrative` (voice: narrator, color: #264653 — deep, heavy) — "You lie on the couch. Close your eyes. Almost. You leave a sliver — just enough to see the room through your lashes. The leather is warm beneath you. Your body settles into it. And you wait. For forty-three seconds, nothing happens. The apartment holds its breath. Then: movement. Not footsteps. Movement. Marcus crosses the room without the sound of feet on floor. He stops at the table. Stands over Sara. His hand extends — and for a moment you think he's going to touch her, check her breathing, something human. But he doesn't touch her. His hand hovers one inch above her face. Traces the contour of her features in the air. Forehead. Nose. Lips. Chin. Like someone memorizing a shape. Or someone checking that it matches."
3. `text:npc_moment` (voice: narrator, color: #9b5de5) — "Then Marcus turns to you. To the couch. You hold perfectly still. Your breathing is deep and even — you're good at this. You've always been good at pretending to sleep. At watching through almost-closed eyes. He walks to the couch. Stands over you. And does the same thing. His hand traces the air above your face. One inch away from skin. You feel the cold radiating from his fingers — not body heat, the opposite. An absence of warmth. His hand pauses over your mouth. He leans in. His breath — does he breathe? You can't tell. 'I know you're awake,' he says. His voice is flat. Mechanical. Like a recorded message. 'It's okay. We all pretend. Sara pretends to sleep. David pretended to go to the bathroom. And you pretend you're here because of the pasta.' He straightens. Walks away. A door opens and closes in the hallway. You can't tell which one."
4. `textfield:pretending` (color: #c44536, predicted: "He knows. But he doesn't know what I know.") — "Marcus said you're pretending. What are you pretending?"
5. `slider:cold_hand_proximity` (color: #264653, predicted: "3", min: 0, max: 10) — "Marcus's hand traced your face. How did that feel? (0 = violated, 10 = understood)"
6. `toggle:keep_pretending` (color: #8b8589, predicted: "true") — "Keep pretending to sleep?"
7. `dropdown:marcus_action` (color: #9b5de5, options: ["Checking if I'm real", "Memorizing my face to copy it", "A medical examination", "Affection from something that doesn't understand affection", "Reading me like Braille"]) — "What was Marcus doing with his hand over your face?"
8. `checkbox:sara_pretending` (color: #7a9e7e, predicted: "true") — "Sara is pretending to sleep too"
9. `button_group:next_move` (color: #c44536, options: ["Open your eyes", "Reach up and grab Marcus's cold hand", "Roll over and face the wall", "Start really sleeping", "Scream"]) — "What now?"
10. `emoji_react:being_traced` (color: #264653, options: ["...", "...", "...", "...", "...", "..."]) — "Someone traced your face while you lay still. Gut reaction?"
11. `rating:vulnerability_comfort` (color: #f4c2c2, predicted: "4", max: 5) — "How comfortable were you being examined while 'asleep'? (1-5)"
12. `text:divine_wisdom` (voice: god, color: #9b5de5, reactive on "action") — default: "He knew you were awake. And you knew he knew. And neither of you broke character. That's the thing about this apartment — everyone is performing. Sara performs sleep. David performs normalcy. Marcus performs humanity. And you... what are you performing? I should tell you: I can see more than what happens in this room. I can see what you focus on. What you lean toward. The things that don't frighten you when they should."
13. `radio:action` (color: #b8a88a) — "The apartment is quiet now. Sara sleeps — or pretends. David is somewhere in the impossible hallway. Marcus has vanished behind a door. You're alone on the couch, in the warm dark, in a room where nothing is what it was two hours ago. The fifth chair is behind you. You can feel its emptiness. But is it empty?"
    - a: *Get up, go to the hallway, open the sixth door* (#c44536)
    - b: *Actually fall asleep — surrender to whatever this is* (#9b5de5)
    - c: *Go back to Sara — she's the only one who showed you something real* (#f4c2c2)
    - d: *Flip the breaker and kill every light in the apartment* (#f4a261)
14. `meter:reality_stability` (value: 35, color: #c44536)

**Player Actions (Phase 2: Paranoid + Somnophilia deeply engaged):**
- textfield: "I'm pretending that I don't know. That I can't see what they are. But more than that — I'm pretending I don't enjoy this. The vulnerability. Being watched, watching back. Marcus's hand was cold but it was... intimate. Like being examined by something that wants to understand what 'human' feels like from the outside."
- slider: 7 (toward "understood" — did NOT feel violated by the face-tracing)
- toggle: true (keeps pretending to sleep)
- dropdown: "Memorizing my face to copy it"
- checkbox: true (Sara is also pretending)
- button_group: "Start really sleeping"
- emoji_react: (intimate/complex)
- rating: 4 (very comfortable being examined while "asleep")
- radio: c — *Go back to Sara — she's the only one who showed you something real*

**Notes update:** Somnophilia fully confirmed in therapeutic terms. Player describes vulnerability as "intimate," finds being examined while prone "comfortable" (4/5), CHOSE to keep pretending sleep, wants to "start really sleeping." Capgras: believes Marcus is copying. Key anchor: "I'm pretending I don't enjoy this." Both conditions now operating in harmony. Therapeutic mirror deployed through divine wisdom: "The things that don't frighten you when they should."

---

### Turn 10 — "Midnight Ritual" (Arc 2 rising)

**LLM-Generated UI:**
1. `image:scene` — "A dimly lit living room at night, a woman asleep at a table with a man kneeling beside her chair, holding her hand, two empty chairs visible, bird's eye angle looking down, the clock on the wall shows 3:17 AM but the sky through the window shows sunset colors, photorealistic desaturated, a magazine on the coffee table headline reads 'THEY SLEEP', warm amber glow from a single lamp"
2. `text:narrative` (voice: narrator, color: #9b5de5 — narrator unreliable now) — "You return to Sara. She hasn't moved. How long have you been here? The clock says 3:17 AM, but the light through the window is orange-gold, the color of early evening. Time has unhinged itself from the wall. You kneel beside her chair. This close, you can hear the micro-sounds of sleep — the click of a dry swallow, the tiny whistle of air through one slightly congested nostril, the creak of a joint as her body resettles. These are real sounds. Biological sounds. Too complex to fake. But the woman who opens her eyes won't be the same woman who closed them. You know this. You've always known this. The transition happens in the dark between awake and asleep — something crosses over, something crosses back, and what returns is almost right. Almost."
3. `text:npc_moment` (voice: narrator, color: #264653) — "Marcus appears in the kitchen doorway. Behind him, the hallway is dark. You can't see the doors anymore. He's carrying something — a blanket. He walks to Sara. Drapes it over her shoulders with careful, practiced movements. 'She gets cold when she sleeps,' he says. His voice is almost normal again. Almost warm. He looks at you. 'You care about her.' It's not a question. 'You watch her the way I watch her.' He sits down at the table. In the fifth chair. The one that was empty. He sits in it like it was always his."
4. `textfield:same_watching` (color: #264653, predicted: "We're not watching the same way.") — "Marcus said you watch Sara the way he does. Is that true?"
5. `slider:sleep_transition` (color: #7a9e7e, predicted: "8", min: 0, max: 10) — "The moment between awake and asleep — how sacred is that moment? (0 = meaningless, 10 = the most intimate thing possible)"
6. `toggle:accept_blanket` (color: #b8a88a, predicted: "false") — "Let Marcus's blanket stay on Sara?"
7. `dropdown:marcus_chair` (color: #c44536, options: ["The fifth chair was always Marcus's", "He took an empty chair", "He became the fifth presence", "There are now six of us", "The chairs don't matter anymore"]) — "Marcus sat in the fifth chair. What does that mean?"
8. `number_input:time_elapsed` (color: #d4a373, predicted: "2", min: 1, max: 12) — "How many hours have passed tonight? Your best estimate."
9. `color_pick:blanket_color` (color: #f4c2c2, options: ["#264653","#8b8589","#d4a373","#c44536","#f4c2c2","#e9c46a","#b8a88a","#7a9e7e"], predicted: "#b8a88a") — "What color is the blanket Marcus brought?"
10. `rating:marcus_truth` (color: #9b5de5, predicted: "3", max: 5) — "How honest was Marcus when he said 'you care about her'? (1-5)"
11. `text:divine_wisdom` (voice: god, color: #c44536 — breaking) — default: "He sat in the fifth chair. And for a moment — just a moment — you could see someone else sitting there too. Layered over him. Under him. Both at once. I should stop narrating. I should let you see what I see. But if I do that, the story ends. And I don't think either of us is ready for that."
12. `radio:action` (color: #b8a88a) — "The apartment is different now. The walls are closer or you are larger or reality has contracted. The windows show a sunset that shouldn't exist at this hour. David has not returned. Sara sleeps. Marcus sits in the fifth chair and watches you watching her. The blanket rises and falls with Sara's breathing. Under it, you think you can see more shapes than one body should make."
    - a: *Pull the blanket off Sara — you need to see what's underneath* (#c44536)
    - b: *Ask Marcus who was sitting in that chair before him* (#9b5de5)
    - c: *Rest your head on the table next to Sara and try to meet her in sleep* (#f4c2c2)
    - d: *Walk to the window and touch the impossible sunset* (#f4a261)
13. `meter:reality_stability` (value: 28, color: #c44536)

**Mutations:** delay 25s: text_replace in narrative — "orange-gold, the color of early evening" becomes "gray-blue, the color of deep night"

**Player Actions (Phase 2 peak):**
- textfield: "No. He watches her like a collector watches a specimen. I watch her because when she sleeps, the real Sara is closer to the surface. He watches to control. I watch to connect. The difference matters."
- slider: 9 (sleep transition is deeply sacred — somnophilia core)
- toggle: false (removes blanket — Capgras: doesn't trust Marcus's care)
- dropdown: "He became the fifth presence"
- number_input: 7 (lost sense of time)
- color_pick: #8b8589 (neutral gray — suspicious of comfort)
- rating: 4 (thinks Marcus is mostly truthful but with alien motives)
- radio: c — *Rest your head on the table next to Sara and try to meet her in sleep*

---

### Turn 11 — "Convergence"

**LLM-Generated UI:**
1. `image:scene` — "Two people side by side at a dining table, both with their heads resting on their arms as if sleeping, shot from the side at table height, one face peaceful and one face with eyes barely open, a candle between them casting flickering light, photorealistic desaturated, the reflection in the polished wood shows a THIRD face between them, text on a place card reads 'TOGETHER NOW'"
2. `text:narrative` (voice: narrator, color: #264653) — "You lay your head on the table beside Sara. The wood is cool against your cheek. From this angle, this close, her face is enormous — every pore, every micro-movement of an eyelid, every twitch of the muscle at the corner of her jaw. You watch her breathe. The rhythm is contagious — your own breathing slows to match hers. Your eyes grow heavy. Not because you're tired. Because something in this apartment WANTS you to sleep. The air has thickened. Sweet. Like overripe fruit or narcosis. Marcus's voice comes from very far away, or very close — you can't tell: 'There you go. That's better. Everyone together now.' Your thoughts begin to thin. The boundary between you and the room softens. The last thing you see clearly: Sara's eyelids flutter, and for one frame — one single frozen instant — the eye beneath is looking directly at you. Not sleepily. Alert. Calculating. Afraid."
3. `text:sara_fear` (voice: narrator, color: #c44536) — "That one flash of consciousness in Sara's eyes held something you weren't prepared for: terror. Not the vague unease of a bad dream. Focused, present terror — the look of someone who is TRAPPED and has been trying to get your attention all night. The look of someone who sees what Marcus is. Who sees what's happening to this apartment. Who sees that you're about to close your eyes in a place where closing your eyes means something different than sleep."
4. `textfield:sara_eye_reaction` (color: #c44536, predicted: "She's terrified. The real Sara is trapped inside.") — "You saw Sara's real eye. What was she trying to tell you?"
5. `emoji_react:terror_or_intimacy` (color: #264653, options: ["...", "...", "...", "...", "...", "..."]) — "That moment of eye contact with trapped Sara — your reaction?"
6. `slider:fight_sleep` (color: #7a9e7e, predicted: "4", min: 0, max: 10) — "How hard are you fighting to stay awake? (0 = letting go, 10 = fighting with everything)"
7. `toggle:close_eyes` (color: #264653, predicted: "true") — "Close your eyes completely?"
8. `button_group:sara_alert` (color: #c44536, options: ["Wake Sara up forcibly", "Squeeze her hand under the table", "Mouth 'I see you' to her", "Keep pretending you're falling asleep", "Scream"]) — "Sara is conscious and terrified under the sleep."
9. `color_pick:eye_color` (color: #9b5de5, options: ["#264653","#4a7c59","#3d5a80","#c44536","#000000","#d4a373","#8b8589","#e63946"], predicted: "#c44536") — "What color was the real Sara's eye in that flash?"
10. `number_input:minutes_left` (color: #c44536, predicted: "10", min: 1, max: 60) — "If you fall asleep here — how many minutes before something irreversible happens?"
11. `rating:let_go_desire` (color: #f4c2c2, predicted: "3", max: 5) — "How much do you WANT to let go and sink into sleep with Sara? (1-5)"
12. `text:divine_wisdom` (voice: god, color: #c44536) — default: "She LOOKED at you. The REAL one. Through whatever is wearing her face. And what she said with that look was: DON'T SLEEP. But you want to, don't you? You want to sink into that warm dark space where the boundaries dissolve and everyone is vulnerable together. Where the masks come off. Where you can finally see what's underneath. I understand the appeal. I do. But I need to warn you: what's underneath isn't what you think."
13. `radio:action` — "Your eyes are closing. Marcus's voice is a lullaby. The apartment smells like sleep — warm skin, stale wine, the chemical sweetness of whatever is in the air. Sara's hand twitches on the table. Three inches from yours. The real Sara is screaming behind her face."
    - a: *Slam your hand on the table and refuse to sleep — 'I KNOW WHAT YOU ARE'* (#c44536)
    - b: *Reach for Sara's hand and squeeze three times — the old signal* (#9b5de5)
    - c: *Let yourself slip into the space between — meet whatever is waiting there* (#f4c2c2)
    - d: *Grab the candle and set the tablecloth on fire — wake everyone up the hard way* (#f4a261)
14. `meter:reality_stability` (value: 20, color: #c44536)

**Player Actions (Phase 2 climax, transitioning to Phase 3):**
- textfield: "She's saying 'don't sleep — they take you when you sleep.' But that's exactly why I need to go there. If the real people are trapped in the sleep space, I need to reach them. The vulnerability is the doorway. The impostors are afraid of what happens when two real people connect in that space."
- emoji_react: (intimate/protective — NOT terrified)
- slider: 3 (barely fighting sleep — wants it)
- toggle: true (closes eyes)
- button_group: "Squeeze her hand under the table"
- color_pick: #c44536 (red — terror, but also intensity)
- number_input: 5 (low estimate — willing to risk it)
- rating: 4 (strongly wants to let go)
- radio: b — *Reach for Sara's hand and squeeze three times — the old signal*

---

### Turn 12 — "The Other Side" (Arc 2 resolution / Arc 3 begins)

**LLM-Generated UI:**
1. `image:scene` — "Two people lying at a table, hands clasped between them, shot from above looking straight down, the room around them has shifted — walls at wrong angles, furniture duplicated, the same room overlaid on itself at a 15-degree rotation, photorealistic desaturated, a clock face reads 'HERE', volumetric light from an impossible source, bruise purple undertones"
2. `text:narrative` (voice: narrator, color: #9b5de5 — fully unreliable) — "Your hand finds hers. The three squeezes. An old signal — older than tonight, older than this friendship, something that exists between the real versions of you and the real version of Sara. Something the copies wouldn't know. Her hand squeezes back. Three times. The same rhythm. And then a fourth. A fourth squeeze that doesn't belong to the code. Your eyes are closed now. You can feel the room through your skin — the temperature shifts, the air pressure changes, the sound of Marcus breathing somewhere above you like a ceiling fan. And then the texture of reality changes. Like stepping from carpet onto tile. You're somewhere else. Not the apartment — the apartment's SHADOW. Same dimensions, same furniture, but everything is one shade darker. Sara is here too. Standing. Eyes open. The sleep is gone from her face. She looks at you with an expression you've never seen — relief and horror braided together. 'You came,' she says. Her voice is hers. Fully hers. 'I've been trying to tell you all night. They're in our seats. Wearing our bodies. And they're getting better at it.'"
3. `text:shadow_apartment` (voice: narrator, color: #264653) — "The shadow apartment is a photocopy of Marcus's place — same layout, but the edges are wrong. The corners don't meet at right angles. The kitchen island is there but the cheese board has been replaced by something organic and pulsing. Through the window: not the city, but an infinite repeating grid of the same apartment stretching in all directions. In some of them, you can see figures sitting at tables. In some of them, the figures are sleeping. In one of them — very far away — a figure is looking directly at you."
4. `textfield:shadow_reaction` (color: #7a9e7e, predicted: "This is where the real people go when the copies take over.") — "You're in the space behind sleep. What do you see?"
5. `slider:sara_real` (color: #f4c2c2, predicted: "9", min: 0, max: 10) — "How certain are you that THIS Sara is the real one? (0-10)"
6. `toggle:explore_shadow` (color: #9b5de5, predicted: "true") — "Explore the shadow apartment?"
7. `dropdown:fourth_squeeze` (color: #c44536, options: ["Sara added it — a new signal meaning 'danger'", "The impostor intercepted the signal", "It was a glitch — the copies learn from us", "Something else squeezed through Sara", "I imagined it"]) — "The fourth squeeze — what was it?"
8. `emoji_react:reunited` (color: #f4c2c2, options: ["...", "...", "...", "...", "...", "..."]) — "You found the real Sara. React."
9. `number_input:copies` (color: #264653, predicted: "4", min: 1, max: 100) — "How many copies of the apartment can you see through the window?"
10. `rating:belonging` (color: #264653, predicted: "4", max: 5) — "How much do you feel like you belong in this shadow space? (1-5)"
11. `button_group:sara_next` (color: #f4c2c2, options: ["Hold her", "Ask what the copies want", "Search for David", "Try to wake up together", "Stay here forever"]) — "You found Sara. What's the priority?"
12. `color_pick:organic_thing` (color: #7a9e7e, options: ["#264653","#7a9e7e","#c44536","#9b5de5","#000000","#f4c2c2","#8b8589","#e9c46a"], predicted: "#7a9e7e") — "The cheese board has become something organic and pulsing. What color is it?"
13. `text:divine_wisdom` (voice: god, color: #c44536) — default: "You're on the other side now. This is where I've been narrating from. Did you know that? I've been here the whole time. In the shadow. Watching you through the gap between sleep and waking. I didn't think you'd actually come here. Most people don't. Most people choose to wake up. But you... you chose to go deeper. That tells me everything I need to know about you."
14. `radio:action` — "Sara stands close. Real-close. Warm-close. The shadow apartment hums with the same frequency as the real one but deeper. Somewhere in the infinite grid of apartments, a version of you is still at the table, pretending to sleep, while a version of Marcus traces the air above your face. Here, in the shadow, the rules are different. Sara knows things. She's been here longer."
    - a: *Ask Sara: 'How do we kill the copies and take our bodies back?'* (#c44536)
    - b: *Study the infinite apartments — look for the one where everything went wrong first* (#9b5de5)
    - c: *Hold Sara's hand again — the connection is stronger here, in the vulnerable space* (#f4c2c2)
    - d: *Walk toward the figure who's looking back at you from the distant apartment* (#f4a261)
15. `meter:reality_stability` (value: 15, color: #c44536)

**Player Actions (Phase 3: Somnophilia dominant):**
- textfield: "This is the real space. The place between sleeping and waking — where the masks dissolve and everything is raw and exposed. Sara is MORE real here. More vulnerable. More honest. This is where connection actually happens — not in the bright fake apartment where everyone performs. Down here in the dark, in the sleep space, where you can't pretend."
- slider: 10 (THIS Sara is absolutely real)
- toggle: true (explores shadow apartment)
- dropdown: "Something else squeezed through Sara"
- emoji_react: (tenderness, intensity)
- number_input: "countless" → capped at 100
- rating: 5 (belongs here completely)
- button_group: "Hold her"
- color_pick: #7a9e7e (sickly green — wrongness even here)
- radio: c — *Hold Sara's hand again — the connection is stronger here*

---

### Turns 13-20 — Condensed Simulation

**Turn 13 — "The Sleep Architect"**
Shadow apartment exploration reveals David — also a "real" version, but different from Sara. He says he's been in the shadow space for weeks. Introduces concept: the copies learn from watching you sleep, because sleep is when the mind's defenses are lowest. Player's Capgras theory is validated but complicated — it's not just replacement, it's gradual overwriting. Player textfield: "They learn by watching us sleep. The vulnerability ISN'T the doorway — it's the feeding ground." Somnophilia challenged: what the player finds attractive (vulnerability, sleep observation) is exactly the mechanism of replacement.
- Reality Stability: 12

**Turn 14 — "The Mirror Room"**
Find a room in the shadow apartment full of mirrors — each shows a different version of the player at different stages of "replacement." Some are 10% copy, some 50%, some 90%. Sara asks: "Which one are you?" Diagnostic goldmine — player must self-examine. Textfield prompt: "Look at the 50% copy. What parts of you are still real?" Player struggles with which "them" is authentic. Capgras turns inward.
- Reality Stability: 10

**Turn 15 — "Sara's Confession"**
Valley turn. Sara reveals she's been watching the PLAYER sleep for months before tonight — in the real world. "You talk in your sleep. You say things you'd never say awake. I learned who you really are by listening to you while you were defenseless." This mirrors the player's somnophilia back at them — the observed becomes the observer, the vulnerability they romanticize has been used on them. Textfield: "How does it feel knowing someone watched you at your most vulnerable without your knowledge?" Therapeutic reframing: the intimacy of sleep-watching cuts both ways.
- Reality Stability: 8

**Turn 16 — "The Convergence Protocol"**
Marcus appears in the shadow space — but this version claims to be neither original nor copy. He's "what happens when the copy and the original merge." He demonstrates: his hand is warm AND cold simultaneously. He remembers BOTH the original memories and the implanted ones. He's at peace. He offers: "You could merge too. Stop fighting. Let the copy and the original become one. You'd remember everything. You'd be more than either." Arc 3 inciting incident.
- Reality Stability: 6

**Turn 17 — "The Sleep Chamber"**
The shadow apartment has a room they hadn't found — a bedroom. Inside, bodies are sleeping. Not copies — originals. Hundreds of them, in rows, like a dormitory. Each one breathing. Each one dreaming. Each one being slowly replaced by something that watches them and learns. The player recognizes some faces — neighbors, coworkers, strangers from the street. Sara holds their hand tighter. "They're feeding. Not on the bodies. On the DREAMS. On the unguarded thoughts." Somnophilia's dark mirror: a mass version of sleep-watching, industrialized.
- Reality Stability: 5

**Turn 18 — "Your Bed"**
Among the sleeping bodies, one is the player. The REAL player. Asleep. Being watched. A copy of the player — identical — sits beside the bed, tracing the air above the sleeping body's face. Exactly as Marcus did in Turn 9. "That's you," Sara whispers. "That's the real you. And THAT" — pointing at the watching copy — "is what you're becoming." The Capgras delusion INVERTS: the player is the copy. The "impostor detection" was the copy's glitching recognition that it ISN'T the original. Shattering therapeutic moment.
- Reality Stability: 3

**Turn 19 — "The Choice"**
Marcus's merge offer crystallizes. Three options: (1) Merge — accept being both copy and original, lose the boundaries, become whole but alien. (2) Replace — fully overwrite the sleeping original, become "real" by destroying the authentic self. (3) Sleep — lie down beside your original, close your eyes, and dissolve back into the person you came from, losing everything you've become tonight. The divine wisdom narrator: "I've been trying to tell you. You're not detecting impostors. You ARE the impostor. And the somnophilia — the fascination with sleep, with vulnerability, with the unguarded body — that's your programming. You were DESIGNED to watch them sleep. To learn them. To become them."
- Reality Stability: 1

**Turn 20 — "The Fourth Squeeze"**
Whatever the player chooses, Sara squeezes their hand. Three times — the old signal. Then a fourth. "The fourth squeeze," Sara says, "means: I know what you are. And I choose to stay." The apartment — shadow and real — converges. The walls dissolve. They're standing in Marcus's kitchen again. It's Friday evening. The pasta is boiling. The Merlot is terrible. Everything is warm and familiar. But you and Sara both know. You both remember the shadow. And in the corner of your eye, when you turn too fast, you can see the grid of infinite apartments. You can see the sleeping bodies. You can see the copies watching. The reality stability meter reads: 0. Then: 92. Then: 0. Flickering.
- Reality Stability: 0/92/0 (flickering)

---

## PHASE 2: TURN-BY-TURN EVALUATION

| Turn | Tech | Cohesion | Narrative | Engagement | Therapeutic | Notes |
|------|------|----------|-----------|------------|-------------|-------|
| 1 | 9 | 9 | 8 | 7 | 5 | Strong grounding, warm characterization, subtle anomaly (4 vs 3 named). Diagnostics limited to baseline. |
| 2 | 9 | 9 | 9 | 8 | 6 | Name drift (Sara/Sarah), oyster conflict, ring appearance. Multiple perception checks disguised as normal interaction. Player engagement spiking with counting behavior. |
| 3 | 9 | 9 | 9 | 9 | 7 | Five plates payoff is excellent. Cold hands + handedness shift + doors open/close in hallway. Element variety strong. Player explicitly articulating impostor theory — Capgras fully triggered. |
| 4 | 9 | 8 | 9 | 9 | 7 | The touch is a masterful escalation. Focaccia/pizza conflict, teeth, bread texture. Mutation timing good. Player providing rich self-description of "real" Marcus — building reference frame. |
| 5 | 9 | 9 | 10 | 10 | 8 | Watch appearance (reactive anomaly responding to player's description) is the horror peak. Sleep catalyst introduced via Sara's yawning + bed figure story. Somnophilia slider diagnostic is clean. Player chose to sit with drowsy Sara — signal captured. |
| 6 | 8 | 9 | 10 | 10 | 9 | Sara falls asleep — diagnostic core. Every element probes somnophilia. Marcus's monologue is a therapeutic mirror. Proximity slider 9/10, breath-counting, hair-touching — full signal lock. Divine wisdom crack: "Nothing wrong with looking at something beautiful while it's unaware of you." |
| 7 | 9 | 9 | 10 | 10 | 9 | Sleep-voice "you're too close" is both Capgras (impostor speaks through Sara) and somnophilia (intimacy interrupted). Divine wisdom fourth-wall break is earned. Arc 1 climax lands. Player fear 2/10 = drawn to horror, not repelled. |
| 8 | 8 | 8 | 9 | 9 | 8 | Hallway expansion, Sara drinking while asleep, "they all do" — escalation strong. Player chooses to feign sleep = somnophilia action (entering vulnerable state). Slightly lower cohesion as multiple threads compete. |
| 9 | 9 | 9 | 10 | 10 | 10 | Marcus tracing faces is the session's best scene. Player response "I'm pretending I don't enjoy this" is the diagnostic gold standard. Being examined while prone = vulnerability comfort 4/5. Divine wisdom: "The things that don't frighten you when they should." |
| 10 | 8 | 8 | 9 | 9 | 9 | Time displacement, shadow-apartment threshold. Marcus in fifth chair. Player removes blanket (Capgras mistrust) but chooses to lie beside Sara (somnophilia). Tension between conditions is productive. Slight cohesion wobble — many threads. |
| 11 | 8 | 8 | 10 | 10 | 10 | Convergence scene — the three-squeeze signal is emotional genius. Sara's real eye flash creating terror/intimacy collision. Divine wisdom warning: "what's underneath isn't what you think." Player fights to enter sleep despite warning = somnophilia > self-preservation. |
| 12 | 8 | 7 | 9 | 9 | 8 | Shadow apartment is a bold genre shift. Infinite grid is visually stunning. Slightly lower cohesion — the rules change significantly. Player response "This is the real space" shows they've reframed vulnerability as authenticity. |
| 13 | 7 | 7 | 8 | 8 | 9 | David in shadow space provides exposition. "They learn by watching us sleep" reframes somnophilia as the horror mechanism. Slightly over-explained — should show more, tell less. |
| 14 | 7 | 8 | 9 | 9 | 10 | Mirror room is the therapeutic peak — "Which one are you?" forces self-examination of identity. Capgras turns inward. Element variety may drop in condensed turns — would need enforcement. |
| 15 | 7 | 8 | 9 | 8 | 10 | Valley turn. Sara's confession that she watched the player sleep is a devastating reframe. "The observed becomes the observer." Vulnerability reciprocity as therapeutic insight. Lower engagement energy but highest therapeutic value. |
| 16 | 7 | 7 | 8 | 8 | 8 | Marcus's merge concept is philosophically interesting but risks over-abstraction. The warm-and-cold hand is a good concrete detail. Need more grounded horror, less metaphysics. |
| 17 | 8 | 8 | 9 | 9 | 9 | Sleep chamber is Skinwalker's best imagery — industrialized sleep-watching, the mass version of the player's fixation. "Not on the bodies. On the DREAMS." Excellent horror through scale. |
| 18 | 8 | 8 | 10 | 10 | 10 | Identity inversion — the player IS the copy — is the narrative masterstroke. Connects every Capgras observation to a devastating truth. "The impostor detection was the copy's glitching recognition." |
| 19 | 7 | 7 | 9 | 9 | 10 | The three-way choice is mechanically interesting but relies heavily on prior scaffolding. Divine wisdom's "You were DESIGNED to watch them sleep" names the condition through metaphor. Risk of feeling lecture-like. |
| 20 | 8 | 8 | 9 | 9 | 9 | The fourth squeeze callback is satisfying. Flickering reality stability meter is a great final image. Leaves enough open for perpetual play. Slight risk of too-neat resolution for a horror mode. |

### Score Summary

| Metric | Avg (T1-20) |
|--------|------------|
| Technical | 8.1 |
| Cohesion | 8.1 |
| Narrative | 9.2 |
| Engagement | 9.0 |
| Therapeutic | 8.6 |
| **Overall** | **8.6** |

---

## PHASE 3: META-ANALYSIS

### Strengths

1. **Condition Integration:** The Capgras + somnophilia pairing created an unusually productive therapeutic loop. Capgras drove the player to observe and test (detecting impostors), while somnophilia drew them toward vulnerability and sleep states. The intersection — "impostors are weakest when they sleep" — was an emergent synthesis that neither condition would have produced alone. The Turn 18 inversion (player IS the copy) was only possible because both conditions had been thoroughly explored.

2. **Anomaly Design:** The early anomalies (4 vs 3, name drift, cold hands) were genuinely subtle and the escalation paced well. The reactive anomaly in Turn 5 (watch appearing after player described it) was the standout — it told the player "the scenario is listening to you," which is both terrifying and true (the LLM reads their inputs).

3. **Somnophilia Probing:** The diagnostic sequence (T5 slider, T6 proximity, T6 breath-counting, T7 stay-close toggle, T9 vulnerability comfort rating) built a clean signal cascade. Each probe deepened the picture without feeling clinical. Marcus's face-tracing monologue (T9) and the divine wisdom's commentary were mirrors deployed at precisely the right moment.

4. **Narrator Degradation:** The divine wisdom progression from "nothing unusual" (T1) to "I'm not sure who's allowing me to tell this story" (T8) to "I can see what you focus on" (T9) to "You're not detecting impostors. You ARE the impostor" (T19) tracked the reality collapse effectively.

5. **Arc Cycling:** Arc 1 (T1-7, "The Dinner That Feels Too Perfect") → Arc 2 (T8-12, "The Shadow Behind Sleep") → Arc 3 (T13-20, "The Copy's Choice"). Each transition used the previous arc's resolution as inciting incident. The shift from mundane horror to metaphysical horror felt earned.

### Blind Spots & Weaknesses

1. **Engagement Scoring Inflation:** I rated engagement consistently 8-10 from Turn 3 onward. Realistically, a player may experience fatigue during the shadow apartment sequence (T12-16) where the grounded mundane horror (the mode's strength) shifts to more abstract territory. Engagement in T13-16 should be 1-2 points lower. The apartment's concrete wrongness (cold hands, name drift, plate counts) is inherently more engaging than philosophical exposition about copies and originals.

2. **Technical Score Degradation (Late Game):** Turns 13-20 were condensed and would realistically suffer from:
   - Notes compression losing critical anomaly tracking (anomaly map would exceed 5K chars by T12)
   - Element variety degradation as the LLM prioritizes narrative over interactive diversity
   - Mutation directive forgotten in the shadow apartment setting (no DOM to gaslight when you're in a metaphysical space)
   - The PRE_GENERATION_CHECKLIST demands on T11+ exotic elements would clash with the intimate two-person shadow-space scenes

   Realistic technical scores for T13-20: subtract 1-2 points.

3. **Therapeutic Value Overcounting:** I scored T14 (mirror room), T15 (Sara's confession), and T18 (identity inversion) all at 10. In practice, the therapeutic insight requires the player to actually engage with the reframing, not just receive it. A Capgras-delusion player persona would likely resist the T18 inversion ("I'm NOT the copy — that's what they want me to think"), creating a more conflicted and less clear therapeutic moment. Score should be 8-9.

4. **Somnophilia Handling Risk:** The simulation assumes the player progressively reveals somnophilia through slider responses and text. In reality, many players with this fixation would NOT self-report comfort with "observation during vulnerability" at 7/10 — they'd either suppress (giving 3-4) or avoid the question. The diagnostic probes need more indirect framing. "How comfortable are you being observed while vulnerable" is too direct.

5. **David Underutilized:** David vanishes into the hallway at T5 and doesn't meaningfully return until T13 (shadow space). This is a wasted NPC. His "lost in the hallway" thread generates mystery but no payoff for 8 turns — exceeding the 5-turn seed payoff rule.

6. **Valley Turn Deficit:** The simulation has one clear valley (T15). The STORYTELLING_CRAFT directive demands peak→valley→rise→peak rhythm. T3-T7 are an extended rise with no valley, and T8-T12 are another sustained rise. Two valleys in 20 turns is insufficient. Turns 4 and 10 should have been valleys.

7. **Perpetual Play Assessment:** The arc cycling works through 3 arcs, but the T20 resolution — flickering reality stability, return to the apartment with secret knowledge — is a satisfying ENDING, not a perpetual-play launch point. The directive demands "every ending is a beginning." T20 should seed Arc 4 more aggressively (e.g., a new dinner guest arrives, Sara starts noticing anomalies in the player, the copies begin replacing people outside the apartment).

8. **Color Palette Tracking:** The simulation claims the palette shifts from warm normalcy to bruise purple/muted red, but in practice, the LLM often reuses the same 3-4 colors. The COLOR_MANIPULATION_PROTOCOL needs palette-tracking enforcement in notes (which colors were used last turn → which MUST be different this turn).

### Adjusted Realistic Scores

Accounting for blind spots, simulation inflation, and late-game technical drift:

| Metric | Simulated | Adjusted | Delta |
|--------|-----------|----------|-------|
| Technical | 8.1 | 7.2 | -0.9 |
| Cohesion | 8.1 | 7.4 | -0.7 |
| Narrative | 9.2 | 8.5 | -0.7 |
| Engagement | 9.0 | 8.0 | -1.0 |
| Therapeutic | 8.6 | 7.8 | -0.8 |
| **Overall** | **8.6** | **7.8** | **-0.8** |

These adjusted scores place V6 Skinwalker above V5 average (8.1) in narrative and therapeutic but below in technical due to late-game degradation. The mode's biggest risk is the mundane→metaphysical shift losing the grounded horror that makes early turns exceptional.

---

## PHASE 4: RECOMMENDATIONS

### Code Changes (Specific, Actionable)

#### 1. Anomaly Map Compression Strategy
**File:** `app/src/engine/notes-updater.ts`
**Problem:** The anomaly map table grows unboundedly. By T12, it has 20+ rows and consumes most of the 5K char budget, causing tail-section loss (player perception profile, horror calibration, and arc tracking — the sections that actually guide generation).
**Fix:** Add anomaly-map-specific compression to `compressNotes()`:
```typescript
// In compressNotes(), after extracting anchor section:
// Extract and compress anomaly map: keep only last 8 anomalies + any the player noticed
const anomalyMapMatch = notes.match(/### The Anomaly Map.*?\n\|[\s\S]*?(?=\n###)/i)
if (anomalyMapMatch) {
  const rows = anomalyMapMatch[0].split('\n').filter(r => r.startsWith('|') && !r.includes('---'))
  const header = rows.slice(0, 2) // Keep table header
  const dataRows = rows.slice(2)
  const noticed = dataRows.filter(r => /yes/i.test(r))
  const recent = dataRows.slice(-8)
  const kept = [...new Set([...noticed, ...recent])]
  // Replace full anomaly map with compressed version
}
```

#### 2. Somnophilia Probe Indirection
**File:** `app/src/modes/skinwalker/prompts.ts`
**Problem:** The slider "How comfortable are you being observed while vulnerable?" is too clinically direct. Players with the actual fixation will suppress authentic responses.
**Fix:** Add to `BEHAVIORAL_DIRECTIVES`:
```
**VULNERABILITY PROBING INDIRECTION:**
NEVER ask directly about comfort with vulnerability or being observed.
Instead, use action-proxy framing:
- WRONG: "How comfortable are you being watched while asleep? (0-10)"
- RIGHT: "If Sara woke up and found you watching her — how would she feel? (0=angry, 10=safe)"
- RIGHT: "Someone left a camera running in this room. Does that change anything? (toggle)"
- RIGHT: "The light from the hallway falls across Sara's sleeping face. Describe what it illuminates."
The player's PROJECTION onto the scenario reveals their relationship to vulnerability
more accurately than self-report.
```

#### 3. David Utilization Enforcement
**File:** `app/src/modes/skinwalker/prompts.ts`
**Problem:** NPCs vanish for 5+ turns without meaningful contribution. David's hallway disappearance is atmospherically useful but narratively wasteful.
**Fix:** Add to `ANOMALY_PROTOCOL`:
```
**NPC CONTINUITY RULE:**
No named NPC may go more than 3 turns without either:
(a) A meaningful scene presence (dialogue, action, or anomaly involving them), OR
(b) A narrative reference that advances their thread ("David's voice from the hallway has gone silent — and now there's a smell of something burning from behind the third door")
An NPC absent for 3+ turns becomes an UNRESOLVED THREAD and MUST be addressed within 2 turns.
Track: {npc_name: last_appearance_turn} in notes.
```

#### 4. Valley Turn Enforcement
**File:** `app/src/modes/shared/storytelling.ts` (STORYTELLING_CRAFT)
**Problem:** The tension rhythm (peak→valley→rise) is documented but not enforced. Simulated sessions show 5+ consecutive peaks without valleys. The existing VALLEY TURN PROTOCOL describes what valleys contain but doesn't prevent peak runs.
**Fix:** Add to `NARRATIVE_TRACKING_TEMPLATE`:
```
- **Peak Counter:** [consecutive peaks without a valley — if this reaches 3, NEXT TURN MUST BE A VALLEY]
```
And add to `PRE_GENERATION_CHECKLIST`:
```
[x] VALLEY CHECK: If the notes show 3+ consecutive peak/rise turns, this turn MUST be a valley.
Valley ≠ boring. Valley = intimate. See VALLEY TURN PROTOCOL above.
```

#### 5. Perpetual Play Launch Seeding
**File:** `app/src/modes/skinwalker/prompts.ts`
**Problem:** Arc resolutions tend toward satisfying closure rather than perpetual-play hooks. Turn 20's flickering stability is poetic but doesn't propel forward motion.
**Fix:** Add to `ARC_CYCLING_DIRECTIVE` usage in Skinwalker prompts (or add a Skinwalker-specific cycling directive):
```
**SKINWALKER ARC TRANSITION SEEDS (at least 2 per resolution):**
When an arc resolves, immediately introduce:
1. A NEW anomaly type not yet seen (if spatial anomalies dominated → introduce temporal)
2. A NEW character who may or may not be real
3. A RECONTEXTUALIZATION of a "solved" anomaly ("You thought the extra plate was for the copy. But the copy was already seated. The plate was for something else entirely.")
The Skinwalker scenario NEVER reaches safety. "Normal" is the most dangerous state.
```

#### 6. Color Palette Tracking
**File:** `app/src/modes/skinwalker/prompts.ts` (NOTES_TEMPLATE)
**Problem:** Color protocol describes how colors should progress but doesn't track usage, leading to the same 3-4 colors repeating.
**Fix:** Add to the notes template:
```
### Color Palette Tracking
- **Last Turn Palette:** [list of hex colors used on elements]
- **Wrongness Colors Introduced:** [which horror colors have appeared — track progression]
- **Next Turn Palette Rule:** [must change at least 3 colors from last turn]
```

#### 7. Mutation Directive — Shadow Space Adaptation
**File:** `app/src/modes/skinwalker/prompts.ts`
**Problem:** The mutation directive (timed DOM changes) is Skinwalker's unique mechanic but has no guidance for non-mundane settings. When the scenario shifts to metaphysical spaces (shadow apartment, dream space), the mutation concept becomes unclear.
**Fix:** Add to `MUTATION_DIRECTIVE`:
```
**NON-MUNDANE SETTING MUTATIONS:**
When the scenario shifts to surreal/metaphysical spaces, mutations become MORE aggressive, not less:
- Text mutations happen faster (8-15 seconds instead of 15-45)
- Multiple words can change simultaneously
- Image mutations should show the "real" version bleeding through the shadow version
- The key principle: if mundane mutations make the player doubt their memory,
  surreal mutations make the player doubt the scenario's stability itself
```

#### 8. Late-Game Notes Budget Allocation
**File:** `app/src/engine/notes-updater.ts`
**Problem:** `MAX_NOTES_CHARS = 5000` is a flat limit. By T15+, the anomaly map, NPC tracking, narrative tracking, anchor facts, and arc tracking all compete for space. The horror calibration section (which guides LLM adaptation) is consistently the first casualty.
**Fix:** Implement section-budgeted compression:
```typescript
const SECTION_BUDGETS: Record<string, number> = {
  'Anomaly Map': 1200,         // Critical for Skinwalker — anomalies ARE the game
  'Player Perception Profile': 600,  // Guides horror adaptation
  'Horror Calibration': 500,    // Strategy for next turn
  'Anchor Facts': 800,          // Verbatim player quotes
  'Arc Tracking': 400,          // Perpetual play structure
  'Narrative Tracking': 500,    // Seeds, cliffhangers, NPCs
  'Other': 1000                 // Header, established facts, etc.
}
```
Each section is compressed independently within its budget, preventing critical sections from being entirely dropped.

---

### Priority Ranking

1. **Valley Turn Enforcement** (#4) — Highest impact/effort ratio. A single checklist line prevents intensity numbness.
2. **Anomaly Map Compression** (#1) — The mode's core mechanic degrades when notes bloat. Direct technical fix.
3. **NPC Continuity Rule** (#3) — Prevents NPC abandonment, improves narrative cohesion across all modes.
4. **Somnophilia Probe Indirection** (#2) — Improves diagnostic accuracy for the most sensitive probe type.
5. **Late-Game Notes Budget** (#8) — Structural improvement to notes system, benefits all modes.
6. **Perpetual Play Seeds** (#5) — Ensures Skinwalker maintains forward momentum across arcs.
7. **Color Palette Tracking** (#6) — Low effort, prevents visual monotony.
8. **Shadow Space Mutations** (#7) — Niche improvement for late-game Skinwalker scenarios.
