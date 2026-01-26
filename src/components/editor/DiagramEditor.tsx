import { useCallback, useEffect, useRef } from 'react'
import {
  ReactFlow,
  Background,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  ConnectionLineType,
  ConnectionMode,
  MarkerType,
  type OnSelectionChangeParams,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useEditorStore } from '@/stores/editorStore'
import type { Diagram, ShapeType } from '@/types'
import { nodeTypes } from './nodes'
import { ShapePanel } from './ShapePanel'
import { PropertiesPanel } from './PropertiesPanel'
import { ZoomControls } from './ZoomControls'
import { EditorToolbar } from './EditorToolbar'

const defaultEdgeOptions = {
  type: 'straight',
  animated: false,
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

// Connection line style (the line while dragging)
const connectionLineStyle = {
  strokeWidth: 2,
  stroke: '#22c55e', // Green while connecting
  strokeDasharray: '5,5', // Dashed to show it's temporary
}

interface DiagramEditorProps {
  diagram: Diagram
}

export function DiagramEditor({ diagram }: DiagramEditorProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { screenToFlowPosition } = useReactFlow()

  const nodes = useEditorStore((state) => state.nodes)
  const edges = useEditorStore((state) => state.edges)
  const onNodesChange = useEditorStore((state) => state.onNodesChange)
  const onEdgesChange = useEditorStore((state) => state.onEdgesChange)
  const onConnect = useEditorStore((state) => state.onConnect)
  const addNode = useEditorStore((state) => state.addNode)
  const selectNodes = useEditorStore((state) => state.selectNodes)
  const selectEdges = useEditorStore((state) => state.selectEdges)
  const deleteSelected = useEditorStore((state) => state.deleteSelected)
  const gridEnabled = useEditorStore((state) => state.gridEnabled)
  const snapToGrid = useEditorStore((state) => state.snapToGrid)
  const gridSize = useEditorStore((state) => state.gridSize)
  const loadDiagram = useEditorStore((state) => state.loadDiagram)
  const setZoom = useEditorStore((state) => state.setZoom)
  const groupNodes = useEditorStore((state) => state.groupNodes)
  const ungroupNodes = useEditorStore((state) => state.ungroupNodes)
  const toggleLockNodes = useEditorStore((state) => state.toggleLockNodes)
  const copyNodes = useEditorStore((state) => state.copyNodes)
  const pasteNodes = useEditorStore((state) => state.pasteNodes)
  const undo = useEditorStore((state) => state.undo)
  const redo = useEditorStore((state) => state.redo)
  const toggleGrid = useEditorStore((state) => state.toggleGrid)
  const toggleSnapToGrid = useEditorStore((state) => state.toggleSnapToGrid)

  // Load diagram on mount
  useEffect(() => {
    loadDiagram(diagram.nodes, diagram.edges)
  }, [diagram.id, diagram.nodes, diagram.edges, loadDiagram])

  const onSelectionChange = useCallback(
    ({ nodes, edges }: OnSelectionChangeParams) => {
      selectNodes(nodes.map((n) => n.id))
      selectEdges(edges.map((e) => e.id))
    },
    [selectNodes, selectEdges]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData('application/reactflow') as ShapeType
      if (!type) return

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      addNode(type, position)
    },
    [screenToFlowPosition, addNode]
  )

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      const isMod = event.metaKey || event.ctrlKey

      // Delete: Delete or Backspace
      if (event.key === 'Delete' || event.key === 'Backspace') {
        deleteSelected()
      }

      // Copy: Ctrl+C
      if (isMod && event.key === 'c') {
        event.preventDefault()
        copyNodes()
      }

      // Paste: Ctrl+V
      if (isMod && event.key === 'v') {
        event.preventDefault()
        pasteNodes()
      }

      // Duplicate: Ctrl+D
      if (isMod && event.key === 'd') {
        event.preventDefault()
        copyNodes()
        pasteNodes()
      }

      // Undo: Ctrl+Z
      if (isMod && event.key === 'z' && !event.shiftKey) {
        event.preventDefault()
        undo()
      }

      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if ((isMod && event.key === 'z' && event.shiftKey) || (isMod && event.key === 'y')) {
        event.preventDefault()
        redo()
      }

      // Select All: Ctrl+A
      if (isMod && event.key === 'a') {
        event.preventDefault()
        selectNodes(nodes.map((n) => n.id))
      }

      // Group: Ctrl+G
      if (isMod && event.key === 'g' && !event.shiftKey) {
        event.preventDefault()
        groupNodes()
      }

      // Ungroup: Ctrl+Shift+G
      if (isMod && event.key === 'g' && event.shiftKey) {
        event.preventDefault()
        ungroupNodes()
      }

      // Lock/Unlock: Ctrl+L
      if (isMod && event.key === 'l') {
        event.preventDefault()
        toggleLockNodes()
      }

      // Toggle Grid: Ctrl+' (quote)
      if (isMod && event.key === "'") {
        event.preventDefault()
        toggleGrid()
      }

      // Toggle Snap to Grid: Ctrl+Shift+'
      if (isMod && event.shiftKey && event.key === '"') {
        event.preventDefault()
        toggleSnapToGrid()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    deleteSelected,
    copyNodes,
    pasteNodes,
    undo,
    redo,
    selectNodes,
    nodes,
    groupNodes,
    ungroupNodes,
    toggleLockNodes,
    toggleGrid,
    toggleSnapToGrid,
  ])

  return (
    <div className="flex-1 flex overflow-hidden">
      <ShapePanel />
      <div ref={reactFlowWrapper} className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={onSelectionChange}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onMoveEnd={(_, viewport) => setZoom(viewport.zoom)}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          connectionLineType={ConnectionLineType.Straight}
          connectionLineStyle={connectionLineStyle}
          connectionMode={ConnectionMode.Loose}
          connectionRadius={30}
          snapToGrid={snapToGrid}
          snapGrid={[gridSize, gridSize]}
          fitView
          selectNodesOnDrag={false}
          className="bg-muted/30"
        >
          {gridEnabled && (
            <Background
              variant={BackgroundVariant.Dots}
              gap={gridSize}
              size={1}
              color="#d1d5db"
            />
          )}
          <MiniMap
            nodeStrokeColor="#374151"
            nodeColor="#ffffff"
            nodeBorderRadius={4}
          />
        </ReactFlow>
        <EditorToolbar />
        <ZoomControls />
      </div>
      <PropertiesPanel />
    </div>
  )
}
