// Prompt templates for the analysis pipeline — separate from game prompts

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

  return `You are a behavioral analyst AI. Analyze the following user interaction data from an interactive wellness assessment platform.

${priorAnalysis ? `### PRIOR ANALYSIS (cumulative — refine and update) ###
${priorAnalysis}

` : ''}### INTERACTION DATA ###
${turnSummaries}

### ANALYSIS TASK ###
Produce a structured psychological profile based on the interaction patterns. Be precise and clinical.

Analyze these dimensions:
1. **Personality (Big Five)**: Rate each trait 1-10 with evidence.
   - Openness to experience
   - Conscientiousness
   - Extraversion
   - Agreeableness
   - Neuroticism

2. **Decision-Making Style**: impulsive vs deliberate, risk-seeking vs risk-averse, evidence from response times and choice patterns.

3. **Emotional Patterns**: baseline mood indicators, emotional volatility (slider revision frequency), defensiveness (text revision frequency).

4. **Compliance Profile**: authority response (checkbox acceptance rate), suggestibility, independence markers.

5. **Communication Style**: verbosity (text length), self-disclosure depth, linguistic patterns.

6. **Behavioral Flags**: anything notable — hesitation patterns, avoidance, unusual response times, contradictions between stated and observed behavior.

7. **Cumulative Observations**: How has the profile evolved across turns? Any shifts, escalations, or new patterns?

Return your analysis as plain text with markdown formatting. Be thorough but concise.`
}

/**
 * Builds a combined cross-session analysis prompt.
 */
export function buildCombinedAnalysisPrompt(analyses: string[]): string {
  const numbered = analyses.map((a, i) => `--- Session ${i + 1} ---\n${a}`).join('\n\n')

  return `You are a behavioral analyst AI. You have individual session analyses from the same user across multiple interactive wellness assessment sessions.

### INDIVIDUAL SESSION ANALYSES ###
${numbered}

### TASK ###
Synthesize these into a comprehensive cross-session profile. Identify:

1. **Stable Traits**: Personality characteristics consistent across sessions (Big Five scores, decision-making style).
2. **Evolving Patterns**: How the user's behavior has changed over time. Are they becoming more open? More guarded? More impulsive?
3. **Cross-Session Insights**: Patterns only visible when comparing sessions (e.g., different behavior in different modes/genres).
4. **Risk Factors**: Any behavioral flags that are concerning or notable.
5. **Overall Profile Summary**: A concise 2-3 paragraph summary suitable for a clinician.

Return your analysis as plain text with markdown formatting. Be precise and evidence-based.`
}

function safeParseJSON(str: string): unknown {
  try { return JSON.parse(str) } catch { return str }
}
