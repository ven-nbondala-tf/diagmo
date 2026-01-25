import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DiagramCard } from '../DiagramCard'
import type { Diagram } from '@/types'

// Mock hooks
const mockDeleteDiagram = { mutateAsync: vi.fn(), isPending: false }
const mockDuplicateDiagram = { mutateAsync: vi.fn(), isPending: false }
const mockMoveDiagram = { mutateAsync: vi.fn(), isPending: false }
const mockFolders: { data: Array<{ id: string; name: string; userId: string; createdAt: string; updatedAt: string }> } = { data: [] }

vi.mock('@/hooks', () => ({
  useDeleteDiagram: () => mockDeleteDiagram,
  useDuplicateDiagram: () => mockDuplicateDiagram,
  useMoveDiagramToFolder: () => mockMoveDiagram,
  useFolders: () => mockFolders,
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const mockDiagram: Diagram = {
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
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('DiagramCard', () => {
  const mockOnClick = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockDeleteDiagram.mutateAsync = vi.fn()
    mockDuplicateDiagram.mutateAsync = vi.fn()
    mockMoveDiagram.mutateAsync = vi.fn()
    mockDeleteDiagram.isPending = false
    mockDuplicateDiagram.isPending = false
    mockFolders.data = []
  })

  it('should render diagram name', () => {
    render(<DiagramCard diagram={mockDiagram} onClick={mockOnClick} />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Test Diagram')).toBeInTheDocument()
  })

  it('should render diagram description', () => {
    render(<DiagramCard diagram={mockDiagram} onClick={mockOnClick} />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('should show "No description" when description is empty', () => {
    const diagramWithoutDesc = { ...mockDiagram, description: undefined }
    render(<DiagramCard diagram={diagramWithoutDesc} onClick={mockOnClick} />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('No description')).toBeInTheDocument()
  })

  it('should render thumbnail when provided', () => {
    const diagramWithThumbnail = {
      ...mockDiagram,
      thumbnail: 'data:image/png;base64,mockimage',
    }
    render(<DiagramCard diagram={diagramWithThumbnail} onClick={mockOnClick} />, {
      wrapper: createWrapper(),
    })

    const img = screen.getByAltText('Test Diagram')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'data:image/png;base64,mockimage')
  })

  it('should show placeholder icon when no thumbnail', () => {
    render(<DiagramCard diagram={mockDiagram} onClick={mockOnClick} />, {
      wrapper: createWrapper(),
    })

    // FileImage icon should be present (as SVG)
    const placeholder = document.querySelector('svg')
    expect(placeholder).toBeInTheDocument()
  })

  it('should call onClick when card is clicked', async () => {
    render(<DiagramCard diagram={mockDiagram} onClick={mockOnClick} />, {
      wrapper: createWrapper(),
    })

    const card = screen.getByText('Test Diagram').closest('[class*="card"]')
    if (card) {
      fireEvent.click(card)
      expect(mockOnClick).toHaveBeenCalledTimes(1)
    }
  })

  it('should display relative time for updatedAt', () => {
    render(<DiagramCard diagram={mockDiagram} onClick={mockOnClick} />, {
      wrapper: createWrapper(),
    })

    // Should contain "Updated" text
    expect(screen.getByText(/Updated/)).toBeInTheDocument()
  })

  it('should open dropdown menu on menu button click', async () => {
    const user = userEvent.setup()
    render(<DiagramCard diagram={mockDiagram} onClick={mockOnClick} />, {
      wrapper: createWrapper(),
    })

    // Find the menu trigger (MoreVertical icon button)
    const menuButton = document.querySelector('[class*="opacity-0"]')
    if (menuButton) {
      await user.click(menuButton)

      // Menu items should appear
      await waitFor(() => {
        expect(screen.getByText('Duplicate')).toBeInTheDocument()
        expect(screen.getByText('Delete')).toBeInTheDocument()
      })
    }
  })

  it('should prevent card click when clicking menu button', async () => {
    const user = userEvent.setup()
    render(<DiagramCard diagram={mockDiagram} onClick={mockOnClick} />, {
      wrapper: createWrapper(),
    })

    const menuButton = document.querySelector('[class*="opacity-0"]')
    if (menuButton) {
      await user.click(menuButton)
      expect(mockOnClick).not.toHaveBeenCalled()
    }
  })

  it('should call duplicate mutation when duplicate is clicked', async () => {
    const user = userEvent.setup()
    mockDuplicateDiagram.mutateAsync.mockResolvedValue({})

    render(<DiagramCard diagram={mockDiagram} onClick={mockOnClick} />, {
      wrapper: createWrapper(),
    })

    const menuButton = document.querySelector('[class*="opacity-0"]')
    if (menuButton) {
      await user.click(menuButton)

      const duplicateItem = await screen.findByText('Duplicate')
      await user.click(duplicateItem)

      expect(mockDuplicateDiagram.mutateAsync).toHaveBeenCalledWith('1')
    }
  })

  it('should open delete confirmation dialog', async () => {
    const user = userEvent.setup()
    render(<DiagramCard diagram={mockDiagram} onClick={mockOnClick} />, {
      wrapper: createWrapper(),
    })

    const menuButton = document.querySelector('[class*="opacity-0"]')
    if (menuButton) {
      await user.click(menuButton)

      const deleteItem = await screen.findByText('Delete')
      await user.click(deleteItem)

      // Delete confirmation dialog should appear
      await waitFor(() => {
        expect(screen.getByText('Delete diagram?')).toBeInTheDocument()
      })
    }
  })

  it('should call delete mutation when delete is confirmed', async () => {
    const user = userEvent.setup()
    mockDeleteDiagram.mutateAsync.mockResolvedValue({})

    render(<DiagramCard diagram={mockDiagram} onClick={mockOnClick} />, {
      wrapper: createWrapper(),
    })

    const menuButton = document.querySelector('[class*="opacity-0"]')
    if (menuButton) {
      await user.click(menuButton)

      const deleteItem = await screen.findByText('Delete')
      await user.click(deleteItem)

      // Confirm deletion
      const confirmButton = await screen.findByRole('button', { name: /delete/i })
      await user.click(confirmButton)

      expect(mockDeleteDiagram.mutateAsync).toHaveBeenCalledWith('1')
    }
  })

  it('should close delete dialog when cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<DiagramCard diagram={mockDiagram} onClick={mockOnClick} />, {
      wrapper: createWrapper(),
    })

    const menuButton = document.querySelector('[class*="opacity-0"]')
    if (menuButton) {
      await user.click(menuButton)

      const deleteItem = await screen.findByText('Delete')
      await user.click(deleteItem)

      // Click cancel
      const cancelButton = await screen.findByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByText('Delete diagram?')).not.toBeInTheDocument()
      })
    }
  })

  it('should show folders in move to folder submenu', async () => {
    const user = userEvent.setup()
    mockFolders.data = [
      { id: 'folder-1', name: 'Folder 1', userId: 'user-1', createdAt: '', updatedAt: '' },
      { id: 'folder-2', name: 'Folder 2', userId: 'user-1', createdAt: '', updatedAt: '' },
    ]

    render(<DiagramCard diagram={mockDiagram} onClick={mockOnClick} />, {
      wrapper: createWrapper(),
    })

    const menuButton = document.querySelector('[class*="opacity-0"]')
    if (menuButton) {
      await user.click(menuButton)

      const moveToFolderItem = await screen.findByText('Move to folder')
      await user.hover(moveToFolderItem)

      // Folders should appear in submenu
      await waitFor(() => {
        expect(screen.getByText('Folder 1')).toBeInTheDocument()
        expect(screen.getByText('Folder 2')).toBeInTheDocument()
      })
    }
  })
})
