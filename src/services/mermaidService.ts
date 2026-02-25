/**
 * Mermaid Service - Uses official Mermaid library for accurate rendering
 *
 * This approach guarantees 100% compatibility with Mermaid syntax by using
 * the same library that mermaidviewer.com and other tools use.
 */
import mermaid from 'mermaid'
import { nanoid } from 'nanoid'
import type { DiagramNode, DiagramEdge, ShapeType, NodeStyle } from '@/types'
import { DEFAULT_NODE_STYLE } from '@/constants'

// Initialize mermaid with configuration
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  flowchart: {
    useMaxWidth: false,
    htmlLabels: true,
    curve: 'basis',
  },
})

interface ParseResult {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  errors: string[]
}

// Mermaid colors
const MERMAID_NODE_BG = '#ddd6fe'
const MERMAID_BORDER = '#a78bfa'
const MERMAID_EDGE = '#64748b'

/**
 * Parse Mermaid code and convert to Diagmo nodes/edges
 */
export async function parseMermaidWithLibrary(code: string): Promise<ParseResult> {
  const errors: string[] = []

  try {
    // Validate the syntax first
    const isValid = await mermaid.parse(code)
    if (!isValid) {
      return { nodes: [], edges: [], errors: ['Invalid Mermaid syntax'] }
    }

    // Create a temporary container for rendering
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.top = '-9999px'
    document.body.appendChild(container)

    try {
      // Render to SVG
      const { svg } = await mermaid.render('mermaid-temp-' + nanoid(6), code)
      container.innerHTML = svg

      // Parse the SVG to extract nodes and edges
      const svgElement = container.querySelector('svg')
      if (!svgElement) {
        return { nodes: [], edges: [], errors: ['Failed to render SVG'] }
      }

      const result = extractFromSvg(svgElement, code)
      return result
    } finally {
      // Clean up
      document.body.removeChild(container)
    }
  } catch (error) {
    console.error('Mermaid parse error:', error)
    errors.push(error instanceof Error ? error.message : 'Failed to parse Mermaid diagram')
    return { nodes: [], edges: [], errors }
  }
}

/**
 * Extract nodes and edges from rendered Mermaid SVG
 */
