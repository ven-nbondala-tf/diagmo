import dagre from 'dagre'
import type { DiagramNode, DiagramEdge } from '@/types'

export type LayoutDirection = 'TB' | 'LR' | 'BT' | 'RL'

export interface LayoutOptions {
  direction: LayoutDirection
  nodeSpacing: number
  rankSpacing: number
  align?: 'UL' | 'UR' | 'DL' | 'DR' | undefined
}

const DEFAULT_OPTIONS: LayoutOptions = {
  direction: 'TB',
  nodeSpacing: 50,
  rankSpacing: 80,
  align: undefined,
}

// Default node dimensions if not specified
const DEFAULT_NODE_WIDTH = 150
const DEFAULT_NODE_HEIGHT = 50

/**
 * Auto-layout nodes using dagre algorithm
 * Returns new node positions while preserving all other node data
 */
export function autoLayoutNodes(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  options: Partial<LayoutOptions> = {}
): DiagramNode[] {
  if (nodes.length === 0) return nodes

  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Create a new dagre graph
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))

  // Configure the graph
  g.setGraph({
    rankdir: opts.direction,
    nodesep: opts.nodeSpacing,
    ranksep: opts.rankSpacing,
    align: opts.align,
    marginx: 50,
    marginy: 50,
  })

  // Add nodes to the graph
  nodes.forEach((node) => {
    // Use measured dimensions or defaults
    const width = node.measured?.width || node.width || DEFAULT_NODE_WIDTH
    const height = node.measured?.height || node.height || DEFAULT_NODE_HEIGHT

    g.setNode(node.id, {
      width: width as number,
      height: height as number,
    })
  })

  // Add edges to the graph
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target)
  })

  // Run the layout algorithm
  dagre.layout(g)

  // Apply the calculated positions to nodes
  return nodes.map((node) => {
    const nodeWithPosition = g.node(node.id)
    if (!nodeWithPosition) return node

    // dagre gives center positions, React Flow uses top-left
    const width = node.measured?.width || node.width || DEFAULT_NODE_WIDTH
    const height = node.measured?.height || node.height || DEFAULT_NODE_HEIGHT

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - (width as number) / 2,
        y: nodeWithPosition.y - (height as number) / 2,
      },
    }
  })
}

/**
 * Get layout direction label
 */
export function getDirectionLabel(direction: LayoutDirection): string {
  switch (direction) {
    case 'TB':
      return 'Top to Bottom'
    case 'LR':
      return 'Left to Right'
    case 'BT':
      return 'Bottom to Top'
    case 'RL':
      return 'Right to Left'
    default:
      return direction
  }
}

export const layoutService = {
  autoLayoutNodes,
  getDirectionLabel,
}
