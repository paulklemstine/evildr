// Flagged mode configuration — AI-orchestrated blind dating simulation
// Two players meet on a blind date. The AI matchmaker (Dr. Gemini) secretly
// profiles them both, generating green flags and red flags visible only to
// the other player.

import type { GameModeConfig, ThemeConfig } from '../mode-registry.ts'

// "Candlelit Velvet" palette — dark warm backgrounds, rose gold accents,
// soft pink highlights. Romantic drama meets noir.
const flaggedTheme: ThemeConfig = {
  bgPrimary: '#1a0a14',        // deep wine-black (candlelit room)
  bgSecondary: '#2d1525',      // muted damask rose
  textPrimary: '#fff1f2',      // rose-white (warm, not clinical)
  accentPrimary: '#f9a8d4',    // rose gold (connection, chemistry)
  accentSecondary: '#e11d48',   // vivid crimson (passion, danger)
  fontHeading: '"Playfair Display", serif',
  fontBody: '"Nunito", sans-serif',
}

export const flaggedConfig: GameModeConfig = {
  id: 'flagged',
  name: 'Blind Date',
  description:
    'Two players. One AI matchmaker. Explore a blind date scenario while the AI secretly profiles you both. See green flags and red flags about your date in real-time.',
  minPlayers: 2,
  maxPlayers: 2,
  turnTimer: 120,
  tier: 'free',
  rated: 'r',
  theme: flaggedTheme,
  hasOrchestrator: true,
}
