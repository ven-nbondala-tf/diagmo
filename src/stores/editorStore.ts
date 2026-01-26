import { create } from 'zustand'
import {
  type Connection,
  type NodeChange,
  type EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  MarkerType,
} from '@xyflow/react'
import { nanoid } from 'nanoid'
import type { DiagramNode, DiagramEdge, ShapeType, NodeStyle, EdgeStyle, HistoryEntry } from '@/types'
import { DEFAULT_NODE_STYLE, MAX_HISTORY_LENGTH } from '@/constants'

type AlignType = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
type DistributeType = 'horizontal' | 'vertical'

interface EditorState {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  selectedNodes: string[]
  selectedEdges: string[]
  clipboard: DiagramNode[]
  zoom: number
  gridEnabled: boolean
  snapToGrid: boolean
  gridSize: number
  past: HistoryEntry[]
  future: HistoryEntry[]
  isDirty: boolean
}

interface EditorActions {
  setNodes: (nodes: DiagramNode[]) => void
  setEdges: (edges: DiagramEdge[]) => void
  onNodesChange: (changes: NodeChange<DiagramNode>[]) => void
  onEdgesChange: (changes: EdgeChange<DiagramEdge>[]) => void
  onConnect: (connection: Connection) => void
  addNode: (type: ShapeType, position: { x: number; y: number }) => void
  updateNode: (id: string, data: Partial<DiagramNode['data']>) => void
  updateNodeStyle: (id: string, style: Partial<NodeStyle>) => void
  updateEdgeStyle: (id: string, style: Partial<EdgeStyle>) => void
  updateEdge: (id: string, updates: Partial<DiagramEdge>) => void
  deleteSelected: () => void
  selectNodes: (ids: string[]) => void
  selectEdges: (ids: string[]) => void
  copyNodes: () => void
  pasteNodes: () => void
  setZoom: (zoom: number) => void
  toggleGrid: () => void
  toggleSnapToGrid: () => void
  setGridSize: (size: number) => void
  undo: () => void
  redo: () => void
  pushHistory: () => void
  resetEditor: () => void
  loadDiagram: (nodes: DiagramNode[], edges: DiagramEdge[]) => void
  setDirty: (dirty: boolean) => void
  // New actions for Set 3
  alignNodes: (type: AlignType) => void
  distributeNodes: (type: DistributeType) => void
  groupNodes: () => void
  ungroupNodes: () => void
  lockNodes: () => void
  unlockNodes: () => void
  toggleLockNodes: () => void
}

type EditorStore = EditorState & EditorActions

