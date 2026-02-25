/**
 * Performance Monitor Hook
 * Real-time performance tracking for the editor
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  performanceService,
  type PerformanceMetrics,
  type PerformanceAlert,
} from '@/services/performanceService'

interface UsePerformanceMonitorOptions {
  /** Update interval in milliseconds */
  interval?: number
  /** Whether to start monitoring immediately */
  autoStart?: boolean
  /** History duration to keep in milliseconds */
  historyDuration?: number
}

interface UsePerformanceMonitorResult {
  /** Current metrics snapshot */
  metrics: PerformanceMetrics | null
  /** Metrics history */
  history: PerformanceMetrics[]
  /** Recent alerts */
  alerts: PerformanceAlert[]
  /** Performance score (0-100) */
  score: number
  /** Whether monitoring is active */
  isMonitoring: boolean
  /** Start monitoring */
  start: () => void
  /** Stop monitoring */
  stop: () => void
  /** Record a render time */
  recordRenderTime: (time: number) => void
  /** Clear history and alerts */
  reset: () => void
}

export function usePerformanceMonitor(
  options: UsePerformanceMonitorOptions = {}
): UsePerformanceMonitorResult {
  const {
    interval = 1000,
    autoStart = false,
    historyDuration = 60000,
  } = options

  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [history, setHistory] = useState<PerformanceMetrics[]>([])
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([])
  const [score, setScore] = useState(100)
  const [isMonitoring, setIsMonitoring] = useState(false)

  const intervalRef = useRef<number | null>(null)

  // Start monitoring
  const start = useCallback(() => {
    if (isMonitoring) return

    performanceService.start()
    setIsMonitoring(true)

    // Update metrics at interval
    intervalRef.current = window.setInterval(() => {
      const newMetrics = performanceService.getMetrics()
      setMetrics(newMetrics)
      setHistory(performanceService.getHistory(historyDuration))
      setAlerts(performanceService.getAlerts(10))
      setScore(performanceService.getPerformanceScore())
    }, interval)

    // Initial metrics
    const initialMetrics = performanceService.getMetrics()
    setMetrics(initialMetrics)
    setScore(performanceService.getPerformanceScore())
  }, [isMonitoring, interval, historyDuration])

  // Stop monitoring
  const stop = useCallback(() => {
    if (!isMonitoring) return

    performanceService.stop()
    setIsMonitoring(false)

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [isMonitoring])

  // Record render time
  const recordRenderTime = useCallback((time: number) => {
    performanceService.recordRenderTime(time)
  }, [])

  // Reset tracking
  const reset = useCallback(() => {
    performanceService.reset()
    setMetrics(null)
    setHistory([])
    setAlerts([])
    setScore(100)
  }, [])

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart) {
      start()
    }

    return () => {
      stop()
    }
  }, [autoStart, start, stop])

  // Subscribe to alerts
  useEffect(() => {
    if (!isMonitoring) return

    const unsubscribe = performanceService.subscribeToAlerts((alert) => {
      setAlerts(prev => [...prev.slice(-9), alert])
    })

    return unsubscribe
  }, [isMonitoring])

  return {
    metrics,
    history,
    alerts,
    score,
    isMonitoring,
    start,
    stop,
    recordRenderTime,
    reset,
  }
}
