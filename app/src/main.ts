import { LLMClient } from './api/llm-client'
import { ImageClient } from './api/image-client'
import { GameLoop } from './engine/game-loop'
import { getModes, getMode } from './modes/mode-registry'
import { createCYOAPromptBuilder } from './modes/cyoa/prompts'
import { createFlaggedPromptBuilder } from './modes/flagged/prompts'
import { MultiplayerGameLoop } from './engine/multiplayer-loop'
import type { AnalysisData } from './engine/multiplayer-loop'
import { createRoom, joinRoom } from './multiplayer/room-code'
import type { RoomHandle, GuestHandle } from './multiplayer/room-code'
import { LobbyClient } from './multiplayer/lobby-client'
import type { LobbyPlayer } from './multiplayer/lobby-client'
import { getUserId, createSessionId } from './identity/user-id'
import { showConsentIfNeeded } from './identity/consent-banner'
import { showReEngagement } from './engine/session-hooks'
import { showInterstitial, dismissInterstitial, preloadInterstitialImage, preloadInterstitialImageEarly, updateInterstitialStatus } from './engine/loading-interstitial'
import { renderReportsPage } from './pages/reports'
import { renderAdminPage } from './pages/admin'
import { createWatchablePlayer } from './admin/live-bridge'
import type { PlayerBridge } from './admin/live-bridge'
import { collectInputState } from './engine/renderer'
import { applyModeTheme, clearModeTheme } from './engine/mode-theme'
import './style.css'

// --- Mode card images (routed through proxy for auth; deterministic seed for caching) ---
const IMAGE_BASE = import.meta.env.DEV
  ? '/api/image'
  : 'https://drevil-proxy.drevil.workers.dev/api/image'
const MODE_CARD_IMAGES: Record<string, string> = {
  devil: `${IMAGE_BASE}/A%20luxurious%20baroque%20study%20with%20deep%20leather%20chairs%20and%20a%20roaring%20fireplace%2C%20golden%20candlelight%20illuminates%20dark%20wood%20and%20gilded%20portrait%20frames%2C%20a%20glowing%20golden%20contract%20on%20an%20obsidian%20desk%2C%20supernatural%20elegance%2C%20chiaroscuro%20oil%20painting%20style?width=512&height=288&seed=42&nologo=true&model=z-image-turbo`,
  drevil: `${IMAGE_BASE}/A%20retro-futuristic%20mad%20scientist%20laboratory%20with%20neon%20green%20glowing%20tubes%2C%20colorful%20control%20panels%2C%20and%20a%20spinning%20chair%20facing%20wall%20of%20monitors%2C%20adult%20cartoon%20style%2C%20dramatic%20cinematic%20lighting%2C%20vibrant%20colors?width=512&height=288&seed=42&nologo=true&model=z-image-turbo`,
  geems: `${IMAGE_BASE}/An%20epic%20cinematic%20adventure%20scene%20with%20a%20hero%20silhouette%20standing%20at%20the%20edge%20of%20a%20glowing%20cliff%20overlooking%20a%20vast%20magical%20landscape%20with%20floating%20islands%2C%20vibrant%20adult%20animated%20movie%20style%2C%20dramatic%20golden%20hour%20lighting?width=512&height=288&seed=42&nologo=true&model=z-image-turbo`,
  cyoa: `${IMAGE_BASE}/A%20mystical%20crossroads%20in%20an%20enchanted%20forest%20with%20three%20branching%20paths%20lit%20by%20different%20colored%20magical%20lights%2C%20ancient%20stone%20markers%2C%20fireflies%2C%20painterly%20fantasy%20art%20style%2C%20dramatic%20atmosphere?width=512&height=288&seed=42&nologo=true&model=z-image-turbo`,
  oracle: `${IMAGE_BASE}/A%20mystical%20oracle%20chamber%20with%20swirling%20cosmic%20purple%20and%20gold%20energy%2C%20a%20crystal%20sphere%20floating%20above%20an%20ancient%20stone%20pedestal%2C%20celestial%20symbols%20and%20constellations%20reflected%20on%20dark%20marble%20walls%2C%20ethereal%20divine%20lighting?width=512&height=288&seed=42&nologo=true&model=z-image-turbo`,
  skinwalker: `${IMAGE_BASE}/A%20seemingly%20normal%20suburban%20kitchen%20at%20twilight%20but%20something%20is%20subtly%20wrong%2C%20the%20shadows%20fall%20in%20the%20wrong%20direction%2C%20a%20family%20photo%20on%20the%20wall%20has%20too%20many%20people%20in%20it%2C%20muted%20desaturated%20colors%2C%20uncanny%20horror%20atmosphere?width=512&height=288&seed=42&nologo=true&model=z-image-turbo`,
  'fever-dream': `${IMAGE_BASE}/A%20surreal%20dreamscape%20where%20a%20grand%20piano%20made%20of%20clouds%20floats%20above%20a%20neon%20pink%20ocean%2C%20melting%20clocks%20drip%20from%20impossible%20architecture%2C%20vibrant%20psychedelic%20colors%2C%20electric%20cyan%20sky%2C%20whimsical%20surrealist%20art%20style?width=512&height=288&seed=42&nologo=true&model=z-image-turbo`,
  flagged: `${IMAGE_BASE}/A%20romantic%20candlelit%20dinner%20table%20for%20two%20in%20a%20dimly%20lit%20velvet%20lounge%2C%20rose%20petals%20scattered%2C%20two%20wine%20glasses%20with%20mysterious%20green%20and%20red%20glowing%20flags%20floating%20above%20them%2C%20noir%20romantic%20atmosphere%2C%20cinematic%20lighting?width=512&height=288&seed=42&nologo=true&model=z-image-turbo`,
}

// --- Global State ---
let gameLoop: GameLoop | null = null
let playerBridge: PlayerBridge | null = null
let userId: string = ''

// --- Multiplayer State ---
let multiplayerLoop: MultiplayerGameLoop | null = null
let roomHandle: RoomHandle | null = null
let guestHandle: GuestHandle | null = null
let lobbyClient: LobbyClient | null = null
let pendingPartnerMessages: unknown[] = [] // buffer messages arriving before loop is created

// --- API Clients ---
// No API keys in client code — auth is injected server-side by the proxy
const llmClient = new LLMClient()
const imageClient = new ImageClient()

