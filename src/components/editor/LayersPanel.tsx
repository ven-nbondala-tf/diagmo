import { useState } from 'react'
import { useEditorStore } from '@/stores/editorStore'
import { cn } from '@/utils'
import {
  Button,
  ScrollArea,
  Input,
} from '@/components/ui'
import {
  Layers,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  PanelRightClose,
  GripVertical,
} from 'lucide-react'
import type { Layer } from '@/types'

export function LayersPanel() {
  const layers = useEditorStore((state) => state.layers)
  const nodes = useEditorStore((state) => state.nodes)
  const selectedNodes = useEditorStore((state) => state.selectedNodes)
  const activeLayerId = useEditorStore((state) => state.activeLayerId)
  const addLayer = useEditorStore((state) => state.addLayer)
  const deleteLayer = useEditorStore((state) => state.deleteLayer)
  const updateLayer = useEditorStore((state) => state.updateLayer)
  const toggleLayerVisibility = useEditorStore((state) => state.toggleLayerVisibility)
  const toggleLayerLock = useEditorStore((state) => state.toggleLayerLock)
  const setActiveLayer = useEditorStore((state) => state.setActiveLayer)
  const moveLayerUp = useEditorStore((state) => state.moveLayerUp)
  const moveLayerDown = useEditorStore((state) => state.moveLayerDown)
  const assignNodesToLayer = useEditorStore((state) => state.assignNodesToLayer)
  const toggleLayersPanel = useEditorStore((state) => state.toggleLayersPanel)

  const [editingLayerId, setEditingLayerId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  // Sort layers by order (highest first = on top)
  const sortedLayers = [...layers].sort((a, b) => b.order - a.order)

  // Count nodes per layer
  const nodeCountByLayer = nodes.reduce((acc, node) => {
    const layerId = node.data.layerId || 'default-layer'
    acc[layerId] = (acc[layerId] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const handleStartEdit = (layer: Layer) => {
    setEditingLayerId(layer.id)
    setEditingName(layer.name)
  }

  const handleFinishEdit = () => {
    if (editingLayerId && editingName.trim()) {
      updateLayer(editingLayerId, { name: editingName.trim() })
    }
    setEditingLayerId(null)
    setEditingName('')
  }

  const handleMoveSelectedToLayer = (layerId: string) => {
    if (selectedNodes.length > 0) {
      assignNodesToLayer(selectedNodes, layerId)
    }
  }

  return (
    <div className="w-64 flex-shrink-0 border-l border-supabase-border bg-supabase-bg flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-supabase-border bg-supabase-bg-secondary">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-supabase-text-muted" />
            <h2 className="font-semibold text-sm text-supabase-text-primary">Layers</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-supabase-text-muted hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary"
              onClick={() => addLayer()}
              title="Add Layer"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-supabase-text-muted hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary"
              onClick={toggleLayersPanel}
              title="Close Panel"
            >
              <PanelRightClose className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Layers List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sortedLayers.map((layer, index) => {
            const isActive = layer.id === activeLayerId
            const nodeCount = nodeCountByLayer[layer.id] || 0
            const isEditing = editingLayerId === layer.id

            return (
              <div
                key={layer.id}
                className={cn(
                  'group flex items-center gap-1 p-2 rounded-md border transition-colors cursor-pointer',
                  isActive
                    ? 'bg-primary/10 border-primary/50'
                    : 'bg-background border-transparent hover:bg-muted/50 hover:border-border'
                )}
                onClick={() => setActiveLayer(layer.id)}
              >
                {/* Drag handle */}
                <GripVertical className="w-3 h-3 text-muted-foreground opacity-50" />

                {/* Layer name */}
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={handleFinishEdit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleFinishEdit()
                        if (e.key === 'Escape') {
                          setEditingLayerId(null)
                          setEditingName('')
                        }
                      }}
                      className="h-6 text-xs px-1"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div
                      className="flex items-center gap-2"
                      onDoubleClick={(e) => {
                        e.stopPropagation()
                        handleStartEdit(layer)
                      }}
                    >
                      <span className="text-sm font-medium truncate">
                        {layer.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({nodeCount})
                      </span>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Move up/down */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      moveLayerUp(layer.id)
                    }}
                    disabled={index === 0}
                    title="Move Up"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      moveLayerDown(layer.id)
                    }}
                    disabled={index === sortedLayers.length - 1}
                    title="Move Down"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </Button>

                  {/* Delete */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteLayer(layer.id)
                    }}
                    disabled={layers.length <= 1}
                    title="Delete Layer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

                {/* Visibility toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleLayerVisibility(layer.id)
                  }}
                  title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                >
                  {layer.visible ? (
                    <Eye className="w-3 h-3" />
                  ) : (
                    <EyeOff className="w-3 h-3 text-muted-foreground" />
                  )}
                </Button>

                {/* Lock toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleLayerLock(layer.id)
                  }}
                  title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
                >
                  {layer.locked ? (
                    <Lock className="w-3 h-3 text-amber-500" />
                  ) : (
                    <Unlock className="w-3 h-3 text-muted-foreground" />
                  )}
                </Button>
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {/* Footer - Move selected to layer */}
      {selectedNodes.length > 0 && (
        <div className="p-3 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground mb-2">
            Move {selectedNodes.length} selected to:
          </p>
          <div className="flex flex-wrap gap-1">
            {sortedLayers.map((layer) => (
              <Button
                key={layer.id}
                variant="outline"
                size="sm"
                className="h-6 text-xs px-2"
                onClick={() => handleMoveSelectedToLayer(layer.id)}
              >
                {layer.name}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
