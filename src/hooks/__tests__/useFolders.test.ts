import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import {
  useFolders,
  useFolder,
  useCreateFolder,
  useUpdateFolder,
  useDeleteFolder,
  useFolderChildren,
  folderKeys,
} from '../useFolders'
import { folderService } from '@/services/folderService'

// Mock the folder service
vi.mock('@/services/folderService', () => ({
  folderService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getChildren: vi.fn(),
  },
}))

const mockFolder = {
  id: '1',
  name: 'Test Folder',
  userId: 'user-1',
  parentId: undefined,
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

describe('folderKeys', () => {
  it('should generate correct query keys', () => {
    expect(folderKeys.all).toEqual(['folders'])
    expect(folderKeys.lists()).toEqual(['folders', 'list'])
    expect(folderKeys.list({ parentId: '1' })).toEqual(['folders', 'list', { parentId: '1' }])
    expect(folderKeys.details()).toEqual(['folders', 'detail'])
    expect(folderKeys.detail('1')).toEqual(['folders', 'detail', '1'])
  })
})

describe('useFolders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch all folders', async () => {
    vi.mocked(folderService.getAll).mockResolvedValue([mockFolder])

    const { result } = renderHook(() => useFolders(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([mockFolder])
    expect(folderService.getAll).toHaveBeenCalledTimes(1)
  })

  it('should handle empty folder list', async () => {
    vi.mocked(folderService.getAll).mockResolvedValue([])

    const { result } = renderHook(() => useFolders(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([])
  })

  it('should handle fetch error', async () => {
    vi.mocked(folderService.getAll).mockRejectedValue(new Error('Failed to fetch'))

    const { result } = renderHook(() => useFolders(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeDefined()
  })
})

describe('useFolder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch a single folder by id', async () => {
    vi.mocked(folderService.getById).mockResolvedValue(mockFolder)

    const { result } = renderHook(() => useFolder('1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockFolder)
    expect(folderService.getById).toHaveBeenCalledWith('1')
  })

  it('should not fetch when id is undefined', async () => {
    const { result } = renderHook(() => useFolder(undefined), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(false)
    expect(folderService.getById).not.toHaveBeenCalled()
  })

  it('should return null for non-existent folder', async () => {
    vi.mocked(folderService.getById).mockResolvedValue(null)

    const { result } = renderHook(() => useFolder('999'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBeNull()
  })
})

describe('useCreateFolder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a new folder', async () => {
    const newFolder = { ...mockFolder, id: '2', name: 'New Folder' }
    vi.mocked(folderService.create).mockResolvedValue(newFolder)

    const { result } = renderHook(() => useCreateFolder(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ name: 'New Folder' })

    expect(folderService.create).toHaveBeenCalledWith({ name: 'New Folder' })
  })

  it('should create a nested folder', async () => {
    const nestedFolder = { ...mockFolder, id: '3', name: 'Nested Folder', parentId: '1' }
    vi.mocked(folderService.create).mockResolvedValue(nestedFolder)

    const { result } = renderHook(() => useCreateFolder(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ name: 'Nested Folder', parentId: '1' })

    expect(folderService.create).toHaveBeenCalledWith({ name: 'Nested Folder', parentId: '1' })
  })

  it('should handle creation error', async () => {
    vi.mocked(folderService.create).mockRejectedValue(new Error('Creation failed'))

    const { result } = renderHook(() => useCreateFolder(), {
      wrapper: createWrapper(),
    })

    await expect(result.current.mutateAsync({ name: 'New Folder' })).rejects.toThrow(
      'Creation failed'
    )
  })
})

describe('useUpdateFolder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update a folder name', async () => {
    const updatedFolder = { ...mockFolder, name: 'Updated Folder' }
    vi.mocked(folderService.update).mockResolvedValue(updatedFolder)

    const { result } = renderHook(() => useUpdateFolder(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ id: '1', name: 'Updated Folder' })

    expect(folderService.update).toHaveBeenCalledWith('1', { name: 'Updated Folder' })
  })

  it('should update folder parent', async () => {
    const updatedFolder = { ...mockFolder, parentId: '2' }
    vi.mocked(folderService.update).mockResolvedValue(updatedFolder)

    const { result } = renderHook(() => useUpdateFolder(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ id: '1', parentId: '2' })

    expect(folderService.update).toHaveBeenCalledWith('1', { parentId: '2' })
  })
})

describe('useDeleteFolder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should delete a folder', async () => {
    vi.mocked(folderService.delete).mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeleteFolder(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync('1')

    expect(folderService.delete).toHaveBeenCalledWith('1')
  })

  it('should handle deletion error', async () => {
    vi.mocked(folderService.delete).mockRejectedValue(new Error('Deletion failed'))

    const { result } = renderHook(() => useDeleteFolder(), {
      wrapper: createWrapper(),
    })

    await expect(result.current.mutateAsync('1')).rejects.toThrow('Deletion failed')
  })
})

describe('useFolderChildren', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch child folders', async () => {
    const childFolders = [
      { ...mockFolder, id: '2', name: 'Child 1', parentId: '1' },
      { ...mockFolder, id: '3', name: 'Child 2', parentId: '1' },
    ]
    vi.mocked(folderService.getChildren).mockResolvedValue(childFolders)

    const { result } = renderHook(() => useFolderChildren('1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(childFolders)
    expect(folderService.getChildren).toHaveBeenCalledWith('1')
  })

  it('should fetch root folders when parentId is null', async () => {
    vi.mocked(folderService.getChildren).mockResolvedValue([mockFolder])

    const { result } = renderHook(() => useFolderChildren(null), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(folderService.getChildren).toHaveBeenCalledWith(null)
  })
})
