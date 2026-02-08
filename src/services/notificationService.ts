import { supabase } from './supabase'

export type NotificationType = 'share' | 'comment' | 'mention' | 'invite' | 'update' | 'system'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  diagramId?: string
  workspaceId?: string
  actorId?: string
  metadata: Record<string, unknown>
  createdAt: string
}

export const notificationService = {
  /**
   * Get all notifications for current user
   */
  async getAll(): Promise<{ data: Notification[]; error: Error | null }> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: [], error: new Error('User must be authenticated') }
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return { data: [], error: new Error(error.message) }
    }

    return {
      data: data.map(mapToNotification),
      error: null,
    }
  },

  /**
   * Get unread notifications count
   */
  async getUnreadCount(): Promise<{ count: number; error: Error | null }> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { count: 0, error: new Error('User must be authenticated') }
    }

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false)

    if (error) {
      return { count: 0, error: new Error(error.message) }
    }

    return { count: count || 0, error: null }
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<{ error: Error | null }> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)

    if (error) {
      return { error: new Error(error.message) }
    }

    return { error: null }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ error: Error | null }> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: new Error('User must be authenticated') }
    }

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)

    if (error) {
      return { error: new Error(error.message) }
    }

    return { error: null }
  },

  /**
   * Delete a notification
   */
  async delete(notificationId: string): Promise<{ error: Error | null }> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (error) {
      return { error: new Error(error.message) }
    }

    return { error: null }
  },

  /**
   * Delete all notifications
   */
  async deleteAll(): Promise<{ error: Error | null }> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: new Error('User must be authenticated') }
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      return { error: new Error(error.message) }
    }

    return { error: null }
  },

  /**
   * Subscribe to new notifications (realtime)
   */
  subscribeToNotifications(
    userId: string,
    onNotification: (notification: Notification) => void
  ): () => void {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          onNotification(mapToNotification(payload.new))
        }
      )
      .subscribe()

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel)
    }
  },
}

// Helper to map DB row to Notification
function mapToNotification(row: Record<string, unknown>): Notification {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    type: row.type as NotificationType,
    title: row.title as string,
    message: row.message as string,
    read: row.read as boolean,
    diagramId: row.diagram_id as string | undefined,
    workspaceId: row.workspace_id as string | undefined,
    actorId: row.actor_id as string | undefined,
    metadata: (row.metadata as Record<string, unknown>) || {},
    createdAt: row.created_at as string,
  }
}
