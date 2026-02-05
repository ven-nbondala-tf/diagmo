import { Label, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui'
import { Square } from 'lucide-react'
import { SliderWithInput, ColorPicker } from '../shared'
import type { ShapeSectionProps } from '../types'

type Props = Pick<ShapeSectionProps, 'style' | 'updateAllSelectedStyles'>

export function BorderSection({ style, updateAllSelectedStyles }: Props) {
  return (
    <AccordionItem value="border" className="border-b">
      <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
        <span className="flex items-center gap-2">
          <Square className="w-4 h-4" />
          Border
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Color</Label>
          <ColorPicker
            value={style.borderColor || '#9ca3af'}
            onChange={(color) => updateAllSelectedStyles({ borderColor: color })}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1">
            <SliderWithInput
              label="Width"
              value={style.borderWidth || 1}
              onChange={(val) => updateAllSelectedStyles({ borderWidth: val })}
              min={0}
              max={8}
              step={1}
              unit="px"
            />
          </div>
          <div className="w-24">
            <Label className="text-xs text-muted-foreground mb-1.5 block">Style</Label>
            <select
              value={style.borderStyle || 'solid'}
              onChange={(e) =>
                updateAllSelectedStyles({
                  borderStyle: e.target.value as 'solid' | 'dashed' | 'dotted' | 'none',
                  ...(e.target.value === 'none' ? { borderWidth: 0 } : {}),
                })
              }
              className="w-full h-7 text-xs border rounded px-1.5 bg-background"
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>

        <SliderWithInput
          label="Radius"
          value={style.borderRadius || 8}
          onChange={(val) => updateAllSelectedStyles({ borderRadius: val })}
          min={0}
          max={50}
          step={1}
          unit="px"
        />
      </AccordionContent>
    </AccordionItem>
  )
}
