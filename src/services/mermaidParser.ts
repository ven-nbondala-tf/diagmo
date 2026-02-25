/**
 * Mermaid Diagram Parser
 *
 * Parses Mermaid flowchart syntax and converts it to Diagmo nodes/edges.
 * Supports: graph TD/LR/BT/RL, subgraphs, node shapes, edge labels
 */

import { nanoid } from 'nanoid'
import type { DiagramNode, DiagramEdge, ShapeType, NodeStyle } from '@/types'
import { DEFAULT_NODE_STYLE } from '@/constants'

interface ParseResult {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  errors: string[]
}

// Mermaid-like color scheme - soft purple/lavender
const DEFAULT_SHAPE_COLOR = '#ddd6fe' // violet-200 - matches Mermaid style
const DEFAULT_BORDER_COLOR = '#a78bfa' // violet-400
const DEFAULT_TEXT_COLOR = '' // Empty = use CSS variable for dark mode support

// Node style presets for different subgraph contexts
const subgraphColors = [
  '#c4b5fd', // violet-300
  '#a5b4fc', // indigo-300
  '#93c5fd', // blue-300
  '#86efac', // green-300
  '#fcd34d', // amber-300
  '#fca5a5', // red-300
]

interface MermaidNode {
  id: string
  label: string
  shape: ShapeType
  subgraph?: string
}

interface MermaidEdge {
  source: string
  target: string
  label?: string
  style: 'solid' | 'dotted' | 'thick'
  hasArrow: boolean
  bidirectional: boolean
}

interface Subgraph {
  id: string
  label: string
  nodes: string[]
}

export function parseMermaid(input: string): ParseResult {
  const errors: string[] = []
  const nodeMap = new Map<MermaidNode['id'], MermaidNode>()
  const mermaidEdges: MermaidEdge[] = []
  const subgraphs: Subgraph[] = []
  let currentSubgraph: Subgraph | null = null

  // Clean and normalize input
  const lines = input
    .split('\n')
    .map((line) => line.trim())
    .map((line) => line.replace(/;$/, '')) // Remove trailing semicolons
    .filter((line) => line && !line.startsWith('%%')) // Remove empty lines and comments

  // Detect graph direction
  let direction: 'TB' | 'LR' | 'BT' | 'RL' = 'TB'
  const firstLine = lines[0]?.toLowerCase() || ''
  if (firstLine.match(/^(graph|flowchart)\s+(td|tb)/i)) direction = 'TB'
  else if (firstLine.match(/^(graph|flowchart)\s+lr/i)) direction = 'LR'
  else if (firstLine.match(/^(graph|flowchart)\s+bt/i)) direction = 'BT'
  else if (firstLine.match(/^(graph|flowchart)\s+rl/i)) direction = 'RL'
  else if (!firstLine.match(/^(graph|flowchart)/i)) {
    errors.push('Missing graph declaration. Expected "graph TD" or similar.')
  }

  // Process each line (skip the first graph declaration line)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue

    // Handle subgraph start
    if (line.toLowerCase().startsWith('subgraph ')) {
      const match = line.match(/^subgraph\s+(\w+)(?:\s*\[([^\]]+)\])?/i)
      if (match && match[1]) {
        currentSubgraph = {
          id: match[1],
          label: match[2] || match[1],
          nodes: [],
        }
        subgraphs.push(currentSubgraph)
      }
      continue
    }

    // Handle subgraph end
    if (line.toLowerCase() === 'end') {
      currentSubgraph = null
      continue
    }

    // Try to parse as edge definition (with connection)
    const edgeResult = parseEdgeLine(line)
    if (edgeResult) {
      const { sourceNode, targetNode, edge } = edgeResult

      // Add nodes to map if not already present
      if (!nodeMap.has(sourceNode.id)) {
        nodeMap.set(sourceNode.id, {
          ...sourceNode,
          subgraph: currentSubgraph?.id,
        })
        if (currentSubgraph) {
          currentSubgraph.nodes.push(sourceNode.id)
        }
      }

      if (!nodeMap.has(targetNode.id)) {
        nodeMap.set(targetNode.id, {
          ...targetNode,
          subgraph: currentSubgraph?.id,
        })
        if (currentSubgraph) {
          currentSubgraph.nodes.push(targetNode.id)
        }
      }

      mermaidEdges.push(edge)
      continue
    }

    // Try to parse as standalone node definition
    const nodeResult = parseNodeDefinition(line)
    if (nodeResult && !nodeMap.has(nodeResult.id)) {
      nodeMap.set(nodeResult.id, {
        ...nodeResult,
        subgraph: currentSubgraph?.id,
      })
      if (currentSubgraph) {
        currentSubgraph.nodes.push(nodeResult.id)
      }
      continue
    }

    // Line wasn't parsed
    if (line.length > 0 && !line.match(/^style\s+/i) && !line.match(/^class\s+/i)) {
      errors.push(`Could not parse line ${i + 1}: "${line}"`)
    }
  }

  // Layout nodes based on direction and convert to Diagmo format
  const { nodes, edges } = layoutAndConvert(
    Array.from(nodeMap.values()),
    mermaidEdges,
    subgraphs,
    direction
  )

  return { nodes, edges, errors }
}

