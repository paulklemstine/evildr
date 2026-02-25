// Attaches event listeners to capture behavioral signals from UI interactions

import type { BehavioralSignals } from './db'

/**
 * Tracks behavioral signals on the game container between renders.
 * Call `attach()` after each render and `collect()` before submit.
 */
export class InputTracker {
  private container: HTMLElement
  private renderTimestamp: number = 0
  private sliderChanges: number = 0
  private textRevisions: number = 0
  private dropdownChanges: number = 0
  private toggleFlips: number = 0
  private numberInputChanges: number = 0
  private listeners: Array<{ el: Element; event: string; handler: EventListener }> = []

  constructor(container: HTMLElement) {
    this.container = container
  }

  /**
   * Call after rendering a new turn's UI. Attaches listeners to all interactive elements.
   */
  attach(): void {
    this.detach()
    this.renderTimestamp = Date.now()
    this.sliderChanges = 0
    this.textRevisions = 0
    this.dropdownChanges = 0
    this.toggleFlips = 0
    this.numberInputChanges = 0

    // Track slider changes
    this.container.querySelectorAll('input[type="range"]').forEach((el) => {
      const handler = () => { this.sliderChanges++ }
      el.addEventListener('input', handler)
      this.listeners.push({ el, event: 'input', handler })
    })

    // Track text revisions (keydown with Backspace/Delete counts as revision)
    this.container.querySelectorAll('textarea, input[type="text"]').forEach((el) => {
      const handler = (e: Event) => {
        const key = (e as KeyboardEvent).key
        if (key === 'Backspace' || key === 'Delete') {
          this.textRevisions++
        }
      }
      el.addEventListener('keydown', handler)
      this.listeners.push({ el, event: 'keydown', handler })
    })

    // Track dropdown changes
    this.container.querySelectorAll('select[data-element-type="dropdown"]').forEach((el) => {
      const handler = () => { this.dropdownChanges++ }
      el.addEventListener('change', handler)
      this.listeners.push({ el, event: 'change', handler })
    })

    // Track toggle flips
    this.container.querySelectorAll('input[data-element-type="toggle"]').forEach((el) => {
      const handler = () => { this.toggleFlips++ }
      el.addEventListener('change', handler)
      this.listeners.push({ el, event: 'change', handler })
    })

    // Track number input changes
    this.container.querySelectorAll('input[data-element-type="number_input"]').forEach((el) => {
      const handler = () => { this.numberInputChanges++ }
      el.addEventListener('input', handler)
      this.listeners.push({ el, event: 'input', handler })
    })
  }

  /**
   * Collects all behavioral signals. Call right before submitting the turn.
   */
  collect(): BehavioralSignals {
    const responseTimeMs = this.renderTimestamp > 0 ? Date.now() - this.renderTimestamp : 0

    // Total text length across all textfields
    let totalTextLength = 0
    this.container.querySelectorAll<HTMLTextAreaElement>('textarea[data-element-type="textfield"]').forEach((el) => {
      totalTextLength += el.value.length
    })

    // Radio choice index
    let radioChoiceIndex = -1
    const checkedRadio = this.container.querySelector<HTMLInputElement>('input[type="radio"]:checked')
    if (checkedRadio) {
      const allRadios = Array.from(
        this.container.querySelectorAll<HTMLInputElement>(`input[type="radio"][name="${checkedRadio.name}"]`)
      )
      radioChoiceIndex = allRadios.indexOf(checkedRadio)
    }

    // Checkbox ratio (includes toggles)
    const allCheckboxes = this.container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
    const checkedCount = Array.from(allCheckboxes).filter(cb => cb.checked).length
    const checkboxRatio = allCheckboxes.length > 0
      ? `${checkedCount}/${allCheckboxes.length}`
      : '0/0'

    // Rating value
    let ratingValue: number | undefined
    const ratingEl = this.container.querySelector<HTMLElement>('[data-element-type="rating"]')
    if (ratingEl?.dataset.value) ratingValue = parseInt(ratingEl.dataset.value)

    // Emoji selection
    let emojiSelection: string | undefined
    const emojiEl = this.container.querySelector<HTMLElement>('[data-element-type="emoji_react"]')
    if (emojiEl?.dataset.value) emojiSelection = emojiEl.dataset.value

    // Color selection
    let colorSelection: string | undefined
    const colorEl = this.container.querySelector<HTMLElement>('[data-element-type="color_pick"]')
    if (colorEl?.dataset.value) colorSelection = colorEl.dataset.value

    // Number input value
    let numberInputValue: number | undefined
    const numberEl = this.container.querySelector<HTMLInputElement>('input[data-element-type="number_input"]')
    if (numberEl) numberInputValue = parseFloat(numberEl.value)

    return {
      responseTimeMs,
      sliderRevisions: this.sliderChanges,
      textRevisions: this.textRevisions,
      totalTextLength,
      radioChoiceIndex,
      checkboxRatio,
      dropdownChanges: this.dropdownChanges,
      ratingValue,
      toggleFlips: this.toggleFlips,
      emojiSelection,
      colorSelection,
      numberInputValue,
    }
  }

  /**
   * Removes all attached event listeners.
   */
  detach(): void {
    for (const { el, event, handler } of this.listeners) {
      el.removeEventListener(event, handler)
    }
    this.listeners = []
  }
}
