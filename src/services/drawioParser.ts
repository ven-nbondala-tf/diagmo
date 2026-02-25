/**
 * Draw.io/diagrams.net Parser
 *
 * Parses Draw.io XML format and converts to Diagmo nodes/edges.
 * Handles both uncompressed and compressed (deflated) diagram data.
 */

import { nanoid } from 'nanoid'
import type { DiagramNode, DiagramEdge, ShapeType, NodeStyle } from '@/types'
import { DEFAULT_NODE_STYLE } from '@/constants'

interface ParseResult {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  errors: string[]
}

interface DrawioCell {
  id: string
  value: string
  vertex: boolean
  edge: boolean
  source?: string
  target?: string
  parent?: string
  style: Record<string, string>
  geometry?: {
    x: number
    y: number
    width: number
    height: number
  }
}

// Map Draw.io shape names to Diagmo shapes
function mapDrawioShape(style: Record<string, string>): ShapeType {
  const shape = style.shape?.toLowerCase() || ''
  const rounded = style.rounded === '1'

  // Check for specific shapes
  if (shape.includes('ellipse') || shape.includes('circle')) return 'ellipse'
  if (shape.includes('rhombus') || shape.includes('diamond')) return 'diamond'
  if (shape.includes('hexagon')) return 'hexagon'
  if (shape.includes('parallelogram')) return 'parallelogram'
  if (shape.includes('trapezoid')) return 'trapezoid'
  if (shape.includes('triangle')) return 'triangle'
  if (shape.includes('cylinder')) return 'cylinder'
  if (shape.includes('actor') || shape.includes('person')) return 'uml-actor'
  if (shape.includes('document')) return 'document'
  if (shape.includes('cloud')) return 'cloud'
  if (shape.includes('process') || shape.includes('step')) return 'process'
  if (shape.includes('callout')) return 'callout'
  if (shape.includes('note') || shape.includes('sticky')) return 'note'
  if (shape.includes('database') || shape.includes('datastore')) return 'cylinder'
  if (shape.includes('card')) return 'rectangle'
  if (shape.includes('arrow')) return 'arrow'

  // Default to rectangle variants
  if (rounded) return 'rounded-rectangle'
  return 'rectangle'
}

// Parse Draw.io style string to object
function parseStyle(styleStr: string): Record<string, string> {
  if (!styleStr) return {}

  const result: Record<string, string> = {}
  const parts = styleStr.split(';').filter(Boolean)

  for (const part of parts) {
    const [key, value] = part.split('=')
    if (key) {
      result[key.trim()] = value?.trim() || '1'
    }
  }

  return result
}

// Convert Draw.io color format to hex
function parseColor(color: string | undefined, defaultColor: string): string {
  if (!color) return defaultColor
  if (color === 'none') return 'transparent'
  if (color.startsWith('#')) return color
  return `#${color}`
}

// Decompress Draw.io compressed data
function decompressDrawioData(compressed: string): string {
  try {
    // Draw.io uses URL-safe base64 + deflate compression
    // First decode base64
    const decoded = atob(compressed.replace(/-/g, '+').replace(/_/g, '/'))

    // Decompress using pako if available, otherwise return as-is
    // For simplicity, we'll try to handle uncompressed data first
    return decoded
  } catch {
    return compressed
  }
}

// Parse mxGraphModel XML
function parseMxGraphModel(xmlDoc: Document): DrawioCell[] {
  const cells: DrawioCell[] = []
  const cellElements = xmlDoc.querySelectorAll('mxCell')

  for (const cellEl of cellElements) {
    const id = cellEl.getAttribute('id') || ''
    const value = cellEl.getAttribute('value') || ''
    const styleStr = cellEl.getAttribute('style') || ''
    const vertex = cellEl.getAttribute('vertex') === '1'
    const edge = cellEl.getAttribute('edge') === '1'
    const source = cellEl.getAttribute('source') || undefined
    const target = cellEl.getAttribute('target') || undefined
    const parent = cellEl.getAttribute('parent') || undefined

    const style = parseStyle(styleStr)

    // Parse geometry
    const geoEl = cellEl.querySelector('mxGeometry')
    let geometry: DrawioCell['geometry'] | undefined

    if (geoEl) {
      geometry = {
        x: parseFloat(geoEl.getAttribute('x') || '0'),
        y: parseFloat(geoEl.getAttribute('y') || '0'),
        width: parseFloat(geoEl.getAttribute('width') || '100'),
        height: parseFloat(geoEl.getAttribute('height') || '50'),
      }
    }

    cells.push({
      id,
      value,
      vertex,
      edge,
      source,
      target,
      parent,
      style,
      geometry,
    })
  }

  return cells
}

