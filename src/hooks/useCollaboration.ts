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
 * Manages presence, cursor tracking, collaborator display, and live content sync
 * Uses collaborationStore for shared state between components
 */
export function useCollaboration({
  diagramId,
  enabled = true,
}: UseCollaborationOptions): CollaborationState & {
  updateCursor: (x: number | null, y: number | null) => void
  updateViewport: (x: number, y: number, zoom: number) => void
  broadcastNodeDrag: (nodeId: string, position: { x: number; y: number }) => void
  broadcastNodesDrag: (nodes: Array<{ id: string; position: { x: number; y: number } }>) => void
  broadcastFullSync: (nodes: DiagramNode[], edges: DiagramEdge[]) => void
} {
  const { isConnected, collaborators, myPresenceId } = useCollaborationStore()
  const setConnected = useCollaborationStore((s) => s.setConnected)
  const setCollaborators = useCollaborationStore((s) => s.setCollaborators)
  const setMyPresenceId = useCollaborationStore((s) => s.setMyPresenceId)
  const reset = useCollaborationStore((s) => s.reset)

  // Track if we're mounted
  const isMountedRef = useRef(true)
  const isApplyingRemoteRef = useRef(false)
  const cleanupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
            console.log('[useCollaboration] Received full diagram sync:', payload)
            if (!isMountedRef.current) return
            if (isApplyingRemoteRef.current) return

            // Apply remote changes to the editor
            isApplyingRemoteRef.current = true
            try {
              const { setNodes, setEdges } = useEditorStore.getState()
              setNodes(payload.nodes as DiagramNode[])
              setEdges(payload.edges as DiagramEdge[])

              toast.info('Diagram synced from collaborator', {
                duration: 2000,
              })
            } finally {
              isApplyingRemoteRef.current = false
            }
          },
          onNodeDrag: (payload) => {
            if (!isMountedRef.current) return
            if (isApplyingRemoteRef.current) return

            // Apply single node position update
            const { nodes, setNodes } = useEditorStore.getState()
            const updatedNodes = nodes.map((node) =>
              node.id === payload.nodeId
                ? { ...node, position: payload.position }
                : node
            )
            setNodes(updatedNodes)
          },
          onNodesDrag: (payload) => {
            if (!isMountedRef.current) return
            if (isApplyingRemoteRef.current) return

            // Apply multiple node position updates
            const { nodes, setNodes } = useEditorStore.getState()
            const positionMap = new Map(
              payload.nodes.map((n) => [n.id, n.position])
            )
            const updatedNodes = nodes.map((node) => {
              const newPosition = positionMap.get(node.id)
              return newPosition ? { ...node, position: newPosition } : node
            })
            setNodes(updatedNodes)
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

    // Clear any pending cleanup from previous unmount
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current)
      cleanupTimeoutRef.current = null
    }

    join()

    return () => {
      isMountedRef.current = false
      // Delay leave to handle React Strict Mode double-mounting
      cleanupTimeoutRef.current = setTimeout(() => {
        if (!isMountedRef.current) {
          collaborationService.leave()
          reset()
        }
      }, 200)
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

  // Throttled node drag broadcast (max 20fps for smooth updates)
  const broadcastNodeDrag = useCallback(
    throttle((nodeId: string, position: { x: number; y: number }) => {
      if (isConnected) {
        collaborationService.broadcastNodeDrag(nodeId, position)
      }
    }, 50),
    [isConnected]
  )

  // Throttled multi-node drag broadcast
  const broadcastNodesDrag = useCallback(
    throttle((nodes: Array<{ id: string; position: { x: number; y: number } }>) => {
      if (isConnected) {
        collaborationService.broadcastNodesDrag(nodes)
      }
    }, 50),
    [isConnected]
  )

  // Broadcast full sync (on save or significant changes)
  const broadcastFullSync = useCallback(
    (nodes: DiagramNode[], edges: DiagramEdge[]) => {
      if (isConnected) {
        collaborationService.broadcastDiagramChange(nodes, edges)
      }
    },
    [isConnected]
  )

  return {
    isConnected,
    collaborators,
    myPresenceId,
    updateCursor,
    updateViewport,
    broadcastNodeDrag,
    broadcastNodesDrag,
    broadcastFullSync,
  }
}
