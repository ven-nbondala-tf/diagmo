import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sharingService } from '@/services/sharingService'
import type { SharePermission } from '@/types'

/**
 * Hook to get shares for a diagram
 */
export function useShares(diagramId: string) {
  return useQuery({
    queryKey: ['diagram-shares', diagramId],
    queryFn: () => sharingService.getShares(diagramId),
    enabled: !!diagramId,
  })
}

/**
 * Hook to share a diagram by email
 */
export function useShareDiagram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      diagramId,
      email,
      permission,
    }: {
      diagramId: string
      email: string
      permission: SharePermission
    }) => sharingService.shareByEmail({ diagramId, email, permission }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['diagram-shares', variables.diagramId],
      })
    },
  })
}

/**
 * Hook to update share permission
 */
export function useUpdateSharePermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      shareId,
      permission,
    }: {
      shareId: string
      permission: SharePermission
      diagramId: string
    }) => sharingService.updatePermission(shareId, permission),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['diagram-shares', variables.diagramId],
      })
    },
  })
}

/**
 * Hook to remove a share
 */
export function useRemoveShare() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      shareId,
    }: {
      shareId: string
      diagramId: string
    }) => sharingService.removeShare(shareId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['diagram-shares', variables.diagramId],
      })
    },
  })
}

/**
 * Hook to get diagrams shared with current user (IDs only)
 */
export function useSharedWithMe() {
  return useQuery({
    queryKey: ['shared-with-me'],
    queryFn: () => sharingService.getSharedWithMe(),
  })
}

/**
 * Hook to get full diagram details for shared diagrams
 */
export function useSharedDiagrams() {
  return useQuery({
    queryKey: ['shared-diagrams-full'],
    queryFn: () => sharingService.getSharedDiagramsFull(),
  })
}
