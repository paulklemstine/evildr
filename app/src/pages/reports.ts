// Reports page — displays individual session reports and combined cross-session profile
// Supports: delete individual sessions, reset all data, regenerate analysis after changes

import { getSessionsByUser, getAnalysesBySession, getAnalysesByUser, getTurnsBySession, deleteSession, deleteAllUserData } from '../profiling/db'
import { buildCombinedAnalysisPrompt, buildAnalysisPrompt } from '../profiling/analysis-prompts'
import { uploadReport } from '../api/report-uploader'
import type { LLMClient } from '../engine/game-loop'

/** State kept across re-renders within the same reports page visit. */
let currentUserId = ''
let currentLlmClient: LLMClient | null = null

/**
 * Renders the reports page into the given container.
 */
export async function renderReportsPage(
  app: HTMLElement,
  userId: string,
  llmClient: LLMClient,
  onBack: () => void,
): Promise<void> {
  currentUserId = userId
  currentLlmClient = llmClient

  app.innerHTML = `
    <header class="site-header">
      <div class="site-header-inner">
        <div class="flex items-center gap-3 cursor-pointer" id="reports-nav-home">
          <div class="flex items-center justify-center rounded-lg"
               style="width: 36px; height: 36px; background: var(--accent-primary); font-size: 22px; line-height: 1;">
            &#x1F9E0;
          </div>
          <div>
            <h1 class="text-lg font-bold" style="color: var(--text-heading); letter-spacing: -0.02em;">
              GEEMS
            </h1>
            <p class="text-xs" style="color: var(--text-muted); margin-top: -2px;">Analysis Reports</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button id="reports-back" class="geems-button-outline">Back to Lobby</button>
          <span class="badge badge-beta">Beta</span>
        </div>
      </div>
    </header>

    <main class="reports-main">
      <div class="reports-container">
        <div class="reports-hero">
          <h2 class="text-2xl font-bold" style="color: var(--text-heading);">Your Analysis Reports</h2>
          <p style="color: var(--text-secondary); margin-top: 0.5rem;">
            Behavioral insights generated from your interactive assessment sessions.
          </p>
        </div>

        <div id="reports-content">
          <div class="reports-loading">
            <svg class="animate-spin" style="color: var(--accent-primary);" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="24" height="24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading reports...</span>
          </div>
        </div>
      </div>
    </main>

    <footer class="site-footer">
      <p>&copy; ${new Date().getFullYear()} raver1975. All rights reserved.</p>
      <p style="margin-top: 0.25rem;">For research and entertainment purposes only.</p>
    </footer>

    <!-- Reset confirmation modal -->
    <div id="resetModal" class="modal">
      <div class="modal-content" style="max-width: 420px;">
        <h2 class="text-lg font-semibold mb-3" style="color: #dc2626;">Reset All Data</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.6;">
          This will permanently delete <strong>all sessions, turns, and analyses</strong>. This action cannot be undone.
        </p>
        <p style="color: var(--text-muted); margin-bottom: 1.5rem; font-size: 0.875rem;">
          Type <strong>RESET</strong> to confirm:
        </p>
        <input type="text" id="resetConfirmInput" class="geems-input" placeholder="Type RESET" style="margin-bottom: 1rem;">
        <div class="flex gap-2">
          <button id="resetConfirmBtn" class="geems-button" style="background: #dc2626; flex: 1;" disabled>Delete Everything</button>
          <button id="resetCancelBtn" class="geems-button-outline" style="flex: 1;">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Delete session confirmation modal -->
    <div id="deleteSessionModal" class="modal">
      <div class="modal-content" style="max-width: 420px;">
        <h2 class="text-lg font-semibold mb-3" style="color: #dc2626;">Delete Session</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.6;">
          This will permanently delete this session and all its associated data (turns and analyses). Continue?
        </p>
        <div class="flex gap-2">
          <button id="deleteSessionConfirmBtn" class="geems-button" style="background: #dc2626; flex: 1;">Delete Session</button>
          <button id="deleteSessionCancelBtn" class="geems-button-outline" style="flex: 1;">Cancel</button>
        </div>
      </div>
    </div>
  `

  // Event listeners
  document.getElementById('reports-back')?.addEventListener('click', onBack)
  document.getElementById('reports-nav-home')?.addEventListener('click', onBack)

  // Reset modal
  setupResetModal()

  // Load data
  await loadReports()
}

function setupResetModal(): void {
  const modal = document.getElementById('resetModal')!
  const input = document.getElementById('resetConfirmInput') as HTMLInputElement
  const confirmBtn = document.getElementById('resetConfirmBtn') as HTMLButtonElement
  const cancelBtn = document.getElementById('resetCancelBtn')!

  input.addEventListener('input', () => {
    confirmBtn.disabled = input.value.trim() !== 'RESET'
  })

  confirmBtn.addEventListener('click', async () => {
    confirmBtn.disabled = true
    confirmBtn.textContent = 'Deleting...'
    try {
      await deleteAllUserData(currentUserId)
      modal.classList.remove('active')
      input.value = ''
      await loadReports()
    } catch (err) {
      confirmBtn.textContent = 'Error — try again'
      confirmBtn.disabled = false
    }
  })

  cancelBtn.addEventListener('click', () => {
    modal.classList.remove('active')
    input.value = ''
    confirmBtn.disabled = true
  })

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active')
      input.value = ''
      confirmBtn.disabled = true
    }
  })
}

