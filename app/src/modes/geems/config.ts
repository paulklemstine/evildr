// GEEMS mode configuration

import type { GameModeConfig, ThemeConfig } from '../mode-registry.ts'

// Light wellness palette — clean, bright, trustworthy, inviting
const geemsTheme: ThemeConfig = {
  bgPrimary: '#ffffff',        // clean white
  bgSecondary: '#f0fdfa',      // whisper of teal
  textPrimary: '#1e293b',      // dark slate
  accentPrimary: '#0d9488',    // teal (gemini voice)
  accentSecondary: '#f59e0b',  // amber (warmth/reward)
  fontHeading: '"Quicksand", sans-serif',
  fontBody: '"Inter", sans-serif',
}

export const geemsConfig: GameModeConfig = {
  id: 'geems',
  name: 'GEEMS',
  description:
    'Guided Extreme Emotional Mental States — A psychological journey disguised as wellness',
  minPlayers: 1,
  maxPlayers: 1,
  turnTimer: 120,
  tier: 'player',
  rated: 'pg',
  theme: geemsTheme,
  hasOrchestrator: false,
}
