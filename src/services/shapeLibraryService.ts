import { supabase } from './supabase'
import type { ShapeLibrary, CustomShape } from '@/types'

interface CreateLibraryInput {
  name: string
  description?: string
  isPublic?: boolean
}

interface UpdateLibraryInput {
  name?: string
  description?: string
  isPublic?: boolean
}

interface CreateShapeInput {
  libraryId: string
  name: string
  svgContent: string
  category?: string
}

function mapLibraryFromDB(row: Record<string, unknown>): ShapeLibrary {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    description: row.description as string | undefined,
    isPublic: row.is_public as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

function mapShapeFromDB(row: Record<string, unknown>): CustomShape {
  return {
    id: row.id as string,
    libraryId: row.library_id as string,
    name: row.name as string,
    svgContent: row.svg_content as string,
    thumbnailUrl: row.thumbnail_url as string | undefined,
    category: row.category as string | undefined,
    createdAt: row.created_at as string,
  }
}

export const shapeLibraryService = {
  // ========== Library Operations ==========

  async getLibraries(): Promise<ShapeLibrary[]> {
    const { data, error } = await supabase
      .from('shape_libraries')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return (data || []).map(mapLibraryFromDB)
  },

  async getPublicLibraries(): Promise<ShapeLibrary[]> {
    const { data, error } = await supabase
      .from('shape_libraries')
      .select('*')
      .eq('is_public', true)
      .order('name', { ascending: true })

    if (error) throw error
    return (data || []).map(mapLibraryFromDB)
  },

  async getLibraryById(id: string): Promise<ShapeLibrary | null> {
    const { data, error } = await supabase
      .from('shape_libraries')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data ? mapLibraryFromDB(data) : null
  },

  async createLibrary(input: CreateLibraryInput): Promise<ShapeLibrary> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('shape_libraries')
      .insert({
        name: input.name,
        description: input.description,
        is_public: input.isPublic ?? false,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return mapLibraryFromDB(data)
  },

  async updateLibrary(id: string, input: UpdateLibraryInput): Promise<ShapeLibrary> {
    const updateData: Record<string, unknown> = {}
    if (input.name !== undefined) updateData.name = input.name
    if (input.description !== undefined) updateData.description = input.description
    if (input.isPublic !== undefined) updateData.is_public = input.isPublic

    const { data, error } = await supabase
      .from('shape_libraries')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return mapLibraryFromDB(data)
  },

  async deleteLibrary(id: string): Promise<void> {
    const { error } = await supabase
      .from('shape_libraries')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // ========== Shape Operations ==========

  async getShapesByLibrary(libraryId: string): Promise<CustomShape[]> {
    const { data, error } = await supabase
      .from('custom_shapes')
      .select('*')
      .eq('library_id', libraryId)
      .order('name', { ascending: true })

    if (error) throw error
    return (data || []).map(mapShapeFromDB)
  },

  async getShapeById(id: string): Promise<CustomShape | null> {
    const { data, error } = await supabase
      .from('custom_shapes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data ? mapShapeFromDB(data) : null
  },

  async createShape(input: CreateShapeInput): Promise<CustomShape> {
    const { data, error } = await supabase
      .from('custom_shapes')
      .insert({
        library_id: input.libraryId,
        name: input.name,
        svg_content: input.svgContent,
        category: input.category,
      })
      .select()
      .single()

    if (error) throw error
    return mapShapeFromDB(data)
  },

  async updateShape(id: string, input: Partial<Pick<CustomShape, 'name' | 'category'>>): Promise<CustomShape> {
    const updateData: Record<string, unknown> = {}
    if (input.name !== undefined) updateData.name = input.name
    if (input.category !== undefined) updateData.category = input.category

    const { data, error } = await supabase
      .from('custom_shapes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return mapShapeFromDB(data)
  },

  async deleteShape(id: string): Promise<void> {
    const { error } = await supabase
      .from('custom_shapes')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // ========== Utility Functions ==========

  /**
   * Parse SVG content from file or string
   * Validates SVG and extracts viewBox for proper rendering
   */
  parseSvgContent(content: string): { svg: string; viewBox?: string } {
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'image/svg+xml')
    const svg = doc.querySelector('svg')

    if (!svg) {
      throw new Error('Invalid SVG content')
    }

    const viewBox = svg.getAttribute('viewBox') || undefined
    return { svg: content, viewBox }
  },

  /**
   * Convert PNG/image to SVG wrapper
   * Creates an SVG that contains the image as embedded data
   */
  async imageToSvg(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        const img = new Image()
        img.onload = () => {
          const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${img.width} ${img.height}" width="${img.width}" height="${img.height}">
  <image href="${dataUrl}" width="${img.width}" height="${img.height}" />
</svg>`
          resolve(svg)
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = dataUrl
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  },

  /**
   * Process uploaded file (SVG or image) and return SVG content
   */
  async processUploadedFile(file: File): Promise<string> {
    if (file.type === 'image/svg+xml') {
      return await file.text()
    }

    if (file.type.startsWith('image/')) {
      return await this.imageToSvg(file)
    }

    throw new Error('Unsupported file type. Please upload SVG or PNG/JPG images.')
  },
}
