import { useState, useCallback, useRef } from 'react'
import { cn } from '@/utils/cn'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui'
import {
  Upload,
  FileJson,
  FileCode,
  FileText,
  Check,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react'

type ImportFormat = 'json' | 'drawio' | 'mermaid' | 'terraform'

interface ImportOption {
  id: ImportFormat
  label: string
  description: string
  icon: React.ElementType
  accept: string
  badge?: string
}

const IMPORT_OPTIONS: ImportOption[] = [
  {
    id: 'json',
    label: 'Diagmo JSON',
    description: 'Import from Diagmo export',
    icon: FileJson,
    accept: '.json',
  },
  {
    id: 'drawio',
    label: 'Draw.io',
    description: 'Import from Draw.io/diagrams.net',
    icon: FileCode,
    accept: '.drawio,.xml',
  },
  {
    id: 'mermaid',
    label: 'Mermaid',
    description: 'Import Mermaid diagram code',
    icon: FileCode,
    accept: '.md,.mmd,.txt',
    badge: 'Beta',
  },
  {
    id: 'terraform',
    label: 'Terraform',
    description: 'Generate from Terraform files',
    icon: FileText,
    accept: '.tf',
    badge: 'Beta',
  },
]

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (data: { nodes: unknown[]; edges: unknown[] }) => void
}

