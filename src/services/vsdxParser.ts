/**
 * VSDX Parser Service
 * Parses Microsoft Visio VSDX files (which are ZIP archives containing XML)
 * and converts them to Diagmo node/edge format
 *
 * VSDX Structure:
 * - /visio/pages/page1.xml - Contains shapes for page 1
 * - /visio/pages/pages.xml - Page metadata
 * - /visio/masters/masters.xml - Master shapes (stencils)
 * - /docProps/core.xml - Document properties
 */

import JSZip from 'jszip'

export interface VsdxShape {
  id: string
  name: string
  text: string
  x: number
  y: number
  width: number
  height: number
  masterName?: string
  fillColor?: string
  lineColor?: string
}

export interface VsdxConnection {
  id: string
  fromShape: string
  toShape: string
  fromCell?: string
  toCell?: string
}

export interface VsdxParseResult {
  success: boolean
  shapes: VsdxShape[]
  connections: VsdxConnection[]
  pageWidth: number
  pageHeight: number
  error?: string
}

export interface DiagramNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: {
    label: string
    shapeType?: string
    style?: Record<string, unknown>
  }
  width?: number
  height?: number
}

export interface DiagramEdge {
  id: string
  source: string
  target: string
  type?: string
  data?: {
    label?: string
  }
}

/**
 * Parse a VSDX file and extract shapes and connections
 */
export async function parseVsdxFile(file: File | Blob): Promise<VsdxParseResult> {
  try {
    const zip = await JSZip.loadAsync(file)

    // Get page XML
    const pageXml = await zip.file('visio/pages/page1.xml')?.async('string')
    if (!pageXml) {
      return { success: false, shapes: [], connections: [], pageWidth: 0, pageHeight: 0, error: 'No page found in VSDX' }
    }

    // Parse XML
    const parser = new DOMParser()
    const doc = parser.parseFromString(pageXml, 'text/xml')

    // Extract shapes
    const shapes = extractShapes(doc)

    // Extract connections
    const connections = extractConnections(doc)

    // Get page dimensions
    const pageSheet = doc.querySelector('PageSheet')
    const pageWidth = parseFloat(pageSheet?.querySelector('PageWidth')?.textContent || '8.5') * 96 // Convert inches to pixels
    const pageHeight = parseFloat(pageSheet?.querySelector('PageHeight')?.textContent || '11') * 96

    return {
      success: true,
      shapes,
      connections,
      pageWidth,
      pageHeight,
    }
  } catch (error) {
    return {
      success: false,
      shapes: [],
      connections: [],
      pageWidth: 0,
      pageHeight: 0,
      error: `Failed to parse VSDX: ${error}`,
    }
  }
}

/**
 * Parse VSDX from a URL (fetches and parses)
 */
export async function parseVsdxFromUrl(url: string): Promise<VsdxParseResult> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      return { success: false, shapes: [], connections: [], pageWidth: 0, pageHeight: 0, error: `Failed to fetch: ${response.status}` }
    }
    const blob = await response.blob()
    return parseVsdxFile(blob)
  } catch (error) {
    return {
      success: false,
      shapes: [],
      connections: [],
      pageWidth: 0,
      pageHeight: 0,
      error: `Failed to fetch VSDX: ${error}`,
    }
  }
}

/**
 * Extract shapes from Visio XML
 */
function extractShapes(doc: Document): VsdxShape[] {
  const shapes: VsdxShape[] = []
  const shapeElements = doc.querySelectorAll('Shape')

  shapeElements.forEach((shapeEl) => {
    const id = shapeEl.getAttribute('ID') || ''
    const name = shapeEl.getAttribute('Name') || shapeEl.getAttribute('NameU') || ''
    const masterName = shapeEl.getAttribute('Master') || undefined

    // Get position (PinX, PinY are center points in Visio)
    const pinX = parseFloat(shapeEl.querySelector('Cell[N="PinX"]')?.getAttribute('V') || '0')
    const pinY = parseFloat(shapeEl.querySelector('Cell[N="PinY"]')?.getAttribute('V') || '0')
    const width = parseFloat(shapeEl.querySelector('Cell[N="Width"]')?.getAttribute('V') || '1')
    const height = parseFloat(shapeEl.querySelector('Cell[N="Height"]')?.getAttribute('V') || '0.5')

    // Convert from Visio units (inches) to pixels and adjust for top-left origin
    const scale = 96 // 96 pixels per inch
    const x = (pinX - width / 2) * scale
    const y = (pinY - height / 2) * scale // Visio uses bottom-left origin, we use top-left

    // Get text content
    const textEl = shapeEl.querySelector('Text')
    const text = textEl?.textContent?.trim() || name

    // Get fill color
    const fillColor = shapeEl.querySelector('Cell[N="FillForegnd"]')?.getAttribute('V')
    const lineColor = shapeEl.querySelector('Cell[N="LineColor"]')?.getAttribute('V')

    // Skip connectors (they're handled separately)
    const isConnector = name.toLowerCase().includes('connector') ||
                        name.toLowerCase().includes('dynamic') ||
                        shapeEl.querySelector('Cell[N="BeginX"]') !== null

    if (!isConnector && id) {
      shapes.push({
        id,
        name,
        text,
        x,
        y,
        width: width * scale,
        height: height * scale,
        masterName,
        fillColor: fillColor || undefined,
        lineColor: lineColor || undefined,
      })
    }
  })

  return shapes
}

