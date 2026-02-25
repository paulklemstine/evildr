import { LLMClient } from './api/llm-client'
import { ImageClient } from './api/image-client'
import { GameLoop } from './engine/game-loop'
import { getModes, getMode } from './modes/mode-registry'
import type { ThemeConfig } from './modes/mode-registry'
import { createCYOAPromptBuilder } from './modes/cyoa/prompts'
import { getUserId, createSessionId } from './identity/user-id'
import { showConsentIfNeeded } from './identity/consent-banner'
import { showReEngagement } from './engine/session-hooks'
import { showInterstitial, dismissInterstitial } from './engine/loading-interstitial'
import { renderReportsPage } from './pages/reports'
import './style.css'

// --- Global State ---
let gameLoop: GameLoop | null = null
let userId: string = ''

// --- API Clients ---
// No API keys in client code — auth is injected server-side by the proxy
const llmClient = new LLMClient()
const imageClient = new ImageClient()

// --- Theme Application ---

function applyTheme(theme: ThemeConfig): void {
  const root = document.documentElement
  root.style.setProperty('--bg-primary', theme.bgPrimary)
  root.style.setProperty('--bg-secondary', theme.bgSecondary)
  root.style.setProperty('--bg-tertiary', theme.bgSecondary)
  root.style.setProperty('--bg-input', theme.bgPrimary)
  root.style.setProperty('--text-primary', theme.textPrimary)
  root.style.setProperty('--text-secondary', theme.textPrimary)
  root.style.setProperty('--text-heading', theme.textPrimary)
  root.style.setProperty('--text-muted', theme.textPrimary + '99')
  root.style.setProperty('--accent-primary', theme.accentPrimary)
  root.style.setProperty('--accent-secondary', theme.accentSecondary)
  root.style.setProperty('--border-color', theme.accentPrimary + '33')
  root.style.setProperty('--border-accent', theme.accentPrimary)
  root.style.setProperty('--font-heading', theme.fontHeading)
  root.style.setProperty('--font-body', theme.fontBody)
  root.style.setProperty('--slider-thumb-color', theme.accentPrimary)
  root.style.setProperty('--toggle-hover-color', theme.accentPrimary)
}

const THEME_PROPS = [
  '--bg-primary', '--bg-secondary', '--bg-tertiary', '--bg-input',
  '--text-primary', '--text-secondary', '--text-heading', '--text-muted',
  '--accent-primary', '--accent-secondary',
  '--border-color', '--border-accent',
  '--font-heading', '--font-body',
  '--slider-thumb-color', '--toggle-hover-color',
]

function resetTheme(): void {
  THEME_PROPS.forEach(p => document.documentElement.style.removeProperty(p))
}

// --- Page Rendering ---

function renderHeader(activePage: string): string {
  return `
    <header class="site-header">
      <div class="site-header-inner">
        <div class="flex items-center gap-3 cursor-pointer" id="nav-home">
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
        ${modes.map(mode => `
          <div class="mode-card" data-mode="${mode.id}">
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
        `).join('')}
      </div>
    </main>

    <footer class="site-footer">
      <p>&copy; ${new Date().getFullYear()} SuperPaul. All rights reserved.</p>
      <p style="margin-top: 0.25rem;">For research and entertainment purposes only.</p>
    </footer>
  `

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
            <div style="width: 48px; height: 48px; margin: 0 auto 1rem; border-radius: 50%; background: rgba(13, 148, 136, 0.08); display: flex; align-items: center; justify-content: center;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
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
    resetTheme()
    window.location.hash = ''
  })

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

  // Apply mode-specific theme
  applyTheme(mode.theme)

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
      // No turn counter — removing temporal cues maximizes flow state
      // Update modal content
      const modalBody = document.getElementById('analysisModalBody')
      if (modalBody && state.hiddenAnalysis) {
        modalBody.innerHTML = state.hiddenAnalysis
          .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\n/g, '<br>')
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
}

// --- Hash-based Routing ---

function handleRoute(): void {
  const hash = window.location.hash

  if (hash === '#reports') {
    const app = document.getElementById('app')!
    renderReportsPage(app, userId, llmClient, () => {
      window.location.hash = ''
    })
  } else {
    if (gameLoop) {
      gameLoop.reset()
      gameLoop = null
    }
    resetTheme()
    renderLobby()
  }
}

// --- Boot ---

async function boot(): Promise<void> {
  await showConsentIfNeeded()
  userId = getUserId()

  // Show re-engagement interstitial if returning after 30+ minutes
  const app = document.getElementById('app')!
  await showReEngagement(app)

  window.addEventListener('hashchange', handleRoute)
  handleRoute()
}

boot()
