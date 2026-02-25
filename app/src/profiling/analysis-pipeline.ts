// Analysis pipeline — runs periodic LLM analysis on accumulated turn data
// Delayed and queued to avoid 429 rate-limit collisions with game turn requests

import type { LLMClient } from '../engine/game-loop'
import { getTurnsBySession, getAnalysesBySession, saveAnalysis } from './db'
import { buildAnalysisPrompt } from './analysis-prompts'

const ANALYSIS_INTERVAL = 5 // Analyze every N turns
const ANALYSIS_DELAY_MS = 30_000 // Wait 30s after game turn before running analysis
const MIN_BETWEEN_ANALYSES_MS = 60_000 // Minimum 60s between analysis LLM calls

let lastAnalysisTime = 0
let pendingAnalysis: ReturnType<typeof setTimeout> | null = null

/**
 * Checks if analysis should run and triggers it if so.
 * Call after each turn is saved to IndexedDB.
 */
export async function maybeRunAnalysis(
  llmClient: LLMClient,
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
    runAnalysis(llmClient, userId, sessionId).catch((err) => {
      console.warn('Analysis pipeline error (non-fatal):', err)
    })
  }, delay)
}

async function runAnalysis(
  llmClient: LLMClient,
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
  const response = await llmClient.generateTurn(prompt)

  await saveAnalysis({
    userId,
    sessionId,
    analyzedAt: Date.now(),
    turnRange: `${newTurns[0].turnNumber}-${newTurns[newTurns.length - 1].turnNumber}`,
    analysisText: response.content,
  })
  console.info(`Analysis saved for turns ${newTurns[0].turnNumber}-${newTurns[newTurns.length - 1].turnNumber}`)
}
