import { useState, useCallback } from 'react'
import { MarkerType } from '@xyflow/react'
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

// Slider with inline number input component
interface SliderWithInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  unit?: string
}

function SliderWithInput({ label, value, onChange, min, max, step = 1, unit = '' }: SliderWithInputProps) {
  const [inputValue, setInputValue] = useState(String(value))

  const handleSliderChange = useCallback(([val]: number[]) => {
    setInputValue(String(val))
    onChange(val)
  }, [onChange])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)
    const num = parseFloat(val)
    if (!isNaN(num) && num >= min && num <= max) {
      onChange(num)
    }
  }, [onChange, min, max])

  const handleInputBlur = useCallback(() => {
    let num = parseFloat(inputValue)
    if (isNaN(num)) num = min
    num = Math.max(min, Math.min(max, num))
    setInputValue(String(num))
    onChange(num)
  }, [inputValue, min, max, onChange])

  // Sync input with value when it changes externally
  if (parseFloat(inputValue) !== value && document.activeElement?.tagName !== 'INPUT') {
    setInputValue(String(value))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">{label}</Label>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            min={min}
            max={max}
            step={step}
            className="h-6 w-14 text-xs text-center px-1"
          />
          {unit && <span className="text-xs text-muted-foreground w-4">{unit}</span>}
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={handleSliderChange}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  )
}
import {
  Trash2,
  Copy,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  ChevronUp,
  ChevronDown,
  Lock,
  Unlock,
  RotateCw,
  Palette,
  Type,
  Square,
  Minus,
  ArrowRight,
  Sparkles,
  Layers,
  Move,
} from 'lucide-react'

