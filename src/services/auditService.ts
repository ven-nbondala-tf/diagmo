import { supabase } from './supabase'

export type AuditEntityType = 'diagram' | 'folder' | 'workspace' | 'share' | 'workspace_member'

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'duplicate'
  | 'move'
  | 'rename'
  | 'share'
  | 'unshare'
  | 'invite'
  | 'join'
  | 'leave'
  | 'role_change'
  | 'restore_version'

export interface AuditLog {
  id: string
  userId: string | null
  userEmail: string | null
  entityType: AuditEntityType
  entityId: string
  entityName: string | null
  action: AuditAction
  workspaceId: string | null
  metadata: Record<string, unknown>
  createdAt: string
}

export interface AuditLogFilters {
  entityType?: AuditEntityType
  entityId?: string
  workspaceId?: string
  userId?: string
  action?: AuditAction
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

function mapAuditLogFromDB(row: Record<string, unknown>): AuditLog {
  return {
    id: row.id as string,
    userId: row.user_id as string | null,
    userEmail: row.user_email as string | null,
    entityType: row.entity_type as AuditEntityType,
    entityId: row.entity_id as string,
    entityName: row.entity_name as string | null,
    action: row.action as AuditAction,
    workspaceId: row.workspace_id as string | null,
    metadata: (row.metadata as Record<string, unknown>) || {},
    createdAt: row.created_at as string,
  }
}

class AuditService {
  /**
   * Check if audit_logs table exists
   */
  private async tableExists(): Promise<boolean> {
    const { error } = await supabase
      .from('audit_logs')
      .select('id')
      .limit(1)

    return !error || error.code !== 'PGRST205'
  }

  /**
   * Get audit logs with optional filters
   */
  async getLogs(filters: AuditLogFilters = {}): Promise<AuditLog[]> {
    // Check if table exists
    if (!(await this.tableExists())) {
      return []
    }

    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.entityType) {
      query = query.eq('entity_type', filters.entityType)
    }

    if (filters.entityId) {
      query = query.eq('entity_id', filters.entityId)
    }

    if (filters.workspaceId) {
      query = query.eq('workspace_id', filters.workspaceId)
    }

    if (filters.userId) {
      query = query.eq('user_id', filters.userId)
    }

    if (filters.action) {
      query = query.eq('action', filters.action)
    }

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate)
    }

    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate)
    }

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching audit logs:', error)
      return []
    }

    return (data || []).map(mapAuditLogFromDB)
  }

  /**
   * Get audit logs for a specific diagram
   */
  async getDiagramLogs(diagramId: string, limit = 50): Promise<AuditLog[]> {
    return this.getLogs({
      entityType: 'diagram',
      entityId: diagramId,
      limit,
    })
  }

  /**
   * Get audit logs for a workspace
   */
  async getWorkspaceLogs(workspaceId: string, limit = 50): Promise<AuditLog[]> {
    return this.getLogs({
      workspaceId,
      limit,
    })
  }

  /**
   * Get recent activity for the current user
   */
  async getMyActivity(limit = 50): Promise<AuditLog[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    return this.getLogs({
      userId: user.id,
      limit,
    })
  }

  /**
   * Get recent activity across all user's diagrams and workspaces
   */
  async getRecentActivity(limit = 50): Promise<AuditLog[]> {
    return this.getLogs({ limit })
  }

  /**
   * Manually log an action (for client-side actions that don't trigger DB)
   */
  async logAction(
    entityType: AuditEntityType,
    entityId: string,
    entityName: string,
    action: AuditAction,
    workspaceId?: string,
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    if (!(await this.tableExists())) {
      return
    }

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('audit_logs').insert({
      user_id: user?.id,
      user_email: user?.email,
      entity_type: entityType,
      entity_id: entityId,
      entity_name: entityName,
      action,
      workspace_id: workspaceId,
      metadata,
    })

    if (error) {
      console.error('Error logging audit action:', error)
    }
  }
}

export const auditService = new AuditService()
