import { useState, useCallback } from 'react'
import { cn } from '@/utils/cn'
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Undo2,
  Redo2,
  Layers,
  Menu,
  X,
  Save,
  Share2,
  Download,
  Grid3X3,
  Eye,
  EyeOff,
} from 'lucide-react'

interface MobileControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onFitView: () => void
  onUndo: () => void
  onRedo: () => void
  onSave: () => void
  onShare: () => void
  onExport: () => void
  onToggleGrid: () => void
  onToggleMinimap: () => void
  onToggleSidebar: () => void
  canUndo: boolean
  canRedo: boolean
  showGrid: boolean
  showMinimap: boolean
  zoomLevel: number
  className?: string
}

export function MobileControls({
  onZoomIn,
  onZoomOut,
  onFitView,
  onUndo,
  onRedo,
  onSave,
  onShare,
  onExport,
  onToggleGrid,
  onToggleMinimap,
  onToggleSidebar,
  canUndo,
  canRedo,
  showGrid,
  showMinimap,
  zoomLevel,
  className,
}: MobileControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activePanel, setActivePanel] = useState<'zoom' | 'actions' | 'view' | null>(null)

  const togglePanel = useCallback((panel: 'zoom' | 'actions' | 'view') => {
    setActivePanel((prev) => (prev === panel ? null : panel))
  }, [])

  const closeAll = useCallback(() => {
    setIsExpanded(false)
    setActivePanel(null)
  }, [])

  const ActionButton = ({
    onClick,
    icon: Icon,
    label,
    disabled = false,
    active = false,
  }: {
    onClick: () => void
    icon: React.ElementType
    label: string
    disabled?: boolean
    active?: boolean
  }) => (
    <button
      onClick={() => {
        onClick()
        // Don't close for toggle actions
        if (!['Grid', 'Minimap'].includes(label)) {
          closeAll()
        }
      }}
      disabled={disabled}
      className={cn(
        'flex flex-col items-center justify-center gap-1 p-3 rounded-xl transition-all',
        'active:scale-95',
        disabled && 'opacity-40 cursor-not-allowed',
        active
          ? 'bg-supabase-green/20 text-supabase-green'
          : 'bg-supabase-bg-tertiary hover:bg-supabase-bg-tertiary/80 text-supabase-text-secondary'
      )}
      aria-label={label}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  )

  return (
    <div className={cn('fixed bottom-4 left-1/2 -translate-x-1/2 z-50', className)}>
      {/* Expanded Panels */}
      {activePanel && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 animate-in slide-in-from-bottom-2 fade-in duration-200">
          {activePanel === 'zoom' && (
            <div className="flex items-center gap-2 p-2 bg-supabase-bg-secondary rounded-2xl border border-supabase-border shadow-xl">
              <button
                onClick={onZoomOut}
                className="p-3 rounded-xl bg-supabase-bg-tertiary active:scale-95 transition-transform"
              >
                <ZoomOut className="h-5 w-5" />
              </button>
              <div className="px-3 py-2 min-w-[60px] text-center text-sm font-medium text-supabase-text-primary">
                {Math.round(zoomLevel * 100)}%
              </div>
              <button
                onClick={onZoomIn}
                className="p-3 rounded-xl bg-supabase-bg-tertiary active:scale-95 transition-transform"
              >
                <ZoomIn className="h-5 w-5" />
              </button>
              <div className="w-px h-8 bg-supabase-border mx-1" />
              <button
                onClick={onFitView}
                className="p-3 rounded-xl bg-supabase-bg-tertiary active:scale-95 transition-transform"
              >
                <Maximize2 className="h-5 w-5" />
              </button>
            </div>
          )}

          {activePanel === 'actions' && (
            <div className="grid grid-cols-4 gap-2 p-3 bg-supabase-bg-secondary rounded-2xl border border-supabase-border shadow-xl min-w-[280px]">
              <ActionButton onClick={onUndo} icon={Undo2} label="Undo" disabled={!canUndo} />
              <ActionButton onClick={onRedo} icon={Redo2} label="Redo" disabled={!canRedo} />
              <ActionButton onClick={onSave} icon={Save} label="Save" />
              <ActionButton onClick={onShare} icon={Share2} label="Share" />
              <ActionButton onClick={onExport} icon={Download} label="Export" />
            </div>
          )}

          {activePanel === 'view' && (
            <div className="grid grid-cols-3 gap-2 p-3 bg-supabase-bg-secondary rounded-2xl border border-supabase-border shadow-xl min-w-[220px]">
              <ActionButton
                onClick={onToggleGrid}
                icon={Grid3X3}
                label="Grid"
                active={showGrid}
              />
              <ActionButton
                onClick={onToggleMinimap}
                icon={showMinimap ? Eye : EyeOff}
                label="Minimap"
                active={showMinimap}
              />
              <ActionButton onClick={onToggleSidebar} icon={Layers} label="Sidebar" />
            </div>
          )}
        </div>
      )}

      {/* Main Control Bar */}
      <div className="flex items-center gap-1 p-1.5 bg-supabase-bg-secondary rounded-2xl border border-supabase-border shadow-xl">
        {/* Menu Button */}
        <button
          onClick={() => togglePanel('actions')}
          className={cn(
            'p-3 rounded-xl transition-all active:scale-95',
            activePanel === 'actions'
              ? 'bg-supabase-green text-white'
              : 'bg-supabase-bg-tertiary text-supabase-text-secondary'
          )}
        >
          {activePanel === 'actions' ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-supabase-border" />

        {/* Zoom Button */}
        <button
          onClick={() => togglePanel('zoom')}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl transition-all active:scale-95',
            activePanel === 'zoom'
              ? 'bg-supabase-green text-white'
              : 'bg-supabase-bg-tertiary text-supabase-text-secondary'
          )}
        >
          <ZoomIn className="h-4 w-4" />
          <span className="text-sm font-medium min-w-[40px]">{Math.round(zoomLevel * 100)}%</span>
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-supabase-border" />

        {/* View Options Button */}
        <button
          onClick={() => togglePanel('view')}
          className={cn(
            'p-3 rounded-xl transition-all active:scale-95',
            activePanel === 'view'
              ? 'bg-supabase-green text-white'
              : 'bg-supabase-bg-tertiary text-supabase-text-secondary'
          )}
        >
          <Layers className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

/**
 * Hook to detect if we should show mobile controls
 */
export function useMobileControls() {
  const isMobile = typeof window !== 'undefined' && (
    window.innerWidth < 768 ||
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0
  )

  return {
    isMobile,
    showMobileControls: isMobile,
  }
}
