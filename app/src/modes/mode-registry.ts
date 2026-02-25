// Mode registry — central catalog of all game modes

export interface ThemeConfig {
  bgPrimary: string
  bgSecondary: string
  textPrimary: string
  accentPrimary: string
  accentSecondary: string
  fontHeading: string
  fontBody: string
}

export interface GameModeConfig {
  id: string
  name: string
  description: string
  minPlayers: number
  maxPlayers: number
  turnTimer: number        // seconds, 0 = untimed
  tier: 'free' | 'player' | 'pro'
  rated: 'pg' | 'r'
  theme: ThemeConfig
  hasOrchestrator: boolean // for multiplayer modes
}

export interface PromptBuilder {
  buildFirstTurnPrompt(): string
  buildTurnPrompt(
    playerActions: string,
    history: Array<{ ui: string; actions: string }>,
    notes: string,
  ): string
}

export interface GameMode extends GameModeConfig {
  promptBuilder: PromptBuilder
}

// Import mode configs and prompt builders
import { cyoaConfig } from './cyoa/config.ts'
import { createCYOAPromptBuilder } from './cyoa/prompts.ts'
import { geemsConfig } from './geems/config.ts'
import { createGEEMSPromptBuilder } from './geems/prompts.ts'
// Flagged (multiplayer) — removed for now, planned for future expansion
// import { flaggedConfig } from './flagged/config.ts'
// import { createFlaggedPromptBuilder } from './flagged/prompts.ts'

// Build the full registry with default prompt builders attached
const registry: GameMode[] = [
  {
    ...cyoaConfig,
    promptBuilder: createCYOAPromptBuilder('Fantasy'),
  },
  {
    ...geemsConfig,
    promptBuilder: createGEEMSPromptBuilder(false),
  },
]

/**
 * Returns all registered game modes.
 */
export function getModes(): GameMode[] {
  return [...registry]
}

/**
 * Returns a single game mode by its id, or undefined if not found.
 */
export function getMode(id: string): GameMode | undefined {
  return registry.find((m) => m.id === id)
}
