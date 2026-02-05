import { SVGShape } from '../shared'
import { registerShape, registerShapes } from '../registry'
import type { ShapeRenderProps } from '../types'

function DiamondShape(props: ShapeRenderProps) {
  return <SVGShape points="50,2 98,50 50,98 2,50" renderProps={props}>{props.label}</SVGShape>
}

function TriangleShape(props: ShapeRenderProps) {
  return <SVGShape points="50,5 95,95 5,95" renderProps={props}>{props.label}</SVGShape>
}

function PentagonShape(props: ShapeRenderProps) {
  return <SVGShape points="50,5 97,38 80,95 20,95 3,38" renderProps={props}>{props.label}</SVGShape>
}

function HexagonShape(props: ShapeRenderProps) {
  return <SVGShape points="25,5 75,5 98,50 75,95 25,95 2,50" renderProps={props}>{props.label}</SVGShape>
}

function OctagonShape(props: ShapeRenderProps) {
  return <SVGShape points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" renderProps={props}>{props.label}</SVGShape>
}

function StarShape(props: ShapeRenderProps) {
  return <SVGShape points="50,5 61,35 95,35 68,55 79,90 50,70 21,90 32,55 5,35 39,35" renderProps={props}>{props.label}</SVGShape>
}

function ArrowShape(props: ShapeRenderProps) {
  return <SVGShape points="5,25 60,25 60,5 95,50 60,95 60,75 5,75" renderProps={props}>{props.label}</SVGShape>
}

function DoubleArrowShape(props: ShapeRenderProps) {
  return <SVGShape points="5,50 20,10 20,30 80,30 80,10 95,50 80,90 80,70 20,70 20,90" renderProps={props}>{props.label}</SVGShape>
}

function TrapezoidShape(props: ShapeRenderProps) {
  return <SVGShape points="20,5 80,5 95,95 5,95" renderProps={props}>{props.label}</SVGShape>
}

function MergeShape(props: ShapeRenderProps) {
  return <SVGShape points="5,5 95,5 50,95" renderProps={props}>{props.label}</SVGShape>
}

function ManualInputShape(props: ShapeRenderProps) {
  return <SVGShape points="5,20 95,5 95,95 5,95" renderProps={props}>{props.label}</SVGShape>
}

function LoadBalancerShape(props: ShapeRenderProps) {
  return <SVGShape points="5,50 25,5 75,5 95,50 75,95 25,95" renderProps={props}>{props.label}</SVGShape>
}

// Register all SVG polygon shapes
registerShapes(['diamond', 'decision'], DiamondShape)
registerShape('triangle', TriangleShape)
registerShape('pentagon', PentagonShape)
registerShapes(['hexagon', 'preparation'], HexagonShape)
registerShape('octagon', OctagonShape)
registerShape('star', StarShape)
registerShape('arrow', ArrowShape)
registerShape('double-arrow', DoubleArrowShape)
registerShape('trapezoid', TrapezoidShape)
registerShape('merge', MergeShape)
registerShape('manual-input', ManualInputShape)
registerShape('load-balancer', LoadBalancerShape)
