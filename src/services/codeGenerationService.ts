/**
 * Code Generation Service
 * Generates infrastructure code (Terraform, Pulumi, CloudFormation, CDK) from architecture diagrams
 */

import type { DiagramNode, DiagramEdge } from '@/types'

export type CodeProvider = 'terraform' | 'pulumi' | 'cloudformation' | 'cdk'
export type CodeLanguage = 'typescript' | 'python' | 'go' | 'java'

export interface GeneratedFile {
  path: string
  content: string
  language: string
}

export interface CodeGenerationResult {
  files: GeneratedFile[]
  instructions: string
  dependencies: string[]
  warnings: string[]
}

export interface AWSResource {
  type: string
  name: string
  nodeId: string
  properties: Record<string, unknown>
  connections: {
    to: string
    type: 'connects' | 'depends' | 'contains'
  }[]
}

export interface ParsedArchitecture {
  provider: 'aws' | 'azure' | 'gcp' | 'multi-cloud' | 'generic'
  resources: AWSResource[]
  vpc?: {
    name: string
    cidr: string
    subnets: { name: string; type: 'public' | 'private'; cidr: string }[]
  }
  metadata: {
    nodeCount: number
    edgeCount: number
    hasLoadBalancer: boolean
    hasDatabase: boolean
    hasCache: boolean
    hasQueue: boolean
    hasStorage: boolean
    hasCompute: boolean
    hasNetwork: boolean
  }
}

// AWS icon type to Terraform resource mapping
const AWS_TERRAFORM_MAPPING: Record<string, { resource: string; properties: Record<string, unknown> }> = {
  'aws-ec2': { resource: 'aws_instance', properties: { instance_type: 't3.micro' } },
  'aws-lambda': { resource: 'aws_lambda_function', properties: { runtime: 'nodejs18.x', handler: 'index.handler' } },
  'aws-s3': { resource: 'aws_s3_bucket', properties: {} },
  'aws-rds': { resource: 'aws_db_instance', properties: { engine: 'mysql', instance_class: 'db.t3.micro' } },
  'aws-dynamodb': { resource: 'aws_dynamodb_table', properties: { billing_mode: 'PAY_PER_REQUEST' } },
  'aws-elb': { resource: 'aws_lb', properties: { load_balancer_type: 'application' } },
  'aws-alb': { resource: 'aws_lb', properties: { load_balancer_type: 'application' } },
  'aws-nlb': { resource: 'aws_lb', properties: { load_balancer_type: 'network' } },
  'aws-api-gateway': { resource: 'aws_api_gateway_rest_api', properties: {} },
  'aws-cloudfront': { resource: 'aws_cloudfront_distribution', properties: {} },
  'aws-route53': { resource: 'aws_route53_zone', properties: {} },
  'aws-vpc': { resource: 'aws_vpc', properties: { cidr_block: '10.0.0.0/16' } },
  'aws-subnet': { resource: 'aws_subnet', properties: {} },
  'aws-security-group': { resource: 'aws_security_group', properties: {} },
  'aws-iam': { resource: 'aws_iam_role', properties: {} },
  'aws-cognito': { resource: 'aws_cognito_user_pool', properties: {} },
  'aws-sns': { resource: 'aws_sns_topic', properties: {} },
  'aws-sqs': { resource: 'aws_sqs_queue', properties: {} },
  'aws-kinesis': { resource: 'aws_kinesis_stream', properties: { shard_count: 1 } },
  'aws-elasticache': { resource: 'aws_elasticache_cluster', properties: { engine: 'redis' } },
  'aws-ecs': { resource: 'aws_ecs_cluster', properties: {} },
  'aws-eks': { resource: 'aws_eks_cluster', properties: {} },
  'aws-fargate': { resource: 'aws_ecs_service', properties: { launch_type: 'FARGATE' } },
  'aws-cloudwatch': { resource: 'aws_cloudwatch_log_group', properties: {} },
  'aws-secrets-manager': { resource: 'aws_secretsmanager_secret', properties: {} },
  'aws-kms': { resource: 'aws_kms_key', properties: {} },
  'aws-step-functions': { resource: 'aws_sfn_state_machine', properties: {} },
  'aws-eventbridge': { resource: 'aws_cloudwatch_event_bus', properties: {} },
  'aws-ecr': { resource: 'aws_ecr_repository', properties: {} },
  'aws-waf': { resource: 'aws_wafv2_web_acl', properties: {} },
}

