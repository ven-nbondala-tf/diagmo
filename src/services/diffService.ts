import type { DiagramNode, DiagramEdge, DiagramVersion } from '@/types'

export type DiffStatus = 'added' | 'removed' | 'modified' | 'unchanged'

export interface NodeDiff {
  nodeId: string
  label: string
  status: DiffStatus
  changes?: string[]  // What changed for 'modified' nodes
}

export interface EdgeDiff {
  edgeId: string
  label: string
  status: DiffStatus
  changes?: string[]
}

export interface VersionDiffResult {
  summary: {
    nodesAdded: number
    nodesRemoved: number
    nodesModified: number
    nodesUnchanged: number
    edgesAdded: number
    edgesRemoved: number
    edgesModified: number
    edgesUnchanged: number
  }
  nodeDiffs: NodeDiff[]
  edgeDiffs: EdgeDiff[]
}

/**
 * Compare two diagram versions and return the differences
 * @param older - The older version (base)
 * @param newer - The newer version (comparison)
 */
export function compareVersions(
  older: DiagramVersion,
  newer: DiagramVersion
): VersionDiffResult {
  const olderNodesMap = new Map(older.nodes.map(n => [n.id, n]))
  const newerNodesMap = new Map(newer.nodes.map(n => [n.id, n]))
  const olderEdgesMap = new Map(older.edges.map(e => [e.id, e]))
  const newerEdgesMap = new Map(newer.edges.map(e => [e.id, e]))

  const nodeDiffs: NodeDiff[] = []
  const edgeDiffs: EdgeDiff[] = []

  const summary = {
    nodesAdded: 0,
    nodesRemoved: 0,
    nodesModified: 0,
    nodesUnchanged: 0,
    edgesAdded: 0,
    edgesRemoved: 0,
    edgesModified: 0,
    edgesUnchanged: 0,
  }

  // Check nodes in newer version
  for (const [id, newNode] of newerNodesMap) {
    const oldNode = olderNodesMap.get(id)
    const label = newNode.data?.label || newNode.data?.shapeType || 'Node'

    if (!oldNode) {
      // Node was added
      nodeDiffs.push({ nodeId: id, label, status: 'added' })
      summary.nodesAdded++
    } else {
      // Node exists in both - check for modifications
      const changes = getNodeChanges(oldNode, newNode)
      if (changes.length > 0) {
        nodeDiffs.push({ nodeId: id, label, status: 'modified', changes })
        summary.nodesModified++
      } else {
        nodeDiffs.push({ nodeId: id, label, status: 'unchanged' })
        summary.nodesUnchanged++
      }
    }
  }

  // Check for removed nodes (in older but not in newer)
  for (const [id, oldNode] of olderNodesMap) {
    if (!newerNodesMap.has(id)) {
      const label = oldNode.data?.label || oldNode.data?.shapeType || 'Node'
      nodeDiffs.push({ nodeId: id, label, status: 'removed' })
      summary.nodesRemoved++
    }
  }

  // Check edges in newer version
  for (const [id, newEdge] of newerEdgesMap) {
    const oldEdge = olderEdgesMap.get(id)
    const label = newEdge.data?.label || `${newEdge.source} → ${newEdge.target}`

    if (!oldEdge) {
      edgeDiffs.push({ edgeId: id, label, status: 'added' })
      summary.edgesAdded++
    } else {
      const changes = getEdgeChanges(oldEdge, newEdge)
      if (changes.length > 0) {
        edgeDiffs.push({ edgeId: id, label, status: 'modified', changes })
        summary.edgesModified++
      } else {
        edgeDiffs.push({ edgeId: id, label, status: 'unchanged' })
        summary.edgesUnchanged++
      }
    }
  }

  // Check for removed edges
  for (const [id, oldEdge] of olderEdgesMap) {
    if (!newerEdgesMap.has(id)) {
      const label = oldEdge.data?.label || `${oldEdge.source} → ${oldEdge.target}`
      edgeDiffs.push({ edgeId: id, label, status: 'removed' })
      summary.edgesRemoved++
    }
  }

  // Sort diffs: added first, then modified, then removed, then unchanged
  const statusOrder: Record<DiffStatus, number> = {
    added: 0,
    modified: 1,
    removed: 2,
    unchanged: 3,
  }

  nodeDiffs.sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
  edgeDiffs.sort((a, b) => statusOrder[a.status] - statusOrder[b.status])

  return { summary, nodeDiffs, edgeDiffs }
}

