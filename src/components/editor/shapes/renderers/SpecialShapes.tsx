import { cn } from '@/utils'
import { SVGPathShape } from '../shared'
import { registerShape, registerShapes } from '../registry'
import type { ShapeRenderProps } from '../types'

function ParallelogramShape({ label, style, shapeClass, baseStyle, getShapeStyle, getDropShadowFilter }: ShapeRenderProps) {
  return (
    <div
      className="w-full h-full"
      style={{ filter: getDropShadowFilter() }}
    >
      <div
        className={cn(shapeClass, 'p-1')}
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
}

function CalloutShape(props: ShapeRenderProps) {
  return (
    <SVGPathShape path="M 5,5 L 95,5 L 95,70 L 30,70 L 15,95 L 22,70 L 5,70 Z" renderProps={props}>
      {props.label}
    </SVGPathShape>
  )
}

function NoteShape(props: ShapeRenderProps) {
  return (
    <SVGPathShape path="M 5,5 L 80,5 L 95,20 L 95,95 L 5,95 Z M 80,5 L 80,20 L 95,20" renderProps={props}>
      {props.label}
    </SVGPathShape>
  )
}

function DocumentShape(props: ShapeRenderProps) {
  return (
    <SVGPathShape path="M 5,5 L 95,5 L 95,80 Q 72,95 50,80 Q 28,65 5,80 Z" renderProps={props}>
      {props.label}
    </SVGPathShape>
  )
}

function MultiDocumentShape({ label, locked, baseStyle, shapeClass, getShapeStyle, getDropShadowFilter }: ShapeRenderProps) {
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
}

function PredefinedProcessShape({ label, style, baseStyle, shapeClass, getShapeStyle }: ShapeRenderProps) {
  return (
    <div className="relative w-full h-full" style={{ transform: baseStyle.transform }}>
      <div
        className={cn(shapeClass, 'p-1')}
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
}

function OrShape({ label, locked, baseStyle, shapeClass, getShapeStyle }: ShapeRenderProps) {
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
}

function SummingJunctionShape({ label, locked, baseStyle, shapeClass, getShapeStyle }: ShapeRenderProps) {
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
}

// Register all special shapes
registerShapes(['parallelogram', 'data'], ParallelogramShape)
registerShape('callout', CalloutShape)
registerShapes(['note', 'uml-note'], NoteShape)
registerShape('document', DocumentShape)
registerShape('multi-document', MultiDocumentShape)
registerShape('predefined-process', PredefinedProcessShape)
registerShape('or', OrShape)
registerShape('summing-junction', SummingJunctionShape)
