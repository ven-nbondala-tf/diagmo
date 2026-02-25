import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Tabs,
  TabsContent,
} from '@/components/ui'
import { cn } from '@/utils'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { Keyboard, Lightbulb, BookOpen, ExternalLink } from 'lucide-react'

interface HelpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const keyboardShortcuts = [
  { category: 'General', shortcuts: [
    { keys: ['Ctrl', 'K'], description: 'Open search' },
    { keys: ['Ctrl', 'S'], description: 'Save diagram' },
    { keys: ['Ctrl', 'Z'], description: 'Undo' },
    { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo' },
    { keys: ['Ctrl', 'A'], description: 'Select all nodes' },
    { keys: ['Delete'], description: 'Delete selected' },
    { keys: ['Escape'], description: 'Deselect all' },
  ]},
  { category: 'Navigation', shortcuts: [
    { keys: ['Scroll'], description: 'Zoom in/out' },
    { keys: ['Space', 'Drag'], description: 'Pan canvas' },
    { keys: ['Ctrl', '0'], description: 'Reset zoom' },
    { keys: ['Ctrl', '1'], description: 'Fit to screen' },
  ]},
  { category: 'Editing', shortcuts: [
    { keys: ['Ctrl', 'C'], description: 'Copy selected' },
    { keys: ['Ctrl', 'V'], description: 'Paste' },
    { keys: ['Ctrl', 'D'], description: 'Duplicate selected' },
    { keys: ['Ctrl', 'G'], description: 'Group selected' },
    { keys: ['Ctrl', 'Shift', 'G'], description: 'Ungroup' },
  ]},
]

const tips = [
  {
    title: 'Quick node creation',
    description: 'Double-click on the canvas to quickly create a new node.',
  },
  {
    title: 'Connect nodes easily',
    description: 'Drag from a node handle to another node to create a connection.',
  },
  {
    title: 'Multi-select',
    description: 'Hold Shift and click to select multiple nodes, or drag a selection box.',
  },
  {
    title: 'Align nodes',
    description: 'Use the alignment tools in the toolbar to perfectly align selected nodes.',
  },
  {
    title: 'Export options',
    description: 'Export your diagrams as PNG, SVG, or PDF from the File menu.',
  },
  {
    title: 'Collaboration',
    description: 'Share your diagram with others to collaborate in real-time.',
  },
  {
    title: 'Templates',
    description: 'Start with a template to quickly create common diagram types.',
  },
  {
    title: 'Auto-layout',
    description: 'Use the auto-layout feature to automatically arrange your nodes.',
  },
]

const resources = [
  {
    title: 'Documentation',
    description: 'Learn how to use all Diagmo features',
    url: '#',
    icon: BookOpen,
  },
  {
    title: 'Video Tutorials',
    description: 'Watch step-by-step guides',
    url: '#',
    icon: ExternalLink,
  },
  {
    title: 'Community Forum',
    description: 'Get help from other users',
    url: '#',
    icon: ExternalLink,
  },
  {
    title: 'API Reference',
    description: 'Integrate Diagmo with your tools',
    url: '#',
    icon: ExternalLink,
  },
]

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  const [activeTab, setActiveTab] = useState<'shortcuts' | 'tips' | 'resources'>('shortcuts')
  const secondaryAccentColor = usePreferencesStore((state) => state.secondaryAccentColor)
  const secondaryAccentTextColor = usePreferencesStore((state) => state.secondaryAccentTextColor)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Help & Resources</DialogTitle>
          <DialogDescription>
            Keyboard shortcuts, tips, and helpful resources.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'shortcuts' | 'tips' | 'resources')} className="flex-1 overflow-hidden flex flex-col">
          <div className="grid w-full grid-cols-3 bg-supabase-bg-tertiary rounded-lg p-1 gap-1">
            <button
              onClick={() => setActiveTab('shortcuts')}
              className={cn(
                'flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-all',
                activeTab === 'shortcuts'
                  ? 'font-medium shadow-sm'
                  : 'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-secondary/50'
              )}
              style={activeTab === 'shortcuts' ? { backgroundColor: secondaryAccentColor, color: secondaryAccentTextColor } : undefined}
            >
              <Keyboard className="w-4 h-4" />
              Shortcuts
            </button>
            <button
              onClick={() => setActiveTab('tips')}
              className={cn(
                'flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-all',
                activeTab === 'tips'
                  ? 'font-medium shadow-sm'
                  : 'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-secondary/50'
              )}
              style={activeTab === 'tips' ? { backgroundColor: secondaryAccentColor, color: secondaryAccentTextColor } : undefined}
            >
              <Lightbulb className="w-4 h-4" />
              Tips
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={cn(
                'flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-all',
                activeTab === 'resources'
                  ? 'font-medium shadow-sm'
                  : 'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-secondary/50'
              )}
              style={activeTab === 'resources' ? { backgroundColor: secondaryAccentColor, color: secondaryAccentTextColor } : undefined}
            >
              <BookOpen className="w-4 h-4" />
              Resources
            </button>
          </div>

          {/* Shortcuts Tab */}
          <TabsContent value="shortcuts" className="flex-1 overflow-auto mt-4 pr-2">
            <div className="space-y-6">
              {keyboardShortcuts.map((category) => (
                <div key={category.category}>
                  <h4 className="text-sm font-medium text-supabase-text-primary mb-3">
                    {category.category}
                  </h4>
                  <div className="space-y-2">
                    {category.shortcuts.map((shortcut, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-1.5"
                      >
                        <span className="text-sm text-supabase-text-secondary">
                          {shortcut.description}
                        </span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, j) => (
                            <span key={j}>
                              <kbd className="px-2 py-1 text-xs bg-supabase-bg-tertiary border border-supabase-border rounded">
                                {key}
                              </kbd>
                              {j < shortcut.keys.length - 1 && (
                                <span className="mx-1 text-supabase-text-muted">+</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Tips Tab */}
          <TabsContent value="tips" className="flex-1 overflow-auto mt-4 pr-2">
            <div className="grid gap-3">
              {tips.map((tip, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-supabase-bg-tertiary border border-supabase-border"
                >
                  <h4 className="text-sm font-medium text-supabase-text-primary mb-1">
                    {tip.title}
                  </h4>
                  <p className="text-xs text-supabase-text-muted">
                    {tip.description}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="flex-1 overflow-auto mt-4 pr-2">
            <div className="grid gap-3">
              {resources.map((resource, i) => (
                <a
                  key={i}
                  href={resource.url}
                  className="flex items-center gap-3 p-3 rounded-lg bg-supabase-bg-tertiary border border-supabase-border hover:border-supabase-border-strong transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-supabase-bg-secondary flex items-center justify-center">
                    <resource.icon className="w-5 h-5 text-supabase-text-muted" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-supabase-text-primary">
                      {resource.title}
                    </h4>
                    <p className="text-xs text-supabase-text-muted">
                      {resource.description}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-supabase-text-muted" />
                </a>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
