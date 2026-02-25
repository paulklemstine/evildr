// Flagged prompt builder — stub for AI-orchestrated blind dating mode
//
// TODO: Full implementation requires the orchestrator pattern from the
// evildrgemini repo. The orchestrator manages two separate AI conversations
// (one per player) plus a third "matchmaker" AI that sees both sides and
// steers the scenario. That architecture is significantly more complex than
// single-player modes and will be ported in a dedicated pass.

import type { PromptBuilder } from '../mode-registry.ts'

/**
 * Creates a stub PromptBuilder for Flagged mode.
 * Currently returns placeholder prompts. The real implementation needs:
 * - Separate prompt streams for Player A and Player B
 * - An orchestrator/matchmaker prompt that receives both players' actions
 * - Turn synchronization between two players
 * - Persona generation for each player's "date"
 */
export function createFlaggedPromptBuilder(): PromptBuilder {
  return {
    buildFirstTurnPrompt(): string {
      return `// FLAGGED - BLIND DATE SIMULATION - STUB
// This is a placeholder. The full Flagged mode requires the orchestrator
// pattern (separate AI conversations per player + matchmaker AI).
//
// For now, return a welcome screen explaining the mode concept.
//
// Return a valid JSON array with:
// 1. image — a romantic/mysterious scene
// 2. narrative — explain that two players are being matched
// 3. notes — hidden state for matchmaking parameters
// 4. radio — initial personality/preference questions

You are the matchmaker AI for a blind dating simulation.
Welcome the player and ask them a few personality questions to build their dating profile.
Return a valid JSON array of UI elements.`
    },

    buildTurnPrompt(
      playerActions: string,
      history: Array<{ ui: string; actions: string }>,
      notes: string,
    ): string {
      const historyBlock = history
        .map(
          (h, i) =>
            `--- Turn ${i + 1} ---\nUI: ${h.ui}\nPlayer: ${h.actions}`,
        )
        .join('\n\n')

      return `// FLAGGED - BLIND DATE SIMULATION - STUB
// Placeholder turn prompt. See TODO above.

### NOTES ###
${notes || '(none)'}

### HISTORY ###
${historyBlock || '(none)'}

### PLAYER INPUT ###
${playerActions}

Continue the blind dating simulation based on the player's responses.
Return a valid JSON array of UI elements.`
    },
  }
}
