/**
 * Lazy-loaded Cloud Icon Component
 *
 * This wrapper enables code-splitting for cloud icons.
 * The actual icons (218KB) are only loaded when this component mounts,
 * i.e., when a user expands a cloud provider category in the ShapePanel.
 */
import { lazy, Suspense } from 'react'
import { Skeleton } from '@/components/ui'
import type { CloudIconType } from './CloudIcons'

// Dynamically import the cloud icons - this creates a separate chunk
const CloudIconsModule = lazy(() =>
  import('./CloudIcons').then(module => ({
    default: ({ iconType, size, className }: { iconType: CloudIconType; size?: number; className?: string }) => {
      const IconComponent = module.cloudIconComponents[iconType]
      return IconComponent ? <IconComponent size={size} className={className} /> : null
    }
  }))
)

interface LazyCloudIconProps {
  iconType: CloudIconType
  size?: number
  className?: string
}

/**
 * Renders a cloud icon with lazy loading
 * The actual icon bundle is only loaded when this component mounts
 */
export function LazyCloudIcon({ iconType, size = 32, className }: LazyCloudIconProps) {
  return (
    <Suspense fallback={<Skeleton className="h-8 w-8 rounded" />}>
      <CloudIconsModule iconType={iconType} size={size} className={className} />
    </Suspense>
  )
}

/**
 * Get cloud icon component directly (for use in shapes that need the component)
 * Note: This still loads synchronously for shape rendering
 */
export { cloudIconComponents, type CloudIconType } from './CloudIcons'
