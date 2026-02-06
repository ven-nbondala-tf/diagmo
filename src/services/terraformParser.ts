/**
 * Terraform Parser
 *
 * Parses Terraform HCL files and converts infrastructure to Diagmo nodes/edges.
 * Supports resources, data sources, modules, and their dependencies.
 */

import { nanoid } from 'nanoid'
import type { DiagramNode, DiagramEdge, ShapeType, NodeStyle } from '@/types'
import { DEFAULT_NODE_STYLE } from '@/constants'

interface ParseResult {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  errors: string[]
}

interface TerraformResource {
  type: string
  name: string
  provider: string
  blockType: 'resource' | 'data' | 'module' | 'variable' | 'output' | 'provider'
  attributes: Record<string, unknown>
  dependencies: string[] // References to other resources
}

// Map cloud providers and resource types to icons/shapes
const providerShapes: Record<string, ShapeType> = {
  aws: 'aws-generic',
  azurerm: 'azure-generic',
  google: 'gcp-generic',
  kubernetes: 'kubernetes',
  docker: 'docker',
}

// AWS resource type to icon mapping
const awsResourceIcons: Record<string, ShapeType> = {
  'aws_instance': 'aws-ec2',
  'aws_ec2_instance': 'aws-ec2',
  'aws_lambda_function': 'aws-lambda',
  'aws_s3_bucket': 'aws-s3',
  'aws_rds_cluster': 'aws-rds',
  'aws_rds_instance': 'aws-rds',
  'aws_db_instance': 'aws-rds',
  'aws_dynamodb_table': 'aws-dynamodb',
  'aws_vpc': 'aws-vpc',
  'aws_subnet': 'aws-vpc',
  'aws_security_group': 'aws-vpc',
  'aws_iam_role': 'aws-iam',
  'aws_iam_policy': 'aws-iam',
  'aws_iam_user': 'aws-iam',
  'aws_cloudwatch_log_group': 'aws-cloudwatch',
  'aws_cloudwatch_metric_alarm': 'aws-cloudwatch',
  'aws_sns_topic': 'aws-sns',
  'aws_sqs_queue': 'aws-sqs',
  'aws_api_gateway_rest_api': 'aws-api-gateway',
  'aws_apigatewayv2_api': 'aws-api-gateway',
  'aws_ecs_cluster': 'aws-ecs',
  'aws_ecs_service': 'aws-ecs',
  'aws_ecs_task_definition': 'aws-ecs',
  'aws_ecr_repository': 'aws-ecr',
  'aws_elb': 'aws-elb',
  'aws_lb': 'aws-elb',
  'aws_alb': 'aws-elb',
  'aws_cognito_user_pool': 'aws-cognito',
  'aws_kms_key': 'aws-kms',
  'aws_secretsmanager_secret': 'aws-secrets-manager',
  'aws_ssm_parameter': 'aws-ssm',
}

// Azure resource type to icon mapping
const azureResourceIcons: Record<string, ShapeType> = {
  'azurerm_virtual_machine': 'azure-vm',
  'azurerm_linux_virtual_machine': 'azure-vm',
  'azurerm_windows_virtual_machine': 'azure-vm',
  'azurerm_function_app': 'azure-functions',
  'azurerm_linux_function_app': 'azure-functions',
  'azurerm_storage_account': 'azure-storage',
  'azurerm_storage_blob': 'azure-blob',
  'azurerm_sql_database': 'azure-sql',
  'azurerm_mssql_database': 'azure-sql',
  'azurerm_cosmosdb_account': 'azure-cosmos-db',
  'azurerm_virtual_network': 'azure-vnet',
  'azurerm_subnet': 'azure-vnet',
  'azurerm_kubernetes_cluster': 'azure-aks',
  'azurerm_container_registry': 'azure-container-registry',
  'azurerm_key_vault': 'azure-key-vault',
  'azurerm_application_gateway': 'azure-app-gateway',
  'azurerm_app_service': 'azure-app-service',
  'azurerm_linux_web_app': 'azure-app-service',
  'azurerm_api_management': 'azure-api-management',
  'azurerm_servicebus_namespace': 'azure-service-bus',
  'azurerm_eventgrid_topic': 'azure-event-grid',
  'azurerm_eventhub': 'azure-event-hub',
}

// GCP resource type to icon mapping
const gcpResourceIcons: Record<string, ShapeType> = {
  'google_compute_instance': 'gcp-compute-engine',
  'google_cloud_run_service': 'gcp-cloud-run',
  'google_cloudfunctions_function': 'gcp-cloud-functions',
  'google_storage_bucket': 'gcp-cloud-storage',
  'google_sql_database_instance': 'gcp-cloud-sql',
  'google_bigquery_dataset': 'gcp-bigquery',
  'google_pubsub_topic': 'gcp-pub-sub',
  'google_container_cluster': 'gcp-gke',
  'google_compute_network': 'gcp-vpc',
}

