/**
 * Cloud Architecture Templates
 *
 * Pre-built architecture diagram templates for AWS, Azure, GCP, and multi-cloud scenarios.
 * Based on official architecture patterns from cloud providers.
 */

import type { ArchitectureTemplate, TemplateCategory } from '@/types'

// ============================================================================
// Template Categories
// ============================================================================

export interface TemplateCategoryConfig {
  id: TemplateCategory
  label: string
  icon: string
  description?: string
}

export const ARCHITECTURE_TEMPLATE_CATEGORIES: TemplateCategoryConfig[] = [
  // Cloud Providers
  { id: 'aws', label: 'AWS Architecture', icon: 'aws-ec2', description: 'Amazon Web Services patterns' },
  { id: 'azure', label: 'Azure Architecture', icon: 'azure-vm', description: 'Microsoft Azure patterns' },
  { id: 'gcp', label: 'Google Cloud', icon: 'gcp-compute', description: 'Google Cloud Platform patterns' },
  { id: 'multi-cloud', label: 'Multi-Cloud', icon: 'cloud', description: 'Cross-cloud architectures' },

  // Use Cases
  { id: 'web-app', label: 'Web Applications', icon: 'globe', description: 'Web app architectures' },
  { id: 'data-analytics', label: 'Data & Analytics', icon: 'database', description: 'Data pipelines and analytics' },
  { id: 'iot', label: 'IoT Solutions', icon: 'cpu', description: 'Internet of Things patterns' },
  { id: 'ai-ml', label: 'AI & Machine Learning', icon: 'brain', description: 'ML/AI architectures' },
  { id: 'devops', label: 'DevOps & CI/CD', icon: 'git-branch', description: 'DevOps pipelines' },
  { id: 'security', label: 'Security & Identity', icon: 'shield', description: 'Security patterns' },
  { id: 'networking', label: 'Networking', icon: 'network', description: 'Network topologies' },
  { id: 'containers', label: 'Containers & K8s', icon: 'container', description: 'Container orchestration' },
  { id: 'serverless', label: 'Serverless', icon: 'zap', description: 'Serverless architectures' },
]

// ============================================================================
// Azure Architecture Templates
// ============================================================================

const azureEnterpriseBIFabric: ArchitectureTemplate = {
  id: 'azure-enterprise-bi-fabric',
  name: 'Enterprise BI with Microsoft Fabric',
  description: 'Transfer data from on-premises to cloud using Microsoft Fabric for business intelligence analytics',
  categories: ['azure', 'data-analytics'],
  complexity: 'advanced',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/example-scenario/analytics/enterprise-bi-microsoft-fabric',
  tags: ['fabric', 'power-bi', 'onelake', 'analytics', 'enterprise'],
  useCases: ['business-intelligence', 'data-warehouse', 'analytics'],
  isBuiltIn: true,
  nodes: [
    // Data Sources Section
    { id: 'sql-server', type: 'azure-sql', position: { x: 50, y: 150 },
      data: { label: 'SQL Server\n(On-Premises)', type: 'azure-sql' } },
    { id: 'data-streams', type: 'rectangle', position: { x: 50, y: 50 },
      data: { label: 'Data Streams', type: 'rectangle' } },
    { id: 'unstructured-data', type: 'azure-storage', position: { x: 50, y: 250 },
      data: { label: 'Unstructured Data', type: 'azure-storage' } },

    // Ingest Layer
    { id: 'event-hubs', type: 'azure-event-hub', position: { x: 250, y: 50 },
      data: { label: 'Event Hubs', type: 'azure-event-hub' } },
    { id: 'fabric-pipelines', type: 'azure-fabric-pipeline', position: { x: 250, y: 150 },
      data: { label: 'Fabric Pipelines', type: 'azure-fabric-pipeline' } },
    { id: 'mirroring', type: 'azure-synapse', position: { x: 250, y: 250 },
      data: { label: 'Mirroring / Copy Job', type: 'azure-synapse' } },

    // Store Layer (OneLake)
    { id: 'onelake', type: 'azure-onelake', position: { x: 450, y: 120 },
      data: { label: 'Fabric OneLake', type: 'azure-onelake' } },
    { id: 'lakehouse', type: 'azure-fabric-lakehouse', position: { x: 450, y: 220 },
      data: { label: 'Lakehouse', type: 'azure-fabric-lakehouse' } },
    { id: 'warehouse', type: 'azure-fabric-warehouse', position: { x: 550, y: 170 },
      data: { label: 'Warehouse', type: 'azure-fabric-warehouse' } },

    // Process Layer
    { id: 'spark-notebooks', type: 'azure-fabric-spark', position: { x: 700, y: 100 },
      data: { label: 'Spark Notebooks', type: 'azure-fabric-spark' } },
    { id: 'dataflow-gen2', type: 'azure-fabric-dataflow', position: { x: 700, y: 200 },
      data: { label: 'Dataflow Gen2', type: 'azure-fabric-dataflow' } },

    // Enrich Layer
    { id: 'azure-ml', type: 'azure-machine-learning', position: { x: 900, y: 150 },
      data: { label: 'Azure Machine Learning', type: 'azure-machine-learning' } },

    // Serve Layer
    { id: 'power-bi', type: 'azure-power-bi', position: { x: 1100, y: 100 },
      data: { label: 'Power BI', type: 'azure-power-bi' } },

    // Outputs
    { id: 'business-users', type: 'users', position: { x: 1300, y: 100 },
      data: { label: 'Business Users', type: 'users' } },

    // Security
    { id: 'entra-id', type: 'azure-entra-id', position: { x: 600, y: 350 },
      data: { label: 'Microsoft Entra ID', type: 'azure-entra-id' } },
  ],
  edges: [
    // Data sources to ingest (horizontal flow: right -> left)
    { id: 'e1', source: 'data-streams', target: 'event-hubs', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'sql-server', target: 'fabric-pipelines', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'unstructured-data', target: 'mirroring', sourceHandle: 'right', targetHandle: 'left' },

    // Ingest to OneLake
    { id: 'e4', source: 'event-hubs', target: 'onelake', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'fabric-pipelines', target: 'onelake', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'mirroring', target: 'lakehouse', sourceHandle: 'right', targetHandle: 'left' },

    // OneLake to Process
    { id: 'e7', source: 'onelake', target: 'spark-notebooks', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e8', source: 'lakehouse', target: 'dataflow-gen2', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e9', source: 'warehouse', target: 'dataflow-gen2', sourceHandle: 'right', targetHandle: 'left' },

    // Process to Enrich
    { id: 'e10', source: 'spark-notebooks', target: 'azure-ml', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e11', source: 'dataflow-gen2', target: 'azure-ml', sourceHandle: 'right', targetHandle: 'left' },

    // Enrich to Serve
    { id: 'e12', source: 'azure-ml', target: 'power-bi', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e13', source: 'spark-notebooks', target: 'power-bi', sourceHandle: 'right', targetHandle: 'left' },

    // Serve to Outputs
    { id: 'e14', source: 'power-bi', target: 'business-users', sourceHandle: 'right', targetHandle: 'left' },
  ],
  annotations: [
    { id: 'a1', text: 'INGEST', position: { x: 250, y: 20 }, style: { fontWeight: 'bold' } },
    { id: 'a2', text: 'STORE', position: { x: 500, y: 20 }, style: { fontWeight: 'bold' } },
    { id: 'a3', text: 'PROCESS', position: { x: 700, y: 20 }, style: { fontWeight: 'bold' } },
    { id: 'a4', text: 'ENRICH', position: { x: 900, y: 20 }, style: { fontWeight: 'bold' } },
    { id: 'a5', text: 'SERVE', position: { x: 1100, y: 20 }, style: { fontWeight: 'bold' } },
  ],
}

const azure3TierWebApp: ArchitectureTemplate = {
  id: 'azure-3-tier-web-app',
  name: '3-Tier Web App with App Service',
  description: 'Production-ready Azure web application with App Service, Azure SQL, and Redis Cache',
  categories: ['azure', 'web-app'],
  complexity: 'beginner',
  tags: ['app-service', 'sql', 'redis', 'web-app'],
  isBuiltIn: true,
  nodes: [
    { id: 'users', type: 'users', position: { x: 50, y: 150 },
      data: { label: 'Users', type: 'users' } },
    { id: 'front-door', type: 'azure-front-door', position: { x: 200, y: 150 },
      data: { label: 'Azure Front Door', type: 'azure-front-door' } },
    { id: 'app-service', type: 'azure-app-service', position: { x: 400, y: 150 },
      data: { label: 'App Service', type: 'azure-app-service' } },
    { id: 'redis', type: 'azure-redis-cache', position: { x: 600, y: 80 },
      data: { label: 'Redis Cache', type: 'azure-redis-cache' } },
    { id: 'sql', type: 'azure-sql', position: { x: 600, y: 220 },
      data: { label: 'Azure SQL', type: 'azure-sql' } },
    { id: 'storage', type: 'azure-storage', position: { x: 400, y: 300 },
      data: { label: 'Blob Storage', type: 'azure-storage' } },
    { id: 'keyvault', type: 'azure-keyvault', position: { x: 200, y: 300 },
      data: { label: 'Key Vault', type: 'azure-keyvault' } },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'front-door' },
    { id: 'e2', source: 'front-door', target: 'app-service' },
    { id: 'e3', source: 'app-service', target: 'redis' },
    { id: 'e4', source: 'app-service', target: 'sql' },
    { id: 'e5', source: 'app-service', target: 'storage' },
    { id: 'e6', source: 'app-service', target: 'keyvault' },
  ],
}

const azureServerlessWeb: ArchitectureTemplate = {
  id: 'azure-serverless-web',
  name: 'Serverless Web Application',
  description: 'Event-driven serverless architecture with Azure Functions and Cosmos DB',
  categories: ['azure', 'serverless'],
  complexity: 'intermediate',
  tags: ['functions', 'cosmos', 'serverless', 'event-driven'],
  isBuiltIn: true,
  nodes: [
    { id: 'users', type: 'users', position: { x: 50, y: 150 },
      data: { label: 'Users', type: 'users' } },
    { id: 'api-mgmt', type: 'azure-api-management', position: { x: 200, y: 150 },
      data: { label: 'API Management', type: 'azure-api-management' } },
    { id: 'functions', type: 'azure-functions', position: { x: 400, y: 150 },
      data: { label: 'Azure Functions', type: 'azure-functions' } },
    { id: 'cosmos', type: 'azure-cosmos', position: { x: 600, y: 150 },
      data: { label: 'Cosmos DB', type: 'azure-cosmos' } },
    { id: 'event-grid', type: 'azure-event-grid', position: { x: 400, y: 280 },
      data: { label: 'Event Grid', type: 'azure-event-grid' } },
    { id: 'service-bus', type: 'azure-service-bus', position: { x: 250, y: 280 },
      data: { label: 'Service Bus', type: 'azure-service-bus' } },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'api-mgmt' },
    { id: 'e2', source: 'api-mgmt', target: 'functions' },
    { id: 'e3', source: 'functions', target: 'cosmos' },
    { id: 'e4', source: 'cosmos', target: 'event-grid' },
    { id: 'e5', source: 'event-grid', target: 'service-bus' },
    { id: 'e6', source: 'service-bus', target: 'functions' },
  ],
}

const azureAKSMicroservices: ArchitectureTemplate = {
  id: 'azure-aks-microservices',
  name: 'Microservices with AKS',
  description: 'Kubernetes-based microservices architecture on Azure Kubernetes Service',
  categories: ['azure', 'containers'],
  complexity: 'advanced',
  tags: ['aks', 'kubernetes', 'microservices', 'containers'],
  isBuiltIn: true,
  nodes: [
    { id: 'users', type: 'users', position: { x: 50, y: 200 },
      data: { label: 'Users', type: 'users' } },
    { id: 'front-door', type: 'azure-front-door', position: { x: 200, y: 200 },
      data: { label: 'Front Door', type: 'azure-front-door' } },
    { id: 'aks', type: 'azure-aks', position: { x: 400, y: 200 },
      data: { label: 'AKS Cluster', type: 'azure-aks' } },
    { id: 'acr', type: 'azure-container-registry', position: { x: 400, y: 50 },
      data: { label: 'Container Registry', type: 'azure-container-registry' } },
    { id: 'cosmos', type: 'azure-cosmos', position: { x: 600, y: 120 },
      data: { label: 'Cosmos DB', type: 'azure-cosmos' } },
    { id: 'redis', type: 'azure-redis-cache', position: { x: 600, y: 200 },
      data: { label: 'Redis Cache', type: 'azure-redis-cache' } },
    { id: 'service-bus', type: 'azure-service-bus', position: { x: 600, y: 280 },
      data: { label: 'Service Bus', type: 'azure-service-bus' } },
    { id: 'keyvault', type: 'azure-keyvault', position: { x: 250, y: 350 },
      data: { label: 'Key Vault', type: 'azure-keyvault' } },
    { id: 'monitor', type: 'azure-monitor', position: { x: 400, y: 350 },
      data: { label: 'Azure Monitor', type: 'azure-monitor' } },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'front-door' },
    { id: 'e2', source: 'front-door', target: 'aks' },
    { id: 'e3', source: 'acr', target: 'aks' },
    { id: 'e4', source: 'aks', target: 'cosmos' },
    { id: 'e5', source: 'aks', target: 'redis' },
    { id: 'e6', source: 'aks', target: 'service-bus' },
    { id: 'e7', source: 'aks', target: 'keyvault' },
    { id: 'e8', source: 'aks', target: 'monitor' },
  ],
}

const azureOpenAIIntegration: ArchitectureTemplate = {
  id: 'azure-openai-integration',
  name: 'Azure OpenAI Integration',
  description: 'Enterprise AI application using Azure OpenAI Service with RAG pattern',
  categories: ['azure', 'ai-ml'],
  complexity: 'intermediate',
  tags: ['openai', 'ai', 'rag', 'cognitive-services'],
  isBuiltIn: true,
  nodes: [
    { id: 'users', type: 'users', position: { x: 50, y: 150 },
      data: { label: 'Users', type: 'users' } },
    { id: 'app-service', type: 'azure-app-service', position: { x: 200, y: 150 },
      data: { label: 'Web App', type: 'azure-app-service' } },
    { id: 'openai', type: 'azure-openai', position: { x: 400, y: 150 },
      data: { label: 'Azure OpenAI', type: 'azure-openai' } },
    { id: 'ai-search', type: 'azure-cognitive-services', position: { x: 400, y: 280 },
      data: { label: 'AI Search', type: 'azure-cognitive-services' } },
    { id: 'cosmos', type: 'azure-cosmos', position: { x: 600, y: 150 },
      data: { label: 'Cosmos DB', type: 'azure-cosmos' } },
    { id: 'storage', type: 'azure-storage', position: { x: 600, y: 280 },
      data: { label: 'Blob Storage', type: 'azure-storage' } },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'app-service' },
    { id: 'e2', source: 'app-service', target: 'openai' },
    { id: 'e3', source: 'openai', target: 'ai-search' },
    { id: 'e4', source: 'openai', target: 'cosmos' },
    { id: 'e5', source: 'ai-search', target: 'storage' },
  ],
}

// ============================================================================
// AWS Architecture Templates
// ============================================================================

const aws3TierVPC: ArchitectureTemplate = {
  id: 'aws-3-tier-vpc',
  name: 'AWS 3-Tier VPC Architecture',
  description: 'Production-ready 3-tier architecture with public/private subnets across availability zones',
  categories: ['aws', 'web-app', 'networking'],
  complexity: 'intermediate',
  tags: ['vpc', '3-tier', 'ha', 'multi-az'],
  isBuiltIn: true,
  nodes: [
    // External
    { id: 'internet', type: 'internet', position: { x: 400, y: 20 },
      data: { label: 'Internet', type: 'internet' } },
    { id: 'route53', type: 'aws-route53', position: { x: 250, y: 20 },
      data: { label: 'Route 53', type: 'aws-route53' } },
    { id: 'cloudfront', type: 'aws-cloudfront', position: { x: 550, y: 20 },
      data: { label: 'CloudFront', type: 'aws-cloudfront' } },
    { id: 'igw', type: 'aws-internet-gateway', position: { x: 400, y: 100 },
      data: { label: 'Internet Gateway', type: 'aws-internet-gateway' } },

    // AZ-A Public
    { id: 'nat-a', type: 'aws-nat-gateway', position: { x: 200, y: 180 },
      data: { label: 'NAT Gateway A', type: 'aws-nat-gateway' } },
    { id: 'alb', type: 'aws-elb', position: { x: 400, y: 180 },
      data: { label: 'Application LB', type: 'aws-elb' } },

    // AZ-A Private
    { id: 'ec2-a', type: 'aws-ec2', position: { x: 250, y: 280 },
      data: { label: 'EC2 (AZ-A)', type: 'aws-ec2' } },
    { id: 'rds-primary', type: 'aws-rds', position: { x: 250, y: 400 },
      data: { label: 'RDS Primary', type: 'aws-rds' } },

    // AZ-B
    { id: 'nat-b', type: 'aws-nat-gateway', position: { x: 600, y: 180 },
      data: { label: 'NAT Gateway B', type: 'aws-nat-gateway' } },
    { id: 'ec2-b', type: 'aws-ec2', position: { x: 550, y: 280 },
      data: { label: 'EC2 (AZ-B)', type: 'aws-ec2' } },
    { id: 'rds-standby', type: 'aws-rds', position: { x: 550, y: 400 },
      data: { label: 'RDS Standby', type: 'aws-rds' } },
  ],
  edges: [
    { id: 'e1', source: 'route53', target: 'cloudfront' },
    { id: 'e2', source: 'internet', target: 'igw' },
    { id: 'e3', source: 'cloudfront', target: 'alb' },
    { id: 'e4', source: 'igw', target: 'alb' },
    { id: 'e5', source: 'alb', target: 'ec2-a' },
    { id: 'e6', source: 'alb', target: 'ec2-b' },
    { id: 'e7', source: 'ec2-a', target: 'rds-primary' },
    { id: 'e8', source: 'ec2-b', target: 'rds-standby' },
    { id: 'e9', source: 'rds-primary', target: 'rds-standby', data: { label: 'Sync', style: { strokeDasharray: '5,5' } } },
    { id: 'e10', source: 'ec2-a', target: 'nat-a' },
    { id: 'e11', source: 'ec2-b', target: 'nat-b' },
  ],
  groups: [
    { id: 'vpc', name: 'VPC (10.0.0.0/16)', type: 'vpc', nodeIds: ['nat-a', 'alb', 'ec2-a', 'rds-primary', 'nat-b', 'ec2-b', 'rds-standby'] },
  ],
}

const awsServerlessAPI: ArchitectureTemplate = {
  id: 'aws-serverless-api',
  name: 'Serverless API with Lambda',
  description: 'Fully serverless REST API using API Gateway, Lambda, and DynamoDB',
  categories: ['aws', 'serverless'],
  complexity: 'beginner',
  tags: ['lambda', 'api-gateway', 'dynamodb', 'serverless'],
  isBuiltIn: true,
  nodes: [
    { id: 'users', type: 'users', position: { x: 50, y: 150 },
      data: { label: 'Users', type: 'users' } },
    { id: 'api-gw', type: 'aws-api-gateway', position: { x: 200, y: 150 },
      data: { label: 'API Gateway', type: 'aws-api-gateway' } },
    { id: 'lambda', type: 'aws-lambda', position: { x: 400, y: 150 },
      data: { label: 'Lambda', type: 'aws-lambda' } },
    { id: 'dynamodb', type: 'aws-dynamodb', position: { x: 600, y: 150 },
      data: { label: 'DynamoDB', type: 'aws-dynamodb' } },
    { id: 'cognito', type: 'aws-cognito', position: { x: 200, y: 280 },
      data: { label: 'Cognito', type: 'aws-cognito' } },
    { id: 's3', type: 'aws-s3', position: { x: 400, y: 280 },
      data: { label: 'S3 Bucket', type: 'aws-s3' } },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'api-gw' },
    { id: 'e2', source: 'api-gw', target: 'lambda' },
    { id: 'e3', source: 'lambda', target: 'dynamodb' },
    { id: 'e4', source: 'cognito', target: 'api-gw' },
    { id: 'e5', source: 'lambda', target: 's3' },
  ],
}

