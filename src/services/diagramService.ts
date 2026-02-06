import { supabase } from './supabase'
import type { Diagram, DiagramNode, DiagramEdge, DiagramVersion } from '@/types'

interface CreateDiagramInput {
  name: string
  description?: string
  folderId?: string
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
}

function mapDiagramFromDB(row: Record<string, unknown>): Diagram {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string | undefined,
    userId: row.user_id as string,
    folderId: row.folder_id as string | undefined,
    nodes: (row.nodes as DiagramNode[]) || [],
    edges: (row.edges as DiagramEdge[]) || [],
    thumbnail: row.thumbnail as string | undefined,
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

    const { data, error } = await supabase
      .from('diagrams')
      .insert({
        name: input.name,
        description: input.description,
        folder_id: input.folderId,
        nodes: input.nodes,
        edges: input.edges,
        user_id: user.id,
      })
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

    const { data, error } = await supabase
      .from('diagrams')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return mapDiagramFromDB(data)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('diagrams')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getByFolder(folderId: string | null): Promise<Diagram[]> {
    // Get current user to filter only owned diagrams
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    let query = supabase
      .from('diagrams')
      .select('*')
      .eq('user_id', user.id) // Only fetch diagrams owned by current user
      .order('updated_at', { ascending: false })

    if (folderId) {
      query = query.eq('folder_id', folderId)
    } else {
      query = query.is('folder_id', null)
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []).map(mapDiagramFromDB)
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
}
