// Persistent user identity via cookie + localStorage fallback

const COOKIE_NAME = 'geems_uid'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 2 // 2 years in seconds

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function setCookie(name: string, value: string, maxAge: number): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`
}

/**
 * Returns a persistent user ID. Creates one if none exists.
 * Uses cookie as primary store, localStorage as fallback.
 */
export function getUserId(): string {
  // Try cookie first
  let uid = getCookie(COOKIE_NAME)
  if (uid) {
    // Sync to localStorage
    try { localStorage.setItem(COOKIE_NAME, uid) } catch { /* noop */ }
    return uid
  }

  // Try localStorage fallback
  try {
    uid = localStorage.getItem(COOKIE_NAME)
    if (uid) {
      setCookie(COOKIE_NAME, uid, COOKIE_MAX_AGE)
      return uid
    }
  } catch { /* noop */ }

  // Generate new
  uid = crypto.randomUUID()
  setCookie(COOKIE_NAME, uid, COOKIE_MAX_AGE)
  try { localStorage.setItem(COOKIE_NAME, uid) } catch { /* noop */ }
  return uid
}

/**
 * Generates a unique session ID for the current game session.
 */
export function createSessionId(): string {
  return crypto.randomUUID()
}
