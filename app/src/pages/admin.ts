// Admin page — live spying + reports browser
// Tab 1: Live session monitor via PeerJS lobby
// Tab 2: Browse all uploaded player reports from Cloudflare KV

import { createAdminLobby } from '../admin/live-bridge'
import type { AdminLobby, PlayerInfo } from '../admin/live-bridge'
import { renderUI } from '../engine/renderer'
import type { GameState } from '../engine/game-loop'
import { listReports, getReport } from '../api/report-uploader'
import type { ReportMeta, ReportPayload } from '../api/report-uploader'

interface TrackedPlayer extends PlayerInfo {
  lastState: GameState | null
}

export function renderAdminPage(app: HTMLElement, onBack: () => void): void {
  app.innerHTML = `
    <header class="site-header">
      <div class="site-header-inner">
        <div class="flex items-center gap-3 cursor-pointer" id="admin-nav-home">
          <div class="flex items-center justify-center rounded-lg"
               style="width: 36px; height: 36px; background: var(--accent-primary);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div>
            <h1 class="text-lg font-bold" style="color: var(--text-heading); letter-spacing: -0.02em;">
              GEEMS Admin
            </h1>
            <p class="text-xs" style="color: var(--text-muted); margin-top: -2px;">Session Monitor</p>
          </div>
        </div>
        <button id="admin-back" class="geems-button-outline">Back</button>
      </div>
    </header>

    <main style="max-width: 1300px; margin: 0 auto; padding: 1.5rem;">
      <!-- Tabs -->
      <div class="admin-tabs" style="display: flex; gap: 0; margin-bottom: 1.5rem; border-bottom: 2px solid var(--border-color);">
        <button class="admin-tab active" data-tab="live" style="padding: 0.75rem 1.5rem; font-size: 0.875rem; font-weight: 600; border: none; background: none; cursor: pointer; color: var(--accent-primary); border-bottom: 2px solid var(--accent-primary); margin-bottom: -2px;">
          Live Players
        </button>
        <button class="admin-tab" data-tab="reports" style="padding: 0.75rem 1.5rem; font-size: 0.875rem; font-weight: 600; border: none; background: none; cursor: pointer; color: var(--text-muted); border-bottom: 2px solid transparent; margin-bottom: -2px;">
          All Reports
        </button>
      </div>

      <!-- Live Tab -->
      <div id="tab-live">
        <div id="lobby-status" class="mode-card" style="margin-bottom: 1.5rem; text-align: center;">
          <p class="text-sm" style="color: var(--text-muted);">Connecting to lobby...</p>
        </div>
        <div class="admin-dashboard">
          <div id="player-list" class="admin-player-list">
            <p class="admin-empty-msg">No active players</p>
          </div>
          <div id="player-view" class="admin-player-view">
            <div class="admin-no-selection">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.4;">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <p style="color: var(--text-muted); margin-top: 1rem;">Select a player to watch their live session</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Reports Tab -->
      <div id="tab-reports" style="display: none;">
        <div class="admin-dashboard">
          <div id="reports-list" class="admin-player-list">
            <p class="admin-empty-msg">Loading reports...</p>
          </div>
          <div id="report-view" class="admin-player-view">
            <div class="admin-no-selection">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.4;">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <p style="color: var(--text-muted); margin-top: 1rem;">Select a report to view details</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="site-footer">
      <p>&copy; ${new Date().getFullYear()} SuperPaul. All rights reserved.</p>
    </footer>
  `

  // --- State ---
  let lobby: AdminLobby | null = null
  const players = new Map<string, TrackedPlayer>()
  let selectedPeerId: string | null = null
  let reportsMeta: ReportMeta[] = []
  let selectedReportId: string | null = null

  // --- Tab switching ---
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = (tab as HTMLElement).dataset.tab!
      document.querySelectorAll('.admin-tab').forEach(t => {
        const el = t as HTMLElement
        const isActive = el.dataset.tab === target
        el.style.color = isActive ? 'var(--accent-primary)' : 'var(--text-muted)'
        el.style.borderBottomColor = isActive ? 'var(--accent-primary)' : 'transparent'
        el.classList.toggle('active', isActive)
      })
      document.getElementById('tab-live')!.style.display = target === 'live' ? 'block' : 'none'
      document.getElementById('tab-reports')!.style.display = target === 'reports' ? 'block' : 'none'

      if (target === 'reports' && reportsMeta.length === 0) {
        loadReportsList()
      }
    })
  })

  // --- Navigation ---
  const goBack = () => {
    if (lobby) { lobby.destroy(); lobby = null }
    onBack()
  }
  document.getElementById('admin-back')?.addEventListener('click', goBack)
  document.getElementById('admin-nav-home')?.addEventListener('click', goBack)

  // --- Start lobby ---
  initLobby()

  // =========================================================================
  // LIVE TAB
  // =========================================================================

  async function initLobby() {
    const statusEl = document.getElementById('lobby-status')!

    try {
      lobby = await createAdminLobby({
        onPlayerJoined(info) {
          players.set(info.peerId, { ...info, lastState: null })
          renderPlayerList()
          updateStatusBar()
        },
        onPlayerLeft(peerId) {
          players.delete(peerId)
          if (selectedPeerId === peerId) {
            selectedPeerId = null
            renderPlayerView()
          }
          renderPlayerList()
          updateStatusBar()
        },
        onPlayerData(peerId, data) {
          const record = data as Record<string, unknown>
          if (record.type !== 'stateUpdate') return
          const player = players.get(peerId)
          if (!player) return
          const state = record.state as GameState
          player.lastState = state
          player.turnNumber = state.turnNumber
          const badge = document.querySelector(`[data-player="${peerId}"] .player-turn-badge`)
          if (badge) badge.textContent = `Turn ${state.turnNumber}`
          if (selectedPeerId === peerId) {
            renderSelectedPlayerState(state)
          }
        },
      })

      statusEl.innerHTML = `
        <div class="flex items-center justify-center gap-2">
          <span class="admin-live-dot"></span>
          <span class="text-sm font-medium" style="color: var(--text-heading);">Lobby Active</span>
          <span class="text-sm" style="color: var(--text-muted);">&mdash;</span>
          <span id="player-count" class="text-sm" style="color: var(--text-secondary);">0 players connected</span>
        </div>
      `
    } catch (err) {
      statusEl.innerHTML = `
        <p class="text-sm" style="color: #dc2626;">
          ${(err as Error).message}
        </p>
        <button id="retry-lobby" class="geems-button-outline" style="margin-top: 0.75rem; font-size: 0.8125rem;">
          Retry
        </button>
      `
      document.getElementById('retry-lobby')?.addEventListener('click', () => {
        statusEl.innerHTML = '<p class="text-sm" style="color: var(--text-muted);">Reconnecting...</p>'
        initLobby()
      })
    }
  }

  function updateStatusBar() {
    const countEl = document.getElementById('player-count')
    if (countEl) {
      const n = players.size
      countEl.textContent = `${n} player${n !== 1 ? 's' : ''} connected`
    }
  }

  function renderPlayerList() {
    const listEl = document.getElementById('player-list')!

    if (players.size === 0) {
      listEl.innerHTML = '<p class="admin-empty-msg">No active players</p>'
      return
    }

    let html = ''
    for (const [peerId, player] of players) {
      const isSelected = peerId === selectedPeerId
      const timeAgo = formatTimeAgo(player.connectedAt)
      html += `
        <div class="admin-player-card ${isSelected ? 'selected' : ''}" data-player="${peerId}">
          <div class="flex items-center justify-between">
            <span class="text-sm font-bold" style="color: var(--text-heading);">
              ${player.mode.toUpperCase()}${player.genre ? ` / ${player.genre}` : ''}
            </span>
            <span class="badge badge-free player-turn-badge">Turn ${player.turnNumber}</span>
          </div>
          <div class="text-xs" style="color: var(--text-muted); margin-top: 0.25rem;">
            ${peerId.slice(-6)} &middot; ${timeAgo}
          </div>
        </div>
      `
    }
    listEl.innerHTML = html

    listEl.querySelectorAll('.admin-player-card').forEach(card => {
      card.addEventListener('click', () => {
        const pid = (card as HTMLElement).dataset.player!
        selectedPeerId = pid
        renderPlayerList()
        renderPlayerView()
      })
    })
  }

  function renderPlayerView() {
    const viewEl = document.getElementById('player-view')!

    if (!selectedPeerId || !players.has(selectedPeerId)) {
      viewEl.innerHTML = `
        <div class="admin-no-selection">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.4;">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <p style="color: var(--text-muted); margin-top: 1rem;">Select a player to watch their live session</p>
        </div>
      `
      return
    }

    const player = players.get(selectedPeerId)!

    viewEl.innerHTML = `
      <div class="admin-view-header mode-card" style="margin-bottom: 1rem;">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold" style="color: var(--text-heading);">
              ${player.mode.toUpperCase()}${player.genre ? ` / ${player.genre}` : ''}
            </h3>
            <p class="text-xs" style="color: var(--text-muted);">
              Peer: ${selectedPeerId.slice(-6)} &middot; User: ${player.userId.slice(0, 8)}...
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span class="admin-live-dot"></span>
            <span id="sv-turn" class="badge badge-free">Turn ${player.turnNumber}</span>
          </div>
        </div>
      </div>

      <div class="admin-grid">
        <div>
          <div id="sv-game-container" class="mode-card">
            <p class="admin-waiting">Waiting for turn data...</p>
          </div>
        </div>
        <div>
          <div class="mode-card admin-data-card">
            <h4 class="admin-data-label">Subject ID</h4>
            <p id="sv-subject" class="text-sm" style="color: var(--text-secondary); font-family: 'Source Code Pro', monospace;">--</p>
          </div>
          <div class="mode-card admin-data-card">
            <h4 class="admin-data-label">Analysis</h4>
            <div id="sv-analysis" class="text-sm admin-data-scroll">--</div>
          </div>
          <div class="mode-card admin-data-card">
            <h4 class="admin-data-label">Notes</h4>
            <div id="sv-notes" class="text-sm admin-data-scroll">--</div>
          </div>
        </div>
      </div>
    `

    if (player.lastState) {
      renderSelectedPlayerState(player.lastState)
    }
  }

  function renderSelectedPlayerState(state: GameState) {
    const turnEl = document.getElementById('sv-turn')
    if (turnEl) turnEl.textContent = `Turn ${state.turnNumber}`

    if (state.currentUiJson) {
      const container = document.getElementById('sv-game-container')
      if (container) {
        renderUI(container, state.currentUiJson)
        container.querySelectorAll<HTMLElement>('input, textarea, select, button').forEach(el => {
          (el as HTMLInputElement).disabled = true
          el.style.pointerEvents = 'none'
          el.style.opacity = '0.7'
        })
      }
    }

    const subjectEl = document.getElementById('sv-subject')
    if (subjectEl && state.currentSubjectId) subjectEl.textContent = state.currentSubjectId

    const analysisEl = document.getElementById('sv-analysis')
    if (analysisEl && state.hiddenAnalysis) analysisEl.innerHTML = renderBasicMarkdown(state.hiddenAnalysis)

    const notesEl = document.getElementById('sv-notes')
    if (notesEl && state.currentNotes) notesEl.textContent = state.currentNotes
  }

  // =========================================================================
  // REPORTS TAB
  // =========================================================================

  async function loadReportsList() {
    const listEl = document.getElementById('reports-list')!
    listEl.innerHTML = '<p class="admin-empty-msg">Loading reports...</p>'

    try {
      reportsMeta = await listReports()

      if (reportsMeta.length === 0) {
        listEl.innerHTML = '<p class="admin-empty-msg">No reports uploaded yet</p>'
        return
      }

      renderReportsList()
    } catch (err) {
      listEl.innerHTML = `
        <p class="admin-empty-msg" style="color: #dc2626;">
          Failed to load reports: ${(err as Error).message}
        </p>
        <button class="geems-button-outline" id="retry-reports" style="margin-top: 0.75rem; font-size: 0.8125rem;">
          Retry
        </button>
      `
      document.getElementById('retry-reports')?.addEventListener('click', loadReportsList)
    }
  }

  function renderReportsList() {
    const listEl = document.getElementById('reports-list')!

    let html = `
      <div style="padding: 0.5rem 0.75rem; margin-bottom: 0.5rem;">
        <p class="text-xs font-bold" style="color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">
          ${reportsMeta.length} report${reportsMeta.length !== 1 ? 's' : ''}
        </p>
      </div>
    `

    for (const report of reportsMeta) {
      const isSelected = report.sessionId === selectedReportId
      const date = report.startedAt
        ? new Date(report.startedAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
          })
        : 'Unknown'

      html += `
        <div class="admin-player-card ${isSelected ? 'selected' : ''}" data-report="${report.sessionId}">
          <div class="flex items-center justify-between">
            <span class="text-sm font-bold" style="color: var(--text-heading);">
              ${(report.mode || 'unknown').toUpperCase()}${report.genre ? ` / ${report.genre}` : ''}
            </span>
            <div class="flex gap-1">
              <span class="badge badge-players">${report.turnCount || 0}T</span>
              ${report.hasAnalysis ? '<span class="badge badge-tier">Analyzed</span>' : '<span class="badge badge-rated">Raw</span>'}
            </div>
          </div>
          <div class="text-xs" style="color: var(--text-muted); margin-top: 0.25rem;">
            ${(report.userId || '').slice(0, 8)}... &middot; ${date}
          </div>
        </div>
      `
    }

    listEl.innerHTML = html

    listEl.querySelectorAll('.admin-player-card').forEach(card => {
      card.addEventListener('click', () => {
        selectedReportId = (card as HTMLElement).dataset.report!
        renderReportsList()
        loadReportDetail(selectedReportId)
      })
    })
  }

  async function loadReportDetail(sessionId: string) {
    const viewEl = document.getElementById('report-view')!
    viewEl.innerHTML = '<p class="admin-empty-msg">Loading report...</p>'

    try {
      const report = await getReport(sessionId)
      renderReportDetail(report)
    } catch (err) {
      viewEl.innerHTML = `<p class="admin-empty-msg" style="color: #dc2626;">Failed to load: ${(err as Error).message}</p>`
    }
  }

  function renderReportDetail(report: ReportPayload) {
    const viewEl = document.getElementById('report-view')!
    const analyses = (report.analyses || []) as Array<{ analysisText?: string; analyzedAt?: number; turnRange?: string }>
    const turns = (report.turns || []) as Array<{ turnNumber?: number; timestamp?: number; playerInputs?: string; signals?: Record<string, unknown> }>
    const date = report.startedAt
      ? new Date(report.startedAt).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
        })
      : 'Unknown'

    let html = `
      <div class="admin-view-header mode-card" style="margin-bottom: 1rem;">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold" style="color: var(--text-heading);">
              ${(report.mode || 'unknown').toUpperCase()}${report.genre ? ` / ${report.genre}` : ''}
            </h3>
            <p class="text-xs" style="color: var(--text-muted);">
              User: ${(report.userId || '').slice(0, 12)}... &middot; ${date}
            </p>
          </div>
          <span class="badge badge-players">${turns.length} turns</span>
        </div>
      </div>
    `

    // Analyses
    if (analyses.length > 0) {
      for (const analysis of analyses) {
        html += `
          <div class="mode-card admin-data-card" style="margin-bottom: 1rem;">
            <h4 class="admin-data-label">
              Analysis${analysis.turnRange ? ` (Turns ${analysis.turnRange})` : ''}
            </h4>
            <div class="text-sm admin-data-scroll" style="max-height: 400px;">
              ${renderBasicMarkdown(analysis.analysisText || 'No analysis text')}
            </div>
            ${analysis.analyzedAt ? `<p class="text-xs" style="color: var(--text-muted); margin-top: 0.5rem;">${new Date(analysis.analyzedAt).toLocaleString()}</p>` : ''}
          </div>
        `
      }
    } else {
      html += `
        <div class="mode-card admin-data-card" style="margin-bottom: 1rem;">
          <p class="text-sm" style="color: var(--text-muted); font-style: italic;">No analysis generated yet for this session.</p>
        </div>
      `
    }

    // Turn-by-turn data
    if (turns.length > 0) {
      html += `
        <div class="mode-card admin-data-card">
          <h4 class="admin-data-label">Turn Data</h4>
          <div class="admin-data-scroll" style="max-height: 500px;">
      `
      for (const turn of turns) {
        const signals = turn.signals || {}
        html += `
          <div style="padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold" style="color: var(--text-heading);">Turn ${turn.turnNumber || '?'}</span>
              <span class="text-xs" style="color: var(--text-muted);">${(signals as Record<string, unknown>).responseTimeMs ? `${Math.round(Number((signals as Record<string, unknown>).responseTimeMs) / 1000)}s response` : ''}</span>
            </div>
            <p class="text-xs" style="color: var(--text-secondary); margin-top: 0.25rem; word-break: break-all;">
              ${escapeHtml(summarizeInputs(turn.playerInputs || '{}'))}
            </p>
          </div>
        `
      }
      html += '</div></div>'
    }

    viewEl.innerHTML = html
  }

  // Cleanup on hash change
  const cleanup = () => {
    if (lobby) { lobby.destroy(); lobby = null }
    window.removeEventListener('hashchange', cleanup)
  }
  window.addEventListener('hashchange', cleanup)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderBasicMarkdown(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h4 style="color: var(--accent-primary); margin-top: 0.75rem; font-size: 0.8125rem;">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 style="color: var(--text-heading); margin-top: 1rem;">$1</h3>')
    .replace(/^- (.+)$/gm, '<li style="margin-left: 1rem;">$1</li>')
    .replace(/\n/g, '<br>')
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function summarizeInputs(json: string): string {
  try {
    const parsed = JSON.parse(json) as Record<string, unknown>
    const parts: string[] = []
    for (const [key, val] of Object.entries(parsed)) {
      if (key === 'turnNumber') continue
      const v = typeof val === 'string' ? val : JSON.stringify(val)
      parts.push(`${key}: ${v.length > 60 ? v.slice(0, 60) + '...' : v}`)
    }
    return parts.join(' | ') || '(no inputs)'
  } catch {
    return json.slice(0, 100)
  }
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}
