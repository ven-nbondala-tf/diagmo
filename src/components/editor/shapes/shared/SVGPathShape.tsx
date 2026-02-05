import type { ReactNode } from 'react'
import { cn } from '@/utils'
import type { ShapeRenderProps } from '../types'

interface SVGPathShapeProps {
  path: string
  children: ReactNode
  viewBox?: string
  renderProps: ShapeRenderProps
}

export function SVGPathShape({ path, children, viewBox = '0 0 100 100', renderProps }: SVGPathShapeProps) {
  const { style, baseStyle, locked, getDropShadowFilter, getVerticalAlignClass, getHorizontalAlignClass } = renderProps

  const getStrokeDasharray = () => {
    switch (style?.borderStyle) {
      case 'dashed': return '8,4'
      case 'dotted': return '2,2'
      case 'none': return undefined
      default: return undefined
    }
  }

  const strokeWidth = style?.borderStyle === 'none' ? 0 : (baseStyle.borderWidth || 1)

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
        viewBox={viewBox}
        preserveAspectRatio="none"
      >
        <path
          d={path}
          fill={baseStyle.backgroundColor}
          fillOpacity={baseStyle.opacity}
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
          padding: '8px',
        }}
      >
        {children}
      </div>
    </div>
  )
}
