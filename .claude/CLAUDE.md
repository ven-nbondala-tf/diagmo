# CLAUDE.md - Diagmo Pro

> **IMPORTANT:** When Claude Code makes any additions, modifications, or discovers new patterns while working on this project, **update this file** to reflect those changes. Keep this document as the single source of truth.

---

## 🎯 Project Overview

**Diagmo Pro** is a professional-grade, cloud-native diagramming application for creating architecture diagrams, flowcharts, and technical documentation with real-time collaboration.

| Attribute | Value |
|-----------|-------|
| **Version** | 7.0 |
| **Status** | Production Release Candidate |
| **Stack** | React 18 + TypeScript + Vite + Supabase |
| **Diagramming Engine** | React Flow 11.x |
| **State Management** | Zustand 4.x |
| **Styling** | Tailwind CSS + shadcn/ui |

---

## 📁 Project Structure

```
diagmo/
├── .claude/                 # Claude Code configuration
│   ├── CLAUDE.md           # This file - project context
│   ├── commands/           # Slash commands
│   ├── agents/             # Specialized subagents
│   ├── skills/             # Workflow definitions
│   ├── rules/              # Always-follow guidelines
│   ├── hooks/              # Trigger-based automations
│   └── docs/               # Additional documentation
├── src/
│   ├── components/
│   │   ├── auth/           # Login, Signup, AuthGuard
│   │   ├── dashboard/      # DiagramCard, Sidebar, DashboardPage
│   │   ├── editor/         # DiagramEditor, ShapePanel, MenuBar
│   │   │   ├── icons/      # Cloud provider icons (AWS, Azure, GCP)
│   │   │   ├── nodes/      # CustomNode, node types
│   │   │   ├── edges/      # LabeledEdge, edge types
│   │   │   ├── properties/ # PropertiesPanel sections
│   │   │   ├── shapes/     # Shape renderers
│   │   │   └── dialogs/    # Import/Export dialogs
│   │   ├── layout/         # Sidebar, TopBar
│   │   ├── shared/         # ErrorBoundary, Loading
│   │   └── ui/             # shadcn/ui components
│   ├── constants/          # Templates, shapes, defaults
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Route pages
│   ├── providers/          # React context providers
│   ├── services/           # API & business logic
│   ├── stores/             # Zustand state stores
│   ├── styles/             # Global CSS
│   ├── types/              # TypeScript definitions
│   └── utils/              # Utility functions
├── supabase/               # Database migrations & functions
├── public/                 # Static assets
├── e2e/                    # Playwright E2E tests
└── docs/                   # Documentation
```

---

## 🔧 Development Commands

```bash
# Development
npm run dev                 # Start development server (Vite)
npm run build              # Production build
npm run preview            # Preview production build
npm run lint               # ESLint check
npm run type-check         # TypeScript check

# Testing
npm run test               # Run Vitest unit tests
npm run test:e2e           # Run Playwright E2E tests
npm run test:coverage      # Generate coverage report

# Database
npx supabase start         # Start local Supabase
npx supabase db reset      # Reset database
npx supabase gen types     # Generate TypeScript types
```

---

## 🏗️ Architecture Overview

### State Management (Zustand Stores)

| Store | Purpose | Key Actions |
|-------|---------|-------------|
| `editorStore` | Diagram editor state | nodes, edges, history, selection |
| `authStore` | Authentication state | user, session, login/logout |
| `collaborationStore` | Real-time collab | collaborators, cursors, locks |
| `preferencesStore` | User preferences | theme, recent, favorites |
| `themeStore` | Theme management | dark/light/system mode |
| `workspaceStore` | Current workspace | active workspace context |

### Key Services

| Service | Purpose |
|---------|---------|
| `diagramService` | CRUD operations for diagrams |
| `collaborationService` | WebSocket real-time sync |
| `exportService` | PNG/SVG/PDF/JSON export |
| `mermaidParser` | Import Mermaid syntax |
| `terraformParser` | Import Terraform HCL |
| `workspaceService` | Team workspace management |

### Component Architecture

```
DiagramEditor (Main)
├── ShapePanel (Left) - Shape library, cloud icons
├── ReactFlow (Center) - Canvas with nodes/edges
│   ├── CustomNode - Renders all shape types
│   ├── LabeledEdge - Edges with smart routing
│   └── CollaboratorCursors - Real-time cursors
├── PropertiesPanel (Right) - Node/edge properties
├── MenuBar (Top) - File, Edit, View, Arrange menus
├── ZoomControls - Zoom in/out/fit
└── MiniMap - Navigation overview
```

