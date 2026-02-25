import { useState, useMemo } from 'react'
import type { Diagram, DiagramNode, DiagramEdge, DiagramStatus } from '@/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui'
import { MoveToWorkspaceDialog } from './MoveToWorkspaceDialog'
import { MoreVertical, Copy, FolderInput, Trash2, Loader2, Home, Users, Layers, ArrowRightLeft, Star, ChevronDown } from 'lucide-react'
import { useDeleteDiagram, useDuplicateDiagram, useMoveDiagramToFolder, useFolders, useWorkspaces, useUpdateDiagramStatus } from '@/hooks'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { toast } from 'sonner'
import { cn } from '@/utils'

const STATUS_CONFIG: Record<DiagramStatus, { label: string; color: string; bgColor: string }> = {
  draft: { label: 'Draft', color: 'text-blue-600', bgColor: 'bg-blue-500' },
  internal: { label: 'Internal', color: 'text-gray-600', bgColor: 'bg-gray-400' },
  pending_review: { label: 'Pending review', color: 'text-amber-600', bgColor: 'bg-amber-500' },
  approved: { label: 'Approved', color: 'text-green-600', bgColor: 'bg-green-500' },
}

interface DiagramCardProps {
  diagram: Diagram
  onClick: () => void
  isShared?: boolean
  isTemplate?: boolean
}

// Get color for node type (cloud provider colors) - use strong, visible colors
function getNodeTypeColor(type: string): string {
  if (type.startsWith('aws-')) return '#FF9900' // AWS Orange
  if (type.startsWith('azure-')) return '#0078D4' // Azure Blue
  if (type.startsWith('gcp-')) return '#4285F4' // GCP Blue
  if (type.startsWith('office-') || type.startsWith('m365-') || type.startsWith('power-')) return '#D83B01' // Microsoft Orange
  if (type === 'kubernetes' || type === 'docker') return '#326CE5' // K8s Blue
  // Flowchart colors
  if (type === 'diamond' || type === 'decision') return '#F59E0B' // Amber
  if (type === 'circle' || type === 'ellipse') return '#10B981' // Green
  if (type === 'parallelogram') return '#8B5CF6' // Purple
  if (type === 'database' || type === 'cylinder') return '#3B82F6' // Blue
  if (type === 'process' || type === 'terminator') return '#6366F1' // Indigo
  // Use a strong, visible default color
  return '#475569' // Slate-600 (darker for better visibility)
}

// Check if a color is too light for dark backgrounds
function isLightColor(color: string): boolean {
  if (!color) return false
  // Handle hex colors
  let hex = color.replace('#', '')
  if (hex.length === 3 && hex[0] && hex[1] && hex[2]) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }
  if (hex.length !== 6) return false
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  // Calculate perceived brightness (YIQ formula)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 180 // Consider colors with brightness > 180 as "light"
}

// Get a contrasting color for preview on dark background
function getPreviewColor(color: string, fallbackColor: string): string {
  if (!color || color === 'transparent' || color === 'none') {
    return fallbackColor
  }
  // If the color is too light, use a darker alternative
  if (isLightColor(color)) {
    return '#64748B' // Use slate gray for light colors
  }
  return color
}

