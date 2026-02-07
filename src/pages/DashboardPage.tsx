import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useDiagramsByFolder, useCreateDiagram, useSharedDiagrams, useWorkspaces } from '@/hooks'
import type { Diagram } from '@/types'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui'
import { DiagramCard } from '@/components/dashboard/DiagramCard'
import { DiagramCardSkeleton } from '@/components/dashboard/DiagramCardSkeleton'
import { DiagramListItem } from '@/components/dashboard/DiagramListItem'
import { DiagramListItemSkeleton } from '@/components/dashboard/DiagramListItemSkeleton'
import { SearchBar } from '@/components/dashboard/SearchBar'
import { TemplateGallery } from '@/components/dashboard/TemplateGallery'
import { PendingInvitesBanner } from '@/components/dashboard/PendingInvitesBanner'
import { DIAGRAM_TEMPLATES, type DiagramTemplate } from '@/constants/templates'
import { TemplateQuickCard } from '@/components/dashboard/TemplateQuickCard'
import { Sidebar, TopBar } from '@/components/layout'
import {
  Plus,
  FolderOpen,
  LayoutGrid,
  List,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  Users,
  FileText,
  Share2,
  UsersIcon,
  Sparkles,
} from 'lucide-react'

type ViewMode = 'grid' | 'list'
type SortBy = 'updated' | 'created' | 'name'
type SortOrder = 'asc' | 'desc'

