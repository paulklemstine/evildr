// ============================================================================
// renderer.ts - Renders LLM JSON UI arrays into DOM elements
// ============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UIElement {
  // Known types + LLMs may invent arbitrary types (e.g. "probe", "divine_wisdom")
  type: string
  name: string
  label?: string
  value: string
  color?: string
  voice?: string
  min?: number | string
  max?: number | string
  step?: number | string
  options?: RadioOption[] | string[] | string
  text?: string
  placeholder?: string
}

export interface RenderResult {
  notes: string
  subjectId: string
  analysis: string
  tweet: string
}

interface RadioOption {
  label: string
  value: string
}

interface ParsedRadioOption {
  label: string
  value: string
  isDefault: boolean
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MIN_CONTRAST_LIGHTNESS = 0.55

// ---------------------------------------------------------------------------
// Color utilities
// ---------------------------------------------------------------------------

function isValidHexColor(hex: unknown): hex is string {
  return typeof hex === 'string' && /^#[0-9A-F]{6}$/i.test(hex)
}

/**
 * Adjusts a hex color so it has enough contrast against a dark background.
 * Colors that are too light (high luminance) are darkened.
 */
export function adjustColorForContrast(hex: string): string {
  if (!isValidHexColor(hex)) return hex

  let r = parseInt(hex.substring(1, 3), 16) / 255
  let g = parseInt(hex.substring(3, 5), 16) / 255
  let b = parseInt(hex.substring(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  if (l > MIN_CONTRAST_LIGHTNESS) {
    const adjustedL = MIN_CONTRAST_LIGHTNESS * 0.9

    const hue2rgb = (p: number, q: number, t: number): number => {
      let tt = t
      if (tt < 0) tt += 1
      if (tt > 1) tt -= 1
      if (tt < 1 / 6) return p + (q - p) * 6 * tt
      if (tt < 1 / 2) return q
      if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6
      return p
    }

    let r1: number, g1: number, b1: number
    if (s === 0) {
      r1 = g1 = b1 = adjustedL
    } else {
      const q = adjustedL < 0.5 ? adjustedL * (1 + s) : adjustedL + s - adjustedL * s
      const p = 2 * adjustedL - q
      r1 = hue2rgb(p, q, h + 1 / 3)
      g1 = hue2rgb(p, q, h)
      b1 = hue2rgb(p, q, h - 1 / 3)
    }

    const toHex = (x: number): string => {
      const hexVal = Math.round(x * 255).toString(16)
      return hexVal.length === 1 ? '0' + hexVal : hexVal
    }

    return `#${toHex(r1)}${toHex(g1)}${toHex(b1)}`
  }

  return hex
}

// ---------------------------------------------------------------------------
// Markdown-lite renderer (bold, italic, code blocks, newlines)
// ---------------------------------------------------------------------------

function renderBasicMarkdown(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/```([\s\S]*?)```/g, (_match, p1: string) => `<pre>${p1.trim()}</pre>`)
    .replace(/\n/g, '<br>')
}

// ---------------------------------------------------------------------------
// Individual element renderers
// ---------------------------------------------------------------------------

function renderImageElement(
  wrapper: HTMLDivElement,
  element: UIElement,
  adjustedColor: string | null,
): void {
  wrapper.classList.add('geems-image-container')
  wrapper.classList.remove('geems-element')
  wrapper.style.borderLeftColor = 'transparent'

  if (element.label) {
    const labelDiv = document.createElement('div')
    labelDiv.className = 'geems-label text-center font-bold text-xl mb-4'
    if (adjustedColor) labelDiv.style.color = adjustedColor
    labelDiv.textContent = element.label
    wrapper.appendChild(labelDiv)
  }

  const imagePrompt = element.value || 'abstract image'

  // Shimmer placeholder container
  const placeholderDiv = document.createElement('div')
  placeholderDiv.className = 'geems-image-placeholder'

  const spinnerSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  spinnerSvg.setAttribute('width', '32')
  spinnerSvg.setAttribute('height', '32')
  spinnerSvg.setAttribute('viewBox', '0 0 24 24')
  spinnerSvg.setAttribute('fill', 'none')
  spinnerSvg.classList.add('geems-image-spinner')
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  circle.setAttribute('cx', '12')
  circle.setAttribute('cy', '12')
  circle.setAttribute('r', '10')
  circle.setAttribute('stroke', 'currentColor')
  circle.setAttribute('stroke-width', '3')
  circle.setAttribute('opacity', '0.2')
  const arc = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  arc.setAttribute('d', 'M4 12a8 8 0 018-8')
  arc.setAttribute('stroke', 'currentColor')
  arc.setAttribute('stroke-width', '3')
  arc.setAttribute('stroke-linecap', 'round')
  spinnerSvg.appendChild(circle)
  spinnerSvg.appendChild(arc)
  placeholderDiv.appendChild(spinnerSvg)

  const loadingText = document.createElement('p')
  loadingText.className = 'geems-image-loading-text'
  loadingText.textContent = 'Generating image...'
  placeholderDiv.appendChild(loadingText)

  wrapper.appendChild(placeholderDiv)

  // Actual image — hidden until loaded
  const img = document.createElement('img')
  img.className = 'geems-image'
  img.style.display = 'none'
  img.dataset.imagePrompt = imagePrompt
  img.alt = element.label || `Image: ${imagePrompt.substring(0, 50)}...`

  img.onload = () => {
    placeholderDiv.remove()
    img.style.display = 'block'
  }
  img.onerror = () => {
    placeholderDiv.querySelector('.geems-image-spinner')?.remove()
    loadingText.textContent = 'Image could not be loaded'
    loadingText.style.color = '#dc2626'
  }

  // src is set to empty — the game loop's resolveImages() sets the real URL
  img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"%3E%3C/svg%3E'

  wrapper.appendChild(img)

  const promptText = document.createElement('p')
  promptText.className = 'geems-image-prompt'
  promptText.textContent = imagePrompt
  wrapper.appendChild(promptText)
}

function renderTextElement(
  wrapper: HTMLDivElement,
  element: UIElement,
  adjustedColor: string | null,
): void {
  const textContent = element.text || element.value || ''

  // Only show a label for elements whose name does NOT indicate a narrative/analysis role
  const suppressLabel = ['narrative', 'divine_wisdom', 'player_facing_analysis'].some(
    (part) => element.name?.includes(part),
  )
  if (element.label && !suppressLabel) {
    const label = document.createElement('label')
    label.className = 'geems-label'
    if (adjustedColor) label.style.color = adjustedColor
    label.textContent = element.label
    wrapper.appendChild(label)
  }

  const textEl = document.createElement('div')
  textEl.className = 'geems-text'
  textEl.innerHTML = renderBasicMarkdown(textContent)
  wrapper.appendChild(textEl)
}

function renderTextFieldElement(
  wrapper: HTMLDivElement,
  element: UIElement,
  adjustedColor: string | null,
): void {
  const label = document.createElement('label')
  label.className = 'geems-label'
  label.textContent = element.label || element.name
  label.htmlFor = element.name
  if (adjustedColor) label.style.color = adjustedColor
  wrapper.appendChild(label)

  const input = document.createElement('textarea')
  input.className = 'geems-textarea'
  input.id = element.name
  input.name = element.name
  input.rows = 4
  input.value = element.value || ''
  input.placeholder = element.placeholder || 'Type response...'
  input.dataset.elementType = 'textfield'
  wrapper.appendChild(input)
}

function renderCheckboxElement(
  wrapper: HTMLDivElement,
  element: UIElement,
  adjustedColor: string | null,
): void {
  wrapper.classList.remove('geems-element')
  wrapper.style.borderLeftColor = 'transparent'
  wrapper.style.padding = '0'
  wrapper.style.marginBottom = '0.75rem'

  const optionDiv = document.createElement('div')
  optionDiv.className = 'geems-checkbox-option'

  const input = document.createElement('input')
  input.type = 'checkbox'
  input.id = element.name
  input.name = element.name
  input.checked = element.value === true as unknown || String(element.value).toLowerCase() === 'true'
  input.dataset.elementType = 'checkbox'
  if (adjustedColor) input.style.accentColor = adjustedColor

  const label = document.createElement('label')
  label.htmlFor = element.name
  label.textContent = element.label || element.name
  label.className = 'flex-grow cursor-pointer'

  optionDiv.appendChild(input)
  optionDiv.appendChild(label)
  wrapper.appendChild(optionDiv)
}

function renderSliderElement(
  wrapper: HTMLDivElement,
  element: UIElement,
  adjustedColor: string | null,
): void {
  const label = document.createElement('label')
  label.className = 'geems-label'
  label.textContent = element.label || element.name
  label.htmlFor = element.name
  if (adjustedColor) label.style.color = adjustedColor
  wrapper.appendChild(label)

  const sliderContainer = document.createElement('div')
  sliderContainer.className = 'flex items-center space-x-4 mt-2'

  const input = document.createElement('input')
  input.type = 'range'
  input.className = 'geems-slider flex-grow'
  input.id = element.name
  input.name = element.name

  const min = parseFloat(String(element.min)) || 0
  const max = parseFloat(String(element.max)) || 10
  input.min = String(min)
  input.max = String(max)
  input.step = String(element.step || 1)

  const defaultValue = parseFloat(element.value)
  input.value = String(
    isNaN(defaultValue) ? (min + max) / 2 : Math.max(min, Math.min(max, defaultValue)),
  )
  input.dataset.elementType = 'slider'

  if (adjustedColor) {
    input.style.accentColor = adjustedColor
    input.style.setProperty('--slider-thumb-color', adjustedColor)
  }

  const valueDisplay = document.createElement('span')
  valueDisplay.className = 'geems-slider-value-display font-medium w-auto text-right'
  valueDisplay.textContent = input.value
  if (adjustedColor) valueDisplay.style.color = adjustedColor

  input.oninput = () => {
    valueDisplay.textContent = input.value
  }

  sliderContainer.appendChild(input)
  sliderContainer.appendChild(valueDisplay)
  wrapper.appendChild(sliderContainer)
}

/**
 * Parses the options source (string, array of strings, array of objects)
 * into a uniform ParsedRadioOption array plus the default value.
 */
function parseRadioOptions(
  element: UIElement,
): { options: ParsedRadioOption[]; defaultValue: string | null } {
  let optionsSource: unknown = element.options ?? element.value
  let defaultValue: string | null = null
  let options: ParsedRadioOption[] = []

  try {
    // If the source is a JSON string, parse it
    if (typeof optionsSource === 'string') {
      try {
        optionsSource = JSON.parse(optionsSource)
      } catch {
        // Not JSON -- treat the whole string as a single option
        optionsSource = [{ label: optionsSource as string, value: optionsSource as string }]
      }
    }

    if (Array.isArray(optionsSource)) {
      options = (optionsSource as unknown[])
        .map((opt) => {
          let currentLabel = ''
          let currentValue = ''
          let isDefault = false

          if (typeof opt === 'object' && opt !== null && 'value' in opt) {
            const obj = opt as { value: unknown; label?: unknown }
            currentValue = String(obj.value)
            currentLabel = obj.label !== undefined ? String(obj.label) : currentValue
            if (currentLabel.startsWith('*')) {
              defaultValue = currentValue
              currentLabel = currentLabel.substring(1)
              isDefault = true
            }
          } else {
            currentValue = String(opt)
            currentLabel = currentValue
            if (currentLabel.startsWith('*')) {
              defaultValue = currentValue.substring(1)
              currentValue = defaultValue
              currentLabel = defaultValue
              isDefault = true
            }
          }

          return { value: currentValue, label: currentLabel, isDefault }
        })
        .filter((opt): opt is ParsedRadioOption => opt !== null)

      // Fallback: if element.value is a simple string matching an option, use it as default
      if (defaultValue === null && element.value && typeof element.value === 'string') {
        let isValueSimpleString = true
        try {
          if (Array.isArray(JSON.parse(element.value))) isValueSimpleString = false
        } catch {
          // not JSON, that's fine
        }
        if (isValueSimpleString) {
          const directMatch = options.find((opt) => opt.value === element.value)
          if (directMatch) defaultValue = directMatch.value
        }
      }
    }
  } catch (e) {
    console.error('Failed to parse radio options:', element.name, e)
  }

  // Default to first option if nothing marked
  if (defaultValue === null && options.length > 0) {
    defaultValue = options[0].value
  }

  return { options, defaultValue }
}

function renderRadioElement(
  wrapper: HTMLDivElement,
  element: UIElement,
  adjustedColor: string | null,
): void {
  wrapper.classList.remove('geems-element')
  wrapper.style.borderLeftColor = 'transparent'
  wrapper.style.padding = '0'
  wrapper.style.marginBottom = '0.75rem'

  const label = document.createElement('label')
  label.className = 'geems-label block mb-2'
  label.textContent = element.label || element.name
  if (adjustedColor) label.style.color = adjustedColor
  wrapper.appendChild(label)

  const { options, defaultValue } = parseRadioOptions(element)

  if (options.length > 0) {
    options.forEach((option, idx) => {
      const optionDiv = document.createElement('div')
      optionDiv.className = 'geems-radio-option'

      const input = document.createElement('input')
      input.type = 'radio'
      const inputId = `${element.name}_${idx}`
      input.id = inputId
      input.name = element.name
      input.value = option.value
      input.checked = option.value === defaultValue
      input.dataset.elementType = 'radio'
      if (adjustedColor) input.style.accentColor = adjustedColor

      const optionLabel = document.createElement('label')
      optionLabel.htmlFor = inputId
      optionLabel.textContent = option.label
      optionLabel.className = 'flex-grow cursor-pointer'

      optionDiv.appendChild(input)
      optionDiv.appendChild(optionLabel)
      wrapper.appendChild(optionDiv)
    })
  } else {
    const errorP = document.createElement('p')
    errorP.className = 'text-sm text-red-600'
    errorP.textContent = `Error: No valid options for radio group '${element.name}'.`
    wrapper.appendChild(errorP)
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Renders a JSON UI array from the LLM into the given container.
 *
 * Clears the container first, then creates DOM elements for each UIElement.
 * Hidden fields (notes, subjectId, gemini_facing_analysis, tweet) are not
 * rendered but returned in the RenderResult.
 */
export function renderUI(
  container: HTMLElement,
  uiJsonArray: UIElement[],
): RenderResult {
  const result: RenderResult = {
    notes: '',
    subjectId: '',
    analysis: '',
    tweet: '',
  }

  container.innerHTML = ''

  if (!Array.isArray(uiJsonArray)) {
    // Attempt to extract array from a wrapping object ({ ui: [...] })
    const wrapped = uiJsonArray as unknown as { ui?: UIElement[] }
    if (wrapped && typeof wrapped === 'object' && Array.isArray(wrapped.ui)) {
      uiJsonArray = wrapped.ui
    } else {
      console.error('Invalid UI data: Expected an array.', uiJsonArray)
      const errDiv = document.createElement('div')
      errDiv.className = 'error-message'
      errDiv.textContent = 'Invalid UI data format from API.'
      container.appendChild(errDiv)
      return result
    }
  }

  for (let index = 0; index < uiJsonArray.length; index++) {
    const element = uiJsonArray[index]

    // ---- Extract hidden fields without rendering them ----
    // LLMs may use semantic names as either `type` or `name`, so check both.

    const elType = element.type
    const elName = element.name || ''

    // gemini_facing_analysis — always hidden
    if (elType === 'gemini_facing_analysis' || elName.includes('gemini_facing_analysis')) {
      result.analysis = element.text || element.value || ''
      continue
    }
    // tweet — always hidden
    if (elType === 'tweet' || elName.includes('tweet')) {
      result.tweet = element.text || element.value || ''
      continue
    }
    // notes — always hidden (unless it's an editable textfield)
    if ((elType === 'notes' || elName.includes('notes')) && elType !== 'textfield' && elType !== 'text_input') {
      result.notes = element.value || ''
      continue
    }
    // subjectId — always hidden
    if (elType === 'subjectId' || elName === 'subjectId') {
      result.subjectId = element.value || ''
      continue
    }
    // hidden elements
    if (elType === 'hidden') {
      if (elName === 'notes' || elName.includes('notes')) result.notes = element.value || ''
      else if (elName === 'subjectId') result.subjectId = element.value || ''
      continue
    }

    // ---- Render visible elements ----

    const wrapper = document.createElement('div')
    wrapper.className = 'geems-element'
    if (element.voice) wrapper.classList.add(`voice-${element.voice}`)

    let adjustedColor: string | null = null
    if (element.color && isValidHexColor(element.color)) {
      adjustedColor = adjustColorForContrast(element.color)
      wrapper.style.borderLeftColor = adjustedColor
    } else {
      wrapper.style.borderLeftColor = 'transparent'
    }

    try {
      switch (element.type) {
        case 'image':
          renderImageElement(wrapper, element, adjustedColor)
          break
        case 'text':
        case 'narrative':
        case 'header':
          renderTextElement(wrapper, element, adjustedColor)
          break
        case 'textfield':
        case 'text_input':
          renderTextFieldElement(wrapper, element, adjustedColor)
          break
        case 'checkbox':
          renderCheckboxElement(wrapper, element, adjustedColor)
          break
        case 'slider':
          renderSliderElement(wrapper, element, adjustedColor)
          break
        case 'radio':
        case 'radio_group':
          renderRadioElement(wrapper, element, adjustedColor)
          break
        default:
          // LLMs invent types like "probe", "player_facing_analysis", "divine_wisdom".
          // If it has text/value content, render as text. Otherwise skip silently.
          if (element.text || element.value) {
            renderTextElement(wrapper, element, adjustedColor)
          } else {
            continue
          }
      }

      container.appendChild(wrapper)
    } catch (renderError) {
      console.error(
        `Error rendering element ${index} (type: ${element.type}, name: ${element.name}):`,
        renderError,
        element,
      )
      const errorWrapper = document.createElement('div')
      errorWrapper.className = 'geems-element error-message'
      errorWrapper.textContent = `Error rendering element: ${element.name || element.type}. Check console.`
      container.appendChild(errorWrapper)
    }
  }

  return result
}

/**
 * Collects values from all interactive input elements within the container
 * and returns a JSON string of the form `{ name: value, ..., turn: N }`.
 */
export function collectInputState(container: HTMLElement, turnNumber: number): string {
  const inputs: Record<string, string | number | boolean> = {}

  container.querySelectorAll<HTMLElement>('[data-element-type]').forEach((el) => {
    const inputEl = el as HTMLInputElement | HTMLTextAreaElement
    const name = inputEl.name
    if (!name) return

    const type = inputEl.dataset.elementType
    switch (type) {
      case 'textfield':
        inputs[name] = inputEl.value
        break
      case 'checkbox':
        inputs[name] = (inputEl as HTMLInputElement).checked
        break
      case 'slider':
        inputs[name] = parseFloat(inputEl.value)
        break
      case 'radio':
        if ((inputEl as HTMLInputElement).checked) {
          inputs[name] = inputEl.value
        }
        break
    }
  })

  inputs['turn'] = turnNumber

  return JSON.stringify(inputs)
}
