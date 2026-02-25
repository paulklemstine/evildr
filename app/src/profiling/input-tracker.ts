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

    // Checkbox ratio
    const allCheckboxes = this.container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
    const checkedCount = Array.from(allCheckboxes).filter(cb => cb.checked).length
    const checkboxRatio = allCheckboxes.length > 0
      ? `${checkedCount}/${allCheckboxes.length}`
      : '0/0'

    return {
      responseTimeMs,
      sliderRevisions: this.sliderChanges,
      textRevisions: this.textRevisions,
      totalTextLength,
      radioChoiceIndex,
      checkboxRatio,
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
