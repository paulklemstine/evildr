// Room code management — simplified multiplayer room creation/joining
//
// Instead of the complex PeerManager mesh network, this module uses a simple
// short-code approach for 1:1 dating mode connections:
//
// 1. Player 1 (host) creates a room -> gets a 4-character code (e.g. "A7K2")
// 2. Player 2 (guest) enters the code -> connects directly via PeerJS
// 3. The PeerJS peer ID for the room is `geems-date-{CODE}` (well-known pattern)
//
// This is intentionally simple — no mesh, no gossip, no master election.
// Just two peers talking over a single WebRTC data channel.

// PeerJS is loaded via CDN
declare const Peer: any

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ROOM_PREFIX = 'geems-date-'
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no I/O/0/1 to avoid confusion
const CODE_LENGTH = 4
const CONNECTION_TIMEOUT_MS = 15000
const PEER_OPEN_TIMEOUT_MS = 10000

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RoomCallbacks {
  onPartnerJoined: (partnerId: string) => void
  onPartnerLeft: () => void
  onPartnerData: (data: unknown) => void
}

export interface JoinCallbacks {
  onConnected: () => void
  onDisconnected: () => void
  onData: (data: unknown) => void
}

export interface RoomHandle {
  /** The 4-character room code. */
  code: string
  /** Destroy the room and close all connections. */
  destroy: () => void
  /** Send data to the connected partner. No-op if no partner connected. */
  send: (data: unknown) => void
  /** Whether a partner is currently connected. */
  isPartnerConnected: () => boolean
}

export interface GuestHandle {
  /** Destroy the connection. */
  destroy: () => void
  /** Send data to the host. */
  send: (data: unknown) => void
  /** Whether currently connected to the host. */
  isConnected: () => boolean
}

// ---------------------------------------------------------------------------
// Public functions
// ---------------------------------------------------------------------------

/**
 * Generate a random 4-character alphanumeric room code.
 * Uses characters that are unambiguous (no I/O/0/1).
 */
export function generateRoomCode(): string {
  let code = ''
  const randomValues = new Uint8Array(CODE_LENGTH)
  crypto.getRandomValues(randomValues)
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_CHARS[randomValues[i] % CODE_CHARS.length]
  }
  return code
}

/**
 * Get the PeerJS peer ID for a given room code.
 * This is the well-known pattern that allows Player 2 to find Player 1.
 */
export function getRoomPeerId(code: string): string {
  return `${ROOM_PREFIX}${code.toUpperCase()}`
}

/**
 * Create a room as the host (Player 1).
 *
 * Creates a PeerJS peer with the well-known room ID and listens for
 * an incoming connection from the guest (Player 2).
 *
 * @param callbacks - Event handlers for partner connection events.
 * @returns Promise that resolves with the room handle once the peer is ready.
 * @throws If PeerJS is not loaded, the room code is already taken, or timeout.
 */
