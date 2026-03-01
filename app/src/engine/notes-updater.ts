// ============================================================================
// notes-updater.ts — Dedicated LLM call for updating session notes
// ============================================================================
//
// Separates notes generation from UI rendering so the player sees UI
// immediately while notes update asynchronously in the background.

import type { UIElement } from './renderer.ts'
import type { LLMClient } from './game-loop.ts'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_NOTES_CHARS = 5000

// ---------------------------------------------------------------------------
// compressNotes — shared by game-loop and multiplayer-loop
// ---------------------------------------------------------------------------

/**
 * Compress notes that exceed MAX_NOTES_CHARS by keeping the most
 * recent and structurally important sections. Preserves the header,
 * anchor facts, priority callbacks, arc tracking, and any sections
 * marked with PRESERVE THROUGH COMPRESSION.
 */
export function compressNotes(notes: string): string {
  if (!notes || notes.length <= MAX_NOTES_CHARS) return notes

  // Extract all preserved sections — anchor facts, priority callbacks, arc tracking,
  // and any section marked "PRESERVE THROUGH COMPRESSION"
  const preservePatterns = [
    /### (?:ANCHOR FACTS|Player's Exact Words)[^\n]*\n[\s\S]*?(?=\n###|\n\*\*[A-Z]|$)/i,
    /### (?:Priority Callbacks)[^\n]*\n[\s\S]*?(?=\n###|\n\*\*[A-Z]|$)/i,
    /### (?:ARC TRACKING)[^\n]*\n[\s\S]*?(?=\n###|\n\*\*[A-Z]|$)/i,
    /### (?:PRESERVE THROUGH COMPRESSION)[^\n]*\n[\s\S]*?(?=\n###|\n\*\*[A-Z]|$)/gi,
  ]

  const preserved: string[] = []
  for (const pat of preservePatterns) {
    const matches = notes.match(pat)
    if (matches) {
      for (const m of Array.isArray(matches) ? matches : [matches]) {
        const trimmed = m.trim()
        if (trimmed.length > 0 && trimmed.length <= 800) {
          preserved.push(trimmed)
        }
      }
    }
  }

  const preservedBlock = preserved.join('\n\n')
  const preservedSize = preservedBlock.length

  const headerSize = 800
  const reservedForPreserved = Math.min(preservedSize + 40, 1600)
  const tailSize = MAX_NOTES_CHARS - headerSize - reservedForPreserved - 80
  const header = notes.substring(0, headerSize)
  const tail = notes.substring(notes.length - Math.max(tailSize, 500))

  let compressed = header + '\n[...earlier observations compressed — focus on RECENT state below...]\n'
  if (preservedBlock) {
    compressed += preservedBlock + '\n'
  }
  compressed += tail
  return compressed
}

// ---------------------------------------------------------------------------
// summarizeUI — compact summary of rendered elements for the notes prompt
// ---------------------------------------------------------------------------

/**
 * Build a compact one-line summary of the UI elements shown this turn.
 * Example: "image:scene, text:narrative, slider:trust(0-10), radio:action(4 opts)"
 */
export function summarizeUI(elements: UIElement[]): string {
  return elements
    .filter(el => el.type !== 'hidden')
    .map(el => {
      const base = `${el.type}:${el.name || '?'}`
      if (el.type === 'slider' || el.type === 'meter' || el.type === 'number_input') {
        return `${base}(${el.min ?? 0}-${el.max ?? 10})`
      }
      if (el.type === 'radio' || el.type === 'dropdown' || el.type === 'button_group') {
        const count = Array.isArray(el.options) ? el.options.length : 0
        return `${base}(${count} opts)`
      }
      return base
    })
    .join(', ')
}

// ---------------------------------------------------------------------------
// Notes prompt builder and LLM call
// ---------------------------------------------------------------------------

export interface NotesUpdateConfig {
  llmClient: LLMClient
  notesTemplate: string
  modeName: string
  modePersonaLabel: string
}

export interface NotesUpdateInput {
  previousNotes: string
  playerActions: string
  uiSummary: string
  turnNumber: number
}

/**
 * Build the prompt for the dedicated notes LLM call.
 */
function buildNotesPrompt(config: NotesUpdateConfig, input: NotesUpdateInput): string {
  return `You are the note-keeper for a "${config.modeName}" session.
Your task: update the ${config.modePersonaLabel} based on this turn's events.

### NOTES FORMAT ###
${config.notesTemplate}

### PREVIOUS NOTES ###
${input.previousNotes || '(first turn — initialize from scratch)'}

### TURN ${input.turnNumber} ###

### PLAYER ACTIONS ###
${input.playerActions}

### UI SHOWN (summary) ###
${input.uiSummary}

### INSTRUCTIONS ###
Update the ${config.modePersonaLabel} per the format above. Focus on:
- Behavioral evidence from player actions
- Updated scores and metrics
- Narrative tracking (planted seeds, cliffhangers, active threads)
- Strategic plans for the next turn
- **Priority Callbacks:** If the player made a significant disclosure, emotional statement, or surprising choice in their textfield or actions, add it to a "### Priority Callbacks" section with the exact quote and turn number. These MUST be acknowledged next turn.
- **Behavioral Loop Alert:** If the player has repeated the same avoidance pattern, choice archetype, or engagement level for 3+ consecutive turns, note the pattern and suggest a counter-strategy for the next turn. If 4+ consecutive turns with the same archetype OR 0 selections of any archetype over 8+ turns, set **MANDATORY_LOOP_BREAK: true** — next turn MUST force the neglected archetype as the only strategic path.
- **Anchor Facts:** Preserve any verbatim player textfield quotes that are diagnostically significant in a "### Anchor Facts" section. These exact words must survive compression — NEVER summarize them.
- **Peak Counter:** Track the current turn intensity (peak/valley/rise) and maintain "Consecutive Peaks: N" (count of peak/rise turns since last valley). Reset to 0 after each valley turn.
- Max ${MAX_NOTES_CHARS} characters.

Output ONLY the updated notes as plain text. No JSON. No code fences. No commentary.`
}

/**
 * Fire a dedicated LLM call to update session notes.
 * Returns updated notes on success, or the previous notes on failure.
 */
export async function updateNotes(
  config: NotesUpdateConfig,
  input: NotesUpdateInput,
): Promise<string> {
  const prompt = buildNotesPrompt(config, input)

  try {
    const response = await config.llmClient.generateTurn(prompt)
    let notes = response.content.trim()

    // Strip code fences if the LLM wraps the output
    const fenceMatch = notes.match(/```(?:\w+)?\s*([\s\S]*?)\s*```/)
    if (fenceMatch?.[1]) {
      notes = fenceMatch[1].trim()
    }

    if (notes.length > 0) {
      console.log(`Notes updated (${notes.length} chars, turn ${input.turnNumber})`)
      return compressNotes(notes)
    }
  } catch (err) {
    console.warn('Notes update failed (using previous notes):', err)
  }

  // Fallback: return previous notes unchanged
  return input.previousNotes
}
