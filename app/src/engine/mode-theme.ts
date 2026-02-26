// Mode theme application — maps a mode's ThemeConfig to CSS custom properties
// so each game mode gets its distinct visual identity at runtime.

import type { ThemeConfig } from '../modes/mode-registry'

/**
 * Parse a hex color string (#rrggbb) into [r, g, b] (0-255).
 */
function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

/**
 * Convert RGB (0-255) to a hex string.
 */
function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  return '#' + [clamp(r), clamp(g), clamp(b)].map(v => v.toString(16).padStart(2, '0')).join('')
}

/**
 * Lighten or darken a hex color by a factor (-1 to 1).
 * Positive = lighter, negative = darker.
 */
function adjustBrightness(hex: string, factor: number): string {
  const [r, g, b] = hexToRgb(hex)
  if (factor > 0) {
    // Lighten: blend toward white
    return rgbToHex(
      r + (255 - r) * factor,
      g + (255 - g) * factor,
      b + (255 - b) * factor,
    )
  } else {
    // Darken: blend toward black
    const f = 1 + factor
    return rgbToHex(r * f, g * f, b * f)
  }
}

/**
 * Mix two hex colors by a ratio (0 = first color, 1 = second color).
 */
function mixColors(hex1: string, hex2: string, ratio: number): string {
  const [r1, g1, b1] = hexToRgb(hex1)
  const [r2, g2, b2] = hexToRgb(hex2)
  return rgbToHex(
    r1 + (r2 - r1) * ratio,
    g1 + (g2 - g1) * ratio,
    b1 + (b2 - b1) * ratio,
  )
}

/**
 * Determine relative luminance (0 = black, 1 = white) of a hex color.
 */
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(c => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Returns true if the background is dark (luminance < 0.2).
 */
function isDarkBackground(bgHex: string): boolean {
  return luminance(bgHex) < 0.2
}

/**
 * Apply a mode's ThemeConfig as CSS custom properties on the document root.
 * Derives secondary/tertiary/muted colors from the base theme values so the
 * full CSS variable set is populated.
 */
export function applyModeTheme(theme: ThemeConfig): void {
  const root = document.documentElement
  const dark = isDarkBackground(theme.bgPrimary)

  // Core colors from the ThemeConfig
  root.style.setProperty('--bg-primary', theme.bgPrimary)
  root.style.setProperty('--bg-secondary', theme.bgSecondary)
  root.style.setProperty('--text-primary', theme.textPrimary)
  root.style.setProperty('--accent-primary', theme.accentPrimary)
  root.style.setProperty('--accent-secondary', theme.accentSecondary)
  root.style.setProperty('--font-heading', theme.fontHeading)
  root.style.setProperty('--font-body', theme.fontBody)

  // Derived colors — tertiary bg, input bg, text variants, borders, shadows
  const bgTertiary = dark
    ? adjustBrightness(theme.bgSecondary, 0.15)
    : adjustBrightness(theme.bgSecondary, -0.05)
  root.style.setProperty('--bg-tertiary', bgTertiary)
  root.style.setProperty('--bg-input', dark ? theme.bgSecondary : theme.bgPrimary)

  // Text heading: slightly brighter/bolder version of text primary
  const textHeading = dark
    ? adjustBrightness(theme.textPrimary, 0.1)
    : adjustBrightness(theme.textPrimary, -0.2)
  root.style.setProperty('--text-heading', textHeading)

  // Text secondary: between primary and muted
  const textSecondary = dark
    ? adjustBrightness(theme.textPrimary, -0.25)
    : adjustBrightness(theme.textPrimary, 0.3)
  root.style.setProperty('--text-secondary', textSecondary)

  // Text muted: blend text primary toward background
  const textMuted = mixColors(theme.textPrimary, theme.bgPrimary, 0.55)
  root.style.setProperty('--text-muted', textMuted)

  // Accent tertiary: blend the two accents
  const accentTertiary = mixColors(theme.accentPrimary, theme.accentSecondary, 0.5)
  root.style.setProperty('--accent-tertiary', accentTertiary)

  // Borders
  const borderColor = dark
    ? adjustBrightness(theme.bgSecondary, 0.2)
    : adjustBrightness(theme.bgSecondary, -0.1)
  root.style.setProperty('--border-color', borderColor)
  root.style.setProperty('--border-accent', theme.accentPrimary)

  // Shadows — stronger for dark themes
  if (dark) {
    root.style.setProperty('--card-shadow', '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)')
    root.style.setProperty('--card-shadow-hover', '0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3)')
  } else {
    root.style.setProperty('--card-shadow', '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)')
    root.style.setProperty('--card-shadow-hover', '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)')
  }

  // Slider and toggle match accent
  root.style.setProperty('--slider-thumb-color', theme.accentPrimary)
  root.style.setProperty('--toggle-hover-color', theme.accentPrimary)
}

/**
 * Remove all mode-specific CSS custom properties from the document root,
 * reverting to the stylesheet defaults (light/dark mode).
 */
export function clearModeTheme(): void {
  const root = document.documentElement
  const props = [
    '--bg-primary', '--bg-secondary', '--bg-tertiary', '--bg-input',
    '--text-primary', '--text-secondary', '--text-heading', '--text-muted',
    '--accent-primary', '--accent-secondary', '--accent-tertiary',
    '--border-color', '--border-accent',
    '--card-shadow', '--card-shadow-hover',
    '--font-heading', '--font-body',
    '--slider-thumb-color', '--toggle-hover-color',
  ]
  for (const prop of props) {
    root.style.removeProperty(prop)
  }
}
