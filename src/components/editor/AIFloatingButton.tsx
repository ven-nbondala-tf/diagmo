import { useState, useCallback } from 'react'
import { cn } from '@/utils/cn'
import {
  Sparkles,
  Wand2,
  Layout,
  MessageSquare,
  Lightbulb,
  X,
  Loader2,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui'

interface AIFloatingButtonProps {
  onOpenPanel: () => void
  onQuickLayout: () => void
  onQuickSuggest: () => void
  isLoading?: boolean
  className?: string
}

export function AIFloatingButton({
  onOpenPanel,
  onQuickLayout,
  onQuickSuggest,
  isLoading = false,
  className,
}: AIFloatingButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [])

  const handleAction = useCallback((action: () => void) => {
    action()
    setIsExpanded(false)
  }, [])

  return (
    <div className={cn('absolute bottom-24 right-6 z-40 flex flex-col items-end gap-2', className)}>
      {/* Quick Actions */}
      {isExpanded && (
        <div className="flex flex-col gap-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleAction(onQuickSuggest)}
                className={cn(
                  'p-3 rounded-full shadow-lg transition-all duration-200',
                  'bg-supabase-bg-secondary border border-supabase-border',
                  'text-supabase-text-secondary hover:text-supabase-text-primary',
                  'hover:bg-supabase-bg-tertiary hover:scale-110'
                )}
              >
                <Lightbulb className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">
              Get AI Suggestions
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleAction(onQuickLayout)}
                className={cn(
                  'p-3 rounded-full shadow-lg transition-all duration-200',
                  'bg-supabase-bg-secondary border border-supabase-border',
                  'text-supabase-text-secondary hover:text-supabase-text-primary',
                  'hover:bg-supabase-bg-tertiary hover:scale-110'
                )}
              >
                <Layout className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">
              Auto Layout
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleAction(onOpenPanel)}
                className={cn(
                  'p-3 rounded-full shadow-lg transition-all duration-200',
                  'bg-supabase-bg-secondary border border-supabase-border',
                  'text-supabase-text-secondary hover:text-supabase-text-primary',
                  'hover:bg-supabase-bg-tertiary hover:scale-110'
                )}
              >
                <Wand2 className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">
              Generate with AI
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={toggleExpand}
        disabled={isLoading}
        className={cn(
          'p-4 rounded-full shadow-lg transition-all duration-200',
          'bg-gradient-to-br from-purple-500 to-pink-500',
          'hover:from-purple-600 hover:to-pink-600',
          'text-white',
          'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-supabase-bg',
          isExpanded && 'rotate-45',
          isLoading && 'opacity-70 cursor-wait'
        )}
      >
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : isExpanded ? (
          <X className="h-6 w-6" />
        ) : (
          <Sparkles className="h-6 w-6" />
        )}
      </button>
    </div>
  )
}

/**
 * Compact AI button for toolbar
 */
interface AIToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  isLoading?: boolean
  className?: string
}

export function AIToolbarButton({
  onClick,
  isActive = false,
  isLoading = false,
  className,
}: AIToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          disabled={isLoading}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm transition-all',
            isActive
              ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400'
              : 'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary',
            isLoading && 'opacity-70 cursor-wait',
            className
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          <span>AI</span>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        AI Assistant
      </TooltipContent>
    </Tooltip>
  )
}

/**
 * AI Quick Actions Menu (dropdown style)
 */
interface AIQuickActionsProps {
  onGenerate: () => void
  onLayout: () => void
  onExplain: () => void
  onSuggest: () => void
  isLoading?: boolean
  className?: string
}

export function AIQuickActions({
  onGenerate,
  onLayout,
  onExplain,
  onSuggest,
  isLoading = false,
  className,
}: AIQuickActionsProps) {
  const actions = [
    { id: 'generate', label: 'Generate Diagram', icon: Wand2, action: onGenerate },
    { id: 'layout', label: 'Auto Layout', icon: Layout, action: onLayout },
    { id: 'explain', label: 'Explain Diagram', icon: MessageSquare, action: onExplain },
    { id: 'suggest', label: 'Get Suggestions', icon: Lightbulb, action: onSuggest },
  ]

  return (
    <div className={cn('p-1 space-y-0.5', className)}>
      {actions.map(({ id, label, icon: Icon, action }) => (
        <button
          key={id}
          onClick={action}
          disabled={isLoading}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
            'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
          {isLoading && id === 'generate' && (
            <Loader2 className="h-3 w-3 animate-spin ml-auto" />
          )}
        </button>
      ))}
    </div>
  )
}
