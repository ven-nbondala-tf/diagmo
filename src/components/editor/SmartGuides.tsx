import { memo, useMemo } from 'react'
import { useStore, useReactFlow } from '@xyflow/react'
import type { DiagramNode } from '@/types'

const GUIDE_THRESHOLD = 5 // Pixels within which to show guides
const GUIDE_COLOR = '#3b82f6' // Blue
const GUIDE_SPACING_COLOR = '#22c55e' // Green for equal spacing

interface Guide {
  type: 'vertical' | 'horizontal'
  position: number
  start: number
  end: number
  isSpacing?: boolean
}

interface SmartGuidesProps {
  enabled?: boolean
}

/**
 * Smart Guides component that shows alignment guides when dragging nodes
 */
export const SmartGuides = memo(function SmartGuides({ enabled = true }: SmartGuidesProps) {
  const { getNodes } = useReactFlow()
  const dragging = useStore((s) => s.nodesDraggable !== false &&
    Array.from(s.nodeLookup.values()).some((n) => n.dragging))

  const transform = useStore((s) => s.transform)
  const [tx, ty, zoom] = transform

  const guides = useMemo(() => {
    if (!enabled || !dragging) return []

    const nodes = getNodes() as DiagramNode[]
    const draggingNodes = nodes.filter((n) => n.dragging)
    const staticNodes = nodes.filter((n) => !n.dragging && !n.hidden)

    if (draggingNodes.length === 0 || staticNodes.length === 0) return []

    const guides: Guide[] = []

    // Get bounds of dragging nodes
    const dragBounds = getDragBounds(draggingNodes)

    // Check alignment with each static node
    for (const staticNode of staticNodes) {
      const staticBounds = getNodeBounds(staticNode)

      // Vertical guides (for horizontal alignment)
      // Left edge alignment
      if (Math.abs(dragBounds.left - staticBounds.left) < GUIDE_THRESHOLD) {
        guides.push({
          type: 'vertical',
          position: staticBounds.left,
          start: Math.min(dragBounds.top, staticBounds.top) - 20,
          end: Math.max(dragBounds.bottom, staticBounds.bottom) + 20,
        })
      }
      // Right edge alignment
      if (Math.abs(dragBounds.right - staticBounds.right) < GUIDE_THRESHOLD) {
        guides.push({
          type: 'vertical',
          position: staticBounds.right,
          start: Math.min(dragBounds.top, staticBounds.top) - 20,
          end: Math.max(dragBounds.bottom, staticBounds.bottom) + 20,
        })
      }
      // Center horizontal alignment
      if (Math.abs(dragBounds.centerX - staticBounds.centerX) < GUIDE_THRESHOLD) {
        guides.push({
          type: 'vertical',
          position: staticBounds.centerX,
          start: Math.min(dragBounds.top, staticBounds.top) - 20,
          end: Math.max(dragBounds.bottom, staticBounds.bottom) + 20,
        })
      }
      // Left to right alignment
      if (Math.abs(dragBounds.left - staticBounds.right) < GUIDE_THRESHOLD) {
        guides.push({
          type: 'vertical',
          position: staticBounds.right,
          start: Math.min(dragBounds.top, staticBounds.top) - 20,
          end: Math.max(dragBounds.bottom, staticBounds.bottom) + 20,
        })
      }
      // Right to left alignment
      if (Math.abs(dragBounds.right - staticBounds.left) < GUIDE_THRESHOLD) {
        guides.push({
          type: 'vertical',
          position: staticBounds.left,
          start: Math.min(dragBounds.top, staticBounds.top) - 20,
          end: Math.max(dragBounds.bottom, staticBounds.bottom) + 20,
        })
      }

      // Horizontal guides (for vertical alignment)
      // Top edge alignment
      if (Math.abs(dragBounds.top - staticBounds.top) < GUIDE_THRESHOLD) {
        guides.push({
          type: 'horizontal',
          position: staticBounds.top,
          start: Math.min(dragBounds.left, staticBounds.left) - 20,
          end: Math.max(dragBounds.right, staticBounds.right) + 20,
        })
      }
      // Bottom edge alignment
      if (Math.abs(dragBounds.bottom - staticBounds.bottom) < GUIDE_THRESHOLD) {
        guides.push({
          type: 'horizontal',
          position: staticBounds.bottom,
          start: Math.min(dragBounds.left, staticBounds.left) - 20,
          end: Math.max(dragBounds.right, staticBounds.right) + 20,
        })
      }
      // Center vertical alignment
      if (Math.abs(dragBounds.centerY - staticBounds.centerY) < GUIDE_THRESHOLD) {
        guides.push({
          type: 'horizontal',
          position: staticBounds.centerY,
          start: Math.min(dragBounds.left, staticBounds.left) - 20,
          end: Math.max(dragBounds.right, staticBounds.right) + 20,
        })
      }
      // Top to bottom alignment
      if (Math.abs(dragBounds.top - staticBounds.bottom) < GUIDE_THRESHOLD) {
        guides.push({
          type: 'horizontal',
          position: staticBounds.bottom,
          start: Math.min(dragBounds.left, staticBounds.left) - 20,
          end: Math.max(dragBounds.right, staticBounds.right) + 20,
        })
      }
      // Bottom to top alignment
      if (Math.abs(dragBounds.bottom - staticBounds.top) < GUIDE_THRESHOLD) {
        guides.push({
          type: 'horizontal',
          position: staticBounds.top,
          start: Math.min(dragBounds.left, staticBounds.left) - 20,
          end: Math.max(dragBounds.right, staticBounds.right) + 20,
        })
      }
    }

    // Check for equal spacing between nodes (horizontal)
    const sortedByX = [...staticNodes].sort((a, b) => a.position.x - b.position.x)
    for (let i = 0; i < sortedByX.length - 1; i++) {
      const node1 = sortedByX[i]!
      const node2 = sortedByX[i + 1]!
      const bounds1 = getNodeBounds(node1)
      const bounds2 = getNodeBounds(node2)

      // Check if dragging node creates equal spacing
      if (dragBounds.left > bounds1.right && dragBounds.right < bounds2.left) {
        const gapToDrag = dragBounds.left - bounds1.right
        const dragToGap = bounds2.left - dragBounds.right
        if (Math.abs(gapToDrag - dragToGap) < GUIDE_THRESHOLD) {
          // Equal spacing - show green guides
          guides.push({
            type: 'vertical',
            position: bounds1.right + gapToDrag / 2,
            start: Math.min(bounds1.top, dragBounds.top) - 10,
            end: Math.max(bounds1.bottom, dragBounds.bottom) + 10,
            isSpacing: true,
          })
        }
      }
    }

    // Deduplicate guides
    return deduplicateGuides(guides)
  }, [enabled, dragging, getNodes])

  if (!enabled || guides.length === 0) return null

  return (
    <svg
      className="pointer-events-none absolute inset-0 overflow-visible"
      style={{ zIndex: 1000 }}
    >
      <g transform={`translate(${tx}, ${ty}) scale(${zoom})`}>
        {guides.map((guide, i) => (
          <line
            key={i}
            x1={guide.type === 'vertical' ? guide.position : guide.start}
            y1={guide.type === 'vertical' ? guide.start : guide.position}
            x2={guide.type === 'vertical' ? guide.position : guide.end}
            y2={guide.type === 'vertical' ? guide.end : guide.position}
            stroke={guide.isSpacing ? GUIDE_SPACING_COLOR : GUIDE_COLOR}
            strokeWidth={1 / zoom}
            strokeDasharray={guide.isSpacing ? `${4 / zoom} ${4 / zoom}` : 'none'}
          />
        ))}
      </g>
    </svg>
  )
})

