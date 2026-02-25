import { useState, useCallback, useMemo } from 'react'
import { cn } from '@/utils/cn'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui'
import {
  Image,
  FileImage,
  FileText,
  FileJson,
  Copy,
  Download,
  Check,
  Loader2,
  Info,
} from 'lucide-react'
import { exportService } from '@/services/exportService'
import type { DiagramNode } from '@/types'

type ExportFormat = 'png' | 'png-hd' | 'png-transparent' | 'svg' | 'pdf' | 'json'
type ExportResolution = '2x' | '4x' | '8x'

interface ExportOption {
  id: ExportFormat
  label: string
  description: string
  icon: React.ElementType
  badge?: string
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: 'png',
    label: 'PNG',
    description: 'Standard quality image (2x)',
    icon: Image,
  },
  {
    id: 'png-hd',
    label: 'PNG HD',
    description: 'High resolution image (4x or 8x)',
    icon: Image,
    badge: 'HD',
  },
  {
    id: 'png-transparent',
    label: 'PNG Transparent',
    description: 'Transparent background',
    icon: FileImage,
  },
  {
    id: 'svg',
    label: 'SVG',
    description: 'Scalable vector graphics',
    icon: FileImage,
  },
  {
    id: 'pdf',
    label: 'PDF',
    description: 'Document format',
    icon: FileText,
  },
  {
    id: 'json',
    label: 'JSON',
    description: 'Diagram data for import',
    icon: FileJson,
  },
]

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  diagramName: string
  nodes: DiagramNode[]
  edges: unknown[]
  reactFlowWrapper: HTMLElement | null  // The .react-flow wrapper element
  onExport?: (format: ExportFormat) => void
}

export function ExportDialog({
  open,
  onOpenChange,
  diagramName,
  nodes,
  edges,
  reactFlowWrapper,
  onExport,
}: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('png')
  const [resolution, setResolution] = useState<ExportResolution>('4x')
  const [isExporting, setIsExporting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [includeBackground, setIncludeBackground] = useState(true)

  // Calculate export dimensions
  const dimensions = useMemo(() => {
    if (nodes.length === 0) return null
    const pixelRatio = selectedFormat === 'png-hd' ? parseInt(resolution) : 2
    return exportService.getExportDimensions(nodes, 50, pixelRatio)
  }, [nodes, selectedFormat, resolution])

  const getBackgroundColor = useCallback(() => {
    const isDark = document.documentElement.classList.contains('dark')
    return isDark ? '#1c1c1c' : '#ffffff'
  }, [])

  const handleExport = useCallback(async () => {
    if (!reactFlowWrapper || nodes.length === 0) return

    setIsExporting(true)
    try {
      const backgroundColor = includeBackground ? getBackgroundColor() : undefined
      const filename = `${diagramName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`

      switch (selectedFormat) {
        case 'png': {
          const dataUrl = await exportService.exportFullDiagramToPng(
            reactFlowWrapper,
            nodes,
            { backgroundColor }
          )
          exportService.downloadFile(dataUrl, `${filename}.png`)
          break
        }
        case 'png-hd': {
          const dataUrl = await exportService.exportHighResPng(
            reactFlowWrapper,
            nodes,
            resolution,
            { backgroundColor }
          )
          exportService.downloadFile(dataUrl, `${filename}_${resolution}.png`)
          break
        }
        case 'png-transparent': {
          const dataUrl = await exportService.exportTransparentPng(
            reactFlowWrapper,
            nodes
          )
          exportService.downloadFile(dataUrl, `${filename}_transparent.png`)
          break
        }
        case 'svg': {
          const dataUrl = await exportService.exportFullDiagramToSvg(
            reactFlowWrapper,
            nodes,
            { backgroundColor }
          )
          exportService.downloadFile(dataUrl, `${filename}.svg`)
          break
        }
        case 'pdf': {
          const blob = await exportService.exportFullDiagramToPdf(
            reactFlowWrapper,
            nodes,
            { backgroundColor }
          )
          exportService.downloadFile(blob, `${filename}.pdf`)
          break
        }
        case 'json': {
          const data = JSON.stringify({ nodes, edges }, null, 2)
          const blob = new Blob([data], { type: 'application/json' })
          exportService.downloadFile(blob, `${filename}.json`)
          break
        }
      }

      onExport?.(selectedFormat)
      onOpenChange(false)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }, [
    reactFlowWrapper,
    nodes,
    edges,
    selectedFormat,
    resolution,
    includeBackground,
    diagramName,
    getBackgroundColor,
    onExport,
    onOpenChange,
  ])

  const handleCopyToClipboard = useCallback(async () => {
    if (!reactFlowWrapper || nodes.length === 0) return

    setIsExporting(true)
    try {
      const success = await exportService.copyToClipboard(
        reactFlowWrapper,
        nodes,
        { backgroundColor: getBackgroundColor() }
      )
      if (success) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (error) {
      console.error('Copy to clipboard failed:', error)
    } finally {
      setIsExporting(false)
    }
  }, [reactFlowWrapper, nodes, getBackgroundColor])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-supabase-green" />
            Export Diagram
          </DialogTitle>
          <DialogDescription>
            Choose a format to export your diagram
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Format Selection */}
          <div className="grid grid-cols-2 gap-2">
            {EXPORT_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedFormat(option.id)}
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
                    <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-supabase-green/10 text-supabase-green">
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

          {/* HD Resolution Options */}
          {selectedFormat === 'png-hd' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-supabase-text-primary">
                Resolution
              </label>
              <div className="flex gap-2">
                {(['2x', '4x', '8x'] as ExportResolution[]).map((res) => (
                  <button
                    key={res}
                    onClick={() => setResolution(res)}
                    className={cn(
                      'flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors',
                      resolution === res
                        ? 'border-supabase-green bg-supabase-green/10 text-supabase-green'
                        : 'border-supabase-border text-supabase-text-secondary hover:border-supabase-green/50'
                    )}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Background Toggle */}
          {selectedFormat !== 'png-transparent' && selectedFormat !== 'json' && (
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeBackground}
                onChange={(e) => setIncludeBackground(e.target.checked)}
                className="h-4 w-4 rounded border-supabase-border text-supabase-green focus:ring-supabase-green"
              />
              <span className="text-sm text-supabase-text-secondary">
                Include background color
              </span>
            </label>
          )}

          {/* Dimensions Preview */}
          {dimensions && selectedFormat !== 'json' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-supabase-bg-tertiary">
              <Info className="h-4 w-4 text-supabase-text-muted shrink-0" />
              <span className="text-sm text-supabase-text-secondary">
                Export size: {dimensions.actualWidth} × {dimensions.actualHeight}px
                <span className="text-supabase-text-muted ml-1">
                  ({nodes.length} node{nodes.length !== 1 ? 's' : ''})
                </span>
              </span>
            </div>
          )}

          {/* No nodes warning */}
          {nodes.length === 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <Info className="h-4 w-4 text-yellow-500 shrink-0" />
              <span className="text-sm text-yellow-600 dark:text-yellow-400">
                No nodes to export. Add some shapes first.
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-supabase-border">
          <button
            onClick={handleCopyToClipboard}
            disabled={isExporting || nodes.length === 0}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-supabase-green" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy to Clipboard
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-supabase-text-secondary hover:bg-supabase-bg-tertiary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || nodes.length === 0}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                'bg-supabase-green text-white hover:bg-supabase-green-hover',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
