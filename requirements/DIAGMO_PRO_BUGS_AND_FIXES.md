# Diagmo Pro — Bug Report & Fixes Document

> **Version:** 7.0  
> **Date:** February 7, 2026  
> **Status:** Pre-Production Bug Fixes Required

---

## Table of Contents

1. [Bug Summary](#1-bug-summary)
2. [Critical Bugs](#2-critical-bugs)
3. [High Priority Bugs](#3-high-priority-bugs)
4. [Medium Priority Bugs](#4-medium-priority-bugs)
5. [Testing Checklist](#5-testing-checklist)

---

## 1. Bug Summary

| Priority | Count | Status |
|----------|-------|--------|
| 🔴 Critical | 2 | Blocking release |
| 🟠 High | 4 | Must fix before release |
| 🟡 Medium | 5 | Should fix before release |
| **Total** | **11** | |

### Quick Reference

| # | Bug | Priority | Component |
|---|-----|----------|-----------|
| 1 | Export produces empty files | 🔴 Critical | Export Service |
| 2 | Diagram card click not opening diagram | 🔴 Critical | Dashboard |
| 3 | "Reconnecting" status always showing | 🟠 High | Collaboration |
| 4 | Template edges connect to top of nodes | 🟠 High | Templates |
| 5 | Cursor icons reversed (select vs pan) | 🟠 High | Editor |
| 6 | Diagram card not showing preview | 🟠 High | Dashboard |
| 7 | Arrow keys not panning canvas | 🟡 Medium | Keyboard Shortcuts |
| 8 | Grouping not working visually | 🟡 Medium | Editor Store |
| 9 | Cloud icons loading slowly | 🟡 Medium | Shape Panel |
| 10 | Mermaid import not parsing correctly | 🟡 Medium | Import Service |
| 11 | Terraform import not working | 🟡 Medium | Import Service |

---

## 2. Critical Bugs

### Bug #1: Export Produces Empty Files

**Priority:** 🔴 CRITICAL  
**Component:** `src/services/exportService.ts`  
**Impact:** Users cannot export their diagrams to PNG, SVG, or PDF

#### Symptoms
- Export to PNG downloads a blank/white image
- Export to SVG downloads empty SVG
- Export to PDF downloads blank PDF
- Console may show errors about element not found

#### Root Cause
The export service uses `html-to-image` library to capture the React Flow canvas, but it's targeting the wrong element or the cloned element loses the necessary styles/structure.

#### Fix

**File: `src/services/exportService.ts`**

```typescript
import { toPng, toSvg } from 'html-to-image'
import { jsPDF } from 'jspdf'
import { getNodesBounds, getViewportForBounds } from '@xyflow/react'
import type { ExportOptions, DiagramNode } from '@/types'

export const exportService = {
  /**
   * Export diagram to PNG
   * Uses the React Flow viewport element directly
   */
  async exportFullDiagramToPng(
    reactFlowWrapper: HTMLElement,
    nodes: DiagramNode[],
    options?: Partial<ExportOptions>
  ): Promise<string> {
    if (nodes.length === 0) {
      throw new Error('No nodes to export')
    }

    // IMPORTANT: Find the correct element to capture
    // The viewport contains all the rendered nodes
    const viewport = reactFlowWrapper.querySelector('.react-flow__viewport') as HTMLElement
    if (!viewport) {
      throw new Error('Could not find React Flow viewport element')
    }

    const padding = options?.padding ?? 50
    const bounds = getNodesBounds(nodes)
    
    // Calculate export dimensions
    const imageWidth = bounds.width + padding * 2
    const imageHeight = bounds.height + padding * 2

    // Get the transform needed to fit all nodes
    const transform = getViewportForBounds(
      bounds,
      imageWidth,
      imageHeight,
      0.5,  // min zoom
      2,    // max zoom
      padding
    )

    // Store original transform to restore later
    const originalTransform = viewport.style.transform

    // Apply export transform temporarily
    viewport.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`

    try {
      const dataUrl = await toPng(viewport, {
        backgroundColor: options?.backgroundColor || '#ffffff',
        width: imageWidth,
        height: imageHeight,
        pixelRatio: 2, // Higher quality
        style: {
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
        },
        filter: (node) => {
          // Exclude UI elements that shouldn't be in export
          if (node instanceof Element) {
            const excludeClasses = [
              'react-flow__minimap',
              'react-flow__controls', 
              'react-flow__background',
              'react-flow__panel'
            ]
            return !excludeClasses.some(cls => node.classList?.contains(cls))
          }
          return true
        },
      })
      
      return dataUrl
    } finally {
      // IMPORTANT: Restore original transform
      viewport.style.transform = originalTransform
    }
  },

  /**
   * Export diagram to SVG
   */
  async exportFullDiagramToSvg(
    reactFlowWrapper: HTMLElement,
    nodes: DiagramNode[],
    options?: Partial<ExportOptions>
  ): Promise<string> {
    if (nodes.length === 0) {
      throw new Error('No nodes to export')
    }

    const viewport = reactFlowWrapper.querySelector('.react-flow__viewport') as HTMLElement
    if (!viewport) {
      throw new Error('Could not find React Flow viewport element')
    }

    const padding = options?.padding ?? 50
    const bounds = getNodesBounds(nodes)
    const imageWidth = bounds.width + padding * 2
    const imageHeight = bounds.height + padding * 2

    const transform = getViewportForBounds(bounds, imageWidth, imageHeight, 0.5, 2, padding)
    const originalTransform = viewport.style.transform

    viewport.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`

    try {
      const dataUrl = await toSvg(viewport, {
        backgroundColor: options?.backgroundColor || '#ffffff',
        width: imageWidth,
        height: imageHeight,
        filter: (node) => {
          if (node instanceof Element) {
            const excludeClasses = ['react-flow__minimap', 'react-flow__controls', 'react-flow__background']
            return !excludeClasses.some(cls => node.classList?.contains(cls))
          }
          return true
        },
      })
      return dataUrl
    } finally {
      viewport.style.transform = originalTransform
    }
  },

  /**
   * Export diagram to PDF
   */
  async exportFullDiagramToPdf(
    reactFlowWrapper: HTMLElement,
    nodes: DiagramNode[],
    options?: Partial<ExportOptions>
  ): Promise<Blob> {
    // First get PNG, then convert to PDF
    const pngDataUrl = await this.exportFullDiagramToPng(reactFlowWrapper, nodes, options)

    const img = new Image()
    img.src = pngDataUrl

    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
    })

    const pdfPadding = 20
    const width = img.width / 2 + pdfPadding * 2  // Divide by 2 because of pixelRatio
    const height = img.height / 2 + pdfPadding * 2

    const pdf = new jsPDF({
      orientation: width > height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [width, height],
    })

    pdf.addImage(pngDataUrl, 'PNG', pdfPadding, pdfPadding, img.width / 2, img.height / 2)

    return pdf.output('blob')
  },

  // ... rest of existing methods
}
```

**Also update the component that calls export:**

**File: `src/components/editor/MenuBar.tsx` or wherever export is triggered**

```typescript
// Make sure to pass the correct wrapper element
const handleExportPng = async () => {
  try {
    const wrapper = document.querySelector('.react-flow') as HTMLElement
    if (!wrapper) {
      toast.error('Could not find diagram canvas')
      return
    }
    
    const nodes = useEditorStore.getState().nodes
    const dataUrl = await exportService.exportFullDiagramToPng(wrapper, nodes, {
      backgroundColor: '#ffffff',
      padding: 50,
    })
    
    exportService.downloadFile(dataUrl, `${diagramName}.png`)
    toast.success('Exported to PNG')
  } catch (error) {
    console.error('Export failed:', error)
    toast.error('Export failed: ' + (error as Error).message)
  }
}
```

---

### Bug #2: Diagram Card Click Not Opening Diagram

**Priority:** 🔴 CRITICAL  
**Component:** `src/components/dashboard/DiagramCard.tsx`, `src/pages/DashboardPage.tsx`  
**Impact:** Users cannot open diagrams from the dashboard

#### Symptoms
- Clicking on a diagram card does nothing
- No navigation to editor page
- No console errors visible

#### Root Cause
The onClick handler may be:
1. Not being passed correctly from DashboardPage
2. Being blocked by event propagation from child elements
3. Navigation path may be incorrect

#### Fix

**Step 1: Debug the issue**

**File: `src/components/dashboard/DiagramCard.tsx`**

```typescript
export function DiagramCard({ diagram, onClick, isShared, isTemplate }: DiagramCardProps) {
  // Add debug logging
  const handleClick = () => {
    console.log('[DiagramCard] Card clicked for diagram:', diagram.id, diagram.name)
    onClick()
  }

  return (
    <>
      <div
        className="group cursor-pointer rounded-lg border border-supabase-border bg-supabase-bg-secondary overflow-hidden transition-all duration-200 ease-out hover:shadow-lg hover:shadow-supabase-green/5 hover:border-supabase-border-strong hover:-translate-y-0.5"
        onClick={handleClick}  // Use the debug handler
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick()
          }
        }}
      >
        {/* ... rest of component */}
      </div>
    </>
  )
}
```

**Step 2: Verify the navigation is correct**

**File: `src/pages/DashboardPage.tsx`**

```typescript
// Find where DiagramCard is rendered and verify onClick
{diagrams.map((diagram) => (
  <DiagramCard
    key={diagram.id}
    diagram={diagram}
    onClick={() => {
      console.log('[DashboardPage] Navigating to diagram:', diagram.id)
      navigate(`/editor/${diagram.id}`)
    }}
  />
))}
```

**Step 3: Check if the route exists**

**File: `src/providers/Router.tsx`**

```typescript
// Verify the editor route exists
const routes = [
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/editor/:diagramId', element: <EditorPage /> },  // This must exist
  // ...
]
```

**Step 4: Fix potential event propagation issues**

If dropdown menus or buttons inside the card are stealing clicks:

```typescript
// In DiagramCard.tsx, for any interactive elements inside the card:
<DropdownMenuTrigger
  onClick={(e) => e.stopPropagation()}  // Prevent bubbling to card
  // ...
>

<button
  onClick={(e) => {
    e.stopPropagation()  // Prevent bubbling to card
    handleToggleFavorite()
  }}
>
```

---

## 3. High Priority Bugs

### Bug #3: "Reconnecting" Status Always Showing

**Priority:** 🟠 HIGH  
**Component:** `src/stores/collaborationStore.ts`, `src/hooks/useCollaboration.ts`  
**Impact:** Users see confusing "Reconnecting..." message constantly

#### Symptoms
- "Reconnecting..." badge always visible in editor header
- Yellow pulsing indicator shown
- Actual collaboration may work fine

#### Root Cause
1. Initial state is set to `'disconnected'`
2. The hook sets status to `'disconnected'` before attempting to connect
3. The status callback may not fire correctly

#### Fix

**File: `src/stores/collaborationStore.ts`**

```typescript
// Change line ~30
const initialState: CollaborationState = {
  isConnected: false,
  connectionStatus: 'connecting',  // CHANGE from 'disconnected' to 'connecting'
  collaborators: [],
  myPresenceId: null,
  nodeLocks: new Map(),
}
```

**File: `src/hooks/useCollaboration.ts`**

```typescript
// Around line 59-65, REMOVE the line that sets disconnected:
const join = async () => {
  try {
    // DELETE THIS LINE:
    // setConnectionStatus('disconnected')
    
    await collaborationService.join(diagramId, {
      // ... callbacks
    })
  }
}
```

**File: `src/components/editor/EditorHeader.tsx`**

```typescript
// Update the status display to handle 'connecting' state (around line 278)
{/* Show nothing or subtle indicator when connecting */}
{connectionStatus === 'connecting' && (
  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-supabase-bg-tertiary text-xs">
    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
    <span className="text-supabase-text-muted">Connecting...</span>
  </div>
)}

{/* Only show warning states for actual problems */}
{connectionStatus === 'reconnecting' && (
  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-supabase-bg-tertiary text-xs">
    <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
    <span className="text-supabase-text-muted">Reconnecting...</span>
  </div>
)}

{connectionStatus === 'disconnected' && (
  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-supabase-bg-tertiary text-xs">
    <div className="h-2 w-2 rounded-full bg-red-500" />
    <span className="text-supabase-text-muted">Disconnected</span>
  </div>
)}

{/* Don't show anything when connected - that's the normal state */}
```

---

### Bug #4: Template Edges Connect to Top of Nodes

**Priority:** 🟠 HIGH  
**Component:** `src/constants/templates.ts`  
**Impact:** All architecture templates look incorrect (see screenshot)

#### Symptoms
- Edges connect to the top center of nodes instead of sides
- Diagram layout looks wrong
- Particularly visible in cloud architecture templates

#### Root Cause
Template edges don't specify `sourceHandle` and `targetHandle`, so React Flow defaults to the first handle (usually top center).

#### Fix

**File: `src/constants/templates.ts`**

Update ALL edges in ALL templates to include proper handle specifications:

```typescript
// AWS 3-Tier Architecture Template - BEFORE
edges: [
  { id: 'e1', source: 'user', target: 'cloudfront', type: 'smoothstep' },
  { id: 'e2', source: 'cloudfront', target: 'alb', type: 'smoothstep' },
  // ...
]

// AWS 3-Tier Architecture Template - AFTER
edges: [
  { 
    id: 'e1', 
    source: 'user', 
    target: 'cloudfront', 
    type: 'smoothstep',
    sourceHandle: 'right',   // Exit from right side
    targetHandle: 'left',    // Enter from left side
  },
  { 
    id: 'e2', 
    source: 'cloudfront', 
    target: 'alb', 
    type: 'smoothstep',
    sourceHandle: 'right',
    targetHandle: 'left',
  },
  { 
    id: 'e3', 
    source: 'alb', 
    target: 'ec2-1', 
    type: 'smoothstep',
    sourceHandle: 'right',
    targetHandle: 'left',
  },
  { 
    id: 'e4', 
    source: 'alb', 
    target: 'ec2-2', 
    type: 'smoothstep',
    sourceHandle: 'right',
    targetHandle: 'left',
  },
  { 
    id: 'e5', 
    source: 'ec2-1', 
    target: 'rds', 
    type: 'smoothstep',
    sourceHandle: 'right',
    targetHandle: 'left',
  },
  { 
    id: 'e6', 
    source: 'ec2-2', 
    target: 'rds', 
    type: 'smoothstep',
    sourceHandle: 'right',
    targetHandle: 'left',
  },
  { 
    id: 'e7', 
    source: 'ec2-1', 
    target: 's3', 
    type: 'smoothstep',
    sourceHandle: 'bottom',  // Different direction for this connection
    targetHandle: 'top',
  },
  { 
    id: 'e8', 
    source: 'ec2-2', 
    target: 's3', 
    type: 'smoothstep',
    sourceHandle: 'bottom',
    targetHandle: 'top',
  },
]
```

**Handle naming convention based on node positions:**
- Horizontal flow (left → right): `sourceHandle: 'right'`, `targetHandle: 'left'`
- Vertical flow (top → bottom): `sourceHandle: 'bottom'`, `targetHandle: 'top'`
- Reverse horizontal: `sourceHandle: 'left'`, `targetHandle: 'right'`
- Reverse vertical: `sourceHandle: 'top'`, `targetHandle: 'bottom'`

**Apply this fix to ALL templates:**
- `awsArchitectureTemplate`
- `gcpArchitectureTemplate`
- `azureArchitectureTemplate`
- `flowchartTemplate`
- `networkDiagramTemplate`
- `erDiagramTemplate`

---

### Bug #5: Cursor Icons Reversed (Select vs Pan Mode)

**Priority:** 🟠 HIGH  
**Component:** `src/components/editor/DiagramEditor.tsx`, `src/styles/index.css`  
**Impact:** Confusing UX - hand shows in select mode, pointer shows in pan mode

#### Symptoms
- In "Select" mode: Hand/grab cursor appears
- In "Pan" mode: Arrow/pointer cursor appears
- Should be the opposite

#### Root Cause
The CSS cursor styles are not correctly applied based on the interaction mode.

#### Fix

**File: `src/styles/index.css`**

Add or update these styles:

```css
/* React Flow cursor styles based on interaction mode */

/* Default cursor for select mode */
.react-flow__pane {
  cursor: default;
}

/* When actively selecting/dragging a selection box */
.react-flow__pane.selecting {
  cursor: crosshair;
}

/* Pan mode - show grab cursor */
.react-flow[data-interaction-mode="pan"] .react-flow__pane {
  cursor: grab;
}

/* When actively panning */
.react-flow[data-interaction-mode="pan"] .react-flow__pane:active,
.react-flow[data-interaction-mode="pan"] .react-flow__pane.dragging {
  cursor: grabbing;
}

/* Ensure nodes always show move cursor on hover in select mode */
.react-flow[data-interaction-mode="select"] .react-flow__node {
  cursor: move;
}

/* Connection handles */
.react-flow__handle {
  cursor: crosshair;
}
```

**File: `src/components/editor/DiagramEditor.tsx`**

Add the data attribute to ReactFlow:

```typescript
<ReactFlow
  nodes={visibleNodes}
  edges={visibleEdges}
  // ... other props
  className="bg-supabase-bg-tertiary"
  data-interaction-mode={interactionMode}  // ADD THIS LINE
>
```

---

### Bug #6: Diagram Card Not Showing Preview

**Priority:** 🟠 HIGH  
**Component:** `src/components/dashboard/DiagramCard.tsx`  
**Impact:** Users can't see diagram content in dashboard

#### Symptoms
- Diagram cards show empty gray area or placeholder
- Preview should show miniature version of diagram

#### Root Cause
1. Diagram may have no nodes saved
2. Nodes may not have position data
3. Preview component may not be receiving correct data

#### Debug & Fix

**Step 1: Add debug logging**

**File: `src/components/dashboard/DiagramCard.tsx`**

```typescript
function DiagramMiniPreview({ nodes, edges }: { nodes: DiagramNode[]; edges: DiagramEdge[] }) {
  // Add debug logging
  console.log('[DiagramMiniPreview] Rendering with:', {
    nodeCount: nodes?.length || 0,
    edgeCount: edges?.length || 0,
    firstNode: nodes?.[0],
  })

  // Check if nodes array exists and has items
  if (!nodes || nodes.length === 0) {
    console.log('[DiagramMiniPreview] No nodes, showing empty pattern')
    return <EmptyPattern />
  }

  // ... rest of component
}
```

**Step 2: Check diagram data in DashboardPage**

**File: `src/pages/DashboardPage.tsx`**

```typescript
// In the component where diagrams are mapped:
{diagrams.map((diagram) => {
  console.log('[DashboardPage] Diagram data:', {
    id: diagram.id,
    name: diagram.name,
    nodeCount: diagram.nodes?.length || 0,
    edgeCount: diagram.edges?.length || 0,
  })
  return (
    <DiagramCard
      key={diagram.id}
      diagram={diagram}
      onClick={() => navigate(`/editor/${diagram.id}`)}
    />
  )
})}
```

**Step 3: Verify the diagram service returns nodes**

**File: `src/services/diagramService.ts`**

```typescript
// In the getAll or getByFolder method:
async getAll(): Promise<Diagram[]> {
  const { data, error } = await supabase
    .from('diagrams')
    .select('*')  // Make sure nodes and edges columns are included
    .order('updated_at', { ascending: false })

  console.log('[DiagramService] Raw data from DB:', data)

  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    // ... other fields
    nodes: row.nodes || [],  // Ensure this is set
    edges: row.edges || [],  // Ensure this is set
  }))
}
```

---

## 4. Medium Priority Bugs

### Bug #7: Arrow Keys Not Panning Canvas

**Priority:** 🟡 MEDIUM  
**Component:** `src/hooks/useKeyboardShortcuts.ts`  
**Impact:** Users can't navigate canvas with keyboard

#### Fix

**File: `src/hooks/useKeyboardShortcuts.ts`**

The hook doesn't have access to React Flow instance. Need to either:
1. Pass the instance as a parameter, or
2. Use a different approach

**Option A: Add arrow key handling in DiagramEditor**

**File: `src/components/editor/DiagramEditor.tsx`**

```typescript
import { useReactFlow } from '@xyflow/react'

export function DiagramEditor({ diagram }: DiagramEditorProps) {
  const { setViewport, getViewport } = useReactFlow()
  
  // Add keyboard handler for arrow keys
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle if in input field
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement) {
        return
      }

      // Only handle arrow keys without modifiers
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      const panAmount = event.shiftKey ? 100 : 50  // Shift = faster
      const currentViewport = getViewport()

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          setViewport({
            x: currentViewport.x + panAmount,
            y: currentViewport.y,
            zoom: currentViewport.zoom,
          })
          break
        case 'ArrowRight':
          event.preventDefault()
          setViewport({
            x: currentViewport.x - panAmount,
            y: currentViewport.y,
            zoom: currentViewport.zoom,
          })
          break
        case 'ArrowUp':
          event.preventDefault()
          setViewport({
            x: currentViewport.x,
            y: currentViewport.y + panAmount,
            zoom: currentViewport.zoom,
          })
          break
        case 'ArrowDown':
          event.preventDefault()
          setViewport({
            x: currentViewport.x,
            y: currentViewport.y - panAmount,
            zoom: currentViewport.zoom,
          })
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setViewport, getViewport])

  // ... rest of component
}
```

---

### Bug #8: Grouping Not Working Visually

**Priority:** 🟡 MEDIUM  
**Component:** `src/stores/editorStore.ts`  
**Impact:** Users can't visually group shapes together

#### Root Cause
The current grouping only sets a `groupId` property but doesn't:
1. Create a visual group boundary
2. Move grouped nodes together

#### Fix

**File: `src/stores/editorStore.ts`**

```typescript
// Replace the existing groupNodes function:
groupNodes: () => {
  const { nodes, selectedNodes } = get()
  if (selectedNodes.length < 2) {
    toast.error('Select at least 2 nodes to group')
    return
  }

  get().pushHistory()

  const groupId = nanoid()
  
  // Get selected node objects
  const selectedNodeObjects = nodes.filter(n => selectedNodes.includes(n.id))
  
  // Calculate group bounds
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  
  selectedNodeObjects.forEach(node => {
    const width = (node.measured?.width || node.width || 150) as number
    const height = (node.measured?.height || node.height || 80) as number
    minX = Math.min(minX, node.position.x)
    minY = Math.min(minY, node.position.y)
    maxX = Math.max(maxX, node.position.x + width)
    maxY = Math.max(maxY, node.position.y + height)
  })

  // Add padding around the group
  const padding = 20
  minX -= padding
  minY -= padding
  maxX += padding
  maxY += padding

  // Create the group container node
  const groupNode: DiagramNode = {
    id: groupId,
    type: 'custom',
    position: { x: minX, y: minY },
    data: {
      label: 'Group',
      type: 'group',
      style: {
        backgroundColor: 'rgba(62, 207, 142, 0.05)',
        borderColor: '#3ECF8E',
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 8,
      },
      isGroup: true,
    },
    width: maxX - minX,
    height: maxY - minY,
    style: { zIndex: -1 },  // Behind other nodes
    selectable: true,
    draggable: true,
  }

  // Update child nodes - adjust positions relative to group
  const updatedNodes = nodes.map((node) => {
    if (!selectedNodes.includes(node.id)) return node
    return {
      ...node,
      data: {
        ...node.data,
        groupId,
      },
      // Store relative position for group movement
      position: {
        x: node.position.x - minX + padding,
        y: node.position.y - minY + padding,
      },
      parentId: groupId,
      extent: 'parent' as const,
    }
  })

  // Add group node at the beginning so it renders behind
  const newNodes = [groupNode, ...updatedNodes]

  set({ nodes: newNodes, isDirty: true })
  toast.success('Nodes grouped')
},

// Also update ungroupNodes:
ungroupNodes: () => {
  const { nodes, selectedNodes } = get()
  if (selectedNodes.length === 0) return

  get().pushHistory()

  // Find all group IDs from selected nodes
  const groupIds = new Set<string>()
  nodes.forEach(node => {
    if (selectedNodes.includes(node.id) && node.data.groupId) {
      groupIds.add(node.data.groupId)
    }
    // Also check if a group node itself is selected
    if (selectedNodes.includes(node.id) && node.data.isGroup) {
      groupIds.add(node.id)
    }
  })

  // Remove group nodes and unset groupId from children
  const newNodes = nodes
    .filter(node => !groupIds.has(node.id))  // Remove group containers
    .map(node => {
      if (!node.data.groupId || !groupIds.has(node.data.groupId)) {
        return node
      }
      
      // Find the group node to get its position
      const groupNode = nodes.find(n => n.id === node.data.groupId)
      const groupX = groupNode?.position.x || 0
      const groupY = groupNode?.position.y || 0
      
      // Convert position back to absolute
      const { groupId, ...restData } = node.data
      return {
        ...node,
        data: restData as DiagramNode['data'],
        position: {
          x: node.position.x + groupX,
          y: node.position.y + groupY,
        },
        parentId: undefined,
        extent: undefined,
      }
    })

  set({ nodes: newNodes, isDirty: true })
  toast.success('Nodes ungrouped')
},
```

---

### Bug #9: Cloud Icons Loading Slowly

**Priority:** 🟡 MEDIUM  
**Component:** `src/components/editor/ShapePanel.tsx`, `src/components/editor/icons/`  
**Impact:** Poor UX - shape panel takes time to render all icons

#### Root Cause
All 100+ cloud icons are imported and rendered synchronously.

#### Fix Options

**Option A: Lazy load by category**

```typescript
// Only render icons when category is expanded
const [expandedCategories, setExpandedCategories] = useState<string[]>([])

// In render:
{expandedCategories.includes('aws') && (
  <AwsIconsSection />
)}
```

**Option B: Virtualize the icon list**

```typescript
import { FixedSizeGrid } from 'react-window'

// Render only visible icons
<FixedSizeGrid
  columnCount={4}
  rowCount={Math.ceil(icons.length / 4)}
  columnWidth={60}
  rowHeight={60}
  height={300}
  width={240}
>
  {({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * 4 + columnIndex
    const icon = icons[index]
    if (!icon) return null
    return <IconItem key={icon.type} icon={icon} style={style} />
  }}
</FixedSizeGrid>
```

**Option C: Use placeholder while loading**

```typescript
const [iconsLoaded, setIconsLoaded] = useState(false)

useEffect(() => {
  // Defer icon loading
  const timer = setTimeout(() => setIconsLoaded(true), 100)
  return () => clearTimeout(timer)
}, [])

{iconsLoaded ? <ActualIcons /> : <IconSkeletons />}
```

---

### Bug #10: Mermaid Import Not Working

**Priority:** 🟡 MEDIUM  
**Component:** `src/services/mermaidParser.ts`  
**Impact:** Can't import Mermaid diagrams

#### Debug Steps

**File: `src/services/mermaidParser.ts`**

```typescript
export function parseMermaid(input: string): ParseResult {
  console.log('[MermaidParser] Input:', input)
  
  const errors: string[] = []
  const nodeMap = new Map<string, MermaidNode>()
  const mermaidEdges: MermaidEdge[] = []

  // ... parsing logic ...

  console.log('[MermaidParser] Parsed nodes:', Array.from(nodeMap.values()))
  console.log('[MermaidParser] Parsed edges:', mermaidEdges)
  console.log('[MermaidParser] Errors:', errors)

  // ... convert to diagram format ...
}
```

**Common issues to check:**
1. Input may have different line endings (CRLF vs LF)
2. Graph declaration may use different syntax (`graph TD` vs `flowchart TD`)
3. Node shapes may not be recognized

---

### Bug #11: Terraform Import Not Working

**Priority:** 🟡 MEDIUM  
**Component:** `src/services/terraformParser.ts`  
**Impact:** Can't import Terraform files

#### Debug Steps

Similar to Mermaid - add logging to the parser and check for:
1. HCL syntax variations
2. Resource type recognition
3. Provider-specific resource handling

---

## 5. Testing Checklist

### Pre-Release Testing

After applying all fixes, test each feature:

```markdown
## Export Testing
□ Export empty diagram - should show error message
□ Export diagram with 1 node - should work
□ Export diagram with 10+ nodes - should include all
□ Export PNG - opens image correctly
□ Export SVG - opens in browser/editor
□ Export PDF - opens in PDF reader
□ Export with dark theme - background correct
□ Export with light theme - background correct

## Navigation Testing
□ Click diagram card - opens editor
□ Click diagram card with keyboard (Enter) - opens editor
□ Double-click opens correct diagram
□ Back button returns to dashboard

## Collaboration Testing
□ Open diagram - no "Reconnecting" shown (or brief "Connecting")
□ Status shows "Connected" when ready
□ Disconnect network - shows "Disconnected"
□ Reconnect network - shows "Reconnecting" then "Connected"

## Template Testing
□ Load AWS template - edges connect correctly
□ Load Azure template - edges connect correctly
□ Load GCP template - edges connect correctly
□ Load Flowchart template - edges connect correctly

## Canvas Interaction Testing
□ Select mode - cursor is pointer/arrow
□ Pan mode - cursor is hand/grab
□ Arrow keys pan canvas
□ Shift+Arrow keys pan faster

## Grouping Testing
□ Select 2+ nodes - Group command enabled
□ Group nodes - visual boundary appears
□ Move group - all nodes move together
□ Ungroup - nodes become independent

## Import Testing
□ Import valid Mermaid - creates nodes/edges
□ Import invalid Mermaid - shows error
□ Import Terraform - creates cloud icons
```

---

## Document End

**Total Bugs:** 11  
**Critical:** 2  
**High:** 4  
**Medium:** 5

**Estimated Fix Time:** 4-6 hours for all bugs

**Recommended Fix Order:**
1. Bug #1 (Export) - Users need to export
2. Bug #2 (Card click) - Users need to open diagrams  
3. Bug #4 (Template edges) - First impression of templates
4. Bug #3 (Reconnecting) - Confusing UX
5. Bug #5 (Cursors) - Confusing UX
6. Bug #6 (Preview) - Nice to have
7. Remaining medium priority bugs
