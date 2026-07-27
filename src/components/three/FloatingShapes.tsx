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

/** Spread across the frame — for sections whose copy sits in a narrow column. */
const AMBIENT_SHAPES: ShapeSpec[] = [
  { position: [-3.4, 1.6, -1], scale: 0.7, speed: 0.3, color: '#00ff88', kind: 'octa' },
  { position: [3.2, -1.2, -2], scale: 0.9, speed: -0.24, color: '#00d4ff', kind: 'icosa' },
  { position: [2.1, 2.2, -3], scale: 0.55, speed: 0.42, color: '#00ff88', kind: 'tetra' },
  { position: [-2.6, -2.0, -2.4], scale: 0.62, speed: -0.34, color: '#00d4ff', kind: 'torus' },
  { position: [0.4, 2.9, -4], scale: 0.48, speed: 0.28, color: '#a78bfa', kind: 'tetra' },
]

/**
 * Hero layout. The headline, lede and buttons occupy the left half of the
 * frame down to the fold, so every solid here is pushed right of centre or
 * high above the copy — the shapes should read as depth, never as something
 * sitting on the text.
 */
const HERO_SHAPES: ShapeSpec[] = [
  { position: [2.6, 0.9, -1], scale: 0.85, speed: -0.22, color: '#00d4ff', kind: 'icosa' },
  { position: [1.5, 2.6, -2.5], scale: 0.6, speed: 0.36, color: '#00ff88', kind: 'tetra' },
  { position: [3.6, -1.9, -3], scale: 0.72, speed: -0.3, color: '#00ff88', kind: 'torus' },
  { position: [0.6, 3.2, -4], scale: 0.5, speed: 0.28, color: '#a78bfa', kind: 'octa' },
  { position: [4.2, 2.0, -1.6], scale: 0.45, speed: 0.4, color: '#00d4ff', kind: 'tetra' },
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
      <lineBasicMaterial color={spec.color} transparent opacity={0.5} />
    </lineSegments>
  )
}

/**
 * The shapes on their own, for callers that already own a canvas — stacking a
 * second <Canvas> on top of one just to draw five wireframes would burn a
 * whole extra WebGL context. Positions are authored for a camera at z=6, so
 * `spread` rescales them for a canvas whose camera sits further back.
 */
export function ShapesScene({
  spread = 1,
  layout = 'ambient',
}: {
  spread?: number
  layout?: 'ambient' | 'hero'
}) {
  const isMobile = useIsMobile()
  const tier = useRenderTier()

  // Purely decorative, so it is the first thing dropped on a CPU rasteriser.
  if (tier === 'low') return null

  const all = layout === 'hero' ? HERO_SHAPES : AMBIENT_SHAPES
  const shapes = isMobile ? all.slice(0, 3) : all

  return (
    <group scale={spread}>
      {shapes.map((spec, index) => (
        <Shape key={spec.kind + index} spec={spec} index={index} />
      ))}
    </group>
  )
}

/** Ambient wireframe solids drifting behind a section. Purely decorative. */
export default function FloatingShapes() {
  const tier = useRenderTier()
  if (tier === 'low') return null

  return (
    <LazyCanvas camera={{ position: [0, 0, 6], fov: 50 }}>
      <ShapesScene />
    </LazyCanvas>
  )
}