// Azure icon type to Terraform resource mapping
const AZURE_TERRAFORM_MAPPING: Record<string, { resource: string; properties: Record<string, unknown> }> = {
  // Compute
  'azure-vm': { resource: 'azurerm_virtual_machine', properties: { vm_size: 'Standard_B1s' } },
  'azure-virtual-machine': { resource: 'azurerm_virtual_machine', properties: { vm_size: 'Standard_B1s' } },
  'azure-vm-scale-sets': { resource: 'azurerm_virtual_machine_scale_set', properties: {} },
  'azure-app-service': { resource: 'azurerm_app_service', properties: {} },
  'azure-app-services': { resource: 'azurerm_app_service', properties: {} },
  'azure-function-apps': { resource: 'azurerm_function_app', properties: {} },
  'azure-functions': { resource: 'azurerm_function_app', properties: {} },
  'azure-batch-accounts': { resource: 'azurerm_batch_account', properties: {} },
  'azure-service-fabric-clusters': { resource: 'azurerm_service_fabric_cluster', properties: {} },
  'azure-spot-vm': { resource: 'azurerm_virtual_machine', properties: { priority: 'Spot' } },
  // Containers
  'azure-kubernetes-services': { resource: 'azurerm_kubernetes_cluster', properties: {} },
  'azure-aks': { resource: 'azurerm_kubernetes_cluster', properties: {} },
  'azure-container-registries': { resource: 'azurerm_container_registry', properties: {} },
  'azure-container-registry': { resource: 'azurerm_container_registry', properties: {} },
  'azure-container-instances': { resource: 'azurerm_container_group', properties: {} },
  'azure-container-apps-environments': { resource: 'azurerm_container_app_environment', properties: {} },
  'azure-container': { resource: 'azurerm_container_group', properties: {} },
  // Storage
  'azure-storage': { resource: 'azurerm_storage_account', properties: { account_tier: 'Standard' } },
  'azure-storage-accounts': { resource: 'azurerm_storage_account', properties: { account_tier: 'Standard' } },
  'azure-blob-block': { resource: 'azurerm_storage_blob', properties: {} },
  'azure-blob-page': { resource: 'azurerm_storage_blob', properties: {} },
  'azure-azure-fileshares': { resource: 'azurerm_storage_share', properties: {} },
  'azure-storage-queue': { resource: 'azurerm_storage_queue', properties: {} },
  'azure-table': { resource: 'azurerm_storage_table', properties: {} },
  'azure-azure-netapp-files': { resource: 'azurerm_netapp_volume', properties: {} },
  // Database
  'azure-sql': { resource: 'azurerm_sql_database', properties: {} },
  'azure-sql-database': { resource: 'azurerm_sql_database', properties: {} },
  'azure-sql-managed-instance': { resource: 'azurerm_sql_managed_instance', properties: {} },
  'azure-cosmos-db': { resource: 'azurerm_cosmosdb_account', properties: {} },
  'azure-azure-cosmos-db': { resource: 'azurerm_cosmosdb_account', properties: {} },
  'azure-cosmos': { resource: 'azurerm_cosmosdb_account', properties: {} },
  'azure-redis': { resource: 'azurerm_redis_cache', properties: {} },
  'azure-cache-redis': { resource: 'azurerm_redis_cache', properties: {} },
  'azure-azure-cache-for-redis': { resource: 'azurerm_redis_cache', properties: {} },
  'azure-mysql': { resource: 'azurerm_mysql_server', properties: {} },
  'azure-azure-database-mysql': { resource: 'azurerm_mysql_server', properties: {} },
  'azure-postgresql': { resource: 'azurerm_postgresql_server', properties: {} },
  'azure-azure-database-postgresql': { resource: 'azurerm_postgresql_server', properties: {} },
  // Networking
  'azure-vnet': { resource: 'azurerm_virtual_network', properties: { address_space: ['10.0.0.0/16'] } },
  'azure-virtual-networks': { resource: 'azurerm_virtual_network', properties: { address_space: ['10.0.0.0/16'] } },
  'azure-load-balancer': { resource: 'azurerm_lb', properties: {} },
  'azure-load-balancers': { resource: 'azurerm_lb', properties: {} },
  'azure-application-gateway': { resource: 'azurerm_application_gateway', properties: {} },
  'azure-application-gateways': { resource: 'azurerm_application_gateway', properties: {} },
  'azure-front-door': { resource: 'azurerm_frontdoor', properties: {} },
  'azure-front-doors': { resource: 'azurerm_frontdoor', properties: {} },
  'azure-cdn': { resource: 'azurerm_cdn_profile', properties: {} },
  'azure-cdn-profiles': { resource: 'azurerm_cdn_profile', properties: {} },
  'azure-dns-zones': { resource: 'azurerm_dns_zone', properties: {} },
  'azure-traffic-manager-profiles': { resource: 'azurerm_traffic_manager_profile', properties: {} },
  'azure-network-security-groups': { resource: 'azurerm_network_security_group', properties: {} },
  'azure-nsg': { resource: 'azurerm_network_security_group', properties: {} },
  'azure-vpn-gateways': { resource: 'azurerm_vpn_gateway', properties: {} },
  'azure-expressroute-circuits': { resource: 'azurerm_express_route_circuit', properties: {} },
  // Integration
  'azure-service-bus': { resource: 'azurerm_servicebus_namespace', properties: {} },
  'azure-service-bus-namespace': { resource: 'azurerm_servicebus_namespace', properties: {} },
  'azure-event-hub': { resource: 'azurerm_eventhub_namespace', properties: {} },
  'azure-event-hubs': { resource: 'azurerm_eventhub_namespace', properties: {} },
  'azure-event-grid': { resource: 'azurerm_eventgrid_topic', properties: {} },
  'azure-event-grid-topics': { resource: 'azurerm_eventgrid_topic', properties: {} },
  'azure-logic-apps': { resource: 'azurerm_logic_app_workflow', properties: {} },
  'azure-api-management': { resource: 'azurerm_api_management', properties: {} },
  'azure-api-management-services': { resource: 'azurerm_api_management', properties: {} },
  // Security
  'azure-key-vault': { resource: 'azurerm_key_vault', properties: {} },
  'azure-key-vaults': { resource: 'azurerm_key_vault', properties: {} },
  'azure-active-directory': { resource: 'azuread_application', properties: {} },
  'azure-azure-active-directory': { resource: 'azuread_application', properties: {} },
  'azure-azure-ad-b2c': { resource: 'azurerm_aadb2c_directory', properties: {} },
  'azure-security-center': { resource: 'azurerm_security_center_subscription_pricing', properties: {} },
  // AI/ML
  'azure-cognitive-services': { resource: 'azurerm_cognitive_account', properties: {} },
  'azure-machine-learning': { resource: 'azurerm_machine_learning_workspace', properties: {} },
  'azure-bot-services': { resource: 'azurerm_bot_channels_registration', properties: {} },
  'azure-azure-openai': { resource: 'azurerm_cognitive_account', properties: { kind: 'OpenAI' } },
  // Analytics
  'azure-synapse-analytics': { resource: 'azurerm_synapse_workspace', properties: {} },
  'azure-data-factory': { resource: 'azurerm_data_factory', properties: {} },
  'azure-data-factories': { resource: 'azurerm_data_factory', properties: {} },
  'azure-hdinsight-clusters': { resource: 'azurerm_hdinsight_hadoop_cluster', properties: {} },
  'azure-databricks': { resource: 'azurerm_databricks_workspace', properties: {} },
  'azure-stream-analytics-jobs': { resource: 'azurerm_stream_analytics_job', properties: {} },
  // Monitoring
  'azure-monitor': { resource: 'azurerm_monitor_action_group', properties: {} },
  'azure-log-analytics-workspaces': { resource: 'azurerm_log_analytics_workspace', properties: {} },
  'azure-application-insights': { resource: 'azurerm_application_insights', properties: {} },
}

