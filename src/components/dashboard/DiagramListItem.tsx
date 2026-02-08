import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import type { Diagram } from '@/types'
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
  Badge,
} from '@/components/ui'
import { Layers, MoreVertical, Copy, FolderInput, Trash2, Loader2, Home, Users } from 'lucide-react'
import { useDeleteDiagram, useDuplicateDiagram, useMoveDiagramToFolder, useFolders } from '@/hooks'
import { toast } from 'sonner'

interface DiagramListItemProps {
  diagram: Diagram
  onClick: () => void
  isShared?: boolean
  isTemplate?: boolean
}

export function DiagramListItem({ diagram, onClick, isShared, isTemplate }: DiagramListItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const deleteDiagram = useDeleteDiagram()
  const duplicateDiagram = useDuplicateDiagram()
  const moveDiagram = useMoveDiagramToFolder()
  const { data: folders } = useFolders()

  // Handle card click with explicit check
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on dropdown or dialogs
    if ((e.target as HTMLElement).closest('[data-radix-collection-item]') ||
        (e.target as HTMLElement).closest('[role="menu"]') ||
        (e.target as HTMLElement).closest('[role="dialog"]')) {
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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    try {
      await deleteDiagram.mutateAsync(diagram.id)
      toast.success('Diagram deleted')
    } catch (error) {
      toast.error('Failed to delete diagram')
    }
    setShowDeleteDialog(false)
  }

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await duplicateDiagram.mutateAsync(diagram.id)
      toast.success('Diagram duplicated')
    } catch (error) {
      toast.error('Failed to duplicate diagram')
    }
  }

  const handleMoveToFolder = async (folderId: string | null) => {
    try {
      await moveDiagram.mutateAsync({ id: diagram.id, folderId })
      toast.success(folderId ? 'Moved to folder' : 'Moved to All Diagrams')
    } catch (error) {
      toast.error('Failed to move diagram')
    }
  }

  return (
    <>
      <div
        className="flex items-center gap-4 px-4 py-3 rounded-xl border bg-card cursor-pointer hover:bg-accent/50 hover:border-primary/20 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`Open diagram: ${diagram.name}`}
      >
        {/* Thumbnail */}
        <div className="w-20 h-12 rounded-lg border bg-muted flex-shrink-0 flex items-center justify-center overflow-hidden">
          {diagram.thumbnail ? (
            <img
              src={diagram.thumbnail}
              alt={diagram.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full relative bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
              <Layers className="h-5 w-5 text-muted-foreground/40" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
              {diagram.name}
            </p>
            {isShared && (
              <Badge variant="secondary" className="text-[10px] gap-0.5 px-1.5 py-0">
                <Users className="h-2.5 w-2.5" />
                Shared
              </Badge>
            )}
            {isTemplate && (
              <Badge variant="default" className="text-[10px] px-1.5 py-0">
                Template
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {diagram.description || 'No description'}
          </p>
        </div>

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground/70 whitespace-nowrap hidden sm:block">
          {formatDistanceToNow(new Date(diagram.updatedAt), { addSuffix: true })}
        </span>

        {/* Menu */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-md hover:bg-accent transition-colors"
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
