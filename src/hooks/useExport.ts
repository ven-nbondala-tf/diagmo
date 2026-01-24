import { useCallback, useState } from 'react'
import { exportService } from '@/services/exportService'
import type { ExportFormat, ExportOptions } from '@/types'

export function useExport() {
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exportDiagram = useCallback(
    async (
      element: HTMLElement,
      filename: string,
      format: ExportFormat,
      options?: Partial<ExportOptions>
    ) => {
      setExporting(true)
      setError(null)

      try {
        switch (format) {
          case 'png': {
            const dataUrl = await exportService.exportToPng(element, options)
            exportService.downloadFile(dataUrl, `${filename}.png`)
            break
          }
          case 'svg': {
            const dataUrl = await exportService.exportToSvg(element, options)
            exportService.downloadFile(dataUrl, `${filename}.svg`)
            break
          }
          case 'pdf': {
            const blob = await exportService.exportToPdf(element, options)
            exportService.downloadFile(blob, `${filename}.pdf`)
            break
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Export failed')
        throw err
      } finally {
        setExporting(false)
      }
    },
    []
  )

  return { exportDiagram, exporting, error }
}
