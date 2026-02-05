import { toPng, toSvg } from 'html-to-image'
import { jsPDF } from 'jspdf'
import { getNodesBounds, getViewportForBounds } from '@xyflow/react'
import type { ExportOptions, DiagramNode } from '@/types'

export const exportService = {
  async exportToPng(
    element: HTMLElement,
    options?: Partial<ExportOptions>
  ): Promise<string> {
    const dataUrl = await toPng(element, {
      quality: options?.quality || 0.95,
      backgroundColor: options?.backgroundColor || '#ffffff',
      pixelRatio: 2,
      ...(options?.width ? { width: options.width } : {}),
      ...(options?.height ? { height: options.height } : {}),
    })
    return dataUrl
  },

  async exportToSvg(
    element: HTMLElement,
    options?: Partial<ExportOptions>
  ): Promise<string> {
    const dataUrl = await toSvg(element, {
      backgroundColor: options?.backgroundColor || '#ffffff',
      ...(options?.width ? { width: options.width } : {}),
      ...(options?.height ? { height: options.height } : {}),
    })
    return dataUrl
  },

  async exportToPdf(
    element: HTMLElement,
    options?: Partial<ExportOptions>
  ): Promise<Blob> {
    const pngDataUrl = await toPng(element, {
      quality: options?.quality || 0.95,
      backgroundColor: options?.backgroundColor || '#ffffff',
      pixelRatio: 2,
      ...(options?.width ? { width: options.width } : {}),
      ...(options?.height ? { height: options.height } : {}),
    })

    const img = new Image()
    img.src = pngDataUrl

    await new Promise((resolve) => {
      img.onload = resolve
    })

    const padding = options?.padding || 20
    const width = img.width + padding * 2
    const height = img.height + padding * 2

    const pdf = new jsPDF({
      orientation: width > height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [width, height],
    })

    pdf.addImage(pngDataUrl, 'PNG', padding, padding, img.width, img.height)

    return pdf.output('blob')
  },

  async generateThumbnail(
    element: HTMLElement,
    nodes: DiagramNode[],
    width = 400,
    height = 225
  ): Promise<string> {
    const padding = 20
    const bounds = getNodesBounds(nodes)
    const viewport = getViewportForBounds(bounds, width, height, 0.5, 2, padding)

    const originalTransform = element.style.transform
    element.style.transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`

    try {
      const dataUrl = await toPng(element, {
        quality: 0.8,
        backgroundColor: '#ffffff',
        width,
        height,
        pixelRatio: 1,
      })
      return dataUrl
    } finally {
      element.style.transform = originalTransform
    }
  },

  downloadFile(data: string | Blob, filename: string): void {
    const link = document.createElement('a')
    if (typeof data === 'string') {
      link.href = data
    } else {
      link.href = URL.createObjectURL(data)
    }
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    if (typeof data !== 'string') {
      URL.revokeObjectURL(link.href)
    }
  },
}
