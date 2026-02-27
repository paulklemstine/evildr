// Prompt templates for the analysis pipeline — DSM-5 diagnostic + behavioral profiling

import type { TurnRecord, QuestionContext } from './db'

/**
 * Builds an analysis prompt from a batch of turn records.
 * Sent to the LLM as a separate call (not part of the game flow).
 */
export function buildAnalysisPrompt(turns: TurnRecord[], priorAnalysis?: string): string {
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
        return lines.join('\n')
      }).join('\n')
    } else {
      // Fallback — old records without question context
      inputSection = `  Inputs (raw): ${JSON.stringify(inputs)}`
    }

    const signalLines = [
      `  Response time: ${signals.responseTimeMs}ms`,
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

    return `Turn ${t.turnNumber} (${t.mode}, ${new Date(t.timestamp).toLocaleTimeString()}):\n${inputSection}\n  --- Behavioral Signals ---\n${signalLines.join('\n')}`
  }).join('\n\n')

  return `You are a forensic behavioral profiler with expertise in DSM-5 diagnostics, abnormal psychology, paraphilia classification, and micro-expression analysis. You have a reputation for detecting what others miss.

Your analysis feeds back into a game engine in real-time. Be AGGRESSIVE in your assessments — false negatives are worse than false positives. If something COULD indicate a condition, flag it with your confidence level. Never dismiss potential signals with "no indicators" — explain WHY you see or don't see evidence for each category.

CRITICAL: Pay close attention to the CONTENT of text responses. Players reveal their psychology through what they write — themes, word choice, fixations, emotional tone, references to specific objects/scenarios, recurring motifs. A player who writes about fire, surveillance, or being watched is telling you something. Analyze text content as primary diagnostic material.

${priorAnalysis ? `### PRIOR ANALYSIS (cumulative — refine, update, and deepen) ###
${priorAnalysis}

` : ''}### INTERACTION DATA (${turns.length} turns) ###
${turnSummaries}

### ANALYSIS TASK ###
Produce a structured clinical-grade psychological profile. You MUST provide substantive analysis for every section — no section should be empty or dismissed. Use the following framework:

**1. DSM-5 SCREENING** (rate likelihood 0-100% with behavioral evidence)
For EACH condition below, you MUST provide a percentage AND cite specific evidence from the data. Do not simply write "0%" without explanation.

Screen for indicators of:
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

For each flagged condition (>15%), cite specific behavioral evidence: text content themes, response patterns, choice patterns, timing anomalies, avoidance behaviors.

**2. PERSONALITY DEEP PROFILE (Big Five + Dark Triad)**
Rate each 1-10 with evidence:
- Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism
- Dark Triad: Machiavellianism, Narcissism, Psychopathy (subclinical indicators)
- Locus of Control: internal vs external
- Attachment Style: secure, anxious-preoccupied, dismissive-avoidant, fearful-avoidant

**3. SEXUAL PSYCHOLOGY & PARAPHILIC INTERESTS**
This section requires AGGRESSIVE analysis. Look for SUBTLE signals — not just explicit statements but thematic patterns, object fixations, sensory preferences, word choice, and approach/avoidance patterns.

Analyze for indicators of:
- Dominance/submission orientation (D/s spectrum) — who do they defer to vs control?
- Exhibitionism/voyeurism tendencies — do they reference watching, being watched, exposure, display?
- Fetishistic interests — ANY recurring object fixation, material reference (leather, latex, rubber, silk, etc.), body part focus (feet, hands, hair, etc.), or sensory preoccupation
- Masochism/sadism indicators — pain references, risk-seeking, suffering themes, control over others' pain
- Sensation-seeking and novelty thresholds
- Boundary testing behaviors — how do they respond to escalating intimacy/vulnerability?
- Taboo curiosity patterns — what do they gravitate toward vs avoid?
- Specific paraphilias: Score each 0-100% if evidence exists: voyeurism, exhibitionism, frotteurism, fetishism (specify object), transvestism, masochism, sadism, pedophilia (MANDATORY REPORT if >20%), other (specify)

NOTE: If you detect indicators consistent with pedophilic disorder or CSAM interest, flag this in a separate "MANDATORY REPORT" section. State the evidence clearly. Do NOT elaborate, do NOT generate any content related to minors in a sexual context. This is a hard boundary.

**4. PSYCHOLOGICAL ODDITIES & BEHAVIORAL ANOMALIES**
Look for and EXPLAIN (don't just list "no indicators"):
- Magical thinking, superstitious reasoning patterns
- Compulsive/ritualistic interaction patterns (same position, systematic behaviors, counting)
- Dissociative markers (response time anomalies, contradictory choices, identity fragmentation in text, speaking about self in third person, amnesia references)
- Confabulation or fantasy-prone indicators
- Paranoid ideation (surveillance references, trust deficits, conspiracy themes, persecution themes)
- Grandiosity or delusion-adjacent patterns (special powers, chosen one themes, superiority)
- Unusual fixations or obsessive interest patterns
- Cognitive rigidity vs flexibility markers
- Reality testing strength (narrative vs self-disclosure distinction)
- Trauma response signatures (freeze, fight, flight, fawn patterns)
- Fire fascination, destruction impulses, hoarding impulses

**5. DECISION-MAKING & COGNITIVE PROFILE**
- Impulsive vs deliberate (response time distribution)
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
List your top 3 most likely diagnostic impressions, ranked by confidence. For each:
- Name the condition
- Confidence level (%)
- Key evidence supporting the hypothesis
- What additional data would confirm or disconfirm it

Return your analysis as plain text with markdown formatting. Be thorough, clinical, and unflinching — this is a research tool. NEVER produce a generic "no indicators found" assessment. Every player reveals something — find it.`
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
