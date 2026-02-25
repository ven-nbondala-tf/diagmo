import { memo, useState, useCallback, useRef, useEffect, useMemo, type CSSProperties } from 'react'
import { Handle, Position, NodeResizer, useConnection, type NodeProps } from '@xyflow/react'
import type { DiagramNode, ShapeType } from '@/types'
import { cn } from '@/utils'
import { useEditorStore } from '@/stores/editorStore'
import { useThemeStore } from '@/stores/themeStore'
import { collaborationService } from '@/services/collaborationService'
import { Lock, Group, RotateCw } from 'lucide-react'
import { getShapeRenderer, renderCloudIconOrDefault, type ShapeRenderProps } from '../shapes'
import { NodeContextMenu } from '../NodeContextMenu'

type CustomNodeProps = NodeProps<DiagramNode & { position: { x: number; y: number } }>

// Simple 4 cardinal connection points with explicit absolute positioning
// Forces handles to be at the exact center of each edge
const getShapeConnectionPoints = (_type: ShapeType): Array<{
  id: string
  position: Position
  style: React.CSSProperties
}> => {
  return [
    {
      id: 'top',
      position: Position.Top,
      style: {
        position: 'absolute',
        left: '50%',
        top: 0,
        right: 'auto',
        bottom: 'auto',
        transform: 'translate(-50%, -50%)'
      }
    },
    {
      id: 'right',
      position: Position.Right,
      style: {
        position: 'absolute',
        right: 0,
        left: 'auto',
        top: '50%',
        bottom: 'auto',
        transform: 'translate(50%, -50%)'
      }
    },
    {
      id: 'bottom',
      position: Position.Bottom,
      style: {
        position: 'absolute',
        left: '50%',
        top: 'auto',
        right: 'auto',
        bottom: 0,
        transform: 'translate(-50%, 50%)'
      }
    },
    {
      id: 'left',
      position: Position.Left,
      style: {
        position: 'absolute',
        left: 0,
        top: '50%',
        right: 'auto',
        bottom: 'auto',
        transform: 'translate(-50%, -50%)'
      }
    },
  ]
}

