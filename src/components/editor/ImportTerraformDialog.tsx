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
import { AlertCircle, Check, Upload, Cloud } from 'lucide-react'
import { parseTerraform } from '@/services/terraformParser'
import { useEditorStore } from '@/stores/editorStore'

interface ImportTerraformDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const exampleTerraform = `# Example AWS Infrastructure
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  subnet_id     = aws_subnet.public.id
}

resource "aws_s3_bucket" "data" {
  bucket = "my-data-bucket"
}

resource "aws_lambda_function" "processor" {
  function_name = "data-processor"
  runtime       = "nodejs18.x"
  handler       = "index.handler"

  environment {
    variables = {
      BUCKET = aws_s3_bucket.data.id
    }
  }
}`

export function ImportTerraformDialog({
  open,
  onOpenChange,
}: ImportTerraformDialogProps) {
  const [tfContent, setTfContent] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [preview, setPreview] = useState<{
    nodeCount: number
    edgeCount: number
    providers: string[]
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const importDiagram = useEditorStore((state) => state.importDiagram)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Read all .tf files and concatenate
    const readers: Promise<string>[] = []
    const fileNames: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file) continue
      fileNames.push(file.name)

      readers.push(
        new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (event) => resolve(event.target?.result as string)
          reader.onerror = () => reject(new Error(`Failed to read ${file.name}`))
          reader.readAsText(file)
        })
      )
    }

    setFileName(fileNames.join(', '))
    setErrors([])
    setPreview(null)

    Promise.all(readers)
      .then((contents) => {
        const combined = contents.join('\n\n# --- Next File ---\n\n')
        setTfContent(combined)
        handlePreviewContent(combined)
      })
      .catch((err) => {
        setErrors([err.message])
      })

    e.target.value = ''
  }

  const handlePreviewContent = (content: string) => {
    if (!content.trim()) {
      setErrors(['Please provide Terraform code'])
      setPreview(null)
      return
    }

    const result = parseTerraform(content)
    setErrors(result.errors)

    if (result.nodes.length > 0) {
      // Extract unique providers from node types
      const providers = new Set<string>()
      result.nodes.forEach((node) => {
        const type = node.data.type as string
        if (type.startsWith('aws-')) providers.add('AWS')
        else if (type.startsWith('azure-')) providers.add('Azure')
        else if (type.startsWith('gcp-')) providers.add('GCP')
        else if (type === 'kubernetes') providers.add('Kubernetes')
        else if (type === 'docker') providers.add('Docker')
      })

      setPreview({
        nodeCount: result.nodes.length,
        edgeCount: result.edges.length,
        providers: Array.from(providers),
      })
    } else {
      setPreview(null)
    }
  }

  const handlePreview = () => {
    handlePreviewContent(tfContent)
  }

  const handleImport = () => {
    if (!tfContent.trim()) return

    const result = parseTerraform(tfContent)
    if (result.nodes.length > 0) {
      importDiagram(result.nodes, result.edges)
      onOpenChange(false)
      setTfContent('')
      setFileName(null)
      setErrors([])
      setPreview(null)
    }
  }

  const handleLoadExample = () => {
    setTfContent(exampleTerraform)
    setFileName(null)
    setErrors([])
    setPreview(null)
  }

  const handleClose = () => {
    onOpenChange(false)
    setTfContent('')
    setFileName(null)
    setErrors([])
    setPreview(null)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Import Terraform Infrastructure
          </DialogTitle>
          <DialogDescription>
            Upload Terraform (.tf) files to visualize your infrastructure.
            Supports AWS, Azure, GCP, Kubernetes, and Docker resources.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File upload */}
          <div className="space-y-2">
            <Label>Upload Files</Label>
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
                .tf files (you can select multiple)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".tf"
              multiple
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
                Or paste code
              </span>
            </div>
          </div>

          {/* Terraform content input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="terraform-code">Terraform Code</Label>
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
              id="terraform-code"
              value={tfContent}
              onChange={(e) => {
                setTfContent(e.target.value)
                setErrors([])
                setPreview(null)
                setFileName(null)
              }}
              placeholder={`resource "aws_instance" "example" {
  ami           = "ami-12345"
  instance_type = "t2.micro"
}`}
              className="font-mono text-xs h-48 resize-none"
            />
          </div>

          {/* Preview info */}
          {preview && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md text-green-800 dark:text-green-200">
              <Check className="w-4 h-4" />
              <div className="text-sm">
                <span>
                  Found {preview.nodeCount} resource{preview.nodeCount !== 1 ? 's' : ''} and{' '}
                  {preview.edgeCount} relationship{preview.edgeCount !== 1 ? 's' : ''}
                </span>
                {preview.providers.length > 0 && (
                  <span className="text-xs ml-2 opacity-75">
                    ({preview.providers.join(', ')})
                  </span>
                )}
              </div>
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

          {/* Supported resources */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">Supported resource types:</p>
            <ul className="list-disc list-inside space-y-0.5 pl-2">
              <li>
                <span className="font-medium">AWS:</span> EC2, Lambda, S3, RDS, DynamoDB, VPC, IAM, etc.
              </li>
              <li>
                <span className="font-medium">Azure:</span> VMs, Functions, Storage, SQL, CosmosDB, AKS, etc.
              </li>
              <li>
                <span className="font-medium">GCP:</span> Compute, Cloud Run, Cloud Functions, BigQuery, etc.
              </li>
              <li>
                <span className="font-medium">Other:</span> Kubernetes, Docker, modules, variables
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