const initialState: EditorState = {
  nodes: [],
  edges: [],
  selectedNodes: [],
  selectedEdges: [],
  clipboard: [],
  zoom: 1,
  gridEnabled: true,
  snapToGrid: true,
  gridSize: 20,
  past: [],
  future: [],
  isDirty: false,
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  ...initialState,

  setNodes: (nodes) => set({ nodes, isDirty: true }),
  setEdges: (edges) => set({ edges, isDirty: true }),

  onNodesChange: (changes) => {
    const { nodes } = get()

    // Filter out position changes for locked nodes
    const filteredChanges = changes.filter((change) => {
      if (change.type === 'position' && 'id' in change) {
        const node = nodes.find((n) => n.id === change.id)
        if (node?.data.locked) return false
      }
      if (change.type === 'remove' && 'id' in change) {
        const node = nodes.find((n) => n.id === change.id)
        if (node?.data.locked) return false
      }
      return true
    })

    // Handle grouped node movement - when one node in a group moves, move all nodes in that group
    const positionChanges = filteredChanges.filter(
      (c): c is NodeChange & { type: 'position'; id: string; position?: { x: number; y: number }; dragging?: boolean } =>
        c.type === 'position' && 'id' in c
    )

    // Track position deltas for grouped nodes
    const groupDeltas = new Map<string, { dx: number; dy: number }>()

    for (const change of positionChanges) {
      if (!change.position) continue
      const node = nodes.find((n) => n.id === change.id)
      if (!node?.data.groupId) continue

      // Calculate delta from current position to new position
      const dx = change.position.x - node.position.x
      const dy = change.position.y - node.position.y

      // Only process if there's actual movement and node is being dragged
      if ((dx !== 0 || dy !== 0) && change.dragging) {
        const existingDelta = groupDeltas.get(node.data.groupId)
        if (!existingDelta) {
          groupDeltas.set(node.data.groupId, { dx, dy })
        }
      }
    }

    // Apply node changes first
    let newNodes = applyNodeChanges(filteredChanges, nodes) as DiagramNode[]

    // Now apply group movement to other nodes in the same group
    if (groupDeltas.size > 0) {
      const movedNodeIds = new Set(positionChanges.map((c) => c.id))

      newNodes = newNodes.map((node) => {
        // Skip if this node was already moved directly
        if (movedNodeIds.has(node.id)) return node
        // Skip if node has no group
        if (!node.data.groupId) return node
        // Skip if node is locked
        if (node.data.locked) return node

        const delta = groupDeltas.get(node.data.groupId)
        if (!delta) return node

        return {
          ...node,
          position: {
            x: node.position.x + delta.dx,
            y: node.position.y + delta.dy,
          },
        }
      })
    }

    const hasSignificantChange = filteredChanges.some(
      (c) => c.type === 'position' || c.type === 'dimensions' || c.type === 'remove'
    )
    if (hasSignificantChange) {
      get().pushHistory()
    }
    set({ nodes: newNodes, isDirty: true })
  },

  onEdgesChange: (changes) => {
    const newEdges = applyEdgeChanges(changes, get().edges) as DiagramEdge[]
    const hasRemoval = changes.some((c) => c.type === 'remove')
    if (hasRemoval) {
      get().pushHistory()
    }
    set({ edges: newEdges, isDirty: true })
  },

  onConnect: (connection) => {
    get().pushHistory()
    const newEdge: DiagramEdge = {
      id: nanoid(),
      source: connection.source!,
      target: connection.target!,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      type: 'straight',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 12,
        height: 12,
        color: '#6b7280',
      },
      style: {
        strokeWidth: 1.5,
        stroke: '#6b7280',
      },
    }
    set({
      edges: addEdge(newEdge, get().edges) as DiagramEdge[],
      isDirty: true,
    })
  },

  addNode: (type, position) => {
    get().pushHistory()
    // Set initial dimensions based on shape type
    const dimensions = getDefaultDimensions(type)
    const newNode: DiagramNode = {
      id: nanoid(),
      type: 'custom',
      position,
      style: { width: dimensions.width, height: dimensions.height },
      data: {
        label: getDefaultLabel(type),
        type,
        style: { ...DEFAULT_NODE_STYLE },
      },
    }
    set({
      nodes: [...get().nodes, newNode],
      selectedNodes: [newNode.id],
      isDirty: true,
    })
  },

  updateNode: (id, data) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ),
      isDirty: true,
    })
  },

  updateNodeStyle: (id, style) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                style: { ...node.data.style, ...style },
              },
            }
          : node
      ),
      isDirty: true,
    })
  },

  updateEdgeStyle: (id, style) => {
    set({
      edges: get().edges.map((edge) =>
        edge.id === id
          ? {
              ...edge,
              data: {
                ...edge.data,
                style: { ...edge.data?.style, ...style },
              },
            }
          : edge
      ),
      isDirty: true,
    })
  },

  updateEdge: (id, updates) => {
    set({
      edges: get().edges.map((edge) =>
        edge.id === id ? { ...edge, ...updates } : edge
      ),
      isDirty: true,
    })
  },

  deleteSelected: () => {
    const { nodes, edges, selectedNodes, selectedEdges } = get()

    // Filter out locked nodes from deletion
    const unlockedSelectedNodes = selectedNodes.filter((id) => {
      const node = nodes.find((n) => n.id === id)
      return !node?.data.locked
    })

    if (unlockedSelectedNodes.length === 0 && selectedEdges.length === 0) return

    get().pushHistory()
    set({
      nodes: nodes.filter((n) => !unlockedSelectedNodes.includes(n.id)),
      edges: edges.filter(
        (e) =>
          !selectedEdges.includes(e.id) &&
          !unlockedSelectedNodes.includes(e.source) &&
          !unlockedSelectedNodes.includes(e.target)
      ),
      selectedNodes: [],
      selectedEdges: [],
      isDirty: true,
    })
  },

  selectNodes: (ids) => set({ selectedNodes: ids }),
  selectEdges: (ids) => set({ selectedEdges: ids }),

  copyNodes: () => {
    const { nodes, selectedNodes } = get()
    if (selectedNodes.length === 0) return

    const nodesToCopy = nodes.filter((n) => selectedNodes.includes(n.id))
    set({ clipboard: nodesToCopy })
  },

  pasteNodes: () => {
    const { clipboard, nodes } = get()
    if (clipboard.length === 0) return

    get().pushHistory()

    // Create new nodes with offset positions and new IDs
    const offset = 50
    const idMap = new Map<string, string>()
    const newGroupId = nanoid()

    const newNodes = clipboard.map((node) => {
      const newId = nanoid()
      idMap.set(node.id, newId)
      return {
        ...node,
        id: newId,
        position: {
          x: node.position.x + offset,
          y: node.position.y + offset,
        },
        data: {
          ...node.data,
          locked: false, // Pasted nodes are always unlocked
          groupId: node.data.groupId ? newGroupId : undefined, // Preserve group structure
        },
      }
    })

    set({
      nodes: [...nodes, ...newNodes],
      selectedNodes: newNodes.map((n) => n.id),
      isDirty: true,
    })
  },

  setZoom: (zoom) => set({ zoom }),
  toggleGrid: () => set({ gridEnabled: !get().gridEnabled }),
  toggleSnapToGrid: () => set({ snapToGrid: !get().snapToGrid }),
  setGridSize: (gridSize) => set({ gridSize }),

  undo: () => {
    const { past, nodes, edges } = get()
    if (past.length === 0) return

    const previous = past[past.length - 1]
    const newPast = past.slice(0, -1)

    set({
      past: newPast,
      future: [{ nodes, edges, timestamp: Date.now() }, ...get().future],
      nodes: previous.nodes,
      edges: previous.edges,
      isDirty: true,
    })
  },

  redo: () => {
    const { future, nodes, edges } = get()
    if (future.length === 0) return

    const next = future[0]
    const newFuture = future.slice(1)

    set({
      future: newFuture,
      past: [...get().past, { nodes, edges, timestamp: Date.now() }],
      nodes: next.nodes,
      edges: next.edges,
      isDirty: true,
    })
  },

  pushHistory: () => {
    const { nodes, edges, past } = get()
    const newPast = [...past, { nodes, edges, timestamp: Date.now() }]

    if (newPast.length > MAX_HISTORY_LENGTH) {
      newPast.shift()
    }

    set({
      past: newPast,
      future: [],
    })
  },

  resetEditor: () => set(initialState),

  loadDiagram: (nodes, edges) => {
    set({
      nodes,
      edges,
      past: [],
      future: [],
      selectedNodes: [],
      selectedEdges: [],
      clipboard: [],
      isDirty: false,
    })
  },

  setDirty: (isDirty) => set({ isDirty }),

  // Align nodes
  alignNodes: (type) => {
    const { nodes, selectedNodes } = get()
    if (selectedNodes.length < 2) return

    get().pushHistory()

    const selectedNodeObjects = nodes.filter((n) => selectedNodes.includes(n.id) && !n.data.locked)
    if (selectedNodeObjects.length < 2) return

    // Calculate bounds
    const bounds = selectedNodeObjects.reduce(
      (acc, node) => {
        const width = node.measured?.width || 150
        const height = node.measured?.height || 50
        return {
          minX: Math.min(acc.minX, node.position.x),
          maxX: Math.max(acc.maxX, node.position.x + width),
          minY: Math.min(acc.minY, node.position.y),
          maxY: Math.max(acc.maxY, node.position.y + height),
        }
      },
      { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
    )

    const centerX = (bounds.minX + bounds.maxX) / 2
    const centerY = (bounds.minY + bounds.maxY) / 2

    const newNodes = nodes.map((node) => {
      if (!selectedNodes.includes(node.id) || node.data.locked) return node

      const width = node.measured?.width || 150
      const height = node.measured?.height || 50
      let newPosition = { ...node.position }

      switch (type) {
        case 'left':
          newPosition.x = bounds.minX
          break
        case 'center':
          newPosition.x = centerX - width / 2
          break
        case 'right':
          newPosition.x = bounds.maxX - width
          break
        case 'top':
          newPosition.y = bounds.minY
          break
        case 'middle':
          newPosition.y = centerY - height / 2
          break
        case 'bottom':
          newPosition.y = bounds.maxY - height
          break
      }

      return { ...node, position: newPosition }
    })

    set({ nodes: newNodes, isDirty: true })
  },

  // Distribute nodes evenly
  distributeNodes: (type) => {
    const { nodes, selectedNodes } = get()
    if (selectedNodes.length < 3) return

    get().pushHistory()

    const selectedNodeObjects = nodes
      .filter((n) => selectedNodes.includes(n.id) && !n.data.locked)
      .sort((a, b) =>
        type === 'horizontal'
          ? a.position.x - b.position.x
          : a.position.y - b.position.y
      )

    if (selectedNodeObjects.length < 3) return

    const first = selectedNodeObjects[0]
    const last = selectedNodeObjects[selectedNodeObjects.length - 1]

    if (type === 'horizontal') {
      const firstWidth = first.measured?.width || 150
      const lastWidth = last.measured?.width || 150
      const totalWidth = (last.position.x + lastWidth) - first.position.x
      const totalNodeWidth = selectedNodeObjects.reduce(
        (sum, n) => sum + (n.measured?.width || 150),
        0
      )
      const gap = (totalWidth - totalNodeWidth) / (selectedNodeObjects.length - 1)

      let currentX = first.position.x + firstWidth + gap

      const newNodes = nodes.map((node) => {
        const idx = selectedNodeObjects.findIndex((n) => n.id === node.id)
        if (idx <= 0 || idx === selectedNodeObjects.length - 1) return node
        if (node.data.locked) return node

        const newPosition = { ...node.position, x: currentX }
        currentX += (node.measured?.width || 150) + gap
        return { ...node, position: newPosition }
      })

      set({ nodes: newNodes, isDirty: true })
    } else {
      const firstHeight = first.measured?.height || 50
      const lastHeight = last.measured?.height || 50
      const totalHeight = (last.position.y + lastHeight) - first.position.y
      const totalNodeHeight = selectedNodeObjects.reduce(
        (sum, n) => sum + (n.measured?.height || 50),
        0
      )
      const gap = (totalHeight - totalNodeHeight) / (selectedNodeObjects.length - 1)

      let currentY = first.position.y + firstHeight + gap

      const newNodes = nodes.map((node) => {
        const idx = selectedNodeObjects.findIndex((n) => n.id === node.id)
        if (idx <= 0 || idx === selectedNodeObjects.length - 1) return node
        if (node.data.locked) return node

        const newPosition = { ...node.position, y: currentY }
        currentY += (node.measured?.height || 50) + gap
        return { ...node, position: newPosition }
      })

      set({ nodes: newNodes, isDirty: true })
    }
  },

  // Group selected nodes
  groupNodes: () => {
    const { nodes, selectedNodes } = get()
    if (selectedNodes.length < 2) return

    get().pushHistory()

    const groupId = nanoid()
    const newNodes = nodes.map((node) => {
      if (!selectedNodes.includes(node.id)) return node
      return {
        ...node,
        data: {
          ...node.data,
          groupId,
        },
      }
    })

    set({ nodes: newNodes, isDirty: true })
  },

  // Ungroup selected nodes
  ungroupNodes: () => {
    const { nodes, selectedNodes } = get()
    if (selectedNodes.length === 0) return

    get().pushHistory()

    const newNodes = nodes.map((node) => {
      if (!selectedNodes.includes(node.id)) return node
      const { groupId, ...restData } = node.data
      return {
        ...node,
        data: restData as DiagramNode['data'],
      }
    })

    set({ nodes: newNodes, isDirty: true })
  },

  // Lock selected nodes
  lockNodes: () => {
    const { nodes, selectedNodes } = get()
    if (selectedNodes.length === 0) return

    const newNodes = nodes.map((node) => {
      if (!selectedNodes.includes(node.id)) return node
      return {
        ...node,
        data: {
          ...node.data,
          locked: true,
        },
      }
    })

    set({ nodes: newNodes, isDirty: true })
  },

  // Unlock selected nodes
  unlockNodes: () => {
    const { nodes, selectedNodes } = get()
    if (selectedNodes.length === 0) return

    const newNodes = nodes.map((node) => {
      if (!selectedNodes.includes(node.id)) return node
      return {
        ...node,
        data: {
          ...node.data,
          locked: false,
        },
      }
    })

    set({ nodes: newNodes, isDirty: true })
  },

  // Toggle lock on selected nodes
  toggleLockNodes: () => {
    const { nodes, selectedNodes } = get()
    if (selectedNodes.length === 0) return

    const selectedNodeObjects = nodes.filter((n) => selectedNodes.includes(n.id))
    const allLocked = selectedNodeObjects.every((n) => n.data.locked)

    const newNodes = nodes.map((node) => {
      if (!selectedNodes.includes(node.id)) return node
      return {
        ...node,
        data: {
          ...node.data,
          locked: !allLocked,
        },
      }
    })

    set({ nodes: newNodes, isDirty: true })
  },
}))

