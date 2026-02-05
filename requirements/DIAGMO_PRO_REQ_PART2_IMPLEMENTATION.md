# DIAGMO PRO - Requirements Document
## Part 2: Detailed Implementation Steps

---

## PHASE 1: PROJECT SETUP & AUTHENTICATION (Week 1-2)

### Step 1.1: Create Project

```bash
# Create new Vite React TypeScript project
npm create vite@latest diagmo-pro -- --template react-ts
cd diagmo-pro

# Install core dependencies
npm install @xyflow/react zustand @tanstack/react-query zod
npm install react-router-dom @supabase/supabase-js
npm install date-fns nanoid lucide-react
npm install html-to-image jspdf

# Install UI dependencies
npm install tailwindcss postcss autoprefixer
npm install class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-accordion @radix-ui/react-tooltip
npm install @radix-ui/react-context-menu @radix-ui/react-tabs

# Install dev dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test msw @types/node
npm install -D eslint @typescript-eslint/eslint-plugin
npm install -D prettier eslint-config-prettier
```

### Step 1.2: Configure TailwindCSS

**tailwind.config.js:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
    },
  },
  plugins: [],
}
```

### Step 1.3: Setup Supabase

1. Create Supabase project at https://supabase.com
2. Get project URL and anon key
3. Create `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**src/services/supabase.ts:**
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

### Step 1.4: Implement Authentication

**src/stores/authStore.ts:**
```typescript
import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      set({
        user: session?.user ?? null,
        session,
        isAuthenticated: !!session,
        isLoading: false,
      });

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          user: session?.user ?? null,
          session,
          isAuthenticated: !!session,
        });
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isLoading: false });
    }
  },

  signUp: async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) throw error;

    // Create profile
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        email: data.user.email!,
        full_name: fullName,
      });
    }
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    set({ user: null, session: null, isAuthenticated: false });
  },
}));
```

### Step 1.5: Create Auth Pages

**src/pages/LoginPage.tsx:**
```typescript
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';

export const LoginPage = () => {
  const navigate = useNavigate();
  const signIn = useAuthStore((state) => state.signIn);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Diagmo Pro</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};
```

### Step 1.6: Protected Route Component

**src/components/auth/ProtectedRoute.tsx:**
```typescript
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
```

### Step 1.7: Setup Routing

**src/app/App.tsx:**
```typescript
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { EditorPage } from '@/pages/EditorPage';

const queryClient = new QueryClient();

function App() {
  const initialize = useAuthStore((state) => state.initialize);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} 
          />
          <Route 
            path="/signup" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <SignupPage />} 
          />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editor/:diagramId"
            element={
              <ProtectedRoute>
                <EditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editor/new"
            element={
              <ProtectedRoute>
                <EditorPage />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
```

### Step 1.8: Write Tests for Phase 1

**src/stores/__tests__/authStore.test.ts:**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../authStore';

// Mock Supabase
vi.mock('@/services/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({
      insert: vi.fn(),
    })),
  },
}));

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,
    });
  });

  it('should have initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should update state on successful sign in', async () => {
    // Test implementation
  });
});
```

### Step 1.9: Phase 1 Checklist

Before moving to Phase 2, verify:

- [ ] Project created with all dependencies
- [ ] TailwindCSS configured and working
- [ ] Supabase project created with database schema
- [ ] Environment variables set up
- [ ] Login page renders and works
- [ ] Signup page renders and works
- [ ] User can create account
- [ ] User can log in
- [ ] User can log out
- [ ] Protected routes redirect to login
- [ ] Auth state persists on refresh
- [ ] All tests pass: `npm run test`

---

## PHASE 2: CORE EDITOR (Week 3-4)

### Step 2.1: Create Diagram Types

**src/types/diagram.types.ts:**
```typescript
import { Node, Edge, Viewport } from '@xyflow/react';

export interface DiagramData {
  nodes: Node[];
  edges: Edge[];
  viewport: Viewport;
}

