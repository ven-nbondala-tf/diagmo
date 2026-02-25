# /test - Testing Workflow

Run tests and generate test coverage.

## Usage

```
/test                     # Run all tests
/test coverage            # Run with coverage report
/test watch               # Watch mode
/test src/stores/         # Test specific directory
/test editorStore         # Test specific file
/test e2e                 # Run Playwright E2E tests
```

## Commands

```bash
# Unit tests
npm run test

# With coverage
npm run test -- --coverage

# Watch mode
npm run test -- --watch

# Specific file
npm run test -- editorStore

# E2E tests
npm run test:e2e

# E2E with UI
npm run test:e2e -- --ui
```

## Coverage Targets

| Category | Target |
|----------|--------|
| Stores | 90% |
| Services | 85% |
| Hooks | 80% |
| Components | 70% |
| Utils | 95% |
| **Overall** | **80%** |

## Test File Locations

```
src/
├── stores/
│   ├── editorStore.ts
│   └── editorStore.test.ts    # Co-located
├── services/
│   └── __tests__/             # Test directory
│       └── service.test.ts
└── components/
    └── editor/
        └── __tests__/
            └── Component.test.tsx
```

## Writing Tests

### Store Test Template
```typescript
import { createStore } from './store'

describe('storeName', () => {
  let store: ReturnType<typeof createStore>

  beforeEach(() => {
    store = createStore()
  })

  it('should do something', () => {
    store.getState().someAction()
    expect(store.getState().someValue).toBe(expected)
  })
})
```

### Component Test Template
```typescript
import { render, screen } from '@testing-library/react'
import { Component } from './Component'

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
```

## Delegation

For TDD workflow, use:
- `@tdd-guide` for test-first development
