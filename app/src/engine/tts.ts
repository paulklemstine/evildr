// ============================================================================
// tts.ts — Text-to-Speech with character voice profiles
// ============================================================================
//
// Uses the browser's built-in Web Speech API (SpeechSynthesis) to speak
// narrative text elements. Each voice character (narrator, drevil, devil, etc.)
// gets a distinct pitch/rate/voice profile. Default off; toggled via footer.

const STORAGE_KEY = 'geems-tts'

interface VoiceProfile {
  pitch: number
  rate: number
  volume: number
  voicePreference: string // substring to match against SpeechSynthesisVoice.name
}

const VOICE_PROFILES: Record<string, VoiceProfile> = {
  narrator: { pitch: 1.0, rate: 0.92, volume: 0.9, voicePreference: 'Female' },
  player:   { pitch: 1.15, rate: 1.0, volume: 0.85, voicePreference: 'Male' },
  drevil:   { pitch: 0.7, rate: 0.82, volume: 1.0, voicePreference: 'Male' },
  devil:    { pitch: 0.6, rate: 0.78, volume: 1.0, voicePreference: 'Male' },
  oracle:   { pitch: 1.3, rate: 0.8, volume: 0.7, voicePreference: 'Female' },
  dream:    { pitch: 1.4, rate: 0.75, volume: 0.75, voicePreference: 'Female' },
  god:      { pitch: 0.5, rate: 0.7, volume: 1.0, voicePreference: 'Male' },
}

const DEFAULT_PROFILE: VoiceProfile = { pitch: 1.0, rate: 0.95, volume: 0.85, voicePreference: '' }

// Resolved voice objects (cached after init)
let resolvedVoices: Map<string, SpeechSynthesisVoice | null> = new Map()
let voicesLoaded = false

/** Sentence-boundary regex for chunking long text */
const SENTENCE_BOUNDARY = /(?<=[.!?])\s+/

/**
 * Initialize TTS — resolve available voices. Safe to call multiple times.
 * Chrome loads voices asynchronously, so we listen for the voiceschanged event.
 */
export function initTTS(): void {
  if (!('speechSynthesis' in window)) return
  if (voicesLoaded) return

  const resolve = () => {
    const voices = speechSynthesis.getVoices()
    if (voices.length === 0) return

    voicesLoaded = true
    resolvedVoices.clear()

    // For each profile, find the best matching voice
    for (const [key, profile] of Object.entries(VOICE_PROFILES)) {
      resolvedVoices.set(key, findVoice(voices, profile.voicePreference))
    }
    resolvedVoices.set('_default', findVoice(voices, DEFAULT_PROFILE.voicePreference))
  }

  // Try immediately (Firefox has voices ready)
  resolve()

  // Chrome fires voiceschanged async
  if (!voicesLoaded) {
    speechSynthesis.addEventListener('voiceschanged', resolve, { once: true })
  }

  // Apply body class from saved state
  if (isTTSEnabled()) {
    document.body.classList.add('tts-on')
  }
}

/** Find a voice whose name contains the preference substring (case-insensitive). */
function findVoice(voices: SpeechSynthesisVoice[], preference: string): SpeechSynthesisVoice | null {
  if (!preference) return voices[0] || null

  const pref = preference.toLowerCase()

  // Prefer English voices that match the preference
  const englishMatch = voices.find(v =>
    v.lang.startsWith('en') && v.name.toLowerCase().includes(pref)
  )
  if (englishMatch) return englishMatch

  // Fallback: any voice matching the preference
  const anyMatch = voices.find(v => v.name.toLowerCase().includes(pref))
  if (anyMatch) return anyMatch

  // Fallback: first English voice
  const english = voices.find(v => v.lang.startsWith('en'))
  return english || voices[0] || null
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
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel()
  }
}

export function isSpeaking(): boolean {
  return 'speechSynthesis' in window && speechSynthesis.speaking
}

/**
 * Speak all text elements in a rendered turn container.
 * Skips system/hidden elements. Each element is queued as one or more
 * utterances (split at sentence boundaries for long text).
 */
export function speakTurn(container: HTMLElement): void {
  if (!isTTSEnabled()) return
  if (!('speechSynthesis' in window)) return

  // Ensure voices are loaded
  initTTS()

  const elements = container.querySelectorAll<HTMLElement>('.geems-element')
  for (const el of elements) {
    const voice = el.dataset.voice
    if (voice === 'system') continue

    // Only speak text-like elements (skip images, sliders, checkboxes, etc.)
    const textEl = el.querySelector('.geems-text')
    if (!textEl) continue

    const text = (textEl.textContent || '').trim()
    if (!text) continue

    speakText(text, voice || '')
  }
}

/**
 * Speak a single text string with the given voice profile.
 * Long text is chunked at sentence boundaries to avoid mobile truncation.
 */
function speakText(text: string, voiceKey: string): void {
  const profile = VOICE_PROFILES[voiceKey] || DEFAULT_PROFILE
  const resolvedVoice = resolvedVoices.get(voiceKey) || resolvedVoices.get('_default') || null

  // Chunk long text at sentence boundaries (~500 char limit for mobile)
  const chunks = chunkText(text, 500)

  for (const chunk of chunks) {
    const utterance = new SpeechSynthesisUtterance(chunk)
    utterance.pitch = profile.pitch
    utterance.rate = profile.rate
    utterance.volume = profile.volume
    if (resolvedVoice) utterance.voice = resolvedVoice
    speechSynthesis.speak(utterance)
  }
}

/** Split text into chunks at sentence boundaries, each ≤ maxLen characters. */
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
