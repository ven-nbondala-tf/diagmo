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
  thumbnail?: string
  createdAt: string
  updatedAt: string
}

export interface DiagramNode extends Node {
  data: {
    label: string
    type: ShapeType
    style?: NodeStyle
    locked?: boolean
    groupId?: string
  }
}

export interface DiagramEdge extends Edge {
  data?: {
    label?: string
    style?: EdgeStyle
  }
}

export interface NodeStyle {
  // Fill
  backgroundColor?: string
  backgroundOpacity?: number
  gradientEnabled?: boolean
  gradientColor?: string
  gradientDirection?: 'horizontal' | 'vertical' | 'diagonal'

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

  // Effects
  opacity?: number
  rotation?: number
}

export interface EdgeStyle {
  // Line
  strokeColor?: string
  strokeWidth?: number
  strokeOpacity?: number
  strokeDasharray?: string
  lineType?: 'solid' | 'dashed' | 'dotted'

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
}

// Shape types
export type ShapeType =
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
  // AWS Cloud icons
  | 'aws-ec2'
  | 'aws-s3'
  | 'aws-lambda'
  | 'aws-rds'
  | 'aws-dynamodb'
  | 'aws-api-gateway'
  | 'aws-sns'
  | 'aws-sqs'
  | 'aws-cloudfront'
  | 'aws-route53'
  | 'aws-vpc'
  | 'aws-iam'
  | 'aws-ecs'
  | 'aws-eks'
  | 'aws-cognito'
  | 'aws-step-functions'
  | 'aws-kinesis'
  | 'aws-redshift'
  | 'aws-elasticache'
  | 'aws-cloudwatch'
  | 'aws-secrets-manager'
  | 'aws-eventbridge'
  | 'aws-amplify'
  | 'aws-appsync'
  // Azure Cloud icons
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
  // GCP Cloud icons
  | 'gcp-compute'
  | 'gcp-storage'
  | 'gcp-functions'
  | 'gcp-bigquery'
  | 'gcp-pubsub'
  | 'gcp-gke'
  | 'gcp-cloud-run'
  | 'gcp-firestore'
  | 'gcp-cloud-sql'
  | 'gcp-spanner'
  | 'gcp-dataflow'
  | 'gcp-cloud-armor'
  | 'gcp-cloud-build'
  | 'gcp-artifact-registry'
  | 'gcp-secret-manager'
  // Generic Cloud/DevOps
  | 'kubernetes'
  | 'docker'
  | 'generic-api'
  | 'generic-database'
  | 'generic-cache'
  | 'generic-queue'
  | 'generic-load-balancer'
  | 'generic-cdn'

// Folder types
export interface Folder {
  id: string
  name: string
  userId: string
  parentId?: string
  createdAt: string
  updatedAt: string
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

// Export types
export type ExportFormat = 'png' | 'svg' | 'pdf'

export interface ExportOptions {
  format: ExportFormat
  quality?: number
  backgroundColor?: string
  padding?: number
}
