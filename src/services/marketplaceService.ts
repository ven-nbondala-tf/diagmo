/**
 * Template Marketplace Service
 * Community-driven template sharing and discovery
 */

import { supabase } from './supabase'
import type { DiagramNode, DiagramEdge, Layer } from '@/types'

// Marketplace template with author and rating info
export interface MarketplaceTemplate {
  id: string
  name: string
  description: string
  author: {
    id: string
    name: string
    avatarUrl?: string
    verified: boolean
  }
  category: string
  tags: string[]
  thumbnail?: string
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  layers?: Layer[]
  downloads: number
  rating: number
  ratingCount: number
  price: 'free' | number // cents if paid
  featured: boolean
  createdAt: string
  updatedAt: string
}

// Template rating
export interface TemplateRating {
  id: string
  templateId: string
  userId: string
  rating: number // 1-5
  review?: string
  createdAt: string
}

// Browse filters
export interface MarketplaceFilters {
  category?: string
  tags?: string[]
  priceType?: 'free' | 'paid' | 'all'
  minRating?: number
  featured?: boolean
  authorId?: string
}

// Sort options
export type MarketplaceSortBy = 'popular' | 'recent' | 'rating' | 'downloads'

// Database row type
interface MarketplaceTemplateRow {
  id: string
  name: string
  description: string | null
  author_id: string
  category: string
  tags: string[]
  thumbnail: string | null
  nodes: unknown
  edges: unknown
  layers: unknown
  downloads: number
  rating: number
  rating_count: number
  price: number
  featured: boolean
  created_at: string
  updated_at: string
  profiles?: {
    id: string
    full_name: string | null
    avatar_url: string | null
    verified: boolean
  }
}

