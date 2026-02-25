import { useState, useCallback } from 'react'
import { NavLink, useLocation, useSearchParams } from 'react-router-dom'
import { cn } from '@/utils'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useWorkspaces } from '@/hooks/useWorkspaces'
import { useFolders, useCreateFolder, useDeleteFolder, useSharedDiagrams, useDiagramsByFolder } from '@/hooks'
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
  FileText,
  File,
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
  ScrollArea,
} from '@/components/ui'
import { toast } from 'sonner'
import type { Folder as FolderType } from '@/types'

interface SidebarProps {
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
  onNewDiagram?: () => void
}

// Tree node component for folder hierarchy
interface FolderTreeNodeProps {
  folder: FolderType
  level: number
  selectedFolderId: string | null
  expandedFolders: Set<string>
  onSelectFolder: (folderId: string | null) => void
  onToggleExpand: (folderId: string) => void
  onDeleteFolder: (folderId: string, e: React.MouseEvent) => void
  onCreateSubfolder: (parentId: string) => void
  allFolders: FolderType[]
}

function FolderTreeNode({
  folder,
  level,
  selectedFolderId,
  expandedFolders,
  onSelectFolder,
  onToggleExpand,
  onDeleteFolder,
  onCreateSubfolder,
  allFolders,
}: FolderTreeNodeProps) {
  const childFolders = allFolders.filter(f => f.parentId === folder.id)
  const hasChildren = childFolders.length > 0
  const isExpanded = expandedFolders.has(folder.id)
  const isSelected = selectedFolderId === folder.id

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-1 w-full py-1 rounded-md text-sm transition-all cursor-pointer',
          isSelected
            ? 'bg-blue-500/10 text-blue-500'
            : 'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary'
        )}
        style={{ paddingLeft: `${8 + level * 16}px` }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand(folder.id)
            }}
            className="p-0.5 hover:bg-supabase-bg-tertiary rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>
        ) : (
          <span className="w-4" /> // Spacer for alignment
        )}
        <button
          onClick={() => onSelectFolder(folder.id)}
          className="flex items-center gap-2 flex-1 min-w-0"
        >
          <Folder className="w-4 h-4 flex-shrink-0 text-supabase-text-muted" />
          <span className="flex-1 text-left truncate">{folder.name}</span>
        </button>
        {/* Create subfolder button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onCreateSubfolder(folder.id)
          }}
          className="p-0.5 opacity-0 group-hover:opacity-100 text-supabase-text-muted hover:text-supabase-green transition-all"
          title="Create subfolder"
        >
          <FolderPlus className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => onDeleteFolder(folder.id, e)}
          className="p-0.5 opacity-0 group-hover:opacity-100 text-supabase-text-muted hover:text-red-500 transition-all mr-2"
          title="Delete folder"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {childFolders.map(child => (
            <FolderTreeNode
              key={child.id}
              folder={child}
              level={level + 1}
              selectedFolderId={selectedFolderId}
              expandedFolders={expandedFolders}
              onSelectFolder={onSelectFolder}
              onToggleExpand={onToggleExpand}
              onDeleteFolder={onDeleteFolder}
              onCreateSubfolder={onCreateSubfolder}
              allFolders={allFolders}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function Sidebar({ collapsed = false, onCollapse, onNewDiagram }: SidebarProps) {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [expandedSections, setExpandedSections] = useState(['DOCUMENTS'])
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [parentFolderId, setParentFolderId] = useState<string | null>(null)
  const { currentWorkspaceId, setCurrentWorkspace, setWorkspaceSettingsOpen } = useWorkspaceStore()
  const { data: workspaces = [] } = useWorkspaces()
  const { data: folders = [], isLoading: foldersLoading } = useFolders()
  const { data: sharedDiagrams } = useSharedDiagrams()
  const createFolder = useCreateFolder()
  const deleteFolder = useDeleteFolder()

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId)
  const selectedFolderId = searchParams.get('folder')
  const currentView = searchParams.get('view')
  const sharedCount = sharedDiagrams?.length || 0

  // Get root-level folders (no parent)
  const rootFolders = folders.filter(f => !f.parentId)

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return
    try {
      await createFolder.mutateAsync({ name: newFolderName.trim(), parentId: parentFolderId })
      // Auto-expand parent folder if creating subfolder
      if (parentFolderId) {
        setExpandedFolders(prev => new Set([...prev, parentFolderId]))
      }
      setNewFolderName('')
      setIsCreatingFolder(false)
      setParentFolderId(null)
      toast.success(parentFolderId ? 'Subfolder created' : 'Folder created')
    } catch {
      toast.error('Failed to create folder')
    }
  }

  const handleCreateSubfolder = useCallback((parentId: string) => {
    setParentFolderId(parentId)
    setIsCreatingFolder(true)
    setNewFolderName('')
  }, [])

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
    const newParams = new URLSearchParams()
    if (folderId) {
      newParams.set('folder', folderId)
    }
    setSearchParams(newParams)
  }

  const handleToggleExpand = useCallback((folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev)
      if (next.has(folderId)) {
        next.delete(folderId)
      } else {
        next.add(folderId)
      }
      return next
    })
  }, [])

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    )
  }

  const handleNavigate = (view: string | null) => {
    const newParams = new URLSearchParams()
    if (view) {
      newParams.set('view', view)
    }
    setSearchParams(newParams)
  }

  return (
    <aside
      className={cn(
        'flex flex-col h-screen border-r transition-all duration-200',
        'bg-supabase-bg border-supabase-border',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-12 px-3 border-b border-supabase-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">D</span>
          </div>
          {!collapsed && (
            <span className="font-semibold text-supabase-text-primary text-sm">Diagmo</span>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={() => onCollapse?.(true)}
            className="p-1 rounded-md text-supabase-text-muted hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary transition-colors cursor-pointer"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
        {collapsed && (
          <button
            onClick={() => onCollapse?.(false)}
            className="p-1 rounded-md text-supabase-text-muted hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary transition-colors cursor-pointer"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="py-2">
          {/* Quick Access */}
          <div className="px-2 space-y-0.5">
            {/* Recent */}
            <NavItem
              icon={Clock}
              label="Recent"
              collapsed={collapsed}
              active={currentView === 'recent'}
              onClick={() => handleNavigate('recent')}
            />

            {/* Starred */}
            <NavItem
              icon={Star}
              label="Starred"
              collapsed={collapsed}
              active={currentView === 'favorites'}
              onClick={() => handleNavigate('favorites')}
            />
          </div>

          {/* Documents Section */}
          {!collapsed && (
            <div className="mt-4">
              <div className="flex items-center justify-between px-3 py-1">
                <button
                  onClick={() => toggleSection('DOCUMENTS')}
                  className="flex items-center gap-1 text-xs font-medium text-supabase-text-muted hover:text-supabase-text-secondary transition-colors cursor-pointer"
                >
                  {expandedSections.includes('DOCUMENTS') ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  <span>Documents</span>
                </button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        setParentFolderId(null)
                        setIsCreatingFolder(true)
                      }}
                      className="p-1 rounded text-supabase-text-muted hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary transition-colors"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Create folder</TooltipContent>
                </Tooltip>
              </div>

              {expandedSections.includes('DOCUMENTS') && (
                <div className="mt-1">
                  {/* My documents */}
                  <div className="px-2">
                    <button
                      onClick={() => handleSelectFolder(null)}
                      className={cn(
                        'flex items-center gap-2 w-full py-1.5 px-2 rounded-md text-sm transition-all',
                        !selectedFolderId && !currentView
                          ? 'bg-blue-500/10 text-blue-500'
                          : 'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary'
                      )}
                    >
                      <File className="w-4 h-4 text-supabase-text-muted" />
                      <span>My documents</span>
                    </button>
                  </div>

                  {/* Create folder input */}
                  {isCreatingFolder && (
                    <div className="mx-2 mt-1">
                      {parentFolderId && (
                        <div className="text-[10px] text-supabase-text-muted mb-1 px-2">
                          Creating in: {folders.find(f => f.id === parentFolderId)?.name}
                        </div>
                      )}
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
                              setParentFolderId(null)
                            }
                          }}
                          placeholder={parentFolderId ? "Subfolder name" : "Folder name"}
                          className="h-6 text-xs border-0 bg-transparent p-0 focus-visible:ring-0"
                          autoFocus
                        />
                        <button
                          onClick={handleCreateFolder}
                          disabled={!newFolderName.trim() || createFolder.isPending}
                          className="p-0.5 text-green-600 hover:text-green-700 disabled:opacity-50"
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
                            setParentFolderId(null)
                          }}
                          className="p-0.5 text-supabase-text-muted hover:text-supabase-text-primary"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Folder Tree */}
                  <div className="px-2 mt-1">
                    {foldersLoading ? (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="w-4 h-4 animate-spin text-supabase-text-muted" />
                      </div>
                    ) : rootFolders.length > 0 ? (
                      rootFolders.map(folder => (
                        <FolderTreeNode
                          key={folder.id}
                          folder={folder}
                          level={1}
                          selectedFolderId={selectedFolderId}
                          expandedFolders={expandedFolders}
                          onSelectFolder={handleSelectFolder}
                          onToggleExpand={handleToggleExpand}
                          onDeleteFolder={handleDeleteFolder}
                          onCreateSubfolder={handleCreateSubfolder}
                          allFolders={folders}
                        />
                      ))
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Trash */}
          {!collapsed && (
            <div className="px-2 mt-2">
              <NavItem
                icon={Trash2}
                label="Trash"
                collapsed={collapsed}
                active={currentView === 'trash'}
                onClick={() => handleNavigate('trash')}
              />
            </div>
          )}

          {/* Shared with me */}
          {!collapsed && (
            <div className="mt-4 pt-4 border-t border-supabase-border">
              <div className="px-2">
                <button
                  onClick={() => handleNavigate('shared')}
                  className={cn(
                    'flex items-center gap-2 w-full py-1.5 px-2 rounded-md text-sm transition-all',
                    currentView === 'shared'
                      ? 'bg-blue-500/10 text-blue-500'
                      : 'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary'
                  )}
                >
                  <Users className="w-4 h-4 text-supabase-text-muted" />
                  <span className="flex-1 text-left">Shared with me</span>
                  {sharedCount > 0 && (
                    <span className="text-xs bg-supabase-bg-tertiary text-supabase-text-muted px-1.5 py-0.5 rounded-full">
                      {sharedCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Workspace Selector - at bottom of nav */}
          {!collapsed && (
            <div className="mt-4 pt-4 border-t border-supabase-border px-3">
              <p className="text-xs font-medium text-supabase-text-muted mb-2 px-2">Workspace</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full flex items-center justify-between px-2 py-1.5 rounded-md bg-supabase-bg-secondary hover:bg-supabase-bg-tertiary border border-supabase-border text-sm transition-colors cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-supabase-green-muted flex items-center justify-center">
                        <span className="text-supabase-green text-xs font-medium">
                          {currentWorkspace?.name?.[0]?.toUpperCase() || 'P'}
                        </span>
                      </div>
                      <span className="text-supabase-text-primary truncate text-xs">
                        {currentWorkspace?.name || 'Personal'}
                      </span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-supabase-text-muted flex-shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-supabase-bg-secondary border-supabase-border">
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
                    Personal
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
                  {currentWorkspaceId && (
                    <DropdownMenuItem
                      onClick={() => setWorkspaceSettingsOpen(true, currentWorkspaceId)}
                      className="text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Workspace Settings
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </nav>
      </ScrollArea>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-supabase-border">
        <button
          onClick={onNewDiagram}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md',
            'bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm',
            'transition-colors cursor-pointer'
          )}
        >
          <Plus className="w-4 h-4" />
          {!collapsed && <span>New</span>}
        </button>
      </div>

      {/* Dialogs */}
      <WorkspaceSettingsDialog />
      <CreateWorkspaceDialog
        open={createWorkspaceOpen}
        onOpenChange={setCreateWorkspaceOpen}
      />
    </aside>
  )
}

// Nav item component
interface NavItemProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  collapsed?: boolean
  active?: boolean
  onClick?: () => void
  badge?: number
}

function NavItem({ icon: Icon, label, collapsed, active, onClick, badge }: NavItemProps) {
  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              'flex items-center justify-center p-2 rounded-md text-sm transition-all cursor-pointer w-full',
              active
                ? 'bg-blue-500/10 text-blue-500'
                : 'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary'
            )}
          >
            <Icon className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-all cursor-pointer w-full',
        active
          ? 'bg-blue-500/10 text-blue-500'
          : 'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary'
      )}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && (
        <span className="px-1.5 py-0.5 text-xs rounded-full bg-supabase-border text-supabase-text-secondary">
          {badge}
        </span>
      )}
    </button>
  )
}
