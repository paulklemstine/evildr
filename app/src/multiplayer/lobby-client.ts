// Lobby client — manages player presence and date request flow.
//
// Presence: heartbeat to Cloudflare KV every 10s, poll player list every 5s.
// Date requests: direct PeerJS connections between lobby peers.
//
// Flow:
//   1. Player enters lobby → creates PeerJS peer, registers with KV
//   2. Player sees all online players, clicks "Request Date"
//   3. Requester connects to target's PeerJS lobby peer, sends request
//   4. Target shows accept/reject notification
//   5. On accept → requester creates game room, sends code to target
//   6. Both transition to multiplayer game

declare const Peer: any

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LobbyPlayer {
  peerId: string
  name: string
  gender: string
  userId: string
  updatedAt: number
}

export interface LobbyCallbacks {
  /** Called when the player list updates. */
  onPlayersChanged: (players: LobbyPlayer[]) => void
  /** Called when someone requests a date with us. */
  onDateRequest: (from: LobbyPlayer, respond: (accepted: boolean) => void) => void
  /** Called when our outgoing request gets a response. */
  onDateResponse: (accepted: boolean, partner: LobbyPlayer) => void
  /** Called when date is accepted and room code is ready — time to start game. */
  onMatchReady: (roomCode: string, isHost: boolean) => void
  /** Called on error. */
  onError: (message: string) => void
  /** Called when lobby peer is ready. */
  onReady: () => void
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HEARTBEAT_INTERVAL_MS = 10_000
const POLL_INTERVAL_MS = 5_000
const REQUEST_TIMEOUT_MS = 30_000

const API_BASE = import.meta.env.DEV
  ? '/api/lobby'
  : 'https://drevil-proxy.drevil.workers.dev/api/lobby'

// ---------------------------------------------------------------------------
// LobbyClient
// ---------------------------------------------------------------------------

export class LobbyClient {
  private peer: any = null
  private peerId = ''
  private name = ''
  private gender = ''
  private userId = ''
  private callbacks: LobbyCallbacks

  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private pollTimer: ReturnType<typeof setInterval> | null = null
  private destroyed = false

  // Track outgoing request state
  private outgoingConn: any = null
  private outgoingTarget: LobbyPlayer | null = null
  private outgoingTimeout: ReturnType<typeof setTimeout> | null = null

  constructor(callbacks: LobbyCallbacks) {
    this.callbacks = callbacks
  }

  /**
   * Join the lobby. Creates PeerJS peer, registers with KV, starts polling.
   */
  async join(name: string, gender: string, userId: string): Promise<void> {
    if (typeof Peer === 'undefined') {
      throw new Error('PeerJS library not loaded.')
    }

    this.name = name
    this.gender = gender
    this.userId = userId

    return new Promise<void>((resolve, reject) => {
      try {
        this.peer = new Peer(undefined, { debug: 0 })
      } catch (e) {
        reject(new Error(`Failed to create lobby peer: ${e instanceof Error ? e.message : String(e)}`))
        return
      }

      const openTimeout = setTimeout(() => {
        reject(new Error('Lobby peer creation timed out'))
      }, 10_000)

      this.peer.on('open', (id: string) => {
        clearTimeout(openTimeout)
        this.peerId = id
        this.startHeartbeat()
        this.startPolling()
        this.listenForConnections()
        this.callbacks.onReady()
        resolve()
      })

      this.peer.on('error', (err: any) => {
        if (!this.peerId) {
          clearTimeout(openTimeout)
          reject(new Error(`Lobby peer error: ${err.type} - ${err.message || ''}`))
        } else {
          console.warn('[Lobby] Peer error:', err.type, err.message)
        }
      })

      // Reconnection with backoff
      let reconnectAttempts = 0
      this.peer.on('disconnected', () => {
        if (this.destroyed) return
        if (reconnectAttempts >= 5) {
          console.error('[Lobby] Max reconnection attempts exhausted')
          return
        }
        const delay = 1000 * Math.pow(2, reconnectAttempts)
        reconnectAttempts++
        console.warn(`[Lobby] Signaling disconnected, retrying in ${delay}ms`)
        setTimeout(() => {
          if (this.destroyed || !this.peer || this.peer.destroyed) return
          try { this.peer.reconnect() } catch { /* ignore */ }
        }, delay)
      })

      this.peer.on('open', () => {
        if (reconnectAttempts > 0) {
          console.log(`[Lobby] Reconnected after ${reconnectAttempts} attempt(s)`)
          reconnectAttempts = 0
        }
      })
    })
  }

