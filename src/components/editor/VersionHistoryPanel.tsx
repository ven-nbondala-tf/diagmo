import { useState, useEffect } from 'react'
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
} from '@/components/ui'
import {
  History,
  Plus,
  RotateCcw,
  Trash2,
  PanelRightClose,
  Clock,
  AlertCircle,
} from 'lucide-react'
import type { DiagramVersion } from '@/types'

interface VersionHistoryPanelProps {
  diagramId: string
}

export function VersionHistoryPanel({ diagramId }: VersionHistoryPanelProps) {
  const [versions, setVersions] = useState<DiagramVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [restoring, setRestoring] = useState(false)

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  return (
    <div className="w-64 border-l bg-background flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4" />
            <h2 className="font-semibold text-sm">Version History</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleSaveVersion}
              disabled={saving}
              title="Save Current Version"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={toggleVersionHistoryPanel}
              title="Close Panel"
            >
              <PanelRightClose className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {versions.length} version{versions.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-destructive/10 border-b flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Version List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Loading versions...
          </div>
        ) : versions.length === 0 ? (
          <div className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No versions saved</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click + to save the current state
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {versions.map((version) => (
              <div
                key={version.id}
                className="group p-2 rounded-md border bg-background hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">
                    Version {version.version}
                  </span>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          disabled={restoring}
                          title="Restore Version"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Restore Version?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will replace your current diagram with Version {version.version}.
                            You can save the current state first if needed.
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
                          className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                          title="Delete Version"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Version?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete Version {version.version}.
                            This action cannot be undone.
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
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(version.createdAt)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {version.nodes.length} shapes, {version.edges.length} connections
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t">
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs"
          onClick={handleSaveVersion}
          disabled={saving}
        >
          <Plus className="w-3 h-3 mr-1" />
          {saving ? 'Saving...' : 'Save Current Version'}
        </Button>
      </div>
    </div>
  )
}
