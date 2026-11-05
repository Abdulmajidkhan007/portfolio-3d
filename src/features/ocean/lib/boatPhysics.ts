import { BOAT, ISLAND, WORLD } from '../config'
import type { BoatControls, BoatState, Collider } from '../types'
import { clamp, wrapAngle } from './math'
import { shoreRadiusAt } from './island'

export const initialBoatState = (): BoatState => ({
  x: BOAT.start.x,
  z: BOAT.start.z,
  // Same (-PI, PI] range stepBoat keeps it in.
  heading: wrapAngle(BOAT.start.heading),
  speed: 0,
})

/** Speed kept after hitting something: a bump, not a dead stop. */
const BUMP_RETAIN = 0.35

/**
 * Advances the boat by one step. Pure, so it is unit-tested without WebGL and
 * can never accumulate hidden state between frames.
 */
export function stepBoat(
  state: BoatState,
  controls: BoatControls,
  dt: number,
  colliders: readonly Collider[] = [],
): BoatState {
  const throttle = clamp(controls.throttle, -1, 1)
  const steer = clamp(controls.steer, -1, 1)

  let speed = state.speed
  if (throttle > 0) speed += throttle * BOAT.acceleration * dt
  else if (throttle < 0) speed += throttle * BOAT.reverseAcceleration * dt
  speed -= speed * BOAT.drag * dt
  speed = clamp(speed, -BOAT.maxReverse, BOAT.maxSpeed)
  if (throttle === 0 && Math.abs(speed) < 0.01) speed = 0

  // A boat only turns while water flows past the rudder; a little authority at
  // rest keeps it from feeling stuck. Astern the rudder works backwards.
  const authority = clamp(Math.abs(speed) / 3, 0.25, 1)
  const direction = speed < -0.05 ? -1 : 1
  const heading = wrapAngle(state.heading - steer * BOAT.turnRate * authority * direction * dt)

  let x = state.x + Math.sin(heading) * speed * dt
  let z = state.z + Math.cos(heading) * speed * dt

  // Beach: push out to the shoreline at this bearing.
  const bearing = Math.atan2(z, x)
  const shore = shoreRadiusAt(bearing) + ISLAND.hullClearance
  const fromCentre = Math.hypot(x, z)
  if (fromCentre < shore) {
    const push = shore / Math.max(fromCentre, 1e-6)
    x *= push
    z *= push
    speed *= BUMP_RETAIN
  }

  for (const collider of colliders) {
    const dx = x - collider.x
    const dz = z - collider.z
    const distance = Math.hypot(dx, dz)
    const min = collider.radius + ISLAND.hullClearance * 0.5
    if (distance < min) {
      const push = min / Math.max(distance, 1e-6)
      x = collider.x + dx * push
      z = collider.z + dz * push
      speed *= BUMP_RETAIN
    }
  }

  // Edge of the world: hold the boat on the boundary circle.
  const radius = Math.hypot(x, z)
  if (radius > WORLD.radius) {
    x *= WORLD.radius / radius
    z *= WORLD.radius / radius
    speed *= BUMP_RETAIN
  }

  return { x, z, heading, speed }
}
