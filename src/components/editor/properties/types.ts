import type { NodeStyle, DiagramNode } from '@/types'

export interface ShapeSectionProps {
  style: NodeStyle
  data: DiagramNode['data']
  selectedNode: DiagramNode
  selectedNodes: string[]
  multipleSelected: boolean
  updateAllSelectedStyles: (style: Partial<NodeStyle>) => void
  updateAllSelectedData: (data: Partial<DiagramNode['data']>) => void
  updateNode: (id: string, data: Partial<DiagramNode['data']>) => void
  updateNodePosition: (id: string, position: { x?: number; y?: number }) => void
  updateNodeDimensions: (ids: string[], dimensions: { width?: number; height?: number }) => void
  bringToFront: (ids: string[]) => void
  bringForward: (ids: string[]) => void
  sendBackward: (ids: string[]) => void
  sendToBack: (ids: string[]) => void
}
