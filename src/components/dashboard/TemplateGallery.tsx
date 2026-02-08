import { useState, useMemo, useCallback } from 'react'
import { DIAGRAM_TEMPLATES, TEMPLATE_CATEGORIES, type DiagramTemplate } from '@/constants/templates'
import {
  ARCHITECTURE_TEMPLATES,
  ARCHITECTURE_TEMPLATE_CATEGORIES,
} from '@/constants/architectureTemplates'
import type { ArchitectureTemplate, TemplateCategory } from '@/types'
import { TemplateVariablesDialog } from './TemplateVariablesDialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  ScrollArea,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Badge,
} from '@/components/ui'
import { cn } from '@/utils'
import {
  FileText,
  Cloud,
  GitBranch,
  Network,
  Box,
  LayoutGrid,
  Search,
  X,
  Zap,
  Database,
  Shield,
  Cpu,
  Brain,
  Container,
  Globe,
} from 'lucide-react'

interface TemplateGalleryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectTemplate: (template: DiagramTemplate | ArchitectureTemplate) => void
  isLoading?: boolean
}

// Icon mapping for architecture categories
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'aws':
    case 'azure':
    case 'gcp':
    case 'multi-cloud':
      return <Cloud className="h-4 w-4" />
    case 'web-app':
      return <Globe className="h-4 w-4" />
    case 'data-analytics':
      return <Database className="h-4 w-4" />
    case 'iot':
      return <Cpu className="h-4 w-4" />
    case 'ai-ml':
      return <Brain className="h-4 w-4" />
    case 'devops':
      return <GitBranch className="h-4 w-4" />
    case 'security':
      return <Shield className="h-4 w-4" />
    case 'networking':
      return <Network className="h-4 w-4" />
    case 'containers':
      return <Container className="h-4 w-4" />
    case 'serverless':
      return <Zap className="h-4 w-4" />
    case 'uml':
      return <Box className="h-4 w-4" />
    case 'flowchart':
      return <GitBranch className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

// Complexity badge colors
const getComplexityColor = (complexity: string) => {
  switch (complexity) {
    case 'beginner':
      return 'bg-green-500/10 text-green-600 border-green-500/20'
    case 'intermediate':
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
    case 'advanced':
      return 'bg-red-500/10 text-red-600 border-red-500/20'
    default:
      return 'bg-gray-500/10 text-gray-600 border-gray-500/20'
  }
}

// Provider badge colors
const getProviderColor = (category: TemplateCategory) => {
  switch (category) {
    case 'aws':
      return 'bg-orange-500/10 text-orange-600 border-orange-500/20'
    case 'azure':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
    case 'gcp':
      return 'bg-red-500/10 text-red-600 border-red-500/20'
    case 'multi-cloud':
      return 'bg-purple-500/10 text-purple-600 border-purple-500/20'
    default:
      return ''
  }
}

const BasicTemplatePreview = ({ template }: { template: DiagramTemplate }) => {
  const nodeCount = template.nodes.length
  const edgeCount = template.edges.length

  const previewNodes = template.nodes.slice(0, 8).map((node, i) => {
    const maxX = Math.max(...template.nodes.map(n => n.position.x + (n.width || 100)), 1)
    const maxY = Math.max(...template.nodes.map(n => n.position.y + (n.height || 80)), 1)
    const x = (node.position.x / maxX) * 80 + 10
    const y = (node.position.y / maxY) * 60 + 20
    return { x, y, id: i }
  })

  if (template.id === 'blank') {
    return (
      <div className="w-full h-24 bg-supabase-bg-tertiary rounded border-2 border-dashed border-supabase-border flex items-center justify-center">
        <LayoutGrid className="h-8 w-8 text-supabase-text-muted" />
      </div>
    )
  }

  return (
    <div className="w-full h-24 bg-gradient-to-br from-supabase-bg-secondary to-supabase-bg-tertiary rounded border border-supabase-border relative overflow-hidden">
      <svg className="absolute inset-0 w-full h-full">
        {template.edges.slice(0, 10).map((edge, i) => {
          const sourceNode = previewNodes.find((_, idx) => template.nodes[idx]?.id === edge.source)
          const targetNode = previewNodes.find((_, idx) => template.nodes[idx]?.id === edge.target)
          if (sourceNode && targetNode) {
            return (
              <line
                key={i}
                x1={`${sourceNode.x}%`}
                y1={`${sourceNode.y}%`}
                x2={`${targetNode.x}%`}
                y2={`${targetNode.y}%`}
                stroke="currentColor"
                className="text-supabase-text-muted"
                strokeWidth="1"
                strokeOpacity="0.3"
              />
            )
          }
          return null
        })}
        {previewNodes.map((node) => (
          <circle
            key={node.id}
            cx={`${node.x}%`}
            cy={`${node.y}%`}
            r="4"
            className="fill-supabase-green"
            opacity="0.7"
          />
        ))}
      </svg>
      <div className="absolute bottom-1 right-1 text-[10px] text-supabase-text-muted bg-supabase-bg-primary/80 px-1 rounded">
        {nodeCount} nodes, {edgeCount} edges
      </div>
    </div>
  )
}

