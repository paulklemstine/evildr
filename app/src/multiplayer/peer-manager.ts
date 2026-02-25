// PeerManager — TypeScript port of the MPLib multiplayer library from old/mp.js
// Provides P2P connections via PeerJS with host election, gossip protocol,
// tie-breaking, initial sync, and reconnection.

// PeerJS is loaded via CDN — declare the global constructor
declare const Peer: any

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PeerManagerConfig {
  targetHostId: string
  debugLevel?: number
  maxConnections?: number
  messageTTL?: number
  hostConnectionTimeoutMs?: number
  forceClientOnly?: boolean
  onStatusUpdate?: (msg: string, type: string) => void
  onError?: (type: string, err: unknown) => void
  onPeerJoined?: (peerId: string) => void
  onPeerLeft?: (peerId: string) => void
  onDataReceived?: (peerId: string, data: unknown) => void
  onConnectedToHost?: (hostId: string) => void
  onBecameHost?: () => void
  onInitialSync?: (syncData: unknown) => void
  getInitialSyncData?: () => unknown
}

interface GossipMessage {
  payload: unknown
  messageId: string
  originalSenderId: string
  ttl: number
}

interface SystemPayload {
  type: string
  subType?: string
  peerId?: string
  message?: string
}

interface DirectMessage {
  type: string
  payload: unknown
}

/** Placeholder values stored in the connections map before open */
type ConnectionPlaceholder = 'connecting' | 'connecting-incoming'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DataConnection = any

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_SEEN_MESSAGES = 1000

const DEFAULT_CONFIG: Required<PeerManagerConfig> = {
  targetHostId: 'default-mp-channel',
  debugLevel: 0,
  maxConnections: 8,
  messageTTL: 4,
  hostConnectionTimeoutMs: 7000,
  forceClientOnly: false,
  onStatusUpdate: (_msg: string, _type: string) => {},
  onError: (_type: string, _err: unknown) => {},
  onPeerJoined: (_peerId: string) => {},
  onPeerLeft: (_peerId: string) => {},
  onDataReceived: (_peerId: string, _data: unknown) => {},
  onConnectedToHost: (_hostId: string) => {},
  onBecameHost: () => {},
  onInitialSync: (_syncData: unknown) => {},
  getInitialSyncData: () => ({}),
}

// ---------------------------------------------------------------------------
// PeerManager
// ---------------------------------------------------------------------------

export class PeerManager {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private peer: any = null
  private _localPeerId: string | null = null
  private _isHost = false
  private _hostPeerId: string | null = null
  private isAttemptingHostId = false
  private readonly _connections = new Map<string, DataConnection | ConnectionPlaceholder>()
  private readonly pendingConnections = new Set<string>()
  private readonly seenMessageIds = new Set<string>()
  private initialSyncComplete = false
  private hostCheckTimeout: ReturnType<typeof setTimeout> | null = null
  private config: Required<PeerManagerConfig>

