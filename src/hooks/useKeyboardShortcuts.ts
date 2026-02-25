import { useEffect } from 'react'
import { toast } from 'sonner'
import { useEditorStore } from '@/stores/editorStore'

interface KeyboardShortcutCallbacks {
  onSave?: () => void
  onShowShortcuts?: () => void
}

export function useKeyboardShortcuts(callbacks?: KeyboardShortcutCallbacks) {
  const deleteSelected = useEditorStore((state) => state.deleteSelected)
  const copyNodes = useEditorStore((state) => state.copyNodes)
  const pasteNodes = useEditorStore((state) => state.pasteNodes)
  const undo = useEditorStore((state) => state.undo)
  const redo = useEditorStore((state) => state.redo)
  const selectNodes = useEditorStore((state) => state.selectNodes)
  const nodes = useEditorStore((state) => state.nodes)
  const groupNodes = useEditorStore((state) => state.groupNodes)
  const ungroupNodes = useEditorStore((state) => state.ungroupNodes)
  const toggleLockNodes = useEditorStore((state) => state.toggleLockNodes)
  const toggleGrid = useEditorStore((state) => state.toggleGrid)
  const toggleSnapToGrid = useEditorStore((state) => state.toggleSnapToGrid)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isInput =
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement

      const isMod = event.metaKey || event.ctrlKey

      // Save: Ctrl+S — always allowed, even in inputs
      if (isMod && event.key === 's') {
        event.preventDefault()
        callbacks?.onSave?.()
        return
      }

      // When typing in inputs, only allow text formatting shortcuts to pass through
      // (Ctrl+B, Ctrl+I, Ctrl+U are handled by WhiteboardTextToolbar)
      if (isInput) {
        // Let text formatting shortcuts pass through to the toolbar handler
        if (isMod && (event.key === 'b' || event.key === 'B' ||
                      event.key === 'i' || event.key === 'I' ||
                      event.key === 'u' || event.key === 'U')) {
          return // Don't handle here, let WhiteboardTextToolbar handle it
        }
        return
      }

      // Show shortcuts: ?
      if (event.key === '?') {
        callbacks?.onShowShortcuts?.()
        return
      }

      // Delete: Delete or Backspace
      if (event.key === 'Delete' || event.key === 'Backspace') {
        deleteSelected()
      }

      // Copy: Ctrl+C
      if (isMod && event.key === 'c') {
        event.preventDefault()
        copyNodes()
      }

      // Paste: Ctrl+V
      if (isMod && event.key === 'v') {
        event.preventDefault()
        pasteNodes()
      }

      // Duplicate: Ctrl+D
      if (isMod && event.key === 'd') {
        event.preventDefault()
        copyNodes()
        pasteNodes()
      }

      // Undo: Ctrl+Z
      if (isMod && event.key === 'z' && !event.shiftKey) {
        event.preventDefault()
        // In drawing mode, undo drawing strokes instead of node/edge changes
        const { drawingMode, drawingStrokes } = useEditorStore.getState()
        if (drawingMode && drawingStrokes.length > 0) {
          useEditorStore.getState().undoDrawingStroke()
          return
        }
        const { past } = useEditorStore.getState()
        if (past.length > 0) {
          undo()
          toast('Undone', { duration: 1500 })
        }
      }

      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if ((isMod && event.key === 'z' && event.shiftKey) || (isMod && event.key === 'y')) {
        event.preventDefault()
        const { future } = useEditorStore.getState()
        if (future.length > 0) {
          redo()
          toast('Redone', { duration: 1500 })
        }
      }

      // Select All: Ctrl+A
      if (isMod && event.key === 'a') {
        event.preventDefault()
        selectNodes(nodes.map((n) => n.id))
      }

      // Group: Ctrl+G
      if (isMod && event.key === 'g' && !event.shiftKey) {
        event.preventDefault()
        groupNodes()
      }

      // Ungroup: Ctrl+Shift+G
      if (isMod && event.key === 'g' && event.shiftKey) {
        event.preventDefault()
        ungroupNodes()
      }

      // Lock/Unlock: Ctrl+L
      if (isMod && event.key === 'l') {
        event.preventDefault()
        toggleLockNodes()
      }

      // Toggle Grid: Ctrl+'
      if (isMod && event.key === "'") {
        event.preventDefault()
        toggleGrid()
      }

      // Toggle Snap to Grid: Ctrl+Shift+'
      if (isMod && event.shiftKey && event.key === '"') {
        event.preventDefault()
        toggleSnapToGrid()
      }

      // Toggle Shape Panel: Ctrl+B
      if (isMod && event.key === 'b') {
        event.preventDefault()
        useEditorStore.getState().toggleShapePanel()
      }

      // Command Palette: Ctrl+K
      if (isMod && event.key === 'k') {
        event.preventDefault()
        useEditorStore.getState().toggleCommandPalette()
      }

      // Presentation Mode: F5
      if (event.key === 'F5') {
        event.preventDefault()
        useEditorStore.getState().togglePresentationMode()
      }

      // Find & Replace: Ctrl+F
      if (isMod && event.key === 'f') {
        event.preventDefault()
        useEditorStore.getState().toggleFindReplace()
      }

      // Drawing Mode: D
      if (event.key === 'd' && !isMod) {
        event.preventDefault()
        useEditorStore.getState().toggleDrawingMode()
      }

      // Air Canvas toggle: G (works in drawing mode)
      if (event.key === 'g' && !isMod) {
        const drawingMode = useEditorStore.getState().drawingMode
        if (drawingMode) {
          event.preventDefault()
          useEditorStore.getState().toggleAirCanvas()
          return
        }
      }

      // Drawing tool shortcuts (when in drawing mode)
      const drawingMode = useEditorStore.getState().drawingMode
      if (drawingMode) {
        // Select tool: V
        if (event.key === 'v' && !isMod) {
          event.preventDefault()
          useEditorStore.getState().setDrawingTool('select')
        }
        // Pen tool: B
        if (event.key === 'b' && !isMod) {
          event.preventDefault()
          useEditorStore.getState().setDrawingTool('pen')
        }
        // Highlighter: H
        if (event.key === 'h' && !isMod) {
          event.preventDefault()
          useEditorStore.getState().setDrawingTool('highlighter')
        }
        // Eraser: E
        if (event.key === 'e' && !isMod) {
          event.preventDefault()
          useEditorStore.getState().setDrawingTool('eraser')
        }
        // Line: L
        if (event.key === 'l' && !isMod) {
          event.preventDefault()
          useEditorStore.getState().setDrawingTool('line')
        }
        // Arrow: A
        if (event.key === 'a' && !isMod) {
          event.preventDefault()
          useEditorStore.getState().setDrawingTool('arrow')
        }
        // Rectangle: R
        if (event.key === 'r' && !isMod) {
          event.preventDefault()
          useEditorStore.getState().setDrawingTool('rectangle')
        }
        // Ellipse: O
        if (event.key === 'o' && !isMod) {
          event.preventDefault()
          useEditorStore.getState().setDrawingTool('ellipse')
        }
        // Delete selected strokes: Delete or Backspace
        if (event.key === 'Delete' || event.key === 'Backspace') {
          const { selectedStrokeIds } = useEditorStore.getState()
          if (selectedStrokeIds.length > 0) {
            event.preventDefault()
            useEditorStore.getState().deleteSelectedStrokes()
            return
          }
        }
        // Exit drawing mode: Escape
        if (event.key === 'Escape') {
          event.preventDefault()
          useEditorStore.getState().setDrawingMode(false)
        }
        // Decrease brush size: [
        if (event.key === '[') {
          event.preventDefault()
          const { drawingWidth, setDrawingWidth } = useEditorStore.getState()
          setDrawingWidth(Math.max(1, drawingWidth - 2))
        }
        // Increase brush size: ]
        if (event.key === ']') {
          event.preventDefault()
          const { drawingWidth, setDrawingWidth } = useEditorStore.getState()
          setDrawingWidth(Math.min(32, drawingWidth + 2))
        }
      }

      // Arrow keys: Move selected nodes
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        // Get fresh state to ensure we have current selection
        const {
          nodes: currentNodes,
          selectedNodes: currentSelectedNodes,
        } = useEditorStore.getState()

        // Only activate if nodes are selected
        if (currentSelectedNodes.length === 0) return

        event.preventDefault()

        // Determine move distance (larger with shift)
        const distance = event.shiftKey ? 10 : 1

        // Calculate delta based on arrow key
        let dx = 0
        let dy = 0
        switch (event.key) {
          case 'ArrowLeft':
            dx = -distance
            break
          case 'ArrowRight':
            dx = distance
            break
          case 'ArrowUp':
            dy = -distance
            break
          case 'ArrowDown':
            dy = distance
            break
        }

        // Push history before moving
        useEditorStore.getState().pushHistory()

        // Move selected nodes if any
        if (currentSelectedNodes.length > 0) {
          // Get selected node objects
          const selectedNodeObjects = currentNodes.filter((n) => currentSelectedNodes.includes(n.id))
          if (selectedNodeObjects.length > 0) {
            // Check if selected nodes are all in the same group
            const groupIds = new Set(
              selectedNodeObjects.map((n) => n.data.groupId).filter(Boolean)
            )

            // Determine which nodes to move
            let nodesToMove: string[]

            if (groupIds.size === 1) {
              // All selected nodes are in the same group
              const groupId = [...groupIds][0]
              const allNodesInGroup = currentNodes.filter((n) => n.data.groupId === groupId)

              // Only move entire group if ALL nodes in the group are selected
              const allGroupNodesSelected = allNodesInGroup.every((n) =>
                currentSelectedNodes.includes(n.id)
              )

              if (allGroupNodesSelected) {
                // Move the entire group
                nodesToMove = allNodesInGroup.map((n) => n.id)
              } else {
                // Only some group nodes selected - move just those
                nodesToMove = [...currentSelectedNodes]
              }
            } else {
              // Move only the selected nodes (mixed selection or ungrouped)
              nodesToMove = [...currentSelectedNodes]
            }

            // Update positions for all nodes to move
            nodesToMove.forEach((nodeId) => {
              const node = currentNodes.find((n) => n.id === nodeId)
              if (node && !node.data.locked) {
                useEditorStore.getState().updateNodePosition(nodeId, {
                  x: node.position.x + dx,
                  y: node.position.y + dy,
                })
              }
            })
          }
        }

      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    callbacks,
    deleteSelected,
    copyNodes,
    pasteNodes,
    undo,
    redo,
    selectNodes,
    nodes,
    groupNodes,
    ungroupNodes,
    toggleLockNodes,
    toggleGrid,
    toggleSnapToGrid,
  ])
}
