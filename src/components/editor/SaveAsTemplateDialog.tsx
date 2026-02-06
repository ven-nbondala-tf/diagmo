import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Input,
  Label,
  Textarea,
  Switch,
} from '@/components/ui'
import { Save, Loader2 } from 'lucide-react'
import { useEditorStore } from '@/stores/editorStore'
import { templateService, TEMPLATE_CATEGORIES } from '@/services/templateService'
import { toast } from 'sonner'

interface SaveAsTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SaveAsTemplateDialog({ open, onOpenChange }: SaveAsTemplateDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('General')
  const [isPublic, setIsPublic] = useState(false)
  const [saving, setSaving] = useState(false)

  const nodes = useEditorStore((state) => state.nodes)
  const edges = useEditorStore((state) => state.edges)
  const layers = useEditorStore((state) => state.layers)

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      toast.error('Please enter a template name')
      return
    }

    if (nodes.length === 0) {
      toast.error('Cannot save an empty diagram as a template')
      return
    }

    setSaving(true)
    try {
      await templateService.createTemplate(name.trim(), nodes, edges, {
        description: description.trim() || undefined,
        category,
        layers,
        isPublic,
      })

      toast.success('Template saved successfully!')
      onOpenChange(false)

      // Reset form
      setName('')
      setDescription('')
      setCategory('General')
      setIsPublic(false)
    } catch (error) {
      console.error('Failed to save template:', error)
      toast.error('Failed to save template')
    } finally {
      setSaving(false)
    }
  }, [name, description, category, isPublic, nodes, edges, layers, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            Save as Template
          </DialogTitle>
          <DialogDescription>
            Save the current diagram as a reusable template.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Template Name */}
          <div>
            <Label htmlFor="template-name">Template Name *</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Template"
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this template is for..."
              className="mt-1 resize-none"
              rows={3}
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="template-category">Category</Label>
            <select
              id="template-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 mt-1 px-3 text-sm border rounded-md bg-background"
            >
              {TEMPLATE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Public Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Make Public</Label>
              <p className="text-xs text-muted-foreground">
                Allow others to use this template
              </p>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p><strong>{nodes.length}</strong> shapes and <strong>{edges.length}</strong> connections will be saved.</p>
            {layers.length > 1 && (
              <p className="mt-1"><strong>{layers.length}</strong> layers will be included.</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !name.trim()}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Template
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
