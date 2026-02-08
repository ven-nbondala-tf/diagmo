import { useState, useMemo } from 'react'
import { cn } from '@/utils/cn'
import { Users, ChevronDown, ChevronUp, Circle, MousePointer2 } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui'

export interface PresenceUser {
  id: string
  name: string
  email?: string
  avatar?: string
  color: string
  cursor?: { x: number; y: number }
  lastSeen: Date
  isActive: boolean
}

interface PresencePanelProps {
  users: PresenceUser[]
  currentUserId: string
  maxVisible?: number
  onUserClick?: (userId: string) => void
  className?: string
}

export function PresencePanel({
  users,
  currentUserId,
  maxVisible = 5,
  onUserClick,
  className,
}: PresencePanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Filter out current user and sort by activity
  const otherUsers = useMemo(() => {
    return users
      .filter((u) => u.id !== currentUserId)
      .sort((a, b) => {
        // Active users first
        if (a.isActive !== b.isActive) return a.isActive ? -1 : 1
        // Then by last seen
        return b.lastSeen.getTime() - a.lastSeen.getTime()
      })
  }, [users, currentUserId])

  const visibleUsers = isExpanded ? otherUsers : otherUsers.slice(0, maxVisible)
  const hiddenCount = otherUsers.length - maxVisible

  if (otherUsers.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg',
          'bg-supabase-bg-secondary border border-supabase-border',
          'text-supabase-text-muted text-sm',
          className
        )}
      >
        <Users className="h-4 w-4" />
        <span>Only you</span>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Avatars Row */}
      <div className="flex items-center gap-1">
        {visibleUsers.map((user, index) => (
          <Tooltip key={user.id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onUserClick?.(user.id)}
                className={cn(
                  'relative rounded-full transition-transform hover:scale-110 hover:z-10',
                  'ring-2 ring-supabase-bg',
                  index > 0 && '-ml-2'
                )}
                style={{ zIndex: visibleUsers.length - index }}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover"
                    style={{ borderColor: user.color, borderWidth: 2 }}
                  />
                ) : (
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {/* Activity indicator */}
                <span
                  className={cn(
                    'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-supabase-bg',
                    user.isActive ? 'bg-supabase-green' : 'bg-supabase-text-muted'
                  )}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{user.name}</span>
                {user.isActive && (
                  <span className="flex items-center gap-1 text-xs text-supabase-green">
                    <Circle className="h-2 w-2 fill-current" />
                    Active
                  </span>
                )}
              </div>
              {user.email && (
                <span className="text-xs text-supabase-text-muted">{user.email}</span>
              )}
              {user.cursor && (
                <span className="text-xs text-supabase-text-muted flex items-center gap-1">
                  <MousePointer2 className="h-3 w-3" />
                  {Math.round(user.cursor.x)}, {Math.round(user.cursor.y)}
                </span>
              )}
            </TooltipContent>
          </Tooltip>
        ))}

        {/* Overflow indicator */}
        {!isExpanded && hiddenCount > 0 && (
          <button
            onClick={() => setIsExpanded(true)}
            className={cn(
              'h-8 w-8 rounded-full -ml-2 flex items-center justify-center',
              'bg-supabase-bg-tertiary border-2 border-supabase-bg',
              'text-xs font-medium text-supabase-text-secondary',
              'hover:bg-supabase-bg-tertiary/80 transition-colors'
            )}
          >
            +{hiddenCount}
          </button>
        )}

        {/* Collapse button */}
        {isExpanded && hiddenCount > 0 && (
          <button
            onClick={() => setIsExpanded(false)}
            className={cn(
              'h-8 w-8 rounded-full -ml-2 flex items-center justify-center',
              'bg-supabase-bg-tertiary border-2 border-supabase-bg',
              'text-supabase-text-secondary',
              'hover:bg-supabase-bg-tertiary/80 transition-colors'
            )}
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Expanded User List */}
      {isExpanded && (
        <div className="mt-2 p-2 bg-supabase-bg-secondary rounded-lg border border-supabase-border shadow-lg animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="text-xs font-medium text-supabase-text-muted mb-2 px-2">
            {otherUsers.length} collaborator{otherUsers.length !== 1 ? 's' : ''}
          </div>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {otherUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => onUserClick?.(user.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-2 py-1.5 rounded-lg',
                  'hover:bg-supabase-bg-tertiary transition-colors',
                  'text-left'
                )}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-6 w-6 rounded-full object-cover"
                    style={{ borderColor: user.color, borderWidth: 2 }}
                  />
                ) : (
                  <div
                    className="h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-supabase-text-primary truncate">
                    {user.name}
                  </div>
                </div>
                <span
                  className={cn(
                    'h-2 w-2 rounded-full shrink-0',
                    user.isActive ? 'bg-supabase-green' : 'bg-supabase-text-muted'
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Compact presence indicator for the toolbar
 */
interface CompactPresenceProps {
  userCount: number
  activeCount: number
  onClick?: () => void
  className?: string
}

export function CompactPresence({
  userCount,
  activeCount,
  onClick,
  className,
}: CompactPresenceProps) {
  if (userCount <= 1) return null

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg',
            'bg-supabase-bg-secondary border border-supabase-border',
            'hover:bg-supabase-bg-tertiary transition-colors',
            'text-supabase-text-secondary hover:text-supabase-text-primary',
            className
          )}
        >
          <Users className="h-3.5 w-3.5" />
          <span className="text-sm font-medium">{userCount}</span>
          {activeCount > 0 && (
            <span className="flex items-center gap-1 text-supabase-green">
              <Circle className="h-1.5 w-1.5 fill-current" />
              <span className="text-xs">{activeCount}</span>
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {userCount} collaborator{userCount !== 1 ? 's' : ''}, {activeCount} active
        </p>
      </TooltipContent>
    </Tooltip>
  )
}
