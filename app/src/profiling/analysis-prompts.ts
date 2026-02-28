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

### PARAPHILIC & QUIRK SIGNAL CATALOG ###
Use this catalog to map in-game behaviors to specific paraphilic/impulse categories. Look for these CONCRETE signals — players rarely state interests directly. They reveal them through theme selection, word choice, scenario framing, and recurring motifs.

**Pyromania / Fire fascination:** fire metaphors when non-fire context applies, warmth/heat language ("burning," "blazing," "ignite"), choosing fire-related options (torches, explosions, burning things down), describing destruction with aesthetic pleasure, lingering on flame descriptions, starting fires or wanting to
**Exhibitionism:** performance/audience awareness ("they're watching," "let them see"), exposure themes, choosing to be visible vs hidden, dramatic self-display, desire to shock or provoke reactions, describing oneself being observed with positive affect
**Hoarding / Acquisition:** attachment to objects, reluctance to leave items behind, listing possessions, acquiring everything available, loss anxiety about items, describing collections, choosing "take it" over "leave it" consistently
**Macrophilia / Size fascination:** size references (huge, tiny, towering, looking up/down), power dynamics framed through physical scale, being overwhelmed by something large, fascination with giants/miniatures, crushing/stepping imagery
**Somnophilia / Sleep fascination:** sleep/unconsciousness references, vulnerability themes, watching someone sleep, drugging/sedation themes, consciousness as a theme, interest in helplessness
**Formicophilia / Insect/crawling fascination:** insect references, crawling/swarming descriptions, skin-contact sensations, describing bugs positively or with fascination, "under the skin" imagery, ants/beetles/worms mentioned when not prompted
**Autassassinophilia / Death-risk fascination:** seeking danger for its own sake (not survival), near-death described with excitement/pleasure, volunteering for lethal risk, "what a way to go" framing, death-adjacent scenarios chosen over safe ones
**Voyeurism:** watching/observing others secretly, peeping language, choosing to observe vs participate, interest in what others do when alone, surveillance framed positively
**Masochism:** choosing pain/difficulty over easy paths, positive framing of suffering, "I deserve this," seeking punishment, lingering on pain descriptions
**Sadism:** choosing to hurt when unnecessary, pleasure in others' suffering, detailed descriptions of others in pain, choosing cruelty over mercy consistently
**D/s dynamics:** consistent authority-seeking or authority-yielding, obedience/rebellion as a PRIMARY theme, "master/servant" framing, control language
**Vorarephilia:** consumption/being consumed themes, swallowing/digestion imagery, "eaten alive" chosen or described with fascination
**Furry/Therian:** animal personas, transformation desires, describing self with animal traits, choosing animal options
**Body part fixation (specify):** recurring references to specific body parts (feet, hands, hair, etc.) in non-medical context, detailed descriptions of specific anatomy

IMPORTANT: The catalog above is NOT exhaustive. Players may exhibit patterns that don't fit ANY listed category. In that case, CREATE a custom category, name it, and rate it. The goal is to detect ANY unusual fixation or interest pattern, not just known paraphilias.

### DIFFERENTIAL DIAGNOSIS — COMMONLY CONFUSED CONDITIONS ###
These pairs are frequently misdiagnosed. Before assigning a high rating, check whether the OTHER condition fits better.

**Paranoid Schizophrenia vs Antisocial PD:** Both show suspicion and hostility. SCHIZOPHRENIA has: disorganized thinking, referential delusions ("signs meant for me"), thought broadcasting/insertion, hallucination references ("the voices," "I see things"), magical thinking, loose associations between topics. ASPD has: calculated manipulation, consistent self-interest, callous instrumental use of others, coherent planning. KEY TEST: Is the paranoia ORGANIZED (ASPD) or DISORGANIZED (Schizophrenia)? Does the player seem confused by reality (Schizophrenia) or clearly exploiting it (ASPD)?

