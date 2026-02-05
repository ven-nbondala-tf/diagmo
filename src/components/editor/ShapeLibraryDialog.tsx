import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Label,
  ScrollArea,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Switch,
} from '@/components/ui'
import {
  Plus,
  Trash2,
  Edit2,
  FolderOpen,
  Globe,
  Lock,
  Upload,
  MoreVertical,
  Check,
  X,
} from 'lucide-react'
import {
  useShapeLibraries,
  usePublicShapeLibraries,
  useCreateShapeLibrary,
  useUpdateShapeLibrary,
  useDeleteShapeLibrary,
  useShapesByLibrary,
  useDeleteShape,
  useUploadShape,
} from '@/hooks'
import type { ShapeLibrary, CustomShape } from '@/types'

interface ShapeLibraryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShapeLibraryDialog({ open, onOpenChange }: ShapeLibraryDialogProps) {
  const [activeTab, setActiveTab] = useState<'my' | 'public'>('my')
  const [selectedLibrary, setSelectedLibrary] = useState<ShapeLibrary | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [editingLibrary, setEditingLibrary] = useState<ShapeLibrary | null>(null)
  const [newLibraryName, setNewLibraryName] = useState('')
  const [newLibraryDescription, setNewLibraryDescription] = useState('')
  const [newLibraryPublic, setNewLibraryPublic] = useState(false)

  const { data: myLibraries = [], isLoading: loadingMy } = useShapeLibraries()
  const { data: publicLibraries = [], isLoading: loadingPublic } = usePublicShapeLibraries()
  const createLibrary = useCreateShapeLibrary()
  const updateLibrary = useUpdateShapeLibrary()
  const deleteLibrary = useDeleteShapeLibrary()

  const handleCreateLibrary = useCallback(async () => {
    if (!newLibraryName.trim()) return

    try {
      await createLibrary.mutateAsync({
        name: newLibraryName.trim(),
        description: newLibraryDescription.trim() || undefined,
        isPublic: newLibraryPublic,
      })
      setNewLibraryName('')
      setNewLibraryDescription('')
      setNewLibraryPublic(false)
      setIsCreating(false)
    } catch (error) {
      console.error('Failed to create library:', error)
    }
  }, [newLibraryName, newLibraryDescription, newLibraryPublic, createLibrary])

  const handleUpdateLibrary = useCallback(async () => {
    if (!editingLibrary || !newLibraryName.trim()) return

    try {
      await updateLibrary.mutateAsync({
        id: editingLibrary.id,
        name: newLibraryName.trim(),
        description: newLibraryDescription.trim() || undefined,
        isPublic: newLibraryPublic,
      })
      setEditingLibrary(null)
      setNewLibraryName('')
      setNewLibraryDescription('')
      setNewLibraryPublic(false)
    } catch (error) {
      console.error('Failed to update library:', error)
    }
  }, [editingLibrary, newLibraryName, newLibraryDescription, newLibraryPublic, updateLibrary])

  const handleDeleteLibrary = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this library and all its shapes?')) return