export function createRoom(callbacks: RoomCallbacks): Promise<RoomHandle> {
  return new Promise((resolve, reject) => {
    if (typeof Peer === 'undefined') {
      reject(new Error('PeerJS library not loaded. Cannot create multiplayer room.'))
      return
    }

    const code = generateRoomCode()
    const peerId = getRoomPeerId(code)
    let peer: any = null
    let partnerConn: any = null
    let destroyed = false
    let resolved = false

    // Timeout if peer doesn't open
    const openTimeout = setTimeout(() => {
      if (!resolved) {
        resolved = true
        cleanup()
        reject(new Error(`Room creation timed out after ${PEER_OPEN_TIMEOUT_MS}ms`))
      }
    }, PEER_OPEN_TIMEOUT_MS)

    function cleanup(): void {
      destroyed = true
      clearTimeout(openTimeout)
      try { if (partnerConn?.open) partnerConn.close() } catch { /* ignore */ }
      try { if (peer && !peer.destroyed) peer.destroy() } catch { /* ignore */ }
      partnerConn = null
      peer = null
    }

    function send(data: unknown): void {
      if (destroyed || !partnerConn?.open) return
      try {
        partnerConn.send(data)
      } catch {
        // Connection may have died — trigger partner left
        handlePartnerLeft()
      }
    }

    function handlePartnerLeft(): void {
      if (destroyed) return
      partnerConn = null
      callbacks.onPartnerLeft()
    }

    try {
      peer = new Peer(peerId, { debug: 0 })
    } catch (e) {
      clearTimeout(openTimeout)
      reject(new Error(`Failed to create PeerJS peer: ${e instanceof Error ? e.message : String(e)}`))
      return
    }

    peer.on('open', (id: string) => {
      if (resolved || destroyed) return

      if (id !== peerId) {
        // PeerJS assigned a different ID — the room code is taken
        resolved = true
        clearTimeout(openTimeout)
        cleanup()
        reject(new Error(`Room code ${code} is already in use. Please try again.`))
        return
      }

      resolved = true
      clearTimeout(openTimeout)

      resolve({
        code,
        destroy: cleanup,
        send,
        isPartnerConnected: () => partnerConn?.open === true,
      })
    })

    // Listen for the guest's incoming connection
    peer.on('connection', (incomingConn: any) => {
      if (destroyed) {
        try { incomingConn.close() } catch { /* ignore */ }
        return
      }

      // Only allow one partner
      if (partnerConn?.open) {
        try {
          incomingConn.on('open', () => {
            try { incomingConn.send({ type: 'rejected', reason: 'Room is full' }) } catch { /* ignore */ }
            setTimeout(() => { try { incomingConn.close() } catch { /* ignore */ } }, 100)
          })
        } catch { /* ignore */ }
        return
      }

      incomingConn.on('open', () => {
        if (destroyed) {
          try { incomingConn.close() } catch { /* ignore */ }
          return
        }
        partnerConn = incomingConn
        callbacks.onPartnerJoined(incomingConn.peer)
      })

      incomingConn.on('data', (data: unknown) => {
        if (destroyed) return
        callbacks.onPartnerData(data)
      })

      incomingConn.on('close', () => {
        if (incomingConn === partnerConn) {
          handlePartnerLeft()
        }
      })

      incomingConn.on('error', () => {
        if (incomingConn === partnerConn) {
          handlePartnerLeft()
        }
      })
    })

    peer.on('error', (err: any) => {
      if (!resolved) {
        resolved = true
        clearTimeout(openTimeout)
        if (err.type === 'unavailable-id') {
          cleanup()
          reject(new Error(`Room code ${code} is already in use. Please try again.`))
        } else {
          cleanup()
          reject(new Error(`PeerJS error: ${err.type} - ${err.message || 'Unknown error'}`))
        }
      } else {
        // Post-open error — could be partner-related
        console.warn('[RoomCode] PeerJS error after open:', err.type, err.message)
      }
    })

    peer.on('disconnected', () => {
      if (destroyed) return
      // Try to reconnect to the signaling server
      try {
        if (peer && !peer.destroyed) {
          peer.reconnect()
        }
      } catch {
        console.warn('[RoomCode] Failed to reconnect to signaling server')
      }
    })
  })
}

/**
 * Join a room as the guest (Player 2).
 *
 * Connects to the host's well-known PeerJS peer ID derived from the room code.
 *
 * @param code - The 4-character room code.
 * @param callbacks - Event handlers for connection events.
 * @returns Promise that resolves with the guest handle once connected.
 * @throws If PeerJS is not loaded, the room doesn't exist, or timeout.
 */
