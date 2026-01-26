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

// SVG Shape Preview Component - matches actual canvas shapes
const ShapePreview = ({ type }: { type: ShapeType }) => {
  const size = 32
  const strokeWidth = 1.5
  const fill = '#f3f4f6'
  const stroke = '#6b7280'

  switch (type) {
    // ===== BASIC SHAPES =====
    case 'rectangle':
    case 'process':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="8" width="24" height="16" rx="2" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'rounded-rectangle':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="8" width="24" height="16" rx="6" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'ellipse':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <ellipse cx="16" cy="16" rx="12" ry="8" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'circle':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="10" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'diamond':
    case 'decision':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <polygon points="16,4 28,16 16,28 4,16" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'triangle':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <polygon points="16,4 28,28 4,28" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'pentagon':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <polygon points="16,3 29,12 24,28 8,28 3,12" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'hexagon':
    case 'preparation':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <polygon points="8,4 24,4 30,16 24,28 8,28 2,16" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'octagon':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <polygon points="10,3 22,3 29,10 29,22 22,29 10,29 3,22 3,10" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'star':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <polygon points="16,2 19.5,11 29,11 21.5,17 24,27 16,21 8,27 10.5,17 3,11 12.5,11" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'parallelogram':
    case 'data':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <polygon points="8,8 28,8 24,24 4,24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'trapezoid':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <polygon points="8,8 24,8 28,24 4,24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'cylinder':
    case 'database':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <ellipse cx="16" cy="8" rx="10" ry="4" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <path d="M6,8 L6,24 C6,26.5 10.5,28 16,28 C21.5,28 26,26.5 26,24 L26,8" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <ellipse cx="16" cy="24" rx="10" ry="4" fill="none" stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'arrow':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <polygon points="4,12 18,12 18,6 28,16 18,26 18,20 4,20" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'double-arrow':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <polygon points="4,16 10,8 10,12 22,12 22,8 28,16 22,24 22,20 10,20 10,24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'cloud':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <path d="M8,22 C4,22 2,19 2,16 C2,13 4,10 8,10 C8,6 12,4 16,4 C20,4 24,6 26,10 C30,10 30,14 30,16 C30,20 28,22 24,22 Z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'callout':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <path d="M4,4 L28,4 L28,20 L12,20 L8,28 L10,20 L4,20 Z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'note':
    case 'uml-note':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <path d="M4,4 L22,4 L28,10 L28,28 L4,28 Z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <path d="M22,4 L22,10 L28,10" fill="none" stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'text':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <text x="8" y="22" fontSize="18" fontWeight="bold" fill={stroke}>T</text>
        </svg>
      )

    // ===== FLOWCHART =====
    case 'terminator':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="10" width="24" height="12" rx="6" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'document':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <path d="M4,4 L28,4 L28,24 C28,24 22,28 16,24 C10,20 4,24 4,24 Z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'multi-document':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="8" y="2" width="20" height="18" rx="1" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <rect x="6" y="4" width="20" height="18" rx="1" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <rect x="4" y="6" width="20" height="18" rx="1" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'predefined-process':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="8" width="24" height="16" rx="1" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="8" y1="8" x2="8" y2="24" stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="24" y1="8" x2="24" y2="24" stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'manual-input':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <polygon points="4,12 28,6 28,26 4,26" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'delay':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <path d="M4,8 L20,8 C26,8 28,12 28,16 C28,20 26,24 20,24 L4,24 Z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'merge':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <polygon points="4,6 28,6 16,26" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'or':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="10" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="16" y1="6" x2="16" y2="26" stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="6" y1="16" x2="26" y2="16" stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'summing-junction':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="10" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="9" y1="9" x2="23" y2="23" stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="23" y1="9" x2="9" y2="23" stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    // ===== UML =====
    case 'uml-class':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="1" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="4" y1="12" x2="28" y2="12" stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="4" y1="20" x2="28" y2="20" stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'uml-interface':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <circle cx="16" cy="10" r="6" fill="none" stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="16" y1="16" x2="16" y2="28" stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'uml-actor':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <circle cx="16" cy="6" r="4" fill="none" stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="16" y1="10" x2="16" y2="20" stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="8" y1="14" x2="24" y2="14" stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="16" y1="20" x2="10" y2="28" stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="16" y1="20" x2="22" y2="28" stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'uml-usecase':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <ellipse cx="16" cy="16" rx="12" ry="8" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'uml-component':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="8" y="4" width="20" height="24" rx="1" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <rect x="4" y="8" width="8" height="4" rx="1" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <rect x="4" y="16" width="8" height="4" rx="1" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'uml-package':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="10" height="4" rx="1" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <rect x="4" y="8" width="24" height="18" rx="1" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'uml-state':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="8" width="24" height="16" rx="8" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    // ===== NETWORK =====
    case 'server':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="6" y="4" width="20" height="24" rx="2" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="6" y1="12" x2="26" y2="12" stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="6" y1="20" x2="26" y2="20" stroke={stroke} strokeWidth={strokeWidth} />
          <circle cx="10" cy="8" r="1.5" fill="#22c55e" />
          <circle cx="14" cy="8" r="1.5" fill="#22c55e" />
        </svg>
      )

    case 'router':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="12" width="24" height="12" rx="2" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="8" y1="6" x2="8" y2="12" stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="16" y1="6" x2="16" y2="12" stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="24" y1="6" x2="24" y2="12" stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'switch':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="10" width="24" height="12" rx="2" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <circle cx="10" cy="16" r="2" fill="#22c55e" />
          <circle cx="16" cy="16" r="2" fill="#22c55e" />
          <circle cx="22" cy="16" r="2" fill="#22c55e" />
        </svg>
      )

    case 'firewall':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="2" fill={fill} stroke="#dc2626" strokeWidth={strokeWidth} />
          <rect x="8" y="8" width="4" height="4" fill="#dc2626" />
          <rect x="14" y="8" width="4" height="4" fill="#dc2626" />
          <rect x="20" y="8" width="4" height="4" fill="#dc2626" />
          <rect x="11" y="14" width="4" height="4" fill="#dc2626" />
          <rect x="17" y="14" width="4" height="4" fill="#dc2626" />
        </svg>
      )

    case 'load-balancer':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <polygon points="8,4 24,4 28,16 24,28 8,28 4,16" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'user':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <circle cx="16" cy="10" r="6" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <path d="M6,28 C6,22 10,18 16,18 C22,18 26,22 26,28" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'users':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <circle cx="12" cy="10" r="5" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <circle cx="22" cy="10" r="5" fill={fill} stroke={stroke} strokeWidth={strokeWidth} opacity="0.6" />
          <path d="M4,26 C4,20 7,18 12,18 C17,18 20,20 20,26" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <path d="M14,26 C14,20 17,18 22,18 C27,18 28,20 28,26" fill={fill} stroke={stroke} strokeWidth={strokeWidth} opacity="0.6" />
        </svg>
      )

    case 'laptop':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="6" y="6" width="20" height="14" rx="2" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <rect x="4" y="20" width="24" height="4" rx="1" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'mobile':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="10" y="4" width="12" height="24" rx="2" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <circle cx="16" cy="24" r="2" fill="none" stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    case 'internet':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="12" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <ellipse cx="16" cy="16" rx="5" ry="12" fill="none" stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="4" y1="16" x2="28" y2="16" stroke={stroke} strokeWidth={strokeWidth} />
          <line x1="16" y1="4" x2="16" y2="28" stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )

    // ===== CLOUD PROVIDERS =====
    case 'aws-ec2':
    case 'aws-s3':
    case 'aws-lambda':
    case 'aws-rds':
    case 'azure-vm':
    case 'azure-storage':
    case 'azure-functions':
    case 'gcp-compute':
    case 'gcp-storage':
    case 'gcp-functions':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <path d="M8,20 C4,20 2,17 2,14 C2,11 4,8 8,8 C8,4 12,2 16,2 C20,2 24,4 26,8 C30,8 30,12 30,14 C30,18 28,20 24,20 Z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <text x="16" y="15" textAnchor="middle" fontSize="6" fill={stroke}>{type.split('-')[1]?.toUpperCase().slice(0, 3)}</text>
        </svg>
      )

    default:
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect x="4" y="8" width="24" height="16" rx="2" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )
  }
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
                          className="aspect-square flex items-center justify-center border rounded-md hover:bg-accent hover:border-primary transition-colors cursor-grab active:cursor-grabbing p-1"
                          draggable
                          onDragStart={(e) => onDragStart(e, shape)}
                          onClick={() => handleClick(shape)}
                        >
                          <ShapePreview type={shape} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="flex items-center gap-2 p-2">
                        <ShapePreview type={shape} />
                        <span>{SHAPE_LABELS[shape]}</span>
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
