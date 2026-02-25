/**
 * Performance Panel Component
 * Real-time performance monitoring dashboard for the editor
 */

import { useState, useEffect, useMemo } from 'react'
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor'
import type { PerformanceMetrics, PerformanceAlert } from '@/services/performanceService'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Button,
  ScrollArea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui'
import { cn } from '@/utils'
import {
  Activity,
  Cpu,
  HardDrive,
  Network,
  Users,
  Box,
  GitBranch,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Play,
  Pause,
  RotateCcw,
  X,
  Gauge,
  Clock,
  Layers,
} from 'lucide-react'

interface PerformancePanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Mini chart component for metrics history
function MiniChart({
  data,
  height = 40,
  color = 'var(--accent-primary)',
  max,
  min = 0,
}: {
  data: number[]
  height?: number
  color?: string
  max?: number
  min?: number
}) {
  const effectiveMax = max ?? Math.max(...data, 1)
  const points = useMemo(() => {
    if (data.length === 0) return ''
    const width = 100
    const step = width / Math.max(data.length - 1, 1)

    return data
      .map((value, index) => {
        const x = index * step
        const normalizedValue = Math.min(Math.max(value - min, 0), effectiveMax - min)
        const y = height - (normalizedValue / (effectiveMax - min)) * height
        return `${x},${y}`
      })
      .join(' ')
  }, [data, height, effectiveMax, min])

  if (data.length < 2) {
    return (
      <div
        className="flex items-center justify-center text-xs text-muted-foreground"
        style={{ height }}
      >
        Collecting data...
      </div>
    )
  }

  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height }}
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

// Metric card component
function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  trend,
  history,
  color,
  status,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down' | 'stable'
  history?: number[]
  color?: string
  status?: 'good' | 'warning' | 'critical'
}) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  return (
    <div
      className={cn(
        'rounded-lg border p-3 transition-colors',
        status === 'warning' && 'border-yellow-500/50 bg-yellow-500/5',
        status === 'critical' && 'border-red-500/50 bg-red-500/5'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="w-4 h-4" />
          <span>{label}</span>
        </div>
        {trend && (
          <TrendIcon
            className={cn(
              'w-3 h-3',
              trend === 'up' && 'text-green-500',
              trend === 'down' && 'text-red-500',
              trend === 'stable' && 'text-muted-foreground'
            )}
          />
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            'text-2xl font-bold',
            status === 'warning' && 'text-yellow-500',
            status === 'critical' && 'text-red-500'
          )}
        >
          {value}
        </span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      {history && history.length > 0 && (
        <div className="mt-2">
          <MiniChart data={history} color={color} />
        </div>
      )}
    </div>
  )
}

// Performance score gauge
function ScoreGauge({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    if (score >= 40) return 'text-orange-500'
    return 'text-red-500'
  }

  const getLabel = () => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Poor'
  }

  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/20"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className={getColor()}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
              transition: 'stroke-dashoffset 0.5s ease',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('text-3xl font-bold', getColor())}>{score}</span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>
      <span className={cn('text-sm font-medium mt-2', getColor())}>{getLabel()}</span>
    </div>
  )
}