---

## 🎨 Feature Inventory

### Core Diagramming
- [x] 50+ shape types (basic, flowchart, UML, network)
- [x] Cloud icons: AWS (30+), Azure (25+), GCP (20+), Office 365 (15+)
- [x] Smart edge routing with labels
- [x] Multi-select and group operations
- [x] Layers system (show/hide/lock)
- [x] Grid and snap-to-grid
- [x] Undo/Redo (50 levels)
- [x] Copy/Paste/Duplicate

### Collaboration
- [x] Real-time cursor tracking
- [x] Live node/edge sync
- [x] Presence indicators
- [x] Node locking during edit
- [x] Share via email with permissions

### Organization
- [x] Workspaces (Personal + Team)
- [x] Folders
- [x] Search
- [x] Favorites
- [x] Recent diagrams
- [x] Version history with diff view

### Import/Export
- [x] Export: PNG, SVG, PDF, JSON
- [x] Import: JSON, Mermaid, Terraform, Draw.io
- [x] Code export: React, HTML, Mermaid

### UI/UX
- [x] Dark theme (Supabase-inspired)
- [x] Light theme
- [x] System preference detection
- [x] Customizable keyboard shortcuts
- [x] Presentation mode
- [x] Comments and annotations

---

## 🗄️ Database Schema (Supabase)

### Core Tables

```sql
-- profiles: User profile data
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT,
  avatar_url TEXT
);

-- workspaces: Team workspaces
CREATE TABLE workspaces (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id)
);

-- diagrams: Main diagram storage
CREATE TABLE diagrams (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  workspace_id UUID REFERENCES workspaces(id),
  folder_id UUID REFERENCES folders(id),
  nodes JSONB DEFAULT '[]',
  edges JSONB DEFAULT '[]',
  thumbnail TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- diagram_presence: Real-time collaboration
CREATE TABLE diagram_presence (
  id UUID PRIMARY KEY,
  diagram_id UUID REFERENCES diagrams(id),
  user_id UUID REFERENCES auth.users(id),
  cursor_x FLOAT,
  cursor_y FLOAT,
  color TEXT
);
```

---

## ⚠️ Known Issues & Technical Debt

### Critical (Must Fix)
1. **Export produces empty files** - `exportService.ts` needs viewport fix
2. **Diagram card click not opening** - Navigation handler issue

### High Priority
3. **"Reconnecting" always shows** - Initial status should be 'connecting'
4. **Template edges connect to top** - Missing sourceHandle/targetHandle
5. **Cursor icons reversed** - Select/Pan mode CSS issue
6. **Diagram preview not showing** - Check nodes data in cards

### Medium Priority
7. **Arrow keys not panning** - Need keyboard handler in editor
8. **Grouping not visual** - Need group container node
9. **Cloud icons slow loading** - Consider lazy loading
10. **Mermaid import broken** - Parser edge cases
11. **Terraform import issues** - HCL syntax variations

---

## 📋 Coding Standards

### TypeScript
- Strict mode enabled
- Explicit return types on functions
- No `any` - use `unknown` if needed
- Prefer interfaces over types for objects
- Use `satisfies` for type narrowing

### React
- Functional components only
- Custom hooks for reusable logic
- Memoize expensive computations
- Use React.lazy for code splitting
- Error boundaries on async components

### Naming Conventions
```typescript
// Components: PascalCase
export function DiagramEditor() {}

// Hooks: camelCase with 'use' prefix
export function useDiagrams() {}

// Services: camelCase with 'Service' suffix
export const diagramService = {}

// Types: PascalCase with descriptive suffix
interface DiagramNode {}
type ShapeType = 'rectangle' | 'circle'

// Constants: SCREAMING_SNAKE_CASE
const DEFAULT_NODE_STYLE = {}
```

### File Organization
- One component per file
- Co-locate tests: `Component.tsx` + `Component.test.tsx`
- Index files for public exports
- Keep files under 400 lines (split if larger)

---

## 🧪 Testing Strategy

### Unit Tests (Vitest)
- Stores: Test all actions and selectors
- Services: Mock Supabase, test business logic
- Hooks: Use `@testing-library/react-hooks`
- Utils: Pure function tests

### E2E Tests (Playwright)
- Critical user flows
- Authentication
- Diagram CRUD
- Export/Import
- Collaboration

### Test Commands
```bash
npm run test                    # Run all unit tests
npm run test -- --watch         # Watch mode
npm run test -- --coverage      # Coverage report
npm run test:e2e               # Playwright E2E
```

