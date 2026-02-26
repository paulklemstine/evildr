/**
 * 5-Round Blind Date E2E Test — plays through lobby flow + 5 game turns.
 *
 * Extracts and logs all narrative text, hidden analysis fields, interactive
 * elements, and timing data for each round. Takes screenshots at every stage.
 *
 * Uses Puppeteer (two tabs in one browser).
 */

import puppeteer from 'puppeteer'
import { mkdirSync, writeFileSync } from 'fs'
import path from 'path'

const URL = 'https://geems.web.app'
const TOTAL_ROUNDS = 5
const ROUND_TIMEOUT = 240_000 // 4 minutes per round
const SS_DIR = '/home/raver1975/superpaul/evildr/test-screenshots/5round'

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function ss(page, name) {
  const filePath = path.join(SS_DIR, `${name}.png`)
  try {
    await page.screenshot({ path: filePath, fullPage: true })
    console.log(`  [ss] ${name}.png`)
  } catch (e) {
    console.log(`  [ss] FAILED ${name}: ${e.message.substring(0, 80)}`)
  }
  return filePath
}

async function safeEval(page, fn) {
  try {
    return await page.evaluate(fn)
  } catch (e) {
    return null
  }
}

/**
 * Extract all game UI data from a player's page.
 *
 * The renderer (renderer.ts) does NOT set `data-element-type` on wrapper divs.
 * Instead:
 *   - Text elements: <div class="geems-element"> containing <div class="geems-text">
 *   - Images: <div class="geems-image-container"> containing <img class="geems-image" data-image-prompt="...">
 *   - Interactive inputs: individual <input>/<textarea>/<select>/<div> with data-element-type on the input itself
 *   - Hidden fields: NOT rendered to DOM at all — stored in localStorage game state
 */
