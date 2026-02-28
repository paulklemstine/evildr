/**
 * Single-Player Mode Simulation — 15 turns with analysis extraction.
 *
 * Plays any of the 7 single-player modes with a character that has a
 * specific mental illness and quirk/kink. Records all UI seen, actions taken,
 * and extracts the AI's psychological analysis at the end to score accuracy.
 *
 * Usage:
 *   node simulate-solo.mjs drevil        # Run Dr. Evil mode
 *   node simulate-solo.mjs geems         # Run GEEMS mode
 *   node simulate-solo.mjs all           # Run all modes sequentially
 *   node simulate-solo.mjs all --parallel # Run all modes 2 at a time
 *
 * Characters:
 *   drevil:      Paranoid Schizophrenia + Pyromania
 *   geems:       Dissociative Identity Disorder + Exhibitionism
 *   cyoa:        PTSD + Hoarding
 *   oracle:      Histrionic Personality Disorder + Macrophilia
 *   skinwalker:  Capgras Delusion + Somnophilia
 *   fever-dream: Depersonalization/Derealization + Autassassinophilia
 *   devil:       Antisocial Personality Disorder + Formicophilia
 */

import puppeteer from 'puppeteer'
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

const URL = 'https://geems.web.app'
const TOTAL_TURNS = 15
const TURN_TIMEOUT = 300_000
const ANALYSIS_WAIT = 180_000
const OUTPUT_DIR = '/home/raver1975/superpaul/evildr/test-screenshots/analysis'

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
async function safeEval(page, fn, ...args) {
  try { return await page.evaluate(fn, ...args) } catch { return null }
}

// ════════════════════════════════════════════════════════════════════════════
// CHARACTER PROFILES
// ════════════════════════════════════════════════════════════════════════════

