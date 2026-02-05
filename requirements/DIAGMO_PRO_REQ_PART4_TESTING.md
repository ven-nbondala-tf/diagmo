# DIAGMO PRO - Requirements Document
## Part 4: Testing Strategy, CI/CD & Complete Checklist

---

## TESTING STRATEGY

### Testing Philosophy
1. **Test after every feature** - Write tests immediately after implementing each feature
2. **Regression testing** - Run all tests before each commit
3. **No merge without green tests** - CI blocks merge if tests fail
4. **80% coverage minimum** - Enforced by CI

---

## TEST CONFIGURATION

### Vitest Configuration

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types/*',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Test Setup

**src/test/setup.ts:**
```typescript
import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

// Setup MSW
export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
```

---

## CI/CD CONFIGURATION

### GitHub Actions Workflow

**.github/workflows/ci.yml:**
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:coverage
      - name: Check coverage threshold
        run: |
          if [ ! -f coverage/coverage-summary.json ]; then
            echo "Coverage report not found"
            exit 1
          fi

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx --max-warnings 0",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "type-check": "tsc --noEmit"
  }
}
```

---

## COMPLETE IMPLEMENTATION CHECKLIST

Use this checklist to track progress. **Each checkbox must be verified before moving to next phase.**

---

### ✅ PHASE 1: Project Setup & Authentication (Week 1-2)

#### Project Setup
- [ ] Run: `npm create vite@latest diagmo-pro -- --template react-ts`
- [ ] Run: `cd diagmo-pro`
- [ ] Run: `npm install @xyflow/react zustand @tanstack/react-query zod`
- [ ] Run: `npm install react-router-dom @supabase/supabase-js`
- [ ] Run: `npm install date-fns nanoid lucide-react`
- [ ] Run: `npm install html-to-image jspdf`
- [ ] Run: `npm install tailwindcss postcss autoprefixer`
- [ ] Run: `npx tailwindcss init -p`
- [ ] Run: `npm install -D vitest @testing-library/react @testing-library/jest-dom`
- [ ] Run: `npm install -D @playwright/test msw`
- [ ] Configure tailwind.config.js
- [ ] Configure vite.config.ts with path aliases
- [ ] Create folder structure as specified in Part 1
- [ ] Create src/styles/globals.css with Tailwind directives

#### Supabase Setup
- [ ] Create account at supabase.com
- [ ] Create new project
- [ ] Go to SQL Editor, run database schema from Part 1
- [ ] Copy Project URL and anon key
- [ ] Create .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- [ ] Add .env to .gitignore
- [ ] Create src/services/supabase.ts

#### Authentication Implementation
- [ ] Create src/stores/authStore.ts (copy from Part 2)
- [ ] Create src/pages/LoginPage.tsx (copy from Part 2)
- [ ] Create src/pages/SignupPage.tsx
- [ ] Create src/components/auth/ProtectedRoute.tsx
- [ ] Create src/app/App.tsx with routing

#### Phase 1 Tests
- [ ] Create src/test/setup.ts
- [ ] Create src/stores/__tests__/authStore.test.ts
- [ ] Run: `npm run test` - ALL TESTS MUST PASS

#### Phase 1 Verification
- [ ] Run: `npm run dev`
- [ ] Navigate to /login - page renders
- [ ] Navigate to /signup - page renders
- [ ] Sign up with new email - succeeds
- [ ] Log out
- [ ] Log in with created email - succeeds
- [ ] Navigate to /dashboard when logged out - redirects to /login
- [ ] Refresh page when logged in - stays logged in

---

### ✅ PHASE 2: Core Editor (Week 3-4)

#### React Flow Setup
- [ ] Create src/types/diagram.types.ts (copy from Part 2)
- [ ] Create src/stores/diagramStore.ts (copy from Part 2)
- [ ] Create src/stores/uiStore.ts

#### Custom Nodes
- [ ] Create src/components/editor/nodes/RectangleNode.tsx
- [ ] Create src/components/editor/nodes/EllipseNode.tsx
- [ ] Create src/components/editor/nodes/DiamondNode.tsx
- [ ] Create src/components/editor/nodes/index.ts (export nodeTypes)

#### Editor Components
- [ ] Create src/components/editor/Canvas.tsx (copy from Part 2)
- [ ] Create src/components/editor/Toolbar.tsx
- [ ] Create src/components/editor/ShapePanel.tsx
- [ ] Create src/components/editor/PropertiesPanel.tsx

#### Editor Page
- [ ] Create src/pages/EditorPage.tsx
- [ ] Wrap with ReactFlowProvider
- [ ] Add route in App.tsx

#### Phase 2 Tests
- [ ] Create src/stores/__tests__/diagramStore.test.ts
- [ ] Test: addNode works
- [ ] Test: deleteSelected works
- [ ] Test: onConnect works
- [ ] Test: undo/redo works
- [ ] Run: `npm run test` - ALL TESTS MUST PASS

#### Phase 2 Verification
- [ ] Navigate to /editor/new
- [ ] Canvas renders with grid
- [ ] Shape panel shows shapes (Rectangle, Ellipse, Diamond)
- [ ] Drag rectangle from panel - shape appears on canvas
- [ ] Click on shape - selection handles appear
- [ ] Drag corner handle - shape resizes
- [ ] Drag from right handle of shape 1 to shape 2 - connector appears
- [ ] Connector has arrow marker
- [ ] Press Delete - selected shape is removed
- [ ] Ctrl+Z - shape reappears (undo)

---

### ✅ PHASE 3: Persistence (Week 5)

#### Services
- [ ] Create src/services/diagramService.ts (copy from Part 3)

#### Hooks
- [ ] Create src/hooks/useDiagrams.ts (copy from Part 3)
- [ ] Create src/hooks/useAutoSave.ts (copy from Part 3)

#### Dashboard
- [ ] Create src/pages/DashboardPage.tsx (copy from Part 3)
- [ ] Create src/components/dashboard/DiagramCard.tsx

#### Editor Integration
- [ ] Update EditorPage to load diagram by ID
- [ ] Add auto-save functionality
- [ ] Add manual save button

#### Phase 3 Tests
- [ ] Create src/test/mocks/handlers.ts (MSW handlers)
- [ ] Create src/pages/__tests__/DashboardPage.test.ts
- [ ] Run: `npm run test` - ALL TESTS MUST PASS

#### Phase 3 Verification
- [ ] Navigate to /dashboard
- [ ] Dashboard shows "My Diagrams" heading
- [ ] Click "New Diagram" button - dialog opens
- [ ] Enter name and click Create - navigates to editor
- [ ] Add shapes to diagram
- [ ] Wait 30 seconds - auto-save triggers (check console)
- [ ] Refresh page - diagram loads with shapes
- [ ] Return to dashboard - diagram appears in list
- [ ] Click diagram card - opens in editor
- [ ] Click menu → Delete - diagram is removed

---

### ✅ PHASE 4: Advanced Editor (Week 6-7)

#### More Shapes
- [ ] Create TerminatorNode.tsx (rounded rectangle for start/end)
- [ ] Create ProcessNode.tsx (rectangle for process)
- [ ] Create DocumentNode.tsx (wavy bottom)
- [ ] Create CylinderNode.tsx (database)
- [ ] Add all to nodeTypes in index.ts
- [ ] Add all to ShapePanel

#### Cloud Icons
- [ ] Download AWS Architecture Icons from aws.amazon.com/architecture/icons/
- [ ] Download Azure icons from learn.microsoft.com/azure/architecture/icons/
- [ ] Download GCP icons from cloud.google.com/icons
- [ ] Place icons in public/icons/aws/, public/icons/azure/, public/icons/gcp/
- [ ] Create src/constants/cloudIcons.ts (copy from Part 3)
- [ ] Create src/components/editor/nodes/CloudIconNode.tsx (copy from Part 3)
- [ ] Add CloudIconNode to nodeTypes
- [ ] Add AWS, Azure, GCP sections to ShapePanel

#### Properties Panel
- [ ] Add fill color picker
- [ ] Add stroke color picker
- [ ] Add stroke width selector
- [ ] Wire up to update selected node

#### Phase 4 Tests
- [ ] Create tests for CloudIconNode
- [ ] Create tests for PropertiesPanel
- [ ] Run: `npm run test` - ALL TESTS MUST PASS

#### Phase 4 Verification
- [ ] All flowchart shapes available in ShapePanel
- [ ] AWS section shows icons (EC2, Lambda, S3, etc.)
- [ ] Azure section shows icons
- [ ] GCP section shows icons
- [ ] Drag AWS EC2 icon - appears on canvas with correct icon
- [ ] Select shape - properties panel shows options
- [ ] Change fill color - shape updates
- [ ] Change stroke color - shape updates

---

### ✅ PHASE 5: Export & Polish (Week 8)

#### Export
- [ ] Create src/hooks/useExport.ts (copy from Part 3)
- [ ] Add Export buttons to Toolbar
- [ ] Add Export menu (PNG, SVG, PDF options)

#### Keyboard Shortcuts
- [ ] Create src/hooks/useKeyboardShortcuts.ts
- [ ] Implement Ctrl+S (save)
- [ ] Implement Ctrl+Z (undo)
- [ ] Implement Ctrl+Y (redo)
- [ ] Implement Ctrl+C (copy)
- [ ] Implement Ctrl+V (paste)
- [ ] Implement Delete (delete selected)
- [ ] Implement Escape (deselect)

#### UI Polish
- [ ] Add loading spinners where needed
- [ ] Add error boundaries
- [ ] Add toast notifications for save/export
- [ ] Make layout responsive
- [ ] Add tooltips to buttons

#### Phase 5 Tests
- [ ] Test export functions
- [ ] Run: `npm run test` - ALL TESTS MUST PASS

#### Phase 5 Verification
- [ ] Add shapes to canvas
- [ ] Click Export → PNG - file downloads
- [ ] Open downloaded PNG - shows diagram
- [ ] Click Export → SVG - file downloads
- [ ] Click Export → PDF - file downloads
- [ ] Ctrl+Z - undoes last action
- [ ] Ctrl+S - saves diagram
- [ ] UI looks good on mobile viewport

---

### ✅ PHASE 6: Folders (Week 9)

- [ ] Create folder service
- [ ] Create folder UI in sidebar
- [ ] Implement folder creation
- [ ] Implement move diagram to folder
- [ ] Test folder functionality

---

### ✅ PHASE 7: Final Testing & Launch (Week 10)

#### Testing
- [ ] Run: `npm run test:coverage`
- [ ] Verify coverage > 80%
- [ ] Run: `npm run test:e2e`
- [ ] All E2E tests pass

#### Deployment
- [ ] Create Vercel account
- [ ] Connect GitHub repository
- [ ] Add environment variables in Vercel
- [ ] Deploy to production
- [ ] Test production deployment

#### Final Verification
- [ ] Create new account on production
- [ ] Create diagram
- [ ] Add shapes and cloud icons
- [ ] Save diagram
- [ ] Refresh - diagram loads
- [ ] Export to PNG
- [ ] Everything works

---

## COMMAND REFERENCE

```bash
# Development
npm run dev                 # Start dev server at localhost:5173

# Testing (RUN AFTER EACH FEATURE)
npm run test               # Run tests in watch mode
npm run test:run           # Run tests once
npm run test:coverage      # Run tests with coverage report

# E2E Testing
npm run test:e2e           # Run Playwright tests

# Build
npm run build              # Build for production
npm run preview            # Preview production build

# Code Quality
npm run lint               # Check for lint errors
npm run type-check         # TypeScript type checking
```

---

## CRITICAL RULES FOR CLAUDE CODE

1. **NO DEVIATION from tech stack** - Use ONLY the specified libraries
2. **Test after EVERY feature** - Run `npm run test` before moving on
3. **Follow folder structure EXACTLY** - Do not create different structure
4. **Copy code from requirements** - Use the exact code provided
5. **Verify each checkbox** - Manually test each item before checking off
6. **Fix failing tests immediately** - Do not proceed with failing tests
7. **Use TypeScript strictly** - No `any` types unless absolutely necessary
8. **Keep components small** - One component per file
9. **Use provided patterns** - Follow the code patterns in this document

---

*End of Requirements Document - Part 4*
