import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEditorStore } from '@/stores/editorStore'
import { useUpdateDiagram } from '@/hooks'
import { exportService } from '@/services/exportService'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import type { Diagram, DiagramNode, DiagramEdge } from '@/types'
import {
  Button,
  Input,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui'
import {
  ArrowLeft,
  Loader2,
  Check,
} from 'lucide-react'
import { AUTO_SAVE_INTERVAL } from '@/constants'
import { toast } from 'sonner'
import { MenuBar } from './MenuBar'
import { CommandPalette } from './CommandPalette'

interface EditorHeaderProps {
  diagram: Diagram
}

const SHORTCUTS = [
  { keys: ['Ctrl', 'S'], description: 'Save diagram' },
  { keys: ['Ctrl', 'Z'], description: 'Undo' },
  { keys: ['Ctrl', 'Y'], description: 'Redo' },
  { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo (alternative)' },
  { keys: ['Ctrl', 'C'], description: 'Copy selected nodes' },
  { keys: ['Ctrl', 'V'], description: 'Paste nodes' },
  { keys: ['Ctrl', 'D'], description: 'Duplicate selected' },
  { keys: ['Ctrl', 'A'], description: 'Select all nodes' },
  { keys: ['Ctrl', 'G'], description: 'Group selected nodes' },
  { keys: ['Ctrl', 'Shift', 'G'], description: 'Ungroup nodes' },
  { keys: ['Ctrl', 'L'], description: 'Lock/Unlock selected' },
  { keys: ['Ctrl', "'"], description: 'Toggle grid' },
  { keys: ['Ctrl', 'Shift', "'"], description: 'Toggle snap to grid' },
  { keys: ['Delete'], description: 'Delete selected' },
  { keys: ['Backspace'], description: 'Delete selected' },
]

export function EditorHeader({ diagram }: EditorHeaderProps) {
  const navigate = useNavigate()
  const [name, setName] = useState(diagram.name)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showShortcuts, setShowShortcuts] = useState(false)

  const nodes = useEditorStore((state) => state.nodes)
  const edges = useEditorStore((state) => state.edges)
  const isDirty = useEditorStore((state) => state.isDirty)
  const setDirty = useEditorStore((state) => state.setDirty)
  const zoom = useEditorStore((state) => state.zoom)

  const updateDiagram = useUpdateDiagram()

  const handleSave = useCallback(async () => {
    if (!isDirty && name === diagram.name) return

    setSaving(true)
    try {
      // Generate thumbnail
      let thumbnail: string | undefined
      const viewportEl = document.querySelector('.react-flow__viewport') as HTMLElement
      if (viewportEl && nodes.length > 0) {
        try {
          thumbnail = await exportService.generateThumbnail(viewportEl, nodes)
        } catch {
          // Thumbnail generation is non-critical
        }
      }

      await updateDiagram.mutateAsync({
        id: diagram.id,
        name,
        nodes,
        edges,
        ...(thumbnail ? { thumbnail } : {}),
      })
      setDirty(false)
      setLastSaved(new Date())
      toast.success('Diagram saved')
    } catch (error) {
      console.error('Failed to save:', error)
      toast.error('Failed to save diagram')
    } finally {
      setSaving(false)
    }
  }, [diagram.id, diagram.name, name, nodes, edges, isDirty, updateDiagram, setDirty])

  const handleExport = async (format: 'png' | 'svg' | 'pdf' | 'json') => {
    // JSON export doesn't need the viewport
    if (format === 'json') {
      try {
        const data = { name, nodes, edges }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${name}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('Exported as JSON')
      } catch (error) {
        toast.error('Export failed')
        console.error('Export error:', error)
      }
      return
    }

    const viewportEl = document.querySelector('.react-flow__viewport') as HTMLElement
    if (!viewportEl || nodes.length === 0) {
      toast.error('Failed to export: canvas not found or empty')
      return
    }

    try {
      toast.loading('Exporting full diagram...')

      // Use the new full diagram export methods (offscreen clone, no visual glitch)
      switch (format) {
        case 'png': {
          const dataUrl = await exportService.exportFullDiagramToPng(viewportEl, nodes)
          exportService.downloadFile(dataUrl, `${name}.png`)
          break
        }
        case 'svg': {
          const dataUrl = await exportService.exportFullDiagramToSvg(viewportEl, nodes)
          exportService.downloadFile(dataUrl, `${name}.svg`)
          break
        }
        case 'pdf': {
          const blob = await exportService.exportFullDiagramToPdf(viewportEl, nodes)
          exportService.downloadFile(blob, `${name}.pdf`)
          break
        }
      }

      toast.dismiss()
      toast.success(`Exported as ${format.toUpperCase()}`)
    } catch (error) {
      toast.dismiss()
      toast.error('Export failed')
      console.error('Export error:', error)
    }
  }

  // Import from JSON
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImport = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        if (!data.nodes || !Array.isArray(data.nodes) || !data.edges || !Array.isArray(data.edges)) {
          toast.error('Invalid diagram file: missing nodes or edges')
          return
        }
        useEditorStore.getState().importDiagram(data.nodes as DiagramNode[], data.edges as DiagramEdge[])
        if (data.name) setName(data.name)
        toast.success('Diagram imported')
      } catch {
        toast.error('Failed to parse JSON file')
      }
    }
    reader.readAsText(file)
    // Reset so the same file can be imported again
    e.target.value = ''
  }, [])

  // Auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      if (isDirty) {
        handleSave()
      }
    }, AUTO_SAVE_INTERVAL)

    return () => clearInterval(interval)
  }, [isDirty, handleSave])

  // Centralized keyboard shortcuts (save + show shortcuts dialog are header-specific)
  const shortcutCallbacks = useMemo(() => ({
    onSave: handleSave,
    onShowShortcuts: () => setShowShortcuts(true),
  }), [handleSave])
  useKeyboardShortcuts(shortcutCallbacks)

  return (
    <>
      <header className="border-b bg-background flex flex-col">
        {/* Menu Bar */}
        <MenuBar
          diagramName={name}
          onSave={handleSave}
          onExport={handleExport}
          onImport={handleImport}
          saving={saving}
        />

        {/* Status Bar */}
        <div className="h-10 flex items-center px-4 gap-4 border-t bg-muted/30">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Dashboard
              </Button>
            </TooltipTrigger>
            <TooltipContent>Back to Dashboard</TooltipContent>
          </Tooltip>

          <div className="w-px h-5 bg-border" />

          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSave}
            className="max-w-[200px] h-7 text-sm font-medium bg-transparent border-none focus:bg-background"
          />

          <div className="flex-1" />

          {saving ? (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </span>
          ) : lastSaved ? (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Check className="h-3 w-3" />
              Saved
            </span>
          ) : isDirty ? (
            <span className="text-xs text-muted-foreground">Unsaved changes</span>
          ) : null}

          <span className="text-xs text-muted-foreground ml-4">
            {Math.round(zoom * 100)}%
          </span>
        </div>
      </header>

      {/* Hidden file input for JSON import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Command Palette */}
      <CommandPalette onSave={handleSave} onExport={handleExport} onImport={handleImport} />

      <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
            <DialogDescription>
              Quickly navigate and edit your diagrams
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            {SHORTCUTS.map((shortcut, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {shortcut.description}
                </span>
                <div className="flex gap-1">
                  {shortcut.keys.map((key, j) => (
                    <kbd
                      key={j}
                      className="px-2 py-1 text-xs font-semibold bg-muted rounded border"
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
