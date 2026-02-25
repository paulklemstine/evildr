// CYOA (Choose Your Own Adventure) mode configuration

import type { GameModeConfig, ThemeConfig } from '../mode-registry.ts'

const cyoaTheme: ThemeConfig = {
  bgPrimary: '#1a0a2e',       // deep indigo
  bgSecondary: '#2d1b4e',     // muted purple
  textPrimary: '#f5f0ff',     // soft lavender white
  accentPrimary: '#d4a017',   // burnished gold
  accentSecondary: '#8b5cf6', // violet
  fontHeading: '"Cinzel", serif',
  fontBody: '"Lora", serif',
}

export const cyoaConfig: GameModeConfig = {
  id: 'cyoa',
  name: 'Choose Your Own Adventure',
  description: 'Classic branching narratives. Pick a genre and let the AI guide your story.',
  minPlayers: 1,
  maxPlayers: 1,
  turnTimer: 0,
  tier: 'free',
  rated: 'pg',
  theme: cyoaTheme,
  hasOrchestrator: false,
}
