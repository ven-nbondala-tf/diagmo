import { useState, useCallback } from 'react'
import { cn } from '@/utils/cn'
import {
  Sparkles,
  Wand2,
  Layout,
  MessageSquare,
  Lightbulb,
  Send,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  Check,
  AlertCircle,
  Zap,
  Grid3X3,
  GitBranch,
} from 'lucide-react'
import { aiService } from '@/services/aiService'
import type { DiagramNode, DiagramEdge } from '@/types'

interface AIAssistantPanelProps {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  onAddNodes: (nodes: DiagramNode[]) => void
  onAddEdges: (edges: DiagramEdge[]) => void
  onUpdateNodePositions: (updates: Array<{ id: string; position: { x: number; y: number } }>) => void
  onReplaceAll: (nodes: DiagramNode[], edges: DiagramEdge[]) => void
  className?: string
}

type AIMode = 'generate' | 'layout' | 'explain' | 'suggest'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function AIAssistantPanel({
  nodes,
  edges,
  onAddNodes,
  onAddEdges,
  onUpdateNodePositions,
  onReplaceAll,
  className,
}: AIAssistantPanelProps) {
  const [mode, setMode] = useState<AIMode>('generate')
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<string | null>(null)
  const [layoutAlgorithm, setLayoutAlgorithm] = useState<'hierarchical' | 'force' | 'grid'>('hierarchical')
  const [diagramType, setDiagramType] = useState<'auto' | 'flowchart' | 'architecture'>('auto')
  const [showSettings, setShowSettings] = useState(false)

  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}`,
      role,
      content,
      timestamp: new Date(),
    }])
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    setError(null)
    addMessage('user', prompt)

    try {
      const result = await aiService.generateDiagram({
        prompt,
        diagramType,
        style: 'detailed',
      })

      if (result.nodes.length > 0) {
        // Replace current diagram or add to it
        if (nodes.length === 0) {
          onReplaceAll(result.nodes, result.edges)
        } else {
          // Offset new nodes to not overlap
          const offsetNodes = result.nodes.map(n => ({
            ...n,
            position: {
              x: n.position.x + 400,
              y: n.position.y,
            },
          }))
          onAddNodes(offsetNodes)
          onAddEdges(result.edges)
        }

        addMessage('assistant',
          `Generated ${result.nodes.length} nodes and ${result.edges.length} connections.${result.explanation ? `\n\n${result.explanation}` : ''}`
        )
      } else {
        addMessage('assistant', 'Could not generate a diagram from that description. Try being more specific.')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate diagram'
      setError(errorMsg)
      addMessage('assistant', `Error: ${errorMsg}`)
    } finally {
      setIsLoading(false)
      setPrompt('')
    }
  }, [prompt, diagramType, nodes.length, addMessage, onReplaceAll, onAddNodes, onAddEdges])

  const handleAutoLayout = useCallback(async () => {
    if (nodes.length === 0) {
      setError('No nodes to layout')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const suggestions = await aiService.autoLayout(nodes, edges, layoutAlgorithm)

      if (suggestions.length > 0) {
        const updates = suggestions.map(s => ({
          id: s.nodeId,
          position: s.suggestedPosition,
        }))
        onUpdateNodePositions(updates)
        addMessage('assistant', `Applied ${layoutAlgorithm} layout to ${suggestions.length} nodes.`)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to apply layout'
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }, [nodes, edges, layoutAlgorithm, onUpdateNodePositions, addMessage])

  const handleExplain = useCallback(async () => {
    if (nodes.length === 0) {
      setError('No diagram to explain')
      return
    }

    setIsLoading(true)
    setError(null)
    addMessage('user', 'Explain this diagram')

    try {
      const explanation = await aiService.explainDiagram(nodes, edges)

      let responseText = `**Summary:** ${explanation.summary}\n\n`
      responseText += `**Components:**\n`
      explanation.components.forEach(c => {
        responseText += `- **${c.name}:** ${c.description}\n`
      })
      if (explanation.dataFlow) {
        responseText += `\n**Data Flow:** ${explanation.dataFlow}\n`
      }
      if (explanation.suggestions?.length) {
        responseText += `\n**Suggestions:**\n`
        explanation.suggestions.forEach(s => {
          responseText += `- ${s}\n`
        })
      }

      addMessage('assistant', responseText)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to explain diagram'
      setError(errorMsg)
      addMessage('assistant', `Error: ${errorMsg}`)
    } finally {
      setIsLoading(false)
    }
  }, [nodes, edges, addMessage])

  const handleSuggest = useCallback(async () => {
    if (nodes.length === 0) {
      setError('No diagram to analyze')
      return
    }

    setIsLoading(true)
    setError(null)
    addMessage('user', 'Suggest improvements')

    try {
      const suggestions = await aiService.getSuggestions(nodes, edges)

      if (suggestions.length === 0) {
        addMessage('assistant', 'Your diagram looks good! No suggestions at this time.')
      } else {
        let responseText = `Found ${suggestions.length} suggestions:\n\n`
        suggestions.forEach((s, i) => {
          responseText += `${i + 1}. **${s.type}:** ${s.description}\n`
        })
        addMessage('assistant', responseText)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get suggestions'
      setError(errorMsg)
      addMessage('assistant', `Error: ${errorMsg}`)
    } finally {
      setIsLoading(false)
    }
  }, [nodes, edges, addMessage])

  const handleSubmit = useCallback(() => {
    switch (mode) {
      case 'generate':
        handleGenerate()
        break
      case 'layout':
        handleAutoLayout()
        break
      case 'explain':
        handleExplain()
        break
      case 'suggest':
        handleSuggest()
        break
    }
  }, [mode, handleGenerate, handleAutoLayout, handleExplain, handleSuggest])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit])

  return (
    <div className={cn('flex flex-col h-full bg-supabase-bg', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-supabase-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Sparkles className="h-4 w-4 text-purple-400" />
          </div>
          <span className="font-medium text-supabase-text-primary">AI Assistant</span>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1.5 rounded-lg text-supabase-text-muted hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary transition-colors"
        >
          {showSettings ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="px-4 py-3 border-b border-supabase-border bg-supabase-bg-secondary space-y-3">
          <div>
            <label className="text-xs font-medium text-supabase-text-muted uppercase tracking-wider">
              Diagram Type
            </label>
            <div className="flex gap-1 mt-1">
              {(['auto', 'flowchart', 'architecture'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setDiagramType(type)}
                  className={cn(
                    'px-2 py-1 text-xs rounded-lg capitalize transition-colors',
                    diagramType === type
                      ? 'bg-supabase-green/10 text-supabase-green'
                      : 'text-supabase-text-secondary hover:bg-supabase-bg-tertiary'
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-supabase-text-muted uppercase tracking-wider">
              Layout Algorithm
            </label>
            <div className="flex gap-1 mt-1">
              {([
                { id: 'hierarchical', icon: GitBranch, label: 'Tree' },
                { id: 'force', icon: Zap, label: 'Force' },
                { id: 'grid', icon: Grid3X3, label: 'Grid' },
              ] as const).map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setLayoutAlgorithm(id)}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors',
                    layoutAlgorithm === id
                      ? 'bg-supabase-green/10 text-supabase-green'
                      : 'text-supabase-text-secondary hover:bg-supabase-bg-tertiary'
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mode Tabs */}
      <div className="flex gap-1 p-2 border-b border-supabase-border">
        {([
          { id: 'generate', icon: Wand2, label: 'Generate' },
          { id: 'layout', icon: Layout, label: 'Layout' },
          { id: 'explain', icon: MessageSquare, label: 'Explain' },
          { id: 'suggest', icon: Lightbulb, label: 'Suggest' },
        ] as const).map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              mode === id
                ? 'bg-supabase-green/10 text-supabase-green'
                : 'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Sparkles className="h-8 w-8 text-supabase-text-muted mx-auto mb-3" />
            <p className="text-sm text-supabase-text-muted">
              {mode === 'generate' && 'Describe the diagram you want to create'}
              {mode === 'layout' && 'Click the button to auto-arrange your diagram'}
              {mode === 'explain' && 'Get an AI explanation of your diagram'}
              {mode === 'suggest' && 'Get suggestions to improve your diagram'}
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex',
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-[85%] px-3 py-2 rounded-lg text-sm',
                msg.role === 'user'
                  ? 'bg-supabase-green text-white'
                  : 'bg-supabase-bg-secondary text-supabase-text-primary'
              )}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              <div className={cn(
                'text-[10px] mt-1',
                msg.role === 'user' ? 'text-white/70' : 'text-supabase-text-muted'
              )}>
                {msg.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-supabase-bg-secondary px-4 py-3 rounded-lg">
              <Loader2 className="h-4 w-4 animate-spin text-supabase-green" />
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-supabase-border">
        {mode === 'generate' ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your diagram..."
              disabled={isLoading}
              className={cn(
                'flex-1 px-3 py-2 rounded-lg text-sm',
                'bg-supabase-bg-secondary border border-supabase-border',
                'text-supabase-text-primary placeholder:text-supabase-text-muted',
                'focus:border-supabase-green focus:ring-1 focus:ring-supabase-green',
                'disabled:opacity-50'
              )}
            />
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className={cn(
                'p-2 rounded-lg transition-colors',
                'bg-supabase-green text-white hover:bg-supabase-green-hover',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isLoading || nodes.length === 0}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors',
              'bg-supabase-green text-white hover:bg-supabase-green-hover',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {mode === 'layout' && <Layout className="h-5 w-5" />}
                {mode === 'explain' && <MessageSquare className="h-5 w-5" />}
                {mode === 'suggest' && <Lightbulb className="h-5 w-5" />}
                {mode === 'layout' && 'Apply Auto Layout'}
                {mode === 'explain' && 'Explain Diagram'}
                {mode === 'suggest' && 'Get Suggestions'}
              </>
            )}
          </button>
        )}

        {mode === 'generate' && (
          <div className="mt-2 flex flex-wrap gap-1">
            {[
              'AWS serverless API',
              'Azure microservices',
              'User signup flowchart',
              'CI/CD pipeline',
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setPrompt(suggestion)}
                className="px-2 py-1 text-xs rounded-lg bg-supabase-bg-secondary text-supabase-text-muted hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
