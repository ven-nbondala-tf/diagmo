import React from 'react'
import { format } from 'date-fns'
import type { Diagram, DiagramStatus } from '@/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui'
import { MoreVertical, Copy, FolderInput, Trash2, Loader2, Home, Users, Star, ChevronDown } from 'lucide-react'
import { useDeleteDiagram, useDuplicateDiagram, useMoveDiagramToFolder, useFolders, useUpdateDiagramStatus } from '@/hooks'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { toast } from 'sonner'
import { cn } from '@/utils'
import type { SharedUser } from '@/services/diagramService'

const STATUS_CONFIG: Record<DiagramStatus, { label: string; color: string; bgColor: string }> = {
  draft: { label: 'Draft', color: 'text-blue-600', bgColor: 'bg-blue-500' },
  internal: { label: 'Internal', color: 'text-gray-600', bgColor: 'bg-gray-400' },
  pending_review: { label: 'Pending review', color: 'text-amber-600', bgColor: 'bg-amber-500' },
  approved: { label: 'Approved', color: 'text-green-600', bgColor: 'bg-green-500' },
}

interface DiagramListItemProps {
  diagram: Diagram
  onClick: () => void
  isShared?: boolean
  isTemplate?: boolean
  sharedUsers?: SharedUser[]
}

