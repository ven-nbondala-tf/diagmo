import { useMemo } from 'react'
import { useEditorStore } from '@/stores/editorStore'
import type { ShapeType } from '@/types'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  Separator,
} from '@/components/ui'
import {
  Trash2,
  Copy,
  Lock,
  Unlock,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
  ChevronDown,
  Group,
  Ungroup,
  Shapes,
} from 'lucide-react'
import { ColorPicker } from './properties/shared/ColorPicker'

// Quick morph shape options
const MORPH_SHAPES: { type: ShapeType; label: string }[] = [
  { type: 'rectangle', label: 'Rectangle' },
  { type: 'rounded-rectangle', label: 'Rounded Rect' },
  { type: 'circle', label: 'Circle' },
  { type: 'diamond', label: 'Diamond' },
  { type: 'process', label: 'Process' },
  { type: 'decision', label: 'Decision' },
  { type: 'database', label: 'Database' },
  { type: 'cloud', label: 'Cloud' },
]

export function SelectionToolbar() {
  const nodes = useEditorStore((state) => state.nodes)
  const selectedNodes = useEditorStore((state) => state.selectedNodes)
  const deleteSelected = useEditorStore((state) => state.deleteSelected)
  const copyNodes = useEditorStore((state) => state.copyNodes)
  const pasteNodes = useEditorStore((state) => state.pasteNodes)
  const lockNodes = useEditorStore((state) => state.lockNodes)
  const unlockNodes = useEditorStore((state) => state.unlockNodes)
  const alignNodes = useEditorStore((state) => state.alignNodes)
  const distributeNodes = useEditorStore((state) => state.distributeNodes)
  const groupNodes = useEditorStore((state) => state.groupNodes)
  const ungroupNodes = useEditorStore((state) => state.ungroupNodes)
  const updateNodeStyle = useEditorStore((state) => state.updateNodeStyle)
  const morphSelectedShapes = useEditorStore((state) => state.morphSelectedShapes)

  const selectedNodeObjects = useMemo(
    () => nodes.filter((n) => selectedNodes.includes(n.id)),
    [nodes, selectedNodes]
  )

  const allLocked = selectedNodeObjects.length > 0 && selectedNodeObjects.every((n) => n.data.locked)
  const hasGroupedNodes = selectedNodeObjects.some((n) => n.data.groupId)
  const hasMultiple = selectedNodes.length >= 2
  const hasThreeOrMore = selectedNodes.length >= 3

  // Check if selected nodes can be morphed (not junction, custom-shape, or web-image)
  const canMorph = selectedNodeObjects.some((n) =>
    n.data.type !== 'junction' &&
    n.data.type !== 'custom-shape' &&
    n.data.type !== 'web-image'
  )

  if (selectedNodes.length === 0) return null

  const handleDuplicate = () => {
    copyNodes()
    pasteNodes()
  }

  const currentFill = selectedNodeObjects[0]?.data.style?.backgroundColor || '#ffffff'

  const handleFillChange = (color: string) => {
    selectedNodes.forEach((id) => updateNodeStyle(id, { backgroundColor: color }))
  }

  return (
    <div
      className="fixed top-[138px] left-1/2 -translate-x-1/2 flex items-center gap-1 backdrop-blur-md bg-supabase-bg-secondary/95 shadow-lg ring-1 ring-supabase-border rounded-xl p-1 z-50"
    >
      {/* Color quick-change */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary" title="Fill Color">
            <div
              className="w-4 h-4 rounded border border-supabase-border"
              style={{ backgroundColor: currentFill }}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="p-2 w-48">
          <ColorPicker value={currentFill} onChange={handleFillChange} />
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Change Shape dropdown */}
      {canMorph && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary"
              title="Change Shape"
            >
              <Shapes className="h-4 w-4 mr-1" />
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {MORPH_SHAPES.map((shape) => (
              <DropdownMenuItem
                key={shape.type}
                onClick={() => morphSelectedShapes(shape.type)}
              >
                {shape.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Separator orientation="vertical" className="h-6 mx-0.5 bg-supabase-border" />

      {/* Align dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary disabled:opacity-50"
            disabled={!hasMultiple}
            title="Align"
          >
            <AlignStartVertical className="h-4 w-4 mr-1" />
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => alignNodes('left')}>
            <AlignStartVertical className="h-4 w-4 mr-2" />Align Left
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => alignNodes('center')}>
            <AlignCenterVertical className="h-4 w-4 mr-2" />Align Center
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => alignNodes('right')}>
            <AlignEndVertical className="h-4 w-4 mr-2" />Align Right
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => alignNodes('top')}>
            <AlignStartHorizontal className="h-4 w-4 mr-2" />Align Top
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => alignNodes('middle')}>
            <AlignCenterHorizontal className="h-4 w-4 mr-2" />Align Middle
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => alignNodes('bottom')}>
            <AlignEndHorizontal className="h-4 w-4 mr-2" />Align Bottom
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Distribute dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary disabled:opacity-50"
            disabled={!hasThreeOrMore}
            title="Distribute"
          >
            <AlignHorizontalDistributeCenter className="h-4 w-4 mr-1" />
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => distributeNodes('horizontal')}>
            <AlignHorizontalDistributeCenter className="h-4 w-4 mr-2" />Distribute Horizontally
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => distributeNodes('vertical')}>
            <AlignVerticalDistributeCenter className="h-4 w-4 mr-2" />Distribute Vertically
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-6 mx-0.5 bg-supabase-border" />

      {/* Group/Ungroup */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary disabled:opacity-50"
        disabled={!hasMultiple}
        onClick={groupNodes}
        title="Group (Ctrl+G)"
      >
        <Group className="h-4 w-4" />
      </Button>

      {hasGroupedNodes && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary"
          onClick={ungroupNodes}
          title="Ungroup (Ctrl+Shift+G)"
        >
          <Ungroup className="h-4 w-4" />
        </Button>
      )}

      <Separator orientation="vertical" className="h-6 mx-0.5 bg-supabase-border" />

      {/* Lock/Unlock */}
      <Button
        variant={allLocked ? 'secondary' : 'ghost'}
        size="icon"
        className={`h-8 w-8 ${allLocked ? 'bg-supabase-green-muted text-supabase-green' : 'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary'}`}
        onClick={allLocked ? unlockNodes : lockNodes}
        title={allLocked ? 'Unlock (Ctrl+L)' : 'Lock (Ctrl+L)'}
      >
        {allLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
      </Button>

      {/* Duplicate */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary"
        onClick={handleDuplicate}
        title="Duplicate (Ctrl+D)"
      >
        <Copy className="h-4 w-4" />
      </Button>

      {/* Delete */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
        onClick={deleteSelected}
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
