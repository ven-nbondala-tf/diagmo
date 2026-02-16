import { useCallback, useMemo } from 'react'
import { useEditorStore } from '@/stores/editorStore'
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui'
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
  ChevronDown,
  Group,
  Ungroup,
  Lock,
  Unlock,
  Copy,
  Trash2,
  Plus,
  Table2,
  Square,
  Circle,
  Diamond,
  StickyNote,
  Image,
  FileText,
} from 'lucide-react'
import { useReactFlow } from '@xyflow/react'
import { cn } from '@/utils/cn'

const FONT_FAMILIES = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times' },
  { value: 'Courier New', label: 'Courier' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Tahoma', label: 'Tahoma' },
]

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72]

const BORDER_WIDTHS = [
  { value: '1', label: '1 px' },
  { value: '2', label: '2 px' },
  { value: '3', label: '3 px' },
  { value: '4', label: '4 px' },
]

export function FormattingToolbar() {
  const selectedNodeIds = useEditorStore((state) => state.selectedNodes) || []
  const nodes = useEditorStore((state) => state.nodes) || []
  const updateNodeStyle = useEditorStore((state) => state.updateNodeStyle)
  const alignNodes = useEditorStore((state) => state.alignNodes)
  const distributeNodes = useEditorStore((state) => state.distributeNodes)
  const groupNodes = useEditorStore((state) => state.groupNodes)
  const ungroupNodes = useEditorStore((state) => state.ungroupNodes)
  const lockNodes = useEditorStore((state) => state.lockNodes)
  const unlockNodes = useEditorStore((state) => state.unlockNodes)
  const copyNodes = useEditorStore((state) => state.copyNodes)
  const pasteNodes = useEditorStore((state) => state.pasteNodes)
  const deleteSelected = useEditorStore((state) => state.deleteSelected)
  const addNode = useEditorStore((state) => state.addNode)

  const { getViewport } = useReactFlow()

  const selectedNodes = useMemo(
    () => nodes.filter((n) => selectedNodeIds.includes(n.id)),
    [nodes, selectedNodeIds]
  )
  const hasSelection = selectedNodes.length > 0
  const hasMultiple = selectedNodes.length >= 2
  const hasThreeOrMore = selectedNodes.length >= 3
  const firstNode = selectedNodes[0]
  const style = (firstNode?.data?.style as Record<string, unknown>) || {}

  const allLocked = selectedNodes.length > 0 && selectedNodes.every((n) => n.data.locked)
  const hasGroupedNodes = selectedNodes.some((n) => n.data.groupId)

  const updateStyle = useCallback(
    (updates: Record<string, unknown>) => {
      selectedNodeIds.forEach((id) => {
        updateNodeStyle(id, updates)
      })
    },
    [selectedNodeIds, updateNodeStyle]
  )

  const handleDuplicate = () => {
    copyNodes()
    pasteNodes()
  }

  // Insert shape at viewport center
  const handleInsertShape = useCallback((shapeType: string) => {
    const { x, y, zoom } = getViewport()
    const viewportWidth = window.innerWidth - 300
    const viewportHeight = window.innerHeight - 100
    const centerX = (-x + viewportWidth / 2) / zoom
    const centerY = (-y + viewportHeight / 2) / zoom
    addNode(shapeType, { x: centerX, y: centerY })
  }, [getViewport, addNode])

  const ToolbarButton = ({
    icon: Icon,
    label,
    active,
    onClick,
    disabled,
  }: {
    icon: React.ElementType
    label: string
    active?: boolean
    onClick?: () => void
    disabled?: boolean
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-7 w-7 rounded',
            active
              ? 'bg-supabase-bg-tertiary text-supabase-text-primary'
              : 'text-supabase-text-muted hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary/50',
            disabled && 'opacity-40 cursor-not-allowed'
          )}
          onClick={onClick}
          disabled={disabled}
        >
          <Icon className="h-4 w-4" strokeWidth={1.5} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  )

  const Divider = () => <div className="w-px h-5 bg-supabase-border/50 mx-1" />

  return (
    <div className="h-9 flex items-center px-3 gap-1 border-b border-supabase-border bg-supabase-bg">
      {/* Font family dropdown */}
      <Select
        value={(style.fontFamily as string) || 'Inter'}
        onValueChange={(value) => updateStyle({ fontFamily: value })}
        disabled={!hasSelection}
      >
        <SelectTrigger className="h-7 w-[90px] text-xs bg-supabase-bg-secondary border-supabase-border text-supabase-text-primary">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-supabase-bg-secondary border-supabase-border shadow-lg z-[100]">
          {FONT_FAMILIES.map((font) => (
            <SelectItem
              key={font.value}
              value={font.value}
              className="text-xs text-supabase-text-primary hover:bg-supabase-bg-tertiary focus:bg-supabase-bg-tertiary"
            >
              {font.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Font size dropdown */}
      <Select
        value={String((style.fontSize as number) || 14)}
        onValueChange={(value) => updateStyle({ fontSize: parseInt(value) })}
        disabled={!hasSelection}
      >
        <SelectTrigger className="h-7 w-[55px] text-xs bg-supabase-bg-secondary border-supabase-border text-supabase-text-primary">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-supabase-bg-secondary border-supabase-border shadow-lg z-[100]">
          {FONT_SIZES.map((size) => (
            <SelectItem
              key={size}
              value={String(size)}
              className="text-xs text-supabase-text-primary hover:bg-supabase-bg-tertiary focus:bg-supabase-bg-tertiary"
            >
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Divider />

      {/* Bold */}
      <ToolbarButton
        icon={Bold}
        label="Bold (Ctrl+B)"
        active={style.fontWeight === 'bold'}
        onClick={() => updateStyle({ fontWeight: style.fontWeight === 'bold' ? 'normal' : 'bold' })}
        disabled={!hasSelection}
      />

      {/* Italic */}
      <ToolbarButton
        icon={Italic}
        label="Italic (Ctrl+I)"
        active={style.fontStyle === 'italic'}
        onClick={() => updateStyle({ fontStyle: style.fontStyle === 'italic' ? 'normal' : 'italic' })}
        disabled={!hasSelection}
      />

      {/* Underline */}
      <ToolbarButton
        icon={Underline}
        label="Underline (Ctrl+U)"
        active={style.textDecoration === 'underline'}
        onClick={() => updateStyle({ textDecoration: style.textDecoration === 'underline' ? 'none' : 'underline' })}
        disabled={!hasSelection}
      />

      {/* Text color */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('relative', !hasSelection && 'opacity-40 pointer-events-none')}>
            <input
              type="color"
              value={(style.textColor as string) || '#ededed'}
              onChange={(e) => updateStyle({ textColor: e.target.value })}
              className="absolute inset-0 opacity-0 cursor-pointer w-7 h-7 z-10"
              disabled={!hasSelection}
            />
            <div className="h-7 w-7 rounded flex flex-col items-center justify-center hover:bg-supabase-bg-tertiary/50 cursor-pointer">
              <Type className="h-3.5 w-3.5 text-supabase-text-muted" strokeWidth={1.5} />
              <div
                className="w-4 h-1 rounded-sm mt-0.5"
                style={{ backgroundColor: (style.textColor as string) || '#ededed' }}
              />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Text Color</TooltipContent>
      </Tooltip>

      <Divider />

      {/* Text Alignment buttons */}
      <ToolbarButton
        icon={AlignLeft}
        label="Text Left"
        active={style.textAlign === 'left'}
        onClick={() => updateStyle({ textAlign: 'left' })}
        disabled={!hasSelection}
      />
      <ToolbarButton
        icon={AlignCenter}
        label="Text Center"
        active={!style.textAlign || style.textAlign === 'center'}
        onClick={() => updateStyle({ textAlign: 'center' })}
        disabled={!hasSelection}
      />
      <ToolbarButton
        icon={AlignRight}
        label="Text Right"
        active={style.textAlign === 'right'}
        onClick={() => updateStyle({ textAlign: 'right' })}
        disabled={!hasSelection}
      />

      <Divider />

      {/* Border width dropdown */}
      <Select
        value={String((style.borderWidth as number) || 1)}
        onValueChange={(value) => updateStyle({ borderWidth: parseInt(value) })}
        disabled={!hasSelection}
      >
        <SelectTrigger className="h-7 w-[60px] text-xs bg-supabase-bg-secondary border-supabase-border text-supabase-text-primary">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-supabase-bg-secondary border-supabase-border shadow-lg z-[100]">
          {BORDER_WIDTHS.map((width) => (
            <SelectItem
              key={width.value}
              value={width.value}
              className="text-xs text-supabase-text-primary hover:bg-supabase-bg-tertiary focus:bg-supabase-bg-tertiary"
            >
              {width.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Divider />

      {/* Align dropdown - only show when multiple selected */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2 text-xs gap-1",
              !hasMultiple && "opacity-40 cursor-not-allowed"
            )}
            disabled={!hasMultiple}
          >
            <AlignStartVertical className="h-4 w-4" />
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="bg-supabase-bg-secondary border-supabase-border">
          <DropdownMenuItem onClick={() => alignNodes('left')} className="text-xs">
            <AlignStartVertical className="h-4 w-4 mr-2" />Align Left
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => alignNodes('center')} className="text-xs">
            <AlignCenterVertical className="h-4 w-4 mr-2" />Align Center
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => alignNodes('right')} className="text-xs">
            <AlignEndVertical className="h-4 w-4 mr-2" />Align Right
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => alignNodes('top')} className="text-xs">
            <AlignStartHorizontal className="h-4 w-4 mr-2" />Align Top
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => alignNodes('middle')} className="text-xs">
            <AlignCenterHorizontal className="h-4 w-4 mr-2" />Align Middle
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => alignNodes('bottom')} className="text-xs">
            <AlignEndHorizontal className="h-4 w-4 mr-2" />Align Bottom
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Distribute dropdown - only show when 3+ selected */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2 text-xs gap-1",
              !hasThreeOrMore && "opacity-40 cursor-not-allowed"
            )}
            disabled={!hasThreeOrMore}
          >
            <AlignHorizontalDistributeCenter className="h-4 w-4" />
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="bg-supabase-bg-secondary border-supabase-border">
          <DropdownMenuItem onClick={() => distributeNodes('horizontal')} className="text-xs">
            <AlignHorizontalDistributeCenter className="h-4 w-4 mr-2" />Distribute Horizontally
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => distributeNodes('vertical')} className="text-xs">
            <AlignVerticalDistributeCenter className="h-4 w-4 mr-2" />Distribute Vertically
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Group */}
      <ToolbarButton
        icon={Group}
        label="Group (Ctrl+G)"
        onClick={groupNodes}
        disabled={!hasMultiple}
      />

      {/* Ungroup - only show when grouped nodes selected */}
      {hasGroupedNodes && (
        <ToolbarButton
          icon={Ungroup}
          label="Ungroup (Ctrl+Shift+G)"
          onClick={ungroupNodes}
        />
      )}

      {/* Lock/Unlock */}
      <ToolbarButton
        icon={allLocked ? Unlock : Lock}
        label={allLocked ? "Unlock" : "Lock"}
        onClick={allLocked ? unlockNodes : lockNodes}
        disabled={!hasSelection}
      />

      {/* Copy/Duplicate */}
      <ToolbarButton
        icon={Copy}
        label="Duplicate (Ctrl+D)"
        onClick={handleDuplicate}
        disabled={!hasSelection}
      />

      {/* Delete */}
      <ToolbarButton
        icon={Trash2}
        label="Delete (Del)"
        onClick={deleteSelected}
        disabled={!hasSelection}
      />

      <Divider />

      {/* Insert dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs gap-1 text-supabase-text-muted hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary/50"
          >
            <Plus className="h-4 w-4" />
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-supabase-bg-secondary border-supabase-border min-w-[160px]">
          <DropdownMenuItem onClick={() => handleInsertShape('table')} className="text-xs">
            <Table2 className="h-4 w-4 mr-2" />Table
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleInsertShape('rectangle')} className="text-xs">
            <Square className="h-4 w-4 mr-2" />Rectangle
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleInsertShape('circle')} className="text-xs">
            <Circle className="h-4 w-4 mr-2" />Circle
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleInsertShape('diamond')} className="text-xs">
            <Diamond className="h-4 w-4 mr-2" />Diamond
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleInsertShape('text')} className="text-xs">
            <FileText className="h-4 w-4 mr-2" />Text
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleInsertShape('sticky-note')} className="text-xs">
            <StickyNote className="h-4 w-4 mr-2" />Sticky Note
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleInsertShape('image')} className="text-xs">
            <Image className="h-4 w-4 mr-2" />Image
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
