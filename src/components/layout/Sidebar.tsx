import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/utils'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useWorkspaces } from '@/hooks/useWorkspaces'
import {
  Home,
  FolderOpen,
  Users,
  Star,
  Clock,
  Cloud,
  GitBranch,
  Network,
  Settings,
  Key,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui'

interface SidebarProps {
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
  onNewDiagram?: () => void
}

export function Sidebar({ collapsed = false, onCollapse, onNewDiagram }: SidebarProps) {
  const location = useLocation()
  const [expandedSections, setExpandedSections] = useState(['TEMPLATES'])
  const { currentWorkspaceId, setCurrentWorkspace } = useWorkspaceStore()
  const { data: workspaces = [] } = useWorkspaces()

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId)

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    )
  }

  return (
    <aside
      className={cn(
        'flex flex-col h-screen border-r transition-all duration-200',
        'bg-supabase-bg border-supabase-border',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-supabase-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-supabase-green to-supabase-green-hover flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          {!collapsed && (
            <span className="font-semibold text-supabase-text-primary">Diagmo Pro</span>
          )}
        </div>
        {!collapsed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onCollapse?.(true)}
                className="p-1.5 rounded-md text-supabase-text-muted hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary transition-colors"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Collapse sidebar</TooltipContent>
          </Tooltip>
        )}
        {collapsed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onCollapse?.(false)}
                className="p-1.5 rounded-md text-supabase-text-muted hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary transition-colors"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Expand sidebar</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Workspace Selector */}
      {!collapsed && (
        <div className="p-3 border-b border-supabase-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-supabase-bg-secondary hover:bg-supabase-bg-tertiary border border-supabase-border text-sm transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-supabase-green-muted flex items-center justify-center">
                    <span className="text-supabase-green text-xs font-medium">
                      {currentWorkspace?.name?.[0]?.toUpperCase() || 'P'}
                    </span>
                  </div>
                  <span className="text-supabase-text-primary truncate">
                    {currentWorkspace?.name || 'Personal Workspace'}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-supabase-text-muted flex-shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-supabase-bg-secondary border-supabase-border">
              <DropdownMenuItem
                onClick={() => setCurrentWorkspace(null)}
                className={cn(
                  'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary',
                  !currentWorkspaceId && 'bg-supabase-green-muted text-supabase-green'
                )}
              >
                <div className="w-5 h-5 rounded bg-supabase-green-muted flex items-center justify-center mr-2">
                  <span className="text-supabase-green text-xs font-medium">P</span>
                </div>
                Personal Workspace
              </DropdownMenuItem>
              {workspaces.length > 0 && <DropdownMenuSeparator className="bg-supabase-border" />}
              {workspaces.map((workspace) => (
                <DropdownMenuItem
                  key={workspace.id}
                  onClick={() => setCurrentWorkspace(workspace.id)}
                  className={cn(
                    'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary',
                    currentWorkspaceId === workspace.id && 'bg-supabase-green-muted text-supabase-green'
                  )}
                >
                  <div className="w-5 h-5 rounded bg-supabase-green-muted flex items-center justify-center mr-2">
                    <span className="text-supabase-green text-xs font-medium">
                      {workspace.name[0]?.toUpperCase()}
                    </span>
                  </div>
                  {workspace.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Search */}
      {!collapsed && (
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-supabase-text-muted" />
            <input
              type="text"
              placeholder="Search diagrams..."
              className="w-full pl-9 pr-12 py-2 rounded-md bg-supabase-bg-secondary border border-supabase-border text-sm text-supabase-text-primary placeholder-supabase-text-muted focus:outline-none focus:border-supabase-green/50 focus:ring-1 focus:ring-supabase-green/20 transition-colors"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] text-supabase-text-muted bg-supabase-bg-tertiary rounded border border-supabase-border">
              Ctrl+K
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
            active={location.pathname === '/dashboard' && !location.search}
          />
          <SidebarItem
            icon={FolderOpen}
            label="My Diagrams"
            href="/dashboard"
            collapsed={collapsed}
            active={location.pathname === '/dashboard'}
          />
          <SidebarItem
            icon={Users}
            label="Shared with Me"
            href="/dashboard?view=shared"
            collapsed={collapsed}
            active={location.search.includes('view=shared')}
          />
          <SidebarItem
            icon={Star}
            label="Favorites"
            href="/dashboard?view=favorites"
            collapsed={collapsed}
            active={location.search.includes('view=favorites')}
          />
          <SidebarItem
            icon={Clock}
            label="Recent"
            href="/dashboard?view=recent"
            collapsed={collapsed}
            active={location.search.includes('view=recent')}
          />
        </div>

        {/* Templates Section */}
        {!collapsed && (
          <div className="mt-6">
            <button
              onClick={() => toggleSection('TEMPLATES')}
              className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-medium text-supabase-text-muted hover:text-supabase-text-secondary transition-colors"
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
                <SidebarItem icon={Cloud} label="AWS" href="/dashboard?template=aws" />
                <SidebarItem icon={Cloud} label="Azure" href="/dashboard?template=azure" />
                <SidebarItem icon={Cloud} label="GCP" href="/dashboard?template=gcp" />
                <SidebarItem icon={GitBranch} label="Flowcharts" href="/dashboard?template=flowchart" />
                <SidebarItem icon={Network} label="Network" href="/dashboard?template=network" />
              </div>
            )}
          </div>
        )}

        {/* Workspace Section */}
        {!collapsed && (
          <div className="mt-6">
            <button
              onClick={() => toggleSection('WORKSPACE')}
              className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-medium text-supabase-text-muted hover:text-supabase-text-secondary transition-colors"
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
      <div className="p-3 border-t border-supabase-border">
        <button
          onClick={onNewDiagram}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md',
            'bg-supabase-green hover:bg-supabase-green-hover text-supabase-bg font-medium text-sm',
            'transition-colors'
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
  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <NavLink
            to={href}
            className={cn(
              'flex items-center justify-center p-2 rounded-md text-sm transition-colors',
              active
                ? 'bg-supabase-green-muted text-supabase-green'
                : 'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary'
            )}
          >
            <Icon className="w-4 h-4" />
          </NavLink>
        </TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <NavLink
      to={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
        active
          ? 'bg-supabase-green-muted text-supabase-green'
          : 'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary'
      )}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">{label}</span>
      {badge !== undefined && (
        <span className="px-1.5 py-0.5 text-xs rounded-full bg-supabase-border text-supabase-text-secondary">
          {badge}
        </span>
      )}
    </NavLink>
  )
}