// Provider colors for styling
const providerColors: Record<string, { bg: string; border: string }> = {
  aws: { bg: '#ff9900', border: '#cc7a00' },
  azurerm: { bg: '#0078d4', border: '#005a9e' },
  google: { bg: '#4285f4', border: '#2d5fb0' },
  kubernetes: { bg: '#326ce5', border: '#1e4c9a' },
  docker: { bg: '#2496ed', border: '#1a6fb5' },
  default: { bg: '#64748b', border: '#475569' },
}

// Block type colors
const blockTypeColors: Record<string, { bg: string; border: string }> = {
  resource: { bg: '#dcfce7', border: '#16a34a' },
  data: { bg: '#dbeafe', border: '#2563eb' },
  module: { bg: '#fef3c7', border: '#d97706' },
  variable: { bg: '#e0e7ff', border: '#4f46e5' },
  output: { bg: '#f3e8ff', border: '#9333ea' },
  provider: { bg: '#f1f5f9', border: '#64748b' },
}

function getResourceIcon(resourceType: string): ShapeType {
  // Check specific mappings first
  if (awsResourceIcons[resourceType]) return awsResourceIcons[resourceType]
  if (azureResourceIcons[resourceType]) return azureResourceIcons[resourceType]
  if (gcpResourceIcons[resourceType]) return gcpResourceIcons[resourceType]

  // Fall back to provider generic icon
  const provider = resourceType.split('_')[0]
  if (providerShapes[provider]) return providerShapes[provider]

  // Default to rectangle for unknown resources
  return 'rectangle'
}

function extractProvider(resourceType: string): string {
  const parts = resourceType.split('_')
  if (parts[0] === 'aws') return 'aws'
  if (parts[0] === 'azurerm') return 'azurerm'
  if (parts[0] === 'google') return 'google'
  if (parts[0] === 'kubernetes' || parts[0] === 'k8s') return 'kubernetes'
  if (parts[0] === 'docker') return 'docker'
  return 'default'
}

// Simple HCL parser (handles basic Terraform syntax)
function parseHCL(input: string): TerraformResource[] {
  const resources: TerraformResource[] = []
  const lines = input.split('\n')

  let currentBlock: {
    type: TerraformResource['blockType']
    resourceType: string
    name: string
    content: string[]
    depth: number
  } | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Skip comments and empty lines
    if (trimmed.startsWith('#') || trimmed.startsWith('//') || !trimmed) {
      continue
    }

    // Check for block start
    const resourceMatch = trimmed.match(/^(resource|data)\s+"([^"]+)"\s+"([^"]+)"\s*\{?/)
    const moduleMatch = trimmed.match(/^module\s+"([^"]+)"\s*\{?/)
    const variableMatch = trimmed.match(/^variable\s+"([^"]+)"\s*\{?/)
    const outputMatch = trimmed.match(/^output\s+"([^"]+)"\s*\{?/)
    const providerMatch = trimmed.match(/^provider\s+"([^"]+)"\s*\{?/)

    if (resourceMatch) {
      currentBlock = {
        type: resourceMatch[1] as 'resource' | 'data',
        resourceType: resourceMatch[2],
        name: resourceMatch[3],
        content: [],
        depth: 1,
      }
    } else if (moduleMatch) {
      currentBlock = {
        type: 'module',
        resourceType: 'module',
        name: moduleMatch[1],
        content: [],
        depth: 1,
      }
    } else if (variableMatch) {
      currentBlock = {
        type: 'variable',
        resourceType: 'variable',
        name: variableMatch[1],
        content: [],
        depth: 1,
      }
    } else if (outputMatch) {
      currentBlock = {
        type: 'output',
        resourceType: 'output',
        name: outputMatch[1],
        content: [],
        depth: 1,
      }
    } else if (providerMatch) {
      currentBlock = {
        type: 'provider',
        resourceType: providerMatch[1],
        name: providerMatch[1],
        content: [],
        depth: 1,
      }
    } else if (currentBlock) {
      // Track block content
      currentBlock.content.push(line)

      // Count braces to track depth
      const openBraces = (line.match(/\{/g) || []).length
      const closeBraces = (line.match(/\}/g) || []).length
      currentBlock.depth += openBraces - closeBraces

      // Block ended
      if (currentBlock.depth <= 0) {
        const content = currentBlock.content.join('\n')
        const dependencies = extractDependencies(content)

        resources.push({
          type: currentBlock.resourceType,
          name: currentBlock.name,
          provider: extractProvider(currentBlock.resourceType),
          blockType: currentBlock.type,
          attributes: {},
          dependencies,
        })

        currentBlock = null
      }
    }
  }

  return resources
}

