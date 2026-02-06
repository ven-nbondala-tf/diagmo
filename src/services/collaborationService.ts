import { supabase } from './supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { CollaboratorPresence } from '@/types'

// Color palette for collaborator cursors
const CURSOR_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
]

// Get a consistent color for a user based on their ID
function getUserColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i)
    hash = hash & hash
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length]!
}

interface DiagramChangePayload {
  nodes: unknown[]
  edges: unknown[]
  updatedAt: string
}

interface NodeDragPayload {
  userId: string
  nodeId: string
  position: { x: number; y: number }
}

interface NodesDragPayload {
  userId: string
  nodes: Array<{ id: string; position: { x: number; y: number } }>
}

// Operation-based sync types
export type OperationType =
  | 'node-create'
  | 'node-update'
  | 'node-delete'
  | 'edge-create'
  | 'edge-update'
  | 'edge-delete'

export interface SyncOperation {
  id: string
  type: OperationType
  targetId: string
  data?: Record<string, unknown>
  timestamp: number
  userId: string
  userName?: string
}

interface OperationPayload {
  operation: SyncOperation
}

// Node locking types
export interface NodeLock {
  nodeId: string
  userId: string
  userName: string
  color: string
  acquiredAt: number
  expiresAt: number
}

interface LockPayload {
  lock: NodeLock
}

interface UnlockPayload {
  nodeId: string
  userId: string
}

interface PresenceState {
  visitorId: string
  cursorX: number | null
  cursorY: number | null
  color: string
  userName: string
  draggingNodeId?: string
  draggingPosition?: { x: number; y: number }
}

interface CollaborationCallbacks {
  onPresenceChange?: (collaborators: CollaboratorPresence[]) => void
  onDiagramChange?: (payload: DiagramChangePayload) => void
  onNodeDrag?: (payload: NodeDragPayload) => void
  onNodesDrag?: (payload: NodesDragPayload) => void
  onOperation?: (operation: SyncOperation) => void
  onNodeLock?: (lock: NodeLock) => void
  onNodeUnlock?: (nodeId: string, userId: string) => void
  onError?: (error: Error) => void
  onConnectionStatusChange?: (status: 'connected' | 'disconnected' | 'reconnecting') => void
}

class CollaborationService {
  private channel: RealtimeChannel | null = null
  private diagramId: string | null = null
  private userId: string | null = null
  private userName: string | null = null
  private userColor: string | null = null
  private presenceId: string | null = null
  private callbacks: CollaborationCallbacks = {}
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null
  private isSubscribed: boolean = false

  // Reconnection state
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private reconnectDelay: number = 1000 // Start with 1s, exponential backoff
  private isReconnecting: boolean = false

  // Last known positions for heartbeat persistence
  private lastCursorX: number | null = null
  private lastCursorY: number | null = null
  private lastViewportX: number | null = null
  private lastViewportY: number | null = null
  private lastViewportZoom: number = 1

  // Node locking state
  private locks: Map<string, NodeLock> = new Map()
  private lockCleanupInterval: ReturnType<typeof setInterval> | null = null
  private readonly LOCK_DURATION = 30000 // 30 seconds

