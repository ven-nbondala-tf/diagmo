import { useParams } from 'react-router-dom'
import { ReactFlowProvider } from '@xyflow/react'
import { useDiagram } from '@/hooks/useDiagrams'
import { useEditorStore } from '@/stores/editorStore'
import { DiagramEditor } from '@/components/editor/DiagramEditor'
import { EditorHeader } from '@/components/editor/EditorHeader'
import { PresentationMode } from '@/components/editor/PresentationMode'
import { Loader2 } from 'lucide-react'

export function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const { data: diagram, isLoading, error } = useDiagram(id)
  const presentationModeOpen = useEditorStore((state) => state.presentationModeOpen)
  const setPresentationModeOpen = useEditorStore((state) => state.setPresentationModeOpen)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !diagram) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Diagram not found</h1>
          <p className="text-muted-foreground mt-2">
            The diagram you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.
          </p>
        </div>
      </div>
    )
  }

  return (
    <ReactFlowProvider>
      <div className="h-screen flex flex-col">
        <EditorHeader diagram={diagram} />
        <DiagramEditor diagram={diagram} />
      </div>
      {presentationModeOpen && (
        <PresentationMode onClose={() => setPresentationModeOpen(false)} />
      )}
    </ReactFlowProvider>
  )
}
