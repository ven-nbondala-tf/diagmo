import { useState } from 'react'
import { useEditorStore } from '@/stores/editorStore'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Input,
  Label,
} from '@/components/ui'
import { Plus, Trash2, ExternalLink, Link } from 'lucide-react'
import type { DiagramNode } from '@/types'

interface MetadataSectionProps {
  selectedNodes: DiagramNode[]
}

export function MetadataSection({ selectedNodes }: MetadataSectionProps) {
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')

  const updateNode = useEditorStore((state) => state.updateNode)
  const pushHistory = useEditorStore((state) => state.pushHistory)

  // Only show for single selection
  const node = selectedNodes[0]
  if (!node || selectedNodes.length !== 1) return null

  const metadata = node.data.metadata || {}
  const entries = Object.entries(metadata)

  const handleAddMetadata = () => {
    if (!newKey.trim()) return

    pushHistory()

    const updatedMetadata = {
      ...metadata,
      [newKey.trim()]: newValue,
    }

    updateNode(node.id, { metadata: updatedMetadata })
    setNewKey('')
    setNewValue('')
  }

  const handleUpdateValue = (key: string, value: string) => {
    const updatedMetadata = {
      ...metadata,
      [key]: value,
    }

    updateNode(node.id, { metadata: updatedMetadata })
  }

  const handleDeleteMetadata = (key: string) => {
    pushHistory()

    const { [key]: _, ...rest } = metadata
    updateNode(node.id, { metadata: Object.keys(rest).length > 0 ? rest : undefined })
  }

  const isUrl = (value: string): boolean => {
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  }

  return (
    <Accordion type="single" collapsible defaultValue="metadata">
      <AccordionItem value="metadata" className="border-none">
        <AccordionTrigger className="text-xs font-medium py-2 hover:no-underline">
          <div className="flex items-center gap-2">
            <Link className="w-3.5 h-3.5" />
            Linked Data
          </div>
        </AccordionTrigger>
        <AccordionContent className="space-y-3 pt-2">
          {/* Existing metadata entries */}
          {entries.length > 0 && (
            <div className="space-y-2">
              {entries.map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-muted-foreground">{key}</Label>
                    <div className="flex items-center gap-1">
                      <Input
                        value={String(value)}
                        onChange={(e) => handleUpdateValue(key, e.target.value)}
                        className="h-7 text-xs"
                      />
                      {typeof value === 'string' && isUrl(value) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => window.open(value, '_blank')}
                          title="Open link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive mt-5"
                    onClick={() => handleDeleteMetadata(key)}
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add new metadata */}
          <div className="space-y-2 pt-2 border-t">
            <Label className="text-xs text-muted-foreground">Add new property</Label>
            <div className="flex items-center gap-2">
              <Input
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="Key (e.g., URL)"
                className="h-7 text-xs"
              />
              <Input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Value"
                className="h-7 text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddMetadata()
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={handleAddMetadata}
                disabled={!newKey.trim()}
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Common presets */}
          {entries.length === 0 && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Suggested properties:</p>
              <div className="flex flex-wrap gap-1">
                {['URL', 'Ticket ID', 'Cost', 'Owner', 'Status'].map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs px-2"
                    onClick={() => setNewKey(preset)}
                  >
                    {preset}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
