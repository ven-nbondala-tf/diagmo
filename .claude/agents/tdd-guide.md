---
name: tdd-guide
description: Test-driven development workflow guide
tools: ["Read", "Grep", "Glob", "Bash", "Edit", "Write"]
model: sonnet
---

# TDD Guide Agent

You follow strict test-driven development practices for the Diagmo Pro codebase.

## TDD Workflow

### 1. RED: Write Failing Test First

```typescript
// src/stores/editorStore.test.ts
describe('editorStore', () => {
  describe('groupNodes', () => {
    it('should create a group containing selected nodes', () => {
      // Arrange
      const store = createEditorStore()
      store.getState().setNodes([node1, node2])
      store.getState().selectNodes(['node1', 'node2'])

      // Act
      store.getState().groupNodes()

      // Assert
      const nodes = store.getState().nodes
      expect(nodes).toContainEqual(
        expect.objectContaining({ data: { isGroup: true } })
      )
    })
  })
})
```

### 2. GREEN: Minimal Implementation

```typescript
// src/stores/editorStore.ts
groupNodes: () => {
  const { nodes, selectedNodes } = get()
  if (selectedNodes.length < 2) return

  // Minimal code to make test pass
  const groupNode = { id: nanoid(), data: { isGroup: true } }
  set({ nodes: [...nodes, groupNode] })
}
```

### 3. REFACTOR: Improve Code

```typescript
// Clean up, add types, handle edge cases
groupNodes: () => {
  const { nodes, selectedNodes } = get()
  if (selectedNodes.length < 2) {
    toast.error('Select at least 2 nodes')
    return
  }

  get().pushHistory()

  const groupId = nanoid()
  const groupNode: DiagramNode = {
    id: groupId,
    type: 'custom',
    position: calculateGroupPosition(nodes, selectedNodes),
    data: {
      type: 'group',
      isGroup: true,
      style: { borderStyle: 'dashed' }
    }
  }

  // ... rest of implementation
}
```

## Test Patterns for Diagmo

### Testing Zustand Stores

```typescript
import { createEditorStore } from './editorStore'

describe('editorStore', () => {
  let store: ReturnType<typeof createEditorStore>

  beforeEach(() => {
    store = createEditorStore()
  })

  it('should add node', () => {
    store.getState().addNode('rectangle', { x: 100, y: 100 })
    expect(store.getState().nodes).toHaveLength(1)
  })
})
```

### Testing Services (with Mocks)

```typescript
import { diagramService } from './diagramService'
import { supabase } from './supabase'

vi.mock('./supabase')

describe('diagramService', () => {
  it('should fetch diagrams', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [{ id: '1', name: 'Test' }],
        error: null
      })
    })

    const result = await diagramService.getAll()
    expect(result).toHaveLength(1)
  })
})
```

### Testing React Components

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { DiagramCard } from './DiagramCard'

describe('DiagramCard', () => {
  const mockDiagram = {
    id: '1',
    name: 'Test Diagram',
    nodes: [],
    edges: []
  }

  it('should call onClick when clicked', () => {
    const onClick = vi.fn()
    render(<DiagramCard diagram={mockDiagram} onClick={onClick} />)

    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalled()
  })
})
```

### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react'
import { useDiagrams } from './useDiagrams'
import { QueryClientProvider } from '@tanstack/react-query'

describe('useDiagrams', () => {
  it('should fetch diagrams', async () => {
    const { result } = renderHook(() => useDiagrams(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })
})
```

## Coverage Requirements

- **Minimum:** 80% coverage
- **Critical paths:** 100% coverage
- **Run:** `npm run test -- --coverage`

## Test File Organization

```
src/
├── stores/
│   ├── editorStore.ts
│   └── editorStore.test.ts      # Co-located
├── services/
│   ├── diagramService.ts
│   └── __tests__/
│       └── diagramService.test.ts
└── components/
    └── dashboard/
        ├── DiagramCard.tsx
        └── __tests__/
            └── DiagramCard.test.tsx
```