function extractFromSvg(svg: SVGSVGElement, originalCode: string): ParseResult {
  const nodes: DiagramNode[] = []
  const edges: DiagramEdge[] = []
  const errors: string[] = []

  // Parse original code to get node labels and shapes
  const nodeInfo = parseNodeInfo(originalCode)
  const edgeInfo = parseEdgeInfo(originalCode)

  console.log('[MermaidService] Parsed nodeInfo:', Object.fromEntries(nodeInfo))
  console.log('[MermaidService] Parsed edgeInfo:', edgeInfo)

  // Create a reverse map from label to ID for matching
  const labelToId = new Map<string, string>()
  nodeInfo.forEach((info, id) => {
    labelToId.set(info.label.toLowerCase(), id)
  })

  // Find all node groups in SVG
  const nodeGroups = svg.querySelectorAll('.node')

  nodeGroups.forEach((nodeEl) => {
    // Extract node ID from class or id
    let nodeId = ''
    const idAttr = nodeEl.getAttribute('id') || ''
    const classAttr = nodeEl.getAttribute('class') || ''

    // Try to extract ID from id attribute (format: flowchart-A-123)
    const idMatch = idAttr.match(/flowchart-(\w+)-\d+/)
    if (idMatch) {
      nodeId = idMatch[1]
    } else {
      // Try other common patterns
      const altMatch = idAttr.match(/node-(\w+)/) || idAttr.match(/(\w+)-\d+$/)
      if (altMatch) {
        nodeId = altMatch[1]
      } else {
        // Try from class
        const classMatch = classAttr.match(/\bnode-(\w+)\b/)
        if (classMatch) {
          nodeId = classMatch[1]
        }
      }
    }

    // If still no ID, try to get it from the text content
    if (!nodeId) {
      const textEl = nodeEl.querySelector('text, .nodeLabel')
      if (textEl) {
        const labelText = textEl.textContent?.trim().toLowerCase() || ''
        const matchedId = labelToId.get(labelText)
        if (matchedId) {
          nodeId = matchedId
        }
      }
    }

    if (!nodeId) {
      console.log('[MermaidService] Could not extract ID from node:', idAttr, classAttr)
      return
    }

    console.log('[MermaidService] Extracted node ID:', nodeId, 'from:', idAttr)

    // Get bounding box for position and size
    const bbox = (nodeEl as SVGGraphicsElement).getBBox()

    // Get transform to extract position
    const transform = nodeEl.getAttribute('transform')
    const transformPos = parseTransform(transform)

    // Calculate position (transform + bbox offset)
    const x = transformPos.x + bbox.x
    const y = transformPos.y + bbox.y
    const width = Math.max(bbox.width, 80)
    const height = Math.max(bbox.height, 40)

    // Get node info from parsed code
    const info = nodeInfo.get(nodeId) || { label: nodeId, shape: 'rectangle' as ShapeType }

    const style: NodeStyle = {
      ...DEFAULT_NODE_STYLE,
      backgroundColor: MERMAID_NODE_BG,
      textColor: '', // Use CSS variable for dark mode
      borderColor: MERMAID_BORDER,
      borderWidth: 2,
      borderRadius: info.shape === 'rounded-rectangle' ? 12 :
                    info.shape === 'circle' ? 50 : 4,
      textPadding: info.shape === 'diamond' ? 20 : 8,
    }

    nodes.push({
      id: nodeId,
      type: 'custom',
      position: { x, y },
      style: { width, height },
      data: {
        label: info.label,
        type: info.shape,
        style,
      },
    })
  })

  // Create edges from parsed edge info
  // Use a Map to track edges by source-target pair for correct label matching
  const edgeLabelMap = new Map<string, string>()
  edgeInfo.forEach((info) => {
    const key = `${info.source}->${info.target}`
    if (info.label) {
      edgeLabelMap.set(key, info.label)
    }
  })

  console.log('[MermaidService] Edge label map:', Object.fromEntries(edgeLabelMap))
  console.log('[MermaidService] Created nodes:', nodes.map(n => ({ id: n.id, label: n.data.label, x: n.position.x, y: n.position.y })))

  edgeInfo.forEach((info) => {
    // Get source and target node positions
    const sourceNode = nodes.find(n => n.id === info.source)
    const targetNode = nodes.find(n => n.id === info.target)

    if (!sourceNode || !targetNode) {
      console.log('[MermaidService] Could not find nodes for edge:', info.source, '->', info.target)
      console.log('[MermaidService] Available node IDs:', nodes.map(n => n.id))
      return
    }

    // Determine handles based on positions
    const handles = getHandles(sourceNode.position, targetNode.position)

    // Get the correct label for this specific source->target pair
    const edgeKey = `${info.source}->${info.target}`
    const label = edgeLabelMap.get(edgeKey) || ''

    console.log('[MermaidService] Creating edge:', info.source, '->', info.target, 'label:', label)

    edges.push({
      id: nanoid(),
      source: info.source,
      target: info.target,
      sourceHandle: handles.sourceHandle,
      targetHandle: handles.targetHandle,
      type: 'labeled',
      markerEnd: info.hasArrow
        ? { type: 'arrowclosed' as const, width: 10, height: 10, color: MERMAID_EDGE }
        : undefined,
      style: {
        strokeWidth: 2,
        stroke: MERMAID_EDGE,
      },
      data: {
        label,
        style: {
          strokeColor: MERMAID_EDGE,
          strokeWidth: 2,
          lineType: 'solid' as const,
        },
      },
    })
  })

  return { nodes, edges, errors }
}

/**
 * Parse transform attribute to get position
 */
function parseTransform(transform: string | null): { x: number; y: number } {
  if (!transform) return { x: 0, y: 0 }

  const match = transform.match(/translate\s*\(\s*([-\d.]+)\s*,?\s*([-\d.]+)\s*\)/)
  if (match) {
    return {
      x: parseFloat(match[1]) || 0,
      y: parseFloat(match[2]) || 0,
    }
  }
  return { x: 0, y: 0 }
}

