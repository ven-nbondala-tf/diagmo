import { useState, useEffect } from 'react'
import { Check, Cloud, CloudOff, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/utils/cn'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline'

interface AutoSaveIndicatorProps {
  status: SaveStatus
  lastSaved: Date | null
  isDirty?: boolean
  error?: string
  className?: string
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)

  if (diffSeconds < 5) return 'just now'
  if (diffSeconds < 60) return `${diffSeconds}s ago`
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`

  return date.toLocaleDateString()
}

export function AutoSaveIndicator({
  status,
  lastSaved,
  isDirty,
  error,
  className,
}: AutoSaveIndicatorProps) {
  const [relativeTime, setRelativeTime] = useState<string>('')

  // Update relative time every 10 seconds
  useEffect(() => {
    if (!lastSaved) return

    const updateTime = () => {
      setRelativeTime(getRelativeTime(lastSaved))
    }

    updateTime()
    const interval = setInterval(updateTime, 10000)

    return () => clearInterval(interval)
  }, [lastSaved])

  const getStatusContent = () => {
    switch (status) {
      case 'saving':
        return (
          <div className="flex items-center gap-1.5 text-supabase-text-muted">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Saving...</span>
          </div>
        )

      case 'saved':
        return (
          <div className="flex items-center gap-1.5 text-supabase-green">
            <Cloud className="h-3 w-3" />
            <span>Saved {relativeTime}</span>
          </div>
        )

      case 'error':
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 text-red-500 cursor-help">
                <AlertCircle className="h-3 w-3" />
                <span>Save failed</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{error || 'Failed to save. Click to retry.'}</p>
            </TooltipContent>
          </Tooltip>
        )

      case 'offline':
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 text-yellow-500 cursor-help">
                <CloudOff className="h-3 w-3" />
                <span>Offline</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>You're offline. Changes will sync when connected.</p>
            </TooltipContent>
          </Tooltip>
        )

      case 'idle':
      default:
        if (isDirty) {
          return (
            <div className="flex items-center gap-1.5 text-supabase-text-muted">
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <span>Unsaved changes</span>
            </div>
          )
        }
        if (lastSaved) {
          return (
            <div className="flex items-center gap-1.5 text-supabase-text-muted">
              <Check className="h-3 w-3" />
              <span>Saved {relativeTime}</span>
            </div>
          )
        }
        return null
    }
  }

  return (
    <div className={cn('text-xs', className)}>
      {getStatusContent()}
    </div>
  )
}

// Hook to manage auto-save state
export function useAutoSave(
  saveFn: () => Promise<void>,
  isDirty: boolean,
  debounceMs = 2000
) {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState<string>()

  // Check online status
  useEffect(() => {
    const handleOnline = () => {
      if (status === 'offline') {
        setStatus('idle')
      }
    }
    const handleOffline = () => {
      setStatus('offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    if (!navigator.onLine) {
      setStatus('offline')
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [status])

  // Auto-save on changes
  useEffect(() => {
    if (!isDirty || status === 'offline' || status === 'saving') return

    const timer = setTimeout(async () => {
      try {
        setStatus('saving')
        setError(undefined)
        await saveFn()
        setStatus('saved')
        setLastSaved(new Date())
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Save failed')
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [isDirty, saveFn, debounceMs, status])

  const save = async () => {
    if (status === 'offline') return

    try {
      setStatus('saving')
      setError(undefined)
      await saveFn()
      setStatus('saved')
      setLastSaved(new Date())
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Save failed')
    }
  }

  return {
    status,
    lastSaved,
    error,
    save,
  }
}
