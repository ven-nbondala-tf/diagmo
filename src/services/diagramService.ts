import { supabase } from './supabase'
import type { Diagram, DiagramNode, DiagramEdge, DiagramVersion, DiagramStatus } from '@/types'

interface CreateDiagramInput {
  name: string
  description?: string
  folderId?: string
  workspaceId?: string
  nodes: DiagramNode[]
  edges: DiagramEdge[]
}

interface UpdateDiagramInput {
  name?: string
  description?: string
  folderId?: string
  nodes?: DiagramNode[]
  edges?: DiagramEdge[]
  thumbnail?: string
  status?: DiagramStatus
}

export interface SharedUser {
  id: string
  userId: string | null
  email: string | null
  fullName: string | null
  avatarUrl: string | null
  permission: 'view' | 'edit'
}

function mapDiagramFromDB(row: Record<string, unknown>): Diagram {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string | undefined,
    userId: row.user_id as string,
    folderId: row.folder_id as string | undefined,
    workspaceId: row.workspace_id as string | undefined,
    nodes: (row.nodes as DiagramNode[]) || [],
    edges: (row.edges as DiagramEdge[]) || [],
    thumbnail: row.thumbnail as string | undefined,
    status: (row.status as DiagramStatus) || 'draft',
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export const diagramService = {
  async getAll(): Promise<Diagram[]> {
    // Get current user to filter only owned diagrams
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('diagrams')
      .select('*')
      .eq('user_id', user.id) // Only fetch diagrams owned by current user
      .order('updated_at', { ascending: false })

    if (error) throw error
    return (data || []).map(mapDiagramFromDB)
  },

  async getById(id: string): Promise<Diagram | null> {
    const { data, error } = await supabase
      .from('diagrams')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data ? mapDiagramFromDB(data) : null
  },

  async create(input: CreateDiagramInput): Promise<Diagram> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Build insert object - only include workspace_id if provided
    // (column may not exist if migration not applied)
    const insertData: Record<string, unknown> = {
      name: input.name,
      description: input.description,
      folder_id: input.folderId,
      nodes: input.nodes,
      edges: input.edges,
      user_id: user.id,
    }

    // Only add workspace_id if explicitly provided
    if (input.workspaceId) {
      insertData.workspace_id = input.workspaceId
    }

    const { data, error } = await supabase
      .from('diagrams')
      .insert(insertData)
      .select()
      .single()

    if (error) throw error
    return mapDiagramFromDB(data)
  },

  async update(id: string, input: UpdateDiagramInput): Promise<Diagram> {
    const updateData: Record<string, unknown> = {}
    if (input.name !== undefined) updateData.name = input.name
    if (input.description !== undefined) updateData.description = input.description
    if (input.folderId !== undefined) updateData.folder_id = input.folderId
    if (input.nodes !== undefined) updateData.nodes = input.nodes
    if (input.edges !== undefined) updateData.edges = input.edges
    if (input.thumbnail !== undefined) updateData.thumbnail = input.thumbnail
    if (input.status !== undefined) updateData.status = input.status

    const { data, error } = await supabase
      .from('diagrams')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return mapDiagramFromDB(data)
  },

  async updateStatus(id: string, status: DiagramStatus): Promise<Diagram> {
    return this.update(id, { status })
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('diagrams')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getByFolder(folderId: string | null, workspaceId?: string | null): Promise<Diagram[]> {
    // Note: With RLS policies, user can see diagrams they own OR workspace diagrams
    // This query relies on RLS to filter appropriately

    // Get current user to filter owned diagrams
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    let query = supabase
      .from('diagrams')
      .select('*')
      .eq('user_id', user.id) // Only user's own diagrams for now
      .order('updated_at', { ascending: false })

    // Filter by folder - only filter if a specific folder is selected
    // When folderId is null, show ALL diagrams (including those in folders)
    if (folderId) {
      query = query.eq('folder_id', folderId)
    }
    // When folderId is null, don't filter - show all diagrams

    const { data, error } = await query

    // If error due to missing workspace_id column, that's fine - it means
    // the workspace migration hasn't been applied yet
    if (error) {
      // Check if it's a column-not-found error (workspace_id doesn't exist)
      if (error.message?.includes('workspace_id')) {
        console.warn('workspace_id column not found - workspace migration may not be applied')
        // Retry without workspace filter
        let retryQuery = supabase
          .from('diagrams')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })

        // Only filter by folder if a specific folder is selected
        if (folderId) {
          retryQuery = retryQuery.eq('folder_id', folderId)
        }

        const { data: retryData, error: retryError } = await retryQuery
        if (retryError) throw retryError
        return (retryData || []).map(mapDiagramFromDB)
      }
      throw error
    }

    // If workspaceId filter was requested but we're in "no workspace" mode,
    // filter client-side (workspace_id column exists but user wants personal only)
    if (!workspaceId) {
      return (data || [])
        .filter(d => !d.workspace_id)
        .map(mapDiagramFromDB)
    }

    // Return workspace diagrams
    return (data || [])
      .filter(d => d.workspace_id === workspaceId)
      .map(mapDiagramFromDB)
  },

  async duplicate(id: string): Promise<Diagram> {
    // First get the original diagram
    const original = await this.getById(id)
    if (!original) throw new Error('Diagram not found')

    // Create a copy with a new name
    return this.create({
      name: `${original.name} (Copy)`,
      description: original.description,
      folderId: original.folderId,
      nodes: original.nodes,
      edges: original.edges,
    })
  },

  async moveToFolder(id: string, folderId: string | null): Promise<Diagram> {
    return this.update(id, { folderId: folderId || undefined })
  },

  // Version history functions
  async getVersions(diagramId: string): Promise<DiagramVersion[]> {
    const { data, error } = await supabase
      .from('diagram_versions')
      .select('*')
      .eq('diagram_id', diagramId)
      .order('version', { ascending: false })

    if (error) throw error
    return (data || []).map((row) => ({
      id: row.id as string,
      diagramId: row.diagram_id as string,
      version: row.version as number,
      nodes: (row.nodes as DiagramNode[]) || [],
      edges: (row.edges as DiagramEdge[]) || [],
      createdAt: row.created_at as string,
    }))
  },

  async createVersion(diagramId: string, nodes: DiagramNode[], edges: DiagramEdge[]): Promise<DiagramVersion> {
    // Get the latest version number
    const { data: existing } = await supabase
      .from('diagram_versions')
      .select('version')
      .eq('diagram_id', diagramId)
      .order('version', { ascending: false })
      .limit(1)

    const nextVersion = existing && existing.length > 0 && existing[0] ? (existing[0].version as number) + 1 : 1

    const { data, error } = await supabase
      .from('diagram_versions')
      .insert({
        diagram_id: diagramId,
        version: nextVersion,
        nodes,
        edges,
      })
      .select()
      .single()

    if (error) throw error
    return {
      id: data.id as string,
      diagramId: data.diagram_id as string,
      version: data.version as number,
      nodes: (data.nodes as DiagramNode[]) || [],
      edges: (data.edges as DiagramEdge[]) || [],
      createdAt: data.created_at as string,
    }
  },

  async deleteVersion(versionId: string): Promise<void> {
    const { error } = await supabase
      .from('diagram_versions')
      .delete()
      .eq('id', versionId)

    if (error) throw error
  },

  async restoreVersion(diagramId: string, version: DiagramVersion): Promise<Diagram> {
    // Update the diagram with the version's nodes and edges
    return this.update(diagramId, {
      nodes: version.nodes,
      edges: version.edges,
    })
  },

  async getSharedUsers(diagramId: string): Promise<SharedUser[]> {
    // Fetch shares with profile info via join
    const { data, error } = await supabase
      .from('diagram_shares')
      .select(`
        id,
        shared_with_user_id,
        shared_with_email,
        permission,
        profiles:shared_with_user_id (
          full_name,
          avatar_url
        )
      `)
      .eq('diagram_id', diagramId)

    if (error) {
      console.warn('Error fetching shared users:', error)
      return []
    }

    return (data || []).map((share) => {
      // Supabase returns profile as object or array depending on join
      const profiles = share.profiles as { full_name: string | null; avatar_url: string | null } | { full_name: string | null; avatar_url: string | null }[] | null
      const profile = Array.isArray(profiles) ? profiles[0] : profiles
      return {
        id: share.id as string,
        userId: share.shared_with_user_id as string | null,
        email: share.shared_with_email as string | null,
        fullName: profile?.full_name || null,
        avatarUrl: profile?.avatar_url || null,
        permission: share.permission as 'view' | 'edit',
      }
    })
  },

  async getSharedUsersForMultiple(diagramIds: string[]): Promise<Record<string, SharedUser[]>> {
    if (diagramIds.length === 0) return {}

    const { data, error } = await supabase
      .from('diagram_shares')
      .select(`
        id,
        diagram_id,
        shared_with_user_id,
        shared_with_email,
        permission,
        profiles:shared_with_user_id (
          full_name,
          avatar_url
        )
      `)
      .in('diagram_id', diagramIds)

    if (error) {
      console.warn('Error fetching shared users for multiple diagrams:', error)
      return {}
    }

    const result: Record<string, SharedUser[]> = {}
    for (const share of data || []) {
      const diagramId = share.diagram_id as string
      if (!result[diagramId]) {
        result[diagramId] = []
      }
      // Supabase returns profile as object or array depending on join
      const profiles = share.profiles as { full_name: string | null; avatar_url: string | null } | { full_name: string | null; avatar_url: string | null }[] | null
      const profile = Array.isArray(profiles) ? profiles[0] : profiles
      result[diagramId].push({
        id: share.id as string,
        userId: share.shared_with_user_id as string | null,
        email: share.shared_with_email as string | null,
        fullName: profile?.full_name || null,
        avatarUrl: profile?.avatar_url || null,
        permission: share.permission as 'view' | 'edit',
      })
    }
    return result
  },
}