export interface Diagram {
  id: string;
  user_id: string;
  folder_id: string | null;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  data: DiagramData;
  is_template: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export type NodeType = 
  | 'rectangle'
  | 'ellipse'
  | 'diamond'
  | 'roundedRectangle'
  | 'triangle'
  | 'parallelogram'
  | 'cylinder'
  | 'cloudIcon'
  | 'terminator'
  | 'process'
  | 'decision'
  | 'document'
  | 'data';

export interface CustomNodeData {
  label: string;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  fontSize?: number;
  fontColor?: string;
  // For cloud icons
  provider?: 'aws' | 'azure' | 'gcp';
  service?: string;
  iconUrl?: string;
}
```

### Step 2.2: Create Diagram Store

**src/stores/diagramStore.ts:**
```typescript
import { create } from 'zustand';
import {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  MarkerType,
} from '@xyflow/react';
import { nanoid } from 'nanoid';

interface DiagramState {
  // Diagram metadata
  diagramId: string | null;
  diagramName: string;
  
  // React Flow state
  nodes: Node[];
  edges: Edge[];
  
  // Selection
  selectedNodes: string[];
  selectedEdges: string[];
  
  // History for undo/redo
  history: { nodes: Node[]; edges: Edge[] }[];
  historyIndex: number;
  
  // Actions
  setDiagramId: (id: string | null) => void;
  setDiagramName: (name: string) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: string, position: { x: number; y: number }, data?: any) => void;
  updateNode: (nodeId: string, data: Partial<Node>) => void;
  deleteSelected: () => void;
  selectNode: (nodeId: string, addToSelection?: boolean) => void;
  selectEdge: (edgeId: string, addToSelection?: boolean) => void;
  clearSelection: () => void;
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  loadDiagram: (data: { nodes: Node[]; edges: Edge[] }) => void;
  resetDiagram: () => void;
}

export const useDiagramStore = create<DiagramState>((set, get) => ({
  diagramId: null,
  diagramName: 'Untitled Diagram',
  nodes: [],
  edges: [],
  selectedNodes: [],
  selectedEdges: [],
  history: [],
  historyIndex: -1,

  setDiagramId: (id) => set({ diagramId: id }),
  setDiagramName: (name) => set({ diagramName: name }),
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },

  onConnect: (connection) => {
    const newEdge: Edge = {
      ...connection,
      id: `edge-${nanoid()}`,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { strokeWidth: 2 },
    } as Edge;

    set((state) => ({
      edges: addEdge(newEdge, state.edges),
    }));
    
    get().saveToHistory();
  },

  addNode: (type, position, data = {}) => {
    const newNode: Node = {
      id: `node-${nanoid()}`,
      type,
      position,
      data: {
        label: data.label || type.charAt(0).toUpperCase() + type.slice(1),
        fillColor: '#ffffff',
        strokeColor: '#000000',
        strokeWidth: 2,
        ...data,
      },
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
      selectedNodes: [newNode.id],
    }));
    
    get().saveToHistory();
  },

  updateNode: (nodeId, updates) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, ...updates } : node
      ),
    }));
    get().saveToHistory();
  },

  deleteSelected: () => {
    const { selectedNodes, selectedEdges } = get();
    
    set((state) => ({
      nodes: state.nodes.filter((n) => !selectedNodes.includes(n.id)),
      edges: state.edges.filter(
        (e) =>
          !selectedEdges.includes(e.id) &&
          !selectedNodes.includes(e.source) &&
          !selectedNodes.includes(e.target)
      ),
      selectedNodes: [],
      selectedEdges: [],
    }));
    
    get().saveToHistory();
  },

  selectNode: (nodeId, addToSelection = false) => {
    set((state) => ({
      selectedNodes: addToSelection
        ? [...state.selectedNodes, nodeId]
        : [nodeId],
      selectedEdges: addToSelection ? state.selectedEdges : [],
    }));
  },

  selectEdge: (edgeId, addToSelection = false) => {
    set((state) => ({
      selectedEdges: addToSelection
        ? [...state.selectedEdges, edgeId]
        : [edgeId],
      selectedNodes: addToSelection ? state.selectedNodes : [],
    }));
  },

  clearSelection: () => {
    set({ selectedNodes: [], selectedEdges: [] });
  },

  saveToHistory: () => {
    const { nodes, edges, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: [...nodes], edges: [...edges] });
    
    // Limit history to 50 entries
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      set({
        nodes: prevState.nodes,
        edges: prevState.edges,
        historyIndex: historyIndex - 1,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      set({
        nodes: nextState.nodes,
        edges: nextState.edges,
        historyIndex: historyIndex + 1,
      });
    }
  },

  loadDiagram: (data) => {
    set({
      nodes: data.nodes,
      edges: data.edges,
      history: [{ nodes: data.nodes, edges: data.edges }],
      historyIndex: 0,
      selectedNodes: [],
      selectedEdges: [],
    });
  },

  resetDiagram: () => {
    set({
      diagramId: null,
      diagramName: 'Untitled Diagram',
      nodes: [],
      edges: [],
      history: [],
      historyIndex: -1,
      selectedNodes: [],
      selectedEdges: [],
    });
  },
}));
```

### Step 2.3: Create Custom Nodes

**src/components/editor/nodes/RectangleNode.tsx:**
```typescript
import { memo } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { CustomNodeData } from '@/types/diagram.types';

