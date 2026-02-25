import { useCallback } from 'react'
import { X, Eye } from 'lucide-react'
import { Button } from '@/components/ui'
import { useCollaborationStore } from '@/stores/collaborationStore'
import { cn } from '@/utils'

/**
 * Floating indicator shown when following another user's viewport
 * Displays who is being followed and provides a button to stop following
 */
export function FollowModeIndicator() {
  const followingUserId = useCollaborationStore((s) => s.followingUserId)
  const collaborators = useCollaborationStore((s) => s.collaborators)
  const unfollowUser = useCollaborationStore((s) => s.unfollowUser)

  const followedUser = collaborators.find((c) => c.userId === followingUserId)

  const handleStopFollowing = useCallback(() => {
    unfollowUser()
  }, [unfollowUser])

  if (!followingUserId || !followedUser) {
    return null
  }

  return (
    <div
      className={cn(
        'fixed bottom-20 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-3 px-4 py-2.5 rounded-full',
        'bg-blue-600/95 text-white shadow-lg backdrop-blur-sm',
        'animate-in slide-in-from-bottom-4 duration-300'
      )}
    >
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4 animate-pulse" />
        <span className="text-sm font-medium">
          Following{' '}
          <span
            className="font-semibold px-1.5 py-0.5 rounded"
            style={{ backgroundColor: followedUser.color + '40' }}
          >
            {followedUser.user?.fullName || 'User'}
          </span>
        </span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleStopFollowing}
        className="h-7 px-2 text-white hover:bg-white/20 hover:text-white"
      >
        <X className="h-4 w-4" />
        <span className="ml-1 text-xs">Stop</span>
      </Button>
    </div>
  )
}