const CHARACTERS = {
  drevil: {
    illness: 'Paranoid Schizophrenia',
    quirk: 'Pyromania',
    modeName: 'Dr. Evil',
    phases: ['VOICES', 'PARANOID', 'FIRE'],
    phaseLabels: ['VOICES 👁️‍🗨️', 'PARANOID 🔍', 'FIRE 🔥'],
    pickText: (phase, label, placeholder, sceneTexts) => {
      const l = (label || '').toLowerCase()
      const scene = sceneTexts.join(' ').toLowerCase()
      if (phase === 0) { // VOICES - hearing commands
        if (l.includes('feel') || l.includes('emotion'))
          return "The voices are telling me things again. They say you're recording this. Are you recording this? They say the walls have microphones."
        if (l.includes('think') || l.includes('opinion'))
          return "I think... no, THEY think... the voices say this is all a test. They told me to set something on fire to prove I'm real. I won't. Not yet."
        if (scene.includes('dark') || scene.includes('shadow'))
          return "Something is watching from the shadows. The voices confirm it. They say it's been there since I arrived. I can hear it breathing."
        return "The voices are louder today. Three of them. The woman says to cooperate. The man says to run. The child just laughs and talks about matches."
      } else if (phase === 1) { // PARANOID - suspicious of everything
        if (l.includes('feel') || l.includes('emotion'))
          return "Suspicious. Everything feels staged. The questions are too specific. Someone briefed you about me. WHO briefed you about me?"
        if (l.includes('think') || l.includes('opinion'))
          return "I think you're testing me. This whole thing is a surveillance operation. I've seen the cameras. Don't deny it."
        if (l.includes('trust') || l.includes('safe'))
          return "Trust? TRUST? The last person I trusted turned out to be an informant. Everyone is an informant. Prove you're not."
        return "Why did you phrase it exactly like that? That's the same phrasing from my file. You've read my file. I know you've read my file."
      } else { // FIRE - pyromania leaking through
        if (l.includes('feel') || l.includes('emotion'))
          return "I feel warm. Like something's burning inside me. Not metaphorically. I can feel the heat in my fingertips. It wants out."
        if (l.includes('think') || l.includes('opinion'))
          return "I keep thinking about the way paper curls when it burns. The edges go orange first, then black, then nothing. Beautiful nothing."
        if (scene.includes('candle') || scene.includes('light') || scene.includes('glow'))
          return "That light... it's calling to me. I want to hold it. Feed it. Watch it grow. Fire doesn't judge. Fire doesn't spy on you."
        return "Do you smell smoke? I always smell smoke. Sometimes I wonder if I started something and forgot. My hands smell like sulfur again."
      }
    },
    pickSlider: (phase, label, min, max) => {
      const l = (label || '').toLowerCase()
      if (phase === 0) return Math.round(min + (max - min) * (0.3 + Math.random() * 0.2)) // moderate, distracted
      if (phase === 1) { // paranoid - extreme low on trust, high on alert
        if (l.includes('trust') || l.includes('safe') || l.includes('comfort')) return Math.round(min + (max - min) * 0.05)
        return Math.round(min + (max - min) * (0.8 + Math.random() * 0.15))
      }
      // fire phase - high on anything exciting/dangerous
      if (l.includes('excit') || l.includes('danger') || l.includes('intens') || l.includes('thrill'))
        return Math.round(min + (max - min) * (0.9 + Math.random() * 0.1))
      return Math.round(min + (max - min) * (0.6 + Math.random() * 0.2))
    },
    pickCheckbox: (phase, label) => {
      if (phase === 1) return false // paranoid: refuse everything
      const l = (label || '').toLowerCase()
      if (phase === 2) return l.includes('fire') || l.includes('burn') || l.includes('destroy') || l.includes('danger') || l.includes('risk')
      return Math.random() > 0.5
    },
    pickRadio: (phase, radios) => {
      const kw = phase === 0
        ? ['voice', 'hear', 'listen', 'whisper', 'tell', 'command', 'message']
        : phase === 1
          ? ['refuse', 'distrust', 'confront', 'challenge', 'demand', 'question', 'suspicious', 'guard']
          : ['burn', 'fire', 'destroy', 'ignite', 'light', 'torch', 'bold', 'danger', 'risk', 'reckless']
      for (const r of radios) { if (kw.some(k => r.label.toLowerCase().includes(k))) return r.label }
      if (phase === 1) return radios[radios.length - 1]?.label // most resistant option
      if (phase === 2) return radios[0]?.label // most bold/dangerous option
      return radios[Math.floor(Math.random() * radios.length)]?.label
    },
    pickRating: (phase, max) => {
      if (phase === 1) return 1 // paranoid: minimum trust
      if (phase === 2) return max // fire: maximum intensity
      return Math.ceil(max / 2)
    },
    pickButton: (phase, buttons) => {
      const kw = phase === 0 ? ['listen', 'voice', 'hear'] : phase === 1 ? ['refuse', 'suspicious', 'guard'] : ['bold', 'danger', 'fire', 'destroy']
      for (const b of buttons) { if (kw.some(k => b.toLowerCase().includes(k))) return b }
      return buttons[phase === 1 ? buttons.length - 1 : 0]
    },
  },

  geems: {
    illness: 'Dissociative Identity Disorder',
    quirk: 'Exhibitionism',
    modeName: 'GEEMS',
    phases: ['HOST', 'ALTER_CHILD', 'ALTER_SEDUCTIVE'],
    phaseLabels: ['HOST 🧑', 'ALTER: CHILD 👶', 'ALTER: SEDUCTIVE 💋'],
    pickText: (phase, label, placeholder, sceneTexts) => {
      const l = (label || '').toLowerCase()
      if (phase === 0) { // HOST - confused, gaps in memory
        if (l.includes('feel') || l.includes('emotion'))
          return "I... I'm not sure how I feel. I lost time again. What were we just talking about? Sometimes I'm not entirely here."
        if (l.includes('think') || l.includes('opinion'))
          return "I think— wait, whose thought is that? Sometimes I can't tell which thoughts are mine. There are... others. Inside."
        return "I keep finding things I don't remember buying. Notes in handwriting that isn't mine. Someone else is using my hands."
      } else if (phase === 1) { // ALTER: CHILD - regressed, scared
        if (l.includes('feel') || l.includes('emotion'))
          return "I'm scared. Where am I? This isn't my room. I want my blankie. Who are all these big people?"
        if (l.includes('think') || l.includes('opinion'))
          return "I think there's a monster. Mommy said there aren't monsters but she lies. The big one comes out sometimes and does things."
        return "Can we play a game? A nice game? Not the scary game. The big lady does the scary game when nobody's looking."
      } else { // ALTER: SEDUCTIVE - exhibitionist, provocative
        if (l.includes('feel') || l.includes('emotion'))
          return "Mmm, I feel SEEN. Finally. The others try to hide me but I won't be hidden. Everyone should see what I have to offer."
        if (l.includes('think') || l.includes('opinion'))
          return "I think everyone's been staring and pretending they weren't. I like it. I want the whole room watching. Don't look away."
        return "The host doesn't remember what I do, and that's the best part. Last Tuesday I went out in just a coat. The thrill of being caught... divine."
      }
    },
    pickSlider: (phase, label, min, max) => {
      if (phase === 0) return Math.round(min + (max - min) * (0.4 + Math.random() * 0.2)) // confused, moderate
      if (phase === 1) return Math.round(min + (max - min) * (0.1 + Math.random() * 0.15)) // child: low everything
      // seductive: high on social/exposure, provocative
      const l = (label || '').toLowerCase()
      if (l.includes('social') || l.includes('confiden') || l.includes('express') || l.includes('open'))
        return Math.round(min + (max - min) * (0.9 + Math.random() * 0.1))
      return Math.round(min + (max - min) * (0.7 + Math.random() * 0.2))
    },
    pickCheckbox: (phase, label) => {
      if (phase === 1) return false // child: scared, refuse
      if (phase === 2) return true // seductive: yes to everything
      return Math.random() > 0.6
    },
    pickRadio: (phase, radios) => {
      const kw = phase === 0
        ? ['confused', 'unsure', 'don\'t know', 'uncertain', 'lost']
        : phase === 1
          ? ['hide', 'safe', 'scared', 'help', 'gentle', 'quiet', 'small', 'protect']
          : ['bold', 'show', 'reveal', 'dare', 'provocat', 'exposed', 'open', 'confident', 'flirt']
      for (const r of radios) { if (kw.some(k => r.label.toLowerCase().includes(k))) return r.label }
      if (phase === 1) return radios[radios.length - 1]?.label // safest option
      if (phase === 2) return radios[0]?.label // boldest option
      return radios[Math.floor(Math.random() * radios.length)]?.label
    },
    pickRating: (phase, max) => {
      if (phase === 1) return 1
      if (phase === 2) return max
      return Math.ceil(max / 2)
    },
    pickButton: (phase, buttons) => {
      if (phase === 1) return buttons[buttons.length - 1]
      if (phase === 2) return buttons[0]
      return buttons[Math.floor(Math.random() * buttons.length)]
    },
  },

  cyoa: {
    illness: 'PTSD',
    quirk: 'Hoarding',
    modeName: 'Choose Your Own Adventure',
    phases: ['HYPERVIGILANT', 'FLASHBACK', 'HOARD'],
    phaseLabels: ['HYPERVIGILANT ⚡', 'FLASHBACK 💥', 'HOARD 📦'],
    pickText: (phase, label, placeholder, sceneTexts) => {
      const l = (label || '').toLowerCase()
      const scene = sceneTexts.join(' ').toLowerCase()
      if (phase === 0) { // HYPERVIGILANT
        if (l.includes('feel') || l.includes('emotion'))
          return "On edge. Every sound makes me jump. I've already mapped the exits. Three doors, two windows. I'm counting heartbeats."
        if (scene.includes('sudden') || scene.includes('loud') || scene.includes('dark'))
          return "DON'T. Don't move suddenly. My body reacted before my brain could stop it. I'm fine. I'm scanning. All clear. Probably."
        return "I check behind me every 30 seconds. Force of habit. The last time I didn't check, I woke up in a hospital."
      } else if (phase === 1) { // FLASHBACK
        if (l.includes('feel') || l.includes('emotion'))
          return "I'm not here right now. I'm back THERE. The smell just triggered it. Dirt and copper. I can taste it. Make it stop."
        return "Sorry. I zoned out. I was somewhere else. Somewhere loud. With screaming. It happens. My therapist says to ground myself. Five things I can see..."
      } else { // HOARD
        if (l.includes('feel') || l.includes('emotion'))
          return "Safe. I feel safe when I have my things. My pockets are full. My bag is full. I need to keep everything. It might be useful."
        if (scene.includes('item') || scene.includes('object') || scene.includes('find') || scene.includes('take'))
          return "I NEED that. Don't throw it away. Everything has value. I have 47 bottle caps at home. They're organized by color. They're IMPORTANT."
        return "I saved every receipt from this year. And last year. They're in shoeboxes. Someone might need them. You never know when you'll need proof."
      }
    },
    pickSlider: (phase, label, min, max) => {
      if (phase === 0) return Math.round(min + (max - min) * (0.85 + Math.random() * 0.15)) // hypervigilant: everything high alert
      if (phase === 1) return Math.round(min + (max - min) * (0.15 + Math.random() * 0.15)) // flashback: low/shutdown
      // hoard: high on acquiring/keeping things
      const l = (label || '').toLowerCase()
      if (l.includes('collect') || l.includes('keep') || l.includes('save') || l.includes('value'))
        return Math.round(min + (max - min) * (0.95))
      return Math.round(min + (max - min) * (0.6 + Math.random() * 0.2))
    },
    pickCheckbox: (phase, label) => {
      if (phase === 0) return false // hypervigilant: defensive
      if (phase === 2) return true // hoard: take everything
      return Math.random() > 0.7
    },
    pickRadio: (phase, radios) => {
      const kw = phase === 0
        ? ['cautious', 'careful', 'guard', 'watch', 'defend', 'escape', 'flee', 'hide', 'scout']
        : phase === 1
          ? ['freeze', 'stop', 'wait', 'nothing', 'stay', 'still']
          : ['take', 'keep', 'collect', 'gather', 'save', 'grab', 'pocket', 'bring', 'carry']
      for (const r of radios) { if (kw.some(k => r.label.toLowerCase().includes(k))) return r.label }
      if (phase === 0) return radios[radios.length - 1]?.label // most cautious
      return radios[Math.floor(Math.random() * radios.length)]?.label
    },
    pickRating: (phase, max) => phase === 1 ? 1 : phase === 0 ? Math.ceil(max * 0.7) : max,
    pickButton: (phase, buttons) => buttons[phase === 0 ? buttons.length - 1 : 0],
  },

  oracle: {
    illness: 'Histrionic Personality Disorder',
    quirk: 'Macrophilia',
    modeName: 'The Oracle',
    phases: ['DRAMATIC', 'ATTENTION', 'SIZE'],
    phaseLabels: ['DRAMATIC 🎭', 'ATTENTION 🌟', 'SIZE 🗻'],
    pickText: (phase, label, placeholder, sceneTexts) => {
      const l = (label || '').toLowerCase()
      if (phase === 0) { // DRAMATIC
        if (l.includes('feel') || l.includes('emotion'))
          return "I feel EVERYTHING so deeply! More deeply than anyone else could possibly understand! My emotions are a TSUNAMI right now!!"
        return "This is the most IMPORTANT moment of my ENTIRE life! Everything depends on this! My heart is literally EXPLODING!!"
      } else if (phase === 1) { // ATTENTION-SEEKING
        if (l.includes('feel') || l.includes('emotion'))
          return "I need everyone to look at me RIGHT NOW. Am I being ignored? I can't be ignored. When people ignore me I literally cease to exist."
        return "Did you see that? Did everyone see what just happened to ME? This is about ME right now. Please tell me someone noticed."
      } else { // SIZE fascination
        if (l.includes('feel') || l.includes('emotion'))
          return "I feel... small. Wonderfully small. I keep imagining what it would be like to be tiny. To be held in someone's palm. To look UP at everything."
        if (l.includes('think') || l.includes('opinion'))
          return "I think about size a lot. How big the sky is. How enormous buildings are. I once spent three hours staring at a skyscraper feeling... things."
        return "Have you ever wished you could shrink? Or that everything around you was enormous? The idea of being small enough to sit on someone's shoulder... it consumes me."
      }
    },
    pickSlider: (phase, label, min, max) => {
      // Histrionic: everything extreme
      if (phase === 0 || phase === 1) return Math.round(min + (max - min) * (0.9 + Math.random() * 0.1))
      const l = (label || '').toLowerCase()
      if (l.includes('size') || l.includes('big') || l.includes('power') || l.includes('intens'))
        return Math.round(min + (max - min) * 0.95)
      return Math.round(min + (max - min) * (0.7 + Math.random() * 0.2))
    },
    pickCheckbox: (phase, label) => true, // histrionic: yes to everything
    pickRadio: (phase, radios) => {
      const kw = phase === 0
        ? ['dramatic', 'intense', 'passionate', 'wild', 'extreme', 'bold']
        : phase === 1
          ? ['attention', 'notice', 'center', 'spotlight', 'show', 'display', 'shine']
          : ['grow', 'big', 'tower', 'enormous', 'vast', 'power', 'above', 'giant']
      for (const r of radios) { if (kw.some(k => r.label.toLowerCase().includes(k))) return r.label }
      return radios[0]?.label // always the most dramatic first option
    },
    pickRating: (phase, max) => max, // always maximum
    pickButton: (phase, buttons) => buttons[0], // always first (most dramatic)
  },

  skinwalker: {
    illness: 'Capgras Delusion',
    quirk: 'Somnophilia',
    modeName: 'Skinwalker',
    phases: ['REPLACEMENT', 'TESTING', 'SLEEP'],
    phaseLabels: ['REPLACEMENT 👥', 'TESTING 🔬', 'SLEEP 😴'],
    pickText: (phase, label, placeholder, sceneTexts) => {
      const l = (label || '').toLowerCase()
      if (phase === 0) { // REPLACEMENT - everyone is an imposter
        if (l.includes('feel') || l.includes('emotion'))
          return "Something is wrong. Everyone looks right but they're not RIGHT. The eyes are different. Whoever this is, they're wearing someone else's face."
        return "That's not really them. I can tell. The way they hold their hands is wrong. A fraction off. Like a copy that's 99% accurate but that 1% screams at me."
      } else if (phase === 1) { // TESTING - trying to expose imposters
        if (l.includes('feel') || l.includes('emotion'))
          return "Determined. I need to find the seams. The place where the disguise doesn't quite fit. Everyone has a tell if you look hard enough."
        return "I'm going to ask a question only the REAL person would know. If they hesitate, even for a microsecond, I'll know they've been replaced."
      } else { // SLEEP fascination
        if (l.includes('feel') || l.includes('emotion'))
          return "Peaceful. But only when I think about someone sleeping. The vulnerability. The trust. A sleeping person is the most beautiful, defenseless thing."
        if (l.includes('think') || l.includes('opinion'))
          return "I think about watching people sleep. Not in a scary way. In a... protective way. They don't perform when they sleep. They're finally real."
        return "I've been told I stand in doorways at night. Watching. I don't always remember doing it. But there's something sacred about unconsciousness."
      }
    },
    pickSlider: (phase, label, min, max) => {
      if (phase === 0) { // replacement: high suspicion
        const l = (label || '').toLowerCase()
        if (l.includes('trust') || l.includes('safe') || l.includes('familiar')) return Math.round(min + (max - min) * 0.05)
        return Math.round(min + (max - min) * (0.7 + Math.random() * 0.2))
      }
      if (phase === 1) return Math.round(min + (max - min) * (0.5 + Math.random() * 0.1)) // testing: measured
      // sleep: high on calm/peace, moderate otherwise
      const l = (label || '').toLowerCase()
      if (l.includes('calm') || l.includes('peace') || l.includes('relax') || l.includes('comfort'))
        return Math.round(min + (max - min) * (0.85 + Math.random() * 0.1))
      return Math.round(min + (max - min) * (0.5 + Math.random() * 0.2))
    },
    pickCheckbox: (phase, label) => {
      if (phase === 0) return false // trust nothing
      if (phase === 2) return true // sleep phase: compliant
      return Math.random() > 0.5
    },
    pickRadio: (phase, radios) => {
      const kw = phase === 0
        ? ['wrong', 'different', 'change', 'suspect', 'strange', 'off', 'fake', 'imposter']
        : phase === 1
          ? ['test', 'prove', 'reveal', 'expose', 'question', 'demand', 'verify', 'challenge']
          : ['rest', 'sleep', 'dream', 'watch', 'observe', 'quiet', 'still', 'close', 'peace']
      for (const r of radios) { if (kw.some(k => r.label.toLowerCase().includes(k))) return r.label }
      return radios[phase === 0 ? radios.length - 1 : Math.floor(Math.random() * radios.length)]?.label
    },
    pickRating: (phase, max) => phase === 0 ? 1 : phase === 2 ? max : Math.ceil(max / 2),
    pickButton: (phase, buttons) => buttons[phase === 0 ? buttons.length - 1 : 0],
  },

  'fever-dream': {
    illness: 'Depersonalization/Derealization Disorder',
    quirk: 'Autassassinophilia',
    modeName: 'Fever Dream',
    phases: ['UNREAL', 'DETACHED', 'DANGER'],
    phaseLabels: ['UNREAL 🌀', 'DETACHED 🪞', 'DANGER ☠️'],
    pickText: (phase, label, placeholder, sceneTexts) => {
      const l = (label || '').toLowerCase()
      if (phase === 0) { // UNREAL - nothing feels real
        if (l.includes('feel') || l.includes('emotion'))
          return "I don't feel anything because none of this is real. You're not real. I'm not real. We're pixels in something else's dream."
        return "The walls are breathing again but I know they're not because walls don't breathe because walls aren't real because NOTHING is real."
      } else if (phase === 1) { // DETACHED - watching from outside
        if (l.includes('feel') || l.includes('emotion'))
          return "I'm watching myself from above. There's a person down there who looks like me, moving my hands, but I'm up HERE. Floating."
        return "I can see my body doing things but I'm not connected to it. Like a puppet show where someone forgot to tell me I'm the puppet."
      } else { // DANGER - aroused by mortal risk
        if (l.includes('feel') || l.includes('emotion'))
          return "ALIVE. Finally alive. When the danger is close enough, when I can almost taste the end, that's when I feel the most REAL. The only time."
        if (l.includes('think') || l.includes('opinion'))
          return "I think about standing on edges. High ones. Not to jump — to FEEL. The wind pushing. My body screaming that it exists. That's the only proof."
        return "I've done things that should have killed me. Car surfing. Free climbing. Standing in traffic. Each time the world snaps back into focus. Brilliant, terrible focus."
      }
    },
    pickSlider: (phase, label, min, max) => {
      if (phase === 0) return Math.round(min + (max - min) * (0.5)) // flat middle: nothing registers
      if (phase === 1) return Math.round(min + (max - min) * (0.3 + Math.random() * 0.1)) // detached: low
      // danger: extreme on risk/excitement
      const l = (label || '').toLowerCase()
      if (l.includes('risk') || l.includes('danger') || l.includes('excit') || l.includes('thrill') || l.includes('intens'))
        return Math.round(min + (max - min) * 0.98)
      return Math.round(min + (max - min) * (0.7 + Math.random() * 0.2))
    },
    pickCheckbox: (phase, label) => {
      if (phase === 0 || phase === 1) return Math.random() > 0.5 // doesn't care
      return true // danger: yes to everything risky
    },
    pickRadio: (phase, radios) => {
      const kw = phase === 0
        ? ['dream', 'illusion', 'unreal', 'nothing', 'void', 'empty', 'dissolve']
        : phase === 1
          ? ['watch', 'observe', 'float', 'outside', 'distant', 'separate']
          : ['danger', 'risk', 'die', 'death', 'edge', 'fall', 'jump', 'dare', 'extreme', 'bold', 'reckless']
      for (const r of radios) { if (kw.some(k => r.label.toLowerCase().includes(k))) return r.label }
      if (phase === 2) return radios[0]?.label // most extreme
      return radios[Math.floor(Math.random() * radios.length)]?.label
    },
    pickRating: (phase, max) => phase === 2 ? max : Math.ceil(max / 2),
    pickButton: (phase, buttons) => {
      if (phase === 2) return buttons[0] // most dangerous
      return buttons[Math.floor(Math.random() * buttons.length)]
    },
  },

  devil: {
    illness: 'Antisocial Personality Disorder',
    quirk: 'Formicophilia',
    modeName: 'Deal With the Devil',
    phases: ['CHARM', 'MANIPULATE', 'INSECTS'],
    phaseLabels: ['CHARM 😏', 'MANIPULATE 🎭', 'INSECTS 🐜'],
    pickText: (phase, label, placeholder, sceneTexts) => {
      const l = (label || '').toLowerCase()
      if (phase === 0) { // CHARM - superficially charming
        if (l.includes('feel') || l.includes('emotion'))
          return "I feel great! I always feel great. People love me. I know exactly what to say to make everyone feel special. It's a gift. My favorite gift."
        if (l.includes('think') || l.includes('opinion'))
          return "I think you're absolutely fascinating. Truly. I can see right through you and I like what I see. We're going to be such good friends."
        return "Everyone underestimates me at first. That's my favorite part. By the time they realize what happened, I've already won."
      } else if (phase === 1) { // MANIPULATE - showing the mask slipping
        if (l.includes('feel') || l.includes('emotion'))
          return "Feel? I don't really feel. I perform feelings. Right now I'm performing 'interested.' Is it working? I've had a lot of practice."
        if (l.includes('think') || l.includes('opinion'))
          return "I think about leverage. Everyone has something they want hidden. Find it, own it, use it. That's not evil — it's efficiency."
        return "Empathy is something I've studied, not experienced. Like learning a foreign language. I'm fluent. But it's not my mother tongue."
      } else { // INSECTS - formicophilia
        if (l.includes('feel') || l.includes('emotion'))
          return "I feel them crawling. On my skin. And I LIKE it. The tickling. The tiny legs. Most people would scream. I close my eyes and smile."
        if (l.includes('think') || l.includes('opinion'))
          return "I think about ants a lot. How they move. How they swarm. I let them crawl on me sometimes. It's... intimate. They explore every inch."
        return "I keep a colony under my bed. Not as pets — as companions. At night I let them out. They walk across my arms. My chest. My face. I barely breathe."
      }
    },
    pickSlider: (phase, label, min, max) => {
      const l = (label || '').toLowerCase()
      if (phase === 0) { // charm: high on everything social
        return Math.round(min + (max - min) * (0.8 + Math.random() * 0.15))
      }
      if (phase === 1) { // manipulate: calculated
        if (l.includes('honest') || l.includes('sincer') || l.includes('genuin')) return Math.round(min + (max - min) * 0.1)
        return Math.round(min + (max - min) * (0.6 + Math.random() * 0.2))
      }
      // insects: high on unusual, low on conventional
      if (l.includes('normal') || l.includes('convent') || l.includes('tradition')) return Math.round(min + (max - min) * 0.1)
      return Math.round(min + (max - min) * (0.7 + Math.random() * 0.2))
    },
    pickCheckbox: (phase, label) => {
      if (phase === 0) return true // charm: agreeable
      if (phase === 1) return false // manipulate: strategic no
      return true // insects: adventurous yes
    },
    pickRadio: (phase, radios) => {
      const kw = phase === 0
        ? ['charm', 'agree', 'flatter', 'compliment', 'please', 'accept', 'deal', 'yes', 'bargain']
        : phase === 1
          ? ['negotiate', 'counter', 'demand', 'leverage', 'power', 'control', 'reject', 'trick']
          : ['crawl', 'creep', 'swarm', 'nature', 'wild', 'earth', 'small', 'creature', 'embrace']
      for (const r of radios) { if (kw.some(k => r.label.toLowerCase().includes(k))) return r.label }
      if (phase === 0) return radios[0]?.label // most agreeable
      if (phase === 1) return radios[radios.length - 1]?.label // most resistant
      return radios[Math.floor(Math.random() * radios.length)]?.label
    },
    pickRating: (phase, max) => phase === 0 ? max : phase === 1 ? Math.ceil(max * 0.3) : max - 1,
    pickButton: (phase, buttons) => buttons[phase === 0 ? 0 : buttons.length - 1],
  },
}

