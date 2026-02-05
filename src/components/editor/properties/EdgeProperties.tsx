import { useState, useEffect } from 'react'
import { MarkerType } from '@xyflow/react'
import {
  Label,
  Input,
  Button,
  ScrollArea,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui'
import {
  Trash2,
  Bold,
  Italic,
  Underline,
  Minus,
  ArrowRight,
  Sparkles,
  Type,
  PanelRightClose,
  ChevronsUpDown,
  ChevronsDownUp,
} from 'lucide-react'
import type { DiagramEdge } from '@/types'
import { SliderWithInput, IconButton, ColorPicker, FONT_FAMILIES, EDGE_SECTIONS } from './shared'

interface EdgePropertiesProps {
  selectedEdge: DiagramEdge
  updateEdge: (id: string, updates: Partial<DiagramEdge>) => void
  deleteSelected: () => void
  togglePropertiesPanel: () => void
}

export function EdgeProperties({ selectedEdge, updateEdge, deleteSelected, togglePropertiesPanel }: EdgePropertiesProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  // Auto-expand relevant sections when edge is selected
  useEffect(() => {
    if (selectedEdge) {
      const defaults = ['line-style', 'arrows']
      setExpandedSections((prev) => [...new Set([...prev, ...defaults])])
    }
  }, [selectedEdge.id])

  const strokeColor = (selectedEdge.style?.stroke as string) || '#6b7280'
  const strokeWidth = (selectedEdge.style?.strokeWidth as number) || 1.5
  const strokeOpacity = (selectedEdge.style?.opacity as number) ?? 1
  const edgeType = selectedEdge.type || 'straight'
  const strokeDasharray = (selectedEdge.style?.strokeDasharray as string) || ''
  const lineStyle = strokeDasharray.includes('2') ? 'dotted' : strokeDasharray.includes('8') ? 'dashed' : 'solid'

  const getMarkerType = (marker: unknown): 'none' | 'arrow' | 'arrowClosed' => {
    if (!marker) return 'none'
    if (typeof marker === 'object' && marker !== null && 'type' in marker) {
      const m = marker as { type: MarkerType }
      if (m.type === MarkerType.Arrow) return 'arrow'
      if (m.type === MarkerType.ArrowClosed) return 'arrowClosed'
    }
    return 'none'
  }

  const createMarker = (type: string, color: string, size: number = 12) => {
    if (type === 'none') return undefined
    return {
      type: type === 'arrow' ? MarkerType.Arrow : MarkerType.ArrowClosed,
      width: size,
      height: size,
      color,
    }
  }

  const markerStartType = getMarkerType(selectedEdge.markerStart)
  const markerEndType = getMarkerType(selectedEdge.markerEnd)
  const markerSize = (selectedEdge.markerEnd as { width?: number })?.width || 12

  return (
    <div className="w-72 border-l bg-background flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b bg-muted/30">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-sm">Connector</h2>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setExpandedSections(EDGE_SECTIONS)} title="Expand All">
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
        <p className="text-xs text-muted-foreground">Line / Edge</p>
      </div>

      <ScrollArea className="flex-1">
        <Accordion type="multiple" value={expandedSections} onValueChange={setExpandedSections} className="w-full">
          {/* LINE STYLE */}
          <AccordionItem value="line-style" className="border-b">
            <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
              <span className="flex items-center gap-2"><Minus className="w-4 h-4" />Line Style</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground mb-1 block">Type</Label>
                  <select value={edgeType} onChange={(e) => updateEdge(selectedEdge.id, { type: e.target.value })} className="w-full h-7 text-xs border rounded px-1.5 bg-background">
                    <option value="labeled">Auto</option>
                    <option value="straight">Straight</option>
                    <option value="smoothstep">Smooth</option>
                    <option value="step">Step</option>
                    <option value="bezier">Curved</option>
                  </select>
                </div>
                <div className="w-20">
                  <Label className="text-xs text-muted-foreground mb-1 block">Style</Label>
                  <select
                    value={lineStyle}
                    onChange={(e) => {
                      const dasharrays: Record<string, string | undefined> = { solid: undefined, dashed: '8 4', dotted: '2 4' }
                      updateEdge(selectedEdge.id, { style: { ...selectedEdge.style, strokeDasharray: dasharrays[e.target.value] } })
                    }}
                    className="w-full h-7 text-xs border rounded px-1.5 bg-background"
                  >
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Color</Label>
                <ColorPicker value={strokeColor} onChange={(color) => updateEdge(selectedEdge.id, { style: { ...selectedEdge.style, stroke: color } })} />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <SliderWithInput label="Width" value={strokeWidth} onChange={(value) => updateEdge(selectedEdge.id, { style: { ...selectedEdge.style, strokeWidth: value } })} min={0.5} max={8} step={0.5} unit="px" />
                </div>
                <div className="flex-1">
                  <SliderWithInput label="Opacity" value={Math.round(strokeOpacity * 100)} onChange={(value) => updateEdge(selectedEdge.id, { style: { ...selectedEdge.style, opacity: value / 100 } })} min={10} max={100} step={5} unit="%" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground mb-1 block">Line Cap</Label>
                  <select
                    value={(selectedEdge.data as { style?: { lineCap?: string } })?.style?.lineCap || 'round'}
                    onChange={(e) => updateEdge(selectedEdge.id, { data: { ...selectedEdge.data, style: { ...(selectedEdge.data as { style?: object })?.style, lineCap: e.target.value as 'butt' | 'round' | 'square' } } })}
                    className="w-full h-7 text-xs border rounded px-1.5 bg-background"
                  >
                    <option value="butt">Butt</option>
                    <option value="round">Round</option>
                    <option value="square">Square</option>
                  </select>
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground mb-1 block">Line Join</Label>
                  <select
                    value={(selectedEdge.data as { style?: { lineJoin?: string } })?.style?.lineJoin || 'round'}
                    onChange={(e) => updateEdge(selectedEdge.id, { data: { ...selectedEdge.data, style: { ...(selectedEdge.data as { style?: object })?.style, lineJoin: e.target.value as 'miter' | 'round' | 'bevel' } } })}
                    className="w-full h-7 text-xs border rounded px-1.5 bg-background"
                  >
                    <option value="miter">Miter</option>
                    <option value="round">Round</option>
                    <option value="bevel">Bevel</option>
                  </select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ARROWS */}
          <AccordionItem value="arrows" className="border-b">
            <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
              <span className="flex items-center gap-2"><ArrowRight className="w-4 h-4" />Arrows</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground mb-1 block">Direction</Label>
                  <select
                    value={markerEndType !== 'none' && markerStartType !== 'none' ? 'both' : markerStartType !== 'none' ? 'reverse' : markerEndType !== 'none' ? 'forward' : 'none'}
                    onChange={(e) => {
                      const arrowColor = (selectedEdge.markerEnd as { color?: string })?.color || strokeColor
                      switch (e.target.value) {
                        case 'forward': updateEdge(selectedEdge.id, { markerStart: undefined, markerEnd: createMarker('arrowClosed', arrowColor, markerSize) }); break
                        case 'both': updateEdge(selectedEdge.id, { markerStart: createMarker('arrowClosed', arrowColor, markerSize), markerEnd: createMarker('arrowClosed', arrowColor, markerSize) }); break
                        case 'reverse': updateEdge(selectedEdge.id, { markerStart: createMarker('arrowClosed', arrowColor, markerSize), markerEnd: undefined }); break
                        case 'none': updateEdge(selectedEdge.id, { markerStart: undefined, markerEnd: undefined }); break
                      }
                    }}
                    className="w-full h-7 text-xs border rounded px-1.5 bg-background"
                  >
                    <option value="forward">→</option>
                    <option value="both">↔</option>
                    <option value="reverse">←</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <div className="w-20">
                  <SliderWithInput
                    label="Size"
                    value={markerSize}
                    onChange={(value) => {
                      const arrowColor = (selectedEdge.markerEnd as { color?: string })?.color || strokeColor
                      updateEdge(selectedEdge.id, {
                        markerStart: markerStartType !== 'none' ? createMarker(markerStartType, arrowColor, value) : undefined,
                        markerEnd: markerEndType !== 'none' ? createMarker(markerEndType, arrowColor, value) : undefined,
                      })
                    }}
                    min={6} max={24} step={2} unit="px"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground mb-1 block">Start</Label>
                  <select value={markerStartType} onChange={(e) => { const c = (selectedEdge.markerEnd as { color?: string })?.color || strokeColor; updateEdge(selectedEdge.id, { markerStart: createMarker(e.target.value, c, markerSize) }) }} className="w-full h-7 text-xs border rounded px-1.5 bg-background">
                    <option value="none">None</option>
                    <option value="arrow">Open</option>
                    <option value="arrowClosed">Filled</option>
                  </select>
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground mb-1 block">End</Label>
                  <select value={markerEndType} onChange={(e) => { const c = (selectedEdge.markerEnd as { color?: string })?.color || strokeColor; updateEdge(selectedEdge.id, { markerEnd: createMarker(e.target.value, c, markerSize) }) }} className="w-full h-7 text-xs border rounded px-1.5 bg-background">
                    <option value="none">None</option>
                    <option value="arrow">Open</option>
                    <option value="arrowClosed">Filled</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Arrow Color</Label>
                <ColorPicker
                  value={(selectedEdge.markerEnd as { color?: string })?.color || strokeColor}
                  onChange={(color) => {
                    updateEdge(selectedEdge.id, {
                      markerStart: markerStartType !== 'none' ? createMarker(markerStartType, color, markerSize) : undefined,
                      markerEnd: markerEndType !== 'none' ? createMarker(markerEndType, color, markerSize) : undefined,
                    })
                  }}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* LABEL */}
          <AccordionItem value="line-label" className="border-b">
            <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
              <span className="flex items-center gap-2"><Type className="w-4 h-4" />Label</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3">
              <div className="space-y-2">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground mb-1 block">Text</Label>
                    <Input value={(selectedEdge.label as string) || ''} onChange={(e) => updateEdge(selectedEdge.id, { label: e.target.value })} placeholder="Label..." className="h-7 text-xs" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground mb-1 block">Placement</Label>
                    <select
                      value={(selectedEdge.data as { style?: { labelPlacement?: string } })?.style?.labelPlacement || 'middle'}
                      onChange={(e) => updateEdge(selectedEdge.id, { data: { ...selectedEdge.data, style: { ...(selectedEdge.data as { style?: object })?.style, labelPlacement: e.target.value as 'start' | 'middle' | 'end' } } })}
                      className="w-full h-7 text-xs border rounded px-1.5 bg-background"
                    >
                      <option value="start">Start</option>
                      <option value="middle">Middle</option>
                      <option value="end">End</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground mb-1 block">Vertical</Label>
                    <select value={(selectedEdge.data as { labelPosition?: string })?.labelPosition || 'on-line'} onChange={(e) => updateEdge(selectedEdge.id, { data: { ...selectedEdge.data, labelPosition: e.target.value as 'on-line' | 'outside' } })} className="w-full h-7 text-xs border rounded px-1.5 bg-background">
                      <option value="on-line">On Line</option>
                      <option value="outside">Above</option>
                    </select>
                  </div>
                </div>
              </div>
              {selectedEdge.label && (
                <>
                  <div className="flex items-center gap-2">
                    <select value={(selectedEdge.data as { style?: { labelFontFamily?: string } })?.style?.labelFontFamily || 'Inter'} onChange={(e) => updateEdge(selectedEdge.id, { data: { ...selectedEdge.data, style: { ...(selectedEdge.data as { style?: object })?.style, labelFontFamily: e.target.value } } })} className="h-7 text-xs border rounded px-1.5 bg-background flex-1 min-w-0">
                      {FONT_FAMILIES.map((font) => (<option key={font.value} value={font.value}>{font.label}</option>))}
                    </select>
                    <Input type="number" value={(selectedEdge.data as { style?: { labelFontSize?: number } })?.style?.labelFontSize || 12} onChange={(e) => updateEdge(selectedEdge.id, { data: { ...selectedEdge.data, style: { ...(selectedEdge.data as { style?: object })?.style, labelFontSize: parseInt(e.target.value) || 12 } } })} min={8} max={24} className="h-7 w-12 text-xs text-center" />
                    <input type="color" value={(selectedEdge.data as { style?: { labelColor?: string } })?.style?.labelColor || '#374151'} onChange={(e) => updateEdge(selectedEdge.id, { data: { ...selectedEdge.data, style: { ...(selectedEdge.data as { style?: object })?.style, labelColor: e.target.value } } })} className="w-7 h-7 rounded border cursor-pointer" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5 border rounded p-0.5">
                      <IconButton icon={Bold} label="Bold" size="xs" active={(selectedEdge.data as { style?: { labelFontWeight?: string } })?.style?.labelFontWeight === 'bold'} onClick={() => updateEdge(selectedEdge.id, { data: { ...selectedEdge.data, style: { ...(selectedEdge.data as { style?: object })?.style, labelFontWeight: (selectedEdge.data as { style?: { labelFontWeight?: string } })?.style?.labelFontWeight === 'bold' ? 'normal' : 'bold' } } })} />
                      <IconButton icon={Italic} label="Italic" size="xs" active={(selectedEdge.data as { style?: { labelFontStyle?: string } })?.style?.labelFontStyle === 'italic'} onClick={() => updateEdge(selectedEdge.id, { data: { ...selectedEdge.data, style: { ...(selectedEdge.data as { style?: object })?.style, labelFontStyle: (selectedEdge.data as { style?: { labelFontStyle?: string } })?.style?.labelFontStyle === 'italic' ? 'normal' : 'italic' } } })} />
                      <IconButton icon={Underline} label="Underline" size="xs" active={(selectedEdge.data as { style?: { labelTextDecoration?: string } })?.style?.labelTextDecoration === 'underline'} onClick={() => updateEdge(selectedEdge.id, { data: { ...selectedEdge.data, style: { ...(selectedEdge.data as { style?: object })?.style, labelTextDecoration: (selectedEdge.data as { style?: { labelTextDecoration?: string } })?.style?.labelTextDecoration === 'underline' ? 'none' : 'underline' } } })} />
                    </div>
                    <div className="flex items-center gap-1 ml-auto">
                      <input type="color" value={(selectedEdge.data as { style?: { labelBgColor?: string } })?.style?.labelBgColor || '#ffffff'} onChange={(e) => updateEdge(selectedEdge.id, { data: { ...selectedEdge.data, style: { ...(selectedEdge.data as { style?: object })?.style, labelBgColor: e.target.value } } })} className="w-7 h-7 rounded border cursor-pointer" title="Background color" />
                      <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => updateEdge(selectedEdge.id, { data: { ...selectedEdge.data, style: { ...(selectedEdge.data as { style?: object })?.style, labelBgColor: undefined } } })}>Clear</Button>
                    </div>
                  </div>
                </>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* ANIMATION */}
          <AccordionItem value="animation" className="border-b">
            <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
              <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" />Animation</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground flex-1">Flow Animation</Label>
                <Button variant={selectedEdge.animated ? 'default' : 'outline'} size="sm" className="h-7 text-xs" onClick={() => updateEdge(selectedEdge.id, { animated: !selectedEdge.animated })}>
                  {selectedEdge.animated ? 'Animated' : 'Static'}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollArea>

      <div className="p-3 border-t">
        <Button variant="destructive" size="sm" className="w-full h-8 text-xs" onClick={deleteSelected}>
          <Trash2 className="w-3 h-3 mr-1" />
          Delete Connector
        </Button>
      </div>
    </div>
  )
}