function parseNodeDefinition(text: string): MermaidNode | null {
  // Match various node shapes
  // ID[label] - rectangle
  // ID(label) - rounded
  // ID((label)) - circle
  // ID{label} - diamond
  // ID{{label}} - hexagon
  // ID[(label)] - cylinder
  // ID([label]) - stadium
  // ID[[label]] - subroutine
  // ID>label] - asymmetric
  // ID[/label/] - parallelogram
  // ID[/label\] - trapezoid

  // Allow node IDs to contain alphanumeric, underscore, and hyphen
  const idPattern = '[\\w-]+'

  const patterns: Array<{ regex: RegExp; shape: ShapeType }> = [
    { regex: new RegExp(`^(${idPattern})\\s*\\(\\((.+)\\)\\)$`), shape: 'circle' },
    { regex: new RegExp(`^(${idPattern})\\s*\\{\\{(.+)\\}\\}$`), shape: 'hexagon' },
    { regex: new RegExp(`^(${idPattern})\\s*\\[\\((.+)\\)\\]$`), shape: 'cylinder' },
    { regex: new RegExp(`^(${idPattern})\\s*\\(\\[(.+)\\]\\)$`), shape: 'rounded-rectangle' },
    { regex: new RegExp(`^(${idPattern})\\s*\\[\\[(.+)\\]\\]$`), shape: 'rectangle' },
    { regex: new RegExp(`^(${idPattern})\\s*>(.+)\\]$`), shape: 'arrow' },
    { regex: new RegExp(`^(${idPattern})\\s*\\[/(.+)/\\]$`), shape: 'parallelogram' },
    { regex: new RegExp(`^(${idPattern})\\s*\\[/(.+)\\\\\\]$`), shape: 'trapezoid' },
    { regex: new RegExp(`^(${idPattern})\\s*\\{(.+)\\}$`), shape: 'diamond' },
    { regex: new RegExp(`^(${idPattern})\\s*\\((.+)\\)$`), shape: 'rounded-rectangle' },
    { regex: new RegExp(`^(${idPattern})\\s*\\[(.+)\\]$`), shape: 'rectangle' },
    { regex: new RegExp(`^(${idPattern})$`), shape: 'rectangle' }, // Just ID, no shape
  ]

  for (const { regex, shape } of patterns) {
    const match = text.match(regex)
    if (match && match[1]) {
      return {
        id: match[1],
        label: (match[2] || match[1]).trim(),
        shape,
      }
    }
  }

  return null
}

