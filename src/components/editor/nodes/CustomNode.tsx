import { memo, useState, useCallback, useRef, useEffect, useMemo, type CSSProperties } from 'react'
import { Handle, Position, NodeResizer, useConnection, type NodeProps } from '@xyflow/react'
import type { DiagramNode, ShapeType } from '@/types'
import { cn } from '@/utils'
import { useEditorStore } from '@/stores/editorStore'
import { Lock, Group, RotateCw } from 'lucide-react'
import { getShapeRenderer, renderCloudIconOrDefault, type ShapeRenderProps } from '../shapes'
import { NodeContextMenu } from '../NodeContextMenu'

type CustomNodeProps = NodeProps<DiagramNode & { position: { x: number; y: number } }>

// Simple 4 cardinal connection points - React Flow handles positioning automatically
// We just specify the position (Top, Right, Bottom, Left) and React Flow places them correctly
const getShapeConnectionPoints = (_type: ShapeType) => {
  // All shapes use 4 cardinal points at the exact node boundary
  // React Flow automatically places handles at the correct edge positions
  return [
    { id: 'top', position: Position.Top },
    { id: 'right', position: Position.Right },
    { id: 'bottom', position: Position.Bottom },
    { id: 'left', position: Position.Left },
  ]
}

export const CustomNode = memo(function CustomNode({ id, data, selected, positionAbsoluteX, positionAbsoluteY }: CustomNodeProps) {
  const { label, type, style, locked, groupId } = data
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(label)
  const [isHovered, setIsHovered] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const nodeRef = useRef<HTMLDivElement>(null)
  const updateNode = useEditorStore((state) => state.updateNode)
  const updateNodeStyle = useEditorStore((state) => state.updateNodeStyle)

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

  // Show handles when: selected, hovered, OR being connected to
  const showHandles = selected || isHovered || connection.inProgress

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
  const isIconLike = isCloudIcon || isWebImageIcon
  const minWidth = type === 'text' ? 20 : isIconLike ? 24 : 20
  const minHeight = type === 'text' ? 15 : isIconLike ? 24 : 20

  // Default font size: 8 for cloud icons, 14 for other shapes
  const defaultFontSize = isCloudIcon ? 10 : 14

  const baseStyle = {
    backgroundColor: style?.backgroundColor || '#ffffff',
    borderColor: style?.borderColor || '#9ca3af',
    borderWidth: style?.borderWidth || 1,
    borderStyle: style?.borderStyle || 'solid',
    borderRadius: style?.borderRadius || 8,
    color: style?.textColor || '#1f2937',
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
    setIsEditing(true)
  }, [locked, label])

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // Handle saving the text
  const handleSave = useCallback(() => {
    if (editText.trim() !== label) {
      updateNode(id, { label: editText.trim() || label })
    }
    setIsEditing(false)
  }, [editText, label, id, updateNode])

  // Handle keyboard events
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      setEditText(label)
      setIsEditing(false)
    }
  }, [handleSave, label])

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
      ...overrides,
    })

    // Get drop-shadow filter for SVG shapes
    const getDropShadowFilter = () => {
      if (!style?.shadowEnabled) return undefined
      return `drop-shadow(${style.shadowOffsetX || 4}px ${style.shadowOffsetY || 4}px ${style.shadowBlur || 10}px ${style.shadowColor || 'rgba(0,0,0,0.2)'})`
    }

    const props: ShapeRenderProps = {
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
        'w-full h-full relative',
        // Add a subtle glow when being targeted for connection (only when hovered)
        isValidTarget && 'drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]',
        isRotating && 'cursor-grabbing'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Rotation Handle - Lucidchart style: circular rotate icon above the node */}
      {selected && !locked && (
        <div
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center nodrag"
          style={{ top: '-32px' }}
        >
          {/* Connecting line from rotation handle to node */}
          <div className="w-px h-3 bg-blue-400" />
          {/* Rotation handle */}
          <div
            className={cn(
              'w-6 h-6 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center cursor-grab shadow-sm hover:bg-blue-50 transition-colors',
              isRotating && 'bg-blue-100 cursor-grabbing'
            )}
            onMouseDown={handleRotationMouseDown}
            title="Drag to rotate"
          >
            <RotateCw className="w-3.5 h-3.5 text-blue-600" />
          </div>
        </div>
      )}

      {/* Position display - Lucidchart style: shows X, Y coordinates when selected */}
      {selected && (
        <div
          className="absolute left-1/2 -translate-x-1/2 text-xs text-blue-600 whitespace-nowrap pointer-events-none"
          style={{
            bottom: isIconLike ? '-40px' : '-20px',
            fontFamily: 'monospace',
          }}
        >
          X: {Math.round(positionAbsoluteX)} px, Y: {Math.round(positionAbsoluteY)} px
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

      {/* Connection handles - Lucidchart style */}
      {connectionPoints.map((point) => (
        <Handle
          key={point.id}
          id={point.id}
          type="source"
          position={point.position}
          className={cn(
            'custom-handle',
            !showHandles && '!opacity-0',
            showHandles && '!opacity-100',
            isValidTarget && 'valid-target'
          )}
          isConnectable={!locked}
          isConnectableStart={true}
          isConnectableEnd={true}
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
            <input
              ref={inputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="w-[90%] px-2 py-1 text-center border border-primary rounded outline-none"
              style={{
                fontSize: baseStyle.fontSize,
                fontWeight: baseStyle.fontWeight,
                color: baseStyle.color,
              }}
            />
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
                fontStyle: baseStyle.fontStyle,
                color: baseStyle.color,
                fontFamily: baseStyle.fontFamily,
                textDecoration: baseStyle.textDecoration,
                width: `${Math.max(editText.length * 8, 40)}px`,
                minWidth: '40px',
              }}
            />
          ) : (
            <div
              className="cursor-text hover:bg-blue-50 px-1 py-0.5 rounded transition-colors"
              style={{
                color: baseStyle.color,
                fontSize: baseStyle.fontSize,
                fontFamily: baseStyle.fontFamily,
                fontWeight: baseStyle.fontWeight,
                fontStyle: baseStyle.fontStyle,
                textDecoration: baseStyle.textDecoration,
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
