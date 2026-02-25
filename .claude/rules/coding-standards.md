# Coding Standards Rules

## TypeScript

### No Any Type
```typescript
// ❌ Never
function process(data: any) {}

// ✅ Use unknown or proper type
function process(data: unknown) {}
function process(data: DiagramNode) {}
```

### Explicit Return Types
```typescript
// ✅ Required for public functions
function calculateBounds(nodes: DiagramNode[]): Bounds {
  // ...
}

// ✅ Arrow functions in components can infer
const handleClick = () => onClick(id)
```

### Prefer Interfaces
```typescript
// ✅ For object shapes
interface DiagramNode {
  id: string
  position: Position
}

// ✅ Types for unions/aliases
type ShapeType = 'rectangle' | 'circle' | 'diamond'
```

## React

### Functional Components Only
```typescript
// ✅ Always
export function Component() {}

// ❌ Never
class Component extends React.Component {}
```

### Hooks at Top Level
```typescript
// ✅ Correct
function Component() {
  const [state, setState] = useState()
  const data = useMemo(() => compute(), [])

  if (condition) return null  // Conditions after hooks

  return <div />
}
```

### Proper Dependencies
```typescript
// ✅ Include all dependencies
useEffect(() => {
  fetchData(id)
}, [id, fetchData])

// ❌ Missing dependency
useEffect(() => {
  fetchData(id)
}, [])  // id missing!
```

## State Management

### Use Zustand Selectors
```typescript
// ✅ Subscribe to specific state
const nodes = useEditorStore((s) => s.nodes)

// ❌ Subscribe to whole store
const store = useEditorStore()
```

### Push History Before Mutations
```typescript
// ✅ Always for undoable actions
deleteNode: (id) => {
  get().pushHistory()  // First!
  set((state) => ({
    nodes: state.nodes.filter(n => n.id !== id)
  }))
}
```

### No Direct Mutation
```typescript
// ❌ Mutating state
state.nodes.push(newNode)

// ✅ Create new array
set({ nodes: [...state.nodes, newNode] })
```

## Naming

### Components: PascalCase
```typescript
export function DiagramEditor() {}
export function ShapePanel() {}
```

### Hooks: use Prefix
```typescript
export function useDiagrams() {}
export function useCollaboration() {}
```

### Constants: SCREAMING_SNAKE
```typescript
const DEFAULT_NODE_STYLE = {}
const MAX_HISTORY_SIZE = 50
```

### Files: Match Export
```
DiagramEditor.tsx → export function DiagramEditor
useDiagrams.ts → export function useDiagrams
```

## File Size

### Maximum 400 Lines
- Split large components into smaller ones
- Extract hooks for complex logic
- Create sub-components for UI pieces

### One Component Per File
```
// ✅ Correct
DiagramEditor.tsx → DiagramEditor only

// ❌ Multiple exports
Editor.tsx → Editor, Sidebar, Toolbar
```

## Error Handling

### Try-Catch for Async
```typescript
async function fetchData() {
  try {
    const data = await api.fetch()
    return data
  } catch (error) {
    toast.error('Failed to fetch')
    console.error('Fetch error:', error)
    throw error
  }
}
```

### Toast for User Feedback
```typescript
// Success
toast.success('Diagram saved')

// Error
toast.error('Failed to save')

// With promise
toast.promise(saveAsync(), {
  loading: 'Saving...',
  success: 'Saved!',
  error: 'Failed',
})
```

## Imports

### Order
```typescript
// 1. React
import { useState, useCallback } from 'react'

// 2. External libraries
import { nanoid } from 'nanoid'

// 3. Internal absolute imports
import { useEditorStore } from '@/stores/editorStore'
import { DiagramNode } from '@/types'

// 4. Relative imports
import { ShapePreview } from './ShapePreview'
```

### No Circular Imports
- Services don't import from components
- Stores don't import from hooks
- Use index.ts for public exports

## Comments

### Explain Why, Not What
```typescript
// ❌ Obvious
// Increment counter
counter++

// ✅ Explains reasoning
// Use +2 because nodes are rendered with 1px borders on each side
const adjustedWidth = width + 2
```

### JSDoc for Public APIs
```typescript
/**
 * Aligns selected nodes to the specified edge
 * @param type - The alignment type ('left' | 'center' | 'right' | etc.)
 * @throws Error if no nodes selected
 */
function alignNodes(type: AlignmentType): void {}
```
