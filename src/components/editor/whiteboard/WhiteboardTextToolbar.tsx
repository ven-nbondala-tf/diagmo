import { useState, useEffect, useRef, useCallback } from 'react'
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
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/utils/cn'

// Font size options similar to MS Whiteboard
const FONT_SIZES = [
  { value: 10, label: 'Small' },
  { value: 14, label: 'Medium' },
  { value: 18, label: 'Large' },
  { value: 24, label: 'X-Large' },
  { value: 32, label: 'Huge' },
]

// Color palette
const TEXT_COLORS = [
  '#1f2937', // Dark gray (default)
  '#000000', // Black
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#ffffff', // White
]

interface ToolButtonProps {
  icon: React.ElementType
  label: string
  active?: boolean
  onClick: (e: React.MouseEvent) => void
  className?: string
}

function ToolButton({ icon: Icon, label, active, onClick, className }: ToolButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          tabIndex={-1}
          data-text-toolbar-button="true"
          className={cn(
            'h-8 w-8 p-0 rounded-lg transition-all flex items-center justify-center',
            active
              ? 'bg-blue-500/20 text-blue-600'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
            className
          )}
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onClick={onClick}
        >
          <Icon className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-gray-900 text-white border-gray-700 text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

export function WhiteboardTextToolbar() {
  const { getNode, flowToScreenPosition } = useReactFlow()
  const [fontSizeOpen, setFontSizeOpen] = useState(false)
  const [colorOpen, setColorOpen] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)

  const editingNodeId = useEditorStore((s) => s.editingNodeId)
  const nodes = useEditorStore((s) => s.nodes)
  const updateNodeStyle = useEditorStore((s) => s.updateNodeStyle)

  // Get the editing node
  const editingNode = editingNodeId ? nodes.find(n => n.id === editingNodeId) : null
  const nodeStyle = editingNode?.data?.style || {}

  // Calculate toolbar position based on node position
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!editingNodeId) return

    const node = getNode(editingNodeId)
    if (!node) return

    // Get node position and convert to screen coordinates
    const nodeWidth = node.measured?.width || node.width || 100
    const screenPos = flowToScreenPosition({
      x: node.position.x + nodeWidth / 2,
      y: node.position.y - 10, // Position above the node
    })

    setToolbarPosition({
      x: screenPos.x,
      y: screenPos.y,
    })
  }, [editingNodeId, getNode, flowToScreenPosition, nodes])

  // Helper to refocus the editing input after style changes
  const refocusInput = () => {
    // Find and focus the text input in the editing node
    setTimeout(() => {
      const input = document.querySelector('.react-flow__node.selected input') as HTMLInputElement
      const textarea = document.querySelector('.react-flow__node.selected textarea') as HTMLTextAreaElement
      if (input) input.focus()
      else if (textarea) textarea.focus()
    }, 10)
  }

  // Helper to broadcast style changes to collaborators
  const broadcastStyleUpdate = (nodeId: string, styleUpdate: Record<string, unknown>) => {
    if (collaborationService.isConnected()) {
      collaborationService.broadcastOperation('node-update', nodeId, {
        data: { style: styleUpdate }
      })
    }
  }

  // Handle style updates - always get fresh state from store to avoid stale closures
  const handleToggleBold = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const currentEditingId = useEditorStore.getState().editingNodeId
    if (!currentEditingId) return
    const node = useEditorStore.getState().nodes.find(n => n.id === currentEditingId)
    const currentWeight = node?.data?.style?.fontWeight || 'normal'
    const newWeight = currentWeight === 'bold' ? 'normal' : 'bold'
    updateNodeStyle(currentEditingId, { fontWeight: newWeight })
    broadcastStyleUpdate(currentEditingId, { fontWeight: newWeight })
    refocusInput()
  }

  const handleToggleItalic = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const currentEditingId = useEditorStore.getState().editingNodeId
    if (!currentEditingId) return
    const node = useEditorStore.getState().nodes.find(n => n.id === currentEditingId)
    const currentStyle = node?.data?.style?.fontStyle || 'normal'
    const newStyle = currentStyle === 'italic' ? 'normal' : 'italic'
    updateNodeStyle(currentEditingId, { fontStyle: newStyle })
    broadcastStyleUpdate(currentEditingId, { fontStyle: newStyle })
    refocusInput()
  }

  const handleToggleUnderline = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const currentEditingId = useEditorStore.getState().editingNodeId
    if (!currentEditingId) return
    const node = useEditorStore.getState().nodes.find(n => n.id === currentEditingId)
    const currentDecoration = node?.data?.style?.textDecoration || 'none'
    const newDecoration = currentDecoration === 'underline' ? 'none' : 'underline'
    updateNodeStyle(currentEditingId, { textDecoration: newDecoration })
    broadcastStyleUpdate(currentEditingId, { textDecoration: newDecoration })
    refocusInput()
  }

  const handleSetFontSize = (size: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Get fresh editingNodeId from store to avoid stale closure
    const currentEditingId = useEditorStore.getState().editingNodeId
    if (!currentEditingId) return
    updateNodeStyle(currentEditingId, { fontSize: size })
    broadcastStyleUpdate(currentEditingId, { fontSize: size })
    setFontSizeOpen(false)
    refocusInput()
  }

  const handleSetTextColor = (color: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Get fresh editingNodeId from store to avoid stale closure
    const currentEditingId = useEditorStore.getState().editingNodeId
    if (!currentEditingId) return
    updateNodeStyle(currentEditingId, { textColor: color })
    broadcastStyleUpdate(currentEditingId, { textColor: color })
    setColorOpen(false)
    refocusInput()
  }

  const handleSetTextAlign = (align: 'left' | 'center' | 'right', e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Get fresh editingNodeId from store to avoid stale closure
    const currentEditingId = useEditorStore.getState().editingNodeId
    if (!currentEditingId) return
    updateNodeStyle(currentEditingId, { textAlign: align })
    broadcastStyleUpdate(currentEditingId, { textAlign: align })
    refocusInput()
  }

  // Keyboard shortcuts for text formatting (Ctrl+B, Ctrl+I, Ctrl+U)
  useEffect(() => {
    if (!editingNodeId) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey
      if (!isMod) return

      const currentEditingId = useEditorStore.getState().editingNodeId
      if (!currentEditingId) return

      // Bold: Ctrl+B
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault()
        const node = useEditorStore.getState().nodes.find(n => n.id === currentEditingId)
        const currentWeight = node?.data?.style?.fontWeight || 'normal'
        const newWeight = currentWeight === 'bold' ? 'normal' : 'bold'
        updateNodeStyle(currentEditingId, { fontWeight: newWeight })
        broadcastStyleUpdate(currentEditingId, { fontWeight: newWeight })
        refocusInput()
      }

      // Italic: Ctrl+I
      if (e.key === 'i' || e.key === 'I') {
        e.preventDefault()
        const node = useEditorStore.getState().nodes.find(n => n.id === currentEditingId)
        const currentStyle = node?.data?.style?.fontStyle || 'normal'
        const newStyle = currentStyle === 'italic' ? 'normal' : 'italic'
        updateNodeStyle(currentEditingId, { fontStyle: newStyle })
        broadcastStyleUpdate(currentEditingId, { fontStyle: newStyle })
        refocusInput()
      }

      // Underline: Ctrl+U
      if (e.key === 'u' || e.key === 'U') {
        e.preventDefault()
        const node = useEditorStore.getState().nodes.find(n => n.id === currentEditingId)
        const currentDecoration = node?.data?.style?.textDecoration || 'none'
        const newDecoration = currentDecoration === 'underline' ? 'none' : 'underline'
        updateNodeStyle(currentEditingId, { textDecoration: newDecoration })
        broadcastStyleUpdate(currentEditingId, { textDecoration: newDecoration })
        refocusInput()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editingNodeId, updateNodeStyle])

  // Show when editing a node (works in both regular and whiteboard mode)
  if (!editingNodeId || !editingNode) return null

  // Get current values
  const currentFontSize = nodeStyle.fontSize || 14
  const currentFontSizeLabel = FONT_SIZES.find(f => f.value === currentFontSize)?.label || 'Medium'
  const isBold = nodeStyle.fontWeight === 'bold'
  const isItalic = nodeStyle.fontStyle === 'italic'
  const isUnderline = nodeStyle.textDecoration === 'underline'
  const textAlign = nodeStyle.textAlign || 'center'
  const textColor = nodeStyle.textColor || '#1f2937'

  return (
    <div
      ref={toolbarRef}
      data-text-toolbar="true"
      className="fixed z-[100] pointer-events-auto"
      style={{
        left: `${toolbarPosition.x}px`,
        top: `${toolbarPosition.y}px`,
        transform: 'translate(-50%, -100%)',
      }}
      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
    >
      <div className="flex items-center gap-0.5 bg-white backdrop-blur-md rounded-xl p-1.5 shadow-xl border border-gray-200">
        {/* Font Size Dropdown */}
        <Popover open={fontSizeOpen} onOpenChange={setFontSizeOpen} modal={false}>
          <PopoverTrigger asChild>
            <button
              type="button"
              tabIndex={-1}
              className="h-8 px-2 rounded-lg text-gray-700 hover:bg-gray-100 text-sm font-medium flex items-center gap-1"
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
              onPointerDown={(e) => { e.preventDefault(); e.stopPropagation() }}
            >
              {currentFontSizeLabel}
              <ChevronDown className="h-3 w-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            className="w-28 p-1 bg-white border-gray-200 z-[101]"
            data-text-toolbar="true"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => {
              // Don't close if clicking on toolbar or input
              const target = e.target as HTMLElement
              if (target.closest('[data-text-toolbar]') ||
                  target.closest('.react-flow__node') ||
                  target.tagName === 'INPUT') {
                e.preventDefault()
              }
            }}
          >
            <div className="flex flex-col">
              {FONT_SIZES.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  tabIndex={-1}
                  className={cn(
                    'px-3 py-1.5 text-left text-sm rounded hover:bg-gray-100 transition-colors cursor-pointer',
                    currentFontSize === size.value && 'bg-blue-50 text-blue-600'
                  )}
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
                  onPointerDown={(e) => { e.preventDefault(); e.stopPropagation() }}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleSetFontSize(size.value, e)
                  }}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Text Color */}
        <Popover open={colorOpen} onOpenChange={setColorOpen} modal={false}>
          <PopoverTrigger asChild>
            <button
              type="button"
              tabIndex={-1}
              className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100 relative flex items-center justify-center"
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
              onPointerDown={(e) => { e.preventDefault(); e.stopPropagation() }}
            >
              <span className="text-base font-bold" style={{ color: textColor }}>A</span>
              <div
                className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full"
                style={{ backgroundColor: textColor }}
              />
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            className="w-auto p-2 bg-white border-gray-200 z-[101]"
            data-text-toolbar="true"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => {
              // Don't close if clicking on toolbar or input
              const target = e.target as HTMLElement
              if (target.closest('[data-text-toolbar]') ||
                  target.closest('.react-flow__node') ||
                  target.tagName === 'INPUT') {
                e.preventDefault()
              }
            }}
          >
            <div className="grid grid-cols-5 gap-1">
              {TEXT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  tabIndex={-1}
                  className={cn(
                    'w-7 h-7 rounded-lg transition-transform hover:scale-110 border cursor-pointer',
                    textColor === color ? 'ring-2 ring-blue-500 ring-offset-1' : 'border-gray-200'
                  )}
                  style={{ backgroundColor: color }}
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
                  onPointerDown={(e) => { e.preventDefault(); e.stopPropagation() }}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleSetTextColor(color, e)
                  }}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Bold */}
        <ToolButton
          icon={Bold}
          label="Bold"
          active={isBold}
          onClick={handleToggleBold}
        />

        {/* Italic */}
        <ToolButton
          icon={Italic}
          label="Italic"
          active={isItalic}
          onClick={handleToggleItalic}
        />

        {/* Underline */}
        <ToolButton
          icon={Underline}
          label="Underline"
          active={isUnderline}
          onClick={handleToggleUnderline}
        />

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Text Alignment */}
        <ToolButton
          icon={AlignLeft}
          label="Align Left"
          active={textAlign === 'left'}
          onClick={(e) => handleSetTextAlign('left', e)}
        />
        <ToolButton
          icon={AlignCenter}
          label="Align Center"
          active={textAlign === 'center'}
          onClick={(e) => handleSetTextAlign('center', e)}
        />
        <ToolButton
          icon={AlignRight}
          label="Align Right"
          active={textAlign === 'right'}
          onClick={(e) => handleSetTextAlign('right', e)}
        />
      </div>
    </div>
  )
}
