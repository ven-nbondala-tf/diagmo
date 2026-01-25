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
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
  borderRadius?: number
  textColor?: string
  fontSize?: number
  fontWeight?: string
  fontStyle?: string
  textDecoration?: string
  textAlign?: 'left' | 'center' | 'right'
}

export interface EdgeStyle {
  strokeColor?: string
  strokeWidth?: number
  strokeDasharray?: string
  lineType?: 'solid' | 'dashed' | 'dotted'
  animated?: boolean
  markerStart?: 'none' | 'arrow' | 'arrowClosed' | 'circle' | 'diamond'
  markerEnd?: 'none' | 'arrow' | 'arrowClosed' | 'circle' | 'diamond'
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
  // Cloud icons
  | 'aws-ec2'
  | 'aws-s3'
  | 'aws-lambda'
  | 'aws-rds'
  | 'azure-vm'
  | 'azure-storage'
  | 'azure-functions'
  | 'gcp-compute'
  | 'gcp-storage'
  | 'gcp-functions'

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