/**
 * Extract connections from Visio XML
 */
function extractConnections(doc: Document): VsdxConnection[] {
  const connections: VsdxConnection[] = []
  const connectElements = doc.querySelectorAll('Connect')

  // Group connects by shape (each connection has FromSheet -> ToSheet)
  const connectMap = new Map<string, { from?: string; to?: string }>()

  connectElements.forEach((connectEl) => {
    const fromSheet = connectEl.getAttribute('FromSheet') || ''
    const toSheet = connectEl.getAttribute('ToSheet') || ''
    const fromCell = connectEl.getAttribute('FromCell') || ''

    if (fromSheet && toSheet) {
      if (fromCell === 'BeginX') {
        // This is the start of a connector
        const existing = connectMap.get(fromSheet) || {}
        existing.from = toSheet
        connectMap.set(fromSheet, existing)
      } else if (fromCell === 'EndX') {
        // This is the end of a connector
        const existing = connectMap.get(fromSheet) || {}
        existing.to = toSheet
        connectMap.set(fromSheet, existing)
      }
    }
  })

  // Convert to connections
  connectMap.forEach((conn, connectorId) => {
    if (conn.from && conn.to) {
      connections.push({
        id: `edge-${connectorId}`,
        fromShape: conn.from,
        toShape: conn.to,
      })
    }
  })

  return connections
}

/**
 * Convert VSDX parse result to Diagmo format
 */
export function convertToDiagmoFormat(
  result: VsdxParseResult,
  options: { flipY?: boolean; scale?: number } = {}
): { nodes: DiagramNode[]; edges: DiagramEdge[] } {
  const { flipY = true, scale = 1 } = options

  // Create nodes from shapes
  const nodes: DiagramNode[] = result.shapes.map((shape, index) => {
    // Flip Y coordinate if needed (Visio uses bottom-left origin)
    const y = flipY ? result.pageHeight - shape.y - shape.height : shape.y

    return {
      id: `node-${shape.id}`,
      type: 'custom',
      position: {
        x: shape.x * scale,
        y: y * scale,
      },
      data: {
        label: shape.text || shape.name || `Shape ${index + 1}`,
        shapeType: mapVisioShapeToType(shape.masterName || shape.name),
        style: {
          backgroundColor: shape.fillColor ? `#${shape.fillColor}` : undefined,
          borderColor: shape.lineColor ? `#${shape.lineColor}` : undefined,
        },
      },
      width: shape.width * scale,
      height: shape.height * scale,
    }
  })

  // Create edges from connections
  const edges: DiagramEdge[] = result.connections.map((conn) => ({
    id: conn.id,
    source: `node-${conn.fromShape}`,
    target: `node-${conn.toShape}`,
    type: 'smoothstep',
  }))

  return { nodes, edges }
}

/**
 * Map Visio shape names to Diagmo shape types
 */
