/**
 * Audit Log Panel
 * Enterprise activity tracking and compliance viewer
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  auditLogService,
  type AuditLogEntry,
  type AuditAction,
  type AuditLogFilters,
} from '@/services/auditLogService'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Button,
  Input,
  ScrollArea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { cn } from '@/utils'
import {
  Activity,
  X,
  Search,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText,
  Users,
  MessageSquare,
  Briefcase,
  Folder,
  User,
  LayoutTemplate,
  Key,
  Upload,
  Check,
  XCircle,
  Clock,
  RefreshCw,
  Calendar,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

interface AuditLogPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resourceId?: string
  resourceType?: AuditLogEntry['resourceType']
}

// Icon mapping for actions
const actionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'file-text': FileText,
  users: Users,
  'message-square': MessageSquare,
  briefcase: Briefcase,
  folder: Folder,
  user: User,
  'layout-template': LayoutTemplate,
  key: Key,
  download: Download,
  upload: Upload,
  activity: Activity,
}

// Log entry component
function LogEntry({ log }: { log: AuditLogEntry }) {
  const [expanded, setExpanded] = useState(false)
  const iconName = auditLogService.getActionIcon(log.action)
  const Icon = actionIcons[iconName] || Activity

  const formattedTime = new Date(log.timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const relativeTime = useMemo(() => {
    const now = Date.now()
    const then = new Date(log.timestamp).getTime()
    const diff = now - then
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return formattedTime
  }, [log.timestamp, formattedTime])

  return (
    <div
      className={cn(
        'border-b border-border last:border-b-0 transition-colors',
        expanded ? 'bg-muted/30' : 'hover:bg-muted/20'
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-3 text-left"
      >
        {/* Icon */}
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
            log.success ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'
          )}
        >
          <Icon className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">
              {auditLogService.getActionDisplayName(log.action)}
            </span>
            {!log.success && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/10 text-red-500">
                Failed
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {log.resourceName || log.resourceId}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span>{log.userName || log.userEmail?.split('@')[0] || 'Unknown'}</span>
            <span>•</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">{relativeTime}</span>
              </TooltipTrigger>
              <TooltipContent>{formattedTime}</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Status icon */}
        <div className="flex-shrink-0">
          {log.success ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500" />
          )}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-3 pb-3 pl-14 space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-muted-foreground">User ID:</span>
              <span className="ml-1 font-mono">{log.userId.slice(0, 8)}...</span>
            </div>
            <div>
              <span className="text-muted-foreground">Resource:</span>
              <span className="ml-1">{log.resourceType}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Session:</span>
              <span className="ml-1 font-mono">{log.sessionId?.slice(0, 12) || 'N/A'}...</span>
            </div>
            <div>
              <span className="text-muted-foreground">Timestamp:</span>
              <span className="ml-1">{new Date(log.timestamp).toISOString()}</span>
            </div>
          </div>

          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div className="mt-2 p-2 rounded bg-muted/50">
              <div className="text-muted-foreground mb-1">Metadata:</div>
              <pre className="text-[10px] font-mono overflow-x-auto">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}

          {log.errorMessage && (
            <div className="mt-2 p-2 rounded bg-red-500/10 text-red-500">
              <div className="font-medium mb-1">Error:</div>
              <div>{log.errorMessage}</div>
            </div>
          )}

          {log.userAgent && (
            <div className="text-[10px] text-muted-foreground truncate">
              <span className="font-medium">User Agent:</span> {log.userAgent}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Statistics summary component
function StatsSummary({
  totalLogs,
  uniqueUsers,
  errorRate,
}: {
  totalLogs: number
  uniqueUsers: number
  errorRate: number
}) {
  return (
    <div className="grid grid-cols-3 gap-2 p-3 bg-muted/30 border-b">
      <div className="text-center">
        <div className="text-lg font-bold">{totalLogs}</div>
        <div className="text-xs text-muted-foreground">Total Events</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold">{uniqueUsers}</div>
        <div className="text-xs text-muted-foreground">Active Users</div>
      </div>
      <div className="text-center">
        <div
          className={cn('text-lg font-bold', errorRate > 5 ? 'text-red-500' : 'text-green-500')}
        >
          {errorRate.toFixed(1)}%
        </div>
        <div className="text-xs text-muted-foreground">Error Rate</div>
      </div>
    </div>
  )
}

export function AuditLogPanel({
  open,
  onOpenChange,
  resourceId,
  resourceType,
}: AuditLogPanelProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [successFilter, setSuccessFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('7days')

  const pageSize = 20

  // Build filters object
  const filters = useMemo((): AuditLogFilters => {
    const f: AuditLogFilters = {}

    if (resourceId) f.resourceId = resourceId
    if (resourceType) f.resourceType = resourceType
    if (searchTerm) f.searchTerm = searchTerm
    if (actionFilter !== 'all') f.action = actionFilter as AuditAction
    if (successFilter !== 'all') f.success = successFilter === 'success'

    // Date filter
    const now = new Date()
    switch (dateFilter) {
      case '24h':
        f.startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7days':
        f.startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30days':
        f.startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90days':
        f.startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
    }

    return f
  }, [resourceId, resourceType, searchTerm, actionFilter, successFilter, dateFilter])

  // Load logs
  const loadLogs = useCallback(async () => {
    setLoading(true)
    try {
      const response = await auditLogService.getLogs(filters, { page, pageSize })
      setLogs(response.logs)
      setTotalPages(response.totalPages)
      setTotal(response.total)
    } catch (error) {
      console.error('Failed to load audit logs:', error)
      toast.error('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  // Load on mount and filter changes
  useEffect(() => {
    if (open) {
      loadLogs()
    }
  }, [open, loadLogs])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [searchTerm, actionFilter, successFilter, dateFilter])

  // Calculate simple stats from loaded logs
  const stats = useMemo(() => {
    const uniqueUsers = new Set(logs.map((l) => l.userId)).size
    const errorCount = logs.filter((l) => !l.success).length
    const errorRate = logs.length > 0 ? (errorCount / logs.length) * 100 : 0
    return { totalLogs: total, uniqueUsers, errorRate }
  }, [logs, total])

  // Export handler
  const handleExport = async () => {
    try {
      toast.loading('Exporting audit logs...')
      const csv = await auditLogService.exportToCsv(filters)
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.dismiss()
      toast.success('Audit logs exported')
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to export audit logs')
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[450px] sm:w-[500px] p-0 flex flex-col">
        <SheetHeader className="p-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Audit Log
            </SheetTitle>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={loadLogs}
                    disabled={loading}
                    className="h-8 w-8"
                  >
                    <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleExport}
                    className="h-8 w-8"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export CSV</TooltipContent>
              </Tooltip>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        {/* Stats Summary */}
        <StatsSummary {...stats} />

        {/* Filters */}
        <div className="p-3 border-b space-y-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {/* Filter Row */}
          <div className="flex gap-2">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="h-8 text-xs flex-1">
                <Calendar className="w-3 h-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>

            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="h-8 text-xs flex-1">
                <Filter className="w-3 h-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                <SelectItem value="diagram.create">Create</SelectItem>
                <SelectItem value="diagram.update">Update</SelectItem>
                <SelectItem value="diagram.delete">Delete</SelectItem>
                <SelectItem value="diagram.export">Export</SelectItem>
                <SelectItem value="diagram.share">Share</SelectItem>
                <SelectItem value="collaboration.join">Join</SelectItem>
              </SelectContent>
            </Select>

            <Select value={successFilter} onValueChange={setSuccessFilter}>
              <SelectTrigger className="h-8 text-xs w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Log List */}
        <ScrollArea className="flex-1">
          {loading && logs.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Clock className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">No audit logs found</p>
              <p className="text-xs mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div>
              {logs.map((log) => (
                <LogEntry key={log.id} log={log} />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-3 border-t">
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages} ({total} total)
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="h-8 w-8"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="h-8 w-8"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t bg-muted/30 text-center">
          <p className="text-xs text-muted-foreground">
            Audit logs are retained for 90 days
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
