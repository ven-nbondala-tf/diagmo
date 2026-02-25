/**
 * Diagram Comparison Dialog
 * Visual side-by-side comparison of two diagram versions
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { ReactFlow, Background, Controls, ReactFlowProvider } from '@xyflow/react'
import { useEditorStore } from '@/stores/editorStore'
import { diagramService } from '@/services/diagramService'
import { diagramDiffService, type DiffResult } from '@/services/diagramDiffService'
import type { DiagramNode, DiagramEdge, DiagramVersion } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui'
import {
  GitCompare,
  Plus,
  Minus,
  RefreshCw,
  Box,
  ArrowRight,
  Eye,
  Loader2,
} from 'lucide-react'
import { cn } from '@/utils'
import { nodeTypes } from './nodes'
import { edgeTypes } from './edges'

interface DiagramCompareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  diagramId: string
}

type CompareSource = 'current' | string // 'current' or version ID

export function DiagramCompareDialog({
  open,
  onOpenChange,
  diagramId,
}: DiagramCompareDialogProps) {
  const currentNodes = useEditorStore((s) => s.nodes)
  const currentEdges = useEditorStore((s) => s.edges)

  const [versions, setVersions] = useState<DiagramVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [leftSource, setLeftSource] = useState<CompareSource>('current')
  const [rightSource, setRightSource] = useState<CompareSource>('')
  const [leftData, setLeftData] = useState<{ nodes: DiagramNode[]; edges: DiagramEdge[] } | null>(null)
  const [rightData, setRightData] = useState<{ nodes: DiagramNode[]; edges: DiagramEdge[] } | null>(null)
  const [diff, setDiff] = useState<DiffResult | null>(null)
  const [selectedChange, setSelectedChange] = useState<string | null>(null)

  // Fetch versions and cleanup on close
  useEffect(() => {
    if (open && diagramId) {
      setLoading(true)
      diagramService.getVersions(diagramId)
        .then((data) => {
          setVersions(data)
          // Set default right source to latest version if available
          if (data.length > 0 && !rightSource) {
            setRightSource(data[0].id)
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }

    // Cleanup when dialog closes
    if (!open) {
      // Delay cleanup to allow React Flow to unmount properly
      const timer = setTimeout(() => {
        setLeftData(null)
        setRightData(null)
        setDiff(null)
        setSelectedChange(null)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [open, diagramId])

  // Load data when sources change - create deep copies to avoid mutation
  useEffect(() => {
    // Helper to deep clone nodes/edges
    const cloneData = (nodes: DiagramNode[], edges: DiagramEdge[]) => ({
      nodes: JSON.parse(JSON.stringify(nodes)) as DiagramNode[],
      edges: JSON.parse(JSON.stringify(edges)) as DiagramEdge[],
    })

    // Left data
    if (leftSource === 'current') {
      setLeftData(cloneData(currentNodes, currentEdges))
    } else {
      const version = versions.find(v => v.id === leftSource)
      if (version) {
        setLeftData(cloneData(version.nodes, version.edges))
      }
    }

    // Right data
    if (rightSource === 'current') {
      setRightData(cloneData(currentNodes, currentEdges))
    } else {
      const version = versions.find(v => v.id === rightSource)
      if (version) {
        setRightData(cloneData(version.nodes, version.edges))
      }
    }
  }, [leftSource, rightSource, versions, currentNodes, currentEdges])

  // Calculate diff
  useEffect(() => {
    if (leftData && rightData) {
      const result = diagramDiffService.compareDiagrams(
        leftData.nodes,
        leftData.edges,
        rightData.nodes,
        rightData.edges
      )
      setDiff(result)
    }
  }, [leftData, rightData])

  // Get label for a source
  const getSourceLabel = (source: CompareSource): string => {
    if (source === 'current') return 'Current (Unsaved)'
    const version = versions.find(v => v.id === source)
    return version ? `v${version.version}` : 'Select...'
  }

  // Highlight nodes based on diff
  const getHighlightedNodes = useCallback((
    nodes: DiagramNode[],
    diffNodes: DiffResult['nodes'],
    side: 'left' | 'right'
  ): DiagramNode[] => {
    return nodes.map(node => {
      let highlightColor: string | undefined

      if (side === 'left') {
        // On left side, highlight removed and modified nodes
        if (diffNodes.removed.some(d => d.id === node.id)) {
          highlightColor = '#ef4444' // red for removed
        } else if (diffNodes.modified.some(d => d.id === node.id)) {
          highlightColor = '#f59e0b' // amber for modified
        }
      } else {
        // On right side, highlight added and modified nodes
        if (diffNodes.added.some(d => d.id === node.id)) {
          highlightColor = '#22c55e' // green for added
        } else if (diffNodes.modified.some(d => d.id === node.id)) {
          highlightColor = '#f59e0b' // amber for modified
        }
      }

      if (highlightColor) {
        return {
          ...node,
          style: {
            ...node.style,
            boxShadow: `0 0 0 3px ${highlightColor}`,
          },
        }
      }

      return node
    })
  }, [])

  // Highlighted data for display
  const leftHighlighted = useMemo(() => {
    if (!leftData || !diff) return leftData
    return {
      nodes: getHighlightedNodes(leftData.nodes, diff.nodes, 'left'),
      edges: leftData.edges,
    }
  }, [leftData, diff, getHighlightedNodes])

  const rightHighlighted = useMemo(() => {
    if (!rightData || !diff) return rightData
    return {
      nodes: getHighlightedNodes(rightData.nodes, diff.nodes, 'right'),
      edges: rightData.edges,
    }
  }, [rightData, diff, getHighlightedNodes])

  // Swap sources
  const handleSwap = () => {
    const temp = leftSource
    setLeftSource(rightSource)
    setRightSource(temp)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-primary" />
            Compare Diagram Versions
          </DialogTitle>
          <DialogDescription>
            Select two versions to compare side by side
          </DialogDescription>
        </DialogHeader>

        {/* Source Selectors */}
        <div className="flex items-center gap-4 p-4 border-b bg-muted/30">
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Base Version (Left)
            </label>
            <Select value={leftSource} onValueChange={setLeftSource}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select version..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Current (Unsaved)
                  </span>
                </SelectItem>
                {versions.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      v{v.version} - {new Date(v.createdAt).toLocaleDateString()}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="ghost" size="icon" onClick={handleSwap} className="mt-5">
            <RefreshCw className="h-4 w-4" />
          </Button>

          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Compare Version (Right)
            </label>
            <Select value={rightSource} onValueChange={setRightSource}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select version..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Current (Unsaved)
                  </span>
                </SelectItem>
                {versions.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      v{v.version} - {new Date(v.createdAt).toLocaleDateString()}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Diff Summary */}
          {diff && (
            <div className="flex items-center gap-3 ml-4 px-4 py-2 rounded-lg bg-background border">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-green-500">
                    <Plus className="h-4 w-4" />
                    <span className="font-medium">{diff.summary.nodesAdded}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Nodes added</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-red-500">
                    <Minus className="h-4 w-4" />
                    <span className="font-medium">{diff.summary.nodesRemoved}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Nodes removed</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-amber-500">
                    <RefreshCw className="h-4 w-4" />
                    <span className="font-medium">{diff.summary.nodesModified}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Nodes modified</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel */}
          <div className="flex-1 flex flex-col border-r">
            <div className="p-2 border-b bg-muted/30 flex items-center justify-between">
              <span className="text-sm font-medium">{getSourceLabel(leftSource)}</span>
              <Badge variant="outline" className="text-xs">
                {leftData?.nodes.length || 0} nodes
              </Badge>
            </div>
            <div className="flex-1 relative">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : leftHighlighted ? (
                <ReactFlowProvider>
                  <ReactFlow
                    nodes={leftHighlighted.nodes}
                    edges={leftHighlighted.edges}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    nodesDraggable={false}
                    nodesConnectable={false}
                    elementsSelectable={false}
                    panOnDrag
                    zoomOnScroll
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                  >
                    <Background color="#333" gap={20} />
                    <Controls showInteractive={false} />
                  </ReactFlow>
                </ReactFlowProvider>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  Select a version to compare
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex-1 flex flex-col">
            <div className="p-2 border-b bg-muted/30 flex items-center justify-between">
              <span className="text-sm font-medium">{getSourceLabel(rightSource)}</span>
              <Badge variant="outline" className="text-xs">
                {rightData?.nodes.length || 0} nodes
              </Badge>
            </div>
            <div className="flex-1 relative">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : rightHighlighted ? (
                <ReactFlowProvider>
                  <ReactFlow
                    nodes={rightHighlighted.nodes}
                    edges={rightHighlighted.edges}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    nodesDraggable={false}
                    nodesConnectable={false}
                    elementsSelectable={false}
                    panOnDrag
                    zoomOnScroll
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                  >
                    <Background color="#333" gap={20} />
                    <Controls showInteractive={false} />
                  </ReactFlow>
                </ReactFlowProvider>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  Select a version to compare
                </div>
              )}
            </div>
          </div>

          {/* Changes Panel */}
          {diff && diff.summary.totalChanges > 0 && (
            <div className="w-72 border-l flex flex-col bg-muted/30">
              <div className="p-3 border-b">
                <h3 className="font-medium text-sm">Changes</h3>
                <p className="text-xs text-muted-foreground">
                  {diff.summary.totalChanges} total changes
                </p>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {/* Added Nodes */}
                  {diff.nodes.added.map((d) => (
                    <div
                      key={d.id}
                      className={cn(
                        'p-2 rounded-lg cursor-pointer transition-colors',
                        'hover:bg-green-500/10 border border-transparent',
                        selectedChange === d.id && 'bg-green-500/10 border-green-500/30'
                      )}
                      onClick={() => setSelectedChange(d.id)}
                    >
                      <div className="flex items-center gap-2">
                        <Plus className="h-3 w-3 text-green-500" />
                        <span className="text-xs font-medium text-green-600">Added</span>
                      </div>
                      <p className="text-sm mt-1 truncate">
                        {d.node.data.label || d.node.data.type}
                      </p>
                    </div>
                  ))}

                  {/* Removed Nodes */}
                  {diff.nodes.removed.map((d) => (
                    <div
                      key={d.id}
                      className={cn(
                        'p-2 rounded-lg cursor-pointer transition-colors',
                        'hover:bg-red-500/10 border border-transparent',
                        selectedChange === d.id && 'bg-red-500/10 border-red-500/30'
                      )}
                      onClick={() => setSelectedChange(d.id)}
                    >
                      <div className="flex items-center gap-2">
                        <Minus className="h-3 w-3 text-red-500" />
                        <span className="text-xs font-medium text-red-600">Removed</span>
                      </div>
                      <p className="text-sm mt-1 truncate">
                        {d.node.data.label || d.node.data.type}
                      </p>
                    </div>
                  ))}

                  {/* Modified Nodes */}
                  {diff.nodes.modified.map((d) => (
                    <div
                      key={d.id}
                      className={cn(
                        'p-2 rounded-lg cursor-pointer transition-colors',
                        'hover:bg-amber-500/10 border border-transparent',
                        selectedChange === d.id && 'bg-amber-500/10 border-amber-500/30'
                      )}
                      onClick={() => setSelectedChange(d.id)}
                    >
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-3 w-3 text-amber-500" />
                        <span className="text-xs font-medium text-amber-600">Modified</span>
                      </div>
                      <p className="text-sm mt-1 truncate">
                        {d.node.data.label || d.node.data.type}
                      </p>
                      {d.changes && d.changes.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {d.changes.slice(0, 3).map((c, i) => (
                            <p key={i} className="text-xs text-muted-foreground truncate">
                              {c.field}
                            </p>
                          ))}
                          {d.changes.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{d.changes.length - 3} more
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Edge Changes */}
                  {(diff.edges.added.length > 0 || diff.edges.removed.length > 0 || diff.edges.modified.length > 0) && (
                    <>
                      <div className="pt-2 mt-2 border-t">
                        <p className="text-xs font-medium text-muted-foreground px-2 mb-1">
                          Connections
                        </p>
                      </div>
                      {diff.edges.added.map((d) => (
                        <div key={d.id} className="p-2 rounded-lg hover:bg-green-500/10">
                          <div className="flex items-center gap-2">
                            <Plus className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-green-600">Connection added</span>
                          </div>
                        </div>
                      ))}
                      {diff.edges.removed.map((d) => (
                        <div key={d.id} className="p-2 rounded-lg hover:bg-red-500/10">
                          <div className="flex items-center gap-2">
                            <Minus className="h-3 w-3 text-red-500" />
                            <span className="text-xs text-red-600">Connection removed</span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </ScrollArea>

              {/* Legend */}
              <div className="p-3 border-t text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  <span className="text-muted-foreground">Added</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-500" />
                  <span className="text-muted-foreground">Removed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-amber-500" />
                  <span className="text-muted-foreground">Modified</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
