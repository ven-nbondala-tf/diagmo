import { useState, useCallback } from 'react'
import { useThemeStore } from '@/stores/themeStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { useUpdateUserSettings } from '@/hooks/useUserSettings'
import {
  importAzureTemplates,
  clearBuiltInTemplates,
  getTemplateStats,
  getLocalTemplateCount,
} from '@/services/templateImporter'
import { clearTemplatesCache } from '@/hooks/useArchitectureTemplates'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Label,
  Tabs,
  TabsContent,
  Button,
} from '@/components/ui'
import { Sun, Moon, Monitor, Check, Upload, Trash2, RefreshCw, Database, Loader2 } from 'lucide-react'
import { cn } from '@/utils'
import { toast } from 'sonner'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const themeOptions = [
  { value: 'light', label: 'Light', icon: Sun, description: 'Light theme for bright environments' },
  { value: 'dark', label: 'Dark', icon: Moon, description: 'Dark theme for low-light environments' },
  { value: 'system', label: 'System', icon: Monitor, description: 'Automatically match your system settings' },
] as const

const accentColors = [
  { color: '#3ECF8E', name: 'Green' },
  { color: '#3b82f6', name: 'Blue' },
  { color: '#8B5CF6', name: 'Purple' },
  { color: '#f59e0b', name: 'Orange' },
  { color: '#ef4444', name: 'Red' },
  { color: '#ec4899', name: 'Pink' },
  { color: '#14b8a6', name: 'Teal' },
  { color: '#6b7280', name: 'Gray' },
]

