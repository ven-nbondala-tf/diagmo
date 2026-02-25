import { useRef, useEffect, useCallback, useState } from 'react'
import { useReactFlow } from '@xyflow/react'
import { useEditorStore } from '@/stores/editorStore'
import { Button } from '@/components/ui'
import { Camera, CameraOff, RefreshCw, X, Grip, Shapes } from 'lucide-react'
import { nanoid } from 'nanoid'
import { cn } from '@/utils/cn'
import type { DrawingPoint } from '@/types'

// MediaPipe Hands CDN
const MEDIAPIPE_HANDS_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands'
const MEDIAPIPE_CAMERA_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils'

// Finger landmark indices
const FINGER_TIPS = {
  THUMB: 4,
  INDEX: 8,
  MIDDLE: 12,
  RING: 16,
  PINKY: 20,
}

const FINGER_PIPS = {
  THUMB: 3,
  INDEX: 6,
  MIDDLE: 10,
  RING: 14,
  PINKY: 18,
}

// Smoothing and precision settings - AGGRESSIVE for hand tracking stability
const SMOOTHING_FACTOR = 0.08 // Very low = very smooth (was 0.3)
const MIN_DISTANCE_THRESHOLD = 15 // Larger = fewer points, smoother lines (was 3)
const STRAIGHT_LINE_THRESHOLD = 0.2 // Radians - how close to 0/90/180/270 to snap
const SIMPLIFY_TOLERANCE = 5 // RDP simplification tolerance in pixels (was 2)
const POSITION_HISTORY_SIZE = 5 // Number of frames to average for extra smoothing
const DRAWING_START_DELAY = 3 // Frames to wait before starting to draw (stabilization)

// Shape recognition settings
const SHAPE_RECOGNITION_ENABLED = true
const CLOSURE_THRESHOLD = 30 // Max distance between start/end to consider closed shape
const RECTANGLE_ANGLE_TOLERANCE = 0.25 // Radians (~14 degrees) tolerance for 90-degree corners
const CIRCLE_VARIANCE_THRESHOLD = 0.15 // Max variance from average radius (as ratio)
const MIN_SHAPE_SIZE = 20 // Minimum size to attempt shape recognition

interface HandLandmarks {
  x: number
  y: number
  z: number
}

interface SmoothedPosition {
  x: number
  y: number
  rawX: number
  rawY: number
}

interface PositionHistoryItem {
  x: number
  y: number
  timestamp: number
}

// Ramer-Douglas-Peucker line simplification algorithm
function simplifyLine(points: DrawingPoint[], tolerance: number): DrawingPoint[] {
  if (points.length <= 2) return points

  // Find the point with maximum distance from line between first and last
  let maxDist = 0
  let maxIndex = 0
  const start = points[0]
  const end = points[points.length - 1]

  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistance(points[i], start, end)
    if (dist > maxDist) {
      maxDist = dist
      maxIndex = i
    }
  }

  // If max distance is greater than tolerance, recursively simplify
  if (maxDist > tolerance) {
    const left = simplifyLine(points.slice(0, maxIndex + 1), tolerance)
    const right = simplifyLine(points.slice(maxIndex), tolerance)
    return [...left.slice(0, -1), ...right]
  }

  // All points are within tolerance, return just endpoints
  return [start, end]
}

function perpendicularDistance(point: DrawingPoint, lineStart: DrawingPoint, lineEnd: DrawingPoint): number {
  const dx = lineEnd.x - lineStart.x
  const dy = lineEnd.y - lineStart.y
  const lineLengthSq = dx * dx + dy * dy

  if (lineLengthSq === 0) {
    return Math.sqrt((point.x - lineStart.x) ** 2 + (point.y - lineStart.y) ** 2)
  }

  const t = Math.max(0, Math.min(1, ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lineLengthSq))
  const projX = lineStart.x + t * dx
  const projY = lineStart.y + t * dy

  return Math.sqrt((point.x - projX) ** 2 + (point.y - projY) ** 2)
}

// Shape recognition types
type RecognizedShape =
  | { type: 'rectangle'; points: DrawingPoint[]; bounds: { x: number; y: number; width: number; height: number } }
  | { type: 'circle'; center: { x: number; y: number }; radius: number }
  | { type: 'triangle'; points: DrawingPoint[] }
  | { type: 'line'; start: DrawingPoint; end: DrawingPoint }
  | { type: 'arrow'; start: DrawingPoint; end: DrawingPoint }
  | null

