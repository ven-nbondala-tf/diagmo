# DIAGMO - Code Review, Cloud Icons & Phase 3 Requirements

## 📋 PART 1: CODE REVIEW (v6)

### ✅ Successfully Implemented

| Feature | Status | Notes |
|---------|--------|-------|
| Menu Bar | ✅ | File, Edit, View, Arrange, Help menus |
| Select All (Ctrl+A) | ✅ | selectNodes/selectEdges set `selected: true` |
| SmoothStep Edges | ✅ | Better connections than straight lines |
| Arrow Size | ✅ | Increased to 20px |
| Resize Handle CSS | ✅ | All 8 positions with hover effects |
| Status Bar | ✅ | Diagram name, save status, zoom |
| Menubar UI Component | ✅ | Radix primitives |

### ⚠️ Minor Fixes Needed

**1. NodeResizer Border** - Show dashed selection border:
```tsx
lineStyle={{
  borderWidth: 1,
  borderColor: '#3b82f6',
  borderStyle: 'dashed',
}}
```

**2. PDF Export** - Add back if needed in EditorHeader.tsx

---

## 📋 PART 2: REAL CLOUD PROVIDER ICONS

The current cloud icons are just generic cloud shapes with text. Here are **real SVG icons** for AWS, Azure, and GCP services:

### Update `ShapePanel.tsx` - ShapePreview function:

```tsx
// ===== AWS ICONS =====
case 'aws-ec2':
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      {/* AWS Orange */}
      <rect x="4" y="4" width="24" height="24" rx="2" fill="#FF9900" />
      {/* Server icon */}
      <rect x="8" y="8" width="16" height="5" rx="1" fill="white" />
      <rect x="8" y="14" width="16" height="5" rx="1" fill="white" />
      <rect x="8" y="20" width="16" height="5" rx="1" fill="white" />
      <circle cx="11" cy="10.5" r="1" fill="#FF9900" />
      <circle cx="11" cy="16.5" r="1" fill="#FF9900" />
      <circle cx="11" cy="22.5" r="1" fill="#FF9900" />
    </svg>
  )

case 'aws-s3':
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <rect x="4" y="4" width="24" height="24" rx="2" fill="#569A31" />
      {/* Bucket shape */}
      <path d="M10,10 L22,10 L20,24 L12,24 Z" fill="white" />
      <ellipse cx="16" cy="10" rx="6" ry="2" fill="white" stroke="#569A31" strokeWidth="1" />
    </svg>
  )

case 'aws-lambda':
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <rect x="4" y="4" width="24" height="24" rx="2" fill="#FF9900" />
      {/* Lambda symbol */}
      <path d="M10,24 L16,8 L18,8 L14,18 L22,18 L22,20 L13,20 L10,24 Z" fill="white" />
    </svg>
  )

case 'aws-rds':
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <rect x="4" y="4" width="24" height="24" rx="2" fill="#3B48CC" />
      {/* Database cylinder */}
      <ellipse cx="16" cy="10" rx="7" ry="3" fill="white" />
      <path d="M9,10 L9,22 C9,24 12,26 16,26 C20,26 23,24 23,22 L23,10" fill="none" stroke="white" strokeWidth="2" />
      <ellipse cx="16" cy="22" rx="7" ry="3" fill="none" stroke="white" strokeWidth="2" />
    </svg>
  )

// ===== AZURE ICONS =====
case 'azure-vm':
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <rect x="4" y="4" width="24" height="24" rx="2" fill="#0078D4" />
      {/* VM Monitor */}
      <rect x="8" y="8" width="16" height="12" rx="1" fill="white" />
      <rect x="12" y="21" width="8" height="2" fill="white" />
      <rect x="10" y="23" width="12" height="2" fill="white" />
    </svg>
  )

case 'azure-storage':
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <rect x="4" y="4" width="24" height="24" rx="2" fill="#0078D4" />
      {/* Storage tables */}
      <rect x="8" y="8" width="16" height="4" rx="1" fill="white" />
      <rect x="8" y="14" width="16" height="4" rx="1" fill="white" />
      <rect x="8" y="20" width="16" height="4" rx="1" fill="white" />
    </svg>
  )

case 'azure-functions':
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <rect x="4" y="4" width="24" height="24" rx="2" fill="#0062AD" />
      {/* Lightning bolt */}
      <path d="M18,6 L12,16 L16,16 L14,26 L22,14 L17,14 L20,6 Z" fill="#FFC107" />
    </svg>
  )

// ===== GCP ICONS =====
case 'gcp-compute':
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <rect x="4" y="4" width="24" height="24" rx="2" fill="#4285F4" />
      {/* Compute Engine */}
      <rect x="8" y="10" width="16" height="12" rx="2" fill="white" />
      <rect x="10" y="12" width="4" height="3" fill="#4285F4" />
      <rect x="10" y="17" width="4" height="3" fill="#4285F4" />
      <rect x="16" y="12" width="6" height="8" fill="#4285F4" />
    </svg>
  )

case 'gcp-storage':
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <rect x="4" y="4" width="24" height="24" rx="2" fill="#4285F4" />
      {/* Cloud Storage bucket */}
      <ellipse cx="16" cy="12" rx="8" ry="3" fill="white" />
      <path d="M8,12 L8,20 C8,22 11,24 16,24 C21,24 24,22 24,20 L24,12" fill="white" />
      <line x1="8" y1="16" x2="24" y2="16" stroke="#4285F4" strokeWidth="1" />
      <line x1="8" y1="20" x2="24" y2="20" stroke="#4285F4" strokeWidth="1" />
    </svg>
  )

case 'gcp-functions':
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <rect x="4" y="4" width="24" height="24" rx="2" fill="#4285F4" />
      {/* Functions icon */}
      <text x="16" y="20" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">ƒ</text>
    </svg>
  )
```

