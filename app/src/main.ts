import { LLMClient } from './api/llm-client'
import { ImageClient } from './api/image-client'
import { GameLoop } from './engine/game-loop'
import { getModes, getMode } from './modes/mode-registry'
import { createCYOAPromptBuilder } from './modes/cyoa/prompts'
import { getUserId, createSessionId } from './identity/user-id'
import { showConsentIfNeeded } from './identity/consent-banner'
import { showReEngagement } from './engine/session-hooks'
import { showInterstitial, dismissInterstitial, preloadInterstitialImage } from './engine/loading-interstitial'
import { renderReportsPage } from './pages/reports'
import { renderAdminPage } from './pages/admin'
import { createPlayerBridge } from './admin/live-bridge'
import type { PlayerBridge } from './admin/live-bridge'
import './style.css'

// --- Mode card image prompts ---
const MODE_IMAGE_PROMPTS: Record<string, string> = {
  drevil: 'A retro-futuristic mad scientist laboratory with neon green glowing tubes, colorful control panels, and a spinning chair facing wall of monitors, adult cartoon style, dramatic cinematic lighting, vibrant colors',
  geems: 'An epic cinematic adventure scene with a hero silhouette standing at the edge of a glowing cliff overlooking a vast magical landscape with floating islands, vibrant adult animated movie style, dramatic golden hour lighting',
  cyoa: 'A mystical crossroads in an enchanted forest with three branching paths lit by different colored magical lights, ancient stone markers, fireflies, painterly fantasy art style, dramatic atmosphere',
  oracle: 'A mystical oracle chamber with swirling cosmic purple and gold energy, a crystal sphere floating above an ancient stone pedestal, celestial symbols and constellations reflected on dark marble walls, ethereal divine lighting',
  skinwalker: 'A seemingly normal suburban kitchen at twilight but something is subtly wrong, the shadows fall in the wrong direction, a family photo on the wall has too many people in it, muted desaturated colors, uncanny horror atmosphere',
  'fever-dream': 'A surreal dreamscape where a grand piano made of clouds floats above a neon pink ocean, melting clocks drip from impossible architecture, vibrant psychedelic colors, electric cyan sky, whimsical surrealist art style',
}

// --- Global State ---
let gameLoop: GameLoop | null = null
let playerBridge: PlayerBridge | null = null
let userId: string = ''

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
          const imgPrompt = MODE_IMAGE_PROMPTS[mode.id] || ''
          const imgUrl = imgPrompt ? imageClient.getImageUrl(imgPrompt, { width: 512, height: 288 }) : ''
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
                ${['Horror', 'Sci-Fi', 'Fantasy', 'Noir', 'Comedy', 'Post-Apocalyptic', 'Sexy', '18+'].map(g => `
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
      <div style="margin-top: 0.75rem;">${renderThemeToggle()}</div>
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
      startGame(modeId, modeId === 'cyoa' ? selectedGenre : undefined)
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
      <div style="margin-top: 0.75rem;">${renderThemeToggle()}</div>
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
}

// --- Game Initialization ---

function startGame(modeId: string, genre?: string): void {
  renderGamePage(modeId)

  const mode = getMode(modeId)
  if (!mode) return

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

  // Connect to admin lobby via PeerJS (non-blocking, silent fail)
  if (playerBridge) { playerBridge.destroy(); playerBridge = null }
  playerBridge = createPlayerBridge({ mode: modeId, genre, userId, sessionId })
}

// --- Hash-based Routing ---

function handleRoute(): void {
  const hash = window.location.hash

  if (hash === '#reports') {
    const app = document.getElementById('app')!
    renderReportsPage(app, userId, llmClient, () => {
      window.location.hash = ''
    })
  } else if (hash === '#admin') {
    if (gameLoop) { gameLoop.reset(); gameLoop = null }
    if (playerBridge) { playerBridge.destroy(); playerBridge = null }

    const app = document.getElementById('app')!
    renderAdminPage(app, () => {
      window.location.hash = ''
    })
  } else if (hash.startsWith('#play/')) {
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

    renderLobby()
  }
}

// --- Boot ---

async function boot(): Promise<void> {
  initTheme()
  await showConsentIfNeeded()
  userId = getUserId()

  // Show re-engagement interstitial if returning after 30+ minutes
  const app = document.getElementById('app')!
  await showReEngagement(app)

  window.addEventListener('hashchange', handleRoute)
  handleRoute()
}

boot()
