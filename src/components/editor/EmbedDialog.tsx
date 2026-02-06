import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Label,
  Input,
  Textarea,
} from '@/components/ui'
import { Copy, Check, Code2, ExternalLink } from 'lucide-react'

interface EmbedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  diagramId: string
  diagramName: string
}

export function EmbedDialog({ open, onOpenChange, diagramId, diagramName }: EmbedDialogProps) {
  const [width, setWidth] = useState('800')
  const [height, setHeight] = useState('600')
  const [showControls, setShowControls] = useState(true)
  const [showMinimap, setShowMinimap] = useState(false)
  const [showTitle, setShowTitle] = useState(true)
  const [bgColor, setBgColor] = useState('#ffffff')
  const [copied, setCopied] = useState<'iframe' | 'url' | null>(null)

  // Generate embed URL
  const embedUrl = useMemo(() => {
    const baseUrl = `${window.location.origin}/embed/${diagramId}`
    const params = new URLSearchParams()

    if (!showControls) params.set('controls', 'false')
    if (showMinimap) params.set('minimap', 'true')
    if (!showTitle) params.set('title', 'false')
    if (bgColor !== '#ffffff') params.set('bg', bgColor)

    const queryString = params.toString()
    return queryString ? `${baseUrl}?${queryString}` : baseUrl
  }, [diagramId, showControls, showMinimap, showTitle, bgColor])

  // Generate iframe code
  const iframeCode = useMemo(() => {
    return `<iframe
  src="${embedUrl}"
  width="${width}"
  height="${height}"
  style="border: 1px solid #e5e7eb; border-radius: 8px;"
  title="${diagramName}"
  allow="fullscreen"
></iframe>`
  }, [embedUrl, width, height, diagramName])

  const handleCopy = async (type: 'iframe' | 'url') => {
    try {
      const text = type === 'iframe' ? iframeCode : embedUrl
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handlePreview = () => {
    window.open(embedUrl, '_blank', `width=${width},height=${height}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="w-5 h-5" />
            Embed Diagram
          </DialogTitle>
          <DialogDescription>
            Generate code to embed this diagram in your website, wiki, or documentation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Size controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="embed-width">Width (px)</Label>
              <Input
                id="embed-width"
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                min={200}
                max={2000}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="embed-height">Height (px)</Label>
              <Input
                id="embed-height"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                min={200}
                max={2000}
              />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Display Options</Label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showControls}
                  onChange={(e) => setShowControls(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Show zoom controls</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showMinimap}
                  onChange={(e) => setShowMinimap(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Show minimap</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTitle}
                  onChange={(e) => setShowTitle(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Show title bar</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded border cursor-pointer"
                />
                <span className="text-sm">Background color</span>
              </div>
            </div>
          </div>

          {/* Direct URL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Direct URL</Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleCopy('url')}
              >
                {copied === 'url' ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy URL
                  </>
                )}
              </Button>
            </div>
            <Input
              value={embedUrl}
              readOnly
              className="font-mono text-xs"
            />
          </div>

          {/* Iframe code */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Embed Code (iframe)</Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleCopy('iframe')}
              >
                {copied === 'iframe' ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>
            <Textarea
              value={iframeCode}
              readOnly
              className="font-mono text-xs h-32 resize-none"
            />
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/50 rounded-md">
            <p><strong>Note:</strong> The embedded diagram will auto-update when you save changes.</p>
            <p>Viewers can pan and zoom but cannot edit the diagram.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="outline" onClick={handlePreview}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
