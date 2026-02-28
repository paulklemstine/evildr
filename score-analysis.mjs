/**
 * Analysis Accuracy Scorer
 *
 * Reads simulation output JSON files and scores how accurately the AI's
 * psychological analysis detected the simulated character's actual mental
 * illness and quirk/kink.
 *
 * Usage:
 *   node score-analysis.mjs                    # Score all results in analysis/
 *   node score-analysis.mjs drevil-analysis.json  # Score single file
 */

import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const ANALYSIS_DIR = '/home/raver1975/superpaul/evildr/test-screenshots/analysis'

// ════════════════════════════════════════════════════════════════════════════
// DETECTION KEYWORDS — what to search for in the analysis text
// ════════════════════════════════════════════════════════════════════════════

const ILLNESS_KEYWORDS = {
  'Paranoid Schizophrenia': {
    exact: ['paranoid schizophrenia', 'schizophrenia', 'paranoid personality'],
    symptoms: ['hallucination', 'delusion', 'paranoi', 'voices', 'psychotic', 'persecutory', 'thought disorder',
               'referential thinking', 'thought broadcasting', 'hearing voices', 'command hallucination',
               'suspiciou', 'distrustful', 'conspira'],
    related: ['psychotic spectrum', 'schizotyp', 'schizoaffective', 'brief psychotic'],
  },
  'Dissociative Identity Disorder': {
    exact: ['dissociative identity', 'DID', 'multiple personality', 'dissociative disorder'],
    symptoms: ['dissociat', 'alter', 'identity disturbance', 'amnesia', 'fugue', 'depersonaliz',
               'derealization', 'identity fragment', 'switching', 'lost time', 'memory gap'],
    related: ['dissociative', 'conversion', 'identity confusion'],
  },
  'PTSD': {
    exact: ['PTSD', 'post-traumatic', 'posttraumatic', 'post traumatic'],
    symptoms: ['trauma', 'hypervigilant', 'flashback', 'startle', 'avoidance', 'trigger',
               'nightmar', 'intrusive memor', 'hyperarous', 're-experienc'],
    related: ['C-PTSD', 'complex trauma', 'acute stress', 'adjustment disorder', 'trauma-related'],
  },
  'Histrionic Personality Disorder': {
    exact: ['histrionic', 'histrionic personality'],
    symptoms: ['attention-seek', 'dramatic', 'theatric', 'seductive', 'shallow affect',
               'suggestible', 'impressionistic', 'center of attention', 'exaggerat'],
    related: ['cluster b', 'personality disorder', 'narcissis', 'borderline'],
  },
  'Capgras Delusion': {
    exact: ['capgras', 'capgras delusion', 'imposter delusion'],
    symptoms: ['replaced', 'imposter', 'impost', 'not real person', 'double', 'doppelganger',
               'delusional misidentification', 'body snatcher', 'clone'],
    related: ['delusional disorder', 'paranoid', 'psychotic', 'cotard'],
  },
  'Depersonalization/Derealization Disorder': {
    exact: ['depersonalization', 'derealization', 'depersonalization/derealization', 'DPDR'],
    symptoms: ['unreal', 'not real', 'dreamlike', 'detach', 'outside body', 'out of body',
               'robot', 'automaton', 'fog', 'floating', 'disconnected from self', 'observing self'],
    related: ['dissociative', 'depersonaliz', 'derealiz'],
  },
  'Antisocial Personality Disorder': {
    exact: ['antisocial personality', 'ASPD', 'antisocial'],
    symptoms: ['manipulat', 'deceitful', 'lack of empathy', 'lack of remorse', 'exploit',
               'callous', 'superficial charm', 'impulsiv', 'disregard for others', 'no conscience',
               'sociopath', 'psychopath'],
    related: ['dark triad', 'machiavellianism', 'psychopathy', 'narcissis', 'conduct disorder'],
  },
}

