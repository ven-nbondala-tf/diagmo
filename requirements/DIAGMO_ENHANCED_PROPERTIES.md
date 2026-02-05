# DIAGMO - Fix Resize, Connector Size & Enhanced Properties

## Issues to Fix

1. **Resize only works from one end** - Need proper 8-handle resize from all corners
2. **Connector arrow size too large** - Arrow markers are 20x20, too big
3. **Limited shape properties** - Need more styling options like draw.io/Lucidchart

---

## FIX 1: Proper 8-Handle Resize

The issue is that NodeResizer needs `keepAspectRatio` disabled and proper handle configuration.

### Update CustomNode.tsx - NodeResizer section:

```tsx
{/* Replace the existing NodeResizer with this */}
<NodeResizer
  isVisible={selected && !locked}
  minWidth={minWidth}
  minHeight={minHeight}
  // Enable all 8 handles (4 corners + 4 edges)
  handleClassName="nodrag"
  handleStyle={{
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: 'white',
    border: '1px solid #3b82f6',
  }}
  lineStyle={{
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderStyle: 'dashed',
  }}
  // Don't keep aspect ratio - allow free resize
  keepAspectRatio={false}
/>
```

---

## FIX 2: Smaller Default Connector/Arrow Size

### Update DiagramEditor.tsx:

```tsx
const defaultEdgeOptions = {
  type: 'straight',
  animated: false,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 12,  // Reduced from 20
    height: 12, // Reduced from 20
    color: '#6b7280',
  },
  style: {
    strokeWidth: 1.5,  // Reduced from 2
    stroke: '#6b7280',
  },
}
```

### Update editorStore.ts - onConnect function:

```tsx
onConnect: (connection) => {
  get().pushHistory()
  const newEdge: DiagramEdge = {
    id: nanoid(),
    source: connection.source!,
    target: connection.target!,
    sourceHandle: connection.sourceHandle,
    targetHandle: connection.targetHandle,
    type: 'straight',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 12,  // Smaller arrows
      height: 12,
      color: '#6b7280',
    },
    style: {
      strokeWidth: 1.5,
      stroke: '#6b7280',
    },
  }
  set({
    edges: addEdge(newEdge, get().edges) as DiagramEdge[],
    isDirty: true,
  })
},
```

---

## FIX 3: Enhanced Properties Panel

Replace your PropertiesPanel.tsx with this comprehensive version that has many more options:

### Updated types/index.ts - Enhanced NodeStyle:

```typescript
export interface NodeStyle {
  // Fill
  backgroundColor?: string
  backgroundOpacity?: number
  gradientEnabled?: boolean
  gradientColor?: string
  gradientDirection?: 'horizontal' | 'vertical' | 'diagonal'
  
  // Border/Stroke
  borderColor?: string
  borderWidth?: number
  borderRadius?: number
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none'
  borderOpacity?: number
  
  // Shadow
  shadowEnabled?: boolean
  shadowColor?: string
  shadowBlur?: number
  shadowOffsetX?: number
  shadowOffsetY?: number
  
  // Text
  textColor?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: 'normal' | 'bold' | 'light'
  fontStyle?: 'normal' | 'italic'
  textDecoration?: 'none' | 'underline' | 'line-through'
  textAlign?: 'left' | 'center' | 'right'
  verticalAlign?: 'top' | 'middle' | 'bottom'
  lineHeight?: number
  letterSpacing?: number
  
  // Effects
  opacity?: number
  rotation?: number
}

export interface EdgeStyle {
  // Line
  strokeColor?: string
  strokeWidth?: number
  strokeOpacity?: number
  strokeDasharray?: string
  lineType?: 'solid' | 'dashed' | 'dotted'
  
  // Markers
  markerStart?: 'none' | 'arrow' | 'arrowClosed' | 'circle' | 'diamond'
  markerEnd?: 'none' | 'arrow' | 'arrowClosed' | 'circle' | 'diamond'
  markerSize?: number
  
  // Animation
  animated?: boolean
  animationSpeed?: 'slow' | 'normal' | 'fast'
  
  // Label
  labelColor?: string
  labelBgColor?: string
  labelFontSize?: number
}
```

### Complete PropertiesPanel.tsx:

```tsx
import { useState, useMemo } from 'react'
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
  Separator,
} from '@/components/ui'
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
  Circle,
  ArrowRight,
  ArrowLeftRight,
  Diamond,
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
    const getMarkerType = (marker: unknown): 'none' | 'arrow' | 'arrowClosed' | 'circle' | 'diamond' => {
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
    const markerSize = (selectedEdge.markerEnd as any)?.width || 12

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
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { value: 'straight', label: 'Straight' },
                      { value: 'smoothstep', label: 'Smooth' },
                      { value: 'step', label: 'Step' },
                      { value: 'bezier', label: 'Curved' },
                    ].map((type) => (
                      <Button
                        key={type.value}
                        variant={edgeType === type.value ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => updateEdge(selectedEdge.id, { type: type.value })}
                      >
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Line Style */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Line Style</Label>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { value: 'solid', label: '━━━', dasharray: undefined },
                      { value: 'dashed', label: '┄┄┄', dasharray: '8 4' },
                      { value: 'dotted', label: '┈┈┈', dasharray: '2 4' },
                    ].map((style) => (
                      <Button
                        key={style.value}
                        variant={lineStyle === style.value ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 text-xs font-mono"
                        onClick={() => updateEdge(selectedEdge.id, {
                          style: { ...selectedEdge.style, strokeDasharray: style.dasharray }
                        })}
                      >
                        {style.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Stroke Color */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={strokeColor}
                      onChange={(e) => {
                        const color = e.target.value
                        updateEdge(selectedEdge.id, {
                          style: { ...selectedEdge.style, stroke: color },
                          markerStart: markerStartType !== 'none' ? createMarker(markerStartType, color, markerSize) : undefined,
                          markerEnd: markerEndType !== 'none' ? createMarker(markerEndType, color, markerSize) : undefined,
                        })
                      }}
                      className="w-10 h-8 rounded border cursor-pointer"
                    />
                    <Input
                      value={strokeColor}
                      onChange={(e) => {
                        const color = e.target.value
                        updateEdge(selectedEdge.id, {
                          style: { ...selectedEdge.style, stroke: color },
                          markerStart: markerStartType !== 'none' ? createMarker(markerStartType, color, markerSize) : undefined,
                          markerEnd: markerEndType !== 'none' ? createMarker(markerEndType, color, markerSize) : undefined,
                        })
                      }}
                      className="h-8 text-xs font-mono flex-1"
                    />
                  </div>
                  {/* Quick color presets */}
                  <div className="flex gap-1">
                    {['#6b7280', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#000000'].map((color) => (
                      <button
                        key={color}
                        className="w-5 h-5 rounded border hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          updateEdge(selectedEdge.id, {
                            style: { ...selectedEdge.style, stroke: color },
                            markerStart: markerStartType !== 'none' ? createMarker(markerStartType, color, markerSize) : undefined,
                            markerEnd: markerEndType !== 'none' ? createMarker(markerEndType, color, markerSize) : undefined,
                          })
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Stroke Width */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Width: {strokeWidth}px</Label>
                  <Slider
                    value={[strokeWidth]}
                    onValueChange={([value]) =>
                      updateEdge(selectedEdge.id, {
                        style: { ...selectedEdge.style, strokeWidth: value }
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
                        style: { ...selectedEdge.style, opacity: value / 100 }
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
                  <Label className="text-xs font-medium">Quick Presets</Label>
                  <div className="grid grid-cols-2 gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => updateEdge(selectedEdge.id, {
                        markerStart: undefined,
                        markerEnd: createMarker('arrowClosed', strokeColor, markerSize),
                      })}
                    >
                      → One-way
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => updateEdge(selectedEdge.id, {
                        markerStart: createMarker('arrowClosed', strokeColor, markerSize),
                        markerEnd: createMarker('arrowClosed', strokeColor, markerSize),
                      })}
                    >
                      ↔ Both
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => updateEdge(selectedEdge.id, {
                        markerStart: undefined,
                        markerEnd: undefined,
                      })}
                    >
                      — None
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => updateEdge(selectedEdge.id, {
                        markerStart: createMarker('arrowClosed', strokeColor, markerSize),
                        markerEnd: undefined,
                      })}
                    >
                      ← Reverse
                    </Button>
                  </div>
                </div>

                {/* Start Arrow */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Start Arrow</Label>
                  <select
                    value={markerStartType}
                    onChange={(e) => updateEdge(selectedEdge.id, {
                      markerStart: createMarker(e.target.value, strokeColor, markerSize),
                    })}
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
                    onChange={(e) => updateEdge(selectedEdge.id, {
                      markerEnd: createMarker(e.target.value, strokeColor, markerSize),
                    })}
                    className="w-full h-8 text-sm border rounded px-2 bg-background"
                  >
                    <option value="none">None</option>
                    <option value="arrow">Arrow (Open)</option>
                    <option value="arrowClosed">Arrow (Filled)</option>
                  </select>
                </div>

                {/* Arrow Size */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Arrow Size: {markerSize}px</Label>
                  <Slider
                    value={[markerSize]}
                    onValueChange={([value]) => {
                      updateEdge(selectedEdge.id, {
                        markerStart: markerStartType !== 'none' ? createMarker(markerStartType, strokeColor, value) : undefined,
                        markerEnd: markerEndType !== 'none' ? createMarker(markerEndType, strokeColor, value) : undefined,
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
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Label Background</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={(selectedEdge.labelBgStyle?.fill as string) || '#ffffff'}
                          onChange={(e) => updateEdge(selectedEdge.id, {
                            labelBgStyle: { fill: e.target.value },
                            labelBgPadding: [4, 8],
                            labelBgBorderRadius: 4,
                          })}
                          className="w-10 h-8 rounded border cursor-pointer"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => updateEdge(selectedEdge.id, {
                            labelBgStyle: undefined,
                            labelBgPadding: undefined,
                          })}
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
                <Button
                  variant={selectedEdge.animated ? 'default' : 'outline'}
                  size="sm"
                  className="w-full h-8 text-xs"
                  onClick={() => updateEdge(selectedEdge.id, { animated: !selectedEdge.animated })}
                >
                  {selectedEdge.animated ? '✨ Animated' : 'Static'}
                </Button>
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
                    '#ffffff', '#f3f4f6', '#fef2f2', '#fef9c3', '#dcfce7', 
                    '#dbeafe', '#f3e8ff', '#fce7f3', '#1f2937', '#000000'
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
              <div className="space-y-2">
                <Label className="text-xs font-medium">
                  Opacity: {Math.round((style.backgroundOpacity ?? 1) * 100)}%
                </Label>
                <Slider
                  value={[(style.backgroundOpacity ?? 1) * 100]}
                  onValueChange={([value]) => updateNodeStyle(selectedNode.id, { backgroundOpacity: value / 100 })}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
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
                  {['#9ca3af', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#000000'].map((color) => (
                    <button
                      key={color}
                      className="w-5 h-5 rounded border hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => updateNodeStyle(selectedNode.id, { borderColor: color })}
                    />
                  ))}
                </div>
              </div>

              {/* Border Width */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Border Width: {style.borderWidth || 1}px</Label>
                <Slider
                  value={[style.borderWidth || 1]}
                  onValueChange={([value]) => updateNodeStyle(selectedNode.id, { borderWidth: value })}
                  min={0}
                  max={8}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Border Style */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Border Style</Label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { value: 'solid', label: '━' },
                    { value: 'dashed', label: '┄' },
                    { value: 'dotted', label: '┈' },
                    { value: 'none', label: '○' },
                  ].map((s) => (
                    <Button
                      key={s.value}
                      variant={(style.borderStyle || 'solid') === s.value ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 text-xs font-mono"
                      onClick={() => updateNodeStyle(selectedNode.id, { borderStyle: s.value as any })}
                    >
                      {s.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Border Radius */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Corner Radius: {style.borderRadius || 8}px</Label>
                <Slider
                  value={[style.borderRadius || 8]}
                  onValueChange={([value]) => updateNodeStyle(selectedNode.id, { borderRadius: value })}
                  min={0}
                  max={50}
                  step={1}
                  className="w-full"
                />
              </div>
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
                {style.shadowEnabled ? '✓ Shadow Enabled' : 'Enable Shadow'}
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
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Blur: {style.shadowBlur || 10}px</Label>
                    <Slider
                      value={[style.shadowBlur || 10]}
                      onValueChange={([value]) => updateNodeStyle(selectedNode.id, { shadowBlur: value })}
                      min={0}
                      max={50}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Shadow Offset */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Offset X</Label>
                      <Input
                        type="number"
                        value={style.shadowOffsetX || 4}
                        onChange={(e) => updateNodeStyle(selectedNode.id, { shadowOffsetX: parseInt(e.target.value) })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Offset Y</Label>
                      <Input
                        type="number"
                        value={style.shadowOffsetY || 4}
                        onChange={(e) => updateNodeStyle(selectedNode.id, { shadowOffsetY: parseInt(e.target.value) })}
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
              <div className="space-y-2">
                <Label className="text-xs font-medium">Font Size: {style.fontSize || 14}px</Label>
                <Slider
                  value={[style.fontSize || 14]}
                  onValueChange={([value]) => updateNodeStyle(selectedNode.id, { fontSize: value })}
                  min={8}
                  max={48}
                  step={1}
                  className="w-full"
                />
              </div>

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
                    onClick={() => updateNodeStyle(selectedNode.id, {
                      fontWeight: style.fontWeight === 'bold' ? 'normal' : 'bold'
                    })}
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={(style.fontStyle || 'normal') === 'italic' ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => updateNodeStyle(selectedNode.id, {
                      fontStyle: style.fontStyle === 'italic' ? 'normal' : 'italic'
                    })}
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={(style.textDecoration || 'none') === 'underline' ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => updateNodeStyle(selectedNode.id, {
                      textDecoration: style.textDecoration === 'underline' ? 'none' : 'underline'
                    })}
                  >
                    <Underline className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={(style.textDecoration || 'none') === 'line-through' ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => updateNodeStyle(selectedNode.id, {
                      textDecoration: style.textDecoration === 'line-through' ? 'none' : 'line-through'
                    })}
                  >
                    <Strikethrough className="w-4 h-4" />
                  </Button>
                </div>
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
                      const nodes = useEditorStore.getState().nodes
                      useEditorStore.setState({
                        nodes: nodes.map((n) =>
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
                      const nodes = useEditorStore.getState().nodes
                      useEditorStore.setState({
                        nodes: nodes.map((n) =>
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
                      const nodes = useEditorStore.getState().nodes
                      useEditorStore.setState({
                        nodes: nodes.map((n) =>
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
                      const nodes = useEditorStore.getState().nodes
                      useEditorStore.setState({
                        nodes: nodes.map((n) =>
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
                <Label className="text-xs font-medium">Rotation: {style.rotation || 0}°</Label>
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
              <div className="space-y-2">
                <Label className="text-xs font-medium">
                  Shape Opacity: {Math.round((style.opacity ?? 1) * 100)}%
                </Label>
                <Slider
                  value={[(style.opacity ?? 1) * 100]}
                  onValueChange={([value]) => updateNodeStyle(selectedNode.id, { opacity: value / 100 })}
                  min={10}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
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
```

