import { useCallback } from 'react'
import { useEditorStore } from '@/stores/editorStore'
import { ScrollArea, Separator, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui'
import { SHAPE_CATEGORIES, SHAPE_LABELS } from '@/constants'
import type { ShapeType } from '@/types'
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
  Package,
  Server,
  HardDrive,
  Zap,
} from 'lucide-react'

const shapeIcons: Partial<Record<ShapeType, React.ReactNode>> = {
  rectangle: <Square className="h-5 w-5" />,
  ellipse: <Circle className="h-5 w-5" />,
  diamond: <Diamond className="h-5 w-5" />,
  triangle: <Triangle className="h-5 w-5" />,
  hexagon: <Hexagon className="h-5 w-5" />,
  cloud: <Cloud className="h-5 w-5" />,
  text: <Type className="h-5 w-5" />,
  process: <Square className="h-5 w-5" />,
  decision: <Diamond className="h-5 w-5" />,
  terminator: <Octagon className="h-5 w-5" />,
  data: <Play className="h-5 w-5 rotate-90" />,
  document: <FileText className="h-5 w-5" />,
  'predefined-process': <Square className="h-5 w-5" />,
  'manual-input': <Play className="h-5 w-5" />,
  preparation: <Hexagon className="h-5 w-5" />,
  delay: <Octagon className="h-5 w-5" />,
  'uml-class': <Box className="h-5 w-5" />,
  'uml-interface': <Circle className="h-5 w-5" />,
  'uml-actor': <User className="h-5 w-5" />,
  'uml-usecase': <Circle className="h-5 w-5" />,
  'uml-component': <Package className="h-5 w-5" />,
  'uml-package': <Package className="h-5 w-5" />,
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

  return (
    <div className="w-64 border-r bg-background flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Shapes</h2>
        <p className="text-xs text-muted-foreground">Drag or click to add</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {Object.entries(SHAPE_CATEGORIES).map(([key, category]) => (
            <div key={key}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {category.label}
              </h3>
              <div className="grid grid-cols-3 gap-2">
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
              {key !== 'gcp' && <Separator className="mt-4" />}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
