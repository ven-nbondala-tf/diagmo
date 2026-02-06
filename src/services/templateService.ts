import { supabase } from './supabase'
import type { DiagramTemplate, DiagramNode, DiagramEdge, Layer } from '@/types'

interface TemplateRow {
  id: string
  name: string
  description: string | null
  category: string
  user_id: string
  nodes: unknown
  edges: unknown
  layers: unknown
  thumbnail: string | null
  is_public: boolean
  use_count: number
  created_at: string
  updated_at: string
}

function mapRowToTemplate(row: TemplateRow): DiagramTemplate {
  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    category: row.category,
    userId: row.user_id,
    nodes: (row.nodes as DiagramNode[]) || [],
    edges: (row.edges as DiagramEdge[]) || [],
    layers: (row.layers as Layer[]) || undefined,
    thumbnail: row.thumbnail || undefined,
    isPublic: row.is_public,
    useCount: row.use_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const templateService = {
  /**
   * Get all templates (user's own + public)
   */
  async getTemplates(): Promise<DiagramTemplate[]> {
    const { data, error } = await supabase
      .from('diagram_templates')
      .select('*')
      .order('use_count', { ascending: false })

    if (error) throw error
    return (data || []).map(mapRowToTemplate)
  },

  /**
   * Get user's own templates only
   */
  async getMyTemplates(): Promise<DiagramTemplate[]> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('diagram_templates')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return (data || []).map(mapRowToTemplate)
  },

  /**
   * Get public templates only
   */
  async getPublicTemplates(): Promise<DiagramTemplate[]> {
    const { data, error } = await supabase
      .from('diagram_templates')
      .select('*')
      .eq('is_public', true)
      .order('use_count', { ascending: false })

    if (error) throw error
    return (data || []).map(mapRowToTemplate)
  },

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(category: string): Promise<DiagramTemplate[]> {
    const { data, error } = await supabase
      .from('diagram_templates')
      .select('*')
      .eq('category', category)
      .order('use_count', { ascending: false })

    if (error) throw error
    return (data || []).map(mapRowToTemplate)
  },

  /**
   * Get a single template by ID
   */
  async getTemplate(id: string): Promise<DiagramTemplate | null> {
    const { data, error } = await supabase
      .from('diagram_templates')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return mapRowToTemplate(data)
  },

  /**
   * Create a new template from current diagram
   */
  async createTemplate(
    name: string,
    nodes: DiagramNode[],
    edges: DiagramEdge[],
    options?: {
      description?: string
      category?: string
      layers?: Layer[]
      thumbnail?: string
      isPublic?: boolean
    }
  ): Promise<DiagramTemplate> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('diagram_templates')
      .insert({
        name,
        description: options?.description || null,
        category: options?.category || 'General',
        user_id: userData.user.id,
        nodes,
        edges,
        layers: options?.layers || [],
        thumbnail: options?.thumbnail || null,
        is_public: options?.isPublic || false,
      })
      .select()
      .single()

    if (error) throw error
    return mapRowToTemplate(data)
  },

  /**
   * Update a template
   */
  async updateTemplate(
    id: string,
    updates: {
      name?: string
      description?: string
      category?: string
      nodes?: DiagramNode[]
      edges?: DiagramEdge[]
      layers?: Layer[]
      thumbnail?: string
      isPublic?: boolean
    }
  ): Promise<DiagramTemplate> {
    const updateData: Record<string, unknown> = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.category !== undefined) updateData.category = updates.category
    if (updates.nodes !== undefined) updateData.nodes = updates.nodes
    if (updates.edges !== undefined) updateData.edges = updates.edges
    if (updates.layers !== undefined) updateData.layers = updates.layers
    if (updates.thumbnail !== undefined) updateData.thumbnail = updates.thumbnail
    if (updates.isPublic !== undefined) updateData.is_public = updates.isPublic

    const { data, error } = await supabase
      .from('diagram_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return mapRowToTemplate(data)
  },

  /**
   * Delete a template
   */
  async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('diagram_templates')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  /**
   * Increment use count when a template is used
   */
  async incrementUseCount(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_template_use_count', {
      template_id: id,
    })

    // If RPC doesn't exist, fall back to manual increment
    if (error) {
      const { data: template } = await supabase
        .from('diagram_templates')
        .select('use_count')
        .eq('id', id)
        .single()

      if (template) {
        await supabase
          .from('diagram_templates')
          .update({ use_count: (template.use_count || 0) + 1 })
          .eq('id', id)
      }
    }
  },

  /**
   * Get available template categories
   */
  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('diagram_templates')
      .select('category')

    if (error) throw error

    const categories = new Set(data?.map((d) => d.category) || [])
    return Array.from(categories).sort()
  },
}

// Predefined template categories
export const TEMPLATE_CATEGORIES = [
  'General',
  'Flowchart',
  'Network',
  'Cloud Architecture',
  'UML',
  'Database',
  'Business Process',
  'Mind Map',
  'Org Chart',
]
