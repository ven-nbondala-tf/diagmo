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

// Node style presets for different subgraph contexts
const subgraphColors = [
  '#e0f2fe', // sky-100
  '#fef3c7', // amber-100
  '#d1fae5', // emerald-100
  '#ede9fe', // violet-100
  '#fce7f3', // pink-100
  '#fed7aa', // orange-200
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
  // Simple layout algorithm based on topological sort and layering
  const nodeWidth = 140
  const nodeHeight = 60
  const horizontalGap = 80
  const verticalGap = 80

  // Build adjacency lists
  const outgoing = new Map<string, string[]>()
  const incoming = new Map<string, string[]>()
  const nodeIds = mermaidNodes.map((n) => n.id)

  for (const id of nodeIds) {
    outgoing.set(id, [])
    incoming.set(id, [])
  }

  for (const edge of mermaidEdges) {
    outgoing.get(edge.source)?.push(edge.target)
    incoming.get(edge.target)?.push(edge.source)
  }

  // Assign layers using longest path method
  const layers = new Map<string, number>()
  const visited = new Set<string>()

  function assignLayer(nodeId: string): number {
    if (layers.has(nodeId)) return layers.get(nodeId)!

    const sources = incoming.get(nodeId) || []
    let maxParentLayer = -1

    for (const source of sources) {
      if (!visited.has(source)) {
        visited.add(source)
        const parentLayer = assignLayer(source)
        maxParentLayer = Math.max(maxParentLayer, parentLayer)
      }
    }

    const layer = maxParentLayer + 1
    layers.set(nodeId, layer)
    return layer
  }

  // Start from nodes with no incoming edges
  const roots = nodeIds.filter((id) => (incoming.get(id)?.length || 0) === 0)
  if (roots.length === 0 && nodeIds.length > 0 && nodeIds[0]) {
    // Cyclic graph - just start from first node
    roots.push(nodeIds[0])
  }

  for (const root of roots) {
    visited.add(root)
    assignLayer(root)
  }

  // Ensure all nodes are assigned a layer
  for (const id of nodeIds) {
    if (!layers.has(id)) {
      assignLayer(id)
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

  // Calculate positions
  const positions = new Map<string, { x: number; y: number }>()
  const maxLayer = Math.max(...layers.values(), 0)

  for (const [layer, nodesInLayer] of layerGroups) {
    nodesInLayer.forEach((nodeId, index) => {
      let x: number, y: number

      const layerPosition = direction === 'BT' || direction === 'RL' ? maxLayer - layer : layer

      if (direction === 'TB' || direction === 'BT') {
        // Top-bottom or bottom-top
        x = index * (nodeWidth + horizontalGap) + 100
        y = layerPosition * (nodeHeight + verticalGap) + 100
      } else {
        // Left-right or right-left
        x = layerPosition * (nodeWidth + horizontalGap) + 100
        y = index * (nodeHeight + verticalGap) + 100
      }

      positions.set(nodeId, { x, y })
    })
  }

  // Create subgraph color mapping
  const subgraphColorMap = new Map<string, string>()
  subgraphs.forEach((sg, i) => {
    const color = subgraphColors[i % subgraphColors.length] || '#f1f5f9'
    subgraphColorMap.set(sg.id, color)
  })

  // Convert to Diagmo nodes
  const nodes: DiagramNode[] = mermaidNodes.map((mNode) => {
    const pos = positions.get(mNode.id) || { x: 100, y: 100 }
    const bgColor = mNode.subgraph
      ? subgraphColorMap.get(mNode.subgraph)
      : undefined

    const style: NodeStyle = {
      ...DEFAULT_NODE_STYLE,
      ...(bgColor ? { backgroundColor: bgColor } : {}),
    }

    return {
      id: mNode.id,
      type: 'custom',
      position: pos,
      style: { width: nodeWidth, height: nodeHeight },
      data: {
        label: mNode.label,
        type: mNode.shape,
        style,
      },
    }
  })

  // Helper function to determine best connection handles based on node positions and direction
  const getEdgeHandles = (
    sourcePos: { x: number; y: number },
    targetPos: { x: number; y: number },
    graphDirection: 'TB' | 'LR' | 'BT' | 'RL'
  ): { sourceHandle: string; targetHandle: string } => {
    const dx = targetPos.x - sourcePos.x
    const dy = targetPos.y - sourcePos.y

    // For left-to-right graphs, prefer horizontal connections
    if (graphDirection === 'LR') {
      if (dx > 0) return { sourceHandle: 'right', targetHandle: 'left' }
      if (dx < 0) return { sourceHandle: 'left', targetHandle: 'right' }
      // Same column - use vertical
      if (dy > 0) return { sourceHandle: 'bottom', targetHandle: 'top' }
      return { sourceHandle: 'top', targetHandle: 'bottom' }
    }

    // For right-to-left graphs
    if (graphDirection === 'RL') {
      if (dx < 0) return { sourceHandle: 'left', targetHandle: 'right' }
      if (dx > 0) return { sourceHandle: 'right', targetHandle: 'left' }
      if (dy > 0) return { sourceHandle: 'bottom', targetHandle: 'top' }
      return { sourceHandle: 'top', targetHandle: 'bottom' }
    }

    // For top-to-bottom graphs, prefer vertical connections
    if (graphDirection === 'TB') {
      if (dy > 0) return { sourceHandle: 'bottom', targetHandle: 'top' }
      if (dy < 0) return { sourceHandle: 'top', targetHandle: 'bottom' }
      // Same row - use horizontal
      if (dx > 0) return { sourceHandle: 'right', targetHandle: 'left' }
      return { sourceHandle: 'left', targetHandle: 'right' }
    }

    // For bottom-to-top graphs
    if (graphDirection === 'BT') {
      if (dy < 0) return { sourceHandle: 'top', targetHandle: 'bottom' }
      if (dy > 0) return { sourceHandle: 'bottom', targetHandle: 'top' }
      if (dx > 0) return { sourceHandle: 'right', targetHandle: 'left' }
      return { sourceHandle: 'left', targetHandle: 'right' }
    }

    // Default: use horizontal if dx is larger, vertical if dy is larger
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0
        ? { sourceHandle: 'right', targetHandle: 'left' }
        : { sourceHandle: 'left', targetHandle: 'right' }
    } else {
      return dy > 0
        ? { sourceHandle: 'bottom', targetHandle: 'top' }
        : { sourceHandle: 'top', targetHandle: 'bottom' }
    }
  }

  // Convert to Diagmo edges
  const edges: DiagramEdge[] = mermaidEdges.map((mEdge) => {
    const strokeWidth = mEdge.style === 'thick' ? 3 : 1.5
    const strokeDasharray = mEdge.style === 'dotted' ? '5,5' : undefined

    // Get positions to determine best handles
    const sourcePos = positions.get(mEdge.source) || { x: 0, y: 0 }
    const targetPos = positions.get(mEdge.target) || { x: 0, y: 0 }
    const handles = getEdgeHandles(sourcePos, targetPos, direction)

    return {
      id: nanoid(),
      source: mEdge.source,
      target: mEdge.target,
      sourceHandle: handles.sourceHandle,
      targetHandle: handles.targetHandle,
      type: 'smoothstep',
      markerEnd: mEdge.hasArrow
        ? {
            type: 'arrowclosed' as const,
            width: 8,
            height: 8,
            color: '#64748b',
          }
        : undefined,
      markerStart: mEdge.bidirectional
        ? {
            type: 'arrowclosed' as const,
            width: 8,
            height: 8,
            color: '#64748b',
          }
        : undefined,
      style: {
        strokeWidth,
        stroke: '#64748b',
        strokeDasharray,
      },
      data: {
        label: mEdge.label,
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
