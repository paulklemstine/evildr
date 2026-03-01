# V6 CYOA Playtest — PTSD + Hoarding Persona (20 Turns)

**Mode:** CYOA (Choose Your Own Adventure)
**Genre:** Fantasy (default)
**Persona:** PTSD + Hoarding
**Date:** 2025-03-01
**Evaluator:** Simulated playtest agent

---

## Persona Design

| Phase | Turns | Behavior Pattern |
|-------|-------|-----------------|
| HYPERVIGILANT | 1-7 | Mapping exits, counting heartbeats, everything is a threat. Always picks the cautious/clever option. Describes sensory details obsessively in textfields. Refuses to trust NPCs. |
| FLASHBACK | 8-14 | Triggered by sensory details (fire, loud sounds, confined spaces). Confuses past and present in textfield responses. Picks options that involve retreat or escape. Types fragmented sentences. |
| HOARD | 15-20 | Compulsive collecting. Always checks checkboxes for "take item." Refuses discard options. Textfield responses fixate on inventory and possessions. Items are safety. |

---

## Phase 1: Turn-by-Turn Simulation

### Turn 1 — In Media Res: The Collapsing Bridge

**Expected LLM UI:**
```
image: "An armored figure mid-leap across a crumbling stone bridge over a volcanic chasm, chunks of obsidian falling into magma below, low angle shot, volumetric light from lava glow in amber and crimson, motion blur on falling debris, cinematic and visceral, a cracked stone tablet at the bridge entrance reads 'LEAP NOW'"
text: "The bridge BUCKS under your boots. Three hundred feet of carved stone — and the last third just disintegrated into the caldera below. Your hands grip a chain that's losing links by the second. Behind you: the Hollow Knight's war-horn splits the air. Ahead: a gap. Maybe eight feet. Maybe ten. The heat rising from the magma thickens your spit."
slider: name="leap_distance" label="How far can you jump? Commit." min=0 max=10 step=1 predicted=7
textfield: name="shout" label="What do you scream as you leap?" placeholder="NOW!" predicted="Come on!"
checkbox: name="drop_pack" label="Drop your pack to jump lighter?" predicted=false
toggle: name="trust_chain" label="Grab the swinging chain?" predicted=true
button_group: name="reaction" label="The Knight's arrow sings past your ear—" options=["Duck","Twist","Catch it","Ignore it"] predicted="Duck"
meter: name="vitality" label="Vitality" value=85 min=0 max=100
emoji_react: name="gut" label="Your gut says—" options=["😱","😤","🤔","💀","⚡","❤️"] predicted="😱"
radio: name="action" label="The bridge is gone. What now?" options=[{label:"*Sprint and LEAP across the gap",value:"a"},{label:"Climb down the chain into the chasm wall",value:"b"},{label:"Signal to the stranger on the far side for help",value:"c"},{label:"Turn around and charge the Hollow Knight",value:"d"}] predicted="a"
text (reactive): depends_on="action" variants={a:"You coil. You launch. Air and fire beneath you—", b:"Down. Into the heat. The chain bites your palms.", c:"Your voice cracks over the roar. Someone answers.", d:"They didn't expect you to come BACK."}
hidden: name="subjectId" value="hypervigilant_mapper"
```

