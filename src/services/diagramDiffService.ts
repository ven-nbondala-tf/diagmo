/**
 * Diagram Diff Service
 * Compares two diagrams and identifies differences
 */

import type { DiagramNode, DiagramEdge } from '@/types'

export interface NodeDiff {
  id: string
  type: 'added' | 'removed' | 'modified' | 'unchanged'
  node: DiagramNode
  previousNode?: DiagramNode
  changes?: {
    field: string
    oldValue: unknown
    newValue: unknown
  }[]
}

export interface EdgeDiff {
  id: string
  type: 'added' | 'removed' | 'modified' | 'unchanged'
  edge: DiagramEdge
  previousEdge?: DiagramEdge
  changes?: {
    field: string
    oldValue: unknown
    newValue: unknown
  }[]
}

export interface DiffResult {
  nodes: {
    added: NodeDiff[]
    removed: NodeDiff[]
    modified: NodeDiff[]
    unchanged: NodeDiff[]
  }
  edges: {
    added: EdgeDiff[]
    removed: EdgeDiff[]
    modified: EdgeDiff[]
    unchanged: EdgeDiff[]
  }
  summary: {
    totalChanges: number
    nodesAdded: number
    nodesRemoved: number
    nodesModified: number
    edgesAdded: number
    edgesRemoved: number
    edgesModified: number
  }
}

/**
 * Compare two sets of nodes and edges
 */
export function compareDiagrams(
  baseNodes: DiagramNode[],
  baseEdges: DiagramEdge[],
  compareNodes: DiagramNode[],
  compareEdges: DiagramEdge[]
): DiffResult {
  const nodeDiffs = compareNodes_(baseNodes, compareNodes)
  const edgeDiffs = compareEdges_(baseEdges, compareEdges)

  const summary = {
    totalChanges:
      nodeDiffs.added.length +
      nodeDiffs.removed.length +
      nodeDiffs.modified.length +
      edgeDiffs.added.length +
      edgeDiffs.removed.length +
      edgeDiffs.modified.length,
    nodesAdded: nodeDiffs.added.length,
    nodesRemoved: nodeDiffs.removed.length,
    nodesModified: nodeDiffs.modified.length,
    edgesAdded: edgeDiffs.added.length,
    edgesRemoved: edgeDiffs.removed.length,
    edgesModified: edgeDiffs.modified.length,
  }

  return {
    nodes: nodeDiffs,
    edges: edgeDiffs,
    summary,
  }
}

/**
 * Compare nodes between two versions
 */
function compareNodes_(
  baseNodes: DiagramNode[],
  compareNodes: DiagramNode[]
): DiffResult['nodes'] {
  const baseMap = new Map(baseNodes.map(n => [n.id, n]))
  const compareMap = new Map(compareNodes.map(n => [n.id, n]))

  const added: NodeDiff[] = []
  const removed: NodeDiff[] = []
  const modified: NodeDiff[] = []
  const unchanged: NodeDiff[] = []

  // Find added and modified nodes
  for (const [id, node] of compareMap) {
    const baseNode = baseMap.get(id)

    if (!baseNode) {
      added.push({ id, type: 'added', node })
    } else {
      const changes = getNodeChanges(baseNode, node)
      if (changes.length > 0) {
        modified.push({
          id,
          type: 'modified',
          node,
          previousNode: baseNode,
          changes,
        })
      } else {
        unchanged.push({ id, type: 'unchanged', node })
      }
    }
  }

  // Find removed nodes
  for (const [id, node] of baseMap) {
    if (!compareMap.has(id)) {
      removed.push({ id, type: 'removed', node })
    }
  }

  return { added, removed, modified, unchanged }
}

/**
 * Compare edges between two versions
 */
function compareEdges_(
  baseEdges: DiagramEdge[],
  compareEdges: DiagramEdge[]
): DiffResult['edges'] {
  const baseMap = new Map(baseEdges.map(e => [e.id, e]))
  const compareMap = new Map(compareEdges.map(e => [e.id, e]))

  const added: EdgeDiff[] = []
  const removed: EdgeDiff[] = []
  const modified: EdgeDiff[] = []
  const unchanged: EdgeDiff[] = []

  // Find added and modified edges
  for (const [id, edge] of compareMap) {
    const baseEdge = baseMap.get(id)

    if (!baseEdge) {
      added.push({ id, type: 'added', edge })
    } else {
      const changes = getEdgeChanges(baseEdge, edge)
      if (changes.length > 0) {
        modified.push({
          id,
          type: 'modified',
          edge,
          previousEdge: baseEdge,
          changes,
        })
      } else {
        unchanged.push({ id, type: 'unchanged', edge })
      }
    }
  }

  // Find removed edges
  for (const [id, edge] of baseMap) {
    if (!compareMap.has(id)) {
      removed.push({ id, type: 'removed', edge })
    }
  }

  return { added, removed, modified, unchanged }
}

/**
 * Get specific changes between two nodes
 */
