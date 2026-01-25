import { useState } from 'react'
import { useEditorStore } from '@/stores/editorStore'
import {
  Input,
  Label,
  Button,
  ScrollArea,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Slider,
} from '@/components/ui'
import {
  Trash2,
  Copy,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  ChevronUp,
  ChevronDown,
  Lock,
  Unlock,
  ArrowRight,
  ArrowLeftRight,
  Minus,
} from 'lucide-react'

export function PropertiesPanel() {
  const nodes = useEditorStore((state) => state.nodes)
  const edges = useEditorStore((state) => state.edges)
  const selectedNodes = useEditorStore((state) => state.selectedNodes)
  const selectedEdges = useEditorStore((state) => state.selectedEdges)
  const updateNode = useEditorStore((state) => state.updateNode)
  const updateNodeStyle = useEditorStore((state) => state.updateNodeStyle)
  const updateEdgeStyle = useEditorStore((state) => state.updateEdgeStyle)
  const deleteSelected = useEditorStore((state) => state.deleteSelected)
  const copyNodes = useEditorStore((state) => state.copyNodes)
  const pasteNodes = useEditorStore((state) => state.pasteNodes)

  // Default expanded sections
  const [expandedSections, setExpandedSections] = useState<string[]>(['style', 'text', 'line', 'arrows'])

  const selectedNode = nodes.find((n) => selectedNodes.includes(n.id))
  const selectedEdge = edges.find((e) => selectedEdges.includes(e.id))

  // Show edge properties if an edge is selected
  if (selectedEdge && !selectedNode) {
    const edgeStyle = selectedEdge.data?.style || {}

    return (
      <div className="w-64 border-l bg-background flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b">
          <h2 className="font-semibold text-sm">Connector Properties</h2>
          <p className="text-xs text-muted-foreground">Edge</p>
        </div>

        {/* Scrollable content */}
        <ScrollArea className="flex-1">
          <Accordion
            type="multiple"
            value={expandedSections}
            onValueChange={setExpandedSections}
            className="w-full"
          >
            {/* LINE STYLE SECTION */}
            <AccordionItem value="line" className="border-b">
              <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
                Line Style
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                {/* Line Type */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Line Type</Label>
                  <div className="flex gap-1">
                    <Button
                      variant={(edgeStyle.lineType || 'solid') === 'solid' ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 flex-1 text-xs"
                      onClick={() => updateEdgeStyle(selectedEdge.id, { lineType: 'solid' })}
                    >
                      <Minus className="w-4 h-4 mr-1" />
                      Solid
                    </Button>
                    <Button
                      variant={edgeStyle.lineType === 'dashed' ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 flex-1 text-xs"
                      onClick={() => updateEdgeStyle(selectedEdge.id, { lineType: 'dashed' })}
                    >
                      <span className="mr-1">- -</span>
                      Dashed
                    </Button>
                    <Button
                      variant={edgeStyle.lineType === 'dotted' ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 flex-1 text-xs"
                      onClick={() => updateEdgeStyle(selectedEdge.id, { lineType: 'dotted' })}
                    >
                      <span className="mr-1">...</span>
                      Dotted
                    </Button>
                  </div>
                </div>

                {/* Stroke Color */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Stroke Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={edgeStyle.strokeColor || '#374151'}
                      onChange={(e) =>
                        updateEdgeStyle(selectedEdge.id, { strokeColor: e.target.value })
                      }
                      className="w-8 h-8 rounded border cursor-pointer"
                    />
                    <Input
                      value={edgeStyle.strokeColor || '#374151'}
                      onChange={(e) =>
                        updateEdgeStyle(selectedEdge.id, { strokeColor: e.target.value })
                      }
                      className="h-8 text-xs font-mono flex-1"
                    />
                  </div>
                </div>

                {/* Stroke Width */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Stroke Width: {edgeStyle.strokeWidth || 2}px</Label>
                  <Slider
                    value={[edgeStyle.strokeWidth || 2]}
                    onValueChange={([value]) =>
                      updateEdgeStyle(selectedEdge.id, { strokeWidth: value })
                    }
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Animated */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Animation</Label>
                  <Button
                    variant={edgeStyle.animated ? 'default' : 'outline'}
                    size="sm"
                    className="w-full h-8 text-xs"
                    onClick={() =>
                      updateEdgeStyle(selectedEdge.id, { animated: !edgeStyle.animated })
                    }
                  >
                    {edgeStyle.animated ? 'Animated' : 'Static'}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* ARROWS SECTION */}
            <AccordionItem value="arrows" className="border-b">
              <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
                Arrows
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                {/* Arrow Start */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Start Arrow</Label>
                  <div className="flex gap-1 flex-wrap">
                    {(['none', 'arrow', 'arrowClosed'] as const).map((type) => (
                      <Button
                        key={type}
                        variant={(edgeStyle.markerStart || 'none') === type ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 text-xs flex-1"
                        onClick={() => updateEdgeStyle(selectedEdge.id, { markerStart: type })}
                      >
                        {type === 'none' ? 'None' : type === 'arrow' ? 'Open' : 'Closed'}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Arrow End */}
                <div className="space-y-1.5">
                  <Label className="text-xs">End Arrow</Label>
                  <div className="flex gap-1 flex-wrap">
                    {(['none', 'arrow', 'arrowClosed'] as const).map((type) => (
                      <Button
                        key={type}
                        variant={(edgeStyle.markerEnd || 'arrowClosed') === type ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 text-xs flex-1"
                        onClick={() => updateEdgeStyle(selectedEdge.id, { markerEnd: type })}
                      >
                        {type === 'none' ? 'None' : type === 'arrow' ? 'Open' : 'Closed'}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Quick Presets</Label>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 flex-1 text-xs"
                      onClick={() =>
                        updateEdgeStyle(selectedEdge.id, {
                          markerStart: 'none',
                          markerEnd: 'arrowClosed',
                        })
                      }
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 flex-1 text-xs"
                      onClick={() =>
                        updateEdgeStyle(selectedEdge.id, {
                          markerStart: 'arrowClosed',
                          markerEnd: 'arrowClosed',
                        })
                      }
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 flex-1 text-xs"
                      onClick={() =>
                        updateEdgeStyle(selectedEdge.id, {
                          markerStart: 'none',
                          markerEnd: 'none',
                        })
                      }
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ScrollArea>

        {/* Actions Footer */}
        <div className="p-3 border-t">
          <Button
            variant="destructive"
            size="sm"
            className="w-full h-8 text-xs"
            onClick={deleteSelected}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete Connector
          </Button>
        </div>
      </div>
    )
  }

  if (!selectedNode) {
    return (
      <div className="w-64 border-l bg-background flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-sm">Properties</h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm px-4 text-center">
          Select a shape or connector to edit its properties
        </div>
      </div>
    )
  }

  const { data } = selectedNode
  const style = data.style || {}

  const handleDuplicate = () => {
    copyNodes()
    pasteNodes()
  }

  return (
    <div className="w-64 border-l bg-background flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="font-semibold text-sm">Properties</h2>
        <p className="text-xs text-muted-foreground truncate capitalize">{data.type}</p>
      </div>

      {/* Scrollable content */}
      <ScrollArea className="flex-1">
        <Accordion
          type="multiple"
          value={expandedSections}
          onValueChange={setExpandedSections}
          className="w-full"
        >
          {/* STYLE SECTION */}
          <AccordionItem value="style" className="border-b">
            <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
              Style
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              {/* Fill Color */}
              <div className="space-y-1.5">
                <Label className="text-xs">Fill Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={style.backgroundColor || '#ffffff'}
                    onChange={(e) =>
                      updateNodeStyle(selectedNode.id, { backgroundColor: e.target.value })
                    }
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                  <Input
                    value={style.backgroundColor || '#ffffff'}
                    onChange={(e) =>
                      updateNodeStyle(selectedNode.id, { backgroundColor: e.target.value })
                    }
                    className="h-8 text-xs font-mono flex-1"
                  />
                </div>
              </div>

              {/* Stroke Color */}
              <div className="space-y-1.5">
                <Label className="text-xs">Stroke Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={style.borderColor || '#374151'}
                    onChange={(e) =>
                      updateNodeStyle(selectedNode.id, { borderColor: e.target.value })
                    }
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                  <Input
                    value={style.borderColor || '#374151'}
                    onChange={(e) =>
                      updateNodeStyle(selectedNode.id, { borderColor: e.target.value })
                    }
                    className="h-8 text-xs font-mono flex-1"
                  />
                </div>
              </div>

              {/* Stroke Width */}
              <div className="space-y-1.5">
                <Label className="text-xs">Stroke Width: {style.borderWidth || 2}px</Label>
                <Slider
                  value={[style.borderWidth || 2]}
                  onValueChange={([value]) =>
                    updateNodeStyle(selectedNode.id, { borderWidth: value })
                  }
                  min={0}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Border Radius (for rectangles) */}
              {(data.type === 'rectangle' || data.type === 'process') && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Corner Radius: {style.borderRadius || 8}px</Label>
                  <Slider
                    value={[style.borderRadius || 8]}
                    onValueChange={([value]) =>
                      updateNodeStyle(selectedNode.id, { borderRadius: value })
                    }
                    min={0}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* TEXT SECTION */}
          <AccordionItem value="text" className="border-b">
            <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
              Text
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              {/* Label */}
              <div className="space-y-1.5">
                <Label className="text-xs">Label</Label>
                <Input
                  value={data.label}
                  onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>

              {/* Font Size */}
              <div className="space-y-1.5">
                <Label className="text-xs">Font Size: {style.fontSize || 14}px</Label>
                <Slider
                  value={[style.fontSize || 14]}
                  onValueChange={([value]) =>
                    updateNodeStyle(selectedNode.id, { fontSize: value })
                  }
                  min={8}
                  max={48}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Font Color */}
              <div className="space-y-1.5">
                <Label className="text-xs">Font Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={style.textColor || '#1f2937'}
                    onChange={(e) =>
                      updateNodeStyle(selectedNode.id, { textColor: e.target.value })
                    }
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                  <Input
                    value={style.textColor || '#1f2937'}
                    onChange={(e) =>
                      updateNodeStyle(selectedNode.id, { textColor: e.target.value })
                    }
                    className="h-8 text-xs font-mono flex-1"
                  />
                </div>
              </div>

              {/* Font Style Buttons */}
              <div className="space-y-1.5">
                <Label className="text-xs">Font Style</Label>
                <div className="flex gap-1">
                  <Button
                    variant={style.fontWeight === 'bold' ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() =>
                      updateNodeStyle(selectedNode.id, {
                        fontWeight: style.fontWeight === 'bold' ? 'normal' : 'bold',
                      })
                    }
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={style.fontStyle === 'italic' ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() =>
                      updateNodeStyle(selectedNode.id, {
                        fontStyle: style.fontStyle === 'italic' ? 'normal' : 'italic',
                      })
                    }
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={style.textDecoration === 'underline' ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() =>
                      updateNodeStyle(selectedNode.id, {
                        textDecoration: style.textDecoration === 'underline' ? 'none' : 'underline',
                      })
                    }
                  >
                    <Underline className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Text Alignment */}
              <div className="space-y-1.5">
                <Label className="text-xs">Alignment</Label>
                <div className="flex gap-1">
                  <Button
                    variant={style.textAlign === 'left' ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => updateNodeStyle(selectedNode.id, { textAlign: 'left' })}
                  >
                    <AlignLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={(style.textAlign || 'center') === 'center' ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => updateNodeStyle(selectedNode.id, { textAlign: 'center' })}
                  >
                    <AlignCenter className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={style.textAlign === 'right' ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => updateNodeStyle(selectedNode.id, { textAlign: 'right' })}
                  >
                    <AlignRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* SIZE & POSITION SECTION */}
          <AccordionItem value="size" className="border-b">
            <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
              Size & Position
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              {/* Position */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">X</Label>
                  <Input
                    type="number"
                    value={Math.round(selectedNode.position.x)}
                    onChange={(e) => {
                      const nodes = useEditorStore.getState().nodes
                      const x = parseInt(e.target.value) || 0
                      useEditorStore.setState({
                        nodes: nodes.map((n) =>
                          n.id === selectedNode.id
                            ? { ...n, position: { ...n.position, x } }
                            : n
                        ),
                        isDirty: true,
                      })
                    }}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Y</Label>
                  <Input
                    type="number"
                    value={Math.round(selectedNode.position.y)}
                    onChange={(e) => {
                      const nodes = useEditorStore.getState().nodes
                      const y = parseInt(e.target.value) || 0
                      useEditorStore.setState({
                        nodes: nodes.map((n) =>
                          n.id === selectedNode.id
                            ? { ...n, position: { ...n.position, y } }
                            : n
                        ),
                        isDirty: true,
                      })
                    }}
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              {/* Size */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Width</Label>
                  <Input
                    type="number"
                    value={(selectedNode.style?.width as number) || 120}
                    onChange={(e) => {
                      const nodes = useEditorStore.getState().nodes
                      const width = parseInt(e.target.value) || 120
                      useEditorStore.setState({
                        nodes: nodes.map((n) =>
                          n.id === selectedNode.id
                            ? { ...n, style: { ...n.style, width } }
                            : n
                        ),
                        isDirty: true,
                      })
                    }}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Height</Label>
                  <Input
                    type="number"
                    value={(selectedNode.style?.height as number) || 60}
                    onChange={(e) => {
                      const nodes = useEditorStore.getState().nodes
                      const height = parseInt(e.target.value) || 60
                      useEditorStore.setState({
                        nodes: nodes.map((n) =>
                          n.id === selectedNode.id
                            ? { ...n, style: { ...n.style, height } }
                            : n
                        ),
                        isDirty: true,
                      })
                    }}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ARRANGE SECTION */}
          <AccordionItem value="arrange" className="border-b">
            <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
              Arrange
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              {/* Z-Order */}
              <div className="space-y-1.5">
                <Label className="text-xs">Layer Order</Label>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 flex-1 text-xs"
                    onClick={() => {
                      const nodes = useEditorStore.getState().nodes
                      const idx = nodes.findIndex((n) => n.id === selectedNode.id)
                      if (idx < nodes.length - 1) {
                        const newNodes = [...nodes]
                        ;[newNodes[idx], newNodes[idx + 1]] = [newNodes[idx + 1], newNodes[idx]]
                        useEditorStore.setState({ nodes: newNodes, isDirty: true })
                      }
                    }}
                  >
                    <ChevronUp className="w-3 h-3 mr-1" />
                    Forward
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 flex-1 text-xs"
                    onClick={() => {
                      const nodes = useEditorStore.getState().nodes
                      const idx = nodes.findIndex((n) => n.id === selectedNode.id)
                      if (idx > 0) {
                        const newNodes = [...nodes]
                        ;[newNodes[idx], newNodes[idx - 1]] = [newNodes[idx - 1], newNodes[idx]]
                        useEditorStore.setState({ nodes: newNodes, isDirty: true })
                      }
                    }}
                  >
                    <ChevronDown className="w-3 h-3 mr-1" />
                    Back
                  </Button>
                </div>
              </div>

              {/* Lock */}
              <div className="space-y-1.5">
                <Label className="text-xs">Lock</Label>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8 text-xs"
                  onClick={() => updateNode(selectedNode.id, { locked: !data.locked })}
                >
                  {data.locked ? (
                    <>
                      <Lock className="w-3 h-3 mr-1" />
                      Locked
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3 h-3 mr-1" />
                      Unlocked
                    </>
                  )}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollArea>

      {/* Actions Footer */}
      <div className="p-3 border-t space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs"
          onClick={handleDuplicate}
        >
          <Copy className="w-3 h-3 mr-1" />
          Duplicate
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="w-full h-8 text-xs"
          onClick={deleteSelected}
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  )
}
