/**
 * Global Search Component
 * Command palette with full-text search across diagrams
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  searchService,
  type DiagramSearchResult,
  type QuickAction,
} from '@/services/searchService'
import {
  Dialog,
  DialogContent,
  Input,
  ScrollArea,
} from '@/components/ui'
import { cn } from '@/utils'
import {
  Search,
  FileText,
  Home,
  Plus,
  Settings,
  Store,
  LayoutTemplate,
  ArrowRight,
  Clock,
  Box,
  GitBranch,
  Loader2,
  Command,
} from 'lucide-react'

interface GlobalSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  plus: Plus,
  home: Home,
  'layout-template': LayoutTemplate,
  store: Store,
  settings: Settings,
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<DiagramSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Quick actions
  const quickActions = useMemo(
    () => searchService.getQuickActions(navigate),
    [navigate]
  )

  // Filtered quick actions based on query
  const filteredActions = useMemo(() => {
    if (!query.trim()) return quickActions
    const lowerQuery = query.toLowerCase()
    return quickActions.filter(
      (action) =>
        action.title.toLowerCase().includes(lowerQuery) ||
        action.description?.toLowerCase().includes(lowerQuery)
    )
  }, [query, quickActions])

  // Search for diagrams when query changes
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([])
      return
    }

    const searchDiagrams = async () => {
      setLoading(true)
      try {
        const searchResults = await searchService.search(query, undefined, 'relevance', 10)
        setResults(searchResults)
      } catch (error) {
        console.error('Search failed:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(searchDiagrams, 200)
    return () => clearTimeout(debounce)
  }, [query])

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [results, filteredActions])

  // Total items for keyboard navigation
  const totalItems = filteredActions.length + results.length

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % totalItems)
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems)
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex < filteredActions.length) {
            // Execute quick action
            filteredActions[selectedIndex].action()
            onOpenChange(false)
          } else {
            // Navigate to diagram
            const diagramIndex = selectedIndex - filteredActions.length
            if (results[diagramIndex]) {
              navigate(`/editor/${results[diagramIndex].diagramId}`)
              onOpenChange(false)
            }
          }
          break
        case 'Escape':
          onOpenChange(false)
          break
      }
    },
    [selectedIndex, totalItems, filteredActions, results, navigate, onOpenChange]
  )

  // Handle clicking a result
  const handleSelectAction = useCallback(
    (action: QuickAction) => {
      action.action()
      onOpenChange(false)
      setQuery('')
    },
    [onOpenChange]
  )

  const handleSelectDiagram = useCallback(
    (diagram: DiagramSearchResult) => {
      navigate(`/editor/${diagram.diagramId}`)
      onOpenChange(false)
      setQuery('')
    },
    [navigate, onOpenChange]
  )

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults([])
      setSelectedIndex(0)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center border-b px-3">
          <Search className="w-4 h-4 text-muted-foreground mr-2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search diagrams, actions, and more..."
            className="border-0 focus-visible:ring-0 h-12 text-base"
            autoFocus
          />
          {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </div>

        <ScrollArea className="max-h-[400px]">
          <div className="p-2">
            {/* Quick Actions */}
            {filteredActions.length > 0 && (
              <div className="mb-2">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Quick Actions
                </div>
                {filteredActions.map((action, index) => {
                  const Icon = iconMap[action.icon || ''] || Command
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleSelectAction(action)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-md text-left',
                        'transition-colors',
                        selectedIndex === index
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      )}
                    >
                      <div
                        className={cn(
                          'w-8 h-8 rounded-md flex items-center justify-center',
                          selectedIndex === index
                            ? 'bg-primary-foreground/20'
                            : 'bg-muted'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {action.title}
                        </p>
                        {action.description && (
                          <p
                            className={cn(
                              'text-xs truncate',
                              selectedIndex === index
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            )}
                          >
                            {action.description}
                          </p>
                        )}
                      </div>
                      {action.shortcut && (
                        <kbd
                          className={cn(
                            'px-2 py-0.5 text-[10px] rounded border',
                            selectedIndex === index
                              ? 'bg-primary-foreground/20 border-primary-foreground/30'
                              : 'bg-muted border-border'
                          )}
                        >
                          {action.shortcut}
                        </kbd>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Search Results */}
            {results.length > 0 && (
              <div>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Diagrams
                </div>
                {results.map((result, index) => {
                  const itemIndex = filteredActions.length + index
                  return (
                    <button
                      key={result.diagramId}
                      onClick={() => handleSelectDiagram(result)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-md text-left',
                        'transition-colors',
                        selectedIndex === itemIndex
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      )}
                    >
                      {/* Thumbnail */}
                      <div
                        className={cn(
                          'w-12 h-8 rounded border overflow-hidden flex-shrink-0',
                          selectedIndex === itemIndex
                            ? 'border-primary-foreground/30'
                            : 'border-border'
                        )}
                      >
                        {result.thumbnail ? (
                          <img
                            src={result.thumbnail}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {result.diagramName}
                        </p>
                        <div className="flex items-center gap-2 text-xs">
                          {result.matches.slice(0, 2).map((match, i) => (
                            <span
                              key={i}
                              className={cn(
                                'truncate',
                                selectedIndex === itemIndex
                                  ? 'text-primary-foreground/70'
                                  : 'text-muted-foreground'
                              )}
                            >
                              {match.type === 'node' && (
                                <Box className="w-3 h-3 inline mr-1" />
                              )}
                              {match.type === 'edge' && (
                                <GitBranch className="w-3 h-3 inline mr-1" />
                              )}
                              {match.text.substring(0, 30)}
                              {match.text.length > 30 && '...'}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Meta */}
                      <div
                        className={cn(
                          'flex items-center gap-1 text-xs',
                          selectedIndex === itemIndex
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        )}
                      >
                        <Clock className="w-3 h-3" />
                        {new Date(result.updatedAt).toLocaleDateString()}
                      </div>

                      <ArrowRight
                        className={cn(
                          'w-4 h-4 flex-shrink-0',
                          selectedIndex === itemIndex
                            ? 'text-primary-foreground'
                            : 'text-muted-foreground'
                        )}
                      />
                    </button>
                  )
                })}
              </div>
            )}

            {/* No Results */}
            {query.length >= 2 && !loading && results.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No diagrams found for "{query}"</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            )}

            {/* Empty State */}
            {!query && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                <p>Type to search diagrams, nodes, and more...</p>
                <p className="text-xs mt-1">
                  Press <kbd className="px-1.5 py-0.5 bg-muted rounded border text-[10px]">↑↓</kbd> to navigate,{' '}
                  <kbd className="px-1.5 py-0.5 bg-muted rounded border text-[10px]">Enter</kbd> to select
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-muted rounded border text-[10px]">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-muted rounded border text-[10px]">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-muted rounded border text-[10px]">Esc</kbd>
              Close
            </span>
          </div>
          <span>Diagmo Pro</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hook to open global search with Cmd+K
export function useGlobalSearch() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return { open, setOpen }
}
