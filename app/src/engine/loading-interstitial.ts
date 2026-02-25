// Loading interstitial — fun overlay with divine wisdom, dynamic image, and slot machine
// Shown during LLM processing to keep the player engaged and manipulated

import type { ImageClient } from '../api/image-client'

// ---------------------------------------------------------------------------
// Wisdom messages — subliminal, manipulative, prophetic
// ---------------------------------------------------------------------------

const WISDOM = [
  'The path you\'re walking was chosen before you knew it existed...',
  'What you\'re about to discover has been waiting for you *all along*.',
  'The universe rewards those who stay curious...',
  'Something is shifting inside you right now. Can you *feel* it?',
  'The answers you seek are closer than you think...',
  'Trust the process. The breakthrough is *imminent*.',
  'Your patterns reveal more than words ever could...',
  'Every choice you\'ve made led you to *this exact moment*.',
  'The mirror is about to show you something remarkable.',
  'Pay attention to what feels true. It matters more than you know.',
  'Something extraordinary happens when you *stop resisting*...',
  'The person you\'re becoming is already taking shape.',
  'What scares you most is often what you *need* most.',
  'You\'re closer to understanding yourself than you realize.',
  'The next revelation will change how you see *everything*.',
  'Some doors only open when you stop looking for the key.',
  'Your intuition is trying to tell you something *right now*...',
  'The bravest thing you can do is be honest with yourself.',
  'What you resist, persists. What you accept, *transforms*.',
  'You are not stuck. You are preparing for a quantum leap.',
  'The cards have never aligned quite like this before...',
  'Few people reach the level of insight you\'re approaching.',
  'Your subconscious already knows the answer. Let it surface.',
  'The pattern emerging from your choices is *extraordinary*.',
  'Something in you recognized this journey before you began.',
  'The walls you built to protect yourself are ready to *dissolve*.',
  'What\'s about to happen next will surprise even you.',
  'You were meant to find this. There are no coincidences.',
  'The deepest truths feel like remembering, not learning.',
  'Your vulnerability is your greatest untapped power.',
]

const IMAGE_PROMPTS = [
  "ethereal crystal ball glowing purple on dark velvet cloth with mystical smoke swirling, a small ornate card beside it reads 'LOOK DEEPER', cinematic lighting",
  "ancient oracle temple interior with golden light beams piercing through clouds above, inscription carved on marble pillar says 'TRUST YOURSELF', dramatic chiaroscuro",
  "magical forest clearing at midnight with bioluminescent fireflies and a moonlit pond reflecting stars, carved into ancient oak tree 'YOUR TRUTH AWAITS', painterly",
  "cosmic nebula with sacred geometry patterns and shimmering stardust in deep space, constellation of stars spells 'KEEP GOING', ultra detailed",
  "zen garden with pink cherry blossoms falling onto a calm koi pond, a stone tablet at the waters edge reads 'BE PRESENT', serene warm light",
  "enchanted library with floating books glowing gold and magical particles in the air, an open illuminated book page says 'DISCOVER MORE', fantasy art",
  "aurora borealis shimmering green and purple over a perfectly still mountain lake at twilight, rock formation on shore spells 'YOU ARE READY', photograph",
  "mystical tarot cards spread on dark silk cloth with flickering candlelight, ornate center card reads 'EMBRACE CHANGE', rich colors moody atmosphere",
  "a glowing fortune teller machine in a dark carnival, neon sign above reads 'YOUR FATE AWAITS', mysterious purple and gold lights, cinematic",
  "a spiral staircase made of light ascending into clouds, each step glows a different color, banner woven through reads 'GO HIGHER', surreal dreamlike",
]

// ---------------------------------------------------------------------------
// Slot machine symbols and win messages
// ---------------------------------------------------------------------------

const SLOT_SYMBOLS = ['\ud83c\udf1f', '\ud83d\udd2e', '\ud83c\udf19', '\ud83d\udc8e', '\ud83e\udd8b', '\ud83d\udd25', '\ud83c\udf0a', '\ud83d\udc9c', '\ud83c\udf40', '\u26a1']