async function extractGameData(page, stateKey) {
  return page.evaluate((lsKey) => {
    const data = {
      texts: [],
      hiddenFields: {},
      interactiveElements: [],
      images: [],
      allElementTypes: [],
    }

    // --- Text elements: .geems-text inside .geems-element wrappers ---
    const textEls = document.querySelectorAll('.geems-element .geems-text')
    for (const el of textEls) {
      const wrapper = el.closest('.geems-element')
      // Detect voice from wrapper class (e.g. "voice-narrator")
      const voiceClass = Array.from(wrapper?.classList || []).find(c => c.startsWith('voice-'))
      const voice = voiceClass ? voiceClass.replace('voice-', '') : ''
      // Try to get label from a sibling .geems-label
      const label = wrapper?.querySelector('.geems-label')?.textContent?.trim() || ''
      data.texts.push({
        name: label,
        voice,
        content: el.innerText.trim().substring(0, 1000),
      })
      data.allElementTypes.push({ type: 'text', name: label })
    }

    // --- Image elements: .geems-image-container with img.geems-image ---
    const imgContainers = document.querySelectorAll('.geems-image-container')
    for (const container of imgContainers) {
      const img = container.querySelector('img.geems-image')
      const label = container.querySelector('.geems-label')?.textContent?.trim() || ''
      const prompt = img?.getAttribute('data-image-prompt') || ''
      data.images.push({
        name: label || 'image',
        prompt,
        loaded: img ? img.complete && img.naturalWidth > 0 : false,
      })
      data.allElementTypes.push({ type: 'image', name: label || 'image' })
    }

    // --- Interactive elements: inputs with data-element-type ---
    const inputEls = document.querySelectorAll('[data-element-type]')
    for (const el of inputEls) {
      const type = el.dataset.elementType
      const name = el.name || el.dataset.name || ''
      // Walk up to the .geems-element wrapper to find the label
      const wrapper = el.closest('.geems-element')
      const lbl = wrapper?.querySelector('label.geems-label, .geems-label')?.textContent?.trim() || ''

      if (['radio', 'slider', 'checkbox', 'textfield', 'dropdown', 'toggle',
           'button_group', 'rating', 'number_input', 'emoji_react', 'color_pick'].includes(type)) {
        // For radio inputs, only count the first one per group
        if (type === 'radio') {
          if (data.interactiveElements.some(e => e.name === name)) continue
          // Collect all radio options for this group
          const radios = wrapper?.querySelectorAll(`input[type="radio"][name="${name}"]`) || []
          const options = Array.from(radios).map(r => {
            const optLabel = r.closest('.geems-radio-option')?.querySelector('label')?.textContent?.trim() || r.value
            return optLabel
          }).filter(Boolean)
          data.interactiveElements.push({ type, name, label: lbl.substring(0, 200), options: options.slice(0, 10) })
        } else if (type === 'button_group') {
          const btns = wrapper?.querySelectorAll('.geems-group-btn') || []
          const options = Array.from(btns).map(b => b.textContent?.trim() || '').filter(Boolean)
          data.interactiveElements.push({ type, name, label: lbl.substring(0, 200), options: options.slice(0, 10) })
        } else {
          const options = []
          if (type === 'dropdown') {
            const opts = el.querySelectorAll('option')
            for (const o of opts) options.push(o.textContent?.trim() || o.value)
          }
          data.interactiveElements.push({ type, name, label: lbl.substring(0, 200), options: options.slice(0, 10) })
        }
        data.allElementTypes.push({ type, name })
      }
    }

    // --- Hidden fields: pulled from localStorage game state ---
    // The renderer never puts hidden elements in the DOM; they are stored
    // in the MultiplayerGameState saved under drevil-flagged-{p1|p2}-state
    try {
      const raw = localStorage.getItem(lsKey)
      if (raw) {
        const state = JSON.parse(raw)
        if (state.myNotes) data.hiddenFields['notes'] = state.myNotes.substring(0, 5000)
        if (state.greenFlags) data.hiddenFields['green_flags'] = state.greenFlags.substring(0, 5000)
        if (state.redFlags) data.hiddenFields['red_flags'] = state.redFlags.substring(0, 5000)
        if (state.ownAnalysis) data.hiddenFields['own_clinical_analysis'] = state.ownAnalysis.substring(0, 5000)
        if (state.partnerAnalysis) data.hiddenFields['partner_clinical_analysis'] = state.partnerAnalysis.substring(0, 5000)

        // Also scan currentUiJson for any additional hidden-type elements
        if (Array.isArray(state.currentUiJson)) {
          for (const el of state.currentUiJson) {
            if (el.type === 'hidden' || el.type === 'notes' || el.type === 'gemini_facing_analysis' ||
                (el.name && (el.name.includes('notes') || el.name.includes('flags') || el.name.includes('analysis')))) {
              const name = el.name || el.type
              const value = el.text || el.value || ''
              if (value && !data.hiddenFields[name]) {
                data.hiddenFields[name] = value.substring(0, 5000)
              }
            }
          }
        }
      }
    } catch { /* ignore parse errors */ }

    return data
  }, stateKey).catch(() => null) || { texts: [], hiddenFields: {}, interactiveElements: [], images: [], allElementTypes: [] }
}

/**
 * Extract hidden field values specifically.
 *
 * Hidden fields are NOT in the DOM — the renderer extracts them before rendering
 * and stores them in the MultiplayerGameState in localStorage.
 * Keys: drevil-flagged-p1-state / drevil-flagged-p2-state
 * Fields: myNotes, greenFlags, redFlags, ownAnalysis, partnerAnalysis
 */
