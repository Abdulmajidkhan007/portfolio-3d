/** How much of the scene the device is trusted to render. */
export type OceanQuality = 'full' | 'lite' | 'fallback'

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

export interface QualitySettings {
  quality: Exclude<OceanQuality, 'fallback'>
  dpr: number | [number, number]
  shadows: boolean
  shadowMapSize: number
  /** Resolution of the water's reflection render target; 0 disables the shader water. */
  reflectionSize: number
  antialias: boolean
}
