import { supabase } from './supabase'
import type { DiagramShare, SharePermission } from '@/types'

interface ShareByEmailParams {
  diagramId: string
  email: string
  permission: SharePermission
}

interface ShareResponse {
  success: boolean
  share?: DiagramShare
  error?: string
}

class SharingService {
  /**
   * Get all shares for a diagram
   */
  async getShares(diagramId: string): Promise<DiagramShare[]> {
    const { data, error } = await supabase
      .from('diagram_shares')
      .select(`
        id,
        diagram_id,
        shared_with_user_id,
        shared_with_email,
        permission,
        invited_by,
        created_at,
        accepted_at,
        profiles:shared_with_user_id (
          full_name,
          avatar_url
        )
      `)
      .eq('diagram_id', diagramId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching shares:', error)
      return []
    }

    return (data || []).map((share) => ({
      id: share.id,
      diagramId: share.diagram_id,
      sharedWithUserId: share.shared_with_user_id,
      sharedWithEmail: share.shared_with_email,
      permission: share.permission as SharePermission,
      invitedBy: share.invited_by,
      createdAt: share.created_at,
      acceptedAt: share.accepted_at,
      user: share.profiles ? {
        fullName: (share.profiles as { full_name: string | null }).full_name,
        avatarUrl: (share.profiles as { avatar_url: string | null }).avatar_url,
        email: share.shared_with_email || undefined,
      } : share.shared_with_email ? {
        fullName: null,
        avatarUrl: null,
        email: share.shared_with_email,
      } : undefined,
    }))
  }

  /**
   * Share a diagram with a user by email
   */
  async shareByEmail({
    diagramId,
    email,
    permission,
  }: ShareByEmailParams): Promise<ShareResponse> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if user exists with this email
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', (
        await supabase
          .from('auth.users')
          .select('id')
          .eq('email', email.toLowerCase())
          .single()
      ).data?.id)
      .single()

    // Try to find user by email in auth.users via a workaround
    // Since we can't directly query auth.users, we'll create a pending invite
    // and the user will be linked when they sign up or accept

    const { data: share, error } = await supabase
      .from('diagram_shares')
      .insert({
        diagram_id: diagramId,
        shared_with_email: email.toLowerCase(),
        shared_with_user_id: profiles?.user_id || null,
        permission,
        invited_by: user.id,
        accepted_at: profiles?.user_id ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'User already has access to this diagram' }
      }
      console.error('Error sharing diagram:', error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      share: {
        id: share.id,
        diagramId: share.diagram_id,
        sharedWithUserId: share.shared_with_user_id,
        sharedWithEmail: share.shared_with_email,
        permission: share.permission as SharePermission,
        invitedBy: share.invited_by,
        createdAt: share.created_at,
        acceptedAt: share.accepted_at,
      },
    }
  }

  /**
   * Update share permission
   */
  async updatePermission(
    shareId: string,
    permission: SharePermission
  ): Promise<boolean> {
    const { error } = await supabase
      .from('diagram_shares')
      .update({ permission })
      .eq('id', shareId)

    if (error) {
      console.error('Error updating permission:', error)
      return false
    }

    return true
  }

  /**
   * Remove a share (revoke access)
   */
  async removeShare(shareId: string): Promise<boolean> {
    const { error } = await supabase
      .from('diagram_shares')
      .delete()
      .eq('id', shareId)

    if (error) {
      console.error('Error removing share:', error)
      return false
    }

    return true
  }

  /**
   * Get diagrams shared with the current user
   */
  async getSharedWithMe(): Promise<{ diagramId: string; permission: SharePermission }[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('diagram_shares')
      .select('diagram_id, permission')
      .eq('shared_with_user_id', user.id)

    if (error) {
      console.error('Error fetching shared diagrams:', error)
      return []
    }

    return (data || []).map((share) => ({
      diagramId: share.diagram_id,
      permission: share.permission as SharePermission,
    }))
  }

  /**
   * Check if current user has access to a diagram
   */
  async checkAccess(diagramId: string): Promise<{
    hasAccess: boolean
    permission: SharePermission | 'owner' | null
  }> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { hasAccess: false, permission: null }

    // Check if owner
    const { data: diagram } = await supabase
      .from('diagrams')
      .select('user_id')
      .eq('id', diagramId)
      .single()

    if (diagram?.user_id === user.id) {
      return { hasAccess: true, permission: 'owner' }
    }

    // Check if shared
    const { data: share } = await supabase
      .from('diagram_shares')
      .select('permission')
      .eq('diagram_id', diagramId)
      .eq('shared_with_user_id', user.id)
      .single()

    if (share) {
      return { hasAccess: true, permission: share.permission as SharePermission }
    }

    return { hasAccess: false, permission: null }
  }
}

export const sharingService = new SharingService()
