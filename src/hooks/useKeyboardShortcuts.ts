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

      // Don't trigger other shortcuts when typing in inputs
      if (isInput) return

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
