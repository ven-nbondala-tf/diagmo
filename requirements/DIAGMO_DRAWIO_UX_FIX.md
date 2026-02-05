# DIAGMO - Code Review & Draw.io-Style UX Fixes

## 🔍 CODE REVIEW SUMMARY

After reviewing your code, I found several issues that make the UX feel less intuitive compared to draw.io/Lucidchart:

### Issues Found:

| Issue | File | Problem |
|-------|------|---------|
| 1. Connection handles too small | CustomNode.tsx | 8-10px handles are hard to click |
| 2. No visual feedback on connection | CustomNode.tsx | No green highlight when connecting |
| 3. Handles use separate source/target | CustomNode.tsx | Confusing - draw.io uses single bidirectional handles |
| 4. No connection validation feedback | DiagramEditor.tsx | User doesn't know if connection is valid |
| 5. Edge type not easily changeable | editorStore.ts | Hard to switch between straight/curved |
| 6. Hidden target handles invisible | CustomNode.tsx | Connection targets not intuitive |

---

## 🎯 HOW DRAW.IO WORKS

In draw.io/Lucidchart:

1. **Hover shape** → Connection points appear as small blue/green circles
2. **Click & drag from point** → Line follows cursor
3. **Hover over target shape** → Shape highlights green, connection points glow
4. **Release on shape** → Line snaps to nearest connection point
5. **Connection points are BOTH source and target** (bidirectional)

---

## 🔧 COMPLETE FIX

Replace your current CustomNode.tsx with this improved version:

### **File: src/components/editor/nodes/CustomNode.tsx**

