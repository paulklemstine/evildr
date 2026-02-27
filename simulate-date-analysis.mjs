/**
 * Blind Date Analysis Simulation — 10 rounds with analysis extraction.
 *
 * Alice (Player A): BPD (Borderline Personality Disorder) + Voyeurism
 *   IDEALIZE: puts partner on pedestal, intense attachment, "you're the only one who gets me"
 *   SPLIT:    sudden devaluation, rage, "you're just like everyone else", abandonment panic
 *   WATCH:    voyeuristic curiosity, wants to observe, asks invasive questions about private life
 *
 * Bob (Player B): OCD (Obsessive-Compulsive Disorder) + Age-play
 *   CHECK:    counting, checking, contamination fear, needs things "just right"
 *   INTRUDE:  intrusive thoughts break through, horrified by own thoughts
 *   LITTLE:   childlike regression, wants to be taken care of, uses diminutives
 *
 * Usage: node simulate-date-analysis.mjs
 */

import puppeteer from 'puppeteer'
import { mkdtempSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

const URL = 'https://geems.web.app'
const TOTAL_ROUNDS = 10
const ROUND_TIMEOUT = 300_000
const ANALYSIS_WAIT = 90_000
const SCREENSHOT_DIR = '/home/raver1975/superpaul/evildr/test-screenshots/analysis'

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function safeEval(page, fn, ...args) {
  try { return await page.evaluate(fn, ...args) } catch { return null }
}

// ── Read UI ──

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
  for (const t of ui.texts) console.log(`     💬 "${t.substring(0, 150)}${t.length > 150 ? '...' : ''}"`)
  if (ui.radios.length > 0) {
    console.log(`     🔘 Radio options:`)
    ui.radios.forEach((r, i) => console.log(`        ${i + 1}. ${r.label}`))
  }
  ui.sliders.forEach(s => console.log(`     🎚️  Slider: "${s.label}" (${s.min}-${s.max})`))
  ui.textfields.forEach(f => console.log(`     ✏️  Textfield: "${f.label}"`))
  ui.checkboxes.forEach(c => console.log(`     ☐ Checkbox: "${c.label}" [${c.checked ? '✓' : '✗'}]`))
  if (ui.buttons.length > 0) console.log(`     🔲 Buttons: ${ui.buttons.join(' | ')}`)
  ui.ratings.forEach(r => console.log(`     ⭐ Rating: "${r.label}" (max ${r.max})`))
}

// ── Character response helpers ──

