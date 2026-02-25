// Fever Dream mode configuration — "Embrace the Chaos"
// Surrealist interactive experience — ride the wave of pure dream logic

import type { GameModeConfig, ThemeConfig } from '../mode-registry.ts'

// Shifting psychedelic palette — dark bg, neon accents, saturated colors
const feverDreamTheme: ThemeConfig = {
  bgPrimary: '#0d0d1a',       // void black-blue
  bgSecondary: '#1a0d2e',     // deep purple-black
  textPrimary: '#f0e6ff',     // pale dreamglow
  accentPrimary: '#ff6ec7',   // hot neon pink
  accentSecondary: '#00f5d4', // electric cyan
  fontHeading: '"Righteous", sans-serif',
  fontBody: '"Space Grotesk", sans-serif',
}

export const feverDreamConfig: GameModeConfig = {
  id: 'fever-dream',
  name: 'Fever Dream',
  description:
    'Ride the wave of pure surrealist chaos. There are no rules. There is no logic. There is only the dream.',
  minPlayers: 1,
  maxPlayers: 1,
  turnTimer: 0,
  tier: 'free',
  rated: 'pg',
  theme: feverDreamTheme,
  hasOrchestrator: false,
}
