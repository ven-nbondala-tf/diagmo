import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { shapeLibraryService } from '@/services/shapeLibraryService'
import type { ShapeLibrary, CustomShape } from '@/types'

export const shapeLibraryKeys = {
  all: ['shapeLibraries'] as const,
  lists: () => [...shapeLibraryKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...shapeLibraryKeys.lists(), filters] as const,
  details: () => [...shapeLibraryKeys.all, 'detail'] as const,
  detail: (id: string) => [...shapeLibraryKeys.details(), id] as const,
  shapes: (libraryId: string) => [...shapeLibraryKeys.all, 'shapes', libraryId] as const,
}

// ========== Library Hooks ==========

export function useShapeLibraries() {
  return useQuery({
    queryKey: shapeLibraryKeys.lists(),
    queryFn: () => shapeLibraryService.getLibraries(),
  })
}

export function usePublicShapeLibraries() {
  return useQuery({
    queryKey: shapeLibraryKeys.list({ public: true }),
    queryFn: () => shapeLibraryService.getPublicLibraries(),
  })
}

export function useShapeLibrary(id: string | undefined) {
  return useQuery({
    queryKey: shapeLibraryKeys.detail(id || ''),
    queryFn: () => (id ? shapeLibraryService.getLibraryById(id) : null),
    enabled: !!id,
  })
}

export function useCreateShapeLibrary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { name: string; description?: string; isPublic?: boolean }) =>
      shapeLibraryService.createLibrary(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shapeLibraryKeys.lists() })
    },
  })
}

export function useUpdateShapeLibrary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: string
      name?: string
      description?: string
      isPublic?: boolean
    }) => shapeLibraryService.updateLibrary(id, input),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: shapeLibraryKeys.lists() })
      const previousLists = queryClient.getQueriesData<ShapeLibrary[]>({ queryKey: shapeLibraryKeys.lists() })

      previousLists.forEach(([queryKey]) => {
        queryClient.setQueryData<ShapeLibrary[]>(queryKey, (old) => {
          if (!old) return old
          return old.map((lib) =>
            lib.id === variables.id ? { ...lib, ...variables, updatedAt: new Date().toISOString() } : lib
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
      if (data) queryClient.setQueryData(shapeLibraryKeys.detail(data.id), data)
      queryClient.invalidateQueries({ queryKey: shapeLibraryKeys.lists() })
    },
  })
}

export function useDeleteShapeLibrary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => shapeLibraryService.deleteLibrary(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: shapeLibraryKeys.lists() })
      const previousLists = queryClient.getQueriesData<ShapeLibrary[]>({ queryKey: shapeLibraryKeys.lists() })

      previousLists.forEach(([queryKey]) => {
        queryClient.setQueryData<ShapeLibrary[]>(queryKey, (old) => {
          if (!old) return old
          return old.filter((lib) => lib.id !== id)
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
      queryClient.removeQueries({ queryKey: shapeLibraryKeys.detail(id) })
      queryClient.removeQueries({ queryKey: shapeLibraryKeys.shapes(id) })
      queryClient.invalidateQueries({ queryKey: shapeLibraryKeys.lists() })
    },
  })
}

// ========== Shape Hooks ==========

export function useShapesByLibrary(libraryId: string | undefined) {
  return useQuery({
    queryKey: shapeLibraryKeys.shapes(libraryId || ''),
    queryFn: () => (libraryId ? shapeLibraryService.getShapesByLibrary(libraryId) : []),
    enabled: !!libraryId,
  })
}

export function useCreateShape() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { libraryId: string; name: string; svgContent: string; category?: string }) =>
      shapeLibraryService.createShape(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: shapeLibraryKeys.shapes(data.libraryId) })
    },
  })
}

export function useUpdateShape() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      libraryId,
      ...input
    }: {
      id: string
      libraryId: string
      name?: string
      category?: string
    }) => shapeLibraryService.updateShape(id, input),
    onMutate: async (variables) => {
      const { libraryId } = variables
      await queryClient.cancelQueries({ queryKey: shapeLibraryKeys.shapes(libraryId) })
      const previousShapes = queryClient.getQueryData<CustomShape[]>(shapeLibraryKeys.shapes(libraryId))

      queryClient.setQueryData<CustomShape[]>(shapeLibraryKeys.shapes(libraryId), (old) => {
        if (!old) return old
        return old.map((shape) =>
          shape.id === variables.id ? { ...shape, ...variables } : shape
        )
      })

      return { previousShapes, libraryId }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousShapes && context?.libraryId) {
        queryClient.setQueryData(shapeLibraryKeys.shapes(context.libraryId), context.previousShapes)
      }
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: shapeLibraryKeys.shapes(variables.libraryId) })
    },
  })
}

export function useDeleteShape() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, libraryId: _libraryId }: { id: string; libraryId: string }) =>
      shapeLibraryService.deleteShape(id),
    onMutate: async ({ id, libraryId }) => {
      await queryClient.cancelQueries({ queryKey: shapeLibraryKeys.shapes(libraryId) })
      const previousShapes = queryClient.getQueryData<CustomShape[]>(shapeLibraryKeys.shapes(libraryId))

      queryClient.setQueryData<CustomShape[]>(shapeLibraryKeys.shapes(libraryId), (old) => {
        if (!old) return old
        return old.filter((shape) => shape.id !== id)
      })

      return { previousShapes, libraryId }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousShapes && context?.libraryId) {
        queryClient.setQueryData(shapeLibraryKeys.shapes(context.libraryId), context.previousShapes)
      }
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: shapeLibraryKeys.shapes(variables.libraryId) })
    },
  })
}

// ========== Upload Hook ==========

export function useUploadShape() {
  const createShape = useCreateShape()

  return useMutation({
    mutationFn: async ({ libraryId, file, name }: { libraryId: string; file: File; name: string }) => {
      const svgContent = await shapeLibraryService.processUploadedFile(file)
      return createShape.mutateAsync({ libraryId, name, svgContent })
    },
  })
}
