import { cn } from '@/utils'
import { registerShape, registerShapes } from '../registry'
import type { ShapeRenderProps } from '../types'

function RectangleShape({ label, shapeClass, getShapeStyle }: ShapeRenderProps) {
  return (
    <div className={cn(shapeClass, 'p-1')} style={getShapeStyle()}>
      {label}
    </div>
  )
}

function EllipseShape({ label, shapeClass, getShapeStyle }: ShapeRenderProps) {
  return (
    <div
      className={cn(shapeClass, 'rounded-full p-1')}
      style={getShapeStyle({ borderRadius: '50%' })}
    >
      {label}
    </div>
  )
}

function CircleShape({ label, shapeClass, getShapeStyle }: ShapeRenderProps) {
  return (
    <div
      className={cn(shapeClass, 'rounded-full p-1 aspect-square')}
      style={getShapeStyle({ borderRadius: '50%' })}
    >
      {label}
    </div>
  )
}

function RoundedRectangleShape({ label, style, shapeClass, getShapeStyle }: ShapeRenderProps) {
  return (
    <div
      className={cn(shapeClass, 'p-1')}
      style={getShapeStyle({ borderRadius: style?.borderRadius ?? 16 })}
    >
      {label}
    </div>
  )
}

function CylinderShape({ label, shapeClass, getShapeStyle }: ShapeRenderProps) {
  return (
    <div
      className={cn(shapeClass, 'p-1')}
      style={getShapeStyle({ borderRadius: '10px 10px 50% 50% / 10px 10px 20px 20px' })}
    >
      {label}
    </div>
  )
}

function CloudShape({ label, shapeClass, getShapeStyle }: ShapeRenderProps) {
  return (
    <div
      className={cn(shapeClass, 'p-1')}
      style={getShapeStyle({ borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%' })}
    >
      {label}
    </div>
  )
}

function TerminatorShape({ label, shapeClass, getShapeStyle }: ShapeRenderProps) {
  return (
    <div
      className={cn(shapeClass, 'rounded-full p-1')}
      style={getShapeStyle({ borderRadius: 9999 })}
    >
      {label}
    </div>
  )
}

function DelayShape({ label, shapeClass, getShapeStyle }: ShapeRenderProps) {
  return (
    <div
      className={cn(shapeClass, 'p-1')}
      style={getShapeStyle({ borderRadius: '0 50% 50% 0' })}
    >
      {label}
    </div>
  )
}

// Register all basic shapes
registerShapes(['rectangle', 'process'], RectangleShape)
registerShape('ellipse', EllipseShape)
registerShape('circle', CircleShape)
registerShape('rounded-rectangle', RoundedRectangleShape)
registerShapes(['cylinder', 'database'], CylinderShape)
registerShape('cloud', CloudShape)
registerShape('terminator', TerminatorShape)
registerShape('delay', DelayShape)
