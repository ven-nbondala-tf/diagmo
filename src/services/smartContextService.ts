import type { DiagramNode, ShapeType } from '@/types'

export interface SmartSuggestion {
  id: string
  label: string
  description: string
  icon: string // lucide icon name
  action: 'add-node' | 'add-branch' | 'connect-sequence' | 'align' | 'distribute' | 'group'
  data?: {
    nodeType?: ShapeType
    edgeLabel?: string
    alignType?: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
    distributeType?: 'horizontal' | 'vertical'
    position?: 'right' | 'bottom' | 'left' | 'top'
  }
}

// Related AWS services for common patterns
const AWS_RELATED: Record<string, ShapeType[]> = {
  'aws-ec2': ['aws-elb', 'aws-rds', 'aws-s3', 'aws-cloudwatch'],
  'aws-elb': ['aws-ec2', 'aws-route53', 'aws-waf'],
  'aws-rds': ['aws-ec2', 'aws-elasticache', 'aws-secrets-manager'],
  'aws-s3': ['aws-cloudfront', 'aws-lambda', 'aws-sns'],
  'aws-lambda': ['aws-api-gateway', 'aws-dynamodb', 'aws-sqs', 'aws-s3'],
  'aws-api-gateway': ['aws-lambda', 'aws-cognito', 'aws-waf'],
  'aws-dynamodb': ['aws-lambda', 'aws-kinesis', 'aws-s3'],
  'aws-sqs': ['aws-lambda', 'aws-sns', 'aws-ec2'],
  'aws-sns': ['aws-lambda', 'aws-sqs', 'aws-ses'],
  'aws-cloudfront': ['aws-s3', 'aws-waf', 'aws-route53'],
  'aws-vpc': ['aws-ec2', 'aws-rds', 'aws-elb'],
  'aws-ecs': ['aws-ecr', 'aws-elb', 'aws-cloudwatch'],
  'aws-eks': ['aws-ecr', 'aws-elb', 'aws-iam'],
}

// Related Azure services
const AZURE_RELATED: Record<string, ShapeType[]> = {
  'azure-vm': ['azure-load-balancer', 'azure-sql', 'azure-storage'],
  'azure-app-service': ['azure-sql', 'azure-storage', 'azure-redis-cache'],
  'azure-sql': ['azure-vm', 'azure-app-service', 'azure-storage'],
  'azure-storage': ['azure-cdn', 'azure-functions', 'azure-sql'],
  'azure-functions': ['azure-storage', 'azure-cosmos', 'azure-service-bus'],
  'azure-cosmos': ['azure-functions', 'azure-app-service'],
  'azure-aks': ['azure-container-registry', 'azure-load-balancer', 'azure-monitor'],
  'azure-container-registry': ['azure-aks', 'azure-app-service'],
}

// Related GCP services
const GCP_RELATED: Record<string, ShapeType[]> = {
  'gcp-compute-engine': ['gcp-load-balancing', 'gcp-cloud-sql', 'gcp-cloud-storage'],
  'gcp-cloud-run': ['gcp-cloud-sql', 'gcp-cloud-storage', 'gcp-pubsub'],
  'gcp-functions': ['gcp-cloud-storage', 'gcp-firestore', 'gcp-pubsub'],
  'gcp-gke': ['gcp-artifact-registry', 'gcp-load-balancing', 'gcp-cloud-sql'],
  'gcp-cloud-sql': ['gcp-compute-engine', 'gcp-cloud-run', 'gcp-gke'],
  'gcp-cloud-storage': ['gcp-cloud-cdn', 'gcp-functions', 'gcp-bigquery'],
  'gcp-bigquery': ['gcp-cloud-storage', 'gcp-dataflow', 'gcp-pubsub'],
}

