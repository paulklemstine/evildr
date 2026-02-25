// Typewriter effect — reveals text character-by-character for dopamine anticipation

const BASE_CHAR_DELAY = 18  // ms per character
const PUNCTUATION_PAUSE = 120 // extra ms after . ! ? ...
const COMMA_PAUSE = 60 // extra ms after ,

/**
 * Applies typewriter animation to all .geems-text elements in the container.
 * Returns a promise that resolves when all animations complete.
 */
export function applyTypewriter(container: HTMLElement): Promise<void> {
  const textElements = container.querySelectorAll<HTMLElement>('.geems-text')
  if (textElements.length === 0) return Promise.resolve()

  const promises: Promise<void>[] = []

  textElements.forEach((el, index) => {
    const html = el.innerHTML
    el.innerHTML = ''
    el.style.minHeight = '1.5em'

    // Stagger start: each text element starts after a delay
    const startDelay = index * 200

    promises.push(new Promise((resolve) => {
      setTimeout(() => {
        typewriteHTML(el, html, resolve)
      }, startDelay)
    }))
  })

  return Promise.all(promises).then(() => {})
}

function typewriteHTML(el: HTMLElement, html: string, onDone: () => void): void {
  // Parse HTML into characters, preserving tags
  const segments = parseHTMLSegments(html)
  let current = 0

  function tick() {
    if (current >= segments.length) {
      onDone()
      return
    }

    const seg = segments[current]
    current++

    if (seg.isTag) {
      // Append entire tag at once (no delay for tags)
      el.innerHTML += seg.text
      tick()
    } else {
      el.innerHTML += seg.text
      // Determine delay
      let delay = BASE_CHAR_DELAY
      const char = seg.text
      if (/[.!?]/.test(char)) delay += PUNCTUATION_PAUSE
      else if (char === ',') delay += COMMA_PAUSE
      else if (char === '\n' || seg.text === '<br>') delay += PUNCTUATION_PAUSE

      setTimeout(tick, delay)
    }
  }

  tick()
}

interface Segment {
  text: string
  isTag: boolean
}

function parseHTMLSegments(html: string): Segment[] {
  const segments: Segment[] = []
  let i = 0

  while (i < html.length) {
    if (html[i] === '<') {
      // Find closing >
      const end = html.indexOf('>', i)
      if (end !== -1) {
        segments.push({ text: html.substring(i, end + 1), isTag: true })
        i = end + 1
      } else {
        segments.push({ text: html[i], isTag: false })
        i++
      }
    } else if (html[i] === '&') {
      // HTML entity
      const end = html.indexOf(';', i)
      if (end !== -1 && end - i < 10) {
        segments.push({ text: html.substring(i, end + 1), isTag: false })
        i = end + 1
      } else {
        segments.push({ text: html[i], isTag: false })
        i++
      }
    } else {
      segments.push({ text: html[i], isTag: false })
      i++
    }
  }

  return segments
}
