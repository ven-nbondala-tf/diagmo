import { useState, useCallback, useEffect } from 'react'
import { useEditorStore } from '@/stores/editorStore'
import type { NodeStyle, DiagramNode } from '@/types'
import {
  Button,
  ScrollArea,
  Accordion,
} from '@/components/ui'
import {
  Trash2,
  Copy,
  Square,
  PanelRightClose,
  ChevronsUpDown,
  ChevronsDownUp,
} from 'lucide-react'
import { SHAPE_SECTIONS } from './shared'
import { EdgeProperties } from './EdgeProperties'
import { ImageSection, FillSection, BorderSection, ShadowSection, TextSection, SizeSection, ArrangeSection } from './sections'

export function PropertiesPanel() {
  const nodes = useEditorStore((state) => state.nodes)
  const edges = useEditorStore((state) => state.edges)
  const selectedNodes = useEditorStore((state) => state.selectedNodes)
  const selectedEdges = useEditorStore((state) => state.selectedEdges)
  const updateNode = useEditorStore((state) => state.updateNode)
  const updateNodeStyle = useEditorStore((state) => state.updateNodeStyle)
  const updateEdge = useEditorStore((state) => state.updateEdge)
  const deleteSelected = useEditorStore((state) => state.deleteSelected)
  const copyNodes = useEditorStore((state) => state.copyNodes)
  const pasteNodes = useEditorStore((state) => state.pasteNodes)
  const togglePropertiesPanel = useEditorStore((state) => state.togglePropertiesPanel)
  const updateNodePosition = useEditorStore((state) => state.updateNodePosition)
  const updateNodeDimensions = useEditorStore((state) => state.updateNodeDimensions)
  const bringToFront = useEditorStore((state) => state.bringToFront)
  const bringForward = useEditorStore((state) => state.bringForward)
  const sendBackward = useEditorStore((state) => state.sendBackward)
  const sendToBack = useEditorStore((state) => state.sendToBack)

  const [expandedSections, setExpandedSections] = useState<string[]>([])

  // Auto-expand relevant sections when selection changes
  useEffect(() => {
    if (selectedNodes.length > 0) {
      const node = nodes.find((n) => selectedNodes.includes(n.id))
      if (node) {
        const defaults = ['fill', 'text', 'size']
        if (node.data.type === 'web-image') defaults.unshift('image')
        setExpandedSections((prev) => [...new Set([...prev, ...defaults])])
      }
    }
  }, [selectedNodes.join(',')])

  const updateAllSelectedStyles = useCallback((styleUpdate: Partial<NodeStyle>) => {
    selectedNodes.forEach((nodeId) => {
      updateNodeStyle(nodeId, styleUpdate)
    })
  }, [selectedNodes, updateNodeStyle])

  const updateAllSelectedData = useCallback((dataUpdate: Partial<DiagramNode['data']>) => {
    selectedNodes.forEach((nodeId) => {
      updateNode(nodeId, dataUpdate)
    })
  }, [selectedNodes, updateNode])

  const selectedNode = nodes.find((n) => selectedNodes.includes(n.id))
  const selectedEdge = edges.find((e) => selectedEdges.includes(e.id))
  const multipleSelected = selectedNodes.length > 1

  // Edge properties
  if (selectedEdge && !selectedNode) {
    return (
      <EdgeProperties
        selectedEdge={selectedEdge}
        updateEdge={updateEdge}
        deleteSelected={deleteSelected}
        togglePropertiesPanel={togglePropertiesPanel}
      />
    )
  }

  // Nothing selected
  if (!selectedNode) {
    return (
      <div className="w-72 border-l bg-background flex flex-col h-full">
        <div className="p-3 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm">Properties</h2>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={togglePropertiesPanel} title="Close Panel">
              <PanelRightClose className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm px-4 text-center">
          <div>
            <Square className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>Select a shape or connector to edit its properties</p>
          </div>
        </div>
      </div>
    )
  }

  // Shape properties
  const data = selectedNode.data
  const style = data.style || {}

  const handleDuplicate = () => {
    copyNodes()
    pasteNodes()
  }

  const sectionProps = {
    style,
    data,
    selectedNode,
    selectedNodes,
    multipleSelected,
    updateAllSelectedStyles,
    updateAllSelectedData,
    updateNode,
    updateNodePosition,
    updateNodeDimensions,
    bringToFront,
    bringForward,
    sendBackward,
    sendToBack,
  }

  return (
    <div className="w-72 border-l bg-background flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b bg-muted/30">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-sm">Shape Properties</h2>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setExpandedSections(SHAPE_SECTIONS)} title="Expand All">
              <ChevronsDownUp className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setExpandedSections([])} title="Collapse All">
              <ChevronsUpDown className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={togglePropertiesPanel} title="Close Panel">
              <PanelRightClose className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {multipleSelected ? `${selectedNodes.length} shapes selected` : data.label || data.type}
        </p>
      </div>

      {/* Scrollable content */}
      <ScrollArea className="flex-1">
        <Accordion type="multiple" value={expandedSections} onValueChange={setExpandedSections} className="w-full">
          <ImageSection {...sectionProps} />
          <FillSection {...sectionProps} />
          <BorderSection {...sectionProps} />
          <ShadowSection {...sectionProps} />
          <TextSection {...sectionProps} />
          <SizeSection {...sectionProps} />
          <ArrangeSection {...sectionProps} />
        </Accordion>
      </ScrollArea>

      {/* Actions Footer */}
      <div className="p-3 border-t space-y-2">
        <Button variant="outline" size="sm" className="w-full h-8 text-xs" onClick={handleDuplicate}>
          <Copy className="w-3 h-3 mr-1" />
          Duplicate
        </Button>
        <Button variant="destructive" size="sm" className="w-full h-8 text-xs" onClick={deleteSelected}>
          <Trash2 className="w-3 h-3 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  )
}