### Update `CustomNode.tsx` - Cloud Shape Rendering:

```tsx
// ===== CLOUD PROVIDER SHAPES =====

case 'aws-ec2':
  return (
    <div className={cn(shapeClass, 'p-2')} style={getShapeStyle({ borderRadius: 8 })}>
      <div className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded bg-[#FF9900] flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-6 h-6">
            <rect x="4" y="4" width="16" height="4" rx="0.5" fill="white" />
            <rect x="4" y="10" width="16" height="4" rx="0.5" fill="white" />
            <rect x="4" y="16" width="16" height="4" rx="0.5" fill="white" />
            <circle cx="6.5" cy="6" r="1" fill="#FF9900" />
            <circle cx="6.5" cy="12" r="1" fill="#FF9900" />
            <circle cx="6.5" cy="18" r="1" fill="#FF9900" />
          </svg>
        </div>
        <span className="text-xs font-medium" style={{ color: baseStyle.color }}>{label || 'EC2'}</span>
      </div>
    </div>
  )

case 'aws-s3':
  return (
    <div className={cn(shapeClass, 'p-2')} style={getShapeStyle({ borderRadius: 8 })}>
      <div className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded bg-[#569A31] flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path d="M6,6 L18,6 L16,20 L8,20 Z" fill="white" />
            <ellipse cx="12" cy="6" rx="6" ry="2" fill="white" />
          </svg>
        </div>
        <span className="text-xs font-medium" style={{ color: baseStyle.color }}>{label || 'S3'}</span>
      </div>
    </div>
  )

case 'aws-lambda':
  return (
    <div className={cn(shapeClass, 'p-2')} style={getShapeStyle({ borderRadius: 8 })}>
      <div className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded bg-[#FF9900] flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path d="M6,20 L12,4 L14,4 L10,12 L18,12 L18,14 L9,14 L6,20 Z" fill="white" />
          </svg>
        </div>
        <span className="text-xs font-medium" style={{ color: baseStyle.color }}>{label || 'Lambda'}</span>
      </div>
    </div>
  )

case 'aws-rds':
  return (
    <div className={cn(shapeClass, 'p-2')} style={getShapeStyle({ borderRadius: 8 })}>
      <div className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded bg-[#3B48CC] flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-6 h-6">
            <ellipse cx="12" cy="6" rx="7" ry="2.5" fill="white" />
            <path d="M5,6 L5,18 C5,20 8,21.5 12,21.5 C16,21.5 19,20 19,18 L19,6" fill="none" stroke="white" strokeWidth="2" />
          </svg>
        </div>
        <span className="text-xs font-medium" style={{ color: baseStyle.color }}>{label || 'RDS'}</span>
      </div>
    </div>
  )

case 'azure-vm':
  return (
    <div className={cn(shapeClass, 'p-2')} style={getShapeStyle({ borderRadius: 8 })}>
      <div className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded bg-[#0078D4] flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-6 h-6">
            <rect x="4" y="4" width="16" height="12" rx="1" fill="white" />
            <rect x="8" y="17" width="8" height="1.5" fill="white" />
            <rect x="6" y="19" width="12" height="1.5" fill="white" />
          </svg>
        </div>
        <span className="text-xs font-medium" style={{ color: baseStyle.color }}>{label || 'VM'}</span>
      </div>
    </div>
  )

case 'azure-storage':
  return (
    <div className={cn(shapeClass, 'p-2')} style={getShapeStyle({ borderRadius: 8 })}>
      <div className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded bg-[#0078D4] flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-6 h-6">
            <rect x="4" y="4" width="16" height="4" rx="0.5" fill="white" />
            <rect x="4" y="10" width="16" height="4" rx="0.5" fill="white" />
            <rect x="4" y="16" width="16" height="4" rx="0.5" fill="white" />
          </svg>
        </div>
        <span className="text-xs font-medium" style={{ color: baseStyle.color }}>{label || 'Storage'}</span>
      </div>
    </div>
  )

case 'azure-functions':
  return (
    <div className={cn(shapeClass, 'p-2')} style={getShapeStyle({ borderRadius: 8 })}>
      <div className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded bg-[#0062AD] flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path d="M14,2 L8,12 L12,12 L10,22 L18,10 L13,10 L16,2 Z" fill="#FFC107" />
          </svg>
        </div>
        <span className="text-xs font-medium" style={{ color: baseStyle.color }}>{label || 'Functions'}</span>
      </div>
    </div>
  )

case 'gcp-compute':
  return (
    <div className={cn(shapeClass, 'p-2')} style={getShapeStyle({ borderRadius: 8 })}>
      <div className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded bg-[#4285F4] flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-6 h-6">
            <rect x="4" y="6" width="16" height="12" rx="1" fill="white" />
            <rect x="6" y="8" width="4" height="3" fill="#4285F4" />
            <rect x="6" y="13" width="4" height="3" fill="#4285F4" />
            <rect x="12" y="8" width="6" height="8" fill="#4285F4" />
          </svg>
        </div>
        <span className="text-xs font-medium" style={{ color: baseStyle.color }}>{label || 'Compute'}</span>
      </div>
    </div>
  )

case 'gcp-storage':
  return (
    <div className={cn(shapeClass, 'p-2')} style={getShapeStyle({ borderRadius: 8 })}>
      <div className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded bg-[#4285F4] flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-6 h-6">
            <ellipse cx="12" cy="8" rx="7" ry="2.5" fill="white" />
            <path d="M5,8 L5,16 C5,18 8,19.5 12,19.5 C16,19.5 19,18 19,16 L19,8" fill="white" />
            <line x1="5" y1="12" x2="19" y2="12" stroke="#4285F4" strokeWidth="1" />
          </svg>
        </div>
        <span className="text-xs font-medium" style={{ color: baseStyle.color }}>{label || 'Storage'}</span>
      </div>
    </div>
  )

case 'gcp-functions':
  return (
    <div className={cn(shapeClass, 'p-2')} style={getShapeStyle({ borderRadius: 8 })}>
      <div className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded bg-[#4285F4] flex items-center justify-center">
          <span className="text-white text-xl font-bold">ƒ</span>
        </div>
        <span className="text-xs font-medium" style={{ color: baseStyle.color }}>{label || 'Functions'}</span>
      </div>
    </div>
  )
```

