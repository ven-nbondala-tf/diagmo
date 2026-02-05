import { useReactFlow } from '@xyflow/react'
import { useEditorStore } from '@/stores/editorStore'
import { Button } from '@/components/ui'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

export function ZoomControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  const zoom = useEditorStore((state) => state.zoom)

  return (
    <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-background border rounded-md p-1 shadow-sm z-10">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => zoomOut()}
        title="Zoom Out"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>

      <span className="text-xs text-muted-foreground w-12 text-center">
        {Math.round(zoom * 100)}%
      </span>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => zoomIn()}
        title="Zoom In"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>

      <div className="w-px h-4 bg-border mx-1" />

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => fitView()}
        title="Fit View"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
