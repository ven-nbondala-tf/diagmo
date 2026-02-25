import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useEditorStore } from '@/stores/editorStore'
import { diagramService } from '@/services/diagramService'
import {
  Button,
  ScrollArea,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Badge,
} from '@/components/ui'
import {
  History,
  Plus,
  RotateCcw,
  Trash2,
  PanelRightClose,
  Clock,
  AlertCircle,
  GitCompare,
  Eye,
  Layers,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import type { DiagramVersion } from '@/types'
import { VersionDiffDialog } from './VersionDiffDialog'
import { VersionPreviewDialog } from './VersionPreviewDialog'
import { cn } from '@/utils'

interface VersionHistoryPanelProps {
  diagramId: string
}

export function VersionHistoryPanel({ diagramId }: VersionHistoryPanelProps) {
  const [versions, setVersions] = useState<DiagramVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [showDiff, setShowDiff] = useState(false)
  const [previewVersion, setPreviewVersion] = useState<DiagramVersion | null>(null)
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)

  const nodes = useEditorStore((state) => state.nodes)
  const edges = useEditorStore((state) => state.edges)
  const loadDiagram = useEditorStore((state) => state.loadDiagram)
  const toggleVersionHistoryPanel = useEditorStore((state) => state.toggleVersionHistoryPanel)

  const fetchVersions = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await diagramService.getVersions(diagramId)
      setVersions(data)
    } catch (err) {
      setError('Failed to load version history')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVersions()
  }, [diagramId])

  const handleSaveVersion = async () => {
    try {
      setSaving(true)
      await diagramService.createVersion(diagramId, nodes, edges)
      await fetchVersions()
    } catch (err) {
      setError('Failed to save version')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleRestoreVersion = async (version: DiagramVersion) => {
    try {
      setRestoring(true)
      await diagramService.restoreVersion(diagramId, version)
      loadDiagram(version.nodes, version.edges)
      setPreviewVersion(null)
    } catch (err) {
      setError('Failed to restore version')
      console.error(err)
    } finally {
      setRestoring(false)
    }
  }

  const handleDeleteVersion = async (versionId: string) => {
    try {
      await diagramService.deleteVersion(versionId)
      await fetchVersions()
    } catch (err) {
      setError('Failed to delete version')
      console.error(err)
    }
  }

  const handlePreview = (version: DiagramVersion) => {
    setPreviewVersion(version)
  }

  return (
    <div className="w-72 flex-shrink-0 border-l border-supabase-border bg-supabase-bg flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-supabase-border bg-supabase-bg-secondary">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-supabase-text-muted" />
            <h2 className="font-semibold text-sm text-supabase-text-primary">Version History</h2>
          </div>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-supabase-text-muted hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary"
                  onClick={() => setShowDiff(true)}
                  disabled={versions.length < 2}
                >
                  <GitCompare className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Compare Versions</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-supabase-text-muted hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary"
                  onClick={toggleVersionHistoryPanel}
                >
                  <PanelRightClose className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Close Panel</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Current State Indicator */}
      <div className="px-3 py-2 border-b border-supabase-border bg-supabase-green-muted">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-supabase-green animate-pulse" />
          <span className="text-xs font-medium text-supabase-text-primary">Current State</span>
          <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-supabase-bg-tertiary text-supabase-text-secondary">
            {nodes.length} shapes
          </Badge>
        </div>
        <div className="mt-1 ml-5 text-[10px] text-muted-foreground">
          {edges.length} connections • Unsaved
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-destructive/10 border-b flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs">{error}</span>
        </div>
      )}

      {/* Version Timeline */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            <Loader2 className="w-5 h-5 mx-auto animate-spin mb-2" />
            Loading versions...
          </div>
        ) : versions.length === 0 ? (
          <div className="p-6 text-center">
            <Clock className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-sm font-medium text-muted-foreground">No versions saved</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Save checkpoints to track changes over time
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveVersion}
              disabled={saving}
              className="gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Save First Version
            </Button>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[22px] top-0 bottom-0 w-px bg-border" />

            <div className="py-2">
              {versions.map((version, index) => {
                const isSelected = selectedVersionId === version.id
                const timeAgo = formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })

                return (
                  <div
                    key={version.id}
                    className={cn(
                      'relative group px-3 py-2 cursor-pointer transition-colors',
                      isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'
                    )}
                    onClick={() => setSelectedVersionId(isSelected ? null : version.id)}
                  >
                    {/* Timeline dot */}
                    <div
                      className={cn(
                        'absolute left-[18px] top-4 w-2.5 h-2.5 rounded-full border-2 bg-background z-10',
                        index === 0 ? 'border-primary' : 'border-muted-foreground/50'
                      )}
                    />

                    <div className="ml-6">
                      {/* Version header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">v{version.version}</span>
                          {index === 0 && (
                            <Badge variant="secondary" className="text-[10px] h-4 px-1">
                              Latest
                            </Badge>
                          )}
                        </div>
                        <ChevronRight
                          className={cn(
                            'w-4 h-4 text-muted-foreground transition-transform',
                            isSelected && 'rotate-90'
                          )}
                        />
                      </div>

                      {/* Version info */}
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{timeAgo}</span>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                        <Layers className="w-3 h-3" />
                        <span>{version.nodes.length} shapes • {version.edges.length} connections</span>
                      </div>

                      {/* Expanded actions */}
                      {isSelected && (
                        <div className="flex items-center gap-1 mt-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs flex-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePreview(version)
                            }}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Preview
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="default"
                                size="sm"
                                className="h-7 text-xs flex-1"
                                disabled={restoring}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Restore
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Restore Version {version.version}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will replace your current diagram with this version.
                                  Consider saving the current state first if you want to keep it.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRestoreVersion(version)}>
                                  Restore
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Version {version.version}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete this version. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleDeleteVersion(version.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t bg-muted/30">
        <Button
          variant="default"
          size="sm"
          className="w-full h-8 text-xs"
          onClick={handleSaveVersion}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Plus className="w-3 h-3 mr-1" />
              Save Version
            </>
          )}
        </Button>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          {versions.length} version{versions.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {/* Version Diff Dialog */}
      <VersionDiffDialog
        open={showDiff}
        onOpenChange={setShowDiff}
        diagramId={diagramId}
      />

      {/* Version Preview Dialog */}
      <VersionPreviewDialog
        open={!!previewVersion}
        onOpenChange={(open) => !open && setPreviewVersion(null)}
        version={previewVersion}
        currentNodes={nodes}
        currentEdges={edges}
        onRestore={() => previewVersion && handleRestoreVersion(previewVersion)}
        restoring={restoring}
      />
    </div>
  )
}