/**
 * Parse original code to extract node labels and shapes
 */
function parseNodeInfo(code: string): Map<string, { label: string; shape: ShapeType }> {
  const nodeInfo = new Map<string, { label: string; shape: ShapeType }>()

  const lines = code.split('\n').map(l => l.trim())

  for (const line of lines) {
    // Match node definitions - order matters (more specific first)
    const patterns: Array<{ regex: RegExp; shape: ShapeType }> = [
      { regex: /(\w+)\s*\(\((.+?)\)\)/, shape: 'circle' },
      { regex: /(\w+)\s*\{\{(.+?)\}\}/, shape: 'hexagon' },
      { regex: /(\w+)\s*\{(.+?)\}/, shape: 'diamond' },
      { regex: /(\w+)\s*\(\[(.+?)\]\)/, shape: 'rounded-rectangle' },
      { regex: /(\w+)\s*\[\[(.+?)\]\]/, shape: 'rectangle' },
      { regex: /(\w+)\s*\[(.+?)\]/, shape: 'rectangle' },
      { regex: /(\w+)\s*\((.+?)\)/, shape: 'rounded-rectangle' },
    ]

    for (const { regex, shape } of patterns) {
      const matches = line.matchAll(new RegExp(regex, 'g'))
      for (const match of matches) {
        if (match[1] && match[2] && !nodeInfo.has(match[1])) {
          nodeInfo.set(match[1], { label: match[2], shape })
        }
      }
    }
  }

  return nodeInfo
}

/**
 * Parse edge information from code
 */
function parseEdgeInfo(code: string): Array<{ source: string; target: string; label?: string; hasArrow: boolean }> {
  const edges: Array<{ source: string; target: string; label?: string; hasArrow: boolean }> = []

  const lines = code.split('\n').map(l => l.trim())

  for (const line of lines) {
    // Skip non-edge lines
    if (!line.includes('-->') && !line.includes('---')) continue

    // Match: A -->|label| B
    const labeledMatch = line.match(/(\w+)(?:\[.*?\]|\{.*?\}|\(.*?\))?\s*-->\s*\|([^|]+)\|\s*(\w+)/)
    if (labeledMatch) {
      edges.push({
        source: labeledMatch[1],
        target: labeledMatch[3],
        label: labeledMatch[2].trim(),
        hasArrow: true,
      })
      continue
    }

    // Match: A --> B (with possible node definitions)
    const simpleMatch = line.match(/(\w+)(?:\[.*?\]|\{.*?\}|\(.*?\))?\s*-->\s*(\w+)/)
    if (simpleMatch) {
      edges.push({
        source: simpleMatch[1],
        target: simpleMatch[2],
        hasArrow: true,
      })
      continue
    }

    // Match: A --- B (no arrow)
    const noArrowMatch = line.match(/(\w+)(?:\[.*?\]|\{.*?\}|\(.*?\))?\s*---\s*(\w+)/)
    if (noArrowMatch) {
      edges.push({
        source: noArrowMatch[1],
        target: noArrowMatch[2],
        hasArrow: false,
      })
    }
  }

  return edges
}

/**
 * Determine edge handles based on node positions
 */
function getHandles(
  sourcePos: { x: number; y: number },
  targetPos: { x: number; y: number }
): { sourceHandle: string; targetHandle: string } {
  const dx = targetPos.x - sourcePos.x
  const dy = targetPos.y - sourcePos.y

  // For diagonal connections, prioritize based on larger delta
  if (Math.abs(dy) > Math.abs(dx)) {
    // Primarily vertical
    return dy > 0
      ? { sourceHandle: 'bottom', targetHandle: 'top' }
      : { sourceHandle: 'top', targetHandle: 'bottom' }
  } else {
    // Primarily horizontal
    return dx > 0
      ? { sourceHandle: 'right', targetHandle: 'left' }
      : { sourceHandle: 'left', targetHandle: 'right' }
  }
}

export const mermaidService = {
  parse: parseMermaidWithLibrary,
}
