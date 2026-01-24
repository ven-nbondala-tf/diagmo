import { useEditorStore } from '@/stores/editorStore'
import { Input, Label, Separator, Button } from '@/components/ui'
import { Trash2 } from 'lucide-react'

export function PropertiesPanel() {
  const nodes = useEditorStore((state) => state.nodes)
  const selectedNodes = useEditorStore((state) => state.selectedNodes)
  const updateNode = useEditorStore((state) => state.updateNode)
  const updateNodeStyle = useEditorStore((state) => state.updateNodeStyle)
  const deleteSelected = useEditorStore((state) => state.deleteSelected)

  const selectedNode = nodes.find((n) => selectedNodes.includes(n.id))

  if (!selectedNode) {
    return (
      <div className="w-64 border-l bg-background p-4">
        <h2 className="font-semibold mb-2">Properties</h2>
        <p className="text-sm text-muted-foreground">
          Select a shape to edit its properties
        </p>
      </div>
    )
  }

  const { data } = selectedNode
  const style = data.style || {}

  return (
    <div className="w-64 border-l bg-background flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Properties</h2>
        <p className="text-xs text-muted-foreground capitalize">{data.type}</p>
      </div>
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        <div className="space-y-2">
          <Label htmlFor="label">Label</Label>
          <Input
            id="label"
            value={data.label}
            onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Style</h3>

          <div className="space-y-2">
            <Label htmlFor="bgColor">Background Color</Label>
            <div className="flex gap-2">
              <input
                type="color"
                id="bgColor"
                value={style.backgroundColor || '#ffffff'}
                onChange={(e) =>
                  updateNodeStyle(selectedNode.id, { backgroundColor: e.target.value })
                }
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <Input
                value={style.backgroundColor || '#ffffff'}
                onChange={(e) =>
                  updateNodeStyle(selectedNode.id, { backgroundColor: e.target.value })
                }
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="borderColor">Border Color</Label>
            <div className="flex gap-2">
              <input
                type="color"
                id="borderColor"
                value={style.borderColor || '#374151'}
                onChange={(e) =>
                  updateNodeStyle(selectedNode.id, { borderColor: e.target.value })
                }
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <Input
                value={style.borderColor || '#374151'}
                onChange={(e) =>
                  updateNodeStyle(selectedNode.id, { borderColor: e.target.value })
                }
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="borderWidth">Border Width</Label>
            <Input
              id="borderWidth"
              type="number"
              min={0}
              max={10}
              value={style.borderWidth || 2}
              onChange={(e) =>
                updateNodeStyle(selectedNode.id, { borderWidth: parseInt(e.target.value) || 0 })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="textColor">Text Color</Label>
            <div className="flex gap-2">
              <input
                type="color"
                id="textColor"
                value={style.textColor || '#1f2937'}
                onChange={(e) =>
                  updateNodeStyle(selectedNode.id, { textColor: e.target.value })
                }
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <Input
                value={style.textColor || '#1f2937'}
                onChange={(e) =>
                  updateNodeStyle(selectedNode.id, { textColor: e.target.value })
                }
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fontSize">Font Size</Label>
            <Input
              id="fontSize"
              type="number"
              min={8}
              max={72}
              value={style.fontSize || 14}
              onChange={(e) =>
                updateNodeStyle(selectedNode.id, { fontSize: parseInt(e.target.value) || 14 })
              }
            />
          </div>
        </div>
      </div>

      <div className="p-4 border-t">
        <Button
          variant="destructive"
          className="w-full"
          onClick={deleteSelected}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  )
}
