import type { Node, Edge } from '@xyflow/react'

// Theme types
export * from './theme'

// User types
export interface User {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Profile {
  id: string
  userId: string
  fullName?: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

// Diagram types
export interface Diagram {
  id: string
  name: string
  description?: string
  userId: string
  folderId?: string
  workspaceId?: string
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  layers?: Layer[]
  thumbnail?: string
  createdAt: string
  updatedAt: string
}

// UML Class attribute/method types
export interface UMLAttribute {
  visibility: '+' | '-' | '#' | '~'  // public, private, protected, package
  name: string
  type: string
}

export interface UMLMethod {
  visibility: '+' | '-' | '#' | '~'
  name: string
  parameters?: string
  returnType?: string
}

// Database column type
export interface DBColumn {
  name: string
  type: string
  isPrimaryKey?: boolean
  isNullable?: boolean
}

// Table style preset names
export type TableStylePreset = 'default' | 'blue' | 'green' | 'orange' | 'purple' | 'gray' | 'dark'

// Table shape data
export interface TableData {
  rows: number
  cols: number
  cells: string[][]  // 2D array [row][col] of cell contents
  headerRow: boolean // First row is header (bold, different bg)
  headerCol: boolean // First column is header
  columnWidths?: number[]  // Width of each column in pixels
  rowHeights?: number[]    // Height of each row in pixels
  // Styling options (Excel-like)
  headerBgColor?: string      // Header background color
  headerTextColor?: string    // Header text color
  bandedRows?: boolean        // Alternate row colors
  bandedCols?: boolean        // Alternate column colors
  bandColor?: string          // Color for banded rows/cols
  stylePreset?: TableStylePreset  // Predefined style preset
}

// Layer type for organizing shapes
export interface Layer {
  id: string
  name: string
  visible: boolean
  locked: boolean
  color?: string  // Optional color indicator
  order: number   // For layer ordering (higher = on top)
}

// Conditional formatting rules
export type ConditionalRuleCondition =
  | 'label-contains'
  | 'label-equals'
  | 'label-starts-with'
  | 'label-ends-with'
  | 'type-is'
  | 'metadata-equals'
  | 'metadata-contains'

export interface ConditionalRule {
  id: string
  name: string
  enabled: boolean
  condition: ConditionalRuleCondition
  value: string
  metadataKey?: string  // For metadata-based conditions
  style: Partial<NodeStyle>
  priority: number  // Higher priority rules override lower ones
}

// Diagram template for reusable diagram structures
export interface DiagramTemplate {
  id: string
  name: string
  description?: string
  category: string
  userId: string
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  layers?: Layer[]
  thumbnail?: string
  isPublic: boolean
  useCount: number
  createdAt: string
  updatedAt: string
}

// =============================================
// Architecture Template Types (Enhanced)
// =============================================

export type TemplateCategory =
  // Cloud Providers
  | 'aws'
  | 'azure'
  | 'gcp'
  | 'multi-cloud'
  // Use Cases
  | 'web-app'
  | 'data-analytics'
  | 'iot'
  | 'ai-ml'
  | 'devops'
  | 'security'
  | 'networking'
  | 'containers'
  | 'serverless'
  | 'migration'
  // Industries
  | 'fintech'
  | 'healthcare'
  | 'retail'
  | 'gaming'
  // General
  | 'general'
  | 'flowchart'
  | 'uml'
  | 'network'

export type TemplateComplexity = 'beginner' | 'intermediate' | 'advanced'

export interface TemplateVariable {
  id: string
  name: string
  type: 'text' | 'select' | 'number'
  defaultValue: string
  options?: string[]
  appliesTo: string[] // Node IDs that use this variable
}

export interface TemplateGroup {
  id: string
  name: string
  type: 'vpc' | 'subnet' | 'region' | 'availability-zone' | 'resource-group' | 'container'
  nodeIds: string[]
  position?: { x: number; y: number }
  size?: { width: number; height: number }
  style?: {
    backgroundColor?: string
    borderColor?: string
    borderStyle?: 'solid' | 'dashed'
  }
}

export interface TemplateAnnotation {
  id: string
  text: string
  position: { x: number; y: number }
  style?: {
    fontSize?: number
    fontWeight?: 'normal' | 'bold'
    color?: string
    backgroundColor?: string
  }
}

export interface TemplateNode {
  id: string
  type: ShapeType | string
  position: { x: number; y: number }
  data: {
    label: string
    type: ShapeType | string
    style?: Partial<NodeStyle>
    [key: string]: unknown
  }
  width?: number
  height?: number
}

export interface TemplateEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  label?: string
  type?: string
  style?: Partial<EdgeStyle>
  data?: {
    label?: string
    style?: Partial<EdgeStyle>
    [key: string]: unknown
  }
}

export interface ArchitectureTemplate {
  // Basic Info
  id: string
  name: string
  description: string
  categories: TemplateCategory[]

