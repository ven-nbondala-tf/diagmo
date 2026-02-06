import { useState, useCallback, useMemo, useRef, useEffect, type CSSProperties } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  getSmoothStepPath,
  getBezierPath,
  type EdgeProps,
  type Edge,
  MarkerType,
  useReactFlow,
} from '@xyflow/react'
import type { EdgeStyle, EdgeWaypoint } from '@/types'
import { nanoid } from 'nanoid'

interface LabeledEdgeData extends Record<string, unknown> {
  label?: string
  style?: EdgeStyle
  onLabelChange?: (label: string) => void
  waypointOffset?: { x: number; y: number }  // Legacy single waypoint
  waypoints?: EdgeWaypoint[]  // Multiple waypoints
  labelPosition?: 'on-line' | 'outside'
}

interface LabeledEdgeType extends Edge<LabeledEdgeData> {
  labelBgStyle?: { fill?: string }
  labelBgPadding?: [number, number]
  labelBgBorderRadius?: number
}

const getMarkerUrlFromObject = (marker: unknown): string | undefined => {
  if (!marker) return undefined
  if (typeof marker === 'string') return marker
  if (typeof marker === 'object' && marker !== null) {
    const m = marker as { type?: MarkerType; color?: string }
    if (m.type) {
      const color = m.color ? m.color.replace('#', '%23') : '%236b7280'
      return `url(#react-flow__${m.type}-${color})`
    }
  }
  return undefined
}

const getMarkerUrl = (markerType: EdgeStyle['markerEnd']): string | undefined => {
  if (!markerType || markerType === 'none') return undefined
  const color = '%236b7280'
  const type = markerType === 'arrow' ? MarkerType.Arrow : MarkerType.ArrowClosed
  return `url(#react-flow__${type}-${color})`
}

const getStrokeDasharray = (lineType?: EdgeStyle['lineType']) => {
  switch (lineType) {
    case 'dashed': return '8 4'
    case 'dotted': return '2 4'
    default: return undefined
  }
}

// Generate a smooth path through multiple points using quadratic curves
function generateSmoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length < 2) return ''
  if (points.length === 2) {
    const p0 = points[0]!
    const p1 = points[1]!
    return `M ${p0.x} ${p0.y} L ${p1.x} ${p1.y}`
  }

  // Start at first point
  const start = points[0]!
  let path = `M ${start.x} ${start.y}`

  // For each point except first and last, create smooth curves
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i]!
    const next = points[i + 1]!

    if (i === 0) {
      // First segment: line to midpoint, then curve
      const midX = (current.x + next.x) / 2
      const midY = (current.y + next.y) / 2
      path += ` L ${midX} ${midY}`
    } else if (i === points.length - 2) {
      // Last segment: curve then line to end
      path += ` Q ${current.x} ${current.y} ${(current.x + next.x) / 2} ${(current.y + next.y) / 2}`
      path += ` L ${next.x} ${next.y}`
    } else {
      // Middle segments: quadratic curve through control point to midpoint
      const midX = (current.x + next.x) / 2
      const midY = (current.y + next.y) / 2
      path += ` Q ${current.x} ${current.y} ${midX} ${midY}`
    }
  }

  return path
}

// Calculate point along a path at position t (0-1)
function getPointOnPath(points: Array<{ x: number; y: number }>, t: number): { x: number; y: number } {
  if (points.length < 2) return points[0] || { x: 0, y: 0 }

  // Calculate total length and find the segment at t
  let totalLength = 0
  const segments: Array<{ start: { x: number; y: number }; end: { x: number; y: number }; length: number }> = []

  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i]!
    const end = points[i + 1]!
    const length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))
    segments.push({ start, end, length })
    totalLength += length
  }

  const targetLength = t * totalLength
  let accumulatedLength = 0

  for (const segment of segments) {
    if (accumulatedLength + segment.length >= targetLength) {
      const segmentT = (targetLength - accumulatedLength) / segment.length
      return {
        x: segment.start.x + (segment.end.x - segment.start.x) * segmentT,
        y: segment.start.y + (segment.end.y - segment.start.y) * segmentT,
      }
    }
    accumulatedLength += segment.length
  }

  return points[points.length - 1]!
}

// Find closest point on edge path to click position
function findClosestPointOnPath(
  points: Array<{ x: number; y: number }>,
  clickX: number,
  clickY: number
): { t: number; distance: number; segmentIndex: number } {
  let minDistance = Infinity
  let bestT = 0.5
  let bestSegmentIndex = 0

  // Sample points along the path to find closest
  const samples = 50
  for (let i = 0; i <= samples; i++) {
    const t = i / samples
    const point = getPointOnPath(points, t)
    const distance = Math.sqrt(Math.pow(point.x - clickX, 2) + Math.pow(point.y - clickY, 2))
    if (distance < minDistance) {
      minDistance = distance
      bestT = t
      // Calculate segment index
      bestSegmentIndex = Math.min(Math.floor(t * (points.length - 1)), points.length - 2)
    }
  }

  return { t: bestT, distance: minDistance, segmentIndex: bestSegmentIndex }
}