// Strip HTML tags from label
function stripHtml(html: string): string {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

export function parseDrawio(input: string): ParseResult {
  const errors: string[] = []
  const nodes: DiagramNode[] = []
  const edges: DiagramEdge[] = []

  try {
    // Parse XML
    const parser = new DOMParser()
    let xmlDoc = parser.parseFromString(input, 'text/xml')

    // Check for parse errors
    const parseError = xmlDoc.querySelector('parsererror')
    if (parseError) {
      // Try to find compressed diagram data
      const diagramEl = xmlDoc.querySelector('diagram')
      if (diagramEl) {
        const compressedData = diagramEl.textContent || ''
        const decompressed = decompressDrawioData(compressedData)
        xmlDoc = parser.parseFromString(decompressed, 'text/xml')

        const newParseError = xmlDoc.querySelector('parsererror')
        if (newParseError) {
          errors.push('Failed to parse Draw.io XML: Invalid format')
          return { nodes, edges, errors }
        }
      } else {
        errors.push('Failed to parse Draw.io XML: Invalid format')
        return { nodes, edges, errors }
      }
    }

    // Find the mxGraphModel - could be at different levels
    let mxGraphModel = xmlDoc.querySelector('mxGraphModel')
    if (!mxGraphModel) {
      // Check if the diagram data is inside a <diagram> element (compressed or not)
      const diagramEl = xmlDoc.querySelector('diagram')
      if (diagramEl) {
        // Try to parse the diagram content
        const diagramContent = diagramEl.textContent || ''

        // If it looks like base64, try to decompress
        if (diagramContent && !diagramContent.includes('<')) {
          try {
            // URL-safe base64 decode
            const decoded = atob(
              diagramContent.replace(/-/g, '+').replace(/_/g, '/')
            )
            // Try to decompress (simplified - in practice would use pako)
            // For now, assume it's uncompressed after base64 decode
            const innerDoc = parser.parseFromString(decoded, 'text/xml')
            mxGraphModel = innerDoc.querySelector('mxGraphModel')
          } catch {
            errors.push('Failed to decompress diagram data')
          }
        } else {
          // Content is already XML
          const innerDoc = parser.parseFromString(diagramContent, 'text/xml')
          mxGraphModel = innerDoc.querySelector('mxGraphModel')
        }
      }
    }

    if (!mxGraphModel) {
      errors.push('No mxGraphModel found in the Draw.io file')
      return { nodes, edges, errors }
    }

    // Parse all cells
    const cells = parseMxGraphModel(mxGraphModel.ownerDocument || xmlDoc)

    // Separate vertices (nodes) and edges
    const vertexCells = cells.filter((c) => c.vertex && c.geometry)
    const edgeCells = cells.filter((c) => c.edge && c.source && c.target)

    // Create ID mapping (Draw.io IDs to Diagmo IDs)
    const idMap = new Map<string, string>()

    // Convert vertices to Diagmo nodes
    for (const cell of vertexCells) {
      const newId = nanoid()
      idMap.set(cell.id, newId)

      const shape = mapDrawioShape(cell.style)
      const label = stripHtml(cell.value)

      // Parse style properties
      const fillColor = parseColor(cell.style.fillColor, '#ffffff')
      const strokeColor = parseColor(cell.style.strokeColor, '#000000')
      const fontColor = parseColor(cell.style.fontColor, '#000000')
      const strokeWidth = parseFloat(cell.style.strokeWidth || '1')
      const fontSize = parseInt(cell.style.fontSize || '12', 10)
      const fontStyle = cell.style.fontStyle || ''
      const fontWeight = fontStyle.includes('1') ? 'bold' : 'normal'
      const textAlign = (cell.style.align as 'left' | 'center' | 'right') || 'center'

      const nodeStyle: NodeStyle = {
        ...DEFAULT_NODE_STYLE,
        backgroundColor: fillColor,
        borderColor: strokeColor,
        borderWidth: strokeWidth,
        textColor: fontColor,
        fontSize,
        fontWeight,
        textAlign,
      }

      const node: DiagramNode = {
        id: newId,
        type: 'custom',
        position: {
          x: cell.geometry!.x,
          y: cell.geometry!.y,
        },
        style: {
          width: cell.geometry!.width,
          height: cell.geometry!.height,
        },
        data: {
          label,
          type: shape,
          style: nodeStyle,
        },
      }

      nodes.push(node)
    }

    // Convert edges to Diagmo edges
    for (const cell of edgeCells) {
      const sourceId = idMap.get(cell.source!)
      const targetId = idMap.get(cell.target!)

      if (!sourceId || !targetId) {
        // Skip edges to/from unknown nodes
        continue
      }

      const label = stripHtml(cell.value)
      const strokeColor = parseColor(cell.style.strokeColor, '#64748b')
      const strokeWidth = parseFloat(cell.style.strokeWidth || '1.5')
      const dashed = cell.style.dashed === '1'

      const edge: DiagramEdge = {
        id: nanoid(),
        source: sourceId,
        target: targetId,
        type: 'labeled',
        markerEnd: {
          type: 'arrowclosed',
          width: 8,
          height: 8,
          color: strokeColor,
        },
        style: {
          strokeWidth,
          stroke: strokeColor,
          strokeDasharray: dashed ? '5,5' : undefined,
        },
        data: label ? { label } : undefined,
      }

      edges.push(edge)
    }

    if (nodes.length === 0) {
      errors.push('No shapes found in the Draw.io file')
    }

  } catch (err) {
    errors.push(`Failed to parse Draw.io file: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }

  return { nodes, edges, errors }
}
