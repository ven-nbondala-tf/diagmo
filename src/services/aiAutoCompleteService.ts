/**
 * AI Auto-Complete Service
 * Provides intelligent suggestions for diagram completion based on context and patterns
 */

import { nanoid } from 'nanoid'
import type { DiagramNode, DiagramEdge, ShapeType } from '@/types'

// User action tracking
export interface UserAction {
  type: 'add-node' | 'add-edge' | 'delete-node' | 'delete-edge' | 'modify-node' | 'select-node'
  nodeId?: string
  nodeType?: ShapeType
  timestamp: number
}

// Auto-complete suggestion
export interface AutoCompleteSuggestion {
  id: string
  type: 'node' | 'edge' | 'pattern'
  confidence: number // 0-1
  preview: {
    nodes: DiagramNode[]
    edges: DiagramEdge[]
  }
  description: string
  pattern?: string
}

// Common diagram patterns
interface DiagramPattern {
  name: string
  description: string
  trigger: (context: PatternContext) => boolean
  generate: (context: PatternContext) => AutoCompleteSuggestion
}

interface PatternContext {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  selectedNode?: DiagramNode
  recentActions: UserAction[]
  lastAddedNode?: DiagramNode
}

// Pattern definitions
const PATTERNS: DiagramPattern[] = [
  // If-Then-Else Pattern
  {
    name: 'if-then-else',
    description: 'Add decision branches (Yes/No paths)',
    trigger: (ctx) => {
      const lastNode = ctx.lastAddedNode || ctx.selectedNode
      return lastNode?.data.type === 'diamond'
    },
    generate: (ctx) => {
      const sourceNode = ctx.lastAddedNode || ctx.selectedNode
      if (!sourceNode) throw new Error('No source node')

      const baseX = sourceNode.position.x
      const baseY = sourceNode.position.y + 150

      const yesNode: DiagramNode = {
        id: `suggestion-${nanoid(6)}`,
        type: 'custom',
        position: { x: baseX - 150, y: baseY },
        data: { type: 'rectangle', label: 'Yes Branch' },
      }

      const noNode: DiagramNode = {
        id: `suggestion-${nanoid(6)}`,
        type: 'custom',
        position: { x: baseX + 150, y: baseY },
        data: { type: 'rectangle', label: 'No Branch' },
      }

      const yesEdge: DiagramEdge = {
        id: `suggestion-edge-${nanoid(6)}`,
        source: sourceNode.id,
        target: yesNode.id,
        type: 'labeled',
        label: 'Yes',
      }

      const noEdge: DiagramEdge = {
        id: `suggestion-edge-${nanoid(6)}`,
        source: sourceNode.id,
        target: noNode.id,
        type: 'labeled',
        label: 'No',
      }

      return {
        id: nanoid(),
        type: 'pattern',
        confidence: 0.9,
        preview: {
          nodes: [yesNode, noNode],
          edges: [yesEdge, noEdge],
        },
        description: 'Add Yes/No decision branches',
        pattern: 'if-then-else',
      }
    },
  },

  // Try-Catch Pattern
  {
    name: 'try-catch',
    description: 'Add error handling flow',
    trigger: (ctx) => {
      const lastNode = ctx.lastAddedNode || ctx.selectedNode
      const nodeType = lastNode?.data.type as string
      // Trigger for process/action nodes
      return nodeType === 'rectangle' || nodeType === 'rounded-rectangle'
    },
    generate: (ctx) => {
      const sourceNode = ctx.lastAddedNode || ctx.selectedNode
      if (!sourceNode) throw new Error('No source node')

      const baseX = sourceNode.position.x
      const baseY = sourceNode.position.y

      const successNode: DiagramNode = {
        id: `suggestion-${nanoid(6)}`,
        type: 'custom',
        position: { x: baseX, y: baseY + 120 },
        data: { type: 'rectangle', label: 'Success' },
      }

      const errorNode: DiagramNode = {
        id: `suggestion-${nanoid(6)}`,
        type: 'custom',
        position: { x: baseX + 200, y: baseY + 60 },
        data: { type: 'hexagon', label: 'Error Handler' },
      }

      const successEdge: DiagramEdge = {
        id: `suggestion-edge-${nanoid(6)}`,
        source: sourceNode.id,
        target: successNode.id,
        type: 'labeled',
        label: 'success',
        style: { stroke: '#22c55e' },
      }

      const errorEdge: DiagramEdge = {
        id: `suggestion-edge-${nanoid(6)}`,
        source: sourceNode.id,
        target: errorNode.id,
        type: 'labeled',
        label: 'error',
        style: { stroke: '#ef4444' },
      }

      return {
        id: nanoid(),
        type: 'pattern',
        confidence: 0.7,
        preview: {
          nodes: [successNode, errorNode],
          edges: [successEdge, errorEdge],
        },
        description: 'Add success/error handling paths',
        pattern: 'try-catch',
      }
    },
  },

  // API Flow Pattern
  {
    name: 'api-flow',
    description: 'Add API request/response flow',
    trigger: (ctx) => {
      const lastNode = ctx.lastAddedNode || ctx.selectedNode
      const nodeType = lastNode?.data.type as string
      // Trigger for API gateway or service nodes
      return nodeType?.includes('api') ||
             nodeType?.includes('gateway') ||
             nodeType === 'aws-api-gateway' ||
             nodeType === 'azure-api-management'
    },
    generate: (ctx) => {
      const sourceNode = ctx.lastAddedNode || ctx.selectedNode
      if (!sourceNode) throw new Error('No source node')

      const baseX = sourceNode.position.x
      const baseY = sourceNode.position.y

      // Determine cloud provider from source node
      const nodeType = sourceNode.data.type as string
      let lambdaType: ShapeType = 'rectangle'
      let dbType: ShapeType = 'cylinder'

      if (nodeType.startsWith('aws-')) {
        lambdaType = 'aws-lambda'
        dbType = 'aws-dynamodb'
      } else if (nodeType.startsWith('azure-')) {
        lambdaType = 'azure-functions'
        dbType = 'azure-cosmos'
      } else if (nodeType.startsWith('gcp-')) {
        lambdaType = 'gcp-cloud-functions'
        dbType = 'gcp-firestore'
      }

      const lambdaNode: DiagramNode = {
        id: `suggestion-${nanoid(6)}`,
        type: 'custom',
        position: { x: baseX + 180, y: baseY },
        data: { type: lambdaType, label: 'Function' },
      }

      const dbNode: DiagramNode = {
        id: `suggestion-${nanoid(6)}`,
        type: 'custom',
        position: { x: baseX + 360, y: baseY },
        data: { type: dbType, label: 'Database' },
      }

      const requestEdge: DiagramEdge = {
        id: `suggestion-edge-${nanoid(6)}`,
        source: sourceNode.id,
        target: lambdaNode.id,
        type: 'labeled',
        label: 'request',
      }

      const dbEdge: DiagramEdge = {
        id: `suggestion-edge-${nanoid(6)}`,
        source: lambdaNode.id,
        target: dbNode.id,
        type: 'labeled',
        label: 'query',
      }

      return {
        id: nanoid(),
        type: 'pattern',
        confidence: 0.85,
        preview: {
          nodes: [lambdaNode, dbNode],
          edges: [requestEdge, dbEdge],
        },
        description: 'Add API processing flow (Function + Database)',
        pattern: 'api-flow',
      }
    },
  },

  // Loop Pattern
  {
    name: 'loop',
    description: 'Add loop/iteration flow',
    trigger: (ctx) => {
      const lastNode = ctx.lastAddedNode || ctx.selectedNode
      const label = (lastNode?.data.label as string)?.toLowerCase() || ''
      return label.includes('for') ||
             label.includes('while') ||
             label.includes('loop') ||
             label.includes('iterate') ||
             label.includes('each')
    },
    generate: (ctx) => {
      const sourceNode = ctx.lastAddedNode || ctx.selectedNode
      if (!sourceNode) throw new Error('No source node')

      const baseX = sourceNode.position.x
      const baseY = sourceNode.position.y

      const processNode: DiagramNode = {
        id: `suggestion-${nanoid(6)}`,
        type: 'custom',
        position: { x: baseX, y: baseY + 100 },
        data: { type: 'rectangle', label: 'Process Item' },
      }

      const checkNode: DiagramNode = {
        id: `suggestion-${nanoid(6)}`,
        type: 'custom',
        position: { x: baseX, y: baseY + 200 },
        data: { type: 'diamond', label: 'More?' },
      }

      const exitNode: DiagramNode = {
        id: `suggestion-${nanoid(6)}`,
        type: 'custom',
        position: { x: baseX + 180, y: baseY + 200 },
        data: { type: 'rounded-rectangle', label: 'Done' },
      }

      return {
        id: nanoid(),
        type: 'pattern',
        confidence: 0.8,
        preview: {
          nodes: [processNode, checkNode, exitNode],
          edges: [
            { id: nanoid(), source: sourceNode.id, target: processNode.id, type: 'labeled' },
            { id: nanoid(), source: processNode.id, target: checkNode.id, type: 'labeled' },
            { id: nanoid(), source: checkNode.id, target: sourceNode.id, type: 'labeled', label: 'Yes' },
            { id: nanoid(), source: checkNode.id, target: exitNode.id, type: 'labeled', label: 'No' },
          ],
        },
        description: 'Add loop iteration with exit condition',
        pattern: 'loop',
      }
    },
  },

  // Continue Flow Pattern (generic next step)
  {
    name: 'continue',
    description: 'Add next step in flow',
    trigger: (ctx) => {
      const lastNode = ctx.lastAddedNode || ctx.selectedNode
      if (!lastNode) return false

      // Check if node has no outgoing edges
      const hasOutgoing = ctx.edges.some(e => e.source === lastNode.id)
      return !hasOutgoing
    },
    generate: (ctx) => {
      const sourceNode = ctx.lastAddedNode || ctx.selectedNode
      if (!sourceNode) throw new Error('No source node')

      const baseX = sourceNode.position.x
      const baseY = sourceNode.position.y

      // Suggest same type of node
      const nodeType = (sourceNode.data.type as ShapeType) || 'rectangle'

      const nextNode: DiagramNode = {
        id: `suggestion-${nanoid(6)}`,
        type: 'custom',
        position: { x: baseX, y: baseY + 120 },
        data: { type: nodeType, label: 'Next Step' },
      }

      const edge: DiagramEdge = {
        id: `suggestion-edge-${nanoid(6)}`,
        source: sourceNode.id,
        target: nextNode.id,
        type: 'labeled',
      }

      return {
        id: nanoid(),
        type: 'node',
        confidence: 0.5,
        preview: {
          nodes: [nextNode],
          edges: [edge],
        },
        description: 'Add next step in flow',
        pattern: 'continue',
      }
    },
  },

  // AWS Three-Tier Pattern
  {
    name: 'aws-three-tier',
    description: 'Add AWS three-tier architecture',
    trigger: (ctx) => {
      const lastNode = ctx.lastAddedNode || ctx.selectedNode
      const nodeType = lastNode?.data.type as string
      return nodeType === 'aws-elb' || nodeType === 'aws-alb' || nodeType === 'aws-cloudfront'
    },
    generate: (ctx) => {
      const sourceNode = ctx.lastAddedNode || ctx.selectedNode
      if (!sourceNode) throw new Error('No source node')

      const baseX = sourceNode.position.x
      const baseY = sourceNode.position.y

      const ec2Node: DiagramNode = {
        id: `suggestion-${nanoid(6)}`,
        type: 'custom',
        position: { x: baseX + 180, y: baseY },
        data: { type: 'aws-ec2', label: 'Web Server' },
      }

      const rdsNode: DiagramNode = {
        id: `suggestion-${nanoid(6)}`,
        type: 'custom',
        position: { x: baseX + 360, y: baseY },
        data: { type: 'aws-rds', label: 'Database' },
      }

      return {
        id: nanoid(),
        type: 'pattern',
        confidence: 0.88,
        preview: {
          nodes: [ec2Node, rdsNode],
          edges: [
            { id: nanoid(), source: sourceNode.id, target: ec2Node.id, type: 'labeled' },
            { id: nanoid(), source: ec2Node.id, target: rdsNode.id, type: 'labeled' },
          ],
        },
        description: 'Add EC2 + RDS tier',
        pattern: 'aws-three-tier',
      }
    },
  },
]

