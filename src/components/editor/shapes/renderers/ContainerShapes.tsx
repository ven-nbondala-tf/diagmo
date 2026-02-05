import { cn } from '@/utils'
import { registerShape } from '../registry'
import type { ShapeRenderProps } from '../types'
import { ChevronDown, ChevronRight } from 'lucide-react'

// Container Shape - A grouping shape with header and body
function ContainerShape({ label, locked, baseStyle, getShapeStyle, data }: ShapeRenderProps) {
  const isCollapsed = data.isCollapsed ?? false
  const headerColor = data.containerColor || '#e2e8f0'

  return (
    <div
      className={cn('w-full h-full flex flex-col', locked && 'opacity-75')}
      style={{
        ...getShapeStyle({ borderRadius: 8 }),
        minHeight: isCollapsed ? '32px' : undefined,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-t-lg border-b"
        style={{
          backgroundColor: headerColor,
          borderColor: baseStyle.borderColor,
        }}
      >
        <span className="text-muted-foreground">
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
        <span
          className="font-semibold text-sm flex-1"
          style={{ color: baseStyle.color, fontFamily: baseStyle.fontFamily }}
        >
          {label || 'Container'}
        </span>
      </div>

      {/* Body - only show if not collapsed */}
      {!isCollapsed && (
        <div
          className="flex-1 min-h-[100px] p-2"
          style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}
        >
          {/* Children will be rendered by React Flow */}
        </div>
      )}
    </div>
  )
}

// Vertical Swimlane - for process diagrams with phases
function SwimlaneShape({ label, locked, baseStyle, getShapeStyle, data }: ShapeRenderProps) {
  const headerColor = data.containerColor || '#dbeafe'

  return (
    <div
      className={cn('w-full h-full flex flex-col', locked && 'opacity-75')}
      style={getShapeStyle({ borderRadius: 4 })}
    >
      {/* Header */}
      <div
        className="flex items-center justify-center px-2 py-3 border-b"
        style={{
          backgroundColor: headerColor,
          borderColor: baseStyle.borderColor,
        }}
      >
        <span
          className="font-semibold text-sm writing-mode-vertical"
          style={{
            color: baseStyle.color,
            fontFamily: baseStyle.fontFamily,
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            transform: 'rotate(180deg)',
          }}
        >
          {label || 'Lane'}
        </span>
      </div>

      {/* Body */}
      <div
        className="flex-1 min-h-[200px]"
        style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
      />
    </div>
  )
}

// Horizontal Swimlane - header on top
function SwimlaneHorizontalShape({ label, locked, baseStyle, getShapeStyle, data }: ShapeRenderProps) {
  const headerColor = data.containerColor || '#dcfce7'

  return (
    <div
      className={cn('w-full h-full flex flex-col', locked && 'opacity-75')}
      style={getShapeStyle({ borderRadius: 4 })}
    >
      {/* Header */}
      <div
        className="flex items-center justify-center px-3 py-2 border-b"
        style={{
          backgroundColor: headerColor,
          borderColor: baseStyle.borderColor,
        }}
      >
        <span
          className="font-semibold text-sm"
          style={{ color: baseStyle.color, fontFamily: baseStyle.fontFamily }}
        >
          {label || 'Phase'}
        </span>
      </div>

      {/* Body */}
      <div
        className="flex-1 min-h-[150px]"
        style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
      />
    </div>
  )
}

// Register container shapes
registerShape('container', ContainerShape)
registerShape('swimlane', SwimlaneShape)
registerShape('swimlane-horizontal', SwimlaneHorizontalShape)
