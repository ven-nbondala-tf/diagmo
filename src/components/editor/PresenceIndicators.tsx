import { memo, useCallback } from 'react'
import { Users, Eye, EyeOff } from 'lucide-react'
import { useCollaborationStore } from '@/stores/collaborationStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui'
import type { CollaboratorPresence } from '@/types'

interface PresenceIndicatorsProps {
  collaborators: CollaboratorPresence[]
  maxVisible?: number
}

/**
 * Shows avatars of users currently viewing the diagram
 * Displays in the editor header area
 * Clicking on an avatar shows options to follow their viewport
 */
export const PresenceIndicators = memo(function PresenceIndicators({
  collaborators,
  maxVisible = 5,
}: PresenceIndicatorsProps) {
  const followingUserId = useCollaborationStore((s) => s.followingUserId)
  const followUser = useCollaborationStore((s) => s.followUser)
  const unfollowUser = useCollaborationStore((s) => s.unfollowUser)

  const handleFollow = useCallback((userId: string) => {
    if (followingUserId === userId) {
      unfollowUser()
    } else {
      followUser(userId)
    }
  }, [followingUserId, followUser, unfollowUser])

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
            collaborator={collaborator}
            isFollowing={followingUserId === collaborator.userId}
            onFollow={() => handleFollow(collaborator.userId)}
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
  collaborator: CollaboratorPresence
  isFollowing: boolean
  onFollow: () => void
}

const CollaboratorAvatar = memo(function CollaboratorAvatar({
  collaborator,
  isFollowing,
  onFollow,
}: CollaboratorAvatarProps) {
  const name = collaborator.user?.fullName || 'Anonymous'
  const avatarUrl = collaborator.user?.avatarUrl
  const color = collaborator.color

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative w-7 h-7 rounded-full border-2 border-background flex items-center justify-center text-xs font-medium text-white overflow-hidden cursor-pointer hover:ring-2 hover:ring-white/50 transition-all focus:outline-none"
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
          {isFollowing && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full border border-background flex items-center justify-center">
              <Eye className="w-2 h-2 text-white" />
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        <DropdownMenuItem onClick={onFollow}>
          {isFollowing ? (
            <>
              <EyeOff className="w-4 h-4 mr-2" />
              Stop Following
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Follow {name.split(' ')[0]}
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})
