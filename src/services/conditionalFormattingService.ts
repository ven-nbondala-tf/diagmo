import type { DiagramNode, ConditionalRule, NodeStyle } from '@/types'

/**
 * Check if a node matches a conditional rule
 */
export function evaluateRule(node: DiagramNode, rule: ConditionalRule): boolean {
  if (!rule.enabled) return false

  const label = node.data.label || ''
  const nodeType = node.data.type
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
      return nodeType === rule.value

    case 'metadata-equals':
      if (!rule.metadataKey) return false
      return String(metadata[rule.metadataKey] || '') === rule.value

    case 'metadata-contains':
      if (!rule.metadataKey) return false
      return String(metadata[rule.metadataKey] || '').toLowerCase().includes(rule.value.toLowerCase())

    default:
      return false
  }
}

/**
 * Get all matching rules for a node, sorted by priority
 */
export function getMatchingRules(node: DiagramNode, rules: ConditionalRule[]): ConditionalRule[] {
  return rules
    .filter((rule) => evaluateRule(node, rule))
    .sort((a, b) => b.priority - a.priority)
}

/**
 * Compute the effective style for a node based on conditional rules
 * Returns the merged styles from all matching rules, with higher priority rules winning
 */
export function computeConditionalStyle(
  node: DiagramNode,
  rules: ConditionalRule[]
): Partial<NodeStyle> | null {
  const matchingRules = getMatchingRules(node, rules)

  if (matchingRules.length === 0) return null

  // Merge styles from lowest to highest priority (highest wins)
  const sortedByPriorityAsc = [...matchingRules].sort((a, b) => a.priority - b.priority)

  const mergedStyle: Partial<NodeStyle> = {}
  for (const rule of sortedByPriorityAsc) {
    Object.assign(mergedStyle, rule.style)
  }

  return mergedStyle
}

/**
 * Apply conditional formatting to all nodes
 * Returns nodes with conditional styles merged into their existing styles
 */
export function applyConditionalFormatting(
  nodes: DiagramNode[],
  rules: ConditionalRule[]
): DiagramNode[] {
  if (rules.length === 0) return nodes

  return nodes.map((node) => {
    const conditionalStyle = computeConditionalStyle(node, rules)

    if (!conditionalStyle) return node

    return {
      ...node,
      data: {
        ...node.data,
        // Store computed conditional style separately so it can be distinguished from user style
        _conditionalStyle: conditionalStyle,
      },
    }
  })
}

/**
 * Get a human-readable description of a rule condition
 */
export function getRuleConditionLabel(condition: ConditionalRule['condition']): string {
  switch (condition) {
    case 'label-contains':
      return 'Label contains'
    case 'label-equals':
      return 'Label equals'
    case 'label-starts-with':
      return 'Label starts with'
    case 'label-ends-with':
      return 'Label ends with'
    case 'type-is':
      return 'Shape type is'
    case 'metadata-equals':
      return 'Metadata equals'
    case 'metadata-contains':
      return 'Metadata contains'
    default:
      return condition
  }
}

/**
 * Predefined rule presets for common use cases
 */
export const RULE_PRESETS: Omit<ConditionalRule, 'id' | 'priority'>[] = [
  {
    name: 'Error shapes',
    enabled: true,
    condition: 'label-contains',
    value: 'error',
    style: {
      borderColor: '#ef4444',
      borderWidth: 2,
    },
  },
  {
    name: 'Warning shapes',
    enabled: true,
    condition: 'label-contains',
    value: 'warning',
    style: {
      borderColor: '#f59e0b',
      borderWidth: 2,
    },
  },
  {
    name: 'Success shapes',
    enabled: true,
    condition: 'label-contains',
    value: 'success',
    style: {
      borderColor: '#22c55e',
      borderWidth: 2,
    },
  },
  {
    name: 'Highlight decisions',
    enabled: true,
    condition: 'type-is',
    value: 'decision',
    style: {
      backgroundColor: '#fef3c7',
      borderColor: '#d97706',
    },
  },
  {
    name: 'Highlight databases',
    enabled: true,
    condition: 'type-is',
    value: 'database',
    style: {
      backgroundColor: '#dbeafe',
      borderColor: '#2563eb',
    },
  },
]

export const conditionalFormattingService = {
  evaluateRule,
  getMatchingRules,
  computeConditionalStyle,
  applyConditionalFormatting,
  getRuleConditionLabel,
  RULE_PRESETS,
}
