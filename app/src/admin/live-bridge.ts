// Live bridge — PeerJS watch channels for real-time session spying
//
// Architecture (v2 — multi-admin):
//   Player creates a well-known peer: geems-watch-{sessionId}
//   Player accepts incoming connections from ANY watcher (admin or user)
//   Player broadcasts state updates + live input changes to ALL connected watchers
//   Multiple admins (or future paying users) can watch the same player simultaneously
//   Discovery: watchers find active sessions via the reports API (Cloudflare KV)

declare const Peer: any

const WATCH_PREFIX = 'geems-watch-'
const RETRY_INTERVAL = 8000

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PlayerMeta {
  mode: string
  genre?: string
  userId: string
  sessionId: string
}

export interface PlayerBridge {
  broadcast(data: unknown): void
  destroy(): void
}

export interface WatchConnection {
  destroy(): void
}

// ---------------------------------------------------------------------------
// Player side — create a watchable channel that any admin can connect to
// ---------------------------------------------------------------------------

export function createWatchablePlayer(meta: PlayerMeta): PlayerBridge {
  if (typeof Peer === 'undefined') {
    return { broadcast() {}, destroy() {} }
  }

  const watchId = `${WATCH_PREFIX}${meta.sessionId}`
  let peer: any = null
  const watchers = new Map<string, any>()
  let destroyed = false
  let retryTimer: ReturnType<typeof setTimeout> | null = null
  let latestState: unknown = null
  let latestInputs: unknown = null

  function init() {
    if (destroyed) return
    try { if (peer && !peer.destroyed) peer.destroy() } catch {}

    peer = new Peer(watchId, { debug: 0 })

    peer.on('open', () => {
      // Ready to accept watchers
    })

    peer.on('connection', (conn: any) => {
      conn.on('open', () => {
        if (destroyed) { try { conn.close() } catch {}; return }
        watchers.set(conn.peer, conn)
        // Send current state + inputs to new watcher immediately
        if (latestState) { try { conn.send(latestState) } catch {} }
        if (latestInputs) { try { conn.send(latestInputs) } catch {} }
      })

      conn.on('close', () => watchers.delete(conn.peer))
      conn.on('error', () => watchers.delete(conn.peer))
    })

    peer.on('error', (err: any) => {
      // If the ID is taken (unlikely — sessionId is unique), retry with delay
      if (err.type === 'unavailable-id') {
        scheduleRetry()
      }
    })

    peer.on('disconnected', () => {
      if (!destroyed) scheduleRetry()
    })
  }

  function scheduleRetry() {
    if (destroyed || retryTimer) return
    retryTimer = setTimeout(() => { retryTimer = null; init() }, RETRY_INTERVAL)
  }

  function broadcastToAll(data: unknown) {
    for (const [id, conn] of watchers) {
      if (conn.open) {
        try { conn.send(data) } catch { watchers.delete(id) }
      }
    }
  }

  init()

  return {
    broadcast(data: unknown) {
      const record = data as Record<string, unknown> | null
      if (record?.type === 'inputUpdate') {
        latestInputs = data
      } else {
        latestState = data
      }
      broadcastToAll(data)
    },
    destroy() {
      destroyed = true
      if (retryTimer) { clearTimeout(retryTimer); retryTimer = null }
      watchers.forEach(c => { try { c.close() } catch {} })
      watchers.clear()
      try { peer?.destroy() } catch {}
      peer = null
    },
  }
}

// ---------------------------------------------------------------------------
// Watcher side — connect to a specific player's watch channel
// ---------------------------------------------------------------------------

export function connectToPlayerWatch(
  sessionId: string,
  callbacks: {
    onData: (data: unknown) => void
    onDisconnect: () => void
  },
): WatchConnection {
  const targetId = `${WATCH_PREFIX}${sessionId}`
  let peer: any = null
  let conn: any = null
  let destroyed = false

  if (typeof Peer === 'undefined') {
    return { destroy() {} }
  }

  peer = new Peer(undefined, { debug: 0 })

  peer.on('open', () => {
    if (destroyed) return
    try {
      conn = peer.connect(targetId, { reliable: true })
    } catch {
      if (!destroyed) callbacks.onDisconnect()
      return
    }

    conn.on('open', () => {
      if (destroyed) { try { conn.close() } catch {}; return }
    })

    conn.on('data', (data: any) => {
      if (!destroyed) callbacks.onData(data)
    })

    conn.on('close', () => {
      conn = null
      if (!destroyed) callbacks.onDisconnect()
    })

    conn.on('error', () => {
      conn = null
      if (!destroyed) callbacks.onDisconnect()
    })
  })

  peer.on('error', () => {
    if (!destroyed) callbacks.onDisconnect()
  })

  return {
    destroy() {
      destroyed = true
      try { conn?.close() } catch {}
      try { peer?.destroy() } catch {}
      conn = null
      peer = null
    },
  }
}
