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
import { ZoomIn, ZoomOut, Maximize2, MousePointer2, Hand, Grid3X3 } from 'lucide-react'
import { DiagramStats } from './DiagramStats'

export function ZoomControls() {
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

      {/* Grid Settings */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={gridEnabled ? 'secondary' : 'ghost'}
            size="icon"
            className={`h-8 w-8 ${gridEnabled ? 'bg-supabase-green-muted text-supabase-green' : 'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary'}`}
            title="Grid Settings"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="start"
          className="w-64 p-4"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-default)',
          }}
        >
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-supabase-text-primary">Grid Settings</h4>

            {/* Grid Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="grid-toggle" className="text-sm text-supabase-text-secondary">
                Show Grid
              </Label>
              <Switch
                id="grid-toggle"
                checked={gridEnabled}
                onCheckedChange={toggleGrid}
              />
            </div>

            {/* Snap to Grid Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="snap-toggle" className="text-sm text-supabase-text-secondary">
                Snap to Grid
              </Label>
              <Switch
                id="snap-toggle"
                checked={snapToGrid}
                onCheckedChange={toggleSnapToGrid}
              />
            </div>

            {/* Grid Size Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-supabase-text-secondary">Grid Size</Label>
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

            {/* Line Width Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-supabase-text-secondary">Line Width</Label>
                <span className="text-xs text-supabase-text-muted">{gridLineWidth.toFixed(1)}</span>
              </div>
              <Slider
                value={[gridLineWidth]}
                onValueChange={(values) => values[0] !== undefined && setGridLineWidth(values[0])}
                min={0.5}
                max={3}
                step={0.5}
                className="w-full"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <div className="w-px h-4 bg-supabase-border mx-1" />

      <DiagramStats />
    </div>
  )
}
