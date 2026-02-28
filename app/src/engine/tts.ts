// ============================================================================
// tts.ts — Text-to-Speech with Kokoro.js (in-browser neural TTS)
// ============================================================================
//
// Uses Kokoro.js — an 82M parameter ONNX model running via WebAssembly.
// 28 distinct English voices, no API key, no usage limits, works offline
// after initial ~92MB model download (cached in IndexedDB).
//
// Lazy initialization: model downloads on first speakTurn() call, not at boot.

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

// Kokoro model instance (lazy-loaded)
let ttsModel: KokoroTTSType | null = null
let modelLoading = false
let modelLoadAborted = false

// Audio playback state
let audioCtx: AudioContext | null = null
let currentSource: AudioBufferSourceNode | null = null
let playbackQueue: Float32Array[] = []
let playing = false
let sampleRate = 24000 // Kokoro default sample rate

/** Sentence-boundary regex for chunking long text */
const SENTENCE_BOUNDARY = /(?<=[.!?])\s+/

/**
 * Initialize TTS — just applies body class from localStorage.
 * No model download at this stage.
 */
export function initTTS(): void {
  if (isTTSEnabled()) {
    document.body.classList.add('tts-on')
  }
}

export function isTTSEnabled(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'on'
}

export function setTTSEnabled(on: boolean): void {
  localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off')
  if (on) {
    document.body.classList.add('tts-on')
  } else {
    document.body.classList.remove('tts-on')
    stopSpeaking()
  }
}

export function stopSpeaking(): void {
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

/**
 * Load the Kokoro model lazily. Called on first speakTurn().
 * Shows loading state via body.tts-loading class.
 */
async function ensureModel(): Promise<KokoroTTSType | null> {
  if (ttsModel) return ttsModel
  if (modelLoading) return null // already loading, skip duplicate

  modelLoading = true
  modelLoadAborted = false
  document.body.classList.add('tts-loading')

  try {
    const { KokoroTTS } = await import('kokoro-js')
    if (modelLoadAborted) return null

    ttsModel = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
      dtype: 'q8',
      device: 'wasm',
    })

    return ttsModel
  } catch (err) {
    console.error('[TTS] Failed to load Kokoro model:', err)
    return null
  } finally {
    modelLoading = false
    document.body.classList.remove('tts-loading')
  }
}

/**
 * Speak all text elements in a rendered turn container.
 * Skips system/hidden elements. Each element generates audio with
 * its character voice, queued for sequential playback.
 */
export async function speakTurn(container: HTMLElement): Promise<void> {
  if (!isTTSEnabled()) return

  const model = await ensureModel()
  if (!model) return
  if (!isTTSEnabled()) return // may have been toggled off during load

  // Ensure AudioContext exists (requires user gesture — satisfied by submit click)
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume()
  }
  sampleRate = 24000

  const elements = container.querySelectorAll<HTMLElement>('.geems-element')
  const audioChunks: Float32Array[] = []

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
      try {
        const result = await model.generate(chunk, {
          voice: profile.voice,
          speed: profile.speed,
        })
        // result.audio is a Float32Array of PCM samples
        audioChunks.push(new Float32Array(result.audio))
      } catch (err) {
        console.warn('[TTS] Generation failed for chunk:', err)
      }
    }
  }

  if (audioChunks.length > 0) {
    playbackQueue = audioChunks
    playNext()
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
