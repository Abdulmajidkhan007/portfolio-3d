import { Vector3 } from 'three'
import type { BoatState } from '../types'
import { initialBoatState } from '../lib/boatPhysics'

/**
 * Where the boat is this frame. The boat writes it, the camera and the sun
 * read it — all inside useFrame, so none of it goes through React.
 */
export interface BoatTracker {
  state: BoatState
  /** World position of the hull, including the swell. */
  position: Vector3
}

export const createTracker = (): BoatTracker => {
  const state = initialBoatState()
  return { state, position: new Vector3(state.x, 0, state.z) }
}
