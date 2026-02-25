/**
 * Code Generation Dialog
 * Generates infrastructure code from architecture diagrams
 */

import { useState, useCallback } from 'react'
import { useEditorStore } from '@/stores/editorStore'
import {
  codeGenerationService,
  type CodeProvider,
  type CodeLanguage,
  type CodeGenerationResult,
  type GeneratedFile,
} from '@/services/codeGenerationService'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
  ScrollArea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui'
import {
  Code2,
  Download,
  Copy,
  Check,
  AlertTriangle,
  FileCode,
  Terminal,
  Loader2,
  Cloud,
  Braces,
  FileJson,
  Package,
} from 'lucide-react'
import { cn } from '@/utils'
import { toast } from 'sonner'
import JSZip from 'jszip'

interface CodeGenerationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PROVIDERS: { value: CodeProvider; label: string; description: string; icon: React.ElementType }[] = [
  { value: 'terraform', label: 'Terraform', description: 'HashiCorp Infrastructure as Code', icon: Braces },
  { value: 'pulumi', label: 'Pulumi', description: 'Modern IaC with real programming languages', icon: Code2 },
  { value: 'cloudformation', label: 'CloudFormation', description: 'AWS native IaC (YAML)', icon: Cloud },
  { value: 'cdk', label: 'AWS CDK', description: 'Cloud Development Kit for AWS', icon: Package },
]

const LANGUAGES: { value: CodeLanguage; label: string }[] = [
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'go', label: 'Go' },
]

// Code block with copy functionality
function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard')
  }

  // Get language-specific text color for visual differentiation
  const getLanguageColor = (lang: string) => {
    switch (lang) {
      case 'hcl':
      case 'tf':
        return 'text-purple-300'
      case 'typescript':
      case 'ts':
        return 'text-blue-300'
      case 'json':
        return 'text-yellow-300'
      case 'yaml':
      case 'yml':
        return 'text-green-300'
      default:
        return 'text-gray-300'
    }
  }

  return (
    <div className="relative group">
      <pre className={cn(
        "bg-[#1e1e1e] p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap break-words",
        getLanguageColor(language)
      )}>
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 hover:bg-gray-700"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  )
}

// File icon based on extension
function FileIcon({ filename }: { filename: string }) {
  if (filename.endsWith('.tf') || filename.endsWith('.hcl')) {
    return <Braces className="h-4 w-4 text-purple-400" />
  }
  if (filename.endsWith('.ts') || filename.endsWith('.tsx')) {
    return <FileCode className="h-4 w-4 text-blue-400" />
  }
  if (filename.endsWith('.json')) {
    return <FileJson className="h-4 w-4 text-yellow-400" />
  }
  if (filename.endsWith('.yaml') || filename.endsWith('.yml')) {
    return <FileCode className="h-4 w-4 text-red-400" />
  }
  return <FileCode className="h-4 w-4 text-gray-400" />
}

