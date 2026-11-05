import { BOAT, WAKE } from '../config'
import { clamp } from './math'
import type { BoatState } from '../types'

/** One slice of the wake, laid on the water where the stern was. */
export interface WakeSample {
  x: number
  z: number
  heading: number
  /** Seconds on the scene clock when the slice was laid. */
  born: number
  /** 0..1 from the boat's speed: how wide the arms spread and how bright they are. */
  strength: number
}

export const wakeStrength = (speed: number): number => clamp(Math.abs(speed) / BOAT.maxSpeed, 0, 1)

/**
 * Lays a slice every `WAKE.spacing` units the stern travels, so the trail is
 * evenly spaced at any speed and nothing is emitted while the boat drifts.
 */
export class WakeEmitter {
  private lastX: number | null = null
  private lastZ = 0

  update(state: BoatState, time: number): WakeSample | null {
    const strength = wakeStrength(state.speed)
    const x = state.x - Math.sin(state.heading) * WAKE.sternOffset
    const z = state.z - Math.cos(state.heading) * WAKE.sternOffset
    if (strength < WAKE.minStrength) {
      // Start afresh once moving again instead of bridging the gap.
      this.lastX = null
      return null
    }
    if (this.lastX !== null && Math.hypot(x - this.lastX, z - this.lastZ) < WAKE.spacing) return null
    this.lastX = x
    this.lastZ = z
    return { x, z, heading: state.heading, born: time, strength }
  }
}