// --- Theme Toggle ---

function initTheme(): void {
  const saved = localStorage.getItem('geems-theme')
  if (saved === 'dark') {
    document.body.classList.add('dark-mode')
  }
}

function toggleTheme(): void {
  const isDark = document.body.classList.toggle('dark-mode')
  localStorage.setItem('geems-theme', isDark ? 'dark' : 'light')
}

function renderThemeToggle(): string {
  return `
    <label class="theme-toggle" id="theme-toggle">
      <span>Light</span>
      <div class="theme-toggle-track">
        <div class="theme-toggle-thumb"></div>
      </div>
      <span>Dark</span>
    </label>
  `
}

function bindThemeToggle(): void {
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme)
}

// --- Page Rendering ---

function renderHeader(activePage: string): string {
  return `
    <header class="site-header">
      <div class="site-header-inner">
        <div class="flex items-center gap-3 cursor-pointer" id="nav-home">
          <div class="flex items-center justify-center rounded-lg"
               style="width: 36px; height: 36px; background: var(--accent-primary); font-size: 22px; line-height: 1;">
            &#x1F9E0;
          </div>
          <div>
            <h1 class="text-lg font-bold" style="color: var(--text-heading); letter-spacing: -0.02em;">
              GEEMS
            </h1>
            <p class="text-xs" style="color: var(--text-muted); margin-top: -2px;">Wellness Assessment Platform</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          ${activePage === 'game' ? `
            <button id="btn-back-lobby" class="geems-button-outline">
              Back
            </button>
          ` : ''}
          <button id="btn-reports" class="geems-button-outline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; vertical-align: -2px; margin-right: 4px;">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            Reports
          </button>
          <span class="badge badge-beta">Beta</span>
        </div>
      </div>
    </header>
  `
}

function renderLobby(): void {
  // Clear any mode-specific theme so the lobby uses default styling
  clearModeTheme()

  const modes = getModes()
  const app = document.getElementById('app')!

  app.innerHTML = `
    ${renderHeader('lobby')}

    <main class="flex-1" style="max-width: 960px; margin: 0 auto; padding: 2rem 1.5rem;">
      <!-- Hero Section -->
      <div class="text-center" style="margin-bottom: 3rem;">
        <p class="text-sm font-medium" style="color: var(--accent-primary); margin-bottom: 0.5rem; letter-spacing: 0.05em; text-transform: uppercase;">
          Interactive Wellness Assessment
        </p>
        <h2 class="text-3xl font-bold" style="color: var(--text-heading); margin-bottom: 0.75rem; letter-spacing: -0.02em;">
          Choose Your Assessment
        </h2>
        <p style="color: var(--text-secondary); max-width: 560px; margin: 0 auto; font-size: 0.9375rem; line-height: 1.6;">
          Our AI-guided interactive sessions help explore personality traits, cognitive patterns,
          and emotional responses through engaging narrative experiences.
        </p>
        <p class="mt-3 text-xs" style="color: var(--text-muted);">
          For research and entertainment purposes only. Not a substitute for professional clinical advice.
        </p>
      </div>

      <!-- Mode Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6" id="mode-grid">
        ${modes.map(mode => {
          const imgUrl = MODE_CARD_IMAGES[mode.id] || ''
          return `
          <div class="mode-card" data-mode="${mode.id}">
            ${imgUrl ? `
              <div class="mode-card-image-wrap">
                <div class="mode-card-image-shimmer"></div>
                <img class="mode-card-image" src="${imgUrl}" alt="${mode.name}" />
              </div>
            ` : ''}
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-bold" style="color: var(--text-heading);">
                ${mode.name}
              </h3>
              <div class="flex gap-1.5">
                <span class="badge badge-players">
                  ${mode.minPlayers === mode.maxPlayers ? `${mode.minPlayers}P` : `${mode.minPlayers}-${mode.maxPlayers}P`}
                </span>
                ${mode.tier !== 'free' ? `
                  <span class="badge badge-tier">${mode.tier}</span>
                ` : `
                  <span class="badge badge-free">Free</span>
                `}
                ${mode.rated === 'r' ? `
                  <span class="badge badge-rated">R</span>
                ` : ''}
              </div>
            </div>
            <p class="text-sm" style="color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.5;">
              ${mode.description}
            </p>
            ${mode.id === 'cyoa' ? `
              <div class="flex flex-wrap gap-1.5 mb-4" id="genre-picker-${mode.id}">
                ${['Horror', 'Sci-Fi', 'Fantasy', 'Noir', 'Comedy', 'Post-Apocalyptic', 'Romantic'].map(g => `
                  <button class="genre-btn" data-genre="${g.toLowerCase()}">${g}</button>
                `).join('')}
              </div>
            ` : ''}
            <button class="geems-button w-full play-btn" data-mode="${mode.id}">
              ${mode.minPlayers > 1 ? 'Find Match' : 'Begin Session'}
            </button>
          </div>
        `}).join('')}
      </div>
    </main>

    <footer class="site-footer">
      <p>&copy; ${new Date().getFullYear()} SuperPaul. All rights reserved.</p>
      <p style="margin-top: 0.25rem;">For research and entertainment purposes only.</p>
      <a href="https://pollinations.ai" target="_blank" rel="noopener" style="display: inline-block; margin-top: 0.5rem;">
        <img src="https://img.shields.io/badge/Built%20with-Pollinations-8a2be2?style=for-the-badge&logo=data:image/svg+xml,%3Csvg%20xmlns%3D%22http://www.w3.org/2000/svg%22%20viewBox%3D%220%200%20124%20124%22%3E%3Ccircle%20cx%3D%2262%22%20cy%3D%2262%22%20r%3D%2262%22%20fill%3D%22%23ffffff%22/%3E%3C/svg%3E&logoColor=white&labelColor=6a0dad" alt="Built with Pollinations" height="28" />
      </a>
      <div style="margin-top: 0.75rem; display: flex; justify-content: center; gap: 1.5rem;">${renderThemeToggle()}</div>
    </footer>
  `

  bindThemeToggle()

  // Handle mode card image loading — fade in on load, remove shimmer
  document.querySelectorAll<HTMLImageElement>('.mode-card-image').forEach(img => {
    img.onload = () => {
      const shimmer = img.previousElementSibling as HTMLElement | null
      if (shimmer?.classList.contains('mode-card-image-shimmer')) shimmer.style.display = 'none'
      img.style.opacity = '1'
    }
    img.onerror = () => {
      const wrap = img.closest('.mode-card-image-wrap') as HTMLElement | null
      if (wrap) wrap.style.display = 'none'
    }
  })

  // Preload interstitial image while player browses the lobby
  preloadInterstitialImage(imageClient)

  // --- Event Listeners ---
  let selectedGenre = 'horror'

  // Genre picker
  document.querySelectorAll('.genre-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement
      selectedGenre = target.dataset.genre || 'horror'
      document.querySelectorAll('.genre-btn').forEach(b => {
        b.classList.remove('active')
      })
      target.classList.add('active')
    })
  })

  // Select default genre
  const defaultGenreBtn = document.querySelector('.genre-btn[data-genre="horror"]') as HTMLElement | null
  if (defaultGenreBtn) {
    defaultGenreBtn.classList.add('active')
  }

  // Play buttons
  document.querySelectorAll('.play-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement
      const modeId = target.dataset.mode!
      if (modeId === 'flagged') {
        window.location.hash = '#date'
      } else {
        startGame(modeId, modeId === 'cyoa' ? selectedGenre : undefined)
      }
    })
  })

  // Reports button
  document.getElementById('btn-reports')?.addEventListener('click', () => {
    window.location.hash = '#reports'
  })

  // Home nav
  document.getElementById('nav-home')?.addEventListener('click', () => {
    window.location.hash = ''
  })
}

