import { useCallback } from 'react'
import { Command } from 'cmdk'
import { useNavigate } from 'react-router-dom'
import { useReactFlow } from '@xyflow/react'
import { useEditorStore } from '@/stores/editorStore'
import {
  Save,
  Download,
  FileJson,
  Undo2,
  Redo2,
  Copy,
  ClipboardPaste,
  Trash2,
  PointerOff,
  Grid3x3,
  Magnet,
  ZoomIn,
  ZoomOut,
  Maximize,
  Group,
  Ungroup,
  Lock,
  Unlock,
  PanelLeftClose,
  PanelLeftOpen,
  Square,
  Circle,
  Diamond,
  Triangle,
  Type,
  StickyNote,
  ArrowLeft,
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
} from 'lucide-react'
import type { ShapeType } from '@/types'

interface CommandPaletteProps {
  onSave: () => void
  onExport: (format: 'png' | 'svg' | 'json') => void
  onImport: () => void
}

export function CommandPalette({ onSave, onExport, onImport }: CommandPaletteProps) {
  const navigate = useNavigate()
  const { fitView, zoomIn, zoomOut } = useReactFlow()

  const open = useEditorStore((state) => state.commandPaletteOpen)
  const setOpen = useEditorStore((state) => state.setCommandPaletteOpen)
  const nodes = useEditorStore((state) => state.nodes)
  const edges = useEditorStore((state) => state.edges)
  const selectedNodes = useEditorStore((state) => state.selectedNodes)
  const past = useEditorStore((state) => state.past)
  const future = useEditorStore((state) => state.future)
  const clipboard = useEditorStore((state) => state.clipboard)

  const run = useCallback((action: () => void) => {
    action()
    setOpen(false)
  }, [setOpen])

  const store = useEditorStore

  const hasSelection = selectedNodes.length > 0
  const hasMultipleSelection = selectedNodes.length >= 2

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
      overlayClassName="fixed inset-0 bg-black/50"
    >
      <div className="w-full max-w-lg rounded-xl border bg-background shadow-2xl overflow-hidden">
        <Command.Input
          placeholder="Type a command..."
          className="w-full px-4 py-3 text-sm border-b bg-transparent outline-none placeholder:text-muted-foreground"
        />
        <Command.List className="max-h-80 overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
            No commands found.
          </Command.Empty>

          {/* File */}
          <Command.Group heading="File" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
            <Item icon={Save} label="Save" shortcut="Ctrl+S" onSelect={() => run(onSave)} />
            <Item icon={Download} label="Export as PNG" onSelect={() => run(() => onExport('png'))} />
            <Item icon={Download} label="Export as SVG" onSelect={() => run(() => onExport('svg'))} />
            <Item icon={FileJson} label="Export as JSON" onSelect={() => run(() => onExport('json'))} />
            <Item icon={FileJson} label="Import from JSON..." onSelect={() => run(onImport)} />
            <Item icon={ArrowLeft} label="Back to Dashboard" onSelect={() => run(() => navigate('/dashboard'))} />
          </Command.Group>

          {/* Edit */}
          <Command.Group heading="Edit" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
            <Item icon={Undo2} label="Undo" shortcut="Ctrl+Z" disabled={past.length === 0} onSelect={() => run(() => store.getState().undo())} />
            <Item icon={Redo2} label="Redo" shortcut="Ctrl+Y" disabled={future.length === 0} onSelect={() => run(() => store.getState().redo())} />
            <Item icon={Copy} label="Copy" shortcut="Ctrl+C" disabled={!hasSelection} onSelect={() => run(() => store.getState().copyNodes())} />
            <Item icon={ClipboardPaste} label="Paste" shortcut="Ctrl+V" disabled={clipboard.length === 0} onSelect={() => run(() => store.getState().pasteNodes())} />
            <Item icon={Trash2} label="Delete Selected" shortcut="Del" disabled={!hasSelection} onSelect={() => run(() => store.getState().deleteSelected())} />
            <Item icon={PointerOff} label="Select All" shortcut="Ctrl+A" onSelect={() => run(() => {
              store.getState().selectNodes(nodes.map(n => n.id))
              store.getState().selectEdges(edges.map(e => e.id))
            })} />
          </Command.Group>

          {/* View */}
          <Command.Group heading="View" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
            <Item icon={Grid3x3} label="Toggle Grid" shortcut="Ctrl+'" onSelect={() => run(() => store.getState().toggleGrid())} />
            <Item icon={Magnet} label="Toggle Snap to Grid" onSelect={() => run(() => store.getState().toggleSnapToGrid())} />
            <Item icon={ZoomIn} label="Zoom In" onSelect={() => run(() => zoomIn())} />
            <Item icon={ZoomOut} label="Zoom Out" onSelect={() => run(() => zoomOut())} />
            <Item icon={Maximize} label="Fit to Screen" onSelect={() => run(() => fitView({ padding: 0.2 }))} />
            <Item icon={PanelLeftOpen} label="Toggle Shape Panel" shortcut="Ctrl+B" onSelect={() => run(() => store.getState().toggleShapePanel())} />
          </Command.Group>

          {/* Arrange */}
          <Command.Group heading="Arrange" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
            <Item icon={Group} label="Group" shortcut="Ctrl+G" disabled={!hasMultipleSelection} onSelect={() => run(() => store.getState().groupNodes())} />
            <Item icon={Ungroup} label="Ungroup" shortcut="Ctrl+Shift+G" disabled={!hasSelection} onSelect={() => run(() => store.getState().ungroupNodes())} />
            <Item icon={Lock} label="Lock Selected" shortcut="Ctrl+L" disabled={!hasSelection} onSelect={() => run(() => store.getState().lockNodes())} />
            <Item icon={Unlock} label="Unlock Selected" disabled={!hasSelection} onSelect={() => run(() => store.getState().unlockNodes())} />
            <Item icon={AlignHorizontalJustifyStart} label="Align Left" disabled={!hasMultipleSelection} onSelect={() => run(() => store.getState().alignNodes('left'))} />
            <Item icon={AlignHorizontalJustifyCenter} label="Align Center" disabled={!hasMultipleSelection} onSelect={() => run(() => store.getState().alignNodes('center'))} />
            <Item icon={AlignHorizontalJustifyEnd} label="Align Right" disabled={!hasMultipleSelection} onSelect={() => run(() => store.getState().alignNodes('right'))} />
            <Item icon={AlignVerticalJustifyStart} label="Align Top" disabled={!hasMultipleSelection} onSelect={() => run(() => store.getState().alignNodes('top'))} />
            <Item icon={AlignVerticalJustifyCenter} label="Align Middle" disabled={!hasMultipleSelection} onSelect={() => run(() => store.getState().alignNodes('middle'))} />
            <Item icon={AlignVerticalJustifyEnd} label="Align Bottom" disabled={!hasMultipleSelection} onSelect={() => run(() => store.getState().alignNodes('bottom'))} />
          </Command.Group>

          {/* Add Shape */}
          <Command.Group heading="Add Shape" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
            <AddShapeItem icon={Square} type="rectangle" label="Rectangle" run={run} />
            <AddShapeItem icon={Square} type="rounded-rectangle" label="Rounded Rectangle" run={run} />
            <AddShapeItem icon={Circle} type="circle" label="Circle" run={run} />
            <AddShapeItem icon={Diamond} type="diamond" label="Diamond" run={run} />
            <AddShapeItem icon={Triangle} type="triangle" label="Triangle" run={run} />
            <AddShapeItem icon={Type} type="text" label="Text" run={run} />
            <AddShapeItem icon={StickyNote} type="note" label="Note" run={run} />
          </Command.Group>
        </Command.List>
      </div>
    </Command.Dialog>
  )
}

function Item({
  icon: Icon,
  label,
  shortcut,
  disabled,
  onSelect,
}: {
  icon: React.ElementType
  label: string
  shortcut?: string
  disabled?: boolean
  onSelect: () => void
}) {
  return (
    <Command.Item
      disabled={disabled}
      onSelect={onSelect}
      className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer aria-selected:bg-accent aria-disabled:opacity-50 aria-disabled:cursor-default"
    >
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="flex-1">{label}</span>
      {shortcut && (
        <kbd className="ml-auto text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
          {shortcut}
        </kbd>
      )}
    </Command.Item>
  )
}

function AddShapeItem({
  icon: Icon,
  type,
  label,
  run,
}: {
  icon: React.ElementType
  type: ShapeType
  label: string
  run: (action: () => void) => void
}) {
  return (
    <Item
      icon={Icon}
      label={`Add ${label}`}
      onSelect={() => run(() => {
        // Add at center of current viewport
        const store = useEditorStore.getState()
        const centerX = 400
        const centerY = 300
        store.addNode(type, { x: centerX, y: centerY })
      })}
    />
  )
}