// Map database row to marketplace template
function mapRowToMarketplaceTemplate(row: MarketplaceTemplateRow): MarketplaceTemplate {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    author: {
      id: row.author_id,
      name: row.profiles?.full_name || 'Unknown Author',
      avatarUrl: row.profiles?.avatar_url || undefined,
      verified: row.profiles?.verified || false,
    },
    category: row.category,
    tags: row.tags || [],
    thumbnail: row.thumbnail || undefined,
    nodes: (row.nodes as DiagramNode[]) || [],
    edges: (row.edges as DiagramEdge[]) || [],
    layers: (row.layers as Layer[]) || undefined,
    downloads: row.downloads || 0,
    rating: row.rating || 0,
    ratingCount: row.rating_count || 0,
    price: row.price === 0 ? 'free' : row.price,
    featured: row.featured || false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const marketplaceService = {
  /**
   * Browse marketplace templates
   */
  async browseTemplates(
    filters?: MarketplaceFilters,
    sortBy: MarketplaceSortBy = 'popular',
    limit = 50,
    offset = 0
  ): Promise<{ templates: MarketplaceTemplate[]; total: number }> {
    let query = supabase
      .from('marketplace_templates')
      .select(`
        *,
        profiles:author_id (
          id,
          full_name,
          avatar_url,
          verified
        )
      `, { count: 'exact' })

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    if (filters?.tags?.length) {
      query = query.contains('tags', filters.tags)
    }
    if (filters?.priceType === 'free') {
      query = query.eq('price', 0)
    } else if (filters?.priceType === 'paid') {
      query = query.gt('price', 0)
    }
    if (filters?.minRating) {
      query = query.gte('rating', filters.minRating)
    }
    if (filters?.featured) {
      query = query.eq('featured', true)
    }
    if (filters?.authorId) {
      query = query.eq('author_id', filters.authorId)
    }

    // Apply sorting
    switch (sortBy) {
      case 'popular':
        query = query.order('downloads', { ascending: false })
        break
      case 'recent':
        query = query.order('created_at', { ascending: false })
        break
      case 'rating':
        query = query.order('rating', { ascending: false })
        break
      case 'downloads':
        query = query.order('downloads', { ascending: false })
        break
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw error

    return {
      templates: (data || []).map(mapRowToMarketplaceTemplate),
      total: count || 0,
    }
  },

  /**
   * Get featured templates
   */
  async getFeaturedTemplates(limit = 10): Promise<MarketplaceTemplate[]> {
    const { templates } = await this.browseTemplates(
      { featured: true },
      'popular',
      limit
    )
    return templates
  },

  /**
   * Get template by ID
   */
  async getTemplate(id: string): Promise<MarketplaceTemplate | null> {
    const { data, error } = await supabase
      .from('marketplace_templates')
      .select(`
        *,
        profiles:author_id (
          id,
          full_name,
          avatar_url,
          verified
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return mapRowToMarketplaceTemplate(data)
  },

  /**
   * Search templates
   */
  async searchTemplates(
    query: string,
    filters?: MarketplaceFilters,
    limit = 20
  ): Promise<MarketplaceTemplate[]> {
    const searchQuery = query.toLowerCase().trim()

    let dbQuery = supabase
      .from('marketplace_templates')
      .select(`
        *,
        profiles:author_id (
          id,
          full_name,
          avatar_url,
          verified
        )
      `)
      .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      .limit(limit)

    // Apply filters
    if (filters?.category) {
      dbQuery = dbQuery.eq('category', filters.category)
    }

    const { data, error } = await dbQuery

    if (error) throw error

    return (data || []).map(mapRowToMarketplaceTemplate)
  },

  /**
   * Publish a template to marketplace
   */
  async publishTemplate(
    name: string,
    description: string,
    nodes: DiagramNode[],
    edges: DiagramEdge[],
    options: {
      category: string
      tags?: string[]
      layers?: Layer[]
      thumbnail?: string
      price?: number // 0 for free
    }
  ): Promise<MarketplaceTemplate> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('marketplace_templates')
      .insert({
        name,
        description,
        author_id: userData.user.id,
        category: options.category,
        tags: options.tags || [],
        nodes,
        edges,
        layers: options.layers || [],
        thumbnail: options.thumbnail || null,
        price: options.price || 0,
        downloads: 0,
        rating: 0,
        rating_count: 0,
        featured: false,
      })
      .select(`
        *,
        profiles:author_id (
          id,
          full_name,
          avatar_url,
          verified
        )
      `)
      .single()

    if (error) throw error

    return mapRowToMarketplaceTemplate(data)
  },

  /**
   * Use a template (increment download count)
   */
  async useTemplate(templateId: string): Promise<{
    nodes: DiagramNode[]
    edges: DiagramEdge[]
    layers?: Layer[]
  }> {
    // Get template
    const template = await this.getTemplate(templateId)
    if (!template) throw new Error('Template not found')

    // Increment download count
    await supabase.rpc('increment_marketplace_downloads', {
      template_id: templateId,
    }).catch(() => {
      // Fallback if RPC doesn't exist
      supabase
        .from('marketplace_templates')
        .update({ downloads: template.downloads + 1 })
        .eq('id', templateId)
    })

    return {
      nodes: template.nodes,
      edges: template.edges,
      layers: template.layers,
    }
  },

  /**
   * Rate a template
   */
  async rateTemplate(
    templateId: string,
    rating: number,
    review?: string
  ): Promise<void> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Not authenticated')

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5')
    }

    // Upsert rating
    const { error: ratingError } = await supabase
      .from('template_ratings')
      .upsert({
        template_id: templateId,
        user_id: userData.user.id,
        rating,
        review: review || null,
      }, {
        onConflict: 'template_id,user_id',
      })

    if (ratingError) throw ratingError

    // Update average rating on template
    const { data: ratings } = await supabase
      .from('template_ratings')
      .select('rating')
      .eq('template_id', templateId)

    if (ratings) {
      const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      await supabase
        .from('marketplace_templates')
        .update({
          rating: Math.round(avgRating * 10) / 10,
          rating_count: ratings.length,
        })
        .eq('id', templateId)
    }
  },

  /**
   * Get user's rating for a template
   */
  async getUserRating(templateId: string): Promise<TemplateRating | null> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return null

    const { data, error } = await supabase
      .from('template_ratings')
      .select('*')
      .eq('template_id', templateId)
      .eq('user_id', userData.user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return {
      id: data.id,
      templateId: data.template_id,
      userId: data.user_id,
      rating: data.rating,
      review: data.review || undefined,
      createdAt: data.created_at,
    }
  },

  /**
   * Get template reviews
   */
  async getTemplateReviews(
    templateId: string,
    limit = 20
  ): Promise<Array<TemplateRating & { authorName: string }>> {
    const { data, error } = await supabase
      .from('template_ratings')
      .select(`
        *,
        profiles:user_id (
          full_name
        )
      `)
      .eq('template_id', templateId)
      .not('review', 'is', null)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return (data || []).map(row => ({
      id: row.id,
      templateId: row.template_id,
      userId: row.user_id,
      rating: row.rating,
      review: row.review || undefined,
      createdAt: row.created_at,
      authorName: (row.profiles as { full_name: string | null })?.full_name || 'Anonymous',
    }))
  },

  /**
   * Get marketplace categories
   */
  async getCategories(): Promise<Array<{ name: string; count: number }>> {
    const { data, error } = await supabase
      .from('marketplace_templates')
      .select('category')

    if (error) throw error

    const counts = new Map<string, number>()
    ;(data || []).forEach(row => {
      counts.set(row.category, (counts.get(row.category) || 0) + 1)
    })

    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  },

  /**
   * Get popular tags
   */
  async getPopularTags(limit = 20): Promise<Array<{ tag: string; count: number }>> {
    const { data, error } = await supabase
      .from('marketplace_templates')
      .select('tags')

    if (error) throw error

    const counts = new Map<string, number>()
    ;(data || []).forEach(row => {
      ;(row.tags || []).forEach((tag: string) => {
        counts.set(tag, (counts.get(tag) || 0) + 1)
      })
    })

    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  },

  /**
   * Get similar templates
   */
  async getSimilarTemplates(
    templateId: string,
    limit = 5
  ): Promise<MarketplaceTemplate[]> {
    // Get the template to find similar ones
    const template = await this.getTemplate(templateId)
    if (!template) return []

    // Find templates with matching tags or category
    const { data, error } = await supabase
      .from('marketplace_templates')
      .select(`
        *,
        profiles:author_id (
          id,
          full_name,
          avatar_url,
          verified
        )
      `)
      .neq('id', templateId)
      .or(`category.eq.${template.category},tags.cs.{${template.tags.join(',')}}`)
      .order('rating', { ascending: false })
      .limit(limit)

    if (error) throw error

    return (data || []).map(mapRowToMarketplaceTemplate)
  },

  /**
   * Get my published templates
   */
  async getMyPublishedTemplates(): Promise<MarketplaceTemplate[]> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return []

    const { data, error } = await supabase
      .from('marketplace_templates')
      .select(`
        *,
        profiles:author_id (
          id,
          full_name,
          avatar_url,
          verified
        )
      `)
      .eq('author_id', userData.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map(mapRowToMarketplaceTemplate)
  },

  /**
   * Update a published template
   */
  async updateTemplate(
    id: string,
    updates: Partial<{
      name: string
      description: string
      category: string
      tags: string[]
      nodes: DiagramNode[]
      edges: DiagramEdge[]
      layers: Layer[]
      thumbnail: string
      price: number
    }>
  ): Promise<MarketplaceTemplate> {
    const { data, error } = await supabase
      .from('marketplace_templates')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        profiles:author_id (
          id,
          full_name,
          avatar_url,
          verified
        )
      `)
      .single()

    if (error) throw error

    return mapRowToMarketplaceTemplate(data)
  },

  /**
   * Delete a published template
   */
  async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('marketplace_templates')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}

// Predefined marketplace categories
export const MARKETPLACE_CATEGORIES = [
  'Cloud Architecture',
  'Web Application',
  'Microservices',
  'Data Pipeline',
  'DevOps',
  'Security',
  'IoT',
  'AI/ML',
  'Mobile',
  'Enterprise',
  'Flowchart',
  'Network',
  'Database',
  'UML',
  'Other',
]