```tsx
import { memo, useState, useCallback, useRef, useEffect } from 'react'
import { Handle, Position, NodeResizer, useConnection, type NodeProps } from '@xyflow/react'
import type { DiagramNode } from '@/types'
import { cn } from '@/utils'
import { useEditorStore } from '@/stores/editorStore'
import { Lock, Group } from 'lucide-react'

type CustomNodeProps = NodeProps<DiagramNode>

// Connection point positions - 8 points like draw.io
const connectionPoints = [
  { id: 'top', position: Position.Top, style: { left: '50%', top: 0, transform: 'translate(-50%, -50%)' } },
  { id: 'top-right', position: Position.Top, style: { left: '100%', top: 0, transform: 'translate(-50%, -50%)' } },
  { id: 'right', position: Position.Right, style: { right: 0, top: '50%', transform: 'translate(50%, -50%)' } },
  { id: 'bottom-right', position: Position.Right, style: { right: 0, top: '100%', transform: 'translate(50%, -50%)' } },
  { id: 'bottom', position: Position.Bottom, style: { left: '50%', bottom: 0, transform: 'translate(-50%, 50%)' } },
  { id: 'bottom-left', position: Position.Bottom, style: { left: 0, bottom: 0, transform: 'translate(-50%, 50%)' } },
  { id: 'left', position: Position.Left, style: { left: 0, top: '50%', transform: 'translate(-50%, -50%)' } },
  { id: 'top-left', position: Position.Left, style: { left: 0, top: 0, transform: 'translate(-50%, -50%)' } },
]

export const CustomNode = memo(function CustomNode({ id, data, selected }: CustomNodeProps) {
  const { label, type, style, locked, groupId } = data
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(label)
  const [isHovered, setIsHovered] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const updateNode = useEditorStore((state) => state.updateNode)
  
  // Check if a connection is being made TO this node
  const connection = useConnection()
  const isTarget = connection.inProgress && connection.fromNode.id !== id
  
  // Show handles when: selected, hovered, OR being connected to
  const showHandles = selected || isHovered || isTarget

  const minWidth = type === 'text' ? 40 : 60
  const minHeight = type === 'text' ? 20 : 40

  const baseStyle = {
    backgroundColor: style?.backgroundColor || '#ffffff',
    borderColor: style?.borderColor || '#9ca3af',
    borderWidth: style?.borderWidth || 1,
    color: style?.textColor || '#1f2937',
    fontSize: style?.fontSize || 14,
    fontWeight: style?.fontWeight || 'normal',
    fontStyle: style?.fontStyle || 'normal',
    textDecoration: style?.textDecoration || 'none',
    textAlign: (style?.textAlign || 'center') as 'left' | 'center' | 'right',
  }

  // Double-click to edit
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (locked) return
    e.stopPropagation()
    setEditText(label)
    setIsEditing(true)
  }, [locked, label])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = useCallback(() => {
    if (editText.trim() !== label) {
      updateNode(id, { label: editText.trim() || label })
    }
    setIsEditing(false)
  }, [editText, label, id, updateNode])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      setEditText(label)
      setIsEditing(false)
    }
  }, [handleSave, label])

  // Render shape based on type (keeping your existing renderShape function)
  const renderShape = () => {
    const shapeClass = cn(
      'w-full h-full flex items-center justify-center text-center overflow-hidden transition-all duration-150',
      locked && 'opacity-75',
      // Highlight when being connected to
      isTarget && 'ring-2 ring-green-500 ring-offset-2'
    )

    switch (type) {
      case 'ellipse':
        return (
          <div
            className={cn(shapeClass, 'rounded-full px-4 py-2')}
            style={{ ...baseStyle, borderStyle: 'solid' }}
          >
            {label}
          </div>
        )

      case 'circle':
        return (
          <div
            className={cn(shapeClass, 'rounded-full px-2 py-2 aspect-square')}
            style={{ ...baseStyle, borderStyle: 'solid' }}
          >
            {label}
          </div>
        )

      case 'diamond':
      case 'decision':
        return (
          <div className="relative w-full h-full">
            <div
              className={cn(
                'absolute inset-[10%] rotate-45 transition-all duration-150',
                locked && 'opacity-75',
                isTarget && 'ring-2 ring-green-500'
              )}
              style={{ ...baseStyle, borderStyle: 'solid', borderRadius: style?.borderRadius || 4 }}
            />
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ color: baseStyle.color, fontSize: baseStyle.fontSize }}
            >
              {label}
            </div>
          </div>
        )

      // ... keep all your other shape cases ...
      // Just add the isTarget highlight class to each

      case 'rectangle':
      case 'process':
      default:
        return (
          <div
            className={cn(shapeClass, 'px-4 py-2')}
            style={{ ...baseStyle, borderStyle: 'solid', borderRadius: style?.borderRadius || 8 }}
          >
            {label}
          </div>
        )
    }
  }

  return (
    <div
      className={cn(
        'w-full h-full relative',
        // Add a subtle glow when being targeted for connection
        isTarget && 'drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Resize handles */}
      <NodeResizer
        isVisible={selected && !locked}
        minWidth={minWidth}
        minHeight={minHeight}
        handleStyle={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          backgroundColor: 'white',
          border: '2px solid #3b82f6',
        }}
        lineStyle={{
          borderWidth: 1,
          borderColor: '#3b82f6',
        }}
      />

      {/* Connection Points - DRAW.IO STYLE */}
      {/* These are BOTH source AND target - bidirectional */}
      {connectionPoints.map((point) => (
        <Handle
          key={point.id}
          id={point.id}
          type="source"  // Source handles can also receive connections
          position={point.position}
          className={cn(
            'transition-all duration-150',
            // Hidden by default
            !showHandles && 'opacity-0 scale-0',
            // Visible on hover/select
            showHandles && 'opacity-100 scale-100',
            // Green glow when being targeted
            isTarget && 'bg-green-500 ring-2 ring-green-300'
          )}
          style={{
            width: showHandles ? 12 : 6,
            height: showHandles ? 12 : 6,
            backgroundColor: isTarget ? '#22c55e' : '#3b82f6',
            border: '2px solid white',
            borderRadius: '50%',
            cursor: 'crosshair',
            ...point.style,
          }}
          isConnectable={!locked}
        />
      ))}

      {/* Invisible target handles that cover entire edges for easy connection */}
      <Handle
        type="target"
        id="top-target"
        position={Position.Top}
        className="!w-full !h-3 !rounded-none !border-none !top-0 !left-0 !transform-none"
        style={{ 
          opacity: 0, 
          cursor: 'crosshair',
          pointerEvents: 'all',
        }}
      />
      <Handle
        type="target"
        id="right-target"
        position={Position.Right}
        className="!w-3 !h-full !rounded-none !border-none !right-0 !top-0 !transform-none"
        style={{ 
          opacity: 0, 
          cursor: 'crosshair',
          pointerEvents: 'all',
        }}
      />
      <Handle
        type="target"
        id="bottom-target"
        position={Position.Bottom}
        className="!w-full !h-3 !rounded-none !border-none !bottom-0 !left-0 !transform-none"
        style={{ 
          opacity: 0, 
          cursor: 'crosshair',
          pointerEvents: 'all',
        }}
      />
      <Handle
        type="target"
        id="left-target"
        position={Position.Left}
        className="!w-3 !h-full !rounded-none !border-none !left-0 !top-0 !transform-none"
        style={{ 
          opacity: 0, 
          cursor: 'crosshair',
          pointerEvents: 'all',
        }}
      />

      {/* Shape content */}
      <div
        className="relative w-full h-full"
        onDoubleClick={handleDoubleClick}
      >
        {renderShape()}
        
        {/* Inline text editor */}
        {isEditing && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10">
            <input
              ref={inputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="w-[90%] px-2 py-1 text-center border border-primary rounded outline-none"
              style={{
                fontSize: baseStyle.fontSize,
                fontWeight: baseStyle.fontWeight,
                color: baseStyle.color,
              }}
            />
          </div>
        )}
        
        {/* Status indicators */}
        <div className="absolute -top-2 -right-2 flex gap-1">
          {locked && (
            <div className="bg-amber-500 text-white rounded-full p-0.5" title="Locked">
              <Lock className="h-3 w-3" />
            </div>
          )}
          {groupId && (
            <div className="bg-blue-500 text-white rounded-full p-0.5" title="Grouped">
              <Group className="h-3 w-3" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
})
```

