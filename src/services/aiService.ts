import { supabase } from './supabase'
import type { DiagramNode, DiagramEdge } from '@/types'

// AI Provider configuration
export type AIProvider = 'openai' | 'anthropic' | 'local'

interface AIConfig {
  provider: AIProvider
  apiKey?: string
  model?: string
}

interface GenerateDiagramRequest {
  prompt: string
  diagramType?: 'flowchart' | 'architecture' | 'sequence' | 'entity-relationship' | 'auto'
  style?: 'minimal' | 'detailed' | 'technical'
}

interface GenerateDiagramResponse {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  explanation?: string
}

interface LayoutSuggestion {
  nodeId: string
  suggestedPosition: { x: number; y: number }
  reason?: string
}

interface DiagramSuggestion {
  type: 'add-node' | 'add-edge' | 'modify-node' | 'remove-node'
  description: string
  data?: Partial<DiagramNode> | Partial<DiagramEdge>
}

interface ExplainDiagramResponse {
  summary: string
  components: { name: string; description: string }[]
  dataFlow?: string
  suggestions?: string[]
}

// Prompt templates for different diagram types
const DIAGRAM_PROMPTS = {
  flowchart: `Create a flowchart diagram. Use these node types:
- rectangle: for process steps
- diamond: for decision points
- rounded-rectangle: for start/end
- parallelogram: for input/output

Return JSON with nodes and edges arrays.`,

  architecture: `Create a cloud architecture diagram. Use these node types for cloud services:
- aws-* prefixed types for AWS (e.g., aws-ec2, aws-s3, aws-lambda, aws-rds, aws-vpc)
- azure-* prefixed types for Azure (e.g., azure-vm, azure-storage, azure-functions, azure-sql)
- gcp-* prefixed types for GCP (e.g., gcp-compute, gcp-storage, gcp-bigquery)
- Use rectangle or container for grouping

Return JSON with nodes and edges arrays.`,

  sequence: `Create a sequence diagram. Use these elements:
- rectangle: for actors/participants
- Use edges with labels for messages
- Arrange vertically for time flow

Return JSON with nodes and edges arrays.`,

  'entity-relationship': `Create an entity-relationship diagram. Use:
- rectangle: for entities
- diamond: for relationships
- ellipse: for attributes

Return JSON with nodes and edges arrays.`,
}

class AIService {
  private config: AIConfig = {
    provider: 'openai',
    model: 'gpt-4o',
  }

  /**
   * Configure the AI service
   */
  configure(config: Partial<AIConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Get API key from environment or stored settings
   */
  private async getApiKey(): Promise<string | null> {
    // First check environment
    if (import.meta.env.VITE_OPENAI_API_KEY) {
      return import.meta.env.VITE_OPENAI_API_KEY
    }
    if (import.meta.env.VITE_ANTHROPIC_API_KEY) {
      return import.meta.env.VITE_ANTHROPIC_API_KEY
    }

    // Then check user settings in database
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: settings } = await supabase
      .from('user_settings')
      .select('ai_api_key')
      .eq('user_id', user.id)
      .single()

    return settings?.ai_api_key || null
  }

