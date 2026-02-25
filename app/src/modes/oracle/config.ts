// Oracle mode configuration — "It Already Knows"
// Predictive psychological profiling through seemingly trivial choices

import type { GameModeConfig, ThemeConfig } from '../mode-registry.ts'

// Mystical purple/gold palette — deep indigo bg, gold accents, soft lavender text
const oracleTheme: ThemeConfig = {
  bgPrimary: '#0f0a2e',       // deep indigo
  bgSecondary: '#1a1040',     // midnight purple
  textPrimary: '#e8dff5',     // soft lavender
  accentPrimary: '#d4a017',   // burnished gold
  accentSecondary: '#7c3aed', // mystic violet
  fontHeading: '"Cinzel Decorative", serif',
  fontBody: '"Cormorant Garamond", serif',
}

export const oracleConfig: GameModeConfig = {
  id: 'oracle',
  name: 'The Oracle',
  description:
    'The AI claims to know your future. Make choices. Watch the prophecy unfold. How does it know?',
  minPlayers: 1,
  maxPlayers: 1,
  turnTimer: 0,
  tier: 'free',
  rated: 'pg',
  theme: oracleTheme,
  hasOrchestrator: false,
}
