import { useState } from 'react'
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
import { AlertCircle, FileCode, Check } from 'lucide-react'
import { parseMermaid } from '@/services/mermaidParser'
import { useEditorStore } from '@/stores/editorStore'

interface ImportMermaidDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const exampleMermaid = `graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E((End))`

export function ImportMermaidDialog({
  open,
  onOpenChange,
}: ImportMermaidDialogProps) {
  const [code, setCode] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [preview, setPreview] = useState<{
    nodeCount: number
    edgeCount: number
  } | null>(null)

  const importDiagram = useEditorStore((state) => state.importDiagram)

  const handlePreview = () => {
    if (!code.trim()) {
      setErrors(['Please enter Mermaid code'])
      setPreview(null)
      return
    }

    const result = parseMermaid(code)
    setErrors(result.errors)

    if (result.nodes.length > 0) {
      setPreview({
        nodeCount: result.nodes.length,
        edgeCount: result.edges.length,
      })
    } else {
      setPreview(null)
      if (result.errors.length === 0) {
        setErrors(['No diagram elements found in the code'])
      }
    }
  }

  const handleImport = () => {
    if (!code.trim()) return

    const result = parseMermaid(code)
    if (result.nodes.length > 0) {
      importDiagram(result.nodes, result.edges)
      onOpenChange(false)
      setCode('')
      setErrors([])
      setPreview(null)
    }
  }

  const handleLoadExample = () => {
    setCode(exampleMermaid)
    setErrors([])
    setPreview(null)
  }

  const handleClose = () => {
    onOpenChange(false)
    setCode('')
    setErrors([])
    setPreview(null)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCode className="w-5 h-5" />
            Import from Mermaid
          </DialogTitle>
          <DialogDescription>
            Paste Mermaid flowchart code below. Supports graph/flowchart syntax
            with nodes, edges, and subgraphs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="mermaid-code">Mermaid Code</Label>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={handleLoadExample}
              >
                Load Example
              </Button>
            </div>
            <Textarea
              id="mermaid-code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setErrors([])
                setPreview(null)
              }}
              placeholder={`graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action]
    B -->|No| D[End]`}
              className="font-mono text-sm h-64 resize-none"
            />
          </div>

          {/* Preview info */}
          {preview && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md text-green-800 dark:text-green-200">
              <Check className="w-4 h-4" />
              <span className="text-sm">
                Found {preview.nodeCount} node{preview.nodeCount !== 1 ? 's' : ''} and{' '}
                {preview.edgeCount} edge{preview.edgeCount !== 1 ? 's' : ''}
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

          {/* Supported syntax */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">Supported syntax:</p>
            <ul className="list-disc list-inside space-y-0.5 pl-2">
              <li>
                <code className="bg-muted px-1 rounded">graph TD/LR/BT/RL</code> - Direction
              </li>
              <li>
                <code className="bg-muted px-1 rounded">A[Rectangle]</code>,{' '}
                <code className="bg-muted px-1 rounded">B(Rounded)</code>,{' '}
                <code className="bg-muted px-1 rounded">{'C{Diamond}'}</code>,{' '}
                <code className="bg-muted px-1 rounded">D((Circle))</code>
              </li>
              <li>
                <code className="bg-muted px-1 rounded">{'A --> B'}</code>,{' '}
                <code className="bg-muted px-1 rounded">{'A -->|label| B'}</code>,{' '}
                <code className="bg-muted px-1 rounded">{'A -.-> B'}</code> (dotted)
              </li>
              <li>
                <code className="bg-muted px-1 rounded">subgraph</code> blocks for grouping
              </li>
            </ul>
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