/**
 * Get list of changes between two nodes
 */
function getNodeChanges(oldNode: DiagramNode, newNode: DiagramNode): string[] {
  const changes: string[] = []

  // Position change
  if (
    Math.abs(oldNode.position.x - newNode.position.x) > 1 ||
    Math.abs(oldNode.position.y - newNode.position.y) > 1
  ) {
    changes.push('Position moved')
  }

  // Size change
  if (oldNode.width !== newNode.width || oldNode.height !== newNode.height) {
    changes.push('Size changed')
  }

  // Label change
  if (oldNode.data?.label !== newNode.data?.label) {
    changes.push('Label changed')
  }

  // Shape type change
  if (oldNode.data?.shapeType !== newNode.data?.shapeType) {
    changes.push('Shape type changed')
  }

  // Style changes
  const oldStyle = oldNode.data?.style || {}
  const newStyle = newNode.data?.style || {}

  if (oldStyle.backgroundColor !== newStyle.backgroundColor) {
    changes.push('Background color changed')
  }
  if (oldStyle.borderColor !== newStyle.borderColor) {
    changes.push('Border color changed')
  }
  if (oldStyle.borderWidth !== newStyle.borderWidth) {
    changes.push('Border width changed')
  }
  if (oldStyle.fontSize !== newStyle.fontSize) {
    changes.push('Font size changed')
  }
  if (oldStyle.textColor !== newStyle.textColor) {
    changes.push('Text color changed')
  }

  return changes
}

/**
 * Get list of changes between two edges
 */
function getEdgeChanges(oldEdge: DiagramEdge, newEdge: DiagramEdge): string[] {
  const changes: string[] = []

  // Connection change
  if (oldEdge.source !== newEdge.source) {
    changes.push('Source changed')
  }
  if (oldEdge.target !== newEdge.target) {
    changes.push('Target changed')
  }

  // Label change
  if (oldEdge.data?.label !== newEdge.data?.label) {
    changes.push('Label changed')
  }

  // Style changes
  const oldStyle = oldEdge.data?.style || {}
  const newStyle = newEdge.data?.style || {}

  if (oldStyle.strokeColor !== newStyle.strokeColor) {
    changes.push('Stroke color changed')
  }
  if (oldStyle.strokeWidth !== newStyle.strokeWidth) {
    changes.push('Stroke width changed')
  }
  if (oldStyle.strokeStyle !== newStyle.strokeStyle) {
    changes.push('Stroke style changed')
  }
  if (oldStyle.animated !== newStyle.animated) {
    changes.push('Animation changed')
  }

  return changes
}

/**
 * Get status color for highlighting
 */
export function getDiffStatusColor(status: DiffStatus): string {
  switch (status) {
    case 'added':
      return '#22c55e' // green-500
    case 'removed':
      return '#ef4444' // red-500
    case 'modified':
      return '#eab308' // yellow-500
    case 'unchanged':
      return '#6b7280' // gray-500
  }
}

/**
 * Get status background color for highlighting
 */
export function getDiffStatusBgColor(status: DiffStatus): string {
  switch (status) {
    case 'added':
      return 'rgba(34, 197, 94, 0.15)' // green with opacity
    case 'removed':
      return 'rgba(239, 68, 68, 0.15)' // red with opacity
    case 'modified':
      return 'rgba(234, 179, 8, 0.15)' // yellow with opacity
    case 'unchanged':
      return 'transparent'
  }
}

export const diffService = {
  compareVersions,
  getDiffStatusColor,
  getDiffStatusBgColor,
}