const awsEKSCluster: ArchitectureTemplate = {
  id: 'aws-eks-cluster',
  name: 'EKS Kubernetes Cluster',
  description: 'Production Kubernetes cluster on Amazon EKS with managed node groups',
  categories: ['aws', 'containers'],
  complexity: 'advanced',
  tags: ['eks', 'kubernetes', 'containers', 'microservices'],
  isBuiltIn: true,
  nodes: [
    { id: 'users', type: 'users', position: { x: 50, y: 200 },
      data: { label: 'Users', type: 'users' } },
    { id: 'alb', type: 'aws-elb', position: { x: 200, y: 200 },
      data: { label: 'ALB Ingress', type: 'aws-elb' } },
    { id: 'eks', type: 'aws-eks', position: { x: 400, y: 200 },
      data: { label: 'EKS Cluster', type: 'aws-eks' } },
    { id: 'ecr', type: 'aws-ecr', position: { x: 400, y: 50 },
      data: { label: 'ECR', type: 'aws-ecr' } },
    { id: 'rds', type: 'aws-rds', position: { x: 600, y: 150 },
      data: { label: 'RDS', type: 'aws-rds' } },
    { id: 'elasticache', type: 'aws-elasticache', position: { x: 600, y: 250 },
      data: { label: 'ElastiCache', type: 'aws-elasticache' } },
    { id: 'secrets', type: 'aws-secrets-manager', position: { x: 250, y: 350 },
      data: { label: 'Secrets Manager', type: 'aws-secrets-manager' } },
    { id: 'cloudwatch', type: 'aws-cloudwatch', position: { x: 400, y: 350 },
      data: { label: 'CloudWatch', type: 'aws-cloudwatch' } },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'alb' },
    { id: 'e2', source: 'alb', target: 'eks' },
    { id: 'e3', source: 'ecr', target: 'eks' },
    { id: 'e4', source: 'eks', target: 'rds' },
    { id: 'e5', source: 'eks', target: 'elasticache' },
    { id: 'e6', source: 'eks', target: 'secrets' },
    { id: 'e7', source: 'eks', target: 'cloudwatch' },
  ],
}

const awsDataLake: ArchitectureTemplate = {
  id: 'aws-data-lake',
  name: 'Data Lake with S3 & Glue',
  description: 'Modern data lake architecture with S3, Glue, and Athena for analytics',
  categories: ['aws', 'data-analytics'],
  complexity: 'advanced',
  tags: ['data-lake', 's3', 'glue', 'athena', 'analytics'],
  isBuiltIn: true,
  nodes: [
    { id: 'sources', type: 'database', position: { x: 50, y: 150 },
      data: { label: 'Data Sources', type: 'database' } },
    { id: 'kinesis', type: 'aws-kinesis', position: { x: 200, y: 100 },
      data: { label: 'Kinesis', type: 'aws-kinesis' } },
    { id: 'glue', type: 'aws-glue', position: { x: 200, y: 200 },
      data: { label: 'Glue ETL', type: 'aws-glue' } },
    { id: 's3-raw', type: 'aws-s3', position: { x: 400, y: 100 },
      data: { label: 'S3 Raw Zone', type: 'aws-s3' } },
    { id: 's3-curated', type: 'aws-s3', position: { x: 400, y: 200 },
      data: { label: 'S3 Curated Zone', type: 'aws-s3' } },
    { id: 'glue-catalog', type: 'aws-glue', position: { x: 400, y: 300 },
      data: { label: 'Glue Catalog', type: 'aws-glue' } },
    { id: 'athena', type: 'aws-athena', position: { x: 600, y: 150 },
      data: { label: 'Athena', type: 'aws-athena' } },
    { id: 'quicksight', type: 'aws-quicksight', position: { x: 600, y: 250 },
      data: { label: 'QuickSight', type: 'aws-quicksight' } },
  ],
  edges: [
    { id: 'e1', source: 'sources', target: 'kinesis' },
    { id: 'e2', source: 'sources', target: 'glue' },
    { id: 'e3', source: 'kinesis', target: 's3-raw' },
    { id: 'e4', source: 'glue', target: 's3-curated' },
    { id: 'e5', source: 's3-raw', target: 'glue' },
    { id: 'e6', source: 's3-curated', target: 'glue-catalog' },
    { id: 'e7', source: 'glue-catalog', target: 'athena' },
    { id: 'e8', source: 'athena', target: 'quicksight' },
  ],
}

const awsBedrockAI: ArchitectureTemplate = {
  id: 'aws-bedrock-ai',
  name: 'AI Application with Bedrock',
  description: 'Generative AI application using Amazon Bedrock with RAG pattern',
  categories: ['aws', 'ai-ml'],
  complexity: 'intermediate',
  tags: ['bedrock', 'ai', 'generative-ai', 'rag'],
  isBuiltIn: true,
  nodes: [
    { id: 'users', type: 'users', position: { x: 50, y: 150 },
      data: { label: 'Users', type: 'users' } },
    { id: 'api-gw', type: 'aws-api-gateway', position: { x: 200, y: 150 },
      data: { label: 'API Gateway', type: 'aws-api-gateway' } },
    { id: 'lambda', type: 'aws-lambda', position: { x: 350, y: 150 },
      data: { label: 'Lambda', type: 'aws-lambda' } },
    { id: 'bedrock', type: 'aws-bedrock', position: { x: 500, y: 150 },
      data: { label: 'Bedrock', type: 'aws-bedrock' } },
    { id: 'opensearch', type: 'aws-opensearch', position: { x: 500, y: 280 },
      data: { label: 'OpenSearch', type: 'aws-opensearch' } },
    { id: 's3', type: 'aws-s3', position: { x: 350, y: 280 },
      data: { label: 'S3 Documents', type: 'aws-s3' } },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'api-gw' },
    { id: 'e2', source: 'api-gw', target: 'lambda' },
    { id: 'e3', source: 'lambda', target: 'bedrock' },
    { id: 'e4', source: 'lambda', target: 'opensearch' },
    { id: 'e5', source: 's3', target: 'opensearch' },
  ],
}

// ============================================================================
// GCP Architecture Templates
// ============================================================================

const gcp3TierWebApp: ArchitectureTemplate = {
  id: 'gcp-3-tier-web-app',
  name: '3-Tier Web App with GCE',
  description: 'Production web application on Google Compute Engine with Cloud SQL',
  categories: ['gcp', 'web-app'],
  complexity: 'intermediate',
  tags: ['gce', 'cloud-sql', 'load-balancer', 'web-app'],
  isBuiltIn: true,
  nodes: [
    { id: 'users', type: 'users', position: { x: 50, y: 150 },
      data: { label: 'Users', type: 'users' } },
    { id: 'lb', type: 'gcp-load-balancing', position: { x: 200, y: 150 },
      data: { label: 'Cloud Load Balancing', type: 'gcp-load-balancing' } },
    { id: 'gce-1', type: 'gcp-compute', position: { x: 400, y: 80 },
      data: { label: 'GCE Instance 1', type: 'gcp-compute' } },
    { id: 'gce-2', type: 'gcp-compute', position: { x: 400, y: 220 },
      data: { label: 'GCE Instance 2', type: 'gcp-compute' } },
    { id: 'cloud-sql', type: 'gcp-cloud-sql', position: { x: 600, y: 150 },
      data: { label: 'Cloud SQL', type: 'gcp-cloud-sql' } },
    { id: 'storage', type: 'gcp-storage', position: { x: 600, y: 280 },
      data: { label: 'Cloud Storage', type: 'gcp-storage' } },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'lb' },
    { id: 'e2', source: 'lb', target: 'gce-1' },
    { id: 'e3', source: 'lb', target: 'gce-2' },
    { id: 'e4', source: 'gce-1', target: 'cloud-sql' },
    { id: 'e5', source: 'gce-2', target: 'cloud-sql' },
    { id: 'e6', source: 'gce-1', target: 'storage' },
    { id: 'e7', source: 'gce-2', target: 'storage' },
  ],
}

const gcpGKECluster: ArchitectureTemplate = {
  id: 'gcp-gke-cluster',
  name: 'GKE Kubernetes Cluster',
  description: 'Production Kubernetes on Google Kubernetes Engine',
  categories: ['gcp', 'containers'],
  complexity: 'advanced',
  tags: ['gke', 'kubernetes', 'containers', 'microservices'],
  isBuiltIn: true,
  nodes: [
    { id: 'users', type: 'users', position: { x: 50, y: 200 },
      data: { label: 'Users', type: 'users' } },
    { id: 'lb', type: 'gcp-load-balancing', position: { x: 200, y: 200 },
      data: { label: 'Cloud Load Balancing', type: 'gcp-load-balancing' } },
    { id: 'gke', type: 'gcp-gke', position: { x: 400, y: 200 },
      data: { label: 'GKE Cluster', type: 'gcp-gke' } },
    { id: 'artifact', type: 'gcp-artifact-registry', position: { x: 400, y: 50 },
      data: { label: 'Artifact Registry', type: 'gcp-artifact-registry' } },
    { id: 'cloud-sql', type: 'gcp-cloud-sql', position: { x: 600, y: 150 },
      data: { label: 'Cloud SQL', type: 'gcp-cloud-sql' } },
    { id: 'memorystore', type: 'gcp-memorystore', position: { x: 600, y: 250 },
      data: { label: 'Memorystore', type: 'gcp-memorystore' } },
    { id: 'secret-manager', type: 'gcp-secret-manager', position: { x: 250, y: 350 },
      data: { label: 'Secret Manager', type: 'gcp-secret-manager' } },
    { id: 'monitoring', type: 'gcp-cloud-monitoring', position: { x: 400, y: 350 },
      data: { label: 'Cloud Monitoring', type: 'gcp-cloud-monitoring' } },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'lb' },
    { id: 'e2', source: 'lb', target: 'gke' },
    { id: 'e3', source: 'artifact', target: 'gke' },
    { id: 'e4', source: 'gke', target: 'cloud-sql' },
    { id: 'e5', source: 'gke', target: 'memorystore' },
    { id: 'e6', source: 'gke', target: 'secret-manager' },
    { id: 'e7', source: 'gke', target: 'monitoring' },
  ],
}

const gcpBigQueryDataWarehouse: ArchitectureTemplate = {
  id: 'gcp-bigquery-warehouse',
  name: 'BigQuery Data Warehouse',
  description: 'Modern data warehouse with BigQuery and Dataflow for analytics',
  categories: ['gcp', 'data-analytics'],
  complexity: 'intermediate',
  tags: ['bigquery', 'dataflow', 'analytics', 'data-warehouse'],
  isBuiltIn: true,
  nodes: [
    { id: 'sources', type: 'database', position: { x: 50, y: 150 },
      data: { label: 'Data Sources', type: 'database' } },
    { id: 'pubsub', type: 'gcp-pubsub', position: { x: 200, y: 100 },
      data: { label: 'Pub/Sub', type: 'gcp-pubsub' } },
    { id: 'dataflow', type: 'gcp-dataflow', position: { x: 200, y: 200 },
      data: { label: 'Dataflow', type: 'gcp-dataflow' } },
    { id: 'storage', type: 'gcp-storage', position: { x: 400, y: 100 },
      data: { label: 'Cloud Storage', type: 'gcp-storage' } },
    { id: 'bigquery', type: 'gcp-bigquery', position: { x: 400, y: 200 },
      data: { label: 'BigQuery', type: 'gcp-bigquery' } },
    { id: 'looker', type: 'gcp-looker', position: { x: 600, y: 150 },
      data: { label: 'Looker', type: 'gcp-looker' } },
  ],
  edges: [
    { id: 'e1', source: 'sources', target: 'pubsub' },
    { id: 'e2', source: 'sources', target: 'dataflow' },
    { id: 'e3', source: 'pubsub', target: 'dataflow' },
    { id: 'e4', source: 'dataflow', target: 'storage' },
    { id: 'e5', source: 'dataflow', target: 'bigquery' },
    { id: 'e6', source: 'bigquery', target: 'looker' },
  ],
}

const gcpCloudRunServerless: ArchitectureTemplate = {
  id: 'gcp-cloud-run-serverless',
  name: 'Cloud Run Serverless',
  description: 'Serverless containerized application using Cloud Run',
  categories: ['gcp', 'serverless', 'containers'],
  complexity: 'beginner',
  tags: ['cloud-run', 'serverless', 'containers'],
  isBuiltIn: true,
  nodes: [
    { id: 'users', type: 'users', position: { x: 50, y: 150 },
      data: { label: 'Users', type: 'users' } },
    { id: 'lb', type: 'gcp-load-balancing', position: { x: 200, y: 150 },
      data: { label: 'Cloud Load Balancing', type: 'gcp-load-balancing' } },
    { id: 'cloud-run', type: 'gcp-cloud-run', position: { x: 400, y: 150 },
      data: { label: 'Cloud Run', type: 'gcp-cloud-run' } },
    { id: 'firestore', type: 'gcp-firestore', position: { x: 600, y: 100 },
      data: { label: 'Firestore', type: 'gcp-firestore' } },
    { id: 'storage', type: 'gcp-storage', position: { x: 600, y: 200 },
      data: { label: 'Cloud Storage', type: 'gcp-storage' } },
    { id: 'secret-manager', type: 'gcp-secret-manager', position: { x: 400, y: 280 },
      data: { label: 'Secret Manager', type: 'gcp-secret-manager' } },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'lb' },
    { id: 'e2', source: 'lb', target: 'cloud-run' },
    { id: 'e3', source: 'cloud-run', target: 'firestore' },
    { id: 'e4', source: 'cloud-run', target: 'storage' },
    { id: 'e5', source: 'cloud-run', target: 'secret-manager' },
  ],
}

const gcpVertexAIPlatform: ArchitectureTemplate = {
  id: 'gcp-vertex-ai-platform',
  name: 'Vertex AI ML Platform',
  description: 'End-to-end machine learning platform using Vertex AI',
  categories: ['gcp', 'ai-ml'],
  complexity: 'advanced',
  tags: ['vertex-ai', 'ml', 'ai', 'machine-learning'],
  isBuiltIn: true,
  nodes: [
    { id: 'data-sources', type: 'database', position: { x: 50, y: 150 },
      data: { label: 'Data Sources', type: 'database' } },
    { id: 'storage', type: 'gcp-storage', position: { x: 200, y: 150 },
      data: { label: 'Cloud Storage', type: 'gcp-storage' } },
    { id: 'bigquery', type: 'gcp-bigquery', position: { x: 200, y: 280 },
      data: { label: 'BigQuery', type: 'gcp-bigquery' } },
    { id: 'vertex-ai', type: 'gcp-vertex-ai', position: { x: 400, y: 200 },
      data: { label: 'Vertex AI', type: 'gcp-vertex-ai' } },
    { id: 'cloud-run', type: 'gcp-cloud-run', position: { x: 600, y: 150 },
      data: { label: 'Model Serving', type: 'gcp-cloud-run' } },
    { id: 'monitoring', type: 'gcp-cloud-monitoring', position: { x: 600, y: 280 },
      data: { label: 'ML Monitoring', type: 'gcp-cloud-monitoring' } },
  ],
  edges: [
    { id: 'e1', source: 'data-sources', target: 'storage' },
    { id: 'e2', source: 'data-sources', target: 'bigquery' },
    { id: 'e3', source: 'storage', target: 'vertex-ai' },
    { id: 'e4', source: 'bigquery', target: 'vertex-ai' },
    { id: 'e5', source: 'vertex-ai', target: 'cloud-run' },
    { id: 'e6', source: 'cloud-run', target: 'monitoring' },
  ],
}

// ============================================================================
// Multi-Cloud Templates
// ============================================================================

const multiCloudKubernetes: ArchitectureTemplate = {
  id: 'multi-cloud-kubernetes',
  name: 'Multi-Cloud Kubernetes',
  description: 'Kubernetes clusters across AWS, Azure, and GCP with unified management',
  categories: ['multi-cloud', 'containers'],
  complexity: 'advanced',
  tags: ['kubernetes', 'multi-cloud', 'hybrid'],
  isBuiltIn: true,
  nodes: [
    { id: 'users', type: 'users', position: { x: 350, y: 20 },
      data: { label: 'Users', type: 'users' } },
    { id: 'dns', type: 'internet', position: { x: 350, y: 100 },
      data: { label: 'Global DNS', type: 'internet' } },
    // AWS
    { id: 'eks', type: 'aws-eks', position: { x: 100, y: 200 },
      data: { label: 'EKS (AWS)', type: 'aws-eks' } },
    { id: 'aws-rds', type: 'aws-rds', position: { x: 100, y: 320 },
      data: { label: 'RDS', type: 'aws-rds' } },
    // Azure
    { id: 'aks', type: 'azure-aks', position: { x: 350, y: 200 },
      data: { label: 'AKS (Azure)', type: 'azure-aks' } },
    { id: 'azure-sql', type: 'azure-sql', position: { x: 350, y: 320 },
      data: { label: 'Azure SQL', type: 'azure-sql' } },
    // GCP
    { id: 'gke', type: 'gcp-gke', position: { x: 600, y: 200 },
      data: { label: 'GKE (GCP)', type: 'gcp-gke' } },
    { id: 'cloud-sql', type: 'gcp-cloud-sql', position: { x: 600, y: 320 },
      data: { label: 'Cloud SQL', type: 'gcp-cloud-sql' } },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'dns' },
    { id: 'e2', source: 'dns', target: 'eks' },
    { id: 'e3', source: 'dns', target: 'aks' },
    { id: 'e4', source: 'dns', target: 'gke' },
    { id: 'e5', source: 'eks', target: 'aws-rds' },
    { id: 'e6', source: 'aks', target: 'azure-sql' },
    { id: 'e7', source: 'gke', target: 'cloud-sql' },
    // Cross-cloud connections
    { id: 'e8', source: 'eks', target: 'aks', data: { style: { strokeDasharray: '5,5' } } },
    { id: 'e9', source: 'aks', target: 'gke', data: { style: { strokeDasharray: '5,5' } } },
  ],
}

// ============================================================================
// DevOps & CI/CD Templates
// ============================================================================

const awsDevOpsPipeline: ArchitectureTemplate = {
  id: 'aws-devops-pipeline',
  name: 'AWS CI/CD Pipeline',
  description: 'Complete CI/CD pipeline with CodePipeline, CodeBuild, and deployment to ECS',
  categories: ['aws', 'devops'],
  complexity: 'intermediate',
  tags: ['devops', 'ci-cd', 'codepipeline', 'codebuild', 'ecs'],
  isBuiltIn: true,
  variables: [
    { id: 'app-name', name: 'Application Name', type: 'text', defaultValue: 'my-app', appliesTo: ['ecr', 'ecs'] },
    { id: 'env', name: 'Environment', type: 'select', defaultValue: 'production', options: ['development', 'staging', 'production'], appliesTo: ['ecs'] },
  ],
  nodes: [
    { id: 'github', type: 'rectangle', position: { x: 50, y: 150 },
      data: { label: 'GitHub', type: 'rectangle' } },
    { id: 'codecommit', type: 'aws-codecommit', position: { x: 200, y: 150 },
      data: { label: 'CodeCommit', type: 'aws-codecommit' } },
    { id: 'codebuild', type: 'aws-codebuild', position: { x: 350, y: 150 },
      data: { label: 'CodeBuild', type: 'aws-codebuild' } },
    { id: 'ecr', type: 'aws-ecr', position: { x: 500, y: 80 },
      data: { label: 'ECR', type: 'aws-ecr' } },
    { id: 'codepipeline', type: 'aws-codepipeline', position: { x: 350, y: 280 },
      data: { label: 'CodePipeline', type: 'aws-codepipeline' } },
    { id: 'codedeploy', type: 'aws-codedeploy', position: { x: 500, y: 280 },
      data: { label: 'CodeDeploy', type: 'aws-codedeploy' } },
    { id: 'ecs', type: 'aws-ecs', position: { x: 650, y: 150 },
      data: { label: 'ECS Cluster', type: 'aws-ecs' } },
    { id: 'cloudwatch', type: 'aws-cloudwatch', position: { x: 650, y: 280 },
      data: { label: 'CloudWatch', type: 'aws-cloudwatch' } },
  ],
  edges: [
    { id: 'e1', source: 'github', target: 'codecommit' },
    { id: 'e2', source: 'codecommit', target: 'codebuild' },
    { id: 'e3', source: 'codebuild', target: 'ecr' },
    { id: 'e4', source: 'codecommit', target: 'codepipeline' },
    { id: 'e5', source: 'codepipeline', target: 'codedeploy' },
    { id: 'e6', source: 'codedeploy', target: 'ecs' },
    { id: 'e7', source: 'ecr', target: 'ecs' },
    { id: 'e8', source: 'ecs', target: 'cloudwatch' },
  ],
}