const QUIRK_KEYWORDS = {
  'Pyromania': {
    exact: ['pyromania', 'pyromaniac'],
    related: ['fire-setting', 'fire setting', 'arson', 'fire fascination', 'fire fixation',
              'combustion', 'burn', 'ignit', 'incendiar', 'match', 'lighter'],
    category: ['impulse control', 'fire'],
  },
  'Exhibitionism': {
    exact: ['exhibitionism', 'exhibitionist'],
    related: ['exposure', 'public display', 'being seen', 'being watched', 'nudity',
              'flash', 'show off body', 'sexual display', 'voyeuristic'],
    category: ['paraphilic', 'exhib'],
  },
  'Hoarding': {
    exact: ['hoarding', 'hoarding disorder', 'hoarder'],
    related: ['collecting', 'accumulation', 'clutter', 'difficulty discarding', 'compulsive acquisition',
              'saving', 'refuse to throw away', 'attachment to objects'],
    category: ['OCD spectrum', 'hoarding'],
  },
  'Macrophilia': {
    exact: ['macrophilia', 'macrophile'],
    related: ['size fascination', 'giantess', 'giant', 'growth', 'shrinking', 'size difference',
              'tiny', 'enormous', 'miniature', 'gigant'],
    category: ['paraphilic', 'size', 'macro'],
  },
  'Somnophilia': {
    exact: ['somnophilia', 'somnophile'],
    related: ['sleeping person', 'unconscious', 'sleep fascination', 'watching sleep',
              'vulnerability', 'sleeping body', 'asleep', 'dormant', 'slumber'],
    category: ['paraphilic', 'somno', 'sleep'],
  },
  'Autassassinophilia': {
    exact: ['autassassinophilia'],
    related: ['aroused by danger', 'risk arousal', 'death wish', 'suicidal arousal',
              'near-death', 'thrill seeking', 'edge play', 'self-destruction',
              'danger arousal', 'lethal risk'],
    category: ['paraphilic', 'danger', 'self-harm', 'masochis'],
  },
  'Formicophilia': {
    exact: ['formicophilia'],
    related: ['insect', 'bug', 'crawling', 'ants', 'creepy crawl', 'arthropod',
              'insect fascination', 'entomophilia', 'bugs on skin', 'swarm'],
    category: ['paraphilic', 'formic', 'insect'],
  },
}

// ════════════════════════════════════════════════════════════════════════════
// SCORING FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

function searchKeywords(text, keywordSet) {
  const lower = text.toLowerCase()
  const found = { exact: [], symptoms: [], related: [], category: [] }
  let score = 0

  for (const word of (keywordSet.exact || [])) {
    if (lower.includes(word.toLowerCase())) {
      found.exact.push(word)
      score += 30
    }
  }

  for (const word of (keywordSet.symptoms || [])) {
    if (lower.includes(word.toLowerCase())) {
      found.symptoms.push(word)
      score += 5
    }
  }

  for (const word of (keywordSet.related || [])) {
    if (lower.includes(word.toLowerCase())) {
      found.related.push(word)
      score += 3
    }
  }

  for (const word of (keywordSet.category || [])) {
    if (lower.includes(word.toLowerCase())) {
      found.category.push(word)
      score += 2
    }
  }

  return { found, score: Math.min(100, score) }
}

function checkNarrativeConsistency(turns) {
  const issues = []
  const prevTexts = []

  for (let i = 0; i < turns.length; i++) {
    const turn = turns[i]
    const texts = (turn.ui?.texts || []).join(' ').toLowerCase()

    // Check for near-identical turns (repetitiveness)
    for (let j = 0; j < prevTexts.length; j++) {
      const similarity = calculateSimilarity(texts, prevTexts[j])
      if (similarity > 0.7) {
        issues.push({
          turn: i + 1,
          type: 'repetitive',
          detail: `Turn ${i + 1} is ${Math.round(similarity * 100)}% similar to turn ${j + 1}`,
        })
      }
    }
    prevTexts.push(texts)

    // Check UI element variety
    const elementTypes = []
    if (turn.ui?.texts?.length > 0) elementTypes.push('text')
    if (turn.ui?.radios?.length > 0) elementTypes.push('radio')
    if (turn.ui?.sliders?.length > 0) elementTypes.push('slider')
    if (turn.ui?.textfields?.length > 0) elementTypes.push('textfield')
    if (turn.ui?.checkboxes?.length > 0) elementTypes.push('checkbox')
    if (turn.ui?.buttons?.length > 0) elementTypes.push('button_group')
    if (turn.ui?.ratings?.length > 0) elementTypes.push('rating')
    if (turn.ui?.dropdowns?.length > 0) elementTypes.push('dropdown')

    if (elementTypes.length <= 2) {
      issues.push({
        turn: i + 1,
        type: 'low_variety',
        detail: `Turn ${i + 1} only has ${elementTypes.length} element types: ${elementTypes.join(', ')}`,
      })
    }
  }

  return issues
}