### Add More AWS Services to constants/index.ts:

```tsx
aws: {
  label: 'AWS',
  shapes: [
    'aws-ec2',
    'aws-s3', 
    'aws-lambda',
    'aws-rds',
    'aws-dynamodb',
    'aws-api-gateway',
    'aws-sns',
    'aws-sqs',
    'aws-cloudfront',
    'aws-route53',
    'aws-vpc',
    'aws-iam',
  ] as ShapeType[],
},
azure: {
  label: 'Azure',
  shapes: [
    'azure-vm',
    'azure-storage',
    'azure-functions',
    'azure-sql',
    'azure-cosmos',
    'azure-app-service',
    'azure-aks',
    'azure-cdn',
    'azure-vnet',
  ] as ShapeType[],
},
gcp: {
  label: 'GCP',
  shapes: [
    'gcp-compute',
    'gcp-storage',
    'gcp-functions',
    'gcp-bigquery',
    'gcp-pubsub',
    'gcp-gke',
    'gcp-cloud-run',
    'gcp-firestore',
  ] as ShapeType[],
},
```

---

## 📋 PART 3: PHASE 3 REQUIREMENTS

### 🎯 Phase 3 Overview: Advanced Features & Polish

**Timeline**: 2-3 weeks  
**Goal**: Production-ready diagramming tool with collaboration features

---

### 3.1 Real-Time Collaboration (Priority: HIGH)

