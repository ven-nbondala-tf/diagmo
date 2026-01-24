import { useCallback, useEffect, useRef } from 'react'
import {
  ReactFlow,
  Background,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
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
  type: 'smoothstep',
  animated: false,
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

      if (event.key === 'Delete' || event.key === 'Backspace') {
        deleteSelected()
      }

      // Group: Ctrl+G
      if ((event.metaKey || event.ctrlKey) && event.key === 'g' && !event.shiftKey) {
        event.preventDefault()
        groupNodes()
      }

      // Ungroup: Ctrl+Shift+G
      if ((event.metaKey || event.ctrlKey) && event.key === 'g' && event.shiftKey) {
        event.preventDefault()
        ungroupNodes()
      }

      // Lock/Unlock: Ctrl+L
      if ((event.metaKey || event.ctrlKey) && event.key === 'l') {
        event.preventDefault()
        toggleLockNodes()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [deleteSelected, groupNodes, ungroupNodes, toggleLockNodes])

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
