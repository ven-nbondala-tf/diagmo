import { Card, CardHeader, CardContent } from '@/components/ui'
import { Skeleton } from '@/components/ui/skeleton'

export function DiagramCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="aspect-video rounded-md mb-2" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-3 w-1/3" />
      </CardContent>
    </Card>
  )
}
