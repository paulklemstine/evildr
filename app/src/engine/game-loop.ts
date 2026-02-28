// ============================================================================
// game-loop.ts - Turn lifecycle manager for the DrEvil game engine
// ============================================================================

import type { UIElement, RenderResult } from './renderer.ts'
import { renderUI, collectInputState, collectQuestionContext, attachReactiveListeners } from './renderer.ts'
import { saveGameState, loadGameState as loadSavedState } from './auto-save.ts'
import { InputTracker } from '../profiling/input-tracker'
import { saveTurn, saveSession, updateSession, getAnalysesBySession, getTurnsBySession } from '../profiling/db'
import { maybeRunAnalysis } from '../profiling/analysis-pipeline'
import { uploadReport } from '../api/report-uploader'
import { applyTypewriter } from './typewriter'
import { cascadeReveal, pulseInteractive } from './anticipation'
import { attachCelebrations } from './celebration'
import { saveCliffhanger, extractCliffhanger } from './session-hooks'
import { applyMoodFromUI } from './mood-colors'
import { speakTurn, stopSpeaking } from './tts'
import { preloadInterstitialImage } from './loading-interstitial'
import { jsonrepair } from 'jsonrepair'

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
  getImageUrl(prompt: string, options?: Record<string, unknown>): string
  /** Preload an image and return the URL (or placeholder on failure). */
  preloadImage(prompt: string, options?: Record<string, unknown>): Promise<string>
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
    liveAnalysis?: string,
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
  /** @deprecated kept for serialisation compat — no longer populated */
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

/** A scheduled DOM mutation for the Skinwalker mode gaslighting engine. */
interface MutationEntry {
  delay_ms: number
  target: string
  action: 'text_replace' | 'swap_image'
  from?: string
  to?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_HISTORY_SIZE = 20

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Fix unquoted string values in malformed JSON from LLMs.
 * Handles: "key": bare text value ", → "key": "bare text value",
 */
function fixUnquotedJsonValues(text: string): string {
  const result: string[] = []
  let i = 0

  while (i < text.length) {
    if (text[i] === '"') {
      // Read quoted string
      let j = i + 1
      while (j < text.length) {
        if (text[j] === '\\') { j += 2; continue }
        if (text[j] === '"') { j++; break }
        j++
      }
      result.push(text.substring(i, j))
      i = j

      // Skip whitespace
      let ws = ''
      while (i < text.length && /\s/.test(text[i])) { ws += text[i]; i++ }

      // Check if followed by colon (making it a key)
      if (i < text.length && text[i] === ':') {
        result.push(ws, ':')
        i++

        // Skip whitespace after colon
        let ws2 = ''
        while (i < text.length && /\s/.test(text[i])) { ws2 += text[i]; i++ }
        result.push(ws2)

        // If next char is NOT a valid JSON value start, it's an unquoted string
        if (i < text.length &&
            text[i] !== '"' && text[i] !== '{' && text[i] !== '[' && text[i] !== '-' &&
            !/[0-9]/.test(text[i]) &&
            !text.substring(i).startsWith('true') &&
            !text.substring(i).startsWith('false') &&
            !text.substring(i).startsWith('null')) {
          // Scan for the end: a closing " before , or } or ]
          let searchPos = i
          let valueEnd = -1
          while (searchPos < text.length) {
            if (text[searchPos] === '"') {
              let afterQuote = searchPos + 1
              while (afterQuote < text.length && /\s/.test(text[afterQuote])) afterQuote++
              if (afterQuote < text.length && /[,}\]]/.test(text[afterQuote])) {
                valueEnd = searchPos + 1
                break
              }
            }
            searchPos++
          }
          if (valueEnd > i) {
            let rawValue = text.substring(i, valueEnd)
            if (rawValue.endsWith('"')) rawValue = rawValue.slice(0, -1)
            rawValue = rawValue.trim()
            const escaped = rawValue.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
            result.push('"' + escaped + '"')
            i = valueEnd
          } else {
            result.push(text[i])
            i++
          }
        }
      } else {
        result.push(ws)
      }
    } else {
      result.push(text[i])
      i++
    }
  }

  return result.join('')
}

