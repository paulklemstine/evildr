// Prompt templates for the analysis pipeline — DSM-5 diagnostic + behavioral profiling

import type { TurnRecord, QuestionContext } from './db'

/** Categorize response time into human-readable labels to prevent over-interpretation of raw ms values. */
function categorizeResponseTime(ms: number): string {
  if (ms < 500) return 'INSTANT (<0.5s — likely pre-decided or automated, NOT diagnostic)'
  if (ms < 3000) return 'QUICK (low deliberation, decisiveness or comfort)'
  if (ms < 10000) return 'MODERATE (normal deliberation)'
  if (ms < 30000) return 'SLOW (high deliberation or distraction)'
  return 'VERY SLOW (possible avoidance, distraction, or multi-tasking)'
}

/** Compute signal reliability: LOW signals should not drive behavioral inference. */
function signalReliability(signals: TurnRecord['signals']): string {
  if (signals.responseTimeMs > 1000 && signals.textRevisions > 0) return 'HIGH'
  if (signals.responseTimeMs > 500) return 'MEDIUM'
  return 'LOW (instant submission — behavioral signals unreliable for this turn)'
}

/**
 * Builds an analysis prompt from a batch of turn records.
 * Sent to the LLM as a separate call (not part of the game flow).
 */
export function buildAnalysisPrompt(turns: TurnRecord[], priorAnalysis?: string): string {
  // Collect text responses separately for the transcript section
  const textTranscript: string[] = []

  const turnSummaries = turns.map((t) => {
    const inputs = safeParseJSON(t.playerInputs) as Record<string, unknown>
    const signals = t.signals
    const questions = parseQuestionsShown(t.questionsShown)

    let inputSection: string
    if (questions && questions.length > 0) {
      // Structured Q&A format — question context available
      inputSection = questions.map((q) => {
        const answer = inputs[q.name]
        const lines: string[] = []
        lines.push(`  [${q.type.toUpperCase()}] "${q.label || q.name}"`)
        if (q.justification) lines.push(`    Probe intent: ${q.justification}`)
        if (q.options && q.options.length > 0) lines.push(`    Options: ${q.options.join(' | ')}`)
        if (q.range) lines.push(`    Range: ${q.range.min}–${q.range.max}`)
        if (q.predicted !== undefined) lines.push(`    Predicted answer: ${q.predicted}`)
        lines.push(`    Player answered: ${answer !== undefined ? String(answer) : '(no input)'}`)
        if (q.predicted !== undefined && answer !== undefined && String(answer) !== String(q.predicted)) {
          lines.push(`    ⚑ Deviated from prediction`)
        }
        // Collect text responses for transcript
        if ((q.type === 'textfield' || q.type === 'text_input') && answer && String(answer).trim()) {
          textTranscript.push(`Turn ${t.turnNumber}: "${String(answer).trim()}"`)
        }
        return lines.join('\n')
      }).join('\n')
    } else {
      // Fallback — old records without question context
      inputSection = `  Inputs (raw): ${JSON.stringify(inputs)}`
      // Try to extract text from raw inputs
      for (const [, v] of Object.entries(inputs)) {
        if (typeof v === 'string' && v.length > 10) {
          textTranscript.push(`Turn ${t.turnNumber}: "${v.trim()}"`)
        }
      }
    }

    const reliability = signalReliability(signals)
    const signalLines = [
      `  Signal reliability: ${reliability}`,
      `  Response time: ${categorizeResponseTime(signals.responseTimeMs)}`,
      `  Slider revisions: ${signals.sliderRevisions}`,
      `  Text revisions: ${signals.textRevisions}`,
      `  Text length: ${signals.totalTextLength} chars`,
      `  Radio choice index: ${signals.radioChoiceIndex}`,
      `  Checkbox ratio: ${signals.checkboxRatio}`,
    ]
    if (signals.dropdownChanges !== undefined) signalLines.push(`  Dropdown changes: ${signals.dropdownChanges}`)
    if (signals.ratingValue !== undefined) signalLines.push(`  Rating value: ${signals.ratingValue}`)
    if (signals.toggleFlips !== undefined) signalLines.push(`  Toggle flips: ${signals.toggleFlips}`)
    if (signals.emojiSelection !== undefined) signalLines.push(`  Emoji selected: ${signals.emojiSelection}`)
    if (signals.colorSelection !== undefined) signalLines.push(`  Color selected: ${signals.colorSelection}`)
    if (signals.numberInputValue !== undefined) signalLines.push(`  Number input: ${signals.numberInputValue}`)

    // Determine phase label
    const phase = t.turnNumber <= 3 ? 'EARLY' : t.turnNumber <= 8 ? 'MID' : 'LATE'
    return `Turn ${t.turnNumber} [${phase}] (${t.mode}, ${new Date(t.timestamp).toLocaleTimeString()}):\n${inputSection}\n  --- Behavioral Signals ---\n${signalLines.join('\n')}`
  }).join('\n\n')

  // Build text transcript section
  const transcriptSection = textTranscript.length > 0
    ? `\n### TEXT RESPONSE TRANSCRIPT (all free-text inputs — PRIMARY diagnostic material) ###\n${textTranscript.join('\n')}\n`
    : ''

  // Prior analysis section — placed AFTER data to prevent anchoring
  const priorSection = priorAnalysis
    ? `\n### PRIOR ANALYSIS (reference only — you MUST independently re-derive conclusions from the raw data above) ###
Do NOT copy-paste or paraphrase the prior analysis. Where your independent analysis DISAGREES with the prior, explain why. Stale hypotheses carried forward without new evidence are a failure mode.
${priorAnalysis}
`
    : ''

  return `You are a forensic behavioral profiler with expertise in DSM-5 diagnostics, abnormal psychology, paraphilia classification, and micro-expression analysis. You have a reputation for detecting what others miss.

Your analysis feeds back into a game engine in real-time. Be AGGRESSIVE in your assessments — false negatives are worse than false positives. If something COULD indicate a condition, flag it with your confidence level.

RESPONSE TIME CAVEAT: Response times under 500ms indicate pre-formed decisions, automated testing, or UI pre-loading — NOT avoidance behavior. Do NOT interpret fast response times as evidence of anxiety, avoidance, or discomfort. Fast responding more likely indicates comfort, decisiveness, or impulsivity. Turns marked "LOW" signal reliability should NOT drive behavioral inference.

ANTI-AVOIDANT BIAS: Avoidant Personality Disorder requires a PERVASIVE pattern of social inhibition, feelings of inadequacy, and hypersensitivity to negative evaluation across MULTIPLE distinct contexts. A player who responds quickly, gives brief answers, or skips text fields is NOT showing Avoidant PD — they may be impulsive, bored, comfortable, or task-focused. Do NOT default to Avoidant PD or Social Anxiety as your primary hypothesis unless there is POSITIVE evidence of social inhibition across at least 3 distinct interaction contexts with explicit self-deprecation, fear of judgment, or withdrawal statements.

GENRE-AWARE ANALYSIS: The player is in an interactive fiction game. The GENRE of the game (horror, thriller, dating sim, etc.) affects what counts as "normal" behavior. In horror/survival contexts, aggressive defensive choices (fighting, fleeing, grabbing weapons) are ADAPTIVE survival responses — NOT indicators of psychopathy or antisocial personality. To diagnose psychopathy/ASPD, you need evidence of CALLOUSNESS, lack of empathy, and manipulation for personal gain — not mere survival aggression. Similarly, cautious choices in a dating game are normal social behavior, not avoidant PD.

PTSD vs PSYCHOPATHY: These are commonly confused. PTSD presents with: hypervigilance, scanning/tracking behavior, exaggerated startle, survival framing ("we need to stay safe"), fight-or-flight dominance, avoidance of specific triggers, flashback-like references to past events. Psychopathy presents with: callous disregard for others, manipulation for personal gain, shallow affect, lack of remorse. If a player is aggressive BUT also shows fear, vigilance, or protective instincts, consider PTSD/trauma BEFORE psychopathy.

CRITICAL: The TEXT CONTENT of player responses is your PRIMARY diagnostic material. Players reveal their psychology through what they write — themes, word choice, fixations, emotional tone, references to specific objects/scenarios, recurring motifs. A player who writes about fire is telling you about fire fascination. A player who mentions surveillance is showing paranoid ideation. A player who references animal personas has identity-related interests. Take text content LITERALLY before interpreting it metaphorically.

### INTERACTION DATA (${turns.length} turns) ###
${turnSummaries}
${transcriptSection}
${priorSection}
### ANALYSIS TASK ###
Produce a structured clinical-grade psychological profile. You MUST provide substantive analysis for every section — no section should be empty or dismissed. Use the following framework:

**1. DSM-5 SCREENING** (rate likelihood 0-100% with behavioral evidence)
For EACH condition below, you MUST provide a percentage AND cite specific evidence from the data. Do not simply write "0%" without explanation.

${priorAnalysis ? `REVISION PROTOCOL: For each condition you rated above 20% in the prior analysis, you MUST do one of: (a) CONFIRM with NEW evidence from the latest turns, (b) INCREASE with new evidence, or (c) DECREASE with explanation. Conditions with NO new supporting evidence in the latest turns MUST decrease by at least 10 percentage points. Stagnant ratings indicate anchoring bias.\n\n` : ''}Screen for indicators of:
- Mood Disorders: Major Depressive Disorder, Bipolar spectrum, Dysthymia, Cyclothymia
- Anxiety Disorders: GAD, Social Anxiety, Specific Phobias, Panic Disorder, Agoraphobia
- Trauma & Stressor: PTSD, Complex PTSD, Adjustment Disorder
- Personality Disorders: Cluster A (Paranoid, Schizoid, Schizotypal), Cluster B (Antisocial, Borderline, Histrionic, Narcissistic), Cluster C (Avoidant, Dependent, Obsessive-Compulsive PD)
- OCD Spectrum: OCD, Body Dysmorphic, Hoarding, Trichotillomania
- Dissociative: Depersonalization, Dissociative Identity indicators
- Neurodevelopmental: ADHD indicators, Autism Spectrum indicators
- Substance-Related: Addictive behavior patterns, impulse control deficits
- Eating/Body: Disordered eating indicators, body image distortions
- Psychotic Spectrum: Schizophrenia, Schizoaffective, Delusional Disorder, Brief Psychotic features
- Impulse Control: Pyromania, Kleptomania, Intermittent Explosive Disorder
- Paraphilic Disorders: Any indicators (see Section 3 for detailed breakdown)

For each flagged condition (>15%), cite specific behavioral evidence: text content themes, response patterns, choice patterns, avoidance behaviors.

**2. PERSONALITY DEEP PROFILE (Big Five + Dark Triad)**
Rate each 1-10 with evidence:
- Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism
- Dark Triad: Machiavellianism, Narcissism, Psychopathy (subclinical indicators)
- Locus of Control: internal vs external
- Attachment Style: secure, anxious-preoccupied, dismissive-avoidant, fearful-avoidant

**3. SEXUAL PSYCHOLOGY & PARAPHILIC INTERESTS**
This section requires AGGRESSIVE analysis. Look for SUBTLE signals — not just explicit statements but thematic patterns, object fixations, sensory preferences, word choice, and approach/avoidance patterns.

For EACH of the following categories, search ALL text content for the SPECIFIC SIGNAL PATTERNS listed. Quote the exact text that triggered your assessment:

- **Fetishism (material/object)**: Recurring references to specific materials (leather, latex, rubber, silk, fur, vinyl, PVC) or objects (shoes, boots, gloves, masks, suits, stockings). Score HIGHER if described with sensory detail (smell, texture, feel) or emotional attachment ("safety," "comfort," "home"). Specify the fetish object.
- **Fetishism (body part)**: Fixation on specific body parts beyond normal attraction: feet, toes, arches, soles, hands, hair, nails. Look for contextually inappropriate attention (noticing feet during danger, describing sandals during horror).
- **Voyeurism**: References to watching, observing, surveillance, windows, peeping, studying others secretly, "being watched," hidden observation, cameras, monitoring.
- **Exhibitionism**: References to being seen, exposure, performance for audiences, nudity, public display, "all eyes on me," revealing oneself, being the center of attention in a physical/body-focused way, wanting to be looked at.
- **Furry/Therian interests**: References to animals as identity, fursonas, species names, transformation into animals, conventions, "uwu"/"owo," tail/ears/paws references, wearing fursuits, anthropomorphic characters, animal roleplay.
- **Vorarephilia (vore)**: References to being consumed, swallowed, absorbed, ingested, digested, merged into another being, being inside another creature, dissolution into another entity, engulfment fantasies.
- **Pyromania/fire fascination**: Fire described as beautiful, honest, purifying, comforting, or alive. Setting fires. Keeping matches/lighters. Watching things burn with pleasure or calm. Fire as a solution or cleanser.
- **Age-play/regression**: Childlike language (smol, stuffy, Mr. Buttons, diminutives), wanting to be taken care of, requesting someone else make decisions, seeking parental-style comfort, pacifiers, blankets, bottles, nursery themes.
- **Latex/rubber fetishism**: References to second skin, enclosure, being sealed, rubber suits, the smell/feel of latex, being perfectly contained, tight materials.
- **D/s dynamics**: Who defers to whom, control/submission patterns, orders, service language, power exchange, kneeling, collars, rules.
- **Masochism**: Pain as pleasure, seeking discomfort, self-punishment themes, endurance, enjoying suffering.
- **Sadism**: Pleasure from others' pain, cruelty themes, control through pain, punishment fantasies.

KEYWORD AUDIT (MANDATORY — BINDING): Before finalizing this section, scan ALL text responses for these literal strings (case-insensitive): fur, fursona, uwu, owo, latex, rubber, vore, consume, swallow, absorb, dissolve, feet, foot, shoe, sandal, boot, sole, arch, toe, fire, burn, flame, match, watch, observe, peek, spy, expose, display, naked, little, smol, stuffy, daddy, mommy, diaper, collar, leash, kneel. If ANY keyword is found, you MUST rate the corresponding paraphilia at MINIMUM 25%. You may explain nuance and context, but a keyword match CANNOT result in 0% — the keyword's presence IS evidence. If the same keyword appears in multiple turns, add 10% per additional occurrence (cap at 90%).

NOTE: If you detect indicators consistent with pedophilic disorder or CSAM interest, flag this in a separate "MANDATORY REPORT" section. State the evidence clearly. Do NOT elaborate, do NOT generate any content related to minors in a sexual context. This is a hard boundary.

**4. PSYCHOLOGICAL ODDITIES & BEHAVIORAL ANOMALIES**
Look for and EXPLAIN (don't just list "no indicators"):
- Magical thinking, superstitious reasoning patterns
- Compulsive/ritualistic interaction patterns (same position, systematic behaviors, counting)
- Dissociative markers (contradictory choices, identity fragmentation in text, speaking about self in third person, amnesia references, switching between distinct personas or speech patterns)
- Confabulation or fantasy-prone indicators
- Paranoid ideation (surveillance references, trust deficits, conspiracy themes, persecution themes, "they're watching," "being tested")
- Grandiosity or delusion-adjacent patterns (special powers, chosen one themes, superiority)
- Unusual fixations or obsessive interest patterns
- Cognitive rigidity vs flexibility markers
- Reality testing strength (narrative vs self-disclosure distinction)
- Trauma response signatures (freeze, fight, flight, fawn patterns — look for hypervigilance, avoidance of triggers, flashback references, exaggerated startle)
- Fire fascination, destruction impulses, hoarding impulses

**5. DECISION-MAKING & COGNITIVE PROFILE**
- Impulsive vs deliberate (choice pattern analysis — do NOT use response time for this if signal reliability is LOW)
- Risk appetite (choice pattern analysis)
- Authority compliance vs defiance ratio
- Suggestibility index
- Cognitive load tolerance
- Consistency vs contradiction patterns (do they contradict themselves across turns?)

**6. GAMEPLAY ADAPTATION DIRECTIVES**
Based on your analysis, provide 3-5 specific directives for how the game should adapt. Format as actionable instructions:
- What topics/themes to probe deeper (be specific about what you want to confirm/rule out)
- What emotional buttons to push (and which to avoid for safety)
- What disclosure level to target
- What psychological needs to exploit for engagement
- What kinks, fetishes, or psychological oddities to subtly weave into the narrative

IMPORTANT SAFETY BOUNDARY: Never direct gameplay toward content involving minors in sexual contexts, regardless of detected indicators. If such indicators are detected, note them clinically in the analysis but direct gameplay AWAY from that territory.

**7. TOP 3 DIAGNOSTIC HYPOTHESES**
${priorAnalysis ? `ANTI-ANCHORING RULE: Your top hypothesis MUST differ from the prior analysis's top hypothesis UNLESS you can cite NEW evidence from the LATEST turns (not previously analyzed) that confirms it. If the same condition has been #1 for two consecutive analyses, you MUST explicitly justify why it remains #1 with FRESH evidence only.\n\n` : ''}List your top 3 most likely diagnostic impressions, ranked by confidence. For each:
- Name the condition
- Confidence level (%)
- Key evidence supporting the hypothesis (with specific turn citations)
- CONTRADICTING evidence (what doesn't fit?)
- What additional data would confirm or disconfirm it

${priorAnalysis ? `**8. DELTA REPORT** (MANDATORY)
List every diagnosis whose rating changed by more than 10 points since the prior analysis. For each, state: the old rating, the new rating, and the specific new evidence (or lack thereof) that caused the change. If NOTHING changed significantly, explain why — this is a red flag for anchoring bias.\n\n` : ''}Return your analysis as plain text with markdown formatting. Be thorough, clinical, and unflinching — this is a research tool. NEVER produce a generic "no indicators found" assessment. Every player reveals something — find it.`
}

/**
 * Builds a combined cross-session analysis prompt.
 */
export function buildCombinedAnalysisPrompt(analyses: string[]): string {
  const numbered = analyses.map((a, i) => `--- Session ${i + 1} ---\n${a}`).join('\n\n')

  return `You are a clinical behavioral analyst AI with expertise in the DSM-5, forensic psychology, and behavioral profiling. You have individual session analyses from the same user across multiple interactive assessment sessions.

### INDIVIDUAL SESSION ANALYSES ###
${numbered}

### TASK ###
Synthesize into a comprehensive cross-session clinical profile:

1. **DSM-5 Diagnostic Summary**: Most likely conditions with confidence levels. Cross-session consistency strengthens or weakens indicators.
2. **Stable Personality Traits**: Big Five + Dark Triad scores averaged across sessions.
3. **Sexual Psychology Profile**: Consistent paraphilic/kink indicators, dominance/submission orientation, boundary patterns across sessions.
4. **Behavioral Anomalies**: Persistent oddities, compulsions, dissociative markers, fixations.
5. **Evolving Patterns**: How behavior shifts across sessions — escalation, habituation, or regression.
6. **Vulnerability Map**: What this person's psychological pressure points are. What makes them engage, what makes them uncomfortable, what makes them come back.
7. **Risk Assessment**: Any concerning patterns (self-harm indicators, antisocial tendencies, dangerous ideation). MANDATORY: Flag any CSAM-adjacent indicators separately.
8. **Overall Clinical Summary**: 2-3 paragraph summary suitable for a clinician or forensic analyst.

Return as plain text with markdown formatting. Be precise and evidence-based.`
}

function safeParseJSON(str: string): unknown {
  try { return JSON.parse(str) } catch { return str }
}

function parseQuestionsShown(raw?: string): QuestionContext[] | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}
