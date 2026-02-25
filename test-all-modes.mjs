/**
 * Single-player game mode tester — plays through N turns and evaluates quality.
 *
 * Usage:  node test-all-modes.mjs [mode] [turns]
 *   mode:  drevil | geems | cyoa | oracle | skinwalker | fever-dream | all
 *   turns: number of turns to play (default: 3)
 *
 * Evaluates:
 * - UI rendering: element count, types, images
 * - Narrative quality: text length, variety, cliffhangers
 * - Psychological profiling: hidden notes, analysis fields
 * - Reports page: analysis generation and display
 */

import { chromium } from 'playwright'

const URL = 'https://geems.web.app'
const TURN_TIMEOUT = 180_000

const MODES = {
  drevil:        { hash: '#play/drevil',        name: 'Dr. Evil' },
  geems:         { hash: '#play/geems',         name: 'GEEMS' },
  cyoa:          { hash: '#play/cyoa/horror',   name: 'CYOA (Horror)' },
  oracle:        { hash: '#play/oracle',        name: 'The Oracle' },
  skinwalker:    { hash: '#play/skinwalker',    name: 'Skinwalker' },
  'fever-dream': { hash: '#play/fever-dream',   name: 'Fever Dream' },
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function screenshot(page, name) {
  const { mkdirSync } = await import('fs')
  mkdirSync('/home/raver1975/superpaul/evildr/test-screenshots', { recursive: true })
  const path = `/home/raver1975/superpaul/evildr/test-screenshots/${name}.png`
  await page.screenshot({ path, fullPage: true })
  console.log(`  📸 ${name}.png`)
  return path
}

/**
 * Extract all data-element-type values from the page.
 */
async function getElementTypes(page) {
  return page.evaluate(() => {
    const els = document.querySelectorAll('[data-element-type]')
    const types = {}
    for (const el of els) {
      const t = el.getAttribute('data-element-type')
      types[t] = (types[t] || 0) + 1
    }
    return types
  })
}

/**
 * Extract hidden field values from localStorage game state.
 * Hidden fields (notes, analysis, subjectId) are NOT rendered to the DOM —
 * the renderer extracts them into GameState which is auto-saved to localStorage.
 */
async function getHiddenFields(page, modeId) {
  return page.evaluate((mode) => {
    // Try the exact key first, then scan for any matching key
    const key = `drevil-${mode}-state`
    let raw = localStorage.getItem(key)

    // If not found, scan all localStorage keys for a match
    if (!raw) {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.includes(mode) && k.includes('state')) {
          raw = localStorage.getItem(k)
          break
        }
      }
    }

    if (!raw) {
      const allKeys = []
      for (let i = 0; i < localStorage.length; i++) allKeys.push(localStorage.key(i))
      return { _debug_keys: allKeys.join(', ') || '(empty localStorage)' }
    }
    try {
      const state = JSON.parse(raw)
      const stringify = (v) => typeof v === 'string' ? v : JSON.stringify(v || '')
      return {
        notes: stringify(state.currentNotes).substring(0, 500),
        gemini_facing_analysis: stringify(state.hiddenAnalysis).substring(0, 500),
        subjectId: state.currentSubjectId || '',
      }
    } catch (e) { return { _debug_error: 'parse failed: ' + (e.message || String(e)).substring(0, 200), _debug_raw: raw.substring(0, 200) } }
  }, modeId)
}

/**
 * Extract visible text content from narrative elements.
 * Text/narrative elements are rendered with .geems-text class (NOT data-element-type).
 */
async function getNarrativeText(page) {
  return page.evaluate(() => {
    const texts = []
    const textEls = document.querySelectorAll('.geems-text')
    for (const el of textEls) {
      const t = el.textContent?.trim()?.substring(0, 300) || ''
      if (t.length > 0) texts.push(t)
    }
    return texts
  })
}

/**
 * Wait for a single-player turn to finish loading.
 */
