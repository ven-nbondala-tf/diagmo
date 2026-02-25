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
  updateCursor: (x: number | null, y: number | null, isDrawing?: boolean) => void
  updateViewport: (x: number, y: number, zoom: number) => void
  broadcastNodeDrag: (nodeId: string, position: { x: number; y: number }) => void
  broadcastNodesDrag: (nodes: Array<{ id: string; position: { x: number; y: number } }>) => void
  broadcastFullSync: (nodes: DiagramNode[], edges: DiagramEdge[]) => void
  // Operation-based sync
  broadcastOperation: (type: OperationType, targetId: string, data?: Record<string, unknown>) => void
  // Page and whiteboard sync
  broadcastPageChange: (pageId: string, pageName: string) => void
  broadcastDrawingStrokes: (pageId: string, strokes: unknown[], action?: 'add' | 'update' | 'clear') => void
  // Node locking
  acquireLock: (nodeId: string) => Promise<boolean>
  releaseLock: (nodeId: string) => Promise<void>
  renewLock: (nodeId: string) => Promise<boolean>
  isNodeLocked: (nodeId: string) => boolean
  // Follow mode and spotlight
  broadcastViewportChange: (viewport: { x: number; y: number; zoom: number }) => void
  spotlightElement: (nodeId: string) => void
  clearSpotlight: () => void
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
  const setApplyingRemoteChanges = useCollaborationStore((s) => s.setApplyingRemoteChanges)
  const reset = useCollaborationStore((s) => s.reset)

  // Track if we're mounted
  const isMountedRef = useRef(true)
  const isApplyingRemoteRef = useRef(false)
  const cleanupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Join collaboration session
  useEffect(() => {
    // Guard against null/undefined diagramId
    if (!enabled || !diagramId || diagramId === 'null' || diagramId === 'undefined') {
      console.log('[useCollaboration] Skipping join - invalid diagramId:', diagramId)
      return
    }

    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
      console.warn('[useCollaboration] Collaboration disabled - Supabase not configured')
      setConnectionStatus('disconnected')
      return
    }

    isMountedRef.current = true

    const join = async () => {
      try {
        // Set status to connecting while establishing connection
        setConnectionStatus('connecting')

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

            console.log('[useCollaboration] Received operation:', operation.type, operation.targetId, operation.data)
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
                  setNodes(nodes.map(n => {
                    if (n.id !== operation.targetId) return n
                    // Deep merge data property if present
                    if (updates.data) {
                      const newData = { ...n.data, ...updates.data }
                      // Deep merge style if present
                      if (updates.data.style && n.data.style) {
                        newData.style = { ...n.data.style, ...updates.data.style }
                      }
                      return {
                        ...n,
                        ...updates,
                        data: newData
                      }
                    }
                    return { ...n, ...updates }
                  }))
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
          // Page change handler for multi-page collaboration
          onPageChange: (payload) => {
            if (!isMountedRef.current) return
            console.log('[useCollaboration] Page changed by collaborator:', payload.pageId)
            // Notify that a collaborator changed pages (UI can show notification)
            toast.info(`Collaborator switched to ${payload.pageName}`, { duration: 2000 })
          },
          // Drawing stroke handler for whiteboard collaboration
          onDrawingStrokeChange: (payload) => {
            if (!isMountedRef.current) return
            if (isApplyingRemoteRef.current) return

            // Check if the strokes are for our current page
            const { currentPageId, setDrawingStrokes, drawingStrokes } = useEditorStore.getState()

            // Only apply strokes if they're for our current page
            if (payload.pageId && currentPageId && payload.pageId !== currentPageId) {
              console.log('[useCollaboration] Ignoring strokes for different page:', payload.pageId, 'vs', currentPageId)
              return
            }

            console.log('[useCollaboration] Applying drawing strokes from collaborator:', payload.action, 'strokes:', (payload.strokes as unknown[])?.length)
            isApplyingRemoteRef.current = true
            // Also set store flag so BottomBar knows not to re-broadcast
            setApplyingRemoteChanges(true)
            try {
              if (payload.action === 'clear') {
                setDrawingStrokes([])
              } else if (payload.action === 'add' || payload.action === 'update') {
                // For simplicity, replace all strokes with the received strokes
                // In a more advanced implementation, we could merge strokes
                setDrawingStrokes(payload.strokes as typeof drawingStrokes)
              }
            } finally {
              isApplyingRemoteRef.current = false
              // Delay clearing the store flag to ensure BottomBar's effect sees it
              // The effect has a 50ms debounce, so 150ms should be enough
              setTimeout(() => {
                setApplyingRemoteChanges(false)
              }, 150)
            }
          },
        })

        // Set presence ID after join completes
        // Connection status will be updated via onConnectionStatusChange callback
        if (isMountedRef.current) {
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
  }, [diagramId, enabled, setConnectionStatus, setCollaborators, setMyPresenceId, setNodeLock, removeNodeLock, setApplyingRemoteChanges, reset])

  // Throttled cursor update (max 30fps)
  const updateCursor = useCallback(
    throttle((x: number | null, y: number | null, isDrawing?: boolean) => {
      if (isConnected) {
        collaborationService.updateCursor(x, y, isDrawing)
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

  // Broadcast page change
  const broadcastPageChange = useCallback(
    (pageId: string, pageName: string) => {
      if (isConnected) {
        collaborationService.broadcastPageChange(pageId, pageName)
      }
    },
    [isConnected]
  )

  // Broadcast drawing strokes (throttled for performance)
  const broadcastDrawingStrokes = useCallback(
    throttle((pageId: string, strokes: unknown[], action: 'add' | 'update' | 'clear' = 'update') => {
      if (isConnected) {
        collaborationService.broadcastDrawingStrokes(pageId, strokes, action)
      }
    }, 100),
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
    broadcastPageChange,
    broadcastDrawingStrokes,
    acquireLock,
    releaseLock,
    renewLock,
    isNodeLocked,
  }
}