  // Source & Attribution
  source?: string // URL to official documentation
  lastUpdated?: string // ISO date
  version?: string // e.g., "2024.1"

  // Complexity & Use Case
  complexity: TemplateComplexity
  estimatedCost?: string // e.g., "$500-$2000/month"
  useCases?: string[] // e.g., ["high-availability", "low-latency"]

  // Visual
  thumbnail?: string // Base64 or URL to preview image
  primaryColor?: string // For category styling
  icon?: string // Icon name for display

  // Diagram Content
  nodes: TemplateNode[]
  edges: TemplateEdge[]
  groups?: TemplateGroup[]
  annotations?: TemplateAnnotation[]

  // Customization Options
  variables?: TemplateVariable[]

  // Metadata
  tags: string[]
  relatedTemplates?: string[] // IDs of similar templates

  // For built-in templates
  isBuiltIn?: boolean
}

// Group styling options
export interface GroupStyle {
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none'
  borderColor?: string
  borderWidth?: number
  borderOpacity?: number
  backgroundColor?: string
  backgroundOpacity?: number
  borderRadius?: number
  showLabel?: boolean
  labelText?: string
  padding?: number
}

export interface DiagramNode extends Node {
  data: {
    label: string
    type: ShapeType
    style?: NodeStyle
    locked?: boolean
    groupId?: string
    groupStyle?: GroupStyle  // Style for the group (stored on any node in the group)
    // Web image specific properties
    imageUrl?: string
    thumbnailUrl?: string
    imageType?: 'photo' | 'icon' | 'gif'
    imageAlt?: string
    objectFit?: 'contain' | 'cover' | 'fill'
    attribution?: {
      name: string
      url: string
      source: string
    }
    // UML Class specific properties
    umlAttributes?: UMLAttribute[]
    umlMethods?: UMLMethod[]
    umlStereotype?: string
    // Database specific properties
    dbColumns?: DBColumn[]
    // Table data (for table shape)
    tableData?: TableData
    // Container/Swimlane properties
    parentId?: string  // ID of parent container
    isCollapsed?: boolean
    containerColor?: string  // Header color for containers
    // Layer assignment
    layerId?: string  // ID of layer this node belongs to
    // Custom metadata (key-value pairs)
    metadata?: Record<string, string | number | boolean>
    // Custom shape properties (for user-uploaded SVG shapes)
    customShapeId?: string
    customShapeName?: string
    customShapeSvg?: string
    // Hide connection handles (for emoji reactions, etc.)
    hideHandles?: boolean
  }
}

// Waypoint for edge routing - absolute position on canvas
export interface EdgeWaypoint {
  id: string
  x: number
  y: number
}

export interface DiagramEdge extends Edge {
  data?: {
    label?: string
    style?: EdgeStyle
    labelPosition?: 'on-line' | 'outside'
    waypointOffset?: { x: number; y: number }  // Legacy single waypoint (deprecated)
    waypoints?: EdgeWaypoint[]  // Multiple waypoints for custom routing
  }
}

export interface NodeStyle {
  // Fill
  backgroundColor?: string
  backgroundOpacity?: number
  gradientEnabled?: boolean
  gradientColor?: string
  gradientDirection?: 'horizontal' | 'vertical' | 'diagonal'

  // Pattern fill
  patternEnabled?: boolean
  patternType?: 'diagonal-lines' | 'dots' | 'grid' | 'crosshatch' | 'horizontal-lines' | 'vertical-lines'
  patternColor?: string
  patternSize?: number
  patternOpacity?: number