export const CustomNode = memo(function CustomNode({ id, data, selected, width, height }: CustomNodeProps) {
  const { label, type, style, locked, groupId, hideHandles } = data

  // Get node dimensions - use measured or default
  const nodeWidth = width || 64
  const nodeHeight = height || 64
  const [editText, setEditText] = useState(label)
  const [isHovered, setIsHovered] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const nodeRef = useRef<HTMLDivElement>(null)
  const updateNode = useEditorStore((state) => state.updateNode)
  const updateNodeStyle = useEditorStore((state) => state.updateNodeStyle)
  const setEditingNodeId = useEditorStore((state) => state.setEditingNodeId)
  const editingNodeId = useEditorStore((state) => state.editingNodeId)
  const focusedNodeId = useEditorStore((state) => state.focusedNodeId)
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme)

  // Derive isEditing from store - this node is editing if editingNodeId matches
  const isEditing = editingNodeId === id

  // Check if this node has keyboard navigation focus (show ring when focused but not selected)
  const isFocused = focusedNodeId === id && !selected

  // Get theme-aware default text color for cloud icons
  const themeTextColor = resolvedTheme === 'dark' ? '#ededed' : '#111827'

  // Handle rotation drag
  const handleRotationMouseDown = useCallback((e: React.MouseEvent) => {
    if (locked) return
    e.stopPropagation()
    e.preventDefault()
    setIsRotating(true)

    const nodeElement = nodeRef.current
    if (!nodeElement) return

    const rect = nodeElement.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const onMouseMove = (moveEvent: MouseEvent) => {
      const angle = Math.atan2(
        moveEvent.clientY - centerY,
        moveEvent.clientX - centerX
      )
      // Convert to degrees, offset by 90 (since handle is at top)
      let degrees = (angle * 180) / Math.PI + 90
      // Normalize to 0-360
      if (degrees < 0) degrees += 360
      // Snap to 15 degree increments if shift is not held
      if (!moveEvent.shiftKey) {
        degrees = Math.round(degrees / 15) * 15
      }
      updateNodeStyle(id, { rotation: Math.round(degrees) % 360 })
    }

    const onMouseUp = () => {
      setIsRotating(false)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [id, locked, updateNodeStyle])

  // Check if a connection is being made TO this node
  const connection = useConnection()

  // Only highlight if: connection in progress, we're not the source, AND mouse is hovering THIS node
  const isValidTarget = connection.inProgress && connection.fromNode?.id !== id && isHovered

  // Show handles when: selected, hovered, OR being connected to (unless hideHandles is true)
  const showHandles = !hideHandles && (selected || isHovered || connection.inProgress)

  // Get shape-specific connection points
  const connectionPoints = useMemo(() => getShapeConnectionPoints(type), [type])

  // Set min dimensions - allow very small sizes for flexibility
  // Check if this is any icon type (cloud providers, office, generic, etc.)
  const isCloudIcon = type.startsWith('aws-') ||
                      type.startsWith('azure-') ||
                      type.startsWith('gcp-') ||
                      type.startsWith('office-') ||
                      type.startsWith('generic-') ||
                      type === 'kubernetes' ||
                      type === 'docker'
  // Web-image icons/gifs should behave like cloud icons (tight bounding box)
  const isWebImageIcon = type === 'web-image' && (data.imageType === 'icon' || data.imageType === 'gif')
  const isJunction = type === 'junction'
  const isIconLike = isCloudIcon || isWebImageIcon || isJunction
  const minWidth = type === 'text' ? 20 : isJunction ? 8 : isIconLike ? 24 : 20
  const minHeight = type === 'text' ? 15 : isJunction ? 8 : isIconLike ? 24 : 20

  // Default font size: 8 for cloud icons, 14 for other shapes
  const defaultFontSize = isCloudIcon ? 10 : 14

  // Generate pattern background CSS
  const getPatternBackground = (bgColor: string, patternColor: string, size: number, opacity: number) => {
    const patternType = style?.patternType || 'diagonal-lines'
    const opaqueColor = patternColor.startsWith('#')
      ? `rgba(${parseInt(patternColor.slice(1, 3), 16)}, ${parseInt(patternColor.slice(3, 5), 16)}, ${parseInt(patternColor.slice(5, 7), 16)}, ${opacity})`
      : patternColor

    switch (patternType) {
      case 'diagonal-lines':
        return `repeating-linear-gradient(45deg, transparent, transparent ${size/2}px, ${opaqueColor} ${size/2}px, ${opaqueColor} ${size/2 + 1}px), ${bgColor}`
      case 'dots':
        return `radial-gradient(circle, ${opaqueColor} ${size/6}px, transparent ${size/6}px), ${bgColor}`
      case 'grid':
        return `linear-gradient(${opaqueColor} 1px, transparent 1px), linear-gradient(90deg, ${opaqueColor} 1px, transparent 1px), ${bgColor}`
      case 'crosshatch':
        return `repeating-linear-gradient(45deg, transparent, transparent ${size/2}px, ${opaqueColor} ${size/2}px, ${opaqueColor} ${size/2 + 0.5}px), repeating-linear-gradient(-45deg, transparent, transparent ${size/2}px, ${opaqueColor} ${size/2}px, ${opaqueColor} ${size/2 + 0.5}px), ${bgColor}`
      case 'horizontal-lines':
        return `repeating-linear-gradient(0deg, transparent, transparent ${size - 1}px, ${opaqueColor} ${size - 1}px, ${opaqueColor} ${size}px), ${bgColor}`
      case 'vertical-lines':
        return `repeating-linear-gradient(90deg, transparent, transparent ${size - 1}px, ${opaqueColor} ${size - 1}px, ${opaqueColor} ${size}px), ${bgColor}`
      default:
        return bgColor
    }
  }

  // Get background size for pattern
  const getPatternBackgroundSize = () => {
    const size = style?.patternSize ?? 8
    const patternType = style?.patternType || 'diagonal-lines'
    switch (patternType) {
      case 'dots':
        return `${size}px ${size}px`
      case 'grid':
        return `${size}px ${size}px`
      default:
        return undefined
    }
  }

  // Generate gradient, pattern, or solid background
  const getBackground = () => {
    const bgColor = style?.backgroundColor || '#ffffff'

    // Pattern takes priority if enabled
    if (style?.patternEnabled) {
      const patternColor = style.patternColor || '#6b7280'
      const patternSize = style.patternSize ?? 8
      const patternOpacity = style.patternOpacity ?? 1
      return getPatternBackground(bgColor, patternColor, patternSize, patternOpacity)
    }

    // Then gradient
    if (style?.gradientEnabled && style?.gradientColor) {
      const angle = style.gradientDirection === 'vertical' ? '180deg' :
                    style.gradientDirection === 'diagonal' ? '135deg' : '90deg'
      return `linear-gradient(${angle}, ${bgColor}, ${style.gradientColor})`
    }

    return bgColor
  }

  const hasComplexBackground = style?.gradientEnabled || style?.patternEnabled

  // Calculate luminance to determine if a color is light or dark
  const getLuminance = (hex: string): number => {
    const color = hex.replace('#', '')
    if (color.length !== 6) return 0.5
    const r = parseInt(color.substr(0, 2), 16) / 255
    const g = parseInt(color.substr(2, 2), 16) / 255
    const b = parseInt(color.substr(4, 2), 16) / 255
    const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
  }

  // Compute the actual text color - use explicit textColor if set, otherwise auto-contrast
  const getTextColor = () => {
    // If explicitly set (and not empty), use it
    if (style?.textColor && style.textColor.trim() !== '') {
      return style.textColor
    }

    // For cloud icons and transparent backgrounds, use theme-aware color
    const bgColor = style?.backgroundColor
    if (!bgColor || bgColor === 'transparent' || bgColor === '' || isCloudIcon) {
      // Return theme-aware text color
      return themeTextColor
    }

    // If background is the default white (#ffffff), use theme-aware color
    // This ensures nodes without explicit styling adapt to the current theme
    if (bgColor.toLowerCase() === '#ffffff' || bgColor.toLowerCase() === 'white') {
      return themeTextColor
    }

    // Auto-detect based on background color for proper contrast
    if (bgColor) {
      try {
        const luminance = getLuminance(bgColor)
        // If background is light (luminance > 0.5), use dark text; otherwise use light text
        return luminance > 0.5 ? '#1f2937' : '#f3f4f6'
      } catch {
        // Fall through to default
      }
    }

    // Fallback to theme-aware color
    return themeTextColor
  }

  const baseStyle = {
    backgroundColor: hasComplexBackground ? undefined : (style?.backgroundColor || '#ffffff'),
    background: hasComplexBackground ? getBackground() : undefined,
    backgroundSize: style?.patternEnabled ? getPatternBackgroundSize() : undefined,
    borderColor: style?.borderColor || '#9ca3af',
    borderWidth: style?.borderWidth || 1,
    borderStyle: style?.borderStyle || 'solid',
    borderRadius: style?.borderRadius || 8,
    color: getTextColor(),
    fontSize: style?.fontSize || defaultFontSize,
    fontFamily: style?.fontFamily || 'Inter',
    fontWeight: style?.fontWeight || 'normal',
    fontStyle: style?.fontStyle || 'normal',
    textDecoration: style?.textDecoration || 'none',
    textAlign: (style?.textAlign || 'center') as 'left' | 'center' | 'right',
    opacity: style?.backgroundOpacity ?? 1,
    // Shadow
    boxShadow: style?.shadowEnabled
      ? `${style.shadowOffsetX || 4}px ${style.shadowOffsetY || 4}px ${style.shadowBlur || 10}px ${style.shadowColor || 'rgba(0,0,0,0.2)'}`
      : 'none',
    // Transform (rotation + scale)
    transform: [
      style?.rotation ? `rotate(${style.rotation}deg)` : '',
      style?.scaleX !== undefined && style?.scaleX !== 1 ? `scaleX(${style.scaleX})` : '',
      style?.scaleY !== undefined && style?.scaleY !== 1 ? `scaleY(${style.scaleY})` : '',
    ].filter(Boolean).join(' ') || undefined,
    // Text padding
    padding: style?.textPadding ?? 8,
  }

  // Get vertical alignment class
  const getVerticalAlignClass = () => {
    switch (style?.verticalAlign) {
      case 'top':
        return 'items-start pt-2'
      case 'bottom':
        return 'items-end pb-2'
      default:
        return 'items-center'
    }
  }

  // Get horizontal alignment class for flexbox
  const getHorizontalAlignClass = () => {
    switch (style?.textAlign) {
      case 'left':
        return 'justify-start text-left'
      case 'right':
        return 'justify-end text-right'
      default:
        return 'justify-center text-center'
    }
  }

  // Get text wrap class
  const getTextWrapClass = () => {
    switch (style?.textWrap) {
      case 'nowrap':
        return 'whitespace-nowrap overflow-hidden'
      case 'truncate':
        return 'truncate'
      case 'wrap':
      default:
        return 'whitespace-normal break-words'
    }
  }

  // Handle double-click to start editing
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (locked) return
    e.stopPropagation()
    setEditText(label)
    setEditingNodeId(id) // This triggers isEditing to become true
  }, [locked, label, id, setEditingNodeId])

  // Track previous editing state to detect when editing starts
  const prevIsEditingRef = useRef(false)

  // Focus input/textarea and sync text when editing STARTS (not on every label change)
  useEffect(() => {
    const wasEditing = prevIsEditingRef.current
    prevIsEditingRef.current = isEditing

    // Only sync text when editing transitions from false to true
    if (isEditing && !wasEditing) {
      // Sync editText with current label when editing starts
      setEditText(label)
      // Focus the appropriate input
      if (type === 'sticky-note' && textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.select()
      } else if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }
  }, [isEditing, type, label])

  // Handle saving the text
  const handleSave = useCallback(() => {
    if (editText.trim() !== label) {
      const newLabel = editText.trim() || label
      updateNode(id, { label: newLabel })

      // Broadcast the update to collaborators
      if (collaborationService.isConnected()) {
        console.log('[CustomNode] Broadcasting label update:', id, newLabel)
        collaborationService.broadcastOperation('node-update', id, {
          data: { label: newLabel }
        })
      }
    }
    setEditingNodeId(null) // Clear editing state - this sets isEditing to false
  }, [editText, label, id, updateNode, setEditingNodeId])

  // Ref to track pending blur timeout
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Delayed blur handler - allows toolbar clicks to happen before exiting edit mode
  const handleBlur = useCallback(() => {
    // Clear any existing timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
    }

    // Delay the save to allow toolbar interactions to cancel it
    blurTimeoutRef.current = setTimeout(() => {
      // Check if a popover or toolbar element is currently active
      const activeElement = document.activeElement
      const hasOpenPopover = document.querySelector('[data-radix-popper-content-wrapper]')
      const isToolbarActive = activeElement?.closest('[data-text-toolbar]') ||
                              document.querySelector('[data-text-toolbar]:hover')

      // Don't close if toolbar or popover is active
      if (hasOpenPopover || isToolbarActive) {
        return
      }

      // Check if we're still supposed to be editing this node
      const currentEditingId = useEditorStore.getState().editingNodeId
      if (currentEditingId === id) {
        handleSave()
      }
    }, 250) // 250ms delay to allow popover and click handlers to fire first
  }, [handleSave, id])

  // Cancel blur timeout when component unmounts or when style changes (toolbar interaction)
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
      }
    }
  }, [])

  // Broadcast text changes in real-time while typing (debounced)
  const broadcastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    // Only broadcast while editing and if text changed from original
    if (!isEditing || editText === label) return

    // Clear previous timeout
    if (broadcastTimeoutRef.current) {
      clearTimeout(broadcastTimeoutRef.current)
    }

    // Debounce broadcast by 150ms for smooth real-time sync
    broadcastTimeoutRef.current = setTimeout(() => {
      // Update local state immediately
      updateNode(id, { label: editText })

      // Broadcast to collaborators
      if (collaborationService.isConnected()) {
        collaborationService.broadcastOperation('node-update', id, {
          data: { label: editText }
        })
      }
    }, 150)

    return () => {
      if (broadcastTimeoutRef.current) {
        clearTimeout(broadcastTimeoutRef.current)
      }
    }
  }, [editText, isEditing, id, label, updateNode])

  // Handle keyboard events
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      setEditText(label)
      setEditingNodeId(null) // Clear editing state
    }
  }, [handleSave, label, setEditingNodeId])

  const renderShape = () => {
    // Common classes for all shapes - use w-full h-full for resize support
    const shapeClass = cn(
      'w-full h-full flex overflow-hidden transition-all duration-150',
      getVerticalAlignClass(),
      getHorizontalAlignClass(),
      getTextWrapClass(),
      locked && 'opacity-75',
      // Highlight when being connected to (only this specific node when hovered)
      isValidTarget && 'ring-2 ring-green-500 ring-offset-2'
    )

    // Helper function to build complete style object that respects user settings
    const getShapeStyle = (overrides: CSSProperties = {}): CSSProperties => ({
      backgroundColor: baseStyle.backgroundColor,
      background: baseStyle.background,
      borderColor: baseStyle.borderColor,
      borderWidth: baseStyle.borderWidth,
      borderStyle: baseStyle.borderStyle as CSSProperties['borderStyle'],
      borderRadius: style?.borderRadius ?? 8,
      color: baseStyle.color,
      fontSize: baseStyle.fontSize,
      fontFamily: baseStyle.fontFamily,
      fontWeight: baseStyle.fontWeight,
      fontStyle: baseStyle.fontStyle as CSSProperties['fontStyle'],
      textDecoration: baseStyle.textDecoration,
      textAlign: baseStyle.textAlign,
      opacity: baseStyle.opacity,
      boxShadow: baseStyle.boxShadow,
      transform: baseStyle.transform,
      padding: baseStyle.padding,
      ...overrides,
    })

    // Get drop-shadow filter for SVG shapes
    const getDropShadowFilter = () => {
      if (!style?.shadowEnabled) return undefined
      return `drop-shadow(${style.shadowOffsetX || 4}px ${style.shadowOffsetY || 4}px ${style.shadowBlur || 10}px ${style.shadowColor || 'rgba(0,0,0,0.2)'})`
    }

    const props: ShapeRenderProps = {
      nodeId: id,
      label,
      style,
      baseStyle,
      data,
      locked: !!locked,
      isValidTarget,
      shapeClass,
      getShapeStyle,
      getDropShadowFilter,
      getVerticalAlignClass,
      getHorizontalAlignClass,
    }

    const renderer = getShapeRenderer(type)
    if (renderer) return renderer(props)

    return renderCloudIconOrDefault(props)
  }

  return (
    <NodeContextMenu nodeId={id} isLocked={locked} isGrouped={!!groupId}>
    <div
      ref={nodeRef}
      className={cn(
        'relative',
        // Add a subtle glow when being targeted for connection (only when hovered)
        isValidTarget && 'drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]',
        isRotating && 'cursor-grabbing',
        // Keyboard navigation focus indicator
        isFocused && 'keyboard-focused'
      )}
      style={{
        width: nodeWidth,
        height: nodeHeight,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Rotation Handle - Lucidchart style: at top-left corner outside selection */}
      {selected && !locked && !isJunction && (
        <div
          className="absolute nodrag"
          style={{ top: '-24px', left: '-24px', zIndex: 100 }}
        >
          <div
            className={cn(
              'w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center cursor-grab shadow-md hover:bg-gray-50 hover:border-blue-400 transition-colors',
              isRotating && 'bg-blue-50 border-blue-500 cursor-grabbing'
            )}
            onMouseDown={handleRotationMouseDown}
            title="Drag to rotate"
          >
            <RotateCw className="w-3.5 h-3.5 text-gray-600" />
          </div>
        </div>
      )}


      {/* NodeResizer - Lucidchart style: larger blue circles */}
      {/* Cloud icons and web-image icons maintain 1:1 aspect ratio when resizing */}
      <NodeResizer
        isVisible={selected && !locked}
        minWidth={minWidth}
        minHeight={minHeight}
        keepAspectRatio={isIconLike}
        handleClassName="nodrag"
        handleStyle={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: '#3b82f6',
          border: '2px solid #1d4ed8',
        }}
        lineStyle={{
          borderWidth: 2,
          borderColor: '#3b82f6',
          borderStyle: 'solid',
        }}
      />

      {/* Connection handles - render target handles FIRST, then source handles */}
      {/* This ensures source handles are on top for proper drag initiation */}
      {connectionPoints.map((point) => (
        <Handle
          key={`${point.id}-target`}
          id={point.id}
          type="target"
          position={point.position}
          style={point.style}
          className={cn(
            'custom-handle',
            !showHandles && '!opacity-0',
            showHandles && '!opacity-100',
            isValidTarget && 'valid-target'
          )}
          isConnectable={!locked}
        />
      ))}
      {connectionPoints.map((point) => (
        <Handle
          key={`${point.id}-source`}
          id={point.id}
          type="source"
          position={point.position}
          style={point.style}
          className={cn(
            'custom-handle',
            !showHandles && '!opacity-0',
            showHandles && '!opacity-100'
          )}
          isConnectable={!locked}
        />
      ))}

      {/* Shape content */}
      <div
        className="relative w-full h-full"
        onDoubleClick={handleDoubleClick}
      >
        {renderShape()}

        {/* Inline text editor overlay - only for non-icon shapes */}
        {isEditing && !isCloudIcon && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10">
            {type === 'sticky-note' ? (
              <textarea
                ref={textareaRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setEditText(label)
                    setEditingNodeId(null) // Clear editing state
                  }
                  // Allow Enter for new lines in sticky notes
                  if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault()
                    handleSave()
                  }
                }}
                className="w-[95%] h-[90%] px-3 py-2 text-left border border-primary rounded outline-none resize-none"
                style={{
                  fontSize: baseStyle.fontSize,
                  fontWeight: baseStyle.fontWeight,
                  color: style?.textColor || '#1f2937', // Dark for yellow sticky note background
                  backgroundColor: style?.backgroundColor || '#fef08a',
                  lineHeight: 1.4,
                }}
                placeholder="Type your note here..."
              />
            ) : (
              <input
                ref={inputRef}
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="w-[90%] px-2 py-1 border border-primary rounded outline-none bg-white/95"
                style={{
                  fontSize: baseStyle.fontSize,
                  fontWeight: baseStyle.fontWeight,
                  fontStyle: baseStyle.fontStyle as React.CSSProperties['fontStyle'],
                  textDecoration: baseStyle.textDecoration,
                  textAlign: baseStyle.textAlign,
                  color: baseStyle.color,
                }}
              />
            )}
          </div>
        )}

        {/* Status indicators */}
        <div className="absolute -top-2 -right-2 flex gap-1">
          {locked && (
            <div className="bg-amber-500 text-white rounded-full p-0.5" title="Locked">
              <Lock className="h-3 w-3" />
            </div>
          )}
          {groupId && (
            <div className="bg-blue-500 text-white rounded-full p-0.5" title="Grouped">
              <Group className="h-3 w-3" />
            </div>
          )}
        </div>
      </div>

      {/* Cloud icon label - positioned OUTSIDE the node bounding box (Lucidchart style) */}
      {isCloudIcon && (
        <div
          className="absolute left-1/2 -translate-x-1/2 text-center"
          style={{
            top: '100%',
            marginTop: '1px',
            zIndex: 10, // Above edge labels
          }}
        >
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="text-center border-b-2 border-blue-500 outline-none bg-transparent"
              style={{
                fontSize: baseStyle.fontSize,
                fontWeight: baseStyle.fontWeight,
                fontStyle: baseStyle.fontStyle as React.CSSProperties['fontStyle'],
                fontFamily: baseStyle.fontFamily,
                textDecoration: baseStyle.textDecoration,
                color: style?.textColor && style.textColor.trim() !== '' ? style.textColor : themeTextColor,
                width: `${Math.max(editText.length * 8, 40)}px`,
                minWidth: '40px',
              }}
            />
          ) : (
            <div
              className="cursor-text hover:bg-blue-50/50 dark:hover:bg-blue-900/30 px-1 py-0.5 rounded transition-colors"
              style={{
                fontSize: baseStyle.fontSize,
                fontFamily: baseStyle.fontFamily,
                fontWeight: baseStyle.fontWeight,
                fontStyle: baseStyle.fontStyle as React.CSSProperties['fontStyle'],
                textDecoration: baseStyle.textDecoration,
                color: style?.textColor && style.textColor.trim() !== '' ? style.textColor : themeTextColor,
                lineHeight: '1.3',
              }}
              onDoubleClick={handleDoubleClick}
            >
              {label || 'Double-click to edit'}
            </div>
          )}
        </div>
      )}
    </div>
    </NodeContextMenu>
  )
})
