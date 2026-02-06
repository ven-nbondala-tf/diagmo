import { useState } from 'react'
import { ChevronDown, Plus, Users, User, Settings, Check, Mail } from 'lucide-react'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Badge,
} from '@/components/ui'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useWorkspaces, usePendingInvites } from '@/hooks/useWorkspaces'
import { CreateWorkspaceDialog } from './CreateWorkspaceDialog'
import { WorkspaceSettingsDialog } from './WorkspaceSettingsDialog'
import { cn } from '@/utils'
import type { Workspace, WorkspaceRole } from '@/types'

const roleColors: Record<WorkspaceRole, string> = {
  owner: 'bg-amber-500/10 text-amber-500',
  admin: 'bg-purple-500/10 text-purple-500',
  editor: 'bg-blue-500/10 text-blue-500',
  viewer: 'bg-gray-500/10 text-gray-500',
}

interface WorkspaceSwitcherProps {
  className?: string
}

export function WorkspaceSwitcher({ className }: WorkspaceSwitcherProps) {
  const [open, setOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const { currentWorkspaceId, setCurrentWorkspace, setWorkspaceSettingsOpen } = useWorkspaceStore()
  const { data: workspaces = [], isLoading } = useWorkspaces()
  const { data: pendingInvites = [] } = usePendingInvites()

  const currentWorkspace = workspaces.find(w => w.id === currentWorkspaceId)
  const pendingCount = pendingInvites.length

  const handleSelectWorkspace = (workspace: Workspace | null) => {
    setCurrentWorkspace(workspace?.id ?? null)
    setOpen(false)
  }

  const handleOpenSettings = (workspaceId: string) => {
    setWorkspaceSettingsOpen(true, workspaceId)
    setOpen(false)
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'flex items-center gap-2 min-w-[160px] justify-between',
              className
            )}
          >
            <div className="flex items-center gap-2 truncate">
              {currentWorkspace ? (
                <>
                  <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{currentWorkspace.name}</span>
                </>
              ) : (
                <>
                  <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">Personal</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1">
              {pendingCount > 0 && (
                <Badge variant="destructive" className="h-5 w-5 p-0 text-xs justify-center">
                  {pendingCount}
                </Badge>
              )}
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Personal space */}
          <DropdownMenuItem
            onClick={() => handleSelectWorkspace(null)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Personal</span>
            </div>
            {!currentWorkspaceId && <Check className="h-4 w-4" />}
          </DropdownMenuItem>

          {/* Workspaces */}
          {isLoading ? (
            <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
          ) : workspaces.length > 0 ? (
            <>
              <DropdownMenuSeparator />
              {workspaces.map((workspace) => (
                <DropdownMenuItem
                  key={workspace.id}
                  className="flex items-center justify-between p-0"
                >
                  <button
                    className="flex items-center gap-2 flex-1 px-2 py-1.5"
                    onClick={() => handleSelectWorkspace(workspace)}
                  >
                    <Users className="h-4 w-4" />
                    <span className="truncate flex-1 text-left">{workspace.name}</span>
                    {workspace.role && (
                      <Badge
                        variant="secondary"
                        className={cn('text-[10px] px-1.5 py-0', roleColors[workspace.role])}
                      >
                        {workspace.role}
                      </Badge>
                    )}
                    {currentWorkspaceId === workspace.id && (
                      <Check className="h-4 w-4 shrink-0" />
                    )}
                  </button>
                  {(workspace.role === 'owner' || workspace.role === 'admin') && (
                    <button
                      className="p-1.5 hover:bg-accent rounded-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenSettings(workspace.id)
                      }}
                    >
                      <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  )}
                </DropdownMenuItem>
              ))}
            </>
          ) : null}

          {/* Pending invites */}
          {pendingCount > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Pending Invites ({pendingCount})
              </DropdownMenuLabel>
              {pendingInvites.map(({ workspace, invite }) => (
                <DropdownMenuItem
                  key={invite.id}
                  className="flex items-center justify-between"
                  onClick={() => setWorkspaceSettingsOpen(true, workspace.id)}
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="truncate">{workspace.name}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {invite.role}
                  </Badge>
                </DropdownMenuItem>
              ))}
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateWorkspaceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      <WorkspaceSettingsDialog />
    </>
  )
}
