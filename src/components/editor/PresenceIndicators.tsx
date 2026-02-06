import { memo } from 'react'
import { Users } from 'lucide-react'
import type { CollaboratorPresence } from '@/types'

interface PresenceIndicatorsProps {
  collaborators: CollaboratorPresence[]
  maxVisible?: number
}

/**
 * Shows avatars of users currently viewing the diagram
 * Displays in the editor header area
 */
export const PresenceIndicators = memo(function PresenceIndicators({
  collaborators,
  maxVisible = 5,
}: PresenceIndicatorsProps) {
  if (collaborators.length === 0) return null

  const visibleCollaborators = collaborators.slice(0, maxVisible)
  const remainingCount = collaborators.length - maxVisible

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        <Users className="w-4 h-4 text-muted-foreground mr-1" />
        <span className="text-xs text-muted-foreground">
          {collaborators.length} viewing
        </span>
      </div>
      <div className="flex -space-x-2">
        {visibleCollaborators.map((collaborator) => (
          <CollaboratorAvatar
            key={collaborator.id}
            name={collaborator.user?.fullName || 'Anonymous'}
            avatarUrl={collaborator.user?.avatarUrl}
            color={collaborator.color}
          />
        ))}
        {remainingCount > 0 && (
          <div
            className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground"
            title={`${remainingCount} more`}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    </div>
  )
})

interface CollaboratorAvatarProps {
  name: string
  avatarUrl?: string | null
  color: string
}

const CollaboratorAvatar = memo(function CollaboratorAvatar({
  name,
  avatarUrl,
  color,
}: CollaboratorAvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className="w-7 h-7 rounded-full border-2 border-background flex items-center justify-center text-xs font-medium text-white overflow-hidden"
      style={{ backgroundColor: color }}
      title={name}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : (
        initials || '?'
      )}
    </div>
  )
})