function renderGamePage(modeId: string): void {
  const mode = getMode(modeId)
  if (!mode) return

  const app = document.getElementById('app')!
  app.innerHTML = `
    ${renderHeader('game')}

    <main style="max-width: 720px; margin: 0 auto; padding: 1.5rem;">
      <div id="game-container">
        <div id="ui-elements">
          <div class="text-center" style="padding: 3rem 1rem; color: var(--text-muted);">
            <div style="width: 48px; height: 48px; margin: 0 auto 1rem; border-radius: 50%; background: rgba(13, 148, 136, 0.08); display: flex; align-items: center; justify-content: center; font-size: 28px;">
              &#x1F9E0;
            </div>
            <p class="text-base font-medium" style="color: var(--text-secondary); margin-bottom: 0.25rem;">
              Starting ${mode.name}
            </p>
            <p class="text-sm" style="color: var(--text-muted);">
              Preparing your assessment session...
            </p>
          </div>
        </div>

        <div id="loading" style="display: none;"></div>

        <div id="error-display" class="error-message" style="display: none;"></div>

        <div style="margin-top: 1.5rem; text-align: center;">
          <button id="submit-turn" class="geems-button" style="min-width: 200px;">
            Continue Session
          </button>
        </div>
      </div>
    </main>

    <footer class="site-footer">
      <p>&copy; ${new Date().getFullYear()} SuperPaul. All rights reserved.</p>
      <div style="margin-top: 0.75rem; display: flex; justify-content: center; gap: 1.5rem;">${renderThemeToggle()}</div>
    </footer>

    <div id="analysisModal" class="modal">
      <div class="modal-content">
        <span id="analysisModalClose" class="modal-close">&times;</span>
        <h2 class="text-lg font-semibold mb-4" style="color: var(--accent-primary);">Session Notes</h2>
        <div id="analysisModalBody" class="geems-text" style="max-height: 60vh; overflow-y: auto;">
          <p style="color: var(--text-muted);">No session data yet.</p>
        </div>
      </div>
    </div>
  `

  // Back button
  document.getElementById('btn-back-lobby')?.addEventListener('click', () => {
    if (gameLoop) {
      gameLoop.reset()
      gameLoop = null
    }
    if (playerBridge) {
      playerBridge.destroy()
      playerBridge = null
    }
    window.location.hash = ''
  })

  bindThemeToggle()


  // Reports button
  document.getElementById('btn-reports')?.addEventListener('click', () => {
    window.location.hash = '#reports'
  })

  // Modal close
  const modal = document.getElementById('analysisModal')!
  document.getElementById('analysisModalClose')?.addEventListener('click', () => {
    modal.classList.remove('active')
  })
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active')
  })

  // Trigger LLM-enhanced interstitial preload while game page renders (before first turn)
  preloadInterstitialImage(imageClient)
}

// --- Game Initialization ---

function startGame(modeId: string, genre?: string): void {
  renderGamePage(modeId)

  const mode = getMode(modeId)
  if (!mode) return

  // Apply the mode's custom visual theme (colors, fonts)
  applyModeTheme(mode.theme)

  const container = document.getElementById('ui-elements')!
  const loadingEl = document.getElementById('loading')!
  const errorEl = document.getElementById('error-display')!
  const submitBtn = document.getElementById('submit-turn')! as HTMLButtonElement

  // Use genre-specific prompt builder for CYOA, default for other modes
  const promptBuilder = (modeId === 'cyoa' && genre)
    ? createCYOAPromptBuilder(genre)
    : mode.promptBuilder

  const sessionId = createSessionId()

  gameLoop = new GameLoop({
    container,
    llmClient,
    imageClient,
    promptBuilder,
    genre,
    mode: modeId,
    userId,
    sessionId,
    onStateChange: (state) => {
      // Update modal content
      const modalBody = document.getElementById('analysisModalBody')
      if (modalBody && state.hiddenAnalysis) {
        modalBody.innerHTML = state.hiddenAnalysis
          .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\n/g, '<br>')
      }

      // Broadcast to admin lobby via PeerJS (include base64 images)
      if (playerBridge) {
        const images = gameLoop?.getCapturedImages() ?? {}
        playerBridge.broadcast({ type: 'stateUpdate', state, images })
      }
    },
    onError: (message) => {
      errorEl.textContent = message
      errorEl.style.display = 'block'
      setTimeout(() => { errorEl.style.display = 'none' }, 8000)
    },
    onLoading: (loading) => {
      loadingEl.style.display = loading ? 'block' : 'none'
      submitBtn.disabled = loading
      if (loading) {
        showInterstitial(imageClient)
      } else {
        dismissInterstitial()
      }
    },
  })

  // Submit button
  submitBtn.addEventListener('click', () => {
    if (gameLoop) gameLoop.submitTurn()
  })

  // Auto-start first turn
  gameLoop.submitTurn()

  // Create watchable channel so any admin/watcher can spy via PeerJS
  if (playerBridge) { playerBridge.destroy(); playerBridge = null }
  playerBridge = createWatchablePlayer({ mode: modeId, genre, userId, sessionId })

  // Real-time input broadcasting — send player's answers as they interact
  let inputDebounce: ReturnType<typeof setTimeout> | null = null
  container.addEventListener('input', () => {
    if (!playerBridge || !gameLoop) return
    if (inputDebounce) clearTimeout(inputDebounce)
    inputDebounce = setTimeout(() => {
      const state = gameLoop!.getState()
      const inputs = collectInputState(container, state.turnNumber + 1)
      playerBridge!.broadcast({ type: 'inputUpdate', inputs })
    }, 250)
  })
  container.addEventListener('change', () => {
    if (!playerBridge || !gameLoop) return
    if (inputDebounce) clearTimeout(inputDebounce)
    inputDebounce = setTimeout(() => {
      const state = gameLoop!.getState()
      const inputs = collectInputState(container, state.turnNumber + 1)
      playerBridge!.broadcast({ type: 'inputUpdate', inputs })
    }, 100)
  })
}

