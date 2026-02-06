import { Label, Input, Button, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui'
import { Layers } from 'lucide-react'
import { SliderWithInput } from '../shared'
import type { ShapeSectionProps } from '../types'

type Props = Pick<ShapeSectionProps, 'style' | 'updateAllSelectedStyles'>

export function ShadowSection({ style, updateAllSelectedStyles }: Props) {
  return (
    <AccordionItem value="shadow" className="border-b">
      <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
        <span className="flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Shadow
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 space-y-3">
        <div className="flex items-center gap-2">
          <Button
            variant={style.shadowEnabled ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs flex-1"
            onClick={() => updateAllSelectedStyles({ shadowEnabled: !style.shadowEnabled })}
          >
            {style.shadowEnabled ? 'Shadow On' : 'Shadow Off'}
          </Button>
          {style.shadowEnabled && (
            <input
              type="color"
              value={style.shadowColor || '#000000'}
              onChange={(e) => updateAllSelectedStyles({ shadowColor: e.target.value })}
              className="w-7 h-7 rounded border cursor-pointer"
            />
          )}
        </div>

        {style.shadowEnabled && (
          <div className="space-y-3">
            <SliderWithInput
              label="Blur"
              value={style.shadowBlur || 10}
              onChange={(val) => updateAllSelectedStyles({ shadowBlur: val })}
              min={0}
              max={50}
              step={1}
              unit="px"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Offset X</Label>
                <Input
                  type="number"
                  value={style.shadowOffsetX || 4}
                  onChange={(e) => updateAllSelectedStyles({ shadowOffsetX: parseInt(e.target.value) })}
                  className="h-7 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Offset Y</Label>
                <Input
                  type="number"
                  value={style.shadowOffsetY || 4}
                  onChange={(e) => updateAllSelectedStyles({ shadowOffsetY: parseInt(e.target.value) })}
                  className="h-7 text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  )
}
