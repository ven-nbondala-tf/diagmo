import { cn } from '@/utils'
import { registerShape } from '../registry'
import type { ShapeRenderProps } from '../types'

function TextRenderer({ label, baseStyle, style, getHorizontalAlignClass }: ShapeRenderProps) {
  const isEmpty = !label || label.trim() === ''

  // Get alignment - use style directly for most accurate value
  const textAlign = style?.textAlign || 'center'

  return (
    <div
      className={cn(
        'w-full h-full flex overflow-hidden',
        'items-center', // Vertical center
        getHorizontalAlignClass(), // Horizontal alignment from props
        'px-2 py-1 min-w-[40px] min-h-[20px]'
      )}
      style={{
        color: baseStyle.color,
        fontSize: baseStyle.fontSize,
        fontWeight: baseStyle.fontWeight,
        fontStyle: baseStyle.fontStyle as React.CSSProperties['fontStyle'],
        textDecoration: baseStyle.textDecoration,
        fontFamily: baseStyle.fontFamily,
        transform: baseStyle.transform,
      }}
    >
      <span
        className="w-full"
        style={{ textAlign }}
      >
        {isEmpty ? (
          <span className="text-supabase-text-muted text-sm">Type here...</span>
        ) : (
          label
        )}
      </span>
    </div>
  )
}

registerShape('text', TextRenderer)
