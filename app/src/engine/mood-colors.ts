// Dynamic mood-based interface coloring
// Reads the dominant color from the current turn's UI elements and shifts
// the entire interface to match the emotional manipulation target.

import type { UIElement } from './renderer'

/** Map of hex colors to mood class names (from the Color Manipulation Protocol). */
const COLOR_TO_MOOD: Record<string, string> = {
  '#2a9d8f': 'mood-trust',
  '#0d9488': 'mood-trust',
  '#e9c46a': 'mood-reward',
  '#d97706': 'mood-reward',
  '#f4c2c2': 'mood-vulnerability',
  '#db2777': 'mood-vulnerability',
  '#b5e48c': 'mood-safety',
  '#059669': 'mood-safety',
  '#f4a261': 'mood-excitement',
  '#ea580c': 'mood-excitement',
  '#e63946': 'mood-urgency',
  '#dc2626': 'mood-urgency',
  '#9b5de5': 'mood-mystery',
  '#7c3aed': 'mood-mystery',
  '#264653': 'mood-gravity',
  '#1e3a5f': 'mood-gravity',
}

const ALL_MOOD_CLASSES = [
  'mood-trust', 'mood-reward', 'mood-vulnerability', 'mood-safety',
  'mood-excitement', 'mood-urgency', 'mood-mystery', 'mood-gravity',
]

/**
 * Analyze the UI elements from a turn and apply the dominant emotional
 * color theme to the entire page interface.
 */
export function applyMoodFromUI(uiElements: UIElement[]): void {
  // Count color occurrences across all visible elements
  const moodCounts: Record<string, number> = {}

  for (const el of uiElements) {
    if (!el.color || el.type === 'hidden') continue
    const hex = el.color.toLowerCase()

    // Try exact match first, then fuzzy by hue
    const mood = COLOR_TO_MOOD[hex] ?? findClosestMood(hex)

    if (mood) {
      moodCounts[mood] = (moodCounts[mood] || 0) + 1
    }
  }

  // Find the dominant mood (most frequently used color family)
  let dominantMood = ''
  let maxCount = 0
  for (const [mood, count] of Object.entries(moodCounts)) {
    if (count > maxCount) {
      maxCount = count
      dominantMood = mood
    }
  }

  // Apply to body
  ALL_MOOD_CLASSES.forEach(cls => document.body.classList.remove(cls))
  if (dominantMood) {
    document.body.classList.add(dominantMood)
  }
}

/**
 * Find the closest mood by comparing hue of the given hex color
 * to the known color-to-mood mapping.
 */
function findClosestMood(hex: string): string | null {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return null

  const targetHue = hexToHue(hex)
  if (targetHue < 0) return null

  // Map hue ranges to moods
  // Red: 0-15, 345-360 → urgency
  // Orange: 15-45 → excitement
  // Yellow/Gold: 45-65 → reward
  // Green: 65-170 → safety/trust
  // Teal: 170-200 → trust
  // Blue/Navy: 200-260 → gravity
  // Purple: 260-310 → mystery
  // Pink: 310-345 → vulnerability

  if (targetHue >= 345 || targetHue < 15) return 'mood-urgency'
  if (targetHue < 45) return 'mood-excitement'
  if (targetHue < 65) return 'mood-reward'
  if (targetHue < 170) return 'mood-safety'
  if (targetHue < 200) return 'mood-trust'
  if (targetHue < 260) return 'mood-gravity'
  if (targetHue < 310) return 'mood-mystery'
  return 'mood-vulnerability'
}

function hexToHue(hex: string): number {
  const r = parseInt(hex.substring(1, 3), 16) / 255
  const g = parseInt(hex.substring(3, 5), 16) / 255
  const b = parseInt(hex.substring(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)

  if (max === min) return -1 // achromatic (gray/black/white)

  const d = max - min
  let h = 0

  switch (max) {
    case r: h = (g - b) / d + (g < b ? 6 : 0); break
    case g: h = (b - r) / d + 2; break
    case b: h = (r - g) / d + 4; break
  }

  return (h / 6) * 360
}
