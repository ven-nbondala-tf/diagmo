import { type ReactNode, useId } from 'react'
import { cn } from '@/utils'
import type { ShapeRenderProps } from '../types'

interface SVGShapeProps {
  points: string
  children: ReactNode
  renderProps: ShapeRenderProps
}

export function SVGShape({ points, children, renderProps }: SVGShapeProps) {
  const { style, baseStyle, locked, getDropShadowFilter, getVerticalAlignClass, getHorizontalAlignClass } = renderProps
  const gradientId = useId()

  const getStrokeDasharray = () => {
    switch (style?.borderStyle) {
      case 'dashed': return '8,4'
      case 'dotted': return '2,2'
      case 'none': return undefined
      default: return undefined
    }
  }

  const strokeWidth = style?.borderStyle === 'none' ? 0 : (baseStyle.borderWidth || 1)

  // Gradient support for SVG shapes
  const gradientEnabled = style?.gradientEnabled && style?.gradientColor
  const gradientAngle = style?.gradientDirection === 'vertical' ? { x1: '0%', y1: '0%', x2: '0%', y2: '100%' } :
                        style?.gradientDirection === 'diagonal' ? { x1: '0%', y1: '0%', x2: '100%', y2: '100%' } :
                        { x1: '0%', y1: '0%', x2: '100%', y2: '0%' } // horizontal default
  const fillValue = gradientEnabled ? `url(#${gradientId})` : baseStyle.backgroundColor

  return (
    <div
      className="w-full h-full relative"
      style={{
        filter: getDropShadowFilter(),
        transform: style?.rotation ? `rotate(${style.rotation}deg)` : undefined,
      }}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {gradientEnabled && (
          <defs>
            <linearGradient id={gradientId} {...gradientAngle}>
              <stop offset="0%" stopColor={baseStyle.backgroundColor} stopOpacity={baseStyle.opacity} />
              <stop offset="100%" stopColor={style.gradientColor} stopOpacity={baseStyle.opacity} />
            </linearGradient>
          </defs>
        )}
        <polygon
          points={points}
          fill={fillValue}
          fillOpacity={gradientEnabled ? 1 : baseStyle.opacity}
          stroke={style?.borderStyle === 'none' ? 'none' : baseStyle.borderColor}
          strokeWidth={strokeWidth}
          strokeDasharray={getStrokeDasharray()}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div
        className={cn(
          'absolute inset-0 flex overflow-hidden',
          getVerticalAlignClass(),
          getHorizontalAlignClass(),
          locked && 'opacity-75'
        )}
        style={{
          color: baseStyle.color,
          fontSize: baseStyle.fontSize,
          fontFamily: baseStyle.fontFamily,
          fontWeight: baseStyle.fontWeight,
          fontStyle: baseStyle.fontStyle,
          textDecoration: baseStyle.textDecoration,
          padding: `${style?.textPadding ?? 8}px`,
        }}
      >
        <span className="min-w-0 max-w-full break-words whitespace-normal">{children}</span>
      </div>
    </div>
  )
}
