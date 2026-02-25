# React Patterns for Diagmo Pro

## Component Structure

### Functional Components Only
```typescript
// ✅ Good
export function DiagramCard({ diagram, onClick }: DiagramCardProps) {
  return (...)
}

// ❌ Avoid
class DiagramCard extends React.Component {}
```

### Props Interface
```typescript
interface DiagramCardProps {
  diagram: Diagram
  onClick: () => void
  isShared?: boolean  // Optional props with ?
}
```

## Hooks

### Custom Hook Pattern
```typescript
// Hook returns object with data and actions
export function useDiagrams() {
  const { data, isLoading, error } = useQuery(...)

  const createDiagram = useMutation(...)
  const deleteDiagram = useMutation(...)

  return {
    diagrams: data ?? [],
    isLoading,
    error,
    createDiagram,
    deleteDiagram,
  }
}
```

### Zustand Selectors
```typescript
// ✅ Good - Only subscribes to needed state
const nodes = useEditorStore((state) => state.nodes)
const addNode = useEditorStore((state) => state.addNode)

// ❌ Bad - Subscribes to entire store
const store = useEditorStore()
```

## State Management

### Zustand Store Pattern
```typescript
interface EditorState {
  // State
  nodes: DiagramNode[]
  edges: DiagramEdge[]

  // Actions
  addNode: (type: ShapeType, position: Position) => void
  deleteNode: (id: string) => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
  nodes: [],
  edges: [],

  addNode: (type, position) => {
    set((state) => ({
      nodes: [...state.nodes, createNode(type, position)]
    }))
  },

  deleteNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter(n => n.id !== id)
    }))
  },
}))
```

### History (Undo/Redo)
```typescript
// Always push history before mutations
addNode: (type, position) => {
  get().pushHistory()  // Save current state first
  set((state) => ({
    nodes: [...state.nodes, createNode(type, position)]
  }))
}
```

## React Query Patterns

### Queries
```typescript
export function useDiagrams() {
  return useQuery({
    queryKey: ['diagrams'],
    queryFn: () => diagramService.getAll(),
    staleTime: 5 * 60 * 1000,  // 5 minutes
  })
}
```

### Mutations
```typescript
export function useCreateDiagram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateDiagramInput) =>
      diagramService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagrams'] })
      toast.success('Diagram created')
    },
    onError: (error) => {
      toast.error('Failed to create diagram')
    },
  })
}
```

## Performance

### Memoization
```typescript
// Memoize expensive computations
const sortedNodes = useMemo(
  () => nodes.sort((a, b) => a.position.y - b.position.y),
  [nodes]
)

// Memoize callbacks passed to children
const handleClick = useCallback(
  () => onClick(node.id),
  [node.id, onClick]
)
```

### Lazy Loading
```typescript
// Lazy load heavy components
const HeavyDialog = lazy(() => import('./HeavyDialog'))

// Use with Suspense
<Suspense fallback={<Loading />}>
  <HeavyDialog />
</Suspense>
```

## Error Handling

### Error Boundaries
```typescript
// Wrap async components
<ErrorBoundary fallback={<ErrorFallback />}>
  <AsyncComponent />
</ErrorBoundary>
```

### Toast Notifications
```typescript
import { toast } from 'sonner'

// Success
toast.success('Diagram saved')

// Error
toast.error('Failed to save')

// Loading
toast.promise(saveAsync(), {
  loading: 'Saving...',
  success: 'Saved!',
  error: 'Failed to save',
})
```

## Styling

### Tailwind with cn()
```typescript
import { cn } from '@/utils/cn'

<div
  className={cn(
    'base-styles',
    isActive && 'active-styles',
    isDisabled && 'disabled-styles'
  )}
/>
```

### CSS Variables for Theming
```css
/* Use CSS variables, not hardcoded colors */
.component {
  background: var(--bg-primary);
  color: var(--text-primary);
}
```
