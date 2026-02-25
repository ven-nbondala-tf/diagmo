import { useState, useMemo, useCallback } from 'react'
import { useReactFlow } from '@xyflow/react'
import { useEditorStore } from '@/stores/editorStore'
import {
  validationService,
  BUILTIN_RULES,
  type ValidationResult,
  type ValidationRule,
  type ValidationSeverity,
} from '@/services/validationService'
import {
  Button,
  ScrollArea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Switch,
} from '@/components/ui'
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  RefreshCw,
  ChevronRight,
  Settings2,
  X,
  Eye,
  Zap,
} from 'lucide-react'
import { cn } from '@/utils'

// Severity icon component
function SeverityIcon({ severity }: { severity: ValidationSeverity }) {
  switch (severity) {
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-amber-500" />
    case 'info':
      return <Info className="h-4 w-4 text-blue-500" />
  }
}

// Collapsible section component
function CollapsibleSection({
  rule,
  results,
  onNavigate,
}: {
  rule: ValidationRule
  results: ValidationResult[]
  onNavigate: (result: ValidationResult) => void
}) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full px-3 py-2 hover:bg-muted/50 text-left transition-colors"
      >
        <SeverityIcon severity={rule.severity} />
        <span className="text-xs font-medium flex-1 text-supabase-text-primary">
          {rule.name}
        </span>
        <span className="text-[10px] text-supabase-text-secondary bg-supabase-bg-tertiary px-1.5 py-0.5 rounded">
          {results.length}
        </span>
        <ChevronRight className={cn('w-4 h-4 text-muted-foreground transition-transform', isOpen && 'rotate-90')} />
      </button>
      {isOpen && (
        <div className="ml-6 border-l border-border">
          {results.map((result, index) => (
            <button
              key={`${result.nodeId || result.edgeId}-${index}`}
              onClick={() => onNavigate(result)}
              className={cn(
                'flex items-center gap-2 w-full px-3 py-2 text-left',
                'hover:bg-muted/50 transition-colors',
                'text-[11px] text-muted-foreground hover:text-foreground'
              )}
            >
              <Eye className="w-3 h-3 opacity-50" />
              <span className="flex-1 truncate">{result.message}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface ValidationPanelProps {
  onClose?: () => void
}

export function ValidationPanel({ onClose }: ValidationPanelProps) {
  const nodes = useEditorStore((s) => s.nodes)
  const edges = useEditorStore((s) => s.edges)
  const selectNodes = useEditorStore((s) => s.selectNodes)
  const selectEdges = useEditorStore((s) => s.selectEdges)

  const { fitView, setCenter, getZoom } = useReactFlow()

  const [results, setResults] = useState<ValidationResult[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [hasValidated, setHasValidated] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [enabledRules, setEnabledRules] = useState<Set<string>>(
    new Set(BUILTIN_RULES.filter(r => r.enabled).map(r => r.id))
  )

  // Get custom rules with enabled state
  const rules = useMemo(() => {
    return BUILTIN_RULES.map(rule => ({
      ...rule,
      enabled: enabledRules.has(rule.id),
    }))
  }, [enabledRules])

  // Run validation
  const runValidation = useCallback(() => {
    setIsValidating(true)
    setHasValidated(true)

    // Small delay for UI feedback
    setTimeout(() => {
      const validationResults = validationService.validate(nodes, edges, rules)
      setResults(validationResults)
      setIsValidating(false)
    }, 100)
  }, [nodes, edges, rules])

  // Get summary
  const summary = useMemo(() => validationService.getSummary(results), [results])

  // Group results by rule
  const groupedResults = useMemo(() => {
    const groups = new Map<string, ValidationResult[]>()
    results.forEach(result => {
      const existing = groups.get(result.ruleId) || []
      existing.push(result)
      groups.set(result.ruleId, existing)
    })
    return groups
  }, [results])

  // Toggle rule
  const toggleRule = useCallback((ruleId: string) => {
    setEnabledRules(prev => {
      const next = new Set(prev)
      if (next.has(ruleId)) {
        next.delete(ruleId)
      } else {
        next.add(ruleId)
      }
      return next
    })
  }, [])

  // Navigate to issue
  const navigateToIssue = useCallback((result: ValidationResult) => {
    if (result.nodeId) {
      // Select the node
      selectNodes([result.nodeId])
      selectEdges([])

      // Find the node and zoom to it
      const node = nodes.find(n => n.id === result.nodeId)
      if (node) {
        const zoom = Math.max(getZoom(), 1)
        setCenter(
          node.position.x + (node.measured?.width || 100) / 2,
          node.position.y + (node.measured?.height || 50) / 2,
          { zoom, duration: 500 }
        )
      }
    } else if (result.edgeId) {
      selectEdges([result.edgeId])
      selectNodes([])
    }
  }, [nodes, selectNodes, selectEdges, setCenter, getZoom])

  return (
    <div className="w-72 flex-shrink-0 border-l border-supabase-border bg-supabase-bg flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-supabase-border bg-supabase-bg-secondary">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-supabase-text-muted" />
            <h2 className="font-semibold text-sm text-supabase-text-primary">Diagram Validation</h2>
          </div>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-supabase-text-muted hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Configure Rules</TooltipContent>
            </Tooltip>
            {onClose && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-supabase-text-muted hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary"
                    onClick={onClose}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Close Panel</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-3 border-b border-supabase-border bg-supabase-bg-secondary">
          <h4 className="text-xs font-medium text-supabase-text-muted mb-2">
            Validation Rules
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {BUILTIN_RULES.map(rule => (
              <div
                key={rule.id}
                className="flex items-center justify-between py-1"
              >
                <div className="flex items-center gap-2">
                  <SeverityIcon severity={rule.severity} />
                  <span className="text-xs text-supabase-text-secondary">{rule.name}</span>
                </div>
                <Switch
                  checked={enabledRules.has(rule.id)}
                  onCheckedChange={() => toggleRule(rule.id)}
                  className="scale-75"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current State Indicator */}
      <div className="px-3 py-2 border-b border-supabase-border bg-supabase-green-muted">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-supabase-green animate-pulse" />
          <span className="text-xs font-medium text-supabase-text-primary">Ready to Validate</span>
        </div>
        <div className="mt-1 ml-5 text-[10px] text-muted-foreground">
          {nodes.length} shapes • {edges.length} connections
        </div>
      </div>

      {/* Summary */}
      {hasValidated && (
        <div className="px-3 py-2 border-b border-supabase-border">
          <div className="flex items-center justify-between">
            {summary.total === 0 ? (
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-medium">No issues found!</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {summary.errors > 0 && (
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-medium">{summary.errors}</span>
                  </div>
                )}
                {summary.warnings > 0 && (
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-medium">{summary.warnings}</span>
                  </div>
                )}
                {summary.info > 0 && (
                  <div className="flex items-center gap-1">
                    <Info className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium">{summary.info}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      <ScrollArea className="flex-1">
        {!hasValidated ? (
          <div className="p-6 text-center">
            <Zap className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-sm font-medium text-muted-foreground">No validation run yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click the button below to check for issues
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="p-6 text-center">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-500" />
            <p className="text-sm font-medium text-muted-foreground">Your diagram looks great!</p>
            <p className="text-xs text-muted-foreground mt-1">
              No issues detected
            </p>
          </div>
        ) : (
          <div className="py-2">
            {Array.from(groupedResults.entries()).map(([ruleId, ruleResults]) => {
              const rule = BUILTIN_RULES.find(r => r.id === ruleId)
              if (!rule) return null

              return (
                <CollapsibleSection
                  key={ruleId}
                  rule={rule}
                  results={ruleResults}
                  onNavigate={navigateToIssue}
                />
              )
            })}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-supabase-border bg-muted/30">
        <Button
          variant="default"
          size="sm"
          className="w-full h-8 text-xs"
          onClick={runValidation}
          disabled={isValidating}
        >
          {isValidating ? (
            <>
              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
              Validating...
            </>
          ) : (
            <>
              <Zap className="w-3 h-3 mr-1" />
              Validate Diagram
            </>
          )}
        </Button>
        {hasValidated && (
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            {results.length === 0 ? 'All checks passed' : `${results.length} issue${results.length !== 1 ? 's' : ''} found`}
          </p>
        )}
      </div>
    </div>
  )
}
