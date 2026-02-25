import { useRef, useState, useCallback, useEffect } from 'react'
import { useReactFlow } from '@xyflow/react'
import { useEditorStore } from '@/stores/editorStore'
import { collaborationService } from '@/services/collaborationService'
import { nanoid } from 'nanoid'
import type { DrawingPoint, DrawingStroke, DrawingTool } from '@/types'

export function WhiteboardCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { screenToFlowPosition, getViewport } = useReactFlow()

  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPoints, setCurrentPoints] = useState<DrawingPoint[]>([])
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null)
  const [shapeEnd, setShapeEnd] = useState<{ x: number; y: number } | null>(null)

  const drawingMode = useEditorStore((s) => s.drawingMode)
  const drawingTool = useEditorStore((s) => s.drawingTool)
  const drawingColor = useEditorStore((s) => s.drawingColor)
  const drawingWidth = useEditorStore((s) => s.drawingWidth)
  const strokes = useEditorStore((s) => s.drawingStrokes)
  const drawingLayerVisible = useEditorStore((s) => s.drawingLayerVisible)
  const selectedStrokeIds = useEditorStore((s) => s.selectedStrokeIds)
  const addDrawingStroke = useEditorStore((s) => s.addDrawingStroke)
  const removeDrawingStroke = useEditorStore((s) => s.removeDrawingStroke)
  const selectStrokes = useEditorStore((s) => s.selectStrokes)

  // Throttled cursor update for collaboration - use ref to persist throttle state
  const lastCursorUpdateRef = useRef(0)
  const updateCursorThrottled = useCallback((x: number, y: number, drawing: boolean) => {
    const now = Date.now()
    if (now - lastCursorUpdateRef.current >= 33) { // ~30fps
      lastCursorUpdateRef.current = now
      collaborationService.updateCursor(x, y, drawing)
    }
  }, [])

  // Check if tool is a shape tool
  const isShapeTool = (tool: DrawingTool) => ['line', 'arrow', 'rectangle', 'ellipse'].includes(tool)

  // Get tool-specific settings
  const getToolSettings = useCallback(() => {
    switch (drawingTool) {
      case 'highlighter':
        return { opacity: 0.4, width: drawingWidth * 3 }
      case 'eraser':
        return { opacity: 1, width: drawingWidth * 2, color: 'eraser' }
      case 'laser':
        return { opacity: 0.8, width: 3, color: '#ef4444' }
      case 'line':
      case 'arrow':
        return { opacity: 1, width: drawingWidth }
      case 'rectangle':
      case 'ellipse':
        return { opacity: 1, width: drawingWidth }
      default: // pen
        return { opacity: 1, width: drawingWidth }
    }
  }, [drawingTool, drawingWidth])

  // Draw a single stroke
  const drawStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: DrawingStroke) => {
    const { points, color, width, opacity, type, shapeData, selected } = stroke

    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.globalAlpha = opacity

    // Highlighter blend mode
    if (type === 'highlighter') {
      ctx.globalCompositeOperation = 'multiply'
    } else {
      ctx.globalCompositeOperation = 'source-over'
    }

    // Draw selection highlight if selected
    if (selected || selectedStrokeIds.includes(stroke.id)) {
      ctx.save()
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = width + 4
      ctx.globalAlpha = 0.3
      ctx.setLineDash([5, 5])

      if (shapeData) {
        drawShapeOutline(ctx, type, shapeData)
      } else if (points && points.length >= 2) {
        drawFreeformPath(ctx, points)
      }
      ctx.restore()
    }

    // Draw the actual stroke
    if (shapeData) {
      drawShape(ctx, type, shapeData, color, width)
    } else if (points && points.length >= 2) {
      ctx.beginPath()
      drawFreeformPath(ctx, points)
      ctx.stroke()
    }

    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }, [selectedStrokeIds])

  // Draw freeform path through points
  const drawFreeformPath = (ctx: CanvasRenderingContext2D, points: DrawingPoint[]) => {
    if (points.length === 0) return
    const first = points[0]
    if (!first) return
    ctx.moveTo(first.x, first.y)
    for (let i = 1; i < points.length - 1; i++) {
      const curr = points[i]
      const next = points[i + 1]
      if (!curr || !next) continue
      const xc = (curr.x + next.x) / 2
      const yc = (curr.y + next.y) / 2
      ctx.quadraticCurveTo(curr.x, curr.y, xc, yc)
    }
    const last = points[points.length - 1]
    if (last) {
      ctx.lineTo(last.x, last.y)
    }
  }

  // Draw shape outline for selection
  const drawShapeOutline = (ctx: CanvasRenderingContext2D, type: DrawingTool, shapeData: NonNullable<DrawingStroke['shapeData']>) => {
    const { startX, startY, endX, endY } = shapeData
    ctx.beginPath()

    switch (type) {
      case 'line':
      case 'arrow':
        ctx.moveTo(startX, startY)
        ctx.lineTo(endX, endY)
        break
      case 'rectangle':
        ctx.rect(startX, startY, endX - startX, endY - startY)
        break
      case 'ellipse':
        const cx = (startX + endX) / 2
        const cy = (startY + endY) / 2
        const rx = Math.abs(endX - startX) / 2
        const ry = Math.abs(endY - startY) / 2
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
        break
    }
    ctx.stroke()
  }

  // Draw shape
  const drawShape = (
    ctx: CanvasRenderingContext2D,
    type: DrawingTool,
    shapeData: NonNullable<DrawingStroke['shapeData']>,
    color: string,
    width: number
  ) => {
    const { startX, startY, endX, endY } = shapeData

    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = width

    switch (type) {
      case 'line':
        ctx.moveTo(startX, startY)
        ctx.lineTo(endX, endY)
        ctx.stroke()
        break
      case 'arrow':
        // Draw line
        ctx.moveTo(startX, startY)
        ctx.lineTo(endX, endY)
        ctx.stroke()

        // Draw arrowhead
        const angle = Math.atan2(endY - startY, endX - startX)
        const headLength = Math.max(width * 3, 12)
        ctx.beginPath()
        ctx.moveTo(endX, endY)
        ctx.lineTo(
          endX - headLength * Math.cos(angle - Math.PI / 6),
          endY - headLength * Math.sin(angle - Math.PI / 6)
        )
        ctx.moveTo(endX, endY)
        ctx.lineTo(
          endX - headLength * Math.cos(angle + Math.PI / 6),
          endY - headLength * Math.sin(angle + Math.PI / 6)
        )
        ctx.stroke()
        break
      case 'rectangle':
        ctx.rect(startX, startY, endX - startX, endY - startY)
        ctx.stroke()
        break
      case 'ellipse':
        const cx = (startX + endX) / 2
        const cy = (startY + endY) / 2
        const rx = Math.abs(endX - startX) / 2
        const ry = Math.abs(endY - startY) / 2
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
        ctx.stroke()
        break
    }
  }

  // Redraw all strokes
  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const viewport = getViewport()

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!drawingLayerVisible) return

    ctx.save()
    ctx.translate(viewport.x, viewport.y)
    ctx.scale(viewport.zoom, viewport.zoom)

    // Draw all strokes
    strokes.forEach((stroke) => {
      drawStroke(ctx, stroke)
    })

    // Draw current stroke/shape preview
    if (isDrawing) {
      const settings = getToolSettings()

      if (isShapeTool(drawingTool) && shapeStart && shapeEnd) {
        // Draw shape preview
        drawShape(ctx, drawingTool, {
          startX: shapeStart.x,
          startY: shapeStart.y,
          endX: shapeEnd.x,
          endY: shapeEnd.y,
        }, settings.color || drawingColor, settings.width)
      } else if (currentPoints.length > 1) {
        // Draw freeform preview
        ctx.beginPath()
        ctx.strokeStyle = settings.color || drawingColor
        ctx.lineWidth = settings.width
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.globalAlpha = settings.opacity

        if (drawingTool === 'highlighter') {
          ctx.globalCompositeOperation = 'multiply'
        }

        drawFreeformPath(ctx, currentPoints)
        ctx.stroke()
      }
    }

    ctx.restore()
  }, [strokes, currentPoints, drawingColor, drawingTool, getViewport, getToolSettings, drawingLayerVisible, isDrawing, shapeStart, shapeEnd, drawStroke])

  // Redraw on changes
  useEffect(() => {
    redraw()
  }, [redraw])

  // Clear drawing state when leaving drawing mode
  useEffect(() => {
    if (!drawingMode) {
      // Notify collaborators we're no longer drawing
      collaborationService.updateCursor(null, null, false)
    }
  }, [drawingMode])

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const parent = canvas.parentElement
    if (!parent) return

    const resize = () => {
      const rect = parent.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      redraw()
    }

    resize()
    window.addEventListener('resize', resize)
    const observer = new ResizeObserver(resize)
    observer.observe(parent)

    return () => {
      window.removeEventListener('resize', resize)
      observer.disconnect()
    }
  }, [redraw])

  // Point-based eraser - removes points from strokes like a real eraser
  // When you erase part of a line, it splits the line or shortens it
  const checkEraserHit = useCallback((eraserPoint: DrawingPoint) => {
    const eraserRadius = 12 // Eraser size in flow coordinates

    for (const stroke of strokes) {
      // For shape strokes (line, arrow, rectangle, ellipse), remove entire shape if touched
      if (stroke.shapeData) {
        const { startX, startY, endX, endY } = stroke.shapeData
        let hit = false

        if (stroke.type === 'line' || stroke.type === 'arrow') {
          const dist = distanceToLineSegment(eraserPoint.x, eraserPoint.y, startX, startY, endX, endY)
          hit = dist < eraserRadius + (stroke.width / 2)
        } else {
          // Rectangle/ellipse - check edges
          const minX = Math.min(startX, endX)
          const maxX = Math.max(startX, endX)
          const minY = Math.min(startY, endY)
          const maxY = Math.max(startY, endY)
          const nearTop = Math.abs(eraserPoint.y - minY) < eraserRadius && eraserPoint.x >= minX - eraserRadius && eraserPoint.x <= maxX + eraserRadius
          const nearBottom = Math.abs(eraserPoint.y - maxY) < eraserRadius && eraserPoint.x >= minX - eraserRadius && eraserPoint.x <= maxX + eraserRadius
          const nearLeft = Math.abs(eraserPoint.x - minX) < eraserRadius && eraserPoint.y >= minY - eraserRadius && eraserPoint.y <= maxY + eraserRadius
          const nearRight = Math.abs(eraserPoint.x - maxX) < eraserRadius && eraserPoint.y >= minY - eraserRadius && eraserPoint.y <= maxY + eraserRadius
          hit = nearTop || nearBottom || nearLeft || nearRight
        }

        if (hit) {
          removeDrawingStroke(stroke.id)
          return // Only process one stroke per eraser movement
        }
        continue
      }

      // For freeform strokes, do point-based erasing
      if (stroke.points.length < 2) continue

      // Find which points are hit by the eraser
      const hitIndices: number[] = []
      for (let i = 0; i < stroke.points.length; i++) {
        const p = stroke.points[i]
        if (!p) continue
        const dx = p.x - eraserPoint.x
        const dy = p.y - eraserPoint.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < eraserRadius + (stroke.width / 2)) {
          hitIndices.push(i)
        }
      }

      if (hitIndices.length === 0) continue

      // If all points are hit, remove the entire stroke
      if (hitIndices.length >= stroke.points.length - 1) {
        removeDrawingStroke(stroke.id)
        return
      }

      // Find contiguous segments that are NOT hit (these will become new strokes)
      const remainingSegments: DrawingPoint[][] = []
      let currentSegment: DrawingPoint[] = []

      for (let i = 0; i < stroke.points.length; i++) {
        const point = stroke.points[i]
        if (!point) continue
        if (!hitIndices.includes(i)) {
          currentSegment.push(point)
        } else {
          if (currentSegment.length >= 2) {
            remainingSegments.push([...currentSegment])
          }
          currentSegment = []
        }
      }
      // Don't forget the last segment
      if (currentSegment.length >= 2) {
        remainingSegments.push(currentSegment)
      }

      // Remove the original stroke
      removeDrawingStroke(stroke.id)

      // Add back the remaining segments as new strokes
      for (const segment of remainingSegments) {
        addDrawingStroke({
          id: nanoid(),
          type: stroke.type,
          points: segment,
          color: stroke.color,
          width: stroke.width,
          opacity: stroke.opacity,
          timestamp: Date.now(),
        })
      }

      return // Only process one stroke per eraser movement for performance
    }
  }, [strokes, removeDrawingStroke, addDrawingStroke])

  // Helper: distance from point to line segment
  const distanceToLineSegment = (px: number, py: number, x1: number, y1: number, x2: number, y2: number): number => {
    const dx = x2 - x1
    const dy = y2 - y1
    const lengthSq = dx * dx + dy * dy

    if (lengthSq === 0) {
      return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2)
    }

    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSq))
    const projX = x1 + t * dx
    const projY = y1 + t * dy

    return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2)
  }

  // Check for stroke selection
  const checkStrokeSelection = useCallback((point: DrawingPoint) => {
    const hitRadius = 10

    for (const stroke of strokes) {
      // Check freeform points
      const hit = stroke.points.some((p) => {
        const dx = p.x - point.x
        const dy = p.y - point.y
        return Math.sqrt(dx * dx + dy * dy) < hitRadius
      })

      // Check shape bounds
      if (!hit && stroke.shapeData) {
        const { startX, startY, endX, endY } = stroke.shapeData
        const minX = Math.min(startX, endX) - hitRadius
        const maxX = Math.max(startX, endX) + hitRadius
        const minY = Math.min(startY, endY) - hitRadius
        const maxY = Math.max(startY, endY) + hitRadius

        if (point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY) {
          selectStrokes([stroke.id])
          return
        }
      }

      if (hit) {
        selectStrokes([stroke.id])
        return
      }
    }

    // No hit - clear selection
    selectStrokes([])
  }, [strokes, selectStrokes])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!drawingMode) return

    e.preventDefault()
    e.stopPropagation()

    const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY })
    const point: DrawingPoint = { x: flowPos.x, y: flowPos.y, pressure: e.pressure }

    setIsDrawing(true)

    // Broadcast cursor with drawing=true
    updateCursorThrottled(flowPos.x, flowPos.y, true)

    if (drawingTool === 'select') {
      checkStrokeSelection(point)
      return
    }

    if (drawingTool === 'eraser') {
      checkEraserHit(point)
      return
    }

    if (isShapeTool(drawingTool)) {
      setShapeStart({ x: flowPos.x, y: flowPos.y })
      setShapeEnd({ x: flowPos.x, y: flowPos.y })
    } else {
      setCurrentPoints([point])
    }

    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [drawingMode, screenToFlowPosition, drawingTool, checkEraserHit, checkStrokeSelection, updateCursorThrottled])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY })

    // Always broadcast cursor position when in drawing mode (even if not actively drawing)
    if (drawingMode) {
      updateCursorThrottled(flowPos.x, flowPos.y, isDrawing)
    }

    if (!isDrawing || !drawingMode) return

    e.preventDefault()
    e.stopPropagation()

    const point: DrawingPoint = { x: flowPos.x, y: flowPos.y, pressure: e.pressure }

    if (drawingTool === 'eraser') {
      checkEraserHit(point)
    } else if (isShapeTool(drawingTool)) {
      setShapeEnd({ x: flowPos.x, y: flowPos.y })
    } else if (drawingTool !== 'select') {
      setCurrentPoints((prev) => [...prev, point])
    }
  }, [isDrawing, drawingMode, screenToFlowPosition, drawingTool, checkEraserHit, updateCursorThrottled])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDrawing) return

    e.preventDefault()
    e.stopPropagation()

    // Broadcast cursor with drawing=false
    const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY })
    updateCursorThrottled(flowPos.x, flowPos.y, false)

    setIsDrawing(false)

    // Don't save eraser, laser, or select strokes
    if (['eraser', 'laser', 'select'].includes(drawingTool)) {
      setCurrentPoints([])
      setShapeStart(null)
      setShapeEnd(null)
      return
    }

    const settings = getToolSettings()

    if (isShapeTool(drawingTool) && shapeStart && shapeEnd) {
      // Save shape
      addDrawingStroke({
        id: nanoid(),
        type: drawingTool,
        points: [
          { x: shapeStart.x, y: shapeStart.y },
          { x: shapeEnd.x, y: shapeEnd.y },
        ],
        color: settings.color || drawingColor,
        width: settings.width,
        opacity: settings.opacity,
        timestamp: Date.now(),
        shapeData: {
          startX: shapeStart.x,
          startY: shapeStart.y,
          endX: shapeEnd.x,
          endY: shapeEnd.y,
        },
      })
    } else if (currentPoints.length >= 2) {
      // Save freeform stroke
      addDrawingStroke({
        id: nanoid(),
        type: drawingTool,
        points: currentPoints,
        color: settings.color || drawingColor,
        width: settings.width,
        opacity: settings.opacity,
        timestamp: Date.now(),
      })
    }

    setCurrentPoints([])
    setShapeStart(null)
    setShapeEnd(null)
  }, [isDrawing, currentPoints, drawingColor, drawingTool, addDrawingStroke, getToolSettings, shapeStart, shapeEnd])

  // Create pen cursor SVG data URL - pen tip pointing down-left
  const createPenCursor = useCallback((color: string, size: number = 4) => {
    // Create a pen/pencil cursor with the tip at bottom-left
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <g transform="rotate(-45, 12, 12)">
        <rect x="10" y="2" width="4" height="16" rx="1" fill="${color}" stroke="white" stroke-width="0.5"/>
        <polygon points="10,18 12,22 14,18" fill="${color}" stroke="white" stroke-width="0.5"/>
      </g>
      <circle cx="3" cy="21" r="${Math.min(size, 4)}" fill="${color}" stroke="white" stroke-width="1"/>
    </svg>`
    return `url('data:image/svg+xml,${encodeURIComponent(svg)}') 3 21, crosshair`
  }, [])

  // Create eraser cursor - rectangular block eraser
  const createEraserCursor = useCallback(() => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <rect x="4" y="8" width="16" height="12" rx="2" fill="white" stroke="#666" stroke-width="1.5"/>
      <rect x="4" y="16" width="16" height="4" rx="1" fill="#e5e7eb"/>
      <line x1="4" y1="16" x2="20" y2="16" stroke="#9ca3af" stroke-width="1"/>
    </svg>`
    return `url('data:image/svg+xml,${encodeURIComponent(svg)}') 12 20, crosshair`
  }, [])

  // Create highlighter cursor
  const createHighlighterCursor = useCallback((color: string) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <g transform="rotate(-45, 12, 12)">
        <rect x="9" y="2" width="6" height="14" rx="1" fill="${color}" fill-opacity="0.7" stroke="white" stroke-width="0.5"/>
        <rect x="9" y="16" width="6" height="3" fill="${color}" stroke="white" stroke-width="0.5"/>
      </g>
      <circle cx="3" cy="21" r="4" fill="${color}" fill-opacity="0.5" stroke="white" stroke-width="1"/>
    </svg>`
    return `url('data:image/svg+xml,${encodeURIComponent(svg)}') 3 21, crosshair`
  }, [])

  // Get cursor based on tool
  const getCursor = useCallback(() => {
    if (!drawingMode) return 'default'
    switch (drawingTool) {
      case 'select':
        return 'default'
      case 'eraser':
        return createEraserCursor()
      case 'highlighter':
        return createHighlighterCursor(drawingColor)
      case 'text':
        return 'text'
      case 'line':
      case 'arrow':
      case 'rectangle':
      case 'ellipse':
        return 'crosshair'
      case 'pen':
      default:
        return createPenCursor(drawingColor, drawingWidth)
    }
  }, [drawingMode, drawingTool, drawingColor, drawingWidth, createPenCursor, createEraserCursor, createHighlighterCursor])

  // Determine if we should capture pointer events on the canvas
  // Only capture when using actual drawing tools, not select tool
  // Note: 'text' is NOT included - text nodes are React Flow nodes and need normal interaction
  const isDrawingToolActive = ['pen', 'highlighter', 'eraser', 'line', 'arrow', 'rectangle', 'ellipse', 'laser'].includes(drawingTool)
  const shouldCapturePointer = drawingMode && isDrawingToolActive

  if (!drawingMode && strokes.length === 0) return null

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 touch-none"
      style={{
        cursor: getCursor(),
        // Only capture pointer events when using drawing tools
        // This allows clicking on nodes (like sticky notes) when using select tool
        pointerEvents: shouldCapturePointer ? 'auto' : 'none',
        zIndex: drawingMode ? 30 : 10,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    />
  )
}
