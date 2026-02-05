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
import type { DiagramNode, DiagramEdge, ShapeType, NodeStyle, EdgeStyle, HistoryEntry, Layer } from '@/types'
import { DEFAULT_NODE_STYLE, MAX_HISTORY_LENGTH, SHAPE_LABELS } from '@/constants'

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
  propertiesPanelOpen: boolean
  interactionMode: 'select' | 'pan'
  shapePanelCollapsed: boolean
  commandPaletteOpen: boolean
  // Layers
  layers: Layer[]
  activeLayerId: string | null
  layersPanelOpen: boolean
  // Version history
  versionHistoryPanelOpen: boolean
}

interface EditorActions {
  setNodes: (nodes: DiagramNode[]) => void
  setEdges: (edges: DiagramEdge[]) => void
  onNodesChange: (changes: NodeChange<DiagramNode>[]) => void
  onEdgesChange: (changes: EdgeChange<DiagramEdge>[]) => void
  onConnect: (connection: Connection) => void
  addNode: (type: ShapeType, position: { x: number; y: number }, extraData?: Partial<DiagramNode['data']>, dimensions?: { width: number; height: number }) => void
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
  loadDiagram: (nodes: DiagramNode[], edges: DiagramEdge[], layers?: Layer[]) => void
  setDirty: (dirty: boolean) => void
  // New actions for Set 3
  alignNodes: (type: AlignType) => void
  distributeNodes: (type: DistributeType) => void
  groupNodes: () => void
  ungroupNodes: () => void
  lockNodes: () => void
  unlockNodes: () => void
  toggleLockNodes: () => void
  togglePropertiesPanel: () => void
  setPropertiesPanelOpen: (open: boolean) => void
  setInteractionMode: (mode: 'select' | 'pan') => void
  toggleShapePanel: () => void
  toggleCommandPalette: () => void
  setCommandPaletteOpen: (open: boolean) => void
  importDiagram: (nodes: DiagramNode[], edges: DiagramEdge[]) => void
  // Granular node update actions (replace direct setState)
  updateNodePosition: (id: string, position: { x?: number; y?: number }) => void
  updateNodeDimensions: (ids: string[], dimensions: { width?: number; height?: number }) => void
  bringToFront: (ids: string[]) => void
  bringForward: (ids: string[]) => void
  sendBackward: (ids: string[]) => void
  sendToBack: (ids: string[]) => void
  // Layer actions
  addLayer: (name?: string) => void
  deleteLayer: (id: string) => void
  updateLayer: (id: string, updates: Partial<Layer>) => void
  toggleLayerVisibility: (id: string) => void
  toggleLayerLock: (id: string) => void
  setActiveLayer: (id: string | null) => void
  moveLayerUp: (id: string) => void
  moveLayerDown: (id: string) => void
  assignNodesToLayer: (nodeIds: string[], layerId: string | null) => void
  toggleLayersPanel: () => void
  setLayers: (layers: Layer[]) => void
  // Version history
  toggleVersionHistoryPanel: () => void
}

type EditorStore = EditorState & EditorActions