// --- Multiplayer Lobby & Game ---

function showMultiplayerLobby(): void {
  // Clear any mode-specific theme when returning to the multiplayer lobby
  clearModeTheme()

  // Clean up previous multiplayer state
  cleanupMultiplayer()

  const mode = getMode('flagged')
  if (!mode) return

  const app = document.getElementById('app')!

  // Load saved name/gender from localStorage
  const savedName = localStorage.getItem('geems-lobby-name') || ''
  const savedGender = localStorage.getItem('geems-lobby-gender') || ''

  app.innerHTML = `
    ${renderHeader('game')}

    <main style="max-width: 720px; margin: 0 auto; padding: 1.5rem;">
      <div class="text-center" style="margin-bottom: 2rem;">
        <h2 class="text-2xl font-bold" style="color: var(--text-heading); margin-bottom: 0.5rem;">
          ${mode.name}
        </h2>
        <p class="text-sm" style="color: var(--text-secondary); max-width: 480px; margin: 0 auto; line-height: 1.5;">
          Enter the lounge and find someone to go on a date with.
        </p>
      </div>

      <!-- Profile Setup (shown first) -->
      <div id="lobby-profile-setup" class="mode-card" style="max-width: 400px; margin: 0 auto 2rem;">
        <h3 class="text-lg font-bold" style="color: var(--text-heading); margin-bottom: 1rem;">
          Your Profile
        </h3>
        <div style="margin-bottom: 1rem;">
          <label class="geems-label" for="lobby-name" style="display: block; margin-bottom: 0.25rem;">Name</label>
          <input
            id="lobby-name"
            type="text"
            maxlength="20"
            placeholder="Enter your name"
            value="${savedName.replace(/"/g, '&quot;')}"
            autocomplete="off"
            style="
              width: 100%; box-sizing: border-box;
              padding: 0.625rem 0.75rem;
              border: 1px solid var(--border-color, #e2e8f0);
              border-radius: 0.5rem;
              background: var(--bg-secondary, #f8fafc);
              color: var(--text-heading);
              font-size: 1rem;
              outline: none;
            "
          />
        </div>
        <div style="margin-bottom: 1.25rem;">
          <label class="geems-label" style="display: block; margin-bottom: 0.5rem;">Gender</label>
          <div id="lobby-gender-options" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            ${['Male', 'Female', 'Non-binary', 'Other'].map(g => `
              <button class="lobby-gender-btn${savedGender === g ? ' active' : ''}" data-gender="${g}"
                style="
                  padding: 0.5rem 1rem; border-radius: 0.5rem; font-size: 0.875rem;
                  border: 1px solid var(--border-color, #e2e8f0);
                  background: ${savedGender === g ? 'var(--accent-primary)' : 'var(--bg-secondary, #f8fafc)'};
                  color: ${savedGender === g ? '#fff' : 'var(--text-secondary)'};
                  cursor: pointer; transition: all 0.15s;
                "
              >${g}</button>
            `).join('')}
          </div>
        </div>
        <button id="btn-enter-lobby" class="geems-button w-full" ${!savedName || !savedGender ? 'disabled' : ''}>
          Enter Lounge
        </button>
        <p id="lobby-setup-error" class="text-sm" style="color: #e11d48; display: none; margin-top: 0.75rem;"></p>
      </div>

      <!-- Player Grid (shown after profile setup) -->
      <div id="lobby-main" style="display: none;">
        <!-- Your status bar -->
        <div id="lobby-status-bar" style="
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.75rem 1rem; margin-bottom: 1.5rem; border-radius: 0.5rem;
          background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.2);
        ">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #22c55e; display: inline-block;"></span>
            <span class="text-sm" style="color: var(--text-secondary);">
              You: <strong id="lobby-your-name" style="color: var(--text-heading);"></strong>
              <span id="lobby-your-gender" class="text-xs" style="color: var(--text-muted); margin-left: 0.25rem;"></span>
            </span>
          </div>
          <span id="lobby-player-count" class="text-xs" style="color: var(--text-muted);">Looking for dates...</span>
        </div>

        <!-- Player Grid -->
        <div id="lobby-players" style="margin-bottom: 2rem;">
          <div class="text-center" style="padding: 2rem; color: var(--text-muted);">
            <p class="text-sm">Scanning the lounge...</p>
          </div>
        </div>

        <!-- Private Room: Create or Join by Code -->
        <div class="mode-card" style="margin-top: 1rem;">
          <div style="display: flex; gap: 0.75rem; margin-bottom: 0.75rem;">
            <button id="btn-create-private" class="geems-button" style="flex: 1; font-size: 0.875rem;">
              Create Private Room
            </button>
          </div>
          <!-- Room code display (hidden until created) -->
          <div id="private-room-display" style="display: none; text-align: center; padding: 1rem; border-radius: 0.75rem; background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.2);">
            <p class="text-xs" style="color: var(--text-muted); margin-bottom: 0.5rem;">Share this code with your date</p>
            <div id="private-room-code" style="
              font-family: 'Courier New', Courier, monospace;
              font-size: 2rem; font-weight: bold; letter-spacing: 0.3em;
              color: var(--text-heading); margin-bottom: 0.5rem;
            "></div>
            <button id="btn-copy-room-code" class="text-xs" style="
              background: none; border: 1px solid var(--border-color, #e2e8f0);
              border-radius: 0.375rem; padding: 0.25rem 0.75rem;
              color: var(--text-secondary); cursor: pointer;
            ">Copy code</button>
            <p class="text-xs" style="color: var(--text-muted); margin-top: 0.5rem;">Waiting for your date to join...</p>
          </div>
          <!-- Join by code -->
          <details>
            <summary style="cursor: pointer; font-size: 0.875rem; color: var(--text-muted);">
              Have a room code? Join directly
            </summary>
            <div style="display: flex; gap: 0.5rem; align-items: center; margin-top: 0.75rem;">
              <input
                id="join-code-input"
                type="text"
                maxlength="4"
                placeholder="CODE"
                autocomplete="off"
                spellcheck="false"
                style="
                  flex: 1; min-width: 0; box-sizing: border-box;
                  font-family: 'Courier New', Courier, monospace;
                  font-size: 1.25rem; font-weight: bold; text-align: center;
                  letter-spacing: 0.2em; text-transform: uppercase;
                  padding: 0.5rem 0.75rem;
                  border: 1px solid var(--border-color, #e2e8f0);
                  border-radius: 0.5rem;
                  background: var(--bg-secondary, #f8fafc);
                  color: var(--text-heading); outline: none;
                "
              />
              <button id="btn-join-code" class="geems-button" style="white-space: nowrap; flex-shrink: 0;">
                Join
              </button>
            </div>
            <p id="join-code-error" class="text-sm" style="color: #e11d48; display: none; margin-top: 0.5rem;"></p>
          </details>
        </div>
      </div>

      <!-- Date Request Notification (overlay) -->
      <div id="date-request-modal" style="
        display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.5); z-index: 1000;
        display: none; align-items: center; justify-content: center;
      ">
        <div style="
          background: var(--bg-primary, #fff); border-radius: 1rem; padding: 2rem;
          max-width: 360px; width: 90%; text-align: center;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        ">
          <div style="font-size: 3rem; margin-bottom: 1rem;">&#x1F496;</div>
          <h3 class="text-lg font-bold" style="color: var(--text-heading); margin-bottom: 0.5rem;">
            Date Request!
          </h3>
          <p id="date-request-message" class="text-sm" style="color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.5;"></p>
          <div style="display: flex; gap: 0.75rem; justify-content: center;">
            <button id="btn-accept-date" class="geems-button" style="min-width: 100px;">
              Accept
            </button>
            <button id="btn-decline-date" class="geems-button-outline" style="min-width: 100px; color: #e11d48; border-color: #e11d48;">
              Decline
            </button>
          </div>
        </div>
      </div>

      <p id="lobby-error" class="text-sm" style="color: #e11d48; display: none; margin-top: 0.75rem; text-align: center;"></p>
    </main>

    <footer class="site-footer">
      <p>&copy; ${new Date().getFullYear()} SuperPaul. All rights reserved.</p>
      <div style="margin-top: 0.75rem; display: flex; justify-content: center; gap: 1.5rem;">${renderThemeToggle()}</div>
    </footer>
  `

  bindThemeToggle()


  // Back button
  document.getElementById('btn-back-lobby')?.addEventListener('click', () => {
    cleanupMultiplayer()
    window.location.hash = ''
  })

  // Reports button
  document.getElementById('btn-reports')?.addEventListener('click', () => {
    window.location.hash = '#reports'
  })

  // Home nav
  document.getElementById('nav-home')?.addEventListener('click', () => {
    window.location.hash = ''
  })

  // --- Profile Setup ---
  let selectedGender = savedGender
  const nameInput = document.getElementById('lobby-name') as HTMLInputElement
  const enterBtn = document.getElementById('btn-enter-lobby') as HTMLButtonElement

  function updateEnterBtn(): void {
    const name = nameInput.value.trim()
    enterBtn.disabled = !name || !selectedGender
  }

  nameInput.addEventListener('input', updateEnterBtn)

  document.querySelectorAll('.lobby-gender-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement
      selectedGender = target.dataset.gender || ''
      document.querySelectorAll('.lobby-gender-btn').forEach(b => {
        const el = b as HTMLElement
        el.classList.remove('active')
        el.style.background = 'var(--bg-secondary, #f8fafc)'
        el.style.color = 'var(--text-secondary)'
      })
      target.classList.add('active')
      target.style.background = 'var(--accent-primary)'
      target.style.color = '#fff'
      updateEnterBtn()
    })
  })

  // --- Enter Lobby ---
  enterBtn.addEventListener('click', async () => {
    const name = nameInput.value.trim()
    if (!name || !selectedGender) return

    // Save to localStorage
    localStorage.setItem('geems-lobby-name', name)
    localStorage.setItem('geems-lobby-gender', selectedGender)

    enterBtn.disabled = true
    enterBtn.textContent = 'Connecting...'
    const setupError = document.getElementById('lobby-setup-error')!

    try {
      lobbyClient = new LobbyClient({
        onReady: () => {
          // Hide profile setup, show lobby
          document.getElementById('lobby-profile-setup')!.style.display = 'none'
          document.getElementById('lobby-main')!.style.display = 'block'
          document.getElementById('lobby-your-name')!.textContent = name
          document.getElementById('lobby-your-gender')!.textContent = `(${selectedGender})`
        },

        onPlayersChanged: (players: LobbyPlayer[]) => {
          renderPlayerGrid(players)
        },

        onDateRequest: (from: LobbyPlayer, respond: (accepted: boolean) => void) => {
          currentRespondFn = respond
          localStorage.setItem('geems-partner-name', from.name)
          const modal = document.getElementById('date-request-modal')!
          const msg = document.getElementById('date-request-message')!
          msg.innerHTML = `<strong>${escapeHtml(from.name)}</strong> (${escapeHtml(from.gender)}) wants to go on a date with you!`
          modal.style.display = 'flex'
        },

        onDateResponse: (accepted: boolean, partner: LobbyPlayer) => {
          if (accepted) {
            localStorage.setItem('geems-partner-name', partner.name)
            showLobbyStatus(`${partner.name} accepted! Setting up your date...`)
          } else {
            showLobbyStatus(`${partner.name} declined. Try someone else!`)
            // Re-enable all request buttons
            document.querySelectorAll('.lobby-request-btn').forEach(b => {
              (b as HTMLButtonElement).disabled = false
              ;(b as HTMLElement).textContent = 'Request Date'
            })
          }
        },

        onMatchReady: (roomCode: string, isHost: boolean) => {
          // Match is ready — transition to the game
          transitionToGame(isHost, roomCode)
        },

        onError: (message: string) => {
          showLobbyError(message)
        },
      })

      await lobbyClient.join(name, selectedGender, userId)
    } catch (err) {
      enterBtn.disabled = false
      enterBtn.textContent = 'Enter Lounge'
      setupError.textContent = err instanceof Error ? err.message : 'Failed to connect.'
      setupError.style.display = 'block'
    }
  })

  // Track respond function for currently displayed date request notification
  let currentRespondFn: ((accepted: boolean) => void) | null = null

  // --- Date Request Modal Buttons ---
  document.getElementById('btn-accept-date')?.addEventListener('click', () => {
    const modal = document.getElementById('date-request-modal')!
    modal.style.display = 'none'
    if (currentRespondFn) {
      currentRespondFn(true)
      currentRespondFn = null
      showLobbyStatus('Date accepted! Waiting for room setup...')
    }
  })

  document.getElementById('btn-decline-date')?.addEventListener('click', () => {
    const modal = document.getElementById('date-request-modal')!
    modal.style.display = 'none'
    if (currentRespondFn) {
      currentRespondFn(false)
      currentRespondFn = null
    }
  })

  // --- Fallback: Join by Code ---
  const joinInput = document.getElementById('join-code-input') as HTMLInputElement | null
  if (joinInput) {
    joinInput.addEventListener('input', () => {
      joinInput.value = joinInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)
    })
    joinInput.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') document.getElementById('btn-join-code')?.click()
    })
  }

  document.getElementById('btn-join-code')?.addEventListener('click', async () => {
    const code = joinInput?.value.trim() || ''
    const joinError = document.getElementById('join-code-error')!
    if (code.length !== 4) {
      joinError.textContent = 'Enter a 4-character room code.'
      joinError.style.display = 'block'
      return
    }
    joinError.style.display = 'none'
    transitionToGame(false, code)
  })

  // --- Create Private Room ---
  document.getElementById('btn-create-private')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-create-private') as HTMLButtonElement
    btn.disabled = true
    btn.textContent = 'Creating...'

    // transitionToGame as host with no lobby-based partner — just create the room and show code
    transitionToGame(true, undefined)
  })

  // Copy room code to clipboard
  document.getElementById('btn-copy-room-code')?.addEventListener('click', () => {
    const code = document.getElementById('private-room-code')?.textContent || ''
    if (code) {
      navigator.clipboard.writeText(code).then(() => {
        const btn = document.getElementById('btn-copy-room-code')!
        btn.textContent = 'Copied!'
        setTimeout(() => { btn.textContent = 'Copy code' }, 2000)
      }).catch(() => {})
    }
  })

  // --- Helper: Render Player Grid ---
  function renderPlayerGrid(players: LobbyPlayer[]): void {
    const container = document.getElementById('lobby-players')!
    const countEl = document.getElementById('lobby-player-count')!

    if (players.length === 0) {
      container.innerHTML = `
        <div class="text-center" style="padding: 2rem; color: var(--text-muted);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">&#x1F37B;</div>
          <p class="text-sm">No one else is in the lounge yet. Hang tight!</p>
        </div>
      `
      countEl.textContent = 'No one here yet'
      return
    }

    countEl.textContent = `${players.length} ${players.length === 1 ? 'person' : 'people'} in lounge`

    container.innerHTML = players.map(p => `
      <div class="mode-card" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; margin-bottom: 0.75rem;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="
            width: 40px; height: 40px; border-radius: 50%;
            background: var(--accent-primary); color: #fff;
            display: flex; align-items: center; justify-content: center;
            font-weight: bold; font-size: 1.1rem;
          ">${escapeHtml(p.name.charAt(0).toUpperCase())}</div>
          <div>
            <p class="text-sm font-bold" style="color: var(--text-heading);">${escapeHtml(p.name)}</p>
            <p class="text-xs" style="color: var(--text-muted);">${escapeHtml(p.gender)}</p>
          </div>
        </div>
        <button class="geems-button lobby-request-btn" data-peer-id="${escapeHtml(p.peerId)}" style="font-size: 0.8125rem; padding: 0.5rem 1rem;">
          Request Date
        </button>
      </div>
    `).join('')

    // Bind request buttons
    container.querySelectorAll('.lobby-request-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement
        const peerId = target.dataset.peerId!
        const player = players.find(p => p.peerId === peerId)
        if (!player || !lobbyClient) return

        // Disable all request buttons and show waiting state
        container.querySelectorAll('.lobby-request-btn').forEach(b => {
          (b as HTMLButtonElement).disabled = true
        })
        target.textContent = 'Waiting...'

        lobbyClient.requestDate(player)
      })
    })
  }

  // --- Helper: Transition to Game ---
  async function transitionToGame(isHost: boolean, _roomCode?: string): Promise<void> {
    showLobbyStatus('Starting your date...')

    // Keep reference to lobby client for sending room code
    const savedLobbyClient = lobbyClient

    if (isHost) {
      // Host: create a fresh room with proper game callbacks.
      // CRITICAL: wait for guest to connect before starting the game.
      try {
        roomHandle = await createRoom({
          onPartnerJoined: (_partnerId: string) => {
            // Partner connected — NOW start the multiplayer game
            startMultiplayerGame(true, (data: unknown) => {
              if (roomHandle) roomHandle.send(data)
            })
          },
          onPartnerLeft: () => {
            const errorEl = document.getElementById('mp-error-display')
            if (errorEl) {
              errorEl.textContent = 'Your date has disconnected.'
              errorEl.style.display = 'block'
            }
          },
          onPartnerData: (data: unknown) => {
            if (multiplayerLoop) {
              multiplayerLoop.handlePartnerData(data)
            } else {
              pendingPartnerMessages.push(data)
            }
          },
        })

        // Show room code in private room display
        const codeDisplay = document.getElementById('private-room-display')
        const codeEl = document.getElementById('private-room-code')
        if (codeDisplay && codeEl) {
          codeEl.textContent = roomHandle.code
          codeDisplay.style.display = 'block'
        }

        // Send room code to the partner via the lobby P2P connection
        if (savedLobbyClient) {
          savedLobbyClient.sendRoomCode(roomHandle.code)
        }

        // Brief delay to ensure room code is delivered before closing lobby connection
        await new Promise(r => setTimeout(r, 500))

        // Clean up lobby (but keep room handle alive)
        if (lobbyClient) { lobbyClient.destroy(); lobbyClient = null }

        showLobbyStatus('Waiting for your date to connect...')
      } catch (err) {
        showLobbyError(`Failed to create room: ${err instanceof Error ? err.message : String(err)}`)
      }
    } else {
      // Guest: join the room by code
      // Clean up lobby first
      if (lobbyClient) { lobbyClient.destroy(); lobbyClient = null }

      try {
        guestHandle = await joinRoom(_roomCode!, {
          onConnected: () => {
            // Game will start after joinRoom resolves (guestHandle must be set first)
          },
          onDisconnected: () => {
            const errorEl = document.getElementById('mp-error-display')
            if (errorEl) {
              errorEl.textContent = 'Your date has disconnected.'
              errorEl.style.display = 'block'
            }
          },
          onData: (data: unknown) => {
            if (multiplayerLoop) {
              multiplayerLoop.handlePartnerData(data)
            } else {
              pendingPartnerMessages.push(data)
            }
          },
        })

        // Start game AFTER guestHandle is set — starting inside onConnected
        // would race because guestHandle is null until joinRoom resolves.
        startMultiplayerGame(false, (data: unknown) => {
          if (guestHandle) guestHandle.send(data)
        })
      } catch (err) {
        showLobbyError(err instanceof Error ? err.message : 'Failed to join room.')
      }
    }
  }

  function showLobbyStatus(message: string): void {
    const countEl = document.getElementById('lobby-player-count')
    if (countEl) countEl.textContent = message
  }

  function showLobbyError(message: string): void {
    const el = document.getElementById('lobby-error')!
    el.textContent = message
    el.style.display = 'block'
    setTimeout(() => { el.style.display = 'none' }, 6000)
  }
}

