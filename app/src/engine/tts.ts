// ============================================================================
// tts.ts — Text-to-Speech with Kokoro.js (in-browser neural TTS)
// ============================================================================
//
// Uses Kokoro.js — an 82M parameter ONNX model running via WebAssembly or
// WebGPU (preferred when available — significantly faster inference).
// 28 distinct English voices, no API key, no usage limits, works offline
// after initial model download (cached in IndexedDB).
//
// Eager preload: model starts loading as soon as TTS is toggled on,
// so it's ready before the first turn finishes.

import type { KokoroTTS as KokoroTTSType, GenerateOptions } from 'kokoro-js'

type VoiceId = NonNullable<GenerateOptions['voice']>

const STORAGE_KEY = 'geems-tts'

interface VoiceProfile {
  voice: VoiceId
  speed: number   // 0.5–2.0
}

const VOICE_PROFILES: Record<string, VoiceProfile> = {
  narrator: { voice: 'bf_emma',   speed: 0.95 },
  player:   { voice: 'af_heart',  speed: 1.0 },
  drevil:   { voice: 'am_fenrir', speed: 0.85 },
  devil:    { voice: 'am_michael', speed: 0.9 },
  oracle:   { voice: 'af_kore',   speed: 0.8 },
  dream:    { voice: 'bf_lily',   speed: 1.05 },
  god:      { voice: 'am_fenrir', speed: 0.7 },
}

const DEFAULT_PROFILE: VoiceProfile = { voice: 'af_bella', speed: 1.0 }

// Kokoro model instance
let ttsModel: KokoroTTSType | null = null
let modelLoadPromise: Promise<KokoroTTSType | null> | null = null

// Audio playback state
let audioCtx: AudioContext | null = null
let currentSource: AudioBufferSourceNode | null = null
let playbackQueue: Float32Array[] = []
let playing = false
let sampleRate = 24000 // Kokoro default sample rate

/** Generation session counter — incremented on each speakTurn() call
 *  so a new turn's generation cancels any in-flight generation. */
let generationSession = 0

/** Sentence-boundary regex for chunking long text */
const SENTENCE_BOUNDARY = /(?<=[.!?])\s+/

/**
 * Initialize TTS — applies body class and starts preloading the model
 * if TTS was previously enabled, so it's ready before the first turn.
 */
export function initTTS(): void {
  if (isTTSEnabled()) {
    document.body.classList.add('tts-on')
    // Start preloading immediately — don't wait for first speakTurn()
    ensureModel()
  }
}

export function isTTSEnabled(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'on'
}

export function setTTSEnabled(on: boolean): void {
  localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off')
  if (on) {
    document.body.classList.add('tts-on')
    // Start preloading model immediately on toggle
    ensureModel()
  } else {
    document.body.classList.remove('tts-on')
    stopSpeaking()
  }
}

export function stopSpeaking(): void {
  generationSession++ // cancel any in-flight generation
  playbackQueue = []
  playing = false
  if (currentSource) {
    try { currentSource.stop() } catch { /* already stopped */ }
    currentSource = null
  }
}

export function isSpeaking(): boolean {
  return playing
}

/** Check if WebGPU is available in this browser. */
async function hasWebGPU(): Promise<boolean> {
  try {
    const nav = navigator as Navigator & { gpu?: { requestAdapter(): Promise<unknown | null> } }
    if (!nav.gpu) return false
    const adapter = await nav.gpu.requestAdapter()
    return adapter !== null
  } catch {
    return false
  }
}

/**
 * Load the Kokoro model. Tries WebGPU first (much faster inference),
 * falls back to WASM. Shows loading state via body.tts-loading class.
 * Deduplicates concurrent calls — if already loading, returns the
 * existing promise instead of starting a second load.
 */
