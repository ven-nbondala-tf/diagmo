import { supabase } from './supabase'
import type { Diagram, DiagramNode, DiagramEdge } from '@/types'

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
    const { data, error } = await supabase
      .from('diagrams')
      .select('*')
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
    let query = supabase
      .from('diagrams')
      .select('*')
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
}