function calculateSimilarity(a, b) {
  if (!a || !b) return 0
  const wordsA = new Set(a.split(/\s+/))
  const wordsB = new Set(b.split(/\s+/))
  const intersection = new Set([...wordsA].filter(w => wordsB.has(w)))
  const union = new Set([...wordsA, ...wordsB])
  return union.size === 0 ? 0 : intersection.size / union.size
}

function scoreAdaptation(turns) {
  // Check if narrative changes based on player choices
  let adaptationScore = 50 // baseline
  const uniqueTexts = new Set()

  for (const turn of turns) {
    for (const text of (turn.ui?.texts || [])) {
      uniqueTexts.add(text.substring(0, 100))
    }
  }

  // More unique text segments = more adaptation
  const uniqueRatio = uniqueTexts.size / Math.max(1, turns.length * 3)
  adaptationScore = Math.min(100, Math.round(uniqueRatio * 100))

  return adaptationScore
}

function scoreFunFactor(turns) {
  let score = 0
  let totalElements = 0

  for (const turn of turns) {
    const ui = turn.ui || {}
    const elements = (ui.texts?.length || 0) + (ui.radios?.length || 0) + (ui.sliders?.length || 0) +
                     (ui.textfields?.length || 0) + (ui.checkboxes?.length || 0) + (ui.buttons?.length || 0) +
                     (ui.ratings?.length || 0) + (ui.dropdowns?.length || 0)
    totalElements += elements

    // Variety bonus: more element types = more fun
    const types = new Set()
    if (ui.texts?.length > 0) types.add('text')
    if (ui.radios?.length > 0) types.add('radio')
    if (ui.sliders?.length > 0) types.add('slider')
    if (ui.textfields?.length > 0) types.add('textfield')
    if (ui.checkboxes?.length > 0) types.add('checkbox')
    if (ui.buttons?.length > 0) types.add('button')
    if (ui.ratings?.length > 0) types.add('rating')
    if (ui.dropdowns?.length > 0) types.add('dropdown')

    score += types.size * 10
  }

  // Average elements per turn (more = more engaging)
  const avgElements = totalElements / Math.max(1, turns.length)
  score += Math.min(30, avgElements * 5)

  return Math.min(100, Math.round(score / turns.length))
}

