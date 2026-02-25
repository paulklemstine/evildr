// Live bridge — PeerJS broadcaster (player side) and receiver (admin side)
// Player creates a peer with a short watch code; admin connects to watch live.

declare const Peer: any

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LiveBridge {
  watchCode: string
  broadcast(data: unknown): void
  destroy(): void
}

// ---------------------------------------------------------------------------
// Player side — create broadcaster
// ---------------------------------------------------------------------------

export function createLiveBridge(): Promise<LiveBridge> {
  return new Promise((resolve, reject) => {
    if (typeof Peer === 'undefined') {
      reject(new Error('PeerJS not loaded'))
      return
    }

    const code = generateWatchCode()
    const peerId = `geems-${code}`
    const peer = new Peer(peerId)
    const connections: any[] = []
    let destroyed = false
    let resolved = false

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true
        reject(new Error('PeerJS timeout'))
        try { peer.destroy() } catch {}
      }
    }, 10000)

    peer.on('open', () => {
      if (resolved) return
      resolved = true
      clearTimeout(timeout)

      resolve({
        watchCode: code,
        broadcast(data: unknown) {
          if (destroyed) return
          for (let i = connections.length - 1; i >= 0; i--) {
            const conn = connections[i]
            if (conn.open) {
              try { conn.send(data) } catch { connections.splice(i, 1) }
            } else {
              connections.splice(i, 1)
            }
          }
        },
        destroy() {
          destroyed = true
          connections.length = 0
          try { peer.destroy() } catch {}
        },
      })
    })

    peer.on('connection', (conn: any) => {
      conn.on('open', () => {
        connections.push(conn)
      })
      conn.on('close', () => {
        const idx = connections.indexOf(conn)
        if (idx >= 0) connections.splice(idx, 1)
      })
    })

    peer.on('error', (err: any) => {
      if (!resolved) {
        resolved = true
        clearTimeout(timeout)
        reject(err)
      }
    })
  })
}

// ---------------------------------------------------------------------------
// Admin side — connect to a player's live bridge
// ---------------------------------------------------------------------------

export function connectToLiveBridge(
  watchCode: string,
  onData: (data: unknown) => void,
  onDisconnect?: () => void,
): Promise<{ destroy: () => void }> {
  return new Promise((resolve, reject) => {
    if (typeof Peer === 'undefined') {
      reject(new Error('PeerJS not loaded'))
      return
    }

    const targetId = `geems-${watchCode.toUpperCase()}`
    const peer = new Peer()
    let resolved = false

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true
        reject(new Error('Connection timeout — no game found with that code'))
        try { peer.destroy() } catch {}
      }
    }, 15000)

    peer.on('open', () => {
      const conn = peer.connect(targetId, { reliable: true })

      conn.on('open', () => {
        if (resolved) return
        resolved = true
        clearTimeout(timeout)

        conn.on('data', (data: unknown) => onData(data))
        conn.on('close', () => onDisconnect?.())

        resolve({
          destroy() {
            try { conn.close() } catch {}
            try { peer.destroy() } catch {}
          },
        })
      })

      conn.on('error', (err: any) => {
        if (!resolved) {
          resolved = true
          clearTimeout(timeout)
          reject(err)
        }
      })
    })

    peer.on('error', (err: any) => {
      if (!resolved) {
        resolved = true
        clearTimeout(timeout)
        reject(err)
      }
    })
  })
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateWatchCode(): string {
  // Exclude ambiguous chars: I, O, 0, 1
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
