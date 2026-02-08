import { useState, useCallback } from 'react'
import { cn } from '@/utils/cn'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui'
import {
  Sparkles,
  Wand2,
  Cloud,
  GitBranch,
  Database,
  Boxes,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { aiService } from '@/services/aiService'
import type { DiagramNode, DiagramEdge } from '@/types'

interface Template {
  id: string
  name: string
  description: string
  icon: React.ElementType
  prompt: string
  type: 'flowchart' | 'architecture'
}

const TEMPLATES: Template[] = [
  {
    id: 'aws-serverless',
    name: 'AWS Serverless',
    description: 'API Gateway, Lambda, DynamoDB',
    icon: Cloud,
    prompt: 'Create an AWS serverless architecture with API Gateway for REST endpoints, Lambda functions for business logic, and DynamoDB for data storage. Include CloudWatch for monitoring.',
    type: 'architecture',
  },
  {
    id: 'azure-webapp',
    name: 'Azure Web App',
    description: 'App Service, SQL, CDN',
    icon: Cloud,
    prompt: 'Create an Azure web application with App Service, Azure SQL Database, Blob Storage for static files, and Azure CDN for content delivery.',
    type: 'architecture',
  },
  {
    id: 'gcp-data',
    name: 'GCP Data Pipeline',
    description: 'Storage, Dataflow, BigQuery',
    icon: Database,
    prompt: 'Create a GCP data pipeline with Cloud Storage for ingestion, Dataflow for processing, and BigQuery for analytics.',
    type: 'architecture',
  },
  {
    id: 'microservices',
    name: 'Microservices',
    description: 'API Gateway, Services, DBs',
    icon: Boxes,
    prompt: 'Create a microservices architecture with an API gateway, three backend services (user service, order service, inventory service), each with their own database, and a message queue for async communication.',
    type: 'architecture',
  },
  {
    id: 'cicd',
    name: 'CI/CD Pipeline',
    description: 'Build, Test, Deploy stages',
    icon: GitBranch,
    prompt: 'Create a CI/CD pipeline flowchart with stages for code commit, build, unit tests, integration tests, staging deployment, and production deployment. Include approval gates.',
    type: 'flowchart',
  },
  {
    id: 'user-auth',
    name: 'User Authentication',
    description: 'Login, Register, Reset flow',
    icon: ArrowRight,
    prompt: 'Create a user authentication flowchart covering login, registration, password reset, and email verification flows.',
    type: 'flowchart',
  },
]

interface AIGenerateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerated: (nodes: DiagramNode[], edges: DiagramEdge[]) => void
}

export function AIGenerateDialog({
  open,
  onOpenChange,
  onGenerated,
}: AIGenerateDialogProps) {
  const [prompt, setPrompt] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [diagramType, setDiagramType] = useState<'auto' | 'flowchart' | 'architecture'>('auto')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSelectTemplate = useCallback((template: Template) => {
    setSelectedTemplate(template.id)
    setPrompt(template.prompt)
    setDiagramType(template.type)
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setError(null)

    try {
      const result = await aiService.generateDiagram({
        prompt,
        diagramType,
        style: 'detailed',
      })

      if (result.nodes.length > 0) {
        onGenerated(result.nodes, result.edges)
        onOpenChange(false)
        setPrompt('')
        setSelectedTemplate(null)
      } else {
        setError('Could not generate a diagram. Try a more specific description.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate diagram')
    } finally {
      setIsGenerating(false)
    }
  }, [prompt, diagramType, onGenerated, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Sparkles className="h-5 w-5 text-purple-400" />
            </div>
            Generate Diagram with AI
          </DialogTitle>
          <DialogDescription>
            Describe what you want to create or choose a template
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Templates */}
          <div>
            <label className="text-sm font-medium text-supabase-text-primary mb-2 block">
              Quick Templates
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className={cn(
                    'flex flex-col items-start p-3 rounded-lg border text-left transition-all',
                    selectedTemplate === template.id
                      ? 'border-purple-500 bg-purple-500/5'
                      : 'border-supabase-border hover:border-purple-500/50 hover:bg-supabase-bg-tertiary'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <template.icon className={cn(
                      'h-4 w-4',
                      selectedTemplate === template.id ? 'text-purple-400' : 'text-supabase-text-muted'
                    )} />
                    <span className="font-medium text-sm text-supabase-text-primary">
                      {template.name}
                    </span>
                  </div>
                  <span className="text-xs text-supabase-text-muted">
                    {template.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prompt */}
          <div>
            <label className="text-sm font-medium text-supabase-text-primary mb-2 block">
              Describe Your Diagram
            </label>
            <textarea
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value)
                setSelectedTemplate(null)
              }}
              placeholder="E.g., Create a 3-tier web application with a load balancer, two app servers, and a database cluster..."
              rows={4}
              className={cn(
                'w-full px-3 py-2 rounded-lg resize-none',
                'bg-supabase-bg-secondary border border-supabase-border',
                'text-supabase-text-primary placeholder:text-supabase-text-muted',
                'focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
              )}
            />
          </div>

          {/* Diagram Type */}
          <div>
            <label className="text-sm font-medium text-supabase-text-primary mb-2 block">
              Diagram Type
            </label>
            <div className="flex gap-2">
              {(['auto', 'flowchart', 'architecture'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setDiagramType(type)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors',
                    diagramType === type
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                      : 'text-supabase-text-secondary hover:bg-supabase-bg-tertiary border border-transparent'
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          {/* Info */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-supabase-bg-tertiary">
            <Sparkles className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
            <div className="text-xs text-supabase-text-muted">
              <p className="font-medium text-supabase-text-secondary mb-1">Tip: Be specific!</p>
              <p>Include details like specific services, number of components, and how they connect for better results.</p>
            </div>
          </div>
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
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
              'hover:from-purple-600 hover:to-pink-600',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Generate
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
