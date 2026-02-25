/**
 * Blind Date multiplayer flow test — two browser tabs via Playwright.
 *
 * Tests:
 * 1. Player 1 creates a room, gets a code
 * 2. Player 2 joins with that code
 * 3. Both enter the game and see the interstitial with status messages
 * 4. First turn loads for both players
 * 5. Both players see images (Player 2 gets shared base64 from Player 1)
 */

import { chromium } from 'playwright'

const URL = 'https://geems.web.app'
const TIMEOUT = 120_000 // 2 minutes — LLM calls can be slow

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function screenshot(page, name) {
  const path = `/home/raver1975/superpaul/evildr/test-screenshots/${name}.png`
  await page.screenshot({ path, fullPage: true })
  console.log(`  📸 ${name}.png`)
  return path
}

async function main() {
  const { mkdirSync } = await import('fs')
  mkdirSync('/home/raver1975/superpaul/evildr/test-screenshots', { recursive: true })

  console.log('Launching two browser contexts...')
  const browser = await chromium.launch({ headless: true })

  const ctx1 = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 } })

  const p1 = await ctx1.newPage()
  const p2 = await ctx2.newPage()

  // Collect console messages for debugging
  const p1Logs = []
  const p2Logs = []
  p1.on('console', msg => p1Logs.push(`[P1] ${msg.type()}: ${msg.text()}`))
  p2.on('console', msg => p2Logs.push(`[P2] ${msg.type()}: ${msg.text()}`))

  try {
    // ========== STEP 1: Both players navigate to the app ==========
    console.log('\n--- Step 1: Navigate to app ---')
    await Promise.all([
      p1.goto(URL, { waitUntil: 'networkidle', timeout: 30000 }),
      p2.goto(URL, { waitUntil: 'networkidle', timeout: 30000 }),
    ])

    // Dismiss consent banner if present
    for (const page of [p1, p2]) {
      const consentBtn = page.locator('#consent-accept, .consent-accept, button:has-text("Continue")')
      if (await consentBtn.count() > 0) {
        await consentBtn.first().click()
        await sleep(500)
      }
    }
    console.log('  Both players loaded the lobby (consent dismissed).')
    await screenshot(p1, '01-p1-lobby')

    // ========== STEP 2: Navigate to #date (Blind Date lobby) ==========
    console.log('\n--- Step 2: Navigate to Blind Date lobby ---')
    await Promise.all([
      p1.goto(`${URL}/#date`, { waitUntil: 'networkidle', timeout: 15000 }),
      p2.goto(`${URL}/#date`, { waitUntil: 'networkidle', timeout: 15000 }),
    ])
    await sleep(1000)
    await Promise.all([
      screenshot(p1, '02-p1-date-lobby'),
      screenshot(p2, '02-p2-date-lobby'),
    ])

    // ========== STEP 3: Player 1 creates a room ==========
    console.log('\n--- Step 3: Player 1 creates a room ---')
    const createBtn = p1.locator('#btn-create-room')
    await createBtn.click()

    // Wait for room code to appear
    await p1.waitForSelector('#room-code-display:not(:empty)', { timeout: 15000 })
    const roomCode = await p1.textContent('#room-code-display')
    console.log(`  Room code: ${roomCode}`)
    await screenshot(p1, '03-p1-room-created')

    // ========== STEP 4: Player 2 joins the room ==========
    console.log('\n--- Step 4: Player 2 joins the room ---')
    const joinInput = p2.locator('#join-code-input')
    await joinInput.fill(roomCode)
    const joinBtn = p2.locator('#btn-join-room')
    await joinBtn.click()

    // Wait for connection — both should transition to the game page
    console.log('  Waiting for connection and game start...')
    await Promise.all([
      p1.waitForSelector('#partner-status', { timeout: 30000 }),
      p2.waitForSelector('#partner-status', { timeout: 30000 }),
    ])
    console.log('  Both players connected and in-game!')
    await sleep(500)
    await Promise.all([
      screenshot(p1, '04-p1-connected'),
      screenshot(p2, '04-p2-connected'),
    ])

    // ========== STEP 5: Check interstitial appears ==========
    console.log('\n--- Step 5: Check interstitial overlay ---')
    // Both players should auto-submit first turn and see the interstitial
    await sleep(2000) // Give time for auto-submit and interstitial to appear

    const p1HasInterstitial = await p1.locator('.interstitial-overlay').count() > 0
    const p2HasInterstitial = await p2.locator('.interstitial-overlay').count() > 0
    console.log(`  P1 interstitial visible: ${p1HasInterstitial}`)
    console.log(`  P2 interstitial visible: ${p2HasInterstitial}`)

    // Check status messages
    const p1Status = await p1.textContent('#interstitial-status').catch(() => '(not found)')
    const p2Status = await p2.textContent('#interstitial-status').catch(() => '(not found)')
    console.log(`  P1 status: "${p1Status}"`)
    console.log(`  P2 status: "${p2Status}"`)

    await Promise.all([
      screenshot(p1, '05-p1-interstitial'),
      screenshot(p2, '05-p2-interstitial'),
    ])

    // ========== STEP 6: Wait for first turn to complete ==========
    console.log('\n--- Step 6: Wait for first turn to complete ---')
    console.log('  Waiting for LLM calls (this may take 30-90 seconds)...')

    // Poll for interstitial to disappear (turn rendered)
    const startTime = Date.now()
    let p1Done = false
    let p2Done = false

    while ((!p1Done || !p2Done) && Date.now() - startTime < TIMEOUT) {
      if (!p1Done) {
        const count = await p1.locator('.interstitial-overlay.interstitial-visible').count()
        if (count === 0 && Date.now() - startTime > 5000) {
          p1Done = true
          console.log(`  P1 turn loaded (${Math.round((Date.now() - startTime) / 1000)}s)`)
        }
      }
      if (!p2Done) {
        const count = await p2.locator('.interstitial-overlay.interstitial-visible').count()
        if (count === 0 && Date.now() - startTime > 5000) {
          p2Done = true
          console.log(`  P2 turn loaded (${Math.round((Date.now() - startTime) / 1000)}s)`)
        }
      }

      // Capture interim status messages
      if (!p1Done || !p2Done) {
        const s1 = await p1.textContent('#interstitial-status').catch(() => '')
        const s2 = await p2.textContent('#interstitial-status').catch(() => '')
        if (s1 || s2) {
          const elapsed = Math.round((Date.now() - startTime) / 1000)
          if (s1) console.log(`  [${elapsed}s] P1 status: "${s1}"`)
          if (s2) console.log(`  [${elapsed}s] P2 status: "${s2}"`)
        }
      }

      await sleep(3000)
    }

    if (!p1Done || !p2Done) {
      console.log('  ⚠️  Timed out waiting for turns to complete!')
    }

    await sleep(1000)
    await Promise.all([
      screenshot(p1, '06-p1-first-turn'),
      screenshot(p2, '06-p2-first-turn'),
    ])

    // ========== STEP 7: Check images ==========
    console.log('\n--- Step 7: Check images ---')
    const p1Images = await p1.locator('img[data-image-prompt]').count()
    const p2Images = await p2.locator('img[data-image-prompt]').count()
    console.log(`  P1 images: ${p1Images}`)
    console.log(`  P2 images: ${p2Images}`)

    // Check if P2 images have base64 src (shared from P1)
    if (p2Images > 0) {
      const p2ImgSrc = await p2.locator('img[data-image-prompt]').first().getAttribute('src')
      const isBase64 = p2ImgSrc?.startsWith('data:image/')
      console.log(`  P2 first image is base64 (shared): ${isBase64}`)
      if (p2ImgSrc) {
        console.log(`  P2 first image src starts with: ${p2ImgSrc.substring(0, 50)}...`)
      }
    }

    // ========== STEP 8: Check for errors ==========
    console.log('\n--- Step 8: Check for errors ---')
    const p1Error = await p1.textContent('#mp-error-display').catch(() => '')
    const p2Error = await p2.textContent('#mp-error-display').catch(() => '')
    if (p1Error) console.log(`  ⚠️  P1 error: ${p1Error}`)
    if (p2Error) console.log(`  ⚠️  P2 error: ${p2Error}`)
    if (!p1Error && !p2Error) console.log('  No errors!')

    // ========== STEP 9: Check UI elements rendered ==========
    console.log('\n--- Step 9: Check rendered UI elements ---')
    const p1Elements = await p1.locator('[data-element-type]').count()
    const p2Elements = await p2.locator('[data-element-type]').count()
    console.log(`  P1 UI elements: ${p1Elements}`)
    console.log(`  P2 UI elements: ${p2Elements}`)

    // ========== DONE ==========
    console.log('\n✅ Blind date flow test complete!')
    console.log(`Screenshots saved to test-screenshots/`)

    // Dump any relevant console warnings/errors
    const p1Errors = p1Logs.filter(l => l.includes('error') || l.includes('warn'))
    const p2Errors = p2Logs.filter(l => l.includes('error') || l.includes('warn'))
    if (p1Errors.length) {
      console.log('\nP1 console warnings/errors:')
      p1Errors.slice(-10).forEach(l => console.log(`  ${l}`))
    }
    if (p2Errors.length) {
      console.log('\nP2 console warnings/errors:')
      p2Errors.slice(-10).forEach(l => console.log(`  ${l}`))
    }

  } catch (err) {
    console.error('\n❌ Test failed:', err.message)
    await Promise.all([
      screenshot(p1, 'ERROR-p1').catch(() => {}),
      screenshot(p2, 'ERROR-p2').catch(() => {}),
    ])

    // Dump last console messages
    console.log('\nLast P1 logs:')
    p1Logs.slice(-15).forEach(l => console.log(`  ${l}`))
    console.log('\nLast P2 logs:')
    p2Logs.slice(-15).forEach(l => console.log(`  ${l}`))
  } finally {
    await browser.close()
  }
}

main().catch(console.error)
