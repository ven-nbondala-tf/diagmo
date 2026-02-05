import { registerShape } from '../registry'
import type { ShapeRenderProps } from '../types'

function JunctionShape({ getShapeStyle, baseStyle }: ShapeRenderProps) {
  return (
    <div
      className="w-full h-full rounded-full"
      style={getShapeStyle({
        borderRadius: '50%',
        backgroundColor: baseStyle.borderColor,
        borderWidth: 0,
        padding: 0,
      })}
    />
  )
}

registerShape('junction', JunctionShape)