function showDeleteSessionModal(_sessionId: string): Promise<boolean> {
  return new Promise((resolve) => {
    const modal = document.getElementById('deleteSessionModal')!
    const confirmBtn = document.getElementById('deleteSessionConfirmBtn')!
    const cancelBtn = document.getElementById('deleteSessionCancelBtn')!

    modal.classList.add('active')

    const cleanup = () => {
      modal.classList.remove('active')
      confirmBtn.replaceWith(confirmBtn.cloneNode(true))
      cancelBtn.replaceWith(cancelBtn.cloneNode(true))
    }

    confirmBtn.addEventListener('click', () => { cleanup(); resolve(true) }, { once: true })
    cancelBtn.addEventListener('click', () => { cleanup(); resolve(false) }, { once: true })
    modal.addEventListener('click', (e) => {
      if (e.target === modal) { cleanup(); resolve(false) }
    }, { once: true })
  })
}

async function loadReports(): Promise<void> {
  const contentEl = document.getElementById('reports-content')!
  const llmClient = currentLlmClient!

  try {
    const sessions = await getSessionsByUser(currentUserId)

    if (sessions.length === 0) {
      contentEl.innerHTML = `
        <div class="reports-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <p style="color: var(--text-muted); margin-top: 1rem;">No sessions yet. Complete an assessment to see your reports.</p>
        </div>
      `
      return
    }

    // Sort sessions by most recent
    sessions.sort((a, b) => b.startedAt - a.startedAt)

    let html = ''

    // Combined report button (if multiple sessions have analyses)
    const allAnalyses = await getAnalysesByUser(currentUserId)
    if (allAnalyses.length > 1) {
      html += `
        <div class="report-card report-card-combined">
          <div class="report-card-header">
            <h3 class="report-card-title">Combined Cross-Session Profile</h3>
            <span class="badge badge-tier">Comprehensive</span>
          </div>
          <p class="report-card-desc">Synthesized insights across all your assessment sessions.</p>
          <button class="geems-button report-generate-combined" style="margin-top: 1rem;">
            Generate Combined Report
          </button>
          <div id="combined-report-content" class="report-body" style="display: none;"></div>
        </div>
      `
    }

    // Individual session cards
    for (const session of sessions) {
      const analyses = await getAnalysesBySession(session.sessionId)
      const turns = await getTurnsBySession(session.sessionId)
      const date = new Date(session.startedAt).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })

      const hasAnalysis = analyses.length > 0
      const latestAnalysis = hasAnalysis ? analyses[analyses.length - 1] : null

      const hasSavedState = (() => {
        try { return !!localStorage.getItem(`drevil-${session.mode}-state`) } catch { return false }
      })()
      const playHash = session.genre
        ? `#play/${session.mode}/${session.genre}`
        : `#play/${session.mode}`

      html += `
        <div class="report-card" data-session-id="${session.sessionId}">
          <div class="report-card-header">
            <h3 class="report-card-title">${session.mode.toUpperCase()} Session</h3>
            <div class="flex gap-1.5 items-center">
              <span class="badge badge-players">${turns.length} turns</span>
              ${session.genre ? `<span class="badge badge-free">${session.genre}</span>` : ''}
              ${hasAnalysis ? '<span class="badge badge-tier">Analyzed</span>' : '<span class="badge badge-rated">Pending</span>'}
            </div>
          </div>
          <p class="report-card-date">${date}</p>
          <div class="flex gap-2 flex-wrap" style="margin-top: 0.75rem;">
            ${hasSavedState ? `
              <a href="${playHash}" class="geems-button report-continue" style="font-size: 0.8125rem; text-decoration: none;">
                Continue Session
              </a>
            ` : `
              <a href="${playHash}" class="geems-button-outline report-continue" style="font-size: 0.8125rem; text-decoration: none;">
                New Session
              </a>
            `}
            ${hasAnalysis ? `
              <button class="geems-button-outline report-toggle" data-session-id="${session.sessionId}">
                View Report
              </button>
            ` : ''}
            ${turns.length >= 3 ? `
              <button class="geems-button-outline report-regenerate" data-session-id="${session.sessionId}" style="font-size: 0.8125rem;">
                ${hasAnalysis ? 'Regenerate' : 'Generate'} Analysis
              </button>
            ` : ''}
            <button class="report-delete-btn" data-session-id="${session.sessionId}" title="Delete this session">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </button>
          </div>
          ${hasAnalysis ? `
            <div class="report-body" id="report-${session.sessionId}" style="display: none;">
              <div class="report-analysis">${renderMarkdown(latestAnalysis!.analysisText)}</div>
              <p class="report-meta">Analyzed: ${new Date(latestAnalysis!.analyzedAt).toLocaleString()} | Turns: ${latestAnalysis!.turnRange}</p>
            </div>
          ` : `
            <p class="report-card-desc" style="margin-top: 0.75rem; font-style: italic;">
              ${turns.length < 3 ? 'Need at least 3 turns to generate analysis.' : 'Analysis available — click Generate.'}
            </p>
          `}
        </div>
      `
    }

    // Reset All button
    html += `
      <div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--border-color); text-align: center;">
        <button id="resetAllBtn" class="geems-button-outline" style="color: #dc2626; border-color: #dc2626;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; vertical-align: -2px; margin-right: 4px;">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          Reset All Data
        </button>
        <p style="color: var(--text-muted); font-size: 0.75rem; margin-top: 0.5rem;">
          Permanently delete all sessions, turns, and analyses.
        </p>
      </div>
    `

    contentEl.innerHTML = html

    // --- Event listeners ---

    // Toggle individual reports
    contentEl.querySelectorAll('.report-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sessionId = (e.currentTarget as HTMLElement).dataset.sessionId!
        const body = document.getElementById(`report-${sessionId}`)!
        const isHidden = body.style.display === 'none'
        body.style.display = isHidden ? 'block' : 'none'
        ;(e.currentTarget as HTMLButtonElement).textContent = isHidden ? 'Hide Report' : 'View Report'
      })
    })

    // Delete individual sessions
    contentEl.querySelectorAll('.report-delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const sessionId = (e.currentTarget as HTMLElement).dataset.sessionId!
        const confirmed = await showDeleteSessionModal(sessionId)
        if (confirmed) {
          await deleteSession(sessionId)
          await loadReports()
        }
      })
    })

    // Regenerate analysis for individual sessions
    contentEl.querySelectorAll('.report-regenerate').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const button = e.currentTarget as HTMLButtonElement
        const sessionId = button.dataset.sessionId!
        button.disabled = true
        button.textContent = 'Analyzing...'

        try {
          const turns = await getTurnsBySession(sessionId)
          const priorAnalyses = await getAnalysesBySession(sessionId)
          const lastAnalysis = priorAnalyses.length > 0
            ? priorAnalyses[priorAnalyses.length - 1].analysisText
            : undefined

          const prompt = buildAnalysisPrompt(turns, lastAnalysis)
          const response = await llmClient.generateTurn(prompt)

          const { saveAnalysis } = await import('../profiling/db')
          await saveAnalysis({
            userId: currentUserId,
            sessionId,
            analyzedAt: Date.now(),
            turnRange: `${turns[0].turnNumber}-${turns[turns.length - 1].turnNumber}`,
            analysisText: response.content,
          })

          // Upload report to server for admin browsing
          const sessions = await getSessionsByUser(currentUserId)
          const session = sessions.find(s => s.sessionId === sessionId)
          if (session) {
            const allAnalyses = await getAnalysesBySession(sessionId)
            uploadReport({
              sessionId,
              userId: currentUserId,
              mode: session.mode,
              genre: session.genre,
              startedAt: session.startedAt,
              turnCount: turns.length,
              turns,
              analyses: allAnalyses,
            }).catch(() => {})
          }

          await loadReports()
        } catch (err) {
          button.textContent = 'Error — retry'
          button.disabled = false
        }
      })
    })

    // Combined report generation
    const combinedBtn = contentEl.querySelector('.report-generate-combined')
    if (combinedBtn) {
      combinedBtn.addEventListener('click', async () => {
        const btn = combinedBtn as HTMLButtonElement
        const outputEl = document.getElementById('combined-report-content')!
        btn.disabled = true
        btn.textContent = 'Generating...'
        outputEl.style.display = 'block'
        outputEl.innerHTML = '<div class="reports-loading"><span>Generating combined analysis...</span></div>'

        try {
          const freshAnalyses = await getAnalysesByUser(currentUserId)
          const allTexts = freshAnalyses.map(a => a.analysisText)
          const prompt = buildCombinedAnalysisPrompt(allTexts)
          const response = await llmClient.generateTurn(prompt)
          outputEl.innerHTML = `<div class="report-analysis">${renderMarkdown(response.content)}</div>`
        } catch (err) {
          outputEl.innerHTML = `<p style="color: #dc2626;">Failed to generate combined report: ${err instanceof Error ? err.message : String(err)}</p>`
        }

        btn.disabled = false
        btn.textContent = 'Regenerate Combined Report'
      })
    }

    // Reset all button
    document.getElementById('resetAllBtn')?.addEventListener('click', () => {
      const modal = document.getElementById('resetModal')!
      modal.classList.add('active')
      const input = document.getElementById('resetConfirmInput') as HTMLInputElement
      input.focus()
    })
  } catch (err) {
    contentEl.innerHTML = `<p style="color: #dc2626;">Error loading reports: ${err instanceof Error ? err.message : String(err)}</p>`
  }
}

function renderMarkdown(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h4 style="color: var(--accent-primary); margin-top: 1rem;">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 style="color: var(--text-heading); margin-top: 1.25rem;">$1</h3>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul style="margin: 0.5rem 0; padding-left: 1.5rem;">$1</ul>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>')
}
