import { memo, useState, useCallback, useRef, useEffect } from 'react'
import { Handle, Position, NodeResizer, type NodeProps } from '@xyflow/react'
import type { DiagramNode } from '@/types'
import { cn } from '@/utils'
import { useEditorStore } from '@/stores/editorStore'
import { Lock, Group } from 'lucide-react'

type CustomNodeProps = NodeProps<DiagramNode>

export const CustomNode = memo(function CustomNode({ id, data, selected }: CustomNodeProps) {
  const { label, type, style, locked, groupId } = data
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(label)
  const inputRef = useRef<HTMLInputElement>(null)
  const updateNode = useEditorStore((state) => state.updateNode)

  const minWidth = type === 'text' ? 40 : 60
  const minHeight = type === 'text' ? 20 : 40

  const baseStyle = {
    backgroundColor: style?.backgroundColor || '#ffffff',
    borderColor: style?.borderColor || '#374151',
    borderWidth: style?.borderWidth || 2,
    color: style?.textColor || '#1f2937',
    fontSize: style?.fontSize || 14,
    fontWeight: style?.fontWeight || 'normal',
    fontStyle: style?.fontStyle || 'normal',
    textDecoration: style?.textDecoration || 'none',
    textAlign: (style?.textAlign || 'center') as 'left' | 'center' | 'right',
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
      'w-full h-full flex items-center justify-center text-center overflow-hidden',
      locked && 'opacity-75'
    )

    switch (type) {
      // Basic shapes
      case 'ellipse':
        return (
          <div
            className={cn(shapeClass, 'rounded-full px-4 py-2')}
            style={{ ...baseStyle, borderStyle: 'solid' }}
          >
            {label}
          </div>
        )

      case 'circle':
        return (
          <div
            className={cn(shapeClass, 'rounded-full px-2 py-2 aspect-square')}
            style={{ ...baseStyle, borderStyle: 'solid' }}
          >
            {label}
          </div>
        )

      case 'rounded-rectangle':
        return (
          <div
            className={cn(shapeClass, 'px-4 py-2')}
            style={{ ...baseStyle, borderStyle: 'solid', borderRadius: 16 }}
          >
            {label}
          </div>
        )

      case 'diamond':
      case 'decision':
        return (
          <div className="relative w-full h-full">
            <div
              className={cn('absolute inset-[10%] rotate-45', locked && 'opacity-75')}
              style={{ ...baseStyle, borderStyle: 'solid', borderRadius: style?.borderRadius || 4 }}
            />
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ color: baseStyle.color, fontSize: baseStyle.fontSize }}
            >
              {label}
            </div>
          </div>
        )

      case 'triangle':
        return (
          <div
            className={shapeClass}
            style={{ ...baseStyle, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', borderStyle: 'solid' }}
          >
            <span className="mt-[30%]">{label}</span>
          </div>
        )

      case 'pentagon':
        return (
          <div
            className={cn(shapeClass, 'px-4 py-2')}
            style={{
              ...baseStyle,
              clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
              borderStyle: 'solid',
            }}
          >
            {label}
          </div>
        )

      case 'hexagon':
      case 'preparation':
        return (
          <div
            className={cn(shapeClass, 'px-4 py-2')}
            style={{
              ...baseStyle,
              clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
              borderStyle: 'solid',
            }}
          >
            {label}
          </div>
        )

      case 'octagon':
        return (
          <div
            className={cn(shapeClass, 'px-4 py-2')}
            style={{
              ...baseStyle,
              clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
              borderStyle: 'solid',
            }}
          >
            {label}
          </div>
        )

      case 'star':
        return (
          <div
            className={cn(shapeClass, 'px-2 py-2')}
            style={{
              ...baseStyle,
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
              borderStyle: 'solid',
            }}
          >
            {label}
          </div>
        )

      case 'arrow':
        return (
          <div
            className={cn(shapeClass, 'px-4 py-2')}
            style={{
              ...baseStyle,
              clipPath: 'polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)',
              borderStyle: 'solid',
            }}
          >
            {label}
          </div>
        )

      case 'double-arrow':
        return (
          <div
            className={cn(shapeClass, 'px-6 py-2')}
            style={{
              ...baseStyle,
              clipPath: 'polygon(0% 50%, 15% 0%, 15% 25%, 85% 25%, 85% 0%, 100% 50%, 85% 100%, 85% 75%, 15% 75%, 15% 100%)',
              borderStyle: 'solid',
            }}
          >
            {label}
          </div>
        )

      case 'cylinder':
      case 'database':
        return (
          <div
            className={cn(shapeClass, 'px-4 py-6')}
            style={{
              ...baseStyle,
              borderRadius: '10px 10px 50% 50% / 10px 10px 20px 20px',
              borderStyle: 'solid',
            }}
          >
            {label}
          </div>
        )

      case 'parallelogram':
      case 'data':
        return (
          <div
            className={cn(shapeClass, 'px-6 py-2')}
            style={{
              ...baseStyle,
              transform: 'skewX(-15deg)',
              borderStyle: 'solid',
              borderRadius: style?.borderRadius || 4,
            }}
          >
            <span style={{ transform: 'skewX(15deg)' }}>{label}</span>
          </div>
        )

      case 'trapezoid':
        return (
          <div
            className={cn(shapeClass, 'px-4 py-2')}
            style={{
              ...baseStyle,
              clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
              borderStyle: 'solid',
            }}
          >
            {label}
          </div>
        )

      case 'cloud':
        return (
          <div
            className={cn(shapeClass, 'px-4 py-2')}
            style={{
              ...baseStyle,
              borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
              borderStyle: 'solid',
            }}
          >
            {label}
          </div>
        )

      case 'callout':
        return (
          <div
            className={cn(shapeClass, 'px-4 py-2')}
            style={{
              ...baseStyle,
              clipPath: 'polygon(0% 0%, 100% 0%, 100% 75%, 25% 75%, 10% 100%, 20% 75%, 0% 75%)',
              borderStyle: 'solid',
            }}
          >
            <span className="mb-[10%]">{label}</span>
          </div>
        )

      case 'note':
      case 'uml-note':
        return (
          <div
            className={cn(shapeClass, 'px-4 py-2')}
            style={{
              ...baseStyle,
              clipPath: 'polygon(0% 0%, 85% 0%, 100% 15%, 100% 100%, 0% 100%)',
              borderStyle: 'solid',
            }}
          >
            {label}
          </div>
        )

      // Flowchart shapes
      case 'terminator':
        return (
          <div
            className={cn(shapeClass, 'rounded-full px-6 py-2')}
            style={{ ...baseStyle, borderStyle: 'solid' }}
          >
            {label}
          </div>
        )

      case 'document':
        return (
          <div
            className={cn(shapeClass, 'px-4 py-2')}
            style={{
              ...baseStyle,
              borderRadius: '4px 4px 0 0',
              borderStyle: 'solid',
              clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 50% 100%, 0% 85%)',
            }}
          >
            {label}
          </div>
        )

      case 'multi-document':
        return (
          <div className="relative w-full h-full">
            <div
              className={cn('absolute inset-0 translate-x-[8%] translate-y-[-8%]', locked && 'opacity-75')}
              style={{ ...baseStyle, borderStyle: 'solid', borderRadius: 4 }}
            />
            <div
              className={cn('absolute inset-0 translate-x-[4%] translate-y-[-4%]', locked && 'opacity-75')}
              style={{ ...baseStyle, borderStyle: 'solid', borderRadius: 4 }}
            />
            <div
              className={cn(shapeClass, 'absolute inset-0 px-4 py-2')}
              style={{ ...baseStyle, borderStyle: 'solid', borderRadius: 4 }}
            >
              {label}
            </div>
          </div>
        )

      case 'predefined-process':
        return (
          <div className="relative w-full h-full">
            <div
              className={cn(shapeClass, 'px-4 py-2')}
              style={{ ...baseStyle, borderStyle: 'solid', borderRadius: style?.borderRadius || 4 }}
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
          <div
            className={cn(shapeClass, 'px-4 py-2')}
            style={{
              ...baseStyle,
              clipPath: 'polygon(0% 20%, 100% 0%, 100% 100%, 0% 100%)',
              borderStyle: 'solid',
            }}
          >
            <span className="mt-[10%]">{label}</span>
          </div>
        )

      case 'delay':
        return (
          <div
            className={cn(shapeClass, 'px-4 py-2')}
            style={{
              ...baseStyle,
              borderRadius: '0 50% 50% 0',
              borderStyle: 'solid',
            }}
          >
            {label}
          </div>
        )

      case 'merge':
        return (
          <div
            className={shapeClass}
            style={{
              ...baseStyle,
              clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)',
              borderStyle: 'solid',
            }}
          >
            <span className="mb-[20%]">{label}</span>
          </div>
        )

      case 'or':
        return (
          <div className="relative w-full h-full">
            <div
              className={cn(shapeClass, 'rounded-full')}
              style={{ ...baseStyle, borderStyle: 'solid' }}
            />
            <div
              className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
              style={{ backgroundColor: baseStyle.borderColor }}
            />
            <div
              className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2"
              style={{ backgroundColor: baseStyle.borderColor }}
            />
            <div className="absolute inset-0 flex items-center justify-center" style={{ color: baseStyle.color }}>
              {label}
            </div>
          </div>
        )

      case 'summing-junction':
        return (
          <div className="relative w-full h-full">
            <div
              className={cn(shapeClass, 'rounded-full')}
              style={{ ...baseStyle, borderStyle: 'solid' }}
            />
            <div
              className="absolute left-1/2 top-[15%] bottom-[15%] w-px -translate-x-1/2 rotate-45 origin-center"
              style={{ backgroundColor: baseStyle.borderColor }}
            />
            <div
              className="absolute left-1/2 top-[15%] bottom-[15%] w-px -translate-x-1/2 -rotate-45 origin-center"
              style={{ backgroundColor: baseStyle.borderColor }}
            />
            <div className="absolute inset-0 flex items-center justify-center" style={{ color: baseStyle.color }}>
              {label}
            </div>
          </div>
        )

      // UML shapes
      case 'uml-class':
        return (
          <div
            className={cn('w-full h-full flex flex-col', locked && 'opacity-75')}
            style={{ ...baseStyle, borderStyle: 'solid', borderRadius: 4 }}
          >
            <div className="border-b px-2 py-1 font-bold text-center" style={{ borderColor: baseStyle.borderColor }}>
              {label}
            </div>
            <div className="flex-1 border-b px-2 py-1 text-xs" style={{ borderColor: baseStyle.borderColor }}>
              + attribute: Type
            </div>
            <div className="flex-1 px-2 py-1 text-xs">
              + method(): void
            </div>
          </div>
        )

      case 'uml-interface':
        return (
          <div
            className={cn('w-full h-full flex flex-col', locked && 'opacity-75')}
            style={{ ...baseStyle, borderStyle: 'solid', borderRadius: 4 }}
          >
            <div className="border-b px-2 py-1 text-center text-xs italic" style={{ borderColor: baseStyle.borderColor }}>
              «interface»
            </div>
            <div className="border-b px-2 py-1 font-bold text-center" style={{ borderColor: baseStyle.borderColor }}>
              {label}
            </div>
            <div className="flex-1 px-2 py-1 text-xs">
              + method(): void
            </div>
          </div>
        )

      case 'uml-actor':
        return (
          <div className={cn('w-full h-full flex flex-col items-center justify-center', locked && 'opacity-75')}>
            <div className="flex flex-col items-center">
              <div
                className="w-6 h-6 rounded-full mb-1"
                style={{ backgroundColor: baseStyle.backgroundColor, border: `${baseStyle.borderWidth}px solid ${baseStyle.borderColor}` }}
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
            <div className="mt-2 text-xs" style={{ color: baseStyle.color }}>
              {label}
            </div>
          </div>
        )

      case 'uml-usecase':
        return (
          <div
            className={cn(shapeClass, 'rounded-full px-4 py-2')}
            style={{ ...baseStyle, borderStyle: 'solid' }}
          >
            {label}
          </div>
        )

      case 'uml-component':
        return (
          <div className="relative w-full h-full">
            <div
              className={cn(shapeClass, 'px-4 py-2')}
              style={{ ...baseStyle, borderStyle: 'solid', borderRadius: 4 }}
            >
              {label}
            </div>
            <div
              className="absolute -left-2 top-[20%] w-4 h-3"
              style={{ backgroundColor: baseStyle.backgroundColor, border: `${baseStyle.borderWidth}px solid ${baseStyle.borderColor}` }}
            />
            <div
              className="absolute -left-2 top-[50%] w-4 h-3"
              style={{ backgroundColor: baseStyle.backgroundColor, border: `${baseStyle.borderWidth}px solid ${baseStyle.borderColor}` }}
            />
          </div>
        )

      case 'uml-package':
        return (
          <div className={cn('w-full h-full flex flex-col', locked && 'opacity-75')}>
            <div
              className="w-1/3 px-2 py-0.5 text-xs rounded-t"
              style={{ ...baseStyle, borderStyle: 'solid', borderBottom: 'none' }}
            >
              pkg
            </div>
            <div
              className="flex-1 px-4 py-2 flex items-center justify-center"
              style={{ ...baseStyle, borderStyle: 'solid', borderRadius: '0 4px 4px 4px' }}
            >
              {label}
            </div>
          </div>
        )

      case 'uml-state':
        return (
          <div
            className={cn(shapeClass, 'px-4 py-2')}
            style={{ ...baseStyle, borderStyle: 'solid', borderRadius: 16 }}
          >
            {label}
          </div>
        )

      // Network shapes
      case 'server':
        return (
          <div
            className={cn('w-full h-full flex flex-col', locked && 'opacity-75')}
            style={{ ...baseStyle, borderStyle: 'solid', borderRadius: 4 }}
          >
            <div className="h-1/3 border-b flex items-center px-2" style={{ borderColor: baseStyle.borderColor }}>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              </div>
            </div>
            <div className="h-1/3 border-b flex items-center px-2" style={{ borderColor: baseStyle.borderColor }}>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              </div>
            </div>
            <div className="h-1/3 flex items-center justify-center text-xs">
              {label}
            </div>
          </div>
        )

      case 'router':
        return (
          <div
            className={cn(shapeClass, 'px-4 py-2')}
            style={{
              ...baseStyle,
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              borderStyle: 'solid',
            }}
          >
            {label}
          </div>
        )

      case 'switch':
        return (
          <div
            className={cn(shapeClass, 'px-4 py-2')}
            style={{ ...baseStyle, borderStyle: 'solid', borderRadius: 8 }}
          >
            <div className="flex flex-col items-center">
              <div className="flex gap-1 mb-1">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-sm bg-green-500" />
                ))}
              </div>
              <span className="text-xs">{label}</span>
            </div>
          </div>
        )

      case 'firewall':
        return (
          <div
            className={cn(shapeClass, 'px-2 py-2')}
            style={{ ...baseStyle, borderStyle: 'solid', borderRadius: 4, borderColor: '#dc2626' }}
          >
            <div className="flex flex-col items-center">
              <div className="text-red-600 text-lg mb-0.5">🛡️</div>
              <span className="text-xs">{label}</span>
            </div>
          </div>
        )

      case 'load-balancer':
        return (
          <div
            className={cn(shapeClass, 'px-4 py-2')}
            style={{
              ...baseStyle,
              clipPath: 'polygon(0% 50%, 25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%)',
              borderStyle: 'solid',
            }}
          >
            {label}
          </div>
        )

      case 'user':
        return (
          <div
            className={cn(shapeClass, 'px-2 py-2')}
            style={{ ...baseStyle, borderStyle: 'solid', borderRadius: 4 }}
          >
            <div className="flex flex-col items-center">
              <div className="text-lg mb-0.5">👤</div>
              <span className="text-xs">{label}</span>
            </div>
          </div>
        )

      case 'users':
        return (
          <div
            className={cn(shapeClass, 'px-2 py-2')}
            style={{ ...baseStyle, borderStyle: 'solid', borderRadius: 4 }}
          >
            <div className="flex flex-col items-center">
              <div className="text-lg mb-0.5">👥</div>
              <span className="text-xs">{label}</span>
            </div>
          </div>
        )

      case 'laptop':
        return (
          <div
            className={cn(shapeClass, 'px-2 py-2')}
            style={{ ...baseStyle, borderStyle: 'solid', borderRadius: 4 }}
          >
            <div className="flex flex-col items-center">
              <div className="text-lg mb-0.5">💻</div>
              <span className="text-xs">{label}</span>
            </div>
          </div>
        )

      case 'mobile':
        return (
          <div
            className={cn(shapeClass, 'px-2 py-2')}
            style={{ ...baseStyle, borderStyle: 'solid', borderRadius: 4 }}
          >
            <div className="flex flex-col items-center">
              <div className="text-lg mb-0.5">📱</div>
              <span className="text-xs">{label}</span>
            </div>
          </div>
        )

      case 'internet':
        return (
          <div
            className={cn(shapeClass, 'px-2 py-2')}
            style={{ ...baseStyle, borderStyle: 'solid', borderRadius: '50%' }}
          >
            <div className="flex flex-col items-center">
              <div className="text-lg mb-0.5">🌐</div>
              <span className="text-xs">{label}</span>
            </div>
          </div>
        )

      // Cloud providers - placeholder shapes
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
            style={{ ...baseStyle, borderStyle: 'solid', borderRadius: 8 }}
          >
            <div className="flex flex-col items-center">
              <div className="text-lg mb-0.5">☁️</div>
              <span className="text-xs font-medium">{label}</span>
            </div>
          </div>
        )

      // Text
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
            }}
          >
            {label}
          </div>
        )

      // Default rectangle
      case 'rectangle':
      case 'process':
      default:
        return (
          <div
            className={cn(shapeClass, 'px-4 py-2')}
            style={{ ...baseStyle, borderStyle: 'solid', borderRadius: style?.borderRadius || 8 }}
          >
            {label}
          </div>
        )
    }
  }

  return (
    <>
      {/* NodeResizer must be first child for proper resize handles */}
      <NodeResizer
        isVisible={selected && !locked}
        minWidth={minWidth}
        minHeight={minHeight}
        handleStyle={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: 'white',
          border: '2px solid #3b82f6',
        }}
        lineStyle={{
          borderWidth: 1,
          borderColor: '#3b82f6',
        }}
      />
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-primary !w-3 !h-3"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-primary !w-3 !h-3"
      />
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
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-primary !w-3 !h-3"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-primary !w-3 !h-3"
      />
    </>
  )
})
