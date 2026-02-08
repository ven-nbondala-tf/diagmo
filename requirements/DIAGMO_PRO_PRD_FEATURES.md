# Diagmo Pro — Product Requirements Document (PRD)

> **Version:** 7.0  
> **Last Updated:** February 7, 2026  
> **Status:** Production Release Candidate

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [User Personas](#2-user-personas)
3. [Feature Specifications](#3-feature-specifications)
4. [Technical Architecture](#4-technical-architecture)
5. [Database Schema](#5-database-schema)
6. [UI/UX Specifications](#6-uiux-specifications)
7. [Security & Permissions](#7-security--permissions)
8. [Performance Requirements](#8-performance-requirements)
9. [Future Roadmap](#9-future-roadmap)

---

## 1. Product Overview

### 1.1 Vision Statement

Diagmo Pro is a professional-grade, cloud-native diagramming application that enables teams to create, collaborate on, and share architecture diagrams, flowcharts, and technical documentation in real-time.

### 1.2 Mission

To provide the most intuitive and powerful diagramming tool for cloud architects, developers, and technical teams, with native support for AWS, Azure, and GCP iconography.

### 1.3 Key Value Propositions

| Value | Description |
|-------|-------------|
| **Real-time Collaboration** | Multiple users can edit simultaneously with live cursor tracking |
| **Native Cloud Icons** | 100+ official AWS, Azure, GCP, and Office 365 icons |
| **Professional UI** | Modern, dark-first Supabase-inspired interface |
| **Team Workspaces** | Organize diagrams by team with role-based access |
| **Version History** | Full version control with visual diff comparison |
| **Import/Export** | Support for JSON, Mermaid, Terraform, Draw.io formats |

### 1.4 Product Metrics (KPIs)

| Metric | Target |
|--------|--------|
| Time to first diagram | < 30 seconds |
| Page load time | < 2 seconds |
| Collaboration latency | < 100ms |
| Export generation time | < 3 seconds |
| Uptime | 99.9% |

---

## 2. User Personas

### 2.1 Cloud Architect (Primary)

**Name:** Alex Chen  
**Role:** Senior Cloud Architect  
**Company Size:** Enterprise (1000+ employees)

**Goals:**
- Document complex multi-cloud architectures
- Share designs with development teams
- Maintain version history of architecture decisions
- Export diagrams for documentation

**Pain Points:**
- Existing tools lack native cloud provider icons
- No real-time collaboration
- Difficult to maintain consistent styling

### 2.2 DevOps Engineer

**Name:** Sarah Martinez  
**Role:** DevOps Lead  
**Company Size:** Mid-market (100-500 employees)

**Goals:**
- Create infrastructure diagrams from Terraform
- Document CI/CD pipelines
- Collaborate with development team

**Pain Points:**
- Manual diagram creation is time-consuming
- Diagrams become outdated quickly
- No integration with IaC tools

### 2.3 Software Developer

**Name:** James Wilson  
**Role:** Full Stack Developer  
**Company Size:** Startup (10-50 employees)

**Goals:**
- Create flowcharts for logic documentation
- Design system architecture for new features
- Share designs in pull requests

**Pain Points:**
- Need quick diagram creation
- Want to embed diagrams in documentation
- Limited budget for enterprise tools

### 2.4 Business Analyst

**Name:** Emily Thompson  
**Role:** Business Analyst  
**Company Size:** Enterprise

**Goals:**
- Create process flow diagrams
- Document business workflows
- Present to stakeholders

**Pain Points:**
- Technical tools are too complex
- Need professional-looking exports
- Collaboration with technical teams

---

## 3. Feature Specifications

### 3.1 Canvas & Diagramming

#### 3.1.1 Shape Library

| Category | Shapes | Description |
|----------|--------|-------------|
| **Basic** | Rectangle, Rounded Rectangle, Circle, Ellipse, Diamond, Triangle, Pentagon, Hexagon, Octagon, Star, Arrow, Line | Fundamental geometric shapes |
| **Flowchart** | Process, Decision, Terminator, Data, Document, Predefined Process, Manual Input, Preparation, Delay, Database | Standard flowchart symbols |
| **AWS** | EC2, S3, Lambda, RDS, DynamoDB, API Gateway, SNS, SQS, CloudFront, Route53, VPC, IAM, ECS, EKS, Bedrock, and 20+ more | Official AWS architecture icons |
| **Azure** | VM, Storage, Functions, SQL, Cosmos DB, App Service, AKS, CDN, VNet, Key Vault, Fabric, Power BI, Entra ID, and 25+ more | Official Azure architecture icons |
| **GCP** | Compute, Functions, App Engine, Cloud Run, GKE, Storage, Cloud SQL, Firestore, BigQuery, Pub/Sub, Vertex AI, and 20+ more | Official GCP architecture icons |
| **Office 365** | Word, Excel, PowerPoint, Outlook, Teams, OneDrive, SharePoint, OneNote, and 15+ more | Microsoft 365 product icons |
| **Network** | Server, Router, Switch, Firewall, Load Balancer, Database, Cloud, User, and 10+ more | Generic network diagram shapes |
| **UML** | Class, Interface, Actor, Use Case, Component, Package | UML diagram elements |

#### 3.1.2 Canvas Interactions

| Feature | Description | Keyboard Shortcut |
|---------|-------------|-------------------|
| **Select Mode** | Click to select, drag to multi-select | V |
| **Pan Mode** | Drag to pan canvas | H |
| **Zoom** | Mouse wheel or pinch to zoom | Ctrl+/Ctrl- |
| **Fit View** | Fit all nodes in viewport | Ctrl+1 |
| **Grid Toggle** | Show/hide alignment grid | Ctrl+' |
| **Snap to Grid** | Enable/disable snapping | Ctrl+Shift+' |

#### 3.1.3 Node Operations

| Operation | Description | Shortcut |
|-----------|-------------|----------|
| Add Node | Drag from shape panel or double-click canvas | - |
| Select | Click node | - |
| Multi-select | Shift+click or drag selection box | - |
| Move | Drag selected nodes | Arrow keys (1px), Shift+Arrow (10px) |
| Resize | Drag corner/edge handles | - |
| Delete | Remove selected nodes | Delete/Backspace |
| Copy | Copy to clipboard | Ctrl+C |
| Paste | Paste from clipboard | Ctrl+V |
| Duplicate | Copy and paste in place | Ctrl+D |
| Lock | Prevent editing | Ctrl+L |

#### 3.1.4 Edge/Connection Operations

| Feature | Description |
|---------|-------------|
| **Create Connection** | Drag from source handle to target handle |
| **Edge Types** | Straight, Smoothstep, Bezier |
| **Edge Labels** | Double-click edge to add/edit label |
| **Arrow Styles** | None, Arrow, ArrowClosed, Diamond |
| **Line Styles** | Solid, Dashed, Dotted |
| **Auto-routing** | Smart path finding around obstacles |

#### 3.1.5 Alignment & Distribution

| Function | Description | Requirement |
|----------|-------------|-------------|
| Align Left | Align nodes to leftmost edge | 2+ nodes selected |
| Align Center | Align nodes to horizontal center | 2+ nodes selected |
| Align Right | Align nodes to rightmost edge | 2+ nodes selected |
| Align Top | Align nodes to top edge | 2+ nodes selected |
| Align Middle | Align nodes to vertical center | 2+ nodes selected |
| Align Bottom | Align nodes to bottom edge | 2+ nodes selected |
| Distribute Horizontal | Even horizontal spacing | 3+ nodes selected |
| Distribute Vertical | Even vertical spacing | 3+ nodes selected |

#### 3.1.6 Grouping & Layers

| Feature | Description |
|---------|-------------|
| **Group** | Combine multiple nodes into a group (Ctrl+G) |
| **Ungroup** | Break group into individual nodes (Ctrl+Shift+G) |
| **Layers** | Organize nodes into named layers |
| **Layer Visibility** | Show/hide entire layers |
| **Layer Locking** | Prevent editing of layer contents |

### 3.2 File Operations

#### 3.2.1 Save & Auto-save

| Feature | Description |
|---------|-------------|
| **Auto-save** | Automatic save after 2 seconds of inactivity |
| **Manual Save** | Ctrl+S to force save |
| **Save Indicator** | Visual feedback showing save status |
| **Offline Queue** | Queue changes when offline, sync when connected |

#### 3.2.2 Export Formats

| Format | Description | Use Case |
|--------|-------------|----------|
| **PNG** | Raster image with transparency | Documentation, presentations |
| **SVG** | Vector graphics | Scalable graphics, web embedding |
| **PDF** | Portable document | Printing, formal documentation |
| **JSON** | Native diagram format | Backup, programmatic access |

#### 3.2.3 Import Formats

| Format | Description | Conversion |
|--------|-------------|------------|
| **JSON** | Native Diagmo format | Full fidelity |
| **Mermaid** | Text-based diagram syntax | Flowcharts, sequence diagrams |
| **Terraform** | Infrastructure as Code | AWS/Azure/GCP resources |
| **Draw.io** | Draw.io XML format | Basic shape conversion |

### 3.3 Collaboration

#### 3.3.1 Real-time Features

| Feature | Description |
|---------|-------------|
| **Live Cursors** | See collaborator cursor positions |
| **Presence Indicators** | See who's currently viewing |
| **Live Updates** | Instant sync of all changes |
| **Node Locking** | Automatic lock when editing to prevent conflicts |
| **Connection Status** | Visual indicator of sync status |

#### 3.3.2 Sharing

| Permission | Capabilities |
|------------|--------------|
| **Viewer** | View diagram, add comments |
| **Editor** | View, edit diagram content |
| **Admin** | View, edit, manage sharing, delete |

#### 3.3.3 Comments

| Feature | Description |
|---------|-------------|
| **Add Comment** | Click to add comment at position |
| **Thread Replies** | Reply to existing comments |
| **Resolve** | Mark comment thread as resolved |
| **Mentions** | @mention team members |
| **Notifications** | Email notifications for mentions |

### 3.4 Organization

#### 3.4.1 Workspaces

| Feature | Description |
|---------|-------------|
| **Personal Workspace** | Default workspace for individual diagrams |
| **Team Workspaces** | Shared workspace for team collaboration |
| **Workspace Switching** | Quick switch between workspaces |
| **Member Management** | Invite, remove, change roles |

#### 3.4.2 Workspace Roles

| Role | Permissions |
|------|-------------|
| **Owner** | Full control, delete workspace, transfer ownership |
| **Admin** | Manage members, all diagram permissions |
| **Editor** | Create, edit, delete own diagrams |
| **Viewer** | View diagrams only |

#### 3.4.3 Folders

| Feature | Description |
|---------|-------------|
| **Create Folder** | Organize diagrams into folders |
| **Nested Folders** | Unlimited folder depth |
| **Move Diagrams** | Move between folders |
| **Folder Sharing** | Share entire folder with permissions |

#### 3.4.4 Search & Filter

| Feature | Description |
|---------|-------------|
| **Global Search** | Search across all diagrams (Ctrl+K) |
| **Filter by Folder** | View diagrams in specific folder |
| **Filter by Tag** | Filter by assigned tags |
| **Sort Options** | Sort by name, date created, date modified |
| **Favorites** | Star diagrams for quick access |
| **Recent** | View recently opened diagrams |

### 3.5 Templates

#### 3.5.1 Built-in Templates

| Template | Category | Description |
|----------|----------|-------------|
| AWS 3-Tier Architecture | Architecture | Web app with load balancer, EC2, RDS |
| Azure Web App | Architecture | App Service with Cosmos DB |
| GCP Kubernetes | Architecture | GKE cluster with Cloud SQL |
| Basic Flowchart | Flowchart | Start, process, decision, end |
| Network Diagram | Network | Servers, routers, firewalls |
| ER Diagram | Database | Entities and relationships |

#### 3.5.2 Custom Templates

| Feature | Description |
|---------|-------------|
| **Save as Template** | Save current diagram as reusable template |
| **Template Variables** | Placeholder values to customize on use |
| **Template Sharing** | Share templates within workspace |
| **Template Gallery** | Browse and search templates |

### 3.6 Version History

| Feature | Description |
|---------|-------------|
| **Auto Versioning** | Automatic version on significant changes |
| **Manual Versioning** | Create named version checkpoint |
| **Version List** | Browse all versions with timestamps |
| **Visual Diff** | Side-by-side comparison of versions |
| **Restore Version** | Revert to any previous version |

### 3.7 Presentation Mode

| Feature | Description |
|---------|-------------|
| **Enter Presentation** | F5 or menu to enter fullscreen |
| **Navigate Frames** | Arrow keys to move between defined frames |
| **Zoom to Selection** | Auto-zoom to frame content |
| **Presenter Notes** | Hidden notes visible only to presenter |

### 3.8 AI Assistant Features ✅ (Implemented)

Diagmo Pro includes an intelligent AI-powered assistant that helps users create, optimize, and understand diagrams.

#### 3.8.1 AI Diagram Generation

| Feature | Description |
|---------|-------------|
| **Text-to-Diagram** | Generate diagrams from natural language descriptions |
| **Diagram Types** | Auto-detect or specify: flowchart, architecture, sequence, ER |
| **Cloud Provider Detection** | Automatically use AWS/Azure/GCP icons based on keywords |
| **Style Options** | Minimal, detailed, or technical styling |

**Example Prompts:**
- "Create an AWS serverless API with Lambda and DynamoDB"
- "Design an Azure microservices architecture"
- "Draw a user signup flowchart with validation"
- "Build a CI/CD pipeline diagram"

#### 3.8.2 AI Auto-Layout

| Algorithm | Description | Best For |
|-----------|-------------|----------|
| **Hierarchical** | Top-to-bottom tree layout with level grouping | Org charts, flowcharts, dependency trees |
| **Force-Directed** | Physics-based positioning with repulsion/attraction | Network diagrams, relationship maps |
| **Grid** | Even grid arrangement | Component libraries, icon galleries |

#### 3.8.3 AI Diagram Explanation

| Feature | Description |
|---------|-------------|
| **Summary** | High-level overview of diagram purpose and architecture |
| **Component Analysis** | Detailed description of each node/component and its role |
| **Data Flow** | How data/control flows through the system |
| **Improvement Suggestions** | Recommendations for architectural improvements |

#### 3.8.4 AI Smart Suggestions

| Suggestion Type | Description |
|-----------------|-------------|
| **Isolated Nodes** | Detect nodes without connections |
| **Missing Components** | Suggest common patterns (VPC, load balancer, monitoring) |
| **Best Practices** | Recommend architectural improvements based on cloud provider patterns |
| **Security Gaps** | Identify potential security considerations |

#### 3.8.5 AI Configuration

| Setting | Description |
|---------|-------------|
| **API Key** | Optional OpenAI API key for enhanced generation (GPT-4o) |
| **Local Mode** | Keyword-based generation without API (built-in, always available) |
| **Model Selection** | GPT-4o (default), or custom model endpoint |

#### 3.8.6 AI Panel UI

| Component | Description |
|-----------|-------------|
| **Mode Tabs** | Switch between Generate, Layout, Explain, Suggest modes |
| **Settings Panel** | Configure diagram type and layout algorithm |
| **Chat Interface** | Conversational history with timestamps |
| **Quick Suggestions** | Pre-built prompts for common diagram types |
| **Loading States** | Visual feedback during AI processing |

---

## 4. Technical Architecture

### 4.1 Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI Framework |
| TypeScript | 5.x | Type Safety |
| Vite | 5.x | Build Tool |
| React Flow | 11.x | Diagram Canvas Engine |
| Zustand | 4.x | State Management |
| TanStack Query | 5.x | Server State & Caching |
| Tailwind CSS | 3.x | Utility-first Styling |
| shadcn/ui | latest | UI Component Library |
| Lucide React | latest | Icon Library |

### 4.2 Backend Stack

| Technology | Purpose |
|------------|---------|
| Supabase | Backend as a Service |
| PostgreSQL | Relational Database |
| Supabase Auth | Authentication |
| Supabase Realtime | WebSocket Collaboration |
| Supabase Storage | File Storage |

### 4.3 External Services

| Service | Purpose |
|---------|---------|
| html-to-image | Export to PNG/SVG |
| jsPDF | Export to PDF |
| nanoid | ID Generation |

### 4.4 Directory Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard & diagram list
│   ├── editor/         # Diagram editor
│   │   ├── icons/      # Cloud provider icons (AWS, Azure, GCP)
│   │   ├── nodes/      # Custom React Flow nodes
│   │   ├── edges/      # Custom React Flow edges
│   │   ├── properties/ # Properties panel sections
│   │   └── shapes/     # Shape renderers
│   ├── layout/         # App layout (Sidebar, TopBar)
│   ├── shared/         # Shared components
│   └── ui/             # shadcn/ui components
├── constants/          # App constants, templates, presets
├── hooks/              # Custom React hooks
├── pages/              # Route page components
├── providers/          # React context providers
├── services/           # API & business logic services
├── stores/             # Zustand state stores
├── styles/             # Global CSS & Tailwind config
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

### 4.5 State Management

| Store | Purpose |
|-------|---------|
| `authStore` | User authentication state |
| `editorStore` | Diagram editor state (nodes, edges, history) |
| `collaborationStore` | Real-time collaboration state |
| `preferencesStore` | User preferences (theme, recent, favorites) |
| `workspaceStore` | Current workspace context |
| `themeStore` | Theme mode (dark/light/system) |

---

## 5. Database Schema

### 5.1 Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   profiles  │     │  workspaces │     │   folders   │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id          │     │ id          │     │ id          │
│ user_id  ──────┐  │ name        │  ┌──│ workspace_id│
│ full_name   │  │  │ owner_id ───┼──┘  │ parent_id   │
│ avatar_url  │  │  │ created_at  │     │ name        │
└─────────────┘  │  └─────────────┘     └─────────────┘
                 │         │                   │
                 │         │                   │
                 │  ┌──────┴───────┐           │
                 │  │              │           │
            ┌────┴──┴───┐   ┌──────┴─────┐     │
            │ workspace │   │  diagrams  │─────┘
            │ _members  │   ├────────────┤
            ├───────────┤   │ id         │
            │ id        │   │ name       │
            │ workspace │   │ user_id    │
            │ user_id   │   │ folder_id  │
            │ role      │   │ workspace  │
            └───────────┘   │ nodes      │
                            │ edges      │
                            │ thumbnail  │
                            └────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
             ┌──────┴─────┐ ┌─────┴─────┐ ┌─────┴──────┐
             │ diagram    │ │ diagram   │ │ diagram    │
             │ _shares    │ │ _versions │ │ _comments  │
             ├────────────┤ ├───────────┤ ├────────────┤
             │ diagram_id │ │ diagram_id│ │ diagram_id │
             │ user_id    │ │ version   │ │ user_id    │
             │ permission │ │ nodes     │ │ content    │
             └────────────┘ │ edges     │ │ position   │
                            └───────────┘ └────────────┘
```

### 5.2 Table Definitions

```sql
-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Team workspaces
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Workspace membership
CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(workspace_id, user_id),
  UNIQUE(workspace_id, email)
);

-- Folders for organization
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Diagrams
CREATE TABLE diagrams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  nodes JSONB DEFAULT '[]'::jsonb,
  edges JSONB DEFAULT '[]'::jsonb,
  layers JSONB,
  thumbnail TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Diagram sharing
CREATE TABLE diagram_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagram_id UUID REFERENCES diagrams(id) ON DELETE CASCADE NOT NULL,
  shared_with_email TEXT,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL CHECK (permission IN ('view', 'edit', 'admin')),
  shared_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(diagram_id, shared_with_email),
  UNIQUE(diagram_id, shared_with_user_id)
);

-- Version history
CREATE TABLE diagram_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagram_id UUID REFERENCES diagrams(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  name TEXT,
  nodes JSONB NOT NULL,
  edges JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(diagram_id, version_number)
);

-- Comments
CREATE TABLE diagram_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagram_id UUID REFERENCES diagrams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  position_x FLOAT,
  position_y FLOAT,
  node_id TEXT,
  parent_id UUID REFERENCES diagram_comments(id) ON DELETE CASCADE,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Real-time presence
CREATE TABLE diagram_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagram_id UUID REFERENCES diagrams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  color TEXT NOT NULL,
  cursor_x FLOAT,
  cursor_y FLOAT,
  viewport_x FLOAT,
  viewport_y FLOAT,
  viewport_zoom FLOAT DEFAULT 1,
  last_seen TIMESTAMPTZ DEFAULT now(),
  UNIQUE(diagram_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_diagrams_user ON diagrams(user_id);
CREATE INDEX idx_diagrams_folder ON diagrams(folder_id);
CREATE INDEX idx_diagrams_workspace ON diagrams(workspace_id);
CREATE INDEX idx_diagram_shares_diagram ON diagram_shares(diagram_id);
CREATE INDEX idx_diagram_shares_user ON diagram_shares(shared_with_user_id);
CREATE INDEX idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX idx_diagram_versions_diagram ON diagram_versions(diagram_id);
CREATE INDEX idx_diagram_comments_diagram ON diagram_comments(diagram_id);
CREATE INDEX idx_diagram_presence_diagram ON diagram_presence(diagram_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE diagram_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE diagrams;
ALTER PUBLICATION supabase_realtime ADD TABLE diagram_comments;
```

---

## 6. UI/UX Specifications

### 6.1 Design System

#### 6.1.1 Color Palette

**Dark Theme (Default)**
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | #1c1c1c | Main background |
| `--bg-secondary` | #232323 | Card backgrounds |
| `--bg-tertiary` | #2a2a2a | Hover states |
| `--border-default` | #333333 | Default borders |
| `--text-primary` | #ededed | Primary text |
| `--text-secondary` | #a1a1a1 | Secondary text |
| `--text-muted` | #666666 | Muted text |
| `--accent-primary` | #3ECF8E | Brand green |

**Light Theme**
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | #ffffff | Main background |
| `--bg-secondary` | #f8f9fa | Card backgrounds |
| `--bg-tertiary` | #f1f3f4 | Hover states |
| `--border-default` | #e5e7eb | Default borders |
| `--text-primary` | #111827 | Primary text |
| `--text-secondary` | #4b5563 | Secondary text |
| `--accent-primary` | #10b981 | Brand green |

#### 6.1.2 Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Headings | Inter | 24-32px | 600 |
| Body | Inter | 14px | 400 |
| Labels | Inter | 12px | 500 |
| Code | JetBrains Mono | 13px | 400 |

#### 6.1.3 Spacing Scale

| Token | Value |
|-------|-------|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-6` | 24px |
| `--space-8` | 32px |

### 6.2 Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                         Top Bar                              │
│  [Logo] [Breadcrumbs]              [Search] [Theme] [User]  │
├──────────────┬──────────────────────────────────────────────┤
│              │                                               │
│   Sidebar    │                  Canvas                       │
│              │                                               │
│  - Dashboard │     ┌─────────────────────────────┐          │
│  - My Docs   │     │                             │          │
│  - Shared    │     │      Diagram Editor         │          │
│  - Favorites │     │                             │          │
│  - Recent    │     │                             │          │
│              │     └─────────────────────────────┘          │
│  TEMPLATES   │                                               │
│  - AWS       │                              [Properties]     │
│  - Azure     │                              [   Panel   ]    │
│  - GCP       │                                               │
│              │     [Zoom Controls]  [Mini Map]              │
│  [New +]     │                                               │
└──────────────┴──────────────────────────────────────────────┘
```

### 6.3 Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 768px | Sidebar hidden, panels as drawers |
| Tablet | 768-1024px | Collapsible sidebar |
| Desktop | > 1024px | Full layout |

---

## 7. Security & Permissions

### 7.1 Authentication

| Method | Support |
|--------|---------|
| Email/Password | ✅ |
| Magic Link | ✅ |
| Google OAuth | Planned |
| Microsoft OAuth | Planned |
| SAML SSO | Enterprise |

### 7.2 Authorization Matrix

| Resource | Owner | Admin | Editor | Viewer |
|----------|-------|-------|--------|--------|
| View Diagram | ✅ | ✅ | ✅ | ✅ |
| Edit Diagram | ✅ | ✅ | ✅ | ❌ |
| Delete Diagram | ✅ | ✅ | Own only | ❌ |
| Share Diagram | ✅ | ✅ | ❌ | ❌ |
| Manage Workspace | ✅ | ✅ | ❌ | ❌ |
| Delete Workspace | ✅ | ❌ | ❌ | ❌ |

### 7.3 Data Security

| Measure | Implementation |
|---------|---------------|
| Encryption at Rest | Supabase managed |
| Encryption in Transit | TLS 1.3 |
| Row Level Security | PostgreSQL RLS policies |
| API Authentication | JWT tokens |

---

## 8. Performance Requirements

### 8.1 Load Time Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Time to Interactive | < 3.0s | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse |

### 8.2 Runtime Performance

| Operation | Target |
|-----------|--------|
| Node drag response | < 16ms (60fps) |
| Add node | < 50ms |
| Delete node | < 50ms |
| Undo/Redo | < 100ms |
| Auto-save | < 500ms |
| Export PNG | < 3s |
| Export PDF | < 5s |

### 8.3 Scalability

| Limit | Value |
|-------|-------|
| Max nodes per diagram | 1,000 |
| Max edges per diagram | 2,000 |
| Max concurrent editors | 50 |
| Max diagrams per user | Unlimited |
| Max file upload size | 10MB |

---

## 9. Future Roadmap

### Phase 1: Stabilization (Week 1)
- Bug fixes and testing
- Performance optimization
- Documentation

### Phase 2: Cloud Templates (Weeks 2-3)
- 15 AWS architecture templates
- 15 Azure architecture templates
- 10 GCP architecture templates
- Template gallery with search

### Phase 3: Enterprise Features (Weeks 4-5)
- SSO (SAML/OIDC)
- API keys for automation
- Webhooks
- Audit logs

### Phase 4: Integrations (Weeks 6-7)
- REST API
- Slack integration
- Jira integration
- GitHub sync

### Phase 5: AI Features ✅ (Completed)
- ✅ AI-assisted diagram generation from text
- ✅ Natural language to diagram (supports AWS, Azure, GCP, flowcharts)
- ✅ Auto-layout optimization (hierarchical, force-directed, grid)
- ✅ Smart suggestions (isolated nodes, missing components, best practices)
- ✅ AI diagram explanation (summary, components, data flow)
- ✅ Local mode (works without API key) + OpenAI integration

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| Canvas | The main drawing area where diagrams are created |
| Node | A shape or element on the diagram |
| Edge | A connection line between two nodes |
| Handle | Connection point on a node for creating edges |
| Viewport | The visible area of the canvas |
| Workspace | A shared container for team diagrams |

## Appendix B: Keyboard Shortcuts Reference

| Category | Shortcut | Action |
|----------|----------|--------|
| File | Ctrl+S | Save |
| Edit | Ctrl+Z | Undo |
| Edit | Ctrl+Y | Redo |
| Edit | Ctrl+C | Copy |
| Edit | Ctrl+V | Paste |
| Edit | Ctrl+D | Duplicate |
| Edit | Ctrl+A | Select All |
| Edit | Delete | Delete Selected |
| View | Ctrl+' | Toggle Grid |
| View | Ctrl+B | Toggle Shape Panel |
| View | Ctrl+K | Command Palette |
| View | F5 | Presentation Mode |
| Arrange | Ctrl+G | Group |
| Arrange | Ctrl+Shift+G | Ungroup |
| Arrange | Ctrl+L | Lock/Unlock |

---

**Document End**