  /**
   * Join a diagram's collaboration session
   */
  async join(
    diagramId: string,
    callbacks: CollaborationCallbacks = {}
  ): Promise<void> {
    // If already connected to this diagram, just update callbacks
    if (this.channel && this.diagramId === diagramId && this.isSubscribed) {
      console.log('[Collaboration] Already connected to this diagram, updating callbacks')
      this.callbacks = callbacks
      return
    }

    // If connected to a different diagram, leave first
    if (this.channel && this.diagramId !== diagramId) {
      console.log('[Collaboration] Switching diagrams, leaving previous')
      await this.leave()
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User must be authenticated to join collaboration')
    }

    console.log('[Collaboration] Joining diagram:', diagramId)
    this.diagramId = diagramId
    this.userId = user.id
    this.callbacks = callbacks
    this.userColor = getUserColor(user.id)

    // Get user name from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .single()
    this.userName = profile?.full_name || user.email || 'Anonymous'

    // Insert or update presence record in DB for persistent tracking
    const { data: presence, error: presenceError } = await supabase
      .from('diagram_presence')
      .upsert({
        diagram_id: diagramId,
        user_id: user.id,
        color: this.userColor,
        cursor_x: null,
        cursor_y: null,
        last_seen: new Date().toISOString(),
      }, {
        onConflict: 'diagram_id,user_id',
      })
      .select()
      .single()

    if (presenceError) {
      console.error('Error creating presence:', presenceError)
    } else {
      this.presenceId = presence.id
    }

    // Create realtime channel with Presence
    this.channel = supabase.channel(`diagram:${diagramId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    })

    // Track presence sync for collaborator list
    this.channel.on('presence', { event: 'sync' }, () => {
      const state = this.channel?.presenceState() || {}
      console.log('[Collaboration] Presence sync:', state)
      this.updateCollaboratorsFromPresence(state)
    })

    // Listen for broadcast messages (for node drags and full sync)
    this.channel
      .on('broadcast', { event: 'diagram-update' }, (payload) => {
        console.log('[Collaboration] Received diagram-update:', payload)
        if (payload.payload?.userId === this.userId) return
        if (this.callbacks.onDiagramChange) {
          this.callbacks.onDiagramChange({
            nodes: payload.payload?.nodes || [],
            edges: payload.payload?.edges || [],
            updatedAt: payload.payload?.updatedAt || new Date().toISOString(),
          })
        }
      })
      .on('broadcast', { event: 'node-drag' }, (payload) => {
        if (payload.payload?.userId === this.userId) return
        console.log('[Collaboration] Received node-drag:', payload.payload)
        if (this.callbacks.onNodeDrag) {
          this.callbacks.onNodeDrag({
            userId: payload.payload?.userId,
            nodeId: payload.payload?.nodeId,
            position: payload.payload?.position,
          })
        }
      })
      .on('broadcast', { event: 'nodes-drag' }, (payload) => {
        if (payload.payload?.userId === this.userId) return
        if (this.callbacks.onNodesDrag) {
          this.callbacks.onNodesDrag({
            userId: payload.payload?.userId,
            nodes: payload.payload?.nodes || [],
          })
        }
      })
      // Operation-based sync listener
      .on('broadcast', { event: 'operation' }, (payload) => {
        const op = (payload.payload as OperationPayload)?.operation
        if (!op || op.userId === this.userId) return
        console.log('[Collaboration] Received operation:', op.type, op.targetId)
        this.callbacks.onOperation?.(op)
      })
      // Node lock listeners
      .on('broadcast', { event: 'node-lock' }, (payload) => {
        const lock = (payload.payload as LockPayload)?.lock
        if (!lock || lock.userId === this.userId) return
        console.log('[Collaboration] Received node-lock:', lock.nodeId, 'by', lock.userName)
        this.locks.set(lock.nodeId, lock)
        this.callbacks.onNodeLock?.(lock)
      })
      .on('broadcast', { event: 'node-unlock' }, (payload) => {
        const { nodeId, userId } = (payload.payload as UnlockPayload) || {}
        if (!nodeId || userId === this.userId) return
        console.log('[Collaboration] Received node-unlock:', nodeId)
        this.locks.delete(nodeId)
        this.callbacks.onNodeUnlock?.(nodeId, userId)
      })

    // Subscribe and track own presence
    await this.channel.subscribe(async (status, err) => {
      console.log('[Collaboration] Channel status:', status, err)
      if (status === 'SUBSCRIBED') {
        this.isSubscribed = true
        this.reconnectAttempts = 0 // Reset on successful connection
        this.isReconnecting = false

        // Notify connection status
        this.callbacks.onConnectionStatusChange?.('connected')

        // Track this user's presence
        await this.channel?.track({
          visitorId: this.userId,
          cursorX: null,
          cursorY: null,
          color: this.userColor,
          userName: this.userName,
        })
        console.log('[Collaboration] Presence tracked, channel ready for broadcast')
      } else if (status === 'CHANNEL_ERROR') {
        console.error('[Collaboration] Channel error:', err)
        this.isSubscribed = false
        this.callbacks.onConnectionStatusChange?.('disconnected')
        this.handleDisconnect()
      } else if (status === 'CLOSED') {
        this.isSubscribed = false
        if (!this.isReconnecting) {
          this.callbacks.onConnectionStatusChange?.('disconnected')
          this.handleDisconnect()
        }
      }
    })

    // Start heartbeat to keep DB presence alive
    this.startHeartbeat()

    // Start lock cleanup interval (clean up expired locks every 5 seconds)
    this.startLockCleanup()
  }

  /**
   * Update collaborators list from presence state
   */
  private updateCollaboratorsFromPresence(state: Record<string, unknown[]>): void {
    const collaborators: CollaboratorPresence[] = []

    for (const [userId, presences] of Object.entries(state)) {
      if (userId === this.userId) continue // Skip self

      const presence = presences[0] as PresenceState | undefined
      if (!presence) continue

      collaborators.push({
        id: userId,
        diagramId: this.diagramId || '',
        userId: userId,
        cursorX: presence.cursorX,
        cursorY: presence.cursorY,
        viewportX: null,
        viewportY: null,
        viewportZoom: 1,
        color: presence.color || '#3b82f6',
        lastSeen: new Date().toISOString(),
        user: {
          fullName: presence.userName || null,
          avatarUrl: null,
        },
      })
    }

    this.callbacks.onPresenceChange?.(collaborators)
  }

  /**
   * Leave the collaboration session
   */
  async leave(): Promise<void> {
    // Stop heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }

    // Stop lock cleanup
    if (this.lockCleanupInterval) {
      clearInterval(this.lockCleanupInterval)
      this.lockCleanupInterval = null
    }

    // Release any locks held by this user
    for (const [nodeId, lock] of this.locks.entries()) {
      if (lock.userId === this.userId) {
        await this.releaseLock(nodeId)
      }
    }
    this.locks.clear()

    // Untrack presence and unsubscribe
    if (this.channel) {
      await this.channel.untrack()
      await supabase.removeChannel(this.channel)
      this.channel = null
    }

    // Remove DB presence record
    if (this.diagramId && this.userId) {
      await supabase
        .from('diagram_presence')
        .delete()
        .eq('diagram_id', this.diagramId)
        .eq('user_id', this.userId)
    }

    this.diagramId = null
    this.userId = null
    this.userName = null
    this.userColor = null
    this.presenceId = null
    this.callbacks = {}
    this.isSubscribed = false
  }

  /**
   * Update cursor position (via Presence only - no DB writes for scalability)
   */
  async updateCursor(x: number | null, y: number | null): Promise<void> {
    if (!this.channel || !this.userId || !this.isSubscribed) return

    // Store last known position for heartbeat persistence
    this.lastCursorX = x
    this.lastCursorY = y

    // Only use WebSocket for real-time cursor updates - no DB writes
    await this.channel.track({
      visitorId: this.userId,
      cursorX: x,
      cursorY: y,
      color: this.userColor,
      userName: this.userName,
    })
  }

  /**
   * Update viewport position (stored locally, persisted via heartbeat)
   */
  updateViewport(x: number, y: number, zoom: number): void {
    // Just store locally - heartbeat will persist to DB every 30s
    this.lastViewportX = x
    this.lastViewportY = y
    this.lastViewportZoom = zoom
  }

  /**
   * Start heartbeat to keep presence alive and persist positions (every 30s)
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(async () => {
      if (!this.diagramId || !this.userId) return

      // Persist cursor and viewport positions to DB (only on heartbeat, not every update)
      await supabase
        .from('diagram_presence')
        .update({
          cursor_x: this.lastCursorX,
          cursor_y: this.lastCursorY,
          viewport_x: this.lastViewportX,
          viewport_y: this.lastViewportY,
          viewport_zoom: this.lastViewportZoom,
          last_seen: new Date().toISOString(),
        })
        .eq('diagram_id', this.diagramId)
        .eq('user_id', this.userId)
    }, 30000)
  }

  /**
   * Handle disconnect and attempt reconnection with exponential backoff
   */
  private async handleDisconnect(): Promise<void> {
    if (this.isReconnecting) return // Already reconnecting
    if (!this.diagramId) return // No diagram to reconnect to

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[Collaboration] Max reconnection attempts reached')
      this.callbacks.onError?.(new Error('Max reconnection attempts reached. Please refresh the page.'))
      return
    }

    this.isReconnecting = true
    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    console.log(`[Collaboration] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    this.callbacks.onConnectionStatusChange?.('reconnecting')

    await new Promise(resolve => setTimeout(resolve, delay))

    try {
      // Clean up old channel
      if (this.channel) {
        await supabase.removeChannel(this.channel)
        this.channel = null
      }

      // Rejoin with stored diagram ID and callbacks
      const savedDiagramId = this.diagramId
      const savedCallbacks = this.callbacks
      this.diagramId = null // Reset so join doesn't think we're already connected

      await this.join(savedDiagramId!, savedCallbacks)
      console.log('[Collaboration] Reconnected successfully')
    } catch (error) {
      console.error('[Collaboration] Reconnection failed:', error)
      this.isReconnecting = false
      this.handleDisconnect() // Retry
    }
  }

  /**
   * Broadcast diagram changes to other collaborators
   */
  async broadcastDiagramChange(nodes: unknown[], edges: unknown[]): Promise<void> {
    if (!this.channel || !this.userId || !this.isSubscribed) {
      console.log('[Collaboration] Cannot broadcast - channel not ready:', {
        hasChannel: !!this.channel,
        hasUserId: !!this.userId,
        isSubscribed: this.isSubscribed,
      })
      return
    }

    console.log('[Collaboration] Broadcasting diagram-update via WebSocket')
    const result = await this.channel.send({
      type: 'broadcast',
      event: 'diagram-update',
      payload: {
        userId: this.userId,
        nodes,
        edges,
        updatedAt: new Date().toISOString(),
      },
    })
    console.log('[Collaboration] Broadcast result:', result)
  }

  /**
   * Broadcast a single node change (for live updates)
   */
  async broadcastNodeChange(nodeId: string, changes: Record<string, unknown>): Promise<void> {
    if (!this.channel || !this.userId) return

    await this.channel.send({
      type: 'broadcast',
      event: 'node-change',
      payload: {
        userId: this.userId,
        nodeId,
        changes,
      },
    })
  }

  /**
   * Broadcast node position change (for dragging)
   */
  async broadcastNodeDrag(nodeId: string, position: { x: number; y: number }): Promise<void> {
    if (!this.channel || !this.userId || !this.isSubscribed) {
      return // Silently skip if not ready (this is called frequently during drag)
    }

    await this.channel.send({
      type: 'broadcast',
      event: 'node-drag',
      payload: {
        userId: this.userId,
        nodeId,
        position,
      },
    })
  }

  /**
   * Broadcast multiple nodes position change (for multi-select drag)
   */
  async broadcastNodesDrag(nodes: Array<{ id: string; position: { x: number; y: number } }>): Promise<void> {
    if (!this.channel || !this.userId || !this.isSubscribed) return

    await this.channel.send({
      type: 'broadcast',
      event: 'nodes-drag',
      payload: {
        userId: this.userId,
        nodes,
      },
    })
  }

  /**
   * Get current presence ID
   */
  getPresenceId(): string | null {
    return this.presenceId
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.channel !== null && this.isSubscribed
  }

  /**
   * Check if currently reconnecting
   */
  isCurrentlyReconnecting(): boolean {
    return this.isReconnecting
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): 'connected' | 'disconnected' | 'reconnecting' {
    if (this.isReconnecting) return 'reconnecting'
    if (this.channel && this.isSubscribed) return 'connected'
    return 'disconnected'
  }

  // ============================================================================
  // OPERATION-BASED SYNC
  // ============================================================================

  /**
   * Broadcast an incremental operation to other collaborators
   * This is more efficient than broadcasting the full diagram
   */
  async broadcastOperation(
    type: OperationType,
    targetId: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    if (!this.channel || !this.userId || !this.isSubscribed) return

    const operation: SyncOperation = {
      id: `${this.userId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type,
      targetId,
      data,
      timestamp: Date.now(),
      userId: this.userId,
      userName: this.userName || undefined,
    }

    await this.channel.send({
      type: 'broadcast',
      event: 'operation',
      payload: { operation },
    })
  }

  // ============================================================================
  // NODE LOCKING
  // ============================================================================

  /**
   * Start the lock cleanup interval to remove expired locks
   */
  private startLockCleanup(): void {
    this.lockCleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [nodeId, lock] of this.locks.entries()) {
        if (lock.expiresAt < now) {
          console.log('[Collaboration] Lock expired for node:', nodeId)
          this.locks.delete(nodeId)
          this.callbacks.onNodeUnlock?.(nodeId, lock.userId)
        }
      }
    }, 5000) // Check every 5 seconds
  }

  /**
   * Try to acquire a lock on a node
   * Returns true if lock was acquired, false if node is already locked by another user
   */
  async acquireLock(nodeId: string): Promise<boolean> {
    if (!this.channel || !this.userId || !this.isSubscribed) return false

    // Check if already locked by another user
    const existingLock = this.locks.get(nodeId)
    if (existingLock && existingLock.userId !== this.userId) {
      // Check if lock is expired
      if (existingLock.expiresAt > Date.now()) {
        console.log('[Collaboration] Node already locked by:', existingLock.userName)
        return false
      }
      // Lock is expired, remove it
      this.locks.delete(nodeId)
    }

    // Create new lock
    const now = Date.now()
    const lock: NodeLock = {
      nodeId,
      userId: this.userId,
      userName: this.userName || 'Unknown',
      color: this.userColor || '#3b82f6',
      acquiredAt: now,
      expiresAt: now + this.LOCK_DURATION,
    }

    // Store locally
    this.locks.set(nodeId, lock)

    // Broadcast to others
    await this.channel.send({
      type: 'broadcast',
      event: 'node-lock',
      payload: { lock },
    })

    return true
  }

  /**
   * Release a lock on a node
   */
  async releaseLock(nodeId: string): Promise<void> {
    if (!this.channel || !this.userId || !this.isSubscribed) return

    const lock = this.locks.get(nodeId)
    if (!lock || lock.userId !== this.userId) return // Can only release own locks

    // Remove locally
    this.locks.delete(nodeId)

    // Broadcast to others
    await this.channel.send({
      type: 'broadcast',
      event: 'node-unlock',
      payload: { nodeId, userId: this.userId },
    })
  }

  /**
   * Renew a lock (extend its expiration)
   * Call this periodically while editing a node
   */
  async renewLock(nodeId: string): Promise<boolean> {
    const lock = this.locks.get(nodeId)
    if (!lock || lock.userId !== this.userId) return false

    // Update expiration
    lock.expiresAt = Date.now() + this.LOCK_DURATION
    this.locks.set(nodeId, lock)

    // Broadcast updated lock
    await this.channel?.send({
      type: 'broadcast',
      event: 'node-lock',
      payload: { lock },
    })

    return true
  }

  /**
   * Check if a node is locked by another user
   */
  isNodeLocked(nodeId: string): boolean {
    const lock = this.locks.get(nodeId)
    if (!lock) return false
    if (lock.userId === this.userId) return false // Own lock doesn't count
    return lock.expiresAt > Date.now()
  }

  /**
   * Get lock info for a node (if locked by another user)
   */
  getNodeLock(nodeId: string): NodeLock | null {
    const lock = this.locks.get(nodeId)
    if (!lock) return null
    if (lock.userId === this.userId) return null // Don't return own locks
    if (lock.expiresAt <= Date.now()) return null // Expired
    return lock
  }

  /**
   * Get all current locks (excluding own locks)
   */
  getLocks(): NodeLock[] {
    const now = Date.now()
    return Array.from(this.locks.values()).filter(
      lock => lock.userId !== this.userId && lock.expiresAt > now
    )
  }

  /**
   * Get user info
   */
  getUserId(): string | null {
    return this.userId
  }

  getUserColor(): string | null {
    return this.userColor
  }
}

// Export singleton instance
export const collaborationService = new CollaborationService()
