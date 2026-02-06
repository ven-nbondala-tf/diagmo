import { useEffect, useCallback, useRef } from 'react'
import { collaborationService } from '@/services/collaborationService'
import { useCollaborationStore } from '@/stores/collaborationStore'
import { useEditorStore } from '@/stores/editorStore'
import { throttle } from '@/utils'
import type { CollaborationState, DiagramNode, DiagramEdge } from '@/types'
import { toast } from 'sonner'

interface UseCollaborationOptions {
  diagramId: string
  enabled?: boolean
}

/**
 * Hook for real-time collaboration features
 * Manages presence, cursor tracking, collaborator display, and content sync
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

  // Track if we're mounted and last save time to avoid applying our own changes
  const isMountedRef = useRef(true)
  const lastSaveTimeRef = useRef<number>(0)
  const isApplyingRemoteRef = useRef(false)

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
          onDiagramChange: (payload) => {
            if (!isMountedRef.current) return

            // Check if this is likely our own change (within 2 seconds of last save)
            const timeSinceLastSave = Date.now() - lastSaveTimeRef.current
            if (timeSinceLastSave < 2000) {
              // Skip - this is probably our own change echoing back
              return
            }

            // Don't apply if we're already applying remote changes
            if (isApplyingRemoteRef.current) return

            // Apply remote changes to the editor
            isApplyingRemoteRef.current = true
            try {
              const { setNodes, setEdges, setDirty } = useEditorStore.getState()
              setNodes(payload.nodes as DiagramNode[])
              setEdges(payload.edges as DiagramEdge[])
              setDirty(false)

              // Show notification
              toast.info('Diagram updated by collaborator', {
                duration: 2000,
              })
            } finally {
              isApplyingRemoteRef.current = false
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

  // Track save times to avoid applying our own changes
  useEffect(() => {
    // Subscribe to editor store save events
    const unsubscribe = useEditorStore.subscribe(
      (state) => state.isDirty,
      (isDirty, prevIsDirty) => {
        // When isDirty goes from true to false, we just saved
        if (prevIsDirty && !isDirty) {
          lastSaveTimeRef.current = Date.now()
        }
      }
    )
    return unsubscribe
  }, [])

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