  // Border/Stroke
  borderColor?: string
  borderWidth?: number
  borderRadius?: number
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none'
  borderOpacity?: number

  // Shadow
  shadowEnabled?: boolean
  shadowColor?: string
  shadowBlur?: number
  shadowOffsetX?: number
  shadowOffsetY?: number

  // Text
  textColor?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: 'normal' | 'bold' | 'light' | string
  fontStyle?: 'normal' | 'italic' | string
  textDecoration?: 'none' | 'underline' | 'line-through' | string
  textAlign?: 'left' | 'center' | 'right'
  verticalAlign?: 'top' | 'middle' | 'bottom'
  lineHeight?: number
  letterSpacing?: number
  textWrap?: 'wrap' | 'nowrap' | 'truncate'
  textPadding?: number

  // Effects
  opacity?: number
  rotation?: number
  scaleX?: number
  scaleY?: number
}

export interface EdgeStyle {
  // Line
  strokeColor?: string
  strokeWidth?: number
  strokeOpacity?: number
  strokeDasharray?: string
  lineType?: 'solid' | 'dashed' | 'dotted'
  lineCap?: 'butt' | 'round' | 'square'
  lineJoin?: 'miter' | 'round' | 'bevel'

  // Markers
  markerStart?: 'none' | 'arrow' | 'arrowClosed' | 'circle' | 'diamond'
  markerEnd?: 'none' | 'arrow' | 'arrowClosed' | 'circle' | 'diamond'
  markerSize?: number

  // Animation
  animated?: boolean
  animationSpeed?: 'slow' | 'normal' | 'fast'

  // Label text styling
  labelColor?: string
  labelBgColor?: string
  labelFontSize?: number
  labelFontFamily?: string
  labelFontWeight?: 'normal' | 'bold' | 'light'
  labelFontStyle?: 'normal' | 'italic'
  labelTextDecoration?: 'none' | 'underline' | 'line-through'

