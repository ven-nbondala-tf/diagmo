# DIAGMO PRO - Requirements Document
## Part 1: Project Overview, Tech Stack & Architecture

**Document Version:** 1.0  
**Created:** January 2025  
**Project Name:** Diagmo Pro  
**Type:** Professional Diagramming SaaS Application

---

## 1. PROJECT OVERVIEW

### 1.1 Vision
Build a professional, cloud-based diagramming application similar to Lucidchart and draw.io with:
- Intuitive drag-and-drop interface
- Real-time collaboration (future)
- Cloud storage with user authentication
- Professional export capabilities
- AI-powered features (future)

### 1.2 Core Principles
1. **Robust** - Thoroughly tested, reliable, production-ready
2. **Flexible** - Extensible architecture for future features
3. **User-Friendly** - Intuitive UI/UX like Lucidchart
4. **Performant** - Fast rendering even with complex diagrams
5. **Secure** - Proper authentication and data protection

---

## 2. TECH STACK (MANDATORY - NO DEVIATION)

### 2.1 Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.x | UI Framework |
| **TypeScript** | 5.x | Type Safety |
| **React Flow** | @xyflow/react 12.x | Diagramming Engine |
| **Zustand** | 4.x | State Management |
| **TailwindCSS** | 3.x | Styling |
| **shadcn/ui** | latest | UI Components |
| **React Router** | 6.x | Routing |
| **React Query** | 5.x (TanStack Query) | Server State |
| **Zod** | 3.x | Validation |

### 2.2 Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Supabase** | latest | Backend-as-a-Service |
| - PostgreSQL | 15.x | Database |
| - Auth | built-in | Authentication |
| - Storage | built-in | File Storage |
| - Realtime | built-in | Real-time subscriptions |

### 2.3 Testing
| Technology | Version | Purpose |
|------------|---------|---------|
| **Vitest** | 1.x | Unit Testing |
| **React Testing Library** | 14.x | Component Testing |
| **Playwright** | 1.x | E2E Testing |
| **MSW** | 2.x | API Mocking |

### 2.4 Build & Deploy
| Technology | Version | Purpose |
|------------|---------|---------|
| **Vite** | 5.x | Build Tool |
| **GitHub Actions** | - | CI/CD |
| **Vercel** | - | Hosting |

### 2.5 Additional Libraries
| Library | Purpose |
|---------|---------|
| **html-to-image** | Export to PNG/SVG |
| **jspdf** | Export to PDF |
| **nanoid** | ID Generation |
| **date-fns** | Date Formatting |
| **lucide-react** | Icons |

---

## 3. SYSTEM ARCHITECTURE

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    React App                         │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐    │    │
│  │  │  Auth    │ │ Dashboard│ │   Diagram Editor │    │    │
│  │  │  Pages   │ │  Page    │ │   (React Flow)   │    │    │
│  │  └──────────┘ └──────────┘ └──────────────────┘    │    │
│  │                      │                              │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │              Zustand Stores                   │  │    │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────────┐    │  │    │
│  │  │  │  Auth   │ │ Diagram │ │     UI      │    │  │    │
│  │  │  │  Store  │ │  Store  │ │    Store    │    │  │    │
│  │  │  └─────────┘ └─────────┘ └─────────────┘    │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       SUPABASE                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │   Auth   │ │ Database │ │ Storage  │ │ Realtime │       │
│  │          │ │(Postgres)│ │  (Files) │ │          │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Frontend Architecture

```
src/
├── app/                      # App entry and providers
│   ├── App.tsx
│   ├── main.tsx
│   └── providers/
│       ├── AuthProvider.tsx
│       └── QueryProvider.tsx
│
├── components/               # React components
│   ├── ui/                   # shadcn/ui components
│   ├── auth/                 # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── dashboard/            # Dashboard components
│   │   ├── DiagramList.tsx
│   │   ├── DiagramCard.tsx
│   │   ├── FolderTree.tsx
│   │   └── CreateDiagramModal.tsx
│   ├── editor/               # Diagram editor components
│   │   ├── DiagramEditor.tsx
│   │   ├── Canvas.tsx
│   │   ├── Toolbar.tsx
│   │   ├── ShapePanel.tsx
│   │   ├── PropertiesPanel.tsx
│   │   └── nodes/            # Custom React Flow nodes
│   │       ├── RectangleNode.tsx
│   │       ├── EllipseNode.tsx
│   │       ├── DiamondNode.tsx
│   │       ├── CloudIconNode.tsx
│   │       └── index.ts
│   └── layout/
│       ├── Header.tsx
│       └── Sidebar.tsx
│
├── pages/                    # Page components
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── DashboardPage.tsx
│   ├── EditorPage.tsx
│   └── NotFoundPage.tsx
│
├── stores/                   # Zustand stores
│   ├── authStore.ts
│   ├── diagramStore.ts
│   └── uiStore.ts
│
├── hooks/                    # Custom hooks
│   ├── useAuth.ts
│   ├── useDiagrams.ts
│   ├── useExport.ts
│   └── useKeyboardShortcuts.ts
│
├── services/                 # API services
│   ├── supabase.ts           # Supabase client
│   ├── authService.ts
│   ├── diagramService.ts
│   └── storageService.ts
│
├── types/                    # TypeScript types
│   ├── auth.types.ts
│   ├── diagram.types.ts
│   └── database.types.ts
│
├── utils/                    # Utility functions
│   ├── exportUtils.ts
│   └── helpers.ts
│
├── constants/                # Constants
│   ├── shapes.ts
│   ├── cloudIcons.ts
│   └── routes.ts
│
└── styles/                   # Global styles
    └── globals.css
```

