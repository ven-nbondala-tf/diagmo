import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { DiagramNode } from '@/types'
import { cn } from '@/utils'

type CustomNodeProps = NodeProps<DiagramNode>

export const CustomNode = memo(function CustomNode({ data, selected }: CustomNodeProps) {
  const { label, type, style } = data

  const baseStyle = {
    backgroundColor: style?.backgroundColor || '#ffffff',
    borderColor: style?.borderColor || '#374151',
    borderWidth: style?.borderWidth || 2,
    color: style?.textColor || '#1f2937',
    fontSize: style?.fontSize || 14,
    fontWeight: style?.fontWeight || 'normal',
  }

  const renderShape = () => {
    switch (type) {
      case 'ellipse':
        return (
          <div
            className={cn(
              'min-w-[120px] min-h-[80px] rounded-full flex items-center justify-center px-4 py-2',
              selected && 'ring-2 ring-primary ring-offset-2'
            )}
            style={{
              ...baseStyle,
              borderStyle: 'solid',
            }}
          >
            {label}
          </div>
        )

      case 'diamond':
        return (
          <div className="relative min-w-[100px] min-h-[100px]">
            <div
              className={cn(
                'absolute inset-0 rotate-45 flex items-center justify-center',
                selected && 'ring-2 ring-primary ring-offset-2'
              )}
              style={{
                ...baseStyle,
                borderStyle: 'solid',
                borderRadius: style?.borderRadius || 4,
              }}
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
            className={cn(
              'min-w-[100px] min-h-[80px] flex items-center justify-center',
              selected && 'ring-2 ring-primary ring-offset-2'
            )}
            style={{
              ...baseStyle,
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              borderStyle: 'solid',
            }}
          >
            <span className="mt-4">{label}</span>
          </div>
        )

      case 'hexagon':
        return (
          <div
            className={cn(
              'min-w-[120px] min-h-[80px] flex items-center justify-center px-4 py-2',
              selected && 'ring-2 ring-primary ring-offset-2'
            )}
            style={{
              ...baseStyle,
              clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
              borderStyle: 'solid',
            }}
          >
            {label}
          </div>
        )

      case 'cylinder':
        return (
          <div
            className={cn(
              'min-w-[100px] min-h-[100px] flex items-center justify-center px-4 py-6',
              selected && 'ring-2 ring-primary ring-offset-2'
            )}
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
        return (
          <div
            className={cn(
              'min-w-[120px] min-h-[60px] flex items-center justify-center px-6 py-2',
              selected && 'ring-2 ring-primary ring-offset-2'
            )}
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

      case 'cloud':
        return (
          <div
            className={cn(
              'min-w-[140px] min-h-[90px] flex items-center justify-center px-4 py-2',
              selected && 'ring-2 ring-primary ring-offset-2'
            )}
            style={{
              ...baseStyle,
              borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
              borderStyle: 'solid',
            }}
          >
            {label}
          </div>
        )

      case 'terminator':
        return (
          <div
            className={cn(
              'min-w-[120px] min-h-[50px] rounded-full flex items-center justify-center px-6 py-2',
              selected && 'ring-2 ring-primary ring-offset-2'
            )}
            style={{
              ...baseStyle,
              borderStyle: 'solid',
            }}
          >
            {label}
          </div>
        )

      case 'data':
        return (
          <div
            className={cn(
              'min-w-[120px] min-h-[60px] flex items-center justify-center px-6 py-2',
              selected && 'ring-2 ring-primary ring-offset-2'
            )}
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

      case 'document':
        return (
          <div
            className={cn(
              'min-w-[120px] min-h-[80px] flex items-center justify-center px-4 py-2',
              selected && 'ring-2 ring-primary ring-offset-2'
            )}
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

      case 'text':
        return (
          <div
            className={cn(
              'min-w-[80px] min-h-[40px] flex items-center justify-center px-2 py-1',
              selected && 'ring-2 ring-primary ring-offset-2'
            )}
            style={{
              color: baseStyle.color,
              fontSize: baseStyle.fontSize,
              fontWeight: baseStyle.fontWeight,
            }}
          >
            {label}
          </div>
        )

      case 'rectangle':
      case 'process':
      case 'decision':
      case 'predefined-process':
      case 'manual-input':
      case 'preparation':
      case 'delay':
      default:
        return (
          <div
            className={cn(
              'min-w-[120px] min-h-[60px] flex items-center justify-center px-4 py-2',
              selected && 'ring-2 ring-primary ring-offset-2'
            )}
            style={{
              ...baseStyle,
              borderStyle: 'solid',
              borderRadius: style?.borderRadius || 8,
            }}
          >
            {label}
          </div>
        )
    }
  }

  return (
    <>
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
      {renderShape()}
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
