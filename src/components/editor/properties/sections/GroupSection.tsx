import { Label, AccordionItem, AccordionTrigger, AccordionContent, Input, Switch } from '@/components/ui'
import { Layers } from 'lucide-react'
import { SliderWithInput, ColorPicker } from '../shared'
import type { GroupStyle } from '@/types'

interface GroupSectionProps {
  groupId: string
  groupStyle: GroupStyle
  updateGroupStyle: (groupId: string, style: Partial<GroupStyle>) => void
}

export function GroupSection({ groupId, groupStyle, updateGroupStyle }: GroupSectionProps) {
  const handleUpdate = (updates: Partial<GroupStyle>) => {
    updateGroupStyle(groupId, updates)
  }

  return (
    <AccordionItem value="group" className="border-b">
      <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
        <span className="flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Group
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 space-y-3">
        {/* Group Label */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Show Label</Label>
            <Switch
              checked={groupStyle.showLabel !== false}
              onCheckedChange={(checked) => handleUpdate({ showLabel: checked })}
            />
          </div>
        </div>

        {groupStyle.showLabel !== false && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Label Text</Label>
            <Input
              value={groupStyle.labelText || 'Group'}
              onChange={(e) => handleUpdate({ labelText: e.target.value })}
              className="h-7 text-xs"
              placeholder="Group"
            />
          </div>
        )}

        {/* Border Style */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Border Style</Label>
          <select
            value={groupStyle.borderStyle || 'dashed'}
            onChange={(e) =>
              handleUpdate({
                borderStyle: e.target.value as GroupStyle['borderStyle'],
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

        {/* Border Color - only show if border is visible */}
        {groupStyle.borderStyle !== 'none' && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Border Color</Label>
              <ColorPicker
                value={groupStyle.borderColor || '#3ECF8E'}
                onChange={(color) => handleUpdate({ borderColor: color })}
              />
            </div>

            <SliderWithInput
              label="Border Width"
              value={groupStyle.borderWidth ?? 2}
              onChange={(val) => handleUpdate({ borderWidth: val })}
              min={1}
              max={6}
              step={1}
              unit="px"
            />

            <SliderWithInput
              label="Border Opacity"
              value={(groupStyle.borderOpacity ?? 0.4) * 100}
              onChange={(val) => handleUpdate({ borderOpacity: val / 100 })}
              min={10}
              max={100}
              step={10}
              unit="%"
            />
          </>
        )}

        {/* Background */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Background Color</Label>
          <ColorPicker
            value={groupStyle.backgroundColor || '#3ECF8E'}
            onChange={(color) => handleUpdate({ backgroundColor: color })}
          />
        </div>

        <SliderWithInput
          label="Background Opacity"
          value={(groupStyle.backgroundOpacity ?? 0.05) * 100}
          onChange={(val) => handleUpdate({ backgroundOpacity: val / 100 })}
          min={0}
          max={30}
          step={1}
          unit="%"
        />

        {/* Border Radius */}
        <SliderWithInput
          label="Corner Radius"
          value={groupStyle.borderRadius ?? 8}
          onChange={(val) => handleUpdate({ borderRadius: val })}
          min={0}
          max={24}
          step={1}
          unit="px"
        />

        {/* Padding */}
        <SliderWithInput
          label="Padding"
          value={groupStyle.padding ?? 12}
          onChange={(val) => handleUpdate({ padding: val })}
          min={4}
          max={32}
          step={2}
          unit="px"
        />
      </AccordionContent>
    </AccordionItem>
  )
}
