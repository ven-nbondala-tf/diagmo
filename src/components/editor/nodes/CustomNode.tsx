import { memo, useState, useCallback, useRef, useEffect } from 'react'
import { Handle, Position, NodeResizer, useConnection, type NodeProps } from '@xyflow/react'
import type { DiagramNode } from '@/types'
import { cn } from '@/utils'
import { useEditorStore } from '@/stores/editorStore'
import { Lock, Group } from 'lucide-react'

type CustomNodeProps = NodeProps<DiagramNode>

// Connection point positions - 8 points like draw.io
const connectionPoints = [
  { id: 'top', position: Position.Top, style: { left: '50%', top: 0, transform: 'translate(-50%, -50%)' } },
  { id: 'top-right', position: Position.Right, style: { left: '100%', top: 0, transform: 'translate(-50%, -50%)' } },
  { id: 'right', position: Position.Right, style: { right: 0, top: '50%', transform: 'translate(50%, -50%)' } },
  { id: 'bottom-right', position: Position.Right, style: { right: 0, top: '100%', transform: 'translate(50%, -50%)' } },
  { id: 'bottom', position: Position.Bottom, style: { left: '50%', bottom: 0, transform: 'translate(-50%, 50%)' } },
  { id: 'bottom-left', position: Position.Left, style: { left: 0, bottom: 0, transform: 'translate(-50%, 50%)' } },
  { id: 'left', position: Position.Left, style: { left: 0, top: '50%', transform: 'translate(-50%, -50%)' } },
  { id: 'top-left', position: Position.Left, style: { left: 0, top: 0, transform: 'translate(-50%, -50%)' } },
]

