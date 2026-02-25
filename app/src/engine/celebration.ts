// Micro-celebration engine — dopamine hits on every interaction

/**
 * Triggers a brief particle burst at the event location.
 * Used on button clicks, radio selections, checkbox toggles.
 */
export function celebrate(event: MouseEvent | { clientX: number; clientY: number }): void {
  const x = event.clientX
  const y = event.clientY
  const count = 6 + Math.floor(Math.random() * 6) // 6-12 particles

  for (let i = 0; i < count; i++) {
    createParticle(x, y)
  }
}

function createParticle(x: number, y: number): void {
  const particle = document.createElement('div')
  particle.className = 'celebration-particle'

  // Random color from the manipulation palette
  const colors = ['#2a9d8f', '#e9c46a', '#f4a261', '#e63946', '#9b5de5', '#f4c2c2']
  particle.style.background = colors[Math.floor(Math.random() * colors.length)]

  // Random direction
  const angle = Math.random() * Math.PI * 2
  const velocity = 30 + Math.random() * 60
  const dx = Math.cos(angle) * velocity
  const dy = Math.sin(angle) * velocity

  particle.style.left = `${x}px`
  particle.style.top = `${y}px`
  particle.style.setProperty('--dx', `${dx}px`)
  particle.style.setProperty('--dy', `${dy}px`)

  document.body.appendChild(particle)

  // Cleanup after animation
  setTimeout(() => particle.remove(), 700)
}

/**
 * Attaches celebration triggers to all interactive elements in the container.
 * Returns a cleanup function.
 */
export function attachCelebrations(container: HTMLElement): () => void {
  const handlers: Array<{ el: Element; handler: EventListener }> = []

  // Radio options — celebrate on selection
  container.querySelectorAll('.geems-radio-option').forEach(el => {
    const handler = (e: Event) => celebrate(e as MouseEvent)
    el.addEventListener('click', handler)
    handlers.push({ el, handler })
  })

  // Checkbox toggles
  container.querySelectorAll('.geems-checkbox-option').forEach(el => {
    const handler = (e: Event) => celebrate(e as MouseEvent)
    el.addEventListener('click', handler)
    handlers.push({ el, handler })
  })

  // Slider thumb release — celebrate at center of slider
  container.querySelectorAll<HTMLInputElement>('.geems-slider').forEach(el => {
    const handler = () => {
      const rect = el.getBoundingClientRect()
      celebrate({ clientX: rect.left + rect.width / 2, clientY: rect.top })
    }
    el.addEventListener('change', handler)
    handlers.push({ el, handler: handler as EventListener })
  })

  return () => {
    handlers.forEach(({ el, handler }) => {
      el.removeEventListener('click', handler)
      el.removeEventListener('change', handler)
    })
  }
}

/**
 * Flash a brief color wash over the container — used for dramatic moments.
 */
export function flashColor(container: HTMLElement, color: string, duration = 400): void {
  const flash = document.createElement('div')
  flash.className = 'celebration-flash'
  flash.style.background = color
  container.style.position = 'relative'
  container.appendChild(flash)

  requestAnimationFrame(() => {
    flash.style.opacity = '0.15'
    setTimeout(() => {
      flash.style.opacity = '0'
      setTimeout(() => flash.remove(), 300)
    }, duration)
  })
}