function mapVisioShapeToType(visioName: string): string {
  const name = visioName.toLowerCase()

  // Azure shapes
  if (name.includes('virtual machine') || name.includes('vm')) return 'azure-vm'
  if (name.includes('app service')) return 'azure-app-service'
  if (name.includes('sql') || name.includes('database')) return 'azure-sql'
  if (name.includes('storage')) return 'azure-storage'
  if (name.includes('function')) return 'azure-functions'
  if (name.includes('kubernetes') || name.includes('aks')) return 'azure-aks'
  if (name.includes('container')) return 'azure-container'
  if (name.includes('load balancer')) return 'azure-load-balancer'
  if (name.includes('vnet') || name.includes('virtual network')) return 'azure-vnet'
  if (name.includes('subnet')) return 'azure-subnet'
  if (name.includes('firewall')) return 'azure-firewall'
  if (name.includes('gateway')) return 'azure-gateway'
  if (name.includes('key vault')) return 'azure-key-vault'
  if (name.includes('cosmos')) return 'azure-cosmos-db'
  if (name.includes('redis')) return 'azure-redis'
  if (name.includes('service bus')) return 'azure-service-bus'
  if (name.includes('event hub')) return 'azure-event-hub'
  if (name.includes('logic app')) return 'azure-logic-apps'
  if (name.includes('api management')) return 'azure-api-management'
  if (name.includes('cdn')) return 'azure-cdn'
  if (name.includes('front door')) return 'azure-front-door'
  if (name.includes('monitor')) return 'azure-monitor'
  if (name.includes('active directory') || name.includes('entra')) return 'azure-active-directory'

  // AWS shapes
  if (name.includes('ec2')) return 'aws-ec2'
  if (name.includes('s3')) return 'aws-s3'
  if (name.includes('lambda')) return 'aws-lambda'
  if (name.includes('rds')) return 'aws-rds'
  if (name.includes('dynamodb')) return 'aws-dynamodb'

  // GCP shapes
  if (name.includes('compute engine')) return 'gcp-compute'
  if (name.includes('cloud storage')) return 'gcp-storage'
  if (name.includes('cloud function')) return 'gcp-functions'

  // Generic shapes
  if (name.includes('rectangle') || name.includes('process')) return 'rectangle'
  if (name.includes('diamond') || name.includes('decision')) return 'diamond'
  if (name.includes('circle') || name.includes('ellipse')) return 'ellipse'
  if (name.includes('cylinder') || name.includes('database')) return 'cylinder'
  if (name.includes('cloud')) return 'cloud'
  if (name.includes('user') || name.includes('person')) return 'user'
  if (name.includes('document')) return 'document'
  if (name.includes('server')) return 'server'

  return 'rectangle' // Default
}

/**
 * Azure Architecture Center Visio file URLs
 * These are the actual download links from the Azure Architecture Center
 */
export const AZURE_VISIO_URLS: Record<string, string> = {
  // Microservices & Containers
  'aks-microservices': 'https://arch-center.azureedge.net/microservices-architecture.vsdx',
  'aks-baseline': 'https://arch-center.azureedge.net/aks-baseline-architecture.vsdx',

  // Web Applications
  'basic-web-app': 'https://arch-center.azureedge.net/basic-web-app.vsdx',
  'scalable-web-app': 'https://arch-center.azureedge.net/scalable-web-app.vsdx',
  'multi-region-web-app': 'https://arch-center.azureedge.net/multi-region-web-app.vsdx',

  // Data & Analytics
  'modern-data-warehouse': 'https://arch-center.azureedge.net/enterprise-data-warehouse.vsdx',
  'synapse-analytics': 'https://arch-center.azureedge.net/azure-analytics-end-to-end.vsdx',

  // AI & ML
  'openai-chatbot': 'https://arch-center.azureedge.net/baseline-openai-e2e-chat.vsdx',

  // Networking
  'hub-spoke': 'https://arch-center.azureedge.net/hub-spoke-network-topology.vsdx',
  'expressroute': 'https://arch-center.azureedge.net/expressroute.vsdx',
  'vpn-gateway': 'https://arch-center.azureedge.net/vpn.vsdx',

  // Hybrid
  'landing-zone': 'https://arch-center.azureedge.net/enterprise-scale-landing-zone.vsdx',

  // IoT
  'iot-reference': 'https://arch-center.azureedge.net/iot-reference-architecture.vsdx',

  // SAP
  'sap-hana': 'https://arch-center.azureedge.net/sap-hana.vsdx',
  'sap-netweaver': 'https://arch-center.azureedge.net/sap-netweaver.vsdx',
}

/**
 * Fetch and parse a Visio file from Azure Architecture Center
 */
export async function fetchAndParseAzureArchitecture(architectureId: string): Promise<{
  success: boolean
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  error?: string
}> {
  const url = AZURE_VISIO_URLS[architectureId]
  if (!url) {
    return { success: false, nodes: [], edges: [], error: `Unknown architecture: ${architectureId}` }
  }

  const result = await parseVsdxFromUrl(url)
  if (!result.success) {
    return { success: false, nodes: [], edges: [], error: result.error }
  }

  const { nodes, edges } = convertToDiagmoFormat(result)
  return { success: true, nodes, edges }
}
