import type { DiagramNode, DiagramEdge, ShapeType } from '@/types'

export interface DiagramAnalytics {
  // Basic counts
  nodeCount: number
  edgeCount: number
  layerCount: number

  // Complexity metrics
  averageConnections: number
  maxConnections: number
  maxDepth: number
  cycleCount: number
  connectedComponents: number

  // Type distribution
  shapeDistribution: Record<string, number>
  topShapes: Array<{ type: string; count: number; percentage: number }>

  // Cloud provider breakdown
  cloudProviders: {
    aws: number
    azure: number
    gcp: number
    generic: number
    other: number
  }

  // Issues summary
  orphanNodes: number
  unlabeledNodes: number
  selfLoops: number
  duplicateLabels: number

  // Structure analysis
  sourceNodes: number // Nodes with no incoming edges (entry points)
  sinkNodes: number // Nodes with no outgoing edges (endpoints)
  hubNodes: Array<{ id: string; label: string; connections: number }> // Most connected nodes

  // Size metrics
  boundingBox: {
    width: number
    height: number
    area: number
  }
  averageNodeSize: {
    width: number
    height: number
  }
}

// Helper to detect cycles using DFS
function detectCycles(nodes: DiagramNode[], edges: DiagramEdge[]): number {
  const adjacencyList = new Map<string, string[]>()
  nodes.forEach(n => adjacencyList.set(n.id, []))
  edges.forEach(e => {
    const list = adjacencyList.get(e.source)
    if (list) list.push(e.target)
  })

  const visited = new Set<string>()
  const recursionStack = new Set<string>()
  let cycleCount = 0

  function dfs(nodeId: string): boolean {
    visited.add(nodeId)
    recursionStack.add(nodeId)

    const neighbors = adjacencyList.get(nodeId) || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true
      } else if (recursionStack.has(neighbor)) {
        cycleCount++
        return true
      }
    }

    recursionStack.delete(nodeId)
    return false
  }

  nodes.forEach(n => {
    if (!visited.has(n.id)) {
      dfs(n.id)
    }
  })

  return cycleCount
}

// Helper to find connected components
function findConnectedComponents(nodes: DiagramNode[], edges: DiagramEdge[]): number {
  if (nodes.length === 0) return 0

  // Build undirected adjacency list
  const adjacencyList = new Map<string, Set<string>>()
  nodes.forEach(n => adjacencyList.set(n.id, new Set()))

  edges.forEach(e => {
    adjacencyList.get(e.source)?.add(e.target)
    adjacencyList.get(e.target)?.add(e.source)
  })

  const visited = new Set<string>()
  let componentCount = 0

  function bfs(startId: string) {
    const queue = [startId]
    visited.add(startId)

    while (queue.length > 0) {
      const nodeId = queue.shift()!
      const neighbors = adjacencyList.get(nodeId) || new Set()
      neighbors.forEach(neighbor => {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          queue.push(neighbor)
        }
      })
    }
  }

  nodes.forEach(n => {
    if (!visited.has(n.id)) {
      bfs(n.id)
      componentCount++
    }
  })

  return componentCount
}

// Helper to find max depth (longest path from any source node)
function findMaxDepth(nodes: DiagramNode[], edges: DiagramEdge[]): number {
  if (nodes.length === 0) return 0

  const adjacencyList = new Map<string, string[]>()
  const inDegree = new Map<string, number>()

  nodes.forEach(n => {
    adjacencyList.set(n.id, [])
    inDegree.set(n.id, 0)
  })

  edges.forEach(e => {
    adjacencyList.get(e.source)?.push(e.target)
    inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1)
  })

  // Find source nodes (in-degree = 0)
  const sourceNodes = nodes.filter(n => (inDegree.get(n.id) || 0) === 0)
  if (sourceNodes.length === 0) return 0

  // BFS from all sources to find max depth
  let maxDepth = 0
  const depths = new Map<string, number>()

  sourceNodes.forEach(n => depths.set(n.id, 0))
  const queue = [...sourceNodes.map(n => n.id)]

  while (queue.length > 0) {
    const nodeId = queue.shift()!
    const currentDepth = depths.get(nodeId) || 0
    maxDepth = Math.max(maxDepth, currentDepth)

    const neighbors = adjacencyList.get(nodeId) || []
    neighbors.forEach(neighbor => {
      const newDepth = currentDepth + 1
      if (!depths.has(neighbor) || depths.get(neighbor)! < newDepth) {
        depths.set(neighbor, newDepth)
        queue.push(neighbor)
      }
    })
  }

  return maxDepth
}

