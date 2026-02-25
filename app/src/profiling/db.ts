// IndexedDB wrapper for profiling data (turns, sessions, analyses)

const DB_NAME = 'geems_profiling'
const DB_VERSION = 1

export interface TurnRecord {
  id?: number
  userId: string
  sessionId: string
  turnNumber: number
  timestamp: number
  mode: string
  /** Raw player inputs as JSON string */
  playerInputs: string
  /** UI elements shown to the player (JSON string, summarized) */
  uiShown: string
  /** Behavioral signals: timing, hesitation, revisions */
  signals: BehavioralSignals
}

export interface BehavioralSignals {
  /** Time in ms from page render to submit click */
  responseTimeMs: number
  /** Number of times slider values were changed before submit */
  sliderRevisions: number
  /** Number of times text was deleted and retyped */
  textRevisions: number
  /** Character count of all textfield inputs combined */
  totalTextLength: number
  /** Which radio option was selected (index, 0-based) */
  radioChoiceIndex: number
  /** How many checkboxes were checked vs total */
  checkboxRatio: string
}

export interface SessionRecord {
  id?: number
  sessionId: string
  userId: string
  mode: string
  genre?: string
  startedAt: number
  endedAt?: number
  turnCount: number
}

export interface AnalysisRecord {
  id?: number
  userId: string
  sessionId: string
  analyzedAt: number
  turnRange: string
  /** Raw LLM analysis output */
  analysisText: string
  /** Structured profile data if parseable */
  profileData?: string
}

let dbInstance: IDBDatabase | null = null

function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance)

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result

      if (!db.objectStoreNames.contains('turns')) {
        const turnStore = db.createObjectStore('turns', { keyPath: 'id', autoIncrement: true })
        turnStore.createIndex('by_session', 'sessionId', { unique: false })
        turnStore.createIndex('by_user', 'userId', { unique: false })
      }

      if (!db.objectStoreNames.contains('sessions')) {
        const sessionStore = db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true })
        sessionStore.createIndex('by_session_id', 'sessionId', { unique: true })
        sessionStore.createIndex('by_user', 'userId', { unique: false })
      }

      if (!db.objectStoreNames.contains('analyses')) {
        const analysisStore = db.createObjectStore('analyses', { keyPath: 'id', autoIncrement: true })
        analysisStore.createIndex('by_session', 'sessionId', { unique: false })
        analysisStore.createIndex('by_user', 'userId', { unique: false })
      }
    }

    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }

    request.onerror = () => {
      reject(new Error(`IndexedDB open failed: ${request.error?.message}`))
    }
  })
}

// --- CRUD Operations ---

export async function saveTurn(record: TurnRecord): Promise<number> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('turns', 'readwrite')
    const store = tx.objectStore('turns')
    const req = store.add(record)
    req.onsuccess = () => resolve(req.result as number)
    req.onerror = () => reject(req.error)
  })
}

export async function getTurnsBySession(sessionId: string): Promise<TurnRecord[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('turns', 'readonly')
    const store = tx.objectStore('turns')
    const index = store.index('by_session')
    const req = index.getAll(sessionId)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function getTurnsByUser(userId: string): Promise<TurnRecord[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('turns', 'readonly')
    const store = tx.objectStore('turns')
    const index = store.index('by_user')
    const req = index.getAll(userId)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveSession(record: SessionRecord): Promise<number> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sessions', 'readwrite')
    const store = tx.objectStore('sessions')
    const req = store.add(record)
    req.onsuccess = () => resolve(req.result as number)
    req.onerror = () => reject(req.error)
  })
}

export async function updateSession(sessionId: string, updates: Partial<SessionRecord>): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sessions', 'readwrite')
    const store = tx.objectStore('sessions')
    const index = store.index('by_session_id')
    const getReq = index.get(sessionId)
    getReq.onsuccess = () => {
      if (getReq.result) {
        const updated = { ...getReq.result, ...updates }
        const putReq = store.put(updated)
        putReq.onsuccess = () => resolve()
        putReq.onerror = () => reject(putReq.error)
      } else {
        resolve() // no session found, skip
      }
    }
    getReq.onerror = () => reject(getReq.error)
  })
}

export async function getSessionsByUser(userId: string): Promise<SessionRecord[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sessions', 'readonly')
    const store = tx.objectStore('sessions')
    const index = store.index('by_user')
    const req = index.getAll(userId)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveAnalysis(record: AnalysisRecord): Promise<number> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('analyses', 'readwrite')
    const store = tx.objectStore('analyses')
    const req = store.add(record)
    req.onsuccess = () => resolve(req.result as number)
    req.onerror = () => reject(req.error)
  })
}

export async function getAnalysesBySession(sessionId: string): Promise<AnalysisRecord[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('analyses', 'readonly')
    const store = tx.objectStore('analyses')
    const index = store.index('by_session')
    const req = index.getAll(sessionId)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

/** Delete a session and all its associated turns and analyses. */
export async function deleteSession(sessionId: string): Promise<void> {
  const db = await openDB()

  // Delete turns for this session
  const turns = await getTurnsBySession(sessionId)
  if (turns.length > 0) {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('turns', 'readwrite')
      const store = tx.objectStore('turns')
      for (const turn of turns) {
        if (turn.id !== undefined) store.delete(turn.id)
      }
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  // Delete analyses for this session
  const analyses = await getAnalysesBySession(sessionId)
  if (analyses.length > 0) {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('analyses', 'readwrite')
      const store = tx.objectStore('analyses')
      for (const analysis of analyses) {
        if (analysis.id !== undefined) store.delete(analysis.id)
      }
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  // Delete the session record itself
  // Delete the session record by looking it up via the sessionId index
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('sessions', 'readwrite')
    const store = tx.objectStore('sessions')
    const index = store.index('by_session_id')
    const getReq = index.get(sessionId)
    getReq.onsuccess = () => {
      if (getReq.result?.id !== undefined) {
        const delReq = store.delete(getReq.result.id)
        delReq.onsuccess = () => resolve()
        delReq.onerror = () => reject(delReq.error)
      } else {
        resolve()
      }
    }
    getReq.onerror = () => reject(getReq.error)
  })
}

/** Delete ALL data for a user (sessions, turns, analyses). */
export async function deleteAllUserData(userId: string): Promise<void> {
  const sessions = await getSessionsByUser(userId)
  for (const session of sessions) {
    await deleteSession(session.sessionId)
  }
}

export async function getAnalysesByUser(userId: string): Promise<AnalysisRecord[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('analyses', 'readonly')
    const store = tx.objectStore('analyses')
    const index = store.index('by_user')
    const req = index.getAll(userId)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}