const ArchitectureTemplatePreview = ({ template }: { template: ArchitectureTemplate }) => {
  const nodeCount = template.nodes.length
  const edgeCount = template.edges.length

  const previewNodes = template.nodes.slice(0, 12).map((node, i) => {
    const maxX = Math.max(...template.nodes.map(n => n.position.x + 100), 1)
    const maxY = Math.max(...template.nodes.map(n => n.position.y + 80), 1)
    const x = (node.position.x / maxX) * 80 + 10
    const y = (node.position.y / maxY) * 60 + 20
    return { x, y, id: i }
  })

  // Get provider color for the preview
  const providerCategory = template.categories.find(c => ['aws', 'azure', 'gcp', 'multi-cloud'].includes(c))
  const previewColor = providerCategory === 'aws' ? '#FF9900' :
                       providerCategory === 'azure' ? '#0078D4' :
                       providerCategory === 'gcp' ? '#4285F4' :
                       '#8B5CF6'

  return (
    <div className="w-full h-28 bg-gradient-to-br from-supabase-bg-secondary to-supabase-bg-tertiary rounded border border-supabase-border relative overflow-hidden">
      <svg className="absolute inset-0 w-full h-full">
        {template.edges.slice(0, 15).map((edge, i) => {
          const sourceNode = previewNodes.find((_, idx) => template.nodes[idx]?.id === edge.source)
          const targetNode = previewNodes.find((_, idx) => template.nodes[idx]?.id === edge.target)
          if (sourceNode && targetNode) {
            return (
              <line
                key={i}
                x1={`${sourceNode.x}%`}
                y1={`${sourceNode.y}%`}
                x2={`${targetNode.x}%`}
                y2={`${targetNode.y}%`}
                stroke={previewColor}
                strokeWidth="1"
                strokeOpacity="0.3"
              />
            )
          }
          return null
        })}
        {previewNodes.map((node) => (
          <circle
            key={node.id}
            cx={`${node.x}%`}
            cy={`${node.y}%`}
            r="4"
            fill={previewColor}
            opacity="0.7"
          />
        ))}
      </svg>
      <div className="absolute bottom-1 right-1 text-[10px] text-supabase-text-muted bg-supabase-bg-primary/80 px-1.5 py-0.5 rounded">
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
  const [activeTab, setActiveTab] = useState<'basic' | 'architecture'>('architecture')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedArchCategory, setSelectedArchCategory] = useState<TemplateCategory | 'all'>('all')
  const [selectedComplexity, setSelectedComplexity] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<DiagramTemplate | ArchitectureTemplate | null>(null)
  const [showVariablesDialog, setShowVariablesDialog] = useState(false)
  const [templateForVariables, setTemplateForVariables] = useState<ArchitectureTemplate | null>(null)

  // Filter basic templates
  const filteredBasicTemplates = useMemo(() => {
    let templates = DIAGRAM_TEMPLATES

    if (selectedCategory !== 'all') {
      templates = templates.filter(t => t.category === selectedCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      templates = templates.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
      )
    }

    return templates
  }, [selectedCategory, searchQuery])

  // Filter architecture templates
  const filteredArchTemplates = useMemo(() => {
    let templates = ARCHITECTURE_TEMPLATES

    if (selectedArchCategory !== 'all') {
      templates = templates.filter(t => t.categories.includes(selectedArchCategory))
    }

    if (selectedComplexity !== 'all') {
      templates = templates.filter(t => t.complexity === selectedComplexity)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      templates = templates.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return templates
  }, [selectedArchCategory, selectedComplexity, searchQuery])

  const handleSelect = useCallback(() => {
    if (selectedTemplate) {
      // Check if it's an architecture template with variables
      const isArchTemplate = 'categories' in selectedTemplate
      if (isArchTemplate && (selectedTemplate as ArchitectureTemplate).variables?.length) {
        setTemplateForVariables(selectedTemplate as ArchitectureTemplate)
        setShowVariablesDialog(true)
      } else {
        onSelectTemplate(selectedTemplate)
      }
    }
  }, [selectedTemplate, onSelectTemplate])

  const handleVariablesConfirm = useCallback((template: ArchitectureTemplate, variables: Record<string, string>) => {
    // Apply variables to template nodes
    const modifiedTemplate = { ...template }
    if (template.variables) {
      modifiedTemplate.nodes = template.nodes.map(node => {
        const affectingVariables = template.variables?.filter(v => v.appliesTo.includes(node.id)) || []
        if (affectingVariables.length > 0) {
          let newLabel = node.data.label
          affectingVariables.forEach(v => {
            // Replace variable placeholder in label if present
            const value = variables[v.id] || v.defaultValue
            newLabel = newLabel.replace(`{{${v.id}}}`, value)
          })
          return {
            ...node,
            data: { ...node.data, label: newLabel }
          }
        }
        return node
      })
    }
    setShowVariablesDialog(false)
    setTemplateForVariables(null)
    onSelectTemplate(modifiedTemplate)
  }, [onSelectTemplate])

  const clearSearch = () => {
    setSearchQuery('')
  }

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[700px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Diagram</DialogTitle>
          <DialogDescription>
            Choose from pre-built cloud architecture templates or start with a basic diagram
          </DialogDescription>
        </DialogHeader>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-supabase-text-muted" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-supabase-text-muted hover:text-supabase-text-primary cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'basic' | 'architecture')} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="architecture" className="gap-2">
              <Cloud className="h-4 w-4" />
              Cloud Architecture ({filteredArchTemplates.length})
            </TabsTrigger>
            <TabsTrigger value="basic" className="gap-2">
              <FileText className="h-4 w-4" />
              Basic Templates ({filteredBasicTemplates.length})
            </TabsTrigger>
          </TabsList>

          {/* Architecture Templates Tab */}
          <TabsContent value="architecture" className="flex-1 flex gap-4 min-h-0 mt-4 overflow-hidden">
            {/* Category sidebar */}
            <ScrollArea className="w-52 flex-shrink-0">
              <div className="space-y-4 pr-2">
              {/* Provider filter */}
              <div>
                <h4 className="text-xs font-semibold text-supabase-text-muted uppercase mb-2">Provider</h4>
                <nav className="space-y-1">
                  <button
                    onClick={() => setSelectedArchCategory('all')}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-md text-sm transition-colors cursor-pointer',
                      'hover:bg-supabase-bg-tertiary hover:text-supabase-text-primary',
                      selectedArchCategory === 'all' && 'bg-supabase-bg-tertiary text-supabase-text-primary font-medium'
                    )}
                  >
                    All Providers
                  </button>
                  {ARCHITECTURE_TEMPLATE_CATEGORIES.slice(0, 4).map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedArchCategory(category.id)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 cursor-pointer',
                        'hover:bg-supabase-bg-tertiary hover:text-supabase-text-primary',
                        selectedArchCategory === category.id && 'bg-supabase-bg-tertiary text-supabase-text-primary font-medium'
                      )}
                    >
                      {getCategoryIcon(category.id)}
                      {category.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Use Case filter */}
              <div>
                <h4 className="text-xs font-semibold text-supabase-text-muted uppercase mb-2">Use Case</h4>
                <nav className="space-y-1">
                  {ARCHITECTURE_TEMPLATE_CATEGORIES.slice(4).map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedArchCategory(category.id)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 cursor-pointer',
                        'hover:bg-supabase-bg-tertiary hover:text-supabase-text-primary',
                        selectedArchCategory === category.id && 'bg-supabase-bg-tertiary text-supabase-text-primary font-medium'
                      )}
                    >
                      {getCategoryIcon(category.id)}
                      {category.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Complexity filter */}
              <div>
                <h4 className="text-xs font-semibold text-supabase-text-muted uppercase mb-2">Complexity</h4>
                <div className="flex flex-wrap gap-1">
                  {['all', 'beginner', 'intermediate', 'advanced'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setSelectedComplexity(level)}
                      className={cn(
                        'px-2 py-1 text-xs rounded-md border transition-colors cursor-pointer',
                        selectedComplexity === level
                          ? 'bg-supabase-green text-white border-supabase-green'
                          : 'bg-supabase-bg-tertiary border-supabase-border hover:border-supabase-border-strong'
                      )}
                    >
                      {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              </div>
            </ScrollArea>

            {/* Architecture Templates grid */}
            <ScrollArea className="flex-1 -mr-4 pr-4">
              {filteredArchTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-supabase-text-muted">
                  <Search className="h-12 w-12 mb-2 opacity-50" />
                  <p>No templates found</p>
                  <p className="text-sm">Try a different search or filter</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {filteredArchTemplates.map((template) => {
                    const providerCategory = template.categories.find(c => ['aws', 'azure', 'gcp', 'multi-cloud'].includes(c))
                    return (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                        className={cn(
                          'text-left p-3 rounded-lg border-2 transition-all cursor-pointer',
                          'hover:border-supabase-green/50 hover:shadow-sm',
                          selectedTemplate && 'id' in selectedTemplate && selectedTemplate.id === template.id
                            ? 'border-supabase-green bg-supabase-green/5 shadow-sm'
                            : 'border-transparent bg-supabase-bg-secondary'
                        )}
                      >
                        <ArchitectureTemplatePreview template={template} />
                        <div className="mt-3 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium text-sm text-supabase-text-primary line-clamp-1">
                              {template.name}
                            </h3>
                          </div>
                          <p className="text-xs text-supabase-text-muted line-clamp-2">
                            {template.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {providerCategory && (
                              <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', getProviderColor(providerCategory))}>
                                {providerCategory.toUpperCase()}
                              </Badge>
                            )}
                            <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', getComplexityColor(template.complexity))}>
                              {template.complexity}
                            </Badge>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Basic Templates Tab */}
          <TabsContent value="basic" className="flex-1 flex gap-4 min-h-0 mt-4">
            {/* Category sidebar */}
            <div className="w-48 flex-shrink-0">
              <nav className="space-y-1">
                {TEMPLATE_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-md text-sm transition-colors cursor-pointer',
                      'hover:bg-supabase-bg-tertiary hover:text-supabase-text-primary',
                      selectedCategory === category.id && 'bg-supabase-bg-tertiary text-supabase-text-primary font-medium'
                    )}
                  >
                    {category.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Basic Templates grid */}
            <ScrollArea className="flex-1 -mr-4 pr-4">
              {filteredBasicTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-supabase-text-muted">
                  <Search className="h-12 w-12 mb-2 opacity-50" />
                  <p>No templates found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBasicTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={cn(
                        'text-left p-3 rounded-lg border-2 transition-all cursor-pointer',
                        'hover:border-supabase-green/50 hover:shadow-sm',
                        selectedTemplate && 'id' in selectedTemplate && selectedTemplate.id === template.id
                          ? 'border-supabase-green bg-supabase-green/5 shadow-sm'
                          : 'border-transparent bg-supabase-bg-secondary'
                      )}
                    >
                      <BasicTemplatePreview template={template} />
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(template.category)}
                          <h3 className="font-medium text-sm text-supabase-text-primary">{template.name}</h3>
                        </div>
                        <p className="text-xs text-supabase-text-muted line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-supabase-border">
          <div className="text-sm text-supabase-text-muted">
            {selectedTemplate ? (
              <span>
                Selected: <strong className="text-supabase-text-primary">{selectedTemplate.name}</strong>
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

    {/* Template Variables Dialog */}
    {templateForVariables && (
      <TemplateVariablesDialog
        open={showVariablesDialog}
        onOpenChange={setShowVariablesDialog}
        template={templateForVariables}
        onConfirm={handleVariablesConfirm}
        isLoading={isLoading}
      />
    )}
    </>
  )
}
