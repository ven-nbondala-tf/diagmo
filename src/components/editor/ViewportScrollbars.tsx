import { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import { useReactFlow } from '@xyflow/react'
import type { DiagramNode } from '@/types'

interface ViewportScrollbarsProps {
  nodes: DiagramNode[]
}

export function ViewportScrollbars({ nodes }: ViewportScrollbarsProps) {
  const { getViewport, setViewport, getNodesBounds } = useReactFlow()
  const [viewport, setLocalViewport] = useState(getViewport())
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const isDraggingH = useRef(false)
  const isDraggingV = useRef(false)
  const dragStartX = useRef(0)
  const dragStartY = useRef(0)

  // Update viewport state when it changes
  useEffect(() => {
    const interval = setInterval(() => {
      const vp = getViewport()
      setLocalViewport(vp)
    }, 50)
    return () => clearInterval(interval)
  }, [getViewport])

  // Get container size
  useEffect(() => {
    const updateSize = () => {
      const container = document.querySelector('.react-flow')
      if (container) {
        setContainerSize({
          width: container.clientWidth,
          height: container.clientHeight,
        })
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Calculate all scroll-related values
  const scrollData = useMemo(() => {
    if (nodes.length === 0 || containerSize.width === 0) {
      return null
    }

    const bounds = getNodesBounds(nodes)
    const padding = 50

    const contentMinX = bounds.x - padding
    const contentMaxX = bounds.x + bounds.width + padding
    const contentMinY = bounds.y - padding
    const contentMaxY = bounds.y + bounds.height + padding

    const visibleWidth = containerSize.width / viewport.zoom
    const visibleHeight = containerSize.height / viewport.zoom
    const viewX = -viewport.x / viewport.zoom
    const viewY = -viewport.y / viewport.zoom

    const totalMinX = Math.min(contentMinX, viewX)
    const totalMaxX = Math.max(contentMaxX, viewX + visibleWidth)
    const totalMinY = Math.min(contentMinY, viewY)
    const totalMaxY = Math.max(contentMaxY, viewY + visibleHeight)
    const totalWidth = totalMaxX - totalMinX
    const totalHeight = totalMaxY - totalMinY

    const needsHorizontalScroll = totalWidth > visibleWidth * 1.1
    const needsVerticalScroll = totalHeight > visibleHeight * 1.1

    if (!needsHorizontalScroll && !needsVerticalScroll) {
      return null
    }

    const hThumbRatio = Math.min(1, visibleWidth / totalWidth)
    const vThumbRatio = Math.min(1, visibleHeight / totalHeight)

    const hThumbPos = totalWidth > visibleWidth ? (viewX - totalMinX) / (totalWidth - visibleWidth) : 0
    const vThumbPos = totalHeight > visibleHeight ? (viewY - totalMinY) / (totalHeight - visibleHeight) : 0

    const hTrackWidth = containerSize.width - 80
    const vTrackHeight = containerSize.height - 120

    const hThumbWidth = Math.max(30, hThumbRatio * hTrackWidth)
    const vThumbHeight = Math.max(30, vThumbRatio * vTrackHeight)

    const hThumbLeft = Math.max(0, Math.min(hThumbPos * (hTrackWidth - hThumbWidth), hTrackWidth - hThumbWidth))
    const vThumbTop = Math.max(0, Math.min(vThumbPos * (vTrackHeight - vThumbHeight), vTrackHeight - vThumbHeight))

    return {
      needsHorizontalScroll,
      needsVerticalScroll,
      hTrackWidth,
      vTrackHeight,
      hThumbWidth,
      vThumbHeight,
      hThumbLeft,
      vThumbTop,
      totalMinX,
      totalMinY,
      totalWidth,
      totalHeight,
      visibleWidth,
      visibleHeight,
    }
  }, [nodes, containerSize, viewport])

  // Handle horizontal thumb drag
  const handleHMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollData) return
    e.preventDefault()
    isDraggingH.current = true
    dragStartX.current = e.clientX

    const { hTrackWidth, hThumbWidth, totalMinX, totalWidth, visibleWidth } = scrollData

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingH.current) return
      const deltaX = moveEvent.clientX - dragStartX.current
      const currentViewport = getViewport()
      const scrollRatio = deltaX / (hTrackWidth - hThumbWidth)
      const newViewX = totalMinX + scrollRatio * (totalWidth - visibleWidth)
      setViewport({ x: -newViewX * currentViewport.zoom, y: currentViewport.y, zoom: currentViewport.zoom })
    }

    const handleMouseUp = () => {
      isDraggingH.current = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [scrollData, getViewport, setViewport])

  // Handle vertical thumb drag
  const handleVMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollData) return
    e.preventDefault()
    isDraggingV.current = true
    dragStartY.current = e.clientY

    const { vTrackHeight, vThumbHeight, totalMinY, totalHeight, visibleHeight } = scrollData

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingV.current) return
      const deltaY = moveEvent.clientY - dragStartY.current
      const currentViewport = getViewport()
      const scrollRatio = deltaY / (vTrackHeight - vThumbHeight)
      const newViewY = totalMinY + scrollRatio * (totalHeight - visibleHeight)
      setViewport({ x: currentViewport.x, y: -newViewY * currentViewport.zoom, zoom: currentViewport.zoom })
    }

    const handleMouseUp = () => {
      isDraggingV.current = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [scrollData, getViewport, setViewport])

  // Early return after all hooks
  if (!scrollData) return null

  const {
    needsHorizontalScroll,
    needsVerticalScroll,
    hTrackWidth,
    vTrackHeight,
    hThumbWidth,
    vThumbHeight,
    hThumbLeft,
    vThumbTop,
  } = scrollData

  return (
    <>
      {/* Horizontal scrollbar */}
      {needsHorizontalScroll && (
        <div
          className="absolute bottom-2 left-4 h-2.5 rounded-full bg-black/10 dark:bg-white/10 z-10"
          style={{ width: hTrackWidth }}
        >
          <div
            className="absolute top-0 h-full rounded-full bg-black/30 dark:bg-white/30 hover:bg-black/40 dark:hover:bg-white/40 cursor-pointer transition-colors"
            style={{
              left: hThumbLeft,
              width: hThumbWidth,
            }}
            onMouseDown={handleHMouseDown}
          />
        </div>
      )}

      {/* Vertical scrollbar */}
      {needsVerticalScroll && (
        <div
          className="absolute right-2 top-12 w-2.5 rounded-full bg-black/10 dark:bg-white/10 z-10"
          style={{ height: vTrackHeight }}
        >
          <div
            className="absolute left-0 w-full rounded-full bg-black/30 dark:bg-white/30 hover:bg-black/40 dark:hover:bg-white/40 cursor-pointer transition-colors"
            style={{
              top: vThumbTop,
              height: vThumbHeight,
            }}
            onMouseDown={handleVMouseDown}
          />
        </div>
      )}
    </>
  )
}