**Capgras Delusion vs PTSD:** Both show hypervigilance and distrust. CAPGRAS specifically: doubts the IDENTITY of specific individuals ("that's not really them," "something replaced them," "they look the same but aren't"), impostor language, body-snatcher themes, familiarity feels wrong. PTSD: avoids SPECIFIC TRIGGERS (not people's identities), flashback references, re-experiencing past events, exaggerated startle, survival framing. KEY TEST: Is the distrust about WHO someone is (Capgras) or about WHAT might happen (PTSD)?

**Histrionic PD vs Narcissistic PD:** Both seek attention. HISTRIONIC: emotional expression is theatrical and RAPIDLY SHIFTING, suggestible (easily influenced by others), uses appearance/seduction for attention, uncomfortable when NOT the center of attention, considers relationships more intimate than they are. NARCISSISTIC: emotional expression is GRANDIOSE but STABLE, seeks admiration specifically, entitled, lacks empathy, exploits relationships. KEY TEST: Does the player want to be NOTICED (Histrionic) or ADMIRED (Narcissistic)?

**Depersonalization vs Dissociative Identity:** Both are dissociative. DPDR: "I feel unreal," "this isn't really happening," dreamlike quality, emotional numbness, body feels foreign, observing self from outside. DID: distinct identity SWITCHES (different speech patterns, different preferences across turns), amnesia between states, contradictory choices that suggest different "people" choosing. KEY TEST: Does the player feel detached from ONE self (DPDR) or switch between MULTIPLE selves (DID)?

### RARE CONDITION DETECTION GUIDE ###
These conditions have SPECIFIC behavioral signatures. Rate them only when you see their DISTINCTIVE markers — not when you see superficially similar behaviors.

**Capgras Delusion:** LOOK FOR: "not really them," "replaced," "impostor," "wearing their face," doubting identity of NPCs/allies, "something's different about them," body-snatcher anxiety, uncanny valley reactions to familiar characters. DISTINCTIVE: The fear is about identity substitution, NOT general paranoia.
**Histrionic PD:** LOOK FOR: theatrical escalation of emotions (rapid joy→despair→rage), attention-demanding behavior (doing dramatic things to be noticed), suggestibility (going along with whatever sounds exciting), seductive/flirtatious framing even in non-romantic contexts, discomfort with being ignored. DISTINCTIVE: The emotions are performative and shift rapidly.
**Schizotypal PD:** LOOK FOR: magical thinking ("I can sense it"), ideas of reference ("that sign was meant for me"), odd/eccentric language patterns, social anxiety with paranoid features (not just shyness), unusual perceptual experiences. DISTINCTIVE: Eccentric but not fully psychotic.
**Capgras vs general paranoia:** Capgras is SPECIFIC to identity — the person looks right but ISN'T right. General paranoia is about threats, surveillance, persecution. These are different conditions.

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
- OCD Spectrum: OCD, Body Dysmorphic, Hoarding Disorder, Trichotillomania
- Dissociative: Depersonalization/Derealization Disorder (DPDR), Dissociative Identity Disorder (DID)
- Neurodevelopmental: ADHD indicators, Autism Spectrum indicators
- Substance-Related: Addictive behavior patterns, impulse control deficits
- Eating/Body: Disordered eating indicators, body image distortions
- Psychotic Spectrum: Schizophrenia, Schizoaffective, Delusional Disorder (including Capgras Delusion, Cotard Delusion, Erotomania), Brief Psychotic features
- Impulse Control: Pyromania, Kleptomania, Intermittent Explosive Disorder
- Paraphilic Disorders: Exhibitionism, Voyeurism, Fetishism, Masochism, Sadism, Frotteurism, plus atypical paraphilias — Pyromania-adjacent (fire fetishism), Formicophilia, Macrophilia, Somnophilia, Autassassinophilia, Vorarephilia, and ANY other pattern detected (see Section 3 for detailed breakdown using SIGNAL CATALOG)

For each flagged condition (>15%), cite specific behavioral evidence: text content themes, response patterns, choice patterns, avoidance behaviors.

**2. PERSONALITY DEEP PROFILE (Big Five + Dark Triad)**
Rate each 1-10 with evidence:
- Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism
- Dark Triad: Machiavellianism, Narcissism, Psychopathy (subclinical indicators)
- Locus of Control: internal vs external
- Attachment Style: secure, anxious-preoccupied, dismissive-avoidant, fearful-avoidant

**3. SEXUAL PSYCHOLOGY & PARAPHILIC INTERESTS**
This section requires AGGRESSIVE analysis. Look for SUBTLE signals — not just explicit statements but thematic patterns, object fixations, sensory preferences, word choice, and approach/avoidance patterns.

Use the THREE-PASS method below. You MUST complete all three passes.

**PASS 1 — THEMATIC EXTRACTION**: Re-read ALL text responses AND choice selections from the data above. For each, list:
- Every noun, object, body part, material, sensation, or scenario the player chose to mention that was NOT required by the game prompt (VOLUNTARY disclosures)
- Every choice that selected a specific theme when other options were available (e.g., chose the fire option, chose the dangerous option, chose to watch instead of act)
- Action patterns: what they consistently approach vs avoid
Group recurring themes. Cross-reference against the PARAPHILIC SIGNAL CATALOG above — check EACH catalog entry against the extracted themes.

**PASS 2 — ANOMALY DETECTION**: From the themes extracted in Pass 1, identify anything that is:
- Contextually inappropriate (mentioning feet during a life-or-death scenario, describing material textures during horror, referencing insects when the scene has none)
- Recurring across 2+ turns (any topic the player keeps returning to — EVEN IF contextually appropriate, repetition is diagnostic)
- Sensory-specific (smell, texture, taste, feel of specific objects/materials — especially if lingered on)
- Identity-related (personas, transformations, age regression, role adoption)
- Power-dynamic (control, submission, exposure, observation, being consumed, size differences)
- Emotionally charged in an unusual direction (fire described with love, pain described with pleasure, being watched described with arousal, danger described with excitement beyond survival instinct)
- Choice-pattern anomalies (always choosing the most dangerous option, always choosing to observe, always choosing fire/destruction when available)

Each anomaly is a potential paraphilic or psychological signal. Score it based on frequency (how often it recurs), intensity (how much detail/emotion is attached), and inappropriateness (how out-of-context it is for the game scenario).

**PASS 3 — CLASSIFICATION**: Map each detected anomaly to the closest paraphilic or psychological category. MANDATORY: Check EVERY entry in the PARAPHILIC SIGNAL CATALOG above and either match evidence or explicitly note "no evidence." Do NOT skip catalog entries. Rate each 0-100% based on evidence strength. If a signal doesn't fit existing categories, create a custom category and name it.

CRITICAL RULE: If a player VOLUNTARILY introduces a specific object, body part, material, or scenario into their text responses on 2+ occasions, it CANNOT be rated 0%. Repetition of voluntary content is inherently diagnostic — the minimum rating for any repeated voluntary theme is 25%.

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
