# DIAGMO PRO - Match Lucidchart UI Exactly

## 📋 INSTRUCTIONS FOR CLAUDE CODE

This document contains **exact specifications** to replicate Lucidchart's professional UI based on the reference screenshot. Please follow precisely.

### Approach:
1. Use **sub-agents** for parallel work on CSS, edges, and nodes
2. **Test visually** after each change - run `npm run dev`
3. **Make minimal changes** - don't rewrite working code
4. **Compare to reference** - keep Lucidchart screenshot open while working

---

## 🎯 LUCIDCHART REFERENCE ANALYSIS

From the screenshot, here's what Lucidchart does:

### Edges/Connections:
- **Line**: Thin gray (~1px), perfectly straight for horizontal connections
- **Arrow**: Small, simple triangle arrowhead (~6-8px)
- **Color**: Gray (#6b7280 or similar)
- **No gaps**: Line connects flush to shape boundary

### Connection Handles (when shape selected):
- **Size**: Small circles (~6-8px diameter)
- **Color**: Light blue/periwinkle (#818cf8 or similar)
- **Position**: Exactly at midpoint of each edge (4 handles: top, right, bottom, left)
- **Border**: Subtle darker blue border

### Resize Handles (when shape selected):
- **Size**: Small squares (~6-8px)
- **Color**: Blue (#3b82f6)
- **Position**: 8 handles - 4 corners + 4 edge midpoints
- **Selection border**: Thin blue line around shape

### Shapes:
- **Rectangle**: Rounded corners (~4-8px radius), thin gray border
- **Cloud icons**: Clean SVG, no border, label below

---

## 🔧 REQUIRED CHANGES

### FILE 1: `src/components/editor/DiagramEditor.tsx`

**Change arrow size from 18 to 8:**

```tsx
// Lines 23-36 - REPLACE WITH:
const defaultEdgeOptions = {
  type: 'labeled',
  animated: false,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 8,    // Changed from 18
    height: 8,   // Changed from 18
    color: '#64748b', // Slate gray - matches Lucidchart
  },
  style: {
    strokeWidth: 1.5,  // Slightly thicker for visibility
    stroke: '#64748b', // Slate gray
  },
}
```

---

### FILE 2: `src/stores/editorStore.ts`

**Match the arrow size in onConnect:**

```tsx
// Lines 192-201 - REPLACE WITH:
markerEnd: {
  type: MarkerType.ArrowClosed,
  width: 8,    // Changed from 18
  height: 8,   // Changed from 18
  color: '#64748b',
},
style: {
  strokeWidth: 1.5,
  stroke: '#64748b',
},
```

---

### FILE 3: `src/styles/index.css`

**Replace the entire React Flow styling section (lines 84-239) with:**

```css
/* ========== REACT FLOW - LUCIDCHART STYLE ========== */

/* Base node styling */
.react-flow__node {
  transition: box-shadow 0.15s ease;
}

/* Node being dragged */
.react-flow__node.dragging {
  cursor: grabbing !important;
  z-index: 1000 !important;
}

.react-flow__node.dragging > div {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* ========== CONNECTION HANDLES ========== */

/* Base handle - hidden by default, smooth transitions */
.react-flow__handle {
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.15s ease, background-color 0.15s ease;
}

/* Show handles on node hover or selection */
.react-flow__node:hover .react-flow__handle,
.react-flow__node.selected .react-flow__handle {
  opacity: 1;
}

/* Show all handles during connection drag */
.react-flow__node .react-flow__handle {
  /* Will be shown via !opacity-100 class when connection in progress */
}

/* Custom handle style - Lucidchart periwinkle blue circles */
.react-flow__handle.custom-handle {
  width: 8px !important;
  height: 8px !important;
  min-width: 8px !important;
  min-height: 8px !important;
  background-color: #a5b4fc !important; /* Indigo-300 - periwinkle */
  border: 1.5px solid #6366f1 !important; /* Indigo-500 */
  border-radius: 50% !important;
  cursor: crosshair !important;
  z-index: 10 !important;
}

/* Handle hover - slightly larger and brighter */
.react-flow__handle.custom-handle:hover {
  background-color: #818cf8 !important; /* Indigo-400 */
  border-color: #4f46e5 !important; /* Indigo-600 */
  transform: scale(1.15);
}

/* Valid connection target - green highlight */
.react-flow__handle.custom-handle.valid-target {
  background-color: #86efac !important; /* Green-300 */
  border-color: #22c55e !important; /* Green-500 */
  transform: scale(1.2);
}

/* Active connection in progress */
.react-flow__handle.connecting {
  background-color: #4ade80 !important;
  border-color: #16a34a !important;
}

/* ========== CONNECTION LINE (while dragging) ========== */

.react-flow__connection-line {
  stroke: #22c55e;
  stroke-width: 2;
}

.react-flow__connection-path {
  stroke: #22c55e;
  stroke-dasharray: 6, 4;
  animation: connectionDash 0.5s linear infinite;
}

@keyframes connectionDash {
  to {
    stroke-dashoffset: -10;
  }
}

/* ========== EDGES ========== */

.react-flow__edge-path {
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Edge hover */
.react-flow__edge:hover .react-flow__edge-path {
  stroke: #3b82f6 !important;
  stroke-width: 2px !important;
  cursor: pointer;
}

/* Edge selected */
.react-flow__edge.selected .react-flow__edge-path {
  stroke: #3b82f6 !important;
  stroke-width: 2px !important;
}

/* Ensure SVG doesn't clip markers */
.react-flow svg {
  overflow: visible;
}

/* ========== RESIZE HANDLES - LUCIDCHART STYLE ========== */

/* Selection border */
.react-flow__resize-control.line {
  border: 1px solid #3b82f6 !important;
  background: transparent !important;
  border-radius: 0 !important;
}

/* Resize handle squares */
.react-flow__resize-control[class*="handle"] {
  width: 8px !important;
  height: 8px !important;
  background: #3b82f6 !important;
  border: 1px solid #1d4ed8 !important;
  border-radius: 2px !important;
  z-index: 100 !important;
}

/* Resize handle hover */
.react-flow__resize-control[class*="handle"]:hover {
  background: #2563eb !important;
  transform: scale(1.1);
}

/* Cursor styles for resize handles */
.react-flow__resize-control[class*="nw"],
.react-flow__resize-control[class*="se"] { cursor: nwse-resize !important; }
.react-flow__resize-control[class*="ne"],
.react-flow__resize-control[class*="sw"] { cursor: nesw-resize !important; }
.react-flow__resize-control[class*="handle-n"]:not([class*="nw"]):not([class*="ne"]),
.react-flow__resize-control[class*="handle-s"]:not([class*="sw"]):not([class*="se"]) { cursor: ns-resize !important; }
.react-flow__resize-control[class*="handle-e"]:not([class*="ne"]):not([class*="se"]),
.react-flow__resize-control[class*="handle-w"]:not([class*="nw"]):not([class*="sw"]) { cursor: ew-resize !important; }

/* ========== CLOUD ICONS ========== */

.cloud-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 2px;
  box-sizing: border-box;
}

.cloud-icon-container svg {
  width: 100% !important;
  height: 100% !important;
  object-fit: contain;
}
```

---

### FILE 4: `src/components/editor/edges/LabeledEdge.tsx`

**Improve edge routing logic for cleaner straight lines:**

Replace lines 149-217 with:

```tsx
  // Smart edge routing - Lucidchart style
  const deltaX = Math.abs(targetX - sourceX)
  const deltaY = Math.abs(targetY - sourceY)

  // Detect connection direction
  const isHorizontalConnection =
    (sourcePosition === 'left' && targetPosition === 'right') ||
    (sourcePosition === 'right' && targetPosition === 'left')

  const isVerticalConnection =
    (sourcePosition === 'top' && targetPosition === 'bottom') ||
    (sourcePosition === 'bottom' && targetPosition === 'top')

  // Use straight line when:
  // 1. Horizontal connection with small vertical offset (<40% of horizontal distance)
  // 2. Vertical connection with small horizontal offset (<40% of vertical distance)
  const useStraightLine =
    (isHorizontalConnection && deltaX > 20 && deltaY / deltaX < 0.4) ||
    (isVerticalConnection && deltaY > 20 && deltaX / deltaY < 0.4)

  let edgePath: string
  let labelX: number
  let labelY: number

  // Snap-to-straight threshold (pixels)
  const SNAP_THRESHOLD = 40

  if (useStraightLine) {
    // Calculate final coordinates with snap-to-straight
    let finalSourceX = sourceX
    let finalSourceY = sourceY
    let finalTargetX = targetX
    let finalTargetY = targetY

    if (isHorizontalConnection && deltaY <= SNAP_THRESHOLD) {
      // Snap to perfectly horizontal
      const midY = (sourceY + targetY) / 2
      finalSourceY = midY
      finalTargetY = midY
    } else if (isVerticalConnection && deltaX <= SNAP_THRESHOLD) {
      // Snap to perfectly vertical
      const midX = (sourceX + targetX) / 2
      finalSourceX = midX
      finalTargetX = midX
    }

    ;[edgePath, labelX, labelY] = getStraightPath({
      sourceX: finalSourceX,
      sourceY: finalSourceY,
      targetX: finalTargetX,
      targetY: finalTargetY,
    })
  } else {
    // Use smoothstep for diagonal/complex connections
    ;[edgePath, labelX, labelY] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      borderRadius: 8,
    })
  }
```

---

### FILE 5: `src/components/editor/nodes/CustomNode.tsx`

**Ensure NodeResizer matches Lucidchart style:**

Lines 1064-1082 should be:

```tsx
      {/* NodeResizer - Lucidchart style: blue squares */}
      <NodeResizer
        isVisible={selected && !locked}
        minWidth={minWidth}
        minHeight={minHeight}
        keepAspectRatio={false}
        handleClassName="nodrag"
        handleStyle={{
          width: 8,
          height: 8,
          borderRadius: 2,
          backgroundColor: '#3b82f6',
          border: '1px solid #1d4ed8',
        }}
        lineStyle={{
          borderWidth: 1,
          borderColor: '#3b82f6',
          borderStyle: 'solid',
        }}
      />
```

---

## ✅ VISUAL COMPARISON CHECKLIST

After implementing, compare side-by-side with Lucidchart:

### Edges:
- [ ] Arrow heads are small triangles (~8px)
- [ ] Line color is slate gray (#64748b)
- [ ] Line thickness is thin but visible (~1.5px)
- [ ] Perfectly straight for horizontal/vertical aligned shapes
- [ ] No visible gaps at connection points

### Connection Handles:
- [ ] Periwinkle/light blue circles (#a5b4fc)
- [ ] ~8px diameter
- [ ] Dark blue border (#6366f1)
- [ ] Appear on hover and selection
- [ ] Turn green when valid drop target

### Resize Handles:
- [ ] Blue squares (#3b82f6)
- [ ] ~8px size
- [ ] Visible at all 8 positions when selected
- [ ] Blue selection border around shape

### Overall Feel:
- [ ] Clean and professional
- [ ] Minimal visual noise
- [ ] Smooth interactions
- [ ] Matches Lucidchart aesthetic

---

## 🎨 COLOR REFERENCE

| Element | Lucidchart | Hex Code |
|---------|------------|----------|
| Edge line | Slate gray | #64748b |
| Arrow marker | Slate gray | #64748b |
| Connection handle | Periwinkle | #a5b4fc |
| Connection handle border | Indigo | #6366f1 |
| Resize handle | Blue | #3b82f6 |
| Resize handle border | Dark blue | #1d4ed8 |
| Selection border | Blue | #3b82f6 |
| Valid target | Green | #22c55e |

---

## 📁 FILES TO MODIFY

| File | What to Change |
|------|----------------|
| `DiagramEditor.tsx` | Arrow size 18→8, color to slate |
| `editorStore.ts` | Arrow size 18→8, color to slate |
| `index.css` | Complete handle and edge styling |
| `LabeledEdge.tsx` | Better straight line snap logic |
| `CustomNode.tsx` | NodeResizer handle style |

---

## 🚀 IMPLEMENTATION ORDER

1. **First**: Fix arrow size (DiagramEditor.tsx + editorStore.ts)
   - This alone will make huge visual improvement

2. **Second**: Update CSS (index.css)
   - Handle colors and sizes

3. **Third**: Improve edge routing (LabeledEdge.tsx)
   - Better straight line snapping

4. **Fourth**: Adjust NodeResizer (CustomNode.tsx)
   - Match resize handle style

5. **Finally**: Test everything visually
   - Compare with Lucidchart screenshot

---

## ⚠️ DO NOT CHANGE

- Shape rendering logic (works correctly)
- Cloud icon components (working)
- Properties panel functionality
- Undo/redo system
- Keyboard shortcuts
- Drag and drop from shape panel
- Any Supabase/auth functionality

Focus ONLY on the visual styling of edges, handles, and selection.
