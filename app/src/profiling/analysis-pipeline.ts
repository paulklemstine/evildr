// Analysis pipeline — runs periodic LLM analysis on accumulated turn data

import type { LLMClient } from '../engine/game-loop'
import { getTurnsBySession, getAnalysesBySession, saveAnalysis } from './db'
import { buildAnalysisPrompt } from './analysis-prompts'

const ANALYSIS_INTERVAL = 5 // Analyze every N turns
const ANALYSIS_DELAY_MS = 15_000 // Wait before calling LLM to avoid 429 collisions with game turns

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

  try {
    const turns = await getTurnsBySession(sessionId)
    const priorAnalyses = await getAnalysesBySession(sessionId)

    // Get the most recent prior analysis text
    const lastAnalysis = priorAnalyses.length > 0
      ? priorAnalyses[priorAnalyses.length - 1].analysisText
      : undefined

    // Only analyze turns since the last analysis
    const lastAnalyzedTurn = priorAnalyses.length > 0
      ? Math.max(...priorAnalyses.map(a => {
          const match = a.turnRange.match(/\d+$/)
          return match ? parseInt(match[0]) : 0
        }))
      : 0

    const newTurns = turns.filter(t => t.turnNumber > lastAnalyzedTurn)
    if (newTurns.length === 0) return

    const prompt = buildAnalysisPrompt(newTurns, lastAnalysis)

    // Fire-and-forget — delay to avoid 429 rate-limit collisions with game turn requests
    const delayed = () => new Promise<void>(resolve => setTimeout(resolve, ANALYSIS_DELAY_MS))
    delayed().then(() => llmClient.generateTurn(prompt)).then(async (response) => {
      await saveAnalysis({
        userId,
        sessionId,
        analyzedAt: Date.now(),
        turnRange: `${newTurns[0].turnNumber}-${newTurns[newTurns.length - 1].turnNumber}`,
        analysisText: response.content,
      })
      console.info(`Analysis saved for turns ${newTurns[0].turnNumber}-${newTurns[newTurns.length - 1].turnNumber}`)
    }).catch((err) => {
      console.warn('Analysis pipeline error (non-fatal):', err)
    })
  } catch (err) {
    console.warn('Analysis pipeline error (non-fatal):', err)
  }
}
