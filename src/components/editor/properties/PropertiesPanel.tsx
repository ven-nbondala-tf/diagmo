import { useState, useCallback, useEffect, useMemo } from 'react'
import { useEditorStore } from '@/stores/editorStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { collaborationService } from '@/services/collaborationService'
import type { NodeStyle, DiagramNode, GroupStyle } from '@/types'
import {
  Button,
  ScrollArea,
  Accordion,
  Tabs,
  TabsContent,
} from '@/components/ui'
import { cn } from '@/utils/cn'
import {
  Trash2,
  Copy,
  Square,
  ChevronRight,
  ChevronsUpDown,
} from 'lucide-react'
import { SHAPE_SECTIONS } from './shared'
import { EdgeProperties } from './EdgeProperties'
import { ImageSection, FillSection, BorderSection, ShadowSection, TextSection, SizeSection, ArrangeSection, UMLClassDataSection, DatabaseDataSection, MetadataSection, TableSection, GroupSection } from './sections'
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
  const updateGroupStyle = useEditorStore((state) => state.updateGroupStyle)
  const secondaryAccentColor = usePreferencesStore((state) => state.secondaryAccentColor)
  const secondaryAccentTextColor = usePreferencesStore((state) => state.secondaryAccentTextColor)

  // Start with all sections collapsed
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [allExpanded, setAllExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<'data' | 'style' | 'text' | 'layout'>('style')

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

      // Broadcast style update to collaborators
      if (collaborationService.isConnected()) {
        collaborationService.broadcastOperation('node-update', nodeId, {
          data: { style: styleUpdate }
        })
      }
    })
  }, [selectedNodes, updateNodeStyle])

  const updateAllSelectedData = useCallback((dataUpdate: Partial<DiagramNode['data']>) => {
    selectedNodes.forEach((nodeId) => {
      updateNode(nodeId, dataUpdate)

      // Broadcast data update to collaborators
      if (collaborationService.isConnected()) {
        collaborationService.broadcastOperation('node-update', nodeId, {
          data: dataUpdate
        })
      }
    })
  }, [selectedNodes, updateNode])

  const selectedNode = nodes.find((n) => selectedNodes.includes(n.id))
  const selectedEdge = edges.find((e) => selectedEdges.includes(e.id))
  const multipleSelected = selectedNodes.length > 1

  // Check if selected nodes are in a group
  const groupInfo = useMemo(() => {
    if (selectedNodes.length === 0) return null

    const selectedNodeObjects = nodes.filter((n) => selectedNodes.includes(n.id))
    const groupIds = new Set(selectedNodeObjects.map((n) => n.data.groupId).filter(Boolean))

    // If all selected nodes share the same groupId
    if (groupIds.size === 1) {
      const groupId = [...groupIds][0]!
      // Find the group style from any node in the group
      const nodesInGroup = nodes.filter((n) => n.data.groupId === groupId)
      const styleNode = nodesInGroup.find((n) => n.data.groupStyle)
      const groupStyle: GroupStyle = styleNode?.data.groupStyle || {}
      return { groupId, groupStyle }
    }

    return null
  }, [nodes, selectedNodes])

  // Check if shape has extended data (UML class, database, table) - computed before early returns
  const hasDataTab = useMemo(() => {
    if (!selectedNode) return false
    const type = selectedNode.data.type
    return type === 'uml-class' || type === 'uml-interface' || type === 'database' || type === 'table'
  }, [selectedNode])

  // Set initial active tab based on whether there's a data tab - MUST be before early returns
  useEffect(() => {
    if (hasDataTab && activeTab === 'style') {
      setActiveTab('data')
    } else if (!hasDataTab && activeTab === 'data') {
      setActiveTab('style')
    }
  }, [hasDataTab, selectedNode?.id])

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
      <div className="w-72 flex-shrink-0 border-l border-supabase-border bg-supabase-bg flex flex-col h-full overflow-hidden">
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
    <div className="w-72 flex-shrink-0 border-l border-supabase-border bg-supabase-bg flex flex-col h-full overflow-hidden">
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
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'data' | 'style' | 'text' | 'layout')} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-3 pt-2 border-b border-supabase-border">
          <div className={cn('w-full bg-supabase-bg-tertiary rounded-lg p-1 gap-1 grid', hasDataTab ? 'grid-cols-4' : 'grid-cols-3')}>
            {hasDataTab && (
              <button
                onClick={() => setActiveTab('data')}
                className={cn(
                  'flex-1 text-xs py-1.5 rounded-md transition-all',
                  activeTab === 'data'
                    ? 'font-medium shadow-sm'
                    : 'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-secondary/50'
                )}
                style={activeTab === 'data' ? { backgroundColor: secondaryAccentColor, color: secondaryAccentTextColor } : undefined}
              >
                Data
              </button>
            )}
            <button
              onClick={() => setActiveTab('style')}
              className={cn(
                'flex-1 text-xs py-1.5 rounded-md transition-all',
                activeTab === 'style'
                  ? 'font-medium shadow-sm'
                  : 'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-secondary/50'
              )}
              style={activeTab === 'style' ? { backgroundColor: secondaryAccentColor, color: secondaryAccentTextColor } : undefined}
            >
              Style
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={cn(
                'flex-1 text-xs py-1.5 rounded-md transition-all',
                activeTab === 'text'
                  ? 'font-medium shadow-sm'
                  : 'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-secondary/50'
              )}
              style={activeTab === 'text' ? { backgroundColor: secondaryAccentColor, color: secondaryAccentTextColor } : undefined}
            >
              Text
            </button>
            <button
              onClick={() => setActiveTab('layout')}
              className={cn(
                'flex-1 text-xs py-1.5 rounded-md transition-all',
                activeTab === 'layout'
                  ? 'font-medium shadow-sm'
                  : 'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-secondary/50'
              )}
              style={activeTab === 'layout' ? { backgroundColor: secondaryAccentColor, color: secondaryAccentTextColor } : undefined}
            >
              Layout
            </button>
          </div>
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
              {groupInfo && (
                <GroupSection
                  groupId={groupInfo.groupId}
                  groupStyle={groupInfo.groupStyle}
                  updateGroupStyle={updateGroupStyle}
                />
              )}
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
