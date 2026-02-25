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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui'
import { Copy, Check, Code2, ExternalLink } from 'lucide-react'

interface EmbedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  diagramId: string
  diagramName: string
}

type EmbedTab = 'html' | 'react' | 'vue' | 'notion' | 'confluence'

export function EmbedDialog({ open, onOpenChange, diagramId, diagramName }: EmbedDialogProps) {
  const [activeTab, setActiveTab] = useState<EmbedTab>('html')
  const [width, setWidth] = useState('800')
  const [height, setHeight] = useState('600')
  const [responsive, setResponsive] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [showMinimap, setShowMinimap] = useState(false)
  const [showTitle, setShowTitle] = useState(true)
  const [bgColor, setBgColor] = useState('#ffffff')
  const [copied, setCopied] = useState<string | null>(null)

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

  // Generate iframe code (HTML)
  const iframeCode = useMemo(() => {
    if (responsive) {
      return `<div style="position: relative; padding-bottom: ${Math.round((parseInt(height) / parseInt(width)) * 100)}%; height: 0; overflow: hidden;">
  <iframe
    src="${embedUrl}"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 1px solid #e5e7eb; border-radius: 8px;"
    title="${diagramName}"
    allow="fullscreen"
  ></iframe>
</div>`
    }
    return `<iframe
  src="${embedUrl}"
  width="${width}"
  height="${height}"
  style="border: 1px solid #e5e7eb; border-radius: 8px;"
  title="${diagramName}"
  allow="fullscreen"
></iframe>`
  }, [embedUrl, width, height, diagramName, responsive])

  // Generate React component code
  const reactCode = useMemo(() => {
    const componentName = diagramName.replace(/[^a-zA-Z0-9]/g, '') || 'DiagramEmbed'
    if (responsive) {
      return `import React from 'react';

export function ${componentName}() {
  return (
    <div style={{
      position: 'relative',
      paddingBottom: '${Math.round((parseInt(height) / parseInt(width)) * 100)}%',
      height: 0,
      overflow: 'hidden'
    }}>
      <iframe
        src="${embedUrl}"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: '1px solid #e5e7eb',
          borderRadius: '8px'
        }}
        title="${diagramName}"
        allow="fullscreen"
      />
    </div>
  );
}`
    }
    return `import React from 'react';

export function ${componentName}() {
  return (
    <iframe
      src="${embedUrl}"
      width={${width}}
      height={${height}}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px'
      }}
      title="${diagramName}"
      allow="fullscreen"
    />
  );
}`
  }, [embedUrl, width, height, diagramName, responsive])

  // Generate Vue component code
  const vueCode = useMemo(() => {
    if (responsive) {
      return `<template>
  <div :style="containerStyle">
    <iframe
      :src="embedUrl"
      :style="iframeStyle"
      title="${diagramName}"
      allow="fullscreen"
    />
  </div>
</template>

<script setup lang="ts">
const embedUrl = '${embedUrl}'

const containerStyle = {
  position: 'relative',
  paddingBottom: '${Math.round((parseInt(height) / parseInt(width)) * 100)}%',
  height: 0,
  overflow: 'hidden'
}

const iframeStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  border: '1px solid #e5e7eb',
  borderRadius: '8px'
}
</script>`
    }
    return `<template>
  <iframe
    :src="embedUrl"
    :width="${width}"
    :height="${height}"
    :style="iframeStyle"
    title="${diagramName}"
    allow="fullscreen"
  />
</template>

<script setup lang="ts">
const embedUrl = '${embedUrl}'

const iframeStyle = {
  border: '1px solid #e5e7eb',
  borderRadius: '8px'
}
</script>`
  }, [embedUrl, width, height, diagramName, responsive])

  // Generate Notion instructions
  const notionCode = useMemo(() => {
    return `To embed this diagram in Notion:

1. Open your Notion page
2. Type /embed and press Enter
3. Paste the following URL:

${embedUrl}

4. Press Enter to embed the diagram

The diagram will appear as an interactive embed that
viewers can pan and zoom.`
  }, [embedUrl])

  // Generate Confluence macro code
  const confluenceCode = useMemo(() => {
    return `To embed this diagram in Confluence:

Option 1: Using the iframe macro
--------------------------------
1. Add an "HTML" macro to your page
2. Paste this code:

<iframe
  src="${embedUrl}"
  width="${width}"
  height="${height}"
  style="border: 1px solid #e5e7eb; border-radius: 8px;"
  title="${diagramName}"
></iframe>


Option 2: Using the Widget Connector
------------------------------------
1. Add a "Widget Connector" macro
2. Paste the embed URL:

${embedUrl}

3. Set width to ${width}px and height to ${height}px`
  }, [embedUrl, width, height, diagramName])

  const getCodeForTab = (tab: EmbedTab): string => {
    switch (tab) {
      case 'html':
        return iframeCode
      case 'react':
        return reactCode
      case 'vue':
        return vueCode
      case 'notion':
        return notionCode
      case 'confluence':
        return confluenceCode
      default:
        return iframeCode
    }
  }

  const handleCopy = async (type: string) => {
    try {
      const text = type === 'url' ? embedUrl : getCodeForTab(activeTab)
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="embed-width">Width (px)</Label>
              <Input
                id="embed-width"
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                min={200}
                max={2000}
                disabled={responsive}
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
                disabled={responsive}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Sizing</Label>
              <div className="flex items-center h-10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={responsive}
                    onChange={(e) => setResponsive(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Responsive</span>
                </label>
              </div>
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

          {/* Framework tabs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Embed Code</Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleCopy('code')}
              >
                {copied === 'code' ? (
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

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as EmbedTab)}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="react">React</TabsTrigger>
                <TabsTrigger value="vue">Vue</TabsTrigger>
                <TabsTrigger value="notion">Notion</TabsTrigger>
                <TabsTrigger value="confluence">Confluence</TabsTrigger>
              </TabsList>

              <TabsContent value="html" className="mt-2">
                <Textarea
                  value={iframeCode}
                  readOnly
                  className="font-mono text-xs h-40 resize-none"
                />
              </TabsContent>

              <TabsContent value="react" className="mt-2">
                <Textarea
                  value={reactCode}
                  readOnly
                  className="font-mono text-xs h-40 resize-none"
                />
              </TabsContent>

              <TabsContent value="vue" className="mt-2">
                <Textarea
                  value={vueCode}
                  readOnly
                  className="font-mono text-xs h-40 resize-none"
                />
              </TabsContent>

              <TabsContent value="notion" className="mt-2">
                <Textarea
                  value={notionCode}
                  readOnly
                  className="font-mono text-xs h-40 resize-none whitespace-pre-wrap"
                />
              </TabsContent>

              <TabsContent value="confluence" className="mt-2">
                <Textarea
                  value={confluenceCode}
                  readOnly
                  className="font-mono text-xs h-40 resize-none whitespace-pre-wrap"
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/50 rounded-md">
            <p><strong>Note:</strong> The embedded diagram will auto-update when you save changes.</p>
            <p>Viewers can pan and zoom but cannot edit the diagram.</p>
            {responsive && (
              <p><strong>Responsive mode:</strong> The embed will maintain aspect ratio and fill its container width.</p>
            )}
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
