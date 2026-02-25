# Diagramming Patterns for Diagmo Pro

## React Flow Basics

### Node Types
```typescript
// All nodes use CustomNode with type in data
const node: DiagramNode = {
  id: nanoid(),
  type: 'custom',  // Always 'custom'
  position: { x: 100, y: 100 },
  data: {
    label: 'My Node',
    type: 'rectangle',  // Actual shape type here
    style: {
      backgroundColor: '#ffffff',
      borderColor: '#6b7280',
      borderWidth: 2,
    },
  },
  width: 150,
  height: 80,
}
```

### Edge Types
```typescript
const edge: DiagramEdge = {
  id: nanoid(),
  source: 'node1',
  target: 'node2',
  sourceHandle: 'right',   // Important for correct routing
  targetHandle: 'left',
  type: 'smoothstep',      // or 'straight', 'bezier'
  data: {
    label: 'connects to',
    style: {
      strokeColor: '#6b7280',
      strokeWidth: 2,
    },
  },
}
```

### Handle Positions
```
         top
          ↓
    ┌─────────────┐
left → │    Node    │ ← right
    └─────────────┘
          ↑
        bottom
```

## Shape Categories

### Basic Shapes
- `rectangle` - Standard rectangle
- `rounded-rectangle` - Rounded corners
- `circle` - Perfect circle
- `ellipse` - Oval shape
- `diamond` - Decision shape
- `triangle` - Pointed shape

### Flowchart Shapes
- `process` - Rectangle (same as process box)
- `decision` - Diamond for yes/no
- `terminator` - Rounded ends (start/end)
- `data` - Parallelogram (I/O)
- `document` - Wavy bottom (document)
- `database` - Cylinder shape

### Cloud Icons
- `aws-*` - AWS service icons
- `azure-*` - Azure service icons
- `gcp-*` - GCP service icons
- `office-*` - Office 365 icons

## Canvas Operations

### Adding Nodes
```typescript
const addNode = useEditorStore((s) => s.addNode)

// From shape panel drag
addNode('aws-ec2', { x: event.clientX, y: event.clientY })

// Programmatically
addNode('rectangle', { x: 100, y: 100 }, {
  label: 'Custom Label',
  style: { backgroundColor: '#ff0000' }
})
```

### Connecting Nodes
```typescript
// React Flow onConnect callback
const onConnect = useCallback((connection: Connection) => {
  const edge: DiagramEdge = {
    id: nanoid(),
    source: connection.source,
    target: connection.target,
    sourceHandle: connection.sourceHandle,
    targetHandle: connection.targetHandle,
    type: 'smoothstep',
  }
  addEdge(edge)
}, [addEdge])
```

### Selection
```typescript
const selectNodes = useEditorStore((s) => s.selectNodes)
const selectedNodes = useEditorStore((s) => s.selectedNodes)

// Select multiple
selectNodes(['node1', 'node2', 'node3'])

// Clear selection
selectNodes([])
```

### Alignment
```typescript
const alignNodes = useEditorStore((s) => s.alignNodes)

// Align selected nodes
alignNodes('left')   // Align to leftmost
alignNodes('center') // Align to center
alignNodes('right')  // Align to rightmost
alignNodes('top')    // Align to topmost
alignNodes('middle') // Align to middle
alignNodes('bottom') // Align to bottommost
```

### Distribution
```typescript
const distributeNodes = useEditorStore((s) => s.distributeNodes)

// Distribute selected nodes (needs 3+)
distributeNodes('horizontal')  // Even horizontal spacing
distributeNodes('vertical')    // Even vertical spacing
```

## Grouping

### Creating Groups
```typescript
const groupNodes = useEditorStore((s) => s.groupNodes)

// Select nodes first, then group
selectNodes(['node1', 'node2'])
groupNodes()  // Creates group containing selected
```

### Group Structure
```typescript
// Group is a special node
const groupNode: DiagramNode = {
  id: 'group-1',
  type: 'custom',
  position: { x: 50, y: 50 },
  data: {
    type: 'group',
    isGroup: true,
    style: {
      borderStyle: 'dashed',
      backgroundColor: 'rgba(62, 207, 142, 0.1)',
    },
  },
  style: { zIndex: -1 },  // Behind children
}

// Child nodes reference parent
const childNode: DiagramNode = {
  // ...
  parentId: 'group-1',
  extent: 'parent',  // Keep within bounds
}
```

## Export

### Getting Export Element
```typescript
// The viewport element for export
const viewport = document.querySelector('.react-flow__viewport')

// Get bounds of all nodes
const bounds = getNodesBounds(nodes)
```

### Export Transform
```typescript
// Calculate transform to fit all nodes
const transform = getViewportForBounds(
  bounds,
  width,
  height,
  minZoom,
  maxZoom,
  padding
)

// Apply to viewport temporarily
viewport.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`
```

## Templates

### Template Structure
```typescript
const template: DiagramTemplate = {
  id: 'aws-3-tier',
  name: 'AWS 3-Tier Architecture',
  description: 'Web app with load balancer, EC2, RDS',
  category: 'architecture',
  nodes: [
    // Pre-positioned nodes with proper handles
  ],
  edges: [
    // Edges with sourceHandle/targetHandle
    {
      id: 'e1',
      source: 'node1',
      target: 'node2',
      sourceHandle: 'right',
      targetHandle: 'left',
    },
  ],
}
```

### Loading Templates
```typescript
// Apply template to editor
const loadDiagram = useEditorStore((s) => s.loadDiagram)

loadDiagram({
  nodes: template.nodes,
  edges: template.edges,
})
```
