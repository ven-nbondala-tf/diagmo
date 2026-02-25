/**
 * Architecture Scraper Service
 * Fetches architecture metadata from cloud providers and stores in Supabase
 */

import { supabase } from './supabase'

// Azure Architecture metadata (scraped from Azure Architecture Center)
// These are the actual architectures from https://learn.microsoft.com/en-us/azure/architecture/browse/
export const AZURE_ARCHITECTURES_METADATA = [
  // Web Applications
  { id: 'basic-web-app', name: 'Basic web application', description: 'Recommended architecture for a basic web application using Azure App Service and Azure SQL Database', categories: ['azure', 'web-app'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/web-apps/app-service/architectures/media/basic-web-app.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/web-apps/app-service/architectures/basic-web-app' },
  { id: 'scalable-web-app', name: 'Scalable web application', description: 'Use proven practices to improve scalability and performance in an Azure App Service web application', categories: ['azure', 'web-app'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/web-apps/app-service/architectures/media/scalable-web-app.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/web-apps/app-service/architectures/scalable-web-app' },
  { id: 'multi-region-web-app', name: 'Highly available multi-region web application', description: 'Run a web application in multiple regions to achieve high availability', categories: ['azure', 'web-app', 'hybrid'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/web-apps/app-service/architectures/media/multi-region.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/web-apps/app-service/architectures/multi-region' },
  { id: 'serverless-web-app', name: 'Serverless web application', description: 'Build serverless web apps with Azure Functions and other services', categories: ['azure', 'web-app', 'serverless'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/web-apps/serverless/architectures/media/serverless-web-app.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/web-apps/serverless/architectures/web-app' },
  { id: 'static-web-app', name: 'Static website with Azure Static Web Apps', description: 'Deploy static web content with Azure Static Web Apps and Azure Functions', categories: ['azure', 'web-app', 'serverless'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/web-apps/serverless/architectures/media/static-content-hosting.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/web-apps/serverless/architectures/static-content-hosting' },

  // Microservices & Containers
  { id: 'aks-microservices', name: 'Microservices architecture on AKS', description: 'Deploy a microservices architecture on Azure Kubernetes Service', categories: ['azure', 'containers', 'web-app'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/microservices/images/aks.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/containers/aks-microservices/aks-microservices' },
  { id: 'aks-baseline', name: 'AKS baseline architecture', description: 'Baseline infrastructure architecture for deploying an AKS cluster', categories: ['azure', 'containers'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/containers/aks/images/baseline-architecture.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/containers/aks/baseline-aks' },
  { id: 'aks-multi-region', name: 'AKS baseline for multi-region clusters', description: 'Run multiple AKS clusters across regions for high availability', categories: ['azure', 'containers', 'hybrid'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/containers/aks-multi-region/media/aks-multi-cluster.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/containers/aks-multi-region/aks-multi-cluster' },
  { id: 'container-instances', name: 'Container Instances for batch jobs', description: 'Use Azure Container Instances for on-demand batch processing', categories: ['azure', 'containers', 'serverless'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/media/container-instances-integration.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/articles/container-instances-integration' },

  // Data & Analytics
  { id: 'modern-data-warehouse', name: 'Modern data warehouse', description: 'Build a modern data warehouse using Azure Synapse Analytics', categories: ['azure', 'data-analytics'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/media/enterprise-data-warehouse.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/articles/enterprise-data-warehouse' },
  { id: 'real-time-analytics', name: 'Real-time analytics on big data', description: 'Process streaming data with Azure Stream Analytics and Power BI', categories: ['azure', 'data-analytics', 'iot'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/media/real-time-analytics.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/articles/real-time-analytics' },
  { id: 'data-lake', name: 'Modern analytics architecture with Azure Databricks', description: 'Create a modern analytics architecture using Azure Databricks', categories: ['azure', 'data-analytics'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/media/azure-databricks-modern-analytics-architecture.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/articles/azure-databricks-modern-analytics-architecture' },
  { id: 'stream-processing', name: 'Stream processing with Azure Stream Analytics', description: 'Build a stream processing pipeline with Azure Event Hubs and Stream Analytics', categories: ['azure', 'data-analytics', 'iot'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/data/images/stream-processing-asa.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/data/stream-processing-stream-analytics' },
  { id: 'synapse-analytics', name: 'Analytics end-to-end with Azure Synapse', description: 'End-to-end analytics solution using Azure Synapse Analytics', categories: ['azure', 'data-analytics'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/example-scenario/dataplate2e/media/azure-analytics-end-to-end.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/example-scenario/dataplate2e/data-platform-end-to-end' },

  // AI & Machine Learning
  { id: 'mlops', name: 'Machine learning operations (MLOps)', description: 'Implement MLOps to manage machine learning models at scale', categories: ['azure', 'ai-ml', 'devops'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/images/mlops-maturity-model.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/mlops-maturity-model' },
  { id: 'openai-chatbot', name: 'Azure OpenAI chat baseline', description: 'Build a chat application using Azure OpenAI Service', categories: ['azure', 'ai-ml', 'web-app'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/ai-ml/architecture/media/baseline-openai-e2e-chat.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/ai-ml/architecture/baseline-openai-e2e-chat' },
  { id: 'cognitive-search', name: 'Enterprise search with Azure AI Search', description: 'Build enterprise search solutions with Azure AI Search', categories: ['azure', 'ai-ml', 'data-analytics'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/media/cognitive-search-with-skillsets.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/articles/cognitive-search-with-skillsets' },
  { id: 'batch-scoring', name: 'Batch scoring for ML models', description: 'Run batch scoring of machine learning models on Azure', categories: ['azure', 'ai-ml'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/ai-ml/architecture/media/batch-scoring-python.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/ai-ml/architecture/batch-scoring-python' },
  { id: 'rag-architecture', name: 'RAG architecture with Azure OpenAI', description: 'Retrieval-Augmented Generation pattern using Azure OpenAI', categories: ['azure', 'ai-ml'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/ai-ml/architecture/media/rag-solution-development.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/ai-ml/architecture/rag-solution-development' },

  // IoT
  { id: 'iot-reference', name: 'Azure IoT reference architecture', description: 'Recommended architecture for IoT applications using Azure IoT Hub', categories: ['azure', 'iot'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/iot/images/iot.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/iot/' },
  { id: 'iot-analytics', name: 'IoT analytics with Azure Data Explorer', description: 'Analyze IoT data at scale using Azure Data Explorer', categories: ['azure', 'iot', 'data-analytics'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/media/iot-azure-data-explorer.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/articles/iot-azure-data-explorer' },
  { id: 'iot-edge', name: 'IoT Edge architecture', description: 'Deploy Azure IoT Edge for edge computing scenarios', categories: ['azure', 'iot', 'hybrid'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/iot/images/iot-edge-logical.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/iot/iot-architecture-overview' },
  { id: 'digital-twins', name: 'Azure Digital Twins with IoT', description: 'Build a digital twin solution with Azure Digital Twins', categories: ['azure', 'iot'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/iot/images/azure-digital-twins-core.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/iot/azure-digital-twins-core' },

  // DevOps & CI/CD
  { id: 'devops-pipeline', name: 'CI/CD pipeline with Azure DevOps', description: 'Build CI/CD pipelines using Azure DevOps for container applications', categories: ['azure', 'devops', 'containers'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/media/container-cicd-using-jenkins-and-kubernetes-on-azure-container-service.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/articles/container-cicd-using-jenkins-and-kubernetes-on-azure-container-service' },
  { id: 'gitops-aks', name: 'GitOps for AKS', description: 'Implement GitOps workflow for Azure Kubernetes Service', categories: ['azure', 'devops', 'containers'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/guide/aks/images/gitops-ci-cd-flux.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/guide/aks/gitops-ci-cd-flux' },
  { id: 'infrastructure-as-code', name: 'Infrastructure as Code with Terraform', description: 'Deploy Azure infrastructure using Terraform', categories: ['azure', 'devops'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/media/devsecops-infrastructure-as-code.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/articles/devsecops-infrastructure-as-code' },
  { id: 'blue-green-deployment', name: 'Blue-green deployment', description: 'Implement blue-green deployment strategy on Azure', categories: ['azure', 'devops'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/example-scenario/blue-green-spring/media/blue-green-deployment.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/example-scenario/blue-green-spring/blue-green-spring' },

  // Networking
  { id: 'hub-spoke', name: 'Hub-spoke network topology', description: 'Implement a hub-spoke network topology in Azure', categories: ['azure', 'networking'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/networking/architecture/images/hub-spoke.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/networking/architecture/hub-spoke' },
  { id: 'private-link', name: 'Private Link architecture', description: 'Use Azure Private Link for private connectivity', categories: ['azure', 'networking', 'security'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/networking/architecture/images/private-link-hub-spoke.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/networking/architecture/private-link-hub-spoke-network' },
  { id: 'virtual-wan', name: 'Virtual WAN architecture', description: 'Build global transit network with Azure Virtual WAN', categories: ['azure', 'networking'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/networking/architecture/images/virtual-wan-architecture.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/networking/architecture/virtual-wan-network-topology' },
  { id: 'expressroute', name: 'ExpressRoute connectivity', description: 'Connect on-premises to Azure using ExpressRoute', categories: ['azure', 'networking', 'hybrid'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/hybrid-networking/images/expressroute.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/hybrid-networking/expressroute' },
  { id: 'vpn-gateway', name: 'VPN Gateway connectivity', description: 'Connect on-premises networks to Azure using VPN Gateway', categories: ['azure', 'networking', 'hybrid'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/hybrid-networking/images/vpn.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/hybrid-networking/vpn' },
  { id: 'firewall-application-gateway', name: 'Firewall and Application Gateway', description: 'Zero-trust network with Azure Firewall and Application Gateway', categories: ['azure', 'networking', 'security'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/networking/architecture/images/azure-firewall-architecture-guide.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/networking/architecture/application-gateway-before-azure-firewall' },

  // Security
  { id: 'landing-zone', name: 'Azure Landing Zone', description: 'Enterprise-scale landing zone architecture', categories: ['azure', 'security', 'hybrid'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/landing-zones/images/caf-ready-lz.svg', source: 'https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/' },
  { id: 'zero-trust', name: 'Zero Trust architecture', description: 'Implement Zero Trust security model on Azure', categories: ['azure', 'security'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/example-scenario/gateway/media/gateway-routing.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/example-scenario/gateway/gateway-routing' },
  { id: 'identity-management', name: 'Identity management', description: 'Manage identities with Microsoft Entra ID', categories: ['azure', 'security'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/identity/images/azure-ad.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/identity/identity-start-here' },
  { id: 'security-operations', name: 'Security operations center', description: 'Build a SOC with Microsoft Sentinel', categories: ['azure', 'security'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/media/sentinel-automated-response.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/articles/microsoft-sentinel-automated-response' },

  // Hybrid & Migration
  { id: 'hybrid-dns', name: 'Hybrid DNS solution', description: 'Design a hybrid DNS solution using Azure', categories: ['azure', 'hybrid', 'networking'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/hybrid/hybrid-dns-infra/media/azure-dns-private-resolver.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/hybrid/hybrid-dns-infra' },
  { id: 'arc-hybrid', name: 'Azure Arc hybrid management', description: 'Manage hybrid resources with Azure Arc', categories: ['azure', 'hybrid'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/hybrid/azure-arc-hybrid-config/media/azure-arc-hybrid-config.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/hybrid/azure-arc-hybrid-config' },
  { id: 'disaster-recovery', name: 'Disaster recovery with Azure Site Recovery', description: 'Implement DR for on-premises workloads', categories: ['azure', 'hybrid', 'migration'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/media/disaster-recovery-smb-azure-site-recovery.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/articles/disaster-recovery-smb-azure-site-recovery' },
  { id: 'migration-assessment', name: 'Migration assessment', description: 'Assess and plan Azure migration', categories: ['azure', 'migration'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/cloud-adoption/migrate/azure-migration-guide/media/migration-overview.svg', source: 'https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/migrate/' },

  // SAP
  { id: 'sap-hana', name: 'SAP HANA on Azure', description: 'Deploy SAP HANA on Azure VMs', categories: ['azure', 'sap'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/sap/images/sap-hana-scale-up.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/sap/sap-hana' },
  { id: 'sap-netweaver', name: 'SAP NetWeaver on Azure', description: 'Deploy SAP NetWeaver applications on Azure', categories: ['azure', 'sap'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/sap/images/sap-netweaver.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/sap/sap-netweaver' },
  { id: 'sap-s4hana', name: 'SAP S/4HANA on Azure', description: 'Deploy SAP S/4HANA on Azure VMs', categories: ['azure', 'sap'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/sap/images/sap-s4hana.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/sap/sap-s4hana' },

  // Industry - Healthcare
  { id: 'healthcare-data', name: 'Healthcare data solutions', description: 'Build healthcare data solutions with Azure Health Data Services', categories: ['azure', 'healthcare', 'data-analytics'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/industries/healthcare/images/health-data-consortium.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/industries/healthcare/healthcare-data-consortium' },
  { id: 'clinical-insights', name: 'Clinical insights', description: 'Extract clinical insights using Azure AI', categories: ['azure', 'healthcare', 'ai-ml'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/industries/healthcare/images/clinical-insights.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/industries/healthcare/clinical-insights' },

  // Industry - Financial
  { id: 'banking-system', name: 'Core banking system', description: 'Modernize core banking on Azure', categories: ['azure', 'financial'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/industries/finance/images/core-banking.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/industries/finance/core-banking-system-integration' },
  { id: 'fraud-detection', name: 'Fraud detection', description: 'Real-time fraud detection using Azure', categories: ['azure', 'financial', 'ai-ml'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/media/fraud-detection.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/articles/fraud-detection' },

  // Industry - Retail
  { id: 'ecommerce-search', name: 'E-commerce search', description: 'Build intelligent product search for e-commerce', categories: ['azure', 'retail', 'ai-ml'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/media/ecommerce-website-running-on-azure.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/articles/ecommerce-website-running-on-azure' },
  { id: 'retail-recommendation', name: 'Product recommendations', description: 'Build product recommendation engine', categories: ['azure', 'retail', 'ai-ml'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/media/product-recommendations.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/articles/product-recommendations' },

  // Industry - Gaming
  { id: 'gaming-backend', name: 'Gaming backend', description: 'Scalable gaming backend on Azure', categories: ['azure', 'gaming'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/media/gaming-using-cosmos-db.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/articles/gaming-using-cosmos-db' },
  { id: 'multiplayer-gaming', name: 'Multiplayer gaming', description: 'Build multiplayer gaming infrastructure', categories: ['azure', 'gaming'], thumbnail: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/media/gaming-using-azure-redis-cache.svg', source: 'https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/articles/gaming-using-azure-redis-cache' },
]

// AWS Architecture metadata (from AWS Architecture Center)
export const AWS_ARCHITECTURES_METADATA = [
  // Web Applications
  { id: 'aws-3tier-web', name: 'Three-tier web application', description: 'Build a scalable three-tier architecture on AWS', categories: ['aws', 'web-app'], thumbnail: 'https://d1.awsstatic.com/architecture-diagrams/ArchitectureDiagrams/three-tier-web-architecture-ra.pdf', source: 'https://aws.amazon.com/architecture/web-application-hosting-web-application-reference-architecture/' },
  { id: 'aws-serverless-web', name: 'Serverless web application', description: 'Build serverless web apps with AWS Lambda', categories: ['aws', 'web-app', 'serverless'], thumbnail: 'https://d1.awsstatic.com/product-marketing/Lambda/Diagrams/product-page-diagram_Lambda-WebApplications%202.c7f8cf38e12cb1daae9965ca048e10d676094dc1.png', source: 'https://aws.amazon.com/lambda/web-apps/' },
  { id: 'aws-static-hosting', name: 'Static website hosting', description: 'Host static websites with S3 and CloudFront', categories: ['aws', 'web-app', 'serverless'], thumbnail: 'https://d1.awsstatic.com/Projects/v1/AWS_StaticWebsiteHosting_Architecture_4b.da7f28eb4f76da574c98a8b2898af8f5d3150e48.png', source: 'https://aws.amazon.com/getting-started/hands-on/host-static-website/' },

  // Containers
  { id: 'aws-eks-microservices', name: 'Microservices on Amazon EKS', description: 'Deploy microservices on Amazon EKS', categories: ['aws', 'containers', 'web-app'], thumbnail: 'https://d1.awsstatic.com/architecture-diagrams/ArchitectureDiagrams/amazon-eks-ref-arch-ra.pdf', source: 'https://aws.amazon.com/architecture/microservices/' },
  { id: 'aws-ecs-fargate', name: 'Containers with AWS Fargate', description: 'Run containers without managing infrastructure', categories: ['aws', 'containers', 'serverless'], thumbnail: 'https://d1.awsstatic.com/product-marketing/Fargate/Product-Page-Diagram_AWS-Fargate.a0e0a3798fed66e62fd7ef1e5ef6f6ee8a4aebe8.png', source: 'https://aws.amazon.com/fargate/' },

  // Data & Analytics
  { id: 'aws-data-lake', name: 'Data lake architecture', description: 'Build a data lake on AWS', categories: ['aws', 'data-analytics'], thumbnail: 'https://d1.awsstatic.com/Solutions/data-lake/data-lake-ra-updated.09bf3b8ceacd2d6cf7f5e32cc3855e1f3e7a0b8e.png', source: 'https://aws.amazon.com/solutions/implementations/data-lake-solution/' },
  { id: 'aws-redshift-warehouse', name: 'Data warehouse with Redshift', description: 'Build a cloud data warehouse with Amazon Redshift', categories: ['aws', 'data-analytics'], thumbnail: 'https://d1.awsstatic.com/product-marketing/Redshift/Product-page-diagram_Amazon-Redshift.png', source: 'https://aws.amazon.com/redshift/' },
  { id: 'aws-real-time-analytics', name: 'Real-time analytics', description: 'Process streaming data with Kinesis', categories: ['aws', 'data-analytics', 'iot'], thumbnail: 'https://d1.awsstatic.com/architecture-diagrams/ArchitectureDiagrams/real-time-streaming-data-pipeline-ra.pdf', source: 'https://aws.amazon.com/kinesis/' },

  // AI & ML
  { id: 'aws-sagemaker-ml', name: 'Machine learning with SageMaker', description: 'Build, train, and deploy ML models', categories: ['aws', 'ai-ml'], thumbnail: 'https://d1.awsstatic.com/product-marketing/SageMaker/sagemaker_how-it-works.b1a03d71df5ec20e5a7cc5ea52cf8f20a83be34d.png', source: 'https://aws.amazon.com/sagemaker/' },
  { id: 'aws-bedrock-genai', name: 'Generative AI with Bedrock', description: 'Build generative AI applications with Amazon Bedrock', categories: ['aws', 'ai-ml'], thumbnail: 'https://d1.awsstatic.com/product-marketing/bedrock/how-it-works-bedrock.0abc6e3f93e24e5e7e5d5c5c0f2b7b4a1c3f9f6d.png', source: 'https://aws.amazon.com/bedrock/' },

  // IoT
  { id: 'aws-iot-platform', name: 'IoT platform architecture', description: 'Build IoT solutions with AWS IoT', categories: ['aws', 'iot'], thumbnail: 'https://d1.awsstatic.com/IoT/diagrams/AWS-IoT-Core_How-It-Works.c29eda4a6a61ce4aac82eeccc6a2e01b05927c39.png', source: 'https://aws.amazon.com/iot/' },
  { id: 'aws-iot-greengrass', name: 'Edge computing with Greengrass', description: 'Extend AWS to edge devices', categories: ['aws', 'iot', 'hybrid'], thumbnail: 'https://d1.awsstatic.com/IoT/diagrams/AWS%20IoT%20Greengrass%20V2%20Diagram.a41a9497e2e8e2e8e8e8e8e8e8e8e8e8.png', source: 'https://aws.amazon.com/greengrass/' },

  // DevOps
  { id: 'aws-cicd-pipeline', name: 'CI/CD pipeline', description: 'Build CI/CD pipelines with AWS CodePipeline', categories: ['aws', 'devops'], thumbnail: 'https://d1.awsstatic.com/product-marketing/CodePipeline/Product-Page-Diagram_AWS-CodePipeline.png', source: 'https://aws.amazon.com/codepipeline/' },
  { id: 'aws-devops-tools', name: 'DevOps toolchain', description: 'Complete DevOps toolchain on AWS', categories: ['aws', 'devops'], thumbnail: 'https://d1.awsstatic.com/product-marketing/DevOps/DevOps_feedback_diagram.png', source: 'https://aws.amazon.com/devops/' },

  // Networking & Security
  { id: 'aws-vpc-design', name: 'VPC design', description: 'Design VPCs for enterprise applications', categories: ['aws', 'networking'], thumbnail: 'https://d1.awsstatic.com/getting-started/what-is-a-vpc/vpc-diagram.png', source: 'https://aws.amazon.com/vpc/' },
  { id: 'aws-hybrid-connectivity', name: 'Hybrid connectivity', description: 'Connect on-premises to AWS', categories: ['aws', 'networking', 'hybrid'], thumbnail: 'https://d1.awsstatic.com/Product-Marketing/Direct%20Connect/product-page-diagram_AWS-Direct-Connect.png', source: 'https://aws.amazon.com/directconnect/' },
  { id: 'aws-security-reference', name: 'Security reference architecture', description: 'AWS security best practices', categories: ['aws', 'security'], thumbnail: 'https://d1.awsstatic.com/aws-answers/AWS_Security_Reference_Architecture.png', source: 'https://docs.aws.amazon.com/prescriptive-guidance/latest/security-reference-architecture/welcome.html' },
]

// GCP Architecture metadata (from Google Cloud Architecture Center)
export const GCP_ARCHITECTURES_METADATA = [
  // Web Applications
  { id: 'gcp-3tier-webapp', name: 'Three-tier web app', description: 'Deploy a scalable three-tier web application', categories: ['gcp', 'web-app'], thumbnail: 'https://cloud.google.com/static/architecture/images/three-tier-web-app.svg', source: 'https://cloud.google.com/architecture/web-serving-overview' },
  { id: 'gcp-serverless-web', name: 'Serverless web application', description: 'Build serverless apps with Cloud Run', categories: ['gcp', 'web-app', 'serverless'], thumbnail: 'https://cloud.google.com/static/run/docs/images/cloud-run-architecture.svg', source: 'https://cloud.google.com/run/docs/overview/what-is-cloud-run' },

  // Containers
  { id: 'gcp-gke-microservices', name: 'Microservices on GKE', description: 'Deploy microservices on Google Kubernetes Engine', categories: ['gcp', 'containers', 'web-app'], thumbnail: 'https://cloud.google.com/static/architecture/images/microservices-architecture-on-gke.svg', source: 'https://cloud.google.com/architecture/microservices-architecture-on-gke' },
  { id: 'gcp-anthos', name: 'Hybrid with Anthos', description: 'Build hybrid cloud with Anthos', categories: ['gcp', 'containers', 'hybrid'], thumbnail: 'https://cloud.google.com/static/anthos/docs/images/anthos-multicloud.svg', source: 'https://cloud.google.com/anthos' },

  // Data & Analytics
  { id: 'gcp-bigquery-warehouse', name: 'Data warehouse with BigQuery', description: 'Build a data warehouse using BigQuery', categories: ['gcp', 'data-analytics'], thumbnail: 'https://cloud.google.com/static/bigquery/images/architecture-modern-bi-platform.svg', source: 'https://cloud.google.com/bigquery/docs/reference-architecture' },
  { id: 'gcp-data-lake', name: 'Data lake architecture', description: 'Build a data lake on Google Cloud', categories: ['gcp', 'data-analytics'], thumbnail: 'https://cloud.google.com/static/architecture/images/data-lake-on-gcp.svg', source: 'https://cloud.google.com/architecture/build-a-data-lake-on-gcp' },
  { id: 'gcp-dataflow-streaming', name: 'Stream processing with Dataflow', description: 'Process streaming data with Cloud Dataflow', categories: ['gcp', 'data-analytics', 'iot'], thumbnail: 'https://cloud.google.com/static/dataflow/docs/images/dataflow-streaming-pipeline.svg', source: 'https://cloud.google.com/dataflow/docs/concepts/streaming-pipelines' },

  // AI & ML
  { id: 'gcp-vertex-ai', name: 'ML with Vertex AI', description: 'Build and deploy ML models with Vertex AI', categories: ['gcp', 'ai-ml'], thumbnail: 'https://cloud.google.com/static/vertex-ai/docs/images/mlops-workflow.svg', source: 'https://cloud.google.com/vertex-ai' },
  { id: 'gcp-generative-ai', name: 'Generative AI architecture', description: 'Build generative AI apps on Google Cloud', categories: ['gcp', 'ai-ml'], thumbnail: 'https://cloud.google.com/static/architecture/images/generative-ai-reference-architecture.svg', source: 'https://cloud.google.com/architecture/generative-ai-reference-architecture' },

  // IoT
  { id: 'gcp-iot-platform', name: 'IoT architecture', description: 'Build IoT solutions on Google Cloud', categories: ['gcp', 'iot'], thumbnail: 'https://cloud.google.com/static/architecture/images/iot-overview.svg', source: 'https://cloud.google.com/architecture/iot-overview' },

  // DevOps
  { id: 'gcp-cicd', name: 'CI/CD with Cloud Build', description: 'Implement CI/CD with Cloud Build', categories: ['gcp', 'devops'], thumbnail: 'https://cloud.google.com/static/build/images/cloud-build-architecture.svg', source: 'https://cloud.google.com/build/docs/overview' },

  // Networking & Security
  { id: 'gcp-vpc-design', name: 'VPC network design', description: 'Design VPC networks on Google Cloud', categories: ['gcp', 'networking'], thumbnail: 'https://cloud.google.com/static/vpc/images/vpc-overview.svg', source: 'https://cloud.google.com/vpc/docs/vpc' },
  { id: 'gcp-hybrid-connectivity', name: 'Hybrid connectivity', description: 'Connect on-premises to Google Cloud', categories: ['gcp', 'networking', 'hybrid'], thumbnail: 'https://cloud.google.com/static/architecture/images/hybrid-connectivity.svg', source: 'https://cloud.google.com/architecture/hybrid-connectivity' },
]

// Combine all architectures
export const ALL_ARCHITECTURES_METADATA = [
  ...AZURE_ARCHITECTURES_METADATA,
  ...AWS_ARCHITECTURES_METADATA,
  ...GCP_ARCHITECTURES_METADATA,
]

export interface ArchitectureMetadata {
  id: string
  name: string
  description: string
  categories: string[]
  thumbnail: string
  source: string
}

/**
 * Import architecture metadata to Supabase
 */
export async function importArchitectureMetadata(): Promise<{
  success: boolean
  imported: number
  skipped: number
  errors: string[]
}> {
  const result = {
    success: true,
    imported: 0,
    skipped: 0,
    errors: [] as string[],
  }

  for (const arch of ALL_ARCHITECTURES_METADATA) {
    try {
      // Check if already exists
      const { data: existing } = await supabase
        .from('architecture_templates')
        .select('id')
        .eq('template_id', arch.id)
        .single()

      if (existing) {
        result.skipped++
        continue
      }

      // Insert with thumbnail URL (no nodes/edges - just metadata)
      const { error } = await supabase.from('architecture_templates').insert({
        template_id: arch.id,
        name: arch.name,
        description: arch.description,
        categories: arch.categories,
        complexity: 'intermediate', // Default
        source: arch.source,
        tags: arch.categories, // Use categories as tags
        use_cases: [],
        nodes: [], // Empty - will be populated later or user creates their own
        edges: [],
        thumbnail_url: arch.thumbnail,
        is_built_in: true,
        is_published: true,
      })

      if (error) {
        result.errors.push(`${arch.id}: ${error.message}`)
      } else {
        result.imported++
      }
    } catch (err) {
      result.errors.push(`${arch.id}: ${String(err)}`)
    }
  }

  result.success = result.errors.length === 0
  return result
}

/**
 * Get count of available architectures by provider
 */
export function getArchitectureCounts(): Record<string, number> {
  return {
    azure: AZURE_ARCHITECTURES_METADATA.length,
    aws: AWS_ARCHITECTURES_METADATA.length,
    gcp: GCP_ARCHITECTURES_METADATA.length,
    total: ALL_ARCHITECTURES_METADATA.length,
  }
}
