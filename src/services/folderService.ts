import { supabase } from './supabase'
import type { Folder } from '@/types'

interface CreateFolderInput {
  name: string
  parentId?: string
}

interface UpdateFolderInput {
  name?: string
  parentId?: string
}

function mapFolderFromDB(row: Record<string, unknown>): Folder {
  return {
    id: row.id as string,
    name: row.name as string,
    userId: row.user_id as string,
    parentId: row.parent_id as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export const folderService = {
  async getAll(): Promise<Folder[]> {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return (data || []).map(mapFolderFromDB)
  },

  async getById(id: string): Promise<Folder | null> {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data ? mapFolderFromDB(data) : null
  },

  async create(input: CreateFolderInput): Promise<Folder> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('folders')
      .insert({
        name: input.name,
        parent_id: input.parentId,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return mapFolderFromDB(data)
  },

  async update(id: string, input: UpdateFolderInput): Promise<Folder> {
    const updateData: Record<string, unknown> = {}
    if (input.name !== undefined) updateData.name = input.name
    if (input.parentId !== undefined) updateData.parent_id = input.parentId

    const { data, error } = await supabase
      .from('folders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return mapFolderFromDB(data)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getChildren(parentId: string | null): Promise<Folder[]> {
    let query = supabase
      .from('folders')
      .select('*')
      .order('name', { ascending: true })

    if (parentId) {
      query = query.eq('parent_id', parentId)
    } else {
      query = query.is('parent_id', null)
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []).map(mapFolderFromDB)
  },
}
