import { useEditorStore } from '@/stores/editorStore'
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  Separator,
} from '@/components/ui'
import {
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
  Group,
  Ungroup,
  Lock,
  Unlock,
  ChevronDown,
} from 'lucide-react'

export function EditorToolbar() {
  const selectedNodes = useEditorStore((state) => state.selectedNodes)
  const nodes = useEditorStore((state) => state.nodes)
  const alignNodes = useEditorStore((state) => state.alignNodes)
  const distributeNodes = useEditorStore((state) => state.distributeNodes)
  const groupNodes = useEditorStore((state) => state.groupNodes)
  const ungroupNodes = useEditorStore((state) => state.ungroupNodes)
  const lockNodes = useEditorStore((state) => state.lockNodes)
  const unlockNodes = useEditorStore((state) => state.unlockNodes)

  const hasSelection = selectedNodes.length > 0
  const hasMultipleSelection = selectedNodes.length >= 2
  const hasThreeOrMore = selectedNodes.length >= 3

  // Check if any selected nodes are locked
  const selectedNodeObjects = nodes.filter((n) => selectedNodes.includes(n.id))
  const allLocked = selectedNodeObjects.length > 0 && selectedNodeObjects.every((n) => n.data.locked)

  // Check if any selected nodes are grouped
  const hasGroupedNodes = selectedNodeObjects.some((n) => n.data.groupId)

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-background border rounded-md p-1 shadow-sm z-10">
      {/* Align dropdown */}
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                disabled={!hasMultipleSelection}
              >
                <AlignStartVertical className="h-4 w-4 mr-1" />
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Align Nodes</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => alignNodes('left')}>
            <AlignStartVertical className="h-4 w-4 mr-2" />
            Align Left
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => alignNodes('center')}>
            <AlignCenterVertical className="h-4 w-4 mr-2" />
            Align Center
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => alignNodes('right')}>
            <AlignEndVertical className="h-4 w-4 mr-2" />
            Align Right
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => alignNodes('top')}>
            <AlignStartHorizontal className="h-4 w-4 mr-2" />
            Align Top
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => alignNodes('middle')}>
            <AlignCenterHorizontal className="h-4 w-4 mr-2" />
            Align Middle
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => alignNodes('bottom')}>
            <AlignEndHorizontal className="h-4 w-4 mr-2" />
            Align Bottom
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Distribute dropdown */}
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                disabled={!hasThreeOrMore}
              >
                <AlignHorizontalDistributeCenter className="h-4 w-4 mr-1" />
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Distribute Nodes</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => distributeNodes('horizontal')}>
            <AlignHorizontalDistributeCenter className="h-4 w-4 mr-2" />
            Distribute Horizontally
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => distributeNodes('vertical')}>
            <AlignVerticalDistributeCenter className="h-4 w-4 mr-2" />
            Distribute Vertically
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Group/Ungroup */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={!hasMultipleSelection}
            onClick={groupNodes}
          >
            <Group className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Group Nodes (Ctrl+G)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={!hasGroupedNodes}
            onClick={ungroupNodes}
          >
            <Ungroup className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Ungroup Nodes (Ctrl+Shift+G)</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Lock/Unlock */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={allLocked ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            disabled={!hasSelection}
            onClick={allLocked ? unlockNodes : lockNodes}
          >
            {allLocked ? (
              <Lock className="h-4 w-4" />
            ) : (
              <Unlock className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {allLocked ? 'Unlock Nodes (Ctrl+L)' : 'Lock Nodes (Ctrl+L)'}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
