import { cn } from '@/utils'
import { registerShape } from '../registry'
import type { ShapeRenderProps } from '../types'

function WebImageRenderer({ style, baseStyle, data, locked, isValidTarget }: ShapeRenderProps) {
  const imageUrl = data.imageUrl || data.thumbnailUrl
  const objectFit = data.objectFit || 'cover'
  const imageOpacity = style?.backgroundOpacity ?? 1
  const borderRadius = style?.borderRadius ?? 4
  const isIcon = data.imageType === 'icon' || data.imageType === 'gif'

  return (
    <div
      className={cn(
        'w-full h-full overflow-hidden',
        locked && 'opacity-75',
        isValidTarget && 'ring-2 ring-green-500 ring-offset-2'
      )}
      style={{
        borderRadius: isIcon ? 0 : borderRadius,
        border: isIcon ? 'none' : (style?.borderStyle !== 'none' ? `${style?.borderWidth || 1}px ${style?.borderStyle || 'solid'} ${style?.borderColor || '#9ca3af'}` : 'none'),
        boxShadow: isIcon ? undefined : baseStyle.boxShadow,
        transform: baseStyle.transform,
      }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={data.imageAlt || 'Web image'}
          className="w-full h-full"
          style={{
            objectFit: isIcon ? 'contain' : objectFit,
            opacity: imageOpacity,
          }}
          draggable={false}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999" font-family="sans-serif" font-size="12"%3EImage Error%3C/text%3E%3C/svg%3E'
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs">
          No image
        </div>
      )}
    </div>
  )
}

registerShape('web-image', WebImageRenderer)