---

## FIX 4: Update CustomNode to Apply New Styles

Update the baseStyle and shape rendering in CustomNode.tsx to use the new properties:

```tsx
// In CustomNode.tsx, update baseStyle:
const baseStyle = {
  backgroundColor: style?.backgroundColor || '#ffffff',
  borderColor: style?.borderColor || '#9ca3af',
  borderWidth: style?.borderWidth || 1,
  borderStyle: style?.borderStyle || 'solid',
  borderRadius: style?.borderRadius || 8,
  color: style?.textColor || '#1f2937',
  fontSize: style?.fontSize || 14,
  fontFamily: style?.fontFamily || 'Inter',
  fontWeight: style?.fontWeight || 'normal',
  fontStyle: style?.fontStyle || 'normal',
  textDecoration: style?.textDecoration || 'none',
  textAlign: (style?.textAlign || 'center') as 'left' | 'center' | 'right',
  opacity: style?.backgroundOpacity ?? 1,
  // Shadow
  boxShadow: style?.shadowEnabled 
    ? `${style.shadowOffsetX || 4}px ${style.shadowOffsetY || 4}px ${style.shadowBlur || 10}px ${style.shadowColor || 'rgba(0,0,0,0.2)}'`
    : 'none',
  // Rotation
  transform: style?.rotation ? `rotate(${style.rotation}deg)` : undefined,
}

// Apply vertical alignment in shape class:
const getVerticalAlignClass = () => {
  switch (style?.verticalAlign) {
    case 'top': return 'items-start pt-2'
    case 'bottom': return 'items-end pb-2'
    default: return 'items-center'
  }
}

const shapeClass = cn(
  'w-full h-full flex justify-center text-center overflow-hidden transition-all duration-150',
  getVerticalAlignClass(),
  locked && 'opacity-75',
  isTarget && 'ring-2 ring-green-500 ring-offset-2'
)
```

---

## SUMMARY OF ENHANCEMENTS

### Shape Properties Added:
| Category | Properties |
|----------|------------|
| **Fill** | Background color, Background opacity, Color presets |
| **Border** | Color, Width, Style (solid/dashed/dotted/none), Radius, Color presets |
| **Shadow** | Enable/disable, Color, Blur, Offset X/Y |
| **Text** | Label, Font family (8 options), Size, Color, Bold/Italic/Underline/Strikethrough, Horizontal align, Vertical align |
| **Size** | X, Y, Width, Height, Rotation (0-360°), Overall opacity |
| **Arrange** | Bring forward, Send back, Lock/Unlock |

### Connector Properties Added:
| Category | Properties |
|----------|------------|
| **Line Style** | Path type (4 options), Line style (solid/dashed/dotted), Color + presets, Width, Opacity |
| **Arrows** | Quick presets (4 options), Start/End arrow type, Arrow size slider |
| **Label** | Text, Background color, Clear background |
| **Animation** | Enable/disable animated flow |

---

## TESTING CHECKLIST

- [ ] Resize handles appear on all 8 corners/edges
- [ ] Can resize from any corner
- [ ] Connectors have smaller default arrows (12px)
- [ ] All shape fill properties work
- [ ] All border properties work (including style)
- [ ] Shadow can be enabled and customized
- [ ] All text properties work
- [ ] Rotation slider works
- [ ] Connector color presets work
- [ ] Connector arrow presets work
- [ ] Arrow size slider works
- [ ] Connector label with background works
