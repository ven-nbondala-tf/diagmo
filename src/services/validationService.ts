import type { DiagramNode, DiagramEdge } from '@/types'

export type ValidationSeverity = 'error' | 'warning' | 'info'

export interface ValidationResult {
  ruleId: string
  ruleName: string
  severity: ValidationSeverity
  nodeId?: string
  edgeId?: string
  message: string
}

export interface ValidationRule {
  id: string
  name: string
  description: string
  severity: ValidationSeverity
  enabled: boolean
  validate: (nodes: DiagramNode[], edges: DiagramEdge[]) => ValidationResult[]
}

// Built-in validation rules
export const BUILTIN_RULES: ValidationRule[] = [
  {
    id: 'orphan-nodes',
    name: 'Orphan Nodes',
    description: 'Find nodes with no connections',
    severity: 'warning',
    enabled: true,
    validate: (nodes, edges) => {
      const connectedIds = new Set([
        ...edges.map(e => e.source),
        ...edges.map(e => e.target),
      ])

      return nodes
        .filter(n => !connectedIds.has(n.id))
        .filter(n => n.data.type !== 'text' && n.data.type !== 'sticky-note') // Exclude text/notes
        .map(n => ({
          ruleId: 'orphan-nodes',
          ruleName: 'Orphan Nodes',
          severity: 'warning' as ValidationSeverity,
          nodeId: n.id,
          message: `"${n.data.label || 'Unlabeled node'}" has no connections`,
        }))
    },
  },
  {
    id: 'missing-labels',
    name: 'Missing Labels',
    description: 'Find nodes without labels',
    severity: 'info',
    enabled: true,
    validate: (nodes) => {
      return nodes
        .filter(n => !n.data.label?.trim())
        .filter(n => n.data.type !== 'junction') // Junctions don't need labels
        .map(n => ({
          ruleId: 'missing-labels',
          ruleName: 'Missing Labels',
          severity: 'info' as ValidationSeverity,
          nodeId: n.id,
          message: `${n.data.type} node is missing a label`,
        }))
    },
  },
  {
    id: 'duplicate-labels',
    name: 'Duplicate Labels',
    description: 'Find nodes with identical labels',
    severity: 'info',
    enabled: true,
    validate: (nodes) => {
      const labelCounts = new Map<string, string[]>()

      nodes.forEach(n => {
        const label = n.data.label?.trim().toLowerCase()
        if (label) {
          const existing = labelCounts.get(label) || []
          existing.push(n.id)
          labelCounts.set(label, existing)
        }
      })

      const results: ValidationResult[] = []
      labelCounts.forEach((nodeIds, label) => {
        if (nodeIds.length > 1) {
          nodeIds.forEach(nodeId => {
            results.push({
              ruleId: 'duplicate-labels',
              ruleName: 'Duplicate Labels',
              severity: 'info',
              nodeId,
              message: `Duplicate label "${label}" (${nodeIds.length} nodes)`,
            })
          })
        }
      })

      return results
    },
  },
  {
    id: 'decision-outputs',
    name: 'Decision Outputs',
    description: 'Decision nodes should have 2+ outgoing connections',
    severity: 'warning',
    enabled: true,
    validate: (nodes, edges) => {
      const decisionNodes = nodes.filter(n =>
        n.data.type === 'decision' || n.data.type === 'diamond'
      )

      return decisionNodes
        .filter(n => {
          const outgoingCount = edges.filter(e => e.source === n.id).length
          return outgoingCount < 2
        })
        .map(n => ({
          ruleId: 'decision-outputs',
          ruleName: 'Decision Outputs',
          severity: 'warning' as ValidationSeverity,
          nodeId: n.id,
          message: `Decision "${n.data.label || 'Unlabeled'}" should have at least 2 outgoing connections`,
        }))
    },
  },
  {
    id: 'self-loops',
    name: 'Self Loops',
    description: 'Find edges that connect a node to itself',
    severity: 'warning',
    enabled: true,
    validate: (_, edges) => {
      return edges
        .filter(e => e.source === e.target)
        .map(e => ({
          ruleId: 'self-loops',
          ruleName: 'Self Loops',
          severity: 'warning' as ValidationSeverity,
          edgeId: e.id,
          nodeId: e.source,
          message: 'Edge connects node to itself',
        }))
    },
  },
  {
    id: 'unlabeled-edges',
    name: 'Unlabeled Edges',
    description: 'Find edges without labels (from decision nodes)',
    severity: 'info',
    enabled: true,
    validate: (nodes, edges) => {
      const decisionNodeIds = new Set(
        nodes
          .filter(n => n.data.type === 'decision' || n.data.type === 'diamond')
          .map(n => n.id)
      )

      return edges
        .filter(e => decisionNodeIds.has(e.source))
        .filter(e => !e.data?.label?.trim())
        .map(e => ({
          ruleId: 'unlabeled-edges',
          ruleName: 'Unlabeled Edges',
          severity: 'info' as ValidationSeverity,
          edgeId: e.id,
          message: 'Decision branch is missing a label (Yes/No, etc.)',
        }))
    },
  },
  {
    id: 'dead-ends',
    name: 'Dead Ends',
    description: 'Find non-terminal nodes with no outgoing connections',
    severity: 'warning',
    enabled: true,
    validate: (nodes, edges) => {
      // Terminal node types that don't need outgoing connections
      const terminalTypes = new Set([
        'terminator', 'end', 'text', 'sticky-note', 'note', 'comment',
        'database', 'storage', 'data-store', 'cylinder'
      ])

      const nodesWithOutgoing = new Set(edges.map(e => e.source))
      const nodesWithIncoming = new Set(edges.map(e => e.target))

      return nodes
        .filter(n => !terminalTypes.has(n.data.type))
        .filter(n => nodesWithIncoming.has(n.id)) // Has incoming
        .filter(n => !nodesWithOutgoing.has(n.id)) // No outgoing
        .map(n => ({
          ruleId: 'dead-ends',
          ruleName: 'Dead Ends',
          severity: 'warning' as ValidationSeverity,
          nodeId: n.id,
          message: `"${n.data.label || 'Unlabeled'}" has no outgoing connections (dead end)`,
        }))
    },
  },
  {
    id: 'hidden-nodes',
    name: 'Hidden Nodes',
    description: 'Find nodes on hidden layers',
    severity: 'info',
    enabled: true,
    validate: (nodes) => {
      return nodes
        .filter(n => n.hidden === true)
        .map(n => ({
          ruleId: 'hidden-nodes',
          ruleName: 'Hidden Nodes',
          severity: 'info' as ValidationSeverity,
          nodeId: n.id,
          message: `"${n.data.label || 'Unlabeled'}" is hidden`,
        }))
    },
  },
  {
    id: 'overlapping-nodes',
    name: 'Overlapping Nodes',
    description: 'Find nodes that overlap each other',
    severity: 'warning',
    enabled: true,
    validate: (nodes) => {
      const results: ValidationResult[] = []
      const checked = new Set<string>()

      for (let i = 0; i < nodes.length; i++) {
        const nodeA = nodes[i]
        if (!nodeA) continue
        const widthA = nodeA.measured?.width || nodeA.width || 100
        const heightA = nodeA.measured?.height || nodeA.height || 50

        for (let j = i + 1; j < nodes.length; j++) {
          const nodeB = nodes[j]
          if (!nodeB) continue
          const widthB = nodeB.measured?.width || nodeB.width || 100
          const heightB = nodeB.measured?.height || nodeB.height || 50

          // Check overlap
          const overlapX =
            nodeA.position.x < nodeB.position.x + widthB &&
            nodeA.position.x + widthA > nodeB.position.x
          const overlapY =
            nodeA.position.y < nodeB.position.y + heightB &&
            nodeA.position.y + heightA > nodeB.position.y

          if (overlapX && overlapY) {
            const pairKey = [nodeA.id, nodeB.id].sort().join('-')
            if (!checked.has(pairKey)) {
              checked.add(pairKey)
              results.push({
                ruleId: 'overlapping-nodes',
                ruleName: 'Overlapping Nodes',
                severity: 'warning',
                nodeId: nodeA.id,
                message: `"${nodeA.data.label || 'Node'}" overlaps with "${nodeB.data.label || 'Node'}"`,
              })
            }
          }
        }
      }

      return results
    },
  },
]