// Calculate centroid of points
function getCentroid(points: DrawingPoint[]): { x: number; y: number } {
  const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 })
  return { x: sum.x / points.length, y: sum.y / points.length }
}

// Calculate bounding box
function getBoundingBox(points: DrawingPoint[]): { x: number; y: number; width: number; height: number } {
  const xs = points.map(p => p.x)
  const ys = points.map(p => p.y)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const maxX = Math.max(...xs)
  const maxY = Math.max(...ys)
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}

// Check if shape is closed (start and end points are close)
function isClosedShape(points: DrawingPoint[]): boolean {
  if (points.length < 3) return false
  const start = points[0]
  const end = points[points.length - 1]
  const distance = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2)
  return distance < CLOSURE_THRESHOLD
}

// Detect corners in the stroke using angle changes
function detectCorners(points: DrawingPoint[], angleThreshold: number = Math.PI / 4): number[] {
  if (points.length < 5) return []

  const corners: number[] = [0] // Start is always a corner
  const windowSize = 3

  for (let i = windowSize; i < points.length - windowSize; i++) {
    const prev = points[i - windowSize]
    const curr = points[i]
    const next = points[i + windowSize]

    const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x)
    const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x)

    let angleDiff = Math.abs(angle2 - angle1)
    if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff

    if (angleDiff > angleThreshold) {
      // Check if this corner is far enough from the last detected corner
      const lastCorner = corners[corners.length - 1]
      if (i - lastCorner > windowSize * 2) {
        corners.push(i)
      }
    }
  }

  corners.push(points.length - 1) // End is always a corner
  return corners
}

// Check if a shape is a rectangle (4 corners with ~90 degree angles)
function isRectangle(points: DrawingPoint[], corners: number[]): boolean {
  if (corners.length !== 5) return false // 4 corners + closing point

  // Check if the 4 corner angles are close to 90 degrees
  for (let i = 1; i < 4; i++) {
    const prev = points[corners[i - 1]]
    const curr = points[corners[i]]
    const next = points[corners[i + 1]]

    const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x)
    const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x)

    let angleDiff = Math.abs(angle2 - angle1)
    if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff

    // Should be close to 90 degrees (PI/2)
    const diff90 = Math.abs(angleDiff - Math.PI / 2)
    if (diff90 > RECTANGLE_ANGLE_TOLERANCE) return false
  }

  return true
}

// Check if a shape is a circle/ellipse
function isCircle(points: DrawingPoint[]): boolean {
  if (points.length < 8) return false
  if (!isClosedShape(points)) return false

  const centroid = getCentroid(points)
  const distances = points.map(p =>
    Math.sqrt((p.x - centroid.x) ** 2 + (p.y - centroid.y) ** 2)
  )

  const avgRadius = distances.reduce((a, b) => a + b, 0) / distances.length
  if (avgRadius < MIN_SHAPE_SIZE / 2) return false

  // Check variance in radius
  const maxDeviation = Math.max(...distances.map(d => Math.abs(d - avgRadius)))
  const variance = maxDeviation / avgRadius

  return variance < CIRCLE_VARIANCE_THRESHOLD
}

// Check if a shape is a triangle (3 corners)
function isTriangle(corners: number[]): boolean {
  return corners.length === 4 // 3 corners + closing point
}

