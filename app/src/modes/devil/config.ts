// Deal With the Devil mode configuration — Faustian bargains and moral corruption

import type { GameModeConfig, ThemeConfig } from '../mode-registry.ts'

// "Infernal Contract" palette — deep reds, burnt gold, smoldering black
const devilTheme: ThemeConfig = {
  bgPrimary: '#0d0506',       // near-black charred
  bgSecondary: '#1a0a0c',     // dark blood
  textPrimary: '#e8d5c4',     // parchment ivory
  accentPrimary: '#c9a227',   // hellfire gold (the Devil's voice)
  accentSecondary: '#b91c1c', // infernal red (corruption/temptation)
  fontHeading: '"Cinzel Decorative", serif',
  fontBody: '"Crimson Text", serif',
}

export const devilConfig: GameModeConfig = {
  id: 'devil',
  name: 'Deal With the Devil',
  description:
    'A silver-tongued Devil offers you everything you desire — for a price. Every deal corrupts. Every refusal costs. How much of your soul remains?',
  minPlayers: 1,
  maxPlayers: 1,
  turnTimer: 120,
  tier: 'player',
  rated: 'r',
  theme: devilTheme,
  hasOrchestrator: false,
}
