import { useCallback, useMemo } from 'react'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuShortcut,
  ContextMenuLabel,
} from '@/components/ui/context-menu'
import { useEditorStore } from '@/stores/editorStore'
import type { ShapeType } from '@/types'
import {
  smartContextService,
  type SmartSuggestion,
} from '@/services/smartContextService'
import { MarkerType, type Edge } from '@xyflow/react'
import { nanoid } from 'nanoid'
import {
  Copy,
  Clipboard,
  Trash2,
  CopyPlus,
  Lock,
  Unlock,
  ChevronsUp,
  ChevronUp,
  ChevronDown,
  ChevronsDown,
  Group,
  Ungroup,
  Layers,
  FlipHorizontal,
  FlipVertical,
  RotateCcw,
  Shapes,
  Square,
  Hexagon,
  ArrowRight,
  ArrowLeft,
  GitBranchPlus,
  GitBranch,
  Cloud,
  AlignLeft,
  AlignCenterHorizontal,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  Columns,
  Rows,
  Link,
  Sparkles,
} from 'lucide-react'

// Quick morph shape options organized by category
const MORPH_SHAPES: { label: string; icon: React.ElementType; shapes: { type: ShapeType; label: string }[] }[] = [
  {
    label: 'Basic',
    icon: Square,
    shapes: [
      { type: 'rectangle', label: 'Rectangle' },
      { type: 'rounded-rectangle', label: 'Rounded Rectangle' },
      { type: 'circle', label: 'Circle' },
      { type: 'ellipse', label: 'Ellipse' },
      { type: 'diamond', label: 'Diamond' },
      { type: 'triangle', label: 'Triangle' },
    ],
  },
  {
    label: 'Flowchart',
    icon: Hexagon,
    shapes: [
      { type: 'process', label: 'Process' },
      { type: 'decision', label: 'Decision' },
      { type: 'terminator', label: 'Terminator' },
      { type: 'data', label: 'Data' },
      { type: 'document', label: 'Document' },
      { type: 'database', label: 'Database' },
    ],
  },
  {
    label: 'Arrows',
    icon: ArrowRight,
    shapes: [
      { type: 'arrow', label: 'Arrow' },
      { type: 'double-arrow', label: 'Double Arrow' },
      { type: 'callout', label: 'Callout' },
    ],
  },
  {
    label: 'Shapes',
    icon: Shapes,
    shapes: [
      { type: 'pentagon', label: 'Pentagon' },
      { type: 'hexagon', label: 'Hexagon' },
      { type: 'octagon', label: 'Octagon' },
      { type: 'star', label: 'Star' },
      { type: 'cloud', label: 'Cloud' },
      { type: 'cylinder', label: 'Cylinder' },
    ],
  },
]

// Icon mapping for smart suggestions
const SUGGESTION_ICONS: Record<string, React.ElementType> = {
  GitBranchPlus,
  GitBranch,
  ArrowRight,
  ArrowLeft,
  Cloud,
  AlignLeft,
  AlignCenterHorizontal,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  Columns,
  Rows,
  Link,
  Group,
}

interface NodeContextMenuProps {
  children: React.ReactNode
  nodeId: string
  isLocked?: boolean
  isGrouped?: boolean
}

