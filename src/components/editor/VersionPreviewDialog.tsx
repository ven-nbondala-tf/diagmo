import { useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Badge,
} from '@/components/ui'
import { RotateCcw, X, Clock, Layers, GitBranch } from 'lucide-react'
import type { DiagramVersion, DiagramNode, DiagramEdge } from '@/types'
import { formatDistanceToNow } from 'date-fns'

interface VersionPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  version: DiagramVersion | null
  currentNodes: DiagramNode[]
  currentEdges: DiagramEdge[]
  onRestore: () => void
  restoring?: boolean
}

export function VersionPreviewDialog({
  open,
  onOpenChange,
  version,
  currentNodes,
  currentEdges,
  onRestore,
  restoring,
}: VersionPreviewDialogProps) {
  // Calculate differences between current and version
  const diff = useMemo(() => {
    if (!version) return null

    const currentNodeIds = new Set(currentNodes.map((n) => n.id))
    const versionNodeIds = new Set(version.nodes.map((n) => n.id))
    const currentEdgeIds = new Set(currentEdges.map((e) => e.id))
    const versionEdgeIds = new Set(version.edges.map((e) => e.id))

    return {
      nodesAdded: currentNodes.filter((n) => !versionNodeIds.has(n.id)).length,
      nodesRemoved: version.nodes.filter((n) => !currentNodeIds.has(n.id)).length,
      edgesAdded: currentEdges.filter((e) => !versionEdgeIds.has(e.id)).length,
      edgesRemoved: version.edges.filter((e) => !currentEdgeIds.has(e.id)).length,
    }
  }, [version, currentNodes, currentEdges])

  if (!version) return null

  const timeAgo = formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Version {version.version} Preview
          </DialogTitle>
          <DialogDescription className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {timeAgo}
            </span>
            <span className="flex items-center gap-1">
              <Layers className="h-3.5 w-3.5" />
              {version.nodes.length} shapes, {version.edges.length} connections
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Visual Preview */}
        <div className="border rounded-lg bg-muted/30 p-4 min-h-[200px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Layers className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">Version {version.version}</p>
            <p className="text-xs mt-1">
              {version.nodes.length} shapes • {version.edges.length} connections
            </p>
          </div>
        </div>

        {/* Difference from current */}
        {diff && (diff.nodesAdded > 0 || diff.nodesRemoved > 0 || diff.edgesAdded > 0 || diff.edgesRemoved > 0) && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Changes if restored:</p>
            <div className="flex flex-wrap gap-2">
              {diff.nodesRemoved > 0 && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  +{diff.nodesRemoved} shapes restored
                </Badge>
              )}
              {diff.nodesAdded > 0 && (
                <Badge variant="outline" className="text-red-600 border-red-600">
                  -{diff.nodesAdded} shapes removed
                </Badge>
              )}
              {diff.edgesRemoved > 0 && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  +{diff.edgesRemoved} connections restored
                </Badge>
              )}
              {diff.edgesAdded > 0 && (
                <Badge variant="outline" className="text-red-600 border-red-600">
                  -{diff.edgesAdded} connections removed
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Restoring will replace your current diagram with this version.
              Consider saving your current state first.
            </p>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button onClick={onRestore} disabled={restoring}>
            <RotateCcw className="h-4 w-4 mr-1" />
            {restoring ? 'Restoring...' : 'Restore This Version'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
