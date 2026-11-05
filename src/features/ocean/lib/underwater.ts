import { SEABED, UNDERWATER } from '../config'
import { clamp } from './math'

export const isUnderwater = (cameraY: number): boolean => cameraY < UNDERWATER.surfaceY

export interface UnderwaterFog {
  /** sRGB, 0..1. */
  color: readonly [number, number, number]
  near: number
  far: number
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t

/** Fog for a camera `depth` units below the surface: greener and closer as it sinks. */
export function underwaterFog(depth: number): UnderwaterFog {
  const t = clamp(depth / SEABED.depth, 0, 1)
  const [s, d] = [UNDERWATER.shallowColor, UNDERWATER.deepColor]
  return {
    color: [mix(s[0], d[0], t), mix(s[1], d[1], t), mix(s[2], d[2], t)],
    near: UNDERWATER.fogNear,
    far: mix(UNDERWATER.fogFar, UNDERWATER.fogFar * 0.6, t),
  }
}