// GCP icon type to Terraform resource mapping
const GCP_TERRAFORM_MAPPING: Record<string, { resource: string; properties: Record<string, unknown> }> = {
  'gcp-compute': { resource: 'google_compute_instance', properties: { machine_type: 'e2-micro' } },
  'gcp-cloud-run': { resource: 'google_cloud_run_service', properties: {} },
  'gcp-functions': { resource: 'google_cloudfunctions_function', properties: { runtime: 'nodejs18' } },
  'gcp-storage': { resource: 'google_storage_bucket', properties: {} },
  'gcp-cloud-sql': { resource: 'google_sql_database_instance', properties: {} },
  'gcp-firestore': { resource: 'google_firestore_database', properties: {} },
  'gcp-bigquery': { resource: 'google_bigquery_dataset', properties: {} },
  'gcp-pubsub': { resource: 'google_pubsub_topic', properties: {} },
  'gcp-gke': { resource: 'google_container_cluster', properties: {} },
  'gcp-vpc': { resource: 'google_compute_network', properties: {} },
  'gcp-load-balancer': { resource: 'google_compute_global_forwarding_rule', properties: {} },
  'gcp-cdn': { resource: 'google_compute_backend_bucket', properties: {} },
  'gcp-iam': { resource: 'google_project_iam_member', properties: {} },
  'gcp-kms': { resource: 'google_kms_key_ring', properties: {} },
}

/**
 * Parse diagram nodes and edges into a structured architecture
 */
export function parseArchitecture(nodes: DiagramNode[], edges: DiagramEdge[]): ParsedArchitecture {
  const resources: AWSResource[] = []
  let provider: ParsedArchitecture['provider'] = 'generic'

  // Detect cloud provider
  const awsNodes = nodes.filter(n => n.data.type.startsWith('aws-'))
  const azureNodes = nodes.filter(n => n.data.type.startsWith('azure-'))
  const gcpNodes = nodes.filter(n => n.data.type.startsWith('gcp-'))

  if (awsNodes.length > 0 && azureNodes.length === 0 && gcpNodes.length === 0) {
    provider = 'aws'
  } else if (azureNodes.length > 0 && awsNodes.length === 0 && gcpNodes.length === 0) {
    provider = 'azure'
  } else if (gcpNodes.length > 0 && awsNodes.length === 0 && azureNodes.length === 0) {
    provider = 'gcp'
  } else if (awsNodes.length > 0 || azureNodes.length > 0 || gcpNodes.length > 0) {
    provider = 'multi-cloud'
  }

  // Parse nodes into resources - only include cloud provider resources
  for (const node of nodes) {
    const type = node.data.type

    // Only include cloud provider resources (aws-, azure-, gcp-)
    if (!type.startsWith('aws-') && !type.startsWith('azure-') && !type.startsWith('gcp-')) {
      continue
    }

    const label = node.data.label || type
    const name = sanitizeName(label)

    // Find connections for this node
    const connections = edges
      .filter(e => e.source === node.id)
      .map(e => ({
        to: e.target,
        type: 'connects' as const,
      }))

    resources.push({
      type,
      name,
      nodeId: node.id,
      properties: {},
      connections,
    })
  }

  // Detect architecture patterns
  const metadata = {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    hasLoadBalancer: nodes.some(n =>
      n.data.type.includes('lb') ||
      n.data.type.includes('load-balancer') ||
      n.data.type.includes('elb') ||
      n.data.type.includes('alb')
    ),
    hasDatabase: nodes.some(n =>
      n.data.type.includes('rds') ||
      n.data.type.includes('dynamodb') ||
      n.data.type.includes('sql') ||
      n.data.type.includes('cosmos') ||
      n.data.type.includes('firestore')
    ),
    hasCache: nodes.some(n =>
      n.data.type.includes('elasticache') ||
      n.data.type.includes('redis')
    ),
    hasQueue: nodes.some(n =>
      n.data.type.includes('sqs') ||
      n.data.type.includes('sns') ||
      n.data.type.includes('pubsub') ||
      n.data.type.includes('service-bus')
    ),
    hasStorage: nodes.some(n =>
      n.data.type.includes('s3') ||
      n.data.type.includes('storage')
    ),
    hasCompute: nodes.some(n =>
      n.data.type.includes('ec2') ||
      n.data.type.includes('lambda') ||
      n.data.type.includes('ecs') ||
      n.data.type.includes('vm') ||
      n.data.type.includes('compute') ||
      n.data.type.includes('functions')
    ),
    hasNetwork: nodes.some(n =>
      n.data.type.includes('vpc') ||
      n.data.type.includes('vnet') ||
      n.data.type.includes('subnet')
    ),
  }

  return { provider, resources, metadata }
}

