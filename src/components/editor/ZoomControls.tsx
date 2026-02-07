import { useReactFlow } from '@xyflow/react'
import { useEditorStore } from '@/stores/editorStore'
import { Button } from '@/components/ui'
import { ZoomIn, ZoomOut, Maximize2, MousePointer2, Hand } from 'lucide-react'
import { DiagramStats } from './DiagramStats'

export function ZoomControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  const zoom = useEditorStore((state) => state.zoom)
  const interactionMode = useEditorStore((state) => state.interactionMode)
  const setInteractionMode = useEditorStore((state) => state.setInteractionMode)

  return (
    <div className="absolute bottom-4 left-4 flex items-center gap-1 backdrop-blur-md bg-supabase-bg-secondary/95 shadow-lg ring-1 ring-supabase-border rounded-xl p-1 z-10">
      {/* Mode toggle */}
      <Button
        variant={interactionMode === 'select' ? 'secondary' : 'ghost'}
        size="icon"
        className={`h-8 w-8 ${interactionMode === 'select' ? 'bg-supabase-green-muted text-supabase-green' : 'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary'}`}
        onClick={() => setInteractionMode('select')}
        title="Select Mode (V)"
      >
        <MousePointer2 className="h-4 w-4" />
      </Button>

      <Button
        variant={interactionMode === 'pan' ? 'secondary' : 'ghost'}
        size="icon"
        className={`h-8 w-8 ${interactionMode === 'pan' ? 'bg-supabase-green-muted text-supabase-green' : 'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary'}`}
        onClick={() => setInteractionMode('pan')}
        title="Pan Mode (H)"
      >
        <Hand className="h-4 w-4" />
      </Button>

      <div className="w-px h-4 bg-supabase-border mx-1" />

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary"
        onClick={() => zoomOut()}
        title="Zoom Out"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>

      <span className="text-xs text-supabase-text-muted w-12 text-center">
        {Math.round(zoom * 100)}%
      </span>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary"
        onClick={() => zoomIn()}
        title="Zoom In"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>

      <div className="w-px h-4 bg-supabase-border mx-1" />

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary"
        onClick={() => fitView()}
        title="Fit View"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>

      <div className="w-px h-4 bg-supabase-border mx-1" />

      <DiagramStats />
    </div>
  )
}