class AIAutoCompleteService {
  private recentActions: UserAction[] = []
  private maxActions = 10
  private lastSuggestions: AutoCompleteSuggestion[] = []

  /**
   * Record a user action for context
   */
  recordAction(action: Omit<UserAction, 'timestamp'>): void {
    this.recentActions.push({
      ...action,
      timestamp: Date.now(),
    })

    // Keep only recent actions
    if (this.recentActions.length > this.maxActions) {
      this.recentActions.shift()
    }
  }

  /**
   * Clear action history
   */
  clearHistory(): void {
    this.recentActions = []
  }

  /**
   * Get auto-complete suggestions based on current diagram state
   */
  getSuggestions(
    nodes: DiagramNode[],
    edges: DiagramEdge[],
    selectedNodeId?: string
  ): AutoCompleteSuggestion[] {
    const selectedNode = nodes.find(n => n.id === selectedNodeId)

    // Find the last added node from recent actions
    const lastAddAction = [...this.recentActions]
      .reverse()
      .find(a => a.type === 'add-node')

    const lastAddedNode = lastAddAction?.nodeId
      ? nodes.find(n => n.id === lastAddAction.nodeId)
      : undefined

    const context: PatternContext = {
      nodes,
      edges,
      selectedNode,
      recentActions: this.recentActions,
      lastAddedNode,
    }

    const suggestions: AutoCompleteSuggestion[] = []

    // Check each pattern
    for (const pattern of PATTERNS) {
      try {
        if (pattern.trigger(context)) {
          const suggestion = pattern.generate(context)
          suggestions.push(suggestion)
        }
      } catch (e) {
        // Pattern generation failed, skip
        console.debug(`Pattern ${pattern.name} failed:`, e)
      }
    }

    // Sort by confidence
    suggestions.sort((a, b) => b.confidence - a.confidence)

    // Cache suggestions
    this.lastSuggestions = suggestions

    return suggestions.slice(0, 5) // Return top 5
  }

