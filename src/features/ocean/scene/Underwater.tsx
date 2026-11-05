import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  AdditiveBlending,
  BackSide,
  Color,
  DoubleSide,
  Fog,
  Group,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  SRGBColorSpace,
  UniformsLib,
  UniformsUtils,
} from 'three'
import type { Scene, Vector3 } from 'three'
import { SURFACE_NAMES, WORLD } from '../config'
import { isUnderwater, underwaterFog } from '../lib/underwater'
import { CAUSTICS_GLSL } from './shaders/caustics'
import { FOG_FRAGMENT_PARS, FOG_VERTEX_PARS, FRAGMENT_OUTPUT } from './shaders/fogChunks'

interface Props {
  sun: Vector3
  godRays: boolean
  motion: number
  onChange: (underwater: boolean) => void
}

const surfaceVertex = /* glsl */ `
varying vec3 vWorld;
${FOG_VERTEX_PARS}
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vec4 mvPosition = viewMatrix * world;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`

/**
 * The surface from below: a bright disc straight overhead (Snell's window —
 * beyond ~49° the surface reflects the deep instead of showing the sky) with
 * the caustic net shimmering across it.
 */
const surfaceFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uDeep;
varying vec3 vWorld;
${FOG_FRAGMENT_PARS}
${CAUSTICS_GLSL}
void main() {
  float up = normalize(vWorld - cameraPosition).y;
  float window = smoothstep(0.6, 0.72, up);
  float shimmer = caustics(vWorld.xz * 0.35, uTime);
  vec3 colour = mix(uDeep * 1.5, vec3(0.42, 0.86, 0.84), window) + vec3(0.2, 0.35, 0.32) * shimmer;
  gl_FragColor = vec4(colour, 1.0);
  ${FRAGMENT_OUTPUT}
}`

const rayVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

const rayFragment = /* glsl */ `
uniform float uTime;
uniform float uSeed;
varying vec2 vUv;
void main() {
  float across = 1.0 - abs(vUv.x * 2.0 - 1.0);
  float flicker = 0.65 + 0.35 * sin(uTime * 0.8 + uSeed * 6.0 + vUv.y * 3.0);
  // Brightest at the surface, gone well before the floor.
  float alpha = pow(across, 2.0) * pow(vUv.y, 1.5) * flicker * 0.32;
  // Additive blending scales by alpha itself; the colour stays unpremultiplied.
  gl_FragColor = vec4(0.8, 1.0, 0.95, alpha);
}`

const RAY_COUNT = 9
const RAY_CELL = 7
const RAY_LENGTH = 16

/** Deterministic 0..1 noise per grid cell, so a shaft stays put while the camera moves. */
const cellHash = (x: number, z: number) => {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453
  return s - Math.floor(s)
}

/** The sky and the water's mirror pass are useless from below: hide them, which also skips their cost. */
function showSurface(scene: Scene, visible: boolean) {
  for (const name of Object.values(SURFACE_NAMES)) {
    const object = scene.getObjectByName(name)
    if (object) object.visible = visible
  }
}

/**
 * Everything that changes when the camera goes below the surface. Runs in
 * useFrame and only touches the scene on the frame the camera crosses, except
 * for the fog colour, which darkens with depth.
 */
export default function Underwater({ sun, godRays, motion, onChange }: Props) {
  const scene = useThree((state) => state.scene)
  const camera = useThree((state) => state.camera)
  const below = useRef(false)
  const time = useRef(0)
  const report = useRef(onChange)
  useEffect(() => {
    report.current = onChange
  }, [onChange])

  const surface = useMemo(() => {
    const material = new ShaderMaterial({
      uniforms: UniformsUtils.merge([UniformsLib.fog, { uTime: { value: 0 }, uDeep: { value: new Color() } }]),
      vertexShader: surfaceVertex,
      fragmentShader: surfaceFragment,
      side: BackSide,
      fog: true,
      // Already in display colours; the filmic curve would grey them out.
      toneMapped: false,
    })
    const mesh = new Mesh(new PlaneGeometry(WORLD.waterSize, WORLD.waterSize), material)
    mesh.rotation.x = -Math.PI / 2
    mesh.visible = false
    return mesh
  }, [])

  const rays = useMemo(() => {
    const group = new Group()
    group.visible = false
    const geometry = new PlaneGeometry(1.6, RAY_LENGTH)
    // Hang from the surface: the top edge at y = 0.
    geometry.translate(0, -RAY_LENGTH / 2, 0)
    const shafts = Array.from({ length: RAY_COUNT }, (_, i) => {
      const material = new ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uSeed: { value: i / RAY_COUNT } },
        vertexShader: rayVertex,
        fragmentShader: rayFragment,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        side: DoubleSide,
      })
      const shaft = new Mesh(geometry, material)
      group.add(shaft)
      return shaft
    })
    return { group, geometry, shafts }
  }, [])

  // Refraction bends the sun towards vertical: the shafts lean a little toward it.
  const lean = useMemo(() => ({ x: -sun.x * 0.25, z: -sun.z * 0.25 }), [sun])

  useEffect(() => {
    scene.add(surface)
    scene.add(rays.group)
    return () => {
      scene.remove(surface)
      scene.remove(rays.group)
      surface.geometry.dispose()
      surface.material.dispose()
      rays.geometry.dispose()
      for (const shaft of rays.shafts) shaft.material.dispose()
    }
  }, [scene, surface, rays])

  const saved = useMemo(() => ({ color: new Color(), near: 0, far: 0, background: scene.background }), [scene])

  useEffect(
    () => () => {
      // Leaving the page (or dropping to a level without diving) while under water.
      if (!below.current) return
      const fog = scene.fog
      if (fog instanceof Fog) {
        fog.color.copy(saved.color)
        fog.near = saved.near
        fog.far = saved.far
      }
      scene.background = saved.background
      showSurface(scene, true)
      report.current(false)
    },
    [scene, saved],
  )

  const background = useMemo(() => new Color(), [])

  useFrame((_, dt) => {
    time.current += Math.min(dt, 0.1) * motion
    const fog = scene.fog
    const now = isUnderwater(camera.position.y)

    if (now !== below.current) {
      below.current = now
      if (fog instanceof Fog) {
        if (now) {
          saved.color.copy(fog.color)
          saved.near = fog.near
          saved.far = fog.far
          saved.background = scene.background
        } else {
          fog.color.copy(saved.color)
          fog.near = saved.near
          fog.far = saved.far
        }
      }
      scene.background = now ? background : saved.background
      showSurface(scene, !now)
      surface.visible = now
      rays.group.visible = now && godRays
      report.current(now)
    }
    if (!now) return

    const params = underwaterFog(-camera.position.y)
    background.setRGB(params.color[0], params.color[1], params.color[2], SRGBColorSpace)
    if (fog instanceof Fog) {
      fog.color.copy(background)
      fog.near = params.near
      fog.far = params.far
    }
    surface.material.uniforms.uTime.value = time.current
    surface.material.uniforms.uDeep.value.copy(background)

    if (!rays.group.visible) return
    const cx = Math.floor(camera.position.x / RAY_CELL)
    const cz = Math.floor(camera.position.z / RAY_CELL)
    rays.shafts.forEach((ray, index) => {
      const gx = cx + (index % 3) - 1
      const gz = cz + Math.floor(index / 3) - 1
      const jitter = cellHash(gx, gz)
      ray.position.set((gx + jitter) * RAY_CELL, 0, (gz + cellHash(gz, gx)) * RAY_CELL)
      // Face the camera around the vertical axis, then lean towards the sun.
      const facing = Math.atan2(camera.position.x - ray.position.x, camera.position.z - ray.position.z)
      ray.rotation.set(lean.z, facing, lean.x, 'YXZ')
      ray.scale.set(0.6 + jitter * 1.2, 1, 1)
      ray.material.uniforms.uTime.value = time.current
    })
  })

  return null
}
