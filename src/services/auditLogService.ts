/**
 * Audit Logging Service
 * Enterprise-grade activity tracking for compliance and security
 */

import { supabase } from './supabase'

// Audit log entry types
export type AuditAction =
  | 'diagram.create'
  | 'diagram.update'
  | 'diagram.delete'
  | 'diagram.view'
  | 'diagram.export'
  | 'diagram.share'
  | 'diagram.unshare'
  | 'diagram.duplicate'
  | 'diagram.restore'
  | 'diagram.branch.create'
  | 'diagram.branch.merge'
  | 'diagram.branch.delete'
  | 'collaboration.join'
  | 'collaboration.leave'
  | 'collaboration.edit'
  | 'comment.create'
  | 'comment.delete'
  | 'comment.resolve'
  | 'workspace.create'
  | 'workspace.update'
  | 'workspace.delete'
  | 'workspace.member.add'
  | 'workspace.member.remove'
  | 'workspace.member.role.change'
  | 'folder.create'
  | 'folder.update'
  | 'folder.delete'
  | 'user.login'
  | 'user.logout'
  | 'user.settings.update'
  | 'template.publish'
  | 'template.unpublish'
  | 'api.access'
  | 'export.pdf'
  | 'export.png'
  | 'export.svg'
  | 'import.json'
  | 'import.mermaid'
  | 'import.drawio'
  | 'import.terraform'

// Audit log entry interface
export interface AuditLogEntry {
  id: string
  timestamp: string
  userId: string
  userEmail?: string
  userName?: string
  action: AuditAction
  resourceType: 'diagram' | 'workspace' | 'folder' | 'comment' | 'user' | 'template' | 'branch'
  resourceId: string
  resourceName?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  workspaceId?: string
  success: boolean
  errorMessage?: string
}

// Audit log filter options
export interface AuditLogFilters {
  userId?: string
  action?: AuditAction | AuditAction[]
  resourceType?: AuditLogEntry['resourceType']
  resourceId?: string
  workspaceId?: string
  startDate?: Date
  endDate?: Date
  success?: boolean
  searchTerm?: string
}

// Audit log pagination
export interface AuditLogPagination {
  page: number
  pageSize: number
}

