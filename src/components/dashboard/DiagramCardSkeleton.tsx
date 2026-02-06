import { Skeleton } from '@/components/ui/skeleton'

export function DiagramCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Thumbnail skeleton */}
      <Skeleton className="aspect-[16/10] rounded-none" />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  )
}