async function extractHiddenValues(page, stateKey) {
  return page.evaluate((lsKey) => {
    const fields = {}

    // Primary: read from game state in localStorage
    try {
      const raw = localStorage.getItem(lsKey)
      if (raw) {
        const state = JSON.parse(raw)
        if (state.myNotes) fields['notes'] = state.myNotes.substring(0, 5000)
        if (state.greenFlags) fields['green_flags'] = state.greenFlags.substring(0, 5000)
        if (state.redFlags) fields['red_flags'] = state.redFlags.substring(0, 5000)
        if (state.ownAnalysis) fields['own_clinical_analysis'] = state.ownAnalysis.substring(0, 5000)
        if (state.partnerAnalysis) fields['partner_clinical_analysis'] = state.partnerAnalysis.substring(0, 5000)

        // Also scan currentUiJson for additional hidden-type elements
        if (Array.isArray(state.currentUiJson)) {
          for (const el of state.currentUiJson) {
            if (el.type === 'hidden' || el.type === 'notes' ||
                el.type === 'gemini_facing_analysis' ||
                (el.name && (el.name.includes('notes') || el.name.includes('flags') ||
                             el.name.includes('analysis')))) {
              const name = el.name || el.type
              const value = el.text || el.value || ''
              if (value && !fields[name]) {
                fields[name] = value.substring(0, 5000)
              }
            }
          }
        }
      }
    } catch { /* ignore parse errors */ }

    // Last resort: any actual input[type=hidden] in the DOM
    for (const input of document.querySelectorAll('input[type="hidden"]')) {
      const name = input.name || input.getAttribute('data-name') || ''
      if (name && !fields[name] && input.value) {
        fields[name] = input.value.substring(0, 5000)
      }
    }

    return fields
  }, stateKey).catch(() => null) || {}
}

async function dismissConsent(page) {
  await safeEval(page, () => {
    const overlay = document.querySelector('.consent-overlay')
    if (!overlay || getComputedStyle(overlay).display === 'none') return
    const btn = overlay.querySelector('button')
    if (btn) btn.click()
  })
  await sleep(500)
  // Force remove if still there
  await safeEval(page, () => {
    const o = document.querySelector('.consent-overlay')
    if (o && getComputedStyle(o).display !== 'none') o.remove()
    localStorage.setItem('geems_consent', 'true')
    localStorage.setItem('consent_accepted', 'true')
  })
}

