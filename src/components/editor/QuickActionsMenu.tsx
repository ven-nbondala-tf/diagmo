import { useState, useCallback } from 'react'
import { cn } from '@/utils/cn'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui'
import {
  Plus,
  Minus,
  Maximize2,
  Undo2,
  Redo2,
  MousePointer2,
  Hand,
  Square,
  Circle,
  Type,
  ArrowRight,
  StickyNote,
  X,
  Sparkles,
} from 'lucide-react'

interface QuickAction {
  id: string
  icon: React.ReactNode
  label: string
  shortcut?: string
  onClick: () => void
}

interface QuickActionsMenuProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onFitView: () => void
  onUndo: () => void
  onRedo: () => void
  onAddShape: (type: 'rectangle' | 'circle' | 'text' | 'note' | 'arrow') => void
  onSetTool: (tool: 'select' | 'pan') => void
  currentTool: 'select' | 'pan'
  canUndo: boolean
  canRedo: boolean
  className?: string
}

export function QuickActionsMenu({
  onZoomIn,
  onZoomOut,
  onFitView,
  onUndo,
  onRedo,
  onAddShape,
  onSetTool,
  currentTool,
  canUndo,
  canRedo,
  className,
}: QuickActionsMenuProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeGroup, setActiveGroup] = useState<'main' | 'shapes' | null>(null)

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev)
    setActiveGroup(null)
  }, [])

  const mainActions: QuickAction[] = [
    {
      id: 'select',
      icon: <MousePointer2 className="h-4 w-4" />,
      label: 'Select',
      shortcut: 'V',
      onClick: () => onSetTool('select'),
    },
    {
      id: 'pan',
      icon: <Hand className="h-4 w-4" />,
      label: 'Pan',
      shortcut: 'H',
      onClick: () => onSetTool('pan'),
    },
    {
      id: 'undo',
      icon: <Undo2 className="h-4 w-4" />,
      label: 'Undo',
      shortcut: 'Ctrl+Z',
      onClick: onUndo,
    },
    {
      id: 'redo',
      icon: <Redo2 className="h-4 w-4" />,
      label: 'Redo',
      shortcut: 'Ctrl+Y',
      onClick: onRedo,
    },
  ]

  const zoomActions: QuickAction[] = [
    {
      id: 'zoom-in',
      icon: <Plus className="h-4 w-4" />,
      label: 'Zoom In',
      shortcut: 'Ctrl++',
      onClick: onZoomIn,
    },
    {
      id: 'zoom-out',
      icon: <Minus className="h-4 w-4" />,
      label: 'Zoom Out',
      shortcut: 'Ctrl+-',
      onClick: onZoomOut,
    },
    {
      id: 'fit-view',
      icon: <Maximize2 className="h-4 w-4" />,
      label: 'Fit View',
      shortcut: 'Ctrl+0',
      onClick: onFitView,
    },
  ]

  const shapeActions: QuickAction[] = [
    {
      id: 'rectangle',
      icon: <Square className="h-4 w-4" />,
      label: 'Rectangle',
      shortcut: 'R',
      onClick: () => onAddShape('rectangle'),
    },
    {
      id: 'circle',
      icon: <Circle className="h-4 w-4" />,
      label: 'Circle',
      shortcut: 'C',
      onClick: () => onAddShape('circle'),
    },
    {
      id: 'text',
      icon: <Type className="h-4 w-4" />,
      label: 'Text',
      shortcut: 'T',
      onClick: () => onAddShape('text'),
    },
    {
      id: 'note',
      icon: <StickyNote className="h-4 w-4" />,
      label: 'Note',
      shortcut: 'N',
      onClick: () => onAddShape('note'),
    },
    {
      id: 'arrow',
      icon: <ArrowRight className="h-4 w-4" />,
      label: 'Arrow',
      shortcut: 'L',
      onClick: () => onAddShape('arrow'),
    },
  ]

  const renderActionButton = (action: QuickAction, isActive = false, disabled = false) => (
    <Tooltip key={action.id}>
      <TooltipTrigger asChild>
        <button
          onClick={() => {
            if (!disabled) {
              action.onClick()
              if (action.id.startsWith('zoom') || action.id === 'fit-view') {
                // Don't close for zoom actions
              } else {
                setIsExpanded(false)
                setActiveGroup(null)
              }
            }
          }}
          disabled={disabled}
          className={cn(
            'p-2.5 rounded-lg transition-all duration-150',
            'hover:bg-supabase-bg-tertiary',
            'focus:outline-none focus:ring-2 focus:ring-supabase-green/50',
            isActive && 'bg-supabase-green/10 text-supabase-green',
            disabled && 'opacity-40 cursor-not-allowed',
            !isActive && !disabled && 'text-supabase-text-secondary hover:text-supabase-text-primary'
          )}
        >
          {action.icon}
        </button>
      </TooltipTrigger>
      <TooltipContent side="left" className="flex items-center gap-2">
        <span>{action.label}</span>
        {action.shortcut && (
          <kbd className="px-1.5 py-0.5 text-xs bg-supabase-bg-tertiary rounded border border-supabase-border">
            {action.shortcut}
          </kbd>
        )}
      </TooltipContent>
    </Tooltip>
  )

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2',
        className
      )}
    >
      {/* Expanded Menu */}
      {isExpanded && (
        <div className="flex flex-col gap-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
          {/* Shape Actions */}
          <div className="flex flex-col gap-1 p-1.5 bg-supabase-bg-secondary rounded-xl border border-supabase-border shadow-lg">
            <div className="px-2 py-1 text-[10px] font-medium text-supabase-text-muted uppercase tracking-wider">
              Shapes
            </div>
            {shapeActions.map((action) => renderActionButton(action))}
          </div>

          {/* Zoom Actions */}
          <div className="flex flex-col gap-1 p-1.5 bg-supabase-bg-secondary rounded-xl border border-supabase-border shadow-lg">
            <div className="px-2 py-1 text-[10px] font-medium text-supabase-text-muted uppercase tracking-wider">
              View
            </div>
            {zoomActions.map((action) => renderActionButton(action))}
          </div>

          {/* Main Actions */}
          <div className="flex flex-col gap-1 p-1.5 bg-supabase-bg-secondary rounded-xl border border-supabase-border shadow-lg">
            <div className="px-2 py-1 text-[10px] font-medium text-supabase-text-muted uppercase tracking-wider">
              Tools
            </div>
            {mainActions.map((action) =>
              renderActionButton(
                action,
                (action.id === 'select' && currentTool === 'select') ||
                  (action.id === 'pan' && currentTool === 'pan'),
                (action.id === 'undo' && !canUndo) || (action.id === 'redo' && !canRedo)
              )
            )}
          </div>
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={toggleExpand}
        className={cn(
          'p-4 rounded-full shadow-lg transition-all duration-200',
          'bg-supabase-green hover:bg-supabase-green-hover',
          'text-white',
          'focus:outline-none focus:ring-2 focus:ring-supabase-green focus:ring-offset-2 focus:ring-offset-supabase-bg',
          isExpanded && 'rotate-45'
        )}
      >
        {isExpanded ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
      </button>
    </div>
  )
}
