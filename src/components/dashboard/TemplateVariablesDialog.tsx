import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import type { ArchitectureTemplate, TemplateVariable } from '@/types'
import { Settings2, Layers } from 'lucide-react'

interface TemplateVariablesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: ArchitectureTemplate
  onConfirm: (template: ArchitectureTemplate, variables: Record<string, string>) => void
  isLoading?: boolean
}

export function TemplateVariablesDialog({
  open,
  onOpenChange,
  template,
  onConfirm,
  isLoading,
}: TemplateVariablesDialogProps) {
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})

  // Initialize variable values from defaults
  useEffect(() => {
    if (template.variables) {
      const defaults: Record<string, string> = {}
      template.variables.forEach(v => {
        defaults[v.id] = v.defaultValue
      })
      setVariableValues(defaults)
    }
  }, [template])

  const handleVariableChange = (variableId: string, value: string) => {
    setVariableValues(prev => ({
      ...prev,
      [variableId]: value,
    }))
  }

  const handleConfirm = () => {
    onConfirm(template, variableValues)
  }

  const variables = template.variables || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-supabase-bg border-supabase-border">
        <DialogHeader>
          <DialogTitle className="text-supabase-text-primary flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Customize Template
          </DialogTitle>
          <DialogDescription className="text-supabase-text-muted">
            Configure the template settings before creating your diagram
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Template Info */}
          <div className="p-4 rounded-lg bg-supabase-bg-secondary border border-supabase-border">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-supabase-bg-tertiary">
                <Layers className="h-5 w-5 text-supabase-green" />
              </div>
              <div>
                <h3 className="font-medium text-supabase-text-primary">{template.name}</h3>
                <p className="text-sm text-supabase-text-muted mt-1">{template.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-supabase-bg-tertiary text-supabase-text-muted capitalize">
                    {template.complexity}
                  </span>
                  <span className="text-xs text-supabase-text-muted">
                    {template.nodes.length} components
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Variables */}
          {variables.length > 0 ? (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-supabase-text-primary">Configuration Options</h4>
              {variables.map((variable) => (
                <div key={variable.id} className="space-y-2">
                  <Label htmlFor={variable.id} className="text-supabase-text-secondary">
                    {variable.name}
                  </Label>
                  {variable.type === 'select' && variable.options ? (
                    <Select
                      value={variableValues[variable.id] || variable.defaultValue}
                      onValueChange={(value) => handleVariableChange(variable.id, value)}
                    >
                      <SelectTrigger className="bg-supabase-bg-secondary border-supabase-border text-supabase-text-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-supabase-bg-secondary border-supabase-border">
                        {variable.options.map((option) => (
                          <SelectItem
                            key={option}
                            value={option}
                            className="text-supabase-text-primary hover:bg-supabase-bg-tertiary capitalize"
                          >
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : variable.type === 'number' ? (
                    <Input
                      id={variable.id}
                      type="number"
                      value={variableValues[variable.id] || variable.defaultValue}
                      onChange={(e) => handleVariableChange(variable.id, e.target.value)}
                      className="bg-supabase-bg-secondary border-supabase-border text-supabase-text-primary"
                    />
                  ) : (
                    <Input
                      id={variable.id}
                      type="text"
                      value={variableValues[variable.id] || variable.defaultValue}
                      onChange={(e) => handleVariableChange(variable.id, e.target.value)}
                      placeholder={variable.defaultValue}
                      className="bg-supabase-bg-secondary border-supabase-border text-supabase-text-primary"
                    />
                  )}
                  <p className="text-xs text-supabase-text-muted">
                    Applies to: {variable.appliesTo.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-supabase-text-muted">
              <p className="text-sm">This template has no configurable options.</p>
              <p className="text-xs mt-1">You can customize the diagram after creation.</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-supabase-border">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-supabase-border"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-supabase-green hover:bg-supabase-green-hover text-supabase-bg"
          >
            {isLoading ? 'Creating...' : 'Create Diagram'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