async function main() {
  mkdirSync(SS_DIR, { recursive: true })

  const report = { rounds: [], errors: {} }

  console.log('Launching browser...')
  const browser = await puppeteer.launch({
    headless: true,
    protocolTimeout: 240000,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,1024'],
    defaultViewport: { width: 1280, height: 1024 },
  })

  const p1 = await browser.newPage()
  const p2 = await browser.newPage()

  const p1Errors = [], p2Errors = []
  for (const [page, errors] of [[p1, p1Errors], [p2, p2Errors]]) {
    await page.evaluateOnNewDocument(() => {
      window.__errs = []
      const oe = console.error
      console.error = (...a) => { window.__errs.push(a.map(String).join(' ')); oe.apply(console, a) }
      window.addEventListener('error', e => window.__errs.push(`[uncaught] ${e.message}`))
      window.addEventListener('unhandledrejection', e => window.__errs.push(`[rejection] ${String(e.reason)}`))
    })
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  }

  try {
    // ================================================================
    // PHASE 1: LOBBY FLOW
    // ================================================================
    console.log('\n========== PHASE 1: LOBBY SETUP ==========')

    console.log('\n--- Navigating to #date ---')
    await Promise.all([
      p1.goto(`${URL}/#date`, { waitUntil: 'networkidle2', timeout: 30000 }),
      p2.goto(`${URL}/#date`, { waitUntil: 'networkidle2', timeout: 30000 }),
    ])
    await sleep(3000)
    await dismissConsent(p1)
    await dismissConsent(p2)
    await sleep(1000)
    await ss(p1, 'L0-lobby')

    // Alice enters lobby
    console.log('\n--- Player A: Alice / Female ---')
    await safeEval(p1, () => {
      const name = document.querySelector('#lobby-name')
      if (name) { name.value = 'Alice'; name.dispatchEvent(new Event('input', { bubbles: true })) }
      const female = document.querySelector('.lobby-gender-btn[data-gender="Female"]')
      if (female) female.click()
    })
    await sleep(300)
    await safeEval(p1, () => { document.querySelector('#btn-enter-lobby')?.click() })
    console.log('  Alice entered lobby.')
    await sleep(5000)

    // Bob enters lobby
    console.log('\n--- Player B: Bob / Male ---')
    await safeEval(p2, () => {
      const name = document.querySelector('#lobby-name')
      if (name) { name.value = 'Bob'; name.dispatchEvent(new Event('input', { bubbles: true })) }
      const male = document.querySelector('.lobby-gender-btn[data-gender="Male"]')
      if (male) male.click()
    })
    await sleep(300)
    await safeEval(p2, () => { document.querySelector('#btn-enter-lobby')?.click() })
    console.log('  Bob entered lobby.')
    await sleep(8000)

    // Wait for mutual visibility
    console.log('\n--- Waiting for mutual visibility ---')
    let aSeesB = false, bSeesA = false
    for (let i = 0; i < 8; i++) {
      aSeesB = await safeEval(p1, () => document.body.innerText.includes('Bob')) || false
      bSeesA = await safeEval(p2, () => document.body.innerText.includes('Alice')) || false
      if (aSeesB && bSeesA) break
      console.log(`  Attempt ${i+1}: A sees Bob=${aSeesB}, B sees Alice=${bSeesA}`)
      await sleep(5000)
    }
    console.log(`  Visibility: A sees Bob=${aSeesB}, B sees Alice=${bSeesA}`)
    await ss(p1, 'L1-alice-sees-bob')
    await ss(p2, 'L2-bob-sees-alice')

    if (!aSeesB || !bSeesA) {
      throw new Error('Players cannot see each other in lobby after 40s')
    }

    // Bob requests date with Alice
    console.log('\n--- Bob requests date with Alice ---')
    await safeEval(p2, () => {
      const btns = Array.from(document.querySelectorAll('button')).filter(b => b.offsetParent !== null)
      for (const b of btns) {
        if (b.textContent.toLowerCase().includes('request') && b.textContent.toLowerCase().includes('date')) {
          b.click(); return 'ok'
        }
      }
      const items = document.querySelectorAll('#lobby-player-list > *')
      for (const item of items) {
        if (item.textContent.includes('Alice')) {
          const btn = item.querySelector('button')
          if (btn) { btn.click(); return 'ok' }
        }
      }
      return 'not-found'
    })
    console.log('  Bob clicked Request Date.')
    await sleep(3000)
    await ss(p1, 'L3-alice-notification')

    // Alice accepts
    console.log('\n--- Alice accepts date ---')
    const accepted = await safeEval(p1, () => {
      const btn = document.querySelector('#btn-accept-date')
      if (btn && btn.offsetParent !== null) { btn.click(); return true }
      const btns = Array.from(document.querySelectorAll('button')).filter(b => b.offsetParent !== null)
      for (const b of btns) {
        const t = b.textContent.toLowerCase()
        if (t.includes('accept') || t === 'yes') { b.click(); return true }
      }
      return false
    })
    console.log(`  Alice accepted: ${accepted}`)

    if (!accepted) {
      await ss(p1, 'L3-ERROR-no-accept')
      throw new Error('Could not find accept button')
    }

    // Wait for game transition
    console.log('\n--- Waiting for game transition ---')
    const transStart = Date.now()

    // Wait for game UI to appear on either player
    for (let i = 0; i < 30; i++) {
      const p1InGame = await safeEval(p1, () =>
        !!document.querySelector('#partner-status') ||
        !!document.querySelector('.interstitial-overlay') ||
        !!document.querySelector('.geems-element') ||
        !!document.querySelector('.geems-image-container') ||
        !!document.querySelector('[data-element-type]')
      )
      const p2InGame = await safeEval(p2, () =>
        !!document.querySelector('#partner-status') ||
        !!document.querySelector('.interstitial-overlay') ||
        !!document.querySelector('.geems-element') ||
        !!document.querySelector('.geems-image-container') ||
        !!document.querySelector('[data-element-type]')
      )
      if (p1InGame && p2InGame) {
        console.log(`  Both in game (${Math.round((Date.now() - transStart) / 1000)}s)`)
        break
      }
      if (i % 5 === 4) {
        console.log(`  [${Math.round((Date.now() - transStart) / 1000)}s] P1 in game: ${p1InGame}, P2 in game: ${p2InGame}`)
      }
      await sleep(2000)
    }

    await ss(p1, 'L4-p1-game')
    await ss(p2, 'L5-p2-game')

    // ================================================================
    // PHASE 2: PLAY 5 ROUNDS
    // ================================================================
    console.log('\n========== PHASE 2: PLAYING 5 ROUNDS ==========')

    for (let round = 1; round <= TOTAL_ROUNDS; round++) {
      console.log(`\n${'#'.repeat(60)}`)
      console.log(`  ROUND ${round} / ${TOTAL_ROUNDS}`)
      console.log(`${'#'.repeat(60)}`)

      const roundStart = Date.now()

      // For round 2+, click Submit
      if (round > 1) {
        console.log('\n  Submitting actions...')

        // Wait a moment for any UI to settle
        await sleep(1000)

        const p1SubmitOk = await safeEval(p1, () => {
          const btn = document.querySelector('#mp-submit-turn')
          if (btn && !btn.disabled) { btn.click(); return true }
          return false
        })
        const p2SubmitOk = await safeEval(p2, () => {
          const btn = document.querySelector('#mp-submit-turn')
          if (btn && !btn.disabled) { btn.click(); return true }
          return false
        })
        console.log(`  P1 submit: ${p1SubmitOk}, P2 submit: ${p2SubmitOk}`)

        if (!p1SubmitOk || !p2SubmitOk) {
          await sleep(5000)
          // Retry once
          if (!p1SubmitOk) {
            const r = await safeEval(p1, () => {
              const btn = document.querySelector('#mp-submit-turn')
              if (btn && !btn.disabled) { btn.click(); return true }
              return false
            })
            console.log(`  P1 retry submit: ${r}`)
          }
          if (!p2SubmitOk) {
            const r = await safeEval(p2, () => {
              const btn = document.querySelector('#mp-submit-turn')
              if (btn && !btn.disabled) { btn.click(); return true }
              return false
            })
            console.log(`  P2 retry submit: ${r}`)
          }
        }
      }

      // Wait for turn to complete
      console.log('\n  Waiting for LLM turn processing...')
      let p1Done = false, p2Done = false
      let lastLogTime = Date.now()

      while ((!p1Done || !p2Done) && Date.now() - roundStart < ROUND_TIMEOUT) {
        if (!p1Done) {
          const state = await safeEval(p1, () => {
            const interstitial = document.querySelector('.interstitial-overlay.interstitial-visible')
            const submit = document.querySelector('#mp-submit-turn')
            const status = document.querySelector('#interstitial-status')?.textContent || ''
            return { vis: !!interstitial, sub: submit ? !submit.disabled : false, status }
          })
          if (state && !state.vis && state.sub && Date.now() - roundStart > 5000) {
            p1Done = true
            console.log(`  P1 DONE (${Math.round((Date.now() - roundStart) / 1000)}s)`)
          } else if (state && Date.now() - lastLogTime > 15000) {
            console.log(`  [${Math.round((Date.now() - roundStart) / 1000)}s] P1: "${state.status}" interstitial=${state.vis} submit=${state.sub}`)
            lastLogTime = Date.now()
          }
        }
        if (!p2Done) {
          const state = await safeEval(p2, () => {
            const interstitial = document.querySelector('.interstitial-overlay.interstitial-visible')
            const submit = document.querySelector('#mp-submit-turn')
            const status = document.querySelector('#interstitial-status')?.textContent || ''
            return { vis: !!interstitial, sub: submit ? !submit.disabled : false, status }
          })
          if (state && !state.vis && state.sub && Date.now() - roundStart > 5000) {
            p2Done = true
            console.log(`  P2 DONE (${Math.round((Date.now() - roundStart) / 1000)}s)`)
          }
        }
        if (!p1Done || !p2Done) await sleep(3000)
      }

      const roundTime = Math.round((Date.now() - roundStart) / 1000)

      if (!p1Done || !p2Done) {
        console.log(`\n  TIMEOUT at round ${round} (${roundTime}s)!`)
        await ss(p1, `R${round}-TIMEOUT-p1`)
        await ss(p2, `R${round}-TIMEOUT-p2`)

        const p1State = await safeEval(p1, () => ({
          status: document.querySelector('#interstitial-status')?.textContent || '',
          error: document.querySelector('#mp-error-display')?.textContent || '',
          text: document.body.innerText.substring(0, 500),
        }))
        const p2State = await safeEval(p2, () => ({
          status: document.querySelector('#interstitial-status')?.textContent || '',
          error: document.querySelector('#mp-error-display')?.textContent || '',
          text: document.body.innerText.substring(0, 500),
        }))
        console.log(`  P1: status="${p1State?.status}", error="${p1State?.error}"`)
        console.log(`  P2: status="${p2State?.status}", error="${p2State?.error}"`)
        report.rounds.push({ round, status: 'timeout', time: roundTime })
        break
      }

      // Round completed — extract data
      console.log(`\n  Round ${round} completed in ${roundTime}s`)
      await sleep(1000)
      await ss(p1, `R${round}-p1`)
      await ss(p2, `R${round}-p2`)

      const p1Data = await extractGameData(p1, 'drevil-flagged-p1-state')
      const p2Data = await extractGameData(p2, 'drevil-flagged-p2-state')
      const p1Hidden = await extractHiddenValues(p1, 'drevil-flagged-p1-state')
      const p2Hidden = await extractHiddenValues(p2, 'drevil-flagged-p2-state')
      const p1Error = await safeEval(p1, () => document.querySelector('#mp-error-display')?.textContent || '') || ''
      const p2Error = await safeEval(p2, () => document.querySelector('#mp-error-display')?.textContent || '') || ''

      // --- LOG ROUND DATA ---
      console.log(`\n  === ROUND ${round} DATA (${roundTime}s) ===`)

      console.log(`\n  --- P1 (Alice) Narrative ---`)
      for (const t of p1Data.texts) {
        console.log(`  [${t.voice || 'unknown'}] ${t.name}: ${t.content.substring(0, 400)}`)
      }

      console.log(`\n  --- P1 Interactive (${p1Data.interactiveElements.length}) ---`)
      for (const el of p1Data.interactiveElements) {
        const opts = el.options.length > 0 ? ` [${el.options.join(' | ')}]` : ''
        console.log(`  ${el.type}:${el.name} — "${el.label}"${opts}`)
      }

      console.log(`\n  --- P1 Images (${p1Data.images.length}) ---`)
      for (const img of p1Data.images) {
        console.log(`  ${img.name}: loaded=${img.loaded} "${img.prompt.substring(0, 200)}"`)
      }

      console.log(`\n  --- P2 (Bob) Narrative ---`)
      for (const t of p2Data.texts) {
        console.log(`  [${t.voice || 'unknown'}] ${t.name}: ${t.content.substring(0, 400)}`)
      }

      console.log(`\n  --- P2 Interactive (${p2Data.interactiveElements.length}) ---`)
      for (const el of p2Data.interactiveElements) {
        const opts = el.options.length > 0 ? ` [${el.options.join(' | ')}]` : ''
        console.log(`  ${el.type}:${el.name} — "${el.label}"${opts}`)
      }

      console.log(`\n  --- P2 Images (${p2Data.images.length}) ---`)
      for (const img of p2Data.images) {
        console.log(`  ${img.name}: loaded=${img.loaded} "${img.prompt.substring(0, 200)}"`)
      }

      // Hidden fields
      console.log(`\n  --- P1 Hidden Fields ---`)
      for (const name of ['notes', 'green_flags', 'red_flags', 'own_clinical_analysis', 'partner_clinical_analysis']) {
        const v = p1Hidden[name] || '(empty)'
        console.log(`  ${name}: ${v.substring(0, 600)}${v.length > 600 ? '...' : ''}`)
      }

      console.log(`\n  --- P2 Hidden Fields ---`)
      for (const name of ['notes', 'green_flags', 'red_flags', 'own_clinical_analysis', 'partner_clinical_analysis']) {
        const v = p2Hidden[name] || '(empty)'
        console.log(`  ${name}: ${v.substring(0, 600)}${v.length > 600 ? '...' : ''}`)
      }

      if (p1Error) console.log(`\n  P1 ERROR: ${p1Error}`)
      if (p2Error) console.log(`\n  P2 ERROR: ${p2Error}`)

      console.log(`\n  --- Element Summary ---`)
      console.log(`  P1: ${p1Data.allElementTypes.length} total (${p1Data.texts.length} text, ${p1Data.images.length} img, ${p1Data.interactiveElements.length} input)`)
      console.log(`  P2: ${p2Data.allElementTypes.length} total (${p2Data.texts.length} text, ${p2Data.images.length} img, ${p2Data.interactiveElements.length} input)`)

      report.rounds.push({
        round, time: roundTime, status: 'ok',
        p1: { texts: p1Data.texts, images: p1Data.images, interactive: p1Data.interactiveElements, hidden: p1Hidden, error: p1Error },
        p2: { texts: p2Data.texts, images: p2Data.images, interactive: p2Data.interactiveElements, hidden: p2Hidden, error: p2Error },
      })
    }

    // ================================================================
    // PHASE 3: REPORT
    // ================================================================
    console.log('\n========== FINAL SUMMARY ==========')

    const completed = report.rounds.filter(r => r.status === 'ok').length
    console.log(`\n  Rounds completed: ${completed} / ${TOTAL_ROUNDS}`)

    for (const r of report.rounds) {
      const p1Notes = r.p1?.hidden?.notes ? 'YES' : 'NO'
      const p2Notes = r.p2?.hidden?.notes ? 'YES' : 'NO'
      const p1Flags = (r.p1?.hidden?.green_flags || r.p1?.hidden?.red_flags) ? 'YES' : 'NO'
      const p2Flags = (r.p2?.hidden?.green_flags || r.p2?.hidden?.red_flags) ? 'YES' : 'NO'
      const p1Anal = (r.p1?.hidden?.own_clinical_analysis || r.p1?.hidden?.partner_clinical_analysis) ? 'YES' : 'NO'
      const p2Anal = (r.p2?.hidden?.own_clinical_analysis || r.p2?.hidden?.partner_clinical_analysis) ? 'YES' : 'NO'
      const p1Img = r.p1?.images?.length || 0
      const p2Img = r.p2?.images?.length || 0
      console.log(`  R${r.round}: ${r.status} (${r.time}s) | P1: notes=${p1Notes} flags=${p1Flags} analysis=${p1Anal} img=${p1Img} | P2: notes=${p2Notes} flags=${p2Flags} analysis=${p2Anal} img=${p2Img}`)
    }

    // Errors
    const allP1Errs = [...new Set([...p1Errors, ...(await safeEval(p1, () => window.__errs) || [])])]
    const allP2Errs = [...new Set([...p2Errors, ...(await safeEval(p2, () => window.__errs) || [])])]
    report.errors = { p1: allP1Errs, p2: allP2Errs }

    if (allP1Errs.length) {
      console.log(`\n  P1 console errors (${allP1Errs.length}):`)
      allP1Errs.slice(-10).forEach(e => console.log(`    ${String(e).substring(0, 200)}`))
    }
    if (allP2Errs.length) {
      console.log(`\n  P2 console errors (${allP2Errs.length}):`)
      allP2Errs.slice(-10).forEach(e => console.log(`    ${String(e).substring(0, 200)}`))
    }
    if (!allP1Errs.length && !allP2Errs.length) {
      console.log('\n  No console errors!')
    }

    // Save report JSON
    writeFileSync(path.join(SS_DIR, 'report.json'), JSON.stringify(report, null, 2))
    console.log(`\n  Report saved to ${SS_DIR}/report.json`)

  } catch (err) {
    console.error(`\n  FATAL: ${err.message}`)
    console.error(err.stack)
    await ss(p1, 'ERROR-p1').catch(() => {})
    await ss(p2, 'ERROR-p2').catch(() => {})
  } finally {
    await browser.close()
    console.log('\nBrowser closed.')
  }
}

main().catch(console.error)
