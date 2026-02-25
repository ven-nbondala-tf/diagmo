/**
 * Template Import Admin Panel
 * Allows administrators to import and manage architecture templates
 */

import { useState, useCallback } from 'react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui'
import {
  importAzureTemplates,
  clearBuiltInTemplates,
  getTemplateStats,
  getLocalTemplateCount,
} from '@/services/templateImporter'
import { toast } from 'sonner'
import { Upload, Trash2, RefreshCw, Database, Loader2 } from 'lucide-react'

interface TemplateImportPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TemplateImportPanel({ open, onOpenChange }: TemplateImportPanelProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [stats, setStats] = useState<{
    total: number
    byCategory: Record<string, number>
    byComplexity: Record<string, number>
  } | null>(null)

  const localCount = getLocalTemplateCount()

  const handleImport = useCallback(async () => {
    setIsImporting(true)
    try {
      const result = await importAzureTemplates()

      if (result.success) {
        toast.success(`Imported ${result.imported} templates (${result.skipped} skipped)`)
      } else {
        toast.error(`Import completed with errors: ${result.errors.length} errors`)
        console.error('Import errors:', result.errors)
      }

      // Refresh stats
      const newStats = await getTemplateStats()
      setStats(newStats)
    } catch (error) {
      toast.error('Failed to import templates')
      console.error('Import error:', error)
    } finally {
      setIsImporting(false)
    }
  }, [])

  const handleClear = useCallback(async () => {
    if (!confirm('Are you sure you want to delete all built-in templates? This cannot be undone.')) {
      return
    }

    setIsClearing(true)
    try {
      const result = await clearBuiltInTemplates()

      if (result.success) {
        toast.success(`Deleted ${result.deleted} templates`)
      } else {
        toast.error('Failed to clear templates')
      }

      // Refresh stats
      const newStats = await getTemplateStats()
      setStats(newStats)
    } catch (error) {
      toast.error('Failed to clear templates')
      console.error('Clear error:', error)
    } finally {
      setIsClearing(false)
    }
  }, [])

  const handleRefreshStats = useCallback(async () => {
    try {
      const newStats = await getTemplateStats()
      setStats(newStats)
    } catch (error) {
      console.error('Failed to get stats:', error)
    }
  }, [])

  // Load stats when panel opens
  useState(() => {
    if (open) {
      handleRefreshStats()
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Template Management
          </DialogTitle>
          <DialogDescription>
            Import and manage architecture templates in the database
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Local Templates */}
          <div className="p-4 rounded-lg border bg-muted/50">
            <h3 className="font-medium mb-2">Local Templates Available</h3>
            <p className="text-sm text-muted-foreground">
              Azure templates ready to import: <strong>{localCount.azure}</strong>
            </p>
          </div>

          {/* Database Stats */}
          {stats && (
            <div className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Database Templates</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshStats}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-2xl font-bold mb-3">{stats.total}</p>

              {stats.total > 0 && (
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">By Category:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(stats.byCategory)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([cat, count]) => (
                          <span
                            key={cat}
                            className="px-2 py-0.5 rounded bg-muted text-xs"
                          >
                            {cat}: {count}
                          </span>
                        ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">By Complexity:</span>
                    <div className="flex gap-2 mt-1">
                      {Object.entries(stats.byComplexity).map(([level, count]) => (
                        <span
                          key={level}
                          className="px-2 py-0.5 rounded bg-muted text-xs"
                        >
                          {level}: {count}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleImport}
              disabled={isImporting}
              className="w-full"
            >
              {isImporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Import Azure Templates ({localCount.azure})
            </Button>

            <Button
              variant="destructive"
              onClick={handleClear}
              disabled={isClearing || !stats?.total}
              className="w-full"
            >
              {isClearing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Clear All Built-in Templates
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              <strong>Import:</strong> Adds templates from local JSON files to the database.
              Existing templates are skipped.
            </p>
            <p>
              <strong>Clear:</strong> Removes all built-in templates. User-created templates
              are preserved.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