### 3.3 Database Schema (Supabase PostgreSQL)

```sql
-- Users table (managed by Supabase Auth, extended with profiles)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Folders table
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diagrams table
CREATE TABLE diagrams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  name TEXT NOT NULL DEFAULT 'Untitled Diagram',
  description TEXT,
  thumbnail_url TEXT,
  data JSONB NOT NULL DEFAULT '{}',  -- Stores nodes, edges, viewport
  is_template BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diagram versions (for history/undo)
CREATE TABLE diagram_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagram_id UUID REFERENCES diagrams(id) ON DELETE CASCADE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagrams ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagram_versions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own folders" ON folders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own folders" ON folders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own folders" ON folders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own folders" ON folders
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own diagrams" ON diagrams
  FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can create own diagrams" ON diagrams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diagrams" ON diagrams
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diagrams" ON diagrams
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_diagrams_user_id ON diagrams(user_id);
CREATE INDEX idx_diagrams_folder_id ON diagrams(folder_id);
CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_folders_parent_id ON folders(parent_id);
```

---

## 4. FEATURE REQUIREMENTS (PRIORITY ORDER)

### Phase 1: Foundation (Week 1-2)
1. Project setup with all dependencies
2. Authentication (Login/Signup/Logout)
3. Protected routes
4. Basic dashboard layout
5. Supabase integration

### Phase 2: Core Editor (Week 3-4)
1. React Flow canvas integration
2. Basic shapes (Rectangle, Ellipse, Diamond)
3. Shape panel with drag & drop
4. Connection handles and connectors
5. Node selection and multi-select
6. Node resize
7. Properties panel

### Phase 3: Persistence (Week 5)
1. Save diagram to database
2. Load diagram from database
3. Auto-save functionality
4. Diagram list on dashboard
5. Create/Rename/Delete diagrams

### Phase 4: Advanced Editor (Week 6-7)
1. All shape types (Flowchart, UML basics)
2. Cloud icons (AWS, Azure, GCP)
3. Text editing in shapes
4. Styling (colors, borders, fonts)
5. Grid and snap-to-grid
6. Zoom controls and minimap

### Phase 5: Export & Polish (Week 8)
1. Export to PNG
2. Export to SVG
3. Export to PDF
4. Keyboard shortcuts
5. Undo/Redo
6. UI polish and responsive design

### Phase 6: Folders & Organization (Week 9)
1. Folder creation
2. Move diagrams to folders
3. Folder tree navigation
4. Search diagrams
5. Recent diagrams

### Phase 7: Testing & Launch (Week 10)
1. Complete test coverage (80%+)
2. E2E tests for critical flows
3. Performance optimization
4. Bug fixes
5. Production deployment

---

## 5. NON-FUNCTIONAL REQUIREMENTS

### 5.1 Performance
- Initial page load: < 3 seconds
- Diagram load: < 2 seconds
- Shape drag/drop: < 16ms latency (60fps)
- Support diagrams with 500+ nodes

### 5.2 Security
- All data encrypted in transit (HTTPS)
- Row Level Security on all tables
- Secure authentication with Supabase Auth
- No sensitive data in client-side storage

### 5.3 Reliability
- 99.9% uptime target
- Auto-save every 30 seconds
- Graceful error handling
- Offline indicator (no offline mode in v1)

### 5.4 Browser Support
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

### 5.5 Testing Requirements
- Unit test coverage: 80%+
- Integration test coverage: 70%+
- E2E tests for all critical user flows
- Run tests on every PR
- No merge if tests fail

---

## 6. SUCCESS CRITERIA

### 6.1 MVP Success
- [ ] User can sign up and log in
- [ ] User can create a new diagram
- [ ] User can add shapes to canvas
- [ ] User can connect shapes
- [ ] User can save diagram
- [ ] User can see saved diagrams on dashboard
- [ ] User can export diagram to PNG
- [ ] All tests pass

### 6.2 Quality Metrics
- [ ] 80%+ test coverage
- [ ] 0 critical bugs
- [ ] < 5 minor bugs
- [ ] Lighthouse score > 90

---

*Continue to Part 2: Detailed Implementation Steps →*