interface NodeBounds {
  left: number
  right: number
  top: number
  bottom: number
  centerX: number
  centerY: number
  width: number
  height: number
}

function getNodeBounds(node: DiagramNode): NodeBounds {
  const width = node.measured?.width || node.width || 100
  const height = node.measured?.height || node.height || 60
  const x = node.position.x
  const y = node.position.y

  return {
    left: x,
    right: x + width,
    top: y,
    bottom: y + height,
    centerX: x + width / 2,
    centerY: y + height / 2,
    width,
    height,
  }
}

function getDragBounds(nodes: DiagramNode[]): NodeBounds {
  if (nodes.length === 0) {
    return { left: 0, right: 0, top: 0, bottom: 0, centerX: 0, centerY: 0, width: 0, height: 0 }
  }

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  for (const node of nodes) {
    const bounds = getNodeBounds(node)
    minX = Math.min(minX, bounds.left)
    maxX = Math.max(maxX, bounds.right)
    minY = Math.min(minY, bounds.top)
    maxY = Math.max(maxY, bounds.bottom)
  }

  return {
    left: minX,
    right: maxX,
    top: minY,
    bottom: maxY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
    width: maxX - minX,
    height: maxY - minY,
  }
}

function deduplicateGuides(guides: Guide[]): Guide[] {
  const seen = new Set<string>()
  return guides.filter((guide) => {
    const key = `${guide.type}-${Math.round(guide.position)}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