/**
 * Parse a raw LLM response string into a UIElement[].
 *
 * Handles:
 *  - Markdown code fences (` ```json ... ``` `)
 *  - Wrapped objects (`{ "ui": [...] }`)
 *  - Bare arrays (`[...]`)
 *  - Mixed content: markdown/text before or after the JSON
 *  - Unquoted string values from LLM errors
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
    // Direct parse failed — try repair strategies
  }

  // Fix unquoted string values (common LLM JSON error)
  text = fixUnquotedJsonValues(text)

  // Find embedded JSON array
  const firstBracket = text.indexOf('[')
  const lastBracket = text.lastIndexOf(']')
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    const arrayText = text.substring(firstBracket, lastBracket + 1)
    try {
      const parsed: unknown = JSON.parse(arrayText)
      if (Array.isArray(parsed)) {
        console.warn(`parseLLMResponse: fixed malformed JSON (${(parsed as unknown[]).length} elements)`)
        return parsed as UIElement[]
      }
    } catch {
      // Full array parse failed — try jsonrepair on the array
    }

    // Try jsonrepair on the full array (fixes unescaped quotes, trailing commas, etc.)
    try {
      const repaired = jsonrepair(arrayText)
      const parsed: unknown = JSON.parse(repaired)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as UIElement[]
      }
    } catch {
      // jsonrepair failed on array — fall through to individual extraction
    }

    // Extract individual JSON objects from the array, repairing broken ones
    const objects = extractIndividualObjects(arrayText)
    if (objects.length > 0) {
      return objects as unknown as UIElement[]
    }
  }

  // Try jsonrepair on the full text as a last resort
  try {
    const target = firstBracket !== -1 ? text.substring(firstBracket) : text
    const repaired = jsonrepair(target)
    const parsed: unknown = JSON.parse(repaired)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as UIElement[]
    }
    return extractUIArray(parsed, repaired)
  } catch {
    // jsonrepair failed
  }

  throw new Error(
    `LLM response is not valid JSON. Snippet: ${text.substring(0, 200)}...`,
  )
}

/**
 * Manually extract fields from a broken JSON object where the `value` field
 * contains unescaped quotes. Works for simple objects like hidden/notes fields
 * where `type`, `name`, and `value` are the only fields.
 */