// Alert item component
function AlertItem({ alert }: { alert: PerformanceAlert }) {
  const Icon = alert.type === 'critical' ? AlertCircle : AlertTriangle

  return (
    <div
      className={cn(
        'flex items-start gap-2 p-2 rounded-md text-sm',
        alert.type === 'critical' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
      )}
    >
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium">{alert.message}</p>
        <p className="text-xs opacity-70">
          {new Date(alert.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}

export function PerformancePanel({ open, onOpenChange }: PerformancePanelProps) {
  const {
    metrics,
    history,
    alerts,
    score,
    isMonitoring,
    start,
    stop,
    reset,
  } = usePerformanceMonitor({ autoStart: true, interval: 1000 })

  // Calculate trends from history
  const trends = useMemo(() => {
    if (history.length < 5) {
      return { fps: 'stable', memory: 'stable', render: 'stable' } as const
    }

    const recent = history.slice(-5)
    const earlier = history.slice(-10, -5)

    const avgFpsRecent = recent.reduce((a, m) => a + m.fps, 0) / recent.length
    const avgFpsEarlier = earlier.length > 0
      ? earlier.reduce((a, m) => a + m.fps, 0) / earlier.length
      : avgFpsRecent

    const avgMemoryRecent = recent.reduce((a, m) => a + m.memoryUsage, 0) / recent.length
    const avgMemoryEarlier = earlier.length > 0
      ? earlier.reduce((a, m) => a + m.memoryUsage, 0) / earlier.length
      : avgMemoryRecent

    const avgRenderRecent = recent.reduce((a, m) => a + m.renderTime, 0) / recent.length
    const avgRenderEarlier = earlier.length > 0
      ? earlier.reduce((a, m) => a + m.renderTime, 0) / earlier.length
      : avgRenderRecent

    return {
      fps: avgFpsRecent > avgFpsEarlier + 2 ? 'up' : avgFpsRecent < avgFpsEarlier - 2 ? 'down' : 'stable',
      memory: avgMemoryRecent < avgMemoryEarlier * 0.95 ? 'down' : avgMemoryRecent > avgMemoryEarlier * 1.05 ? 'up' : 'stable',
      render: avgRenderRecent < avgRenderEarlier * 0.9 ? 'down' : avgRenderRecent > avgRenderEarlier * 1.1 ? 'up' : 'stable',
    } as const
  }, [history])

  // Extract history arrays for charts
  const fpsHistory = useMemo(() => history.map((m) => m.fps), [history])
  const memoryHistory = useMemo(() => history.map((m) => m.memoryUsage / (1024 * 1024)), [history])
  const renderHistory = useMemo(() => history.map((m) => m.renderTime), [history])
  const latencyHistory = useMemo(() => history.map((m) => m.networkLatency), [history])

  // Calculate status for metrics
  const getStatus = (
    value: number,
    warning: number,
    critical: number,
    lowIsBad = false
  ): 'good' | 'warning' | 'critical' => {
    if (lowIsBad) {
      if (value < critical) return 'critical'
      if (value < warning) return 'warning'
      return 'good'
    }
    if (value > critical) return 'critical'
    if (value > warning) return 'warning'
    return 'good'
  }

  // Format memory
  const formatMemory = (bytes: number): string => {
    const mb = bytes / (1024 * 1024)
    return mb.toFixed(1)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[450px] p-0 flex flex-col">
        <SheetHeader className="p-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Performance Monitor
            </SheetTitle>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={isMonitoring ? stop : start}
                    className="h-8 w-8"
                  >
                    {isMonitoring ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isMonitoring ? 'Pause' : 'Resume'} monitoring
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={reset}
                    className="h-8 w-8"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset metrics</TooltipContent>
              </Tooltip>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Performance Score */}
            <div className="flex items-center justify-center py-4 border rounded-lg bg-muted/30">
              <ScoreGauge score={score} />
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                icon={Gauge}
                label="FPS"
                value={metrics?.fps ?? 0}
                trend={trends.fps}
                history={fpsHistory}
                color="hsl(var(--chart-1))"
                status={metrics ? getStatus(metrics.fps, 30, 15, true) : 'good'}
              />
              <MetricCard
                icon={Clock}
                label="Render Time"
                value={metrics?.renderTime ?? 0}
                unit="ms"
                trend={trends.render}
                history={renderHistory}
                color="hsl(var(--chart-2))"
                status={metrics ? getStatus(metrics.renderTime, 50, 100) : 'good'}
              />
              <MetricCard
                icon={HardDrive}
                label="Memory"
                value={metrics ? formatMemory(metrics.memoryUsage) : '0'}
                unit="MB"
                trend={trends.memory}
                history={memoryHistory}
                color="hsl(var(--chart-3))"
                status={
                  metrics && metrics.memoryLimit > 0
                    ? getStatus(metrics.memoryUsage / metrics.memoryLimit, 0.7, 0.9)
                    : 'good'
                }
              />
              <MetricCard
                icon={Network}
                label="Latency"
                value={metrics?.networkLatency ?? 0}
                unit="ms"
                history={latencyHistory}
                color="hsl(var(--chart-4))"
                status={metrics ? getStatus(metrics.networkLatency, 200, 500) : 'good'}
              />
            </div>

            {/* Diagram Stats */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Diagram Stats</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                  <Box className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-lg font-semibold">{metrics?.nodeCount ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Nodes</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                  <GitBranch className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-lg font-semibold">{metrics?.edgeCount ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Edges</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-lg font-semibold">{metrics?.collaboratorCount ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Users</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Additional Info</h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between py-1">
                  <span className="text-muted-foreground">Canvas Size</span>
                  <span>
                    {metrics?.canvasSize.width ?? 0} × {metrics?.canvasSize.height ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-muted-foreground">Zoom Level</span>
                  <span>{((metrics?.viewportZoom ?? 1) * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-muted-foreground">Selected</span>
                  <span>{metrics?.selectedCount ?? 0} nodes</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-muted-foreground">Undo Stack</span>
                  <span>{metrics?.undoStackSize ?? 0} items</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-muted-foreground">Status</span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-xs font-medium',
                      metrics?.isDirty
                        ? 'bg-yellow-500/10 text-yellow-500'
                        : 'bg-green-500/10 text-green-500'
                    )}
                  >
                    {metrics?.isDirty ? 'Unsaved' : 'Saved'}
                  </span>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Recent Alerts ({alerts.length})
                </h3>
                <div className="space-y-2">
                  {alerts.slice(-5).reverse().map((alert) => (
                    <AlertItem key={alert.id} alert={alert} />
                  ))}
                </div>
              </div>
            )}

            {/* Monitoring Status */}
            <div className="text-center text-xs text-muted-foreground">
              {isMonitoring ? (
                <span className="flex items-center justify-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Monitoring active · {history.length} samples
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full" />
                  Monitoring paused
                </span>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
