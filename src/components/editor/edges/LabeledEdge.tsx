import { useState, useCallback, useMemo, type CSSProperties } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
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

// Extended edge type to include label styling properties
interface LabeledEdgeType extends Edge<LabeledEdgeData> {
  labelBgStyle?: { fill?: string }
  labelBgPadding?: [number, number]
  labelBgBorderRadius?: number
}

// Helper to convert marker definition to URL string for BaseEdge
// React Flow creates marker defs with IDs like: react-flow__arrowclosed-#color
const getMarkerUrlFromObject = (marker: unknown): string | undefined => {
  if (!marker) return undefined

  if (typeof marker === 'string') {
    return marker
  }

  if (typeof marker === 'object' && marker !== null) {
    const m = marker as { type?: MarkerType; color?: string }
    if (m.type) {
      // React Flow marker ID format: react-flow__[type]-[color]
      // Color needs to be URL encoded (# becomes %23)
      const color = m.color ? m.color.replace('#', '%23') : '%236b7280'
      return `url(#react-flow__${m.type}-${color})`
    }
  }

  return undefined
}

// Helper to convert our custom style marker type to URL
const getMarkerUrl = (markerType: EdgeStyle['markerEnd']): string | undefined => {
  if (!markerType || markerType === 'none') return undefined

  // Default color for custom style markers
  const color = '%236b7280'
  const type = markerType === 'arrow' ? MarkerType.Arrow : MarkerType.ArrowClosed
  return `url(#react-flow__${type}-${color})`
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
  selected,
  label, // Get label directly from edge props
  labelBgStyle,
  labelBgPadding,
  labelBgBorderRadius,
}: EdgeProps<LabeledEdgeType> & {
  labelBgStyle?: { fill?: string }
  labelBgPadding?: [number, number]
  labelBgBorderRadius?: number
}) {
  const edgeData = data as LabeledEdgeData | undefined
  const edgeStyle = edgeData?.style
  const [isEditing, setIsEditing] = useState(false)
  // Use edge label from props, or from data, and sync with local state for editing
  const edgeLabel = (label as string) || edgeData?.label || ''
  const [labelText, setLabelText] = useState(edgeLabel)
  const [isHovered, setIsHovered] = useState(false)

  // Sync labelText when edge label changes from outside (e.g., properties panel)
  if (labelText !== edgeLabel && !isEditing) {
    setLabelText(edgeLabel)
  }

  // Only show label UI if there's actual text or if editing
  const hasLabel = edgeLabel.trim().length > 0
  const showLabelUI = hasLabel || isEditing || (selected && isHovered)

  // Compute effective styles - merge React Flow style prop with custom data.style
  // PropertiesPanel updates edge.style, so we need to read from both sources
  const effectiveStyle = useMemo<CSSProperties>(() => {
    // Priority: edgeStyle (data.style) > style prop (React Flow) > defaults
    const stroke = edgeStyle?.strokeColor || (style?.stroke as string) || '#374151'
    const strokeWidth = edgeStyle?.strokeWidth || (style?.strokeWidth as number) || 2

    // For dasharray, check edgeStyle.lineType first, then style.strokeDasharray
    let strokeDasharray: string | undefined
    if (edgeStyle?.lineType) {
      strokeDasharray = getStrokeDasharray(edgeStyle.lineType)
    } else if (style?.strokeDasharray) {
      strokeDasharray = style.strokeDasharray as string
    }

    return {
      ...style,
      stroke,
      strokeWidth,
      strokeDasharray,
    }
  }, [style, edgeStyle])

  // Compute markers - convert to URL string for BaseEdge
  const effectiveMarkerEnd = useMemo((): string | undefined => {
    if (edgeStyle?.markerEnd) {
      return getMarkerUrl(edgeStyle.markerEnd)
    }
    // Convert the default marker object to URL string
    return getMarkerUrlFromObject(defaultMarkerEnd)
  }, [edgeStyle?.markerEnd, defaultMarkerEnd])

  const effectiveMarkerStart = useMemo((): string | undefined => {
    if (edgeStyle?.markerStart) {
      return getMarkerUrl(edgeStyle.markerStart)
    }
    // Convert the default marker object to URL string
    return getMarkerUrlFromObject(defaultMarkerStart)
  }, [edgeStyle?.markerStart, defaultMarkerStart])

  // Smart edge routing: Lucidchart style
  // Use straight line ONLY when handles are on OPPOSITE sides and aligned
  const deltaX = Math.abs(targetX - sourceX)
  const deltaY = Math.abs(targetY - sourceY)

  // Check if handles are on opposite sides (can form a straight line)
  const isHorizontalConnection =
    (sourcePosition === 'left' && targetPosition === 'right') ||
    (sourcePosition === 'right' && targetPosition === 'left')

  const isVerticalConnection =
    (sourcePosition === 'top' && targetPosition === 'bottom') ||
    (sourcePosition === 'bottom' && targetPosition === 'top')

  // Use straight line for opposite-side connections that are reasonably aligned
  // - Horizontal: left↔right with offset ratio < 1.0 (allows diagonal lines)
  // - Vertical: top↔bottom with offset ratio < 1.0
  // Also use straight line if shapes are very close together (within 50px)
  const useStraightLine =
    (isHorizontalConnection && deltaX > 20 && (deltaY / deltaX < 1.0 || deltaY < 50)) ||
    (isVerticalConnection && deltaY > 20 && (deltaX / deltaY < 1.0 || deltaX < 50))

  // Calculate the path - NO extension, use exact handle positions
  let edgePath: string
  let labelX: number
  let labelY: number

  // Snap-to-straight threshold
  const snapThreshold = 20

  // Calculate adjusted coordinates (may snap to straight)
  let adjSourceX = sourceX
  let adjSourceY = sourceY
  let adjTargetX = targetX
  let adjTargetY = targetY

  // Snap to perfectly horizontal/vertical when nearly aligned
  if (useStraightLine) {
    if (isHorizontalConnection && deltaY < snapThreshold) {
      const midY = (sourceY + targetY) / 2
      adjSourceY = midY
      adjTargetY = midY
    } else if (isVerticalConnection && deltaX < snapThreshold) {
      const midX = (sourceX + targetX) / 2
      adjSourceX = midX
      adjTargetX = midX
    }
  }

  if (useStraightLine) {
    // Direct straight line - no extension
    ;[edgePath, labelX, labelY] = getStraightPath({
      sourceX: adjSourceX,
      sourceY: adjSourceY,
      targetX: adjTargetX,
      targetY: adjTargetY,
    })
  } else {
    // Smoothstep for non-aligned connections
    ;[edgePath, labelX, labelY] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      borderRadius: 6, // Slightly smaller radius
    })
  }

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
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <BaseEdge
        path={edgePath}
        markerEnd={effectiveMarkerEnd}
        markerStart={effectiveMarkerStart}
        style={effectiveStyle}
        interactionWidth={20}
      />
      {/* Only show label UI if there's text, editing, or selected+hovered */}
      {showLabelUI && (
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
                className="cursor-pointer hover:opacity-80 min-w-[20px] text-center"
                style={{
                  backgroundColor: edgeStyle?.labelBgColor || labelBgStyle?.fill || 'transparent',
                  padding: labelBgPadding
                    ? `${labelBgPadding[0]}px ${labelBgPadding[1]}px`
                    : '2px 4px',
                  borderRadius: labelBgBorderRadius ?? 0,
                  border: (edgeStyle?.labelBgColor || labelBgStyle?.fill) ? '1px solid hsl(var(--border))' : 'none',
                  // Text styling from EdgeStyle
                  color: edgeStyle?.labelColor || '#374151',
                  fontSize: edgeStyle?.labelFontSize ? `${edgeStyle.labelFontSize}px` : '12px',
                  fontFamily: edgeStyle?.labelFontFamily || 'inherit',
                  fontWeight: edgeStyle?.labelFontWeight || 'normal',
                  fontStyle: edgeStyle?.labelFontStyle || 'normal',
                  textDecoration: edgeStyle?.labelTextDecoration || 'none',
                }}
              >
                {labelText}
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </g>
  )
}
