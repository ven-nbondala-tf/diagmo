import { Label, Input, AccordionItem, AccordionTrigger, AccordionContent, Switch } from '@/components/ui'
import { Image, ExternalLink } from 'lucide-react'
import { SliderWithInput, ColorPicker } from '../shared'
import type { ShapeSectionProps } from '../types'

type Props = Pick<ShapeSectionProps, 'style' | 'data' | 'updateAllSelectedStyles' | 'updateAllSelectedData'>

export function ImageSection({ style, data, updateAllSelectedStyles, updateAllSelectedData }: Props) {
  if (data.type !== 'web-image') return null

  const hasBg = style.backgroundColor !== 'transparent' && style.backgroundColor !== undefined

  return (
    <AccordionItem value="image" className="border-b">
      <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
        <span className="flex items-center gap-2">
          <Image className="w-4 h-4" />
          Image Settings
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Object Fit</Label>
          <select
            value={data.objectFit || 'cover'}
            onChange={(e) => updateAllSelectedData({ objectFit: e.target.value as 'contain' | 'cover' | 'fill' })}
            className="w-full h-8 text-sm border rounded px-2 bg-background"
          >
            <option value="cover">Cover (fill & crop)</option>
            <option value="contain">Contain (fit entire image)</option>
            <option value="fill">Fill (stretch)</option>
          </select>
        </div>

        {/* Background Color - useful for icons */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Background</Label>
            <Switch
              checked={hasBg}
              onCheckedChange={(checked) => updateAllSelectedStyles({
                backgroundColor: checked ? '#ffffff' : 'transparent',
              })}
            />
          </div>
          {hasBg && (
            <ColorPicker
              value={style.backgroundColor || '#ffffff'}
              onChange={(color) => updateAllSelectedStyles({ backgroundColor: color })}
            />
          )}
        </div>

        {/* Border */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Border</Label>
            <Switch
              checked={(style.borderWidth || 0) > 0}
              onCheckedChange={(checked) => updateAllSelectedStyles({
                borderWidth: checked ? 1 : 0,
                borderColor: style.borderColor || '#e5e7eb',
              })}
            />
          </div>
          {(style.borderWidth || 0) > 0 && (
            <div className="flex gap-2">
              <ColorPicker
                value={style.borderColor || '#e5e7eb'}
                onChange={(color) => updateAllSelectedStyles({ borderColor: color })}
              />
              <select
                value={style.borderWidth || 1}
                onChange={(e) => updateAllSelectedStyles({ borderWidth: parseInt(e.target.value) })}
                className="h-8 text-xs border rounded px-2 bg-background"
              >
                <option value="1">1px</option>
                <option value="2">2px</option>
                <option value="3">3px</option>
                <option value="4">4px</option>
              </select>
            </div>
          )}
        </div>

        <SliderWithInput
          label="Opacity"
          value={Math.round((style.backgroundOpacity ?? 1) * 100)}
          onChange={(val) => updateAllSelectedStyles({ backgroundOpacity: val / 100 })}
          min={10}
          max={100}
          step={5}
          unit="%"
        />

        <SliderWithInput
          label="Corner Radius"
          value={style.borderRadius ?? 4}
          onChange={(val) => updateAllSelectedStyles({ borderRadius: val })}
          min={0}
          max={50}
          step={1}
          unit="px"
        />

        {data.imageUrl && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Image URL</Label>
            <Input
              value={data.imageUrl}
              readOnly
              className="h-7 text-xs bg-muted"
              title={data.imageUrl}
            />
          </div>
        )}

        {data.attribution && (
          <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
            <p className="flex items-center gap-1">
              Photo by{' '}
              <a
                href={data.attribution.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-0.5"
              >
                {data.attribution.name}
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              {' on '}
              {data.attribution.source}
            </p>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  )
}
