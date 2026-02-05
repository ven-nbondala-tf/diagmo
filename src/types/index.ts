import type { Node, Edge } from '@xyflow/react'

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

// Layer type for organizing shapes
export interface Layer {
  id: string
  name: string
  visible: boolean
  locked: boolean
  color?: string  // Optional color indicator
  order: number   // For layer ordering (higher = on top)
}

export interface DiagramNode extends Node {
  data: {
    label: string
    type: ShapeType
    style?: NodeStyle
    locked?: boolean
    groupId?: string
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
    // Container/Swimlane properties
    parentId?: string  // ID of parent container
    isCollapsed?: boolean
    containerColor?: string  // Header color for containers
    // Layer assignment
    layerId?: string  // ID of layer this node belongs to
  }
}

export interface DiagramEdge extends Edge {
  data?: {
    label?: string
    style?: EdgeStyle
    labelPosition?: 'on-line' | 'outside'
    waypointOffset?: { x: number; y: number }
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
  | 'text'
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
  // AWS Containers
  | 'aws-ecs'
  | 'aws-eks'
  | 'aws-fargate'
  | 'aws-ecr'
  | 'aws-app-runner'
  // AWS Storage
  | 'aws-s3'
  | 'aws-ebs'
  | 'aws-efs'
  | 'aws-fsx'
  | 'aws-storage-gateway'
  | 'aws-backup'
  | 'aws-snow-family'
  // AWS Database
  | 'aws-rds'
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
  | 'aws-api-gateway'
  | 'aws-direct-connect'
  | 'aws-global-accelerator'
  | 'aws-transit-gateway'
  | 'aws-privatelink'
  | 'aws-elb'
  // AWS Security
  | 'aws-iam'
  | 'aws-cognito'
  | 'aws-secrets-manager'
  | 'aws-kms'
  | 'aws-waf'
  | 'aws-shield'
  | 'aws-guardduty'
  | 'aws-inspector'
  | 'aws-macie'
  | 'aws-security-hub'
  // AWS Analytics
  | 'aws-kinesis'
  | 'aws-athena'
  | 'aws-emr'
  | 'aws-glue'
  | 'aws-lake-formation'
  | 'aws-quicksight'
  | 'aws-data-pipeline'
  | 'aws-msk'
  | 'aws-opensearch'
  // AWS ML/AI
  | 'aws-sagemaker'
  | 'aws-rekognition'
  | 'aws-comprehend'
  | 'aws-lex'
  | 'aws-polly'
  | 'aws-transcribe'
  | 'aws-translate'
  | 'aws-textract'
  | 'aws-bedrock'
  // AWS Integration
  | 'aws-sns'
  | 'aws-sqs'
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
  | 'aws-cloud9'
  | 'aws-xray'
  | 'aws-cloudshell'
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
  | 'aws-amplify'
  // Azure Cloud icons - Core
  | 'azure-vm'
  | 'azure-storage'
  | 'azure-functions'
  | 'azure-sql'
  | 'azure-cosmos'
  | 'azure-app-service'
  | 'azure-aks'
  | 'azure-cdn'
  | 'azure-vnet'
  | 'azure-keyvault'
  | 'azure-event-hub'
  | 'azure-service-bus'
  | 'azure-logic-apps'
  | 'azure-databricks'
  | 'azure-active-directory'
  | 'azure-container-registry'
  | 'azure-redis-cache'
  | 'azure-app-gateway'
  | 'azure-front-door'
  | 'azure-monitor'
  // Azure - Analytics
  | 'azure-synapse'
  | 'azure-data-factory'
  | 'azure-stream-analytics'
  | 'azure-hdinsight'
  | 'azure-data-lake'
  | 'azure-analysis-services'
  | 'azure-log-analytics'
  | 'azure-purview'
  // Azure - Compute
  | 'azure-vm-scale-sets'
  | 'azure-batch'
  | 'azure-cloud-services'
  | 'azure-service-fabric'
  // Azure - Containers
  | 'azure-container-instances'
  | 'azure-container-apps'
  // Azure - Databases
  | 'azure-mysql'
  | 'azure-postgresql'
  | 'azure-mariadb'
  | 'azure-sql-managed-instance'
  | 'azure-table-storage'
  // Azure - Networking
  | 'azure-load-balancer'
  | 'azure-vpn-gateway'
  | 'azure-expressroute'
  | 'azure-traffic-manager'
  | 'azure-dns'
  | 'azure-private-link'
  | 'azure-bastion'
  | 'azure-nat-gateway'
  // Azure - Security
  | 'azure-security-center'
  | 'azure-sentinel'
  | 'azure-ddos-protection'
  | 'azure-firewall'
  | 'azure-defender'
  // Azure - AI + ML
  | 'azure-cognitive-services'
  | 'azure-machine-learning'
  | 'azure-bot-service'
  | 'azure-openai'
  // Azure - Integration
  | 'azure-api-management'
  | 'azure-event-grid'
  // Azure - Storage
  | 'azure-blob-storage'
  | 'azure-file-storage'
  | 'azure-queue-storage'
  | 'azure-data-lake-storage'
  | 'azure-netapp-files'
  // Azure - Identity
  | 'azure-b2c'
  | 'azure-managed-identities'
  | 'azure-entra-id'
  // Azure - DevOps
  | 'azure-devops'
  | 'azure-repos'
  | 'azure-pipelines'
  | 'azure-boards'
  | 'azure-test-plans'
  | 'azure-artifacts'
  // Azure - Web
  | 'azure-static-web-apps'
  | 'azure-signalr'
  | 'azure-notification-hubs'
  // GCP Compute
  | 'gcp-compute'
  | 'gcp-functions'
  | 'gcp-app-engine'
  | 'gcp-cloud-run'
  | 'gcp-gke'
  // GCP Storage
  | 'gcp-storage'
  | 'gcp-persistent-disk'
  | 'gcp-filestore'
  | 'gcp-storage-transfer'
  // GCP Database
  | 'gcp-cloud-sql'
  | 'gcp-firestore'
  | 'gcp-bigtable'
  | 'gcp-spanner'
  | 'gcp-memorystore'
  | 'gcp-alloydb'
  // GCP Networking
  | 'gcp-vpc'
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
  | 'gcp-beyondcorp'
  | 'gcp-certificate-manager'
  // GCP Analytics
  | 'gcp-bigquery'
  | 'gcp-dataflow'
  | 'gcp-dataproc'
  | 'gcp-pubsub'
  | 'gcp-data-fusion'
  | 'gcp-looker'
  | 'gcp-dataform'
  // GCP AI/ML
  | 'gcp-vertex-ai'
  | 'gcp-vision-ai'
  | 'gcp-natural-language'
  | 'gcp-speech-to-text'
  | 'gcp-translation'
  | 'gcp-document-ai'
  | 'gcp-recommendations-ai'
  | 'gcp-automl'
  // GCP Developer
  | 'gcp-cloud-build'
  | 'gcp-artifact-registry'
  | 'gcp-cloud-source-repos'
  | 'gcp-cloud-deploy'
  | 'gcp-cloud-workstations'
  // GCP Management
  | 'gcp-cloud-monitoring'
  | 'gcp-cloud-logging'
  | 'gcp-cloud-trace'
  | 'gcp-error-reporting'
  | 'gcp-cloud-debugger'
  | 'gcp-cloud-profiler'
  // GCP Integration
  | 'gcp-cloud-tasks'
  | 'gcp-cloud-scheduler'
  | 'gcp-workflows'
  | 'gcp-eventarc'
  | 'gcp-api-gateway'
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

// Folder types
export interface Folder {
  id: string
  name: string
  userId: string
  parentId?: string
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
