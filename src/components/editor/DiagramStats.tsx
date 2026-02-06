import { useMemo } from 'react'
import { useEditorStore } from '@/stores/editorStore'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Button,
} from '@/components/ui'
import { BarChart3, Box, ArrowRight, Layers, Type } from 'lucide-react'
import { cn } from '@/utils/cn'

export function DiagramStats() {
  const nodes = useEditorStore((state) => state.nodes)
  const edges = useEditorStore((state) => state.edges)
  const layers = useEditorStore((state) => state.layers)
  const selectedNodes = useEditorStore((state) => state.selectedNodes)

  const stats = useMemo(() => {
    // Count nodes by type
    const typeCount: Record<string, number> = {}
    let textNodeCount = 0
    let imageNodeCount = 0

    nodes.forEach((node) => {
      const type = node.data?.type || 'rectangle'
      typeCount[type] = (typeCount[type] || 0) + 1

      if (node.data?.label && node.data.label.length > 0) {
        textNodeCount++
      }
      if (type === 'web-image') {
        imageNodeCount++
      }
    })

    // Sort types by count
    const sortedTypes = Object.entries(typeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    // Calculate canvas bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    nodes.forEach((node) => {
      const width = node.measured?.width || 100
      const height = node.measured?.height || 60
      minX = Math.min(minX, node.position.x)
      minY = Math.min(minY, node.position.y)
      maxX = Math.max(maxX, node.position.x + width)
      maxY = Math.max(maxY, node.position.y + height)
    })

    const canvasWidth = nodes.length > 0 ? Math.round(maxX - minX) : 0
    const canvasHeight = nodes.length > 0 ? Math.round(maxY - minY) : 0

    return {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      totalLayers: layers.length,
      selectedCount: selectedNodes.length,
      textNodeCount,
      imageNodeCount,
      sortedTypes,
      canvasWidth,
      canvasHeight,
    }
  }, [nodes, edges, layers, selectedNodes])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>{stats.totalNodes} shapes</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Diagram Statistics
          </h4>

          {/* Main stats */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <StatItem
              icon={Box}
              label="Shapes"
              value={stats.totalNodes}
              color="text-blue-600"
            />
            <StatItem
              icon={ArrowRight}
              label="Connections"
              value={stats.totalEdges}
              color="text-green-600"
            />
            <StatItem
              icon={Layers}
              label="Layers"
              value={stats.totalLayers}
              color="text-purple-600"
            />
            <StatItem
              icon={Type}
              label="With Text"
              value={stats.textNodeCount}
              color="text-orange-600"
            />
          </div>

          {/* Canvas size */}
          {stats.totalNodes > 0 && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-1">Canvas Size</p>
              <p className="text-sm font-mono">
                {stats.canvasWidth} × {stats.canvasHeight} px
              </p>
            </div>
          )}

          {/* Top shape types */}
          {stats.sortedTypes.length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-2">Top Shape Types</p>
              <div className="space-y-1">
                {stats.sortedTypes.map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between text-xs">
                    <span className="capitalize truncate">{type.replace(/-/g, ' ')}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selection info */}
          {stats.selectedCount > 0 && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Selected: <span className="text-foreground font-medium">{stats.selectedCount}</span> shape{stats.selectedCount !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface StatItemProps {
  icon: React.ElementType
  label: string
  value: number
  color: string
}

function StatItem({ icon: Icon, label, value, color }: StatItemProps) {
  return (
    <div className="flex items-center gap-2 p-1.5 rounded bg-muted/50">
      <Icon className={cn('w-3.5 h-3.5', color)} />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="font-medium text-sm">{value}</p>
      </div>
    </div>
  )
}