export const CustomNode = memo(function CustomNode({ id, data, selected }: CustomNodeProps) {
  const { label, type, style, locked, groupId } = data
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(label)
  const [isHovered, setIsHovered] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const updateNode = useEditorStore((state) => state.updateNode)

  // Check if a connection is being made TO this node
  const connection = useConnection()
  const isTarget = connection.inProgress && connection.fromNode?.id !== id

  // Show handles when: selected, hovered, OR being connected to
  const showHandles = selected || isHovered || isTarget

  const minWidth = type === 'text' ? 40 : 60
  const minHeight = type === 'text' ? 20 : 40

  const baseStyle = {
    backgroundColor: style?.backgroundColor || '#ffffff',
    borderColor: style?.borderColor || '#9ca3af',
    borderWidth: style?.borderWidth || 1,
    borderStyle: style?.borderStyle || 'solid',
    borderRadius: style?.borderRadius || 8,
    color: style?.textColor || '#1f2937',
    fontSize: style?.fontSize || 14,
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
    // Rotation
    transform: style?.rotation ? `rotate(${style.rotation}deg)` : undefined,
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
      locked && 'opacity-75',
      // Highlight when being connected to
      isTarget && 'ring-2 ring-green-500 ring-offset-2'
    )

    // Helper function to build complete style object that respects user settings
    const getShapeStyle = (overrides: Record<string, unknown> = {}) => ({
      backgroundColor: baseStyle.backgroundColor,
      borderColor: baseStyle.borderColor,
      borderWidth: baseStyle.borderWidth,
      borderStyle: baseStyle.borderStyle, // Use user's choice, not hardcoded
      borderRadius: style?.borderRadius ?? 8,
      color: baseStyle.color,
      fontSize: baseStyle.fontSize,
      fontFamily: baseStyle.fontFamily,
      fontWeight: baseStyle.fontWeight,
      fontStyle: baseStyle.fontStyle,
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

    // SVG Shape component - renders polygon shapes with proper stroke (border) support
    const SVGShape = ({
      points,
      children,
      textOffset: _textOffset = { x: '50%', y: '55%' }
    }: {
      points: string
      children: React.ReactNode
      textOffset?: { x: string; y: string }
    }) => {
      void _textOffset // Reserved for future use
      // Convert border style to SVG stroke-dasharray
      const getStrokeDasharray = () => {
        switch (style?.borderStyle) {
          case 'dashed': return '8,4'
          case 'dotted': return '2,2'
          case 'none': return undefined
          default: return undefined
        }
      }

      return (
        <div
          className="w-full h-full relative"
          style={{
            filter: getDropShadowFilter(),
            transform: style?.rotation ? `rotate(${style.rotation}deg)` : undefined,
          }}
        >
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <polygon
              points={points}
              fill={baseStyle.backgroundColor}
              fillOpacity={baseStyle.opacity}
              stroke={style?.borderStyle === 'none' ? 'none' : baseStyle.borderColor}
              strokeWidth={style?.borderStyle === 'none' ? 0 : (baseStyle.borderWidth || 1) * 1.5}
              strokeDasharray={getStrokeDasharray()}
              strokeLinejoin="round"
            />
          </svg>
          <div
            className={cn(
              'absolute inset-0 flex overflow-hidden',
              getVerticalAlignClass(),
              getHorizontalAlignClass(),
              locked && 'opacity-75'
            )}
            style={{
              color: baseStyle.color,
              fontSize: baseStyle.fontSize,
              fontFamily: baseStyle.fontFamily,
              fontWeight: baseStyle.fontWeight,
              fontStyle: baseStyle.fontStyle,
              textDecoration: baseStyle.textDecoration,
              padding: '8px',
            }}
          >
            {children}
          </div>
        </div>
      )
    }

    // SVG Path Shape component - for complex path shapes
    const SVGPathShape = ({
      path,
      children,
      viewBox = '0 0 100 100'
    }: {
      path: string
      children: React.ReactNode
      viewBox?: string
    }) => {
      const getStrokeDasharray = () => {
        switch (style?.borderStyle) {
          case 'dashed': return '8,4'
          case 'dotted': return '2,2'
          case 'none': return undefined
          default: return undefined
        }
      }

      return (
        <div
          className="w-full h-full relative"
          style={{
            filter: getDropShadowFilter(),
            transform: style?.rotation ? `rotate(${style.rotation}deg)` : undefined,
          }}
        >
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox={viewBox}
            preserveAspectRatio="none"
          >
            <path
              d={path}
              fill={baseStyle.backgroundColor}
              fillOpacity={baseStyle.opacity}
              stroke={style?.borderStyle === 'none' ? 'none' : baseStyle.borderColor}
              strokeWidth={style?.borderStyle === 'none' ? 0 : (baseStyle.borderWidth || 1) * 1.5}
              strokeDasharray={getStrokeDasharray()}
              strokeLinejoin="round"
            />
          </svg>
          <div
            className={cn(
              'absolute inset-0 flex overflow-hidden',
              getVerticalAlignClass(),
              getHorizontalAlignClass(),
              locked && 'opacity-75'
            )}
            style={{
              color: baseStyle.color,
              fontSize: baseStyle.fontSize,
              fontFamily: baseStyle.fontFamily,
              fontWeight: baseStyle.fontWeight,
              fontStyle: baseStyle.fontStyle,
              textDecoration: baseStyle.textDecoration,
              padding: '8px',
            }}
          >
            {children}
          </div>
        </div>
      )
    }

    switch (type) {
      // ===== BASIC SHAPES (no clip-path, can use box-shadow directly) =====

      case 'rectangle':
      case 'process':
        return (
          <div
            className={cn(shapeClass, 'px-4 py-2')}
            style={getShapeStyle()}
          >
            {label}
          </div>
        )

      case 'ellipse':
        return (
          <div
            className={cn(shapeClass, 'rounded-full px-4 py-2')}
            style={getShapeStyle({ borderRadius: '50%' })}
          >
            {label}
          </div>
        )

      case 'circle':
        return (
          <div
            className={cn(shapeClass, 'rounded-full px-2 py-2 aspect-square')}
            style={getShapeStyle({ borderRadius: '50%' })}
          >
            {label}
          </div>
        )

      case 'rounded-rectangle':
        return (
          <div
            className={cn(shapeClass, 'px-4 py-2')}
            style={getShapeStyle({ borderRadius: style?.borderRadius ?? 16 })}
          >
            {label}
          </div>
        )

      // ===== SVG POLYGON SHAPES (proper stroke/border support) =====

      case 'diamond':
      case 'decision':
        return (
          <SVGShape points="50,2 98,50 50,98 2,50">
            {label}
          </SVGShape>
        )

      case 'triangle':
        return (
          <SVGShape points="50,5 95,95 5,95">
            {label}
          </SVGShape>
        )

      case 'pentagon':
        return (
          <SVGShape points="50,5 97,38 80,95 20,95 3,38">
            {label}
          </SVGShape>
        )

      case 'hexagon':
      case 'preparation':
        return (
          <SVGShape points="25,5 75,5 98,50 75,95 25,95 2,50">
            {label}
          </SVGShape>
        )

      case 'octagon':
        return (
          <SVGShape points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30">
            {label}
          </SVGShape>
        )

      case 'star':
        return (
          <SVGShape points="50,5 61,35 95,35 68,55 79,90 50,70 21,90 32,55 5,35 39,35">
            {label}
          </SVGShape>
        )

      case 'arrow':
        return (
          <SVGShape points="5,25 60,25 60,5 95,50 60,95 60,75 5,75">
            {label}
          </SVGShape>
        )

      case 'double-arrow':
        return (
          <SVGShape points="5,50 20,10 20,30 80,30 80,10 95,50 80,90 80,70 20,70 20,90">
            {label}
          </SVGShape>
        )

      // ===== SPECIAL SHAPES (complex rendering) =====

      case 'cylinder':
      case 'database':
        return (
          <div
            className={cn(shapeClass, 'px-4 py-6')}
            style={getShapeStyle({ borderRadius: '10px 10px 50% 50% / 10px 10px 20px 20px' })}
          >
            {label}
          </div>
        )

      case 'parallelogram':
      case 'data':
        return (
          <div
            className="w-full h-full"
            style={{
              filter: getDropShadowFilter(),
            }}
          >
            <div
              className={cn(shapeClass, 'px-6 py-2')}
              style={{
                ...getShapeStyle({ boxShadow: 'none' }),
                transform: `skewX(-15deg)${style?.rotation ? ` rotate(${style.rotation}deg)` : ''}`,
                borderRadius: style?.borderRadius || 4,
              }}
            >
              <span style={{ transform: 'skewX(15deg)' }}>{label}</span>
            </div>
          </div>
        )

      case 'trapezoid':
        return (
          <SVGShape points="20,5 80,5 95,95 5,95">
            {label}
          </SVGShape>
        )

      case 'cloud':
        return (
          <div
            className={cn(shapeClass, 'px-4 py-2')}
            style={getShapeStyle({ borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%' })}
          >
            {label}
          </div>
        )

      case 'callout':
        return (
          <SVGPathShape path="M 5,5 L 95,5 L 95,70 L 30,70 L 15,95 L 22,70 L 5,70 Z">
            {label}
          </SVGPathShape>
        )

      case 'note':
      case 'uml-note':
        return (
          <SVGPathShape path="M 5,5 L 80,5 L 95,20 L 95,95 L 5,95 Z M 80,5 L 80,20 L 95,20">
            {label}
          </SVGPathShape>
        )

      // ===== FLOWCHART SHAPES =====

      case 'terminator':
        return (
          <div
            className={cn(shapeClass, 'rounded-full px-6 py-2')}
            style={getShapeStyle({ borderRadius: 9999 })}
          >
            {label}
          </div>
        )

      case 'document':
        return (
          <SVGPathShape path="M 5,5 L 95,5 L 95,80 Q 72,95 50,80 Q 28,65 5,80 Z">
            {label}
          </SVGPathShape>
        )

      case 'multi-document':
        return (
          <div
            className="relative w-full h-full"
            style={{ filter: getDropShadowFilter(), transform: baseStyle.transform }}
          >
            <div
              className={cn('absolute inset-0 translate-x-[8%] translate-y-[-8%]', locked && 'opacity-75')}
              style={getShapeStyle({ borderRadius: 4, boxShadow: 'none', transform: undefined })}
            />
            <div
              className={cn('absolute inset-0 translate-x-[4%] translate-y-[-4%]', locked && 'opacity-75')}
              style={getShapeStyle({ borderRadius: 4, boxShadow: 'none', transform: undefined })}
            />
            <div
              className={cn(shapeClass, 'absolute inset-0 px-4 py-2')}
              style={getShapeStyle({ borderRadius: 4, boxShadow: 'none', transform: undefined })}
            >
              {label}
            </div>
          </div>
        )

      case 'predefined-process':
        return (
          <div className="relative w-full h-full" style={{ transform: baseStyle.transform }}>
            <div
              className={cn(shapeClass, 'px-4 py-2')}
              style={getShapeStyle({ borderRadius: style?.borderRadius || 4, transform: undefined })}
            >
              {label}
            </div>
            <div
              className="absolute left-[10%] top-0 bottom-0 w-px"
              style={{ backgroundColor: baseStyle.borderColor }}
            />
            <div
              className="absolute right-[10%] top-0 bottom-0 w-px"
              style={{ backgroundColor: baseStyle.borderColor }}
            />
          </div>
        )

      case 'manual-input':
        return (
          <SVGShape points="5,20 95,5 95,95 5,95">
            {label}
          </SVGShape>
        )

      case 'delay':
        return (
          <div
            className={cn(shapeClass, 'px-4 py-2')}
            style={getShapeStyle({ borderRadius: '0 50% 50% 0' })}
          >
            {label}
          </div>
        )

      case 'merge':
        return (
          <SVGShape points="5,5 95,5 50,95">
            {label}
          </SVGShape>
        )

      case 'or':
        return (
          <div className="relative w-full h-full" style={{ transform: baseStyle.transform }}>
            <div
              className={cn(shapeClass, 'rounded-full')}
              style={getShapeStyle({ borderRadius: '50%', transform: undefined })}
            />
            <div
              className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
              style={{ backgroundColor: baseStyle.borderColor }}
            />
            <div
              className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2"
              style={{ backgroundColor: baseStyle.borderColor }}
            />
            <div className="absolute inset-0 flex items-center justify-center" style={{ color: baseStyle.color, fontFamily: baseStyle.fontFamily }}>
              {label}
            </div>
          </div>
        )

      case 'summing-junction':
        return (
          <div className="relative w-full h-full" style={{ transform: baseStyle.transform }}>
            <div
              className={cn(shapeClass, 'rounded-full')}
              style={getShapeStyle({ borderRadius: '50%', transform: undefined })}
            />
            <div
              className="absolute left-1/2 top-[15%] bottom-[15%] w-px -translate-x-1/2 rotate-45 origin-center"
              style={{ backgroundColor: baseStyle.borderColor }}
            />
            <div
              className="absolute left-1/2 top-[15%] bottom-[15%] w-px -translate-x-1/2 -rotate-45 origin-center"
              style={{ backgroundColor: baseStyle.borderColor }}
            />
            <div className="absolute inset-0 flex items-center justify-center" style={{ color: baseStyle.color, fontFamily: baseStyle.fontFamily }}>
              {label}
            </div>
          </div>
        )

      // ===== UML SHAPES =====

      case 'uml-class':
        return (
          <div
            className={cn('w-full h-full flex flex-col', locked && 'opacity-75')}
            style={getShapeStyle({ borderRadius: 4 })}
          >
            <div
              className="border-b px-2 py-1 font-bold text-center"
              style={{ borderColor: baseStyle.borderColor, color: baseStyle.color, fontFamily: baseStyle.fontFamily }}
            >
              {label || 'ClassName'}
            </div>
            <div
              className="flex-1 border-b px-2 py-1 text-xs text-left"
              style={{ borderColor: baseStyle.borderColor, color: baseStyle.color, fontFamily: baseStyle.fontFamily }}
            >
              <div>+ attribute: Type</div>
              <div>- privateAttr: Type</div>
            </div>
            <div
              className="flex-1 px-2 py-1 text-xs text-left"
              style={{ color: baseStyle.color, fontFamily: baseStyle.fontFamily }}
            >
              <div>+ method(): void</div>
              <div>- privateMethod()</div>
            </div>
          </div>
        )

      case 'uml-interface':
        return (
          <div
            className={cn('w-full h-full flex flex-col', locked && 'opacity-75')}
            style={getShapeStyle({ borderRadius: 4 })}
          >
            <div
              className="border-b px-2 py-1 text-center text-xs italic"
              style={{ borderColor: baseStyle.borderColor, color: baseStyle.color, fontFamily: baseStyle.fontFamily }}
            >
              «interface»
            </div>
            <div
              className="border-b px-2 py-1 font-bold text-center"
              style={{ borderColor: baseStyle.borderColor, color: baseStyle.color, fontFamily: baseStyle.fontFamily }}
            >
              {label}
            </div>
            <div
              className="flex-1 px-2 py-1 text-xs"
              style={{ color: baseStyle.color, fontFamily: baseStyle.fontFamily }}
            >
              + method(): void
            </div>
          </div>
        )

      case 'uml-actor':
        return (
          <div
            className={cn('w-full h-full flex flex-col items-center justify-center', locked && 'opacity-75')}
            style={{ transform: baseStyle.transform }}
          >
            <div className="flex flex-col items-center">
              <div
                className="w-6 h-6 rounded-full mb-1"
                style={{ backgroundColor: baseStyle.backgroundColor, border: `${baseStyle.borderWidth}px ${baseStyle.borderStyle} ${baseStyle.borderColor}` }}
              />
              <div
                className="w-px h-6"
                style={{ backgroundColor: baseStyle.borderColor }}
              />
              <div className="flex">
                <div
                  className="w-6 h-px -rotate-45 origin-right"
                  style={{ backgroundColor: baseStyle.borderColor }}
                />
                <div
                  className="w-6 h-px rotate-45 origin-left"
                  style={{ backgroundColor: baseStyle.borderColor }}
                />
              </div>
              <div className="flex -mt-1">
                <div
                  className="w-4 h-px -rotate-45 origin-right translate-y-2"
                  style={{ backgroundColor: baseStyle.borderColor }}
                />
                <div
                  className="w-4 h-px rotate-45 origin-left translate-y-2"
                  style={{ backgroundColor: baseStyle.borderColor }}
                />
              </div>
            </div>
            <div className="mt-2 text-xs" style={{ color: baseStyle.color, fontFamily: baseStyle.fontFamily }}>
              {label}
            </div>
          </div>
        )

      case 'uml-usecase':
        return (
          <div
            className={cn(shapeClass, 'rounded-full px-4 py-2')}
            style={getShapeStyle({ borderRadius: '50%' })}
          >
            {label}
          </div>
        )

      case 'uml-component':
        return (
          <div className="relative w-full h-full" style={{ transform: baseStyle.transform }}>
            <div
              className={cn(shapeClass, 'px-4 py-2')}
              style={getShapeStyle({ borderRadius: 4, transform: undefined })}
            >
              {label}
            </div>
            <div
              className="absolute -left-2 top-[20%] w-4 h-3"
              style={{ backgroundColor: baseStyle.backgroundColor, border: `${baseStyle.borderWidth}px ${baseStyle.borderStyle} ${baseStyle.borderColor}` }}
            />
            <div
              className="absolute -left-2 top-[50%] w-4 h-3"
              style={{ backgroundColor: baseStyle.backgroundColor, border: `${baseStyle.borderWidth}px ${baseStyle.borderStyle} ${baseStyle.borderColor}` }}
            />
          </div>
        )

      case 'uml-package':
        return (
          <div className={cn('w-full h-full flex flex-col', locked && 'opacity-75')} style={{ transform: baseStyle.transform }}>
            <div
              className="w-1/3 px-2 py-0.5 text-xs rounded-t"
              style={{ ...getShapeStyle({ transform: undefined }), borderBottom: 'none' }}
            >
              pkg
            </div>
            <div
              className="flex-1 px-4 py-2 flex items-center justify-center"
              style={{ ...getShapeStyle({ borderRadius: '0 4px 4px 4px', transform: undefined }) }}
            >
              {label}
            </div>
          </div>
        )

      case 'uml-state':
        return (
          <div
            className={cn(shapeClass, 'px-4 py-2')}
            style={getShapeStyle({ borderRadius: 16 })}
          >
            {label}
          </div>
        )

      // ===== NETWORK SHAPES (CSS-based icons) =====

      case 'server':
        return (
          <div
            className={cn('w-full h-full flex flex-col', locked && 'opacity-75')}
            style={getShapeStyle({ borderRadius: 4 })}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn('flex-1 flex items-center px-2', i < 2 && 'border-b')}
                style={{ borderColor: baseStyle.borderColor }}
              >
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                </div>
                {i === 1 && <span className="ml-auto text-xs" style={{ color: baseStyle.color, fontFamily: baseStyle.fontFamily }}>{label}</span>}
              </div>
            ))}
          </div>
        )

      case 'router':
        return (
          <div
            className={cn(shapeClass, 'px-2 py-2')}
            style={getShapeStyle({ borderRadius: 8 })}
          >
            <div className="flex flex-col items-center">
              <div className="flex gap-1 mb-1">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="w-1 h-3 rounded-full" style={{ backgroundColor: baseStyle.borderColor }} />
                ))}
              </div>
              <div className="w-full h-4 rounded" style={{ backgroundColor: baseStyle.borderColor, opacity: 0.3 }} />
              <span className="text-xs mt-1" style={{ color: baseStyle.color, fontFamily: baseStyle.fontFamily }}>{label}</span>
            </div>
          </div>
        )

      case 'switch':
        return (
          <div
            className={cn(shapeClass, 'px-4 py-2')}
            style={getShapeStyle({ borderRadius: 8 })}
          >
            <div className="flex flex-col items-center">
              <div className="flex gap-1 mb-1">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-sm bg-green-500" />
                ))}
              </div>
              <span className="text-xs" style={{ color: baseStyle.color, fontFamily: baseStyle.fontFamily }}>{label}</span>
            </div>
          </div>
        )

      case 'firewall':
        return (
          <div
            className={cn(shapeClass, 'px-2 py-2')}
            style={getShapeStyle({ borderRadius: 4, borderColor: '#dc2626' })}
          >
            <div className="flex flex-col items-center">
              <div className="grid grid-cols-3 gap-0.5 mb-1">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-2 h-2" style={{ backgroundColor: i % 2 === 0 ? '#dc2626' : 'transparent' }} />
                ))}
              </div>
              <span className="text-xs" style={{ color: baseStyle.color, fontFamily: baseStyle.fontFamily }}>{label}</span>
            </div>
          </div>
        )

      case 'load-balancer':
        return (
          <SVGShape points="5,50 25,5 75,5 95,50 75,95 25,95">
            {label}
          </SVGShape>
        )

      case 'user':
        return (
          <div
            className={cn(shapeClass, 'px-2 py-2')}
            style={getShapeStyle({ borderRadius: 4 })}
          >
            <div className="flex flex-col items-center">
              {/* CSS User Icon */}
              <div className="relative w-6 h-6 mb-1">
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
                  style={{ backgroundColor: baseStyle.borderColor }}
                />
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-3 rounded-t-full"
                  style={{ backgroundColor: baseStyle.borderColor }}
                />
              </div>
              <span className="text-xs" style={{ color: baseStyle.color, fontFamily: baseStyle.fontFamily }}>{label}</span>
            </div>
          </div>
        )

      case 'users':
        return (
          <div
            className={cn(shapeClass, 'px-2 py-2')}
            style={getShapeStyle({ borderRadius: 4 })}
          >
            <div className="flex flex-col items-center">
              {/* CSS Users Icon */}
              <div className="relative w-8 h-6 mb-1">
                <div
                  className="absolute top-0 left-2 w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: baseStyle.borderColor }}
                />
                <div
                  className="absolute bottom-0 left-1 w-4 h-2.5 rounded-t-full"
                  style={{ backgroundColor: baseStyle.borderColor }}
                />
                <div
                  className="absolute top-0 right-1 w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: baseStyle.borderColor, opacity: 0.6 }}
                />
                <div
                  className="absolute bottom-0 right-0 w-4 h-2.5 rounded-t-full"
                  style={{ backgroundColor: baseStyle.borderColor, opacity: 0.6 }}
                />
              </div>
              <span className="text-xs" style={{ color: baseStyle.color, fontFamily: baseStyle.fontFamily }}>{label}</span>
            </div>
          </div>
        )

      case 'laptop':
        return (
          <div
            className={cn(shapeClass, 'px-2 py-2')}
            style={getShapeStyle({ borderRadius: 4 })}
          >
            <div className="flex flex-col items-center">
              {/* CSS Laptop Icon */}
              <div className="relative w-8 h-5 mb-1">
                <div
                  className="absolute top-0 left-0.5 right-0.5 h-4 rounded-t"
                  style={{ border: `1.5px solid ${baseStyle.borderColor}`, backgroundColor: baseStyle.backgroundColor }}
                />
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 rounded-b"
                  style={{ backgroundColor: baseStyle.borderColor }}
                />
              </div>
              <span className="text-xs" style={{ color: baseStyle.color, fontFamily: baseStyle.fontFamily }}>{label}</span>
            </div>
          </div>
        )

      case 'mobile':
        return (
          <div
            className={cn(shapeClass, 'px-2 py-2')}
            style={getShapeStyle({ borderRadius: 4 })}
          >
            <div className="flex flex-col items-center">
              {/* CSS Mobile Icon */}
              <div
                className="relative w-4 h-6 rounded mb-1"
                style={{ border: `1.5px solid ${baseStyle.borderColor}`, backgroundColor: baseStyle.backgroundColor }}
              >
                <div
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-2 h-0.5 rounded-full"
                  style={{ backgroundColor: baseStyle.borderColor }}
                />
              </div>
              <span className="text-xs" style={{ color: baseStyle.color, fontFamily: baseStyle.fontFamily }}>{label}</span>
            </div>
          </div>
        )

      case 'internet':
        return (
          <div
            className={cn(shapeClass, 'px-2 py-2')}
            style={getShapeStyle({ borderRadius: '50%' })}
          >
            <div className="flex flex-col items-center">
              {/* CSS Globe Icon */}
              <div
                className="relative w-6 h-6 rounded-full mb-1 overflow-hidden"
                style={{ border: `1.5px solid ${baseStyle.borderColor}`, backgroundColor: baseStyle.backgroundColor }}
              >
                <div className="absolute top-1/2 left-0 right-0 h-px" style={{ backgroundColor: baseStyle.borderColor }} />
                <div className="absolute top-0 bottom-0 left-1/2 w-px" style={{ backgroundColor: baseStyle.borderColor }} />
                <div
                  className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-3 rounded-full"
                  style={{ border: `1px solid ${baseStyle.borderColor}` }}
                />
              </div>
              <span className="text-xs" style={{ color: baseStyle.color, fontFamily: baseStyle.fontFamily }}>{label}</span>
            </div>
          </div>
        )

      // ===== CLOUD PROVIDER SHAPES =====

      case 'aws-ec2':
      case 'aws-s3':
      case 'aws-lambda':
      case 'aws-rds':
      case 'azure-vm':
      case 'azure-storage':
      case 'azure-functions':
      case 'gcp-compute':
      case 'gcp-storage':
      case 'gcp-functions':
        return (
          <div
            className={cn(shapeClass, 'px-3 py-2')}
            style={getShapeStyle({ borderRadius: 8 })}
          >
            <div className="flex flex-col items-center">
              {/* CSS Cloud Icon */}
              <div className="relative w-8 h-5 mb-1">
                <div
                  className="absolute bottom-0 left-0 right-0 h-3 rounded-b-lg rounded-t"
                  style={{ backgroundColor: baseStyle.borderColor, opacity: 0.3 }}
                />
                <div
                  className="absolute top-0 left-2 w-4 h-4 rounded-full"
                  style={{ backgroundColor: baseStyle.borderColor, opacity: 0.3 }}
                />
                <div
                  className="absolute top-1 right-1 w-3 h-3 rounded-full"
                  style={{ backgroundColor: baseStyle.borderColor, opacity: 0.3 }}
                />
              </div>
              <span className="text-xs font-medium" style={{ color: baseStyle.color, fontFamily: baseStyle.fontFamily }}>{label}</span>
            </div>
          </div>
        )

      // ===== TEXT SHAPE =====

      case 'text':
        return (
          <div
            className={cn(shapeClass, 'px-2 py-1')}
            style={{
              color: baseStyle.color,
              fontSize: baseStyle.fontSize,
              fontWeight: baseStyle.fontWeight,
              fontStyle: baseStyle.fontStyle,
              textDecoration: baseStyle.textDecoration,
              textAlign: baseStyle.textAlign,
              fontFamily: baseStyle.fontFamily,
              transform: baseStyle.transform,
            }}
          >
            {label}
          </div>
        )

      // ===== DEFAULT SHAPE =====

      default:
        return (
          <div
            className={cn(shapeClass, 'px-4 py-2')}
            style={getShapeStyle()}
          >
            {label}
          </div>
        )
    }
  }

  return (
    <div
      className={cn(
        'w-full h-full relative',
        // Add a subtle glow when being targeted for connection
        isTarget && 'drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* NodeResizer - 8 handles (4 corners + 4 edges) */}
      <NodeResizer
        isVisible={selected && !locked}
        minWidth={minWidth}
        minHeight={minHeight}
        keepAspectRatio={false}
        handleClassName="nodrag"
        handleStyle={{
          width: 8,
          height: 8,
          borderRadius: 2,
          backgroundColor: 'white',
          border: '1px solid #3b82f6',
        }}
        lineStyle={{
          borderWidth: 1,
          borderColor: '#3b82f6',
          borderStyle: 'dashed',
        }}
      />

      {/* Connection Points - 8 points like draw.io */}
      {/* These are BOTH source AND target - bidirectional */}
      {connectionPoints.map((point) => (
        <Handle
          key={point.id}
          id={point.id}
          type="source"
          position={point.position}
          className={cn(
            'transition-all duration-150 !absolute',
            // Hidden by default
            !showHandles && 'opacity-0 scale-0',
            // Visible on hover/select
            showHandles && 'opacity-100 scale-100',
            // Green glow when being targeted
            isTarget && '!bg-green-500 ring-2 ring-green-300'
          )}
          style={{
            width: showHandles ? 12 : 6,
            height: showHandles ? 12 : 6,
            backgroundColor: isTarget ? '#22c55e' : '#3b82f6',
            border: '2px solid white',
            borderRadius: '50%',
            cursor: 'crosshair',
            ...point.style,
          }}
          isConnectable={!locked}
        />
      ))}

      {/* Invisible target handles that cover entire edges for easy connection */}
      <Handle
        type="target"
        id="top-target"
        position={Position.Top}
        className="!w-full !h-3 !rounded-none !border-none !top-0 !left-0 !transform-none"
        style={{
          opacity: 0,
          cursor: 'crosshair',
          pointerEvents: 'all',
        }}
      />
      <Handle
        type="target"
        id="right-target"
        position={Position.Right}
        className="!w-3 !h-full !rounded-none !border-none !right-0 !top-0 !transform-none"
        style={{
          opacity: 0,
          cursor: 'crosshair',
          pointerEvents: 'all',
        }}
      />
      <Handle
        type="target"
        id="bottom-target"
        position={Position.Bottom}
        className="!w-full !h-3 !rounded-none !border-none !bottom-0 !left-0 !transform-none"
        style={{
          opacity: 0,
          cursor: 'crosshair',
          pointerEvents: 'all',
        }}
      />
      <Handle
        type="target"
        id="left-target"
        position={Position.Left}
        className="!w-3 !h-full !rounded-none !border-none !left-0 !top-0 !transform-none"
        style={{
          opacity: 0,
          cursor: 'crosshair',
          pointerEvents: 'all',
        }}
      />

      {/* Shape content */}
      <div
        className="relative w-full h-full"
        onDoubleClick={handleDoubleClick}
      >
        {renderShape()}

        {/* Inline text editor overlay */}
        {isEditing && (
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
    </div>
  )
})
