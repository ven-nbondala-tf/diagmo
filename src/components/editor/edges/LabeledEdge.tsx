import { useState, useCallback, useMemo, type CSSProperties } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
  type Edge,
  MarkerType,
} from '@xyflow/react'
import { Input } from '@/components/ui'
import type { EdgeStyle } from '@/types'

interface LabeledEdgeData extends Record<string, unknown> {
  label?: string
  style?: EdgeStyle
  onLabelChange?: (label: string) => void
}

type LabeledEdgeType = Edge<LabeledEdgeData>

// Helper to convert marker type to ReactFlow marker URL
const getMarkerUrl = (markerType: EdgeStyle['markerEnd']): string | undefined => {
  if (!markerType || markerType === 'none') return undefined

  // ReactFlow uses marker URLs for built-in markers
  const markerTypeMap: Record<string, MarkerType> = {
    arrow: MarkerType.Arrow,
    arrowClosed: MarkerType.ArrowClosed,
  }

  const type = markerTypeMap[markerType] || MarkerType.ArrowClosed
  // Return the marker type string for ReactFlow's internal handling
  return `url(#${type})`
}

// Helper to convert line type to stroke dasharray
const getStrokeDasharray = (lineType?: EdgeStyle['lineType']) => {
  switch (lineType) {
    case 'dashed':
      return '8 4'
    case 'dotted':
      return '2 4'
    default:
      return undefined
  }
}

export function LabeledEdge({
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
}: EdgeProps<LabeledEdgeType>) {
  const edgeData = data as LabeledEdgeData | undefined
  const edgeStyle = edgeData?.style
  const [isEditing, setIsEditing] = useState(false)
  const [labelText, setLabelText] = useState(edgeData?.label || '')

  // Compute effective styles
  const effectiveStyle = useMemo<CSSProperties>(() => {
    const strokeColor = edgeStyle?.strokeColor || '#374151'
    return {
      ...style,
      stroke: strokeColor,
      strokeWidth: edgeStyle?.strokeWidth || 2,
      strokeDasharray: getStrokeDasharray(edgeStyle?.lineType),
    }
  }, [style, edgeStyle])

  // Compute markers
  const effectiveMarkerEnd = useMemo((): string | undefined => {
    if (edgeStyle?.markerEnd) {
      return getMarkerUrl(edgeStyle.markerEnd)
    }
    return typeof defaultMarkerEnd === 'string' ? defaultMarkerEnd : undefined
  }, [edgeStyle?.markerEnd, defaultMarkerEnd])

  const effectiveMarkerStart = useMemo((): string | undefined => {
    if (edgeStyle?.markerStart) {
      return getMarkerUrl(edgeStyle.markerStart)
    }
    return typeof defaultMarkerStart === 'string' ? defaultMarkerStart : undefined
  }, [edgeStyle?.markerStart, defaultMarkerStart])

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true)
  }, [])

  const handleBlur = useCallback(() => {
    setIsEditing(false)
    edgeData?.onLabelChange?.(labelText)
  }, [labelText, edgeData])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        setIsEditing(false)
        edgeData?.onLabelChange?.(labelText)
      }
      if (e.key === 'Escape') {
        setIsEditing(false)
        setLabelText(edgeData?.label || '')
      }
    },
    [labelText, edgeData]
  )

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={effectiveMarkerEnd}
        markerStart={effectiveMarkerStart}
        style={effectiveStyle}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {isEditing ? (
            <Input
              value={labelText}
              onChange={(e) => setLabelText(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="h-6 w-24 text-xs text-center px-1"
              autoFocus
            />
          ) : (
            <div
              onDoubleClick={handleDoubleClick}
              className="px-2 py-0.5 text-xs bg-background border rounded cursor-pointer hover:bg-accent min-w-[20px] text-center"
            >
              {labelText || (
                <span className="text-muted-foreground italic">
                  Double-click to add label
                </span>
              )}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