export function DiagramListItem({ diagram, onClick, isShared, sharedUsers = [] }: DiagramListItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const deleteDiagram = useDeleteDiagram()
  const duplicateDiagram = useDuplicateDiagram()
  const moveDiagram = useMoveDiagramToFolder()
  const updateStatus = useUpdateDiagramStatus()
  const { data: folders } = useFolders()
  const { isFavorite, toggleFavorite } = usePreferencesStore()

  const isFav = isFavorite(diagram.id)
  const currentStatus: DiagramStatus = diagram.status || 'draft'
  const statusConfig = STATUS_CONFIG[currentStatus]

  // Handle row click with explicit check
  const handleRowClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on dropdown or dialogs
    if ((e.target as HTMLElement).closest('[data-radix-collection-item]') ||
        (e.target as HTMLElement).closest('[role="menu"]') ||
        (e.target as HTMLElement).closest('[role="dialog"]') ||
        (e.target as HTMLElement).closest('button')) {
      return
    }
    onClick()
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite(diagram.id)
    toast.success(isFav ? 'Removed from favorites' : 'Added to favorites')
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    try {
      await deleteDiagram.mutateAsync(diagram.id)
      toast.success('Diagram deleted')
    } catch {
      toast.error('Failed to delete diagram')
    }
    setShowDeleteDialog(false)
  }

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await duplicateDiagram.mutateAsync(diagram.id)
      toast.success('Diagram duplicated')
    } catch {
      toast.error('Failed to duplicate diagram')
    }
  }

  const handleMoveToFolder = async (folderId: string | null) => {
    try {
      await moveDiagram.mutateAsync({ id: diagram.id, folderId })
      toast.success(folderId ? 'Moved to folder' : 'Moved to All Diagrams')
    } catch {
      toast.error('Failed to move diagram')
    }
  }

  const handleStatusChange = async (newStatus: DiagramStatus, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await updateStatus.mutateAsync({ id: diagram.id, status: newStatus })
      toast.success(`Status changed to ${STATUS_CONFIG[newStatus].label}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <>
      <div
        className="flex items-center gap-3 px-4 py-2 border-b border-supabase-border bg-supabase-bg-secondary text-supabase-text-secondary cursor-pointer hover:bg-supabase-bg-tertiary transition-colors group"
        onClick={handleRowClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`Open diagram: ${diagram.name}`}
      >
        {/* Orange icon */}
        <div className="w-6 h-6 rounded bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>

        {/* Title column */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="text-sm font-medium text-supabase-text-primary truncate group-hover:text-blue-500 transition-colors">
            {diagram.name}
          </span>
          {/* Favorite star */}
          <button
            onClick={handleToggleFavorite}
            className={cn(
              'p-0.5 rounded transition-colors',
              isFav
                ? 'text-yellow-500'
                : 'text-supabase-text-muted opacity-0 group-hover:opacity-100 hover:text-yellow-500'
            )}
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={cn('h-4 w-4', isFav && 'fill-current')} />
          </button>
        </div>

        {/* Users column */}
        <div className="w-36 flex-shrink-0 hidden lg:flex items-center gap-1">
          {sharedUsers.length > 0 ? (
            <TooltipProvider>
              <div className="flex items-center -space-x-2">
                {sharedUsers.slice(0, 3).map((user, index) => (
                  <Tooltip key={user.id}>
                    <TooltipTrigger asChild>
                      <div
                        className="w-6 h-6 rounded-full bg-supabase-bg-tertiary border-2 border-supabase-bg-secondary flex items-center justify-center text-xs font-medium text-supabase-text-primary"
                        style={{ zIndex: 3 - index }}
                      >
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          (user.fullName || user.email || '?').charAt(0).toUpperCase()
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{user.fullName || user.email || 'Unknown user'}</p>
                      <p className="text-xs text-muted-foreground">{user.permission === 'edit' ? 'Can edit' : 'Can view'}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
                {sharedUsers.length > 3 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-6 h-6 rounded-full bg-supabase-green text-white border-2 border-supabase-bg-secondary flex items-center justify-center text-xs font-medium">
                        +{sharedUsers.length - 3}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{sharedUsers.length - 3} more users</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </TooltipProvider>
          ) : isShared ? (
            <span className="text-xs text-supabase-text-muted truncate flex items-center gap-1">
              <Users className="w-3 h-3" />
              Shared
            </span>
          ) : (
            <span className="text-xs text-supabase-text-muted">-</span>
          )}
        </div>

        {/* Status column */}
        <div className="w-32 flex-shrink-0 hidden md:block">
          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-supabase-bg-tertiary transition-colors text-xs cursor-pointer"
            >
              <div className={cn('w-2 h-2 rounded-full', statusConfig.bgColor)} />
              <span className={cn('font-medium', statusConfig.color)}>{statusConfig.label}</span>
              <ChevronDown className="w-3 h-3 text-supabase-text-muted" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()} className="bg-supabase-bg-secondary border-supabase-border">
              {(Object.keys(STATUS_CONFIG) as DiagramStatus[]).map((key) => (
                <DropdownMenuItem
                  key={key}
                  onClick={(e) => handleStatusChange(key, e)}
                  disabled={updateStatus.isPending}
                  className={cn('hover:bg-supabase-bg-tertiary', currentStatus === key && 'bg-supabase-bg-tertiary')}
                >
                  <div className={cn('w-2 h-2 rounded-full mr-2', STATUS_CONFIG[key].bgColor)} />
                  <span className={STATUS_CONFIG[key].color}>{STATUS_CONFIG[key].label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Created column */}
        <div className="w-28 flex-shrink-0 hidden sm:block">
          <span className="text-xs text-supabase-text-muted">
            {format(new Date(diagram.createdAt), 'M/d/yyyy')}
          </span>
        </div>

        {/* Updated column */}
        <div className="w-44 flex-shrink-0 hidden xl:block">
          <span className="text-xs text-supabase-text-muted">
            {format(new Date(diagram.updatedAt), 'EEE MMM dd yyyy HH:mm')}
          </span>
        </div>

        {/* Menu */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-md hover:bg-supabase-bg-tertiary transition-colors text-supabase-text-muted"
            >
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={handleDuplicate} disabled={duplicateDiagram.isPending}>
                {duplicateDiagram.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                Duplicate
              </DropdownMenuItem>
              {!isShared && (
                <>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <FolderInput className="h-4 w-4 mr-2" />
                      Move to folder
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                        onClick={() => handleMoveToFolder(null)}
                        disabled={!diagram.folderId}
                      >
                        <Home className="h-4 w-4 mr-2" />
                        All Diagrams
                      </DropdownMenuItem>
                      {folders && folders.length > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          {folders.map((folder) => (
                            <DropdownMenuItem
                              key={folder.id}
                              onClick={() => handleMoveToFolder(folder.id)}
                              disabled={diagram.folderId === folder.id}
                            >
                              {folder.name}
                            </DropdownMenuItem>
                          ))}
                        </>
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete diagram?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{diagram.name}&quot;.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteDiagram.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// Table header component for list view
export function DiagramListHeader() {
  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-supabase-border bg-supabase-bg-tertiary text-xs font-medium text-supabase-text-muted sticky top-0">
      {/* Icon spacer */}
      <div className="w-6 flex-shrink-0" />

      {/* Title */}
      <div className="flex-1 min-w-0">Title</div>

      {/* Users */}
      <div className="w-36 flex-shrink-0 hidden lg:block">Users</div>

      {/* Status */}
      <div className="w-32 flex-shrink-0 hidden md:block">Status</div>

      {/* Created */}
      <div className="w-28 flex-shrink-0 hidden sm:block">Created</div>

      {/* Updated */}
      <div className="w-44 flex-shrink-0 hidden xl:block">Last Modified</div>

      {/* Menu spacer */}
      <div className="w-8 flex-shrink-0" />
    </div>
  )
}