---

## 🚀 Deployment

### Environment Variables
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

### Build & Deploy
```bash
npm run build                   # Creates dist/
npm run preview                 # Test production build
```

### Supabase Setup
1. Create project at supabase.com
2. Run migrations: `npx supabase db push`
3. Enable Realtime for `diagram_presence`
4. Configure Auth providers

---

## 🔄 Git Workflow

### Branch Naming
```
feature/add-export-pdf
fix/reconnecting-status
refactor/split-shape-panel
docs/update-readme
```

### Commit Messages
```
feat: add PDF export with page size options
fix: resolve reconnecting status always showing
refactor: split ShapePanel into category files
docs: update API documentation
test: add unit tests for exportService
```

### PR Process
1. Create feature branch from `main`
2. Make changes with tests
3. Run `npm run lint && npm run type-check`
4. Create PR with description
5. Get review approval
6. Squash and merge

---

## 📚 Key Files Reference

### Entry Points
- `src/main.tsx` - App entry point
- `src/App.tsx` - Root component with routing
- `src/providers/` - Context providers setup

### Core Components
- `src/components/editor/DiagramEditor.tsx` - Main editor
- `src/components/editor/ShapePanel.tsx` - Shape library
- `src/components/editor/nodes/CustomNode.tsx` - Node renderer
- `src/components/dashboard/DashboardPage.tsx` - Dashboard

### State
- `src/stores/editorStore.ts` - Editor state (38KB, largest)
- `src/stores/collaborationStore.ts` - Collab state
- `src/stores/preferencesStore.ts` - User prefs

### Services
- `src/services/collaborationService.ts` - WebSocket sync
- `src/services/exportService.ts` - Export functions
- `src/services/mermaidParser.ts` - Mermaid import

---

## 🤖 Claude Code Instructions

### When Working on This Project

1. **Always update this CLAUDE.md** when:
   - Adding new features
   - Discovering new patterns
   - Finding and fixing bugs
   - Creating new components/services/hooks
   - Changing architecture decisions

2. **Before making changes:**
   - Read relevant sections of this file
   - Check the Known Issues section
   - Review existing patterns in similar files

3. **Code quality:**
   - Run `npm run lint` before committing
   - Add tests for new functionality
   - Update types when changing data structures

4. **For bug fixes:**
   - Add issue to Known Issues if not there
   - Document the fix in commit message
   - Remove from Known Issues when fixed

### Preferred Patterns

```typescript
// Use Zustand selectors for performance
const nodes = useEditorStore((state) => state.nodes)

// Use React Query for server state
const { data, isLoading } = useDiagrams()

// Use toast for user feedback
toast.success('Diagram saved')
toast.error('Failed to export')

// Use cn() for conditional classes
className={cn('base-class', condition && 'conditional-class')}
```

### Things to Avoid

- Don't use `any` type
- Don't mutate state directly
- Don't skip error handling
- Don't hardcode colors (use CSS variables)
- Don't create components > 400 lines without splitting

---

## 📈 Roadmap

### Phase 1: Stabilization (Current)
- [ ] Fix all critical bugs
- [ ] Comprehensive testing
- [ ] Performance optimization

### Phase 2: Cloud Templates
- [ ] 15 AWS architecture templates
- [ ] 15 Azure architecture templates
- [ ] 10 GCP architecture templates
- [ ] Template gallery with search

### Phase 3: Enterprise Features
- [ ] SSO (SAML/OIDC)
- [ ] API keys for automation
- [ ] Webhooks
- [ ] Advanced audit logs

### Phase 4: Integrations
- [ ] REST API
- [ ] Slack integration
- [ ] Jira integration
- [ ] GitHub sync

### Phase 5: AI Features
- [ ] AI-assisted diagram generation
- [ ] Natural language to diagram
- [ ] Smart layout suggestions

---

## 📝 Change Log

### v7.0 (February 2026)
- Real-time collaboration with cursor tracking
- Workspace management with team roles
- Supabase-style dark UI
- Cloud icons for AWS, Azure, GCP, Office 365
- Version history with diff view
- Comments and annotations

### v6.0 (January 2026)
- Theme system (dark/light/system)
- Icon refactoring (code splitting)
- Operation-based sync

### v5.0 (December 2025)
- Initial collaboration features
- Sharing with permissions
- Node locking

---

**Last Updated:** February 8, 2026  
**Maintained by:** Claude Code (auto-updates on changes)