// Default layer created when diagram starts
const DEFAULT_LAYER: Layer = {
  id: 'default-layer',
  name: 'Default',
  visible: true,
  locked: false,
  order: 0,
}

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
  propertiesPanelOpen: true,
  interactionMode: 'select',
  shapePanelCollapsed: false,
  commandPaletteOpen: false,
  past: [],
  future: [],
  isDirty: false,
  // Layers
  layers: [DEFAULT_LAYER],
  activeLayerId: 'default-layer',
  layersPanelOpen: false,
  // Version history
  versionHistoryPanelOpen: false,
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  ...initialState,

  setNodes: (nodes) => set({ nodes, isDirty: true }),
  setEdges: (edges) => set({ edges, isDirty: true }),

  onNodesChange: (changes) => {
    const { nodes, layers } = get()

    // Create a set of locked layer IDs
    const lockedLayerIds = new Set(
      layers.filter((l) => l.locked).map((l) => l.id)
    )

    // Check if a node is effectively locked (either node lock or layer lock)
    const isNodeLocked = (node: DiagramNode | undefined): boolean => {
      if (!node) return false
      if (node.data.locked) return true
      const layerId = node.data.layerId || 'default-layer'
      return lockedLayerIds.has(layerId)
    }

    // Filter out position changes for locked nodes or nodes on locked layers
    const filteredChanges = changes.filter((change) => {
      if (change.type === 'position' && 'id' in change) {
        const node = nodes.find((n) => n.id === change.id)
        if (isNodeLocked(node)) return false
      }
      if (change.type === 'remove' && 'id' in change) {
        const node = nodes.find((n) => n.id === change.id)
        if (isNodeLocked(node)) return false
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
        // Skip if node is locked (either node lock or layer lock)
        if (isNodeLocked(node)) return node

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

    // Only push history when drag ENDS (not every frame during drag)
    // or for non-drag changes (dimensions, remove)
    const hasDragEnd = filteredChanges.some(
      (c) => c.type === 'position' && 'dragging' in c && c.dragging === false
    )
    const hasNonDragChange = filteredChanges.some(
      (c) => c.type === 'dimensions' || c.type === 'remove'
    )
    if (hasDragEnd || hasNonDragChange) {
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

    // Use labeled edge type - it handles smart routing automatically
    const newEdge: DiagramEdge = {
      id: nanoid(),
      source: connection.source!,
      target: connection.target!,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      type: 'labeled', // Use our custom labeled edge with smart routing
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 8,    // Lucidchart style - small arrow
        height: 8,
        color: '#64748b',
      },
      style: {
        strokeWidth: 1.5,  // Slightly thicker for visibility
        stroke: '#64748b', // Slate gray
      },
    }
    set({
      edges: addEdge(newEdge, get().edges) as DiagramEdge[],
      isDirty: true,
    })
  },

  addNode: (type, position, extraData, customDimensions) => {
    get().pushHistory()
    // Set initial dimensions based on shape type or use custom dimensions
    const dimensions = customDimensions || getDefaultDimensions(type)
    // Merge styles properly: extraData.style overrides defaults, doesn't replace
    const { style: extraStyle, ...restExtraData } = extraData || {}
    const { activeLayerId } = get()
    const newNode: DiagramNode = {
      id: nanoid(),
      type: 'custom',
      position,
      style: { width: dimensions.width, height: dimensions.height },
      data: {
        label: getDefaultLabel(type),
        type,
        style: { ...DEFAULT_NODE_STYLE, ...extraStyle },
        layerId: activeLayerId || undefined,
        ...restExtraData,
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
    const { nodes, edges, selectedNodes, selectedEdges, layers } = get()

    // Create a set of locked layer IDs
    const lockedLayerIds = new Set(
      layers.filter((l) => l.locked).map((l) => l.id)
    )

    // Filter out locked nodes from deletion (node lock or layer lock)
    const unlockedSelectedNodes = selectedNodes.filter((id) => {
      const node = nodes.find((n) => n.id === id)
      if (!node) return false
      if (node.data.locked) return false
      const layerId = node.data.layerId || 'default-layer'
      return !lockedLayerIds.has(layerId)
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

  selectNodes: (ids) => {
    // Only track selection in our store - React Flow manages the selected property internally
    set({ selectedNodes: ids })
  },
  selectEdges: (ids) => {
    // Only track selection in our store - React Flow manages the selected property internally
    set({ selectedEdges: ids })
  },

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

  loadDiagram: (nodes, edges, layers) => {
    // Use provided layers or default layer
    const loadedLayers = layers && layers.length > 0 ? layers : [DEFAULT_LAYER]
    set({
      nodes,
      edges,
      layers: loadedLayers,
      activeLayerId: loadedLayers[0]?.id || null,
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

  // Toggle properties panel visibility
  togglePropertiesPanel: () => {
    set((state) => ({ propertiesPanelOpen: !state.propertiesPanelOpen }))
  },

  setPropertiesPanelOpen: (open: boolean) => {
    set({ propertiesPanelOpen: open })
  },

  setInteractionMode: (mode: 'select' | 'pan') => {
    set({ interactionMode: mode })
  },

  toggleShapePanel: () => {
    set((state) => ({ shapePanelCollapsed: !state.shapePanelCollapsed }))
  },

  toggleCommandPalette: () => {
    set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen }))
  },

  setCommandPaletteOpen: (open: boolean) => {
    set({ commandPaletteOpen: open })
  },

  importDiagram: (nodes, edges) => {
    get().pushHistory()
    set({
      nodes,
      edges,
      selectedNodes: [],
      selectedEdges: [],
      isDirty: true,
    })
  },

  // Update a single node's position (for properties panel X/Y inputs)
  updateNodePosition: (id, position) => {
    const { nodes } = get()
    const newNodes = nodes.map((n) => {
      if (n.id !== id) return n
      return {
        ...n,
        position: {
          x: position.x ?? n.position.x,
          y: position.y ?? n.position.y,
        },
      }
    })
    set({ nodes: newNodes, isDirty: true })
  },

  // Update dimensions for one or more nodes (for properties panel W/H inputs)
  updateNodeDimensions: (ids, dimensions) => {
    const { nodes } = get()
    const idSet = new Set(ids)
    const newNodes = nodes.map((n) => {
      if (!idSet.has(n.id)) return n
      return {
        ...n,
        style: {
          ...n.style,
          ...(dimensions.width !== undefined ? { width: dimensions.width } : {}),
          ...(dimensions.height !== undefined ? { height: dimensions.height } : {}),
        },
      }
    })
    set({ nodes: newNodes, isDirty: true })
  },

  // Bring selected nodes to front (highest z-index)
  bringToFront: (ids) => {
    const { nodes } = get()
    const maxZ = Math.max(...nodes.map((n) => n.zIndex || 0))
    let offset = 1
    const idSet = new Set(ids)
    const newNodes = nodes.map((n) => {
      if (!idSet.has(n.id)) return n
      return { ...n, zIndex: maxZ + offset++ }
    })
    set({ nodes: newNodes, isDirty: true })
  },

  // Bring selected nodes one layer forward
  bringForward: (ids) => {
    const { nodes } = get()
    let newNodes = [...nodes]
    for (const id of ids) {
      const idx = newNodes.findIndex((n) => n.id === id)
      if (idx === -1) continue
      const currentZ = newNodes[idx].zIndex || 0
      const higherNodes = newNodes.filter((n) => (n.zIndex || 0) > currentZ)
      if (higherNodes.length > 0) {
        const nextZ = Math.min(...higherNodes.map((n) => n.zIndex || 0))
        newNodes[idx] = { ...newNodes[idx], zIndex: nextZ + 1 }
      }
    }
    set({ nodes: newNodes, isDirty: true })
  },

  // Send selected nodes one layer backward
  sendBackward: (ids) => {
    const { nodes } = get()
    let newNodes = [...nodes]
    for (const id of ids) {
      const idx = newNodes.findIndex((n) => n.id === id)
      if (idx === -1) continue
      const currentZ = newNodes[idx].zIndex || 0
      const lowerNodes = newNodes.filter((n) => (n.zIndex || 0) < currentZ)
      if (lowerNodes.length > 0) {
        const prevZ = Math.max(...lowerNodes.map((n) => n.zIndex || 0))
        newNodes[idx] = { ...newNodes[idx], zIndex: prevZ - 1 }
      }
    }
    set({ nodes: newNodes, isDirty: true })
  },

  // Send selected nodes to back (lowest z-index)
  sendToBack: (ids) => {
    const { nodes } = get()
    const minZ = Math.min(...nodes.map((n) => n.zIndex || 0))
    let offset = 1
    const idSet = new Set(ids)
    const newNodes = nodes.map((n) => {
      if (!idSet.has(n.id)) return n
      return { ...n, zIndex: minZ - offset++ }
    })
    set({ nodes: newNodes, isDirty: true })
  },

  // Layer actions
  addLayer: (name) => {
    const { layers } = get()
    const maxOrder = Math.max(...layers.map((l) => l.order), -1)
    const newLayer: Layer = {
      id: nanoid(),
      name: name || `Layer ${layers.length + 1}`,
      visible: true,
      locked: false,
      order: maxOrder + 1,
    }
    set({
      layers: [...layers, newLayer],
      activeLayerId: newLayer.id,
      isDirty: true,
    })
  },

  deleteLayer: (id) => {
    const { layers, nodes, activeLayerId } = get()
    // Don't delete the last layer
    if (layers.length <= 1) return

    const newLayers = layers.filter((l) => l.id !== id)
    // Move nodes from deleted layer to first available layer
    const fallbackLayer = newLayers[0]
    const newNodes = nodes.map((n) =>
      n.data.layerId === id
        ? { ...n, data: { ...n.data, layerId: fallbackLayer.id } }
        : n
    )

    set({
      layers: newLayers,
      nodes: newNodes,
      activeLayerId: activeLayerId === id ? fallbackLayer.id : activeLayerId,
      isDirty: true,
    })
  },

  updateLayer: (id, updates) => {
    const { layers } = get()
    set({
      layers: layers.map((l) => (l.id === id ? { ...l, ...updates } : l)),
      isDirty: true,
    })
  },

  toggleLayerVisibility: (id) => {
    const { layers } = get()
    set({
      layers: layers.map((l) =>
        l.id === id ? { ...l, visible: !l.visible } : l
      ),
      isDirty: true,
    })
  },

  toggleLayerLock: (id) => {
    const { layers } = get()
    set({
      layers: layers.map((l) =>
        l.id === id ? { ...l, locked: !l.locked } : l
      ),
      isDirty: true,
    })
  },

  setActiveLayer: (id) => {
    set({ activeLayerId: id })
  },

  moveLayerUp: (id) => {
    const { layers } = get()
    const sortedLayers = [...layers].sort((a, b) => a.order - b.order)
    const idx = sortedLayers.findIndex((l) => l.id === id)
    if (idx === sortedLayers.length - 1) return // Already at top

    const currentLayer = sortedLayers[idx]
    const aboveLayer = sortedLayers[idx + 1]
    const tempOrder = currentLayer.order
    currentLayer.order = aboveLayer.order
    aboveLayer.order = tempOrder

    set({ layers: sortedLayers, isDirty: true })
  },

  moveLayerDown: (id) => {
    const { layers } = get()
    const sortedLayers = [...layers].sort((a, b) => a.order - b.order)
    const idx = sortedLayers.findIndex((l) => l.id === id)
    if (idx === 0) return // Already at bottom

    const currentLayer = sortedLayers[idx]
    const belowLayer = sortedLayers[idx - 1]
    const tempOrder = currentLayer.order
    currentLayer.order = belowLayer.order
    belowLayer.order = tempOrder

    set({ layers: sortedLayers, isDirty: true })
  },

  assignNodesToLayer: (nodeIds, layerId) => {
    const { nodes } = get()
    set({
      nodes: nodes.map((n) =>
        nodeIds.includes(n.id)
          ? { ...n, data: { ...n.data, layerId: layerId || undefined } }
          : n
      ),
      isDirty: true,
    })
  },

  toggleLayersPanel: () => {
    set((state) => ({ layersPanelOpen: !state.layersPanelOpen }))
  },

  setLayers: (layers) => {
    set({ layers })
  },

  toggleVersionHistoryPanel: () => {
    set((state) => ({ versionHistoryPanelOpen: !state.versionHistoryPanelOpen }))
  },
}))

function getDefaultLabel(type: ShapeType): string {
  // Web images and junctions don't need labels
  if (type === 'web-image' || type === 'junction') {
    return ''
  }

  // Cloud icons and office icons get labels by default
  const isCloudIcon = type.startsWith('aws-') ||
                      type.startsWith('azure-') ||
                      type.startsWith('gcp-') ||
                      type.startsWith('office-') ||
                      type.startsWith('generic-') ||
                      type === 'kubernetes' ||
                      type === 'docker'

  if (isCloudIcon) {
    return SHAPE_LABELS[type] || ''
  }

  // Return empty string for regular shapes
  return ''
}

function getDefaultDimensions(type: ShapeType): { width: number; height: number } {
  // Junction nodes - small circle
  if (type === 'junction') {
    return { width: 16, height: 16 }
  }

  // Web images - default size, actual size determined by image
  if (type === 'web-image') {
    return { width: 200, height: 150 }
  }

  // All cloud/service icons - consistent square size
  const isIconType = type.startsWith('aws-') ||
                     type.startsWith('azure-') ||
                     type.startsWith('gcp-') ||
                     type.startsWith('office-') ||
                     type.startsWith('generic-') ||
                     type === 'kubernetes' ||
                     type === 'docker'

  if (isIconType) {
    return { width: 48, height: 48 }
  }

  // Text shape - smaller
  if (type === 'text') {
    return { width: 80, height: 30 }
  }

  // All other shapes
  return { width: 100, height: 60 }
}
