import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Label,
  Badge,
  ScrollArea,
} from '@/components/ui'
import {
  GitCompare,
  Plus,
  Minus,
  PencilLine,
  Circle,
  ChevronDown,
  ChevronRight,
  ArrowRight,
} from 'lucide-react'
import { diagramService } from '@/services/diagramService'
import {
  compareVersions,
  getDiffStatusColor,
  getDiffStatusBgColor,
  type DiffStatus,
  type VersionDiffResult,
} from '@/services/diffService'
import type { DiagramVersion } from '@/types'

interface VersionDiffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  diagramId: string
}

const STATUS_ICONS: Record<DiffStatus, React.ElementType> = {
  added: Plus,
  removed: Minus,
  modified: PencilLine,
  unchanged: Circle,
}

const STATUS_LABELS: Record<DiffStatus, string> = {
  added: 'Added',
  removed: 'Removed',
  modified: 'Modified',
  unchanged: 'Unchanged',
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function VersionDiffDialog({ open, onOpenChange, diagramId }: VersionDiffDialogProps) {
  const [versions, setVersions] = useState<DiagramVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [olderVersion, setOlderVersion] = useState<string | null>(null)
  const [newerVersion, setNewerVersion] = useState<string | null>(null)
  const [diffResult, setDiffResult] = useState<VersionDiffResult | null>(null)
  const [expandedNodes, setExpandedNodes] = useState(true)
  const [expandedEdges, setExpandedEdges] = useState(true)

  // Fetch versions when dialog opens
  useEffect(() => {
    if (open && diagramId) {
      setLoading(true)
      diagramService.getVersions(diagramId).then((v) => {
        setVersions(v)
        setLoading(false)
        // Auto-select the two most recent versions
        if (v.length >= 2) {
          setOlderVersion(v[1]?.id || null)
          setNewerVersion(v[0]?.id || null)
        } else {
          setOlderVersion(null)
          setNewerVersion(null)
        }
      })
    }
  }, [open, diagramId])

  // Calculate diff when versions are selected
  useEffect(() => {
    if (olderVersion && newerVersion) {
      const older = versions.find((v) => v.id === olderVersion)
      const newer = versions.find((v) => v.id === newerVersion)
      if (older && newer) {
        const result = compareVersions(older, newer)
        setDiffResult(result)
      }
    } else {
      setDiffResult(null)
    }
  }, [olderVersion, newerVersion, versions])

  const olderVersionData = useMemo(
    () => versions.find((v) => v.id === olderVersion),
    [versions, olderVersion]
  )
  const newerVersionData = useMemo(
    () => versions.find((v) => v.id === newerVersion),
    [versions, newerVersion]
  )

  const hasChanges = diffResult && (
    diffResult.summary.nodesAdded > 0 ||
    diffResult.summary.nodesRemoved > 0 ||
    diffResult.summary.nodesModified > 0 ||
    diffResult.summary.edgesAdded > 0 ||
    diffResult.summary.edgesRemoved > 0 ||
    diffResult.summary.edgesModified > 0
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5" />
            Compare Versions
          </DialogTitle>
          <DialogDescription>
            Select two versions to see what changed between them
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading versions...</div>
        ) : versions.length < 2 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>You need at least 2 saved versions to compare.</p>
            <p className="text-sm mt-2">Save versions using the Version History panel.</p>
          </div>
        ) : (
          <>
            {/* Version Selectors */}
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Older Version (Base)</Label>
                <select
                  value={olderVersion || ''}
                  onChange={(e) => setOlderVersion(e.target.value || null)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select version...</option>
                  {versions.map((v) => (
                    <option key={v.id} value={v.id} disabled={v.id === newerVersion}>
                      v{v.version} - {formatDate(v.createdAt)} ({v.nodes.length} nodes)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Newer Version (Compare)</Label>
                <select
                  value={newerVersion || ''}
                  onChange={(e) => setNewerVersion(e.target.value || null)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select version...</option>
                  {versions.map((v) => (
                    <option key={v.id} value={v.id} disabled={v.id === olderVersion}>
                      v{v.version} - {formatDate(v.createdAt)} ({v.nodes.length} nodes)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Version Comparison Arrow */}
            {olderVersionData && newerVersionData && (
              <div className="flex items-center justify-center gap-3 py-2 text-sm text-muted-foreground border-y">
                <span className="font-medium">v{olderVersionData.version}</span>
                <ArrowRight className="w-4 h-4" />
                <span className="font-medium">v{newerVersionData.version}</span>
              </div>
            )}

            {/* Diff Results */}
            {diffResult && (
              <ScrollArea className="flex-1 min-h-0">
                <div className="space-y-4 py-4">
                  {/* Summary */}
                  <div className="flex flex-wrap gap-2">
                    {diffResult.summary.nodesAdded > 0 && (
                      <Badge variant="outline" className="gap-1" style={{ borderColor: getDiffStatusColor('added'), color: getDiffStatusColor('added') }}>
                        <Plus className="w-3 h-3" />
                        {diffResult.summary.nodesAdded} nodes added
                      </Badge>
                    )}
                    {diffResult.summary.nodesRemoved > 0 && (
                      <Badge variant="outline" className="gap-1" style={{ borderColor: getDiffStatusColor('removed'), color: getDiffStatusColor('removed') }}>
                        <Minus className="w-3 h-3" />
                        {diffResult.summary.nodesRemoved} nodes removed
                      </Badge>
                    )}
                    {diffResult.summary.nodesModified > 0 && (
                      <Badge variant="outline" className="gap-1" style={{ borderColor: getDiffStatusColor('modified'), color: getDiffStatusColor('modified') }}>
                        <PencilLine className="w-3 h-3" />
                        {diffResult.summary.nodesModified} nodes modified
                      </Badge>
                    )}
                    {diffResult.summary.edgesAdded > 0 && (
                      <Badge variant="outline" className="gap-1" style={{ borderColor: getDiffStatusColor('added'), color: getDiffStatusColor('added') }}>
                        <Plus className="w-3 h-3" />
                        {diffResult.summary.edgesAdded} edges added
                      </Badge>
                    )}
                    {diffResult.summary.edgesRemoved > 0 && (
                      <Badge variant="outline" className="gap-1" style={{ borderColor: getDiffStatusColor('removed'), color: getDiffStatusColor('removed') }}>
                        <Minus className="w-3 h-3" />
                        {diffResult.summary.edgesRemoved} edges removed
                      </Badge>
                    )}
                    {diffResult.summary.edgesModified > 0 && (
                      <Badge variant="outline" className="gap-1" style={{ borderColor: getDiffStatusColor('modified'), color: getDiffStatusColor('modified') }}>
                        <PencilLine className="w-3 h-3" />
                        {diffResult.summary.edgesModified} edges modified
                      </Badge>
                    )}
                  </div>

                  {!hasChanges && (
                    <div className="py-4 text-center text-muted-foreground">
                      No changes between these versions
                    </div>
                  )}

                  {/* Node Changes */}
                  {diffResult.nodeDiffs.some((d) => d.status !== 'unchanged') && (
                    <div className="space-y-2">
                      <button
                        onClick={() => setExpandedNodes(!expandedNodes)}
                        className="flex items-center gap-1 text-sm font-medium w-full hover:bg-muted/50 rounded px-2 py-1"
                      >
                        {expandedNodes ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        Node Changes
                      </button>
                      {expandedNodes && (
                        <div className="space-y-1 pl-6">
                          {diffResult.nodeDiffs
                            .filter((d) => d.status !== 'unchanged')
                            .map((diff) => {
                              const Icon = STATUS_ICONS[diff.status]
                              return (
                                <div
                                  key={diff.nodeId}
                                  className="flex items-start gap-2 p-2 rounded text-sm"
                                  style={{ backgroundColor: getDiffStatusBgColor(diff.status) }}
                                >
                                  <Icon
                                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                                    style={{ color: getDiffStatusColor(diff.status) }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium truncate">{diff.label}</span>
                                      <span
                                        className="text-xs px-1.5 py-0.5 rounded"
                                        style={{
                                          backgroundColor: getDiffStatusColor(diff.status),
                                          color: 'white',
                                        }}
                                      >
                                        {STATUS_LABELS[diff.status]}
                                      </span>
                                    </div>
                                    {diff.changes && diff.changes.length > 0 && (
                                      <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                                        {diff.changes.map((change, i) => (
                                          <li key={i}>• {change}</li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Edge Changes */}
                  {diffResult.edgeDiffs.some((d) => d.status !== 'unchanged') && (
                    <div className="space-y-2">
                      <button
                        onClick={() => setExpandedEdges(!expandedEdges)}
                        className="flex items-center gap-1 text-sm font-medium w-full hover:bg-muted/50 rounded px-2 py-1"
                      >
                        {expandedEdges ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        Edge Changes
                      </button>
                      {expandedEdges && (
                        <div className="space-y-1 pl-6">
                          {diffResult.edgeDiffs
                            .filter((d) => d.status !== 'unchanged')
                            .map((diff) => {
                              const Icon = STATUS_ICONS[diff.status]
                              return (
                                <div
                                  key={diff.edgeId}
                                  className="flex items-start gap-2 p-2 rounded text-sm"
                                  style={{ backgroundColor: getDiffStatusBgColor(diff.status) }}
                                >
                                  <Icon
                                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                                    style={{ color: getDiffStatusColor(diff.status) }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium truncate">{diff.label}</span>
                                      <span
                                        className="text-xs px-1.5 py-0.5 rounded"
                                        style={{
                                          backgroundColor: getDiffStatusColor(diff.status),
                                          color: 'white',
                                        }}
                                      >
                                        {STATUS_LABELS[diff.status]}
                                      </span>
                                    </div>
                                    {diff.changes && diff.changes.length > 0 && (
                                      <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                                        {diff.changes.map((change, i) => (
                                          <li key={i}>• {change}</li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}

            {/* Footer */}
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
