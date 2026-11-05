import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { DirectionalLight } from 'three'
import type { Vector3 } from 'three'
import type { BoatTracker } from './tracker'

interface Props {
  sun: Vector3
  tracker: BoatTracker
  shadows: boolean
  shadowMapSize: number
}

/** Half-width of the shadow frustum: the island plus some sea around the boat. */
const SHADOW_EXTENT = 30
const DISTANCE = 90

/**
 * The key light rides along with the boat so the shadow map is always spent
 * where the camera is looking, instead of being stretched over the whole sea.
 */
export default function SunLight({ sun, tracker, shadows, shadowMapSize }: Props) {
  const light = useMemo(() => {
    const directional = new DirectionalLight('#fff1d6', 2.6)
    directional.castShadow = shadows
    const camera = directional.shadow.camera
    camera.left = -SHADOW_EXTENT
    camera.right = SHADOW_EXTENT
    camera.top = SHADOW_EXTENT
    camera.bottom = -SHADOW_EXTENT
    camera.near = 1
    camera.far = DISTANCE * 2.5
    directional.shadow.mapSize.set(shadowMapSize, shadowMapSize)
    directional.shadow.bias = -0.0008
    directional.shadow.normalBias = 0.06
    return directional
  }, [shadows, shadowMapSize])

  useEffect(() => () => light.dispose(), [light])

  useFrame(() => {
    const focus = tracker.position
    light.target.position.set(focus.x, 0, focus.z)
    light.position.set(focus.x + sun.x * DISTANCE, sun.y * DISTANCE, focus.z + sun.z * DISTANCE)
    light.target.updateMatrixWorld()
  })

  return (
    <>
      <primitive object={light} />
      <primitive object={light.target} />
      <hemisphereLight args={['#cfe8ff', '#d9c08a', 0.7]} />
    </>
  )
}
