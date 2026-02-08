import { MiniMap } from '@xyflow/react'
import { useCallback } from 'react'
import type { Node } from '@xyflow/react'
import { cn } from '@/utils/cn'

interface DiagramMinimapProps {
  className?: string
  visible?: boolean
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

// Get node color based on type for minimap
function getNodeColor(node: Node): string {
  const type = node.data?.type as string

  // Cloud provider colors
  if (type?.startsWith('aws-')) return '#FF9900' // AWS Orange
  if (type?.startsWith('azure-')) return '#0078D4' // Azure Blue
  if (type?.startsWith('gcp-')) return '#4285F4' // GCP Blue
  if (type?.startsWith('office-') || type?.startsWith('m365-')) return '#D83B01' // Microsoft Orange
  if (type?.startsWith('power-')) return '#742774' // Power Platform Purple

  // Shape type colors
  switch (type) {
    case 'rectangle':
    case 'process':
      return '#64748B'
    case 'rounded-rectangle':
      return '#6366F1'
    case 'diamond':
    case 'decision':
      return '#F59E0B'
    case 'circle':
    case 'ellipse':
      return '#10B981'
    case 'parallelogram':
      return '#8B5CF6'
    case 'cylinder':
    case 'database':
      return '#3B82F6'
    case 'cloud':
      return '#06B6D4'
    case 'hexagon':
      return '#EC4899'
    case 'note':
    case 'sticky-note':
      return '#FBBF24'
    case 'text':
      return '#9CA3AF'
    case 'container':
    case 'group':
      return '#4ADE80'
    case 'kubernetes':
    case 'docker':
      return '#326CE5'
    default:
      return '#64748B'
  }
}

export function DiagramMinimap({
  className,
  visible = true,
  position = 'bottom-right',
}: DiagramMinimapProps) {
  const nodeColor = useCallback((node: Node) => getNodeColor(node), [])

  if (!visible) return null

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-20 right-4', // Offset for quick actions button
  }

  return (
    <div
      className={cn(
        'absolute z-10',
        positionClasses[position],
        className
      )}
    >
      <MiniMap
        nodeColor={nodeColor}
        nodeStrokeWidth={2}
        maskColor="rgba(0, 0, 0, 0.6)"
        className={cn(
          'rounded-lg overflow-hidden shadow-lg',
          'border border-supabase-border',
          '!bg-supabase-bg-secondary',
          '[&_.react-flow__minimap-mask]:fill-supabase-bg/80'
        )}
        style={{
          width: 160,
          height: 100,
        }}
        pannable
        zoomable
      />
    </div>
  )
}

// Minimap toggle button component
interface MinimapToggleProps {
  visible: boolean
  onToggle: () => void
  className?: string
}

export function MinimapToggle({ visible, onToggle, className }: MinimapToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'p-2 rounded-lg transition-colors',
        'bg-supabase-bg-secondary border border-supabase-border',
        'hover:bg-supabase-bg-tertiary',
        'text-supabase-text-secondary hover:text-supabase-text-primary',
        visible && 'bg-supabase-bg-tertiary text-supabase-green',
        className
      )}
      title={visible ? 'Hide minimap' : 'Show minimap'}
    >
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <rect x="13" y="13" width="7" height="7" rx="1" className="fill-current opacity-30" />
      </svg>
    </button>
  )
}
