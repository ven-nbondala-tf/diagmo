import { formatDistanceToNow } from 'date-fns'
import type { Diagram } from '@/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'
import { FileImage } from 'lucide-react'

interface DiagramCardProps {
  diagram: Diagram
  onClick: () => void
}

export function DiagramCard({ diagram, onClick }: DiagramCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-2 overflow-hidden">
          {diagram.thumbnail ? (
            <img
              src={diagram.thumbnail}
              alt={diagram.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <FileImage className="h-12 w-12 text-muted-foreground" />
          )}
        </div>
        <CardTitle className="text-lg truncate">{diagram.name}</CardTitle>
        <CardDescription className="truncate">
          {diagram.description || 'No description'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">
          Updated {formatDistanceToNow(new Date(diagram.updatedAt), { addSuffix: true })}
        </p>
      </CardContent>
    </Card>
  )
}
