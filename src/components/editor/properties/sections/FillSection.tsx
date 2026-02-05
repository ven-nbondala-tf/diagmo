import { Label, AccordionItem, AccordionTrigger, AccordionContent, Switch } from '@/components/ui'
import { Palette, ArrowRight, ArrowDown, ArrowDownRight } from 'lucide-react'
import { SliderWithInput, ColorPicker, IconButton } from '../shared'
import { cn } from '@/utils/cn'
import type { ShapeSectionProps } from '../types'

type Props = Pick<ShapeSectionProps, 'style' | 'updateAllSelectedStyles'>

const GRADIENT_DIRECTIONS = [
  { value: 'horizontal', icon: ArrowRight, label: 'Horizontal' },
  { value: 'vertical', icon: ArrowDown, label: 'Vertical' },
  { value: 'diagonal', icon: ArrowDownRight, label: 'Diagonal' },
] as const

// Pattern type definitions with SVG preview
const PATTERN_TYPES = [
  { value: 'diagonal-lines', label: 'Diagonal' },
  { value: 'dots', label: 'Dots' },
  { value: 'grid', label: 'Grid' },
  { value: 'crosshatch', label: 'Crosshatch' },
  { value: 'horizontal-lines', label: 'Horizontal' },
  { value: 'vertical-lines', label: 'Vertical' },
] as const

// Pattern preview SVG component
const PatternPreview = ({ type, color = '#6b7280' }: { type: string; color?: string }) => {
  const size = 24
  const patternContent = () => {
    switch (type) {
      case 'diagonal-lines':
        return (
          <pattern id={`preview-${type}`} patternUnits="userSpaceOnUse" width="6" height="6">
            <path d="M-1,1 l2,-2 M0,6 l6,-6 M5,7 l2,-2" stroke={color} strokeWidth="1" />
          </pattern>
        )
      case 'dots':
        return (
          <pattern id={`preview-${type}`} patternUnits="userSpaceOnUse" width="6" height="6">
            <circle cx="3" cy="3" r="1.5" fill={color} />
          </pattern>
        )
      case 'grid':
        return (
          <pattern id={`preview-${type}`} patternUnits="userSpaceOnUse" width="6" height="6">
            <path d="M6,0 L0,0 0,6" fill="none" stroke={color} strokeWidth="0.5" />
          </pattern>
        )
      case 'crosshatch':
        return (
          <pattern id={`preview-${type}`} patternUnits="userSpaceOnUse" width="6" height="6">
            <path d="M-1,1 l2,-2 M0,6 l6,-6 M5,7 l2,-2" stroke={color} strokeWidth="0.5" />
            <path d="M7,1 l-2,-2 M6,6 l-6,-6 M1,7 l-2,-2" stroke={color} strokeWidth="0.5" />
          </pattern>
        )
      case 'horizontal-lines':
        return (
          <pattern id={`preview-${type}`} patternUnits="userSpaceOnUse" width="6" height="6">
            <line x1="0" y1="3" x2="6" y2="3" stroke={color} strokeWidth="1" />
          </pattern>
        )
      case 'vertical-lines':
        return (
          <pattern id={`preview-${type}`} patternUnits="userSpaceOnUse" width="6" height="6">
            <line x1="3" y1="0" x2="3" y2="6" stroke={color} strokeWidth="1" />
          </pattern>
        )
      default:
        return null
    }
  }

  return (
    <svg width={size} height={size} className="rounded border">
      <defs>{patternContent()}</defs>
      <rect width={size} height={size} fill="#ffffff" />
      <rect width={size} height={size} fill={`url(#preview-${type})`} />
    </svg>
  )
}

export function FillSection({ style, updateAllSelectedStyles }: Props) {
  const gradientEnabled = style.gradientEnabled ?? false
  const patternEnabled = style.patternEnabled ?? false

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

        {/* Pattern Section */}
        <div className="pt-2 border-t space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Pattern</Label>
            <Switch
              checked={patternEnabled}
              onCheckedChange={(checked) => updateAllSelectedStyles({ patternEnabled: checked })}
            />
          </div>

          {patternEnabled && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Type</Label>
                <div className="grid grid-cols-6 gap-1">
                  {PATTERN_TYPES.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => updateAllSelectedStyles({ patternType: value })}
                      className={cn(
                        'flex flex-col items-center p-1 rounded border transition-colors',
                        (style.patternType || 'diagonal-lines') === value
                          ? 'border-primary bg-primary/10'
                          : 'border-transparent hover:border-border hover:bg-muted/50'
                      )}
                      title={label}
                    >
                      <PatternPreview type={value} color={style.patternColor || '#6b7280'} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Pattern Color</Label>
                <ColorPicker
                  value={style.patternColor || '#6b7280'}
                  onChange={(color) => updateAllSelectedStyles({ patternColor: color })}
                  presets={['#6b7280', '#374151', '#1f2937', '#3b82f6', '#8b5cf6', '#ec4899', '#22c55e']}
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <SliderWithInput
                    label="Size"
                    value={style.patternSize ?? 8}
                    onChange={(val) => updateAllSelectedStyles({ patternSize: val })}
                    min={4}
                    max={24}
                    step={2}
                    unit="px"
                  />
                </div>
                <div className="flex-1">
                  <SliderWithInput
                    label="Opacity"
                    value={Math.round((style.patternOpacity ?? 1) * 100)}
                    onChange={(val) => updateAllSelectedStyles({ patternOpacity: val / 100 })}
                    min={10}
                    max={100}
                    step={10}
                    unit="%"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
