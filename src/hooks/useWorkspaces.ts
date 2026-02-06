import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workspaceService } from '@/services/workspaceService'
import type { Workspace, WorkspaceMember, WorkspaceRole } from '@/types'

export const workspaceKeys = {
  all: ['workspaces'] as const,
  lists: () => [...workspaceKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...workspaceKeys.lists(), filters] as const,
  details: () => [...workspaceKeys.all, 'detail'] as const,
  detail: (id: string) => [...workspaceKeys.details(), id] as const,
  members: (workspaceId: string) => [...workspaceKeys.all, 'members', workspaceId] as const,
  diagrams: (workspaceId: string) => [...workspaceKeys.all, 'diagrams', workspaceId] as const,
  pendingInvites: () => [...workspaceKeys.all, 'pending-invites'] as const,
}

/**
 * Get all workspaces for the current user
 */
export function useWorkspaces() {
  return useQuery({
    queryKey: workspaceKeys.lists(),
    queryFn: () => workspaceService.getAll(),
  })
}

/**
 * Get a single workspace by ID
 */
export function useWorkspace(id: string | undefined) {
  return useQuery({
    queryKey: workspaceKeys.detail(id || ''),
    queryFn: () => (id ? workspaceService.getById(id) : null),
    enabled: !!id,
  })
}

/**
 * Get members of a workspace
 */
export function useWorkspaceMembers(workspaceId: string | undefined) {
  return useQuery({
    queryKey: workspaceKeys.members(workspaceId || ''),
    queryFn: () => (workspaceId ? workspaceService.getMembers(workspaceId) : []),
    enabled: !!workspaceId,
  })
}

/**
 * Get diagrams in a workspace
 */
export function useWorkspaceDiagrams(workspaceId: string | undefined) {
  return useQuery({
    queryKey: workspaceKeys.diagrams(workspaceId || ''),
    queryFn: () => (workspaceId ? workspaceService.getDiagrams(workspaceId) : []),
    enabled: !!workspaceId,
  })
}

/**
 * Get pending workspace invites for current user
 */
export function usePendingInvites() {
  return useQuery({
    queryKey: workspaceKeys.pendingInvites(),
    queryFn: () => workspaceService.getPendingInvites(),
  })
}

/**
 * Create a new workspace
 */
export function useCreateWorkspace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { name: string; description?: string }) =>
      workspaceService.create(input),
    onSuccess: (response) => {
      if (response.success && response.workspace) {
        queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() })
      }
    },
  })
}

/**
 * Update a workspace
 */
export function useUpdateWorkspace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: string
      name?: string
      description?: string
    }) => workspaceService.update(id, input),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: workspaceKeys.lists() })
      const previousLists = queryClient.getQueriesData<Workspace[]>({
        queryKey: workspaceKeys.lists(),
      })

      previousLists.forEach(([queryKey]) => {
        queryClient.setQueryData<Workspace[]>(queryKey, (old) => {
          if (!old) return old
          return old.map((w) =>
            w.id === variables.id
              ? { ...w, ...variables, updatedAt: new Date().toISOString() }
              : w
          )
        })
      })

      return { previousLists }
    },
    onError: (_err, _variables, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
    },
    onSettled: (response) => {
      if (response?.success && response.workspace) {
        queryClient.setQueryData(
          workspaceKeys.detail(response.workspace.id),
          response.workspace
        )
      }
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() })
    },
  })
}

/**
 * Delete a workspace
 */
export function useDeleteWorkspace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => workspaceService.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: workspaceKeys.lists() })
      const previousLists = queryClient.getQueriesData<Workspace[]>({
        queryKey: workspaceKeys.lists(),
      })

      previousLists.forEach(([queryKey]) => {
        queryClient.setQueryData<Workspace[]>(queryKey, (old) => {
          if (!old) return old
          return old.filter((w) => w.id !== id)
        })
      })

      return { previousLists }
    },
    onError: (_err, _id, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
    },
    onSettled: (_data, _err, id) => {
      queryClient.removeQueries({ queryKey: workspaceKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() })
    },
  })
}

/**
 * Invite a member to a workspace
 */
export function useInviteMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workspaceId,
      email,
      role,
    }: {
      workspaceId: string
      email: string
      role: WorkspaceRole
    }) => workspaceService.inviteMember({ workspaceId, email, role }),
    onSuccess: (response, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({
          queryKey: workspaceKeys.members(variables.workspaceId),
        })
      }
    },
  })
}

/**
 * Update a member's role
 */
export function useUpdateMemberRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      memberId,
      role,
    }: {
      memberId: string
      role: WorkspaceRole
      workspaceId: string
    }) => workspaceService.updateMemberRole(memberId, role),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: workspaceKeys.members(variables.workspaceId),
      })
      const previousMembers = queryClient.getQueryData<WorkspaceMember[]>(
        workspaceKeys.members(variables.workspaceId)
      )

      queryClient.setQueryData<WorkspaceMember[]>(
        workspaceKeys.members(variables.workspaceId),
        (old) => {
          if (!old) return old
          return old.map((m) =>
            m.id === variables.memberId ? { ...m, role: variables.role } : m
          )
        }
      )

      return { previousMembers }
    },
    onError: (_err, variables, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(
          workspaceKeys.members(variables.workspaceId),
          context.previousMembers
        )
      }
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: workspaceKeys.members(variables.workspaceId),
      })
    },
  })
}

/**
 * Remove a member from a workspace
 */
export function useRemoveMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      memberId,
    }: {
      memberId: string
      workspaceId: string
    }) => workspaceService.removeMember(memberId),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: workspaceKeys.members(variables.workspaceId),
      })
      const previousMembers = queryClient.getQueryData<WorkspaceMember[]>(
        workspaceKeys.members(variables.workspaceId)
      )

      queryClient.setQueryData<WorkspaceMember[]>(
        workspaceKeys.members(variables.workspaceId),
        (old) => {
          if (!old) return old
          return old.filter((m) => m.id !== variables.memberId)
        }
      )

      return { previousMembers }
    },
    onError: (_err, variables, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(
          workspaceKeys.members(variables.workspaceId),
          context.previousMembers
        )
      }
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: workspaceKeys.members(variables.workspaceId),
      })
      queryClient.invalidateQueries({
        queryKey: workspaceKeys.detail(variables.workspaceId),
      })
    },
  })
}

/**
 * Accept a workspace invite
 */
export function useAcceptInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (workspaceId: string) => workspaceService.acceptInvite(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: workspaceKeys.pendingInvites() })
    },
  })
}

/**
 * Decline a workspace invite
 */
export function useDeclineInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (workspaceId: string) => workspaceService.declineInvite(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.pendingInvites() })
    },
  })
}

/**
 * Leave a workspace (non-owners only)
 */
export function useLeaveWorkspace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (workspaceId: string) => workspaceService.leaveWorkspace(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() })
    },
  })
}

/**
 * Move a diagram to a workspace
 */
export function useMoveToWorkspace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      diagramId,
      workspaceId,
    }: {
      diagramId: string
      workspaceId: string | null
    }) => workspaceService.moveDiagramToWorkspace(diagramId, workspaceId),
    onSuccess: (_data, variables) => {
      // Invalidate both workspace diagrams and general diagrams list
      queryClient.invalidateQueries({ queryKey: ['diagrams'] })
      if (variables.workspaceId) {
        queryClient.invalidateQueries({
          queryKey: workspaceKeys.diagrams(variables.workspaceId),
        })
      }
    },
  })
}