// Stat Card component for dashboard
function StatCard({ title, value, change, icon: Icon }: {
  title: string
  value: string | number
  change?: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="p-4 rounded-lg bg-supabase-bg-secondary border border-supabase-border">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-supabase-text-muted">{title}</p>
        {Icon && <Icon className="w-4 h-4 text-supabase-text-muted" />}
      </div>
      <p className="text-2xl font-semibold text-supabase-text-primary">{value}</p>
      {change && <p className="text-xs text-supabase-green mt-1">{change}</p>}
    </div>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { currentWorkspaceId } = useWorkspaceStore()
  const [selectedFolderId] = useState<string | null>(null)
  const [showShared] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showTemplateGallery, setShowTemplateGallery] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('updated')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Get current workspace name for display
  const { data: workspaces = [] } = useWorkspaces()
  const currentWorkspace = workspaces.find(w => w.id === currentWorkspaceId)

  const { data: ownDiagrams, isLoading: isLoadingOwn, error: errorOwn } = useDiagramsByFolder(selectedFolderId, currentWorkspaceId)
  const { data: sharedDiagramsData, isLoading: isLoadingShared, error: errorShared } = useSharedDiagrams()
  const createDiagram = useCreateDiagram()

  // Convert shared diagrams to the same format as own diagrams
  const sharedDiagrams: Diagram[] = useMemo(() => {
    if (!sharedDiagramsData) return []
    return sharedDiagramsData.map((item) => ({
      id: item.diagram.id,
      name: item.diagram.name,
      description: item.diagram.description || '',
      nodes: item.diagram.nodes as Diagram['nodes'],
      edges: item.diagram.edges as Diagram['edges'],
      thumbnail: item.diagram.thumbnail ?? undefined,
      userId: '', // Not the current user's diagram
      folderId: undefined,
      createdAt: item.diagram.createdAt,
      updatedAt: item.diagram.updatedAt,
    }))
  }, [sharedDiagramsData])

  const diagrams = showShared ? sharedDiagrams : ownDiagrams
  const isLoading = showShared ? isLoadingShared : isLoadingOwn
  const error = showShared ? errorShared : errorOwn

  const filteredDiagrams = useMemo(() => {
    if (!diagrams) return []
    if (!searchQuery.trim()) return diagrams

    const query = searchQuery.toLowerCase()
    return diagrams.filter(
      (d) =>
        d.name.toLowerCase().includes(query) ||
        d.description?.toLowerCase().includes(query)
    )
  }, [diagrams, searchQuery])

  const sortedDiagrams = useMemo(() => {
    const sorted = [...filteredDiagrams].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'created':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'updated':
        default:
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      }
    })
    return sortOrder === 'desc' ? sorted.reverse() : sorted
  }, [filteredDiagrams, sortBy, sortOrder])

  const handleCreateDiagram = async (template?: DiagramTemplate) => {
    try {
      const newDiagram = await createDiagram.mutateAsync({
        name: template?.id === 'blank' ? 'Untitled Diagram' : template?.name || 'Untitled Diagram',
        nodes: template?.nodes || [],
        edges: template?.edges || [],
        folderId: selectedFolderId || undefined,
        workspaceId: currentWorkspaceId || undefined,
      })
      setShowTemplateGallery(false)
      navigate(`/editor/${newDiagram.id}`)
    } catch (err) {
      console.error('Failed to create diagram:', err)
    }
  }

  const handleOpenTemplateGallery = () => {
    setShowTemplateGallery(true)
  }

  const sortLabel = sortBy === 'updated' ? 'Updated' : sortBy === 'created' ? 'Created' : 'Name'

  // Calculate stats
  const totalDiagrams = ownDiagrams?.length || 0
  const sharedWithMeCount = sharedDiagrams?.length || 0
  const teamMembersCount = workspaces.reduce((acc, w) => acc + (w.memberCount || 0), 0)

  return (
    <div className="flex h-screen bg-supabase-bg">
      {/* New Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
        onNewDiagram={handleOpenTemplateGallery}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TopBar */}
        <TopBar
          breadcrumbs={[
            { label: 'Home', href: '/dashboard' },
            { label: showShared ? 'Shared with Me' : currentWorkspace?.name || 'My Diagrams' },
          ]}
          showSearch={false}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Pending Invites Banner */}
            <PendingInvitesBanner />

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                title="Total Diagrams"
                value={totalDiagrams}
                icon={FileText}
              />
              <StatCard
                title="Shared with Me"
                value={sharedWithMeCount}
                change={sharedWithMeCount > 0 ? `${sharedWithMeCount} available` : undefined}
                icon={Share2}
              />
              <StatCard
                title="Team Members"
                value={teamMembersCount || '-'}
                icon={UsersIcon}
              />
              <StatCard
                title="Templates Used"
                value={DIAGRAM_TEMPLATES.length}
                icon={Sparkles}
              />
            </div>

            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-supabase-text-primary">
                  {showShared
                    ? 'Shared with me'
                    : currentWorkspace
                    ? currentWorkspace.name
                    : 'My Diagrams'}
                </h1>
                <p className="text-sm text-supabase-text-muted mt-1">
                  {showShared
                    ? 'Diagrams that others have shared with you'
                    : currentWorkspace
                    ? currentWorkspace.description || 'Team workspace'
                    : `Welcome back${user?.email ? `, ${user.email.split('@')[0]}` : ''}`}
                </p>
              </div>
              <Button
                onClick={handleOpenTemplateGallery}
                className="bg-supabase-green hover:bg-supabase-green-hover text-supabase-bg"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Diagram
              </Button>
            </div>

            {/* Toolbar: Search + Sort + View Toggle */}
            <div className="flex items-center gap-3 mb-6">
              <div className="max-w-md flex-1">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search diagrams..."
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-1.5 border-supabase-border bg-supabase-bg-secondary text-supabase-text-secondary hover:bg-supabase-bg-tertiary hover:text-supabase-text-primary">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{sortLabel}</span>
                    {sortOrder === 'asc' ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-supabase-bg-secondary border-supabase-border">
                  <DropdownMenuItem onClick={() => setSortBy('updated')} className="text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary">
                    {sortBy === 'updated' && <Check className="h-3.5 w-3.5 mr-2" />}
                    <span className={sortBy !== 'updated' ? 'ml-[22px]' : ''}>Last updated</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('created')} className="text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary">
                    {sortBy === 'created' && <Check className="h-3.5 w-3.5 mr-2" />}
                    <span className={sortBy !== 'created' ? 'ml-[22px]' : ''}>Date created</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('name')} className="text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary">
                    {sortBy === 'name' && <Check className="h-3.5 w-3.5 mr-2" />}
                    <span className={sortBy !== 'name' ? 'ml-[22px]' : ''}>Name</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-supabase-border" />
                  <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary">
                    {sortOrder === 'asc' ? (
                      <ArrowUp className="h-3.5 w-3.5 mr-2" />
                    ) : (
                      <ArrowDown className="h-3.5 w-3.5 mr-2" />
                    )}
                    {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex border border-supabase-border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-9 px-2.5 rounded-r-none border-0"
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-9 px-2.5 rounded-l-none border-0"
                  onClick={() => setViewMode('list')}
                  title="List view"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {isLoading ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <DiagramCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <DiagramListItemSkeleton key={i} />
                  ))}
                </div>
              )
            ) : error ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-destructive">Failed to load diagrams</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {error instanceof Error ? error.message : 'Unknown error'}
                  </p>
                </CardContent>
              </Card>
            ) : sortedDiagrams.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sortedDiagrams.map((diagram) => (
                    <DiagramCard
                      key={diagram.id}
                      diagram={diagram}
                      onClick={() => navigate(`/editor/${diagram.id}`)}
                      isShared={showShared}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedDiagrams.map((diagram) => (
                    <DiagramListItem
                      key={diagram.id}
                      diagram={diagram}
                      onClick={() => navigate(`/editor/${diagram.id}`)}
                      isShared={showShared}
                    />
                  ))}
                </div>
              )
            ) : searchQuery ? (
              <Card>
                <CardHeader className="text-center">
                  <CardTitle>No results found</CardTitle>
                  <CardDescription>
                    No diagrams match &quot;{searchQuery}&quot;
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : showShared ? (
              <div className="flex flex-col items-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold">No shared diagrams</h2>
                <p className="text-muted-foreground mt-1">
                  Diagrams that others share with you will appear here
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center py-8">
                <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold">Get started</h2>
                <p className="text-muted-foreground mt-1 mb-8">Choose a template or start from scratch</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl w-full">
                  {DIAGRAM_TEMPLATES.slice(0, 4).map((template) => (
                    <TemplateQuickCard
                      key={template.id}
                      template={template}
                      onClick={() => handleCreateDiagram(template)}
                    />
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={handleOpenTemplateGallery}
                >
                  Browse all templates
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Template Gallery Dialog */}
      <TemplateGallery
        open={showTemplateGallery}
        onOpenChange={setShowTemplateGallery}
        onSelectTemplate={handleCreateDiagram}
        isLoading={createDiagram.isPending}
      />
    </div>
  )
}

