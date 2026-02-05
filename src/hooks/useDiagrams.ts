import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { diagramService } from '@/services/diagramService'
import type { Diagram, DiagramNode, DiagramEdge } from '@/types'

export const diagramKeys = {
  all: ['diagrams'] as const,
  lists: () => [...diagramKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...diagramKeys.lists(), filters] as const,
  details: () => [...diagramKeys.all, 'detail'] as const,
  detail: (id: string) => [...diagramKeys.details(), id] as const,
}

export function useDiagrams() {
  return useQuery({
    queryKey: diagramKeys.lists(),
    queryFn: () => diagramService.getAll(),
  })
}

export function useDiagram(id: string | undefined) {
  return useQuery({
    queryKey: diagramKeys.detail(id || ''),
    queryFn: () => (id ? diagramService.getById(id) : null),
    enabled: !!id,
  })
}

export function useCreateDiagram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: {
      name: string
      description?: string
      folderId?: string
      nodes: DiagramNode[]
      edges: DiagramEdge[]
    }) => diagramService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: diagramKeys.lists() })
    },
  })
}

export function useUpdateDiagram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: string
      name?: string
      description?: string
      folderId?: string
      nodes?: DiagramNode[]
      edges?: DiagramEdge[]
      thumbnail?: string
    }) => diagramService.update(id, input),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: diagramKeys.lists() })
      const previousLists = queryClient.getQueriesData<Diagram[]>({ queryKey: diagramKeys.lists() })

      previousLists.forEach(([queryKey]) => {
        queryClient.setQueryData<Diagram[]>(queryKey, (old) => {
          if (!old) return old
          return old.map((d) =>
            d.id === variables.id ? { ...d, ...variables, updatedAt: new Date().toISOString() } : d
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
      if (data) queryClient.setQueryData(diagramKeys.detail(data.id), data)
      queryClient.invalidateQueries({ queryKey: diagramKeys.lists() })
    },
  })
}

export function useDeleteDiagram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => diagramService.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: diagramKeys.lists() })
      const previousLists = queryClient.getQueriesData<Diagram[]>({ queryKey: diagramKeys.lists() })

      previousLists.forEach(([queryKey]) => {
        queryClient.setQueryData<Diagram[]>(queryKey, (old) => {
          if (!old) return old
          return old.filter((d) => d.id !== id)
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
      queryClient.removeQueries({ queryKey: diagramKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: diagramKeys.lists() })
    },
  })
}

export function useDiagramsByFolder(folderId: string | null) {
  return useQuery({
    queryKey: diagramKeys.list({ folderId }),
    queryFn: () => diagramService.getByFolder(folderId),
  })
}

export function useDuplicateDiagram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => diagramService.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: diagramKeys.lists() })
    },
  })
}

export function useMoveDiagramToFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, folderId }: { id: string; folderId: string | null }) =>
      diagramService.moveToFolder(id, folderId),
    onMutate: async ({ id, folderId }) => {
      await queryClient.cancelQueries({ queryKey: diagramKeys.lists() })
      const previousLists = queryClient.getQueriesData<Diagram[]>({ queryKey: diagramKeys.lists() })

      previousLists.forEach(([queryKey]) => {
        queryClient.setQueryData<Diagram[]>(queryKey, (old) => {
          if (!old) return old
          return old.map((d) =>
            d.id === id ? { ...d, folderId: folderId || undefined } : d
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
      if (data) queryClient.setQueryData(diagramKeys.detail(data.id), data)
      queryClient.invalidateQueries({ queryKey: diagramKeys.lists() })
    },
  })
}
