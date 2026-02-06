import { useEffect, useCallback, useRef } from 'react'
import { collaborationService, type OperationType, type NodeLock } from '@/services/collaborationService'
import { useCollaborationStore, type ConnectionStatus } from '@/stores/collaborationStore'
import { useEditorStore } from '@/stores/editorStore'
import { throttle } from '@/utils'
import type { CollaborationState, DiagramNode, DiagramEdge } from '@/types'
import { toast } from 'sonner'

interface UseCollaborationOptions {
  diagramId: string
  enabled?: boolean
}

interface UseCollaborationReturn extends CollaborationState {
  connectionStatus: ConnectionStatus
  nodeLocks: Map<string, NodeLock>
  updateCursor: (x: number | null, y: number | null) => void
  updateViewport: (x: number, y: number, zoom: number) => void
  broadcastNodeDrag: (nodeId: string, position: { x: number; y: number }) => void
  broadcastNodesDrag: (nodes: Array<{ id: string; position: { x: number; y: number } }>) => void
  broadcastFullSync: (nodes: DiagramNode[], edges: DiagramEdge[]) => void
  // Operation-based sync
  broadcastOperation: (type: OperationType, targetId: string, data?: Record<string, unknown>) => void
  // Node locking
  acquireLock: (nodeId: string) => Promise<boolean>
  releaseLock: (nodeId: string) => Promise<void>
  renewLock: (nodeId: string) => Promise<boolean>
  isNodeLocked: (nodeId: string) => boolean
}

/**
 * Hook for real-time collaboration features
 * Manages presence, cursor tracking, collaborator display, and live content sync
 * Uses collaborationStore for shared state between components
 */
export function useCollaboration({
  diagramId,
  enabled = true,
}: UseCollaborationOptions): UseCollaborationReturn {
  const { isConnected, connectionStatus, collaborators, myPresenceId, nodeLocks } = useCollaborationStore()
  const setConnectionStatus = useCollaborationStore((s) => s.setConnectionStatus)
  const setCollaborators = useCollaborationStore((s) => s.setCollaborators)
  const setMyPresenceId = useCollaborationStore((s) => s.setMyPresenceId)
  const setNodeLock = useCollaborationStore((s) => s.setNodeLock)
  const removeNodeLock = useCollaborationStore((s) => s.removeNodeLock)
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
            toast.error(error.message || 'Collaboration error')
          },
          onConnectionStatusChange: (status) => {
            if (isMountedRef.current) {
              setConnectionStatus(status)
              if (status === 'reconnecting') {
                toast.loading('Reconnecting to collaboration...', { id: 'reconnect' })
              } else if (status === 'connected') {
                toast.dismiss('reconnect')
              }
            }
          },
          // Operation-based sync handler
          onOperation: (operation) => {
            if (!isMountedRef.current) return
            if (isApplyingRemoteRef.current) return

            console.log('[useCollaboration] Applying operation:', operation.type, operation.targetId)
            isApplyingRemoteRef.current = true
            try {
              const { nodes, edges, setNodes, setEdges } = useEditorStore.getState()

              switch (operation.type) {
                case 'node-create': {
                  const newNode = operation.data as unknown as DiagramNode
                  if (newNode && !nodes.find(n => n.id === newNode.id)) {
                    setNodes([...nodes, newNode])
                  }
                  break
                }
                case 'node-update': {
                  const updates = operation.data as unknown as Partial<DiagramNode>
                  setNodes(nodes.map(n =>
                    n.id === operation.targetId ? { ...n, ...updates } : n
                  ))
                  break
                }
                case 'node-delete': {
                  setNodes(nodes.filter(n => n.id !== operation.targetId))
                  // Also remove connected edges
                  setEdges(edges.filter(e =>
                    e.source !== operation.targetId && e.target !== operation.targetId
                  ))
                  break
                }
                case 'edge-create': {
                  const newEdge = operation.data as unknown as DiagramEdge
                  if (newEdge && !edges.find(e => e.id === newEdge.id)) {
                    setEdges([...edges, newEdge])
                  }
                  break
                }
                case 'edge-update': {
                  const edgeUpdates = operation.data as unknown as Partial<DiagramEdge>
                  setEdges(edges.map(e =>
                    e.id === operation.targetId ? { ...e, ...edgeUpdates } : e
                  ))
                  break
                }
                case 'edge-delete': {
                  setEdges(edges.filter(e => e.id !== operation.targetId))
                  break
                }
              }
            } finally {
              isApplyingRemoteRef.current = false
            }
          },
          // Node lock handlers
          onNodeLock: (lock) => {
            if (!isMountedRef.current) return
            console.log('[useCollaboration] Node locked:', lock.nodeId, 'by', lock.userName)
            setNodeLock(lock)
          },
          onNodeUnlock: (nodeId) => {
            if (!isMountedRef.current) return
            console.log('[useCollaboration] Node unlocked:', nodeId)
            removeNodeLock(nodeId)
          },
        })

        if (isMountedRef.current) {
          setConnectionStatus('connected')
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
  }, [diagramId, enabled, setConnectionStatus, setCollaborators, setMyPresenceId, setNodeLock, removeNodeLock, reset])

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

  // Broadcast incremental operation
  const broadcastOperation = useCallback(
    (type: OperationType, targetId: string, data?: Record<string, unknown>) => {
      if (isConnected) {
        collaborationService.broadcastOperation(type, targetId, data)
      }
    },
    [isConnected]
  )

  // Node locking functions
  const acquireLock = useCallback(
    async (nodeId: string): Promise<boolean> => {
      if (!isConnected) return false
      const success = await collaborationService.acquireLock(nodeId)
      if (!success) {
        const lock = collaborationService.getNodeLock(nodeId)
        if (lock) {
          toast.warning(`Node is being edited by ${lock.userName}`, { duration: 2000 })
        }
      }
      return success
    },
    [isConnected]
  )

  const releaseLock = useCallback(
    async (nodeId: string): Promise<void> => {
      if (isConnected) {
        await collaborationService.releaseLock(nodeId)
      }
    },
    [isConnected]
  )

  const renewLock = useCallback(
    async (nodeId: string): Promise<boolean> => {
      if (!isConnected) return false
      return collaborationService.renewLock(nodeId)
    },
    [isConnected]
  )

  const isNodeLocked = useCallback(
    (nodeId: string): boolean => {
      return collaborationService.isNodeLocked(nodeId)
    },
    []
  )

  return {
    isConnected,
    connectionStatus,
    collaborators,
    myPresenceId,
    nodeLocks,
    updateCursor,
    updateViewport,
    broadcastNodeDrag,
    broadcastNodesDrag,
    broadcastFullSync,
    broadcastOperation,
    acquireLock,
    releaseLock,
    renewLock,
    isNodeLocked,
  }
}
