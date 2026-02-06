import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ReactFlow,
  Background,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  ConnectionLineType,
  ConnectionMode,
  SelectionMode,
  MarkerType,
  type OnSelectionChangeParams,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { nanoid } from 'nanoid'
import { PanelRightOpen, Layers, History, MessageSquare, Wand2 } from 'lucide-react'
import { useEditorStore } from '@/stores/editorStore'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import type { Diagram, DiagramNode, DiagramEdge, ShapeType } from '@/types'
import { nodeTypes } from './nodes'
import { edgeTypes } from './edges'
import { ShapePanel } from './ShapePanel'
import { PropertiesPanel } from './properties'
import { LayersPanel } from './LayersPanel'
import { VersionHistoryPanel } from './VersionHistoryPanel'
import { CommentsPanel } from './CommentsPanel'
import { FindReplaceBar } from './FindReplaceBar'
import { ZoomControls } from './ZoomControls'
import { SelectionToolbar } from './SelectionToolbar'
import { QuickShapeBar } from './QuickShapeBar'
import { PageTabs } from './PageTabs'
import { ConditionalFormattingPanel } from './ConditionalFormattingPanel'
import { SmartGuides } from './SmartGuides'
import { AnnotationLayer } from './AnnotationLayer'
import { Button } from '@/components/ui'

