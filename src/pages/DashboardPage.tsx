import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useDiagramsByFolder, useCreateDiagram } from '@/hooks'
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
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { FolderSidebar } from '@/components/dashboard/FolderSidebar'
import { SearchBar } from '@/components/dashboard/SearchBar'
import { TemplateGallery } from '@/components/dashboard/TemplateGallery'
import { DIAGRAM_TEMPLATES, type DiagramTemplate } from '@/constants/templates'
import { TemplateQuickCard } from '@/components/dashboard/TemplateQuickCard'
import {
  Plus,
  FolderOpen,
  LayoutGrid,
  List,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
} from 'lucide-react'

type ViewMode = 'grid' | 'list'
type SortBy = 'updated' | 'created' | 'name'
type SortOrder = 'asc' | 'desc'

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showTemplateGallery, setShowTemplateGallery] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('updated')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const { data: diagrams, isLoading, error } = useDiagramsByFolder(selectedFolderId)
  const createDiagram = useCreateDiagram()

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

  return (
    <div className="min-h-screen bg-muted/50 flex flex-col">
      <DashboardHeader />
      <div className="flex-1 flex overflow-hidden">
        <FolderSidebar
          selectedFolderId={selectedFolderId}
          onSelectFolder={setSelectedFolderId}
        />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">My Diagrams</h1>
                <p className="text-muted-foreground mt-1">
                  Welcome back{user?.email ? `, ${user.email}` : ''}
                </p>
              </div>
              <Button onClick={handleOpenTemplateGallery}>
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
                  <Button variant="outline" size="sm" className="h-9 gap-1.5">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{sortLabel}</span>
                    {sortOrder === 'asc' ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortBy('updated')}>
                    {sortBy === 'updated' && <Check className="h-3.5 w-3.5 mr-2" />}
                    <span className={sortBy !== 'updated' ? 'ml-[22px]' : ''}>Last updated</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('created')}>
                    {sortBy === 'created' && <Check className="h-3.5 w-3.5 mr-2" />}
                    <span className={sortBy !== 'created' ? 'ml-[22px]' : ''}>Date created</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('name')}>
                    {sortBy === 'name' && <Check className="h-3.5 w-3.5 mr-2" />}
                    <span className={sortBy !== 'name' ? 'ml-[22px]' : ''}>Name</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                    {sortOrder === 'asc' ? (
                      <ArrowUp className="h-3.5 w-3.5 mr-2" />
                    ) : (
                      <ArrowDown className="h-3.5 w-3.5 mr-2" />
                    )}
                    {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-9 px-2.5 rounded-r-none"
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-9 px-2.5 rounded-l-none"
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
