# DIAGMO - Fix Edge Routing (Orthogonal Connections)

## 🔍 PROBLEM ANALYSIS

Looking at your Diagmo screenshot, the edges look messy because:

1. **Current behavior**: Uses `smoothstep` which creates curved S-shaped paths
2. **Lucidchart behavior**: Uses **orthogonal routing** - straight lines with 90° corners

### What's Happening:
- Functions → VM Scale Sets: Curve goes up (should be straight horizontal, then straight up)
- Functions → Batch: Curve goes down (should be straight horizontal, then straight down)
- VM Scale Sets → Cloud Services: Curved (should be L-shaped with corner)
- Batch → Cloud Services: Multiple curves (should be clean L-shape)

### The Root Cause:
The `getSmoothStepPath` function creates curved, organic-looking paths. We need proper **orthogonal/elbow connectors**.

---

## 🎯 SOLUTION: Implement Orthogonal Edge Routing

Replace the entire edge path calculation logic in `LabeledEdge.tsx` with proper orthogonal routing.

### FILE: `src/components/editor/edges/LabeledEdge.tsx`

**REPLACE lines 149-212 with:**

```tsx
  // Calculate orthogonal (right-angle) edge path - Lucidchart style
  // This creates clean L-shaped or Z-shaped connectors
  
  let edgePath: string
  let labelX: number
  let labelY: number

  // Determine the best routing based on relative positions
  const dx = targetX - sourceX
  const dy = targetY - sourceY
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)

  // Check if source and target are roughly aligned
  const isHorizontallyAligned = absDy < 20 // Within 20px vertically
  const isVerticallyAligned = absDx < 20 // Within 20px horizontally

  // Check handle positions for optimal routing
  const sourceIsRight = sourcePosition === 'right'
  const sourceIsLeft = sourcePosition === 'left'
  const sourceIsTop = sourcePosition === 'top'
  const sourceIsBottom = sourcePosition === 'bottom'
  
  const targetIsRight = targetPosition === 'right'
  const targetIsLeft = targetPosition === 'left'
  const targetIsTop = targetPosition === 'top'
  const targetIsBottom = targetPosition === 'bottom'

  // CASE 1: Straight horizontal line (same Y, horizontal handles)
  if (isHorizontallyAligned && ((sourceIsRight && targetIsLeft) || (sourceIsLeft && targetIsRight))) {
    const midY = (sourceY + targetY) / 2
    edgePath = `M ${sourceX} ${midY} L ${targetX} ${midY}`
    labelX = (sourceX + targetX) / 2
    labelY = midY
  }
  // CASE 2: Straight vertical line (same X, vertical handles)
  else if (isVerticallyAligned && ((sourceIsTop && targetIsBottom) || (sourceIsBottom && targetIsTop))) {
    const midX = (sourceX + targetX) / 2
    edgePath = `M ${midX} ${sourceY} L ${midX} ${targetY}`
    labelX = midX
    labelY = (sourceY + targetY) / 2
  }
  // CASE 3: L-shaped connector (horizontal then vertical)
  else if ((sourceIsRight && targetIsLeft) || (sourceIsLeft && targetIsRight)) {
    // Go horizontal first, then vertical
    const midX = (sourceX + targetX) / 2
    edgePath = `M ${sourceX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetX} ${targetY}`
    labelX = midX
    labelY = (sourceY + targetY) / 2
  }
  // CASE 4: L-shaped connector (vertical then horizontal)  
  else if ((sourceIsTop && targetIsBottom) || (sourceIsBottom && targetIsTop)) {
    // Go vertical first, then horizontal
    const midY = (sourceY + targetY) / 2
    edgePath = `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`
    labelX = (sourceX + targetX) / 2
    labelY = midY
  }
  // CASE 5: Right handle to Top/Bottom handle - go right then up/down
  else if (sourceIsRight && (targetIsTop || targetIsBottom)) {
    edgePath = `M ${sourceX} ${sourceY} L ${targetX} ${sourceY} L ${targetX} ${targetY}`
    labelX = (sourceX + targetX) / 2
    labelY = sourceY
  }
  // CASE 6: Left handle to Top/Bottom handle - go left then up/down
  else if (sourceIsLeft && (targetIsTop || targetIsBottom)) {
    edgePath = `M ${sourceX} ${sourceY} L ${targetX} ${sourceY} L ${targetX} ${targetY}`
    labelX = (sourceX + targetX) / 2
    labelY = sourceY
  }
  // CASE 7: Top/Bottom handle to Right/Left handle - go up/down then sideways
  else if ((sourceIsTop || sourceIsBottom) && (targetIsRight || targetIsLeft)) {
    edgePath = `M ${sourceX} ${sourceY} L ${sourceX} ${targetY} L ${targetX} ${targetY}`
    labelX = sourceX
    labelY = (sourceY + targetY) / 2
  }
  // CASE 8: Same side handles (both right, both left, etc.) - need S-curve
  else if ((sourceIsRight && targetIsRight) || (sourceIsLeft && targetIsLeft)) {
    // Both horizontal same side - need to go out, around, and back
    const offset = sourceIsRight ? Math.max(40, absDx / 2) : -Math.max(40, absDx / 2)
    const outX = Math.max(sourceX, targetX) + (sourceIsRight ? 40 : 0)
    const midY = (sourceY + targetY) / 2
    edgePath = `M ${sourceX} ${sourceY} L ${outX} ${sourceY} L ${outX} ${targetY} L ${targetX} ${targetY}`
    labelX = outX
    labelY = midY
  }
  else if ((sourceIsTop && targetIsTop) || (sourceIsBottom && targetIsBottom)) {
    // Both vertical same side - need to go out, around, and back
    const outY = sourceIsTop ? Math.min(sourceY, targetY) - 40 : Math.max(sourceY, targetY) + 40
    const midX = (sourceX + targetX) / 2
    edgePath = `M ${sourceX} ${sourceY} L ${sourceX} ${outY} L ${targetX} ${outY} L ${targetX} ${targetY}`
    labelX = midX
    labelY = outY
  }
  // DEFAULT: Simple L-shape based on which direction has more distance
  else {
    if (absDx > absDy) {
      // More horizontal distance - go horizontal first
      const midX = (sourceX + targetX) / 2
      edgePath = `M ${sourceX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetX} ${targetY}`
      labelX = midX
      labelY = (sourceY + targetY) / 2
    } else {
      // More vertical distance - go vertical first
      const midY = (sourceY + targetY) / 2
      edgePath = `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`
      labelX = (sourceX + targetX) / 2
      labelY = midY
    }
  }
```

