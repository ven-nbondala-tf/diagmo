import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReactFlow } from '@xyflow/react'
import { useEditorStore } from '@/stores/editorStore'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarCheckboxItem,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui'
import { SaveAsTemplateDialog } from './SaveAsTemplateDialog'
import { TemplateGalleryDialog } from './TemplateGalleryDialog'
import { HotkeyCustomizationDialog } from './HotkeyCustomizationDialog'
import { GridSettingsDialog } from './GridSettingsDialog'

interface MenuBarProps {
  diagramName: string
  onSave: () => void
  onExport: (format: 'png' | 'svg' | 'pdf' | 'json') => void
  onExportCode: () => void
  onEmbed: () => void
  onAutoLayout: () => void
  onImport: () => void
  onImportMermaid: () => void
  onImportDrawio: () => void
  onImportTerraform: () => void
  saving: boolean
}

export function MenuBar({ onSave, onExport, onExportCode, onEmbed, onAutoLayout, onImport, onImportMermaid, onImportDrawio, onImportTerraform, saving }: MenuBarProps) {
  const navigate = useNavigate()
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showHotkeyCustomization, setShowHotkeyCustomization] = useState(false)
  const [showGridSettings, setShowGridSettings] = useState(false)
  const [showSaveAsTemplate, setShowSaveAsTemplate] = useState(false)
  const [showTemplateGallery, setShowTemplateGallery] = useState(false)
  const { fitView, zoomIn, zoomOut, getViewport } = useReactFlow()

  // Store actions
  const nodes = useEditorStore((state) => state.nodes)
  const edges = useEditorStore((state) => state.edges)
  const selectedNodes = useEditorStore((state) => state.selectedNodes)
  const undo = useEditorStore((state) => state.undo)
  const redo = useEditorStore((state) => state.redo)
  const past = useEditorStore((state) => state.past)
  const future = useEditorStore((state) => state.future)
  const copyNodes = useEditorStore((state) => state.copyNodes)
  const pasteNodes = useEditorStore((state) => state.pasteNodes)
  const deleteSelected = useEditorStore((state) => state.deleteSelected)
  const selectNodes = useEditorStore((state) => state.selectNodes)
  const selectEdges = useEditorStore((state) => state.selectEdges)
  const clipboard = useEditorStore((state) => state.clipboard)
  const gridEnabled = useEditorStore((state) => state.gridEnabled)
  const snapToGrid = useEditorStore((state) => state.snapToGrid)
  const toggleGrid = useEditorStore((state) => state.toggleGrid)
  const toggleSnapToGrid = useEditorStore((state) => state.toggleSnapToGrid)
  const alignNodes = useEditorStore((state) => state.alignNodes)
  const distributeNodes = useEditorStore((state) => state.distributeNodes)
  const groupNodes = useEditorStore((state) => state.groupNodes)
  const ungroupNodes = useEditorStore((state) => state.ungroupNodes)
  const lockNodes = useEditorStore((state) => state.lockNodes)
  const unlockNodes = useEditorStore((state) => state.unlockNodes)
  const togglePresentationMode = useEditorStore((state) => state.togglePresentationMode)
  const addNode = useEditorStore((state) => state.addNode)

  const hasSelection = selectedNodes.length > 0
  const hasMultipleSelection = selectedNodes.length >= 2
  const hasThreeOrMore = selectedNodes.length >= 3

  const handleSelectAll = () => {
    selectNodes(nodes.map(n => n.id))
    selectEdges(edges.map(e => e.id))
  }

  const handleDuplicate = () => {
    copyNodes()
    pasteNodes()
  }

  // Insert shape at viewport center
  const handleInsertShape = (shapeType: string) => {
    // Get viewport center using React Flow's getViewport
    const { x, y, zoom } = getViewport()
    // Calculate center of viewport in flow coordinates
    // Assuming viewport is roughly 800x600, adjust to flow coordinates
    const viewportWidth = window.innerWidth - 300 // Account for panels
    const viewportHeight = window.innerHeight - 100 // Account for header
    const centerX = (-x + viewportWidth / 2) / zoom
    const centerY = (-y + viewportHeight / 2) / zoom
    addNode(shapeType, { x: centerX, y: centerY })
  }

  return (
    <>
      <Menubar className="border-none rounded-none h-9 px-2 bg-supabase-bg">
        {/* FILE MENU */}
        <MenubarMenu>
          <MenubarTrigger className="font-normal text-sm px-2 text-supabase-text-secondary hover:text-supabase-text-primary data-[state=open]:bg-supabase-bg-tertiary data-[state=open]:text-supabase-text-primary">File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={onSave} disabled={saving}>
              Save
              <MenubarShortcut>Ctrl+S</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={() => setShowSaveAsTemplate(true)}>
              Save as Template...
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={() => setShowTemplateGallery(true)}>
              From Template...
            </MenubarItem>
            <MenubarSeparator />
            <MenubarSub>
              <MenubarSubTrigger>Export</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem onClick={() => onExport('png')}>
                  Export as PNG
                </MenubarItem>
                <MenubarItem onClick={() => onExport('svg')}>
                  Export as SVG
                </MenubarItem>
                <MenubarItem onClick={() => onExport('pdf')}>
                  Export as PDF
                </MenubarItem>
                <MenubarItem onClick={() => onExport('json')}>
                  Export as JSON
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem onClick={onExportCode}>
                  Export as Code...
                </MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSub>
              <MenubarSubTrigger>Import</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem onClick={onImport}>
                  Import from JSON...
                </MenubarItem>
                <MenubarItem onClick={onImportMermaid}>
                  Import from Mermaid...
                </MenubarItem>
                <MenubarItem onClick={onImportDrawio}>
                  Import from Draw.io...
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem onClick={onImportTerraform}>
                  Import from Terraform...
                </MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem onClick={onEmbed}>
              Get Embed Code...
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* EDIT MENU */}
        <MenubarMenu>
          <MenubarTrigger className="font-normal text-sm px-2 text-supabase-text-secondary hover:text-supabase-text-primary data-[state=open]:bg-supabase-bg-tertiary data-[state=open]:text-supabase-text-primary">Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={undo} disabled={past.length === 0}>
              Undo
              <MenubarShortcut>Ctrl+Z</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={redo} disabled={future.length === 0}>
              Redo
              <MenubarShortcut>Ctrl+Y</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={copyNodes} disabled={!hasSelection}>
              Copy
              <MenubarShortcut>Ctrl+C</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={pasteNodes} disabled={clipboard.length === 0}>
              Paste
              <MenubarShortcut>Ctrl+V</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={handleDuplicate} disabled={!hasSelection}>
              Duplicate
              <MenubarShortcut>Ctrl+D</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={deleteSelected} disabled={!hasSelection}>
              Delete
              <MenubarShortcut>Del</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={handleSelectAll}>
              Select All
              <MenubarShortcut>Ctrl+A</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* INSERT MENU */}
        <MenubarMenu>
          <MenubarTrigger className="font-normal text-sm px-2 text-supabase-text-secondary hover:text-supabase-text-primary data-[state=open]:bg-supabase-bg-tertiary data-[state=open]:text-supabase-text-primary">Insert</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => handleInsertShape('table')}>
              Table
            </MenubarItem>
            <MenubarSeparator />
            <MenubarSub>
              <MenubarSubTrigger>Shape</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem onClick={() => handleInsertShape('rectangle')}>Rectangle</MenubarItem>
                <MenubarItem onClick={() => handleInsertShape('rounded-rectangle')}>Rounded Rectangle</MenubarItem>
                <MenubarItem onClick={() => handleInsertShape('circle')}>Circle</MenubarItem>
                <MenubarItem onClick={() => handleInsertShape('ellipse')}>Ellipse</MenubarItem>
                <MenubarItem onClick={() => handleInsertShape('diamond')}>Diamond</MenubarItem>
                <MenubarItem onClick={() => handleInsertShape('triangle')}>Triangle</MenubarItem>
                <MenubarItem onClick={() => handleInsertShape('hexagon')}>Hexagon</MenubarItem>
                <MenubarItem onClick={() => handleInsertShape('star')}>Star</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSub>
              <MenubarSubTrigger>Flowchart</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem onClick={() => handleInsertShape('process')}>Process</MenubarItem>
                <MenubarItem onClick={() => handleInsertShape('decision')}>Decision</MenubarItem>
                <MenubarItem onClick={() => handleInsertShape('terminator')}>Terminator</MenubarItem>
                <MenubarItem onClick={() => handleInsertShape('data')}>Data</MenubarItem>
                <MenubarItem onClick={() => handleInsertShape('document')}>Document</MenubarItem>
                <MenubarItem onClick={() => handleInsertShape('predefined-process')}>Predefined Process</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSub>
              <MenubarSubTrigger>Text & Notes</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem onClick={() => handleInsertShape('text')}>Text</MenubarItem>
                <MenubarItem onClick={() => handleInsertShape('sticky-note')}>Sticky Note</MenubarItem>
                <MenubarItem onClick={() => handleInsertShape('callout')}>Callout</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem onClick={() => handleInsertShape('image')}>
              Image
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* VIEW MENU */}
        <MenubarMenu>
          <MenubarTrigger className="font-normal text-sm px-2 text-supabase-text-secondary hover:text-supabase-text-primary data-[state=open]:bg-supabase-bg-tertiary data-[state=open]:text-supabase-text-primary">View</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem checked={gridEnabled} onClick={toggleGrid}>
              Show Grid
              <MenubarShortcut>Ctrl+'</MenubarShortcut>
            </MenubarCheckboxItem>
            <MenubarCheckboxItem checked={snapToGrid} onClick={toggleSnapToGrid}>
              Snap to Grid
            </MenubarCheckboxItem>
            <MenubarItem onClick={() => setShowGridSettings(true)}>
              Grid Settings...
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={() => fitView({ padding: 0.2 })}>
              Fit to Screen
              <MenubarShortcut>Ctrl+0</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={() => zoomIn()}>
              Zoom In
              <MenubarShortcut>Ctrl++</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={() => zoomOut()}>
              Zoom Out
              <MenubarShortcut>Ctrl+-</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={togglePresentationMode}>
              Present
              <MenubarShortcut>F5</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* ARRANGE MENU */}
        <MenubarMenu>
          <MenubarTrigger className="font-normal text-sm px-2 text-supabase-text-secondary hover:text-supabase-text-primary data-[state=open]:bg-supabase-bg-tertiary data-[state=open]:text-supabase-text-primary">Arrange</MenubarTrigger>
          <MenubarContent>
            <MenubarSub>
              <MenubarSubTrigger disabled={!hasMultipleSelection}>Align</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem onClick={() => alignNodes('left')}>Align Left</MenubarItem>
                <MenubarItem onClick={() => alignNodes('center')}>Align Center</MenubarItem>
                <MenubarItem onClick={() => alignNodes('right')}>Align Right</MenubarItem>
                <MenubarSeparator />
                <MenubarItem onClick={() => alignNodes('top')}>Align Top</MenubarItem>
                <MenubarItem onClick={() => alignNodes('middle')}>Align Middle</MenubarItem>
                <MenubarItem onClick={() => alignNodes('bottom')}>Align Bottom</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSub>
              <MenubarSubTrigger disabled={!hasThreeOrMore}>Distribute</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem onClick={() => distributeNodes('horizontal')}>
                  Distribute Horizontally
                </MenubarItem>
                <MenubarItem onClick={() => distributeNodes('vertical')}>
                  Distribute Vertically
                </MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem onClick={groupNodes} disabled={!hasMultipleSelection}>
              Group
              <MenubarShortcut>Ctrl+G</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={ungroupNodes} disabled={!hasSelection}>
              Ungroup
              <MenubarShortcut>Ctrl+Shift+G</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={lockNodes} disabled={!hasSelection}>
              Lock
              <MenubarShortcut>Ctrl+L</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={unlockNodes} disabled={!hasSelection}>
              Unlock
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={onAutoLayout}>
              Auto Layout...
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* HELP MENU */}
        <MenubarMenu>
          <MenubarTrigger className="font-normal text-sm px-2 text-supabase-text-secondary hover:text-supabase-text-primary data-[state=open]:bg-supabase-bg-tertiary data-[state=open]:text-supabase-text-primary">Help</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => setShowShortcuts(true)}>
              Keyboard Shortcuts
              <MenubarShortcut>?</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={() => setShowHotkeyCustomization(true)}>
              Customize Shortcuts...
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem>
              About Diagmo Pro
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      {/* Shortcuts Dialog */}
      <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <DialogContent className="max-w-lg bg-supabase-bg-secondary border-supabase-border">
          <DialogHeader>
            <DialogTitle className="text-supabase-text-primary">Keyboard Shortcuts</DialogTitle>
            <DialogDescription className="text-supabase-text-muted">
              Quick actions for faster diagramming
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4 text-sm max-h-96 overflow-y-auto">
            {[
              { keys: 'Ctrl + S', desc: 'Save' },
              { keys: 'Ctrl + Z', desc: 'Undo' },
              { keys: 'Ctrl + Y', desc: 'Redo' },
              { keys: 'Ctrl + C', desc: 'Copy' },
              { keys: 'Ctrl + V', desc: 'Paste' },
              { keys: 'Ctrl + D', desc: 'Duplicate' },
              { keys: 'Ctrl + A', desc: 'Select All' },
              { keys: 'Ctrl + G', desc: 'Group' },
              { keys: 'Ctrl + Shift + G', desc: 'Ungroup' },
              { keys: 'Ctrl + L', desc: 'Lock/Unlock' },
              { keys: 'Delete', desc: 'Delete Selected' },
              { keys: "Ctrl + '", desc: 'Toggle Grid' },
              { keys: "Ctrl + Shift + '", desc: 'Toggle Snap to Grid' },
              { keys: 'Double-click', desc: 'Edit shape text' },
            ].map((s, i) => (
              <div key={i} className="flex justify-between py-1 border-b border-supabase-border last:border-0">
                <span className="text-supabase-text-secondary">{s.desc}</span>
                <kbd className="px-2 py-0.5 text-xs bg-supabase-bg-tertiary text-supabase-text-primary rounded font-mono border border-supabase-border">{s.keys}</kbd>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Dialogs */}
      <SaveAsTemplateDialog
        open={showSaveAsTemplate}
        onOpenChange={setShowSaveAsTemplate}
      />
      <TemplateGalleryDialog
        open={showTemplateGallery}
        onOpenChange={setShowTemplateGallery}
      />
      <HotkeyCustomizationDialog
        open={showHotkeyCustomization}
        onOpenChange={setShowHotkeyCustomization}
      />
      <GridSettingsDialog
        open={showGridSettings}
        onOpenChange={setShowGridSettings}
      />
    </>
  )
}