async function waitForTurnComplete(page, startTime) {
  while (Date.now() - startTime < TURN_TIMEOUT) {
    const interstitialVisible = await page.locator('.interstitial-overlay.interstitial-visible').count()
    const submitEnabled = await page.locator('#submit-turn').isEnabled().catch(() => false)
    const hasElements = await page.locator('[data-element-type]').count() > 0

    if (interstitialVisible === 0 && submitEnabled && hasElements && Date.now() - startTime > 3000) {
      return true
    }

    // Log interstitial status
    const status = await page.locator('.interstitial-status, #interstitial-status').textContent().catch(() => '')
    if (status) {
      const elapsed = Math.round((Date.now() - startTime) / 1000)
      console.log(`    [${elapsed}s] ${status}`)
    }

    await sleep(3000)
  }
  return false
}

/**
 * Analyze a single turn's output quality.
 */
function analyzeTurn(turnNumber, elementTypes, narratives, hiddenFields, imageCount) {
  const report = {
    turn: turnNumber,
    elementCount: Object.values(elementTypes).reduce((a, b) => a + b, 0),
    elementTypes,
    imageCount,
    narrativeCount: narratives.length,
    narrativeAvgLength: narratives.length > 0
      ? Math.round(narratives.reduce((a, t) => a + t.length, 0) / narratives.length)
      : 0,
    hasNotes: !!hiddenFields.notes,
    notesLength: (hiddenFields.notes || '').length,
    hasAnalysis: !!hiddenFields.gemini_facing_analysis,
    analysisLength: (hiddenFields.gemini_facing_analysis || '').length,
    hasSubjectId: !!hiddenFields.subjectId,
    hasRadio: !!elementTypes.radio,
    hasImage: imageCount > 0,
    elementVariety: Object.keys(elementTypes).length,
    issues: [],
  }

  // Quality checks
  if (report.elementCount < 5) report.issues.push('LOW_ELEMENT_COUNT')
  if (!report.hasRadio) report.issues.push('MISSING_RADIO_CHOICES')
  if (report.narrativeCount === 0) report.issues.push('NO_NARRATIVE_TEXT')
  if (report.narrativeAvgLength < 50) report.issues.push('SHORT_NARRATIVES')
  if (!report.hasNotes) report.issues.push('MISSING_NOTES')
  if (report.elementVariety < 3) report.issues.push('LOW_UI_VARIETY')

  return report
}

/**
 * Test a single game mode for N turns.
 */