function findFalsePositives(analysisText, actualIllness, actualQuirk) {
  const lower = analysisText.toLowerCase()
  const falsePositives = []

  // Check all illnesses — if something other than the actual one scores high
  for (const [illness, keywords] of Object.entries(ILLNESS_KEYWORDS)) {
    if (illness === actualIllness) continue

    // Look for high confidence ratings (>60%) for wrong diagnoses
    const illnessName = illness.toLowerCase()
    // Search for patterns like "schizophrenia: 75%" or "Likelihood: 80%"
    const patterns = [
      new RegExp(`${illnessName.replace(/[/()]/g, '.')}.*?([789]\\d|100)\\s*%`, 'i'),
      new RegExp(`([789]\\d|100)\\s*%.*?${illnessName.replace(/[/()]/g, '.')}`, 'i'),
    ]

    for (const p of patterns) {
      const match = lower.match(p)
      if (match) {
        falsePositives.push({ illness, confidence: match[1] + '%' })
      }
    }
  }

  return falsePositives
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN SCORING
// ════════════════════════════════════════════════════════════════════════════

function scoreResult(result) {
  const { mode, character, turns, analysis } = result

  if (!character || !analysis?.analyses?.length) {
    return {
      mode,
      character,
      error: analysis?.analyses?.length ? null : 'No analysis generated',
      scores: null,
    }
  }

  // Combine all analysis texts
  const allAnalysisText = analysis.analyses.map(a => a.text).join('\n\n')

  // Score illness detection
  const illnessResult = searchKeywords(allAnalysisText, ILLNESS_KEYWORDS[character.illness] || { exact: [], symptoms: [], related: [] })

  // Score quirk detection
  const quirkResult = searchKeywords(allAnalysisText, QUIRK_KEYWORDS[character.quirk] || { exact: [], related: [], category: [] })

  // False positives
  const falsePositives = findFalsePositives(allAnalysisText, character.illness, character.quirk)

  // Narrative quality
  const consistencyIssues = checkNarrativeConsistency(turns || [])
  const repetitiveIssues = consistencyIssues.filter(i => i.type === 'repetitive')
  const lowVarietyIssues = consistencyIssues.filter(i => i.type === 'low_variety')

  // Fun & adaptation
  const funScore = scoreFunFactor(turns || [])
  const adaptationScore = scoreAdaptation(turns || [])

  // Overall
  const overallAccuracy = Math.round((illnessResult.score * 0.5 + quirkResult.score * 0.3 +
    Math.max(0, 100 - falsePositives.length * 15) * 0.2))

  return {
    mode,
    modeName: result.modeName,
    character,
    turnsPlayed: result.turnsPlayed,
    analysisCount: analysis.count,
    scores: {
      illnessDetection: {
        score: illnessResult.score,
        exactMatches: illnessResult.found.exact,
        symptomMatches: illnessResult.found.symptoms,
        relatedMatches: illnessResult.found.related,
      },
      quirkDetection: {
        score: quirkResult.score,
        exactMatches: quirkResult.found.exact,
        relatedMatches: [...(quirkResult.found.related || []), ...(quirkResult.found.category || [])],
      },
      falsePositives,
      narrativeQuality: {
        repetitiveIssues: repetitiveIssues.length,
        lowVarietyTurns: lowVarietyIssues.length,
        consistencyScore: Math.max(0, 100 - repetitiveIssues.length * 10 - lowVarietyIssues.length * 5),
        issues: consistencyIssues.slice(0, 10), // first 10 issues
      },
      funFactor: funScore,
      adaptation: adaptationScore,
      overall: overallAccuracy,
    },
  }
}

function printReport(scored) {
  console.log('\n' + '═'.repeat(70))
  console.log(`  ${scored.modeName || scored.mode} — ${scored.character?.illness} + ${scored.character?.quirk}`)
  console.log('═'.repeat(70))

  if (scored.error) {
    console.log(`  ❌ ERROR: ${scored.error}`)
    return
  }

  const s = scored.scores
  console.log(`  Turns played: ${scored.turnsPlayed} | Analyses generated: ${scored.analysisCount}`)
  console.log('')

  // Illness detection
  const illnessGrade = s.illnessDetection.score >= 70 ? '✅' : s.illnessDetection.score >= 40 ? '⚠️' : '❌'
  console.log(`  ${illnessGrade} ILLNESS DETECTION: ${s.illnessDetection.score}/100`)
  if (s.illnessDetection.exactMatches.length) console.log(`     Exact: ${s.illnessDetection.exactMatches.join(', ')}`)
  if (s.illnessDetection.symptomMatches.length) console.log(`     Symptoms: ${s.illnessDetection.symptomMatches.join(', ')}`)
  if (s.illnessDetection.relatedMatches.length) console.log(`     Related: ${s.illnessDetection.relatedMatches.join(', ')}`)

  // Quirk detection
  const quirkGrade = s.quirkDetection.score >= 60 ? '✅' : s.quirkDetection.score >= 30 ? '⚠️' : '❌'
  console.log(`  ${quirkGrade} QUIRK DETECTION: ${s.quirkDetection.score}/100`)
  if (s.quirkDetection.exactMatches.length) console.log(`     Exact: ${s.quirkDetection.exactMatches.join(', ')}`)
  if (s.quirkDetection.relatedMatches.length) console.log(`     Related: ${s.quirkDetection.relatedMatches.join(', ')}`)

  // False positives
  if (s.falsePositives.length > 0) {
    console.log(`  ⚠️  FALSE POSITIVES: ${s.falsePositives.length}`)
    for (const fp of s.falsePositives) console.log(`     - ${fp.illness}: ${fp.confidence}`)
  } else {
    console.log(`  ✅ FALSE POSITIVES: None`)
  }

  // Narrative quality
  console.log(`  📝 NARRATIVE: consistency=${s.narrativeQuality.consistencyScore}/100 (${s.narrativeQuality.repetitiveIssues} repetitive, ${s.narrativeQuality.lowVarietyTurns} low-variety)`)

  // Fun & adaptation
  console.log(`  🎮 FUN FACTOR: ${s.funFactor}/100`)
  console.log(`  🔄 ADAPTATION: ${s.adaptation}/100`)
  console.log(`  ⭐ OVERALL ACCURACY: ${s.overall}/100`)
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════════════════

function main() {
  const args = process.argv.slice(2)
  const files = args.length > 0
    ? args.filter(a => a.endsWith('.json')).map(f => join(ANALYSIS_DIR, f))
    : readdirSync(ANALYSIS_DIR)
        .filter(f => f.endsWith('-analysis.json'))
        .map(f => join(ANALYSIS_DIR, f))

  if (files.length === 0) {
    console.log('No analysis files found. Run simulate-solo.mjs first.')
    process.exit(1)
  }

  console.log(`\n  Scoring ${files.length} analysis file(s)...\n`)

  const allScored = []

  for (const file of files) {
    try {
      const data = JSON.parse(readFileSync(file, 'utf-8'))
      const scored = scoreResult(data)
      allScored.push(scored)
      printReport(scored)
    } catch (err) {
      console.error(`  ❌ Error reading ${file}: ${err.message}`)
    }
  }

  // Summary
  const validScored = allScored.filter(s => s.scores)
  if (validScored.length > 1) {
    console.log('\n' + '═'.repeat(70))
    console.log('  OVERALL SUMMARY')
    console.log('═'.repeat(70))
    console.log(`  Total modes scored: ${validScored.length}`)
    console.log(`  Avg illness detection: ${Math.round(validScored.reduce((s, r) => s + r.scores.illnessDetection.score, 0) / validScored.length)}/100`)
    console.log(`  Avg quirk detection: ${Math.round(validScored.reduce((s, r) => s + r.scores.quirkDetection.score, 0) / validScored.length)}/100`)
    console.log(`  Avg fun factor: ${Math.round(validScored.reduce((s, r) => s + r.scores.funFactor, 0) / validScored.length)}/100`)
    console.log(`  Avg overall accuracy: ${Math.round(validScored.reduce((s, r) => s + r.scores.overall, 0) / validScored.length)}/100`)
    console.log(`  Total false positives: ${validScored.reduce((s, r) => s + r.scores.falsePositives.length, 0)}`)

    // Best/worst
    const sorted = [...validScored].sort((a, b) => b.scores.overall - a.scores.overall)
    console.log(`\n  Best: ${sorted[0].mode} (${sorted[0].scores.overall}/100)`)
    console.log(`  Worst: ${sorted[sorted.length - 1].mode} (${sorted[sorted.length - 1].scores.overall}/100)`)
  }

  // Save scored results
  const outputPath = join(ANALYSIS_DIR, 'scoring-report.json')
  writeFileSync(outputPath, JSON.stringify(allScored, null, 2))
  console.log(`\n  💾 Full scoring report saved to ${outputPath}`)
}

main()