export function ImportDialog({
  open,
  onOpenChange,
  onImport,
}: ImportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ImportFormat>('json')
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [textContent, setTextContent] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const parseJsonFile = useCallback(async (content: string) => {
    try {
      const data = JSON.parse(content)
      if (data.nodes && Array.isArray(data.nodes)) {
        return { nodes: data.nodes, edges: data.edges || [] }
      }
      throw new Error('Invalid Diagmo JSON format')
    } catch {
      throw new Error('Failed to parse JSON file')
    }
  }, [])

  const parseDrawioFile = useCallback(async (content: string) => {
    // Basic Draw.io XML parsing - convert mxCells to nodes/edges
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/xml')
    const cells = doc.querySelectorAll('mxCell')

    const nodes: unknown[] = []
    const edges: unknown[] = []

    cells.forEach((cell, index) => {
      const id = cell.getAttribute('id') || `node-${index}`
      const value = cell.getAttribute('value') || ''
      const style = cell.getAttribute('style') || ''
      const source = cell.getAttribute('source')
      const target = cell.getAttribute('target')
      const geometry = cell.querySelector('mxGeometry')

      if (source && target) {
        // It's an edge
        edges.push({
          id: `edge-${id}`,
          source,
          target,
          type: 'default',
        })
      } else if (geometry) {
        // It's a node
        const x = parseFloat(geometry.getAttribute('x') || '0')
        const y = parseFloat(geometry.getAttribute('y') || '0')
        const width = parseFloat(geometry.getAttribute('width') || '120')
        const height = parseFloat(geometry.getAttribute('height') || '60')

        nodes.push({
          id,
          type: 'shape',
          position: { x, y },
          data: {
            type: style.includes('ellipse') ? 'ellipse' : 'rectangle',
            label: value,
            width,
            height,
          },
        })
      }
    })

    if (nodes.length === 0 && edges.length === 0) {
      throw new Error('No valid diagram content found in Draw.io file')
    }

    return { nodes, edges }
  }, [])

  const parseMermaidCode = useCallback(async (content: string) => {
    // Basic Mermaid parsing for flowcharts
    const lines = content.split('\n').filter(line => line.trim())
    const nodes: unknown[] = []
    const edges: unknown[] = []
    const nodeMap = new Map<string, boolean>()
    let yPosition = 100

    lines.forEach((line, index) => {
      // Skip comments and diagram type declarations
      if (line.trim().startsWith('%%') || line.trim().match(/^(graph|flowchart|sequenceDiagram)/)) {
        return
      }

      // Parse node definitions and connections
      // Pattern: A[Label] --> B[Label]
      const connectionMatch = line.match(/(\w+)(?:\[([^\]]+)\])?\s*(-->|---|-.-|==>)\s*(\w+)(?:\[([^\]]+)\])?/)

      if (connectionMatch) {
        const [, sourceId, sourceLabel, , targetId, targetLabel] = connectionMatch

        // Add source node if not exists
        if (sourceId && !nodeMap.has(sourceId)) {
          nodeMap.set(sourceId, true)
          nodes.push({
            id: sourceId,
            type: 'shape',
            position: { x: 100 + (nodes.length % 3) * 200, y: yPosition },
            data: {
              type: 'rounded-rectangle',
              label: sourceLabel || sourceId,
              width: 120,
              height: 60,
            },
          })
          if (nodes.length % 3 === 0) yPosition += 100
        }

        // Add target node if not exists
        if (targetId && !nodeMap.has(targetId)) {
          nodeMap.set(targetId, true)
          nodes.push({
            id: targetId,
            type: 'shape',
            position: { x: 100 + (nodes.length % 3) * 200, y: yPosition },
            data: {
              type: 'rounded-rectangle',
              label: targetLabel || targetId,
              width: 120,
              height: 60,
            },
          })
          if (nodes.length % 3 === 0) yPosition += 100
        }

        // Add edge
        if (sourceId && targetId) {
          edges.push({
            id: `edge-${index}`,
            source: sourceId,
            target: targetId,
            type: 'default',
          })
        }
      }
    })

    if (nodes.length === 0) {
      throw new Error('No valid Mermaid diagram content found')
    }

    return { nodes, edges }
  }, [])

  const parseTerraformFile = useCallback(async (content: string) => {
    // Basic Terraform parsing - extract resources
    const resourceRegex = /resource\s+"([^"]+)"\s+"([^"]+)"\s*\{/g
    const nodes: unknown[] = []
    const edges: unknown[] = []
    let match
    let index = 0

    while ((match = resourceRegex.exec(content)) !== null) {
      const [, resourceType, resourceName] = match
      if (!resourceType || !resourceName) continue

      const provider = resourceType.split('_')[0] // aws, azure, google

      // Map to cloud icons
      let shapeType = 'rectangle'
      if (provider === 'aws') {
        if (resourceType.includes('instance')) shapeType = 'aws-ec2'
        else if (resourceType.includes('lambda')) shapeType = 'aws-lambda'
        else if (resourceType.includes('s3')) shapeType = 'aws-s3'
        else if (resourceType.includes('rds')) shapeType = 'aws-rds'
        else if (resourceType.includes('vpc')) shapeType = 'aws-vpc'
      } else if (provider === 'azurerm') {
        if (resourceType.includes('virtual_machine')) shapeType = 'azure-vm'
        else if (resourceType.includes('storage')) shapeType = 'azure-storage'
        else if (resourceType.includes('function')) shapeType = 'azure-functions'
      } else if (provider === 'google') {
        if (resourceType.includes('compute_instance')) shapeType = 'gcp-compute'
        else if (resourceType.includes('bigquery')) shapeType = 'gcp-bigquery'
        else if (resourceType.includes('storage')) shapeType = 'gcp-storage'
      }

      nodes.push({
        id: `${resourceType}-${resourceName}`,
        type: 'shape',
        position: { x: 100 + (index % 4) * 180, y: 100 + Math.floor(index / 4) * 120 },
        data: {
          type: shapeType,
          label: resourceName,
          width: 140,
          height: 80,
        },
      })
      index++
    }

    if (nodes.length === 0) {
      throw new Error('No Terraform resources found in file')
    }

    return { nodes, edges }
  }, [])

  const handleImport = useCallback(async () => {
    if (!selectedFile && !textContent) {
      setError('Please select a file or paste content')
      return
    }

    setIsImporting(true)
    setError(null)

    try {
      let content = textContent

      if (selectedFile) {
        content = await selectedFile.text()
      }

      let result: { nodes: unknown[]; edges: unknown[] }

      switch (selectedFormat) {
        case 'json':
          result = await parseJsonFile(content)
          break
        case 'drawio':
          result = await parseDrawioFile(content)
          break
        case 'mermaid':
          result = await parseMermaidCode(content)
          break
        case 'terraform':
          result = await parseTerraformFile(content)
          break
        default:
          throw new Error('Unsupported format')
      }

      onImport(result)
      onOpenChange(false)

      // Reset state
      setSelectedFile(null)
      setTextContent('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setIsImporting(false)
    }
  }, [
    selectedFile,
    textContent,
    selectedFormat,
    parseJsonFile,
    parseDrawioFile,
    parseMermaidCode,
    parseTerraformFile,
    onImport,
    onOpenChange,
  ])

  const selectedOption = IMPORT_OPTIONS.find((opt) => opt.id === selectedFormat)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-supabase-green" />
            Import Diagram
          </DialogTitle>
          <DialogDescription>
            Import diagrams from various formats
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Format Selection */}
          <div className="grid grid-cols-2 gap-2">
            {IMPORT_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setSelectedFormat(option.id)
                  setError(null)
                  setSelectedFile(null)
                }}
                className={cn(
                  'relative flex flex-col items-start gap-1 p-3 rounded-lg border transition-all text-left',
                  selectedFormat === option.id
                    ? 'border-supabase-green bg-supabase-green/5'
                    : 'border-supabase-border hover:border-supabase-green/50 hover:bg-supabase-bg-tertiary'
                )}
              >
                <div className="flex items-center gap-2">
                  <option.icon
                    className={cn(
                      'h-4 w-4',
                      selectedFormat === option.id
                        ? 'text-supabase-green'
                        : 'text-supabase-text-secondary'
                    )}
                  />
                  <span className="font-medium text-sm text-supabase-text-primary">
                    {option.label}
                  </span>
                  {option.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                      {option.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs text-supabase-text-muted">
                  {option.description}
                </span>
                {selectedFormat === option.id && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-4 w-4 text-supabase-green" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* File Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
              selectedFile
                ? 'border-supabase-green bg-supabase-green/5'
                : 'border-supabase-border hover:border-supabase-green/50 hover:bg-supabase-bg-tertiary'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={selectedOption?.accept}
              onChange={handleFileSelect}
              className="hidden"
            />
            {selectedFile ? (
              <div className="flex items-center justify-center gap-2">
                <FileJson className="h-5 w-5 text-supabase-green" />
                <span className="text-sm font-medium text-supabase-text-primary">
                  {selectedFile.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedFile(null)
                  }}
                  className="p-1 rounded hover:bg-supabase-bg-tertiary"
                >
                  <X className="h-4 w-4 text-supabase-text-muted" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-supabase-text-muted mx-auto mb-2" />
                <p className="text-sm text-supabase-text-secondary">
                  Drop a file here or click to browse
                </p>
                <p className="text-xs text-supabase-text-muted mt-1">
                  Accepts: {selectedOption?.accept}
                </p>
              </>
            )}
          </div>

          {/* Text Input for Mermaid */}
          {(selectedFormat === 'mermaid') && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-supabase-text-primary">
                Or paste code directly
              </label>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder={`graph TD
A[Start] --> B{Decision}
B -->|Yes| C[OK]
B -->|No| D[End]`}
                className={cn(
                  'w-full h-32 p-3 rounded-lg resize-none font-mono text-sm',
                  'bg-supabase-bg-secondary border border-supabase-border',
                  'text-supabase-text-primary placeholder:text-supabase-text-muted',
                  'focus:border-supabase-green focus:ring-1 focus:ring-supabase-green'
                )}
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
              <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-supabase-border">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-supabase-text-secondary hover:bg-supabase-bg-tertiary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={isImporting || (!selectedFile && !textContent)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              'bg-supabase-green text-white hover:bg-supabase-green-hover',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Import
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