/**
 * Sanitize a name for use in code
 */
function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 50) || 'resource'
}

/**
 * Generate Terraform code from architecture
 */
export function generateTerraform(architecture: ParsedArchitecture): CodeGenerationResult {
  const files: GeneratedFile[] = []
  const warnings: string[] = []
  const dependencies: string[] = []

  // Determine provider config
  let providerBlock = ''
  let requiredProviders = ''

  if (architecture.provider === 'aws' || architecture.provider === 'multi-cloud') {
    providerBlock += `
provider "aws" {
  region = var.aws_region
}
`
    requiredProviders += `
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }`
    dependencies.push('hashicorp/aws')
  }

  if (architecture.provider === 'azure' || architecture.provider === 'multi-cloud') {
    providerBlock += `
provider "azurerm" {
  features {}
}
`
    requiredProviders += `
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }`
    dependencies.push('hashicorp/azurerm')
  }

  if (architecture.provider === 'gcp' || architecture.provider === 'multi-cloud') {
    providerBlock += `
provider "google" {
  project = var.gcp_project
  region  = var.gcp_region
}
`
    requiredProviders += `
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }`
    dependencies.push('hashicorp/google')
  }

  // main.tf
  let mainContent = `# Generated by Diagmo Pro
# Architecture: ${architecture.provider}
# Resources: ${architecture.resources.length}

terraform {
  required_version = ">= 1.0"
  required_providers {${requiredProviders}
  }
}
${providerBlock}
`

  // Generate resources
  const resourceBlocks: string[] = []
  const usedNames = new Set<string>()

  for (const resource of architecture.resources) {
    const mapping = getResourceMapping(resource.type)

    if (!mapping) {
      warnings.push(`No mapping for resource type: ${resource.type} (${resource.name})`)
      continue
    }

    // Ensure unique name
    let uniqueName = resource.name
    let counter = 1
    while (usedNames.has(uniqueName)) {
      uniqueName = `${resource.name}_${counter++}`
    }
    usedNames.add(uniqueName)

    const props = generateTerraformProperties(mapping.resource, mapping.properties, uniqueName)

    resourceBlocks.push(`
# ${resource.name}
resource "${mapping.resource}" "${uniqueName}" {
${props}
}`)
  }

  mainContent += resourceBlocks.join('\n')

  files.push({
    path: 'main.tf',
    content: mainContent,
    language: 'hcl',
  })

  // variables.tf
  let variablesContent = `# Variables for ${architecture.provider} infrastructure

`

  if (architecture.provider === 'aws' || architecture.provider === 'multi-cloud') {
    variablesContent += `variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

`
  }

  if (architecture.provider === 'azure' || architecture.provider === 'multi-cloud') {
    variablesContent += `variable "azure_location" {
  description = "Azure location"
  type        = string
  default     = "eastus"
}

variable "resource_group_name" {
  description = "Azure resource group name"
  type        = string
  default     = "diagmo-rg"
}

`
  }

  if (architecture.provider === 'gcp' || architecture.provider === 'multi-cloud') {
    variablesContent += `variable "gcp_project" {
  description = "GCP project ID"
  type        = string
}

variable "gcp_region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

`
  }

  variablesContent += `variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default = {
    ManagedBy = "Terraform"
    CreatedBy = "Diagmo"
  }
}
`

  files.push({
    path: 'variables.tf',
    content: variablesContent,
    language: 'hcl',
  })

  // outputs.tf
  let outputsContent = `# Outputs

`

  // Add some common outputs based on resource types
  const hasCompute = architecture.resources.some(r =>
    r.type.includes('ec2') || r.type.includes('instance') || r.type.includes('vm')
  )
  const hasLB = architecture.resources.some(r =>
    r.type.includes('lb') || r.type.includes('load')
  )
  const hasStorage = architecture.resources.some(r =>
    r.type.includes('s3') || r.type.includes('storage')
  )

  if (hasLB) {
    outputsContent += `# Add load balancer DNS output after applying
# output "lb_dns_name" {
#   value = aws_lb.main.dns_name
# }
`
  }

  if (hasStorage) {
    outputsContent += `# Add storage bucket output after applying
# output "bucket_name" {
#   value = aws_s3_bucket.main.id
# }
`
  }

  files.push({
    path: 'outputs.tf',
    content: outputsContent,
    language: 'hcl',
  })

  // terraform.tfvars.example
  let tfvarsContent = `# Example variable values
# Copy this file to terraform.tfvars and fill in your values

`

  if (architecture.provider === 'aws' || architecture.provider === 'multi-cloud') {
    tfvarsContent += `aws_region = "us-east-1"
`
  }

  if (architecture.provider === 'gcp' || architecture.provider === 'multi-cloud') {
    tfvarsContent += `gcp_project = "your-project-id"
gcp_region  = "us-central1"
`
  }

  tfvarsContent += `environment = "dev"

tags = {
  ManagedBy   = "Terraform"
  CreatedBy   = "Diagmo"
  Environment = "dev"
}
`

  files.push({
    path: 'terraform.tfvars.example',
    content: tfvarsContent,
    language: 'hcl',
  })

  const instructions = `## Terraform Deployment Instructions

### Prerequisites
- Terraform >= 1.0 installed
- ${architecture.provider === 'aws' ? 'AWS CLI configured with credentials' : ''}
${architecture.provider === 'azure' ? '- Azure CLI logged in' : ''}
${architecture.provider === 'gcp' ? '- GCP CLI configured with project' : ''}

### Steps
1. Copy \`terraform.tfvars.example\` to \`terraform.tfvars\`
2. Edit \`terraform.tfvars\` with your values
3. Initialize Terraform:
   \`\`\`bash
   terraform init
   \`\`\`
4. Preview changes:
   \`\`\`bash
   terraform plan
   \`\`\`
5. Apply infrastructure:
   \`\`\`bash
   terraform apply
   \`\`\`

### Notes
- Review the generated code and adjust resource configurations as needed
- Add security groups, IAM policies, and networking as required
- Some resources may need additional configuration for production use
`

  return { files, instructions, dependencies, warnings }
}

