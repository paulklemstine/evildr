// Analysis pipeline — runs background LLM analysis on accumulated turn data
// Uses Gemini Flash via Pollinations (fast, capable, free tier)
// Runs completely independently of game turns — no contention for the fast model

import { getTurnsBySession, getAnalysesBySession, saveAnalysis, getSessionsByUser } from './db'
import { buildAnalysisPrompt } from './analysis-prompts'
import { uploadReport } from '../api/report-uploader'

// Adaptive analysis schedule: faster initial calibration, then spreads out
const ANALYSIS_TURNS = [3, 5, 8, 12, 17, 23, 30] as const
const ANALYSIS_INTERVAL_AFTER = 10 // Every 10 turns after the last scheduled turn
const ANALYSIS_DELAY_MS = 10_000 // Wait 10s after game turn (deep route doesn't compete)
const MIN_BETWEEN_ANALYSES_MS = 30_000 // Minimum 30s between analysis calls

// Background analysis routes through the same Pollinations proxy.
// In dev: Vite proxy → Cloudflare Worker → Pollinations.
// In prod: Cloudflare Worker → Pollinations.
const DEEP_PROXY = import.meta.env.DEV
  ? '/api/llm-deep'
  : 'https://drevil-proxy.drevil.workers.dev/api/llm-deep'

let lastAnalysisTime = 0
let analysisRunning = false
const analysisQueue: Array<{ userId: string; sessionId: string }> = []

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
  // Adaptive trigger: analyze at scheduled turns, then every ANALYSIS_INTERVAL_AFTER
  if (!shouldAnalyzeAtTurn(turnNumber)) {
    return
  }

  // Queue the analysis instead of cancelling previous ones
  analysisQueue.push({ userId, sessionId })

  // If not already processing, start the queue
  if (!analysisRunning) {
    processQueue()
  }
}

/** Check if analysis should run at this turn number. */
function shouldAnalyzeAtTurn(turnNumber: number): boolean {
  if ((ANALYSIS_TURNS as readonly number[]).includes(turnNumber)) return true
  const lastScheduled = ANALYSIS_TURNS[ANALYSIS_TURNS.length - 1]
  if (turnNumber > lastScheduled && (turnNumber - lastScheduled) % ANALYSIS_INTERVAL_AFTER === 0) return true
  return false
}

/** Process queued analyses sequentially with minimum gaps. */
async function processQueue(): Promise<void> {
  if (analysisRunning) return
  analysisRunning = true

  while (analysisQueue.length > 0) {
    // Enforce minimum gap between analyses
    const timeSinceLast = Date.now() - lastAnalysisTime
    const delay = Math.max(ANALYSIS_DELAY_MS, MIN_BETWEEN_ANALYSES_MS - timeSinceLast)
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay))
    }

    // Take the latest entry — if multiple accumulated, skip to the most recent
    const latest = analysisQueue[analysisQueue.length - 1]
    analysisQueue.length = 0

    try {
      await runAnalysis(latest.userId, latest.sessionId)
    } catch (err) {
      console.warn('Analysis pipeline error (non-fatal):', err)
    }
  }

  analysisRunning = false
}

async function runAnalysis(
  userId: string,
  sessionId: string,
): Promise<void> {
  const turns = await getTurnsBySession(sessionId)
  if (turns.length === 0) return

  const priorAnalyses = await getAnalysesBySession(sessionId)
  const lastAnalysis = priorAnalyses.length > 0
    ? priorAnalyses[priorAnalyses.length - 1].analysisText
    : undefined

  // Always send ALL turns — the prompt includes prior analysis for continuity
  // This ensures the model sees the full picture, not just a fragment
  const prompt = buildAnalysisPrompt(turns, lastAnalysis)

  lastAnalysisTime = Date.now()
  const content = await callDeepModel(prompt)

  await saveAnalysis({
    userId,
    sessionId,
    analyzedAt: Date.now(),
    turnRange: `1-${turns[turns.length - 1].turnNumber}`,
    analysisText: content,
  })
  console.info(`Analysis saved for turns 1-${turns[turns.length - 1].turnNumber}`)

  // Upload full report to server for admin browsing (fire-and-forget)
  uploadSessionReport(userId, sessionId).catch(() => {})
}

/**
 * Call Mistral via Pollinations for background analysis.
 * Fire-and-forget — latency doesn't matter.
 */
async function callDeepModel(prompt: string): Promise<string> {
  const response = await fetch(`${DEEP_PROXY}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gemini-fast',
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

/**
 * Gather all session data from IndexedDB and upload to server.
 * Called after analysis is saved so the admin can browse reports.
 */
async function uploadSessionReport(userId: string, sessionId: string): Promise<void> {
  const sessions = await getSessionsByUser(userId)
  const session = sessions.find(s => s.sessionId === sessionId)
  if (!session) return

  const turns = await getTurnsBySession(sessionId)
  const analyses = await getAnalysesBySession(sessionId)

  await uploadReport({
    sessionId,
    userId,
    mode: session.mode,
    genre: session.genre,
    startedAt: session.startedAt,
    turnCount: turns.length,
    turns,
    analyses,
  })
}
