import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { useRenderTier } from '@/hooks/useRenderTier'
import LazyCanvas from './LazyCanvas'

/** Rim light: bright where the surface turns away from the camera. */
const rimVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const rimFragment = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uTime;

  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    // A high exponent keeps the glow to a thin edge instead of flooding the
    // whole silhouette, so the point cloud underneath stays readable.
    float fresnel = pow(1.0 - max(0.0, dot(vNormal, vViewDir)), 6.0);
    // Slow travelling band so the rim never looks like a static decal.
    float band = 0.5 + 0.5 * sin(vNormal.y * 5.0 - uTime * 0.9);
    vec3 color = mix(uColorA, uColorB, band);
    gl_FragColor = vec4(color, fresnel * 0.75);
  }
`

function Head({ pointCount }: { pointCount: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const pointsRef = useRef<THREE.Points>(null)
  const wireRef = useRef<THREE.LineSegments>(null)
  const rimRef = useRef<THREE.ShaderMaterial>(null)
  const scanRef = useRef<THREE.Mesh>(null)

  // Points scattered evenly over a sphere via the Fibonacci spiral, then
  // nudged outwards by noise so the shell reads as a scanned surface.
  const pointGeometry = useMemo(() => {
    const positions = new Float32Array(pointCount * 3)
    const colors = new Float32Array(pointCount * 3)
    const neon = new THREE.Color('#00ff88')
    const cyan = new THREE.Color('#00d4ff')
    const golden = Math.PI * (3 - Math.sqrt(5))
    const mixed = new THREE.Color()

    for (let i = 0; i < pointCount; i += 1) {
      const y = 1 - (i / (pointCount - 1)) * 2
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y))
      const theta = golden * i
      const jitter = 1 + Math.sin(i * 12.9898) * 0.06

      positions[i * 3] = Math.cos(theta) * radiusAtY * 1.35 * jitter
      positions[i * 3 + 1] = y * 1.35 * jitter
      positions[i * 3 + 2] = Math.sin(theta) * radiusAtY * 1.35 * jitter

      mixed.copy(neon).lerp(cyan, (y + 1) / 2)
      colors[i * 3] = mixed.r
      colors[i * 3 + 1] = mixed.g
      colors[i * 3 + 2] = mixed.b
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [pointCount])

  const wireGeometry = useMemo(
    () => new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.95, 1)),
    [],
  )

  const rimUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color('#00ff88') },
      uColorB: { value: new THREE.Color('#00d4ff') },
    }),
    [],
  )

  useFrame((state, delta) => {
    const elapsed = state.clock.elapsedTime
    if (rimRef.current) rimRef.current.uniforms.uTime.value = elapsed

    if (groupRef.current) {
      // Parallax towards the pointer, damped so it never snaps.
      groupRef.current.rotation.y += (state.pointer.x * 0.5 - groupRef.current.rotation.y) * 0.05
      groupRef.current.rotation.x += (-state.pointer.y * 0.35 - groupRef.current.rotation.x) * 0.05
      groupRef.current.position.y = Math.sin(elapsed * 0.7) * 0.08
    }
    if (pointsRef.current) pointsRef.current.rotation.y += delta * 0.16

    // Scan ring sweeps the shell and hugs its radius at each height.
    if (scanRef.current) {
      const t = (Math.sin(elapsed * 0.55) + 1) / 2
      const y = -1.3 + t * 2.6
      const ringRadius = Math.sqrt(Math.max(0.02, 1.35 * 1.35 - y * y))
      scanRef.current.position.y = y
      scanRef.current.scale.setScalar(ringRadius)
    }

    if (wireRef.current) {
      wireRef.current.rotation.y -= delta * 0.1
      wireRef.current.rotation.x += delta * 0.04
    }
  })

  return (
    <group ref={groupRef}>
      {/* Opaque core so the far side of the point shell stays hidden. */}
      <mesh>
        <icosahedronGeometry args={[1.28, 4]} />
        <meshBasicMaterial color="#0b0f15" />
      </mesh>

      {/* Faint inner bloom so the centre is not a flat black hole. */}
      <mesh>
        <sphereGeometry args={[0.95, 24, 24]} />
        <meshBasicMaterial
          color="#00ff88"
          transparent
          opacity={0.09}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={scanRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1, 0.012, 6, 72]} />
        <meshBasicMaterial
          color="#00d4ff"
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh scale={1.09}>
        <icosahedronGeometry args={[1.28, 4]} />
        <shaderMaterial
          ref={rimRef}
          uniforms={rimUniforms}
          vertexShader={rimVertex}
          fragmentShader={rimFragment}
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <points ref={pointsRef} geometry={pointGeometry}>
        <pointsMaterial
          size={0.055}
          vertexColors
          transparent
          opacity={0.95}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <lineSegments ref={wireRef} geometry={wireGeometry}>
        <lineBasicMaterial color="#00d4ff" transparent opacity={0.16} />
      </lineSegments>

      <mesh rotation={[Math.PI / 2.4, 0, 0.3]}>
        <torusGeometry args={[2.3, 0.008, 8, 96]} />
        <meshBasicMaterial color="#00ff88" transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

export default function Avatar3D() {
  const isMobile = useIsMobile()
  const tier = useRenderTier()

  return (
    <LazyCanvas camera={{ position: [0, 0, 5.2], fov: 45 }}>
      <Head pointCount={tier === 'low' ? 700 : isMobile ? 900 : 2600} />
    </LazyCanvas>
  )
}
