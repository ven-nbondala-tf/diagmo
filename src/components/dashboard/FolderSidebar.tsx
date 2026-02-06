import { useState } from 'react'
import { useFolders, useCreateFolder, useDeleteFolder, useSharedDiagrams } from '@/hooks'
import { Button, Input, ScrollArea, Separator } from '@/components/ui'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Folder, FolderPlus, Trash2, Home, Loader2, Users } from 'lucide-react'
import { cn } from '@/utils'
import { toast } from 'sonner'
import type { Folder as FolderType } from '@/types'

interface FolderSidebarProps {
  selectedFolderId: string | null
  onSelectFolder: (folderId: string | null) => void
  showShared?: boolean
  onToggleShared?: (show: boolean) => void
}

export function FolderSidebar({
  selectedFolderId,
  onSelectFolder,
  showShared = false,
  onToggleShared,
}: FolderSidebarProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [folderToDelete, setFolderToDelete] = useState<FolderType | null>(null)

  const { data: folders, isLoading } = useFolders()
  const { data: sharedDiagrams } = useSharedDiagrams()
  const createFolder = useCreateFolder()
  const deleteFolder = useDeleteFolder()

  const sharedCount = sharedDiagrams?.length || 0

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return

    try {
      await createFolder.mutateAsync({ name: newFolderName.trim() })
      setNewFolderName('')
      setIsCreating(false)
      toast.success('Folder created')
    } catch (error) {
      toast.error('Failed to create folder')
    }
  }

  const handleDeleteFolder = async () => {
    if (!folderToDelete) return

    try {
      await deleteFolder.mutateAsync(folderToDelete.id)
      if (selectedFolderId === folderToDelete.id) {
        onSelectFolder(null)
      }
      setFolderToDelete(null)
      toast.success('Folder deleted')
    } catch (error) {
      toast.error('Failed to delete folder')
    }
  }

  return (
    <div className="w-64 border-r bg-background flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Folders</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCreating(true)}
          >
            <FolderPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isCreating && (
        <div className="p-4 border-b space-y-2">
          <Input
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFolder()
              if (e.key === 'Escape') {
                setIsCreating(false)
                setNewFolderName('')
              }
            }}
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleCreateFolder}
              disabled={createFolder.isPending}
            >
              {createFolder.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
              Create
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsCreating(false)
                setNewFolderName('')
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-2">
          <button
            onClick={() => {
              onSelectFolder(null)
              onToggleShared?.(false)
            }}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors',
              selectedFolderId === null && !showShared && 'bg-accent'
            )}
          >
            <Home className="h-4 w-4" />
            All Diagrams
          </button>

          {/* Shared with me section */}
          <button
            onClick={() => {
              onSelectFolder(null)
              onToggleShared?.(true)
            }}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors',
              showShared && 'bg-accent'
            )}
          >
            <Users className="h-4 w-4" />
            <span className="flex-1 text-left">Shared with me</span>
            {sharedCount > 0 && (
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
                {sharedCount}
              </span>
            )}
          </button>

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : folders && folders.length > 0 ? (
            <>
              <Separator className="my-2" />
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className={cn(
                    'group flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors cursor-pointer',
                    selectedFolderId === folder.id && 'bg-accent'
                  )}
                  onClick={() => onSelectFolder(folder.id)}
                >
                  <Folder className="h-4 w-4" />
                  <span className="flex-1 truncate">{folder.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setFolderToDelete(folder)
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </>
          ) : null}
        </div>
      </ScrollArea>

      <AlertDialog open={!!folderToDelete} onOpenChange={() => setFolderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete folder?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the folder &quot;{folderToDelete?.name}&quot;.
              Diagrams in this folder will be moved to &quot;All Diagrams&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFolder}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteFolder.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
