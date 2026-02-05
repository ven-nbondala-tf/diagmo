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
} from '@/components/ui'
import { FileImage, MoreVertical, Copy, FolderInput, Trash2, Loader2, Home } from 'lucide-react'
import { useDeleteDiagram, useDuplicateDiagram, useMoveDiagramToFolder, useFolders } from '@/hooks'
import { toast } from 'sonner'

interface DiagramListItemProps {
  diagram: Diagram
  onClick: () => void
}

export function DiagramListItem({ diagram, onClick }: DiagramListItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const deleteDiagram = useDeleteDiagram()
  const duplicateDiagram = useDuplicateDiagram()
  const moveDiagram = useMoveDiagramToFolder()
  const { data: folders } = useFolders()

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
        className="flex items-center gap-4 px-4 py-3 rounded-lg border bg-card cursor-pointer hover:bg-accent/50 transition-colors group"
        onClick={onClick}
      >
        <div className="w-16 h-10 rounded border bg-muted flex-shrink-0 flex items-center justify-center overflow-hidden">
          {diagram.thumbnail ? (
            <img
              src={diagram.thumbnail}
              alt={diagram.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <FileImage className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{diagram.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {diagram.description || 'No description'}
          </p>
        </div>

        <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
          {formatDistanceToNow(new Date(diagram.updatedAt), { addSuffix: true })}
        </span>

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
