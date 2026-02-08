import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { notificationService, type Notification } from '@/services/notificationService'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const result = await notificationService.getAll()
      if (result.error) throw result.error
      return result.data
    },
    staleTime: 1000 * 30, // 30 seconds
  })
}

export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const result = await notificationService.getUnreadCount()
      if (result.error) throw result.error
      return result.count
    },
    staleTime: 1000 * 30, // 30 seconds
  })
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useDeleteNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationService.delete(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useDeleteAllNotifications() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationService.deleteAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

/**
 * Hook to subscribe to real-time notifications
 */
export function useNotificationSubscription() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!user) return

    const unsubscribe = notificationService.subscribeToNotifications(
      user.id,
      (notification: Notification) => {
        // Show toast for new notifications
        toast(notification.title, {
          description: notification.message,
        })

        // Invalidate queries to refresh lists
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
      }
    )

    return () => {
      unsubscribe()
    }
  }, [user, queryClient])
}
