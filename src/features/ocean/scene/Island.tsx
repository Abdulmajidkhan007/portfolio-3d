import { useEffect, useMemo } from 'react'
import { LatheGeometry, Vector2 } from 'three'
import { shoreScale, PROPS } from '../lib/island'
import { UNDERWATER_PROFILE } from '../lib/seabed'
import { ISLAND } from '../config'
import { useCausticSand } from './useCausticSand'
import { cloneWithShadows, useOceanKit } from './useOceanKit'

/**
 * Radial profile of a mound, from below the waterline up to the crest, in
 * multiples of the shore radius (x) and world units (y). Bottom-to-top order
 * is what makes LatheGeometry's faces point outwards.
 */
const SAND_PROFILE: ReadonlyArray<readonly [number, number]> = [
  // The slope under water runs down to the sea floor; the water shader reads the same numbers.
  ...UNDERWATER_PROFILE.toReversed(),
  [0.82, 0.5],
  [0.62, 0.95],
  [0.35, 1.2],
  [0, 1.3],
]

const GRASS_PROFILE: ReadonlyArray<readonly [number, number]> = [
  [0.56, 0.9],
  [0.48, 1.16],
  [0.3, 1.34],
  [0, 1.42],
]

/** A lathe around +Y whose outline wobbles with `shoreScale`, so the island is not a disc. */
function useMound(profile: ReadonlyArray<readonly [number, number]>, segments: number) {
  const geometry = useMemo(() => {
    const points = profile.map(([r, y]) => new Vector2(r * ISLAND.shoreRadius, y))
    const lathe = new LatheGeometry(points, segments)
    const position = lathe.attributes.position
    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i)
      const z = position.getZ(i)
      const scale = shoreScale(Math.atan2(z, x))
      position.setX(i, x * scale)
      position.setZ(i, z * scale)
    }
    lathe.computeVertexNormals()
    return lathe
  }, [profile, segments])

  useEffect(() => () => geometry.dispose(), [geometry])
  return geometry
}

interface Props {
  shadows: boolean
  caustics: boolean
  motion: number
}

export default function Island({ shadows, caustics, motion }: Props) {
  const kit = useOceanKit()
  const sandMaterial = useCausticSand(caustics, motion)
  const sand = useMound(SAND_PROFILE, 56)
  const grass = useMound(GRASS_PROFILE, 40)

  const props = useMemo(
    () =>
      PROPS.map((prop) => ({
        ...prop,
        object: cloneWithShadows(kit[prop.model], shadows, shadows),
      })),
    [kit, shadows],
  )

  return (
    <group>
      <mesh geometry={sand} material={sandMaterial} receiveShadow={shadows} />
      <mesh geometry={grass} receiveShadow={shadows}>
        <meshStandardMaterial color="#7fb351" roughness={0.9} flatShading />
      </mesh>
      {props.map((prop, index) => (
        <primitive
          key={index}
          object={prop.object}
          position={[prop.x, prop.y, prop.z]}
          rotation={[0, prop.rotation, 0]}
          scale={prop.scale}
        />
      ))}
    </group>
  )
}
