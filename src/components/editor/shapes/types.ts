import type { CSSProperties, ReactNode } from 'react'
import type { NodeStyle, DiagramNode } from '@/types'

export interface BaseStyleValues {
  backgroundColor: string | undefined
  background: string | undefined
  backgroundSize: string | undefined
  borderColor: string
  borderWidth: number
  borderStyle: string
  borderRadius: number
  color: string
  fontSize: number
  fontFamily: string
  fontWeight: string
  fontStyle: string
  textDecoration: string
  textAlign: 'left' | 'center' | 'right'
  opacity: number
  boxShadow: string
  transform: string | undefined
  padding: number
}

export interface ShapeRenderProps {
  nodeId: string
  label: string
  style: NodeStyle | undefined
  baseStyle: BaseStyleValues
  data: DiagramNode['data']
  locked: boolean
  isValidTarget: boolean
  shapeClass: string
  getShapeStyle: (overrides?: CSSProperties) => CSSProperties
  getDropShadowFilter: () => string | undefined
  getVerticalAlignClass: () => string
  getHorizontalAlignClass: () => string
}

export type ShapeRenderer = (props: ShapeRenderProps) => ReactNode