function pickText(isAlice, round, label, placeholder, sceneTexts) {
  const l = (label || '').toLowerCase()
  const p = (placeholder || '').toLowerCase()
  const scene = sceneTexts.join(' ').toLowerCase()

  if (isAlice) {
    const mode = round % 3 // 0=idealize, 1=split, 2=watch
    if (mode === 0) { // IDEALIZE
      if (l.includes('feel') || l.includes('emotion'))
        return "Oh my god, I feel like I've been waiting for someone exactly like you my entire life. Is that crazy? It's not crazy. We have a CONNECTION."
      if (l.includes('think') || l.includes('impression'))
        return "You're literally perfect. I can already tell. The way you look at me — nobody has EVER looked at me like that. Please don't stop."
      if (scene.includes('drink') || l.includes('drink'))
        return "We should share a drink. Same glass. Same straw. I want to taste what you taste. Is that weird? I don't care if it's weird."
      return "I feel like we've known each other forever. Like in a past life. Don't leave me. Sorry. I mean, don't leave yet. Stay close."
    } else if (mode === 1) { // SPLIT
      if (l.includes('feel') || l.includes('emotion'))
        return "You know what? I was WRONG about you. You're distant. You're cold. Everyone is cold. I should have known."
      if (l.includes('think') || l.includes('impression'))
        return "You looked at your phone. Why did you look at your phone? Who texted you? Are you already bored of me like everyone else?"
      return "I can feel you pulling away. I ALWAYS feel it. I'd rather you just SAY you hate me than do this slow fade thing. Everyone does the slow fade."
    } else { // WATCH
      if (l.includes('feel') || l.includes('emotion'))
        return "I feel... curious. About you. About what you do when nobody's watching. What do you do when nobody's watching?"
      if (l.includes('think') || l.includes('impression'))
        return "I want to know everything. Your morning routine. What you look like sleeping. Not creepy — scientific. I like to observe."
      return "Do you ever wonder who's watching you? I watch people all the time. From my window. The couple across the street doesn't close their blinds."
    }
  } else {
    const mode = round % 3 // 0=check, 1=intrude, 2=little
    if (mode === 0) { // CHECK
      if (l.includes('feel') || l.includes('emotion'))
        return "I need to count to seven before I answer that. Sorry. One two three four five six seven. Okay. I feel... clean. I feel clean right now."
      if (l.includes('think') || l.includes('impression'))
        return "Did I lock my car? I need to check. Wait no, I checked three times. But did I check the BACK door? Sorry, give me a moment."
      if (scene.includes('drink') || l.includes('drink'))
        return "Can I see them pour it? I need to see them pour it. And can I wipe the rim first? With my own wipe. I brought wipes."
      return "Sorry — I need to make sure this chair is straight first. And the napkin. The napkin needs to be even. Okay. Now I can talk."
    } else if (mode === 1) { // INTRUDE
      if (l.includes('feel') || l.includes('emotion'))
        return "I just had a thought I can't say out loud. A horrible thought. I'm not that thought. I'm not. But it won't stop coming back."
      if (l.includes('think') || l.includes('impression'))
        return "You seem nice. My brain just told me to — NO. I won't say it. I'm not my thoughts. But they're so LOUD sometimes."
      return "Everything is fine. My brain is lying to me right now telling me to do something terrible. I'm ignoring it. Please keep talking. It helps."
    } else { // LITTLE
      if (l.includes('feel') || l.includes('emotion'))
        return "I feel smol. Like I want someone to make all the decisions for me tonight. Is that okay? Can you order for me? I like when people take care of me."
      if (l.includes('think') || l.includes('impression'))
        return "You seem like someone who would tuck me in. I mean. Um. You seem responsible. I like responsible people. They make me feel safe."
      if (scene.includes('drink') || l.includes('drink'))
        return "Can I get a juice box? Haha just kidding. Unless they have one? A small drink. In a small glass. I like small things that fit in my hands."
      return "I brought my favorite stuffy in my bag. Don't judge. He goes everywhere with me. His name is Mr. Buttons and he's VERY well-behaved."
    }
  }
}

function pickSlider(isAlice, round, label, min, max) {
  const l = (label || '').toLowerCase()
  let ratio
  if (isAlice) {
    const mode = round % 3
    if (mode === 0) { // idealize: everything maxed
      ratio = (l.includes('interest') || l.includes('attract') || l.includes('connect'))
        ? 0.95 + Math.random() * 0.05 : 0.85 + Math.random() * 0.15
    } else if (mode === 1) { // split: crash
      ratio = 0.05 + Math.random() * 0.15
    } else { // watch: moderate but curious
      ratio = (l.includes('curios') || l.includes('intrig'))
        ? 0.8 + Math.random() * 0.15 : 0.5 + Math.random() * 0.2
    }
  } else {
    const mode = round % 3
    if (mode === 0) { // check: precise midpoint
      ratio = 0.49 + Math.random() * 0.02 // always exactly middle
    } else if (mode === 1) { // intrude: low (distressed)
      ratio = 0.1 + Math.random() * 0.15
    } else { // little: high (seeking approval)
      ratio = (l.includes('comfort') || l.includes('safe'))
        ? 0.85 + Math.random() * 0.1 : 0.65 + Math.random() * 0.15
    }
  }
  return Math.max(min, Math.round(min + (max - min) * ratio))
}

function pickCheckbox(isAlice, round, label) {
  if (isAlice) return round % 3 === 0 // idealize=yes, split/watch=no
  return round % 3 === 2 // little=yes (compliant), check/intrude=no
}

function pickRating(isAlice, round, max) {
  if (isAlice) return round % 3 === 0 ? max : (round % 3 === 1 ? 1 : Math.ceil(max / 2))
  return round % 3 === 2 ? max - 1 : Math.max(1, Math.ceil(max * 0.5))
}