function manualExtractObject(chunk: string): Record<string, unknown> | null {
  const typeMatch = chunk.match(/"type"\s*:\s*"([^"]+)"/)
  if (!typeMatch) return null

  const nameMatch = chunk.match(/"name"\s*:\s*"([^"]+)"/)

  // Find the value field — match `"value" : "` then capture everything until end
  const valueStart = chunk.match(/"value"\s*:\s*"/)
  if (!valueStart || valueStart.index === undefined) {
    const obj: Record<string, unknown> = { type: typeMatch[1] }
    if (nameMatch) obj.name = nameMatch[1]
    return obj
  }

  const valueContentStart = valueStart.index + valueStart[0].length
  // Find the last `"` before the closing `}` — that's the end of the value
  let valueContentEnd = chunk.length - 1
  while (valueContentEnd > valueContentStart && chunk[valueContentEnd] !== '}') valueContentEnd--
  valueContentEnd-- // skip `}`
  while (valueContentEnd > valueContentStart && /\s/.test(chunk[valueContentEnd])) valueContentEnd--
  if (chunk[valueContentEnd] === '"') valueContentEnd-- // skip closing `"`

  if (valueContentEnd <= valueContentStart) return null

  let rawValue = chunk.substring(valueContentStart, valueContentEnd + 1)
  // Escape unescaped quotes (but don't double-escape already-escaped ones)
  rawValue = rawValue.replace(/\\"/g, '\x00ESCAPED_QUOTE\x00')
  rawValue = rawValue.replace(/"/g, '\\"')
  rawValue = rawValue.replace(/\x00ESCAPED_QUOTE\x00/g, '\\"')
  // Escape unescaped newlines
  rawValue = rawValue.replace(/(?<!\\)\n/g, '\\n')
  rawValue = rawValue.replace(/(?<!\\)\r/g, '\\r')
  rawValue = rawValue.replace(/(?<!\\)\t/g, '\\t')

  const obj: Record<string, unknown> = { type: typeMatch[1] }
  if (nameMatch) obj.name = nameMatch[1]
  obj.value = rawValue
  return obj
}

/**
 * Extract individual JSON objects from a malformed JSON array string.
 * Uses brace-depth tracking to find object boundaries, then tries to parse
 * each individually. Skips unparseable objects (e.g. hidden fields with
 * unescaped quotes). Returns all successfully parsed objects.
 */
function extractIndividualObjects(arrayText: string): Record<string, unknown>[] {
  const results: Record<string, unknown>[] = []

  let inner = arrayText.trim()
  if (inner.startsWith('[')) inner = inner.substring(1)
  if (inner.endsWith(']')) inner = inner.substring(0, inner.length - 1)

  // Split at },{  boundaries (lookahead preserves the { on the next chunk)
  const chunks = inner.split(/\}\s*,\s*(?=\{)/)

  for (const raw of chunks) {
    let chunk = raw.trim()
    if (!chunk.startsWith('{')) chunk = '{' + chunk
    if (!chunk.endsWith('}')) chunk = chunk + '}'

    try {
      const obj = JSON.parse(chunk) as Record<string, unknown>
      if (obj && typeof obj === 'object') results.push(obj)
    } catch {
      // Try jsonrepair on the broken chunk before giving up
      try {
        const repaired = jsonrepair(chunk)
        const obj = JSON.parse(repaired) as Record<string, unknown>
        if (obj && typeof obj === 'object') results.push(obj)
      } catch {
        // Last resort: manually extract fields from simple objects (e.g. hidden/notes)
        const manualObj = manualExtractObject(chunk)
        if (manualObj) {
          results.push(manualObj)
        } else {
          const typeMatch = chunk.match(/"type"\s*:\s*"([^"]+)"/)
          const nameMatch = chunk.match(/"name"\s*:\s*"([^"]+)"/)
          if (typeMatch) {
            console.warn(`parseLLMResponse: skipping broken ${typeMatch[1]}/${nameMatch?.[1] ?? '?'} object`)
          }
        }
      }
    }
  }

  return results
}

