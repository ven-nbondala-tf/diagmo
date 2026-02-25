import { useMemo, useCallback, useRef, useState, useEffect } from 'react'
import { useReactFlow } from '@xyflow/react'
import type { DiagramNode, GroupStyle } from '@/types'
import { useEditorStore } from '@/stores/editorStore'

interface GroupBoundaryProps {
  nodes: DiagramNode[]
}

interface DragState {
  isDragging: boolean
  startX: number
  startY: number
  nodeIds: string[]
  initialPositions: Map<string, { x: number; y: number }>
  hasMoved: boolean
}

// Generate consistent colors for group IDs
function getGroupColor(groupId: string): string {
  const colors = [
    '#3ECF8E', // Supabase green
    '#4285F4', // Blue
    '#FF9900', // Orange
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F59E0B', // Amber
    '#EF4444', // Red
  ]

  // Simple hash function to get consistent color
  let hash = 0
  for (let i = 0; i < groupId.length; i++) {
    hash = ((hash << 5) - hash) + groupId.charCodeAt(i)
    hash = hash & hash
  }
  return colors[Math.abs(hash) % colors.length]!
}

// Get stroke dasharray for border style
function getStrokeDasharray(style: GroupStyle['borderStyle']): string {
  switch (style) {
    case 'solid':
      return 'none'
    case 'dashed':
      return '6 4'
    case 'dotted':
      return '2 3'
    case 'none':
    default:
      return 'none'
  }
}

