import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { diagramService } from '@/services/diagramService'
import type { DiagramNode, DiagramEdge } from '@/types'

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
    onSuccess: (data) => {
      queryClient.setQueryData(diagramKeys.detail(data.id), data)
      queryClient.invalidateQueries({ queryKey: diagramKeys.lists() })
    },
  })
}

export function useDeleteDiagram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => diagramService.delete(id),
    onSuccess: (_data, id) => {
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