export const RectangleNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as CustomNodeData;
  const {
    label = 'Rectangle',
    fillColor = '#ffffff',
    strokeColor = '#000000',
    strokeWidth = 2,
    fontSize = 14,
    fontColor = '#000000',
  } = nodeData;

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={50}
        minHeight={30}
        handleStyle={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: 'white',
          border: '2px solid #3b82f6',
        }}
        lineStyle={{
          border: '1px dashed #3b82f6',
        }}
      />

      {/* Connection Handles - All 4 sides */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
        style={{ top: -6 }}
      />

      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
        style={{ right: -6 }}
      />

      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
        style={{ bottom: -6 }}
      />

      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
        style={{ left: -6 }}
      />

      {/* Shape */}
      <div
        className="flex items-center justify-center p-2 min-w-[100px] min-h-[60px]"
        style={{
          backgroundColor: fillColor,
          border: `${strokeWidth}px solid ${strokeColor}`,
          borderRadius: '4px',
        }}
      >
        <span
          style={{
            fontSize: `${fontSize}px`,
            color: fontColor,
            textAlign: 'center',
          }}
        >
          {label}
        </span>
      </div>
    </>
  );
});

RectangleNode.displayName = 'RectangleNode';
```

### Step 2.4: Create Main Canvas Component

**src/components/editor/Canvas.tsx:**
```typescript
import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ConnectionMode,
  Panel,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useDiagramStore } from '@/stores/diagramStore';
import { useUIStore } from '@/stores/uiStore';
import { nodeTypes } from './nodes';
import { Toolbar } from './Toolbar';

export const Canvas = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    clearSelection,
  } = useDiagramStore();
  
  const { showGrid, showMinimap, snapToGrid } = useUIStore();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow/type');
      const dataString = event.dataTransfer.getData('application/reactflow/data');
      
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const data = dataString ? JSON.parse(dataString) : {};
      addNode(type, position, data);
    },
    [screenToFlowPosition, addNode]
  );

  const onPaneClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        snapToGrid={snapToGrid}
        snapGrid={[10, 10]}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode="Shift"
        selectionKeyCode="Shift"
        attributionPosition="bottom-right"
      >
        {showGrid && (
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#ddd"
          />
        )}
        
        <Controls position="bottom-left" />
        
        {showMinimap && (
          <MiniMap
            position="bottom-right"
            zoomable
            pannable
            nodeStrokeWidth={3}
          />
        )}

        <Panel position="top-center">
          <Toolbar />
        </Panel>
      </ReactFlow>
    </div>
  );
};
```

### Step 2.5: Phase 2 Tests

**src/components/editor/__tests__/Canvas.test.tsx:**
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { Canvas } from '../Canvas';

describe('Canvas', () => {
  it('should render React Flow canvas', () => {
    render(
      <ReactFlowProvider>
        <Canvas />
      </ReactFlowProvider>
    );
    
    expect(screen.getByRole('application')).toBeInTheDocument();
  });
});
```

### Step 2.6: Phase 2 Checklist

Before moving to Phase 3, verify:

- [ ] React Flow canvas renders
- [ ] Can drag shape from panel to canvas
- [ ] Shape appears at drop position
- [ ] Can select shape by clicking
- [ ] Can multi-select with Shift+click
- [ ] Can resize shape with handles
- [ ] Can connect shapes by dragging handles
- [ ] Connectors have arrow markers
- [ ] Can delete shapes with Delete key
- [ ] Properties panel shows selected shape
- [ ] Can change fill color
- [ ] Can change stroke color
- [ ] All tests pass

---

*Continue to Part 3: Persistence, Export, and Advanced Features →*
