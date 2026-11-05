/**
 * Every tunable number of the ocean scene in one place, so balancing the feel
 * of the boat or the cost of a frame never means hunting through components.
 */

export const ASSETS = {
  kit: '/ocean/ocean-kit.glb',
  waterNormals: '/ocean/waternormals.webp',
  poster: '/ocean/poster.webp',
} as const

/** Sun angles in degrees. Low enough for long shadows, high enough for daylight. */
export const SUN = {
  elevation: 14,
  azimuth: 140,
} as const

export const WORLD = {
  /** The boat may not sail further than this from the island. */
  radius: 170,
  waterSize: 2400,
  skyScale: 2600,
  cameraFar: 3200,
  fogNear: 260,
  fogFar: 1100,
} as const

export const ISLAND = {
  /** Shoreline radius before the per-angle wobble is applied. */
  shoreRadius: 11,
  /** Extra clearance so the hull stops before it visibly beaches. */
  hullClearance: 1.8,
} as const

export const BOAT = {
  acceleration: 7,
  reverseAcceleration: 4,
  maxSpeed: 11,
  maxReverse: 3.5,
  /** Fraction of speed lost per second when coasting. */
  drag: 0.9,
  /** Radians per second at full lock and cruising speed. */
  turnRate: 1.5,
  scale: 1.5,
  /** Turns the Kenney hull so its bow points down +Z, the physics' forward. */
  modelYaw: 0,
  /** How deep the hull sits in the water. */
  draft: 0.12,
  /** Off the island's south-east beach, bow towards it. */
  start: { x: 7, z: 28, heading: Math.PI + 0.25 },
} as const

export const CAMERA = {
  followDistance: 9,
  followHeight: 3.6,
  lookAhead: 2.5,
  /** Higher is snappier. Used as 1 - exp(-stiffness * dt). */
  stiffness: 3.2,
  minHeight: 0.8,
  freeMinDistance: 4,
  freeMaxDistance: 60,
} as const

export const WAVES = {
  amplitude: 0.22,
  /** Wave amplitude multiplier under prefers-reduced-motion. */
  reducedMotionScale: 0.2,
} as const
