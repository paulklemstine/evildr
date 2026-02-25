// Admin page — live game watching via PeerJS + hidden data viewer

import { connectToLiveBridge } from '../admin/live-bridge'
import { renderUI } from '../engine/renderer'
import type { GameState } from '../engine/game-loop'

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

    <main style="max-width: 1200px; margin: 0 auto; padding: 1.5rem;">
      <!-- Connect Section -->
      <div id="admin-connect" style="max-width: 480px; margin: 2rem auto;">
        <div class="mode-card">
          <h3 class="text-lg font-bold mb-2" style="color: var(--text-heading);">Watch Live Session</h3>
          <p class="text-sm mb-4" style="color: var(--text-secondary);">
            Enter the 4-character watch code shown on the player's game screen.
          </p>
          <div class="flex gap-2">
            <input id="watch-code-input" type="text" maxlength="4"
              placeholder="XXXX"
              class="geems-textarea"
              style="text-align: center; font-size: 1.5rem; letter-spacing: 0.3em; text-transform: uppercase; font-family: 'Source Code Pro', monospace; padding: 0.5rem; flex: 1;"
            />
            <button id="btn-connect" class="geems-button" style="min-width: 120px;">
              Connect
            </button>
          </div>
          <p id="connect-status" class="text-sm mt-2" style="display: none;"></p>
        </div>
      </div>

      <!-- Live View (hidden until connected) -->
      <div id="admin-live" style="display: none;">
        <div class="admin-grid">
          <!-- Game View Column -->
          <div>
            <div class="mode-card" style="margin-bottom: 1rem;">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold" style="color: var(--text-heading);">Live Game View</h3>
                <div class="flex items-center gap-2">
                  <span class="admin-live-dot"></span>
                  <span id="live-mode" class="badge badge-tier"></span>
                  <span id="live-turn" class="badge badge-free">Turn 0</span>
                </div>
              </div>
            </div>
            <div id="live-game-container" class="mode-card">
              <p class="admin-waiting">Waiting for game data...</p>
            </div>
          </div>

          <!-- Hidden Data Column -->
          <div>
            <div class="mode-card" style="margin-bottom: 1rem;">
              <h3 class="text-lg font-bold" style="color: var(--text-heading);">Hidden Data</h3>
              <p class="text-xs" style="color: var(--text-muted);">Data the player cannot see</p>
            </div>

            <div class="mode-card admin-data-card">
              <h4 class="admin-data-label">Subject ID</h4>
              <p id="hd-subject" class="text-sm" style="color: var(--text-secondary); font-family: 'Source Code Pro', monospace;">--</p>
            </div>

            <div class="mode-card admin-data-card">
              <h4 class="admin-data-label">Analysis</h4>
              <div id="hd-analysis" class="text-sm admin-data-scroll">--</div>
            </div>

            <div class="mode-card admin-data-card">
              <h4 class="admin-data-label">Tweet</h4>
              <p id="hd-tweet" class="text-sm" style="color: var(--text-secondary);">--</p>
            </div>

            <div class="mode-card admin-data-card">
              <h4 class="admin-data-label">Notes</h4>
              <div id="hd-notes" class="text-sm admin-data-scroll">--</div>
            </div>

            <button id="btn-disconnect" class="geems-button-outline" style="width: 100%; margin-top: 1rem; color: #dc2626; border-color: #dc2626;">
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </main>

    <footer class="site-footer">
      <p>&copy; ${new Date().getFullYear()} SuperPaul. All rights reserved.</p>
    </footer>
  `

  // --- State ---
  let bridge: { destroy: () => void } | null = null

  // --- Elements ---
  const connectSection = document.getElementById('admin-connect')!
  const liveSection = document.getElementById('admin-live')!
  const codeInput = document.getElementById('watch-code-input') as HTMLInputElement
  const connectBtn = document.getElementById('btn-connect') as HTMLButtonElement
  const statusEl = document.getElementById('connect-status')!

  // --- Navigation ---
  const goBack = () => {
    if (bridge) { bridge.destroy(); bridge = null }
    onBack()
  }
  document.getElementById('admin-back')?.addEventListener('click', goBack)
  document.getElementById('admin-nav-home')?.addEventListener('click', goBack)

  // --- Disconnect ---
  document.getElementById('btn-disconnect')?.addEventListener('click', () => {
    if (bridge) { bridge.destroy(); bridge = null }
    liveSection.style.display = 'none'
    connectSection.style.display = 'block'
    statusEl.style.display = 'none'
    connectBtn.disabled = false
    codeInput.value = ''
  })

  // --- Connect ---
  async function doConnect() {
    const code = codeInput.value.trim().toUpperCase()
    if (code.length !== 4) {
      showStatus('Enter a 4-character code', '#dc2626')
      return
    }

    showStatus('Connecting...', 'var(--text-muted)')
    connectBtn.disabled = true

    try {
      bridge = await connectToLiveBridge(
        code,
        (data) => handleLiveData(data as Record<string, unknown>),
        () => {
          showStatus('Player disconnected', '#dc2626')
          // Keep live view visible so admin can still see last state
        },
      )

      showStatus(`Connected to ${code}`, 'var(--accent-primary)')
      connectSection.style.display = 'none'
      liveSection.style.display = 'block'
    } catch (err) {
      showStatus(`Failed: ${(err as Error).message}`, '#dc2626')
      connectBtn.disabled = false
    }
  }

  connectBtn.addEventListener('click', doConnect)
  codeInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doConnect() })

  // --- Auto-focus input ---
  codeInput.focus()

  // --- Handle incoming live data ---
  function handleLiveData(data: Record<string, unknown>) {
    if (data.type !== 'stateUpdate') return

    const state = data.state as GameState

    // Mode & turn badges
    const modeEl = document.getElementById('live-mode')
    if (modeEl) modeEl.textContent = state.mode?.toUpperCase() || '?'

    const turnEl = document.getElementById('live-turn')
    if (turnEl) turnEl.textContent = `Turn ${state.turnNumber}`

    // Render game UI read-only
    if (state.currentUiJson) {
      const container = document.getElementById('live-game-container')!
      renderUI(container, state.currentUiJson)

      // Disable all interactive elements
      container.querySelectorAll<HTMLElement>('input, textarea, select, button').forEach(el => {
        (el as HTMLInputElement).disabled = true
        el.style.pointerEvents = 'none'
        el.style.opacity = '0.7'
      })
    }

    // Hidden data
    const subjectEl = document.getElementById('hd-subject')
    if (subjectEl && state.currentSubjectId) {
      subjectEl.textContent = state.currentSubjectId
    }

    const analysisEl = document.getElementById('hd-analysis')
    if (analysisEl && state.hiddenAnalysis) {
      analysisEl.innerHTML = renderBasicMarkdown(state.hiddenAnalysis)
    }

    const tweetEl = document.getElementById('hd-tweet')
    if (tweetEl && state.hiddenTweet) {
      tweetEl.textContent = state.hiddenTweet
    }

    const notesEl = document.getElementById('hd-notes')
    if (notesEl && state.currentNotes) {
      notesEl.textContent = state.currentNotes
    }
  }

  // --- Helpers ---
  function showStatus(msg: string, color: string) {
    statusEl.textContent = msg
    statusEl.style.color = color
    statusEl.style.display = 'block'
  }

  // Cleanup on hash change
  const cleanup = () => {
    if (bridge) { bridge.destroy(); bridge = null }
    window.removeEventListener('hashchange', cleanup)
  }
  window.addEventListener('hashchange', cleanup)
}

function renderBasicMarkdown(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
}
