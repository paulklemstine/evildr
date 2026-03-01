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
    liveAnalysis?: string,
    turnNumber?: number,
  ): string
  /** Return the notes template for this mode (used by the dedicated notes LLM call). */
  getNotesTemplate?(): string
  /** Return the persona label for notes (e.g. "The Devil's Ledger", "Patient Dossier"). */
  getNotesPersonaLabel?(): string
}

export interface GameMode extends GameModeConfig {
  promptBuilder: PromptBuilder
}

// Import mode configs and prompt builders
import { cyoaConfig } from './cyoa/config.ts'
import { createCYOAPromptBuilder } from './cyoa/prompts.ts'
import { geemsConfig } from './geems/config.ts'
import { createGEEMSPromptBuilder } from './geems/prompts.ts'
import { drevilConfig } from './drevil/config.ts'
import { createDrEvilPromptBuilder } from './drevil/prompts.ts'
import { oracleConfig } from './oracle/config.ts'
import { createOraclePromptBuilder } from './oracle/prompts.ts'
import { skinwalkerConfig } from './skinwalker/config.ts'
import { createSkinwalkerPromptBuilder } from './skinwalker/prompts.ts'
import { feverDreamConfig } from './fever-dream/config.ts'
import { createFeverDreamPromptBuilder } from './fever-dream/prompts.ts'
import { devilConfig } from './devil/config.ts'
import { createDevilPromptBuilder } from './devil/prompts.ts'
// Flagged (multiplayer) — config registered with no-op prompt builder.
// The actual FlaggedPromptBuilder (different interface) is used by MultiplayerGameLoop directly.
import { flaggedConfig } from './flagged/config.ts'

// Build the full registry with default prompt builders attached
const registry: GameMode[] = [
  {
    ...drevilConfig,
    promptBuilder: createDrEvilPromptBuilder(false),
  },
  {
    ...geemsConfig,
    promptBuilder: createGEEMSPromptBuilder(false),
  },
  {
    ...cyoaConfig,
    promptBuilder: createCYOAPromptBuilder('Fantasy'),
  },
  {
    ...oracleConfig,
    promptBuilder: createOraclePromptBuilder(),
  },
  {
    ...skinwalkerConfig,
    promptBuilder: createSkinwalkerPromptBuilder(),
  },
  {
    ...feverDreamConfig,
    promptBuilder: createFeverDreamPromptBuilder(),
  },
  {
    ...devilConfig,
    promptBuilder: createDevilPromptBuilder(false),
  },
  {
    ...flaggedConfig,
    // No-op stub: FlaggedPromptBuilder has a different interface (orchestrator-aware).
    // The real prompt builder is consumed by MultiplayerGameLoop, not the registry.
    promptBuilder: { buildFirstTurnPrompt: () => '', buildTurnPrompt: () => '' },
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