export function NodeContextMenu({ children, nodeId, isLocked, isGrouped }: NodeContextMenuProps) {
  const copyNodes = useEditorStore((state) => state.copyNodes)
  const pasteNodes = useEditorStore((state) => state.pasteNodes)
  const deleteSelected = useEditorStore((state) => state.deleteSelected)
  const selectNodes = useEditorStore((state) => state.selectNodes)
  const toggleLockNodes = useEditorStore((state) => state.toggleLockNodes)
  const groupNodes = useEditorStore((state) => state.groupNodes)
  const ungroupNodes = useEditorStore((state) => state.ungroupNodes)
  const updateNodeStyle = useEditorStore((state) => state.updateNodeStyle)
  const bringToFront = useEditorStore((state) => state.bringToFront)
  const bringForward = useEditorStore((state) => state.bringForward)
  const sendBackward = useEditorStore((state) => state.sendBackward)
  const sendToBack = useEditorStore((state) => state.sendToBack)
  const morphShape = useEditorStore((state) => state.morphShape)
  const addNode = useEditorStore((state) => state.addNode)
  const alignNodes = useEditorStore((state) => state.alignNodes)
  const distributeNodes = useEditorStore((state) => state.distributeNodes)
  const nodes = useEditorStore((state) => state.nodes)
  const edges = useEditorStore((state) => state.edges)
  const selectedNodes = useEditorStore((state) => state.selectedNodes)

  // Get current node type to show current selection
  const currentNode = nodes.find((n) => n.id === nodeId)
  const currentType = currentNode?.data.type

  // Get smart suggestions based on selection
  const smartSuggestions = useMemo(() => {
    // Get all selected nodes
    const selectedNodeObjects = nodes.filter(n => selectedNodes.includes(n.id))

    // If multiple nodes are selected, show multi-node suggestions
    if (selectedNodeObjects.length > 1) {
      return smartContextService.getMultiNodeSuggestions(selectedNodeObjects)
    }

    // If single node, show single-node suggestions
    if (currentNode) {
      return smartContextService.getSingleNodeSuggestions(currentNode)
    }

    return []
  }, [currentNode, nodes, selectedNodes])

  // Handle smart suggestion execution
  const handleSmartSuggestion = useCallback((suggestion: SmartSuggestion) => {
    if (!currentNode) return

    switch (suggestion.action) {
      case 'add-node':
      case 'add-branch': {
        const position = suggestion.data?.position || 'right'
        const nodeType = suggestion.data?.nodeType || 'process'
        const newPosition = smartContextService.calculateNewNodePosition(currentNode, position)
        const handles = smartContextService.getHandlesForPosition(position)

        // Create the new node
        addNode(nodeType, newPosition)

        // Get the newly created node (it will be the last one added)
        const newNodes = useEditorStore.getState().nodes
        const newNode = newNodes[newNodes.length - 1]

        if (newNode) {
          // Create the edge connection
          const newEdge = {
            id: nanoid(),
            source: currentNode.id,
            target: newNode.id,
            sourceHandle: handles.sourceHandle,
            targetHandle: handles.targetHandle,
            type: 'labeled',
            data: suggestion.data?.edgeLabel ? { label: suggestion.data.edgeLabel } : undefined,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 8,
              height: 8,
              color: '#64748b',
            },
            style: {
              strokeWidth: 1.5,
              stroke: '#64748b',
            },
          }

          useEditorStore.getState().pushHistory()
          useEditorStore.setState((state) => ({
            edges: [...state.edges, newEdge],
            isDirty: true,
          }))
        }
        break
      }

      case 'align': {
        const alignType = suggestion.data?.alignType
        if (alignType) {
          alignNodes(alignType)
        }
        break
      }

      case 'distribute': {
        const distributeType = suggestion.data?.distributeType
        if (distributeType) {
          distributeNodes(distributeType)
        }
        break
      }

      case 'connect-sequence': {
        // Get selected nodes sorted by x position (left to right)
        const selectedNodeObjects = nodes
          .filter(n => selectedNodes.includes(n.id))
          .sort((a, b) => a.position.x - b.position.x)

        if (selectedNodeObjects.length < 2) return

        useEditorStore.getState().pushHistory()

        // Create edges between consecutive nodes
        const newEdges: Edge[] = []
        for (let i = 0; i < selectedNodeObjects.length - 1; i++) {
          const sourceNode = selectedNodeObjects[i]
          const targetNode = selectedNodeObjects[i + 1]

          if (!sourceNode || !targetNode) continue

          // Check if edge already exists
          const edgeExists = edges.some(
            e => (e.source === sourceNode.id && e.target === targetNode.id)
          )

          if (!edgeExists) {
            newEdges.push({
              id: nanoid(),
              source: sourceNode.id,
              target: targetNode.id,
              sourceHandle: 'right',
              targetHandle: 'left',
              type: 'labeled',
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 8,
                height: 8,
                color: '#64748b',
              },
              style: {
                strokeWidth: 1.5,
                stroke: '#64748b',
              },
            })
          }
        }

        if (newEdges.length > 0) {
          useEditorStore.setState((state) => ({
            edges: [...state.edges, ...newEdges],
            isDirty: true,
          }))
        }
        break
      }

      case 'group': {
        groupNodes()
        break
      }
    }
  }, [currentNode, nodes, edges, selectedNodes, addNode, alignNodes, distributeNodes, groupNodes])

  // Ensure this node is selected before performing actions
  const ensureSelected = useCallback(() => {
    const selectedNodes = useEditorStore.getState().selectedNodes
    if (!selectedNodes.includes(nodeId)) {
      selectNodes([nodeId])
    }
  }, [nodeId, selectNodes])

  const handleCut = useCallback(() => {
    ensureSelected()
    copyNodes()
    deleteSelected()
  }, [ensureSelected, copyNodes, deleteSelected])

  const handleCopy = useCallback(() => {
    ensureSelected()
    copyNodes()
  }, [ensureSelected, copyNodes])

  const handlePaste = useCallback(() => {
    pasteNodes()
  }, [pasteNodes])

  const handleDuplicate = useCallback(() => {
    ensureSelected()
    copyNodes()
    pasteNodes()
  }, [ensureSelected, copyNodes, pasteNodes])

  const handleDelete = useCallback(() => {
    ensureSelected()
    deleteSelected()
  }, [ensureSelected, deleteSelected])

  const handleLock = useCallback(() => {
    ensureSelected()
    toggleLockNodes()
  }, [ensureSelected, toggleLockNodes])

  const handleGroup = useCallback(() => {
    ensureSelected()
    groupNodes()
  }, [ensureSelected, groupNodes])

  const handleUngroup = useCallback(() => {
    ensureSelected()
    ungroupNodes()
  }, [ensureSelected, ungroupNodes])

  // Layer order functions
  const handleBringToFront = useCallback(() => {
    bringToFront([nodeId])
  }, [nodeId, bringToFront])

  const handleBringForward = useCallback(() => {
    bringForward([nodeId])
  }, [nodeId, bringForward])

  const handleSendBackward = useCallback(() => {
    sendBackward([nodeId])
  }, [nodeId, sendBackward])

  const handleSendToBack = useCallback(() => {
    sendToBack([nodeId])
  }, [nodeId, sendToBack])

  // Flip functions
  const handleFlipHorizontal = useCallback(() => {
    const node = useEditorStore.getState().nodes.find(n => n.id === nodeId)
    if (!node) return
    const currentScaleX = node.data.style?.scaleX ?? 1
    updateNodeStyle(nodeId, { scaleX: currentScaleX * -1 })
  }, [nodeId, updateNodeStyle])

  const handleFlipVertical = useCallback(() => {
    const node = useEditorStore.getState().nodes.find(n => n.id === nodeId)
    if (!node) return
    const currentScaleY = node.data.style?.scaleY ?? 1
    updateNodeStyle(nodeId, { scaleY: currentScaleY * -1 })
  }, [nodeId, updateNodeStyle])

  const handleResetRotation = useCallback(() => {
    updateNodeStyle(nodeId, { rotation: 0 })
  }, [nodeId, updateNodeStyle])

  // Shape morphing
  const handleMorphShape = useCallback((newType: ShapeType) => {
    morphShape(nodeId, newType)
  }, [nodeId, morphShape])

  // Check if current shape type can be morphed (not junction, custom-shape, or web-image)
  const canMorph = currentType &&
    currentType !== 'junction' &&
    currentType !== 'custom-shape' &&
    currentType !== 'web-image'

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div style={{ width: '100%', height: '100%' }}>
          {children}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        {/* Smart Suggestions */}
        {smartSuggestions.length > 0 && (
          <>
            <ContextMenuLabel className="flex items-center gap-2 text-xs text-primary font-medium">
              <Sparkles className="w-3 h-3" />
              Smart Actions
            </ContextMenuLabel>
            {smartSuggestions.slice(0, 4).map((suggestion) => {
              const IconComponent = SUGGESTION_ICONS[suggestion.icon] || ArrowRight
              return (
                <ContextMenuItem
                  key={suggestion.id}
                  onClick={() => handleSmartSuggestion(suggestion)}
                >
                  <IconComponent className="w-4 h-4 mr-2 text-primary" />
                  <span className="flex-1">{suggestion.label}</span>
                </ContextMenuItem>
              )
            })}
            {smartSuggestions.length > 4 && (
              <ContextMenuSub>
                <ContextMenuSubTrigger>
                  <Sparkles className="w-4 h-4 mr-2 text-primary" />
                  More Actions ({smartSuggestions.length - 4})
                </ContextMenuSubTrigger>
                <ContextMenuSubContent className="w-56">
                  {smartSuggestions.slice(4).map((suggestion) => {
                    const IconComponent = SUGGESTION_ICONS[suggestion.icon] || ArrowRight
                    return (
                      <ContextMenuItem
                        key={suggestion.id}
                        onClick={() => handleSmartSuggestion(suggestion)}
                      >
                        <IconComponent className="w-4 h-4 mr-2 text-primary" />
                        <span className="flex-1">{suggestion.label}</span>
                      </ContextMenuItem>
                    )
                  })}
                </ContextMenuSubContent>
              </ContextMenuSub>
            )}
            <ContextMenuSeparator />
          </>
        )}

        {/* Edit Actions */}
        <ContextMenuItem onClick={handleCut}>
          <Copy className="w-4 h-4 mr-2" />
          Cut
          <ContextMenuShortcut>Ctrl+X</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={handleCopy}>
          <Copy className="w-4 h-4 mr-2" />
          Copy
          <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={handlePaste}>
          <Clipboard className="w-4 h-4 mr-2" />
          Paste
          <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDuplicate}>
          <CopyPlus className="w-4 h-4 mr-2" />
          Duplicate
          <ContextMenuShortcut>Ctrl+D</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Layer Order */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Layers className="w-4 h-4 mr-2" />
            Order
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem onClick={handleBringToFront}>
              <ChevronsUp className="w-4 h-4 mr-2" />
              Bring to Front
            </ContextMenuItem>
            <ContextMenuItem onClick={handleBringForward}>
              <ChevronUp className="w-4 h-4 mr-2" />
              Bring Forward
            </ContextMenuItem>
            <ContextMenuItem onClick={handleSendBackward}>
              <ChevronDown className="w-4 h-4 mr-2" />
              Send Backward
            </ContextMenuItem>
            <ContextMenuItem onClick={handleSendToBack}>
              <ChevronsDown className="w-4 h-4 mr-2" />
              Send to Back
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Transform */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <FlipHorizontal className="w-4 h-4 mr-2" />
            Transform
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem onClick={handleFlipHorizontal}>
              <FlipHorizontal className="w-4 h-4 mr-2" />
              Flip Horizontal
            </ContextMenuItem>
            <ContextMenuItem onClick={handleFlipVertical}>
              <FlipVertical className="w-4 h-4 mr-2" />
              Flip Vertical
            </ContextMenuItem>
            <ContextMenuItem onClick={handleResetRotation}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Rotation
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Change Shape (morph) */}
        {canMorph && (
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Shapes className="w-4 h-4 mr-2" />
              Change Shape
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              {MORPH_SHAPES.map((category) => (
                <ContextMenuSub key={category.label}>
                  <ContextMenuSubTrigger>
                    <category.icon className="w-4 h-4 mr-2" />
                    {category.label}
                  </ContextMenuSubTrigger>
                  <ContextMenuSubContent className="w-44">
                    {category.shapes.map((shape) => (
                      <ContextMenuItem
                        key={shape.type}
                        onClick={() => handleMorphShape(shape.type)}
                        disabled={currentType === shape.type}
                      >
                        {shape.label}
                        {currentType === shape.type && (
                          <span className="ml-auto text-xs text-muted-foreground">(current)</span>
                        )}
                      </ContextMenuItem>
                    ))}
                  </ContextMenuSubContent>
                </ContextMenuSub>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}

        <ContextMenuSeparator />

        {/* Group/Ungroup */}
        {isGrouped ? (
          <ContextMenuItem onClick={handleUngroup}>
            <Ungroup className="w-4 h-4 mr-2" />
            Ungroup
            <ContextMenuShortcut>Ctrl+Shift+G</ContextMenuShortcut>
          </ContextMenuItem>
        ) : (
          <ContextMenuItem onClick={handleGroup}>
            <Group className="w-4 h-4 mr-2" />
            Group
            <ContextMenuShortcut>Ctrl+G</ContextMenuShortcut>
          </ContextMenuItem>
        )}

        {/* Lock/Unlock */}
        <ContextMenuItem onClick={handleLock}>
          {isLocked ? (
            <>
              <Unlock className="w-4 h-4 mr-2" />
              Unlock
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Lock
            </>
          )}
          <ContextMenuShortcut>Ctrl+L</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Delete */}
        <ContextMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
          <ContextMenuShortcut>Del</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