export function LabeledEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd: defaultMarkerEnd,
  markerStart: defaultMarkerStart,
  data,
  selected,
  label,
  type,
}: EdgeProps<LabeledEdgeType>) {
  const { setEdges, getViewport } = useReactFlow()
  const edgeData = data as LabeledEdgeData | undefined
  const edgeStyle = edgeData?.style
  const [isEditing, setIsEditing] = useState(false)
  const edgeLabel = (label as string) || edgeData?.label || ''
  const [labelText, setLabelText] = useState(edgeLabel)
  const [isHovered, setIsHovered] = useState(false)
  const [selectedWaypointId, setSelectedWaypointId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Get waypoints - support both legacy and new format
  const waypoints: EdgeWaypoint[] = useMemo(() => {
    if (edgeData?.waypoints && edgeData.waypoints.length > 0) {
      return edgeData.waypoints
    }
    // Legacy single waypoint migration
    if (edgeData?.waypointOffset) {
      const baseMidX = (sourceX + targetX) / 2
      const baseMidY = (sourceY + targetY) / 2
      const offset = edgeData.waypointOffset
      if (Math.abs(offset.x) > 10 || Math.abs(offset.y) > 10) {
        return [{
          id: 'legacy-wp',
          x: baseMidX + offset.x,
          y: baseMidY + offset.y,
        }]
      }
    }
    return []
  }, [edgeData?.waypoints, edgeData?.waypointOffset, sourceX, sourceY, targetX, targetY])

  const labelPlacement = edgeStyle?.labelPlacement || 'middle'

  // Sync label text
  useEffect(() => {
    if (labelText !== edgeLabel && !isEditing) {
      setLabelText(edgeLabel)
    }
  }, [edgeLabel, isEditing, labelText])

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // Handle keyboard events for waypoint deletion
  useEffect(() => {
    if (!selected || !selectedWaypointId) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        e.stopPropagation()
        // Remove selected waypoint
        setEdges((edges) =>
          edges.map((edge) =>
            edge.id === id
              ? {
                  ...edge,
                  data: {
                    ...edge.data,
                    waypoints: (edge.data as LabeledEdgeData)?.waypoints?.filter(
                      (wp) => wp.id !== selectedWaypointId
                    ),
                  },
                }
              : edge
          )
        )
        setSelectedWaypointId(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selected, selectedWaypointId, id, setEdges])

  const hasLabel = edgeLabel.trim().length > 0

  const effectiveStyle = useMemo<CSSProperties>(() => {
    const stroke = edgeStyle?.strokeColor || (style?.stroke as string) || '#64748b'
    const strokeWidth = edgeStyle?.strokeWidth || (style?.strokeWidth as number) || 1.5
    let strokeDasharray: string | undefined
    if (edgeStyle?.lineType) {
      strokeDasharray = getStrokeDasharray(edgeStyle.lineType)
    } else if (style?.strokeDasharray) {
      strokeDasharray = style.strokeDasharray as string
    }
    const strokeLinecap = edgeStyle?.lineCap || 'round'
    const strokeLinejoin = edgeStyle?.lineJoin || 'round'
    return { ...style, stroke, strokeWidth, strokeDasharray, strokeLinecap, strokeLinejoin }
  }, [style, edgeStyle])

  const effectiveMarkerEnd = useMemo((): string | undefined => {
    if (edgeStyle?.markerEnd) return getMarkerUrl(edgeStyle.markerEnd)
    return getMarkerUrlFromObject(defaultMarkerEnd)
  }, [edgeStyle?.markerEnd, defaultMarkerEnd])

  const effectiveMarkerStart = useMemo((): string | undefined => {
    if (edgeStyle?.markerStart) return getMarkerUrl(edgeStyle.markerStart)
    return getMarkerUrlFromObject(defaultMarkerStart)
  }, [edgeStyle?.markerStart, defaultMarkerStart])

  // ========== EDGE PATH GENERATION ==========
  // Build array of all points: source -> waypoints -> target
  const allPoints = useMemo(() => {
    return [
      { x: sourceX, y: sourceY },
      ...waypoints,
      { x: targetX, y: targetY },
    ]
  }, [sourceX, sourceY, waypoints, targetX, targetY])

  // Generate path based on edge type and waypoints
  let edgePath: string
  let labelX: number
  let labelY: number

  if (waypoints.length > 0) {
    // Custom path through waypoints
    edgePath = generateSmoothPath(allPoints)
    // Label position at middle of path
    const labelPoint = getPointOnPath(allPoints, 0.5)
    labelX = labelPoint.x
    labelY = labelPoint.y
  } else {
    // No waypoints - use the standard path for each edge type
    const effectiveType = type === 'labeled' || !type ? 'smoothstep' : type

    switch (effectiveType) {
      case 'smoothstep': {
        const [path, lx, ly] = getSmoothStepPath({
          sourceX,
          sourceY,
          sourcePosition,
          targetX,
          targetY,
          targetPosition,
          borderRadius: 8,
        })
        edgePath = path
        labelX = lx
        labelY = ly
        break
      }
      case 'step': {
        const [path, lx, ly] = getSmoothStepPath({
          sourceX,
          sourceY,
          sourcePosition,
          targetX,
          targetY,
          targetPosition,
          borderRadius: 0,
        })
        edgePath = path
        labelX = lx
        labelY = ly
        break
      }
      case 'bezier': {
        const [path, lx, ly] = getBezierPath({
          sourceX,
          sourceY,
          sourcePosition,
          targetX,
          targetY,
          targetPosition,
        })
        edgePath = path
        labelX = lx
        labelY = ly
        break
      }
      case 'straight':
      default: {
        const [path, lx, ly] = getStraightPath({
          sourceX,
          sourceY,
          targetX,
          targetY,
        })
        edgePath = path
        labelX = lx
        labelY = ly
        break
      }
    }
  }

  // Adjust label position based on labelPlacement
  let finalLabelX = labelX
  let finalLabelY = labelY

  if (labelPlacement === 'start') {
    const point = waypoints.length > 0 ? getPointOnPath(allPoints, 0.2) : { x: 0, y: 0 }
    if (waypoints.length > 0) {
      finalLabelX = point.x
      finalLabelY = point.y
    } else {
      const t = 0.2
      finalLabelX = sourceX + (targetX - sourceX) * t
      finalLabelY = sourceY + (targetY - sourceY) * t
    }
  } else if (labelPlacement === 'end') {
    const point = waypoints.length > 0 ? getPointOnPath(allPoints, 0.8) : { x: 0, y: 0 }
    if (waypoints.length > 0) {
      finalLabelX = point.x
      finalLabelY = point.y
    } else {
      const t = 0.8
      finalLabelX = sourceX + (targetX - sourceX) * t
      finalLabelY = sourceY + (targetY - sourceY) * t
    }
  }

  // Handle double-click on edge to add waypoint
  const handleEdgeDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    // Get click position in flow coordinates
    const svg = (e.target as Element).closest('svg')
    if (!svg) return

    const svgRect = svg.getBoundingClientRect()
    const viewport = getViewport()

    // Convert screen coordinates to flow coordinates
    const flowX = (e.clientX - svgRect.left - viewport.x) / viewport.zoom
    const flowY = (e.clientY - svgRect.top - viewport.y) / viewport.zoom

    // Find where to insert the waypoint (which segment)
    const { segmentIndex } = findClosestPointOnPath(allPoints, flowX, flowY)

    // Create new waypoint at click position
    const newWaypoint: EdgeWaypoint = {
      id: nanoid(8),
      x: flowX,
      y: flowY,
    }

    // Insert waypoint at correct position
    setEdges((edges) =>
      edges.map((edge) => {
        if (edge.id !== id) return edge
        const existingWaypoints = (edge.data as LabeledEdgeData)?.waypoints || []
        const newWaypoints = [...existingWaypoints]
        // Insert at segment index (after source point accounts for offset)
        newWaypoints.splice(segmentIndex, 0, newWaypoint)
        return {
          ...edge,
          data: {
            ...edge.data,
            waypoints: newWaypoints,
            waypointOffset: undefined, // Clear legacy offset
          },
        }
      })
    )

    setSelectedWaypointId(newWaypoint.id)
  }, [id, setEdges, getViewport, allPoints])

  // Waypoint drag handler
  const handleWaypointMouseDown = useCallback((waypointId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    setSelectedWaypointId(waypointId)

    const svg = (e.target as Element).closest('svg')
    if (!svg) return

    const svgRect = svg.getBoundingClientRect()
    const viewport = getViewport()

    const onMouseMove = (moveEvent: MouseEvent) => {
      const flowX = (moveEvent.clientX - svgRect.left - viewport.x) / viewport.zoom
      const flowY = (moveEvent.clientY - svgRect.top - viewport.y) / viewport.zoom

      setEdges((edges) =>
        edges.map((edge) => {
          if (edge.id !== id) return edge
          const existingWaypoints = (edge.data as LabeledEdgeData)?.waypoints || []
          return {
            ...edge,
            data: {
              ...edge.data,
              waypoints: existingWaypoints.map((wp) =>
                wp.id === waypointId ? { ...wp, x: flowX, y: flowY } : wp
              ),
            },
          }
        })
      )
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [id, setEdges, getViewport])

  // Right-click to remove waypoint
  const handleWaypointContextMenu = useCallback((waypointId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    setEdges((edges) =>
      edges.map((edge) =>
        edge.id === id
          ? {
              ...edge,
              data: {
                ...edge.data,
                waypoints: (edge.data as LabeledEdgeData)?.waypoints?.filter(
                  (wp) => wp.id !== waypointId
                ),
              },
            }
          : edge
      )
    )
    setSelectedWaypointId(null)
  }, [id, setEdges])

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true)
  }, [])

  const saveLabel = useCallback(() => {
    setIsEditing(false)
    setEdges((edges) =>
      edges.map((edge) =>
        edge.id === id ? { ...edge, label: labelText } : edge
      )
    )
  }, [id, labelText, setEdges])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveLabel()
    }
    if (e.key === 'Escape') {
      setIsEditing(false)
      setLabelText(edgeLabel)
    }
  }, [saveLabel, edgeLabel])

  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Invisible wider path for easier clicking/double-clicking */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ cursor: 'pointer' }}
        onDoubleClick={handleEdgeDoubleClick}
      />

      {/* Main edge path */}
      <BaseEdge
        path={edgePath}
        markerEnd={effectiveMarkerEnd}
        markerStart={effectiveMarkerStart}
        style={effectiveStyle}
        interactionWidth={20}
      />

      {/* Waypoint handles - show on hover or when selected */}
      {(selected || isHovered) && waypoints.map((wp) => (
        <g key={wp.id}>
          {/* Outer glow for selected waypoint */}
          {selectedWaypointId === wp.id && (
            <circle
              cx={wp.x}
              cy={wp.y}
              r={10}
              fill="rgba(59, 130, 246, 0.2)"
              stroke="none"
            />
          )}
          {/* Waypoint handle */}
          <rect
            x={wp.x - 5}
            y={wp.y - 5}
            width={10}
            height={10}
            rx={2}
            fill={selectedWaypointId === wp.id ? '#3b82f6' : 'white'}
            stroke={selectedWaypointId === wp.id ? '#1d4ed8' : '#3b82f6'}
            strokeWidth={1.5}
            style={{ cursor: 'move', pointerEvents: 'all' }}
            onMouseDown={(e) => handleWaypointMouseDown(wp.id, e)}
            onContextMenu={(e) => handleWaypointContextMenu(wp.id, e)}
          />
        </g>
      ))}

      {/* Show add waypoint hint when hovering */}
      {(selected || isHovered) && waypoints.length === 0 && (
        <text
          x={labelX}
          y={labelY + 20}
          textAnchor="middle"
          fontSize={10}
          fill="#9ca3af"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          Double-click to add waypoint
        </text>
      )}

      {/* Label - positioned above the line */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            // Always position label above the line with offset
            transform: `translate(-50%, -100%) translate(${finalLabelX}px, ${finalLabelY - 8}px)`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
          className="nodrag nopan"
        >
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={labelText}
              onChange={(e) => setLabelText(e.target.value)}
              onBlur={saveLabel}
              onKeyDown={handleKeyDown}
              className="bg-white border border-blue-400 outline-none text-center text-sm text-gray-700 px-2 py-0.5 rounded"
              style={{
                width: `${Math.max(labelText.length * 8 + 16, 60)}px`,
                pointerEvents: 'all',
                fontFamily: edgeStyle?.labelFontFamily || 'inherit',
              }}
              placeholder="Label"
            />
          ) : hasLabel ? (
            <div
              className="cursor-text px-2 py-1 rounded transition-colors text-center"
              style={{
                color: edgeStyle?.labelColor || '#374151',
                fontSize: edgeStyle?.labelFontSize ? `${edgeStyle.labelFontSize}px` : '11px',
                fontFamily: edgeStyle?.labelFontFamily || 'inherit',
                fontWeight: edgeStyle?.labelFontWeight || 'normal',
                fontStyle: edgeStyle?.labelFontStyle || 'normal',
                textDecoration: edgeStyle?.labelTextDecoration || 'none',
                backgroundColor: edgeStyle?.labelBgColor || 'rgba(255,255,255,0.95)',
                pointerEvents: 'all',
                maxWidth: '150px',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}
              onDoubleClick={handleDoubleClick}
            >
              {labelText}
            </div>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </g>
  )
}