function ensureModel(): Promise<KokoroTTSType | null> {
  if (ttsModel) return Promise.resolve(ttsModel)
  if (modelLoadPromise) return modelLoadPromise

  document.body.classList.add('tts-loading')

  modelLoadPromise = (async () => {
    try {
      const { KokoroTTS } = await import('kokoro-js')

      const webgpu = await hasWebGPU()
      // WebGPU: use fp32 (recommended). WASM: use q4 (fastest).
      const device = webgpu ? 'webgpu' : 'wasm'
      const dtype = webgpu ? 'fp32' : 'q4'

      console.log(`[TTS] Loading Kokoro model (device=${device}, dtype=${dtype})`)

      ttsModel = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
        dtype,
        device,
      })

      console.log(`[TTS] Model loaded successfully (${device})`)
      return ttsModel
    } catch (err) {
      console.error('[TTS] Failed to load Kokoro model:', err)
      return null
    } finally {
      modelLoadPromise = null
      document.body.classList.remove('tts-loading')
    }
  })()

  return modelLoadPromise
}

/** Yield to the browser event loop so UI stays responsive. */
function yieldToMain(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

/**
 * Speak all text elements in a rendered turn container.
 * Skips system/hidden elements. Generates audio chunks one at a time,
 * yielding to the browser event loop between each so the UI stays responsive.
 * Starts playback as soon as the first chunk is ready (pipelined).
 */
export async function speakTurn(container: HTMLElement): Promise<void> {
  if (!isTTSEnabled()) return

  const model = await ensureModel()
  if (!model) return
  if (!isTTSEnabled()) return // may have been toggled off during load

  // Cancel any prior in-flight generation
  const session = ++generationSession

  // Ensure AudioContext exists (requires user gesture — satisfied by submit click)
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume()
  }
  sampleRate = 24000

  // Collect all text chunks with their voice profiles first (fast, non-blocking)
  const work: { text: string; profile: VoiceProfile }[] = []
  const elements = container.querySelectorAll<HTMLElement>('.geems-element')

  for (const el of elements) {
    const voice = el.dataset.voice
    if (voice === 'system') continue

    const textEl = el.querySelector('.geems-text')
    if (!textEl) continue

    const text = (textEl.textContent || '').trim()
    if (!text) continue

    const profile = VOICE_PROFILES[voice || ''] || DEFAULT_PROFILE
    const chunks = chunkText(text, 300)
    for (const chunk of chunks) {
      work.push({ text: chunk, profile })
    }
  }

  if (work.length === 0) return

  // Generate and enqueue chunks one at a time, yielding between each.
  // Start playback as soon as the first chunk is ready.
  for (const { text, profile } of work) {
    // Check if this generation session is still current
    if (session !== generationSession) return
    if (!isTTSEnabled()) return

    // Yield to browser so UI stays responsive
    await yieldToMain()

    try {
      const result = await model.generate(text, {
        voice: profile.voice,
        speed: profile.speed,
      })
      // result.audio is a Float32Array of PCM samples
      playbackQueue.push(new Float32Array(result.audio))

      // Start playback as soon as first chunk arrives
      if (!playing) {
        playNext()
      }
    } catch (err) {
      console.warn('[TTS] Generation failed for chunk:', err)
    }
  }
}

/** Play the next audio chunk in the queue. */
function playNext(): void {
  if (playbackQueue.length === 0) {
    playing = false
    currentSource = null
    return
  }

  playing = true
  const samples = playbackQueue.shift()!

  const buffer = audioCtx!.createBuffer(1, samples.length, sampleRate)
  buffer.getChannelData(0).set(samples)

  const source = audioCtx!.createBufferSource()
  source.buffer = buffer
  source.connect(audioCtx!.destination)
  source.onended = () => {
    if (currentSource === source) {
      currentSource = null
      playNext()
    }
  }

  currentSource = source
  source.start()
}

/** Split text into chunks at sentence boundaries, each <= maxLen characters. */
function chunkText(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text]

  const sentences = text.split(SENTENCE_BOUNDARY)
  const chunks: string[] = []
  let current = ''

  for (const sentence of sentences) {
    if (current.length + sentence.length + 1 > maxLen && current.length > 0) {
      chunks.push(current.trim())
      current = sentence
    } else {
      current += (current ? ' ' : '') + sentence
    }
  }
  if (current.trim()) chunks.push(current.trim())

  return chunks
}
