/**
 * Template Importer Utility
 * Imports architecture templates into Supabase from JSON files
 */

import { supabase } from './supabase'
import azureTemplatesData from '@/data/azureTemplates.json'
import azureTemplatesAIData from '@/data/azureTemplatesAI.json'
import azureTemplatesNetworkingData from '@/data/azureTemplatesNetworking.json'
import azureTemplatesIndustryData from '@/data/azureTemplatesIndustry.json'
import azureTemplatesMoreData from '@/data/azureTemplatesMore.json'

// Combine all templates
const ALL_AZURE_TEMPLATES = [
  ...azureTemplatesData.templates,
  ...azureTemplatesAIData.templates,
  ...azureTemplatesNetworkingData.templates,
  ...azureTemplatesIndustryData.templates,
  ...azureTemplatesMoreData.templates,
]

export interface TemplateImportResult {
  success: boolean
  imported: number
  skipped: number
  errors: string[]
}

/**
 * Import all Azure templates into Supabase
 */
export async function importAzureTemplates(): Promise<TemplateImportResult> {
  const result: TemplateImportResult = {
    success: true,
    imported: 0,
    skipped: 0,
    errors: [],
  }

  const templates = ALL_AZURE_TEMPLATES

  for (const template of templates) {
    try {
      // Check if template already exists
      const { data: existing } = await supabase
        .from('architecture_templates')
        .select('id')
        .eq('template_id', template.template_id)
        .single()

      if (existing) {
        result.skipped++
        continue
      }

      // Insert new template
      const { error } = await supabase
        .from('architecture_templates')
        .insert({
          template_id: template.template_id,
          name: template.name,
          description: template.description,
          categories: template.categories,
          complexity: template.complexity,
          source: template.source,
          tags: template.tags,
          use_cases: template.use_cases,
          nodes: template.nodes,
          edges: template.edges,
          is_built_in: true,
          is_published: true,
        })

      if (error) {
        result.errors.push(`Failed to import ${template.template_id}: ${error.message}`)
      } else {
        result.imported++
      }
    } catch (err) {
      result.errors.push(`Error processing ${template.template_id}: ${String(err)}`)
    }
  }

  result.success = result.errors.length === 0

  return result
}

/**
 * Import templates from a JSON object
 */
export async function importTemplatesFromJSON(
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
): Promise<TemplateImportResult> {
  const result: TemplateImportResult = {
    success: true,
    imported: 0,
    skipped: 0,
    errors: [],
  }

  // Insert in batches of 25 to avoid timeout
  const batchSize = 25

  for (let i = 0; i < templates.length; i += batchSize) {
    const batch = templates.slice(i, i + batchSize)

    // Filter out existing templates
    const templateIds = batch.map((t) => t.template_id)
    const { data: existing } = await supabase
      .from('architecture_templates')
      .select('template_id')
      .in('template_id', templateIds)

    const existingIds = new Set(existing?.map((e) => e.template_id) || [])
    const newTemplates = batch.filter((t) => !existingIds.has(t.template_id))

    result.skipped += batch.length - newTemplates.length

    if (newTemplates.length === 0) continue

    const { error } = await supabase
      .from('architecture_templates')
      .insert(
        newTemplates.map((t) => ({
          template_id: t.template_id,
          name: t.name,
          description: t.description,
          categories: t.categories,
          complexity: t.complexity,
          source: t.source,
          tags: t.tags,
          use_cases: t.use_cases,
          nodes: t.nodes,
          edges: t.edges,
          is_built_in: true,
          is_published: true,
        }))
      )

    if (error) {
      result.errors.push(`Batch ${i / batchSize + 1} failed: ${error.message}`)
    } else {
      result.imported += newTemplates.length
    }
  }

  result.success = result.errors.length === 0

  return result
}

/**
 * Clear all built-in templates (for re-importing)
 */
export async function clearBuiltInTemplates(): Promise<{ success: boolean; deleted: number }> {
  const { data, error } = await supabase
    .from('architecture_templates')
    .delete()
    .eq('is_built_in', true)
    .select('id')

  if (error) {
    console.error('Failed to clear templates:', error)
    return { success: false, deleted: 0 }
  }

  return { success: true, deleted: data?.length || 0 }
}

/**
 * Get template import statistics
 */
export async function getTemplateStats(): Promise<{
  total: number
  byCategory: Record<string, number>
  byComplexity: Record<string, number>
}> {
  const { data } = await supabase
    .from('architecture_templates')
    .select('categories, complexity')

  if (!data) {
    return { total: 0, byCategory: {}, byComplexity: {} }
  }

  const byCategory: Record<string, number> = {}
  const byComplexity: Record<string, number> = {}

  for (const row of data) {
    for (const cat of row.categories || []) {
      byCategory[cat] = (byCategory[cat] || 0) + 1
    }
    byComplexity[row.complexity] = (byComplexity[row.complexity] || 0) + 1
  }

  return {
    total: data.length,
    byCategory,
    byComplexity,
  }
}

/**
 * Get count of local templates (before import)
 */
export function getLocalTemplateCount(): {
  total: number
  azure: number
} {
  const azureCount = ALL_AZURE_TEMPLATES.length
  return {
    total: azureCount, // Add AWS, GCP counts when available
    azure: azureCount,
  }
}

/**
 * Get all local templates for direct use (fallback)
 */
export function getLocalTemplates() {
  return ALL_AZURE_TEMPLATES
}