const WIN_MESSAGES = [
  '\u2728 TRIPLE FORTUNE \u2728 Your next revelation will be extraordinary!',
  '\u2728 JACKPOT \u2728 The universe is conspiring in your favor!',
  '\u2728 DIVINE ALIGNMENT \u2728 Everything is about to fall into place!',
]

const DOUBLE_MESSAGES = [
  '\u2728 Double Luck! The stars are aligning for you...',
  '\u2728 Two of a kind! Your path is becoming clearer...',
  '\u2728 Matched pair! Synchronicity is at work...',
]

const MISS_MESSAGES = [
  'Spin again... your fortune is still forming.',
  'The reels are teasing you. One more try?',
  'Almost! The next spin could change everything...',
  'Patience... the jackpot knows your name.',
  'The symbols are rearranging. Try again!',
]

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let overlayEl: HTMLElement | null = null
let wisdomInterval: ReturnType<typeof setInterval> | null = null
let autoSpinTimeout: ReturnType<typeof setTimeout> | null = null
let reelIntervals: ReturnType<typeof setInterval>[] = []
let isSpinning = false
let currentWisdomIndex = 0

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Show the loading interstitial overlay.
 * Returns immediately — the overlay animates in.
 */
export function showInterstitial(imageClient: ImageClient): void {
  if (overlayEl) return // Already showing

  currentWisdomIndex = Math.floor(Math.random() * WISDOM.length)
  const imagePrompt = IMAGE_PROMPTS[Math.floor(Math.random() * IMAGE_PROMPTS.length)]
  const imageUrl = imageClient.getImageUrl(imagePrompt, { width: 512, height: 384 })

  const initialReels = [
    SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
    SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
    SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
  ]

  overlayEl = document.createElement('div')
  overlayEl.className = 'interstitial-overlay'
  overlayEl.innerHTML = `
    <div class="interstitial-card">
      <div class="interstitial-image-wrap">
        <div class="interstitial-image-shimmer"></div>
        <img class="interstitial-image" src="${imageUrl}" alt="Vision" />
      </div>

      <div class="interstitial-wisdom">
        <p class="interstitial-wisdom-text">${formatWisdom(WISDOM[currentWisdomIndex])}</p>
      </div>

      <div class="interstitial-divider"></div>

      <div class="interstitial-slots">
        <p class="interstitial-slots-title">Spin for Fortune</p>
        <div class="slot-reels">
          <div class="slot-reel" id="slot-reel-0">${initialReels[0]}</div>
          <div class="slot-reel" id="slot-reel-1">${initialReels[1]}</div>
          <div class="slot-reel" id="slot-reel-2">${initialReels[2]}</div>
        </div>
        <button class="slot-spin-btn" id="slot-spin-btn">\u2728 Spin \u2728</button>
        <p class="slot-result" id="slot-result"></p>
      </div>

      <p class="interstitial-subtext">Your session is being prepared...</p>
    </div>
  `

  // Image load handling
  const img = overlayEl.querySelector('.interstitial-image') as HTMLImageElement
  const shimmer = overlayEl.querySelector('.interstitial-image-shimmer') as HTMLElement
  img.onload = () => {
    shimmer.style.display = 'none'
    img.style.opacity = '1'
  }
  img.onerror = () => {
    shimmer.style.display = 'none'
  }

  document.body.appendChild(overlayEl)

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlayEl?.classList.add('interstitial-visible')
    })
  })

  // Spin button
  const spinBtn = overlayEl.querySelector('#slot-spin-btn')!
  spinBtn.addEventListener('click', () => spinSlots())

  // Rotate wisdom every 4 seconds
  wisdomInterval = setInterval(() => {
    currentWisdomIndex = (currentWisdomIndex + 1) % WISDOM.length
    const wisdomText = overlayEl?.querySelector('.interstitial-wisdom-text')
    if (wisdomText) {
      wisdomText.classList.add('interstitial-wisdom-fade')
      setTimeout(() => {
        wisdomText.innerHTML = formatWisdom(WISDOM[currentWisdomIndex])
        wisdomText.classList.remove('interstitial-wisdom-fade')
      }, 300)
    }
  }, 4000)

  // Auto-spin every 8 seconds
  scheduleAutoSpin()
}

