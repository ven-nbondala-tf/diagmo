# Known Issues & Bug Fixes

> This document tracks all known issues and their fixes. Update this when fixing bugs.

---

## 🔴 Critical Issues

### Issue #1: Export Produces Empty Files

**Status:** Open  
**Component:** `src/services/exportService.ts`  
**Impact:** Users cannot export diagrams

**Symptoms:**
- PNG/SVG/PDF exports are blank
- No error shown to user

**Root Cause:**
The export service clones the wrong element or loses styles during clone.

**Fix:**
```typescript
// Use .react-flow__viewport instead of cloning
const viewport = wrapper.querySelector('.react-flow__viewport') as HTMLElement

// Apply transform temporarily, then restore
const originalTransform = viewport.style.transform
viewport.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`

try {
  const dataUrl = await toPng(viewport, { ... })
  return dataUrl
} finally {
  viewport.style.transform = originalTransform
}
```

---

### Issue #2: Diagram Card Click Not Opening

**Status:** Open  
**Component:** `src/components/dashboard/DiagramCard.tsx`  
**Impact:** Users can't open diagrams from dashboard

**Symptoms:**
- Clicking card does nothing
- No navigation occurs

**Debug Steps:**
1. Add console.log to onClick handler
2. Check if navigate is called
3. Verify route exists

**Fix:**
```typescript
const handleClick = () => {
  console.log('[DiagramCard] Navigating to:', diagram.id)
  onClick()  // Ensure this calls navigate
}
```

---

## 🟠 High Priority Issues

### Issue #3: "Reconnecting" Always Shows

**Status:** Open  
**Component:** `src/stores/collaborationStore.ts`

**Root Cause:**
Initial state is `'disconnected'` instead of `'connecting'`

**Fix:**
```typescript
// In collaborationStore.ts
const initialState = {
  connectionStatus: 'connecting',  // Not 'disconnected'
}

// In useCollaboration.ts - REMOVE this line:
// setConnectionStatus('disconnected')
```

---

### Issue #4: Template Edges Connect to Top

**Status:** Open  
**Component:** `src/constants/templates.ts`

**Root Cause:**
Edges missing `sourceHandle` and `targetHandle` properties.

**Fix:**
```typescript
// Add handles to all template edges
edges: [
  {
    id: 'e1',
    source: 'node1',
    target: 'node2',
    sourceHandle: 'right',   // ADD
    targetHandle: 'left',    // ADD
    type: 'smoothstep',
  },
]
```

---

### Issue #5: Cursor Icons Reversed

**Status:** Open  
**Component:** `src/components/editor/DiagramEditor.tsx`

**Root Cause:**
CSS cursor styles not matching interaction mode.

**Fix:**
```css
/* Add to styles */
.react-flow[data-interaction-mode="pan"] .react-flow__pane {
  cursor: grab;
}
.react-flow[data-interaction-mode="select"] .react-flow__pane {
  cursor: default;
}
```

```tsx
// Add data attribute
<ReactFlow
  data-interaction-mode={interactionMode}
  // ...
/>
```

---

### Issue #6: Diagram Preview Not Showing

**Status:** Open  
**Component:** `src/components/dashboard/DiagramCard.tsx`

**Symptoms:**
- Cards show empty/placeholder instead of diagram preview

**Debug:**
```typescript
console.log('[DiagramMiniPreview] nodes:', nodes?.length)
```

**Possible Causes:**
1. Diagram has no nodes saved
2. Nodes missing position data
3. Query not returning nodes

---

## 🟡 Medium Priority Issues

### Issue #7: Arrow Keys Not Panning

**Status:** Open  
**Component:** `src/hooks/useKeyboardShortcuts.ts`

**Fix:** Add to DiagramEditor.tsx:
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault()
      const { x, y, zoom } = getViewport()
      const amount = e.shiftKey ? 100 : 50
      // Pan logic...
    }
  }
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [])
```

---

### Issue #8: Grouping Not Working Visually

**Status:** Open  
**Component:** `src/stores/editorStore.ts`

**Root Cause:**
Only sets `groupId` property, doesn't create visual group container.

**Fix:** Create group node with children as parentId.

---

### Issue #9: Cloud Icons Loading Slowly

**Status:** Open  
**Component:** `src/components/editor/ShapePanel.tsx`

**Fix Options:**
1. Lazy load by category
2. Virtualize icon list
3. Use image URLs instead of SVG components

---

### Issue #10: Mermaid Import Broken

**Status:** Open  
**Component:** `src/services/mermaidParser.ts`

**Debug:** Add logging to parser functions.

---

### Issue #11: Terraform Import Issues

**Status:** Open  
**Component:** `src/services/terraformParser.ts`

**Debug:** Check HCL syntax handling.

---

## ✅ Resolved Issues

_Move issues here when fixed_

### Example: [Issue Name]
**Fixed in:** v7.0  
**Commit:** abc123  
**Summary:** Description of fix

---

## How to Use This Document

### When Finding a Bug
1. Check if it's already listed here
2. If not, add it with:
   - Status
   - Component
   - Symptoms
   - Root cause (if known)
   - Fix (if known)

### When Fixing a Bug
1. Update status to "In Progress"
2. Add your fix details
3. Move to "Resolved" when done
4. Update CLAUDE.md Known Issues section
