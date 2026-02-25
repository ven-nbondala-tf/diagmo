import { useEffect, useState, useCallback } from 'react'
import { X, Keyboard } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ShortcutCategory {
  name: string
  shortcuts: { keys: string; action: string }[]
}

const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
  {
    name: 'File',
    shortcuts: [
      { keys: 'Ctrl+S', action: 'Save diagram' },
      { keys: 'Ctrl+Shift+S', action: 'Save as template' },
      { keys: 'Ctrl+E', action: 'Export diagram' },
      { keys: 'Ctrl+O', action: 'Open diagram' },
    ],
  },
  {
    name: 'Edit',
    shortcuts: [
      { keys: 'Ctrl+Z', action: 'Undo' },
      { keys: 'Ctrl+Y', action: 'Redo' },
      { keys: 'Ctrl+C', action: 'Copy' },
      { keys: 'Ctrl+V', action: 'Paste' },
      { keys: 'Ctrl+D', action: 'Duplicate' },
      { keys: 'Delete', action: 'Delete selected' },
      { keys: 'Ctrl+A', action: 'Select all' },
      { keys: 'Ctrl+F', action: 'Find & replace' },
      { keys: 'Escape', action: 'Deselect all' },
    ],
  },
  {
    name: 'View',
    shortcuts: [
      { keys: 'Ctrl++', action: 'Zoom in' },
      { keys: 'Ctrl+-', action: 'Zoom out' },
      { keys: 'Ctrl+0', action: 'Fit to screen' },
      { keys: 'Ctrl+1', action: 'Zoom to 100%' },
      { keys: "Ctrl+'", action: 'Toggle grid' },
      { keys: "Ctrl+Shift+'", action: 'Toggle snap to grid' },
      { keys: 'F5', action: 'Presentation mode' },
      { keys: 'F11', action: 'Fullscreen' },
    ],
  },
  {
    name: 'Canvas',
    shortcuts: [
      { keys: 'Space+Drag', action: 'Pan canvas' },
      { keys: 'Scroll', action: 'Zoom in/out' },
      { keys: 'Shift+Click', action: 'Add to selection' },
      { keys: 'Ctrl+Click', action: 'Toggle selection' },
      { keys: 'Drag', action: 'Box select' },
    ],
  },
  {
    name: 'Arrange',
    shortcuts: [
      { keys: 'Ctrl+G', action: 'Group nodes' },
      { keys: 'Ctrl+Shift+G', action: 'Ungroup nodes' },
      { keys: 'Ctrl+L', action: 'Lock/unlock' },
      { keys: 'Ctrl+]', action: 'Bring to front' },
      { keys: 'Ctrl+[', action: 'Send to back' },
      { keys: 'Arrow keys', action: 'Nudge selected' },
      { keys: 'Shift+Arrow', action: 'Large nudge' },
    ],
  },
  {
    name: 'Quick Actions',
    shortcuts: [
      { keys: '?', action: 'Show this help' },
      { keys: 'N', action: 'Add note' },
      { keys: 'T', action: 'Add text' },
      { keys: 'R', action: 'Add rectangle' },
      { keys: 'C', action: 'Add circle' },
      { keys: 'L', action: 'Add line/connector' },
    ],
  },
  {
    name: 'Drawing',
    shortcuts: [
      { keys: 'D', action: 'Toggle drawing mode' },
      { keys: 'V', action: 'Select tool' },
      { keys: 'B', action: 'Pen tool' },
      { keys: 'H', action: 'Highlighter tool' },
      { keys: 'E', action: 'Eraser tool' },
      { keys: 'L', action: 'Line tool' },
      { keys: 'A', action: 'Arrow tool' },
      { keys: 'R', action: 'Rectangle tool' },
      { keys: 'O', action: 'Ellipse tool' },
      { keys: 'Escape', action: 'Exit drawing mode' },
    ],
  },
]

interface KeyboardShortcutsOverlayProps {
  open: boolean
  onClose: () => void
}

export function KeyboardShortcutsOverlay({ open, onClose }: KeyboardShortcutsOverlayProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === '?') {
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full max-h-[85vh] m-4 bg-supabase-bg border border-supabase-border rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-supabase-border bg-supabase-bg-secondary">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-supabase-green/10">
              <Keyboard className="h-5 w-5 text-supabase-green" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-supabase-text-primary">
                Keyboard Shortcuts
              </h2>
              <p className="text-sm text-supabase-text-muted">
                Press <kbd className="px-1.5 py-0.5 text-xs bg-supabase-bg-tertiary rounded border border-supabase-border">?</kbd> or <kbd className="px-1.5 py-0.5 text-xs bg-supabase-bg-tertiary rounded border border-supabase-border">Esc</kbd> to close
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-supabase-bg-tertiary text-supabase-text-muted hover:text-supabase-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SHORTCUT_CATEGORIES.map((category) => (
              <div key={category.name} className="space-y-3">
                <h3 className="text-sm font-semibold text-supabase-green uppercase tracking-wide">
                  {category.name}
                </h3>
                <div className="space-y-2">
                  {category.shortcuts.map((shortcut, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-4 py-1.5"
                    >
                      <span className="text-sm text-supabase-text-secondary">
                        {shortcut.action}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {shortcut.keys.split('+').map((key, keyIdx, arr) => (
                          <span key={keyIdx} className="flex items-center">
                            <kbd
                              className={cn(
                                'px-2 py-1 text-xs font-medium rounded',
                                'bg-supabase-bg-tertiary border border-supabase-border',
                                'text-supabase-text-primary shadow-sm',
                                'min-w-[28px] text-center'
                              )}
                            >
                              {key.replace('Ctrl', '⌃').replace('Shift', '⇧').replace('Alt', '⌥')}
                            </kbd>
                            {keyIdx < arr.length - 1 && (
                              <span className="mx-0.5 text-supabase-text-muted text-xs">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-supabase-border bg-supabase-bg-secondary">
          <p className="text-xs text-supabase-text-muted text-center">
            Customize shortcuts in Settings → Keyboard Shortcuts
          </p>
        </div>
      </div>
    </div>
  )
}

// Hook to toggle keyboard shortcuts overlay with ? key
export function useKeyboardShortcutsOverlay() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger on ? when not in an input
      if (
        e.key === '?' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  }
}
