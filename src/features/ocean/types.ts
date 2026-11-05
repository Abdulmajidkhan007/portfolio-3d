/** How much of the scene the device is trusted to render. */
export type OceanQuality = 'high' | 'medium' | 'low' | 'fallback'

/** A quality level that actually renders WebGL. */
export type SceneQuality = Exclude<OceanQuality, 'fallback'>

/** What the visitor picked in the HUD: a fixed level, or let the page decide. */
export type QualityPreference = 'auto' | SceneQuality

export type CameraMode = 'follow' | 'free'

/** Normalised controls: both axes in [-1, 1]. */
export interface BoatControls {
  /** +1 full ahead, -1 full astern. */
  throttle: number
  /** +1 hard to starboard (right), -1 hard to port (left). */
  steer: number
}

export interface BoatState {
  x: number
  z: number
  /** Rotation about +Y in radians; 0 faces +Z. */
  heading: number
  /** Signed speed along the heading, units per second. */
  speed: number
}

export interface Collider {
  x: number
  z: number
  radius: number
}

/** Stage-2 effects, each switched on or off per quality level. */
export interface EffectFlags {
  /** V-shaped foam trail behind the boat. */
  wake: boolean
  /** Foam lines where the swell meets the beach and the rocks. */
  shoreFoam: boolean
  /** Water turns clear over the shallows, so the sand shows through. */
  shallowWater: boolean
  /** Moving light pattern on the sand under water. */
  caustics: boolean
  /** The camera may dive: fog, tint and the surface seen from below. */
  underwater: boolean
  /** Light shafts under water. */
  godRays: boolean
}

export interface QualitySettings {
  quality: SceneQuality
  dpr: number | [number, number]
  shadows: boolean
  shadowMapSize: number
  /** Resolution of the water's reflection render target; 0 disables the shader water. */
  reflectionSize: number
  antialias: boolean
  /** Instances in the wake's ring buffer; 0 when the wake is off. */
  wakeSegments: number
  effects: EffectFlags
}