function parseEdgeLine(line: string): {
  sourceNode: MermaidNode
  targetNode: MermaidNode
  edge: MermaidEdge
} | null {
  // Edge patterns:
  // A --> B         solid arrow
  // A --- B         solid line
  // A -.-> B        dotted arrow
  // A -.- B         dotted line
  // A ==> B         thick arrow
  // A === B         thick line
  // A -->|text| B   arrow with label
  // A -- text --> B arrow with label (alternative)
  // A <--> B        bidirectional

  // Split by edge connectors
  const edgePatterns = [
    { regex: /\s*<-->\s*/, style: 'solid' as const, hasArrow: true, bidirectional: true },
    { regex: /\s*<==>\s*/, style: 'thick' as const, hasArrow: true, bidirectional: true },
    { regex: /\s*<-\.->\s*/, style: 'dotted' as const, hasArrow: true, bidirectional: true },
    { regex: /\s*-->\s*/, style: 'solid' as const, hasArrow: true, bidirectional: false },
    { regex: /\s*---\s*/, style: 'solid' as const, hasArrow: false, bidirectional: false },
    { regex: /\s*-\.->\s*/, style: 'dotted' as const, hasArrow: true, bidirectional: false },
    { regex: /\s*-\.-\s*/, style: 'dotted' as const, hasArrow: false, bidirectional: false },
    { regex: /\s*==>\s*/, style: 'thick' as const, hasArrow: true, bidirectional: false },
    { regex: /\s*===\s*/, style: 'thick' as const, hasArrow: false, bidirectional: false },
  ]

  // Try to find labeled edges first (A -->|label| B or A -- label --> B)
  const labeledEdgeMatch = line.match(
    /^(.+?)\s*(--|==>?|-.->?)\s*(?:\|([^|]+)\||\s+([^-=.]+)\s+(?:-->?|==>?|-\.->?))\s*(.+)$/
  )

  if (labeledEdgeMatch) {
    const [, source, , label1, label2, target] = labeledEdgeMatch
    if (!source || !target) return null
    const sourceNode = parseNodeDefinition(source.trim())
    const targetNode = parseNodeDefinition(target.trim())
    if (sourceNode && targetNode) {
      return {
        sourceNode,
        targetNode,
        edge: {
          source: sourceNode.id,
          target: targetNode.id,
          label: label1 || label2,
          style: 'solid',
          hasArrow: true,
          bidirectional: false,
        },
      }
    }
  }

  // Try standard edge patterns
  for (const { regex, style, hasArrow, bidirectional } of edgePatterns) {
    // Check for edge with inline label: A -->|label| B
    const labelMatch = line.match(
      new RegExp(`^(.+?)${regex.source.replace(/\\s\*/g, '')}\\|([^|]+)\\|\\s*(.+)$`)
    )
    if (labelMatch && labelMatch[1] && labelMatch[3]) {
      const sourceNode = parseNodeDefinition(labelMatch[1].trim())
      const targetNode = parseNodeDefinition(labelMatch[3].trim())
      if (sourceNode && targetNode) {
        return {
          sourceNode,
          targetNode,
          edge: {
            source: sourceNode.id,
            target: targetNode.id,
            label: labelMatch[2],
            style,
            hasArrow,
            bidirectional,
          },
        }
      }
    }

    // Check for standard edge without label
    const parts = line.split(regex)
    if (parts.length === 2 && parts[0] && parts[1]) {
      const sourceNode = parseNodeDefinition(parts[0].trim())
      const targetNode = parseNodeDefinition(parts[1].trim())
      if (sourceNode && targetNode) {
        return {
          sourceNode,
          targetNode,
          edge: {
            source: sourceNode.id,
            target: targetNode.id,
            style,
            hasArrow,
            bidirectional,
          },
        }
      }
    }
  }

  return null
}

