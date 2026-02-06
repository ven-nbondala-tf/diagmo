import { useEffect, useCallback, useRef } from 'react'
import { collaborationService } from '@/services/collaborationService'
import { useCollaborationStore } from '@/stores/collaborationStore'
import { throttle } from '@/utils'
import type { CollaborationState } from '@/types'

interface UseCollaborationOptions {
  diagramId: string
  enabled?: boolean
}

/**
 * Hook for real-time collaboration features
 * Manages presence, cursor tracking, and collaborator display
 * Uses collaborationStore for shared state between components
 */
export function useCollaboration({
  diagramId,
  enabled = true,
}: UseCollaborationOptions): CollaborationState & {
  updateCursor: (x: number | null, y: number | null) => void
  updateViewport: (x: number, y: number, zoom: number) => void
} {
  const { isConnected, collaborators, myPresenceId } = useCollaborationStore()
  const setConnected = useCollaborationStore((s) => s.setConnected)
  const setCollaborators = useCollaborationStore((s) => s.setCollaborators)
  const setMyPresenceId = useCollaborationStore((s) => s.setMyPresenceId)
  const reset = useCollaborationStore((s) => s.reset)

  // Track if we're mounted
  const isMountedRef = useRef(true)

  // Join collaboration session
  useEffect(() => {
    if (!enabled || !diagramId) return

    isMountedRef.current = true

    const join = async () => {
      try {
        await collaborationService.join(diagramId, {
          onPresenceChange: (newCollaborators) => {
            if (isMountedRef.current) {
              setCollaborators(newCollaborators)
            }
          },
          onError: (error) => {
            console.error('Collaboration error:', error)
          },
        })

        if (isMountedRef.current) {
          setConnected(true)
          setMyPresenceId(collaborationService.getPresenceId())
        }
      } catch (error) {
        console.error('Failed to join collaboration:', error)
      }
    }

    join()

    return () => {
      isMountedRef.current = false
      collaborationService.leave()
      reset()
    }
  }, [diagramId, enabled, setConnected, setCollaborators, setMyPresenceId, reset])

  // Throttled cursor update (max 30fps)
  const updateCursor = useCallback(
    throttle((x: number | null, y: number | null) => {
      if (isConnected) {
        collaborationService.updateCursor(x, y)
      }
    }, 33),
    [isConnected]
  )

  // Throttled viewport update (max 10fps)
  const updateViewport = useCallback(
    throttle((x: number, y: number, zoom: number) => {
      if (isConnected) {
        collaborationService.updateViewport(x, y, zoom)
      }
    }, 100),
    [isConnected]
  )

  return {
    isConnected,
    collaborators,
    myPresenceId,
    updateCursor,
    updateViewport,
  }
}
