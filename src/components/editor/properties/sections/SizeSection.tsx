import { Label, Input, Slider, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui'
import { Move, RotateCw } from 'lucide-react'
import { SliderWithInput, IconButton } from '../shared'
import type { ShapeSectionProps } from '../types'

type Props = Pick<ShapeSectionProps, 'style' | 'selectedNode' | 'selectedNodes' | 'multipleSelected' | 'updateAllSelectedStyles' | 'updateNodePosition' | 'updateNodeDimensions'>

export function SizeSection({ style, selectedNode, selectedNodes, multipleSelected, updateAllSelectedStyles, updateNodePosition, updateNodeDimensions }: Props) {
  return (
    <AccordionItem value="size" className="border-b">
      <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
        <span className="flex items-center gap-2">
          <Move className="w-4 h-4" />
          Size & Position
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 space-y-3">
        <div className="grid grid-cols-4 gap-1.5">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">X</Label>
            <Input
              type="number"
              value={multipleSelected ? '' : Math.round(selectedNode.position.x)}
              placeholder={multipleSelected ? '—' : ''}
              disabled={multipleSelected}
              onChange={(e) => {
                const x = parseInt(e.target.value) || 0
                updateNodePosition(selectedNode.id, { x })
              }}
              className="h-7 text-xs text-center px-1 disabled:opacity-50"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Y</Label>
            <Input
              type="number"
              value={multipleSelected ? '' : Math.round(selectedNode.position.y)}
              placeholder={multipleSelected ? '—' : ''}
              disabled={multipleSelected}
              onChange={(e) => {
                const y = parseInt(e.target.value) || 0
                updateNodePosition(selectedNode.id, { y })
              }}
              className="h-7 text-xs text-center px-1 disabled:opacity-50"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">W</Label>
            <Input
              type="number"
              value={(selectedNode.style?.width as number) || 120}
              onChange={(e) => {
                const width = parseInt(e.target.value) || 120
                updateNodeDimensions(selectedNodes, { width })
              }}
              className="h-7 text-xs text-center px-1"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">H</Label>
            <Input
              type="number"
              value={(selectedNode.style?.height as number) || 60}
              onChange={(e) => {
                const height = parseInt(e.target.value) || 60
                updateNodeDimensions(selectedNodes, { height })
              }}
              className="h-7 text-xs text-center px-1"
            />
          </div>
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs text-muted-foreground">Rotate</Label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={style.rotation || 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0
                    const clamped = Math.max(0, Math.min(360, val))
                    updateAllSelectedStyles({ rotation: clamped })
                  }}
                  min={0}
                  max={360}
                  className="h-6 w-16 text-xs text-center"
                />
                <span className="text-xs text-muted-foreground">°</span>
              </div>
            </div>
            <div className="flex gap-1 items-center">
              <Slider
                value={[style.rotation || 0]}
                onValueChange={([value]) => updateAllSelectedStyles({ rotation: value })}
                min={0}
                max={360}
                step={15}
                className="flex-1"
              />
              <IconButton
                icon={RotateCw}
                label="Reset Rotation"
                size="xs"
                variant="outline"
                onClick={() => updateAllSelectedStyles({ rotation: 0 })}
              />
            </div>
          </div>
        </div>

        <SliderWithInput
          label="Opacity"
          value={Math.round((style.opacity ?? 1) * 100)}
          onChange={(value) => updateAllSelectedStyles({ opacity: value / 100 })}
          min={10}
          max={100}
          step={5}
          unit="%"
        />
      </AccordionContent>
    </AccordionItem>
  )
}