function getDefaultLabel(_type: ShapeType): string {
  // Return empty string - no default text on shapes
  return ''
}

function getDefaultDimensions(type: ShapeType): { width: number; height: number } {
  // Complete dimensions for all shapes
  const dimensions: Partial<Record<ShapeType, { width: number; height: number }>> = {
    // Basic shapes
    rectangle: { width: 120, height: 60 },
    'rounded-rectangle': { width: 120, height: 60 },
    ellipse: { width: 120, height: 80 },
    circle: { width: 80, height: 80 },
    diamond: { width: 100, height: 100 },
    triangle: { width: 100, height: 80 },
    pentagon: { width: 100, height: 90 },
    hexagon: { width: 120, height: 80 },
    octagon: { width: 90, height: 90 },
    star: { width: 100, height: 100 },
    parallelogram: { width: 120, height: 60 },
    trapezoid: { width: 120, height: 60 },
    cylinder: { width: 100, height: 100 },
    cloud: { width: 140, height: 90 },
    arrow: { width: 100, height: 50 },
    'double-arrow': { width: 120, height: 50 },
    callout: { width: 140, height: 80 },
    note: { width: 120, height: 100 },
    text: { width: 100, height: 40 },

    // Flowchart shapes
    terminator: { width: 120, height: 50 },
    process: { width: 120, height: 60 },
    decision: { width: 100, height: 100 },
    data: { width: 120, height: 60 },
    document: { width: 120, height: 80 },
    'multi-document': { width: 130, height: 90 },
    'predefined-process': { width: 120, height: 60 },
    'manual-input': { width: 120, height: 60 },
    preparation: { width: 120, height: 60 },
    database: { width: 80, height: 100 },
    delay: { width: 100, height: 60 },
    merge: { width: 80, height: 60 },
    or: { width: 60, height: 60 },
    'summing-junction': { width: 60, height: 60 },

    // UML shapes
    'uml-class': { width: 150, height: 120 },
    'uml-interface': { width: 150, height: 100 },
    'uml-actor': { width: 60, height: 100 },
    'uml-usecase': { width: 140, height: 80 },
    'uml-component': { width: 140, height: 80 },
    'uml-package': { width: 140, height: 100 },
    'uml-state': { width: 120, height: 60 },
    'uml-note': { width: 120, height: 80 },

    // Network shapes
    server: { width: 80, height: 100 },
    router: { width: 100, height: 60 },
    switch: { width: 100, height: 50 },
    firewall: { width: 80, height: 80 },
    'load-balancer': { width: 100, height: 60 },
    user: { width: 60, height: 80 },
    users: { width: 80, height: 80 },
    laptop: { width: 100, height: 70 },
    mobile: { width: 50, height: 90 },
    internet: { width: 80, height: 80 },

    // Cloud provider shapes
    'aws-ec2': { width: 100, height: 70 },
    'aws-s3': { width: 100, height: 70 },
    'aws-lambda': { width: 100, height: 70 },
    'aws-rds': { width: 100, height: 70 },
    'azure-vm': { width: 100, height: 70 },
    'azure-storage': { width: 100, height: 70 },
    'azure-functions': { width: 100, height: 70 },
    'gcp-compute': { width: 100, height: 70 },
    'gcp-storage': { width: 100, height: 70 },
    'gcp-functions': { width: 100, height: 70 },
  }
  return dimensions[type] || { width: 120, height: 60 }
}
