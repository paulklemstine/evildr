// Session hooks — peak-end rule, cliffhangers, re-engagement interstitials

const LAST_VISIT_KEY = 'geems_last_visit'
const CLIFFHANGER_KEY = 'geems_cliffhanger'

/**
 * Shows a "while you were away" interstitial if the player is returning.
 * Returns true if the interstitial was shown.
 */
export function showReEngagement(app: HTMLElement): Promise<boolean> {
  const lastVisit = localStorage.getItem(LAST_VISIT_KEY)
  const cliffhanger = localStorage.getItem(CLIFFHANGER_KEY)

  // Update last visit
  localStorage.setItem(LAST_VISIT_KEY, Date.now().toString())

  if (!lastVisit || !cliffhanger) return Promise.resolve(false)

  const elapsed = Date.now() - parseInt(lastVisit)
  if (elapsed < 30 * 60 * 1000) return Promise.resolve(false) // Less than 30 min, skip

  const hours = Math.floor(elapsed / (1000 * 60 * 60))
  const timeText = hours > 24
    ? `${Math.floor(hours / 24)} days`
    : hours > 0 ? `${hours} hours` : 'a while'

  return new Promise((resolve) => {
    const overlay = document.createElement('div')
    overlay.className = 'reengagement-overlay'
    overlay.innerHTML = `
      <div class="reengagement-card">
        <div class="reengagement-time">${timeText} ago</div>
        <h2 class="reengagement-title">The story continued without you...</h2>
        <p class="reengagement-text">${escapeHtml(cliffhanger)}</p>
        <button class="geems-button reengagement-continue">Return to the Story</button>
      </div>
    `

    app.appendChild(overlay)

    // Animate in
    requestAnimationFrame(() => {
      overlay.classList.add('reengagement-visible')
    })

    overlay.querySelector('.reengagement-continue')!.addEventListener('click', () => {
      overlay.classList.remove('reengagement-visible')
      setTimeout(() => {
        overlay.remove()
        resolve(true)
      }, 300)
    })
  })
}

/**
 * Saves a cliffhanger message for re-engagement on next visit.
 */
export function saveCliffhanger(message: string): void {
  try {
    localStorage.setItem(CLIFFHANGER_KEY, message)
    localStorage.setItem(LAST_VISIT_KEY, Date.now().toString())
  } catch { /* noop */ }
}

/**
 * Extracts a cliffhanger from the current UI state.
 * Looks for the last text element and radio options.
 */
export function extractCliffhanger(uiJson: Array<{ type: string; value?: string; options?: unknown }>): string {
  // Find the last text-like element
  const texts = uiJson.filter(el =>
    el.type === 'text' || el.type === 'narrative'
  )
  const lastText = texts[texts.length - 1]

  if (lastText?.value) {
    // Truncate to ~100 chars
    const text = lastText.value
    if (text.length > 100) {
      return text.substring(0, 100).trim() + '...'
    }
    return text
  }

  return 'Something was about to happen...'
}

// ---- Positive ending injection ----

/**
 * Returns a warm affirmation to append before session end.
 * Exploits peak-end rule: always end on a high.
 */
export function getSessionEndAffirmation(): string {
  const affirmations = [
    "Every answer you've given reveals something remarkable about who you are.",
    "The courage it takes to explore yourself like this is rarer than you think.",
    "Something shifted in this session. You may not see it yet, but it's there.",
    "The patterns you're creating here tell a story only you could write.",
    "You've gone deeper than most people ever dare. That says everything.",
    "There are layers to you that this session only began to uncover.",
  ]
  return affirmations[Math.floor(Math.random() * affirmations.length)]
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
