import type { ShapeType } from '@/types'

export const GRID_SIZE = 20

export const DEFAULT_NODE_STYLE = {
  backgroundColor: '#ffffff',
  borderColor: '#374151',
  borderWidth: 2,
  borderRadius: 8,
  textColor: '#1f2937',
  fontSize: 14,
  fontWeight: 'normal',
}

export const DEFAULT_EDGE_STYLE = {
  strokeColor: '#374151',
  strokeWidth: 2,
  strokeDasharray: '',
  animated: false,
}

export const SHAPE_CATEGORIES = {
  basic: {
    label: 'Basic Shapes',
    shapes: ['rectangle', 'ellipse', 'diamond', 'triangle', 'hexagon', 'cloud', 'text'] as ShapeType[],
  },
  flowchart: {
    label: 'Flowchart',
    shapes: [
      'process',
      'decision',
      'terminator',
      'data',
      'document',
      'predefined-process',
      'manual-input',
      'preparation',
      'delay',
    ] as ShapeType[],
  },
  uml: {
    label: 'UML',
    shapes: [
      'uml-class',
      'uml-interface',
      'uml-actor',
      'uml-usecase',
      'uml-component',
      'uml-package',
    ] as ShapeType[],
  },
  aws: {
    label: 'AWS',
    shapes: ['aws-ec2', 'aws-s3', 'aws-lambda', 'aws-rds'] as ShapeType[],
  },
  azure: {
    label: 'Azure',
    shapes: ['azure-vm', 'azure-storage', 'azure-functions'] as ShapeType[],
  },
  gcp: {
    label: 'GCP',
    shapes: ['gcp-compute', 'gcp-storage', 'gcp-functions'] as ShapeType[],
  },
}

export const SHAPE_LABELS: Record<ShapeType, string> = {
  rectangle: 'Rectangle',
  ellipse: 'Ellipse',
  diamond: 'Diamond',
  parallelogram: 'Parallelogram',
  cylinder: 'Cylinder',
  triangle: 'Triangle',
  hexagon: 'Hexagon',
  cloud: 'Cloud',
  text: 'Text',
  process: 'Process',
  decision: 'Decision',
  terminator: 'Terminator',
  data: 'Data',
  document: 'Document',
  'predefined-process': 'Predefined Process',
  'manual-input': 'Manual Input',
  preparation: 'Preparation',
  delay: 'Delay',
  'uml-class': 'Class',
  'uml-interface': 'Interface',
  'uml-actor': 'Actor',
  'uml-usecase': 'Use Case',
  'uml-component': 'Component',
  'uml-package': 'Package',
  'aws-ec2': 'EC2',
  'aws-s3': 'S3',
  'aws-lambda': 'Lambda',
  'aws-rds': 'RDS',
  'azure-vm': 'Virtual Machine',
  'azure-storage': 'Storage',
  'azure-functions': 'Functions',
  'gcp-compute': 'Compute Engine',
  'gcp-storage': 'Cloud Storage',
  'gcp-functions': 'Cloud Functions',
}

export const KEYBOARD_SHORTCUTS = {
  delete: ['Delete', 'Backspace'],
  copy: ['Control+c', 'Meta+c'],
  paste: ['Control+v', 'Meta+v'],
  cut: ['Control+x', 'Meta+x'],
  undo: ['Control+z', 'Meta+z'],
  redo: ['Control+Shift+z', 'Meta+Shift+z', 'Control+y', 'Meta+y'],
  selectAll: ['Control+a', 'Meta+a'],
  save: ['Control+s', 'Meta+s'],
  zoomIn: ['Control+=', 'Meta+='],
  zoomOut: ['Control+-', 'Meta+-'],
  zoomReset: ['Control+0', 'Meta+0'],
  toggleGrid: ['Control+g', 'Meta+g'],
}

export const AUTO_SAVE_INTERVAL = 30000 // 30 seconds

export const MAX_HISTORY_LENGTH = 50
