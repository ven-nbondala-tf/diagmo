/**
 * Keyboard Navigation Hook
 * Navigate and interact with diagram nodes using keyboard
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { useReactFlow } from '@xyflow/react'
import { useEditorStore } from '@/stores/editorStore'
import type { DiagramNode } from '@/types'

interface UseKeyboardNavigationOptions {
  enabled?: boolean
  onNavigate?: (nodeId: string) => void
  onEdit?: (nodeId: string) => void
}

interface NavigationState {
  focusedNodeId: string | null
  isNavigating: boolean
}

export function useKeyboardNavigation(options: UseKeyboardNavigationOptions = {}) {
  const { enabled = true, onNavigate, onEdit } = options

  const nodes = useEditorStore((s) => s.nodes)
  const edges = useEditorStore((s) => s.edges)
  const selectedNodes = useEditorStore((s) => s.selectedNodes)
  const selectNodes = useEditorStore((s) => s.selectNodes)
  const selectEdges = useEditorStore((s) => s.selectEdges)
  const setEditingNodeId = useEditorStore((s) => s.setEditingNodeId)
  const editingNodeId = useEditorStore((s) => s.editingNodeId)
  const setFocusedNodeId = useEditorStore((s) => s.setFocusedNodeId)

  const { setCenter, getZoom, fitView } = useReactFlow()

  const [state, setState] = useState<NavigationState>({
    focusedNodeId: null,
    isNavigating: false,
  })

  // Track if we're in keyboard navigation mode
  const isNavigatingRef = useRef(false)

  /**
   * Find the closest node in a given direction
   */
  const findNodeInDirection = useCallback((
    currentNode: DiagramNode,
    direction: 'up' | 'down' | 'left' | 'right'
  ): DiagramNode | null => {
    const currentX = currentNode.position.x + (currentNode.width || 100) / 2
    const currentY = currentNode.position.y + (currentNode.height || 50) / 2

    const candidates: { node: DiagramNode; distance: number; angle: number }[] = []

    for (const node of nodes) {
      if (node.id === currentNode.id) continue

      const nodeX = node.position.x + (node.width || 100) / 2
      const nodeY = node.position.y + (node.height || 50) / 2

      const dx = nodeX - currentX
      const dy = nodeY - currentY
      const distance = Math.sqrt(dx * dx + dy * dy)
      const angle = Math.atan2(dy, dx) * (180 / Math.PI)

      // Check if node is in the correct direction with some tolerance
      let isInDirection = false
      const tolerance = 60 // degrees

      switch (direction) {
        case 'right':
          isInDirection = angle >= -tolerance && angle <= tolerance
          break
        case 'left':
          isInDirection = angle >= 180 - tolerance || angle <= -180 + tolerance
          break
        case 'down':
          isInDirection = angle >= 90 - tolerance && angle <= 90 + tolerance
          break
        case 'up':
          isInDirection = angle >= -90 - tolerance && angle <= -90 + tolerance
          break
      }

      if (isInDirection) {
        candidates.push({ node, distance, angle })
      }
    }

    // Sort by distance and return closest
    candidates.sort((a, b) => a.distance - b.distance)
    return candidates[0]?.node || null
  }, [nodes])

  /**
   * Find connected nodes
   */
  const getConnectedNodes = useCallback((nodeId: string): DiagramNode[] => {
    const connectedIds = new Set<string>()

    for (const edge of edges) {
      if (edge.source === nodeId) {
        connectedIds.add(edge.target)
      }
      if (edge.target === nodeId) {
        connectedIds.add(edge.source)
      }
    }

    return nodes.filter(n => connectedIds.has(n.id))
  }, [nodes, edges])

  /**
   * Navigate to a node
   */
  const navigateToNode = useCallback((node: DiagramNode) => {
    // Select the node
    selectNodes([node.id])
    selectEdges([])

    // Update focused state (local and store)
    setState(prev => ({ ...prev, focusedNodeId: node.id }))
    setFocusedNodeId(node.id)

    // Zoom to node
    const zoom = Math.max(getZoom(), 0.8)
    setCenter(
      node.position.x + (node.width || 100) / 2,
      node.position.y + (node.height || 50) / 2,
      { zoom, duration: 200 }
    )

    onNavigate?.(node.id)
  }, [selectNodes, selectEdges, setCenter, getZoom, onNavigate, setFocusedNodeId])

  /**
   * Navigate in a direction
   */
  const navigate = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!enabled) return

    const currentNodeId = state.focusedNodeId || selectedNodes[0]

    // If no node is focused, select the first node
    if (!currentNodeId) {
      if (nodes.length > 0) {
        // Find the top-left most node
        const sortedNodes = [...nodes].sort((a, b) => {
          const aScore = a.position.x + a.position.y
          const bScore = b.position.x + b.position.y
          return aScore - bScore
        })
        navigateToNode(sortedNodes[0])
      }
      return
    }

    const currentNode = nodes.find(n => n.id === currentNodeId)
    if (!currentNode) return

    const nextNode = findNodeInDirection(currentNode, direction)
    if (nextNode) {
      navigateToNode(nextNode)
    }
  }, [enabled, state.focusedNodeId, selectedNodes, nodes, findNodeInDirection, navigateToNode])

  /**
   * Cycle through connected nodes
   */
  const cycleConnections = useCallback((reverse: boolean = false) => {
    if (!enabled) return

    const currentNodeId = state.focusedNodeId || selectedNodes[0]
    if (!currentNodeId) return

    const connected = getConnectedNodes(currentNodeId)
    if (connected.length === 0) return

    // Find current index in connected nodes
    const currentIndex = connected.findIndex(n => n.id === state.focusedNodeId)
    let nextIndex: number

    if (reverse) {
      nextIndex = currentIndex <= 0 ? connected.length - 1 : currentIndex - 1
    } else {
      nextIndex = (currentIndex + 1) % connected.length
    }

    navigateToNode(connected[nextIndex])
  }, [enabled, state.focusedNodeId, selectedNodes, getConnectedNodes, navigateToNode])

  /**
   * Start editing the focused node
   */
  const editFocusedNode = useCallback(() => {
    if (!enabled) return

    const nodeId = state.focusedNodeId || selectedNodes[0]
    if (nodeId) {
      setEditingNodeId(nodeId)
      onEdit?.(nodeId)
    }
  }, [enabled, state.focusedNodeId, selectedNodes, setEditingNodeId, onEdit])

  /**
   * Toggle selection of focused node
   */
  const toggleSelection = useCallback(() => {
    if (!enabled) return

    const nodeId = state.focusedNodeId
    if (!nodeId) return

    if (selectedNodes.includes(nodeId)) {
      selectNodes(selectedNodes.filter(id => id !== nodeId))
    } else {
      selectNodes([...selectedNodes, nodeId])
    }
  }, [enabled, state.focusedNodeId, selectedNodes, selectNodes])

  /**
   * Clear navigation focus
   */
  const clearFocus = useCallback(() => {
    setState(prev => ({ ...prev, focusedNodeId: null, isNavigating: false }))
    setFocusedNodeId(null)
    isNavigatingRef.current = false
  }, [setFocusedNodeId])

  /**
   * Start navigation mode
   */
  const startNavigation = useCallback(() => {
    setState(prev => ({ ...prev, isNavigating: true }))
    isNavigatingRef.current = true

    // If no node is focused, focus the first selected or first node
    if (!state.focusedNodeId) {
      const nodeToFocus = selectedNodes[0] || nodes[0]?.id
      if (nodeToFocus) {
        const node = nodes.find(n => n.id === nodeToFocus)
        if (node) navigateToNode(node)
      }
    }
  }, [state.focusedNodeId, selectedNodes, nodes, navigateToNode])

  // Keyboard event handler
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if user is typing in an input
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        editingNodeId
      ) {
        return
      }

      // Arrow keys for navigation
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        // Only handle if not panning (Shift+Arrow)
        if (e.shiftKey) return

        e.preventDefault()
        startNavigation()

        switch (e.key) {
          case 'ArrowUp':
            navigate('up')
            break
          case 'ArrowDown':
            navigate('down')
            break
          case 'ArrowLeft':
            navigate('left')
            break
          case 'ArrowRight':
            navigate('right')
            break
        }
      }

      // Tab to cycle connections
      if (e.key === 'Tab' && isNavigatingRef.current) {
        e.preventDefault()
        cycleConnections(e.shiftKey)
      }

      // Enter to edit
      if (e.key === 'Enter' && isNavigatingRef.current && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        editFocusedNode()
      }

      // Space to toggle selection
      if (e.key === ' ' && isNavigatingRef.current) {
        e.preventDefault()
        toggleSelection()
      }

      // Escape to exit navigation mode
      if (e.key === 'Escape' && isNavigatingRef.current) {
        clearFocus()
      }

      // Home to fit view
      if (e.key === 'Home' && isNavigatingRef.current) {
        e.preventDefault()
        fitView({ padding: 0.2, duration: 300 })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    enabled,
    editingNodeId,
    navigate,
    cycleConnections,
    editFocusedNode,
    toggleSelection,
    clearFocus,
    startNavigation,
    fitView,
  ])

  // Sync focused node with selection
  useEffect(() => {
    if (selectedNodes.length === 1 && !state.focusedNodeId) {
      const nodeId = selectedNodes[0]
      if (nodeId) {
        setState(prev => ({ ...prev, focusedNodeId: nodeId }))
      }
    }
  }, [selectedNodes, state.focusedNodeId])

  return {
    focusedNodeId: state.focusedNodeId,
    isNavigating: state.isNavigating,
    navigate,
    cycleConnections,
    editFocusedNode,
    toggleSelection,
    clearFocus,
    startNavigation,
    navigateToNode,
  }
}
