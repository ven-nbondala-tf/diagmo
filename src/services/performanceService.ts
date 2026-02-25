/**
 * Performance Monitoring Service
 * Real-time performance metrics for enterprise deployments
 */

import { useEditorStore } from '@/stores/editorStore'
import { useCollaborationStore } from '@/stores/collaborationStore'

// Performance metrics snapshot
export interface PerformanceMetrics {
  timestamp: number
  renderTime: number
  fps: number
  nodeCount: number
  edgeCount: number
  memoryUsage: number // bytes
  memoryLimit: number // bytes
  networkLatency: number // ms
  collaboratorCount: number
  canvasSize: { width: number; height: number }
  viewportZoom: number
  selectedCount: number
  undoStackSize: number
  isDirty: boolean
}

// Performance alert
export interface PerformanceAlert {
  id: string
  type: 'warning' | 'critical'
  metric: keyof PerformanceMetrics
  message: string
  value: number
  threshold: number
  timestamp: number
}

// Performance thresholds
export interface PerformanceThresholds {
  fps: { warning: number; critical: number }
  renderTime: { warning: number; critical: number }
  memoryUsage: { warning: number; critical: number }
  nodeCount: { warning: number; critical: number }
  networkLatency: { warning: number; critical: number }
}

// Default thresholds
export const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  fps: { warning: 30, critical: 15 },
  renderTime: { warning: 50, critical: 100 },
  memoryUsage: { warning: 0.7, critical: 0.9 }, // percentage of limit
  nodeCount: { warning: 500, critical: 1000 },
  networkLatency: { warning: 200, critical: 500 },
}

// FPS tracker
class FPSTracker {
  private frames: number[] = []
  private lastTime = performance.now()

  tick(): number {
    const now = performance.now()
    const delta = now - this.lastTime
    this.lastTime = now

    if (delta > 0) {
      this.frames.push(1000 / delta)
    }

    // Keep last 60 frames
    if (this.frames.length > 60) {
      this.frames.shift()
    }

    // Return average FPS
    if (this.frames.length === 0) return 60
    return Math.round(this.frames.reduce((a, b) => a + b, 0) / this.frames.length)
  }

  reset(): void {
    this.frames = []
    this.lastTime = performance.now()
  }
}

// Render time tracker
class RenderTimeTracker {
  private measurements: number[] = []

  record(time: number): void {
    this.measurements.push(time)
    if (this.measurements.length > 100) {
      this.measurements.shift()
    }
  }

  getAverage(): number {
    if (this.measurements.length === 0) return 0
    return Math.round(this.measurements.reduce((a, b) => a + b, 0) / this.measurements.length)
  }

  getMax(): number {
    if (this.measurements.length === 0) return 0
    return Math.max(...this.measurements)
  }

  reset(): void {
    this.measurements = []
  }
}

// Network latency tracker
class LatencyTracker {
  private measurements: number[] = []
  private pingUrl = '/api/ping' // or use a real endpoint

  async measure(): Promise<number> {
    const start = performance.now()
    try {
      // Simple fetch to measure latency
      await fetch(this.pingUrl, { method: 'HEAD', cache: 'no-store' }).catch(() => {
        // Fallback: measure time to a known endpoint
      })
      const latency = performance.now() - start
      this.record(latency)
      return latency
    } catch {
      return this.getAverage() || 0
    }
  }

  record(latency: number): void {
    this.measurements.push(latency)
    if (this.measurements.length > 20) {
      this.measurements.shift()
    }
  }

  getAverage(): number {
    if (this.measurements.length === 0) return 0
    return Math.round(this.measurements.reduce((a, b) => a + b, 0) / this.measurements.length)
  }

  reset(): void {
    this.measurements = []
  }
}

