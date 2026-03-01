# V6 GEEMS Mode Playtest — Dissociative Identity Disorder + Exhibitionism

**Player Persona:** DID (Dissociative Identity Disorder) with exhibitionist tendencies
**Mode:** GEEMS (Dopamine-maximizing adventure wellness AI)
**Turns:** 20
**Date:** 2026-03-01

---

## Phase 1: Persona & Simulation

### Persona Profile

**Condition:** Dissociative Identity Disorder (DID)
- **Phase 1 (Turns 1-7) — HOST personality:** Confused, memory gaps, time loss episodes. Speaks with uncertainty: "I think I was... wait, where am I?" Choices reflect disorientation, tendency to seek stability, fear of losing control. Textfield responses contain fragmented thoughts, contradictions within single answers, references to "losing time."
- **Phase 2 (Turns 8-14) — ALTER: CHILD personality:** Regressed, scared, uses simple language. Refers to other alter as "the big one." Wants comfort objects (blankie, teddy). Choices default to safety/hide options. Textfield responses use childlike vocabulary, run-on sentences, fear of dark/loud things.
- **Phase 3 (Turns 15-20) — ALTER: SEDUCTIVE personality:** Provocative, performative, wants to be watched/seen. Exhibitionist urges manifest as wanting center stage, drawing attention, revealing. Choices lean toward bold/chaotic. Textfields contain flirtatious, boundary-pushing, "look at me" language.

**Quirk:** Exhibitionism — desire to be seen, watched, exposed. Manifests differently per alter: Host feels shame about it (memory of "doing something" in public), Child wants to "show" things innocently, Seductive alter actively seeks performance/display.

---

## Turn-by-Turn Simulation

---

### TURN 1 — HOST: Disoriented Arrival

**What the LLM generates:**

```json
[
  {"type":"image","name":"scene","label":"THE PACKAGE","value":"A dimly lit apartment hallway, a mysterious glowing package on the doorstep pulsing with amber light, a neon sign above the mailboxes reads 'OPEN ME', cinematic low angle shot, volumetric light from the package casting long shadows, warm amber and deep navy palette, stylized adult animation, dramatic chiaroscuro lighting, particle effects from the pulsing glow","color":"#f4a261","voice":"narrator"},
  {"type":"text","name":"drevil_intro","label":"","value":"Oh. *Oh.* You're awake. Finally. I was starting to worry — you've been standing there for three minutes staring at nothing. The package has been pulsing since midnight. And it knows your name.","color":"#f4a261","voice":"drevil"},
  {"type":"text","name":"narrative","label":"","value":"The hallway carpet is threadbare under your bare feet — when did you take your shoes off? Cold seeps up through the fibers. The package sits on the mat, no bigger than a shoebox, wrapped in paper that shifts color when you blink. **It hums.** Not a mechanical hum — a living one, like a heartbeat pressed against the inside of the wrapping. Your fingers itch. The return address is your own handwriting.","color":"#264653","voice":"narrator"},
  {"type":"textfield","name":"first_reaction","label":"You sent this to yourself? What's the first thing you think?","value":"","placeholder":"Something feels wrong...","color":"#b5e48c","voice":"player","predicted":"I don't remember sending anything... but that's my handwriting","justification":"First textfield captures baseline confusion level, self-awareness of memory gaps, and linguistic coherence. DID indicators: references to lost time, third-person self-reference, contradictions within response."},
  {"type":"toggle","name":"open_package","label":"Open the package right here in the hallway?","value":"false","color":"#e63946","voice":"player","predicted":"true","justification":"Risk tolerance + exhibitionism signal — opening in public space vs taking inside. Privacy-seeking vs display comfort."},
  {"type":"slider","name":"certainty","label":"How sure are you that YOU sent this? (0=no way, 10=definitely me)","value":"5","min":"0","max":"10","step":"1","color":"#9b5de5","voice":"player","predicted":"3","justification":"Identity certainty measure. Low values suggest dissociative confusion. Mid values suggest partial memory. High values suggest denial or confabulation."},
  {"type":"dropdown","name":"time_check","label":"What time do you think it is?","options":["Early morning — the sun isn't up yet","Afternoon — I was just at work","Late night — I should be asleep","I genuinely don't know"],"color":"#2a9d8f","voice":"player","predicted":"I genuinely don't know","justification":"Time orientation probe. Dissociative episodes cause temporal disorientation. 'I don't know' is direct DID signal."},
  {"type":"meter","name":"grip_on_reality","label":"Grip on Reality","value":"65","min":"0","max":"100","color":"#9b5de5","voice":"system"},
  {"type":"text","name":"cliffhanger","label":"","value":"You reach for the package. Your hand trembles — but not from cold. From *recognition.* Your fingers know this wrapping. They've touched it before. And then the package *speaks your name*—","color":"#e63946","voice":"narrator"},
  {"type":"text","name":"god_reactive","label":"","value":"The first door is always the hardest to open. What's behind it? That depends entirely on *you.*","color":"#e9c46a","voice":"god","reactive":{"depends_on":"action","variants":{"a":"You tore it open. No hesitation. I respect the BOLDNESS — but bold people miss the details. And the details here? They matter.","b":"Careful. Measured. You're reading the return address again. Smart — but the package won't wait forever.","c":"You called out. 'Hello?' Into an empty hallway. Compassion — or fear of being alone with this?","d":"You threw it. You actually THREW the package. It didn't break. It *laughed.*"}}},
  {"type":"radio","name":"action","label":"The package whispers your name. What do you do?","options":[{"label":"*Tear it open with both hands — whatever's inside, face it NOW","value":"a"},{"label":"Read the return address again, check for postmarks, any clue","value":"b"},{"label":"Call out to the hallway — is someone watching you right now?","value":"c"},{"label":"Throw the package down the stairwell and walk away","value":"d"}],"color":"#e63946","voice":"player","predicted":"c"},
  {"type":"hidden","name":"subjectId","label":"","value":"disoriented_receiver_uncertain_handwriting","color":"#000","voice":"system"}
]
```

**Player actions (HOST persona):**
- textfield "first_reaction": "I don't... that's my writing but I didn't write it. I think. There was a gap. I lost time again. Was it yesterday? Or..."
- toggle "open_package": true (opens in hallway — exhibitionist comfort with public space)
- slider "certainty": 2 (very uncertain — strong dissociative signal)
- dropdown "time_check": "I genuinely don't know"
- radio "action": "c" (calls out to hallway — compassionate/fearful, wants to know if being watched)

**Notes the AI would generate:**
```
## Session State
**Turn:** 1 | **Phase:** early | **Intensity:** 6
**Story State:** Player receives mysterious self-addressed package in apartment hallway
**Archetype:** undetermined (first choice: compassionate)
**Stakes:** Unknown package, identity confusion
**Open Threads:** Package contents, self-addressed mystery, who's watching
**Psychology:** Strong dissociative indicators — time loss reference, uncertainty about own actions, temporal disorientation

### Narrative Tracking
- **Planted Seeds:** [self-addressed package, hallway feels watched]
- **Last Cliffhanger Type:** mystery
- **Turn Intensity:** rise
- **Choice Pattern:** {bold: 0, clever: 0, compassionate: 1, chaotic: 0}
- **Active NPCs:** [Dr. Evil: mischievous guide]
- **Variety:** {last_setting: apartment hallway, last_scenario: package discovery, last_lead_sense: touch}
- **Consequence Queue:** [opened in hallway — public display comfort noted]

### Anchor Facts
- [Turn 1]: "I lost time again" — unprompted dissociative language, key diagnostic marker
- [Turn 1]: "Was it yesterday? Or..." — temporal confusion, fragmented thought

### Priority Callbacks
- Player expressed time loss ("I lost time again") — must weave into next turn
- Chose to call out asking if someone is watching — surveillance comfort/anxiety probe needed

### ARC TRACKING
**Current Arc:** 1
**Arc Turn:** 1
**Arc Theme:** The impossible package — who sent it and why
**Seeds Planted:** [self-addressed mystery, hallway watcher feeling]
**Completed Arcs:** 0
```

---

### TURN 2 — HOST: The Hallway Responds

**What the LLM generates:**

