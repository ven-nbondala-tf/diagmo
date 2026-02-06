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

// Re-export all icons from provider-specific files
export * from './aws'
export * from './azure'
export * from './gcp'
export * from './generic'

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
