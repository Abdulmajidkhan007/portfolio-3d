import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { BOAT, WAVES } from '../config'
import { stepBoat } from '../lib/boatPhysics'
import type { BoatInput } from '../lib/boatInput'
import { ROCK_COLLIDERS } from '../lib/island'
import { clamp, damp } from '../lib/math'
import { hullPose } from '../lib/waves'
import type { BoatTracker } from './tracker'
import { cloneWithShadows, useOceanKit } from './useOceanKit'

interface Props {
  input: BoatInput
  tracker: BoatTracker
  shadows: boolean
  waveScale: number
}

/** Longest frame step the physics accepts; a background tab must not teleport the boat. */
const MAX_DT = 1 / 20

export default function Boat({ input, tracker, shadows, waveScale }: Props) {
  const kit = useOceanKit()
  const group = useRef<Group>(null)
  const elapsed = useRef(0)
  const lean = useRef(0)
  const model = useMemo(() => cloneWithShadows(kit['boat-row-small'], shadows, false), [kit, shadows])

  useFrame((_, rawDt) => {
    const node = group.current
    if (!node) return
    const dt = Math.min(rawDt, MAX_DT)
    elapsed.current += dt

    const controls = input.read()
    const next = stepBoat(tracker.state, controls, dt, ROCK_COLLIDERS)
    tracker.state = next

    const amplitude = WAVES.amplitude * waveScale
    const pose = hullPose(next.x, next.z, next.heading, elapsed.current, amplitude)
    // Bow lifts with speed, and the hull leans out of a turn.
    const squat = -clamp(next.speed / BOAT.maxSpeed, -0.3, 1) * 0.06
    lean.current += (controls.steer * clamp(next.speed / BOAT.maxSpeed, 0, 1) * 0.12 - lean.current) * damp(4, dt)

    node.position.set(next.x, pose.y - BOAT.draft, next.z)
    node.rotation.set(pose.pitch + squat, next.heading, pose.roll + lean.current, 'YXZ')
    tracker.position.copy(node.position)
  })

  return (
    <group ref={group}>
      <primitive object={model} rotation={[0, BOAT.modelYaw, 0]} scale={BOAT.scale} />
    </group>
  )
}
