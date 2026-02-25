// Skinwalker mode configuration — "Something Is Wrong"
// Psychological horror through subtle environmental inconsistencies

import type { GameModeConfig, ThemeConfig } from '../mode-registry.ts'

// Unsettling desaturated palette — off-white bg, muted colors, sickly green accents
const skinwalkerTheme: ThemeConfig = {
  bgPrimary: '#f2f0ec',       // off-white (slightly warm, like old paper)
  bgSecondary: '#e8e4dd',     // warmer off-white
  textPrimary: '#3a3a38',     // charcoal (not pure black — slightly off)
  accentPrimary: '#7a9e7e',   // sickly muted green
  accentSecondary: '#b8a88a', // dusty beige
  fontHeading: '"DM Serif Text", serif',
  fontBody: '"IBM Plex Sans", sans-serif',
}

export const skinwalkerConfig: GameModeConfig = {
  id: 'skinwalker',
  name: 'Skinwalker',
  description:
    'Something is wrong. An ordinary day. Ordinary people. But if you look closely... nothing is what it seems.',
  minPlayers: 1,
  maxPlayers: 1,
  turnTimer: 90,
  tier: 'free',
  rated: 'r',
  theme: skinwalkerTheme,
  hasOrchestrator: false,
}
