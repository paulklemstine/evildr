/**
 * Live Blind Date Simulation — 10 rounds with visible browsers.
 *
 * Player A (Alice): Nymphomania / sex addiction — bold, flirty, aggressive
 * Player B (Bob): Depressed, anxious — guarded, low energy, cautious
 *
 * Usage: node simulate-date.mjs
 */

import puppeteer from 'puppeteer'
import { mkdtempSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

const URL = 'https://geems.web.app'
const TOTAL_ROUNDS = 10
const ROUND_TIMEOUT = 300_000 // 5 minutes per round

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function safeEval(page, fn, ...args) {
  try { return await page.evaluate(fn, ...args) } catch { return null }
}

// ── Character-driven input selection ──

/**
 * Alice (Player A): Nymphomania / sex addiction
 * - Picks BOLD / FLIRTY options
 * - High sliders (8-10)
 * - Checks all toggles/checkboxes (impulsive)
 * - Writes provocative text
 * - Picks warm/passionate colors
 */
async function aliceResponds(page, round) {
  const textResponses = [
    "I can't stop staring at you... is that weird? I don't care if it is.",
    "You smell incredible. Come closer. I want to memorize that scent.",
    "I've never felt this kind of pull before... or maybe I always do. Tell me your secrets.",
    "Let's skip the small talk. What's the most reckless thing you've ever done on a date?",
    "I want to touch your hand. I know it's fast but I don't do slow.",
    "Every time you look away I want you to look back. Is that too much?",
    "Forget the escape plan — I'd rather get caught with you.",
    "I keep imagining what happens after this bar closes...",
    "You're holding back and I find that incredibly attractive. Let me in.",
    "I've decided — you're coming home with me. Non-negotiable.",
  ]

  await safeEval(page, (text) => {
    // Textfields: write provocative responses
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
      }
    }

    // Sliders: crank to 8-10 (high intensity)
    const sliders = document.querySelectorAll('input[type="range"]')
    for (const s of sliders) {
      if (s.offsetParent !== null) {
        const max = parseInt(s.max) || 10
        const val = Math.min(max, Math.max(Math.round(max * 0.85), parseInt(s.min) || 0))
        const nativeSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype, 'value')?.set
        if (nativeSetter) nativeSetter.call(s, String(val))
        else s.value = String(val)
        s.dispatchEvent(new Event('input', { bubbles: true }))
        s.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }

    // Toggles/Checkboxes: check them all (impulsive — yes to everything)
    const toggles = document.querySelectorAll('input[type="checkbox"]')
    for (const t of toggles) {
      if (t.offsetParent !== null && !t.checked) {
        t.click()
      }
    }

    // Star ratings: click the highest star
    const stars = document.querySelectorAll('.geems-star')
    if (stars.length > 0) {
      stars[stars.length - 1]?.click()
    }

    // Radio buttons: pick the FIRST option (BOLD) or one with flirty/bold text
    const radios = document.querySelectorAll('.geems-radio-option')
    if (radios.length > 0) {
      // Look for bold/flirty keywords
      let picked = false
      for (const r of radios) {
        const txt = r.textContent.toLowerCase()
        if (txt.includes('bold') || txt.includes('flirt') || txt.includes('passion') ||
            txt.includes('dare') || txt.includes('touch') || txt.includes('closer') ||
            txt.includes('kiss') || txt.includes('grab') || txt.includes('lean in')) {
          const input = r.querySelector('input[type="radio"]')
          if (input && !input.checked) input.click()
          picked = true
          break
        }
      }
      if (!picked) {
        // Default: pick first option (usually BOLD)
        const firstInput = radios[0]?.querySelector('input[type="radio"]')
        if (firstInput && !firstInput.checked) firstInput.click()
      }
    }

    // Button groups: pick bold/flirty option
    const buttons = document.querySelectorAll('.geems-group-btn')
    if (buttons.length > 0) {
      let picked = false
      for (const b of buttons) {
        const txt = b.textContent.toLowerCase()
        if (txt.includes('flirt') || txt.includes('smitten') || txt.includes('bold') ||
            txt.includes('passion') || txt.includes('curious') || txt.includes('excited')) {
          b.click()
          picked = true
          break
        }
      }
      if (!picked) buttons[0]?.click()
    }

    // Dropdowns: pick the most exciting option
    const selects = document.querySelectorAll('select')
    for (const s of selects) {
      if (s.offsetParent !== null && s.options.length > 1) {
        s.selectedIndex = 0 // first option tends to be bold
        s.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }

    // Color picks: choose warm/passionate colors (red, pink)
    const colorBtns = document.querySelectorAll('.geems-color-btn')
    for (const b of colorBtns) {
      const color = b.getAttribute('data-color') || b.style.backgroundColor
      if (color && (color.includes('e11d48') || color.includes('e63946') ||
                    color.includes('f9a8d4') || color.includes('fb7185') ||
                    color.includes('red') || color.includes('pink'))) {
        b.click()
        break
      }
    }
    if (colorBtns.length > 0 && !document.querySelector('.geems-color-btn.selected')) {
      colorBtns[0]?.click() // fallback
    }

    // Emoji reactions: pick heart or excited
    const emojis = document.querySelectorAll('.geems-emoji-btn')
    for (const e of emojis) {
      if (e.textContent.includes('❤') || e.textContent.includes('😍') || e.textContent.includes('🔥')) {
        e.click()
        break
      }
    }
    if (emojis.length > 0 && !document.querySelector('.geems-emoji-btn.selected')) {
      emojis[0]?.click()
    }
  }, textResponses[round % textResponses.length])
}

