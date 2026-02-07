import { useQuery } from '@tanstack/react-query'
import { auditService, type AuditLogFilters } from '@/services/auditService'

export const auditLogKeys = {
  all: ['audit-logs'] as const,
  lists: () => [...auditLogKeys.all, 'list'] as const,
  list: (filters: AuditLogFilters) => [...auditLogKeys.lists(), filters] as const,
  diagram: (diagramId: string) => [...auditLogKeys.all, 'diagram', diagramId] as const,
  workspace: (workspaceId: string) => [...auditLogKeys.all, 'workspace', workspaceId] as const,
  myActivity: () => [...auditLogKeys.all, 'my-activity'] as const,
  recent: () => [...auditLogKeys.all, 'recent'] as const,
}

/**
 * Get audit logs with optional filters
 */
export function useAuditLogs(filters: AuditLogFilters = {}) {
  return useQuery({
    queryKey: auditLogKeys.list(filters),
    queryFn: () => auditService.getLogs(filters),
  })
}

/**
 * Get audit logs for a specific diagram
 */
export function useDiagramAuditLogs(diagramId: string | undefined, limit = 50) {
  return useQuery({
    queryKey: auditLogKeys.diagram(diagramId || ''),
    queryFn: () => (diagramId ? auditService.getDiagramLogs(diagramId, limit) : []),
    enabled: !!diagramId,
  })
}

/**
 * Get audit logs for a workspace
 */
export function useWorkspaceAuditLogs(workspaceId: string | undefined, limit = 50) {
  return useQuery({
    queryKey: auditLogKeys.workspace(workspaceId || ''),
    queryFn: () => (workspaceId ? auditService.getWorkspaceLogs(workspaceId, limit) : []),
    enabled: !!workspaceId,
  })
}

/**
 * Get current user's activity
 */
export function useMyActivity(limit = 50) {
  return useQuery({
    queryKey: auditLogKeys.myActivity(),
    queryFn: () => auditService.getMyActivity(limit),
  })
}

/**
 * Get recent activity across all accessible items
 */
export function useRecentActivity(limit = 50) {
  return useQuery({
    queryKey: auditLogKeys.recent(),
    queryFn: () => auditService.getRecentActivity(limit),
  })
}
