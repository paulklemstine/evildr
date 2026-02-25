// Dr. Evil mode configuration — the original dark Dr. Evil persona

import type { GameModeConfig, ThemeConfig } from '../mode-registry.ts'

// The "Clinical Menace" palette — cold greens, bruise purples, blood reds
const drevilTheme: ThemeConfig = {
  bgPrimary: '#0a0f0a',       // near-black green
  bgSecondary: '#1a1f1a',     // dark olive
  textPrimary: '#c8d6c0',     // sickly pale green
  accentPrimary: '#39ff14',   // toxic neon green (Dr. Evil's voice)
  accentSecondary: '#ff2d55',  // clinical red (danger/arousal)
  fontHeading: '"Creepster", cursive',
  fontBody: '"Source Code Pro", monospace',
}

export const drevilConfig: GameModeConfig = {
  id: 'drevil',
  name: 'Dr. Evil',
  description:
    'The original Dr. Evil experience. Mad scientist. Evil psychologist. FBI-style profiler. You are the subject.',
  minPlayers: 1,
  maxPlayers: 1,
  turnTimer: 120,
  tier: 'player',
  rated: 'r',
  theme: drevilTheme,
  hasOrchestrator: false,
}