// Font options
const FONT_FAMILIES = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS' },
]

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

  // Default expanded sections for better UX
  const [expandedSections, setExpandedSections] = useState<string[]>(['fill', 'text'])

  const selectedNode = nodes.find((n) => selectedNodes.includes(n.id))
  const selectedEdge = edges.find((e) => selectedEdges.includes(e.id))

  // Multiple selection
  const multipleSelected = selectedNodes.length > 1

  // ==========================================
  // EDGE/CONNECTOR PROPERTIES
  // ==========================================
  if (selectedEdge && !selectedNode) {
    const strokeColor = (selectedEdge.style?.stroke as string) || '#6b7280'
    const strokeWidth = (selectedEdge.style?.strokeWidth as number) || 1.5
    const strokeOpacity = (selectedEdge.style?.opacity as number) ?? 1
    const edgeType = selectedEdge.type || 'straight'
    const strokeDasharray = (selectedEdge.style?.strokeDasharray as string) || ''
    const lineStyle = strokeDasharray.includes('2') ? 'dotted' : strokeDasharray.includes('8') ? 'dashed' : 'solid'

    // Helper functions for markers
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
        {/* Header */}
        <div className="p-4 border-b">
          <h2 className="font-semibold text-sm">Connector Properties</h2>
          <p className="text-xs text-muted-foreground">Line / Edge</p>
        </div>

        {/* Scrollable content */}
        <ScrollArea className="flex-1">
          <Accordion
            type="multiple"
            value={expandedSections}
            onValueChange={setExpandedSections}
            className="w-full"
          >
            {/* LINE STYLE */}
            <AccordionItem value="line-style" className="border-b">
              <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
                <span className="flex items-center gap-2">
                  <Minus className="w-4 h-4" />
                  Line Style
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                {/* Path Type */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Path Type</Label>
                  <select
                    value={edgeType}
                    onChange={(e) => updateEdge(selectedEdge.id, { type: e.target.value })}
                    className="w-full h-8 text-sm border rounded px-2 bg-background"
                  >
                    <option value="labeled">Auto (Smart)</option>
                    <option value="straight">Straight</option>
                    <option value="smoothstep">Smooth Step</option>
                    <option value="step">Step</option>
                    <option value="bezier">Curved</option>
                  </select>
                </div>

                {/* Line Style */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Line Style</Label>
                  <select
                    value={lineStyle}
                    onChange={(e) => {
                      const dasharrays: Record<string, string | undefined> = {
                        solid: undefined,
                        dashed: '8 4',
                        dotted: '2 4',
                      }
                      updateEdge(selectedEdge.id, {
                        style: { ...selectedEdge.style, strokeDasharray: dasharrays[e.target.value] },
                      })
                    }}
                    className="w-full h-8 text-sm border rounded px-2 bg-background"
                  >
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                  </select>
                </div>

                {/* Stroke Color - only changes line, not arrow */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Line Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={strokeColor}
                      onChange={(e) => {
                        updateEdge(selectedEdge.id, {
                          style: { ...selectedEdge.style, stroke: e.target.value },
                        })
                      }}
                      className="w-10 h-8 rounded border cursor-pointer"
                    />
                    <Input
                      value={strokeColor}
                      onChange={(e) => {
                        updateEdge(selectedEdge.id, {
                          style: { ...selectedEdge.style, stroke: e.target.value },
                        })
                      }}
                      className="h-8 text-xs font-mono flex-1"
                    />
                  </div>
                  {/* Quick color presets */}
                  <div className="flex gap-1">
                    {['#6b7280', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#000000'].map(
                      (color) => (
                        <button
                          key={color}
                          className="w-5 h-5 rounded border hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          onClick={() => {
                            updateEdge(selectedEdge.id, {
                              style: { ...selectedEdge.style, stroke: color },
                            })
                          }}
                        />
                      )
                    )}
                  </div>
                </div>

                {/* Stroke Width */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Width: {strokeWidth}px</Label>
                  <Slider
                    value={[strokeWidth]}
                    onValueChange={([value]) =>
                      updateEdge(selectedEdge.id, {
                        style: { ...selectedEdge.style, strokeWidth: value },
                      })
                    }
                    min={0.5}
                    max={8}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                {/* Opacity */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Opacity: {Math.round(strokeOpacity * 100)}%</Label>
                  <Slider
                    value={[strokeOpacity * 100]}
                    onValueChange={([value]) =>
                      updateEdge(selectedEdge.id, {
                        style: { ...selectedEdge.style, opacity: value / 100 },
                      })
                    }
                    min={10}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* ARROWS */}
            <AccordionItem value="arrows" className="border-b">
              <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
                <span className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Arrows
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                {/* Quick Presets */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Arrow Direction</Label>
                  <select
                    value={
                      markerEndType !== 'none' && markerStartType !== 'none'
                        ? 'both'
                        : markerStartType !== 'none'
                        ? 'reverse'
                        : markerEndType !== 'none'
                        ? 'forward'
                        : 'none'
                    }
                    onChange={(e) => {
                      const arrowColor = (selectedEdge.markerEnd as { color?: string })?.color || strokeColor
                      switch (e.target.value) {
                        case 'forward':
                          updateEdge(selectedEdge.id, {
                            markerStart: undefined,
                            markerEnd: createMarker('arrowClosed', arrowColor, markerSize),
                          })
                          break
                        case 'both':
                          updateEdge(selectedEdge.id, {
                            markerStart: createMarker('arrowClosed', arrowColor, markerSize),
                            markerEnd: createMarker('arrowClosed', arrowColor, markerSize),
                          })
                          break
                        case 'reverse':
                          updateEdge(selectedEdge.id, {
                            markerStart: createMarker('arrowClosed', arrowColor, markerSize),
                            markerEnd: undefined,
                          })
                          break
                        case 'none':
                          updateEdge(selectedEdge.id, {
                            markerStart: undefined,
                            markerEnd: undefined,
                          })
                          break
                      }
                    }}
                    className="w-full h-8 text-sm border rounded px-2 bg-background"
                  >
                    <option value="forward">Forward (→)</option>
                    <option value="both">Both (↔)</option>
                    <option value="reverse">Reverse (←)</option>
                    <option value="none">None</option>
                  </select>
                </div>

                {/* Start Arrow */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Start Arrow</Label>
                  <select
                    value={markerStartType}
                    onChange={(e) => {
                      const arrowColor = (selectedEdge.markerEnd as { color?: string })?.color || strokeColor
                      updateEdge(selectedEdge.id, {
                        markerStart: createMarker(e.target.value, arrowColor, markerSize),
                      })
                    }}
                    className="w-full h-8 text-sm border rounded px-2 bg-background"
                  >
                    <option value="none">None</option>
                    <option value="arrow">Arrow (Open)</option>
                    <option value="arrowClosed">Arrow (Filled)</option>
                  </select>
                </div>

                {/* End Arrow */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">End Arrow</Label>
                  <select
                    value={markerEndType}
                    onChange={(e) => {
                      const arrowColor = (selectedEdge.markerEnd as { color?: string })?.color || strokeColor
                      updateEdge(selectedEdge.id, {
                        markerEnd: createMarker(e.target.value, arrowColor, markerSize),
                      })
                    }}
                    className="w-full h-8 text-sm border rounded px-2 bg-background"
                  >
                    <option value="none">None</option>
                    <option value="arrow">Arrow (Open)</option>
                    <option value="arrowClosed">Arrow (Filled)</option>
                  </select>
                </div>

                {/* Arrow Color (separate from line color) */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Arrow Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={(selectedEdge.markerEnd as { color?: string })?.color || strokeColor}
                      onChange={(e) => {
                        const arrowColor = e.target.value
                        updateEdge(selectedEdge.id, {
                          markerStart:
                            markerStartType !== 'none'
                              ? createMarker(markerStartType, arrowColor, markerSize)
                              : undefined,
                          markerEnd:
                            markerEndType !== 'none'
                              ? createMarker(markerEndType, arrowColor, markerSize)
                              : undefined,
                        })
                      }}
                      className="w-10 h-8 rounded border cursor-pointer"
                    />
                    <Input
                      value={(selectedEdge.markerEnd as { color?: string })?.color || strokeColor}
                      onChange={(e) => {
                        const arrowColor = e.target.value
                        updateEdge(selectedEdge.id, {
                          markerStart:
                            markerStartType !== 'none'
                              ? createMarker(markerStartType, arrowColor, markerSize)
                              : undefined,
                          markerEnd:
                            markerEndType !== 'none'
                              ? createMarker(markerEndType, arrowColor, markerSize)
                              : undefined,
                        })
                      }}
                      className="h-8 text-xs font-mono flex-1"
                    />
                  </div>
                  {/* Quick color presets */}
                  <div className="flex gap-1">
                    {['#6b7280', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#000000'].map(
                      (color) => (
                        <button
                          key={color}
                          className="w-5 h-5 rounded border hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          onClick={() => {
                            updateEdge(selectedEdge.id, {
                              markerStart:
                                markerStartType !== 'none'
                                  ? createMarker(markerStartType, color, markerSize)
                                  : undefined,
                              markerEnd:
                                markerEndType !== 'none'
                                  ? createMarker(markerEndType, color, markerSize)
                                  : undefined,
                            })
                          }}
                        />
                      )
                    )}
                  </div>
                </div>

                {/* Arrow Size */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Arrow Size: {markerSize}px</Label>
                  <Slider
                    value={[markerSize]}
                    onValueChange={([value]) => {
                      const arrowColor = (selectedEdge.markerEnd as { color?: string })?.color || strokeColor
                      updateEdge(selectedEdge.id, {
                        markerStart:
                          markerStartType !== 'none'
                            ? createMarker(markerStartType, arrowColor, value)
                            : undefined,
                        markerEnd:
                          markerEndType !== 'none'
                            ? createMarker(markerEndType, arrowColor, value)
                            : undefined,
                      })
                    }}
                    min={6}
                    max={24}
                    step={2}
                    className="w-full"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* LABEL */}
            <AccordionItem value="line-label" className="border-b">
              <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
                <span className="flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Label
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                {/* Label Text */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Text</Label>
                  <Input
                    value={(selectedEdge.label as string) || ''}
                    onChange={(e) => updateEdge(selectedEdge.id, { label: e.target.value })}
                    placeholder="Enter label..."
                    className="h-8 text-sm"
                  />
                </div>

                {selectedEdge.label && (
                  <>
                    {/* Font Family */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Font Family</Label>
                      <select
                        value={(selectedEdge.data as { style?: { labelFontFamily?: string } })?.style?.labelFontFamily || 'Inter'}
                        onChange={(e) =>
                          updateEdge(selectedEdge.id, {
                            data: {
                              ...selectedEdge.data,
                              style: {
                                ...(selectedEdge.data as { style?: object })?.style,
                                labelFontFamily: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full h-8 text-sm border rounded px-2 bg-background"
                      >
                        {FONT_FAMILIES.map((font) => (
                          <option key={font.value} value={font.value}>
                            {font.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Font Size */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Font Size</Label>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[(selectedEdge.data as { style?: { labelFontSize?: number } })?.style?.labelFontSize || 12]}
                          onValueChange={([value]) =>
                            updateEdge(selectedEdge.id, {
                              data: {
                                ...selectedEdge.data,
                                style: {
                                  ...(selectedEdge.data as { style?: object })?.style,
                                  labelFontSize: value,
                                },
                              },
                            })
                          }
                          min={8}
                          max={24}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-xs text-muted-foreground w-8">
                          {(selectedEdge.data as { style?: { labelFontSize?: number } })?.style?.labelFontSize || 12}px
                        </span>
                      </div>
                    </div>

                    {/* Text Color */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Text Color</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={(selectedEdge.data as { style?: { labelColor?: string } })?.style?.labelColor || '#374151'}
                          onChange={(e) =>
                            updateEdge(selectedEdge.id, {
                              data: {
                                ...selectedEdge.data,
                                style: {
                                  ...(selectedEdge.data as { style?: object })?.style,
                                  labelColor: e.target.value,
                                },
                              },
                            })
                          }
                          className="w-10 h-8 rounded border cursor-pointer"
                        />
                        <Input
                          value={(selectedEdge.data as { style?: { labelColor?: string } })?.style?.labelColor || '#374151'}
                          onChange={(e) =>
                            updateEdge(selectedEdge.id, {
                              data: {
                                ...selectedEdge.data,
                                style: {
                                  ...(selectedEdge.data as { style?: object })?.style,
                                  labelColor: e.target.value,
                                },
                              },
                            })
                          }
                          className="h-8 text-xs font-mono flex-1"
                        />
                      </div>
                    </div>

                    {/* Font Style Buttons */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Style</Label>
                      <div className="flex gap-1">
                        <Button
                          variant={
                            (selectedEdge.data as { style?: { labelFontWeight?: string } })?.style?.labelFontWeight === 'bold'
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            updateEdge(selectedEdge.id, {
                              data: {
                                ...selectedEdge.data,
                                style: {
                                  ...(selectedEdge.data as { style?: object })?.style,
                                  labelFontWeight:
                                    (selectedEdge.data as { style?: { labelFontWeight?: string } })?.style?.labelFontWeight === 'bold'
                                      ? 'normal'
                                      : 'bold',
                                },
                              },
                            })
                          }
                        >
                          <Bold className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={
                            (selectedEdge.data as { style?: { labelFontStyle?: string } })?.style?.labelFontStyle === 'italic'
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            updateEdge(selectedEdge.id, {
                              data: {
                                ...selectedEdge.data,
                                style: {
                                  ...(selectedEdge.data as { style?: object })?.style,
                                  labelFontStyle:
                                    (selectedEdge.data as { style?: { labelFontStyle?: string } })?.style?.labelFontStyle === 'italic'
                                      ? 'normal'
                                      : 'italic',
                                },
                              },
                            })
                          }
                        >
                          <Italic className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={
                            (selectedEdge.data as { style?: { labelTextDecoration?: string } })?.style?.labelTextDecoration === 'underline'
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            updateEdge(selectedEdge.id, {
                              data: {
                                ...selectedEdge.data,
                                style: {
                                  ...(selectedEdge.data as { style?: object })?.style,
                                  labelTextDecoration:
                                    (selectedEdge.data as { style?: { labelTextDecoration?: string } })?.style?.labelTextDecoration === 'underline'
                                      ? 'none'
                                      : 'underline',
                                },
                              },
                            })
                          }
                        >
                          <Underline className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Background Color */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Background</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={(selectedEdge.data as { style?: { labelBgColor?: string } })?.style?.labelBgColor || '#ffffff'}
                          onChange={(e) =>
                            updateEdge(selectedEdge.id, {
                              data: {
                                ...selectedEdge.data,
                                style: {
                                  ...(selectedEdge.data as { style?: object })?.style,
                                  labelBgColor: e.target.value,
                                },
                              },
                            })
                          }
                          className="w-10 h-8 rounded border cursor-pointer"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs flex-1"
                          onClick={() =>
                            updateEdge(selectedEdge.id, {
                              data: {
                                ...selectedEdge.data,
                                style: {
                                  ...(selectedEdge.data as { style?: object })?.style,
                                  labelBgColor: undefined,
                                },
                              },
                            })
                          }
                        >
                          No Background
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* ANIMATION */}
            <AccordionItem value="animation" className="border-b">
              <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Animation
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Flow Animation</Label>
                  <select
                    value={selectedEdge.animated ? 'animated' : 'static'}
                    onChange={(e) => updateEdge(selectedEdge.id, { animated: e.target.value === 'animated' })}
                    className="w-full h-8 text-sm border rounded px-2 bg-background"
                  >
                    <option value="static">Static (No animation)</option>
                    <option value="animated">Animated (Flow dots)</option>
                  </select>
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

  // ==========================================
  // NOTHING SELECTED
  // ==========================================
  if (!selectedNode) {
    return (
      <div className="w-72 border-l bg-background flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-sm">Properties</h2>
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

  // ==========================================
  // SHAPE PROPERTIES
  // ==========================================
  const data = selectedNode.data
  const style = data.style || {}

  const handleDuplicate = () => {
    copyNodes()
    pasteNodes()
  }

  return (
    <div className="w-72 border-l bg-background flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="font-semibold text-sm">Shape Properties</h2>
        <p className="text-xs text-muted-foreground truncate">
          {multipleSelected ? `${selectedNodes.length} shapes selected` : data.label || data.type}
        </p>
      </div>

      {/* Scrollable content */}
      <ScrollArea className="flex-1">
        <Accordion
          type="multiple"
          value={expandedSections}
          onValueChange={setExpandedSections}
          className="w-full"
        >
          {/* FILL SECTION */}
          <AccordionItem value="fill" className="border-b">
            <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
              <span className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Fill
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              {/* Background Color */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Background Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={style.backgroundColor || '#ffffff'}
                    onChange={(e) => updateNodeStyle(selectedNode.id, { backgroundColor: e.target.value })}
                    className="w-10 h-8 rounded border cursor-pointer"
                  />
                  <Input
                    value={style.backgroundColor || '#ffffff'}
                    onChange={(e) => updateNodeStyle(selectedNode.id, { backgroundColor: e.target.value })}
                    className="h-8 text-xs font-mono flex-1"
                  />
                </div>
                {/* Color presets */}
                <div className="flex gap-1 flex-wrap">
                  {[
                    '#ffffff',
                    '#f3f4f6',
                    '#fef2f2',
                    '#fef9c3',
                    '#dcfce7',
                    '#dbeafe',
                    '#f3e8ff',
                    '#fce7f3',
                    '#1f2937',
                    '#000000',
                  ].map((color) => (
                    <button
                      key={color}
                      className="w-5 h-5 rounded border hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => updateNodeStyle(selectedNode.id, { backgroundColor: color })}
                    />
                  ))}
                </div>
              </div>

              {/* Background Opacity */}
              <SliderWithInput
                label="Opacity"
                value={Math.round((style.backgroundOpacity ?? 1) * 100)}
                onChange={(val) => updateNodeStyle(selectedNode.id, { backgroundOpacity: val / 100 })}
                min={0}
                max={100}
                step={5}
                unit="%"
              />
            </AccordionContent>
          </AccordionItem>

          {/* BORDER SECTION */}
          <AccordionItem value="border" className="border-b">
            <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
              <span className="flex items-center gap-2">
                <Square className="w-4 h-4" />
                Border
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              {/* Border Color */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Border Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={style.borderColor || '#9ca3af'}
                    onChange={(e) => updateNodeStyle(selectedNode.id, { borderColor: e.target.value })}
                    className="w-10 h-8 rounded border cursor-pointer"
                  />
                  <Input
                    value={style.borderColor || '#9ca3af'}
                    onChange={(e) => updateNodeStyle(selectedNode.id, { borderColor: e.target.value })}
                    className="h-8 text-xs font-mono flex-1"
                  />
                </div>
                {/* Color presets */}
                <div className="flex gap-1">
                  {['#9ca3af', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#000000'].map(
                    (color) => (
                      <button
                        key={color}
                        className="w-5 h-5 rounded border hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => updateNodeStyle(selectedNode.id, { borderColor: color })}
                      />
                    )
                  )}
                </div>
              </div>

              {/* Border Width */}
              <SliderWithInput
                label="Border Width"
                value={style.borderWidth || 1}
                onChange={(val) => updateNodeStyle(selectedNode.id, { borderWidth: val })}
                min={0}
                max={8}
                step={1}
                unit="px"
              />

              {/* Border Style */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Border Style</Label>
                <select
                  value={style.borderStyle || 'solid'}
                  onChange={(e) =>
                    updateNodeStyle(selectedNode.id, {
                      borderStyle: e.target.value as 'solid' | 'dashed' | 'dotted' | 'none',
                      ...(e.target.value === 'none' ? { borderWidth: 0 } : {}),
                    })
                  }
                  className="w-full h-8 text-sm border rounded px-2 bg-background"
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                  <option value="none">None</option>
                </select>
              </div>

              {/* Border Radius */}
              <SliderWithInput
                label="Corner Radius"
                value={style.borderRadius || 8}
                onChange={(val) => updateNodeStyle(selectedNode.id, { borderRadius: val })}
                min={0}
                max={50}
                step={1}
                unit="px"
              />
            </AccordionContent>
          </AccordionItem>

          {/* SHADOW SECTION */}
          <AccordionItem value="shadow" className="border-b">
            <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Shadow
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              {/* Shadow Toggle */}
              <Button
                variant={style.shadowEnabled ? 'default' : 'outline'}
                size="sm"
                className="w-full h-8 text-xs"
                onClick={() => updateNodeStyle(selectedNode.id, { shadowEnabled: !style.shadowEnabled })}
              >
                {style.shadowEnabled ? 'Shadow Enabled' : 'Enable Shadow'}
              </Button>

              {style.shadowEnabled && (
                <>
                  {/* Shadow Color */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Shadow Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={style.shadowColor || '#000000'}
                        onChange={(e) => updateNodeStyle(selectedNode.id, { shadowColor: e.target.value })}
                        className="w-10 h-8 rounded border cursor-pointer"
                      />
                      <Input
                        value={style.shadowColor || '#000000'}
                        className="h-8 text-xs font-mono flex-1"
                        onChange={(e) => updateNodeStyle(selectedNode.id, { shadowColor: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Shadow Blur */}
                  <SliderWithInput
                    label="Blur"
                    value={style.shadowBlur || 10}
                    onChange={(val) => updateNodeStyle(selectedNode.id, { shadowBlur: val })}
                    min={0}
                    max={50}
                    step={1}
                    unit="px"
                  />

                  {/* Shadow Offset */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Offset X</Label>
                      <Input
                        type="number"
                        value={style.shadowOffsetX || 4}
                        onChange={(e) =>
                          updateNodeStyle(selectedNode.id, { shadowOffsetX: parseInt(e.target.value) })
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Offset Y</Label>
                      <Input
                        type="number"
                        value={style.shadowOffsetY || 4}
                        onChange={(e) =>
                          updateNodeStyle(selectedNode.id, { shadowOffsetY: parseInt(e.target.value) })
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* TEXT SECTION */}
          <AccordionItem value="text" className="border-b">
            <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
              <span className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                Text
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              {/* Label */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Label</Label>
                <Input
                  value={data.label}
                  onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>

              {/* Font Family */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Font Family</Label>
                <select
                  value={style.fontFamily || 'Inter'}
                  onChange={(e) => updateNodeStyle(selectedNode.id, { fontFamily: e.target.value })}
                  className="w-full h-8 text-sm border rounded px-2 bg-background"
                >
                  {FONT_FAMILIES.map((font) => (
                    <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Size */}
              <SliderWithInput
                label="Font Size"
                value={style.fontSize || 14}
                onChange={(val) => updateNodeStyle(selectedNode.id, { fontSize: val })}
                min={8}
                max={48}
                step={1}
                unit="px"
              />

              {/* Text Color */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Text Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={style.textColor || '#1f2937'}
                    onChange={(e) => updateNodeStyle(selectedNode.id, { textColor: e.target.value })}
                    className="w-10 h-8 rounded border cursor-pointer"
                  />
                  <Input
                    value={style.textColor || '#1f2937'}
                    onChange={(e) => updateNodeStyle(selectedNode.id, { textColor: e.target.value })}
                    className="h-8 text-xs font-mono flex-1"
                  />
                </div>
              </div>

              {/* Font Style Buttons */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Style</Label>
                <div className="flex gap-1">
                  <Button
                    variant={(style.fontWeight || 'normal') === 'bold' ? 'default' : 'outline'}
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
                    variant={(style.fontStyle || 'normal') === 'italic' ? 'default' : 'outline'}
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
                    variant={(style.textDecoration || 'none') === 'underline' ? 'default' : 'outline'}
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
                  <Button
                    variant={(style.textDecoration || 'none') === 'line-through' ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() =>
                      updateNodeStyle(selectedNode.id, {
                        textDecoration: style.textDecoration === 'line-through' ? 'none' : 'line-through',
                      })
                    }
                  >
                    <Strikethrough className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Text Wrap */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Text Wrap</Label>
                <select
                  value={style.textWrap || 'wrap'}
                  onChange={(e) =>
                    updateNodeStyle(selectedNode.id, {
                      textWrap: e.target.value as 'wrap' | 'nowrap' | 'truncate',
                    })
                  }
                  className="w-full h-8 text-sm border rounded px-2 bg-background"
                >
                  <option value="wrap">Wrap</option>
                  <option value="nowrap">No Wrap</option>
                  <option value="truncate">Truncate</option>
                </select>
              </div>

              {/* Text Alignment */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Horizontal Align</Label>
                <div className="flex gap-1">
                  <Button
                    variant={(style.textAlign || 'center') === 'left' ? 'default' : 'outline'}
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
                    variant={(style.textAlign || 'center') === 'right' ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => updateNodeStyle(selectedNode.id, { textAlign: 'right' })}
                  >
                    <AlignRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Vertical Alignment */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Vertical Align</Label>
                <div className="flex gap-1">
                  <Button
                    variant={(style.verticalAlign || 'middle') === 'top' ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => updateNodeStyle(selectedNode.id, { verticalAlign: 'top' })}
                  >
                    <AlignVerticalJustifyStart className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={(style.verticalAlign || 'middle') === 'middle' ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => updateNodeStyle(selectedNode.id, { verticalAlign: 'middle' })}
                  >
                    <AlignVerticalJustifyCenter className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={(style.verticalAlign || 'middle') === 'bottom' ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => updateNodeStyle(selectedNode.id, { verticalAlign: 'bottom' })}
                  >
                    <AlignVerticalJustifyEnd className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* SIZE & POSITION */}
          <AccordionItem value="size" className="border-b">
            <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
              <span className="flex items-center gap-2">
                <Move className="w-4 h-4" />
                Size & Position
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              {/* Position */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">X</Label>
                  <Input
                    type="number"
                    value={Math.round(selectedNode.position.x)}
                    onChange={(e) => {
                      const x = parseInt(e.target.value) || 0
                      const currentNodes = useEditorStore.getState().nodes
                      useEditorStore.setState({
                        nodes: currentNodes.map((n) =>
                          n.id === selectedNode.id ? { ...n, position: { ...n.position, x } } : n
                        ),
                        isDirty: true,
                      })
                    }}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Y</Label>
                  <Input
                    type="number"
                    value={Math.round(selectedNode.position.y)}
                    onChange={(e) => {
                      const y = parseInt(e.target.value) || 0
                      const currentNodes = useEditorStore.getState().nodes
                      useEditorStore.setState({
                        nodes: currentNodes.map((n) =>
                          n.id === selectedNode.id ? { ...n, position: { ...n.position, y } } : n
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
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Width</Label>
                  <Input
                    type="number"
                    value={(selectedNode.style?.width as number) || 120}
                    onChange={(e) => {
                      const width = parseInt(e.target.value) || 120
                      const currentNodes = useEditorStore.getState().nodes
                      useEditorStore.setState({
                        nodes: currentNodes.map((n) =>
                          n.id === selectedNode.id ? { ...n, style: { ...n.style, width } } : n
                        ),
                        isDirty: true,
                      })
                    }}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Height</Label>
                  <Input
                    type="number"
                    value={(selectedNode.style?.height as number) || 60}
                    onChange={(e) => {
                      const height = parseInt(e.target.value) || 60
                      const currentNodes = useEditorStore.getState().nodes
                      useEditorStore.setState({
                        nodes: currentNodes.map((n) =>
                          n.id === selectedNode.id ? { ...n, style: { ...n.style, height } } : n
                        ),
                        isDirty: true,
                      })
                    }}
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              {/* Rotation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Rotation</Label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={style.rotation || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0
                        const clamped = Math.max(0, Math.min(360, val))
                        updateNodeStyle(selectedNode.id, { rotation: clamped })
                      }}
                      min={0}
                      max={360}
                      className="h-6 w-14 text-xs text-center px-1"
                    />
                    <span className="text-xs text-muted-foreground w-3">°</span>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Slider
                    value={[style.rotation || 0]}
                    onValueChange={([value]) => updateNodeStyle(selectedNode.id, { rotation: value })}
                    min={0}
                    max={360}
                    step={15}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => updateNodeStyle(selectedNode.id, { rotation: 0 })}
                  >
                    <RotateCw className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Overall Opacity */}
              <SliderWithInput
                label="Shape Opacity"
                value={Math.round((style.opacity ?? 1) * 100)}
                onChange={(value) => updateNodeStyle(selectedNode.id, { opacity: value / 100 })}
                min={10}
                max={100}
                step={5}
                unit="%"
              />
            </AccordionContent>
          </AccordionItem>

          {/* ARRANGE */}
          <AccordionItem value="arrange" className="border-b">
            <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Arrange
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              {/* Z-Order */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Layer Order</Label>
                <div className="grid grid-cols-2 gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      const currentNodes = useEditorStore.getState().nodes
                      const idx = currentNodes.findIndex((n) => n.id === selectedNode.id)
                      if (idx < currentNodes.length - 1) {
                        const newNodes = [...currentNodes]
                        const node = newNodes.splice(idx, 1)[0]
                        newNodes.push(node) // Move to end (front)
                        useEditorStore.setState({ nodes: newNodes, isDirty: true })
                      }
                    }}
                  >
                    <ChevronUp className="w-3 h-3 mr-1" />
                    To Front
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      const currentNodes = useEditorStore.getState().nodes
                      const idx = currentNodes.findIndex((n) => n.id === selectedNode.id)
                      if (idx > 0) {
                        const newNodes = [...currentNodes]
                        const node = newNodes.splice(idx, 1)[0]
                        newNodes.unshift(node) // Move to beginning (back)
                        useEditorStore.setState({ nodes: newNodes, isDirty: true })
                      }
                    }}
                  >
                    <ChevronDown className="w-3 h-3 mr-1" />
                    To Back
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      const currentNodes = useEditorStore.getState().nodes
                      const idx = currentNodes.findIndex((n) => n.id === selectedNode.id)
                      if (idx < currentNodes.length - 1) {
                        const newNodes = [...currentNodes]
                        ;[newNodes[idx], newNodes[idx + 1]] = [newNodes[idx + 1], newNodes[idx]]
                        useEditorStore.setState({ nodes: newNodes, isDirty: true })
                      }
                    }}
                  >
                    Forward
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      const currentNodes = useEditorStore.getState().nodes
                      const idx = currentNodes.findIndex((n) => n.id === selectedNode.id)
                      if (idx > 0) {
                        const newNodes = [...currentNodes]
                        ;[newNodes[idx], newNodes[idx - 1]] = [newNodes[idx - 1], newNodes[idx]]
                        useEditorStore.setState({ nodes: newNodes, isDirty: true })
                      }
                    }}
                  >
                    Backward
                  </Button>
                </div>
              </div>

              {/* Lock */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Lock Shape</Label>
                <Button
                  variant={data.locked ? 'default' : 'outline'}
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
