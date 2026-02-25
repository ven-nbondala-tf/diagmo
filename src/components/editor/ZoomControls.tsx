import { useReactFlow } from '@xyflow/react'
import { useEditorStore } from '@/stores/editorStore'
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Slider,
  Label,
  Switch,
} from '@/components/ui'
import { ZoomIn, ZoomOut, Maximize2, MousePointer2, Hand, Grid3X3, Map } from 'lucide-react'

interface ZoomControlsProps {
  showMinimap?: boolean
  onToggleMinimap?: () => void
}

export function ZoomControls({ showMinimap, onToggleMinimap }: ZoomControlsProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  const zoom = useEditorStore((state) => state.zoom)
  const interactionMode = useEditorStore((state) => state.interactionMode)
  const setInteractionMode = useEditorStore((state) => state.setInteractionMode)
  const gridEnabled = useEditorStore((state) => state.gridEnabled)
  const toggleGrid = useEditorStore((state) => state.toggleGrid)
  const gridSize = useEditorStore((state) => state.gridSize)
  const setGridSize = useEditorStore((state) => state.setGridSize)
  const gridLineWidth = useEditorStore((state) => state.gridLineWidth)
  const setGridLineWidth = useEditorStore((state) => state.setGridLineWidth)
  const snapToGrid = useEditorStore((state) => state.snapToGrid)
  const toggleSnapToGrid = useEditorStore((state) => state.toggleSnapToGrid)

  return (
    <div className="absolute bottom-3 left-[200px] flex items-center gap-1 text-supabase-text-muted z-10">
      {/* Mode toggle - subtle */}
      <Button
        variant="ghost"
        size="icon"
        className={`h-7 w-7 rounded ${interactionMode === 'select' ? 'text-supabase-text-primary bg-supabase-bg-tertiary' : 'hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary/50'}`}
        onClick={() => setInteractionMode('select')}
        title="Select Mode (V)"
      >
        <MousePointer2 className="h-3.5 w-3.5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={`h-7 w-7 rounded ${interactionMode === 'pan' ? 'text-supabase-text-primary bg-supabase-bg-tertiary' : 'hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary/50'}`}
        onClick={() => setInteractionMode('pan')}
        title="Pan Mode (H)"
      >
        <Hand className="h-3.5 w-3.5" />
      </Button>

      <div className="w-px h-4 bg-supabase-border/50 mx-1" />

      {/* Grid Settings */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 rounded ${gridEnabled ? 'text-supabase-text-primary bg-supabase-bg-tertiary' : 'hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary/50'}`}
            title="Grid Settings"
          >
            <Grid3X3 className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          className="w-56 p-3"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-default)',
          }}
        >
          <div className="space-y-3">
            <h4 className="font-medium text-xs text-supabase-text-primary">Grid Settings</h4>

            <div className="flex items-center justify-between">
              <Label htmlFor="grid-toggle" className="text-xs text-supabase-text-secondary">
                Show Grid
              </Label>
              <Switch
                id="grid-toggle"
                checked={gridEnabled}
                onCheckedChange={toggleGrid}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="snap-toggle" className="text-xs text-supabase-text-secondary">
                Snap to Grid
              </Label>
              <Switch
                id="snap-toggle"
                checked={snapToGrid}
                onCheckedChange={toggleSnapToGrid}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-supabase-text-secondary">Size</Label>
                <span className="text-xs text-supabase-text-muted">{gridSize}px</span>
              </div>
              <Slider
                value={[gridSize]}
                onValueChange={(values) => values[0] !== undefined && setGridSize(values[0])}
                min={5}
                max={50}
                step={5}
                className="w-full"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <div className="w-px h-4 bg-supabase-border/50 mx-1" />

      {/* Zoom controls - Lucidchart style */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary/50"
        onClick={() => zoomOut()}
        title="Zoom Out"
      >
        <ZoomOut className="h-3.5 w-3.5" />
      </Button>

      <span className="text-xs w-10 text-center font-medium">
        {Math.round(zoom * 100)}%
      </span>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary/50"
        onClick={() => zoomIn()}
        title="Zoom In"
      >
        <ZoomIn className="h-3.5 w-3.5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary/50"
        onClick={() => fitView()}
        title="Fit to Screen"
      >
        <Maximize2 className="h-3.5 w-3.5" />
      </Button>

      {onToggleMinimap && (
        <>
          <div className="w-px h-4 bg-supabase-border/50 mx-1" />
          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 rounded ${showMinimap ? 'text-supabase-text-primary bg-supabase-bg-tertiary' : 'hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary/50'}`}
            onClick={onToggleMinimap}
            title="Toggle Minimap"
          >
            <Map className="h-3.5 w-3.5" />
          </Button>
        </>
      )}
    </div>
  )
}
