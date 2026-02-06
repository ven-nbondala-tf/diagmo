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
  onError?: (error: Error) => void
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

    // Subscribe and track own presence
    await this.channel.subscribe(async (status, err) => {
      console.log('[Collaboration] Channel status:', status, err)
      if (status === 'SUBSCRIBED') {
        this.isSubscribed = true
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
      } else if (status === 'CLOSED') {
        this.isSubscribed = false
      }
    })

    // Start heartbeat to keep DB presence alive
    this.startHeartbeat()
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
   * Update cursor position (via Presence)
   */
  async updateCursor(x: number | null, y: number | null): Promise<void> {
    if (!this.channel || !this.userId || !this.isSubscribed) return

    await this.channel.track({
      visitorId: this.userId,
      cursorX: x,
      cursorY: y,
      color: this.userColor,
      userName: this.userName,
    })

    // Also update DB for persistence
    await supabase
      .from('diagram_presence')
      .update({
        cursor_x: x,
        cursor_y: y,
        last_seen: new Date().toISOString(),
      })
      .eq('diagram_id', this.diagramId)
      .eq('user_id', this.userId)
  }

  /**
   * Update viewport position
   */
  async updateViewport(
    x: number,
    y: number,
    zoom: number
  ): Promise<void> {
    if (!this.diagramId || !this.userId) return

    await supabase
      .from('diagram_presence')
      .update({
        viewport_x: x,
        viewport_y: y,
        viewport_zoom: zoom,
        last_seen: new Date().toISOString(),
      })
      .eq('diagram_id', this.diagramId)
      .eq('user_id', this.userId)
  }

  /**
   * Start heartbeat to keep presence alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(async () => {
      if (!this.diagramId || !this.userId) return

      await supabase
        .from('diagram_presence')
        .update({
          last_seen: new Date().toISOString(),
        })
        .eq('diagram_id', this.diagramId)
        .eq('user_id', this.userId)
    }, 30000)
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
    return this.channel !== null
  }
}

// Export singleton instance
export const collaborationService = new CollaborationService()
