import { LabeledEdge } from './LabeledEdge'

// All edge types use our custom LabeledEdge for consistent waypoint dragging
export const edgeTypes = {
  labeled: LabeledEdge,
  default: LabeledEdge,
  straight: LabeledEdge,
  step: LabeledEdge,
  smoothstep: LabeledEdge,
  bezier: LabeledEdge,
}

export { LabeledEdge }