  /**
   * Generate a diagram from a text description
   */
  async generateDiagram(request: GenerateDiagramRequest): Promise<GenerateDiagramResponse> {
    const apiKey = await this.getApiKey()

    // If no API key, use local generation
    if (!apiKey) {
      return this.generateDiagramLocally(request)
    }

    const diagramType = request.diagramType || 'auto'
    const systemPrompt = diagramType === 'auto'
      ? 'You are a diagram generation assistant. Analyze the request and create an appropriate diagram.'
      : DIAGRAM_PROMPTS[diagramType] || DIAGRAM_PROMPTS.flowchart

    const userPrompt = `${request.prompt}

Generate a diagram as JSON with this exact structure:
{
  "nodes": [
    {
      "id": "unique-id",
      "type": "shape",
      "position": { "x": number, "y": number },
      "data": {
        "type": "node-type (e.g., rectangle, aws-ec2, azure-vm)",
        "label": "Node Label",
        "width": 120,
        "height": 60
      }
    }
  ],
  "edges": [
    {
      "id": "edge-id",
      "source": "source-node-id",
      "target": "target-node-id",
      "type": "default",
      "label": "optional label"
    }
  ],
  "explanation": "Brief explanation of the diagram"
}

Position nodes with good spacing (150-200px apart). Use appropriate node types for the context.
Style: ${request.style || 'detailed'}
Only respond with valid JSON, no markdown.`

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model || 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content

      if (!content) {
        throw new Error('No response from AI')
      }

      // Parse JSON response
      const parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, '').trim())

      return {
        nodes: parsed.nodes || [],
        edges: parsed.edges || [],
        explanation: parsed.explanation,
      }
    } catch (error) {
      console.error('AI generation failed:', error)
      // Fall back to local generation
      return this.generateDiagramLocally(request)
    }
  }

  /**
   * Generate a simple diagram locally without API
   */
  private generateDiagramLocally(request: GenerateDiagramRequest): GenerateDiagramResponse {
    const words = request.prompt.toLowerCase().split(/\s+/)
    const nodes: DiagramNode[] = []
    const edges: DiagramEdge[] = []

    // Detect cloud providers mentioned
    const hasAWS = words.some(w => ['aws', 'amazon', 'ec2', 's3', 'lambda'].includes(w))
    const hasAzure = words.some(w => ['azure', 'microsoft', 'blob', 'cosmos'].includes(w))
    const hasGCP = words.some(w => ['gcp', 'google', 'bigquery', 'cloud run'].includes(w))

    // Simple keyword-based generation
    let nodeCount = 0
    const createNode = (type: string, label: string, x: number, y: number): DiagramNode => ({
      id: `node-${++nodeCount}`,
      type: 'shape',
      position: { x, y },
      data: {
        type,
        label,
        width: type.includes('aws-') || type.includes('azure-') || type.includes('gcp-') ? 80 : 120,
        height: type.includes('aws-') || type.includes('azure-') || type.includes('gcp-') ? 80 : 60,
      },
    })

    // Generate based on keywords
    if (hasAWS || words.includes('serverless')) {
      nodes.push(createNode('aws-api-gateway', 'API Gateway', 100, 200))
      nodes.push(createNode('aws-lambda', 'Lambda', 300, 200))
      nodes.push(createNode('aws-dynamodb', 'DynamoDB', 500, 200))
      edges.push({ id: 'edge-1', source: 'node-1', target: 'node-2', type: 'default' })
      edges.push({ id: 'edge-2', source: 'node-2', target: 'node-3', type: 'default' })
    } else if (hasAzure) {
      nodes.push(createNode('azure-app-gateway', 'App Gateway', 100, 200))
      nodes.push(createNode('azure-functions', 'Functions', 300, 200))
      nodes.push(createNode('azure-cosmos', 'Cosmos DB', 500, 200))
      edges.push({ id: 'edge-1', source: 'node-1', target: 'node-2', type: 'default' })
      edges.push({ id: 'edge-2', source: 'node-2', target: 'node-3', type: 'default' })
    } else if (hasGCP) {
      nodes.push(createNode('gcp-load-balancer', 'Load Balancer', 100, 200))
      nodes.push(createNode('gcp-cloud-run', 'Cloud Run', 300, 200))
      nodes.push(createNode('gcp-bigquery', 'BigQuery', 500, 200))
      edges.push({ id: 'edge-1', source: 'node-1', target: 'node-2', type: 'default' })
      edges.push({ id: 'edge-2', source: 'node-2', target: 'node-3', type: 'default' })
    } else if (words.includes('flowchart') || words.includes('process')) {
      nodes.push(createNode('rounded-rectangle', 'Start', 200, 50))
      nodes.push(createNode('rectangle', 'Process 1', 200, 150))
      nodes.push(createNode('diamond', 'Decision', 200, 270))
      nodes.push(createNode('rectangle', 'Process 2A', 50, 400))
      nodes.push(createNode('rectangle', 'Process 2B', 350, 400))
      nodes.push(createNode('rounded-rectangle', 'End', 200, 520))
      edges.push({ id: 'edge-1', source: 'node-1', target: 'node-2', type: 'default' })
      edges.push({ id: 'edge-2', source: 'node-2', target: 'node-3', type: 'default' })
      edges.push({ id: 'edge-3', source: 'node-3', target: 'node-4', type: 'default', label: 'Yes' })
      edges.push({ id: 'edge-4', source: 'node-3', target: 'node-5', type: 'default', label: 'No' })
      edges.push({ id: 'edge-5', source: 'node-4', target: 'node-6', type: 'default' })
      edges.push({ id: 'edge-6', source: 'node-5', target: 'node-6', type: 'default' })
    } else {
      // Default: simple 3-tier architecture
      nodes.push(createNode('rectangle', 'Frontend', 200, 100))
      nodes.push(createNode('rectangle', 'Backend', 200, 250))
      nodes.push(createNode('cylinder', 'Database', 200, 400))
      edges.push({ id: 'edge-1', source: 'node-1', target: 'node-2', type: 'default' })
      edges.push({ id: 'edge-2', source: 'node-2', target: 'node-3', type: 'default' })
    }

    return {
      nodes,
      edges: edges as DiagramEdge[],
      explanation: 'Generated locally based on keywords. Connect an AI API key for more intelligent generation.',
    }
  }

  /**
   * Auto-layout nodes for better visual organization
   */
  async autoLayout(
    nodes: DiagramNode[],
    edges: DiagramEdge[],
    algorithm: 'hierarchical' | 'force' | 'grid' = 'hierarchical'
  ): Promise<LayoutSuggestion[]> {
    const suggestions: LayoutSuggestion[] = []

    if (nodes.length === 0) return suggestions

    switch (algorithm) {
      case 'hierarchical':
        return this.hierarchicalLayout(nodes, edges)
      case 'force':
        return this.forceDirectedLayout(nodes, edges)
      case 'grid':
        return this.gridLayout(nodes)
      default:
        return this.hierarchicalLayout(nodes, edges)
    }
  }

  /**
   * Hierarchical layout (top to bottom)
   */
  private hierarchicalLayout(nodes: DiagramNode[], edges: DiagramEdge[]): LayoutSuggestion[] {
    const suggestions: LayoutSuggestion[] = []

    // Build adjacency list
    const children = new Map<string, string[]>()
    const parents = new Map<string, string[]>()

    nodes.forEach(n => {
      children.set(n.id, [])
      parents.set(n.id, [])
    })

    edges.forEach(e => {
      children.get(e.source)?.push(e.target)
      parents.get(e.target)?.push(e.source)
    })

    // Find root nodes (no parents)
    const roots = nodes.filter(n => (parents.get(n.id)?.length || 0) === 0)

    // BFS to assign levels
    const levels = new Map<string, number>()
    const queue = roots.map(r => ({ id: r.id, level: 0 }))

    while (queue.length > 0) {
      const { id, level } = queue.shift()!
      if (levels.has(id)) continue
      levels.set(id, level)

      children.get(id)?.forEach(childId => {
        if (!levels.has(childId)) {
          queue.push({ id: childId, level: level + 1 })
        }
      })
    }

    // Group by level
    const levelGroups = new Map<number, string[]>()
    levels.forEach((level, id) => {
      if (!levelGroups.has(level)) levelGroups.set(level, [])
      levelGroups.get(level)!.push(id)
    })

    // Assign positions
    const nodeWidth = 150
    const nodeHeight = 100
    const horizontalSpacing = 50
    const verticalSpacing = 80

    levelGroups.forEach((nodeIds, level) => {
      const totalWidth = nodeIds.length * nodeWidth + (nodeIds.length - 1) * horizontalSpacing
      const startX = (800 - totalWidth) / 2 // Center horizontally

      nodeIds.forEach((nodeId, index) => {
        suggestions.push({
          nodeId,
          suggestedPosition: {
            x: startX + index * (nodeWidth + horizontalSpacing),
            y: 100 + level * (nodeHeight + verticalSpacing),
          },
          reason: `Level ${level + 1} in hierarchy`,
        })
      })
    })

    return suggestions
  }

  /**
   * Force-directed layout
   */
  private forceDirectedLayout(nodes: DiagramNode[], edges: DiagramEdge[]): LayoutSuggestion[] {
    const suggestions: LayoutSuggestion[] = []

    // Initialize positions
    const positions = new Map<string, { x: number; y: number }>()
    nodes.forEach((n, i) => {
      const angle = (2 * Math.PI * i) / nodes.length
      positions.set(n.id, {
        x: 400 + 200 * Math.cos(angle),
        y: 300 + 200 * Math.sin(angle),
      })
    })

    // Simple force simulation
    const iterations = 50
    const repulsion = 5000
    const attraction = 0.1
    const damping = 0.9

    for (let iter = 0; iter < iterations; iter++) {
      const forces = new Map<string, { fx: number; fy: number }>()
      nodes.forEach(n => forces.set(n.id, { fx: 0, fy: 0 }))

      // Repulsion between all nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const p1 = positions.get(nodes[i].id)!
          const p2 = positions.get(nodes[j].id)!
          const dx = p2.x - p1.x
          const dy = p2.y - p1.y
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
          const force = repulsion / (dist * dist)

          const fx = (dx / dist) * force
          const fy = (dy / dist) * force

          forces.get(nodes[i].id)!.fx -= fx
          forces.get(nodes[i].id)!.fy -= fy
          forces.get(nodes[j].id)!.fx += fx
          forces.get(nodes[j].id)!.fy += fy
        }
      }

      // Attraction along edges
      edges.forEach(e => {
        const p1 = positions.get(e.source)
        const p2 = positions.get(e.target)
        if (!p1 || !p2) return

        const dx = p2.x - p1.x
        const dy = p2.y - p1.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        const fx = dx * attraction
        const fy = dy * attraction

        forces.get(e.source)!.fx += fx
        forces.get(e.source)!.fy += fy
        forces.get(e.target)!.fx -= fx
        forces.get(e.target)!.fy -= fy
      })

      // Apply forces
      nodes.forEach(n => {
        const pos = positions.get(n.id)!
        const force = forces.get(n.id)!
        pos.x += force.fx * damping
        pos.y += force.fy * damping
        // Keep in bounds
        pos.x = Math.max(50, Math.min(750, pos.x))
        pos.y = Math.max(50, Math.min(550, pos.y))
      })
    }

    // Create suggestions
    positions.forEach((pos, nodeId) => {
      suggestions.push({
        nodeId,
        suggestedPosition: { x: Math.round(pos.x), y: Math.round(pos.y) },
        reason: 'Force-directed optimization',
      })
    })

    return suggestions
  }

  /**
   * Grid layout
   */
  private gridLayout(nodes: DiagramNode[]): LayoutSuggestion[] {
    const suggestions: LayoutSuggestion[] = []
    const cols = Math.ceil(Math.sqrt(nodes.length))
    const spacing = 180

    nodes.forEach((node, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols

      suggestions.push({
        nodeId: node.id,
        suggestedPosition: {
          x: 100 + col * spacing,
          y: 100 + row * spacing,
        },
        reason: `Grid position (${row + 1}, ${col + 1})`,
      })
    })

    return suggestions
  }

  /**
   * Explain what a diagram represents
   */
  async explainDiagram(nodes: DiagramNode[], edges: DiagramEdge[]): Promise<ExplainDiagramResponse> {
    const apiKey = await this.getApiKey()

    if (!apiKey) {
      return this.explainDiagramLocally(nodes, edges)
    }

    const diagramData = JSON.stringify({ nodes, edges }, null, 2)

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a diagram analysis expert. Analyze diagrams and explain what they represent.',
            },
            {
              role: 'user',
              content: `Analyze this diagram and provide:
1. A brief summary of what the diagram represents
2. Description of each key component
3. How data/control flows through the system
4. Suggestions for improvements

Diagram data:
${diagramData}

Respond in JSON format:
{
  "summary": "...",
  "components": [{"name": "...", "description": "..."}],
  "dataFlow": "...",
  "suggestions": ["..."]
}`,
            },
          ],
          temperature: 0.5,
          max_tokens: 2000,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content

      return JSON.parse(content.replace(/```json\n?|\n?```/g, '').trim())
    } catch (error) {
      console.error('AI explanation failed:', error)
      return this.explainDiagramLocally(nodes, edges)
    }
  }

  /**
   * Local diagram explanation without API
   */
  private explainDiagramLocally(nodes: DiagramNode[], edges: DiagramEdge[]): ExplainDiagramResponse {
    const components = nodes.map(n => ({
      name: (n.data?.label as string) || n.id,
      description: `${n.data?.type || 'Node'} component`,
    }))

    // Detect cloud providers
    const awsNodes = nodes.filter(n => (n.data?.type as string)?.startsWith('aws-'))
    const azureNodes = nodes.filter(n => (n.data?.type as string)?.startsWith('azure-'))
    const gcpNodes = nodes.filter(n => (n.data?.type as string)?.startsWith('gcp-'))

    let summary = `Diagram with ${nodes.length} nodes and ${edges.length} connections.`
    if (awsNodes.length > 0) summary += ` Uses AWS services.`
    if (azureNodes.length > 0) summary += ` Uses Azure services.`
    if (gcpNodes.length > 0) summary += ` Uses GCP services.`

    return {
      summary,
      components,
      dataFlow: edges.length > 0
        ? `Data flows through ${edges.length} connections between components.`
        : 'No connections defined between components.',
      suggestions: [
        'Consider adding labels to edges for clarity',
        'Group related components together',
        'Add a legend for complex diagrams',
      ],
    }
  }

  /**
   * Get suggestions for improving or completing a diagram
   */
  async getSuggestions(nodes: DiagramNode[], edges: DiagramEdge[]): Promise<DiagramSuggestion[]> {
    const suggestions: DiagramSuggestion[] = []

    // Find isolated nodes (no connections)
    const connectedNodes = new Set<string>()
    edges.forEach(e => {
      connectedNodes.add(e.source)
      connectedNodes.add(e.target)
    })

    nodes.forEach(n => {
      if (!connectedNodes.has(n.id)) {
        suggestions.push({
          type: 'add-edge',
          description: `Node "${n.data?.label || n.id}" is not connected to anything`,
        })
      }
    })

    // Suggest common patterns
    const awsNodes = nodes.filter(n => (n.data?.type as string)?.startsWith('aws-'))
    if (awsNodes.length > 0) {
      const hasVpc = awsNodes.some(n => (n.data?.type as string) === 'aws-vpc')
      if (!hasVpc) {
        suggestions.push({
          type: 'add-node',
          description: 'Consider adding a VPC to contain AWS resources',
          data: { type: 'aws-vpc', label: 'VPC' },
        })
      }
    }

    // Check for load balancers
    const computeNodes = nodes.filter(n =>
      ['aws-ec2', 'azure-vm', 'gcp-compute', 'aws-ecs', 'azure-aks'].includes(n.data?.type as string)
    )
    if (computeNodes.length > 1) {
      const hasLb = nodes.some(n =>
        ['aws-elb', 'azure-load-balancer', 'gcp-load-balancer'].includes(n.data?.type as string)
      )
      if (!hasLb) {
        suggestions.push({
          type: 'add-node',
          description: 'Consider adding a load balancer for multiple compute instances',
        })
      }
    }

    return suggestions
  }
}

export const aiService = new AIService()