function layoutAndConvert(
  mermaidNodes: MermaidNode[],
  mermaidEdges: MermaidEdge[],
  subgraphs: Subgraph[],
  direction: 'TB' | 'LR' | 'BT' | 'RL'
): { nodes: DiagramNode[]; edges: DiagramEdge[] } {
  // Layout constants
  const nodeWidth = 120
  const nodeHeight = 50
  const horizontalGap = 80
  const verticalGap = 100

  // Build adjacency lists - store edges with labels for ordering
  const outgoing = new Map<string, Array<{ target: string; label?: string }>>()
  const incoming = new Map<string, string[]>()
  const nodeIds = mermaidNodes.map((n) => n.id)
  const nodeIdSet = new Set(nodeIds)

  for (const id of nodeIds) {
    outgoing.set(id, [])
    incoming.set(id, [])
  }

  // Store edges with their labels for sibling ordering
  for (const edge of mermaidEdges) {
    if (nodeIdSet.has(edge.source) && nodeIdSet.has(edge.target)) {
      outgoing.get(edge.source)?.push({ target: edge.target, label: edge.label })
      incoming.get(edge.target)?.push(edge.source)
    }
  }

  // Detect back-edges using DFS (more accurate cycle detection)
  const visited = new Set<string>()
  const inStack = new Set<string>()
  const backEdges = new Set<string>()

  function detectBackEdges(nodeId: string) {
    visited.add(nodeId)
    inStack.add(nodeId)

    for (const { target } of outgoing.get(nodeId) || []) {
      if (!visited.has(target)) {
        detectBackEdges(target)
      } else if (inStack.has(target)) {
        // This is a back-edge (creates a cycle)
        backEdges.add(`${nodeId}->${target}`)
      }
    }

    inStack.delete(nodeId)
  }

  // Run DFS from all unvisited nodes to detect back-edges
  for (const id of nodeIds) {
    if (!visited.has(id)) {
      detectBackEdges(id)
    }
  }

  // Find root nodes (no incoming edges except from back-edges)
  const roots: string[] = []
  for (const id of nodeIds) {
    const incomingNodes = incoming.get(id) || []
    const hasRealIncoming = incomingNodes.some(source => !backEdges.has(`${source}->${id}`))
    if (!hasRealIncoming) {
      roots.push(id)
    }
  }

  // If no roots, use first node
  if (roots.length === 0 && nodeIds[0]) {
    roots.push(nodeIds[0])
  }

  // Assign layers using BFS (ignoring back-edges)
  const layers = new Map<string, number>()
  const queue: string[] = [...roots]
  roots.forEach(r => layers.set(r, 0))

  while (queue.length > 0) {
    const current = queue.shift()!
    const currentLayer = layers.get(current) ?? 0

    for (const { target } of outgoing.get(current) || []) {
      // Skip back-edges
      if (backEdges.has(`${current}->${target}`)) continue

      const existingLayer = layers.get(target)
      const newLayer = currentLayer + 1

      // Only update if not assigned or if this path gives a deeper layer
      if (existingLayer === undefined || newLayer > existingLayer) {
        layers.set(target, newLayer)
        queue.push(target)
      }
    }
  }

  // Ensure all nodes have a layer
  for (const id of nodeIds) {
    if (!layers.has(id)) {
      layers.set(id, 0)
    }
  }

  // Group nodes by layer
  const layerGroups = new Map<number, string[]>()
  for (const [nodeId, layer] of layers) {
    if (!layerGroups.has(layer)) {
      layerGroups.set(layer, [])
    }
    layerGroups.get(layer)!.push(nodeId)
  }

  // CRITICAL: Order nodes within each layer based on parent's edge order
  // This ensures "Yes" branch goes left and "No" branch goes right
  for (const [layer, nodesInLayer] of layerGroups) {
    if (layer === 0) continue // Root nodes don't need reordering

    // Build ordering based on parent edges
    const nodeOrder = new Map<string, number>()

    for (const nodeId of nodesInLayer) {
      // Find the parent(s) of this node
      const parents = incoming.get(nodeId) || []

      for (const parent of parents) {
        if (backEdges.has(`${parent}->${nodeId}`)) continue

        // Find this node's position in parent's outgoing edges
        const parentEdges = outgoing.get(parent) || []
        const edgeIndex = parentEdges.findIndex(e => e.target === nodeId)

        if (edgeIndex >= 0) {
          // Use parent's layer * 1000 + edge index for stable sorting
          const parentLayer = layers.get(parent) ?? 0
          const orderValue = parentLayer * 1000 + edgeIndex

          // Keep the minimum order value (earliest parent, earliest edge)
          if (!nodeOrder.has(nodeId) || orderValue < nodeOrder.get(nodeId)!) {
            nodeOrder.set(nodeId, orderValue)
          }
        }
      }
    }

    // Sort nodes in this layer by their order value
    nodesInLayer.sort((a, b) => {
      const orderA = nodeOrder.get(a) ?? Infinity
      const orderB = nodeOrder.get(b) ?? Infinity
      return orderA - orderB
    })
  }

  // Calculate positions
  const positions = new Map<string, { x: number; y: number }>()
  const sortedLayers = Array.from(layerGroups.entries()).sort((a, b) => a[0] - b[0])
  const maxNodesInLayer = Math.max(...Array.from(layerGroups.values()).map(n => n.length), 1)
  const totalWidth = maxNodesInLayer * (nodeWidth + horizontalGap)

  for (const [layer, nodesInLayer] of sortedLayers) {
    const layerWidth = nodesInLayer.length * (nodeWidth + horizontalGap)
    const centerOffset = (totalWidth - layerWidth) / 2

    nodesInLayer.forEach((nodeId, index) => {
      let x: number, y: number

      if (direction === 'TB' || direction === 'BT') {
        x = centerOffset + index * (nodeWidth + horizontalGap) + 150
        y = layer * (nodeHeight + verticalGap) + 100

        if (direction === 'BT') {
          const maxLayer = Math.max(...layers.values())
          y = (maxLayer - layer) * (nodeHeight + verticalGap) + 100
        }
      } else {
        // LR or RL
        const layerHeight = nodesInLayer.length * (nodeHeight + verticalGap)
        const totalHeight = maxNodesInLayer * (nodeHeight + verticalGap)
        const vCenterOffset = (totalHeight - layerHeight) / 2

        x = layer * (nodeWidth + horizontalGap) + 150
        y = vCenterOffset + index * (nodeHeight + verticalGap) + 100

        if (direction === 'RL') {
          const maxLayer = Math.max(...layers.values())
          x = (maxLayer - layer) * (nodeWidth + horizontalGap) + 150
        }
      }

      positions.set(nodeId, { x, y })
    })
  }

  // Create subgraph color mapping
  const subgraphColorMap = new Map<string, string>()
  subgraphs.forEach((sg, i) => {
    subgraphColorMap.set(sg.id, subgraphColors[i % subgraphColors.length] || '#f1f5f9')
  })

  // Convert to Diagmo nodes
  const nodes: DiagramNode[] = mermaidNodes.map((mNode) => {
    const pos = positions.get(mNode.id) || { x: 100, y: 100 }
    const bgColor = mNode.subgraph
      ? subgraphColorMap.get(mNode.subgraph)
      : DEFAULT_SHAPE_COLOR

    // Calculate width based on label length for better fit
    const labelLength = mNode.label.length

    // Adjust size based on shape type and label
    let width = nodeWidth
    let height = nodeHeight

    if (mNode.shape === 'diamond' || mNode.shape === 'decision') {
      // Diamonds should be close to square (Mermaid style)
      // Calculate size based on label, ensuring enough space for text inside diamond
      width = Math.max(100, labelLength * 9 + 50)
      height = width  // Keep 1:1 aspect ratio like Mermaid
    } else if (mNode.shape === 'circle') {
      // Circles should be square-ish, sized to fit text
      const size = Math.max(70, labelLength * 7 + 30)
      width = size
      height = size
    } else if (mNode.shape === 'rounded-rectangle') {
      width = Math.max(100, labelLength * 9 + 30)
    } else {
      // Default rectangle - size based on label
      width = Math.max(100, Math.min(200, labelLength * 10 + 40))
    }

    const style: NodeStyle = {
      ...DEFAULT_NODE_STYLE,
      backgroundColor: bgColor,
      textColor: DEFAULT_TEXT_COLOR,
      borderColor: DEFAULT_BORDER_COLOR,
      borderWidth: 2,
      borderRadius: mNode.shape === 'rounded-rectangle' ? 12 : 4,
      // Diamond shapes need more padding to keep text in center visible area
      textPadding: (mNode.shape === 'diamond' || mNode.shape === 'decision') ? 20 : 8,
    }

    return {
      id: mNode.id,
      type: 'custom',
      position: pos,
      style: { width, height },
      data: {
        label: mNode.label,
        type: mNode.shape,
        style,
      },
    }
  })

  // Helper to determine edge handles
  const getEdgeHandles = (
    sourcePos: { x: number; y: number },
    targetPos: { x: number; y: number },
    isBackEdge: boolean
  ): { sourceHandle: string; targetHandle: string } => {
    if (isBackEdge) {
      // Back-edges route around the OUTSIDE to avoid crossing the main diagram
      if (direction === 'TB' || direction === 'BT') {
        // Vertical layout: route via the side where the source node is
        // If source is to the RIGHT of target, route via RIGHT side
        // If source is to the LEFT of target, route via LEFT side
        if (sourcePos.x > targetPos.x) {
          return { sourceHandle: 'right', targetHandle: 'right' }
        } else if (sourcePos.x < targetPos.x) {
          return { sourceHandle: 'left', targetHandle: 'left' }
        } else {
          // Same x position - default to right
          return { sourceHandle: 'right', targetHandle: 'right' }
        }
      } else {
        // Horizontal layout: route via bottom
        return { sourceHandle: 'bottom', targetHandle: 'bottom' }
      }
    }

    const dx = targetPos.x - sourcePos.x
    const dy = targetPos.y - sourcePos.y

    if (direction === 'TB' || direction === 'BT') {
      // Vertical layout (Top-Down or Bottom-Top)
      if (dy > 0) {
        // Target is BELOW source
        if (Math.abs(dx) > 30) {
          // Target is also to the side - use left/right handles for branching
          // This creates Mermaid-style decision diamond branches
          return dx > 0
            ? { sourceHandle: 'right', targetHandle: 'top' }
            : { sourceHandle: 'left', targetHandle: 'top' }
        } else {
          // Target is directly below - use bottom handle
          return { sourceHandle: 'bottom', targetHandle: 'top' }
        }
      } else {
        // Target is ABOVE source
        if (Math.abs(dx) > 30) {
          return dx > 0
            ? { sourceHandle: 'right', targetHandle: 'bottom' }
            : { sourceHandle: 'left', targetHandle: 'bottom' }
        } else {
          return { sourceHandle: 'top', targetHandle: 'bottom' }
        }
      }
    } else {
      // Horizontal layout (LR/RL)
      if (dx > 0) {
        // Target is to the RIGHT
        if (Math.abs(dy) > 30) {
          return dy > 0
            ? { sourceHandle: 'bottom', targetHandle: 'left' }
            : { sourceHandle: 'top', targetHandle: 'left' }
        } else {
          return { sourceHandle: 'right', targetHandle: 'left' }
        }
      } else {
        // Target is to the LEFT
        if (Math.abs(dy) > 30) {
          return dy > 0
            ? { sourceHandle: 'bottom', targetHandle: 'right' }
            : { sourceHandle: 'top', targetHandle: 'right' }
        } else {
          return { sourceHandle: 'left', targetHandle: 'right' }
        }
      }
    }
  }

  // Convert to Diagmo edges
  const edgeColor = '#64748b'

  const edges: DiagramEdge[] = mermaidEdges.map((mEdge) => {
    const sourcePos = positions.get(mEdge.source) || { x: 0, y: 0 }
    const targetPos = positions.get(mEdge.target) || { x: 0, y: 0 }
    const isBackEdge = backEdges.has(`${mEdge.source}->${mEdge.target}`)

    const handles = getEdgeHandles(sourcePos, targetPos, isBackEdge)
    const strokeWidth = mEdge.style === 'thick' ? 3 : 2

    return {
      id: nanoid(),
      source: mEdge.source,
      target: mEdge.target,
      sourceHandle: handles.sourceHandle,
      targetHandle: handles.targetHandle,
      type: 'labeled',
      markerEnd: mEdge.hasArrow
        ? { type: 'arrowclosed' as const, width: 10, height: 10, color: edgeColor }
        : undefined,
      markerStart: mEdge.bidirectional
        ? { type: 'arrowclosed' as const, width: 10, height: 10, color: edgeColor }
        : undefined,
      style: {
        strokeWidth,
        stroke: edgeColor,
        strokeDasharray: mEdge.style === 'dotted' ? '5,5' : undefined,
      },
      data: {
        label: mEdge.label || '',
        style: {
          strokeColor: edgeColor,
          strokeWidth,
          lineType: mEdge.style === 'dotted' ? 'dashed' : 'solid',
        },
      },
    }
  })

  return { nodes, edges }
}

// Example usage:
// const result = parseMermaid(`
// graph TD
//     A[Start] --> B{Is it?}
//     B -->|Yes| C[OK]
//     B -->|No| D[End]
// `)
