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
    const newNodes = applyNodeChanges(changes, get().nodes) as DiagramNode[]
    const hasSignificantChange = changes.some(
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
    if (selectedNodes.length === 0 && selectedEdges.length === 0) return

    get().pushHistory()
    set({
      nodes: nodes.filter((n) => !selectedNodes.includes(n.id)),
      edges: edges.filter(
        (e) =>
          !selectedEdges.includes(e.id) &&
          !selectedNodes.includes(e.source) &&
          !selectedNodes.includes(e.target)
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
        data: { ...node.data },
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
