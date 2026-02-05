import { cn } from '@/utils'
import { registerShape } from '../registry'
import type { ShapeRenderProps } from '../types'

function ServerShape({ label, locked, baseStyle, getShapeStyle }: ShapeRenderProps) {
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
}

function RouterShape({ label, shapeClass, baseStyle, getShapeStyle }: ShapeRenderProps) {
  return (
    <div
      className={cn(shapeClass, 'p-1')}
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
}

function SwitchShape({ label, shapeClass, baseStyle, getShapeStyle }: ShapeRenderProps) {
  return (
    <div
      className={cn(shapeClass, 'p-1')}
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
}

function FirewallShape({ label, shapeClass, baseStyle, getShapeStyle }: ShapeRenderProps) {
  return (
    <div
      className={cn(shapeClass, 'p-1')}
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
}

function UserShape({ label, shapeClass, baseStyle, getShapeStyle }: ShapeRenderProps) {
  return (
    <div
      className={cn(shapeClass, 'p-1')}
      style={getShapeStyle({ borderRadius: 4 })}
    >
      <div className="flex flex-col items-center">
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
}

function UsersShape({ label, shapeClass, baseStyle, getShapeStyle }: ShapeRenderProps) {
  return (
    <div
      className={cn(shapeClass, 'p-1')}
      style={getShapeStyle({ borderRadius: 4 })}
    >
      <div className="flex flex-col items-center">
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
}

function LaptopShape({ label, shapeClass, baseStyle, getShapeStyle }: ShapeRenderProps) {
  return (
    <div
      className={cn(shapeClass, 'p-1')}
      style={getShapeStyle({ borderRadius: 4 })}
    >
      <div className="flex flex-col items-center">
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
}

function MobileShape({ label, shapeClass, baseStyle, getShapeStyle }: ShapeRenderProps) {
  return (
    <div
      className={cn(shapeClass, 'p-1')}
      style={getShapeStyle({ borderRadius: 4 })}
    >
      <div className="flex flex-col items-center">
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
}

function InternetShape({ label, shapeClass, baseStyle, getShapeStyle }: ShapeRenderProps) {
  return (
    <div
      className={cn(shapeClass, 'p-1')}
      style={getShapeStyle({ borderRadius: '50%' })}
    >
      <div className="flex flex-col items-center">
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
}

// Register all network shapes
registerShape('server', ServerShape)
registerShape('router', RouterShape)
registerShape('switch', SwitchShape)
registerShape('firewall', FirewallShape)
registerShape('user', UserShape)
registerShape('users', UsersShape)
registerShape('laptop', LaptopShape)
registerShape('mobile', MobileShape)
registerShape('internet', InternetShape)
