import { useThemeStore } from '@/stores/themeStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { useUpdateUserSettings } from '@/hooks/useUserSettings'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { cn } from '@/utils'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const themeOptions = [
  { value: 'light', label: 'Light', icon: Sun, description: 'Light theme for bright environments' },
  { value: 'dark', label: 'Dark', icon: Moon, description: 'Dark theme for low-light environments' },
  { value: 'system', label: 'System', icon: Monitor, description: 'Automatically match your system settings' },
] as const

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { mode, setMode } = useThemeStore()
  const { autoSave, setAutoSave, showMinimap, setShowMinimap } = usePreferencesStore()
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your Diagmo experience.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="appearance" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

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
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
