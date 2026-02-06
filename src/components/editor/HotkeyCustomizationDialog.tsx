import { useState, useCallback, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Input,
} from '@/components/ui'
import { Keyboard, RotateCcw, Save } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'

interface HotkeyCustomizationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface HotkeyConfig {
  id: string
  action: string
  description: string
  defaultKeys: string
  currentKeys: string
  category: string
}

const DEFAULT_HOTKEYS: HotkeyConfig[] = [
  // File
  { id: 'save', action: 'Save', description: 'Save diagram', defaultKeys: 'Ctrl+S', currentKeys: 'Ctrl+S', category: 'File' },

  // Edit
  { id: 'undo', action: 'Undo', description: 'Undo last action', defaultKeys: 'Ctrl+Z', currentKeys: 'Ctrl+Z', category: 'Edit' },
  { id: 'redo', action: 'Redo', description: 'Redo last action', defaultKeys: 'Ctrl+Y', currentKeys: 'Ctrl+Y', category: 'Edit' },
  { id: 'copy', action: 'Copy', description: 'Copy selected', defaultKeys: 'Ctrl+C', currentKeys: 'Ctrl+C', category: 'Edit' },
  { id: 'paste', action: 'Paste', description: 'Paste from clipboard', defaultKeys: 'Ctrl+V', currentKeys: 'Ctrl+V', category: 'Edit' },
  { id: 'duplicate', action: 'Duplicate', description: 'Duplicate selected', defaultKeys: 'Ctrl+D', currentKeys: 'Ctrl+D', category: 'Edit' },
  { id: 'delete', action: 'Delete', description: 'Delete selected', defaultKeys: 'Delete', currentKeys: 'Delete', category: 'Edit' },
  { id: 'selectAll', action: 'Select All', description: 'Select all nodes', defaultKeys: 'Ctrl+A', currentKeys: 'Ctrl+A', category: 'Edit' },
  { id: 'find', action: 'Find', description: 'Open find & replace', defaultKeys: 'Ctrl+F', currentKeys: 'Ctrl+F', category: 'Edit' },

  // View
  { id: 'zoomIn', action: 'Zoom In', description: 'Zoom in', defaultKeys: 'Ctrl+=', currentKeys: 'Ctrl+=', category: 'View' },
  { id: 'zoomOut', action: 'Zoom Out', description: 'Zoom out', defaultKeys: 'Ctrl+-', currentKeys: 'Ctrl+-', category: 'View' },
  { id: 'fitView', action: 'Fit View', description: 'Fit diagram to screen', defaultKeys: 'Ctrl+0', currentKeys: 'Ctrl+0', category: 'View' },
  { id: 'toggleGrid', action: 'Toggle Grid', description: 'Show/hide grid', defaultKeys: "Ctrl+'", currentKeys: "Ctrl+'", category: 'View' },
  { id: 'toggleSnap', action: 'Toggle Snap', description: 'Toggle snap to grid', defaultKeys: "Ctrl+Shift+'", currentKeys: "Ctrl+Shift+'", category: 'View' },
  { id: 'present', action: 'Present', description: 'Enter presentation mode', defaultKeys: 'F5', currentKeys: 'F5', category: 'View' },

  // Arrange
  { id: 'group', action: 'Group', description: 'Group selected nodes', defaultKeys: 'Ctrl+G', currentKeys: 'Ctrl+G', category: 'Arrange' },
  { id: 'ungroup', action: 'Ungroup', description: 'Ungroup selected nodes', defaultKeys: 'Ctrl+Shift+G', currentKeys: 'Ctrl+Shift+G', category: 'Arrange' },
  { id: 'lock', action: 'Lock', description: 'Lock selected nodes', defaultKeys: 'Ctrl+L', currentKeys: 'Ctrl+L', category: 'Arrange' },
  { id: 'bringToFront', action: 'Bring to Front', description: 'Bring to front', defaultKeys: 'Ctrl+]', currentKeys: 'Ctrl+]', category: 'Arrange' },
  { id: 'sendToBack', action: 'Send to Back', description: 'Send to back', defaultKeys: 'Ctrl+[', currentKeys: 'Ctrl+[', category: 'Arrange' },
]

const STORAGE_KEY = 'diagmo-hotkeys'

