import { useState, useMemo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import type { Diagram, DiagramNode, DiagramEdge } from '@/types'
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
  Badge,
} from '@/components/ui'
import { MoveToWorkspaceDialog } from './MoveToWorkspaceDialog'
import { MoreVertical, Copy, FolderInput, Trash2, Loader2, Home, Users, Layers, ArrowRightLeft, Star } from 'lucide-react'
import { useDeleteDiagram, useDuplicateDiagram, useMoveDiagramToFolder, useFolders, useWorkspaces } from '@/hooks'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { toast } from 'sonner'

interface DiagramCardProps {
  diagram: Diagram
  onClick: () => void
  isShared?: boolean
  isTemplate?: boolean
}

// Get color for node type (cloud provider colors)
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
  return '#64748B' // Default slate
}

// Mini diagram preview component - renders nodes/edges as actual diagram shapes
function DiagramMiniPreview({ nodes, edges }: { nodes: DiagramNode[]; edges: DiagramEdge[] }) {
  const { viewBox, scaledNodes, scaledEdges } = useMemo(() => {
    if (nodes.length === 0) {
      return { viewBox: '0 0 100 100', scaledNodes: [], scaledEdges: [] }
    }

    // Calculate bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    nodes.forEach(node => {
      const x = node.position?.x ?? 0
      const y = node.position?.y ?? 0
      const width = (node.measured?.width ?? node.width ?? 150) as number
      const height = (node.measured?.height ?? node.height ?? 80) as number

      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x + width)
      maxY = Math.max(maxY, y + height)
    })

    // Add padding
    const padding = 30
    minX -= padding
    minY -= padding
    maxX += padding
    maxY += padding

    const width = maxX - minX
    const height = maxY - minY

    // Scale nodes to fit viewBox
    const scaled = nodes.map(node => {
      const nodeType = node.data?.type || 'rectangle'
      return {
        id: node.id,
        x: (node.position?.x ?? 0) - minX,
        y: (node.position?.y ?? 0) - minY,
        width: (node.measured?.width ?? node.width ?? 150) as number,
        height: (node.measured?.height ?? node.height ?? 80) as number,
        type: nodeType,
        // Use actual background color or derive from node type
        color: node.data?.style?.backgroundColor || getNodeTypeColor(nodeType),
        borderColor: node.data?.style?.borderColor || getNodeTypeColor(nodeType),
        isCloudIcon: nodeType.startsWith('aws-') || nodeType.startsWith('azure-') ||
                     nodeType.startsWith('gcp-') || nodeType.startsWith('office-') ||
                     nodeType === 'kubernetes' || nodeType === 'docker',
      }
    })

    // Map edges to node positions
    const edgeLines = edges.map(edge => {
      const source = scaled.find(n => n.id === edge.source)
      const target = scaled.find(n => n.id === edge.target)
      if (!source || !target) return null
      return {
        id: edge.id,
        x1: source.x + source.width / 2,
        y1: source.y + source.height / 2,
        x2: target.x + target.width / 2,
        y2: target.y + target.height / 2,
        color: edge.data?.style?.strokeColor || '#64748B',
      }
    }).filter(Boolean)

    return {
      viewBox: `0 0 ${width} ${height}`,
      scaledNodes: scaled,
      scaledEdges: edgeLines as { id: string; x1: number; y1: number; x2: number; y2: number; color: string }[],
    }
  }, [nodes, edges])

  if (nodes.length === 0) {
    return <EmptyPattern />
  }

  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-supabase-bg-tertiary to-supabase-bg-secondary">
      {/* Subtle grid pattern background */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.06]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id={`preview-grid-${nodes.length}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
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
            strokeOpacity="0.4"
            markerEnd="url(#preview-arrow)"
          />
        ))}

        {/* Nodes with actual colors */}
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
                  fillOpacity="0.15"
                  stroke={node.color}
                  strokeWidth="2"
                  strokeOpacity="0.6"
                />
                {/* Small icon indicator circle */}
                <circle
                  cx={node.x + node.width / 2}
                  cy={node.y + node.height / 2}
                  r={Math.min(node.width, node.height) / 4}
                  fill={node.color}
                  fillOpacity="0.4"
                />
              </g>
            ) : node.type === 'circle' || node.type === 'ellipse' ? (
              <ellipse
                cx={node.x + node.width / 2}
                cy={node.y + node.height / 2}
                rx={node.width / 2}
                ry={node.height / 2}
                fill={node.color}
                fillOpacity="0.15"
                stroke={node.borderColor}
                strokeWidth="2"
                strokeOpacity="0.5"
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
                fillOpacity="0.15"
                stroke={node.borderColor}
                strokeWidth="2"
                strokeOpacity="0.5"
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
                fillOpacity="0.15"
                stroke={node.borderColor}
                strokeWidth="2"
                strokeOpacity="0.5"
              />
            ) : node.type === 'cylinder' || node.type === 'database' ? (
              <g>
                <ellipse
                  cx={node.x + node.width / 2}
                  cy={node.y + node.height * 0.15}
                  rx={node.width / 2}
                  ry={node.height * 0.15}
                  fill={node.color}
                  fillOpacity="0.15"
                  stroke={node.borderColor}
                  strokeWidth="2"
                  strokeOpacity="0.5"
                />
                <rect
                  x={node.x}
                  y={node.y + node.height * 0.15}
                  width={node.width}
                  height={node.height * 0.7}
                  fill={node.color}
                  fillOpacity="0.15"
                  stroke="none"
                />
                <line x1={node.x} y1={node.y + node.height * 0.15} x2={node.x} y2={node.y + node.height * 0.85} stroke={node.borderColor} strokeWidth="2" strokeOpacity="0.5" />
                <line x1={node.x + node.width} y1={node.y + node.height * 0.15} x2={node.x + node.width} y2={node.y + node.height * 0.85} stroke={node.borderColor} strokeWidth="2" strokeOpacity="0.5" />
                <ellipse
                  cx={node.x + node.width / 2}
                  cy={node.y + node.height * 0.85}
                  rx={node.width / 2}
                  ry={node.height * 0.15}
                  fill={node.color}
                  fillOpacity="0.15"
                  stroke={node.borderColor}
                  strokeWidth="2"
                  strokeOpacity="0.5"
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
                fillOpacity="0.15"
                stroke={node.borderColor}
                strokeWidth="2"
                strokeOpacity="0.5"
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
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-supabase-bg-secondary to-supabase-bg-tertiary">
      {/* Grid pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.08]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="empty-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#empty-grid)" />
      </svg>

      {/* Placeholder diagram shapes */}
      <svg className="absolute inset-0 w-full h-full p-4" viewBox="0 0 200 120">
        {/* Sample shapes to indicate it's a diagram tool */}
        <rect x="10" y="20" width="50" height="30" rx="4" fill="#3ECF8E" fillOpacity="0.1" stroke="#3ECF8E" strokeWidth="1.5" strokeOpacity="0.3" />
        <rect x="75" y="45" width="50" height="30" rx="4" fill="#4285F4" fillOpacity="0.1" stroke="#4285F4" strokeWidth="1.5" strokeOpacity="0.3" />
        <rect x="140" y="20" width="50" height="30" rx="4" fill="#FF9900" fillOpacity="0.1" stroke="#FF9900" strokeWidth="1.5" strokeOpacity="0.3" />
        <ellipse cx="35" cy="90" rx="25" ry="15" fill="#8B5CF6" fillOpacity="0.1" stroke="#8B5CF6" strokeWidth="1.5" strokeOpacity="0.3" />
        <rect x="140" y="70" width="50" height="30" rx="4" fill="#0078D4" fillOpacity="0.1" stroke="#0078D4" strokeWidth="1.5" strokeOpacity="0.3" />

        {/* Connection lines */}
        <line x1="60" y1="35" x2="75" y2="55" stroke="#64748B" strokeWidth="1" strokeOpacity="0.2" />
        <line x1="125" y1="55" x2="140" y2="35" stroke="#64748B" strokeWidth="1" strokeOpacity="0.2" />
        <line x1="100" y1="75" x2="140" y2="80" stroke="#64748B" strokeWidth="1" strokeOpacity="0.2" />
        <line x1="35" y1="75" x2="75" y2="60" stroke="#64748B" strokeWidth="1" strokeOpacity="0.2" />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <Layers className="h-6 w-6 text-supabase-text-muted mx-auto mb-1 opacity-40" />
          <span className="text-[10px] text-supabase-text-muted opacity-60">Empty diagram</span>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-supabase-bg/30 to-transparent pointer-events-none" />
    </div>
  )
}

export function DiagramCard({ diagram, onClick, isShared, isTemplate }: DiagramCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showMoveWorkspaceDialog, setShowMoveWorkspaceDialog] = useState(false)
  const deleteDiagram = useDeleteDiagram()
  const duplicateDiagram = useDuplicateDiagram()
  const moveDiagram = useMoveDiagramToFolder()
  const { data: folders } = useFolders()
  const { data: workspaces = [] } = useWorkspaces()
  const { isFavorite, toggleFavorite } = usePreferencesStore()

  const isFav = isFavorite(diagram.id)

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
    } catch (error) {
      toast.error('Failed to delete diagram')
    }
    setShowDeleteDialog(false)
  }

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await duplicateDiagram.mutateAsync(diagram.id)
      toast.success('Diagram duplicated')
    } catch (error) {
      toast.error('Failed to duplicate diagram')
    }
  }

  const handleMoveToFolder = async (folderId: string | null) => {
    try {
      await moveDiagram.mutateAsync({ id: diagram.id, folderId })
      toast.success(folderId ? 'Moved to folder' : 'Moved to All Diagrams')
    } catch (error) {
      toast.error('Failed to move diagram')
    }
  }

  return (
    <>
      <div
        className="group cursor-pointer rounded-lg border border-supabase-border bg-supabase-bg-secondary overflow-hidden transition-all duration-200 ease-out hover:shadow-lg hover:shadow-supabase-green/5 hover:border-supabase-border-strong hover:-translate-y-0.5"
        onClick={onClick}
      >
        {/* Thumbnail Area */}
        <div className="relative aspect-[16/10] overflow-hidden bg-supabase-bg-tertiary">
          {diagram.thumbnail ? (
            <img
              src={diagram.thumbnail}
              alt={diagram.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <DiagramMiniPreview nodes={diagram.nodes} edges={diagram.edges} />
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

          {/* Top actions: Favorite + Menu */}
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
            {/* Favorite button */}
            <button
              onClick={handleToggleFavorite}
              className={`p-1.5 rounded-md backdrop-blur-sm transition-all shadow-sm cursor-pointer ${
                isFav
                  ? 'bg-yellow-500/90 text-white opacity-100'
                  : 'bg-supabase-bg-secondary/90 text-supabase-text-primary opacity-0 group-hover:opacity-100 hover:bg-supabase-bg-tertiary'
              }`}
              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-md bg-supabase-bg-secondary/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 hover:bg-supabase-bg-tertiary transition-all shadow-sm text-supabase-text-primary cursor-pointer"
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

          {/* Badges */}
          <div className="absolute bottom-2 left-2 flex gap-1.5">
            {isShared && (
              <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-xs gap-1 shadow-sm">
                <Users className="h-3 w-3" />
                Shared
              </Badge>
            )}
            {isTemplate && (
              <Badge variant="secondary" className="bg-primary/90 text-primary-foreground text-xs shadow-sm">
                Template
              </Badge>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4">
          <h3 className="font-medium text-sm truncate mb-1 text-supabase-text-primary group-hover:text-supabase-green transition-colors">
            {diagram.name}
          </h3>
          <p className="text-xs text-supabase-text-muted truncate mb-2">
            {diagram.description || 'No description'}
          </p>
          <p className="text-xs text-supabase-text-muted">
            Updated {formatDistanceToNow(new Date(diagram.updatedAt), { addSuffix: true })}
          </p>
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
