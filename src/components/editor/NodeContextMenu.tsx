import { useCallback, useState } from 'react'
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuShortcut,
} from '@/components/ui/context-menu'
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu'
import { useEditorStore } from '@/stores/editorStore'
import {
  Copy,
  Clipboard,
  Trash2,
  CopyPlus,
  Lock,
  Unlock,
  ChevronsUp,
  ChevronUp,
  ChevronDown,
  ChevronsDown,
  Group,
  Ungroup,
  Layers,
  FlipHorizontal,
  FlipVertical,
  RotateCcw,
} from 'lucide-react'

interface NodeContextMenuProps {
  children: React.ReactNode
  nodeId: string
  isLocked?: boolean
  isGrouped?: boolean
}

export function NodeContextMenu({ children, nodeId, isLocked, isGrouped }: NodeContextMenuProps) {
  const copyNodes = useEditorStore((state) => state.copyNodes)
  const pasteNodes = useEditorStore((state) => state.pasteNodes)
  const deleteSelected = useEditorStore((state) => state.deleteSelected)
  const selectNodes = useEditorStore((state) => state.selectNodes)
  const toggleLockNodes = useEditorStore((state) => state.toggleLockNodes)
  const groupNodes = useEditorStore((state) => state.groupNodes)
  const ungroupNodes = useEditorStore((state) => state.ungroupNodes)
  const updateNodeStyle = useEditorStore((state) => state.updateNodeStyle)
  const bringToFront = useEditorStore((state) => state.bringToFront)
  const bringForward = useEditorStore((state) => state.bringForward)
  const sendBackward = useEditorStore((state) => state.sendBackward)
  const sendToBack = useEditorStore((state) => state.sendToBack)

  // Ensure this node is selected before performing actions
  const ensureSelected = useCallback(() => {
    const selectedNodes = useEditorStore.getState().selectedNodes
    if (!selectedNodes.includes(nodeId)) {
      selectNodes([nodeId])
    }
  }, [nodeId, selectNodes])

  const handleCut = useCallback(() => {
    ensureSelected()
    copyNodes()
    deleteSelected()
  }, [ensureSelected, copyNodes, deleteSelected])

  const handleCopy = useCallback(() => {
    ensureSelected()
    copyNodes()
  }, [ensureSelected, copyNodes])

  const handlePaste = useCallback(() => {
    pasteNodes()
  }, [pasteNodes])

  const handleDuplicate = useCallback(() => {
    ensureSelected()
    copyNodes()
    pasteNodes()
  }, [ensureSelected, copyNodes, pasteNodes])

  const handleDelete = useCallback(() => {
    ensureSelected()
    deleteSelected()
  }, [ensureSelected, deleteSelected])

  const handleLock = useCallback(() => {
    ensureSelected()
    toggleLockNodes()
  }, [ensureSelected, toggleLockNodes])

  const handleGroup = useCallback(() => {
    ensureSelected()
    groupNodes()
  }, [ensureSelected, groupNodes])

  const handleUngroup = useCallback(() => {
    ensureSelected()
    ungroupNodes()
  }, [ensureSelected, ungroupNodes])

  // Layer order functions
  const handleBringToFront = useCallback(() => {
    bringToFront([nodeId])
  }, [nodeId, bringToFront])

  const handleBringForward = useCallback(() => {
    bringForward([nodeId])
  }, [nodeId, bringForward])

  const handleSendBackward = useCallback(() => {
    sendBackward([nodeId])
  }, [nodeId, sendBackward])

  const handleSendToBack = useCallback(() => {
    sendToBack([nodeId])
  }, [nodeId, sendToBack])

  // Flip functions
  const handleFlipHorizontal = useCallback(() => {
    const node = useEditorStore.getState().nodes.find(n => n.id === nodeId)
    if (!node) return
    const currentScaleX = node.data.style?.scaleX ?? 1
    updateNodeStyle(nodeId, { scaleX: currentScaleX * -1 })
  }, [nodeId, updateNodeStyle])

  const handleFlipVertical = useCallback(() => {
    const node = useEditorStore.getState().nodes.find(n => n.id === nodeId)
    if (!node) return
    const currentScaleY = node.data.style?.scaleY ?? 1
    updateNodeStyle(nodeId, { scaleY: currentScaleY * -1 })
  }, [nodeId, updateNodeStyle])

  const handleResetRotation = useCallback(() => {
    updateNodeStyle(nodeId, { rotation: 0 })
  }, [nodeId, updateNodeStyle])

  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null)

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenuPos({ x: e.clientX, y: e.clientY })
  }, [])

  const closeMenu = useCallback(() => {
    setContextMenuPos(null)
  }, [])

  return (
    <>
      <div className="w-full h-full" onContextMenu={handleContextMenu}>
        {children}
      </div>
      <ContextMenuPrimitive.Root open={contextMenuPos !== null} onOpenChange={(open) => !open && closeMenu()}>
        <ContextMenuPrimitive.Portal>
          <ContextMenuContent
            className="w-56"
            style={contextMenuPos ? { position: 'fixed', left: contextMenuPos.x, top: contextMenuPos.y } : undefined}
          >
        {/* Edit Actions */}
        <ContextMenuItem onClick={handleCut}>
          <Copy className="w-4 h-4 mr-2" />
          Cut
          <ContextMenuShortcut>Ctrl+X</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={handleCopy}>
          <Copy className="w-4 h-4 mr-2" />
          Copy
          <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={handlePaste}>
          <Clipboard className="w-4 h-4 mr-2" />
          Paste
          <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDuplicate}>
          <CopyPlus className="w-4 h-4 mr-2" />
          Duplicate
          <ContextMenuShortcut>Ctrl+D</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Layer Order */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Layers className="w-4 h-4 mr-2" />
            Order
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem onClick={handleBringToFront}>
              <ChevronsUp className="w-4 h-4 mr-2" />
              Bring to Front
            </ContextMenuItem>
            <ContextMenuItem onClick={handleBringForward}>
              <ChevronUp className="w-4 h-4 mr-2" />
              Bring Forward
            </ContextMenuItem>
            <ContextMenuItem onClick={handleSendBackward}>
              <ChevronDown className="w-4 h-4 mr-2" />
              Send Backward
            </ContextMenuItem>
            <ContextMenuItem onClick={handleSendToBack}>
              <ChevronsDown className="w-4 h-4 mr-2" />
              Send to Back
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Transform */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <FlipHorizontal className="w-4 h-4 mr-2" />
            Transform
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem onClick={handleFlipHorizontal}>
              <FlipHorizontal className="w-4 h-4 mr-2" />
              Flip Horizontal
            </ContextMenuItem>
            <ContextMenuItem onClick={handleFlipVertical}>
              <FlipVertical className="w-4 h-4 mr-2" />
              Flip Vertical
            </ContextMenuItem>
            <ContextMenuItem onClick={handleResetRotation}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Rotation
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        {/* Group/Ungroup */}
        {isGrouped ? (
          <ContextMenuItem onClick={handleUngroup}>
            <Ungroup className="w-4 h-4 mr-2" />
            Ungroup
            <ContextMenuShortcut>Ctrl+Shift+G</ContextMenuShortcut>
          </ContextMenuItem>
        ) : (
          <ContextMenuItem onClick={handleGroup}>
            <Group className="w-4 h-4 mr-2" />
            Group
            <ContextMenuShortcut>Ctrl+G</ContextMenuShortcut>
          </ContextMenuItem>
        )}

        {/* Lock/Unlock */}
        <ContextMenuItem onClick={handleLock}>
          {isLocked ? (
            <>
              <Unlock className="w-4 h-4 mr-2" />
              Unlock
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Lock
            </>
          )}
          <ContextMenuShortcut>Ctrl+L</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Delete */}
        <ContextMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
          <ContextMenuShortcut>Del</ContextMenuShortcut>
        </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenuPrimitive.Portal>
      </ContextMenuPrimitive.Root>
    </>
  )
}
