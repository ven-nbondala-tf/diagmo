import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { History } from 'lucide-react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui'
import { ActivityPanel } from '@/components/dashboard/ActivityPanel'
import { useDiagramAuditLogs } from '@/hooks/useAuditLogs'

export function DiagramActivityButton() {
  const [open, setOpen] = useState(false)
  const { id: diagramId } = useParams<{ id: string }>()
  const { data: logs = [], isLoading } = useDiagramAuditLogs(diagramId, 50)

  if (!diagramId) return null

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            className="h-8 w-8"
          >
            <History className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Diagram Activity</TooltipContent>
      </Tooltip>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[70vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Diagram Activity
            </DialogTitle>
          </DialogHeader>

          <ActivityPanel
            logs={logs}
            isLoading={isLoading}
            emptyMessage="No activity recorded for this diagram yet"
            maxHeight="calc(70vh - 120px)"
            className="mt-4"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
