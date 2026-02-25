import { useState, useCallback } from 'react'
import { useReactFlow } from '@xyflow/react'
import { useEditorStore } from '@/stores/editorStore'
import { collaborationService } from '@/services/collaborationService'
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui'
import {
  Pencil,
  X,
  Trash2,
  Undo2,
  Eye,
  EyeOff,
  MousePointer2,
  Hand,
  Type,
  Shapes,
  Circle,
  Square,
  Minus,
  ArrowRight,
  Lasso,
  MoreHorizontal,
  Ruler,
  Heart,
  Copy,
  Camera,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import type { DrawingTool, PenPreset } from '@/types'

// MS Whiteboard-style rectangular eraser icon
function EraserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Eraser body - rectangular block */}
      <rect x="4" y="6" width="16" height="12" rx="2" fill="currentColor" fillOpacity="0.15" />
      {/* Eraser felt/bottom part */}
      <rect x="4" y="14" width="16" height="4" rx="1" fill="currentColor" fillOpacity="0.4" />
      {/* Outline */}
      <rect x="4" y="6" width="16" height="12" rx="2" />
      {/* Divider line */}
      <line x1="4" y1="14" x2="20" y2="14" />
    </svg>
  )
}

// Reactions/Stickers data
const REACTIONS = [
  { emoji: '❤️', label: 'Heart' },
  { emoji: '⭐', label: 'Star' },
  { emoji: '❓', label: 'Question' },
  { emoji: '✅', label: 'Check' },
  { emoji: '❌', label: 'Cross' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '👍', label: 'Thumbs Up' },
  { emoji: '👏', label: 'Clap' },
  { emoji: '😮', label: 'Surprised' },
  { emoji: '🤔', label: 'Thinking' },
  { emoji: '😂', label: 'Laughing' },
  { emoji: '🤩', label: 'Star Eyes' },
]

// Sticky note colors
const STICKY_COLORS = [
  { color: '#fef08a', label: 'Yellow' },
  { color: '#fca5a5', label: 'Red' },
  { color: '#86efac', label: 'Green' },
  { color: '#93c5fd', label: 'Blue' },
  { color: '#f9a8d4', label: 'Pink' },
  { color: '#fdba74', label: 'Orange' },
]

// Tool button component
interface ToolButtonProps {
  icon: React.ElementType
  label: string
  active?: boolean
  onClick: () => void
  className?: string
  disabled?: boolean
}

