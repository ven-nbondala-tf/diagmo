import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { cn } from '@/utils/cn'
import {
  Search,
  FileText,
  Folder,
  Settings,
  HelpCircle,
  Moon,
  Sun,
  Plus,
  Download,
  Upload,
  Share2,
  Keyboard,
  LayoutTemplate,
  Clock,
  Star,
  Trash2,
  Command,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ElementType
  shortcut?: string
  category: string
  action: () => void
  keywords?: string[]
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  diagrams?: { id: string; name: string }[]
  folders?: { id: string; name: string }[]
  onCreateDiagram?: () => void
  onOpenSettings?: () => void
  onToggleTheme?: () => void
  onShowKeyboardShortcuts?: () => void
  onExport?: () => void
  onImport?: () => void
  onShare?: () => void
  onShowTemplates?: () => void
  theme?: 'light' | 'dark'
}

export function CommandPalette({
  open,
  onOpenChange,
  diagrams = [],
  folders = [],
  onCreateDiagram,
  onOpenSettings,
  onToggleTheme,
  onShowKeyboardShortcuts,
  onExport,
  onImport,
  onShare,
  onShowTemplates,
  theme = 'dark',
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Build command list
  const commands: CommandItem[] = useMemo(() => {
    const items: CommandItem[] = [
      // Actions
      {
        id: 'new-diagram',
        label: 'New Diagram',
        description: 'Create a new blank diagram',
        icon: Plus,
        shortcut: 'Ctrl+N',
        category: 'Actions',
        action: () => {
          onCreateDiagram?.()
          onOpenChange(false)
        },
        keywords: ['create', 'add', 'new'],
      },
      {
        id: 'templates',
        label: 'Browse Templates',
        description: 'Create from a template',
        icon: LayoutTemplate,
        category: 'Actions',
        action: () => {
          onShowTemplates?.()
          onOpenChange(false)
        },
        keywords: ['template', 'gallery', 'preset'],
      },
      {
        id: 'import',
        label: 'Import Diagram',
        description: 'Import from JSON, Draw.io, or Mermaid',
        icon: Upload,
        shortcut: 'Ctrl+O',
        category: 'Actions',
        action: () => {
          onImport?.()
          onOpenChange(false)
        },
        keywords: ['open', 'load', 'upload'],
      },
      {
        id: 'export',
        label: 'Export Diagram',
        description: 'Export as PNG, SVG, or PDF',
        icon: Download,
        shortcut: 'Ctrl+E',
        category: 'Actions',
        action: () => {
          onExport?.()
          onOpenChange(false)
        },
        keywords: ['download', 'save', 'image'],
      },
      {
        id: 'share',
        label: 'Share Diagram',
        description: 'Share with collaborators',
        icon: Share2,
        category: 'Actions',
        action: () => {
          onShare?.()
          onOpenChange(false)
        },
        keywords: ['invite', 'collaborate', 'team'],
      },

      // Navigation
      {
        id: 'nav-dashboard',
        label: 'Go to Dashboard',
        description: 'View all diagrams',
        icon: FileText,
        category: 'Navigation',
        action: () => {
          navigate('/dashboard')
          onOpenChange(false)
        },
        keywords: ['home', 'diagrams', 'list'],
      },
      {
        id: 'nav-recent',
        label: 'Recent Diagrams',
        description: 'View recently opened diagrams',
        icon: Clock,
        category: 'Navigation',
        action: () => {
          navigate('/dashboard?view=recent')
          onOpenChange(false)
        },
        keywords: ['history', 'opened'],
      },
      {
        id: 'nav-favorites',
        label: 'Favorites',
        description: 'View starred diagrams',
        icon: Star,
        category: 'Navigation',
        action: () => {
          navigate('/dashboard?view=favorites')
          onOpenChange(false)
        },
        keywords: ['starred', 'bookmarks'],
      },
      {
        id: 'nav-trash',
        label: 'Trash',
        description: 'View deleted diagrams',
        icon: Trash2,
        category: 'Navigation',
        action: () => {
          navigate('/dashboard?view=trash')
          onOpenChange(false)
        },
        keywords: ['deleted', 'removed', 'bin'],
      },

      // Settings
      {
        id: 'settings',
        label: 'Settings',
        description: 'Open application settings',
        icon: Settings,
        shortcut: 'Ctrl+,',
        category: 'Settings',
        action: () => {
          onOpenSettings?.()
          onOpenChange(false)
        },
        keywords: ['preferences', 'options', 'config'],
      },
      {
        id: 'toggle-theme',
        label: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
        description: 'Toggle between light and dark themes',
        icon: theme === 'dark' ? Sun : Moon,
        category: 'Settings',
        action: () => {
          onToggleTheme?.()
          onOpenChange(false)
        },
        keywords: ['theme', 'mode', 'appearance'],
      },
      {
        id: 'keyboard-shortcuts',
        label: 'Keyboard Shortcuts',
        description: 'View all keyboard shortcuts',
        icon: Keyboard,
        shortcut: '?',
        category: 'Settings',
        action: () => {
          onShowKeyboardShortcuts?.()
          onOpenChange(false)
        },
        keywords: ['hotkeys', 'keys', 'bindings'],
      },

      // Help
      {
        id: 'help',
        label: 'Help & Documentation',
        description: 'Open help center',
        icon: HelpCircle,
        category: 'Help',
        action: () => {
          window.open('https://docs.diagmo.com', '_blank')
          onOpenChange(false)
        },
        keywords: ['docs', 'guide', 'support'],
      },
    ]

    // Add diagram items
    diagrams.slice(0, 10).forEach((diagram) => {
      items.push({
        id: `diagram-${diagram.id}`,
        label: diagram.name,
        description: 'Open diagram',
        icon: FileText,
        category: 'Diagrams',
        action: () => {
          navigate(`/editor/${diagram.id}`)
          onOpenChange(false)
        },
        keywords: ['open', 'edit'],
      })
    })

    // Add folder items
    folders.slice(0, 5).forEach((folder) => {
      items.push({
        id: `folder-${folder.id}`,
        label: folder.name,
        description: 'Open folder',
        icon: Folder,
        category: 'Folders',
        action: () => {
          navigate(`/dashboard?folder=${folder.id}`)
          onOpenChange(false)
        },
        keywords: ['directory', 'collection'],
      })
    })

    return items
  }, [
    diagrams,
    folders,
    theme,
    navigate,
    onCreateDiagram,
    onOpenSettings,
    onToggleTheme,
    onShowKeyboardShortcuts,
    onExport,
    onImport,
    onShare,
    onShowTemplates,
    onOpenChange,
  ])

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands

    const lowerQuery = query.toLowerCase()
    return commands.filter((cmd) => {
      const searchText = [
        cmd.label,
        cmd.description,
        cmd.category,
        ...(cmd.keywords || []),
      ]
        .join(' ')
        .toLowerCase()
      return searchText.includes(lowerQuery)
    })
  }, [commands, query])

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {}
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = []
      }
      groups[cmd.category]!.push(cmd)
    })
    return groups
  }, [filteredCommands])

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
      setQuery('')
      setSelectedIndex(0)
    }
  }, [open])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((i) => Math.max(i - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action()
          }
          break
        case 'Escape':
          e.preventDefault()
          onOpenChange(false)
          break
      }
    },
    [filteredCommands, selectedIndex, onOpenChange]
  )

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current
    if (!list) return

    const selected = list.querySelector('[data-selected="true"]')
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-xl bg-supabase-bg border border-supabase-border rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-supabase-border">
          <Search className="h-5 w-5 text-supabase-text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-supabase-text-primary placeholder:text-supabase-text-muted outline-none text-base"
          />
          <kbd className="px-2 py-1 text-xs bg-supabase-bg-tertiary rounded border border-supabase-border text-supabase-text-muted">
            Esc
          </kbd>
        </div>

        {/* Command List */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-supabase-text-muted">
              No results found for "{query}"
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, items]) => (
              <div key={category}>
                <div className="px-4 py-2 text-xs font-medium text-supabase-text-muted uppercase tracking-wider">
                  {category}
                </div>
                {items.map((cmd) => {
                  const globalIndex = filteredCommands.indexOf(cmd)
                  const isSelected = globalIndex === selectedIndex

                  return (
                    <button
                      key={cmd.id}
                      data-selected={isSelected}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                        isSelected
                          ? 'bg-supabase-green/10 text-supabase-text-primary'
                          : 'text-supabase-text-secondary hover:bg-supabase-bg-tertiary'
                      )}
                    >
                      <cmd.icon
                        className={cn(
                          'h-4 w-4 shrink-0',
                          isSelected ? 'text-supabase-green' : 'text-supabase-text-muted'
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{cmd.label}</div>
                        {cmd.description && (
                          <div className="text-xs text-supabase-text-muted truncate">
                            {cmd.description}
                          </div>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <kbd className="px-1.5 py-0.5 text-xs bg-supabase-bg-tertiary rounded border border-supabase-border text-supabase-text-muted shrink-0">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-supabase-border bg-supabase-bg-secondary">
          <div className="flex items-center gap-4 text-xs text-supabase-text-muted">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-supabase-bg-tertiary rounded border border-supabase-border">↑</kbd>
              <kbd className="px-1 py-0.5 bg-supabase-bg-tertiary rounded border border-supabase-border">↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-supabase-bg-tertiary rounded border border-supabase-border">↵</kbd>
              to select
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-supabase-text-muted">
            <Command className="h-3 w-3" />
            <span>K to open</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Hook to open command palette with Ctrl+K / Cmd+K
 */
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
    setIsOpen,
  }
}
