import { cn } from '@/utils/cn'

interface SkeletonProps {
  className?: string
}

/**
 * Base skeleton component with shimmer animation
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded bg-supabase-bg-tertiary',
        className
      )}
    />
  )
}

/**
 * Skeleton for diagram cards in the dashboard
 */
export function DiagramCardSkeleton() {
  return (
    <div className="bg-supabase-bg-secondary rounded-xl border border-supabase-border overflow-hidden">
      {/* Thumbnail skeleton */}
      <div className="aspect-video bg-supabase-bg-tertiary animate-pulse" />

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton className="h-5 w-3/4" />

        {/* Meta info */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Description */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}

/**
 * Skeleton for diagram list in dashboard
 */
export function DiagramListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <DiagramCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton for sidebar navigation items
 */
export function SidebarSkeleton() {
  return (
    <div className="space-y-1 p-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}

      {/* Divider */}
      <div className="h-px bg-supabase-border my-3" />

      {/* Folders section */}
      <div className="px-3 py-2">
        <Skeleton className="h-3 w-16 mb-3" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Skeleton for the shape panel
 */
export function ShapePanelSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {/* Search bar */}
      <Skeleton className="h-9 w-full rounded-lg" />

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-lg shrink-0" />
        ))}
      </div>

      {/* Shapes grid */}
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 16 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    </div>
  )
}

/**
 * Skeleton for property panel
 */
export function PropertyPanelSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {/* Section header */}
      <Skeleton className="h-5 w-24" />

      {/* Properties */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-supabase-border" />

      {/* More properties */}
      <Skeleton className="h-5 w-20" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Skeleton for template gallery
 */
export function TemplateGallerySkeleton() {
  return (
    <div className="space-y-6">
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-lg shrink-0" />
        ))}
      </div>

      {/* Templates grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-video rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Skeleton for user avatar
 */
export function AvatarSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  }

  return <Skeleton className={cn('rounded-full', sizeClasses[size])} />
}

/**
 * Skeleton for workspace selector
 */
export function WorkspaceSelectorSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <Skeleton className="h-8 w-8 rounded-lg" />
      <div className="flex-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16 mt-1" />
      </div>
      <Skeleton className="h-4 w-4" />
    </div>
  )
}

/**
 * Skeleton for version history list
 */
export function VersionHistorySkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-3 p-3 rounded-lg bg-supabase-bg-secondary"
        >
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton for comments list
 */
export function CommentsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton for notification items
 */
export function NotificationsSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-3">
          <Skeleton className="h-4 w-4 mt-0.5" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Full page loading skeleton
 */
export function PageLoadingSkeleton() {
  return (
    <div className="flex h-screen bg-supabase-bg">
      {/* Sidebar */}
      <div className="w-64 border-r border-supabase-border p-4">
        <Skeleton className="h-8 w-32 mb-6" />
        <SidebarSkeleton />
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <DiagramListSkeleton count={6} />
      </div>
    </div>
  )
}

/**
 * Editor loading skeleton
 */
export function EditorLoadingSkeleton() {
  return (
    <div className="flex h-screen bg-supabase-bg">
      {/* Left panel */}
      <div className="w-72 border-r border-supabase-border">
        <div className="h-12 border-b border-supabase-border px-4 flex items-center">
          <Skeleton className="h-5 w-24" />
        </div>
        <ShapePanelSkeleton />
      </div>

      {/* Canvas area */}
      <div className="flex-1 relative">
        {/* Header */}
        <div className="h-12 border-b border-supabase-border px-4 flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>

        {/* Canvas */}
        <div className="absolute inset-0 top-12 flex items-center justify-center">
          <div className="text-center">
            <Skeleton className="h-12 w-12 rounded-xl mx-auto mb-3" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>

      {/* Right panel */}
      <div className="w-72 border-l border-supabase-border">
        <div className="h-12 border-b border-supabase-border px-4 flex items-center">
          <Skeleton className="h-5 w-20" />
        </div>
        <PropertyPanelSkeleton />
      </div>
    </div>
  )
}
