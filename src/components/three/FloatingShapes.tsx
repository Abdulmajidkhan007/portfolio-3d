import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { useRenderTier } from '@/hooks/useRenderTier'
import LazyCanvas from './LazyCanvas'

interface ShapeSpec {
  position: [number, number, number]
  scale: number
  speed: number
  color: string
  kind: 'tetra' | 'octa' | 'icosa' | 'torus'
}

const SHAPES: ShapeSpec[] = [
  { position: [-3.4, 1.6, -1], scale: 0.7, speed: 0.3, color: '#00ff88', kind: 'octa' },
  { position: [3.2, -1.2, -2], scale: 0.9, speed: -0.24, color: '#00d4ff', kind: 'icosa' },
  { position: [2.1, 2.2, -3], scale: 0.55, speed: 0.42, color: '#00ff88', kind: 'tetra' },
  { position: [-2.6, -2.0, -2.4], scale: 0.62, speed: -0.34, color: '#00d4ff', kind: 'torus' },
  { position: [0.4, 2.9, -4], scale: 0.48, speed: 0.28, color: '#a78bfa', kind: 'tetra' },
]

function Shape({ spec, index }: { spec: ShapeSpec; index: number }) {
  const ref = useRef<THREE.LineSegments>(null)

  const geometry = useMemo(() => {
    const base =
      spec.kind === 'tetra'
        ? new THREE.TetrahedronGeometry(1)
        : spec.kind === 'octa'
          ? new THREE.OctahedronGeometry(1)
          : spec.kind === 'icosa'
            ? new THREE.IcosahedronGeometry(1)
            : new THREE.TorusGeometry(0.8, 0.3, 6, 14)
    return new THREE.WireframeGeometry(base)
  }, [spec.kind])

  useFrame((state, delta) => {
    const node = ref.current
    if (!node) return
    node.rotation.x += delta * spec.speed
    node.rotation.y += delta * spec.speed * 0.7
    node.position.y = spec.position[1] + Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.3
  })

  return (
    <lineSegments ref={ref} geometry={geometry} position={spec.position} scale={spec.scale}>
      <lineBasicMaterial color={spec.color} transparent opacity={0.28} />
    </lineSegments>
  )
}

/** Ambient wireframe solids drifting behind a section. Purely decorative. */
export default function FloatingShapes() {
  const isMobile = useIsMobile()
  const tier = useRenderTier()

  // Purely decorative, so it is the first thing dropped on a CPU rasteriser.
  if (tier === 'low') return null

  const shapes = isMobile ? SHAPES.slice(0, 3) : SHAPES

  return (
    <LazyCanvas camera={{ position: [0, 0, 6], fov: 50 }}>
      {shapes.map((spec, index) => (
        <Shape key={spec.kind + index} spec={spec} index={index} />
      ))}
    </LazyCanvas>
  )
}
