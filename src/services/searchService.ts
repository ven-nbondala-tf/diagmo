/**
 * Global Search Service
 * Full-text search across diagrams, nodes, and comments
 */

import { supabase } from './supabase'
import type { DiagramNode, DiagramEdge } from '@/types'

// Search result types
export interface SearchMatch {
  type: 'diagram' | 'node' | 'edge' | 'comment'
  elementId?: string
  text: string
  context: string
  score: number
  highlightRanges?: Array<{ start: number; end: number }>
}

export interface DiagramSearchResult {
  diagramId: string
  diagramName: string
  thumbnail?: string
  updatedAt: string
  matches: SearchMatch[]
  totalScore: number
}

export interface SearchFilters {
  createdAfter?: Date
  createdBefore?: Date
  createdBy?: string
  workspaceId?: string
  folderId?: string
  tags?: string[]
  hasCloudProvider?: 'aws' | 'azure' | 'gcp' | 'office365'
  nodeTypes?: string[]
}

export type SearchSortBy = 'relevance' | 'recent' | 'name'

// Quick action types for command palette
export interface QuickAction {
  id: string
  type: 'action' | 'navigation' | 'command'
  title: string
  description?: string
  icon?: string
  shortcut?: string
  action: () => void | Promise<void>
}

// Search in text with highlighting
function searchInText(
  text: string,
  query: string
): { matches: boolean; highlights: Array<{ start: number; end: number }> } {
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const words = lowerQuery.split(/\s+/).filter(w => w.length > 0)

  const highlights: Array<{ start: number; end: number }> = []
  let allMatched = true

  for (const word of words) {
    let index = 0
    let found = false
    while ((index = lowerText.indexOf(word, index)) !== -1) {
      highlights.push({ start: index, end: index + word.length })
      index += word.length
      found = true
    }
    if (!found) allMatched = false
  }

  return { matches: allMatched || highlights.length > 0, highlights }
}

// Calculate relevance score
function calculateScore(
  matchType: 'diagram' | 'node' | 'edge' | 'comment',
  exactMatch: boolean,
  matchCount: number
): number {
  const typeWeights = {
    diagram: 100,
    node: 80,
    edge: 60,
    comment: 40,
  }

  let score = typeWeights[matchType]
  if (exactMatch) score *= 1.5
  score += matchCount * 10

  return score
}

