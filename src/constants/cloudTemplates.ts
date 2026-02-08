import type { DiagramTemplate } from './templates'

// =============================================
// AWS TEMPLATES (15)
// =============================================

export const awsServerlessApiTemplate: DiagramTemplate = {
  id: 'aws-serverless-api',
  name: 'AWS Serverless API',
  description: 'Serverless REST API with Lambda, API Gateway, and DynamoDB',
  category: 'architecture',
  nodes: [
    { id: 'client', type: 'custom', position: { x: 50, y: 180 }, data: { label: 'Client', type: 'users', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'apigw', type: 'custom', position: { x: 180, y: 180 }, data: { label: 'API Gateway', type: 'aws-api-gateway', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'lambda1', type: 'custom', position: { x: 320, y: 100 }, data: { label: 'Get Lambda', type: 'aws-lambda', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'lambda2', type: 'custom', position: { x: 320, y: 260 }, data: { label: 'Post Lambda', type: 'aws-lambda', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'dynamodb', type: 'custom', position: { x: 460, y: 180 }, data: { label: 'DynamoDB', type: 'aws-dynamodb', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'cognito', type: 'custom', position: { x: 180, y: 320 }, data: { label: 'Cognito', type: 'aws-cognito', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'client', target: 'apigw', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'apigw', target: 'lambda1', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'apigw', target: 'lambda2', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'lambda1', target: 'dynamodb', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'lambda2', target: 'dynamodb', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'apigw', target: 'cognito', type: 'smoothstep', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

export const awsMicroservicesTemplate: DiagramTemplate = {
  id: 'aws-microservices',
  name: 'AWS Microservices',
  description: 'Containerized microservices with ECS, ALB, and RDS',
  category: 'architecture',
  nodes: [
    { id: 'users', type: 'custom', position: { x: 50, y: 200 }, data: { label: 'Users', type: 'users', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'alb', type: 'custom', position: { x: 180, y: 200 }, data: { label: 'ALB', type: 'aws-elb', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'ecs1', type: 'custom', position: { x: 320, y: 100 }, data: { label: 'User Service', type: 'aws-ecs', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'ecs2', type: 'custom', position: { x: 320, y: 200 }, data: { label: 'Order Service', type: 'aws-ecs', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'ecs3', type: 'custom', position: { x: 320, y: 300 }, data: { label: 'Product Service', type: 'aws-ecs', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'rds', type: 'custom', position: { x: 480, y: 200 }, data: { label: 'RDS', type: 'aws-rds', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'elasticache', type: 'custom', position: { x: 480, y: 320 }, data: { label: 'ElastiCache', type: 'aws-elasticache', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'alb', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'alb', target: 'ecs1', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'alb', target: 'ecs2', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'alb', target: 'ecs3', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'ecs1', target: 'rds', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'ecs2', target: 'rds', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e7', source: 'ecs3', target: 'elasticache', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

export const awsDataLakeTemplate: DiagramTemplate = {
  id: 'aws-data-lake',
  name: 'AWS Data Lake',
  description: 'Data lake architecture with S3, Glue, and Athena',
  category: 'architecture',
  nodes: [
    { id: 'sources', type: 'custom', position: { x: 50, y: 180 }, data: { label: 'Data Sources', type: 'database', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'kinesis', type: 'custom', position: { x: 180, y: 100 }, data: { label: 'Kinesis', type: 'aws-kinesis', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 's3raw', type: 'custom', position: { x: 320, y: 100 }, data: { label: 'S3 Raw', type: 'aws-s3', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'glue', type: 'custom', position: { x: 320, y: 220 }, data: { label: 'Glue ETL', type: 'aws-glue', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 's3processed', type: 'custom', position: { x: 460, y: 160 }, data: { label: 'S3 Processed', type: 'aws-s3', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'athena', type: 'custom', position: { x: 600, y: 100 }, data: { label: 'Athena', type: 'aws-athena', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'quicksight', type: 'custom', position: { x: 600, y: 220 }, data: { label: 'QuickSight', type: 'aws-quicksight', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'sources', target: 'kinesis', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'kinesis', target: 's3raw', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 's3raw', target: 'glue', type: 'smoothstep', sourceHandle: 'bottom', targetHandle: 'left' },
    { id: 'e4', source: 'glue', target: 's3processed', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 's3processed', target: 'athena', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 's3processed', target: 'quicksight', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

export const awsEventDrivenTemplate: DiagramTemplate = {
  id: 'aws-event-driven',
  name: 'AWS Event-Driven',
  description: 'Event-driven architecture with EventBridge, SQS, and Lambda',
  category: 'architecture',
  nodes: [
    { id: 'producer', type: 'custom', position: { x: 50, y: 180 }, data: { label: 'Event Producer', type: 'aws-lambda', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'eventbridge', type: 'custom', position: { x: 200, y: 180 }, data: { label: 'EventBridge', type: 'aws-eventbridge', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'sqs1', type: 'custom', position: { x: 350, y: 80 }, data: { label: 'SQS Queue 1', type: 'aws-sqs', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'sqs2', type: 'custom', position: { x: 350, y: 180 }, data: { label: 'SQS Queue 2', type: 'aws-sqs', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'sns', type: 'custom', position: { x: 350, y: 280 }, data: { label: 'SNS Topic', type: 'aws-sns', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'lambda1', type: 'custom', position: { x: 500, y: 80 }, data: { label: 'Processor 1', type: 'aws-lambda', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'lambda2', type: 'custom', position: { x: 500, y: 180 }, data: { label: 'Processor 2', type: 'aws-lambda', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'producer', target: 'eventbridge', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'eventbridge', target: 'sqs1', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'eventbridge', target: 'sqs2', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'eventbridge', target: 'sns', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'sqs1', target: 'lambda1', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'sqs2', target: 'lambda2', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

export const awsContainerPlatformTemplate: DiagramTemplate = {
  id: 'aws-container-platform',
  name: 'AWS EKS Platform',
  description: 'Kubernetes platform with EKS, ECR, and monitoring',
  category: 'architecture',
  nodes: [
    { id: 'users', type: 'custom', position: { x: 50, y: 180 }, data: { label: 'Users', type: 'users', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'alb', type: 'custom', position: { x: 180, y: 180 }, data: { label: 'ALB Ingress', type: 'aws-elb', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'eks', type: 'custom', position: { x: 320, y: 180 }, data: { label: 'EKS Cluster', type: 'aws-eks', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'ecr', type: 'custom', position: { x: 320, y: 300 }, data: { label: 'ECR', type: 'aws-ecr', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'rds', type: 'custom', position: { x: 480, y: 120 }, data: { label: 'RDS', type: 'aws-rds', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 's3', type: 'custom', position: { x: 480, y: 240 }, data: { label: 'S3', type: 'aws-s3', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'cloudwatch', type: 'custom', position: { x: 180, y: 300 }, data: { label: 'CloudWatch', type: 'aws-cloudwatch', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'alb', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'alb', target: 'eks', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'eks', target: 'rds', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'eks', target: 's3', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'ecr', target: 'eks', type: 'smoothstep', sourceHandle: 'top', targetHandle: 'bottom' },
    { id: 'e6', source: 'eks', target: 'cloudwatch', type: 'smoothstep', sourceHandle: 'left', targetHandle: 'right' },
  ],
}

export const awsStaticWebsiteTemplate: DiagramTemplate = {
  id: 'aws-static-website',
  name: 'AWS Static Website',
  description: 'Static website hosting with S3, CloudFront, and Route 53',
  category: 'architecture',
  nodes: [
    { id: 'users', type: 'custom', position: { x: 50, y: 150 }, data: { label: 'Users', type: 'users', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'route53', type: 'custom', position: { x: 180, y: 150 }, data: { label: 'Route 53', type: 'aws-route53', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'cloudfront', type: 'custom', position: { x: 320, y: 150 }, data: { label: 'CloudFront', type: 'aws-cloudfront', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 's3', type: 'custom', position: { x: 460, y: 150 }, data: { label: 'S3 Website', type: 'aws-s3', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'acm', type: 'custom', position: { x: 320, y: 270 }, data: { label: 'ACM Cert', type: 'aws-certificate-manager', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'route53', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'route53', target: 'cloudfront', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'cloudfront', target: 's3', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'acm', target: 'cloudfront', type: 'smoothstep', sourceHandle: 'top', targetHandle: 'bottom' },
  ],
}

export const awsCICDTemplate: DiagramTemplate = {
  id: 'aws-cicd',
  name: 'AWS CI/CD Pipeline',
  description: 'CI/CD pipeline with CodePipeline, CodeBuild, and ECS',
  category: 'architecture',
  nodes: [
    { id: 'github', type: 'custom', position: { x: 50, y: 150 }, data: { label: 'GitHub', type: 'generic-api', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'codepipeline', type: 'custom', position: { x: 180, y: 150 }, data: { label: 'CodePipeline', type: 'aws-codepipeline', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'codebuild', type: 'custom', position: { x: 320, y: 150 }, data: { label: 'CodeBuild', type: 'aws-codebuild', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'ecr', type: 'custom', position: { x: 460, y: 150 }, data: { label: 'ECR', type: 'aws-ecr', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'ecs', type: 'custom', position: { x: 600, y: 150 }, data: { label: 'ECS', type: 'aws-ecs', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 's3', type: 'custom', position: { x: 320, y: 270 }, data: { label: 'S3 Artifacts', type: 'aws-s3', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'github', target: 'codepipeline', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'codepipeline', target: 'codebuild', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'codebuild', target: 'ecr', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'ecr', target: 'ecs', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'codebuild', target: 's3', type: 'smoothstep', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

export const awsVPCNetworkTemplate: DiagramTemplate = {
  id: 'aws-vpc-network',
  name: 'AWS VPC Network',
  description: 'VPC architecture with public/private subnets and NAT',
  category: 'architecture',
  nodes: [
    { id: 'internet', type: 'custom', position: { x: 50, y: 180 }, data: { label: 'Internet', type: 'internet', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'igw', type: 'custom', position: { x: 180, y: 180 }, data: { label: 'IGW', type: 'aws-vpc', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'public1', type: 'custom', position: { x: 320, y: 100 }, data: { label: 'Public Subnet 1', type: 'aws-vpc', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'public2', type: 'custom', position: { x: 320, y: 260 }, data: { label: 'Public Subnet 2', type: 'aws-vpc', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'nat', type: 'custom', position: { x: 460, y: 180 }, data: { label: 'NAT Gateway', type: 'aws-vpc', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'private1', type: 'custom', position: { x: 600, y: 100 }, data: { label: 'Private Subnet 1', type: 'aws-vpc', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'private2', type: 'custom', position: { x: 600, y: 260 }, data: { label: 'Private Subnet 2', type: 'aws-vpc', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'internet', target: 'igw', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'igw', target: 'public1', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'igw', target: 'public2', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'public1', target: 'nat', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'nat', target: 'private1', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'nat', target: 'private2', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

export const awsMLPipelineTemplate: DiagramTemplate = {
  id: 'aws-ml-pipeline',
  name: 'AWS ML Pipeline',
  description: 'Machine learning pipeline with SageMaker and S3',
  category: 'architecture',
  nodes: [
    { id: 'data', type: 'custom', position: { x: 50, y: 180 }, data: { label: 'Training Data', type: 'aws-s3', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'sagemaker', type: 'custom', position: { x: 200, y: 180 }, data: { label: 'SageMaker', type: 'aws-sagemaker', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'model', type: 'custom', position: { x: 350, y: 180 }, data: { label: 'Model Registry', type: 'aws-s3', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'endpoint', type: 'custom', position: { x: 500, y: 180 }, data: { label: 'Endpoint', type: 'aws-sagemaker', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'lambda', type: 'custom', position: { x: 500, y: 300 }, data: { label: 'Inference API', type: 'aws-lambda', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'data', target: 'sagemaker', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'sagemaker', target: 'model', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'model', target: 'endpoint', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'endpoint', target: 'lambda', type: 'smoothstep', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

export const awsIoTTemplate: DiagramTemplate = {
  id: 'aws-iot',
  name: 'AWS IoT Platform',
  description: 'IoT platform with IoT Core, Kinesis, and Lambda',
  category: 'architecture',
  nodes: [
    { id: 'devices', type: 'custom', position: { x: 50, y: 180 }, data: { label: 'IoT Devices', type: 'mobile', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'iotcore', type: 'custom', position: { x: 200, y: 180 }, data: { label: 'IoT Core', type: 'aws-connect', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'kinesis', type: 'custom', position: { x: 350, y: 100 }, data: { label: 'Kinesis', type: 'aws-kinesis', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'lambda', type: 'custom', position: { x: 350, y: 260 }, data: { label: 'Lambda', type: 'aws-lambda', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'dynamodb', type: 'custom', position: { x: 500, y: 180 }, data: { label: 'DynamoDB', type: 'aws-dynamodb', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'devices', target: 'iotcore', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'iotcore', target: 'kinesis', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'iotcore', target: 'lambda', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'kinesis', target: 'dynamodb', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'lambda', target: 'dynamodb', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

export const awsRealTimeAnalyticsTemplate: DiagramTemplate = {
  id: 'aws-realtime-analytics',
  name: 'AWS Real-Time Analytics',
  description: 'Real-time analytics with Kinesis and OpenSearch',
  category: 'architecture',
  nodes: [
    { id: 'sources', type: 'custom', position: { x: 50, y: 180 }, data: { label: 'Data Streams', type: 'database', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'kinesis', type: 'custom', position: { x: 200, y: 180 }, data: { label: 'Kinesis Streams', type: 'aws-kinesis', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'firehose', type: 'custom', position: { x: 350, y: 100 }, data: { label: 'Firehose', type: 'aws-kinesis', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'analytics', type: 'custom', position: { x: 350, y: 260 }, data: { label: 'Kinesis Analytics', type: 'aws-kinesis', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'opensearch', type: 'custom', position: { x: 500, y: 100 }, data: { label: 'OpenSearch', type: 'aws-opensearch', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 's3', type: 'custom', position: { x: 500, y: 260 }, data: { label: 'S3 Archive', type: 'aws-s3', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'sources', target: 'kinesis', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'kinesis', target: 'firehose', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'kinesis', target: 'analytics', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'firehose', target: 'opensearch', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'analytics', target: 's3', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

export const awsMultiRegionDRTemplate: DiagramTemplate = {
  id: 'aws-multi-region-dr',
  name: 'AWS Multi-Region DR',
  description: 'Multi-region disaster recovery with Route 53 and RDS',
  category: 'architecture',
  nodes: [
    { id: 'users', type: 'custom', position: { x: 50, y: 180 }, data: { label: 'Users', type: 'users', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'route53', type: 'custom', position: { x: 180, y: 180 }, data: { label: 'Route 53', type: 'aws-route53', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'region1', type: 'custom', position: { x: 330, y: 100 }, data: { label: 'Primary Region', type: 'aws-vpc', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'region2', type: 'custom', position: { x: 330, y: 260 }, data: { label: 'DR Region', type: 'aws-vpc', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'rds1', type: 'custom', position: { x: 480, y: 100 }, data: { label: 'RDS Primary', type: 'aws-rds', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'rds2', type: 'custom', position: { x: 480, y: 260 }, data: { label: 'RDS Replica', type: 'aws-rds', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'route53', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'route53', target: 'region1', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'route53', target: 'region2', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left', style: { strokeDasharray: '5,5' } },
    { id: 'e4', source: 'region1', target: 'rds1', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'region2', target: 'rds2', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'rds1', target: 'rds2', type: 'smoothstep', sourceHandle: 'bottom', targetHandle: 'top', label: 'Replication' },
  ],
}

export const awsBatchProcessingTemplate: DiagramTemplate = {
  id: 'aws-batch-processing',
  name: 'AWS Batch Processing',
  description: 'Batch processing with Step Functions and Batch',
  category: 'architecture',
  nodes: [
    { id: 's3input', type: 'custom', position: { x: 50, y: 180 }, data: { label: 'S3 Input', type: 'aws-s3', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'stepfn', type: 'custom', position: { x: 200, y: 180 }, data: { label: 'Step Functions', type: 'aws-step-functions', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'batch', type: 'custom', position: { x: 350, y: 100 }, data: { label: 'AWS Batch', type: 'aws-batch', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'lambda', type: 'custom', position: { x: 350, y: 260 }, data: { label: 'Lambda', type: 'aws-lambda', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 's3output', type: 'custom', position: { x: 500, y: 180 }, data: { label: 'S3 Output', type: 'aws-s3', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 's3input', target: 'stepfn', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'stepfn', target: 'batch', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'stepfn', target: 'lambda', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'batch', target: 's3output', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'lambda', target: 's3output', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

export const awsMonitoringStackTemplate: DiagramTemplate = {
  id: 'aws-monitoring-stack',
  name: 'AWS Monitoring Stack',
  description: 'Monitoring with CloudWatch, X-Ray, and SNS',
  category: 'architecture',
  nodes: [
    { id: 'app', type: 'custom', position: { x: 50, y: 180 }, data: { label: 'Application', type: 'aws-ec2', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'cloudwatch', type: 'custom', position: { x: 200, y: 100 }, data: { label: 'CloudWatch', type: 'aws-cloudwatch', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'xray', type: 'custom', position: { x: 200, y: 260 }, data: { label: 'X-Ray', type: 'aws-xray', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'alarms', type: 'custom', position: { x: 350, y: 100 }, data: { label: 'Alarms', type: 'aws-cloudwatch', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'sns', type: 'custom', position: { x: 500, y: 100 }, data: { label: 'SNS', type: 'aws-sns', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'dashboard', type: 'custom', position: { x: 350, y: 260 }, data: { label: 'Dashboard', type: 'aws-cloudwatch', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'app', target: 'cloudwatch', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'app', target: 'xray', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'cloudwatch', target: 'alarms', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'alarms', target: 'sns', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'xray', target: 'dashboard', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

export const awsSecurityArchTemplate: DiagramTemplate = {
  id: 'aws-security-arch',
  name: 'AWS Security Architecture',
  description: 'Security with WAF, Shield, and GuardDuty',
  category: 'architecture',
  nodes: [
    { id: 'users', type: 'custom', position: { x: 50, y: 180 }, data: { label: 'Users', type: 'users', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'waf', type: 'custom', position: { x: 180, y: 180 }, data: { label: 'WAF', type: 'aws-waf', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'shield', type: 'custom', position: { x: 180, y: 300 }, data: { label: 'Shield', type: 'aws-shield', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'alb', type: 'custom', position: { x: 320, y: 180 }, data: { label: 'ALB', type: 'aws-elb', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'guardduty', type: 'custom', position: { x: 460, y: 100 }, data: { label: 'GuardDuty', type: 'aws-guardduty', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'securityhub', type: 'custom', position: { x: 460, y: 260 }, data: { label: 'Security Hub', type: 'aws-security-hub', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'waf', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'waf', target: 'alb', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'shield', target: 'waf', type: 'smoothstep', sourceHandle: 'top', targetHandle: 'bottom' },
    { id: 'e4', source: 'alb', target: 'guardduty', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'guardduty', target: 'securityhub', type: 'smoothstep', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

// =============================================
// AZURE TEMPLATES (15)
// =============================================

export const azureMicroservicesTemplate: DiagramTemplate = {
  id: 'azure-microservices',
  name: 'Azure Microservices',
  description: 'Microservices with AKS, ACR, and Azure SQL',
  category: 'architecture',
  nodes: [
    { id: 'users', type: 'custom', position: { x: 50, y: 180 }, data: { label: 'Users', type: 'users', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'appgw', type: 'custom', position: { x: 180, y: 180 }, data: { label: 'App Gateway', type: 'azure-app-gateway', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'aks', type: 'custom', position: { x: 320, y: 180 }, data: { label: 'AKS', type: 'azure-aks', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'acr', type: 'custom', position: { x: 320, y: 300 }, data: { label: 'ACR', type: 'azure-container-registry', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'sql', type: 'custom', position: { x: 480, y: 120 }, data: { label: 'Azure SQL', type: 'azure-sql', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'redis', type: 'custom', position: { x: 480, y: 240 }, data: { label: 'Redis Cache', type: 'azure-redis-cache', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'keyvault', type: 'custom', position: { x: 180, y: 300 }, data: { label: 'Key Vault', type: 'azure-keyvault', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'appgw', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'appgw', target: 'aks', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'aks', target: 'sql', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'aks', target: 'redis', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'acr', target: 'aks', type: 'smoothstep', sourceHandle: 'top', targetHandle: 'bottom' },
    { id: 'e6', source: 'aks', target: 'keyvault', type: 'smoothstep', sourceHandle: 'left', targetHandle: 'right' },
  ],
}

export const azureServerlessTemplate: DiagramTemplate = {
  id: 'azure-serverless',
  name: 'Azure Serverless',
  description: 'Serverless architecture with Functions and CosmosDB',
  category: 'architecture',
  nodes: [
    { id: 'client', type: 'custom', position: { x: 50, y: 180 }, data: { label: 'Client', type: 'users', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'apim', type: 'custom', position: { x: 180, y: 180 }, data: { label: 'API Management', type: 'azure-api-management', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'func1', type: 'custom', position: { x: 320, y: 100 }, data: { label: 'HTTP Function', type: 'azure-functions', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'func2', type: 'custom', position: { x: 320, y: 260 }, data: { label: 'Timer Function', type: 'azure-functions', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'cosmos', type: 'custom', position: { x: 460, y: 180 }, data: { label: 'CosmosDB', type: 'azure-cosmos', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'storage', type: 'custom', position: { x: 460, y: 300 }, data: { label: 'Blob Storage', type: 'azure-storage', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'client', target: 'apim', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'apim', target: 'func1', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'apim', target: 'func2', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'func1', target: 'cosmos', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'func2', target: 'cosmos', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'func2', target: 'storage', type: 'smoothstep', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

export const azureDataPlatformTemplate: DiagramTemplate = {
  id: 'azure-data-platform',
  name: 'Azure Data Platform',
  description: 'Data analytics with Synapse and Data Lake',
  category: 'architecture',
  nodes: [
    { id: 'sources', type: 'custom', position: { x: 50, y: 180 }, data: { label: 'Data Sources', type: 'database', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'datafactory', type: 'custom', position: { x: 180, y: 180 }, data: { label: 'Data Factory', type: 'azure-data-factory', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'datalake', type: 'custom', position: { x: 320, y: 180 }, data: { label: 'Data Lake', type: 'azure-data-lake', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'synapse', type: 'custom', position: { x: 460, y: 180 }, data: { label: 'Synapse', type: 'azure-synapse', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'powerbi', type: 'custom', position: { x: 600, y: 180 }, data: { label: 'Power BI', type: 'azure-power-bi', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'sources', target: 'datafactory', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'datafactory', target: 'datalake', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'datalake', target: 'synapse', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'synapse', target: 'powerbi', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

export const azureEventDrivenTemplate: DiagramTemplate = {
  id: 'azure-event-driven',
  name: 'Azure Event-Driven',
  description: 'Event-driven with Event Grid and Service Bus',
  category: 'architecture',
  nodes: [
    { id: 'producer', type: 'custom', position: { x: 50, y: 180 }, data: { label: 'Producer', type: 'azure-functions', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'eventgrid', type: 'custom', position: { x: 200, y: 180 }, data: { label: 'Event Grid', type: 'azure-event-grid', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'servicebus', type: 'custom', position: { x: 350, y: 100 }, data: { label: 'Service Bus', type: 'azure-service-bus', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'eventhub', type: 'custom', position: { x: 350, y: 260 }, data: { label: 'Event Hub', type: 'azure-event-hub', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'func1', type: 'custom', position: { x: 500, y: 100 }, data: { label: 'Consumer 1', type: 'azure-functions', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'func2', type: 'custom', position: { x: 500, y: 260 }, data: { label: 'Consumer 2', type: 'azure-functions', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'producer', target: 'eventgrid', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'eventgrid', target: 'servicebus', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'eventgrid', target: 'eventhub', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'servicebus', target: 'func1', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'eventhub', target: 'func2', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

export const azureIoTTemplate: DiagramTemplate = {
  id: 'azure-iot',
  name: 'Azure IoT Platform',
  description: 'IoT platform with IoT Hub and Stream Analytics',
  category: 'architecture',
  nodes: [
    { id: 'devices', type: 'custom', position: { x: 50, y: 180 }, data: { label: 'IoT Devices', type: 'mobile', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'iothub', type: 'custom', position: { x: 200, y: 180 }, data: { label: 'IoT Hub', type: 'azure-event-hub', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'stream', type: 'custom', position: { x: 350, y: 100 }, data: { label: 'Stream Analytics', type: 'azure-stream-analytics', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'func', type: 'custom', position: { x: 350, y: 260 }, data: { label: 'Functions', type: 'azure-functions', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'cosmos', type: 'custom', position: { x: 500, y: 180 }, data: { label: 'Cosmos DB', type: 'azure-cosmos', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'devices', target: 'iothub', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'iothub', target: 'stream', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'iothub', target: 'func', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'stream', target: 'cosmos', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'func', target: 'cosmos', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

export const azureStaticWebAppTemplate: DiagramTemplate = {
  id: 'azure-static-webapp',
  name: 'Azure Static Web App',
  description: 'Static web app with CDN and Functions',
  category: 'architecture',
  nodes: [
    { id: 'users', type: 'custom', position: { x: 50, y: 150 }, data: { label: 'Users', type: 'users', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'frontdoor', type: 'custom', position: { x: 180, y: 150 }, data: { label: 'Front Door', type: 'azure-front-door', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'swa', type: 'custom', position: { x: 320, y: 150 }, data: { label: 'Static Web App', type: 'azure-static-web-apps', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'func', type: 'custom', position: { x: 460, y: 150 }, data: { label: 'Functions API', type: 'azure-functions', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'storage', type: 'custom', position: { x: 460, y: 270 }, data: { label: 'Storage', type: 'azure-storage', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'frontdoor', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'frontdoor', target: 'swa', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'swa', target: 'func', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'func', target: 'storage', type: 'smoothstep', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

export const azureDevOpsTemplate: DiagramTemplate = {
  id: 'azure-devops',
  name: 'Azure DevOps Pipeline',
  description: 'CI/CD with Azure DevOps and AKS',
  category: 'architecture',
  nodes: [
    { id: 'repo', type: 'custom', position: { x: 50, y: 150 }, data: { label: 'Azure Repos', type: 'azure-devops', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'pipeline', type: 'custom', position: { x: 180, y: 150 }, data: { label: 'Pipelines', type: 'azure-devops', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'acr', type: 'custom', position: { x: 320, y: 150 }, data: { label: 'ACR', type: 'azure-container-registry', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'aks', type: 'custom', position: { x: 460, y: 150 }, data: { label: 'AKS', type: 'azure-aks', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'artifacts', type: 'custom', position: { x: 320, y: 270 }, data: { label: 'Artifacts', type: 'azure-devops', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'repo', target: 'pipeline', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'pipeline', target: 'acr', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'acr', target: 'aks', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'pipeline', target: 'artifacts', type: 'smoothstep', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

export const azureMLPlatformTemplate: DiagramTemplate = {
  id: 'azure-ml-platform',
  name: 'Azure ML Platform',
  description: 'Machine learning with Azure ML and Databricks',
  category: 'architecture',
  nodes: [
    { id: 'data', type: 'custom', position: { x: 50, y: 180 }, data: { label: 'Data Lake', type: 'azure-data-lake', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'databricks', type: 'custom', position: { x: 200, y: 180 }, data: { label: 'Databricks', type: 'azure-databricks', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'aml', type: 'custom', position: { x: 350, y: 180 }, data: { label: 'Azure ML', type: 'azure-machine-learning', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'endpoint', type: 'custom', position: { x: 500, y: 180 }, data: { label: 'ML Endpoint', type: 'azure-machine-learning', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'monitor', type: 'custom', position: { x: 350, y: 300 }, data: { label: 'Monitor', type: 'azure-monitor', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'data', target: 'databricks', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'databricks', target: 'aml', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'aml', target: 'endpoint', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'aml', target: 'monitor', type: 'smoothstep', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

export const azureAppModernTemplate: DiagramTemplate = {
  id: 'azure-app-modern',
  name: 'Azure App Modernization',
  description: 'Modernized app with App Service and SQL',
  category: 'architecture',
  nodes: [
    { id: 'users', type: 'custom', position: { x: 50, y: 180 }, data: { label: 'Users', type: 'users', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'appgw', type: 'custom', position: { x: 180, y: 180 }, data: { label: 'App Gateway', type: 'azure-app-gateway', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'appservice', type: 'custom', position: { x: 320, y: 180 }, data: { label: 'App Service', type: 'azure-app-service', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'sql', type: 'custom', position: { x: 460, y: 120 }, data: { label: 'SQL Database', type: 'azure-sql', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'redis', type: 'custom', position: { x: 460, y: 240 }, data: { label: 'Redis Cache', type: 'azure-redis-cache', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'keyvault', type: 'custom', position: { x: 320, y: 300 }, data: { label: 'Key Vault', type: 'azure-keyvault', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'appgw', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'appgw', target: 'appservice', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'appservice', target: 'sql', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'appservice', target: 'redis', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'appservice', target: 'keyvault', type: 'smoothstep', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

export const azureMultiRegionTemplate: DiagramTemplate = {
  id: 'azure-multi-region',
  name: 'Azure Multi-Region',
  description: 'Multi-region with Traffic Manager and CosmosDB',
  category: 'architecture',
  nodes: [
    { id: 'users', type: 'custom', position: { x: 50, y: 180 }, data: { label: 'Users', type: 'users', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'traffic', type: 'custom', position: { x: 180, y: 180 }, data: { label: 'Traffic Manager', type: 'azure-traffic-manager', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'region1', type: 'custom', position: { x: 330, y: 100 }, data: { label: 'East US', type: 'azure-app-service', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'region2', type: 'custom', position: { x: 330, y: 260 }, data: { label: 'West US', type: 'azure-app-service', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'cosmos', type: 'custom', position: { x: 480, y: 180 }, data: { label: 'Cosmos DB', type: 'azure-cosmos', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'traffic', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'traffic', target: 'region1', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'traffic', target: 'region2', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'region1', target: 'cosmos', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'region2', target: 'cosmos', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

export const azureMonitoringTemplate: DiagramTemplate = {
  id: 'azure-monitoring',
  name: 'Azure Monitoring Stack',
  description: 'Monitoring with Azure Monitor and Log Analytics',
  category: 'architecture',
  nodes: [
    { id: 'app', type: 'custom', position: { x: 50, y: 180 }, data: { label: 'Application', type: 'azure-app-service', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'insights', type: 'custom', position: { x: 200, y: 100 }, data: { label: 'App Insights', type: 'azure-monitor', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'monitor', type: 'custom', position: { x: 200, y: 260 }, data: { label: 'Azure Monitor', type: 'azure-monitor', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'loganalytics', type: 'custom', position: { x: 350, y: 180 }, data: { label: 'Log Analytics', type: 'azure-log-analytics', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'alerts', type: 'custom', position: { x: 500, y: 180 }, data: { label: 'Alerts', type: 'azure-monitor', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'app', target: 'insights', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'app', target: 'monitor', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'insights', target: 'loganalytics', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'monitor', target: 'loganalytics', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'loganalytics', target: 'alerts', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

export const azureSecurityTemplate: DiagramTemplate = {
  id: 'azure-security',
  name: 'Azure Security Architecture',
  description: 'Security with Sentinel and Security Center',
  category: 'architecture',
  nodes: [
    { id: 'users', type: 'custom', position: { x: 50, y: 180 }, data: { label: 'Users', type: 'users', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'waf', type: 'custom', position: { x: 180, y: 180 }, data: { label: 'WAF', type: 'azure-firewall', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'frontdoor', type: 'custom', position: { x: 320, y: 180 }, data: { label: 'Front Door', type: 'azure-front-door', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'securitycenter', type: 'custom', position: { x: 460, y: 100 }, data: { label: 'Security Center', type: 'azure-security-center', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'sentinel', type: 'custom', position: { x: 460, y: 260 }, data: { label: 'Sentinel', type: 'azure-sentinel', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'waf', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'waf', target: 'frontdoor', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'frontdoor', target: 'securitycenter', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'securitycenter', target: 'sentinel', type: 'smoothstep', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

export const azureHybridTemplate: DiagramTemplate = {
  id: 'azure-hybrid',
  name: 'Azure Hybrid Cloud',
  description: 'Hybrid with ExpressRoute and Azure Arc',
  category: 'architecture',
  nodes: [
    { id: 'onprem', type: 'custom', position: { x: 50, y: 180 }, data: { label: 'On-Premises', type: 'server', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'expressroute', type: 'custom', position: { x: 200, y: 180 }, data: { label: 'ExpressRoute', type: 'azure-expressroute', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'vnet', type: 'custom', position: { x: 350, y: 180 }, data: { label: 'Azure VNet', type: 'azure-vnet', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'arc', type: 'custom', position: { x: 200, y: 300 }, data: { label: 'Azure Arc', type: 'azure-azure-arc', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'aks', type: 'custom', position: { x: 500, y: 180 }, data: { label: 'AKS', type: 'azure-aks', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'onprem', target: 'expressroute', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'expressroute', target: 'vnet', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'onprem', target: 'arc', type: 'smoothstep', sourceHandle: 'bottom', targetHandle: 'left' },
    { id: 'e4', source: 'vnet', target: 'aks', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

export const azureMediaTemplate: DiagramTemplate = {
  id: 'azure-media',
  name: 'Azure Media Streaming',
  description: 'Media streaming with Media Services and CDN',
  category: 'architecture',
  nodes: [
    { id: 'source', type: 'custom', position: { x: 50, y: 180 }, data: { label: 'Video Source', type: 'server', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'media', type: 'custom', position: { x: 200, y: 180 }, data: { label: 'Media Services', type: 'azure-cdn', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'storage', type: 'custom', position: { x: 350, y: 180 }, data: { label: 'Blob Storage', type: 'azure-storage', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'cdn', type: 'custom', position: { x: 500, y: 180 }, data: { label: 'CDN', type: 'azure-cdn', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'users', type: 'custom', position: { x: 650, y: 180 }, data: { label: 'Viewers', type: 'users', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'source', target: 'media', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'media', target: 'storage', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'storage', target: 'cdn', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'cdn', target: 'users', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

export const azureB2CTemplate: DiagramTemplate = {
  id: 'azure-b2c',
  name: 'Azure B2C Identity',
  description: 'Customer identity with Azure AD B2C',
  category: 'architecture',
  nodes: [
    { id: 'users', type: 'custom', position: { x: 50, y: 180 }, data: { label: 'Customers', type: 'users', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'b2c', type: 'custom', position: { x: 200, y: 180 }, data: { label: 'Azure AD B2C', type: 'azure-active-directory', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'social', type: 'custom', position: { x: 200, y: 300 }, data: { label: 'Social Identity', type: 'azure-active-directory', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'app', type: 'custom', position: { x: 350, y: 180 }, data: { label: 'Application', type: 'azure-app-service', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'api', type: 'custom', position: { x: 500, y: 180 }, data: { label: 'Backend API', type: 'azure-functions', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'b2c', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'social', target: 'b2c', type: 'smoothstep', sourceHandle: 'top', targetHandle: 'bottom' },
    { id: 'e3', source: 'b2c', target: 'app', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'app', target: 'api', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

// =============================================
// GCP TEMPLATES (10)
// =============================================

export const gcpServerlessTemplate: DiagramTemplate = {
  id: 'gcp-serverless',
  name: 'GCP Serverless',
  description: 'Serverless with Cloud Run and Cloud SQL',
  category: 'architecture',
  nodes: [
    { id: 'users', type: 'custom', position: { x: 50, y: 180 }, data: { label: 'Users', type: 'users', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'lb', type: 'custom', position: { x: 180, y: 180 }, data: { label: 'Load Balancer', type: 'gcp-load-balancing', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'cloudrun', type: 'custom', position: { x: 320, y: 180 }, data: { label: 'Cloud Run', type: 'gcp-cloud-run', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'cloudsql', type: 'custom', position: { x: 460, y: 120 }, data: { label: 'Cloud SQL', type: 'gcp-cloud-sql', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'storage', type: 'custom', position: { x: 460, y: 240 }, data: { label: 'Cloud Storage', type: 'gcp-storage', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'lb', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'lb', target: 'cloudrun', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'cloudrun', target: 'cloudsql', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'cloudrun', target: 'storage', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

export const gcpKubernetesTemplate: DiagramTemplate = {
  id: 'gcp-kubernetes',
  name: 'GCP GKE Platform',
  description: 'Kubernetes with GKE and Cloud SQL',
  category: 'architecture',
  nodes: [
    { id: 'users', type: 'custom', position: { x: 50, y: 180 }, data: { label: 'Users', type: 'users', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'lb', type: 'custom', position: { x: 180, y: 180 }, data: { label: 'Load Balancer', type: 'gcp-load-balancing', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'gke', type: 'custom', position: { x: 320, y: 180 }, data: { label: 'GKE Cluster', type: 'gcp-gke', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'ar', type: 'custom', position: { x: 320, y: 300 }, data: { label: 'Artifact Registry', type: 'gcp-artifact-registry', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'cloudsql', type: 'custom', position: { x: 480, y: 120 }, data: { label: 'Cloud SQL', type: 'gcp-cloud-sql', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'memorystore', type: 'custom', position: { x: 480, y: 240 }, data: { label: 'Memorystore', type: 'gcp-memorystore', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'lb', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'lb', target: 'gke', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'gke', target: 'cloudsql', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'gke', target: 'memorystore', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'ar', target: 'gke', type: 'smoothstep', sourceHandle: 'top', targetHandle: 'bottom' },
  ],
}

export const gcpDataAnalyticsTemplate: DiagramTemplate = {
  id: 'gcp-data-analytics',
  name: 'GCP Data Analytics',
  description: 'Data analytics with BigQuery and Dataflow',
  category: 'architecture',
  nodes: [
    { id: 'sources', type: 'custom', position: { x: 50, y: 180 }, data: { label: 'Data Sources', type: 'database', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'pubsub', type: 'custom', position: { x: 180, y: 180 }, data: { label: 'Pub/Sub', type: 'gcp-pubsub', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'dataflow', type: 'custom', position: { x: 320, y: 180 }, data: { label: 'Dataflow', type: 'gcp-dataflow', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'bigquery', type: 'custom', position: { x: 460, y: 180 }, data: { label: 'BigQuery', type: 'gcp-bigquery', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'looker', type: 'custom', position: { x: 600, y: 180 }, data: { label: 'Looker', type: 'gcp-looker', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'sources', target: 'pubsub', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'pubsub', target: 'dataflow', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'dataflow', target: 'bigquery', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'bigquery', target: 'looker', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

export const gcpEventDrivenTemplate: DiagramTemplate = {
  id: 'gcp-event-driven',
  name: 'GCP Event-Driven',
  description: 'Event-driven with Pub/Sub and Cloud Functions',
  category: 'architecture',
  nodes: [
    { id: 'producer', type: 'custom', position: { x: 50, y: 180 }, data: { label: 'Producer', type: 'gcp-functions', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'pubsub', type: 'custom', position: { x: 200, y: 180 }, data: { label: 'Pub/Sub', type: 'gcp-pubsub', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'func1', type: 'custom', position: { x: 350, y: 100 }, data: { label: 'Function 1', type: 'gcp-functions', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'func2', type: 'custom', position: { x: 350, y: 260 }, data: { label: 'Function 2', type: 'gcp-functions', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'firestore', type: 'custom', position: { x: 500, y: 180 }, data: { label: 'Firestore', type: 'gcp-firestore', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'producer', target: 'pubsub', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'pubsub', target: 'func1', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'pubsub', target: 'func2', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'func1', target: 'firestore', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'func2', target: 'firestore', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

export const gcpMLPlatformTemplate: DiagramTemplate = {
  id: 'gcp-ml-platform',
  name: 'GCP ML Platform',
  description: 'Machine learning with Vertex AI and BigQuery',
  category: 'architecture',
  nodes: [
    { id: 'data', type: 'custom', position: { x: 50, y: 180 }, data: { label: 'Cloud Storage', type: 'gcp-storage', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'bigquery', type: 'custom', position: { x: 200, y: 180 }, data: { label: 'BigQuery', type: 'gcp-bigquery', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'vertex', type: 'custom', position: { x: 350, y: 180 }, data: { label: 'Vertex AI', type: 'gcp-vertex-ai', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'endpoint', type: 'custom', position: { x: 500, y: 180 }, data: { label: 'Prediction', type: 'gcp-vertex-ai', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'monitor', type: 'custom', position: { x: 350, y: 300 }, data: { label: 'Monitoring', type: 'gcp-cloud-monitoring', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'data', target: 'bigquery', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'bigquery', target: 'vertex', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'vertex', target: 'endpoint', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'vertex', target: 'monitor', type: 'smoothstep', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

export const gcpIoTTemplate: DiagramTemplate = {
  id: 'gcp-iot',
  name: 'GCP IoT Platform',
  description: 'IoT with Pub/Sub and Cloud Functions',
  category: 'architecture',
  nodes: [
    { id: 'devices', type: 'custom', position: { x: 50, y: 180 }, data: { label: 'IoT Devices', type: 'mobile', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'iotcore', type: 'custom', position: { x: 200, y: 180 }, data: { label: 'IoT Core', type: 'gcp-pubsub', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'pubsub', type: 'custom', position: { x: 350, y: 180 }, data: { label: 'Pub/Sub', type: 'gcp-pubsub', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'functions', type: 'custom', position: { x: 500, y: 100 }, data: { label: 'Cloud Functions', type: 'gcp-functions', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'bigtable', type: 'custom', position: { x: 500, y: 260 }, data: { label: 'Bigtable', type: 'gcp-bigtable', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'devices', target: 'iotcore', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'iotcore', target: 'pubsub', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'pubsub', target: 'functions', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'pubsub', target: 'bigtable', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

export const gcpStaticWebsiteTemplate: DiagramTemplate = {
  id: 'gcp-static-website',
  name: 'GCP Static Website',
  description: 'Static website with Cloud Storage and CDN',
  category: 'architecture',
  nodes: [
    { id: 'users', type: 'custom', position: { x: 50, y: 150 }, data: { label: 'Users', type: 'users', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'dns', type: 'custom', position: { x: 180, y: 150 }, data: { label: 'Cloud DNS', type: 'gcp-cloud-dns', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'lb', type: 'custom', position: { x: 320, y: 150 }, data: { label: 'Load Balancer', type: 'gcp-load-balancing', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'cdn', type: 'custom', position: { x: 460, y: 150 }, data: { label: 'Cloud CDN', type: 'gcp-cloud-cdn', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'storage', type: 'custom', position: { x: 600, y: 150 }, data: { label: 'Cloud Storage', type: 'gcp-storage', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'dns', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'dns', target: 'lb', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'lb', target: 'cdn', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'cdn', target: 'storage', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

export const gcpCICDTemplate: DiagramTemplate = {
  id: 'gcp-cicd',
  name: 'GCP CI/CD Pipeline',
  description: 'CI/CD with Cloud Build and GKE',
  category: 'architecture',
  nodes: [
    { id: 'repo', type: 'custom', position: { x: 50, y: 150 }, data: { label: 'Source Repos', type: 'gcp-cloud-source-repos', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'build', type: 'custom', position: { x: 180, y: 150 }, data: { label: 'Cloud Build', type: 'gcp-cloud-build', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'ar', type: 'custom', position: { x: 320, y: 150 }, data: { label: 'Artifact Registry', type: 'gcp-artifact-registry', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'gke', type: 'custom', position: { x: 460, y: 150 }, data: { label: 'GKE', type: 'gcp-gke', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'storage', type: 'custom', position: { x: 320, y: 270 }, data: { label: 'Cloud Storage', type: 'gcp-storage', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'repo', target: 'build', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'build', target: 'ar', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'ar', target: 'gke', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'build', target: 'storage', type: 'smoothstep', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

export const gcpMonitoringTemplate: DiagramTemplate = {
  id: 'gcp-monitoring',
  name: 'GCP Monitoring Stack',
  description: 'Monitoring with Cloud Monitoring and Logging',
  category: 'architecture',
  nodes: [
    { id: 'app', type: 'custom', position: { x: 50, y: 180 }, data: { label: 'Application', type: 'gcp-compute-engine', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'monitoring', type: 'custom', position: { x: 200, y: 100 }, data: { label: 'Cloud Monitoring', type: 'gcp-cloud-monitoring', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'logging', type: 'custom', position: { x: 200, y: 260 }, data: { label: 'Cloud Logging', type: 'gcp-cloud-logging', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'trace', type: 'custom', position: { x: 350, y: 180 }, data: { label: 'Cloud Trace', type: 'gcp-cloud-trace', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'alerting', type: 'custom', position: { x: 500, y: 180 }, data: { label: 'Alerting', type: 'gcp-cloud-monitoring', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'app', target: 'monitoring', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'app', target: 'logging', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'monitoring', target: 'trace', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'logging', target: 'trace', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'trace', target: 'alerting', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

export const gcpVPCNetworkTemplate: DiagramTemplate = {
  id: 'gcp-vpc-network',
  name: 'GCP VPC Network',
  description: 'VPC with subnets and Cloud NAT',
  category: 'architecture',
  nodes: [
    { id: 'internet', type: 'custom', position: { x: 50, y: 180 }, data: { label: 'Internet', type: 'internet', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'lb', type: 'custom', position: { x: 180, y: 180 }, data: { label: 'Load Balancer', type: 'gcp-load-balancing', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'public', type: 'custom', position: { x: 320, y: 100 }, data: { label: 'Public Subnet', type: 'gcp-vpc', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'nat', type: 'custom', position: { x: 460, y: 180 }, data: { label: 'Cloud NAT', type: 'gcp-cloud-nat', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'private1', type: 'custom', position: { x: 600, y: 100 }, data: { label: 'Private Subnet 1', type: 'gcp-vpc', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
    { id: 'private2', type: 'custom', position: { x: 600, y: 260 }, data: { label: 'Private Subnet 2', type: 'gcp-vpc', style: { backgroundColor: 'transparent' } }, width: 64, height: 64 },
  ],
  edges: [
    { id: 'e1', source: 'internet', target: 'lb', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'lb', target: 'public', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'public', target: 'nat', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'nat', target: 'private1', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'nat', target: 'private2', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
  ],
}

// Export all templates
export const AWS_TEMPLATES: DiagramTemplate[] = [
  awsServerlessApiTemplate,
  awsMicroservicesTemplate,
  awsDataLakeTemplate,
  awsEventDrivenTemplate,
  awsContainerPlatformTemplate,
  awsStaticWebsiteTemplate,
  awsCICDTemplate,
  awsVPCNetworkTemplate,
  awsMLPipelineTemplate,
  awsIoTTemplate,
  awsRealTimeAnalyticsTemplate,
  awsMultiRegionDRTemplate,
  awsBatchProcessingTemplate,
  awsMonitoringStackTemplate,
  awsSecurityArchTemplate,
]

export const AZURE_TEMPLATES: DiagramTemplate[] = [
  azureMicroservicesTemplate,
  azureServerlessTemplate,
  azureDataPlatformTemplate,
  azureEventDrivenTemplate,
  azureIoTTemplate,
  azureStaticWebAppTemplate,
  azureDevOpsTemplate,
  azureMLPlatformTemplate,
  azureAppModernTemplate,
  azureMultiRegionTemplate,
  azureMonitoringTemplate,
  azureSecurityTemplate,
  azureHybridTemplate,
  azureMediaTemplate,
  azureB2CTemplate,
]

export const GCP_TEMPLATES: DiagramTemplate[] = [
  gcpServerlessTemplate,
  gcpKubernetesTemplate,
  gcpDataAnalyticsTemplate,
  gcpEventDrivenTemplate,
  gcpMLPlatformTemplate,
  gcpIoTTemplate,
  gcpStaticWebsiteTemplate,
  gcpCICDTemplate,
  gcpMonitoringTemplate,
  gcpVPCNetworkTemplate,
]

export const ALL_CLOUD_TEMPLATES: DiagramTemplate[] = [
  ...AWS_TEMPLATES,
  ...AZURE_TEMPLATES,
  ...GCP_TEMPLATES,
]
