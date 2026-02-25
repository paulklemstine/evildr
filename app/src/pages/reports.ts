// Reports page — displays individual session reports and combined cross-session profile

import { getSessionsByUser, getAnalysesBySession, getAnalysesByUser, getTurnsBySession } from '../profiling/db'
import { buildCombinedAnalysisPrompt } from '../profiling/analysis-prompts'
import type { LLMClient } from '../engine/game-loop'

/**
 * Renders the reports page into the given container.
 */
export async function renderReportsPage(
  app: HTMLElement,
  userId: string,
  llmClient: LLMClient,
  onBack: () => void,
): Promise<void> {
  app.innerHTML = `
    <header class="site-header">
      <div class="site-header-inner">
        <div class="flex items-center gap-3 cursor-pointer" id="reports-nav-home">
          <div class="flex items-center justify-center rounded-lg"
               style="width: 36px; height: 36px; background: var(--accent-primary);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
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
      <p>&copy; ${new Date().getFullYear()} SuperPaul. All rights reserved.</p>
      <p style="margin-top: 0.25rem;">For research and entertainment purposes only.</p>
    </footer>
  `

  // Event listeners
  document.getElementById('reports-back')?.addEventListener('click', onBack)
  document.getElementById('reports-nav-home')?.addEventListener('click', onBack)

  // Load data
  await loadReports(userId, llmClient)
}

async function loadReports(userId: string, llmClient: LLMClient): Promise<void> {
  const contentEl = document.getElementById('reports-content')!

  try {
    const sessions = await getSessionsByUser(userId)

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
    const allAnalyses = await getAnalysesByUser(userId)
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

      html += `
        <div class="report-card" data-session-id="${session.sessionId}">
          <div class="report-card-header">
            <h3 class="report-card-title">${session.mode.toUpperCase()} Session</h3>
            <div class="flex gap-1.5">
              <span class="badge badge-players">${turns.length} turns</span>
              ${session.genre ? `<span class="badge badge-free">${session.genre}</span>` : ''}
              ${hasAnalysis ? '<span class="badge badge-tier">Analyzed</span>' : '<span class="badge badge-rated">Pending</span>'}
            </div>
          </div>
          <p class="report-card-date">${date}</p>
          ${hasAnalysis ? `
            <button class="geems-button-outline report-toggle" data-session-id="${session.sessionId}" style="margin-top: 0.75rem;">
              View Report
            </button>
            <div class="report-body" id="report-${session.sessionId}" style="display: none;">
              <div class="report-analysis">${renderMarkdown(latestAnalysis!.analysisText)}</div>
              <p class="report-meta">Analyzed: ${new Date(latestAnalysis!.analyzedAt).toLocaleString()} | Turns: ${latestAnalysis!.turnRange}</p>
            </div>
          ` : `
            <p class="report-card-desc" style="margin-top: 0.75rem; font-style: italic;">
              Analysis pending. Complete more turns to generate a report.
            </p>
          `}
        </div>
      `
    }

    contentEl.innerHTML = html

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
          const allTexts = allAnalyses.map(a => a.analysisText)
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
