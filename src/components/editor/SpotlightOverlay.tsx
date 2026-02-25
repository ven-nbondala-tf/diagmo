import { useEffect, useState, useCallback } from 'react'
import { useReactFlow } from 'reactflow'
import { useCollaborationStore } from '@/stores/collaborationStore'
import { cn } from '@/utils'

interface SpotlightPosition {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Overlay that highlights a spotlighted element with a pulsing animation
 * When a collaborator spotlights an element, this draws attention to it
 */
export function SpotlightOverlay() {
  const spotlightedNodeId = useCollaborationStore((s) => s.spotlightedNodeId)
  const spotlightedByUserName = useCollaborationStore((s) => s.spotlightedByUserName)
  const clearSpotlight = useCollaborationStore((s) => s.clearSpotlight)

  const reactFlowInstance = useReactFlow()
  const [position, setPosition] = useState<SpotlightPosition | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Calculate position of the spotlighted node
  const updatePosition = useCallback(() => {
    if (!spotlightedNodeId) {
      setPosition(null)
      return
    }

    const node = reactFlowInstance.getNode(spotlightedNodeId)
    if (!node) {
      setPosition(null)
      return
    }

    // Get the viewport transform
    const { x: viewX, y: viewY, zoom } = reactFlowInstance.getViewport()

    // Calculate screen position
    const screenX = node.position.x * zoom + viewX
    const screenY = node.position.y * zoom + viewY
    const screenWidth = (node.width || 150) * zoom
    const screenHeight = (node.height || 50) * zoom

    setPosition({
      x: screenX,
      y: screenY,
      width: screenWidth,
      height: screenHeight,
    })
  }, [spotlightedNodeId, reactFlowInstance])

  // Update position when node changes or viewport changes
  useEffect(() => {
    if (spotlightedNodeId) {
      // First center on the node
      const node = reactFlowInstance.getNode(spotlightedNodeId)
      if (node) {
        reactFlowInstance.setCenter(
          node.position.x + (node.width || 150) / 2,
          node.position.y + (node.height || 50) / 2,
          { duration: 500, zoom: reactFlowInstance.getZoom() }
        )
      }

      // Then show the spotlight after centering
      setTimeout(() => {
        updatePosition()
        setIsVisible(true)
      }, 500)

      // Auto-clear after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => {
          clearSpotlight()
        }, 300)
      }, 5000)

      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [spotlightedNodeId, reactFlowInstance, updatePosition, clearSpotlight])

  // Update position on viewport changes
  useEffect(() => {
    if (!spotlightedNodeId) return

    const interval = setInterval(updatePosition, 50)
    return () => clearInterval(interval)
  }, [spotlightedNodeId, updatePosition])

  if (!spotlightedNodeId || !position) {
    return null
  }

  const padding = 20

  return (
    <div className="pointer-events-none absolute inset-0 z-40">
      {/* Spotlight ring */}
      <div
        className={cn(
          'absolute border-4 border-yellow-400 rounded-lg',
          'shadow-[0_0_30px_rgba(250,204,21,0.5)]',
          'transition-all duration-300',
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
        style={{
          left: position.x - padding,
          top: position.y - padding,
          width: position.width + padding * 2,
          height: position.height + padding * 2,
          animation: isVisible ? 'spotlight-pulse 1.5s ease-in-out infinite' : 'none',
        }}
      />

      {/* Spotlight label */}
      {spotlightedByUserName && (
        <div
          className={cn(
            'absolute px-3 py-1.5 rounded-full',
            'bg-yellow-400 text-yellow-900 text-sm font-medium',
            'shadow-lg transform -translate-x-1/2',
            'transition-all duration-300',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          )}
          style={{
            left: position.x + position.width / 2,
            top: position.y - padding - 35,
          }}
        >
          {spotlightedByUserName} is showing you this
        </div>
      )}

      {/* CSS for pulse animation */}
      <style>{`
        @keyframes spotlight-pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(250, 204, 21, 0.4),
                        0 0 40px rgba(250, 204, 21, 0.2),
                        inset 0 0 20px rgba(250, 204, 21, 0.1);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 30px rgba(250, 204, 21, 0.6),
                        0 0 60px rgba(250, 204, 21, 0.3),
                        inset 0 0 30px rgba(250, 204, 21, 0.15);
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  )
}