---

## 🎨 VISUAL RESULT

After this change:

| Connection | Before (Curved) | After (Orthogonal) |
|------------|-----------------|---------------------|
| Right → Left (different Y) | S-curve | Horizontal + Vertical + Horizontal |
| Right → Top | Curved path | Horizontal + Vertical |
| Bottom → Left | Curved path | Vertical + Horizontal |
| Same level | Curved | Straight line |

---

## ✅ COMPLETE LabeledEdge.tsx

Here's the complete updated file for reference:

```tsx
import { useState, useCallback, useMemo, type CSSProperties } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
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
  const edgeLabel = (label as string) || edgeData?.label || ''
  const [labelText, setLabelText] = useState(edgeLabel)
  const [isHovered, setIsHovered] = useState(false)

  if (labelText !== edgeLabel && !isEditing) {
    setLabelText(edgeLabel)
  }

  const hasLabel = edgeLabel.trim().length > 0
  const showLabelUI = hasLabel || isEditing || (selected && isHovered)

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

  // ========== ORTHOGONAL EDGE ROUTING ==========
  let edgePath: string
  let labelX: number
  let labelY: number

  const dx = targetX - sourceX
  const dy = targetY - sourceY
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)

  const isHorizontallyAligned = absDy < 15
  const isVerticallyAligned = absDx < 15

  const sourceIsRight = sourcePosition === 'right'
  const sourceIsLeft = sourcePosition === 'left'
  const sourceIsTop = sourcePosition === 'top'
  const sourceIsBottom = sourcePosition === 'bottom'
  
  const targetIsRight = targetPosition === 'right'
  const targetIsLeft = targetPosition === 'left'
  const targetIsTop = targetPosition === 'top'
  const targetIsBottom = targetPosition === 'bottom'

  // CASE 1: Straight horizontal line
  if (isHorizontallyAligned && ((sourceIsRight && targetIsLeft) || (sourceIsLeft && targetIsRight))) {
    const midY = (sourceY + targetY) / 2
    edgePath = `M ${sourceX} ${midY} L ${targetX} ${midY}`
    labelX = (sourceX + targetX) / 2
    labelY = midY
  }
  // CASE 2: Straight vertical line
  else if (isVerticallyAligned && ((sourceIsTop && targetIsBottom) || (sourceIsBottom && targetIsTop))) {
    const midX = (sourceX + targetX) / 2
    edgePath = `M ${midX} ${sourceY} L ${midX} ${targetY}`
    labelX = midX
    labelY = (sourceY + targetY) / 2
  }
  // CASE 3: Right to Left (different Y) - Z-shape horizontal routing
  else if (sourceIsRight && targetIsLeft) {
    const midX = sourceX + (targetX - sourceX) / 2
    edgePath = `M ${sourceX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetX} ${targetY}`
    labelX = midX
    labelY = (sourceY + targetY) / 2
  }
  // CASE 4: Left to Right (different Y) - Z-shape
  else if (sourceIsLeft && targetIsRight) {
    const midX = sourceX + (targetX - sourceX) / 2
    edgePath = `M ${sourceX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetX} ${targetY}`
    labelX = midX
    labelY = (sourceY + targetY) / 2
  }
  // CASE 5: Top to Bottom (different X) - Z-shape vertical routing
  else if (sourceIsTop && targetIsBottom) {
    const midY = sourceY + (targetY - sourceY) / 2
    edgePath = `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`
    labelX = (sourceX + targetX) / 2
    labelY = midY
  }
  // CASE 6: Bottom to Top (different X) - Z-shape
  else if (sourceIsBottom && targetIsTop) {
    const midY = sourceY + (targetY - sourceY) / 2
    edgePath = `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`
    labelX = (sourceX + targetX) / 2
    labelY = midY
  }
  // CASE 7: Right to Top/Bottom - L-shape
  else if (sourceIsRight && (targetIsTop || targetIsBottom)) {
    edgePath = `M ${sourceX} ${sourceY} L ${targetX} ${sourceY} L ${targetX} ${targetY}`
    labelX = (sourceX + targetX) / 2
    labelY = sourceY
  }
  // CASE 8: Left to Top/Bottom - L-shape
  else if (sourceIsLeft && (targetIsTop || targetIsBottom)) {
    edgePath = `M ${sourceX} ${sourceY} L ${targetX} ${sourceY} L ${targetX} ${targetY}`
    labelX = (sourceX + targetX) / 2
    labelY = sourceY
  }
  // CASE 9: Top/Bottom to Right/Left - L-shape
  else if ((sourceIsTop || sourceIsBottom) && (targetIsRight || targetIsLeft)) {
    edgePath = `M ${sourceX} ${sourceY} L ${sourceX} ${targetY} L ${targetX} ${targetY}`
    labelX = sourceX
    labelY = (sourceY + targetY) / 2
  }
  // DEFAULT: Use midpoint routing
  else {
    if (absDx >= absDy) {
      const midX = (sourceX + targetX) / 2
      edgePath = `M ${sourceX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetX} ${targetY}`
      labelX = midX
      labelY = (sourceY + targetY) / 2
    } else {
      const midY = (sourceY + targetY) / 2
      edgePath = `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`
      labelX = (sourceX + targetX) / 2
      labelY = midY
    }
  }

  const handleDoubleClick = useCallback(() => setIsEditing(true), [])
  
  const handleBlur = useCallback(() => {
    setIsEditing(false)
    edgeData?.onLabelChange?.(labelText)
  }, [labelText, edgeData])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditing(false)
      edgeData?.onLabelChange?.(labelText)
    }
    if (e.key === 'Escape') {
      setIsEditing(false)
      setLabelText(edgeData?.label || '')
    }
  }, [labelText, edgeData])

  return (
    <g onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <BaseEdge
        path={edgePath}
        markerEnd={effectiveMarkerEnd}
        markerStart={effectiveMarkerStart}
        style={effectiveStyle}
        interactionWidth={20}
      />
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
                  padding: labelBgPadding ? `${labelBgPadding[0]}px ${labelBgPadding[1]}px` : '2px 4px',
                  borderRadius: labelBgBorderRadius ?? 0,
                  border: (edgeStyle?.labelBgColor || labelBgStyle?.fill) ? '1px solid hsl(var(--border))' : 'none',
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
```

---

## 📊 EXPECTED RESULT

After this fix, your edges will:

1. ✅ Use **straight lines with 90° corners** (orthogonal routing)
2. ✅ No more S-curves or organic-looking paths
3. ✅ Look exactly like Lucidchart's connectors
4. ✅ Automatically choose best routing based on handle positions

### Visual Example:
```
BEFORE (smoothstep):          AFTER (orthogonal):
                              
○──╮                          ○────┐
   ╰──○                            │
                                   └──○

○──╮                          ○────┐
   │                               │
   ╰──○                            └──○
```

---

## 🧪 TESTING

After implementing:

1. Create two shapes side by side → Edge should be straight horizontal
2. Create two shapes at different Y levels, connect right→left → Z-shaped path
3. Create shapes diagonally, connect right→top → L-shaped path
4. All corners should be 90° angles, no curves
