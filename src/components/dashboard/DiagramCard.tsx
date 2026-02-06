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
import { MoreVertical, Copy, FolderInput, Trash2, Loader2, Home, Users, Layers } from 'lucide-react'
import { useDeleteDiagram, useDuplicateDiagram, useMoveDiagramToFolder, useFolders } from '@/hooks'
import { toast } from 'sonner'

interface DiagramCardProps {
  diagram: Diagram
  onClick: () => void
  isShared?: boolean
  isTemplate?: boolean
}

// Mini diagram preview component - renders nodes/edges as faded SVG
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
    const padding = 20
    minX -= padding
    minY -= padding
    maxX += padding
    maxY += padding

    const width = maxX - minX
    const height = maxY - minY

    // Scale nodes to fit viewBox
    const scaled = nodes.map(node => ({
      id: node.id,
      x: (node.position?.x ?? 0) - minX,
      y: (node.position?.y ?? 0) - minY,
      width: (node.measured?.width ?? node.width ?? 150) as number,
      height: (node.measured?.height ?? node.height ?? 80) as number,
      type: node.data?.type || 'rectangle',
      color: node.data?.style?.backgroundColor || '#e2e8f0',
    }))

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
      }
    }).filter(Boolean)

    return {
      viewBox: `0 0 ${width} ${height}`,
      scaledNodes: scaled,
      scaledEdges: edgeLines as { id: string; x1: number; y1: number; x2: number; y2: number }[],
    }
  }, [nodes, edges])

  if (nodes.length === 0) {
    return <EmptyPattern />
  }

  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-muted/30 to-muted/60">
      {/* Grid pattern background */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.08]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="preview-grid" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M 16 0 L 0 0 0 16" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#preview-grid)" />
      </svg>

      {/* Mini diagram */}
      <svg
        className="absolute inset-0 w-full h-full p-3"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Edges */}
        {scaledEdges.map(edge => (
          <line
            key={edge.id}
            x1={edge.x1}
            y1={edge.y1}
            x2={edge.x2}
            y2={edge.y2}
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted-foreground/30"
          />
        ))}

        {/* Nodes */}
        {scaledNodes.map(node => (
          <g key={node.id}>
            {node.type === 'circle' || node.type === 'ellipse' ? (
              <ellipse
                cx={node.x + node.width / 2}
                cy={node.y + node.height / 2}
                rx={node.width / 2}
                ry={node.height / 2}
                stroke="currentColor"
                strokeWidth="1"
                className="text-muted-foreground/20 fill-muted-foreground/10"
              />
            ) : node.type === 'diamond' ? (
              <polygon
                points={`
                  ${node.x + node.width / 2},${node.y}
                  ${node.x + node.width},${node.y + node.height / 2}
                  ${node.x + node.width / 2},${node.y + node.height}
                  ${node.x},${node.y + node.height / 2}
                `}
                stroke="currentColor"
                strokeWidth="1"
                className="text-muted-foreground/20 fill-muted-foreground/10"
              />
            ) : (
              <rect
                x={node.x}
                y={node.y}
                width={node.width}
                height={node.height}
                rx={node.type === 'rounded-rectangle' ? 8 : 2}
                stroke="currentColor"
                strokeWidth="1"
                className="text-muted-foreground/20 fill-muted-foreground/10"
              />
            )}
          </g>
        ))}
      </svg>

      {/* Gradient overlay for faded effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-background/20" />
    </div>
  )
}

// Empty pattern for diagrams with no nodes
function EmptyPattern() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
      {/* Grid pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.15]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="empty-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#empty-grid)" />
      </svg>

      {/* Decorative shapes */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div className="absolute -top-4 -left-8 w-16 h-16 rounded-lg bg-primary/5 rotate-12" />
          <div className="absolute -bottom-2 -right-6 w-12 h-12 rounded-full bg-primary/5" />
          <div className="absolute top-6 right-2 w-8 h-8 rounded bg-primary/5 -rotate-6" />
          <Layers className="h-10 w-10 text-muted-foreground/40 relative z-10" />
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
    </div>
  )
}

export function DiagramCard({ diagram, onClick, isShared, isTemplate }: DiagramCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const deleteDiagram = useDeleteDiagram()
  const duplicateDiagram = useDuplicateDiagram()
  const moveDiagram = useMoveDiagramToFolder()
  const { data: folders } = useFolders()

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
        className="group cursor-pointer rounded-xl border bg-card overflow-hidden transition-all duration-200 ease-out hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-1"
        onClick={onClick}
      >
        {/* Thumbnail Area */}
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
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

          {/* Menu button */}
          <div className="absolute top-2 right-2 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-md bg-background/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 hover:bg-background transition-all shadow-sm"
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
          <h3 className="font-semibold text-base truncate mb-1 group-hover:text-primary transition-colors">
            {diagram.name}
          </h3>
          <p className="text-sm text-muted-foreground truncate mb-3">
            {diagram.description || 'No description'}
          </p>
          <p className="text-xs text-muted-foreground/70">
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
    </>
  )
}