function startMultiplayerGame(isPlayer1: boolean, sendFn: (data: unknown) => void): void {
  const mode = getMode('flagged')
  if (!mode) return

  // Apply the mode's custom visual theme (colors, fonts)
  applyModeTheme(mode.theme)

  const app = document.getElementById('app')!

  app.innerHTML = `
    ${renderHeader('game')}

    <main style="max-width: 720px; margin: 0 auto; padding: 1.5rem;">
      <!-- Partner status indicator -->
      <div id="partner-status" style="
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        margin-bottom: 1rem;
        border-radius: 0.5rem;
        background: rgba(34, 197, 94, 0.08);
        border: 1px solid rgba(34, 197, 94, 0.2);
      ">
        <span id="partner-status-dot" style="
          width: 8px; height: 8px; border-radius: 50%;
          background: #22c55e; display: inline-block;
        "></span>
        <span class="text-sm" style="color: var(--text-secondary);">
          Your Date &mdash; <span id="partner-status-text" style="color: #22c55e;">Connected</span>
        </span>
        <span class="text-xs" style="color: var(--text-muted); margin-left: 0.5rem;">
          (${isPlayer1 ? 'Host' : 'Guest'})
        </span>
      </div>

      <div id="game-container">
        <div id="ui-elements">
          <div class="text-center" style="padding: 3rem 1rem; color: var(--text-muted);">
            <div style="width: 48px; height: 48px; margin: 0 auto 1rem; border-radius: 50%; background: rgba(249, 168, 212, 0.12); display: flex; align-items: center; justify-content: center; font-size: 28px;">
              &#x1F496;
            </div>
            <p class="text-base font-medium" style="color: var(--text-secondary); margin-bottom: 0.25rem;">
              Starting your ${mode.name}...
            </p>
            <p class="text-sm" style="color: var(--text-muted);">
              The matchmaker is setting the scene.
            </p>
          </div>
        </div>

        <div id="loading" style="display: none;"></div>

        <div id="mp-error-display" class="error-message" style="display: none;"></div>

        <div style="margin-top: 1.5rem; text-align: center;">
          <button id="mp-submit-turn" class="geems-button" style="min-width: 200px;">
            Submit
          </button>
        </div>
      </div>

      <!-- Flags Analysis Panel -->
      <div id="flags-panel" style="margin-top: 2rem;">
        <h3 class="text-base font-bold" style="color: var(--text-heading); margin-bottom: 1rem; text-align: center;">
          Matchmaker's Assessment
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Green Flags -->
          <div class="mode-card" id="green-flags-card" style="border-left: 3px solid #22c55e;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
              <span style="font-size: 1.25rem;">&#x1F7E2;</span>
              <h4 class="text-sm font-bold" style="color: #22c55e;">Green Flags</h4>
            </div>
            <div id="green-flags-content" class="text-sm" style="color: var(--text-secondary); line-height: 1.6;">
              <p style="color: var(--text-muted); font-style: italic;">No flags yet. Keep dating!</p>
            </div>
          </div>

          <!-- Red Flags -->
          <div class="mode-card" id="red-flags-card" style="border-left: 3px solid #e11d48;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
              <span style="font-size: 1.25rem;">&#x1F534;</span>
              <h4 class="text-sm font-bold" style="color: #e11d48;">Red Flags</h4>
            </div>
            <div id="red-flags-content" class="text-sm" style="color: var(--text-secondary); line-height: 1.6;">
              <p style="color: var(--text-muted); font-style: italic;">No flags yet. Keep dating!</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="site-footer">
      <p>&copy; ${new Date().getFullYear()} SuperPaul. All rights reserved.</p>
      <div style="margin-top: 0.75rem; display: flex; justify-content: center; gap: 1.5rem;">${renderThemeToggle()}</div>
    </footer>
  `

  bindThemeToggle()


  // Back button
  document.getElementById('btn-back-lobby')?.addEventListener('click', () => {
    cleanupMultiplayer()
    window.location.hash = ''
  })

  // Reports button
  document.getElementById('btn-reports')?.addEventListener('click', () => {
    window.location.hash = '#reports'
  })

  // Home nav
  document.getElementById('nav-home')?.addEventListener('click', () => {
    window.location.hash = ''
  })

  const container = document.getElementById('ui-elements')!
  const loadingEl = document.getElementById('loading')!
  const errorEl = document.getElementById('mp-error-display')!
  const submitBtn = document.getElementById('mp-submit-turn')! as HTMLButtonElement

  // Get player names for personalized prompts
  const myName = localStorage.getItem('geems-lobby-name') || (isPlayer1 ? 'Player A' : 'Player B')
  const partnerName = localStorage.getItem('geems-partner-name') || (isPlayer1 ? 'Player B' : 'Player A')
  const nameA = isPlayer1 ? myName : partnerName
  const nameB = isPlayer1 ? partnerName : myName
  const promptBuilder = createFlaggedPromptBuilder(nameA, nameB)
  const sessionId = createSessionId()

  multiplayerLoop = new MultiplayerGameLoop({
    container,
    llmClient,
    imageClient,
    promptBuilder,
    isPlayer1,
    userId,
    sessionId,
    sendToPartner: sendFn,
    onStateChange: (_state) => {
      // Could broadcast to admin lobby here if needed
    },
    onError: (message: string) => {
      errorEl.textContent = message
      errorEl.style.display = 'block'
      setTimeout(() => { errorEl.style.display = 'none' }, 8000)
    },
    onLoading: (loading: boolean) => {
      loadingEl.style.display = loading ? 'block' : 'none'
      submitBtn.disabled = loading
      if (loading) {
        submitBtn.textContent = 'Waiting...'
        showInterstitial(imageClient)
      } else {
        submitBtn.textContent = 'Submit'
        dismissInterstitial()
      }
    },
    onWaitingStatus: (message: string) => {
      // Update the interstitial overlay status text if it's showing
      updateInterstitialStatus(message)
      // Also update the partner status bar for "partner waiting" notifications
      const statusText = document.getElementById('partner-status-text')
      if (message === 'Your date is waiting for you...') {
        if (statusText) {
          statusText.textContent = 'Waiting for you'
          statusText.style.color = '#f59e0b'
        }
        const dot = document.getElementById('partner-status-dot')
        if (dot) dot.style.background = '#f59e0b'
      }
    },
    onAnalysis: (analysis: AnalysisData) => {
      const greenContent = document.getElementById('green-flags-content')
      const redContent = document.getElementById('red-flags-content')

      const formatFlags = (raw: string) => raw
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^- (.*)/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul style="list-style: none; padding: 0; margin: 0;">$1</ul>')
        .replace(/\n/g, '<br>')

      if (greenContent) {
        greenContent.innerHTML = analysis.greenFlags
          ? formatFlags(analysis.greenFlags)
          : '<p style="color: var(--text-muted); font-style: italic;">No flags yet. Keep dating!</p>'
      }

      if (redContent) {
        redContent.innerHTML = analysis.redFlags
          ? formatFlags(analysis.redFlags)
          : '<p style="color: var(--text-muted); font-style: italic;">No flags yet. Keep dating!</p>'
      }
    },
  })

  // Submit button
  submitBtn.addEventListener('click', () => {
    if (multiplayerLoop) multiplayerLoop.submitMyActions()
  })

  // Replay any messages that arrived before the loop was created
  if (pendingPartnerMessages.length > 0) {
    const buffered = pendingPartnerMessages.splice(0)
    for (const msg of buffered) {
      multiplayerLoop.handlePartnerData(msg)
    }
  }

  // Run scenario selection phase, then start the first turn
  multiplayerLoop.startScenarioSelection().then(() => {
    multiplayerLoop?.startFirstTurn()
  })
}

