import { cn } from '@/utils'
import { registerShape } from '../registry'
import type { ShapeRenderProps } from '../types'

function CustomShapeRenderer({ data, shapeClass, getShapeStyle, locked, isValidTarget }: ShapeRenderProps) {
  const svgContent = (data as Record<string, unknown>).customShapeSvg as string | undefined

  if (!svgContent) {
    // Fallback if no SVG content
    return (
      <div className={shapeClass} style={getShapeStyle()}>
        <span className="text-muted-foreground text-xs">Custom Shape</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'w-full h-full flex items-center justify-center overflow-hidden',
        locked && 'opacity-75',
        isValidTarget && 'ring-2 ring-green-500 ring-offset-2'
      )}
      style={{
        // Minimal styling - let the SVG define its appearance
        padding: 4,
      }}
    >
      <div
        className="w-full h-full flex items-center justify-center"
        dangerouslySetInnerHTML={{ __html: svgContent }}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      />
    </div>
  )
}

// Register custom shape
registerShape('custom-shape', CustomShapeRenderer)
