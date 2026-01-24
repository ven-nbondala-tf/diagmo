import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEditorStore } from '@/stores/editorStore'
import { useUpdateDiagram } from '@/hooks/useDiagrams'
import type { Diagram } from '@/types'
import {
  Button,
  Input,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui'
import {
  ArrowLeft,
  Save,
  Undo2,
  Redo2,
  Download,
  Grid3X3,
  Loader2,
  Check,
  MoreHorizontal,
} from 'lucide-react'
import { AUTO_SAVE_INTERVAL } from '@/constants'

interface EditorHeaderProps {
  diagram: Diagram
}

export function EditorHeader({ diagram }: EditorHeaderProps) {
  const navigate = useNavigate()
  const [name, setName] = useState(diagram.name)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const nodes = useEditorStore((state) => state.nodes)
  const edges = useEditorStore((state) => state.edges)
  const isDirty = useEditorStore((state) => state.isDirty)
  const setDirty = useEditorStore((state) => state.setDirty)
  const undo = useEditorStore((state) => state.undo)
  const redo = useEditorStore((state) => state.redo)
  const past = useEditorStore((state) => state.past)
  const future = useEditorStore((state) => state.future)
  const gridEnabled = useEditorStore((state) => state.gridEnabled)
  const toggleGrid = useEditorStore((state) => state.toggleGrid)
  const zoom = useEditorStore((state) => state.zoom)

  const updateDiagram = useUpdateDiagram()

  const handleSave = useCallback(async () => {
    if (!isDirty && name === diagram.name) return

    setSaving(true)
    try {
      await updateDiagram.mutateAsync({
        id: diagram.id,
        name,
        nodes,
        edges,
      })
      setDirty(false)
      setLastSaved(new Date())
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setSaving(false)
    }
  }, [diagram.id, diagram.name, name, nodes, edges, isDirty, updateDiagram, setDirty])

  // Auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      if (isDirty) {
        handleSave()
      }
    }, AUTO_SAVE_INTERVAL)

    return () => clearInterval(interval)
  }, [isDirty, handleSave])

  // Save on Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSave, undo, redo])

  return (
    <header className="h-14 border-b bg-background flex items-center px-4 gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Back to Dashboard</TooltipContent>
      </Tooltip>

      <div className="flex-1 flex items-center gap-4">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleSave}
          className="max-w-xs font-medium"
        />
        {saving ? (
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving...
          </span>
        ) : lastSaved ? (
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Check className="h-3 w-3" />
            Saved
          </span>
        ) : isDirty ? (
          <span className="text-sm text-muted-foreground">Unsaved changes</span>
        ) : null}
      </div>

      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={undo} disabled={past.length === 0}>
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={redo} disabled={future.length === 0}>
              <Redo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-border mx-2" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={gridEnabled ? 'secondary' : 'ghost'}
              size="icon"
              onClick={toggleGrid}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle Grid</TooltipContent>
        </Tooltip>

        <span className="text-sm text-muted-foreground px-2">
          {Math.round(zoom * 100)}%
        </span>

        <div className="w-px h-6 bg-border mx-2" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save (Ctrl+S)</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Export as PNG</DropdownMenuItem>
            <DropdownMenuItem>Export as SVG</DropdownMenuItem>
            <DropdownMenuItem>Export as PDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
