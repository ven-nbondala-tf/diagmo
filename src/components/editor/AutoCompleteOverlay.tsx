/**
 * Auto-Complete Overlay
 * Shows ghost preview of AI suggestions with Tab to accept
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useReactFlow } from '@xyflow/react'
import { useEditorStore } from '@/stores/editorStore'
import { aiAutoCompleteService, type AutoCompleteSuggestion } from '@/services/aiAutoCompleteService'
import { Button } from '@/components/ui'
import { Sparkles, Check, X, ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '@/utils'

interface AutoCompleteOverlayProps {
  enabled?: boolean
}

export function AutoCompleteOverlay({ enabled = true }: AutoCompleteOverlayProps) {
  const [suggestions, setSuggestions] = useState<AutoCompleteSuggestion[]>([])
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const nodes = useEditorStore((s) => s.nodes)
  const edges = useEditorStore((s) => s.edges)
  const selectedNodes = useEditorStore((s) => s.selectedNodes)
  const addNode = useEditorStore((s) => s.addNode)
  const setNodes = useEditorStore((s) => s.setNodes)
  const setEdges = useEditorStore((s) => s.setEdges)

  const { screenToFlowPosition, getViewport } = useReactFlow()

  const selectedNodeId = selectedNodes[0]

  // Fetch suggestions when selection changes
  useEffect(() => {
    if (!enabled) {
      setSuggestions([])
      setIsVisible(false)
      return
    }

    // Debounce suggestion fetching
    const timer = setTimeout(() => {
      const newSuggestions = aiAutoCompleteService.getSuggestions(
        nodes,
        edges,
        selectedNodeId
      )
      setSuggestions(newSuggestions)
      setActiveSuggestionIndex(0)
      setIsVisible(newSuggestions.length > 0)
    }, 300)

    return () => clearTimeout(timer)
  }, [enabled, nodes, edges, selectedNodeId])

  // Current active suggestion
  const activeSuggestion = suggestions[activeSuggestionIndex]

  // Accept the current suggestion
  const acceptSuggestion = useCallback(() => {
    if (!activeSuggestion) return

    const result = aiAutoCompleteService.acceptSuggestion(activeSuggestion.id)
    if (!result) return

    // Add the nodes and edges
    const newNodes = [...nodes, ...result.nodes]
    const newEdges = [...edges, ...result.edges]

    setNodes(newNodes)
    setEdges(newEdges)

    // Record the action
    result.nodes.forEach(node => {
      aiAutoCompleteService.recordAction({
        type: 'add-node',
        nodeId: node.id,
        nodeType: node.data.type,
      })
    })

    // Clear suggestions
    setSuggestions([])
    setIsVisible(false)
  }, [activeSuggestion, nodes, edges, setNodes, setEdges])

  // Dismiss suggestions
  const dismissSuggestions = useCallback(() => {
    setSuggestions([])
    setIsVisible(false)
  }, [])

  // Navigate suggestions
  const nextSuggestion = useCallback(() => {
    setActiveSuggestionIndex(prev =>
      prev < suggestions.length - 1 ? prev + 1 : 0
    )
  }, [suggestions.length])

  const prevSuggestion = useCallback(() => {
    setActiveSuggestionIndex(prev =>
      prev > 0 ? prev - 1 : suggestions.length - 1
    )
  }, [suggestions.length])

  // Keyboard handlers
  useEffect(() => {
    if (!isVisible || !enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if user is typing
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault()
        acceptSuggestion()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        dismissSuggestions()
      } else if (e.key === 'ArrowRight' && e.altKey) {
        e.preventDefault()
        nextSuggestion()
      } else if (e.key === 'ArrowLeft' && e.altKey) {
        e.preventDefault()
        prevSuggestion()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isVisible, enabled, acceptSuggestion, dismissSuggestions, nextSuggestion, prevSuggestion])

  // Calculate position for the suggestion tooltip
  const tooltipPosition = useMemo(() => {
    if (!selectedNodeId) return null

    const selectedNode = nodes.find(n => n.id === selectedNodeId)
    if (!selectedNode) return null

    const viewport = getViewport()
    const nodeWidth = selectedNode.width || 120
    const nodeHeight = selectedNode.height || 60

    // Position below and to the right of the node
    return {
      x: (selectedNode.position.x + nodeWidth) * viewport.zoom + viewport.x + 20,
      y: (selectedNode.position.y + nodeHeight / 2) * viewport.zoom + viewport.y,
    }
  }, [selectedNodeId, nodes, getViewport])

  if (!isVisible || !activeSuggestion || !tooltipPosition) {
    return null
  }

  return (
    <>
      {/* Ghost preview of suggested nodes */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {activeSuggestion.preview.nodes.map(node => {
          const viewport = getViewport()
          const x = node.position.x * viewport.zoom + viewport.x
          const y = node.position.y * viewport.zoom + viewport.y
          const width = (node.width || 120) * viewport.zoom
          const height = (node.height || 60) * viewport.zoom

          return (
            <div
              key={node.id}
              className="absolute border-2 border-dashed border-primary/50 bg-primary/10 rounded-lg flex items-center justify-center"
              style={{
                left: x,
                top: y,
                width,
                height,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span
                className="text-primary/70 text-xs font-medium truncate px-2"
                style={{ fontSize: `${Math.max(10, 12 * viewport.zoom)}px` }}
              >
                {node.data.label as string}
              </span>
            </div>
          )
        })}

        {/* Ghost preview of suggested edges - simple lines */}
        <svg className="absolute inset-0 w-full h-full">
          {activeSuggestion.preview.edges.map(edge => {
            const viewport = getViewport()
            const sourceNode = [...nodes, ...activeSuggestion.preview.nodes].find(
              n => n.id === edge.source
            )
            const targetNode = activeSuggestion.preview.nodes.find(
              n => n.id === edge.target
            )

            if (!sourceNode || !targetNode) return null

            const sourceX = sourceNode.position.x * viewport.zoom + viewport.x
            const sourceY = sourceNode.position.y * viewport.zoom + viewport.y
            const targetX = targetNode.position.x * viewport.zoom + viewport.x
            const targetY = targetNode.position.y * viewport.zoom + viewport.y

            return (
              <line
                key={edge.id}
                x1={sourceX}
                y1={sourceY}
                x2={targetX}
                y2={targetY}
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                strokeDasharray="5,5"
                opacity={0.5}
              />
            )
          })}
        </svg>
      </div>

      {/* Suggestion tooltip */}
      <div
        className="absolute z-50 pointer-events-auto"
        style={{
          left: tooltipPosition.x,
          top: tooltipPosition.y,
          transform: 'translateY(-50%)',
        }}
      >
        <div className="bg-popover border rounded-lg shadow-lg p-3 min-w-[240px] max-w-[320px]">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">AI Suggestion</span>
            {suggestions.length > 1 && (
              <span className="text-xs text-muted-foreground ml-auto">
                {activeSuggestionIndex + 1}/{suggestions.length}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-3">
            {activeSuggestion.description}
          </p>

          {/* Pattern badge */}
          {activeSuggestion.pattern && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                {activeSuggestion.pattern}
              </span>
              <span className="text-xs text-muted-foreground">
                {Math.round(activeSuggestion.confidence * 100)}% confidence
              </span>
            </div>
          )}

          {/* Preview info */}
          <div className="text-xs text-muted-foreground mb-3">
            Will add: {activeSuggestion.preview.nodes.length} node
            {activeSuggestion.preview.nodes.length !== 1 ? 's' : ''}
            {activeSuggestion.preview.edges.length > 0 && (
              <>, {activeSuggestion.preview.edges.length} connection
              {activeSuggestion.preview.edges.length !== 1 ? 's' : ''}</>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={acceptSuggestion}
              className="flex-1"
            >
              <Check className="w-3 h-3 mr-1" />
              Accept
              <kbd className="ml-2 px-1.5 py-0.5 text-[10px] bg-primary-foreground/20 rounded">
                Tab
              </kbd>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={dismissSuggestions}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>

          {/* Navigation hint */}
          {suggestions.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-2 pt-2 border-t">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2"
                onClick={prevSuggestion}
              >
                <ChevronLeft className="w-3 h-3" />
              </Button>
              <span className="text-xs text-muted-foreground">
                Alt+Arrow to browse
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2"
                onClick={nextSuggestion}
              >
                <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
