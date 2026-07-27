import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useHasFinePointer, useIsMobile } from '@/hooks/useMediaQuery'
import { useRenderTier } from '@/hooks/useRenderTier'
import LazyCanvas from './LazyCanvas'
import { ShapesScene } from './FloatingShapes'
import { useScenePalette } from '@/theme/ThemeContext'
import type { ScenePalette } from '@/theme/ThemeContext'

/**
 * All motion lives in the vertex shader: drift, mouse repulsion and depth
 * fade. That keeps the whole field at a single draw call with zero per-frame
 * JavaScript per particle, which is what makes 6000 points affordable.
 */
const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2  uMouse;
  uniform float uPixelRatio;
  uniform float uRadius;

  attribute float aScale;
  attribute float aSeed;

  varying float vSeed;
  varying float vFade;

  void main() {
    vec3 pos = position;
    float phase = aSeed * 6.2831853;

    // Lazy drift so the field never looks frozen.
    pos.x += sin(uTime * 0.32 + phase) * 0.45;
    pos.y += cos(uTime * 0.27 + phase * 1.3) * 0.45;
    pos.z += sin(uTime * 0.19 + phase * 0.7) * 0.35;

    // Push particles away from the pointer, strongest at the centre.
    vec2 toMouse = pos.xy - uMouse;
    float dist = length(toMouse);
    float force = smoothstep(uRadius, 0.0, dist);
    pos.xy += normalize(toMouse + vec2(0.0001)) * force * uRadius * 0.55;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Perspective-correct sizing, plus a nudge for repelled particles.
    gl_PointSize = aScale * uPixelRatio * (135.0 / max(0.1, -mvPosition.z)) * (1.0 + force * 0.8);

    vSeed = aSeed;
    // Bright enough to read as a field of light, with the near particles
    // carrying most of it. The hero keeps its contrast with a scrim behind the
    // copy rather than by dimming the whole scene.
    vFade = smoothstep(46.0, 2.0, -mvPosition.z) * (0.55 + force * 0.45);
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3  uColorA;
  uniform vec3  uColorB;
  uniform float uOpacity;

  varying float vSeed;
  varying float vFade;

  void main() {
    // Round, soft-edged point sprite.
    float d = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.08, d);
    if (alpha < 0.01) discard;

    vec3 color = mix(uColorA, uColorB, vSeed);
    gl_FragColor = vec4(color, clamp(alpha * vFade * uOpacity, 0.0, 1.0));
  }
`

function Particles({
  count,
  autoOrbit,
  palette,
}: {
  count: number
  autoOrbit: boolean
  palette: ScenePalette
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const groupRef = useRef<THREE.Group>(null)
  const viewport = useThree((state) => state.viewport)
  const pointerTarget = useRef(new THREE.Vector2(0, 0))

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const scales = new Float32Array(count)
    const seeds = new Float32Array(count)

    for (let i = 0; i < count; i += 1) {
      // A deep slab rather than a cube: most particles sit far back and dim,
      // so the field reads as depth instead of confetti.
      positions[i * 3] = (Math.random() - 0.5) * 38
      positions[i * 3 + 1] = (Math.random() - 0.5) * 26
      positions[i * 3 + 2] = (Math.random() - 0.5) * 26 - 8
      scales[i] = 0.25 + Math.random() * 0.95
      seeds[i] = Math.random()
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    return geo
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(999, 999) },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.75) },
      uRadius: { value: 3.4 },
      uColorA: { value: new THREE.Color(palette.neon) },
      uColorB: { value: new THREE.Color(palette.cyan) },
      uOpacity: { value: palette.opacityScale },
    }),
    // Colours are pushed in the effect below rather than rebuilt here: a new
    // uniforms object would force the material to recompile every toggle.
    [],
  )

  useEffect(() => {
    uniforms.uColorA.value.set(palette.neon)
    uniforms.uColorB.value.set(palette.cyan)
    uniforms.uOpacity.value = palette.opacityScale
  }, [uniforms, palette])

  useFrame((state, delta) => {
    const material = materialRef.current
    if (!material) return

    const time = state.clock.elapsedTime
    material.uniforms.uTime.value = time

    if (autoOrbit) {
      // Touch devices never emit a pointer, so the repulsion wake would never
      // fire and the field would read as a flat starfield. Sweep the attractor
      // on a slow lissajous instead so the parting is always visible.
      pointerTarget.current.set(
        Math.sin(time * 0.24) * viewport.width * 0.3,
        Math.cos(time * 0.17) * viewport.height * 0.26,
      )
    } else {
      // Pointer is normalised (-1..1); convert to the world units of the z=0 plane.
      pointerTarget.current.set(
        (state.pointer.x * viewport.width) / 2,
        (state.pointer.y * viewport.height) / 2,
      )
    }
    material.uniforms.uMouse.value.lerp(pointerTarget.current, Math.min(1, delta * 4))

    if (groupRef.current) {
      groupRef.current.rotation.z += delta * 0.012
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.06) * 0.12
    }
  })

  return (
    <group ref={groupRef}>
      <points geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          blending={palette.additive ? THREE.AdditiveBlending : THREE.NormalBlending}
        />
      </points>
    </group>
  )
}

export default function ParticleField() {
  const isMobile = useIsMobile()
  const finePointer = useHasFinePointer()
  const tier = useRenderTier()
  const palette = useScenePalette()
  // Phones get a reduced field and CPU rasterisers far less again: same look,
  // a fraction of the fill rate.
  const count = tier === 'low' ? 900 : isMobile ? 2600 : 6000

  return (
    <LazyCanvas camera={{ position: [0, 0, 14], fov: 62 }}>
      <Particles count={count} autoOrbit={!finePointer} palette={palette} />
      {/* Shares this canvas rather than stacking its own. The camera here sits
          at z=14/fov 62 against the shapes' authored z=6/fov 50, so they need
          scaling up to land at the same apparent size. */}
      <ShapesScene spread={2.6} layout="hero" palette={palette} />
    </LazyCanvas>
  )
}
