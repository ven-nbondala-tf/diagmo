import { memo, useState, useCallback, useMemo, useRef, useEffect, type CSSProperties } from 'react'
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

export const LabeledEdge = memo(function LabeledEdge({
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
  label,
  type,
}: EdgeProps<LabeledEdgeType>) {
  const { setEdges } = useReactFlow()
  const edgeData = data as LabeledEdgeData | undefined
  const edgeStyle = edgeData?.style
  const [isEditing, setIsEditing] = useState(false)
  const edgeLabel = (label as string) || edgeData?.label || ''
  const [labelText, setLabelText] = useState(edgeLabel)
  const inputRef = useRef<HTMLInputElement>(null)

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

  // Generate path based on edge type
  let edgePath: string
  let labelX: number
  let labelY: number

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

  // Adjust label position based on labelPlacement
  let finalLabelX = labelX
  let finalLabelY = labelY

  if (labelPlacement === 'start') {
    const t = 0.2
    finalLabelX = sourceX + (targetX - sourceX) * t
    finalLabelY = sourceY + (targetY - sourceY) * t
  } else if (labelPlacement === 'end') {
    const t = 0.8
    finalLabelX = sourceX + (targetX - sourceX) * t
    finalLabelY = sourceY + (targetY - sourceY) * t
  }

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
    <g>
      {/* Main edge path */}
      <BaseEdge
        path={edgePath}
        markerEnd={effectiveMarkerEnd}
        markerStart={effectiveMarkerStart}
        style={effectiveStyle}
        interactionWidth={20}
      />

      {/* Label - positioned above the line */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -100%) translate(${finalLabelX}px, ${finalLabelY - 8}px)`,
            pointerEvents: 'none',
            zIndex: 1000,
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
                color: edgeStyle?.labelColor || 'var(--text-primary, #ededed)',
                fontSize: edgeStyle?.labelFontSize ? `${edgeStyle.labelFontSize}px` : '11px',
                fontFamily: edgeStyle?.labelFontFamily || 'inherit',
                fontWeight: edgeStyle?.labelFontWeight || 'normal',
                fontStyle: edgeStyle?.labelFontStyle || 'normal',
                textDecoration: edgeStyle?.labelTextDecoration || 'none',
                backgroundColor: edgeStyle?.labelBgColor || 'var(--bg-secondary, rgba(30,30,30,0.95))',
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
})
