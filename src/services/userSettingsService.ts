import { supabase } from './supabase'

export type ThemeMode = 'light' | 'dark' | 'system'

export interface UserSettings {
  id: string
  userId: string
  theme: ThemeMode
  autoSave: boolean
  showMinimap: boolean
  showGrid: boolean
  snapToGrid: boolean
  gridSize: number
  defaultZoom: number
  emailNotifications: boolean
  pushNotifications: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdateUserSettingsParams {
  theme?: ThemeMode
  autoSave?: boolean
  showMinimap?: boolean
  showGrid?: boolean
  snapToGrid?: boolean
  gridSize?: number
  defaultZoom?: number
  emailNotifications?: boolean
  pushNotifications?: boolean
}

const defaultSettings: Omit<UserSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
  theme: 'system',
  autoSave: true,
  showMinimap: true,
  showGrid: true,
  snapToGrid: false,
  gridSize: 10,
  defaultZoom: 1.0,
  emailNotifications: true,
  pushNotifications: true,
}

export const userSettingsService = {
  /**
   * Get user settings (creates default if not exists)
   */
  async get(): Promise<{ data: UserSettings | null; error: Error | null }> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: new Error('User must be authenticated') }
    }

    // Try to get existing settings
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is ok
      return { data: null, error: new Error(error.message) }
    }

    if (data) {
      return {
        data: mapToUserSettings(data),
        error: null,
      }
    }

    // Create default settings if not exists
    const { data: newData, error: createError } = await supabase
      .from('user_settings')
      .insert({
        user_id: user.id,
        ...mapToDbSettings(defaultSettings),
      })
      .select()
      .single()

    if (createError) {
      return { data: null, error: new Error(createError.message) }
    }

    return {
      data: mapToUserSettings(newData),
      error: null,
    }
  },

  /**
   * Update user settings
   */
  async update(params: UpdateUserSettingsParams): Promise<{ data: UserSettings | null; error: Error | null }> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: new Error('User must be authenticated') }
    }

    const updateData = mapToDbSettings(params)

    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        ...updateData,
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: new Error(error.message) }
    }

    return {
      data: mapToUserSettings(data),
      error: null,
    }
  },
}

// Helper to map DB row to UserSettings
function mapToUserSettings(row: Record<string, unknown>): UserSettings {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    theme: row.theme as ThemeMode,
    autoSave: row.auto_save as boolean,
    showMinimap: row.show_minimap as boolean,
    showGrid: row.show_grid as boolean,
    snapToGrid: row.snap_to_grid as boolean,
    gridSize: row.grid_size as number,
    defaultZoom: row.default_zoom as number,
    emailNotifications: row.email_notifications as boolean,
    pushNotifications: row.push_notifications as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

// Helper to map UserSettings params to DB columns
function mapToDbSettings(params: Partial<UpdateUserSettingsParams>): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  if (params.theme !== undefined) result.theme = params.theme
  if (params.autoSave !== undefined) result.auto_save = params.autoSave
  if (params.showMinimap !== undefined) result.show_minimap = params.showMinimap
  if (params.showGrid !== undefined) result.show_grid = params.showGrid
  if (params.snapToGrid !== undefined) result.snap_to_grid = params.snapToGrid
  if (params.gridSize !== undefined) result.grid_size = params.gridSize
  if (params.defaultZoom !== undefined) result.default_zoom = params.defaultZoom
  if (params.emailNotifications !== undefined) result.email_notifications = params.emailNotifications
  if (params.pushNotifications !== undefined) result.push_notifications = params.pushNotifications

  return result
}
