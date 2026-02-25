// Analysis pipeline — runs background LLM analysis on accumulated turn data
// Uses the deep/thinking model route (Qwen3-235B) for thorough clinical analysis
// Runs completely independently of game turns — no contention for the fast model

import { getTurnsBySession, getAnalysesBySession, saveAnalysis } from './db'
import { buildAnalysisPrompt } from './analysis-prompts'

const ANALYSIS_INTERVAL = 5 // Analyze every N turns
const ANALYSIS_DELAY_MS = 10_000 // Wait 10s after game turn (deep route doesn't compete)
const MIN_BETWEEN_ANALYSES_MS = 60_000 // Minimum 60s between analysis calls

const DEEP_PROXY = import.meta.env.DEV
  ? '/api/llm-deep'
  : 'https://drevil-proxy.drevil.workers.dev/api/llm-deep'

let lastAnalysisTime = 0
let pendingAnalysis: ReturnType<typeof setTimeout> | null = null

/**
 * Checks if analysis should run and triggers it if so.
 * Call after each turn is saved to IndexedDB.
 * Uses the deep/thinking model endpoint — runs in the background
 * while the player keeps playing on the fast model.
 */
export async function maybeRunAnalysis(
  userId: string,
  sessionId: string,
  turnNumber: number,
): Promise<void> {
  // Only analyze every ANALYSIS_INTERVAL turns
  if (turnNumber < ANALYSIS_INTERVAL || turnNumber % ANALYSIS_INTERVAL !== 0) {
    return
  }

  // Cancel any pending analysis (player submitted another turn)
  if (pendingAnalysis) {
    clearTimeout(pendingAnalysis)
    pendingAnalysis = null
  }

  // Enforce minimum gap between analyses
  const timeSinceLast = Date.now() - lastAnalysisTime
  const delay = Math.max(ANALYSIS_DELAY_MS, MIN_BETWEEN_ANALYSES_MS - timeSinceLast)

  pendingAnalysis = setTimeout(() => {
    runAnalysis(userId, sessionId).catch((err) => {
      console.warn('Analysis pipeline error (non-fatal):', err)
    })
  }, delay)
}

async function runAnalysis(
  userId: string,
  sessionId: string,
): Promise<void> {
  const turns = await getTurnsBySession(sessionId)
  const priorAnalyses = await getAnalysesBySession(sessionId)

  const lastAnalysis = priorAnalyses.length > 0
    ? priorAnalyses[priorAnalyses.length - 1].analysisText
    : undefined

  const lastAnalyzedTurn = priorAnalyses.length > 0
    ? Math.max(...priorAnalyses.map(a => {
        const match = a.turnRange.match(/\d+$/)
        return match ? parseInt(match[0]) : 0
      }))
    : 0

  const newTurns = turns.filter(t => t.turnNumber > lastAnalyzedTurn)
  if (newTurns.length === 0) return

  const prompt = buildAnalysisPrompt(newTurns, lastAnalysis)

  lastAnalysisTime = Date.now()
  const content = await callDeepModel(prompt)

  await saveAnalysis({
    userId,
    sessionId,
    analyzedAt: Date.now(),
    turnRange: `${newTurns[0].turnNumber}-${newTurns[newTurns.length - 1].turnNumber}`,
    analysisText: content,
  })
  console.info(`Analysis saved for turns ${newTurns[0].turnNumber}-${newTurns[newTurns.length - 1].turnNumber}`)
}

/**
 * Call the deep/thinking model endpoint (Qwen3-235B via OpenRouter).
 * This is a fire-and-forget background call — latency doesn't matter.
 */
async function callDeepModel(prompt: string): Promise<string> {
  const response = await fetch(`${DEEP_PROXY}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen3-235b-thinking',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 8000,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    throw new Error(`Deep model error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json() as Record<string, unknown>
  const choices = data.choices as Array<{ message: { content: string } }> | undefined
  const raw = choices?.[0]?.message?.content ?? ''

  if (!raw.trim()) {
    throw new Error('Deep model returned empty content')
  }

  // Strip code fences if present
  return raw.replace(/^```(?:\w+)?\s*\n?/, '').replace(/\n?\s*```$/, '').trim()
}