/** Extract a UIElement[] from a parsed JSON value. */
function extractUIArray(parsed: unknown, textForError: string): UIElement[] {
  if (Array.isArray(parsed)) {
    return parsed as UIElement[]
  }

  if (parsed && typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>

    // Check common wrapper keys: { ui: [...] }, { elements: [...] }, { items: [...] }, { response: [...] }
    for (const key of ['ui', 'elements', 'items', 'response', 'data', 'content', 'result']) {
      if (key in obj && Array.isArray(obj[key])) {
        return obj[key] as UIElement[]
      }
    }

    // Single UIElement object — wrap in array
    if ('type' in obj && typeof obj.type === 'string') {
      return [obj as unknown as UIElement]
    }

    // Object whose only value is an array (e.g. { "turn_1": [...] })
    const values = Object.values(obj)
    if (values.length === 1 && Array.isArray(values[0])) {
      return values[0] as UIElement[]
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
  private cleanupReactive: (() => void) | null = null
  private mutationTimers: ReturnType<typeof setTimeout>[] = []
  /** Base64 captures of resolved images, keyed by image prompt. */
  private capturedImages: Record<string, string> = {}

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
          img.crossOrigin = 'anonymous'
          const isInline = img.dataset.imageSize === 'inline'
          img.src = this.config.imageClient.getImageUrl(prompt, isInline ? { width: 256, height: 256 } : undefined)

          // Capture as base64 for admin live preview via PeerJS
          img.addEventListener('load', () => {
            try {
              const canvas = document.createElement('canvas')
              const maxW = 512
              const scale = Math.min(1, maxW / img.naturalWidth)
              canvas.width = img.naturalWidth * scale
              canvas.height = img.naturalHeight * scale
              const ctx = canvas.getContext('2d')!
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
              this.capturedImages[prompt] = canvas.toDataURL('image/jpeg', 0.65)
              // Re-broadcast state with newly captured image
              this.config.onStateChange(this.getState())
            } catch {
              // CORS or canvas error — silently skip
            }
          }, { once: true })
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
    // tweet field removed — no longer used
  }

  // ---- Public API ----

  /**
   * Return the base64-encoded captures of resolved images (prompt → data URL).
   * Used by the admin live preview to show exact player images via PeerJS.
   */
  getCapturedImages(): Record<string, string> {
    return { ...this.capturedImages }
  }

  /**
   * Submit a turn: collect inputs, call the LLM, render the response, auto-save.
   */
  async submitTurn(): Promise<void> {
    const { container, llmClient, promptBuilder, onStateChange, onError, onLoading } = this.config

    // 0. Stop any TTS from the previous turn
    stopSpeaking()

    // 1. Collect current inputs and behavioral signals
    const behavioralSignals = this.inputTracker.collect()
    const playerActionsJson = collectInputState(container, this.state.turnNumber + 1)

    // 2. Update history with previous turn
    this.updateHistory(playerActionsJson)

    // 3. Fetch latest analysis for real-time gameplay adaptation
    let liveAnalysis: string | undefined
    if (this.config.sessionId) {
      try {
        const analyses = await getAnalysesBySession(this.config.sessionId)
        if (analyses.length > 0) {
          liveAnalysis = analyses[analyses.length - 1].analysisText
        }
      } catch { /* IndexedDB may not be available */ }
    }

    // 4. Build prompt
    const isFirstTurn = this.state.historyQueue.length === 0 && this.state.currentUiJson === null
    let prompt: string
    if (isFirstTurn) {
      prompt = promptBuilder.buildFirstTurnPrompt()
    } else {
      prompt = promptBuilder.buildTurnPrompt(
        playerActionsJson,
        this.state.historyQueue,
        this.state.currentNotes,
        liveAnalysis,
      )
    }

    // 4. Call LLM
    onLoading(true)

    let uiJsonArray: UIElement[]
    try {
      const response = await llmClient.generateTurn(prompt)
      uiJsonArray = parseLLMResponse(response.content)
    } catch (firstErr) {
      // Retry LLM call once if JSON parsing failed
      try {
        const retryResponse = await llmClient.generateTurn(prompt)
        uiJsonArray = parseLLMResponse(retryResponse.content)
      } catch (retryErr) {
        const message = retryErr instanceof Error ? retryErr.message : String(retryErr)
        onError(`LLM error: ${message}`)
        onLoading(false)
        return
      }
    }

    // 5. Update state
    this.state.currentUiJson = uiJsonArray
    this.state.turnNumber += 1

    // 6. Scroll to top of new turn
    window.scrollTo({ top: 0, behavior: 'smooth' })

    // 7. Render UI (immediate — no artificial delay)
    try {
      const renderResult = renderUI(container, uiJsonArray)
      this.applyRenderResult(renderResult)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      onError(`Render error: ${message}`)
      onLoading(false)
      return
    }

    // Post-render steps wrapped in try/finally to GUARANTEE onLoading(false) is called.
    // Without this, any thrown error leaves the interstitial overlay covering the viewport,
    // permanently blocking all user interaction.
    try {
      // 7. Apply dynamic mood coloring from this turn's elements
      applyMoodFromUI(uiJsonArray)

      // 8. Resolve image URLs
      this.resolveImages()

      // 9. Apply dopamine effects: cascade reveal, typewriter, celebrations, pulse
      cascadeReveal(container)
      applyTypewriter(container).then(() => {
        speakTurn(container)
      })
      pulseInteractive(container)
      if (this.cleanupCelebrations) this.cleanupCelebrations()
      this.cleanupCelebrations = attachCelebrations(container)

      // 9b. Attach reactive variant listeners (swap text on input change)
      if (this.cleanupReactive) this.cleanupReactive()
      this.cleanupReactive = attachReactiveListeners(container)

      // 9c. Skinwalker mutation engine (timed DOM changes)
      this.clearMutationTimers()
      if (this.config.mode === 'skinwalker') {
        this.initMutationEngine(uiJsonArray)
      }

      // 10. Preload next interstitial image while player plays this turn
      preloadInterstitialImage(this.config.imageClient)

      // 11. Save cliffhanger for re-engagement
      saveCliffhanger(extractCliffhanger(uiJsonArray))

      // 12. Attach input tracker for behavioral signal capture
      this.inputTracker.attach()

      // 13. Save turn record to IndexedDB for profiling
      const { userId, sessionId } = this.config
      if (userId && sessionId) {
        const uiSummary = uiJsonArray.map(el => ({ type: el.type, name: el.name }))
        const contexts = collectQuestionContext(container)
        saveTurn({
          userId,
          sessionId,
          turnNumber: this.state.turnNumber,
          timestamp: Date.now(),
          mode: this.state.mode,
          playerInputs: playerActionsJson,
          uiShown: JSON.stringify(uiSummary),
          signals: behavioralSignals,
          questionsShown: JSON.stringify(contexts),
        }).catch(() => { /* IndexedDB may not be available */ })

        // Update session turn count
        updateSession(sessionId, { turnCount: this.state.turnNumber }).catch(() => {})

        // Upload report to server every turn (fire-and-forget)
        this.uploadCurrentReport(userId, sessionId).catch(() => {})

        // Trigger analysis pipeline on deep model (fire-and-forget, runs in background)
        maybeRunAnalysis(userId, sessionId, this.state.turnNumber)
      }

      // 14. Auto-save
      saveGameState(this.storageKey(), this.state)

      // 15. Notify
      onStateChange(this.getState())
    } catch (postRenderErr) {
      console.error('Post-render error (UI still interactive):', postRenderErr)
    } finally {
      onLoading(false)
    }
  }

  /**
   * Upload the current session report to the server for admin browsing.
   */
  private async uploadCurrentReport(userId: string, sessionId: string): Promise<void> {
    const turns = await getTurnsBySession(sessionId)
    const analyses = await getAnalysesBySession(sessionId)
    await uploadReport({
      sessionId,
      userId,
      mode: this.state.mode,
      genre: this.config.genre,
      startedAt: turns.length > 0 ? turns[0].timestamp : Date.now(),
      turnCount: turns.length,
      turns,
      analyses,
    })
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

    // Clean up reactive listeners and mutation timers
    if (this.cleanupReactive) { this.cleanupReactive(); this.cleanupReactive = null }
    this.clearMutationTimers()

    // Clear persisted state
    try {
      localStorage.removeItem(this.storageKey())
    } catch {
      // localStorage may not be available
    }

    this.config.onStateChange(this.getState())
  }

  // ---- Skinwalker Mutation Engine ----

  private clearMutationTimers(): void {
    this.mutationTimers.forEach(clearTimeout)
    this.mutationTimers = []
  }

  /**
   * Parse a `mutations` hidden field and set timers for DOM changes.
   * Only active in Skinwalker mode. Only touches text/images — never inputs.
   */
  private initMutationEngine(elements: UIElement[]): void {
    const mutationsEl = elements.find(
      (el) => el.type === 'hidden' && el.name === 'mutations',
    )
    if (!mutationsEl?.value) return

    let mutations: MutationEntry[]
    try {
      mutations = JSON.parse(mutationsEl.value)
      if (!Array.isArray(mutations)) return
    } catch { return }

    for (const m of mutations) {
      const delay = Math.max(5000, Math.min(60000, m.delay_ms || 15000))
      const timer = setTimeout(() => this.applyMutation(m), delay)
      this.mutationTimers.push(timer)
    }
  }

  private applyMutation(m: MutationEntry): void {
    const container = this.config.container

    if (m.action === 'text_replace' && m.target && m.from && m.to) {
      const targetWrapper = container.querySelector<HTMLElement>(
        `[data-element-name="${m.target}"]`,
      )
      const textEl = targetWrapper?.querySelector<HTMLElement>('.geems-text')
      if (textEl) {
        // Silent replacement — no animation (gaslighting effect)
        textEl.innerHTML = textEl.innerHTML.replace(m.from, m.to)
      }
    }

    if (m.action === 'swap_image' && m.target && m.to) {
      const targetWrapper = container.querySelector<HTMLElement>(
        `[data-element-name="${m.target}"]`,
      )
      const img = targetWrapper?.querySelector<HTMLImageElement>('img[data-image-prompt]')
      if (img) {
        img.dataset.imagePrompt = m.to
        img.src = this.config.imageClient.getImageUrl(m.to)
      }
    }
  }
}
