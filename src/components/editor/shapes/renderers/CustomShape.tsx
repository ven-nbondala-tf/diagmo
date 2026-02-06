import { useMemo } from 'react'
import DOMPurify from 'dompurify'
import { cn } from '@/utils'
import { registerShape } from '../registry'
import type { ShapeRenderProps } from '../types'

/**
 * Sanitize SVG content to prevent XSS attacks
 */
function sanitizeSvg(svgContent: string): string {
  return DOMPurify.sanitize(svgContent, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: ['use', 'symbol', 'defs', 'clipPath', 'mask', 'pattern', 'marker'],
    ADD_ATTR: ['xmlns', 'xmlns:xlink', 'xlink:href', 'preserveAspectRatio', 'viewBox'],
  })
}

function CustomShapeRenderer({ data, shapeClass, getShapeStyle, locked, isValidTarget, label }: ShapeRenderProps) {
  const svgContent = (data as Record<string, unknown>).customShapeSvg as string | undefined
  const customShapeName = (data as Record<string, unknown>).customShapeName as string | undefined

  // Sanitize SVG content
  const sanitizedSvg = useMemo(() => {
    if (!svgContent) return null
    return sanitizeSvg(svgContent)
  }, [svgContent])

  if (!sanitizedSvg) {
    // Fallback if no SVG content
    return (
      <div className={shapeClass} style={getShapeStyle()}>
        <span className="text-muted-foreground text-xs">{label || customShapeName || 'Custom Shape'}</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'w-full h-full flex flex-col items-center justify-center overflow-hidden',
        locked && 'opacity-75',
        isValidTarget && 'ring-2 ring-green-500 ring-offset-2'
      )}
      style={{
        padding: 4,
      }}
    >
      {/* SVG Container - scales to fit */}
      <div
        className="flex-1 w-full flex items-center justify-center min-h-0"
        dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
        style={{
          // Let SVG scale within container
          overflow: 'hidden',
        }}
      />

      {/* Label below shape if provided */}
      {label && (
        <div
          className="text-center text-xs mt-1 truncate w-full px-1"
          style={{ color: 'inherit' }}
        >
          {label}
        </div>
      )}
    </div>
  )
}

// Register custom shape
registerShape('custom-shape', CustomShapeRenderer)