  // Label placement along edge
  labelPlacement?: 'start' | 'middle' | 'end'
}

// Shape types
export type ShapeType =
  // Custom shapes from user libraries
  | 'custom-shape'
  // Web images (photos, icons, GIFs)
  | 'web-image'
  // Containers and Swimlanes
  | 'container'
  | 'swimlane'
  | 'swimlane-horizontal'
  // Basic shapes
  | 'rectangle'
  | 'rounded-rectangle'
  | 'ellipse'
  | 'circle'
  | 'diamond'
  | 'parallelogram'
  | 'trapezoid'
  | 'cylinder'
  | 'triangle'
  | 'pentagon'
  | 'hexagon'
  | 'octagon'
  | 'star'
  | 'arrow'
  | 'double-arrow'
  | 'cloud'
  | 'callout'
  | 'note'
  | 'sticky-note'
  | 'text'
  | 'table'
  | 'junction'
  // Flowchart shapes
  | 'process'
  | 'decision'
  | 'terminator'
  | 'data'
  | 'document'
  | 'multi-document'
  | 'predefined-process'
  | 'manual-input'
  | 'preparation'
  | 'delay'
  | 'database'
  | 'merge'
  | 'or'
  | 'summing-junction'
  // UML shapes
  | 'uml-class'
  | 'uml-interface'
  | 'uml-actor'
  | 'uml-usecase'
  | 'uml-component'
  | 'uml-package'
  | 'uml-state'
  | 'uml-note'
  // Network shapes
  | 'server'
  | 'router'
  | 'switch'
  | 'firewall'
  | 'load-balancer'
  | 'user'
  | 'users'
  | 'laptop'
  | 'mobile'
  | 'internet'
  // AWS Compute
  | 'aws-ec2'
  | 'aws-lambda'
  | 'aws-elastic-beanstalk'
  | 'aws-lightsail'
  | 'aws-outposts'
  | 'aws-wavelength'
  | 'aws-local-zones'
  | 'aws-batch'
  | 'aws-fargate'
  | 'aws-app-runner'
  | 'aws-auto-scaling'
  // AWS Containers
  | 'aws-ecs'
  | 'aws-eks'
  | 'aws-ecr'
  // AWS Storage
  | 'aws-s3'
  | 'aws-simple-storage-service'
  | 'aws-ebs'
  | 'aws-efs'
  | 'aws-fsx'
  | 'aws-elastic-block-store'
  | 'aws-storage-gateway'
  | 'aws-backup'
  | 'aws-snow-family'
  // AWS Database
  | 'aws-rds'
  | 'aws-aurora'
  | 'aws-dynamodb'
  | 'aws-elasticache'
  | 'aws-redshift'
  | 'aws-neptune'
  | 'aws-documentdb'
  | 'aws-qldb'
  | 'aws-timestream'
  | 'aws-memorydb'
  | 'aws-keyspaces'
  // AWS Networking
  | 'aws-vpc'
  | 'aws-cloudfront'
  | 'aws-route53'
  | 'aws-route-53'
  | 'aws-api-gateway'
  | 'aws-direct-connect'
  | 'aws-global-accelerator'
  | 'aws-transit-gateway'
  | 'aws-privatelink'
  | 'aws-elb'
  | 'aws-elastic-load-balancing'
  | 'aws-nat-gateway'
  | 'aws-internet-gateway'
  | 'aws-client-vpn'
  | 'aws-site-to-site-vpn'
  | 'aws-cloud-wan'
  // AWS Security
  | 'aws-iam'
  | 'aws-cognito'
  | 'aws-secrets-manager'
  | 'aws-kms'
  | 'aws-key-management-service'
  | 'aws-waf'
  | 'aws-shield'
  | 'aws-guardduty'
  | 'aws-inspector'
  | 'aws-macie'
  | 'aws-security-hub'
  | 'aws-certificate-manager'
  | 'aws-firewall-manager'
  | 'aws-iam-identity-center'
  // AWS Analytics
  | 'aws-kinesis'
  | 'aws-kinesis-data-streams'
  | 'aws-data-firehose'
  | 'aws-athena'
  | 'aws-emr'
  | 'aws-glue'
  | 'aws-lake-formation'
  | 'aws-quicksight'
  | 'aws-data-pipeline'
  | 'aws-msk'
  | 'aws-managed-streaming-for-apache-kafka'
  | 'aws-opensearch'
  | 'aws-opensearch-service'
  | 'aws-datazone'
  // AWS ML/AI
  | 'aws-sagemaker'
  | 'aws-sagemaker-ai'
  | 'aws-rekognition'
  | 'aws-comprehend'
  | 'aws-lex'
  | 'aws-polly'
  | 'aws-transcribe'
  | 'aws-translate'
  | 'aws-textract'
  | 'aws-bedrock'
  | 'aws-q'
  | 'aws-personalize'
  | 'aws-kendra'
  | 'aws-forecast'
  // AWS Integration
  | 'aws-sns'
  | 'aws-simple-notification-service'
  | 'aws-sqs'
  | 'aws-simple-queue-service'
  | 'aws-eventbridge'
  | 'aws-step-functions'
  | 'aws-appsync'
  | 'aws-mq'
  | 'aws-app-mesh'
  // AWS Developer
  | 'aws-codecommit'
  | 'aws-codebuild'
  | 'aws-codedeploy'
  | 'aws-codepipeline'
  | 'aws-codeartifact'
  | 'aws-cloud9'
  | 'aws-xray'
  | 'aws-x-ray'
  | 'aws-cloudshell'
  | 'aws-codecatalyst'
  | 'aws-infrastructure-composer'
  // AWS Management
  | 'aws-cloudwatch'
  | 'aws-cloudtrail'
  | 'aws-config'
  | 'aws-systems-manager'
  | 'aws-cloudformation'
  | 'aws-service-catalog'
  | 'aws-trusted-advisor'
  | 'aws-organizations'
  | 'aws-control-tower'
  | 'aws-compute-optimizer'
  | 'aws-amplify'
  | 'aws-clean-rooms'
  | 'aws-verified-access'
  // AWS Application Integration
  | 'aws-connect'
  | 'aws-pinpoint'
  | 'aws-ses'
  | 'aws-simple-email-service'
  // Azure Cloud icons - Core
  | 'azure-vm'
  | 'azure-virtual-machine'
  | 'azure-storage'
  | 'azure-storage-accounts'
  | 'azure-functions'
  | 'azure-function-apps'
  | 'azure-sql'
  | 'azure-sql-database'
  | 'azure-cosmos'
  | 'azure-azure-cosmos-db'
  | 'azure-app-service'
  | 'azure-app-services'
  | 'azure-aks'
  | 'azure-kubernetes-services'
  | 'azure-cdn'
  | 'azure-cdn-profiles'
  | 'azure-vnet'
  | 'azure-virtual-networks'
  | 'azure-keyvault'
  | 'azure-key-vaults'
  | 'azure-event-hub'
  | 'azure-event-hubs'
  | 'azure-service-bus'
  | 'azure-azure-service-bus'
  | 'azure-logic-apps'
  | 'azure-databricks'
  | 'azure-azure-databricks'
  | 'azure-active-directory'
  | 'azure-container-registry'
  | 'azure-container-registries'
  | 'azure-redis-cache'
  | 'azure-cache-redis'
  | 'azure-app-gateway'
  | 'azure-application-gateways'
  | 'azure-front-door'
  | 'azure-front-door-and-cdn-profiles'
  | 'azure-monitor'
  // Azure - Analytics
  | 'azure-synapse'
  | 'azure-azure-synapse-analytics'
  | 'azure-data-factory'
  | 'azure-data-factories'
  | 'azure-stream-analytics'
  | 'azure-stream-analytics-jobs'
  | 'azure-hdinsight'
  | 'azure-hd-insight-clusters'
  | 'azure-data-lake'
  | 'azure-analysis-services'
  | 'azure-log-analytics'
  | 'azure-log-analytics-workspaces'
  | 'azure-purview'
  | 'azure-azure-data-explorer-clusters'
  | 'azure-power-bi-embedded'
  // Azure - Microsoft Fabric
  | 'azure-fabric'
  | 'azure-fabric-lakehouse'
  | 'azure-fabric-warehouse'
  | 'azure-fabric-eventhouse'
  | 'azure-onelake'
  | 'azure-fabric-pipeline'
  | 'azure-power-bi'
  | 'azure-fabric-spark'
  | 'azure-fabric-dataflow'
  // Azure - Compute
  | 'azure-vm-scale-sets'
  | 'azure-batch'
  | 'azure-batch-accounts'
  | 'azure-cloud-services'
  | 'azure-cloud-services-extended-support-'
  | 'azure-service-fabric'
  | 'azure-service-fabric-clusters'
  | 'azure-spot-vm'
  // Azure - Containers
  | 'azure-container-instances'
  | 'azure-container-apps'
  | 'azure-container-apps-environments'
  // Azure - Databases
  | 'azure-mysql'
  | 'azure-azure-database-mysql-server'
  | 'azure-postgresql'
  | 'azure-azure-database-postgresql-server'
  | 'azure-mariadb'
  | 'azure-azure-database-mariadb-server'
  | 'azure-sql-managed-instance'
  | 'azure-table-storage'
  | 'azure-table'
  | 'azure-elastic-job-agents'
  | 'azure-managed-database'
  // Azure - Networking
  | 'azure-load-balancer'
  | 'azure-load-balancers'
  | 'azure-vpn-gateway'
  | 'azure-virtual-network-gateways'
  | 'azure-expressroute'
  | 'azure-expressroute-circuits'
  | 'azure-traffic-manager'
  | 'azure-traffic-manager-profiles'
  | 'azure-dns'
  | 'azure-dns-zones'
  | 'azure-private-link'
  | 'azure-private-link-services'
  | 'azure-private-endpoints'
  | 'azure-bastion'
  | 'azure-bastions'
  | 'azure-nat-gateway'
  | 'azure-nat'
  | 'azure-firewalls'
  | 'azure-network-security-groups'
  | 'azure-azure-firewall-policy'
  // Azure - Security
  | 'azure-security-center'
  | 'azure-microsoft-defender-for-cloud'
  | 'azure-sentinel'
  | 'azure-azure-sentinel'
  | 'azure-ddos-protection'
  | 'azure-ddos-protection-plans'
  | 'azure-firewall'
  | 'azure-defender'
  | 'azure-multifactor-authentication'
  // Azure - AI + ML
  | 'azure-cognitive-services'
  | 'azure-cognitive-search'
  | 'azure-machine-learning'
  | 'azure-bot-service'
  | 'azure-bot-services'
  | 'azure-openai'
  | 'azure-azure-openai'
  | 'azure-ai-studio'
  | 'azure-computer-vision'
  | 'azure-face-apis'
  | 'azure-speech-services'
  | 'azure-language'
  | 'azure-translator-text'
  | 'azure-content-safety'
  | 'azure-form-recognizers'
  // Azure - Integration
  | 'azure-api-management'
  | 'azure-api-management-services'
  | 'azure-event-grid'
  | 'azure-event-grid-domains'
  | 'azure-event-grid-topics'
  | 'azure-notification-hubs'
  | 'azure-relays'
  | 'azure-signalr'
  // Azure - Storage
  | 'azure-blob-storage'
  | 'azure-blob-block'
  | 'azure-blob-page'
  | 'azure-file-storage'
  | 'azure-azure-fileshares'
  | 'azure-queue-storage'
  | 'azure-storage-queue'
  | 'azure-data-lake-storage'
  | 'azure-netapp-files'
  | 'azure-azure-netapp-files'
  | 'azure-storage-sync-services'
  | 'azure-azure-storage-mover'
  // Azure - Identity
  | 'azure-b2c'
  | 'azure-managed-identities'
  | 'azure-entra-id'
  | 'azure-entra-domain-services'
  | 'azure-entra-id-protection'
  // Azure - DevOps
  | 'azure-devops'
  | 'azure-azure-devops'
  | 'azure-repos'
  | 'azure-pipelines'
  | 'azure-boards'
  | 'azure-test-plans'
  | 'azure-artifacts'
  | 'azure-devtest-labs'
  | 'azure-azure-deployment-environments'
  | 'azure-managed-devops-pools'
  // Azure - Web
  | 'azure-static-web-apps'
  // Azure - Management
  | 'azure-advisor'
  | 'azure-policy'
  | 'azure-cost-management'
  | 'azure-management-groups'
  | 'azure-subscriptions'
  | 'azure-resource-groups'
  | 'azure-automation-accounts'
  | 'azure-azure-arc'
  | 'azure-azure-backup-center'
  // GCP Compute
  | 'gcp-compute'
  | 'gcp-compute-engine'
  | 'gcp-functions'
  | 'gcp-app-engine'
  | 'gcp-cloud-run'
  | 'gcp-gke'
  // GCP Storage
  | 'gcp-storage'
  | 'gcp-cloud-storage'
  | 'gcp-persistent-disk'
  | 'gcp-filestore'
  | 'gcp-storage-transfer'
  | 'gcp-hyperdisk'
  // GCP Database
  | 'gcp-cloud-sql'
  | 'gcp-firestore'
  | 'gcp-bigtable'
  | 'gcp-spanner'
  | 'gcp-cloud-spanner'
  | 'gcp-memorystore'
  | 'gcp-alloydb'
  | 'gcp-databases'
  // GCP Containers & Kubernetes
  | 'gcp-anthos'
  | 'gcp-containers'
  // GCP Networking
  | 'gcp-vpc'
  | 'gcp-networking'
  | 'gcp-load-balancing'
  | 'gcp-cloud-cdn'
  | 'gcp-cloud-dns'
  | 'gcp-cloud-nat'
  | 'gcp-cloud-armor'
  | 'gcp-cloud-interconnect'
  | 'gcp-network-connectivity'
  // GCP Security
  | 'gcp-iam'
  | 'gcp-cloud-kms'
  | 'gcp-secret-manager'
  | 'gcp-security-command-center'
  | 'gcp-security-identity'
  | 'gcp-security-operations'
  | 'gcp-beyondcorp'
  | 'gcp-certificate-manager'
  | 'gcp-mandiant'
  | 'gcp-threat-intelligence'
  // GCP Analytics
  | 'gcp-bigquery'
  | 'gcp-dataflow'
  | 'gcp-dataproc'
  | 'gcp-pubsub'
  | 'gcp-data-fusion'
  | 'gcp-looker'
  | 'gcp-dataform'
  | 'gcp-data-analytics'
  | 'gcp-business-intelligence'
  // GCP AI/ML
  | 'gcp-vertex-ai'
  | 'gcp-ai-machine-learning'
  | 'gcp-ai-hypercomputer'
  | 'gcp-vision-ai'
  | 'gcp-natural-language'
  | 'gcp-speech-to-text'
  | 'gcp-translation'
  | 'gcp-document-ai'
  | 'gcp-recommendations-ai'
  | 'gcp-automl'
  | 'gcp-gemini'
  // GCP Developer
  | 'gcp-cloud-build'
  | 'gcp-artifact-registry'
  | 'gcp-cloud-source-repos'
  | 'gcp-cloud-deploy'
  | 'gcp-cloud-workstations'
  | 'gcp-developer-tools'
  | 'gcp-devops'
  // GCP Management
  | 'gcp-cloud-monitoring'
  | 'gcp-cloud-logging'
  | 'gcp-cloud-trace'
  | 'gcp-error-reporting'
  | 'gcp-cloud-debugger'
  | 'gcp-cloud-profiler'
  | 'gcp-management-tools'
  | 'gcp-observability'
  | 'gcp-operations'
  // GCP Integration
  | 'gcp-cloud-tasks'
  | 'gcp-cloud-scheduler'
  | 'gcp-workflows'
  | 'gcp-eventarc'
  | 'gcp-api-gateway'
  | 'gcp-apigee'
  | 'gcp-integration-services'
  // GCP Serverless
  | 'gcp-serverless-computing'
  // GCP Hybrid & Multi-cloud
  | 'gcp-hybrid-multicloud'
  | 'gcp-distributed-cloud'
  // GCP Migration
  | 'gcp-migration'
  // GCP Marketplace
  | 'gcp-marketplace'
  // GCP Media
  | 'gcp-media-services'
  // GCP Maps
  | 'gcp-maps-geospatial'
  // GCP Collaboration
  | 'gcp-collaboration'
  // GCP Web & Mobile
  | 'gcp-web-mobile'
  // GCP Web3
  | 'gcp-web3'
  // GCP Mixed Reality
  | 'gcp-mixed-reality'
  // Generic Cloud/DevOps
  | 'kubernetes'
  | 'docker'
  | 'generic-api'
  | 'generic-database'
  | 'generic-cache'
  | 'generic-queue'
  | 'generic-load-balancer'
  | 'generic-cdn'
  // Microsoft Office
  | 'office-word'
  | 'office-excel'
  | 'office-powerpoint'
  | 'office-outlook'
  | 'office-teams'
  | 'office-onedrive'
  | 'office-sharepoint'
  | 'office-onenote'
  | 'office-access'
  | 'office-publisher'
  | 'office-visio'
  | 'office-project'
  // Microsoft 365
  | 'm365'
  | 'm365-copilot'
  | 'm365-planner'
  | 'm365-todo'
  | 'm365-forms'
  | 'm365-stream'
  | 'm365-whiteboard'
  | 'm365-lists'
  | 'm365-loop'
  | 'm365-bookings'
  | 'm365-viva-engage'
  | 'm365-defender'
  | 'm365-intune'
  | 'm365-exchange'
  // Power Platform
  | 'power-bi'
  | 'power-apps'
  | 'power-automate'
  | 'power-virtual-agents'
  | 'dynamics-365'

// Folder types
export interface Folder {
  id: string
  name: string
  userId: string
  parentId?: string
  workspaceId?: string
  createdAt: string
  updatedAt: string
}

// Shape Library types
export interface ShapeLibrary {
  id: string
  userId: string
  name: string
  description?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface CustomShape {
  id: string
  libraryId: string
  name: string
  svgContent: string
  thumbnailUrl?: string
  category?: string
  createdAt: string
}

// Diagram version for history
export interface DiagramVersion {
  id: string
  diagramId: string
  version: number
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  createdAt: string
}

// Diagram page for multi-page support
export interface DiagramPage {
  id: string
  diagramId: string
  name: string
  pageOrder: number
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  drawingStrokes?: DrawingStroke[]
  createdAt: string
  updatedAt: string
}

// Comment type for diagram annotations
export interface DiagramComment {
  id: string
  diagramId: string
  userId: string
  userName?: string
  userAvatar?: string
  nodeId?: string  // Optional: attached to a specific node
  position?: { x: number; y: number }  // Position on canvas if not attached to node
  content: string
  resolved: boolean
  createdAt: string
  updatedAt: string
  replies?: CommentReply[]
}

export interface CommentReply {
  id: string
  commentId: string
  userId: string
  userName?: string
  userAvatar?: string
  content: string
  createdAt: string
}

// Editor state types
export interface EditorState {
  selectedNodes: string[]
  selectedEdges: string[]
  zoom: number
  panX: number
  panY: number
  gridEnabled: boolean
  snapToGrid: boolean
  gridSize: number
}

// History state for undo/redo
export interface HistoryState {
  past: HistoryEntry[]
  present: HistoryEntry
  future: HistoryEntry[]
}

export interface HistoryEntry {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  timestamp: number
}

// Web image search result type
export interface WebImageResult {
  id: string
  type: 'photo' | 'icon' | 'gif'
  url: string
  thumbnailUrl: string
  downloadUrl: string
  width: number
  height: number
  alt: string
  attribution?: {
    name: string
    url: string
    source: string
  }
}

// Export types
export type ExportFormat = 'png' | 'svg' | 'pdf'

export interface ExportOptions {
  format: ExportFormat
  quality?: number
  backgroundColor?: string
  padding?: number
  width?: number
  height?: number
}

// =============================================
// Collaboration Types
// =============================================

export interface CollaboratorPresence {
  id: string
  diagramId: string
  userId: string
  cursorX: number | null
  cursorY: number | null
  viewportX: number | null
  viewportY: number | null
  viewportZoom: number
  color: string
  lastSeen: string
  // Drawing mode indicator
  isDrawing?: boolean
  // Joined from profiles table
  user?: {
    fullName: string | null
    avatarUrl: string | null
  }
}

export interface CollaboratorCursor {
  id: string
  name: string
  color: string
  x: number
  y: number
  avatarUrl?: string | null
}

export interface CollaborationState {
  isConnected: boolean
  collaborators: CollaboratorPresence[]
  myPresenceId: string | null
}

// =============================================
// Sharing Types
// =============================================

export type SharePermission = 'view' | 'edit'

export interface DiagramShare {
  id: string
  diagramId: string
  sharedWithUserId: string | null
  sharedWithEmail: string | null
  permission: SharePermission
  invitedBy: string | null
  createdAt: string
  acceptedAt: string | null
  // Joined from profiles
  user?: {
    fullName: string | null
    avatarUrl: string | null
    email?: string
  }
}

// =============================================
// Workspace Types (Team Workspaces)
// =============================================

export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer'

export interface Workspace {
  id: string
  name: string
  description?: string
  ownerId: string
  createdAt: string
  updatedAt: string
  // Computed/joined fields
  memberCount?: number
  role?: WorkspaceRole
}

export interface WorkspaceMember {
  id: string
  workspaceId: string
  userId?: string
  email?: string
  role: WorkspaceRole
  invitedBy?: string
  invitedAt: string
  acceptedAt?: string
  // Joined from profiles
  userName?: string
  userAvatar?: string
}

// =============================================
// Whiteboard/Drawing Types
// =============================================

export type DrawingTool = 'select' | 'pen' | 'highlighter' | 'eraser' | 'laser' | 'arrow' | 'line' | 'rectangle' | 'ellipse' | 'text'

export interface DrawingPoint {
  x: number
  y: number
  pressure?: number
}

export interface DrawingStroke {
  id: string
  type: DrawingTool
  points: DrawingPoint[]
  color: string
  width: number
  opacity: number
  timestamp: number
  userId?: string
  // For shapes
  shapeData?: {
    startX: number
    startY: number
    endX: number
    endY: number
    text?: string
    filled?: boolean
  }
  selected?: boolean
}

export interface PenPreset {
  id: string
  name: string
  tool: 'pen' | 'highlighter'
  color: string
  width: number
}

export interface WhiteboardLayer {
  id: string
  strokes: DrawingStroke[]
  visible: boolean
  locked: boolean
}
