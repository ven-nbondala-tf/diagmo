import { cn } from '@/utils'
import { cloudIconComponents, type CloudIconType } from '../../icons'
import type { ShapeRenderProps } from '../types'

/**
 * Renders cloud provider icons (AWS, Azure, GCP, etc.) or a default fallback shape.
 * This is used as a fallback when no registered shape renderer matches the type,
 * since cloud icon types are dynamic and can't all be pre-registered.
 */
export function renderCloudIconOrDefault(props: ShapeRenderProps) {
  const { data, locked, isValidTarget, baseStyle, shapeClass, getShapeStyle } = props

  // Check if it's a cloud icon type
  const IconComponent = cloudIconComponents[data.type as CloudIconType]
  if (IconComponent) {
    return (
      <div
        className={cn(
          'w-full h-full flex items-center justify-center',
          locked && 'opacity-75',
          isValidTarget && 'ring-2 ring-green-500 ring-offset-2'
        )}
        style={{ transform: baseStyle.transform }}
      >
        <div className="cloud-icon-container w-full h-full">
          <IconComponent />
        </div>
      </div>
    )
  }

  // Default shape for unknown types
  return (
    <div
      className={cn(shapeClass, 'p-1')}
      style={getShapeStyle()}
    >
      {props.label}
    </div>
  )
}
