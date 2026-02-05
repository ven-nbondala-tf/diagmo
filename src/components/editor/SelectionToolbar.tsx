import { useMemo } from 'react'
import { useReactFlow, getNodesBounds } from '@xyflow/react'
import { useEditorStore } from '@/stores/editorStore'
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
} from 'lucide-react'
import { ColorPicker } from './properties/shared/ColorPicker'

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

  const { flowToScreenPosition } = useReactFlow()

  const selectedNodeObjects = useMemo(
    () => nodes.filter((n) => selectedNodes.includes(n.id)),
    [nodes, selectedNodes]
  )

  const allLocked = selectedNodeObjects.length > 0 && selectedNodeObjects.every((n) => n.data.locked)
  const hasGroupedNodes = selectedNodeObjects.some((n) => n.data.groupId)
  const hasMultiple = selectedNodes.length >= 2
  const hasThreeOrMore = selectedNodes.length >= 3

  if (selectedNodes.length === 0) return null

  const bounds = getNodesBounds(selectedNodeObjects)
  const screenPos = flowToScreenPosition({
    x: bounds.x + bounds.width / 2,
    y: bounds.y,
  })

  // Clamp to viewport
  const toolbarWidth = 340
  const left = Math.max(8, Math.min(screenPos.x - toolbarWidth / 2, window.innerWidth - toolbarWidth - 8))
  const top = Math.max(8, screenPos.y - 48)

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
      className="fixed flex items-center gap-1 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 shadow-lg ring-1 ring-black/5 rounded-xl p-1 z-50"
      style={{ left, top }}
    >
      {/* Color quick-change */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Fill Color">
            <div
              className="w-4 h-4 rounded border"
              style={{ backgroundColor: currentFill }}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="p-2 w-48">
          <ColorPicker value={currentFill} onChange={handleFillChange} />
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-6 mx-0.5" />

      {/* Align dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
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
            className="h-8 px-2"
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

      <Separator orientation="vertical" className="h-6 mx-0.5" />

      {/* Group/Ungroup */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
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
          className="h-8 w-8"
          onClick={ungroupNodes}
          title="Ungroup (Ctrl+Shift+G)"
        >
          <Ungroup className="h-4 w-4" />
        </Button>
      )}

      <Separator orientation="vertical" className="h-6 mx-0.5" />

      {/* Lock/Unlock */}
      <Button
        variant={allLocked ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={allLocked ? unlockNodes : lockNodes}
        title={allLocked ? 'Unlock (Ctrl+L)' : 'Lock (Ctrl+L)'}
      >
        {allLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
      </Button>

      {/* Duplicate */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={handleDuplicate}
        title="Duplicate (Ctrl+D)"
      >
        <Copy className="h-4 w-4" />
      </Button>

      {/* Delete */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive"
        onClick={deleteSelected}
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
