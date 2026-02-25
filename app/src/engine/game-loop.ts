// ============================================================================
// game-loop.ts - Turn lifecycle manager for the DrEvil game engine
// ============================================================================

import type { UIElement, RenderResult } from './renderer.ts'
import { renderUI, collectInputState } from './renderer.ts'
import { saveGameState, loadGameState as loadSavedState } from './auto-save.ts'
import { InputTracker } from '../profiling/input-tracker'
import { saveTurn, saveSession, updateSession } from '../profiling/db'
import { maybeRunAnalysis } from '../profiling/analysis-pipeline'
import { applyTypewriter } from './typewriter'
import { showAnticipation, cascadeReveal, pulseInteractive } from './anticipation'
import { attachCelebrations } from './celebration'
import { saveCliffhanger, extractCliffhanger } from './session-hooks'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Response shape expected from the LLM client. */
export interface LLMResponse {
  content: string
  model: string
  tokensUsed: number
}

/** Minimal interface the game loop expects from the LLM client. */
export interface LLMClient {
  /** Send a prompt string and receive a structured response. */
  generateTurn(prompt: string): Promise<LLMResponse>
}

/** Minimal interface the game loop expects from the image client. */
export interface ImageClient {
  /** Resolve an image prompt into a displayable URL. */
  getImageUrl(prompt: string): string
}

/**
 * Prompt builder interface compatible with the mode-registry's PromptBuilder.
 *
 * The game loop calls `buildFirstTurnPrompt()` on the first turn (no history),
 * and `buildTurnPrompt()` on all subsequent turns.
 */
export interface PromptBuilder {
  buildFirstTurnPrompt(): string
  buildTurnPrompt(
    playerActions: string,
    history: HistoryEntry[],
    notes: string,
  ): string
}

/** A single entry in the rolling history queue. */
export interface HistoryEntry {
  ui: string
  actions: string
}

/** The complete serialisable game state. */
export interface GameState {
  historyQueue: HistoryEntry[]
  currentUiJson: UIElement[] | null
  currentNotes: string
  currentSubjectId: string
  turnNumber: number
  mode: string
  /** The most recent gemini_facing_analysis content, for display in modals. */
  hiddenAnalysis: string
  /** The most recent tweet content from the LLM response. */
  hiddenTweet: string
}

/** Configuration required to initialise the game loop. */
export interface GameLoopConfig {
  container: HTMLElement
  llmClient: LLMClient
  imageClient: ImageClient
  promptBuilder: PromptBuilder
  /** Called whenever the internal state changes (after render, after load, etc.). */
  onStateChange: (state: GameState) => void
  /** Called when a non-fatal error should be displayed to the player. */
  onError: (message: string) => void
  /** Called when loading state changes (start/end of LLM call). */
  onLoading: (loading: boolean) => void
  /** The mode identifier used for auto-save key derivation (e.g. "geems", "cyoa"). */
  mode?: string
  /** Optional genre (used by CYOA). Passed through for the mode prompt builder. */
  genre?: string
  /** Persistent user ID for profiling */
  userId?: string
  /** Unique session ID for profiling */
  sessionId?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_HISTORY_SIZE = 20

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse a raw LLM response string into a UIElement[].
 *
 * Handles:
 *  - Markdown code fences (` ```json ... ``` `)
 *  - Wrapped objects (`{ "ui": [...] }`)
 *  - Bare arrays (`[...]`)
 *  - Mixed content: markdown/text before or after the JSON
 */
function parseLLMResponse(raw: string): UIElement[] {
  let text = raw.trim()

  // Strip optional markdown code fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (fenceMatch?.[1]) {
    text = fenceMatch[1].trim()
  }

  // Try direct parse first
  try {
    const parsed: unknown = JSON.parse(text)
    return extractUIArray(parsed, text)
  } catch {
    // Direct parse failed — try to extract JSON from mixed content
  }

  // Find the first '[' and last ']' to extract an embedded JSON array
  const firstBracket = text.indexOf('[')
  const lastBracket = text.lastIndexOf(']')
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    try {
      const arrayText = text.substring(firstBracket, lastBracket + 1)
      const parsed: unknown = JSON.parse(arrayText)
      if (Array.isArray(parsed)) {
        return parsed as UIElement[]
      }
    } catch {
      // Array extraction failed
    }
  }

  // Find the first '{' and last '}' to extract an embedded JSON object
  const firstBrace = text.indexOf('{')
  const lastBrace = text.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      const objText = text.substring(firstBrace, lastBrace + 1)
      const parsed: unknown = JSON.parse(objText)
      return extractUIArray(parsed, objText)
    } catch {
      // Object extraction failed
    }
  }

  throw new Error(
    `LLM response is not valid JSON. Snippet: ${text.substring(0, 200)}...`,
  )
}