// Validation service
export const validationService = {
  /**
   * Run all enabled validation rules
   */
  validate(
    nodes: DiagramNode[],
    edges: DiagramEdge[],
    rules: ValidationRule[] = BUILTIN_RULES
  ): ValidationResult[] {
    const results: ValidationResult[] = []

    for (const rule of rules) {
      if (rule.enabled) {
        try {
          const ruleResults = rule.validate(nodes, edges)
          results.push(...ruleResults)
        } catch (error) {
          console.error(`Validation rule ${rule.id} failed:`, error)
        }
      }
    }

    // Sort by severity (errors first, then warnings, then info)
    const severityOrder: Record<ValidationSeverity, number> = {
      error: 0,
      warning: 1,
      info: 2,
    }

    return results.sort((a, b) =>
      severityOrder[a.severity] - severityOrder[b.severity]
    )
  },

  /**
   * Get summary statistics
   */
  getSummary(results: ValidationResult[]): {
    errors: number
    warnings: number
    info: number
    total: number
  } {
    return {
      errors: results.filter(r => r.severity === 'error').length,
      warnings: results.filter(r => r.severity === 'warning').length,
      info: results.filter(r => r.severity === 'info').length,
      total: results.length,
    }
  },

  /**
   * Get available rules
   */
  getRules(): ValidationRule[] {
    return BUILTIN_RULES
  },
}
