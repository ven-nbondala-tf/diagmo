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

interface PresencePayload {
  cursor_x: number | null
  cursor_y: number | null
  viewport_x: number | null
  viewport_y: number | null
  viewport_zoom: number
}

interface CollaborationCallbacks {
  onPresenceChange?: (collaborators: CollaboratorPresence[]) => void
  onError?: (error: Error) => void
}

class CollaborationService {
  private channel: RealtimeChannel | null = null
  private diagramId: string | null = null
  private userId: string | null = null
  private presenceId: string | null = null
  private callbacks: CollaborationCallbacks = {}
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null

  /**
   * Join a diagram's collaboration session
   */
  async join(
    diagramId: string,
    callbacks: CollaborationCallbacks = {}
  ): Promise<void> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User must be authenticated to join collaboration')
    }

    this.diagramId = diagramId
    this.userId = user.id
    this.callbacks = callbacks

    // Get user color
    const color = getUserColor(user.id)

    // Insert or update presence record
    const { data: presence, error: presenceError } = await supabase
      .from('diagram_presence')
      .upsert({
        diagram_id: diagramId,
        user_id: user.id,
        color,
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
      // Don't throw - continue without DB presence if it fails
    } else {
      this.presenceId = presence.id
    }

    // Subscribe to realtime changes
    this.channel = supabase
      .channel(`diagram:${diagramId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'diagram_presence',
          filter: `diagram_id=eq.${diagramId}`,
        },
        () => {
          // Refetch all collaborators on any change
          this.fetchCollaborators()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Initial fetch of collaborators
          this.fetchCollaborators()
        }
      })

    // Start heartbeat to keep presence alive
    this.startHeartbeat()
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

    // Unsubscribe from channel
    if (this.channel) {
      await supabase.removeChannel(this.channel)
      this.channel = null
    }

    // Remove presence record
    if (this.diagramId && this.userId) {
      await supabase
        .from('diagram_presence')
        .delete()
        .eq('diagram_id', this.diagramId)
        .eq('user_id', this.userId)
    }

    this.diagramId = null
    this.userId = null
    this.presenceId = null
    this.callbacks = {}
  }

  /**
   * Update cursor position
   */
  async updateCursor(x: number | null, y: number | null): Promise<void> {
    if (!this.diagramId || !this.userId) return

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
   * Fetch current collaborators
   */
  private async fetchCollaborators(): Promise<void> {
    if (!this.diagramId) return

    try {
      // Fetch presence records with user profiles
      const { data, error } = await supabase
        .from('diagram_presence')
        .select(`
          id,
          diagram_id,
          user_id,
          cursor_x,
          cursor_y,
          viewport_x,
          viewport_y,
          viewport_zoom,
          color,
          last_seen,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('diagram_id', this.diagramId)
        .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Only active in last 5 minutes

      if (error) {
        throw error
      }

      // Transform to CollaboratorPresence type
      const collaborators: CollaboratorPresence[] = (data || [])
        .filter((p) => p.user_id !== this.userId) // Exclude self
        .map((p) => ({
          id: p.id,
          diagramId: p.diagram_id,
          userId: p.user_id,
          cursorX: p.cursor_x,
          cursorY: p.cursor_y,
          viewportX: p.viewport_x,
          viewportY: p.viewport_y,
          viewportZoom: p.viewport_zoom || 1,
          color: p.color || '#3b82f6',
          lastSeen: p.last_seen,
          user: p.profiles ? {
            fullName: (p.profiles as { full_name: string | null }).full_name,
            avatarUrl: (p.profiles as { avatar_url: string | null }).avatar_url,
          } : undefined,
        }))

      this.callbacks.onPresenceChange?.(collaborators)
    } catch (error) {
      console.error('Error fetching collaborators:', error)
      this.callbacks.onError?.(error as Error)
    }
  }

  /**
   * Start heartbeat to keep presence alive
   */
  private startHeartbeat(): void {
    // Update presence every 30 seconds
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
