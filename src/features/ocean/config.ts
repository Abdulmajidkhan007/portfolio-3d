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
  /** Where `?dive` puts the free camera. */
  diveDepth: -3.2,
} as const

export const WAVES = {
  amplitude: 0.22,
  /** Wave amplitude multiplier under prefers-reduced-motion. */
  reducedMotionScale: 0.2,
} as const

/** Flat sea floor beyond the island's slope. */
export const SEABED = {
  depth: 12,
  /** Lowest the free camera may sink. */
  cameraFloor: -10.5,
} as const

export const WAKE = {
  /** Distance the stern travels between two slices. */
  spacing: 0.7,
  /** From the hull's centre back to where the water breaks. */
  sternOffset: 1.5,
  /** Below this fraction of top speed the boat leaves no wake. */
  minStrength: 0.08,
  lifetime: 6,
  /** Half-width of a fresh slice. */
  baseWidth: 0.45,
  /** How fast the arms spread sideways at full speed, units per second. */
  spread: 2.4,
} as const

export const UNDERWATER = {
  /** The camera counts as under water below this height. */
  surfaceY: -0.05,
  shallowColor: [0.18, 0.55, 0.58],
  deepColor: [0.03, 0.2, 0.27],
  fogNear: 1,
  fogFar: 42,
} as const

/** Names the sky and the water carry, so Underwater can hide them below the surface. */
export const SURFACE_NAMES = { sky: 'ocean-sky', water: 'ocean-water' } as const