// Recognize shape from points
function recognizeShape(points: DrawingPoint[]): RecognizedShape {
  if (!SHAPE_RECOGNITION_ENABLED) return null
  if (points.length < 3) return null

  const bounds = getBoundingBox(points)
  if (bounds.width < MIN_SHAPE_SIZE && bounds.height < MIN_SHAPE_SIZE) return null

  const closed = isClosedShape(points)

  // Check for circle first (before corner detection)
  if (closed && isCircle(points)) {
    const centroid = getCentroid(points)
    const distances = points.map(p =>
      Math.sqrt((p.x - centroid.x) ** 2 + (p.y - centroid.y) ** 2)
    )
    const avgRadius = distances.reduce((a, b) => a + b, 0) / distances.length

    return {
      type: 'circle',
      center: centroid,
      radius: avgRadius,
    }
  }

  // Detect corners
  const corners = detectCorners(points)

  // Check for rectangle
  if (closed && isRectangle(points, corners)) {
    // Create perfect rectangle from bounding box
    const pressure = points[0].pressure
    return {
      type: 'rectangle',
      bounds,
      points: [
        { x: bounds.x, y: bounds.y, pressure },
        { x: bounds.x + bounds.width, y: bounds.y, pressure },
        { x: bounds.x + bounds.width, y: bounds.y + bounds.height, pressure },
        { x: bounds.x, y: bounds.y + bounds.height, pressure },
        { x: bounds.x, y: bounds.y, pressure }, // Close the shape
      ],
    }
  }

  // Check for triangle
  if (closed && isTriangle(corners)) {
    const pressure = points[0].pressure
    const cornerPoints = corners.slice(0, 3).map(i => points[i])
    return {
      type: 'triangle',
      points: [
        ...cornerPoints,
        cornerPoints[0], // Close the shape
      ].map(p => ({ ...p, pressure })),
    }
  }

  // Check for line (not closed, mostly straight)
  if (!closed && corners.length <= 2) {
    const start = points[0]
    const end = points[points.length - 1]
    const directDistance = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2)

    if (directDistance >= MIN_SHAPE_SIZE) {
      // Calculate path length
      let pathLength = 0
      for (let i = 1; i < points.length; i++) {
        pathLength += Math.sqrt(
          (points[i].x - points[i-1].x) ** 2 +
          (points[i].y - points[i-1].y) ** 2
        )
      }

      // If path is close to direct distance, it's a straight line
      if (pathLength / directDistance < 1.2) {
        return {
          type: 'line',
          start,
          end,
        }
      }
    }
  }

  return null
}

// Convert recognized shape to drawing stroke points
function shapeToStrokePoints(shape: RecognizedShape): DrawingPoint[] | null {
  if (!shape) return null

  const pressure = 0.5

  switch (shape.type) {
    case 'rectangle':
      return shape.points

    case 'triangle':
      return shape.points

    case 'circle': {
      // Generate circle points
      const numPoints = 36
      const points: DrawingPoint[] = []
      for (let i = 0; i <= numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2
        points.push({
          x: shape.center.x + shape.radius * Math.cos(angle),
          y: shape.center.y + shape.radius * Math.sin(angle),
          pressure,
        })
      }
      return points
    }

    case 'line':
      return [shape.start, shape.end]

    case 'arrow':
      return [shape.start, shape.end]

    default:
      return null
  }
}

// Detect if stroke is mostly a straight line and snap to it
function snapToStraightLine(points: DrawingPoint[]): DrawingPoint[] {
  if (points.length < 2) return points

  const start = points[0]
  const end = points[points.length - 1]
  const dx = end.x - start.x
  const dy = end.y - start.y
  const angle = Math.atan2(dy, dx)

  // Check if angle is close to 0, 90, 180, or 270 degrees
  const snapAngles = [0, Math.PI / 2, Math.PI, -Math.PI / 2, -Math.PI]

  for (const snapAngle of snapAngles) {
    if (Math.abs(angle - snapAngle) < STRAIGHT_LINE_THRESHOLD) {
      // Snap to this angle
      const length = Math.sqrt(dx * dx + dy * dy)
      const snappedEnd = {
        x: start.x + length * Math.cos(snapAngle),
        y: start.y + length * Math.sin(snapAngle),
        pressure: end.pressure,
      }
      return [start, snappedEnd]
    }
  }

  // Check if points form a mostly straight line (low variance from direct line)
  const totalLength = Math.sqrt(dx * dx + dy * dy)
  if (totalLength < 20) return points // Too short to straighten

  let maxDeviation = 0
  for (const point of points) {
    const dist = perpendicularDistance(point, start, end)
    maxDeviation = Math.max(maxDeviation, dist)
  }

  // If deviation is very low relative to length, make it straight
  if (maxDeviation < totalLength * 0.05) {
    return [start, end]
  }

  return points
}