export function CodeGenerationDialog({ open, onOpenChange }: CodeGenerationDialogProps) {
  const nodes = useEditorStore((s) => s.nodes)
  const edges = useEditorStore((s) => s.edges)

  const [provider, setProvider] = useState<CodeProvider>('terraform')
  const [language, setLanguage] = useState<CodeLanguage>('typescript')
  const [result, setResult] = useState<CodeGenerationResult | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeFile, setActiveFile] = useState<string>('')

  // Check if language selector should be shown
  const showLanguageSelector = provider === 'pulumi' || provider === 'cdk'

  // Count cloud resources
  const awsCount = nodes.filter(n => n.data.type.startsWith('aws-')).length
  const azureCount = nodes.filter(n => n.data.type.startsWith('azure-')).length
  const gcpCount = nodes.filter(n => n.data.type.startsWith('gcp-')).length
  const totalCloudResources = awsCount + azureCount + gcpCount

  const handleGenerate = useCallback(async () => {
    if (totalCloudResources === 0) {
      toast.error('No cloud resources found in diagram', {
        description: 'Add AWS, Azure, or GCP icons to generate infrastructure code',
      })
      return
    }

    setIsGenerating(true)
    try {
      const generatedResult = await codeGenerationService.generateInfrastructureCode(
        nodes,
        edges,
        { provider, language }
      )
      setResult(generatedResult)
      setActiveFile(generatedResult.files[0]?.path || '')

      if (generatedResult.warnings.length > 0) {
        toast.warning(`Generated with ${generatedResult.warnings.length} warning(s)`)
      } else {
        toast.success('Code generated successfully')
      }
    } catch (error) {
      console.error('Code generation error:', error)
      toast.error('Failed to generate code')
    } finally {
      setIsGenerating(false)
    }
  }, [nodes, edges, provider, language, totalCloudResources])

  const handleDownloadZip = useCallback(async () => {
    if (!result) return

    const zip = new JSZip()

    for (const file of result.files) {
      zip.file(file.path, file.content)
    }

    // Add README with instructions
    zip.file('README.md', result.instructions)

    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `diagmo-${provider}-${Date.now()}.zip`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Downloaded as ZIP')
  }, [result, provider])

  const handleCopyAll = useCallback(async () => {
    if (!result) return

    const allCode = result.files
      .map(f => `// === ${f.path} ===\n${f.content}`)
      .join('\n\n')

    await navigator.clipboard.writeText(allCode)
    toast.success('All files copied to clipboard')
  }, [result])

  const currentFile = result?.files.find(f => f.path === activeFile)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary" />
            Generate Infrastructure Code
          </DialogTitle>
          <DialogDescription>
            Transform your architecture diagram into deployable infrastructure code
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Configuration */}
          <div className="w-72 border-r p-4 flex flex-col gap-4 bg-muted/30">
            {/* Cloud Resources Summary */}
            <div className="p-3 rounded-lg bg-background border">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Cloud Resources Detected</h4>
              <div className="space-y-1">
                {awsCount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-orange-500">AWS</span>
                    <Badge variant="secondary">{awsCount}</Badge>
                  </div>
                )}
                {azureCount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-500">Azure</span>
                    <Badge variant="secondary">{azureCount}</Badge>
                  </div>
                )}
                {gcpCount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-500">GCP</span>
                    <Badge variant="secondary">{gcpCount}</Badge>
                  </div>
                )}
                {totalCloudResources === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No cloud resources found. Add AWS, Azure, or GCP icons to your diagram.
                  </p>
                )}
              </div>
            </div>

            {/* Provider Selection */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Output Format
              </label>
              <Select value={provider} onValueChange={(v) => setProvider(v as CodeProvider)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      <div className="flex items-center gap-2">
                        <p.icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{p.label}</div>
                          <div className="text-xs text-muted-foreground">{p.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Language Selection (for Pulumi/CDK) */}
            {showLanguageSelector && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Language
                </label>
                <Select value={language} onValueChange={(v) => setLanguage(v as CodeLanguage)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || totalCloudResources === 0}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Code2 className="h-4 w-4 mr-2" />
                  Generate Code
                </>
              )}
            </Button>

            {/* Warnings */}
            {result && result.warnings.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <h4 className="text-xs font-medium text-amber-500 flex items-center gap-1 mb-2">
                  <AlertTriangle className="h-3 w-3" />
                  Warnings ({result.warnings.length})
                </h4>
                <ScrollArea className="h-24">
                  <ul className="text-xs text-amber-600 space-y-1">
                    {result.warnings.map((w, i) => (
                      <li key={i} className="truncate" title={w}>
                        {w}
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            )}

            {/* Dependencies */}
            {result && result.dependencies.length > 0 && (
              <div className="p-3 rounded-lg bg-background border">
                <h4 className="text-xs font-medium text-muted-foreground mb-2">Dependencies</h4>
                <div className="flex flex-wrap gap-1">
                  {result.dependencies.map((dep) => (
                    <Badge key={dep} variant="outline" className="text-xs">
                      {dep}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {result && (
              <div className="mt-auto space-y-2">
                <Button variant="outline" className="w-full" onClick={handleDownloadZip}>
                  <Download className="h-4 w-4 mr-2" />
                  Download as ZIP
                </Button>
                <Button variant="ghost" className="w-full" onClick={handleCopyAll}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All Files
                </Button>
              </div>
            )}
          </div>

          {/* Right Panel - Code Preview */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {!result ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">
                    Select a provider and click "Generate Code" to see the output
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* File Tabs */}
                <div className="border-b bg-muted/30">
                  <ScrollArea className="w-full" orientation="horizontal">
                    <div className="flex p-1 gap-1">
                      {result.files.map((file) => (
                        <button
                          key={file.path}
                          onClick={() => setActiveFile(file.path)}
                          className={cn(
                            'flex items-center gap-2 px-3 py-1.5 rounded text-sm whitespace-nowrap transition-colors',
                            activeFile === file.path
                              ? 'bg-background text-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                          )}
                        >
                          <FileIcon filename={file.path} />
                          {file.path}
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Code Content */}
                <ScrollArea className="flex-1 p-4">
                  {currentFile && (
                    <CodeBlock code={currentFile.content} language={currentFile.language} />
                  )}
                </ScrollArea>

                {/* Instructions Tab */}
                {result.instructions && (
                  <div className="border-t p-4 bg-muted/30">
                    <details className="group">
                      <summary className="cursor-pointer text-sm font-medium flex items-center gap-2">
                        <Terminal className="h-4 w-4" />
                        Deployment Instructions
                        <span className="text-xs text-muted-foreground">(click to expand)</span>
                      </summary>
                      <div className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap font-mono bg-background p-4 rounded-lg border max-h-48 overflow-y-auto">
                        {result.instructions}
                      </div>
                    </details>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
