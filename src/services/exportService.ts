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
    'custom-handle', // Exclude connection handles
  ]

  for (const cls of excludeClasses) {
    if (node.classList?.contains(cls)) {
      return false
    }
  }

  return true
}

/**
 * Convert all images in the element to inline base64 to fix export issues.
 * IMPORTANT: This modifies the ORIGINAL element's images.
 */
async function inlineExternalImages(element: HTMLElement): Promise<void> {
  const images = element.querySelectorAll('img')
  const promises: Promise<void>[] = []

  images.forEach((img) => {
    // Skip already inlined images
    if (!img.src || img.src.startsWith('data:')) {
      return
    }

    const promise = new Promise<void>((resolve) => {
      // For SVG files, fetch and convert to data URI directly
      if (img.src.endsWith('.svg')) {
        const absoluteUrl = img.src.startsWith('/')
          ? `${window.location.origin}${img.src}`
          : img.src

        fetch(absoluteUrl)
          .then(res => res.text())
          .then(svgText => {
            // Convert SVG to data URI
            const encoded = encodeURIComponent(svgText)
              .replace(/'/g, '%27')
              .replace(/"/g, '%22')
            img.src = `data:image/svg+xml,${encoded}`
            resolve()
          })
          .catch(() => {
            console.warn('Failed to fetch SVG:', img.src)
            resolve()
          })
        return
      }

      // For other images, use canvas approach
      const tempImg = new Image()
      tempImg.crossOrigin = 'anonymous'
      tempImg.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = tempImg.naturalWidth || 64
          canvas.height = tempImg.naturalHeight || 64
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(tempImg, 0, 0)
            img.src = canvas.toDataURL('image/png')
          }
        } catch (e) {
          console.warn('Failed to inline image:', img.src, e)
        }
        resolve()
      }
      tempImg.onerror = () => {
        console.warn('Failed to load image:', img.src)
        resolve()
      }
      const absoluteUrl = img.src.startsWith('/')
        ? `${window.location.origin}${img.src}`
        : img.src
      tempImg.src = absoluteUrl
    })
    promises.push(promise)
  })

  await Promise.all(promises)
}

/**
 * Resolve CSS variables to actual computed values for export.
 * This ensures text colors and other CSS variable-dependent styles are captured correctly.
 */
function resolveCSSVariables(element: HTMLElement): Map<HTMLElement, string> {
  const originalStyles = new Map<HTMLElement, string>()

  // Find all elements with CSS variable-based color
  const allElements = element.querySelectorAll('*')
  const computedStyle = getComputedStyle(document.documentElement)
  const textPrimary = computedStyle.getPropertyValue('--text-primary').trim() || '#ededed'
  const bgSecondary = computedStyle.getPropertyValue('--bg-secondary').trim() || 'rgba(30,30,30,0.95)'

  allElements.forEach((el) => {
    if (el instanceof HTMLElement) {
      const style = el.style.color
      // If using CSS variable, replace with computed value
      if (style && style.includes('var(--text-primary')) {
        originalStyles.set(el, style)
        el.style.color = textPrimary
      }
      // Also check for background
      const bgStyle = el.style.backgroundColor
      if (bgStyle && bgStyle.includes('var(--bg-secondary')) {
        if (!originalStyles.has(el)) {
          originalStyles.set(el, '') // Mark as modified
        }
        el.style.backgroundColor = bgSecondary
      }
    }
  })

  return originalStyles
}

/**
 * Restore original CSS variable styles after export
 */
function restoreCSSVariables(originalStyles: Map<HTMLElement, string>): void {
  originalStyles.forEach((originalStyle, el) => {
    if (originalStyle) {
      el.style.color = originalStyle
    }
  })
}

/**
 * Resolve all CSS variables to actual values in a cloned element tree.
 * This is for export where we modify a clone and don't need to restore.
 */
