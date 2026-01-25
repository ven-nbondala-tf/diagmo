import { useCallback, useState, useMemo } from 'react'
import { useEditorStore } from '@/stores/editorStore'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollArea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Input,
} from '@/components/ui'
import { SHAPE_CATEGORIES, SHAPE_LABELS } from '@/constants'
import type { ShapeType } from '@/types'
import { Search } from 'lucide-react'
import {
  Square,
  Circle,
  Diamond,
  Triangle,
  Hexagon,
  Cloud,
  Type,
  Play,
  Octagon,
  FileText,
  Database,
  Box,
  User,
  Users,
  Package,
  Server,
  HardDrive,
  Zap,
  Star,
  ArrowRight,
  ArrowLeftRight,
  Pentagon,
  MessageSquare,
  StickyNote,
  Laptop,
  Smartphone,
  Globe,
  Network,
  Shield,
  GitMerge,
  CircleDot,
  PlusCircle,
  Layers,
} from 'lucide-react'

const shapeIcons: Partial<Record<ShapeType, React.ReactNode>> = {
  // Basic shapes
  rectangle: <Square className="h-5 w-5" />,
  'rounded-rectangle': <Square className="h-5 w-5 rounded" />,
  ellipse: <Circle className="h-5 w-5" />,
  circle: <Circle className="h-5 w-5" />,
  diamond: <Diamond className="h-5 w-5" />,
  triangle: <Triangle className="h-5 w-5" />,
  pentagon: <Pentagon className="h-5 w-5" />,
  hexagon: <Hexagon className="h-5 w-5" />,
  octagon: <Octagon className="h-5 w-5" />,
  star: <Star className="h-5 w-5" />,
  parallelogram: <Play className="h-5 w-5 -rotate-90" />,
  trapezoid: <Play className="h-5 w-5 rotate-180" />,
  cylinder: <Database className="h-5 w-5" />,
  arrow: <ArrowRight className="h-5 w-5" />,
  'double-arrow': <ArrowLeftRight className="h-5 w-5" />,
  cloud: <Cloud className="h-5 w-5" />,
  callout: <MessageSquare className="h-5 w-5" />,
  note: <StickyNote className="h-5 w-5" />,
  text: <Type className="h-5 w-5" />,
  // Flowchart
  process: <Square className="h-5 w-5" />,
  decision: <Diamond className="h-5 w-5" />,
  terminator: <Circle className="h-5 w-5" />,
  data: <Play className="h-5 w-5 rotate-90" />,
  document: <FileText className="h-5 w-5" />,
  'multi-document': <Layers className="h-5 w-5" />,
  'predefined-process': <Square className="h-5 w-5" />,
  'manual-input': <Play className="h-5 w-5" />,
  preparation: <Hexagon className="h-5 w-5" />,
  database: <Database className="h-5 w-5" />,
  delay: <Play className="h-5 w-5 rotate-90" />,
  merge: <GitMerge className="h-5 w-5" />,
  or: <CircleDot className="h-5 w-5" />,
  'summing-junction': <PlusCircle className="h-5 w-5" />,
  // UML
  'uml-class': <Box className="h-5 w-5" />,
  'uml-interface': <Circle className="h-5 w-5" />,
  'uml-actor': <User className="h-5 w-5" />,
  'uml-usecase': <Circle className="h-5 w-5" />,
  'uml-component': <Package className="h-5 w-5" />,
  'uml-package': <Package className="h-5 w-5" />,
  'uml-state': <Square className="h-5 w-5 rounded-full" />,
  'uml-note': <StickyNote className="h-5 w-5" />,
  // Network
  server: <Server className="h-5 w-5" />,
  router: <Network className="h-5 w-5" />,
  switch: <Network className="h-5 w-5" />,
  firewall: <Shield className="h-5 w-5" />,
  'load-balancer': <Hexagon className="h-5 w-5" />,
  user: <User className="h-5 w-5" />,
  users: <Users className="h-5 w-5" />,
  laptop: <Laptop className="h-5 w-5" />,
  mobile: <Smartphone className="h-5 w-5" />,
  internet: <Globe className="h-5 w-5" />,
  // Cloud
  'aws-ec2': <Server className="h-5 w-5" />,
  'aws-s3': <HardDrive className="h-5 w-5" />,
  'aws-lambda': <Zap className="h-5 w-5" />,
  'aws-rds': <Database className="h-5 w-5" />,
  'azure-vm': <Server className="h-5 w-5" />,
  'azure-storage': <HardDrive className="h-5 w-5" />,
  'azure-functions': <Zap className="h-5 w-5" />,
  'gcp-compute': <Server className="h-5 w-5" />,
  'gcp-storage': <HardDrive className="h-5 w-5" />,
  'gcp-functions': <Zap className="h-5 w-5" />,
}