  /**
   * Get the top suggestion (for Tab to accept)
   */
  getTopSuggestion(
    nodes: DiagramNode[],
    edges: DiagramEdge[],
    selectedNodeId?: string
  ): AutoCompleteSuggestion | null {
    const suggestions = this.getSuggestions(nodes, edges, selectedNodeId)
    return suggestions[0] || null
  }

  /**
   * Accept a suggestion and return the nodes/edges to add
   */
  acceptSuggestion(
    suggestionId: string
  ): { nodes: DiagramNode[]; edges: DiagramEdge[] } | null {
    const suggestion = this.lastSuggestions.find(s => s.id === suggestionId)
    if (!suggestion) return null

    // Generate new IDs for the actual nodes/edges
    const nodeIdMap = new Map<string, string>()

    const nodes = suggestion.preview.nodes.map(n => {
      const newId = nanoid()
      nodeIdMap.set(n.id, newId)
      return {
        ...n,
        id: newId,
      }
    })

    const edges = suggestion.preview.edges.map(e => ({
      ...e,
      id: nanoid(),
      source: nodeIdMap.get(e.source) || e.source,
      target: nodeIdMap.get(e.target) || e.target,
    }))

    return { nodes, edges }
  }

  /**
   * Get suggestions specific to cloud architecture
   */
  getCloudSuggestions(
    nodes: DiagramNode[],
    edges: DiagramEdge[],
    provider: 'aws' | 'azure' | 'gcp'
  ): AutoCompleteSuggestion[] {
    const suggestions: AutoCompleteSuggestion[] = []

    // Find nodes without connections
    const connectedIds = new Set<string>()
    edges.forEach(e => {
      connectedIds.add(e.source)
      connectedIds.add(e.target)
    })

    const unconnectedNodes = nodes.filter(n => !connectedIds.has(n.id))

    // Suggest connections for cloud services
    unconnectedNodes.forEach(node => {
      const nodeType = node.data.type as string
      if (!nodeType.startsWith(`${provider}-`)) return

      // Suggest common connections based on service type
      let targetType: ShapeType | null = null
      let description = ''

      if (nodeType.includes('lambda') || nodeType.includes('functions')) {
        targetType = provider === 'aws' ? 'aws-dynamodb' :
                     provider === 'azure' ? 'azure-cosmos' : 'gcp-firestore'
        description = 'Connect function to database'
      } else if (nodeType.includes('ec2') || nodeType.includes('vm') || nodeType.includes('compute')) {
        targetType = provider === 'aws' ? 'aws-rds' :
                     provider === 'azure' ? 'azure-sql' : 'gcp-cloud-sql'
        description = 'Connect compute to database'
      }

      if (targetType) {
        const targetNode: DiagramNode = {
          id: `suggestion-${nanoid(6)}`,
          type: 'custom',
          position: {
            x: node.position.x + 200,
            y: node.position.y,
          },
          data: { type: targetType, label: targetType.split('-').pop() },
        }

        suggestions.push({
          id: nanoid(),
          type: 'node',
          confidence: 0.75,
          preview: {
            nodes: [targetNode],
            edges: [{
              id: nanoid(),
              source: node.id,
              target: targetNode.id,
              type: 'labeled',
            }],
          },
          description,
        })
      }
    })

    return suggestions
  }
}

export const aiAutoCompleteService = new AIAutoCompleteService()
