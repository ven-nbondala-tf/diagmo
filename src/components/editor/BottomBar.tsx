import { useState, useRef, useEffect, useCallback } from 'react'
import { useReactFlow } from '@xyflow/react'
import { useEditorStore } from '@/stores/editorStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { useCollaborationStore } from '@/stores/collaborationStore'
import { collaborationService } from '@/services/collaborationService'
import { pageService } from '@/services/pageService'
import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Slider,
  Label,
  Switch,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from '@/components/ui'
import {
  Plus,
  Copy,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid3X3,
  Map,
  Undo2,
  Redo2,
  Settings,
  Pencil,
} from 'lucide-react'
import { toast } from 'sonner'
import type { DiagramPage, DiagramNode, DiagramEdge } from '@/types'
import { cn } from '@/utils/cn'

interface BottomBarProps {
  diagramId: string
  initialNodes: DiagramNode[]
  initialEdges: DiagramEdge[]
  showMinimap: boolean
  onToggleMinimap: () => void
}

export function BottomBar({ diagramId, initialNodes, initialEdges, showMinimap, onToggleMinimap }: BottomBarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow()

  // Page tabs state
  const [pages, setPages] = useState<DiagramPage[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPageId, setCurrentPageId] = useState<string | null>(null)
  const [editingPageId, setEditingPageId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Editor state
  const nodes = useEditorStore((state) => state.nodes)
  const edges = useEditorStore((state) => state.edges)
  const drawingStrokes = useEditorStore((state) => state.drawingStrokes)
  const loadDiagram = useEditorStore((state) => state.loadDiagram)
  const setDirty = useEditorStore((state) => state.setDirty)
  const zoom = useEditorStore((state) => state.zoom)
  const undo = useEditorStore((state) => state.undo)
  const redo = useEditorStore((state) => state.redo)
  const past = useEditorStore((state) => state.past)
  const future = useEditorStore((state) => state.future)
  const gridEnabled = useEditorStore((state) => state.gridEnabled)
  const toggleGrid = useEditorStore((state) => state.toggleGrid)
  const snapToGrid = useEditorStore((state) => state.snapToGrid)
  const toggleSnapToGrid = useEditorStore((state) => state.toggleSnapToGrid)
  const gridSize = useEditorStore((state) => state.gridSize)
  const setGridSize = useEditorStore((state) => state.setGridSize)
  const drawingMode = useEditorStore((state) => state.drawingMode)
  const toggleDrawingMode = useEditorStore((state) => state.toggleDrawingMode)
  const setDrawingMode = useEditorStore((state) => state.setDrawingMode)
  const setDrawingStrokes = useEditorStore((state) => state.setDrawingStrokes)
  const setStoreCurrentPageId = useEditorStore((state) => state.setCurrentPageId)

  // Collaboration - for broadcasting drawing strokes (use service directly to avoid duplicate hook)
  const isApplyingRemoteChanges = useCollaborationStore((s) => s.isApplyingRemoteChanges)

  // Sync currentPageId to editor store so collaboration can access it
  useEffect(() => {
    setStoreCurrentPageId(currentPageId)
  }, [currentPageId, setStoreCurrentPageId])

  // Accent colors from preferences (persisted)
  const primaryAccentColor = usePreferencesStore((state) => state.primaryAccentColor)
  const setPrimaryAccentColor = usePreferencesStore((state) => state.setPrimaryAccentColor)
  const primaryAccentTextColor = usePreferencesStore((state) => state.primaryAccentTextColor)
  const setPrimaryAccentTextColor = usePreferencesStore((state) => state.setPrimaryAccentTextColor)
  const secondaryAccentColor = usePreferencesStore((state) => state.secondaryAccentColor)
  const setSecondaryAccentColor = usePreferencesStore((state) => state.setSecondaryAccentColor)
  const secondaryAccentTextColor = usePreferencesStore((state) => state.secondaryAccentTextColor)
  const setSecondaryAccentTextColor = usePreferencesStore((state) => state.setSecondaryAccentTextColor)

  // Fetch pages - auto-create Page 1 if no pages exist
  const initializedRef = useRef(false)

  useEffect(() => {
    // Prevent duplicate initialization - set flag IMMEDIATELY before any async work
    // This prevents race conditions with React StrictMode or fast remounts
    if (initializedRef.current) return
    initializedRef.current = true

    async function fetchPages() {
      try {
        const data = await pageService.getPages(diagramId)

        // If no pages exist, try to create Page 1 (only owner can do this)
        if (data.length === 0) {
          // Use the initial diagram data passed as props
          const nodesToUse = initialNodes
          const edgesToUse = initialEdges

          try {
            // Try to create Page 1 with initial diagram content
            const newPage = await pageService.createPage(
              diagramId,
              'Page 1',
              0,
              nodesToUse,
              edgesToUse
            )

            // Load the content into the editor
            loadDiagram(nodesToUse, edgesToUse)
            setPages([newPage])
            setCurrentPageId(newPage.id)
            // Initialize lastSavedStrokesRef with empty strokes
            lastSavedStrokesRef.current = '[]'
          } catch (createErr) {
            // Collaborator can't create pages - just load the initial diagram content
            console.log('Cannot create page (likely collaborator), loading initial content')
            loadDiagram(nodesToUse, edgesToUse)
            // Don't show page tabs for collaborators without page access
            setPages([])
            lastSavedStrokesRef.current = '[]'
          }
        } else {
          setPages(data)
          const firstPage = data[0]
          if (firstPage) {
            setCurrentPageId(firstPage.id)
            // Load first page's nodes and edges
            loadDiagram(firstPage.nodes, firstPage.edges)
            // Load drawing strokes for the first page
            const pageStrokes = firstPage.drawingStrokes || []
            setDrawingStrokes(pageStrokes)
            // Initialize lastSavedStrokesRef to prevent unnecessary auto-save
            lastSavedStrokesRef.current = JSON.stringify(pageStrokes)
          }
        }
      } catch (err) {
        console.error('Failed to load pages:', err)
        // If we can't load pages at all, try to load from initial diagram content
        // This handles collaborators who might have limited access
        loadDiagram(initialNodes, initialEdges)
        setPages([])
        lastSavedStrokesRef.current = '[]'
      } finally {
        setLoading(false)
      }
    }
    fetchPages()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagramId]) // Only run on diagramId change - initialNodes/initialEdges are stable from props

  // Focus input when editing
  useEffect(() => {
    if (editingPageId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingPageId])

  // Auto-save drawing strokes with debounce
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedStrokesRef = useRef<string>('')

  useEffect(() => {
    if (!currentPageId) return

    // Serialize strokes for comparison
    const currentStrokesJson = JSON.stringify(drawingStrokes)

    // Skip if strokes haven't changed
    if (currentStrokesJson === lastSavedStrokesRef.current) return

    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Debounce save - wait 1 second after last change
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await pageService.updatePageContent(currentPageId, nodes, edges, drawingStrokes)
        lastSavedStrokesRef.current = currentStrokesJson
        // Update local pages state
        setPages(prevPages => prevPages.map(p =>
          p.id === currentPageId
            ? { ...p, drawingStrokes }
            : p
        ))
      } catch (err) {
        console.error('Failed to auto-save drawing strokes:', err)
      }
    }, 1000)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [currentPageId, drawingStrokes, nodes, edges])

  // Broadcast drawing stroke changes to collaborators
  const broadcastTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastBroadcastStrokesRef = useRef<string>('')

  useEffect(() => {
    if (!currentPageId) return

    // Serialize strokes for comparison
    const currentStrokesJson = JSON.stringify(drawingStrokes)

    // Skip if we're applying remote changes (avoid broadcast loops)
    // Also update the ref so we don't re-broadcast when the flag clears
    if (isApplyingRemoteChanges) {
      // Update ref to current state without broadcasting
      lastBroadcastStrokesRef.current = currentStrokesJson
      // Clear any pending broadcast since we're receiving remote changes
      if (broadcastTimeoutRef.current) {
        clearTimeout(broadcastTimeoutRef.current)
        broadcastTimeoutRef.current = null
      }
      return
    }

    // Skip if strokes haven't changed since last broadcast
    if (currentStrokesJson === lastBroadcastStrokesRef.current) return

    // Clear any pending broadcast
    if (broadcastTimeoutRef.current) {
      clearTimeout(broadcastTimeoutRef.current)
    }

    // Debounce broadcast - wait 50ms after last change for faster sync
    broadcastTimeoutRef.current = setTimeout(() => {
      // Read fresh state to avoid closure issues
      const currentlyApplyingRemote = useCollaborationStore.getState().isApplyingRemoteChanges
      // Double-check we're not in a remote change state (race condition protection)
      if (currentlyApplyingRemote) {
        lastBroadcastStrokesRef.current = currentStrokesJson
        return
      }
      // Broadcast strokes - the service will handle connection state
      console.log('[BottomBar] Broadcasting strokes - pageId:', currentPageId, 'strokeCount:', drawingStrokes.length)
      collaborationService.broadcastDrawingStrokes(currentPageId, drawingStrokes, 'update')
        .then(() => console.log('[BottomBar] Stroke broadcast sent'))
        .catch(err => console.error('[BottomBar] Stroke broadcast failed:', err))
      lastBroadcastStrokesRef.current = currentStrokesJson
    }, 50)

    return () => {
      if (broadcastTimeoutRef.current) {
        clearTimeout(broadcastTimeoutRef.current)
      }
    }
  }, [currentPageId, drawingStrokes, isApplyingRemoteChanges])

  // Save current page on unmount (when navigating away from editor)
  // Use refs to access latest values without re-running effect
  const currentPageIdRef = useRef(currentPageId)
  const nodesRef = useRef(nodes)
  const edgesRef = useRef(edges)
  const drawingStrokesRef = useRef(drawingStrokes)

  useEffect(() => {
    currentPageIdRef.current = currentPageId
    nodesRef.current = nodes
    edgesRef.current = edges
    drawingStrokesRef.current = drawingStrokes
  }, [currentPageId, nodes, edges, drawingStrokes])

  useEffect(() => {
    return () => {
      // Save current page content when component unmounts
      const pageId = currentPageIdRef.current
      if (pageId) {
        // Fire and forget - don't await since we're unmounting
        pageService.updatePageContent(
          pageId,
          nodesRef.current,
          edgesRef.current,
          drawingStrokesRef.current
        ).catch(err => console.error('Failed to save page on unmount:', err))
      }
    }
  }, []) // Empty deps - only run on unmount

  // Save current page before switching and update local state
  const saveCurrentPage = useCallback(async () => {
    if (!currentPageId) return
    try {
      const updatedPage = await pageService.updatePageContent(currentPageId, nodes, edges, drawingStrokes)
      // Update local pages state with the saved content
      setPages(prevPages => prevPages.map(p =>
        p.id === currentPageId
          ? { ...p, nodes, edges, drawingStrokes }
          : p
      ))
      return updatedPage
    } catch (err) {
      console.error('Failed to save page:', err)
    }
  }, [currentPageId, nodes, edges, drawingStrokes])

  // Switch to a page
  const handlePageClick = async (pageId: string) => {
    if (pageId === currentPageId) return

    // Turn off drawing mode when switching pages
    if (drawingMode) {
      setDrawingMode(false)
    }

    // Cancel any pending auto-save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }

    // Save current page before switching
    await saveCurrentPage()

    // Clear strokes immediately to prevent visual overlap during transition
    setDrawingStrokes([])

    // Fetch fresh page data to ensure we have the latest
    const freshPages = await pageService.getPages(diagramId)
    setPages(freshPages)
    const page = freshPages.find((p) => p.id === pageId)
    if (page) {
      loadDiagram(page.nodes, page.edges)
      // Load page-specific drawing strokes
      const newStrokes = page.drawingStrokes || []
      setDrawingStrokes(newStrokes)
      // Update lastSavedStrokesRef to prevent auto-save from re-saving loaded strokes
      lastSavedStrokesRef.current = JSON.stringify(newStrokes)
      setCurrentPageId(pageId)
    }
  }

  // Add a new page
  const handleAddPage = async () => {
    try {
      // Turn off drawing mode when creating new page
      if (drawingMode) {
        setDrawingMode(false)
      }

      // Cancel any pending auto-save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = null
      }

      await saveCurrentPage()
      const nextOrder = pages.length
      const newPage = await pageService.createPage(
        diagramId,
        `Page ${pages.length + 1}`,
        nextOrder
      )
      setPages([...pages, newPage])
      loadDiagram([], [])
      // Clear drawing strokes for new page
      setDrawingStrokes([])
      // Reset lastSavedStrokesRef for the new empty page
      lastSavedStrokesRef.current = '[]'
      setCurrentPageId(newPage.id)
      setDirty(true)
      toast.success('Page created')
    } catch (err) {
      console.error('Failed to create page:', err)
      toast.error('Failed to create page')
    }
  }

  // Rename functions
  const startRename = (pageId: string, currentName: string) => {
    setEditingPageId(pageId)
    setEditName(currentName)
  }

  const finishRename = async () => {
    if (!editingPageId || !editName.trim()) {
      setEditingPageId(null)
      return
    }
    try {
      await pageService.renamePage(editingPageId, editName.trim())
      setPages(pages.map((p) => p.id === editingPageId ? { ...p, name: editName.trim() } : p))
    } catch (err) {
      toast.error('Failed to rename page')
    }
    setEditingPageId(null)
  }

  // Duplicate a page
  const handleDuplicate = async (page: DiagramPage) => {
    try {
      const duplicated = await pageService.duplicatePage(page)
      setPages([...pages, duplicated])
      toast.success('Page duplicated')
    } catch (err) {
      toast.error('Failed to duplicate page')
    }
  }

  // Delete a page
  const handleDelete = async (pageId: string) => {
    if (pages.length <= 1) {
      toast.error('Cannot delete the only page')
      return
    }
    try {
      // Turn off drawing mode when deleting current page
      if (pageId === currentPageId && drawingMode) {
        setDrawingMode(false)
      }

      // Cancel any pending auto-save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = null
      }

      await pageService.deletePage(pageId)
      const newPages = pages.filter((p) => p.id !== pageId)
      setPages(newPages)
      if (pageId === currentPageId && newPages[0]) {
        loadDiagram(newPages[0].nodes, newPages[0].edges)
        const newStrokes = newPages[0].drawingStrokes || []
        setDrawingStrokes(newStrokes)
        // Update lastSavedStrokesRef for the new current page
        lastSavedStrokesRef.current = JSON.stringify(newStrokes)
        setCurrentPageId(newPages[0].id)
      }
      toast.success('Page deleted')
    } catch (err) {
      toast.error('Failed to delete page')
    }
  }

  const IconButton = ({ icon: Icon, label, onClick, disabled, active }: {
    icon: React.ElementType
    label: string
    onClick?: () => void
    disabled?: boolean
    active?: boolean
  }) => (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        'h-7 w-7 rounded',
        active ? 'text-supabase-text-primary bg-supabase-bg-tertiary' : 'text-supabase-text-muted hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary/50',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
      onClick={onClick}
      disabled={disabled}
      title={label}
    >
      <Icon className="h-3.5 w-3.5" />
    </Button>
  )

  return (
    <div className="fixed bottom-0 left-0 right-0 h-8 bg-supabase-bg-secondary/95 backdrop-blur-md border-t border-supabase-border flex items-center px-2 z-50">
      {/* Page Tabs - After MiniMap space */}
      <div className="flex items-center gap-1 overflow-x-auto flex-shrink-0 ml-[160px] max-w-[calc(100%-400px)]">
        {!loading && pages.length > 0 && pages.map((page) => (
          <ContextMenu key={page.id}>
            <ContextMenuTrigger asChild>
              <button
                className={cn(
                  'relative flex items-center h-7 px-4 text-xs transition-all whitespace-nowrap rounded-md',
                  currentPageId === page.id
                    ? 'font-semibold shadow-sm'
                    : 'text-supabase-text-muted hover:bg-supabase-bg-tertiary/50 hover:text-supabase-text-secondary'
                )}
                style={currentPageId === page.id ? {
                  backgroundColor: primaryAccentColor,
                  color: primaryAccentTextColor,
                } : undefined}
                onClick={() => handlePageClick(page.id)}
                onDoubleClick={() => startRename(page.id, page.name)}
              >
                {editingPageId === page.id ? (
                  <Input
                    ref={inputRef}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={finishRename}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') finishRename()
                      if (e.key === 'Escape') setEditingPageId(null)
                    }}
                    className="h-5 w-20 text-xs px-1 border-none bg-transparent"
                  />
                ) : (
                  <span className="truncate max-w-[100px]">{page.name}</span>
                )}
              </button>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => startRename(page.id, page.name)}>
                Rename
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleDuplicate(page)}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                className="text-destructive"
                onClick={() => handleDelete(page.id)}
                disabled={pages.length <= 1}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}

        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-supabase-text-muted hover:text-supabase-text-primary"
          onClick={handleAddPage}
          title="Add Page"
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>

        <div className="w-px h-4 bg-supabase-border/50 mx-2" />

        {/* Settings */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-supabase-text-muted hover:text-supabase-text-primary"
              title="Page Settings"
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" align="start" className="w-64 p-3">
            <div className="space-y-4">
              {/* Page Tab Color Settings */}
              <div className="space-y-2">
                <h4 className="font-medium text-xs text-supabase-text-primary">Page Tab Color</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { color: '#3ECF8E', name: 'Green' },
                    { color: '#3b82f6', name: 'Blue' },
                    { color: '#8b5cf6', name: 'Purple' },
                    { color: '#f59e0b', name: 'Orange' },
                    { color: '#ef4444', name: 'Red' },
                    { color: '#ec4899', name: 'Pink' },
                    { color: '#14b8a6', name: 'Teal' },
                    { color: '#6b7280', name: 'Gray' },
                  ].map(({ color, name }) => (
                    <button
                      key={color}
                      className={cn(
                        'w-6 h-6 rounded-md transition-all',
                        primaryAccentColor === color
                          ? 'ring-2 ring-offset-2 ring-offset-supabase-bg-secondary ring-white scale-110'
                          : 'hover:scale-105'
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setPrimaryAccentColor(color)}
                      title={name}
                    />
                  ))}
                </div>
                {/* Page Tab Text Color */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-supabase-text-muted">Text:</span>
                  {[
                    { color: '#ffffff', name: 'White' },
                    { color: '#1c1c1c', name: 'Dark' },
                    { color: '#f8fafc', name: 'Light' },
                    { color: '#334155', name: 'Slate' },
                  ].map(({ color, name }) => (
                    <button
                      key={`primary-text-${color}`}
                      className={cn(
                        'w-5 h-5 rounded-md transition-all border border-supabase-border',
                        primaryAccentTextColor === color
                          ? 'ring-2 ring-offset-1 ring-offset-supabase-bg-secondary ring-white scale-110'
                          : 'hover:scale-105'
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setPrimaryAccentTextColor(color)}
                      title={name}
                    />
                  ))}
                </div>
              </div>

              {/* Panel Tab Color Settings */}
              <div className="space-y-2">
                <h4 className="font-medium text-xs text-supabase-text-primary">Panel Tab Color</h4>
                <p className="text-[10px] text-supabase-text-muted">Shapes, Properties panel tabs</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { color: '#8B5CF6', name: 'Purple' },
                    { color: '#3ECF8E', name: 'Green' },
                    { color: '#3b82f6', name: 'Blue' },
                    { color: '#f59e0b', name: 'Orange' },
                    { color: '#ef4444', name: 'Red' },
                    { color: '#ec4899', name: 'Pink' },
                    { color: '#14b8a6', name: 'Teal' },
                    { color: '#6b7280', name: 'Gray' },
                  ].map(({ color, name }) => (
                    <button
                      key={color}
                      className={cn(
                        'w-6 h-6 rounded-md transition-all',
                        secondaryAccentColor === color
                          ? 'ring-2 ring-offset-2 ring-offset-supabase-bg-secondary ring-white scale-110'
                          : 'hover:scale-105'
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setSecondaryAccentColor(color)}
                      title={name}
                    />
                  ))}
                </div>
                {/* Panel Tab Text Color */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-supabase-text-muted">Text:</span>
                  {[
                    { color: '#ffffff', name: 'White' },
                    { color: '#1c1c1c', name: 'Dark' },
                    { color: '#f8fafc', name: 'Light' },
                    { color: '#334155', name: 'Slate' },
                  ].map(({ color, name }) => (
                    <button
                      key={`secondary-text-${color}`}
                      className={cn(
                        'w-5 h-5 rounded-md transition-all border border-supabase-border',
                        secondaryAccentTextColor === color
                          ? 'ring-2 ring-offset-1 ring-offset-supabase-bg-secondary ring-white scale-110'
                          : 'hover:scale-105'
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setSecondaryAccentTextColor(color)}
                      title={name}
                    />
                  ))}
                </div>
              </div>

              <div className="h-px bg-supabase-border" />

              {/* Grid Settings */}
              <div className="space-y-2">
                <h4 className="font-medium text-xs text-supabase-text-primary">Grid Settings</h4>
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-supabase-text-secondary">Show Grid</Label>
                  <Switch checked={gridEnabled} onCheckedChange={toggleGrid} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-supabase-text-secondary">Snap to Grid</Label>
                  <Switch checked={snapToGrid} onCheckedChange={toggleSnapToGrid} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-supabase-text-secondary">Grid Size</Label>
                    <span className="text-xs text-supabase-text-muted">{gridSize}px</span>
                  </div>
                  <Slider
                    value={[gridSize]}
                    onValueChange={(values) => values[0] !== undefined && setGridSize(values[0])}
                    min={5}
                    max={50}
                    step={5}
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex-1" />

      {/* Right side - Undo/Redo and Zoom */}
      <div className="flex items-center gap-1">
        <IconButton
          icon={Undo2}
          label="Undo (Ctrl+Z)"
          onClick={undo}
          disabled={past.length === 0}
        />
        <IconButton
          icon={Redo2}
          label="Redo (Ctrl+Y)"
          onClick={redo}
          disabled={future.length === 0}
        />

        <div className="w-px h-4 bg-supabase-border/50 mx-1" />

        <IconButton
          icon={Pencil}
          label="Drawing Mode (D)"
          onClick={toggleDrawingMode}
          active={drawingMode}
        />
        <IconButton
          icon={Grid3X3}
          label="Toggle Grid"
          onClick={toggleGrid}
          active={gridEnabled}
        />
        <IconButton
          icon={Map}
          label="Toggle Minimap"
          onClick={onToggleMinimap}
          active={showMinimap}
        />

        <div className="w-px h-4 bg-supabase-border/50 mx-1" />

        <IconButton icon={ZoomOut} label="Zoom Out" onClick={() => zoomOut()} />
        <span className="text-xs text-supabase-text-muted w-10 text-center font-medium">
          {Math.round(zoom * 100)}%
        </span>
        <IconButton icon={ZoomIn} label="Zoom In" onClick={() => zoomIn()} />
        <IconButton icon={Maximize2} label="Fit to Screen" onClick={() => fitView()} />
      </div>
    </div>
  )
}