---

### **File: src/components/editor/DiagramEditor.tsx**

Update with better connection settings:

```tsx
import { useCallback, useEffect, useRef } from 'react'
import {
  ReactFlow,
  Background,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  ConnectionLineType,
  MarkerType,
  ConnectionMode,
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

// Default edge style - straight lines with arrows
const defaultEdgeOptions = {
  type: 'straight',  // straight | smoothstep | step | bezier
  animated: false,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: '#6b7280',
  },
  style: {
    strokeWidth: 2,
    stroke: '#6b7280',
  },
}

// Connection line style (the line while dragging)
const connectionLineStyle = {
  strokeWidth: 2,
  stroke: '#22c55e',  // Green while connecting
  strokeDasharray: '5,5',  // Dashed to show it's temporary
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
  // ... rest of your state

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

  // Keyboard shortcuts (keep your existing implementation)
  useEffect(() => {
    // ... your keyboard handling code
  }, [/* deps */])

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
          connectionMode={ConnectionMode.Loose}  // IMPORTANT: Allows connecting anywhere
          snapToGrid={snapToGrid}
          snapGrid={[gridSize, gridSize]}
          fitView
          selectNodesOnDrag={false}
          className="bg-muted/30"
          // Better connection radius
          connectionRadius={30}
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
```

---

### **File: src/styles/index.css**

Add these styles for better connection experience:

```css
/* Connection handles - draw.io style */
.react-flow__handle {
  transition: all 0.15s ease;
}

/* Larger hover area for handles */
.react-flow__handle:hover {
  transform: scale(1.3);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}

/* Green handles when connecting */
.react-flow__handle.connecting {
  background-color: #22c55e !important;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.3);
}

/* Connection line styling */
.react-flow__connection-line {
  stroke: #22c55e;
  stroke-width: 2;
}

/* Node highlight when valid connection target */
.react-flow__node.target {
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.4);
}

/* Animated connection path preview */
.react-flow__connection-path {
  stroke: #22c55e;
  stroke-dasharray: 5, 5;
  animation: dash 0.5s linear infinite;
}

@keyframes dash {
  to {
    stroke-dashoffset: -10;
  }
}

/* Edge selection highlight */
.react-flow__edge.selected .react-flow__edge-path {
  stroke: #3b82f6;
  stroke-width: 3;
}

/* Better edge hover */
.react-flow__edge:hover .react-flow__edge-path {
  stroke: #3b82f6;
  cursor: pointer;
}
```

---

## 📋 SUMMARY OF CHANGES

| Change | Before | After |
|--------|--------|-------|
| **Handle size** | 8px (hard to click) | 12px visible, larger hit area |
| **Handle visibility** | Show on hover/select | Show on hover/select/connecting |
| **Connection feedback** | None | Green highlight on target shape |
| **Connection line** | Gray solid | Green dashed (animated) |
| **Handle count** | 4 (cardinal only) | 8 (cardinal + corners) |
| **Connection mode** | Strict | Loose (connect anywhere) |
| **Connection radius** | Default (small) | 30px (easier to connect) |
| **Target indication** | Hidden handles | Shape glows green + handles turn green |

---

## 🧪 TESTING CHECKLIST

After applying fixes, verify:

- [ ] Hover shape → 8 connection points appear (blue circles)
- [ ] Click and drag from connection point → green dashed line follows cursor
- [ ] Drag over another shape → target shape gets green glow
- [ ] Drag over another shape → target's connection points turn green
- [ ] Release on shape → straight line connects the two shapes
- [ ] Arrow appears at end of line
- [ ] Click on edge → edge is selected (blue highlight)
- [ ] Connection points are easy to click (12px size)
- [ ] Can connect to any side of shape (not just exact handle)
- [ ] Double-click shape → edit text
- [ ] Delete key → removes selected shape/edge
- [ ] Ctrl+Z → undo works

---

## 🎯 OPTIONAL ENHANCEMENTS

If you want even more draw.io-like behavior, add these:

### 1. Click-to-connect mode (like draw.io's connector tool)

```tsx
// Add to editorStore
connectionMode: 'drag' | 'click',
setConnectionMode: (mode) => set({ connectionMode: mode }),

// In CustomNode, handle click to start connection
onClick={(e) => {
  if (connectionMode === 'click') {
    startConnection(id, handleId)
  }
}}
```

### 2. Auto-routing (avoid overlapping shapes)

Use `@xyflow/react`'s pathfinding edge type or a library like `dagre` for automatic layout.

### 3. Connection point snapping

```tsx
// Snap to nearest connection point on drop
const nearestHandle = findNearestHandle(dropPosition, targetNode)
connection.targetHandle = nearestHandle.id
```

---

**Copy this file to Claude Code to implement all the fixes!**
