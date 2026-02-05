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
import type { EdgeStyle } from '@/types'

interface LabeledEdgeData extends Record<string, unknown> {
  label?: string
  style?: EdgeStyle
  onLabelChange?: (label: string) => void
  waypointOffset?: { x: number; y: number }
  labelPosition?: 'on-line' | 'outside' // 'on-line' = centered on line, 'outside' = above/below line
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
  const { setEdges } = useReactFlow()
  const edgeData = data as LabeledEdgeData | undefined
  const edgeStyle = edgeData?.style
  const [isEditing, setIsEditing] = useState(false)
  const edgeLabel = (label as string) || edgeData?.label || ''
  const [labelText, setLabelText] = useState(edgeLabel)
  const [isHovered, setIsHovered] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const waypointOffset = edgeData?.waypointOffset || { x: 0, y: 0 }
  const labelPosition = edgeData?.labelPosition || 'on-line'

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
    return { ...style, stroke, strokeWidth, strokeDasharray }
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
  // Calculate the waypoint position (center + user offset)
  const baseMidX = (sourceX + targetX) / 2
  const baseMidY = (sourceY + targetY) / 2

  // Check if waypoint has been moved (user dragged it) - use larger threshold to avoid accidental bends
  const hasWaypointOffset = Math.abs(waypointOffset.x) > 10 || Math.abs(waypointOffset.y) > 10

  // Generate path based on edge type
  let edgePath: string
  let labelX: number
  let labelY: number

  if (hasWaypointOffset) {
    // User has dragged the waypoint - create a simple bent line through that point
    const wpX = baseMidX + waypointOffset.x
    const wpY = baseMidY + waypointOffset.y
    edgePath = `M ${sourceX} ${sourceY} L ${wpX} ${wpY} L ${targetX} ${targetY}`
    labelX = wpX
    labelY = wpY
  } else {
    // No offset - use the standard path for each edge type
    // "labeled" type defaults to smoothstep (smart orthogonal routing)
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

  // Waypoint handle position (at label position when not dragged)
  const waypointX = hasWaypointOffset ? baseMidX + waypointOffset.x : labelX
  const waypointY = hasWaypointOffset ? baseMidY + waypointOffset.y : labelY

  // Waypoint drag handler
  const handleWaypointMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    const startX = e.clientX
    const startY = e.clientY
    const startOffsetX = waypointOffset.x
    const startOffsetY = waypointOffset.y

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX
      const dy = moveEvent.clientY - startY

      setEdges((edges) =>
        edges.map((edge) =>
          edge.id === id
            ? {
                ...edge,
                data: {
                  ...edge.data,
                  waypointOffset: { x: startOffsetX + dx, y: startOffsetY + dy },
                },
              }
            : edge
        )
      )
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [id, waypointOffset, setEdges])

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
      {/* Main edge path */}
      <BaseEdge
        path={edgePath}
        markerEnd={effectiveMarkerEnd}
        markerStart={effectiveMarkerStart}
        style={effectiveStyle}
        interactionWidth={20}
      />

      {/* Simple square drag handle - like Lucidchart */}
      {(selected || isHovered) && (
        <rect
          x={waypointX - 5}
          y={waypointY - 5}
          width={10}
          height={10}
          fill="white"
          stroke="#3b82f6"
          strokeWidth={1.5}
          style={{ cursor: 'move', pointerEvents: 'all' }}
          onMouseDown={handleWaypointMouseDown}
        />
      )}

      {/* Label - positioned based on labelPosition setting */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            // 'on-line' = on the line with background, 'outside' = above line without background
            transform: labelPosition === 'outside'
              ? `translate(-50%, -100%) translate(${labelX}px, ${labelY - 12}px)`
              : `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'none',
            zIndex: 0, // Below node labels
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
              className="cursor-text px-1.5 py-0.5 rounded transition-colors"
              style={{
                color: edgeStyle?.labelColor || '#374151',
                fontSize: edgeStyle?.labelFontSize ? `${edgeStyle.labelFontSize}px` : '11px',
                fontFamily: edgeStyle?.labelFontFamily || 'inherit',
                fontWeight: edgeStyle?.labelFontWeight || 'normal',
                fontStyle: edgeStyle?.labelFontStyle || 'normal',
                textDecoration: edgeStyle?.labelTextDecoration || 'none',
                backgroundColor: labelPosition === 'outside'
                  ? 'transparent'
                  : edgeStyle?.labelBgColor || 'rgba(255,255,255,0.9)',
                pointerEvents: 'all',
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