export function GroupBoundary({ nodes }: GroupBoundaryProps) {
  const { getViewport } = useReactFlow()
  const selectNodes = useEditorStore((s) => s.selectNodes)
  const setNodes = useEditorStore((s) => s.setNodes)
  const pushHistory = useEditorStore((s) => s.pushHistory)

  const [dragState, setDragState] = useState<DragState | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // Calculate group boundaries with styles
  const groupBounds = useMemo(() => {
    const groups = new Map<string, {
      minX: number
      minY: number
      maxX: number
      maxY: number
      nodeCount: number
      nodeIds: string[]
      color: string
      style: GroupStyle
    }>()

    // Find all nodes with group IDs and calculate bounds
    nodes.forEach(node => {
      const groupId = node.data.groupId
      if (!groupId) return

      const width = (node.measured?.width ?? node.style?.width ?? 100) as number
      const height = (node.measured?.height ?? node.style?.height ?? 60) as number
      const x = node.position.x
      const y = node.position.y

      const existing = groups.get(groupId)
      if (existing) {
        existing.minX = Math.min(existing.minX, x)
        existing.minY = Math.min(existing.minY, y)
        existing.maxX = Math.max(existing.maxX, x + width)
        existing.maxY = Math.max(existing.maxY, y + height)
        existing.nodeCount++
        existing.nodeIds.push(node.id)
        // Use groupStyle from any node that has it
        if (node.data.groupStyle) {
          existing.style = { ...existing.style, ...node.data.groupStyle }
        }
      } else {
        groups.set(groupId, {
          minX: x,
          minY: y,
          maxX: x + width,
          maxY: y + height,
          nodeCount: 1,
          nodeIds: [node.id],
          color: getGroupColor(groupId),
          style: node.data.groupStyle || {},
        })
      }
    })

    // Only show groups with 2+ nodes
    return Array.from(groups.entries())
      .filter(([, bounds]) => bounds.nodeCount >= 2)
      .map(([groupId, bounds]) => ({
        groupId,
        ...bounds,
      }))
  }, [nodes])

  // Handle mouse down on group - start drag
  const handleMouseDown = useCallback((nodeIds: string[], e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    // Select all nodes in the group
    selectNodes(nodeIds)

    // Store initial positions of all nodes in the group
    const initialPositions = new Map<string, { x: number; y: number }>()
    nodes.forEach(node => {
      if (nodeIds.includes(node.id)) {
        initialPositions.set(node.id, { x: node.position.x, y: node.position.y })
      }
    })

    // Start drag state
    setDragState({
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      nodeIds,
      initialPositions,
      hasMoved: false,
    })
  }, [selectNodes, nodes])

  // Use global mouse events for drag handling
  useEffect(() => {
    if (!dragState?.isDragging) return

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const viewport = getViewport()
      const dx = (e.clientX - dragState.startX) / viewport.zoom
      const dy = (e.clientY - dragState.startY) / viewport.zoom

      // Only push history on first move
      if (!dragState.hasMoved && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
        pushHistory()
        setDragState(prev => prev ? { ...prev, hasMoved: true } : null)
      }

      // Update all node positions
      const updatedNodes = nodes.map(node => {
        const initialPos = dragState.initialPositions.get(node.id)
        if (initialPos) {
          return {
            ...node,
            position: {
              x: initialPos.x + dx,
              y: initialPos.y + dy,
            },
          }
        }
        return node
      })

      setNodes(updatedNodes)
    }

    const handleGlobalMouseUp = () => {
      setDragState(null)
    }

    // Add global listeners
    window.addEventListener('mousemove', handleGlobalMouseMove)
    window.addEventListener('mouseup', handleGlobalMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove)
      window.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [dragState, nodes, setNodes, getViewport, pushHistory])

  if (groupBounds.length === 0) return null

  const viewport = getViewport()

  return (
    <div
      className="absolute inset-0 overflow-visible pointer-events-none"
      style={{ zIndex: 5 }}
    >
      {/* Interactive layer - HTML divs for click/drag */}
      {groupBounds.map(({ groupId, minX, minY, maxX, maxY, style, nodeIds }) => {
        const padding = style.padding ?? 12
        const borderRadius = style.borderRadius ?? 8

        return (
          <div
            key={`hit-${groupId}`}
            className="absolute pointer-events-auto"
            style={{
              left: viewport.x + (minX - padding) * viewport.zoom,
              top: viewport.y + (minY - padding) * viewport.zoom,
              width: (maxX - minX + padding * 2) * viewport.zoom,
              height: (maxY - minY + padding * 2) * viewport.zoom,
              borderRadius: borderRadius * viewport.zoom,
              cursor: dragState?.isDragging ? 'grabbing' : 'grab',
            }}
            onMouseDown={(e) => handleMouseDown(nodeIds, e)}
          />
        )
      })}

      {/* Visual layer - SVG for rendering */}
      <svg
        ref={svgRef}
        className="absolute inset-0 overflow-visible pointer-events-none"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {groupBounds.map(({ groupId, minX, minY, maxX, maxY, color, style }) => {
          // Apply custom styles or use defaults
          const borderStyle = style.borderStyle ?? 'dashed'
          const borderColor = style.borderColor || color
          const borderWidth = style.borderWidth ?? 2
          const borderOpacity = style.borderOpacity ?? 0.4
          const backgroundColor = style.backgroundColor || color
          const backgroundOpacity = style.backgroundOpacity ?? 0.05
          const borderRadius = style.borderRadius ?? 8
          const showLabel = style.showLabel !== false
          const labelText = style.labelText || 'Group'
          const padding = style.padding ?? 12

          // Don't render if border style is 'none' and no background
          const hasBorder = borderStyle !== 'none'
          const hasBackground = backgroundOpacity > 0

          if (!hasBorder && !hasBackground) return null

          return (
            <g key={groupId}>
              {/* Visual group boundary */}
              <rect
                x={minX - padding}
                y={minY - padding}
                width={maxX - minX + padding * 2}
                height={maxY - minY + padding * 2}
                rx={borderRadius}
                ry={borderRadius}
                fill={hasBackground ? backgroundColor : 'transparent'}
                fillOpacity={hasBackground ? backgroundOpacity : 0}
                stroke={hasBorder ? borderColor : 'none'}
                strokeWidth={hasBorder ? borderWidth : 0}
                strokeOpacity={hasBorder ? borderOpacity : 0}
                strokeDasharray={hasBorder ? getStrokeDasharray(borderStyle) : undefined}
              />
              {/* Group label */}
              {showLabel && (
                <text
                  x={minX - padding + 6}
                  y={minY - padding - 6}
                  fill={borderColor}
                  fontSize={11}
                  fontWeight={500}
                  opacity={0.6}
                >
                  {labelText}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