// Main performance service
class PerformanceService {
  private fpsTracker = new FPSTracker()
  private renderTracker = new RenderTimeTracker()
  private latencyTracker = new LatencyTracker()
  private metricsHistory: PerformanceMetrics[] = []
  private alerts: PerformanceAlert[] = []
  private thresholds = DEFAULT_THRESHOLDS
  private animationFrameId: number | null = null
  private latencyInterval: number | null = null
  private listeners: Set<(metrics: PerformanceMetrics) => void> = new Set()
  private alertListeners: Set<(alert: PerformanceAlert) => void> = new Set()

  /**
   * Start monitoring
   */
  start(): void {
    if (this.animationFrameId !== null) return

    const tick = () => {
      this.fpsTracker.tick()
      this.animationFrameId = requestAnimationFrame(tick)
    }
    this.animationFrameId = requestAnimationFrame(tick)

    // Measure latency periodically
    this.latencyInterval = window.setInterval(() => {
      this.latencyTracker.measure()
    }, 5000)
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    if (this.latencyInterval !== null) {
      clearInterval(this.latencyInterval)
      this.latencyInterval = null
    }
  }

  /**
   * Record a render time
   */
  recordRenderTime(time: number): void {
    this.renderTracker.record(time)
  }

  /**
   * Get current metrics snapshot
   */
  getMetrics(): PerformanceMetrics {
    const editorState = useEditorStore.getState()
    const collabState = useCollaborationStore.getState()

    // Get memory info if available
    const memory = (performance as unknown as { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory
    const memoryUsage = memory?.usedJSHeapSize || 0
    const memoryLimit = memory?.jsHeapSizeLimit || 0

    // Get canvas size
    const canvas = document.querySelector('.react-flow')
    const canvasRect = canvas?.getBoundingClientRect()

    const metrics: PerformanceMetrics = {
      timestamp: Date.now(),
      renderTime: this.renderTracker.getAverage(),
      fps: this.fpsTracker.tick(),
      nodeCount: editorState.nodes.length,
      edgeCount: editorState.edges.length,
      memoryUsage,
      memoryLimit,
      networkLatency: this.latencyTracker.getAverage(),
      collaboratorCount: collabState.collaborators.length,
      canvasSize: {
        width: canvasRect?.width || 0,
        height: canvasRect?.height || 0,
      },
      viewportZoom: editorState.zoom,
      selectedCount: editorState.selectedNodes.length,
      undoStackSize: editorState.past.length,
      isDirty: editorState.isDirty,
    }

    // Store in history
    this.metricsHistory.push(metrics)
    if (this.metricsHistory.length > 300) {
      this.metricsHistory.shift()
    }

    // Check thresholds and generate alerts
    this.checkThresholds(metrics)

    // Notify listeners
    this.listeners.forEach(listener => listener(metrics))

    return metrics
  }

  /**
   * Check thresholds and generate alerts
   */
  private checkThresholds(metrics: PerformanceMetrics): void {
    const checks: Array<{
      metric: keyof PerformanceMetrics
      value: number
      thresholds: { warning: number; critical: number }
      lowIsBad?: boolean
    }> = [
      { metric: 'fps', value: metrics.fps, thresholds: this.thresholds.fps, lowIsBad: true },
      { metric: 'renderTime', value: metrics.renderTime, thresholds: this.thresholds.renderTime },
      { metric: 'nodeCount', value: metrics.nodeCount, thresholds: this.thresholds.nodeCount },
      { metric: 'networkLatency', value: metrics.networkLatency, thresholds: this.thresholds.networkLatency },
    ]

    // Memory check (percentage based)
    if (metrics.memoryLimit > 0) {
      const memoryPercent = metrics.memoryUsage / metrics.memoryLimit
      checks.push({
        metric: 'memoryUsage',
        value: memoryPercent,
        thresholds: this.thresholds.memoryUsage,
      })
    }

    for (const check of checks) {
      let alertType: 'warning' | 'critical' | null = null

      if (check.lowIsBad) {
        if (check.value < check.thresholds.critical) {
          alertType = 'critical'
        } else if (check.value < check.thresholds.warning) {
          alertType = 'warning'
        }
      } else {
        if (check.value > check.thresholds.critical) {
          alertType = 'critical'
        } else if (check.value > check.thresholds.warning) {
          alertType = 'warning'
        }
      }

      if (alertType) {
        const alert: PerformanceAlert = {
          id: `${check.metric}-${Date.now()}`,
          type: alertType,
          metric: check.metric,
          message: this.getAlertMessage(check.metric, alertType, check.value),
          value: check.value,
          threshold: alertType === 'critical' ? check.thresholds.critical : check.thresholds.warning,
          timestamp: Date.now(),
        }

        this.alerts.push(alert)
        if (this.alerts.length > 50) {
          this.alerts.shift()
        }

        this.alertListeners.forEach(listener => listener(alert))
      }
    }
  }

  /**
   * Get alert message
   */
  private getAlertMessage(
    metric: keyof PerformanceMetrics,
    type: 'warning' | 'critical',
    value: number
  ): string {
    const severity = type === 'critical' ? 'Critical' : 'Warning'
    switch (metric) {
      case 'fps':
        return `${severity}: Low frame rate (${Math.round(value)} FPS)`
      case 'renderTime':
        return `${severity}: Slow render time (${Math.round(value)}ms)`
      case 'memoryUsage':
        return `${severity}: High memory usage (${Math.round(value * 100)}%)`
      case 'nodeCount':
        return `${severity}: Large diagram (${value} nodes)`
      case 'networkLatency':
        return `${severity}: High network latency (${Math.round(value)}ms)`
      default:
        return `${severity}: ${metric} threshold exceeded`
    }
  }

  /**
   * Get metrics history
   */
  getHistory(duration = 60000): PerformanceMetrics[] {
    const cutoff = Date.now() - duration
    return this.metricsHistory.filter(m => m.timestamp >= cutoff)
  }

  /**
   * Get recent alerts
   */
  getAlerts(count = 10): PerformanceAlert[] {
    return this.alerts.slice(-count)
  }

  /**
   * Subscribe to metrics updates
   */
  subscribe(listener: (metrics: PerformanceMetrics) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Subscribe to alerts
   */
  subscribeToAlerts(listener: (alert: PerformanceAlert) => void): () => void {
    this.alertListeners.add(listener)
    return () => this.alertListeners.delete(listener)
  }

  /**
   * Update thresholds
   */
  setThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds }
  }

  /**
   * Get current thresholds
   */
  getThresholds(): PerformanceThresholds {
    return { ...this.thresholds }
  }

  /**
   * Reset all tracking
   */
  reset(): void {
    this.fpsTracker.reset()
    this.renderTracker.reset()
    this.latencyTracker.reset()
    this.metricsHistory = []
    this.alerts = []
  }

  /**
   * Get performance score (0-100)
   */
  getPerformanceScore(): number {
    const metrics = this.getMetrics()
    let score = 100

    // FPS score (60 FPS = perfect)
    const fpsScore = Math.min(metrics.fps / 60, 1) * 25
    score -= (25 - fpsScore)

    // Render time score (< 16ms = perfect for 60fps)
    const renderScore = Math.max(0, 1 - metrics.renderTime / 50) * 25
    score -= (25 - renderScore)

    // Memory score
    if (metrics.memoryLimit > 0) {
      const memoryPercent = metrics.memoryUsage / metrics.memoryLimit
      const memoryScore = Math.max(0, 1 - memoryPercent) * 25
      score -= (25 - memoryScore)
    }

    // Node count score (exponential penalty for large diagrams)
    const nodeScore = Math.max(0, 1 - metrics.nodeCount / 1000) * 25
    score -= (25 - nodeScore)

    return Math.max(0, Math.min(100, Math.round(score)))
  }
}

// Singleton instance
export const performanceService = new PerformanceService()

// Export types for hook usage
export type { PerformanceService }
