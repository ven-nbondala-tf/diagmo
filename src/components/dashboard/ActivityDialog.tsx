import { useState } from 'react'
import { History, Filter } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { ActivityPanel } from './ActivityPanel'
import { useRecentActivity, useMyActivity, useWorkspaceAuditLogs } from '@/hooks/useAuditLogs'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import type { AuditAction } from '@/services/auditService'

interface ActivityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const actionFilters: { value: AuditAction | 'all'; label: string }[] = [
  { value: 'all', label: 'All actions' },
  { value: 'create', label: 'Created' },
  { value: 'update', label: 'Updated' },
  { value: 'delete', label: 'Deleted' },
  { value: 'share', label: 'Shared' },
  { value: 'move', label: 'Moved' },
]

export function ActivityDialog({ open, onOpenChange }: ActivityDialogProps) {
  const [actionFilter, setActionFilter] = useState<AuditAction | 'all'>('all')
  const { currentWorkspaceId } = useWorkspaceStore()

  const { data: recentLogs = [], isLoading: isRecentLoading } = useRecentActivity(100)
  const { data: myLogs = [], isLoading: isMyLoading } = useMyActivity(100)
  const { data: workspaceLogs = [], isLoading: isWorkspaceLoading } = useWorkspaceAuditLogs(
    currentWorkspaceId || undefined,
    100
  )

  const filterLogs = (logs: typeof recentLogs) => {
    if (actionFilter === 'all') return logs
    return logs.filter((log) => log.action === actionFilter)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Activity Log
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 py-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={actionFilter}
            onValueChange={(value) => setActionFilter(value as AuditAction | 'all')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              {actionFilters.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="recent" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="my-activity">My Activity</TabsTrigger>
            {currentWorkspaceId && (
              <TabsTrigger value="workspace">Workspace</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="recent" className="flex-1 overflow-hidden mt-4">
            <ActivityPanel
              logs={filterLogs(recentLogs)}
              isLoading={isRecentLoading}
              emptyMessage="No recent activity"
              maxHeight="calc(80vh - 220px)"
            />
          </TabsContent>

          <TabsContent value="my-activity" className="flex-1 overflow-hidden mt-4">
            <ActivityPanel
              logs={filterLogs(myLogs)}
              isLoading={isMyLoading}
              emptyMessage="You haven't performed any actions yet"
              maxHeight="calc(80vh - 220px)"
            />
          </TabsContent>

          {currentWorkspaceId && (
            <TabsContent value="workspace" className="flex-1 overflow-hidden mt-4">
              <ActivityPanel
                logs={filterLogs(workspaceLogs)}
                isLoading={isWorkspaceLoading}
                emptyMessage="No workspace activity yet"
                maxHeight="calc(80vh - 220px)"
              />
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

interface ActivityButtonProps {
  className?: string
}

export function ActivityButton({ className }: ActivityButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className={className}
      >
        <History className="h-4 w-4 mr-2" />
        Activity
      </Button>
      <ActivityDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
