import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
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
import { PanelRightOpen, Layers, History, MessageSquare, Wand2, Sparkles, CheckCircle2, BarChart3 } from 'lucide-react'
import { useEditorStore } from '@/stores/editorStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { usePreferencesSync, usePreferencesPersist, useCollaboration } from '@/hooks'
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'
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
import { BottomBar } from './BottomBar'
import { ConditionalFormattingPanel } from './ConditionalFormattingPanel'
import { ValidationPanel } from './ValidationPanel'
import { DiagramAnalyticsPanel } from './DiagramAnalyticsPanel'
import { SmartGuides } from './SmartGuides'
import { AnnotationLayer } from './AnnotationLayer'
import { CollaboratorCursors } from './CollaboratorCursors'
import { NodeLockIndicators } from './NodeLockIndicators'
import { AIAssistantPanel } from './AIAssistantPanel'
import { AIFloatingButton } from './AIFloatingButton'
import { AIGenerateDialog } from './AIGenerateDialog'
import { AutoCompleteOverlay } from './AutoCompleteOverlay'
import { GroupBoundary } from './GroupBoundary'
import { ViewportScrollbars } from './ViewportScrollbars'
import { WhiteboardCanvas, WhiteboardToolbar, WhiteboardTextToolbar, AirCanvas } from './whiteboard'
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
  const { screenToFlowPosition, setCenter, setViewport, getViewport, fitView } = useReactFlow()
  const [annotationMode, setAnnotationMode] = useState(false)
  const [showMinimap, setShowMinimap] = useState(false) // Hidden by default like Lucidchart

  // Sync user preferences from localStorage on mount
  usePreferencesSync()
  // Persist preference changes to localStorage
  usePreferencesPersist()

  // Real-time collaboration
  const {
    collaborators,
    updateCursor,
    updateViewport,
    broadcastNodeDrag,
    broadcastNodesDrag,
    nodeLocks,
    acquireLock,
    releaseLock,
    isNodeLocked,
  } = useCollaboration({
    diagramId: diagram.id,
    enabled: true,
  })

  // Keyboard navigation for accessibility
  useKeyboardNavigation({ enabled: true })

  // Track mouse position for collaboration cursors
  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      updateCursor(position.x, position.y)
    },
    [screenToFlowPosition, updateCursor]
  )

  // Clear cursor when mouse leaves the canvas
  const handleMouseLeave = useCallback(() => {
    updateCursor(null, null)
  }, [updateCursor])

  // Broadcast node position changes during drag (for live collaboration)
  const handleNodeDrag = useCallback(
    (_event: React.MouseEvent, node: DiagramNode) => {
      broadcastNodeDrag(node.id, node.position)
    },
    [broadcastNodeDrag]
  )

  // Broadcast multiple node positions during drag
  const handleNodesDrag = useCallback(
    (_event: React.MouseEvent, draggedNodes: DiagramNode[]) => {
      if (draggedNodes.length > 1) {
        broadcastNodesDrag(
          draggedNodes.map((n) => ({ id: n.id, position: n.position }))
        )
      }
    },
    [broadcastNodesDrag]
  )

  // Track which nodes we have locked during this drag session
  const lockedNodesRef = useRef<Set<string>>(new Set())

  // Acquire lock when drag starts
  const handleNodeDragStart = useCallback(
    async (_event: React.MouseEvent, node: DiagramNode) => {
      // Check if node is locked by someone else
      if (isNodeLocked(node.id)) {
        // Node is locked by another user - prevent drag by showing warning
        // The visual indicator will already be showing
        return
      }
      // Try to acquire lock
      const acquired = await acquireLock(node.id)
      if (acquired) {
        lockedNodesRef.current.add(node.id)
      }
    },
    [acquireLock, isNodeLocked]
  )

  // Release locks when drag ends
  const handleNodeDragStop = useCallback(
    async (_event: React.MouseEvent, node: DiagramNode) => {
      if (lockedNodesRef.current.has(node.id)) {
        await releaseLock(node.id)
        lockedNodesRef.current.delete(node.id)
      }
    },
    [releaseLock]
  )

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
  const gridLineWidth = useEditorStore((state) => state.gridLineWidth)
  const zoom = useEditorStore((state) => state.zoom)
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
  const validationPanelOpen = useEditorStore((state) => state.validationPanelOpen)
  const toggleValidationPanel = useEditorStore((state) => state.toggleValidationPanel)
  const analyticsPanelOpen = useEditorStore((state) => state.analyticsPanelOpen)
  const toggleAnalyticsPanel = useEditorStore((state) => state.toggleAnalyticsPanel)
  const commentsPanelOpen = useEditorStore((state) => state.commentsPanelOpen)
  const toggleCommentsPanel = useEditorStore((state) => state.toggleCommentsPanel)
  const findReplaceOpen = useEditorStore((state) => state.findReplaceOpen)
  const setFindReplaceOpen = useEditorStore((state) => state.setFindReplaceOpen)
  const interactionMode = useEditorStore((state) => state.interactionMode)
  const layers = useEditorStore((state) => state.layers)
  const conditionalFormattingPanelOpen = useEditorStore((state) => state.conditionalFormattingPanelOpen)
  const toggleConditionalFormattingPanel = useEditorStore((state) => state.toggleConditionalFormattingPanel)
  const aiPanelOpen = useEditorStore((state) => state.aiPanelOpen)
  const toggleAIPanel = useEditorStore((state) => state.toggleAIPanel)
  const aiDialogOpen = useEditorStore((state) => state.aiDialogOpen)
  const setAIDialogOpen = useEditorStore((state) => state.setAIDialogOpen)
  const drawingMode = useEditorStore((state) => state.drawingMode)

  // Track diagram in recent items
  const addRecentDiagram = usePreferencesStore((state) => state.addRecentDiagram)

  // Calculate zoom-independent grid values
  // At lower zoom levels, increase the gap to keep grid visible
  const gridConfig = useMemo(() => {
    // Minimum zoom threshold below which we compensate
    const minZoom = 0.5
    const zoomFactor = zoom < minZoom ? minZoom / zoom : 1

    // Base line widths scaled by user preference
    const baseMajorWidth = gridLineWidth * 1.0
    const baseMinorWidth = gridLineWidth * 0.6

    return {
      majorGap: gridSize * 5 * zoomFactor,
      minorGap: gridSize * zoomFactor,
      majorLineWidth: Math.max(0.5, baseMajorWidth * zoomFactor),
      minorLineWidth: Math.max(0.3, baseMinorWidth * zoomFactor),
    }
  }, [zoom, gridSize, gridLineWidth])

  // Clear stale content immediately when diagram changes (before paint)
  // This prevents showing previous page content before BottomBar loads the correct page
  const lastDiagramIdRef = useRef<string | null>(null)
  useLayoutEffect(() => {
    if (lastDiagramIdRef.current !== diagram.id) {
      // Clear the canvas immediately to prevent flash of stale content
      useEditorStore.getState().setNodes([])
      useEditorStore.getState().setEdges([])
      useEditorStore.getState().setDrawingStrokes([])
      lastDiagramIdRef.current = diagram.id
    }
  }, [diagram.id])

  // Track diagram in recent items on mount
  // NOTE: Actual diagram loading is handled by BottomBar which manages pages
  useEffect(() => {
    // Track as recently opened
    addRecentDiagram(diagram.id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagram.id])


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
        data: {},
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
        data: {},
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
    <div className="flex-1 flex overflow-hidden pb-8">
      <ErrorBoundary>
        <ShapePanel />
      </ErrorBoundary>
      <div className="flex-1 flex flex-col">
        <div
          ref={reactFlowWrapper}
          className="flex-1 relative overflow-hidden"
          onDoubleClick={onPaneDoubleClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
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
          onNodeDragStart={handleNodeDragStart}
          onNodeDrag={handleNodeDrag}
          onNodeDragStop={handleNodeDragStop}
          onSelectionDrag={handleNodesDrag}
          onMoveEnd={(_, viewport) => {
            setZoom(viewport.zoom)
            updateViewport(viewport.x, viewport.y, viewport.zoom)
          }}
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
          selectionOnDrag={interactionMode === 'select' && !drawingMode}
          panOnDrag={drawingMode ? false : (interactionMode === 'select' ? [1, 2] : true)}
          selectionMode={SelectionMode.Partial}
          // Performance optimizations for large diagrams
          onlyRenderVisibleElements={true}
          elevateEdgesOnSelect={true}
          className="bg-supabase-bg-tertiary"
          data-interaction-mode={interactionMode}
          proOptions={{ hideAttribution: true }}
        >
          {gridEnabled && (
            <>
              <Background
                id="major-grid"
                variant={BackgroundVariant.Lines}
                gap={gridConfig.majorGap}
                lineWidth={gridConfig.majorLineWidth}
                color="var(--grid-color-major, rgba(0, 0, 0, 0.08))"
              />
              <Background
                id="minor-grid"
                variant={BackgroundVariant.Lines}
                gap={gridConfig.minorGap}
                lineWidth={gridConfig.minorLineWidth}
                color="var(--grid-color-minor, rgba(0, 0, 0, 0.04))"
              />
            </>
          )}
          {showMinimap && (
            <MiniMap
              nodeStrokeColor="#3ECF8E"
              nodeColor="#2a2a2a"
              nodeBorderRadius={4}
              onClick={handleMinimapClick}
              maskColor="rgba(28, 28, 28, 0.85)"
              className="bg-supabase-bg-secondary border border-supabase-border rounded-lg !shadow-lg"
              style={{ left: 16, bottom: 40, right: 'auto', width: 140, height: 90 }}
            />
          )}
          <SmartGuides enabled={snapToGrid} />
          <NodeLockIndicators locks={nodeLocks} />
          {/* AI Auto-Complete suggestions overlay */}
          <AutoCompleteOverlay enabled={!drawingMode} />
        </ReactFlow>
        {/* GroupBoundary is outside ReactFlow but uses ReactFlowProvider context */}
        <GroupBoundary nodes={nodes} />
        {/* Scrollbars for when content extends beyond viewport */}
        <ViewportScrollbars nodes={nodes} />
        {/* Whiteboard drawing layer */}
        <WhiteboardCanvas />
        {/* Collaborator cursors - rendered after whiteboard to appear on top */}
        <CollaboratorCursors collaborators={collaborators} />
        <WhiteboardToolbar />
        {/* Floating text formatting toolbar for whiteboard mode */}
        <WhiteboardTextToolbar />
        {/* Air Canvas for gesture-based drawing via webcam */}
        <AirCanvas />
        {/* BottomBar includes page tabs, zoom controls, and minimap toggle */}
        <BottomBar
          diagramId={diagram.id}
          initialNodes={diagram.nodes}
          initialEdges={diagram.edges}
          showMinimap={showMinimap}
          onToggleMinimap={() => setShowMinimap(!showMinimap)}
        />
        <AnnotationLayer
          enabled={annotationMode}
          onToggle={() => setAnnotationMode(!annotationMode)}
        />
        <AIFloatingButton
          onOpenPanel={toggleAIPanel}
          onQuickLayout={() => {
            // Quick layout action using hierarchical layout
            const { nodes: currentNodes, edges: currentEdges } = useEditorStore.getState()
            if (currentNodes.length > 0) {
              import('@/services/aiService').then(({ aiService }) => {
                aiService.autoLayout(currentNodes, currentEdges, 'hierarchical').then(suggestions => {
                  if (suggestions.length > 0) {
                    const updates = suggestions.map(s => ({
                      id: s.nodeId,
                      position: s.suggestedPosition,
                    }))
                    updates.forEach(({ id, position }) => {
                      useEditorStore.getState().updateNodePosition(id, position)
                    })
                  }
                })
              })
            }
          }}
          onQuickSuggest={() => setAIDialogOpen(true)}
        />
        <FindReplaceBar
          open={findReplaceOpen}
          onClose={() => setFindReplaceOpen(false)}
        />
        {/* Toggle buttons when panels are closed */}
        <div className="absolute right-4 top-4 z-10 flex gap-2">
          {!aiPanelOpen && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 shadow-md"
              onClick={toggleAIPanel}
              title="AI Assistant"
            >
              <Sparkles className="w-4 h-4" />
            </Button>
          )}
          {!conditionalFormattingPanelOpen && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 bg-supabase-bg-secondary border-supabase-border text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary shadow-md"
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
              className="h-8 w-8 p-0 bg-supabase-bg-secondary border-supabase-border text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary shadow-md"
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
              className="h-8 w-8 p-0 bg-supabase-bg-secondary border-supabase-border text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary shadow-md"
              onClick={toggleVersionHistoryPanel}
              title="Open Version History"
            >
              <History className="w-4 h-4" />
            </Button>
          )}
          {!validationPanelOpen && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 bg-supabase-bg-secondary border-supabase-border text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary shadow-md"
              onClick={toggleValidationPanel}
              title="Validate Diagram"
            >
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          )}
          {!analyticsPanelOpen && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 bg-supabase-bg-secondary border-supabase-border text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary shadow-md"
              onClick={toggleAnalyticsPanel}
              title="Diagram Analytics"
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
          )}
          {!layersPanelOpen && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 bg-supabase-bg-secondary border-supabase-border text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary shadow-md"
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
              className="h-8 w-8 p-0 bg-supabase-bg-secondary border-supabase-border text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary shadow-md"
              onClick={togglePropertiesPanel}
              title="Open Properties Panel"
            >
              <PanelRightOpen className="w-4 h-4" />
            </Button>
          )}
        </div>
        </div>
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
      {validationPanelOpen && (
        <ErrorBoundary>
          <ValidationPanel onClose={toggleValidationPanel} />
        </ErrorBoundary>
      )}
      {analyticsPanelOpen && (
        <ErrorBoundary>
          <DiagramAnalyticsPanel onClose={toggleAnalyticsPanel} />
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
      {aiPanelOpen && (
        <ErrorBoundary>
          <AIAssistantPanel
            nodes={nodes}
            edges={edges}
            onAddNodes={(newNodes) => {
              const currentNodes = useEditorStore.getState().nodes
              setNodes([...currentNodes, ...newNodes])
            }}
            onAddEdges={(newEdges) => {
              const currentEdges = useEditorStore.getState().edges
              setEdges([...currentEdges, ...newEdges])
            }}
            onUpdateNodePositions={(updates) => {
              updates.forEach(({ id, position }) => {
                useEditorStore.getState().updateNodePosition(id, position)
              })
            }}
            onReplaceAll={(newNodes, newEdges) => {
              setNodes(newNodes)
              setEdges(newEdges)
            }}
            onClose={toggleAIPanel}
            className="w-80 flex-shrink-0 border-l border-supabase-border"
          />
        </ErrorBoundary>
      )}
      <AIGenerateDialog
        open={aiDialogOpen}
        onOpenChange={setAIDialogOpen}
        onGenerated={(newNodes, newEdges) => {
          const currentNodes = useEditorStore.getState().nodes
          const currentEdges = useEditorStore.getState().edges
          if (currentNodes.length === 0) {
            setNodes(newNodes)
            setEdges(newEdges)
          } else {
            // Offset new nodes to not overlap
            const offsetNodes = newNodes.map(n => ({
              ...n,
              position: {
                x: n.position.x + 400,
                y: n.position.y,
              },
            }))
            setNodes([...currentNodes, ...offsetNodes])
            setEdges([...currentEdges, ...newEdges])
          }
        }}
      />
    </div>
  )
}
