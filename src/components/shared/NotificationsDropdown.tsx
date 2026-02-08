import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  ScrollArea,
} from '@/components/ui'
import { Bell, FileText, Users, Share2, MessageSquare, Check, Trash2, Loader2 } from 'lucide-react'
import { cn } from '@/utils'
import { formatDistanceToNow } from 'date-fns'
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useDeleteAllNotifications,
} from '@/hooks/useNotifications'
import type { NotificationType } from '@/services/notificationService'

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'share':
      return Share2
    case 'comment':
    case 'mention':
      return MessageSquare
    case 'invite':
      return Users
    case 'update':
      return FileText
    default:
      return Bell
  }
}

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false)

  const { data: notifications = [], isLoading } = useNotifications()
  const markAsRead = useMarkNotificationAsRead()
  const markAllAsRead = useMarkAllNotificationsAsRead()
  const deleteNotification = useDeleteNotification()
  const deleteAll = useDeleteAllNotifications()

  const unreadCount = notifications.filter(n => !n.read).length

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id)
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate()
  }

  const handleDelete = (id: string) => {
    deleteNotification.mutate(id)
  }

  const handleClearAll = () => {
    deleteAll.mutate()
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-md text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary transition-colors cursor-pointer relative">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-supabase-green" />
              )}
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Notifications</TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end" className="w-80 p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-supabase-border">
          <h3 className="font-semibold text-supabase-text-primary">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
              className="text-xs text-supabase-green hover:text-supabase-green-hover cursor-pointer disabled:opacity-50"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-supabase-text-muted" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <Bell className="w-10 h-10 text-supabase-text-muted mb-2" />
              <p className="text-sm text-supabase-text-muted">No notifications</p>
              <p className="text-xs text-supabase-text-muted mt-1">
                You'll see notifications here when someone shares a diagram or invites you to a workspace.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-supabase-border">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type)
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'flex gap-3 px-4 py-3 hover:bg-supabase-bg-tertiary transition-colors',
                      !notification.read && 'bg-supabase-green/5'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                      notification.read ? 'bg-supabase-bg-tertiary' : 'bg-supabase-green/10'
                    )}>
                      <Icon className={cn(
                        'w-4 h-4',
                        notification.read ? 'text-supabase-text-muted' : 'text-supabase-green'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm',
                        notification.read ? 'text-supabase-text-secondary' : 'text-supabase-text-primary font-medium'
                      )}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-supabase-text-muted truncate">
                        {notification.message}
                      </p>
                      <p className="text-xs text-supabase-text-muted mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-start gap-1">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={markAsRead.isPending}
                          className="p-1 hover:bg-supabase-bg-secondary rounded cursor-pointer disabled:opacity-50"
                          title="Mark as read"
                        >
                          <Check className="w-3 h-3 text-supabase-text-muted" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        disabled={deleteNotification.isPending}
                        className="p-1 hover:bg-supabase-bg-secondary rounded cursor-pointer disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3 text-supabase-text-muted" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 border-t border-supabase-border">
            <button
              onClick={handleClearAll}
              disabled={deleteAll.isPending}
              className="text-xs text-supabase-text-muted hover:text-supabase-text-secondary cursor-pointer disabled:opacity-50"
            >
              Clear all notifications
            </button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
