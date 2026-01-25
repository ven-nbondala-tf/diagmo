import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useExport } from '../useExport'
import { exportService } from '@/services/exportService'

// Mock the export service
vi.mock('@/services/exportService', () => ({
  exportService: {
    exportToPng: vi.fn(),
    exportToSvg: vi.fn(),
    exportToPdf: vi.fn(),
    downloadFile: vi.fn(),
  },
}))

describe('useExport', () => {
  const mockElement = document.createElement('div')
  const mockDataUrl = 'data:image/png;base64,mockdata'
  const mockBlob = new Blob(['mock pdf'], { type: 'application/pdf' })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have initial state', () => {
    const { result } = renderHook(() => useExport())

    expect(result.current.exporting).toBe(false)
    expect(result.current.error).toBeNull()
    expect(typeof result.current.exportDiagram).toBe('function')
  })

  it('should export to PNG', async () => {
    vi.mocked(exportService.exportToPng).mockResolvedValue(mockDataUrl)

    const { result } = renderHook(() => useExport())

    await act(async () => {
      await result.current.exportDiagram(mockElement, 'test-diagram', 'png')
    })

    expect(exportService.exportToPng).toHaveBeenCalledWith(mockElement, undefined)
    expect(exportService.downloadFile).toHaveBeenCalledWith(mockDataUrl, 'test-diagram.png')
    expect(result.current.exporting).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should export to SVG', async () => {
    vi.mocked(exportService.exportToSvg).mockResolvedValue(mockDataUrl)

    const { result } = renderHook(() => useExport())

    await act(async () => {
      await result.current.exportDiagram(mockElement, 'test-diagram', 'svg')
    })

    expect(exportService.exportToSvg).toHaveBeenCalledWith(mockElement, undefined)
    expect(exportService.downloadFile).toHaveBeenCalledWith(mockDataUrl, 'test-diagram.svg')
    expect(result.current.exporting).toBe(false)
  })

  it('should export to PDF', async () => {
    vi.mocked(exportService.exportToPdf).mockResolvedValue(mockBlob)

    const { result } = renderHook(() => useExport())

    await act(async () => {
      await result.current.exportDiagram(mockElement, 'test-diagram', 'pdf')
    })

    expect(exportService.exportToPdf).toHaveBeenCalledWith(mockElement, undefined)
    expect(exportService.downloadFile).toHaveBeenCalledWith(mockBlob, 'test-diagram.pdf')
    expect(result.current.exporting).toBe(false)
  })

  it('should pass options to export service', async () => {
    vi.mocked(exportService.exportToPng).mockResolvedValue(mockDataUrl)
    const options = { quality: 0.8, backgroundColor: '#f0f0f0' }

    const { result } = renderHook(() => useExport())

    await act(async () => {
      await result.current.exportDiagram(mockElement, 'test-diagram', 'png', options)
    })

    expect(exportService.exportToPng).toHaveBeenCalledWith(mockElement, options)
  })

  it('should set exporting state while exporting', async () => {
    vi.mocked(exportService.exportToPng).mockResolvedValue(mockDataUrl)

    const { result } = renderHook(() => useExport())

    // Start export
    await act(async () => {
      await result.current.exportDiagram(mockElement, 'test', 'png')
    })

    // After export completes, exporting should be false
    expect(result.current.exporting).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should handle export errors', async () => {
    const errorMessage = 'Export failed'
    vi.mocked(exportService.exportToPng).mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => useExport())

    let error: Error | undefined
    await act(async () => {
      try {
        await result.current.exportDiagram(mockElement, 'test', 'png')
      } catch (e) {
        error = e as Error
      }
    })

    expect(error?.message).toBe(errorMessage)
    expect(result.current.error).toBe(errorMessage)
    expect(result.current.exporting).toBe(false)
  })

  it('should handle non-Error objects in catch', async () => {
    vi.mocked(exportService.exportToPng).mockRejectedValue('string error')

    const { result } = renderHook(() => useExport())

    let caughtError: unknown
    await act(async () => {
      try {
        await result.current.exportDiagram(mockElement, 'test', 'png')
      } catch (e) {
        caughtError = e
      }
    })

    expect(caughtError).toBe('string error')
    expect(result.current.error).toBe('Export failed')
  })

  it('should clear error on successful export', async () => {
    vi.mocked(exportService.exportToPng)
      .mockRejectedValueOnce(new Error('First error'))
      .mockResolvedValueOnce(mockDataUrl)

    const { result } = renderHook(() => useExport())

    // First export fails
    await act(async () => {
      try {
        await result.current.exportDiagram(mockElement, 'test', 'png')
      } catch {
        // Expected to throw
      }
    })

    expect(result.current.error).toBe('First error')

    // Second export succeeds
    await act(async () => {
      await result.current.exportDiagram(mockElement, 'test', 'png')
    })

    expect(result.current.error).toBeNull()
  })
})