// Audit log response
export interface AuditLogResponse {
  logs: AuditLogEntry[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Audit statistics
export interface AuditStatistics {
  totalActions: number
  uniqueUsers: number
  actionBreakdown: Record<string, number>
  resourceTypeBreakdown: Record<string, number>
  dailyActivity: Array<{ date: string; count: number }>
  topUsers: Array<{ userId: string; userName?: string; actionCount: number }>
  errorRate: number
  peakHour: number
}

// In-memory buffer for batching log writes
const logBuffer: Omit<AuditLogEntry, 'id'>[] = []
let flushTimeout: number | null = null
const BUFFER_SIZE = 50
const FLUSH_INTERVAL = 5000 // 5 seconds

// Get client info (IP and user agent)
function getClientInfo(): { ipAddress?: string; userAgent?: string } {
  return {
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    ipAddress: undefined, // IP is typically captured server-side
  }
}

// Generate session ID
function getSessionId(): string {
  if (typeof window === 'undefined') return ''

  let sessionId = sessionStorage.getItem('audit_session_id')
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('audit_session_id', sessionId)
  }
  return sessionId
}

// Flush the log buffer to the database
async function flushBuffer(): Promise<void> {
  if (logBuffer.length === 0) return

  const logsToInsert = [...logBuffer]
  logBuffer.length = 0

  try {
    // Map to existing database schema (entity_type, entity_id, entity_name columns)
    const { error } = await supabase.from('audit_logs').insert(
      logsToInsert.map((log) => ({
        user_id: log.userId,
        user_email: log.userEmail,
        entity_type: log.resourceType, // Maps to existing column
        entity_id: log.resourceId, // Maps to existing column
        entity_name: log.resourceName, // Maps to existing column
        action: mapActionToDbAction(log.action),
        workspace_id: log.workspaceId,
        metadata: {
          ...log.metadata,
          full_action: log.action,
          user_name: log.userName,
          ip_address: log.ipAddress,
          user_agent: log.userAgent,
          session_id: log.sessionId,
          success: log.success,
          error_message: log.errorMessage,
        },
      }))
    )

    if (error) {
      console.error('Failed to write audit logs:', error)
      // Re-add logs to buffer on failure (up to limit)
      logBuffer.push(...logsToInsert.slice(0, BUFFER_SIZE - logBuffer.length))
    }
  } catch (err) {
    console.error('Audit log flush error:', err)
  }
}

// Map detailed action to database enum
function mapActionToDbAction(action: AuditAction): string {
  const actionMap: Record<string, string> = {
    'diagram.create': 'create',
    'diagram.update': 'update',
    'diagram.delete': 'delete',
    'diagram.view': 'update', // No view action in DB, use update
    'diagram.export': 'update',
    'diagram.share': 'share',
    'diagram.unshare': 'unshare',
    'diagram.duplicate': 'duplicate',
    'diagram.restore': 'restore_version',
    'diagram.branch.create': 'create',
    'diagram.branch.merge': 'update',
    'diagram.branch.delete': 'delete',
    'collaboration.join': 'join',
    'collaboration.leave': 'leave',
    'collaboration.edit': 'update',
    'comment.create': 'create',
    'comment.delete': 'delete',
    'comment.resolve': 'update',
    'workspace.create': 'create',
    'workspace.update': 'update',
    'workspace.delete': 'delete',
    'workspace.member.add': 'invite',
    'workspace.member.remove': 'leave',
    'workspace.member.role.change': 'role_change',
    'folder.create': 'create',
    'folder.update': 'rename',
    'folder.delete': 'delete',
    'user.login': 'create',
    'user.logout': 'delete',
    'user.settings.update': 'update',
    'template.publish': 'share',
    'template.unpublish': 'unshare',
    'api.access': 'update',
    'export.pdf': 'update',
    'export.png': 'update',
    'export.svg': 'update',
    'import.json': 'update',
    'import.mermaid': 'update',
    'import.drawio': 'update',
    'import.terraform': 'update',
  }
  return actionMap[action] || 'update'
}

// Schedule buffer flush
function scheduleFlush(): void {
  if (flushTimeout !== null) return

  flushTimeout = window.setTimeout(() => {
    flushTimeout = null
    flushBuffer()
  }, FLUSH_INTERVAL)
}

// Main audit log service
export const auditLogService = {
  /**
   * Log an audit event
   */
  async log(
    action: AuditAction,
    resourceType: AuditLogEntry['resourceType'],
    resourceId: string,
    options?: {
      resourceName?: string
      metadata?: Record<string, unknown>
      workspaceId?: string
      success?: boolean
      errorMessage?: string
    }
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const clientInfo = getClientInfo()
    const sessionId = getSessionId()

    const logEntry: Omit<AuditLogEntry, 'id'> = {
      timestamp: new Date().toISOString(),
      userId: user.id,
      userEmail: user.email,
      userName: user.user_metadata?.full_name || user.email?.split('@')[0],
      action,
      resourceType,
      resourceId,
      resourceName: options?.resourceName,
      metadata: options?.metadata,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      sessionId,
      workspaceId: options?.workspaceId,
      success: options?.success ?? true,
      errorMessage: options?.errorMessage,
    }

    // Add to buffer
    logBuffer.push(logEntry)

    // Flush if buffer is full
    if (logBuffer.length >= BUFFER_SIZE) {
      flushBuffer()
    } else {
      scheduleFlush()
    }
  },

  /**
   * Force flush pending logs
   */
  async flush(): Promise<void> {
    if (flushTimeout !== null) {
      clearTimeout(flushTimeout)
      flushTimeout = null
    }
    await flushBuffer()
  },

  /**
   * Get audit logs with filtering and pagination
   */
  async getLogs(
    filters?: AuditLogFilters,
    pagination?: AuditLogPagination
  ): Promise<AuditLogResponse> {
    const page = pagination?.page ?? 1
    const pageSize = pagination?.pageSize ?? 50
    const offset = (page - 1) * pageSize

    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })

    // Apply filters
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId)
    }

    if (filters?.action) {
      if (Array.isArray(filters.action)) {
        query = query.in('action', filters.action)
      } else {
        query = query.eq('action', filters.action)
      }
    }

    if (filters?.resourceType) {
      query = query.eq('entity_type', filters.resourceType) // DB uses entity_type
    }

    if (filters?.resourceId) {
      query = query.eq('entity_id', filters.resourceId) // DB uses entity_id
    }

    if (filters?.workspaceId) {
      query = query.eq('workspace_id', filters.workspaceId)
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString()) // DB uses created_at
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString()) // DB uses created_at
    }

    // Note: success is stored in metadata, can't filter at DB level easily
    // We'll filter in memory after fetch if needed

    if (filters?.searchTerm) {
      query = query.or(
        `entity_name.ilike.%${filters.searchTerm}%,user_email.ilike.%${filters.searchTerm}%` // DB uses entity_name
      )
    }

    // Order and paginate
    query = query
      .order('created_at', { ascending: false }) // DB uses created_at
      .range(offset, offset + pageSize - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Failed to fetch audit logs:', error)
      throw error
    }

    // Map from database schema (entity_*) to our interface (resource_*)
    const logs: AuditLogEntry[] = (data || []).map((row) => {
      const metadata = row.metadata || {}
      return {
        id: row.id,
        timestamp: row.created_at, // DB uses created_at
        userId: row.user_id,
        userEmail: row.user_email,
        userName: metadata.user_name,
        action: metadata.full_action || row.action, // Use full action from metadata if available
        resourceType: row.entity_type, // DB uses entity_type
        resourceId: row.entity_id, // DB uses entity_id
        resourceName: row.entity_name, // DB uses entity_name
        metadata: row.metadata,
        ipAddress: metadata.ip_address,
        userAgent: metadata.user_agent,
        sessionId: metadata.session_id,
        workspaceId: row.workspace_id,
        success: metadata.success !== false, // Default to true
        errorMessage: metadata.error_message,
      }
    })

    return {
      logs,
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    }
  },

  /**
   * Get audit logs for a specific resource
   */
  async getResourceLogs(
    resourceType: AuditLogEntry['resourceType'],
    resourceId: string,
    limit = 50
  ): Promise<AuditLogEntry[]> {
    const { logs } = await this.getLogs(
      { resourceType, resourceId },
      { page: 1, pageSize: limit }
    )
    return logs
  },

  /**
   * Get audit statistics
   */
  async getStatistics(
    filters?: Pick<AuditLogFilters, 'workspaceId' | 'startDate' | 'endDate'>
  ): Promise<AuditStatistics> {
    let query = supabase.from('audit_logs').select('*')

    if (filters?.workspaceId) {
      query = query.eq('workspace_id', filters.workspaceId)
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString()) // DB uses created_at
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString()) // DB uses created_at
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch audit statistics:', error)
      throw error
    }

    const logs = data || []

    // Calculate statistics
    const uniqueUsers = new Set(logs.map((l) => l.user_id)).size
    const errorCount = logs.filter((l) => l.metadata?.success === false).length
    const errorRate = logs.length > 0 ? (errorCount / logs.length) * 100 : 0

    // Action breakdown
    const actionBreakdown: Record<string, number> = {}
    logs.forEach((l) => {
      const action = l.metadata?.full_action || l.action
      actionBreakdown[action] = (actionBreakdown[action] || 0) + 1
    })

    // Resource type breakdown (DB uses entity_type)
    const resourceTypeBreakdown: Record<string, number> = {}
    logs.forEach((l) => {
      resourceTypeBreakdown[l.entity_type] = (resourceTypeBreakdown[l.entity_type] || 0) + 1
    })

    // Daily activity (DB uses created_at)
    const dailyMap = new Map<string, number>()
    logs.forEach((l) => {
      const date = l.created_at.split('T')[0]
      dailyMap.set(date, (dailyMap.get(date) || 0) + 1)
    })
    const dailyActivity = Array.from(dailyMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30) // Last 30 days

    // Top users
    const userMap = new Map<string, { userName?: string; actionCount: number }>()
    logs.forEach((l) => {
      const existing = userMap.get(l.user_id) || { userName: l.user_name, actionCount: 0 }
      existing.actionCount++
      userMap.set(l.user_id, existing)
    })
    const topUsers = Array.from(userMap.entries())
      .map(([userId, data]) => ({ userId, ...data }))
      .sort((a, b) => b.actionCount - a.actionCount)
      .slice(0, 10)

    // Peak hour (DB uses created_at)
    const hourMap = new Map<number, number>()
    logs.forEach((l) => {
      const hour = new Date(l.created_at).getHours()
      hourMap.set(hour, (hourMap.get(hour) || 0) + 1)
    })
    let peakHour = 0
    let peakCount = 0
    hourMap.forEach((count, hour) => {
      if (count > peakCount) {
        peakCount = count
        peakHour = hour
      }
    })

    return {
      totalActions: logs.length,
      uniqueUsers,
      actionBreakdown,
      resourceTypeBreakdown,
      dailyActivity,
      topUsers,
      errorRate,
      peakHour,
    }
  },

  /**
   * Export audit logs to CSV
   */
  async exportToCsv(filters?: AuditLogFilters): Promise<string> {
    // Get all logs matching filters
    const allLogs: AuditLogEntry[] = []
    let page = 1
    const pageSize = 1000

    while (true) {
      const { logs, totalPages } = await this.getLogs(filters, { page, pageSize })
      allLogs.push(...logs)
      if (page >= totalPages) break
      page++
    }

    // Generate CSV
    const headers = [
      'Timestamp',
      'User Email',
      'User Name',
      'Action',
      'Resource Type',
      'Resource ID',
      'Resource Name',
      'Workspace ID',
      'Success',
      'Error Message',
      'IP Address',
      'User Agent',
      'Session ID',
    ]

    const rows = allLogs.map((log) => [
      log.timestamp,
      log.userEmail || '',
      log.userName || '',
      log.action,
      log.resourceType,
      log.resourceId,
      log.resourceName || '',
      log.workspaceId || '',
      log.success ? 'Yes' : 'No',
      log.errorMessage || '',
      log.ipAddress || '',
      log.userAgent || '',
      log.sessionId || '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n')

    return csvContent
  },

  /**
   * Get action display name
   */
  getActionDisplayName(action: AuditAction): string {
    const displayNames: Record<AuditAction, string> = {
      'diagram.create': 'Created Diagram',
      'diagram.update': 'Updated Diagram',
      'diagram.delete': 'Deleted Diagram',
      'diagram.view': 'Viewed Diagram',
      'diagram.export': 'Exported Diagram',
      'diagram.share': 'Shared Diagram',
      'diagram.unshare': 'Unshared Diagram',
      'diagram.duplicate': 'Duplicated Diagram',
      'diagram.restore': 'Restored Diagram',
      'diagram.branch.create': 'Created Branch',
      'diagram.branch.merge': 'Merged Branch',
      'diagram.branch.delete': 'Deleted Branch',
      'collaboration.join': 'Joined Collaboration',
      'collaboration.leave': 'Left Collaboration',
      'collaboration.edit': 'Collaborative Edit',
      'comment.create': 'Added Comment',
      'comment.delete': 'Deleted Comment',
      'comment.resolve': 'Resolved Comment',
      'workspace.create': 'Created Workspace',
      'workspace.update': 'Updated Workspace',
      'workspace.delete': 'Deleted Workspace',
      'workspace.member.add': 'Added Workspace Member',
      'workspace.member.remove': 'Removed Workspace Member',
      'workspace.member.role.change': 'Changed Member Role',
      'folder.create': 'Created Folder',
      'folder.update': 'Updated Folder',
      'folder.delete': 'Deleted Folder',
      'user.login': 'User Login',
      'user.logout': 'User Logout',
      'user.settings.update': 'Updated Settings',
      'template.publish': 'Published Template',
      'template.unpublish': 'Unpublished Template',
      'api.access': 'API Access',
      'export.pdf': 'Exported to PDF',
      'export.png': 'Exported to PNG',
      'export.svg': 'Exported to SVG',
      'import.json': 'Imported JSON',
      'import.mermaid': 'Imported Mermaid',
      'import.drawio': 'Imported Draw.io',
      'import.terraform': 'Imported Terraform',
    }
    return displayNames[action] || action
  },

  /**
   * Get action icon name
   */
  getActionIcon(action: AuditAction): string {
    const category = action.split('.')[0]
    const icons: Record<string, string> = {
      diagram: 'file-text',
      collaboration: 'users',
      comment: 'message-square',
      workspace: 'briefcase',
      folder: 'folder',
      user: 'user',
      template: 'layout-template',
      api: 'key',
      export: 'download',
      import: 'upload',
    }
    return icons[category] || 'activity'
  },
}

// Flush on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    auditLogService.flush()
  })
}
