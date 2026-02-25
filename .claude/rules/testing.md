# Testing Rules

## Requirements

### Minimum Coverage: 80%
- Stores: 90%
- Services: 85%
- Hooks: 80%
- Components: 70%
- Utils: 95%

### Every PR Must Have Tests
- New features need unit tests
- Bug fixes need regression tests
- Refactors must pass existing tests

## Test Structure

### AAA Pattern
```typescript
it('should add a node to the canvas', () => {
  // Arrange
  const store = createEditorStore()
  const initialCount = store.getState().nodes.length

  // Act
  store.getState().addNode('rectangle', { x: 100, y: 100 })

  // Assert
  expect(store.getState().nodes.length).toBe(initialCount + 1)
})
```

### Descriptive Names
```typescript
// ✅ Good - describes behavior
it('should display error message when login fails')
it('should navigate to dashboard after successful login')

// ❌ Bad - vague
it('works correctly')
it('handles the error')
```

## Store Tests

```typescript
import { createEditorStore } from './editorStore'

describe('editorStore', () => {
  let store: ReturnType<typeof createEditorStore>

  beforeEach(() => {
    store = createEditorStore()
  })

  describe('addNode', () => {
    it('should add node with correct position', () => {
      store.getState().addNode('rectangle', { x: 100, y: 200 })

      const node = store.getState().nodes[0]
      expect(node.position).toEqual({ x: 100, y: 200 })
    })

    it('should set isDirty flag', () => {
      store.getState().addNode('rectangle', { x: 0, y: 0 })
      expect(store.getState().isDirty).toBe(true)
    })
  })
})
```

## Service Tests

```typescript
import { diagramService } from './diagramService'
import { supabase } from './supabase'

vi.mock('./supabase')

describe('diagramService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should return diagrams from database', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [{ id: '1', name: 'Test' }],
          error: null,
        }),
      } as any)

      const result = await diagramService.getAll()

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Test')
    })

    it('should throw on database error', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: null,
          error: new Error('DB Error'),
        }),
      } as any)

      await expect(diagramService.getAll()).rejects.toThrow()
    })
  })
})
```

## Component Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { DiagramCard } from './DiagramCard'

describe('DiagramCard', () => {
  const mockDiagram = {
    id: '1',
    name: 'Test Diagram',
    nodes: [],
    edges: [],
    updatedAt: new Date().toISOString(),
  }

  it('should render diagram name', () => {
    render(<DiagramCard diagram={mockDiagram} onClick={vi.fn()} />)

    expect(screen.getByText('Test Diagram')).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const onClick = vi.fn()
    render(<DiagramCard diagram={mockDiagram} onClick={onClick} />)

    fireEvent.click(screen.getByRole('article'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
```

## Hook Tests

```typescript
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { useDiagrams } from './useDiagrams'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useDiagrams', () => {
  it('should return diagrams after loading', async () => {
    const { result } = renderHook(() => useDiagrams(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.diagrams).toBeDefined()
  })
})
```

## E2E Tests (Playwright)

```typescript
import { test, expect } from '@playwright/test'

test.describe('Diagram Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/editor/new')
  })

  test('should add a shape to canvas', async ({ page }) => {
    // Drag shape from panel
    await page.dragAndDrop(
      '[data-shape="rectangle"]',
      '.react-flow__pane'
    )

    // Verify shape exists
    await expect(page.locator('.react-flow__node')).toBeVisible()
  })

  test('should export diagram to PNG', async ({ page }) => {
    // Add a shape first
    await page.dragAndDrop('[data-shape="rectangle"]', '.react-flow__pane')

    // Open export menu
    await page.click('[data-testid="export-menu"]')
    await page.click('[data-testid="export-png"]')

    // Verify download started
    const download = await page.waitForEvent('download')
    expect(download.suggestedFilename()).toContain('.png')
  })
})
```

## Test Commands

```bash
# Run all tests
npm run test

# Watch mode
npm run test -- --watch

# Coverage report
npm run test -- --coverage

# Specific file
npm run test -- editorStore

# E2E tests
npm run test:e2e

# E2E with UI
npm run test:e2e -- --ui
```
