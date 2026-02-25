import { useState, useRef, useEffect } from 'react'
import { useEditorStore } from '@/stores/editorStore'
import { pageService } from '@/services/pageService'
import {
  Button,
  Input,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from '@/components/ui'
import { Plus, Copy, Trash2, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import type { DiagramPage } from '@/types'

interface PageTabsProps {
  diagramId: string
}

export function PageTabs({ diagramId }: PageTabsProps) {
  const [pages, setPages] = useState<DiagramPage[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPageId, setCurrentPageId] = useState<string | null>(null)
  const [editingPageId, setEditingPageId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const nodes = useEditorStore((state) => state.nodes)
  const edges = useEditorStore((state) => state.edges)
  const drawingStrokes = useEditorStore((state) => state.drawingStrokes)
  const loadDiagram = useEditorStore((state) => state.loadDiagram)
  const setDrawingStrokes = useEditorStore((state) => state.setDrawingStrokes)
  const setDirty = useEditorStore((state) => state.setDirty)

  // Fetch pages
  useEffect(() => {
    async function fetchPages() {
      try {
        const data = await pageService.getPages(diagramId)
        setPages(data)
        // If no pages exist, we're on the "main" diagram (backward compatible)
        if (data.length > 0 && !currentPageId) {
          const firstPage = data[0]
          setCurrentPageId(firstPage?.id || null)
          // Also load drawing strokes for the first page
          if (firstPage?.drawingStrokes) {
            setDrawingStrokes(firstPage.drawingStrokes)
          }
        }
      } catch (err) {
        console.error('Failed to load pages:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPages()
  }, [diagramId, setDrawingStrokes])

  // Focus input when editing
  useEffect(() => {
    if (editingPageId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingPageId])

  // Save current page before switching (including drawing strokes)
  const saveCurrentPage = async () => {
    if (!currentPageId) return
    try {
      await pageService.updatePageContent(currentPageId, nodes, edges, drawingStrokes)
    } catch (err) {
      console.error('Failed to save page:', err)
    }
  }

  // Switch to a page
  const handlePageClick = async (pageId: string) => {
    if (pageId === currentPageId) return

    // Save current page first (including drawing strokes)
    await saveCurrentPage()

    // Load the new page (including drawing strokes)
    const page = pages.find((p) => p.id === pageId)
    if (page) {
      loadDiagram(page.nodes, page.edges)
      setDrawingStrokes(page.drawingStrokes || [])
      setCurrentPageId(pageId)
    }
  }

  // Add a new page
  const handleAddPage = async () => {
    try {
      // Save current page first (including drawing strokes)
      await saveCurrentPage()

      const nextOrder = pages.length
      const newPage = await pageService.createPage(
        diagramId,
        `Page ${pages.length + 1}`,
        nextOrder
      )
      setPages([...pages, newPage])

      // Switch to the new page (clear everything including drawing strokes)
      loadDiagram([], [])
      setDrawingStrokes([])
      setCurrentPageId(newPage.id)
      setDirty(true)
      toast.success('Page created')
    } catch (err) {
      console.error('Failed to create page:', err)
      toast.error('Failed to create page')
    }
  }

  // Rename a page
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
      setPages(
        pages.map((p) =>
          p.id === editingPageId ? { ...p, name: editName.trim() } : p
        )
      )
    } catch (err) {
      console.error('Failed to rename page:', err)
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
      console.error('Failed to duplicate page:', err)
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
      await pageService.deletePage(pageId)
      const newPages = pages.filter((p) => p.id !== pageId)
      setPages(newPages)

      // If we deleted the current page, switch to another (including drawing strokes)
      if (pageId === currentPageId && newPages[0]) {
        loadDiagram(newPages[0].nodes, newPages[0].edges)
        setDrawingStrokes(newPages[0].drawingStrokes || [])
        setCurrentPageId(newPages[0].id)
      }
      toast.success('Page deleted')
    } catch (err) {
      console.error('Failed to delete page:', err)
      toast.error('Failed to delete page')
    }
  }

  // If no pages (backward compatible with existing diagrams)
  if (loading || pages.length === 0) {
    return null
  }

  return (
    <div className="h-8 bg-muted/30 border-t flex items-center px-2 gap-1 overflow-x-auto">
      {pages.map((page) => (
        <ContextMenu key={page.id}>
          <ContextMenuTrigger asChild>
            <button
              className={`
                flex items-center gap-1 h-6 px-2 text-xs rounded-t
                border border-b-0 min-w-[60px] max-w-[120px]
                transition-colors
                ${
                  currentPageId === page.id
                    ? 'bg-background border-border text-foreground'
                    : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
                }
              `}
              onClick={() => handlePageClick(page.id)}
              onDoubleClick={() => startRename(page.id, page.name)}
            >
              <GripVertical className="w-3 h-3 opacity-30 flex-shrink-0 cursor-grab" />
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
                  className="h-5 w-full text-xs px-1 border-none bg-transparent"
                />
              ) : (
                <span className="truncate">{page.name}</span>
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
        className="h-6 w-6 p-0 ml-1"
        onClick={handleAddPage}
        title="Add Page"
      >
        <Plus className="w-3.5 h-3.5" />
      </Button>
    </div>
  )
}
