import { useParams, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Loader2, AlertCircle } from 'lucide-react'
import { nodeTypes } from '@/components/editor/nodes'
import { edgeTypes } from '@/components/editor/edges'
import { diagramService } from '@/services/diagramService'
import type { Diagram } from '@/types'

function EmbedViewer({ diagram, showControls, showMinimap }: {
  diagram: Diagram
  showControls: boolean
  showMinimap: boolean
}) {
  const { fitView } = useReactFlow()

  useEffect(() => {
    // Fit view after nodes are loaded
    const timeout = setTimeout(() => {
      fitView({ padding: 0.1 })
    }, 100)
    return () => clearTimeout(timeout)
  }, [fitView, diagram.nodes])

  return (
    <ReactFlow
      nodes={diagram.nodes}
      edges={diagram.edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={{ padding: 0.1 }}
      // Read-only settings
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnDrag={true}
      zoomOnScroll={true}
      zoomOnPinch={true}
      preventScrolling={true}
      // Clean appearance
      proOptions={{ hideAttribution: true }}
      minZoom={0.1}
      maxZoom={4}
    >
      <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e5e7eb" />
      {showControls && (
        <Controls
          showZoom={true}
          showFitView={true}
          showInteractive={false}
          position="bottom-right"
        />
      )}
      {showMinimap && (
        <MiniMap
          nodeColor="#6366f1"
          maskColor="rgba(0, 0, 0, 0.1)"
          position="bottom-left"
          pannable
          zoomable
        />
      )}
    </ReactFlow>
  )
}

function EmbedContent() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const [diagram, setDiagram] = useState<Diagram | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Parse embed options from URL params
  const showControls = searchParams.get('controls') !== 'false'
  const showMinimap = searchParams.get('minimap') === 'true'
  const showTitle = searchParams.get('title') !== 'false'
  const bgColor = searchParams.get('bg') || 'white'

  useEffect(() => {
    async function loadDiagram() {
      if (!id) {
        setError('No diagram ID provided')
        setLoading(false)
        return
      }

      try {
        const data = await diagramService.getById(id)
        if (!data) {
          setError('Diagram not found')
        } else {
          setDiagram(data)
        }
      } catch (err) {
        console.error('Failed to load diagram:', err)
        setError('Failed to load diagram')
      } finally {
        setLoading(false)
      }
    }

    loadDiagram()
  }, [id])

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: bgColor }}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !diagram) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: bgColor }}>
        <div className="text-center p-4">
          <AlertCircle className="h-10 w-10 mx-auto mb-2 text-destructive" />
          <p className="text-sm text-muted-foreground">{error || 'Diagram not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: bgColor }}>
      {showTitle && (
        <div className="px-4 py-2 border-b bg-background/80 backdrop-blur-sm">
          <h1 className="text-sm font-medium truncate">{diagram.name}</h1>
        </div>
      )}
      <div className="flex-1 relative">
        <EmbedViewer
          diagram={diagram}
          showControls={showControls}
          showMinimap={showMinimap}
        />
      </div>
      <div className="px-2 py-1 border-t bg-background/80 backdrop-blur-sm flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          Powered by Diagmo
        </span>
        <a
          href={`${window.location.origin}/editor/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-primary hover:underline"
        >
          Open in Editor
        </a>
      </div>
    </div>
  )
}

export function EmbedPage() {
  return (
    <ReactFlowProvider>
      <div className="w-screen h-screen overflow-hidden">
        <EmbedContent />
      </div>
    </ReactFlowProvider>
  )
}