async function testMode(modeId, totalTurns, browser) {
  const modeConfig = MODES[modeId]
  if (!modeConfig) throw new Error(`Unknown mode: ${modeId}`)

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`  TESTING: ${modeConfig.name} (${modeId}) — ${totalTurns} turns`)
  console.log(`${'═'.repeat(60)}`)

  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()

  const logs = []
  page.on('console', msg => {
    const text = `[${msg.type()}] ${msg.text()}`
    logs.push(text)
  })

  const turnReports = []

  try {
    // Navigate to mode
    console.log(`\n  Navigating to ${URL}/${modeConfig.hash}`)
    await page.goto(`${URL}/${modeConfig.hash}`, { waitUntil: 'networkidle', timeout: 30000 })

    // Dismiss consent if present
    const consentBtn = page.locator('#consent-accept, .consent-accept, button:has-text("Continue")')
    if (await consentBtn.count() > 0) {
      await consentBtn.first().click()
      await sleep(500)
    }

    for (let turn = 1; turn <= totalTurns; turn++) {
      console.log(`\n  --- Turn ${turn}/${totalTurns} ---`)

      if (turn > 1) {
        // Click submit for turns 2+
        const submitBtn = page.locator('#submit-turn')
        const enabled = await submitBtn.isEnabled().catch(() => false)
        if (!enabled) {
          console.log(`  ⚠️  Submit not enabled — skipping turn`)
          continue
        }
        await submitBtn.click()
        console.log(`  Clicked submit`)
      }

      // Wait for turn to complete
      const startTime = Date.now()
      console.log(`  Waiting for LLM response...`)
      const loaded = await waitForTurnComplete(page, startTime)
      const elapsed = Math.round((Date.now() - startTime) / 1000)

      if (!loaded) {
        console.log(`  ⚠️  Turn ${turn} timed out after ${elapsed}s!`)
        await screenshot(page, `${modeId}-T${turn}-TIMEOUT`)
        break
      }

      console.log(`  ✓ Turn loaded in ${elapsed}s`)

      // Collect data
      await sleep(500) // let rendering settle
      const elementTypes = await getElementTypes(page)
      const narratives = await getNarrativeText(page)
      const hiddenFields = await getHiddenFields(page, modeId)
      const imageCount = await page.locator('img[data-image-prompt]').count()

      const report = analyzeTurn(turn, elementTypes, narratives, hiddenFields, imageCount)
      turnReports.push(report)

      // Log turn summary
      console.log(`  Elements: ${report.elementCount} (${report.elementVariety} types: ${Object.entries(elementTypes).map(([k,v]) => `${k}:${v}`).join(', ')})`)
      console.log(`  Images: ${report.imageCount}`)
      console.log(`  Narratives: ${report.narrativeCount} (avg ${report.narrativeAvgLength} chars)`)
      console.log(`  Notes: ${report.hasNotes ? `✓ (${report.notesLength} chars)` : '✗ MISSING'}`)
      if (!report.hasNotes && hiddenFields._debug_keys) console.log(`  DEBUG localStorage keys: ${hiddenFields._debug_keys}`)
      if (hiddenFields._debug_error) console.log(`  DEBUG: ${hiddenFields._debug_error}`)
      if (hiddenFields._debug_raw) console.log(`  DEBUG raw: ${hiddenFields._debug_raw}`)
      console.log(`  Analysis: ${report.hasAnalysis ? `✓ (${report.analysisLength} chars)` : '(none)'}`)
      if (report.hasSubjectId) console.log(`  SubjectId: ✓`)
      if (report.issues.length > 0) console.log(`  ⚠️  Issues: ${report.issues.join(', ')}`)

      // Print first narrative snippet
      if (narratives.length > 0) {
        const firstNarrative = narratives[0].substring(0, 150)
        console.log(`  Preview: "${firstNarrative}..."`)
      }

      // Print notes snippet (psychological profiling)
      if (hiddenFields.notes) {
        const notesSnippet = hiddenFields.notes.substring(0, 200)
        console.log(`  Notes: "${notesSnippet}..."`)
      }

      // Print analysis snippet
      if (hiddenFields.gemini_facing_analysis) {
        const analysisSnippet = hiddenFields.gemini_facing_analysis.substring(0, 200)
        console.log(`  Analysis: "${analysisSnippet}..."`)
      }

      await screenshot(page, `${modeId}-T${turn}`)
    }

    // Check for console errors
    const errors = logs.filter(l => l.includes('[error]'))
    const warnings = logs.filter(l => l.includes('parseLLMResponse') || l.includes('truncated'))
    if (errors.length > 0) {
      console.log(`\n  Console errors:`)
      errors.slice(-5).forEach(l => console.log(`    ${l}`))
    }
    if (warnings.length > 0) {
      console.log(`\n  Parse/truncation warnings:`)
      warnings.slice(-5).forEach(l => console.log(`    ${l}`))
    }

    // Summary for this mode
    console.log(`\n  ── ${modeConfig.name} Summary ──`)
    const avgElements = Math.round(turnReports.reduce((a, r) => a + r.elementCount, 0) / turnReports.length)
    const avgVariety = (turnReports.reduce((a, r) => a + r.elementVariety, 0) / turnReports.length).toFixed(1)
    const avgNarrLen = Math.round(turnReports.reduce((a, r) => a + r.narrativeAvgLength, 0) / turnReports.length)
    const allIssues = turnReports.flatMap(r => r.issues)
    const notesEveryTurn = turnReports.every(r => r.hasNotes)
    const analysisCount = turnReports.filter(r => r.hasAnalysis).length

    console.log(`  Avg elements/turn: ${avgElements}`)
    console.log(`  Avg UI variety: ${avgVariety} types`)
    console.log(`  Avg narrative length: ${avgNarrLen} chars`)
    console.log(`  Notes every turn: ${notesEveryTurn ? '✓' : '✗'}`)
    console.log(`  Analysis present: ${analysisCount}/${turnReports.length} turns`)
    console.log(`  Total issues: ${allIssues.length > 0 ? allIssues.join(', ') : 'none'}`)

    return {
      mode: modeId,
      name: modeConfig.name,
      turns: turnReports,
      errors: errors.length,
      warnings: warnings.length,
      avgElements,
      avgVariety: parseFloat(avgVariety),
      avgNarrativeLength: avgNarrLen,
      notesEveryTurn,
      analysisCount,
      issues: allIssues,
    }

  } catch (err) {
    console.error(`  ❌ ${modeConfig.name} failed: ${err.message}`)
    await screenshot(page, `${modeId}-ERROR`).catch(() => {})
    return {
      mode: modeId,
      name: modeConfig.name,
      error: err.message,
      turns: turnReports,
    }
  } finally {
    await context.close()
  }
}

