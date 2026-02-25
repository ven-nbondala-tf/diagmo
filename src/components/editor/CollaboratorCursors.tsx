import { memo } from 'react'
import { useStore } from '@xyflow/react'
import type { CollaboratorPresence } from '@/types'

interface CollaboratorCursorsProps {
  collaborators: CollaboratorPresence[]
}

/**
 * Renders cursors for all collaborators currently viewing the diagram
 * Positioned using React Flow's viewport transform
 */
export const CollaboratorCursors = memo(function CollaboratorCursors({
  collaborators,
}: CollaboratorCursorsProps) {
  // Get viewport transform from React Flow
  const transform = useStore((s) => s.transform)
  const [tx, ty, zoom] = transform

  // Filter to only collaborators with valid cursor positions
  const activeCursors = collaborators.filter(
    (c) => c.cursorX !== null && c.cursorY !== null
  )

  if (activeCursors.length === 0) return null

  return (
    <svg
      className="pointer-events-none absolute inset-0 overflow-visible"
      style={{ zIndex: 100 }}
    >
      <g transform={`translate(${tx}, ${ty}) scale(${zoom})`}>
        {activeCursors.map((collaborator) => (
          <CollaboratorCursor
            key={collaborator.id}
            name={collaborator.user?.fullName || 'Anonymous'}
            color={collaborator.color}
            x={collaborator.cursorX!}
            y={collaborator.cursorY!}
            isDrawing={collaborator.isDrawing}
          />
        ))}
      </g>
    </svg>
  )
})

interface CollaboratorCursorProps {
  name: string
  color: string
  x: number
  y: number
  isDrawing?: boolean
}

/**
 * Individual cursor with pointer and name label
 * Shows a pen icon when the user is drawing
 */
const CollaboratorCursor = memo(function CollaboratorCursor({
  name,
  color,
  x,
  y,
  isDrawing,
}: CollaboratorCursorProps) {
  // Get first name or first 10 chars
  const displayName = name.split(' ')[0]?.slice(0, 10) || 'User'
  // Add pen emoji when drawing
  const labelText = isDrawing ? `✏️ ${displayName}` : displayName
  const labelWidth = isDrawing ? (displayName.length * 7 + 28) : (displayName.length * 7 + 8)

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Cursor - use pen shape when drawing, otherwise pointer */}
      {isDrawing ? (
        // Pen cursor for drawing mode
        <g transform="rotate(-45)">
          <rect x="-2" y="-2" width="4" height="16" rx="1" fill={color} stroke="white" strokeWidth={1} />
          <polygon points="-2,14 0,20 2,14" fill={color} stroke="white" strokeWidth={1} />
        </g>
      ) : (
        // Standard pointer cursor
        <path
          d="M0 0 L0 16 L4 12 L8 20 L10 19 L6 11 L12 11 Z"
          fill={color}
          stroke="white"
          strokeWidth={1.5}
          style={{
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
          }}
        />
      )}
      {/* Name label */}
      <g transform="translate(14, 18)">
        <rect
          x={-2}
          y={-10}
          width={labelWidth}
          height={16}
          rx={4}
          fill={color}
          style={{
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
          }}
        />
        <text
          x={2}
          y={2}
          fill="white"
          fontSize={11}
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight={500}
        >
          {labelText}
        </text>
      </g>
    </g>
  )
})
