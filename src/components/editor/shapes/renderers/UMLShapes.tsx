import { cn } from '@/utils'
import { registerShape } from '../registry'
import type { ShapeRenderProps } from '../types'
import type { UMLAttribute, UMLMethod } from '@/types'

// Default attributes and methods for new UML classes
const DEFAULT_ATTRIBUTES: UMLAttribute[] = [
  { visibility: '+', name: 'attribute', type: 'Type' },
  { visibility: '-', name: 'privateAttr', type: 'Type' },
]

const DEFAULT_METHODS: UMLMethod[] = [
  { visibility: '+', name: 'method', parameters: '', returnType: 'void' },
  { visibility: '-', name: 'privateMethod', parameters: '', returnType: '' },
]

function UMLClassShape({ label, locked, baseStyle, getShapeStyle, data }: ShapeRenderProps) {
  const attributes = data.umlAttributes ?? DEFAULT_ATTRIBUTES
  const methods = data.umlMethods ?? DEFAULT_METHODS
  const stereotype = data.umlStereotype

  return (
    <div
      className={cn('w-full h-full flex flex-col', locked && 'opacity-75')}
      style={getShapeStyle({ borderRadius: 4 })}
    >
      {/* Class name header */}
      <div
        className="border-b px-2 py-1 text-center"
        style={{ borderColor: baseStyle.borderColor, color: baseStyle.color, fontFamily: baseStyle.fontFamily }}
      >
        {stereotype && (
          <div className="text-xs italic">«{stereotype}»</div>
        )}
        <div className="font-bold">{label || 'ClassName'}</div>
      </div>

      {/* Attributes section */}
      <div
        className="border-b px-2 py-1 text-xs text-left min-h-[24px]"
        style={{ borderColor: baseStyle.borderColor, color: baseStyle.color, fontFamily: baseStyle.fontFamily }}
      >
        {attributes.length > 0 ? (
          attributes.map((attr, i) => (
            <div key={i}>{attr.visibility} {attr.name}: {attr.type}</div>
          ))
        ) : (
          <div className="text-muted-foreground italic">No attributes</div>
        )}
      </div>

      {/* Methods section */}
      <div
        className="flex-1 px-2 py-1 text-xs text-left min-h-[24px]"
        style={{ color: baseStyle.color, fontFamily: baseStyle.fontFamily }}
      >
        {methods.length > 0 ? (
          methods.map((method, i) => (
            <div key={i}>
              {method.visibility} {method.name}({method.parameters || ''})
              {method.returnType ? `: ${method.returnType}` : ''}
            </div>
          ))
        ) : (
          <div className="text-muted-foreground italic">No methods</div>
        )}
      </div>
    </div>
  )
}

function UMLInterfaceShape({ label, locked, baseStyle, getShapeStyle, data }: ShapeRenderProps) {
  const methods = data.umlMethods ?? [{ visibility: '+' as const, name: 'method', parameters: '', returnType: 'void' }]

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
        className="flex-1 px-2 py-1 text-xs text-left"
        style={{ color: baseStyle.color, fontFamily: baseStyle.fontFamily }}
      >
        {methods.map((method, i) => (
          <div key={i}>
            {method.visibility} {method.name}({method.parameters || ''})
            {method.returnType ? `: ${method.returnType}` : ''}
          </div>
        ))}
      </div>
    </div>
  )
}

function UMLActorShape({ label, locked, baseStyle }: ShapeRenderProps) {
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
}

function UMLUsecaseShape({ label, shapeClass, getShapeStyle }: ShapeRenderProps) {
  return (
    <div
      className={cn(shapeClass, 'rounded-full p-1')}
      style={getShapeStyle({ borderRadius: '50%' })}
    >
      {label}
    </div>
  )
}

function UMLComponentShape({ label, style, baseStyle, shapeClass, getShapeStyle }: ShapeRenderProps) {
  return (
    <div className="relative w-full h-full" style={{ transform: baseStyle.transform }}>
      <div
        className={cn(shapeClass, 'p-1')}
        style={getShapeStyle({ borderRadius: 4, transform: undefined })}
      >
        {label}
      </div>
      <div
        className="absolute -left-2 top-[20%] w-4 h-3"
        style={{ backgroundColor: baseStyle.backgroundColor, border: `${baseStyle.borderWidth}px ${style?.borderStyle || 'solid'} ${baseStyle.borderColor}` }}
      />
      <div
        className="absolute -left-2 top-[50%] w-4 h-3"
        style={{ backgroundColor: baseStyle.backgroundColor, border: `${baseStyle.borderWidth}px ${style?.borderStyle || 'solid'} ${baseStyle.borderColor}` }}
      />
    </div>
  )
}

function UMLPackageShape({ label, locked, baseStyle, getShapeStyle }: ShapeRenderProps) {
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
}

function UMLStateShape({ label, shapeClass, getShapeStyle }: ShapeRenderProps) {
  return (
    <div
      className={cn(shapeClass, 'p-1')}
      style={getShapeStyle({ borderRadius: 16 })}
    >
      {label}
    </div>
  )
}

// Register all UML shapes
registerShape('uml-class', UMLClassShape)
registerShape('uml-interface', UMLInterfaceShape)
registerShape('uml-actor', UMLActorShape)
registerShape('uml-usecase', UMLUsecaseShape)
registerShape('uml-component', UMLComponentShape)
registerShape('uml-package', UMLPackageShape)
registerShape('uml-state', UMLStateShape)