// Mini diagram preview component - renders nodes/edges as actual diagram shapes
function DiagramMiniPreview({ nodes, edges }: { nodes: DiagramNode[]; edges: DiagramEdge[] }) {
  const { viewBox, scaledNodes, scaledEdges } = useMemo(() => {
    if (!nodes || nodes.length === 0) {
      return { viewBox: '0 0 100 100', scaledNodes: [], scaledEdges: [] }
    }

    // Calculate bounds - handle nodes that might be missing position data
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    let hasValidPositions = false

    nodes.forEach(node => {
      // Try multiple ways to get position (React Flow stores it at node.position)
      const pos = node.position || (node as Record<string, unknown>)
      const x = typeof pos?.x === 'number' ? pos.x : 0
      const y = typeof pos?.y === 'number' ? pos.y : 0

      // Get dimensions from various possible locations
      const measured = node.measured || {}
      const nodeStyle = node.style || {}
      const width = (measured.width ?? nodeStyle.width ?? node.width ?? 100) as number
      const height = (measured.height ?? nodeStyle.height ?? node.height ?? 60) as number

      if (typeof pos?.x === 'number' && typeof pos?.y === 'number') {
        hasValidPositions = true
      }

      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x + width)
      maxY = Math.max(maxY, y + height)
    })

    // Handle case where bounds are invalid - create a simple grid layout
    if (!isFinite(minX) || !isFinite(minY) || !hasValidPositions) {
      // Create a simple fallback layout
      const cols = Math.ceil(Math.sqrt(nodes.length))
      const cellWidth = 120
      const cellHeight = 80
      const padding = 20

      const fallbackNodes = nodes.map((node, i) => {
        const col = i % cols
        const row = Math.floor(i / cols)
        const nodeType = node.data?.type || 'rectangle'
        const typeColor = getNodeTypeColor(nodeType)

        return {
          id: node.id,
          x: padding + col * cellWidth,
          y: padding + row * cellHeight,
          width: 80,
          height: 50,
          type: nodeType,
          color: typeColor,
          borderColor: typeColor,
          isCloudIcon: nodeType.startsWith('aws-') || nodeType.startsWith('azure-') ||
                       nodeType.startsWith('gcp-') || nodeType.startsWith('office-') ||
                       nodeType === 'kubernetes' || nodeType === 'docker',
        }
      })

      const totalWidth = padding * 2 + cols * cellWidth
      const totalHeight = padding * 2 + Math.ceil(nodes.length / cols) * cellHeight

      return {
        viewBox: `0 0 ${totalWidth} ${totalHeight}`,
        scaledNodes: fallbackNodes,
        scaledEdges: [] as { id: string; x1: number; y1: number; x2: number; y2: number; color: string }[],
      }
    }

    // Add padding
    const padding = 40
    minX -= padding
    minY -= padding
    maxX += padding
    maxY += padding

    const width = Math.max(maxX - minX, 100)
    const height = Math.max(maxY - minY, 100)

    // Scale nodes to fit viewBox
    const scaled = nodes.map(node => {
      const nodeType = node.data?.type || 'rectangle'
      const measured = node.measured || {}
      const nodeStyle = node.style || {}
      const nodeWidth = (measured.width ?? nodeStyle.width ?? node.width ?? 100) as number
      const nodeHeight = (measured.height ?? nodeStyle.height ?? node.height ?? 60) as number

      const typeColor = getNodeTypeColor(nodeType)
      const bgColor = node.data?.style?.backgroundColor
      const borderClr = node.data?.style?.borderColor

      // Get position
      const pos = node.position || {}
      const x = typeof pos.x === 'number' ? pos.x : 0
      const y = typeof pos.y === 'number' ? pos.y : 0

      return {
        id: node.id,
        x: x - minX,
        y: y - minY,
        width: nodeWidth,
        height: nodeHeight,
        type: nodeType,
        // Use getPreviewColor to ensure visibility on dark background
        color: getPreviewColor(bgColor || '', typeColor),
        borderColor: getPreviewColor(borderClr || '', typeColor),
        isCloudIcon: nodeType.startsWith('aws-') || nodeType.startsWith('azure-') ||
                     nodeType.startsWith('gcp-') || nodeType.startsWith('office-') ||
                     nodeType === 'kubernetes' || nodeType === 'docker',
      }
    })

    // Map edges to node positions
    const edgeLines = (edges || []).map(edge => {
      const source = scaled.find(n => n.id === edge.source)
      const target = scaled.find(n => n.id === edge.target)
      if (!source || !target) return null
      const edgeStroke = edge.data?.style?.strokeColor || edge.style?.stroke as string
      return {
        id: edge.id,
        x1: source.x + source.width / 2,
        y1: source.y + source.height / 2,
        x2: target.x + target.width / 2,
        y2: target.y + target.height / 2,
        color: getPreviewColor(edgeStroke || '', '#64748B'),
      }
    }).filter(Boolean)

    return {
      viewBox: `0 0 ${width} ${height}`,
      scaledNodes: scaled,
      scaledEdges: edgeLines as { id: string; x1: number; y1: number; x2: number; y2: number; color: string }[],
    }
  }, [nodes, edges])

  if (!nodes || nodes.length === 0) {
    return <EmptyPattern />
  }

  return (
    <div
      className="w-full h-full relative overflow-hidden bg-supabase-bg-tertiary"
      style={{ backgroundColor: 'var(--bg-tertiary)' }}
    >
      {/* Subtle grid pattern background */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.15]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id={`preview-grid-${nodes.length}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--text-muted)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#preview-grid-${nodes.length})`} />
      </svg>

      {/* Mini diagram */}
      <svg
        className="absolute inset-0 w-full h-full p-2"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Edges with arrows */}
        <defs>
          <marker
            id="preview-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748B" opacity="0.5" />
          </marker>
        </defs>

        {scaledEdges.map(edge => (
          <line
            key={edge.id}
            x1={edge.x1}
            y1={edge.y1}
            x2={edge.x2}
            y2={edge.y2}
            stroke={edge.color}
            strokeWidth="2"
            strokeOpacity="0.7"
            markerEnd="url(#preview-arrow)"
          />
        ))}

        {/* Nodes with actual colors - use stronger colors for visibility */}
        {scaledNodes.map(node => (
          <g key={node.id}>
            {node.isCloudIcon ? (
              // Cloud icons shown as rounded squares with color
              <g>
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                  rx={8}
                  fill={node.color}
                  fillOpacity="0.35"
                  stroke={node.color}
                  strokeWidth="2.5"
                  strokeOpacity="1"
                />
                {/* Small icon indicator circle */}
                <circle
                  cx={node.x + node.width / 2}
                  cy={node.y + node.height / 2}
                  r={Math.min(node.width, node.height) / 4}
                  fill={node.color}
                  fillOpacity="0.7"
                />
              </g>
            ) : node.type === 'circle' || node.type === 'ellipse' ? (
              <ellipse
                cx={node.x + node.width / 2}
                cy={node.y + node.height / 2}
                rx={node.width / 2}
                ry={node.height / 2}
                fill={node.color}
                fillOpacity="0.35"
                stroke={node.borderColor}
                strokeWidth="2.5"
                strokeOpacity="1"
              />
            ) : node.type === 'diamond' || node.type === 'decision' ? (
              <polygon
                points={`
                  ${node.x + node.width / 2},${node.y}
                  ${node.x + node.width},${node.y + node.height / 2}
                  ${node.x + node.width / 2},${node.y + node.height}
                  ${node.x},${node.y + node.height / 2}
                `}
                fill={node.color}
                fillOpacity="0.35"
                stroke={node.borderColor}
                strokeWidth="2.5"
                strokeOpacity="1"
              />
            ) : node.type === 'parallelogram' ? (
              <polygon
                points={`
                  ${node.x + node.width * 0.2},${node.y}
                  ${node.x + node.width},${node.y}
                  ${node.x + node.width * 0.8},${node.y + node.height}
                  ${node.x},${node.y + node.height}
                `}
                fill={node.color}
                fillOpacity="0.35"
                stroke={node.borderColor}
                strokeWidth="2.5"
                strokeOpacity="1"
              />
            ) : node.type === 'cylinder' || node.type === 'database' ? (
              <g>
                <ellipse
                  cx={node.x + node.width / 2}
                  cy={node.y + node.height * 0.15}
                  rx={node.width / 2}
                  ry={node.height * 0.15}
                  fill={node.color}
                  fillOpacity="0.35"
                  stroke={node.borderColor}
                  strokeWidth="2.5"
                  strokeOpacity="1"
                />
                <rect
                  x={node.x}
                  y={node.y + node.height * 0.15}
                  width={node.width}
                  height={node.height * 0.7}
                  fill={node.color}
                  fillOpacity="0.35"
                  stroke="none"
                />
                <line x1={node.x} y1={node.y + node.height * 0.15} x2={node.x} y2={node.y + node.height * 0.85} stroke={node.borderColor} strokeWidth="2.5" strokeOpacity="1" />
                <line x1={node.x + node.width} y1={node.y + node.height * 0.15} x2={node.x + node.width} y2={node.y + node.height * 0.85} stroke={node.borderColor} strokeWidth="2.5" strokeOpacity="1" />
                <ellipse
                  cx={node.x + node.width / 2}
                  cy={node.y + node.height * 0.85}
                  rx={node.width / 2}
                  ry={node.height * 0.15}
                  fill={node.color}
                  fillOpacity="0.35"
                  stroke={node.borderColor}
                  strokeWidth="2.5"
                  strokeOpacity="1"
                />
              </g>
            ) : (
              // Default rectangle
              <rect
                x={node.x}
                y={node.y}
                width={node.width}
                height={node.height}
                rx={node.type === 'rounded-rectangle' ? 8 : 3}
                fill={node.color}
                fillOpacity="0.35"
                stroke={node.borderColor}
                strokeWidth="2.5"
                strokeOpacity="1"
              />
            )}
          </g>
        ))}
      </svg>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-supabase-bg/30 via-transparent to-transparent pointer-events-none" />

      {/* Node count badge */}
      <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-supabase-bg-secondary/80 text-supabase-text-muted backdrop-blur-sm">
        {nodes.length} {nodes.length === 1 ? 'node' : 'nodes'}
      </div>
    </div>
  )
}

