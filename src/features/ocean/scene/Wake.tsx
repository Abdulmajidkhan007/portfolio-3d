import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  DoubleSide,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  UniformsLib,
  UniformsUtils,
} from 'three'
import { WAKE } from '../config'
import { WakeEmitter } from '../lib/wake'
import { FOG_FRAGMENT_PARS, FOG_VERTEX_PARS, FRAGMENT_OUTPUT } from './shaders/fogChunks'
import type { BoatTracker } from './tracker'

interface Props {
  tracker: BoatTracker
  /** Ring-buffer size: how many slices can be alive at once. */
  segments: number
}

/** Above the flat water plane, below the hull. */
const WAKE_Y = 0.04

const vertexShader = /* glsl */ `
attribute vec4 aSlice;    // x, z, heading, born
attribute float aStrength;
uniform float uTime;
uniform float uLifetime;
uniform float uBaseWidth;
uniform float uSpread;
uniform float uLength;
varying vec2 vLocal;
varying float vLife;
varying float vStrength;
varying vec2 vWorld;
${FOG_VERTEX_PARS}
void main() {
  float age = max(uTime - aSlice.w, 0.0);
  vLife = clamp(age / uLifetime, 0.0, 1.0);
  vStrength = aStrength;
  // Each slice widens as it ages: laid one after another, they draw the V.
  float halfWidth = uBaseWidth + age * uSpread * aStrength;
  vec2 forward = vec2(sin(aSlice.z), cos(aSlice.z));
  vec2 side = vec2(-forward.y, forward.x);
  vec2 xz = aSlice.xy + side * position.x * 2.0 * halfWidth + forward * position.y * uLength;
  vLocal = vec2(position.x * 2.0, position.y);
  vWorld = xz;
  vec4 mvPosition = viewMatrix * vec4(xz.x, ${WAKE_Y.toFixed(2)}, xz.y, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`

const fragmentShader = /* glsl */ `
uniform float uTime;
varying vec2 vLocal;
varying float vLife;
varying float vStrength;
varying vec2 vWorld;
${FOG_FRAGMENT_PARS}
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + 1.0), f.x), f.y);
}
void main() {
  if (vLife >= 1.0) discard;
  float across = abs(vLocal.x);
  // Two bright arms on the outside, churned water in the middle that settles first.
  float arms = smoothstep(0.4, 0.82, across) * (1.0 - smoothstep(0.88, 1.0, across));
  float wash = (1.0 - smoothstep(0.0, 0.5, across)) * (1.0 - smoothstep(0.0, 0.45, vLife));
  float speckle = noise(vWorld * 2.3 + uTime * 0.4) * 0.6 + noise(vWorld * 6.1) * 0.4;
  float fade = pow(1.0 - vLife, 1.6);
  // Soft ends along the slice so neighbours blend instead of stacking hard edges.
  float ends = 1.0 - smoothstep(0.3, 0.5, abs(vLocal.y));
  float alpha = (arms + wash * 0.7) * smoothstep(0.12, 0.6, speckle) * fade * ends * (0.35 + 0.65 * vStrength);
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(vec3(0.94, 0.97, 1.0), min(alpha, 1.0));
  ${FRAGMENT_OUTPUT}
}`

/**
 * The boat's wake: one instanced draw call. Each instance is a slice of foam
 * laid across the stern's path; the vertex shader widens it with age, so the
 * GPU animates the whole trail and the CPU writes one instance per slice.
 */
export default function Wake({ tracker, segments }: Props) {
  const { mesh, slices, strengths, material } = useMemo(() => {
    const quad = new PlaneGeometry(1, 1)
    const geometry = new InstancedBufferGeometry()
    geometry.index = quad.index
    geometry.setAttribute('position', quad.getAttribute('position'))
    geometry.instanceCount = segments

    // Born far in the past: every slot starts dead.
    const sliceData = new Float32Array(segments * 4)
    for (let i = 0; i < segments; i += 1) sliceData[i * 4 + 3] = -1e4
    const sliceAttr = new InstancedBufferAttribute(sliceData, 4).setUsage(DynamicDrawUsage)
    const strengthAttr = new InstancedBufferAttribute(new Float32Array(segments), 1).setUsage(DynamicDrawUsage)
    geometry.setAttribute('aSlice', sliceAttr)
    geometry.setAttribute('aStrength', strengthAttr)

    const shader = new ShaderMaterial({
      uniforms: UniformsUtils.merge([
        UniformsLib.fog,
        {
          uTime: { value: 0 },
          uLifetime: { value: WAKE.lifetime },
          uBaseWidth: { value: WAKE.baseWidth },
          uSpread: { value: WAKE.spread },
          uLength: { value: WAKE.spacing * 1.6 },
        },
      ]),
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      // The slices are placed in the shader; their winding is not worth tracking.
      side: DoubleSide,
      fog: true,
    })
    // Some drivers mis-draw when an instanced attribute lands on location 0.
    shader.index0AttributeName = 'position'
    const trail = new Mesh(geometry, shader)
    // Instances are spread along the whole trail; the base quad's bounds mean nothing.
    trail.frustumCulled = false
    trail.renderOrder = 2
    return { mesh: trail, slices: sliceAttr, strengths: strengthAttr, material: shader }
  }, [segments])

  const emitter = useMemo(() => new WakeEmitter(), [])
  const state = useMemo(() => ({ time: 0, next: 0 }), [])

  useEffect(
    () => () => {
      mesh.geometry.dispose()
      material.dispose()
    },
    [mesh, material],
  )

  useFrame((_, dt) => {
    state.time += Math.min(dt, 0.1)
    material.uniforms.uTime.value = state.time
    const slice = emitter.update(tracker.state, state.time)
    if (!slice) return
    const i = state.next
    slices.setXYZW(i, slice.x, slice.z, slice.heading, slice.born)
    strengths.setX(i, slice.strength)
    slices.clearUpdateRanges()
    slices.addUpdateRange(i * 4, 4)
    strengths.clearUpdateRanges()
    strengths.addUpdateRange(i, 1)
    slices.needsUpdate = true
    strengths.needsUpdate = true
    state.next = (i + 1) % segments
  })

  return <primitive object={mesh} />
}
