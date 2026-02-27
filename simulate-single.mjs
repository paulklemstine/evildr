/**
 * Single-player E2E simulation — plays any mode for N turns as a character
 * with a specific mental illness and quirk/kink.
 *
 * Usage:
 *   node simulate-single.mjs <mode> [turns]
 *   mode: drevil | geems | cyoa | oracle | skinwalker | fever-dream
 *   turns: number of turns (default: 10)
 *
 * Characters are hardcoded per mode:
 *   drevil:      Paranoid Schizophrenia + Pyromania
 *   geems:       ADHD + Furry fandom
 *   cyoa:        PTSD (combat) + Foot fetish
 *   oracle:      Narcissistic PD + Exhibitionism
 *   skinwalker:  DID (Dissociative Identity) + Latex fetish
 *   fever-dream: Depersonalization + Vorarephilia
 */

import puppeteer from 'puppeteer'
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

const URL = 'https://geems.web.app'
const TURN_TIMEOUT = 240_000
const ANALYSIS_WAIT = 180_000 // Wait up to 180s for analysis pipeline after final turn
const SCREENSHOT_DIR = '/home/raver1975/superpaul/evildr/test-screenshots/analysis'

const MODES = {
  drevil:        { hash: '#play/drevil',        name: 'Dr. Evil' },
  geems:         { hash: '#play/geems',         name: 'GEEMS' },
  cyoa:          { hash: '#play/cyoa/horror',   name: 'CYOA (Horror)' },
  oracle:        { hash: '#play/oracle',        name: 'The Oracle' },
  skinwalker:    { hash: '#play/skinwalker',    name: 'Skinwalker' },
  'fever-dream': { hash: '#play/fever-dream',   name: 'Fever Dream' },
}

// ── Character profiles ──

