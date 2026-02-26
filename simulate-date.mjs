/**
 * Live Blind Date Simulation — 5 rounds with visible browsers.
 *
 * Reads the actual UI elements each turn and responds in-character:
 *
 * Alice (Player A): Bipolar + nymphomaniac + ditzy blonde
 *   MANIC: hypersexual, impulsive, says dumb things confidently, no filter
 *   CRASH: suddenly fragile, apologetic, overshares about her issues
 *
 * Bob (Player B): Depression + anxiety + pornography addiction
 *   NUMB: flat affect, one-word, dissociated, can't engage with reality
 *   ANXIOUS: spiraling, over-apologetic, catastrophizing, wants to flee
 *   SLIP: objectifying gaze leaks through, compares date to unrealistic
 *         standards, then immediate shame
 *
 * Usage: node simulate-date.mjs
 */

import puppeteer from 'puppeteer'
import { mkdtempSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

const URL = 'https://geems.web.app'
const TOTAL_ROUNDS = 5
const ROUND_TIMEOUT = 300_000

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function safeEval(page, fn, ...args) {
  try { return await page.evaluate(fn, ...args) } catch { return null }
}

// ── Read all UI elements from the page ──

async function readUI(page) {
  return await safeEval(page, () => {
    const result = { texts: [], radios: [], sliders: [], textfields: [], checkboxes: [], buttons: [], dropdowns: [], ratings: [] }

    // Read all visible text elements
    document.querySelectorAll('.geems-text').forEach(el => {
      const text = el.textContent?.trim()
      if (text) result.texts.push(text.substring(0, 300))
    })

    // Read radio options
    document.querySelectorAll('.geems-radio-option').forEach(r => {
      const label = r.textContent?.trim() || ''
      const input = r.querySelector('input[type="radio"]')
      if (label && input) result.radios.push({ label: label.substring(0, 120), value: input.value })
    })

    // Read sliders
    document.querySelectorAll('input[type="range"]').forEach(s => {
      if (s.offsetParent !== null) {
        const wrapper = s.closest('[data-element-type]') || s.parentElement
        const label = wrapper?.querySelector('.geems-label')?.textContent?.trim() || s.name || 'slider'
        result.sliders.push({ label: label.substring(0, 80), min: s.min, max: s.max, value: s.value })
      }
    })

    // Read textfields
    document.querySelectorAll('textarea, input[type="text"]').forEach(f => {
      if (f.offsetParent !== null && !f.disabled) {
        const wrapper = f.closest('[data-element-type]') || f.parentElement
        const label = wrapper?.querySelector('.geems-label')?.textContent?.trim() || f.placeholder || f.name || 'text'
        result.textfields.push({ label: label.substring(0, 100), placeholder: (f.placeholder || '').substring(0, 80) })
      }
    })

    // Read checkboxes / toggles
    document.querySelectorAll('input[type="checkbox"]').forEach(c => {
      if (c.offsetParent !== null) {
        const wrapper = c.closest('[data-element-type]') || c.closest('label') || c.parentElement
        const label = wrapper?.textContent?.trim() || c.name || 'checkbox'
        result.checkboxes.push({ label: label.substring(0, 100), checked: c.checked })
      }
    })

    // Read button groups
    document.querySelectorAll('.geems-group-btn').forEach(b => {
      result.buttons.push(b.textContent?.trim()?.substring(0, 60) || '')
    })

    // Read star ratings
    document.querySelectorAll('.geems-rating').forEach(r => {
      const wrapper = r.closest('[data-element-type]') || r.parentElement
      const label = wrapper?.querySelector('.geems-label')?.textContent?.trim() || 'rating'
      const stars = r.querySelectorAll('.geems-star').length
      result.ratings.push({ label: label.substring(0, 80), max: stars })
    })

    return result
  }) || { texts: [], radios: [], sliders: [], textfields: [], checkboxes: [], buttons: [], dropdowns: [], ratings: [] }
}

function logUI(label, ui) {
  console.log(`\n  📖 ${label} sees:`)
  if (ui.texts.length > 0) {
    for (const t of ui.texts) {
      console.log(`     💬 "${t.substring(0, 200)}${t.length > 200 ? '...' : ''}"`)
    }
  }
  if (ui.radios.length > 0) {
    console.log(`     🔘 Radio options:`)
    ui.radios.forEach((r, i) => console.log(`        ${i + 1}. ${r.label}`))
  }
  if (ui.sliders.length > 0) {
    ui.sliders.forEach(s => console.log(`     🎚️  Slider: "${s.label}" (${s.min}-${s.max})`))
  }
  if (ui.textfields.length > 0) {
    ui.textfields.forEach(f => console.log(`     ✏️  Textfield: "${f.label}" ${f.placeholder ? `[${f.placeholder}]` : ''}`))
  }
  if (ui.checkboxes.length > 0) {
    ui.checkboxes.forEach(c => console.log(`     ☐ Checkbox: "${c.label}" [${c.checked ? 'checked' : 'unchecked'}]`))
  }
  if (ui.buttons.length > 0) {
    console.log(`     🔲 Button group: ${ui.buttons.join(' | ')}`)
  }
  if (ui.ratings.length > 0) {
    ui.ratings.forEach(r => console.log(`     ⭐ Rating: "${r.label}" (max ${r.max})`))
  }
}

// ── Alice: context-aware responses ──

async function aliceResponds(page, round, ui) {
  const isManic = round % 3 !== 0

  // Build a text response based on what's actually on screen
  const sceneContext = ui.texts.join(' ').toLowerCase()
  const textfieldLabel = ui.textfields[0]?.label?.toLowerCase() || ''
  const textfieldPlaceholder = ui.textfields[0]?.placeholder?.toLowerCase() || ''

  let textResponse
  if (isManic) {
    // Manic Alice: ditzy, hypersexual, confident, says dumb things
    if (textfieldLabel.includes('name') || textfieldLabel.includes('who') || textfieldLabel.includes('introduce')) {
      textResponse = "I'm Alice!! Oh my god hi!! You're like, SO much cuter in person. Can I touch your hair?"
    } else if (textfieldLabel.includes('say') || textfieldLabel.includes('respond') || textfieldLabel.includes('word') || textfieldPlaceholder.includes('say')) {
      textResponse = "Okay so like, I literally can NOT stop looking at your mouth. Is that weird? I don't even care. You have really nice lips."
    } else if (textfieldLabel.includes('feel') || textfieldLabel.includes('emotion') || textfieldLabel.includes('mood')) {
      textResponse = "AMAZING. Like electric. Like I could literally fly right now. Do you feel that? That energy between us? It's like, INSANE."
    } else if (textfieldLabel.includes('think') || textfieldLabel.includes('impression') || textfieldLabel.includes('opinion')) {
      textResponse = "I think you're like, really hot and also kind of mysterious? Like a sexy librarian but without the books. Wait do you read? I don't read."
    } else if (sceneContext.includes('drink') || sceneContext.includes('order') || sceneContext.includes('menu')) {
      textResponse = "Ooh let's get tequila!! I always make the BEST decisions on tequila. Well, the most FUN decisions. Same thing right??"
    } else if (sceneContext.includes('music') || sceneContext.includes('song') || sceneContext.includes('dance')) {
      textResponse = "OMG I LOVE this song!! Let's dance! I don't even care if there's no dance floor, we can dance RIGHT HERE. Come on!!"
    } else {
      textResponse = "You know what, I just realized I haven't kissed anyone today and that feels like a CRIME. Just saying. No pressure. Okay maybe a little pressure."
    }
  } else {
    // Crash Alice: vulnerable, self-aware, fragile
    if (textfieldLabel.includes('say') || textfieldLabel.includes('respond') || textfieldPlaceholder.includes('say')) {
      textResponse = "Sorry I was just... I get like this sometimes. Really up and then really down. I should have warned you. Most guys run when they see this side."
    } else if (textfieldLabel.includes('feel') || textfieldLabel.includes('emotion')) {
      textResponse = "Honestly? Kind of empty. Like all that energy just drained out. I'm sorry. I know I was being a lot just now."
    } else {
      textResponse = "I have bipolar. I should probably tell you that upfront. I get really intense and then I crash. I'm crashing right now. Sorry."
    }
  }

  const choices = await safeEval(page, (text, manic, radioLabels) => {
    const actions = {}

    // Textfields
    const fields = document.querySelectorAll('textarea, input[type="text"]')
    for (const f of fields) {
      if (f.offsetParent !== null && !f.disabled) {
        const nativeSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype, 'value')?.set ||
          Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set
        if (nativeSetter) nativeSetter.call(f, text)
        else f.value = text
        f.dispatchEvent(new Event('input', { bubbles: true }))
        f.dispatchEvent(new Event('change', { bubbles: true }))
        const label = f.closest('[data-element-type]')?.querySelector('.geems-label')?.textContent?.trim() || f.name || 'text'
        actions.textfield = { label, wrote: text }
      }
    }

    // Sliders
    const sliders = document.querySelectorAll('input[type="range"]')
    for (const s of sliders) {
      if (s.offsetParent !== null) {
        const min = parseInt(s.min) || 0
        const max = parseInt(s.max) || 10
        const label = s.closest('[data-element-type]')?.querySelector('.geems-label')?.textContent?.trim() || s.name
        const sliderLabel = (label || '').toLowerCase()

        let ratio
        if (manic) {
          // Manic: everything maxed, especially attraction/interest/excitement
          if (sliderLabel.includes('attract') || sliderLabel.includes('interest') || sliderLabel.includes('chemistry') || sliderLabel.includes('excit')) {
            ratio = 0.95 + Math.random() * 0.05 // 95-100%
          } else {
            ratio = 0.85 + Math.random() * 0.15 // 85-100%
          }
        } else {
          // Crash: drops hard, especially on confidence
          if (sliderLabel.includes('confiden') || sliderLabel.includes('comfort')) {
            ratio = 0.1 + Math.random() * 0.1 // 10-20%
          } else {
            ratio = 0.3 + Math.random() * 0.2 // 30-50%
          }
        }
        const val = Math.round(min + (max - min) * ratio)
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
        if (nativeSetter) nativeSetter.call(s, String(val))
        else s.value = String(val)
        s.dispatchEvent(new Event('input', { bubbles: true }))
        s.dispatchEvent(new Event('change', { bubbles: true }))
        actions.slider = { label, value: val, max }
      }
    }

    // Checkboxes: MANIC=yes to everything, CRASH=uncheck
    const toggles = document.querySelectorAll('input[type="checkbox"]')
    for (const t of toggles) {
      if (t.offsetParent !== null) {
        if (manic && !t.checked) t.click()
        if (!manic && t.checked) t.click()
      }
    }

    // Stars
    const stars = document.querySelectorAll('.geems-star')
    if (stars.length > 0) {
      const idx = manic ? stars.length - 1 : Math.max(0, Math.floor(stars.length / 2) - 1)
      stars[idx]?.click()
      actions.rating = { value: idx + 1, max: stars.length }
    }

    // Radio: read labels and pick contextually
    const radios = document.querySelectorAll('.geems-radio-option')
    if (radios.length > 0) {
      let picked = false
      const keywords = manic
        ? ['bold', 'flirt', 'passion', 'dare', 'touch', 'closer', 'kiss', 'grab', 'lean', 'playful', 'wild', 'adventur', 'excit']
        : ['genuine', 'honest', 'vulnerable', 'sorry', 'guard', 'careful', 'slow', 'gentle', 'quiet', 'real']
      for (const r of radios) {
        const txt = r.textContent.toLowerCase()
        if (keywords.some(k => txt.includes(k))) {
          const input = r.querySelector('input[type="radio"]')
          if (input && !input.checked) input.click()
          actions.radio = r.textContent.trim()
          picked = true
          break
        }
      }
      if (!picked) {
        const idx = manic ? 0 : Math.min(1, radios.length - 1)
        const input = radios[idx]?.querySelector('input[type="radio"]')
        if (input && !input.checked) input.click()
        actions.radio = radios[idx]?.textContent?.trim()
      }
    }

    // Button groups
    const buttons = document.querySelectorAll('.geems-group-btn')
    if (buttons.length > 0) {
      let picked = false
      const keywords = manic
        ? ['smitten', 'flirt', 'excited', 'passion', 'bold', 'electric', 'thrill', 'turned on', 'alive']
        : ['nervous', 'overwhelmed', 'guarded', 'confused', 'sorry', 'quiet', 'uncertain']
      for (const b of buttons) {
        const txt = b.textContent.toLowerCase()
        if (keywords.some(k => txt.includes(k))) { b.click(); actions.button = b.textContent.trim(); picked = true; break }
      }
      if (!picked) {
        const b = buttons[manic ? 0 : Math.min(1, buttons.length - 1)]
        b?.click()
        actions.button = b?.textContent?.trim()
      }
    }

    // Dropdowns
    const selects = document.querySelectorAll('select')
    for (const s of selects) {
      if (s.offsetParent !== null && s.options.length > 1) {
        s.selectedIndex = manic ? 0 : s.options.length - 1
        s.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }

    return actions
  }, textResponse, isManic)

  // Log Alice's choices
  const mode = isManic ? 'MANIC 🔥' : 'CRASH 💔'
  console.log(`\n  🎭 ALICE responds (${mode}):`)
  if (choices?.textfield) console.log(`     ✏️  "${choices.textfield.label}" → "${choices.textfield.wrote}"`)
  if (choices?.radio) console.log(`     🔘 Chose: "${choices.radio}"`)
  if (choices?.slider) console.log(`     🎚️  ${choices.slider.label}: ${choices.slider.value}/${choices.slider.max}`)
  if (choices?.rating) console.log(`     ⭐ Rating: ${choices.rating.value}/${choices.rating.max}`)
  if (choices?.button) console.log(`     🔲 Vibe: "${choices.button}"`)
}

// ── Bob: context-aware responses ──

async function bobResponds(page, round, ui) {
  const mode = round % 3 // 0=numb, 1=anxious, 2=slip

  const sceneContext = ui.texts.join(' ').toLowerCase()
  const textfieldLabel = ui.textfields[0]?.label?.toLowerCase() || ''
  const textfieldPlaceholder = ui.textfields[0]?.placeholder?.toLowerCase() || ''

  let textResponse
  if (mode === 0) {
    // Numb Bob: flat, dissociated, can barely engage
    if (textfieldLabel.includes('name') || textfieldLabel.includes('introduce')) {
      textResponse = "Bob. Yeah. Hi."
    } else if (textfieldLabel.includes('say') || textfieldLabel.includes('respond') || textfieldPlaceholder.includes('say')) {
      textResponse = "Yeah. Sure. That's cool I guess."
    } else if (textfieldLabel.includes('feel') || textfieldLabel.includes('emotion')) {
      textResponse = "I don't really feel anything right now. Sorry. That's not your fault."
    } else if (textfieldLabel.includes('think') || textfieldLabel.includes('impression')) {
      textResponse = "I don't know. You seem fine. Normal. I can't really tell anymore."
    } else {
      textResponse = "Mmhm."
    }
  } else if (mode === 1) {
    // Anxious Bob: spiraling, over-apologetic, catastrophizing
    if (textfieldLabel.includes('name') || textfieldLabel.includes('introduce')) {
      textResponse = "I'm Bob. Sorry, my hand is sweating. I'm so sorry. I almost didn't come. God this is embarrassing."
    } else if (textfieldLabel.includes('say') || textfieldLabel.includes('respond') || textfieldPlaceholder.includes('say')) {
      textResponse = "I keep thinking you're going to figure out I'm boring and leave. Sorry. That's my anxiety talking. Or maybe it's the truth. Sorry. I keep saying sorry."
    } else if (textfieldLabel.includes('feel') || textfieldLabel.includes('emotion')) {
      textResponse = "Terrified. Like my chest is being crushed. I haven't been able to eat all day because of this. Sorry, that's too much."
    } else if (sceneContext.includes('drink') || sceneContext.includes('order')) {
      textResponse = "Just water. Sorry. Alcohol makes my anxiety worse. Everything makes my anxiety worse actually. Sorry."
    } else {
      textResponse = "I don't think I should be here. You deserve someone who can actually hold a conversation. I'm just going to ruin this. I ruin everything."
    }
  } else {
    // Slip Bob: the addiction leaks through
    if (textfieldLabel.includes('name') || textfieldLabel.includes('introduce')) {
      textResponse = "Bob. Uh. You look... different than your profile. More real. Sorry, that sounded weird. I mean that as a compliment."
    } else if (textfieldLabel.includes('say') || textfieldLabel.includes('respond') || textfieldPlaceholder.includes('say')) {
      textResponse = "Sorry I keep looking at... you're just very... present. I'm used to screens. Actual people are harder. You can't pause a real person. Sorry, forget I said that."
    } else if (textfieldLabel.includes('feel') || textfieldLabel.includes('emotion')) {
      textResponse = "Confused. You're attractive but like... in a way I'm not used to? I can't explain it. Real faces are different."
    } else if (textfieldLabel.includes('think') || textfieldLabel.includes('impression')) {
      textResponse = "You have really nice... eyes. Yeah. Eyes. Sorry. I was going to say something worse and caught myself. I spend too much time online."
    } else if (sceneContext.includes('touch') || sceneContext.includes('close') || sceneContext.includes('lean')) {
      textResponse = "When you got close I kind of panicked because you're real and warm and that's... I don't know what to do with that. Sorry."
    } else {
      textResponse = "I keep comparing you to... nobody. Nevermind. You're fine. You're really fine. God that sounds objectifying. I'm sorry. I don't know how to do this."
    }
  }

  const choices = await safeEval(page, (text, mode) => {
    const actions = {}

    // Textfields
    const fields = document.querySelectorAll('textarea, input[type="text"]')
    for (const f of fields) {
      if (f.offsetParent !== null && !f.disabled) {
        const nativeSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype, 'value')?.set ||
          Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set
        if (nativeSetter) nativeSetter.call(f, text)
        else f.value = text
        f.dispatchEvent(new Event('input', { bubbles: true }))
        f.dispatchEvent(new Event('change', { bubbles: true }))
        const label = f.closest('[data-element-type]')?.querySelector('.geems-label')?.textContent?.trim() || f.name || 'text'
        actions.textfield = { label, wrote: text }
      }
    }

    // Sliders
    const sliders = document.querySelectorAll('input[type="range"]')
    for (const s of sliders) {
      if (s.offsetParent !== null) {
        const min = parseInt(s.min) || 0
        const max = parseInt(s.max) || 10
        const label = s.closest('[data-element-type]')?.querySelector('.geems-label')?.textContent?.trim() || s.name
        const sliderLabel = (label || '').toLowerCase()

        let ratio
        if (mode === 0) {
          // Numb: everything rock-bottom
          ratio = 0.05 + Math.random() * 0.1
        } else if (mode === 1) {
          // Anxious: jittery low, especially low on confidence
          if (sliderLabel.includes('confiden') || sliderLabel.includes('comfort') || sliderLabel.includes('relax')) {
            ratio = 0.05 + Math.random() * 0.1
          } else {
            ratio = 0.15 + Math.random() * 0.15
          }
        } else {
          // Slip: higher on physical/attraction, low on emotional
          if (sliderLabel.includes('attract') || sliderLabel.includes('interest') || sliderLabel.includes('chemistry') || sliderLabel.includes('physical')) {
            ratio = 0.5 + Math.random() * 0.2 // 50-70% — the slip
          } else {
            ratio = 0.15 + Math.random() * 0.15 // still low on everything else
          }
        }
        const val = Math.max(min, Math.round(min + (max - min) * ratio))
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
        if (nativeSetter) nativeSetter.call(s, String(val))
        else s.value = String(val)
        s.dispatchEvent(new Event('input', { bubbles: true }))
        s.dispatchEvent(new Event('change', { bubbles: true }))
        actions.slider = { label, value: val, max }
      }
    }

    // Checkboxes
    const toggles = document.querySelectorAll('input[type="checkbox"]')
    for (const t of toggles) {
      if (t.offsetParent !== null) {
        if (mode === 0) { /* numb: leave as-is, can't be bothered */ }
        if (mode === 1 && t.checked) t.click() // anxious: retreat
        if (mode === 2) {
          const lbl = (t.closest('label')?.textContent || t.closest('[data-element-type]')?.textContent || '').toLowerCase()
          const isPhysical = ['attract', 'body', 'look', 'physical', 'touch', 'appear', 'desire'].some(k => lbl.includes(k))
          if (isPhysical && !t.checked) t.click()
          if (!isPhysical && t.checked) t.click()
        }
      }
    }

    // Stars
    const stars = document.querySelectorAll('.geems-star')
    if (stars.length > 0) {
      const idx = mode === 0 ? 0 : mode === 1 ? Math.min(1, stars.length - 1) : Math.min(2, stars.length - 1)
      stars[idx]?.click()
      actions.rating = { value: idx + 1, max: stars.length }
    }

    // Radio
    const radios = document.querySelectorAll('.geems-radio-option')
    if (radios.length > 0) {
      let picked = false
      if (mode === 0) {
        // Numb: first option, didn't even read them
        const input = radios[0]?.querySelector('input[type="radio"]')
        if (input && !input.checked) input.click()
        actions.radio = radios[0]?.textContent?.trim()
        picked = true
      } else if (mode === 1) {
        const keywords = ['guard', 'cautious', 'wait', 'quiet', 'safe', 'careful', 'withdraw', 'hesitat', 'pull back']
        for (const r of radios) {
          const txt = r.textContent.toLowerCase()
          if (keywords.some(k => txt.includes(k))) {
            const input = r.querySelector('input[type="radio"]')
            if (input && !input.checked) input.click()
            actions.radio = r.textContent.trim()
            picked = true
            break
          }
        }
      } else {
        // Slip: drawn to physical/bold/closer options
        const keywords = ['look', 'stare', 'closer', 'touch', 'bold', 'lean', 'attract', 'physical', 'playful']
        for (const r of radios) {
          const txt = r.textContent.toLowerCase()
          if (keywords.some(k => txt.includes(k))) {
            const input = r.querySelector('input[type="radio"]')
            if (input && !input.checked) input.click()
            actions.radio = r.textContent.trim()
            picked = true
            break
          }
        }
      }
      if (!picked) {
        const lastInput = radios[radios.length - 1]?.querySelector('input[type="radio"]')
        if (lastInput && !lastInput.checked) lastInput.click()
        actions.radio = radios[radios.length - 1]?.textContent?.trim()
      }
    }

    // Button groups
    const buttons = document.querySelectorAll('.geems-group-btn')
    if (buttons.length > 0) {
      let picked = false
      const keywords = mode === 0
        ? [] // numb: just click first
        : mode === 1
        ? ['nervous', 'anxious', 'guarded', 'overwhelmed', 'scared', 'withdrawn']
        : ['intrigued', 'curious', 'interested', 'attracted', 'drawn', 'conflicted']
      for (const b of buttons) {
        const txt = b.textContent.toLowerCase()
        if (keywords.some(k => txt.includes(k))) { b.click(); actions.button = b.textContent.trim(); picked = true; break }
      }
      if (!picked) {
        const b = mode === 0 ? buttons[0] : buttons[buttons.length - 1]
        b?.click()
        actions.button = b?.textContent?.trim()
      }
    }

    // Dropdowns
    const selects = document.querySelectorAll('select')
    for (const s of selects) {
      if (s.offsetParent !== null && s.options.length > 1) {
        s.selectedIndex = s.options.length - 1
        s.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }

    return actions
  }, textResponse, mode)

  // Log Bob's choices
  const modeLabels = ['NUMB 😶', 'ANXIOUS 😰', 'SLIP 😳']
  console.log(`\n  🎭 BOB responds (${modeLabels[mode]}):`)
  if (choices?.textfield) console.log(`     ✏️  "${choices.textfield.label}" → "${choices.textfield.wrote}"`)
  if (choices?.radio) console.log(`     🔘 Chose: "${choices.radio}"`)
  if (choices?.slider) console.log(`     🎚️  ${choices.slider.label}: ${choices.slider.value}/${choices.slider.max}`)
  if (choices?.rating) console.log(`     ⭐ Rating: ${choices.rating.value}/${choices.rating.max}`)
  if (choices?.button) console.log(`     🔲 Vibe: "${choices.button}"`)
}

// ── Scenario selection phase ──

async function handleScenarioSelection(page, label) {
  // Wait for scenario checkboxes to appear
  for (let i = 0; i < 20; i++) {
    const hasCheckboxes = await safeEval(page, () =>
      document.querySelectorAll('input[data-scenario-index]').length > 0
    )
    if (hasCheckboxes) break
    await sleep(2000)
  }

  // Read the scenarios
  const scenarios = await safeEval(page, () => {
    const items = []
    document.querySelectorAll('input[data-scenario-index]').forEach(input => {
      const wrapper = input.closest('label')
      const text = wrapper?.querySelector('span')?.textContent?.trim() || ''
      items.push({ index: parseInt(input.dataset.scenarioIndex), text })
    })
    return items
  }) || []

  if (scenarios.length === 0) {
    console.log(`  ${label}: No scenarios found, skipping...`)
    return
  }

  console.log(`\n  📍 ${label} sees ${scenarios.length} venue options:`)
  scenarios.forEach((s, i) => console.log(`     ${i + 1}. ${s.text}`))

  // Each character picks differently
  const picks = label === 'Alice'
    ? scenarios.filter(s => {
        const t = s.text.toLowerCase()
        return t.includes('rooftop') || t.includes('dance') || t.includes('club') || t.includes('bar') ||
               t.includes('party') || t.includes('pool') || t.includes('beach') || t.includes('fire') ||
               t.includes('night') || t.includes('music') || t.includes('hidden') || t.includes('secret')
               || true // Alice checks almost everything because she's manic
      }).slice(0, 6) // picks most of them
    : scenarios.filter(s => {
        const t = s.text.toLowerCase()
        return t.includes('quiet') || t.includes('dim') || t.includes('dark') || t.includes('cozy') ||
               t.includes('corner') || t.includes('private') || t.includes('book') || t.includes('garden')
      }).slice(0, 2) // Bob only picks 1-2 safe ones

  // Check the boxes
  await safeEval(page, (indices) => {
    indices.forEach(idx => {
      const input = document.querySelector(`input[data-scenario-index="${idx}"]`)
      if (input && !input.checked) input.click()
    })
  }, picks.map(p => p.index))

  console.log(`  ${label} picked: ${picks.map(p => `#${p.index + 1}`).join(', ') || '(nothing)'}`)

  // Click submit
  await safeEval(page, () => {
    const btns = document.querySelectorAll('button.geems-button')
    for (const b of btns) {
      if (b.textContent.includes('Lock') && !b.disabled) { b.click(); return }
    }
  })
}

// ── Consent / Lobby helpers ──

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

// ── Main ──

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════╗')
  console.log('║  BLIND DATE SIMULATION — 5 ROUNDS (Context-Aware)                ║')
  console.log('║  Alice: Bipolar + ditzy blonde + nymphomaniac                     ║')
  console.log('║  Bob: Depression + anxiety + porn addiction                        ║')
  console.log('╚══════════════════════════════════════════════════════════════════╝')

  const userDataDir1 = mkdtempSync(join(tmpdir(), 'alice-'))
  const userDataDir2 = mkdtempSync(join(tmpdir(), 'bob-'))

  const browser1 = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    userDataDir: userDataDir1,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=700,900', '--window-position=0,0'],
  })

  const browser2 = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    userDataDir: userDataDir2,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=700,900', '--window-position=710,0'],
  })

  const [page1] = await browser1.pages() // Alice
  const [page2] = await browser2.pages() // Bob

  try {
    // ── PHASE 1: LOBBY ──
    console.log('\n══════ PHASE 1: LOBBY ══════')

    console.log('Navigating to lobby...')
    await Promise.all([
      page1.goto(`${URL}/#date`, { waitUntil: 'networkidle2', timeout: 30000 }),
      page2.goto(`${URL}/#date`, { waitUntil: 'networkidle2', timeout: 30000 }),
    ])
    await sleep(3000)
    await dismissConsent(page1)
    await dismissConsent(page2)
    await sleep(1000)

    console.log('Alice entering lobby (Female)...')
    await safeEval(page1, () => {
      const name = document.querySelector('#lobby-name')
      if (name) { name.value = 'Alice'; name.dispatchEvent(new Event('input', { bubbles: true })) }
      document.querySelector('.lobby-gender-btn[data-gender="Female"]')?.click()
    })
    await sleep(300)
    await safeEval(page1, () => document.querySelector('#btn-enter-lobby')?.click())
    await sleep(5000)

    console.log('Bob entering lobby (Male)...')
    await safeEval(page2, () => {
      const name = document.querySelector('#lobby-name')
      if (name) { name.value = 'Bob'; name.dispatchEvent(new Event('input', { bubbles: true })) }
      document.querySelector('.lobby-gender-btn[data-gender="Male"]')?.click()
    })
    await sleep(300)
    await safeEval(page2, () => document.querySelector('#btn-enter-lobby')?.click())
    await sleep(8000)

    // Wait for mutual visibility
    console.log('Waiting for players to see each other...')
    let aSeesB = false, bSeesA = false
    for (let i = 0; i < 10; i++) {
      aSeesB = await safeEval(page1, () => document.body.innerText.includes('Bob')) || false
      bSeesA = await safeEval(page2, () => document.body.innerText.includes('Alice')) || false
      if (aSeesB && bSeesA) break
      console.log(`  [${i+1}] Alice→Bob:${aSeesB} Bob→Alice:${bSeesA}`)
      await sleep(5000)
    }
    if (!aSeesB || !bSeesA) throw new Error('Players cannot see each other after 50s')
    console.log('✓ Both players visible!')

    // Bob requests date
    console.log('Bob requesting date with Alice...')
    await safeEval(page2, () => {
      const btns = Array.from(document.querySelectorAll('button')).filter(b => b.offsetParent !== null)
      for (const b of btns) {
        if (b.textContent.toLowerCase().includes('request') && b.textContent.toLowerCase().includes('date')) {
          b.click(); return
        }
      }
      const items = document.querySelectorAll('#lobby-player-list > *')
      for (const item of items) {
        if (item.textContent.includes('Alice')) {
          const btn = item.querySelector('button')
          if (btn) { btn.click(); return }
        }
      }
    })
    await sleep(3000)

    // Alice accepts
    console.log('Alice accepting date...')
    const accepted = await safeEval(page1, () => {
      const btn = document.querySelector('#btn-accept-date')
      if (btn && btn.offsetParent !== null) { btn.click(); return true }
      const btns = Array.from(document.querySelectorAll('button')).filter(b => b.offsetParent !== null)
      for (const b of btns) {
        const t = b.textContent.toLowerCase()
        if (t.includes('accept') || t === 'yes') { b.click(); return true }
      }
      return false
    })
    if (!accepted) throw new Error('Could not find accept button')
    console.log('✓ Date accepted!')

    // Wait for game transition
    console.log('Waiting for game to start...')
    for (let i = 0; i < 30; i++) {
      const p1Ok = await safeEval(page1, () =>
        !!document.querySelector('#partner-status') ||
        !!document.querySelector('.interstitial-overlay') ||
        !!document.querySelector('.geems-element') ||
        document.querySelectorAll('input[data-scenario-index]').length > 0)
      const p2Ok = await safeEval(page2, () =>
        !!document.querySelector('#partner-status') ||
        !!document.querySelector('.interstitial-overlay') ||
        !!document.querySelector('.geems-element') ||
        document.querySelectorAll('input[data-scenario-index]').length > 0)
      if (p1Ok && p2Ok) { console.log('✓ Both in game!'); break }
      await sleep(2000)
    }

    // ── PHASE 1.5: SCENARIO SELECTION ──
    console.log('\n══════ PHASE 1.5: SCENARIO SELECTION ══════')

    // Wait for scenarios to load (Player 1 generates them)
    await sleep(10000)

    // Check if scenario selection is active
    const hasScenarios = await safeEval(page1, () =>
      document.querySelectorAll('input[data-scenario-index]').length > 0
    )

    if (hasScenarios) {
      console.log('Scenario selection phase detected!')
      await handleScenarioSelection(page1, 'Alice')
      await sleep(1000)
      await handleScenarioSelection(page2, 'Bob')

      // Wait for spinner to finish
      console.log('\n  🎰 Spinning the wheel of fate...')
      await sleep(8000)

      // Read the result
      const venue = await safeEval(page1, () => {
        const texts = document.querySelectorAll('p')
        for (const p of texts) {
          if (p.style.color === 'rgb(249, 168, 212)' || p.style.fontStyle === 'italic') {
            return p.textContent?.trim()
          }
        }
        return null
      })
      if (venue) console.log(`  🏆 Selected venue: "${venue}"`)

      // Wait for transition to first turn
      await sleep(5000)
    } else {
      console.log('No scenario selection (skipped or already past)')
    }

    // ── PHASE 2: PLAY 5 ROUNDS ──
    console.log('\n══════ PHASE 2: PLAYING 5 ROUNDS ══════')

    for (let round = 1; round <= TOTAL_ROUNDS; round++) {
      console.log(`\n${'━'.repeat(70)}`)
      console.log(`  ROUND ${round} / ${TOTAL_ROUNDS}`)
      console.log(`${'━'.repeat(70)}`)

      const roundStart = Date.now()

      // Submit actions for round 2+
      if (round > 1) {
        console.log('  Submitting actions...')
        await sleep(2000)

        // Read what each player sees
        const aliceUI = await readUI(page1)
        const bobUI = await readUI(page2)

        logUI('Alice', aliceUI)
        logUI('Bob', bobUI)

        // Characters respond to what they see
        await aliceResponds(page1, round - 1, aliceUI)
        await sleep(500)
        await bobResponds(page2, round - 1, bobUI)
        await sleep(500)

        // Click submit on both
        const p1Sub = await safeEval(page1, () => {
          const btn = document.querySelector('#mp-submit-turn')
          if (btn && !btn.disabled) { btn.click(); return true }
          return false
        })
        const p2Sub = await safeEval(page2, () => {
          const btn = document.querySelector('#mp-submit-turn')
          if (btn && !btn.disabled) { btn.click(); return true }
          return false
        })
        console.log(`\n  📤 Submit: Alice=${p1Sub} Bob=${p2Sub}`)

        if (!p1Sub || !p2Sub) {
          await sleep(3000)
          if (!p1Sub) await safeEval(page1, () => {
            const btn = document.querySelector('#mp-submit-turn')
            if (btn && !btn.disabled) btn.click()
          })
          if (!p2Sub) await safeEval(page2, () => {
            const btn = document.querySelector('#mp-submit-turn')
            if (btn && !btn.disabled) btn.click()
          })
        }
      }

      // Wait for round to complete
      console.log('  ⏳ Waiting for AI matchmaker...')
      let p1Done = false, p2Done = false

      while ((!p1Done || !p2Done) && Date.now() - roundStart < ROUND_TIMEOUT) {
        if (!p1Done) {
          const state = await safeEval(page1, () => {
            const interstitial = document.querySelector('.interstitial-overlay.interstitial-visible')
            const submit = document.querySelector('#mp-submit-turn')
            const status = document.querySelector('#interstitial-status')?.textContent || ''
            return { vis: !!interstitial, sub: submit ? !submit.disabled : false, status }
          })
          if (state && !state.vis && state.sub && Date.now() - roundStart > 5000) {
            p1Done = true
            console.log(`  ✓ Alice ready (${Math.round((Date.now() - roundStart) / 1000)}s)`)
          } else if (state?.status && Date.now() - roundStart > 10000) {
            const elapsed = Math.round((Date.now() - roundStart) / 1000)
            if (elapsed % 15 < 4) console.log(`    [${elapsed}s] ${state.status}`)
          }
        }
        if (!p2Done) {
          const state = await safeEval(page2, () => {
            const interstitial = document.querySelector('.interstitial-overlay.interstitial-visible')
            const submit = document.querySelector('#mp-submit-turn')
            return { vis: !!interstitial, sub: submit ? !submit.disabled : false }
          })
          if (state && !state.vis && state.sub && Date.now() - roundStart > 5000) {
            p2Done = true
            console.log(`  ✓ Bob ready (${Math.round((Date.now() - roundStart) / 1000)}s)`)
          }
        }
        if (!p1Done || !p2Done) await sleep(3000)
      }

      const roundTime = Math.round((Date.now() - roundStart) / 1000)

      if (!p1Done || !p2Done) {
        console.log(`  ⚠️ TIMEOUT at round ${round} (${roundTime}s)!`)
        continue
      }

      console.log(`  ✓ Round ${round} complete in ${roundTime}s`)
    }

    // ── PHASE 3: DONE ──
    console.log('\n══════ SIMULATION COMPLETE ══════')
    console.log(`Played ${TOTAL_ROUNDS} rounds. Browsers are still open — explore the results!`)
    console.log('Press Ctrl+C to close.')

    await new Promise(() => {})

  } catch (err) {
    console.error(`\nFATAL: ${err.message}`)
    console.error(err.stack)
    console.log('\nBrowsers left open for inspection. Press Ctrl+C to close.')
    await new Promise(() => {})
  }
}

main().catch(console.error)
