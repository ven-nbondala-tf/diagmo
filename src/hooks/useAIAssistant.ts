import { useState, useCallback } from 'react'
import { aiService } from '@/services/aiService'
import type { DiagramNode, DiagramEdge } from '@/types'
import { toast } from 'sonner'

interface UseAIAssistantOptions {
  onNodesChange?: (nodes: DiagramNode[]) => void
  onEdgesChange?: (edges: DiagramEdge[]) => void
}

export function useAIAssistant(options: UseAIAssistantOptions = {}) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLayouting, setIsLayouting] = useState(false)
  const [isExplaining, setIsExplaining] = useState(false)

  /**
   * Generate a diagram from a text prompt
   */
  const generateDiagram = useCallback(async (
    prompt: string,
    diagramType: 'auto' | 'flowchart' | 'architecture' = 'auto'
  ) => {
    setIsGenerating(true)
    try {
      const result = await aiService.generateDiagram({
        prompt,
        diagramType,
        style: 'detailed',
      })

      if (result.nodes.length > 0) {
        options.onNodesChange?.(result.nodes)
        options.onEdgesChange?.(result.edges)
        toast.success(`Generated ${result.nodes.length} nodes`)
        return result
      } else {
        toast.error('Could not generate diagram from that description')
        return null
      }
    } catch (error) {
      console.error('AI generation failed:', error)
      toast.error('Failed to generate diagram')
      return null
    } finally {
      setIsGenerating(false)
    }
  }, [options])

  /**
   * Auto-layout existing nodes
   */
  const autoLayout = useCallback(async (
    nodes: DiagramNode[],
    edges: DiagramEdge[],
    algorithm: 'hierarchical' | 'force' | 'grid' = 'hierarchical'
  ) => {
    if (nodes.length === 0) {
      toast.error('No nodes to layout')
      return null
    }

    setIsLayouting(true)
    try {
      const suggestions = await aiService.autoLayout(nodes, edges, algorithm)

      if (suggestions.length > 0) {
        // Apply layout to nodes
        const updatedNodes = nodes.map(node => {
          const suggestion = suggestions.find(s => s.nodeId === node.id)
          if (suggestion) {
            return {
              ...node,
              position: suggestion.suggestedPosition,
            }
          }
          return node
        })

        options.onNodesChange?.(updatedNodes)
        toast.success(`Applied ${algorithm} layout`)
        return suggestions
      }

      return null
    } catch (error) {
      console.error('Auto-layout failed:', error)
      toast.error('Failed to apply layout')
      return null
    } finally {
      setIsLayouting(false)
    }
  }, [options])

  /**
   * Explain what a diagram represents
   */
  const explainDiagram = useCallback(async (
    nodes: DiagramNode[],
    edges: DiagramEdge[]
  ) => {
    if (nodes.length === 0) {
      toast.error('No diagram to explain')
      return null
    }

    setIsExplaining(true)
    try {
      const explanation = await aiService.explainDiagram(nodes, edges)
      return explanation
    } catch (error) {
      console.error('Explain failed:', error)
      toast.error('Failed to explain diagram')
      return null
    } finally {
      setIsExplaining(false)
    }
  }, [])

  /**
   * Get suggestions for improving a diagram
   */
  const getSuggestions = useCallback(async (
    nodes: DiagramNode[],
    edges: DiagramEdge[]
  ) => {
    if (nodes.length === 0) {
      return []
    }

    try {
      return await aiService.getSuggestions(nodes, edges)
    } catch (error) {
      console.error('Get suggestions failed:', error)
      return []
    }
  }, [])

  /**
   * Quick generate with common templates
   */
  const quickGenerate = useCallback(async (
    template: 'aws-serverless' | 'azure-webapp' | 'gcp-data' | 'flowchart' | 'microservices'
  ) => {
    const prompts: Record<string, string> = {
      'aws-serverless': 'Create an AWS serverless architecture with API Gateway, Lambda functions, and DynamoDB',
      'azure-webapp': 'Create an Azure web application architecture with App Service, Azure SQL, and CDN',
      'gcp-data': 'Create a GCP data pipeline with Cloud Storage, Dataflow, and BigQuery',
      'flowchart': 'Create a user registration flowchart with email verification',
      'microservices': 'Create a microservices architecture with API gateway, multiple services, and databases',
    }

    return generateDiagram(prompts[template], template === 'flowchart' ? 'flowchart' : 'architecture')
  }, [generateDiagram])

  return {
    // State
    isGenerating,
    isLayouting,
    isExplaining,
    isLoading: isGenerating || isLayouting || isExplaining,

    // Actions
    generateDiagram,
    autoLayout,
    explainDiagram,
    getSuggestions,
    quickGenerate,
  }
}
