import { toPng, toSvg } from 'html-to-image'
import { jsPDF } from 'jspdf'
import { getNodesBounds, getViewportForBounds } from '@xyflow/react'
import type { ExportOptions, DiagramNode } from '@/types'

/**
 * Filter function to exclude UI elements from export
 */
function filterExportElements(node: HTMLElement | Node): boolean {
  if (!(node instanceof Element)) return true

  // Exclude React Flow UI elements
  const excludeClasses = [
    'react-flow__minimap',
    'react-flow__controls',
    'react-flow__background',
    'react-flow__panel',
    'react-flow__attribution',
  ]

  for (const cls of excludeClasses) {
    if (node.classList?.contains(cls)) {
      return false
    }
  }

  return true
}

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
   * Uses offscreen container to avoid visual glitches
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

    // Create a container for the export
    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.left = '-99999px'
    container.style.top = '0'
    container.style.width = `${exportWidth}px`
    container.style.height = `${exportHeight}px`
    container.style.overflow = 'hidden'
    container.style.backgroundColor = options?.backgroundColor || '#ffffff'

    // Clone the viewport element
    const clone = viewportElement.cloneNode(true) as HTMLElement
    // Reset any existing transform and apply our calculated one
    clone.style.position = 'absolute'
    clone.style.left = '0'
    clone.style.top = '0'
    clone.style.transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`
    clone.style.transformOrigin = 'top left'

    container.appendChild(clone)
    document.body.appendChild(container)

    try {
      const dataUrl = await toPng(container, {
        quality: options?.quality || 0.95,
        backgroundColor: options?.backgroundColor || '#ffffff',
        width: exportWidth,
        height: exportHeight,
        pixelRatio: 2,
        cacheBust: true, // Helps with loading external images
        filter: filterExportElements,
        style: {
          // Ensure visibility
          opacity: '1',
          visibility: 'visible',
        },
      })
      return dataUrl
    } finally {
      document.body.removeChild(container)
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

    // Create a container for the export
    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.left = '-99999px'
    container.style.top = '0'
    container.style.width = `${exportWidth}px`
    container.style.height = `${exportHeight}px`
    container.style.overflow = 'hidden'
    container.style.backgroundColor = options?.backgroundColor || '#ffffff'

    // Clone the viewport element
    const clone = viewportElement.cloneNode(true) as HTMLElement
    clone.style.position = 'absolute'
    clone.style.left = '0'
    clone.style.top = '0'
    clone.style.transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`
    clone.style.transformOrigin = 'top left'

    container.appendChild(clone)
    document.body.appendChild(container)

    try {
      const dataUrl = await toSvg(container, {
        backgroundColor: options?.backgroundColor || '#ffffff',
        width: exportWidth,
        height: exportHeight,
        cacheBust: true,
        filter: filterExportElements,
        style: {
          opacity: '1',
          visibility: 'visible',
        },
      })
      return dataUrl
    } finally {
      document.body.removeChild(container)
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

    // Detect current theme - check for dark class on html/body or use CSS variable
    const isDarkMode = document.documentElement.classList.contains('dark') ||
      document.body.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    const backgroundColor = isDarkMode ? '#1a1a1a' : '#ffffff'

    // Create a container for the thumbnail
    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.left = '-99999px'
    container.style.top = '0'
    container.style.width = `${width}px`
    container.style.height = `${height}px`
    container.style.overflow = 'hidden'
    container.style.backgroundColor = backgroundColor

    // Clone the element
    const clone = element.cloneNode(true) as HTMLElement
    clone.style.position = 'absolute'
    clone.style.left = '0'
    clone.style.top = '0'
    clone.style.transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`
    clone.style.transformOrigin = 'top left'

    container.appendChild(clone)
    document.body.appendChild(container)

    try {
      const dataUrl = await toPng(container, {
        quality: 0.8,
        backgroundColor,
        width,
        height,
        pixelRatio: 1,
      })
      return dataUrl
    } finally {
      document.body.removeChild(container)
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

  /**
   * Export high-resolution PNG (4x or 8x pixel ratio)
   */
  async exportHighResPng(
    viewportElement: HTMLElement,
    nodes: DiagramNode[],
    resolution: '2x' | '4x' | '8x' = '4x',
    options?: Partial<ExportOptions>
  ): Promise<string> {
    if (nodes.length === 0) {
      throw new Error('No nodes to export')
    }

    const pixelRatioMap = { '2x': 2, '4x': 4, '8x': 8 }
    const pixelRatio = pixelRatioMap[resolution]

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

    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.left = '-99999px'
    container.style.top = '0'
    container.style.width = `${exportWidth}px`
    container.style.height = `${exportHeight}px`
    container.style.overflow = 'hidden'
    container.style.backgroundColor = options?.backgroundColor || '#ffffff'

    const clone = viewportElement.cloneNode(true) as HTMLElement
    clone.style.position = 'absolute'
    clone.style.left = '0'
    clone.style.top = '0'
    clone.style.transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`
    clone.style.transformOrigin = 'top left'

    container.appendChild(clone)
    document.body.appendChild(container)

    try {
      const dataUrl = await toPng(container, {
        quality: 1.0,
        backgroundColor: options?.backgroundColor || '#ffffff',
        width: exportWidth,
        height: exportHeight,
        pixelRatio,
        cacheBust: true,
        filter: filterExportElements,
      })
      return dataUrl
    } finally {
      document.body.removeChild(container)
    }
  },

  /**
   * Export PNG with transparent background
   */
  async exportTransparentPng(
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

    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.left = '-99999px'
    container.style.top = '0'
    container.style.width = `${exportWidth}px`
    container.style.height = `${exportHeight}px`
    container.style.overflow = 'hidden'
    // Transparent background
    container.style.backgroundColor = 'transparent'

    const clone = viewportElement.cloneNode(true) as HTMLElement
    clone.style.position = 'absolute'
    clone.style.left = '0'
    clone.style.top = '0'
    clone.style.transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`
    clone.style.transformOrigin = 'top left'

    container.appendChild(clone)
    document.body.appendChild(container)

    try {
      const dataUrl = await toPng(container, {
        quality: options?.quality || 0.95,
        // No backgroundColor = transparent
        width: exportWidth,
        height: exportHeight,
        pixelRatio: options?.quality === 1 ? 4 : 2,
        cacheBust: true,
        filter: filterExportElements,
      })
      return dataUrl
    } finally {
      document.body.removeChild(container)
    }
  },

  /**
   * Copy diagram to clipboard as PNG
   */
  async copyToClipboard(
    viewportElement: HTMLElement,
    nodes: DiagramNode[],
    options?: Partial<ExportOptions>
  ): Promise<boolean> {
    try {
      const dataUrl = await this.exportFullDiagramToPng(viewportElement, nodes, options)

      // Convert data URL to blob
      const response = await fetch(dataUrl)
      const blob = await response.blob()

      // Use Clipboard API
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ])

      return true
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      return false
    }
  },

  /**
   * Copy diagram to clipboard as SVG (as text)
   */
  async copySvgToClipboard(
    viewportElement: HTMLElement,
    nodes: DiagramNode[],
    options?: Partial<ExportOptions>
  ): Promise<boolean> {
    try {
      const svgDataUrl = await this.exportFullDiagramToSvg(viewportElement, nodes, options)

      // Decode the data URL to get SVG string
      const svgPart = svgDataUrl.split(',')[1]
      if (!svgPart) {
        throw new Error('Invalid SVG data URL')
      }
      const svgString = decodeURIComponent(svgPart)

      await navigator.clipboard.writeText(svgString)
      return true
    } catch (error) {
      console.error('Failed to copy SVG to clipboard:', error)
      return false
    }
  },

  /**
   * Get export dimensions preview
   */
  getExportDimensions(
    nodes: DiagramNode[],
    padding = 50,
    pixelRatio = 2
  ): { width: number; height: number; actualWidth: number; actualHeight: number } {
    if (nodes.length === 0) {
      return { width: 0, height: 0, actualWidth: 0, actualHeight: 0 }
    }

    const bounds = getNodesBounds(nodes)
    const width = Math.ceil(bounds.width + padding * 2)
    const height = Math.ceil(bounds.height + padding * 2)

    return {
      width,
      height,
      actualWidth: width * pixelRatio,
      actualHeight: height * pixelRatio,
    }
  },
}
