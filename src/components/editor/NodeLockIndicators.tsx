/**
 * Visual indicators for nodes that are locked by other collaborators
 * Shows a colored border and user name over locked nodes
 */
import { useStore } from '@xyflow/react'
import type { NodeLock } from '@/services/collaborationService'

interface NodeLockIndicatorsProps {
  locks: Map<string, NodeLock>
}

export function NodeLockIndicators({ locks }: NodeLockIndicatorsProps) {
  // Get the transform from React Flow to position indicators correctly
  const transform = useStore((state) => state.transform)
  // Get node internals to find node positions and dimensions
  const nodeLookup = useStore((state) => state.nodeLookup)

  if (locks.size === 0) return null

  const [x, y, zoom] = transform

  return (
    <svg
      className="pointer-events-none absolute inset-0 overflow-visible"
      style={{ zIndex: 5 }}
    >
      <g transform={`translate(${x}, ${y}) scale(${zoom})`}>
        {Array.from(locks.entries()).map(([nodeId, lock]) => {
          const node = nodeLookup.get(nodeId)
          if (!node) return null

          const { position, measured } = node
          const width = measured?.width || 150
          const height = measured?.height || 80

          return (
            <g key={nodeId}>
              {/* Lock border around node */}
              <rect
                x={position.x - 4}
                y={position.y - 4}
                width={width + 8}
                height={height + 8}
                fill="none"
                stroke={lock.color}
                strokeWidth={2 / zoom}
                strokeDasharray={`${4 / zoom} ${4 / zoom}`}
                rx={6}
                className="animate-pulse"
              />
              {/* User name badge */}
              <g transform={`translate(${position.x + width / 2}, ${position.y - 12})`}>
                <rect
                  x={-40}
                  y={-10}
                  width={80}
                  height={20}
                  rx={4}
                  fill={lock.color}
                  opacity={0.9}
                />
                <text
                  x={0}
                  y={4}
                  textAnchor="middle"
                  fill="white"
                  fontSize={11 / zoom}
                  fontWeight={500}
                  style={{ pointerEvents: 'none' }}
                >
                  {lock.userName.length > 10
                    ? lock.userName.slice(0, 10) + '...'
                    : lock.userName}
                </text>
              </g>
              {/* Lock icon */}
              <g transform={`translate(${position.x + width - 8}, ${position.y - 8})`}>
                <circle
                  cx={0}
                  cy={0}
                  r={10 / zoom}
                  fill={lock.color}
                />
                <path
                  d="M-3,-2 L-3,2 L3,2 L3,-2 Z M-2,-2 L-2,-4 Q-2,-6 0,-6 Q2,-6 2,-4 L2,-2"
                  fill="none"
                  stroke="white"
                  strokeWidth={1.5 / zoom}
                  transform={`scale(${0.8 / zoom})`}
                />
              </g>
            </g>
          )
        })}
      </g>
    </svg>
  )
}
