import { useState, useCallback } from 'react'
import {
  Button,
  Input,
  Label,
  Switch,
  ScrollArea,
  Separator,
} from '@/components/ui'
import {
  X,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Wand2,
  GripVertical,
} from 'lucide-react'
import { useEditorStore } from '@/stores/editorStore'
import type { ConditionalRule, ConditionalRuleCondition, NodeStyle } from '@/types'
import { RULE_PRESETS } from '@/services/conditionalFormattingService'
import { ColorPicker } from './properties/shared/ColorPicker'

const CONDITIONS: { value: ConditionalRuleCondition; label: string }[] = [
  { value: 'label-contains', label: 'Label contains' },
  { value: 'label-equals', label: 'Label equals' },
  { value: 'label-starts-with', label: 'Label starts with' },
  { value: 'label-ends-with', label: 'Label ends with' },
  { value: 'type-is', label: 'Shape type is' },
  { value: 'metadata-equals', label: 'Metadata equals' },
  { value: 'metadata-contains', label: 'Metadata contains' },
]

const BORDER_WIDTHS = ['1', '2', '3', '4']

interface RuleEditorProps {
  rule: ConditionalRule
  onUpdate: (updates: Partial<ConditionalRule>) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
}

function RuleEditor({
  rule,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: RuleEditorProps) {
  const [expanded, setExpanded] = useState(false)
  const isMetadataCondition = rule.condition === 'metadata-equals' || rule.condition === 'metadata-contains'

  const handleStyleChange = useCallback(
    (key: keyof NodeStyle, value: string | number) => {
      onUpdate({ style: { ...rule.style, [key]: value } })
    },
    [rule.style, onUpdate]
  )

  return (
    <div className="border rounded-lg bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 p-3">
        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />

        <Switch
          checked={rule.enabled}
          onCheckedChange={(enabled) => onUpdate({ enabled })}
        />

        <button
          className="flex-1 text-left text-sm font-medium truncate"
          onClick={() => setExpanded(!expanded)}
        >
          {rule.name || 'Unnamed Rule'}
        </button>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            disabled={isFirst}
            onClick={onMoveUp}
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            disabled={isLast}
            onClick={onMoveDown}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t pt-3">
          {/* Rule Name */}
          <div>
            <Label className="text-xs">Rule Name</Label>
            <Input
              value={rule.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="My Rule"
              className="h-8 mt-1"
            />
          </div>

          {/* Condition */}
          <div>
            <Label className="text-xs">Condition</Label>
            <select
              value={rule.condition}
              onChange={(e) => onUpdate({ condition: e.target.value as ConditionalRuleCondition })}
              className="w-full h-8 mt-1 px-2 text-sm border rounded-md bg-background"
            >
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Metadata Key (for metadata conditions) */}
          {isMetadataCondition && (
            <div>
              <Label className="text-xs">Metadata Key</Label>
              <Input
                value={rule.metadataKey || ''}
                onChange={(e) => onUpdate({ metadataKey: e.target.value })}
                placeholder="e.g., status"
                className="h-8 mt-1"
              />
            </div>
          )}

          {/* Value */}
          <div>
            <Label className="text-xs">Value</Label>
            <Input
              value={rule.value}
              onChange={(e) => onUpdate({ value: e.target.value })}
              placeholder={rule.condition === 'type-is' ? 'e.g., rectangle' : 'e.g., error'}
              className="h-8 mt-1"
            />
          </div>

          <Separator />

          {/* Style Options */}
          <div>
            <Label className="text-xs font-medium">Applied Style</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {/* Background Color */}
              <div>
                <Label className="text-xs text-muted-foreground">Fill</Label>
                <div className="mt-1">
                  <ColorPicker
                    value={rule.style.backgroundColor || '#ffffff'}
                    onChange={(color) => handleStyleChange('backgroundColor', color)}
                  />
                </div>
              </div>

              {/* Border Color */}
              <div>
                <Label className="text-xs text-muted-foreground">Border</Label>
                <div className="mt-1">
                  <ColorPicker
                    value={rule.style.borderColor || '#000000'}
                    onChange={(color) => handleStyleChange('borderColor', color)}
                  />
                </div>
              </div>

              {/* Border Width */}
              <div>
                <Label className="text-xs text-muted-foreground">Border Width</Label>
                <select
                  value={String(rule.style.borderWidth || 1)}
                  onChange={(e) => handleStyleChange('borderWidth', parseInt(e.target.value))}
                  className="w-full h-8 mt-1 px-2 text-sm border rounded-md bg-background"
                >
                  {BORDER_WIDTHS.map((w) => (
                    <option key={w} value={w}>{w}px</option>
                  ))}
                </select>
              </div>

              {/* Text Color */}
              <div>
                <Label className="text-xs text-muted-foreground">Text</Label>
                <div className="mt-1">
                  <ColorPicker
                    value={rule.style.textColor || '#000000'}
                    onChange={(color) => handleStyleChange('textColor', color)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function ConditionalFormattingPanel() {
  const conditionalRules = useEditorStore((state) => state.conditionalRules)
  const togglePanel = useEditorStore((state) => state.toggleConditionalFormattingPanel)
  const addRule = useEditorStore((state) => state.addConditionalRule)
  const updateRule = useEditorStore((state) => state.updateConditionalRule)
  const deleteRule = useEditorStore((state) => state.deleteConditionalRule)
  const reorderRules = useEditorStore((state) => state.reorderConditionalRules)
  const nodes = useEditorStore((state) => state.nodes)

  const handleAddRule = useCallback(() => {
    addRule({
      name: `Rule ${conditionalRules.length + 1}`,
      enabled: true,
      condition: 'label-contains',
      value: '',
      style: {},
    })
  }, [addRule, conditionalRules.length])

  const handleAddPreset = useCallback(
    (preset: typeof RULE_PRESETS[number]) => {
      addRule(preset)
    },
    [addRule]
  )

  const handleMoveUp = useCallback(
    (index: number) => {
      if (index === 0) return
      const newOrder = [...conditionalRules.map((r) => r.id)]
      ;[newOrder[index - 1], newOrder[index]] = [newOrder[index]!, newOrder[index - 1]!]
      reorderRules(newOrder)
    },
    [conditionalRules, reorderRules]
  )

  const handleMoveDown = useCallback(
    (index: number) => {
      if (index === conditionalRules.length - 1) return
      const newOrder = [...conditionalRules.map((r) => r.id)]
      ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1]!, newOrder[index]!]
      reorderRules(newOrder)
    },
    [conditionalRules, reorderRules]
  )

  // Count matching nodes for each rule
  const getMatchCount = useCallback(
    (rule: ConditionalRule) => {
      if (!rule.enabled) return 0
      return nodes.filter((node) => {
        const label = node.data.label || ''
        const metadata = node.data.metadata || {}

        switch (rule.condition) {
          case 'label-contains':
            return label.toLowerCase().includes(rule.value.toLowerCase())
          case 'label-equals':
            return label.toLowerCase() === rule.value.toLowerCase()
          case 'label-starts-with':
            return label.toLowerCase().startsWith(rule.value.toLowerCase())
          case 'label-ends-with':
            return label.toLowerCase().endsWith(rule.value.toLowerCase())
          case 'type-is':
            return node.data.type === rule.value
          case 'metadata-equals':
            return rule.metadataKey && String(metadata[rule.metadataKey] || '') === rule.value
          case 'metadata-contains':
            return (
              rule.metadataKey &&
              String(metadata[rule.metadataKey] || '').toLowerCase().includes(rule.value.toLowerCase())
            )
          default:
            return false
        }
      }).length
    },
    [nodes]
  )

  return (
    <div className="w-80 border-l bg-background flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4" />
          <h2 className="font-semibold text-sm">Conditional Formatting</h2>
        </div>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={togglePanel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Add Rule Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={handleAddRule}>
              <Plus className="w-4 h-4 mr-2" />
              New Rule
            </Button>
          </div>

          {/* Presets */}
          <div>
            <Label className="text-xs text-muted-foreground">Quick Add Presets</Label>
            <div className="flex flex-wrap gap-1 mt-2">
              {RULE_PRESETS.map((preset, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleAddPreset(preset)}
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Rules List */}
          <div className="space-y-2">
            {conditionalRules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <p>No rules yet.</p>
                <p className="text-xs mt-1">Add a rule to automatically style shapes based on conditions.</p>
              </div>
            ) : (
              conditionalRules
                .sort((a, b) => a.priority - b.priority)
                .map((rule, index) => (
                  <div key={rule.id}>
                    <RuleEditor
                      rule={rule}
                      onUpdate={(updates) => updateRule(rule.id, updates)}
                      onDelete={() => deleteRule(rule.id)}
                      onMoveUp={() => handleMoveUp(index)}
                      onMoveDown={() => handleMoveDown(index)}
                      isFirst={index === 0}
                      isLast={index === conditionalRules.length - 1}
                    />
                    {rule.enabled && rule.value && (
                      <div className="text-xs text-muted-foreground mt-1 ml-8">
                        Matches {getMatchCount(rule)} shape{getMatchCount(rule) !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="px-4 py-3 border-t text-xs text-muted-foreground">
        Rules are applied in order. Higher rules override lower ones.
      </div>
    </div>
  )
}