// Main analytics function
export function analyzeDiagram(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  layers?: { id: string }[]
): DiagramAnalytics {
  // Basic counts
  const nodeCount = nodes.length
  const edgeCount = edges.length
  const layerCount = layers?.length || 1

  // Connection counts per node
  const connectionCounts = new Map<string, number>()
  nodes.forEach(n => connectionCounts.set(n.id, 0))

  edges.forEach(e => {
    connectionCounts.set(e.source, (connectionCounts.get(e.source) || 0) + 1)
    connectionCounts.set(e.target, (connectionCounts.get(e.target) || 0) + 1)
  })

  const connectionValues = Array.from(connectionCounts.values())
  const totalConnections = connectionValues.reduce((sum, c) => sum + c, 0)
  const averageConnections = nodeCount > 0 ? totalConnections / nodeCount : 0
  const maxConnections = connectionValues.length > 0 ? Math.max(...connectionValues) : 0

  // Shape distribution
  const shapeDistribution: Record<string, number> = {}
  nodes.forEach(n => {
    const type = n.data.type
    shapeDistribution[type] = (shapeDistribution[type] || 0) + 1
  })

  // Top shapes (sorted by count)
  const topShapes = Object.entries(shapeDistribution)
    .map(([type, count]) => ({
      type,
      count,
      percentage: nodeCount > 0 ? (count / nodeCount) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Cloud provider breakdown
  const cloudProviders = {
    aws: 0,
    azure: 0,
    gcp: 0,
    generic: 0,
    other: 0,
  }

  nodes.forEach(n => {
    const type = n.data.type
    if (type.startsWith('aws-')) cloudProviders.aws++
    else if (type.startsWith('azure-')) cloudProviders.azure++
    else if (type.startsWith('gcp-')) cloudProviders.gcp++
    else if (type.startsWith('generic-')) cloudProviders.generic++
    else cloudProviders.other++
  })

  // Issues
  const connectedIds = new Set([
    ...edges.map(e => e.source),
    ...edges.map(e => e.target),
  ])
  const orphanNodes = nodes.filter(
    n => !connectedIds.has(n.id) && n.data.type !== 'text' && n.data.type !== 'sticky-note'
  ).length

  const unlabeledNodes = nodes.filter(
    n => !n.data.label?.trim() && n.data.type !== 'junction'
  ).length

  const selfLoops = edges.filter(e => e.source === e.target).length

  // Duplicate labels
  const labelCounts = new Map<string, number>()
  nodes.forEach(n => {
    const label = n.data.label?.trim().toLowerCase()
    if (label) {
      labelCounts.set(label, (labelCounts.get(label) || 0) + 1)
    }
  })
  const duplicateLabels = Array.from(labelCounts.values()).filter(c => c > 1).length

  // Source and sink nodes
  const nodesWithIncoming = new Set(edges.map(e => e.target))
  const nodesWithOutgoing = new Set(edges.map(e => e.source))

  const sourceNodes = nodes.filter(n => !nodesWithIncoming.has(n.id) && nodesWithOutgoing.has(n.id)).length
  const sinkNodes = nodes.filter(n => nodesWithIncoming.has(n.id) && !nodesWithOutgoing.has(n.id)).length

  // Hub nodes (most connected)
  const hubNodes = nodes
    .map(n => ({
      id: n.id,
      label: n.data.label || 'Unlabeled',
      connections: connectionCounts.get(n.id) || 0,
    }))
    .filter(n => n.connections > 0)
    .sort((a, b) => b.connections - a.connections)
    .slice(0, 5)

  // Bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  nodes.forEach(n => {
    const width = n.measured?.width || n.width || 100
    const height = n.measured?.height || n.height || 50
    minX = Math.min(minX, n.position.x)
    minY = Math.min(minY, n.position.y)
    maxX = Math.max(maxX, n.position.x + width)
    maxY = Math.max(maxY, n.position.y + height)
  })

  const boundingBox = {
    width: nodeCount > 0 ? Math.round(maxX - minX) : 0,
    height: nodeCount > 0 ? Math.round(maxY - minY) : 0,
    area: nodeCount > 0 ? Math.round((maxX - minX) * (maxY - minY)) : 0,
  }

  // Average node size
  let totalWidth = 0, totalHeight = 0
  nodes.forEach(n => {
    totalWidth += n.measured?.width || n.width || 100
    totalHeight += n.measured?.height || n.height || 50
  })

  const averageNodeSize = {
    width: nodeCount > 0 ? Math.round(totalWidth / nodeCount) : 0,
    height: nodeCount > 0 ? Math.round(totalHeight / nodeCount) : 0,
  }

  // Complex metrics
  const cycleCount = detectCycles(nodes, edges)
  const connectedComponents = findConnectedComponents(nodes, edges)
  const maxDepth = findMaxDepth(nodes, edges)

  return {
    nodeCount,
    edgeCount,
    layerCount,
    averageConnections: Math.round(averageConnections * 100) / 100,
    maxConnections,
    maxDepth,
    cycleCount,
    connectedComponents,
    shapeDistribution,
    topShapes,
    cloudProviders,
    orphanNodes,
    unlabeledNodes,
    selfLoops,
    duplicateLabels,
    sourceNodes,
    sinkNodes,
    hubNodes,
    boundingBox,
    averageNodeSize,
  }
}

// Get complexity score (0-100)
export function getComplexityScore(analytics: DiagramAnalytics): {
  score: number
  level: 'simple' | 'moderate' | 'complex' | 'very-complex'
  factors: string[]
} {
  let score = 0
  const factors: string[] = []

  // Node count factor (0-25)
  if (analytics.nodeCount > 50) {
    score += 25
    factors.push('Large number of nodes')
  } else if (analytics.nodeCount > 20) {
    score += 15
  } else if (analytics.nodeCount > 10) {
    score += 8
  } else {
    score += analytics.nodeCount * 0.5
  }

  // Edge density factor (0-25)
  if (analytics.averageConnections > 4) {
    score += 25
    factors.push('High connectivity')
  } else if (analytics.averageConnections > 2) {
    score += 15
  } else {
    score += analytics.averageConnections * 5
  }

  // Depth factor (0-20)
  if (analytics.maxDepth > 10) {
    score += 20
    factors.push('Deep hierarchy')
  } else if (analytics.maxDepth > 5) {
    score += 12
  } else {
    score += analytics.maxDepth * 2
  }

  // Cycles factor (0-15)
  if (analytics.cycleCount > 3) {
    score += 15
    factors.push('Multiple cycles')
  } else if (analytics.cycleCount > 0) {
    score += analytics.cycleCount * 5
    factors.push('Contains cycles')
  }

  // Components factor (0-15)
  if (analytics.connectedComponents > 5) {
    score += 15
    factors.push('Multiple disconnected sections')
  } else if (analytics.connectedComponents > 1) {
    score += analytics.connectedComponents * 3
  }

  score = Math.min(100, Math.round(score))

  let level: 'simple' | 'moderate' | 'complex' | 'very-complex'
  if (score < 25) level = 'simple'
  else if (score < 50) level = 'moderate'
  else if (score < 75) level = 'complex'
  else level = 'very-complex'

  return { score, level, factors }
}

export const analyticsService = {
  analyze: analyzeDiagram,
  getComplexityScore,
}
