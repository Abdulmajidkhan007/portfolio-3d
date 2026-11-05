import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshStandardMaterial } from 'three'
import { addCaustics } from './shaders/caustics'

export const SAND_COLOR = '#e9d29b'

/**
 * The sand material, with caustics when they are on. `motion` scales how fast
 * the light pattern moves (reduced motion slows it almost to a stop).
 */
export function useCausticSand(caustics: boolean, motion: number): MeshStandardMaterial {
  const { material, uniforms } = useMemo(() => {
    const sand = new MeshStandardMaterial({ color: SAND_COLOR, roughness: 0.95, flatShading: true })
    const shared = { uCausticTime: { value: 0 } }
    if (caustics) addCaustics(sand, shared)
    return { material: sand, uniforms: shared }
  }, [caustics])

  useEffect(() => () => material.dispose(), [material])

  useFrame((_, dt) => {
    if (caustics) uniforms.uCausticTime.value += Math.min(dt, 0.1) * 0.9 * motion
  })

  return material
}
