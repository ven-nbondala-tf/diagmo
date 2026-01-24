# Diagmo Pro - Implementation Plan

## Project Overview
**Project:** Diagmo Pro - Professional Diagramming SaaS Application
**Type:** Cloud-based diagramming tool similar to Lucidchart/draw.io
**Status:** In Progress

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 18.x, TypeScript 5.x |
| Diagramming | @xyflow/react 12.x |
| State | Zustand 4.x |
| Styling | TailwindCSS 3.x, shadcn/ui |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Testing | Vitest, React Testing Library, Playwright |
| Build | Vite 5.x |

---

## Implementation Phases

### Phase 1: Authentication
- Auth store with Zustand
- Login/Signup pages
- Protected routes
- Auth persistence with Supabase

### Phase 2: Core Editor
- React Flow canvas integration
- Custom nodes (Rectangle, Ellipse, Diamond)
- Shape panel with drag & drop
- Connection handles and connectors
- Node selection, multi-select, resize
- Properties panel

### Phase 3: Persistence
- Diagram service (CRUD operations)
- React Query hooks
- Auto-save functionality
- Dashboard page with diagram list

### Phase 4: Advanced Editor
- Additional shapes (Flowchart, UML)
- Cloud icons (AWS, Azure, GCP)
- Text editing, styling
- Grid and snap-to-grid

### Phase 5: Export & Polish
- Export to PNG/SVG/PDF
- Keyboard shortcuts
- Undo/Redo
- UI polish

### Phase 6: Folders & Organization
- Folder creation/management
- Move diagrams to folders
- Search functionality

---

## Folder Structure

```
src/
├── app/                  # App entry and providers
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard components
│   ├── editor/          # Diagram editor components
│   └── layout/          # Layout components
├── pages/               # Page components
├── stores/              # Zustand stores
├── hooks/               # Custom hooks
├── services/            # API services
├── types/               # TypeScript types
├── utils/               # Utility functions
├── constants/           # Constants
└── styles/              # Global styles
```

---

## Dependencies

### Core Dependencies
- @xyflow/react (React Flow for diagramming)
- zustand (State Management)
- @tanstack/react-query (Server State)
- react-router-dom (Routing)
- @supabase/supabase-js (Backend)
- date-fns, nanoid, lucide-react
- html-to-image, jspdf (Export)

### UI Dependencies
- tailwindcss, postcss, autoprefixer
- class-variance-authority, clsx, tailwind-merge
- @radix-ui components (shadcn/ui)

### Dev Dependencies
- vitest, @testing-library/react, @testing-library/jest-dom
- @playwright/test, msw
- eslint, prettier

---

## Verification Steps

1. Run `npm run dev` - Development server starts
2. Run `npm run test` - All tests pass
3. Run `npm run build` - Production build succeeds
4. Test authentication flow manually
5. Test diagram creation/editing/saving
6. Test export functionality