export const searchService = {
  /**
   * Search across all diagrams
   */
  async search(
    query: string,
    filters?: SearchFilters,
    sortBy: SearchSortBy = 'relevance',
    limit = 20
  ): Promise<DiagramSearchResult[]> {
    if (!query.trim()) return []

    const normalizedQuery = query.toLowerCase().trim()

    // Build query
    let dbQuery = supabase
      .from('diagrams')
      .select('id, name, nodes, edges, thumbnail, updated_at, user_id, workspace_id, folder_id')

    // Apply filters
    if (filters?.workspaceId) {
      dbQuery = dbQuery.eq('workspace_id', filters.workspaceId)
    }
    if (filters?.folderId) {
      dbQuery = dbQuery.eq('folder_id', filters.folderId)
    }
    if (filters?.createdBy) {
      dbQuery = dbQuery.eq('user_id', filters.createdBy)
    }
    if (filters?.createdAfter) {
      dbQuery = dbQuery.gte('created_at', filters.createdAfter.toISOString())
    }
    if (filters?.createdBefore) {
      dbQuery = dbQuery.lte('created_at', filters.createdBefore.toISOString())
    }

    const { data: diagrams, error } = await dbQuery.limit(100)

    if (error) throw error
    if (!diagrams) return []

    // Search in diagrams
    const results: DiagramSearchResult[] = []

    for (const diagram of diagrams) {
      const matches: SearchMatch[] = []
      let totalScore = 0

      // Search in diagram name
      const nameSearch = searchInText(diagram.name, normalizedQuery)
      if (nameSearch.matches) {
        const score = calculateScore('diagram', diagram.name.toLowerCase() === normalizedQuery, nameSearch.highlights.length)
        matches.push({
          type: 'diagram',
          text: diagram.name,
          context: 'Diagram name',
          score,
          highlightRanges: nameSearch.highlights,
        })
        totalScore += score
      }

      // Search in nodes
      const nodes = (diagram.nodes as DiagramNode[]) || []
      for (const node of nodes) {
        const label = (node.data?.label as string) || ''
        const description = (node.data?.description as string) || ''
        const nodeType = (node.data?.type as string) || ''

        // Check cloud provider filter
        if (filters?.hasCloudProvider) {
          const isMatchingProvider = nodeType.toLowerCase().includes(filters.hasCloudProvider)
          if (!isMatchingProvider) continue
        }

        // Check node type filter
        if (filters?.nodeTypes?.length) {
          if (!filters.nodeTypes.includes(nodeType)) continue
        }

        const labelSearch = searchInText(label, normalizedQuery)
        const descSearch = searchInText(description, normalizedQuery)

        if (labelSearch.matches) {
          const score = calculateScore('node', label.toLowerCase() === normalizedQuery, labelSearch.highlights.length)
          matches.push({
            type: 'node',
            elementId: node.id,
            text: label,
            context: `Node: ${nodeType || 'shape'}`,
            score,
            highlightRanges: labelSearch.highlights,
          })
          totalScore += score
        }

        if (descSearch.matches) {
          const score = calculateScore('node', false, descSearch.highlights.length)
          matches.push({
            type: 'node',
            elementId: node.id,
            text: description.substring(0, 100),
            context: `Node description: ${label || 'Untitled'}`,
            score,
            highlightRanges: descSearch.highlights,
          })
          totalScore += score
        }
      }

      // Search in edge labels
      const edges = (diagram.edges as DiagramEdge[]) || []
      for (const edge of edges) {
        const label = (edge.label as string) || (edge.data?.label as string) || ''
        if (!label) continue

        const labelSearch = searchInText(label, normalizedQuery)
        if (labelSearch.matches) {
          const score = calculateScore('edge', label.toLowerCase() === normalizedQuery, labelSearch.highlights.length)
          matches.push({
            type: 'edge',
            elementId: edge.id,
            text: label,
            context: 'Connection label',
            score,
            highlightRanges: labelSearch.highlights,
          })
          totalScore += score
        }
      }

      // Only include if there are matches
      if (matches.length > 0) {
        results.push({
          diagramId: diagram.id,
          diagramName: diagram.name,
          thumbnail: diagram.thumbnail || undefined,
          updatedAt: diagram.updated_at,
          matches: matches.sort((a, b) => b.score - a.score).slice(0, 5),
          totalScore,
        })
      }
    }

    // Sort results
    results.sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          return b.totalScore - a.totalScore
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'name':
          return a.diagramName.localeCompare(b.diagramName)
        default:
          return b.totalScore - a.totalScore
      }
    })

    return results.slice(0, limit)
  },

  /**
   * Search for nodes within a specific diagram
   */
  async searchInDiagram(
    diagramId: string,
    query: string
  ): Promise<SearchMatch[]> {
    if (!query.trim()) return []

    const { data, error } = await supabase
      .from('diagrams')
      .select('nodes, edges')
      .eq('id', diagramId)
      .single()

    if (error || !data) return []

    const normalizedQuery = query.toLowerCase().trim()
    const matches: SearchMatch[] = []

    // Search in nodes
    const nodes = (data.nodes as DiagramNode[]) || []
    for (const node of nodes) {
      const label = (node.data?.label as string) || ''
      const description = (node.data?.description as string) || ''

      const labelSearch = searchInText(label, normalizedQuery)
      const descSearch = searchInText(description, normalizedQuery)

      if (labelSearch.matches || descSearch.matches) {
        matches.push({
          type: 'node',
          elementId: node.id,
          text: label || 'Unnamed node',
          context: description ? description.substring(0, 50) : `Position: ${Math.round(node.position.x)}, ${Math.round(node.position.y)}`,
          score: calculateScore('node', label.toLowerCase() === normalizedQuery, labelSearch.highlights.length + descSearch.highlights.length),
          highlightRanges: labelSearch.highlights,
        })
      }
    }

    // Search in edges
    const edges = (data.edges as DiagramEdge[]) || []
    for (const edge of edges) {
      const label = (edge.label as string) || (edge.data?.label as string) || ''
      if (!label) continue

      const labelSearch = searchInText(label, normalizedQuery)
      if (labelSearch.matches) {
        matches.push({
          type: 'edge',
          elementId: edge.id,
          text: label,
          context: `Connection: ${edge.source} → ${edge.target}`,
          score: calculateScore('edge', label.toLowerCase() === normalizedQuery, labelSearch.highlights.length),
          highlightRanges: labelSearch.highlights,
        })
      }
    }

    return matches.sort((a, b) => b.score - a.score)
  },

  /**
   * Get search suggestions based on recent searches and common terms
   */
  async getSuggestions(partialQuery: string, limit = 5): Promise<string[]> {
    if (!partialQuery.trim() || partialQuery.length < 2) return []

    // Search for diagram names matching the query
    const { data } = await supabase
      .from('diagrams')
      .select('name')
      .ilike('name', `%${partialQuery}%`)
      .limit(limit)

    const suggestions = new Set<string>()

    // Add matching diagram names
    data?.forEach(d => {
      const words = d.name.split(/\s+/)
      words.forEach(word => {
        if (word.toLowerCase().startsWith(partialQuery.toLowerCase())) {
          suggestions.add(word)
        }
      })
    })

    return Array.from(suggestions).slice(0, limit)
  },

  /**
   * Get predefined quick actions for command palette
   */
  getQuickActions(navigate: (path: string) => void): QuickAction[] {
    return [
      {
        id: 'new-diagram',
        type: 'action',
        title: 'New Diagram',
        description: 'Create a new blank diagram',
        icon: 'plus',
        shortcut: 'Ctrl+N',
        action: () => navigate('/editor/new'),
      },
      {
        id: 'dashboard',
        type: 'navigation',
        title: 'Go to Dashboard',
        description: 'View all your diagrams',
        icon: 'home',
        action: () => navigate('/dashboard'),
      },
      {
        id: 'templates',
        type: 'navigation',
        title: 'Browse Templates',
        description: 'Start from a template',
        icon: 'layout-template',
        action: () => navigate('/dashboard?templates=true'),
      },
      {
        id: 'marketplace',
        type: 'navigation',
        title: 'Template Marketplace',
        description: 'Explore community templates',
        icon: 'store',
        action: () => navigate('/dashboard?marketplace=true'),
      },
      {
        id: 'settings',
        type: 'navigation',
        title: 'Settings',
        description: 'Configure your preferences',
        icon: 'settings',
        action: () => navigate('/settings'),
      },
    ]
  },

  /**
   * Find similar diagrams based on content
   */
  async findSimilarDiagrams(
    diagramId: string,
    limit = 5
  ): Promise<DiagramSearchResult[]> {
    // Get the source diagram
    const { data: sourceDiagram, error } = await supabase
      .from('diagrams')
      .select('nodes, edges')
      .eq('id', diagramId)
      .single()

    if (error || !sourceDiagram) return []

    const sourceNodes = (sourceDiagram.nodes as DiagramNode[]) || []

    // Extract common terms from node labels
    const terms = new Set<string>()
    sourceNodes.forEach(node => {
      const label = (node.data?.label as string) || ''
      const words = label.split(/\s+/).filter(w => w.length > 3)
      words.forEach(w => terms.add(w.toLowerCase()))
    })

    // Search for diagrams with similar terms
    const query = Array.from(terms).slice(0, 5).join(' ')
    if (!query) return []

    const results = await this.search(query, undefined, 'relevance', limit + 1)

    // Exclude the source diagram
    return results.filter(r => r.diagramId !== diagramId).slice(0, limit)
  },
}