export function AirCanvas() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const handsRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const currentStrokeRef = useRef<DrawingPoint[]>([])
  const smoothedPositionRef = useRef<SmoothedPosition | null>(null)
  const lastAddedPointRef = useRef<{ x: number; y: number } | null>(null)
  const positionHistoryRef = useRef<PositionHistoryItem[]>([])
  const drawingFrameCountRef = useRef<number>(0) // Count frames since drawing started

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(true)
  const [straightLineMode, setStraightLineMode] = useState(false)
  const [shapeRecognitionEnabled, setShapeRecognitionEnabled] = useState(true)

  const { screenToFlowPosition } = useReactFlow()

  const airCanvasEnabled = useEditorStore((s) => s.airCanvasEnabled)
  const drawingColor = useEditorStore((s) => s.drawingColor)
  const drawingWidth = useEditorStore((s) => s.drawingWidth)
  const addDrawingStroke = useEditorStore((s) => s.addDrawingStroke)
  const setAirCanvasCalibrated = useEditorStore((s) => s.setAirCanvasCalibrated)
  const toggleAirCanvas = useEditorStore((s) => s.toggleAirCanvas)
  const setHandPosition = useEditorStore((s) => s.setHandPosition)
  const setIsHandDrawing = useEditorStore((s) => s.setIsHandDrawing)

  // Smooth position using multi-stage filtering for maximum stability
  const smoothPosition = useCallback((rawX: number, rawY: number): { x: number; y: number } => {
    const now = Date.now()

    // Add to position history
    positionHistoryRef.current.push({ x: rawX, y: rawY, timestamp: now })

    // Keep only recent positions
    if (positionHistoryRef.current.length > POSITION_HISTORY_SIZE) {
      positionHistoryRef.current.shift()
    }

    // Calculate moving average from history
    const history = positionHistoryRef.current
    let avgX = 0
    let avgY = 0
    for (const pos of history) {
      avgX += pos.x
      avgY += pos.y
    }
    avgX /= history.length
    avgY /= history.length

    // Apply EMA on top of moving average for extra smoothness
    const prev = smoothedPositionRef.current

    if (!prev) {
      smoothedPositionRef.current = { x: avgX, y: avgY, rawX, rawY }
      return { x: avgX, y: avgY }
    }

    // Exponential moving average with very low factor for stability
    const smoothedX = prev.x + SMOOTHING_FACTOR * (avgX - prev.x)
    const smoothedY = prev.y + SMOOTHING_FACTOR * (avgY - prev.y)

    smoothedPositionRef.current = { x: smoothedX, y: smoothedY, rawX, rawY }
    return { x: smoothedX, y: smoothedY }
  }, [])

  // Check if point should be added (minimum distance threshold)
  const shouldAddPoint = useCallback((x: number, y: number): boolean => {
    const lastPoint = lastAddedPointRef.current
    if (!lastPoint) return true

    const distance = Math.sqrt((x - lastPoint.x) ** 2 + (y - lastPoint.y) ** 2)
    return distance >= MIN_DISTANCE_THRESHOLD
  }, [])

  // Finalize and save stroke with optimizations
  const finalizeStroke = useCallback(() => {
    if (currentStrokeRef.current.length < 2) {
      currentStrokeRef.current = []
      return
    }

    let points = [...currentStrokeRef.current]
    let strokeType: 'pen' | 'line' | 'rectangle' | 'ellipse' | 'arrow' = 'pen'

    // Apply straight line snapping if enabled
    if (straightLineMode) {
      points = [points[0], points[points.length - 1]]
      strokeType = 'line'
    } else if (shapeRecognitionEnabled) {
      // Try shape recognition
      const recognizedShape = recognizeShape(points)

      if (recognizedShape) {
        const shapePoints = shapeToStrokePoints(recognizedShape)
        if (shapePoints) {
          points = shapePoints

          // Set stroke type based on recognized shape
          switch (recognizedShape.type) {
            case 'rectangle':
              strokeType = 'rectangle'
              break
            case 'circle':
              strokeType = 'ellipse'
              break
            case 'line':
              strokeType = 'line'
              break
            case 'arrow':
              strokeType = 'arrow'
              break
            case 'triangle':
              // Triangle stays as pen with simplified points
              strokeType = 'pen'
              break
          }
        }
      } else {
        // No shape recognized - try straight line snap or simplify
        points = snapToStraightLine(points)

        if (points.length > 2) {
          points = simplifyLine(points, SIMPLIFY_TOLERANCE)
        }
      }
    } else {
      // Just simplify without shape recognition
      points = snapToStraightLine(points)

      if (points.length > 2) {
        points = simplifyLine(points, SIMPLIFY_TOLERANCE)
      }
    }

    addDrawingStroke({
      id: nanoid(),
      type: strokeType,
      points,
      color: drawingColor,
      width: drawingWidth,
      opacity: 1,
      timestamp: Date.now(),
    })

    currentStrokeRef.current = []
    lastAddedPointRef.current = null
  }, [addDrawingStroke, drawingColor, drawingWidth, straightLineMode, shapeRecognitionEnabled])

  // Detect gesture from landmarks
  const detectGesture = useCallback((landmarks: HandLandmarks[]): 'draw' | 'move' | 'erase' | 'stop' => {
    if (!landmarks || landmarks.length < 21) return 'stop'

    // Check if fingers are up (tip y < pip y means finger is extended)
    const indexUp = landmarks[FINGER_TIPS.INDEX].y < landmarks[FINGER_PIPS.INDEX].y
    const middleUp = landmarks[FINGER_TIPS.MIDDLE].y < landmarks[FINGER_PIPS.MIDDLE].y
    const ringUp = landmarks[FINGER_TIPS.RING].y < landmarks[FINGER_PIPS.RING].y
    const pinkyUp = landmarks[FINGER_TIPS.PINKY].y < landmarks[FINGER_PIPS.PINKY].y

    // Index only = DRAW
    if (indexUp && !middleUp && !ringUp && !pinkyUp) {
      return 'draw'
    }

    // Index + Middle = MOVE (pointer without drawing)
    if (indexUp && middleUp && !ringUp && !pinkyUp) {
      return 'move'
    }

    // Pinch (thumb and index close) = ERASE
    const thumbTip = landmarks[FINGER_TIPS.THUMB]
    const indexTip = landmarks[FINGER_TIPS.INDEX]
    const pinchDistance = Math.sqrt(
      Math.pow(thumbTip.x - indexTip.x, 2) +
      Math.pow(thumbTip.y - indexTip.y, 2)
    )
    if (pinchDistance < 0.05) {
      return 'erase'
    }

    // Closed fist or other = STOP
    return 'stop'
  }, [])

  // Draw hand landmarks visualization
  const drawHandLandmarks = useCallback((
    ctx: CanvasRenderingContext2D,
    landmarks: HandLandmarks[],
    width: number,
    height: number
  ) => {
    // Draw connections
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // Index
      [0, 9], [9, 10], [10, 11], [11, 12], // Middle
      [0, 13], [13, 14], [14, 15], [15, 16], // Ring
      [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
      [5, 9], [9, 13], [13, 17], // Palm
    ]

    ctx.strokeStyle = '#22c55e'
    ctx.lineWidth = 2

    connections.forEach(([start, end]) => {
      const startLm = landmarks[start]
      const endLm = landmarks[end]
      ctx.beginPath()
      ctx.moveTo((1 - startLm.x) * width, startLm.y * height)
      ctx.lineTo((1 - endLm.x) * width, endLm.y * height)
      ctx.stroke()
    })

    // Draw landmarks
    landmarks.forEach((lm, i) => {
      const x = (1 - lm.x) * width
      const y = lm.y * height

      ctx.beginPath()
      ctx.arc(x, y, i === FINGER_TIPS.INDEX ? 8 : 4, 0, Math.PI * 2)
      ctx.fillStyle = i === FINGER_TIPS.INDEX ? '#3b82f6' : '#22c55e'
      ctx.fill()
    })
  }, [])

  // Process hand detection results
  const onResults = useCallback((results: any) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    // Clear preview canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw video frame if preview is enabled
    if (showPreview && videoRef.current) {
      ctx.save()
      ctx.scale(-1, 1) // Mirror
      ctx.drawImage(videoRef.current, -canvas.width, 0, canvas.width, canvas.height)
      ctx.restore()
    }

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0]
      const gesture = detectGesture(landmarks)

      // Get index finger tip position
      const indexTip = landmarks[FINGER_TIPS.INDEX]

      // Convert to screen coordinates (mirrored)
      const rawScreenX = (1 - indexTip.x) * window.innerWidth
      const rawScreenY = indexTip.y * window.innerHeight

      // Apply smoothing for stable cursor
      const smoothed = smoothPosition(rawScreenX, rawScreenY)

      // Update hand position for cursor
      setHandPosition({ x: smoothed.x, y: smoothed.y })

      // Draw hand landmarks on preview
      if (showPreview) {
        drawHandLandmarks(ctx, landmarks, canvas.width, canvas.height)
      }

      // Handle gestures
      if (gesture === 'draw') {
        // Increment frame count for drawing stabilization
        drawingFrameCountRef.current++

        // Wait a few frames before starting to draw (stabilization period)
        if (drawingFrameCountRef.current <= DRAWING_START_DELAY) {
          setIsHandDrawing(true)
          return // Don't add points during stabilization
        }

        setIsHandDrawing(true)

        // Convert to flow coordinates
        const flowPos = screenToFlowPosition({ x: smoothed.x, y: smoothed.y })

        // Only add point if moved enough distance (reduces jitter)
        if (shouldAddPoint(flowPos.x, flowPos.y)) {
          currentStrokeRef.current.push({
            x: flowPos.x,
            y: flowPos.y,
            pressure: 0.5
          })
          lastAddedPointRef.current = { x: flowPos.x, y: flowPos.y }
        }
      } else {
        // Not drawing - save stroke if we have points
        if (currentStrokeRef.current.length >= 2) {
          finalizeStroke()
        }
        currentStrokeRef.current = []
        lastAddedPointRef.current = null
        drawingFrameCountRef.current = 0 // Reset frame count
        setIsHandDrawing(false)

        // Reset smoothing and history when not drawing for faster response
        if (gesture === 'stop') {
          smoothedPositionRef.current = null
          positionHistoryRef.current = []
        }
      }
    } else {
      // No hand detected
      setHandPosition(null)
      setIsHandDrawing(false)
      smoothedPositionRef.current = null
      positionHistoryRef.current = []
      drawingFrameCountRef.current = 0

      // Save any pending stroke
      if (currentStrokeRef.current.length >= 2) {
        finalizeStroke()
      }
      currentStrokeRef.current = []
      lastAddedPointRef.current = null
    }
  }, [showPreview, detectGesture, screenToFlowPosition, setHandPosition, setIsHandDrawing, smoothPosition, shouldAddPoint, finalizeStroke, drawHandLandmarks])

  // Initialize MediaPipe
  useEffect(() => {
    if (!airCanvasEnabled) return

    let mounted = true

    const initMediaPipe = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Dynamically load MediaPipe scripts
        await loadScript(`${MEDIAPIPE_HANDS_CDN}/hands.js`)
        await loadScript(`${MEDIAPIPE_CAMERA_CDN}/camera_utils.js`)

        // Wait for scripts to load
        await new Promise(resolve => setTimeout(resolve, 500))

        if (!mounted) return

        // @ts-ignore - MediaPipe global
        const Hands = window.Hands
        // @ts-ignore
        const Camera = window.Camera

        if (!Hands || !Camera) {
          throw new Error('MediaPipe failed to load')
        }

        // Initialize Hands
        const hands = new Hands({
          locateFile: (file: string) => `${MEDIAPIPE_HANDS_CDN}/${file}`,
        })

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.5,
        })

        hands.onResults(onResults)
        handsRef.current = hands

        // Initialize camera
        const video = videoRef.current
        if (!video) throw new Error('Video element not found')

        const camera = new Camera(video, {
          onFrame: async () => {
            if (handsRef.current) {
              await handsRef.current.send({ image: video })
            }
          },
          width: 640,
          height: 480,
        })

        cameraRef.current = camera
        await camera.start()

        setIsLoading(false)
        setAirCanvasCalibrated(true)
      } catch (err) {
        console.error('MediaPipe init error:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize camera')
        setIsLoading(false)
      }
    }

    initMediaPipe()

    return () => {
      mounted = false
      if (cameraRef.current) {
        cameraRef.current.stop()
      }
      if (handsRef.current) {
        handsRef.current.close()
      }
    }
  }, [airCanvasEnabled, onResults, setAirCanvasCalibrated])

  if (!airCanvasEnabled) return null

  return (
    <>
      {/* Hidden video element for camera feed */}
      <video
        ref={videoRef}
        className="hidden"
        autoPlay
        playsInline
        muted
      />

      {/* Camera preview overlay */}
      <div className="absolute top-4 right-4 z-50">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Preview header */}
          <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Air Canvas
            </span>
            <div className="flex items-center gap-1">
              {/* Shape recognition toggle */}
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-7 w-7 p-0',
                  shapeRecognitionEnabled && 'bg-green-100 text-green-600'
                )}
                onClick={() => setShapeRecognitionEnabled(!shapeRecognitionEnabled)}
                title={shapeRecognitionEnabled ? 'Shape recognition ON' : 'Shape recognition OFF'}
              >
                <Shapes className="h-4 w-4" />
              </Button>
              {/* Straight line mode toggle */}
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-7 w-7 p-0',
                  straightLineMode && 'bg-blue-100 text-blue-600'
                )}
                onClick={() => setStraightLineMode(!straightLineMode)}
                title={straightLineMode ? 'Straight line mode ON' : 'Straight line mode OFF'}
              >
                <Grip className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setShowPreview(!showPreview)}
                title={showPreview ? 'Hide preview' : 'Show preview'}
              >
                {showPreview ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={toggleAirCanvas}
                title="Close Air Canvas"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Preview canvas */}
          {showPreview && (
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={320}
                height={240}
                className="block"
              />

              {/* Loading overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 text-white animate-spin mx-auto mb-2" />
                    <p className="text-white text-sm">Initializing camera...</p>
                  </div>
                </div>
              )}

              {/* Error overlay */}
              {error && (
                <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center p-4">
                  <div className="text-center">
                    <p className="text-white text-sm">{error}</p>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="mt-2"
                      onClick={() => window.location.reload()}
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Gesture guide */}
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-16">Index</span>
                <span>= Draw</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-16">Peace</span>
                <span>= Move</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-16">Pinch</span>
                <span>= Erase</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-16">Fist</span>
                <span>= Stop</span>
              </div>
            </div>
            {(shapeRecognitionEnabled || straightLineMode) && (
              <div className="mt-2 text-xs font-medium space-y-0.5">
                {shapeRecognitionEnabled && (
                  <div className="text-green-600">Shape Recognition ON</div>
                )}
                {straightLineMode && (
                  <div className="text-blue-600">Straight Line Mode ON</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hand cursor indicator */}
      <HandCursor straightLineMode={straightLineMode} shapeRecognitionEnabled={shapeRecognitionEnabled} />
    </>
  )
}

// Hand cursor component that follows hand position
function HandCursor({ straightLineMode, shapeRecognitionEnabled }: { straightLineMode: boolean; shapeRecognitionEnabled: boolean }) {
  const handPosition = useEditorStore((s) => s.handPosition)
  const isHandDrawing = useEditorStore((s) => s.isHandDrawing)
  const drawingColor = useEditorStore((s) => s.drawingColor)

  if (!handPosition) return null

  return (
    <div
      className="fixed pointer-events-none z-[9999]"
      style={{
        left: handPosition.x,
        top: handPosition.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Outer ring */}
      <div
        className={cn(
          'w-8 h-8 rounded-full border-2 transition-all duration-100',
          isHandDrawing
            ? 'border-blue-500 bg-blue-500/20 scale-75'
            : 'border-gray-400 bg-white/50',
          straightLineMode && 'border-dashed',
          shapeRecognitionEnabled && isHandDrawing && 'border-green-500'
        )}
      />
      {/* Inner dot (shows drawing color) */}
      {isHandDrawing && (
        <div
          className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{ backgroundColor: drawingColor }}
        />
      )}
      {/* Crosshair for precision */}
      {isHandDrawing && (
        <>
          <div className="absolute top-1/2 left-0 w-full h-px bg-blue-500/50 -translate-y-1/2" />
          <div className="absolute top-0 left-1/2 w-px h-full bg-blue-500/50 -translate-x-1/2" />
        </>
      )}
      {/* Shape recognition indicator */}
      {shapeRecognitionEnabled && !isHandDrawing && (
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-green-600 font-medium whitespace-nowrap">
          SHAPES
        </div>
      )}
    </div>
  )
}

// Utility to dynamically load scripts
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.crossOrigin = 'anonymous'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.head.appendChild(script)
  })
}