/**
 * Generate Pulumi code from architecture
 */
export function generatePulumi(architecture: ParsedArchitecture, language: CodeLanguage): CodeGenerationResult {
  const files: GeneratedFile[] = []
  const warnings: string[] = []
  const dependencies: string[] = []

  if (language === 'typescript') {
    // Pulumi.yaml
    files.push({
      path: 'Pulumi.yaml',
      content: `name: diagmo-infrastructure
runtime: nodejs
description: Infrastructure generated by Diagmo Pro
`,
      language: 'yaml',
    })

    // package.json
    const packageDeps: Record<string, string> = {
      '@pulumi/pulumi': '^3.0.0',
    }

    if (architecture.provider === 'aws' || architecture.provider === 'multi-cloud') {
      packageDeps['@pulumi/aws'] = '^6.0.0'
      dependencies.push('@pulumi/aws')
    }
    if (architecture.provider === 'azure' || architecture.provider === 'multi-cloud') {
      packageDeps['@pulumi/azure-native'] = '^2.0.0'
      dependencies.push('@pulumi/azure-native')
    }
    if (architecture.provider === 'gcp' || architecture.provider === 'multi-cloud') {
      packageDeps['@pulumi/gcp'] = '^7.0.0'
      dependencies.push('@pulumi/gcp')
    }

    files.push({
      path: 'package.json',
      content: JSON.stringify({
        name: 'diagmo-infrastructure',
        version: '1.0.0',
        main: 'index.ts',
        devDependencies: {
          '@types/node': '^18.0.0',
          'typescript': '^5.0.0',
        },
        dependencies: packageDeps,
      }, null, 2),
      language: 'json',
    })

    // index.ts
    let indexContent = `import * as pulumi from "@pulumi/pulumi";
`

    if (architecture.provider === 'aws' || architecture.provider === 'multi-cloud') {
      indexContent += `import * as aws from "@pulumi/aws";
`
    }
    if (architecture.provider === 'azure' || architecture.provider === 'multi-cloud') {
      indexContent += `import * as azure from "@pulumi/azure-native";
`
    }
    if (architecture.provider === 'gcp' || architecture.provider === 'multi-cloud') {
      indexContent += `import * as gcp from "@pulumi/gcp";
`
    }

    indexContent += `
// Configuration
const config = new pulumi.Config();
const environment = config.get("environment") || "dev";

// Tags for all resources
const tags = {
  Environment: environment,
  ManagedBy: "Pulumi",
  CreatedBy: "Diagmo",
};

`

    // Generate resources
    const usedNames = new Set<string>()

    for (const resource of architecture.resources) {
      const mapping = getResourceMapping(resource.type)

      if (!mapping) {
        warnings.push(`No mapping for resource type: ${resource.type} (${resource.name})`)
        continue
      }

      let uniqueName = resource.name
      let counter = 1
      while (usedNames.has(uniqueName)) {
        uniqueName = `${resource.name}${counter++}`
      }
      usedNames.add(uniqueName)

      const pulumiCode = generatePulumiResource(resource.type, uniqueName, mapping)
      if (pulumiCode) {
        indexContent += pulumiCode + '\n'
      }
    }

    // Add exports
    indexContent += `
// Exports
export const environment_name = environment;
`

    files.push({
      path: 'index.ts',
      content: indexContent,
      language: 'typescript',
    })

    // tsconfig.json
    files.push({
      path: 'tsconfig.json',
      content: JSON.stringify({
        compilerOptions: {
          target: 'ES2020',
          module: 'commonjs',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          outDir: './bin',
        },
        include: ['*.ts'],
      }, null, 2),
      language: 'json',
    })
  }

  const instructions = `## Pulumi Deployment Instructions

### Prerequisites
- Node.js >= 18 installed
- Pulumi CLI installed
- ${architecture.provider === 'aws' ? 'AWS credentials configured' : ''}
${architecture.provider === 'azure' ? '- Azure CLI logged in' : ''}
${architecture.provider === 'gcp' ? '- GCP credentials configured' : ''}

### Steps
1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
2. Create a new stack:
   \`\`\`bash
   pulumi stack init dev
   \`\`\`
3. Set configuration:
   \`\`\`bash
   pulumi config set environment dev
   ${architecture.provider === 'aws' ? 'pulumi config set aws:region us-east-1' : ''}
   \`\`\`
4. Preview changes:
   \`\`\`bash
   pulumi preview
   \`\`\`
5. Deploy:
   \`\`\`bash
   pulumi up
   \`\`\`
`

  return { files, instructions, dependencies, warnings }
}

