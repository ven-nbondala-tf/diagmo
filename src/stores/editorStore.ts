import { create } from 'zustand'
import {
  type Connection,
  type NodeChange,
  type EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react'
import { nanoid } from 'nanoid'
import type { DiagramNode, DiagramEdge, ShapeType, NodeStyle, HistoryEntry } from '@/types'
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

    const newNodes = applyNodeChanges(filteredChanges, nodes) as DiagramNode[]
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
      type: 'smoothstep',
    }
    set({
      edges: addEdge(newEdge, get().edges) as DiagramEdge[],
      isDirty: true,
    })
  },

  addNode: (type, position) => {
    get().pushHistory()
    const newNode: DiagramNode = {
      id: nanoid(),
      type: 'custom',
      position,
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

function getDefaultLabel(type: ShapeType): string {
  const labels: Record<ShapeType, string> = {
    rectangle: 'Rectangle',
    ellipse: 'Ellipse',
    diamond: 'Diamond',
    parallelogram: 'Parallelogram',
    cylinder: 'Cylinder',
    triangle: 'Triangle',
    hexagon: 'Hexagon',
    cloud: 'Cloud',
    text: 'Text',
    process: 'Process',
    decision: 'Decision',
    terminator: 'Start/End',
    data: 'Data',
    document: 'Document',
    'predefined-process': 'Predefined Process',
    'manual-input': 'Manual Input',
    preparation: 'Preparation',
    delay: 'Delay',
    'uml-class': 'ClassName',
    'uml-interface': 'Interface',
    'uml-actor': 'Actor',
    'uml-usecase': 'Use Case',
    'uml-component': 'Component',
    'uml-package': 'Package',
    'aws-ec2': 'EC2',
    'aws-s3': 'S3',
    'aws-lambda': 'Lambda',
    'aws-rds': 'RDS',
    'azure-vm': 'VM',
    'azure-storage': 'Storage',
    'azure-functions': 'Functions',
    'gcp-compute': 'Compute',
    'gcp-storage': 'Storage',
    'gcp-functions': 'Functions',
  }
  return labels[type] || 'Node'
}
