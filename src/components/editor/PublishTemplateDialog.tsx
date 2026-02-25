/**
 * Publish Template Dialog
 * Allows users to publish their diagram as a marketplace template
 */

import { useState, useCallback } from 'react'
import { useEditorStore } from '@/stores/editorStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import {
  marketplaceService,
  MARKETPLACE_CATEGORIES,
} from '@/services/marketplaceService'
import { exportService } from '@/services/exportService'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
} from '@/components/ui'
import { Upload, X, Plus, Tag, DollarSign, Image } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/utils'

interface PublishTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PublishTemplateDialog({
  open,
  onOpenChange,
}: PublishTemplateDialogProps) {
  const secondaryAccentColor = usePreferencesStore((s) => s.secondaryAccentColor)
  const secondaryAccentTextColor = usePreferencesStore((s) => s.secondaryAccentTextColor)

  const nodes = useEditorStore((s) => s.nodes)
  const edges = useEditorStore((s) => s.edges)
  const layers = useEditorStore((s) => s.layers)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isFree, setIsFree] = useState(true)
  const [price, setPrice] = useState('')
  const [thumbnail, setThumbnail] = useState<string>('')
  const [publishing, setPublishing] = useState(false)
  const [generatingThumbnail, setGeneratingThumbnail] = useState(false)

  // Add tag
  const addTag = useCallback(() => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag])
      setTagInput('')
    }
  }, [tagInput, tags])

  // Remove tag
  const removeTag = useCallback((tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }, [tags])

  // Generate thumbnail
  const generateThumbnail = useCallback(async () => {
    setGeneratingThumbnail(true)
    try {
      const wrapperEl = document.querySelector('.react-flow') as HTMLElement
      if (wrapperEl && nodes.length > 0) {
        const thumbUrl = await exportService.generateThumbnail(wrapperEl, nodes)
        setThumbnail(thumbUrl)
        toast.success('Thumbnail generated')
      }
    } catch (error) {
      console.error('Failed to generate thumbnail:', error)
      toast.error('Failed to generate thumbnail')
    } finally {
      setGeneratingThumbnail(false)
    }
  }, [nodes])

  // Publish template
  const handlePublish = useCallback(async () => {
    if (!name.trim()) {
      toast.error('Please enter a template name')
      return
    }
    if (!description.trim()) {
      toast.error('Please enter a description')
      return
    }
    if (!category) {
      toast.error('Please select a category')
      return
    }
    if (nodes.length === 0) {
      toast.error('Cannot publish an empty diagram')
      return
    }

    setPublishing(true)
    try {
      const priceInCents = isFree ? 0 : Math.round(parseFloat(price) * 100) || 0

      await marketplaceService.publishTemplate(
        name.trim(),
        description.trim(),
        nodes,
        edges,
        {
          category,
          tags,
          layers,
          thumbnail: thumbnail || undefined,
          price: priceInCents,
        }
      )

      toast.success('Template published to marketplace!')
      onOpenChange(false)

      // Reset form
      setName('')
      setDescription('')
      setCategory('')
      setTags([])
      setThumbnail('')
      setIsFree(true)
      setPrice('')
    } catch (error) {
      console.error('Failed to publish template:', error)
      toast.error('Failed to publish template')
    } finally {
      setPublishing(false)
    }
  }, [name, description, category, tags, nodes, edges, layers, thumbnail, isFree, price, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Publish to Marketplace
          </DialogTitle>
          <DialogDescription>
            Share your diagram as a template with the community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name *</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., AWS Three-Tier Architecture"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="template-description">Description *</Label>
            <Textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this template is for and how to use it..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/500
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {MARKETPLACE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  placeholder="Add tags..."
                  className="pl-9"
                  maxLength={30}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addTag}
                disabled={!tagInput.trim() || tags.length >= 10}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Add up to 10 tags to help others find your template
            </p>
          </div>

          {/* Thumbnail */}
          <div className="space-y-2">
            <Label>Thumbnail</Label>
            <div className="flex items-center gap-3">
              {thumbnail ? (
                <div className="relative w-24 h-16 rounded border overflow-hidden">
                  <img
                    src={thumbnail}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setThumbnail('')}
                    className="absolute top-1 right-1 p-0.5 bg-background/80 rounded hover:bg-background"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-16 rounded border border-dashed flex items-center justify-center">
                  <Image className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateThumbnail}
                disabled={generatingThumbnail || nodes.length === 0}
              >
                {generatingThumbnail ? 'Generating...' : 'Generate from Diagram'}
              </Button>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-2">
            <Label>Pricing</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={isFree ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsFree(true)}
                className={isFree ? '' : ''}
                style={isFree ? { backgroundColor: secondaryAccentColor, color: secondaryAccentTextColor } : undefined}
              >
                Free
              </Button>
              <Button
                type="button"
                variant={!isFree ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsFree(false)}
                style={!isFree ? { backgroundColor: secondaryAccentColor, color: secondaryAccentTextColor } : undefined}
              >
                Paid
              </Button>
            </div>
            {!isFree && (
              <div className="flex items-center gap-2 mt-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  min="0.99"
                  max="99.99"
                  step="0.01"
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">USD</span>
              </div>
            )}
          </div>

          {/* Stats preview */}
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm font-medium mb-2">Template Preview</p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-background rounded p-2">
                <p className="font-semibold">{nodes.length}</p>
                <p className="text-muted-foreground">Nodes</p>
              </div>
              <div className="bg-background rounded p-2">
                <p className="font-semibold">{edges.length}</p>
                <p className="text-muted-foreground">Connections</p>
              </div>
              <div className="bg-background rounded p-2">
                <p className="font-semibold">{layers?.length || 1}</p>
                <p className="text-muted-foreground">Layers</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handlePublish}
            disabled={publishing || !name.trim() || !description.trim() || !category}
            style={{ backgroundColor: secondaryAccentColor, color: secondaryAccentTextColor }}
            className="hover:opacity-90"
          >
            {publishing ? 'Publishing...' : 'Publish Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