const textColors = [
  { color: '#ffffff', name: 'White' },
  { color: '#1c1c1c', name: 'Dark' },
  { color: '#f8fafc', name: 'Light Gray' },
  { color: '#334155', name: 'Slate' },
]

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<'appearance' | 'editor' | 'account' | 'admin'>('appearance')
  const { mode, setMode } = useThemeStore()

  // Admin template import state
  const [isImporting, setIsImporting] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [templateStats, setTemplateStats] = useState<{
    total: number
    byCategory: Record<string, number>
    byComplexity: Record<string, number>
  } | null>(null)
  const localCount = getLocalTemplateCount()
  const {
    autoSave,
    setAutoSave,
    showMinimap,
    setShowMinimap,
    primaryAccentColor,
    setPrimaryAccentColor,
    primaryAccentTextColor,
    setPrimaryAccentTextColor,
    secondaryAccentColor,
    setSecondaryAccentColor,
    secondaryAccentTextColor,
    setSecondaryAccentTextColor,
  } = usePreferencesStore()
  const updateSettings = useUpdateUserSettings()

  const handleThemeChange = (newMode: 'light' | 'dark' | 'system') => {
    setMode(newMode)
    updateSettings.mutate({ theme: newMode })
  }

  const handleAutoSaveChange = () => {
    const newValue = !autoSave
    setAutoSave(newValue)
    updateSettings.mutate({ autoSave: newValue })
  }

  const handleMinimapChange = () => {
    const newValue = !showMinimap
    setShowMinimap(newValue)
    updateSettings.mutate({ showMinimap: newValue })
  }

  // Admin handlers
  const handleImportTemplates = useCallback(async () => {
    setIsImporting(true)
    try {
      const result = await importAzureTemplates()
      if (result.success) {
        toast.success(`Imported ${result.imported} templates (${result.skipped} skipped)`)
        clearTemplatesCache() // Clear cache to refresh templates
      } else {
        toast.error(`Import completed with errors: ${result.errors.length} errors`)
        console.error('Import errors:', result.errors)
      }
      const stats = await getTemplateStats()
      setTemplateStats(stats)
    } catch (error) {
      toast.error('Failed to import templates')
      console.error('Import error:', error)
    } finally {
      setIsImporting(false)
    }
  }, [])

  const handleClearTemplates = useCallback(async () => {
    if (!confirm('Are you sure you want to delete all built-in templates? This cannot be undone.')) {
      return
    }
    setIsClearing(true)
    try {
      const result = await clearBuiltInTemplates()
      if (result.success) {
        toast.success(`Deleted ${result.deleted} templates`)
        clearTemplatesCache()
      } else {
        toast.error('Failed to clear templates')
      }
      const stats = await getTemplateStats()
      setTemplateStats(stats)
    } catch (error) {
      toast.error('Failed to clear templates')
      console.error('Clear error:', error)
    } finally {
      setIsClearing(false)
    }
  }, [])

  const handleRefreshStats = useCallback(async () => {
    try {
      const stats = await getTemplateStats()
      setTemplateStats(stats)
    } catch (error) {
      console.error('Failed to get stats:', error)
    }
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your Diagmo experience.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'appearance' | 'editor' | 'account' | 'admin')} className="mt-4">
          <div className="grid w-full grid-cols-4 bg-supabase-bg-tertiary rounded-lg p-1 gap-1">
            <button
              onClick={() => setActiveTab('appearance')}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm transition-all',
                activeTab === 'appearance'
                  ? 'font-medium shadow-sm'
                  : 'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-secondary/50'
              )}
              style={activeTab === 'appearance' ? { backgroundColor: secondaryAccentColor, color: secondaryAccentTextColor } : undefined}
            >
              Appearance
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm transition-all',
                activeTab === 'editor'
                  ? 'font-medium shadow-sm'
                  : 'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-secondary/50'
              )}
              style={activeTab === 'editor' ? { backgroundColor: secondaryAccentColor, color: secondaryAccentTextColor } : undefined}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm transition-all',
                activeTab === 'account'
                  ? 'font-medium shadow-sm'
                  : 'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-secondary/50'
              )}
              style={activeTab === 'account' ? { backgroundColor: secondaryAccentColor, color: secondaryAccentTextColor } : undefined}
            >
              Account
            </button>
            <button
              onClick={() => {
                setActiveTab('admin')
                handleRefreshStats()
              }}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm transition-all',
                activeTab === 'admin'
                  ? 'font-medium shadow-sm'
                  : 'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-secondary/50'
              )}
              style={activeTab === 'admin' ? { backgroundColor: secondaryAccentColor, color: secondaryAccentTextColor } : undefined}
            >
              Admin
            </button>
          </div>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6 mt-4">
            <div>
              <Label className="text-base">Theme</Label>
              <p className="text-sm text-supabase-text-muted mb-3">
                Choose how Diagmo looks to you
              </p>
              <div className="grid grid-cols-3 gap-3">
                {themeOptions.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => handleThemeChange(value)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all cursor-pointer',
                      mode === value
                        ? 'border-supabase-green bg-supabase-green/5'
                        : 'border-supabase-border hover:border-supabase-border-strong'
                    )}
                  >
                    <Icon className={cn(
                      'w-6 h-6',
                      mode === value ? 'text-supabase-green' : 'text-supabase-text-muted'
                    )} />
                    <span className={cn(
                      'text-sm font-medium',
                      mode === value ? 'text-supabase-green' : 'text-supabase-text-primary'
                    )}>
                      {label}
                    </span>
                    {mode === value && (
                      <Check className="w-4 h-4 text-supabase-green" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Colors */}
            <div className="pt-4 border-t border-supabase-border">
              <Label className="text-base">Accent Colors</Label>
              <p className="text-sm text-supabase-text-muted mb-4">
                Customize the accent colors used throughout the app
              </p>

              {/* Primary Accent Color */}
              <div className="mb-4">
                <Label className="text-sm text-supabase-text-secondary mb-2 block">
                  Primary Color
                  <span className="text-xs text-supabase-text-muted ml-2">(Page tabs)</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {accentColors.map(({ color, name }) => (
                    <button
                      key={`primary-${color}`}
                      className={cn(
                        'w-8 h-8 rounded-md transition-all cursor-pointer',
                        primaryAccentColor === color
                          ? 'ring-2 ring-offset-2 ring-offset-supabase-bg ring-white scale-110'
                          : 'hover:scale-105'
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setPrimaryAccentColor(color)}
                      title={name}
                    />
                  ))}
                </div>
                {/* Primary Text Color */}
                <div className="mt-2">
                  <Label className="text-xs text-supabase-text-muted mb-1.5 block">
                    Text Color
                  </Label>
                  <div className="flex gap-2">
                    {textColors.map(({ color, name }) => (
                      <button
                        key={`primary-text-${color}`}
                        className={cn(
                          'w-6 h-6 rounded-md transition-all cursor-pointer border border-supabase-border',
                          primaryAccentTextColor === color
                            ? 'ring-2 ring-offset-1 ring-offset-supabase-bg ring-white scale-110'
                            : 'hover:scale-105'
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => setPrimaryAccentTextColor(color)}
                        title={name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Secondary Accent Color */}
              <div>
                <Label className="text-sm text-supabase-text-secondary mb-2 block">
                  Secondary Color
                  <span className="text-xs text-supabase-text-muted ml-2">(Panel tabs, Share button)</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {accentColors.map(({ color, name }) => (
                    <button
                      key={`secondary-${color}`}
                      className={cn(
                        'w-8 h-8 rounded-md transition-all cursor-pointer',
                        secondaryAccentColor === color
                          ? 'ring-2 ring-offset-2 ring-offset-supabase-bg ring-white scale-110'
                          : 'hover:scale-105'
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setSecondaryAccentColor(color)}
                      title={name}
                    />
                  ))}
                </div>
                {/* Secondary Text Color */}
                <div className="mt-2">
                  <Label className="text-xs text-supabase-text-muted mb-1.5 block">
                    Text Color
                  </Label>
                  <div className="flex gap-2">
                    {textColors.map(({ color, name }) => (
                      <button
                        key={`secondary-text-${color}`}
                        className={cn(
                          'w-6 h-6 rounded-md transition-all cursor-pointer border border-supabase-border',
                          secondaryAccentTextColor === color
                            ? 'ring-2 ring-offset-1 ring-offset-supabase-bg ring-white scale-110'
                            : 'hover:scale-105'
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => setSecondaryAccentTextColor(color)}
                        title={name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Editor Tab */}
          <TabsContent value="editor" className="space-y-6 mt-4">
            <div className="space-y-4">
              {/* Auto Save */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Auto Save</Label>
                  <p className="text-sm text-supabase-text-muted">
                    Automatically save diagrams as you work
                  </p>
                </div>
                <button
                  onClick={handleAutoSaveChange}
                  className={cn(
                    'relative w-11 h-6 rounded-full transition-colors cursor-pointer',
                    autoSave ? 'bg-supabase-green' : 'bg-supabase-border'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform',
                      autoSave && 'translate-x-5'
                    )}
                  />
                </button>
              </div>

              {/* Show Minimap */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Show Minimap</Label>
                  <p className="text-sm text-supabase-text-muted">
                    Display a minimap for easier navigation
                  </p>
                </div>
                <button
                  onClick={handleMinimapChange}
                  className={cn(
                    'relative w-11 h-6 rounded-full transition-colors cursor-pointer',
                    showMinimap ? 'bg-supabase-green' : 'bg-supabase-border'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform',
                      showMinimap && 'translate-x-5'
                    )}
                  />
                </button>
              </div>
            </div>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6 mt-4">
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-supabase-bg-tertiary border border-supabase-border">
                <h4 className="font-medium text-supabase-text-primary mb-2">Account Management</h4>
                <p className="text-sm text-supabase-text-muted mb-4">
                  Manage your account settings, change password, or delete your account.
                </p>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-sm bg-supabase-bg-secondary border border-supabase-border rounded-md hover:bg-supabase-bg-tertiary transition-colors cursor-pointer">
                    Change Password
                  </button>
                  <button className="px-3 py-1.5 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md hover:bg-red-500/20 transition-colors cursor-pointer">
                    Delete Account
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-supabase-bg-tertiary border border-supabase-border">
                <h4 className="font-medium text-supabase-text-primary mb-2">Data Export</h4>
                <p className="text-sm text-supabase-text-muted mb-4">
                  Download all your diagrams and data.
                </p>
                <button className="px-3 py-1.5 text-sm bg-supabase-bg-secondary border border-supabase-border rounded-md hover:bg-supabase-bg-tertiary transition-colors cursor-pointer">
                  Export All Data
                </button>
              </div>
            </div>
          </TabsContent>

          {/* Admin Tab */}
          <TabsContent value="admin" className="space-y-6 mt-4">
            <div className="space-y-4">
              {/* Template Management Header */}
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-supabase-green" />
                <h3 className="font-medium text-supabase-text-primary">Template Management</h3>
              </div>
              <p className="text-sm text-supabase-text-muted">
                Import architecture templates to Supabase for faster loading and persistence.
              </p>

              {/* Local Templates */}
              <div className="p-4 rounded-lg bg-supabase-bg-tertiary border border-supabase-border">
                <h4 className="font-medium text-supabase-text-primary mb-2">Local Templates Available</h4>
                <p className="text-sm text-supabase-text-muted">
                  Azure templates ready to import: <strong className="text-supabase-text-primary">{localCount.azure}</strong>
                </p>
              </div>

              {/* Database Stats */}
              <div className="p-4 rounded-lg bg-supabase-bg-tertiary border border-supabase-border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-supabase-text-primary">Database Templates</h4>
                  <Button variant="ghost" size="sm" onClick={handleRefreshStats}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-2xl font-bold text-supabase-text-primary mb-3">
                  {templateStats?.total ?? '—'}
                </p>
                {templateStats && templateStats.total > 0 && (
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-supabase-text-muted">By Category:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(templateStats.byCategory)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 5)
                          .map(([cat, count]) => (
                            <span key={cat} className="px-2 py-0.5 rounded bg-supabase-bg-secondary text-xs text-supabase-text-secondary">
                              {cat}: {count}
                            </span>
                          ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-supabase-text-muted">By Complexity:</span>
                      <div className="flex gap-2 mt-1">
                        {Object.entries(templateStats.byComplexity).map(([level, count]) => (
                          <span key={level} className="px-2 py-0.5 rounded bg-supabase-bg-secondary text-xs text-supabase-text-secondary">
                            {level}: {count}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Button onClick={handleImportTemplates} disabled={isImporting} className="w-full">
                  {isImporting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Import Azure Templates ({localCount.azure})
                </Button>

                <Button
                  variant="destructive"
                  onClick={handleClearTemplates}
                  disabled={isClearing || !templateStats?.total}
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
              <div className="text-xs text-supabase-text-muted space-y-1 p-3 rounded bg-supabase-bg-secondary">
                <p><strong>Import:</strong> Adds templates from local JSON files to Supabase. Existing templates are skipped.</p>
                <p><strong>Clear:</strong> Removes all built-in templates from Supabase. User-created templates are preserved.</p>
                <p><strong>Note:</strong> Templates are cached for 5 minutes. Use the Refresh button in Template Gallery to see updates.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
