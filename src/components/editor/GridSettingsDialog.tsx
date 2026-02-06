import { useState, useCallback, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Input,
  Label,
  Switch,
} from '@/components/ui'
import { Grid3X3, RotateCcw } from 'lucide-react'
import { useEditorStore } from '@/stores/editorStore'
import { cn } from '@/utils/cn'

interface GridSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const GRID_PRESETS = [
  { label: 'Small', size: 10 },
  { label: 'Medium', size: 20 },
  { label: 'Large', size: 40 },
  { label: 'Extra Large', size: 60 },
]

export function GridSettingsDialog({ open, onOpenChange }: GridSettingsDialogProps) {
  const gridEnabled = useEditorStore((state) => state.gridEnabled)
  const snapToGrid = useEditorStore((state) => state.snapToGrid)
  const gridSize = useEditorStore((state) => state.gridSize)
  const toggleGrid = useEditorStore((state) => state.toggleGrid)
  const toggleSnapToGrid = useEditorStore((state) => state.toggleSnapToGrid)
  const setGridSize = useEditorStore((state) => state.setGridSize)

  const [customSize, setCustomSize] = useState(gridSize.toString())

  useEffect(() => {
    setCustomSize(gridSize.toString())
  }, [gridSize])

  const handleCustomSizeChange = useCallback((value: string) => {
    setCustomSize(value)
    const num = parseInt(value, 10)
    if (!isNaN(num) && num >= 5 && num <= 100) {
      setGridSize(num)
    }
  }, [setGridSize])

  const handleReset = useCallback(() => {
    setGridSize(20)
    if (!gridEnabled) toggleGrid()
    if (!snapToGrid) toggleSnapToGrid()
  }, [setGridSize, gridEnabled, snapToGrid, toggleGrid, toggleSnapToGrid])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Grid3X3 className="w-5 h-5" />
            Grid Settings
          </DialogTitle>
          <DialogDescription>
            Configure grid display and snapping behavior.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Grid Visibility */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Show Grid</Label>
              <p className="text-xs text-muted-foreground">
                Display grid lines on the canvas
              </p>
            </div>
            <Switch checked={gridEnabled} onCheckedChange={toggleGrid} />
          </div>

          {/* Snap to Grid */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Snap to Grid</Label>
              <p className="text-xs text-muted-foreground">
                Align shapes to grid when moving
              </p>
            </div>
            <Switch checked={snapToGrid} onCheckedChange={toggleSnapToGrid} />
          </div>

          {/* Grid Size */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Grid Size</Label>

            {/* Presets */}
            <div className="flex gap-2">
              {GRID_PRESETS.map((preset) => (
                <Button
                  key={preset.size}
                  variant="outline"
                  size="sm"
                  className={cn(
                    'flex-1',
                    gridSize === preset.size && 'border-primary bg-primary/5'
                  )}
                  onClick={() => setGridSize(preset.size)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {/* Custom size */}
            <div className="flex items-center gap-3">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">
                Custom:
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={5}
                  max={100}
                  value={customSize}
                  onChange={(e) => handleCustomSizeChange(e.target.value)}
                  className="w-20 h-8"
                />
                <span className="text-xs text-muted-foreground">px</span>
              </div>
              <div className="flex-1" />
              <span className="text-xs text-muted-foreground">
                Current: {gridSize}px
              </span>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Preview</Label>
            <div
              className="h-24 rounded-md border overflow-hidden"
              style={{
                backgroundImage: gridEnabled
                  ? `
                    linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
                  `
                  : 'none',
                backgroundSize: `${gridSize}px ${gridSize}px`,
                backgroundColor: '#fafafa',
              }}
            >
              {/* Sample shape */}
              <div
                className="m-3 w-16 h-10 bg-blue-500 rounded-md flex items-center justify-center text-white text-xs shadow-sm"
                style={{
                  transform: snapToGrid
                    ? `translate(${Math.round(12 / gridSize) * gridSize - 12}px, ${Math.round(12 / gridSize) * gridSize - 12}px)`
                    : 'none',
                }}
              >
                Shape
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between pt-2 border-t">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset to Default
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
