import { useState, useCallback, useEffect } from 'react'
import { useEditorStore } from '@/stores/editorStore'
import type { NodeStyle, DiagramNode } from '@/types'
import {
  Button,
  ScrollArea,
  Accordion,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui'
import {
  Trash2,
  Copy,
  Square,
  ChevronRight,
  ChevronsUpDown,
} from 'lucide-react'
import { SHAPE_SECTIONS } from './shared'
import { EdgeProperties } from './EdgeProperties'
import { ImageSection, FillSection, BorderSection, ShadowSection, TextSection, SizeSection, ArrangeSection, UMLClassDataSection, DatabaseDataSection, MetadataSection, TableSection } from './sections'
import { PresetPicker } from './sections/PresetPicker'

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

  // Start with all sections collapsed
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [allExpanded, setAllExpanded] = useState(false)

  // Toggle all sections
  const toggleAllSections = () => {
    if (allExpanded) {
      setExpandedSections([])
    } else {
      setExpandedSections(SHAPE_SECTIONS)
    }
    setAllExpanded(!allExpanded)
  }

  // Track if all are expanded
  useEffect(() => {
    setAllExpanded(expandedSections.length >= SHAPE_SECTIONS.length)
  }, [expandedSections])

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
      <div className="w-72 border-l border-supabase-border bg-supabase-bg flex flex-col h-full">
        <div className="p-3 border-b border-supabase-border bg-supabase-bg-secondary">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm text-supabase-text-primary">Properties</h2>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-supabase-text-muted hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary" onClick={togglePropertiesPanel} title="Close Panel">
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center text-supabase-text-muted text-sm px-4 text-center">
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

  // Check if shape has extended data (UML class, database, table)
  const isUMLClass = data.type === 'uml-class'
  const isUMLInterface = data.type === 'uml-interface'
  const isDatabase = data.type === 'database'
  const isTable = data.type === 'table'
  const hasDataTab = isUMLClass || isUMLInterface || isDatabase || isTable

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
    <div className="w-72 border-l border-supabase-border bg-supabase-bg flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-supabase-border bg-supabase-bg-secondary">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-sm text-supabase-text-primary">Shape Properties</h2>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-supabase-text-muted hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary" onClick={toggleAllSections} title={allExpanded ? "Collapse All" : "Expand All"}>
              <ChevronsUpDown className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-supabase-text-muted hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary" onClick={togglePropertiesPanel} title="Close Panel">
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-supabase-text-muted truncate">
          {multipleSelected ? `${selectedNodes.length} shapes selected` : data.label || data.type}
        </p>
      </div>

      {/* Tabbed content */}
      <Tabs defaultValue={hasDataTab ? 'data' : 'style'} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-3 pt-2 border-b border-supabase-border">
          <TabsList className="w-full bg-supabase-bg-tertiary">
            {hasDataTab && (
              <TabsTrigger value="data" className="flex-1 text-xs text-supabase-text-secondary data-[state=active]:bg-supabase-bg data-[state=active]:text-supabase-text-primary">Data</TabsTrigger>
            )}
            <TabsTrigger value="style" className="flex-1 text-xs text-supabase-text-secondary data-[state=active]:bg-supabase-bg data-[state=active]:text-supabase-text-primary">Style</TabsTrigger>
            <TabsTrigger value="text" className="flex-1 text-xs text-supabase-text-secondary data-[state=active]:bg-supabase-bg data-[state=active]:text-supabase-text-primary">Text</TabsTrigger>
            <TabsTrigger value="layout" className="flex-1 text-xs text-supabase-text-secondary data-[state=active]:bg-supabase-bg data-[state=active]:text-supabase-text-primary">Layout</TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          {hasDataTab && (
            <TabsContent value="data" className="m-0 p-0">
              <Accordion type="multiple" value={expandedSections} onValueChange={setExpandedSections} className="w-full">
                {(isUMLClass || isUMLInterface) && <UMLClassDataSection {...sectionProps} />}
                {isDatabase && <DatabaseDataSection {...sectionProps} />}
                {isTable && <TableSection {...sectionProps} />}
              </Accordion>
            </TabsContent>
          )}

          <TabsContent value="style" className="m-0 p-0">
            <PresetPicker
              currentStyle={style}
              onApply={updateAllSelectedStyles}
            />
            <Accordion type="multiple" value={expandedSections} onValueChange={setExpandedSections} className="w-full">
              <ImageSection {...sectionProps} />
              <FillSection {...sectionProps} />
              <BorderSection {...sectionProps} />
              <ShadowSection {...sectionProps} />
            </Accordion>
          </TabsContent>

          <TabsContent value="text" className="m-0 p-0">
            <Accordion type="multiple" value={expandedSections} onValueChange={setExpandedSections} className="w-full">
              <TextSection {...sectionProps} />
            </Accordion>
          </TabsContent>

          <TabsContent value="layout" className="m-0 p-0">
            <Accordion type="multiple" value={expandedSections} onValueChange={setExpandedSections} className="w-full">
              <SizeSection {...sectionProps} />
              <ArrangeSection {...sectionProps} />
            </Accordion>
            <MetadataSection selectedNodes={nodes.filter(n => selectedNodes.includes(n.id))} />
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Actions Footer */}
      <div className="p-3 border-t border-supabase-border space-y-2">
        <Button variant="outline" size="sm" className="w-full h-8 text-xs border-supabase-border text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary" onClick={handleDuplicate}>
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