// Extract resource references from block content
function extractDependencies(content: string): string[] {
  const dependencies: string[] = []

  // Match resource references like ${aws_instance.example.id} or aws_instance.example.id
  const refRegex = /\$?\{?([a-z_]+\.[a-z0-9_-]+)(?:\.[a-z0-9_]+)*\}?/gi
  let match

  while ((match = refRegex.exec(content)) !== null) {
    const ref = match[1]
    // Filter out common non-resource references
    if (
      !ref.startsWith('var.') &&
      !ref.startsWith('local.') &&
      !ref.startsWith('path.') &&
      !ref.startsWith('terraform.') &&
      !ref.startsWith('each.') &&
      !ref.startsWith('count.') &&
      !ref.startsWith('self.')
    ) {
      dependencies.push(ref)
    }
  }

  // Also check for explicit depends_on
  const dependsOnMatch = content.match(/depends_on\s*=\s*\[([\s\S]*?)\]/i)
  if (dependsOnMatch) {
    const refs = dependsOnMatch[1].match(/([a-z_]+\.[a-z0-9_-]+)/gi)
    if (refs) {
      dependencies.push(...refs)
    }
  }

  return [...new Set(dependencies)]
}

// Layout resources in a hierarchical structure
function layoutResources(resources: TerraformResource[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>()

  // Group by provider/block type
  const groups = new Map<string, TerraformResource[]>()
  for (const res of resources) {
    const key = `${res.provider}-${res.blockType}`
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(res)
  }

  // Layout parameters
  const startX = 100
  const startY = 100
  const nodeWidth = 160
  const nodeHeight = 80
  const horizontalGap = 60
  const verticalGap = 100
  const groupGap = 150

  let currentY = startY
  let groupIndex = 0

  // Layout each group
  for (const [, groupResources] of groups) {
    const cols = Math.ceil(Math.sqrt(groupResources.length))

    groupResources.forEach((res, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const key = `${res.type}.${res.name}`

      positions.set(key, {
        x: startX + col * (nodeWidth + horizontalGap),
        y: currentY + row * (nodeHeight + verticalGap),
      })
    })

    const rows = Math.ceil(groupResources.length / cols)
    currentY += rows * (nodeHeight + verticalGap) + groupGap
    groupIndex++
  }

  return positions
}

export function parseTerraform(input: string): ParseResult {
  const errors: string[] = []
  const nodes: DiagramNode[] = []
  const edges: DiagramEdge[] = []

  try {
    // Parse HCL content
    const resources = parseHCL(input)

    if (resources.length === 0) {
      errors.push('No Terraform resources found in the input')
      return { nodes, edges, errors }
    }

    // Calculate positions
    const positions = layoutResources(resources)

    // Create ID mapping
    const idMap = new Map<string, string>()

    // Convert resources to nodes
    for (const res of resources) {
      const newId = nanoid()
      const key = `${res.type}.${res.name}`
      idMap.set(key, newId)

      const position = positions.get(key) || { x: 100, y: 100 }
      const shape = getResourceIcon(res.type)
      const colors = blockTypeColors[res.blockType] || blockTypeColors.resource

      // Determine if this is a cloud icon type
      const isCloudIcon = shape.startsWith('aws-') ||
                          shape.startsWith('azure-') ||
                          shape.startsWith('gcp-') ||
                          shape === 'kubernetes' ||
                          shape === 'docker'

      const nodeStyle: NodeStyle = {
        ...DEFAULT_NODE_STYLE,
        backgroundColor: isCloudIcon ? 'transparent' : colors.bg,
        borderColor: colors.border,
        borderWidth: isCloudIcon ? 0 : 2,
      }

      // Build label
      let label = res.name
      if (res.blockType === 'data') {
        label = `data.${res.name}`
      } else if (res.blockType === 'module') {
        label = `module.${res.name}`
      }

      const node: DiagramNode = {
        id: newId,
        type: 'custom',
        position,
        style: {
          width: isCloudIcon ? 64 : 160,
          height: isCloudIcon ? 64 : 60,
        },
        data: {
          label,
          type: shape,
          style: nodeStyle,
        },
      }

      nodes.push(node)
    }

    // Create edges from dependencies
    for (const res of resources) {
      const sourceKey = `${res.type}.${res.name}`
      const sourceId = idMap.get(sourceKey)
      if (!sourceId) continue

      for (const dep of res.dependencies) {
        const targetId = idMap.get(dep)
        if (targetId && targetId !== sourceId) {
          const edge: DiagramEdge = {
            id: nanoid(),
            source: targetId, // Dependency points FROM the target
            target: sourceId, // TO the source (which depends on it)
            type: 'labeled',
            markerEnd: {
              type: 'arrowclosed',
              width: 8,
              height: 8,
              color: '#64748b',
            },
            style: {
              strokeWidth: 1.5,
              stroke: '#64748b',
            },
          }
          edges.push(edge)
        }
      }
    }

  } catch (err) {
    errors.push(`Failed to parse Terraform: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }

  return { nodes, edges, errors }
}