/** Extract a UIElement[] from a parsed JSON value. */
function extractUIArray(parsed: unknown, textForError: string): UIElement[] {
  if (Array.isArray(parsed)) {
    return parsed as UIElement[]
  }

  if (parsed && typeof parsed === 'object' && 'ui' in parsed) {
    const wrapped = parsed as { ui: unknown }
    if (Array.isArray(wrapped.ui)) {
      return wrapped.ui as UIElement[]
    }
  }

  throw new Error(
    `LLM response is not a valid UI array. Snippet: ${textForError.substring(0, 200)}...`,
  )
}

// ---------------------------------------------------------------------------
// GameLoop class
// ---------------------------------------------------------------------------

/**
 * Manages the turn lifecycle: collecting inputs, calling the LLM,
 * parsing the response, rendering the UI, resolving images, and auto-saving.
 */
export class GameLoop {
  private config: GameLoopConfig
  private state: GameState
  private inputTracker: InputTracker
  private cleanupCelebrations: (() => void) | null = null

  constructor(config: GameLoopConfig) {
    this.config = config
    this.state = this.createDefaultState()
    this.inputTracker = new InputTracker(config.container)

    // Create session record in IndexedDB
    if (config.userId && config.sessionId) {
      saveSession({
        sessionId: config.sessionId,
        userId: config.userId,
        mode: config.mode ?? 'default',
        genre: config.genre,
        startedAt: Date.now(),
        turnCount: 0,
      }).catch(() => { /* IndexedDB may not be available */ })
    }

    // Attempt to restore from localStorage
    const saved = loadSavedState(this.storageKey())
    if (saved) {
      this.state = { ...this.createDefaultState(), ...saved, mode: this.state.mode }
      if (this.state.currentUiJson) {
        const renderResult = renderUI(this.config.container, this.state.currentUiJson)
        this.applyRenderResult(renderResult)
        this.resolveImages()
      }
      this.config.onStateChange(this.getState())
    }
  }

  // ---- State management ----

  private createDefaultState(): GameState {
    return {
      historyQueue: [],
      currentUiJson: null,
      currentNotes: '',
      currentSubjectId: '',
      turnNumber: 0,
      mode: this.config.mode ?? 'default',
      hiddenAnalysis: '',
      hiddenTweet: '',
    }
  }

  private storageKey(): string {
    return `drevil-${this.state.mode}-state`
  }

  /**
   * Return a deep copy of the current game state.
   */
  getState(): GameState {
    return JSON.parse(JSON.stringify(this.state)) as GameState
  }

  // ---- History management ----

  /**
   * Updates the history queue with the previous turn's UI and the player's actions.
   * Caps at MAX_HISTORY_SIZE and deduplicates consecutive identical entries.
   */
  private updateHistory(playerActionsJson: string): void {
    if (!this.state.currentUiJson) return

    const entry: HistoryEntry = {
      ui: JSON.stringify(this.state.currentUiJson),
      actions: playerActionsJson || '{}',
    }

    // Deduplicate: skip if the last entry is identical
    const last = this.state.historyQueue[this.state.historyQueue.length - 1]
    if (last && last.ui === entry.ui && last.actions === entry.actions) {
      return
    }

    if (this.state.historyQueue.length >= MAX_HISTORY_SIZE) {
      this.state.historyQueue.shift()
    }

    this.state.historyQueue.push(entry)
  }

  // ---- Rendering helpers ----

  /**
   * After rendering, walk the container to find `<img>` elements with a
   * `data-image-prompt` attribute and resolve their `src` via the image client.
   */
  private resolveImages(): void {
    this.config.container
      .querySelectorAll<HTMLImageElement>('img[data-image-prompt]')
      .forEach((img) => {
        const prompt = img.dataset.imagePrompt
        if (prompt) {
          img.src = this.config.imageClient.getImageUrl(prompt)
        }
      })
  }