function resolveAllCSSVariables(element: HTMLElement): void {
  const computedStyle = getComputedStyle(document.documentElement)

  // Common CSS variables used in the app
  const cssVars: Record<string, string> = {
    '--text-primary': computedStyle.getPropertyValue('--text-primary').trim() || '#ededed',
    '--text-secondary': computedStyle.getPropertyValue('--text-secondary').trim() || '#a1a1a1',
    '--bg-primary': computedStyle.getPropertyValue('--bg-primary').trim() || '#1c1c1c',
    '--bg-secondary': computedStyle.getPropertyValue('--bg-secondary').trim() || '#232323',
    '--foreground': computedStyle.getPropertyValue('--foreground').trim() || '#ededed',
    '--background': computedStyle.getPropertyValue('--background').trim() || '#1c1c1c',
  }

  // Walk through all elements and resolve CSS variables
  const allElements = element.querySelectorAll('*')
  allElements.forEach((el) => {
    if (el instanceof HTMLElement) {
      const style = el.style

      // Resolve color property
      if (style.color && style.color.includes('var(')) {
        for (const [varName, value] of Object.entries(cssVars)) {
          if (style.color.includes(varName)) {
            style.color = value
          }
        }
      }

      // Resolve background-color
      if (style.backgroundColor && style.backgroundColor.includes('var(')) {
        for (const [varName, value] of Object.entries(cssVars)) {
          if (style.backgroundColor.includes(varName)) {
            style.backgroundColor = value
          }
        }
      }

      // Set default text color if element has text but no explicit color
      if (!style.color && el.textContent?.trim()) {
        const computed = getComputedStyle(el)
        if (computed.color) {
          style.color = computed.color
        }
      }
    }
  })
}

/**
 * Wait for all images in an element to be loaded
 */
