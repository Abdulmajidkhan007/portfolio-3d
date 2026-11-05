/**
 * Analytic swell used to float the boat.
 *
 * The three.js `Water` shader only animates normals — its surface is flat — so
 * the motion the eye reads as "waves" has to be put on the hull explicitly.
 * A handful of long, slow sines is enough to make it rock believably without
 * ever disagreeing visibly with the shading.
 */

interface Swell {
  dirX: number
  dirZ: number
  /** Radians per world unit. */
  frequency: number
  /** Radians per second. */
  speed: number
  weight: number
  phase: number
}

const SWELLS: readonly Swell[] = [
  { dirX: 0.8, dirZ: 0.6, frequency: 0.18, speed: 0.9, weight: 1, phase: 0 },
  { dirX: -0.4, dirZ: 0.92, frequency: 0.31, speed: 1.3, weight: 0.55, phase: 1.7 },
  { dirX: 0.97, dirZ: -0.24, frequency: 0.52, speed: 1.9, weight: 0.3, phase: 4.1 },
]

const TOTAL_WEIGHT = SWELLS.reduce((sum, swell) => sum + swell.weight, 0)

/** Water height at (x, z) and time t, in [-amplitude, amplitude]. */
export function waveHeight(x: number, z: number, t: number, amplitude: number): number {
  let height = 0
  for (const swell of SWELLS) {
    const along = x * swell.dirX + z * swell.dirZ
    height += swell.weight * Math.sin(along * swell.frequency + t * swell.speed + swell.phase)
  }
  return (height / TOTAL_WEIGHT) * amplitude
}

export interface HullPose {
  y: number
  pitch: number
  roll: number
}

/**
 * Samples the swell at bow, stern and both beams and turns the differences into
 * pitch and roll, so the hull tilts with the slope it sits on.
 */
export function hullPose(
  x: number,
  z: number,
  heading: number,
  t: number,
  amplitude: number,
  halfLength = 1.6,
  halfBeam = 0.8,
): HullPose {
  const fx = Math.sin(heading)
  const fz = Math.cos(heading)
  // Starboard is forward rotated -90° about +Y.
  const rx = -fz
  const rz = fx

  const bow = waveHeight(x + fx * halfLength, z + fz * halfLength, t, amplitude)
  const stern = waveHeight(x - fx * halfLength, z - fz * halfLength, t, amplitude)
  const starboard = waveHeight(x + rx * halfBeam, z + rz * halfBeam, t, amplitude)
  const port = waveHeight(x - rx * halfBeam, z - rz * halfBeam, t, amplitude)

  return {
    y: (bow + stern + starboard + port) / 4,
    // Bow up is a negative rotation about the local X axis.
    pitch: -Math.atan2(bow - stern, halfLength * 2),
    roll: Math.atan2(starboard - port, halfBeam * 2),
  }
}
