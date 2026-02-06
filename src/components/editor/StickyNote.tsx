import { useState, useCallback, useRef, useEffect } from 'react'
import { Button } from '@/components/ui'
import { X, GripVertical } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface StickyNoteData {
  id: string
  x: number
  y: number
  text: string
  color: 'yellow' | 'pink' | 'blue' | 'green' | 'orange'
  author?: string
  createdAt: string
}

interface StickyNoteProps {
  note: StickyNoteData
  onUpdate: (id: string, updates: Partial<StickyNoteData>) => void
  onDelete: (id: string) => void
  zoom: number
}

const NOTE_COLORS = {
  yellow: 'bg-yellow-100 border-yellow-300',
  pink: 'bg-pink-100 border-pink-300',
  blue: 'bg-blue-100 border-blue-300',
  green: 'bg-green-100 border-green-300',
  orange: 'bg-orange-100 border-orange-300',
}

export function StickyNote({ note, onUpdate, onDelete, zoom }: StickyNoteProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(note.text)
  const [isDragging, setIsDragging] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [isEditing])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('textarea, button')) return

    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)

    const startX = e.clientX
    const startY = e.clientY
    const startNoteX = note.x
    const startNoteY = note.y

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = (moveEvent.clientX - startX) / zoom
      const dy = (moveEvent.clientY - startY) / zoom
      onUpdate(note.id, {
        x: startNoteX + dx,
        y: startNoteY + dy,
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [note.id, note.x, note.y, zoom, onUpdate])

  const handleBlur = useCallback(() => {
    setIsEditing(false)
    if (text !== note.text) {
      onUpdate(note.id, { text })
    }
  }, [note.id, note.text, text, onUpdate])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setText(note.text)
      setIsEditing(false)
    }
  }, [note.text])

  return (
    <div
      className={cn(
        'absolute w-48 rounded-lg border-2 shadow-lg',
        NOTE_COLORS[note.color],
        isDragging ? 'cursor-grabbing opacity-80' : 'cursor-grab'
      )}
      style={{
        left: note.x,
        top: note.y,
        transform: `scale(${1 / zoom})`,
        transformOrigin: 'top left',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-current/10">
        <GripVertical className="w-3 h-3 opacity-50" />
        <span className="text-[10px] text-muted-foreground">
          {new Date(note.createdAt).toLocaleDateString()}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0 hover:bg-destructive/20 hover:text-destructive"
          onClick={() => onDelete(note.id)}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-2 min-h-[60px]">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full h-20 bg-transparent text-sm resize-none outline-none"
            placeholder="Add a note..."
          />
        ) : (
          <p
            className="text-sm whitespace-pre-wrap cursor-text min-h-[20px]"
            onDoubleClick={() => setIsEditing(true)}
          >
            {note.text || <span className="text-muted-foreground italic">Double-click to edit</span>}
          </p>
        )}
      </div>

      {/* Color picker */}
      <div className="flex justify-center gap-1 px-2 pb-2">
        {(Object.keys(NOTE_COLORS) as Array<keyof typeof NOTE_COLORS>).map((color) => (
          <button
            key={color}
            className={cn(
              'w-4 h-4 rounded-full border-2 transition-transform',
              NOTE_COLORS[color],
              note.color === color ? 'scale-125 border-gray-500' : 'border-transparent hover:scale-110'
            )}
            onClick={() => onUpdate(note.id, { color })}
          />
        ))}
      </div>
    </div>
  )
}