function ToolButton({ icon: Icon, label, active, onClick, className, disabled }: ToolButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className={cn(
            'h-10 w-10 p-0 rounded-xl transition-all',
            active
              ? 'bg-blue-500/20 text-blue-500 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
            disabled && 'opacity-40 cursor-not-allowed',
            className
          )}
          onClick={onClick}
        >
          <Icon className="h-5 w-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-gray-900 text-white border-gray-700">
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

// Realistic pen preset button
interface PenPresetButtonProps {
  preset: PenPreset
  active: boolean
  onClick: () => void
}

function PenPresetButton({ preset, active, onClick }: PenPresetButtonProps) {
  const isHighlighter = preset.tool === 'highlighter'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className={cn(
            'w-10 h-14 rounded-xl flex flex-col items-center justify-end pb-1 transition-all relative',
            active
              ? 'bg-blue-100 ring-2 ring-blue-500 ring-offset-2'
              : 'hover:bg-gray-100'
          )}
          onClick={onClick}
        >
          {isHighlighter ? (
            // Chisel tip highlighter - MS Whiteboard style
            <div className="flex flex-col items-center">
              {/* Cap */}
              <div
                className="w-4 h-2 rounded-t-sm"
                style={{ backgroundColor: preset.color, opacity: 0.9 }}
              />
              {/* Body */}
              <div
                className="w-5 h-8 rounded-sm"
                style={{ backgroundColor: preset.color, opacity: 0.7 }}
              />
              {/* Chisel tip */}
              <div
                className="w-5 h-1.5 rounded-b-sm"
                style={{ backgroundColor: preset.color }}
              />
            </div>
          ) : (
            // Ballpoint pen style - MS Whiteboard style
            <div className="flex flex-col items-center">
              {/* Pen cap/top */}
              <div
                className="w-2.5 h-2 rounded-t-full"
                style={{ backgroundColor: preset.color }}
              />
              {/* Pen body */}
              <div
                className="w-3 h-7 rounded-sm"
                style={{ backgroundColor: preset.color }}
              />
              {/* Pen tip (triangular) */}
              <div
                className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent"
                style={{ borderTopColor: preset.color }}
              />
            </div>
          )}
          {/* Active dot indicator */}
          {active && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-gray-900 text-white text-xs">
        {preset.name}
      </TooltipContent>
    </Tooltip>
  )
}

// Shapes submenu
function ShapesMenu({ onSelect }: { onSelect: (tool: DrawingTool) => void }) {
  return (
    <div className="flex gap-1 p-2">
      <ToolButton icon={Minus} label="Line" onClick={() => onSelect('line')} />
      <ToolButton icon={ArrowRight} label="Arrow" onClick={() => onSelect('arrow')} />
      <ToolButton icon={Square} label="Rectangle" onClick={() => onSelect('rectangle')} />
      <ToolButton icon={Circle} label="Ellipse" onClick={() => onSelect('ellipse')} />
    </div>
  )
}

// Reactions menu
function ReactionsMenu({ onSelect }: { onSelect: (emoji: string) => void }) {
  return (
    <div className="p-2">
      <div className="grid grid-cols-6 gap-1">
        {REACTIONS.map((reaction) => (
          <Tooltip key={reaction.emoji}>
            <TooltipTrigger asChild>
              <button
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-xl"
                onClick={() => onSelect(reaction.emoji)}
              >
                {reaction.emoji}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">{reaction.label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}

// Sticky note menu
function StickyNoteMenu({ onSelect }: { onSelect: (color: string) => void }) {
  return (
    <div className="p-2">
      <div className="grid grid-cols-3 gap-2">
        {STICKY_COLORS.map((item) => (
          <Tooltip key={item.color}>
            <TooltipTrigger asChild>
              <button
                className="w-12 h-12 rounded-lg shadow-sm hover:scale-105 transition-transform border border-gray-200"
                style={{ backgroundColor: item.color }}
                onClick={() => onSelect(item.color)}
              />
            </TooltipTrigger>
            <TooltipContent side="top">{item.label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}

export function WhiteboardToolbar() {
  const [showInkTools, setShowInkTools] = useState(true)
  const [stickyNoteOpen, setStickyNoteOpen] = useState(false)
  const [reactionsOpen, setReactionsOpen] = useState(false)
  const [shapesOpen, setShapesOpen] = useState(false)
  const { screenToFlowPosition } = useReactFlow()

  // Get center of viewport for placing new elements
  const getViewportCenter = () => {
    const viewportCenter = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    }
    return screenToFlowPosition(viewportCenter)
  }

  const drawingMode = useEditorStore((s) => s.drawingMode)
  const drawingTool = useEditorStore((s) => s.drawingTool)
  const drawingStrokes = useEditorStore((s) => s.drawingStrokes)
  const drawingLayerVisible = useEditorStore((s) => s.drawingLayerVisible)
  const penPresets = useEditorStore((s) => s.penPresets)
  const activePenPresetId = useEditorStore((s) => s.activePenPresetId)

  const setDrawingMode = useEditorStore((s) => s.setDrawingMode)
  const setDrawingTool = useEditorStore((s) => s.setDrawingTool)
  const clearDrawingStrokes = useEditorStore((s) => s.clearDrawingStrokes)
  const undoDrawingStroke = useEditorStore((s) => s.undoDrawingStroke)
  const toggleDrawingLayerVisible = useEditorStore((s) => s.toggleDrawingLayerVisible)
  const selectPenPreset = useEditorStore((s) => s.selectPenPreset)
  const addNode = useEditorStore((s) => s.addNode)
  const airCanvasEnabled = useEditorStore((s) => s.airCanvasEnabled)
  const toggleAirCanvas = useEditorStore((s) => s.toggleAirCanvas)

  // Helper to broadcast node creation to collaborators
  // Must be defined before any early returns (React hooks rule)
  const broadcastNodeCreation = useCallback((nodeData: Record<string, unknown>) => {
    if (collaborationService.isConnected()) {
      const nodeId = nodeData.id as string
      console.log('[WhiteboardToolbar] Broadcasting node creation:', nodeId)
      collaborationService.broadcastOperation('node-create', nodeId, nodeData)
    }
  }, [])

  if (!drawingMode) return null

  const isInkTool = ['pen', 'highlighter'].includes(drawingTool)
  const isShapeTool = ['line', 'arrow', 'rectangle', 'ellipse'].includes(drawingTool)

  // Add sticky note with color - stay in whiteboard mode
  const handleAddStickyNote = (color?: string) => {
    // Don't exit drawing mode - keep whiteboard open
    const center = getViewportCenter()
    const position = { x: center.x - 90, y: center.y - 90 }
    const nodeData = {
      label: '',
      style: {
        backgroundColor: color || '#fef08a',
        textColor: '#1f2937',
        borderWidth: 0,
        borderRadius: 2,
        textAlign: 'left',
        verticalAlign: 'top',
        fontSize: 14,
      }
    }
    const dimensions = { width: 180, height: 180 }

    // Track node count before adding
    const nodeCountBefore = useEditorStore.getState().nodes.length

    // Add node locally
    addNode('sticky-note', position, nodeData, dimensions)

    // Broadcast to collaborators - find the newly added node
    setTimeout(() => {
      const nodes = useEditorStore.getState().nodes
      if (nodes.length > nodeCountBefore) {
        const createdNode = nodes[nodes.length - 1]
        if (createdNode) {
          broadcastNodeCreation(createdNode as unknown as Record<string, unknown>)
        }
      }
    }, 10)
  }

  // Add text - stay in whiteboard mode
  const handleAddText = () => {
    // Don't exit drawing mode - keep whiteboard open
    const center = getViewportCenter()
    const position = { x: center.x - 50, y: center.y - 15 }

    // Track node count before adding
    const nodeCountBefore = useEditorStore.getState().nodes.length

    // Add node locally with default dimensions for text
    addNode('text', position, {}, { width: 120, height: 32 })

    // Select the new node and set it for editing so user can type immediately
    setTimeout(() => {
      const nodes = useEditorStore.getState().nodes
      if (nodes.length > nodeCountBefore) {
        const createdNode = nodes[nodes.length - 1]
        if (createdNode) {
          // Select the node
          useEditorStore.getState().selectNodes([createdNode.id])
          // Set as editing node to show text toolbar
          useEditorStore.getState().setEditingNodeId(createdNode.id)
          // Broadcast to collaborators
          broadcastNodeCreation(createdNode as unknown as Record<string, unknown>)
        }
      }
    }, 10)
  }

  // Add reaction/emoji - stay in whiteboard mode
  const handleAddReaction = (emoji: string) => {
    // Don't exit drawing mode - keep whiteboard open
    const center = getViewportCenter()
    const position = { x: center.x - 32, y: center.y - 32 }
    const nodeData = {
      label: emoji,
      hideHandles: true,
      style: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        borderColor: 'transparent',
        fontSize: 48,
        textAlign: 'center',
      }
    }
    const dimensions = { width: 64, height: 64 }

    // Track node count before adding
    const nodeCountBefore = useEditorStore.getState().nodes.length

    // Add node locally
    addNode('text', position, nodeData, dimensions)

    // Broadcast to collaborators
    setTimeout(() => {
      const nodes = useEditorStore.getState().nodes
      if (nodes.length > nodeCountBefore) {
        const createdNode = nodes[nodes.length - 1]
        if (createdNode) {
          broadcastNodeCreation(createdNode as unknown as Record<string, unknown>)
        }
      }
    }, 10)
  }

  return (
    <>
      {/* Ink Tools Bar (Secondary toolbar - shows when ink tool selected) */}
      {showInkTools && isInkTool && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-40">
          <div className="flex items-end gap-1 bg-white/95 backdrop-blur-md rounded-2xl p-2 shadow-xl border border-gray-200">
            {/* Pen Presets */}
            {penPresets.map((preset) => (
              <PenPresetButton
                key={preset.id}
                preset={preset}
                active={activePenPresetId === preset.id}
                onClick={() => selectPenPreset(preset.id)}
              />
            ))}

            {/* Divider */}
            <div className="w-px h-12 bg-gray-200 mx-2 self-center" />

            {/* Ruler */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="w-12 h-16 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Ruler className="h-6 w-6 text-gray-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Ruler (coming soon)</TooltipContent>
            </Tooltip>

            {/* Lasso Select */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    'w-12 h-16 rounded-xl flex items-center justify-center transition-colors',
                    drawingTool === 'select' ? 'bg-blue-50 text-blue-500' : 'hover:bg-gray-50 text-gray-600'
                  )}
                  onClick={() => setDrawingTool('select')}
                >
                  <Lasso className="h-6 w-6" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Lasso Select</TooltipContent>
            </Tooltip>

            {/* Divider */}
            <div className="w-px h-12 bg-gray-200 mx-2 self-center" />

            {/* Close ink tools */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-600 self-center"
                  onClick={() => setShowInkTools(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Close</TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}

      {/* Main Toolbar (Bottom) */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md rounded-2xl p-2 shadow-xl border border-gray-200">
          {/* Undo */}
          <ToolButton
            icon={Undo2}
            label="Undo (Ctrl+Z)"
            onClick={undoDrawingStroke}
            disabled={drawingStrokes.length === 0}
          />

          {/* Divider */}
          <div className="w-px h-8 bg-gray-200 mx-1" />

          {/* Select Tool */}
          <ToolButton
            icon={MousePointer2}
            label="Select (V)"
            active={drawingTool === 'select'}
            onClick={() => setDrawingTool('select')}
          />

          {/* Pan Tool */}
          <ToolButton
            icon={Hand}
            label="Pan (Space)"
            onClick={() => setDrawingMode(false)}
          />

          {/* Pen/Ink Tool */}
          <ToolButton
            icon={Pencil}
            label="Pen (B)"
            active={drawingTool === 'pen' || drawingTool === 'highlighter'}
            onClick={() => {
              setDrawingTool('pen')
              setShowInkTools(true)
            }}
          />

          {/* Eraser - MS Whiteboard style */}
          <ToolButton
            icon={EraserIcon}
            label="Eraser (E)"
            active={drawingTool === 'eraser'}
            onClick={() => setDrawingTool('eraser')}
          />

          {/* Divider */}
          <div className="w-px h-8 bg-gray-200 mx-1" />

          {/* Sticky Note with color picker */}
          <Popover open={stickyNoteOpen} onOpenChange={setStickyNoteOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 rounded-xl text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50"
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8l6-6V5c0-1.1-.9-2-2-2zm-7 11H7v-2h5v2zm5-4H7V8h10v2zm-2 8v-4h4l-4 4z"/>
                </svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent side="top" className="w-auto p-0 bg-white border-gray-200">
              <StickyNoteMenu onSelect={(color) => {
                handleAddStickyNote(color)
                setStickyNoteOpen(false)
              }} />
            </PopoverContent>
          </Popover>

          {/* Reactions/Stickers */}
          <Popover open={reactionsOpen} onOpenChange={setReactionsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 rounded-xl text-pink-500 hover:text-pink-600 hover:bg-pink-50"
              >
                <Heart className="h-5 w-5 fill-current" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="top" className="w-auto p-0 bg-white border-gray-200">
              <ReactionsMenu onSelect={(emoji) => {
                handleAddReaction(emoji)
                setReactionsOpen(false)
              }} />
            </PopoverContent>
          </Popover>

          {/* Text */}
          <ToolButton
            icon={Type}
            label="Text (T)"
            active={drawingTool === 'text'}
            onClick={handleAddText}
          />

          {/* Shapes */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-10 w-10 p-0 rounded-xl transition-all',
                  isShapeTool
                    ? 'bg-blue-500/20 text-blue-500'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                <Shapes className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="top" className="w-auto p-0 bg-white border-gray-200">
              <ShapesMenu onSelect={setDrawingTool} />
            </PopoverContent>
          </Popover>

          {/* Templates/Copy - placeholder */}
          <ToolButton
            icon={Copy}
            label="Templates"
            onClick={() => {}}
            className="text-purple-500 hover:text-purple-600 hover:bg-purple-50"
          />

          {/* Air Canvas (Camera gesture drawing) */}
          <ToolButton
            icon={Camera}
            label="Air Canvas (G)"
            active={airCanvasEnabled}
            onClick={toggleAirCanvas}
            className={airCanvasEnabled ? 'text-green-500 hover:text-green-600 hover:bg-green-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
          />

          {/* Divider */}
          <div className="w-px h-8 bg-gray-200 mx-1" />

          {/* More Options */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="top" className="w-48 bg-white border-gray-200">
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={toggleDrawingLayerVisible}
                >
                  {drawingLayerVisible ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Drawings
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show Drawings
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={clearDrawingStrokes}
                  disabled={drawingStrokes.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-200 mx-1" />

          {/* Exit Drawing Mode */}
          <ToolButton
            icon={X}
            label="Exit Drawing Mode (Esc)"
            onClick={() => setDrawingMode(false)}
          />
        </div>
      </div>
    </>
  )
}
