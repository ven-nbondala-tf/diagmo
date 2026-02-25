import { Label, Input, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui'
import {
  Type,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
} from 'lucide-react'
import { IconButton, SliderWithInput, FONT_FAMILIES } from '../shared'
import type { ShapeSectionProps } from '../types'

type Props = Pick<ShapeSectionProps, 'style' | 'data' | 'selectedNode' | 'multipleSelected' | 'updateAllSelectedStyles' | 'updateNode'>

export function TextSection({ style, data, selectedNode, multipleSelected, updateAllSelectedStyles, updateNode }: Props) {
  return (
    <AccordionItem value="text" className="border-b">
      <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
        <span className="flex items-center gap-2">
          <Type className="w-4 h-4" />
          Text
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Label {multipleSelected && <span className="text-muted-foreground/50">(single only)</span>}
          </Label>
          <Input
            value={multipleSelected ? '' : data.label}
            onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })}
            placeholder={multipleSelected ? 'Multiple shapes selected' : ''}
            disabled={multipleSelected}
            className="h-8 text-sm disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <select
            value={style.fontFamily || 'Inter'}
            onChange={(e) => updateAllSelectedStyles({ fontFamily: e.target.value })}
            className="w-full h-7 text-xs border rounded px-1.5 bg-background"
          >
            {FONT_FAMILIES.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block">Size</Label>
              <Input
                type="number"
                value={style.fontSize || 14}
                onChange={(e) => updateAllSelectedStyles({ fontSize: parseInt(e.target.value) || 14 })}
                min={6}
                max={72}
                className="h-7 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Color</Label>
              <input
                type="color"
                value={style.textColor || '#ededed'}
                onChange={(e) => updateAllSelectedStyles({ textColor: e.target.value })}
                className="w-7 h-7 rounded border cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Style</Label>
            <div className="flex gap-0.5 border rounded p-0.5">
              <IconButton
                icon={Bold}
                label="Bold"
                size="xs"
                active={style.fontWeight === 'bold'}
                onClick={() => updateAllSelectedStyles({
                  fontWeight: style.fontWeight === 'bold' ? 'normal' : 'bold'
                })}
              />
              <IconButton
                icon={Italic}
                label="Italic"
                size="xs"
                active={style.fontStyle === 'italic'}
                onClick={() => updateAllSelectedStyles({
                  fontStyle: style.fontStyle === 'italic' ? 'normal' : 'italic'
                })}
              />
              <IconButton
                icon={Underline}
                label="Underline"
                size="xs"
                active={style.textDecoration === 'underline'}
                onClick={() => updateAllSelectedStyles({
                  textDecoration: style.textDecoration === 'underline' ? 'none' : 'underline'
                })}
              />
              <IconButton
                icon={Strikethrough}
                label="Strikethrough"
                size="xs"
                active={style.textDecoration === 'line-through'}
                onClick={() => updateAllSelectedStyles({
                  textDecoration: style.textDecoration === 'line-through' ? 'none' : 'line-through'
                })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Horizontal</Label>
            <div className="flex gap-0.5 border rounded p-0.5">
              <IconButton
                icon={AlignLeft}
                label="Align Left"
                size="xs"
                active={style.textAlign === 'left'}
                onClick={() => updateAllSelectedStyles({ textAlign: 'left' })}
              />
              <IconButton
                icon={AlignCenter}
                label="Align Center"
                size="xs"
                active={(style.textAlign || 'center') === 'center'}
                onClick={() => updateAllSelectedStyles({ textAlign: 'center' })}
              />
              <IconButton
                icon={AlignRight}
                label="Align Right"
                size="xs"
                active={style.textAlign === 'right'}
                onClick={() => updateAllSelectedStyles({ textAlign: 'right' })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Vertical</Label>
            <div className="flex gap-0.5 border rounded p-0.5">
              <IconButton
                icon={AlignVerticalJustifyStart}
                label="Align Top"
                size="xs"
                active={style.verticalAlign === 'top'}
                onClick={() => updateAllSelectedStyles({ verticalAlign: 'top' })}
              />
              <IconButton
                icon={AlignVerticalJustifyCenter}
                label="Align Middle"
                size="xs"
                active={(style.verticalAlign || 'middle') === 'middle'}
                onClick={() => updateAllSelectedStyles({ verticalAlign: 'middle' })}
              />
              <IconButton
                icon={AlignVerticalJustifyEnd}
                label="Align Bottom"
                size="xs"
                active={style.verticalAlign === 'bottom'}
                onClick={() => updateAllSelectedStyles({ verticalAlign: 'bottom' })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Text Wrap</Label>
          <select
            value={style.textWrap || 'wrap'}
            onChange={(e) => updateAllSelectedStyles({
              textWrap: e.target.value as 'wrap' | 'nowrap' | 'truncate'
            })}
            className="w-full h-7 text-xs border rounded px-1.5 bg-background"
          >
            <option value="wrap">Wrap</option>
            <option value="nowrap">No Wrap</option>
            <option value="truncate">Truncate</option>
          </select>
        </div>

        <SliderWithInput
          label="Padding"
          value={style.textPadding ?? 8}
          onChange={(val) => updateAllSelectedStyles({ textPadding: val })}
          min={0}
          max={32}
          step={2}
          unit="px"
        />
      </AccordionContent>
    </AccordionItem>
  )
}