  /**
   * Apply the hidden field values from a RenderResult into the current state.
   */
  private applyRenderResult(result: RenderResult): void {
    if (result.notes) this.state.currentNotes = result.notes
    if (result.subjectId) this.state.currentSubjectId = result.subjectId
    if (result.analysis) this.state.hiddenAnalysis = result.analysis
    if (result.tweet) this.state.hiddenTweet = result.tweet
  }

  // ---- Public API ----

  /**
   * Submit a turn: collect inputs, call the LLM, render the response, auto-save.
   */
  async submitTurn(): Promise<void> {
    const { container, llmClient, promptBuilder, onStateChange, onError, onLoading } = this.config

    // 1. Collect current inputs and behavioral signals
    const behavioralSignals = this.inputTracker.collect()
    const playerActionsJson = collectInputState(container, this.state.turnNumber + 1)

    // 2. Update history with previous turn
    this.updateHistory(playerActionsJson)

    // 3. Build prompt
    const isFirstTurn = this.state.historyQueue.length === 0 && this.state.currentUiJson === null
    let prompt: string
    if (isFirstTurn) {
      prompt = promptBuilder.buildFirstTurnPrompt()
    } else {
      prompt = promptBuilder.buildTurnPrompt(
        playerActionsJson,
        this.state.historyQueue,
        this.state.currentNotes,
      )
    }

    // 4. Call LLM
    onLoading(true)

    let uiJsonArray: UIElement[]
    try {
      const response = await llmClient.generateTurn(prompt)
      uiJsonArray = parseLLMResponse(response.content)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      onError(`LLM error: ${message}`)
      onLoading(false)
      return
    }

    // 5. Update state
    this.state.currentUiJson = uiJsonArray
    this.state.turnNumber += 1

    // 6. Show anticipation overlay (variable delay for dopamine priming)
    if (this.state.turnNumber > 1) {
      await showAnticipation(container)
    }

    // 7. Render UI
    try {
      const renderResult = renderUI(container, uiJsonArray)
      this.applyRenderResult(renderResult)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      onError(`Render error: ${message}`)
      onLoading(false)
      return
    }

    // 8. Resolve image URLs
    this.resolveImages()

    // 9. Apply dopamine effects: cascade reveal, typewriter, celebrations, pulse
    cascadeReveal(container)
    applyTypewriter(container)
    pulseInteractive(container)
    if (this.cleanupCelebrations) this.cleanupCelebrations()
    this.cleanupCelebrations = attachCelebrations(container)

    // 10. Save cliffhanger for re-engagement
    saveCliffhanger(extractCliffhanger(uiJsonArray))

    // 11. Attach input tracker for behavioral signal capture
    this.inputTracker.attach()

    // 12. Save turn record to IndexedDB for profiling
    const { userId, sessionId } = this.config
    if (userId && sessionId) {
      const uiSummary = uiJsonArray.map(el => ({ type: el.type, name: el.name }))
      saveTurn({
        userId,
        sessionId,
        turnNumber: this.state.turnNumber,
        timestamp: Date.now(),
        mode: this.state.mode,
        playerInputs: playerActionsJson,
        uiShown: JSON.stringify(uiSummary),
        signals: behavioralSignals,
      }).catch(() => { /* IndexedDB may not be available */ })

      // Update session turn count
      updateSession(sessionId, { turnCount: this.state.turnNumber }).catch(() => {})

      // Trigger analysis pipeline (fire-and-forget)
      maybeRunAnalysis(llmClient, userId, sessionId, this.state.turnNumber)
    }

    // 13. Auto-save
    saveGameState(this.storageKey(), this.state)

    // 14. Notify
    onStateChange(this.getState())
    onLoading(false)
  }

  /**
   * Load a previously saved (or externally provided) GameState and render it.
   */
  loadState(incoming: GameState): void {
    this.state = { ...incoming }

    if (this.state.currentUiJson) {
      const renderResult = renderUI(this.config.container, this.state.currentUiJson)
      this.applyRenderResult(renderResult)
      this.resolveImages()
    }

    saveGameState(this.storageKey(), this.state)
    this.config.onStateChange(this.getState())
  }

  /**
   * Reset the game to a blank state. Clears the container and localStorage.
   */
  reset(): void {
    const mode = this.state.mode
    this.state = this.createDefaultState()
    this.state.mode = mode
    this.config.container.innerHTML = ''

    // Clear persisted state
    try {
      localStorage.removeItem(this.storageKey())
    } catch {
      // localStorage may not be available
    }

    this.config.onStateChange(this.getState())
  }
}
