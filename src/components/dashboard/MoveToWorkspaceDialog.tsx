import { useState } from 'react'
import { useWorkspaces, useMoveToWorkspace } from '@/hooks/useWorkspaces'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { Loader2, Users, User } from 'lucide-react'
import { toast } from 'sonner'

interface MoveToWorkspaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  diagramId: string
  diagramName: string
  currentWorkspaceId?: string | null
}

export function MoveToWorkspaceDialog({
  open,
  onOpenChange,
  diagramId,
  diagramName,
  currentWorkspaceId,
}: MoveToWorkspaceDialogProps) {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('personal')

  const { data: workspaces = [], isLoading } = useWorkspaces()
  const moveToWorkspace = useMoveToWorkspace()

  // Filter out workspaces where user doesn't have edit access
  const editableWorkspaces = workspaces.filter(
    (w) => w.role === 'owner' || w.role === 'admin' || w.role === 'editor'
  )

  const handleMove = async () => {
    const targetWorkspaceId = selectedWorkspaceId === 'personal' ? null : selectedWorkspaceId

    // Don't move if already in the same workspace
    if (targetWorkspaceId === currentWorkspaceId) {
      toast.info('Diagram is already in this workspace')
      return
    }

    const result = await moveToWorkspace.mutateAsync({
      diagramId,
      workspaceId: targetWorkspaceId,
    })

    if (result.success) {
      const targetName =
        selectedWorkspaceId === 'personal'
          ? 'Personal'
          : workspaces.find((w) => w.id === selectedWorkspaceId)?.name || 'workspace'
      toast.success(`Moved "${diagramName}" to ${targetName}`)
      onOpenChange(false)
    } else {
      toast.error(result.error || 'Failed to move diagram')
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // Set initial selection based on current workspace
      setSelectedWorkspaceId(currentWorkspaceId || 'personal')
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Move to Workspace</DialogTitle>
          <DialogDescription>
            Move &quot;{diagramName}&quot; to a different workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label htmlFor="workspace-select">Destination</Label>
          <Select
            value={selectedWorkspaceId}
            onValueChange={setSelectedWorkspaceId}
            disabled={isLoading}
          >
            <SelectTrigger id="workspace-select" className="mt-2">
              <SelectValue placeholder="Select a workspace" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="personal">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Personal</span>
                </div>
              </SelectItem>
              {editableWorkspaces.map((workspace) => (
                <SelectItem key={workspace.id} value={workspace.id}>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{workspace.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {editableWorkspaces.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground mt-3">
              You don&apos;t have any workspaces with edit access.
              Create a workspace first to move diagrams there.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={
              moveToWorkspace.isPending ||
              (selectedWorkspaceId === 'personal'
                ? currentWorkspaceId === null
                : selectedWorkspaceId === currentWorkspaceId)
            }
          >
            {moveToWorkspace.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
