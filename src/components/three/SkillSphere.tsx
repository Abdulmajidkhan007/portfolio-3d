import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { Skill } from '@/types'
import { useIsMobile } from '@/hooks/useMediaQuery'
import LazyCanvas from './LazyCanvas'

const RADIUS = 3.3

/**
 * Draws a skill chip into a canvas and uses it as a sprite texture.
 * Sprites always face the camera, so labels stay readable at any rotation
 * without a text-in-3D library or any font download.
 */
function createLabelTexture(skill: Skill): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  const pad = 10
  const w = size - pad * 2
  const h = 150
  const y = (size - h) / 2

  ctx.beginPath()
  ctx.roundRect(pad, y, w, h, 36)
  ctx.fillStyle = 'rgba(10, 12, 16, 0.9)'
  ctx.fill()
  ctx.lineWidth = 4
  ctx.strokeStyle = skill.color
  ctx.globalAlpha = 0.9
  ctx.stroke()
  ctx.globalAlpha = 1

  ctx.fillStyle = skill.color
  ctx.font = 'bold 74px ui-sans-serif, system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(skill.short, size / 2, y + h / 2 - 16)

  ctx.fillStyle = 'rgba(232, 236, 244, 0.72)'
  ctx.font = '500 32px ui-monospace, monospace'
  ctx.fillText(`${skill.level}%`, size / 2, y + h / 2 + 42)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/** Evenly distributed points on a sphere (Fibonacci spiral). */
function spherePoints(count: number, radius: number): THREE.Vector3[] {
  const golden = Math.PI * (3 - Math.sqrt(5))
  return Array.from({ length: count }, (_, i) => {
    const y = 1 - (i / Math.max(1, count - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * i
    return new THREE.Vector3(Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius)
  })
}

interface SceneProps {
  skills: Skill[]
  selected: string | null
  onSelect: (name: string | null) => void
}

function Scene({ skills, selected, onSelect }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null)
  const spriteRefs = useRef<(THREE.Sprite | null)[]>([])
  const gl = useThree((state) => state.gl)

  const velocity = useRef({ x: 0, y: 0 })
  const dragging = useRef(false)

  const positions = useMemo(() => spherePoints(skills.length, RADIUS), [skills.length])

  const textures = useMemo(() => skills.map(createLabelTexture), [skills])
  useEffect(() => () => textures.forEach((texture) => texture.dispose()), [textures])

  const wireGeometry = useMemo(
    () => new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(RADIUS * 0.99, 1)),
    [],
  )

  // Drag-to-spin, wired straight to the canvas element so it also works when
  // the pointer is between sprites.
  useEffect(() => {
    const element = gl.domElement
    let lastX = 0
    let lastY = 0

    const onDown = (event: PointerEvent) => {
      dragging.current = true
      lastX = event.clientX
      lastY = event.clientY
      element.setPointerCapture(event.pointerId)
    }
    const onMove = (event: PointerEvent) => {
      if (!dragging.current) return
      velocity.current.x += (event.clientX - lastX) * 0.0006
      velocity.current.y += (event.clientY - lastY) * 0.0006
      lastX = event.clientX
      lastY = event.clientY
    }
    const onUp = (event: PointerEvent) => {
      dragging.current = false
      if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId)
    }

    element.addEventListener('pointerdown', onDown)
    element.addEventListener('pointermove', onMove)
    element.addEventListener('pointerup', onUp)
    element.addEventListener('pointercancel', onUp)
    return () => {
      element.removeEventListener('pointerdown', onDown)
      element.removeEventListener('pointermove', onMove)
      element.removeEventListener('pointerup', onUp)
      element.removeEventListener('pointercancel', onUp)
    }
  }, [gl])

  const worldPosition = useMemo(() => new THREE.Vector3(), [])
  const scaleTarget = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    const group = groupRef.current
    if (!group) return

    group.rotation.y += (0.16 + velocity.current.x * 60) * delta
    group.rotation.x = THREE.MathUtils.clamp(
      group.rotation.x + velocity.current.y * 60 * delta,
      -0.9,
      0.9,
    )
    // Friction, so a flick coasts to a stop.
    velocity.current.x *= 0.92
    velocity.current.y *= 0.92

    // Depth cue: chips on the far side of the sphere fade back.
    for (let i = 0; i < spriteRefs.current.length; i += 1) {
      const sprite = spriteRefs.current[i]
      if (!sprite) continue
      sprite.getWorldPosition(worldPosition)
      const depth = worldPosition.applyMatrix4(state.camera.matrixWorldInverse).z
      const nearness = THREE.MathUtils.clamp((depth + RADIUS) / (RADIUS * 2), 0, 1)
      const material = sprite.material as THREE.SpriteMaterial
      material.opacity = 0.3 + nearness * 0.7

      const isSelected = skills[i]?.name === selected
      const target = isSelected ? 2.1 : 1.25 + nearness * 0.35
      sprite.scale.lerp(scaleTarget.setScalar(target), 0.15)
    }
  })

  return (
    <>
      <group ref={groupRef}>
        <lineSegments geometry={wireGeometry}>
          <lineBasicMaterial color="#00d4ff" transparent opacity={0.09} />
        </lineSegments>

        {skills.map((skill, index) => (
          <sprite
            key={skill.name}
            ref={(node) => {
              spriteRefs.current[index] = node
            }}
            position={positions[index]}
            scale={1.4}
            onClick={(event) => {
              event.stopPropagation()
              onSelect(selected === skill.name ? null : skill.name)
            }}
          >
            <spriteMaterial
              map={textures[index]}
              transparent
              depthWrite={false}
              toneMapped={false}
            />
          </sprite>
        ))}
      </group>

      <mesh>
        <sphereGeometry args={[RADIUS * 0.55, 24, 24]} />
        <meshBasicMaterial color="#00ff88" transparent opacity={0.035} />
      </mesh>
    </>
  )
}

interface Props {
  skills: Skill[]
  selected: string | null
  onSelect: (name: string | null) => void
}

export default function SkillSphere({ skills, selected, onSelect }: Props) {
  const isMobile = useIsMobile()

  return (
    <LazyCanvas
      camera={{ position: [0, 0, isMobile ? 11 : 9.6], fov: 45 }}
      className="cursor-grab touch-pan-y active:cursor-grabbing"
    >
      <Scene skills={skills} selected={selected} onSelect={onSelect} />
    </LazyCanvas>
  )
}