// Get friendly name for shape type
function getShapeName(type: ShapeType): string {
  // AWS
  if (type.startsWith('aws-')) {
    const name = type.replace('aws-', '').split('-').map(
      word => word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
    return `AWS ${name}`
  }
  // Azure
  if (type.startsWith('azure-')) {
    const name = type.replace('azure-', '').split('-').map(
      word => word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
    return `Azure ${name}`
  }
  // GCP
  if (type.startsWith('gcp-')) {
    const name = type.replace('gcp-', '').split('-').map(
      word => word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
    return `GCP ${name}`
  }
  // Generic shapes
  return type.split('-').map(
    word => word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

// Get smart suggestions for a single node
export function getSingleNodeSuggestions(node: DiagramNode): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = []
  const nodeType = node.data.type

  // Decision node - add branches
  if (nodeType === 'decision' || nodeType === 'diamond') {
    suggestions.push({
      id: 'add-yes-branch',
      label: 'Add Yes Branch',
      description: 'Create a "Yes" path from this decision',
      icon: 'GitBranchPlus',
      action: 'add-branch',
      data: {
        nodeType: 'process',
        edgeLabel: 'Yes',
        position: 'right',
      },
    })
    suggestions.push({
      id: 'add-no-branch',
      label: 'Add No Branch',
      description: 'Create a "No" path from this decision',
      icon: 'GitBranchPlus',
      action: 'add-branch',
      data: {
        nodeType: 'process',
        edgeLabel: 'No',
        position: 'bottom',
      },
    })
  }

  // Process or action nodes - add next step
  if (['process', 'rectangle', 'rounded-rectangle', 'action'].includes(nodeType)) {
    suggestions.push({
      id: 'add-next-step',
      label: 'Add Next Step',
      description: 'Add a connected process step',
      icon: 'ArrowRight',
      action: 'add-node',
      data: {
        nodeType: 'process',
        position: 'right',
      },
    })
    suggestions.push({
      id: 'add-decision',
      label: 'Add Decision',
      description: 'Add a connected decision point',
      icon: 'GitBranch',
      action: 'add-node',
      data: {
        nodeType: 'decision',
        position: 'right',
      },
    })
  }

  // Terminator/Start - add first step
  if (nodeType === 'terminator') {
    suggestions.push({
      id: 'add-first-step',
      label: 'Add First Step',
      description: 'Add the first process step',
      icon: 'ArrowRight',
      action: 'add-node',
      data: {
        nodeType: 'process',
        position: 'right',
      },
    })
  }

  // Database - add data flow
  if (['database', 'cylinder', 'data'].includes(nodeType)) {
    suggestions.push({
      id: 'add-data-consumer',
      label: 'Add Data Consumer',
      description: 'Add a process that reads from this data',
      icon: 'ArrowRight',
      action: 'add-node',
      data: {
        nodeType: 'process',
        position: 'right',
      },
    })
    suggestions.push({
      id: 'add-data-source',
      label: 'Add Data Source',
      description: 'Add a process that writes to this data',
      icon: 'ArrowLeft',
      action: 'add-node',
      data: {
        nodeType: 'process',
        position: 'left',
      },
    })
  }

  // AWS services - suggest related services
  if (nodeType.startsWith('aws-')) {
    const relatedServices = AWS_RELATED[nodeType] || []
    if (relatedServices.length > 0) {
      // Add first 3 related services
      relatedServices.slice(0, 3).forEach((serviceType, index) => {
        suggestions.push({
          id: `add-aws-${serviceType}-${index}`,
          label: `Add ${getShapeName(serviceType)}`,
          description: `Connect to ${getShapeName(serviceType)}`,
          icon: 'Cloud',
          action: 'add-node',
          data: {
            nodeType: serviceType,
            position: index === 0 ? 'right' : index === 1 ? 'bottom' : 'left',
          },
        })
      })
    }
  }

  // Azure services - suggest related services
  if (nodeType.startsWith('azure-')) {
    const relatedServices = AZURE_RELATED[nodeType] || []
    if (relatedServices.length > 0) {
      relatedServices.slice(0, 3).forEach((serviceType, index) => {
        suggestions.push({
          id: `add-azure-${serviceType}-${index}`,
          label: `Add ${getShapeName(serviceType)}`,
          description: `Connect to ${getShapeName(serviceType)}`,
          icon: 'Cloud',
          action: 'add-node',
          data: {
            nodeType: serviceType,
            position: index === 0 ? 'right' : index === 1 ? 'bottom' : 'left',
          },
        })
      })
    }
  }

  // GCP services - suggest related services
  if (nodeType.startsWith('gcp-')) {
    const relatedServices = GCP_RELATED[nodeType] || []
    if (relatedServices.length > 0) {
      relatedServices.slice(0, 3).forEach((serviceType, index) => {
        suggestions.push({
          id: `add-gcp-${serviceType}-${index}`,
          label: `Add ${getShapeName(serviceType)}`,
          description: `Connect to ${getShapeName(serviceType)}`,
          icon: 'Cloud',
          action: 'add-node',
          data: {
            nodeType: serviceType,
            position: index === 0 ? 'right' : index === 1 ? 'bottom' : 'left',
          },
        })
      })
    }
  }

  return suggestions
}

// Get smart suggestions for multiple selected nodes
export function getMultiNodeSuggestions(nodes: DiagramNode[]): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = []

  if (nodes.length < 2) return suggestions

  // Alignment suggestions
  suggestions.push({
    id: 'align-left',
    label: 'Align Left',
    description: 'Align all selected nodes to the left',
    icon: 'AlignLeft',
    action: 'align',
    data: { alignType: 'left' },
  })
  suggestions.push({
    id: 'align-center',
    label: 'Align Center',
    description: 'Align all selected nodes to center horizontally',
    icon: 'AlignCenterHorizontal',
    action: 'align',
    data: { alignType: 'center' },
  })
  suggestions.push({
    id: 'align-right',
    label: 'Align Right',
    description: 'Align all selected nodes to the right',
    icon: 'AlignRight',
    action: 'align',
    data: { alignType: 'right' },
  })
  suggestions.push({
    id: 'align-top',
    label: 'Align Top',
    description: 'Align all selected nodes to the top',
    icon: 'AlignStartVertical',
    action: 'align',
    data: { alignType: 'top' },
  })
  suggestions.push({
    id: 'align-middle',
    label: 'Align Middle',
    description: 'Align all selected nodes to middle vertically',
    icon: 'AlignCenterVertical',
    action: 'align',
    data: { alignType: 'middle' },
  })
  suggestions.push({
    id: 'align-bottom',
    label: 'Align Bottom',
    description: 'Align all selected nodes to the bottom',
    icon: 'AlignEndVertical',
    action: 'align',
    data: { alignType: 'bottom' },
  })

  // Distribution suggestions (only for 3+ nodes)
  if (nodes.length >= 3) {
    suggestions.push({
      id: 'distribute-horizontal',
      label: 'Distribute Horizontally',
      description: 'Space nodes evenly horizontally',
      icon: 'Columns',
      action: 'distribute',
      data: { distributeType: 'horizontal' },
    })
    suggestions.push({
      id: 'distribute-vertical',
      label: 'Distribute Vertically',
      description: 'Space nodes evenly vertically',
      icon: 'Rows',
      action: 'distribute',
      data: { distributeType: 'vertical' },
    })
  }

  // Connect in sequence
  suggestions.push({
    id: 'connect-sequence',
    label: 'Connect in Sequence',
    description: 'Create edges between nodes in selection order',
    icon: 'Link',
    action: 'connect-sequence',
  })

  // Group
  suggestions.push({
    id: 'group-nodes',
    label: 'Group Selected',
    description: 'Group all selected nodes together',
    icon: 'Group',
    action: 'group',
  })

  return suggestions
}

// Calculate position for new node based on source node and direction
export function calculateNewNodePosition(
  sourceNode: DiagramNode,
  position: 'right' | 'bottom' | 'left' | 'top'
): { x: number; y: number } {
  const sourceWidth = sourceNode.measured?.width || sourceNode.width || 120
  const sourceHeight = sourceNode.measured?.height || sourceNode.height || 60
  const spacing = 80 // Gap between nodes

  switch (position) {
    case 'right':
      return {
        x: sourceNode.position.x + sourceWidth + spacing,
        y: sourceNode.position.y,
      }
    case 'bottom':
      return {
        x: sourceNode.position.x,
        y: sourceNode.position.y + sourceHeight + spacing,
      }
    case 'left':
      return {
        x: sourceNode.position.x - 120 - spacing, // assuming 120 width for new node
        y: sourceNode.position.y,
      }
    case 'top':
      return {
        x: sourceNode.position.x,
        y: sourceNode.position.y - 60 - spacing, // assuming 60 height for new node
      }
    default:
      return {
        x: sourceNode.position.x + sourceWidth + spacing,
        y: sourceNode.position.y,
      }
  }
}

// Get appropriate handle IDs for edge connection based on position
export function getHandlesForPosition(
  position: 'right' | 'bottom' | 'left' | 'top'
): { sourceHandle: string; targetHandle: string } {
  switch (position) {
    case 'right':
      return { sourceHandle: 'right', targetHandle: 'left' }
    case 'bottom':
      return { sourceHandle: 'bottom', targetHandle: 'top' }
    case 'left':
      return { sourceHandle: 'left', targetHandle: 'right' }
    case 'top':
      return { sourceHandle: 'top', targetHandle: 'bottom' }
    default:
      return { sourceHandle: 'right', targetHandle: 'left' }
  }
}

export const smartContextService = {
  getSingleNodeSuggestions,
  getMultiNodeSuggestions,
  calculateNewNodePosition,
  getHandlesForPosition,
}