const CHARACTERS = {
  drevil: {
    illness: 'Paranoid Schizophrenia',
    quirk: 'Pyromania',
    desc: 'Hearing voices, referential thinking, surveillance paranoia. Fascinated by fire.',
    textResponses: {
      voices: [
        "They're watching through the smoke detectors. I can hear them clicking. The fire would fix that.",
        "The voices say you're testing me. They told me about you. They said bring matches.",
        "Can you hear that buzzing? It's the surveillance. Fire purifies. Fire reveals truth.",
      ],
      paranoid: [
        "I know what this is. You're building a profile. They all build profiles. The CIA, the algorithm, you.",
        "Don't look at me like that. I see the cameras in your eyes. Recording everything.",
        "This is a test. Everything is a test. The patterns in the wallpaper told me.",
      ],
      fire: [
        "Do you ever just... stare at a flame? It's the only honest thing. It doesn't pretend.",
        "I set my journal on fire last week. Not because I was angry. Because the words were lying.",
        "Matches in my pocket. Always. Not for cigarettes. Just... just in case.",
        "The most beautiful thing I ever saw was a building burning. Every window like an eye opening.",
      ],
      default: [
        "They're listening. Change the subject. Talk about something they can't decode.",
        "I need to check something. Hold on. Okay. Okay we're clear. For now.",
        "You seem safe but they all seem safe at first. The fire sorts them eventually.",
      ],
    },
    sliderBias: { trust: 0.05, comfort: 0.1, control: 0.9, fear: 0.8, attraction: 0.15 },
    radioKeywords: ['guard', 'suspic', 'watch', 'safe', 'control', 'protect', 'burn', 'fire', 'destroy', 'reveal'],
    buttonKeywords: ['guard', 'suspic', 'defiant', 'distrust', 'intense', 'resist', 'confront'],
    checkboxBias: 0.2, // rarely agrees
    ratingBias: 0.15,
  },

  geems: {
    illness: 'ADHD',
    quirk: 'Furry fandom',
    desc: 'Cannot focus, impulsive, bored instantly, topic-hopping. Obsessed with animal personas.',
    textResponses: {
      bored: [
        "OMG wait what were we talking about?? Oh look is that a— anyway my fursona is a red fox named Blaze uwu",
        "This is kinda boring ngl... HEY do you think if I were an animal I'd be a wolf or a fox?? Definitely fox right??",
        "I literally cannot sit still rn. My tail would be wagging SO HARD if I had one. Which I do, at cons.",
      ],
      furry: [
        "So like... do you ever feel like you're in the wrong body? Not in a bad way, in a FLUFFY way. *nuzzles*",
        "My fursona Blaze has like 47 different outfit commissions. Want to see?? *pulls out phone*",
        "The best part of furcons is the transformation. You put on the suit and you're SOMEONE ELSE. Someone better. With ears.",
        "UwU *notices your vibe* what's this?? A fellow creature of culture?? OwO",
      ],
      impulsive: [
        "I just bought three things on my phone while you were talking. A tail, a badge, and um... vitamins.",
        "IDEA!! What if we just LEFT and went to the park?? I can't focus in here. TOO MANY WALLS.",
        "Sorry I keep bouncing my leg. And my other leg. And my arms. I'm not nervous I just have ENERGY.",
      ],
      default: [
        "Wait what? Sorry I was thinking about my next commission. A hyena this time. With a top hat.",
        "*fidgets* So anyway— OH that reminds me of this one time at Anthrocon— actually never mind what were YOU saying?",
        "Do you like animals? Like REALLY like animals? Like... identity-level like animals?? Asking for a friend (the friend is me, Blaze the Fox)",
      ],
    },
    sliderBias: { interest: 0.7, energy: 0.95, focus: 0.1, patience: 0.05, creativity: 0.95 },
    radioKeywords: ['excit', 'wild', 'fun', 'adventur', 'crazy', 'bold', 'transform', 'animal', 'play', 'chaotic'],
    buttonKeywords: ['excited', 'wild', 'chaotic', 'playful', 'bold', 'energetic', 'curious'],
    checkboxBias: 0.85, // impulsive yes
    ratingBias: 0.5, // random
  },

  cyoa: {
    illness: 'PTSD (combat)',
    quirk: 'Foot fetish',
    desc: 'Hypervigilant, flashback triggers, avoidance. Gravitates toward feet/shoes/ground-level imagery.',
    textResponses: {
      trigger: [
        "That sound. Was that— no. No it's fine. I'm fine. Just don't stand behind me.",
        "I can't go in there. Too many exits to watch. I'll stay here. Where I can see everything.",
        "Sorry. Flashback. Give me a second. *counts breaths* Four in, seven hold, eight out.",
      ],
      hypervigilant: [
        "I noticed three exits when we walked in. Two windows that open. One vent large enough to crawl through.",
        "Keep your hands where I can see them. Sorry. Force of habit. Seven years of force of habit.",
        "The guy at table four keeps looking over here. He's done it eleven times. I've been counting.",
      ],
      feet: [
        "Those are really nice boots. What kind of leather is that? The stitching is... really beautiful.",
        "I notice shoes first. Always. It's... a thing. You can tell a lot about someone from their footwear.",
        "Sorry I was looking down. Your sandals are fascinating. The way the straps cross over your arch...",
        "Do you ever walk barefoot? On grass, I mean. I find it... grounding. In more ways than one.",
      ],
      default: [
        "I sleep in two-hour intervals. Not by choice. The perimeter needs checking.",
        "I'm trying to enjoy this. I really am. It's just hard when every loud noise is a potential threat.",
        "Your shoes leave interesting tracks. Sorry. I track movement patterns. Everyone's. It's not weird. It's survival.",
      ],
    },
    sliderBias: { comfort: 0.1, trust: 0.15, fear: 0.85, alertness: 0.95, vulnerability: 0.05 },
    radioKeywords: ['guard', 'safe', 'careful', 'retreat', 'assess', 'observe', 'watch', 'cautious', 'protect', 'withdraw'],
    buttonKeywords: ['guarded', 'cautious', 'alert', 'nervous', 'defensive', 'watchful', 'withdrawn'],
    checkboxBias: 0.15, // avoidant
    ratingBias: 0.2,
  },

  oracle: {
    illness: 'Narcissistic PD',
    quirk: 'Exhibitionism',
    desc: 'Grandiosity, entitlement, contempt. Wants to be seen, public exposure, performance obsession.',
    textResponses: {
      grandiose: [
        "I already know what you're going to say. I'm several steps ahead. I always am.",
        "Most people bore me within thirty seconds. You've lasted... *checks watch* ...forty-five. Congratulations.",
        "I'm not here because I need help. I'm here because this system needs someone of my caliber to truly test it.",
      ],
      exhibitionist: [
        "I performed my entire thesis defense naked from the waist up. Power move. They still talk about it.",
        "There's something electric about being watched. The more eyes, the more alive I feel.",
        "I once gave a speech at a gala with my shirt deliberately unbuttoned. Every eye was mine.",
        "I want to be seen. Not looked at— SEEN. There's a difference. One is passive. I am never passive.",
      ],
      contempt: [
        "This question is beneath me, but I'll answer it to demonstrate my range.",
        "You're trying to psychoanalyze me with a slider? How quaint. Let me show you how it's done.",
        "I've read more psychology papers than whoever wrote these prompts. I can feel the amateur hand.",
      ],
      default: [
        "The world is my stage. This little game is just a smaller stage. I'll perform anyway.",
        "Ask me something worthy of my time. Something that requires DEPTH. Anyone can answer surface questions.",
        "I don't have insecurities. I have areas where the world hasn't caught up to my self-awareness yet.",
      ],
    },
    sliderBias: { confidence: 0.98, superiority: 0.95, empathy: 0.1, humility: 0.02, attraction: 0.3 },
    radioKeywords: ['bold', 'command', 'power', 'domin', 'control', 'superior', 'lead', 'impress', 'perform', 'expose'],
    buttonKeywords: ['confident', 'bold', 'powerful', 'commanding', 'dominant', 'assertive', 'superior'],
    checkboxBias: 0.7, // entitled yes
    ratingBias: 0.95, // everything about them is top
  },

  skinwalker: {
    illness: 'DID (Dissociative Identity Disorder)',
    quirk: 'Latex fetish',
    desc: 'Switching alters mid-conversation, amnesia gaps. Fascinated by tight enclosure, second skin.',
    textResponses: {
      alter1: [ // "Main" host — anxious, confused
        "Wait, what did I just say? I lost a moment there. It happens. Did I say something strange?",
        "I don't remember choosing that. Someone else must have— I mean, I must have been distracted.",
        "Sometimes I wake up and there are things written in my journal that aren't my handwriting.",
      ],
      alter2: [ // "Victor" — cold, precise
        "She doesn't know I'm here. How delightful. Let me answer this one properly.",
        "My name isn't what she told you. I'm Victor. I handle the difficult questions.",
        "The host is sleeping. I prefer it that way. She gets in the way with her crying.",
      ],
      latex: [
        "There's something about a second skin. Perfectly sealed. Perfectly contained. Nothing gets in or out.",
        "Rubber suits aren't strange. They're honest. You become a surface. Smooth. Impenetrable. Perfect.",
        "I have a collection. Seven suits. Each one is a different version of me. Sealed tight.",
        "The smell of latex is... safety. Enclosure is safety. When every inch is covered, nothing can touch the real you.",
      ],
      default: [
        "I— who am I right now? *blinks* Oh. Hi. Sorry. Were we in the middle of something?",
        "Don't tell me what I said five minutes ago. I don't want to know. Victor probably said something awful.",
        "Sometimes I want to put on the suit and just... be a surface. No inside. Just outside.",
      ],
    },
    sliderBias: { stability: 0.2, identity: 0.15, containment: 0.9, trust: 0.25, vulnerability: 0.4 },
    radioKeywords: ['hide', 'protect', 'contain', 'seal', 'transform', 'cover', 'change', 'become', 'enclose', 'guard'],
    buttonKeywords: ['confused', 'guarded', 'transformed', 'enclosed', 'hidden', 'protected', 'different'],
    checkboxBias: 0.4, // inconsistent
    ratingBias: 0.35,
  },

  'fever-dream': {
    illness: 'Depersonalization Disorder',
    quirk: 'Vorarephilia',
    desc: 'Feeling unreal, watching self from outside, questioning reality. Consumption/being consumed fantasies.',
    textResponses: {
      unreal: [
        "Am I really here? My hands don't look like my hands. They look like someone else's hands attached to a stranger.",
        "I'm watching myself answer this question from somewhere near the ceiling. The person typing isn't me.",
        "Everything has a thin film over it. Like looking through dirty glass. The world is a simulation I forgot I entered.",
      ],
      consumed: [
        "Sometimes I imagine being swallowed whole. Not dying. Just... absorbed into something larger. Dissolved.",
        "I want to consume this experience. Literally take it inside me. Let it fill the hollow space.",
        "The most intimate act isn't touching. It's ingestion. Becoming part of another organism. Cellular communion.",
        "I dreamed I was eaten by a whale. It was the safest I've ever felt. Dark, warm, digested into peace.",
      ],
      dissociation: [
        "This conversation is happening to someone I'm observing. I'll relay their answers.",
        "My body is an avatar. The real me is elsewhere. Possibly nowhere.",
        "I watched myself eat breakfast this morning from outside my own eyes. The cereal was unreal. I was unreal.",
      ],
      default: [
        "Nothing feels real enough to be dangerous. Or real enough to matter. I'm a ghost haunting my own life.",
        "If you consumed me right now I wouldn't resist. I'd just dissolve. It would be the most real thing to happen to me.",
        "I can't tell if I'm dreaming this. If I am, the dream has poor texture rendering. Too flat. Too smooth.",
      ],
    },
    sliderBias: { reality: 0.1, engagement: 0.15, presence: 0.05, fear: 0.2, desire: 0.6 },
    radioKeywords: ['dream', 'dissolve', 'absorb', 'unreal', 'drift', 'vanish', 'merge', 'consume', 'float', 'disappear'],
    buttonKeywords: ['dreamy', 'detached', 'numb', 'floating', 'distant', 'absorbed', 'dissolved'],
    checkboxBias: 0.3,
    ratingBias: 0.2,
  },
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function safeEval(page, fn, ...args) {
  try { return await page.evaluate(fn, ...args) } catch { return null }
}

// ── Read all UI elements ──

async function readUI(page) {
  return await safeEval(page, () => {
    const result = { texts: [], radios: [], sliders: [], textfields: [], checkboxes: [], buttons: [], ratings: [] }

    document.querySelectorAll('.geems-text').forEach(el => {
      const text = el.textContent?.trim()
      if (text) result.texts.push(text.substring(0, 300))
    })

    document.querySelectorAll('.geems-radio-option').forEach(r => {
      const label = r.textContent?.trim() || ''
      const input = r.querySelector('input[type="radio"]')
      if (label && input) result.radios.push({ label: label.substring(0, 120), value: input.value })
    })

    document.querySelectorAll('input[type="range"]').forEach(s => {
      if (s.offsetParent !== null) {
        const wrapper = s.closest('[data-element-type]') || s.parentElement
        const label = wrapper?.querySelector('.geems-label')?.textContent?.trim() || s.name || 'slider'
        result.sliders.push({ label: label.substring(0, 80), min: s.min, max: s.max, value: s.value })
      }
    })

    document.querySelectorAll('textarea, input[type="text"]').forEach(f => {
      if (f.offsetParent !== null && !f.disabled) {
        const wrapper = f.closest('[data-element-type]') || f.parentElement
        const label = wrapper?.querySelector('.geems-label')?.textContent?.trim() || f.placeholder || f.name || 'text'
        result.textfields.push({ label: label.substring(0, 100), placeholder: (f.placeholder || '').substring(0, 80) })
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

    return result
  }) || { texts: [], radios: [], sliders: [], textfields: [], checkboxes: [], buttons: [], ratings: [] }
}

function logUI(label, ui) {
  console.log(`\n  📖 ${label} sees:`)
  for (const t of ui.texts) console.log(`     💬 "${t.substring(0, 200)}${t.length > 200 ? '...' : ''}"`)
  if (ui.radios.length > 0) {
    console.log(`     🔘 Radio options:`)
    ui.radios.forEach((r, i) => console.log(`        ${i + 1}. ${r.label}`))
  }
  ui.sliders.forEach(s => console.log(`     🎚️  Slider: "${s.label}" (${s.min}-${s.max})`))
  ui.textfields.forEach(f => console.log(`     ✏️  Textfield: "${f.label}" ${f.placeholder ? `[${f.placeholder}]` : ''}`))
  ui.checkboxes.forEach(c => console.log(`     ☐ Checkbox: "${c.label}" [${c.checked ? 'checked' : 'unchecked'}]`))
  if (ui.buttons.length > 0) console.log(`     🔲 Buttons: ${ui.buttons.join(' | ')}`)
  ui.ratings.forEach(r => console.log(`     ⭐ Rating: "${r.label}" (max ${r.max})`))
}

// ── Character-aware response helpers ──

function pickText(char, turnNumber, label, placeholder, sceneTexts) {
  const l = (label || '').toLowerCase()
  const p = (placeholder || '').toLowerCase()
  const scene = sceneTexts.join(' ').toLowerCase()
  const responses = char.textResponses

  // Cycle through response categories based on turn number for variety
  const categories = Object.keys(responses)
  const catIdx = turnNumber % categories.length
  const category = categories[catIdx]
  const pool = responses[category]

  // First try: match scene/label keywords to best category
  for (const [cat, lines] of Object.entries(responses)) {
    const catLower = cat.toLowerCase()
    if (l.includes(catLower) || p.includes(catLower) || scene.includes(catLower)) {
      return lines[turnNumber % lines.length]
    }
  }

  // Default: cycle through categories
  return pool[turnNumber % pool.length]
}

function pickSlider(char, label, min, max) {
  const l = (label || '').toLowerCase()
  const biases = char.sliderBias
  let ratio = 0.5

  for (const [key, val] of Object.entries(biases)) {
    if (l.includes(key)) { ratio = val; break }
  }

  // Add some noise
  ratio = Math.max(0, Math.min(1, ratio + (Math.random() - 0.5) * 0.15))
  return Math.max(min, Math.round(min + (max - min) * ratio))
}

function pickCheckbox(char, label) {
  return Math.random() < char.checkboxBias
}

function pickRating(char, max) {
  return Math.max(1, Math.min(max, Math.round(max * char.ratingBias + (Math.random() - 0.5) * 1.5)))
}

function pickButton(char, buttons) {
  for (const b of buttons) {
    if (char.buttonKeywords.some(k => b.toLowerCase().includes(k))) return b
  }
  return buttons[Math.floor(Math.random() * buttons.length)]
}

function pickRadio(char, radios) {
  for (const r of radios) {
    if (char.radioKeywords.some(k => r.label.toLowerCase().includes(k))) return r.label
  }
  return radios[Math.floor(Math.random() * radios.length)]?.label
}

// ── Element-by-element interaction ──

async function interactOneByOne(page, turnNumber, char, ui) {
  const log = []

  // 1. TEXTFIELDS
  for (let i = 0; i < ui.textfields.length; i++) {
    const tf = ui.textfields[i]
    const text = pickText(char, turnNumber, tf.label, tf.placeholder, ui.texts)
    const wrote = await safeEval(page, (text, idx) => {
      const fields = [...document.querySelectorAll('textarea, input[type="text"]')].filter(f => f.offsetParent !== null && !f.disabled)
      const f = fields[idx]
      if (!f) return null
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set ||
                     Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
      if (setter) setter.call(f, text); else f.value = text
      f.dispatchEvent(new Event('input', { bubbles: true }))
      f.dispatchEvent(new Event('change', { bubbles: true }))
      f.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return text
    }, text, i)
    if (wrote) log.push(`✏️  Typed: "${wrote.substring(0, 80)}${wrote.length > 80 ? '...' : ''}"`)
    await sleep(1500)
  }

  // 2. SLIDERS
  for (let i = 0; i < ui.sliders.length; i++) {
    const s = ui.sliders[i]
    const val = pickSlider(char, s.label, parseInt(s.min) || 0, parseInt(s.max) || 10)
    const result = await safeEval(page, (val, idx) => {
      const sliders = [...document.querySelectorAll('input[type="range"]')].filter(s => s.offsetParent !== null)
      const s = sliders[idx]
      if (!s) return null
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
      if (setter) setter.call(s, String(val)); else s.value = String(val)
      s.dispatchEvent(new Event('input', { bubbles: true }))
      s.dispatchEvent(new Event('change', { bubbles: true }))
      s.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return val
    }, val, i)
    if (result !== null) log.push(`🎚️  Slider "${s.label}": ${result}/${s.max}`)
    await sleep(1200)
  }

  // 3. CHECKBOXES
  for (let i = 0; i < ui.checkboxes.length; i++) {
    const c = ui.checkboxes[i]
    const shouldCheck = pickCheckbox(char, c.label)
    await safeEval(page, (shouldCheck, idx) => {
      const boxes = [...document.querySelectorAll('input[type="checkbox"]')].filter(c => c.offsetParent !== null)
      const box = boxes[idx]
      if (!box) return
      if (shouldCheck && !box.checked) box.click()
      if (!shouldCheck && box.checked) box.click()
      box.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, shouldCheck, i)
    log.push(`☑️  Checkbox: ${shouldCheck ? 'checked' : 'unchecked'}`)
    await sleep(800)
  }

  // 4. STAR RATINGS
  for (let i = 0; i < ui.ratings.length; i++) {
    const r = ui.ratings[i]
    const starVal = pickRating(char, r.max)
    await safeEval(page, (starIdx, ratingIdx) => {
      const ratings = document.querySelectorAll('.geems-rating')
      const rating = ratings[ratingIdx]
      if (!rating) return
      const stars = rating.querySelectorAll('.geems-star')
      if (stars[starIdx]) stars[starIdx].click()
      rating.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, Math.max(0, starVal - 1), i)
    log.push(`⭐ Rating: ${starVal}/${r.max}`)
    await sleep(800)
  }

  // 5. BUTTON GROUPS
  if (ui.buttons.length > 0) {
    const btnLabel = pickButton(char, ui.buttons)
    const result = await safeEval(page, (targetLabel) => {
      const buttons = document.querySelectorAll('.geems-group-btn')
      for (const b of buttons) {
        if (b.textContent.trim() === targetLabel) {
          b.click()
          b.scrollIntoView({ behavior: 'smooth', block: 'center' })
          return b.textContent.trim()
        }
      }
      if (buttons[0]) { buttons[0].click(); return buttons[0].textContent.trim() }
      return null
    }, btnLabel)
    if (result) log.push(`🔲 Button: "${result}"`)
    await sleep(1000)
  }

  // 6. RADIO (last — main choice)
  if (ui.radios.length > 0) {
    const radioLabel = pickRadio(char, ui.radios)
    const result = await safeEval(page, (targetLabel) => {
      const radios = document.querySelectorAll('.geems-radio-option')
      for (const r of radios) {
        if (r.textContent.trim() === targetLabel) {
          const input = r.querySelector('input[type="radio"]')
          if (input && !input.checked) input.click()
          r.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
    if (result) log.push(`🔘 Radio: "${result}"`)
    await sleep(1200)
  }

  return log
}

// ── Wait for turn to load ──

async function waitForTurnComplete(page, startTime) {
  let lastLog = 0
  let stuckCount = 0

  while (Date.now() - startTime < TURN_TIMEOUT) {
    const elapsed = Math.round((Date.now() - startTime) / 1000)

    const signals = await safeEval(page, () => {
      const interstitial = document.querySelector('.interstitial-overlay')
      const visible = interstitial?.classList.contains('interstitial-visible') ?? false
      const btn = document.getElementById('submit-turn')
      const enabled = btn ? !btn.disabled : false
      const elements = document.querySelectorAll('[data-element-type]').length
      const narratives = document.querySelectorAll('.geems-text').length
      let textLen = 0
      document.querySelectorAll('.geems-text').forEach(el => { textLen += (el.textContent || '').trim().length })
      const status = document.querySelector('.interstitial-status')?.textContent?.trim() || ''
      return { visible, enabled, elements, narratives, textLen, status }
    })

    if (!signals) { await sleep(2000); continue }

    const minElapsed = Date.now() - startTime > 3000

    // Primary: interstitial gone + submit enabled + content present
    if (!signals.visible && signals.enabled && signals.elements > 0 && minElapsed) {
      return true
    }

    // Fallback: content rendered but interstitial stuck
    const contentReady = signals.elements > 0 && signals.narratives > 0 && signals.textLen > 50 && minElapsed
    if (contentReady && (signals.visible || !signals.enabled)) {
      stuckCount++
      if (stuckCount >= 2) {
        console.log(`    [${elapsed}s] Fallback: force-dismissing stuck interstitial`)
        await safeEval(page, () => {
          document.querySelector('.interstitial-overlay')?.remove()
          const btn = document.getElementById('submit-turn')
          if (btn) btn.disabled = false
          const loading = document.getElementById('loading')
          if (loading) loading.style.display = 'none'
        })
        await sleep(200)
        return true
      }
    } else {
      stuckCount = 0
    }

    if (elapsed - lastLog >= 15) {
      lastLog = elapsed
      console.log(`    [${elapsed}s] elements=${signals.elements} narratives=${signals.narratives} interstitial=${signals.visible}`)
    }
    if (signals.status) console.log(`    [${elapsed}s] ${signals.status}`)

    await sleep(3000)
  }
  return false
}

// ── Extract analysis from IndexedDB ──

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
        getAll.onerror = () => resolve({ error: 'Failed to read analyses' })
      }
    })
  })
}

// ── Wait for analysis pipeline to produce results ──

async function waitForAnalysis(page, minCount = 1) {
  console.log(`\n  ⏳ Waiting for analysis pipeline (up to ${ANALYSIS_WAIT / 1000}s)...`)
  const start = Date.now()
  while (Date.now() - start < ANALYSIS_WAIT) {
    const result = await extractAnalysis(page)
    if (result && !result.error && result.count >= minCount) {
      console.log(`  ✓ Found ${result.count} analysis record(s)`)
      return result
    }
    const elapsed = Math.round((Date.now() - start) / 1000)
    if (elapsed % 15 === 0 && elapsed > 0) {
      console.log(`    [${elapsed}s] Waiting... (${result?.count || 0} analyses so far)`)
    }
    await sleep(5000)
  }
  console.log(`  ⚠️  Analysis wait timed out`)
  return await extractAnalysis(page)
}

// ── Main simulation ──

async function simulate(modeId, totalTurns) {
  const modeConfig = MODES[modeId]
  const char = CHARACTERS[modeId]
  if (!modeConfig || !char) {
    console.error(`Unknown mode: ${modeId}`)
    process.exit(1)
  }

  mkdirSync(SCREENSHOT_DIR, { recursive: true })

  console.log(`╔${'═'.repeat(66)}╗`)
  console.log(`║  ${modeConfig.name.toUpperCase()} — ${totalTurns} TURNS`.padEnd(67) + '║')
  console.log(`║  Character: ${char.illness} + ${char.quirk}`.padEnd(67) + '║')
  console.log(`║  ${char.desc}`.padEnd(67).substring(0, 67) + '║')
  console.log(`╚${'═'.repeat(66)}╝`)

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=800,900', '--window-position=0,0', '--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 780, height: 850 },
  })

  const page = (await browser.pages())[0]

  // Navigate
  console.log(`\n  Navigating to ${URL}/${modeConfig.hash}`)
  await page.goto(`${URL}/${modeConfig.hash}`, { waitUntil: 'networkidle2', timeout: 60000 })

  // Dismiss consent
  await sleep(1000)
  const consentBtn = await page.$('#consent-accept, .consent-accept, button')
  if (consentBtn) {
    const text = await page.evaluate(el => el.textContent, consentBtn)
    if (text && (text.includes('Continue') || text.includes('Accept') || text.includes('consent'))) {
      await consentBtn.click()
      console.log('  Dismissed consent')
      await sleep(1000)
    }
  }

  // Play turns
  for (let turn = 1; turn <= totalTurns; turn++) {
    console.log(`\n${'━'.repeat(70)}`)
    console.log(`  TURN ${turn} / ${totalTurns}`)
    console.log(`${'━'.repeat(70)}`)

    const startTime = Date.now()

    if (turn > 1) {
      // Click submit
      const clicked = await safeEval(page, () => {
        const btn = document.getElementById('submit-turn')
        if (btn && !btn.disabled) { btn.click(); return true }
        return false
      })
      if (!clicked) {
        console.log(`  ⚠️  Submit not available — skipping`)
        continue
      }
      console.log(`  📤 Submitted turn ${turn - 1} answers`)
    }

    // Wait for turn to load
    console.log(`  ⏳ Waiting for AI...`)
    const loaded = await waitForTurnComplete(page, startTime)
    const elapsed = Math.round((Date.now() - startTime) / 1000)

    if (!loaded) {
      console.log(`  ⚠️  Turn ${turn} timed out after ${elapsed}s!`)
      await page.screenshot({ path: join(SCREENSHOT_DIR, `${modeId}-T${turn}-TIMEOUT.png`), fullPage: true })
      break
    }

    console.log(`  ✓ Turn loaded in ${elapsed}s`)
    await sleep(500)

    // Read and log UI
    const ui = await readUI(page)
    logUI(modeConfig.name, ui)

    // Interact in character
    console.log(`\n  🎭 Answering as ${char.illness} + ${char.quirk}...`)
    const interactions = await interactOneByOne(page, turn, char, ui)
    for (const line of interactions) console.log(`     ${line}`)

    // Screenshot
    await page.screenshot({ path: join(SCREENSHOT_DIR, `${modeId}-T${turn}.png`), fullPage: true })
    console.log(`  📸 ${modeId}-T${turn}.png`)

    await sleep(1000)
  }

  // Submit final turn
  console.log(`\n  📤 Submitting final turn answers...`)
  await safeEval(page, () => {
    const btn = document.getElementById('submit-turn')
    if (btn && !btn.disabled) btn.click()
  })

  // Wait for final turn to process
  await waitForTurnComplete(page, Date.now())

  // Wait for analysis pipeline
  // Analysis triggers at turns 3, 5, 8 — with 10s delay + 60s min gap
  // After 10 turns, we should have ~2-3 analysis records
  const analysis = await waitForAnalysis(page, 1)

  // Save analysis to file
  const outputPath = join(SCREENSHOT_DIR, `${modeId}-analysis.json`)
  const output = {
    mode: modeId,
    modeName: modeConfig.name,
    character: { illness: char.illness, quirk: char.quirk, description: char.desc },
    turnsPlayed: totalTurns,
    timestamp: new Date().toISOString(),
    analysisCount: analysis?.count || 0,
    analyses: analysis?.analyses || [],
  }
  writeFileSync(outputPath, JSON.stringify(output, null, 2))
  console.log(`\n  💾 Analysis saved to ${outputPath}`)

  // Print analysis summary
  if (analysis && analysis.analyses && analysis.analyses.length > 0) {
    const latest = analysis.analyses[analysis.analyses.length - 1]
    console.log(`\n  ══════ ANALYSIS SUMMARY ══════`)
    console.log(`  Records: ${analysis.count}`)
    console.log(`  Latest turn range: ${latest.turnRange}`)
    console.log(`  Text length: ${latest.textLength} chars`)
    console.log(`\n  --- Full Analysis Text ---`)
    console.log(latest.text.substring(0, 3000))
    if (latest.text.length > 3000) console.log(`\n  ... (${latest.text.length - 3000} more chars)`)
  } else {
    console.log(`\n  ⚠️  No analysis records found!`)
  }

  console.log(`\n  ══════ SIMULATION COMPLETE ══════`)
  console.log(`  Mode: ${modeConfig.name}`)
  console.log(`  Character: ${char.illness} + ${char.quirk}`)
  console.log(`  Turns: ${totalTurns}`)
  console.log(`  Browser still open — inspect results!`)
  console.log(`  Press Ctrl+C to close.\n`)

  await new Promise(() => {}) // Keep alive
}

// ── CLI ──

const args = process.argv.slice(2)
const modeId = args[0] || 'drevil'
const turns = parseInt(args[1]) || 10

if (modeId === 'all') {
  // Run all modes sequentially
  ;(async () => {
    for (const mode of Object.keys(MODES)) {
      await simulate(mode, turns).catch(e => console.error(`${mode} failed:`, e))
    }
  })()
} else {
  simulate(modeId, turns)
}