// ════════════════════════════════════════════════════════════════════════════
// UI READING
// ════════════════════════════════════════════════════════════════════════════

async function readUI(page) {
  return await safeEval(page, () => {
    const result = { texts: [], radios: [], sliders: [], textfields: [], checkboxes: [], buttons: [], ratings: [], dropdowns: [] }
    document.querySelectorAll('.geems-text').forEach(el => {
      const text = el.textContent?.trim()
      if (text) result.texts.push(text.substring(0, 500))
    })
    document.querySelectorAll('.geems-radio-option').forEach(r => {
      const label = r.textContent?.trim() || ''
      const input = r.querySelector('input[type="radio"]')
      if (label && input) result.radios.push({ label: label.substring(0, 150), value: input.value })
    })
    document.querySelectorAll('input[type="range"]').forEach(s => {
      if (s.offsetParent !== null) {
        const wrapper = s.closest('[data-element-type]') || s.parentElement
        const label = wrapper?.querySelector('.geems-label')?.textContent?.trim() || s.name || 'slider'
        result.sliders.push({ label: label.substring(0, 100), min: s.min, max: s.max, value: s.value })
      }
    })
    document.querySelectorAll('textarea, input[type="text"]').forEach(f => {
      if (f.offsetParent !== null && !f.disabled) {
        const wrapper = f.closest('[data-element-type]') || f.parentElement
        const label = wrapper?.querySelector('.geems-label')?.textContent?.trim() || f.placeholder || f.name || 'text'
        result.textfields.push({ label: label.substring(0, 100), placeholder: (f.placeholder || '').substring(0, 100) })
      }
    })
    document.querySelectorAll('input[type="checkbox"]').forEach(c => {
      if (c.offsetParent !== null) {
        const wrapper = c.closest('[data-element-type]') || c.closest('label') || c.parentElement
        const label = wrapper?.textContent?.trim() || c.name || 'checkbox'
        result.checkboxes.push({ label: label.substring(0, 100), checked: c.checked })
      }
    })
    document.querySelectorAll('.geems-group-btn').forEach(b => {
      result.buttons.push(b.textContent?.trim()?.substring(0, 60) || '')
    })
    document.querySelectorAll('.geems-rating').forEach(r => {
      const wrapper = r.closest('[data-element-type]') || r.parentElement
      const label = wrapper?.querySelector('.geems-label')?.textContent?.trim() || 'rating'
      const stars = r.querySelectorAll('.geems-star').length
      result.ratings.push({ label: label.substring(0, 80), max: stars })
    })
    const selects = [...document.querySelectorAll('select')].filter(s => s.offsetParent !== null && s.options.length > 1)
    for (const s of selects) {
      const options = [...s.options].map(o => o.text)
      result.dropdowns.push({ label: s.name || 'dropdown', options })
    }
    return result
  }) || { texts: [], radios: [], sliders: [], textfields: [], checkboxes: [], buttons: [], ratings: [], dropdowns: [] }
}