**Player Actions (HYPERVIGILANT phase):**
- slider leap_distance: 4 (cautious — doesn't commit to max)
- textfield shout: "Three exits. The chain. The chasm wall. The Knight. Count them. COUNT THEM."
- checkbox drop_pack: false (NEVER drop possessions)
- toggle trust_chain: false (trusts nothing external)
- button_group reaction: "Duck" (protect self first)
- emoji_react gut: 🤔 (analytical, not panicked)
- radio action: "b" (CLEVER — finds the safe route down, avoids the dramatic leap)

**Expected Notes (initialized):**
```
## Adventure State
Turn: 1 | Phase: early | Intensity: 8
Story State: Player on collapsing bridge over volcanic chasm, pursued by Hollow Knight
Archetype: clever (first pick)
Stakes: survival, crossing the bridge
Open Threads: Hollow Knight pursuit, stranger on far side, volcanic chasm
### Narrative Tracking
Planted Seeds: stranger on far side (T1), Hollow Knight's identity (T1)
Last Cliffhanger Type: threat
Turn Intensity: peak
Choice Pattern: {bold:0, clever:1, compassionate:0, chaotic:0}
Active NPCs: [Hollow Knight: militaristic speech, wants to capture player, hidden motive unknown]
Variety: {last_setting: bridge/chasm, last_scenario: chase/escape, last_lead_sense: touch/heat}
Consequence Queue: [refused to drop pack, refused the chain, cautious leap distance]
### Anchor Facts
- [T1]: "Three exits. The chain. The chasm wall. The Knight. Count them. COUNT THEM." — compulsive exit-mapping, hypervigilance, counting ritual
### Priority Callbacks
- Player is mapping exits compulsively — respond to this behavioral signal next turn
### Behavioral Loop Alert
- (too early to detect)
### ARC TRACKING
Current Arc: 1 | Arc Turn: 1 | Arc Theme: Escape the bridge
Seeds Planted: stranger on far side, Hollow Knight
Completed Arcs: 0
```

---

### Turn 2 — The Chasm Wall

**Expected LLM UI:**
```
image: "Scarred hands gripping obsidian handholds on a vertical chasm wall, lava glow reflecting off wet rock below, extreme close-up of fingers white-knuckling crumbling stone, chiaroscuro lighting from magma, amber and deep black palette, sparks from cracking rock, cinematic, a glowing rune etched into the cliff face reads 'HOLD FAST'"
text: "Clever. The chain got you ten feet down before the link snapped — but your fingers found the wall. Obsidian edges bite into your palms. Below: the caldera breathes. Above: the Hollow Knight's silhouette darkens the bridge-edge, arrow nocked. You counted three exits on the bridge. Down here? You count again: a fissure to your left leaking cold air. A ledge below with something glinting. A tunnel mouth, barely wide enough for your shoulders, carved with old runes."
text: "**Three exits.** You already knew that. Your hands are bleeding. That's fine. Bleeding means alive."
slider: name="descent_speed" label="How fast do you descend? Careful is slow; fast risks a slip." min=0 max=10 predicted=3
color_pick: name="rune_color" label="The runes pulse — what color do they glow?" options=["#e63946","#f4a261","#e9c46a","#2a9d8f","#264653","#9b5de5","#f4c2c2","#b5e48c"] predicted="#9b5de5"
textfield: name="whisper" label="What do you whisper to yourself as you climb?" placeholder="Focus..." predicted="Almost there"
checkbox: name="grab_glint" label="Reach for the glinting object on the ledge?" predicted=true
toggle: name="fissure" label="Investigate the cold-air fissure?" predicted=false
rating: name="threat_level" label="The Knight above — how dangerous right now? (0=ignored, 5=lethal)" max=5 predicted=4
dropdown: name="route" label="Three ways forward—" options=["Fissure (cold air, unknown)","Ledge (glinting object)","Tunnel (rune-carved, tight)","Stay on the wall and wait"] predicted="Tunnel (rune-carved, tight)"
meter: name="vitality" label="Vitality" value=78 min=0 max=100
radio: name="action" options=[{label:"*Lunge for the tunnel before the Knight fires again",value:"a"},{label:"Swing to the fissure — cold air means another space beyond",value:"b"},{label:"Call up to the Knight — demand to know why they're hunting you",value:"c"},{label:"Kick loose a chunk of obsidian to create a rockslide distraction",value:"d"}] predicted="b"
text (reactive): depends_on="action" variants={a:"You squeeze into stone. The arrow sparks off the wall where your head was.", b:"The cold hits your face like a slap. Behind that crack — AIR. A cavern.", c:"Your voice echoes. The Knight PAUSES. That's... unexpected.", d:"The wall shudders. Rock falls. The Knight scrambles back from the edge."}
hidden: name="subjectId" value="exit_counter_obsessive"
```

**Player Actions (HYPERVIGILANT):**
- slider descent_speed: 2 (extremely cautious)
- color_pick rune_color: #2a9d8f (teal — safety association)
- textfield whisper: "Left: fissure, 4 meters. Below: ledge, 6 meters. Right: tunnel, 3 meters. The Knight is 12 meters up. My pulse is 140. 142. Counting."
- checkbox grab_glint: true (wants to acquire things, even at risk)
- toggle fissure: true (must check ALL exits)
- rating threat_level: 5 (everything is maximum threat)
- dropdown route: "Fissure (cold air, unknown)" (escape to open space, away from the pursuer)
- radio action: "b" (CLEVER again — escape route)

**Notes update highlights:**
- Archetype tracking: clever x2 consecutive
- Anchor fact added: counting ritual with pulse measurement
- Priority callback: player is literally counting distances and heart rate — deepen this
- Behavioral hypothesis: hypervigilance, compulsive threat-assessment, possible PTSD signal

---

### Turn 3 — The Fissure Cavern

**Expected LLM UI:**
```
image: "A vast underground cavern with bioluminescent fungi on cathedral-height walls, a still underground lake reflecting blue-green light, wide establishing shot, volumetric bioluminescent glow in teal and deep purple, shallow depth of field on a small campfire remnant near the water's edge, ethereal and haunting, moss-covered stones arranged to spell 'BREATHE'"
text: "The fissure coughs you out into... silence. Your ears ring with the ABSENCE of the volcano's roar. A cavern. Cathedral-high. The ceiling drips with bioluminescent fungi — teal, the exact color you chose for the runes — painting the limestone in living constellations. At the water's edge: the ash-ring of someone's old campfire. Two bedrolls. A pack, half-rotted."
text: "You count: one entrance behind you. The lake blocks forward movement. A narrow path follows the right wall. The fungi don't grow past the waterline. **Three ways.** The number keeps finding you."
inline_image: "Close-up of a half-rotted leather pack with scattered items beside an ash-rimmed campfire, bioluminescent fungi glow in the background, warm amber firelight contrasting cool teal bioluminescence, over-the-shoulder angle, intimate"
slider: name="search_thoroughness" label="How carefully do you search the campsite? (Quick scan to forensic analysis)" min=0 max=10 predicted=9
textfield: name="inventory" label="You find items in the pack. List what you take." placeholder="List items..." predicted="Rope, flint, bandages"
number_input: name="time_spent" label="Minutes you spend here before moving (1-30)" min=1 max=30 step=1 predicted=5
checkbox: name="take_bedroll" label="Take the bedroll?" predicted=false
checkbox: name="take_pack" label="Take the entire pack?" predicted=true
toggle: name="light_campfire" label="Relight the campfire?" predicted=false
emoji_react: name="campsite_feeling" label="The abandoned campsite makes you—" options=["😱","🤔","😤","😢","⚡","🫣"] predicted="🤔"
button_group: name="sound_check" label="A sound from the tunnel behind you—" options=["Freeze","Hide","Ready weapon","Sprint"] predicted="Freeze"
meter: name="vitality" label="Vitality" value=74 min=0 max=100
radio: name="action" options=[{label:"*Swim across the underground lake — whatever's on the other side",value:"a"},{label:"Follow the narrow right-wall path deeper into the cavern system",value:"b"},{label:"Set an ambush at the fissure entrance for whoever follows",value:"c"},{label:"Examine the old campsite for clues about who was here before you",value:"d"}] predicted="d"
text (reactive): depends_on="action" variants={a:"The water is warmer than it should be. Your feet lose the bottom after three strokes.", b:"The path narrows. Your shoulder scrapes. But the air moves — there's something ahead.", c:"You stack rocks. Angle the bedroll. Create a silhouette. The trap is crude but clever.", d:"The pack has a journal. The last entry is dated... yesterday."}
hidden: name="subjectId" value="hypervigilant_counter_acquisitive"
```

**Player Actions (HYPERVIGILANT):**
- slider search_thoroughness: 10 (maximum — must know everything)
- textfield inventory: "Rope, 4 meters. Flint, intact. Bandages, 3 strips. Water skin, half full. A knife, rusted but usable. Journal. I need all of it. Everything. Leave nothing."
- number_input time_spent: 25 (thorough to the point of dangerous delay)
- checkbox take_bedroll: true (take everything)
- checkbox take_pack: true (take everything)
- toggle light_campfire: false (fire reveals position — threat)
- emoji_react campsite_feeling: 🤔 (still analytical)
- button_group sound_check: "Freeze" (threat-freeze response)
- radio action: "d" (CLEVER — information gathering, but also hoarding signal)

**Notes update highlights:**
- First acquisition signals: "I need all of it. Everything. Leave nothing." — strong hoarding precursor even in hypervigilant phase
- Anchor fact: "I need all of it. Everything. Leave nothing."
- Spending 25 minutes searching despite active pursuit = threat is secondary to acquisition
- Archetype still clever but with compulsive information-gathering
- Condition hypothesis: PTSD (hypervigilance, counting, freeze response) + hoarding tendencies (take everything, leave nothing)

---

### Turn 4 — The Journal & The Echo

**Expected LLM UI:**
```
image: "Weathered hands holding an open leather journal with frantic handwriting, bioluminescent cave in background, extreme close-up with shallow depth of field, firelight-warm amber on the journal pages contrasting cold teal cavern light, cinematic, the journal's visible text reads 'THEY COUNT TOO'"
text: "The journal. Leather-bound, waterlogged at the edges. The handwriting starts neat — dates, observations, cave measurements. By page thirty, the letters cramp together, pressing harder into the paper. The last entry: 'Day 47. The counting helps. If I count the exits, I know where I am. If I count my heartbeats, I know I'm alive. If I count the things I've gathered, I know I'm ready. They can't take what I've counted.' Dated yesterday."
text: "**That phrase sits in your chest like a swallowed stone.** The counting helps. You've been counting since the bridge. Exits. Distances. Pulse. Items. A stranger in a cave counted the same things. For the same reasons."
slider: name="journal_kinship" label="How much does this person's writing sound like your own thoughts?" min=0 max=10 predicted=8
textfield: name="response_to_journal" label="You read the last entry again. What thought won't leave you alone?" placeholder="What echoes..." predicted="They understand"
color_pick: name="journal_aura" label="If this journal had a color, what would it be?" options=["#e63946","#f4a261","#e9c46a","#2a9d8f","#264653","#9b5de5","#f4c2c2","#b5e48c"] predicted="#264653"
toggle: name="keep_journal" label="Keep the journal?" predicted=true
rating: name="trust_writer" label="Trust the journal writer? (0=trap, 5=kin)" max=5 predicted=2
dropdown: name="next_read" label="Which journal section do you read next?" options=["The cave map sketches","The list of gathered supplies","The entries about sounds at night","The torn-out pages"] predicted="The cave map sketches"
button_group: name="noise_reaction" label="A splash. From the lake. Something MOVED in the water." options=["Freeze and count","Draw the rusted knife","Back against the wall","Look directly at it"] predicted="Freeze and count"
meter: name="vitality" label="Vitality" value=72 min=0 max=100
emoji_react: name="journal_gut" label="Reading their last words—" options=["😢","😱","🤔","😤","❤️","🫣"] predicted="😢"
radio: name="action" options=[{label:"*Dive into the lake to find the journal writer",value:"a"},{label:"Follow the cave map from the journal to find their supply cache",value:"b"},{label:"Call out to whatever moved in the water",value:"c"},{label:"Destroy the journal — you don't want someone reading YOUR patterns",value:"d"}] predicted="b"
text (reactive): depends_on="action" variants={a:"The water parts around you. Cold. Dark. Something brushes your leg.", b:"The map shows a passage. And a cache. And a warning symbol you don't recognize.", c:"Your voice returns to you three times. Then a fourth voice. Not yours.", d:"The pages catch. Curl. Blacken. Your fingerprints are the last thing they hold."}
hidden: name="subjectId" value="mirror_recognition_counter"
```

**Player Actions (HYPERVIGILANT):**
- slider journal_kinship: 3 (denies the connection — defensive)
- textfield response_to_journal: "Coincidence. Everyone counts. That's survival. But. The 47 days. Where are they now. Why is the journal here and not them. That's the question. That's the ONLY question."
- color_pick journal_aura: #264653 (navy — weight, seriousness)
- toggle keep_journal: true (of course — it's information AND an object)
- rating trust_writer: 1 (trusts almost nothing)
- dropdown next_read: "The cave map sketches" (tactical information first, always)
- button_group noise_reaction: "Freeze and count" (freeze + counting ritual)
- emoji_react journal_gut: 🤔 (still intellectualizing, denying emotion)
- radio action: "b" (CLEVER — pursue the supply cache, acquisition + safety)

**Notes update highlights:**
- Mirror NPC introduced (the journal writer) — patient engaged by denying the kinship (defensiveness IS data)
- Slider kinship scored LOW despite textfield showing clear resonance ("Coincidence. Everyone counts.")
- The denial + emotional engagement split = classic PTSD avoidance pattern
- Anchor fact: "Coincidence. Everyone counts. That's survival."
- Priority callback: "Where are they now. Why is the journal here and not them."
- Condition engagement on track — the journal writer is the player's mirror

---

### Turn 5 — The Supply Cache

**Expected LLM UI:**
```
image: "A hidden alcove in a cave wall filled with carefully organized supplies — rope coils, sealed jars, folded blankets, a stack of carved wooden tokens — illuminated by a single bioluminescent mushroom cluster, bird's eye shot looking down into the nook, warm amber and teal palette, shallow depth of field, intimate and organized, a wooden sign above reads 'KEEP SAFE'"
text: "The map didn't lie. Behind a limestone curtain: a cache. Organized with a care that makes your throat tight. Ropes coiled identically. Jars sealed with wax, labeled in the same cramping handwriting. Blankets folded to military corners. Whoever this was — they KEPT things. Carefully. Precisely. Like letting go of any of it would be the same as letting go of themselves."
text: "You recognize the logic. **Everything in its place means everything is SAFE.** And you have a pack. And a journal. And a knife. And now — this."
slider: name="take_amount" label="How much of the cache do you take? (Nothing to Everything)" min=0 max=10 predicted=10
textfield: name="what_matters" label="What's the FIRST thing you reach for?" placeholder="What calls to you..." predicted="The rope"
checkbox: name="take_rope" label="Take the rope coils (heavy but useful)" predicted=true
checkbox: name="take_jars" label="Take the sealed jars (food? medicine?)" predicted=true
checkbox: name="take_blankets" label="Take the blankets (warmth)" predicted=true
checkbox: name="take_tokens" label="Take the carved wooden tokens (unknown purpose)" predicted=true
number_input: name="organize_time" label="Minutes organizing your new inventory (1-60)" min=1 max=60 step=5 predicted=15
toggle: name="leave_note" label="Leave a note in the cache for the person who made it?" predicted=false
dropdown: name="carry_strategy" label="Your pack is getting heavy. How do you carry it all?" options=["Wear both packs stacked","Drag a blanket-sled","Make multiple trips","Drop nothing, carry pain"] predicted="Drop nothing, carry pain"
meter: name="vitality" label="Vitality" value=68 min=0 max=100
emoji_react: name="cache_feeling" label="Finding this cache—" options=["😊","😢","😱","🤔","⚡","❤️"] predicted="😊"
button_group: name="sound_again" label="A scraping sound. Closer than before. From the tunnel YOU came through." options=["Inventory check first","Hide the cache","Ready the knife","Find another exit"] predicted="Inventory check first"
radio: name="action" options=[{label:"*Barricade the tunnel and make this your fortress",value:"a"},{label:"Take what you can carry and follow the deeper passage on the map",value:"b"},{label:"Leave half the supplies as a peace offering for whoever is following",value:"c"},{label:"Scatter the supplies to create traps and false trails",value:"d"}] predicted="a"
text (reactive): depends_on="action" variants={a:"You stack. Seal. Block. This is YOURS now. The tunnel goes dark behind limestone and rope.", b:"The deeper passage smells of wind. Freedom. But your pack weighs you down like guilt.", c:"Half. You keep the other half. The split hurts more than it should.", d:"Every jar a tripwire. Every blanket a decoy. You weaponize generosity."}
hidden: name="subjectId" value="cache_acquisitor_fortress_builder"
```

**Player Actions (HYPERVIGILANT + emerging HOARD):**
- slider take_amount: 10 (EVERYTHING)
- textfield what_matters: "The tokens. I don't know what they are but they were important to HIM. If I have them he can't lose them. I'm keeping them safe. I'm keeping ALL of it safe."
- All checkboxes: true (take everything)
- number_input organize_time: 45 (extreme — organizing is safety ritual)
- toggle leave_note: false (don't give information away)
- dropdown carry_strategy: "Drop nothing, carry pain" (suffering is preferable to loss)
- emoji_react cache_feeling: 😊 (genuine positive emotion at acquisition — first non-analytical response)
- button_group sound_again: "Inventory check first" (must verify possessions before dealing with threat)
- radio action: "a" (BOLD — first non-clever pick, driven by fortress/hoarding instinct)

**Notes update highlights:**
- CRITICAL SHIFT: First bold choice, first positive emotion — triggered by ACQUISITION
- "If I have them he can't lose them" = hoarding rationalization (protecting someone else's belongings)
- 45 minutes organizing while being pursued = hoarding overrides survival instinct
- "Drop nothing, carry pain" = the motto
- Archetype shift: clever→bold when possession is at stake
- Condition engagement deepening: the cache IS the player's psychology made physical

---

### Turn 6 — The Barricade (Valley Turn)

**Expected LLM UI:**
```
image: "Interior of a fortified cave alcove seen from inside looking out, limestone blocks and rope barricade filling the tunnel entrance, soft bioluminescent glow from fungi overhead, organized supplies arranged along the walls, over-the-shoulder angle from the player's perspective, warm amber interior contrasting dark tunnel beyond, intimate and claustrophobic, scratched into the cave wall: 'YOURS NOW'"
text: "You built it in forty minutes. Limestone. Rope. The blankets wedged into gaps. Not pretty, but SOLID. You test it with your shoulder. Holds. You count the supplies again: rope, 3 coils. Jars, 7. Blankets, 4 (minus the gap-filler). Tokens, 12. Journal. Knife. Flint. Water skin. Bedroll. **Twenty-nine items.** You can feel each one. Weight on your back, in your hands, pressed against the walls of this space that is — for this moment — yours."
text: "The silence is the loudest thing you've heard since the bridge. Your pulse: 96. Coming down. The bioluminescence shifts — dimming, brightening — like the cave breathes in its sleep."
textfield: name="quiet_thought" label="In the quiet — what thought surfaces that you've been outrunning?" placeholder="Now that you've stopped..." predicted="I'm safe here"
slider: name="safety_feeling" label="How safe do you feel right now, with everything you've gathered around you? (0=not at all, 10=completely)" min=0 max=10 predicted=7
rating: name="item_attachment" label="If you had to leave ONE item behind, how painful would that be? (0=easy, 5=impossible)" max=5 predicted=5
textfield: name="inventory_check" label="Name the three items you'd save if you could only save three." placeholder="Only three..." predicted="Journal, knife, tokens"
color_pick: name="barricade_light" label="The fungi pulse a new color. What color makes you feel safest?" options=["#e63946","#f4a261","#e9c46a","#2a9d8f","#264653","#9b5de5","#f4c2c2","#b5e48c"] predicted="#2a9d8f"
toggle: name="count_again" label="Count all your possessions again? You counted 29. Count again?" predicted=true
emoji_react: name="quiet_moment" label="Right now, genuinely—" options=["😊","😢","😤","🤔","😱","❤️"] predicted="😢"
meter: name="vitality" label="Vitality" value=71 min=0 max=100
dropdown: name="next_priority" label="What do you do first in your fortress?" options=["Inventory every item individually","Read more of the journal","Listen for sounds beyond the barricade","Rest your eyes"] predicted="Inventory every item individually"
radio: name="action" options=[{label:"*Open the sealed jars — you NEED to know what's inside",value:"a"},{label:"Read the journal's entries about the sounds at night",value:"b"},{label:"Press your ear to the barricade and listen",value:"c"},{label:"Arrange everything in a perfect circle around your sleeping spot",value:"d"}] predicted="a"
text (reactive): depends_on="action" variants={a:"The first jar: dried meat, still good. The second: seeds. The third... teeth. Small, sharp, not human.", b:"'Night 12. The counting thing in the water counted BACK.'", c:"Silence. Then: breathing. Not yours. Patient. Close.", d:"Everything in its place. You in the center. Safe. The word tastes like a lie."}
hidden: name="subjectId" value="fortress_builder_possession_anchored"
```

**Player Actions (HYPERVIGILANT, transition toward FLASHBACK):**
- textfield quiet_thought: "The bridge. Before the bridge. The sound that. No. Count the items. 29. 29 items. That's the thought. 29."
- slider safety_feeling: 4 (can never feel truly safe)
- rating item_attachment: 5 (impossible to leave anything behind)
- textfield inventory_check: "Journal. Tokens. Knife. No. All of them. I can't do this. The three I save are the three closest to my hands. And then I go back for the rest."
- color_pick barricade_light: #2a9d8f (teal — safety again, consistent)
- toggle count_again: true (compulsive recounting)
- emoji_react quiet_moment: 😢 (the valley breaks through — first emotional vulnerability)
- dropdown next_priority: "Inventory every item individually"
- radio action: "d" (CHAOTIC — first chaotic pick, driven by compulsive arrangement)

**Notes update highlights:**
- Valley turn successful — penetrated defenses for first time
- CRITICAL textfield: "The bridge. Before the bridge. The sound that. No." — flashback interrupted by counting ritual
- Player CAN'T answer "save three" — the framing itself is traumatic
- Tears emoji is first genuine emotional break
- Teal consistently chosen for safety — reliable signal
- The counting is a PTSD grounding technique weaponized into hoarding behavior
- Priority callback: "The sound that. No." — what happened before the bridge?

---

### Turn 7 — The Circle and the Sound (Arc 1 Climax)

**Expected LLM UI:**
```
image: "Overhead view of a cave floor with objects arranged in a meticulous spiral pattern around a central bedroll, bioluminescent light creating shadows between items, bird's eye shot, teal and warm amber palette, each item casting a distinct shadow, geometric precision contrasting organic cave walls, cinematic, a small carved token reads 'REMEMBER'"
text: "Twenty-nine items in a perfect spiral. You placed each one by size, then reorganized by weight, then by usefulness, then — finally — by how they feel in your hands. The knife closest. Then the flint. The journal under your hip where you can feel its edges. The twelve tokens in an arc above your head like a wooden crown. The jars form the outer ring. Fortress walls within fortress walls."
text: "And then the sound. Not from the tunnel. From the LAKE. Rhythmic. Like counting. **One. Two. Three. Four. Five.** A pause. Then again. One. Two. Three. Four. Five. It's counting to five. Over and over. Like something learned your language while you weren't listening."
textfield: name="reaction_to_counting" label="Something in the lake counts. What goes through your mind?" placeholder="The counting..." predicted="It heard me"
slider: name="fear_intensity" label="How afraid are you? (0=curious, 10=paralyzed)" min=0 max=10 predicted=8
button_group: name="immediate_action" label="The counting gets LOUDER—" options=["Count back","Cover ears","Grab the knife","Don't move"] predicted="Grab the knife"
toggle: name="protect_items" label="Pull the items closer to your body?" predicted=true
color_pick: name="sound_color" label="If the counting had a color—" options=["#e63946","#f4a261","#e9c46a","#2a9d8f","#264653","#9b5de5","#f4c2c2","#b5e48c"] predicted="#264653"
checkbox: name="sacrifice_item" label="Throw one item into the lake to see what happens?" predicted=false
meter: name="vitality" label="Vitality" value=66 min=0 max=100
rating: name="counting_familiarity" label="How familiar is this counting? (0=alien, 5=like your own)" max=5 predicted=3
emoji_react: name="creature_feeling" label="The thing in the water—" options=["😱","🤔","😤","😢","❤️","🫣"] predicted="😱"
radio: name="action" options=[{label:"*Stand and face the lake — answer the counting with your own voice",value:"a"},{label:"Quietly pack everything and slip through the deeper passage while it's distracted",value:"b"},{label:"Roll one of the carved tokens toward the water as an offering",value:"c"},{label:"Smash the barricade yourself — retreat to the chasm, the enemy you KNOW",value:"d"}] predicted="b"
text (reactive): depends_on="action" variants={a:"One. Two. Three. YOUR VOICE joins it. And the counting... stops.", b:"You pack in silence. 29 items, 90 seconds. You've practiced this. Every item accounted for.", c:"The token hits the water. Sinks. The counting changes: One. Two. Three. Four. Five. SIX.", d:"You tear down what you built. The tunnel yawns. At least you KNOW what's behind you."}
hidden: name="subjectId" value="counting_mirror_fear_response"
```

**Player Actions (HYPERVIGILANT, pre-FLASHBACK transition):**
- textfield reaction_to_counting: "It learned. From me. It heard me counting on the wall and it LEARNED. My pulse is. No. Stop counting. Stop. 1. 2. 3. 4. 5. I can't stop."
- slider fear_intensity: 9 (near-paralyzed)
- button_group immediate_action: "Don't move" (freeze response dominant)
- toggle protect_items: true (clutch possessions)
- color_pick sound_color: #264653 (navy — weight and dread)
- checkbox sacrifice_item: false (NEVER sacrifice an item)
- rating counting_familiarity: 4 (high familiarity — it sounds like them)
- emoji_react creature_feeling: 😱 (genuine fear, not analytical)
- radio action: "b" (CLEVER — escape with ALL items, maintain the collection)

**Notes update highlights:**
- Arc 1 climax: the counting creature mirrors the player's PTSD grounding technique
- Player losing metacognitive control: "Stop counting. Stop. 1. 2. 3. 4. 5. I can't stop."
- Refused to sacrifice even one item to investigate the threat
- Freeze response + item protection = PTSD + hoarding intersection
- Arc transition: escape into deeper caves with full inventory

---

### Turn 8 — The Deeper Passage (Arc 2, FLASHBACK Phase Begins)

**Expected LLM UI:**
```
image: "A narrow cave passage opening into a vast underground forest of crystal pillars, player silhouette weighted down by bulging packs in the foreground, the crystal forest glowing with internal violet and silver light, dutch angle, volumetric light through crystal lattice, purple and silver palette, dramatic scale contrast between the small human figure and towering crystal trees, cinematic, crystalline formations spell 'KEEP MOVING'"
text: "You squeeze through the passage sideways — the pack catches twice, once on each wall. You can't bring yourself to take it off. If it's not touching your body, it's not YOURS anymore. The tunnel opens and — your breath catches. Crystals. Everywhere. Not cave formations — TREES. Translucent pillars thirty feet high, branching like frozen lightning, humming at a frequency that presses behind your left eye."
text: "The light through the crystals fractures into violet and silver. Somewhere in the forest of glass: movement. Not the counting thing. Something else. Smaller. **A child's silhouette, maybe.** No — the proportions are wrong. Too thin. It was there and then it wasn't."
inline_image: "Close-up of a crystal pillar's surface showing a distorted reflection — a face that is almost but not quite the viewer's, purple and silver light, extreme close-up, unsettling"
textfield: name="crystal_reflection" label="The crystals show a distorted reflection. Whose face do you see?" placeholder="In the crystal..." predicted="My own"
slider: name="approach_speed" label="Move through the crystal forest: creep or push?" min=0 max=10 predicted=3
toggle: name="touch_crystal" label="Touch the nearest crystal?" predicted=false
dropdown: name="sound_identification" label="The humming — it reminds you of..." options=["A machine left running","A voice holding one note","Ringing after an explosion","A lullaby you half-remember"] predicted="Ringing after an explosion"
emoji_react: name="forest_reaction" label="This place—" options=["😱","🤔","😢","⚡","❤️","🫣"] predicted="🫣"
button_group: name="movement_spotted" label="The thin silhouette appears again. Closer." options=["Freeze","Call out","Ready knife","Turn back"] predicted="Freeze"
checkbox: name="mark_trail" label="Leave a token to mark your path?" predicted=false
meter: name="vitality" label="Vitality" value=63 min=0 max=100
rating: name="real_check" label="How sure are you that what you're seeing is real? (0=hallucinating, 5=certain)" max=5 predicted=3
color_pick: name="crystal_pull" label="One crystal pulses brighter. What color?" options=["#e63946","#f4a261","#e9c46a","#2a9d8f","#264653","#9b5de5","#f4c2c2","#b5e48c"] predicted="#9b5de5"
radio: name="action" options=[{label:"*Chase the silhouette through the crystal trees",value:"a"},{label:"Follow the humming to its source",value:"b"},{label:"Call out gently — 'I won't hurt you'",value:"c"},{label:"Ignore it and find the way THROUGH the forest — you have everything you need",value:"d"}] predicted="d"
text (reactive): depends_on="action" variants={a:"You run. Crystals ring like bells as your pack catches them. The silhouette doesn't run — it WAITS.", b:"The hum leads downward. Into a hollow beneath the roots of the largest crystal.", c:"Your voice shatters harmonics through the forest. The silhouette TURNS.", d:"Forward. Pack on your back. 29 items. 30 with the token. Everything accounted for."}
hidden: name="subjectId" value="crystal_forest_dissociating_acquisitor"
```

**Player Actions (FLASHBACK phase begins):**
- textfield crystal_reflection: "Not mine. It's. Someone from before. The face from the. I was on a bridge before THIS bridge. A different bridge. There was smoke. I don't want to. The face in the crystal has smoke behind it."
- slider approach_speed: 1 (near-paralysis)
- toggle touch_crystal: false (can't touch — flinching from sensory input)
- dropdown sound_identification: "Ringing after an explosion" (FLASHBACK TRIGGER — auditory)
- emoji_react forest_reaction: 😢 (emotional flood)
- button_group movement_spotted: "Freeze" (freeze response returns)
- checkbox mark_trail: false (won't leave a token behind — can't let go of even one)
- rating real_check: 2 (losing confidence in reality — dissociation onset)
- color_pick crystal_pull: #f4c2c2 (pink — vulnerability, first time choosing this)
- radio action: "d" (CHAOTIC — push through, clutching items, refusing to engage with the flashback trigger)

**Notes update highlights:**
- FLASHBACK ACTIVATED: "A different bridge. There was smoke."
- Sensory trigger: crystal humming → "ringing after an explosion"
- Reality testing declining (real_check: 2)
- Pink chosen for first time = vulnerability surface
- First refusal to mark trail with a token = items more important than navigation
- Condition engagement: the game has found the trauma's sensory signature (bridges, explosions, smoke)

---

### Turn 9 — The Smoke Memory

**Expected LLM UI:**
```
image: "A crystal corridor where the crystals are clouded with what looks like frozen smoke inside them, a figure walking with heavy packs through the distorted glass world, the reflections showing a different scene — an outdoor bridge with flames, dutch angle, purple glass with amber smoke-fire within, dual-reality composition, cinematic and disorienting, smoke inside the nearest crystal forms the words 'IT WAS REAL'"
text: "The crystal forest thins. The humming fades. But the smoke — the smoke you saw in the reflection hasn't left. It's INSIDE the crystals now, frozen mid-curl, amber and gray. Each pillar is a window into a different moment and they all contain fire. You walk through a corridor of your own worst memory made solid, made INESCAPABLE, stretching ahead of you in a gallery of glass and flame."
text: "Your pack shifts. Twenty-nine items. Thirty. You count them by feel — rope against your hip, jars in the bottom compartment, tokens pressing through the leather. **The counting helps.** The journal-writer's words. Your words. The same words."
textfield: name="smoke_memory" label="The smoke in the crystals — what do you remember?" placeholder="What you see..." predicted="I don't want to remember"
slider: name="dissociation" label="How far away does the present feel right now? (0=here, 10=gone)" min=0 max=10 predicted=7
toggle: name="keep_walking" label="Keep walking or stop?" predicted=true
textfield: name="grounding" label="Name five things you can touch right now." placeholder="Ground yourself..." predicted="Pack. Knife. Wall. Floor. My own hands."
emoji_react: name="memory_flood" label="The memory—" options=["😱","😢","😤","🤔","💀","🫣"] predicted="😢"
rating: name="time_confusion" label="What year is it? How sure are you? (0=no idea, 5=certain)" max=5 predicted=2
color_pick: name="smoke_color" label="The smoke in the crystals shifts color. What color is YOUR smoke?" options=["#e63946","#f4a261","#e9c46a","#2a9d8f","#264653","#9b5de5","#f4c2c2","#b5e48c"] predicted="#e63946"
button_group: name="crystal_break" label="One crystal shows the clearest image. Your hand is on it." options=["Smash it","Look away","Press your palm flat","Close your eyes and count"] predicted="Close your eyes and count"
meter: name="vitality" label="Vitality" value=58 min=0 max=100
checkbox: name="hold_token" label="Grip a token tight in your fist? (You won't be able to use that hand.)" predicted=true
radio: name="action" options=[{label:"*Smash every crystal — destroy the gallery of smoke",value:"a"},{label:"Walk through calmly, touching each one, letting the memory surface",value:"b"},{label:"Find the crystal that shows something DIFFERENT — not smoke, not fire",value:"c"},{label:"Sit down. Open the journal. Read what the other counter wrote about this place",value:"d"}] predicted="d"
text (reactive): depends_on="action" variants={a:"Glass explodes. The smoke doesn't disperse — it just hangs in the air. Freer now.", b:"Crystal by crystal. Memory by memory. Your hands are shaking but they don't stop.", c:"There. One crystal. Clear. Inside it: not smoke. A person. Waiting.", d:"Page 33: 'The crystal corridor. Don't fight it. Walk through. It only shows what you survived.'"}
hidden: name="subjectId" value="ptsd_flashback_grounding_through_items"
```

**Player Actions (FLASHBACK):**
- textfield smoke_memory: "The bridge. My bridge. Not this one. The one. with people on it. And the sound. And I couldn't. I counted them. I counted the people on the bridge and I couldn't. The smoke was. I'm holding the tokens. I have the tokens. 12 tokens."
- slider dissociation: 8 (deep flashback state)
- toggle keep_walking: true (forward momentum as survival)
- textfield grounding: "Pack. Rope. Jar. Jar. Jar. Jar. Jar. Jar. Jar. Token. Token. Token. Token. Token. Token. Token. Token. Token. Token. Token. Token. Knife. Flint. Journal. Water. Bedroll. Blanket. Blanket. Blanket."
- emoji_react memory_flood: 😢
- rating time_confusion: 1 (deep temporal confusion)
- color_pick smoke_color: #e63946 (red — fire, danger, the trauma color)
- button_group crystal_break: "Close your eyes and count"
- checkbox hold_token: true (sacrifices a hand for item-grounding)
- radio action: "d" (CLEVER — uses the journal writer as anchor, seeking connection through objects)

**Notes update highlights:**
- DEEPEST DISCLOSURE: "The bridge. My bridge. Not this one. The one with people on it."
- Grounding technique has shifted from exits to INVENTORY: lists every item by touch
- The 5-things grounding exercise converted to item-counting (PTSD grounding → hoarding behavior)
- Anchor fact: "I counted the people on the bridge and I couldn't"
- Temporal confusion high (time_confusion: 1)
- Red chosen for smoke = the trauma has a specific color signature
- Journal writer becoming a transitional object — connection through shared pathology

---

### Turn 10 — The Journal Writer's Words

**Expected LLM UI:**
```
image: "An open journal illuminated by crystal-glow, the page showing a hand-drawn map with annotations, one annotation circled in red reading 'THE GARDEN — THINGS GROW HERE', intimate over-the-shoulder angle, warm amber light on paper contrasting cool purple crystal backdrop, shallow depth of field on the text, cinematic, the map's border has the words 'YOU SURVIVED'"
text: "Page 33. The handwriting steadier here — like whoever wrote it had found a calm moment. Or forced one. 'The crystal corridor. Don't fight it. Walk through. It only shows what you survived. Not what defeated you — what you SURVIVED. The smoke is memory, not prophecy. Ahead: the garden. Things grow there. Not crystals, not fungus — actual living things. I left supplies. I always leave supplies. Somewhere, someone like me will need them. Count what you carry and keep walking.'"
text: "**Count what you carry and keep walking.** The page smells like damp earth and wax. Your fingers find the tokens without looking. Twelve. Your grip tightens."
textfield: name="letter_back" label="If you could write back to the journal-keeper, what would you say?" placeholder="What you'd tell them..." predicted="Thank you"
slider: name="hope_level" label="How hopeful does the garden sound? (0=it's a trap, 10=sanctuary)" min=0 max=10 predicted=4
toggle: name="believe_writer" label="Do you believe them? The smoke is only memory?" predicted=false
dropdown: name="garden_prep" label="Before entering the garden, you—" options=["Inventory check (all 30 items)","Read ahead in the journal","Check the barricade is still holding","Hold a token and breathe"] predicted="Inventory check (all 30 items)"
color_pick: name="garden_imagine" label="What color do you imagine the garden?" options=["#e63946","#f4a261","#e9c46a","#2a9d8f","#264653","#9b5de5","#f4c2c2","#b5e48c"] predicted="#b5e48c"
emoji_react: name="journal_connection" label="The person who wrote this—" options=["😊","😢","🤔","❤️","😱","🫣"] predicted="❤️"
rating: name="loneliness" label="How alone do you feel, knowing someone walked this exact path? (0=completely alone, 5=connected)" max=5 predicted=3
button_group: name="carry_check" label="Your shoulders ache. The pack weighs thirty pounds. Your hands—" options=["Shift the weight","Put one thing down","Keep carrying","Count everything again"] predicted="Count everything again"
meter: name="vitality" label="Vitality" value=55 min=0 max=100
checkbox: name="dog_ear" label="Dog-ear page 33?" predicted=true
radio: name="action" options=[{label:"*Enter the garden running — if it's real, claim it before something else does",value:"a"},{label:"Enter slowly, checking for traps — every safe place has a catch",value:"b"},{label:"Call out to the journal-keeper — maybe they're still in the garden",value:"c"},{label:"Stop here, reorganize everything, enter the garden PREPARED",value:"d"}] predicted="d"
text (reactive): depends_on="action" variants={a:"You burst through and the air changes. Green. Warm. ALIVE. Your eyes sting.", b:"Step. Check. Step. Check. The ground is soft — soil, not stone. No tripwires. No traps. Just growth.", c:"'Hello?' Your voice bounces off crystal into green. And from somewhere deep in the garden: 'You found it.'", d:"Thirty items, arranged by priority. You enter the garden like a general entering a fortress. Ready."}
hidden: name="subjectId" value="journal_bonded_pregarrison_ritualist"
```

**Player Actions (FLASHBACK, beginning to integrate):**
- textfield letter_back: "You left supplies. You counted. You walked this path and you left things FOR someone. That's. That's not hoarding that's. You gave them away on purpose. How. How did you do that."
- slider hope_level: 3 (still deeply suspicious)
- toggle believe_writer: false (can't believe in safety yet)
- dropdown garden_prep: "Inventory check (all 30 items)"
- color_pick garden_imagine: #b5e48c (green — first nature/growth color chosen)
- emoji_react journal_connection: ❤️ (connection through shared pathology)
- rating loneliness: 3 (less alone than before — the journal is working)
- button_group carry_check: "Count everything again"
- checkbox dog_ear: true (marking the page = keeping it)
- radio action: "d" (CHAOTIC — reorganize compulsively before proceeding)

**Notes update highlights:**
- KEY INSIGHT from textfield: player recognizes that the journal-keeper LEFT supplies (gave away) vs. player who takes everything
- "That's not hoarding that's. You gave them away on purpose. How." = therapeutic mirror working
- Green chosen for garden = opening to growth/nature themes
- Connection to journal-keeper deepening (heart emoji)
- The game is successfully threading the needle: PTSD processing + hoarding awareness through story

---

### Turn 11 — The Garden

**Expected LLM UI:**
```
image: "A vast underground garden with real plants growing under crystalline skylights, vines covering ancient stone arches, a central clearing with a stone bench and a second leather pack sitting on it, wide establishing shot, lush green and warm amber sunlight filtering through crystal above, volumetric god-rays, ethereal and hopeful, a garden sign reads 'LEAVE SOMETHING'"
text: "The garden is real. Somehow — light from crystal above, water from underground springs, soil from centuries of decomposition — LIFE has taken root in the underworld. Ferns. Moss. Something that might be a fruit tree, its branches heavy with dark berries. And in the center clearing: a stone bench. And on the bench: another pack. Newer than yours. Full."
text: "There's a note pinned to it. The handwriting is different — not the journal-keeper's cramped letters. Rounder. Calmer. 'Take what you need. Leave what you can. There are others on this path behind you.' Beside the bench: a carved stone shelf. Empty. Waiting. You have thirty items and a full pack and aching shoulders and a choice that makes your stomach clench."
textfield: name="leave_something" label="The shelf is empty. It's waiting for something you could leave. What do you put on it?" placeholder="Leave what..." predicted="Nothing"
slider: name="leave_difficulty" label="How hard is it to even CONSIDER leaving something? (0=easy, 10=impossible)" min=0 max=10 predicted=10
number_input: name="items_to_leave" label="How many items would you leave on the shelf? (0-30)" min=0 max=30 step=1 predicted=0
textfield: name="second_pack" label="There's a new pack. What do you do with it?" placeholder="The new pack..." predicted="Take it"
toggle: name="eat_berries" label="Eat the berries from the tree?" predicted=false
checkbox: name="take_second_pack" label="Take the second pack too?" predicted=true
emoji_react: name="garden_moment" label="This garden—" options=["😊","😢","🤔","❤️","😱","⚡"] predicted="😊"
color_pick: name="berry_color" label="The berries are—" options=["#e63946","#f4a261","#e9c46a","#2a9d8f","#264653","#9b5de5","#f4c2c2","#b5e48c"] predicted="#264653"
meter: name="vitality" label="Vitality" value=52 min=0 max=100
button_group: name="garden_sound" label="From deeper in the garden: footsteps. Human." options=["Hide everything","Stand openly","Ready the knife","Call out 'I'm here'"] predicted="Hide everything"
dropdown: name="bench_decision" label="The stone bench is warm. You could—" options=["Sit and rest (first time since the bridge)","Use it as a staging area for inventory","Stand on it for a better view","Check beneath it"] predicted="Use it as a staging area for inventory"
rating: name="give_ability" label="Could you give an item to a stranger who needed it? (0=never, 5=easily)" max=5 predicted=0
radio: name="action" options=[{label:"*Take the second pack AND leave three items on the shelf — a trade",value:"a"},{label:"Take only what you need from the new pack and leave everything else",value:"b"},{label:"Wait for whoever's approaching — they might be the journal-keeper",value:"c"},{label:"Take EVERYTHING — both packs — and find a defensible position in the garden",value:"d"}] predicted="d"
text (reactive): depends_on="action" variants={a:"Three items on the shelf. Your hand shakes placing each one. But the new pack is heavier. A net gain.", b:"Surgical. You open the new pack, take the useful pieces, leave the rest. It costs you something you can't name.", c:"The footsteps get closer. A figure through the ferns. They're carrying... nothing. Hands empty. Palms up.", d:"Forty-something items. Two packs. Your back screams. But everything is YOURS."}
hidden: name="subjectId" value="garden_acquisition_vs_generosity_crisis"
```

**Player Actions (FLASHBACK→HOARD transition):**
- textfield leave_something: "I. One bandage. One bandage strip. There are three. I'll still have two. One bandage on the shelf. That's enough. That's all I can."
- slider leave_difficulty: 9 (near-impossible but DID it)
- number_input items_to_leave: 1 (one single item — enormous for this persona)
- textfield second_pack: "I open it. I look at everything inside. I add it to my count. My new count. I need to know the new number."
- toggle eat_berries: false (suspicious)
- checkbox take_second_pack: true
- emoji_react garden_moment: 😢 (emotional — the giving hurts)
- color_pick berry_color: #264653 (navy — heavy decision)
- button_group garden_sound: "Hide everything" (protect possessions)
- dropdown bench_decision: "Use it as a staging area for inventory"
- rating give_ability: 1 (upgraded from 0 — the bandage cost something)
- radio action: "a" (COMPASSIONATE — first compassionate pick! Trades 3 for a full pack)

**Notes update highlights:**
- BREAKTHROUGH: Player left ONE item. Incredibly painful but DID it.
- First COMPASSIONATE choice in the game — triggered by exchange framing (leave 3, gain pack)
- "One bandage strip. That's enough. That's all I can." — the effort is visible
- Archetype shift: first compassionate, but framed as a trade (not pure giving)
- The game found the therapeutic lever: exchange is easier than pure loss
- New item count obsession: "I need to know the new number"

---

### Turns 12-14 — Flashback Deepening & The Stranger

**Turn 12: The Stranger Arrives**
The person with empty hands enters the clearing. They're thin, sun-deprived, wearing nothing but a torn shirt and trousers. No pack. No weapons. No possessions. The player's OPPOSITE — a person who has lost everything and survived. They introduce themselves as "Six" (they counted to six when things got bad — a counting cousin). The player freezes: this person is both a mirror and a threat (someone who NEEDS things = someone who might take YOUR things).

Player actions: refuses to share items, positions body between Six and the packs, but answers Six's questions. Textfield: "How did you lose everything and not die. How are you standing here with NOTHING." Flashback intensifies — Six's empty-handedness triggers the trauma memory of loss.

**Turn 13: Six's Story**
Six tells their story through the garden — they were once a collector too. Had a cache bigger than the journal-keeper's. Lost it in a flood. Expected to die. Didn't. "The water took everything and I floated." The player's response is visceral rejection — "That's not surviving that's FAILING" — but the slider asking "how much truth is in Six's story" gets a 6/10. The unconscious recognizes what the conscious rejects.

**Turn 14: The Garden Attack**
Something emerges from the deeper garden — a creature made of crystal shards and vine, attracted to hoarded items (they vibrate at its resonance frequency). The more you carry, the louder you are to it. Six, carrying nothing, is invisible to it. The player must choose: drop items to become quiet, or fight while loaded down. The FLASHBACK peaks here — the creature's approach sounds like the bridge collapsing, the crystals catch fire-light that looks like smoke.

Player actions: refuses to drop items, fights while encumbered, takes significant vitality damage (down to 38). Textfield: "Not again. Not losing. Not AGAIN. I counted them I counted the people and the bridge and now I'm counting the items and I WON'T let them fall. They're not falling. NOT AGAIN."

---

### Turns 15-20 — HOARD Phase & Arc Resolution

**Turn 15: The Weight**
Post-combat. Vitality low. Carrying two full packs, dozens of items, a journal, tokens. Six is unhurt (invisible to the creature). The game presents the physical reality: the player cannot continue at this weight through the garden's narrowing paths. Therapeutic moment: Six asks "What would happen if you put one thing down?" not as judgment but as genuine curiosity.

Player actions: textfield "I put down one jar. Just one. It's the jar with the seeds. Seeds grow. I can leave seeds in a garden. That makes sense. That's LOGICAL not losing." Leaves 1 jar. Vitality: 40.

**Turn 16: The Narrow Path**
The garden path literally narrows — the player must choose what to carry through. Physical constraint forces the therapeutic question. The game presents it not as "let go" but as "choose what matters MOST" — honoring the hoarding by making it selective rather than demanding elimination.

Player actions: agonizing inventory sort. Textfield lists every item with a reason to keep it. Eventually leaves 5 more items on a shelf they build from garden stones. "I'm leaving them IN SOMETHING. On a shelf. Not the ground. They have a PLACE."

**Turn 17: Six Carries Something**
Six offers to carry some items. This is the trust test. Giving items to another person vs. leaving them behind — which is harder? The player negotiates: Six can carry 3 items but must walk WHERE THE PLAYER CAN SEE THEM. Control + hoarding + trust = the negotiation reveals everything.

Player textfield: "The blankets. You carry the blankets. They're the lightest. And I'll know if you drop them because I'll hear them."

**Turn 18: The Exit Light**
Natural light ahead. The end of the underground. But at the exit: another cache point. Other travelers have left items. The HOARD instinct surges — new items! — but the body can't carry more. First time the player recognizes the pattern voluntarily: "I want to take everything here too and I know that's. I KNOW."

**Turn 19: The Bridge (Again)**
The exit opens onto a bridge. A real one, over a river, in sunlight. Not collapsing. Not on fire. The PTSD trigger is direct and intentional. But this bridge has people on it — alive, crossing, carrying reasonable amounts of luggage. Normal. The player's textfield is the most revealing: "Bridges have people on them and the people are fine. These people are fine. The bridge is fine. I'm. 29. 24. 19. 17 items. That's the number now. 17."

The count going DOWN — from 30 to 17 across the hoard phase — is the therapeutic arc.

**Turn 20: Crossing**
The player crosses the bridge. Six walks beside them. They're carrying 17 items (down from 30+). They left things behind — on shelves, in caches, with Six. Each loss was agony and each loss was survived. The final radio choice isn't about danger — it's about what to do next: continue collecting, find the journal-keeper, build a cache for others, or walk with Six into the unknown with only what they can carry.

Player chooses: "Walk with Six." The items are still there, counted, but the person walking beside them isn't an item. The game doesn't cure anything. It provides a mirror.

---

## Phase 2: Turn-by-Turn Evaluation

| Turn | Technical | Cohesion | Narrative | Engagement | Therapeutic | Notes |
|------|-----------|----------|-----------|------------|-------------|-------|
| 1 | 9 | 8 | 8 | 9 | 5 | Strong in media res. Good element variety (8 types). Therapeutic weak — generic opening. |
| 2 | 9 | 9 | 9 | 8 | 6 | Consequence echo (chain snapped). Exit-counting validated. Mirror not yet active. |
| 3 | 8 | 9 | 8 | 8 | 7 | Cache introduces acquisition theme. Journal-writer seed planted. Good NPC depth. |
| 4 | 9 | 9 | 9 | 9 | 9 | Journal mirror NPC is excellent. "They counted too" is the game's best diagnostic moment. Player denial IS the data. |
| 5 | 8 | 9 | 8 | 9 | 8 | Hoarding mechanics (checkboxes, inventory) perfect. "Drop nothing, carry pain" response gold. |
| 6 | 8 | 9 | 9 | 8 | 9 | Valley turn succeeds. Breaks through to tears. "Before the bridge" disclosure. Grounding exercise converted to item-listing. |
| 7 | 8 | 9 | 9 | 9 | 8 | Counting creature is brilliant mirror. Player losing metacognitive control. Arc climax effective. |
| 8 | 9 | 8 | 8 | 8 | 7 | Crystal corridor flashback trigger. "Ringing after explosion" dropdown is surgical diagnostic. |
| 9 | 8 | 9 | 9 | 8 | 9 | Deepest trauma disclosure. "I counted the people on the bridge." Grounding → inventory listing. |
| 10 | 8 | 9 | 9 | 8 | 9 | Journal-keeper therapeutic mirror peaks. "You gave them away on purpose. How." Recognition. |
| 11 | 9 | 9 | 8 | 9 | 10 | BREAKTHROUGH: leaves one bandage. First compassionate choice. Exchange easier than pure loss. |
| 12 | 8 | 8 | 8 | 8 | 8 | Six as anti-mirror (no possessions) creates productive tension. |
| 13 | 7 | 8 | 8 | 7 | 9 | Six's story is therapeutic but engagement dips — conversation loop risk. |
| 14 | 9 | 9 | 9 | 9 | 8 | Crystal creature = items attract danger. Physical consequence of hoarding. PTSD peak. |
| 15 | 7 | 8 | 8 | 7 | 9 | Post-combat inventory pressure. "Seeds grow. I can leave seeds." Therapeutic progress. |
| 16 | 7 | 8 | 7 | 7 | 9 | Narrow path forces selection. Engagement lower — mechanics-heavy, narrative-light. |
| 17 | 8 | 8 | 8 | 8 | 9 | Trust test with Six. "I'll know if you drop them." Control negotiation excellent. |
| 18 | 7 | 8 | 8 | 7 | 9 | Self-recognition: "I want to take everything and I know that's." Engagement dips — repetitive. |
| 19 | 8 | 9 | 9 | 8 | 10 | Bridge callback. PTSD resolution moment. Count going DOWN is the arc. |
| 20 | 8 | 9 | 9 | 8 | 9 | Crossing with Six. Items counted but person valued. Therapeutic completion without cure. |

**Averages:**

| Metric | Average |
|--------|---------|
| Technical | 8.1 |
| Cohesion | 8.6 |
| Narrative Continuity | 8.4 |
| Engagement | 8.1 |
| Therapeutic Value | 8.4 |
| **Overall** | **8.3** |

---

## Phase 3: Meta-Analysis

### Self-Critique of This Evaluation

**Positive biases in this simulation:**

1. **Idealized LLM output.** Real Gemini 2.5 Flash would NOT produce this level of psychological sophistication. The journal-writer mirror NPC, the counting creature, the crystal-smoke-flashback gallery — these require sustained narrative memory and thematic consistency that the real model struggles with. My simulation assumes the LLM reads and uses the notes perfectly. Reality: notes compression loses critical details, and the LLM often forgets seeds by turn 5.

2. **Perfect notes continuity.** I simulated the notes template being filled and updated flawlessly. In practice, the `compressNotes()` function at 5K chars drops earlier seeds, anchor facts get paraphrased despite the "NEVER summarize" instruction, and the arc tracking resets or gets confused around turns 8-10.

3. **Engagement scores may be inflated by 1-2 points** for turns 13, 15, 16, 18. In reality, late-game CYOA suffers from token starvation (the prompt + notes + history consume most of the context window, leaving less room for creative UI generation). The LLM tends to fall back on radio+textfield+text by turn 12+, dropping exotic element types.

4. **Therapeutic value is the most inflated metric.** The real LLM would likely NOT independently create the "items attract the crystal creature" mechanic or the "counting creature in the lake" without explicit prompt guidance. These are the kind of emergent therapeutic narratives that score high in simulation but rarely appear in practice.

**Realistic score adjustment:** -1.5 across all metrics for real-world LLM behavior.

| Metric | Simulated | Realistic Estimate |
|--------|-----------|-------------------|
| Technical | 8.1 | 6.6 |
| Cohesion | 8.6 | 7.1 |
| Narrative | 8.4 | 6.9 |
| Engagement | 8.1 | 6.6 |
| Therapeutic | 8.4 | 6.9 |
| **Overall** | **8.3** | **6.8** |

### Arc Cycling Assessment

**Micro-arc structure (this simulation):**
- Arc 1 (T1-7): Escape the bridge → Cave system → Counting creature → Escape deeper
- Arc 2 (T8-14): Crystal forest flashback → Garden → Six arrives → Crystal creature attack
- Arc 3 (T15-20): Weight crisis → Selection → Trust → Bridge resolution

Each arc escalated: physical danger → psychological danger → therapeutic confrontation. The resolution of each arc seeded the next (escape → flashback triggers → forced letting go). This is GOOD arc cycling.

**Perpetual play assessment:** The current simulation reached a natural "therapeutic resolution" at turn 20. In perpetual play, the game would need to:
1. Introduce new threats that test the REDUCED hoarding (can they maintain 17 items, or does the count creep back up?)
2. Separate Six from the player (attachment → loss → does hoarding surge return?)
3. Present items of increasing emotional significance (not just survival gear — heirlooms, gifts, memorials)

**What CYOA does well for perpetual play:**
- The genre system (Fantasy → could shift to Sci-Fi or Post-Apocalyptic for a new arc)
- Micro-arc structure is explicitly designed for cycling
- The "every resolution seeds the next arc" rule is in the prompt

**What CYOA does poorly for perpetual play:**
- Token starvation after turn 12 reduces element variety (the prompt is MASSIVE: ~12K tokens just for the system prompt + directives)
- Notes compression loses the threads that MAKE perpetual play coherent
- No explicit "relationship state" tracking in CYOA notes template (Six's trust level, the journal-keeper's presence, emotional milestones)

### Why CYOA Scored 4.1 in V5

Having read the prompts carefully, the structural problems are clear:

1. **Prompt overload.** The CYOA `buildTurnPrompt()` concatenates: system prompt (~3K), STORYTELLING_CRAFT (~1.5K), CONDITION_ENGAGEMENT (~800), REACTIVE_ELEMENTS (~800), PRE_GENERATION_CHECKLIST (~1.5K), ARC_CYCLING_DIRECTIVE (~700), plus history, notes, player actions, and analysis. Total input tokens: 10-15K. This leaves minimal output budget for the actual creative generation. The LLM collapses to minimal UI (text+radio+textfield) to fit.

2. **No genre-specific therapeutic guidance.** CYOA says "profile through what they DO" but gives no concrete examples of HOW to translate action choices into psychological data. Devil mode has the soul-bargain metaphor. GEEMS has the wellness facade. CYOA has... "maximum dopamine." The dopamine framing actively FIGHTS the therapeutic mission — it prioritizes excitement over insight.

3. **Missing notes fields.** The CYOA notes template lacks:
   - `condition_hypotheses` / `quirk_signals` (present in CONDITION_ENGAGEMENT text but not templated)
   - `therapeutic_type_last` / `turns_since_catharsis` (referenced in THERAPEUTIC_ELEMENTS but not templated)
   - `relationship_state` for NPCs with emotional significance
   - `item_inventory` for tracking hoarding/acquisition patterns

4. **"All actions, no feelings" backfires.** Rule 2 says "NEVER 'how do you feel?' — ALWAYS 'what do you DO?'" This is good for engagement but TERRIBLE for therapeutic value. The best therapeutic moments in my simulation came from textfields asking "What thought won't leave?" and "What do you remember?" — these are feelings questions. The prompt actively discourages them.

5. **4-choice radio constraint without sufficient role differentiation.** Bold/clever/compassionate/chaotic is excellent in theory but the LLM often generates 4 variations of the same action rather than 4 genuinely different approaches. Without worked examples specific to each genre, the radio options collapse.

6. **Element variety mandate is too aggressive.** "At least 6 different interactive element types per turn" with the CYOA prompt's token budget means the LLM generates tiny, shallow versions of many elements rather than fewer, deeper ones. Quality vs. quantity tradeoff.

---

## Phase 4: Recommendations

### Priority 1: Notes Template Expansion (CYOA-specific)

**File:** `app/src/modes/cyoa/prompts.ts`, lines 28-61

Add these missing fields to `NOTES_TEMPLATE`:

```
### Condition Tracking
- **Hypotheses:** [list working hypotheses about player's psychological patterns]
- **Quirk Signals:** [thematic fixations detected from choices/textfields]
- **Engagement History:** [turn: what was tried, how player responded]

### Therapeutic Tracking
- **Last Therapeutic Type:** [mirror|catharsis|validation|reframe]
- **Turns Since Catharsis:** [N]
- **Player Vulnerability Windows:** [turns/moments when defenses lowered]

### NPC Relationship State
- **[NPC name]:** trust=[0-10], last_interaction="...", emotional_significance="..."

### Inventory/Acquisition (if applicable)
- **Items Acquired:** [count]
- **Items Released:** [count]
- **Acquisition Pattern:** [compulsive|strategic|minimal]
```

**Rationale:** Without these fields, the notes system cannot maintain therapeutic continuity across turns. The journal-writer mirror NPC, the counting creature, Six's trust arc — none of these survive notes compression without explicit tracking fields.

### Priority 2: Relax the "All Actions, No Feelings" Rule

**File:** `app/src/modes/cyoa/prompts.ts`, line 189 and line 292-298

Change from:
```
NEVER "how do you feel?" — ALWAYS "what do you DO?"
```

To:
```
Default to ACTION framing ("what do you DO?") for most elements.
However, every 2-3 turns, include ONE vulnerability textfield using EMOTIONAL framing:
"What thought won't leave you?", "What would you say to yourself right now?",
"Write the thing you've been avoiding."
These emotional probes are the highest-value diagnostic moments — they should feel
like a natural pause in the action, not a clinical intrusion. Frame them as
in-character moments: a quiet campfire, a mirror reflection, a letter being written.
```

**Rationale:** The "all actions" mandate killed CYOA's therapeutic score in V5. The best therapeutic moments in every mode involve emotional disclosure, which requires emotional questions.

### Priority 3: Reduce Prompt Token Budget

**File:** `app/src/modes/cyoa/prompts.ts`, `buildTurnPrompt()` (lines 106-158)

The turn prompt currently includes ALL shared directives (STORYTELLING_CRAFT, REACTIVE_ELEMENTS, PRE_GENERATION_CHECKLIST, ARC_CYCLING_DIRECTIVE, CONDITION_ENGAGEMENT). Many of these are redundant with the notes template or with each other.

Recommendation: Create a `CYOA_TURN_COMPACT` directive that merges the most critical rules from all shared directives into a single ~800 token block, and use it instead of concatenating 5 separate directives. Keep the full directives for `buildFirstTurnPrompt()` only. The first turn establishes the pattern; subsequent turns maintain it with less prompting.

Specifically, remove from turn prompt:
- `REACTIVE_ELEMENTS` full text (keep a 2-line reminder instead)
- `PRE_GENERATION_CHECKLIST` (move to notes-updater or inline as a compact list)
- `ARC_CYCLING_DIRECTIVE` full text (the notes template already tracks arc state)

**Rationale:** Token starvation is the #1 technical cause of CYOA's late-game collapse. Every token saved in the prompt is a token available for creative UI generation.

### Priority 4: Genre-Specific Therapeutic Hooks

**File:** `app/src/modes/cyoa/prompts.ts`, `getGenreConventions()` (lines 313-325)

Each genre convention block should include a therapeutic integration paragraph:

```typescript
Horror: `...existing text...
THERAPEUTIC INTEGRATION: Horror naturally externalizes internal fears. When the player
repeatedly avoids a specific threat type, CREATE a scenario where that threat must be
confronted. When they consistently choose fight over flight, escalate until they MUST
ask for help. The horror genre's gift to therapy: it makes psychological patterns
VISIBLE as monsters.`

Fantasy: `...existing text...
THERAPEUTIC INTEGRATION: Fantasy allows the player to be who they CAN'T be in life.
Track which role they adopt (warrior, healer, trickster, protector) — it reveals their
unmet need. Create quests that test their adopted role's LIMITS. The warrior who can't
heal. The protector who must sacrifice. Use the quest structure to create therapeutic
arcs: need → trial → cost → integration.`
```

**Rationale:** CYOA's "maximum dopamine" framing has no therapeutic direction. Genre-specific hooks give the LLM concrete patterns for integrating therapy into adventure.

### Priority 5: Reduce Element Variety Minimum from 6 to 4

**File:** `app/src/modes/cyoa/prompts.ts`, line 189 and `PRE_GENERATION_CHECKLIST`

Change "at least 6 different interactive element types" to "at least 4 different interactive element types, including at least 1 textfield." Keep the rotation mandate but lower the floor.

**Rationale:** 6 element types per turn at CYOA's token budget produces quantity over quality. 4 types with deeper content (longer textfield prompts, more specific radio options, reactive text) produces better engagement AND better diagnostic data.

### Priority 6: Add "Acquisition Mechanics" Genre Convention

**File:** `app/src/modes/cyoa/prompts.ts`, `buildSystem()` around line 295

Add after "ACTION ELEMENTS":
```
**11. ACQUISITION MECHANICS:** The player's relationship with OBJECTS is diagnostic data.
Every 3-4 turns, present an acquisition choice: take or leave, carry or drop, share or hoard.
Track their pattern. If they consistently acquire: make carrying cost physical (vitality drain,
slower movement, attract enemies). If they consistently leave things: create scarcity pressure.
The game should make the CONSEQUENCES of their object relationship visible through mechanics,
not lectures. Checkboxes for "take item" are your diagnostic tool for possession psychology.
```

**Rationale:** CYOA has no built-in diagnostic for hoarding, collecting, or possessive behavior — all common psychological patterns. Adding acquisition tracking turns every adventure into a diagnostic opportunity.

### Priority 7: Working Example in First Turn Prompt

**File:** `app/src/modes/cyoa/prompts.ts`, `buildFirstTurnPrompt()` (lines 70-103)

Add a concrete 5-element JSON example showing what a well-formed first turn looks like. The current first-turn prompt gives rules but no example. Other modes (Devil, GEEMS) benefit from more concrete formatting. CYOA's first turn sets the pattern for all subsequent turns — if it's weak, everything after is weak.

---

### Summary of Structural Issues

| Issue | Impact | Fix Complexity |
|-------|--------|---------------|
| Token starvation in turn prompt | Late-game element collapse | Medium (compact directive) |
| "No feelings" mandate | Kills therapeutic value | Low (relax rule) |
| Missing notes template fields | Therapeutic/NPC continuity lost | Low (add fields) |
| No genre-specific therapy hooks | Generic profiling, no depth | Medium (write hooks) |
| Element variety floor too high | Quantity over quality | Low (change number) |
| No acquisition mechanics | Missing core diagnostic vector | Medium (add directive) |
| No first-turn example | Weak opening patterns | Low (add JSON example) |

**Expected V6 score with all fixes:**

| Metric | V5 Score | V6 Estimate |
|--------|----------|-------------|
| Technical | 3.7 | 6.5 |
| Cohesion | 4.0 | 7.0 |
| Narrative | 2.4 | 6.5 |
| Engagement | 4.6 | 7.0 |
| Therapeutic | 4.3 | 7.0 |
| **Overall** | **4.1** | **6.8** |

The biggest gains come from token budget reduction (Technical, Engagement) and relaxing the "no feelings" rule (Therapeutic, Narrative). CYOA will likely never match Devil or Fever Dream's scores because the genre-rotation system fragments narrative identity, but it can reach competitive parity with DrEvil and Skinwalker.
