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

  /**
   * Export the full diagram (all nodes) regardless of current viewport
   * Uses offscreen clone to avoid visual glitches
   */
  async exportFullDiagramToPng(
    viewportElement: HTMLElement,
    nodes: DiagramNode[],
    options?: Partial<ExportOptions>
  ): Promise<string> {
    if (nodes.length === 0) {
      throw new Error('No nodes to export')
    }

    const padding = options?.padding ?? 50
    const bounds = getNodesBounds(nodes)

    // Calculate dimensions for the export
    const exportWidth = bounds.width + padding * 2
    const exportHeight = bounds.height + padding * 2

    // Get viewport transform to fit all nodes
    const viewport = getViewportForBounds(
      bounds,
      exportWidth,
      exportHeight,
      0.5,
      2,
      padding
    )

    // Clone the viewport element for offscreen rendering
    const clone = viewportElement.cloneNode(true) as HTMLElement
    clone.style.position = 'absolute'
    clone.style.left = '-99999px'
    clone.style.top = '-99999px'
    clone.style.transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`
    document.body.appendChild(clone)

    try {
      const dataUrl = await toPng(clone, {
        quality: options?.quality || 0.95,
        backgroundColor: options?.backgroundColor || '#ffffff',
        width: exportWidth,
        height: exportHeight,
        pixelRatio: 2,
      })
      return dataUrl
    } finally {
      document.body.removeChild(clone)
    }
  },

  /**
   * Export the full diagram as SVG
   */
  async exportFullDiagramToSvg(
    viewportElement: HTMLElement,
    nodes: DiagramNode[],
    options?: Partial<ExportOptions>
  ): Promise<string> {
    if (nodes.length === 0) {
      throw new Error('No nodes to export')
    }

    const padding = options?.padding ?? 50
    const bounds = getNodesBounds(nodes)

    const exportWidth = bounds.width + padding * 2
    const exportHeight = bounds.height + padding * 2

    const viewport = getViewportForBounds(
      bounds,
      exportWidth,
      exportHeight,
      0.5,
      2,
      padding
    )

    const clone = viewportElement.cloneNode(true) as HTMLElement
    clone.style.position = 'absolute'
    clone.style.left = '-99999px'
    clone.style.top = '-99999px'
    clone.style.transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`
    document.body.appendChild(clone)

    try {
      const dataUrl = await toSvg(clone, {
        backgroundColor: options?.backgroundColor || '#ffffff',
        width: exportWidth,
        height: exportHeight,
      })
      return dataUrl
    } finally {
      document.body.removeChild(clone)
    }
  },

  /**
   * Export the full diagram as PDF
   */
  async exportFullDiagramToPdf(
    viewportElement: HTMLElement,
    nodes: DiagramNode[],
    options?: Partial<ExportOptions>
  ): Promise<Blob> {
    const pngDataUrl = await this.exportFullDiagramToPng(viewportElement, nodes, options)

    const img = new Image()
    img.src = pngDataUrl

    await new Promise((resolve) => {
      img.onload = resolve
    })

    const pdfPadding = 20
    const width = img.width + pdfPadding * 2
    const height = img.height + pdfPadding * 2

    const pdf = new jsPDF({
      orientation: width > height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [width, height],
    })

    pdf.addImage(pngDataUrl, 'PNG', pdfPadding, pdfPadding, img.width, img.height)

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

    // Clone the element to avoid modifying the visible DOM
    const clone = element.cloneNode(true) as HTMLElement
    clone.style.position = 'absolute'
    clone.style.left = '-9999px'
    clone.style.top = '-9999px'
    clone.style.transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`
    document.body.appendChild(clone)

    try {
      const dataUrl = await toPng(clone, {
        quality: 0.8,
        backgroundColor: '#ffffff',
        width,
        height,
        pixelRatio: 1,
      })
      return dataUrl
    } finally {
      document.body.removeChild(clone)
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
