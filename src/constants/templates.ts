import type { DiagramNode, DiagramEdge } from '@/types'
import { ALL_CLOUD_TEMPLATES } from './cloudTemplates'

export interface DiagramTemplate {
  id: string
  name: string
  description: string
  category: 'architecture' | 'flowchart' | 'network' | 'uml' | 'general'
  thumbnail?: string
  nodes: DiagramNode[]
  edges: DiagramEdge[]
}

// AWS 3-Tier Architecture Template
const awsArchitectureTemplate: DiagramTemplate = {
  id: 'aws-3-tier',
  name: 'AWS 3-Tier Architecture',
  description: 'A typical AWS 3-tier web application with load balancer, EC2 instances, and RDS database',
  category: 'architecture',
  nodes: [
    {
      id: 'user',
      type: 'custom',
      position: { x: 50, y: 200 },
      data: {
        label: 'Users',
        type: 'users',
        style: { backgroundColor: '#ffffff', borderColor: '#6b7280' },
      },
      width: 80,
      height: 80,
    },
    {
      id: 'cloudfront',
      type: 'custom',
      position: { x: 200, y: 200 },
      data: {
        label: 'CloudFront',
        type: 'aws-cloudfront',
        style: { backgroundColor: '#ffffff', borderColor: '#8C4FFF' },
      },
      width: 80,
      height: 80,
    },
    {
      id: 'alb',
      type: 'custom',
      position: { x: 350, y: 200 },
      data: {
        label: 'Load Balancer',
        type: 'load-balancer',
        style: { backgroundColor: '#ffffff', borderColor: '#FF9900' },
      },
      width: 100,
      height: 80,
    },
    {
      id: 'ec2-1',
      type: 'custom',
      position: { x: 520, y: 100 },
      data: {
        label: 'EC2 Instance 1',
        type: 'aws-ec2',
        style: { backgroundColor: '#ffffff', borderColor: '#FF9900' },
      },
      width: 100,
      height: 80,
    },
    {
      id: 'ec2-2',
      type: 'custom',
      position: { x: 520, y: 300 },
      data: {
        label: 'EC2 Instance 2',
        type: 'aws-ec2',
        style: { backgroundColor: '#ffffff', borderColor: '#FF9900' },
      },
      width: 100,
      height: 80,
    },
    {
      id: 'rds',
      type: 'custom',
      position: { x: 700, y: 200 },
      data: {
        label: 'RDS Database',
        type: 'aws-rds',
        style: { backgroundColor: '#ffffff', borderColor: '#3B48CC' },
      },
      width: 100,
      height: 80,
    },
    {
      id: 's3',
      type: 'custom',
      position: { x: 700, y: 350 },
      data: {
        label: 'S3 Bucket',
        type: 'aws-s3',
        style: { backgroundColor: '#ffffff', borderColor: '#569A31' },
      },
      width: 80,
      height: 80,
    },
  ],
  edges: [
    { id: 'e1', source: 'user', target: 'cloudfront', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'cloudfront', target: 'alb', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'alb', target: 'ec2-1', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'alb', target: 'ec2-2', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'ec2-1', target: 'rds', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'ec2-2', target: 'rds', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e7', source: 'ec2-1', target: 's3', type: 'smoothstep', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e8', source: 'ec2-2', target: 's3', type: 'smoothstep', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

// Basic Flowchart Template
const flowchartTemplate: DiagramTemplate = {
  id: 'basic-flowchart',
  name: 'Basic Flowchart',
  description: 'A simple flowchart with start, process, decision, and end nodes',
  category: 'flowchart',
  nodes: [
    {
      id: 'start',
      type: 'custom',
      position: { x: 300, y: 50 },
      data: {
        label: 'Start',
        type: 'terminator',
        style: { backgroundColor: '#22c55e', borderColor: '#16a34a', textColor: '#ffffff' },
      },
      width: 120,
      height: 50,
    },
    {
      id: 'process1',
      type: 'custom',
      position: { x: 280, y: 150 },
      data: {
        label: 'Process Input',
        type: 'process',
        style: { backgroundColor: '#ffffff', borderColor: '#6b7280' },
      },
      width: 160,
      height: 60,
    },
    {
      id: 'decision',
      type: 'custom',
      position: { x: 280, y: 270 },
      data: {
        label: 'Valid?',
        type: 'decision',
        style: { backgroundColor: '#fef3c7', borderColor: '#f59e0b' },
      },
      width: 160,
      height: 100,
    },
    {
      id: 'process2',
      type: 'custom',
      position: { x: 500, y: 280 },
      data: {
        label: 'Handle Error',
        type: 'process',
        style: { backgroundColor: '#fee2e2', borderColor: '#ef4444' },
      },
      width: 140,
      height: 60,
    },
    {
      id: 'process3',
      type: 'custom',
      position: { x: 280, y: 420 },
      data: {
        label: 'Process Data',
        type: 'process',
        style: { backgroundColor: '#ffffff', borderColor: '#6b7280' },
      },
      width: 160,
      height: 60,
    },
    {
      id: 'end',
      type: 'custom',
      position: { x: 300, y: 530 },
      data: {
        label: 'End',
        type: 'terminator',
        style: { backgroundColor: '#ef4444', borderColor: '#dc2626', textColor: '#ffffff' },
      },
      width: 120,
      height: 50,
    },
  ],
  edges: [
    { id: 'e1', source: 'start', target: 'process1', type: 'smoothstep', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e2', source: 'process1', target: 'decision', type: 'smoothstep', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e3', source: 'decision', target: 'process2', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left', label: 'No' },
    { id: 'e4', source: 'decision', target: 'process3', type: 'smoothstep', sourceHandle: 'bottom', targetHandle: 'top', label: 'Yes' },
    { id: 'e5', source: 'process2', target: 'process1', type: 'smoothstep', sourceHandle: 'top', targetHandle: 'right' },
    { id: 'e6', source: 'process3', target: 'end', type: 'smoothstep', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

// Network Diagram Template
const networkDiagramTemplate: DiagramTemplate = {
  id: 'network-diagram',
  name: 'Network Diagram',
  description: 'A typical corporate network with firewall, servers, and client devices',
  category: 'network',
  nodes: [
    {
      id: 'internet',
      type: 'custom',
      position: { x: 50, y: 200 },
      data: {
        label: 'Internet',
        type: 'internet',
        style: { backgroundColor: '#ffffff', borderColor: '#6b7280' },
      },
      width: 80,
      height: 80,
    },
    {
      id: 'firewall',
      type: 'custom',
      position: { x: 200, y: 200 },
      data: {
        label: 'Firewall',
        type: 'firewall',
        style: { backgroundColor: '#ffffff', borderColor: '#dc2626' },
      },
      width: 80,
      height: 80,
    },
    {
      id: 'router',
      type: 'custom',
      position: { x: 350, y: 200 },
      data: {
        label: 'Router',
        type: 'router',
        style: { backgroundColor: '#ffffff', borderColor: '#6b7280' },
      },
      width: 80,
      height: 80,
    },
    {
      id: 'switch',
      type: 'custom',
      position: { x: 500, y: 200 },
      data: {
        label: 'Switch',
        type: 'switch',
        style: { backgroundColor: '#ffffff', borderColor: '#6b7280' },
      },
      width: 80,
      height: 80,
    },
    {
      id: 'server1',
      type: 'custom',
      position: { x: 650, y: 80 },
      data: {
        label: 'Web Server',
        type: 'server',
        style: { backgroundColor: '#ffffff', borderColor: '#6b7280' },
      },
      width: 80,
      height: 100,
    },
    {
      id: 'server2',
      type: 'custom',
      position: { x: 650, y: 200 },
      data: {
        label: 'App Server',
        type: 'server',
        style: { backgroundColor: '#ffffff', borderColor: '#6b7280' },
      },
      width: 80,
      height: 100,
    },
    {
      id: 'database',
      type: 'custom',
      position: { x: 650, y: 320 },
      data: {
        label: 'Database',
        type: 'database',
        style: { backgroundColor: '#ffffff', borderColor: '#6b7280' },
      },
      width: 80,
      height: 80,
    },
    {
      id: 'laptop1',
      type: 'custom',
      position: { x: 500, y: 380 },
      data: {
        label: 'Workstation 1',
        type: 'laptop',
        style: { backgroundColor: '#ffffff', borderColor: '#6b7280' },
      },
      width: 80,
      height: 80,
    },
    {
      id: 'laptop2',
      type: 'custom',
      position: { x: 350, y: 380 },
      data: {
        label: 'Workstation 2',
        type: 'laptop',
        style: { backgroundColor: '#ffffff', borderColor: '#6b7280' },
      },
      width: 80,
      height: 80,
    },
  ],
  edges: [
    { id: 'e1', source: 'internet', target: 'firewall', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'firewall', target: 'router', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'router', target: 'switch', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'switch', target: 'server1', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'switch', target: 'server2', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'switch', target: 'database', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e7', source: 'switch', target: 'laptop1', type: 'smoothstep', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e8', source: 'switch', target: 'laptop2', type: 'smoothstep', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

// UML Class Diagram Template
const umlClassDiagramTemplate: DiagramTemplate = {
  id: 'uml-class-diagram',
  name: 'UML Class Diagram',
  description: 'A simple UML class diagram with inheritance and association',
  category: 'uml',
  nodes: [
    {
      id: 'base-class',
      type: 'custom',
      position: { x: 300, y: 50 },
      data: {
        label: 'Animal',
        type: 'uml-class',
        style: { backgroundColor: '#ffffff', borderColor: '#6b7280' },
      },
      width: 160,
      height: 120,
    },
    {
      id: 'class1',
      type: 'custom',
      position: { x: 100, y: 250 },
      data: {
        label: 'Dog',
        type: 'uml-class',
        style: { backgroundColor: '#ffffff', borderColor: '#6b7280' },
      },
      width: 160,
      height: 120,
    },
    {
      id: 'class2',
      type: 'custom',
      position: { x: 300, y: 250 },
      data: {
        label: 'Cat',
        type: 'uml-class',
        style: { backgroundColor: '#ffffff', borderColor: '#6b7280' },
      },
      width: 160,
      height: 120,
    },
    {
      id: 'class3',
      type: 'custom',
      position: { x: 500, y: 250 },
      data: {
        label: 'Bird',
        type: 'uml-class',
        style: { backgroundColor: '#ffffff', borderColor: '#6b7280' },
      },
      width: 160,
      height: 120,
    },
    {
      id: 'interface',
      type: 'custom',
      position: { x: 100, y: 50 },
      data: {
        label: 'IMovable',
        type: 'uml-interface',
        style: { backgroundColor: '#ffffff', borderColor: '#6b7280' },
      },
      width: 160,
      height: 100,
    },
    {
      id: 'owner',
      type: 'custom',
      position: { x: 550, y: 50 },
      data: {
        label: 'Owner',
        type: 'uml-class',
        style: { backgroundColor: '#ffffff', borderColor: '#6b7280' },
      },
      width: 160,
      height: 120,
    },
  ],
  edges: [
    { id: 'e1', source: 'class1', target: 'base-class', type: 'smoothstep', sourceHandle: 'top', targetHandle: 'bottom', data: { label: 'extends' } },
    { id: 'e2', source: 'class2', target: 'base-class', type: 'smoothstep', sourceHandle: 'top', targetHandle: 'bottom', data: { label: 'extends' } },
    { id: 'e3', source: 'class3', target: 'base-class', type: 'smoothstep', sourceHandle: 'top', targetHandle: 'bottom', data: { label: 'extends' } },
    { id: 'e4', source: 'base-class', target: 'interface', type: 'smoothstep', sourceHandle: 'left', targetHandle: 'right', data: { label: 'implements', style: { strokeDasharray: '5,5' } } },
    { id: 'e5', source: 'owner', target: 'base-class', type: 'smoothstep', sourceHandle: 'left', targetHandle: 'right', data: { label: 'owns *' } },
  ],
}

// Azure Architecture Template
const azureArchitectureTemplate: DiagramTemplate = {
  id: 'azure-web-app',
  name: 'Azure Web Application',
  description: 'Azure web application with App Service, Azure SQL, and Blob Storage',
  category: 'architecture',
  nodes: [
    {
      id: 'users',
      type: 'custom',
      position: { x: 50, y: 200 },
      data: {
        label: 'Users',
        type: 'users',
        style: { backgroundColor: '#ffffff', borderColor: '#6b7280' },
      },
      width: 80,
      height: 80,
    },
    {
      id: 'cdn',
      type: 'custom',
      position: { x: 200, y: 200 },
      data: {
        label: 'Azure CDN',
        type: 'azure-cdn',
        style: { backgroundColor: '#ffffff', borderColor: '#0078D4' },
      },
      width: 80,
      height: 80,
    },
    {
      id: 'app-service',
      type: 'custom',
      position: { x: 350, y: 200 },
      data: {
        label: 'App Service',
        type: 'azure-app-service',
        style: { backgroundColor: '#ffffff', borderColor: '#0078D4' },
      },
      width: 100,
      height: 80,
    },
    {
      id: 'functions',
      type: 'custom',
      position: { x: 500, y: 100 },
      data: {
        label: 'Azure Functions',
        type: 'azure-functions',
        style: { backgroundColor: '#ffffff', borderColor: '#0062AD' },
      },
      width: 100,
      height: 80,
    },
    {
      id: 'sql',
      type: 'custom',
      position: { x: 500, y: 300 },
      data: {
        label: 'Azure SQL',
        type: 'azure-sql',
        style: { backgroundColor: '#ffffff', borderColor: '#0078D4' },
      },
      width: 100,
      height: 80,
    },
    {
      id: 'storage',
      type: 'custom',
      position: { x: 650, y: 200 },
      data: {
        label: 'Blob Storage',
        type: 'azure-storage',
        style: { backgroundColor: '#ffffff', borderColor: '#0078D4' },
      },
      width: 100,
      height: 80,
    },
    {
      id: 'keyvault',
      type: 'custom',
      position: { x: 650, y: 350 },
      data: {
        label: 'Key Vault',
        type: 'azure-keyvault',
        style: { backgroundColor: '#ffffff', borderColor: '#0078D4' },
      },
      width: 100,
      height: 80,
    },
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'cdn', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e2', source: 'cdn', target: 'app-service', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e3', source: 'app-service', target: 'functions', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'app-service', target: 'sql', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'app-service', target: 'storage', type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'functions', target: 'storage', type: 'smoothstep', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e7', source: 'app-service', target: 'keyvault', type: 'smoothstep', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
}

// Blank template
const blankTemplate: DiagramTemplate = {
  id: 'blank',
  name: 'Blank Diagram',
  description: 'Start with a blank canvas',
  category: 'general',
  nodes: [],
  edges: [],
}

export const DIAGRAM_TEMPLATES: DiagramTemplate[] = [
  blankTemplate,
  awsArchitectureTemplate,
  azureArchitectureTemplate,
  ...ALL_CLOUD_TEMPLATES,
  flowchartTemplate,
  networkDiagramTemplate,
  umlClassDiagramTemplate,
]

export const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All Templates' },
  { id: 'general', label: 'General' },
  { id: 'architecture', label: 'Cloud Architecture' },
  { id: 'flowchart', label: 'Flowchart' },
  { id: 'network', label: 'Network' },
  { id: 'uml', label: 'UML' },
]