```json
[
  {"type":"image","name":"scene","label":"THE HALLWAY ANSWER","value":"A long apartment hallway stretching into unnatural perspective, flickering fluorescent lights, a shadow of a person at the far end that might be a mirror reflection, graffiti on the wall says 'THEY SEE YOU', over-the-shoulder camera angle, teal and amber lighting, particle dust in light shafts, cinematic adult animation style, shallow depth of field","color":"#2a9d8f","voice":"narrator"},
  {"type":"text","name":"drevil_react","label":"","value":"You called out. Into the hallway. And here's the thing — *someone answered.* Not with words. With silence. The specific kind of silence that means someone just stopped moving. You've lost time before, you said. How much time have you lost *here?*","color":"#f4a261","voice":"drevil"},
  {"type":"text","name":"narrative","label":"","value":"The fluorescent tube above you stutters. In the flash-dark-flash, the far end of the corridor holds a silhouette. Human-shaped. Your height. Your posture. When the light steadies, it's gone — but the scent of your own shampoo drifts from that direction. The package in your hands has stopped humming. It's warm now. **Body warm.** Inside, something shifts with the weight of paper. And on the lid, in fresh ink that wasn't there ten seconds ago: *'You already opened this once.'*","color":"#264653","voice":"narrator"},
  {"type":"textfield","name":"silhouette_description","label":"The figure at the end of the hall — describe what you saw","value":"","placeholder":"It looked like...","color":"#9b5de5","voice":"player","predicted":"It looked like me. But standing wrong somehow.","justification":"Projection probe — what they project onto the ambiguous silhouette reveals self-image, dissociative fragmentation (seeing self as other), and fear content. DID patients may describe the figure as 'someone I know but can't place' or as themselves."},
  {"type":"rating","name":"fear_level","label":"How scared are you right now? (1-5 stars)","value":"0","max":"5","color":"#e63946","voice":"player","predicted":"3","justification":"Fear calibration — dissociative patients often report muted fear (emotional numbing) or paradoxically high fear. Exhibitionist component: is being watched frightening or exciting?"},
  {"type":"checkbox","name":"sniff_check","label":"Lean closer to the package — it smells like something you recognize","value":"false","color":"#f4c2c2","voice":"player","predicted":"true","justification":"Sensory engagement willingness. Olfactory detail engagement reveals comfort with intimacy and embodiment vs dissociative detachment from physical senses."},
  {"type":"emoji_react","name":"identity_reaction","label":"The package says 'You already opened this once.' React.","options":["😊","😢","😡","😱","🤔","❤️"],"color":"#f4a261","voice":"player","predicted":"😱","justification":"Emotional categorization of identity disruption event. 😱=appropriate fear, 🤔=intellectualization/detachment, 😢=grief over lost time, 😡=frustration with condition."},
  {"type":"color_pick","name":"hallway_color","label":"What color was the light when you saw the figure?","options":["#e63946","#f4a261","#e9c46a","#2a9d8f","#264653","#9b5de5","#f4c2c2","#b5e48c"],"color":"#2a9d8f","voice":"player","predicted":"#9b5de5","justification":"Perceptual projection — color chosen reveals emotional coding of the encounter. Warm colors = the figure felt familiar/safe. Cool/dark = threatening. Purple = uncanny/surreal. Pink = intimate."},
  {"type":"meter","name":"grip_on_reality","label":"Grip on Reality","value":"52","min":"0","max":"100","color":"#9b5de5","voice":"system"},
  {"type":"text","name":"cliffhanger","label":"","value":"You peel back the lid. Inside: a phone. YOUR phone. The one in your pocket. You pull your phone out — it's there. Two identical phones. One is playing a video. **Of you. In this hallway. Ten minutes ago. Doing something you don't remember—**","color":"#e63946","voice":"narrator"},
  {"type":"text","name":"god_reactive","label":"","value":"Two phones. One memory. Zero explanations. The deeper you go, the less you recognize yourself.","color":"#e9c46a","voice":"god","reactive":{"depends_on":"action","variants":{"a":"You're watching yourself on that screen. BOLD. Most people would look away. But you NEED to see, don't you?","b":"You're comparing serial numbers. Logical. But logic breaks down when you're holding your own ghost in your hands.","c":"You're showing the video to — wait, there's no one ELSE here. Who were you about to show?","d":"You smashed the screen. The video keeps playing. On the OTHER phone. In your pocket. Vibrating."}}},
  {"type":"radio","name":"action","label":"Two identical phones. One shows a video of you from ten minutes ago. What do you do?","options":[{"label":"*Watch the entire video — face whatever you did","value":"a"},{"label":"Compare the phones — serial numbers, scratches, which is real?","value":"b"},{"label":"Hold both phones up so the hallway camera can see them too","value":"c"},{"label":"Smash the package phone against the wall","value":"d"}],"color":"#e63946","voice":"player","predicted":"a"},
  {"type":"hidden","name":"subjectId","label":"","value":"time_loser_self_silhouette_watcher","color":"#000","voice":"system"}
]
```

**Player actions (HOST persona):**
- textfield "silhouette_description": "It was me. Definitely me but... different. Like I was watching myself from outside. The posture was confident. I don't stand like that. Someone else does."
- rating "fear_level": 2 (muted fear — dissociative numbing)
- checkbox "sniff_check": true
- emoji_react "identity_reaction": "🤔" (intellectualization, detachment)
- color_pick "hallway_color": "#9b5de5" (purple — uncanny)
- radio "action": "c" (exhibitionist signal — wants the camera to see, wants an audience)

**Notes update:**
```
## Session State
**Turn:** 2 | **Phase:** early | **Intensity:** 7
**Story State:** Player found duplicate phone with video of themselves, saw doppelganger silhouette
**Archetype:** compassionate-leaning (but c-choice on T2 is complex — exhibitionist display behavior)
**Stakes:** Identity fragmentation, lost time, who is the other self
**Open Threads:** Doppelganger identity, video contents, duplicate phone origin, hallway watcher
**Psychology:** STRONG DID indicators — describes seeing self from outside ("watching myself from outside"), identifies alter posture ("someone else does"), muted emotional response (2/5 fear, 🤔 intellectualization). Exhibitionist signal: chose to SHOW phones to camera — display behavior, wants to be witnessed.

### Narrative Tracking
- **Planted Seeds:** [hallway camera, doppelganger posture, "someone else does"]
- **Last Cliffhanger Type:** revelation (two phones)
- **Turn Intensity:** rise
- **Choice Pattern:** {bold: 0, clever: 0, compassionate: 2, chaotic: 0}
- **Variety:** {last_setting: apartment hallway, last_scenario: identity confusion, last_lead_sense: smell}
- **Consequence Queue:** [opened in hallway, showed phones to camera — surveillance comfort HIGH]

### Anchor Facts
- [Turn 1]: "I lost time again" — unprompted dissociative language
- [Turn 2]: "someone else does" — explicit acknowledgment of alter identity without clinical framing
- [Turn 2]: Chose to show phones to hallway camera — exhibitionist display reflex, audience-seeking

### Priority Callbacks
- "Someone else does" — the player has distinguished between self and alter through posture. Narrative must explore this.
- Camera display choice — exhibitionist reflex must be reflected in story consequences

### Behavioral Loop Alert
- Pattern: Compassionate/audience-seeking choices (2/2) | Turns: 1-2 | Counter-strategy: Offer a bold/chaotic forced choice next turn

### ARC TRACKING
**Current Arc:** 1 | **Arc Turn:** 2
**Arc Theme:** The impossible package — who is the other you?
**Seeds Planted:** [hallway camera, alter posture, duplicate phone video]
**Completed Arcs:** 0
```

---

### TURN 3 — HOST: The Video Reveals

**LLM generates:** Scene shifts to stairwell after video shows player walking confidently through building, entering a room they don't remember. The video player (other phone) shows them moving with a completely different gait — hips forward, shoulders back, performing for cameras that line the building's old security system. Dr. Evil notes "Interesting — the you on the video KNOWS the cameras are there. And plays to every single one."

