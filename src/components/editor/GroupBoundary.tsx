import { useMemo } from 'react'
import { useReactFlow } from '@xyflow/react'
import type { DiagramNode } from '@/types'

interface GroupBoundaryProps {
  nodes: DiagramNode[]
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

export function GroupBoundary({ nodes }: GroupBoundaryProps) {
  const { getViewport } = useReactFlow()

  // Calculate group boundaries
  const groupBounds = useMemo(() => {
    const groups = new Map<string, {
      minX: number
      minY: number
      maxX: number
      maxY: number
      nodeCount: number
      color: string
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
      } else {
        groups.set(groupId, {
          minX: x,
          minY: y,
          maxX: x + width,
          maxY: y + height,
          nodeCount: 1,
          color: getGroupColor(groupId),
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

  if (groupBounds.length === 0) return null

  const viewport = getViewport()
  const padding = 12

  return (
    <svg
      className="pointer-events-none absolute inset-0 overflow-visible"
      style={{
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        transformOrigin: '0 0',
      }}
    >
      {groupBounds.map(({ groupId, minX, minY, maxX, maxY, color }) => (
        <g key={groupId}>
          {/* Background fill */}
          <rect
            x={minX - padding}
            y={minY - padding}
            width={maxX - minX + padding * 2}
            height={maxY - minY + padding * 2}
            rx={8}
            ry={8}
            fill={color}
            fillOpacity={0.05}
            stroke={color}
            strokeWidth={2}
            strokeOpacity={0.3}
            strokeDasharray="6 4"
          />
          {/* Group label */}
          <text
            x={minX - padding + 6}
            y={minY - padding - 6}
            fill={color}
            fontSize={11}
            fontWeight={500}
            opacity={0.6}
          >
            Group
          </text>
        </g>
      ))}
    </svg>
  )
}
