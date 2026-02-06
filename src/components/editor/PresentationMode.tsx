import { useEffect, useCallback, useState, useRef } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react'
import { useEditorStore } from '@/stores/editorStore'
import { nodeTypes } from './nodes'
import { edgeTypes } from './edges'
import { cn } from '@/utils'
import { Button } from '@/components/ui'
import {
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from 'lucide-react'
import type { DiagramNode } from '@/types'

interface PresentationModeProps {
  onClose: () => void
}

function PresentationContent({ onClose }: PresentationModeProps) {
  const nodes = useEditorStore((state) => state.nodes)
  const edges = useEditorStore((state) => state.edges)
  const layers = useEditorStore((state) => state.layers)

  const { fitView, zoomIn, zoomOut, setCenter } = useReactFlow()

  const [currentNodeIndex, setCurrentNodeIndex] = useState(-1) // -1 = overview
  const [showControls, setShowControls] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Filter visible nodes based on layer visibility
  const hiddenLayerIds = new Set(
    layers.filter((l) => !l.visible).map((l) => l.id)
  )
  const visibleNodes = nodes.filter((node) => {
    const layerId = node.data.layerId || 'default-layer'
    return !hiddenLayerIds.has(layerId)
  })

  // Filter edges
  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id))
  const visibleEdges = edges.filter(
    (edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
  )

  // Auto-hide controls after inactivity
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }, [])

  // Navigate to specific node
  const navigateToNode = useCallback((index: number) => {
    if (index < 0 || index >= visibleNodes.length) {
      // Overview - fit all
      setCurrentNodeIndex(-1)
      setTimeout(() => fitView({ padding: 0.2, duration: 500 }), 50)
    } else {
      setCurrentNodeIndex(index)
      const node = visibleNodes[index]
      const width = (node.measured?.width || node.style?.width as number) || 150
      const height = (node.measured?.height || node.style?.height as number) || 50
      setCenter(
        node.position.x + width / 2,
        node.position.y + height / 2,
        { zoom: 1.5, duration: 500 }
      )
    }
  }, [visibleNodes, fitView, setCenter])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      resetControlsTimeout()

      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'Enter':
          e.preventDefault()
          if (currentNodeIndex < visibleNodes.length - 1) {
            navigateToNode(currentNodeIndex + 1)
          }
          break
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'Backspace':
          e.preventDefault()
          if (currentNodeIndex > -1) {
            navigateToNode(currentNodeIndex - 1)
          }
          break
        case 'Home':
          e.preventDefault()
          navigateToNode(-1) // Overview
          break
        case 'End':
          e.preventDefault()
          navigateToNode(visibleNodes.length - 1)
          break
        case '+':
        case '=':
          e.preventDefault()
          zoomIn()
          break
        case '-':
          e.preventDefault()
          zoomOut()
          break
        case 'f':
          e.preventDefault()
          fitView({ padding: 0.2, duration: 500 })
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, currentNodeIndex, visibleNodes.length, navigateToNode, resetControlsTimeout, zoomIn, zoomOut, fitView])

  // Mouse movement shows controls
  useEffect(() => {
    const handleMouseMove = () => resetControlsTimeout()
    window.addEventListener('mousemove', handleMouseMove)
    resetControlsTimeout()
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [resetControlsTimeout])

  // Auto-play
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      if (currentNodeIndex < visibleNodes.length - 1) {
        navigateToNode(currentNodeIndex + 1)
      } else {
        setIsPlaying(false)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isPlaying, currentNodeIndex, visibleNodes.length, navigateToNode])

  // Fit view on mount
  useEffect(() => {
    setTimeout(() => fitView({ padding: 0.2, duration: 0 }), 100)
  }, [fitView])

  // Enter fullscreen
  useEffect(() => {
    document.documentElement.requestFullscreen?.().catch(() => {
      // Fullscreen not supported or denied
    })
    return () => {
      document.exitFullscreen?.().catch(() => {})
    }
  }, [])

  const handlePrevious = () => {
    if (currentNodeIndex > -1) {
      navigateToNode(currentNodeIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentNodeIndex < visibleNodes.length - 1) {
      navigateToNode(currentNodeIndex + 1)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <ReactFlow
        nodes={visibleNodes}
        edges={visibleEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        fitView
        className="bg-muted/30"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(0, 0, 0, 0.1)"
        />
        <MiniMap
          nodeStrokeColor="#374151"
          nodeColor="#ffffff"
          nodeBorderRadius={4}
          className={cn(
            'transition-opacity duration-300',
            showControls ? 'opacity-100' : 'opacity-0'
          )}
        />
      </ReactFlow>

      {/* Top controls */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 p-4 flex items-center justify-between transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground bg-background/80 px-3 py-1.5 rounded-md">
            {currentNodeIndex === -1
              ? 'Overview'
              : `${currentNodeIndex + 1} / ${visibleNodes.length}`}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 bg-background/80"
          onClick={onClose}
        >
          <X className="w-4 h-4 mr-1" />
          Exit (Esc)
        </Button>
      </div>

      {/* Bottom controls */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 p-4 flex items-center justify-center gap-2 transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <div className="flex items-center gap-1 bg-background/80 rounded-lg p-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handlePrevious}
            disabled={currentNodeIndex <= -1}
            title="Previous (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause' : 'Auto-play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleNext}
            disabled={currentNodeIndex >= visibleNodes.length - 1}
            title="Next (Right Arrow)"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => zoomOut()}
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => zoomIn()}
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => fitView({ padding: 0.2, duration: 500 })}
            title="Fit to View (F)"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Current node label */}
      {currentNodeIndex >= 0 && visibleNodes[currentNodeIndex]?.data.label && (
        <div
          className={cn(
            'absolute bottom-20 left-1/2 -translate-x-1/2 bg-background/90 px-6 py-3 rounded-lg shadow-lg transition-opacity duration-300',
            showControls ? 'opacity-100' : 'opacity-0'
          )}
        >
          <p className="text-lg font-medium text-center">
            {visibleNodes[currentNodeIndex].data.label}
          </p>
        </div>
      )}

      {/* Keyboard shortcuts hint */}
      <div
        className={cn(
          'absolute bottom-4 right-4 text-xs text-muted-foreground bg-background/60 px-3 py-2 rounded transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0'
        )}
      >
        Arrow keys to navigate | +/- to zoom | F to fit | Esc to exit
      </div>
    </div>
  )
}

export function PresentationMode(props: PresentationModeProps) {
  return (
    <ReactFlowProvider>
      <PresentationContent {...props} />
    </ReactFlowProvider>
  )
}
