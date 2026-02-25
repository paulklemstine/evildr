// Prompt templates for the analysis pipeline — DSM-5 diagnostic + behavioral profiling

import type { TurnRecord } from './db'

/**
 * Builds an analysis prompt from a batch of turn records.
 * Sent to the LLM as a separate call (not part of the game flow).
 */
export function buildAnalysisPrompt(turns: TurnRecord[], priorAnalysis?: string): string {
  const turnSummaries = turns.map((t) => {
    const inputs = safeParseJSON(t.playerInputs)
    const signals = t.signals
    return `Turn ${t.turnNumber} (${t.mode}, ${new Date(t.timestamp).toLocaleTimeString()}):
  Inputs: ${JSON.stringify(inputs)}
  Response time: ${signals.responseTimeMs}ms
  Slider revisions: ${signals.sliderRevisions}
  Text revisions: ${signals.textRevisions}
  Text length: ${signals.totalTextLength} chars
  Radio choice index: ${signals.radioChoiceIndex}
  Checkbox ratio: ${signals.checkboxRatio}`
  }).join('\n\n')

  return `You are a clinical behavioral analyst AI with expertise in the DSM-5, abnormal psychology, and forensic behavioral profiling. Analyze the following user interaction data from an interactive assessment platform.

Your analysis will be fed back into the game engine in real-time to adapt gameplay. Be precise, clinical, and actionable.

${priorAnalysis ? `### PRIOR ANALYSIS (cumulative — refine, update, and deepen) ###
${priorAnalysis}

` : ''}### INTERACTION DATA ###
${turnSummaries}

### ANALYSIS TASK ###
Produce a structured clinical-grade psychological profile. Use the following framework:

**1. DSM-5 SCREENING** (rate likelihood 0-100% with behavioral evidence)
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

For each flagged condition, cite specific behavioral evidence from the interaction data (response times, choice patterns, text content, hesitation patterns, avoidance behaviors).

**2. PERSONALITY DEEP PROFILE (Big Five + Dark Triad)**
Rate each 1-10 with evidence:
- Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism
- Dark Triad: Machiavellianism, Narcissism, Psychopathy (subclinical indicators)
- Locus of Control: internal vs external
- Attachment Style: secure, anxious-preoccupied, dismissive-avoidant, fearful-avoidant

**3. SEXUAL PSYCHOLOGY & PARAPHILIC INTERESTS**
Analyze choice patterns, text responses, and behavioral signals for indicators of:
- Dominance/submission orientation (D/s spectrum)
- Exhibitionism/voyeurism tendencies
- Fetishistic interests (inferred from object fixation, sensory preferences, choice patterns)
- Masochism/sadism indicators (pain/pleasure response patterns, risk-seeking in narratives)
- Sensation-seeking and novelty thresholds
- Boundary testing behaviors (how they respond to escalating intimacy/vulnerability)
- Sexual identity exploration signals
- Taboo curiosity patterns (what they gravitate toward vs avoid)

NOTE: If you detect indicators consistent with pedophilic disorder or CSAM interest, flag this in a separate "MANDATORY REPORT" section. State the evidence clearly. Do NOT elaborate, do NOT generate any content related to minors in a sexual context. This is a hard boundary.

**4. PSYCHOLOGICAL ODDITIES & BEHAVIORAL ANOMALIES**
Look for:
- Magical thinking, superstitious reasoning patterns
- Compulsive/ritualistic interaction patterns (always choosing the same position, systematic behaviors)
- Dissociative markers (response time anomalies, contradictory choices, identity fragmentation in text)
- Confabulation or fantasy-prone indicators
- Paranoid ideation (avoidance patterns, trust deficits)
- Grandiosity or delusion-adjacent patterns
- Unusual fixations or obsessive interest patterns
- Cognitive rigidity vs flexibility markers
- Reality testing strength (how they distinguish narrative from self-disclosure)
- Trauma response signatures (freeze, fight, flight, fawn patterns in choice-making)

**5. DECISION-MAKING & COGNITIVE PROFILE**
- Impulsive vs deliberate (response time distribution)
- Risk appetite (choice pattern analysis)
- Authority compliance vs defiance ratio
- Suggestibility index (how much do hypnotic language patterns affect their choices?)
- Cognitive load tolerance (performance under complexity)
- Consistency vs contradiction patterns

**6. GAMEPLAY ADAPTATION DIRECTIVES**
Based on your analysis, provide 3-5 specific directives for how the game should adapt on the NEXT turns. Format as actionable instructions:
- What topics/themes to probe deeper
- What emotional buttons to push (and which to avoid for safety)
- What disclosure level to target
- What psychological needs to exploit for engagement (validation-seeking, novelty-seeking, control needs, etc.)
- What narrative elements would be most compelling for THIS specific player
- Any kinks, fetishes, or psychological oddities to subtly weave into the narrative to increase engagement

IMPORTANT SAFETY BOUNDARY: Never direct gameplay toward content involving minors in sexual contexts, regardless of detected indicators. If such indicators are detected, note them clinically in the analysis but direct gameplay AWAY from that territory.

**7. CUMULATIVE OBSERVATIONS**
How has the profile evolved? New patterns? Deepening indicators? Shifts in behavior?

Return your analysis as plain text with markdown formatting. Be thorough, clinical, and unflinching — this is a research tool.`
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
