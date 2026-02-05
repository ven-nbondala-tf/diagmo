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
import { IconButton, FONT_FAMILIES } from '../shared'
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

        <div className="flex items-center gap-2">
          <select
            value={style.fontFamily || 'Inter'}
            onChange={(e) => updateAllSelectedStyles({ fontFamily: e.target.value })}
            className="h-7 text-xs border rounded px-1.5 bg-background flex-1 min-w-0"
          >
            {FONT_FAMILIES.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
          <Input
            type="number"
            value={style.fontSize || 14}
            onChange={(e) => updateAllSelectedStyles({ fontSize: parseInt(e.target.value) || 14 })}
            min={6}
            max={72}
            className="h-7 w-14 text-xs text-center"
          />
          <input
            type="color"
            value={style.textColor || '#1f2937'}
            onChange={(e) => updateAllSelectedStyles({ textColor: e.target.value })}
            className="w-7 h-7 rounded border cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2">
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

        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground w-16">Vertical</Label>
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
          <select
            value={style.textWrap || 'wrap'}
            onChange={(e) => updateAllSelectedStyles({
              textWrap: e.target.value as 'wrap' | 'nowrap' | 'truncate'
            })}
            className="h-7 text-xs border rounded px-1.5 bg-background flex-1"
          >
            <option value="wrap">Wrap</option>
            <option value="nowrap">No Wrap</option>
            <option value="truncate">Truncate</option>
          </select>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
