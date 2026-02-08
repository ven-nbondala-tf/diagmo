/**
 * Cloud Icons Registry
 *
 * This file aggregates icons from all cloud providers.
 * Each provider's icons are in separate files for code-splitting:
 * - ./aws/index.tsx - AWS icons
 * - ./azure/index.tsx - Azure icons
 * - ./gcp/index.tsx - GCP icons
 * - ./generic/index.tsx - Generic + Office icons
 *
 * For lazy loading by provider, use LazyCloudIcon component.
 */

// Note: Individual icons can be imported directly from provider files:
// import { AwsEc2Icon } from './aws'
// import { AzureVmIcon } from './azure'
// import { GcpComputeIcon } from './gcp'
// import { KubernetesIcon } from './generic'

// Import all icons for the registry
import * as AwsIcons from './aws'
import * as AzureIcons from './azure'
import * as GcpIcons from './gcp'
import * as GenericIcons from './generic'

/**
 * Combined registry of all cloud icons
 * Maps icon type keys to their React components
 */
export const cloudIconComponents = {
  // AWS - Core
  'aws-ec2': AwsIcons.AwsEc2Icon,
  'aws-s3': AwsIcons.AwsS3Icon,
  'aws-lambda': AwsIcons.AwsLambdaIcon,
  'aws-rds': AwsIcons.AwsRdsIcon,
  'aws-dynamodb': AwsIcons.AwsDynamoDbIcon,
  'aws-api-gateway': AwsIcons.AwsApiGatewayIcon,
  'aws-sns': AwsIcons.AwsSnsIcon,
  'aws-sqs': AwsIcons.AwsSqsIcon,
  'aws-cloudfront': AwsIcons.AwsCloudFrontIcon,
  'aws-route53': AwsIcons.AwsRoute53Icon,
  'aws-vpc': AwsIcons.AwsVpcIcon,
  'aws-iam': AwsIcons.AwsIamIcon,
  'aws-ecs': AwsIcons.AwsEcsIcon,
  'aws-eks': AwsIcons.AwsEksIcon,
  // AWS - AI/ML
  'aws-bedrock': AwsIcons.AwsBedrockIcon,
  'aws-q': AwsIcons.AwsQIcon,
  // AWS - Networking Additional
  'aws-nat-gateway': AwsIcons.AwsNatGatewayIcon,
  'aws-internet-gateway': AwsIcons.AwsInternetGatewayIcon,
  'aws-elb': AwsIcons.AwsElbIcon,
  // AWS - Additional Services (from GCP file - legacy location)
  'aws-cognito': GcpIcons.AwsCognitoIcon,
  'aws-ecr': GcpIcons.AwsEcrIcon,
  'aws-elasticache': GcpIcons.AwsElastiCacheIcon,
  'aws-secrets-manager': GcpIcons.AwsSecretsManagerIcon,
  'aws-cloudwatch': GcpIcons.AwsCloudWatchIcon,
  'aws-kinesis': GcpIcons.AwsKinesisIcon,
  'aws-glue': GcpIcons.AwsGlueIcon,
  'aws-athena': GcpIcons.AwsAthenaIcon,
  'aws-quicksight': GcpIcons.AwsQuickSightIcon,
  'aws-opensearch': GcpIcons.AwsOpenSearchIcon,
  // Azure - Core (available icons)
  'azure-vm': AzureIcons.AzureVmIcon,
  'azure-storage': AzureIcons.AzureStorageIcon,
  'azure-functions': AzureIcons.AzureFunctionsIcon,
  'azure-sql': AzureIcons.AzureSqlIcon,
  'azure-cosmos': AzureIcons.AzureCosmosIcon,
  'azure-app-service': AzureIcons.AzureAppServiceIcon,
  'azure-aks': AzureIcons.AzureAksIcon,
  'azure-cdn': AzureIcons.AzureCdnIcon,
  'azure-vnet': AzureIcons.AzureVnetIcon,
  'azure-keyvault': AzureIcons.AzureKeyVaultIcon,
  // Azure - Microsoft Fabric
  'azure-fabric': AzureIcons.AzureFabricIcon,
  'azure-fabric-lakehouse': AzureIcons.AzureFabricLakehouseIcon,
  'azure-fabric-warehouse': AzureIcons.AzureFabricWarehouseIcon,
  'azure-fabric-eventhouse': AzureIcons.AzureFabricEventhouseIcon,
  'azure-onelake': AzureIcons.AzureOneLakeIcon,
  'azure-fabric-pipeline': AzureIcons.AzureFabricPipelineIcon,
  'azure-power-bi': AzureIcons.AzurePowerBIIcon,
  'azure-fabric-spark': AzureIcons.AzureFabricSparkIcon,
  'azure-fabric-dataflow': AzureIcons.AzureFabricDataflowIcon,
  'azure-entra-id': AzureIcons.AzureEntraIdIcon,
  'azure-openai': AzureIcons.AzureOpenAIIcon,
  // Azure - Additional Services (from GCP file - legacy location)
  'azure-front-door': GcpIcons.AzureFrontDoorIcon,
  'azure-redis-cache': GcpIcons.AzureRedisCacheIcon,
  'azure-api-management': GcpIcons.AzureAPIManagementIcon,
  'azure-event-hub': GcpIcons.AzureEventHubIcon,
  'azure-event-grid': GcpIcons.AzureEventGridIcon,
  'azure-service-bus': GcpIcons.AzureServiceBusIcon,
  'azure-container-registry': GcpIcons.AzureContainerRegistryIcon,
  'azure-monitor': GcpIcons.AzureMonitorIcon,
  'azure-machine-learning': GcpIcons.AzureMachineLearningIcon,
  'azure-cognitive-services': GcpIcons.AzureCognitiveServicesIcon,
  'azure-synapse': GcpIcons.AzureSynapseIcon,
  // GCP - Core
  'gcp-compute': GcpIcons.GcpComputeIcon,
  'gcp-functions': GcpIcons.GcpFunctionsIcon,
  'gcp-app-engine': GcpIcons.GcpAppEngineIcon,
  'gcp-cloud-run': GcpIcons.GcpCloudRunIcon,
  'gcp-gke': GcpIcons.GcpGkeIcon,
  'gcp-storage': GcpIcons.GcpStorageIcon,
  'gcp-cloud-sql': GcpIcons.GcpCloudSqlIcon,
  'gcp-firestore': GcpIcons.GcpFirestoreIcon,
  'gcp-bigtable': GcpIcons.GcpBigtableIcon,
  'gcp-spanner': GcpIcons.GcpSpannerIcon,
  'gcp-vpc': GcpIcons.GcpVpcIcon,
  'gcp-load-balancing': GcpIcons.GcpLoadBalancingIcon,
  'gcp-cloud-cdn': GcpIcons.GcpCloudCdnIcon,
  'gcp-iam': GcpIcons.GcpIamIcon,
  'gcp-bigquery': GcpIcons.GcpBigQueryIcon,
  'gcp-pubsub': GcpIcons.GcpPubSubIcon,
  // GCP - AI/ML
  'gcp-vertex-ai': GcpIcons.GcpVertexAiIcon,
  'gcp-gemini': GcpIcons.GcpGeminiIcon,
  // GCP - Additional Services
  'gcp-dataflow': GcpIcons.GcpDataflowIcon,
  'gcp-looker': GcpIcons.GcpLookerIcon,
  'gcp-artifact-registry': GcpIcons.GcpArtifactRegistryIcon,
  'gcp-memorystore': GcpIcons.GcpMemorystoreIcon,
  'gcp-secret-manager': GcpIcons.GcpSecretManagerIcon,
  'gcp-cloud-monitoring': GcpIcons.GcpCloudMonitoringIcon,
  // Generic
  'kubernetes': GenericIcons.KubernetesIcon,
  'docker': GenericIcons.DockerIcon,
  'generic-api': GenericIcons.ApiIcon,
  'generic-database': GenericIcons.GenericDatabaseIcon,
  'generic-cache': GenericIcons.CacheIcon,
  'generic-queue': GenericIcons.QueueIcon,
  'generic-load-balancer': GenericIcons.LoadBalancerIcon,
  'generic-cdn': GenericIcons.CdnIcon,
  // Microsoft Office
  'office-word': GenericIcons.OfficeWordIcon,
  'office-excel': GenericIcons.OfficeExcelIcon,
  'office-powerpoint': GenericIcons.OfficePowerPointIcon,
  'office-outlook': GenericIcons.OfficeOutlookIcon,
  'office-teams': GenericIcons.OfficeTeamsIcon,
  'office-onedrive': GenericIcons.OfficeOneDriveIcon,
  'office-sharepoint': GenericIcons.OfficeSharePointIcon,
  'office-onenote': GenericIcons.OfficeOneNoteIcon,
  'office-access': GenericIcons.OfficeAccessIcon,
  'office-publisher': GenericIcons.OfficePublisherIcon,
  'office-visio': GenericIcons.OfficeVisioIcon,
  'office-project': GenericIcons.OfficeProjectIcon,
  // Microsoft 365 - Additional
  'm365': GenericIcons.M365Icon,
  'm365-copilot': GenericIcons.CopilotIcon,
  // Power Platform
  'power-bi': GenericIcons.PowerBIIcon,
  'power-apps': GenericIcons.PowerAppsIcon,
  'power-automate': GenericIcons.PowerAutomateIcon,
  'power-virtual-agents': GenericIcons.PowerVirtualAgentsIcon,
  // Microsoft 365 - Collaboration
  'm365-planner': GenericIcons.PlannerIcon,
  'm365-todo': GenericIcons.ToDoIcon,
  'm365-forms': GenericIcons.FormsIcon,
  'm365-stream': GenericIcons.StreamIcon,
  'm365-whiteboard': GenericIcons.WhiteboardIcon,
  'm365-lists': GenericIcons.ListsIcon,
  'm365-loop': GenericIcons.LoopIcon,
  'm365-bookings': GenericIcons.BookingsIcon,
  'm365-viva-engage': GenericIcons.VivaEngageIcon,
  // Microsoft 365 - Security & Management
  'm365-defender': GenericIcons.DefenderIcon,
  'm365-intune': GenericIcons.IntuneIcon,
  'm365-exchange': GenericIcons.ExchangeIcon,
  // Dynamics
  'dynamics-365': GenericIcons.Dynamics365Icon,
} as const

export type CloudIconType = keyof typeof cloudIconComponents

/**
 * Get the provider for an icon type (for lazy loading)
 */
export function getIconProvider(iconType: string): 'aws' | 'azure' | 'gcp' | 'generic' {
  if (iconType.startsWith('aws-')) return 'aws'
  if (iconType.startsWith('azure-')) return 'azure'
  if (iconType.startsWith('gcp-')) return 'gcp'
  return 'generic'
}