// Empty pattern for diagrams with no nodes - shows placeholder diagram
function EmptyPattern() {
  return (
    <div
      className="w-full h-full relative overflow-hidden bg-supabase-bg-tertiary"
      style={{ backgroundColor: 'var(--bg-tertiary)' }}
    >
      {/* Grid pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.1]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="empty-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--text-muted)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#empty-grid)" />
      </svg>

      {/* Placeholder diagram shapes */}
      <svg className="absolute inset-0 w-full h-full p-4" viewBox="0 0 200 120">
        {/* Sample shapes to indicate it's a diagram tool */}
        <rect x="10" y="20" width="50" height="30" rx="4" fill="#3ECF8E" fillOpacity="0.3" stroke="#3ECF8E" strokeWidth="1.5" strokeOpacity="0.6" />
        <rect x="75" y="45" width="50" height="30" rx="4" fill="#4285F4" fillOpacity="0.3" stroke="#4285F4" strokeWidth="1.5" strokeOpacity="0.6" />
        <rect x="140" y="20" width="50" height="30" rx="4" fill="#FF9900" fillOpacity="0.3" stroke="#FF9900" strokeWidth="1.5" strokeOpacity="0.6" />
        <ellipse cx="35" cy="90" rx="25" ry="15" fill="#8B5CF6" fillOpacity="0.3" stroke="#8B5CF6" strokeWidth="1.5" strokeOpacity="0.6" />
        <rect x="140" y="70" width="50" height="30" rx="4" fill="#0078D4" fillOpacity="0.3" stroke="#0078D4" strokeWidth="1.5" strokeOpacity="0.6" />

        {/* Connection lines */}
        <line x1="60" y1="35" x2="75" y2="55" stroke="#64748B" strokeWidth="1" strokeOpacity="0.5" />
        <line x1="125" y1="55" x2="140" y2="35" stroke="#64748B" strokeWidth="1" strokeOpacity="0.5" />
        <line x1="100" y1="75" x2="140" y2="80" stroke="#64748B" strokeWidth="1" strokeOpacity="0.5" />
        <line x1="35" y1="75" x2="75" y2="60" stroke="#64748B" strokeWidth="1" strokeOpacity="0.5" />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <Layers className="h-6 w-6 text-supabase-text-muted mx-auto mb-1 opacity-60" />
          <span className="text-[10px] text-supabase-text-muted opacity-80">Empty diagram</span>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-supabase-bg/30 to-transparent pointer-events-none" />
    </div>
  )
}

