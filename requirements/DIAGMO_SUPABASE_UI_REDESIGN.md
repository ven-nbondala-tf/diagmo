# Diagmo Pro — Supabase-Inspired UI/UX Redesign

> **Objective:** Transform Diagmo Pro's UI to match Supabase's professional, developer-friendly aesthetic  
> **Approach:** Keep ALL existing features, change only the visual experience  
> **Estimated Effort:** 1-2 weeks

---

## Part 1 — What Makes Supabase UI Great

### 1.1 Key Design Principles

| Principle | Supabase Implementation | Apply to Diagmo |
|-----------|------------------------|-----------------|
| **Dark-first design** | Dark gray backgrounds (#1c1c1c, #232323) | Editor canvas, panels |
| **Consistent sidebar** | Fixed left nav, collapsible sections | Diagram list, tools |
| **Clean typography** | Inter/System fonts, good hierarchy | All text elements |
| **Subtle borders** | 1px borders with low opacity | Panels, cards, inputs |
| **Accent color** | Green (#3ECF8E) for primary actions | Save, create, connect |
| **Professional icons** | Lucide icons, consistent sizing | All icons |
| **Tab-based navigation** | Horizontal tabs for context switching | Properties, layers, etc. |
| **Information density** | Compact but readable | Shape panel, properties |

### 1.2 Color Palette (Supabase-Inspired)

```css
:root {
  /* Backgrounds */
  --bg-primary: #1c1c1c;      /* Main background */
  --bg-secondary: #232323;    /* Panels, cards */
  --bg-tertiary: #2a2a2a;     /* Hover states */
  --bg-elevated: #303030;     /* Modals, dropdowns */
  
  /* Borders */
  --border-default: #333333;
  --border-subtle: #2a2a2a;
  --border-strong: #444444;
  
  /* Text */
  --text-primary: #ededed;
  --text-secondary: #a1a1a1;
  --text-muted: #666666;
  
  /* Accent (Supabase Green) */
  --accent-primary: #3ECF8E;
  --accent-hover: #2eb77a;
  --accent-muted: rgba(62, 207, 142, 0.15);
  
  /* Status Colors */
  --success: #3ECF8E;
  --warning: #F5A623;
  --error: #F25C54;
  --info: #3B82F6;
  
  /* Special */
  --selection: rgba(62, 207, 142, 0.2);
  --focus-ring: rgba(62, 207, 142, 0.5);
}
```

---

## Part 2 — New Layout Structure

### 2.1 Current vs. Proposed Layout

```
CURRENT LAYOUT:
┌─────────────────────────────────────────────────────────────┐
│  Header (Logo, Diagram Name, Actions)                       │
├──────────┬──────────────────────────────────┬───────────────┤
│  Shape   │                                  │   Properties  │
│  Panel   │         Canvas                   │   Panel       │
│  (Wide)  │                                  │   (Wide)      │
├──────────┴──────────────────────────────────┴───────────────┤
│  Page Tabs                                                  │
└─────────────────────────────────────────────────────────────┘

PROPOSED LAYOUT (Supabase-style):
┌────────────────────────────────────────────────────────────────┐
│  Top Bar: Logo │ Project Dropdown │ Search │ User │ Settings  │
├─────┬──────────┴───────────────────────────────────────────────┤
│     │  Breadcrumb: Home > My Diagrams > Network Architecture   │
│  S  ├──────────────────────────────────────────────────────────┤
│  I  │  ┌─────────────────────────────────────────────────────┐ │
│  D  │  │  Toolbar: Select │ Pan │ Shapes │ Connect │ Text    │ │
│  E  │  ├─────────────────────────────────────────────────────┤ │
│  B  │  │                                                     │ │
│  A  │  │                    CANVAS                           │ │
│  R  │  │                                                     │ │
│     │  │                                                     │ │
│  N  │  └─────────────────────────────────────────────────────┘ │
│  A  ├──────────────────────────────────────────────────────────┤
│  V  │  Bottom Panel (collapsible): Properties │ Layers │ etc. │
└─────┴──────────────────────────────────────────────────────────┘
```

### 2.2 Sidebar Navigation Structure

```typescript
// Sidebar sections (like Supabase)
const sidebarNavigation = [
  {
    section: null, // No section header
    items: [
      { icon: 'Home', label: 'Dashboard', href: '/dashboard' },
      { icon: 'FolderOpen', label: 'My Diagrams', href: '/diagrams' },
      { icon: 'Users', label: 'Shared with Me', href: '/shared' },
      { icon: 'Star', label: 'Favorites', href: '/favorites' },
      { icon: 'Clock', label: 'Recent', href: '/recent' },
    ]
  },
  {
    section: 'TEMPLATES',
    items: [
      { icon: 'Cloud', label: 'AWS Architecture', href: '/templates/aws' },
      { icon: 'Cloud', label: 'Azure Architecture', href: '/templates/azure' },
      { icon: 'Cloud', label: 'GCP Architecture', href: '/templates/gcp' },
      { icon: 'GitBranch', label: 'Flowcharts', href: '/templates/flowchart' },
      { icon: 'Network', label: 'Network Diagrams', href: '/templates/network' },
    ]
  },
  {
    section: 'WORKSPACE',
    items: [
      { icon: 'Settings', label: 'Settings', href: '/settings' },
      { icon: 'Users', label: 'Team Members', href: '/team' },
      { icon: 'Key', label: 'API Keys', href: '/api-keys' },
    ]
  }
]
```

---

## Part 3 — Component Redesigns

### 3.1 New Sidebar Component

```tsx
// components/layout/Sidebar.tsx

import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/utils'
import {
  Home, FolderOpen, Users, Star, Clock, Cloud,
  GitBranch, Network, Settings, Key, ChevronDown,
  ChevronRight, Plus, Search
} from 'lucide-react'

interface SidebarProps {
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
}

export function Sidebar({ collapsed, onCollapse }: SidebarProps) {
  const location = useLocation()
  const [expandedSections, setExpandedSections] = useState(['TEMPLATES'])

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-[#1c1c1c] border-r border-[#333]",
        "transition-all duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-[#333]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3ECF8E] to-[#2eb77a] flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          {!collapsed && (
            <span className="font-semibold text-[#ededed]">Diagmo Pro</span>
          )}
        </div>
      </div>

      {/* Project Selector (like Supabase) */}
      {!collapsed && (
        <div className="p-3 border-b border-[#333]">
          <button className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-[#232323] hover:bg-[#2a2a2a] border border-[#333] text-sm">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[#3ECF8E]/20 flex items-center justify-center">
                <span className="text-[#3ECF8E] text-xs">P</span>
              </div>
              <span className="text-[#ededed]">Personal Workspace</span>
            </div>
            <ChevronDown className="w-4 h-4 text-[#666]" />
          </button>
        </div>
      )}

      {/* Search */}
      {!collapsed && (
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
            <input
              type="text"
              placeholder="Search diagrams..."
              className="w-full pl-9 pr-3 py-2 rounded-md bg-[#232323] border border-[#333] text-sm text-[#ededed] placeholder-[#666] focus:outline-none focus:border-[#3ECF8E]/50 focus:ring-1 focus:ring-[#3ECF8E]/20"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] text-[#666] bg-[#2a2a2a] rounded border border-[#333]">
              ⌘K
            </kbd>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {/* Main Items */}
        <div className="px-3 space-y-1">
          <SidebarItem
            icon={Home}
            label="Dashboard"
            href="/dashboard"
            collapsed={collapsed}
            active={location.pathname === '/dashboard'}
          />
          <SidebarItem
            icon={FolderOpen}
            label="My Diagrams"
            href="/diagrams"
            collapsed={collapsed}
            active={location.pathname === '/diagrams'}
            badge={12}
          />
          <SidebarItem
            icon={Users}
            label="Shared with Me"
            href="/shared"
            collapsed={collapsed}
            active={location.pathname === '/shared'}
            badge={3}
          />
          <SidebarItem
            icon={Star}
            label="Favorites"
            href="/favorites"
            collapsed={collapsed}
            active={location.pathname === '/favorites'}
          />
          <SidebarItem
            icon={Clock}
            label="Recent"
            href="/recent"
            collapsed={collapsed}
            active={location.pathname === '/recent'}
          />
        </div>

        {/* Templates Section */}
        {!collapsed && (
          <div className="mt-6">
            <button
              onClick={() => toggleSection('TEMPLATES')}
              className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-medium text-[#666] hover:text-[#a1a1a1]"
            >
              <span>TEMPLATES</span>
              {expandedSections.includes('TEMPLATES') ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
            {expandedSections.includes('TEMPLATES') && (
              <div className="px-3 mt-1 space-y-1">
                <SidebarItem icon={Cloud} label="AWS" href="/templates/aws" />
                <SidebarItem icon={Cloud} label="Azure" href="/templates/azure" />
                <SidebarItem icon={Cloud} label="GCP" href="/templates/gcp" />
                <SidebarItem icon={GitBranch} label="Flowcharts" href="/templates/flowchart" />
                <SidebarItem icon={Network} label="Network" href="/templates/network" />
              </div>
            )}
          </div>
        )}

        {/* Workspace Section */}
        {!collapsed && (
          <div className="mt-6">
            <button
              onClick={() => toggleSection('WORKSPACE')}
              className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-medium text-[#666] hover:text-[#a1a1a1]"
            >
              <span>WORKSPACE</span>
              {expandedSections.includes('WORKSPACE') ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
            {expandedSections.includes('WORKSPACE') && (
              <div className="px-3 mt-1 space-y-1">
                <SidebarItem icon={Settings} label="Settings" href="/settings" />
                <SidebarItem icon={Users} label="Team" href="/team" />
                <SidebarItem icon={Key} label="API Keys" href="/api-keys" />
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-[#333]">
        <button
          className={cn(
            "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md",
            "bg-[#3ECF8E] hover:bg-[#2eb77a] text-[#1c1c1c] font-medium text-sm",
            "transition-colors"
          )}
        >
          <Plus className="w-4 h-4" />
          {!collapsed && <span>New Diagram</span>}
        </button>
      </div>
    </aside>
  )
}

interface SidebarItemProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
  collapsed?: boolean
  active?: boolean
  badge?: number
}

function SidebarItem({ icon: Icon, label, href, collapsed, active, badge }: SidebarItemProps) {
  return (
    <NavLink
      to={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
        active
          ? "bg-[#3ECF8E]/10 text-[#3ECF8E]"
          : "text-[#a1a1a1] hover:text-[#ededed] hover:bg-[#2a2a2a]",
        collapsed && "justify-center"
      )}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1">{label}</span>
          {badge !== undefined && (
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-[#333] text-[#a1a1a1]">
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}
```

### 3.2 New Top Bar Component

```tsx
// components/layout/TopBar.tsx

import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell, HelpCircle, Settings, User, ChevronDown,
  Search, Command
} from 'lucide-react'
import { cn } from '@/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui'

interface TopBarProps {
  breadcrumbs?: { label: string; href?: string }[]
  diagramName?: string
  onSave?: () => void
  isSaving?: boolean
}

export function TopBar({ breadcrumbs, diagramName, onSave, isSaving }: TopBarProps) {
  return (
    <header className="h-14 bg-[#1c1c1c] border-b border-[#333] flex items-center justify-between px-4">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        {breadcrumbs?.map((crumb, i) => (
          <div key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-[#666]">/</span>}
            {crumb.href ? (
              <Link
                to={crumb.href}
                className="text-[#a1a1a1] hover:text-[#ededed] transition-colors"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-[#ededed]">{crumb.label}</span>
            )}
          </div>
        ))}
      </div>

      {/* Center: Search (optional) */}
      <button className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#232323] border border-[#333] text-sm text-[#666] hover:text-[#a1a1a1] hover:border-[#444] transition-colors">
        <Search className="w-4 h-4" />
        <span>Search...</span>
        <div className="flex items-center gap-1 ml-4">
          <kbd className="px-1.5 py-0.5 text-[10px] bg-[#2a2a2a] rounded border border-[#333]">⌘</kbd>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-[#2a2a2a] rounded border border-[#333]">K</kbd>
        </div>
      </button>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Feedback */}
        <button className="px-3 py-1.5 text-sm text-[#a1a1a1] hover:text-[#ededed] transition-colors">
          Feedback
        </button>

        {/* Help */}
        <button className="p-2 rounded-md text-[#a1a1a1] hover:text-[#ededed] hover:bg-[#2a2a2a] transition-colors">
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-md text-[#a1a1a1] hover:text-[#ededed] hover:bg-[#2a2a2a] transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#3ECF8E]" />
        </button>

        {/* Settings */}
        <button className="p-2 rounded-md text-[#a1a1a1] hover:text-[#ededed] hover:bg-[#2a2a2a] transition-colors">
          <Settings className="w-4 h-4" />
        </button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-1 rounded-md hover:bg-[#2a2a2a] transition-colors">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white text-xs font-medium">JD</span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-[#232323] border-[#333]">
            <div className="px-3 py-2 border-b border-[#333]">
              <p className="text-sm font-medium text-[#ededed]">John Doe</p>
              <p className="text-xs text-[#666]">john@example.com</p>
            </div>
            <DropdownMenuItem className="text-[#a1a1a1] hover:text-[#ededed] hover:bg-[#2a2a2a]">
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[#a1a1a1] hover:text-[#ededed] hover:bg-[#2a2a2a]">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#333]" />
            <DropdownMenuItem className="text-[#F25C54] hover:bg-[#F25C54]/10">
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
```

### 3.3 New Editor Toolbar (Horizontal, Supabase-style tabs)

```tsx
// components/editor/EditorToolbar.tsx

import { useState } from 'react'
import { cn } from '@/utils'
import {
  MousePointer2, Hand, Square, Circle, Type,
  ArrowRight, Image, Minus, Undo, Redo,
  ZoomIn, ZoomOut, Maximize, Grid3X3, Layers,
  MessageSquare, History, Download, Share2, Play,
  MoreHorizontal
} from 'lucide-react'

interface EditorToolbarProps {
  activeTool: string
  onToolChange: (tool: string) => void
  zoom: number
  onZoomChange: (zoom: number) => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
}

export function EditorToolbar({
  activeTool,
  onToolChange,
  zoom,
  onZoomChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: EditorToolbarProps) {
  return (
    <div className="h-12 bg-[#232323] border-b border-[#333] flex items-center justify-between px-2">
      {/* Left: Drawing Tools */}
      <div className="flex items-center gap-1">
        <ToolGroup>
          <ToolButton
            icon={MousePointer2}
            label="Select"
            active={activeTool === 'select'}
            onClick={() => onToolChange('select')}
            shortcut="V"
          />
          <ToolButton
            icon={Hand}
            label="Pan"
            active={activeTool === 'pan'}
            onClick={() => onToolChange('pan')}
            shortcut="H"
          />
        </ToolGroup>

        <Divider />

        <ToolGroup>
          <ToolButton
            icon={Square}
            label="Rectangle"
            active={activeTool === 'rectangle'}
            onClick={() => onToolChange('rectangle')}
            shortcut="R"
          />
          <ToolButton
            icon={Circle}
            label="Ellipse"
            active={activeTool === 'ellipse'}
            onClick={() => onToolChange('ellipse')}
            shortcut="O"
          />
          <ToolButton
            icon={Minus}
            label="Line"
            active={activeTool === 'line'}
            onClick={() => onToolChange('line')}
            shortcut="L"
          />
          <ToolButton
            icon={ArrowRight}
            label="Arrow"
            active={activeTool === 'arrow'}
            onClick={() => onToolChange('arrow')}
            shortcut="A"
          />
        </ToolGroup>

        <Divider />

        <ToolGroup>
          <ToolButton
            icon={Type}
            label="Text"
            active={activeTool === 'text'}
            onClick={() => onToolChange('text')}
            shortcut="T"
          />
          <ToolButton
            icon={Image}
            label="Image"
            active={activeTool === 'image'}
            onClick={() => onToolChange('image')}
            shortcut="I"
          />
        </ToolGroup>

        <Divider />

        <ToolGroup>
          <ToolButton
            icon={Undo}
            label="Undo"
            onClick={onUndo}
            disabled={!canUndo}
            shortcut="⌘Z"
          />
          <ToolButton
            icon={Redo}
            label="Redo"
            onClick={onRedo}
            disabled={!canRedo}
            shortcut="⌘⇧Z"
          />
        </ToolGroup>
      </div>

      {/* Center: Zoom Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onZoomChange(Math.max(0.1, zoom - 0.1))}
          className="p-1.5 rounded text-[#a1a1a1] hover:text-[#ededed] hover:bg-[#2a2a2a]"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => onZoomChange(1)}
          className="px-2 py-1 text-xs text-[#a1a1a1] hover:text-[#ededed] hover:bg-[#2a2a2a] rounded min-w-[50px]"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={() => onZoomChange(Math.min(4, zoom + 0.1))}
          className="p-1.5 rounded text-[#a1a1a1] hover:text-[#ededed] hover:bg-[#2a2a2a]"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          className="p-1.5 rounded text-[#a1a1a1] hover:text-[#ededed] hover:bg-[#2a2a2a]"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>

      {/* Right: View Options & Actions */}
      <div className="flex items-center gap-1">
        <ToolGroup>
          <ToolButton icon={Grid3X3} label="Grid" />
          <ToolButton icon={Layers} label="Layers" />
          <ToolButton icon={MessageSquare} label="Comments" />
          <ToolButton icon={History} label="History" />
        </ToolGroup>

        <Divider />

        <ToolGroup>
          <ToolButton icon={Play} label="Present" />
          <ToolButton icon={Download} label="Export" />
        </ToolGroup>

        <Divider />

        {/* Share Button (Primary) */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#3ECF8E] hover:bg-[#2eb77a] text-[#1c1c1c] text-sm font-medium transition-colors">
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </div>
  )
}

function ToolGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>
}

function Divider() {
  return <div className="w-px h-6 bg-[#333] mx-1" />
}

interface ToolButtonProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  active?: boolean
  disabled?: boolean
  onClick?: () => void
  shortcut?: string
}

function ToolButton({ icon: Icon, label, active, disabled, onClick, shortcut }: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={`${label}${shortcut ? ` (${shortcut})` : ''}`}
      className={cn(
        "p-2 rounded transition-colors",
        active
          ? "bg-[#3ECF8E]/20 text-[#3ECF8E]"
          : "text-[#a1a1a1] hover:text-[#ededed] hover:bg-[#2a2a2a]",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <Icon className="w-4 h-4" />
    </button>
  )
}
```

### 3.4 New Properties Panel (Tab-based, like Supabase)

```tsx
// components/editor/PropertiesPanel.tsx

import { useState } from 'react'
import { cn } from '@/utils'
import { X, ChevronDown, Plus } from 'lucide-react'

interface PropertiesPanelProps {
  selectedNodes: string[]
  onClose: () => void
}

export function PropertiesPanel({ selectedNodes, onClose }: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState('style')

  const tabs = [
    { id: 'style', label: 'Style' },
    { id: 'text', label: 'Text' },
    { id: 'arrange', label: 'Arrange' },
    { id: 'data', label: 'Data' },
  ]

  return (
    <div className="w-72 h-full bg-[#1c1c1c] border-l border-[#333] flex flex-col">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-[#333]">
        <span className="text-sm font-medium text-[#ededed]">Properties</span>
        <button
          onClick={onClose}
          className="p-1 rounded text-[#666] hover:text-[#ededed] hover:bg-[#2a2a2a]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs (like Supabase) */}
      <div className="flex border-b border-[#333]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 py-2.5 text-xs font-medium transition-colors relative",
              activeTab === tab.id
                ? "text-[#ededed]"
                : "text-[#666] hover:text-[#a1a1a1]"
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3ECF8E]" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'style' && <StyleTab />}
        {activeTab === 'text' && <TextTab />}
        {activeTab === 'arrange' && <ArrangeTab />}
        {activeTab === 'data' && <DataTab />}
      </div>
    </div>
  )
}

function StyleTab() {
  return (
    <div className="p-4 space-y-4">
      {/* Fill Section */}
      <PropertySection title="Fill">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded border border-[#333] bg-[#3b82f6]" />
          <input
            type="text"
            defaultValue="#3b82f6"
            className="flex-1 px-2 py-1.5 rounded bg-[#232323] border border-[#333] text-sm text-[#ededed] focus:outline-none focus:border-[#3ECF8E]/50"
          />
          <input
            type="number"
            defaultValue={100}
            className="w-16 px-2 py-1.5 rounded bg-[#232323] border border-[#333] text-sm text-[#ededed] focus:outline-none focus:border-[#3ECF8E]/50"
          />
        </div>
      </PropertySection>

      {/* Stroke Section */}
      <PropertySection title="Stroke">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded border border-[#333] bg-transparent border-2 border-[#1e3a5f]" />
            <input
              type="text"
              defaultValue="#1e3a5f"
              className="flex-1 px-2 py-1.5 rounded bg-[#232323] border border-[#333] text-sm text-[#ededed] focus:outline-none focus:border-[#3ECF8E]/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#666] w-16">Width</span>
            <input
              type="number"
              defaultValue={2}
              className="flex-1 px-2 py-1.5 rounded bg-[#232323] border border-[#333] text-sm text-[#ededed] focus:outline-none focus:border-[#3ECF8E]/50"
            />
          </div>
        </div>
      </PropertySection>

      {/* Corner Radius */}
      <PropertySection title="Corner Radius">
        <input
          type="number"
          defaultValue={8}
          className="w-full px-2 py-1.5 rounded bg-[#232323] border border-[#333] text-sm text-[#ededed] focus:outline-none focus:border-[#3ECF8E]/50"
        />
      </PropertySection>

      {/* Shadow */}
      <PropertySection title="Shadow" collapsible defaultOpen={false}>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#666] w-16">X</span>
            <input type="number" defaultValue={0} className="flex-1 px-2 py-1.5 rounded bg-[#232323] border border-[#333] text-sm text-[#ededed]" />
            <span className="text-xs text-[#666] w-16 ml-2">Y</span>
            <input type="number" defaultValue={4} className="flex-1 px-2 py-1.5 rounded bg-[#232323] border border-[#333] text-sm text-[#ededed]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#666] w-16">Blur</span>
            <input type="number" defaultValue={8} className="flex-1 px-2 py-1.5 rounded bg-[#232323] border border-[#333] text-sm text-[#ededed]" />
          </div>
        </div>
      </PropertySection>
    </div>
  )
}

function TextTab() {
  return (
    <div className="p-4 space-y-4">
      <PropertySection title="Font">
        <select className="w-full px-2 py-1.5 rounded bg-[#232323] border border-[#333] text-sm text-[#ededed]">
          <option>Inter</option>
          <option>Roboto</option>
          <option>Open Sans</option>
        </select>
      </PropertySection>
      <PropertySection title="Size">
        <input type="number" defaultValue={14} className="w-full px-2 py-1.5 rounded bg-[#232323] border border-[#333] text-sm text-[#ededed]" />
      </PropertySection>
    </div>
  )
}

function ArrangeTab() {
  return (
    <div className="p-4 space-y-4">
      <PropertySection title="Position">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-[#666]">X</label>
            <input type="number" defaultValue={100} className="w-full px-2 py-1.5 rounded bg-[#232323] border border-[#333] text-sm text-[#ededed]" />
          </div>
          <div>
            <label className="text-xs text-[#666]">Y</label>
            <input type="number" defaultValue={100} className="w-full px-2 py-1.5 rounded bg-[#232323] border border-[#333] text-sm text-[#ededed]" />
          </div>
        </div>
      </PropertySection>
      <PropertySection title="Size">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-[#666]">W</label>
            <input type="number" defaultValue={200} className="w-full px-2 py-1.5 rounded bg-[#232323] border border-[#333] text-sm text-[#ededed]" />
          </div>
          <div>
            <label className="text-xs text-[#666]">H</label>
            <input type="number" defaultValue={100} className="w-full px-2 py-1.5 rounded bg-[#232323] border border-[#333] text-sm text-[#ededed]" />
          </div>
        </div>
      </PropertySection>
    </div>
  )
}

function DataTab() {
  return (
    <div className="p-4 space-y-4">
      <PropertySection title="Metadata">
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded border border-dashed border-[#333] text-sm text-[#666] hover:text-[#a1a1a1] hover:border-[#444]">
          <Plus className="w-4 h-4" />
          Add metadata
        </button>
      </PropertySection>
    </div>
  )
}

interface PropertySectionProps {
  title: string
  children: React.ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
}

function PropertySection({ title, children, collapsible = false, defaultOpen = true }: PropertySectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div>
      <button
        onClick={() => collapsible && setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full mb-2",
          collapsible && "cursor-pointer"
        )}
      >
        <span className="text-xs font-medium text-[#a1a1a1] uppercase tracking-wider">{title}</span>
        {collapsible && (
          <ChevronDown className={cn("w-3 h-3 text-[#666] transition-transform", !isOpen && "-rotate-90")} />
        )}
      </button>
      {isOpen && children}
    </div>
  )
}
```

---

## Part 4 — Dashboard Redesign

### 4.1 New Dashboard Layout

```tsx
// pages/DashboardPage.tsx (Supabase-style)

export function DashboardPage() {
  return (
    <div className="flex h-screen bg-[#1c1c1c]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <TopBar
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'My Diagrams' },
          ]}
        />

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <StatCard title="Total Diagrams" value="24" change="+3 this week" />
            <StatCard title="Shared with Me" value="8" change="+2 new" />
            <StatCard title="Team Members" value="5" />
            <StatCard title="Templates Used" value="12" />
          </div>

          {/* Recent Diagrams */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#ededed]">Recent Diagrams</h2>
              <button className="text-sm text-[#3ECF8E] hover:underline">View all</button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {/* Diagram Cards */}
              <DiagramCard
                name="AWS Infrastructure"
                thumbnail="/thumbnails/aws.png"
                updatedAt="2 hours ago"
                collaborators={3}
              />
              {/* More cards... */}
            </div>
          </section>

          {/* Quick Start Templates */}
          <section>
            <h2 className="text-lg font-semibold text-[#ededed] mb-4">Quick Start</h2>
            <div className="grid grid-cols-5 gap-4">
              <TemplateQuickCard icon={Cloud} label="AWS Architecture" color="#FF9900" />
              <TemplateQuickCard icon={Cloud} label="Azure Architecture" color="#0078D4" />
              <TemplateQuickCard icon={Cloud} label="GCP Architecture" color="#4285F4" />
              <TemplateQuickCard icon={GitBranch} label="Flowchart" color="#3ECF8E" />
              <TemplateQuickCard icon={Network} label="Network Diagram" color="#8B5CF6" />
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

function StatCard({ title, value, change }: { title: string; value: string; change?: string }) {
  return (
    <div className="p-4 rounded-lg bg-[#232323] border border-[#333]">
      <p className="text-sm text-[#666] mb-1">{title}</p>
      <p className="text-2xl font-semibold text-[#ededed]">{value}</p>
      {change && <p className="text-xs text-[#3ECF8E] mt-1">{change}</p>}
    </div>
  )
}

function DiagramCard({ name, thumbnail, updatedAt, collaborators }: {
  name: string
  thumbnail: string
  updatedAt: string
  collaborators?: number
}) {
  return (
    <div className="group rounded-lg bg-[#232323] border border-[#333] overflow-hidden hover:border-[#444] transition-colors cursor-pointer">
      {/* Thumbnail */}
      <div className="h-32 bg-[#2a2a2a] relative">
        {thumbnail && <img src={thumbnail} alt={name} className="w-full h-full object-cover" />}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button className="px-4 py-2 rounded-md bg-[#3ECF8E] text-[#1c1c1c] text-sm font-medium">
            Open
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium text-[#ededed] truncate">{name}</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-[#666]">{updatedAt}</p>
          {collaborators && (
            <div className="flex -space-x-1">
              {Array.from({ length: Math.min(collaborators, 3) }).map((_, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-[#232323]"
                />
              ))}
              {collaborators > 3 && (
                <div className="w-5 h-5 rounded-full bg-[#333] border-2 border-[#232323] flex items-center justify-center">
                  <span className="text-[8px] text-[#a1a1a1]">+{collaborators - 3}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## Part 5 — CSS Theme Updates

### 5.1 Tailwind Config Updates

```javascript
// tailwind.config.js

module.exports = {
  theme: {
    extend: {
      colors: {
        // Supabase-inspired dark theme
        background: {
          DEFAULT: '#1c1c1c',
          secondary: '#232323',
          tertiary: '#2a2a2a',
          elevated: '#303030',
        },
        border: {
          DEFAULT: '#333333',
          subtle: '#2a2a2a',
          strong: '#444444',
        },
        text: {
          primary: '#ededed',
          secondary: '#a1a1a1',
          muted: '#666666',
        },
        accent: {
          DEFAULT: '#3ECF8E',
          hover: '#2eb77a',
          muted: 'rgba(62, 207, 142, 0.15)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
    },
  },
}
```

### 5.2 Global CSS Updates

```css
/* styles/index.css */

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-[#1c1c1c] text-[#ededed] antialiased;
  }

  /* Scrollbar styling (like Supabase) */
  ::-webkit-scrollbar {
    @apply w-2 h-2;
  }

  ::-webkit-scrollbar-track {
    @apply bg-transparent;
  }

  ::-webkit-scrollbar-thumb {
    @apply bg-[#333] rounded-full hover:bg-[#444];
  }

  /* Focus styles */
  :focus-visible {
    @apply outline-none ring-2 ring-[#3ECF8E]/50 ring-offset-2 ring-offset-[#1c1c1c];
  }

  /* Selection */
  ::selection {
    @apply bg-[#3ECF8E]/30;
  }
}

@layer components {
  /* Input styles */
  .input-dark {
    @apply w-full px-3 py-2 rounded-md bg-[#232323] border border-[#333] text-sm text-[#ededed] placeholder-[#666];
    @apply focus:outline-none focus:border-[#3ECF8E]/50 focus:ring-1 focus:ring-[#3ECF8E]/20;
    @apply transition-colors;
  }

  /* Button styles */
  .btn-primary {
    @apply inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md;
    @apply bg-[#3ECF8E] hover:bg-[#2eb77a] text-[#1c1c1c] font-medium text-sm;
    @apply transition-colors focus:outline-none focus:ring-2 focus:ring-[#3ECF8E]/50;
  }

  .btn-secondary {
    @apply inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md;
    @apply bg-[#232323] hover:bg-[#2a2a2a] border border-[#333] hover:border-[#444];
    @apply text-[#ededed] font-medium text-sm transition-colors;
  }

  .btn-ghost {
    @apply inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-md;
    @apply text-[#a1a1a1] hover:text-[#ededed] hover:bg-[#2a2a2a] text-sm;
    @apply transition-colors;
  }

  /* Card styles */
  .card-dark {
    @apply rounded-lg bg-[#232323] border border-[#333] overflow-hidden;
    @apply hover:border-[#444] transition-colors;
  }

  /* Tab styles */
  .tab-bar {
    @apply flex border-b border-[#333];
  }

  .tab-item {
    @apply px-4 py-2.5 text-sm font-medium relative transition-colors;
    @apply text-[#666] hover:text-[#a1a1a1];
  }

  .tab-item.active {
    @apply text-[#ededed];
  }

  .tab-item.active::after {
    content: '';
    @apply absolute bottom-0 left-0 right-0 h-0.5 bg-[#3ECF8E];
  }
}
```

---

## Part 6 — Migration Checklist

### 6.1 Components to Update

| Component | Current | New | Priority |
|-----------|---------|-----|----------|
| `DashboardPage` | Light theme, grid layout | Dark theme, sidebar layout | High |
| `EditorPage` | Header + 3-column | Top bar + sidebar + canvas | High |
| `ShapePanel` | Wide left panel | Collapsible sidebar section | Medium |
| `PropertiesPanel` | Right panel | Tab-based right panel | Medium |
| `DiagramCard` | Light card | Dark card with hover | High |
| `Button` variants | Mixed | Primary/Secondary/Ghost | High |
| `Input` variants | Light | Dark with green focus | High |
| `Dialog` components | Light | Dark with borders | Medium |
| `Dropdown` menus | Light | Dark | Medium |
| `Toast` notifications | Default | Dark with accent colors | Low |

### 6.2 Implementation Order

**Week 1: Core Infrastructure**
1. Update Tailwind config with new colors
2. Create new global CSS styles
3. Build new Sidebar component
4. Build new TopBar component
5. Update Button and Input components

**Week 2: Page Layouts**
1. Redesign DashboardPage
2. Redesign EditorPage layout
3. Update PropertiesPanel with tabs
4. Update ShapePanel styling
5. Update all dialogs and modals

**Week 3: Polish & Testing**
1. Update remaining components
2. Test dark theme consistency
3. Add transitions and micro-interactions
4. Responsive design adjustments
5. Accessibility review

---

## Part 7 — Before/After Comparison

### Dashboard
| Before | After |
|--------|-------|
| Light background | Dark #1c1c1c background |
| Top navigation | Left sidebar navigation |
| Card grid | Card grid with dark cards |
| Blue accent | Green #3ECF8E accent |

### Editor
| Before | After |
|--------|-------|
| Wide shape panel | Collapsible sidebar |
| Wide properties panel | Tab-based right panel |
| Light toolbar | Dark horizontal toolbar |
| Blue selection | Green selection |

### General
| Before | After |
|--------|-------|
| White/gray theme | Dark theme |
| Blue primary buttons | Green primary buttons |
| Light inputs | Dark inputs with green focus |
| Default scrollbars | Styled dark scrollbars |

---

## Summary

This redesign will give Diagmo Pro:

1. ✅ **Professional dark theme** like Supabase
2. ✅ **Persistent sidebar navigation** for quick access
3. ✅ **Tab-based organization** for properties and panels
4. ✅ **Consistent design language** across all components
5. ✅ **Green accent color** (#3ECF8E) for brand identity
6. ✅ **Better information density** without clutter
7. ✅ **Modern UI patterns** that developers love

**All existing features remain unchanged** — only the visual presentation is updated!
