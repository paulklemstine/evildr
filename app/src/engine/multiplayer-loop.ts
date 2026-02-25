// ============================================================================
// multiplayer-loop.ts — Turn lifecycle manager for 2-player orchestrated modes
// ============================================================================
//
// Implements the 3-LLM-call orchestration pattern used by Flagged (Blind Date):
//
// 1. Both players interact with their UI and click submit
// 2. Both players' actions are exchanged via PeerJS
// 3. Player 1 (host) calls the ORCHESTRATOR LLM with both players' actions
//    -> orchestrator returns text with 3 sections split by ---|||---
// 4. Player 1 sends Player 2's section to Player 2 via PeerJS
// 5. Both players independently call the UI-generation LLM with their section
// 6. Both players render their respective UIs
// 7. Green flags, red flags, and analyses are extracted and surfaced
//
// This module does NOT handle PeerJS connections — it receives send/receive
// callbacks from the caller. See room-code.ts for connection management.

import type { UIElement } from './renderer.ts'
import { renderUI, collectInputState } from './renderer.ts'
import { applyTypewriter } from './typewriter.ts'
import { cascadeReveal, pulseInteractive } from './anticipation.ts'
import { attachCelebrations } from './celebration.ts'
import { applyMoodFromUI } from './mood-colors.ts'
import type { FlaggedPromptBuilder } from '../modes/flagged/prompts.ts'
import { ORCHESTRATOR_DELIMITER } from '../modes/flagged/prompts.ts'
import { jsonrepair } from 'jsonrepair'

// ---------------------------------------------------------------------------
// Inline localStorage helpers (avoids importing auto-save.ts which is typed
// for the single-player GameState)
// ---------------------------------------------------------------------------

function saveState(key: string, state: MultiplayerGameState): void {
  try {
    localStorage.setItem(key, JSON.stringify(state))
  } catch {
    // localStorage may not be available or quota exceeded
  }
}

function loadState(key: string): MultiplayerGameState | null {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return null
    const parsed: unknown = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && 'turnNumber' in parsed && 'historyQueue' in parsed) {
      return parsed as MultiplayerGameState
    }
    return null
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Re-export compatible types from game-loop.ts
// ---------------------------------------------------------------------------

export type { UIElement } from './renderer.ts'

/** Response shape expected from the LLM client. */
export interface LLMResponse {
  content: string
  model: string
  tokensUsed: number
}

/** Minimal interface the multiplayer loop expects from the LLM client. */
export interface LLMClient {
  generateTurn(prompt: string): Promise<LLMResponse>
}

/** Minimal interface the multiplayer loop expects from the image client. */
export interface ImageClient {
  getImageUrl(prompt: string, options?: Record<string, unknown>): string
  preloadImage(prompt: string, options?: Record<string, unknown>): Promise<string>
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single entry in the rolling history queue (shared between both players). */
export interface HistoryEntry {
  ui: string
  actions: string
}

/** Analysis data extracted from hidden UI elements each turn. */
export interface AnalysisData {
  greenFlags: string
  redFlags: string
  ownAnalysis: string
  partnerAnalysis: string
}

/** The complete serializable multiplayer game state. */
export interface MultiplayerGameState {
  turnNumber: number
  myNotes: string
  currentUiJson: UIElement[] | null
  historyQueue: HistoryEntry[]
  greenFlags: string
  redFlags: string
  ownAnalysis: string
  partnerAnalysis: string
}

/** Protocol messages exchanged between players via PeerJS. */
export type PeerMessage =
  | { type: 'actions'; turnNumber: number; actions: string }
  | { type: 'orchestrator'; turnNumber: number; section: string }
  | { type: 'ready'; turnNumber: number }
  | { type: 'partner-submitted'; turnNumber: number }
  | { type: 'images'; turnNumber: number; images: Array<{ name: string; base64: string }> }
  | { type: 'ping' }
  | { type: 'pong' }

/** Configuration required to initialize the multiplayer game loop. */
export interface MultiplayerGameLoopConfig {
  container: HTMLElement
  llmClient: LLMClient
  imageClient: ImageClient
  promptBuilder: FlaggedPromptBuilder
  /** Whether this player is Player 1 (host) — determines who calls the orchestrator. */
  isPlayer1: boolean
  /** Persistent user ID for save key derivation. */
  userId: string
  /** Unique session ID. */
  sessionId: string
  /** Send data to the connected partner via PeerJS. */
  sendToPartner: (data: unknown) => void
  /** Called whenever the internal state changes. */
  onStateChange: (state: MultiplayerGameState) => void
  /** Called when a non-fatal error should be displayed. */
  onError: (message: string) => void
  /** Called when loading state changes (start/end of LLM calls). */
  onLoading: (loading: boolean) => void
  /** Called with status messages during waiting periods (e.g. "Waiting for your date..."). */
  onWaitingStatus?: (message: string) => void
  /** Called when analysis data is extracted from the turn's UI. */
  onAnalysis: (analysis: AnalysisData) => void
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_HISTORY_SIZE = 15
const PARTNER_ACTION_TIMEOUT_MS = 180000  // 3 minutes to wait for partner
const ORCHESTRATOR_TIMEOUT_MS = 180000    // 3 minutes for orchestrator from host

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
 * Mirrors the parser from game-loop.ts for consistency.
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