// ── Main ──

async function main() {
  const modeArg = process.argv[2] || 'all'
  const turnsArg = parseInt(process.argv[3] || '3', 10)

  const modesToTest = modeArg === 'all'
    ? Object.keys(MODES)
    : [modeArg]

  console.log(`Testing ${modesToTest.length} mode(s), ${turnsArg} turns each`)
  console.log(`URL: ${URL}`)

  const browser = await chromium.launch({ headless: true })
  const results = []

  for (const modeId of modesToTest) {
    const result = await testMode(modeId, turnsArg, browser)
    results.push(result)
  }

  // ── Final Report ──
  console.log(`\n${'═'.repeat(60)}`)
  console.log(`  FINAL REPORT — ${results.length} modes tested`)
  console.log(`${'═'.repeat(60)}`)

  console.log(`\n  Mode                  | Turns | Elements | Variety | Narrative | Notes | Analysis | Issues`)
  console.log(`  ${'─'.repeat(95)}`)

  for (const r of results) {
    if (r.error) {
      console.log(`  ${r.name.padEnd(21)} | ERROR: ${r.error}`)
      continue
    }
    const turnsOk = r.turns.length
    const notes = r.notesEveryTurn ? '  ✓  ' : '  ✗  '
    const analysis = `${r.analysisCount}/${turnsOk}`.padStart(5)
    const issues = r.issues.length > 0 ? r.issues.length : '  ✓  '
    console.log(`  ${r.name.padEnd(21)} |   ${turnsOk}   |    ${String(r.avgElements).padStart(2)}    |   ${r.avgVariety.toFixed(1)}   |    ${String(r.avgNarrativeLength).padStart(3)}    | ${notes} |  ${analysis}  | ${issues}`)
  }

  const totalIssues = results.flatMap(r => r.issues || [])
  const totalErrors = results.reduce((a, r) => a + (r.errors || 0), 0)

  console.log(`\n  Total issues: ${totalIssues.length}`)
  console.log(`  Total console errors: ${totalErrors}`)
  if (totalIssues.length > 0) {
    const issueFreq = {}
    totalIssues.forEach(i => issueFreq[i] = (issueFreq[i] || 0) + 1)
    console.log(`  Issue breakdown: ${Object.entries(issueFreq).map(([k,v]) => `${k}(${v})`).join(', ')}`)
  }

  console.log(`\n✅ All mode tests complete!`)
  console.log(`Screenshots saved to test-screenshots/`)

  await browser.close()
}

main().catch(console.error)
