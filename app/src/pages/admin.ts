// Admin page — lobby-based live spying on all active players

import { createAdminLobby } from '../admin/live-bridge'
import type { AdminLobby, PlayerInfo } from '../admin/live-bridge'
import { renderUI } from '../engine/renderer'
import type { GameState } from '../engine/game-loop'

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
            <p class="text-xs" style="color: var(--text-muted); margin-top: -2px;">Live Session Monitor</p>
          </div>
        </div>
        <button id="admin-back" class="geems-button-outline">Back</button>
      </div>
    </header>

    <main style="max-width: 1300px; margin: 0 auto; padding: 1.5rem;">
      <!-- Status Bar -->
      <div id="lobby-status" class="mode-card" style="margin-bottom: 1.5rem; text-align: center;">
        <p class="text-sm" style="color: var(--text-muted);">Connecting to lobby...</p>
      </div>

      <!-- Dashboard -->
      <div class="admin-dashboard">
        <!-- Player List -->
        <div id="player-list" class="admin-player-list">
          <p class="admin-empty-msg">No active players</p>
        </div>

        <!-- Selected Player View -->
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
    </main>

    <footer class="site-footer">
      <p>&copy; ${new Date().getFullYear()} SuperPaul. All rights reserved.</p>
    </footer>
  `

  // --- State ---
  let lobby: AdminLobby | null = null
  const players = new Map<string, TrackedPlayer>()
  let selectedPeerId: string | null = null

  // --- Navigation ---
  const goBack = () => {
    if (lobby) { lobby.destroy(); lobby = null }
    onBack()
  }
  document.getElementById('admin-back')?.addEventListener('click', goBack)
  document.getElementById('admin-nav-home')?.addEventListener('click', goBack)

  // --- Start lobby ---
  initLobby()

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
          // Update the player card turn badge
          const badge = document.querySelector(`[data-player="${peerId}"] .player-turn-badge`)
          if (badge) badge.textContent = `Turn ${state.turnNumber}`
          // If this player is selected, update the live view
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

    // Click handlers
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
            <h4 class="admin-data-label">Tweet</h4>
            <p id="sv-tweet" class="text-sm" style="color: var(--text-secondary);">--</p>
          </div>
          <div class="mode-card admin-data-card">
            <h4 class="admin-data-label">Notes</h4>
            <div id="sv-notes" class="text-sm admin-data-scroll">--</div>
          </div>
        </div>
      </div>
    `

    // Render existing state if available
    if (player.lastState) {
      renderSelectedPlayerState(player.lastState)
    }
  }

  function renderSelectedPlayerState(state: GameState) {
    // Turn badge
    const turnEl = document.getElementById('sv-turn')
    if (turnEl) turnEl.textContent = `Turn ${state.turnNumber}`

    // Game UI (read-only)
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

    // Hidden data
    const subjectEl = document.getElementById('sv-subject')
    if (subjectEl && state.currentSubjectId) subjectEl.textContent = state.currentSubjectId

    const analysisEl = document.getElementById('sv-analysis')
    if (analysisEl && state.hiddenAnalysis) analysisEl.innerHTML = renderBasicMarkdown(state.hiddenAnalysis)

    const tweetEl = document.getElementById('sv-tweet')
    if (tweetEl && state.hiddenTweet) tweetEl.textContent = state.hiddenTweet

    const notesEl = document.getElementById('sv-notes')
    if (notesEl && state.currentNotes) notesEl.textContent = state.currentNotes
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
    .replace(/\n/g, '<br>')
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}