/**
 * Generate CloudFormation template
 */
export function generateCloudFormation(architecture: ParsedArchitecture): CodeGenerationResult {
  const files: GeneratedFile[] = []
  const warnings: string[] = []
  const dependencies: string[] = []

  if (architecture.provider !== 'aws' && architecture.provider !== 'multi-cloud') {
    warnings.push('CloudFormation only supports AWS resources. Non-AWS resources will be skipped.')
  }

  const template: Record<string, unknown> = {
    AWSTemplateFormatVersion: '2010-09-09',
    Description: 'Infrastructure generated by Diagmo Pro',

    Parameters: {
      Environment: {
        Type: 'String',
        Default: 'dev',
        AllowedValues: ['dev', 'staging', 'prod'],
        Description: 'Deployment environment',
      },
    },

    Resources: {} as Record<string, unknown>,

    Outputs: {},
  }

  const resources = template.Resources as Record<string, unknown>
  const usedNames = new Set<string>()

  for (const resource of architecture.resources) {
    if (!resource.type.startsWith('aws-')) {
      warnings.push(`Skipping non-AWS resource: ${resource.type}`)
      continue
    }

    const cfnResource = generateCloudFormationResource(resource)
    if (cfnResource) {
      let uniqueName = toPascalCase(resource.name)
      let counter = 1
      while (usedNames.has(uniqueName)) {
        uniqueName = `${toPascalCase(resource.name)}${counter++}`
      }
      usedNames.add(uniqueName)

      resources[uniqueName] = cfnResource
    } else {
      warnings.push(`No CloudFormation mapping for: ${resource.type}`)
    }
  }

  files.push({
    path: 'template.yaml',
    content: generateYaml(template),
    language: 'yaml',
  })

  // Parameters file
  files.push({
    path: 'parameters-dev.json',
    content: JSON.stringify([
      { ParameterKey: 'Environment', ParameterValue: 'dev' },
    ], null, 2),
    language: 'json',
  })

  const instructions = `## CloudFormation Deployment Instructions

### Prerequisites
- AWS CLI configured with credentials
- Appropriate IAM permissions

### Steps
1. Validate template:
   \`\`\`bash
   aws cloudformation validate-template --template-body file://template.yaml
   \`\`\`
2. Create stack:
   \`\`\`bash
   aws cloudformation create-stack \\
     --stack-name diagmo-infrastructure \\
     --template-body file://template.yaml \\
     --parameters file://parameters-dev.json \\
     --capabilities CAPABILITY_IAM
   \`\`\`
3. Monitor progress:
   \`\`\`bash
   aws cloudformation describe-stack-events --stack-name diagmo-infrastructure
   \`\`\`
`

  return { files, instructions, dependencies, warnings }
}

/**
 * Generate AWS CDK code
 */
export function generateCDK(architecture: ParsedArchitecture, language: CodeLanguage): CodeGenerationResult {
  const files: GeneratedFile[] = []
  const warnings: string[] = []
  const dependencies: string[] = ['aws-cdk-lib', 'constructs']

  if (architecture.provider !== 'aws' && architecture.provider !== 'multi-cloud') {
    warnings.push('AWS CDK primarily supports AWS resources. Non-AWS resources will be skipped.')
  }

  if (language === 'typescript') {
    // cdk.json
    files.push({
      path: 'cdk.json',
      content: JSON.stringify({
        app: 'npx ts-node --prefer-ts-exts bin/app.ts',
        watch: {
          include: ['**'],
          exclude: ['node_modules', 'cdk.out'],
        },
      }, null, 2),
      language: 'json',
    })

    // package.json
    files.push({
      path: 'package.json',
      content: JSON.stringify({
        name: 'diagmo-cdk',
        version: '1.0.0',
        bin: { 'diagmo-cdk': 'bin/app.js' },
        scripts: {
          build: 'tsc',
          watch: 'tsc -w',
          cdk: 'cdk',
        },
        devDependencies: {
          '@types/node': '^18.0.0',
          'typescript': '^5.0.0',
          'ts-node': '^10.0.0',
          'aws-cdk': '^2.0.0',
        },
        dependencies: {
          'aws-cdk-lib': '^2.0.0',
          'constructs': '^10.0.0',
        },
      }, null, 2),
      language: 'json',
    })

    // bin/app.ts
    files.push({
      path: 'bin/app.ts',
      content: `#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DiagmoStack } from '../lib/diagmo-stack';

const app = new cdk.App();

new DiagmoStack(app, 'DiagmoStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
`,
      language: 'typescript',
    })

    // lib/diagmo-stack.ts
    let stackContent = `import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elasticloadbalancingv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';

export class DiagmoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Tags for all resources
    cdk.Tags.of(this).add('ManagedBy', 'CDK');
    cdk.Tags.of(this).add('CreatedBy', 'Diagmo');

`

    // Generate resources
    const usedNames = new Set<string>()

    for (const resource of architecture.resources) {
      if (!resource.type.startsWith('aws-')) {
        warnings.push(`Skipping non-AWS resource: ${resource.type}`)
        continue
      }

      let uniqueName = resource.name
      let counter = 1
      while (usedNames.has(uniqueName)) {
        uniqueName = `${resource.name}${counter++}`
      }
      usedNames.add(uniqueName)

      const cdkCode = generateCDKResource(resource.type, uniqueName)
      if (cdkCode) {
        stackContent += `    ${cdkCode}\n\n`
      } else {
        warnings.push(`No CDK mapping for: ${resource.type}`)
      }
    }

    stackContent += `  }
}
`

    files.push({
      path: 'lib/diagmo-stack.ts',
      content: stackContent,
      language: 'typescript',
    })

    // tsconfig.json
    files.push({
      path: 'tsconfig.json',
      content: JSON.stringify({
        compilerOptions: {
          target: 'ES2020',
          module: 'commonjs',
          lib: ['ES2020'],
          declaration: true,
          strict: true,
          noImplicitAny: true,
          strictNullChecks: true,
          noImplicitThis: true,
          alwaysStrict: true,
          noUnusedLocals: false,
          noUnusedParameters: false,
          noImplicitReturns: true,
          noFallthroughCasesInSwitch: false,
          inlineSourceMap: true,
          inlineSources: true,
          experimentalDecorators: true,
          strictPropertyInitialization: false,
          outDir: './dist',
        },
        exclude: ['node_modules', 'cdk.out'],
      }, null, 2),
      language: 'json',
    })
  }

  const instructions = `## AWS CDK Deployment Instructions

### Prerequisites
- Node.js >= 18 installed
- AWS CLI configured with credentials
- AWS CDK CLI installed: \`npm install -g aws-cdk\`

### Steps
1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
2. Bootstrap CDK (first time only):
   \`\`\`bash
   cdk bootstrap
   \`\`\`
3. Synthesize CloudFormation template:
   \`\`\`bash
   cdk synth
   \`\`\`
4. Deploy:
   \`\`\`bash
   cdk deploy
   \`\`\`
`

  return { files, instructions, dependencies, warnings }
}

