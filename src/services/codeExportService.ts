import type { DiagramNode, DiagramEdge, ShapeType } from '@/types'

export type CodeExportFormat = 'mermaid' | 'plantuml'

interface ExportResult {
  code: string
  warnings: string[]
}

// Map shape types to Mermaid node shapes
const mermaidShapeMap: Record<string, string> = {
  // Basic shapes
  'rectangle': '[]',
  'rounded-rectangle': '()',
  'circle': '(())',
  'ellipse': '(())',
  'diamond': '{}',
  'parallelogram': '[/\\]',
  'trapezoid': '[/\\]',
  'hexagon': '{{}}',
  'stadium': '([])',
  // Flowchart shapes
  'process': '[]',
  'decision': '{}',
  'terminator': '([])',
  'data': '[/\\]',
  'document': '>]',
  'database': '[(database)]',
  'cylinder': '[(database)]',
  // Default
  'default': '[]',
}

// Map shape types to PlantUML shapes
const plantumlShapeMap: Record<string, string> = {
  // Basic shapes
  'rectangle': 'rectangle',
  'rounded-rectangle': 'rectangle',
  'circle': 'circle',
  'ellipse': 'oval',
  'diamond': 'diamond',
  'hexagon': 'hexagon',
  // Flowchart shapes
  'process': 'rectangle',
  'decision': 'diamond',
  'terminator': 'oval',
  'data': 'rectangle',
  'document': 'document',
  'database': 'database',
  'cylinder': 'database',
  // UML shapes
  'uml-class': 'class',
  'uml-interface': 'interface',
  'uml-actor': 'actor',
  'uml-usecase': 'usecase',
  'uml-component': 'component',
  'uml-package': 'package',
  'uml-state': 'state',
  // Default
  'default': 'rectangle',
}