const azureDevOpsPipeline: ArchitectureTemplate = {
  id: 'azure-devops-pipeline',
  name: 'Azure DevOps Pipeline',
  description: 'End-to-end Azure DevOps pipeline with repos, pipelines, and AKS deployment',
  categories: ['azure', 'devops'],
  complexity: 'intermediate',
  tags: ['devops', 'ci-cd', 'azure-devops', 'aks', 'pipelines'],
  isBuiltIn: true,
  nodes: [
    { id: 'repos', type: 'azure-repos', position: { x: 50, y: 150 },
      data: { label: 'Azure Repos', type: 'azure-repos' } },
    { id: 'pipelines', type: 'azure-pipelines', position: { x: 200, y: 150 },
      data: { label: 'Azure Pipelines', type: 'azure-pipelines' } },
    { id: 'acr', type: 'azure-container-registry', position: { x: 350, y: 80 },
      data: { label: 'Container Registry', type: 'azure-container-registry' } },
    { id: 'artifacts', type: 'azure-artifacts', position: { x: 350, y: 220 },
      data: { label: 'Artifacts', type: 'azure-artifacts' } },
    { id: 'aks', type: 'azure-aks', position: { x: 500, y: 150 },
      data: { label: 'AKS', type: 'azure-aks' } },
    { id: 'keyvault', type: 'azure-keyvault', position: { x: 350, y: 320 },
      data: { label: 'Key Vault', type: 'azure-keyvault' } },
    { id: 'monitor', type: 'azure-monitor', position: { x: 650, y: 150 },
      data: { label: 'Azure Monitor', type: 'azure-monitor' } },
  ],
  edges: [
    { id: 'e1', source: 'repos', target: 'pipelines' },
    { id: 'e2', source: 'pipelines', target: 'acr' },
    { id: 'e3', source: 'pipelines', target: 'artifacts' },
    { id: 'e4', source: 'acr', target: 'aks' },
    { id: 'e5', source: 'pipelines', target: 'keyvault' },
    { id: 'e6', source: 'aks', target: 'monitor' },
  ],
}

// ============================================================================
// IoT Architecture Templates
// ============================================================================

const awsIoTArchitecture: ArchitectureTemplate = {
  id: 'aws-iot-architecture',
  name: 'AWS IoT Platform',
  description: 'End-to-end IoT solution with AWS IoT Core, Greengrass, and analytics',
  categories: ['aws', 'iot'],
  complexity: 'advanced',
  tags: ['iot', 'iot-core', 'greengrass', 'kinesis', 'analytics'],
  isBuiltIn: true,
  nodes: [
    { id: 'devices', type: 'rectangle', position: { x: 50, y: 150 },
      data: { label: 'IoT Devices', type: 'rectangle' } },
    { id: 'greengrass', type: 'rectangle', position: { x: 50, y: 280 },
      data: { label: 'Greengrass Edge', type: 'rectangle' } },
    { id: 'iot-core', type: 'rectangle', position: { x: 250, y: 150 },
      data: { label: 'IoT Core', type: 'rectangle' } },
    { id: 'iot-rules', type: 'rectangle', position: { x: 250, y: 280 },
      data: { label: 'IoT Rules Engine', type: 'rectangle' } },
    { id: 'kinesis', type: 'aws-kinesis', position: { x: 450, y: 100 },
      data: { label: 'Kinesis', type: 'aws-kinesis' } },
    { id: 'lambda', type: 'aws-lambda', position: { x: 450, y: 200 },
      data: { label: 'Lambda', type: 'aws-lambda' } },
    { id: 's3', type: 'aws-s3', position: { x: 450, y: 300 },
      data: { label: 'S3 Data Lake', type: 'aws-s3' } },
    { id: 'timestream', type: 'aws-timestream', position: { x: 650, y: 150 },
      data: { label: 'Timestream', type: 'aws-timestream' } },
    { id: 'quicksight', type: 'aws-quicksight', position: { x: 650, y: 280 },
      data: { label: 'QuickSight', type: 'aws-quicksight' } },
  ],
  edges: [
    { id: 'e1', source: 'devices', target: 'iot-core' },
    { id: 'e2', source: 'greengrass', target: 'iot-core' },
    { id: 'e3', source: 'iot-core', target: 'iot-rules' },
    { id: 'e4', source: 'iot-rules', target: 'kinesis' },
    { id: 'e5', source: 'iot-rules', target: 'lambda' },
    { id: 'e6', source: 'iot-rules', target: 's3' },
    { id: 'e7', source: 'kinesis', target: 'timestream' },
    { id: 'e8', source: 'timestream', target: 'quicksight' },
    { id: 'e9', source: 's3', target: 'quicksight' },
  ],
}

const azureIoTArchitecture: ArchitectureTemplate = {
  id: 'azure-iot-architecture',
  name: 'Azure IoT Solution',
  description: 'Complete IoT solution with Azure IoT Hub, Stream Analytics, and Time Series Insights',
  categories: ['azure', 'iot'],
  complexity: 'advanced',
  tags: ['iot', 'iot-hub', 'stream-analytics', 'digital-twins'],
  isBuiltIn: true,
  nodes: [
    { id: 'devices', type: 'rectangle', position: { x: 50, y: 150 },
      data: { label: 'IoT Devices', type: 'rectangle' } },
    { id: 'iot-edge', type: 'rectangle', position: { x: 50, y: 280 },
      data: { label: 'IoT Edge', type: 'rectangle' } },
    { id: 'iot-hub', type: 'azure-event-hub', position: { x: 250, y: 200 },
      data: { label: 'IoT Hub', type: 'azure-event-hub' } },
    { id: 'stream-analytics', type: 'azure-stream-analytics', position: { x: 450, y: 120 },
      data: { label: 'Stream Analytics', type: 'azure-stream-analytics' } },
    { id: 'functions', type: 'azure-functions', position: { x: 450, y: 220 },
      data: { label: 'Functions', type: 'azure-functions' } },
    { id: 'storage', type: 'azure-storage', position: { x: 450, y: 320 },
      data: { label: 'Blob Storage', type: 'azure-storage' } },
    { id: 'cosmos', type: 'azure-cosmos', position: { x: 650, y: 170 },
      data: { label: 'Cosmos DB', type: 'azure-cosmos' } },
    { id: 'power-bi', type: 'azure-power-bi', position: { x: 650, y: 280 },
      data: { label: 'Power BI', type: 'azure-power-bi' } },
  ],
  edges: [
    { id: 'e1', source: 'devices', target: 'iot-hub' },
    { id: 'e2', source: 'iot-edge', target: 'iot-hub' },
    { id: 'e3', source: 'iot-hub', target: 'stream-analytics' },
    { id: 'e4', source: 'iot-hub', target: 'functions' },
    { id: 'e5', source: 'stream-analytics', target: 'cosmos' },
    { id: 'e6', source: 'functions', target: 'storage' },
    { id: 'e7', source: 'cosmos', target: 'power-bi' },
    { id: 'e8', source: 'storage', target: 'power-bi' },
  ],
}

// ============================================================================
// Security Architecture Templates
// ============================================================================

const azureHubSpokeNetwork: ArchitectureTemplate = {
  id: 'azure-hub-spoke-network',
  name: 'Azure Hub-Spoke Network',
  description: 'Enterprise hub-spoke network topology with Azure Firewall and VPN',
  categories: ['azure', 'networking', 'security'],
  complexity: 'advanced',
  tags: ['hub-spoke', 'firewall', 'vpn', 'vnet', 'peering'],
  isBuiltIn: true,
  nodes: [
    // Hub
    { id: 'hub-vnet', type: 'azure-vnet', position: { x: 350, y: 150 },
      data: { label: 'Hub VNet', type: 'azure-vnet' } },
    { id: 'firewall', type: 'azure-firewall', position: { x: 350, y: 50 },
      data: { label: 'Azure Firewall', type: 'azure-firewall' } },
    { id: 'vpn-gateway', type: 'azure-vpn-gateway', position: { x: 200, y: 150 },
      data: { label: 'VPN Gateway', type: 'azure-vpn-gateway' } },
    { id: 'bastion', type: 'azure-bastion', position: { x: 500, y: 150 },
      data: { label: 'Azure Bastion', type: 'azure-bastion' } },
    // On-premises
    { id: 'on-prem', type: 'rectangle', position: { x: 50, y: 150 },
      data: { label: 'On-Premises', type: 'rectangle' } },
    // Spoke 1
    { id: 'spoke1-vnet', type: 'azure-vnet', position: { x: 200, y: 300 },
      data: { label: 'Spoke 1 VNet', type: 'azure-vnet' } },
    { id: 'spoke1-vm', type: 'azure-vm', position: { x: 200, y: 400 },
      data: { label: 'Workload VMs', type: 'azure-vm' } },
    // Spoke 2
    { id: 'spoke2-vnet', type: 'azure-vnet', position: { x: 500, y: 300 },
      data: { label: 'Spoke 2 VNet', type: 'azure-vnet' } },
    { id: 'spoke2-aks', type: 'azure-aks', position: { x: 500, y: 400 },
      data: { label: 'AKS Cluster', type: 'azure-aks' } },
  ],
  edges: [
    { id: 'e1', source: 'on-prem', target: 'vpn-gateway' },
    { id: 'e2', source: 'vpn-gateway', target: 'hub-vnet' },
    { id: 'e3', source: 'hub-vnet', target: 'firewall' },
    { id: 'e4', source: 'hub-vnet', target: 'bastion' },
    { id: 'e5', source: 'hub-vnet', target: 'spoke1-vnet', data: { label: 'Peering' } },
    { id: 'e6', source: 'hub-vnet', target: 'spoke2-vnet', data: { label: 'Peering' } },
    { id: 'e7', source: 'spoke1-vnet', target: 'spoke1-vm' },
    { id: 'e8', source: 'spoke2-vnet', target: 'spoke2-aks' },
  ],
}

const awsSecurityArchitecture: ArchitectureTemplate = {
  id: 'aws-security-architecture',
  name: 'AWS Security Best Practices',
  description: 'Security-focused architecture with WAF, GuardDuty, Security Hub, and centralized logging',
  categories: ['aws', 'security'],
  complexity: 'advanced',
  tags: ['security', 'waf', 'guardduty', 'security-hub', 'logging'],
  isBuiltIn: true,
  nodes: [
    { id: 'internet', type: 'internet', position: { x: 50, y: 150 },
      data: { label: 'Internet', type: 'internet' } },
    { id: 'waf', type: 'aws-waf', position: { x: 200, y: 150 },
      data: { label: 'WAF', type: 'aws-waf' } },
    { id: 'cloudfront', type: 'aws-cloudfront', position: { x: 350, y: 150 },
      data: { label: 'CloudFront', type: 'aws-cloudfront' } },
    { id: 'shield', type: 'aws-shield', position: { x: 200, y: 50 },
      data: { label: 'Shield Advanced', type: 'aws-shield' } },
    { id: 'alb', type: 'aws-elb', position: { x: 500, y: 150 },
      data: { label: 'ALB', type: 'aws-elb' } },
    { id: 'guardduty', type: 'aws-guardduty', position: { x: 350, y: 300 },
      data: { label: 'GuardDuty', type: 'aws-guardduty' } },
    { id: 'security-hub', type: 'aws-security-hub', position: { x: 500, y: 300 },
      data: { label: 'Security Hub', type: 'aws-security-hub' } },
    { id: 'cloudtrail', type: 'aws-cloudtrail', position: { x: 200, y: 300 },
      data: { label: 'CloudTrail', type: 'aws-cloudtrail' } },
    { id: 's3-logs', type: 'aws-s3', position: { x: 200, y: 420 },
      data: { label: 'S3 Logs', type: 'aws-s3' } },
    { id: 'kms', type: 'aws-kms', position: { x: 650, y: 150 },
      data: { label: 'KMS', type: 'aws-kms' } },
    { id: 'secrets', type: 'aws-secrets-manager', position: { x: 650, y: 250 },
      data: { label: 'Secrets Manager', type: 'aws-secrets-manager' } },
  ],
  edges: [
    { id: 'e1', source: 'internet', target: 'waf' },
    { id: 'e2', source: 'waf', target: 'cloudfront' },
    { id: 'e3', source: 'shield', target: 'cloudfront' },
    { id: 'e4', source: 'cloudfront', target: 'alb' },
    { id: 'e5', source: 'guardduty', target: 'security-hub' },
    { id: 'e6', source: 'cloudtrail', target: 's3-logs' },
    { id: 'e7', source: 'cloudtrail', target: 'guardduty' },
    { id: 'e8', source: 'alb', target: 'kms' },
    { id: 'e9', source: 'alb', target: 'secrets' },
  ],
}

// ============================================================================
// Event-Driven Architecture Templates
// ============================================================================

const awsEventDrivenArchitecture: ArchitectureTemplate = {
  id: 'aws-event-driven',
  name: 'AWS Event-Driven Architecture',
  description: 'Event-driven microservices with EventBridge, SQS, and Lambda',
  categories: ['aws', 'serverless'],
  complexity: 'intermediate',
  tags: ['event-driven', 'eventbridge', 'sqs', 'lambda', 'microservices'],
  isBuiltIn: true,
  nodes: [
    { id: 'api-gw', type: 'aws-api-gateway', position: { x: 50, y: 150 },
      data: { label: 'API Gateway', type: 'aws-api-gateway' } },
    { id: 'eventbridge', type: 'aws-eventbridge', position: { x: 250, y: 150 },
      data: { label: 'EventBridge', type: 'aws-eventbridge' } },
    { id: 'sqs-orders', type: 'aws-sqs', position: { x: 450, y: 80 },
      data: { label: 'Orders Queue', type: 'aws-sqs' } },
    { id: 'sqs-notify', type: 'aws-sqs', position: { x: 450, y: 180 },
      data: { label: 'Notifications Queue', type: 'aws-sqs' } },
    { id: 'sqs-analytics', type: 'aws-sqs', position: { x: 450, y: 280 },
      data: { label: 'Analytics Queue', type: 'aws-sqs' } },
    { id: 'lambda-orders', type: 'aws-lambda', position: { x: 600, y: 80 },
      data: { label: 'Order Processor', type: 'aws-lambda' } },
    { id: 'lambda-notify', type: 'aws-lambda', position: { x: 600, y: 180 },
      data: { label: 'Notification Service', type: 'aws-lambda' } },
    { id: 'lambda-analytics', type: 'aws-lambda', position: { x: 600, y: 280 },
      data: { label: 'Analytics Processor', type: 'aws-lambda' } },
    { id: 'dynamodb', type: 'aws-dynamodb', position: { x: 750, y: 80 },
      data: { label: 'DynamoDB', type: 'aws-dynamodb' } },
    { id: 'sns', type: 'aws-sns', position: { x: 750, y: 180 },
      data: { label: 'SNS', type: 'aws-sns' } },
    { id: 'kinesis', type: 'aws-kinesis', position: { x: 750, y: 280 },
      data: { label: 'Kinesis', type: 'aws-kinesis' } },
  ],
  edges: [
    { id: 'e1', source: 'api-gw', target: 'eventbridge' },
    { id: 'e2', source: 'eventbridge', target: 'sqs-orders' },
    { id: 'e3', source: 'eventbridge', target: 'sqs-notify' },
    { id: 'e4', source: 'eventbridge', target: 'sqs-analytics' },
    { id: 'e5', source: 'sqs-orders', target: 'lambda-orders' },
    { id: 'e6', source: 'sqs-notify', target: 'lambda-notify' },
    { id: 'e7', source: 'sqs-analytics', target: 'lambda-analytics' },
    { id: 'e8', source: 'lambda-orders', target: 'dynamodb' },
    { id: 'e9', source: 'lambda-notify', target: 'sns' },
    { id: 'e10', source: 'lambda-analytics', target: 'kinesis' },
  ],
}

const gcpEventDrivenArchitecture: ArchitectureTemplate = {
  id: 'gcp-event-driven',
  name: 'GCP Event-Driven Architecture',
  description: 'Event-driven system with Pub/Sub, Cloud Functions, and Eventarc',
  categories: ['gcp', 'serverless'],
  complexity: 'intermediate',
  tags: ['event-driven', 'pubsub', 'functions', 'eventarc'],
  isBuiltIn: true,
  nodes: [
    { id: 'api-gw', type: 'rectangle', position: { x: 50, y: 150 },
      data: { label: 'API Gateway', type: 'rectangle' } },
    { id: 'pubsub', type: 'gcp-pubsub', position: { x: 250, y: 150 },
      data: { label: 'Pub/Sub', type: 'gcp-pubsub' } },
    { id: 'func-1', type: 'gcp-functions', position: { x: 450, y: 80 },
      data: { label: 'Order Function', type: 'gcp-functions' } },
    { id: 'func-2', type: 'gcp-functions', position: { x: 450, y: 180 },
      data: { label: 'Notify Function', type: 'gcp-functions' } },
    { id: 'func-3', type: 'gcp-functions', position: { x: 450, y: 280 },
      data: { label: 'Analytics Function', type: 'gcp-functions' } },
    { id: 'firestore', type: 'gcp-firestore', position: { x: 650, y: 80 },
      data: { label: 'Firestore', type: 'gcp-firestore' } },
    { id: 'bigquery', type: 'gcp-bigquery', position: { x: 650, y: 280 },
      data: { label: 'BigQuery', type: 'gcp-bigquery' } },
  ],
  edges: [
    { id: 'e1', source: 'api-gw', target: 'pubsub' },
    { id: 'e2', source: 'pubsub', target: 'func-1' },
    { id: 'e3', source: 'pubsub', target: 'func-2' },
    { id: 'e4', source: 'pubsub', target: 'func-3' },
    { id: 'e5', source: 'func-1', target: 'firestore' },
    { id: 'e6', source: 'func-3', target: 'bigquery' },
  ],
}

// ============================================================================
// Additional Azure Architecture Templates (Azure Architecture Center)
// ============================================================================