export function HotkeyCustomizationDialog({ open, onOpenChange }: HotkeyCustomizationDialogProps) {
  const [hotkeys, setHotkeys] = useState<HotkeyConfig[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, string>
        return DEFAULT_HOTKEYS.map((hk) => ({
          ...hk,
          currentKeys: parsed[hk.id] || hk.defaultKeys,
        }))
      }
    } catch {
      // Ignore parse errors
    }
    return DEFAULT_HOTKEYS
  })

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  const categories = [...new Set(hotkeys.map((h) => h.category))]

  const handleStartEdit = useCallback((hk: HotkeyConfig) => {
    setEditingId(hk.id)
    setEditingValue(hk.currentKeys)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const parts: string[] = []
    if (e.ctrlKey || e.metaKey) parts.push('Ctrl')
    if (e.shiftKey) parts.push('Shift')
    if (e.altKey) parts.push('Alt')

    // Get the key name
    let key = e.key
    if (key === ' ') key = 'Space'
    else if (key === 'Escape') {
      setEditingId(null)
      return
    }
    else if (key === 'Enter') {
      // Save the current value
      if (editingId && editingValue) {
        setHotkeys((prev) =>
          prev.map((hk) =>
            hk.id === editingId ? { ...hk, currentKeys: editingValue } : hk
          )
        )
        setHasChanges(true)
      }
      setEditingId(null)
      return
    }
    else if (key.length === 1) key = key.toUpperCase()
    else if (key === 'Control' || key === 'Shift' || key === 'Alt' || key === 'Meta') {
      // Just modifier, wait for actual key
      return
    }

    parts.push(key)
    const combo = parts.join('+')
    setEditingValue(combo)
  }, [editingId, editingValue])

  const handleSaveEdit = useCallback(() => {
    if (editingId && editingValue) {
      setHotkeys((prev) =>
        prev.map((hk) =>
          hk.id === editingId ? { ...hk, currentKeys: editingValue } : hk
        )
      )
      setHasChanges(true)
    }
    setEditingId(null)
  }, [editingId, editingValue])

  const handleReset = useCallback((id: string) => {
    setHotkeys((prev) =>
      prev.map((hk) =>
        hk.id === id ? { ...hk, currentKeys: hk.defaultKeys } : hk
      )
    )
    setHasChanges(true)
  }, [])

  const handleResetAll = useCallback(() => {
    setHotkeys(DEFAULT_HOTKEYS)
    setHasChanges(true)
  }, [])

  const handleSave = useCallback(() => {
    try {
      const config: Record<string, string> = {}
      hotkeys.forEach((hk) => {
        if (hk.currentKeys !== hk.defaultKeys) {
          config[hk.id] = hk.currentKeys
        }
      })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
      toast.success('Keyboard shortcuts saved')
      setHasChanges(false)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save hotkeys:', error)
      toast.error('Failed to save shortcuts')
    }
  }, [hotkeys, onOpenChange])

  // Apply saved hotkeys on mount
  useEffect(() => {
    if (open) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored) as Record<string, string>
          setHotkeys((prev) =>
            prev.map((hk) => ({
              ...hk,
              currentKeys: parsed[hk.id] || hk.defaultKeys,
            }))
          )
        }
      } catch {
        // Ignore parse errors
      }
      setHasChanges(false)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            View and customize keyboard shortcuts. Click on a shortcut to change it.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                {category}
              </h3>
              <div className="space-y-1">
                {hotkeys
                  .filter((hk) => hk.category === category)
                  .map((hk) => (
                    <div
                      key={hk.id}
                      className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50"
                    >
                      <div>
                        <p className="text-sm font-medium">{hk.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {hk.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {editingId === hk.id ? (
                          <Input
                            value={editingValue}
                            onKeyDown={handleKeyDown}
                            onBlur={handleSaveEdit}
                            className="w-32 h-7 text-xs text-center"
                            placeholder="Press keys..."
                            autoFocus
                            readOnly
                          />
                        ) : (
                          <button
                            onClick={() => handleStartEdit(hk)}
                            className={cn(
                              'px-2 py-1 text-xs font-mono rounded border',
                              'hover:bg-muted/50 transition-colors',
                              hk.currentKeys !== hk.defaultKeys
                                ? 'border-primary/50 bg-primary/5'
                                : 'border-border bg-muted/50'
                            )}
                          >
                            {hk.currentKeys}
                          </button>
                        )}
                        {hk.currentKeys !== hk.defaultKeys && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleReset(hk.id)}
                            title="Reset to default"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" size="sm" onClick={handleResetAll}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset All
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges}>
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hook to get custom hotkeys
export function useCustomHotkeys(): Record<string, string> {
  const [hotkeys, setHotkeys] = useState<Record<string, string>>({})

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setHotkeys(JSON.parse(stored))
      }
    } catch {
      // Ignore parse errors
    }
  }, [])

  return hotkeys
}