async function waitForImages(element: HTMLElement): Promise<void> {
  const images = element.querySelectorAll('img')
  const promises = Array.from(images).map((img) => {
    if (img.complete) return Promise.resolve()
    return new Promise<void>((resolve) => {
      img.onload = () => resolve()
      img.onerror = () => resolve()
    })
  })
  await Promise.all(promises)
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
   * Uses direct viewport manipulation for reliable export
   */
  async exportFullDiagramToPng(
    reactFlowWrapper: HTMLElement,
    nodes: DiagramNode[],
    options?: Partial<ExportOptions>
  ): Promise<string> {
    if (nodes.length === 0) {
      throw new Error('No nodes to export')
    }

    // Find the viewport element inside the wrapper
    const viewport = reactFlowWrapper.querySelector('.react-flow__viewport') as HTMLElement
    if (!viewport) {
      throw new Error('Could not find React Flow viewport element')
    }

    // Calculate bounds of all nodes
    const bounds = getNodesBounds(nodes)
    const padding = options?.padding ?? 40

    // Calculate image dimensions to fit all nodes with padding
    const imageWidth = Math.max(Math.ceil(bounds.width + padding * 2), 200)
    const imageHeight = Math.max(Math.ceil(bounds.height + padding * 2), 200)

    // Calculate simple transform: move bounds to origin + padding offset
    // No scaling - export at 1:1 with the diagram
    const translateX = -bounds.x + padding
    const translateY = -bounds.y + padding

    // Inline all external images first
    await waitForImages(viewport)
    await inlineExternalImages(viewport)

    // Store original transform and styles to restore later
    const originalTransform = viewport.style.transform
    const originalWidth = reactFlowWrapper.style.width
    const originalHeight = reactFlowWrapper.style.height

    // Apply export transform - simple translation to fit content
    viewport.style.transform = `translate(${translateX}px, ${translateY}px) scale(1)`

    // Resolve CSS variables for proper export
    const originalStyles = resolveCSSVariables(viewport)

    try {
      // Small delay to ensure DOM updates
      await new Promise(resolve => setTimeout(resolve, 100))

      const dataUrl = await toPng(reactFlowWrapper, {
        backgroundColor: options?.backgroundColor || '#ffffff',
        width: imageWidth,
        height: imageHeight,
        pixelRatio: 2,
        quality: 1.0,
        cacheBust: true,
        skipFonts: true,
        filter: filterExportElements,
        style: {
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
        },
      })

      return dataUrl
    } finally {
      // Restore original transform and styles
      viewport.style.transform = originalTransform
      reactFlowWrapper.style.width = originalWidth
      reactFlowWrapper.style.height = originalHeight
      restoreCSSVariables(originalStyles)
    }
  },

  /**
   * Export the full diagram as SVG
   * Uses direct viewport manipulation for reliable export
   */
  async exportFullDiagramToSvg(
    reactFlowWrapper: HTMLElement,
    nodes: DiagramNode[],
    options?: Partial<ExportOptions>
  ): Promise<string> {
    if (nodes.length === 0) {
      throw new Error('No nodes to export')
    }

    // Find the viewport element inside the wrapper
    const viewport = reactFlowWrapper.querySelector('.react-flow__viewport') as HTMLElement
    if (!viewport) {
      throw new Error('Could not find React Flow viewport element')
    }

    // Calculate bounds of all nodes
    const bounds = getNodesBounds(nodes)
    const padding = options?.padding ?? 40

    // Calculate image dimensions to fit all nodes with padding
    const imageWidth = Math.max(Math.ceil(bounds.width + padding * 2), 200)
    const imageHeight = Math.max(Math.ceil(bounds.height + padding * 2), 200)

    // Calculate simple transform: move bounds to origin + padding offset
    const translateX = -bounds.x + padding
    const translateY = -bounds.y + padding

    // Inline all external images first
    await waitForImages(viewport)
    await inlineExternalImages(viewport)

    // Store original transform and styles to restore later
    const originalTransform = viewport.style.transform
    const originalWidth = reactFlowWrapper.style.width
    const originalHeight = reactFlowWrapper.style.height

    // Apply export transform - simple translation to fit content
    viewport.style.transform = `translate(${translateX}px, ${translateY}px) scale(1)`

    // Resolve CSS variables for proper export
    const originalStyles = resolveCSSVariables(viewport)

    try {
      // Small delay to ensure DOM updates
      await new Promise(resolve => setTimeout(resolve, 100))

      const dataUrl = await toSvg(reactFlowWrapper, {
        backgroundColor: options?.backgroundColor || '#ffffff',
        width: imageWidth,
        height: imageHeight,
        cacheBust: true,
        skipFonts: true,
        filter: filterExportElements,
        style: {
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
        },
      })

      return dataUrl
    } finally {
      // Restore original transform and styles
      viewport.style.transform = originalTransform
      reactFlowWrapper.style.width = originalWidth
      reactFlowWrapper.style.height = originalHeight
      restoreCSSVariables(originalStyles)
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
    reactFlowWrapper: HTMLElement,
    nodes: DiagramNode[],
    width = 400,
    height = 225
  ): Promise<string> {
    if (!nodes || nodes.length === 0) {
      return ''
    }

    // Find the viewport element inside the wrapper
    const viewport = reactFlowWrapper.querySelector('.react-flow__viewport') as HTMLElement
    if (!viewport) {
      return ''
    }

    const padding = 20
    const bounds = getNodesBounds(nodes)
    const transform = getViewportForBounds(bounds, width, height, 0.5, 2, padding)

    // Detect current theme
    const isDarkMode = document.documentElement.classList.contains('dark') ||
      document.body.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    const backgroundColor = isDarkMode ? '#1a1a1a' : '#ffffff'

    // Use clone-based approach to avoid modifying original viewport
    // First inline images in the original (they'll be cloned)
    await inlineExternalImages(viewport)

    // Create offscreen container
    const container = document.createElement('div')
    container.style.cssText = `
      position: fixed;
      left: -99999px;
      top: -99999px;
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
      background: ${backgroundColor};
      z-index: -9999;
    `

    // Clone the viewport
    const clone = viewport.cloneNode(true) as HTMLElement
    clone.style.cssText = `
      position: absolute;
      left: 0;
      top: 0;
      width: ${width * 3}px;
      height: ${height * 3}px;
      transform: translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom});
      transform-origin: top left;
    `

    // Remove UI elements from clone
    clone.querySelectorAll('.react-flow__minimap, .react-flow__controls, .react-flow__panel, .react-flow__attribution, .custom-handle').forEach(el => el.remove())

    container.appendChild(clone)
    document.body.appendChild(container)

    try {
      await new Promise(resolve => setTimeout(resolve, 50))

      const dataUrl = await toPng(container, {
        quality: 0.8,
        backgroundColor,
        width,
        height,
        pixelRatio: 1,
        skipFonts: true,
      })
      return dataUrl
    } catch (error) {
      console.warn('Thumbnail generation failed, returning empty:', error)
      return ''
    } finally {
      // Clean up
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
    reactFlowWrapper: HTMLElement,
    nodes: DiagramNode[],
    resolution: '2x' | '4x' | '8x' = '4x',
    options?: Partial<ExportOptions>
  ): Promise<string> {
    if (nodes.length === 0) {
      throw new Error('No nodes to export')
    }

    // Find the viewport element inside the wrapper
    const viewport = reactFlowWrapper.querySelector('.react-flow__viewport') as HTMLElement
    if (!viewport) {
      throw new Error('Could not find React Flow viewport element')
    }

    const pixelRatioMap = { '2x': 2, '4x': 4, '8x': 8 }
    const pixelRatio = pixelRatioMap[resolution]

    const padding = options?.padding ?? 40
    const bounds = getNodesBounds(nodes)
    const imageWidth = Math.max(Math.ceil(bounds.width + padding * 2), 100)
    const imageHeight = Math.max(Math.ceil(bounds.height + padding * 2), 100)

    // Calculate simple transform: move bounds to origin + padding offset
    const translateX = -bounds.x + padding
    const translateY = -bounds.y + padding

    // Store original transform to restore later
    const originalTransform = viewport.style.transform

    // Apply export transform - simple translation to fit content
    viewport.style.transform = `translate(${translateX}px, ${translateY}px) scale(1)`

    try {
      await new Promise(resolve => setTimeout(resolve, 50))

      const dataUrl = await toPng(viewport, {
        quality: 1.0,
        backgroundColor: options?.backgroundColor || '#ffffff',
        width: imageWidth,
        height: imageHeight,
        pixelRatio,
        cacheBust: true,
        skipFonts: true,
        style: {
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        },
        filter: filterExportElements,
      })
      return dataUrl
    } finally {
      // Restore original transform
      viewport.style.transform = originalTransform
    }
  },

  /**
   * Export PNG with transparent background
   */
  async exportTransparentPng(
    reactFlowWrapper: HTMLElement,
    nodes: DiagramNode[],
    options?: Partial<ExportOptions>
  ): Promise<string> {
    if (nodes.length === 0) {
      throw new Error('No nodes to export')
    }

    // Find the viewport element inside the wrapper
    const viewport = reactFlowWrapper.querySelector('.react-flow__viewport') as HTMLElement
    if (!viewport) {
      throw new Error('Could not find React Flow viewport element')
    }

    const padding = options?.padding ?? 40
    const bounds = getNodesBounds(nodes)
    const imageWidth = Math.max(Math.ceil(bounds.width + padding * 2), 100)
    const imageHeight = Math.max(Math.ceil(bounds.height + padding * 2), 100)

    // Calculate simple transform: move bounds to origin + padding offset
    const translateX = -bounds.x + padding
    const translateY = -bounds.y + padding

    // Store original transform to restore later
    const originalTransform = viewport.style.transform

    // Apply export transform - simple translation to fit content
    viewport.style.transform = `translate(${translateX}px, ${translateY}px) scale(1)`

    try {
      await new Promise(resolve => setTimeout(resolve, 50))

      const dataUrl = await toPng(viewport, {
        quality: options?.quality || 0.95,
        // No backgroundColor = transparent
        width: imageWidth,
        height: imageHeight,
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: true,
        style: {
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        },
        filter: filterExportElements,
      })
      return dataUrl
    } finally {
      // Restore original transform
      viewport.style.transform = originalTransform
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