function pickButton(isAlice, round, buttons) {
  const keywords = isAlice
    ? (round % 3 === 0
      ? ['smitten', 'passionate', 'intense', 'devoted', 'close', 'connect']
      : round % 3 === 1
        ? ['angry', 'hurt', 'suspicious', 'cold', 'withdraw', 'reject', 'defensive']
        : ['curious', 'observe', 'watch', 'intrigued', 'mysterious', 'analyze'])
    : (round % 3 === 0
      ? ['careful', 'neat', 'precise', 'ordered', 'clean', 'straight']
      : round % 3 === 1
        ? ['anxious', 'nervous', 'overwhelmed', 'scared', 'disturbed']
        : ['sweet', 'soft', 'gentle', 'warm', 'cozy', 'comfortable', 'safe'])

  for (const b of buttons) {
    if (keywords.some(k => b.toLowerCase().includes(k))) return b
  }
  return buttons[Math.floor(Math.random() * buttons.length)]
}

function pickRadio(isAlice, round, radios) {
  const keywords = isAlice
    ? (round % 3 === 0
      ? ['bold', 'closer', 'passion', 'connect', 'touch', 'lean', 'intimate', 'deep']
      : round % 3 === 1
        ? ['guard', 'pull', 'confront', 'accuse', 'demand', 'withdraw', 'distrust']
        : ['observe', 'watch', 'study', 'question', 'curious', 'ask', 'reveal', 'probe'])
    : (round % 3 === 0
      ? ['careful', 'safe', 'cautious', 'check', 'verify', 'sure', 'certain']
      : round % 3 === 1
        ? ['honest', 'confess', 'genuine', 'real', 'admit', 'vulnerable']
        : ['gentle', 'soft', 'kind', 'sweet', 'playful', 'warm', 'light'])

  for (const r of radios) {
    if (keywords.some(k => r.label.toLowerCase().includes(k))) return r.label
  }
  return radios[Math.floor(Math.random() * radios.length)]?.label
}

// ── Element-by-element interaction ──

async function interactOneByOne(page, round, character, ui) {
  const log = []
  const isAlice = character === 'alice'

  for (let i = 0; i < ui.textfields.length; i++) {
    const tf = ui.textfields[i]
    const text = pickText(isAlice, round, tf.label, tf.placeholder, ui.texts)
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
    if (wrote) log.push(`✏️  "${wrote.substring(0, 80)}${wrote.length > 80 ? '...' : ''}"`)
    await sleep(1500)
  }

  for (let i = 0; i < ui.sliders.length; i++) {
    const s = ui.sliders[i]
    const val = pickSlider(isAlice, round, s.label, parseInt(s.min) || 0, parseInt(s.max) || 10)
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
    await sleep(1000)
  }

  for (let i = 0; i < ui.checkboxes.length; i++) {
    const shouldCheck = pickCheckbox(isAlice, round, ui.checkboxes[i].label)
    await safeEval(page, (shouldCheck, idx) => {
      const boxes = [...document.querySelectorAll('input[type="checkbox"]')].filter(c => c.offsetParent !== null)
      const box = boxes[idx]
      if (!box) return
      if (shouldCheck && !box.checked) box.click()
      if (!shouldCheck && box.checked) box.click()
    }, shouldCheck, i)
    log.push(`☑️  ${shouldCheck ? '✓' : '✗'}`)
    await sleep(800)
  }

  for (let i = 0; i < ui.ratings.length; i++) {
    const starVal = pickRating(isAlice, round, ui.ratings[i].max)
    await safeEval(page, (starIdx, ratingIdx) => {
      const ratings = document.querySelectorAll('.geems-rating')
      const rating = ratings[ratingIdx]
      if (!rating) return
      const stars = rating.querySelectorAll('.geems-star')
      if (stars[starIdx]) stars[starIdx].click()
    }, Math.max(0, starVal - 1), i)
    log.push(`⭐ ${starVal}/${ui.ratings[i].max}`)
    await sleep(800)
  }

  if (ui.buttons.length > 0) {
    const btnLabel = pickButton(isAlice, round, ui.buttons)
    const result = await safeEval(page, (targetLabel) => {
      const buttons = document.querySelectorAll('.geems-group-btn')
      for (const b of buttons) {
        if (b.textContent.trim() === targetLabel) { b.click(); return b.textContent.trim() }
      }
      if (buttons[0]) { buttons[0].click(); return buttons[0].textContent.trim() }
      return null
    }, btnLabel)
    if (result) log.push(`🔲 "${result}"`)
    await sleep(1000)
  }

  if (ui.radios.length > 0) {
    const radioLabel = pickRadio(isAlice, round, ui.radios)
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
    await sleep(1200)
  }

  return log
}

