import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEditorStore } from '@/stores/editorStore'
import { useCollaborationStore } from '@/stores/collaborationStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { useUpdateDiagram } from '@/hooks'
import { exportService } from '@/services/exportService'
import { collaborationService } from '@/services/collaborationService'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import type { Diagram, DiagramNode, DiagramEdge } from '@/types'
import { PresenceIndicators } from './PresenceIndicators'
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
  Share2,
  Activity,
  ClipboardList,
} from 'lucide-react'
import { AUTO_SAVE_INTERVAL } from '@/constants'
import { toast } from 'sonner'
import { MenuBar } from './MenuBar'
import { CommandPalette } from './CommandPalette'
import { FormattingToolbar } from './FormattingToolbar'
import { ImportMermaidDialog } from './ImportMermaidDialog'
import { ImportDrawioDialog } from './ImportDrawioDialog'
import { ImportTerraformDialog } from './ImportTerraformDialog'
import { ExportCodeDialog } from './ExportCodeDialog'
import { CodeGenerationDialog } from './CodeGenerationDialog'
import { EmbedDialog } from './EmbedDialog'
import { AutoLayoutDialog } from './AutoLayoutDialog'
import { ShareDialog } from './ShareDialog'
import { DiagramActivityButton } from './DiagramActivityButton'
import { DiagramCompareDialog } from './DiagramCompareDialog'
import { DocumentationEditor } from './DocumentationEditor'
import { PerformancePanel } from './PerformancePanel'
import { AuditLogPanel } from './AuditLogPanel'
import { BranchSelector } from './BranchSelector'

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
  const [showMermaidImport, setShowMermaidImport] = useState(false)
  const [showDrawioImport, setShowDrawioImport] = useState(false)
  const [showTerraformImport, setShowTerraformImport] = useState(false)
  const [showCodeExport, setShowCodeExport] = useState(false)
  const [showInfraCodeGen, setShowInfraCodeGen] = useState(false)
  const [showEmbed, setShowEmbed] = useState(false)
  const [showAutoLayout, setShowAutoLayout] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showCompareVersions, setShowCompareVersions] = useState(false)
  const [showDocumentation, setShowDocumentation] = useState(false)
  const [showPerformance, setShowPerformance] = useState(false)
  const [showAuditLog, setShowAuditLog] = useState(false)
  const [currentBranchId, setCurrentBranchId] = useState<string | undefined>(undefined)

  const nodes = useEditorStore((state) => state.nodes)
  const edges = useEditorStore((state) => state.edges)
  const isDirty = useEditorStore((state) => state.isDirty)
  const setDirty = useEditorStore((state) => state.setDirty)
  const zoom = useEditorStore((state) => state.zoom)

  // Collaboration presence and status
  const collaborators = useCollaborationStore((state) => state.collaborators)
  const connectionStatus = useCollaborationStore((state) => state.connectionStatus)

  // Accent colors from preferences
  const secondaryAccentColor = usePreferencesStore((state) => state.secondaryAccentColor)
  const secondaryAccentTextColor = usePreferencesStore((state) => state.secondaryAccentTextColor)

  const updateDiagram = useUpdateDiagram()

  // Silent save for auto-save (no toast)
  const handleAutoSave = useCallback(async () => {
    if (!isDirty || saving) return

    setSaving(true)
    try {
      // Skip thumbnail for auto-save to reduce overhead
      await updateDiagram.mutateAsync({
        id: diagram.id,
        name,
        nodes,
        edges,
      })
      setDirty(false)
      setLastSaved(new Date())

      // Broadcast changes to collaborators
      await collaborationService.broadcastDiagramChange(nodes, edges)
      // No toast for auto-save - silent
    } catch (error) {
      console.error('Auto-save failed:', error)
      // Only log, don't show error toast for auto-save
    } finally {
      setSaving(false)
    }
  }, [diagram.id, name, nodes, edges, isDirty, saving, updateDiagram, setDirty])

  // Manual save with toast feedback
  const handleSave = useCallback(async () => {
    if (!isDirty && name === diagram.name) return

    setSaving(true)
    try {
      // Generate thumbnail for manual save
      let thumbnail: string | undefined
      const wrapperEl = document.querySelector('.react-flow') as HTMLElement
      if (wrapperEl && nodes.length > 0) {
        try {
          thumbnail = await exportService.generateThumbnail(wrapperEl, nodes)
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

      // Broadcast changes to collaborators
      await collaborationService.broadcastDiagramChange(nodes, edges)

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

    const wrapperEl = document.querySelector('.react-flow') as HTMLElement
    if (!wrapperEl || nodes.length === 0) {
      toast.error('Failed to export: canvas not found or empty')
      return
    }

    try {
      toast.loading('Exporting full diagram...')

      // Use the full diagram export methods
      switch (format) {
        case 'png': {
          const dataUrl = await exportService.exportFullDiagramToPng(wrapperEl, nodes)
          exportService.downloadFile(dataUrl, `${name}.png`)
          break
        }
        case 'svg': {
          const dataUrl = await exportService.exportFullDiagramToSvg(wrapperEl, nodes)
          exportService.downloadFile(dataUrl, `${name}.svg`)
          break
        }
        case 'pdf': {
          const blob = await exportService.exportFullDiagramToPdf(wrapperEl, nodes)
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

  // Auto-save (silent - no toast)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isDirty) {
        handleAutoSave()
      }
    }, AUTO_SAVE_INTERVAL)

    return () => clearInterval(interval)
  }, [isDirty, handleAutoSave])

  // Handle branch change
  const handleBranchChange = useCallback((branchId: string, branchNodes: unknown[], branchEdges: unknown[]) => {
    setCurrentBranchId(branchId)
    // Import the diagram from the branch
    useEditorStore.getState().importDiagram(
      branchNodes as DiagramNode[],
      branchEdges as DiagramEdge[]
    )
  }, [])

  // Handle merge request
  const handleMergeRequest = useCallback((sourceBranchId: string, targetBranchId: string) => {
    // Open compare dialog for merge preview
    setShowCompareVersions(true)
    toast.info(`Merging ${sourceBranchId} into ${targetBranchId}...`)
  }, [])

  // Centralized keyboard shortcuts (save + show shortcuts dialog are header-specific)
  const shortcutCallbacks = useMemo(() => ({
    onSave: handleSave,
    onShowShortcuts: () => setShowShortcuts(true),
  }), [handleSave])
  useKeyboardShortcuts(shortcutCallbacks)

  return (
    <>
      <header className="border-b border-supabase-border bg-supabase-bg flex flex-col relative z-50">
        {/* Menu Bar */}
        <MenuBar
          diagramName={name}
          onSave={handleSave}
          onExport={handleExport}
          onExportCode={() => setShowCodeExport(true)}
          onGenerateInfraCode={() => setShowInfraCodeGen(true)}
          onEmbed={() => setShowEmbed(true)}
          onAutoLayout={() => setShowAutoLayout(true)}
          onImport={handleImport}
          onImportMermaid={() => setShowMermaidImport(true)}
          onImportDrawio={() => setShowDrawioImport(true)}
          onImportTerraform={() => setShowTerraformImport(true)}
          onCompareVersions={() => setShowCompareVersions(true)}
          onDocumentation={() => setShowDocumentation(true)}
          saving={saving}
        />

        {/* Status Bar - Lucidchart style */}
        <div className="h-9 flex items-center px-3 gap-2 border-t border-supabase-border bg-supabase-bg-secondary">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Back to Dashboard</TooltipContent>
          </Tooltip>

          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSave}
            className="max-w-[180px] h-7 text-sm font-medium bg-transparent border-none text-supabase-text-primary focus:bg-supabase-bg-tertiary"
          />

          {/* Save status indicator */}
          {saving ? (
            <span className="text-xs text-supabase-text-muted flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
            </span>
          ) : isDirty ? (
            <span className="text-xs text-yellow-500" title="Unsaved changes">●</span>
          ) : (
            <span className="text-xs text-supabase-green" title="All changes saved">
              <Check className="h-3 w-3" />
            </span>
          )}

          {/* Separator */}
          <div className="h-4 w-px bg-supabase-border mx-1" />

          {/* Branch Selector */}
          <BranchSelector
            diagramId={diagram.id}
            currentBranchId={currentBranchId}
            onBranchChange={handleBranchChange}
            onMergeRequest={handleMergeRequest}
          />

          <div className="flex-1" />

          {/* Connection status indicator */}
          {connectionStatus !== 'connected' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-supabase-bg-tertiary text-xs">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      connectionStatus === 'connecting'
                        ? 'bg-blue-500 animate-pulse'
                        : connectionStatus === 'reconnecting'
                        ? 'bg-yellow-500 animate-pulse'
                        : 'bg-red-500'
                    }`}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {connectionStatus === 'connecting'
                  ? 'Connecting to collaboration server'
                  : connectionStatus === 'reconnecting'
                  ? 'Reconnecting...'
                  : 'Disconnected'}
              </TooltipContent>
            </Tooltip>
          )}

          {/* Collaboration presence indicators */}
          <PresenceIndicators collaborators={collaborators} />

          {/* Performance Monitor button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary"
                onClick={() => setShowPerformance(true)}
              >
                <Activity className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Performance Monitor</TooltipContent>
          </Tooltip>

          {/* Audit Log button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary"
                onClick={() => setShowAuditLog(true)}
              >
                <ClipboardList className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Audit Log</TooltipContent>
          </Tooltip>

          {/* Activity button */}
          <DiagramActivityButton />

          {/* Share button - uses secondary accent color */}
          <Button
            size="sm"
            className="h-7 gap-1.5 font-medium shadow-sm hover:opacity-90"
            style={{ backgroundColor: secondaryAccentColor, color: secondaryAccentTextColor }}
            onClick={() => setShowShare(true)}
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>
        </div>

        {/* Formatting Toolbar - Like Lucidchart */}
        <FormattingToolbar />
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

      {/* Mermaid Import Dialog */}
      <ImportMermaidDialog
        open={showMermaidImport}
        onOpenChange={setShowMermaidImport}
      />

      {/* Draw.io Import Dialog */}
      <ImportDrawioDialog
        open={showDrawioImport}
        onOpenChange={setShowDrawioImport}
      />

      {/* Terraform Import Dialog */}
      <ImportTerraformDialog
        open={showTerraformImport}
        onOpenChange={setShowTerraformImport}
      />

      {/* Export Code Dialog */}
      <ExportCodeDialog
        open={showCodeExport}
        onOpenChange={setShowCodeExport}
      />

      {/* Code Generation Dialog */}
      <CodeGenerationDialog
        open={showInfraCodeGen}
        onOpenChange={setShowInfraCodeGen}
      />

      {/* Embed Dialog */}
      <EmbedDialog
        open={showEmbed}
        onOpenChange={setShowEmbed}
        diagramId={diagram.id}
        diagramName={name}
      />

      {/* Auto Layout Dialog */}
      <AutoLayoutDialog
        open={showAutoLayout}
        onOpenChange={setShowAutoLayout}
      />

      {/* Share Dialog */}
      <ShareDialog
        open={showShare}
        onOpenChange={setShowShare}
        diagramId={diagram.id}
        diagramName={name}
      />

      {/* Compare Versions Dialog */}
      <DiagramCompareDialog
        open={showCompareVersions}
        onOpenChange={setShowCompareVersions}
        diagramId={diagram.id}
      />

      {/* Documentation Editor */}
      <DocumentationEditor
        open={showDocumentation}
        onOpenChange={setShowDocumentation}
        diagramId={diagram.id}
        diagramName={name}
      />

      {/* Performance Panel */}
      <PerformancePanel
        open={showPerformance}
        onOpenChange={setShowPerformance}
      />

      {/* Audit Log Panel */}
      <AuditLogPanel
        open={showAuditLog}
        onOpenChange={setShowAuditLog}
        resourceId={diagram.id}
        resourceType="diagram"
      />
    </>
  )
}
