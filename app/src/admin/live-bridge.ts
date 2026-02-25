// Live bridge — PeerJS lobby for admin to spy on all active players
// Players auto-connect to a well-known lobby peer. Admin claims it.

declare const Peer: any

const LOBBY_ID = 'geems-lobby'
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

export interface PlayerInfo extends PlayerMeta {
  peerId: string
  turnNumber: number
  connectedAt: number
}

export interface PlayerBridge {
  broadcast(data: unknown): void
  destroy(): void
}

export interface AdminLobby {
  destroy(): void
}

// ---------------------------------------------------------------------------
// Player side — connect to lobby and broadcast state updates
// ---------------------------------------------------------------------------

export function createPlayerBridge(meta: PlayerMeta): PlayerBridge {
  if (typeof Peer === 'undefined') {
    return { broadcast() {}, destroy() {} }
  }

  let peer: any = null
  let conn: any = null
  let destroyed = false
  let retryTimer: ReturnType<typeof setTimeout> | null = null
  let latestBroadcast: unknown = null

  function connect() {
    if (destroyed) return
    try { if (peer && !peer.destroyed) peer.destroy() } catch {}

    peer = new Peer(undefined, { debug: 0 })

    peer.on('open', () => {
      if (destroyed) return
      try {
        conn = peer.connect(LOBBY_ID, { reliable: true })
      } catch {
        scheduleRetry()
        return
      }

      conn.on('open', () => {
        if (destroyed) { try { conn.close() } catch {} return }
        // Announce presence
        try { conn.send({ type: 'announce', ...meta, peerId: peer.id }) } catch {}
        // Resend latest state so admin gets current view immediately
        if (latestBroadcast) {
          try { conn.send(latestBroadcast) } catch {}
        }
      })

      conn.on('close', () => { conn = null; scheduleRetry() })
      conn.on('error', () => { conn = null; scheduleRetry() })
    })

    peer.on('error', () => { scheduleRetry() })
  }

  function scheduleRetry() {
    if (destroyed || retryTimer) return
    retryTimer = setTimeout(() => { retryTimer = null; connect() }, RETRY_INTERVAL)
  }

  connect()

  return {
    broadcast(data: unknown) {
      latestBroadcast = data
      if (conn?.open) {
        try { conn.send(data) } catch {}
      }
    },
    destroy() {
      destroyed = true
      if (retryTimer) { clearTimeout(retryTimer); retryTimer = null }
      try { conn?.close() } catch {}
      try { peer?.destroy() } catch {}
      conn = null
      peer = null
    },
  }
}

// ---------------------------------------------------------------------------
// Admin side — claim lobby, receive all player connections automatically
// ---------------------------------------------------------------------------

export function createAdminLobby(callbacks: {
  onPlayerJoined: (info: PlayerInfo) => void
  onPlayerLeft: (peerId: string) => void
  onPlayerData: (peerId: string, data: unknown) => void
}): Promise<AdminLobby> {
  return new Promise((resolve, reject) => {
    if (typeof Peer === 'undefined') {
      reject(new Error('PeerJS not loaded'))
      return
    }

    const peer = new Peer(LOBBY_ID, { debug: 0 })
    const connections = new Map<string, any>()
    let destroyed = false
    let resolved = false

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true
        reject(new Error('Lobby creation timeout'))
        try { peer.destroy() } catch {}
      }
    }, 10000)

    peer.on('open', () => {
      if (resolved) return
      resolved = true
      clearTimeout(timeout)

      resolve({
        destroy() {
          destroyed = true
          connections.forEach(c => { try { c.close() } catch {} })
          connections.clear()
          try { peer.destroy() } catch {}
        },
      })
    })

    peer.on('connection', (incomingConn: any) => {
      const remotePeerId: string = incomingConn.peer

      incomingConn.on('open', () => {
        if (destroyed) { try { incomingConn.close() } catch {}; return }
        connections.set(remotePeerId, incomingConn)
      })

      incomingConn.on('data', (data: any) => {
        if (!data || typeof data !== 'object') return
        if (data.type === 'announce') {
          callbacks.onPlayerJoined({
            peerId: remotePeerId,
            mode: data.mode || '?',
            genre: data.genre,
            userId: data.userId || '?',
            sessionId: data.sessionId || '?',
            turnNumber: 0,
            connectedAt: Date.now(),
          })
        } else {
          callbacks.onPlayerData(remotePeerId, data)
        }
      })

      incomingConn.on('close', () => {
        connections.delete(remotePeerId)
        callbacks.onPlayerLeft(remotePeerId)
      })

      incomingConn.on('error', () => {
        connections.delete(remotePeerId)
        callbacks.onPlayerLeft(remotePeerId)
      })
    })

    peer.on('error', (err: any) => {
      if (!resolved) {
        resolved = true
        clearTimeout(timeout)
        if (err.type === 'unavailable-id') {
          reject(new Error('Lobby already claimed — another admin is active'))
        } else {
          reject(err)
        }
      }
    })
  })
}