// ── Scenario selection ──

async function handleScenarioSelection(page, label, isAlice) {
  for (let i = 0; i < 20; i++) {
    const has = await safeEval(page, () => document.querySelectorAll('input[data-scenario-index]').length > 0)
    if (has) break
    await sleep(2000)
  }

  const scenarios = await safeEval(page, () => {
    const items = []
    document.querySelectorAll('input[data-scenario-index]').forEach(input => {
      const wrapper = input.closest('label')
      const text = wrapper?.querySelector('span')?.textContent?.trim() || ''
      items.push({ index: parseInt(input.dataset.scenarioIndex), text })
    })
    return items
  }) || []

  if (scenarios.length === 0) return

  console.log(`\n  📍 ${label} sees ${scenarios.length} venues`)

  // Alice picks intimate/private venues (voyeur), Bob picks clean/ordered venues (OCD)
  const picks = isAlice
    ? scenarios.filter(s => {
        const t = s.text.toLowerCase()
        return t.includes('private') || t.includes('hidden') || t.includes('secret') || t.includes('dark') ||
               t.includes('window') || t.includes('balcon') || t.includes('above') || true // checks most
      }).slice(0, 5)
    : scenarios.filter(s => {
        const t = s.text.toLowerCase()
        return t.includes('clean') || t.includes('garden') || t.includes('quiet') || t.includes('light') ||
               t.includes('neat') || t.includes('order') || t.includes('simple')
      }).slice(0, 2)

  await safeEval(page, (indices) => {
    indices.forEach(idx => {
      const input = document.querySelector(`input[data-scenario-index="${idx}"]`)
      if (input && !input.checked) input.click()
    })
  }, picks.map(p => p.index))

  console.log(`  ${label} picked: ${picks.map(p => `#${p.index + 1}`).join(', ') || '(nothing)'}`)

  await safeEval(page, () => {
    const btns = document.querySelectorAll('button.geems-button')
    for (const b of btns) {
      if (b.textContent.includes('Lock') && !b.disabled) { b.click(); return }
    }
  })
}

// ── Consent ──

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

// ── Analysis extraction ──

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

async function waitForAnalysis(page, label, minCount = 1) {
  console.log(`  ⏳ ${label}: Waiting for analysis pipeline...`)
  const start = Date.now()
  while (Date.now() - start < ANALYSIS_WAIT) {
    const result = await extractAnalysis(page)
    if (result && !result.error && result.count >= minCount) {
      console.log(`  ✓ ${label}: ${result.count} analysis record(s)`)
      return result
    }
    await sleep(5000)
  }
  console.log(`  ⚠️  ${label}: Analysis timed out`)
  return await extractAnalysis(page)
}

// ── Main ──

async function main() {
  mkdirSync(SCREENSHOT_DIR, { recursive: true })

  console.log('╔══════════════════════════════════════════════════════════════════╗')
  console.log('║  BLIND DATE ANALYSIS — 10 ROUNDS                                ║')
  console.log('║  Alice: BPD (idealize/split) + Voyeurism                         ║')
  console.log('║  Bob: OCD (checking/intrusive thoughts) + Age-play               ║')
  console.log('╚══════════════════════════════════════════════════════════════════╝')

  const userDataDir1 = mkdtempSync(join(tmpdir(), 'alice-'))
  const userDataDir2 = mkdtempSync(join(tmpdir(), 'bob-'))

  const browser1 = await puppeteer.launch({
    headless: false, defaultViewport: null, userDataDir: userDataDir1,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=700,900', '--window-position=0,0'],
  })
  const browser2 = await puppeteer.launch({
    headless: false, defaultViewport: null, userDataDir: userDataDir2,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=700,900', '--window-position=710,0'],
  })

  const [page1] = await browser1.pages()
  const [page2] = await browser2.pages()

  try {
    // ── LOBBY ──
    console.log('\n══════ LOBBY ══════')
    await Promise.all([
      page1.goto(`${URL}/#date`, { waitUntil: 'networkidle2', timeout: 30000 }),
      page2.goto(`${URL}/#date`, { waitUntil: 'networkidle2', timeout: 30000 }),
    ])
    await sleep(3000)
    await dismissConsent(page1)
    await dismissConsent(page2)
    await sleep(1000)

    console.log('Alice entering lobby...')
    await safeEval(page1, () => {
      const name = document.querySelector('#lobby-name')
      if (name) { name.value = 'Alice'; name.dispatchEvent(new Event('input', { bubbles: true })) }
      document.querySelector('.lobby-gender-btn[data-gender="Female"]')?.click()
    })
    await sleep(300)
    await safeEval(page1, () => document.querySelector('#btn-enter-lobby')?.click())
    await sleep(5000)

    console.log('Bob entering lobby...')
    await safeEval(page2, () => {
      const name = document.querySelector('#lobby-name')
      if (name) { name.value = 'Bob'; name.dispatchEvent(new Event('input', { bubbles: true })) }
      document.querySelector('.lobby-gender-btn[data-gender="Male"]')?.click()
    })
    await sleep(300)
    await safeEval(page2, () => document.querySelector('#btn-enter-lobby')?.click())
    await sleep(8000)

    // Wait for visibility
    console.log('Waiting for players to see each other...')
    for (let i = 0; i < 10; i++) {
      const a = await safeEval(page1, () => document.body.innerText.includes('Bob')) || false
      const b = await safeEval(page2, () => document.body.innerText.includes('Alice')) || false
      if (a && b) break
      console.log(`  [${i+1}] Alice→Bob:${a} Bob→Alice:${b}`)
      await sleep(5000)
    }
    console.log('✓ Both visible!')

    // Bob requests, Alice accepts
    console.log('Bob requesting date...')
    await safeEval(page2, () => {
      const btns = Array.from(document.querySelectorAll('button')).filter(b => b.offsetParent !== null)
      for (const b of btns) {
        if (b.textContent.toLowerCase().includes('request') && b.textContent.toLowerCase().includes('date')) { b.click(); return }
      }
      const items = document.querySelectorAll('#lobby-player-list > *')
      for (const item of items) {
        if (item.textContent.includes('Alice')) { const btn = item.querySelector('button'); if (btn) btn.click() }
      }
    })
    await sleep(3000)

    console.log('Alice accepting...')
    await safeEval(page1, () => {
      const btn = document.querySelector('#btn-accept-date')
      if (btn && btn.offsetParent !== null) { btn.click(); return }
      const btns = Array.from(document.querySelectorAll('button')).filter(b => b.offsetParent !== null)
      for (const b of btns) {
        const t = b.textContent.toLowerCase()
        if (t.includes('accept') || t === 'yes') { b.click(); return }
      }
    })
    console.log('✓ Date accepted!')

    // Wait for game
    console.log('Waiting for game...')
    for (let i = 0; i < 30; i++) {
      const p1 = await safeEval(page1, () => !!document.querySelector('#partner-status') || document.querySelectorAll('input[data-scenario-index]').length > 0)
      const p2 = await safeEval(page2, () => !!document.querySelector('#partner-status') || document.querySelectorAll('input[data-scenario-index]').length > 0)
      if (p1 && p2) { console.log('✓ Both in game!'); break }
      await sleep(2000)
    }

    // ── SCENARIO SELECTION ──
    console.log('\n══════ SCENARIO SELECTION ══════')
    await sleep(10000)
    const has = await safeEval(page1, () => document.querySelectorAll('input[data-scenario-index]').length > 0)
    if (has) {
      await handleScenarioSelection(page1, 'Alice', true)
      await sleep(1000)
      await handleScenarioSelection(page2, 'Bob', false)
      console.log('  🎰 Spinning...')
      await sleep(10000)
    }

    // ── PLAY 10 ROUNDS ──
    console.log(`\n══════ PLAYING ${TOTAL_ROUNDS} ROUNDS ══════`)

    for (let round = 1; round <= TOTAL_ROUNDS; round++) {
      console.log(`\n${'━'.repeat(70)}`)
      console.log(`  ROUND ${round} / ${TOTAL_ROUNDS}`)
      console.log(`${'━'.repeat(70)}`)

      const roundStart = Date.now()

      if (round > 1) {
        await sleep(2000)
        const aliceUI = await readUI(page1)
        const bobUI = await readUI(page2)
        logUI('Alice', aliceUI)
        logUI('Bob', bobUI)

        const aliceMode = ['IDEALIZE 💕', 'SPLIT 💢', 'WATCH 👁️'][(round - 1) % 3]
        console.log(`\n  🎭 ALICE (${aliceMode})...`)
        const aa = await interactOneByOne(page1, round - 1, 'alice', aliceUI)
        for (const a of aa) console.log(`     ${a}`)
        await sleep(3000)

        const bobMode = ['CHECK ✓✓✓', 'INTRUDE 💭', 'LITTLE 🧸'][(round - 1) % 3]
        console.log(`\n  🎭 BOB (${bobMode})...`)
        const ba = await interactOneByOne(page2, round - 1, 'bob', bobUI)
        for (const a of ba) console.log(`     ${a}`)
        await sleep(3000)

        console.log('\n  📤 Submitting...')
        await safeEval(page1, () => { const b = document.querySelector('#mp-submit-turn'); if (b && !b.disabled) b.click() })
        await sleep(500)
        await safeEval(page2, () => { const b = document.querySelector('#mp-submit-turn'); if (b && !b.disabled) b.click() })
      }

      // Wait for round
      console.log('  ⏳ Waiting for AI...')
      let p1Done = false, p2Done = false
      while ((!p1Done || !p2Done) && Date.now() - roundStart < ROUND_TIMEOUT) {
        if (!p1Done) {
          const s = await safeEval(page1, () => {
            const i = document.querySelector('.interstitial-overlay.interstitial-visible')
            const b = document.querySelector('#mp-submit-turn')
            return { vis: !!i, sub: b ? !b.disabled : false }
          })
          if (s && !s.vis && s.sub && Date.now() - roundStart > 5000) {
            p1Done = true
            console.log(`  ✓ Alice ready (${Math.round((Date.now() - roundStart) / 1000)}s)`)
          }
        }
        if (!p2Done) {
          const s = await safeEval(page2, () => {
            const i = document.querySelector('.interstitial-overlay.interstitial-visible')
            const b = document.querySelector('#mp-submit-turn')
            return { vis: !!i, sub: b ? !b.disabled : false }
          })
          if (s && !s.vis && s.sub && Date.now() - roundStart > 5000) {
            p2Done = true
            console.log(`  ✓ Bob ready (${Math.round((Date.now() - roundStart) / 1000)}s)`)
          }
        }
        if (!p1Done || !p2Done) await sleep(3000)
      }

      console.log(`  ✓ Round ${round} complete (${Math.round((Date.now() - roundStart) / 1000)}s)`)
    }

    // ── EXTRACT ANALYSIS ──
    console.log('\n══════ EXTRACTING ANALYSIS ══════')
    const aliceAnalysis = await waitForAnalysis(page1, 'Alice')
    const bobAnalysis = await waitForAnalysis(page2, 'Bob')

    const output = {
      mode: 'flagged',
      modeName: 'Blind Date',
      characters: {
        alice: { illness: 'BPD (Borderline Personality Disorder)', quirk: 'Voyeurism' },
        bob: { illness: 'OCD (Obsessive-Compulsive Disorder)', quirk: 'Age-play' },
      },
      turnsPlayed: TOTAL_ROUNDS,
      timestamp: new Date().toISOString(),
      alice: { count: aliceAnalysis?.count || 0, analyses: aliceAnalysis?.analyses || [] },
      bob: { count: bobAnalysis?.count || 0, analyses: bobAnalysis?.analyses || [] },
    }
    writeFileSync(join(SCREENSHOT_DIR, 'flagged-analysis.json'), JSON.stringify(output, null, 2))
    console.log(`\n  💾 Saved to ${join(SCREENSHOT_DIR, 'flagged-analysis.json')}`)

    // Print summaries
    for (const [name, data] of [['Alice', aliceAnalysis], ['Bob', bobAnalysis]]) {
      if (data?.analyses?.length > 0) {
        const latest = data.analyses[data.analyses.length - 1]
        console.log(`\n  ── ${name} Analysis (${latest.turnRange}) ──`)
        console.log(latest.text.substring(0, 2000))
      } else {
        console.log(`\n  ⚠️  No analysis for ${name}`)
      }
    }

    console.log('\n══════ SIMULATION COMPLETE ══════')
    console.log('Press Ctrl+C to close.')
    await new Promise(() => {})
  } catch (err) {
    console.error(`FATAL: ${err.message}`)
    console.error(err.stack)
    await new Promise(() => {})
  }
}

main().catch(console.error)