export function DiagramCard({ diagram, onClick, isShared }: DiagramCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showMoveWorkspaceDialog, setShowMoveWorkspaceDialog] = useState(false)
  const deleteDiagram = useDeleteDiagram()
  const duplicateDiagram = useDuplicateDiagram()
  const moveDiagram = useMoveDiagramToFolder()
  const updateStatus = useUpdateDiagramStatus()
  const { data: folders } = useFolders()
  const { data: workspaces = [] } = useWorkspaces()
  const { isFavorite, toggleFavorite } = usePreferencesStore()

  const isFav = isFavorite(diagram.id)
  const currentStatus: DiagramStatus = diagram.status || 'draft'
  const statusConfig = STATUS_CONFIG[currentStatus]

  // Handle card click with explicit check
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on dropdown or dialogs
    if ((e.target as HTMLElement).closest('[data-radix-collection-item]') ||
        (e.target as HTMLElement).closest('[role="menu"]') ||
        (e.target as HTMLElement).closest('[role="dialog"]')) {
      return
    }
    onClick()
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite(diagram.id)
    toast.success(isFav ? 'Removed from favorites' : 'Added to favorites')
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    try {
      await deleteDiagram.mutateAsync(diagram.id)
      toast.success('Diagram deleted')
    } catch {
      toast.error('Failed to delete diagram')
    }
    setShowDeleteDialog(false)
  }

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await duplicateDiagram.mutateAsync(diagram.id)
      toast.success('Diagram duplicated')
    } catch {
      toast.error('Failed to duplicate diagram')
    }
  }

  const handleMoveToFolder = async (folderId: string | null) => {
    try {
      await moveDiagram.mutateAsync({ id: diagram.id, folderId })
      toast.success(folderId ? 'Moved to folder' : 'Moved to All Diagrams')
    } catch {
      toast.error('Failed to move diagram')
    }
  }

  const handleStatusChange = async (newStatus: DiagramStatus, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await updateStatus.mutateAsync({ id: diagram.id, status: newStatus })
      toast.success(`Status changed to ${STATUS_CONFIG[newStatus].label}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <>
      <div
        className="group cursor-pointer rounded-lg border border-supabase-border bg-supabase-bg-secondary text-supabase-text-secondary overflow-hidden transition-all duration-200 ease-out hover:shadow-lg hover:border-supabase-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-default)',
          color: 'var(--text-secondary)'
        }}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`Open diagram: ${diagram.name}`}
      >
        {/* Header with icon and title */}
        <div className="flex items-center gap-2 p-3 border-b border-supabase-border">
          {/* Orange Lucidchart-style icon */}
          <div className="w-6 h-6 rounded bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <h3 className="font-medium text-sm truncate flex-1 text-supabase-text-primary">
            {diagram.name}
          </h3>
        </div>

        {/* Thumbnail Area - always use dynamic preview to respect theme colors */}
        <div
          className="relative aspect-[16/10] overflow-hidden bg-supabase-bg-tertiary"
          style={{ backgroundColor: 'var(--bg-tertiary)' }}
        >
          <DiagramMiniPreview nodes={diagram.nodes} edges={diagram.edges} />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

          {/* Top right: Favorite + Share indicator */}
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
            {/* Favorite button */}
            <button
              onClick={handleToggleFavorite}
              className={cn(
                'p-1.5 rounded-full backdrop-blur-sm transition-all shadow-sm cursor-pointer',
                isFav
                  ? 'bg-yellow-500/90 text-white opacity-100'
                  : 'bg-supabase-bg-secondary/90 text-supabase-text-primary opacity-0 group-hover:opacity-100 hover:bg-supabase-bg-tertiary'
              )}
              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={cn('h-4 w-4', isFav && 'fill-current')} />
            </button>

            {/* Shared/collaborators indicator */}
            {isShared && (
              <div className="p-1.5 rounded-full bg-supabase-bg-secondary/90 backdrop-blur-sm shadow-sm">
                <Users className="h-4 w-4 text-supabase-text-muted" />
              </div>
            )}
          </div>

          {/* Bottom right: Menu */}
          <div className="absolute bottom-2 right-2 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-full bg-supabase-bg-secondary/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 hover:bg-supabase-bg-tertiary transition-all shadow-sm text-supabase-text-primary cursor-pointer"
              >
                <MoreVertical className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={handleDuplicate} disabled={duplicateDiagram.isPending}>
                  {duplicateDiagram.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  Duplicate
                </DropdownMenuItem>
                {!isShared && (
                  <>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <FolderInput className="h-4 w-4 mr-2" />
                        Move to folder
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem
                          onClick={() => handleMoveToFolder(null)}
                          disabled={!diagram.folderId}
                        >
                          <Home className="h-4 w-4 mr-2" />
                          All Diagrams
                        </DropdownMenuItem>
                        {folders && folders.length > 0 && (
                          <>
                            <DropdownMenuSeparator />
                            {folders.map((folder) => (
                              <DropdownMenuItem
                                key={folder.id}
                                onClick={() => handleMoveToFolder(folder.id)}
                                disabled={diagram.folderId === folder.id}
                              >
                                {folder.name}
                              </DropdownMenuItem>
                            ))}
                          </>
                        )}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    {workspaces.length > 0 && (
                      <DropdownMenuItem onClick={() => setShowMoveWorkspaceDialog(true)}>
                        <ArrowRightLeft className="h-4 w-4 mr-2" />
                        Move to workspace
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Footer with Status Dropdown */}
        <div className="p-2 border-t border-supabase-border flex items-center justify-between">
          {/* Status dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-supabase-bg-tertiary transition-colors text-xs cursor-pointer"
            >
              <div className={cn('w-2 h-2 rounded-full', statusConfig.bgColor)} />
              <span className={cn('font-medium', statusConfig.color)}>{statusConfig.label}</span>
              <ChevronDown className="w-3 h-3 text-supabase-text-muted" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
              {(Object.keys(STATUS_CONFIG) as DiagramStatus[]).map((key) => (
                <DropdownMenuItem
                  key={key}
                  onClick={(e) => handleStatusChange(key, e)}
                  disabled={updateStatus.isPending}
                  className={cn(currentStatus === key && 'bg-supabase-bg-tertiary')}
                >
                  <div className={cn('w-2 h-2 rounded-full mr-2', STATUS_CONFIG[key].bgColor)} />
                  <span className={STATUS_CONFIG[key].color}>{STATUS_CONFIG[key].label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Collaborators indicator */}
          {isShared && (
            <div className="flex items-center -space-x-1">
              <div className="w-6 h-6 rounded-full bg-supabase-bg-tertiary border-2 border-supabase-bg-secondary flex items-center justify-center">
                <Users className="w-3 h-3 text-supabase-text-muted" />
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete diagram?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{diagram.name}&quot;.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteDiagram.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MoveToWorkspaceDialog
        open={showMoveWorkspaceDialog}
        onOpenChange={setShowMoveWorkspaceDialog}
        diagramId={diagram.id}
        diagramName={diagram.name}
        currentWorkspaceId={diagram.workspaceId}
      />
    </>
  )
}