  /**
   * Request a date with another player.
   */
  requestDate(target: LobbyPlayer): void {
    if (!this.peer || this.destroyed) return

    // Cancel any existing outgoing request
    this.cancelOutgoingRequest()

    this.outgoingTarget = target

    try {
      this.outgoingConn = this.peer.connect(target.peerId, { reliable: true })
    } catch (e) {
      this.callbacks.onError(`Failed to connect to ${target.name}: ${e instanceof Error ? e.message : String(e)}`)
      return
    }

    // Timeout for no response
    this.outgoingTimeout = setTimeout(() => {
      this.callbacks.onError(`${target.name} didn't respond in time.`)
      this.cancelOutgoingRequest()
    }, REQUEST_TIMEOUT_MS)

    this.outgoingConn.on('open', () => {
      this.outgoingConn.send({
        type: 'date-request',
        from: { peerId: this.peerId, name: this.name, gender: this.gender, userId: this.userId },
      })
    })

    this.outgoingConn.on('data', (data: any) => {
      if (!data || typeof data !== 'object') return

      if (data.type === 'date-response') {
        if (this.outgoingTimeout) { clearTimeout(this.outgoingTimeout); this.outgoingTimeout = null }

        if (data.accepted && this.outgoingTarget) {
          this.callbacks.onDateResponse(true, this.outgoingTarget)
          // We're the requester — we become the host.
          // Signal main.ts to create room; it will call sendRoomCode() when ready
          this.callbacks.onMatchReady('', true)
        } else {
          this.callbacks.onDateResponse(false, this.outgoingTarget!)
          this.cancelOutgoingRequest()
        }
      }
    })

    this.outgoingConn.on('close', () => {
      if (this.outgoingTimeout) { clearTimeout(this.outgoingTimeout); this.outgoingTimeout = null }
    })

    this.outgoingConn.on('error', (err: any) => {
      if (this.outgoingTimeout) { clearTimeout(this.outgoingTimeout); this.outgoingTimeout = null }
      this.callbacks.onError(`Connection to ${target.name} failed: ${err?.message || 'Unknown error'}`)
      this.cancelOutgoingRequest()
    })
  }

  /**
   * Destroy the lobby client. Unregisters from KV, closes peer.
   */
  destroy(): void {
    this.destroyed = true
    this.cancelOutgoingRequest()
    if (this.heartbeatTimer) { clearInterval(this.heartbeatTimer); this.heartbeatTimer = null }
    if (this.pollTimer) { clearInterval(this.pollTimer); this.pollTimer = null }

    // Unregister from KV
    if (this.peerId) {
      fetch(`${API_BASE}/player/${encodeURIComponent(this.peerId)}`, { method: 'DELETE' }).catch(() => {})
    }

    try { if (this.peer && !this.peer.destroyed) this.peer.destroy() } catch { /* ignore */ }
    this.peer = null
  }

  getPeerId(): string {
    return this.peerId
  }

  /**
   * Send a room code to the outgoing date target via the lobby P2P connection.
   * Called by main.ts after it creates the room handle.
   */
  sendRoomCode(code: string): void {
    if (this.outgoingConn?.open) {
      this.outgoingConn.send({ type: 'room-ready', code })
    }
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  private startHeartbeat(): void {
    const heartbeat = () => {
      if (this.destroyed || !this.peerId) return
      fetch(`${API_BASE}/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peerId: this.peerId,
          name: this.name,
          gender: this.gender,
          userId: this.userId,
        }),
      }).catch((err) => {
        console.warn('[Lobby] Heartbeat failed:', err)
      })
    }

    // Initial heartbeat immediately
    heartbeat()
    this.heartbeatTimer = setInterval(heartbeat, HEARTBEAT_INTERVAL_MS)
  }

  private startPolling(): void {
    const poll = () => {
      if (this.destroyed) return
      fetch(`${API_BASE}/players`)
        .then(res => res.json())
        .then((data: { players: LobbyPlayer[] }) => {
          if (this.destroyed) return
          // Filter out self
          const others = (data.players || []).filter(p => p.peerId !== this.peerId)
          this.callbacks.onPlayersChanged(others)
        })
        .catch((err) => {
          console.warn('[Lobby] Poll failed:', err)
        })
    }

    // Initial poll immediately
    poll()
    this.pollTimer = setInterval(poll, POLL_INTERVAL_MS)
  }

  private listenForConnections(): void {
    if (!this.peer) return

    this.peer.on('connection', (incomingConn: any) => {
      if (this.destroyed) {
        try { incomingConn.close() } catch { /* ignore */ }
        return
      }

      incomingConn.on('data', (data: any) => {
        if (!data || typeof data !== 'object') return

        if (data.type === 'date-request' && data.from) {
          const from = data.from as LobbyPlayer
          // Show notification — provide respond callback
          this.callbacks.onDateRequest(from, (accepted: boolean) => {
            try {
              incomingConn.send({ type: 'date-response', accepted })
            } catch { /* ignore */ }

            if (!accepted) {
              setTimeout(() => { try { incomingConn.close() } catch { /* ignore */ } }, 200)
            }
          })

          // Listen for room code if we accepted
          incomingConn.on('data', (followUp: any) => {
            if (followUp?.type === 'room-ready' && followUp.code) {
              this.callbacks.onMatchReady(followUp.code, false)
            }
          })
        }
      })
    })
  }

  private cancelOutgoingRequest(): void {
    if (this.outgoingTimeout) { clearTimeout(this.outgoingTimeout); this.outgoingTimeout = null }
    try { if (this.outgoingConn?.open) this.outgoingConn.close() } catch { /* ignore */ }
    this.outgoingConn = null
    this.outgoingTarget = null
  }
}