const defaultEdgeOptions = {
  type: 'labeled', // Use custom labeled edge with smart routing
  animated: false,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 8,    // Lucidchart style - small arrow
    height: 8,
    color: '#64748b', // Slate gray
  },
  style: {
    strokeWidth: 1.5,  // Slightly thicker for visibility
    stroke: '#64748b', // Slate gray
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
  const { screenToFlowPosition, setCenter } = useReactFlow()
  const [annotationMode, setAnnotationMode] = useState(false)

  const nodes = useEditorStore((state) => state.nodes)
  const edges = useEditorStore((state) => state.edges)
  const onNodesChange = useEditorStore((state) => state.onNodesChange)
  const onEdgesChange = useEditorStore((state) => state.onEdgesChange)
  const onConnect = useEditorStore((state) => state.onConnect)
  const addNode = useEditorStore((state) => state.addNode)
  const selectNodes = useEditorStore((state) => state.selectNodes)
  const selectEdges = useEditorStore((state) => state.selectEdges)
  const gridEnabled = useEditorStore((state) => state.gridEnabled)
  const snapToGrid = useEditorStore((state) => state.snapToGrid)
  const gridSize = useEditorStore((state) => state.gridSize)
  const loadDiagram = useEditorStore((state) => state.loadDiagram)
  const setZoom = useEditorStore((state) => state.setZoom)
  const pushHistory = useEditorStore((state) => state.pushHistory)
  const setNodes = useEditorStore((state) => state.setNodes)
  const setEdges = useEditorStore((state) => state.setEdges)
  const propertiesPanelOpen = useEditorStore((state) => state.propertiesPanelOpen)
  const togglePropertiesPanel = useEditorStore((state) => state.togglePropertiesPanel)
  const layersPanelOpen = useEditorStore((state) => state.layersPanelOpen)
  const toggleLayersPanel = useEditorStore((state) => state.toggleLayersPanel)
  const versionHistoryPanelOpen = useEditorStore((state) => state.versionHistoryPanelOpen)
  const toggleVersionHistoryPanel = useEditorStore((state) => state.toggleVersionHistoryPanel)
  const commentsPanelOpen = useEditorStore((state) => state.commentsPanelOpen)
  const toggleCommentsPanel = useEditorStore((state) => state.toggleCommentsPanel)
  const findReplaceOpen = useEditorStore((state) => state.findReplaceOpen)
  const setFindReplaceOpen = useEditorStore((state) => state.setFindReplaceOpen)
  const interactionMode = useEditorStore((state) => state.interactionMode)
  const layers = useEditorStore((state) => state.layers)
  const conditionalFormattingPanelOpen = useEditorStore((state) => state.conditionalFormattingPanelOpen)
  const toggleConditionalFormattingPanel = useEditorStore((state) => state.toggleConditionalFormattingPanel)

  // Load diagram on mount
  useEffect(() => {
    loadDiagram(diagram.nodes, diagram.edges, diagram.layers)
  }, [diagram.id, diagram.nodes, diagram.edges, diagram.layers, loadDiagram])

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

  // Click on minimap to navigate
  const handleMinimapClick = useCallback(
    (_event: React.MouseEvent, position: { x: number; y: number }) => {
      setCenter(position.x, position.y, { duration: 300 })
    },
    [setCenter]
  )

  // Double-click on edge to insert a junction node
  const handleEdgeDoubleClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.stopPropagation()

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      pushHistory()

      const junctionId = nanoid()
      const edgeStroke = (edge.style?.stroke as string) || '#64748b'

      const junctionNode: DiagramNode = {
        id: junctionId,
        type: 'custom',
        position: { x: position.x - 8, y: position.y - 8 },
        style: { width: 16, height: 16 },
        data: {
          label: '',
          type: 'junction',
          style: {
            backgroundColor: edgeStroke,
            borderColor: edgeStroke,
            borderWidth: 0,
            borderRadius: 100,
          },
        },
      }

      const edge1: DiagramEdge = {
        id: nanoid(),
        source: edge.source,
        sourceHandle: edge.sourceHandle ?? null,
        target: junctionId,
        targetHandle: null,
        type: edge.type || 'labeled',
        markerEnd: edge.markerEnd,
        style: edge.style,
        data: { waypointOffset: { x: 0, y: 0 } },
      }

      const edge2: DiagramEdge = {
        id: nanoid(),
        source: junctionId,
        sourceHandle: null,
        target: edge.target,
        targetHandle: edge.targetHandle ?? null,
        type: edge.type || 'labeled',
        markerEnd: edge.markerEnd,
        style: edge.style,
        data: { waypointOffset: { x: 0, y: 0 } },
      }

      const currentNodes = useEditorStore.getState().nodes
      const currentEdges = useEditorStore.getState().edges

      setNodes([...currentNodes, junctionNode])
      setEdges([
        ...currentEdges.filter((e) => e.id !== edge.id),
        edge1,
        edge2,
      ])
    },
    [screenToFlowPosition, pushHistory, setNodes, setEdges]
  )

  // Double-click on canvas to add a rectangle
  const onPaneDoubleClick = useCallback((event: React.MouseEvent) => {
    if (!(event.target as HTMLElement).classList.contains('react-flow__pane')) return
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })
    addNode('rectangle', position)
  }, [screenToFlowPosition, addNode])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData('application/reactflow') as ShapeType
      if (!type) return

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      // Handle custom-shape type with embedded SVG
      if (type === 'custom-shape') {
        try {
          const customShapeStr = event.dataTransfer.getData('application/custom-shape')
          if (customShapeStr) {
            const customShape = JSON.parse(customShapeStr)
            addNode('custom-shape', position, {
              customShapeId: customShape.id,
              customShapeName: customShape.name,
              customShapeSvg: customShape.svgContent,
            }, { width: 64, height: 64 })
            return
          }
        } catch (e) {
          console.error('Error parsing custom shape data:', e)
        }
      }

      // Handle web-image type with additional data
      if (type === 'web-image') {
        try {
          const imageDataStr = event.dataTransfer.getData('application/json')
          if (imageDataStr) {
            const imageData = JSON.parse(imageDataStr)
            const noBorder = imageData.imageType === 'icon' || imageData.imageType === 'gif'
            // Icons/GIFs: tight 48x48 like cloud icons. Photos: 200px max.
            const maxSize = noBorder ? 48 : 200
            const aspectRatio = imageData.width / imageData.height
            let width = maxSize
            let height = maxSize
            if (!noBorder) {
              if (aspectRatio > 1) {
                height = maxSize / aspectRatio
              } else {
                width = maxSize * aspectRatio
              }
            }

            addNode('web-image', position, {
              imageUrl: imageData.imageUrl,
              thumbnailUrl: imageData.thumbnailUrl,
              imageType: imageData.imageType,
              imageAlt: imageData.alt,
              objectFit: noBorder ? 'contain' : 'cover',
              attribution: imageData.attribution,
              ...(noBorder ? { style: { backgroundColor: 'transparent', borderWidth: 0, borderRadius: 0 } } : {}),
            }, { width, height })
            return
          }
        } catch (e) {
          console.error('Error parsing image data:', e)
        }
      }

      addNode(type, position)
    },
    [screenToFlowPosition, addNode]
  )

  // Filter nodes based on layer visibility
  const hiddenLayerIds = new Set(
    layers.filter((l) => !l.visible).map((l) => l.id)
  )
  const visibleNodes = nodes.filter((node) => {
    const layerId = node.data.layerId || 'default-layer'
    return !hiddenLayerIds.has(layerId)
  })

  // Filter edges that connect to hidden nodes
  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id))
  const visibleEdges = edges.filter(
    (edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
  )

  return (
    <div className="flex-1 flex overflow-hidden">
      <ErrorBoundary>
        <ShapePanel />
      </ErrorBoundary>
      <div className="flex-1 flex flex-col">
        <div ref={reactFlowWrapper} className="flex-1 relative" onDoubleClick={onPaneDoubleClick}>
        <ReactFlow
          nodes={visibleNodes}
          edges={visibleEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={onSelectionChange}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onEdgeDoubleClick={handleEdgeDoubleClick}
          onMoveEnd={(_, viewport) => setZoom(viewport.zoom)}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          connectionLineType={ConnectionLineType.SmoothStep}
          connectionLineStyle={connectionLineStyle}
          connectionMode={ConnectionMode.Loose}
          connectionRadius={25}
          snapToGrid={snapToGrid}
          snapGrid={[gridSize, gridSize]}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          selectionOnDrag={interactionMode === 'select'}
          panOnDrag={interactionMode === 'select' ? [1, 2] : true}
          selectionMode={SelectionMode.Partial}
          className="bg-muted/30"
        >
          {gridEnabled && (
            <>
              <Background
                id="major-grid"
                variant={BackgroundVariant.Lines}
                gap={gridSize * 5}
                lineWidth={0.5}
                color="rgba(0, 0, 0, 0.08)"
              />
              <Background
                id="minor-grid"
                variant={BackgroundVariant.Lines}
                gap={gridSize}
                lineWidth={0.3}
                color="rgba(0, 0, 0, 0.04)"
              />
            </>
          )}
          <MiniMap
            nodeStrokeColor="#374151"
            nodeColor="#ffffff"
            nodeBorderRadius={4}
            onClick={handleMinimapClick}
          />
          <SmartGuides enabled={snapToGrid} />
        </ReactFlow>
        <SelectionToolbar />
        <QuickShapeBar />
        <ZoomControls />
        <AnnotationLayer
          enabled={annotationMode}
          onToggle={() => setAnnotationMode(!annotationMode)}
        />
        <FindReplaceBar
          open={findReplaceOpen}
          onClose={() => setFindReplaceOpen(false)}
        />
        {/* Toggle buttons when panels are closed */}
        <div className="absolute right-4 top-4 z-10 flex gap-2">
          {!conditionalFormattingPanelOpen && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 bg-background shadow-md"
              onClick={toggleConditionalFormattingPanel}
              title="Conditional Formatting"
            >
              <Wand2 className="w-4 h-4" />
            </Button>
          )}
          {!commentsPanelOpen && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 bg-background shadow-md"
              onClick={toggleCommentsPanel}
              title="Open Comments Panel"
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
          )}
          {!versionHistoryPanelOpen && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 bg-background shadow-md"
              onClick={toggleVersionHistoryPanel}
              title="Open Version History"
            >
              <History className="w-4 h-4" />
            </Button>
          )}
          {!layersPanelOpen && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 bg-background shadow-md"
              onClick={toggleLayersPanel}
              title="Open Layers Panel"
            >
              <Layers className="w-4 h-4" />
            </Button>
          )}
          {!propertiesPanelOpen && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 bg-background shadow-md"
              onClick={togglePropertiesPanel}
              title="Open Properties Panel"
            >
              <PanelRightOpen className="w-4 h-4" />
            </Button>
          )}
        </div>
        </div>
        <PageTabs diagramId={diagram.id} />
      </div>
      {conditionalFormattingPanelOpen && (
        <ErrorBoundary>
          <ConditionalFormattingPanel />
        </ErrorBoundary>
      )}
      {commentsPanelOpen && (
        <ErrorBoundary>
          <CommentsPanel diagramId={diagram.id} />
        </ErrorBoundary>
      )}
      {versionHistoryPanelOpen && (
        <ErrorBoundary>
          <VersionHistoryPanel diagramId={diagram.id} />
        </ErrorBoundary>
      )}
      {layersPanelOpen && (
        <ErrorBoundary>
          <LayersPanel />
        </ErrorBoundary>
      )}
      {propertiesPanelOpen && (
        <ErrorBoundary>
          <PropertiesPanel />
        </ErrorBoundary>
      )}
    </div>
  )
}
