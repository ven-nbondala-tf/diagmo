import { formatDistanceToNow } from 'date-fns'
import {
  FileText,
  Share2,
  UserPlus,
  UserMinus,
  Edit,
  Trash2,
  Copy,
  FolderInput,
  Shield,
  History,
  type LucideIcon,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui'
import { cn } from '@/utils'
import type { AuditLog, AuditAction, AuditEntityType } from '@/services/auditService'

interface ActivityPanelProps {
  logs: AuditLog[]
  isLoading?: boolean
  emptyMessage?: string
  maxHeight?: string
  className?: string
}

const actionIcons: Record<AuditAction, LucideIcon> = {
  create: FileText,
  update: Edit,
  delete: Trash2,
  duplicate: Copy,
  move: FolderInput,
  rename: Edit,
  share: Share2,
  unshare: Share2,
  invite: UserPlus,
  join: UserPlus,
  leave: UserMinus,
  role_change: Shield,
  restore_version: History,
}

const actionColors: Record<AuditAction, string> = {
  create: 'text-green-500 bg-green-500/10',
  update: 'text-blue-500 bg-blue-500/10',
  delete: 'text-red-500 bg-red-500/10',
  duplicate: 'text-purple-500 bg-purple-500/10',
  move: 'text-orange-500 bg-orange-500/10',
  rename: 'text-blue-500 bg-blue-500/10',
  share: 'text-cyan-500 bg-cyan-500/10',
  unshare: 'text-gray-500 bg-gray-500/10',
  invite: 'text-green-500 bg-green-500/10',
  join: 'text-green-500 bg-green-500/10',
  leave: 'text-orange-500 bg-orange-500/10',
  role_change: 'text-purple-500 bg-purple-500/10',
  restore_version: 'text-amber-500 bg-amber-500/10',
}

const entityLabels: Record<AuditEntityType, string> = {
  diagram: 'diagram',
  folder: 'folder',
  workspace: 'workspace',
  share: 'share',
  workspace_member: 'member',
}

function getActionDescription(log: AuditLog): string {
  const entity = entityLabels[log.entityType]
  const name = log.entityName ? `"${log.entityName}"` : ''

  switch (log.action) {
    case 'create':
      return `Created ${entity} ${name}`
    case 'update':
      return `Updated ${entity} ${name}`
    case 'delete':
      return `Deleted ${entity} ${name}`
    case 'duplicate':
      return `Duplicated ${entity} ${name}`
    case 'move':
      if (log.metadata.new_workspace_id !== undefined) {
        return `Moved ${entity} ${name} to ${log.metadata.new_workspace_id ? 'workspace' : 'personal'}`
      }
      return `Moved ${entity} ${name}`
    case 'rename':
      return `Renamed ${entity} from "${log.metadata.old_name}" to "${log.metadata.new_name}"`
    case 'share':
      if (log.metadata.share_type === 'email') {
        return `Shared ${name} with ${log.metadata.shared_with}`
      }
      if (log.metadata.share_type === 'public') {
        return `Made ${name} public`
      }
      return `Created share link for ${name}`
    case 'unshare':
      return `Removed sharing for ${name}`
    case 'invite':
      return `Invited ${log.metadata.email} as ${log.metadata.role}`
    case 'join':
      return `Joined workspace as ${log.metadata.role}`
    case 'leave':
      return `Left workspace`
    case 'role_change':
      return `Changed role from ${log.metadata.old_role} to ${log.metadata.new_role}`
    case 'restore_version':
      return `Restored previous version of ${name}`
    default:
      return `${log.action} ${entity} ${name}`
  }
}

function ActivityItem({ log }: { log: AuditLog }) {
  const Icon = actionIcons[log.action] || Edit
  const colorClass = actionColors[log.action] || 'text-gray-500 bg-gray-500/10'
  const description = getActionDescription(log)
  const timeAgo = formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })

  return (
    <div className="flex items-start gap-3 py-3 px-4 hover:bg-muted/50 transition-colors">
      <div className={cn('p-2 rounded-lg shrink-0', colorClass)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-snug">
          {description}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">
            {log.userEmail || 'Unknown user'}
          </span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">
            {timeAgo}
          </span>
        </div>
      </div>
    </div>
  )
}

export function ActivityPanel({
  logs,
  isLoading = false,
  emptyMessage = 'No activity yet',
  maxHeight = '400px',
  className,
}: ActivityPanelProps) {
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12 text-muted-foreground', className)}>
        <History className="h-12 w-12 mb-3 opacity-50" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <ScrollArea className={className} style={{ maxHeight }}>
      <div className="divide-y divide-border">
        {logs.map((log) => (
          <ActivityItem key={log.id} log={log} />
        ))}
      </div>
    </ScrollArea>
  )
}