  constructor(config: PeerManagerConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  // -----------------------------------------------------------------------
  // Public read-only accessors
  // -----------------------------------------------------------------------

  get localPeerId(): string | null {
    return this._localPeerId
  }

  get isHost(): boolean {
    return this._isHost
  }

  get hostPeerId(): string | null {
    return this._hostPeerId
  }

  get connections(): Map<string, unknown> {
    return new Map(this._connections)
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /** Starts the PeerJS connection. Attempts to claim the host ID first. */
  initialize(): void {
    if (this.peer && !this.peer.destroyed) {
      this.log('Peer already initialized.', 'warn')
      return
    }

    this.log(`Initializing PeerJS... Attempting host ID: ${this.config.targetHostId}`)
    this.config.onStatusUpdate('Initializing network...', 'info')
    this.isAttemptingHostId = true
    this.initialSyncComplete = false

    try {
      if (this.peer) {
        try { this.peer.destroy() } catch (_e) { /* ignore */ }
        this.peer = null
      }
      this.peer = new Peer(this.config.targetHostId, { debug: this.config.debugLevel })
      this.setupPeerListeners(this.peer)
    } catch (e) {
      this.log(`Fatal PeerJS initialization error: ${(e as Error).message}`, 'error')
      this.config.onError('init', e)
      this.resetState()
    }
  }

  /** Disconnects from all peers and the signaling server. */
  disconnect(): void {
    this.log('Disconnecting from network...', 'info')
    if (this.peer && !this.peer.destroyed) {
      try { this.peer.destroy() } catch (e) {
        this.log(`Error destroying peer: ${(e as Error).message}`, 'error')
      }
    }
    this.resetState()
  }

  /** Broadcasts a payload to all connected peers via the gossip protocol. */
  broadcast(payload: unknown): void {
    if (!payload) {
      this.log('Broadcast payload cannot be empty.', 'warn')
      return
    }
    if (typeof payload === 'object' && payload !== null && (payload as SystemPayload).type === 'system') {
      this.log('Attempted to broadcast a system message via public broadcast. Use internal methods.', 'error')
      return
    }
    this._broadcast({ payload } as Partial<GossipMessage>)
  }

  /** Sends a payload directly to a specific peer (no gossip). */
  sendDirect(targetPeerId: string, payload: unknown): void {
    if (!targetPeerId || !payload) {
      this.log('Direct send requires targetPeerId and payload.', 'warn')
      return
    }
    const conn = this._connections.get(targetPeerId)
    if (conn && conn !== 'connecting' && conn !== 'connecting-incoming' && conn.open) {
      try {
        conn.send(payload)
      } catch (e) {
        this.log(`Error sending direct message to ${targetPeerId.slice(-6)}: ${(e as Error).message}`, 'error')
        this.removeConnection(targetPeerId)
      }
    } else {
      this.log(`No open connection to ${targetPeerId.slice(-6)} for direct message.`, 'warn')
    }
  }

  // -----------------------------------------------------------------------
  // Private — initialization helpers
  // -----------------------------------------------------------------------

  /** Fallback: initialize PeerJS with a random (server-assigned) ID. */
  private initializeAsClient(): void {
    this.log('Host ID taken or unavailable. Initializing with random ID...')
    this.config.onStatusUpdate('Host ID taken. Getting random ID...', 'info')
    this.isAttemptingHostId = false

    try {
      if (this.peer && !this.peer.destroyed) {
        try { this.peer.destroy() } catch (_e) { /* ignore */ }
      }
      this.peer = null
      this.peer = new Peer(undefined, { debug: this.config.debugLevel })
      this.setupPeerListeners(this.peer)
    } catch (e) {
      this.log(`Fatal PeerJS client initialization error: ${(e as Error).message}`, 'error')
      this.config.onError('client_init', e)
      this.resetState()
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private setupPeerListeners(currentPeer: any): void {
    if (!currentPeer) return

    currentPeer.off('open')
    currentPeer.off('connection')
    currentPeer.off('disconnected')
    currentPeer.off('close')
    currentPeer.off('error')

    currentPeer.on('open', (id: string) => {
      if (!id) {
        this.log('Error: Received null ID from PeerJS.', 'error')
        this.config.onError('null_id', 'PeerJS returned a null ID')
        if (this.isAttemptingHostId) {
          this.initializeAsClient()
        } else {
          this.resetState()
        }
        return
      }

      this._localPeerId = id
      this.log(`PeerJS opened with ID: ${id}`, 'info')

      if (this.isAttemptingHostId && id === this.config.targetHostId) {
        this.becomeHost()
      } else {
        this._isHost = false
        this._hostPeerId = this.config.targetHostId

        if (this.isAttemptingHostId) {
          this.log(`Host ID ${this.config.targetHostId} was taken. Now operating as client with ID ${id}.`, 'warn')
        } else {
          this.log(`Operating as client with ID ${id}.`, 'info')
        }
        this.config.onStatusUpdate(
          `Connected as ${id.slice(-6)}. Connecting to host ${this.config.targetHostId.slice(-6)}...`,
          'info',
        )
        this.connectToPeer(this.config.targetHostId)

        if (!this.config.forceClientOnly) {
          if (this.hostCheckTimeout) clearTimeout(this.hostCheckTimeout)
          this.hostCheckTimeout = setTimeout(() => {
            if (!this._connections.has(this.config.targetHostId) && !this._isHost) {
              this.log('Host connection timed out. Assuming host role.', 'warn')
              this.becomeHost()
            }
          }, this.config.hostConnectionTimeoutMs)
        }
      }
    })

    currentPeer.on('connection', (conn: DataConnection) => {
      this.log(`Incoming connection request from ${conn.peer.slice(-6)}`, 'info')
      this.handleIncomingConnection(conn)
    })

    currentPeer.on('disconnected', () => {
      this.log('PeerJS disconnected from signaling server.', 'warn')
      this.config.onStatusUpdate('Server disconnected. Reconnecting...', 'warn')
      try {
        if (currentPeer && !currentPeer.destroyed) {
          currentPeer.reconnect()
        }
      } catch (e) {
        this.log(`Reconnect failed: ${(e as Error).message}`, 'error')
        this.config.onError('reconnect', e)
      }
    })

    currentPeer.on('close', () => {
      this.log('PeerJS connection closed permanently.', 'error')
      this.config.onError('close', 'Peer instance closed')
      this.resetState()
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentPeer.on('error', (err: any) => {
      this.log(`PeerJS Error: ${err.type} - ${err.message}`, 'error')
      this.config.onError(err.type, err)

      if (err.type === 'unavailable-id' && this.isAttemptingHostId && err.message?.includes(this.config.targetHostId)) {
        this.initializeAsClient()
      } else if (err.type === 'peer-unavailable') {
        const match = err.message?.match(/Could not connect to peer\s(.*?)$/)
        const unavailablePeerId: string | undefined = match?.[1]
        if (unavailablePeerId) {
          this.log(`Peer ${unavailablePeerId.slice(-6)} is unavailable.`, 'warn')
          this.removeConnection(unavailablePeerId)
          if (unavailablePeerId === this._hostPeerId && !this._isHost && !this.config.forceClientOnly) {
            this.log('Host unavailable. Assuming host role.', 'warn')
            this.becomeHost()
          }
        }
      } else if (
        ['network', 'server-error', 'socket-error', 'socket-closed', 'browser-incompatible'].includes(err.type)
      ) {
        this.log(`Critical PeerJS error (${err.type}). State may be inconsistent.`, 'error')
      }
    })
  }

  // -----------------------------------------------------------------------
  // Private — connection management
  // -----------------------------------------------------------------------

  private handleIncomingConnection(conn: DataConnection): void {
    const remotePeerId: string = conn.peer
    if (!remotePeerId) {
      this.log('Incoming connection with no peer ID.', 'warn')
      try { conn.close() } catch (_e) { /* ignore */ }
      return
    }

    const existingConnData = this._connections.get(remotePeerId)
    const isPendingOutgoing = this.pendingConnections.has(remotePeerId)
    let keepIncoming = false
    let closeExisting = false
    let abandonOutgoing = false

    // Tie-breaker: lower peer ID keeps their connection attempt
    if (existingConnData && existingConnData !== 'connecting' && existingConnData !== 'connecting-incoming') {
      if (this._localPeerId! < remotePeerId) {
        this.log(`[Tie-Breaker] My ID smaller than ${remotePeerId.slice(-6)}. Rejecting their incoming connection.`, 'info')
        this.rejectConnection(conn, 'Duplicate connection (tie-breaker)')
        return
      } else {
        this.log(`[Tie-Breaker] My ID larger than ${remotePeerId.slice(-6)}. Replacing my existing connection with their incoming.`, 'info')
        closeExisting = true
        keepIncoming = true
      }
    } else if (isPendingOutgoing) {
      if (this._localPeerId! < remotePeerId) {
        this.log(`[Tie-Breaker] My ID smaller than ${remotePeerId.slice(-6)}. Rejecting their incoming, preferring my outgoing.`, 'info')
        this.rejectConnection(conn, 'Duplicate connection attempt (tie-breaker)')
        return
      } else {
        this.log(`[Tie-Breaker] My ID larger than ${remotePeerId.slice(-6)}. Accepting their incoming, abandoning my outgoing.`, 'info')
        abandonOutgoing = true
        keepIncoming = true
      }
    } else {
      keepIncoming = true
    }

    if (keepIncoming) {
      if (this._connections.size >= this.config.maxConnections && !closeExisting) {
        this.log(`Max connections (${this.config.maxConnections}) reached. Rejecting ${remotePeerId.slice(-6)}`, 'warn')
        this.rejectConnection(conn, 'Room full')
        return
      }

      if (closeExisting && existingConnData && existingConnData !== 'connecting' && existingConnData !== 'connecting-incoming') {
        this.log(`Closing existing connection object for ${remotePeerId.slice(-6)} before setup.`, 'info')
        try { existingConnData.close() } catch (_e) { /* ignore */ }
        this._connections.delete(remotePeerId)
      }
      if (abandonOutgoing) {
        this.pendingConnections.delete(remotePeerId)
        if (this._connections.get(remotePeerId) === 'connecting') {
          this._connections.delete(remotePeerId)
        }
      }

      this.log(`Proceeding to setup incoming connection with ${remotePeerId.slice(-6)}.`, 'info')
      this._connections.set(remotePeerId, 'connecting-incoming')

      conn.on('open', () => {
        this.log(`Incoming connection opened with ${remotePeerId.slice(-6)}`)
        if (this._connections.size > this.config.maxConnections && this._connections.get(remotePeerId) !== conn) {
          this.log(`Connection ${remotePeerId.slice(-6)} opened, but room now full OR connection replaced. Closing.`, 'warn')
          try { conn.close() } catch (_e) { /* ignore */ }
          if (this._connections.get(remotePeerId) === 'connecting-incoming') {
            this._connections.delete(remotePeerId)
          }
          return
        }
        if (this._connections.get(remotePeerId) === 'connecting-incoming') {
          this.setupConnection(conn)
        } else {
          this.log(`Incoming connection ${remotePeerId.slice(-6)} opened, but state changed (likely lost tie-breaker). Closing.`, 'warn')
          try { conn.close() } catch (_e) { /* ignore */ }
          if (this._connections.get(remotePeerId) === 'connecting-incoming') {
            this._connections.delete(remotePeerId)
          }
        }
      })

      conn.on('error', (_err: unknown) => {
        this.log(`Pre-open connection error with ${remotePeerId.slice(-6)}`, 'error')
        this.removeConnection(remotePeerId)
      })
      conn.on('close', () => {
        this.log(`Pre-open connection closed with ${remotePeerId.slice(-6)}`, 'warn')
        this.removeConnection(remotePeerId)
      })
    }
  }

  private rejectConnection(conn: DataConnection, reason: string): void {
    conn.on('open', () => {
      try {
        conn.send({ type: 'system', payload: { type: 'rejected', message: reason } })
      } catch (_e) { /* ignore */ }
      setTimeout(() => {
        try { conn.close() } catch (_e) { /* ignore */ }
      }, 50)
    })
    conn.on('error', () => {})
    conn.on('close', () => {})
  }

  private setupConnection(conn: DataConnection): void {
    const remotePeerId: string = conn.peer
    if (!remotePeerId) return

    this._connections.set(remotePeerId, conn)
    this.pendingConnections.delete(remotePeerId)

    this.log(`Connection setup complete with ${remotePeerId.slice(-6)}. Total: ${this._connections.size}`, 'info')
    this.config.onPeerJoined(remotePeerId)

    // Client connected to host
    if (!this._isHost && remotePeerId === this._hostPeerId) {
      this.config.onConnectedToHost(this._hostPeerId)
      if (this.hostCheckTimeout) {
        clearTimeout(this.hostCheckTimeout)
        this.hostCheckTimeout = null
      }
    }

    // Host sends initial sync and gossips the new peer
    if (this._isHost) {
      this.sendInitialSync(conn)
      this._broadcast(
        { payload: { type: 'system', subType: 'peer_joined', peerId: remotePeerId } } as Partial<GossipMessage>,
        conn,
      )
    }

    conn.off('data')
    conn.off('close')
    conn.off('error')

    conn.on('data', (data: unknown) => {
      this.handleReceivedData(data, conn)
    })

    conn.on('close', () => {
      this.log(`Connection closed with ${remotePeerId.slice(-6)}`, 'warn')
      this.removeConnection(remotePeerId)
      if (this._localPeerId) {
        this._broadcast({ payload: { type: 'system', subType: 'peer_left', peerId: remotePeerId } } as Partial<GossipMessage>)
      }
    })

    conn.on('error', (err: unknown) => {
      this.log(`Connection error with ${remotePeerId.slice(-6)}: ${(err as Error).message ?? err}`, 'error')
      this.config.onError('connection', err)
      this.removeConnection(remotePeerId)
      if (this._localPeerId) {
        this._broadcast({ payload: { type: 'system', subType: 'peer_left', peerId: remotePeerId } } as Partial<GossipMessage>)
      }
    })
  }

  private connectToPeer(targetPeerId: string): void {
    if (!targetPeerId || targetPeerId === this._localPeerId || !this.peer || this.peer.destroyed) {
      if (targetPeerId === this._localPeerId) this.log('Cannot connect to self.', 'warn')
      else this.log(`Cannot connect: Invalid target (${targetPeerId}) or peer state.`, 'warn')
      return
    }
    if (this._connections.has(targetPeerId) && this._connections.get(targetPeerId) !== 'connecting') {
      this.log(`Already connected to ${targetPeerId.slice(-6)}`, 'info')
      return
    }
    if (this._connections.size >= this.config.maxConnections) {
      this.log(`Cannot connect to ${targetPeerId.slice(-6)}, max connections reached.`, 'warn')
      return
    }

    this.log(`Attempting outgoing connection to ${targetPeerId.slice(-6)}...`, 'info')
    this.config.onStatusUpdate(`Connecting ${targetPeerId.slice(-6)}...`, 'info')
    this.pendingConnections.add(targetPeerId)
    this._connections.set(targetPeerId, 'connecting')

    try {
      const conn = this.peer.connect(targetPeerId, { reliable: true })

      conn.on('open', () => {
        this.log(`Outgoing connection opened with ${targetPeerId.slice(-6)}.`)
        if (this._connections.get(targetPeerId) === 'connecting') {
          this.setupConnection(conn)
        } else {
          this.log(`Outgoing to ${targetPeerId.slice(-6)} opened, but state changed (likely lost tie-breaker). Closing.`, 'warn')
          try { conn.close() } catch (_e) { /* ignore */ }
          this.pendingConnections.delete(targetPeerId)
        }
      })

      conn.on('error', (err: unknown) => {
        this.log(`Failed to connect to ${targetPeerId.slice(-6)}: ${(err as Error).message ?? err}`, 'error')
        this.config.onError('connect_error', err)
        if (this._connections.get(targetPeerId) === 'connecting') {
          this._connections.delete(targetPeerId)
        }
        this.pendingConnections.delete(targetPeerId)
        if (targetPeerId === this.config.targetHostId && !this._isHost && !this.config.forceClientOnly) {
          if (!this._connections.has(this.config.targetHostId)) {
            this.log('Failed connection to host. Assuming host role.', 'warn')
            this.becomeHost()
          }
        }
      })

      conn.on('close', () => {
        this.log(`Outgoing connection attempt to ${targetPeerId.slice(-6)} closed before open.`, 'warn')
        if (this._connections.get(targetPeerId) === 'connecting') {
          this._connections.delete(targetPeerId)
        }
        this.pendingConnections.delete(targetPeerId)
        if (targetPeerId === this.config.targetHostId && !this._isHost && !this.config.forceClientOnly) {
          if (!this._connections.has(this.config.targetHostId)) {
            this.log('Host connection attempt closed. Assuming host role.', 'warn')
            this.becomeHost()
          }
        }
      })
    } catch (e) {
      this.log(`Error initiating connection to ${targetPeerId.slice(-6)}: ${(e as Error).message}`, 'error')
      this.config.onError('connect_init', e)
      if (this._connections.get(targetPeerId) === 'connecting') this._connections.delete(targetPeerId)
      this.pendingConnections.delete(targetPeerId)
    }
  }

  private removeConnection(peerIdToRemove: string): void {
    if (!peerIdToRemove) return

    this.pendingConnections.delete(peerIdToRemove)

    const conn = this._connections.get(peerIdToRemove)
    if (conn) {
      this._connections.delete(peerIdToRemove)
      this.log(`Removed connection entry for ${peerIdToRemove.slice(-6)}. Total: ${this._connections.size}`, 'info')
      this.config.onPeerLeft(peerIdToRemove)

      if (conn !== 'connecting' && conn !== 'connecting-incoming' && typeof conn === 'object' && conn.open) {
        this.log(`Closing connection object for ${peerIdToRemove.slice(-6)}`, 'info')
        try { conn.close() } catch (_e) { /* ignore */ }
      }

      // Host was lost — attempt recovery
      if (peerIdToRemove === this._hostPeerId && !this._isHost) {
        this.log('Lost connection to host!', 'warn')
        this.config.onError('host_disconnect', 'Lost connection to host')
        this._hostPeerId = null

        if (!this.config.forceClientOnly) {
          this.log('Attempting to reconnect to default host or assume host role.', 'warn')
          this.connectToPeer(this.config.targetHostId)
          if (this.hostCheckTimeout) clearTimeout(this.hostCheckTimeout)
          this.hostCheckTimeout = setTimeout(() => {
            if (!this._connections.has(this.config.targetHostId) && !this._isHost) {
              this.log('Host reconnect timed out. Assuming host role.', 'warn')
              this.becomeHost()
            }
          }, this.config.hostConnectionTimeoutMs)
        } else {
          this.log('Host disconnected and forceClientOnly is true. Waiting.', 'warn')
          this.config.onStatusUpdate('Host disconnected. Waiting for new host...', 'warn')
        }
      }
    }
  }

  // -----------------------------------------------------------------------
  // Private — sync & data handling
  // -----------------------------------------------------------------------

  private sendInitialSync(conn: DataConnection): void {
    if (!this._isHost || !conn || !conn.open) return
    const remotePeerId: string = conn.peer
    this.log(`Sending initial sync data to ${remotePeerId.slice(-6)}`, 'info')

    const appSyncData = this.config.getInitialSyncData() as Record<string, unknown>

    const syncDataPayload = {
      ...appSyncData,
      peers: [this._localPeerId, ...Array.from(this._connections.keys())]
        .filter(
          (id) =>
            id &&
            id !== remotePeerId &&
            this._connections.get(id!) !== 'connecting' &&
            this._connections.get(id!) !== 'connecting-incoming',
        ),
    }

    const syncMessage: DirectMessage = {
      type: 'initialSync',
      payload: syncDataPayload,
    }

    try {
      conn.send(syncMessage)
    } catch (e) {
      this.log(`Error sending initial sync to ${remotePeerId.slice(-6)}: ${(e as Error).message}`, 'error')
      this.removeConnection(remotePeerId)
    }
  }

  private handleReceivedData(data: unknown, sourceConn: DataConnection): void {
    const sourcePeerId: string | undefined = sourceConn?.peer
    if (!sourcePeerId) return

    try {
      const msg = data as Record<string, unknown>

      // --- Initial sync from host ---
      if (msg && msg.type === 'initialSync' && msg.payload) {
        const payload = msg.payload as Record<string, unknown>
        this.log(`Received initial sync from host ${sourcePeerId.slice(-6)}`, 'info')
        if (!this.initialSyncComplete) {
          this.initialSyncComplete = true
          this._isHost = false
          this._hostPeerId = sourcePeerId

          this.config.onInitialSync(payload)
          this.config.onConnectedToHost(this._hostPeerId)

          const peers = payload.peers as string[] | undefined
          peers?.forEach((pid) => {
            if (pid && pid !== this._localPeerId && !this._connections.has(pid) && !this.pendingConnections.has(pid)) {
              this.connectToPeer(pid)
            }
          })

          if (this.hostCheckTimeout) {
            clearTimeout(this.hostCheckTimeout)
            this.hostCheckTimeout = null
          }
        }
        return
      }

      // --- System messages (rejection, etc.) ---
      if (msg && msg.type === 'system' && msg.payload) {
        const payload = msg.payload as SystemPayload
        this.log(`Received system message from ${sourcePeerId.slice(-6)}: ${payload.type}`, 'info')
        if (payload.type === 'rejected') {
          this.log(`Connection rejected by ${sourcePeerId.slice(-6)}: ${payload.message}`, 'warn')
          this.config.onError('rejected', { peer: sourcePeerId, message: payload.message })
          this.removeConnection(sourcePeerId)
        }
        return
      }

      // --- Standard gossip messages ---
      const gossip = msg as unknown as GossipMessage
      if (gossip && gossip.payload && gossip.messageId && gossip.originalSenderId && gossip.ttl !== undefined) {
        const { messageId, originalSenderId, payload, ttl } = gossip

        if (this.seenMessageIds.has(messageId)) return
        if (originalSenderId === this._localPeerId) return

        this.seenMessageIds.add(messageId)
        if (this.seenMessageIds.size > MAX_SEEN_MESSAGES) {
          const oldestIds = Array.from(this.seenMessageIds).slice(0, Math.floor(MAX_SEEN_MESSAGES / 2))
          for (const id of oldestIds) this.seenMessageIds.delete(id)
        }

        // Internal system gossip (peer join/leave)
        const sysPayload = payload as SystemPayload
        if (sysPayload.type === 'system' && sysPayload.subType) {
          if (sysPayload.subType === 'peer_joined') {
            if (
              sysPayload.peerId &&
              sysPayload.peerId !== this._localPeerId &&
              !this._connections.has(sysPayload.peerId) &&
              !this.pendingConnections.has(sysPayload.peerId)
            ) {
              this.log(`Learned about new peer ${sysPayload.peerId.slice(-6)} via gossip. Connecting...`, 'info')
              this.connectToPeer(sysPayload.peerId)
            }
          } else if (sysPayload.subType === 'peer_left') {
            if (
              sysPayload.peerId &&
              sysPayload.peerId !== this._localPeerId &&
              this._connections.has(sysPayload.peerId)
            ) {
              this.log(`Learned about peer ${sysPayload.peerId.slice(-6)} leaving via gossip. Removing connection.`, 'info')
              this.removeConnection(sysPayload.peerId)
            }
          }
        } else {
          // Application data
          this.config.onDataReceived(originalSenderId, payload)
        }

        // Forward if TTL allows
        if (ttl > 0 && this._connections.size > 1) {
          this._broadcast(gossip, sourceConn, ttl - 1)
        }
        return
      }

      // --- Direct application messages ---
      if (msg && !gossip.messageId && typeof msg === 'object') {
        this.log(`Received direct message from ${sourcePeerId.slice(-6)}`, 'info')
        this.config.onDataReceived(sourcePeerId, msg)
        return
      }

      this.log(`Received unknown/malformed data from ${sourcePeerId.slice(-6)}`, 'warn')
    } catch (e) {
      this.log(`Error processing data from ${sourcePeerId.slice(-6)}: ${(e as Error).message}`, 'error')
    }
  }

  // -----------------------------------------------------------------------
  // Private — gossip broadcast
  // -----------------------------------------------------------------------

  private _broadcast(
    messageData: Partial<GossipMessage>,
    receivedFromConn: DataConnection | null = null,
    currentTtl?: number,
  ): void {
    if (!this._localPeerId || this._connections.size === 0) return

    let dataToSend: GossipMessage

    if (currentTtl === undefined) {
      if (!messageData.payload) {
        this.log('Cannot broadcast empty payload.', 'warn')
        return
      }
      dataToSend = {
        payload: messageData.payload,
        messageId: generateUniqueId(),
        originalSenderId: this._localPeerId,
        ttl: this.config.messageTTL,
      }
      this.seenMessageIds.add(dataToSend.messageId)
    } else {
      dataToSend = { ...messageData, ttl: currentTtl } as GossipMessage
    }

    this._connections.forEach((conn, peerId) => {
      if (receivedFromConn && conn === receivedFromConn) return
      if (conn && conn !== 'connecting' && conn !== 'connecting-incoming' && conn.open) {
        try {
          conn.send(dataToSend)
        } catch (e) {
          this.log(`Error broadcasting to ${peerId.slice(-6)}: ${(e as Error).message}`, 'error')
          this.removeConnection(peerId)
        }
      }
    })
  }

  // -----------------------------------------------------------------------
  // Private — host election & state management
  // -----------------------------------------------------------------------

  private becomeHost(): void {
    if (this._isHost) return
    this._isHost = true
    this._hostPeerId = this._localPeerId
    this.initialSyncComplete = true
    if (this.hostCheckTimeout) clearTimeout(this.hostCheckTimeout)
    this.hostCheckTimeout = null
    this.log('Assumed host role.', 'info')
    this.config.onBecameHost()
    this.config.onStatusUpdate(`Hosting as ${this._localPeerId!.slice(-6)}`, 'info')
  }

  private resetState(): void {
    this.log('Resetting multiplayer library state.', 'warn')
    this.peer = null
    this._localPeerId = null
    this._isHost = false
    this._hostPeerId = null
    this.isAttemptingHostId = false
    this.initialSyncComplete = false
    this._connections.clear()
    this.pendingConnections.clear()
    this.seenMessageIds.clear()
    if (this.hostCheckTimeout) clearTimeout(this.hostCheckTimeout)
    this.hostCheckTimeout = null
    this.config.onStatusUpdate('Disconnected.', 'info')
  }

  // -----------------------------------------------------------------------
  // Private — logging
  // -----------------------------------------------------------------------

  private log(message: string, type: string = 'info'): void {
    const logFn =
      type === 'error' ? console.error : type === 'warn' ? console.warn : console.log
    logFn(`[PeerManager] ${message}`)
  }
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function generateUniqueId(prefix = 'msg'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}
