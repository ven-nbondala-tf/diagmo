import { useState, useCallback, type CSSProperties } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
  type Edge,
} from '@xyflow/react'
import { Input } from '@/components/ui'

interface LabeledEdgeData extends Record<string, unknown> {
  label?: string
  onLabelChange?: (label: string) => void
}

type LabeledEdgeType = Edge<LabeledEdgeData>

export function LabeledEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  data,
}: EdgeProps<LabeledEdgeType>) {
  const edgeData = data as LabeledEdgeData | undefined
  const [isEditing, setIsEditing] = useState(false)
  const [labelText, setLabelText] = useState(edgeData?.label || '')

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
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style as CSSProperties} />
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
