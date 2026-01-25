import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import {
  useDiagrams,
  useDiagram,
  useCreateDiagram,
  useUpdateDiagram,
  useDeleteDiagram,
  useDuplicateDiagram,
  useMoveDiagramToFolder,
  diagramKeys,
} from '../useDiagrams'
import { diagramService } from '@/services/diagramService'

// Mock the diagram service
vi.mock('@/services/diagramService', () => ({
  diagramService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getByFolder: vi.fn(),
    duplicate: vi.fn(),
    moveToFolder: vi.fn(),
  },
}))

const mockDiagram = {
  id: '1',
  name: 'Test Diagram',
  description: 'Test description',
  userId: 'user-1',
  folderId: undefined,
  nodes: [],
  edges: [],
  thumbnail: undefined,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('diagramKeys', () => {
  it('should generate correct query keys', () => {
    expect(diagramKeys.all).toEqual(['diagrams'])
    expect(diagramKeys.lists()).toEqual(['diagrams', 'list'])
    expect(diagramKeys.list({ folderId: '1' })).toEqual(['diagrams', 'list', { folderId: '1' }])
    expect(diagramKeys.details()).toEqual(['diagrams', 'detail'])
    expect(diagramKeys.detail('1')).toEqual(['diagrams', 'detail', '1'])
  })
})

describe('useDiagrams', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch diagrams', async () => {
    vi.mocked(diagramService.getAll).mockResolvedValue([mockDiagram])

    const { result } = renderHook(() => useDiagrams(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([mockDiagram])
    expect(diagramService.getAll).toHaveBeenCalledTimes(1)
  })

  it('should handle fetch error', async () => {
    vi.mocked(diagramService.getAll).mockRejectedValue(new Error('Failed to fetch'))

    const { result } = renderHook(() => useDiagrams(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeDefined()
  })
})

describe('useDiagram', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch a single diagram by id', async () => {
    vi.mocked(diagramService.getById).mockResolvedValue(mockDiagram)

    const { result } = renderHook(() => useDiagram('1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockDiagram)
    expect(diagramService.getById).toHaveBeenCalledWith('1')
  })

  it('should not fetch when id is undefined', async () => {
    const { result } = renderHook(() => useDiagram(undefined), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(false)
    expect(diagramService.getById).not.toHaveBeenCalled()
  })

  it('should return null for non-existent diagram', async () => {
    vi.mocked(diagramService.getById).mockResolvedValue(null)

    const { result } = renderHook(() => useDiagram('999'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBeNull()
  })
})

describe('useCreateDiagram', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a new diagram', async () => {
    const newDiagram = { ...mockDiagram, id: '2', name: 'New Diagram' }
    vi.mocked(diagramService.create).mockResolvedValue(newDiagram)

    const { result } = renderHook(() => useCreateDiagram(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({
      name: 'New Diagram',
      nodes: [],
      edges: [],
    })

    expect(diagramService.create).toHaveBeenCalledWith({
      name: 'New Diagram',
      nodes: [],
      edges: [],
    })
  })

  it('should handle creation error', async () => {
    vi.mocked(diagramService.create).mockRejectedValue(new Error('Creation failed'))

    const { result } = renderHook(() => useCreateDiagram(), {
      wrapper: createWrapper(),
    })

    await expect(
      result.current.mutateAsync({
        name: 'New Diagram',
        nodes: [],
        edges: [],
      })
    ).rejects.toThrow('Creation failed')
  })
})

describe('useUpdateDiagram', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update a diagram', async () => {
    const updatedDiagram = { ...mockDiagram, name: 'Updated Diagram' }
    vi.mocked(diagramService.update).mockResolvedValue(updatedDiagram)

    const { result } = renderHook(() => useUpdateDiagram(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({
      id: '1',
      name: 'Updated Diagram',
    })

    expect(diagramService.update).toHaveBeenCalledWith('1', { name: 'Updated Diagram' })
  })
})

describe('useDeleteDiagram', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should delete a diagram', async () => {
    vi.mocked(diagramService.delete).mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeleteDiagram(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync('1')

    expect(diagramService.delete).toHaveBeenCalledWith('1')
  })
})

describe('useDuplicateDiagram', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should duplicate a diagram', async () => {
    const duplicatedDiagram = { ...mockDiagram, id: '3', name: 'Test Diagram (Copy)' }
    vi.mocked(diagramService.duplicate).mockResolvedValue(duplicatedDiagram)

    const { result } = renderHook(() => useDuplicateDiagram(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync('1')

    expect(diagramService.duplicate).toHaveBeenCalledWith('1')
  })
})

describe('useMoveDiagramToFolder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should move diagram to folder', async () => {
    const movedDiagram = { ...mockDiagram, folderId: 'folder-1' }
    vi.mocked(diagramService.moveToFolder).mockResolvedValue(movedDiagram)

    const { result } = renderHook(() => useMoveDiagramToFolder(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ id: '1', folderId: 'folder-1' })

    expect(diagramService.moveToFolder).toHaveBeenCalledWith('1', 'folder-1')
  })

  it('should move diagram to root (null folder)', async () => {
    const movedDiagram = { ...mockDiagram, folderId: undefined }
    vi.mocked(diagramService.moveToFolder).mockResolvedValue(movedDiagram)

    const { result } = renderHook(() => useMoveDiagramToFolder(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ id: '1', folderId: null })

    expect(diagramService.moveToFolder).toHaveBeenCalledWith('1', null)
  })
})
