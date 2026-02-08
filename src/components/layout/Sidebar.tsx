import { useState } from 'react'
import { NavLink, useLocation, useSearchParams } from 'react-router-dom'
import { cn } from '@/utils'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useWorkspaces } from '@/hooks/useWorkspaces'
import { useFolders, useCreateFolder, useDeleteFolder } from '@/hooks'
import { WorkspaceSettingsDialog } from '@/components/dashboard/WorkspaceSettingsDialog'
import { CreateWorkspaceDialog } from '@/components/dashboard/CreateWorkspaceDialog'
import {
  Home,
  FolderOpen,
  Folder,
  FolderPlus,
  Users,
  Star,
  Clock,
  Cloud,
  GitBranch,
  Network,
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  PanelLeftClose,
  PanelLeft,
  Trash2,
  Loader2,
  X,
  Check,
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
  Input,
} from '@/components/ui'
import { toast } from 'sonner'

interface SidebarProps {
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
  onNewDiagram?: () => void
}

export function Sidebar({ collapsed = false, onCollapse, onNewDiagram }: SidebarProps) {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [expandedSections, setExpandedSections] = useState(['TEMPLATES', 'FOLDERS'])
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const { currentWorkspaceId, setCurrentWorkspace, setWorkspaceSettingsOpen } = useWorkspaceStore()
  const { data: workspaces = [] } = useWorkspaces()
  const { data: folders = [], isLoading: foldersLoading } = useFolders()
  const createFolder = useCreateFolder()
  const deleteFolder = useDeleteFolder()

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId)
  const selectedFolderId = searchParams.get('folder')

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return
    try {
      await createFolder.mutateAsync({ name: newFolderName.trim() })
      setNewFolderName('')
      setIsCreatingFolder(false)
      toast.success('Folder created')
    } catch {
      toast.error('Failed to create folder')
    }
  }

  const handleDeleteFolder = async (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!confirm('Delete this folder? Diagrams in this folder will be moved to "All Diagrams".')) return
    try {
      await deleteFolder.mutateAsync(folderId)
      if (selectedFolderId === folderId) {
        setSearchParams({})
      }
      toast.success('Folder deleted')
    } catch {
      toast.error('Failed to delete folder')
    }
  }

  const handleSelectFolder = (folderId: string | null) => {
    if (folderId) {
      setSearchParams({ folder: folderId })
    } else {
      setSearchParams({})
    }
  }

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
                className="p-1.5 rounded-md text-supabase-text-muted hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary transition-colors cursor-pointer"
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
                className="p-1.5 rounded-md text-supabase-text-muted hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary transition-colors cursor-pointer"
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
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-supabase-bg-secondary hover:bg-supabase-bg-tertiary border border-supabase-border text-sm transition-colors cursor-pointer">
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
              <DropdownMenuSeparator className="bg-supabase-border" />
              <DropdownMenuItem
                onClick={() => setCreateWorkspaceOpen(true)}
                className="text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Workspace
              </DropdownMenuItem>
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
            active={location.pathname === '/dashboard' && !searchParams.get('view') && !searchParams.get('folder')}
          />
          <SidebarItem
            icon={FolderOpen}
            label="My Diagrams"
            href="/dashboard"
            collapsed={collapsed}
            active={false}
          />
          <SidebarItem
            icon={Users}
            label="Shared with Me"
            href="/dashboard?view=shared"
            collapsed={collapsed}
            active={searchParams.get('view') === 'shared'}
          />
          <SidebarItem
            icon={Star}
            label="Favorites"
            href="/dashboard?view=favorites"
            collapsed={collapsed}
            active={searchParams.get('view') === 'favorites'}
          />
          <SidebarItem
            icon={Clock}
            label="Recent"
            href="/dashboard?view=recent"
            collapsed={collapsed}
            active={searchParams.get('view') === 'recent'}
          />
        </div>

        {/* Folders Section */}
        {!collapsed && (
          <div className="mt-6">
            <div className="flex items-center justify-between px-3 py-1.5">
              <button
                onClick={() => toggleSection('FOLDERS')}
                className="flex items-center gap-1 text-xs font-medium text-supabase-text-muted hover:text-supabase-text-secondary transition-colors cursor-pointer"
              >
                {expandedSections.includes('FOLDERS') ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
                <span>FOLDERS</span>
              </button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setIsCreatingFolder(true)}
                    className="p-1 rounded text-supabase-text-muted hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary transition-colors"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Create folder</TooltipContent>
              </Tooltip>
            </div>
            {expandedSections.includes('FOLDERS') && (
              <div className="px-3 mt-1 space-y-1">
                {/* Create folder input */}
                {isCreatingFolder && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-supabase-bg-secondary rounded-md border border-supabase-border">
                    <Folder className="w-4 h-4 text-supabase-text-muted flex-shrink-0" />
                    <Input
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateFolder()
                        if (e.key === 'Escape') {
                          setIsCreatingFolder(false)
                          setNewFolderName('')
                        }
                      }}
                      placeholder="Folder name"
                      className="h-6 text-xs border-0 bg-transparent p-0 focus-visible:ring-0"
                      autoFocus
                    />
                    <button
                      onClick={handleCreateFolder}
                      disabled={!newFolderName.trim() || createFolder.isPending}
                      className="p-0.5 text-supabase-green hover:text-supabase-green-hover disabled:opacity-50"
                    >
                      {createFolder.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsCreatingFolder(false)
                        setNewFolderName('')
                      }}
                      className="p-0.5 text-supabase-text-muted hover:text-supabase-text-primary"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* All Diagrams - only highlighted when no folder AND no special view */}
                <button
                  onClick={() => handleSelectFolder(null)}
                  className={cn(
                    'flex items-center gap-3 w-full px-2 py-1.5 rounded-md text-sm transition-all',
                    !selectedFolderId && !searchParams.get('view')
                      ? 'bg-black/10 dark:bg-white/10 text-supabase-text-primary'
                      : 'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-black/5 dark:hover:bg-white/5'
                  )}
                >
                  <FolderOpen className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 text-left truncate">All Diagrams</span>
                </button>

                {/* Folder list */}
                {foldersLoading ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-supabase-text-muted" />
                  </div>
                ) : folders.length === 0 ? (
                  <p className="px-2 py-1.5 text-xs text-supabase-text-muted">No folders yet</p>
                ) : (
                  folders.map((folder) => (
                    <div
                      key={folder.id}
                      className={cn(
                        'group flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm transition-all',
                        selectedFolderId === folder.id
                          ? 'bg-black/10 dark:bg-white/10 text-supabase-text-primary'
                          : 'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-black/5 dark:hover:bg-white/5'
                      )}
                    >
                      <button
                        onClick={() => handleSelectFolder(folder.id)}
                        className="flex items-center gap-3 flex-1 min-w-0"
                      >
                        <Folder className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1 text-left truncate">{folder.name}</span>
                      </button>
                      <button
                        onClick={(e) => handleDeleteFolder(folder.id, e)}
                        className="p-0.5 opacity-0 group-hover:opacity-100 text-supabase-text-muted hover:text-red-500 transition-all"
                        title="Delete folder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Templates Section */}
        {!collapsed && (
          <div className="mt-6">
            <button
              onClick={() => toggleSection('TEMPLATES')}
              className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-medium text-supabase-text-muted hover:text-supabase-text-secondary transition-colors cursor-pointer"
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
                <SidebarButton icon={Cloud} label="AWS" onClick={() => onNewDiagram?.()} />
                <SidebarButton icon={Cloud} label="Azure" onClick={() => onNewDiagram?.()} />
                <SidebarButton icon={Cloud} label="GCP" onClick={() => onNewDiagram?.()} />
                <SidebarButton icon={GitBranch} label="Flowcharts" onClick={() => onNewDiagram?.()} />
                <SidebarButton icon={Network} label="Network" onClick={() => onNewDiagram?.()} />
              </div>
            )}
          </div>
        )}

        {/* Workspace Section */}
        {!collapsed && (
          <div className="mt-6">
            <button
              onClick={() => toggleSection('WORKSPACE')}
              className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-medium text-supabase-text-muted hover:text-supabase-text-secondary transition-colors cursor-pointer"
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
                <SidebarButton
                  icon={Settings}
                  label="Settings"
                  onClick={() => setWorkspaceSettingsOpen(true, currentWorkspaceId)}
                  disabled={!currentWorkspaceId}
                  tooltip={!currentWorkspaceId ? 'Select a workspace first' : undefined}
                />
                <SidebarButton
                  icon={Users}
                  label="Team"
                  onClick={() => setWorkspaceSettingsOpen(true, currentWorkspaceId)}
                  disabled={!currentWorkspaceId}
                  tooltip={!currentWorkspaceId ? 'Select a workspace first' : undefined}
                />
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
            'transition-colors cursor-pointer'
          )}
        >
          <Plus className="w-4 h-4" />
          {!collapsed && <span>New Diagram</span>}
        </button>
      </div>

      {/* Workspace Settings Dialog - rendered via store state */}
      <WorkspaceSettingsDialog />

      {/* Create Workspace Dialog */}
      <CreateWorkspaceDialog
        open={createWorkspaceOpen}
        onOpenChange={setCreateWorkspaceOpen}
      />
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
              'flex items-center justify-center p-2 rounded-md text-sm transition-all cursor-pointer',
              active
                ? 'bg-black/10 dark:bg-white/10 text-supabase-text-primary'
                : 'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-black/5 dark:hover:bg-white/5'
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
        'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all cursor-pointer',
        active
          ? 'bg-black/10 dark:bg-white/10 text-supabase-text-primary'
          : 'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-black/5 dark:hover:bg-white/5'
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

// Button variant for non-navigation actions
interface SidebarButtonProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  disabled?: boolean
  tooltip?: string
}

function SidebarButton({ icon: Icon, label, onClick, disabled, tooltip }: SidebarButtonProps) {
  const button = (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all w-full text-left',
        disabled
          ? 'text-supabase-text-muted cursor-not-allowed'
          : 'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer'
      )}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">{label}</span>
    </button>
  )

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    )
  }

  return button
}
