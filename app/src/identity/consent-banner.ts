// Consent banner — shown once before any tracking begins

const CONSENT_KEY = 'geems_consent'

export function hasConsented(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === 'yes'
  } catch {
    return false
  }
}

function setConsent(value: boolean): void {
  try {
    localStorage.setItem(CONSENT_KEY, value ? 'yes' : 'no')
  } catch { /* noop */ }
}

/**
 * Shows the consent banner and resolves when the user accepts.
 * If already consented, resolves immediately.
 */
export function showConsentIfNeeded(): Promise<boolean> {
  if (hasConsented()) return Promise.resolve(true)

  return new Promise((resolve) => {
    const overlay = document.createElement('div')
    overlay.className = 'consent-overlay'
    overlay.innerHTML = `
      <div class="consent-card">
        <div class="consent-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <h2 class="consent-title">Welcome to GEEMS</h2>
        <p class="consent-text">
          This platform uses cookies and local storage to save your session progress
          and generate personalized wellness insights. Your data stays on your device.
        </p>
        <p class="consent-text consent-text-small">
          By continuing, you agree to our use of cookies and local data storage
          for session tracking and analysis.
        </p>
        <div class="consent-actions">
          <button class="geems-button consent-accept">Continue</button>
        </div>
      </div>
    `

    document.body.appendChild(overlay)

    overlay.querySelector('.consent-accept')!.addEventListener('click', () => {
      setConsent(true)
      overlay.remove()
      resolve(true)
    })
  })
}
