import { useMemo, useState } from 'react'
import { useEditorStore } from '@/stores/editorStore'
import { analyzeDiagram, getComplexityScore, type DiagramAnalytics } from '@/services/analyticsService'
import {
  Button,
  ScrollArea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Progress,
} from '@/components/ui'
import {
  BarChart3,
  X,
  RefreshCw,
  Box,
  GitBranch,
  Layers,
  AlertTriangle,
  Network,
  Gauge,
  ChevronDown,
  ChevronRight,
  Cloud,
  Target,
  Maximize2,
} from 'lucide-react'
import { cn } from '@/utils'

interface DiagramAnalyticsPanelProps {
  onClose?: () => void
}

// Stat card component
function StatCard({
  label,
  value,
  icon: Icon,
  subtext,
  className,
}: {
  label: string
  value: string | number
  icon?: React.ElementType
  subtext?: string
  className?: string
}) {
  return (
    <div className={cn('p-3 rounded-lg bg-muted/30 border border-border', className)}>
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="text-xl font-semibold">{value}</div>
      {subtext && <div className="text-xs text-muted-foreground mt-0.5">{subtext}</div>}
    </div>
  )
}

// Section component
function Section({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full p-3 text-left hover:bg-muted/30 transition-colors"
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium flex-1">{title}</span>
      </button>
      {isOpen && <div className="px-3 pb-3">{children}</div>}
    </div>
  )
}

// Progress bar with label
function LabeledProgress({
  label,
  value,
  max,
  color = 'bg-primary',
}: {
  label: string
  value: number
  max: number
  color?: string
}) {
  const percentage = max > 0 ? (value / max) * 100 : 0

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  )
}

