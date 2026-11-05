import { useEffect, useMemo } from 'react'
import { CircleGeometry } from 'three'
import { SEABED, WORLD } from '../config'
import { useCausticSand } from './useCausticSand'

interface Props {
  caustics: boolean
  motion: number
}

/**
 * Flat sand where the island's slope ends. Only seen through clear shallows
 * and from under water; deep water above it is opaque.
 */
export default function Seabed({ caustics, motion }: Props) {
  const material = useCausticSand(caustics, motion)
  const geometry = useMemo(() => new CircleGeometry(WORLD.radius + 70, 48), [])
  useEffect(() => () => geometry.dispose(), [geometry])

  return <mesh geometry={geometry} material={material} position-y={-SEABED.depth} rotation-x={-Math.PI / 2} />
}