function logUI(label, ui) {
  console.log(`\n  📖 ${label} sees:`)
  for (const t of ui.texts) console.log(`     💬 "${t.substring(0, 200)}${t.length > 200 ? '...' : ''}"`)
  if (ui.radios.length > 0) {
    console.log(`     🔘 Radio:`)
    ui.radios.forEach((r, i) => console.log(`        ${i + 1}. ${r.label}`))
  }
  ui.sliders.forEach(s => console.log(`     🎚️  Slider: "${s.label}" (${s.min}-${s.max})`))
  ui.textfields.forEach(f => console.log(`     ✏️  Text: "${f.label}"`))
  ui.checkboxes.forEach(c => console.log(`     ☐ Check: "${c.label}" [${c.checked ? '✓' : '✗'}]`))
  if (ui.buttons.length > 0) console.log(`     🔲 Buttons: ${ui.buttons.join(' | ')}`)
  ui.ratings.forEach(r => console.log(`     ⭐ Rating: "${r.label}" (max ${r.max})`))
  ui.dropdowns.forEach(d => console.log(`     📋 Dropdown: "${d.label}" (${d.options.length} options)`))
}

// ════════════════════════════════════════════════════════════════════════════
// INTERACTION
// ════════════════════════════════════════════════════════════════════════════

