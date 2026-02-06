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
      style={{ zIndex: 9999 }}
    >
      <g transform={`translate(${tx}, ${ty}) scale(${zoom})`}>
        {activeCursors.map((collaborator) => (
          <CollaboratorCursor
            key={collaborator.id}
            name={collaborator.user?.fullName || 'Anonymous'}
            color={collaborator.color}
            x={collaborator.cursorX!}
            y={collaborator.cursorY!}
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
}

/**
 * Individual cursor with pointer and name label
 */
const CollaboratorCursor = memo(function CollaboratorCursor({
  name,
  color,
  x,
  y,
}: CollaboratorCursorProps) {
  // Get first name or first 10 chars
  const displayName = name.split(' ')[0]?.slice(0, 10) || 'User'

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Cursor pointer SVG */}
      <path
        d="M0 0 L0 16 L4 12 L8 20 L10 19 L6 11 L12 11 Z"
        fill={color}
        stroke="white"
        strokeWidth={1.5}
        style={{
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
        }}
      />
      {/* Name label */}
      <g transform="translate(14, 18)">
        <rect
          x={-2}
          y={-10}
          width={displayName.length * 7 + 8}
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
          {displayName}
        </text>
      </g>
    </g>
  )
})