export function joinRoom(code: string, callbacks: JoinCallbacks): Promise<GuestHandle> {
  return new Promise((resolve, reject) => {
    if (typeof Peer === 'undefined') {
      reject(new Error('PeerJS library not loaded. Cannot join multiplayer room.'))
      return
    }

    const normalizedCode = code.toUpperCase().trim()
    if (normalizedCode.length !== CODE_LENGTH) {
      reject(new Error(`Invalid room code: "${code}". Must be ${CODE_LENGTH} characters.`))
      return
    }

    const hostPeerId = getRoomPeerId(normalizedCode)
    let peer: any = null
    let conn: any = null
    let destroyed = false
    let resolved = false

    const connectionTimeout = setTimeout(() => {
      if (!resolved) {
        resolved = true
        cleanup()
        reject(new Error(`Could not connect to room ${normalizedCode}. The room may not exist or the host may have disconnected.`))
      }
    }, CONNECTION_TIMEOUT_MS)

    function cleanup(): void {
      destroyed = true
      clearTimeout(connectionTimeout)
      try { if (conn?.open) conn.close() } catch { /* ignore */ }
      try { if (peer && !peer.destroyed) peer.destroy() } catch { /* ignore */ }
      conn = null
      peer = null
    }

    function send(data: unknown): void {
      if (destroyed || !conn?.open) return
      try {
        conn.send(data)
      } catch {
        handleDisconnected()
      }
    }

    function handleDisconnected(): void {
      if (destroyed) return
      conn = null
      callbacks.onDisconnected()
    }

    try {
      // Guest uses a random PeerJS ID
      peer = new Peer(undefined, { debug: 0 })
    } catch (e) {
      clearTimeout(connectionTimeout)
      reject(new Error(`Failed to create PeerJS peer: ${e instanceof Error ? e.message : String(e)}`))
      return
    }

    peer.on('open', () => {
      if (resolved || destroyed) return

      try {
        conn = peer.connect(hostPeerId, { reliable: true })
      } catch (e) {
        resolved = true
        clearTimeout(connectionTimeout)
        cleanup()
        reject(new Error(`Failed to connect to room ${normalizedCode}: ${e instanceof Error ? e.message : String(e)}`))
        return
      }

      conn.on('open', () => {
        if (resolved || destroyed) return
        resolved = true
        clearTimeout(connectionTimeout)

        callbacks.onConnected()

        resolve({
          destroy: cleanup,
          send,
          isConnected: () => conn?.open === true,
        })
      })

      conn.on('data', (data: unknown) => {
        if (destroyed) return

        // Check for rejection
        if (data && typeof data === 'object' && (data as Record<string, unknown>).type === 'rejected') {
          if (!resolved) {
            resolved = true
            clearTimeout(connectionTimeout)
            cleanup()
            reject(new Error(`Room ${normalizedCode} rejected the connection: ${(data as Record<string, unknown>).reason || 'Room is full'}`))
          }
          return
        }

        callbacks.onData(data)
      })

      conn.on('close', () => {
        if (!resolved) {
          resolved = true
          clearTimeout(connectionTimeout)
          cleanup()
          reject(new Error(`Connection to room ${normalizedCode} was closed before completing.`))
        } else {
          handleDisconnected()
        }
      })

      conn.on('error', (err: any) => {
        if (!resolved) {
          resolved = true
          clearTimeout(connectionTimeout)
          cleanup()
          reject(new Error(`Connection error with room ${normalizedCode}: ${err?.message || 'Unknown error'}`))
        } else {
          console.warn('[RoomCode] Connection error after open:', err)
          handleDisconnected()
        }
      })
    })

    peer.on('error', (err: any) => {
      if (!resolved) {
        resolved = true
        clearTimeout(connectionTimeout)
        cleanup()
        if (err.type === 'peer-unavailable') {
          reject(new Error(`Room ${normalizedCode} does not exist. Check the code and try again.`))
        } else {
          reject(new Error(`PeerJS error: ${err.type} - ${err.message || 'Unknown error'}`))
        }
      } else {
        console.warn('[RoomCode] PeerJS error after open:', err.type, err.message)
      }
    })

    peer.on('disconnected', () => {
      if (destroyed) return
      try {
        if (peer && !peer.destroyed) {
          peer.reconnect()
        }
      } catch {
        console.warn('[RoomCode] Failed to reconnect to signaling server')
      }
    })
  })
}