```
Features:
├── Multi-user editing
│   ├── Real-time cursor positions
│   ├── User presence indicators (avatars)
│   ├── Live node/edge updates via WebSocket
│   └── Conflict resolution (last-write-wins or CRDT)
├── Sharing & Permissions
│   ├── Share diagram via link
│   ├── Permission levels: View, Comment, Edit
│   ├── Invite users by email
│   └── Public/Private toggle
└── Comments & Annotations
    ├── Add comments to nodes
    ├── Reply threads
    ├── Resolve/unresolve comments
    └── @mention users
```

**Technical Implementation**:
- Use Supabase Realtime for WebSocket connections
- Store cursors in temporary state (not DB)
- Use Zustand middleware for sync

---

### 3.2 Templates & Presets (Priority: HIGH)

```
Features:
├── Template Gallery
│   ├── Flowchart templates
│   ├── Network diagram templates
│   ├── AWS/Azure/GCP architecture templates
│   ├── UML templates (class, sequence, use case)
│   ├── ER diagram templates
│   └── Org chart templates
├── Quick Start
│   ├── "Start from template" option
│   ├── Template preview thumbnails
│   └── Search/filter templates
└── Custom Templates
    ├── Save diagram as template
    ├── Personal template library
    └── Share templates with team
```

---

### 3.3 Advanced Connectors (Priority: MEDIUM)

```
Features:
├── Connector Types
│   ├── Straight line
│   ├── Orthogonal (90° angles)
│   ├── Curved (bezier)
│   ├── Elbowed
│   └── Custom waypoints (drag to add bend points)
├── Connector Styles
│   ├── Line patterns: solid, dashed, dotted
│   ├── Start/End markers: none, arrow, diamond, circle, square
│   ├── Double-headed arrows
│   └── Custom colors and thickness
├── Smart Routing
│   ├── Auto-route around nodes
│   ├── Avoid overlapping edges
│   └── Snap to grid
└── Connection Labels
    ├── Text on connector
    ├── Multiple labels per connector
    └── Label positioning (start, middle, end)
```

---

### 3.4 Layers & Organization (Priority: MEDIUM)

```
Features:
├── Layer Management
│   ├── Create/delete layers
│   ├── Show/hide layers
│   ├── Lock layers
│   ├── Reorder layers
│   └── Layer colors
├── Grouping
│   ├── Group nodes visually
│   ├── Nested groups
│   ├── Collapse/expand groups
│   └── Group styling (background, border)
└── Z-Index Control
    ├── Bring to front
    ├── Send to back
    ├── Bring forward
    └── Send backward
```

---

### 3.5 Import/Export Enhancements (Priority: MEDIUM)

```
Features:
├── Import
│   ├── Import from JSON
│   ├── Import from draw.io XML
│   ├── Import from Lucidchart
│   ├── Import from Visio (VDX/VSDX)
│   └── Import images as shapes
├── Export
│   ├── PNG (high-res options)
│   ├── SVG
│   ├── PDF (multi-page for large diagrams)
│   ├── JSON
│   ├── draw.io XML compatible
│   └── PowerPoint/Google Slides
└── Embed
    ├── Generate embed code (iframe)
    ├── Embed in Notion/Confluence
    └── Interactive or static embed options
```

---

### 3.6 Search & Navigation (Priority: MEDIUM)

```
Features:
├── Global Search
│   ├── Search shapes by text
│   ├── Search by shape type
│   ├── Filter by properties
│   └── Navigate to found items
├── Outline View
│   ├── Hierarchical tree of all shapes
│   ├── Click to select/focus
│   └── Drag to reorder
└── Minimap Enhancements
    ├── Viewport rectangle
    ├── Click to navigate
    └── Show/hide toggle
```

---

### 3.7 Presentation Mode (Priority: LOW)

```
Features:
├── Slideshow
│   ├── Define presentation frames
│   ├── Transition between frames
│   ├── Auto-play with timing
│   └── Laser pointer
├── Focus Mode
│   ├── Highlight specific nodes
│   ├── Dim non-focused areas
│   └── Zoom to selection
└── Export Presentation
    ├── Export frames as images
    └── Generate PowerPoint
```

---

### 3.8 AI Features (Priority: LOW)

```
Features:
├── Smart Suggestions
│   ├── Suggest next shape based on context
│   ├── Auto-complete connections
│   └── Layout suggestions
├── Diagram Generation
│   ├── Generate from text description
│   ├── Convert code to diagram
│   └── Import from documentation
└── Auto-Layout
    ├── Automatic arrangement
    ├── Align and distribute
    └── Optimize for readability
```

