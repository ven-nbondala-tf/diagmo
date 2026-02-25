import { useState, useCallback } from 'react'
import { useStore } from '@xyflow/react'
import { StickyNote, type StickyNoteData } from './StickyNote'
import { Button } from '@/components/ui'
import { StickyNote as StickyNoteIcon, X, Trash2 } from 'lucide-react'
import { nanoid } from 'nanoid'
import { cn } from '@/utils/cn'

interface AnnotationLayerProps {
  enabled: boolean
  onToggle: () => void
}

export function AnnotationLayer({ enabled, onToggle }: AnnotationLayerProps) {
  const [notes, setNotes] = useState<StickyNoteData[]>([])
  const [isAddingNote, setIsAddingNote] = useState(false)

  const transform = useStore((s) => s.transform)
  const [tx, ty, zoom] = transform

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (!isAddingNote) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left - tx) / zoom
    const y = (e.clientY - rect.top - ty) / zoom

    const newNote: StickyNoteData = {
      id: nanoid(),
      x,
      y,
      text: '',
      color: 'yellow',
      createdAt: new Date().toISOString(),
    }

    setNotes((prev) => [...prev, newNote])
    setIsAddingNote(false)
  }, [isAddingNote, tx, ty, zoom])

  const handleUpdateNote = useCallback((id: string, updates: Partial<StickyNoteData>) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, ...updates } : note))
    )
  }, [])

  const handleDeleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id))
  }, [])

  const handleClearAll = useCallback(() => {
    if (notes.length > 0 && confirm('Delete all sticky notes?')) {
      setNotes([])
    }
  }, [notes.length])

  if (!enabled) {
    // Hidden by default - can be toggled from View menu
    return null
  }

  return (
    <>
      {/* Annotation Toolbar */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 bg-supabase-bg-secondary/95 backdrop-blur-md border border-supabase-border rounded-lg shadow-lg p-2">
        <Button
          variant={isAddingNote ? 'default' : 'outline'}
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => setIsAddingNote(!isAddingNote)}
        >
          <StickyNoteIcon className="w-4 h-4" />
          {isAddingNote ? 'Click to place' : 'Add Note'}
        </Button>

        <div className="w-px h-6 bg-border" />

        <span className="text-xs text-muted-foreground px-1">
          {notes.length} note{notes.length !== 1 ? 's' : ''}
        </span>

        {notes.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            onClick={handleClearAll}
            title="Clear all notes"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onToggle}
          title="Exit annotation mode"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Click overlay for adding notes */}
      {isAddingNote && (
        <div
          className="absolute inset-0 z-10 cursor-crosshair"
          onClick={handleCanvasClick}
          style={{ background: 'rgba(0,0,0,0.02)' }}
        />
      )}

      {/* Sticky Notes Layer */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 15 }}
      >
        <div
          style={{
            transform: `translate(${tx}px, ${ty}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {notes.map((note) => (
            <div key={note.id} className="pointer-events-auto">
              <StickyNote
                note={note}
                onUpdate={handleUpdateNote}
                onDelete={handleDeleteNote}
                zoom={zoom}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Mode indicator */}
      <div className={cn(
        'absolute top-2 left-1/2 -translate-x-1/2 z-20',
        'bg-yellow-100 border border-yellow-300 text-yellow-800',
        'px-3 py-1.5 rounded-full text-sm font-medium shadow-md',
        'flex items-center gap-2'
      )}>
        <StickyNoteIcon className="w-4 h-4" />
        Annotation Mode
      </div>
    </>
  )
}
