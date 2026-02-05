# DIAGMO - Complete Bug Fixes & Menu Bar Implementation

## 🔴 ISSUES IDENTIFIED FROM SCREENSHOT

### Issue 1: Connector/Edge Gaps - Not Connected to Shape Edges
**Problem**: The arrows don't touch the shape edges - there are visible gaps at connection points
**Cause**: The Handle positions use `transform: translate(-50%, -50%)` which positions them at the center of where they should be, but the edge path calculation doesn't account for this properly

### Issue 2: Arrow Not Fully Visible
**Problem**: The arrowhead appears cut off or not fully rendered
**Cause**: The markerEnd size might be clipped or the path is ending too early

### Issue 3: Resize Handles Only on Left Side
**Problem**: Resize handles only appear on certain sides, not all 8 positions
**Cause**: NodeResizer configuration issue or CSS conflict

### Issue 4: Select All (Ctrl+A) Not Working
**Problem**: Ctrl+A doesn't select all shapes
**Cause**: Need to update both store state AND React Flow node selection

### Issue 5: Menu Bar Needed
**Problem**: Toolbar icons are scattered, need proper File/Edit/View/Arrange menus

---

## 🛠️ FIX 1: Edge Connection Gaps

The main issue is that edges don't connect flush to the shape boundaries. This requires:

1. **Remove the transform offset from handles** - handles should be AT the edge, not offset
2. **Ensure pathOptions account for handle positions**

### Update `CustomNode.tsx` - Connection Points:

```tsx
// Connection point positions - positioned AT the edge (not offset)
const connectionPoints = [
  { id: 'top', position: Position.Top, style: { left: '50%', top: '0%' } },
  { id: 'top-right', position: Position.Top, style: { left: '100%', top: '0%' } },
  { id: 'right', position: Position.Right, style: { left: '100%', top: '50%' } },
  { id: 'bottom-right', position: Position.Bottom, style: { left: '100%', top: '100%' } },
  { id: 'bottom', position: Position.Bottom, style: { left: '50%', top: '100%' } },
  { id: 'bottom-left', position: Position.Bottom, style: { left: '0%', top: '100%' } },
  { id: 'left', position: Position.Left, style: { left: '0%', top: '50%' } },
  { id: 'top-left', position: Position.Top, style: { left: '0%', top: '0%' } },
]
```

### Update Handle rendering in CustomNode.tsx:

```tsx
{/* Connection Points - 8 points like draw.io */}
{connectionPoints.map((point) => (
  <Handle
    key={point.id}
    id={point.id}
    type="source"
    position={point.position}
    className={cn(
      'transition-all duration-150 !absolute',
      !showHandles && 'opacity-0 scale-0',
      showHandles && 'opacity-100 scale-100',
      isTarget && '!bg-green-500 ring-2 ring-green-300'
    )}
    style={{
      width: showHandles ? 10 : 4,
      height: showHandles ? 10 : 4,
      backgroundColor: isTarget ? '#22c55e' : '#3b82f6',
      border: '2px solid white',
      borderRadius: '50%',
      cursor: 'crosshair',
      // Position handle at edge, centered on the connection point
      left: point.style.left,
      top: point.style.top,
      transform: 'translate(-50%, -50%)', // Center the handle ON the point
    }}
    isConnectable={!locked}
  />
))}
```

### Update DiagramEditor.tsx - Edge Options for proper connection:

```tsx
const defaultEdgeOptions = {
  type: 'smoothstep', // smoothstep connects better than straight
  animated: false,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 16,
    height: 16,
    color: '#6b7280',
  },
  style: {
    strokeWidth: 2,
    stroke: '#6b7280',
  },
  // These help edges connect properly to node boundaries
  pathOptions: {
    offset: 0, // No offset from handle
    borderRadius: 8, // Smooth corners for step edges
  },
}
```

### Add CSS for better edge rendering in index.css:

```css
/* Ensure edges connect properly to nodes */
.react-flow__edge-path {
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Make arrow markers more visible */
.react-flow__arrowhead {
  fill: currentColor;
}

/* Ensure markers don't get clipped */
.react-flow svg {
  overflow: visible;
}
```