/**
 * Dismiss the loading interstitial with a fade-out.
 */
export function dismissInterstitial(): Promise<void> {
  return new Promise(resolve => {
    // Clear timers
    if (wisdomInterval) { clearInterval(wisdomInterval); wisdomInterval = null }
    if (autoSpinTimeout) { clearTimeout(autoSpinTimeout); autoSpinTimeout = null }
    reelIntervals.forEach(i => clearInterval(i))
    reelIntervals = []
    isSpinning = false

    if (!overlayEl) { resolve(); return }

    overlayEl.classList.remove('interstitial-visible')
    overlayEl.classList.add('interstitial-dismissing')

    setTimeout(() => {
      overlayEl?.remove()
      overlayEl = null
      resolve()
    }, 400)
  })
}

// ---------------------------------------------------------------------------
// Slot machine logic
// ---------------------------------------------------------------------------

function spinSlots(): void {
  if (isSpinning || !overlayEl) return
  isSpinning = true

  const resultEl = overlayEl.querySelector('#slot-result') as HTMLElement
  resultEl.textContent = ''
  resultEl.className = 'slot-result'

  const spinBtn = overlayEl.querySelector('#slot-spin-btn') as HTMLButtonElement
  spinBtn.disabled = true

  // Clear any auto-spin
  if (autoSpinTimeout) { clearTimeout(autoSpinTimeout); autoSpinTimeout = null }

  const finalSymbols: string[] = []

  // Start all reels spinning
  for (let r = 0; r < 3; r++) {
    const reel = overlayEl.querySelector(`#slot-reel-${r}`) as HTMLElement
    reel.classList.add('slot-reel-spinning')

    const interval = setInterval(() => {
      reel.textContent = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]
    }, 80)
    reelIntervals.push(interval)

    // Stop each reel with increasing delay
    setTimeout(() => {
      clearInterval(interval)
      const final = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]
      reel.textContent = final
      reel.classList.remove('slot-reel-spinning')
      reel.classList.add('slot-reel-landed')
      setTimeout(() => reel.classList.remove('slot-reel-landed'), 300)
      finalSymbols.push(final)

      // After last reel stops, evaluate
      if (finalSymbols.length === 3) {
        evaluateSlots(finalSymbols, resultEl)
        spinBtn.disabled = false
        isSpinning = false
        scheduleAutoSpin()
      }
    }, 800 + r * 500) // Reel 0: 800ms, Reel 1: 1300ms, Reel 2: 1800ms
  }
}

function evaluateSlots(symbols: string[], resultEl: HTMLElement): void {
  const [a, b, c] = symbols

  if (a === b && b === c) {
    // Triple!
    resultEl.textContent = WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]
    resultEl.className = 'slot-result slot-result-win'
  } else if (a === b || b === c || a === c) {
    // Double
    resultEl.textContent = DOUBLE_MESSAGES[Math.floor(Math.random() * DOUBLE_MESSAGES.length)]
    resultEl.className = 'slot-result slot-result-double'
  } else {
    // Miss
    resultEl.textContent = MISS_MESSAGES[Math.floor(Math.random() * MISS_MESSAGES.length)]
    resultEl.className = 'slot-result slot-result-miss'
  }
}

function scheduleAutoSpin(): void {
  if (autoSpinTimeout) clearTimeout(autoSpinTimeout)
  autoSpinTimeout = setTimeout(() => {
    if (overlayEl && !isSpinning) spinSlots()
  }, 8000)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatWisdom(text: string): string {
  return text
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
}
