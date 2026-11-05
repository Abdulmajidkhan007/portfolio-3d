import { Suspense, useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping, PCFShadowMap } from 'three'
import { CAMERA, BOAT, WAVES, WORLD } from '../config'
import type { BoatInput } from '../lib/boatInput'
import { sunDirection } from '../lib/sun'
import type { CameraMode, QualitySettings } from '../types'
import Boat from './Boat'
import CameraRig from './CameraRig'
import FrameMonitor from './FrameMonitor'
import Island from './Island'
import OceanSky from './OceanSky'
import OceanWater from './OceanWater'
import Seabed from './Seabed'
import SunLight from './SunLight'
import Underwater from './Underwater'
import Wake from './Wake'
import { createTracker } from './tracker'

interface Props {
  settings: QualitySettings
  input: BoatInput
  cameraMode: CameraMode
  /** `?dive`: the free camera starts under water. */
  startBelow: boolean
  reducedMotion: boolean
  /** False while the tab is hidden: the render loop stops entirely. */
  running: boolean
  onReady: () => void
  onFps: (fps: number) => void
  onUnderwater: (underwater: boolean) => void
}

const FOG_COLOR = '#b9d2df'
const EXPOSURE = 0.55

/** Mounted inside Suspense after the content, so it fires once everything has loaded. */
function ReadySignal({ onReady }: { onReady: () => void }) {
  useEffect(() => onReady(), [onReady])
  return null
}

export default function OceanCanvas({
  settings,
  input,
  cameraMode,
  startBelow,
  reducedMotion,
  running,
  onReady,
  onFps,
  onUnderwater,
}: Props) {
  const { effects } = settings
  const sun = useMemo(sunDirection, [])
  const tracker = useMemo(createTracker, [])
  const waveScale = reducedMotion ? WAVES.reducedMotionScale : 1
  const motion = reducedMotion ? WAVES.reducedMotionScale : 1
  const startCamera: [number, number, number] = [
    BOAT.start.x - Math.sin(BOAT.start.heading) * CAMERA.followDistance,
    CAMERA.followHeight,
    BOAT.start.z - Math.cos(BOAT.start.heading) * CAMERA.followDistance,
  ]

  return (
    <Canvas
      className="!absolute inset-0 touch-none"
      frameloop={running ? 'always' : 'never'}
      dpr={settings.dpr}
      shadows={settings.shadows ? { type: PCFShadowMap } : false}
      camera={{ fov: 55, near: 0.1, far: WORLD.cameraFar, position: startCamera }}
      gl={{
        antialias: settings.antialias,
        powerPreference: 'high-performance',
      }}
      onCreated={({ gl }) => {
        // The Preetham sky is physically bright; this is the exposure its demo uses.
        gl.toneMapping = ACESFilmicToneMapping
        gl.toneMappingExposure = EXPOSURE
      }}
      aria-hidden
    >
      <fog attach="fog" args={[FOG_COLOR, WORLD.fogNear, WORLD.fogFar]} />
      <Suspense fallback={null}>
        <OceanSky sun={sun} animate={!reducedMotion} />
        <SunLight
          sun={sun}
          tracker={tracker}
          shadows={settings.shadows}
          shadowMapSize={settings.shadowMapSize}
        />
        <OceanWater
          sun={sun}
          reflectionSize={settings.reflectionSize}
          speed={reducedMotion ? 0.3 : 1}
          shallowWater={effects.shallowWater}
          shoreFoam={effects.shoreFoam}
        />
        <Island shadows={settings.shadows} caustics={effects.caustics} motion={motion} />
        {(effects.shallowWater || effects.underwater) && <Seabed caustics={effects.caustics} motion={motion} />}
        <Boat input={input} tracker={tracker} shadows={settings.shadows} waveScale={waveScale} />
        {effects.wake && settings.wakeSegments > 0 && <Wake tracker={tracker} segments={settings.wakeSegments} />}
        {effects.underwater && (
          <Underwater sun={sun} godRays={effects.godRays} motion={motion} onChange={onUnderwater} />
        )}
        <CameraRig
          mode={cameraMode}
          tracker={tracker}
          instant={reducedMotion}
          canDive={effects.underwater}
          startBelow={startBelow}
        />
        <ReadySignal onReady={onReady} />
      </Suspense>
      <FrameMonitor onSample={onFps} />
    </Canvas>
  )
}