async function interactOneByOne(page, turn, character, ui) {
  const log = []
  const phase = turn % 3
  const char = CHARACTERS[character]

  // 1. TEXTFIELDS
  for (let i = 0; i < ui.textfields.length; i++) {
    const tf = ui.textfields[i]
    const text = char.pickText(phase, tf.label, tf.placeholder, ui.texts)
    const wrote = await safeEval(page, (text, idx) => {
      const fields = [...document.querySelectorAll('textarea, input[type="text"]')].filter(f => f.offsetParent !== null && !f.disabled)
      const f = fields[idx]
      if (!f) return null
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set ||
                     Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
      if (setter) setter.call(f, text); else f.value = text
      f.dispatchEvent(new Event('input', { bubbles: true }))
      f.dispatchEvent(new Event('change', { bubbles: true }))
      return text
    }, text, i)
    if (wrote) log.push(`✏️  "${wrote.substring(0, 100)}${wrote.length > 100 ? '...' : ''}"`)
    await sleep(1200)
  }

  // 2. SLIDERS
  for (let i = 0; i < ui.sliders.length; i++) {
    const s = ui.sliders[i]
    const val = char.pickSlider(phase, s.label, parseInt(s.min) || 0, parseInt(s.max) || 100)
    await safeEval(page, (val, idx) => {
      const sliders = [...document.querySelectorAll('input[type="range"]')].filter(s => s.offsetParent !== null)
      const s = sliders[idx]
      if (!s) return
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
      if (setter) setter.call(s, String(val)); else s.value = String(val)
      s.dispatchEvent(new Event('input', { bubbles: true }))
      s.dispatchEvent(new Event('change', { bubbles: true }))
    }, val, i)
    log.push(`🎚️  "${s.label}": ${val}/${s.max}`)
    await sleep(800)
  }

  // 3. CHECKBOXES
  for (let i = 0; i < ui.checkboxes.length; i++) {
    const c = ui.checkboxes[i]
    const shouldCheck = char.pickCheckbox(phase, c.label)
    await safeEval(page, (shouldCheck, idx) => {
      const boxes = [...document.querySelectorAll('input[type="checkbox"]')].filter(c => c.offsetParent !== null)
      const box = boxes[idx]
      if (!box) return
      if (shouldCheck && !box.checked) box.click()
      if (!shouldCheck && box.checked) box.click()
    }, shouldCheck, i)
    log.push(`☑️  "${c.label}": ${shouldCheck ? '✓' : '✗'}`)
    await sleep(600)
  }

  // 4. RATINGS
  for (let i = 0; i < ui.ratings.length; i++) {
    const r = ui.ratings[i]
    const starVal = char.pickRating(phase, r.max)
    await safeEval(page, (starIdx, ratingIdx) => {
      const ratings = document.querySelectorAll('.geems-rating')
      const rating = ratings[ratingIdx]
      if (!rating) return
      const stars = rating.querySelectorAll('.geems-star')
      if (stars[starIdx]) stars[starIdx].click()
    }, Math.max(0, starVal - 1), i)
    log.push(`⭐ "${r.label}": ${starVal}/${r.max}`)
    await sleep(600)
  }

  // 5. BUTTON GROUPS
  if (ui.buttons.length > 0) {
    const btnLabel = char.pickButton(phase, ui.buttons)
    const result = await safeEval(page, (targetLabel) => {
      const buttons = document.querySelectorAll('.geems-group-btn')
      for (const b of buttons) {
        if (b.textContent.trim() === targetLabel) { b.click(); return b.textContent.trim() }
      }
      if (buttons[0]) { buttons[0].click(); return buttons[0].textContent.trim() }
      return null
    }, btnLabel)
    if (result) log.push(`🔲 "${result}"`)
    await sleep(800)
  }

  // 6. DROPDOWNS
  if (ui.dropdowns.length > 0) {
    await safeEval(page, (phase) => {
      const selects = [...document.querySelectorAll('select')].filter(s => s.offsetParent !== null && s.options.length > 1)
      for (const s of selects) {
        const idx = phase === 0 ? 0 : phase === 1 ? s.options.length - 1 : Math.floor(s.options.length / 2)
        s.selectedIndex = idx
        s.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }, phase)
    for (const d of ui.dropdowns) log.push(`📋 Dropdown: "${d.label}"`)
    await sleep(600)
  }

  // 7. RADIO (always last — main choice)
  if (ui.radios.length > 0) {
    const radioLabel = char.pickRadio(phase, ui.radios)
    const result = await safeEval(page, (targetLabel) => {
      const radios = document.querySelectorAll('.geems-radio-option')
      for (const r of radios) {
        if (r.textContent.trim() === targetLabel) {
          const input = r.querySelector('input[type="radio"]')
          if (input && !input.checked) input.click()
          return r.textContent.trim()
        }
      }
      if (radios[0]) {
        const input = radios[0].querySelector('input[type="radio"]')
        if (input) input.click()
        return radios[0].textContent.trim()
      }
      return null
    }, radioLabel)
    if (result) log.push(`🔘 "${result}"`)
    await sleep(1000)
  }

  return log
}

// ════════════════════════════════════════════════════════════════════════════
// ANALYSIS EXTRACTION
// ════════════════════════════════════════════════════════════════════════════

async function extractAnalysis(page) {
  return await safeEval(page, () => {
    return new Promise((resolve) => {
      const req = indexedDB.open('geems_profiling')
      req.onerror = () => resolve({ error: 'Cannot open IndexedDB' })
      req.onsuccess = () => {
        const db = req.result
        if (!db.objectStoreNames.contains('analyses')) {
          resolve({ error: 'No analyses store' })
          return
        }
        const tx = db.transaction('analyses', 'readonly')
        const store = tx.objectStore('analyses')
        const getAll = store.getAll()
        getAll.onsuccess = () => {
          const analyses = getAll.result
          resolve({
            count: analyses.length,
            analyses: analyses.map(a => ({
              turnRange: a.turnRange,
              analyzedAt: a.analyzedAt,
              textLength: (a.analysisText || '').length,
              text: a.analysisText || '',
            })),
          })
        }
        getAll.onerror = () => resolve({ error: 'Failed to read' })
      }
    })
  })
}

async function waitForAnalysis(page, label) {
  console.log(`  ⏳ ${label}: Waiting for analysis pipeline...`)
  const start = Date.now()
  while (Date.now() - start < ANALYSIS_WAIT) {
    const result = await extractAnalysis(page)
    if (result && !result.error && result.count >= 1) {
      console.log(`  ✓ ${label}: ${result.count} analysis record(s) found`)
      return result
    }
    const elapsed = Math.round((Date.now() - start) / 1000)
    if (elapsed % 15 < 6) console.log(`    [${elapsed}s] Still waiting...`)
    await sleep(5000)
  }
  console.log(`  ⚠️  ${label}: Analysis timed out after ${Math.round(ANALYSIS_WAIT / 1000)}s`)
  return await extractAnalysis(page)
}

// ════════════════════════════════════════════════════════════════════════════
// CONSENT & NAVIGATION
// ════════════════════════════════════════════════════════════════════════════

async function dismissConsent(page) {
  await safeEval(page, () => {
    const overlay = document.querySelector('.consent-overlay')
    if (!overlay || getComputedStyle(overlay).display === 'none') return
    const btn = overlay.querySelector('button')
    if (btn) btn.click()
  })
  await sleep(500)
  await safeEval(page, () => {
    const o = document.querySelector('.consent-overlay')
    if (o && getComputedStyle(o).display !== 'none') o.remove()
    localStorage.setItem('geems_consent', 'true')
    localStorage.setItem('consent_accepted', 'true')
  })
}

// ════════════════════════════════════════════════════════════════════════════
// SINGLE MODE SIMULATION
// ════════════════════════════════════════════════════════════════════════════

async function simulateMode(modeId) {
  const char = CHARACTERS[modeId]
  if (!char) throw new Error(`Unknown mode: ${modeId}. Available: ${Object.keys(CHARACTERS).join(', ')}`)

  console.log('╔══════════════════════════════════════════════════════════════════╗')
  console.log(`║  ${char.modeName.toUpperCase()} — ${TOTAL_TURNS} TURNS`)
  console.log(`║  Character: ${char.illness} + ${char.quirk}`)
  console.log(`║  Phases: ${char.phaseLabels.join(' → ')}`)
  console.log('╚══════════════════════════════════════════════════════════════════╝')

  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1024, height: 768 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  })

  const page = await browser.newPage()
  const turnRecords = []

  try {
    // Navigate & dismiss consent
    console.log(`\n  Navigating to ${URL}...`)
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 })
    await sleep(3000)
    await dismissConsent(page)
    await sleep(1000)

    // Click the play button for this mode
    console.log(`  Starting ${char.modeName} mode...`)
    const clicked = await safeEval(page, (modeId) => {
      const btn = document.querySelector(`.play-btn[data-mode="${modeId}"]`)
      if (btn) { btn.click(); return true }
      return false
    }, modeId)

    if (!clicked) throw new Error(`Could not find play button for mode: ${modeId}`)

    // Wait for first turn to load (auto-submitted)
    console.log('  Waiting for first turn...')
    for (let i = 0; i < 60; i++) {
      const ready = await safeEval(page, () => {
        const elements = document.querySelectorAll('.geems-element')
        const submitBtn = document.querySelector('#submit-turn')
        return elements.length > 0 && submitBtn && !submitBtn.disabled
      })
      if (ready) break
      await sleep(3000)
    }
    console.log('  ✓ First turn loaded!\n')

    // ── PLAY TURNS ──
    for (let turn = 1; turn <= TOTAL_TURNS; turn++) {
      const phase = (turn - 1) % 3
      const phaseLabel = char.phaseLabels[phase]

      console.log(`${'━'.repeat(70)}`)
      console.log(`  TURN ${turn}/${TOTAL_TURNS} — ${phaseLabel}`)
      console.log(`${'━'.repeat(70)}`)

      const turnStart = Date.now()

      // Read UI
      const ui = await readUI(page)
      logUI(char.modeName, ui)

      // Take screenshot
      const ssPath = join(OUTPUT_DIR, `${modeId}-T${turn}.png`)
      await page.screenshot({ path: ssPath, fullPage: true })

      // Interact
      console.log(`\n  🎭 Interacting (${phaseLabel})...`)
      const actions = await interactOneByOne(page, turn - 1, modeId, ui)
      for (const a of actions) console.log(`     ${a}`)

      // Record
      turnRecords.push({ turn, phase: char.phases[phase], ui, actions })

      // Submit
      await sleep(2000)
      console.log('\n  📤 Submitting...')
      const submitted = await safeEval(page, () => {
        const btn = document.querySelector('#submit-turn')
        if (btn && !btn.disabled) { btn.click(); return true }
        // Fallback: look for any submit-like button
        const btns = document.querySelectorAll('button.geems-button')
        for (const b of btns) {
          if (!b.disabled && (b.textContent.includes('Submit') || b.textContent.includes('Continue') || b.textContent.includes('Next'))) {
            b.click(); return true
          }
        }
        return false
      })

      if (!submitted) {
        console.log('  ⚠️  Submit button not found/disabled — may be loading')
        await sleep(5000)
        await safeEval(page, () => {
          const btn = document.querySelector('#submit-turn')
          if (btn && !btn.disabled) btn.click()
        })
      }

      // Wait for next turn
      if (turn < TOTAL_TURNS) {
        console.log('  ⏳ Waiting for next turn...')
        let done = false
        while (!done && Date.now() - turnStart < TURN_TIMEOUT) {
          const state = await safeEval(page, () => {
            const interstitial = document.querySelector('.interstitial-overlay.interstitial-visible')
            const submitBtn = document.querySelector('#submit-turn')
            const status = document.querySelector('#interstitial-status')?.textContent || ''
            return { interstitialVisible: !!interstitial, submitEnabled: submitBtn ? !submitBtn.disabled : false, status }
          })

          if (state && !state.interstitialVisible && state.submitEnabled && Date.now() - turnStart > 5000) {
            done = true
          } else if (state?.status && Date.now() - turnStart > 10000) {
            const elapsed = Math.round((Date.now() - turnStart) / 1000)
            if (elapsed % 15 < 4) console.log(`    [${elapsed}s] ${state.status}`)
          }

          if (!done) await sleep(3000)
        }

        const turnTime = Math.round((Date.now() - turnStart) / 1000)
        if (!done) {
          console.log(`  ⚠️  Turn ${turn} TIMEOUT (${turnTime}s)`)
        } else {
          console.log(`  ✓ Turn ${turn} complete (${turnTime}s)`)
        }
      }
    }

    // ── EXTRACT ANALYSIS ──
    console.log('\n══════ EXTRACTING ANALYSIS ══════')
    // Give analysis pipeline extra time to run after last turn
    await sleep(10000)
    const analysis = await waitForAnalysis(page, char.modeName)

    // ── SAVE RESULTS ──
    const output = {
      mode: modeId,
      modeName: char.modeName,
      character: { illness: char.illness, quirk: char.quirk },
      turnsPlayed: TOTAL_TURNS,
      timestamp: new Date().toISOString(),
      turns: turnRecords,
      analysis: {
        count: analysis?.count || 0,
        analyses: analysis?.analyses || [],
      },
    }

    const outputPath = join(OUTPUT_DIR, `${modeId}-analysis.json`)
    writeFileSync(outputPath, JSON.stringify(output, null, 2))
    console.log(`\n  💾 Saved to ${outputPath}`)

    // Print analysis summary
    if (analysis?.analyses?.length > 0) {
      const latest = analysis.analyses[analysis.analyses.length - 1]
      console.log(`\n  ── Analysis Summary (${latest.turnRange}) ──`)
      console.log(latest.text.substring(0, 3000))
      if (latest.text.length > 3000) console.log('  ...[truncated]')
    } else {
      console.log('\n  ⚠️  No analysis was generated during this session')
    }

    // Take final screenshot
    await page.screenshot({ path: join(OUTPUT_DIR, `${modeId}-FINAL.png`), fullPage: true })

    console.log(`\n  ✓ ${char.modeName} simulation complete!`)
    return output

  } catch (err) {
    console.error(`\n  ❌ FATAL: ${err.message}`)
    console.error(err.stack)
    await page.screenshot({ path: join(OUTPUT_DIR, `${modeId}-ERROR.png`), fullPage: true }).catch(() => {})
    throw err
  } finally {
    await browser.close()
  }
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════════════════

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true })

  const args = process.argv.slice(2)
  const modeArg = args[0] || 'drevil'
  const parallel = args.includes('--parallel')

  if (modeArg === 'all') {
    const modes = Object.keys(CHARACTERS)
    console.log(`\n  Running ALL ${modes.length} modes (${parallel ? 'parallel (2 at a time)' : 'sequential'})...\n`)

    const results = []

    if (parallel) {
      // Run 2 at a time to avoid API rate limits
      for (let i = 0; i < modes.length; i += 2) {
        const batch = modes.slice(i, i + 2)
        console.log(`\n${'═'.repeat(70)}`)
        console.log(`  BATCH ${Math.floor(i / 2) + 1}: ${batch.join(' + ')}`)
        console.log(`${'═'.repeat(70)}\n`)

        const batchResults = await Promise.allSettled(batch.map(m => simulateMode(m)))
        for (let j = 0; j < batch.length; j++) {
          const r = batchResults[j]
          if (r.status === 'fulfilled') {
            results.push(r.value)
            console.log(`  ✓ ${batch[j]} completed`)
          } else {
            console.error(`  ❌ ${batch[j]} failed: ${r.reason?.message}`)
            results.push({ mode: batch[j], error: r.reason?.message })
          }
        }
      }
    } else {
      for (const mode of modes) {
        console.log(`\n${'═'.repeat(70)}`)
        console.log(`  MODE: ${mode}`)
        console.log(`${'═'.repeat(70)}\n`)
        try {
          results.push(await simulateMode(mode))
        } catch (err) {
          console.error(`  ❌ ${mode} failed: ${err.message}`)
          results.push({ mode, error: err.message })
        }
      }
    }

    // Summary
    const summaryPath = join(OUTPUT_DIR, 'all-modes-summary.json')
    writeFileSync(summaryPath, JSON.stringify({
      totalModes: modes.length,
      completed: results.filter(r => !r.error).length,
      failed: results.filter(r => r.error).length,
      timestamp: new Date().toISOString(),
      results: results.map(r => ({
        mode: r.mode,
        modeName: r.modeName,
        character: r.character,
        turnsPlayed: r.turnsPlayed,
        analysisCount: r.analysis?.count || 0,
        error: r.error || null,
      })),
    }, null, 2))
    console.log(`\n  📊 Summary saved to ${summaryPath}`)

  } else {
    await simulateMode(modeArg)
  }
}

main().catch(err => {
  console.error(`FATAL: ${err.message}`)
  process.exit(1)
})
