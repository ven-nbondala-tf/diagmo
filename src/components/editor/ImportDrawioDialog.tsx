import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Textarea,
  Label,
} from '@/components/ui'
import { AlertCircle, FileCode, Check, Upload } from 'lucide-react'
import { parseDrawio } from '@/services/drawioParser'
import { useEditorStore } from '@/stores/editorStore'

interface ImportDrawioDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportDrawioDialog({
  open,
  onOpenChange,
}: ImportDrawioDialogProps) {
  const [xmlContent, setXmlContent] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [preview, setPreview] = useState<{
    nodeCount: number
    edgeCount: number
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const importDiagram = useEditorStore((state) => state.importDiagram)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setErrors([])
    setPreview(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setXmlContent(content)
      handlePreviewContent(content)
    }
    reader.onerror = () => {
      setErrors(['Failed to read file'])
    }
    reader.readAsText(file)

    // Reset input so the same file can be selected again
    e.target.value = ''
  }

  const handlePreviewContent = (content: string) => {
    if (!content.trim()) {
      setErrors(['Please provide Draw.io XML content'])
      setPreview(null)
      return
    }

    const result = parseDrawio(content)
    setErrors(result.errors)

    if (result.nodes.length > 0) {
      setPreview({
        nodeCount: result.nodes.length,
        edgeCount: result.edges.length,
      })
    } else {
      setPreview(null)
    }
  }

  const handlePreview = () => {
    handlePreviewContent(xmlContent)
  }

  const handleImport = () => {
    if (!xmlContent.trim()) return

    const result = parseDrawio(xmlContent)
    if (result.nodes.length > 0) {
      importDiagram(result.nodes, result.edges)
      onOpenChange(false)
      setXmlContent('')
      setFileName(null)
      setErrors([])
      setPreview(null)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setXmlContent('')
    setFileName(null)
    setErrors([])
    setPreview(null)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCode className="w-5 h-5" />
            Import from Draw.io
          </DialogTitle>
          <DialogDescription>
            Upload a Draw.io (.drawio or .xml) file or paste the XML content below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File upload */}
          <div className="space-y-2">
            <Label>Upload File</Label>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              {fileName ? (
                <p className="text-sm font-medium">{fileName}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                .drawio, .xml, or .drawio.xml files
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".drawio,.xml,.drawio.xml"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or paste XML
              </span>
            </div>
          </div>

          {/* XML content input */}
          <div className="space-y-2">
            <Label htmlFor="drawio-xml">Draw.io XML</Label>
            <Textarea
              id="drawio-xml"
              value={xmlContent}
              onChange={(e) => {
                setXmlContent(e.target.value)
                setErrors([])
                setPreview(null)
                setFileName(null)
              }}
              placeholder="<mxfile>...</mxfile>"
              className="font-mono text-xs h-48 resize-none"
            />
          </div>

          {/* Preview info */}
          {preview && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md text-green-800 dark:text-green-200">
              <Check className="w-4 h-4" />
              <span className="text-sm">
                Found {preview.nodeCount} shape{preview.nodeCount !== 1 ? 's' : ''} and{' '}
                {preview.edgeCount} connector{preview.edgeCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md">
              <div className="flex items-start gap-2 text-destructive">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="text-sm space-y-1">
                  {errors.map((error, i) => (
                    <div key={i}>{error}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">How to export from Draw.io:</p>
            <ol className="list-decimal list-inside space-y-0.5 pl-2">
              <li>Open your diagram in Draw.io/diagrams.net</li>
              <li>Go to File → Export as → XML</li>
              <li>Save the file and upload it here</li>
            </ol>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handlePreview}>
            Preview
          </Button>
          <Button
            onClick={handleImport}
            disabled={!preview || errors.length > 0}
          >
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
