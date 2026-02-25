// Anticipation engine — variable delays and reveal animations for dopamine priming

/**
 * Shows a brief anticipation overlay before revealing new content.
 * Delay varies to prevent habituation (variable ratio).
 */
export function showAnticipation(container: HTMLElement): Promise<void> {
  // Variable delay: 800-2200ms, unpredictable
  const delay = 800 + Math.random() * 1400

  return new Promise((resolve) => {
    const overlay = document.createElement('div')
    overlay.className = 'anticipation-overlay'
    overlay.innerHTML = `
      <div class="anticipation-inner">
        <div class="anticipation-dots">
          <span class="anticipation-dot"></span>
          <span class="anticipation-dot"></span>
          <span class="anticipation-dot"></span>
        </div>
      </div>
    `
    container.appendChild(overlay)

    setTimeout(() => {
      overlay.classList.add('anticipation-fade-out')
      setTimeout(() => {
        overlay.remove()
        resolve()
      }, 300)
    }, delay)
  })
}

/**
 * Staggers the appearance of child elements with a cascading reveal.
 * Each element fades in sequentially for a "waterfall" effect.
 */
export function cascadeReveal(container: HTMLElement): void {
  const children = Array.from(container.children) as HTMLElement[]

  children.forEach((child, i) => {
    child.style.opacity = '0'
    child.style.transform = 'translateY(12px)'
    child.style.transition = 'opacity 0.4s ease, transform 0.4s ease'

    setTimeout(() => {
      child.style.opacity = '1'
      child.style.transform = 'translateY(0)'
    }, i * 120 + 50)
  })
}

/**
 * Pulse animation on interactive elements to draw attention.
 * Applies a subtle glow that pulses 2-3 times.
 */
export function pulseInteractive(container: HTMLElement): void {
  const interactives = container.querySelectorAll<HTMLElement>(
    '.geems-radio-option, .geems-checkbox-option, .geems-slider, .geems-textarea'
  )

  interactives.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add('pulse-attention')
      setTimeout(() => el.classList.remove('pulse-attention'), 1500)
    }, i * 200 + 1000) // Start after text is partially revealed
  })
}
