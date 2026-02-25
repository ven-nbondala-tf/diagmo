import { supabase } from './supabase'
import type { DiagramPage, DiagramNode, DiagramEdge, DrawingStroke } from '@/types'

interface PageRow {
  id: string
  diagram_id: string
  name: string
  page_order: number
  nodes: unknown
  edges: unknown
  drawing_strokes?: unknown
  created_at: string
  updated_at: string
}

function mapRowToPage(row: PageRow): DiagramPage {
  return {
    id: row.id,
    diagramId: row.diagram_id,
    name: row.name,
    pageOrder: row.page_order,
    nodes: (row.nodes as DiagramNode[]) || [],
    edges: (row.edges as DiagramEdge[]) || [],
    drawingStrokes: (row.drawing_strokes as DrawingStroke[]) || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const pageService = {
  /**
   * Get all pages for a diagram
   */
  async getPages(diagramId: string): Promise<DiagramPage[]> {
    const { data, error } = await supabase
      .from('diagram_pages')
      .select('*')
      .eq('diagram_id', diagramId)
      .order('page_order', { ascending: true })

    if (error) throw error
    return (data || []).map(mapRowToPage)
  },

  /**
   * Create a new page
   */
  async createPage(
    diagramId: string,
    name: string,
    pageOrder: number,
    nodes: DiagramNode[] = [],
    edges: DiagramEdge[] = []
  ): Promise<DiagramPage> {
    const { data, error } = await supabase
      .from('diagram_pages')
      .insert({
        diagram_id: diagramId,
        name,
        page_order: pageOrder,
        nodes,
        edges,
      })
      .select()
      .single()

    if (error) throw error
    return mapRowToPage(data)
  },

  /**
   * Update a page's content (nodes, edges, and drawing strokes)
   */
  async updatePageContent(
    pageId: string,
    nodes: DiagramNode[],
    edges: DiagramEdge[],
    drawingStrokes?: DrawingStroke[]
  ): Promise<DiagramPage> {
    const updateData: Record<string, unknown> = { nodes, edges }
    if (drawingStrokes !== undefined) {
      updateData.drawing_strokes = drawingStrokes
    }

    const { data, error } = await supabase
      .from('diagram_pages')
      .update(updateData)
      .eq('id', pageId)
      .select()
      .single()

    if (error) throw error
    return mapRowToPage(data)
  },

  /**
   * Rename a page
   */
  async renamePage(pageId: string, name: string): Promise<DiagramPage> {
    const { data, error } = await supabase
      .from('diagram_pages')
      .update({ name })
      .eq('id', pageId)
      .select()
      .single()

    if (error) throw error
    return mapRowToPage(data)
  },

  /**
   * Delete a page
   */
  async deletePage(pageId: string): Promise<void> {
    const { error } = await supabase
      .from('diagram_pages')
      .delete()
      .eq('id', pageId)

    if (error) throw error
  },

  /**
   * Reorder pages
   */
  async reorderPages(pages: Array<{ id: string; pageOrder: number }>): Promise<void> {
    // Update each page's order
    const updates = pages.map((p) =>
      supabase
        .from('diagram_pages')
        .update({ page_order: p.pageOrder })
        .eq('id', p.id)
    )

    await Promise.all(updates)
  },

  /**
   * Duplicate a page (including drawing strokes)
   */
  async duplicatePage(page: DiagramPage): Promise<DiagramPage> {
    // Get the next order
    const { data: existing } = await supabase
      .from('diagram_pages')
      .select('page_order')
      .eq('diagram_id', page.diagramId)
      .order('page_order', { ascending: false })
      .limit(1)

    const nextOrder = existing && existing[0] ? (existing[0].page_order as number) + 1 : 0

    // Create page with drawing strokes
    const { data, error } = await supabase
      .from('diagram_pages')
      .insert({
        diagram_id: page.diagramId,
        name: `${page.name} (Copy)`,
        page_order: nextOrder,
        nodes: page.nodes,
        edges: page.edges,
        drawing_strokes: page.drawingStrokes || [],
      })
      .select()
      .single()

    if (error) throw error
    return mapRowToPage(data)
  },
}
