import { useState, useMemo } from 'react'
import { DIAGRAM_TEMPLATES, TEMPLATE_CATEGORIES, type DiagramTemplate } from '@/constants/templates'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  ScrollArea,
} from '@/components/ui'
import { cn } from '@/utils'
import { FileText, Cloud, GitBranch, Network, Box, LayoutGrid } from 'lucide-react'

interface TemplateGalleryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectTemplate: (template: DiagramTemplate) => void
  isLoading?: boolean
}

const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case 'architecture':
      return <Cloud className="h-4 w-4" />
    case 'flowchart':
      return <GitBranch className="h-4 w-4" />
    case 'network':
      return <Network className="h-4 w-4" />
    case 'uml':
      return <Box className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

const TemplatePreview = ({ template }: { template: DiagramTemplate }) => {
  // Create a simple preview visualization
  const nodeCount = template.nodes.length
  const edgeCount = template.edges.length

  // Generate preview dots based on node positions (normalized)
  const previewNodes = template.nodes.slice(0, 8).map((node, i) => {
    // Normalize positions to 0-100 range
    const maxX = Math.max(...template.nodes.map(n => n.position.x + (n.width || 100)))
    const maxY = Math.max(...template.nodes.map(n => n.position.y + (n.height || 80)))
    const x = maxX > 0 ? (node.position.x / maxX) * 80 + 10 : 50
    const y = maxY > 0 ? (node.position.y / maxY) * 60 + 20 : 50
    return { x, y, id: i }
  })

  if (template.id === 'blank') {
    return (
      <div className="w-full h-24 bg-muted/50 rounded border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
        <LayoutGrid className="h-8 w-8 text-muted-foreground/50" />
      </div>
    )
  }

  return (
    <div className="w-full h-24 bg-gradient-to-br from-muted/30 to-muted/60 rounded border relative overflow-hidden">
      <svg className="absolute inset-0 w-full h-full">
        {/* Draw simplified edges */}
        {template.edges.slice(0, 10).map((edge, i) => {
          const sourceNode = previewNodes.find((_, idx) =>
            template.nodes[idx]?.id === edge.source
          )
          const targetNode = previewNodes.find((_, idx) =>
            template.nodes[idx]?.id === edge.target
          )
          if (sourceNode && targetNode) {
            return (
              <line
                key={i}
                x1={`${sourceNode.x}%`}
                y1={`${sourceNode.y}%`}
                x2={`${targetNode.x}%`}
                y2={`${targetNode.y}%`}
                stroke="#9ca3af"
                strokeWidth="1"
                strokeOpacity="0.5"
              />
            )
          }
          return null
        })}
        {/* Draw nodes as dots */}
        {previewNodes.map((node) => (
          <circle
            key={node.id}
            cx={`${node.x}%`}
            cy={`${node.y}%`}
            r="4"
            fill="#6b7280"
            opacity="0.7"
          />
        ))}
      </svg>
      {/* Node/Edge count badge */}
      <div className="absolute bottom-1 right-1 text-[10px] text-muted-foreground bg-background/80 px-1 rounded">
        {nodeCount} nodes, {edgeCount} edges
      </div>
    </div>
  )
}

export function TemplateGallery({
  open,
  onOpenChange,
  onSelectTemplate,
  isLoading
}: TemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTemplate, setSelectedTemplate] = useState<DiagramTemplate | null>(null)

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === 'all') {
      return DIAGRAM_TEMPLATES
    }
    return DIAGRAM_TEMPLATES.filter(t => t.category === selectedCategory)
  }, [selectedCategory])

  const handleSelect = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Diagram</DialogTitle>
          <DialogDescription>
            Choose a template to get started quickly, or start with a blank canvas
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 gap-4 min-h-0">
          {/* Category sidebar */}
          <div className="w-48 flex-shrink-0">
            <nav className="space-y-1">
              {TEMPLATE_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    selectedCategory === category.id && 'bg-accent text-accent-foreground font-medium'
                  )}
                >
                  {category.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Templates grid */}
          <ScrollArea className="flex-1 -mr-4 pr-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={cn(
                    'text-left p-3 rounded-lg border-2 transition-all',
                    'hover:border-primary/50 hover:shadow-sm',
                    selectedTemplate?.id === template.id
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-transparent bg-card'
                  )}
                >
                  <TemplatePreview template={template} />
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <CategoryIcon category={template.category} />
                      <h3 className="font-medium text-sm">{template.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedTemplate ? (
              <span>
                Selected: <strong>{selectedTemplate.name}</strong>
              </span>
            ) : (
              <span>Select a template to continue</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSelect}
              disabled={!selectedTemplate || isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Diagram'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
