/**
 * Documentation Editor
 * Create interactive documentation from diagram sections
 */

import { useState, useCallback, useMemo } from 'react'
import { useReactFlow } from '@xyflow/react'
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ScrollArea,
  Separator,
} from '@/components/ui'
import {
  BookOpen,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  Download,
  FileText,
  Code,
  ChevronUp,
  ChevronDown,
  Camera,
  Highlighter,
} from 'lucide-react'
import { useEditorStore } from '@/stores/editorStore'
import {
  documentationService,
  type DocumentationConfig,
  type DocumentationSection,
  type ExportOptions,
} from '@/services/documentationService'
import { cn } from '@/utils'
import { toast } from 'sonner'

interface DocumentationEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  diagramId: string
  diagramName: string
}

export function DocumentationEditor({
  open,
  onOpenChange,
  diagramId,
  diagramName,
}: DocumentationEditorProps) {
  // Documentation config state
  const [config, setConfig] = useState<DocumentationConfig>(() =>
    documentationService.createDocumentation(diagramId, `${diagramName} Documentation`)
  )
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')

  const nodes = useEditorStore((s) => s.nodes)
  const edges = useEditorStore((s) => s.edges)
  const selectedNodes = useEditorStore((s) => s.selectedNodes)

  const { getViewport } = useReactFlow()

  // Get active section data
  const activeSectionData = useMemo(() => {
    return config.sections.find(s => s.id === activeSection)
  }, [config.sections, activeSection])

  // Capture current view as a new section
  const captureSection = useCallback(() => {
    const viewport = getViewport()
    const newSection = documentationService.createSection(
      `Section ${config.sections.length + 1}`,
      { x: viewport.x, y: viewport.y, zoom: viewport.zoom },
      selectedNodes,
      config.sections
    )

    setConfig(prev => ({
      ...prev,
      sections: [...prev.sections, newSection],
      updatedAt: new Date(),
    }))
    setActiveSection(newSection.id)

    toast.success('Section captured from current view')
  }, [getViewport, selectedNodes, config.sections])

  // Update section
  const updateSection = useCallback((sectionId: string, updates: Partial<DocumentationSection>) => {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, ...updates } : s
      ),
      updatedAt: new Date(),
    }))
  }, [])

  // Delete section
  const deleteSection = useCallback((sectionId: string) => {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId),
      updatedAt: new Date(),
    }))
    if (activeSection === sectionId) {
      setActiveSection(null)
    }
  }, [activeSection])

  // Move section up/down
  const moveSection = useCallback((sectionId: string, direction: 'up' | 'down') => {
    setConfig(prev => {
      const sections = [...prev.sections].sort((a, b) => a.order - b.order)
      const index = sections.findIndex(s => s.id === sectionId)
      if (index === -1) return prev

      const newIndex = direction === 'up' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= sections.length) return prev

      // Swap orders
      const temp = sections[index].order
      sections[index].order = sections[newIndex].order
      sections[newIndex].order = temp

      return {
        ...prev,
        sections: sections.map(s => ({
          ...s,
          order: sections.find(sec => sec.id === s.id)?.order ?? s.order,
        })),
        updatedAt: new Date(),
      }
    })
  }, [])

  // Add code snippet to section
  const addCodeSnippet = useCallback((sectionId: string) => {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId
          ? {
              ...s,
              codeSnippets: [
                ...(s.codeSnippets || []),
                { language: 'javascript', code: '// Your code here', title: 'Code Example' },
              ],
            }
          : s
      ),
      updatedAt: new Date(),
    }))
  }, [])

  // Update code snippet
  const updateCodeSnippet = useCallback(
    (sectionId: string, snippetIndex: number, updates: Partial<{ language: string; code: string; title: string }>) => {
      setConfig(prev => ({
        ...prev,
        sections: prev.sections.map(s =>
          s.id === sectionId
            ? {
                ...s,
                codeSnippets: s.codeSnippets?.map((snippet, i) =>
                  i === snippetIndex ? { ...snippet, ...updates } : snippet
                ),
              }
            : s
        ),
        updatedAt: new Date(),
      }))
    },
    []
  )

  // Delete code snippet
  const deleteCodeSnippet = useCallback((sectionId: string, snippetIndex: number) => {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId
          ? {
              ...s,
              codeSnippets: s.codeSnippets?.filter((_, i) => i !== snippetIndex),
            }
          : s
      ),
      updatedAt: new Date(),
    }))
  }, [])

  // Export documentation
  const exportDocumentation = useCallback(async (format: 'html' | 'markdown' | 'gitbook') => {
    const options: ExportOptions = {
      format,
      includeInteractive: true,
      embedDiagram: true,
    }

    try {
      if (format === 'html') {
        const html = documentationService.generateHtmlDocumentation(config, nodes, edges, options)
        downloadFile(`${config.title}.html`, html, 'text/html')
        toast.success('HTML documentation exported')
      } else if (format === 'markdown') {
        const md = documentationService.generateMarkdownDocumentation(config, options)
        downloadFile(`${config.title}.md`, md, 'text/markdown')
        toast.success('Markdown documentation exported')
      } else if (format === 'gitbook') {
        const { files } = documentationService.generateGitBookDocumentation(config, options)
        // Create a zip file or download each file
        files.forEach(file => {
          downloadFile(file.path, file.content, 'text/markdown')
        })
        toast.success(`GitBook documentation exported (${files.length} files)`)
      }
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export documentation')
    }
  }, [config, nodes, edges])

  // Download helper
  const downloadFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const sortedSections = useMemo(() => {
    return [...config.sections].sort((a, b) => a.order - b.order)
  }, [config.sections])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-[1200px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Documentation Editor
          </DialogTitle>
          <DialogDescription>
            Create interactive documentation from your diagram by capturing views and adding descriptions.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            const tab = v as 'edit' | 'preview'
            setActiveTab(tab)
            if (tab === 'preview') {
              // Generate preview when switching to preview tab
              const options: ExportOptions = {
                format: 'html',
                includeInteractive: true,
                embedDiagram: true,
              }
              const html = documentationService.generateHtmlDocumentation(config, nodes, edges, options)
              setPreviewHtml(html)
            }
          }}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="flex-1 flex gap-4 min-h-0 mt-0">
            {/* Settings & Sections List */}
            <div className="w-72 flex flex-col min-h-0 border rounded-lg">
              {/* Config settings */}
              <div className="p-3 border-b space-y-3">
                <div>
                  <Label htmlFor="doc-title" className="text-xs">Title</Label>
                  <Input
                    id="doc-title"
                    value={config.title}
                    onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Theme</Label>
                    <Select
                      value={config.theme}
                      onValueChange={(v) => setConfig(prev => ({ ...prev, theme: v as 'light' | 'dark' | 'auto' }))}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Navigation</Label>
                    <Select
                      value={config.navigation}
                      onValueChange={(v) => setConfig(prev => ({ ...prev, navigation: v as 'sidebar' | 'arrows' | 'scroll' }))}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sidebar">Sidebar</SelectItem>
                        <SelectItem value="arrows">Arrows</SelectItem>
                        <SelectItem value="scroll">Scroll</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Sections list */}
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <span className="text-sm font-medium">Sections</span>
                <Button size="sm" variant="ghost" onClick={captureSection} className="h-7">
                  <Camera className="w-3 h-3 mr-1" />
                  Capture
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {sortedSections.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No sections yet</p>
                      <p className="text-xs mt-1">
                        Position your view and click Capture
                      </p>
                    </div>
                  ) : (
                    sortedSections.map((section, index) => (
                      <div
                        key={section.id}
                        className={cn(
                          'flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors',
                          'hover:bg-muted',
                          activeSection === section.id && 'bg-muted border border-primary/50'
                        )}
                        onClick={() => setActiveSection(section.id)}
                      >
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{section.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {section.highlightedNodes.length} highlighted
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'up') }}
                            disabled={index === 0}
                          >
                            <ChevronUp className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'down') }}
                            disabled={index === sortedSections.length - 1}
                          >
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-destructive"
                            onClick={(e) => { e.stopPropagation(); deleteSection(section.id) }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Section Editor */}
            <div className="flex-1 border rounded-lg flex flex-col min-h-0">
              {activeSectionData ? (
                <>
                  <div className="p-3 border-b space-y-3">
                    <div>
                      <Label htmlFor="section-title" className="text-xs">Section Title</Label>
                      <Input
                        id="section-title"
                        value={activeSectionData.title}
                        onChange={(e) => updateSection(activeSectionData.id, { title: e.target.value })}
                        className="h-8"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Highlighter className="w-3 h-3" />
                      <span>
                        {activeSectionData.highlightedNodes.length} nodes highlighted
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-xs"
                        onClick={() => updateSection(activeSectionData.id, { highlightedNodes: selectedNodes })}
                      >
                        Update from selection
                      </Button>
                    </div>
                  </div>

                  <ScrollArea className="flex-1 p-3">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs">Description (Markdown)</Label>
                        <Textarea
                          value={activeSectionData.description}
                          onChange={(e) => updateSection(activeSectionData.id, { description: e.target.value })}
                          placeholder="Write a description for this section using Markdown..."
                          className="min-h-[150px] font-mono text-sm"
                        />
                      </div>

                      <Separator />

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs">Code Snippets</Label>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-xs"
                            onClick={() => addCodeSnippet(activeSectionData.id)}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Snippet
                          </Button>
                        </div>

                        <div className="space-y-3">
                          {activeSectionData.codeSnippets?.map((snippet, index) => (
                            <div key={index} className="border rounded-md p-3 space-y-2">
                              <div className="flex items-center gap-2">
                                <Input
                                  value={snippet.title || ''}
                                  onChange={(e) => updateCodeSnippet(activeSectionData.id, index, { title: e.target.value })}
                                  placeholder="Snippet title"
                                  className="h-7 text-sm flex-1"
                                />
                                <Select
                                  value={snippet.language}
                                  onValueChange={(v) => updateCodeSnippet(activeSectionData.id, index, { language: v })}
                                >
                                  <SelectTrigger className="h-7 w-28 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="javascript">JavaScript</SelectItem>
                                    <SelectItem value="typescript">TypeScript</SelectItem>
                                    <SelectItem value="python">Python</SelectItem>
                                    <SelectItem value="terraform">Terraform</SelectItem>
                                    <SelectItem value="yaml">YAML</SelectItem>
                                    <SelectItem value="json">JSON</SelectItem>
                                    <SelectItem value="bash">Bash</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-destructive"
                                  onClick={() => deleteCodeSnippet(activeSectionData.id, index)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                              <Textarea
                                value={snippet.code}
                                onChange={(e) => updateCodeSnippet(activeSectionData.id, index, { code: e.target.value })}
                                className="font-mono text-xs min-h-[80px]"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Select a section to edit</p>
                    <p className="text-xs mt-1">or capture a new section from the diagram</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 min-h-0 mt-0 data-[state=active]:flex data-[state=active]:flex-col">
            <div className="flex-1 border rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
              {previewHtml ? (
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-full border-0"
                  title="Documentation Preview"
                  sandbox="allow-scripts"
                  style={{ minHeight: '400px' }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Preview will appear here</p>
                    <p className="text-xs mt-1">Add sections and click Preview to see the result</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {config.sections.length} section{config.sections.length !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Select onValueChange={(v) => exportDocumentation(v as 'html' | 'markdown' | 'gitbook')}>
              <SelectTrigger className="w-[160px]">
                <Download className="w-4 h-4 mr-2" />
                <span>Export</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="html">Export as HTML</SelectItem>
                <SelectItem value="markdown">Export as Markdown</SelectItem>
                <SelectItem value="gitbook">Export for GitBook</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
