import { ISLAND, SEABED } from '../config'
import { shoreScale } from './island'

/**
 * The island's slope under water, as [radius in shore radii, height]. The sand
 * mesh is built from it and the water shader computes depth from it, so the
 * shallows go clear exactly where the sand is close to the surface.
 * Ordered from the waterline outwards.
 */
export const UNDERWATER_PROFILE: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [1.18, -0.6],
  [1.45, -1.8],
  [2.3, -5],
  [3.4, -SEABED.depth],
]

/** Depth of the water (≥ 0) at radius `r`, measured in shore radii. */
export function profileDepth(r: number): number {
  const first = UNDERWATER_PROFILE[0]
  if (r <= first[0]) return 0
  for (let i = 1; i < UNDERWATER_PROFILE.length; i += 1) {
    const [r0, y0] = UNDERWATER_PROFILE[i - 1]
    const [r1, y1] = UNDERWATER_PROFILE[i]
    if (r <= r1) return -(y0 + ((y1 - y0) * (r - r0)) / (r1 - r0))
  }
  return SEABED.depth
}

/** Water depth at a world position: 0 on the beach, SEABED.depth far out. */
export function seabedDepth(x: number, z: number): number {
  const shore = ISLAND.shoreRadius * shoreScale(Math.atan2(z, x))
  return profileDepth(Math.hypot(x, z) / shore)
}

const glslFloat = (value: number) => (Number.isInteger(value) ? value.toFixed(1) : String(value))

/**
 * The same depth function in GLSL, generated from the profile so the two can
 * never drift apart. Defines `float seabedDepth(vec2 xz)`.
 */
export function seabedDepthGlsl(): string {
  const segments = UNDERWATER_PROFILE.slice(1)
    .map(([r1, y1], index) => {
      const [r0, y0] = UNDERWATER_PROFILE[index]
      return `  if (r <= ${glslFloat(r1)}) return -mix(${glslFloat(y0)}, ${glslFloat(y1)}, (r - ${glslFloat(r0)}) / ${glslFloat(r1 - r0)});`
    })
    .join('\n')
  return /* glsl */ `
float shoreScale(float a) {
  return 1.0 + 0.09 * sin(a * 3.0 + 0.6) + 0.05 * sin(a * 7.0 + 2.1);
}
float seabedDepth(vec2 xz) {
  float r = length(xz) / (${glslFloat(ISLAND.shoreRadius)} * shoreScale(atan(xz.y, xz.x)));
  if (r <= 1.0) return 0.0;
${segments}
  return ${glslFloat(SEABED.depth)};
}`
}
