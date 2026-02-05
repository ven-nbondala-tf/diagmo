import { Skeleton } from '@/components/ui/skeleton'

export function DiagramListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-lg border bg-card">
      <Skeleton className="w-16 h-10 rounded flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-1.5">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-3 w-20 hidden sm:block" />
    </div>
  )
}