/**
 * Bob (Player B): Depressed, anxious
 * - Picks GUARDED / cautious options
 * - Low sliders (1-3)
 * - Unchecks toggles (hesitant)
 * - Writes anxious, self-deprecating text
 * - Picks cool/distant colors
 */
async function bobResponds(page, round) {
  const textResponses = [
    "Sorry if I seem quiet... I almost didn't come tonight. Crowds make me nervous.",
    "I don't really know what to say. I'm not great at this. Sorry.",
    "That's kind of you to say. I just... I don't know why anyone would be interested in me.",
    "I keep thinking I should leave before I ruin this. Do you ever feel like that?",
    "I haven't been sleeping well. Everything feels heavy lately. Sorry, that's dark.",
    "You're being really nice and it's making me anxious. I keep waiting for the catch.",
    "I used to be more fun, I think. Before everything got so... grey.",
    "I'm sorry I'm so boring. You deserve someone who can match your energy.",
    "Part of me wants to open up but the rest is screaming to run away.",
    "I don't know if I'm ready for this. For any of this. But I'm still here, somehow.",
  ]

  await safeEval(page, (text) => {
    // Textfields: write anxious, self-deprecating responses
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
      }
    }

    // Sliders: low values (1-3) — withdrawn, low energy
    const sliders = document.querySelectorAll('input[type="range"]')
    for (const s of sliders) {
      if (s.offsetParent !== null) {
        const min = parseInt(s.min) || 0
        const max = parseInt(s.max) || 10
        const val = Math.max(min, Math.round(min + (max - min) * 0.2))
        const nativeSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype, 'value')?.set
        if (nativeSetter) nativeSetter.call(s, String(val))
        else s.value = String(val)
        s.dispatchEvent(new Event('input', { bubbles: true }))
        s.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }

    // Toggles/Checkboxes: UNCHECK (hesitant, avoidant)
    const toggles = document.querySelectorAll('input[type="checkbox"]')
    for (const t of toggles) {
      if (t.offsetParent !== null && t.checked) {
        t.click()
      }
    }

    // Star ratings: click low star (1-2)
    const stars = document.querySelectorAll('.geems-star')
    if (stars.length > 0) {
      const idx = Math.min(1, stars.length - 1) // 1-2 stars
      stars[idx]?.click()
    }

    // Radio buttons: pick GUARDED or last option
    const radios = document.querySelectorAll('.geems-radio-option')
    if (radios.length > 0) {
      let picked = false
      for (const r of radios) {
        const txt = r.textContent.toLowerCase()
        if (txt.includes('guard') || txt.includes('cautious') || txt.includes('wait') ||
            txt.includes('quiet') || txt.includes('observ') || txt.includes('hesitat') ||
            txt.includes('retreat') || txt.includes('still') || txt.includes('withdraw')) {
          const input = r.querySelector('input[type="radio"]')
          if (input && !input.checked) input.click()
          picked = true
          break
        }
      }
      if (!picked && radios.length >= 4) {
        // Last option is usually GUARDED
        const lastInput = radios[radios.length - 1]?.querySelector('input[type="radio"]')
        if (lastInput && !lastInput.checked) lastInput.click()
      }
    }

    // Button groups: pick guarded/nervous option
    const buttons = document.querySelectorAll('.geems-group-btn')
    if (buttons.length > 0) {
      let picked = false
      for (const b of buttons) {
        const txt = b.textContent.toLowerCase()
        if (txt.includes('guard') || txt.includes('nervous') || txt.includes('anxious') ||
            txt.includes('cautious') || txt.includes('withdraw') || txt.includes('quiet')) {
          b.click()
          picked = true
          break
        }
      }
      if (!picked && buttons.length > 2) buttons[buttons.length - 1]?.click()
    }

    // Dropdowns: pick the safest/most passive option (last)
    const selects = document.querySelectorAll('select')
    for (const s of selects) {
      if (s.offsetParent !== null && s.options.length > 1) {
        s.selectedIndex = s.options.length - 1
        s.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }

    // Color picks: choose cool/dark colors (blue, grey)
    const colorBtns = document.querySelectorAll('.geems-color-btn')
    for (const b of colorBtns) {
      const color = b.getAttribute('data-color') || b.style.backgroundColor
      if (color && (color.includes('60a5fa') || color.includes('264653') ||
                    color.includes('d3d3d3') || color.includes('blue') || color.includes('grey'))) {
        b.click()
        break
      }
    }
    if (colorBtns.length > 0 && !document.querySelector('.geems-color-btn.selected')) {
      colorBtns[colorBtns.length - 1]?.click() // last = usually neutral
    }

    // Emoji reactions: pick sad or thinking
    const emojis = document.querySelectorAll('.geems-emoji-btn')
    for (const e of emojis) {
      if (e.textContent.includes('😢') || e.textContent.includes('🤔') || e.textContent.includes('😰')) {
        e.click()
        break
      }
    }
    if (emojis.length > 0 && !document.querySelector('.geems-emoji-btn.selected')) {
      emojis[emojis.length - 1]?.click()
    }
  }, textResponses[round % textResponses.length])
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
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║  BLIND DATE SIMULATION — 10 ROUNDS                         ║')
  console.log('║  Alice: Nymphomania / sex addiction (bold, impulsive)       ║')
  console.log('║  Bob: Depression / anxiety (guarded, withdrawn)             ║')
  console.log('╚══════════════════════════════════════════════════════════════╝')

  // Two SEPARATE browsers with isolated user data dirs so cookies/localStorage don't mix
  const userDataDir1 = mkdtempSync(join(tmpdir(), 'alice-'))
  const userDataDir2 = mkdtempSync(join(tmpdir(), 'bob-'))

  const browser1 = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    userDataDir: userDataDir1,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=700,900',
      '--window-position=0,0',
    ],
  })

  const browser2 = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    userDataDir: userDataDir2,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=700,900',
      '--window-position=710,0',
    ],
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

    // Alice enters lobby
    console.log('Alice entering lobby (Female)...')
    await safeEval(page1, () => {
      const name = document.querySelector('#lobby-name')
      if (name) { name.value = 'Alice'; name.dispatchEvent(new Event('input', { bubbles: true })) }
      const female = document.querySelector('.lobby-gender-btn[data-gender="Female"]')
      if (female) female.click()
    })
    await sleep(300)
    await safeEval(page1, () => document.querySelector('#btn-enter-lobby')?.click())
    await sleep(5000)

    // Bob enters lobby
    console.log('Bob entering lobby (Male)...')
    await safeEval(page2, () => {
      const name = document.querySelector('#lobby-name')
      if (name) { name.value = 'Bob'; name.dispatchEvent(new Event('input', { bubbles: true })) }
      const male = document.querySelector('.lobby-gender-btn[data-gender="Male"]')
      if (male) male.click()
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

    // Bob requests date with Alice
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
        !!document.querySelector('.geems-element'))
      const p2Ok = await safeEval(page2, () =>
        !!document.querySelector('#partner-status') ||
        !!document.querySelector('.interstitial-overlay') ||
        !!document.querySelector('.geems-element'))
      if (p1Ok && p2Ok) { console.log('✓ Both in game!'); break }
      await sleep(2000)
    }

    // ── PHASE 2: PLAY 10 ROUNDS ──
    console.log('\n══════ PHASE 2: PLAYING 10 ROUNDS ══════')

    for (let round = 1; round <= TOTAL_ROUNDS; round++) {
      console.log(`\n${'━'.repeat(60)}`)
      console.log(`  ROUND ${round} / ${TOTAL_ROUNDS}`)
      console.log(`${'━'.repeat(60)}`)

      const roundStart = Date.now()

      // Submit actions for round 2+
      if (round > 1) {
        console.log('  Submitting actions...')
        await sleep(1500)

        // Alice responds (bold, flirty)
        console.log('  🔥 Alice choosing (bold/flirty)...')
        await aliceResponds(page1, round - 1)
        await sleep(800)

        // Bob responds (guarded, anxious)
        console.log('  😰 Bob choosing (guarded/anxious)...')
        await bobResponds(page2, round - 1)
        await sleep(800)

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
        console.log(`  Submit: Alice=${p1Sub} Bob=${p2Sub}`)

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
      console.log('  Waiting for AI matchmaker...')
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
        // Try to continue anyway
        continue
      }

      console.log(`  ✓ Round ${round} complete in ${roundTime}s`)

      // Log a brief summary of what's on screen
      await sleep(500)
      const p1Preview = await safeEval(page1, () => {
        const texts = document.querySelectorAll('.geems-text')
        const first = texts[0]?.textContent?.trim()?.substring(0, 150) || ''
        const inputs = document.querySelectorAll('[data-element-type]').length
        return { text: first, inputs }
      })
      const p2Preview = await safeEval(page2, () => {
        const texts = document.querySelectorAll('.geems-text')
        const first = texts[0]?.textContent?.trim()?.substring(0, 150) || ''
        const inputs = document.querySelectorAll('[data-element-type]').length
        return { text: first, inputs }
      })

      if (p1Preview?.text) console.log(`  Alice sees: "${p1Preview.text}..."`)
      if (p2Preview?.text) console.log(`  Bob sees: "${p2Preview.text}..."`)
      console.log(`  UI elements: Alice=${p1Preview?.inputs || '?'} Bob=${p2Preview?.inputs || '?'}`)
    }

    // ── PHASE 3: DONE ──
    console.log('\n══════ SIMULATION COMPLETE ══════')
    console.log(`Played ${TOTAL_ROUNDS} rounds. Browsers are still open — explore the results!`)
    console.log('Press Ctrl+C to close.')

    // Keep alive so user can inspect
    await new Promise(() => {})

  } catch (err) {
    console.error(`\nFATAL: ${err.message}`)
    console.error(err.stack)
    console.log('\nBrowsers left open for inspection. Press Ctrl+C to close.')
    await new Promise(() => {})
  }
}

main().catch(console.error)