// Sanitize node label for Mermaid (escape special chars)
function sanitizeMermaidLabel(label: string): string {
  return label
    .replace(/"/g, '#quot;')
    .replace(/\n/g, '<br/>')
    .trim() || 'Node'
}

// Sanitize node label for PlantUML
function sanitizePlantUmlLabel(label: string): string {
  return label
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .trim() || 'Node'
}

// Generate a valid ID from node ID (Mermaid/PlantUML compatible)
function generateId(nodeId: string): string {
  // Replace non-alphanumeric chars with underscore, ensure starts with letter
  let id = nodeId.replace(/[^a-zA-Z0-9]/g, '_')
  if (/^[0-9]/.test(id)) {
    id = 'n_' + id
  }
  return id
}

// Get Mermaid shape syntax
function getMermaidShape(type: ShapeType, label: string): string {
  const sanitized = sanitizeMermaidLabel(label)
  const shapeType = mermaidShapeMap[type] || mermaidShapeMap['default']!

  switch (shapeType) {
    case '[]':
      return `["${sanitized}"]`
    case '()':
      return `("${sanitized}")`
    case '(())':
      return `(("${sanitized}"))`
    case '{}':
      return `{"${sanitized}"}`
    case '[/\\]':
      return `[/"${sanitized}"/]`
    case '{{}}':
      return `{{"${sanitized}"}}`
    case '([])':
      return `(["${sanitized}"])`
    case '>]':
      return `>"${sanitized}"]`
    case '[(database)]':
      return `[("${sanitized}")]`
    default:
      return `["${sanitized}"]`
  }
}

// Get edge arrow style for Mermaid
function getMermaidArrow(edge: DiagramEdge): string {
  const hasStart = edge.markerStart !== undefined
  const hasEnd = edge.markerEnd !== undefined
  const style = edge.style as { strokeDasharray?: string } | undefined

  let line = '--'
  if (style?.strokeDasharray?.includes('4') || style?.strokeDasharray?.includes('2')) {
    line = '-.-'  // Dashed
  }

  if (hasStart && hasEnd) {
    return `<${line}>`
  } else if (hasStart) {
    return `<${line}-`
  } else if (hasEnd) {
    return `${line}>`
  }
  return line
}

// Get edge arrow style for PlantUML
function getPlantUmlArrow(edge: DiagramEdge): string {
  const hasStart = edge.markerStart !== undefined
  const hasEnd = edge.markerEnd !== undefined
  const style = edge.style as { strokeDasharray?: string } | undefined

  let line = '--'
  if (style?.strokeDasharray?.includes('4') || style?.strokeDasharray?.includes('2')) {
    line = '..'  // Dashed
  }

  if (hasStart && hasEnd) {
    return `<${line}>`
  } else if (hasStart) {
    return `<${line}`
  } else if (hasEnd) {
    return `${line}>`
  }
  return line
}

// Export to Mermaid flowchart
export function exportToMermaid(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  direction: 'TB' | 'LR' | 'BT' | 'RL' = 'TB'
): ExportResult {
  const warnings: string[] = []
  const lines: string[] = []

  // Header
  lines.push(`flowchart ${direction}`)
  lines.push('')

  // Create node ID map for lookup
  const nodeMap = new Map<string, DiagramNode>()
  nodes.forEach((node) => nodeMap.set(node.id, node))

  // Group nodes by subgraph (if they have groupId)
  const groups = new Map<string, DiagramNode[]>()
  const ungroupedNodes: DiagramNode[] = []

  nodes.forEach((node) => {
    const groupId = node.data.groupId
    if (groupId) {
      const group = groups.get(groupId) || []
      group.push(node)
      groups.set(groupId, group)
    } else {
      ungroupedNodes.push(node)
    }
  })

  // Render subgraphs
  groups.forEach((groupNodes, groupId) => {
    const groupNode = nodeMap.get(groupId)
    const groupLabel = groupNode?.data.label || 'Group'
    lines.push(`  subgraph ${generateId(groupId)}["${sanitizeMermaidLabel(groupLabel)}"]`)

    groupNodes.forEach((node) => {
      const id = generateId(node.id)
      const shape = getMermaidShape(node.data.type, node.data.label)
      lines.push(`    ${id}${shape}`)
    })

    lines.push('  end')
    lines.push('')
  })

  // Render ungrouped nodes
  ungroupedNodes.forEach((node) => {
    // Skip container nodes that were used as subgraph headers
    if (node.data.type === 'container' || node.data.type === 'swimlane') {
      if (groups.has(node.id)) return
    }

    const id = generateId(node.id)
    const shape = getMermaidShape(node.data.type, node.data.label)
    lines.push(`  ${id}${shape}`)
  })

  lines.push('')

  // Render edges
  edges.forEach((edge) => {
    const sourceId = generateId(edge.source)
    const targetId = generateId(edge.target)
    const arrow = getMermaidArrow(edge)
    const label = (edge.label as string) || (edge.data as { label?: string })?.label

    if (label) {
      lines.push(`  ${sourceId} ${arrow}|"${sanitizeMermaidLabel(label)}"| ${targetId}`)
    } else {
      lines.push(`  ${sourceId} ${arrow} ${targetId}`)
    }
  })

  // Add styling for nodes with custom colors
  lines.push('')
  nodes.forEach((node) => {
    const style = node.data.style
    if (style?.backgroundColor && style.backgroundColor !== '#ffffff') {
      const id = generateId(node.id)
      const fill = style.backgroundColor
      const stroke = style.borderColor || '#333'
      const textColor = style.textColor || '#000'
      lines.push(`  style ${id} fill:${fill},stroke:${stroke},color:${textColor}`)
    }
  })

  return {
    code: lines.join('\n'),
    warnings,
  }
}

// Export to PlantUML
export function exportToPlantUml(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  _diagramType: 'component' | 'activity' | 'usecase' | 'sequence' | 'class' = 'component'
): ExportResult {
  const warnings: string[] = []
  const lines: string[] = []

  // Header
  lines.push('@startuml')
  lines.push('')

  // Skin params for styling
  lines.push('skinparam defaultTextAlignment center')
  lines.push('skinparam roundcorner 5')
  lines.push('')

  // Create node ID map
  const nodeMap = new Map<string, DiagramNode>()
  nodes.forEach((node) => nodeMap.set(node.id, node))

  // Group nodes by container/package
  const containers = new Map<string, DiagramNode[]>()
  const ungroupedNodes: DiagramNode[] = []

  nodes.forEach((node) => {
    const groupId = node.data.groupId
    if (groupId) {
      const group = containers.get(groupId) || []
      group.push(node)
      containers.set(groupId, group)
    } else {
      ungroupedNodes.push(node)
    }
  })

  // Render packages/containers
  containers.forEach((containerNodes, containerId) => {
    const containerNode = nodeMap.get(containerId)
    const containerLabel = containerNode?.data.label || 'Package'

    lines.push(`package "${sanitizePlantUmlLabel(containerLabel)}" as ${generateId(containerId)} {`)

    containerNodes.forEach((node) => {
      const id = generateId(node.id)
      const label = sanitizePlantUmlLabel(node.data.label)
      const shapeType = plantumlShapeMap[node.data.type] || plantumlShapeMap['default']!

      // Handle UML class with attributes/methods
      if (node.data.type === 'uml-class' && (node.data.umlAttributes || node.data.umlMethods)) {
        lines.push(`  class "${label}" as ${id} {`)
        if (node.data.umlAttributes) {
          node.data.umlAttributes.forEach((attr) => {
            lines.push(`    ${attr.visibility}${attr.name}: ${attr.type}`)
          })
        }
        if (node.data.umlMethods) {
          node.data.umlMethods.forEach((method) => {
            const params = method.parameters || ''
            const ret = method.returnType ? `: ${method.returnType}` : ''
            lines.push(`    ${method.visibility}${method.name}(${params})${ret}`)
          })
        }
        lines.push('  }')
      } else {
        lines.push(`  ${shapeType} "${label}" as ${id}`)
      }
    })

    lines.push('}')
    lines.push('')
  })

  // Render ungrouped nodes
  ungroupedNodes.forEach((node) => {
    // Skip container nodes used as package headers
    if (node.data.type === 'container' || node.data.type === 'swimlane') {
      if (containers.has(node.id)) return
    }

    const id = generateId(node.id)
    const label = sanitizePlantUmlLabel(node.data.label)
    const shapeType = plantumlShapeMap[node.data.type] || plantumlShapeMap['default']!

    // Handle UML class with attributes/methods
    if (node.data.type === 'uml-class' && (node.data.umlAttributes || node.data.umlMethods)) {
      lines.push(`class "${label}" as ${id} {`)
      if (node.data.umlAttributes) {
        node.data.umlAttributes.forEach((attr) => {
          lines.push(`  ${attr.visibility}${attr.name}: ${attr.type}`)
        })
      }
      if (node.data.umlMethods) {
        node.data.umlMethods.forEach((method) => {
          const params = method.parameters || ''
          const ret = method.returnType ? `: ${method.returnType}` : ''
          lines.push(`  ${method.visibility}${method.name}(${params})${ret}`)
        })
      }
      lines.push('}')
    } else if (node.data.type === 'uml-actor') {
      lines.push(`actor "${label}" as ${id}`)
    } else if (node.data.type === 'uml-usecase') {
      lines.push(`usecase "${label}" as ${id}`)
    } else if (node.data.type === 'database' || node.data.type === 'cylinder') {
      lines.push(`database "${label}" as ${id}`)
    } else {
      lines.push(`${shapeType} "${label}" as ${id}`)
    }
  })

  lines.push('')

  // Render edges/relationships
  edges.forEach((edge) => {
    const sourceId = generateId(edge.source)
    const targetId = generateId(edge.target)
    const arrow = getPlantUmlArrow(edge)
    const label = (edge.label as string) || (edge.data as { label?: string })?.label

    if (label) {
      lines.push(`${sourceId} ${arrow} ${targetId} : ${sanitizePlantUmlLabel(label)}`)
    } else {
      lines.push(`${sourceId} ${arrow} ${targetId}`)
    }
  })

  // Add notes for nodes with metadata
  lines.push('')
  nodes.forEach((node) => {
    if (node.data.metadata && Object.keys(node.data.metadata).length > 0) {
      const id = generateId(node.id)
      lines.push(`note right of ${id}`)
      Object.entries(node.data.metadata).forEach(([key, value]) => {
        lines.push(`  ${key}: ${value}`)
      })
      lines.push('end note')
    }
  })

  lines.push('')
  lines.push('@enduml')

  return {
    code: lines.join('\n'),
    warnings,
  }
}

// Export to Terraform (basic structure)
export function exportToTerraform(
  nodes: DiagramNode[],
  edges: DiagramEdge[]
): ExportResult {
  const warnings: string[] = []
  const lines: string[] = []

  lines.push('# Terraform configuration generated from diagram')
  lines.push('# Note: This is a skeleton - you will need to add actual configuration values')
  lines.push('')

  // Map cloud icon types to Terraform resource types
  const awsResourceMap: Record<string, string> = {
    'aws-ec2': 'aws_instance',
    'aws-lambda': 'aws_lambda_function',
    'aws-s3': 'aws_s3_bucket',
    'aws-rds': 'aws_db_instance',
    'aws-dynamodb': 'aws_dynamodb_table',
    'aws-vpc': 'aws_vpc',
    'aws-iam': 'aws_iam_role',
    'aws-sns': 'aws_sns_topic',
    'aws-sqs': 'aws_sqs_queue',
    'aws-cloudfront': 'aws_cloudfront_distribution',
    'aws-api-gateway': 'aws_api_gateway_rest_api',
    'aws-ecs': 'aws_ecs_cluster',
    'aws-eks': 'aws_eks_cluster',
  }

  const azureResourceMap: Record<string, string> = {
    'azure-vm': 'azurerm_virtual_machine',
    'azure-functions': 'azurerm_function_app',
    'azure-storage': 'azurerm_storage_account',
    'azure-sql': 'azurerm_sql_database',
    'azure-cosmos': 'azurerm_cosmosdb_account',
    'azure-aks': 'azurerm_kubernetes_cluster',
    'azure-app-service': 'azurerm_app_service',
  }

  const gcpResourceMap: Record<string, string> = {
    'gcp-compute': 'google_compute_instance',
    'gcp-functions': 'google_cloudfunctions_function',
    'gcp-storage': 'google_storage_bucket',
    'gcp-cloud-sql': 'google_sql_database_instance',
    'gcp-gke': 'google_container_cluster',
    'gcp-pubsub': 'google_pubsub_topic',
    'gcp-bigquery': 'google_bigquery_dataset',
  }

  // Detect required providers
  const providers = new Set<string>()
  nodes.forEach((node) => {
    const type = node.data.type
    if (type.startsWith('aws-')) providers.add('aws')
    if (type.startsWith('azure-')) providers.add('azurerm')
    if (type.startsWith('gcp-')) providers.add('google')
  })

  // Add provider blocks
  if (providers.size > 0) {
    lines.push('terraform {')
    lines.push('  required_providers {')
    if (providers.has('aws')) {
      lines.push('    aws = {')
      lines.push('      source  = "hashicorp/aws"')
      lines.push('      version = "~> 5.0"')
      lines.push('    }')
    }
    if (providers.has('azurerm')) {
      lines.push('    azurerm = {')
      lines.push('      source  = "hashicorp/azurerm"')
      lines.push('      version = "~> 3.0"')
      lines.push('    }')
    }
    if (providers.has('google')) {
      lines.push('    google = {')
      lines.push('      source  = "hashicorp/google"')
      lines.push('      version = "~> 5.0"')
      lines.push('    }')
    }
    lines.push('  }')
    lines.push('}')
    lines.push('')

    // Provider configurations
    if (providers.has('aws')) {
      lines.push('provider "aws" {')
      lines.push('  region = var.aws_region')
      lines.push('}')
      lines.push('')
    }
    if (providers.has('azurerm')) {
      lines.push('provider "azurerm" {')
      lines.push('  features {}')
      lines.push('}')
      lines.push('')
    }
    if (providers.has('google')) {
      lines.push('provider "google" {')
      lines.push('  project = var.gcp_project')
      lines.push('  region  = var.gcp_region')
      lines.push('}')
      lines.push('')
    }
  }

  // Generate resources from nodes
  nodes.forEach((node) => {
    const type = node.data.type
    let resourceType: string | undefined
    let resourceName = generateId(node.id).toLowerCase()

    // Find resource type
    if (type.startsWith('aws-')) {
      resourceType = awsResourceMap[type]
    } else if (type.startsWith('azure-')) {
      resourceType = azureResourceMap[type]
    } else if (type.startsWith('gcp-')) {
      resourceType = gcpResourceMap[type]
    }

    if (resourceType) {
      lines.push(`resource "${resourceType}" "${resourceName}" {`)
      lines.push(`  # ${node.data.label}`)

      // Add metadata as tags if present
      if (node.data.metadata) {
        lines.push('  tags = {')
        Object.entries(node.data.metadata).forEach(([key, value]) => {
          if (typeof value === 'string') {
            lines.push(`    "${key}" = "${value}"`)
          }
        })
        lines.push('  }')
      }

      lines.push('  # TODO: Add required configuration')
      lines.push('}')
      lines.push('')
    } else if (type.startsWith('aws-') || type.startsWith('azure-') || type.startsWith('gcp-')) {
      warnings.push(`Unsupported resource type: ${type} (${node.data.label})`)
    }
  })

  // Add comments about relationships
  if (edges.length > 0) {
    lines.push('# Relationships (for reference):')
    edges.forEach((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source)
      const targetNode = nodes.find((n) => n.id === edge.target)
      if (sourceNode && targetNode) {
        const label = (edge.label as string) || ''
        lines.push(`# ${sourceNode.data.label} -> ${targetNode.data.label}${label ? `: ${label}` : ''}`)
      }
    })
  }

  return {
    code: lines.join('\n'),
    warnings,
  }
}

export const codeExportService = {
  exportToMermaid,
  exportToPlantUml,
  exportToTerraform,
}