  // Fix unquoted string values (common LLM JSON error: "key": bare text instead of "key": "bare text")
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

  console.error(`parseLLMResponse failed. Length: ${text.length}, last 200 chars: ...${text.substring(text.length - 200)}`)
  throw new Error(
    `LLM response is not valid JSON. Snippet: ${text.substring(0, 200)}...`,
  )
}

/**
 * Manually extract fields from a broken JSON object where the `value` field
 * contains unescaped quotes. Works for simple objects like hidden/notes fields
 * where `type`, `name`, and `value` are the only fields.
 *
 * Extracts `type` and `name` via regex, then treats everything between
 * the last `"value": "` and the final `"` before `}` as the raw value,
 * escaping any inner quotes.
 */
function manualExtractObject(chunk: string): Record<string, unknown> | null {
  const typeMatch = chunk.match(/"type"\s*:\s*"([^"]+)"/)
  if (!typeMatch) return null

  const nameMatch = chunk.match(/"name"\s*:\s*"([^"]+)"/)

  // Find the value field — match `"value" : "` then capture everything until end
  const valueStart = chunk.match(/"value"\s*:\s*"/)
  if (!valueStart || valueStart.index === undefined) {
    // No value field — build what we have
    const obj: Record<string, unknown> = { type: typeMatch[1] }
    if (nameMatch) obj.name = nameMatch[1]
    return obj
  }

  const valueContentStart = valueStart.index + valueStart[0].length
  // Find the last `"` before the closing `}` — that's the end of the value
  let valueContentEnd = chunk.length - 1
  while (valueContentEnd > valueContentStart && chunk[valueContentEnd] !== '}') valueContentEnd--
  // Now back up past whitespace and the closing `"`
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

function extractUIArray(parsed: unknown, textForError: string): UIElement[] {
  if (Array.isArray(parsed)) return parsed as UIElement[]

  if (parsed && typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>
    for (const key of ['ui', 'elements', 'items', 'response', 'data', 'content', 'result']) {
      if (key in obj && Array.isArray(obj[key])) {
        return obj[key] as UIElement[]
      }
    }
    if ('type' in obj && typeof obj.type === 'string') {
      return [obj as unknown as UIElement]
    }
    const values = Object.values(obj)
    if (values.length === 1 && Array.isArray(values[0])) {
      return values[0] as UIElement[]
    }
  }

  throw new Error(
    `LLM response is not a valid UI array. Snippet: ${textForError.substring(0, 200)}...`,
  )
}

/**
 * Split the orchestrator output into its 3 sections.
 * Returns [preamble, playerAInstructions, playerBInstructions].
 *
 * Handles edge cases where the model puts the delimiter at the start,
 * produces empty sections, or uses 4+ sections.
 */
function splitOrchestratorOutput(raw: string): [string, string, string] {
  // Split and drop empty parts (handles leading/trailing delimiters)
  const parts = raw.split(ORCHESTRATOR_DELIMITER)
    .map(s => s.trim())
    .filter(s => s.length > 0)

  if (parts.length >= 3) {
    return [parts[0], parts[1], parts[2]]
  }

  if (parts.length === 2) {
    // Only 2 non-empty sections — use the first as preamble+A, second as B
    // Try to find a natural split in the first part (e.g. "Section [2]" or "Player A")
    const sectionMarkers = [
      /\n\s*(?:Section\s*\[?\s*2\s*\]?|Player\s+A\s+Instructions?|FOR\s+PLAYER\s+A)\s*[:\-—]?\s*\n/i,
      /\n\s*(?:\*\*Section\s*\[?\s*2\s*\]?\*\*|##?\s*Player\s+A)\s*[:\-—]?\s*\n/i,
    ]
    for (const marker of sectionMarkers) {
      const match = parts[0].match(marker)
      if (match && match.index !== undefined) {
        const preamble = parts[0].substring(0, match.index).trim()
        const sectionA = parts[0].substring(match.index + match[0].length).trim()
        if (preamble && sectionA) {
          return [preamble, sectionA, parts[1]]
        }
      }
    }
    // Fallback: treat first part as preamble + section A combined
    return [parts[0], parts[0], parts[1]]
  }

  throw new Error(
    `Orchestrator output has ${parts.length} non-empty section(s), expected 3 (split by "${ORCHESTRATOR_DELIMITER}"). ` +
    `First 300 chars: ${raw.substring(0, 300)}...`
  )
}

/**
 * Extract analysis-relevant hidden fields from a rendered UI.
 */
function extractAnalysis(uiJson: UIElement[]): AnalysisData {
  let greenFlags = ''
  let redFlags = ''
  let ownAnalysis = ''
  let partnerAnalysis = ''

  for (const el of uiJson) {
    const name = el.name || ''
    const value = el.text || el.value || ''

    if (el.type === 'hidden' || name.includes('green_flags') || name.includes('red_flags') ||
        name.includes('own_clinical_analysis') || name.includes('partner_clinical_analysis')) {
      if (name === 'green_flags' || name.includes('green_flags')) {
        greenFlags = value
      } else if (name === 'red_flags' || name.includes('red_flags')) {
        redFlags = value
      } else if (name === 'own_clinical_analysis' || name.includes('own_clinical_analysis')) {
        ownAnalysis = value
      } else if (name === 'partner_clinical_analysis' || name.includes('partner_clinical_analysis')) {
        partnerAnalysis = value
      }
    }
  }

  return { greenFlags, redFlags, ownAnalysis, partnerAnalysis }
}

/**
 * Extract the notes hidden field value from a UI element array.
 */
function extractNotes(uiJson: UIElement[]): string {
  for (const el of uiJson) {
    const name = el.name || ''
    if ((el.type === 'hidden' && name === 'notes') ||
        (el.type === 'hidden' && name.includes('notes')) ||
        el.type === 'notes' || name === 'notes') {
      return el.value || ''
    }
  }
  return ''
}

// ---------------------------------------------------------------------------
// MultiplayerGameLoop class
// ---------------------------------------------------------------------------

/**
 * Manages the multiplayer turn lifecycle for the orchestrator pattern.
 *
 * Both players run an instance of this loop. Player 1 (host) is responsible
 * for calling the orchestrator LLM and distributing sections. Player 2
 * waits for orchestrator output from Player 1.
 */
export class MultiplayerGameLoop {
  private config: MultiplayerGameLoopConfig
  private state: MultiplayerGameState

  // Turn synchronization state
  private myActionsThisTurn: string | null = null
  private partnerActionsThisTurn: string | null = null
  private orchestratorSectionThisTurn: string | null = null
  private waitingForPartnerActions = false
  private waitingForOrchestratorSection = false
  private partnerActionTimeout: ReturnType<typeof setTimeout> | null = null
  private orchestratorTimeout: ReturnType<typeof setTimeout> | null = null
  private cleanupCelebrations: (() => void) | null = null
  private turnInProgress = false
  private imageShareTimeout: ReturnType<typeof setTimeout> | null = null

  constructor(config: MultiplayerGameLoopConfig) {
    this.config = config
    this.state = this.createDefaultState()

    // Attempt to restore from localStorage
    const saved = loadState(this.storageKey())
    if (saved) {
      this.state = { ...this.createDefaultState(), ...saved as Partial<MultiplayerGameState> }
      if (this.state.currentUiJson) {
        renderUI(this.config.container, this.state.currentUiJson)
        this.resolveImages()
      }
      this.config.onStateChange(this.getState())
    }
  }

  // ---- State management ----

  private createDefaultState(): MultiplayerGameState {
    return {
      turnNumber: 0,
      myNotes: '',
      currentUiJson: null,
      historyQueue: [],
      greenFlags: '',
      redFlags: '',
      ownAnalysis: '',
      partnerAnalysis: '',
    }
  }

  private storageKey(): string {
    return `drevil-flagged-${this.config.isPlayer1 ? 'p1' : 'p2'}-state`
  }

  getState(): MultiplayerGameState {
    return JSON.parse(JSON.stringify(this.state)) as MultiplayerGameState
  }

  // ---- History management ----

  private updateHistory(actionsJson: string): void {
    if (!this.state.currentUiJson) return

    const entry: HistoryEntry = {
      ui: JSON.stringify(this.state.currentUiJson),
      actions: actionsJson || '{}',
    }

    // Deduplicate
    const last = this.state.historyQueue[this.state.historyQueue.length - 1]
    if (last && last.ui === entry.ui && last.actions === entry.actions) return

    if (this.state.historyQueue.length >= MAX_HISTORY_SIZE) {
      this.state.historyQueue.shift()
    }
    this.state.historyQueue.push(entry)
  }

  // ---- Image resolution ----

  private resolveImages(): void {
    this.config.container
      .querySelectorAll<HTMLImageElement>('img[data-image-prompt]')
      .forEach((img) => {
        const prompt = img.dataset.imagePrompt
        if (prompt) {
          img.crossOrigin = 'anonymous'
          img.src = this.config.imageClient.getImageUrl(prompt)
        }
      })
  }

  // ---- Image sharing (Player 1 → Player 2 via base64 over PeerJS) ----

  /**
   * After Player 1's images load from Pollinations, capture them as base64
   * and send to Player 2 so both players see the same images.
   */
  private captureAndShareImages(): void {
    const images = this.config.container.querySelectorAll<HTMLImageElement>('img[data-image-prompt]')
    if (images.length === 0) return

    const turnNumber = this.state.turnNumber
    const pendingImages = Array.from(images)
    const imageData: Array<{ name: string; base64: string }> = []
    let resolved = 0

    const checkDone = () => {
      resolved++
      if (resolved === pendingImages.length && imageData.length > 0) {
        this.config.sendToPartner({
          type: 'images',
          turnNumber,
          images: imageData,
        } as PeerMessage)
      }
    }

    for (const img of pendingImages) {
      const name = img.dataset.imagePrompt || img.dataset.elementName || `img-${resolved}`

      const capture = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(img, 0, 0)
            imageData.push({ name, base64: canvas.toDataURL('image/jpeg', 0.7) })
          }
        } catch {
          // Canvas tainted or other error — skip this image
        }
        checkDone()
      }

      if (img.complete && img.naturalWidth > 0) {
        capture()
      } else {
        const prevOnload = img.onload
        img.onload = (e) => {
          if (typeof prevOnload === 'function') prevOnload.call(img, e)
          capture()
        }
        img.onerror = () => checkDone() // Skip failed images

        // Timeout: don't wait forever for slow images
        setTimeout(() => {
          if (!img.complete) checkDone()
        }, 20000)
      }
    }
  }

  /**
   * Apply base64 images received from Player 1 to Player 2's DOM.
   * Images are matched by position (index).
   */
  private applySharedImages(images: Array<{ name: string; base64: string }>): void {
    // Cancel fallback timer — we received shared images from Player 1
    if (this.imageShareTimeout) {
      clearTimeout(this.imageShareTimeout)
      this.imageShareTimeout = null
    }

    const imgElements = this.config.container.querySelectorAll<HTMLImageElement>('img[data-image-prompt]')

    images.forEach((data, i) => {
      const img = imgElements[i]
      if (!img) return

      img.src = data.base64
      img.style.opacity = '1'

      // Hide the shimmer placeholder if present
      const shimmer = img.previousElementSibling as HTMLElement | null
      if (shimmer?.classList.contains('image-shimmer')) {
        shimmer.style.display = 'none'
      }
    })
  }

  // ---- Turn rendering ----

  private renderTurn(uiJsonArray: UIElement[]): void {
    const { container, onStateChange, onAnalysis, isPlayer1 } = this.config

    // Update state
    this.state.currentUiJson = uiJsonArray
    this.state.turnNumber += 1

    // Extract notes
    this.state.myNotes = extractNotes(uiJsonArray) || this.state.myNotes

    // Extract analysis
    const analysis = extractAnalysis(uiJsonArray)
    this.state.greenFlags = analysis.greenFlags || this.state.greenFlags
    this.state.redFlags = analysis.redFlags || this.state.redFlags
    this.state.ownAnalysis = analysis.ownAnalysis || this.state.ownAnalysis
    this.state.partnerAnalysis = analysis.partnerAnalysis || this.state.partnerAnalysis

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })

    // Render UI
    renderUI(container, uiJsonArray)

    // Apply mood coloring
    applyMoodFromUI(uiJsonArray)

    // Resolve images — Player 1 loads from Pollinations and shares via PeerJS.
    // Player 2 waits briefly for shared images, then falls back to Pollinations.
    if (isPlayer1) {
      this.resolveImages()
      this.captureAndShareImages()
    } else {
      // Player 2: wait up to 15s for shared images from Player 1, then fall back
      this.imageShareTimeout = setTimeout(() => {
        const pending = this.config.container.querySelectorAll<HTMLImageElement>(
          'img[data-image-prompt]:not([src^="data:image/jpeg"])'
        )
        if (pending.length > 0) {
          console.info('[P2] Image share timeout — loading from Pollinations directly')
          this.resolveImages()
        }
      }, 15000)
    }

    // Apply dopamine effects
    cascadeReveal(container)
    applyTypewriter(container)
    pulseInteractive(container)
    if (this.cleanupCelebrations) this.cleanupCelebrations()
    this.cleanupCelebrations = attachCelebrations(container)

    // Auto-save
    saveState(this.storageKey(), this.state)

    // Notify
    onStateChange(this.getState())
    onAnalysis({
      greenFlags: this.state.greenFlags,
      redFlags: this.state.redFlags,
      ownAnalysis: this.state.ownAnalysis,
      partnerAnalysis: this.state.partnerAnalysis,
    })
  }

  // ---- Turn orchestration ----

  /**
   * Process the turn once both players' actions and the orchestrator
   * output (for Player 2) are available.
   */
  private async processTurn(): Promise<void> {
    const {
      llmClient, promptBuilder, onError, onLoading, onWaitingStatus, isPlayer1,
    } = this.config

    // onLoading(true) was already called from submitMyActions() — no need to call again
    this.turnInProgress = true

    try {
      let mySection: string

      if (isPlayer1) {
        // Player 1: call orchestrator, then generate own UI
        onWaitingStatus?.('The matchmaker is crafting your date...')

        const orchestratorPrompt = this.state.turnNumber === 0 && !this.state.currentUiJson
          ? promptBuilder.buildFirstTurnOrchestratorPrompt()
          : promptBuilder.buildOrchestratorPrompt(
              this.myActionsThisTurn || '{}',
              this.partnerActionsThisTurn || '{}',
              this.state.historyQueue,
              this.state.myNotes,
              '', // Player 1 doesn't have Player 2's notes
            )

        let orchestratorRaw: string
        try {
          const orchResponse = await llmClient.generateTurn(orchestratorPrompt)
          orchestratorRaw = orchResponse.content
        } catch (firstErr) {
          // Retry orchestrator LLM call once
          try {
            onWaitingStatus?.('Retrying...')
            const retryResponse = await llmClient.generateTurn(orchestratorPrompt)
            orchestratorRaw = retryResponse.content
          } catch (retryErr) {
            const msg = retryErr instanceof Error ? retryErr.message : String(retryErr)
            onError(`Orchestrator LLM error: ${msg}`)
            onLoading(false)
            this.turnInProgress = false
            return
          }
        }

        // Split orchestrator output
        let preamble: string
        let playerASection: string
        let playerBSection: string
        try {
          [preamble, playerASection, playerBSection] = splitOrchestratorOutput(orchestratorRaw)
        } catch (firstErr) {
          // Retry if orchestrator output format was bad
          try {
            onWaitingStatus?.('Retrying...')
            const retryResponse = await llmClient.generateTurn(orchestratorPrompt)
            ;[preamble, playerASection, playerBSection] = splitOrchestratorOutput(retryResponse.content)
          } catch (retryErr) {
            const msg = retryErr instanceof Error ? retryErr.message : String(retryErr)
            onError(`Orchestrator parse error: ${msg}`)
            onLoading(false)
            this.turnInProgress = false
            return
          }
        }

        // Send Player B's section to partner
        const p2Message: PeerMessage = {
          type: 'orchestrator',
          turnNumber: this.state.turnNumber + 1,
          section: `${preamble}\n\n${playerBSection}`,
        }
        this.config.sendToPartner(p2Message)

        // Player 1's section = preamble + Player A section
        mySection = `${preamble}\n\n${playerASection}`

      } else {
        // Player 2: use the orchestrator section received from Player 1
        if (!this.orchestratorSectionThisTurn) {
          onError('No orchestrator data received from host. Cannot generate UI.')
          onLoading(false)
          this.turnInProgress = false
          return
        }
        mySection = this.orchestratorSectionThisTurn
      }

      // Generate this player's UI from the orchestrator section
      onWaitingStatus?.('Preparing your next moment...')
      const uiPrompt = promptBuilder.buildPlayerUIPrompt(mySection)
      let uiJsonArray: UIElement[]
      try {
        const uiResponse = await llmClient.generateTurn(uiPrompt)
        uiJsonArray = parseLLMResponse(uiResponse.content)
      } catch (firstErr) {
        // Retry LLM call once if JSON parsing failed
        try {
          onWaitingStatus?.('Retrying...')
          const retryResponse = await llmClient.generateTurn(uiPrompt)
          uiJsonArray = parseLLMResponse(retryResponse.content)
        } catch (retryErr) {
          const msg = retryErr instanceof Error ? retryErr.message : String(retryErr)
          onError(`UI generation LLM error: ${msg}`)
          onLoading(false)
          this.turnInProgress = false
          return
        }
      }

      // Update history with this turn's actions
      this.updateHistory(this.myActionsThisTurn || '{}')

      // Render the UI
      this.renderTurn(uiJsonArray)

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      onError(`Turn processing error: ${msg}`)
    } finally {
      // Clean up turn state
      this.myActionsThisTurn = null
      this.partnerActionsThisTurn = null
      this.orchestratorSectionThisTurn = null
      this.waitingForPartnerActions = false
      this.waitingForOrchestratorSection = false
      this.clearTimeouts()
      this.turnInProgress = false
      onLoading(false)
    }
  }

  /**
   * Check if all conditions are met to proceed with the turn.
   * For Player 1: needs both players' actions.
   * For Player 2: needs own actions + orchestrator section from Player 1.
   */
  private checkAndProcessTurn(): void {
    if (this.turnInProgress) return

    const { isPlayer1 } = this.config

    if (isPlayer1) {
      // Player 1 needs both players' actions to call the orchestrator
      const isFirstTurn = this.state.turnNumber === 0 && !this.state.currentUiJson
      if (isFirstTurn) {
        // First turn: both players submit their intro info simultaneously
        if (this.myActionsThisTurn !== null && this.partnerActionsThisTurn !== null) {
          this.processTurn()
        }
      } else {
        if (this.myActionsThisTurn !== null && this.partnerActionsThisTurn !== null) {
          this.processTurn()
        }
      }
    } else {
      // Player 2 needs own actions + orchestrator section
      if (this.myActionsThisTurn !== null && this.orchestratorSectionThisTurn !== null) {
        this.processTurn()
      }
    }
  }

  // ---- Timeouts ----

  private clearTimeouts(): void {
    if (this.partnerActionTimeout) {
      clearTimeout(this.partnerActionTimeout)
      this.partnerActionTimeout = null
    }
    if (this.orchestratorTimeout) {
      clearTimeout(this.orchestratorTimeout)
      this.orchestratorTimeout = null
    }
  }

  private startPartnerActionTimeout(): void {
    this.clearTimeouts()
    this.partnerActionTimeout = setTimeout(() => {
      if (this.waitingForPartnerActions) {
        this.config.onError('Your date hasn\'t responded yet. Waiting...')
      }
    }, PARTNER_ACTION_TIMEOUT_MS)
  }

  private startOrchestratorTimeout(): void {
    if (this.orchestratorTimeout) clearTimeout(this.orchestratorTimeout)
    this.orchestratorTimeout = setTimeout(() => {
      if (this.waitingForOrchestratorSection) {
        this.config.onError('Waiting for the matchmaker to process the turn...')
      }
    }, ORCHESTRATOR_TIMEOUT_MS)
  }

  // ---- Public API ----

  /**
   * Submit this player's turn actions.
   *
   * Collects input state from the DOM, sends it to the partner,
   * and waits for partner data to proceed with the turn.
   */
  submitMyActions(): void {
    if (this.turnInProgress) return

    const { container, sendToPartner, onLoading, onWaitingStatus } = this.config

    // Collect input state
    const actionsJson = collectInputState(container, this.state.turnNumber + 1)
    this.myActionsThisTurn = actionsJson

    // Show loading interstitial immediately so the player isn't staring at dead UI
    onLoading(true)

    // Send actions to partner
    const message: PeerMessage = {
      type: 'actions',
      turnNumber: this.state.turnNumber + 1,
      actions: actionsJson,
    }
    sendToPartner(message)

    // Notify partner that we've submitted
    sendToPartner({
      type: 'partner-submitted',
      turnNumber: this.state.turnNumber + 1,
    } as PeerMessage)

    // Start waiting with appropriate status message
    const isFirstTurn = this.state.turnNumber === 0 && !this.state.currentUiJson

    if (this.config.isPlayer1) {
      this.waitingForPartnerActions = true
      this.startPartnerActionTimeout()
      // If partner already submitted, we'll proceed immediately via checkAndProcessTurn
      if (this.partnerActionsThisTurn !== null) {
        onWaitingStatus?.(isFirstTurn
          ? 'The matchmaker is setting the scene...'
          : 'Both dates ready! The matchmaker is working...')
      } else {
        onWaitingStatus?.(isFirstTurn
          ? 'Connecting with your date...'
          : 'Waiting for your date to respond...')
      }
    } else {
      this.waitingForOrchestratorSection = true
      this.startOrchestratorTimeout()
      onWaitingStatus?.(isFirstTurn
        ? 'The matchmaker is setting the scene...'
        : 'Waiting for the matchmaker...')
    }

    // Check if we can already proceed
    this.checkAndProcessTurn()
  }

  /**
   * Receive the partner's actions (called when PeerMessage type='actions' arrives).
   * This is relevant for Player 1 (host), who needs both players' actions
   * for the orchestrator call.
   */
  receivePartnerActions(actions: string): void {
    this.partnerActionsThisTurn = actions
    this.waitingForPartnerActions = false
    // Update status — both actions are in, orchestrator is next
    if (this.myActionsThisTurn !== null) {
      this.config.onWaitingStatus?.('Both dates ready! The matchmaker is working...')
    }
    this.checkAndProcessTurn()
  }

  /**
   * Receive orchestrator output from Player 1 (called when PeerMessage type='orchestrator' arrives).
   * This is relevant for Player 2 (guest), who receives their orchestrator section from the host.
   */
  receiveOrchestratorOutput(section: string): void {
    this.orchestratorSectionThisTurn = section
    this.waitingForOrchestratorSection = false
    this.config.onWaitingStatus?.('The matchmaker has spoken! Preparing your scene...')
    this.checkAndProcessTurn()
  }

  /**
   * Handle incoming PeerJS data. Routes to the appropriate handler.
   */
  handlePartnerData(data: unknown): void {
    if (!data || typeof data !== 'object') return

    const msg = data as PeerMessage

    switch (msg.type) {
      case 'actions':
        this.receivePartnerActions(msg.actions)
        break

      case 'orchestrator':
        this.receiveOrchestratorOutput(msg.section)
        break

      case 'ready':
        // Partner is ready for next turn (informational)
        break

      case 'partner-submitted':
        // Partner has submitted their turn
        if (this.myActionsThisTurn !== null) {
          // Both have submitted — matchmaker will process next
          this.config.onWaitingStatus?.('Both dates ready! The matchmaker is working...')
        } else {
          // Partner submitted before us — nudge the player
          this.config.onWaitingStatus?.('Your date is waiting for you...')
        }
        break

      case 'images':
        // Player 1 is sharing their rendered images — apply to our DOM
        this.applySharedImages(msg.images)
        break

      case 'ping':
        this.config.sendToPartner({ type: 'pong' })
        break

      case 'pong':
        // Response to our ping (connection health check)
        break

      default:
        console.warn('[MultiplayerLoop] Unknown message type:', (msg as Record<string, unknown>).type)
    }
  }

  /**
   * Start the first turn.
   *
   * For the first turn, both players need to submit their intro info.
   * Player 1 submits -> sends actions to Player 2 -> waits for Player 2's actions.
   * Player 2 submits -> sends actions to Player 1 -> waits for orchestrator output.
   *
   * Call this after the initial "enter your name" UI is shown to the player.
   */
  startFirstTurn(): void {
    // For the first turn, we need a minimal "intro" UI.
    // The caller should have already rendered an intro form.
    // When both players submit, the orchestrator generates the first real turn.
    this.submitMyActions()
  }

  /**
   * Load a previously saved game state and render it.
   */
  loadState(incoming: MultiplayerGameState): void {
    this.state = { ...incoming }
    if (this.state.currentUiJson) {
      renderUI(this.config.container, this.state.currentUiJson)
      this.resolveImages()
    }
    saveState(this.storageKey(), this.state)
    this.config.onStateChange(this.getState())
  }

  /**
   * Reset the game to a blank state.
   */
  reset(): void {
    this.state = this.createDefaultState()
    this.config.container.innerHTML = ''
    this.myActionsThisTurn = null
    this.partnerActionsThisTurn = null
    this.orchestratorSectionThisTurn = null
    this.waitingForPartnerActions = false
    this.waitingForOrchestratorSection = false
    this.turnInProgress = false
    this.clearTimeouts()

    try {
      localStorage.removeItem(this.storageKey())
    } catch {
      // localStorage may not be available
    }

    this.config.onStateChange(this.getState())
  }

  /**
   * Whether a turn is currently being processed.
   */
  isTurnInProgress(): boolean {
    return this.turnInProgress
  }

  /**
   * Whether we are waiting for the partner's input.
   */
  isWaitingForPartner(): boolean {
    return this.waitingForPartnerActions || this.waitingForOrchestratorSection
  }
}
