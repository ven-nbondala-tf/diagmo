/**
 * Architecture Template Service
 * Fetches and manages cloud architecture templates from Supabase
 * (AWS, Azure, GCP, multi-cloud patterns from Architecture Centers)
 */

import { supabase } from './supabase'
import type { ArchitectureTemplate, TemplateCategory } from '@/types'

export interface ArchitectureTemplateRow {
  id: string
  template_id: string
  name: string
  description: string
  categories: string[]
  complexity: 'beginner' | 'intermediate' | 'advanced'
  source: string | null
  tags: string[]
  use_cases: string[]
  nodes: unknown[]
  edges: unknown[]
  thumbnail_url: string | null
  is_built_in: boolean
  is_published: boolean
  created_by: string | null
  use_count: number
  rating: number
  rating_count: number
  created_at: string
  updated_at: string
}

export interface TemplateCategoryRow {
  id: string
  label: string
  icon: string
  description: string | null
  display_order: number
}

/**
 * Convert database row to ArchitectureTemplate
 */
function rowToTemplate(row: ArchitectureTemplateRow): ArchitectureTemplate {
  return {
    id: row.template_id,
    name: row.name,
    description: row.description,
    categories: row.categories as TemplateCategory[],
    complexity: row.complexity,
    source: row.source || undefined,
    tags: row.tags,
    useCases: row.use_cases,
    nodes: row.nodes as ArchitectureTemplate['nodes'],
    edges: row.edges as ArchitectureTemplate['edges'],
    isBuiltIn: row.is_built_in,
    // Extended fields from DB
    dbId: row.id,
    thumbnailUrl: row.thumbnail_url || undefined,
    useCount: row.use_count,
    rating: row.rating,
    ratingCount: row.rating_count,
    createdBy: row.created_by || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const architectureTemplateService = {
  /**
   * Fetch all published templates
   */
  async getAllTemplates(): Promise<ArchitectureTemplate[]> {
    const { data, error } = await supabase
      .from('architecture_templates')
      .select('*')
      .eq('is_published', true)
      .order('use_count', { ascending: false })

    if (error) {
      console.error('Error fetching templates:', error)
      throw error
    }

    return (data || []).map(rowToTemplate)
  },

  /**
   * Fetch templates by category
   */
  async getTemplatesByCategory(
    category: TemplateCategory
  ): Promise<ArchitectureTemplate[]> {
    const { data, error } = await supabase
      .from('architecture_templates')
      .select('*')
      .eq('is_published', true)
      .contains('categories', [category])
      .order('use_count', { ascending: false })

    if (error) {
      console.error('Error fetching templates by category:', error)
      throw error
    }

    return (data || []).map(rowToTemplate)
  },

  /**
   * Fetch templates by multiple categories (OR)
   */
  async getTemplatesByCategories(
    categories: TemplateCategory[]
  ): Promise<ArchitectureTemplate[]> {
    const { data, error } = await supabase
      .from('architecture_templates')
      .select('*')
      .eq('is_published', true)
      .overlaps('categories', categories)
      .order('use_count', { ascending: false })

    if (error) {
      console.error('Error fetching templates by categories:', error)
      throw error
    }

    return (data || []).map(rowToTemplate)
  },

  /**
   * Search templates by name, description, or tags
   */
  async searchTemplates(query: string): Promise<ArchitectureTemplate[]> {
    const { data, error } = await supabase
      .from('architecture_templates')
      .select('*')
      .eq('is_published', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('use_count', { ascending: false })

    if (error) {
      console.error('Error searching templates:', error)
      throw error
    }

    return (data || []).map(rowToTemplate)
  },

  /**
   * Get a single template by ID
   */
  async getTemplateById(templateId: string): Promise<ArchitectureTemplate | null> {
    const { data, error } = await supabase
      .from('architecture_templates')
      .select('*')
      .eq('template_id', templateId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      console.error('Error fetching template:', error)
      throw error
    }

    return data ? rowToTemplate(data) : null
  },

  /**
   * Get all template categories
   */
  async getCategories(): Promise<TemplateCategoryRow[]> {
    const { data, error } = await supabase
      .from('template_categories')
      .select('*')
      .order('display_order')

    if (error) {
      console.error('Error fetching categories:', error)
      throw error
    }

    return data || []
  },

  /**
   * Increment template use count when user uses a template
   */
  async trackTemplateUse(templateDbId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_template_use_count', {
      p_template_id: templateDbId,
    })

    if (error) {
      console.error('Error tracking template use:', error)
      // Don't throw - this is not critical
    }
  },

  /**
   * Get user's favorite templates
   */
  async getFavoriteTemplates(): Promise<ArchitectureTemplate[]> {
    const { data, error } = await supabase
      .from('template_favorites')
      .select(`
        template_id,
        architecture_templates (*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching favorite templates:', error)
      throw error
    }

    return (data || [])
      .filter((f) => f.architecture_templates)
      .map((f) => rowToTemplate(f.architecture_templates as unknown as ArchitectureTemplateRow))
  },

  /**
   * Check if a template is in favorites
   */
  async isFavorite(templateDbId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('template_favorites')
      .select('id')
      .eq('template_id', templateDbId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking favorite:', error)
    }

    return !!data
  },

  /**
   * Add template to favorites
   */
  async addToFavorites(templateDbId: string): Promise<void> {
    const { error } = await supabase.from('template_favorites').insert({
      template_id: templateDbId,
    })

    if (error) {
      console.error('Error adding to favorites:', error)
      throw error
    }
  },

  /**
   * Remove template from favorites
   */
  async removeFromFavorites(templateDbId: string): Promise<void> {
    const { error } = await supabase
      .from('template_favorites')
      .delete()
      .eq('template_id', templateDbId)

    if (error) {
      console.error('Error removing from favorites:', error)
      throw error
    }
  },

  /**
   * Create a new user template (save current diagram as template)
   */
  async createTemplate(
    template: Omit<ArchitectureTemplate, 'id'> & { templateId: string }
  ): Promise<ArchitectureTemplate> {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('architecture_templates')
      .insert({
        template_id: template.templateId,
        name: template.name,
        description: template.description,
        categories: template.categories,
        complexity: template.complexity,
        source: template.source,
        tags: template.tags,
        use_cases: template.useCases,
        nodes: template.nodes,
        edges: template.edges,
        is_built_in: false,
        is_published: true,
        created_by: user.user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating template:', error)
      throw error
    }

    return rowToTemplate(data)
  },

  /**
   * Update user's own template
   */
  async updateTemplate(
    templateDbId: string,
    updates: Partial<ArchitectureTemplate>
  ): Promise<ArchitectureTemplate> {
    const { data, error } = await supabase
      .from('architecture_templates')
      .update({
        name: updates.name,
        description: updates.description,
        categories: updates.categories,
        complexity: updates.complexity,
        source: updates.source,
        tags: updates.tags,
        use_cases: updates.useCases,
        nodes: updates.nodes,
        edges: updates.edges,
      })
      .eq('id', templateDbId)
      .select()
      .single()

    if (error) {
      console.error('Error updating template:', error)
      throw error
    }

    return rowToTemplate(data)
  },

  /**
   * Delete user's own template
   */
  async deleteTemplate(templateDbId: string): Promise<void> {
    const { error } = await supabase
      .from('architecture_templates')
      .delete()
      .eq('id', templateDbId)

    if (error) {
      console.error('Error deleting template:', error)
      throw error
    }
  },

  /**
   * Bulk insert templates (admin function for seeding)
   * Used to import all Azure/AWS/GCP templates
   */
  async bulkInsertTemplates(
    templates: Array<{
      template_id: string
      name: string
      description: string
      categories: string[]
      complexity: string
      source?: string
      tags: string[]
      use_cases: string[]
      nodes: unknown[]
      edges: unknown[]
    }>
  ): Promise<number> {
    // Insert in batches of 50 to avoid timeout
    const batchSize = 50
    let insertedCount = 0

    for (let i = 0; i < templates.length; i += batchSize) {
      const batch = templates.slice(i, i + batchSize)

      const { data, error } = await supabase
        .from('architecture_templates')
        .insert(
          batch.map((t) => ({
            ...t,
            is_built_in: true,
            is_published: true,
          }))
        )
        .select('id')

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error)
        throw error
      }

      insertedCount += data?.length || 0
    }

    return insertedCount
  },

  /**
   * Get template count by category (for UI badges)
   */
  async getTemplateCounts(): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from('architecture_templates')
      .select('categories')
      .eq('is_published', true)

    if (error) {
      console.error('Error getting template counts:', error)
      return {}
    }

    const counts: Record<string, number> = {}
    for (const row of data || []) {
      for (const cat of row.categories || []) {
        counts[cat] = (counts[cat] || 0) + 1
      }
    }

    return counts
  },
}
