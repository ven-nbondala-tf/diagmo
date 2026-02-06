import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Label,
} from '@/components/ui'
import { LayoutGrid, ArrowDown, ArrowRight, ArrowUp, ArrowLeft } from 'lucide-react'
import { useEditorStore } from '@/stores/editorStore'
import { autoLayoutNodes, type LayoutDirection } from '@/services/layoutService'
import { SliderWithInput } from './properties/shared'

interface AutoLayoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DIRECTIONS: Array<{ value: LayoutDirection; label: string; icon: React.ElementType }> = [
  { value: 'TB', label: 'Top to Bottom', icon: ArrowDown },
  { value: 'LR', label: 'Left to Right', icon: ArrowRight },
  { value: 'BT', label: 'Bottom to Top', icon: ArrowUp },
  { value: 'RL', label: 'Right to Left', icon: ArrowLeft },
]

export function AutoLayoutDialog({ open, onOpenChange }: AutoLayoutDialogProps) {
  const [direction, setDirection] = useState<LayoutDirection>('TB')
  const [nodeSpacing, setNodeSpacing] = useState(50)
  const [rankSpacing, setRankSpacing] = useState(80)

  const nodes = useEditorStore((state) => state.nodes)
  const edges = useEditorStore((state) => state.edges)
  const setNodes = useEditorStore((state) => state.setNodes)
  const pushHistory = useEditorStore((state) => state.pushHistory)
  const selectedNodes = useEditorStore((state) => state.selectedNodes)

  const handleApply = () => {
    // Determine which nodes to layout
    let nodesToLayout = nodes
    let nodesToKeep: typeof nodes = []

    // If nodes are selected, only layout those (and keep others in place)
    if (selectedNodes.length > 1) {
      nodesToLayout = nodes.filter((n) => selectedNodes.includes(n.id))
      nodesToKeep = nodes.filter((n) => !selectedNodes.includes(n.id))
    }

    if (nodesToLayout.length === 0) return

    // Get edges that connect the nodes being laid out
    const nodeIds = new Set(nodesToLayout.map((n) => n.id))
    const relevantEdges = edges.filter(
      (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
    )

    // Push history before making changes
    pushHistory()

    // Apply layout
    const layoutedNodes = autoLayoutNodes(nodesToLayout, relevantEdges, {
      direction,
      nodeSpacing,
      rankSpacing,
    })

    // If we're only laying out selected nodes, find offset to keep them near their original position
    if (nodesToKeep.length > 0 && layoutedNodes.length > 0) {
      // Calculate the center of original selected nodes
      const originalCenterX = nodesToLayout.reduce((sum, n) => sum + n.position.x, 0) / nodesToLayout.length
      const originalCenterY = nodesToLayout.reduce((sum, n) => sum + n.position.y, 0) / nodesToLayout.length

      // Calculate the center of laid out nodes
      const layoutCenterX = layoutedNodes.reduce((sum, n) => sum + n.position.x, 0) / layoutedNodes.length
      const layoutCenterY = layoutedNodes.reduce((sum, n) => sum + n.position.y, 0) / layoutedNodes.length

      // Apply offset to keep nodes in roughly the same area
      const offsetX = originalCenterX - layoutCenterX
      const offsetY = originalCenterY - layoutCenterY

      layoutedNodes.forEach((node) => {
        node.position.x += offsetX
        node.position.y += offsetY
      })
    }

    // Combine with nodes that weren't laid out
    const newNodes = [...nodesToKeep, ...layoutedNodes]
    setNodes(newNodes)

    onOpenChange(false)
  }

  const nodeCount = selectedNodes.length > 1 ? selectedNodes.length : nodes.length
  const isSelectionLayout = selectedNodes.length > 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5" />
            Auto Layout
          </DialogTitle>
          <DialogDescription>
            {isSelectionLayout
              ? `Automatically arrange ${nodeCount} selected shapes`
              : `Automatically arrange all ${nodeCount} shapes in your diagram`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Direction selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Layout Direction</Label>
            <div className="grid grid-cols-4 gap-2">
              {DIRECTIONS.map((dir) => {
                const Icon = dir.icon
                return (
                  <button
                    key={dir.value}
                    onClick={() => setDirection(dir.value)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-md border transition-colors ${
                      direction === dir.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                    title={dir.label}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px]">{dir.value}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Spacing options */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Spacing</Label>
            <div className="grid grid-cols-2 gap-4">
              <SliderWithInput
                label="Node Spacing"
                value={nodeSpacing}
                onChange={setNodeSpacing}
                min={20}
                max={200}
                step={10}
                unit="px"
              />
              <SliderWithInput
                label="Rank Spacing"
                value={rankSpacing}
                onChange={setRankSpacing}
                min={40}
                max={300}
                step={10}
                unit="px"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Node spacing controls the gap between shapes in the same row/column.
              Rank spacing controls the gap between rows/columns.
            </p>
          </div>

          {/* Info */}
          {isSelectionLayout && (
            <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-md">
              <strong>Tip:</strong> Only selected shapes will be rearranged.
              Other shapes will stay in place.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={nodeCount === 0}>
            Apply Layout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