// --- Hash-based Routing ---

/** Tear down any active multiplayer state. */
function cleanupMultiplayer(): void {
  pendingPartnerMessages = []
  if (multiplayerLoop) { multiplayerLoop.reset(); multiplayerLoop = null }
  if (roomHandle) { roomHandle.destroy(); roomHandle = null }
  if (guestHandle) { guestHandle.destroy(); guestHandle = null }
  if (lobbyClient) { lobbyClient.destroy(); lobbyClient = null }
}

function handleRoute(): void {
  const hash = window.location.hash

  if (hash === '#reports') {
    cleanupMultiplayer()
    clearModeTheme()
    const app = document.getElementById('app')!
    renderReportsPage(app, userId, llmClient, () => {
      window.location.hash = ''
    })
  } else if (hash === '#admin') {
    if (gameLoop) { gameLoop.reset(); gameLoop = null }
    if (playerBridge) { playerBridge.destroy(); playerBridge = null }
    cleanupMultiplayer()
    clearModeTheme()

    const app = document.getElementById('app')!
    renderAdminPage(app, () => {
      window.location.hash = ''
    })
  } else if (hash === '#date') {
    if (gameLoop) { gameLoop.reset(); gameLoop = null }
    if (playerBridge) { playerBridge.destroy(); playerBridge = null }
    showMultiplayerLobby()
  } else if (hash.startsWith('#play/')) {
    cleanupMultiplayer()
    const parts = hash.replace('#play/', '').split('/')
    const modeId = parts[0]
    const genre = parts[1] || undefined
    if (getMode(modeId)) {
      startGame(modeId, genre)
    } else {

      renderLobby()
    }
  } else {
    if (gameLoop) {
      gameLoop.reset()
      gameLoop = null
    }
    if (playerBridge) {
      playerBridge.destroy()
      playerBridge = null
    }
    cleanupMultiplayer()

    renderLobby()
  }
}

// --- Utilities ---

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// --- Boot ---

async function boot(): Promise<void> {
  initTheme()
  await showConsentIfNeeded()
  userId = getUserId()

  // Start preloading an interstitial image ASAP with a fallback prompt (no LLM call)
  preloadInterstitialImageEarly(imageClient)

  // Show re-engagement interstitial if returning after 30+ minutes
  const app = document.getElementById('app')!
  await showReEngagement(app)

  window.addEventListener('hashchange', handleRoute)
  handleRoute()
}

boot()