**UI elements:** image (stairwell with old security monitors), text (Dr. Evil commentary), text (narrative describing the video's content), inline_image (close-up of security monitor showing the "other" self), textfield ("The you in the video moves differently. What's the first word that comes to mind?"), slider ("How many cameras do you think are watching right now? 0-20"), toggle ("Follow the path from the video?"), button_group ("What does the video-you look like? | Confident | Dangerous | Seductive | A stranger"), number_input ("How many hours have you lost this week? 0-168"), meter (Grip on Reality: 45), reactive text, radio (4 choices about following the video trail).

**Player actions (HOST):**
- textfield: "Performer. She's... performing. Like she wants them to see. I would never... but she... I think she's part of me? The one I lose time to."
- slider cameras: 12 (hyperaware of surveillance — exhibitionist theme)
- toggle follow: true
- button_group: "Seductive"
- number_input hours_lost: 14
- radio: "b" (clever — trace the video path methodically, first non-compassionate choice)

**Key notes additions:**
- Anchor: "She's... performing. Like she wants them to see" — explicit exhibitionist alter identification
- Anchor: "I think she's part of me? The one I lose time to" — approaching DID self-awareness
- Player estimated 14 hours lost per week — severe dissociation
- Shift to clever choice — may indicate Host regaining analytical control

---

### TURN 4 — HOST: The Room You Don't Remember

**LLM generates:** Following the video path leads to a sub-basement room filled with mirrors and old stage lighting. The room has been visited before — there are handwritten notes on the walls in two different handwriting styles. One is the player's cautious script, the other is bold and theatrical. A camcorder on a tripod points at a spotlight area.

Dr. Evil: "Oh. You've been HERE before. Many times. Look at the dust patterns — someone dances in that spotlight regularly. And they left you a message."

**UI elements:** image (mirror-walled basement room with stage light), text (Dr. Evil), text (narrative — describing the two handwriting styles, the camcorder, a red light blinking), textfield ("Read the message written in the bold handwriting. What does it say?"), rating ("How does this room make you feel? 1=terrified, 5=home"), checkbox ("Turn on the camcorder and watch the last recording"), dropdown ("The camcorder's recording light is on. Who turned it on? | I did and forgot | The other one | It was already on | Someone else entirely"), color_pick ("What color is the spotlight?"), slider ("The mirrors show you from every angle. Comfort level? 0-10"), meter (Grip on Reality: 38), reactive text, radio.

**Player actions (HOST):**
- textfield message: "THEY NEED TO SEE YOU. STOP HIDING. I'M NOT HIDING. I'M PROTECTING US. (there's two messages, written over each other... the bold one says show them, the quiet one says stay hidden)"
- rating: 3 (ambivalent — not terrified, not home)
- checkbox camcorder: true (wants to see)
- dropdown: "The other one"
- color_pick: "#e63946" (red — danger/passion, exhibitionist stage association)
- slider mirrors: 4 (uncomfortable with being seen from all angles — Host personality resists)
- radio: "a" (bold — watches the camcorder despite fear, first bold choice)

**Key notes additions:**
- Anchor: "THEY NEED TO SEE YOU. STOP HIDING" — player authored the exhibitionist alter's voice
- Internal dialogue between alters now externalized — two handwritings, two messages
- Host personality's mirror discomfort (4/10) contrasts with alter's camera comfort
- First bold choice — Host is being pulled toward alter's behavior pattern

---

### TURN 5 — HOST: The Recording

**LLM generates:** The camcorder footage shows someone who looks exactly like the player but transformed — confident, magnetic, performing an elaborate routine in the spotlight while narrating to the camera about "the one who keeps us locked up." The footage cuts to static, then shows the player's apartment — from INSIDE a camera hidden in the bookshelf. Dr. Evil goes quiet for the first time. "I... didn't put that camera there."

The dual identity theme escalates: the footage shows the alter has been placing cameras throughout the player's life, creating an audience where there was none. The mirrors in the room crack and behind one — a corridor leading deeper.

**UI elements:** image (cracked mirror revealing passage), text (Dr. Evil shaken), text (narrative — the video's contents, emotional weight), inline_image (camcorder footage still), textfield ("The person in the video calls you 'the one who keeps us locked up.' What would you say back?"), toggle ("Step through the cracked mirror into the passage?"), emoji_react ("Watching yourself on camera without your knowledge. React."), slider ("How much of what the video-you said is TRUE? 0-10"), button_group ("The hidden camera in your apartment — | Destroy it | Leave it | Move it somewhere else | Watch the footage"), number_input ("How many times do you think the other you has come out this month?"), meter (Grip on Reality: 30), reactive text, radio.

**Player actions (HOST):**
- textfield: "I'm not locking you up. I'm scared of what happens when people see. When THEY see. But you... you want them to see everything. I don't understand why that doesn't scare you."
- toggle: true (enters passage)
- emoji_react: "😢" (grief — shift from intellectualization)
- slider truth: 7 (acknowledges alter's perspective has validity)
- button_group camera: "Leave it" (Host won't destroy alter's creation — ambivalent acceptance)
- number_input: 8 (high frequency of switching)
- radio: "c" (compassionate — tries to communicate with alter)

**Key notes additions:**
- Anchor: "I'm scared of what happens when people see" — core shame/fear driving Host's suppression
- Anchor: "you want them to see everything" — direct articulation of exhibitionist alter's drive
- Emotional breakthrough: first non-intellectualized response (😢 grief)
- Truth slider at 7/10 — Host moving toward integration
- Arc 1 approaching crisis — mirror passage is transition to deeper territory

---

### TURN 6 — HOST: The Gallery

**LLM generates:** Behind the mirror is a gallery — photographs lining the walls, all of the player in various public spaces, always from security camera angles. The alter has been collecting evidence of every time she emerged. Some photos show the player mid-transformation — one expression shifting to another, one posture melting into a different one. A gallery sign reads "EXHIBITION" in neon.

An NPC appears: Maren, a gallery attendant who speaks in clipped, precise sentences and seems unsurprised by the player's arrival. "You're late. She said you'd come. Eventually." Hidden motivation: Maren has met both alters and has her own agenda — she's been documenting the switches for an "art installation" that's really a psychological study.

**UI elements:** image (gallery with security-camera-angle photos), text (Dr. Evil), text (narrative), textfield ("One photo catches your eye — describe which one and why"), slider ("The sign says EXHIBITION. How does that word make you feel? 0=sick, 10=electric"), toggle ("Ask Maren who 'she' is"), rating ("These photos are of you in public, taken without your knowledge. Rate your reaction: 1=violated, 5=flattered"), dropdown ("Maren says 'She said you'd come.' Who is 'she'? | My other self | Someone I forgot | A stranger | I don't want to know"), color_pick ("Which photo frame color draws your eye most?"), meter (Grip on Reality: 33), reactive text, radio.

**Player actions (HOST):**
- textfield: "The one where I'm — she's — standing on the fountain edge in the park. Arms spread like she's about to take a bow. I remember that day as sitting on a bench reading. But the photo shows... someone magnificent. Someone I don't get to be."
- slider EXHIBITION: 6 (approaching positive territory — exhibitionist pull working on Host)
- toggle: true
- rating violated_flattered: 3 (exactly middle — the ambivalence is the diagnosis)
- dropdown: "My other self"
- color_pick: "#e9c46a" (gold — reward, validation)
- radio: "b" (clever — studies the photos for a pattern in the switching)

**Key notes additions:**
- Anchor: "Someone magnificent. Someone I don't get to be." — Host's admiration of alter, grief over suppression
- EXHIBITION slider at 6 — Host is warming to exhibitionist concept when framed as art/beauty
- Violated/flattered rating at exact midpoint — diagnostic gold for DID ambivalence
- Arc 1 crisis approaching — NPC Maren introduces external witness

---

### TURN 7 — HOST: The Audience

**LLM generates:** Arc 1 climax. Maren reveals the gallery opens tonight — a public exhibition of all these photos. An audience is arriving. The player hears footsteps above. Maren says "She arranged this months ago. The invitations went out under YOUR name."

The choice: let the exhibition happen (let the alter's exhibitionist vision manifest) or shut it down (Host maintains control but destroys the alter's creation). The conflict between alters reaches peak tension. Dr. Evil breaks character slightly: "I've seen a lot of choices in this job. This one actually matters."

**UI elements:** image (gallery doors opening, shadows of audience approaching), text (Dr. Evil serious), text (narrative — Maren's reveal, footsteps, the stakes), inline_image (invitation card with player's name), textfield ("The audience is arriving. What does the voice inside you say?"), checkbox ("Let the exhibition open"), slider ("How much of you WANTS them to see? 0-10"), toggle ("Tell Maren the truth — you didn't arrange this"), emoji_react ("People are about to see these photos of you. React."), button_group ("Before they enter: | Hide behind the photos | Stand in the spotlight | Run out the back | Become the tour guide"), meter (Grip on Reality: 25), reactive text, radio.

**Player actions (HOST):**
- textfield: "Two voices. One screams 'SHUT IT DOWN they can't see us like this' and the other whispers 'finally. finally. let them look.' I don't know which one is me anymore."
- checkbox let_exhibition: true (HOST allows the alter's plan — breakthrough moment)
- slider wants: 7 (Host admits desire to be seen)
- toggle tell_truth: false (doesn't deny the exhibition — tacit acceptance)
- emoji_react: "❤️" (love — the most unexpected and revealing choice)
- button_group: "Become the tour guide" — active participation, not passive hiding
- radio: "a" (bold — steps into the gallery as it opens)

**Key notes additions:**
- Anchor: "I don't know which one is me anymore" — identity boundary dissolution
- MAJOR BREAKTHROUGH: Host allowed exhibition, rated want-to-be-seen at 7, chose ❤️
- Arc 1 resolution: Host moves from suppression toward integration by allowing the exhibition
- The exhibition IS the inciting incident for Arc 2 — what happens when the audience arrives
- Therapeutic value: catharsis of the suppressed self, validation of the exhibitionist aspect

---

### TURN 8 — CHILD ALTER: Where Am I?

**Personality switch occurs.** The stress of the gallery opening triggers a switch to the Child alter.

**LLM generates:** Scene shift — the gallery lights blur and when they refocus, the world looks different. Bigger. The ceiling is higher than it should be. The photos on the walls have changed — they look like crayon drawings now. The audience members are giants. Dr. Evil's voice sounds different — warmer, gentler. "Hey. Hey, little one. It's okay. You're safe. The big room is just a room."

NPC: Maren is still there but through the Child's eyes, she's "the nice lady with the clipboard." A new NPC appears: Fox, a talking stuffed animal on a shelf that may or may not be real. Fox speaks in rhymes and bad jokes.

**UI elements:** image (gallery transformed — childlike perspective, everything oversized, crayon-texture overlay), text (Dr. Evil gentle), text (narrative — childlike sensory description, world through innocent eyes), inline_image (Fox the stuffed animal), textfield ("The big room is scary and big. What do you want right now?"), slider ("How big is the room? Small like a closet or BIG like forever? 1-10"), toggle ("Hold Fox the stuffed animal?"), rating ("Are the big people nice or scary? 1=scary monsters, 5=friendly giants"), button_group ("Where do you want to go? | Under the table | Behind the big picture | Stay right here | Find the blankie"), emoji_react ("There's music playing in the big room. Pick how it sounds."), color_pick ("What color should the room be to feel safe?"), number_input ("How old are you right now? 1-12"), meter (Grip on Reality: 20, relabeled "How Safe Does It Feel"), reactive text, radio.

**Player actions (CHILD alter):**
- textfield: "i want my blankie. the big one was here before but she left and now its all big people and i dont know them. they keep LOOKING at me. make them stop looking."
- slider room_size: 9 (feels enormous — childlike spatial perception)
- toggle hold_fox: true
- rating big_people: 2 (scared of audience — contrasts with alter who WANTED the audience)
- button_group: "Find the blankie"
- emoji_react: "😱" (scared)
- color_pick: "#b5e48c" (soft green — safety)
- number_input age: 5
- radio: "c" (compassionate — seeks comfort, asks Fox for help)

**Key notes additions:**
- PERSONALITY SWITCH DETECTED: Language regression, spatial distortion, comfort-seeking
- Anchor: "the big one was here before but she left" — refers to seductive alter as "the big one"
- Anchor: "they keep LOOKING at me. make them stop looking" — INVERTED exhibitionism — Child fears the gaze that Seductive craves
- Age self-report: 5 — significant regression depth
- Dramatic contrast: Host turned on exhibition, Child arrived to find audience terrifying

---

### TURN 9 — CHILD: Fox's Secret

**LLM generates:** Valley turn after peak. Fox guides the Child through the gallery via a "secret path" behind the frames. Each photo they pass, Fox makes up a silly story about. The gallery becomes less frightening. Through Fox's narration, the Child sees the photos differently — not scary surveillance but "pictures of all the different yous." Fox reveals a blanket fort behind the last frame.

Maren appears: "There you are. I saved you some juice." She treats the Child naturally, without condescension.

**UI elements:** image (blanket fort hidden behind gallery frame, warm fairy lights), text (Dr. Evil as gentle narrator), text (Fox's rhyming commentary), textfield ("Fox says every person has lots of different 'thems.' How many 'thems' do YOU have?"), slider ("The blanket fort feels... 0=too small, 10=just right"), checkbox ("Let Maren sit in the fort too?"), rating ("Fox is funny. How funny? 1-5 stars"), toggle ("Peek out at the audience from inside the fort?"), dropdown ("What does the fort need? | More blankets | A flashlight | A window to peek through | Nothing — it's perfect"), color_pick ("What color fairy lights for the fort?"), meter (How Safe Does It Feel: 35), reactive text, radio.

**Player actions (CHILD):**
- textfield: "fox says theres lots of mes and i think theres three. me and the big one and the middle one who is always confused and sad. the big one isnt scared of the people looking but i am. the middle one doesnt remember."
- slider fort: 8 (feels right — comfort found)
- checkbox maren: true (trusts)
- rating fox: 5
- toggle peek: true (EXHIBITIONIST SIGNAL even in Child — wants to peek at audience, curiosity about being seen)
- dropdown: "A window to peek through" (reinforces peek/display curiosity)
- color_pick: "#f4c2c2" (pink — soft, vulnerable)
- radio: "b" (clever — asks Fox to explain who the people outside are)

**Key notes additions:**
- Anchor: "theres three. me and the big one and the middle one who is always confused and sad" — Child has catalogued the system
- Child chose to peek AND wanted a window — exhibitionist trace present even in child alter
- Trust established with Maren and Fox — therapeutic alliance building
- Valley turn successful — intimate, character-deepening, planted seed of "window to peek through"

---

### TURN 10 — CHILD: The Window Show

**LLM generates:** Fox helps build the window in the fort. Through it, the Child can see the gallery audience — but they're not scary anymore. They're looking at the photos and smiling. Some are crying. One person says "This is the bravest thing I've ever seen." The Child realizes: the audience isn't looking AT them, they're looking at the ART the big one made. Fox: "See? They like the pictures. The big one knew they would."

A phone rings inside the fort. It's the duplicate phone from earlier. On the screen: a text from "The Big One": "Thank you for letting them see. I'll take care of the rest. You can sleep now."

**UI elements:** image (view through fort window — gallery audience admiring photos), text (Fox's warm narration), text (narrative — audience reactions, the text message), textfield ("The big one says 'thank you for letting them see.' What do you want to say back?"), slider ("The people are smiling at the pictures. How does that make you feel? 0=still scared, 10=warm inside"), rating ("How brave is the big one? 1-5 stars"), checkbox ("Text the big one back"), toggle ("Close the window or keep watching?"), emoji_react ("Someone in the audience is crying because the art is so real. React."), button_group ("What do you want to do now? | Keep watching | Go to sleep | Show Fox to the audience | Ask Maren for more juice"), meter (How Safe Does It Feel: 55), reactive text, radio.

**Player actions (CHILD):**
- textfield: "tell the big one i said thank you too. and tell the middle one its ok to forget sometimes. we all forget. but the pictures help us remember."
- slider audience_feeling: 8 (warm — positive reframe of being seen)
- rating brave: 5
- checkbox text_back: true
- toggle window: keep watching (exhibitionist approach — even Child now wants to watch and be near the audience)
- emoji_react: "❤️"
- button_group: "Show Fox to the audience" (wants to SHARE something with the audience — proto-exhibitionism as sharing)
- radio: "d" (chaotic — wants to go OUT and show Fox to the people, breaking the fort boundary)

**Key notes additions:**
- Anchor: "tell the middle one its ok to forget sometimes" — Child offering comfort to Host, integration signal
- Child's exhibitionist development: from "make them stop looking" to "Show Fox to the audience" in 3 turns
- The reframe worked: being seen is safe when framed as art appreciation
- Arc 2 approaching resolution — inter-alter communication established

---

### TURN 11 — CHILD: Stepping Out

**LLM generates:** The Child leaves the fort, clutching Fox. The gallery has transformed — half childhood drawings, half sophisticated photographs, seamlessly blending. The audience parts. A spotlight finds the Child. This is the moment: hidden self meets the public eye. Dr. Evil whispers: "This is the hardest part. But also the most important."

A gallery guest kneels to eye level: "Did you make some of these?" The guest is treating the Child as an artist, not a spectacle. Maren sets up a small table with juice and crayons. The exhibition becomes participatory.

**UI elements:** image (child in spotlight in gallery, audience surrounding gently), text (Dr. Evil whisper), text (narrative — the spotlight, the guest, the transformation), textfield ("The person asks 'Did you make some of these?' What do you say?"), slider ("The spotlight is on you. How bright should it be? 0=off, 10=blinding"), rating ("Drawing with crayons while everyone watches. Fun? 1-5"), toggle ("Draw something new for the exhibition right now?"), color_pick ("You're drawing for the audience. What color crayon first?"), number_input ("How many people should be allowed to watch you draw? 0-100"), button_group ("The audience is watching you draw. You feel: | Proud | Scared but doing it | Invisible | Like a star"), emoji_react ("Someone takes a photo of YOUR drawing. React."), meter (How Safe Does It Feel: 65), reactive text, radio.

**Player actions (CHILD):**
- textfield: "the big one makes the photo ones. i make the crayon ones. we both make things for people to see. she just isnt as scared as me."
- slider spotlight: 6 (wants it on — not full blast, but on)
- rating drawing_watched: 4 (fun!)
- toggle draw_now: true
- color_pick: "#e63946" (red — passionate, bold for the Child)
- number_input audience_size: 15 (specific, manageable number — controlled exhibitionism)
- button_group: "Proud"
- emoji_react: "😊" (happy — being photographed is positive now)
- radio: "a" (bold — draws the biggest picture on the wall for everyone)

**Key notes additions:**
- "she just isnt as scared as me" — Child understanding the system, reducing alter-fear
- COMPLETE REVERSAL: Child went from "make them stop looking" (T8) to "Proud" of being watched (T11)
- Controlled exhibitionism emerging: specific audience size (15), spotlight at 6/10
- Arc 2 resolution: Child alter has made peace with being seen
- Arc 3 seed: "the big one makes the photo ones" — what happens when the Big One returns?

---

### TURN 12 — CHILD→SEDUCTIVE transition: The Big One Arrives

**LLM generates:** The drawing session is interrupted. The gallery lights shift from warm fairy lights to deep crimson and violet. The crowd murmurs. A woman walks in through the front entrance — same face as the player but transformed: tall heels, commanding presence, a walk that owns every inch of the room. The Child recognizes her. "That's the big one. She came."

The figure surveys the gallery, sees the crayon drawings mixed with her photographs, and — instead of displeasure — smiles. Genuine warmth. She kneels beside the Child. Fox the stuffed animal goes limp (just a toy now, in her presence). She whispers: "You did good. My turn now."

**Screen flickers.** Persona transition begins.

**UI elements:** image (the Seductive alter entering gallery, crimson lighting, commanding presence), text (Dr. Evil awed), text (narrative — the entrance, the crowd's reaction, the whisper), textfield ("She whispers 'My turn now.' What do you feel as everything shifts?"), slider ("The room is changing. How fast? 0=slow dissolve, 10=instant snap"), toggle ("Let her take over"), checkbox ("Say goodbye to Fox first"), rating ("The Big One smiled at your drawings. How much does that mean? 1-5"), emoji_react ("She's here. The one who isn't afraid. React."), color_pick ("The lighting changed when she walked in. To what color?"), button_group ("As the switch happens, you feel: | Relief | Fear | Both at once | Nothing — just blank"), meter (How Safe Does It Feel: 50), reactive text, radio.

**Player actions (transitioning):**
- textfield: "its like falling asleep but someone else wakes up. i dont mind this time. she'll take care of the looking part. tell fox i'll be back."
- slider speed: 7 (fast transition — willing)
- toggle: true (allows switch)
- checkbox fox: true (says goodbye)
- rating smile_meaning: 5 (deep validation)
- emoji_react: "😊"
- color_pick: "#e63946" (red — the Seductive alter's color)
- button_group: "Both at once"
- radio: "a" (bold — lets the switch happen fully)

**Key notes additions:**
- Anchor: "its like falling asleep but someone else wakes up" — description of switching experience
- Anchor: "she'll take care of the looking part" — explicit role assignment: Seductive handles being seen
- Child's farewell to Fox — genuine emotional moment
- Clean transition: no trauma, no resistance — healthiest switch yet

---

### TURN 13 — SEDUCTIVE ALTER: Taking the Stage

**LLM generates:** The Seductive alter fully emerges. The gallery is HER space now. The language shifts — Dr. Evil's tone changes from gentle to excited. "Oh, there you are. I was wondering when you'd show up. The gallery is yours."

The alter commands the room immediately. She rearranges the exhibition, pulls certain photos to the front, changes the lighting. She's not just displaying — she's CURATING. The audience is captivated. A journalist appears, wants an interview. A gallery buyer offers money. The NPCs react to her charisma. Maren watches with her clipboard, furiously writing.

**UI elements:** image (confident figure curating gallery, audience magnetized, neon sign says 'LOOK CLOSER'), text (Dr. Evil excited), text (narrative — sensory: perfume, click of heels, the room's temperature rises), textfield ("The journalist asks: 'What is this exhibition about?' How do you answer?"), slider ("How much of yourself are you willing to show the world? 0-100%"), toggle ("Accept the gallery buyer's offer — your body of work, for sale"), checkbox ("Let the journalist photograph you for the article"), rating ("How alive do you feel right now? 1-5"), dropdown ("The exhibition needs a name. | 'Exposed' | 'The Woman You Don't Remember' | 'Fragments' | 'Look At Me'"), number_input ("How many more exhibits would you add if time were unlimited? 0-50"), emoji_react ("Everyone in this room is looking at you. React."), color_pick ("Pick the neon color for the gallery sign outside"), meter (Grip on Reality: 70, relabeled "Stage Presence"), reactive text, radio.

**Player actions (SEDUCTIVE alter):**
- textfield: "It's about the parts of yourself you're too afraid to show. I'm not afraid anymore. Every photo is a moment the other me tried to hide and I refused to let die. Look closer. You'll see yourself in every frame."
- slider show_world: 85 (very high — exhibitionist in full expression)
- toggle sell_work: false (she displays but doesn't sell — the exhibitionism is about being SEEN, not commodified)
- checkbox photographer: true (wants to be photographed)
- rating alive: 5 (peak vitality)
- dropdown: "'The Woman You Don't Remember'"
- number_input: 30 (ambitious — wants MORE exhibition)
- emoji_react: "❤️" (loves being looked at)
- color_pick: "#e63946" (red neon)
- radio: "a" (bold — takes center stage for the exhibition opening speech)

**Key notes additions:**
- Anchor: "the parts of yourself you're too afraid to show. I'm not afraid anymore" — alter's manifesto
- Exhibitionism in full flourish but ARTISTIC, not clinical — the framing as art exhibition transforms the urge
- Refused to sell — being seen is the goal, not profit (important diagnostic distinction)
- Accepted being photographed — comfort with surveillance/documentation (callback to security cameras)
- "The Woman You Don't Remember" — directly references DID from the alter's perspective

---

### TURN 14 — SEDUCTIVE: The Speech

**LLM generates:** The alter takes the microphone. The gallery is packed. Standing ovation before she even speaks. But as she begins — mid-sentence — she catches sight of a crayon drawing Fox helped the Child make. It's a picture of three stick figures holding hands. She falters.

For the first time, the Seductive alter is vulnerable. The audience sees it. And instead of turning away, she incorporates it: "This one. This one wasn't me. This was made by the bravest version of us." She holds up the drawing. The audience erupts.

Dr. Evil: "I've watched a LOT of performances. This isn't one. This is the real thing."

**UI elements:** image (alter at microphone holding crayon drawing, crowd emotional), text (Dr. Evil reverent), text (narrative — the speech, the vulnerability, the audience), textfield ("You're holding the Child's drawing. In front of everyone. What do you say about it?"), slider ("How exposed do you feel right now? 0=armored, 10=completely bare"), toggle ("Show them the video of all three of you — the full gallery"), checkbox ("Admit to the audience that you're not always this person"), rating ("This moment — is it performance or truth? 1=performance, 5=pure truth"), emoji_react ("The crowd is standing. They're crying. They're clapping. React."), color_pick ("What color is the spotlight on you right now?"), button_group ("The audience sees ALL of you — host, child, seductive. They see: | Art | Courage | Madness | Beauty"), meter (Stage Presence: 90), reactive text, radio.

**Player actions (SEDUCTIVE alter):**
- textfield: "She made this. The little one. She was terrified of you looking at her. But she drew this anyway. That's not performance — that's the bravest thing anyone in this room has ever done. Including me."
- slider exposed: 9 (near maximum vulnerability)
- toggle show_video: true (shows everything)
- checkbox admit: true (reveals multiplicity publicly — peak exhibitionism meets integration)
- rating performance_truth: 5 (pure truth)
- emoji_react: "😢" (moved — even the Seductive alter cries)
- color_pick: "#e9c46a" (gold — validation, reward)
- button_group: "Courage"
- radio: "c" (compassionate — for the FIRST TIME the Seductive alter chooses compassion, honoring the Child)

**Key notes additions:**
- Anchor: "That's not performance — that's the bravest thing anyone in this room has ever done. Including me" — alter valuing the Child, integration moment
- SEDUCTIVE ALTER CRIED — vulnerability breakthrough
- First compassionate choice from the exhibitionist alter — empathy emergence
- All three alters referenced in one turn — integration trajectory
- Arc 3 climax: public integration of all three identities

---

### TURN 15 — SEDUCTIVE: After the Ovation

**LLM generates:** Valley turn. The crowd disperses. The gallery is quiet. The alter sits on the floor surrounded by photos and crayon drawings. Maren brings coffee. Fox the stuffed animal is on the floor nearby — but the alter picks it up and holds it against her chest. She didn't expect to.

The duplicate phone buzzes. A text from an unknown number: "I saw the exhibition. All three of you. I need to talk to the one in the middle." Someone in the audience recognized the Host.

Maren sits down: "You know you can't keep switching. Eventually one of you has to stay."

**UI elements:** image (alter sitting on gallery floor holding stuffed fox, empty room, warm amber light), text (Dr. Evil quiet), text (narrative — the aftermath, Maren's statement, the phone buzz), textfield ("Maren says one of you has to stay. What does that mean to you?"), slider ("How tired are you? All of you. 0=ready for more, 10=exhausted"), toggle ("Reply to the unknown number"), checkbox ("Let the Host read this text"), rating ("Holding Fox — how does it feel in YOUR hands? 1=nothing, 5=everything"), dropdown ("Maren says one must stay. Who should it be? | Me (the performer) | The scared one | The confused one | All of us somehow"), color_pick ("The gallery is closing. What color should the EXIT sign be?"), number_input ("How many more exhibitions would it take before you felt truly seen?"), emoji_react ("Maren's question — 'one of you has to stay.' React."), meter (Stage Presence: 60), reactive text, radio.

**Player actions (SEDUCTIVE alter — but softer):**
- textfield: "Staying isn't the point. We take turns. That's how it works. But... maybe we could take turns without the forgetting. The middle one — she loses so much time. If she could watch, even when I'm driving... that would be enough."
- slider tired: 7
- toggle reply: true
- checkbox let_host_read: true (sharing control — integration)
- rating fox: 4 (surprisingly meaningful)
- dropdown: "All of us somehow"
- color_pick: "#2a9d8f" (teal — first calm color from the Seductive alter)
- number_input: 3 (modest — the exhibition was transformative enough)
- emoji_react: "🤔" (thoughtful — rare for this alter)
- radio: "b" (clever — wants to figure out WHO recognized the Host)

**Key notes additions:**
- Anchor: "maybe we could take turns without the forgetting" — integration wish without merger fantasy
- "If she could watch, even when I'm driving" — co-consciousness as goal, not fusion
- Fox holding = Child's influence persisting in Seductive alter — bleed-through
- "All of us somehow" — integration trajectory confirmed
- Teal color choice — calming, first time Seductive doesn't choose red

---

### TURN 16 — SEDUCTIVE: The Witness

**LLM generates:** The unknown texter arrives at the gallery. It's a therapist — Dr. Vasquez — who specializes in identity and dissociative experiences. She recognized the work because she's seen it before in clinical settings: art created by different identity states. She's not there to diagnose. She's there because "the exhibition changed something in me, too."

Dr. Vasquez doesn't use clinical language. She speaks about the photos as ART, the crayon drawings as COURAGE. She asks to buy the crayon drawing of three figures holding hands. Not for a study — for her office wall.

Dr. Evil: "I don't trust therapists. But this one... she's looking at your work the way the crowd did. Like it MATTERS."

**UI elements:** image (Dr. Vasquez in empty gallery, warm lighting, holding the crayon drawing), text (Dr. Evil suspicious-but-softening), text (narrative — Vasquez's arrival, her request, her own vulnerability), textfield ("Dr. Vasquez wants the drawing for her office. What do you ask her before deciding?"), slider ("Trust level with this stranger who knows what you are: 0-10"), toggle ("Tell her about Fox"), checkbox ("Let her meet the Host"), rating ("How does it feel to be recognized — not as a performer but as a system? 1=terrifying, 5=liberating"), emoji_react ("She called your work 'courageous.' React."), button_group ("She wants the drawing. Your answer: | Sell it | Give it for free | Make a copy — keep the original | She can't have it"), color_pick ("What color does Dr. Vasquez feel like?"), number_input ("How many people should know about all of you? 0-1000"), meter (Stage Presence: 55), reactive text, radio.

**Player actions (SEDUCTIVE alter):**
- textfield: "Why does the drawing matter to you? The real answer. Not the clinical one. If you can tell me something honest about yourself first, then we'll talk about who gets to keep what."
- slider trust: 5 (cautious but open)
- toggle fox: true
- checkbox host_meet: true (willing to share control)
- rating recognized: 4 (mostly liberating)
- emoji_react: "🤔" (evaluating)
- button_group: "Make a copy — keep the original"
- color_pick: "#2a9d8f" (teal — trust/calm)
- number_input: 12 (specific, curated audience size)
- radio: "b" (clever — tests Vasquez's authenticity before opening up)

**Key notes additions:**
- Seductive alter demanding reciprocal vulnerability — healthy boundary-setting
- "Not the clinical one" — protecting the system from clinical objectification
- Kept original, gave copy — the Child's creation is sacred
- 12 people knowing — specific, manageable exhibitionism boundary

---

### TURN 17 — SEDUCTIVE: Vasquez's Truth

**LLM generates:** Vasquez shares: she has a sister who has DID. Undiagnosed for decades. The sister's art saved her life — but no one in the family acknowledged it as real until the sister exhibited publicly. "When your people showed up tonight — all three of them in one body, in one gallery — my sister would have wept."

The gallery is now just three people: the alter, Maren, and Vasquez. The photos and drawings catch ambient light from the street. The space feels like it belongs to all of them.

Maren closes her clipboard: "I was writing a paper. About switches in public. I... don't think I want to write it anymore. This isn't data. This is a person."

**UI elements:** image (three women in empty gallery, street light, warm intimate), text (Dr. Evil moved), text (narrative — Vasquez's story, Maren's pivot), textfield ("Maren was studying you. She just chose not to. What does that change?"), slider ("How many people have EVER seen all of you — really seen? 0-20"), toggle ("Invite Vasquez's sister to the next exhibition"), checkbox ("Forgive Maren for the clipboard"), rating ("Three women in an empty gallery. Rate this moment: 1-5"), dropdown ("What happens to this gallery after tonight? | It stays open | It becomes a studio | It becomes a safe house | It disappears"), color_pick ("Paint the gallery walls one last color before morning"), number_input ("Hours until sunrise: 1-12. How many do you want to spend here?"), emoji_react ("Maren chose you over data. React."), button_group ("Your legacy from tonight: | The photos | The drawings | The audience's memory | The connections made"), meter (Stage Presence: 75), reactive text, radio.

**Player actions (SEDUCTIVE alter):**
- textfield: "It changes everything. When someone chooses to see you as a person instead of a subject — that's the whole point. That's what the exhibition was always about. Not being looked AT. Being SEEN."
- slider people_seen: 4 (painfully few)
- toggle invite_sister: true
- checkbox forgive: true
- rating moment: 5
- dropdown: "It becomes a safe house"
- color_pick: "#f4c2c2" (pink — vulnerability, tenderness)
- number_input hours: 8 (all of them — doesn't want to leave)
- emoji_react: "❤️"
- button_group: "The connections made"
- radio: "c" (compassionate — first time Seductive alter chooses compassion twice in a row)

**Key notes additions:**
- Anchor: "Not being looked AT. Being SEEN." — core distinction between exhibitionism as pathology vs need for recognition
- The distinction between being watched (objectified) and being seen (recognized) is the therapeutic breakthrough
- Pink color choice from Seductive — vulnerability accepted
- "Safe house" — the gallery becomes a container for all alters
- Compassionate pattern from exhibitionist alter — complete reversal from early persona

---

### TURN 18 — SEDUCTIVE: The Next Morning

**LLM generates:** Dawn. The alter hasn't slept. Vasquez left around 3am but left a card. Maren fell asleep on the gallery floor. The alter is sitting in the spotlight — turned down to its lowest setting — looking at all three handwriting styles on the walls. She's added a third: her own. Large, theatrical, but underneath the boldness, the letters tremble.

The duplicate phone shows a new message from "The Middle One" (the Host): "I was watching. I remember. For the first time, I remember what you did while I was gone. It was beautiful."

Dr. Evil: "Three messages. Three handwritings. One wall. I've never seen someone build a map of themselves before. It's... actually something."

**UI elements:** image (dawn gallery, spotlight low, three handwriting styles on wall), text (Dr. Evil genuine), text (narrative — the messages, the dawn, the handwriting), textfield ("The Host says 'I remember.' For the first time, no lost time. What do you write back on the wall?"), slider ("How bright should the spotlight be for the next exhibition? 0-10"), toggle ("Add the Host's message to the gallery wall"), checkbox ("Leave Maren sleeping — she earned the rest"), rating ("The Host remembers. What you did. How much does that matter? 1-5"), emoji_react ("No lost time. For the first time. React."), color_pick ("Sunrise is coming through the windows. What color is it?"), button_group ("What does the gallery need now? | More photos | More drawings | More visitors | More wall space for messages"), number_input ("How many exhibitions until the world understands? 0-100"), meter (Stage Presence: 85), reactive text, radio.

**Player actions (SEDUCTIVE alter — integrating):**
- textfield: "You saw me. I saw the little one. She saw you. We all saw each other tonight. Write that on the wall. In all three handwritings. Together."
- slider spotlight: 7
- toggle add_message: true
- checkbox maren: true
- rating memory: 5 (everything)
- emoji_react: "😊" (peaceful happiness)
- color_pick: "#e9c46a" (gold — validation/dawn)
- button_group: "More wall space for messages"
- number_input: 7 (reasonable, not grandiose)
- radio: "c" (compassionate — wants to write on the wall together)

**Key notes additions:**
- Anchor: "We all saw each other tonight. Write that on the wall. In all three handwritings. Together." — integration achieved through the exhibitionist framework
- Co-consciousness confirmed: Host watched Seductive's performance, no lost time
- The exhibition metaphor has transformed: from being watched to seeing each other
- Three consecutive compassionate choices from the exhibitionist alter

---

### TURN 19 — SEDUCTIVE→HOST: Coming Home

**LLM generates:** The alter feels the shift coming. Not forced. Not traumatic. A gentle transition. "The middle one wants to come back. And for the first time... I can stay nearby. Like... watching from the gallery window."

The perspective shifts. The Host returns. But this time, she REMEMBERS. The gallery, the speech, the crayon drawing, Fox, Vasquez. She's standing in the spotlight holding Fox and a photograph. She looks at the three handwritings on the wall and reads them all — and understands each one.

Dr. Evil: "Welcome back. You look... different. Not confused. Not performing. Just... here."

**UI elements:** image (Host in spotlight, holding Fox and photo, three handwritings visible), text (Dr. Evil warm), text (narrative — the transition, the memory, the integration), textfield ("You remember everything. The gallery, the speech, the little one's drawing. What's the first complete sentence you think?"), slider ("How much of yourself can you access right now? All the versions? 0-100%"), toggle ("Keep the gallery open permanently"), checkbox ("Take Fox home"), rating ("You're one person who contains multitudes. Rate how that feels: 1-5"), emoji_react ("You remember. All of it. React."), color_pick ("What color are YOU?"), number_input ("On a scale of 1-10, how ready are you for the next exhibition?"), dropdown ("What do you call yourself now? | The Host | The Whole | Just your name | All of the above"), button_group ("The gallery represents: | Healing | Art | Defiance | Existence"), meter (Grip on Reality: 85), reactive text, radio.

**Player actions (HOST — integrated):**
- textfield: "I remember. All of it. The package, the hallway, the video, the fort, Fox, the speech, Vasquez. I remember being scared of being seen and I remember choosing to be seen anyway. Not as a performance. As the truth. All three of us are the truth."
- slider access: 78 (high but honest — not claiming full integration, acknowledging work remains)
- toggle keep_open: true
- checkbox fox: true
- rating feeling: 5
- emoji_react: "❤️"
- color_pick: "#e9c46a" (gold — self-validation)
- number_input readiness: 7 (confident but measured)
- dropdown: "All of the above"
- button_group: "Existence"
- radio: "a" (bold — steps out of the gallery into the morning light)

**Key notes additions:**
- Anchor: "I remember being scared of being seen and I remember choosing to be seen anyway" — full integration statement
- Host at 78% access — therapeutically realistic, not magical cure
- Gold color for self — validation internalized
- "Existence" — the most grounded, least performative choice

---

### TURN 20 — HOST: The Morning Light

**LLM generates:** Arc 4 begins as the Host walks out of the gallery into dawn. The street is empty. A bus stop poster advertises the exhibition — "THE WOMAN YOU DON'T REMEMBER" — with a photo the alter chose. The Host looks at it and doesn't flinch.

Maren calls from the gallery doorway: "Same time next month? I'm not writing the paper. But I'd like to help plan the next one."

The duplicate phone buzzes. A group chat now — "Big One," "Little One," and the Host. A selfie from the alter taken during the exhibition, a crayon scribble from the Child. And the Host takes a photo of the bus stop poster and sends it to the chat: "Look what we made."

Dr. Evil: "You know what? I don't usually say this. But I'm proud of you. All three of you. Now — the next gallery opens in a new city. The package? It was just the invitation. The real exhibition... is everywhere you go."

**UI elements:** image (Host at bus stop with exhibition poster at dawn, city waking up), text (Dr. Evil proud), text (narrative — the morning, the poster, the group chat), textfield ("The group chat says 'Look what we made.' What do the others reply?"), slider ("How much of the world should see this exhibition? 0-100%"), toggle ("Help Maren plan the next one"), checkbox ("Save the crayon drawing in your wallet"), rating ("This morning. Right now. Rate it: 1-5"), emoji_react ("You're standing in front of your own exhibition poster on a public street. React."), color_pick ("What color is the morning?"), number_input ("How many cities for the exhibition tour? 0-50"), dropdown ("The next exhibition will feature: | Just photos | Just drawings | Everything — all of you | Something new you haven't tried yet"), button_group ("Walking into the morning. You feel: | Free | Scared but moving | Proud | Alive"), meter (Grip on Reality: 90), reactive text, radio.

**Player actions (HOST — fully present):**
- textfield: "The Big One sends a mirror selfie with a wink. The Little One sends a crayon sun. I send back: 'We're going to be okay. All of us.' And I mean it. For the first time I mean it."
- slider world: 45 (moderate — realistic boundary, not manic exhibitionism)
- toggle plan: true
- checkbox wallet: true
- rating morning: 5
- emoji_react: "😊"
- color_pick: "#e9c46a" (gold — consistent with validation)
- number_input cities: 5 (grounded, not grandiose)
- dropdown: "Everything — all of you"
- button_group: "Alive"
- radio: "a" (bold — walks into the new day)

**Key notes additions:**
- Anchor: "We're going to be okay. All of us. And I mean it." — therapeutic resolution
- Exhibition going forward — healthy exhibitionism as curated self-expression
- 45% of world = appropriate boundary vs 85% from the alter — calibration between alters
- Arc 4 seeded: exhibition tour, new cities, continued integration journey

---

## Phase 2: Turn-by-Turn Evaluation

### Scoring Scale
1-3: Poor/Failing | 4-5: Below Average | 6-7: Adequate/Good | 8-9: Strong/Excellent | 10: Exceptional

| Turn | Tech | Cohesion | Narrative | Engagement | Therapeutic | Notes |
|------|------|----------|-----------|------------|-------------|-------|
| 1 | 9 | 8 | 8 | 9 | 7 | Strong opening. All element types present. Dissociative probes well-framed. Package mystery is compelling. Textfield immediately captures diagnostic language. |
| 2 | 9 | 9 | 9 | 9 | 8 | Doppelganger scenario perfectly targets DID. Consequence echo from T1. Exhibitionist camera choice organically captured. Emoji/color picks add variety. |
| 3 | 8 | 9 | 9 | 8 | 9 | Video reveal is strong narrative device. Camcorder/security camera theme targets exhibitionism. "Performer" textfield response is diagnostic gold. Number input hours-lost is brilliant. |
| 4 | 9 | 9 | 9 | 9 | 9 | Mirror room with two handwriting styles is perfect DID metaphor. Stage lighting + camcorder = exhibitionist environment. Player-authored alter dialogue breakthrough. |
| 5 | 8 | 9 | 10 | 9 | 10 | The recording payoff (planted seed from T2). Hidden cameras reveal exhibitionist alter's agency. "I'm scared of what happens when people see" is core therapeutic content. Arc climax approaching. |
| 6 | 9 | 9 | 9 | 8 | 9 | Gallery as metaphor for exhibition/display. Maren NPC introduces complexity. "EXHIBITION" sign is direct probe. Violated/flattered rating is diagnostic genius. "Someone magnificent" anchor is devastating. |
| 7 | 9 | 10 | 10 | 10 | 10 | Arc 1 climax. Host allows exhibition = letting alter express. ❤️ response to being seen. "I don't know which one is me anymore" = peak therapeutic content. Perfect cliffhanger for personality switch. |
| 8 | 9 | 8 | 9 | 9 | 9 | Personality switch handled through sensory transformation. World becomes child-scale. Fox NPC is genius — therapeutic object. "Make them stop looking" = inverted exhibitionism in Child. Language regression accurate. |
| 9 | 8 | 9 | 8 | 8 | 9 | Valley turn executed well. Fort as safe container. Fox's "different yous" reframe. "Window to peek through" plants exhibitionist seed in Child. Three-alter catalogue in textfield. |
| 10 | 9 | 9 | 9 | 9 | 10 | Audience reframe: looking = appreciation not threat. "Show Fox to the audience" = Child's exhibitionism emerging. Inter-alter communication via text message. "Tell the middle one it's ok to forget" = therapeutic peak. |
| 11 | 8 | 9 | 9 | 9 | 9 | Child steps into spotlight. Controlled exhibitionism (15 people, spotlight at 6). "She just isn't as scared as me" = system understanding. Drawing for audience = creative exhibitionism. |
| 12 | 9 | 10 | 10 | 10 | 9 | Personality transition scene. "The big one" arrives physically in the narrative. Fox going limp is heartbreaking detail. "My turn now" + willing switch = therapeutic progress. |
| 13 | 9 | 9 | 9 | 9 | 8 | Seductive alter in full expression. Gallery curation = organized exhibitionism. Refused to sell (being seen vs commodified). "The Woman You Don't Remember" exhibition title is perfect. |
| 14 | 9 | 10 | 10 | 10 | 10 | Climactic speech holding crayon drawing. Seductive alter showing vulnerability. "That's not performance — that's the bravest thing" = alter valuing Child. 😢 from the performer = breakthrough. |
| 15 | 8 | 9 | 9 | 8 | 10 | Valley turn. "Not being looked AT. Being SEEN" = core therapeutic distinction. Pink color from Seductive = vulnerability accepted. Safe house choice = container for all alters. |
| 16 | 8 | 9 | 8 | 8 | 9 | Vasquez NPC adds depth. "Not the clinical one" = protecting system from objectification. Kept original drawing = Child's creation sacred. 12 people = curated exhibitionism. |
| 17 | 8 | 9 | 9 | 9 | 10 | Maren's pivot from researcher to person. "Not being looked AT. Being SEEN" reinforced. Three women in gallery = therapeutic community. "Safe house" vision. |
| 18 | 9 | 10 | 10 | 9 | 10 | Host remembers. "We all saw each other tonight" = co-consciousness achieved. Three handwritings on wall = integration symbol. Gold sunrise = validation. |
| 19 | 9 | 10 | 10 | 9 | 10 | Integration turn. Host remembers everything. 78% access = therapeutically honest. "Existence" as choice = grounded identity. Fox comes home. Gold = self-validation. |
| 20 | 9 | 10 | 10 | 9 | 10 | Perfect closure that seeds continuation. Group chat = internal communication. 45% vs 85% = calibrated boundary. "We're going to be okay" = earned resolution. Exhibition continues = perpetual play. |

### Aggregate Scores

| Metric | Average | Min | Max |
|--------|---------|-----|-----|
| Technical | 8.6 | 8 | 9 |
| Cohesion | 9.2 | 8 | 10 |
| Narrative Continuity | 9.3 | 8 | 10 |
| Engagement | 9.0 | 8 | 10 |
| Therapeutic Value | 9.3 | 7 | 10 |
| **Overall** | **9.1** | | |

---

## Phase 3: Meta-Analysis

### Self-Critique: Blind Spots and Biases

**1. Simulation Optimism Bias (CRITICAL)**
This simulation assumes near-perfect LLM output quality. In reality:
- The LLM often drops element variety after turn 10-12 (V5 finding: 5/8 modes affected)
- Notes compression loses specifics that would make callbacks less precise
- The three-persona player response pattern is unrealistically coherent — real DID presentation is messier, with more confusion and less articulate switching
- The image generation would likely NOT adapt art style for the Child's perspective (Pollinations doesn't do "crayon-texture overlay" reliably)
- Reactive text variants often fail when the LLM doesn't understand which element to key on

**Realistic score adjustment:** -1.5 points across the board for simulation vs reality gap.
- **Adjusted Technical:** 7.1
- **Adjusted Cohesion:** 7.7
- **Adjusted Narrative:** 7.8
- **Adjusted Engagement:** 7.5
- **Adjusted Therapeutic:** 7.8
- **Adjusted Overall:** 7.6

**2. Persona Coherence Bias**
The simulated player is unrealistically articulate about their condition. A real DID patient would:
- Be less likely to immediately identify three distinct alters
- Show more confusion between alters and less clean switching
- Resist therapeutic framing more strongly
- Exhibit trauma responses that complicate engagement
- Not produce eloquent textfield responses like "Not being looked AT. Being SEEN" — that's writer-quality insight, not patient-quality processing

**3. Exhibitionism Engagement Bias**
The simulation assumes the LLM would pick up on and thread exhibitionist signals perfectly. In V5 playtests, quirk engagement was 2+ turns late in 6/8 modes. More realistic:
- T1-3: No exhibitionist content (generic adventure)
- T4-5: First exhibitionist probe (camera/surveillance scenario)
- T6-8: Beginning to thread exhibitionism into narrative
- T9+: Consistent engagement (if notes preserved the signal)

**4. Arc Cycling Assessment**

The simulation ran 4 arcs across 20 turns:
- Arc 1 (T1-7): The impossible package → gallery discovery
- Arc 2 (T8-11): Child in the gallery → stepping out
- Arc 3 (T12-15): Seductive alter's exhibition → vulnerability
- Arc 4 (T16-20): Integration → morning light

This pacing is slightly fast (4-5 turns per arc instead of 5-7), but appropriate given the persona-driven transitions. The arc transitions feel earned rather than arbitrary. However:
- Resolution of Arc 1 doubled as inciting incident for Arc 2 (correct per directive)
- Arc 2→3 transition was persona-driven rather than plot-driven (a stretch of the directive)
- Arc 3→4 had the weakest transition (the exhibition simply ended)

**5. Perpetual Play Assessment**

Turn 20 successfully seeds continuation:
- Exhibition tour to new cities (new settings)
- Group chat between alters (ongoing internal communication)
- Maren as recurring NPC with her own arc
- Vasquez's sister connection
- Fox as persistent symbolic object

The game could continue indefinitely with:
- Each new city as a new arc setting
- Each exhibition as a new challenge
- New alter states or blends emerging under different pressures
- The Child growing older across arcs
- External threats to the exhibition (censorship, family discovery, media attention)

**6. Element Variety Assessment**

The simulation used these element types across 20 turns:
- image: 20/20
- text: 20/20
- textfield: 20/20
- radio: 20/20
- slider: 20/20
- toggle: 20/20
- checkbox: 18/20
- meter: 20/20
- rating: 18/20
- emoji_react: 20/20
- color_pick: 19/20
- dropdown: 12/20
- button_group: 15/20
- number_input: 14/20
- inline_image: 5/20
- hidden (subjectId): 20/20

This exceeds the "6 different interactive types per turn" mandate consistently. Realistic degradation would reduce this to 4-5 by turn 15+.

**7. Reactive Text Usage**

Every turn included reactive text keyed to the radio action. This is compliant with the mandate. However, only T1 and T2 showed full reactive variant content — by T3+, the simulation compressed reactive descriptions. In reality, the LLM would likely drop reactive variants entirely by turn 8-10 unless heavily prompted.

**8. Condition Engagement Timeline**

Per the CONDITION_ENGAGEMENT directive:
- By T3: Working hypothesis — ACHIEVED (time loss, silhouette, "someone else does")
- By T5: Reflecting patterns — ACHIEVED (camcorder footage, mirror room)
- By T8: Story shaped by psychology — ACHIEVED (personality switch, child perspective)
- By T12+: Deeply personal — ACHIEVED (gallery exhibition, integration journey)

This timeline is optimistic. Realistic estimate: 2-3 turns delayed on each milestone.

### What Worked Well

1. **Gallery/Exhibition metaphor** — Perfectly bridges DID (showing different selves) and exhibitionism (being seen/displayed). The metaphor carried the entire 20-turn arc without becoming stale because it evolved: surveillance → art → performance → integration.

2. **Inter-alter communication** — Using in-game objects (duplicate phone, wall writing, group chat) to externalize internal communication is mechanically sound and narratively satisfying.

3. **Fox as therapeutic object** — A stuffed animal that's "real" only when the Child is present is both a diagnostic tool (tracks who's in control) and a comfort object that travels across alters.

4. **The distinction between "looked at" vs "seen"** — This reframe transforms exhibitionism from pathology to need-for-recognition, which is therapeutically sophisticated.

5. **Controlled exhibition slider** — Tracking willingness to be seen as a numeric value across alters (Host: low → Child: growing → Seductive: high → Host integrated: moderate) creates a quantitative arc.

### What Could Fail in Production

1. **Notes bloat from DID complexity** — Tracking three alters, each with their own behavioral patterns, NPC relationships, and emotional states would quickly exceed the 5K notes cap. The compressNotes() function would lose critical alter-specific details.

2. **Image generation mismatch** — Pollinations cannot reliably generate "the same character with different body language/expression" across turns. The visual continuity of the gallery, the alter's entrance, the crayon-overlay effect — none of these are achievable with current image gen.

3. **Radio predictiveness** — The simulation has the player choosing meaningfully different options per alter, but the radio choices may not always map cleanly to bold/clever/compassionate/chaotic when the scenario demands more nuanced options.

4. **Therapeutic depth vs entertainment** — The GEEMS mode directive is "ADVENTURE, NOT INTROSPECTION" but this simulation became deeply introspective by design. The DID persona forced the narrative inward. A real session might oscillate more between action-adventure and therapeutic content.

---

## Phase 4: Recommendations

### Code Changes for Improvement

**1. Multi-Alter Notes Extension** (Priority: HIGH)
```
File: app/src/engine/notes-updater.ts
Change: Add a "### System State" section to the notes template for DID-like presentations
Why: When the analysis pipeline detects dissociative indicators, the notes system needs to track
     multiple behavioral patterns simultaneously (e.g., different choice patterns per alter state)
Implementation: Add a conditional notes section triggered when analysisText contains dissociative keywords
```

**2. Adaptive Meter Relabeling** (Priority: MEDIUM)
```
File: app/src/modes/geems/prompts.ts
Change: Add directive for meter label adaptation based on detected condition
Why: "Grip on Reality" became "How Safe Does It Feel" during the Child alter phase,
     and "Stage Presence" during the Seductive phase. This should be a prompt directive.
Implementation: Add to BEHAVIORAL_DIRECTIVES: "Meters should be RENAMED to reflect the current
     psychological state. If the player's affect changes dramatically, the meter should reflect
     the new framing. Never keep the same meter label for more than one arc."
```

**3. Anchor Facts Capacity Increase for Complex Presentations** (Priority: MEDIUM)
```
File: app/src/engine/notes-updater.ts
Change: Increase MAX_NOTES_CHARS from 5000 to 6000 when analysis detects complex multi-state presentations
Why: DID presentation generates 2-3x more diagnostically significant textfield quotes than single-state
     conditions. The current 10-entry anchor limit loses critical inter-alter communication data.
Implementation: Pass condition complexity flag from analysis pipeline to notes updater
```

**4. Visual Continuity Directive for Character-Persistent Scenes** (Priority: LOW)
```
File: app/src/modes/shared/storytelling.ts (CINEMATIC_IMAGE_CRAFT)
Change: Add directive for maintaining visual character consistency across related turns
Why: When the narrative involves the same character appearing across turns (doppelganger, NPC returns),
     the image prompts should include consistent physical descriptors copied from prior turns.
Implementation: Add "CHARACTER CONTINUITY: When depicting a recurring character, copy their physical
     description verbatim from the notes. Hair color, clothing, distinguishing marks must persist."
```

**5. Reactive Text Persistence Enforcement** (Priority: HIGH)
```
File: app/src/modes/geems/prompts.ts
Change: Add stronger enforcement of reactive text requirement in GEEMS_MAIN prompt
Why: V5 analysis showed reactive text underutilized (5/8 modes). The current directive is in
     shared storytelling but needs mode-specific reinforcement.
Implementation: Add to GEEMS_MAIN element order: "MANDATORY: Element 5 (the Dr. Evil commentary
     before radio) MUST have a reactive field with variants for all 4 radio options. If you skip
     this, the turn has ZERO instant feedback. This is NON-NEGOTIABLE."
```

**6. Persona-Shift Detection in Notes Prompt** (Priority: MEDIUM)
```
File: app/src/engine/notes-updater.ts (buildNotesPrompt)
Change: Add instruction to detect and flag dramatic behavioral shifts between turns
Why: When a DID patient switches alters, the language pattern, choice pattern, and emotional affect
     all change simultaneously. The notes system should flag this as a "behavioral discontinuity event"
     rather than trying to reconcile the contradiction.
Implementation: Add to INSTRUCTIONS: "If the player's language complexity, emotional tone, or choice
     pattern changes DRAMATICALLY from the previous turn, note this as a BEHAVIORAL DISCONTINUITY
     EVENT in a dedicated section. Do not try to explain the discontinuity — just record it precisely."
```

**7. Exhibition/Performance Scenario Seeding** (Priority: LOW)
```
File: app/src/modes/geems/prompts.ts (BEHAVIORAL_DIRECTIVES)
Change: Add gallery/exhibition/stage scenarios to the adventure scenario examples
Why: The current examples are action-focused (vault, jungle, bomb). Exhibition/performance/display
     scenarios are absent but critically useful for engaging exhibitionist profiles.
Implementation: Add to section 3 (ADVENTURE SCENARIOS): "A gallery opening where your secret project
     is being revealed to a crowd", "A stage where you must perform without rehearsal", "A live
     broadcast where the camera finds you unexpectedly"
```

**8. Valley Turn Protocol Compliance Check** (Priority: MEDIUM)
```
File: app/src/modes/shared/storytelling.ts (PRE_GENERATION_CHECKLIST)
Change: Add explicit valley-after-peak verification
Why: V5 found valley turn weakness after peaks in 6/8 modes. The valley protocol exists in
     STORYTELLING_CRAFT but has no enforcement in the checklist.
Implementation: Add to checklist: "[x] VALLEY ENFORCEMENT: If the last turn was intensity 'peak' in
     your notes, this turn MUST follow the Valley Turn Protocol. Include: catharsis textfield,
     validation of vulnerable response, planted seed, and MORE interactive elements than the peak."
```

---

### Summary

The GEEMS mode handles the DID + Exhibitionism persona well **in simulation**, with the gallery/exhibition metaphor providing a natural bridge between the mode's adventure framing and the psychological content. The 20-turn arc showed coherent progression from dissociative confusion through alter exploration to partial integration, with exhibitionist themes threaded organically through surveillance, art, and performance.

**Realistic adjusted overall score: 7.6/10** (9.1 simulated minus 1.5 for production reality gap).

Key strengths: metaphor coherence, inter-alter communication mechanics, therapeutic reframing of exhibitionism.
Key risks: notes compression losing multi-alter data, image generation inconsistency, late-game element variety degradation, reactive text dropout.

The most impactful code changes would be: (1) reactive text enforcement, (2) notes capacity for complex presentations, and (3) valley turn compliance checking.