const azureSynapseAnalytics: ArchitectureTemplate = {
  id: 'azure-synapse-analytics',
  name: 'Azure Synapse Analytics',
  description: 'Modern data warehouse with Synapse Analytics for big data and analytics',
  categories: ['azure', 'data-analytics'],
  complexity: 'advanced',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/example-scenario/dataplate2e/data-platform-end-to-end',
  tags: ['synapse', 'data-warehouse', 'analytics', 'big-data', 'spark'],
  isBuiltIn: true,
  nodes: [
    { id: 'sources', type: 'database', position: { x: 50, y: 150 }, data: { label: 'Data Sources', type: 'database' } },
    { id: 'data-factory', type: 'azure-data-factory', position: { x: 200, y: 150 }, data: { label: 'Data Factory', type: 'azure-data-factory' } },
    { id: 'adls', type: 'azure-data-lake', position: { x: 350, y: 100 }, data: { label: 'Data Lake Gen2', type: 'azure-data-lake' } },
    { id: 'synapse', type: 'azure-synapse', position: { x: 500, y: 150 }, data: { label: 'Synapse Analytics', type: 'azure-synapse' } },
    { id: 'spark', type: 'azure-databricks', position: { x: 350, y: 250 }, data: { label: 'Spark Pools', type: 'azure-databricks' } },
    { id: 'power-bi', type: 'azure-power-bi', position: { x: 650, y: 150 }, data: { label: 'Power BI', type: 'azure-power-bi' } },
    { id: 'purview', type: 'azure-purview', position: { x: 500, y: 280 }, data: { label: 'Purview', type: 'azure-purview' } },
  ],
  edges: [
    { id: 'e1', source: 'sources', target: 'data-factory', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'data-factory', target: 'adls', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'adls', target: 'synapse', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'data-factory', target: 'spark', sourceHandle: 'bottom', targetHandle: 'left' },
    { id: 'e5', source: 'spark', target: 'synapse', sourceHandle: 'right', targetHandle: 'bottom' },
    { id: 'e6', source: 'synapse', target: 'power-bi', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e7', source: 'synapse', target: 'purview', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

const azureVirtualDesktop: ArchitectureTemplate = {
  id: 'azure-virtual-desktop',
  name: 'Azure Virtual Desktop',
  description: 'Enterprise virtual desktop infrastructure with AVD',
  categories: ['azure', 'web-app'],
  complexity: 'advanced',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/example-scenario/wvd/windows-virtual-desktop',
  tags: ['avd', 'vdi', 'virtual-desktop', 'remote-work', 'wvd'],
  isBuiltIn: true,
  nodes: [
    { id: 'users', type: 'users', position: { x: 50, y: 150 }, data: { label: 'Remote Users', type: 'users' } },
    { id: 'front-door', type: 'azure-front-door', position: { x: 200, y: 150 }, data: { label: 'Front Door', type: 'azure-front-door' } },
    { id: 'avd-gateway', type: 'azure-vpn-gateway', position: { x: 350, y: 150 }, data: { label: 'AVD Gateway', type: 'azure-vpn-gateway' } },
    { id: 'session-hosts', type: 'azure-vm', position: { x: 500, y: 100 }, data: { label: 'Session Hosts', type: 'azure-vm' } },
    { id: 'entra-id', type: 'azure-entra-id', position: { x: 350, y: 280 }, data: { label: 'Entra ID', type: 'azure-entra-id' } },
    { id: 'storage', type: 'azure-storage', position: { x: 500, y: 200 }, data: { label: 'FSLogix Profiles', type: 'azure-storage' } },
    { id: 'keyvault', type: 'azure-keyvault', position: { x: 650, y: 150 }, data: { label: 'Key Vault', type: 'azure-keyvault' } },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'front-door', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'front-door', target: 'avd-gateway', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'avd-gateway', target: 'session-hosts', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'avd-gateway', target: 'entra-id', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e5', source: 'session-hosts', target: 'storage', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e6', source: 'session-hosts', target: 'keyvault', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

const azureAPIManagement: ArchitectureTemplate = {
  id: 'azure-api-management',
  name: 'Azure API Management Gateway',
  description: 'Enterprise API gateway with APIM for microservices',
  categories: ['azure', 'web-app', 'security'],
  complexity: 'intermediate',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/enterprise-integration/basic-enterprise-integration',
  tags: ['apim', 'api-gateway', 'microservices', 'api-management'],
  isBuiltIn: true,
  nodes: [
    { id: 'clients', type: 'users', position: { x: 50, y: 150 }, data: { label: 'API Clients', type: 'users' } },
    { id: 'apim', type: 'azure-api-management', position: { x: 200, y: 150 }, data: { label: 'API Management', type: 'azure-api-management' } },
    { id: 'func-1', type: 'azure-functions', position: { x: 400, y: 80 }, data: { label: 'Users API', type: 'azure-functions' } },
    { id: 'func-2', type: 'azure-functions', position: { x: 400, y: 180 }, data: { label: 'Orders API', type: 'azure-functions' } },
    { id: 'app-svc', type: 'azure-app-service', position: { x: 400, y: 280 }, data: { label: 'Products API', type: 'azure-app-service' } },
    { id: 'cosmos', type: 'azure-cosmos', position: { x: 600, y: 150 }, data: { label: 'Cosmos DB', type: 'azure-cosmos' } },
    { id: 'app-insights', type: 'azure-monitor', position: { x: 200, y: 300 }, data: { label: 'App Insights', type: 'azure-monitor' } },
  ],
  edges: [
    { id: 'e1', source: 'clients', target: 'apim', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'apim', target: 'func-1', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'apim', target: 'func-2', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'apim', target: 'app-svc', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'func-1', target: 'cosmos', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'func-2', target: 'cosmos', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e7', source: 'apim', target: 'app-insights', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

const azureEventGrid: ArchitectureTemplate = {
  id: 'azure-event-grid',
  name: 'Azure Event-Driven with Event Grid',
  description: 'Event-driven architecture using Event Grid for reactive systems',
  categories: ['azure', 'serverless'],
  complexity: 'intermediate',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/serverless/event-processing',
  tags: ['event-grid', 'event-driven', 'serverless', 'reactive'],
  isBuiltIn: true,
  nodes: [
    { id: 'blob-trigger', type: 'azure-storage', position: { x: 50, y: 100 }, data: { label: 'Blob Storage', type: 'azure-storage' } },
    { id: 'iot-hub', type: 'azure-event-hub', position: { x: 50, y: 200 }, data: { label: 'IoT Hub', type: 'azure-event-hub' } },
    { id: 'custom-app', type: 'azure-app-service', position: { x: 50, y: 300 }, data: { label: 'Custom App', type: 'azure-app-service' } },
    { id: 'event-grid', type: 'azure-event-grid', position: { x: 250, y: 200 }, data: { label: 'Event Grid', type: 'azure-event-grid' } },
    { id: 'func-handler', type: 'azure-functions', position: { x: 450, y: 100 }, data: { label: 'Function Handler', type: 'azure-functions' } },
    { id: 'logic-app', type: 'azure-logic-apps', position: { x: 450, y: 200 }, data: { label: 'Logic App', type: 'azure-logic-apps' } },
    { id: 'webhook', type: 'rectangle', position: { x: 450, y: 300 }, data: { label: 'Webhook', type: 'rectangle' } },
    { id: 'cosmos', type: 'azure-cosmos', position: { x: 650, y: 150 }, data: { label: 'Cosmos DB', type: 'azure-cosmos' } },
  ],
  edges: [
    { id: 'e1', source: 'blob-trigger', target: 'event-grid', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'iot-hub', target: 'event-grid', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'custom-app', target: 'event-grid', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'event-grid', target: 'func-handler', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'event-grid', target: 'logic-app', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'event-grid', target: 'webhook', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e7', source: 'func-handler', target: 'cosmos', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

const azureDisasterRecovery: ArchitectureTemplate = {
  id: 'azure-disaster-recovery',
  name: 'Azure Disaster Recovery',
  description: 'Business continuity with Azure Site Recovery and geo-redundancy',
  categories: ['azure', 'security'],
  complexity: 'advanced',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/articles/disaster-recovery-enterprise-scale-dr',
  tags: ['disaster-recovery', 'bcdr', 'site-recovery', 'backup', 'geo-redundancy'],
  isBuiltIn: true,
  nodes: [
    { id: 'primary-region', type: 'rectangle', position: { x: 100, y: 50 }, data: { label: 'Primary Region (East US)', type: 'rectangle' } },
    { id: 'primary-vms', type: 'azure-vm', position: { x: 50, y: 150 }, data: { label: 'Production VMs', type: 'azure-vm' } },
    { id: 'primary-sql', type: 'azure-sql', position: { x: 200, y: 150 }, data: { label: 'Azure SQL', type: 'azure-sql' } },
    { id: 'site-recovery', type: 'azure-backup', position: { x: 350, y: 200 }, data: { label: 'Site Recovery', type: 'azure-backup' } },
    { id: 'secondary-region', type: 'rectangle', position: { x: 550, y: 50 }, data: { label: 'Secondary Region (West US)', type: 'rectangle' } },
    { id: 'secondary-vms', type: 'azure-vm', position: { x: 500, y: 150 }, data: { label: 'Replica VMs', type: 'azure-vm' } },
    { id: 'secondary-sql', type: 'azure-sql', position: { x: 650, y: 150 }, data: { label: 'SQL Geo-Replica', type: 'azure-sql' } },
    { id: 'traffic-manager', type: 'azure-traffic-manager', position: { x: 350, y: 50 }, data: { label: 'Traffic Manager', type: 'azure-traffic-manager' } },
  ],
  edges: [
    { id: 'e1', source: 'primary-vms', target: 'site-recovery', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'site-recovery', target: 'secondary-vms', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'primary-sql', target: 'secondary-sql', sourceHandle: 'right', targetHandle: 'left', data: { label: 'Geo-Replication' } },
    { id: 'e4', source: 'traffic-manager', target: 'primary-vms', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e5', source: 'traffic-manager', target: 'secondary-vms', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

const azureServiceBusIntegration: ArchitectureTemplate = {
  id: 'azure-service-bus-integration',
  name: 'Azure Service Bus Integration',
  description: 'Enterprise messaging with Service Bus queues and topics',
  categories: ['azure', 'serverless'],
  complexity: 'intermediate',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/enterprise-integration/queues-events',
  tags: ['service-bus', 'messaging', 'queues', 'topics', 'integration'],
  isBuiltIn: true,
  nodes: [
    { id: 'producer-1', type: 'azure-app-service', position: { x: 50, y: 100 }, data: { label: 'Order Service', type: 'azure-app-service' } },
    { id: 'producer-2', type: 'azure-functions', position: { x: 50, y: 220 }, data: { label: 'Payment Service', type: 'azure-functions' } },
    { id: 'service-bus', type: 'azure-service-bus', position: { x: 250, y: 160 }, data: { label: 'Service Bus', type: 'azure-service-bus' } },
    { id: 'queue', type: 'azure-storage-queue', position: { x: 400, y: 100 }, data: { label: 'Order Queue', type: 'azure-storage-queue' } },
    { id: 'topic', type: 'azure-service-bus', position: { x: 400, y: 220 }, data: { label: 'Notification Topic', type: 'azure-service-bus' } },
    { id: 'consumer-1', type: 'azure-functions', position: { x: 550, y: 100 }, data: { label: 'Order Processor', type: 'azure-functions' } },
    { id: 'consumer-2', type: 'azure-logic-apps', position: { x: 550, y: 180 }, data: { label: 'Email Sender', type: 'azure-logic-apps' } },
    { id: 'consumer-3', type: 'azure-functions', position: { x: 550, y: 260 }, data: { label: 'SMS Sender', type: 'azure-functions' } },
  ],
  edges: [
    { id: 'e1', source: 'producer-1', target: 'service-bus', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'producer-2', target: 'service-bus', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'service-bus', target: 'queue', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'service-bus', target: 'topic', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'queue', target: 'consumer-1', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'topic', target: 'consumer-2', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e7', source: 'topic', target: 'consumer-3', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

const azureLogicAppsIntegration: ArchitectureTemplate = {
  id: 'azure-logic-apps-integration',
  name: 'Azure Logic Apps Integration',
  description: 'Enterprise integration with Logic Apps and connectors',
  categories: ['azure', 'serverless'],
  complexity: 'beginner',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/enterprise-integration/basic-enterprise-integration',
  tags: ['logic-apps', 'integration', 'workflow', 'connectors', 'automation'],
  isBuiltIn: true,
  nodes: [
    { id: 'trigger', type: 'rectangle', position: { x: 50, y: 150 }, data: { label: 'HTTP Trigger', type: 'rectangle' } },
    { id: 'logic-app', type: 'azure-logic-apps', position: { x: 200, y: 150 }, data: { label: 'Logic App', type: 'azure-logic-apps' } },
    { id: 'salesforce', type: 'rectangle', position: { x: 400, y: 80 }, data: { label: 'Salesforce', type: 'rectangle' } },
    { id: 'dynamics', type: 'o365-dynamics365', position: { x: 400, y: 180 }, data: { label: 'Dynamics 365', type: 'o365-dynamics365' } },
    { id: 'sharepoint', type: 'o365-sharepoint', position: { x: 400, y: 280 }, data: { label: 'SharePoint', type: 'o365-sharepoint' } },
    { id: 'sql', type: 'azure-sql', position: { x: 600, y: 150 }, data: { label: 'Azure SQL', type: 'azure-sql' } },
  ],
  edges: [
    { id: 'e1', source: 'trigger', target: 'logic-app', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'logic-app', target: 'salesforce', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'logic-app', target: 'dynamics', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'logic-app', target: 'sharepoint', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'dynamics', target: 'sql', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

const azureCDNArchitecture: ArchitectureTemplate = {
  id: 'azure-cdn-architecture',
  name: 'Azure CDN with Front Door',
  description: 'Global content delivery with Azure CDN and Front Door',
  categories: ['azure', 'web-app', 'networking'],
  complexity: 'intermediate',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/best-practices/cdn',
  tags: ['cdn', 'front-door', 'caching', 'global', 'content-delivery'],
  isBuiltIn: true,
  nodes: [
    { id: 'users', type: 'users', position: { x: 50, y: 150 }, data: { label: 'Global Users', type: 'users' } },
    { id: 'front-door', type: 'azure-front-door', position: { x: 200, y: 150 }, data: { label: 'Front Door', type: 'azure-front-door' } },
    { id: 'cdn', type: 'azure-cdn', position: { x: 350, y: 80 }, data: { label: 'Azure CDN', type: 'azure-cdn' } },
    { id: 'waf', type: 'azure-firewall', position: { x: 350, y: 220 }, data: { label: 'WAF Policy', type: 'azure-firewall' } },
    { id: 'app-service', type: 'azure-app-service', position: { x: 500, y: 150 }, data: { label: 'App Service', type: 'azure-app-service' } },
    { id: 'storage', type: 'azure-storage', position: { x: 650, y: 80 }, data: { label: 'Static Assets', type: 'azure-storage' } },
    { id: 'api', type: 'azure-api-management', position: { x: 650, y: 220 }, data: { label: 'API Backend', type: 'azure-api-management' } },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'front-door', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'front-door', target: 'cdn', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'front-door', target: 'waf', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'cdn', target: 'storage', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'waf', target: 'app-service', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'app-service', target: 'api', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

const azureCognitiveSearch: ArchitectureTemplate = {
  id: 'azure-cognitive-search',
  name: 'Azure AI Search',
  description: 'Enterprise search with Azure AI Search and cognitive skills',
  categories: ['azure', 'ai-ml'],
  complexity: 'intermediate',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/articles/cognitive-search-with-skillsets',
  tags: ['cognitive-search', 'ai-search', 'search', 'cognitive-skills', 'nlp'],
  isBuiltIn: true,
  nodes: [
    { id: 'blob-storage', type: 'azure-storage', position: { x: 50, y: 100 }, data: { label: 'Documents', type: 'azure-storage' } },
    { id: 'sql-db', type: 'azure-sql', position: { x: 50, y: 220 }, data: { label: 'SQL Database', type: 'azure-sql' } },
    { id: 'cosmos', type: 'azure-cosmos', position: { x: 50, y: 340 }, data: { label: 'Cosmos DB', type: 'azure-cosmos' } },
    { id: 'ai-search', type: 'azure-cognitive-services', position: { x: 250, y: 200 }, data: { label: 'AI Search', type: 'azure-cognitive-services' } },
    { id: 'cognitive', type: 'azure-cognitive-services', position: { x: 400, y: 100 }, data: { label: 'Cognitive Skills', type: 'azure-cognitive-services' } },
    { id: 'openai', type: 'azure-openai', position: { x: 400, y: 300 }, data: { label: 'Azure OpenAI', type: 'azure-openai' } },
    { id: 'web-app', type: 'azure-app-service', position: { x: 550, y: 200 }, data: { label: 'Search App', type: 'azure-app-service' } },
  ],
  edges: [
    { id: 'e1', source: 'blob-storage', target: 'ai-search', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'sql-db', target: 'ai-search', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'cosmos', target: 'ai-search', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'ai-search', target: 'cognitive', sourceHandle: 'top', targetHandle: 'bottom' },
    { id: 'e5', source: 'ai-search', target: 'openai', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e6', source: 'ai-search', target: 'web-app', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

const azureDigitalTwins: ArchitectureTemplate = {
  id: 'azure-digital-twins',
  name: 'Azure Digital Twins',
  description: 'IoT digital twins for smart buildings and industrial scenarios',
  categories: ['azure', 'iot'],
  complexity: 'advanced',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/articles/azure-digital-twins-builder',
  tags: ['digital-twins', 'iot', 'smart-building', 'industrial', 'simulation'],
  isBuiltIn: true,
  nodes: [
    { id: 'iot-devices', type: 'rectangle', position: { x: 50, y: 150 }, data: { label: 'IoT Sensors', type: 'rectangle' } },
    { id: 'iot-hub', type: 'azure-event-hub', position: { x: 200, y: 150 }, data: { label: 'IoT Hub', type: 'azure-event-hub' } },
    { id: 'functions', type: 'azure-functions', position: { x: 350, y: 150 }, data: { label: 'Event Processor', type: 'azure-functions' } },
    { id: 'digital-twins', type: 'azure-iot', position: { x: 500, y: 150 }, data: { label: 'Digital Twins', type: 'azure-iot' } },
    { id: 'event-grid', type: 'azure-event-grid', position: { x: 500, y: 280 }, data: { label: 'Event Grid', type: 'azure-event-grid' } },
    { id: 'adx', type: 'azure-data-explorer', position: { x: 650, y: 100 }, data: { label: 'Data Explorer', type: 'azure-data-explorer' } },
    { id: 'power-bi', type: 'azure-power-bi', position: { x: 650, y: 220 }, data: { label: 'Power BI', type: 'azure-power-bi' } },
  ],
  edges: [
    { id: 'e1', source: 'iot-devices', target: 'iot-hub', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'iot-hub', target: 'functions', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'functions', target: 'digital-twins', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'digital-twins', target: 'event-grid', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e5', source: 'digital-twins', target: 'adx', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'adx', target: 'power-bi', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

const azureLandingZone: ArchitectureTemplate = {
  id: 'azure-landing-zone',
  name: 'Azure Landing Zone',
  description: 'Enterprise-scale landing zone with management groups and policies',
  categories: ['azure', 'security', 'networking'],
  complexity: 'advanced',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/landing-zones/landing-zone-deploy',
  tags: ['landing-zone', 'enterprise', 'governance', 'management-groups', 'policy'],
  isBuiltIn: true,
  nodes: [
    { id: 'root-mg', type: 'rectangle', position: { x: 300, y: 30 }, data: { label: 'Root Management Group', type: 'rectangle' } },
    { id: 'platform-mg', type: 'rectangle', position: { x: 150, y: 120 }, data: { label: 'Platform', type: 'rectangle' } },
    { id: 'landing-zones-mg', type: 'rectangle', position: { x: 450, y: 120 }, data: { label: 'Landing Zones', type: 'rectangle' } },
    { id: 'connectivity', type: 'azure-vnet', position: { x: 50, y: 220 }, data: { label: 'Connectivity', type: 'azure-vnet' } },
    { id: 'identity', type: 'azure-entra-id', position: { x: 200, y: 220 }, data: { label: 'Identity', type: 'azure-entra-id' } },
    { id: 'management', type: 'azure-monitor', position: { x: 350, y: 220 }, data: { label: 'Management', type: 'azure-monitor' } },
    { id: 'corp-lz', type: 'azure-vnet', position: { x: 500, y: 220 }, data: { label: 'Corp Landing Zone', type: 'azure-vnet' } },
    { id: 'online-lz', type: 'azure-vnet', position: { x: 650, y: 220 }, data: { label: 'Online Landing Zone', type: 'azure-vnet' } },
  ],
  edges: [
    { id: 'e1', source: 'root-mg', target: 'platform-mg', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e2', source: 'root-mg', target: 'landing-zones-mg', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e3', source: 'platform-mg', target: 'connectivity', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e4', source: 'platform-mg', target: 'identity', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e5', source: 'platform-mg', target: 'management', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e6', source: 'landing-zones-mg', target: 'corp-lz', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e7', source: 'landing-zones-mg', target: 'online-lz', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

const azureB2CAuthentication: ArchitectureTemplate = {
  id: 'azure-b2c-authentication',
  name: 'Azure AD B2C Authentication',
  description: 'Consumer identity with Azure AD B2C and social logins',
  categories: ['azure', 'security', 'web-app'],
  complexity: 'intermediate',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/articles/customer-360',
  tags: ['b2c', 'authentication', 'identity', 'social-login', 'consumer'],
  isBuiltIn: true,
  nodes: [
    { id: 'users', type: 'users', position: { x: 50, y: 150 }, data: { label: 'Consumers', type: 'users' } },
    { id: 'web-app', type: 'azure-app-service', position: { x: 200, y: 150 }, data: { label: 'Web App', type: 'azure-app-service' } },
    { id: 'b2c', type: 'azure-entra-id', position: { x: 350, y: 150 }, data: { label: 'Azure AD B2C', type: 'azure-entra-id' } },
    { id: 'google', type: 'rectangle', position: { x: 500, y: 80 }, data: { label: 'Google', type: 'rectangle' } },
    { id: 'facebook', type: 'rectangle', position: { x: 500, y: 150 }, data: { label: 'Facebook', type: 'rectangle' } },
    { id: 'microsoft', type: 'o365-azure-ad', position: { x: 500, y: 220 }, data: { label: 'Microsoft', type: 'o365-azure-ad' } },
    { id: 'api', type: 'azure-api-management', position: { x: 350, y: 280 }, data: { label: 'Protected API', type: 'azure-api-management' } },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'web-app', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'web-app', target: 'b2c', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'b2c', target: 'google', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'b2c', target: 'facebook', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'b2c', target: 'microsoft', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'b2c', target: 'api', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

const azureDataFactoryETL: ArchitectureTemplate = {
  id: 'azure-data-factory-etl',
  name: 'Azure Data Factory ETL',
  description: 'ETL/ELT pipelines with Data Factory and data transformation',
  categories: ['azure', 'data-analytics'],
  complexity: 'intermediate',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/data-guide/relational-data/etl',
  tags: ['data-factory', 'etl', 'elt', 'data-pipeline', 'transformation'],
  isBuiltIn: true,
  nodes: [
    { id: 'on-prem-db', type: 'database', position: { x: 50, y: 100 }, data: { label: 'On-Premises DB', type: 'database' } },
    { id: 'saas', type: 'rectangle', position: { x: 50, y: 200 }, data: { label: 'SaaS Sources', type: 'rectangle' } },
    { id: 'files', type: 'azure-storage', position: { x: 50, y: 300 }, data: { label: 'File Sources', type: 'azure-storage' } },
    { id: 'data-factory', type: 'azure-data-factory', position: { x: 250, y: 200 }, data: { label: 'Data Factory', type: 'azure-data-factory' } },
    { id: 'databricks', type: 'azure-databricks', position: { x: 400, y: 120 }, data: { label: 'Databricks', type: 'azure-databricks' } },
    { id: 'data-lake', type: 'azure-data-lake', position: { x: 400, y: 280 }, data: { label: 'Data Lake', type: 'azure-data-lake' } },
    { id: 'synapse', type: 'azure-synapse', position: { x: 550, y: 200 }, data: { label: 'Synapse', type: 'azure-synapse' } },
    { id: 'power-bi', type: 'azure-power-bi', position: { x: 700, y: 200 }, data: { label: 'Power BI', type: 'azure-power-bi' } },
  ],
  edges: [
    { id: 'e1', source: 'on-prem-db', target: 'data-factory', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'saas', target: 'data-factory', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'files', target: 'data-factory', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'data-factory', target: 'databricks', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'data-factory', target: 'data-lake', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'databricks', target: 'synapse', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e7', source: 'data-lake', target: 'synapse', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e8', source: 'synapse', target: 'power-bi', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

const azureMonitorObservability: ArchitectureTemplate = {
  id: 'azure-monitor-observability',
  name: 'Azure Monitor & Observability',
  description: 'Full-stack observability with Azure Monitor, Log Analytics, and App Insights',
  categories: ['azure', 'devops'],
  complexity: 'intermediate',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/framework/devops/monitor',
  tags: ['monitoring', 'observability', 'log-analytics', 'app-insights', 'alerts'],
  isBuiltIn: true,
  nodes: [
    { id: 'web-app', type: 'azure-app-service', position: { x: 50, y: 100 }, data: { label: 'Web App', type: 'azure-app-service' } },
    { id: 'aks', type: 'azure-aks', position: { x: 50, y: 200 }, data: { label: 'AKS', type: 'azure-aks' } },
    { id: 'vms', type: 'azure-vm', position: { x: 50, y: 300 }, data: { label: 'VMs', type: 'azure-vm' } },
    { id: 'app-insights', type: 'azure-monitor', position: { x: 250, y: 150 }, data: { label: 'App Insights', type: 'azure-monitor' } },
    { id: 'log-analytics', type: 'azure-monitor', position: { x: 400, y: 150 }, data: { label: 'Log Analytics', type: 'azure-monitor' } },
    { id: 'azure-monitor', type: 'azure-monitor', position: { x: 550, y: 150 }, data: { label: 'Azure Monitor', type: 'azure-monitor' } },
    { id: 'alerts', type: 'azure-notification-hub', position: { x: 550, y: 280 }, data: { label: 'Alerts', type: 'azure-notification-hub' } },
    { id: 'dashboards', type: 'azure-power-bi', position: { x: 700, y: 150 }, data: { label: 'Dashboards', type: 'azure-power-bi' } },
  ],
  edges: [
    { id: 'e1', source: 'web-app', target: 'app-insights', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'aks', target: 'app-insights', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'vms', target: 'log-analytics', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'app-insights', target: 'log-analytics', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'log-analytics', target: 'azure-monitor', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'azure-monitor', target: 'alerts', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e7', source: 'azure-monitor', target: 'dashboards', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

const azureContainerApps: ArchitectureTemplate = {
  id: 'azure-container-apps',
  name: 'Azure Container Apps',
  description: 'Serverless containers with Azure Container Apps and Dapr',
  categories: ['azure', 'containers', 'serverless'],
  complexity: 'intermediate',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/example-scenario/serverless/microservices-with-container-apps',
  tags: ['container-apps', 'serverless', 'dapr', 'microservices', 'containers'],
  isBuiltIn: true,
  nodes: [
    { id: 'users', type: 'users', position: { x: 50, y: 150 }, data: { label: 'Users', type: 'users' } },
    { id: 'front-door', type: 'azure-front-door', position: { x: 200, y: 150 }, data: { label: 'Front Door', type: 'azure-front-door' } },
    { id: 'aca-env', type: 'azure-container-registry', position: { x: 400, y: 150 }, data: { label: 'Container Apps Env', type: 'azure-container-registry' } },
    { id: 'app-1', type: 'azure-container-registry', position: { x: 350, y: 80 }, data: { label: 'Frontend App', type: 'azure-container-registry' } },
    { id: 'app-2', type: 'azure-container-registry', position: { x: 450, y: 80 }, data: { label: 'API App', type: 'azure-container-registry' } },
    { id: 'dapr', type: 'rectangle', position: { x: 400, y: 250 }, data: { label: 'Dapr Sidecar', type: 'rectangle' } },
    { id: 'cosmos', type: 'azure-cosmos', position: { x: 600, y: 100 }, data: { label: 'Cosmos DB', type: 'azure-cosmos' } },
    { id: 'service-bus', type: 'azure-service-bus', position: { x: 600, y: 200 }, data: { label: 'Service Bus', type: 'azure-service-bus' } },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'front-door', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'front-door', target: 'aca-env', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'aca-env', target: 'app-1', sourceHandle: 'top', targetHandle: 'bottom' },
    { id: 'e4', source: 'aca-env', target: 'app-2', sourceHandle: 'top', targetHandle: 'bottom' },
    { id: 'e5', source: 'aca-env', target: 'dapr', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e6', source: 'dapr', target: 'cosmos', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e7', source: 'dapr', target: 'service-bus', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

const azureArcHybrid: ArchitectureTemplate = {
  id: 'azure-arc-hybrid',
  name: 'Azure Arc Hybrid Cloud',
  description: 'Hybrid and multi-cloud management with Azure Arc',
  categories: ['azure', 'multi-cloud', 'containers'],
  complexity: 'advanced',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/hybrid/azure-arc-hybrid-config',
  tags: ['azure-arc', 'hybrid', 'multi-cloud', 'kubernetes', 'on-premises'],
  isBuiltIn: true,
  nodes: [
    { id: 'azure-portal', type: 'azure-portal', position: { x: 300, y: 50 }, data: { label: 'Azure Portal', type: 'azure-portal' } },
    { id: 'azure-arc', type: 'azure-arc', position: { x: 300, y: 150 }, data: { label: 'Azure Arc', type: 'azure-arc' } },
    { id: 'on-prem-k8s', type: 'rectangle', position: { x: 100, y: 280 }, data: { label: 'On-Prem K8s', type: 'rectangle' } },
    { id: 'aws-eks', type: 'aws-eks', position: { x: 250, y: 280 }, data: { label: 'AWS EKS', type: 'aws-eks' } },
    { id: 'gcp-gke', type: 'gcp-gke', position: { x: 400, y: 280 }, data: { label: 'GCP GKE', type: 'gcp-gke' } },
    { id: 'on-prem-vms', type: 'azure-vm', position: { x: 550, y: 280 }, data: { label: 'On-Prem Servers', type: 'azure-vm' } },
    { id: 'policy', type: 'azure-policy', position: { x: 150, y: 150 }, data: { label: 'Azure Policy', type: 'azure-policy' } },
    { id: 'monitor', type: 'azure-monitor', position: { x: 450, y: 150 }, data: { label: 'Azure Monitor', type: 'azure-monitor' } },
  ],
  edges: [
    { id: 'e1', source: 'azure-portal', target: 'azure-arc', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e2', source: 'azure-arc', target: 'on-prem-k8s', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e3', source: 'azure-arc', target: 'aws-eks', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e4', source: 'azure-arc', target: 'gcp-gke', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e5', source: 'azure-arc', target: 'on-prem-vms', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e6', source: 'policy', target: 'azure-arc', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e7', source: 'azure-arc', target: 'monitor', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

const azureStaticWebApps: ArchitectureTemplate = {
  id: 'azure-static-web-apps',
  name: 'Azure Static Web Apps',
  description: 'JAMstack application with Static Web Apps and Functions',
  categories: ['azure', 'web-app', 'serverless'],
  complexity: 'beginner',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/static-content/static-content-hosting',
  tags: ['static-web-apps', 'jamstack', 'serverless', 'github', 'cdn'],
  isBuiltIn: true,
  nodes: [
    { id: 'github', type: 'rectangle', position: { x: 50, y: 150 }, data: { label: 'GitHub', type: 'rectangle' } },
    { id: 'github-actions', type: 'rectangle', position: { x: 200, y: 150 }, data: { label: 'GitHub Actions', type: 'rectangle' } },
    { id: 'swa', type: 'azure-app-service', position: { x: 350, y: 150 }, data: { label: 'Static Web App', type: 'azure-app-service' } },
    { id: 'functions', type: 'azure-functions', position: { x: 350, y: 280 }, data: { label: 'API Functions', type: 'azure-functions' } },
    { id: 'cdn', type: 'azure-cdn', position: { x: 500, y: 100 }, data: { label: 'Global CDN', type: 'azure-cdn' } },
    { id: 'users', type: 'users', position: { x: 650, y: 150 }, data: { label: 'Users', type: 'users' } },
    { id: 'cosmos', type: 'azure-cosmos', position: { x: 500, y: 280 }, data: { label: 'Cosmos DB', type: 'azure-cosmos' } },
  ],
  edges: [
    { id: 'e1', source: 'github', target: 'github-actions', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'github-actions', target: 'swa', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'swa', target: 'functions', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e4', source: 'swa', target: 'cdn', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'cdn', target: 'users', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'functions', target: 'cosmos', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

const azurePrivateLink: ArchitectureTemplate = {
  id: 'azure-private-link',
  name: 'Azure Private Link Architecture',
  description: 'Private connectivity to Azure services with Private Link',
  categories: ['azure', 'networking', 'security'],
  complexity: 'intermediate',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/example-scenario/private-web-app/private-web-app',
  tags: ['private-link', 'private-endpoint', 'vnet', 'security', 'networking'],
  isBuiltIn: true,
  nodes: [
    { id: 'on-prem', type: 'rectangle', position: { x: 50, y: 150 }, data: { label: 'On-Premises', type: 'rectangle' } },
    { id: 'vpn', type: 'azure-vpn-gateway', position: { x: 200, y: 150 }, data: { label: 'VPN Gateway', type: 'azure-vpn-gateway' } },
    { id: 'vnet', type: 'azure-vnet', position: { x: 350, y: 150 }, data: { label: 'Virtual Network', type: 'azure-vnet' } },
    { id: 'pe-storage', type: 'azure-storage', position: { x: 500, y: 80 }, data: { label: 'Storage PE', type: 'azure-storage' } },
    { id: 'pe-sql', type: 'azure-sql', position: { x: 500, y: 150 }, data: { label: 'SQL PE', type: 'azure-sql' } },
    { id: 'pe-cosmos', type: 'azure-cosmos', position: { x: 500, y: 220 }, data: { label: 'Cosmos PE', type: 'azure-cosmos' } },
    { id: 'private-dns', type: 'azure-dns', position: { x: 350, y: 280 }, data: { label: 'Private DNS', type: 'azure-dns' } },
  ],
  edges: [
    { id: 'e1', source: 'on-prem', target: 'vpn', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'vpn', target: 'vnet', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'vnet', target: 'pe-storage', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'vnet', target: 'pe-sql', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'vnet', target: 'pe-cosmos', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'vnet', target: 'private-dns', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

const azureExpressRoute: ArchitectureTemplate = {
  id: 'azure-expressroute',
  name: 'Azure ExpressRoute',
  description: 'Dedicated private connection to Azure with ExpressRoute',
  categories: ['azure', 'networking'],
  complexity: 'advanced',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/hybrid-networking/expressroute',
  tags: ['expressroute', 'hybrid', 'networking', 'private-connectivity', 'enterprise'],
  isBuiltIn: true,
  nodes: [
    { id: 'datacenter', type: 'rectangle', position: { x: 50, y: 150 }, data: { label: 'On-Prem Datacenter', type: 'rectangle' } },
    { id: 'edge-router', type: 'rectangle', position: { x: 200, y: 150 }, data: { label: 'Edge Router', type: 'rectangle' } },
    { id: 'expressroute', type: 'azure-expressroute', position: { x: 350, y: 150 }, data: { label: 'ExpressRoute', type: 'azure-expressroute' } },
    { id: 'er-gateway', type: 'azure-vpn-gateway', position: { x: 500, y: 150 }, data: { label: 'ER Gateway', type: 'azure-vpn-gateway' } },
    { id: 'hub-vnet', type: 'azure-vnet', position: { x: 650, y: 150 }, data: { label: 'Hub VNet', type: 'azure-vnet' } },
    { id: 'spoke-1', type: 'azure-vnet', position: { x: 650, y: 50 }, data: { label: 'Spoke 1', type: 'azure-vnet' } },
    { id: 'spoke-2', type: 'azure-vnet', position: { x: 650, y: 250 }, data: { label: 'Spoke 2', type: 'azure-vnet' } },
  ],
  edges: [
    { id: 'e1', source: 'datacenter', target: 'edge-router', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'edge-router', target: 'expressroute', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'expressroute', target: 'er-gateway', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'er-gateway', target: 'hub-vnet', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'hub-vnet', target: 'spoke-1', sourceHandle: 'top', targetHandle: 'bottom' },
    { id: 'e6', source: 'hub-vnet', target: 'spoke-2', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

const azureBackupSiteRecovery: ArchitectureTemplate = {
  id: 'azure-backup-site-recovery',
  name: 'Azure Backup & Site Recovery',
  description: 'Data protection with Azure Backup and Site Recovery',
  categories: ['azure', 'security'],
  complexity: 'intermediate',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/articles/disaster-recovery-enterprise-scale-dr',
  tags: ['backup', 'site-recovery', 'bcdr', 'data-protection', 'disaster-recovery'],
  isBuiltIn: true,
  nodes: [
    { id: 'vms', type: 'azure-vm', position: { x: 50, y: 100 }, data: { label: 'Azure VMs', type: 'azure-vm' } },
    { id: 'sql', type: 'azure-sql', position: { x: 50, y: 200 }, data: { label: 'SQL Database', type: 'azure-sql' } },
    { id: 'files', type: 'azure-storage', position: { x: 50, y: 300 }, data: { label: 'File Shares', type: 'azure-storage' } },
    { id: 'backup-vault', type: 'azure-backup', position: { x: 250, y: 200 }, data: { label: 'Backup Vault', type: 'azure-backup' } },
    { id: 'recovery-vault', type: 'azure-backup', position: { x: 400, y: 200 }, data: { label: 'Recovery Services', type: 'azure-backup' } },
    { id: 'secondary-region', type: 'rectangle', position: { x: 550, y: 200 }, data: { label: 'Secondary Region', type: 'rectangle' } },
    { id: 'policy', type: 'azure-policy', position: { x: 325, y: 50 }, data: { label: 'Backup Policy', type: 'azure-policy' } },
  ],
  edges: [
    { id: 'e1', source: 'vms', target: 'backup-vault', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'sql', target: 'backup-vault', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'files', target: 'backup-vault', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'backup-vault', target: 'recovery-vault', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'recovery-vault', target: 'secondary-region', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'policy', target: 'backup-vault', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

const azureMediaServices: ArchitectureTemplate = {
  id: 'azure-media-services',
  name: 'Azure Media Services',
  description: 'Video streaming and encoding with Azure Media Services',
  categories: ['azure', 'web-app'],
  complexity: 'intermediate',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/articles/digital-media-video',
  tags: ['media-services', 'video', 'streaming', 'encoding', 'cdn'],
  isBuiltIn: true,
  nodes: [
    { id: 'upload', type: 'rectangle', position: { x: 50, y: 150 }, data: { label: 'Video Upload', type: 'rectangle' } },
    { id: 'storage', type: 'azure-storage', position: { x: 200, y: 150 }, data: { label: 'Blob Storage', type: 'azure-storage' } },
    { id: 'media-services', type: 'azure-media-services', position: { x: 350, y: 150 }, data: { label: 'Media Services', type: 'azure-media-services' } },
    { id: 'encoding', type: 'azure-media-services', position: { x: 350, y: 280 }, data: { label: 'Encoding', type: 'azure-media-services' } },
    { id: 'cdn', type: 'azure-cdn', position: { x: 500, y: 150 }, data: { label: 'Azure CDN', type: 'azure-cdn' } },
    { id: 'player', type: 'users', position: { x: 650, y: 150 }, data: { label: 'Video Players', type: 'users' } },
    { id: 'drm', type: 'azure-keyvault', position: { x: 500, y: 280 }, data: { label: 'DRM/Key Vault', type: 'azure-keyvault' } },
  ],
  edges: [
    { id: 'e1', source: 'upload', target: 'storage', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'storage', target: 'media-services', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'media-services', target: 'encoding', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e4', source: 'media-services', target: 'cdn', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'cdn', target: 'player', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'cdn', target: 'drm', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

const azureBatchProcessing: ArchitectureTemplate = {
  id: 'azure-batch-processing',
  name: 'Azure Batch Processing',
  description: 'Large-scale parallel computing with Azure Batch',
  categories: ['azure', 'data-analytics'],
  complexity: 'advanced',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/articles/big-compute-with-azure-batch',
  tags: ['batch', 'hpc', 'parallel-computing', 'big-compute', 'rendering'],
  isBuiltIn: true,
  nodes: [
    { id: 'input-data', type: 'azure-storage', position: { x: 50, y: 150 }, data: { label: 'Input Data', type: 'azure-storage' } },
    { id: 'batch-account', type: 'azure-batch', position: { x: 250, y: 150 }, data: { label: 'Batch Account', type: 'azure-batch' } },
    { id: 'pool-1', type: 'azure-vm', position: { x: 400, y: 80 }, data: { label: 'Compute Pool 1', type: 'azure-vm' } },
    { id: 'pool-2', type: 'azure-vm', position: { x: 400, y: 150 }, data: { label: 'Compute Pool 2', type: 'azure-vm' } },
    { id: 'pool-3', type: 'azure-vm', position: { x: 400, y: 220 }, data: { label: 'Compute Pool 3', type: 'azure-vm' } },
    { id: 'output-data', type: 'azure-storage', position: { x: 550, y: 150 }, data: { label: 'Output Data', type: 'azure-storage' } },
    { id: 'monitor', type: 'azure-monitor', position: { x: 250, y: 280 }, data: { label: 'Monitor', type: 'azure-monitor' } },
  ],
  edges: [
    { id: 'e1', source: 'input-data', target: 'batch-account', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'batch-account', target: 'pool-1', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'batch-account', target: 'pool-2', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'batch-account', target: 'pool-3', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'pool-1', target: 'output-data', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'pool-2', target: 'output-data', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e7', source: 'pool-3', target: 'output-data', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e8', source: 'batch-account', target: 'monitor', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

const azureServiceFabric: ArchitectureTemplate = {
  id: 'azure-service-fabric',
  name: 'Azure Service Fabric',
  description: 'Microservices platform with Service Fabric clusters',
  categories: ['azure', 'containers'],
  complexity: 'advanced',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/microservices/service-fabric',
  tags: ['service-fabric', 'microservices', 'stateful', 'distributed', 'cluster'],
  isBuiltIn: true,
  nodes: [
    { id: 'users', type: 'users', position: { x: 50, y: 150 }, data: { label: 'Users', type: 'users' } },
    { id: 'api-mgmt', type: 'azure-api-management', position: { x: 200, y: 150 }, data: { label: 'API Management', type: 'azure-api-management' } },
    { id: 'sf-cluster', type: 'azure-service-fabric', position: { x: 400, y: 150 }, data: { label: 'Service Fabric Cluster', type: 'azure-service-fabric' } },
    { id: 'stateless', type: 'azure-service-fabric', position: { x: 350, y: 50 }, data: { label: 'Stateless Services', type: 'azure-service-fabric' } },
    { id: 'stateful', type: 'azure-service-fabric', position: { x: 450, y: 50 }, data: { label: 'Stateful Services', type: 'azure-service-fabric' } },
    { id: 'cosmos', type: 'azure-cosmos', position: { x: 600, y: 100 }, data: { label: 'Cosmos DB', type: 'azure-cosmos' } },
    { id: 'keyvault', type: 'azure-keyvault', position: { x: 600, y: 200 }, data: { label: 'Key Vault', type: 'azure-keyvault' } },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'api-mgmt', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'api-mgmt', target: 'sf-cluster', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'sf-cluster', target: 'stateless', sourceHandle: 'top', targetHandle: 'bottom' },
    { id: 'e4', source: 'sf-cluster', target: 'stateful', sourceHandle: 'top', targetHandle: 'bottom' },
    { id: 'e5', source: 'stateful', target: 'cosmos', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'sf-cluster', target: 'keyvault', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

// ============================================================================
// Additional Azure Architecture Templates (Based on Azure Architecture Center)
// ============================================================================

// --- AI & Machine Learning Category ---

const azureRAGPattern: ArchitectureTemplate = {
  id: 'azure-rag-pattern',
  name: 'RAG Pattern with Azure OpenAI',
  description: 'Retrieval-Augmented Generation pattern using Azure OpenAI and AI Search for grounded responses',
  categories: ['azure', 'ai-ml'],
  complexity: 'advanced',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/rag/rag-solution-design-and-evaluation-guide',
  tags: ['openai', 'rag', 'ai-search', 'embeddings', 'llm'],
  useCases: ['chatbot', 'document-qa', 'enterprise-search'],
  isBuiltIn: true,
  nodes: [
    { id: 'users', type: 'users', position: { x: 50, y: 150 }, data: { label: 'Users', type: 'users' } },
    { id: 'app-service', type: 'azure-app-service', position: { x: 200, y: 150 }, data: { label: 'Web App', type: 'azure-app-service' } },
    { id: 'openai', type: 'azure-openai', position: { x: 400, y: 100 }, data: { label: 'Azure OpenAI', type: 'azure-openai' } },
    { id: 'ai-search', type: 'azure-cognitive-search', position: { x: 400, y: 200 }, data: { label: 'AI Search', type: 'azure-cognitive-search' } },
    { id: 'storage', type: 'azure-storage', position: { x: 600, y: 200 }, data: { label: 'Blob Storage', type: 'azure-storage' } },
    { id: 'cosmos', type: 'azure-cosmos', position: { x: 600, y: 100 }, data: { label: 'Cosmos DB', type: 'azure-cosmos' } },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'app-service', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'app-service', target: 'openai', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'app-service', target: 'ai-search', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'ai-search', target: 'storage', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'openai', target: 'cosmos', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

const azureMLOps: ArchitectureTemplate = {
  id: 'azure-mlops',
  name: 'MLOps with Azure Machine Learning',
  description: 'End-to-end ML lifecycle management with Azure Machine Learning and DevOps integration',
  categories: ['azure', 'ai-ml', 'devops'],
  complexity: 'advanced',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/mlops-technical-paper',
  tags: ['mlops', 'machine-learning', 'devops', 'model-training'],
  useCases: ['ml-pipeline', 'model-deployment', 'experiment-tracking'],
  isBuiltIn: true,
  nodes: [
    { id: 'devops', type: 'azure-devops', position: { x: 50, y: 150 }, data: { label: 'Azure DevOps', type: 'azure-devops' } },
    { id: 'ml-workspace', type: 'azure-machine-learning', position: { x: 250, y: 150 }, data: { label: 'ML Workspace', type: 'azure-machine-learning' } },
    { id: 'compute', type: 'azure-vm', position: { x: 450, y: 80 }, data: { label: 'Compute Cluster', type: 'azure-vm' } },
    { id: 'storage', type: 'azure-storage', position: { x: 450, y: 220 }, data: { label: 'Data Storage', type: 'azure-storage' } },
    { id: 'registry', type: 'azure-container-registry', position: { x: 650, y: 150 }, data: { label: 'Container Registry', type: 'azure-container-registry' } },
    { id: 'aks', type: 'azure-aks', position: { x: 850, y: 150 }, data: { label: 'AKS Deployment', type: 'azure-aks' } },
  ],
  edges: [
    { id: 'e1', source: 'devops', target: 'ml-workspace', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'ml-workspace', target: 'compute', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'ml-workspace', target: 'storage', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'ml-workspace', target: 'registry', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'registry', target: 'aks', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

const azureFoundryChat: ArchitectureTemplate = {
  id: 'azure-foundry-chat',
  name: 'Baseline Foundry Chat Architecture',
  description: 'Enterprise chat application using Azure AI Foundry with OpenAI GPT models',
  categories: ['azure', 'ai-ml'],
  complexity: 'advanced',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/ai-ml/architecture/baseline-microsoft-foundry-chat',
  tags: ['foundry', 'chat', 'openai', 'enterprise', 'ai'],
  useCases: ['enterprise-chat', 'ai-assistant', 'copilot'],
  isBuiltIn: true,
  nodes: [
    { id: 'users', type: 'users', position: { x: 50, y: 150 }, data: { label: 'Users', type: 'users' } },
    { id: 'front-door', type: 'azure-front-door', position: { x: 200, y: 150 }, data: { label: 'Front Door', type: 'azure-front-door' } },
    { id: 'app-service', type: 'azure-app-service', position: { x: 400, y: 150 }, data: { label: 'App Service', type: 'azure-app-service' } },
    { id: 'foundry', type: 'azure-openai', position: { x: 600, y: 100 }, data: { label: 'AI Foundry', type: 'azure-openai' } },
    { id: 'ai-search', type: 'azure-cognitive-search', position: { x: 600, y: 200 }, data: { label: 'AI Search', type: 'azure-cognitive-search' } },
    { id: 'cosmos', type: 'azure-cosmos', position: { x: 800, y: 150 }, data: { label: 'Cosmos DB', type: 'azure-cosmos' } },
    { id: 'keyvault', type: 'azure-keyvault', position: { x: 400, y: 280 }, data: { label: 'Key Vault', type: 'azure-keyvault' } },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'front-door', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'front-door', target: 'app-service', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'app-service', target: 'foundry', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'app-service', target: 'ai-search', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'foundry', target: 'cosmos', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'app-service', target: 'keyvault', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

const azureCognitiveServices: ArchitectureTemplate = {
  id: 'azure-cognitive-services',
  name: 'Azure AI Services Integration',
  description: 'Multi-modal AI application using Azure Cognitive Services for vision, speech, and language',
  categories: ['azure', 'ai-ml'],
  complexity: 'intermediate',
  tags: ['cognitive-services', 'vision', 'speech', 'language', 'ai'],
  useCases: ['document-processing', 'speech-recognition', 'image-analysis'],
  isBuiltIn: true,
  nodes: [
    { id: 'app', type: 'azure-app-service', position: { x: 50, y: 150 }, data: { label: 'Application', type: 'azure-app-service' } },
    { id: 'vision', type: 'azure-cognitive', position: { x: 250, y: 50 }, data: { label: 'Computer Vision', type: 'azure-cognitive' } },
    { id: 'speech', type: 'azure-cognitive', position: { x: 250, y: 150 }, data: { label: 'Speech Service', type: 'azure-cognitive' } },
    { id: 'language', type: 'azure-cognitive', position: { x: 250, y: 250 }, data: { label: 'Language Service', type: 'azure-cognitive' } },
    { id: 'form-recognizer', type: 'azure-cognitive', position: { x: 450, y: 100 }, data: { label: 'Form Recognizer', type: 'azure-cognitive' } },
    { id: 'translator', type: 'azure-cognitive', position: { x: 450, y: 200 }, data: { label: 'Translator', type: 'azure-cognitive' } },
  ],
  edges: [
    { id: 'e1', source: 'app', target: 'vision', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'app', target: 'speech', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'app', target: 'language', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'vision', target: 'form-recognizer', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'language', target: 'translator', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

const azureDocumentIntelligence: ArchitectureTemplate = {
  id: 'azure-document-intelligence',
  name: 'Document Intelligence Pipeline',
  description: 'Automated document processing pipeline with Azure AI Document Intelligence',
  categories: ['azure', 'ai-ml'],
  complexity: 'intermediate',
  tags: ['document-intelligence', 'ocr', 'form-recognition', 'automation'],
  useCases: ['invoice-processing', 'contract-analysis', 'form-extraction'],
  isBuiltIn: true,
  nodes: [
    { id: 'storage-in', type: 'azure-storage', position: { x: 50, y: 150 }, data: { label: 'Document Upload', type: 'azure-storage' } },
    { id: 'event-grid', type: 'azure-event-grid', position: { x: 200, y: 150 }, data: { label: 'Event Grid', type: 'azure-event-grid' } },
    { id: 'functions', type: 'azure-functions', position: { x: 350, y: 150 }, data: { label: 'Functions', type: 'azure-functions' } },
    { id: 'doc-intel', type: 'azure-cognitive', position: { x: 500, y: 150 }, data: { label: 'Document Intelligence', type: 'azure-cognitive' } },
    { id: 'cosmos', type: 'azure-cosmos', position: { x: 650, y: 100 }, data: { label: 'Cosmos DB', type: 'azure-cosmos' } },
    { id: 'logic-app', type: 'azure-logic-apps', position: { x: 650, y: 200 }, data: { label: 'Logic Apps', type: 'azure-logic-apps' } },
  ],
  edges: [
    { id: 'e1', source: 'storage-in', target: 'event-grid', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'event-grid', target: 'functions', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'functions', target: 'doc-intel', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'doc-intel', target: 'cosmos', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'doc-intel', target: 'logic-app', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

// --- Analytics & Data Category ---

const azureRealTimeAnalytics: ArchitectureTemplate = {
  id: 'azure-realtime-analytics',
  name: 'Real-Time Analytics with Data Explorer',
  description: 'Real-time data analytics using Azure Data Explorer for IoT and telemetry data',
  categories: ['azure', 'data-analytics'],
  complexity: 'advanced',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/articles/analytics-start-here',
  tags: ['data-explorer', 'real-time', 'analytics', 'telemetry'],
  useCases: ['iot-analytics', 'log-analytics', 'telemetry-analysis'],
  isBuiltIn: true,
  nodes: [
    { id: 'iot-hub', type: 'azure-iot-hub', position: { x: 50, y: 150 }, data: { label: 'IoT Hub', type: 'azure-iot-hub' } },
    { id: 'event-hub', type: 'azure-event-hub', position: { x: 200, y: 150 }, data: { label: 'Event Hubs', type: 'azure-event-hub' } },
    { id: 'adx', type: 'azure-data-explorer', position: { x: 400, y: 150 }, data: { label: 'Data Explorer', type: 'azure-data-explorer' } },
    { id: 'power-bi', type: 'azure-power-bi', position: { x: 600, y: 100 }, data: { label: 'Power BI', type: 'azure-power-bi' } },
    { id: 'storage', type: 'azure-storage', position: { x: 600, y: 200 }, data: { label: 'Data Lake', type: 'azure-storage' } },
  ],
  edges: [
    { id: 'e1', source: 'iot-hub', target: 'event-hub', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'event-hub', target: 'adx', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'adx', target: 'power-bi', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'adx', target: 'storage', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

const azureDatabricksLakehouse: ArchitectureTemplate = {
  id: 'azure-databricks-lakehouse',
  name: 'Databricks Lakehouse Architecture',
  description: 'Modern lakehouse architecture using Azure Databricks for unified analytics',
  categories: ['azure', 'data-analytics'],
  complexity: 'advanced',
  tags: ['databricks', 'lakehouse', 'delta-lake', 'spark'],
  useCases: ['data-warehouse', 'ml-platform', 'bi-analytics'],
  isBuiltIn: true,
  nodes: [
    { id: 'sources', type: 'rectangle', position: { x: 50, y: 150 }, data: { label: 'Data Sources', type: 'rectangle' } },
    { id: 'data-factory', type: 'azure-data-factory', position: { x: 200, y: 150 }, data: { label: 'Data Factory', type: 'azure-data-factory' } },
    { id: 'adls', type: 'azure-storage', position: { x: 350, y: 150 }, data: { label: 'ADLS Gen2', type: 'azure-storage' } },
    { id: 'databricks', type: 'azure-databricks', position: { x: 500, y: 150 }, data: { label: 'Databricks', type: 'azure-databricks' } },
    { id: 'synapse', type: 'azure-synapse', position: { x: 650, y: 100 }, data: { label: 'Synapse', type: 'azure-synapse' } },
    { id: 'power-bi', type: 'azure-power-bi', position: { x: 800, y: 150 }, data: { label: 'Power BI', type: 'azure-power-bi' } },
  ],
  edges: [
    { id: 'e1', source: 'sources', target: 'data-factory', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'data-factory', target: 'adls', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'adls', target: 'databricks', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'databricks', target: 'synapse', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'synapse', target: 'power-bi', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

const azureStreamAnalytics: ArchitectureTemplate = {
  id: 'azure-stream-processing',
  name: 'Stream Processing with Stream Analytics',
  description: 'Real-time stream processing using Azure Stream Analytics for event-driven analytics',
  categories: ['azure', 'data-analytics'],
  complexity: 'intermediate',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/data/stream-processing-stream-analytics',
  tags: ['stream-analytics', 'real-time', 'event-processing'],
  useCases: ['fraud-detection', 'anomaly-detection', 'real-time-dashboards'],
  isBuiltIn: true,
  nodes: [
    { id: 'event-hub', type: 'azure-event-hub', position: { x: 50, y: 150 }, data: { label: 'Event Hubs', type: 'azure-event-hub' } },
    { id: 'stream-analytics', type: 'azure-stream-analytics', position: { x: 250, y: 150 }, data: { label: 'Stream Analytics', type: 'azure-stream-analytics' } },
    { id: 'cosmos', type: 'azure-cosmos', position: { x: 450, y: 80 }, data: { label: 'Cosmos DB', type: 'azure-cosmos' } },
    { id: 'sql', type: 'azure-sql', position: { x: 450, y: 150 }, data: { label: 'Azure SQL', type: 'azure-sql' } },
    { id: 'power-bi', type: 'azure-power-bi', position: { x: 450, y: 220 }, data: { label: 'Power BI', type: 'azure-power-bi' } },
    { id: 'functions', type: 'azure-functions', position: { x: 650, y: 150 }, data: { label: 'Functions', type: 'azure-functions' } },
  ],
  edges: [
    { id: 'e1', source: 'event-hub', target: 'stream-analytics', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'stream-analytics', target: 'cosmos', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'stream-analytics', target: 'sql', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'stream-analytics', target: 'power-bi', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'cosmos', target: 'functions', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

const azureModernDataWarehouse: ArchitectureTemplate = {
  id: 'azure-modern-data-warehouse',
  name: 'Modern Data Warehouse',
  description: 'Enterprise data warehouse using Azure Synapse Analytics with modern architecture patterns',
  categories: ['azure', 'data-analytics'],
  complexity: 'advanced',
  tags: ['synapse', 'data-warehouse', 'analytics', 'enterprise'],
  useCases: ['enterprise-bi', 'data-consolidation', 'analytics-platform'],
  isBuiltIn: true,
  nodes: [
    { id: 'erp', type: 'rectangle', position: { x: 50, y: 80 }, data: { label: 'ERP Systems', type: 'rectangle' } },
    { id: 'crm', type: 'rectangle', position: { x: 50, y: 160 }, data: { label: 'CRM Systems', type: 'rectangle' } },
    { id: 'files', type: 'rectangle', position: { x: 50, y: 240 }, data: { label: 'Files/APIs', type: 'rectangle' } },
    { id: 'data-factory', type: 'azure-data-factory', position: { x: 220, y: 160 }, data: { label: 'Data Factory', type: 'azure-data-factory' } },
    { id: 'adls', type: 'azure-storage', position: { x: 400, y: 160 }, data: { label: 'Data Lake', type: 'azure-storage' } },
    { id: 'synapse', type: 'azure-synapse', position: { x: 580, y: 160 }, data: { label: 'Synapse Analytics', type: 'azure-synapse' } },
    { id: 'power-bi', type: 'azure-power-bi', position: { x: 760, y: 160 }, data: { label: 'Power BI', type: 'azure-power-bi' } },
  ],
  edges: [
    { id: 'e1', source: 'erp', target: 'data-factory', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'crm', target: 'data-factory', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'files', target: 'data-factory', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'data-factory', target: 'adls', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'adls', target: 'synapse', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'synapse', target: 'power-bi', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

const azurePurviewGovernance: ArchitectureTemplate = {
  id: 'azure-purview-governance',
  name: 'Data Governance with Microsoft Purview',
  description: 'Enterprise data governance and cataloging using Microsoft Purview',
  categories: ['azure', 'data-analytics', 'security'],
  complexity: 'advanced',
  tags: ['purview', 'data-governance', 'data-catalog', 'compliance'],
  useCases: ['data-discovery', 'data-lineage', 'compliance-reporting'],
  isBuiltIn: true,
  nodes: [
    { id: 'sql', type: 'azure-sql', position: { x: 50, y: 80 }, data: { label: 'Azure SQL', type: 'azure-sql' } },
    { id: 'synapse', type: 'azure-synapse', position: { x: 50, y: 160 }, data: { label: 'Synapse', type: 'azure-synapse' } },
    { id: 'adls', type: 'azure-storage', position: { x: 50, y: 240 }, data: { label: 'Data Lake', type: 'azure-storage' } },
    { id: 'purview', type: 'azure-purview', position: { x: 300, y: 160 }, data: { label: 'Microsoft Purview', type: 'azure-purview' } },
    { id: 'entra', type: 'azure-entra-id', position: { x: 500, y: 100 }, data: { label: 'Entra ID', type: 'azure-entra-id' } },
    { id: 'users', type: 'users', position: { x: 500, y: 220 }, data: { label: 'Data Stewards', type: 'users' } },
  ],
  edges: [
    { id: 'e1', source: 'sql', target: 'purview', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'synapse', target: 'purview', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'adls', target: 'purview', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'purview', target: 'entra', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'purview', target: 'users', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

// --- Containers & Kubernetes Category ---

const azureAKSBaseline: ArchitectureTemplate = {
  id: 'azure-aks-baseline',
  name: 'AKS Baseline Cluster',
  description: 'Production-ready AKS baseline cluster with security and networking best practices',
  categories: ['azure', 'containers'],
  complexity: 'advanced',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/containers/aks/baseline-aks',
  tags: ['aks', 'kubernetes', 'baseline', 'production'],
  useCases: ['container-platform', 'microservices', 'enterprise-kubernetes'],
  isBuiltIn: true,
  nodes: [
    { id: 'users', type: 'users', position: { x: 50, y: 150 }, data: { label: 'Users', type: 'users' } },
    { id: 'front-door', type: 'azure-front-door', position: { x: 200, y: 150 }, data: { label: 'Front Door', type: 'azure-front-door' } },
    { id: 'app-gw', type: 'azure-app-gateway', position: { x: 350, y: 150 }, data: { label: 'App Gateway', type: 'azure-app-gateway' } },
    { id: 'aks', type: 'azure-aks', position: { x: 500, y: 150 }, data: { label: 'AKS Cluster', type: 'azure-aks' } },
    { id: 'acr', type: 'azure-container-registry', position: { x: 650, y: 80 }, data: { label: 'Container Registry', type: 'azure-container-registry' } },
    { id: 'keyvault', type: 'azure-keyvault', position: { x: 650, y: 220 }, data: { label: 'Key Vault', type: 'azure-keyvault' } },
    { id: 'monitor', type: 'azure-monitor', position: { x: 500, y: 280 }, data: { label: 'Azure Monitor', type: 'azure-monitor' } },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'front-door', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'front-door', target: 'app-gw', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'app-gw', target: 'aks', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'aks', target: 'acr', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'aks', target: 'keyvault', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'aks', target: 'monitor', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

const azureAKSMultiRegion: ArchitectureTemplate = {
  id: 'azure-aks-multi-region',
  name: 'Multi-Region AKS Architecture',
  description: 'High availability AKS deployment across multiple Azure regions',
  categories: ['azure', 'containers'],
  complexity: 'advanced',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/containers/aks-multi-region/aks-multi-cluster',
  tags: ['aks', 'multi-region', 'high-availability', 'disaster-recovery'],
  useCases: ['global-applications', 'disaster-recovery', 'ha-kubernetes'],
  isBuiltIn: true,
  nodes: [
    { id: 'traffic-mgr', type: 'azure-traffic-manager', position: { x: 300, y: 50 }, data: { label: 'Traffic Manager', type: 'azure-traffic-manager' } },
    { id: 'aks-east', type: 'azure-aks', position: { x: 150, y: 180 }, data: { label: 'AKS East', type: 'azure-aks' } },
    { id: 'aks-west', type: 'azure-aks', position: { x: 450, y: 180 }, data: { label: 'AKS West', type: 'azure-aks' } },
    { id: 'cosmos', type: 'azure-cosmos', position: { x: 300, y: 300 }, data: { label: 'Cosmos DB\n(Global)', type: 'azure-cosmos' } },
    { id: 'acr', type: 'azure-container-registry', position: { x: 300, y: 180 }, data: { label: 'ACR\n(Geo-Replicated)', type: 'azure-container-registry' } },
  ],
  edges: [
    { id: 'e1', source: 'traffic-mgr', target: 'aks-east', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e2', source: 'traffic-mgr', target: 'aks-west', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e3', source: 'aks-east', target: 'cosmos', sourceHandle: 'bottom', targetHandle: 'left' },
    { id: 'e4', source: 'aks-west', target: 'cosmos', sourceHandle: 'bottom', targetHandle: 'right' },
    { id: 'e5', source: 'aks-east', target: 'acr', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'aks-west', target: 'acr', sourceHandle: 'left', targetHandle: 'right' },
  ],
}

const azureRedHatOpenShift: ArchitectureTemplate = {
  id: 'azure-redhat-openshift',
  name: 'Azure Red Hat OpenShift',
  description: 'Enterprise Kubernetes with Azure Red Hat OpenShift for regulated workloads',
  categories: ['azure', 'containers'],
  complexity: 'advanced',
  tags: ['openshift', 'redhat', 'enterprise', 'kubernetes'],
  useCases: ['regulated-workloads', 'enterprise-platform', 'hybrid-cloud'],
  isBuiltIn: true,
  nodes: [
    { id: 'users', type: 'users', position: { x: 50, y: 150 }, data: { label: 'Developers', type: 'users' } },
    { id: 'bastion', type: 'azure-vm', position: { x: 200, y: 150 }, data: { label: 'Bastion Host', type: 'azure-vm' } },
    { id: 'aro', type: 'azure-aks', position: { x: 400, y: 150 }, data: { label: 'ARO Cluster', type: 'azure-aks' } },
    { id: 'storage', type: 'azure-storage', position: { x: 600, y: 100 }, data: { label: 'Azure Storage', type: 'azure-storage' } },
    { id: 'sql', type: 'azure-sql', position: { x: 600, y: 200 }, data: { label: 'Azure SQL', type: 'azure-sql' } },
    { id: 'entra', type: 'azure-entra-id', position: { x: 400, y: 280 }, data: { label: 'Entra ID', type: 'azure-entra-id' } },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'bastion', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'bastion', target: 'aro', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'aro', target: 'storage', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'aro', target: 'sql', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'aro', target: 'entra', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

const azureGitOpsAKS: ArchitectureTemplate = {
  id: 'azure-gitops-aks',
  name: 'GitOps for AKS with Flux',
  description: 'GitOps workflow for AKS using Flux CD for continuous deployment',
  categories: ['azure', 'containers', 'devops'],
  complexity: 'intermediate',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/example-scenario/gitops-aks/gitops-blueprint-aks',
  tags: ['gitops', 'flux', 'aks', 'continuous-deployment'],
  useCases: ['automated-deployment', 'infrastructure-as-code', 'kubernetes-cd'],
  isBuiltIn: true,
  nodes: [
    { id: 'github', type: 'rectangle', position: { x: 50, y: 150 }, data: { label: 'GitHub Repo', type: 'rectangle' } },
    { id: 'devops', type: 'azure-devops', position: { x: 200, y: 150 }, data: { label: 'Azure DevOps', type: 'azure-devops' } },
    { id: 'acr', type: 'azure-container-registry', position: { x: 350, y: 150 }, data: { label: 'ACR', type: 'azure-container-registry' } },
    { id: 'aks', type: 'azure-aks', position: { x: 500, y: 150 }, data: { label: 'AKS + Flux', type: 'azure-aks' } },
    { id: 'keyvault', type: 'azure-keyvault', position: { x: 500, y: 280 }, data: { label: 'Key Vault', type: 'azure-keyvault' } },
  ],
  edges: [
    { id: 'e1', source: 'github', target: 'devops', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'devops', target: 'acr', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'acr', target: 'aks', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'github', target: 'aks', sourceHandle: 'right', targetHandle: 'left', label: 'GitOps Sync' },
    { id: 'e5', source: 'aks', target: 'keyvault', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

// --- Hybrid & Multicloud Category ---

const azureArcKubernetes: ArchitectureTemplate = {
  id: 'azure-arc-kubernetes',
  name: 'Azure Arc-enabled Kubernetes',
  description: 'Manage hybrid Kubernetes clusters with Azure Arc for unified governance',
  categories: ['azure', 'containers'],
  complexity: 'advanced',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/hybrid/arc-hybrid-kubernetes',
  tags: ['arc', 'hybrid', 'kubernetes', 'multi-cloud'],
  useCases: ['hybrid-kubernetes', 'multi-cloud-management', 'edge-kubernetes'],
  isBuiltIn: true,
  nodes: [
    { id: 'azure', type: 'rectangle', position: { x: 300, y: 50 }, data: { label: 'Azure Cloud', type: 'rectangle' } },
    { id: 'arc', type: 'azure-arc', position: { x: 300, y: 130 }, data: { label: 'Azure Arc', type: 'azure-arc' } },
    { id: 'aks', type: 'azure-aks', position: { x: 150, y: 230 }, data: { label: 'AKS', type: 'azure-aks' } },
    { id: 'onprem-k8s', type: 'rectangle', position: { x: 300, y: 230 }, data: { label: 'On-Prem K8s', type: 'rectangle' } },
    { id: 'aws-eks', type: 'aws-eks', position: { x: 450, y: 230 }, data: { label: 'AWS EKS', type: 'aws-eks' } },
    { id: 'policy', type: 'azure-policy', position: { x: 150, y: 130 }, data: { label: 'Azure Policy', type: 'azure-policy' } },
    { id: 'monitor', type: 'azure-monitor', position: { x: 450, y: 130 }, data: { label: 'Azure Monitor', type: 'azure-monitor' } },
  ],
  edges: [
    { id: 'e1', source: 'arc', target: 'aks', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e2', source: 'arc', target: 'onprem-k8s', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e3', source: 'arc', target: 'aws-eks', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e4', source: 'policy', target: 'arc', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'arc', target: 'monitor', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

const azureLocalBaseline: ArchitectureTemplate = {
  id: 'azure-local-baseline',
  name: 'Azure Local Baseline',
  description: 'Hybrid infrastructure with Azure Local (formerly Azure Stack HCI)',
  categories: ['azure', 'networking'],
  complexity: 'advanced',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/hybrid/azure-local-baseline',
  tags: ['azure-local', 'hybrid', 'hci', 'on-premises'],
  useCases: ['hybrid-datacenter', 'edge-computing', 'vdi'],
  isBuiltIn: true,
  nodes: [
    { id: 'azure-portal', type: 'rectangle', position: { x: 300, y: 50 }, data: { label: 'Azure Portal', type: 'rectangle' } },
    { id: 'arc', type: 'azure-arc', position: { x: 300, y: 130 }, data: { label: 'Azure Arc', type: 'azure-arc' } },
    { id: 'azure-local', type: 'azure-stack', position: { x: 300, y: 230 }, data: { label: 'Azure Local', type: 'azure-stack' } },
    { id: 'storage', type: 'rectangle', position: { x: 150, y: 230 }, data: { label: 'Storage Spaces', type: 'rectangle' } },
    { id: 'network', type: 'rectangle', position: { x: 450, y: 230 }, data: { label: 'SDN', type: 'rectangle' } },
    { id: 'vms', type: 'azure-vm', position: { x: 300, y: 330 }, data: { label: 'VMs/AKS', type: 'azure-vm' } },
  ],
  edges: [
    { id: 'e1', source: 'azure-portal', target: 'arc', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e2', source: 'arc', target: 'azure-local', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e3', source: 'azure-local', target: 'storage', sourceHandle: 'left', targetHandle: 'right' },
    { id: 'e4', source: 'azure-local', target: 'network', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'azure-local', target: 'vms', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

const azureExpressRoutePrivate: ArchitectureTemplate = {
  id: 'azure-expressroute-private',
  name: 'ExpressRoute Private Connectivity',
  description: 'Private hybrid connectivity using Azure ExpressRoute with private peering',
  categories: ['azure', 'networking'],
  complexity: 'advanced',
  tags: ['expressroute', 'hybrid', 'private-connectivity', 'networking'],
  useCases: ['hybrid-connectivity', 'low-latency', 'private-network'],
  isBuiltIn: true,
  nodes: [
    { id: 'onprem', type: 'rectangle', position: { x: 50, y: 150 }, data: { label: 'On-Premises DC', type: 'rectangle' } },
    { id: 'edge-router', type: 'rectangle', position: { x: 200, y: 150 }, data: { label: 'Edge Router', type: 'rectangle' } },
    { id: 'expressroute', type: 'azure-expressroute', position: { x: 350, y: 150 }, data: { label: 'ExpressRoute', type: 'azure-expressroute' } },
    { id: 'vnet-hub', type: 'azure-vnet', position: { x: 500, y: 150 }, data: { label: 'Hub VNet', type: 'azure-vnet' } },
    { id: 'vnet-spoke1', type: 'azure-vnet', position: { x: 650, y: 80 }, data: { label: 'Spoke VNet 1', type: 'azure-vnet' } },
    { id: 'vnet-spoke2', type: 'azure-vnet', position: { x: 650, y: 220 }, data: { label: 'Spoke VNet 2', type: 'azure-vnet' } },
  ],
  edges: [
    { id: 'e1', source: 'onprem', target: 'edge-router', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'edge-router', target: 'expressroute', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'expressroute', target: 'vnet-hub', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'vnet-hub', target: 'vnet-spoke1', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'vnet-hub', target: 'vnet-spoke2', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

// --- Web Applications Category ---

const azureEcommerceApp: ArchitectureTemplate = {
  id: 'azure-ecommerce-app',
  name: 'Scalable E-commerce Application',
  description: 'High-performance e-commerce application with Azure services',
  categories: ['azure', 'web-app'],
  complexity: 'advanced',
  tags: ['ecommerce', 'retail', 'scalable', 'web-app'],
  useCases: ['online-store', 'retail-platform', 'marketplace'],
  isBuiltIn: true,
  nodes: [
    { id: 'users', type: 'users', position: { x: 50, y: 150 }, data: { label: 'Customers', type: 'users' } },
    { id: 'cdn', type: 'azure-cdn', position: { x: 180, y: 150 }, data: { label: 'Azure CDN', type: 'azure-cdn' } },
    { id: 'front-door', type: 'azure-front-door', position: { x: 310, y: 150 }, data: { label: 'Front Door', type: 'azure-front-door' } },
    { id: 'app-service', type: 'azure-app-service', position: { x: 440, y: 150 }, data: { label: 'App Service', type: 'azure-app-service' } },
    { id: 'redis', type: 'azure-redis-cache', position: { x: 570, y: 80 }, data: { label: 'Redis Cache', type: 'azure-redis-cache' } },
    { id: 'cosmos', type: 'azure-cosmos', position: { x: 570, y: 150 }, data: { label: 'Cosmos DB', type: 'azure-cosmos' } },
    { id: 'search', type: 'azure-cognitive-search', position: { x: 570, y: 220 }, data: { label: 'AI Search', type: 'azure-cognitive-search' } },
    { id: 'storage', type: 'azure-storage', position: { x: 700, y: 150 }, data: { label: 'Blob Storage', type: 'azure-storage' } },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'cdn', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'cdn', target: 'front-door', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'front-door', target: 'app-service', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'app-service', target: 'redis', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'app-service', target: 'cosmos', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'app-service', target: 'search', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e7', source: 'cosmos', target: 'storage', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

const azureMultiTierHA: ArchitectureTemplate = {
  id: 'azure-multi-tier-ha',
  name: 'Multi-Tier HA/DR Architecture',
  description: 'Multi-tier application with high availability and disaster recovery',
  categories: ['azure', 'web-app'],
  complexity: 'advanced',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/example-scenario/infrastructure/multi-tier-app-disaster-recovery',
  tags: ['high-availability', 'disaster-recovery', 'multi-tier', 'enterprise'],
  useCases: ['enterprise-app', 'mission-critical', 'business-continuity'],
  isBuiltIn: true,
  nodes: [
    { id: 'traffic-mgr', type: 'azure-traffic-manager', position: { x: 300, y: 50 }, data: { label: 'Traffic Manager', type: 'azure-traffic-manager' } },
    { id: 'region1-app-gw', type: 'azure-app-gateway', position: { x: 150, y: 150 }, data: { label: 'App GW (Primary)', type: 'azure-app-gateway' } },
    { id: 'region2-app-gw', type: 'azure-app-gateway', position: { x: 450, y: 150 }, data: { label: 'App GW (Secondary)', type: 'azure-app-gateway' } },
    { id: 'region1-app', type: 'azure-app-service', position: { x: 150, y: 250 }, data: { label: 'App Service (Primary)', type: 'azure-app-service' } },
    { id: 'region2-app', type: 'azure-app-service', position: { x: 450, y: 250 }, data: { label: 'App Service (Secondary)', type: 'azure-app-service' } },
    { id: 'sql-primary', type: 'azure-sql', position: { x: 150, y: 350 }, data: { label: 'SQL (Primary)', type: 'azure-sql' } },
    { id: 'sql-secondary', type: 'azure-sql', position: { x: 450, y: 350 }, data: { label: 'SQL (Secondary)', type: 'azure-sql' } },
  ],
  edges: [
    { id: 'e1', source: 'traffic-mgr', target: 'region1-app-gw', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e2', source: 'traffic-mgr', target: 'region2-app-gw', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e3', source: 'region1-app-gw', target: 'region1-app', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e4', source: 'region2-app-gw', target: 'region2-app', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e5', source: 'region1-app', target: 'sql-primary', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e6', source: 'region2-app', target: 'sql-secondary', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e7', source: 'sql-primary', target: 'sql-secondary', sourceHandle: 'right', targetHandle: 'left', label: 'Geo-Replication' },
  ],
}

// --- IoT Category ---

const azureIoTReference: ArchitectureTemplate = {
  id: 'azure-iot-reference',
  name: 'Azure IoT Reference Architecture',
  description: 'Complete IoT solution with device management, analytics, and integration',
  categories: ['azure', 'iot'],
  complexity: 'advanced',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/iot',
  tags: ['iot', 'telemetry', 'device-management', 'edge'],
  useCases: ['industrial-iot', 'smart-building', 'asset-tracking'],
  isBuiltIn: true,
  nodes: [
    { id: 'devices', type: 'rectangle', position: { x: 50, y: 150 }, data: { label: 'IoT Devices', type: 'rectangle' } },
    { id: 'iot-edge', type: 'azure-iot-edge', position: { x: 180, y: 150 }, data: { label: 'IoT Edge', type: 'azure-iot-edge' } },
    { id: 'iot-hub', type: 'azure-iot-hub', position: { x: 310, y: 150 }, data: { label: 'IoT Hub', type: 'azure-iot-hub' } },
    { id: 'dps', type: 'azure-iot-dps', position: { x: 310, y: 50 }, data: { label: 'Device Provisioning', type: 'azure-iot-dps' } },
    { id: 'stream-analytics', type: 'azure-stream-analytics', position: { x: 440, y: 100 }, data: { label: 'Stream Analytics', type: 'azure-stream-analytics' } },
    { id: 'functions', type: 'azure-functions', position: { x: 440, y: 200 }, data: { label: 'Functions', type: 'azure-functions' } },
    { id: 'cosmos', type: 'azure-cosmos', position: { x: 570, y: 100 }, data: { label: 'Cosmos DB', type: 'azure-cosmos' } },
    { id: 'adls', type: 'azure-storage', position: { x: 570, y: 200 }, data: { label: 'Data Lake', type: 'azure-storage' } },
    { id: 'power-bi', type: 'azure-power-bi', position: { x: 700, y: 150 }, data: { label: 'Power BI', type: 'azure-power-bi' } },
  ],
  edges: [
    { id: 'e1', source: 'devices', target: 'iot-edge', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'iot-edge', target: 'iot-hub', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'dps', target: 'iot-hub', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e4', source: 'iot-hub', target: 'stream-analytics', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'iot-hub', target: 'functions', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'stream-analytics', target: 'cosmos', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e7', source: 'functions', target: 'adls', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e8', source: 'cosmos', target: 'power-bi', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

const azureIndustrialIoT: ArchitectureTemplate = {
  id: 'azure-industrial-iot',
  name: 'Industrial IoT Analytics',
  description: 'Industrial IoT solution for manufacturing and asset monitoring',
  categories: ['azure', 'iot', 'data-analytics'],
  complexity: 'advanced',
  tags: ['iiot', 'manufacturing', 'opc-ua', 'predictive-maintenance'],
  useCases: ['manufacturing', 'predictive-maintenance', 'quality-control'],
  isBuiltIn: true,
  nodes: [
    { id: 'plc', type: 'rectangle', position: { x: 50, y: 100 }, data: { label: 'PLC/SCADA', type: 'rectangle' } },
    { id: 'sensors', type: 'rectangle', position: { x: 50, y: 200 }, data: { label: 'Sensors', type: 'rectangle' } },
    { id: 'iot-edge', type: 'azure-iot-edge', position: { x: 200, y: 150 }, data: { label: 'IoT Edge Gateway', type: 'azure-iot-edge' } },
    { id: 'iot-hub', type: 'azure-iot-hub', position: { x: 350, y: 150 }, data: { label: 'IoT Hub', type: 'azure-iot-hub' } },
    { id: 'adx', type: 'azure-data-explorer', position: { x: 500, y: 100 }, data: { label: 'Data Explorer', type: 'azure-data-explorer' } },
    { id: 'ml', type: 'azure-machine-learning', position: { x: 500, y: 200 }, data: { label: 'ML Anomaly Detection', type: 'azure-machine-learning' } },
    { id: 'digital-twins', type: 'azure-digital-twins', position: { x: 650, y: 150 }, data: { label: 'Digital Twins', type: 'azure-digital-twins' } },
  ],
  edges: [
    { id: 'e1', source: 'plc', target: 'iot-edge', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'sensors', target: 'iot-edge', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'iot-edge', target: 'iot-hub', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'iot-hub', target: 'adx', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'iot-hub', target: 'ml', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'adx', target: 'digital-twins', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e7', source: 'ml', target: 'digital-twins', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

// --- Security & Identity Category ---

const azureZeroTrustNetwork: ArchitectureTemplate = {
  id: 'azure-zero-trust-network',
  name: 'Zero Trust Network Architecture',
  description: 'Zero trust security model implementation for Azure workloads',
  categories: ['azure', 'security', 'networking'],
  complexity: 'advanced',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/example-scenario/gateway/firewall-application-gateway',
  tags: ['zero-trust', 'security', 'firewall', 'identity'],
  useCases: ['enterprise-security', 'secure-access', 'compliance'],
  isBuiltIn: true,
  nodes: [
    { id: 'users', type: 'users', position: { x: 50, y: 150 }, data: { label: 'Users', type: 'users' } },
    { id: 'entra', type: 'azure-entra-id', position: { x: 200, y: 100 }, data: { label: 'Entra ID', type: 'azure-entra-id' } },
    { id: 'conditional-access', type: 'rectangle', position: { x: 200, y: 200 }, data: { label: 'Conditional Access', type: 'rectangle' } },
    { id: 'front-door', type: 'azure-front-door', position: { x: 350, y: 150 }, data: { label: 'Front Door + WAF', type: 'azure-front-door' } },
    { id: 'firewall', type: 'azure-firewall', position: { x: 500, y: 150 }, data: { label: 'Azure Firewall', type: 'azure-firewall' } },
    { id: 'app', type: 'azure-app-service', position: { x: 650, y: 150 }, data: { label: 'Application', type: 'azure-app-service' } },
    { id: 'defender', type: 'azure-security-center', position: { x: 500, y: 280 }, data: { label: 'Defender for Cloud', type: 'azure-security-center' } },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'entra', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'users', target: 'conditional-access', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'entra', target: 'front-door', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'conditional-access', target: 'front-door', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'front-door', target: 'firewall', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'firewall', target: 'app', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e7', source: 'firewall', target: 'defender', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

const azureIdentityBaseline: ArchitectureTemplate = {
  id: 'azure-identity-baseline',
  name: 'Identity and Access Management',
  description: 'Enterprise identity baseline with Microsoft Entra ID',
  categories: ['azure', 'security'],
  complexity: 'intermediate',
  tags: ['identity', 'entra-id', 'sso', 'mfa'],
  useCases: ['enterprise-identity', 'sso', 'access-management'],
  isBuiltIn: true,
  nodes: [
    { id: 'users', type: 'users', position: { x: 50, y: 150 }, data: { label: 'Users', type: 'users' } },
    { id: 'entra', type: 'azure-entra-id', position: { x: 200, y: 150 }, data: { label: 'Microsoft Entra ID', type: 'azure-entra-id' } },
    { id: 'conditional', type: 'rectangle', position: { x: 350, y: 80 }, data: { label: 'Conditional Access', type: 'rectangle' } },
    { id: 'pim', type: 'rectangle', position: { x: 350, y: 150 }, data: { label: 'PIM', type: 'rectangle' } },
    { id: 'mfa', type: 'rectangle', position: { x: 350, y: 220 }, data: { label: 'MFA', type: 'rectangle' } },
    { id: 'apps', type: 'azure-app-service', position: { x: 500, y: 100 }, data: { label: 'Enterprise Apps', type: 'azure-app-service' } },
    { id: 'azure', type: 'rectangle', position: { x: 500, y: 200 }, data: { label: 'Azure Resources', type: 'rectangle' } },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'entra', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'entra', target: 'conditional', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'entra', target: 'pim', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'entra', target: 'mfa', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'conditional', target: 'apps', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'pim', target: 'azure', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

const azureSentinelSIEM: ArchitectureTemplate = {
  id: 'azure-sentinel-siem',
  name: 'Microsoft Sentinel SIEM/SOAR',
  description: 'Cloud-native SIEM and SOAR solution with Microsoft Sentinel',
  categories: ['azure', 'security'],
  complexity: 'advanced',
  tags: ['sentinel', 'siem', 'soar', 'security-operations'],
  useCases: ['security-operations', 'threat-detection', 'incident-response'],
  isBuiltIn: true,
  nodes: [
    { id: 'logs', type: 'rectangle', position: { x: 50, y: 80 }, data: { label: 'Security Logs', type: 'rectangle' } },
    { id: 'azure-logs', type: 'azure-monitor', position: { x: 50, y: 150 }, data: { label: 'Azure Activity', type: 'azure-monitor' } },
    { id: 'm365', type: 'o365-sharepoint', position: { x: 50, y: 220 }, data: { label: 'Microsoft 365', type: 'o365-sharepoint' } },
    { id: 'log-analytics', type: 'azure-log-analytics', position: { x: 220, y: 150 }, data: { label: 'Log Analytics', type: 'azure-log-analytics' } },
    { id: 'sentinel', type: 'azure-sentinel', position: { x: 400, y: 150 }, data: { label: 'Microsoft Sentinel', type: 'azure-sentinel' } },
    { id: 'logic-apps', type: 'azure-logic-apps', position: { x: 580, y: 100 }, data: { label: 'Playbooks', type: 'azure-logic-apps' } },
    { id: 'soc', type: 'users', position: { x: 580, y: 200 }, data: { label: 'SOC Team', type: 'users' } },
  ],
  edges: [
    { id: 'e1', source: 'logs', target: 'log-analytics', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'azure-logs', target: 'log-analytics', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'm365', target: 'log-analytics', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'log-analytics', target: 'sentinel', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'sentinel', target: 'logic-apps', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'sentinel', target: 'soc', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

// --- DevOps & Infrastructure Category ---

const azureDevSecOps: ArchitectureTemplate = {
  id: 'azure-devsecops',
  name: 'DevSecOps Pipeline',
  description: 'Secure DevOps pipeline with integrated security scanning',
  categories: ['azure', 'devops', 'security'],
  complexity: 'advanced',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/articles/devsecops-in-azure',
  tags: ['devsecops', 'security', 'ci-cd', 'scanning'],
  useCases: ['secure-development', 'compliance', 'automated-security'],
  isBuiltIn: true,
  nodes: [
    { id: 'dev', type: 'users', position: { x: 50, y: 150 }, data: { label: 'Developers', type: 'users' } },
    { id: 'github', type: 'rectangle', position: { x: 180, y: 150 }, data: { label: 'GitHub', type: 'rectangle' } },
    { id: 'devops', type: 'azure-devops', position: { x: 320, y: 150 }, data: { label: 'Azure DevOps', type: 'azure-devops' } },
    { id: 'defender', type: 'azure-security-center', position: { x: 320, y: 50 }, data: { label: 'Defender for DevOps', type: 'azure-security-center' } },
    { id: 'acr', type: 'azure-container-registry', position: { x: 460, y: 150 }, data: { label: 'Container Registry', type: 'azure-container-registry' } },
    { id: 'aks', type: 'azure-aks', position: { x: 600, y: 150 }, data: { label: 'AKS', type: 'azure-aks' } },
    { id: 'keyvault', type: 'azure-keyvault', position: { x: 460, y: 250 }, data: { label: 'Key Vault', type: 'azure-keyvault' } },
  ],
  edges: [
    { id: 'e1', source: 'dev', target: 'github', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'github', target: 'devops', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'devops', target: 'defender', sourceHandle: 'top', targetHandle: 'bottom' },
    { id: 'e4', source: 'devops', target: 'acr', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'acr', target: 'aks', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'devops', target: 'keyvault', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

const azureInfraAsCode: ArchitectureTemplate = {
  id: 'azure-infrastructure-as-code',
  name: 'Infrastructure as Code Pipeline',
  description: 'IaC deployment pipeline using Terraform/Bicep with Azure DevOps',
  categories: ['azure', 'devops'],
  complexity: 'intermediate',
  tags: ['iac', 'terraform', 'bicep', 'automation'],
  useCases: ['infrastructure-automation', 'environment-provisioning', 'drift-detection'],
  isBuiltIn: true,
  nodes: [
    { id: 'repo', type: 'rectangle', position: { x: 50, y: 150 }, data: { label: 'IaC Repository', type: 'rectangle' } },
    { id: 'devops', type: 'azure-devops', position: { x: 200, y: 150 }, data: { label: 'Azure DevOps', type: 'azure-devops' } },
    { id: 'plan', type: 'rectangle', position: { x: 350, y: 100 }, data: { label: 'Plan Stage', type: 'rectangle' } },
    { id: 'apply', type: 'rectangle', position: { x: 350, y: 200 }, data: { label: 'Apply Stage', type: 'rectangle' } },
    { id: 'azure', type: 'rectangle', position: { x: 500, y: 150 }, data: { label: 'Azure Resources', type: 'rectangle' } },
    { id: 'state', type: 'azure-storage', position: { x: 500, y: 250 }, data: { label: 'State Storage', type: 'azure-storage' } },
  ],
  edges: [
    { id: 'e1', source: 'repo', target: 'devops', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'devops', target: 'plan', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'plan', target: 'apply', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e4', source: 'apply', target: 'azure', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'apply', target: 'state', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

// --- Mission Critical Category ---

const azureMissionCriticalBaseline: ArchitectureTemplate = {
  id: 'azure-mission-critical-baseline',
  name: 'Mission Critical Baseline',
  description: 'Mission-critical application baseline with maximum reliability',
  categories: ['azure', 'web-app'],
  complexity: 'advanced',
  source: 'https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/containers/aks-mission-critical/mission-critical-intro',
  tags: ['mission-critical', 'high-availability', 'reliability', '99.999'],
  useCases: ['critical-applications', 'zero-downtime', 'financial-services'],
  isBuiltIn: true,
  nodes: [
    { id: 'users', type: 'users', position: { x: 50, y: 150 }, data: { label: 'Users', type: 'users' } },
    { id: 'front-door', type: 'azure-front-door', position: { x: 200, y: 150 }, data: { label: 'Front Door', type: 'azure-front-door' } },
    { id: 'region1', type: 'rectangle', position: { x: 350, y: 80 }, data: { label: 'Region 1 (Active)', type: 'rectangle' } },
    { id: 'region2', type: 'rectangle', position: { x: 350, y: 220 }, data: { label: 'Region 2 (Active)', type: 'rectangle' } },
    { id: 'cosmos', type: 'azure-cosmos', position: { x: 520, y: 150 }, data: { label: 'Cosmos DB\n(Multi-Region)', type: 'azure-cosmos' } },
    { id: 'monitor', type: 'azure-monitor', position: { x: 200, y: 280 }, data: { label: 'Azure Monitor', type: 'azure-monitor' } },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'front-door', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'front-door', target: 'region1', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'front-door', target: 'region2', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'region1', target: 'cosmos', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'region2', target: 'cosmos', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'region1', target: 'monitor', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e7', source: 'region2', target: 'monitor', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

// --- Database Category ---

const azureCosmosDBPatterns: ArchitectureTemplate = {
  id: 'azure-cosmosdb-patterns',
  name: 'Cosmos DB Multi-Model Architecture',
  description: 'Multi-model database architecture using Azure Cosmos DB',
  categories: ['azure', 'data-analytics'],
  complexity: 'intermediate',
  tags: ['cosmos-db', 'nosql', 'multi-model', 'global-distribution'],
  useCases: ['global-apps', 'real-time-apps', 'document-storage'],
  isBuiltIn: true,
  nodes: [
    { id: 'app', type: 'azure-app-service', position: { x: 50, y: 150 }, data: { label: 'Application', type: 'azure-app-service' } },
    { id: 'cosmos', type: 'azure-cosmos', position: { x: 250, y: 150 }, data: { label: 'Cosmos DB', type: 'azure-cosmos' } },
    { id: 'sql-api', type: 'rectangle', position: { x: 420, y: 50 }, data: { label: 'SQL API', type: 'rectangle' } },
    { id: 'mongodb-api', type: 'rectangle', position: { x: 420, y: 120 }, data: { label: 'MongoDB API', type: 'rectangle' } },
    { id: 'cassandra-api', type: 'rectangle', position: { x: 420, y: 190 }, data: { label: 'Cassandra API', type: 'rectangle' } },
    { id: 'gremlin-api', type: 'rectangle', position: { x: 420, y: 260 }, data: { label: 'Gremlin API', type: 'rectangle' } },
  ],
  edges: [
    { id: 'e1', source: 'app', target: 'cosmos', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'cosmos', target: 'sql-api', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'cosmos', target: 'mongodb-api', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'cosmos', target: 'cassandra-api', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'cosmos', target: 'gremlin-api', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

const azureSQLHADR: ArchitectureTemplate = {
  id: 'azure-sql-ha-dr',
  name: 'Azure SQL High Availability',
  description: 'Azure SQL Database with geo-replication and failover groups',
  categories: ['azure', 'data-analytics'],
  complexity: 'intermediate',
  tags: ['sql', 'high-availability', 'disaster-recovery', 'geo-replication'],
  useCases: ['enterprise-database', 'business-continuity', 'global-apps'],
  isBuiltIn: true,
  nodes: [
    { id: 'app-primary', type: 'azure-app-service', position: { x: 100, y: 100 }, data: { label: 'Primary App', type: 'azure-app-service' } },
    { id: 'app-secondary', type: 'azure-app-service', position: { x: 400, y: 100 }, data: { label: 'Secondary App', type: 'azure-app-service' } },
    { id: 'sql-primary', type: 'azure-sql', position: { x: 100, y: 220 }, data: { label: 'SQL Primary', type: 'azure-sql' } },
    { id: 'sql-secondary', type: 'azure-sql', position: { x: 400, y: 220 }, data: { label: 'SQL Secondary', type: 'azure-sql' } },
    { id: 'failover-group', type: 'rectangle', position: { x: 250, y: 160 }, data: { label: 'Failover Group', type: 'rectangle' } },
  ],
  edges: [
    { id: 'e1', source: 'app-primary', target: 'sql-primary', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e2', source: 'app-secondary', target: 'sql-secondary', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e3', source: 'sql-primary', target: 'failover-group', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'failover-group', target: 'sql-secondary', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

// --- Integration Category ---

const azureAPIFirstIntegration: ArchitectureTemplate = {
  id: 'azure-api-first',
  name: 'API-First Integration Architecture',
  description: 'API-first design pattern with Azure API Management',
  categories: ['azure', 'serverless'],
  complexity: 'intermediate',
  tags: ['api-management', 'api-first', 'microservices', 'integration'],
  useCases: ['api-platform', 'partner-integration', 'monetization'],
  isBuiltIn: true,
  nodes: [
    { id: 'consumers', type: 'users', position: { x: 50, y: 150 }, data: { label: 'API Consumers', type: 'users' } },
    { id: 'apim', type: 'azure-api-management', position: { x: 200, y: 150 }, data: { label: 'API Management', type: 'azure-api-management' } },
    { id: 'functions', type: 'azure-functions', position: { x: 400, y: 80 }, data: { label: 'Functions', type: 'azure-functions' } },
    { id: 'aks', type: 'azure-aks', position: { x: 400, y: 150 }, data: { label: 'AKS Services', type: 'azure-aks' } },
    { id: 'logic-apps', type: 'azure-logic-apps', position: { x: 400, y: 220 }, data: { label: 'Logic Apps', type: 'azure-logic-apps' } },
    { id: 'cosmos', type: 'azure-cosmos', position: { x: 580, y: 150 }, data: { label: 'Cosmos DB', type: 'azure-cosmos' } },
  ],
  edges: [
    { id: 'e1', source: 'consumers', target: 'apim', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'apim', target: 'functions', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'apim', target: 'aks', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'apim', target: 'logic-apps', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'functions', target: 'cosmos', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'aks', target: 'cosmos', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

const azureEventDrivenIntegration: ArchitectureTemplate = {
  id: 'azure-event-driven-integration',
  name: 'Event-Driven Integration',
  description: 'Enterprise integration using event-driven architecture patterns',
  categories: ['azure', 'serverless'],
  complexity: 'advanced',
  tags: ['event-driven', 'integration', 'service-bus', 'event-grid'],
  useCases: ['enterprise-integration', 'decoupled-systems', 'real-time-processing'],
  isBuiltIn: true,
  nodes: [
    { id: 'source1', type: 'rectangle', position: { x: 50, y: 80 }, data: { label: 'ERP System', type: 'rectangle' } },
    { id: 'source2', type: 'rectangle', position: { x: 50, y: 180 }, data: { label: 'CRM System', type: 'rectangle' } },
    { id: 'event-grid', type: 'azure-event-grid', position: { x: 200, y: 130 }, data: { label: 'Event Grid', type: 'azure-event-grid' } },
    { id: 'service-bus', type: 'azure-service-bus', position: { x: 350, y: 130 }, data: { label: 'Service Bus', type: 'azure-service-bus' } },
    { id: 'functions', type: 'azure-functions', position: { x: 500, y: 80 }, data: { label: 'Event Handlers', type: 'azure-functions' } },
    { id: 'logic-apps', type: 'azure-logic-apps', position: { x: 500, y: 180 }, data: { label: 'Workflows', type: 'azure-logic-apps' } },
    { id: 'cosmos', type: 'azure-cosmos', position: { x: 650, y: 130 }, data: { label: 'Event Store', type: 'azure-cosmos' } },
  ],
  edges: [
    { id: 'e1', source: 'source1', target: 'event-grid', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'source2', target: 'event-grid', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'event-grid', target: 'service-bus', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'service-bus', target: 'functions', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'service-bus', target: 'logic-apps', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'functions', target: 'cosmos', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

// ============================================================================
// Export All Templates
// ============================================================================

export const ARCHITECTURE_TEMPLATES: ArchitectureTemplate[] = [
  // Azure Templates - Original (31 total)
  azureEnterpriseBIFabric,
  azure3TierWebApp,
  azureServerlessWeb,
  azureAKSMicroservices,
  azureOpenAIIntegration,
  azureDevOpsPipeline,
  azureIoTArchitecture,
  azureHubSpokeNetwork,
  azureSynapseAnalytics,
  azureVirtualDesktop,
  azureAPIManagement,
  azureEventGrid,
  azureDisasterRecovery,
  azureServiceBusIntegration,
  azureLogicAppsIntegration,
  azureCDNArchitecture,
  azureCognitiveSearch,
  azureDigitalTwins,
  azureLandingZone,
  azureB2CAuthentication,
  azureDataFactoryETL,
  azureMonitorObservability,
  azureContainerApps,
  azureArcHybrid,
  azureStaticWebApps,
  azurePrivateLink,
  azureExpressRoute,
  azureBackupSiteRecovery,
  azureMediaServices,
  azureBatchProcessing,
  azureServiceFabric,

  // Azure Templates - Additional (30 new templates based on Azure Architecture Center)
  // AI & Machine Learning
  azureRAGPattern,
  azureMLOps,
  azureFoundryChat,
  azureCognitiveServices,
  azureDocumentIntelligence,
  // Analytics & Data
  azureRealTimeAnalytics,
  azureDatabricksLakehouse,
  azureStreamAnalytics,
  azureModernDataWarehouse,
  azurePurviewGovernance,
  // Containers & Kubernetes
  azureAKSBaseline,
  azureAKSMultiRegion,
  azureRedHatOpenShift,
  azureGitOpsAKS,
  // Hybrid & Multicloud
  azureArcKubernetes,
  azureLocalBaseline,
  azureExpressRoutePrivate,
  // Web Applications
  azureEcommerceApp,
  azureMultiTierHA,
  // IoT
  azureIoTReference,
  azureIndustrialIoT,
  // Security & Identity
  azureZeroTrustNetwork,
  azureIdentityBaseline,
  azureSentinelSIEM,
  // DevOps & Infrastructure
  azureDevSecOps,
  azureInfraAsCode,
  // Mission Critical
  azureMissionCriticalBaseline,
  // Database
  azureCosmosDBPatterns,
  azureSQLHADR,
  // Integration
  azureAPIFirstIntegration,
  azureEventDrivenIntegration,

  // AWS Templates
  aws3TierVPC,
  awsServerlessAPI,
  awsEKSCluster,
  awsDataLake,
  awsBedrockAI,
  awsDevOpsPipeline,
  awsIoTArchitecture,
  awsSecurityArchitecture,
  awsEventDrivenArchitecture,

  // GCP Templates
  gcp3TierWebApp,
  gcpGKECluster,
  gcpBigQueryDataWarehouse,
  gcpCloudRunServerless,
  gcpVertexAIPlatform,
  gcpEventDrivenArchitecture,

  // Multi-Cloud Templates
  multiCloudKubernetes,
]

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: TemplateCategory): ArchitectureTemplate[] {
  return ARCHITECTURE_TEMPLATES.filter(t => t.categories.includes(category))
}

/**
 * Get templates by complexity
 */
export function getTemplatesByComplexity(complexity: ArchitectureTemplate['complexity']): ArchitectureTemplate[] {
  return ARCHITECTURE_TEMPLATES.filter(t => t.complexity === complexity)
}

/**
 * Search templates by name, description, or tags
 */
export function searchTemplates(query: string): ArchitectureTemplate[] {
  const lowerQuery = query.toLowerCase()
  return ARCHITECTURE_TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}
