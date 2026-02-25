import { useCallback } from 'react'
import { useReactFlow } from '@xyflow/react'
import { useEditorStore } from '@/stores/editorStore'
import { Button } from '@/components/ui'
import { Square, Diamond, Circle, Type, ArrowRight, StickyNote } from 'lucide-react'
import type { ShapeType } from '@/types'

const shapes: { type: ShapeType; icon: React.ElementType; label: string }[] = [
  { type: 'rectangle', icon: Square, label: 'Rectangle' },
  { type: 'diamond', icon: Diamond, label: 'Diamond' },
  { type: 'circle', icon: Circle, label: 'Circle' },
  { type: 'text', icon: Type, label: 'Text' },
  { type: 'arrow', icon: ArrowRight, label: 'Arrow' },
  { type: 'note', icon: StickyNote, label: 'Note' },
]

export function QuickShapeBar() {
  const addNode = useEditorStore((state) => state.addNode)
  const { screenToFlowPosition } = useReactFlow()

  const handleAddShape = useCallback((type: ShapeType) => {
    // Add shape at center of current viewport
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    const position = screenToFlowPosition({ x: centerX, y: centerY })
    addNode(type, position)
  }, [screenToFlowPosition, addNode])

  return (
    <div className="flex items-center gap-1">
      {shapes.map(({ type, icon: Icon, label }) => (
        <Button
          key={type}
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-supabase-text-muted hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary/50 rounded"
          onClick={() => handleAddShape(type)}
          title={label}
        >
          <Icon className="h-4 w-4" strokeWidth={1.5} />
        </Button>
      ))}
    </div>
  )
}