export function ShapePanel() {
  const addNode = useEditorStore((state) => state.addNode)
  const [searchQuery, setSearchQuery] = useState('')
  // Start with empty array = all collapsed by default
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  const onDragStart = useCallback(
    (event: React.DragEvent, nodeType: ShapeType) => {
      event.dataTransfer.setData('application/reactflow', nodeType)
      event.dataTransfer.effectAllowed = 'move'
    },
    []
  )

  const handleClick = useCallback(
    (shapeType: ShapeType) => {
      addNode(shapeType, { x: 250, y: 250 })
    },
    [addNode]
  )

  // Filter shapes based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return SHAPE_CATEGORIES
    }

    const query = searchQuery.toLowerCase()
    const filtered: Partial<typeof SHAPE_CATEGORIES> = {}

    for (const [key, category] of Object.entries(SHAPE_CATEGORIES)) {
      const matchingShapes = category.shapes.filter((shape) => {
        const label = SHAPE_LABELS[shape] || shape
        return label.toLowerCase().includes(query) || shape.toLowerCase().includes(query)
      })

      if (matchingShapes.length > 0) {
        filtered[key as keyof typeof SHAPE_CATEGORIES] = {
          ...category,
          shapes: matchingShapes,
        }
      }
    }

    return filtered
  }, [searchQuery])

  // Auto-expand categories when searching
  const effectiveExpanded = useMemo(() => {
    if (searchQuery.trim()) {
      return Object.keys(filteredCategories)
    }
    return expandedCategories
  }, [searchQuery, filteredCategories, expandedCategories])

  return (
    <div className="w-64 border-r bg-background flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="font-semibold">Shapes</h2>
        <p className="text-xs text-muted-foreground">Drag or click to add</p>
      </div>

      {/* Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search shapes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
      </div>

      {/* Shape categories with accordion */}
      <ScrollArea className="flex-1">
        <Accordion
          type="multiple"
          value={effectiveExpanded}
          onValueChange={setExpandedCategories}
          className="w-full"
        >
          {Object.entries(filteredCategories).map(([key, category]) => (
            <AccordionItem key={key} value={key} className="border-b last:border-0">
              <AccordionTrigger className="px-4 py-2 text-sm hover:no-underline hover:bg-accent/50">
                <span className="flex items-center gap-2">
                  {category.label}
                  <span className="text-xs text-muted-foreground">
                    ({category.shapes.length})
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                <div className="grid grid-cols-3 gap-2 px-3">
                  {category.shapes.map((shape) => (
                    <Tooltip key={shape}>
                      <TooltipTrigger asChild>
                        <button
                          className="aspect-square flex items-center justify-center border rounded-md hover:bg-accent hover:border-primary transition-colors cursor-grab active:cursor-grabbing"
                          draggable
                          onDragStart={(e) => onDragStart(e, shape)}
                          onClick={() => handleClick(shape)}
                        >
                          {shapeIcons[shape] || <Square className="h-5 w-5" />}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{SHAPE_LABELS[shape]}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {Object.keys(filteredCategories).length === 0 && searchQuery && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No shapes found for "{searchQuery}"
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