// Helper functions

function getResourceMapping(type: string): { resource: string; properties: Record<string, unknown> } | null {
  if (type.startsWith('aws-')) {
    return AWS_TERRAFORM_MAPPING[type] || null
  }
  if (type.startsWith('azure-')) {
    return AZURE_TERRAFORM_MAPPING[type] || null
  }
  if (type.startsWith('gcp-')) {
    return GCP_TERRAFORM_MAPPING[type] || null
  }
  return null
}

function generateTerraformProperties(resourceType: string, defaultProps: Record<string, unknown>, name: string): string {
  const lines: string[] = []

  // Add common properties based on resource type
  if (resourceType.startsWith('aws_')) {
    lines.push(`  tags = merge(var.tags, { Name = "${name}" })`)
  }

  // Add default properties
  for (const [key, value] of Object.entries(defaultProps)) {
    if (typeof value === 'string') {
      lines.push(`  ${key} = "${value}"`)
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      lines.push(`  ${key} = ${value}`)
    } else if (Array.isArray(value)) {
      lines.push(`  ${key} = ${JSON.stringify(value)}`)
    }
  }

  // Add resource-specific required properties
  switch (resourceType) {
    case 'aws_instance':
      lines.push(`  ami           = "ami-0c55b159cbfafe1f0" # Update with your AMI`)
      break
    case 'aws_s3_bucket':
      lines.push(`  bucket = "${name}-\${var.environment}"`)
      break
    case 'aws_lambda_function':
      lines.push(`  function_name = "${name}"`)
      lines.push(`  filename      = "lambda.zip" # Update with your code`)
      lines.push(`  role          = aws_iam_role.lambda_role.arn # Create IAM role`)
      break
    case 'aws_dynamodb_table':
      lines.push(`  name         = "${name}"`)
      lines.push(`  hash_key     = "id"`)
      lines.push(`  attribute {`)
      lines.push(`    name = "id"`)
      lines.push(`    type = "S"`)
      lines.push(`  }`)
      break
    case 'aws_db_instance':
      lines.push(`  identifier = "${name}"`)
      lines.push(`  allocated_storage = 20`)
      lines.push(`  username = "admin"`)
      lines.push(`  password = "changeme123!" # Use secrets manager in production`)
      break
  }

  return lines.join('\n')
}

function generatePulumiResource(type: string, name: string, mapping: { resource: string; properties: Record<string, unknown> }): string | null {
  if (type.startsWith('aws-')) {
    const resourceName = mapping.resource.replace('aws_', '')
    const className = toPascalCase(resourceName)

    // Map common resources
    const pulumiClassMap: Record<string, string> = {
      'instance': 'aws.ec2.Instance',
      'lambda_function': 'aws.lambda.Function',
      's3_bucket': 'aws.s3.Bucket',
      'db_instance': 'aws.rds.Instance',
      'dynamodb_table': 'aws.dynamodb.Table',
      'lb': 'aws.lb.LoadBalancer',
      'vpc': 'aws.ec2.Vpc',
      'ecs_cluster': 'aws.ecs.Cluster',
      'eks_cluster': 'aws.eks.Cluster',
      'sqs_queue': 'aws.sqs.Queue',
      'sns_topic': 'aws.sns.Topic',
    }

    const pulumiClass = pulumiClassMap[resourceName] || `aws.${resourceName.split('_')[0]}.${className}`

    return `// ${name}
const ${name} = new ${pulumiClass}("${name}", {
  tags: tags,
});`
  }

  return null
}

