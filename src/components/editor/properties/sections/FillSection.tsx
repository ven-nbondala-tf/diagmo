import { Label, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui'
import { Palette } from 'lucide-react'
import { SliderWithInput, ColorPicker } from '../shared'
import type { ShapeSectionProps } from '../types'

type Props = Pick<ShapeSectionProps, 'style' | 'updateAllSelectedStyles'>

export function FillSection({ style, updateAllSelectedStyles }: Props) {
  return (
    <AccordionItem value="fill" className="border-b">
      <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
        <span className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Fill
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Background</Label>
          <ColorPicker
            value={style.backgroundColor || '#ffffff'}
            onChange={(color) => updateAllSelectedStyles({ backgroundColor: color })}
            presets={['#ffffff', '#f3f4f6', '#fef2f2', '#fef9c3', '#dcfce7', '#dbeafe', '#f3e8ff']}
          />
        </div>

        <SliderWithInput
          label="Opacity"
          value={Math.round((style.backgroundOpacity ?? 1) * 100)}
          onChange={(val) => updateAllSelectedStyles({ backgroundOpacity: val / 100 })}
          min={0}
          max={100}
          step={5}
          unit="%"
        />
      </AccordionContent>
    </AccordionItem>
  )
}
