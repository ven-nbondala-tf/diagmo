import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import type { Diagram } from '@/types'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
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

interface DiagramCardProps {
  diagram: Diagram
  onClick: () => void
}

export function DiagramCard({ diagram, onClick }: DiagramCardProps) {
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
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow group relative"
        onClick={onClick}
      >
        <div className="absolute top-2 right-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-md bg-background/80 opacity-0 group-hover:opacity-100 hover:bg-accent transition-all"
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
        <CardHeader className="pb-2">
          <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-2 overflow-hidden">
            {diagram.thumbnail ? (
              <img
                src={diagram.thumbnail}
                alt={diagram.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <FileImage className="h-12 w-12 text-muted-foreground" />
            )}
          </div>
          <CardTitle className="text-lg truncate">{diagram.name}</CardTitle>
          <CardDescription className="truncate">
            {diagram.description || 'No description'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Updated {formatDistanceToNow(new Date(diagram.updatedAt), { addSuffix: true })}
          </p>
        </CardContent>
      </Card>

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
