import { useEffect, useRef, useCallback } from 'react'
import type { ReactFlowInstance } from '@xyflow/react'

interface TouchGestureOptions {
  reactFlowInstance: ReactFlowInstance | null
  minZoom?: number
  maxZoom?: number
  zoomSensitivity?: number
  panSensitivity?: number
  enabled?: boolean
}

interface TouchState {
  touches: Touch[]
  initialDistance: number
  initialZoom: number
  initialCenter: { x: number; y: number }
  lastPanPosition: { x: number; y: number } | null
  isPinching: boolean
  isPanning: boolean
}

/**
 * Hook to add touch gesture support for mobile devices
 * Supports:
 * - Pinch to zoom
 * - Two-finger pan
 * - Smooth gesture transitions
 */
export function useTouchGestures({
  reactFlowInstance,
  minZoom = 0.1,
  maxZoom = 4,
  zoomSensitivity = 1,
  panSensitivity = 1,
  enabled = true,
}: TouchGestureOptions) {
  const stateRef = useRef<TouchState>({
    touches: [],
    initialDistance: 0,
    initialZoom: 1,
    initialCenter: { x: 0, y: 0 },
    lastPanPosition: null,
    isPinching: false,
    isPanning: false,
  })

  const getDistance = useCallback((touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }, [])

  const getCenter = useCallback((touch1: Touch, touch2: Touch): { x: number; y: number } => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    }
  }, [])

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled || !reactFlowInstance) return

      const state = stateRef.current
      state.touches = Array.from(e.touches)

      if (e.touches.length === 2) {
        // Two finger gesture - pinch zoom or pan
        e.preventDefault()
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]

        state.initialDistance = getDistance(touch1, touch2)
        state.initialZoom = reactFlowInstance.getZoom()
        state.initialCenter = getCenter(touch1, touch2)
        state.lastPanPosition = state.initialCenter
        state.isPinching = true
        state.isPanning = true
      } else if (e.touches.length === 1) {
        // Single finger - could be selecting or dragging
        state.lastPanPosition = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        }
      }
    },
    [enabled, reactFlowInstance, getDistance, getCenter]
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!enabled || !reactFlowInstance) return

      const state = stateRef.current

      if (e.touches.length === 2 && state.isPinching) {
        e.preventDefault()
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]

        // Handle pinch zoom
        const currentDistance = getDistance(touch1, touch2)
        const scale = currentDistance / state.initialDistance
        let newZoom = state.initialZoom * scale * zoomSensitivity

        // Clamp zoom to min/max
        newZoom = Math.max(minZoom, Math.min(maxZoom, newZoom))

        // Handle pan while pinching
        const currentCenter = getCenter(touch1, touch2)

        if (state.lastPanPosition) {
          const deltaX = (currentCenter.x - state.lastPanPosition.x) * panSensitivity
          const deltaY = (currentCenter.y - state.lastPanPosition.y) * panSensitivity

          const viewport = reactFlowInstance.getViewport()

          // Apply zoom and pan simultaneously
          reactFlowInstance.setViewport({
            x: viewport.x + deltaX,
            y: viewport.y + deltaY,
            zoom: newZoom,
          })
        }

        state.lastPanPosition = currentCenter
      }
    },
    [enabled, reactFlowInstance, getDistance, getCenter, zoomSensitivity, panSensitivity, minZoom, maxZoom]
  )

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      const state = stateRef.current

      if (e.touches.length < 2) {
        state.isPinching = false
        state.isPanning = false
      }

      if (e.touches.length === 0) {
        state.lastPanPosition = null
      } else if (e.touches.length === 1) {
        state.lastPanPosition = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        }
      }

      state.touches = Array.from(e.touches)
    },
    []
  )

  useEffect(() => {
    if (!enabled) return

    // Find the React Flow viewport element
    const viewport = document.querySelector('.react-flow__viewport')
    const container = document.querySelector('.react-flow')

    if (!container) return

    const options: AddEventListenerOptions = { passive: false }

    container.addEventListener('touchstart', handleTouchStart as EventListener, options)
    container.addEventListener('touchmove', handleTouchMove as EventListener, options)
    container.addEventListener('touchend', handleTouchEnd as EventListener, options)
    container.addEventListener('touchcancel', handleTouchEnd as EventListener, options)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart as EventListener)
      container.removeEventListener('touchmove', handleTouchMove as EventListener)
      container.removeEventListener('touchend', handleTouchEnd as EventListener)
      container.removeEventListener('touchcancel', handleTouchEnd as EventListener)
    }
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd])

  return {
    isPinching: stateRef.current.isPinching,
    isPanning: stateRef.current.isPanning,
  }
}

/**
 * Hook to detect if the device supports touch
 */
export function useIsTouchDevice() {
  const isTouchDevice = useCallback(() => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }, [])

  return isTouchDevice()
}

/**
 * Hook to add haptic feedback for touch interactions
 */
export function useHapticFeedback() {
  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }, [])

  const lightTap = useCallback(() => vibrate(10), [vibrate])
  const mediumTap = useCallback(() => vibrate(25), [vibrate])
  const heavyTap = useCallback(() => vibrate(50), [vibrate])
  const success = useCallback(() => vibrate([10, 50, 10]), [vibrate])
  const error = useCallback(() => vibrate([50, 100, 50]), [vibrate])

  return {
    vibrate,
    lightTap,
    mediumTap,
    heavyTap,
    success,
    error,
  }
}
