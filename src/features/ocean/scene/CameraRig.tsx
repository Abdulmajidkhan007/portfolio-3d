import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CAMERA, SEABED } from '../config'
import { damp } from '../lib/math'
import type { CameraMode } from '../types'
import type { BoatTracker } from './tracker'

interface Props {
  mode: CameraMode
  tracker: BoatTracker
  /** Snap instead of easing, for visitors who asked for less motion. */
  instant: boolean
  /** The free camera may orbit below the surface, down to the sea floor. */
  canDive: boolean
  /** Start the free camera under water (`?dive`, for checking the effect). */
  startBelow: boolean
}

const desired = new Vector3()
const lookAt = new Vector3()
const delta = new Vector3()

/**
 * Follow: a chase camera that eases in behind the hull.
 * Free: orbit around the boat by drag / pinch; it still travels with the boat.
 */
export default function CameraRig({ mode, tracker, instant, canDive, startBelow }: Props) {
  const camera = useThree((state) => state.camera)
  const domElement = useThree((state) => state.gl.domElement)
  const controls = useRef<OrbitControls | null>(null)
  const lastFocus = useRef(new Vector3().copy(tracker.position))
  const dived = useRef(false)

  useEffect(() => {
    if (mode !== 'free') return
    const orbit = new OrbitControls(camera, domElement)
    orbit.enableDamping = !instant
    orbit.enablePan = false
    orbit.minDistance = CAMERA.freeMinDistance
    orbit.maxDistance = CAMERA.freeMaxDistance
    // Without the underwater effects there is nothing to see down there.
    orbit.maxPolarAngle = canDive ? Math.PI * 0.9 : Math.PI * 0.48
    orbit.target.copy(tracker.position).setY(1)
    if (startBelow && canDive && !dived.current) {
      dived.current = true
      const { heading } = tracker.state
      const back = CAMERA.followDistance * 1.4
      camera.position.set(
        tracker.position.x - Math.sin(heading) * back,
        CAMERA.diveDepth,
        tracker.position.z - Math.cos(heading) * back,
      )
    }
    lastFocus.current.copy(tracker.position)
    orbit.update()
    controls.current = orbit
    return () => {
      orbit.dispose()
      controls.current = null
    }
  }, [mode, camera, domElement, instant, tracker, canDive, startBelow])

  useFrame((_, dt) => {
    const focus = tracker.position
    const orbit = controls.current

    if (mode === 'free' && orbit) {
      delta.subVectors(focus, lastFocus.current).setY(0)
      camera.position.add(delta)
      orbit.target.set(focus.x, 1, focus.z)
      orbit.update()
      // Stay above the sand; the orbit re-reads the position next frame.
      if (camera.position.y < SEABED.cameraFloor) camera.position.y = SEABED.cameraFloor
      lastFocus.current.copy(focus)
      return
    }

    const { heading } = tracker.state
    const fx = Math.sin(heading)
    const fz = Math.cos(heading)
    desired.set(
      focus.x - fx * CAMERA.followDistance,
      Math.max(focus.y + CAMERA.followHeight, CAMERA.minHeight),
      focus.z - fz * CAMERA.followDistance,
    )
    if (instant) camera.position.copy(desired)
    else camera.position.lerp(desired, damp(CAMERA.stiffness, Math.min(dt, 0.1)))

    lookAt.set(focus.x + fx * CAMERA.lookAhead, focus.y + 1, focus.z + fz * CAMERA.lookAhead)
    camera.lookAt(lookAt)
    lastFocus.current.copy(focus)
  })

  return null
}
