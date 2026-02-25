// ============================================================================
// auto-save.ts - Simple localStorage persistence for game state
// ============================================================================

import type { GameState } from './game-loop.ts'

/**
 * Persist the given game state to localStorage under the given key.
 *
 * Storage key convention: `drevil-{mode}-state`
 *
 * Silently swallows errors (e.g. quota exceeded, private browsing).
 */
export function saveGameState(key: string, state: GameState): void {
  try {
    const serialised = JSON.stringify(state)
    localStorage.setItem(key, serialised)
  } catch (error) {
    console.error('auto-save: Failed to save game state.', error)
  }
}

/**
 * Load a previously saved GameState from localStorage.
 *
 * Returns `null` when:
 *  - No entry exists for the key
 *  - The stored value cannot be parsed
 *  - localStorage is unavailable
 */
export function loadGameState(key: string): GameState | null {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return null

    const parsed: unknown = JSON.parse(raw)

    // Minimal structural validation
    if (
      parsed &&
      typeof parsed === 'object' &&
      'historyQueue' in parsed &&
      'turnNumber' in parsed
    ) {
      return parsed as GameState
    }

    console.warn('auto-save: Stored state failed structural validation. Discarding.')
    return null
  } catch (error) {
    console.error('auto-save: Failed to load game state.', error)
    return null
  }
}

/**
 * Remove the stored game state for the given key.
 */
export function clearGameState(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('auto-save: Failed to clear game state.', error)
  }
}