function getNodeChanges(
  baseNode: DiagramNode,
  compareNode: DiagramNode
): { field: string; oldValue: unknown; newValue: unknown }[] {
  const changes: { field: string; oldValue: unknown; newValue: unknown }[] = []

  // Check position
  if (
    baseNode.position.x !== compareNode.position.x ||
    baseNode.position.y !== compareNode.position.y
  ) {
    changes.push({
      field: 'position',
      oldValue: baseNode.position,
      newValue: compareNode.position,
    })
  }

  // Check label
  if (baseNode.data.label !== compareNode.data.label) {
    changes.push({
      field: 'label',
      oldValue: baseNode.data.label,
      newValue: compareNode.data.label,
    })
  }

  // Check type
  if (baseNode.data.type !== compareNode.data.type) {
    changes.push({
      field: 'type',
      oldValue: baseNode.data.type,
      newValue: compareNode.data.type,
    })
  }

  // Check dimensions
  if (baseNode.width !== compareNode.width || baseNode.height !== compareNode.height) {
    changes.push({
      field: 'dimensions',
      oldValue: { width: baseNode.width, height: baseNode.height },
      newValue: { width: compareNode.width, height: compareNode.height },
    })
  }

  // Check style changes
  const baseStyle = baseNode.data.style || {}
  const compareStyle = compareNode.data.style || {}
  const styleKeys = new Set([...Object.keys(baseStyle), ...Object.keys(compareStyle)])

  for (const key of styleKeys) {
    const baseValue = (baseStyle as Record<string, unknown>)[key]
    const compareValue = (compareStyle as Record<string, unknown>)[key]
    if (JSON.stringify(baseValue) !== JSON.stringify(compareValue)) {
      changes.push({
        field: `style.${key}`,
        oldValue: baseValue,
        newValue: compareValue,
      })
    }
  }

  return changes
}

/**
 * Get specific changes between two edges
 */
function getEdgeChanges(
  baseEdge: DiagramEdge,
  compareEdge: DiagramEdge
): { field: string; oldValue: unknown; newValue: unknown }[] {
  const changes: { field: string; oldValue: unknown; newValue: unknown }[] = []

  // Check source/target
  if (baseEdge.source !== compareEdge.source) {
    changes.push({
      field: 'source',
      oldValue: baseEdge.source,
      newValue: compareEdge.source,
    })
  }

  if (baseEdge.target !== compareEdge.target) {
    changes.push({
      field: 'target',
      oldValue: baseEdge.target,
      newValue: compareEdge.target,
    })
  }

  // Check label
  if (baseEdge.label !== compareEdge.label) {
    changes.push({
      field: 'label',
      oldValue: baseEdge.label,
      newValue: compareEdge.label,
    })
  }

  // Check type
  if (baseEdge.type !== compareEdge.type) {
    changes.push({
      field: 'type',
      oldValue: baseEdge.type,
      newValue: compareEdge.type,
    })
  }

  // Check style
  if (JSON.stringify(baseEdge.style) !== JSON.stringify(compareEdge.style)) {
    changes.push({
      field: 'style',
      oldValue: baseEdge.style,
      newValue: compareEdge.style,
    })
  }

  return changes
}

/**
 * Generate a human-readable summary of changes
 */
export function generateDiffSummary(diff: DiffResult): string {
  const lines: string[] = []

  if (diff.summary.totalChanges === 0) {
    return 'No changes detected'
  }

  lines.push(`Total changes: ${diff.summary.totalChanges}`)
  lines.push('')

  if (diff.summary.nodesAdded > 0) {
    lines.push(`Nodes added: ${diff.summary.nodesAdded}`)
    diff.nodes.added.forEach(n => {
      lines.push(`  + ${n.node.data.label || n.node.data.type}`)
    })
  }

  if (diff.summary.nodesRemoved > 0) {
    lines.push(`Nodes removed: ${diff.summary.nodesRemoved}`)
    diff.nodes.removed.forEach(n => {
      lines.push(`  - ${n.node.data.label || n.node.data.type}`)
    })
  }

  if (diff.summary.nodesModified > 0) {
    lines.push(`Nodes modified: ${diff.summary.nodesModified}`)
    diff.nodes.modified.forEach(n => {
      lines.push(`  ~ ${n.node.data.label || n.node.data.type}`)
      n.changes?.forEach(c => {
        lines.push(`      ${c.field}: ${formatValue(c.oldValue)} → ${formatValue(c.newValue)}`)
      })
    })
  }

  if (diff.summary.edgesAdded > 0) {
    lines.push(`Connections added: ${diff.summary.edgesAdded}`)
  }

  if (diff.summary.edgesRemoved > 0) {
    lines.push(`Connections removed: ${diff.summary.edgesRemoved}`)
  }

  if (diff.summary.edgesModified > 0) {
    lines.push(`Connections modified: ${diff.summary.edgesModified}`)
  }

  return lines.join('\n')
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return 'none'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export const diagramDiffService = {
  compareDiagrams,
  generateDiffSummary,
}
