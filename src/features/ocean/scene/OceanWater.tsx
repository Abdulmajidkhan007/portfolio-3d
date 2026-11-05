import { useEffect, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { Color, MeshStandardMaterial, PlaneGeometry, RepeatWrapping, TextureLoader, Mesh } from 'three'
import type { Texture, Vector3 } from 'three'
import { Water } from 'three/examples/jsm/objects/Water.js'
import { ASSETS, WORLD } from '../config'

interface Props {
  sun: Vector3
  /** Reflection target size; 0 swaps the shader water for a cheap material. */
  reflectionSize: number
  /** Multiplier on how fast the surface moves. */
  speed: number
}

const WATER_COLOR = '#0c5a70'

function ShaderWater({ sun, size, normals, speed }: { sun: Vector3; size: number; normals: Texture; speed: number }) {
  const water = useMemo(() => {
    const mesh = new Water(new PlaneGeometry(WORLD.waterSize, WORLD.waterSize), {
      textureWidth: size,
      textureHeight: size,
      waterNormals: normals,
      sunDirection: sun.clone().normalize(),
      sunColor: 0xfff4e0,
      waterColor: WATER_COLOR,
      distortionScale: 2.6,
      alpha: 0.96,
      fog: true,
    })
    mesh.rotation.x = -Math.PI / 2
    mesh.material.uniforms.size.value = 1.6
    return mesh
  }, [sun, size, normals])

  useEffect(
    () => () => {
      water.geometry.dispose()
      water.material.dispose()
    },
    [water],
  )

  useFrame((_, dt) => {
    water.material.uniforms.time.value += dt * 0.6 * speed
  })

  return <primitive object={water} />
}

/**
 * No second render pass: a standard material with a scrolling normal map,
 * reflecting the sky's environment map. Roughly a tenth of the cost.
 */
function LiteWater({ normals, speed }: { normals: Texture; speed: number }) {
  const { mesh, texture } = useMemo(() => {
    const map = normals.clone()
    map.wrapS = RepeatWrapping
    map.wrapT = RepeatWrapping
    map.repeat.set(WORLD.waterSize / 18, WORLD.waterSize / 18)
    const material = new MeshStandardMaterial({
      color: new Color(WATER_COLOR),
      normalMap: map,
      roughness: 0.12,
      metalness: 0.35,
      transparent: true,
      opacity: 0.94,
    })
    material.normalScale.set(0.5, 0.5)
    const plane = new Mesh(new PlaneGeometry(WORLD.waterSize, WORLD.waterSize), material)
    plane.rotation.x = -Math.PI / 2
    return { mesh: plane, texture: map }
  }, [normals])

  useEffect(
    () => () => {
      mesh.geometry.dispose()
      mesh.material.dispose()
      texture.dispose()
    },
    [mesh, texture],
  )

  useFrame((_, dt) => {
    texture.offset.x += dt * 0.012 * speed
    texture.offset.y += dt * 0.007 * speed
  })

  return <primitive object={mesh} />
}

export default function OceanWater({ sun, reflectionSize, speed }: Props) {
  const normals = useLoader(TextureLoader, ASSETS.waterNormals)

  useEffect(() => {
    normals.wrapS = RepeatWrapping
    normals.wrapT = RepeatWrapping
    normals.needsUpdate = true
  }, [normals])

  return reflectionSize > 0 ? (
    <ShaderWater sun={sun} size={reflectionSize} normals={normals} speed={speed} />
  ) : (
    <LiteWater normals={normals} speed={speed} />
  )
}
