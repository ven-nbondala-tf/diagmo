import { Label, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui'
import { Layers, ChevronsUp, ChevronUp, ChevronDown, ChevronsDown, Lock, Unlock } from 'lucide-react'
import { IconButton } from '../shared'
import type { ShapeSectionProps } from '../types'

type Props = Pick<ShapeSectionProps, 'data' | 'selectedNodes' | 'updateAllSelectedData' | 'bringToFront' | 'bringForward' | 'sendBackward' | 'sendToBack'>

export function ArrangeSection({ data, selectedNodes, updateAllSelectedData, bringToFront, bringForward, sendBackward, sendToBack }: Props) {
  return (
    <AccordionItem value="arrange" className="border-b">
      <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline hover:bg-accent/50">
        <span className="flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Arrange
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 space-y-3">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Order</Label>
          <div className="flex gap-1">
            <IconButton
              icon={ChevronsUp}
              label="Bring to Front"
              size="xs"
              variant="outline"
              onClick={() => bringToFront(selectedNodes)}
            />
            <IconButton
              icon={ChevronUp}
              label="Bring Forward"
              size="xs"
              variant="outline"
              onClick={() => bringForward(selectedNodes)}
            />
            <IconButton
              icon={ChevronDown}
              label="Send Backward"
              size="xs"
              variant="outline"
              onClick={() => sendBackward(selectedNodes)}
            />
            <IconButton
              icon={ChevronsDown}
              label="Send to Back"
              size="xs"
              variant="outline"
              onClick={() => sendToBack(selectedNodes)}
            />
            <div className="flex-1" />
            <IconButton
              icon={data.locked ? Lock : Unlock}
              label={data.locked ? 'Unlock All' : 'Lock All'}
              size="xs"
              variant="outline"
              active={data.locked}
              onClick={() => updateAllSelectedData({ locked: !data.locked })}
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
