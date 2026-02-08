import { useState, useEffect, useCallback } from 'react'
import { WifiOff, Wifi, RefreshCw, X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface OfflineIndicatorProps {
  className?: string
  showReconnectButton?: boolean
  onReconnect?: () => void
}

export function OfflineIndicator({
  className,
  showReconnectButton = true,
  onReconnect,
}: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [showRestored, setShowRestored] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setIsReconnecting(false)
      setShowRestored(true)
      // Hide the "restored" message after 3 seconds
      setTimeout(() => {
        setShowRestored(false)
        setIsDismissed(false)
      }, 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setIsDismissed(false)
      setShowRestored(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleReconnect = useCallback(async () => {
    setIsReconnecting(true)
    try {
      // Try to fetch a small resource to verify connectivity
      await fetch('/manifest.json', { cache: 'no-store' })
      setIsOnline(true)
      onReconnect?.()
    } catch {
      // Still offline
      setIsOnline(false)
    } finally {
      setIsReconnecting(false)
    }
  }, [onReconnect])

  // Show connection restored message
  if (isOnline && showRestored) {
    return (
      <div
        className={cn(
          'fixed bottom-4 left-4 z-50 flex items-center gap-3 px-4 py-3',
          'bg-supabase-green/10 border border-supabase-green/30 rounded-lg shadow-lg',
          'animate-in slide-in-from-bottom-4 fade-in duration-300',
          className
        )}
      >
        <Wifi className="h-4 w-4 text-supabase-green" />
        <span className="text-sm font-medium text-supabase-green">
          Connection restored
        </span>
      </div>
    )
  }

  // Don't show if online or dismissed
  if (isOnline || isDismissed) return null

  return (
    <div
      className={cn(
        'fixed bottom-4 left-4 z-50 flex items-center gap-3 px-4 py-3',
        'bg-supabase-bg-secondary border border-yellow-500/30 rounded-lg shadow-lg',
        'animate-in slide-in-from-bottom-4 fade-in duration-300',
        className
      )}
    >
      <WifiOff className="h-4 w-4 text-yellow-500" />
      <div className="flex flex-col">
        <span className="text-sm font-medium text-supabase-text-primary">
          You're offline
        </span>
        <span className="text-xs text-supabase-text-muted">
          Changes will sync when connected
        </span>
      </div>

      {showReconnectButton && (
        <button
          onClick={handleReconnect}
          disabled={isReconnecting}
          className={cn(
            'ml-2 p-2 rounded-lg transition-colors',
            'hover:bg-supabase-bg-tertiary',
            'text-supabase-text-secondary hover:text-supabase-text-primary',
            isReconnecting && 'animate-spin'
          )}
          title="Try to reconnect"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      )}

      <button
        onClick={() => setIsDismissed(true)}
        className={cn(
          'p-1.5 rounded-lg transition-colors',
          'hover:bg-supabase-bg-tertiary',
          'text-supabase-text-muted hover:text-supabase-text-secondary'
        )}
        title="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

/**
 * Hook to track online/offline status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

/**
 * Hook for offline-aware operations
 */
export function useOfflineQueue<T>() {
  const [queue, setQueue] = useState<T[]>([])
  const isOnline = useOnlineStatus()

  const addToQueue = useCallback((item: T) => {
    setQueue((prev) => [...prev, item])
  }, [])

  const processQueue = useCallback(async (processor: (item: T) => Promise<void>) => {
    if (!isOnline || queue.length === 0) return

    const currentQueue = [...queue]
    setQueue([])

    for (const item of currentQueue) {
      try {
        await processor(item)
      } catch (error) {
        // Re-add failed items to queue
        setQueue((prev) => [...prev, item])
        throw error
      }
    }
  }, [isOnline, queue])

  const clearQueue = useCallback(() => {
    setQueue([])
  }, [])

  return {
    queue,
    queueLength: queue.length,
    isOnline,
    addToQueue,
    processQueue,
    clearQueue,
  }
}
