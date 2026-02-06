import { useState, useEffect, useCallback, useRef } from 'react'
import { useReactFlow } from '@xyflow/react'
import { useEditorStore } from '@/stores/editorStore'
import { Button, Input } from '@/components/ui'
import {
  X,
  ChevronUp,
  ChevronDown,
  Replace,
  ReplaceAll,
  Search,
  CaseSensitive,
} from 'lucide-react'
import { cn } from '@/utils'

interface FindReplaceBarProps {
  open: boolean
  onClose: () => void
}

export function FindReplaceBar({ open, onClose }: FindReplaceBarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [replaceTerm, setReplaceTerm] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [showReplace, setShowReplace] = useState(false)
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)

  const searchInputRef = useRef<HTMLInputElement>(null)

  const nodes = useEditorStore((state) => state.nodes)
  const selectNodes = useEditorStore((state) => state.selectNodes)
  const updateNode = useEditorStore((state) => state.updateNode)
  const pushHistory = useEditorStore((state) => state.pushHistory)

  const { fitView, setCenter } = useReactFlow()

  // Find all matching nodes
  const matchingNodes = nodes.filter((node) => {
    if (!searchTerm.trim()) return false
    const label = node.data.label || ''
    if (caseSensitive) {
      return label.includes(searchTerm)
    }
    return label.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const matchCount = matchingNodes.length

  // Focus search input when opening
  useEffect(() => {
    if (open) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [open])

  // Reset match index when search changes
  useEffect(() => {
    setCurrentMatchIndex(0)
  }, [searchTerm, caseSensitive])

  // Navigate to current match
  const navigateToMatch = useCallback(
    (index: number) => {
      if (matchingNodes.length === 0) return

      const node = matchingNodes[index]
      if (!node) return

      // Select the node
      selectNodes([node.id])

      // Center view on the node
      const width = node.measured?.width || 150
      const height = node.measured?.height || 50
      setCenter(
        node.position.x + width / 2,
        node.position.y + height / 2,
        { duration: 300, zoom: 1 }
      )
    },
    [matchingNodes, selectNodes, setCenter]
  )

  // Navigate to next match
  const goToNextMatch = useCallback(() => {
    if (matchCount === 0) return
    const nextIndex = (currentMatchIndex + 1) % matchCount
    setCurrentMatchIndex(nextIndex)
    navigateToMatch(nextIndex)
  }, [currentMatchIndex, matchCount, navigateToMatch])

  // Navigate to previous match
  const goToPrevMatch = useCallback(() => {
    if (matchCount === 0) return
    const prevIndex = (currentMatchIndex - 1 + matchCount) % matchCount
    setCurrentMatchIndex(prevIndex)
    navigateToMatch(prevIndex)
  }, [currentMatchIndex, matchCount, navigateToMatch])

  // Replace current match
  const replaceCurrent = useCallback(() => {
    if (matchingNodes.length === 0 || !searchTerm) return

    const node = matchingNodes[currentMatchIndex]
    if (!node) return

    pushHistory()

    const label = node.data.label || ''
    let newLabel: string
    if (caseSensitive) {
      newLabel = label.replace(searchTerm, replaceTerm)
    } else {
      newLabel = label.replace(new RegExp(escapeRegex(searchTerm), 'i'), replaceTerm)
    }

    updateNode(node.id, { label: newLabel })

    // Move to next match after replace
    if (matchCount > 1) {
      // Stay at same index (which will now be the next item)
      setTimeout(() => navigateToMatch(currentMatchIndex), 100)
    }
  }, [
    matchingNodes,
    currentMatchIndex,
    searchTerm,
    replaceTerm,
    caseSensitive,
    pushHistory,
    updateNode,
    matchCount,
    navigateToMatch,
  ])

  // Replace all matches
  const replaceAll = useCallback(() => {
    if (matchingNodes.length === 0 || !searchTerm) return

    pushHistory()

    for (const node of matchingNodes) {
      const label = node.data.label || ''
      let newLabel: string
      if (caseSensitive) {
        newLabel = label.split(searchTerm).join(replaceTerm)
      } else {
        newLabel = label.replace(new RegExp(escapeRegex(searchTerm), 'gi'), replaceTerm)
      }
      updateNode(node.id, { label: newLabel })
    }

    // Clear selection after replace all
    selectNodes([])
  }, [matchingNodes, searchTerm, replaceTerm, caseSensitive, pushHistory, updateNode, selectNodes])

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (e.shiftKey) {
          goToPrevMatch()
        } else {
          goToNextMatch()
        }
      } else if (e.key === 'Escape') {
        onClose()
      }
    },
    [goToNextMatch, goToPrevMatch, onClose]
  )

  // Highlight all matches when search term changes
  useEffect(() => {
    if (searchTerm && matchingNodes.length > 0) {
      navigateToMatch(currentMatchIndex)
    }
  }, [searchTerm])

  if (!open) return null

  return (
    <div className="absolute top-2 right-16 z-50 bg-background border rounded-lg shadow-lg p-3 w-80">
      {/* Search Row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Find in diagram..."
            className="pl-8 pr-8 h-8 text-sm"
          />
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0',
              caseSensitive && 'bg-primary/10 text-primary'
            )}
            onClick={() => setCaseSensitive(!caseSensitive)}
            title="Case Sensitive"
          >
            <CaseSensitive className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={goToPrevMatch}
            disabled={matchCount === 0}
            title="Previous (Shift+Enter)"
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={goToNextMatch}
            disabled={matchCount === 0}
            title="Next (Enter)"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={onClose}
          title="Close (Esc)"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Match count */}
      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
        <span>
          {matchCount > 0
            ? `${currentMatchIndex + 1} of ${matchCount} match${matchCount !== 1 ? 'es' : ''}`
            : searchTerm
            ? 'No matches'
            : 'Type to search'}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs px-2"
          onClick={() => setShowReplace(!showReplace)}
        >
          {showReplace ? 'Hide Replace' : 'Show Replace'}
        </Button>
      </div>

      {/* Replace Row */}
      {showReplace && (
        <div className="mt-3 pt-3 border-t space-y-2">
          <div className="flex items-center gap-2">
            <Input
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Replace with..."
              className="h-8 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs flex-1"
              onClick={replaceCurrent}
              disabled={matchCount === 0}
            >
              <Replace className="w-3.5 h-3.5 mr-1" />
              Replace
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs flex-1"
              onClick={replaceAll}
              disabled={matchCount === 0}
            >
              <ReplaceAll className="w-3.5 h-3.5 mr-1" />
              Replace All
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Escape special regex characters
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
