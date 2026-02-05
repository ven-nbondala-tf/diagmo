import { Label, AccordionItem, AccordionTrigger, AccordionContent, Switch } from '@/components/ui'
import { Palette, ArrowRight, ArrowDown, ArrowDownRight } from 'lucide-react'
import { SliderWithInput, ColorPicker, IconButton } from '../shared'
import type { ShapeSectionProps } from '../types'

type Props = Pick<ShapeSectionProps, 'style' | 'updateAllSelectedStyles'>

const GRADIENT_DIRECTIONS = [
  { value: 'horizontal', icon: ArrowRight, label: 'Horizontal' },
  { value: 'vertical', icon: ArrowDown, label: 'Vertical' },
  { value: 'diagonal', icon: ArrowDownRight, label: 'Diagonal' },
] as const

export function FillSection({ style, updateAllSelectedStyles }: Props) {
  const gradientEnabled = style.gradientEnabled ?? false

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

        {/* Gradient Section */}
        <div className="pt-2 border-t space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Gradient</Label>
            <Switch
              checked={gradientEnabled}
              onCheckedChange={(checked) => updateAllSelectedStyles({ gradientEnabled: checked })}
            />
          </div>

          {gradientEnabled && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Second Color</Label>
                <ColorPicker
                  value={style.gradientColor || '#3b82f6'}
                  onChange={(color) => updateAllSelectedStyles({ gradientColor: color })}
                  presets={['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#06b6d4', '#6366f1']}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Direction</Label>
                <div className="flex gap-1">
                  {GRADIENT_DIRECTIONS.map(({ value, icon: Icon, label }) => (
                    <IconButton
                      key={value}
                      icon={Icon}
                      tooltip={label}
                      isActive={(style.gradientDirection || 'horizontal') === value}
                      onClick={() => updateAllSelectedStyles({ gradientDirection: value })}
                    />
                  ))}
                </div>
              </div>

              {/* Gradient Preview */}
              <div
                className="h-6 rounded border"
                style={{
                  background: `linear-gradient(${
                    style.gradientDirection === 'vertical' ? '180deg' :
                    style.gradientDirection === 'diagonal' ? '135deg' : '90deg'
                  }, ${style.backgroundColor || '#ffffff'}, ${style.gradientColor || '#3b82f6'})`,
                }}
              />
            </>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
