import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Input,
} from '@/components/ui'
import { Search, FileText, Trash2, Loader2, Clock, Users } from 'lucide-react'
import { templateService, TEMPLATE_CATEGORIES } from '@/services/templateService'
import { useEditorStore } from '@/stores/editorStore'
import type { DiagramTemplate } from '@/types'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'

interface TemplateGalleryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TemplateGalleryDialog({ open, onOpenChange }: TemplateGalleryDialogProps) {
  const [templates, setTemplates] = useState<DiagramTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('All')
  const [filter, setFilter] = useState<'all' | 'mine' | 'public'>('all')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [applying, setApplying] = useState<string | null>(null)

  const setNodes = useEditorStore((state) => state.setNodes)
  const setEdges = useEditorStore((state) => state.setEdges)
  const setLayers = useEditorStore((state) => state.setLayers)

  const loadTemplates = useCallback(async () => {
    setLoading(true)
    try {
      let data: DiagramTemplate[]
      if (filter === 'mine') {
        data = await templateService.getMyTemplates()
      } else if (filter === 'public') {
        data = await templateService.getPublicTemplates()
      } else {
        data = await templateService.getTemplates()
      }
      setTemplates(data)
    } catch (error) {
      console.error('Failed to load templates:', error)
      toast.error('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    if (open) {
      loadTemplates()
    }
  }, [open, loadTemplates])

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      search === '' ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description?.toLowerCase() || '').includes(search.toLowerCase())
    const matchesCategory = category === 'All' || t.category === category
    return matchesSearch && matchesCategory
  })

  const handleApplyTemplate = async (template: DiagramTemplate) => {
    setApplying(template.id)
    try {
      // Generate new IDs for nodes to avoid conflicts
      const idMap = new Map<string, string>()
      const newNodes = template.nodes.map((node) => {
        const newId = `${node.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        idMap.set(node.id, newId)
        return { ...node, id: newId }
      })

      // Helper to determine best handles based on relative node positions
      const getOptimalHandles = (sourceNode: typeof newNodes[0], targetNode: typeof newNodes[0]) => {
        const dx = targetNode.position.x - sourceNode.position.x
        const dy = targetNode.position.y - sourceNode.position.y

        // Determine primary direction (horizontal or vertical)
        if (Math.abs(dx) > Math.abs(dy)) {
          // Horizontal flow
          return dx > 0
            ? { sourceHandle: 'right', targetHandle: 'left' }
            : { sourceHandle: 'left', targetHandle: 'right' }
        } else {
          // Vertical flow
          return dy > 0
            ? { sourceHandle: 'bottom', targetHandle: 'top' }
            : { sourceHandle: 'top', targetHandle: 'bottom' }
        }
      }

      // Update edge source/target references with optimal handles
      const newEdges = template.edges.map((edge) => {
        const sourceNode = newNodes.find(n => n.id === (idMap.get(edge.source) || edge.source))
        const targetNode = newNodes.find(n => n.id === (idMap.get(edge.target) || edge.target))

        // Use template-specified handles or auto-calculate based on positions
        let sourceHandle = edge.sourceHandle
        let targetHandle = edge.targetHandle

        if (!sourceHandle || !targetHandle) {
          if (sourceNode && targetNode) {
            const optimal = getOptimalHandles(sourceNode, targetNode)
            sourceHandle = sourceHandle || optimal.sourceHandle
            targetHandle = targetHandle || optimal.targetHandle
          }
        }

        return {
          ...edge,
          id: `${edge.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          source: idMap.get(edge.source) || edge.source,
          target: idMap.get(edge.target) || edge.target,
          sourceHandle,
          targetHandle,
        }
      })

      // Apply to editor
      setNodes(newNodes)
      setEdges(newEdges)
      if (template.layers && template.layers.length > 0) {
        setLayers(template.layers)
      }

      // Increment use count
      await templateService.incrementUseCount(template.id)

      toast.success(`Applied template: ${template.name}`)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to apply template:', error)
      toast.error('Failed to apply template')
    } finally {
      setApplying(null)
    }
  }

  const handleDeleteTemplate = async (template: DiagramTemplate, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`Delete template "${template.name}"?`)) return

    setDeleting(template.id)
    try {
      await templateService.deleteTemplate(template.id)
      setTemplates((prev) => prev.filter((t) => t.id !== template.id))
      toast.success('Template deleted')
    } catch (error) {
      console.error('Failed to delete template:', error)
      toast.error('Failed to delete template')
    } finally {
      setDeleting(null)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Template Gallery
          </DialogTitle>
          <DialogDescription>
            Browse and apply diagram templates to your canvas.
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 py-3 border-b">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="pl-9"
            />
          </div>

          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 px-3 text-sm border rounded-md bg-background"
          >
            <option value="All">All Categories</option>
            {TEMPLATE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Filter tabs */}
          <div className="flex gap-1 p-1 bg-muted rounded-md">
            {[
              { value: 'all', label: 'All' },
              { value: 'mine', label: 'My Templates' },
              { value: 'public', label: 'Public' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value as 'all' | 'mine' | 'public')}
                className={cn(
                  'px-3 py-1.5 text-sm rounded transition-colors',
                  filter === f.value
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mb-3 opacity-50" />
              <p>No templates found</p>
              {filter === 'mine' && (
                <p className="text-sm mt-1">
                  Save your first template from File → Save as Template
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleApplyTemplate(template)}
                  className={cn(
                    'group relative border rounded-lg p-4 cursor-pointer transition-all',
                    'hover:border-primary hover:shadow-md',
                    applying === template.id && 'opacity-70 pointer-events-none'
                  )}
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-muted rounded-md mb-3 overflow-hidden flex items-center justify-center">
                    {template.thumbnail ? (
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileText className="w-8 h-8 text-muted-foreground/50" />
                    )}
                  </div>

                  {/* Info */}
                  <h4 className="font-medium text-sm truncate">{template.name}</h4>
                  {template.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="px-1.5 py-0.5 bg-muted rounded">
                      {template.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(template.createdAt)}
                    </span>
                    {template.isPublic && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {template.useCount}
                      </span>
                    )}
                  </div>

                  {/* Delete button (only for own templates) */}
                  <button
                    onClick={(e) => handleDeleteTemplate(template, e)}
                    className={cn(
                      'absolute top-2 right-2 p-1.5 rounded opacity-0 group-hover:opacity-100',
                      'bg-destructive/10 text-destructive hover:bg-destructive/20',
                      'transition-opacity'
                    )}
                    title="Delete template"
                  >
                    {deleting === template.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>

                  {/* Applying overlay */}
                  {applying === template.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
