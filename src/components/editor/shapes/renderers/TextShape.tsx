import { cn } from '@/utils'
import { registerShape } from '../registry'
import type { ShapeRenderProps } from '../types'

function TextRenderer({ label, shapeClass, baseStyle }: ShapeRenderProps) {
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
}

registerShape('text', TextRenderer)
