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
// Export All Templates
// ============================================================================

export const ARCHITECTURE_TEMPLATES: ArchitectureTemplate[] = [
  // Azure Templates
  azureEnterpriseBIFabric,
  azure3TierWebApp,
  azureServerlessWeb,
  azureAKSMicroservices,
  azureOpenAIIntegration,
  azureDevOpsPipeline,
  azureIoTArchitecture,
  azureHubSpokeNetwork,

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
