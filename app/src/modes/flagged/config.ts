// Flagged mode configuration — AI-orchestrated blind dating simulation

import type { GameModeConfig, ThemeConfig } from '../mode-registry.ts'

const flaggedTheme: ThemeConfig = {
  bgPrimary: '#1a0a14',       // deep rose-black
  bgSecondary: '#2d1525',     // muted dark rose
  textPrimary: '#fff1f2',     // rose-white
  accentPrimary: '#fb7185',   // soft pink-rose
  accentSecondary: '#e11d48', // vivid rose
  fontHeading: '"Playfair Display", serif',
  fontBody: '"Nunito", sans-serif',
}

export const flaggedConfig: GameModeConfig = {
  id: 'flagged',
  name: 'Flagged',
  description: 'AI-orchestrated blind dating simulation for two players',
  minPlayers: 2,
  maxPlayers: 2,
  turnTimer: 90,
  tier: 'player',
  rated: 'pg',
  theme: flaggedTheme,
  hasOrchestrator: true,
}
