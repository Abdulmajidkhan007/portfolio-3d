import { ISLAND } from '../config'
import type { Collider } from '../types'

/**
 * The island's outline as a function of angle. Both the sand mesh and the
 * hull collision read this, so the boat stops exactly where the beach is.
 */
export function shoreScale(angle: number): number {
  return 1 + 0.09 * Math.sin(angle * 3 + 0.6) + 0.05 * Math.sin(angle * 7 + 2.1)
}

export function shoreRadiusAt(angle: number): number {
  return ISLAND.shoreRadius * shoreScale(angle)
}

export interface PropPlacement {
  model: 'palm-bend' | 'palm-straight' | 'rocks-a' | 'rocks-b' | 'rocks-sand-a' | 'grass-plant'
  x: number
  z: number
  y: number
  rotation: number
  scale: number
}

/** Hand-placed so the composition reads from the boat's starting position. */
export const PROPS: readonly PropPlacement[] = [
  { model: 'palm-bend', x: -2.5, z: 1.5, y: 1.15, rotation: 0.4, scale: 1.1 },
  { model: 'palm-straight', x: 1.8, z: -2.2, y: 1.2, rotation: 2.1, scale: 1.25 },
  { model: 'palm-bend', x: 4.4, z: 2.6, y: 0.9, rotation: -2.4, scale: 0.95 },
  { model: 'palm-straight', x: -4.6, z: -3.4, y: 0.85, rotation: 1.2, scale: 1 },
  { model: 'grass-plant', x: 0.4, z: 3.6, y: 1.05, rotation: 0.2, scale: 1.6 },
  { model: 'grass-plant', x: -5.8, z: 0.8, y: 0.7, rotation: 1.9, scale: 1.4 },
  { model: 'grass-plant', x: 3.4, z: -4.8, y: 0.75, rotation: 3.3, scale: 1.5 },
  { model: 'grass-plant', x: -1.6, z: -5.6, y: 0.75, rotation: 0.8, scale: 1.3 },
  { model: 'rocks-sand-a', x: 8.4, z: 4.6, y: -0.1, rotation: 0.9, scale: 0.7 },
  { model: 'rocks-sand-a', x: -7.6, z: -6.8, y: -0.15, rotation: 2.6, scale: 0.6 },
  { model: 'rocks-a', x: 19, z: -6, y: -0.5, rotation: 0.3, scale: 0.9 },
  { model: 'rocks-b', x: -17, z: 12, y: -0.5, rotation: 1.4, scale: 1 },
  { model: 'rocks-a', x: -9, z: -21, y: -0.5, rotation: 2.2, scale: 0.75 },
  { model: 'rocks-b', x: 24, z: 18, y: -0.5, rotation: 4.1, scale: 0.7 },
]

/** Offshore rocks the hull bumps into. Radii are eyeballed against the models. */
export const ROCK_COLLIDERS: readonly Collider[] = PROPS.filter(
  (prop) => prop.model === 'rocks-a' || prop.model === 'rocks-b',
).map((prop) => ({ x: prop.x, z: prop.z, radius: 2.4 * prop.scale }))
