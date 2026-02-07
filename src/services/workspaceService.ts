import { supabase } from './supabase'
import type { Workspace, WorkspaceMember, WorkspaceRole, Diagram } from '@/types'

interface CreateWorkspaceParams {
  name: string
  description?: string
}

interface InviteMemberParams {
  workspaceId: string
  email: string
  role: WorkspaceRole
}

interface WorkspaceResponse {
  success: boolean
  workspace?: Workspace
  error?: string
}

interface MemberResponse {
  success: boolean
  member?: WorkspaceMember
  error?: string
}

class WorkspaceService {
  /**
   * Check if a Supabase error indicates a missing table
   */
  private isTableNotFoundError(error: { code?: string } | null): boolean {
    // PGRST205 = "Could not find the table in the schema cache"
    return error?.code === 'PGRST205' || error?.code === '42P01'
  }

  /**
   * Get all workspaces the current user belongs to (as owner or member)
   */
  async getAll(): Promise<Workspace[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Get workspaces where user is owner
    const { data: ownedWorkspaces, error: ownedError } = await supabase
      .from('workspaces')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    // If tables don't exist yet, return empty gracefully
    if (this.isTableNotFoundError(ownedError)) {
      return []
    }

    if (ownedError) {
      console.error('Error fetching owned workspaces:', ownedError)
    }

    // Get workspaces where user is a member (not owner)
    const { data: memberships, error: memberError } = await supabase
      .from('workspace_members')
      .select('workspace_id, role')
      .eq('user_id', user.id)
      .not('accepted_at', 'is', null)

    // If tables don't exist yet, just return owned workspaces
    if (this.isTableNotFoundError(memberError)) {
      return (ownedWorkspaces || []).map(ws => this.mapWorkspace(ws, 'owner'))
    }

    if (memberError) {
      console.error('Error fetching workspace memberships:', memberError)
    }

    const memberWorkspaceIds = (memberships || []).map(m => m.workspace_id)
    let memberWorkspaces: Workspace[] = []

    if (memberWorkspaceIds.length > 0) {
      const { data: workspaces } = await supabase
        .from('workspaces')
        .select('*')
        .in('id', memberWorkspaceIds)
        .order('created_at', { ascending: false })

      memberWorkspaces = (workspaces || []).map(ws => {
        const membership = memberships?.find(m => m.workspace_id === ws.id)
        return this.mapWorkspace(ws, membership?.role as WorkspaceRole)
      })
    }

    // Get member counts for all workspaces
    const allWorkspaceIds = [
      ...(ownedWorkspaces || []).map(w => w.id),
      ...memberWorkspaceIds,
    ]

    let memberCounts: Record<string, number> = {}
    if (allWorkspaceIds.length > 0) {
      const { data: counts } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .in('workspace_id', allWorkspaceIds)
        .not('accepted_at', 'is', null)

      if (counts) {
        memberCounts = counts.reduce((acc, m) => {
          acc[m.workspace_id] = (acc[m.workspace_id] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }
    }

    // Map owned workspaces
    const owned = (ownedWorkspaces || []).map(ws => {
      const workspace = this.mapWorkspace(ws, 'owner')
      workspace.memberCount = memberCounts[ws.id] || 1
      return workspace
    })

    // Add member counts to member workspaces
    memberWorkspaces = memberWorkspaces.map(ws => ({
      ...ws,
      memberCount: memberCounts[ws.id] || 1,
    }))

    // Combine and deduplicate (in case user is both owner and has a member record)
    const allWorkspaces = [...owned]
    memberWorkspaces.forEach(ws => {
      if (!allWorkspaces.find(w => w.id === ws.id)) {
        allWorkspaces.push(ws)
      }
    })

    return allWorkspaces
  }

  /**
   * Get a single workspace by ID
   */
  async getById(id: string): Promise<Workspace | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching workspace:', error)
      return null
    }

    // Get user's role
    let role: WorkspaceRole = 'viewer'
    if (data.owner_id === user.id) {
      role = 'owner'
    } else {
      const { data: membership } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', id)
        .eq('user_id', user.id)
        .not('accepted_at', 'is', null)
        .single()

      if (membership) {
        role = membership.role as WorkspaceRole
      }
    }

    // Get member count
    const { count } = await supabase
      .from('workspace_members')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', id)
      .not('accepted_at', 'is', null)

    const workspace = this.mapWorkspace(data, role)
    workspace.memberCount = count || 1

    return workspace
  }

  /**
   * Create a new workspace (current user becomes owner)
   */
  async create({ name, description }: CreateWorkspaceParams): Promise<WorkspaceResponse> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Create the workspace
    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .insert({
        name,
        description,
        owner_id: user.id,
      })
      .select()
      .single()

    if (wsError) {
      console.error('Error creating workspace:', wsError)
      return { success: false, error: wsError.message }
    }

    // Add owner as a member with 'owner' role
    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: workspace.id,
        user_id: user.id,
        role: 'owner',
        invited_by: user.id,
        accepted_at: new Date().toISOString(),
      })

    if (memberError) {
      console.error('Error adding owner as member:', memberError)
      // Workspace was created, so return success anyway
    }

    return {
      success: true,
      workspace: {
        ...this.mapWorkspace(workspace, 'owner'),
        memberCount: 1,
      },
    }
  }

  /**
   * Update workspace details
   */
  async update(id: string, updates: { name?: string; description?: string }): Promise<WorkspaceResponse> {
    const { data, error } = await supabase
      .from('workspaces')
      .update({
        name: updates.name,
        description: updates.description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating workspace:', error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      workspace: this.mapWorkspace(data),
    }
  }

  /**
   * Delete a workspace (owner only)
   */
  async delete(id: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting workspace:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  }

  /**
   * Get all members of a workspace
   */
  async getMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const { data, error } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('role', { ascending: true })
      .order('invited_at', { ascending: true })

    if (error) {
      console.error('Error fetching workspace members:', error)
      return []
    }

    // Get profile data for accepted members
    const userIds = (data || [])
      .filter(m => m.user_id)
      .map(m => m.user_id)

    let profilesMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {}

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds)

      if (profiles) {
        profilesMap = profiles.reduce((acc, p) => {
          acc[p.user_id] = { full_name: p.full_name, avatar_url: p.avatar_url }
          return acc
        }, {} as Record<string, { full_name: string | null; avatar_url: string | null }>)
      }
    }

    return (data || []).map(member => {
      const profile = member.user_id ? profilesMap[member.user_id] : null
      return {
        id: member.id,
        workspaceId: member.workspace_id,
        userId: member.user_id,
        email: member.email,
        role: member.role as WorkspaceRole,
        invitedBy: member.invited_by,
        invitedAt: member.invited_at,
        acceptedAt: member.accepted_at,
        userName: profile?.full_name || undefined,
        userAvatar: profile?.avatar_url || undefined,
      }
    })
  }

  /**
   * Invite a member by email
   */
  async inviteMember({ workspaceId, email, role }: InviteMemberParams): Promise<MemberResponse> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Cannot invite with 'owner' role
    if (role === 'owner') {
      return { success: false, error: 'Cannot invite as owner' }
    }

    const { data, error } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: workspaceId,
        email: email.toLowerCase(),
        role,
        invited_by: user.id,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'User already invited or is a member' }
      }
      console.error('Error inviting member:', error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      member: {
        id: data.id,
        workspaceId: data.workspace_id,
        userId: data.user_id,
        email: data.email,
        role: data.role as WorkspaceRole,
        invitedBy: data.invited_by,
        invitedAt: data.invited_at,
        acceptedAt: data.accepted_at,
      },
    }
  }

  /**
   * Update a member's role
   */
  async updateMemberRole(memberId: string, role: WorkspaceRole): Promise<{ success: boolean; error?: string }> {
    // Cannot change to 'owner' role
    if (role === 'owner') {
      return { success: false, error: 'Cannot change role to owner' }
    }

    const { error } = await supabase
      .from('workspace_members')
      .update({ role })
      .eq('id', memberId)

    if (error) {
      console.error('Error updating member role:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  }

  /**
   * Remove a member from workspace
   */
  async removeMember(memberId: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('workspace_members')
      .delete()
      .eq('id', memberId)

    if (error) {
      console.error('Error removing member:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  }

  /**
   * Accept an invite (for current user)
   */
  async acceptInvite(workspaceId: string): Promise<{ success: boolean; error?: string }> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Find the pending invite by email
    const { data: invite, error: findError } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('email', user.email)
      .is('accepted_at', null)
      .single()

    if (findError || !invite) {
      return { success: false, error: 'Invite not found' }
    }

    // Update the invite with user_id and accepted_at
    const { error } = await supabase
      .from('workspace_members')
      .update({
        user_id: user.id,
        accepted_at: new Date().toISOString(),
      })
      .eq('id', invite.id)

    if (error) {
      console.error('Error accepting invite:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  }

  /**
   * Decline an invite
   */
  async declineInvite(workspaceId: string): Promise<{ success: boolean; error?: string }> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('email', user.email)
      .is('accepted_at', null)

    if (error) {
      console.error('Error declining invite:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  }

  /**
   * Get pending invites for current user
   */
  async getPendingInvites(): Promise<{ workspace: Workspace; invite: WorkspaceMember }[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Find invites by email that haven't been accepted
    const { data: invites, error: inviteError } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('email', user.email)
      .is('accepted_at', null)

    // If tables don't exist yet, return empty gracefully
    if (this.isTableNotFoundError(inviteError)) {
      return []
    }

    if (inviteError || !invites || invites.length === 0) {
      return []
    }

    // Get workspace details
    const workspaceIds = invites.map(i => i.workspace_id)
    const { data: workspaces } = await supabase
      .from('workspaces')
      .select('*')
      .in('id', workspaceIds)

    if (!workspaces) return []

    return invites.map(invite => {
      const workspace = workspaces.find(w => w.id === invite.workspace_id)
      return {
        workspace: this.mapWorkspace(workspace!),
        invite: {
          id: invite.id,
          workspaceId: invite.workspace_id,
          userId: invite.user_id,
          email: invite.email,
          role: invite.role as WorkspaceRole,
          invitedBy: invite.invited_by,
          invitedAt: invite.invited_at,
          acceptedAt: invite.accepted_at,
        },
      }
    }).filter(item => item.workspace)
  }

  /**
   * Get diagrams in a workspace
   */
  async getDiagrams(workspaceId: string): Promise<Diagram[]> {
    const { data, error } = await supabase
      .from('diagrams')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching workspace diagrams:', error)
      return []
    }

    return (data || []).map(d => ({
      id: d.id,
      name: d.name,
      description: d.description,
      userId: d.user_id,
      folderId: d.folder_id,
      workspaceId: d.workspace_id,
      nodes: d.nodes || [],
      edges: d.edges || [],
      layers: d.layers,
      thumbnail: d.thumbnail,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }))
  }

  /**
   * Move a diagram to a workspace (or back to personal)
   */
  async moveDiagramToWorkspace(
    diagramId: string,
    workspaceId: string | null
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('diagrams')
      .update({
        workspace_id: workspaceId,
        folder_id: null, // Clear folder when moving between workspaces
        updated_at: new Date().toISOString(),
      })
      .eq('id', diagramId)

    if (error) {
      console.error('Error moving diagram to workspace:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  }

  /**
   * Leave a workspace (for non-owners)
   */
  async leaveWorkspace(workspaceId: string): Promise<{ success: boolean; error?: string }> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if user is owner
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('owner_id')
      .eq('id', workspaceId)
      .single()

    if (workspace?.owner_id === user.id) {
      return { success: false, error: 'Owners cannot leave their workspace. Transfer ownership or delete the workspace.' }
    }

    const { error } = await supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error leaving workspace:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  }

  /**
   * Helper to map DB workspace to TypeScript interface
   */
  private mapWorkspace(data: {
    id: string
    name: string
    description: string | null
    owner_id: string
    created_at: string
    updated_at: string
  }, role?: WorkspaceRole): Workspace {
    return {
      id: data.id,
      name: data.name,
      description: data.description || undefined,
      ownerId: data.owner_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      role,
    }
  }
}

export const workspaceService = new WorkspaceService()
