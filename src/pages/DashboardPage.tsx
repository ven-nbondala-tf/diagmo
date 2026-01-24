import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useDiagrams, useCreateDiagram } from '@/hooks/useDiagrams'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'
import { DiagramCard } from '@/components/dashboard/DiagramCard'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Plus, Loader2, FolderOpen } from 'lucide-react'

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: diagrams, isLoading, error } = useDiagrams()
  const createDiagram = useCreateDiagram()

  const handleCreateDiagram = async () => {
    try {
      const newDiagram = await createDiagram.mutateAsync({
        name: 'Untitled Diagram',
        nodes: [],
        edges: [],
      })
      navigate(`/editor/${newDiagram.id}`)
    } catch (err) {
      console.error('Failed to create diagram:', err)
    }
  }

  return (
    <div className="min-h-screen bg-muted/50">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Diagrams</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back{user?.email ? `, ${user.email}` : ''}
            </p>
          </div>
          <Button onClick={handleCreateDiagram} disabled={createDiagram.isPending}>
            {createDiagram.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            New Diagram
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
        ) : diagrams && diagrams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {diagrams.map((diagram) => (
              <DiagramCard
                key={diagram.id}
                diagram={diagram}
                onClick={() => navigate(`/editor/${diagram.id}`)}
              />
            ))}
          </div>
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
              <Button onClick={handleCreateDiagram} disabled={createDiagram.isPending}>
                {createDiagram.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Create Diagram
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