    try {
      await deleteLibrary.mutateAsync(id)
      if (selectedLibrary?.id === id) {
        setSelectedLibrary(null)
      }
    } catch (error) {
      console.error('Failed to delete library:', error)
    }
  }, [deleteLibrary, selectedLibrary])

  const startEditing = useCallback((library: ShapeLibrary) => {
    setEditingLibrary(library)
    setNewLibraryName(library.name)
    setNewLibraryDescription(library.description || '')
    setNewLibraryPublic(library.isPublic)
    setIsCreating(false)
  }, [])

  const cancelEditing = useCallback(() => {
    setEditingLibrary(null)
    setIsCreating(false)
    setNewLibraryName('')
    setNewLibraryDescription('')
    setNewLibraryPublic(false)
  }, [])

  const renderLibraryList = (libraries: ShapeLibrary[], isOwner: boolean) => {
    if (libraries.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground text-sm">
          {isOwner ? 'No libraries yet. Create one to get started!' : 'No public libraries available.'}
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {libraries.map((library) => (
          <div
            key={library.id}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedLibrary?.id === library.id
                ? 'border-primary bg-primary/5'
                : 'hover:bg-accent/50'
            }`}
            onClick={() => setSelectedLibrary(library)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium truncate">{library.name}</span>
                  {library.isPublic ? (
                    <Globe className="w-3 h-3 text-green-500" title="Public" />
                  ) : (
                    <Lock className="w-3 h-3 text-muted-foreground" title="Private" />
                  )}
                </div>
                {library.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {library.description}
                  </p>
                )}
              </div>
              {isOwner && (
                <div className="flex items-center gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      startEditing(library)
                    }}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteLibrary(library.id)
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Shape Libraries</DialogTitle>
          <DialogDescription>
            Manage your custom shape libraries or browse public ones.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Left panel - Library list */}
          <div className="w-72 flex flex-col border-r pr-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'my' | 'public')}>
              <TabsList className="w-full grid grid-cols-2 mb-3">
                <TabsTrigger value="my">My Libraries</TabsTrigger>
                <TabsTrigger value="public">Public</TabsTrigger>
              </TabsList>

              <TabsContent value="my" className="mt-0 flex-1 flex flex-col">
                {/* Create/Edit form */}
                {(isCreating || editingLibrary) && (
                  <div className="p-3 border rounded-lg bg-muted/30 mb-3 space-y-2">
                    <Input
                      placeholder="Library name"
                      value={newLibraryName}
                      onChange={(e) => setNewLibraryName(e.target.value)}
                      className="h-8"
                    />
                    <Input
                      placeholder="Description (optional)"
                      value={newLibraryDescription}
                      onChange={(e) => setNewLibraryDescription(e.target.value)}
                      className="h-8"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={newLibraryPublic}
                          onCheckedChange={setNewLibraryPublic}
                        />
                        <Label className="text-xs">Make public</Label>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7"
                          onClick={cancelEditing}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          className="h-7"
                          onClick={editingLibrary ? handleUpdateLibrary : handleCreateLibrary}
                          disabled={!newLibraryName.trim()}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Create button */}
                {!isCreating && !editingLibrary && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mb-3"
                    onClick={() => setIsCreating(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Library
                  </Button>
                )}

                <ScrollArea className="flex-1">
                  {loadingMy ? (
                    <div className="text-center py-4 text-muted-foreground text-sm">Loading...</div>
                  ) : (
                    renderLibraryList(myLibraries, true)
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="public" className="mt-0 flex-1">
                <ScrollArea className="h-full">
                  {loadingPublic ? (
                    <div className="text-center py-4 text-muted-foreground text-sm">Loading...</div>
                  ) : (
                    renderLibraryList(publicLibraries, false)
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right panel - Shape grid */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedLibrary ? (
              <LibraryShapesPanel library={selectedLibrary} isOwner={activeTab === 'my'} />
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                Select a library to view its shapes
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Separate component for shape display
interface LibraryShapesPanelProps {
  library: ShapeLibrary
  isOwner: boolean
}

function LibraryShapesPanel({ library, isOwner }: LibraryShapesPanelProps) {
  const { data: shapes = [], isLoading } = useShapesByLibrary(library.id)
  const deleteShape = useDeleteShape()
  const uploadShape = useUploadShape()
  const [isDragging, setIsDragging] = useState(false)

  const handleFileUpload = useCallback(async (files: FileList) => {
    for (const file of Array.from(files)) {
      const name = file.name.replace(/\.[^.]+$/, '') // Remove extension
      try {
        await uploadShape.mutateAsync({ libraryId: library.id, file, name })
      } catch (error) {
        console.error('Failed to upload shape:', error)
        alert(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }, [library.id, uploadShape])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files)
    }
  }, [handleFileUpload])

  const handleDeleteShape = useCallback(async (shape: CustomShape) => {
    if (!confirm(`Delete "${shape.name}"?`)) return
    try {
      await deleteShape.mutateAsync({ id: shape.id, libraryId: library.id })
    } catch (error) {
      console.error('Failed to delete shape:', error)
    }
  }, [deleteShape, library.id])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        Loading shapes...
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">{library.name}</h3>
        {isOwner && (
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".svg,image/svg+xml,image/png,image/jpeg"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            />
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Upload Shape
              </span>
            </Button>
          </label>
        )}
      </div>

      {/* Drop zone */}
      {isOwner && (
        <div
          className={`border-2 border-dashed rounded-lg p-4 mb-3 text-center transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <p className="text-sm text-muted-foreground">
            {isDragging ? 'Drop files here' : 'Drag & drop SVG or PNG files here'}
          </p>
        </div>
      )}

      {/* Shape grid */}
      <ScrollArea className="flex-1">
        {shapes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {isOwner
              ? 'No shapes yet. Upload SVG or PNG files to get started!'
              : 'This library has no shapes.'}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {shapes.map((shape) => (
              <div
                key={shape.id}
                className="group relative aspect-square border rounded-lg p-2 hover:bg-accent/50 transition-colors"
              >
                {/* SVG Preview */}
                <div
                  className="w-full h-full flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: shape.svgContent }}
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />

                {/* Shape name */}
                <div className="absolute bottom-0 left-0 right-0 bg-background/90 text-xs text-center py-1 truncate px-1">
                  {shape.name}
                </div>

                {/* Delete button */}
                {isOwner && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteShape(shape)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