---

### 3.9 More Cloud Provider Icons (Priority: HIGH)

#### AWS Services to Add:
| Service | Icon ID | Color |
|---------|---------|-------|
| DynamoDB | aws-dynamodb | #4053D6 |
| API Gateway | aws-api-gateway | #FF4F8B |
| SNS | aws-sns | #FF4F8B |
| SQS | aws-sqs | #FF4F8B |
| CloudFront | aws-cloudfront | #8C4FFF |
| Route 53 | aws-route53 | #8C4FFF |
| VPC | aws-vpc | #8C4FFF |
| IAM | aws-iam | #DD344C |
| ECS | aws-ecs | #FF9900 |
| EKS | aws-eks | #FF9900 |
| CloudWatch | aws-cloudwatch | #FF4F8B |
| Cognito | aws-cognito | #DD344C |

#### Azure Services to Add:
| Service | Icon ID | Color |
|---------|---------|-------|
| SQL Database | azure-sql | #0078D4 |
| Cosmos DB | azure-cosmos | #0078D4 |
| App Service | azure-app-service | #0078D4 |
| AKS | azure-aks | #326CE5 |
| CDN | azure-cdn | #0078D4 |
| Virtual Network | azure-vnet | #0078D4 |
| Key Vault | azure-keyvault | #0078D4 |
| Logic Apps | azure-logic-apps | #0078D4 |

#### GCP Services to Add:
| Service | Icon ID | Color |
|---------|---------|-------|
| BigQuery | gcp-bigquery | #4285F4 |
| Pub/Sub | gcp-pubsub | #4285F4 |
| GKE | gcp-gke | #4285F4 |
| Cloud Run | gcp-cloud-run | #4285F4 |
| Firestore | gcp-firestore | #FFCA28 |
| Cloud SQL | gcp-cloud-sql | #4285F4 |
| Cloud CDN | gcp-cdn | #4285F4 |

---

### 3.10 Performance & Quality (Priority: HIGH)

```
Features:
├── Performance
│   ├── Virtual scrolling for large diagrams
│   ├── Lazy loading of shapes
│   ├── Debounced updates
│   └── WebWorker for heavy computations
├── Accessibility
│   ├── Keyboard navigation
│   ├── Screen reader support
│   ├── High contrast mode
│   └── Focus indicators
├── Testing
│   ├── Unit tests (80%+ coverage)
│   ├── Integration tests
│   ├── E2E tests (Playwright/Cypress)
│   └── Visual regression tests
└── Documentation
    ├── User guide
    ├── API documentation
    ├── Developer docs
    └── Video tutorials
```

---

## 📊 PHASE 3 PRIORITY MATRIX

| Feature | Priority | Complexity | Time Est |
|---------|----------|------------|----------|
| Real Cloud Icons | 🔴 HIGH | Low | 1-2 days |
| Templates | 🔴 HIGH | Medium | 3-5 days |
| More Cloud Services | 🔴 HIGH | Low | 2-3 days |
| Advanced Connectors | 🟡 MEDIUM | High | 5-7 days |
| Layers | 🟡 MEDIUM | Medium | 3-4 days |
| Import/Export | 🟡 MEDIUM | Medium | 4-5 days |
| Real-Time Collab | 🔴 HIGH | Very High | 7-10 days |
| Search & Navigation | 🟡 MEDIUM | Low | 2-3 days |
| Presentation Mode | 🟢 LOW | Medium | 3-4 days |
| AI Features | 🟢 LOW | Very High | 7-14 days |
| Performance | 🔴 HIGH | Medium | 3-5 days |

---

## 🚀 RECOMMENDED PHASE 3 SPRINT PLAN

### Sprint 3.1 (Week 1)
- [ ] Implement real AWS/Azure/GCP icons
- [ ] Add more cloud services (20+)
- [ ] Create 5 starter templates
- [ ] Performance optimizations

### Sprint 3.2 (Week 2)
- [ ] Advanced connector types
- [ ] Connection waypoints
- [ ] Layer management
- [ ] Search functionality

### Sprint 3.3 (Week 3)
- [ ] Real-time collaboration basics
- [ ] Sharing & permissions
- [ ] Import/Export enhancements
- [ ] Polish & bug fixes

---

## Summary

This document covers:
1. ✅ **Code Review** - v6 implementation is solid, minor fixes needed
2. ✅ **Real Cloud Icons** - SVG icons for AWS, Azure, GCP services
3. ✅ **Phase 3 Requirements** - Comprehensive feature roadmap

Copy this to Claude Code to continue development!
