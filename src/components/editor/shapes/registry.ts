import type { ShapeRenderer } from './types'

const shapeRegistry = new Map<string, ShapeRenderer>()

export function registerShape(type: string, renderer: ShapeRenderer) {
  shapeRegistry.set(type, renderer)
}

export function registerShapes(types: string[], renderer: ShapeRenderer) {
  types.forEach(type => shapeRegistry.set(type, renderer))
}

export function getShapeRenderer(type: string): ShapeRenderer | undefined {
  return shapeRegistry.get(type)
}
