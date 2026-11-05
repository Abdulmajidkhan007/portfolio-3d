import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PMREMGenerator, Scene } from 'three'
import type { Vector3 } from 'three'
import { Sky } from 'three/examples/jsm/objects/Sky.js'
import { WORLD } from '../config'

interface Props {
  sun: Vector3
  animate: boolean
}

const configure = (sky: Sky, sun: Vector3) => {
  const uniforms = sky.material.uniforms
  uniforms.turbidity.value = 4
  uniforms.rayleigh.value = 1.4
  uniforms.mieCoefficient.value = 0.004
  uniforms.mieDirectionalG.value = 0.8
  uniforms.sunPosition.value.copy(sun)
  uniforms.cloudCoverage.value = 0.42
  uniforms.cloudDensity.value = 0.55
  uniforms.cloudElevation.value = 0.55
  sky.scale.setScalar(WORLD.skyScale)
}

/**
 * three's Preetham `Sky`, which in r185 also draws drifting clouds — so the
 * clouds cost one shader on a box instead of extra geometry.
 *
 * A second copy is rendered once into a PMREM environment map: that is what
 * lights the models and what the cheap water reflects.
 */
export default function OceanSky({ sun, animate }: Props) {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)

  const sky = useMemo(() => {
    const mesh = new Sky()
    configure(mesh, sun)
    return mesh
  }, [sun])

  useEffect(() => {
    const envSky = new Sky()
    configure(envSky, sun)
    envSky.material.uniforms.showSunDisc.value = 0
    const envScene = new Scene()
    envScene.add(envSky)

    const pmrem = new PMREMGenerator(gl)
    const target = pmrem.fromScene(envScene)
    scene.environment = target.texture
    scene.environmentIntensity = 0.9

    pmrem.dispose()
    envSky.geometry.dispose()
    envSky.material.dispose()

    return () => {
      scene.environment = null
      target.dispose()
    }
  }, [gl, scene, sun])

  useEffect(
    () => () => {
      sky.geometry.dispose()
      sky.material.dispose()
    },
    [sky],
  )

  useFrame((_, dt) => {
    if (animate) sky.material.uniforms.time.value += dt
  })

  return <primitive object={sky} />
}
