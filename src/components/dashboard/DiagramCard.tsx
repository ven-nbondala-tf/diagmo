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
} from '@/components/ui'
import { FileImage, Trash2, Loader2 } from 'lucide-react'
import { useDeleteDiagram } from '@/hooks'
import { toast } from 'sonner'

interface DiagramCardProps {
  diagram: Diagram
  onClick: () => void
}

export function DiagramCard({ diagram, onClick }: DiagramCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const deleteDiagram = useDeleteDiagram()

  const handleDelete = async (e: React.MouseEvent) => {
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

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow group relative"
        onClick={onClick}
      >
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 z-10 p-1.5 rounded-md bg-background/80 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all"
        >
          <Trash2 className="h-4 w-4" />
        </button>
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
