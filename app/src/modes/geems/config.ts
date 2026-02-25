// GEEMS mode configuration

import type { GameModeConfig, ThemeConfig } from '../mode-registry.ts'

// The "False Security" palette — warm teal and amber that feels safe but isn't
const geemsTheme: ThemeConfig = {
  bgPrimary: '#0f1a1c',       // deep teal-black
  bgSecondary: '#1a2e30',     // muted dark teal
  textPrimary: '#fef3c7',     // warm cream
  accentPrimary: '#14b8a6',   // teal (gemini voice)
  accentSecondary: '#f59e0b', // amber (warmth)
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