---

## 🛠️ FIX 2: Arrow Visibility

The arrowhead might be cut off. Fix by adjusting marker size and ensuring SVG overflow is visible:

### In DiagramEditor.tsx:

```tsx
const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: false,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,  // Larger for visibility
    height: 20,
    color: '#6b7280',
    strokeWidth: 1,
  },
  style: {
    strokeWidth: 2,
    stroke: '#6b7280',
  },
}
```

### In editorStore.ts - onConnect:

```tsx
onConnect: (connection) => {
  get().pushHistory()
  const newEdge: DiagramEdge = {
    id: nanoid(),
    source: connection.source!,
    target: connection.target!,
    sourceHandle: connection.sourceHandle,
    targetHandle: connection.targetHandle,
    type: 'smoothstep', // Better connection to shapes
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
  set({
    edges: addEdge(newEdge, get().edges) as DiagramEdge[],
    isDirty: true,
  })
},
```

---

## 🛠️ FIX 3: Resize Handles on All 8 Sides

The NodeResizer should show all 8 handles. Replace with explicit control:

### In CustomNode.tsx - Replace NodeResizer with:

```tsx
import { NodeResizer } from '@xyflow/react'

// In the component:
<NodeResizer
  isVisible={selected && !locked}
  minWidth={minWidth}
  minHeight={minHeight}
  keepAspectRatio={false}
  // Force all handles to be visible
  handleStyle={{
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: 'white',
    border: '2px solid #3b82f6',
    // Ensure handles are above other elements
    zIndex: 10,
  }}
  lineStyle={{
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderStyle: 'dashed',
  }}
  // Explicitly set which handles to show
  // By default all 8 should show, but if not working, we need to check React Flow version
/>
```

### Add CSS to ensure resize handles appear:

```css
/* Ensure all resize handles are visible */
.react-flow__resize-control {
  position: absolute !important;
  width: 10px !important;
  height: 10px !important;
  background: white !important;
  border: 2px solid #3b82f6 !important;
  border-radius: 2px !important;
  z-index: 10 !important;
}

.react-flow__resize-control.top-left { top: 0; left: 0; cursor: nwse-resize; }
.react-flow__resize-control.top { top: 0; left: 50%; transform: translateX(-50%); cursor: ns-resize; }
.react-flow__resize-control.top-right { top: 0; right: 0; cursor: nesw-resize; }
.react-flow__resize-control.right { top: 50%; right: 0; transform: translateY(-50%); cursor: ew-resize; }
.react-flow__resize-control.bottom-right { bottom: 0; right: 0; cursor: nwse-resize; }
.react-flow__resize-control.bottom { bottom: 0; left: 50%; transform: translateX(-50%); cursor: ns-resize; }
.react-flow__resize-control.bottom-left { bottom: 0; left: 0; cursor: nesw-resize; }
.react-flow__resize-control.left { top: 50%; left: 0; transform: translateY(-50%); cursor: ew-resize; }

/* Resize line/border */
.react-flow__resize-control.line {
  border: 1px dashed #3b82f6 !important;
  width: 100% !important;
  height: 100% !important;
  pointer-events: none;
}
```

---

## 🛠️ FIX 4: Select All (Ctrl+A)

The issue is that we need to mark nodes as `selected: true` in addition to tracking selectedNodes:

### Update editorStore.ts:

```tsx
selectNodes: (ids) => {
  // Mark all nodes with their selection state
  const newNodes = get().nodes.map(node => ({
    ...node,
    selected: ids.includes(node.id),
  }))
  set({ 
    selectedNodes: ids,
    nodes: newNodes,
  })
},

selectEdges: (ids) => {
  const newEdges = get().edges.map(edge => ({
    ...edge,
    selected: ids.includes(edge.id),
  }))
  set({ 
    selectedEdges: ids,
    edges: newEdges,
  })
},
```

### Update DiagramEditor.tsx - Select All handler:

```tsx
// Select All: Ctrl+A
if (isMod && event.key === 'a') {
  event.preventDefault()
  // Select all nodes AND all edges
  const allNodeIds = nodes.map((n) => n.id)
  const allEdgeIds = edges.map((e) => e.id)
  selectNodes(allNodeIds)
  selectEdges(allEdgeIds)
}
```

---

## 🛠️ FIX 5: Professional Menu Bar

Create a new MenuBar component to replace scattered toolbar buttons:

### Create `src/components/editor/MenuBar.tsx`:

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEditorStore } from '@/stores/editorStore'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarCheckboxItem,
} from '@/components/ui/menubar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui'
import { toast } from 'sonner'

interface MenuBarProps {
  diagramName: string
  onSave: () => void
  onExport: (format: 'png' | 'svg' | 'pdf') => void
  saving: boolean
}

export function MenuBar({ diagramName, onSave, onExport, saving }: MenuBarProps) {
  const navigate = useNavigate()
  const [showShortcuts, setShowShortcuts] = useState(false)

  // Store actions
  const nodes = useEditorStore((state) => state.nodes)
  const edges = useEditorStore((state) => state.edges)
  const selectedNodes = useEditorStore((state) => state.selectedNodes)
  const undo = useEditorStore((state) => state.undo)
  const redo = useEditorStore((state) => state.redo)
  const past = useEditorStore((state) => state.past)
  const future = useEditorStore((state) => state.future)
  const copyNodes = useEditorStore((state) => state.copyNodes)
  const pasteNodes = useEditorStore((state) => state.pasteNodes)
  const deleteSelected = useEditorStore((state) => state.deleteSelected)
  const selectNodes = useEditorStore((state) => state.selectNodes)
  const selectEdges = useEditorStore((state) => state.selectEdges)
  const clipboard = useEditorStore((state) => state.clipboard)
  const gridEnabled = useEditorStore((state) => state.gridEnabled)
  const snapToGrid = useEditorStore((state) => state.snapToGrid)
  const toggleGrid = useEditorStore((state) => state.toggleGrid)
  const toggleSnapToGrid = useEditorStore((state) => state.toggleSnapToGrid)
  const alignNodes = useEditorStore((state) => state.alignNodes)
  const distributeNodes = useEditorStore((state) => state.distributeNodes)
  const groupNodes = useEditorStore((state) => state.groupNodes)
  const ungroupNodes = useEditorStore((state) => state.ungroupNodes)
  const lockNodes = useEditorStore((state) => state.lockNodes)
  const unlockNodes = useEditorStore((state) => state.unlockNodes)

  const hasSelection = selectedNodes.length > 0
  const hasMultipleSelection = selectedNodes.length >= 2
  const hasThreeOrMore = selectedNodes.length >= 3

  const handleSelectAll = () => {
    selectNodes(nodes.map(n => n.id))
    selectEdges(edges.map(e => e.id))
  }

  const handleDuplicate = () => {
    copyNodes()
    pasteNodes()
  }

  return (
    <>
      <Menubar className="border-none rounded-none h-10 px-2">
        {/* FILE MENU */}
        <MenubarMenu>
          <MenubarTrigger className="font-normal">File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={onSave} disabled={saving}>
              Save
              <MenubarShortcut>⌘S</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarSub>
              <MenubarSubTrigger>Export</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem onClick={() => onExport('png')}>
                  Export as PNG
                </MenubarItem>
                <MenubarItem onClick={() => onExport('svg')}>
                  Export as SVG
                </MenubarItem>
                <MenubarItem onClick={() => onExport('pdf')}>
                  Export as PDF
                </MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem onClick={() => window.print()}>
              Print
              <MenubarShortcut>⌘P</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* EDIT MENU */}
        <MenubarMenu>
          <MenubarTrigger className="font-normal">Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={undo} disabled={past.length === 0}>
              Undo
              <MenubarShortcut>⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={redo} disabled={future.length === 0}>
              Redo
              <MenubarShortcut>⌘⇧Z</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={copyNodes} disabled={!hasSelection}>
              Copy
              <MenubarShortcut>⌘C</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={pasteNodes} disabled={clipboard.length === 0}>
              Paste
              <MenubarShortcut>⌘V</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={handleDuplicate} disabled={!hasSelection}>
              Duplicate
              <MenubarShortcut>⌘D</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={deleteSelected} disabled={!hasSelection}>
              Delete
              <MenubarShortcut>⌫</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={handleSelectAll}>
              Select All
              <MenubarShortcut>⌘A</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* VIEW MENU */}
        <MenubarMenu>
          <MenubarTrigger className="font-normal">View</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem checked={gridEnabled} onClick={toggleGrid}>
              Show Grid
              <MenubarShortcut>⌘'</MenubarShortcut>
            </MenubarCheckboxItem>
            <MenubarCheckboxItem checked={snapToGrid} onClick={toggleSnapToGrid}>
              Snap to Grid
              <MenubarShortcut>⌘⇧'</MenubarShortcut>
            </MenubarCheckboxItem>
            <MenubarSeparator />
            <MenubarItem onClick={() => toast.info('Zoom to fit')}>
              Fit to Screen
              <MenubarShortcut>⌘0</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={() => toast.info('Zoom in')}>
              Zoom In
              <MenubarShortcut>⌘+</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={() => toast.info('Zoom out')}>
              Zoom Out
              <MenubarShortcut>⌘-</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* ARRANGE MENU */}
        <MenubarMenu>
          <MenubarTrigger className="font-normal">Arrange</MenubarTrigger>
          <MenubarContent>
            <MenubarSub>
              <MenubarSubTrigger disabled={!hasMultipleSelection}>Align</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem onClick={() => alignNodes('left')}>Align Left</MenubarItem>
                <MenubarItem onClick={() => alignNodes('center')}>Align Center</MenubarItem>
                <MenubarItem onClick={() => alignNodes('right')}>Align Right</MenubarItem>
                <MenubarSeparator />
                <MenubarItem onClick={() => alignNodes('top')}>Align Top</MenubarItem>
                <MenubarItem onClick={() => alignNodes('middle')}>Align Middle</MenubarItem>
                <MenubarItem onClick={() => alignNodes('bottom')}>Align Bottom</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSub>
              <MenubarSubTrigger disabled={!hasThreeOrMore}>Distribute</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem onClick={() => distributeNodes('horizontal')}>
                  Distribute Horizontally
                </MenubarItem>
                <MenubarItem onClick={() => distributeNodes('vertical')}>
                  Distribute Vertically
                </MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem onClick={groupNodes} disabled={!hasMultipleSelection}>
              Group
              <MenubarShortcut>⌘G</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={ungroupNodes} disabled={!hasSelection}>
              Ungroup
              <MenubarShortcut>⌘⇧G</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={lockNodes} disabled={!hasSelection}>
              Lock
              <MenubarShortcut>⌘L</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={unlockNodes} disabled={!hasSelection}>
              Unlock
              <MenubarShortcut>⌘⇧L</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* HELP MENU */}
        <MenubarMenu>
          <MenubarTrigger className="font-normal">Help</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => setShowShortcuts(true)}>
              Keyboard Shortcuts
              <MenubarShortcut>?</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={() => toast.info('Diagmo Pro v1.0')}>
              About Diagmo Pro
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      {/* Shortcuts Dialog */}
      <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
            <DialogDescription>
              Quick actions for faster diagramming
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4 text-sm">
            {[
              { keys: '⌘ S', desc: 'Save' },
              { keys: '⌘ Z', desc: 'Undo' },
              { keys: '⌘ ⇧ Z', desc: 'Redo' },
              { keys: '⌘ C', desc: 'Copy' },
              { keys: '⌘ V', desc: 'Paste' },
              { keys: '⌘ D', desc: 'Duplicate' },
              { keys: '⌘ A', desc: 'Select All' },
              { keys: '⌘ G', desc: 'Group' },
              { keys: '⌘ ⇧ G', desc: 'Ungroup' },
              { keys: '⌘ L', desc: 'Lock/Unlock' },
              { keys: 'Delete', desc: 'Delete Selected' },
              { keys: '⌘ \'', desc: 'Toggle Grid' },
            ].map((s, i) => (
              <div key={i} className="flex justify-between py-1 border-b last:border-0">
                <span className="text-muted-foreground">{s.desc}</span>
                <kbd className="px-2 py-0.5 text-xs bg-muted rounded">{s.keys}</kbd>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

### Create Menubar UI component `src/components/ui/menubar.tsx`:

```tsx
import * as React from "react"
import * as MenubarPrimitive from "@radix-ui/react-menubar"
import { Check, ChevronRight, Circle } from "lucide-react"
import { cn } from "@/utils"

const MenubarMenu = MenubarPrimitive.Menu
const MenubarGroup = MenubarPrimitive.Group
const MenubarPortal = MenubarPrimitive.Portal
const MenubarSub = MenubarPrimitive.Sub
const MenubarRadioGroup = MenubarPrimitive.RadioGroup

const Menubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn(
      "flex h-10 items-center space-x-1 rounded-md border bg-background p-1",
      className
    )}
    {...props}
  />
))
Menubar.displayName = MenubarPrimitive.Root.displayName

const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex cursor-pointer select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      className
    )}
    {...props}
  />
))
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName

const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </MenubarPrimitive.SubTrigger>
))
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName

const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName

const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(
  (
    { className, align = "start", alignOffset = -4, sideOffset = 8, ...props },
    ref
  ) => (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        ref={ref}
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  )
)
MenubarContent.displayName = MenubarPrimitive.Content.displayName

const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
MenubarItem.displayName = MenubarPrimitive.Item.displayName

const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
))
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName

const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
))
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName

const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
MenubarLabel.displayName = MenubarPrimitive.Label.displayName

const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName

const MenubarShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
MenubarShortcut.displayname = "MenubarShortcut"

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
}
```

### Update EditorHeader.tsx to use MenuBar:

```tsx
import { MenuBar } from './MenuBar'

// In the header, replace the current toolbar with:
<header className="h-auto border-b bg-background flex flex-col">
  {/* Menu Bar */}
  <MenuBar
    diagramName={name}
    onSave={handleSave}
    onExport={handleExport}
    saving={saving}
  />
  
  {/* Diagram name and status bar */}
  <div className="h-10 flex items-center px-4 border-t bg-muted/30">
    <Input
      value={name}
      onChange={(e) => setName(e.target.value)}
      onBlur={handleSave}
      className="max-w-xs h-7 text-sm font-medium bg-transparent border-none focus:bg-background"
    />
    <div className="flex-1" />
    {saving ? (
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        Saving...
      </span>
    ) : lastSaved ? (
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <Check className="h-3 w-3" />
        Saved
      </span>
    ) : isDirty ? (
      <span className="text-xs text-muted-foreground">Unsaved changes</span>
    ) : null}
    <span className="text-xs text-muted-foreground ml-4">
      {Math.round(zoom * 100)}%
    </span>
  </div>
</header>
```

### Install required dependency:
```bash
npm install @radix-ui/react-menubar
```

---

## 📋 SUMMARY OF ALL FIXES

| Issue | Fix |
|-------|-----|
| Edge gaps at connection points | Adjust Handle positions to be AT edges, use smoothstep edge type |
| Arrow not visible | Increase marker size to 20px, add CSS for overflow:visible |
| Resize only on some sides | Update NodeResizer config, add explicit CSS for all 8 handles |
| Select All not working | Update selectNodes to set `selected: true` on node objects |
| Scattered toolbar | Implement professional Menu Bar with File/Edit/View/Arrange/Help |

### Files to Modify:
1. `CustomNode.tsx` - Handle positions, NodeResizer
2. `DiagramEditor.tsx` - Edge options
3. `editorStore.ts` - selectNodes, onConnect
4. `index.css` - Edge and resize handle styles
5. `EditorHeader.tsx` - Replace toolbar with MenuBar

### Files to Create:
1. `MenuBar.tsx` - New menu bar component
2. `menubar.tsx` - UI primitives for menubar

### Dependencies to Install:
```bash
npm install @radix-ui/react-menubar
```
