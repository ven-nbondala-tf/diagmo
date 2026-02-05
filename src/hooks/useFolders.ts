import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { folderService } from '@/services/folderService'
import type { Folder } from '@/types'

export const folderKeys = {
  all: ['folders'] as const,
  lists: () => [...folderKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...folderKeys.lists(), filters] as const,
  details: () => [...folderKeys.all, 'detail'] as const,
  detail: (id: string) => [...folderKeys.details(), id] as const,
}

export function useFolders() {
  return useQuery({
    queryKey: folderKeys.lists(),
    queryFn: () => folderService.getAll(),
  })
}

export function useFolder(id: string | undefined) {
  return useQuery({
    queryKey: folderKeys.detail(id || ''),
    queryFn: () => (id ? folderService.getById(id) : null),
    enabled: !!id,
  })
}

export function useCreateFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { name: string; parentId?: string }) =>
      folderService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.lists() })
    },
  })
}

export function useUpdateFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: string
      name?: string
      parentId?: string
    }) => folderService.update(id, input),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: folderKeys.lists() })
      const previousLists = queryClient.getQueriesData<Folder[]>({ queryKey: folderKeys.lists() })

      previousLists.forEach(([queryKey]) => {
        queryClient.setQueryData<Folder[]>(queryKey, (old) => {
          if (!old) return old
          return old.map((f) =>
            f.id === variables.id ? { ...f, ...variables, updatedAt: new Date().toISOString() } : f
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
    onSettled: (data) => {
      if (data) queryClient.setQueryData(folderKeys.detail(data.id), data)
      queryClient.invalidateQueries({ queryKey: folderKeys.lists() })
    },
  })
}

export function useDeleteFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => folderService.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: folderKeys.lists() })
      const previousLists = queryClient.getQueriesData<Folder[]>({ queryKey: folderKeys.lists() })

      previousLists.forEach(([queryKey]) => {
        queryClient.setQueryData<Folder[]>(queryKey, (old) => {
          if (!old) return old
          return old.filter((f) => f.id !== id)
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
      queryClient.removeQueries({ queryKey: folderKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: folderKeys.lists() })
    },
  })
}

export function useFolderChildren(parentId: string | null) {
  return useQuery({
    queryKey: folderKeys.list({ parentId }),
    queryFn: () => folderService.getChildren(parentId),
  })
}
