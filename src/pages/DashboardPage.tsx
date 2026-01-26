import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useDiagramsByFolder, useCreateDiagram } from '@/hooks'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'
import { DiagramCard } from '@/components/dashboard/DiagramCard'
import { DiagramCardSkeleton } from '@/components/dashboard/DiagramCardSkeleton'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { FolderSidebar } from '@/components/dashboard/FolderSidebar'
import { SearchBar } from '@/components/dashboard/SearchBar'
import { TemplateGallery } from '@/components/dashboard/TemplateGallery'
import type { DiagramTemplate } from '@/constants/templates'
import { Plus, FolderOpen } from 'lucide-react'

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showTemplateGallery, setShowTemplateGallery] = useState(false)

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

            <div className="mb-6 max-w-md">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search diagrams..."
              />
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <DiagramCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-destructive">Failed to load diagrams</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {error instanceof Error ? error.message : 'Unknown error'}
                  </p>
                </CardContent>
              </Card>
            ) : filteredDiagrams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDiagrams.map((diagram) => (
                  <DiagramCard
                    key={diagram.id}
                    diagram={diagram}
                    onClick={() => navigate(`/editor/${diagram.id}`)}
                  />
                ))}
              </div>
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
              <Card>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <FolderOpen className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <CardTitle>No diagrams yet</CardTitle>
                  <CardDescription>
                    Create your first diagram to get started
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Button onClick={handleOpenTemplateGallery}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Diagram
                  </Button>
                </CardContent>
              </Card>
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
