import { useState, useCallback, useEffect, useMemo } from 'react'
import { cn } from '@/utils/cn'
import {
  Search,
  Replace,
  ChevronUp,
  ChevronDown,
  X,
  CaseSensitive,
  Regex,
  WholeWord,
  Check,
  CornerDownLeft,
} from 'lucide-react'
import type { DiagramNode } from '@/types'

interface FindReplaceDialogProps {
  open: boolean
  onClose: () => void
  nodes: DiagramNode[]
  onSelectNode: (nodeId: string) => void
  onUpdateNodeLabel: (nodeId: string, newLabel: string) => void
}

interface SearchMatch {
  nodeId: string
  label: string
  index: number
}

export function FindReplaceDialog({
  open,
  onClose,
  nodes,
  onSelectNode,
  onUpdateNodeLabel,
}: FindReplaceDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [showReplace, setShowReplace] = useState(false)
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [useRegex, setUseRegex] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const [replaceCount, setReplaceCount] = useState(0)

  // Find all matches
  const matches = useMemo((): SearchMatch[] => {
    if (!searchQuery.trim()) return []

    const results: SearchMatch[] = []

    nodes.forEach((node) => {
      const label = node.data?.label as string
      if (!label) return

      let searchPattern: RegExp
      try {
        let pattern = useRegex ? searchQuery : searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        if (wholeWord) {
          pattern = `\\b${pattern}\\b`
        }
        searchPattern = new RegExp(pattern, caseSensitive ? 'g' : 'gi')
      } catch {
        // Invalid regex
        return
      }

      if (searchPattern.test(label)) {
        results.push({
          nodeId: node.id,
          label,
          index: results.length,
        })
      }
    })

    return results
  }, [nodes, searchQuery, caseSensitive, useRegex, wholeWord])

  // Reset current match when matches change
  useEffect(() => {
    if (matches.length > 0 && matches[0]) {
      setCurrentMatchIndex(0)
      onSelectNode(matches[0].nodeId)
    }
  }, [matches, onSelectNode])

  // Navigate to match
  const goToMatch = useCallback((index: number) => {
    if (matches.length === 0) return

    const newIndex = ((index % matches.length) + matches.length) % matches.length
    setCurrentMatchIndex(newIndex)
    const match = matches[newIndex]
    if (match) {
      onSelectNode(match.nodeId)
    }
  }, [matches, onSelectNode])

  const goToNextMatch = useCallback(() => {
    goToMatch(currentMatchIndex + 1)
  }, [goToMatch, currentMatchIndex])

  const goToPrevMatch = useCallback(() => {
    goToMatch(currentMatchIndex - 1)
  }, [goToMatch, currentMatchIndex])

  // Replace current match
  const replaceCurrent = useCallback(() => {
    if (matches.length === 0 || !matches[currentMatchIndex]) return

    const match = matches[currentMatchIndex]
    let newLabel = match.label

    try {
      let searchPattern: RegExp
      let pattern = useRegex ? searchQuery : searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      if (wholeWord) {
        pattern = `\\b${pattern}\\b`
      }
      searchPattern = new RegExp(pattern, caseSensitive ? '' : 'i')
      newLabel = match.label.replace(searchPattern, replaceText)
    } catch {
      return
    }

    onUpdateNodeLabel(match.nodeId, newLabel)
    setReplaceCount((c) => c + 1)

    // Go to next match
    if (matches.length > 1) {
      goToNextMatch()
    }
  }, [
    matches,
    currentMatchIndex,
    searchQuery,
    replaceText,
    caseSensitive,
    useRegex,
    wholeWord,
    onUpdateNodeLabel,
    goToNextMatch,
  ])

  // Replace all matches
  const replaceAll = useCallback(() => {
    if (matches.length === 0) return

    let count = 0
    let searchPattern: RegExp

    try {
      let pattern = useRegex ? searchQuery : searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      if (wholeWord) {
        pattern = `\\b${pattern}\\b`
      }
      searchPattern = new RegExp(pattern, caseSensitive ? 'g' : 'gi')
    } catch {
      return
    }

    matches.forEach((match) => {
      const newLabel = match.label.replace(searchPattern, replaceText)
      if (newLabel !== match.label) {
        onUpdateNodeLabel(match.nodeId, newLabel)
        count++
      }
    })

    setReplaceCount((c) => c + count)
  }, [matches, searchQuery, replaceText, caseSensitive, useRegex, wholeWord, onUpdateNodeLabel])

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (e.shiftKey) {
          goToPrevMatch()
        } else if (showReplace && (e.ctrlKey || e.metaKey)) {
          replaceCurrent()
        } else {
          goToNextMatch()
        }
        e.preventDefault()
      } else if (e.key === 'Escape') {
        onClose()
      }
    },
    [goToNextMatch, goToPrevMatch, replaceCurrent, showReplace, onClose]
  )

  // Close on Escape from anywhere
  useEffect(() => {
    if (!open) return

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="absolute top-4 right-4 z-50 w-80 bg-supabase-bg border border-supabase-border rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-supabase-border bg-supabase-bg-secondary">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-supabase-text-muted" />
          <span className="text-sm font-medium text-supabase-text-primary">
            Find{showReplace ? ' & Replace' : ''}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowReplace(!showReplace)}
            className={cn(
              'p-1.5 rounded transition-colors',
              showReplace
                ? 'bg-supabase-green/10 text-supabase-green'
                : 'text-supabase-text-muted hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary'
            )}
            title="Toggle Replace"
          >
            <Replace className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-supabase-text-muted hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3 space-y-3">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search in diagram..."
            autoFocus
            className={cn(
              'w-full px-3 py-2 pr-24 rounded-lg text-sm',
              'bg-supabase-bg-secondary border border-supabase-border',
              'text-supabase-text-primary placeholder:text-supabase-text-muted',
              'focus:border-supabase-green focus:ring-1 focus:ring-supabase-green'
            )}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {/* Toggle buttons */}
            <button
              onClick={() => setCaseSensitive(!caseSensitive)}
              className={cn(
                'p-1 rounded transition-colors',
                caseSensitive
                  ? 'bg-supabase-green/10 text-supabase-green'
                  : 'text-supabase-text-muted hover:text-supabase-text-primary'
              )}
              title="Case Sensitive (Alt+C)"
            >
              <CaseSensitive className="h-4 w-4" />
            </button>
            <button
              onClick={() => setWholeWord(!wholeWord)}
              className={cn(
                'p-1 rounded transition-colors',
                wholeWord
                  ? 'bg-supabase-green/10 text-supabase-green'
                  : 'text-supabase-text-muted hover:text-supabase-text-primary'
              )}
              title="Whole Word (Alt+W)"
            >
              <WholeWord className="h-4 w-4" />
            </button>
            <button
              onClick={() => setUseRegex(!useRegex)}
              className={cn(
                'p-1 rounded transition-colors',
                useRegex
                  ? 'bg-supabase-green/10 text-supabase-green'
                  : 'text-supabase-text-muted hover:text-supabase-text-primary'
              )}
              title="Use Regular Expression (Alt+R)"
            >
              <Regex className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Replace Input */}
        {showReplace && (
          <div className="relative">
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Replace with..."
              className={cn(
                'w-full px-3 py-2 pr-24 rounded-lg text-sm',
                'bg-supabase-bg-secondary border border-supabase-border',
                'text-supabase-text-primary placeholder:text-supabase-text-muted',
                'focus:border-supabase-green focus:ring-1 focus:ring-supabase-green'
              )}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                onClick={replaceCurrent}
                disabled={matches.length === 0}
                className={cn(
                  'p-1 rounded transition-colors',
                  'text-supabase-text-muted hover:text-supabase-text-primary',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                title="Replace (Ctrl+Enter)"
              >
                <CornerDownLeft className="h-4 w-4" />
              </button>
              <button
                onClick={replaceAll}
                disabled={matches.length === 0}
                className={cn(
                  'px-1.5 py-0.5 rounded text-xs font-medium transition-colors',
                  'text-supabase-text-muted hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                title="Replace All"
              >
                All
              </button>
            </div>
          </div>
        )}

        {/* Results & Navigation */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-supabase-text-muted">
            {searchQuery.trim() ? (
              matches.length > 0 ? (
                <>
                  {currentMatchIndex + 1} of {matches.length} result
                  {matches.length !== 1 ? 's' : ''}
                </>
              ) : (
                'No results'
              )
            ) : (
              'Type to search'
            )}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={goToPrevMatch}
              disabled={matches.length === 0}
              className={cn(
                'p-1.5 rounded transition-colors',
                'text-supabase-text-muted hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              title="Previous Match (Shift+Enter)"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              onClick={goToNextMatch}
              disabled={matches.length === 0}
              className={cn(
                'p-1.5 rounded transition-colors',
                'text-supabase-text-muted hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              title="Next Match (Enter)"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Replace confirmation */}
        {replaceCount > 0 && (
          <div className="flex items-center gap-2 text-xs text-supabase-green">
            <Check className="h-3 w-3" />
            <span>Replaced {replaceCount} occurrence{replaceCount !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Keyboard hints */}
      <div className="px-3 py-2 border-t border-supabase-border bg-supabase-bg-secondary">
        <div className="flex items-center gap-3 text-[10px] text-supabase-text-muted">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-supabase-bg-tertiary rounded border border-supabase-border">↵</kbd>
            Next
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-supabase-bg-tertiary rounded border border-supabase-border">⇧</kbd>
            <kbd className="px-1 py-0.5 bg-supabase-bg-tertiary rounded border border-supabase-border">↵</kbd>
            Prev
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-supabase-bg-tertiary rounded border border-supabase-border">Esc</kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Hook to open find/replace dialog with Ctrl+F
 */
export function useFindReplace() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault()
        setIsOpen(true)
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
