/**
 * Hook for fetching and managing architecture templates
 * Uses Supabase as primary source, falls back to local templates
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { architectureTemplateService } from '@/services/architectureTemplateService'
import { ARCHITECTURE_TEMPLATES, ARCHITECTURE_TEMPLATE_CATEGORIES } from '@/constants/architectureTemplates'
import type { ArchitectureTemplate, TemplateCategory } from '@/types'

interface UseArchitectureTemplatesOptions {
  category?: TemplateCategory
  searchQuery?: string
  favoritesOnly?: boolean
}

interface UseArchitectureTemplatesResult {
  templates: ArchitectureTemplate[]
  categories: typeof ARCHITECTURE_TEMPLATE_CATEGORIES
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  trackUse: (template: ArchitectureTemplate) => Promise<void>
  templateCounts: Record<string, number>
}

// Cache for templates to avoid re-fetching
let templatesCache: ArchitectureTemplate[] | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useArchitectureTemplates(
  options: UseArchitectureTemplatesOptions = {}
): UseArchitectureTemplatesResult {
  const { category, searchQuery, favoritesOnly } = options

  const [templates, setTemplates] = useState<ArchitectureTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch templates from Supabase or use fallback
  const fetchTemplates = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Check cache first
      const now = Date.now()
      if (templatesCache && now - cacheTimestamp < CACHE_DURATION) {
        setTemplates(templatesCache)
        setIsLoading(false)
        return
      }

      // Try to fetch from Supabase
      let fetchedTemplates: ArchitectureTemplate[] = []

      try {
        if (favoritesOnly) {
          fetchedTemplates = await architectureTemplateService.getFavoriteTemplates()
        } else if (category) {
          fetchedTemplates = await architectureTemplateService.getTemplatesByCategory(category)
        } else if (searchQuery) {
          fetchedTemplates = await architectureTemplateService.searchTemplates(searchQuery)
        } else {
          fetchedTemplates = await architectureTemplateService.getAllTemplates()
        }

        // If we got results from Supabase, use them
        if (fetchedTemplates.length > 0) {
          templatesCache = fetchedTemplates
          cacheTimestamp = now
          setTemplates(fetchedTemplates)
        } else {
          // Fall back to local templates if Supabase is empty or unavailable
          console.log('Using local architecture templates (Supabase returned empty)')
          setTemplates(ARCHITECTURE_TEMPLATES)
        }
      } catch (supabaseError) {
        // Supabase error - use local templates as fallback
        console.warn('Supabase unavailable, using local templates:', supabaseError)
        setTemplates(ARCHITECTURE_TEMPLATES)
      }
    } catch (err) {
      console.error('Error fetching templates:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch templates'))
      // Fall back to local templates on any error
      setTemplates(ARCHITECTURE_TEMPLATES)
    } finally {
      setIsLoading(false)
    }
  }, [category, searchQuery, favoritesOnly])

  // Initial fetch
  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  // Track template usage
  const trackUse = useCallback(async (template: ArchitectureTemplate) => {
    if (template.dbId) {
      try {
        await architectureTemplateService.trackTemplateUse(template.dbId)
      } catch (err) {
        console.warn('Failed to track template use:', err)
      }
    }
  }, [])

  // Filter templates based on options (for local filtering)
  const filteredTemplates = useMemo(() => {
    let result = templates

    // Filter by category if not already filtered from DB
    if (category && templatesCache !== templates) {
      result = result.filter((t) => t.categories.includes(category))
    }

    // Filter by search query if not already filtered from DB
    if (searchQuery && templatesCache !== templates) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    return result
  }, [templates, category, searchQuery])

  // Calculate template counts by category
  const templateCounts = useMemo(() => {
    const counts: Record<string, number> = {}

    for (const template of templates) {
      for (const cat of template.categories) {
        counts[cat] = (counts[cat] || 0) + 1
      }
    }

    return counts
  }, [templates])

  return {
    templates: filteredTemplates,
    categories: ARCHITECTURE_TEMPLATE_CATEGORIES,
    isLoading,
    error,
    refetch: fetchTemplates,
    trackUse,
    templateCounts,
  }
}

/**
 * Hook for a single template by ID
 */
export function useArchitectureTemplate(templateId: string | undefined) {
  const [template, setTemplate] = useState<ArchitectureTemplate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!templateId) {
      setTemplate(null)
      setIsLoading(false)
      return
    }

    const fetchTemplate = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Try Supabase first
        const dbTemplate = await architectureTemplateService.getTemplateById(templateId)

        if (dbTemplate) {
          setTemplate(dbTemplate)
        } else {
          // Fall back to local templates
          const localTemplate = ARCHITECTURE_TEMPLATES.find((t) => t.id === templateId)
          setTemplate(localTemplate || null)
        }
      } catch (err) {
        console.warn('Supabase error, trying local:', err)
        // Fall back to local templates
        const localTemplate = ARCHITECTURE_TEMPLATES.find((t) => t.id === templateId)
        setTemplate(localTemplate || null)
        if (!localTemplate) {
          setError(err instanceof Error ? err : new Error('Template not found'))
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchTemplate()
  }, [templateId])

  return { template, isLoading, error }
}

/**
 * Clear templates cache (call after importing new templates)
 */
export function clearTemplatesCache(): void {
  templatesCache = null
  cacheTimestamp = 0
}
