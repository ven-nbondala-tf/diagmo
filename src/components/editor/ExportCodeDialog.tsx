import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Label,
  Textarea,
} from '@/components/ui'
import { Copy, Check, Download, AlertCircle, Code2 } from 'lucide-react'
import { useEditorStore } from '@/stores/editorStore'
import { codeExportService } from '@/services/codeExportService'

interface ExportCodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ExportFormat = 'mermaid' | 'plantuml' | 'terraform'
type MermaidDirection = 'TB' | 'LR' | 'BT' | 'RL'

const FORMAT_OPTIONS = [
  { value: 'mermaid' as const, label: 'Mermaid', description: 'Flowchart syntax for Markdown' },
  { value: 'plantuml' as const, label: 'PlantUML', description: 'UML diagram notation' },
  { value: 'terraform' as const, label: 'Terraform', description: 'Infrastructure as Code (HCL)' },
]

const MERMAID_DIRECTIONS = [
  { value: 'TB' as const, label: 'Top to Bottom' },
  { value: 'LR' as const, label: 'Left to Right' },
  { value: 'BT' as const, label: 'Bottom to Top' },
  { value: 'RL' as const, label: 'Right to Left' },
]

export function ExportCodeDialog({ open, onOpenChange }: ExportCodeDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('mermaid')
  const [mermaidDirection, setMermaidDirection] = useState<MermaidDirection>('TB')
  const [copied, setCopied] = useState(false)

  const nodes = useEditorStore((state) => state.nodes)
  const edges = useEditorStore((state) => state.edges)

  // Generate code based on selected format
  const exportResult = useMemo(() => {
    if (nodes.length === 0) {
      return { code: '', warnings: ['No nodes in diagram'] }
    }

    switch (format) {
      case 'mermaid':
        return codeExportService.exportToMermaid(nodes, edges, mermaidDirection)
      case 'plantuml':
        return codeExportService.exportToPlantUml(nodes, edges)
      case 'terraform':
        return codeExportService.exportToTerraform(nodes, edges)
      default:
        return { code: '', warnings: [] }
    }
  }, [format, nodes, edges, mermaidDirection])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportResult.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownload = () => {
    const extensions: Record<ExportFormat, string> = {
      mermaid: 'mmd',
      plantuml: 'puml',
      terraform: 'tf',
    }
    const extension = extensions[format]
    const blob = new Blob([exportResult.code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `diagram.${extension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="w-5 h-5" />
            Export as Code
          </DialogTitle>
          <DialogDescription>
            Generate code from your diagram in various formats
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 space-y-4 py-4 overflow-hidden flex flex-col">
          {/* Format selector */}
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium">Format:</Label>
            <div className="flex gap-2">
              {FORMAT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormat(option.value)}
                  className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    format === option.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-transparent bg-muted hover:bg-muted/80'
                  }`}
                  title={option.description}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mermaid direction selector */}
          {format === 'mermaid' && (
            <div className="flex items-center gap-4">
              <Label className="text-sm font-medium">Direction:</Label>
              <select
                value={mermaidDirection}
                onChange={(e) => setMermaidDirection(e.target.value as MermaidDirection)}
                className="h-8 text-sm border rounded px-2 bg-background"
              >
                {MERMAID_DIRECTIONS.map((dir) => (
                  <option key={dir.value} value={dir.value}>
                    {dir.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Warnings */}
          {exportResult.warnings.length > 0 && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <div className="flex items-start gap-2 text-yellow-800 dark:text-yellow-200">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="text-sm space-y-1">
                  {exportResult.warnings.map((warning, i) => (
                    <div key={i}>{warning}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Code preview */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Generated Code:</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleCopy}
                  disabled={!exportResult.code}
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleDownload}
                  disabled={!exportResult.code}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </div>
            </div>
            <Textarea
              value={exportResult.code}
              readOnly
              className="flex-1 font-mono text-xs resize-none min-h-[300px]"
              placeholder="Generated code will appear here..."
            />
          </div>

          {/* Format-specific help */}
          <div className="text-xs text-muted-foreground space-y-1">
            {format === 'mermaid' && (
              <>
                <p><strong>Mermaid</strong> is a Markdown-based diagramming syntax.</p>
                <p>Use in GitHub, GitLab, Notion, or any Markdown renderer with Mermaid support.</p>
              </>
            )}
            {format === 'plantuml' && (
              <>
                <p><strong>PlantUML</strong> generates UML diagrams from text descriptions.</p>
                <p>Use with PlantUML server, VS Code extension, or IntelliJ IDEA.</p>
              </>
            )}
            {format === 'terraform' && (
              <>
                <p><strong>Terraform</strong> is Infrastructure as Code (HCL syntax).</p>
                <p>The generated code is a skeleton - add actual configuration values before use.</p>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