function generateCloudFormationResource(resource: AWSResource): Record<string, unknown> | null {
  const cfnTypeMap: Record<string, string> = {
    'aws-ec2': 'AWS::EC2::Instance',
    'aws-lambda': 'AWS::Lambda::Function',
    'aws-s3': 'AWS::S3::Bucket',
    'aws-rds': 'AWS::RDS::DBInstance',
    'aws-dynamodb': 'AWS::DynamoDB::Table',
    'aws-elb': 'AWS::ElasticLoadBalancingV2::LoadBalancer',
    'aws-alb': 'AWS::ElasticLoadBalancingV2::LoadBalancer',
    'aws-vpc': 'AWS::EC2::VPC',
    'aws-ecs': 'AWS::ECS::Cluster',
    'aws-eks': 'AWS::EKS::Cluster',
    'aws-sqs': 'AWS::SQS::Queue',
    'aws-sns': 'AWS::SNS::Topic',
    'aws-api-gateway': 'AWS::ApiGateway::RestApi',
  }

  const cfnType = cfnTypeMap[resource.type]
  if (!cfnType) return null

  const cfnResource: Record<string, unknown> = {
    Type: cfnType,
    Properties: {},
  }

  // Add basic properties based on type
  const props = cfnResource.Properties as Record<string, unknown>

  switch (resource.type) {
    case 'aws-s3':
      props.BucketName = { 'Fn::Sub': `${resource.name}-\${Environment}` }
      break
    case 'aws-dynamodb':
      props.TableName = resource.name
      props.BillingMode = 'PAY_PER_REQUEST'
      props.AttributeDefinitions = [{ AttributeName: 'id', AttributeType: 'S' }]
      props.KeySchema = [{ AttributeName: 'id', KeyType: 'HASH' }]
      break
    case 'aws-sqs':
      props.QueueName = resource.name
      break
    case 'aws-sns':
      props.TopicName = resource.name
      break
  }

  return cfnResource
}

function generateCDKResource(type: string, name: string): string | null {
  const cdkMap: Record<string, string> = {
    'aws-ec2': `const ${name} = new ec2.Instance(this, '${toPascalCase(name)}', {
      vpc: vpc, // Reference your VPC
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux2(),
    });`,
    'aws-lambda': `const ${name} = new lambda.Function(this, '${toPascalCase(name)}', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'), // Update path
    });`,
    'aws-s3': `const ${name} = new s3.Bucket(this, '${toPascalCase(name)}', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });`,
    'aws-dynamodb': `const ${name} = new dynamodb.Table(this, '${toPascalCase(name)}', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });`,
    'aws-rds': `const ${name} = new rds.DatabaseInstance(this, '${toPascalCase(name)}', {
      engine: rds.DatabaseInstanceEngine.mysql({ version: rds.MysqlEngineVersion.VER_8_0 }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      vpc: vpc, // Reference your VPC
    });`,
    'aws-ecs': `const ${name} = new ecs.Cluster(this, '${toPascalCase(name)}', {
      vpc: vpc, // Reference your VPC
    });`,
    'aws-elb': `const ${name} = new elasticloadbalancingv2.ApplicationLoadBalancer(this, '${toPascalCase(name)}', {
      vpc: vpc, // Reference your VPC
      internetFacing: true,
    });`,
    'aws-alb': `const ${name} = new elasticloadbalancingv2.ApplicationLoadBalancer(this, '${toPascalCase(name)}', {
      vpc: vpc, // Reference your VPC
      internetFacing: true,
    });`,
    'aws-sqs': `const ${name} = new cdk.aws_sqs.Queue(this, '${toPascalCase(name)}', {});`,
    'aws-sns': `const ${name} = new cdk.aws_sns.Topic(this, '${toPascalCase(name)}', {});`,
  }

  return cdkMap[type] || null
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

function generateYaml(obj: Record<string, unknown>, indent = 0): string {
  const spaces = '  '.repeat(indent)
  let result = ''

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue

    if (typeof value === 'object' && !Array.isArray(value)) {
      result += `${spaces}${key}:\n`
      result += generateYaml(value as Record<string, unknown>, indent + 1)
    } else if (Array.isArray(value)) {
      result += `${spaces}${key}:\n`
      for (const item of value) {
        if (typeof item === 'object') {
          result += `${spaces}  -\n`
          result += generateYaml(item as Record<string, unknown>, indent + 2)
        } else {
          result += `${spaces}  - ${item}\n`
        }
      }
    } else {
      result += `${spaces}${key}: ${value}\n`
    }
  }

  return result
}

/**
 * Main export function
 */
export async function generateInfrastructureCode(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  options: {
    provider: CodeProvider
    language?: CodeLanguage
  }
): Promise<CodeGenerationResult> {
  const architecture = parseArchitecture(nodes, edges)

  switch (options.provider) {
    case 'terraform':
      return generateTerraform(architecture)
    case 'pulumi':
      return generatePulumi(architecture, options.language || 'typescript')
    case 'cloudformation':
      return generateCloudFormation(architecture)
    case 'cdk':
      return generateCDK(architecture, options.language || 'typescript')
    default:
      throw new Error(`Unsupported provider: ${options.provider}`)
  }
}

export const codeGenerationService = {
  parseArchitecture,
  generateInfrastructureCode,
  generateTerraform,
  generatePulumi,
  generateCloudFormation,
  generateCDK,
}