// Complexity gauge component
function ComplexityGauge({
  score,
  level,
  factors,
}: {
  score: number
  level: string
  factors: string[]
}) {
  const levelColors = {
    simple: 'text-green-500',
    moderate: 'text-blue-500',
    complex: 'text-amber-500',
    'very-complex': 'text-red-500',
  }

  const levelBgColors = {
    simple: 'bg-green-500',
    moderate: 'bg-blue-500',
    complex: 'bg-amber-500',
    'very-complex': 'bg-red-500',
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gauge className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Complexity Score</span>
        </div>
        <span className={cn('text-2xl font-bold', levelColors[level as keyof typeof levelColors])}>
          {score}
        </span>
      </div>

      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            levelBgColors[level as keyof typeof levelBgColors]
          )}
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Simple</span>
        <span>Moderate</span>
        <span>Complex</span>
        <span>Very Complex</span>
      </div>

      {factors.length > 0 && (
        <div className="mt-2 space-y-1">
          <span className="text-xs text-muted-foreground">Contributing factors:</span>
          {factors.map((factor, i) => (
            <div key={i} className="text-xs flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-primary" />
              {factor}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function DiagramAnalyticsPanel({ onClose }: DiagramAnalyticsPanelProps) {
  const nodes = useEditorStore((s) => s.nodes)
  const edges = useEditorStore((s) => s.edges)
  const layers = useEditorStore((s) => s.layers)

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Calculate analytics
  const analytics = useMemo(
    () => analyzeDiagram(nodes, edges, layers),
    [nodes, edges, layers, refreshKey]
  )

  const complexity = useMemo(
    () => getComplexityScore(analytics),
    [analytics]
  )

  // Manual refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setRefreshKey(k => k + 1)
      setIsRefreshing(false)
    }, 300)
  }

  // Total cloud icons
  const totalCloudIcons =
    analytics.cloudProviders.aws +
    analytics.cloudProviders.azure +
    analytics.cloudProviders.gcp +
    analytics.cloudProviders.generic

  // Issues count
  const totalIssues =
    analytics.orphanNodes +
    analytics.unlabeledNodes +
    analytics.selfLoops +
    analytics.duplicateLabels

  return (
    <div className="w-72 flex-shrink-0 border-l border-supabase-border bg-supabase-bg flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-supabase-border bg-supabase-bg-secondary">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-supabase-text-muted" />
            <h2 className="font-semibold text-sm text-supabase-text-primary">Diagram Analytics</h2>
          </div>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-supabase-text-muted hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh Analytics</TooltipContent>
            </Tooltip>
            {onClose && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-supabase-text-muted hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary"
                    onClick={onClose}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Close Panel</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {/* Quick Stats */}
        <div className="p-3 border-b border-border">
          <div className="grid grid-cols-2 gap-2">
            <StatCard label="Nodes" value={analytics.nodeCount} icon={Box} />
            <StatCard label="Edges" value={analytics.edgeCount} icon={GitBranch} />
            <StatCard label="Layers" value={analytics.layerCount} icon={Layers} />
            <StatCard
              label="Issues"
              value={totalIssues}
              icon={AlertTriangle}
              className={totalIssues > 0 ? 'border-amber-500/50' : ''}
            />
          </div>
        </div>

        {/* Complexity */}
        <Section title="Complexity Analysis" icon={Gauge}>
          <ComplexityGauge
            score={complexity.score}
            level={complexity.level}
            factors={complexity.factors}
          />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="text-center p-2 rounded bg-muted/30">
              <div className="text-lg font-semibold">{analytics.maxDepth}</div>
              <div className="text-xs text-muted-foreground">Max Depth</div>
            </div>
            <div className="text-center p-2 rounded bg-muted/30">
              <div className="text-lg font-semibold">{analytics.cycleCount}</div>
              <div className="text-xs text-muted-foreground">Cycles</div>
            </div>
            <div className="text-center p-2 rounded bg-muted/30">
              <div className="text-lg font-semibold">{analytics.connectedComponents}</div>
              <div className="text-xs text-muted-foreground">Components</div>
            </div>
            <div className="text-center p-2 rounded bg-muted/30">
              <div className="text-lg font-semibold">{analytics.averageConnections}</div>
              <div className="text-xs text-muted-foreground">Avg Connections</div>
            </div>
          </div>
        </Section>

        {/* Network Structure */}
        <Section title="Network Structure" icon={Network}>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Entry Points (Sources)</span>
              <span className="font-medium">{analytics.sourceNodes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">End Points (Sinks)</span>
              <span className="font-medium">{analytics.sinkNodes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Max Connections</span>
              <span className="font-medium">{analytics.maxConnections}</span>
            </div>

            {analytics.hubNodes.length > 0 && (
              <div className="mt-3">
                <div className="text-xs text-muted-foreground mb-2">Most Connected Nodes</div>
                <div className="space-y-1">
                  {analytics.hubNodes.slice(0, 5).map((hub, i) => (
                    <div
                      key={hub.id}
                      className="flex items-center justify-between text-sm p-1.5 rounded bg-muted/20"
                    >
                      <span className="truncate flex-1">{hub.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {hub.connections} connections
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* Shape Distribution */}
        <Section title="Shape Distribution" icon={Target} defaultOpen={false}>
          <div className="space-y-2">
            {analytics.topShapes.map((shape) => (
              <LabeledProgress
                key={shape.type}
                label={shape.type}
                value={shape.count}
                max={analytics.nodeCount}
              />
            ))}
          </div>
        </Section>

        {/* Cloud Providers */}
        {totalCloudIcons > 0 && (
          <Section title="Cloud Providers" icon={Cloud} defaultOpen={false}>
            <div className="space-y-2">
              {analytics.cloudProviders.aws > 0 && (
                <LabeledProgress
                  label="AWS"
                  value={analytics.cloudProviders.aws}
                  max={totalCloudIcons}
                  color="bg-orange-500"
                />
              )}
              {analytics.cloudProviders.azure > 0 && (
                <LabeledProgress
                  label="Azure"
                  value={analytics.cloudProviders.azure}
                  max={totalCloudIcons}
                  color="bg-blue-500"
                />
              )}
              {analytics.cloudProviders.gcp > 0 && (
                <LabeledProgress
                  label="GCP"
                  value={analytics.cloudProviders.gcp}
                  max={totalCloudIcons}
                  color="bg-red-500"
                />
              )}
              {analytics.cloudProviders.generic > 0 && (
                <LabeledProgress
                  label="Generic"
                  value={analytics.cloudProviders.generic}
                  max={totalCloudIcons}
                  color="bg-gray-500"
                />
              )}
            </div>
          </Section>
        )}

        {/* Size Metrics */}
        <Section title="Size Metrics" icon={Maximize2} defaultOpen={false}>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Diagram Bounding Box</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 rounded bg-muted/30">
                  <div className="text-muted-foreground text-xs">Width</div>
                  <div className="font-medium">{analytics.boundingBox.width}px</div>
                </div>
                <div className="p-2 rounded bg-muted/30">
                  <div className="text-muted-foreground text-xs">Height</div>
                  <div className="font-medium">{analytics.boundingBox.height}px</div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-1">Average Node Size</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 rounded bg-muted/30">
                  <div className="text-muted-foreground text-xs">Width</div>
                  <div className="font-medium">{analytics.averageNodeSize.width}px</div>
                </div>
                <div className="p-2 rounded bg-muted/30">
                  <div className="text-muted-foreground text-xs">Height</div>
                  <div className="font-medium">{analytics.averageNodeSize.height}px</div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Issues Summary */}
        {totalIssues > 0 && (
          <Section title="Issues Summary" icon={AlertTriangle}>
            <div className="space-y-2">
              {analytics.orphanNodes > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Orphan Nodes</span>
                  <span className="text-amber-500 font-medium">{analytics.orphanNodes}</span>
                </div>
              )}
              {analytics.unlabeledNodes > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Unlabeled Nodes</span>
                  <span className="text-blue-500 font-medium">{analytics.unlabeledNodes}</span>
                </div>
              )}
              {analytics.selfLoops > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Self Loops</span>
                  <span className="text-amber-500 font-medium">{analytics.selfLoops}</span>
                </div>
              )}
              {analytics.duplicateLabels > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Duplicate Labels</span>
                  <span className="text-blue-500 font-medium">{analytics.duplicateLabels}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Use the Validation Panel for detailed issue analysis
            </p>
          </Section>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Analytics update automatically
        </p>
      </div>
    </div>
  )
}
